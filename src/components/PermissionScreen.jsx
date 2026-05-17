import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store.js';

const FONT = "'Pretendard Variable', 'Pretendard', system-ui, sans-serif";

function CamIcon() {
  return (
    <motion.svg
      width="40" height="34" viewBox="0 0 40 34"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.rect
        x="1" y="7" width="38" height="24" rx="3.5"
        stroke="rgba(48,148,255,0.45)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
      />
      <motion.circle
        cx="20" cy="19" r="7"
        stroke="rgba(48,148,255,0.38)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
      />
      <motion.circle
        cx="20" cy="19" r="3"
        fill="rgba(40,120,255,0.22)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      />
      <motion.rect
        x="13" y="2" width="7" height="5" rx="1.5"
        stroke="rgba(48,148,255,0.28)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      />
    </motion.svg>
  );
}

export default function PermissionScreen({ onAllow, onSkip }) {
  const [requesting, setRequesting] = useState(false);
  const [error, setError]           = useState(null);

  const handleAllow = async () => {
    setRequesting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      useStore.getState().setCameraAllowed(true);
      onAllow(stream);
    } catch (err) {
      console.warn('Camera access denied:', err);
      setError('Camera access denied. Continuing with mouse interaction.');
      setTimeout(onSkip, 2000);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(2,4,8,0.90)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 320,
          padding: '44px 40px 36px',
          border: '1px solid rgba(48,148,255,0.12)',
          borderRadius: 10,
          background: 'rgba(4,8,18,0.88)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 0 80px rgba(16,50,120,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <CamIcon />

        {/* Headline — L1 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 20, fontWeight: 300,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.82)',
            textAlign: 'center',
            lineHeight: 1.45,
            marginTop: 26,
          }}
        >
          카메라로 손을 인식합니다
        </motion.div>

        {/* Body — L3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          style={{
            fontSize: 11, fontWeight: 400,
            letterSpacing: '0.03em',
            color: 'rgba(255,255,255,0.52)',
            textAlign: 'center',
            lineHeight: 1.65,
            marginTop: 14, marginBottom: 32,
          }}
        >
          웹캠 영상은 브라우저 내에서만 처리됩니다.<br />외부로 전송되거나 저장되지 않습니다.
        </motion.div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 10, fontWeight: 400,
                letterSpacing: '0.06em',
                color: 'rgba(255,110,80,0.7)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
            >
              {/* Primary CTA */}
              <motion.button
                onClick={handleAllow}
                disabled={requesting}
                whileHover={{ borderColor: 'rgba(48,148,255,0.42)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '13px 0',
                  border: '1px solid rgba(48,148,255,0.26)',
                  borderRadius: 5,
                  background: 'rgba(20,55,120,0.16)',
                  color: 'rgba(255,255,255,0.76)',
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.18em',
                  fontFamily: FONT,
                  textTransform: 'uppercase',
                  cursor: requesting ? 'wait' : 'none',
                  transition: 'border-color 0.2s',
                }}
              >
                {requesting ? 'Requesting…' : 'Allow Camera →'}
              </motion.button>

              {/* Secondary — skip */}
              <motion.button
                onClick={onSkip}
                whileHover={{ opacity: 0.65 }}
                style={{
                  padding: '9px 0',
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.58)',
                  fontSize: 9, fontWeight: 500,
                  letterSpacing: '0.16em',
                  fontFamily: FONT,
                  textTransform: 'uppercase',
                  cursor: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                Continue with mouse · keyboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
