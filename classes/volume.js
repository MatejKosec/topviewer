// Generated by CoffeeScript 1.12.4
(function() {
  'use strict';
  TopViewer.Volume = (function() {
    function Volume(options) {
      var a, addLine, connectivity, floatElements, height, i, isosurfaceMaterial, isosurfacesGeometry, j, k, l, lineVertexIndex, linesCount, m, masterIndexArray, masterIndexAttribute, ref, ref1, ref2, ref3, tetraCount, tetraHeight, tetraWidth, width, wireframeGeometry;
      this.options = options;
      height = this.options.model.basePositionsTexture.image.height;
      width = this.options.model.basePositionsTexture.image.width;
      debugger;
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
      debugger;
      masterIndexArray = new Float32Array(linesCount * 2);
      lineVertexIndex = 0;
      for (a in connectivity) {
        if (!connectivity[a]) {
          continue;
        }
        for (i = k = 0, ref1 = connectivity[a].length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          masterIndexArray[lineVertexIndex] = parseInt(a);
          masterIndexArray[lineVertexIndex + 1] = connectivity[a][i];
          lineVertexIndex += 2;
        }
      }
      masterIndexAttribute = new THREE.BufferAttribute(masterIndexArray, 1);
      wireframeGeometry.addAttribute("masterIndex", masterIndexAttribute);
      this.wireframeMesh.material.uniforms.bufferTextureHeight.value = height;
      this.wireframeMesh.material.uniforms.bufferTextureWidth.value = width;
      debugger;
      wireframeGeometry.setDrawRange(0, lineVertexIndex);
      isosurfaceMaterial = new TopViewer.IsosurfaceMaterial(this);
      this.options.model.isosurfaceMaterials.push(isosurfaceMaterial);
      log('Created new isosurfaces material');
      isosurfacesGeometry = new THREE.BufferGeometry();
      this.isosurfacesMesh = new THREE.Mesh(isosurfacesGeometry, isosurfaceMaterial);
      this.isosurfacesMesh.receiveShadows = true;
      debugger;
      tetraHeight = 1;
      tetraWidth = this.options.model.maxTextureWidth;
      while (this.options.elements.length / 4 > tetraWidth * tetraHeight) {
        tetraHeight *= 2;
      }
      if (tetraHeight > tetraWidth) {
        throw 'Too many elements to render. Failed in volume.coffee';
      }
      floatElements = new Float32Array(tetraWidth * tetraHeight * 4);
      for (i = l = 0, ref2 = this.options.elements.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        floatElements[i] = this.options.elements[i];
      }
      tetraCount = this.options.elements.length / 4;
      masterIndexArray = new Float32Array(tetraCount * 6);
      for (i = m = 0, ref3 = masterIndexArray.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        masterIndexArray[i] = i;
      }
      masterIndexAttribute = new THREE.BufferAttribute(masterIndexArray, 1);
      isosurfacesGeometry.addAttribute("masterIndex", masterIndexAttribute);
      this.isosurfacesMesh.material.uniforms.tetraTextureHeight.value = tetraHeight;
      this.isosurfacesMesh.material.uniforms.tetraTextureWidth.value = tetraWidth;
      this.isosurfacesMesh.material.uniforms.bufferTextureHeight.value = height;
      this.isosurfacesMesh.material.uniforms.bufferTextureWidth.value = width;
      this.isosurfacesMesh.material.uniforms.tetraTexture.value = new THREE.DataTexture(floatElements, tetraWidth, tetraHeight, THREE.RGBAFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
      this.isosurfacesMesh.material.uniforms.tetraTexture.value.needsUpdate = true;
      this.isosurfacesMesh.material.uniforms.basePositionsTexture.value = this.options.model.basePositionsTexture;
      isosurfacesGeometry.setDrawRange(0, tetraCount * 6);
      debugger;
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
      mesh.geometry.boundingBox = model.boundingBox;
      return mesh.geometry.boundingSphere = model.boundingSphere;
    };

    Volume.prototype.showFrame = function() {
      if (!this.renderingControls) {
        this.wireframeMesh.visible = false;
        this.isosurfacesMesh.visible = false;
        return;
      }
      this.wireframeMesh.visible = this.renderingControls.showWireframeControl.value();
      return this.isosurfacesMesh.visible = this.renderingControls.showIsosurfacesControl.value();
    };

    return Volume;

  })();

}).call(this);

//# sourceMappingURL=volume.js.map
