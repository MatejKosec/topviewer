// Generated by CoffeeScript 1.9.3
(function() {
  'use strict';
  var TopParser;

  importScripts('../libraries/three.min.js');

  importScripts('../libraries/underscore-min.js');

  self.onmessage = function(message) {
    var loadChunk, parser, rangeHeader, rangeHeaderParts, rangeLength, request, requestRangeEnd, requestRangeStart, totalLength, url;
    url = message.data.url;
    parser = new TopParser(url);
    rangeLength = 101 * 1024 * 1024;
    requestRangeStart = 0;
    requestRangeEnd = rangeLength - 1;
    request = new XMLHttpRequest;
    request.open('GET', url, false);
    request.setRequestHeader('Range', "bytes=0-0");
    request.send(null);
    rangeHeader = request.getResponseHeader('Content-Range');
    rangeHeaderParts = rangeHeader.match(/bytes (\d+)-(\d+)\/(\d+)/);
    totalLength = parseInt(rangeHeaderParts[3]);
    postMessage({
      type: 'size',
      size: totalLength
    });
    loadChunk = (function(_this) {
      return function() {
        requestRangeEnd = Math.min(requestRangeEnd, totalLength - 1);
        request = new XMLHttpRequest;
        request.open('GET', url);
        request.setRequestHeader('Range', "bytes=" + requestRangeStart + "-" + requestRangeEnd);
        request.responseType = 'blob';
        request.onload = function(event) {
          var rangeEnd, rangeStart, reader;
          rangeHeader = request.getResponseHeader('Content-Range');
          rangeHeaderParts = rangeHeader.match(/bytes (\d+)-(\d+)\/(\d+)/);
          rangeStart = parseInt(rangeHeaderParts[1]);
          rangeEnd = parseInt(rangeHeaderParts[2]);
          totalLength = parseInt(rangeHeaderParts[3]);
          if (requestRangeStart !== rangeStart) {
            console.error("Returned range start does not match our request.");
          }
          if (requestRangeEnd !== rangeEnd) {
            console.error("Returned range end does not match our request.");
          }
          reader = new FileReader;
          reader.onload = function(event) {
            parser.parse(reader.result, rangeStart / totalLength, (rangeEnd - rangeStart) / totalLength);
            if (rangeEnd === totalLength - 1) {
              return parser.end();
            }
          };
          reader.readAsText(request.response);
          if (rangeEnd < totalLength - 1) {
            requestRangeStart += rangeLength;
            requestRangeEnd += rangeLength;
            return loadChunk();
          } else {

          }
        };
        return request.send();
      };
    })(this);
    return loadChunk();
  };

  TopParser = (function() {
    TopParser.modes = {
      Nodes: 'Nodes',
      Elements: 'Elements',
      VectorCount: 'VectorCount',
      VectorTime: 'VectorTime',
      Vector: 'Vector',
      ScalarCount: 'ScalarCount',
      ScalarTime: 'ScalarTime',
      Scalar: 'Scalar'
    };

    function TopParser(url1) {
      this.url = url1;
      this.lastLine = null;
      this.currentMode = null;
      this.currentNodesName = null;
      this.currentNodes = null;
      this.currentElementsName = null;
      this.currentElements = null;
      this.currentVectorNodesName = null;
      this.currentVectorName = null;
      this.currentVector = null;
      this.currentScalarNodesName = null;
      this.currentScalarName = null;
      this.currentScalar = null;
      this.currentFrame = null;
      this.currentFrameTime = null;
      this.currentFrameNodesCount = null;
      this.currentFrameNodeIndex = null;
      this.reportedProgressPercentage = 0;
      this.throttledEndScalar = _.throttle((function(_this) {
        return function() {
          return _this.endScalar();
        };
      })(this), 3000, {
        leading: false
      });
      this.throttledEndVector = _.throttle((function(_this) {
        return function() {
          return _this.endVector();
        };
      })(this), 3000, {
        leading: false
      });
    }

    TopParser.prototype.parse = function(data, progressPercentageStart, progressPercentageLength) {
      var j, lastLineIsComplete, lineIndex, lines, parseLineCount, ref;
      if (data[0] === '\n') {
        this.parseLine(this.lastLine);
        this.lastLine = null;
      }
      lines = data.match(/[^\r\n]+/g);
      lastLineIsComplete = false;
      if (data[data.length - 1] === '\n') {
        lastLineIsComplete = true;
      }
      parseLineCount = lastLineIsComplete ? lines.length : lines.length - 1;
      if (this.lastLine) {
        lines[0] = "" + this.lastLine + lines[0];
      }
      if (parseLineCount > 0) {
        for (lineIndex = j = 0, ref = parseLineCount; 0 <= ref ? j < ref : j > ref; lineIndex = 0 <= ref ? ++j : --j) {
          this.parseLine(lines[lineIndex]);
          this.reportProgress(progressPercentageStart + progressPercentageLength * lineIndex / (parseLineCount - 1));
        }
      }
      return this.lastLine = lastLineIsComplete ? null : lines[lines.length - 1];
    };

    TopParser.prototype.parseLine = function(line) {
      var buffer, i, j, k, l, parts, ref, ref1, ref2, value;
      parts = line.match(/\S+/g);
      switch (parts[0]) {
        case 'Nodes':
          this.endCurrentMode();
          this.currentMode = this.constructor.modes.Nodes;
          this.currentNodesName = parts[1];
          this.currentNodes = {};
          this.currentNodes.nodes = new Float32Array(1000 * 3);
          return;
        case 'Elements':
          this.endCurrentMode();
          this.currentMode = this.constructor.modes.Elements;
          this.currentElementsName = parts[1];
          this.currentTriIndex = 0;
          this.currentTetIndex = 0;
          this.currentElements = {
            elements: {
              4: new Uint32Array(1000 * 3),
              5: new Uint32Array(1000 * 4)
            },
            nodesName: parts[3]
          };
          return;
        case 'Vector':
          this.endCurrentMode();
          this.currentMode = this.constructor.modes.VectorCount;
          this.currentVectorNodesName = parts[5];
          this.currentVectorName = parts[1];
          this.currentVector = {
            vectorName: parts[1],
            nodesName: parts[5],
            frames: []
          };
          return;
        case 'Scalar':
          this.endCurrentMode();
          this.currentMode = this.constructor.modes.ScalarCount;
          this.currentScalarNodesName = parts[5];
          this.currentScalarName = parts[1];
          this.currentScalar = {
            scalarName: parts[1],
            nodesName: parts[5],
            frames: []
          };
          return;
      }
      switch (this.currentMode) {
        case this.constructor.modes.Nodes:
          if (parseInt(parts[0] === 0)) {
            alert("All indexes should start from 1 not 0.");
          }
          this.currentNodeIndex = parseInt(parts[0]);
          if (this.currentNodeIndex * 3 > this.currentNodes.nodes.length) {
            buffer = new Float32Array(this.currentNodes.nodes.length * 2);
            for (i = j = 0, ref = this.currentNodes.nodes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
              buffer[i] = this.currentNodes.nodes[i];
            }
            this.currentNodes.nodes = null;
            this.currentNodes.nodes = buffer;
          }
          this.currentNodes.nodes[(this.currentNodeIndex - 1) * 3 + 0] = parseFloat(parts[1]);
          this.currentNodes.nodes[(this.currentNodeIndex - 1) * 3 + 1] = parseFloat(parts[2]);
          return this.currentNodes.nodes[(this.currentNodeIndex - 1) * 3 + 2] = parseFloat(parts[3]);
        case this.constructor.modes.Elements:
          this.currentElementIndex = parseInt(parts[0]);
          this.elementType = parseInt(parts[1]);
          switch (this.elementType) {
            case 4:
              this.currentTriIndex++;
              if (this.currentTriIndex * 3 > this.currentElements.elements[this.elementType].length) {
                buffer = new Uint32Array(this.currentElements.elements[this.elementType].length * 2);
                for (i = k = 0, ref1 = this.currentElements.elements[this.elementType].length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
                  buffer[i] = this.currentElements.elements[this.elementType][i];
                }
                this.currentElements.elements[this.elementType] = null;
                this.currentElements.elements[this.elementType] = buffer;
              }
              this.currentElements.elements[this.elementType][(this.currentTriIndex - 1) * 3 + 0] = -1 + parseInt(parts[2]);
              this.currentElements.elements[this.elementType][(this.currentTriIndex - 1) * 3 + 1] = -1 + parseInt(parts[3]);
              return this.currentElements.elements[this.elementType][(this.currentTriIndex - 1) * 3 + 2] = -1 + parseInt(parts[4]);
            case 5:
              this.currentTetIndex++;
              if (this.currentTetIndex * 4 > this.currentElements.elements[this.elementType].length) {
                buffer = new Uint32Array(this.currentElements.elements[this.elementType].length * 2);
                for (i = l = 0, ref2 = this.currentElements.elements[this.elementType].length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
                  buffer[i] = this.currentElements.elements[this.elementType][i];
                }
                this.currentElements.elements[this.elementType] = null;
                this.currentElements.elements[this.elementType] = buffer;
              }
              this.currentElements.elements[this.elementType][(this.currentTetIndex - 1) * 4 + 0] = -1 + parseInt(parts[2]);
              this.currentElements.elements[this.elementType][(this.currentTetIndex - 1) * 4 + 1] = -1 + parseInt(parts[3]);
              this.currentElements.elements[this.elementType][(this.currentTetIndex - 1) * 4 + 2] = -1 + parseInt(parts[4]);
              return this.currentElements.elements[this.elementType][(this.currentTetIndex - 1) * 4 + 3] = -1 + parseInt(parts[5]);
            default:
              return console.error("UNKNOWN ELEMENT TYPE", this.elementType, parts, line, this.lastLine);
          }
          break;
        case this.constructor.modes.VectorCount:
          this.currentFrameNodesCount = parseInt(parts[0]);
          return this.currentMode = this.constructor.modes.VectorTime;
        case this.constructor.modes.VectorTime:
          this.currentFrameTime = parseFloat(parts[0]);
          this.currentMode = this.constructor.modes.Vector;
          this.currentFrame = {
            time: this.currentFrameTime,
            vectors: new Float32Array(this.currentFrameNodesCount * 3)
          };
          return this.currentFrameNodeIndex = 0;
        case this.constructor.modes.Vector:
          this.currentFrame.vectors[this.currentFrameNodeIndex * 3] = parseFloat(parts[0]);
          this.currentFrame.vectors[this.currentFrameNodeIndex * 3 + 1] = parseFloat(parts[1]);
          this.currentFrame.vectors[this.currentFrameNodeIndex * 3 + 2] = parseFloat(parts[2]);
          this.currentFrameNodeIndex++;
          if (this.currentFrameNodeIndex === this.currentFrameNodesCount) {
            this.currentVector.frames.push(this.currentFrame);
            this.endVectorFrame();
            return this.currentMode = this.constructor.modes.VectorTime;
          }
          break;
        case this.constructor.modes.ScalarCount:
          this.currentFrameNodesCount = parseInt(parts[0]);
          return this.currentMode = this.constructor.modes.ScalarTime;
        case this.constructor.modes.ScalarTime:
          this.currentFrameTime = parseFloat(parts[0]);
          this.currentMode = this.constructor.modes.Scalar;
          this.currentFrame = {
            time: this.currentFrameTime,
            scalars: new Float32Array(this.currentFrameNodesCount),
            minValue: null,
            maxValue: null
          };
          return this.currentFrameNodeIndex = 0;
        case this.constructor.modes.Scalar:
          value = parseFloat(parts[0]);
          if (!((this.currentFrame.minValue != null) && this.currentFrame.minValue < value)) {
            this.currentFrame.minValue = value;
          }
          if (!((this.currentFrame.maxValue != null) && this.currentFrame.maxValue > value)) {
            this.currentFrame.maxValue = value;
          }
          this.currentFrame.scalars[this.currentFrameNodeIndex] = value;
          this.currentFrameNodeIndex++;
          if (this.currentFrameNodeIndex === this.currentFrameNodesCount) {
            this.currentScalar.frames.push(this.currentFrame);
            this.endScalarFrame();
            return this.currentMode = this.constructor.modes.ScalarTime;
          }
      }
    };

    TopParser.prototype.endCurrentMode = function() {
      switch (this.currentMode) {
        case this.constructor.modes.Nodes:
          return this.endNodes();
        case this.constructor.modes.Elements:
          return this.endElements();
        case this.constructor.modes.Vector:
          return this.endVector();
        case this.constructor.modes.Scalar:
          return this.endScalar();
      }
    };

    TopParser.prototype.endNodes = function() {
      var buffer, i, j, nodesResult, ref;
      if (this.currentNodeIndex * 3 !== this.currentNodes.nodes.length) {
        buffer = new Float32Array(this.currentNodeIndex * 3);
        for (i = j = 0, ref = this.currentNodeIndex * 3; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          buffer[i] = this.currentNodes.nodes[i];
        }
        this.currentNodes.nodes = null;
        this.currentNodes.nodes = buffer;
      }
      nodesResult = {};
      nodesResult[this.currentNodesName] = this.currentNodes;
      return postMessage({
        type: 'result',
        objects: {
          nodes: nodesResult
        }
      });
    };

    TopParser.prototype.endElements = function() {
      var buffer, elementsResult, i, j, k, ref, ref1;
      if (this.elementType === 4) {
        if (this.currentTriIndex * 3 !== this.currentElements.elements[4].length) {
          buffer = new Uint32Array(this.currentTriIndex * 3);
          for (i = j = 0, ref = this.currentTriIndex * 3; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            buffer[i] = this.currentElements.elements[4][i];
          }
          this.currentElements.elements[4] = null;
          this.currentElements.elements[4] = buffer;
        }
      } else if (this.elementType === 5) {
        if (this.currentTetIndex * 4 !== this.currentElements.elements[5].length) {
          buffer = new Uint32Array(this.currentTetIndex * 4);
          for (i = k = 0, ref1 = this.currentTetIndex * 4; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
            buffer[i] = this.currentElements.elements[5][i];
          }
          this.currentElements.elements[5] = null;
          this.currentElements.elements[5] = buffer;
        }
      }
      elementsResult = {};
      elementsResult[this.currentElementsName] = this.currentElements;
      return postMessage({
        type: 'result',
        objects: {
          elements: elementsResult
        }
      });
    };

    TopParser.prototype.endScalar = function() {
      var scalarsResult;
      if (!this.currentScalar.frames.length) {
        return;
      }
      scalarsResult = {};
      scalarsResult[this.currentScalarNodesName] = {};
      scalarsResult[this.currentScalarNodesName][this.currentScalarName] = this.currentScalar;
      postMessage({
        type: 'result',
        objects: {
          scalars: scalarsResult
        }
      });
      return this.currentScalar.frames = [];
    };

    TopParser.prototype.endVector = function() {
      var vectorsResult;
      if (!this.currentVector.frames.length) {
        return;
      }
      vectorsResult = {};
      vectorsResult[this.currentVectorNodesName] = {};
      vectorsResult[this.currentVectorNodesName][this.currentVectorName] = this.currentVector;
      postMessage({
        type: 'result',
        objects: {
          vectors: vectorsResult
        }
      });
      return this.currentVector.frames = [];
    };

    TopParser.prototype.endScalarFrame = function() {
      return this.throttledEndScalar();
    };

    TopParser.prototype.endVectorFrame = function() {
      return this.throttledEndVector();
    };

    TopParser.prototype.end = function() {
      this.endCurrentMode();
      return postMessage({
        type: 'complete'
      });
    };

    TopParser.prototype.reportProgress = function(percentage) {
      var newPercentage;
      newPercentage = Math.floor(percentage * 100);
      if (newPercentage > this.reportedProgressPercentage) {
        this.reportedProgressPercentage = newPercentage;
        return postMessage({
          type: 'progress',
          loadPercentage: newPercentage
        });
      }
    };

    return TopParser;

  })();

}).call(this);

//# sourceMappingURL=toploader-worker.js.map
