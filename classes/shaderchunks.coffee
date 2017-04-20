class TopViewer.ShaderChunks
  @commonVertex: """
precision highp float;
precision highp int;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;
"""

  @commonFragment: """
precision highp float;
precision highp int;

uniform float time;
"""

  @positionsMaterialVertex: """
uniform float frameProgress;

uniform sampler2D basePositionsTexture;
uniform sampler2D displacementsTexture;
uniform sampler2D displacementsTextureNext;
uniform float displacementFactor;
"""

  @vertexMaterialVertex: """
uniform sampler2D vertexScalarsTexture;
uniform sampler2D vertexScalarsTextureNext;
uniform float vertexScalarsMin;
uniform float vertexScalarsRange;

out float scalar_value;
"""

  @vertexMaterialScalar: """
  // Caclulate the scalar value at the vertex, if needed.
  if (vertexScalarsRange > 0.0) {
    // Interpolate scalar value.
    scalar_value = texture(vertexScalarsTexture, vertexIndex).a;
    float scalarNext = texture(vertexScalarsTextureNext, vertexIndex).a;
    scalar_value = mix(scalar_value, scalarNext, frameProgress);

    // Bring the scalar to the 0-1 range.
    scalar_value = clamp((scalar_value - vertexScalarsMin) / vertexScalarsRange, 0.01, 0.99);
  } else {
    scalar_value = -1.0;
  }
"""

  @vertexMaterialFragment: """
uniform vec3 vertexColor;
uniform sampler2D vertexScalarsCurveTexture;
uniform sampler2D vertexScalarsGradientTexture;
uniform float opacity;

in float scalar_value;
"""

  @vertexMaterialBaseColor: """
  // Determine the base color, either from the scalar or as a constant.
  vec3 baseColor;

  if (scalar_value >= 0.0) {
    // Transform the scalar with the curve.
    float curvedScalar = texture(vertexScalarsCurveTexture, vec2(scalar_value, 0)).a;

    // Map the curved scalar to the gradient texture.
    baseColor = texture(vertexScalarsGradientTexture, vec2(curvedScalar, 0)).rgb;
  } else {
    baseColor = vertexColor;
  }
"""

  @surfaceMaterialVertex: """
uniform float lightingNormalFactor;

out vec3 normalEye;
"""

  @surfaceMaterialFragment: """
uniform float lightingBidirectional;
in vec3 normalEye;
"""

  @isovalueMaterialVertex: """
uniform sampler2D scalarsTexture;
uniform sampler2D scalarsTextureNext;
uniform sampler2D scalarsCurveTexture;
uniform float scalarsMin;
uniform float scalarsRange;
uniform int isovalues;
const int maxIsovalues = 9;
"""

  @isovalueMaterialVertexSetup: (vertexCount) ->
    """
      vec2 vertexIndices[#{vertexCount}];
      #{ ("vertexIndices[#{i-1}] = vertexIndexCorner#{i};" for i in [1..vertexCount]).join '\n'}

      vec3 vertexPositions[#{vertexCount}];
      float scalars[#{vertexCount}];
      float curvedScalars[#{vertexCount}];

      float vertexColorScalars[#{vertexCount}];

      for (int i=0; i<#{vertexCount}; i++) {
        vec4 positionData = texture(basePositionsTexture, vertexIndices[i]);
        vertexPositions[i] = positionData.xyz;

        if (displacementFactor > 0.0) {
          positionData = texture(displacementsTexture, vertexIndices[i]);
          vec4 positionDataNext = texture(displacementsTextureNext, vertexIndices[i]);
          positionData = mix(positionData, positionDataNext, frameProgress);

          vertexPositions[i] += positionData.xyz * displacementFactor;
        }

        // First calculate the scalar upon which the isolines are positioned.
        float scalar_value = clamp((texture(scalarsTexture, vertexIndices[i]).a - scalarsMin) / scalarsRange, 0.01, 0.99);
        float scalarNext = clamp((texture(scalarsTextureNext, vertexIndices[i]).a - scalarsMin) / scalarsRange, 0.01, 0.99);
        scalars[i] = mix(scalar_value, scalarNext, frameProgress);

        curvedScalars[i] = texture(scalarsCurveTexture, vec2(scalars[i], 0)).a;

        // Second, if needed, also calculate the scalar to color the vertices.
        if (vertexScalarsRange > 0.0) {
          // Interpolate scalar value.
          float scalar_value = texture(vertexScalarsTexture, vertexIndices[i]).a;
          float scalarNext = texture(vertexScalarsTextureNext, vertexIndices[i]).a;
          scalar_value = mix(scalar_value, scalarNext, frameProgress);

          // Bring the scalar to the 0-1 range.
          vertexColorScalars[i] = clamp((scalar_value - vertexScalarsMin) / vertexScalarsRange, 0.01, 0.99);
        } else {
          vertexColorScalars[i] = -1.0;
        }
      }
"""

  @isovalueMaterialIsovalueIteration: (vertexCount) ->
    """
    // Distribute n isovalues evenly in the range between 0 and 1.
    float isovalueStep = 1.0 / float(isovalues + 1);

    for (int isosurfaceIndex=0; isosurfaceIndex < maxIsovalues; isosurfaceIndex++) {
      if (isosurfaceIndex >= isovalues) break;

      float isovalue = isovalueStep * float(isosurfaceIndex + 1);

      // Calculate how many vertices have their curved scalar above the isovalue.
      bool above[#{vertexCount}];
      int aboveCount = 0;

      for (int i=0; i<#{vertexCount}; i++) {
        above[i] = curvedScalars[i] > isovalue;
        if (above[i]) aboveCount++;
      }
"""
