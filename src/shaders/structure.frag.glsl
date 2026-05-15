uniform float uTime;
uniform float uBreathPhase;
uniform float uOpenness;
uniform float uEnergy;
uniform float uHandPresent;
uniform float uPalette;

varying float vAlpha;
varying float vGlow;
varying float vFresnel;
varying vec3  vWorldPos;
varying float vDepth;

#define TAU 6.2831853

void main() {
  float breathWave   = sin(uBreathPhase * TAU) * 0.5 + 0.5;
  float breathSmooth = smoothstep(0.0, 1.0, breathWave);
  float ht = clamp(vWorldPos.y * 0.38 + 0.5, 0.0, 1.0);
  float pp = clamp(uPalette, 0.0, 3.0);

  // ── Palette definitions — 4 visual variations
  // P0: Cold Blue  (architectural, default)
  vec3 p0 = mix(mix(vec3(0.03,0.10,0.22), vec3(0.12,0.42,0.72), ht), vec3(0.26,0.70,0.95), ht*ht);
  vec3 w0 = vec3(0.82,0.94,1.00);  vec3 r0 = vec3(0.96,0.98,1.00);
  vec3 i0 = vec3(0.22,0.55,0.88);  vec3 e0 = vec3(0.42,0.78,1.00);

  // P1: Deep Violet  (aether)
  vec3 p1 = mix(mix(vec3(0.05,0.01,0.18), vec3(0.28,0.10,0.68), ht), vec3(0.55,0.28,0.96), ht*ht);
  vec3 w1 = vec3(0.90,0.82,1.00);  vec3 r1 = vec3(0.94,0.88,1.00);
  vec3 i1 = vec3(0.45,0.18,0.78);  vec3 e1 = vec3(0.68,0.42,1.00);

  // P2: Ember  (heat)
  vec3 p2 = mix(mix(vec3(0.12,0.02,0.04), vec3(0.52,0.08,0.18), ht), vec3(0.90,0.28,0.28), ht*ht);
  vec3 w2 = vec3(1.00,0.80,0.72);  vec3 r2 = vec3(1.00,0.88,0.82);
  vec3 i2 = vec3(0.72,0.18,0.22);  vec3 e2 = vec3(1.00,0.52,0.38);

  // P3: Void  (monochrome)
  vec3 p3 = mix(mix(vec3(0.04,0.04,0.06), vec3(0.18,0.20,0.24), ht), vec3(0.50,0.54,0.62), ht*ht);
  vec3 w3 = vec3(0.88,0.90,0.92);  vec3 r3 = vec3(0.94,0.95,0.96);
  vec3 i3 = vec3(0.26,0.28,0.34);  vec3 e3 = vec3(0.68,0.72,0.80);

  // ── Smooth blend between palettes (fractional pp enables soft crossfade)
  float t01 = clamp(pp,       0.0, 1.0);
  float t12 = clamp(pp - 1.0, 0.0, 1.0);
  float t23 = clamp(pp - 2.0, 0.0, 1.0);

  vec3 col       = mix(mix(mix(p0, p1, t01), p2, t12), p3, t23);
  vec3 iceWhite  = mix(mix(mix(w0, w1, t01), w2, t12), w3, t23);
  vec3 pureWhite = mix(mix(mix(r0, r1, t01), r2, t12), r3, t23);
  vec3 innerTint = mix(mix(mix(i0, i1, t01), i2, t12), i3, t23);
  vec3 energyTint= mix(mix(mix(e0, e1, t01), e2, t12), e3, t23);

  // ── Breath influence: brightens toward iceWhite on exhale
  col = mix(col, iceWhite, breathSmooth * 0.38 + uOpenness * 0.22);

  // ── Fresnel rim highlight
  float rimPower = pow(vFresnel, 2.2);
  col = mix(col, pureWhite, rimPower * (0.35 + uEnergy * 0.25));

  // ── Emissive glow pulse
  float glowAmt = vGlow * (0.3 + breathSmooth * 0.2);
  col += col * glowAmt;

  // ── Depth-based inner-layer tint
  float innerShift = clamp((1.0 - vDepth) * 0.4, 0.0, 1.0);
  col = mix(col, innerTint, innerShift * 0.3);

  // ── Energy tint
  col = mix(col, energyTint, uEnergy * 0.18 * (1.0 - vDepth));

  // ── Fine line variation
  float lineFlicker = 0.88 + 0.12 * sin(uTime * 0.9 + vWorldPos.x * 4.0 + vWorldPos.y * 3.0);
  float finalAlpha  = vAlpha * lineFlicker * (0.55 + breathSmooth * 0.28 + uEnergy * 0.14);

  gl_FragColor = vec4(col, clamp(finalAlpha, 0.0, 1.0));
}
