import { motion } from 'framer-motion';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};
const itemV = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function LandingScreen({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#020408', fontFamily: FONT,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Ambient lines */}
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.038 }}
          transition={{ delay: 0.22 + i * 0.14, duration: 2.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: `${16 + i * 32}%`,
            left: 0, right: 0, height: 1,
            background: 'rgba(48,140,255,1)',
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div
        variants={containerV}
        initial="hidden"
        animate="show"
        style={{
          width: '100%',
          maxWidth: 580,
          padding: '0 clamp(24px, 5vw, 48px)',
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',       /* centre-align all children */
          textAlign: 'center',
        }}
      >
        {/* Category label */}
        <motion.div variants={itemV} style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.48)', textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          Interactive Installation · 2026
        </motion.div>

        {/* Title */}
        <motion.div variants={itemV} style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 'clamp(52px, 9vw, 96px)', fontWeight: 200,
            letterSpacing: '0.40em',
            color: 'rgba(255,255,255,0.94)',
            lineHeight: 1.0, textTransform: 'uppercase',
            /* cancel trailing letter-spacing so the block looks visually centred */
            paddingLeft: '0.40em',
          }}>
            BREATHING
          </div>
          <div style={{
            fontSize: 'clamp(52px, 9vw, 96px)', fontWeight: 200,
            letterSpacing: '0.40em',
            color: 'rgba(255,255,255,0.94)',
            lineHeight: 1.0, textTransform: 'uppercase',
            marginTop: 6, paddingLeft: '0.40em',
          }}>
            STRUCTURE
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemV} style={{
          fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300,
          letterSpacing: '0.02em', color: 'rgba(255,255,255,0.80)',
          lineHeight: 1.65, marginBottom: 14,
        }}>
          손의 움직임으로 숨쉬는 구조체
        </motion.div>

        {/* Description */}
        <motion.div variants={itemV} style={{
          fontSize: 13, fontWeight: 400, letterSpacing: '0.01em',
          color: 'rgba(255,255,255,0.62)', lineHeight: 1.9,
          marginBottom: 52,
        }}>
          WebGL · MediaPipe 기반의 실시간 인터랙티브 설치.<br />
          제스처와 마우스로 3D 구조체의 형태와 리듬을 조율한다.
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemV} style={{ width: '100%' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 28 }} />

          {/* Tech stack */}
          <div style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            WebGL · Three.js · MediaPipe · React
          </div>

          {/* CTA button — centred */}
          <motion.button
            onClick={onEnter}
            whileHover={{
              borderColor: 'rgba(48,148,255,0.70)',
              color: 'rgba(255,255,255,0.96)',
              background: 'rgba(18,48,110,0.22)',
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '13px 48px',
              border: '1px solid rgba(48,148,255,0.32)',
              borderRadius: 3,
              background: 'rgba(16,40,100,0.08)',
              color: 'rgba(255,255,255,0.80)',
              fontSize: 11, fontWeight: 600,
              letterSpacing: '0.24em', fontFamily: FONT,
              textTransform: 'uppercase',
              cursor: 'none', outline: 'none',
              transition: 'border-color 0.22s, color 0.22s, background 0.22s',
            }}
          >
            Enter →
          </motion.button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
