// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  window.topviewer = SAGE2_App.extend({
    init: function(data) {
      var $element, targetFile;
      console.log("Top viewer started with data", data);
      this.SAGE2Init('div', data);
      this.resizeEvents = 'continuous';
      targetFile = data.state.file;
      this.lastDrawTime = data.date.getTime() / 1000;
      $element = $(this.element);
      $element.append("<link href='https://fonts.googleapis.com/css?family=Ubuntu+Condensed' rel='stylesheet' type='text/css'>\n<link href=\"/uploads/apps/top_viewer/css/fontello.css\" rel=\"stylesheet\"/>\n<link href=\"/uploads/apps/top_viewer/css/animation.css\" rel=\"stylesheet\"/>\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/playbackcontrols.css\" />\n<link rel=\"stylesheet\" type=\"text/css\" href=\"/uploads/apps/top_viewer/css/renderingcontrols.css\" />");
      this.engine = new TopViewer.Engine({
        app: this,
        width: this.width,
        height: this.height,
        $appWindow: $element,
        resourcesPath: this.resrcPath
      });
      this.fileManager = new TopViewer.FileManager({
        targetFile: targetFile,
        engine: this.engine
      });
      this.needsResize = data.date;
      this._shouldQuit = false;
      this.drawLoop();
      this.storedFileListEventHandler = (function(_this) {
        return function(fileListData) {
          return _this.fileManager.initialize(fileListData);
        };
      })(this);
      return addStoredFileListEventHandler(this.storedFileListEventHandler);
    },
    load: function(date) {},
    draw: function(date) {
      return this.needsDraw = date;
    },
    resize: function(date) {
      return this.needsResize = date;
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
      if (this.needsResize) {
        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;
        this.engine.resize(this.width, this.height);
        $(this.element).css({
          fontSize: this.height * 0.015
        });
        this.refresh(this.needsResize);
        this.needsResize = false;
      }
      if (this.needsDraw) {
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
            case 83:
              this.engine.toggleSurface();
              break;
            case 67:
              this.engine.activeControls = this.engine.cameraControls;
              break;
            case 79:
              this.engine.activeControls = this.engine.rotateControls;
              break;
            case 82:
              this.engine.toggleReflections();
              break;
            case 65:
              this.engine.toggleAmbientLight();
              break;
            case 68:
              this.engine.toggleDirectionalLight();
              break;
            case 86:
              this.engine.toggleVertexColors();
              break;
            case 87:
              this.engine.toggleWireframe();
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
    move: function(date) {
      return this.refresh(date);
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
