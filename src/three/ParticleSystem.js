import * as THREE from 'three';
import particlesVert from '../shaders/particles.vert.glsl';
import particlesFrag from '../shaders/particles.frag.glsl';

const COUNT = 2200;

export function buildParticles(scene) {
  const positions = new Float32Array(COUNT * 3);
  const seeds     = new Float32Array(COUNT);
  const offsets   = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    // Distribute in a large sphere
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 1.5 + Math.random() * 3.5;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    seeds[i]   = Math.random();
    offsets[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader:   particlesVert,
    fragmentShader: particlesFrag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime:        { value: 0 },
      uEnergy:      { value: 0 },
      uOpenness:    { value: 0 },
      uHandPos:     { value: new THREE.Vector2(0.5, 0.5) },
      uHandPresent: { value: 0 },
      uPalette:     { value: 0 },
    },
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return { points, mat };
}

export function updateParticles({ mat }, state, dt) {
  mat.uniforms.uTime.value        += dt;
  mat.uniforms.uEnergy.value       = state.energyLevel;
  mat.uniforms.uOpenness.value     = state.smoothOpenness;
  mat.uniforms.uHandPresent.value  = state.handPresent ? 1 : 0;
  mat.uniforms.uHandPos.value.set(state.smoothPosition.x, state.smoothPosition.y);
  mat.uniforms.uPalette.value      = state.palette ?? 0;
}
