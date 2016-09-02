// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.WireframeMaterial = (function(superClass) {
    extend(WireframeMaterial, superClass);

    function WireframeMaterial(model) {
      this.model = model;
      WireframeMaterial.__super__.constructor.call(this, this.model, {
        vertexShader: TopViewer.ShaderChunks.commonVertex + "\n" + TopViewer.ShaderChunks.positionsMaterialVertex + "\n" + TopViewer.ShaderChunks.vertexMaterialVertex + "\n\nattribute vec2 vertexIndex;\n\nvoid main()	{\n  vec4 positionData = texture2D(basePositionsTexture, vertexIndex);\n  vec3 vertexPosition = positionData.xyz;\n\n  if (displacementFactor > 0.0) {\n    positionData = texture2D(displacementsTexture, vertexIndex);\n    vec4 positionDataNext = texture2D(displacementsTextureNext, vertexIndex);\n    positionData = mix(positionData, positionDataNext, frameProgress);\n\n    vertexPosition += positionData.xyz * displacementFactor;\n  }\n\n  " + TopViewer.ShaderChunks.vertexMaterialScalar + "\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);\n}",
        fragmentShader: TopViewer.Shaders.wireframeFragmentShader
      });
    }

    return WireframeMaterial;

  })(TopViewer.VertexMaterial);

}).call(this);

//# sourceMappingURL=wireframematerial.js.map
