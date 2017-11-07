'use strict'

importScripts '../libraries/three.min.js'
importScripts '../libraries/underscore-min.js'

self.onmessage = (message) ->
  url = message.data.url

  # This function loads the top/xpost file from the provided url. Because this can be huge files, we load them
  # incrementally, parsing the text as we go and reporting frames back to the main thread as soon as they are complete.
  # To do this we request chunks of file data from the server and send each line of text to the parser.
  parser = new TopParser url

  # We load 100 MB chunks at a time.
  rangeLength = 200 * 1024 * 1024

  requestRangeStart = 0
  requestRangeEnd = rangeLength - 1

  # Determine the total file size by creating a dummy (1 byte) synchronous request to the server.
  request = new XMLHttpRequest
  request.open 'GET', url, false
  request.setRequestHeader 'Range', "bytes=0-0"
  request.send null
  rangeHeader = request.getResponseHeader 'Content-Range'
  rangeHeaderParts = rangeHeader.match /bytes (\d+)-(\d+)\/(\d+)/
  totalLength = parseInt rangeHeaderParts[3]

  postMessage
    type: 'size'
    size: totalLength

  #console.log "Loading #{totalLength} bytes."

  loadChunk = =>

    # Clamp range end to total length so we don't read beyond the end of the file.
    requestRangeEnd = Math.min requestRangeEnd, totalLength - 1
    #console.log "Loading chunk: #{requestRangeStart}-#{requestRangeEnd}."

    # Open a new request synchronously, since we're already in a worker and don't need async functionality.
    request = new XMLHttpRequest
    request.open 'GET', url

    # Request one chunk of binary data.
    request.setRequestHeader 'Range', "bytes=#{requestRangeStart}-#{requestRangeEnd}"
    request.responseType = 'blob'
    request.onload = (event) =>
      # Parse the response header.
      rangeHeader = request.getResponseHeader 'Content-Range'
      rangeHeaderParts = rangeHeader.match /bytes (\d+)-(\d+)\/(\d+)/
      rangeStart = parseInt rangeHeaderParts[1]
      rangeEnd = parseInt rangeHeaderParts[2]
      totalLength = parseInt rangeHeaderParts[3]

      # Make sure that the returned range matches what we requested.
      console.error "Returned range start does not match our request." unless requestRangeStart is rangeStart
      console.error "Returned range end does not match our request." unless requestRangeEnd is rangeEnd

      # Read response data as text and send it to the parser.
      reader = new FileReader
      reader.onload = (event) =>
        parser.parse reader.result, rangeStart / totalLength, (rangeEnd - rangeStart) / totalLength

        # Complete parsing when we've parsed the last chunk.
        if rangeEnd is totalLength - 1
          parser.end()

      reader.readAsText request.response

      # See if we have reached the end of the file.
      if rangeEnd < totalLength - 1
        # Increment the range to the next chunk.
        requestRangeStart += rangeLength
        requestRangeEnd += rangeLength

        # Start loading the next chunk.
        loadChunk()

      else
        # console.log "Loading finished."

    # Initiate the request to load the chunk range.
    request.send()

  # Start loading chunks.
  loadChunk()

