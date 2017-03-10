// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';

  /*
  
    HOW TOP VIEWER SHADERS WORK
  
    Traditional way to render 3D models is to have a vertex buffer that holds positions of all vertices and an index
    buffer that tells which vertices the triangles are made out of.
  
    We, however, need to be able to create dynamic geometry for isolines and isosurfaces that depends on data from
    multiple vertices. For example, depending on a scalar value at two vertices of a mesh triangle, we will draw an
    isoline starting somewhere in the middle of the two vertices. To achieve this "random-access" behavior, we need
    to be able to address data from multiple vertices per each vertex.
  
    Under the traditional way, each index in the index buffer tells which vertex data to use. In our way, there is no
    traditional index buffer. Instead, index is stored in a vertex attribute, while vertex data (such as position or
    scalar value) are stored in data textures. Instead of thinking about fixed model vertices, each vertex in our system
    represents a dynamic vertex that can rely on multiple model vertices. The index, stored in an attribute, tells which
    vertex that is. If we need to access data from multiple vertices, we have multiple attributes. In the simplest case
    though, one index attribute simply points to the single data location, just like with a normal index buffer.
  
    Vertex data in the textures is stored in one of the 4096x4096 pixels with r/g/b components storing data, for example
    the x/y/z coordinates of the vertex, displacement vectors or scalar data. This allows us to display models with up to
    16 million vertices. Instead of a normal numerical index, index is broken to two components, the texture coordinates
    at which the vertex is located. The top row holds vertices 0-4095, second row vertices 4096-8191 and so on.
   */
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.Model = (function(superClass) {
    extend(Model, superClass);

    Model.noScalarsTexture = new THREE.DataTexture(new Float32Array(4096 * 4096), 4096, 4096, THREE.AlphaFormat, THREE.FloatType);

    Model.noScalarsTexture.needsUpdate = true;

    Model.noDisplacementsTexture = new THREE.DataTexture(new Float32Array(4096 * 4096 * 3), 4096, 4096, THREE.RGBFormat, THREE.FloatType);

    Model.noDisplacementsTexture.needsUpdate = true;

    Model.noCurveTexture = new THREE.DataTexture(new Float32Array(4096), 4096, 1, THREE.AlphaFormat, THREE.FloatType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);

    Model.noCurveTexture.needsUpdate = true;

    function Model(options) {
      var height, i, j, k, l, ref;
      this.options = options;
      Model.__super__.constructor.apply(this, arguments);
      debugger;
      this.matrixAutoUpdate = false;
      this.nodes = this.options.nodes;
      this.meshes = {};
      this.volumes = {};
      this.scalars = {};
      this.vectors = {};
      this.frames = [
        {
          frameTime: -1
        }
      ];
      this.boundingBox = new THREE.Box3;
      height = 1;
      while (this.nodes.length / 3 > 4096 * height) {
        height *= 2;
      }
      this.basePositions = new Float32Array(4096 * height * 3);
      for (i = k = 0, ref = this.nodes.length / 3; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        for (j = l = 0; l <= 2; j = ++l) {
          this.basePositions[i * 3 + j] = this.nodes[i * 3 + j];
        }
        this.boundingBox.expandByPoint(new THREE.Vector3(this.nodes[i * 3], this.nodes[i * 3 + 1], this.nodes[i * 3 + 2]));
      }
      this.boundingSphere = this.boundingBox.getBoundingSphere();
      this.basePositionsTexture = new THREE.DataTexture(this.basePositions, 4096, height, THREE.RGBFormat, THREE.FloatType);
      this.basePositionsTexture.needsUpdate = true;
      this.material = new TopViewer.ModelMaterial(this);
      this.backsideMaterial = new TopViewer.ModelMaterial(this);
      this.backsideMaterial.side = THREE.BackSide;
      this.backsideMaterial.uniforms.lightingNormalFactor.value = -1;
      this.shadowMaterial = new TopViewer.ShadowMaterial(this);
      this.wireframeMaterial = new TopViewer.WireframeMaterial(this);
      this.isolineMaterial = new TopViewer.IsolineMaterial(this);
      this.volumeWireframeMaterial = new TopViewer.WireframeMaterial(this);
      this.isosurfaceMaterial = new TopViewer.IsosurfaceMaterial(this);
      this.fieldMaterial = new TopViewer.FieldMaterial(this);
      this.colorScalar = null;
      if (this.nodes.length) {
        this.options.engine.scene.addModel(this);
      }
      this._updateFrames();
      this._currentVectorFrames = {};
    }

    Model.prototype.addElements = function(elementsName, elementsType, elements) {
      var collection, constructor;
      switch (elementsType) {
        case 4:
          collection = this.meshes;
          constructor = TopViewer.Mesh;
          break;
        case 5:
          collection = this.volumes;
          constructor = TopViewer.Volume;
          break;
        default:
          console.error("UNKNOWN ELEMENT TYPE", elementsType);
          return;
      }
      return collection[elementsName] = new constructor({
        name: elementsName,
        elements: elements,
        model: this,
        engine: this.options.engine
      });
    };

    Model.prototype.addScalar = function(scalarName, scalar) {
      var array, frame, height, i, k, l, len, len1, m, ref, ref1, ref2, results;
      if (this.scalars[scalarName]) {
        ref = scalar.frames;
        for (k = 0, len = ref.length; k < len; k++) {
          frame = ref[k];
          this.scalars[scalarName].frames.push(frame);
        }
        this.scalars[scalarName].renderingControls.curveTransformControl.updateHistogram();
      } else {
        this.scalars[scalarName] = scalar;
        this.options.engine.renderingControls.addScalar(scalarName, scalar);
      }
      this._updateFrames();
      ref1 = scalar.frames;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        frame = ref1[l];
        height = 1;
        while (frame.scalars.length > 4096 * height) {
          height *= 2;
        }
        array = new Float32Array(4096 * height);
        for (i = m = 0, ref2 = frame.scalars.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
          array[i] = frame.scalars[i];
        }
        frame.texture = new THREE.DataTexture(array, 4096, height, THREE.AlphaFormat, THREE.FloatType);
        results.push(frame.texture.needsUpdate = true);
      }
      return results;
    };

    Model.prototype.addVector = function(vectorName, vector) {
      var array, frame, height, i, k, l, len, len1, m, ref, ref1, ref2, results;
      if (this.vectors[vectorName]) {
        ref = vector.frames;
        for (k = 0, len = ref.length; k < len; k++) {
          frame = ref[k];
          this.vectors[vectorName].options.vector.frames.push(frame);
        }
      } else {
        this.vectors[vectorName] = new TopViewer.Vector({
          name: vectorName,
          vector: vector,
          model: this,
          engine: this.options.engine
        });
        this.vectors[vectorName].frames = vector.frames;
        this.options.engine.renderingControls.addVector(vectorName, vector);
      }
      this._updateFrames();
      ref1 = vector.frames;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        frame = ref1[l];
        height = 1;
        while (frame.vectors.length / 3 > 4096 * height) {
          height *= 2;
        }
        array = new Float32Array(4096 * height * 3);
        for (i = m = 0, ref2 = frame.vectors.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
          array[i] = frame.vectors[i];
        }
        frame.texture = new THREE.DataTexture(array, 4096, height, THREE.RGBFormat, THREE.FloatType);
        results.push(frame.texture.needsUpdate = true);
      }
      return results;
    };

    Model.prototype._updateFrames = function() {
      var frame, frameTime, frameTimes, i, k, l, len, len1, len2, len3, m, n, newFrame, o, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, results, scalar, scalarFrame, scalarName, vector, vectorFrame, vectorName;
      frameTimes = [];
      ref = this.scalars;
      for (scalarName in ref) {
        scalar = ref[scalarName];
        ref1 = scalar.frames;
        for (k = 0, len = ref1.length; k < len; k++) {
          frame = ref1[k];
          frameTimes = _.union(frameTimes, [parseFloat(frame.time)]);
        }
      }
      ref2 = this.vectors;
      for (vectorName in ref2) {
        vector = ref2[vectorName];
        ref3 = vector.frames;
        for (l = 0, len1 = ref3.length; l < len1; l++) {
          frame = ref3[l];
          frameTimes = _.union(frameTimes, [parseFloat(frame.time)]);
        }
      }
      frameTimes.sort(function(a, b) {
        return a - b;
      });
      this.options.engine.animation.addFrameTimes(frameTimes);
      if (!frameTimes.length) {
        frameTimes.push(-1);
      }
      this.frames = [];
      results = [];
      for (m = 0, len2 = frameTimes.length; m < len2; m++) {
        frameTime = frameTimes[m];
        newFrame = {
          time: frameTime,
          scalars: [],
          vectors: []
        };
        ref4 = this.scalars;
        for (scalarName in ref4) {
          scalar = ref4[scalarName];
          for (i = n = 0, ref5 = scalar.frames.length; 0 <= ref5 ? n < ref5 : n > ref5; i = 0 <= ref5 ? ++n : --n) {
            scalarFrame = scalar.frames[i];
            if (frameTime !== scalarFrame.time) {
              continue;
            }
            newFrame.scalars.push({
              scalarName: scalarName,
              scalarFrame: scalarFrame
            });
          }
        }
        ref6 = this.vectors;
        for (vectorName in ref6) {
          vector = ref6[vectorName];
          ref7 = vector.frames;
          for (o = 0, len3 = ref7.length; o < len3; o++) {
            vectorFrame = ref7[o];
            if (frameTime !== vectorFrame.time) {
              continue;
            }
            newFrame.vectors.push({
              vectorName: vectorName,
              vectorFrame: vectorFrame
            });
          }
        }
        results.push(this.frames.push(newFrame));
      }
      return results;
    };

    Model.prototype.showFrame = function(frameTime, nextFrameTime, frameProgress) {
      var collection, displacementsTexture, displacementsTextureNext, frame, frameIndex, isovalueMaterial, isovalueMaterials, k, l, len, len1, len10, len2, len3, len4, len5, len6, len7, len8, len9, m, material, n, name, nextFrame, o, object, p, positionMaterials, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, renderingControls, results, s, scalar, scalarData, selectedScalar, surfaceMaterial, surfaceMaterials, t, testFrame, time, u, v, vector, vectorTexture, vectorTextureNext, wireframeMaterial, wireframeMaterials;
      frame = null;
      nextFrame = null;
      for (frameIndex = k = 0, ref = this.frames.length; 0 <= ref ? k < ref : k > ref; frameIndex = 0 <= ref ? ++k : --k) {
        testFrame = this.frames[frameIndex];
        time = testFrame.time;
        if (time === frameTime || time === -1) {
          frame = testFrame;
        }
        if (time === nextFrameTime || time === -1) {
          nextFrame = testFrame;
        }
      }
      this.visible = frame && this.nodes.length;
      if (!this.visible) {
        return;
      }
      if (nextFrame == null) {
        nextFrame = frame;
      }
      renderingControls = this.options.engine.renderingControls;
      positionMaterials = [this.material, this.shadowMaterial, this.wireframeMaterial, this.volumeWireframeMaterial, this.isolineMaterial, this.isosurfaceMaterial, this.fieldMaterial];
      surfaceMaterials = [
        {
          material: this.material,
          colorsControl: renderingControls.meshesSurfaceColorsControl,
          opacityControl: renderingControls.meshesSurfaceOpacityControl
        }, {
          material: this.isosurfaceMaterial,
          colorsControl: renderingControls.volumesIsosurfacesColorsControl,
          opacityControl: renderingControls.volumesIsosurfacesOpacityControl
        }
      ];
      wireframeMaterials = [
        {
          material: this.wireframeMaterial,
          colorsControl: renderingControls.meshesWireframeColorsControl,
          opacityControl: renderingControls.meshesWireframeOpacityControl
        }, {
          material: this.volumeWireframeMaterial,
          colorsControl: renderingControls.volumesWireframeColorsControl,
          opacityControl: renderingControls.volumesWireframeOpacityControl
        }, {
          material: this.fieldMaterial,
          colorsControl: renderingControls.vectorsFieldColorsControl,
          opacityControl: renderingControls.vectorsFieldOpacityControl
        }
      ];
      isovalueMaterials = [
        {
          material: this.isolineMaterial,
          scalarControl: renderingControls.meshesIsolinesScalarControl,
          colorsControl: renderingControls.meshesIsolinesColorsControl,
          opacityControl: renderingControls.meshesIsolinesOpacityControl
        }, {
          material: this.isosurfaceMaterial,
          scalarControl: renderingControls.volumesIsosurfacesScalarControl,
          colorsControl: renderingControls.volumesIsosurfacesColorsControl,
          opacityControl: renderingControls.volumesIsosurfacesOpacityControl
        }
      ];
      switch (renderingControls.meshesSurfaceSidesControl.value) {
        case TopViewer.RenderingControls.MeshSurfaceSides.SingleFront:
          this.material.side = THREE.FrontSide;
          this.material.uniforms.lightingNormalFactor.value = 1;
          break;
        case TopViewer.RenderingControls.MeshSurfaceSides.SingleBack:
          this.material.side = THREE.BackSide;
          this.material.uniforms.lightingNormalFactor.value = -1;
          break;
        case TopViewer.RenderingControls.MeshSurfaceSides.DoubleFast:
          this.material.side = THREE.DoubleSide;
          this.material.uniforms.lightingNormalFactor.value = 1;
          break;
        case TopViewer.RenderingControls.MeshSurfaceSides.DoubleQuality:
          this.material.side = THREE.FrontSide;
          this.material.uniforms.lightingNormalFactor.value = 1;
          positionMaterials.push(this.backsideMaterial);
          surfaceMaterials.push({
            material: this.backsideMaterial,
            colorsControl: renderingControls.meshesSurfaceColorsControl,
            opacityControl: renderingControls.meshesSurfaceOpacityControl
          });
      }
      displacementsTexture = this.constructor.noDisplacementsTexture;
      displacementsTextureNext = this.constructor.noDisplacementsTexture;
      ref1 = frame.vectors;
      for (l = 0, len = ref1.length; l < len; l++) {
        vector = ref1[l];
        if (this.vectors[vector.vectorName].options.vector === renderingControls.vectorsDisplacementVectorControl.value) {
          displacementsTexture = vector.vectorFrame.texture;
        }
      }
      ref2 = nextFrame.vectors;
      for (m = 0, len1 = ref2.length; m < len1; m++) {
        vector = ref2[m];
        if (this.vectors[vector.vectorName].options.vector === renderingControls.vectorsDisplacementVectorControl.value) {
          displacementsTextureNext = vector.vectorFrame.texture;
        }
      }
      for (n = 0, len2 = positionMaterials.length; n < len2; n++) {
        material = positionMaterials[n];
        material.uniforms.frameProgress.value = frameProgress;
        material.uniforms.displacementsTexture.value = displacementsTexture;
        material.uniforms.displacementsTextureNext.value = displacementsTextureNext;
        material.uniforms.displacementFactor.value = renderingControls.vectorsDisplacementFactorControl.value;
        time = performance.now() / 1000;
        material.uniforms.time.value = time;
      }
      for (o = 0, len3 = surfaceMaterials.length; o < len3; o++) {
        surfaceMaterial = surfaceMaterials[o];
        switch (surfaceMaterial.colorsControl.typeControl.value) {
          case TopViewer.RenderingControls.VertexColorsType.Color:
            surfaceMaterial.material.uniforms.vertexColor.value = surfaceMaterial.colorsControl.colorControl.value;
            surfaceMaterial.material.uniforms.vertexScalarsRange.value = 0;
            break;
          case TopViewer.RenderingControls.VertexColorsType.Scalar:
            selectedScalar = surfaceMaterial.colorsControl.scalarControl.value;
            this._setupVertexScalars(surfaceMaterial.material, selectedScalar, frame, nextFrame);
        }
        surfaceMaterial.material.uniforms.vertexScalarsGradientTexture.value = renderingControls.gradientControl.value.texture;
        surfaceMaterial.material.uniforms.opacity.value = surfaceMaterial.opacityControl.value;
        surfaceMaterial.material.transparent = surfaceMaterial.material.uniforms.opacity.value !== 1;
        surfaceMaterial.material.uniforms.lightingBidirectional.value = renderingControls.bidirectionalLightControl.value() ? 1 : 0;
      }
      for (p = 0, len4 = wireframeMaterials.length; p < len4; p++) {
        wireframeMaterial = wireframeMaterials[p];
        switch (wireframeMaterial.colorsControl.typeControl.value) {
          case TopViewer.RenderingControls.VertexColorsType.Color:
            wireframeMaterial.material.uniforms.vertexColor.value = wireframeMaterial.colorsControl.colorControl.value;
            wireframeMaterial.material.uniforms.vertexScalarsRange.value = 0;
            break;
          case TopViewer.RenderingControls.VertexColorsType.Scalar:
            selectedScalar = wireframeMaterial.colorsControl.scalarControl.value;
            this._setupVertexScalars(wireframeMaterial.material, selectedScalar, frame, nextFrame);
        }
        wireframeMaterial.material.uniforms.vertexScalarsGradientTexture.value = renderingControls.gradientControl.value.texture;
        wireframeMaterial.material.uniforms.opacity.value = wireframeMaterial.opacityControl.value;
        wireframeMaterial.material.transparent = wireframeMaterial.material.uniforms.opacity.value !== 1;
      }
      for (q = 0, len5 = isovalueMaterials.length; q < len5; q++) {
        isovalueMaterial = isovalueMaterials[q];
        selectedScalar = isovalueMaterial.scalarControl.value;
        ref3 = frame.scalars;
        for (r = 0, len6 = ref3.length; r < len6; r++) {
          scalar = ref3[r];
          scalarData = this.scalars[scalar.scalarName];
          if (scalarData === selectedScalar) {
            isovalueMaterial.material.uniforms.scalarsTexture.value = scalar.scalarFrame.texture;
            isovalueMaterial.material.uniforms.scalarsCurveTexture.value = scalarData.renderingControls.curveTransformControl.curveTexture;
            isovalueMaterial.material.uniforms.scalarsMin.value = scalarData.renderingControls.curveTransformControl.clip.min;
            isovalueMaterial.material.uniforms.scalarsRange.value = scalarData.renderingControls.curveTransformControl.clip.max - scalarData.renderingControls.curveTransformControl.clip.min;
            isovalueMaterial.material.uniforms.isovalues.value = scalarData.renderingControls.curveTransformControl.isovaluesControl.value;
          }
        }
        ref4 = nextFrame.scalars;
        for (s = 0, len7 = ref4.length; s < len7; s++) {
          scalar = ref4[s];
          if (this.scalars[scalar.scalarName] === selectedScalar) {
            isovalueMaterial.material.uniforms.scalarsTextureNext.value = scalar.scalarFrame.texture;
          }
        }
        switch (isovalueMaterial.colorsControl.typeControl.value) {
          case TopViewer.RenderingControls.VertexColorsType.Color:
            isovalueMaterial.material.uniforms.vertexColor.value = isovalueMaterial.colorsControl.colorControl.value;
            isovalueMaterial.material.uniforms.vertexScalarsRange.value = 0;
            break;
          case TopViewer.RenderingControls.VertexColorsType.Scalar:
            selectedScalar = isovalueMaterial.colorsControl.scalarControl.value;
            this._setupVertexScalars(isovalueMaterial.material, selectedScalar, frame, nextFrame);
        }
        isovalueMaterial.material.uniforms.vertexScalarsGradientTexture.value = renderingControls.gradientControl.value.texture;
        isovalueMaterial.material.uniforms.opacity.value = isovalueMaterial.opacityControl.value;
        isovalueMaterial.material.transparent = isovalueMaterial.material.uniforms.opacity.value !== 1;
      }
      this.isosurfaceMaterial.uniforms.lightingBidirectional.value = 1;
      this.fieldMaterial.uniforms.unitLength.value = renderingControls.vectorsFieldLengthControl.value;
      vectorTexture = this.constructor.noDisplacementsTexture;
      vectorTextureNext = this.constructor.noDisplacementsTexture;
      ref5 = frame.vectors;
      for (t = 0, len8 = ref5.length; t < len8; t++) {
        vector = ref5[t];
        if (this.vectors[vector.vectorName].options.vector === renderingControls.vectorsFieldVectorControl.value) {
          vectorTexture = vector.vectorFrame.texture;
        }
      }
      ref6 = nextFrame.vectors;
      for (u = 0, len9 = ref6.length; u < len9; u++) {
        vector = ref6[u];
        if (this.vectors[vector.vectorName].options.vector === renderingControls.vectorsFieldVectorControl.value) {
          vectorTextureNext = vector.vectorFrame.texture;
        }
      }
      this.fieldMaterial.uniforms.vectorTexture.value = vectorTexture;
      this.fieldMaterial.uniforms.vectorTextureNext.value = vectorTextureNext;
      this.fieldMaterial.transparent = true;
      ref7 = [this.meshes, this.volumes, this.vectors];
      results = [];
      for (v = 0, len10 = ref7.length; v < len10; v++) {
        collection = ref7[v];
        results.push((function() {
          var results1;
          results1 = [];
          for (name in collection) {
            object = collection[name];
            results1.push(object.showFrame());
          }
          return results1;
        })());
      }
      return results;
    };

    Model.prototype._setupVertexScalars = function(material, selectedScalar, frame, nextFrame) {
      var k, l, len, len1, ref, ref1, results, scalar, scalarData;
      material.uniforms.vertexScalarsTexture.value = this.constructor.noScalarsTexture;
      material.uniforms.vertexScalarsTextureNext.value = this.constructor.noScalarsTexture;
      ref = frame.scalars;
      for (k = 0, len = ref.length; k < len; k++) {
        scalar = ref[k];
        scalarData = this.scalars[scalar.scalarName];
        if (scalarData === selectedScalar) {
          material.uniforms.vertexScalarsTexture.value = scalar.scalarFrame.texture;
          material.uniforms.vertexScalarsCurveTexture.value = scalarData.renderingControls.curveTransformControl.curveTexture;
          material.uniforms.vertexScalarsMin.value = scalarData.renderingControls.curveTransformControl.clip.min;
          material.uniforms.vertexScalarsRange.value = scalarData.renderingControls.curveTransformControl.clip.max - scalarData.renderingControls.curveTransformControl.clip.min;
        }
      }
      ref1 = nextFrame.scalars;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        scalar = ref1[l];
        if (this.scalars[scalar.scalarName] === selectedScalar) {
          results.push(material.uniforms.vertexScalarsTextureNext.value = scalar.scalarFrame.texture);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Model;

  })(THREE.Object3D);

}).call(this);

//# sourceMappingURL=model.js.map
