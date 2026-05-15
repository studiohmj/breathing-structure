varying float vAlpha;
varying vec3  vColor;

void main() {
  // Soft round point sprite
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float circle = 1.0 - smoothstep(0.3, 0.5, d);
  float glow   = exp(-d * 4.0) * 0.5;
  float alpha  = (circle * 0.7 + glow) * vAlpha;
  gl_FragColor = vec4(vColor, clamp(alpha, 0.0, 1.0));
}
