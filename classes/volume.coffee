'use strict'

class TopViewer.Volume
  constructor: (@options) ->
    height = @options.model.basePositionsTexture.image.height

    setVertexIndexCoordinates = (attribute, i, index) ->
      attribute.setX i, index % 4096 / 4096
      attribute.setY i, Math.floor(index / 4096) / height

    #When adding lines, make sure smaller index is always first, so that a,b records the same way as b,a
    #this means we can sort the array later and find all unique elements. This should be much more effieicnt
    #than a connectivity matrix
    addLine = (a, b,target, index) ->
      [a, b] = [b, a] if a > b
      target[index  ] = a;
      target[index+1] = b;


    debugger
    # Create the wireframe mesh (each element is composed of 6 edges), and each edge needs two entries
    wireframeIndexArray = new Uint16Array @options.elements.length/4*6*2

    for i in [0...@options.elements.length/4-1]
      addLine @options.elements[i*4+0], @options.elements[i*4+1],wireframeIndexArray,12*i+0
      addLine @options.elements[i*4+1], @options.elements[i*4+2],wireframeIndexArray,12*i+2
      addLine @options.elements[i*4+2], @options.elements[i*4+0],wireframeIndexArray,12*i+4
      addLine @options.elements[i*4+0], @options.elements[i*4+3],wireframeIndexArray,12*i+6
      addLine @options.elements[i*4+1], @options.elements[i*4+3],wireframeIndexArray,12*i+8
      addLine @options.elements[i*4+2], @options.elements[i*4+3],wireframeIndexArray,12*i+10

    #All potential edges have now been added. However, most edges appear twice (i.e. an edge usually
    #belongs to 2 elements. To avoid doing double the necessary work, find the unique edges. Typically this is done
    #with sort, filter. Because, js doesn't do 2D typed arrays, it needs to be tricked by casting the 16bit uints
    #to 32bit uints
    filter2Dunique = (element,index,array) ->
      #Don't filter the first element
      if index == 0
        return true
      #For all others check that they are different from predecessor
      else
        return  element isnt array[index-1]

    wireframeIndexArray32 = new Uint32Array wireframeIndexArray.buffer #Note that this will use the same data as the 16 bit view
    wireframeIndexArray32.sort #Sort in-place as a 2D element
    wireframeIndexArray = null #Forget the original index view
    filteredWireframeIndexArray = wireframeIndexArray32.filter filter2Dunique
    wireframeIndexArray32 = null #release the momory of the 32 bit view
    wireframeIndexArray = new Uint16Array filteredWireframeIndexArray.buffer #Finally, the matrix of unique edges
    filteredwireframeIndexArray = null #release the momory of the 32bit view

    debugger
    #Create a buffer geometry
    wireframeGeometry = new THREE.BufferGeometry()
    #Line segments will use GL_LINES to connect 2 consecutive indexes in gl_Position (shader code)
    @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial

    wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2
    lineVertexIndex = 0
    for i in [0...wireframeIndexArray.length-1]
      setVertexIndexCoordinates wireframeIndexAttribute, lineVertexIndex, wireframeIndexAttribute[i]
      setVertexIndexCoordinates wireframeIndexAttribute, lineVertexIndex + 1, wireframeIndexAttribute[i+1]
      lineVertexIndex += 2

    wireframeGeometry.addAttribute 'vertexIndex', wireframeIndexAttribute
    wireframeGeometry.drawRange.count = wireframeIndexAttribute.length

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

    wireframeIndexArray = new Float32Array linesCount * 4
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
      isosurfacesIndexArray = new Float32Array tetraCount * 12
      isosurfacesIndexAttribute = new THREE.BufferAttribute isosurfacesIndexArray, 2

      # Add each tetra vertex (first, second, third or fourth, depending on i) to all 6 isovertices.
      for j in [0...tetraCount]
        for k in [0...6]
          setVertexIndexCoordinates(isosurfacesIndexAttribute, j*6+k, @options.elements[j * 4 + i])

      isosurfacesGeometry.addAttribute "vertexIndexCorner#{i+1}", isosurfacesIndexAttribute

    # We also need to tell the vertices what their index is and if they are part of the main or additional face.
    isosurfacesCornerIndexArray = new Float32Array tetraCount * 6
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
