import * as THREE from 'three';

const BASE_DIST   = 5.0;
const ORBIT_SLOW  = 32;
const DRIFT_SLOW  = 47;
const PAN_MAX     = 0.55;
const ZOOM_RANGE  = 0.75;

function lerp(a, b, t) { return a + (b - a) * t; }

export class CameraController {
  constructor(camera) {
    this.camera   = camera;
    this.clock    = 0;

    this.targetPos  = new THREE.Vector3(0, 0, BASE_DIST);
    this.currentPos = new THREE.Vector3(0, 0, BASE_DIST);
    this.targetLook = new THREE.Vector3(0, 0, 0);
    this.currentLook= new THREE.Vector3(0, 0, 0);

    this.targetFov  = 52;
    this.currentFov = 52;

    // POINTING gesture accumulated offset
    this._pointX = 0;
    this._pointY = 0;
    // SWIPE impulse
    this._swipeX = 0;
  }

  update(state, dt) {
    this.clock += dt;
    const t = this.clock;
    const { smoothOpenness, smoothPosition, handPresent, gesture, energyLevel, smoothVelocity } = state;

    // Idle Lissajous orbit
    const orbitX = Math.sin(t / ORBIT_SLOW * Math.PI * 2) * 0.28;
    const orbitY = Math.sin(t / DRIFT_SLOW * Math.PI * 2) * 0.14
                 + Math.sin(t / 19       * Math.PI * 2) * 0.06;
    const orbitZ = BASE_DIST + Math.sin(t / 22 * Math.PI * 2) * 0.18;

    // Hand parallax
    let panX = 0, panY = 0;
    if (handPresent) {
      panX = (smoothPosition.x - 0.5) * PAN_MAX;
      panY = -(smoothPosition.y - 0.5) * PAN_MAX * 0.55;
    }

    // Openness zoom
    const zoomAdd = smoothOpenness * ZOOM_RANGE;

    // Velocity micro-shake
    const shakeMag = Math.min(smoothVelocity * 0.012, 0.04);
    const shakeX   = (Math.random() - 0.5) * shakeMag;
    const shakeY   = (Math.random() - 0.5) * shakeMag;

    // POINTING: camera drifts toward pointed direction
    if (gesture === 'POINTING' && handPresent) {
      const targetPX = (smoothPosition.x - 0.5) * 1.4;
      const targetPY = -(smoothPosition.y - 0.5) * 0.9;
      this._pointX = lerp(this._pointX, targetPX, dt * 1.2);
      this._pointY = lerp(this._pointY, targetPY, dt * 1.2);
    } else {
      this._pointX = lerp(this._pointX, 0, dt * 2.5);
      this._pointY = lerp(this._pointY, 0, dt * 2.5);
    }

    // SWIPE: sharp directional impulse that decays
    if (gesture === 'ROCK') {
      this._swipeX = lerp(this._swipeX, (smoothPosition.x - 0.5) * 1.8, dt * 6.0);
    } else {
      this._swipeX = lerp(this._swipeX, 0, dt * 3.0);
    }

    this.targetPos.set(
      orbitX + panX * 0.35 + shakeX + this._pointX * 0.65 + this._swipeX * 0.5,
      orbitY + panY * 0.35 + shakeY + this._pointY * 0.45,
      orbitZ + zoomAdd,
    );

    const slowLerp = 0.025 + energyLevel * 0.012;
    this.currentPos.lerp(this.targetPos, slowLerp);
    this.camera.position.copy(this.currentPos);

    // Look-at with lag
    const lookX = panX * 0.22 + this._pointX * 0.18;
    const lookY = panY * 0.18 + this._pointY * 0.12;
    this.targetLook.set(lookX, lookY, 0);
    this.currentLook.lerp(this.targetLook, 0.032);
    this.camera.lookAt(this.currentLook);

    // FOV breathe
    const targetFov = 52
      + Math.sin(t / 18 * Math.PI * 2) * 1.2
      + smoothOpenness * 2.5;
    this.currentFov += (targetFov - this.currentFov) * 0.018;
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }
}
