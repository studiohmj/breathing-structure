import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store.js';

const T = {
  displaySm: { fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 200, letterSpacing: '0.40em', lineHeight: 1.08 },
  label:     { fontSize: 13, fontWeight: 600, letterSpacing: '0.20em', lineHeight: 1.5 },
  value:     { fontSize: 15, fontWeight: 400, letterSpacing: '0.08em', lineHeight: 1.5 },
  caption:   { fontSize: 12, fontWeight: 500, letterSpacing: '0.16em', lineHeight: 1.5 },
  micro:     { fontSize: 11, fontWeight: 400, letterSpacing: '0.06em', lineHeight: 1.5 },
};
const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const PALETTE_NAMES = ['Cold', 'Violet', 'Ember', 'Void'];

const GESTURE_LABELS = {
  OPEN_PALM:   '— Bloom',
  CLOSED_FIST: '— Wither',
  POINTING:    '— Direct',
  ROCK:        '— Shift',
  NONE:        '',
};

const HAND_GUIDE = [
  { gesture: 'Open Palm',    desc: 'Structure expands' },
  { gesture: 'Closed Fist',  desc: 'Structure compresses' },
  { gesture: 'Index Finger', desc: 'Energy beam + camera shift' },
  { gesture: 'Rock Sign',    desc: 'Camera shockwave' },
];

const MOUSE_GUIDE = [
  { gesture: 'Move',           desc: 'Structure parallax' },
  { gesture: 'Scroll',         desc: 'Openness control' },
  { gesture: 'Click',          desc: 'Toggle open / close' },
  { gesture: 'Hold + Release', desc: 'Charge → burst' },
  { gesture: 'Right Click',    desc: 'Shockwave' },
  { gesture: 'Double Click',   desc: 'Cycle palette' },
  { gesture: 'Space',          desc: 'Max energy burst' },
  { gesture: '1 / 2 / 3 / 4', desc: 'Simulate gestures' },
];

function Dot({ active }) {
  return (
    <motion.span
      animate={{ opacity: active ? [0.6, 1, 0.6] : 0.35 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
        background: active ? 'rgba(48,148,255,1)' : 'rgba(255,255,255,0.35)',
        boxShadow: active ? '0 0 8px rgba(48,148,255,0.8)' : 'none',
        marginRight: 8, flexShrink: 0, alignSelf: 'center',
      }}
    />
  );
}

const Divider = ({ w = 32 }) => (
  <div style={{ width: w, height: 1, background: 'rgba(255,255,255,0.18)', margin: '8px 0' }} />
);

