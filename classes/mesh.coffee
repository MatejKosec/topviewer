'use strict'

class TopViewer.Mesh extends THREE.Mesh
#__________________________________________________________________________________________________________________
  constructor: (@options) ->
    super new THREE.BufferGeometry(), @options.model.material

    # Create the surface mesh. We send in all three triangle indices so we can calculate the normal in the shader.
    indexArrays = []
    indexAttributes = []
    for i in [0..2]
      indexArrays[i] = new Float32Array @options.elements.length * 2
      indexAttributes[i] = new THREE.BufferAttribute indexArrays[i], 2

    # We also need to tell the vertices what their index is and if they are part of the main or additional face.
    cornerIndexArray = new Float32Array @options.elements.length
    cornerIndexAttribute = new THREE.BufferAttribute cornerIndexArray, 1

    height = @options.model.basePositionsTexture.image.height

    setVertexIndexCoordinates = (attribute, i, index) ->
      attribute.setX i, index % 4096 / 4096
      attribute.setY i, Math.floor(index / 4096) / height

    for i in [0...@options.elements.length]
      cornerInTriangle = i % 3
      cornerIndexArray[i] = cornerInTriangle * 0.1

      # Create normal indices.
      baseIndex = Math.floor(i/3) * 3

      # Set the 3 indices of the triangle (that this vertex is part of).
      for j in [0..2]
        setVertexIndexCoordinates(indexAttributes[j], i, @options.elements[baseIndex+j])

    @geometry.addAttribute 'vertexIndexCorner1', indexAttributes[0]
    @geometry.addAttribute 'vertexIndexCorner2', indexAttributes[1]
    @geometry.addAttribute 'vertexIndexCorner3', indexAttributes[2]
    @geometry.addAttribute 'cornerIndex', cornerIndexAttribute

    @geometry.drawRange.count = @options.elements.length

    @backsideMesh = new THREE.Mesh @geometry, @options.model.backsideMaterial

    # Set the custom material for shadows.
    @customDepthMaterial = @options.model.shadowMaterial
    @backsideMesh.customDepthMaterial = @options.model.shadowMaterial

    # Finish creating geometry.
    @_updateGeometry()

    # Add the meshes to the model.
    @options.model.add @
    @options.model.add @backsideMesh

    # Add the mesh to rendering controls.
    @options.engine.renderingControls.addMesh @options.name, @

#__________________________________________________________________________________________________________________
  addWireframe: (@options) ->

    # Create the wireframe mesh.
    connectivity = []
    linesCount = 0

    addLine = (a, b) ->
      [a, b] = [b, a] if a > b

      connectivity[a] ?= {}

      unless connectivity[a][b]
        connectivity[a][b] = true
        linesCount++

    for i in [0...@options.elements.length/3]
      addLine(@options.elements[i*3], @options.elements[i*3+1])
      addLine(@options.elements[i*3+1], @options.elements[i*3+2])
      addLine(@options.elements[i*3+2], @options.elements[i*3])
    debugger

    wireframeGeometry = new THREE.BufferGeometry()
    @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.wireframeMaterial
    
    wireframeIndexArray = new Float32Array linesCount * 4
    wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2
    

    lineVertexIndex = 0
    for a in [0...connectivity.length]
      continue unless connectivity[a]

      for b of connectivity[a]
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, a)
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, b)
        lineVertexIndex += 2
    
    wireframeGeometry.addAtt  ribute 'vertexIndex', wireframeIndexAttribute
    wireframeGeometry.drawRange.count = linesCount * 2

    @options.model.add @wireframeMesh
    _updateGeometry()
#__________________________________________________________________________________________________________________
  addIsolines: (@options) ->
    # Create the isolines mesh.
    isolinesGeometry = new THREE.BufferGeometry()
    @isolinesMesh = new THREE.LineSegments isolinesGeometry, @options.model.isolineMaterial
    faceCount = @options.elements.length / 3
    
    # Each isoline vertex needs access to all three face vertices.
    for i in [0..2]
      # The format of the array is, for each face and face corner i: v[i]_x, v[i]_y, v[i]_x, v[i]_y
      # It is duplicated because we have two isoline vertices in
      # succession and both of them need access to the same data.
      isolinesIndexArray = new Float32Array faceCount * 4
      isolinesIndexAttribute = new THREE.BufferAttribute isolinesIndexArray, 2

      # Add each face vertex (first, second or third, depending on i) to the start and end isovertex.
      for j in [0...faceCount]
        for k in [0...2]
          setVertexIndexCoordinates(isolinesIndexAttribute, j*2+k, @options.elements[j * 3 + i])

      isolinesGeometry.addAttribute "vertexIndexCorner#{i+1}", isolinesIndexAttribute
    
    # We also need to tell the vertices if they are the start or the end of the isoline.
    isolinesTypeArray = new Float32Array faceCount * 2
    isolinesTypeAttribute = new THREE.BufferAttribute isolinesTypeArray, 1

    for i in [0...faceCount]
      isolinesTypeArray[i * 2 + 1] = 1.0

    isolinesGeometry.addAttribute "cornerIndex", isolinesTypeAttribute

    isolinesGeometry.drawRange.count = faceCount * 2

    @options.model.add @isolinesMesh
    _updateGeometry()
#__________________________________________________________________________________________________________________
  _updateGeometry: ->
    @_updateBounds @, @options.model
    @_updateBounds @backsideMesh, @options.model
    if @wireframeMesh? then @_updateBounds @wireframeMesh, @options.model
    if @isolinesMesh? then @_updateBounds @isolinesMesh, @options.model

#__________________________________________________________________________________________________________________
  _updateBounds: (mesh, model) ->
    mesh.geometry.boundingBox = @options.model.boundingBox
    mesh.geometry.boundingSphere = @options.model.boundingSphere
#__________________________________________________________________________________________________________________
  showFrame: () ->
    # We can only draw the mesh when it's been added and we have the rendering controls.
    unless @renderingControls
      @visible = false
      @backsideMesh.visible = false
      @wireframeMesh.visible = false
      @isolinesMesh.visible = false
      return

    # Do we need to draw the main mesh?
    if @renderingControls.showSurfaceControl.value()
      @visible = true

      # Determine the type of mesh surface rendering.
      switch @options.engine.renderingControls.meshesSurfaceSidesControl.value
        when TopViewer.RenderingControls.MeshSurfaceSides.DoubleQuality
          @backsideMesh.visible = true

        else
          @backsideMesh.visible = false

    else
      @visible = false
      @backsideMesh.visible = false
    #If the user sets the wireframe to visible, then add it to the render
    wireFrameVisible = @renderingControls.showWireframeControl.value()
    if wireFrameVisible
      @addWireframe @options
      @wireframeMesh.visible = wireFrameVisible
    #If the user sets the isolines to visible, then add them to the render
    isollinesMeshVisible = @renderingControls.showIsolinesControl.value()
    if isollinesMeshVisible
      @addIsolines @options
      @isolinesMesh.visible = isollinesMeshVisible

    enableShadows = @options.engine.renderingControls.shadowsControl.value()
    
    @castShadow = enableShadows
    @receiveShadows = enableShadows
    
    @backsideMesh.castShadow = enableShadows
    @backsideMesh.receiveShadows = enableShadows

