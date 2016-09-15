// Generated by CoffeeScript 1.10.0
(function() {
  var binsCount, histogramHeight;

  binsCount = 100;

  histogramHeight = 25;

  TopViewer.CurveTransformControl = (function() {
    CurveTransformControl._controls = [];

    function CurveTransformControl(uiArea, options) {
      var clipControl, i, j, points;
      this.uiArea = uiArea;
      this.options = options;
      this.constructor._controls.push(this);
      this.$element = $("<div class=\"curve-transform-control " + this.options["class"] + "\">\n  <canvas class='histogram-canvas' height='25' width='100'></canvas>\n  <div class='curve-area'>\n    <canvas class='curve-canvas' height='256' width='256'></canvas>\n    <canvas class='spectrogram-canvas' height='100' width='100'></canvas>\n  </div>\n</div>");
      this.$histogramCanvas = this.$element.find('.histogram-canvas');
      this.histogramCanvas = this.$histogramCanvas[0];
      this.histogramCanvas.width = binsCount;
      this.histogramCanvas.height = histogramHeight;
      this.histogramContext = this.histogramCanvas.getContext('2d');
      this.spectrogramCanvas = this.$element.find('.spectrogram-canvas')[0];
      this.spectrogramCanvas.width = binsCount;
      this.spectrogramCanvas.height = this.options.scalar.frames.length;
      this.spectrogramContext = this.spectrogramCanvas.getContext('2d');
      this.colorCurve = new ColorCurve(this.$element.find('.curve-canvas')[0]);
      this.clip = {
        min: this.options.scalar.limits.minValue,
        max: this.options.scalar.limits.maxValue
      };
      this.currentClipProperty = null;
      if (this.options.saveState) {
        points = [];
        for (i = j = 0; j <= 3; i = ++j) {
          points.push(this.options.saveState.points[i]);
        }
        this.colorCurve.setPoints(points);
        if (this.options.saveState.clip.min) {
          this.clip.min = this.options.saveState.clip.min;
        }
        if (this.options.saveState.clip.max) {
          this.clip.max = this.options.saveState.clip.max;
        }
      }
      this.options.$parent.append(this.$element);
      this.curveData = new Float32Array(4096);
      this.curveTexture = new THREE.DataTexture(this.curveData, 4096, 1, THREE.AlphaFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
      clipControl = new TopViewer.UIControl(this.uiArea, this.$element.find('.histogram-canvas'));
      clipControl.mousedown((function(_this) {
        return function(position) {
          _this._clipControlChanging = true;
          return _this.handleClipDragging(position);
        };
      })(this));
      clipControl.globalMousemove((function(_this) {
        return function(position) {
          if (_this._clipControlChanging) {
            return _this.handleClipDragging(position);
          }
        };
      })(this));
      clipControl.globalMouseup((function(_this) {
        return function() {
          _this._clipControlChanging = false;
          return _this.currentClipProperty = null;
        };
      })(this));
      this.updateHistogram();
    }

    CurveTransformControl.prototype.handleClipDragging = function(position) {
      var distanceToMax, distanceToMin, max, min, range, value, x;
      x = this.uiArea.$appWindow.offset().left + position.x - this.$histogramCanvas.offset().left;
      min = this.options.scalar.limits.minValue;
      max = this.options.scalar.limits.maxValue;
      range = max - min;
      value = min + range * x / this.$histogramCanvas.width();
      value = Math.max(min, Math.min(max, value));
      if (!this.currentClipProperty) {
        distanceToMin = Math.abs(value - this.clip.min);
        distanceToMax = Math.abs(value - this.clip.max);
        if (distanceToMin < distanceToMax) {
          this.currentClipProperty = 'min';
        } else {
          this.currentClipProperty = 'max';
        }
      }
      if (this.currentClipProperty === 'min') {
        value = Math.min(value, this.clip.max);
      } else {
        value = Math.max(value, this.clip.min);
      }
      this.clip[this.currentClipProperty] = value;
      this.options.saveState.clip = this.clip;
      this.drawHistogram();
      return this.updateSpectrogram();
    };

    CurveTransformControl.prototype.update = function() {
      var i, j, k, results;
      if (this._lastUpdated !== this.colorCurve.lastUpdated) {
        this._lastUpdated = this.colorCurve.lastUpdated;
        for (i = j = 0; j < 4096; i = ++j) {
          this.curveData[i] = this.colorCurve.getY(i / 4096);
        }
        this.curveTexture.needsUpdate = true;
        if (this.options.saveState) {
          results = [];
          for (i = k = 0; k <= 3; i = ++k) {
            results.push(this.options.saveState.points[i] = this.colorCurve.points[i]);
          }
          return results;
        }
      }
    };

    CurveTransformControl.prototype.updateHistogram = function() {
      var binIndex, binWidth, frame, frameIndex, i, j, k, l, len, len1, max, min, range, ref, ref1, ref2, ref3, sampleStep, scalarValue;
      min = this.options.scalar.limits.minValue;
      max = this.options.scalar.limits.maxValue;
      range = max - min;
      binWidth = range / binsCount;
      this.histogramBins = [];
      for (i = j = 0, ref = binsCount; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        this.histogramBins[i] = 0;
      }
      this.maxHistogramBinValue = 0;
      ref1 = this.options.scalar.frames;
      for (frameIndex = k = 0, len = ref1.length; k < len; frameIndex = ++k) {
        frame = ref1[frameIndex];
        sampleStep = Math.floor(Math.max(1, frame.scalars.length / 1000));
        ref3 = frame.scalars;
        ref2 = sampleStep;
        for ((ref2 > 0 ? (l = 0, len1 = ref3.length) : l = ref3.length - 1); ref2 > 0 ? l < len1 : l >= 0; l += ref2) {
          scalarValue = ref3[l];
          binIndex = Math.floor((scalarValue - min) / binWidth);
          if (!((0 <= binIndex && binIndex < binsCount))) {
            continue;
          }
          this.histogramBins[binIndex]++;
          if (this.histogramBins[binIndex] > this.maxHistogramBinValue) {
            this.maxHistogramBinValue = this.histogramBins[binIndex];
          }
        }
      }
      this.drawHistogram();
      return this.updateSpectrogram();
    };

    CurveTransformControl.prototype.updateSpectrogram = function() {
      var binIndex, binWidth, frame, frameIndex, i, j, k, l, len, len1, max, min, range, ref, ref1, ref2, ref3, sampleStep, scalarValue;
      min = Math.max(this.clip.min, this.options.scalar.limits.minValue);
      max = Math.min(this.clip.max, this.options.scalar.limits.maxValue);
      range = max - min;
      binWidth = range / binsCount;
      this.maxBinValue = 0;
      ref = this.options.scalar.frames;
      for (frameIndex = j = 0, len = ref.length; j < len; frameIndex = ++j) {
        frame = ref[frameIndex];
        frame.bins = [];
        for (i = k = 0, ref1 = binsCount; 0 <= ref1 ? k <= ref1 : k >= ref1; i = 0 <= ref1 ? ++k : --k) {
          frame.bins[i] = 0;
        }
        sampleStep = Math.floor(Math.max(1, frame.scalars.length / 1000));
        ref3 = frame.scalars;
        ref2 = sampleStep;
        for ((ref2 > 0 ? (l = 0, len1 = ref3.length) : l = ref3.length - 1); ref2 > 0 ? l < len1 : l >= 0; l += ref2) {
          scalarValue = ref3[l];
          binIndex = Math.floor((scalarValue - min) / binWidth);
          if (!((0 <= binIndex && binIndex < binsCount))) {
            continue;
          }
          frame.bins[binIndex]++;
          if (frame.bins[binIndex] > this.maxBinValue) {
            this.maxBinValue = frame.bins[binIndex];
          }
        }
      }
      return this.drawSpectrogram();
    };

    CurveTransformControl.prototype.drawHistogram = function() {
      var i, j, k, len, max, min, range, ref, ref1, value, x;
      this.histogramContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
      min = this.options.scalar.limits.minValue;
      max = this.options.scalar.limits.maxValue;
      range = max - min;
      this.histogramContext.beginPath();
      for (i = j = 0, ref = binsCount; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        this.histogramContext.moveTo(i, histogramHeight);
        this.histogramContext.lineTo(i, histogramHeight * (1 - this.histogramBins[i] / this.maxHistogramBinValue));
      }
      this.histogramContext.strokeStyle = 'rgba(255,255,255,0.5)';
      this.histogramContext.stroke();
      this.histogramContext.beginPath();
      ref1 = [this.clip.min, this.clip.max];
      for (k = 0, len = ref1.length; k < len; k++) {
        value = ref1[k];
        x = (value - min) / range * binsCount;
        this.histogramContext.moveTo(x, 0);
        this.histogramContext.lineTo(x, histogramHeight);
      }
      this.histogramContext.strokeStyle = 'rgba(255,255,255,1)';
      return this.histogramContext.stroke();
    };

    CurveTransformControl.prototype.drawSpectrogram = function() {
      var binIndex, binValue, colorValue, frame, frameIndex, imageData, j, k, len, len1, pixelIndex, ref, ref1;
      imageData = this.spectrogramContext.createImageData(this.spectrogramCanvas.width, this.spectrogramCanvas.height);
      ref = this.options.scalar.frames;
      for (frameIndex = j = 0, len = ref.length; j < len; frameIndex = ++j) {
        frame = ref[frameIndex];
        ref1 = frame.bins;
        for (binIndex = k = 0, len1 = ref1.length; k < len1; binIndex = ++k) {
          binValue = ref1[binIndex];
          pixelIndex = (frameIndex * binsCount + binIndex) * 4;
          colorValue = binValue / this.maxBinValue * 255;
          imageData.data[pixelIndex] = 255;
          imageData.data[pixelIndex + 1] = 255;
          imageData.data[pixelIndex + 2] = 255;
          imageData.data[pixelIndex + 3] = colorValue;
        }
      }
      return this.spectrogramContext.putImageData(imageData, 0, 0);
    };

    CurveTransformControl.update = function() {
      var control, j, len, ref, results;
      ref = this._controls;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        control = ref[j];
        results.push(control.update());
      }
      return results;
    };

    CurveTransformControl.mouseDown = function(position) {
      var control, j, len, ref, results;
      ref = this._controls;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        control = ref[j];
        results.push(control.colorCurve.mouseDown(position));
      }
      return results;
    };

    CurveTransformControl.mouseMove = function(position) {
      var control, j, len, ref, results;
      ref = this._controls;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        control = ref[j];
        results.push(control.colorCurve.mouseMove(position));
      }
      return results;
    };

    CurveTransformControl.mouseUp = function(position) {
      var control, j, len, ref, results;
      ref = this._controls;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        control = ref[j];
        results.push(control.colorCurve.mouseUp(position));
      }
      return results;
    };

    return CurveTransformControl;

  })();

}).call(this);

//# sourceMappingURL=curvetransformcontrol.js.map
