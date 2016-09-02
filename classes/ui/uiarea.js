// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  TopViewer.UIArea = (function() {
    function UIArea($appWindow) {
      this.$appWindow = $appWindow;
      this._controls = [];
      this._hoveredStack = [];
      this.$rootElement = null;
    }

    UIArea.prototype.destroy = function() {
      var control, i, len, ref;
      this.$appWindow = null;
      ref = this._controls;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        if (typeof control.destroy === "function") {
          control.destroy();
        }
      }
      return this._controls = null;
    };

    UIArea.prototype.addControl = function(control) {
      return this._controls.push(control);
    };

    UIArea.prototype.onMouseDown = function(position, button) {
      var control, i, len, ref, results;
      ref = this._hoveredStack;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        results.push(control.onMouseDown(position, button));
      }
      return results;
    };

    UIArea.prototype.onMouseMove = function(position) {
      var $element, $pointers, control, element, i, j, k, l, len, len1, len2, len3, parentOrigin, ref, ref1, ref2, ref3, results;
      ref = this._hoveredStack;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        control.hover = false;
        control.$element.removeClass('hover');
      }
      this._hoveredStack = [];
      parentOrigin = this.$appWindow.offset();
      $pointers = $('.pointerItem');
      $pointers.hide();
      element = document.elementFromPoint(parentOrigin.left + position.x, parentOrigin.top + position.y);
      $pointers.show();
      if (!(this.$rootElement.has(element).length || this.$rootElement.is(element))) {
        return;
      }
      $element = $(element);
      control = $element.data('control');
      if (control) {
        this._hoveredStack.push(control);
      }
      while ($element.parent().length) {
        $element = $element.parent();
        control = $element.data('control');
        if (control) {
          this._hoveredStack.push(control);
        }
      }
      ref1 = this._hoveredStack;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        control = ref1[j];
        control.hover = true;
        control.$element.addClass('hover');
      }
      ref2 = this._hoveredStack;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        control = ref2[k];
        control.onMouseMove(position);
      }
      ref3 = this._controls;
      results = [];
      for (l = 0, len3 = ref3.length; l < len3; l++) {
        control = ref3[l];
        results.push(control.onGlobalMouseMove(position));
      }
      return results;
    };

    UIArea.prototype.onMouseUp = function(position, button) {
      var control, i, j, len, len1, ref, ref1, results;
      ref = this._hoveredStack;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        control.onMouseUp(position, button);
      }
      ref1 = this._controls;
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        control = ref1[j];
        results.push(control.onGlobalMouseUp(position, button));
      }
      return results;
    };

    UIArea.prototype.onMouseScroll = function(delta) {
      var control, i, len, ref, results;
      ref = this._hoveredStack;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        results.push(control.onMouseScroll(delta));
      }
      return results;
    };

    return UIArea;

  })();

}).call(this);

//# sourceMappingURL=uiarea.js.map
