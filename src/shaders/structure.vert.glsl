uniform float uTime;
uniform float uBreathPhase;
uniform float uOpenness;
uniform float uEnergy;
uniform vec2  uHandPos;
uniform float uHandPresent;

attribute float aSeed;
attribute float aDepth;

varying float vAlpha;
varying float vGlow;
varying float vFresnel;
varying vec3  vWorldPos;
varying float vDepth;

#define TAU  6.2831853
#define HALF_TAU 3.1415927

float hash(float n) { return fract(sin(n) * 43758.5453); }

float noise(float t) {
  float i = floor(t);
  float f = fract(t);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

void main() {
  vec3 pos = position;
  float r  = length(pos);

  // ── Breathing: smooth radial expansion
  float breathWave   = sin(uBreathPhase * TAU) * 0.5 + 0.5;
  float breathSmooth = smoothstep(0.0, 1.0, breathWave);
  float breathAmp    = mix(0.03, 0.16, uOpenness) * (1.0 + uEnergy * 0.7);
  pos += normalize(pos) * breathSmooth * breathAmp;

  // ── Per-node flutter: seeded oscillation
  float flutterT   = uTime * 1.6 + aSeed * TAU;
  float flutter    = sin(flutterT) * cos(flutterT * 0.7 + 1.3);
  float flutterAmp = 0.007 + uEnergy * 0.018;
  pos += normalize(pos) * flutter * flutterAmp;

  // ── Structural tension: compress inward when fist
  float fistFactor = clamp(1.0 - uOpenness * 2.0, 0.0, 1.0);
  pos *= 1.0 - fistFactor * 0.12 * (0.5 + aSeed * 0.5);

  // ── Hand presence: localized attraction field
  if (uHandPresent > 0.5) {
    vec3 handWorld = vec3((uHandPos.x - 0.5) * 3.2, -(uHandPos.y - 0.5) * 2.4, 0.0);
    vec3 toHand    = handWorld - pos;
    float dist     = length(toHand);
    float falloff  = exp(-dist * 1.4) * uHandPresent;
    float pull     = mix(-0.08, 0.14, uOpenness) * falloff;
    pos += normalize(toHand + vec3(0.0001)) * pull * (0.6 + aSeed * 0.8);
  }

  // ── Energy ripple: distortion wave propagating from center
  float waveDist  = r;
  float waveSpeed = 2.4;
  float waveFreq  = 3.8;
  float ripple    = sin(waveDist * waveFreq - uTime * waveSpeed) * uEnergy * 0.025;
  pos += normalize(pos + vec3(0.0001)) * ripple;

  // ── Micro noise: organic variation per seed
  float microT   = uTime * 0.35 + aSeed * 8.7;
  float micro    = noise(microT) * 0.01 * (1.0 + uEnergy * 0.6);
  pos += normalize(pos) * micro;

  // ── MVP transform
  vec4 mvPos     = modelViewMatrix * vec4(pos, 1.0);
  gl_Position    = projectionMatrix * mvPos;

  // ── Fresnel approximation for line depth
  vec3 viewDir   = normalize(-mvPos.xyz);
  float radial   = length(pos.xy) / max(r, 0.001);
  float fresnel  = pow(clamp(1.0 - radial, 0.0, 1.0), 1.2);

  // ── Depth fade
  float depthVal = (-mvPos.z - 1.8) / 7.0;
  float depthFade = 1.0 - clamp(depthVal, 0.0, 0.65);

  // ── Combined alpha
  float pulse = 0.65 + breathSmooth * 0.25 + uEnergy * 0.2;
  float layerFade = mix(1.0, 0.6, aDepth * 0.5); // inner layers dimmer

  vAlpha    = clamp(depthFade * fresnel * pulse * layerFade, 0.0, 1.0);
  vGlow     = breathSmooth * 0.45 + uEnergy * 0.65 + uOpenness * 0.25;
  vFresnel  = fresnel;
  vWorldPos = pos;
  vDepth    = aDepth;
}
