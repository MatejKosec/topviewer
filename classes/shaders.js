// Generated by CoffeeScript 1.12.4
(function() {
  TopViewer.Shaders = (function() {
    function Shaders() {}

    Shaders.wireframeFragmentShader = TopViewer.ShaderChunks.commonFragment + "\n" + TopViewer.ShaderChunks.vertexMaterialFragment + "\nout vec4 FragColor;\nvoid main()	{\n  " + TopViewer.ShaderChunks.vertexMaterialBaseColor + "\n\n  FragColor = vec4(baseColor, opacity);\n}";

    Shaders.surfaceFragmentShader = TopViewer.ShaderChunks.commonFragment + "\n" + TopViewer.ShaderChunks.vertexMaterialFragment + "\n" + TopViewer.ShaderChunks.surfaceMaterialFragment + "\n\n// Shadow map\n#define SHADOWMAP_TYPE_PCF_SOFT 1\n" + THREE.ShaderChunk.common + "\n" + THREE.ShaderChunk.packing + "\n" + THREE.ShaderChunk.lights_pars + "\n" + THREE.ShaderChunk.shadowmap_pars_fragment + "\nout vec4 FragColor;\nvoid main()	{\n  " + TopViewer.ShaderChunks.vertexMaterialBaseColor + "\n\n  // Start with the light level at ambient and add all directional lights.\n  vec3 light = vec3(0.0);\n  DirectionalLight directionalLight;\n\n  for (int i=0; i < NUM_DIR_LIGHTS; i++) {\n    directionalLight = directionalLights[i];\n\n    // Shade using Lambert cosine law.\n    float shade = dot(-directionalLight.direction, normalEye);\n\n    // Bidirectional lights act from both direction, otherwise the light is only the positive part.\n    if (lightingBidirectional > 0.5) {\n      shade = abs(shade);\n    } else {\n      shade = max(shade, 0.0);\n    }\n\n    // Apply shadowmaps. For some reason (bug) we must address the map with a constant, not the index i.\n    if (i==0) {\n      shade *= getShadow(directionalShadowMap[0], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[0]);\n    }\n\n#if NUM_DIR_LIGHTS > 1\n    else if (i==1) {\n      shade *= getShadow(directionalShadowMap[1], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[1]);\n    }\n#endif\n\n    // Add the shaded amount of light's color to the total light.\n    light += directionalLight.color * shade;\n  }\n\n  // Raise by the ambient level.\n  light = mix(light, vec3(1.0), ambientLightColor);\n\n  // Finally apply the light to the base color and output it with desired opacity.\n  FragColor = vec4(baseColor * light, opacity);\n}";

    return Shaders;

  })();

}).call(this);

//# sourceMappingURL=shaders.js.map
