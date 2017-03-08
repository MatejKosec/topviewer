// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  TopViewer.Volume = (function() {
    function Volume(options) {
      var a, addLine, connectivity, height, i, isosurfacesGeometry, j, k, l, lineVertexIndex, linesCount, masterIndexArray, masterIndexAttribute, ref, ref1, ref2, setVertexIndexCoordinates, tetraCount, tetraHeight, wireframeGeometry, wireframeIndexArray, wireframeIndexAttribute;
      this.options = options;
      height = this.options.model.basePositionsTexture.image.height;
      setVertexIndexCoordinates = function(attribute, i, index) {
        attribute.setX(i, index % 4096 / 4096);
        return attribute.setY(i, Math.floor(index / 4096) / height);
      };
      connectivity = [];
      linesCount = 0;
      addLine = function(a, b) {
        var ref;
        if (a > b) {
          ref = [b, a], a = ref[0], b = ref[1];
        }
        if (connectivity[a] == null) {
          connectivity[a] = [];
        }
        if (connectivity[a].indexOf(b) === -1) {
          connectivity[a].push(b);
          return linesCount++;
        }
      };
      for (i = j = 0, ref = this.options.elements.length / 4; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        addLine(this.options.elements[i * 4], this.options.elements[i * 4 + 1]);
        addLine(this.options.elements[i * 4 + 1], this.options.elements[i * 4 + 2]);
        addLine(this.options.elements[i * 4 + 2], this.options.elements[i * 4]);
        addLine(this.options.elements[i * 4], this.options.elements[i * 4 + 3]);
        addLine(this.options.elements[i * 4 + 1], this.options.elements[i * 4 + 3]);
        addLine(this.options.elements[i * 4 + 2], this.options.elements[i * 4 + 3]);
      }
      wireframeGeometry = new THREE.BufferGeometry();
      this.wireframeMesh = new THREE.LineSegments(wireframeGeometry, this.options.model.volumeWireframeMaterial);
      wireframeIndexArray = new Float32Array(linesCount * 4);
      wireframeIndexAttribute = new THREE.BufferAttribute(wireframeIndexArray, 2);
      lineVertexIndex = 0;
      for (a in connectivity) {
        if (!connectivity[a]) {
          continue;
        }
        for (i = k = 0, ref1 = connectivity[a].length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, parseInt(a));
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, connectivity[a][i]);
          lineVertexIndex += 2;
        }
      }
      wireframeGeometry.addAttribute('vertexIndex', wireframeIndexAttribute);
      wireframeGeometry.setDrawRange(0, linesCount * 2);
      isosurfacesGeometry = new THREE.BufferGeometry();
      this.isosurfacesMesh = new THREE.Mesh(isosurfacesGeometry, this.options.model.isosurfaceMaterial);
      this.isosurfacesMesh.receiveShadows = true;
      tetraHeight = 1;
      while (this.options.elements.length / 4 > 4096 * tetraHeight) {
        tetraHeight *= 2;
      }
      this.options.model.tetraTexture = new THREE.DataTexture(this.options.elements, 4096, tetraHeight, THREE.RGBAFormat, THREE.UnsignedIntType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
      this.options.model.tetraTexture.needsUpdate = true;
      debugger;
      this.options.model.isosurfaceMaterial.uniforms.tetraTextureHeight.value = tetraHeight;
      this.options.model.isosurfaceMaterial.uniforms.bufferTextureHeight.value = height;
      tetraCount = this.options.elements.length / 4;
      masterIndexArray = new Float32Array(tetraCount * 6);
      for (i = l = 0, ref2 = masterIndexArray.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        masterIndexArray[i] = i;
      }
      masterIndexAttribute = new THREE.BufferAttribute(masterIndexArray, 1);
      isosurfacesGeometry.addAttribute("masterIndex", masterIndexAttribute);
      isosurfacesGeometry.setDrawRange(0, tetraCount * 6);
      this._updateGeometry();
      this.options.model.add(this.isosurfacesMesh);
      this.options.model.add(this.wireframeMesh);
      this.options.engine.renderingControls.addVolume(this.options.name, this);
    }

    Volume.prototype._updateGeometry = function() {
      this._updateBounds(this.wireframeMesh, this.options.model);
      return this._updateBounds(this.isosurfacesMesh, this.options.model);
    };

    Volume.prototype._updateBounds = function(mesh, model) {
      mesh.geometry.boundingBox = this.options.model.boundingBox;
      return mesh.geometry.boundingSphere = this.options.model.boundingSphere;
    };

    Volume.prototype.showFrame = function() {
      if (!this.renderingControls) {
        this.wireframeMesh.visible = false;
        this.isosurfacesMesh.visible = false;
        return;
      }
      this.wireframeMesh.visible = this.renderingControls.showWireframeControl.value();
      return this.isosurfacesMesh.visible = true;
    };

    return Volume;

  })();

}).call(this);

//# sourceMappingURL=volume.js.map