function KeyBadge({ label }) {
  return (
    <div style={{
      minWidth: 20, height: 17, padding: '0 6px',
      border: '1px solid rgba(255,255,255,0.30)', borderRadius: 3,
      background: 'rgba(255,255,255,0.08)',
      ...T.micro, color: 'rgba(255,255,255,0.70)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, letterSpacing: '0.04em',
    }}>
      {label}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BRANDING — top-left
   ═════════════════════════════════════════════ */
export function Branding() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'fixed', top: 32, left: 36, fontFamily: FONT }}
    >
      <div style={{ ...T.displaySm, color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase' }}>BREATHING</div>
      <div style={{ ...T.displaySm, color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase', marginTop: 2 }}>STRUCTURE</div>
      <Divider w={48} />
      <div style={{ ...T.label, color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase' }}>Interactive Installation</div>
      <div style={{ ...T.micro, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginTop: 4 }}>2026</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   TOP-RIGHT — palette indicator + help button
   ═════════════════════════════════════════════ */
export function TopRight({ onHelp }) {
  const paletteIdx = useStore((s) => s.paletteIdx);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.4, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 32, right: 36, fontFamily: FONT,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5,
      }}
    >
      <div style={{ ...T.micro, color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase' }}>WebGL · MediaPipe</div>
      <div style={{ ...T.micro, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.08em' }}>◉ Real-time</div>

      <Divider w={20} />

      <AnimatePresence mode="wait">
        <motion.div
          key={paletteIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...T.caption, color: 'rgba(48,148,255,0.90)', textTransform: 'uppercase', fontWeight: 600 }}
        >
          {PALETTE_NAMES[paletteIdx]}
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={onHelp}
        whileHover={{ opacity: 0.8, scale: 1.08 }}
        style={{
          marginTop: 3, width: 26, height: 26,
          border: '1px solid rgba(255,255,255,0.28)', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)',
          fontSize: 11, fontWeight: 600, fontFamily: FONT,
          cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          letterSpacing: 0, lineHeight: 1,
        }}
      >
        ?
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   STATUS BAR — bottom-left
   ═════════════════════════════════════════════ */
export function StatusBar() {
  const handPresent    = useStore((s) => s.handPresent);
  const gesture        = useStore((s) => s.gesture);
  const cameraAllowed  = useStore((s) => s.cameraAllowed);
  const smoothOpenness = useStore((s) => s.smoothOpenness);
  const label = GESTURE_LABELS[gesture] ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', bottom: 32, left: 36, fontFamily: FONT,
        display: 'flex', flexDirection: 'column', gap: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {label ? (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
            style={{ ...T.value, fontWeight: 600, color: 'rgba(48,148,255,0.95)', textTransform: 'uppercase', marginBottom: 8 }}
          >
            {label}
          </motion.div>
        ) : (
          <motion.div
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...T.value, fontWeight: 300, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }}
          >
            — Idle
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...T.caption, fontWeight: 600, color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase' }}>Openness</div>
        <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${smoothOpenness * 100}%` }}
            transition={{ duration: 0.12, ease: 'linear' }}
            style={{ height: '100%', background: 'rgba(48,148,255,0.85)', borderRadius: 2 }}
          />
        </div>
      </div>

      <Divider w={80} />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Dot active={cameraAllowed && handPresent} />
        <span style={{ ...T.caption, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
          {cameraAllowed ? 'Hand Tracking' : 'Mouse Mode'}
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURE GUIDE — slide-in panel bottom-right
   ═════════════════════════════════════════════ */
export function FeatureGuide({ visible, onClose }) {
  const cameraAllowed = useStore((s) => s.cameraAllowed);
  const guide = cameraAllowed ? HAND_GUIDE : MOUSE_GUIDE;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="guide"
          initial={{ opacity: 0, x: 18, y: 4 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 18, transition: { duration: 0.25 } }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', bottom: 32, right: 36,
            width: 240,
            padding: '20px 20px 16px',
            border: '1px solid rgba(48,148,255,0.18)',
            borderRadius: 8,
            background: 'rgba(2,5,14,0.94)',
            backdropFilter: 'blur(20px)',
            fontFamily: FONT, zIndex: 200,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ ...T.label, fontWeight: 700, color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase' }}>
              {cameraAllowed ? 'Hand Gestures' : 'Controls'}
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ opacity: 0.7 }}
              style={{
                border: 'none', background: 'transparent',
                color: 'rgba(255,255,255,0.50)', fontSize: 13,
                fontFamily: FONT, cursor: 'none', padding: 0, lineHeight: 1,
              }}
            >
              ✕
            </motion.button>
          </div>

          {/* Interaction items */}
          {guide.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 13 }}>
              <span style={{ fontSize: 8, color: 'rgba(48,148,255,0.80)', marginTop: 3, flexShrink: 0 }}>✦</span>
              <div>
                <div style={{ ...T.caption, fontWeight: 600, color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase' }}>{item.gesture}</div>
                <div style={{ ...T.micro, color: 'rgba(255,255,255,0.52)', marginTop: 3 }}>{item.desc}</div>
              </div>
            </div>
          ))}

          <Divider w="100%" />

          {/* Keyboard */}
          <div style={{ ...T.caption, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginBottom: 12 }}>
            Keyboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <KeyBadge label="V" />
            <span style={{ ...T.micro, color: 'rgba(255,255,255,0.68)' }}>Cycle color palette</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyBadge label="?" />
            <span style={{ ...T.micro, color: 'rgba(255,255,255,0.68)' }}>Toggle this guide</span>
          </div>

          {/* Palettes */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ ...T.caption, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 8 }}>
              Palettes
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PALETTE_NAMES.map((name) => (
                <span key={name} style={{ ...T.micro, fontWeight: 500, color: 'rgba(255,255,255,0.62)' }}>{name}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   CAMERA PREVIEW — bottom-right
   ═════════════════════════════════════════════ */
export function CameraPreview({ videoRef, skelCanvasRef, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cam"
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          exit={{ opacity: 0, scale: 0.92, y: 8, transition: { duration: 0.35 } }}
          style={{
            position: 'fixed', bottom: 32, right: 36,
            width: 128, height: 96, borderRadius: 6,
            overflow: 'hidden', border: '1px solid rgba(48,148,255,0.22)',
            background: 'rgba(2,4,8,0.7)', backdropFilter: 'blur(8px)',
            fontFamily: FONT,
          }}
        >
          <video
            ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.65 }}
          />
          <canvas
            ref={skelCanvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
          />
          <div style={{
            position: 'absolute', bottom: 5, left: 7,
            ...T.micro, color: 'rgba(48,148,255,0.75)', textTransform: 'uppercase',
          }}>
            Tracking
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
