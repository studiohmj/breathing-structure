import { motion } from 'framer-motion';

const FONT    = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";
const DISPLAY = "'Bebas Neue', system-ui, sans-serif";

function SplitText({ text, startDelay, charDelay = 0.040 }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: startDelay + i * charDelay,
            duration: 0.62,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  );
}

function PulseRings() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [0.12, 2.1], opacity: [0.20, 0] }}
          transition={{
            delay: 1.7 + i * 1.55,
            duration: 6.2,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 1],
          }}
          style={{
            position: 'absolute',
            width: 440, height: 440,
            borderRadius: '50%',
            border: '1px solid rgba(48,148,255,0.85)',
          }}
        />
      ))}
    </div>
  );
}

export default function LandingScreen({ onEnter }) {
  const titleSize = 'clamp(64px, 10.5vw, 136px)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#020408', fontFamily: FONT,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Scan line sweep */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: '200%' }}
        transition={{ delay: 0.08, duration: 1.8, ease: 'linear' }}
        style={{
          position: 'absolute', left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(48,148,255,0.055), transparent)',
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      {/* Expanding pulse rings */}
      <PulseRings />

      {/* Central glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 2.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 640, height: 640,
          background: 'radial-gradient(circle, rgba(16,56,160,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient horizontal lines — 4 lines, 2 above + 2 below */}
      {[0.11, 0.27, 0.73, 0.89].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: i === 1 || i === 2 ? 0.048 : 0.028 }}
          transition={{ delay: 0.14 + i * 0.10, duration: 2.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: `${pos * 100}%`,
            left: 0, right: 0, height: 1,
            background: 'rgba(48,140,255,1)',
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Content */}
      <div style={{
        width: '100%', maxWidth: 720,
        padding: '0 clamp(24px, 5vw, 48px)',
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
      }}>

        {/* Title — slow breathing pulse after reveal */}
        <motion.div
          animate={{ scale: [1, 1.005, 1] }}
          transition={{ delay: 1.5, duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginBottom: 24 }}
        >
          <div style={{
            fontFamily: DISPLAY,
            fontSize: titleSize,
            fontWeight: 400,
            letterSpacing: '0.09em',
            paddingLeft: '0.09em',
            color: 'rgba(255,255,255,0.96)',
            lineHeight: 0.95,
            overflow: 'hidden',
          }}>
            <SplitText text="BREATHING" startDelay={0.18} />
          </div>

          <div style={{
            fontFamily: DISPLAY,
            fontSize: titleSize,
            fontWeight: 400,
            letterSpacing: '0.09em',
            paddingLeft: '0.09em',
            color: 'rgba(255,255,255,0.96)',
            lineHeight: 0.95,
            overflow: 'hidden',
            marginTop: 6,
          }}>
            <SplitText text="STRUCTURE" startDelay={0.52} />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(13px, 1.4vw, 15px)',
            fontWeight: 300,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.44)',
            lineHeight: 1.5,
            marginBottom: 48,
            fontFamily: FONT,
          }}
        >
          숨이 형태가 된다
        </motion.div>

        {/* Divider + lower section fade in as a unit for consistent Y alignment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.38, duration: 0.7 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.40, duration: 0.9, ease: 'easeOut' }}
            style={{
              width: '100%', height: 1,
              background: 'rgba(255,255,255,0.08)',
              marginBottom: 22,
              transformOrigin: 'center',
            }}
          />

          <div style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.22)',
            textTransform: 'uppercase',
            marginBottom: 22,
            fontFamily: FONT,
          }}>
            Interactive Installation · 2026
          </div>

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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.24em',
              fontFamily: FONT,
              textTransform: 'uppercase',
              cursor: 'none',
              outline: 'none',
              transition: 'border-color 0.22s, color 0.22s, background 0.22s',
            }}
          >
            Enter →
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  );
}
