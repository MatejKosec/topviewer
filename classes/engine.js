// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  TopViewer.Engine = (function() {
    function Engine(options) {
      var cameraState, objectState;
      this.options = options;
      this.scene = new TopViewer.Scene({
        engine: this,
        resourcesPath: this.options.resourcesPath
      });
      this.camera = new THREE.PerspectiveCamera(45, this.options.width / this.options.height, 0.001, 20);
      cameraState = this.options.app.state.camera;
      this.camera.position.copy(cameraState.position);
      this.camera.rotation.set(cameraState.rotation._x, cameraState.rotation._y, cameraState.rotation._z, cameraState.rotation._order);
      this.camera.scale.set(cameraState.scale.x, cameraState.scale.y, cameraState.scale.z);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x444550);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.renderSingleSided = false;
      this.$appWindow = this.options.$appWindow;
      this.$appWindow.append(this.renderer.domElement);
      this._proxyCamera = new THREE.PerspectiveCamera(45, this.options.width / this.options.height, 0.01, 20);
      objectState = this.options.app.state.object;
      this._proxyCamera.position.copy(objectState.position);
      this._proxyCamera.rotation.set(objectState.rotation._x, objectState.rotation._y, objectState.rotation._z, objectState.rotation._order);
      this._proxyCamera.scale.set(objectState.scale.x, objectState.scale.y, objectState.scale.z);
      this.cameraControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.cameraControls.minDistance = 0.01;
      this.cameraControls.maxDistance = 10;
      this.cameraControls.zoomSpeed = 0.5;
      this.cameraControls.rotateSpeed = 2;
      this.cameraControls.autoRotate = false;
      this.cameraControls.center.copy(cameraState.center);
      this.rotateControls = new THREE.OrbitControls(this._proxyCamera, this.renderer.domElement);
      this.rotateControls.minDistance = 0.01;
      this.rotateControls.maxDistance = 10;
      this.rotateControls.rotateSpeed = 1;
      this.rotateControls.autoRotate = false;
      this.updateRotateControls();
      this.activeControls = this.cameraControls;
      this.lightingPresets = [new TopViewer.LightingSetup('Angled light', new THREE.Vector3(0.8, 1, 0.9).normalize()), new TopViewer.LightingSetup('Top light', new THREE.Vector3(0.1, 1, 0.2).normalize()), new TopViewer.LightingSetup('Front light', new THREE.Vector3(0.2, 0.1, 1).normalize()), new TopViewer.LightingSetup('Side light', new THREE.Vector3(1, 0.1, 0.2).normalize())];
      this.gradients = [new TopViewer.Gradient("Spectrum", this.options.resourcesPath + "gradients/spectrum.png"), new TopViewer.Gradient("Monochrome", this.options.resourcesPath + "gradients/monochrome.png"), new TopViewer.Gradient("Dual", this.options.resourcesPath + "gradients/dual.png"), new TopViewer.Gradient("Fire", this.options.resourcesPath + "gradients/heat.png"), new TopViewer.Gradient("Classic", this.options.resourcesPath + "gradients/xpost.png")];
      this.uiAreas = [];
      this.animation = new TopViewer.Animation({
        engine: this
      });
      this.playbackControls = new TopViewer.PlaybackControls({
        engine: this
      });
      this.renderingControls = new TopViewer.RenderingControls({
        engine: this
      });
      this.uiAreas.push(this.playbackControls);
      this.uiAreas.push(this.renderingControls);
      this._frameTime = 0;
      this._frameCount = 0;
    }

    Engine.prototype.destroy = function() {
      this.scene.destroy();
      return this.playbackControls.destroy();
    };

    Engine.prototype.resize = function(width, height) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      return this.renderer.setViewport(0, 0, this.renderer.context.drawingBufferWidth, this.renderer.context.drawingBufferHeight);
    };

    Engine.prototype.draw = function(elapsedTime) {
      var frameIndex, frameProgress, frameTime, i, j, len, len1, model, nextFrameIndex, nextFrameTime, ref, ref1, ref2, ref3, uiArea;
      this.uiControlsActive = false;
      this.rotateControls.update();
      ref = this.uiAreas;
      for (i = 0, len = ref.length; i < len; i++) {
        uiArea = ref[i];
        if (uiArea.rootControl.hover) {
          this.uiControlsActive = true;
        }
      }
      if (this.activeControls === this.rotateControls) {
        this.updateRotateControls();
      } else if (this.activeControls === this.cameraControls) {
        this.cameraControls.update();
      }
      TopViewer.CurveTransformControl.update();
      this.scene.directionalLight.position.copy(this.renderingControls.lightingSetupControl.value.lightPosition);
      this.scene.ambientLight.intensity = this.renderingControls.ambientLevelControl.value;
      this.playbackControls.update(elapsedTime);
      frameIndex = this.playbackControls.currentFrameIndex;
      nextFrameIndex = this.playbackControls.currentFrameIndex + 1;
      frameTime = (ref1 = this.animation.frameTimes[frameIndex]) != null ? ref1 : -1;
      nextFrameTime = (ref2 = this.animation.frameTimes[nextFrameIndex]) != null ? ref2 : -1;
      frameProgress = this.playbackControls.currentTime - this.playbackControls.currentFrameIndex;
      ref3 = this.scene.children;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        model = ref3[j];
        if (model instanceof TopViewer.Model) {
          model.showFrame(frameTime, nextFrameTime, frameProgress);
        }
      }
      this.renderer.render(this.scene, this.camera);
      this._frameCount++;
      this._frameTime += elapsedTime;
      if (this._frameTime > 1) {
        this._frameCount = 0;
        this._frameTime = 0;
        if (window.isMaster) {
          return this.options.app.broadcast('sync', {
            currentTime: this.playbackControls.currentTime,
            playing: this.playbackControls.playing,
            state: this.options.app.state
          });
        }
      }
    };

    Engine.prototype.updateRotateControls = function() {
      var azimuthal, euler, polar;
      this.rotateControls.update();
      azimuthal = this.rotateControls.getAzimuthalAngle();
      polar = -this.rotateControls.getPolarAngle();
      euler = new THREE.Euler(polar, azimuthal, 0, 'XYZ');
      this.objectRotation = new THREE.Matrix4().makeRotationFromEuler(euler);
      return this.scene.updateRotation();
    };

    Engine.prototype.onMouseDown = function(position, button) {
      var i, len, ref, results, uiArea;
      if (!this.uiControlsActive) {
        this.activeControls.mouseDown(position.x, position.y, this.buttonIndexFromString(button));
      }
      this._updateSaveState();
      ref = this.uiAreas;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        uiArea = ref[i];
        results.push(uiArea.onMouseDown(position, button));
      }
      return results;
    };

    Engine.prototype.onMouseMove = function(position) {
      var i, len, ref, results, uiArea;
      if (!this.uiControlsActive) {
        this.activeControls.mouseMove(position.x, position.y);
      }
      this._updateSaveState();
      ref = this.uiAreas;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        uiArea = ref[i];
        results.push(uiArea.onMouseMove(position));
      }
      return results;
    };

    Engine.prototype.onMouseUp = function(position, button) {
      var i, len, ref, results, uiArea;
      if (!this.uiControlsActive) {
        this.activeControls.mouseUp(position.x, position.y, this.buttonIndexFromString(button));
      }
      this._updateSaveState();
      ref = this.uiAreas;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        uiArea = ref[i];
        results.push(uiArea.onMouseUp(position, button));
      }
      return results;
    };

    Engine.prototype.onMouseScroll = function(delta) {
      var i, len, ref, results, uiArea;
      if (!this.uiControlsActive) {
        this.activeControls.scale(delta);
      }
      this._updateSaveState();
      ref = this.uiAreas;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        uiArea = ref[i];
        results.push(uiArea.onMouseScroll(delta));
      }
      return results;
    };

    Engine.prototype.buttonIndexFromString = function(button) {
      if (button === 'right') {
        return 2;
      } else {
        return 0;
      }
    };

    Engine.prototype._updateSaveState = function() {
      this.options.app.state.camera = _.pick(this.camera, 'position', 'rotation', 'scale');
      this.options.app.state.camera.center = this.cameraControls.center;
      return this.options.app.state.object = _.pick(this._proxyCamera, 'position', 'rotation', 'scale');
    };

    return Engine;

  })();

}).call(this);

//# sourceMappingURL=engine.js.map
