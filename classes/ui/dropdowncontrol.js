// Generated by CoffeeScript 1.10.0
(function() {
  TopViewer.DropdownControl = (function() {
    function DropdownControl(uiArea, options) {
      var uiControl;
      this.uiArea = uiArea;
      this.options = options;
      this.$element = $("<div class=\"dropdown-control " + this.options["class"] + "\">\n</div>");
      this.$values = $("<ul class='values'>");
      this.dropdownControl = new TopViewer.ToggleContainer(this.uiArea, {
        $parent: this.$element,
        text: this.options.text,
        visible: false,
        $contents: this.$values
      });
      uiControl = new TopViewer.UIControl(this.uiArea, this.$element);
      uiControl.globalMouseup((function(_this) {
        return function(position) {
          var clickedControl;
          clickedControl = _this.uiArea.hoveredControl;
          if (_this.$element.has(clickedControl != null ? clickedControl.$element : void 0).length) {
            return;
          }
          return _this.dropdownControl.toggleControl.setValue(false);
        };
      })(this));
      this.options.$parent.append(this.$element);
      this.value = this.options.value;
      this.values = [];
      new TopViewer.UIControl(this.uiArea, this.$element);
    }

    DropdownControl.prototype.addValue = function(text, value) {
      var $item, control;
      $item = $("<li class='value'>" + text + "</li>");
      this.$values.append($item);
      control = new TopViewer.UIControl(this.uiArea, $item);
      control.click((function(_this) {
        return function() {
          _this.setValue(value);
          return _this.dropdownControl.toggleControl.setValue(false);
        };
      })(this));
      return this.values.push({
        value: value,
        text: text,
        $item: $item,
        control: control
      });
    };

    DropdownControl.prototype.setValue = function(valueOrText) {
      var base, value;
      value = _.find(this.values, function(value) {
        return value.value === valueOrText || value.text === valueOrText;
      });
      if (!value) {
        return false;
      }
      this.value = value.value;
      this.dropdownControl.setText(value.text);
      if (typeof (base = this.options).onChange === "function") {
        base.onChange(this.value, this);
      }
      return true;
    };

    DropdownControl.prototype.setValueDirectly = function(value, text) {
      var base;
      this.value = value;
      this.dropdownControl.setText(text);
      return typeof (base = this.options).onChange === "function" ? base.onChange(this.value, this) : void 0;
    };

    return DropdownControl;

  })();

}).call(this);

//# sourceMappingURL=dropdowncontrol.js.map