import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Terminal, Code2, Braces, Hash } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

/* ── Floating code particles (same as Landing) ── */
const codeSnippets = [
  'const x = 42;', 'if (n > 0)', 'return true;', 'while (i--)',
  'async fn()', '[ ...arr ]', '{ key: val }', 'import *',
  '<Component />', 'npm install', 'git commit', 'SELECT *',
  'def main():', 'for i in range', 'class Node:', '#include <io>',
  '0x1F4A9', 'console.log', 'O(n log n)', 'ssh root@',
];

function FloatingParticle({ delay, snippet }: { delay: number; snippet: string }) {
  const x = Math.random() * 100;
  const duration = 14 + Math.random() * 10;
  return (
    <motion.div
      className="landing-particle"
      initial={{ opacity: 0, y: '110vh', x: `${x}vw` }}
      animate={{ opacity: [0, 0.3, 0.3, 0], y: '-10vh' }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      style={{ left: `${x}%` }}
    >
      {snippet}
    </motion.div>
  );
}

/* ── Auth Form on a book page ── */
function AuthForm({ isLogin, onToggle }: { isLogin: boolean; onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset fields when switching modes
  useEffect(() => {
    setError(null);
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const securePassword = password + "Gnosis!@#$1234";
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: securePassword });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password: securePassword,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (!data.session) {
          throw new Error('Please go to Supabase Dashboard -> Authentication -> Providers -> Email and turn OFF "Confirm email", then sign in again.');
        }
      }
      navigate('/home');
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('Please go to Supabase Dashboard -> Authentication -> Providers -> Email and turn OFF "Confirm email", then sign in again.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-book-page-content">
      {/* Book page ruled lines (decorative) */}
      <div className="auth-ruled-lines" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="auth-ruled-line" />
        ))}
      </div>

      {/* Red margin line */}
      <div className="auth-margin-line" aria-hidden="true" />

      {/* Page header */}
      <div className="auth-page-header">
        <div className="auth-page-chapter">
          {isLogin ? 'Chapter I' : 'Chapter II'}
        </div>
        <h2 className="auth-page-title">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="auth-page-subtitle">
          {isLogin 
            ? 'Welcome back, explorer. Enter your credentials to continue.' 
            : 'Join Gnosis and begin your computer science journey.'
          }
        </p>
      </div>

      {/* Error */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleAuth} className="auth-form">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              key="name-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="auth-field"
            >
              <label className="auth-label">
                <Hash size={14} />
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your Name"
                className="auth-input"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-field">
          <label className="auth-label">
            <Terminal size={14} />
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-label">
              <Code2 size={14} />
              Password
            </label>
            {isLogin && (
              <button
                type="button"
                className="auth-forgot"
                onClick={() => alert("Forgot password functionality is coming soon!")}
              >
                Forgot?
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={18} className="spin" />
          ) : isLogin ? (
            <><LogIn size={18} /> Sign In</>
          ) : (
            <><UserPlus size={18} /> Sign Up</>
          )}
        </button>
      </form>

      {/* Toggle */}
      <div className="auth-toggle-section">
        <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
        <button onClick={onToggle} className="auth-toggle-btn">
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Auth Page ── */
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [flipKey, setFlipKey] = useState(0);
  const navigate = useNavigate();

  const handleToggle = () => {
    setFlipKey(prev => prev + 1);
    // Small delay so flip starts before content changes
    setTimeout(() => setIsLogin(prev => !prev), 150);
  };

  return (
    <div className="auth-page">
      {/* Same animated background as landing */}
      <div className="landing-bg">
        {codeSnippets.map((s, i) => (
          <FloatingParticle key={i} delay={i * 0.8} snippet={s} />
        ))}
        <div className="landing-mesh" />
      </div>

      {/* Back button */}
      <motion.button
        className="auth-back-btn"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </motion.button>

      {/* Book container */}
      <motion.div
        className="auth-book-container"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Book spine */}
        <div className="auth-book-spine">
          <span className="auth-spine-text">GNOSIS</span>
        </div>

        {/* Book body with page-turn animation */}
        <div className="auth-book-body">
          {/* Page turn 3D wrapper */}
          <div className="auth-page-turn-scene">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={flipKey}
                className="auth-book-page"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.4, 0, 0.2, 1],
                  rotateY: { duration: 0.6 },
                }}
              >
                <AuthForm isLogin={isLogin} onToggle={handleToggle} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Book shadow pages stacked underneath */}
          <div className="auth-book-stack-1" />
          <div className="auth-book-stack-2" />
          <div className="auth-book-stack-3" />
        </div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        className="auth-branding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <BookOpen size={16} />
        <span>Gnosis — The CS Dictionary</span>
      </motion.div>
    </div>
  );
}
