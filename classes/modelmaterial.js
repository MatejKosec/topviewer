// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.ModelMaterial = (function(superClass) {
    extend(ModelMaterial, superClass);

    function ModelMaterial(model) {
      this.model = model;
      ModelMaterial.__super__.constructor.call(this, {
        uniforms: {
          basePositionsTexture: {
            type: 't',
            value: this.model.basePositionsTexture
          },
          displacementsTexture: {
            type: 't',
            value: this.model.displacementsTexture
          },
          displacementFactor: {
            type: 'f',
            value: 0
          },
          scalarsTexture: {
            type: 't',
            value: this.model.scalarsTexture
          },
          scalarsMin: {
            type: 'f',
            value: 0
          },
          scalarsRange: {
            type: 'f',
            value: 0
          },
          gradientTexture: {
            type: 't',
            value: this.model.options.engine.gradientTexture
          },
          gradientCurveTexture: {
            type: 't',
            value: this.model.options.engine.gradientCurveTexture
          },
          time: {
            type: 'f',
            value: 0
          },
          color: {
            type: 'c',
            value: new THREE.Color('white')
          },
          lightDirection: {
            type: 'v3',
            value: new THREE.Vector3(1, -2, 1).normalize()
          },
          ambientLevel: {
            type: 'f',
            value: 0
          },
          opacity: {
            type: 'f',
            value: 1
          }
        },
        side: THREE.DoubleSide,
        vertexShader: "precision highp float;\nprecision highp int;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nuniform sampler2D basePositionsTexture;\n\nuniform sampler2D displacementsTexture;\nuniform float displacementFactor;\n\nuniform sampler2D scalarsTexture;\nuniform float scalarsMin;\nuniform float scalarsRange;\n\nuniform float time;\n\nattribute vec2 vertexIndex;\nattribute vec2 vertexIndex2;\nattribute vec2 vertexIndex3;\nattribute vec2 vertexIndex4;\n\nvarying float scalar;\nvarying vec3 normal;\n\nvoid main()	{\n  vec4 positionData = texture2D(basePositionsTexture, vertexIndex);\n  vec3 vertexPosition = positionData.xyz;\n\n  vec4 positionData2 = texture2D(basePositionsTexture, vertexIndex2);\n  vec3 vertexPosition2 = positionData2.xyz;\n\n  vec4 positionData3 = texture2D(basePositionsTexture, vertexIndex3);\n  vec3 vertexPosition3 = positionData3.xyz;\n\n  vec4 positionData4 = texture2D(basePositionsTexture, vertexIndex4);\n  vec3 vertexPosition4 = positionData4.xyz;\n\n  if (displacementFactor > 0.0) {\n    positionData = texture2D(displacementsTexture, vertexIndex);\n    vertexPosition += positionData.xyz * displacementFactor;\n\n    positionData2 = texture2D(displacementsTexture, vertexIndex2);\n    vertexPosition2 += positionData2.xyz * displacementFactor;\n\n    positionData3 = texture2D(displacementsTexture, vertexIndex3);\n    vertexPosition3 += positionData3.xyz * displacementFactor;\n\n    positionData4 = texture2D(displacementsTexture, vertexIndex4);\n    vertexPosition4 += positionData4.xyz * displacementFactor;\n  }\n\n  if (scalarsRange > 0.0) {\n    scalar = clamp((texture2D(scalarsTexture, vertexIndex).a - scalarsMin) / scalarsRange, 0.01, 0.99);\n  } else {\n    scalar = -1.0;\n  }\n\n  vec3 tangent1 = normalize(vertexPosition2 - vertexPosition3);\n  vec3 tangent2 = normalize(vertexPosition4 - vertexPosition2);\n\n  normal = cross(tangent1, tangent2);\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);\n}",
        fragmentShader: "precision highp float;\nprecision highp int;\n\nuniform sampler2D gradientCurveTexture;\nuniform sampler2D gradientTexture;\n\nuniform float time;\nuniform vec3 color;\nuniform vec3 lightDirection;\nuniform float ambientLevel;\nuniform float opacity;\n\nvarying float scalar;\nvarying vec3 normal;\n\nvoid main()	{\n  vec3 baseColor;\n  float shade = ambientLevel + (1.0 - ambientLevel) * max(dot(lightDirection, normal), 0.0);\n  shade = 1.0;\n\n  if (scalar >= 0.0) {\n    float curvedScalar = texture2D(gradientCurveTexture, vec2(scalar, 0)).a;\n    baseColor = texture2D(gradientTexture, vec2(curvedScalar, 0)).rgb;\n  } else {\n    baseColor = color;\n  }\n\n  gl_FragColor = vec4(shade * baseColor, opacity);\n}"
      });
    }

    return ModelMaterial;

  })(THREE.RawShaderMaterial);

}).call(this);

//# sourceMappingURL=modelmaterial.js.map
