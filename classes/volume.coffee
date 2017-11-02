'use strict'

class TopViewer.Volume
  constructor: (@options) ->
    height = @options.model.basePositionsTexture.image.height
    width  = @options.model.basePositionsTexture.image.width
    debugger
    #Create the 3D wireframe
    connectivity = []
    linesCount = 0

    setVertexIndexCoordinates = (attribute, i, index, width, height) ->
      attribute.setX i, index % width / width
      attribute.setY i, Math.floor(index / width) / height

    addLine = (a, b) ->
      [a, b] = [b, a] if a > b

      connectivity[a] ?= []
      unless connectivity[a].indexOf(b) != -1
        connectivity[a].push b
        linesCount++

    for i in [0...@options.elements.length/4]
      addLine(@options.elements[i*4], @options.elements[i*4+1])
      addLine(@options.elements[i*4+1], @options.elements[i*4+2])
      addLine(@options.elements[i*4+2], @options.elements[i*4])
      addLine(@options.elements[i*4], @options.elements[i*4+3])
      addLine(@options.elements[i*4+1], @options.elements[i*4+3])
      addLine(@options.elements[i*4+2], @options.elements[i*4+3])
    @wireframeMeshes = []
    wireframeGeometry = new THREE.BufferGeometry()
    #Line segments will use GL_LINES to connect 2 consecutive indexes in gl_Position (shader code)
    wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial
    @wireframeMeshes.push wireframeMesh
    debugger
    #The master index will directly hold the textureAccess coordinates for the buffer texture (so 2 components per point, 
    #at 2 points per line = 4 per line)
    vertexIndexArray = new Float32Array linesCount * 4
    #Store the vertexindexes into an attribute buffer
    vertexIndexAttribute = new THREE.BufferAttribute vertexIndexArray, 2
    lineVertexIndex = 0
    for a of connectivity
      continue unless connectivity[a]
      for i in [0...connectivity[a].length]
        setVertexIndexCoordinates(vertexIndexAttribute, lineVertexIndex, parseInt(a), width, height)
        setVertexIndexCoordinates(vertexIndexAttribute, lineVertexIndex + 1, connectivity[a][i], width, height)
        lineVertexIndex += 2
    #Update geometry and material uniforms
    wireframeGeometry.addAttribute "vertexIndex", vertexIndexAttribute
    wireframeMesh.material.uniforms.bufferTextureHeight.value = height
    wireframeMesh.material.uniforms.bufferTextureWidth.value = width
    debugger
    log "Lines", lineVertexIndex*0.5

    wireframeGeometry.setDrawRange(0, lineVertexIndex)

    #There may be more isosurface meshes for a single set of tetrahedra if the number of tetrahedra exceeds 20mio
    # Create a new isosurface material for the current element group. This is necessary as there are multiple
    # groups of elements with different tetraTextures
    # Also webgl1.0 does not support  integer attributes and we are using integers too large to
    #represent with float32 (over 60 million), we need to compute the values needed to access the
    #tetraTexture (these are float indexes) <- this bug happens for real

    @isosurfaceMeshes = []

    tetraCount = @options.elements.length / 4


    #Also, we cannot have attributes of more than 1GB, so the indexes need to be split about every 20mio tetrahadera
    splitAt = 20000000
    tetraSplits = Math.ceil(tetraCount/splitAt)
    for ks in [0...tetraSplits]
      # Define a variable which states how many tetrahedra we are processing
      if ks == tetraSplits-1 then localTetraCount = tetraCount-ks*splitAt else localTetraCount=splitAt
      log "Tets", localTetraCount
      # Create  a new isosurfaces material and add it to database
      isosurfaceMaterial = new TopViewer.IsosurfaceMaterial @
      @options.model.isosurfaceMaterials.push isosurfaceMaterial

      # Create  a new isosurfaces mesh and add it to database
      isosurfacesGeometry = new THREE.BufferGeometry()
      isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, isosurfaceMaterial
      isosurfacesMesh.receiveShadows = true
      @isosurfaceMeshes.push isosurfacesMesh

      #Create a 2 textures for the tetrahedra (each tetrahedron is 4 vertexes, so 1 RGBA texture value for x coordinate in
      # the basePositions texture and 1 RGBA value for the y coordinate in the basePositions texture)
      debugger
      tetraHeight= 1
      tetraWidth =  @options.model.maxTextureWidth
      while localTetraCount  > tetraWidth  * tetraHeight
        tetraHeight *= 2
      #The first texture will contain x-coordinates
      tetraTextureArray_X = new Float32Array tetraWidth*tetraHeight*4
      tetraTextureArray_X[i] = (@options.elements[i+ks*splitAt*4]%width)/width for i in [0...localTetraCount*4]
      #The second texture will contain y-coordinates
      tetraTextureArray_Y = new Float32Array tetraWidth*tetraHeight*4
      tetraTextureArray_Y[i] = Math.floor(@options.elements[i+ks*splitAt*4]/width)/height for i in [0...localTetraCount*4]

      #Setup the attributes
      #The master index records which thread this is out of a global 6*tetraCount threads
      #6 sequential threads collaborate on the isosurface for the same triangle. But since
      #webgl1.0 does not support  integer attributes and we are using integers too large to
      #represent with float32 (over 60 million), we need to compute the values needed to access the
      #tetraTexture (these are float indexes) <- this bug happens for real
      tetraAccessArray = new Float32Array localTetraCount * 12
      tetraAccessAttribute = new THREE.BufferAttribute tetraAccessArray, 2
      #We also need to know which in triangle (and which vertex of that triangle) a particular thread belongs to
      #within a given tetra element. This property is called the corner index
      cornerIndexArray = new Float32Array localTetraCount * 6
      cornerIndexAttribute = new THREE.BufferAttribute cornerIndexArray, 1
      for i in [0...tetraAccessArray.length/2]
        index =  Math.floor(i/6.0)
        setVertexIndexCoordinates(tetraAccessAttribute, i, index, tetraWidth, tetraHeight)
        cornerIndexArray[i] = (i%6.0)*0.1

      #Store the tetraAccess and corner indexes into an attribute buffer
      isosurfacesGeometry.addAttribute "tetraAccess", tetraAccessAttribute
      isosurfacesGeometry.addAttribute "cornerIndex", cornerIndexAttribute

      #Update values in the shader and add the new texture
      #Record the tetrahedron height and vertexbuffer height
      isosurfacesMesh.material.uniforms.tetraTextureHeight.value = tetraHeight
      isosurfacesMesh.material.uniforms.tetraTextureWidth.value = tetraWidth
      isosurfacesMesh.material.uniforms.bufferTextureHeight.value = height
      isosurfacesMesh.material.uniforms.bufferTextureWidth.value = width
      #Bind the texture to the shader.
      isosurfacesMesh.material.uniforms.tetraTextureX.value =  new THREE.DataTexture tetraTextureArray_X, tetraWidth,\
        tetraHeight, THREE.RGBAFormat, THREE.FloatType,  THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter
      isosurfacesMesh.material.uniforms.tetraTextureY.value =  new THREE.DataTexture tetraTextureArray_Y, tetraWidth,\
        tetraHeight, THREE.RGBAFormat, THREE.FloatType,  THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter
      isosurfacesMesh.material.uniforms.tetraTextureX.value.needsUpdate = true
      isosurfacesMesh.material.uniforms.tetraTextureY.value.needsUpdate = true

      #Need to also set the basePoistionTexture again (bug fix)
      isosurfacesMesh.material.uniforms.basePositionsTexture.value = @options.model.basePositionsTexture
      #isosurfacesMesh.material.uniforms.basePositionsTexture.value.needsUpdate = true

      #Set the draw range to two triangles per each tetra (6 vertexes time tetra count)
      isosurfacesGeometry.setDrawRange(0,  localTetraCount*6)

    debugger

    # Finish creating geometry.
    @_updateGeometry()

    # Add the meshes to the model. Add wireframe last for better draw order when both are transparent.
    @options.model.add @isosurfaceMeshes[i] for i in [0...@isosurfaceMeshes.length]
    @options.model.add @wireframeMeshes[i]  for i in [0...@wireframeMeshes.length]

    # Add the mesh to rendering controls.
    @options.engine.renderingControls.addVolume @options.name, @

  _updateGeometry: ->
    for i in [0...@wireframeMeshes.length]
      @_updateBounds @wireframeMeshes[i], @options.model
    for i in [0...@isosurfaceMeshes.length]
      @_updateBounds @isosurfaceMeshes[i], @options.model

  _updateBounds: (mesh, model) ->
    mesh.geometry.boundingBox = model.boundingBox
    mesh.geometry.boundingSphere = model.boundingSphere

  showFrame: () ->
    # We can only draw the mesh when it's been added and we have the rendering controls.
    unless @renderingControls
      @wireframeMeshes[i].visible = false for i in [0...@wireframeMeshes.length]
      @isosurfaceMeshes[i].visible = false for i in [0...@isosurfaceMeshes.length]
      return

    @wireframeMeshes[i].visible = @renderingControls.showWireframeControl.value()  for i in [0...@wireframeMeshes.length]
    @isosurfaceMeshes[i].visible = @renderingControls.showIsosurfacesControl.value() for i in [0...@isosurfaceMeshes.length]

