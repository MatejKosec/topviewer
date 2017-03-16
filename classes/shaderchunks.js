// Generated by CoffeeScript 1.12.4
(function() {
  TopViewer.ShaderChunks = (function() {
    function ShaderChunks() {}

    ShaderChunks.commonVertex = "precision highp float;\nprecision highp int;\n\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nuniform float time;";

    ShaderChunks.commonFragment = "precision highp float;\nprecision highp int;\n\nuniform float time;";

    ShaderChunks.positionsMaterialVertex = "uniform float frameProgress;\n\nuniform sampler2D basePositionsTexture;\nuniform sampler2D displacementsTexture;\nuniform sampler2D displacementsTextureNext;\nuniform float displacementFactor;";

    ShaderChunks.vertexMaterialVertex = "uniform sampler2D vertexScalarsTexture;\nuniform sampler2D vertexScalarsTextureNext;\nuniform float vertexScalarsMin;\nuniform float vertexScalarsRange;\n\nvarying float scalar;";

    ShaderChunks.vertexMaterialScalar = "// Caclulate the scalar value at the vertex, if needed.\nif (vertexScalarsRange > 0.0) {\n  // Interpolate scalar value.\n  scalar = texture2D(vertexScalarsTexture, vertexIndex).a;\n  float scalarNext = texture2D(vertexScalarsTextureNext, vertexIndex).a;\n  scalar = mix(scalar, scalarNext, frameProgress);\n\n  // Bring the scalar to the 0-1 range.\n  scalar = clamp((scalar - vertexScalarsMin) / vertexScalarsRange, 0.01, 0.99);\n} else {\n  scalar = -1.0;\n}";

    ShaderChunks.vertexMaterialFragment = "uniform vec3 vertexColor;\nuniform sampler2D vertexScalarsCurveTexture;\nuniform sampler2D vertexScalarsGradientTexture;\nuniform float opacity;\n\nvarying float scalar;";

    ShaderChunks.vertexMaterialBaseColor = "// Determine the base color, either from the scalar or as a constant.\nvec3 baseColor;\n\nif (scalar >= 0.0) {\n  // Transform the scalar with the curve.\n  float curvedScalar = texture2D(vertexScalarsCurveTexture, vec2(scalar, 0)).a;\n\n  // Map the curved scalar to the gradient texture.\n  baseColor = texture2D(vertexScalarsGradientTexture, vec2(curvedScalar, 0)).rgb;\n} else {\n  baseColor = vertexColor;\n}";

    ShaderChunks.surfaceMaterialVertex = "uniform float lightingNormalFactor;\n\nvarying vec3 normalEye;";

    ShaderChunks.surfaceMaterialFragment = "uniform float lightingBidirectional;\nvarying vec3 normalEye;";

    ShaderChunks.isovalueMaterialVertex = "uniform sampler2D scalarsTexture;\nuniform sampler2D scalarsTextureNext;\nuniform sampler2D scalarsCurveTexture;\nuniform float scalarsMin;\nuniform float scalarsRange;\nuniform int isovalues;\nconst int maxIsovalues = 9;";

    ShaderChunks.isovalueMaterialVertexSetup = function(vertexCount) {
      var i;
      return "vec2 vertexIndices[" + vertexCount + "];\n" + (((function() {
        var j, ref, results;
        results = [];
        for (i = j = 1, ref = vertexCount; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          results.push("vertexIndices[" + (i - 1) + "] = vertexIndexCorner" + i + ";");
        }
        return results;
      })()).join('\n')) + "\n\nvec3 vertexPositions[" + vertexCount + "];\nfloat scalars[" + vertexCount + "];\nfloat curvedScalars[" + vertexCount + "];\n\nfloat vertexColorScalars[" + vertexCount + "];\n\nfor (int i=0; i<" + vertexCount + "; i++) {\n  vec4 positionData = texture2D(basePositionsTexture, vertexIndices[i]);\n  vertexPositions[i] = positionData.xyz;\n\n  if (displacementFactor > 0.0) {\n    positionData = texture2D(displacementsTexture, vertexIndices[i]);\n    vec4 positionDataNext = texture2D(displacementsTextureNext, vertexIndices[i]);\n    positionData = mix(positionData, positionDataNext, frameProgress);\n\n    vertexPositions[i] += positionData.xyz * displacementFactor;\n  }\n\n  // First calculate the scalar upon which the isolines are positioned.\n  float scalar = clamp((texture2D(scalarsTexture, vertexIndices[i]).a - scalarsMin) / scalarsRange, 0.01, 0.99);\n  float scalarNext = clamp((texture2D(scalarsTextureNext, vertexIndices[i]).a - scalarsMin) / scalarsRange, 0.01, 0.99);\n  scalars[i] = mix(scalar, scalarNext, frameProgress);\n\n  curvedScalars[i] = texture2D(scalarsCurveTexture, vec2(scalars[i], 0)).a;\n\n  // Second, if needed, also calculate the scalar to color the vertices.\n  if (vertexScalarsRange > 0.0) {\n    // Interpolate scalar value.\n    float scalar = texture2D(vertexScalarsTexture, vertexIndices[i]).a;\n    float scalarNext = texture2D(vertexScalarsTextureNext, vertexIndices[i]).a;\n    scalar = mix(scalar, scalarNext, frameProgress);\n\n    // Bring the scalar to the 0-1 range.\n    vertexColorScalars[i] = clamp((scalar - vertexScalarsMin) / vertexScalarsRange, 0.01, 0.99);\n  } else {\n    vertexColorScalars[i] = -1.0;\n  }\n}";
    };

    ShaderChunks.isovalueMaterialIsovalueIteration = function(vertexCount) {
      return "// Distribute n isovalues evenly in the range between 0 and 1.\nfloat isovalueStep = 1.0 / float(isovalues + 1);\n\nfor (int isosurfaceIndex=0; isosurfaceIndex < maxIsovalues; isosurfaceIndex++) {\n  if (isosurfaceIndex >= isovalues) break;\n\n  float isovalue = isovalueStep * float(isosurfaceIndex + 1);\n\n  // Calculate how many vertices have their curved scalar above the isovalue.\n  bool above[" + vertexCount + "];\n  int aboveCount = 0;\n\n  for (int i=0; i<" + vertexCount + "; i++) {\n    above[i] = curvedScalars[i] > isovalue;\n    if (above[i]) aboveCount++;\n  }";
    };

    return ShaderChunks;

  })();

}).call(this);

//# sourceMappingURL=shaderchunks.js.map
