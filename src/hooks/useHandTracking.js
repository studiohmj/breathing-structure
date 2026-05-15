import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/store';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// Kalman filter for single value
class Kalman1D {
  constructor(R = 0.01, Q = 0.05) {
    this.R = R; this.Q = Q;
    this.x = 0; this.P = 1;
  }
  update(z) {
    this.P += this.Q;
    const K = this.P / (this.P + this.R);
    this.x += K * (z - this.x);
    this.P *= (1 - K);
    return this.x;
  }
}

// Detect gesture from 21-landmark hand
function classifyGesture(lm) {
  const isExtended = (tip, pip) => lm[tip].y < lm[pip].y;

  const index  = isExtended(8, 6);
  const middle = isExtended(12, 10);
  const ring   = isExtended(16, 14);
  const pinky  = isExtended(20, 18);
  const thumb  = lm[4].x < lm[3].x; // approx for right hand; mirrored

  const extCount = [index, middle, ring, pinky].filter(Boolean).length;

  if (extCount === 4 || extCount === 5) return 'OPEN_PALM';
  if (extCount === 0)                   return 'CLOSED_FIST';
  if (index && !middle && !ring && !pinky) return 'POINTING';
  if (index && !middle && !ring && pinky)  return 'ROCK';
  return 'NONE';
}

// Compute openness: average spread of fingertip distances from palm center
function computeOpenness(lm) {
  const palm = lm[0]; // wrist
  const tips = [4, 8, 12, 16, 20];
  let sum = 0;
  for (const t of tips) {
    const dx = lm[t].x - palm.x;
    const dy = lm[t].y - palm.y;
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  const raw = sum / tips.length;
  return Math.min(1, Math.max(0, (raw - 0.05) / 0.25));
}

export function useHandTracking(videoRef, canvasRef) {
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const kalmanX = useRef(new Kalman1D(0.008, 0.03));
  const kalmanY = useRef(new Kalman1D(0.008, 0.03));
  const kalmanO = useRef(new Kalman1D(0.015, 0.05));
  const updateHand = useStore((s) => s.updateHand);
  const clearHand  = useStore((s) => s.clearHand);
  const phase      = useStore((s) => s.phase);
  const activeRef  = useRef(false);

  const drawSkeleton = useCallback((lm, ctx, w, h) => {
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17],
    ];
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,120,40,0.85)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * w, lm[a].y * h);
      ctx.lineTo(lm[b].x * w, lm[b].y * h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,160,80,0.9)';
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    if (phase !== 'active' && phase !== 'calibrating') return;
    activeRef.current = true;

    let mounted = true;

    (async () => {
      try {
        const { HandLandmarker, FilesetResolver } = await import(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/+esm'
        );
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        if (!mounted) { hl.close(); return; }
        landmarkerRef.current = hl;

        const canvas = canvasRef?.current;
        const ctx = canvas ? canvas.getContext('2d') : null;

        const detect = () => {
          if (!mounted || !activeRef.current) return;
          const vid = videoRef.current;
          if (vid && vid.readyState >= 2 && landmarkerRef.current) {
            const result = landmarkerRef.current.detectForVideo(vid, performance.now());
            if (result.landmarks?.length > 0) {
              const lm = result.landmarks[0];
              const gesture = classifyGesture(lm);
              const rawO = computeOpenness(lm);
              const cx = lm[9].x; // middle MCP as hand center
              const cy = lm[9].y;
              const sx = kalmanX.current.update(cx);
              const sy = kalmanY.current.update(cy);
              const so = kalmanO.current.update(rawO);
              updateHand({
                handPresent: true,
                gesture,
                handOpenness: so,
                handPosition: { x: sx, y: sy },
                handVelocity: 0,
              });
              if (ctx && canvas) {
                // Only resize canvas when dimensions actually change
                if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                  canvas.width  = canvas.offsetWidth;
                  canvas.height = canvas.offsetHeight;
                }
                drawSkeleton(lm, ctx, canvas.width, canvas.height);
              }
            } else {
              clearHand();
              ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
            }
          }
          rafRef.current = requestAnimationFrame(detect);
        };
        rafRef.current = requestAnimationFrame(detect);
      } catch (err) {
        console.warn('HandLandmarker init failed:', err);
      }
    })();

    return () => {
      mounted = false;
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [phase]);
}
