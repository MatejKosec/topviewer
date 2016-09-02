// Generated by CoffeeScript 1.10.0
(function() {
  TopViewer.UIControl = (function() {
    UIControl._controls = [];

    function UIControl(uiArea, $element) {
      this.uiArea = uiArea;
      this.$element = $element;
      this.hover = false;
      this._mouseDownHandlers = [];
      this._mouseMoveHandlers = [];
      this._mouseUpHandlers = [];
      this._mouseScrollHandlers = [];
      this._globalMouseMoveHandlers = [];
      this._globalMouseUpHandlers = [];
      this.uiArea.addControl(this);
      this.$element.data("control", this);
    }

    UIControl.prototype.mousedown = function(handler) {
      return this._mouseDownHandlers.push(handler);
    };

    UIControl.prototype.mousemove = function(handler) {
      return this._mouseMoveHandlers.push(handler);
    };

    UIControl.prototype.mouseup = function(handler) {
      return this._mouseUpHandlers.push(handler);
    };

    UIControl.prototype.scroll = function(handler) {
      return this._mouseScrollHandlers.push(handler);
    };

    UIControl.prototype.globalMousemove = function(handler) {
      return this._globalMouseMoveHandlers.push(handler);
    };

    UIControl.prototype.globalMouseup = function(handler) {
      return this._globalMouseUpHandlers.push(handler);
    };

    UIControl.prototype.click = function(handler) {
      return this.mouseup(handler);
    };

    UIControl.prototype.onMouseDown = function(position, button) {
      var handler, i, len, ref, results;
      ref = this._mouseDownHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(position, button));
      }
      return results;
    };

    UIControl.prototype.onMouseMove = function(position) {
      var handler, i, len, ref, results;
      ref = this._mouseMoveHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(position));
      }
      return results;
    };

    UIControl.prototype.onMouseUp = function(position, button) {
      var handler, i, len, ref, results;
      ref = this._mouseUpHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(position, button));
      }
      return results;
    };

    UIControl.prototype.onGlobalMouseMove = function(position, button) {
      var handler, i, len, ref, results;
      ref = this._globalMouseMoveHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(position, button));
      }
      return results;
    };

    UIControl.prototype.onGlobalMouseUp = function(position, button) {
      var handler, i, len, ref, results;
      ref = this._globalMouseUpHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(position, button));
      }
      return results;
    };

    UIControl.prototype.onMouseScroll = function(delta) {
      var handler, i, len, ref, results;
      ref = this._mouseScrollHandlers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        handler = ref[i];
        results.push(handler(delta));
      }
      return results;
    };

    return UIControl;

  })();

}).call(this);

//# sourceMappingURL=uicontrol.js.map
