uniform float uTime;
uniform float uEnergy;
uniform float uOpenness;
uniform vec2  uHandPos;
uniform float uHandPresent;
uniform float uPalette;

attribute float aSeed;
attribute float aOffset;

varying float vAlpha;
varying vec3  vColor;

#define TAU 6.2831853

void main() {
  vec3 pos = position;

  float t = uTime * 0.18 + aSeed * TAU;
  pos.x += sin(t * 1.1 + aOffset) * 0.04;
  pos.y += cos(t * 0.9 + aOffset * 1.3) * 0.06;
  pos.z += sin(t * 0.7 + aOffset * 2.1) * 0.03;

  if (uHandPresent > 0.5) {
    vec3 handWorld = vec3(uHandPos.x * 2.0 - 1.0, -(uHandPos.y * 2.0 - 1.0), 0.0);
    vec3 toHand = pos - handWorld * 1.5;
    float dist = length(toHand);
    float scatter = uEnergy * uOpenness * 0.08 / max(dist * dist, 0.04);
    pos += normalize(toHand) * scatter;
  }

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  float depthFade = 1.0 - clamp((-mvPos.z - 1.0) / 9.0, 0.0, 1.0);
  float flicker = 0.5 + 0.5 * sin(uTime * 0.6 + aSeed * 7.3);
  vAlpha = depthFade * flicker * (0.15 + uEnergy * 0.25);

  float size = (1.0 + uEnergy * 1.5) * (500.0 / -mvPos.z);
  gl_PointSize = clamp(size * (0.8 + aSeed * 0.4), 0.5, 4.0);

  // ── Palette-aware particle colors
  float pp = clamp(uPalette, 0.0, 3.0);
  float t01 = clamp(pp,       0.0, 1.0);
  float t12 = clamp(pp - 1.0, 0.0, 1.0);
  float t23 = clamp(pp - 2.0, 0.0, 1.0);

  vec3 cold0 = vec3(0.12,0.35,0.62); vec3 bright0 = vec3(0.70,0.88,1.00);
  vec3 cold1 = vec3(0.20,0.08,0.52); vec3 bright1 = vec3(0.72,0.58,1.00);
  vec3 cold2 = vec3(0.42,0.05,0.10); vec3 bright2 = vec3(1.00,0.62,0.48);
  vec3 cold3 = vec3(0.12,0.12,0.14); vec3 bright3 = vec3(0.62,0.65,0.70);

  vec3 cold   = mix(mix(mix(cold0,   cold1,   t01), cold2,   t12), cold3,   t23);
  vec3 bright = mix(mix(mix(bright0, bright1, t01), bright2, t12), bright3, t23);

  vColor = mix(cold, bright, aSeed * 0.6 + uEnergy * 0.3);
}
