'use strict'

class TopViewer.Volume
  constructor: (@options) ->
    height = @options.model.basePositionsTexture.image.height
    width  = @options.model.basePositionsTexture.image.width
    debugger
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
    debugger
    masterIndexArray = new Float32Array linesCount * 2
    lineVertexIndex = 0
    for a of connectivity
      continue unless connectivity[a]
      for i in [0...connectivity[a].length]
        masterIndexArray[lineVertexIndex] = parseInt(a)
        masterIndexArray[lineVertexIndex+1] = connectivity[a][i]
        lineVertexIndex += 2
    #Store the master indexes into an attribute buffer
    masterIndexAttribute = new THREE.BufferAttribute masterIndexArray, 1
    wireframeGeometry.addAttribute "masterIndex", masterIndexAttribute
    @wireframeMesh.material.uniforms.bufferTextureHeight.value = height
    @wireframeMesh.material.uniforms.bufferTextureWidth.value = width
    debugger

    wireframeGeometry.setDrawRange(0, lineVertexIndex)
    # Create the isosurfaces mesh.
    isosurfacesGeometry = new THREE.BufferGeometry()
    @isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, @options.model.isosurfaceMaterial
    @isosurfacesMesh.receiveShadows = true

    #Create a texture for the tetrahedra (each tetrahedron is 4 vertexes, so 1 RGBA texture value)
    debugger
    tetraHeight=1
    tetraWidth =  @options.model.maxTextureWidth
    while @options.elements.length / 4 > tetraWidth  * tetraHeight
      tetraHeight *= 2
    if tetraHeight>tetraWidth then throw 'Too many elements to render. Failed in volume.coffee'
    #Need to create a copy of the elements because webgl may not be able to deal with uvec2 (need floats)
    floatElements = new Float32Array tetraWidth*tetraHeight*4
    for i in [0...@options.elements.length]
      floatElements[i] = @options.elements[i]

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
    log "Reached isosurfaces"

    #Update values in the shader and add the new texture
    #Record the tetrahedron height and vertexbuffer height
    @isosurfacesMesh.material.uniforms.tetraTextureHeight.value = tetraHeight
    @isosurfacesMesh.material.uniforms.tetraTextureWidth.value = tetraWidth
    @isosurfacesMesh.material.uniforms.bufferTextureHeight.value = height
    @isosurfacesMesh.material.uniforms.bufferTextureWidth.value = width
    @isosurfacesMesh.material.uniforms.lightingBidirectional.value = 1
    #Bind the texture to the shader.
    @options.model.tetraTexture = new THREE.DataTexture floatElements, tetraWidth,\
      tetraHeight, THREE.RGBAFormat, THREE.FloatType
    @isosurfacesMesh.material.uniforms.tetraTexture.value = @options.model.tetraTexture
    @isosurfacesMesh.material.uniforms.tetraTexture.value.needsUpdate = true

    #Set the draw range to two triangles per each tetra (6 vertexes time tetra count)
    isosurfacesGeometry.setDrawRange(0,  tetraCount*6)

    debugger

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
    @isosurfacesMesh.visible = @renderingControls.showIsosurfacesControl.value()
