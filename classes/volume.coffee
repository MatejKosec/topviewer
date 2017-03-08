'use strict'

class TopViewer.Volume
  constructor: (@options) ->
    height = @options.model.basePositionsTexture.image.height

    setVertexIndexCoordinates = (attribute, i, index) ->
      attribute.setX i, index % 4096 / 4096
      attribute.setY i, Math.floor(index / 4096) / height

    #Create the 3D wireframe 
    connectivity = []
    linesCount = 0

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

    wireframeGeometry = new THREE.BufferGeometry()
    #Line segments will use GL_LINES to connect 2 consecutive indexes in gl_Position (shader code)
    @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial

    wireframeIndexArray = new Float32Array linesCount * 4
    wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2

    lineVertexIndex = 0
    for a of connectivity
      continue unless connectivity[a]
      for i in [0...connectivity[a].length]
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, parseInt(a))
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, connectivity[a][i])
        lineVertexIndex += 2

    wireframeGeometry.addAttribute 'vertexIndex', wireframeIndexAttribute
    wireframeGeometry.setDrawRange(0, linesCount * 2)

    # Create the isosurfaces mesh.
    isosurfacesGeometry = new THREE.BufferGeometry()
    @isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, @options.model.isosurfaceMaterial
    @isosurfacesMesh.receiveShadows = true

    #Create a texture for the tetraheadra (each tetrahedron is 4 vertexes, so 1 RGBA texture value)
    tetraHeight=1
    while @options.elements.length / 4 > 4096 * tetraHeight
      tetraHeight *= 2
    @options.model.tetraTexture = new THREE.DataTexture @options.elements, 4096,\
      tetraHeight, THREE.RGBAFormat, THREE.UnsignedIntType, THREE.UVMapping, THREE.ClampToEdgeWrapping,\
      THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter
    @options.model.tetraTexture.needsUpdate = true
    debugger

    #Record the tetrahedron height and vertexbuffer height
    @options.model.isosurfaceMaterial.uniforms.tetraTextureHeight.value = tetraHeight
    @options.model.isosurfaceMaterial.uniforms.bufferTextureHeight.value = height

    #Then create a masterIndex such that there are 6 threads launched per each tetrahedron.
    tetraCount = @options.elements.length / 4
      #The master index records which thread this is out of a global 6*tetraCount threads
      #6 sequential threads collaborate on the isosurface for the same triangle
    masterIndexArray = new Float32Array tetraCount * 6
    for i in [0...masterIndexArray.length]
      masterIndexArray[i] = i
    #Store the master indexes into an attribute buffer
    masterIndexAttribute = new THREE.BufferAttribute masterIndexArray, 1
    isosurfacesGeometry.addAttribute "masterIndex", masterIndexAttribute

    isosurfacesGeometry.setDrawRange(0,  tetraCount*6)

    # Finish creating geometry.
    @_updateGeometry()

    # Add the meshes to the model. Add wireframe last for better draw order when both are transparent.
    @options.model.add @isosurfacesMesh
    @options.model.add @wireframeMesh

    # Add the mesh to rendering controls.
    @options.engine.renderingControls.addVolume @options.name, @

  _updateGeometry: ->
    @_updateBounds @wireframeMesh, @options.model
    @_updateBounds @isosurfacesMesh, @options.model

  _updateBounds: (mesh, model) ->
    mesh.geometry.boundingBox = @options.model.boundingBox
    mesh.geometry.boundingSphere = @options.model.boundingSphere

  showFrame: () ->
    # We can only draw the mesh when it's been added and we have the rendering controls.
    unless @renderingControls
      @wireframeMesh.visible = false
      @isosurfacesMesh.visible = false
      return

    @wireframeMesh.visible = @renderingControls.showWireframeControl.value()
    @isosurfacesMesh.visible = true #@renderingControls.showIsosurfacesControl.value()
