import { motion } from 'framer-motion';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.10 } },
};
const itemV = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
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
        background: '#020408',
        fontFamily: FONT,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient lines */}
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.038 }}
          transition={{ delay: 0.25 + i * 0.14, duration: 2.0, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: `${18 + i * 30}%`,
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
          maxWidth: 600,
          padding: '0 clamp(32px, 8vw, 80px)',
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Category label */}
        <motion.div variants={itemV} style={{
          fontSize: 9, fontWeight: 500, letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase',
          marginBottom: 22,
        }}>
          Interactive Installation · 2026
        </motion.div>

        {/* Title */}
        <motion.div variants={itemV} style={{ marginBottom: 30 }}>
          <div style={{
            fontSize: 'clamp(44px, 9vw, 88px)', fontWeight: 200,
            letterSpacing: '0.38em', color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.02, textTransform: 'uppercase',
          }}>
            BREATHING
          </div>
          <div style={{
            fontSize: 'clamp(44px, 9vw, 88px)', fontWeight: 200,
            letterSpacing: '0.38em', color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.02, textTransform: 'uppercase', marginTop: 4,
          }}>
            STRUCTURE
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemV} style={{
          fontSize: 'clamp(14px, 1.8vw, 17px)', fontWeight: 300,
          letterSpacing: '0.03em', color: 'rgba(255,255,255,0.68)',
          lineHeight: 1.6, marginBottom: 14,
        }}>
          손의 움직임이 만들어내는 살아있는 구조체
        </motion.div>

        {/* Description */}
        <motion.div variants={itemV} style={{
          fontSize: 13, fontWeight: 400, letterSpacing: '0.02em',
          color: 'rgba(255,255,255,0.50)', lineHeight: 1.85,
          marginBottom: 52,
        }}>
          WebGL과 실시간 손 인식을 결합한 인터랙티브 설치 작품.
          제스처와 마우스 움직임으로 3D 구조체를 직접 조작하며
          살아있는 유기체 같은 반응을 경험한다.
        </motion.div>

        {/* Divider + CTA row */}
        <motion.div variants={itemV}>
          <div style={{
            height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 36,
          }} />

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 500, letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase',
            }}>
              WebGL · Three.js · MediaPipe · React
            </div>

            <motion.button
              onClick={onEnter}
              whileHover={{
                borderColor: 'rgba(48,148,255,0.72)',
                color: 'rgba(255,255,255,0.96)',
                background: 'rgba(18,48,110,0.24)',
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 44px',
                border: '1px solid rgba(48,148,255,0.34)',
                borderRadius: 3,
                background: 'rgba(16,40,100,0.10)',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 11, fontWeight: 500,
                letterSpacing: '0.26em', fontFamily: FONT,
                textTransform: 'uppercase',
                cursor: 'none', outline: 'none',
                transition: 'border-color 0.22s, color 0.22s, background 0.22s',
              }}
            >
              Enter Experience →
            </motion.button>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
