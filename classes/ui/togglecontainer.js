// Generated by CoffeeScript 1.10.0
(function() {
  TopViewer.ToggleContainer = (function() {
    function ToggleContainer(uiArea, options) {
      var $contents, $toggle;
      this.uiArea = uiArea;
      this.options = options;
      this.$element = $("<div class=\"toggle-container " + this.options["class"] + "\">\n  <div class='toggle'></div>\n  <div class='contents " + (this.options.visible ? 'visible' : 'hidden') + "'></div>\n</div>");
      $toggle = this.$element.find('.toggle');
      $contents = this.$element.find('.contents');
      $contents.append(this.options.$contents);
      this.toggleControl = new TopViewer.CheckboxControl(this.uiArea, {
        $parent: $toggle,
        name: this.options.text,
        value: this.options.visible,
        onChange: (function(_this) {
          return function(value) {
            if (value) {
              return $contents.addClass('visible').removeClass('hidden');
            } else {
              return $contents.addClass('hidden').removeClass('visible');
            }
          };
        })(this)
      });
      this.options.$parent.append(this.$element);
      new TopViewer.UIControl(this.uiArea, this.$element);
    }

    ToggleContainer.prototype.setText = function(text) {
      this.options.text = text;
      return this.toggleControl.setName(text);
    };

    return ToggleContainer;

  })();

}).call(this);

//# sourceMappingURL=togglecontainer.js.map
