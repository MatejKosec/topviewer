'use strict'

class TopViewer.Volume
  constructor: (@options) ->
    height = @options.model.basePositionsTexture.image.height

    setVertexIndexCoordinates = (attribute, i, index) ->
      attribute.setX i, index % 4096 / 4096
      attribute.setY i, Math.floor(index / 4096) / height

    # Create the wireframe mesh (each element is composed of 6 edges), and each edge needs two entries
    wireframeIndexArray = new Uint32Array @options.elements.length/4*6*2
    #In order to have 32 and 64 bit datatypes (rason explained below), the integer indexes are read as floats
    #To check whether the edge is present 2 consecutive 32bit integrers (or floats should be check (i.e. 1 64 bit integer)
    #Because, js doesn't do 2D typed arrays, it needs to be tricked by casting the 32bit uints into 32bit uints
    wireframeIndexArray64 = new Float64Array wireframeIndexArray.buffer #this will use the same data as the 32 bit array
    twiceNoEdges = 0
    checkEdgeUnique32 = new Uint32Array 2
    checkEdgeUnique64 = new Float64Array checkEdgeUnique32.buffer

    #When adding lines, make sure smaller index is always first, so that a,b records the same way as b,a
    #so that edges can be recorded uniquely
    debugger
    addLine = (a, b,target32,target64) ->
      checkEdgeUnique32[0] = Math.min(a,b)
      checkEdgeUnique32[1] = Math.max(a,b)
      edge_is_unique = true;
      i = 0
      while i < twiceNoEdges/2 #The default javascript include functions are far too slow
        if target64[i] == checkEdgeUnique64[0]
          edge_is_unique = false;
          i = twiceNoEdges; #stop loop
        i++

      if edge_is_unique
        target32[twiceNoEdges  ] = a; #add first  edge index
        target32[twiceNoEdges+1] = b; #add second edge index
        twiceNoEdges+=2 #increase the edge count accordingly

    for i in [0...Math.max(@options.elements.length/4-1,0)]
      addLine @options.elements[i*4+0], @options.elements[i*4+1],wireframeIndexArray,wireframeIndexArray64
      addLine @options.elements[i*4+1], @options.elements[i*4+2],wireframeIndexArray,wireframeIndexArray64
      addLine @options.elements[i*4+2], @options.elements[i*4+0],wireframeIndexArray,wireframeIndexArray64
      addLine @options.elements[i*4+0], @options.elements[i*4+3],wireframeIndexArray,wireframeIndexArray64
      addLine @options.elements[i*4+1], @options.elements[i*4+3],wireframeIndexArray,wireframeIndexArray64
      addLine @options.elements[i*4+2], @options.elements[i*4+3],wireframeIndexArray,wireframeIndexArray64


    debugger
    #Some of the array will not have been filled (almost half) so strip it down
    newwireframeIndexArray = new Uint32Array twiceNoEdges
    for i in [0...Math.max(twiceNoEdges-1,0)]
      newwireframeIndexArray[i] = wireframeIndexArray[i]
    wireframeIndexArray = null #Delete the old array
    wireframeIndexArray = newwireframeIndexArray #And use the new one instead


    #Create a buffer geometry
    wireframeGeometry = new THREE.BufferGeometry()
    #Line segments will use GL_LINES to connect 2 consecutive indexes in gl_Position (shader code)
    @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial

    wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2

    for i in [0...Math.max(wireframeIndexArray.length-1,0)]
      setVertexIndexCoordinates wireframeIndexAttribute, i, wireframeIndexAttribute[i]

    wireframeGeometry.addAttribute 'vertexIndex', wireframeIndexAttribute
    wireframeGeometry.drawRange.count = wireframeIndexAttribute.count #length is deprecated, use count

    ###
    connectivity = []
    linesCount = 0

    addLine = (a, b) ->
      [a, b] = [b, a] if a > b

      connectivity[a] ?= {}
      unless connectivity[a][b]
        connectivity[a][b] = true
        linesCount++

    for i in [0...@options.elements.length/4]
      addLine(@options.elements[i*4], @options.elements[i*4+1])
      addLine(@options.elements[i*4+1], @options.elements[i*4+2])
      addLine(@options.elements[i*4+2], @options.elements[i*4])
      addLine(@options.elements[i*4], @options.elements[i*4+3])
      addLine(@options.elements[i*4+1], @options.elements[i*4+3])
      addLine(@options.elements[i*4+2], @options.elements[i*4+3])
    debugger
    wireframeGeometry = new THREE.BufferGeometry()
    @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial

    wireframeIndexArray = new Uint32Array linesCount * 4
    wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2

    lineVertexIndex = 0
    for a in [0...connectivity.length]
      continue unless connectivity[a]

      for b of connectivity[a]
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, a)
        setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, b)
        lineVertexIndex += 2

    wireframeGeometry.addAttribute 'vertexIndex', wireframeIndexAttribute
    wireframeGeometry.drawRange.count = linesCount * 2

    wireframeGeometry = new THREE.BoxGeometry  1, 1, 1
    @wireframeMesh = new THREE.Mesh wireframeGeometry, new THREE.MeshBasicMaterial  { color: 0x00ff00 }
    ###

    ###
    # Create the isosurfaces mesh.
    isosurfacesGeometry = new THREE.BufferGeometry()
    @isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, @options.model.isosurfaceMaterial
    @isosurfacesMesh.receiveShadows = true

    tetraCount = @options.elements.length / 4

    # Each isosurface vertex needs access to all four tetra vertices.
    for i in [0..3]
      # The format of the array is, for each tetra: 6 * v[i]_x, v[i]_y
      isosurfacesIndexArray = new Uint32Array tetraCount * 12
      isosurfacesIndexAttribute = new THREE.BufferAttribute isosurfacesIndexArray, 2

      # Add each tetra vertex (first, second, third or fourth, depending on i) to all 6 isovertices.
      for j in [0...tetraCount]
        for k in [0...6]
          setVertexIndexCoordinates(isosurfacesIndexAttribute, j*6+k, @options.elements[j * 4 + i])

      isosurfacesGeometry.addAttribute "vertexIndexCorner#{i+1}", isosurfacesIndexAttribute

    # We also need to tell the vertices what their index is and if they are part of the main or additional face.
    isosurfacesCornerIndexArray = new Uint32Array tetraCount * 6
    isosurfacesCornerIndexAttribute = new THREE.BufferAttribute isosurfacesCornerIndexArray, 1

    for i in [0...tetraCount]
      for k in [0...6]
        isosurfacesCornerIndexArray[i * 6 + k] = k * 0.1

    isosurfacesGeometry.addAttribute "cornerIndex", isosurfacesCornerIndexAttribute

    isosurfacesGeometry.drawRange.count = tetraCount * 6
    ###

    isosurfacesGeometry= new THREE.BoxGeometry  1, 1, 1
    @isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, new THREE.MeshBasicMaterial  { color: 0x00ff00 }

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
