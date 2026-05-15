import * as THREE from 'three';
import structureVert from '../shaders/structure.vert.glsl';
import structureFrag from '../shaders/structure.frag.glsl';

// --- Layer config: multiple concentric shells ---
const LAYERS = [
  { count: 240, radius: 1.65, connectDist: 0.56, maxConn: 4, opacity: 0.55 },
  { count: 120, radius: 1.10, connectDist: 0.62, maxConn: 5, opacity: 0.35 },
  { count: 60,  radius: 0.62, connectDist: 0.70, maxConn: 6, opacity: 0.20 },
];

function fibonacciSphere(n, r) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * rr * r, y * r, Math.sin(theta) * rr * r));
  }
  return pts;
}

function buildEdgeGeometry(nodes, connectDist, maxConn, layerDepth = 1.0) {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    let c = 0;
    for (let j = i + 1; j < nodes.length && c < maxConn; j++) {
      if (nodes[i].distanceTo(nodes[j]) < connectDist) {
        edges.push([i, j]);
        c++;
      }
    }
  }

  const posArr  = new Float32Array(edges.length * 2 * 3);
  const seedArr = new Float32Array(edges.length * 2);
  const depArr  = new Float32Array(edges.length * 2);

  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e];
    const seed = Math.random();
    for (let v = 0; v < 2; v++) {
      const node = v === 0 ? nodes[a] : nodes[b];
      const base = (e * 2 + v) * 3;
      posArr[base]     = node.x;
      posArr[base + 1] = node.y;
      posArr[base + 2] = node.z;
      seedArr[e * 2 + v] = seed;
      depArr[e * 2 + v]  = layerDepth;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('aSeed',    new THREE.BufferAttribute(seedArr, 1));
  geo.setAttribute('aDepth',   new THREE.BufferAttribute(depArr, 1));
  return geo;
}

function makeUniforms() {
  return {
    uTime:        { value: 0 },
    uBreathPhase: { value: 0 },
    uOpenness:    { value: 0 },
    uEnergy:      { value: 0 },
    uHandPos:     { value: new THREE.Vector2(0.5, 0.5) },
    uHandPresent: { value: 0 },
    uPalette:     { value: 0 },
  };
}

