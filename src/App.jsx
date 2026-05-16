import { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/store.js';
import { useHandTracking } from './hooks/useHandTracking.js';
import Scene from './components/Scene.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import PermissionScreen from './components/PermissionScreen.jsx';
import { Branding, StatusBar, CameraPreview, TopRight, FeatureGuide, CursorLightToggle } from './components/UI.jsx';

export default function App() {
  const [appPhase, setAppPhase] = useState('landing');
  const [cameraStream, setCameraStream] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const videoRef  = useRef(null);
  const skelRef   = useRef(null);
  const cursorRef = useRef(null);
  const setPhase  = useStore((s) => s.setPhase);
  const setPaletteIdx = useStore((s) => s.setPaletteIdx);

  useHandTracking(videoRef, skelRef);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Custom cursor
  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'v' || e.key === 'V') {
        setPaletteIdx(useStore.getState().paletteIdx + 1);
      }
      if (e.key === '?') {
        setShowGuide((v) => !v);
      }
      if (e.key === 'Escape') {
        setShowGuide(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteIdx]);

  // Auto-open guide when entering the experience
  useEffect(() => {
    if (appPhase === 'active') {
      const t = setTimeout(() => setShowGuide(true), 2600);
      return () => clearTimeout(t);
    }
  }, [appPhase]);

  const handleLandingEnter = () => setAppPhase('permission');

  const handleCameraAllow = (stream) => {
    setCameraStream(stream);
    setPhase('active');
    setAppPhase('active');
  };

  const handleCameraSkip = () => {
    setPhase('active');
    setAppPhase('active');
  };

  return (
    <>
      {/* Three.js canvas */}
      <Scene />

      {/* Screen overlays */}
      <AnimatePresence mode="wait">
        {appPhase === 'landing' && (
          <LandingScreen key="landing" onEnter={handleLandingEnter} />
        )}
        {appPhase === 'permission' && (
          <PermissionScreen
            key="permission"
            onAllow={handleCameraAllow}
            onSkip={handleCameraSkip}
          />
        )}
      </AnimatePresence>

      {/* Active HUD */}
      {appPhase === 'active' && (
        <>
          <Branding />
          <TopRight onHelp={() => setShowGuide((v) => !v)} />
          <CursorLightToggle />
          <StatusBar />
          <FeatureGuide visible={showGuide} onClose={() => setShowGuide(false)} />
          <CameraPreview
            videoRef={videoRef}
            skelCanvasRef={skelRef}
            visible={!!cameraStream}
          />
        </>
      )}

      {/* Vignette overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(2,4,8,0.6) 100%)',
      }} />

      {/* Custom cursor */}
      <div id="cursor" ref={cursorRef} />
    </>
  );
}
