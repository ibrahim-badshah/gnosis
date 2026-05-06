import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, LogIn, Terminal, Code2, Braces, Database, Cpu, Network, Binary } from 'lucide-react';

/* ── Floating code particles ── */
const codeSnippets = [
  'const x = 42;', 'if (n > 0)', 'return true;', 'while (i--)',
  'async fn()', '[ ...arr ]', '{ key: val }', 'import *',
  '<Component />', 'npm install', 'git commit', 'SELECT *',
  'def main():', 'for i in range', 'class Node:', '#include <io>',
  '0x1F4A9', 'sudo rm -rf', 'console.log', 'O(n log n)',
];

function FloatingParticle({ delay, snippet }: { delay: number; snippet: string }) {
  const x = Math.random() * 100;
  const duration = 12 + Math.random() * 10;
  return (
    <motion.div
      className="landing-particle"
      initial={{ opacity: 0, y: '110vh', x: `${x}vw` }}
      animate={{ opacity: [0, 0.35, 0.35, 0], y: '-10vh' }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      style={{ left: `${x}%` }}
    >
      {snippet}
    </motion.div>
  );
}

/* ── Matrix rain column ── */
function MatrixColumn({ col, totalCols }: { col: number; totalCols: number }) {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}[];=+/*&|^~%$#@!'.split('');
  const [stream, setStream] = useState<string[]>([]);
  const speed = 60 + Math.random() * 80;
  const colWidth = 100 / totalCols;

  useEffect(() => {
    const interval = setInterval(() => {
      setStream(prev => {
        const next = [...prev, chars[Math.floor(Math.random() * chars.length)]];
        return next.length > 24 ? next.slice(-24) : next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="matrix-col"
      style={{ left: `${col * colWidth}%`, width: `${colWidth}%` }}
    >
      {stream.map((c, i) => (
        <span
          key={i}
          style={{
            opacity: i === stream.length - 1 ? 1 : 0.05 + (i / stream.length) * 0.25,
            color: i === stream.length - 1 ? '#5ff5a0' : '#1aff6644',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ── Book opening animation ── */
function BookAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=closed, 1=opening, 2=open, 3=zoom

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <motion.div
      className="book-anim-overlay"
      initial={{ opacity: 1 }}
      animate={phase === 3 ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Matrix background */}
      <div className="book-anim-matrix">
        {Array.from({ length: 30 }).map((_, i) => (
          <MatrixColumn key={i} col={i} totalCols={30} />
        ))}
      </div>

      <div className="book-3d-scene">
        {/* Book container */}
        <motion.div
          className="book-3d"
          animate={
            phase >= 1
              ? { rotateY: 0, scale: phase >= 3 ? 3 : 1 }
              : { rotateY: -30, scale: 0.85 }
          }
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Back cover */}
          <div className="book-cover book-back" />

          {/* Pages */}
          <div className="book-pages">
            <motion.div
              className="book-page"
              animate={phase >= 1 ? { rotateY: -160 } : { rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="book-page-content">
                <Binary size={20} style={{ color: '#5ff5a0' }} />
                <span>01001</span>
              </div>
            </motion.div>
            <motion.div
              className="book-page"
              animate={phase >= 1 ? { rotateY: -150 } : { rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="book-page-content">
                <Code2 size={20} style={{ color: '#f0c040' }} />
                <span>{'{ }'}</span>
              </div>
            </motion.div>
            <motion.div
              className="book-page"
              animate={phase >= 1 ? { rotateY: -140 } : { rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="book-page-content">
                <Database size={18} style={{ color: '#4361ee' }} />
                <span>SQL</span>
              </div>
            </motion.div>
          </div>

          {/* Front cover */}
          <motion.div
            className="book-cover book-front"
            animate={phase >= 1 ? { rotateY: -170 } : { rotateY: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="book-front-face">
              <Terminal size={36} style={{ marginBottom: 8 }} />
              <span className="book-title-text">GNOSIS</span>
              <span className="book-subtitle-text">CS Dictionary</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Glow effect when book opens */}
        <motion.div
          className="book-glow"
          animate={phase >= 2 ? { opacity: 0.6, scale: 1.5 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Title that appears when book is open */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            className="book-anim-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Loading your dictionary...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Landing Page ── */
export default function Landing() {
  const navigate = useNavigate();
  const [showBookAnim, setShowBookAnim] = useState(false);
  const [animTarget, setAnimTarget] = useState<string>('/home');

  const handleGetStarted = () => {
    // Clear guest progress for a fresh start
    localStorage.removeItem('gnosis-explored-guest');
    localStorage.removeItem('gnosis-quiz-guest');
    localStorage.removeItem('gnosis-streak-guest');
    localStorage.removeItem('gnosis-last-visit-guest');
    setAnimTarget('/home');
    setShowBookAnim(true);
  };

  const handleSignIn = () => {
    setAnimTarget('/auth');
    setShowBookAnim(true);
  };

  const handleBookAnimComplete = () => {
    navigate(animTarget);
  };

  return (
    <>
      <AnimatePresence>
        {showBookAnim && (
          <BookAnimation onComplete={handleBookAnimComplete} />
        )}
      </AnimatePresence>

      <div className="landing-page">
        {/* Animated background particles */}
        <div className="landing-bg">
          {codeSnippets.map((s, i) => (
            <FloatingParticle key={i} delay={i * 0.7} snippet={s} />
          ))}
          {/* Gradient mesh */}
          <div className="landing-mesh" />
        </div>

        {/* Hero content */}
        <div className="landing-content">
          {/* Logo / Icon */}
          <motion.div
            className="landing-logo-ring"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="landing-logo-inner">
              <BookOpen size={48} strokeWidth={1.5} />
            </div>
            {/* Orbiting icons */}
            <motion.div
              className="orbit-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="orbit-icon" style={{ top: '-14px', left: '50%', transform: 'translateX(-50%)' }}><Terminal size={16} /></div>
              <div className="orbit-icon" style={{ bottom: '-14px', left: '50%', transform: 'translateX(-50%)' }}><Braces size={16} /></div>
              <div className="orbit-icon" style={{ top: '50%', left: '-14px', transform: 'translateY(-50%)' }}><Database size={16} /></div>
              <div className="orbit-icon" style={{ top: '50%', right: '-14px', transform: 'translateY(-50%)' }}><Cpu size={16} /></div>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="landing-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Gnosis
          </motion.h1>

          <motion.p
            className="landing-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            The Ultimate Computer Science Dictionary
          </motion.p>

          <motion.p
            className="landing-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            Explore 100+ CS terms with interactive code examples, quizzes, AI-powered explanations,
            and concept maps — all in a beautiful, book-inspired interface.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            className="landing-features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { icon: <Code2 size={15} />, label: 'Code Examples' },
              { icon: <Cpu size={15} />, label: 'AI Powered' },
              { icon: <Network size={15} />, label: 'Concept Maps' },
              { icon: <Terminal size={15} />, label: 'Interactive Quiz' },
            ].map((f, i) => (
              <div key={i} className="landing-feature-badge">
                {f.icon}
                <span>{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="landing-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <button className="landing-btn landing-btn-primary" onClick={handleGetStarted}>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            <button className="landing-btn landing-btn-secondary" onClick={handleSignIn}>
              <LogIn size={18} />
              <span>Sign In / Sign Up</span>
            </button>
          </motion.div>

          {/* Bottom hint */}
          <motion.p
            className="landing-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            Sign in to save your progress and sync across devices
          </motion.p>
        </div>
      </div>
    </>
  );
}
