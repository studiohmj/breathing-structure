import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const SEQUENCE = [
  { pct: 14,  label: 'Initializing renderer' },
  { pct: 30,  label: 'Building spatial mesh' },
  { pct: 52,  label: 'Loading interaction layer' },
  { pct: 70,  label: 'Calibrating breath cycle' },
  { pct: 88,  label: 'Entering atmosphere' },
  { pct: 100, label: 'Ready' },
];

export default function LoadingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    let t;
    const advance = (i) => {
      if (!mounted) return;
      if (i >= SEQUENCE.length) {
        t = setTimeout(() => {
          if (!mounted) return;
          setDone(true);
          setTimeout(() => { if (mounted) onComplete(); }, 600);
        }, 380);
        return;
      }
      setStep(i);
      t = setTimeout(() => advance(i + 1), 480 + i * 70);
    };
    t = setTimeout(() => advance(0), 320);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  const pct   = SEQUENCE[step]?.pct ?? 100;
  const label = SEQUENCE[step]?.label ?? '';

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loading"
          exit={{ opacity: 0, transition: { duration: 0.75, ease: 'easeInOut' } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: '#020408',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT,
          }}
        >
          {/* ── Hero title — L1 */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            {/* Category label — L2 */}
            <div style={{
              fontSize: 9, fontWeight: 500,
              letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.18)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Interactive Installation · 2026
            </div>

            {/* Display title — L1 */}
            <div style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 200,
              letterSpacing: '0.46em',
              color: 'rgba(255,255,255,0.86)',
              lineHeight: 1.05,
              textTransform: 'uppercase',
            }}>
              BREATHING
            </div>
            <div style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 200,
              letterSpacing: '0.46em',
              color: 'rgba(255,255,255,0.86)',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
              STRUCTURE
            </div>
          </motion.div>

          {/* ── Progress block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            style={{ width: 148, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {/* Progress bar */}
            <div style={{
              width: '100%', height: 1,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 1, overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(30,110,200,0.7) 0%, rgba(70,170,255,0.9) 100%)',
                  borderRadius: 1,
                  boxShadow: '0 0 10px rgba(70,160,255,0.35)',
                }}
              />
            </div>

            {/* Status label — L3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  style={{
                    fontSize: 8, fontWeight: 500,
                    letterSpacing: '0.16em',
                    color: 'rgba(255,255,255,0.20)',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </motion.div>
              </AnimatePresence>

              {/* Percentage — L4 mono */}
              <div style={{
                fontSize: 8, fontWeight: 400,
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.14)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {pct}%
              </div>
            </div>
          </motion.div>

          {/* Ambient horizontal lines */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.035 }}
              transition={{ delay: 0.5 + i * 0.14, duration: 1.4, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: `${28 + i * 22}%`,
                left: 0, right: 0, height: 1,
                background: 'rgba(48,140,255,1)',
                transformOrigin: 'center',
                pointerEvents: 'none',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
