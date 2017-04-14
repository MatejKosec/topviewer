'use strict'

class TopViewer.WireframeMaterial extends TopViewer.VertexMaterial
  constructor: (@model) ->
    super @model,

      vertexShader: """
#{TopViewer.ShaderChunks.commonVertex}
#{TopViewer.ShaderChunks.positionsMaterialVertex}
#{TopViewer.ShaderChunks.vertexMaterialVertex}

uniform float bufferTextureHeight;
uniform float bufferTextureWidth;
attribute vec2 vertexIndex;

void main()	{
  //The vertex coordinates are stored in a 2D texture. Here compute the x,y texture coordinates
  //at which to access the texture to get the x,y,z coords of the underlying texture
  //vec2 vertexIndex;
  //vertexIndex.x = mod(masterIndex,bufferTextureWidth)/bufferTextureWidth;
  //vertexIndex.y = floor(masterIndex/bufferTextureWidth)/bufferTextureHeight;
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
          bufferTextureHeight:
            type: 'f'
            value: 0
          bufferTextureWidth:
            type: 'f'
            value: 0