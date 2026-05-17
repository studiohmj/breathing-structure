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

const TrailVert = `
  attribute float aAge;
  varying float vAge;
  void main() {
    vAge = aAge;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(1.0, (1.0 - aAge) * 10.0 * (220.0 / -mvPos.z));
    gl_Position = projectionMatrix * mvPos;
  }
`;
const TrailFrag = `
  uniform float uPalette;
  varying float vAge;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float alpha = (1.0 - vAge) * smoothstep(0.5, 0.08, r) * 0.55;
    float pp = clamp(uPalette, 0.0, 3.0);
    vec3 c0 = vec3(0.18, 0.55, 1.00);
    vec3 c1 = vec3(0.62, 0.22, 1.00);
    vec3 c2 = vec3(1.00, 0.32, 0.18);
    vec3 c3 = vec3(0.72, 0.84, 0.96);
    vec3 col = mix(
      mix(mix(c0, c1, clamp(pp, 0., 1.)), c2, clamp(pp - 1., 0., 1.)),
      c3, clamp(pp - 2., 0., 1.)
    );
    gl_FragColor = vec4(col, alpha);
  }
`;

const PALETTE_ENVS = [
  { bgHex: 0x020408, heartBase:[0.10,0.28,0.68], gazeHex: 0x2255cc, fogDensity: 0.058 }, // 0 Blue
  { bgHex: 0x040108, heartBase:[0.20,0.04,0.60], gazeHex: 0x5510cc, fogDensity: 0.060 }, // 1 Violet
  { bgHex: 0x080101, heartBase:[0.60,0.06,0.10], gazeHex: 0xcc1820, fogDensity: 0.055 }, // 2 Crimson
  { bgHex: 0x030303, heartBase:[0.18,0.20,0.24], gazeHex: 0x405060, fogDensity: 0.062 }, // 3 Mono
  { bgHex: 0x010608, heartBase:[0.04,0.50,0.62], gazeHex: 0x0890a8, fogDensity: 0.056 }, // 4 Teal
  { bgHex: 0x090500, heartBase:[0.65,0.34,0.02], gazeHex: 0xcc8810, fogDensity: 0.054 }, // 5 Amber
  { bgHex: 0x010902, heartBase:[0.06,0.55,0.12], gazeHex: 0x18aa22, fogDensity: 0.058 }, // 6 Emerald
  { bgHex: 0x090104, heartBase:[0.62,0.04,0.36], gazeHex: 0xcc1080, fogDensity: 0.056 }, // 7 Rose
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

  const gazeLight = new THREE.PointLight(0x2255aa, 0.60, 1.1);
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

const BLAST_RING_N = 4;

function buildBlastRings(scene) {
  const rings = [];
  for (let i = 0; i < BLAST_RING_N; i++) {
    const geo = new THREE.RingGeometry(0.82, 1.0, 60);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3094ff),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    scene.add(mesh);
    rings.push({ mesh, mat });
  }
  return rings;
}

const TRAIL_N = 32;

