import { motion } from 'framer-motion';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

const HAND_LIST = [
  { name: '손 펼치기',      desc: '구조체가 팽창·개화한다' },
  { name: '주먹 쥐기',      desc: '구조체가 수축·위축한다' },
  { name: '검지 가리키기',  desc: '에너지 빔 발사 + 카메라 이동' },
  { name: '록 사인',        desc: '카메라 충격파' },
];

const MOUSE_LIST = [
  { name: '마우스 이동',    desc: '3D 공간 시차 효과' },
  { name: '스크롤',         desc: '개방도 연속 조절' },
  { name: '클릭',           desc: '열기 / 닫기 전환' },
  { name: '클릭 홀드',      desc: '에너지 차징 후 폭발' },
  { name: '우클릭',         desc: '충격파 발생' },
  { name: '더블클릭',       desc: '팔레트 전환' },
];

const KEY_LIST = [
  { name: 'Space',          desc: '에너지 최대 폭발' },
  { name: '1 / 2 / 3 / 4', desc: '제스처 시뮬레이션' },
  { name: 'V',              desc: '색상 팔레트 전환' },
  { name: '?',              desc: '조작 가이드 열기' },
];

// ── Animation variants ───────────────────────────────────────────
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.10 } },
};
const itemV = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
};

// ── Interaction column ───────────────────────────────────────────
function InteractionCol({ title, items, accentColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Column header */}
      <div style={{
        fontSize: 9, fontWeight: 600,
        letterSpacing: '0.30em',
        color: accentColor,
        textTransform: 'uppercase',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {title}
      </div>

      {/* Items */}
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          paddingBottom: 14,
          marginBottom: 2,
          borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.72)',
            textTransform: 'uppercase',
            lineHeight: 1.4,
            marginBottom: 3,
          }}>
            {item.name}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 400,
            letterSpacing: '0.01em',
            color: 'rgba(255,255,255,0.32)',
            lineHeight: 1.5,
          }}>
            {item.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────
const HR = ({ mt = 48, mb = 40 }) => (
  <div style={{
    height: 1,
    background: 'rgba(255,255,255,0.07)',
    marginTop: mt,
    marginBottom: mb,
  }} />
);

// ── Main component ───────────────────────────────────────────────
export default function LandingScreen({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.65, ease: 'easeInOut' } }}
      transition={{ duration: 0.45 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#020408',
        fontFamily: FONT,
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: 'clamp(40px, 6vh, 72px) clamp(32px, 8vw, 120px)',
      }}
    >
      {/* Ambient horizontal rules */}
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.038 }}
          transition={{ delay: 0.3 + i * 0.14, duration: 2.0, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: `${18 + i * 31}%`,
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
        style={{ width: '100%', maxWidth: 800, position: 'relative', zIndex: 1 }}
      >

        {/* ── 01 · Category + Title ──────────────────────────── */}
        <motion.div variants={itemV} style={{ marginBottom: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 500,
            letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.28)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Interactive Installation · 2026
          </div>

          <div style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 200,
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.02,
            textTransform: 'uppercase',
          }}>
            BREATHING
          </div>
          <div style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 200,
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.02,
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            STRUCTURE
          </div>
        </motion.div>

        {/* ── 02 · Tagline + Description ─────────────────────── */}
        <motion.div variants={itemV} style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            fontWeight: 300,
            letterSpacing: '0.03em',
            color: 'rgba(255,255,255,0.60)',
            lineHeight: 1.6,
            marginBottom: 16,
          }}>
            손의 움직임이 만들어내는 살아있는 구조체
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.36)',
            lineHeight: 1.85,
            maxWidth: 520,
          }}>
            WebGL과 실시간 손 인식을 결합한 인터랙티브 설치 작품.
            3D 파티클 구조체는 손의 제스처와 움직임에 반응하며
            살아 숨쉬는 유기체처럼 변형된다. 카메라 없이도
            마우스만으로 구조체의 모든 상태를 제어할 수 있다.
          </div>
        </motion.div>

        {/* ── 03 · Interaction Grid ──────────────────────────── */}
        <HR mt={52} mb={40} />

        <motion.div variants={itemV} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0 48px',
        }}>
          <InteractionCol
            title="핸드 트래킹"
            items={HAND_LIST}
            accentColor="rgba(48,148,255,0.60)"
          />
          <InteractionCol
            title="마우스 조작"
            items={MOUSE_LIST}
            accentColor="rgba(255,255,255,0.30)"
          />
          <InteractionCol
            title="키보드"
            items={KEY_LIST}
            accentColor="rgba(255,255,255,0.22)"
          />
        </motion.div>

        {/* ── 04 · Tech + CTA ────────────────────────────────── */}
        <HR mt={48} mb={36} />

        <motion.div variants={itemV} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px 24px',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 500,
            letterSpacing: '0.24em',
            color: 'rgba(255,255,255,0.22)',
            textTransform: 'uppercase',
            lineHeight: 2,
          }}>
            WebGL &nbsp;·&nbsp; Three.js &nbsp;·&nbsp; MediaPipe &nbsp;·&nbsp; React
          </div>

          <motion.button
            onClick={onEnter}
            whileHover={{
              borderColor: 'rgba(48,148,255,0.65)',
              color: 'rgba(255,255,255,0.95)',
              background: 'rgba(18,48,110,0.20)',
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 44px',
              border: '1px solid rgba(48,148,255,0.28)',
              borderRadius: 3,
              background: 'rgba(16,40,100,0.08)',
              color: 'rgba(255,255,255,0.68)',
              fontSize: 11, fontWeight: 500,
              letterSpacing: '0.26em',
              fontFamily: FONT,
              textTransform: 'uppercase',
              cursor: 'none',
              outline: 'none',
              transition: 'border-color 0.25s, color 0.25s, background 0.25s',
            }}
          >
            Enter Experience →
          </motion.button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
