'use strict'

class TopViewer.WireframeMaterial extends TopViewer.VertexMaterial
  constructor: (@model) ->
    super @model,

      vertexShader: """
#{TopViewer.ShaderChunks.commonVertex}
#{TopViewer.ShaderChunks.positionsMaterialVertex}
#{TopViewer.ShaderChunks.vertexMaterialVertex}

uniform float BufferTextureHeight;
attribute float masterIndex;



void main()	{
  vec2 vertexIndex;
  vertexIndex.x = mod(masterIndex,4096.0)/4096.0;
  vertexIndex.y = floor(masterIndex/4096.0)/BufferTextureHeight;
  vec4 positionData = texture2D(basePositionsTexture, vertexIndex);
  vec3 vertexPosition = positionData.xyz;

  if (displacementFactor > 0.0) {
    positionData = texture2D(displacementsTexture, vertexIndex);
    vec4 positionDataNext = texture2D(displacementsTextureNext, vertexIndex);
    positionData = mix(positionData, positionDataNext, frameProgress);

    vertexPosition += positionData.xyz * displacementFactor;
  }

  #{TopViewer.ShaderChunks.vertexMaterialScalar}

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);
}
"""

      fragmentShader: TopViewer.Shaders.wireframeFragmentShader
      uniforms:
          BufferTextureHeight:
            type: 'f'
            value: 0