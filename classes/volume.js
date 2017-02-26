// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  TopViewer.Volume = (function() {
    function Volume(options) {
      var a, addLine, connectivity, height, i, isosurfacesGeometry, j, k, lineVertexIndex, linesCount, ref, ref1, setVertexIndexCoordinates, wireframeGeometry, wireframeIndexArray, wireframeIndexAttribute;
      this.options = options;
      height = this.options.model.basePositionsTexture.image.height;
      setVertexIndexCoordinates = function(attribute, i, index) {
        attribute.setX(i, index % 4096 / 4096);
        return attribute.setY(i, Math.floor(index / 4096) / height);
      };

      /*
       * Create the wireframe mesh (each element is composed of 6 edges), and each edge needs two entries
      wireframeIndexArray = new Uint32Array @options.elements.length/4*6*2
      #In order to have 32 and 64 bit datatypes (reason explained below), the integer indexes are read as floats
      #To check whether the edge is present 2 consecutive 32bit integrers (or floats should be check (i.e. 1 64 bit integer)
      #Because, js doesn't do 2D typed arrays, it needs to be tricked by casting the 32bit uints into 32bit uints
      wireframeIndexArray64 = new Float64Array wireframeIndexArray.buffer #this will use the same data as the 32 bit array
      #When adding lines, make sure smaller index is always first, so that a,b records the same way as b,a
      #so that edges can be recorded uniquely
      
      #Create a buffer geometry
      wireframeGeometry = new THREE.BufferGeometry()
      #Line segments will use GL_LINES to connect 2 consecutive indexes in gl_Position (shader code)
      @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial
       */
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
      debugger;
      for (i = j = 0, ref = this.options.elements.length / 4; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        addLine(this.options.elements[i * 4], this.options.elements[i * 4 + 1]);
        addLine(this.options.elements[i * 4 + 1], this.options.elements[i * 4 + 2]);
        addLine(this.options.elements[i * 4 + 2], this.options.elements[i * 4]);
        addLine(this.options.elements[i * 4], this.options.elements[i * 4 + 3]);
        addLine(this.options.elements[i * 4 + 1], this.options.elements[i * 4 + 3]);
        addLine(this.options.elements[i * 4 + 2], this.options.elements[i * 4 + 3]);
      }
      debugger;
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
      debugger;
      wireframeGeometry.addAttribute('vertexIndex', wireframeIndexAttribute);
      wireframeGeometry.setDrawRange(0, linesCount * 2);

      /*
          wireframeGeometry = new THREE.BoxGeometry  1, 1, 1
          @wireframeMesh = new THREE.Mesh wireframeGeometry, new THREE.MeshBasicMaterial  { color: 0x00ff00 }
       */

      /*
      connectivity = []
      linesCount = 0
      
      addLine = (a, b) ->
        [a, b] = [b, a] if a > b
      
        connectivity[a] ?= {}
        unless connectivity[a][b]
          connectivity[a][b] = true
          linesCount++
      
      for i in [0...@options.elements.length/4]
        addLine(@options.elements[i*4], @options.elements[i*4+1])
        addLine(@options.elements[i*4+1], @options.elements[i*4+2])
        addLine(@options.elements[i*4+2], @options.elements[i*4])
        addLine(@options.elements[i*4], @options.elements[i*4+3])
        addLine(@options.elements[i*4+1], @options.elements[i*4+3])
        addLine(@options.elements[i*4+2], @options.elements[i*4+3])
      debugger
      wireframeGeometry = new THREE.BufferGeometry()
      @wireframeMesh = new THREE.LineSegments wireframeGeometry, @options.model.volumeWireframeMaterial
      
      wireframeIndexArray = new Float32Array linesCount * 4
      wireframeIndexAttribute = new THREE.BufferAttribute wireframeIndexArray, 2
      
      lineVertexIndex = 0
      for a in [0...connectivity.length]
        continue unless connectivity[a]
      
        for b of connectivity[a]
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex, a)
          setVertexIndexCoordinates(wireframeIndexAttribute, lineVertexIndex + 1, b)
          lineVertexIndex += 2
      
      wireframeGeometry.addAttribute 'vertexIndex', wireframeIndexAttribute
      wireframeGeometry.drawRange.count = linesCount * 2
      
      wireframeGeometry = new THREE.BoxGeometry  1, 1, 1
      @wireframeMesh = new THREE.Mesh wireframeGeometry, new THREE.MeshBasicMaterial  { color: 0x00ff00 }
       */

      /*
       * Create the isosurfaces mesh.
      isosurfacesGeometry = new THREE.BufferGeometry()
      @isosurfacesMesh = new THREE.Mesh isosurfacesGeometry, @options.model.isosurfaceMaterial
      @isosurfacesMesh.receiveShadows = true
      
      tetraCount = @options.elements.length / 4
      
       * Each isosurface vertex needs access to all four tetra vertices.
      for i in [0..3]
         * The format of the array is, for each tetra: 6 * v[i]_x, v[i]_y
        isosurfacesIndexArray = new Float32Array tetraCount * 12
        isosurfacesIndexAttribute = new THREE.BufferAttribute isosurfacesIndexArray, 2
      
         * Add each tetra vertex (first, second, third or fourth, depending on i) to all 6 isovertices.
        for j in [0...tetraCount]
          for k in [0...6]
            setVertexIndexCoordinates(isosurfacesIndexAttribute, j*6+k, @options.elements[j * 4 + i])
      
        isosurfacesGeometry.addAttribute "vertexIndexCorner#{i+1}", isosurfacesIndexAttribute
      
       * We also need to tell the vertices what their index is and if they are part of the main or additional face.
      isosurfacesCornerIndexArray = new Float32Array tetraCount * 6
      isosurfacesCornerIndexAttribute = new THREE.BufferAttribute isosurfacesCornerIndexArray, 1
      
      for i in [0...tetraCount]
        for k in [0...6]
          isosurfacesCornerIndexArray[i * 6 + k] = k * 0.1
      
      isosurfacesGeometry.addAttribute "cornerIndex", isosurfacesCornerIndexAttribute
      
      isosurfacesGeometry.drawRange.count = tetraCount * 6
       */
      isosurfacesGeometry = new THREE.BoxGeometry(1, 1, 1);
      this.isosurfacesMesh = new THREE.Mesh(isosurfacesGeometry, new THREE.MeshBasicMaterial({
        color: 0x00ff00
      }));
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
      this.wireframeMesh.visible = true;
      return this.isosurfacesMesh.visible = this.renderingControls.showIsosurfacesControl.value();
    };

    return Volume;

  })();

}).call(this);

//# sourceMappingURL=volume.js.map
