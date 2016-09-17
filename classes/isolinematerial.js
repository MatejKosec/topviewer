// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.IsolineMaterial = (function(superClass) {
    extend(IsolineMaterial, superClass);

    function IsolineMaterial(model) {
      this.model = model;
      IsolineMaterial.__super__.constructor.call(this, this.model, {
        linewidth: 3,
        vertexShader: TopViewer.ShaderChunks.commonVertex + "\n" + TopViewer.ShaderChunks.positionsMaterialVertex + "\n" + TopViewer.ShaderChunks.vertexMaterialVertex + "\n" + TopViewer.ShaderChunks.isovalueMaterialVertex + "\n\nattribute vec2 vertexIndexCorner1;\nattribute vec2 vertexIndexCorner2;\nattribute vec2 vertexIndexCorner3;\nattribute float cornerIndex;\n\nvoid main()	{\n  if (scalarsRange > 0.0) {\n    " + (TopViewer.ShaderChunks.isovalueMaterialVertexSetup(3)) + "\n\n    " + (TopViewer.ShaderChunks.isovalueMaterialIsovalueIteration(3)) + "\n      if (aboveCount==0 || aboveCount==3) {\n        // The isoline doesn't need to show.\n        continue;\n      } else {\n        vec3 leftPosition;\n        vec3 rightPosition;\n        float leftScalar;\n        float rightScalar;\n        float leftVertexColorScalar;\n        float rightVertexColorScalar;\n\n        if (cornerIndex < 0.5) {\n          // Start vertex\n          if (above[0] != above[1]) {\n            leftPosition = vertexPositions[0];\n            rightPosition =vertexPositions[1];\n            leftScalar = curvedScalars[0];\n            rightScalar = curvedScalars[1];\n            leftVertexColorScalar = vertexColorScalars[0];\n            rightVertexColorScalar = vertexColorScalars[1];\n          } else {\n            leftPosition = vertexPositions[1];\n            rightPosition =vertexPositions[2];\n            leftScalar = curvedScalars[1];\n            rightScalar = curvedScalars[2];\n            leftVertexColorScalar = vertexColorScalars[1];\n            rightVertexColorScalar = vertexColorScalars[2];\n          }\n        } else {\n          // End vertex\n          if (above[0] != above[2]) {\n            leftPosition = vertexPositions[0];\n            rightPosition =vertexPositions[2];\n            leftScalar = curvedScalars[0];\n            rightScalar = curvedScalars[2];\n            leftVertexColorScalar = vertexColorScalars[0];\n            rightVertexColorScalar = vertexColorScalars[2];\n          } else {\n            leftPosition = vertexPositions[1];\n            rightPosition =vertexPositions[2];\n            leftScalar = curvedScalars[1];\n            rightScalar = curvedScalars[2];\n            leftVertexColorScalar = vertexColorScalars[1];\n            rightVertexColorScalar = vertexColorScalars[2];\n          }\n        }\n\n        float range = rightScalar - leftScalar;\n        float percentage = (isovalue - leftScalar) / range;\n\n        // Interpolate vertex position.\n        vec3 vertexPosition = mix(leftPosition, rightPosition, percentage);\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);\n\n        // Interpolate vertex color scalar value.\n        scalar = mix(leftVertexColorScalar, rightVertexColorScalar, percentage);\n\n        return;\n      }\n    }\n  }\n\n  gl_Position = vec4(0,0,0,1);\n  scalar = -1.0;\n}",
        fragmentShader: TopViewer.Shaders.wireframeFragmentShader
      });
    }

    return IsolineMaterial;

  })(TopViewer.IsovalueMaterial);

}).call(this);

//# sourceMappingURL=isolinematerial.js.map
