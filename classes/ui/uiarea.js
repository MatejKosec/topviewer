// Generated by CoffeeScript 1.12.4
(function() {
  'use strict';
  TopViewer.UIArea = (function() {
    function UIArea($appWindow) {
      this.$appWindow = $appWindow;
      this._controls = [];
      this._hoveredStack = [];
      this.$rootElement = null;
      this._throttledMouseMoveHandler = _.throttle(this._mouseMoveHandler, 100);
      this._throttledInitialize = _.throttle(this.initialize, 100, {
        leading: false
      });
    }

    UIArea.prototype.destroy = function() {
      var control, i, len, ref;
      this._destroying = true;
      ref = this._controls;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        if (typeof control.destroy === "function") {
          control.destroy();
        }
      }
      return this._controls = [];
    };

    UIArea.prototype.addControl = function(control) {
      this._controls.push(control);
      if (this._initialized) {
        return this._throttledInitialize();
      }
    };

    UIArea.prototype.removeControl = function(control) {
      var index;
      if (this._destroying) {
        return;
      }
      index = _.indexOf(this._controls, control);
      this._controls.splice(index, 1);
      if (this._initialized) {
        return this._throttledInitialize();
      }
    };

    UIArea.prototype.initialize = function() {
      this._initialized = true;
      return setTimeout((function(_this) {
        return function() {
          var addControls, addElements, sortContext, sortedElements;
          sortedElements = [];
          addElements = function($element, elements) {
            var child, children, element, i, len, newElements, zIndex, zIndexString;
            zIndexString = $element.css('z-index');
            zIndex = zIndexString === 'auto' ? 0 : parseInt(zIndexString);
            newElements = null;
            if (zIndexString !== 'auto') {
              newElements = [];
            }
            children = $element.children().toArray();
            if (children.length) {
              for (i = 0, len = children.length; i < len; i++) {
                child = children[i];
                addElements($(child), newElements || elements);
              }
            }
            element = {
              $element: $element,
              zIndex: zIndex
            };
            if (newElements != null ? newElements.length : void 0) {
              element.children = newElements;
            }
            return elements.push(element);
          };
          addElements(_this.$rootElement, sortedElements);
          sortContext = function(elements) {
            var element, i, len, results;
            elements.sort(function(a, b) {
              return b.zIndex - a.zIndex;
            });
            results = [];
            for (i = 0, len = elements.length; i < len; i++) {
              element = elements[i];
              if (_.isArray(element.element)) {
                results.push(sortContext(element.element));
              }
            }
            return results;
          };
          _this._sortedControls = [];
          addControls = function(elements) {
            var control, element, i, len, results;
            results = [];
            for (i = 0, len = elements.length; i < len; i++) {
              element = elements[i];
              if (_.isArray(element.children)) {
                addControls(element.children);
              }
              control = element.$element.data('control');
              if (control) {
                results.push(_this._sortedControls.push(control));
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
          return addControls(sortedElements);
        };
      })(this), 0);
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
      return this._throttledMouseMoveHandler(position);
    };

    UIArea.prototype._mouseMoveHandler = function(position) {
      var $element, control, hoveredControl, hovering, i, j, k, l, len, len1, len2, len3, len4, m, newlyHoveredControls, oldHoveredStack, parentOrigin, ref, ref1, ref2, results, unhoveredControls;
      parentOrigin = this.$appWindow.offset();
      ref = this._sortedControls;
      for (i = 0, len = ref.length; i < len; i++) {
        control = ref[i];
        hovering = control.isInside(position, parentOrigin);
        if (hovering) {
          hoveredControl = control;
          break;
        }
      }
      if (hoveredControl !== this.hoveredControl) {
        this.hoveredControl = hoveredControl;
        oldHoveredStack = this._hoveredStack;
        this._hoveredStack = [];
        $element = hoveredControl != null ? hoveredControl.$element : void 0;
        if (this.$rootElement.has($element).length || this.$rootElement.is($element)) {
          control = hoveredControl;
          this._hoveredStack.push(control);
          while ($element.parent().length) {
            $element = $element.parent();
            control = $element.data('control');
            if (control) {
              this._hoveredStack.push(control);
            }
          }
        }
        newlyHoveredControls = _.difference(this._hoveredStack, oldHoveredStack);
        unhoveredControls = _.difference(oldHoveredStack, this._hoveredStack);
        for (j = 0, len1 = newlyHoveredControls.length; j < len1; j++) {
          control = newlyHoveredControls[j];
          control.hover = true;
          control.$element.addClass('hover');
        }
        for (k = 0, len2 = unhoveredControls.length; k < len2; k++) {
          control = unhoveredControls[k];
          control.hover = false;
          control.$element.removeClass('hover');
        }
      }
      ref1 = this._hoveredStack;
      for (l = 0, len3 = ref1.length; l < len3; l++) {
        control = ref1[l];
        control.onMouseMove(position);
      }
      ref2 = this._controls;
      results = [];
      for (m = 0, len4 = ref2.length; m < len4; m++) {
        control = ref2[m];
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