class TopParser
  @modes:
    Nodes: 'Nodes'
    Elements: 'Elements'
    VectorCount: 'VectorCount'
    VectorTime: 'VectorTime'
    Vector: 'Vector'
    ScalarCount: 'ScalarCount'
    ScalarTime: 'ScalarTime'
    Scalar: 'Scalar'

  constructor: (@url) ->
    @lastLine = null

    @currentMode = null

    @currentNodesName = null
    @currentNodes = null

    @currentElementsName = null
    @currentElements = null

    @currentVectorNodesName = null
    @currentVectorName = null
    @currentVector = null

    @currentScalarNodesName = null
    @currentScalarName = null
    @currentScalar = null

    @currentFrame = null
    @currentFrameTime = null
    @currentFrameNodesCount = null
    @currentFrameNodeIndex = null

    @reportedProgressPercentage = 0

    @throttledEndScalar = _.throttle =>
      @endScalar()
    , 3000, leading: false

    @throttledEndVector = _.throttle =>
      @endVector()
    , 3000, leading: false

  parse: (data, progressPercentageStart, progressPercentageLength) ->
    # First see if the new data starts with a new line. This would mean that previous last line should be considered
    # complete and should be processed straight away (instead of adding it to the first line of this parse).
    if data[0] is '\n'
      @parseLine @lastLine
      @lastLine = null

    lines = data.match /[^\r\n]+/g

    # The last line in the new parse is complete if the data ended with a new line.
    lastLineIsComplete = false
    if data[data.length-1] is '\n'
      lastLineIsComplete = true


    # Only parse all but the last line (it's probably incomplete).
    parseLineCount = if lastLineIsComplete then lines.length else lines.length - 1

    # Add the incomplete last line from previous parse to the first line of this parse to generate a complete line.
    lines[0] = "#{@lastLine}#{lines[0]}" if @lastLine

    # Parse all the lines.
    if parseLineCount > 0
      for lineIndex in [0...parseLineCount]
        @parseLine lines[lineIndex]

        @reportProgress progressPercentageStart + progressPercentageLength * lineIndex / (parseLineCount - 1)

    # Store the last line for the future.
    @lastLine = if lastLineIsComplete then null else lines[lines.length-1]

  parseLine: (line) ->
    # Split by whitespace.
    parts = line.match /\S+/g

    # Detect modes.
    switch parts[0]
      when 'Nodes'
        @endCurrentMode()
        @currentMode = @constructor.modes.Nodes

        # Parse nodes header.
        @currentNodesName = parts[1]
        #Temporarily create an array for 1000 3D nodes, to be replaced once outgrown
        @currentNodes = {}
        @currentNodes.nodes = new Float32Array 1000 * 3


        return

      when 'Elements'
        @endCurrentMode()        
        @currentMode = @constructor.modes.Elements

        # Parse elements header.
        @currentElementsName = parts[1]
        @currentTriIndex = 0
        @currentTetIndex = 0
        @currentElements =
          elements:
            4: new Uint32Array 1000 * 3 #Temporarily allocate space for 1000 elements
            5: new Uint32Array 1000 * 4 #Temporarily allocate space for 1000 elements
          nodesName: parts[3]

        return

      when 'Vector'
        @endCurrentMode()
        @currentMode = @constructor.modes.VectorCount

        # Parse vector header.
        @currentVectorNodesName = parts[5]
        @currentVectorName = parts[1]
        @currentVector =
          vectorName: parts[1]
          nodesName: parts[5]
          frames: []

        return

      when 'Scalar'
        @endCurrentMode()
        @currentMode = @constructor.modes.ScalarCount

        # Parse scalars header.
        @currentScalarNodesName = parts[5]
        @currentScalarName = parts[1]
        @currentScalar =
          scalarName: parts[1]
          nodesName: parts[5]
          frames: []

        return

    # No mode switch was detected, continue business as usual.
    switch @currentMode
      when @constructor.modes.Nodes
        #Must index from 1
        if parseInt parts[0] == 0 then alert "All indexes should start from 1 not 0."
        #Make sure current index will fit into buffer
        @currentNodeIndex = parseInt parts[0]
        #Allocate more space if not
        if @currentNodeIndex*3 > @currentNodes.nodes.length
          #Double the size of the array (this is potentially a pretty bad idea for large files)
          buffer = new Float32Array @currentNodes.nodes.length*2
          #Copy old stuff over
          for i in [0...@currentNodes.nodes.length]
              buffer[i] = @currentNodes.nodes[i]
          #Swap the arrays
          @currentNodes.nodes = null; #Get rid of the old reference
          @currentNodes.nodes = buffer #Set it to the new reference

        @currentNodes.nodes[(@currentNodeIndex-1)*3+0] = parseFloat parts[1]
        @currentNodes.nodes[(@currentNodeIndex-1)*3+1] = parseFloat parts[2]
        @currentNodes.nodes[(@currentNodeIndex-1)*3+2] = parseFloat parts[3]

      when @constructor.modes.Elements
        # Parse element.
        @currentElementIndex = parseInt parts[0]
        @elementType = parseInt parts[1]

        # Note: Vertex indices (1-4) based on TOP/DOMDEC User's Manual.
        switch @elementType
          when 4
            #Check if the new element can fit into the buffer
            @currentTriIndex++
            if @currentTriIndex*3 > @currentElements.elements[@elementType].length
              #Double the size of the array (this is potentially a pretty bad idea for large files)
              buffer = new Uint32Array @currentElements.elements[@elementType].length*2
              #Copy old stuff over
              for i in [0...@currentElements.elements[@elementType].length]
                buffer[i] = @currentElements.elements[@elementType][i]
              #Swap the arrays
              @currentElements.elements[@elementType] = null; #Get rid of the old reference
              @currentElements.elements[@elementType] = buffer #Set it to the new reference

            # Add the new element Triangle (Tri_3)
            @currentElements.elements[@elementType][(@currentTriIndex-1)*3+0] = -1 + parseInt parts[2]
            @currentElements.elements[@elementType][(@currentTriIndex-1)*3+1] = -1 + parseInt parts[3]
            @currentElements.elements[@elementType][(@currentTriIndex-1)*3+2] = -1 + parseInt parts[4]

          when 5
            #Check if the new element can fit into the buffer
            @currentTetIndex++
            if @currentTetIndex*4 > @currentElements.elements[@elementType].length
              #Double the size of the array (this is potentially a pretty bad idea for large files)
              buffer = new Uint32Array @currentElements.elements[@elementType].length*2
              #Copy old stuff over
              for i in [0...@currentElements.elements[@elementType].length]
                buffer[i] = @currentElements.elements[@elementType][i]
              #Swap the arrays
              @currentElements.elements[@elementType] = null; #Get rid of the old reference
              @currentElements.elements[@elementType] = buffer #Set it to the new reference

            #Add the new Tetrahedron (Tetra_4)
            @currentElements.elements[@elementType][(@currentTetIndex-1)*4+0] = -1 + parseInt parts[2]
            @currentElements.elements[@elementType][(@currentTetIndex-1)*4+1] = -1 + parseInt parts[3]
            @currentElements.elements[@elementType][(@currentTetIndex-1)*4+2] = -1 + parseInt parts[4]
            @currentElements.elements[@elementType][(@currentTetIndex-1)*4+3] = -1 + parseInt parts[5]
          else
            console.error "UNKNOWN ELEMENT TYPE", @elementType, parts, line, @lastLine



      when @constructor.modes.VectorCount
        # Read number of nodes.
        @currentFrameNodesCount = parseInt parts[0]
        @currentMode = @constructor.modes.VectorTime

      when @constructor.modes.VectorTime
        # Read frame time.
        @currentFrameTime = parseFloat parts[0]
        @currentMode = @constructor.modes.Vector

        @currentFrame =
          time: @currentFrameTime
          vectors: new Float32Array @currentFrameNodesCount * 3

        @currentFrameNodeIndex = 0

      when @constructor.modes.Vector        
        @currentFrame.vectors[@currentFrameNodeIndex * 3] = parseFloat parts[0]
        @currentFrame.vectors[@currentFrameNodeIndex * 3 + 1] = parseFloat parts[1]
        @currentFrame.vectors[@currentFrameNodeIndex * 3 + 2] = parseFloat parts[2]
        @currentFrameNodeIndex++

        if @currentFrameNodeIndex is @currentFrameNodesCount
          # Add completed vector frame to frames.
          @currentVector.frames.push @currentFrame

          @endVectorFrame()
          @currentMode = @constructor.modes.VectorTime

      when @constructor.modes.ScalarCount
        # Read number of nodes.
        @currentFrameNodesCount = parseInt parts[0]
        @currentMode = @constructor.modes.ScalarTime

      when @constructor.modes.ScalarTime
        # Read frame time.
        @currentFrameTime = parseFloat parts[0]
        @currentMode = @constructor.modes.Scalar

        @currentFrame =
          time: @currentFrameTime
          scalars: new Float32Array @currentFrameNodesCount
          minValue: null
          maxValue: null

        @currentFrameNodeIndex = 0

      when @constructor.modes.Scalar
        value = parseFloat parts[0]
        @currentFrame.minValue = value unless @currentFrame.minValue? and @currentFrame.minValue < value
        @currentFrame.maxValue = value unless @currentFrame.maxValue? and @currentFrame.maxValue > value

        @currentFrame.scalars[@currentFrameNodeIndex] = value
        @currentFrameNodeIndex++

        if @currentFrameNodeIndex is @currentFrameNodesCount
          # Add completed scalar frame to frames.
          @currentScalar.frames.push @currentFrame

          @endScalarFrame()
          @currentMode = @constructor.modes.ScalarTime

  endCurrentMode: ->
    switch @currentMode
      when @constructor.modes.Nodes
        @endNodes()

      when @constructor.modes.Elements
        @endElements()

      when @constructor.modes.Vector
        @endVector()

      when @constructor.modes.Scalar
        @endScalar()

  endNodes: ->
    # Save the node array (buffering handled elsewhere)
    #There array size does not fit the data exactly (can be up to a factor 2 too large),
    #slim it down to exact size
    if @currentNodeIndex*3 != @currentNodes.nodes.length
      #Get actual required size of array
      buffer = new Float32Array @currentNodeIndex*3
      #Copy old stuff over
      for i in [0...(@currentNodeIndex*3)]
        buffer[i] = @currentNodes.nodes[i]
      #Swap the arrays
      @currentNodes.nodes = null; #Get rid of the old reference
      @currentNodes.nodes = buffer #Set it to the new reference
    #Save the results
    nodesResult = {}
    nodesResult[@currentNodesName] = @currentNodes

    postMessage
      type: 'result'
      objects:
        nodes: nodesResult

  endElements: ->
    #Make sure the array exactly fits the elements
    #For tirangles
    if @elementType == 4
      if @currentTriIndex*3 != @currentElements.elements[4].length
        buffer = new Uint32Array @currentTriIndex * 3
        for i in [0...@currentTriIndex*3]
          buffer[i] = @currentElements.elements[4][i]
        @currentElements.elements[4] = null; #Get rid of the old reference
        @currentElements.elements[4] = buffer
    #For tetrahedra
    else if @elementType == 5
      if @currentTetIndex*4 != @currentElements.elements[5].length
        buffer = new Uint32Array @currentTetIndex * 4
        for i in [0...@currentTetIndex*4]
          buffer[i] = @currentElements.elements[5][i]
        @currentElements.elements[5] = null; #Get rid of the old reference
        @currentElements.elements[5] = buffer
    
    #Save the results
    elementsResult = {}
    elementsResult[@currentElementsName] = @currentElements

    postMessage
      type: 'result'
      objects:
        elements: elementsResult

  endScalar: ->
    return unless @currentScalar.frames.length

    scalarsResult = {}
    scalarsResult[@currentScalarNodesName] = {}
    scalarsResult[@currentScalarNodesName][@currentScalarName] = @currentScalar

    postMessage
      type: 'result'
      objects:
        scalars: scalarsResult

    @currentScalar.frames = []

  endVector: ->
    return unless @currentVector.frames.length

    vectorsResult = {}
    vectorsResult[@currentVectorNodesName] = {}
    vectorsResult[@currentVectorNodesName][@currentVectorName] = @currentVector

    postMessage
      type: 'result'
      objects:
        vectors: vectorsResult

    @currentVector.frames = []

  endScalarFrame: ->
    @throttledEndScalar()

  endVectorFrame: ->
    @throttledEndVector()

  end: ->
    @endCurrentMode()

    postMessage
      type: 'complete'

  reportProgress: (percentage) ->
    newPercentage = Math.floor(percentage * 100)

    if newPercentage > @reportedProgressPercentage
      @reportedProgressPercentage = newPercentage

      postMessage
        type: 'progress'
        loadPercentage: newPercentage
