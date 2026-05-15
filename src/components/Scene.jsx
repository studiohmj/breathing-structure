import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { buildStructure, updateStructure } from '../three/BreathingStructure.js';
import { buildParticles,  updateParticles } from '../three/ParticleSystem.js';
import { CameraController } from '../three/CameraController.js';
import { useStore } from '../store/store.js';

const ChromaShader = {
  uniforms: { tDiffuse:{value:null}, uStrength:{value:0} },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uStrength; varying vec2 vUv;
    void main(){
      vec2 d=vUv-0.5; float s=uStrength*(0.0008+dot(d,d)*0.006);
      float r=texture2D(tDiffuse,vUv+d*s).r;
      float g=texture2D(tDiffuse,vUv).g;
      float b=texture2D(tDiffuse,vUv-d*s).b;
      gl_FragColor=vec4(r,g,b,texture2D(tDiffuse,vUv).a);
    }
  `,
};

const GrainShader = {
  uniforms: { tDiffuse:{value:null}, uTime:{value:0}, uAmount:{value:0.014} },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uAmount; varying vec2 vUv;
    float rand(vec2 c){ return fract(sin(dot(c,vec2(127.1,311.7)))*43758.5453); }
    void main(){
      vec4 col=texture2D(tDiffuse,vUv);
      float g=(rand(vUv+fract(uTime*0.01))-0.5)*uAmount;
      gl_FragColor=vec4(col.rgb+g,col.a);
    }
  `,
};

