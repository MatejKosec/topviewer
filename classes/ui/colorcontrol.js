// Generated by CoffeeScript 1.10.0
(function() {
  TopViewer.ColorControl = (function() {
    ColorControl.presets = ['black', 'dimgrey', 'grey', 'darkgrey', 'silver', 'gainsboro', 'white', 'slategrey', 'steelblue', 'lightsteelblue', 'indianred', 'wheat', 'cadetblue', 'darkseagreen'];

    function ColorControl(uiArea, options) {
      var addSlider, fn, i, len, preset, ref, uiControl;
      this.uiArea = uiArea;
      this.options = options;
      this._components = {
        h: 0,
        s: 0,
        l: 0
      };
      this.value = new THREE.Color();
      if (this.options.value) {
        this.value = this.options.value;
      }
      if (this.options.saveState) {
        this.value.setHSL(this.options.saveState.h / 360, this.options.saveState.s / 100, this.options.saveState.l / 100);
      }
      this.$element = $("<div class='color-control " + this.options["class"] + "'></div>");
      this.options.$parent.append(this.$element);
      this.$dialog = $("<div class='dialog'>");
      this.dialogControl = new TopViewer.ToggleContainer(this.uiArea, {
        $parent: this.$element,
        text: "",
        visible: false,
        $contents: this.$dialog
      });
      uiControl = new TopViewer.UIControl(this.uiArea, this.$element);
      uiControl.globalMouseup((function(_this) {
        return function(position) {
          var $pointers, element, parentOrigin;
          parentOrigin = _this.uiArea.$appWindow.offset();
          $pointers = $('.pointerItem');
          $pointers.hide();
          element = document.elementFromPoint(parentOrigin.left + position.x, parentOrigin.top + position.y);
          $pointers.show();
          if (_this.$element.has(element).length) {
            return;
          }
          return _this.dialogControl.toggleControl.setValue(false);
        };
      })(this));
      this.$presetsArea = $("<div class='presets-area'></div>");
      this.$dialog.append(this.$presetsArea);
      this.$presets = $("<ul class='presets'></ul>");
      this.$presetsArea.append(this.$presets);
      ref = this.constructor.presets;
      fn = (function(_this) {
        return function(preset) {
          var $preset, presetControl;
          $preset = $("<li class='preset' style='background: " + preset + ";'></li>");
          _this.$presets.append($preset);
          presetControl = new TopViewer.UIControl(_this.uiArea, $preset);
          return presetControl.mousedown(function(position) {
            _this.setValue(new THREE.Color(preset));
            return _this.dialogControl.toggleControl.setValue(false);
          });
        };
      })(this);
      for (i = 0, len = ref.length; i < len; i++) {
        preset = ref[i];
        fn(preset);
      }
      this.$colorSliders = $("<div class='color-sliders'></div>");
      this.$dialog.append(this.$colorSliders);
      addSlider = (function(_this) {
        return function(name, unit, maximumValue, onChange) {
          var $sliderArea;
          $sliderArea = $("<div class='slider-area'><span class='name'>" + name + "</span></div>");
          _this.$colorSliders.append($sliderArea);
          return new TopViewer.SliderControl(_this.uiArea, {
            $parent: $sliderArea,
            minimumValue: 0,
            maximumValue: maximumValue,
            decimals: 0,
            unit: unit,
            unitWithoutSpace: true,
            onChange: function(value) {
              return onChange(value);
            }
          });
        };
      })(this);
      this.sliders = {
        h: addSlider("H", "°", 360, (function(_this) {
          return function(value) {
            return _this._updateComponent('h', value);
          };
        })(this)),
        s: addSlider("S", "%", 100, (function(_this) {
          return function(value) {
            return _this._updateComponent('s', value);
          };
        })(this)),
        l: addSlider("L", "%", 100, (function(_this) {
          return function(value) {
            return _this._updateComponent('l', value);
          };
        })(this))
      };
      this.$colorPreview = $("<div class='color-preview'></div>");
      this.dialogControl.toggleControl.$element.text('').append(this.$colorPreview);
      this.setValue(this.value);
    }

    ColorControl.prototype.setValue = function(value) {
      var component, ref;
      this.value = value;
      this._components = this.value.getHSL();
      this._components.h *= 360;
      this._components.s *= 100;
      this._components.l *= 100;
      ref = this._components;
      for (component in ref) {
        value = ref[component];
        this.sliders[component].setValue(value, true);
      }
      return this._colorChanged();
    };

    ColorControl.prototype._updateComponent = function(component, value) {
      this._components[component] = value;
      this.value.setHSL(this._components.h / 360, this._components.s / 100, this._components.l / 100);
      return this._colorChanged();
    };

    ColorControl.prototype._colorChanged = function() {
      var base;
      this.$colorPreview.css({
        background: "hsl(" + this._components.h + ", " + this._components.s + "%, " + this._components.l + "%)"
      });
      if (this.options.saveState) {
        _.extend(this.options.saveState, this._components);
      }
      return typeof (base = this.options).onChange === "function" ? base.onChange(this.value) : void 0;
    };

    return ColorControl;

  })();

}).call(this);

//# sourceMappingURL=colorcontrol.js.map