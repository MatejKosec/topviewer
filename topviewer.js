// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  window.topviewer = SAGE2_WebGLApp.extend({
    init: function(data) {
      var $element, targetFile;
      console.log("Top viewer started with data", data);
      this.WebGLAppInit('canvas', data);
      this.resizeEvents = 'continuous';
      targetFile = data.state.file;
      $element = $(this.element);
      $element.addClass('top-viewer');
      $element.append("<link href='https://fonts.googleapis.com/css?family=Ubuntu+Condensed' rel='stylesheet' type='text/css'>\n<link href=\"/uploads/apps/top_viewer/css/fontello.css\" rel=\"stylesheet\"/>\n<link href=\"/uploads/apps/top_viewer/css/animation.css\" rel=\"stylesheet\"/>\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/ui.css\" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/filemanager.css\" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/playbackcontrols.css\" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/renderingcontrols.css\" />");
      this.engine = new TopViewer.Engine({
        app: this,
        $appWindow: $element,
        resourcesPath: this.resrcPath
      });
      this.fileManager = new TopViewer.FileManager({
        targetFile: targetFile,
        engine: this.engine
      });
      this.storedFileListEventHandler = (function(_this) {
        return function(fileListData) {
          return _this.fileManager.initializeFiles(fileListData);
        };
      })(this);
      addStoredFileListEventHandler(this.storedFileListEventHandler);
      this.resizeCanvas();
      this._shouldQuit = false;
      this.lastDrawTime = data.date.getTime() / 1000;
      this.refresh(data.date);
      return this.drawLoop();
    },
    sync: function(data) {
      var cameraState;
      if (!window.isMaster) {
        this.engine.playbackControls.setCurrentTime(data.currentTime);
        if (data.playing) {
          this.engine.playbackControls.play();
        } else {
          this.engine.playbackControls.pause();
        }
        cameraState = data.state.camera;
        this.engine.camera.position.copy(cameraState.position);
        this.engine.camera.rotation.set(cameraState.rotation._x, cameraState.rotation._y, cameraState.rotation._z, cameraState.rotation._order);
        this.engine.camera.scale.set(cameraState.scale.x, cameraState.scale.y, cameraState.scale.z);
        return this.engine.cameraControls.center.copy(cameraState.center);
      }
    },
    animationUpdate: function(data) {
      console.log("we got animation update", data, window.isMaster);
      if (data.clientId != null) {
        this.engine.animation.onAnimationUpdate(data);
      }
      if (data.maxLength != null) {
        return this.engine.animation.length = data.maxLength;
      }
    },
    resizeApp: function(resizeData) {
      this.engine.resize(resizeData);
      return $(this.element).css({
        fontSize: this.sage2_height * 0.015
      });
    },
    startMove: function(date) {
      return this.moving = true;
    },
    move: function(date) {
      this.resizeCanvas(date);
      this.refresh(date);
      return this.moving = false;
    },
    draw: function(date) {
      return this.needsDraw = date;
    },
    drawLoop: function() {
      var date, elapsedTime, time;
      requestAnimationFrame((function(_this) {
        return function() {
          if (!_this._shouldQuit) {
            return _this.drawLoop();
          }
        };
      })(this));
      if (this.needsDraw) {
        if (this.moving) {
          this.resizeCanvas(date);
          this.refresh(date);
        }
        date = this.needsDraw;
        time = date.getTime() / 1000;
        elapsedTime = time - this.lastDrawTime;
        this.engine.draw(elapsedTime);
        this.needsDraw = false;
        return this.lastDrawTime = time;
      }
    },
    event: function(eventType, position, user_id, data, date) {
      if (eventType === 'pointerPress') {
        this.engine.onMouseDown(position, data.button);
        this.refresh(date);
      } else if (eventType === 'pointerMove') {
        this.engine.onMouseMove(position);
        this.refresh(date);
      } else if (eventType === 'pointerRelease') {
        this.engine.onMouseUp(position, data.button);
        this.refresh(date);
      }
      if (eventType === 'pointerScroll') {
        this.engine.onMouseScroll(data.wheelDelta);
        this.refresh(date);
      }
      if (eventType === 'keyboard') {
        if (data.character === ' ') {
          this.engine.playbackControls.togglePlay();
          this.refresh(date);
        }
      }
      if (eventType === 'specialKey') {
        if (data.state === 'down') {
          switch (data.code) {
            case 37:
              this.engine.playbackControls.previousFrame();
              break;
            case 39:
              this.engine.playbackControls.nextFrame();
              break;
            case 67:
              this.engine.activeControls = this.engine.cameraControls;
              break;
            case 79:
              this.engine.activeControls = this.engine.rotateControls;
          }
          return this.refresh(date);
        }
      } else if (eventType === 'widgetEvent') {
        switch (data.identifier) {
          case 'Up':
            this.engine.orbitControls.pan(0, this.engine.orbitControls.keyPanSpeed);
            this.engine.orbitControls.update();
            break;
          case 'Down':
            this.engine.orbitControls.pan(0, -this.engine.orbitControls.keyPanSpeed);
            this.engine.orbitControls.update();
            break;
          case 'Left':
            this.engine.orbitControls.pan(this.engine.orbitControls.keyPanSpeed, 0);
            this.engine.orbitControls.update();
            break;
          case 'Right':
            this.engine.orbitControls.pan(-this.engine.orbitControls.keyPanSpeed, 0);
            this.engine.orbitControls.update();
            break;
          case 'ZoomIn':
            this.engine.orbitControls.scale(4);
            break;
          case 'ZoomOut':
            this.engine.orbitControls.scale(-4);
            break;
          case 'Loop':
            this.rotating = !this.rotating;
            this.engine.orbitControls.autoRotate = this.rotating;
            break;
          default:
            console.log('No handler for:', data.identifier);
            return;
        }
        return this.refresh(date);
      }
    },
    quit: function() {
      console.log("Destroying topViewer");
      this._shouldQuit = true;
      removeStoredFileListEventHandler(this.storedFileListEventHandler);
      this.engine.destroy();
      this.engine = null;
      return this.log('Done');
    }
  });

}).call(this);

//# sourceMappingURL=topviewer.js.map
