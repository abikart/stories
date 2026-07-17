export const QUAD_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
uniform vec4 uRect;
out vec2 vLocal;

void main() {
  vec2 stagePosition = uRect.xy + aPosition * uRect.zw;
  gl_Position = vec4(stagePosition.x * 2.0 - 1.0, 1.0 - stagePosition.y * 2.0, 0.0, 1.0);
  vLocal = aPosition;
}
`;

export const SOURCE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform float uOpacity;
in vec2 vLocal;
out vec4 outColor;

void main() {
  vec4 source = texture(uSource, vec2(vLocal.x, 1.0 - vLocal.y));
  float alpha = source.a * uOpacity;
  outColor = vec4(source.rgb * alpha, alpha);
}
`;

export const LENS_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uScene;
uniform sampler2D uMap;
uniform vec4 uRect;
uniform vec2 uStageSize;
uniform float uStrength;
uniform float uChroma;
uniform float uSpecularDirection;
uniform float uSpecularWidth;
uniform float uSpecularIntensity;
uniform vec4 uTint;
in vec2 vLocal;
out vec4 outColor;

vec3 sourceAt(vec2 topLeftUV) {
  return texture(uScene, vec2(topLeftUV.x, 1.0 - topLeftUV.y)).rgb;
}

void main() {
  vec4 field = texture(uMap, vec2(vLocal.x, vLocal.y));
  float mask = field.a;
  if (mask <= 0.002) discard;

  vec2 bend = field.rg * 2.0 - 1.0;
  float thickness = field.b;
  vec2 stageUV = uRect.xy + vLocal * uRect.zw;
  vec2 baseOffset = bend * (uStrength / uStageSize);
  vec2 chromaOffset = bend * (uChroma * thickness / uStageSize);
  vec3 redSample = sourceAt(stageUV + baseOffset + chromaOffset);
  vec3 greenSample = sourceAt(stageUV + baseOffset);
  vec3 blueSample = sourceAt(stageUV + baseOffset - chromaOffset);
  vec3 refracted = vec3(redSample.r, greenSample.g, blueSample.b);

  vec2 outward = length(bend) > 0.0001 ? normalize(-bend) : vec2(0.0);
  vec2 lightDirection = vec2(cos(uSpecularDirection), sin(uSpecularDirection));
  float facing = max(dot(outward, lightDirection), 0.0);
  float rim = smoothstep(0.3, 0.92, thickness);
  float focus = pow(facing, mix(18.0, 2.5, clamp(uSpecularWidth, 0.0, 1.0)));
  float specular = rim * (0.16 + focus * 0.84) * uSpecularIntensity;
  vec3 tinted = mix(refracted, uTint.rgb, uTint.a);
  vec3 lit = tinted + vec3(specular);

  outColor = vec4(lit, mask);
}
`;
