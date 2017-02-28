// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.Mesh = (function(superClass) {
    var faceCount, i, isolinesGeometry, isolinesIndexArray, isolinesIndexAttribute, isolinesTypeArray, isolinesTypeAttribute, j, k, l, m, n, o, ref, ref1;

    extend(Mesh, superClass);

    function Mesh(options) {
      var a, addLine, baseIndex, connectivity, cornerInTriangle, cornerIndexArray, cornerIndexAttribute, height, i, indexArrays, indexAttributes, j, l, lineVertexIndex, linesCount, m, n, o, p, ref, ref1, ref2, setVertexIndexCoordinates, wireframeGeometry, wireframeIndexArray, wireframeIndexAttribute;
      this.options = options;
      Mesh.__super__.constructor.call(this, new THREE.BufferGeometry(), this.options.model.material);
      indexArrays = [];
      indexAttributes = [];
      for (i = l = 0; l <= 2; i = ++l) {
        indexArrays[i] = new Float32Array(this.options.elements.length * 2);
        indexAttributes[i] = new THREE.BufferAttribute(indexArrays[i], 2);
      }
      cornerIndexArray = new Float32Array(this.options.elements.length);
      cornerIndexAttribute = new THREE.BufferAttribute(cornerIndexArray, 1);
      height = this.options.model.basePositionsTexture.image.height;
      setVertexIndexCoordinates = function(attribute, i, index) {
        attribute.setX(i, index % 4096 / 4096);
        return attribute.setY(i, Math.floor(index / 4096) / height);
      };
      for (i = m = 0, ref = this.options.elements.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        cornerInTriangle = i % 3;
        cornerIndexArray[i] = cornerInTriangle * 0.1;
        baseIndex = Math.floor(i / 3) * 3;
        for (j = n = 0; n <= 2; j = ++n) {
          setVertexIndexCoordinates(indexAttributes[j], i, this.options.elements[baseIndex + j]);
        }
      }
      this.geometry.addAttribute('vertexIndexCorner1', indexAttributes[0]);
      this.geometry.addAttribute('vertexIndexCorner2', indexAttributes[1]);
      this.geometry.addAttribute('vertexIndexCorner3', indexAttributes[2]);
      this.geometry.addAttribute('cornerIndex', cornerIndexAttribute);
      this.geometry.drawRange.count = this.options.elements.length;
      this.backsideMesh = new THREE.Mesh(this.geometry, this.options.model.backsideMaterial);
      this.customDepthMaterial = this.options.model.shadowMaterial;
      this.backsideMesh.customDepthMaterial = this.options.model.shadowMaterial;
      connectivity = [];
      linesCount = 0;
      addLine = function(a, b) {
        var ref1;
        if (a > b) {
          ref1 = [b, a], a = ref1[0], b = ref1[1];
        }
        if (connectivity[a] == null) {
          connectivity[a] = [];
        }
        if (connectivity[a].indexOf(b) === -1) {
          connectivity[a].push(b);
          return linesCount++;
        }
      };
      for (i = o = 0, ref1 = this.options.elements.length / 3; 0 <= ref1 ? o < ref1 : o > ref1; i = 0 <= ref1 ? ++o : --o) {
        addLine(this.options.elements[i * 3], this.options.elements[i * 3 + 1]);
        addLine(this.options.elements[i * 3 + 1], this.options.elements[i * 3 + 2]);
        addLine(this.options.elements[i * 3 + 2], this.options.elements[i * 3]);
      }
      wireframeGeometry = new THREE.BufferGeometry();
      this.wireframeMesh = new THREE.LineSegments(wireframeGeometry, this.options.model.wireframeMaterial);
      wireframeIndexArray = new Float32Array(linesCount * 4);
      wireframeIndexAttribute = new THREE.BufferAttribute(wireframeIndexArray, 2);
      lineVertexIndex = 0;
      for (a in connectivity) {
        if (!connectivity[a]) {
          continue;
        }
        for (i = p = 0, ref2 = connectivity[a].length; 0 <= ref2 ? p < ref2 : p > ref2; i = 0 <= ref2 ? ++p : --p) {
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, parseInt(a));
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, connectivity[a][i]);
          lineVertexIndex += 2;
        }
      }
      wireframeGeometry.addAttribute('vertexIndex', wireframeIndexAttribute);
      wireframeGeometry.setDrawRange(0, linesCount * 2);
    }

    isolinesGeometry = new THREE.BufferGeometry();

    Mesh.isolinesMesh = new THREE.LineSegments(isolinesGeometry, Mesh.options.model.isolineMaterial);

    faceCount = Mesh.options.elements.length / 3;

    for (i = l = 0; l <= 2; i = ++l) {
      isolinesIndexArray = new Float32Array(faceCount * 4);
      isolinesIndexAttribute = new THREE.BufferAttribute(isolinesIndexArray, 2);
      for (j = m = 0, ref = faceCount; 0 <= ref ? m < ref : m > ref; j = 0 <= ref ? ++m : --m) {
        for (k = n = 0; n < 2; k = ++n) {
          setVertexIndexCoordinates(isolinesIndexAttribute, j * 2 + k, Mesh.options.elements[j * 3 + i]);
        }
      }
      isolinesGeometry.addAttribute("vertexIndexCorner" + (i + 1), isolinesIndexAttribute);
    }

    isolinesTypeArray = new Float32Array(faceCount * 2);

    isolinesTypeAttribute = new THREE.BufferAttribute(isolinesTypeArray, 1);

    for (i = o = 0, ref1 = faceCount; 0 <= ref1 ? o < ref1 : o > ref1; i = 0 <= ref1 ? ++o : --o) {
      isolinesTypeArray[i * 2 + 1] = 1.0;
    }

    isolinesGeometry.addAttribute("cornerIndex", isolinesTypeAttribute);

    isolinesGeometry.drawRange.count = faceCount * 2;

    Mesh._updateGeometry();

    Mesh.options.model.add(Mesh);

    Mesh.options.model.add(Mesh.backsideMesh);

    Mesh.options.model.add(Mesh.wireframeMesh);

    Mesh.options.model.add(Mesh.isolinesMesh);

    Mesh.options.engine.renderingControls.addMesh(Mesh.options.name, Mesh);

    return Mesh;

  })(THREE.Mesh);

  ({
    _updateGeometry: function() {
      this._updateBounds(this, this.options.model);
      this._updateBounds(this.backsideMesh, this.options.model);
      this._updateBounds(this.wireframeMesh, this.options.model);
      return this._updateBounds(this.isolinesMesh, this.options.model);
    },
    _updateBounds: function(mesh, model) {
      mesh.geometry.boundingBox = this.options.model.boundingBox;
      return mesh.geometry.boundingSphere = this.options.model.boundingSphere;
    },
    showFrame: function() {
      var enableShadows;
      if (!this.renderingControls) {
        this.visible = false;
        this.backsideMesh.visible = false;
        this.wireframeMesh.visible = false;
        this.isolinesMesh.visible = false;
        return;
      }
      if (this.renderingControls.showSurfaceControl.value()) {
        this.visible = true;
        switch (this.options.engine.renderingControls.meshesSurfaceSidesControl.value) {
          case TopViewer.RenderingControls.MeshSurfaceSides.DoubleQuality:
            this.backsideMesh.visible = true;
            break;
          default:
            this.backsideMesh.visible = false;
        }
      } else {
        this.visible = false;
        this.backsideMesh.visible = false;
      }
      this.wireframeMesh.visible = this.renderingControls.showWireframeControl.value();
      this.isolinesMesh.visible = this.renderingControls.showIsolinesControl.value();
      enableShadows = this.options.engine.renderingControls.shadowsControl.value();
      this.castShadow = enableShadows;
      this.receiveShadows = enableShadows;
      this.backsideMesh.castShadow = enableShadows;
      return this.backsideMesh.receiveShadows = enableShadows;
    }
  });

}).call(this);

//# sourceMappingURL=mesh.js.map
