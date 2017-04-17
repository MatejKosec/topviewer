// Generated by CoffeeScript 1.12.4
(function() {
  'use strict';
  TopViewer.Volume = (function() {
    function Volume(options) {
      var a, addLine, connectivity, cornerIndexArray, cornerIndexAttribute, height, i, index, isosurfaceMaterial, isosurfacesGeometry, isosurfacesMesh, j, k, ks, l, lineVertexIndex, linesCount, localTetraCount, m, n, o, p, ref, ref1, ref2, ref3, ref4, ref5, ref6, setVertexIndexCoordinates, tetraAccessArray, tetraAccessAttribute, tetraCount, tetraHeight, tetraSplits, tetraTextureArray_X, tetraTextureArray_Y, tetraWidth, vertexIndexArray, vertexIndexAttribute, width, wireframeGeometry;
      this.options = options;
      height = this.options.model.basePositionsTexture.image.height;
      width = this.options.model.basePositionsTexture.image.width;
      debugger;
      connectivity = [];
      linesCount = 0;
      setVertexIndexCoordinates = function(attribute, i, index, width, height) {
        attribute.setX(i, index % width / width);
        return attribute.setY(i, Math.floor(index / width) / height);
      };
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
      vertexIndexArray = new Float32Array(linesCount * 4);
      vertexIndexAttribute = new THREE.BufferAttribute(vertexIndexArray, 2);
      lineVertexIndex = 0;
      for (a in connectivity) {
        if (!connectivity[a]) {
          continue;
        }
        for (i = k = 0, ref1 = connectivity[a].length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          setVertexIndexCoordinates(vertexIndexAttribute, lineVertexIndex, parseInt(a), width, height);
          setVertexIndexCoordinates(vertexIndexAttribute, lineVertexIndex + 1, connectivity[a][i], width, height);
          lineVertexIndex += 2;
        }
      }
      wireframeGeometry.addAttribute("vertexIndex", vertexIndexAttribute);
      this.wireframeMesh.material.uniforms.bufferTextureHeight.value = height;
      this.wireframeMesh.material.uniforms.bufferTextureWidth.value = width;
      debugger;
      wireframeGeometry.setDrawRange(0, lineVertexIndex);
      this.isosurfaceMeshes = [];
      tetraCount = this.options.elements.length / 4;
      debugger;
      tetraHeight = 1;
      tetraWidth = this.options.model.maxTextureWidth;
      while (this.options.elements.length / 4 > tetraWidth * tetraHeight) {
        tetraHeight *= 2;
      }
      if (tetraHeight > tetraWidth) {
        throw 'Too many elements to render. Failed in volume.coffee';
      }
      tetraTextureArray_X = new Float32Array(tetraWidth * tetraHeight * 4);
      for (i = l = 0, ref2 = this.options.elements.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        tetraTextureArray_X[i] = (this.options.elements[i] % width) / width;
      }
      tetraTextureArray_Y = new Float32Array(tetraWidth * tetraHeight * 4);
      for (i = m = 0, ref3 = this.options.elements.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        tetraTextureArray_Y[i] = Math.floor(this.options.elements[i] / width) / height;
      }
      tetraSplits = Math.ceil(tetraCount / 20000000);
      log('ts', tetraSplits);
      for (ks = n = 0, ref4 = tetraSplits; 0 <= ref4 ? n < ref4 : n > ref4; ks = 0 <= ref4 ? ++n : --n) {
        log('ks', ks);
        isosurfaceMaterial = new TopViewer.IsosurfaceMaterial(this);
        this.options.model.isosurfaceMaterials.push(isosurfaceMaterial);
        isosurfacesGeometry = new THREE.BufferGeometry();
        isosurfacesMesh = new THREE.Mesh(isosurfacesGeometry, isosurfaceMaterial);
        isosurfacesMesh.receiveShadows = true;
        this.isosurfaceMeshes.push(isosurfacesMesh);
        if (ks === tetraSplits - 1) {
          localTetraCount = tetraCount - ks * 20000000;
        } else {
          localTetraCount = 20000000;
        }
        log(localTetraCount);
        tetraAccessArray = new Float32Array(localTetraCount * 12);
        tetraAccessAttribute = new THREE.BufferAttribute(tetraAccessArray, 2);
        cornerIndexArray = new Float32Array(localTetraCount * 6);
        cornerIndexAttribute = new THREE.BufferAttribute(cornerIndexArray, 1);
        debugger;
        for (i = o = 0, ref5 = tetraAccessArray.length / 2; 0 <= ref5 ? o < ref5 : o > ref5; i = 0 <= ref5 ? ++o : --o) {
          index = Math.floor((i + ks * 20000000) / 6.0);
          setVertexIndexCoordinates(tetraAccessAttribute, i, index, tetraWidth, tetraHeight);
          cornerIndexArray[i] = (i % 6.0) * 0.1;
        }
        isosurfacesGeometry.addAttribute("tetraAccess", tetraAccessAttribute);
        isosurfacesGeometry.addAttribute("cornerIndex", cornerIndexAttribute);
        isosurfacesMesh.material.uniforms.tetraTextureHeight.value = tetraHeight;
        isosurfacesMesh.material.uniforms.tetraTextureWidth.value = tetraWidth;
        isosurfacesMesh.material.uniforms.bufferTextureHeight.value = height;
        isosurfacesMesh.material.uniforms.bufferTextureWidth.value = width;
        isosurfacesMesh.material.uniforms.tetraTextureX.value = new THREE.DataTexture(tetraTextureArray_X, tetraWidth, tetraHeight, THREE.RGBAFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
        isosurfacesMesh.material.uniforms.tetraTextureY.value = new THREE.DataTexture(tetraTextureArray_Y, tetraWidth, tetraHeight, THREE.RGBAFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
        isosurfacesMesh.material.uniforms.tetraTextureX.value.needsUpdate = true;
        isosurfacesMesh.material.uniforms.tetraTextureY.value.needsUpdate = true;
        isosurfacesMesh.material.uniforms.basePositionsTexture.value = this.options.model.basePositionsTexture;
        isosurfacesGeometry.setDrawRange(0, localTetraCount * 6);
      }
      debugger;
      this._updateGeometry();
      for (i = p = 0, ref6 = this.isosurfaceMeshes.length; 0 <= ref6 ? p < ref6 : p > ref6; i = 0 <= ref6 ? ++p : --p) {
        this.options.model.add(this.isosurfaceMeshes[i]);
      }
      this.options.model.add(this.wireframeMesh);
      this.options.engine.renderingControls.addVolume(this.options.name, this);
    }

    Volume.prototype._updateGeometry = function() {
      var i, j, ref, results;
      this._updateBounds(this.wireframeMesh, this.options.model);
      results = [];
      for (i = j = 0, ref = this.isosurfaceMeshes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(this._updateBounds(this.isosurfaceMeshes[i], this.options.model));
      }
      return results;
    };

    Volume.prototype._updateBounds = function(mesh, model) {
      mesh.geometry.boundingBox = model.boundingBox;
      return mesh.geometry.boundingSphere = model.boundingSphere;
    };

    Volume.prototype.showFrame = function() {
      var i, j, k, ref, ref1, results;
      if (!this.renderingControls) {
        this.wireframeMesh.visible = false;
        for (i = j = 0, ref = this.isosurfaceMeshes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          this.isosurfaceMeshes[i].visible = false;
        }
        return;
      }
      this.wireframeMesh.visible = this.renderingControls.showWireframeControl.value();
      results = [];
      for (i = k = 0, ref1 = this.isosurfaceMeshes.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(this.isosurfaceMeshes[i].visible = this.renderingControls.showIsosurfacesControl.value());
      }
      return results;
    };

    return Volume;

  })();

}).call(this);

//# sourceMappingURL=volume.js.map
