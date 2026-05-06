import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen, MessageCircle, HelpCircle, BarChart3, Bookmark, Sparkles, Volume2, Moon, Map, Brain, Trophy, Download, Keyboard, Send, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const features = [
  { icon: <BookOpen size={24} />, title: 'Explore Any CS Term', desc: 'Search any computer science term — if it\'s not in the dictionary, AI will generate a full definition with code examples on the fly.' },
  { icon: <HelpCircle size={24} />, title: 'Interactive Quiz', desc: 'Test your knowledge with category-based quizzes. Wrong answers show detailed explanations.' },
  { icon: <MessageCircle size={24} />, title: 'AI Chatbot', desc: 'Ask doubts, get learning roadmaps, and explore concepts not in the dictionary — powered by Gemini AI.' },
  { icon: <BarChart3 size={24} />, title: 'Quiz Analytics', desc: 'Track performance over time with charts showing strengths, weaknesses, and terms to review.' },
  { icon: <Bookmark size={24} />, title: 'Bookmarks & PDF Export', desc: 'Save terms for later and export your bookmarked collection as a printable PDF study guide.' },
  { icon: <Sparkles size={24} />, title: 'Word of the Day', desc: 'Daily curated term from unexplored words to keep you learning something new every day.' },
  { icon: <Volume2 size={24} />, title: 'Pronunciation', desc: 'Hear correct pronunciation of CS terms using browser speech synthesis.' },
  { icon: <Moon size={24} />, title: 'Sepia / Light / Dark Themes', desc: 'Three beautiful themes: classic sepia paper, clean light, and comfortable dark mode.' },
  { icon: <Map size={24} />, title: 'Concept Maps', desc: 'Interactive node graphs showing how concepts relate to each other.' },
  { icon: <Trophy size={24} />, title: 'Achievements & Gamification', desc: 'Earn badges for milestones like exploring words, acing quizzes, and building streaks.' },
  { icon: <Keyboard size={24} />, title: 'Keyboard Shortcuts', desc: 'Press / to search, navigate efficiently with keyboard shortcuts.' },
  { icon: <Brain size={24} />, title: 'Historical Context', desc: 'Every term includes the history of who created it, when, and why.' },
];

const techStack = [
  { name: 'React 18', desc: 'UI Library' },
  { name: 'TypeScript', desc: 'Type Safety' },
  { name: 'Vite', desc: 'Build Tool' },
  { name: 'Framer Motion', desc: 'Animations' },
  { name: 'Recharts', desc: 'Data Visualization' },
  { name: 'Highlight.js', desc: 'Syntax Highlighting' },
  { name: 'Lucide', desc: 'Icons' },
  { name: 'Supabase', desc: 'Backend & Auth' },
  { name: 'Gemini API', desc: 'AI Chatbot' },
  { name: 'Web Speech API', desc: 'Pronunciation' },
];

export default function About() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Save to Supabase
      const { error: dbError } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        user_name: user?.email?.split('@')[0] || 'guest',
        message: feedback.trim(),
      });

      if (dbError) {
        console.warn('Supabase feedback save failed, falling back to localStorage:', dbError.message);
        // Fallback to localStorage
        const existing = JSON.parse(localStorage.getItem('gnosis-feedback') || '[]');
        existing.push({
          text: feedback,
          user: user?.email || 'guest',
          date: new Date().toISOString(),
        });
        localStorage.setItem('gnosis-feedback', JSON.stringify(existing));
      }

      setSubmitted(true);
      setFeedback('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e: any) {
      // Fallback to localStorage on network error
      const existing = JSON.parse(localStorage.getItem('gnosis-feedback') || '[]');
      existing.push({
        text: feedback,
        user: user?.email || 'guest',
        date: new Date().toISOString(),
      });
      localStorage.setItem('gnosis-feedback', JSON.stringify(existing));

      setSubmitted(true);
      setFeedback('');
      setTimeout(() => setSubmitted(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-3">
        <h1 style={{ fontSize: '2.5rem' }}>Gnosis</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: 600, margin: '0.5rem auto' }}>
          A modern, interactive Computer Science dictionary designed to make learning CS concepts intuitive and engaging.
        </p>
      </div>

      {/* Features */}
      <h2 className="mb-2">Features</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h4>{f.title}</h4>
            <p className="text-sm text-muted" style={{ marginTop: '0.3rem', lineHeight: 1.5 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Tech Stack */}
      <h2 className="mb-2">Technology Stack</h2>
      <div className="card mb-3">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
          {techStack.map(t => (
            <div key={t.name} className="badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <strong>{t.name}</strong>
              <span style={{ opacity: 0.7, marginLeft: 4 }}>— {t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <h2 className="mb-2">Feedback</h2>
      <div className="card feedback-form">
        <p className="text-sm text-muted mb-2">We'd love to hear your thoughts! Share suggestions, report bugs, or tell us what you love about Gnosis.</p>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Submitting as: <strong style={{ color: 'var(--accent)' }}>{user?.email || 'Guest'}</strong>
        </div>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Type your feedback here..."
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          {submitted && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <CheckCircle size={16} /> Thank you for your feedback!
            </motion.span>
          )}
          {error && (
            <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
              <AlertTriangle size={16} /> {error}
            </span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={submitFeedback} disabled={isSubmitting || !feedback.trim()}>
              {isSubmitting ? (
                <><Loader2 size={16} className="spin" /> Sending...</>
              ) : (
                <><Send size={16} /> Submit</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-3 text-muted text-sm">
        <p>Built for Computer Science learners</p>
        <p>© {new Date().getFullYear()} Gnosis Dictionary</p>
      </div>
    </motion.div>
  );
}