function buildMouseTrail(scene) {
  const posArr = new Float32Array(TRAIL_N * 3);
  const ageArr = new Float32Array(TRAIL_N);

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(posArr, 3);
  const ageAttr = new THREE.BufferAttribute(ageArr, 1);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  ageAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aAge', ageAttr);
  geo.setDrawRange(0, 0);

  const mat = new THREE.ShaderMaterial({
    uniforms: { uPalette: { value: 0 } },
    vertexShader: TrailVert,
    fragmentShader: TrailFrag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  return { points, geo, mat, posAttr, ageAttr };
}

export default function Scene() {
  const mountRef        = useRef(null);
  const storeRef        = useRef(useStore.getState());
  const mousePosRef     = useRef({ x: 0.5, y: 0.5 });
  const scrollOpenRef   = useRef(0.25);
  const isHoldingRef    = useRef(false);
  const holdStartRef    = useRef(0);
  const shakeAmtRef     = useRef(0);
  const forceGestureRef = useRef({ gesture: null, until: 0 });
  const wasBurstRef     = useRef(false);
  const blastTriggerRef  = useRef(0);  // Space: 4 large rings
  const burstTriggerRef  = useRef(0);  // Hold burst: 2 small rings
  const shockTriggerRef  = useRef(0);  // Right-click: chroma spike + Z push

  useEffect(() => {
    const unsub = useStore.subscribe((s) => { storeRef.current = s; });
    return unsub;
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

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

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.058);

    const camera = new THREE.PerspectiveCamera(52, el.offsetWidth / el.offsetHeight, 0.05, 60);
    camera.position.set(0, 0, 5.0);

    const env       = buildEnvironment(scene);
    const structure = buildStructure(scene);
    const particles = buildParticles(scene);
    const camCtrl   = new CameraController(camera);
    const { beam, mat: beamMat, posAttr: beamPos } = buildEnergyBeam(scene);
    const trail      = buildMouseTrail(scene);
    const blastRings = buildBlastRings(scene);

    const raycaster  = new THREE.Raycaster();
    const worldPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const _handWorld = new THREE.Vector3();
    const _trailPt   = new THREE.Vector3();
    const _ndcVec    = new THREE.Vector2();
    const _colA      = new THREE.Color();
    const _colB      = new THREE.Color();
    const _ringCol   = new THREE.Color();

    // Trail ring buffer (pre-allocated, no per-frame allocation)
    const trailHist = new Array(TRAIL_N).fill(null).map(() => new THREE.Vector3());
    let trailCount  = 0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bw = Math.round(el.offsetWidth / 2);
    const bh = Math.round(el.offsetHeight / 2);
    const bloom = new UnrealBloomPass(new THREE.Vector2(bw, bh), 0.44, 0.38, 0.95);
    composer.addPass(bloom);

    const chromaPass = new ShaderPass(ChromaShader);
    composer.addPass(chromaPass);

    const grainPass = new ShaderPass(GrainShader);
    composer.addPass(grainPass);

    // ── Event handlers ──────────────────────────────────────────────

    const handleMouseMove = (e) => {
      mousePosRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    // Click: ripple pulse — 2 small rings + brief openness spike then return
    const handleClick = () => {
      if (storeRef.current.phase !== 'active') return;
      if (wasBurstRef.current) { wasBurstRef.current = false; return; }
      if (!storeRef.current.cameraAllowed) {
        burstTriggerRef.current = performance.now();
        const prev = scrollOpenRef.current;
        scrollOpenRef.current = Math.min(1.0, prev + 0.40);
        setTimeout(() => { scrollOpenRef.current = prev; }, 420);
      }
    };

    // Scroll: only control openness when scene is active (avoid blocking overlay scroll)
    const handleWheel = (e) => {
      if (storeRef.current.phase !== 'active') return;
      e.preventDefault();
      if (!storeRef.current.cameraAllowed) {
        scrollOpenRef.current = Math.max(0, Math.min(1,
          scrollOpenRef.current - e.deltaY * 0.0032
        ));
      }
    };

    // Right-click: inversion pulse — structure contracts + chroma spike, no rings
    const handleContextMenu = (e) => {
      e.preventDefault();
      if (storeRef.current.phase !== 'active') return;
      if (!storeRef.current.cameraAllowed) {
        shockTriggerRef.current = performance.now();
        const prev = scrollOpenRef.current;
        scrollOpenRef.current = 0.02;
        setTimeout(() => { scrollOpenRef.current = prev; }, 320);
      }
    };

    // Double-click: cycle palette
    const handleDblClick = () => {
      if (storeRef.current.phase !== 'active') return;
      const st = useStore.getState();
      st.setPaletteIdx(st.paletteIdx + 1);
    };

    // Hold to charge
    const handleMouseDown = (e) => {
      if (storeRef.current.phase !== 'active') return;
      if (e.button === 0 && !storeRef.current.cameraAllowed) {
        isHoldingRef.current = true;
        holdStartRef.current = performance.now();
      }
    };

    // Release burst after hold ≥ 0.5s
    const handleMouseUp = (e) => {
      if (storeRef.current.phase !== 'active') return;
      if (e.button !== 0 || !isHoldingRef.current || storeRef.current.cameraAllowed) return;
      const held = (performance.now() - holdStartRef.current) / 1000;
      if (held >= 0.5) {
        shakeAmtRef.current = Math.min(held * 0.35, 0.65);
        burstTriggerRef.current = performance.now();
        forceGestureRef.current = { gesture: 'OPEN_PALM', until: performance.now() + 900 };
        wasBurstRef.current = true;
      }
      isHoldingRef.current = false;
    };

    // Reset hold state if focus is lost (e.g. mouse released outside window)
    const resetHold = () => { isHoldingRef.current = false; };

    // Keyboard gesture simulation + Space burst
    const handleKeyDown = (e) => {
      if (storeRef.current.phase !== 'active') return;
      // G: toggle cursor light
      if (e.key === 'g' || e.key === 'G') {
        const st = useStore.getState();
        st.setCursorLight(!st.cursorLight);
        return;
      }
      // V: cycle palette
      if (e.key === 'v' || e.key === 'V') {
        const st = useStore.getState();
        st.setPaletteIdx(st.paletteIdx + 1);
        return;
      }
      if (storeRef.current.cameraAllowed) return;
      const gMap = { '1': 'OPEN_PALM', '2': 'CLOSED_FIST', '3': 'POINTING', '4': 'ROCK' };
      if (gMap[e.key]) {
        forceGestureRef.current = { gesture: gMap[e.key], until: performance.now() + 1600 };
        if (e.key === '1') scrollOpenRef.current = 0.96;
        if (e.key === '2') scrollOpenRef.current = 0.04;
        if (e.key === '4') shakeAmtRef.current = 0.55;
      }
      if (e.key === ' ') {
        e.preventDefault();
        shakeAmtRef.current = 0.9;
        scrollOpenRef.current = 1.0;
        blastTriggerRef.current = performance.now();
        forceGestureRef.current = { gesture: 'OPEN_PALM', until: performance.now() + 1400 };
        setTimeout(() => { scrollOpenRef.current = 0.08; }, 1400);
      }
    };

    window.addEventListener('mousemove',   handleMouseMove,   { passive: true });
    window.addEventListener('click',       handleClick);
    window.addEventListener('wheel',       handleWheel,       { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dblclick',    handleDblClick);
    window.addEventListener('mousedown',   handleMouseDown);
    window.addEventListener('mouseup',     handleMouseUp);
    window.addEventListener('keydown',     handleKeyDown);
    window.addEventListener('blur',        resetHold);
    window.addEventListener('pointercancel', resetHold);

    // ── Animation loop ───────────────────────────────────────────────

    let breathPhase    = 0;
    let paletteCurrent = 0;
    const BREATH_PERIOD = 4.5;
    let lastTime     = performance.now();
    let lastIdleTime = 0;
    let running      = true;
    let frameId;

    const animate = () => {
      if (!running) return;
      frameId = requestAnimationFrame(animate);

      const now = performance.now();
      const s   = storeRef.current;

      // Throttle to ~12 fps when scene is hidden behind overlay
      if (s.phase !== 'active') {
        if (now - lastIdleTime < 80) return;
        lastIdleTime = now;
        lastTime     = now;
        renderer.render(scene, camera);
        return;
      }

      const dt  = Math.min((now - lastTime) / 1000, 0.05);
      lastTime  = now;

      // Mouse mode: frame-driven hand update (covers all interaction types)
      if (!s.cameraAllowed) {
        const pos = mousePosRef.current;
        const fg  = forceGestureRef.current;
        const gesture = (fg.gesture && now < fg.until) ? fg.gesture : 'NONE';
        const openness = isHoldingRef.current
          ? Math.min((now - holdStartRef.current) / 1500, 1.0)
          : scrollOpenRef.current;

        useStore.getState().updateHand({
          handPresent: s.cursorLight,
          gesture:     s.cursorLight ? gesture : 'NONE',
          handOpenness: openness,
          handPosition: pos,
          handVelocity: 0,
        });
      }

      // Breath
      const breathSpeed = 1 / BREATH_PERIOD + s.smoothOpenness * 0.05;
      breathPhase = (breathPhase + dt * breathSpeed) % 1;
      const bwVal = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;

      // Palette interpolation
      const paletteTarget = (s.paletteIdx ?? 0) % 8;
      paletteCurrent += (paletteTarget - paletteCurrent) * Math.min(dt * 1.8, 1);

      const pi0 = Math.max(0, Math.min(6, Math.floor(paletteCurrent)));
      const pi1 = Math.min(7, pi0 + 1);
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

      // Camera shake — sin-layered oscillation (organic decay, no random jitter)
      if (shakeAmtRef.current > 0.003) {
        const t = now * 0.001;
        const amt = shakeAmtRef.current;
        camera.position.x += (Math.sin(t * 51.3) * 0.65 + Math.sin(t * 29.7) * 0.35) * amt * 0.055;
        camera.position.y += (Math.sin(t * 38.9 + 1.4) * 0.65 + Math.sin(t * 67.1) * 0.35) * amt * 0.04;
        shakeAmtRef.current *= 0.88;
      } else {
        shakeAmtRef.current = 0;
      }

      // Heart light — capped to prevent lighting overdrive
      const hb0 = pe0.heartBase, hb1 = pe1.heartBase;
      env.heart.intensity = Math.min(2.4, 1.2 + bwVal * 0.7 + s.energyLevel * 0.9);
      env.heart.color.setRGB(
        hb0[0] + (hb1[0]-hb0[0])*pf + s.energyLevel * 0.06,
        hb0[1] + (hb1[1]-hb0[1])*pf + s.smoothOpenness * 0.12,
        hb0[2] + (hb1[2]-hb0[2])*pf + s.smoothOpenness * 0.18,
      );

      // Gaze light tracks cursor — toggleable with G key
      const mx = mousePosRef.current;
      const glx = (mx.x - 0.5) * 3.0;
      const gly = -(mx.y - 0.5) * 2.0;
      env.gazeLight.position.x += (glx - env.gazeLight.position.x) * Math.min(dt * 1.8, 1);
      env.gazeLight.position.y += (gly - env.gazeLight.position.y) * Math.min(dt * 1.8, 1);
      if (s.cursorLight) {
        // Constant intensity — no bwVal oscillation to avoid bloom threshold crossing
        const targetGaze = 0.20 + s.energyLevel * 0.10;
        env.gazeLight.intensity += (targetGaze - env.gazeLight.intensity) * Math.min(dt * 6, 1);
      } else {
        env.gazeLight.intensity += (0 - env.gazeLight.intensity) * Math.min(dt * 4, 1);
      }

      // Blast rings — Space: 4 large (slow), Hold burst: 2 small (fast)
      const blastAge = (now - blastTriggerRef.current) / 1000;
      const burstAge = (now - burstTriggerRef.current) / 1000;
      const RING_PALETTE = [0x3094ff, 0x6622ee, 0xe03020, 0xa0b8d0, 0x10b8c8, 0xe8a020, 0x20c840, 0xe02880];
      _ringCol.setHex(RING_PALETTE[Math.round(paletteCurrent) % 8]);
      for (let ri = 0; ri < blastRings.length; ri++) {
        const { mesh, mat: rMat } = blastRings[ri];
        // Space: all 4 rings, large & slow
        const spAge = blastAge - ri * 0.22;
        // Hold burst: only rings 0-1, smaller & faster
        const hbAge = ri < 2 ? burstAge - ri * 0.28 : -1;

        let active = false;
        if (spAge > 0 && spAge < 1.8) {
          const p = spAge / 1.8;
          mesh.scale.setScalar(0.4 + p * 5.5);
          rMat.opacity = Math.pow(1 - p, 1.5) * 0.58;
          rMat.color.copy(_ringCol);
          active = true;
        } else if (hbAge > 0 && hbAge < 1.1) {
          const p = hbAge / 1.1;
          mesh.scale.setScalar(0.3 + p * 2.8);
          rMat.opacity = Math.pow(1 - p, 2.0) * 0.42;
          rMat.color.copy(_ringCol);
          active = true;
        }
        mesh.visible = active;
      }

      // Shock (right-click): chromatic aberration spike + camera Z recoil
      const shockAge = (now - shockTriggerRef.current) / 1000;
      const shockChroma = shockAge < 0.55 ? Math.pow(1 - shockAge / 0.55, 2.2) * 2.2 : 0;
      const shockBloom  = shockAge < 0.28 ? Math.pow(1 - shockAge / 0.28, 3.0) * 0.22 : 0;
      if (shockAge < 0.30) {
        camera.position.z += Math.pow(1 - shockAge / 0.30, 2.0) * 0.42;
      }

      // Post-processing — bloom lerped to prevent threshold-crossing flicker
      const blastBoost = blastAge < 0.6 ? (0.6 - blastAge) * 0.6 : 0;
      const targetBloom = Math.min(0.62,
        0.28 + bwVal * 0.07 + s.energyLevel * 0.18 + s.smoothOpenness * 0.05
        + shakeAmtRef.current * 0.05 + blastBoost * 0.22 + shockBloom
      );
      bloom.strength += (targetBloom - bloom.strength) * Math.min(dt * 12, 1);
      bloom.radius   = 0.38 + s.smoothOpenness * 0.10;
      chromaPass.uniforms.uStrength.value = Math.min(
        s.smoothVelocity * 0.25 + shakeAmtRef.current * 0.25 + blastBoost * 0.2 + shockChroma,
        2.5
      );
      grainPass.uniforms.uTime.value = now * 0.001;

      // Mouse trail — only when cursor light is on
      if (s.cursorLight) {
        _ndcVec.set(s.smoothPosition.x * 2 - 1, 1 - s.smoothPosition.y * 2);
        raycaster.setFromCamera(_ndcVec, camera);
        if (raycaster.ray.intersectPlane(worldPlane, _trailPt)) {
          const end = Math.min(trailCount, TRAIL_N - 1);
          for (let i = end; i > 0; i--) trailHist[i].copy(trailHist[i - 1]);
          trailHist[0].copy(_trailPt);
          trailCount = Math.min(trailCount + 1, TRAIL_N);

          for (let i = 0; i < trailCount; i++) {
            trail.posAttr.setXYZ(i, trailHist[i].x, trailHist[i].y, trailHist[i].z);
            trail.ageAttr.setX(i, trailCount > 1 ? i / (trailCount - 1) : 0);
          }
          trail.posAttr.needsUpdate = true;
          trail.ageAttr.needsUpdate = true;
          trail.geo.setDrawRange(0, trailCount);
          trail.mat.uniforms.uPalette.value = paletteCurrent;
        }
      } else {
        trail.geo.setDrawRange(0, 0);
        trailCount = 0;
      }

      // Energy beam
      beamMat.uniforms.uTime.value    = now * 0.001;
      beamMat.uniforms.uPalette.value = paletteCurrent;

      if (s.cursorLight && s.gesture === 'POINTING' && s.handPresent) {
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
      window.removeEventListener('resize',      onResize);
      window.removeEventListener('mousemove',   handleMouseMove);
      window.removeEventListener('click',       handleClick);
      window.removeEventListener('wheel',       handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dblclick',    handleDblClick);
      window.removeEventListener('mousedown',   handleMouseDown);
      window.removeEventListener('mouseup',     handleMouseUp);
      window.removeEventListener('keydown',     handleKeyDown);
      window.removeEventListener('blur',        resetHold);
      window.removeEventListener('pointercancel', resetHold);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      bloom.dispose();
      chromaPass.dispose();
      grainPass.dispose();
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
