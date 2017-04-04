// Generated by CoffeeScript 1.12.4
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TopViewer.IsosurfaceMaterial = (function(superClass) {
    extend(IsosurfaceMaterial, superClass);

    function IsosurfaceMaterial(model) {
      var options;
      this.model = model;
      debugger;
      options = {
        uniforms: {
          lightingBidirectional: {
            value: 0
          },
          tetraTextureHeight: {
            value: 1
          },
          tetraTextureWidth: {
            value: 1
          },
          bufferTextureHeight: {
            value: 1
          },
          bufferTextureWidth: {
            value: 1
          },
          tetraTexture: {
            value: TopViewer.Model.noTetraTexture
          }
        },
        defines: {
          USE_SHADOWMAP: ''
        },
        side: THREE.DoubleSide,
        lights: true,
        vertexShader: TopViewer.ShaderChunks.commonVertex + "\n" + TopViewer.ShaderChunks.positionsMaterialVertex + "\n" + TopViewer.ShaderChunks.vertexMaterialVertex + "\n" + TopViewer.ShaderChunks.isovalueMaterialVertex + "\n" + TopViewer.ShaderChunks.surfaceMaterialVertex + "\n\n\nuniform sampler2D tetraTexture;\nuniform float bufferTextureHeight;\nuniform float bufferTextureWidth;\nuniform float tetraTextureHeight;\nuniform float tetraTextureWidth;\n//The master index is a form of worker index as used in opencl or CUDA\nattribute float masterIndex;\n//The vertexIndexCorner values are now sampled from a texture (no longer attributes)\nvec2 vertexIndexCorner1;\nvec2 vertexIndexCorner2;\nvec2 vertexIndexCorner3;\nvec2 vertexIndexCorner4;\nfloat cornerIndex;\nfloat tetraIndex;\n\n" + THREE.ShaderChunk.shadowmap_pars_vertex + "\n\nvoid main()	{\n  /*\n    Isosurfaces vertex shader creates a surface inside the tetrahedron volume if the target\n    scalar value is found inside the tetrahedron. We know this is the case if some of the scalar values on the 4\n    vertices are below and some are above the target scalar value. We then construct the isosurface inside this\n    tetrahedron by dynamically constructing one or two triangles that span between points on the tetrahedron sides at\n    which we estimate (with linear interpolation) that the isovalue is found.\n\n    Becuase these one or two triangles need to be dynamically generated, we reserves 6 vertices in the vertex buffer as\n    potential isosurface triangle corners. Each of these 6 corners need information about the 4 tetrahedron vertices so\n    we supply this using the 4 vertex indices (these are texture coordinates to the point inside the data textures where\n    data for that index is found). We then distinguish between each of the 6 corners with the cornerIndex attribute,\n    which can have values of 0.0, 0.1, 0.2, 0.3, 0.4 and 0.5 to indicate the corner.\n\n    We first construct the whole isosurface triangle (we need all three corners so we can calculate the isosurface\n    normal … but feel free to try a better version, perhaps by calculating the gradient directly from tetrahedron\n    vertex scalar values) and then pass on one of the corners as the result of the shader, based on the corner index.\n\n    If the isosurface triangle is not needed, it is discarded by degenerating its vertices into a single point.\n  */\n\n\n\n\n  scalar = -1.0;\n\n  //The corner index is also just a function of the worker index (mod 6)\n  cornerIndex = mod(masterIndex,6.0)*0.1;\n\n  //The tetra index repeats for six workers (i.e. there are six triangle edges per each tetrahedron)\n  tetraIndex =  floor(masterIndex/6.0);\n\n  //This is the tetra that the given worker thread is to use the data for.\n  vec2 tetraAcess;\n  tetraAcess.x = mod(tetraIndex,tetraTextureWidth)/tetraTextureWidth;\n  tetraAcess.y = floor(tetraIndex/tetraTextureWidth)/tetraTextureHeight;\n  vec4 tetra = vec4(texture2D(tetraTexture, tetraAcess).rgba);\n\n  //Compute where to axess the basePositionstexture for a given tetra\n  vertexIndexCorner1.x = mod(tetra.r,bufferTextureWidth)/bufferTextureWidth;\n  vertexIndexCorner1.y = floor(tetra.r/bufferTextureWidth)/bufferTextureHeight;\n  vertexIndexCorner2.x = mod(tetra.g,bufferTextureWidth)/bufferTextureWidth;\n  vertexIndexCorner2.y = floor(tetra.g/bufferTextureWidth)/bufferTextureHeight;\n  vertexIndexCorner3.x = mod(tetra.b,bufferTextureWidth)/bufferTextureWidth;\n  vertexIndexCorner3.y = floor(tetra.b/bufferTextureWidth)/bufferTextureHeight;\n  vertexIndexCorner4.x = mod(tetra.a,bufferTextureWidth)/bufferTextureWidth;\n  vertexIndexCorner4.y = floor(tetra.a/bufferTextureWidth)/bufferTextureHeight;\n\n\n\n  // Isosurfaces only exists if we have a scalar.\n  if (scalarsRange > 0.0) {\n      " + (TopViewer.ShaderChunks.isovalueMaterialVertexSetup(4)) + "\n\n      " + (TopViewer.ShaderChunks.isovalueMaterialIsovalueIteration(4)) + "\n      if (aboveCount==0 || aboveCount==4) {\n        // None of the triangles need to show.\n        continue;\n      } else if (aboveCount != 2 && cornerIndex > 0.25) {\n        // The second triangle doesn't need to show.\n        continue;\n      } else {\n        // Calculate positions and scalar values on the corners of the isosurface.\n        vec3 cornerLeftPositions[3], cornerRightPositions[3];\n        float cornerLeftCurvedScalars[3], cornerRightCurvedScalars[3];\n        float cornerLeftVertexColorScalars[3], cornerRightVertexColorScalars[3];\n\n        // Determine which of the cases we have. There are 4 vertices so we have 16 (2^4) possible combinations of\n        // vertices being above or below the isovalue. Each case then constructs triangles between corners that will\n        // lie somewhere on the line between one vertex that is above and one that is below. The left-right combination\n        // stores which vertices these are. They are carefuly selected so that all triangles face into the same\n        // direction of the gradient.\n        int caseInt = 0;\n        if (above[3]) caseInt += 1;\n        if (above[2]) caseInt += 2;\n        if (above[1]) caseInt += 4;\n        if (above[0]) caseInt += 8;\n\n        if (caseInt==1) {\n          " + (this._setupCase([0, 1, 2], [3, 3, 3])) + "\n        } else if (caseInt==2) {\n          " + (this._setupCase([0, 3, 1], [2, 2, 2])) + "\n        } else if (caseInt==3) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 0, 1], [2, 3, 3])) + "\n          } else {\n            " + (this._setupCase([1, 0, 1], [2, 2, 3])) + "\n          }\n\n        } else if (caseInt==4) {\n          " + (this._setupCase([0, 2, 3], [1, 1, 1])) + "\n        } else if (caseInt==5) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 1, 0], [1, 2, 3])) + "\n          } else {\n            " + (this._setupCase([0, 1, 2], [3, 2, 3])) + "\n          }\n        } else if (caseInt==6) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 1, 0], [2, 3, 1])) + "\n          } else {\n            " + (this._setupCase([2, 1, 0], [3, 3, 2])) + "\n          }\n        } else if (caseInt==7) {\n          " + (this._setupCase([1, 2, 3], [0, 0, 0])) + "\n        } else if (caseInt==8) {\n          " + (this._setupCase([1, 3, 2], [0, 0, 0])) + "\n        } else if (caseInt==9) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 1, 0], [1, 3, 2])) + "\n          } else {\n            " + (this._setupCase([1, 2, 0], [3, 3, 2])) + "\n          }\n        } else if (caseInt==10) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 1, 0], [3, 2, 1])) + "\n          } else {\n            " + (this._setupCase([2, 1, 0], [3, 2, 3])) + "\n          }\n        } else if (caseInt==11) {\n          " + (this._setupCase([0, 3, 2], [1, 1, 1])) + "\n        } else if (caseInt==12) {\n          if (cornerIndex < 0.25) {\n            " + (this._setupCase([0, 1, 0], [2, 3, 3])) + "\n          } else {\n            " + (this._setupCase([0, 1, 1], [2, 2, 3])) + "\n          }\n        } else if (caseInt==13) {\n          " + (this._setupCase([0, 1, 3], [2, 2, 2])) + "\n        } else if (caseInt==14) {\n          " + (this._setupCase([0, 2, 1], [3, 3, 3])) + "\n        } else {\n          cornerLeftPositions[0] = vec3(0);\n          cornerLeftPositions[1] = vec3(2);\n          cornerLeftPositions[2] = vec3(3);\n\n          cornerRightPositions[0] = vec3(0);\n          cornerRightPositions[1] = vec3(0);\n          cornerRightPositions[2] = vec3(0);\n\n          cornerLeftCurvedScalars[0] = 0.0;\n          cornerLeftCurvedScalars[1] = 0.0;\n          cornerLeftCurvedScalars[2] = 0.0;\n\n          cornerRightCurvedScalars[0] = 0.0;\n          cornerRightCurvedScalars[1] = 0.0;\n          cornerRightCurvedScalars[2] = 0.0;\n\n          cornerLeftVertexColorScalars[0] = 0.0;\n          cornerLeftVertexColorScalars[1] = 0.0;\n          cornerLeftVertexColorScalars[2] = 0.0;\n\n          cornerRightVertexColorScalars[0] = 0.0;\n          cornerRightVertexColorScalars[1] = 0.0;\n          cornerRightVertexColorScalars[2] = 0.0;\n          continue;\n        }\n\n        // Calculate all corner positions and scalar values. We do this by linearly interpolating between the positions\n        // and scalar values at the two vertices we determine in the previous step.\n        vec3 cornerPositions[3];\n        float cornerScalars[3];\n\n        for (int i=0; i<3; i++) {\n          float range = cornerLeftCurvedScalars[i] - cornerRightCurvedScalars[i];\n          float percentage = (cornerLeftCurvedScalars[i] - isovalue) / range;\n\n          cornerPositions[i] = mix(cornerLeftPositions[i], cornerRightPositions[i], percentage);\n          cornerScalars[i] = mix(cornerLeftVertexColorScalars[i], cornerRightVertexColorScalars[i], percentage);\n        }\n\n        vec3 tangent1, tangent2;\n\n        tangent1 = cornerPositions[0] - cornerPositions[1];\n        tangent2 = cornerPositions[2] - cornerPositions[0];\n\n        vec3 normal = normalize(cross(tangent1, tangent2));\n        normalEye = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);\n\n        // Determine which corner we're currently on.\n        vec3 cornerPosition;\n\n        if (cornerIndex < 0.05) {cornerPosition = cornerPositions[0]; scalar = cornerScalars[0];}\n        else if (cornerIndex < 0.15) {cornerPosition = cornerPositions[1]; scalar = cornerScalars[1];}\n        else if (cornerIndex < 0.25) {cornerPosition = cornerPositions[2]; scalar = cornerScalars[2];}\n        else if (cornerIndex < 0.35) {cornerPosition = cornerPositions[0]; scalar = cornerScalars[0];}\n        else if (cornerIndex < 0.45) {cornerPosition = cornerPositions[1]; scalar = cornerScalars[1];}\n        else {cornerPosition = cornerPositions[2]; scalar = cornerScalars[2];}\n\n        vec4 worldPosition = modelMatrix * vec4(cornerPosition, 1.0);\n        gl_Position = projectionMatrix * viewMatrix * worldPosition;\n\n        // Shadowmap\n        " + THREE.ShaderChunk.shadowmap_vertex + "\n\n        return;\n      }\n    }\n  }\n\n  gl_Position = vec4(0,0,0,1);\n  scalar = -1.0;\n}",
        fragmentShader: TopViewer.Shaders.surfaceFragmentShader
      };
      _.extend(options.uniforms, THREE.UniformsLib.lights);
      IsosurfaceMaterial.__super__.constructor.call(this, this.model, options);
    }

    IsosurfaceMaterial.prototype._setupCase = function(left, right) {
      return "cornerLeftPositions[0] = vertexPositions[" + left[0] + "]; cornerRightPositions[0] = vertexPositions[" + right[0] + "];\ncornerLeftPositions[1] = vertexPositions[" + left[1] + "]; cornerRightPositions[1] = vertexPositions[" + right[1] + "];\ncornerLeftPositions[2] = vertexPositions[" + left[2] + "]; cornerRightPositions[2] = vertexPositions[" + right[2] + "];\n\ncornerLeftCurvedScalars[0] = curvedScalars[" + left[0] + "]; cornerRightCurvedScalars[0] = curvedScalars[" + right[0] + "];\ncornerLeftCurvedScalars[1] = curvedScalars[" + left[1] + "]; cornerRightCurvedScalars[1] = curvedScalars[" + right[1] + "];\ncornerLeftCurvedScalars[2] = curvedScalars[" + left[2] + "]; cornerRightCurvedScalars[2] = curvedScalars[" + right[2] + "];\n\ncornerLeftVertexColorScalars[0] = vertexColorScalars[" + left[0] + "]; cornerRightVertexColorScalars[0] = vertexColorScalars[" + right[0] + "];\ncornerLeftVertexColorScalars[1] = vertexColorScalars[" + left[1] + "]; cornerRightVertexColorScalars[1] = vertexColorScalars[" + right[1] + "];\ncornerLeftVertexColorScalars[2] = vertexColorScalars[" + left[2] + "]; cornerRightVertexColorScalars[2] = vertexColorScalars[" + right[2] + "];";
    };

    return IsosurfaceMaterial;

  })(TopViewer.IsovalueMaterial);

}).call(this);

//# sourceMappingURL=isosurfacematerial.js.map
