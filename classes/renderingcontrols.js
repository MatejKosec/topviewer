// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.RenderingControls = (function(superClass) {
    extend(RenderingControls, superClass);

    function RenderingControls(options) {
      this.options = options;
      RenderingControls.__super__.constructor.apply(this, arguments);
      this.$appWindow = this.options.engine.$appWindow;
      this.scene = this.options.engine.scene;
      this.$controls = $("<div class='rendering-controls'>");
      this.$appWindow.append(this.$controls);
      this.rootControl = new TopViewer.UIControl(this, this.$controls);
      this.displacementFactor = new TopViewer.SliderControl(this, {
        $parent: this.$controls,
        "class": 'displacement-factor',
        minimumValue: 0,
        maximumValue: 100,
        power: 4,
        value: 1,
        decimals: -2
      });
      this.$controls.append("<div class='gradient-curve'>\n  <canvas height='256' width='256'></canvas>\n</div>");
      this.gradientCurve = new ColorCurve(this.$controls.find('.gradient-curve canvas')[0]);
      this.surfaceControl = new TopViewer.CheckboxControl(this, {
        $parent: this.$controls,
        name: 'surface',
        value: true
      });
      this.wireframeControl = new TopViewer.CheckboxControl(this, {
        $parent: this.$controls,
        name: 'wireframe',
        value: false
      });
      this.$controls.append("<hr/>");
      this.$meshes = $("<ul class='meshes'></ul>");
      this.$controls.append(this.$meshes);
      this.$controls.append("<hr/>");
      this.$vectors = $("<ul class='vectors'></ul>");
      this.$controls.append(this.$vectors);
    }

    RenderingControls.prototype.addMesh = function(name, mesh) {
      var $contents, $mesh;
      $mesh = $("<li class='mesh'></li>");
      this.$meshes.append($mesh);
      $contents = $("<div>");
      mesh.renderingControls = {
        surface: new TopViewer.CheckboxControl(this, {
          $parent: $contents,
          name: 'surface',
          value: true
        }),
        wireframe: new TopViewer.CheckboxControl(this, {
          $parent: $contents,
          name: 'wireframe',
          value: false
        })
      };
      return new TopViewer.ToggleContainer(this, {
        $parent: $mesh,
        text: name,
        visible: false,
        $contents: $contents
      });
    };

    RenderingControls.prototype.addVector = function(name, vector) {
      var $contents, $vector;
      $vector = $("<li class='vector'></li>");
      this.$vectors.append($vector);
      $contents = $("<div>");
      vector.renderingControls = {
        displacementFactor: new TopViewer.SliderControl(this, {
          $parent: $contents,
          "class": 'displacement-factor',
          minimumValue: 0,
          maximumValue: 100,
          power: 4,
          value: 1,
          decimals: -2
        })
      };
      return new TopViewer.ToggleContainer(this, {
        $parent: $vector,
        text: name,
        visible: false,
        $contents: $contents
      });
    };

    RenderingControls.prototype.onMouseDown = function(position, button) {
      RenderingControls.__super__.onMouseDown.apply(this, arguments);
      return this.gradientCurve.mouseDown(this.transformPositionToPage(position));
    };

    RenderingControls.prototype.onMouseMove = function(position) {
      RenderingControls.__super__.onMouseMove.apply(this, arguments);
      return this.gradientCurve.mouseMove(this.transformPositionToPage(position));
    };

    RenderingControls.prototype.onMouseUp = function(position, button) {
      RenderingControls.__super__.onMouseUp.apply(this, arguments);
      return this.gradientCurve.mouseUp(this.transformPositionToPage(position));
    };

    RenderingControls.prototype.transformPositionToPage = function(position) {
      var offset;
      offset = this.$appWindow.offset();
      return {
        x: position.x + offset.left,
        y: position.y + offset.top
      };
    };

    return RenderingControls;

  })(TopViewer.UIArea);

}).call(this);

//# sourceMappingURL=renderingcontrols.js.map