const BeamVert = `
  attribute float aT;
  varying float vT;
  void main(){
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BeamFrag = `
  uniform float uTime;
  uniform float uAlpha;
  uniform float uPalette;
  varying float vT;
  void main(){
    float pulse = 0.5 + 0.5 * sin(vT * 12.0 - uTime * 6.5);
    float edge  = smoothstep(0.0, 0.07, vT) * smoothstep(1.0, 0.93, vT);
    float alpha = uAlpha * pulse * edge * 0.92;
    float pp = clamp(uPalette, 0.0, 3.0);
    vec3 c0 = mix(vec3(0.14,0.50,0.96), vec3(0.76,0.93,1.0), pulse * 0.55);
    vec3 c1 = mix(vec3(0.40,0.14,0.90), vec3(0.82,0.72,1.0), pulse * 0.55);
    vec3 c2 = mix(vec3(0.90,0.16,0.20), vec3(1.00,0.72,0.60), pulse * 0.55);
    vec3 c3 = mix(vec3(0.28,0.32,0.38), vec3(0.82,0.86,0.90), pulse * 0.55);
    vec3 col = mix(mix(mix(c0,c1,clamp(pp,0.,1.)),c2,clamp(pp-1.,0.,1.)),c3,clamp(pp-2.,0.,1.));
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Per-palette environment settings
const PALETTE_ENVS = [
  { bgHex: 0x020408, heartBase:[0.08,0.22,0.52], gazeHex: 0x2255aa, fogDensity: 0.058 },
  { bgHex: 0x030208, heartBase:[0.10,0.06,0.42], gazeHex: 0x401890, fogDensity: 0.060 },
  { bgHex: 0x060202, heartBase:[0.42,0.06,0.12], gazeHex: 0x901828, fogDensity: 0.055 },
  { bgHex: 0x030303, heartBase:[0.12,0.14,0.16], gazeHex: 0x283038, fogDensity: 0.062 },
];

function buildEnvironment(scene) {
  const grid1 = new THREE.GridHelper(18, 32, 0x0a1828, 0x060e18);
  grid1.position.y = -2.8;
  grid1.material.transparent = true;
  grid1.material.opacity = 0.14;
  scene.add(grid1);

  const grid2 = new THREE.GridHelper(18, 32, 0x080f1a, 0x050a12);
  grid2.rotation.x = Math.PI / 2;
  grid2.position.z = -4.5;
  grid2.material.transparent = true;
  grid2.material.opacity = 0.06;
  scene.add(grid2);

  const hemi = new THREE.HemisphereLight(0x102040, 0x020408, 0.45);
  scene.add(hemi);

  const heart = new THREE.PointLight(0x1a4080, 2.2, 7);
  heart.position.set(0, 0, 0);
  scene.add(heart);

  const topLight = new THREE.DirectionalLight(0x2060a0, 0.6);
  topLight.position.set(0.5, 3, 1.5);
  scene.add(topLight);

  const fillLight = new THREE.PointLight(0x0a1830, 1.0, 5);
  fillLight.position.set(0, -2, 1);
  scene.add(fillLight);

  const gazeLight = new THREE.PointLight(0x2255aa, 1.2, 9);
  gazeLight.position.set(3, 2, 3);
  scene.add(gazeLight);

  return { heart, gazeLight, topLight };
}

const BEAM_SEGMENTS = 24;

function buildEnergyBeam(scene) {
  const positions = new Float32Array(BEAM_SEGMENTS * 3);
  const tValues   = new Float32Array(BEAM_SEGMENTS);
  for (let i = 0; i < BEAM_SEGMENTS; i++) tValues[i] = i / (BEAM_SEGMENTS - 1);

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aT', new THREE.BufferAttribute(tValues, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: BeamVert,
    fragmentShader: BeamFrag,
    uniforms: { uTime:{value:0}, uAlpha:{value:0}, uPalette:{value:0} },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const beam = new THREE.Line(geo, mat);
  beam.visible = false;
  beam.frustumCulled = false;
  scene.add(beam);

  return { beam, mat, posAttr };
}

export default function Scene() {
  const mountRef    = useRef(null);
  const storeRef    = useRef(useStore.getState());
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const mouseModeOpenRef = useRef(false);

  useEffect(() => {
    const unsub = useStore.subscribe((s) => { storeRef.current = s; });
    return unsub;
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer — pixel ratio capped at 1.5 for performance
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(el.offsetWidth, el.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    // ── Scene + camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.058);

    const camera = new THREE.PerspectiveCamera(52, el.offsetWidth / el.offsetHeight, 0.05, 60);
    camera.position.set(0, 0, 5.0);

    // ── Systems
    const env       = buildEnvironment(scene);
    const structure = buildStructure(scene);
    const particles = buildParticles(scene);
    const camCtrl   = new CameraController(camera);
    const { beam, mat: beamMat, posAttr: beamPos } = buildEnergyBeam(scene);

    // Reusable objects
    const raycaster  = new THREE.Raycaster();
    const worldPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const _handWorld = new THREE.Vector3();
    const _ndcVec    = new THREE.Vector2();
    const _colA      = new THREE.Color();
    const _colB      = new THREE.Color();

    // ── Post-processing — bloom at half resolution for perf
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bw = Math.round(el.offsetWidth / 2);
    const bh = Math.round(el.offsetHeight / 2);
    const bloom = new UnrealBloomPass(new THREE.Vector2(bw, bh), 0.48, 0.42, 0.78);
    composer.addPass(bloom);

    const chromaPass = new ShaderPass(ChromaShader);
    composer.addPass(chromaPass);

    const grainPass = new ShaderPass(GrainShader);
    composer.addPass(grainPass);

    // ── Mouse tracking
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mousePosRef.current = { x, y };

      if (!storeRef.current.cameraAllowed) {
        useStore.getState().updateHand({
          handPresent: true,
          gesture: 'NONE',
          handOpenness: mouseModeOpenRef.current ? 0.92 : 0.12,
          handPosition: { x, y },
          handVelocity: 0,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Mouse click: toggle openness in mouse mode
    const handleClick = () => {
      if (!storeRef.current.cameraAllowed) {
        mouseModeOpenRef.current = !mouseModeOpenRef.current;
      }
    };
    window.addEventListener('click', handleClick);

    // ── Animation loop
    let breathPhase   = 0;
    let paletteCurrent = 0;
    const BREATH_PERIOD = 4.5;
    let lastTime = performance.now();
    let running  = true;
    let frameId;

    const animate = () => {
      if (!running) return;
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.05);
      lastTime  = now;

      const s = storeRef.current;

      // Breath
      const breathSpeed = 1 / BREATH_PERIOD + s.smoothOpenness * 0.05;
      breathPhase = (breathPhase + dt * breathSpeed) % 1;

      const bwVal = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;

      // Palette smooth interpolation
      const paletteTarget = s.paletteIdx ?? 0;
      paletteCurrent += (paletteTarget - paletteCurrent) * Math.min(dt * 1.8, 1);

      // Palette environment lerp
      const pi0 = Math.max(0, Math.min(2, Math.floor(paletteCurrent)));
      const pi1 = pi0 + 1;
      const pf  = paletteCurrent - pi0;
      const pe0 = PALETTE_ENVS[pi0], pe1 = PALETTE_ENVS[pi1];

      _colA.setHex(pe0.bgHex);
      _colB.setHex(pe1.bgHex);
      scene.background.lerpColors(_colA, _colB, pf);
      scene.fog.color.copy(scene.background);
      scene.fog.density = pe0.fogDensity + (pe1.fogDensity - pe0.fogDensity) * pf;

      _colA.setHex(pe0.gazeHex);
      _colB.setHex(pe1.gazeHex);
      env.gazeLight.color.lerpColors(_colA, _colB, pf);

      const state = {
        breathPhase,
        smoothOpenness: s.smoothOpenness,
        smoothPosition: s.smoothPosition,
        smoothVelocity: s.smoothVelocity,
        handPresent:    s.handPresent,
        energyLevel:    s.energyLevel,
        gesture:        s.gesture,
        palette:        paletteCurrent,
      };

      updateStructure(structure, state, dt);
      updateParticles(particles, state, dt);
      camCtrl.update(state, dt);

      // Heart light — palette-aware base color
      const hb0 = pe0.heartBase, hb1 = pe1.heartBase;
      env.heart.intensity = 1.6 + bwVal * 1.0 + s.energyLevel * 1.4;
      env.heart.color.setRGB(
        hb0[0] + (hb1[0]-hb0[0])*pf + s.energyLevel * 0.06,
        hb0[1] + (hb1[1]-hb0[1])*pf + s.smoothOpenness * 0.12,
        hb0[2] + (hb1[2]-hb0[2])*pf + s.smoothOpenness * 0.18,
      );

      // Gaze light follows mouse
      const mx = mousePosRef.current;
      const glx = (mx.x - 0.5) * 6;
      const gly = -(mx.y - 0.5) * 4;
      env.gazeLight.position.x += (glx - env.gazeLight.position.x) * Math.min(dt * 1.8, 1);
      env.gazeLight.position.y += (gly - env.gazeLight.position.y) * Math.min(dt * 1.8, 1);
      env.gazeLight.intensity   = 0.8 + bwVal * 0.5 + s.energyLevel * 0.8;

      // Bloom
      bloom.strength = 0.38 + bwVal * 0.14 + s.energyLevel * 0.38 + s.smoothOpenness * 0.1;
      bloom.radius   = 0.38 + s.smoothOpenness * 0.12;

      // Chroma
      chromaPass.uniforms.uStrength.value = Math.min(s.smoothVelocity * 0.35, 1.0);

      // Grain
      grainPass.uniforms.uTime.value = now * 0.001;

      // Energy beam
      beamMat.uniforms.uTime.value    = now * 0.001;
      beamMat.uniforms.uPalette.value = paletteCurrent;

      if (s.gesture === 'POINTING' && s.handPresent) {
        _ndcVec.set(s.smoothPosition.x * 2 - 1, 1 - s.smoothPosition.y * 2);
        raycaster.setFromCamera(_ndcVec, camera);

        if (raycaster.ray.intersectPlane(worldPlane, _handWorld)) {
          for (let i = 0; i < BEAM_SEGMENTS; i++) {
            const t = i / (BEAM_SEGMENTS - 1);
            beamPos.setXYZ(i,
              _handWorld.x * (1 - t),
              _handWorld.y * (1 - t),
              _handWorld.z * (1 - t),
            );
          }
          beamPos.needsUpdate = true;
          beam.visible = true;
          beamMat.uniforms.uAlpha.value = Math.min(
            beamMat.uniforms.uAlpha.value + dt * 5, 1.0,
          );
        }
      } else {
        beamMat.uniforms.uAlpha.value = Math.max(
          beamMat.uniforms.uAlpha.value - dt * 7, 0,
        );
        if (beamMat.uniforms.uAlpha.value <= 0.001) beam.visible = false;
      }

      composer.render();
    };

    animate();

    const onResize = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.resolution.set(Math.round(w / 2), Math.round(h / 2));
    };
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
      try { el.removeChild(renderer.domElement); } catch (_) {}
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
    />
  );
}
