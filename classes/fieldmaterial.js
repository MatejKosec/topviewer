// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.FieldMaterial = (function(superClass) {
    extend(FieldMaterial, superClass);

    function FieldMaterial(model) {
      this.model = model;
      FieldMaterial.__super__.constructor.call(this, this.model, {
        uniforms: {
          unitLength: {
            value: 1
          },
          vectorTexture: {
            value: TopViewer.Model.noDisplacementsTexture
          },
          vectorTextureNext: {
            value: TopViewer.Model.noDisplacementsTexture
          }
        },
        vertexShader: TopViewer.ShaderChunks.commonVertex + "\n" + TopViewer.ShaderChunks.positionsMaterialVertex + "\n" + TopViewer.ShaderChunks.vertexMaterialVertex + "\n\nuniform sampler2D vectorTexture;\nuniform sampler2D vectorTextureNext;\nuniform float unitLength;\nuniform float opacity;\n\nattribute vec2 vertexIndex;\nattribute float cornerIndex;\n\nvarying float alpha;\n\nvoid main()	{\n  vec4 positionData = texture2D(basePositionsTexture, vertexIndex);\n  vec3 vertexPosition = positionData.xyz;\n\n  if (displacementFactor > 0.0) {\n    positionData = texture2D(displacementsTexture, vertexIndex);\n    vec4 positionDataNext = texture2D(displacementsTextureNext, vertexIndex);\n    positionData = mix(positionData, positionDataNext, frameProgress);\n\n    vertexPosition += positionData.xyz * displacementFactor;\n  }\n\n  alpha = opacity;\n\n  if (cornerIndex > 0.5) {\n    vec4 vectorData = texture2D(vectorTexture, vertexIndex);\n    vec4 vectorDataNext = texture2D(vectorTextureNext, vertexIndex);\n    vectorData = mix(vectorData, vectorDataNext, frameProgress);\n\n    vertexPosition += vectorData.xyz * unitLength;\n\n    alpha = 0.0;\n  }\n\n  " + TopViewer.ShaderChunks.vertexMaterialScalar + "\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);\n}",
        fragmentShader: TopViewer.ShaderChunks.commonFragment + "\n" + TopViewer.ShaderChunks.vertexMaterialFragment + "\n\nvarying float alpha;\n\nvoid main()	{\n  " + TopViewer.ShaderChunks.vertexMaterialBaseColor + "\n\n  gl_FragColor = vec4(baseColor, alpha);\n}"
      });
    }

    return FieldMaterial;

  })(TopViewer.VertexMaterial);

}).call(this);
