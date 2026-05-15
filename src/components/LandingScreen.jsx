import { motion } from 'framer-motion';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const HAND_INTERACTIONS = [
  { gesture: '손 펼치기',     effect: '구조체가 팽창·개화한다' },
  { gesture: '주먹 쥐기',     effect: '구조체가 수축·위축한다' },
  { gesture: '검지 가리키기', effect: '에너지 빔 + 카메라 이동' },
  { gesture: '록 사인',       effect: '카메라 충격파' },
];

const MOUSE_INTERACTIONS = [
  { gesture: '마우스 이동',   effect: '3D 시차 효과' },
  { gesture: '마우스 클릭',   effect: '구조체 열기 / 닫기' },
  { gesture: 'V 키',          effect: '색상 팔레트 전환' },
  { gesture: '? 키',          effect: '조작 가이드 열기' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
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
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#020408',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT,
        padding: '40px clamp(28px, 10vw, 140px)',
        overflowY: 'auto',
      }}
    >
      {/* Ambient horizontal lines */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.042 }}
          transition={{ delay: 0.35 + i * 0.16, duration: 1.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: `${20 + i * 30}%`,
            left: 0, right: 0, height: 1,
            background: 'rgba(48,140,255,1)',
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          width: '100%', maxWidth: 740,
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Category label */}
        <motion.div variants={fadeUp} style={{
          fontSize: 10, fontWeight: 500,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          marginBottom: 22,
        }}>
          Interactive Installation · 2026
        </motion.div>

        {/* Hero title */}
        <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 'clamp(38px, 7.5vw, 76px)',
            fontWeight: 200,
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.03,
            textTransform: 'uppercase',
          }}>
            BREATHING
          </div>
          <div style={{
            fontSize: 'clamp(38px, 7.5vw, 76px)',
            fontWeight: 200,
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.03,
            textTransform: 'uppercase',
            marginTop: 6,
          }}>
            STRUCTURE
          </div>
        </motion.div>

        {/* Korean tagline */}
        <motion.div variants={fadeUp} style={{
          fontSize: 'clamp(14px, 2vw, 19px)',
          fontWeight: 300,
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          손의 움직임이 만들어내는 살아있는 구조체
        </motion.div>

        {/* Description */}
        <motion.div variants={fadeUp} style={{
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: 'rgba(255,255,255,0.38)',
          lineHeight: 1.8,
          maxWidth: 500,
          marginBottom: 52,
        }}>
          WebGL과 실시간 손 인식을 결합한 인터랙티브 설치 작품.
          3D 파티클 구조체는 손의 제스처와 움직임에 반응하며
          살아 숨쉬는 유기체처럼 변형된다. 카메라가 없어도
          마우스만으로 구조체와 상호작용할 수 있다.
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} style={{
          height: 1, background: 'rgba(255,255,255,0.08)',
          marginBottom: 42,
        }} />

        {/* Interaction grid */}
        <motion.div variants={fadeUp} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px 56px',
          marginBottom: 52,
        }}>
          {/* Hand tracking column */}
          <div>
            <div style={{
              fontSize: 9, fontWeight: 600,
              letterSpacing: '0.30em',
              color: 'rgba(48,148,255,0.65)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              핸드 트래킹
            </div>
            {HAND_INTERACTIONS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <span style={{
                  fontSize: 7, color: 'rgba(48,148,255,0.50)',
                  marginTop: 4, flexShrink: 0,
                }}>✦</span>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: 'rgba(255,255,255,0.72)',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                  }}>{item.gesture}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 400,
                    letterSpacing: '0.01em',
                    color: 'rgba(255,255,255,0.36)',
                    marginTop: 3,
                    lineHeight: 1.5,
                  }}>{item.effect}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mouse column */}
          <div>
            <div style={{
              fontSize: 9, fontWeight: 600,
              letterSpacing: '0.30em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              마우스 조작
            </div>
            {MOUSE_INTERACTIONS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <span style={{
                  fontSize: 7, color: 'rgba(255,255,255,0.25)',
                  marginTop: 4, flexShrink: 0,
                }}>✦</span>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: 'rgba(255,255,255,0.72)',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                  }}>{item.gesture}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 400,
                    letterSpacing: '0.01em',
                    color: 'rgba(255,255,255,0.36)',
                    marginTop: 3,
                    lineHeight: 1.5,
                  }}>{item.effect}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} style={{
          height: 1, background: 'rgba(255,255,255,0.08)',
          marginBottom: 40,
        }} />

        {/* Footer row: tech + CTA */}
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 500,
            letterSpacing: '0.24em',
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}>
            WebGL · Three.js · MediaPipe · React
          </div>

          <motion.button
            onClick={onEnter}
            whileHover={{
              borderColor: 'rgba(48,148,255,0.60)',
              color: 'rgba(255,255,255,0.95)',
              background: 'rgba(16,44,100,0.22)',
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 44px',
              border: '1px solid rgba(48,148,255,0.32)',
              borderRadius: 4,
              background: 'rgba(16,44,100,0.10)',
              color: 'rgba(255,255,255,0.72)',
              fontSize: 11, fontWeight: 500,
              letterSpacing: '0.24em',
              fontFamily: FONT,
              textTransform: 'uppercase',
              cursor: 'none',
              transition: 'border-color 0.25s, color 0.25s, background 0.25s',
              outline: 'none',
            }}
          >
            Enter Experience →
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
