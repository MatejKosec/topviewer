// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var TopWorker;

  importScripts('../libraries/three.min.js');

  self.onmessage = function(message) {
    var loadStart, loader, url;
    url = message.data.url;
    loader = new THREE.XHRLoader;
    loader.setResponseType('text');
    loadStart = new Date();
    return loader.load(url, (function(_this) {
      return function(data) {
        var loadEnd, loadTime, objects, processEnd, processStart, processTime, worker;
        loadEnd = new Date();
        loadTime = loadEnd - loadStart;
        processStart = new Date();
        worker = new TopWorker();
        objects = worker.parse(data, url);
        processEnd = new Date();
        processTime = processEnd - processStart;
        postMessage({
          type: 'result',
          objects: objects
        });
        return close();
      };
    })(this));
  };

  TopWorker = (function() {
    function TopWorker() {}

    TopWorker.prototype.parse = function(data, url) {
      var base, buffer, currentElements, currentElementsName, currentFrame, currentFrameNodeIndex, currentFrameNodesCount, currentFrameTime, currentMode, currentNodes, currentNodesName, currentScalar, currentScalarName, currentScalarNodesName, currentVector, currentVectorName, currentVectorNodesName, elementIndex, elementSize, elementType, elements, elementsInstance, elementsList, elementsName, elementsType, i, j, k, l, len, length, line, lines, m, modes, n, newElement, nodes, nodesInstance, nodesName, nodesPerElement, parts, ref, ref1, ref2, ref3, scalars, value, vectors, vertex, vertexIndex;
      lines = data.match(/[^\r\n]+/g);
      this._totalLines = lines.length;
      this._percentageChangeAt = Math.floor(this._totalLines / 100);
      this._completedLines = 0;
      nodes = {};
      currentNodesName = null;
      currentNodes = null;
      elements = {};
      currentElementsName = null;
      currentElements = null;
      vectors = {};
      currentVectorNodesName = null;
      currentVectorName = null;
      currentVector = null;
      scalars = {};
      currentScalarNodesName = null;
      currentScalarName = null;
      currentScalar = null;
      currentFrame = null;
      currentFrameTime = null;
      currentFrameNodesCount = null;
      currentFrameNodeIndex = null;
      modes = {
        Nodes: 'Nodes',
        Elements: 'Elements',
        VectorCount: 'VectorCount',
        VectorTime: 'VectorTime',
        Vector: 'Vector',
        ScalarCount: 'ScalarCount',
        ScalarTime: 'ScalarTime',
        Scalar: 'Scalar'
      };
      currentMode = null;
      for (k = 0, len = lines.length; k < len; k++) {
        line = lines[k];
        parts = line.match(/\S+/g);
        switch (parts[0]) {
          case 'Nodes':
            currentMode = modes.Nodes;
            currentNodesName = parts[1];
            currentNodes = {
              nodes: []
            };
            nodes[currentNodesName] = currentNodes;
            continue;
          case 'Elements':
            currentMode = modes.Elements;
            currentElementsName = parts[1];
            currentElements = {
              elements: {},
              nodesName: parts[3]
            };
            elements[currentElementsName] = currentElements;
            continue;
          case 'Vector':
            currentMode = modes.VectorCount;
            currentVectorNodesName = parts[5];
            currentVectorName = parts[1];
            currentVector = {
              vectorName: parts[1],
              nodesName: parts[5],
              frames: []
            };
            if (vectors[currentVectorNodesName] == null) {
              vectors[currentVectorNodesName] = {};
            }
            vectors[currentVectorNodesName][currentVectorName] = currentVector;
            continue;
          case 'Scalar':
            currentMode = modes.ScalarCount;
            currentScalarNodesName = parts[5];
            currentScalarName = parts[1];
            currentScalar = {
              scalarName: parts[1],
              nodesName: parts[5],
              frames: []
            };
            if (scalars[currentScalarNodesName] == null) {
              scalars[currentScalarNodesName] = {};
            }
            scalars[currentScalarNodesName][currentScalarName] = currentScalar;
            continue;
        }
        switch (currentMode) {
          case modes.Nodes:
            vertexIndex = parseInt(parts[0]);
            vertex = {
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2]),
              z: parseFloat(parts[3])
            };
            currentNodes.nodes[vertexIndex] = vertex;
            break;
          case modes.Elements:
            elementIndex = parseInt(parts[0]);
            elementType = parseInt(parts[1]);
            if ((base = currentElements.elements)[elementType] == null) {
              base[elementType] = [];
            }
            switch (elementType) {
              case 4:
                newElement = [parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4])];
                break;
              case 5:
                newElement = [parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5])];
                break;
              default:
                console.error("UNKNOWN ELEMENT TYPE", elementType);
            }
            currentElements.elements[elementType].push(newElement);
            break;
          case modes.VectorCount:
            currentFrameNodesCount = parseInt(parts[0]);
            currentMode = modes.VectorTime;
            break;
          case modes.VectorTime:
            currentFrameTime = parseFloat(parts[0]);
            currentMode = modes.Vector;
            currentFrame = {
              time: currentFrameTime,
              vectors: new Float32Array(currentFrameNodesCount * 3)
            };
            currentVector.frames.push(currentFrame);
            currentFrameNodeIndex = 0;
            break;
          case modes.Vector:
            currentFrame.vectors[currentFrameNodeIndex * 3] = parseFloat(parts[0]);
            currentFrame.vectors[currentFrameNodeIndex * 3 + 1] = parseFloat(parts[1]);
            currentFrame.vectors[currentFrameNodeIndex * 3 + 2] = parseFloat(parts[2]);
            currentFrameNodeIndex++;
            if (currentFrameNodeIndex === currentFrameNodesCount) {
              currentMode = modes.VectorTime;
            }
            break;
          case modes.ScalarCount:
            currentFrameNodesCount = parseInt(parts[0]);
            currentMode = modes.ScalarTime;
            break;
          case modes.ScalarTime:
            currentFrameTime = parseFloat(parts[0]);
            currentMode = modes.Scalar;
            currentFrame = {
              time: currentFrameTime,
              scalars: new Float32Array(currentFrameNodesCount),
              minValue: null,
              maxValue: null
            };
            currentScalar.frames.push(currentFrame);
            currentFrameNodeIndex = 0;
            break;
          case modes.Scalar:
            value = parseFloat(parts[0]);
            if (!((currentFrame.minValue != null) && currentFrame.minValue < value)) {
              currentFrame.minValue = value;
            }
            if (!((currentFrame.maxValue != null) && currentFrame.maxValue > value)) {
              currentFrame.maxValue = value;
            }
            currentFrame.scalars[currentFrameNodeIndex] = value;
            currentFrameNodeIndex++;
            if (currentFrameNodeIndex === currentFrameNodesCount) {
              currentMode = modes.ScalarTime;
            }
        }
        this.reportProgress();
      }
      for (nodesName in nodes) {
        nodesInstance = nodes[nodesName];
        length = Math.max(0, nodesInstance.nodes.length - 1);
        buffer = new Float32Array(length * 3);
        for (i = l = 0, ref = length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
          buffer[i * 3] = nodesInstance.nodes[i + 1].x;
          buffer[i * 3 + 1] = nodesInstance.nodes[i + 1].y;
          buffer[i * 3 + 2] = nodesInstance.nodes[i + 1].z;
        }
        nodesInstance.nodes = buffer;
      }
      nodesPerElement = {
        "4": 3,
        "5": 4
      };
      for (elementsName in elements) {
        elementsInstance = elements[elementsName];
        ref1 = elementsInstance.elements;
        for (elementsType in ref1) {
          elementsList = ref1[elementsType];
          elementSize = nodesPerElement[elementsType];
          buffer = new Uint32Array(elementsList.length * elementSize);
          for (i = m = 0, ref2 = elementsList.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
            for (j = n = 0, ref3 = elementSize; 0 <= ref3 ? n < ref3 : n > ref3; j = 0 <= ref3 ? ++n : --n) {
              buffer[i * elementSize + j] = elementsList[i][j] - 1;
            }
          }
          elementsInstance.elements[elementsType] = buffer;
        }
      }
      return {
        nodes: nodes,
        elements: elements,
        vectors: vectors,
        scalars: scalars
      };
    };

    TopWorker.prototype.reportProgress = function() {
      this._completedLines++;
      if (this._completedLines % this._percentageChangeAt === 0) {
        return postMessage({
          type: 'progress',
          loadPercentage: 100.0 * this._completedLines / this._totalLines
        });
      }
    };

    return TopWorker;

  })();

}).call(this);

//# sourceMappingURL=toploader-worker.js.map
