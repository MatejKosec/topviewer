// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.PositionsMaterial = (function(superClass) {
    extend(PositionsMaterial, superClass);

    function PositionsMaterial(model, options) {
      this.model = model;
      options.uniforms || (options.uniforms = {});
      _.extend(options.uniforms, {
        frameProgress: {
          value: 0
        },
        basePositionsTexture: {
          value: this.model.basePositionsTexture
        },
        displacementsTexture: {
          value: TopViewer.Model.noDisplacementsTexture
        },
        displacementsTextureNext: {
          value: TopViewer.Model.noDisplacementsTexture
        },
        displacementFactor: {
          value: 0
        },
        time: {
          value: 0
        }
      });
      PositionsMaterial.__super__.constructor.call(this, options);
    }

    return PositionsMaterial;

  })(THREE.RawShaderMaterial);

  TopViewer.VertexMaterial = (function(superClass) {
    extend(VertexMaterial, superClass);

    function VertexMaterial(model, options) {
      this.model = model;
      options.uniforms || (options.uniforms = {});
      _.extend(options.uniforms, {
        vertexColor: {
          value: new THREE.Color('white')
        },
        vertexScalarsTexture: {
          value: TopViewer.Model.noScalarsTexture
        },
        vertexScalarsTextureNext: {
          value: TopViewer.Model.noScalarsTexture
        },
        vertexScalarsMin: {
          value: 0
        },
        vertexScalarsRange: {
          value: 0
        },
        vertexScalarsCurveTexture: {
          value: TopViewer.Model.noCurveTexture
        },
        vertexScalarsGradientTexture: {
          value: this.model.options.engine.gradients[0].texture
        },
        opacity: {
          value: 1
        }
      });
      VertexMaterial.__super__.constructor.call(this, this.model, options);
    }

    return VertexMaterial;

  })(TopViewer.PositionsMaterial);

  TopViewer.SurfaceMaterial = (function(superClass) {
    extend(SurfaceMaterial, superClass);

    function SurfaceMaterial(model, options) {
      this.model = model;
      options.uniforms || (options.uniforms = {});
      _.extend(options.uniforms, {
        lightingBidirectional: {
          value: 0
        },
        lightingNormalFactor: {
          value: 1
        }
      }, THREE.UniformsLib.lights);
      options.defines || (options.defines = {});
      _.extend(options.defines, {
        USE_SHADOWMAP: ''
      });
      _.extend(options, {
        side: THREE.FrontSide,
        lights: true
      });
      SurfaceMaterial.__super__.constructor.call(this, this.model, options);
    }

    return SurfaceMaterial;

  })(TopViewer.VertexMaterial);

  TopViewer.IsovalueMaterial = (function(superClass) {
    extend(IsovalueMaterial, superClass);

    function IsovalueMaterial(model, options) {
      this.model = model;
      options.uniforms || (options.uniforms = {});
      _.extend(options.uniforms, {
        scalarsTexture: {
          value: TopViewer.Model.noScalarsTexture
        },
        scalarsTextureNext: {
          value: TopViewer.Model.noScalarsTexture
        },
        scalarsCurveTexture: {
          value: TopViewer.Model.noCurveTexture
        },
        scalarsMin: {
          value: 0
        },
        scalarsRange: {
          value: 0
        }
      });
      IsovalueMaterial.__super__.constructor.call(this, this.model, options);
    }

    return IsovalueMaterial;

  })(TopViewer.VertexMaterial);

}).call(this);

//# sourceMappingURL=material.js.map
