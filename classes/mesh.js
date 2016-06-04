// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.Mesh = (function(superClass) {
    extend(Mesh, superClass);

    function Mesh(options) {
      this.options = options;
      Mesh.__super__.constructor.call(this, new THREE.BufferGeometry(), this.options.engine.scene.modelMaterial);
      this.geometry.addAttribute('position', this.options.positionAttribute);
      this.geometry.addAttribute('color', this.options.colorAttribute);
      this.geometry.setIndex(new THREE.BufferAttribute(this.options.elements, 1));
      this._updateGeometry();
      this.options.model.add(this);
      this.options.engine.scene.addMesh(this);
      this.options.engine.renderingControls.addMesh(this.options.name, this);
    }

    Mesh.prototype._updateGeometry = function() {
      this.geometry.computeVertexNormals();
      this.geometry.computeBoundingSphere();
      this.geometry.computeBoundingBox();
      return this.options.engine.scene.acommodateMeshBounds(this);
    };

    Mesh.prototype.showFrame = function() {
      var ref, showSurface, showWireframe;
      showSurface = this.renderingControls.surface.value;
      showWireframe = this.renderingControls.wireframe.value;
      if (showWireframe && !this.wireframeMesh) {
        this.wireframeMesh = new THREE.Mesh(this.geometry, this.options.engine.scene.wireframeMaterial);
        this.options.model.add(this.wireframeMesh);
      }
      this.visible = showSurface;
      if ((ref = this.wireframeMesh) != null) {
        ref.visible = showWireframe;
      }
      return this.geometry.computeVertexNormals();
    };

    return Mesh;

  })(THREE.Mesh);

}).call(this);

//# sourceMappingURL=mesh.js.map