// Micro fragments: small drifting line segments deep inside structure
function buildMicroFragments(scene) {
  const COUNT = 280;
  const posArr  = new Float32Array(COUNT * 2 * 3);
  const seedArr = new Float32Array(COUNT * 2);

  for (let i = 0; i < COUNT; i++) {
    const r = 0.3 + Math.random() * 0.9;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const cx = r * Math.sin(phi) * Math.cos(theta);
    const cy = r * Math.sin(phi) * Math.sin(theta);
    const cz = r * Math.cos(phi);
    const len = 0.04 + Math.random() * 0.10;
    const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    const seed = Math.random();

    for (let v = 0; v < 2; v++) {
      const s = v === 0 ? -0.5 : 0.5;
      const base = (i * 2 + v) * 3;
      posArr[base]     = cx + dir.x * len * s;
      posArr[base + 1] = cy + dir.y * len * s;
      posArr[base + 2] = cz + dir.z * len * s;
      seedArr[i * 2 + v] = seed;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('aSeed',    new THREE.BufferAttribute(seedArr, 1));
  geo.setAttribute('aDepth',   new THREE.BufferAttribute(new Float32Array(COUNT * 2).fill(0.5), 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: structureVert,
    fragmentShader: structureFrag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: makeUniforms(),
  });
  mat.uniforms.uTime.value = Math.random() * 100;

  const lines = new THREE.LineSegments(geo, mat);
  scene.add(lines);
  return { lines, mat };
}

// Cross-layer connectors: sparse long lines between inner and outer layers
function buildCrossLayerConnectors(layerNodes, scene) {
  const [outer, mid, inner] = layerNodes;
  const PAIRS = 60;
  const posArr  = new Float32Array(PAIRS * 2 * 3);
  const seedArr = new Float32Array(PAIRS * 2);
  const depArr  = new Float32Array(PAIRS * 2);

  for (let i = 0; i < PAIRS; i++) {
    const oi = Math.floor(Math.random() * outer.length);
    const ii = Math.floor(Math.random() * inner.length);
    const seed = Math.random();
    const a = outer[oi], b = inner[ii];
    for (let v = 0; v < 2; v++) {
      const node = v === 0 ? a : b;
      const base = (i * 2 + v) * 3;
      posArr[base]     = node.x;
      posArr[base + 1] = node.y;
      posArr[base + 2] = node.z;
      seedArr[i * 2 + v] = seed;
      depArr[i * 2 + v]  = v === 0 ? 1 : 0.3;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('aSeed',    new THREE.BufferAttribute(seedArr, 1));
  geo.setAttribute('aDepth',   new THREE.BufferAttribute(depArr, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: structureVert,
    fragmentShader: structureFrag,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: makeUniforms(),
  });

  const lines = new THREE.LineSegments(geo, mat);
  scene.add(lines);
  return { lines, mat };
}

export function buildStructure(scene) {
  const layerMeshes = [];
  const allLayerNodes = [];
  const allMats = [];

  LAYERS.forEach(({ count, radius, connectDist, maxConn, opacity }, layerIdx) => {
    // depth: 1.0 = outermost layer, 0.0 = innermost — drives color gradient in shader
    const layerDepth = 1.0 - layerIdx / (LAYERS.length - 1);
    const nodes = fibonacciSphere(count, radius);
    allLayerNodes.push(nodes);
    const geo = buildEdgeGeometry(nodes, connectDist, maxConn, layerDepth);
    const mat = new THREE.ShaderMaterial({
      vertexShader: structureVert,
      fragmentShader: structureFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: makeUniforms(),
    });
    mat.uniforms.uTime.value = Math.random() * 50;
    const lines = new THREE.LineSegments(geo, mat);
    scene.add(lines);
    layerMeshes.push({ lines, mat, nodes, baseOpacity: opacity, radius });
    allMats.push(mat);
  });

  // Micro fragments (inner drifting lines)
  const frags = buildMicroFragments(scene);
  allMats.push(frags.mat);

  // Cross-layer connectors
  const connectors = buildCrossLayerConnectors(allLayerNodes, scene);
  allMats.push(connectors.mat);

  // Node glows: InstancedMesh for outer shell only
  const outerNodes = allLayerNodes[0];
  const nodeGeo = new THREE.SphereGeometry(0.016, 4, 4);
  const nodeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.32, 0.72, 1.0),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glows = new THREE.InstancedMesh(nodeGeo, nodeMat, outerNodes.length);
  const dummy = new THREE.Object3D();
  outerNodes.forEach((n, i) => {
    dummy.position.copy(n);
    dummy.scale.setScalar(0.8 + Math.random() * 0.6);
    dummy.updateMatrix();
    glows.setMatrixAt(i, dummy.matrix);
  });
  glows.instanceMatrix.needsUpdate = true;
  scene.add(glows);

  return { layerMeshes, frags, connectors, glows, nodeMat, allMats };
}

export function updateStructure(struct, state, dt) {
  const { breathPhase, smoothOpenness, smoothPosition, handPresent, energyLevel } = state;
  const bw = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;

  const applyUniforms = (mat) => {
    mat.uniforms.uTime.value        += dt;
    mat.uniforms.uBreathPhase.value  = breathPhase;
    mat.uniforms.uOpenness.value     = smoothOpenness;
    mat.uniforms.uEnergy.value       = energyLevel;
    mat.uniforms.uHandPresent.value  = handPresent ? 1 : 0;
    mat.uniforms.uHandPos.value.set(smoothPosition.x, smoothPosition.y);
    mat.uniforms.uPalette.value      = state.palette ?? 0;
  };

  struct.allMats.forEach(applyUniforms);

  // Layer-specific opacity modulation
  struct.layerMeshes.forEach(({ mat, baseOpacity }, i) => {
    // Inner layers pulse more subtly; outer layer is primary
    const depthFactor = 1 - i * 0.3;
    const opacityMod = baseOpacity * (0.8 + bw * 0.2) * depthFactor;
    // Handled in shader — just a reference; no direct opacity needed
  });

  // Node glow pulse
  struct.nodeMat.opacity = Math.min(0.85, 0.28 + bw * 0.38 + energyLevel * 0.25);
}
