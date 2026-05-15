import { create } from 'zustand';

export const useStore = create((set) => ({
  // App phase: 'landing' | 'permission' | 'active'
  phase: 'landing',

  // Hand tracking
  handPresent: false,
  handOpenness: 0,          // 0 closed → 1 open
  handPosition: { x: 0.5, y: 0.5 }, // normalized 0-1
  handVelocity: 0,          // scalar speed
  gesture: 'NONE',          // OPEN_PALM | CLOSED_FIST | POINTING | ROCK | NONE

  // Smoothed / dampened versions used by renderer
  smoothOpenness: 0,
  smoothPosition: { x: 0.5, y: 0.5 },
  smoothVelocity: 0,

  // Structure state
  energyLevel: 0,

  // Camera permission
  cameraAllowed: false,
  cameraError: null,

  // Visual palette: 0=Cold Blue, 1=Violet, 2=Ember, 3=Void
  paletteIdx: 0,

  setPhase: (phase) => set({ phase }),
  setCameraAllowed: (v) => set({ cameraAllowed: v }),
  setCameraError: (e) => set({ cameraError: e }),
  setPaletteIdx: (v) => set({ paletteIdx: ((v % 4) + 4) % 4 }),

  updateHand: (data) => set((s) => {
    const dx = data.handPosition.x - s.smoothPosition.x;
    const dy = data.handPosition.y - s.smoothPosition.y;
    const velRaw = Math.sqrt(dx * dx + dy * dy) * 60;
    const energy = Math.min(1, s.energyLevel * 0.92 + velRaw * 0.08);
    return {
      ...data,
      smoothOpenness: s.smoothOpenness * 0.85 + data.handOpenness * 0.15,
      smoothPosition: {
        x: s.smoothPosition.x * 0.88 + data.handPosition.x * 0.12,
        y: s.smoothPosition.y * 0.88 + data.handPosition.y * 0.12,
      },
      smoothVelocity: s.smoothVelocity * 0.8 + velRaw * 0.2,
      energyLevel: energy,
    };
  }),

  clearHand: () => set((s) => ({
    handPresent: false,
    gesture: 'NONE',
    smoothOpenness: s.smoothOpenness * 0.95,
    smoothVelocity: s.smoothVelocity * 0.9,
    energyLevel: s.energyLevel * 0.97,
  })),

}));
