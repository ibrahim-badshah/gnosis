import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChevronRight, TrendingUp, Loader2, Wand2, BookPlus, AlertTriangle } from 'lucide-react';
import { allTerms, categories, categoryIcons, getTermById, getCategoryStats, addDynamicTerm, syncDynamicTerms } from '../data/dictionary';
import type { Term } from '../data/types';
import { useAchievements } from '../contexts/AchievementContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useQuiz } from '../contexts/QuizContext';
import { generateTermWithAI, validateTermInput } from '../utils/generateTerm';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { exploredCount, totalCount, percentage, wordOfTheDay, markExplored } = useProgress();
  const { checkAchievements } = useAchievements();
  const { bookmarks } = useBookmarks();
  const { totalQuizzes } = useQuiz();
  const { user, signOut } = useAuth();
  const [syncTrigger, setSyncTrigger] = useState(0);
  const catStats = useMemo(() => getCategoryStats(), [syncTrigger]);

  // Search suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const streakKey = user ? `gnosis-streak-${user.id}` : 'gnosis-streak-guest';
  const visitKey = user ? `gnosis-last-visit-${user.id}` : 'gnosis-last-visit-guest';

  const streak = useMemo(() => {
    try { const s = JSON.parse(localStorage.getItem(streakKey) || '0'); return Number(s); }
    catch { return 0; }
  }, [streakKey]);

  useEffect(() => {
    checkAchievements({ explored: exploredCount, quizzes: totalQuizzes, bookmarks: bookmarks.length, streak });
  }, [exploredCount, totalQuizzes, bookmarks.length]);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(visitKey);
    if (lastVisit !== today) {
      localStorage.setItem(visitKey, today);
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const currentStreak = lastVisit === yesterday.toDateString() ? streak + 1 : 1;
      localStorage.setItem(streakKey, String(currentStreak));
    }

    // Sync remote terms
    syncDynamicTerms().then(added => {
      if (added) {
        setSyncTrigger(prev => prev + 1);
      }
    });
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions list (max 8)
  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const exact: Term[] = [];
    const startsWith: Term[] = [];
    const contains: Term[] = [];
    for (const t of allTerms) {
      const w = t.word.toLowerCase();
      if (w === q) { exact.push(t); }
      else if (w.startsWith(q)) { startsWith.push(t); }
      else if (w.includes(q) || t.tags.some(tag => tag.includes(q))) { contains.push(t); }
    }
    return [...exact, ...startsWith, ...contains].slice(0, 8);
  }, [search, syncTrigger]);

  // Reset suggestion index when suggestions change
  useEffect(() => {
    setSuggestionIndex(-1);
  }, [suggestions]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setShowSuggestions(true);
        setSuggestionIndex(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestionIndex >= 0) {
      e.preventDefault();
      const term = suggestions[suggestionIndex];
      markExplored(term.id);
      navigate(`/term/${term.id}`);
      setShowSuggestions(false);
      setSearch('');
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, suggestionIndex, navigate, markExplored]);

  const filtered = useMemo(() => {
    let terms = allTerms;
    if (selectedCat) terms = terms.filter(t => t.category === selectedCat);
    if (search) {
      const q = search.toLowerCase();
      terms = terms.filter(t => t.word.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)) || t.category.toLowerCase().includes(q));
    }
    return terms;
  }, [search, selectedCat, syncTrigger]);

  const wodTerm = wordOfTheDay ? getTermById(wordOfTheDay) : null;

  const letters = useMemo(() => {
    const s = new Set(filtered.map(t => t.word[0].toUpperCase()));
    return Array.from(s).sort();
  }, [filtered]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    filtered.forEach(t => {
      const letter = t.word[0].toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(t);
    });
    return g;
  }, [filtered]);

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          {user ? (
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              Welcome, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Explorer'}!
            </h2>
          ) : (
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              Welcome to Gnosis
            </h2>
          )}
          <p className="text-muted" style={{ marginTop: '0.2rem' }}>Ready to discover some new concepts today?</p>
        </div>
        {user && (
          <button 
            onClick={() => signOut()}
            className="btn" 
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Word of the Day */}
      {wodTerm && (
        <motion.div
          className="wod-card mb-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          onClick={() => { markExplored(wodTerm.id); navigate(`/term/${wodTerm.id}`); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-1 mb-1" style={{ opacity: 0.8 }}>
            <Sparkles size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1 }}>WORD OF THE DAY</span>
          </div>
          <h3>{wodTerm.word}</h3>
          <p>{wodTerm.explanation.beginner.slice(0, 120)}...</p>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginTop: 8 }}>{wodTerm.category}</div>
        </motion.div>
      )}

      {/* Explored Count */}
      <motion.div
        className="mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>{exploredCount} words explored</span>
      </motion.div>

      {/* Categories */}
      <h2 className="mb-2">Categories</h2>
      <div className="category-grid mb-3">
        <motion.div
          className={`card category-card ${!selectedCat ? 'selected' : ''}`}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedCat(null)}
          style={!selectedCat ? { borderColor: 'var(--accent)', borderWidth: 2 } : {}}
        >
          <div className="cat-icon"></div>
          <div className="cat-name">All</div>
          <div className="cat-count">{allTerms.length} terms</div>
        </motion.div>
        {categories.map(cat => (
          <motion.div
            key={cat}
            className={`card category-card`}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
            style={selectedCat === cat ? { borderColor: 'var(--accent)', borderWidth: 2 } : {}}
          >
            <div className="cat-icon">{categoryIcons[cat]}</div>
            <div className="cat-name">{cat}</div>
            <div className="cat-count">{catStats[cat] || 0} terms</div>
          </motion.div>
        ))}
      </div>

      {/* Search with Suggestions — moved below categories */}
      <div className="search-box mb-3" ref={searchBoxRef} style={{ position: 'relative' }}>
        <Search size={18} className="search-icon" />
        <input
          id="search-input"
          type="text"
          placeholder="Search terms, categories, or tags... (press / )"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
          onFocus={() => { if (search.trim()) setShowSuggestions(true); }}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
        />
        {/* Suggestion Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              className="search-suggestions"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {suggestions.map((term, i) => (
                <div
                  key={term.id}
                  className={`search-suggestion-item ${i === suggestionIndex ? 'active' : ''}`}
                  onMouseEnter={() => setSuggestionIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    markExplored(term.id);
                    navigate(`/term/${term.id}`);
                    setShowSuggestions(false);
                    setSearch('');
                  }}
                >
                  <div className="suggestion-word">
                    <Search size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                    <span>{highlightMatch(term.word, search)}</span>
                  </div>
                  <span className="suggestion-category">{categoryIcons[term.category]} {term.category}</span>
                </div>
              ))}
              <div className="search-suggestion-hint">
                <span><kbd>↑↓</kbd> navigate</span>
                <span><kbd>↵</kbd> select</span>
                <span><kbd>esc</kbd> close</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Term List with Alpha sidebar */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="alpha-bar" style={{ minWidth: 32, position: 'sticky', top: '2rem', height: 'fit-content' }}>
          {letters.map(l => (
            <div 
              key={l} 
              className="alpha-letter"
              onClick={() => {
                const el = document.getElementById(`letter-${l}`);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 0', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold' }}
            >
              {l}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <h2 className="mb-2">
            {selectedCat ? `${categoryIcons[selectedCat as keyof typeof categoryIcons]} ${selectedCat}` : 'All Terms'}
            <span className="text-muted text-sm" style={{ marginLeft: 8 }}>({filtered.length})</span>
          </h2>

          {Object.entries(grouped).map(([letter, terms]) => (
            <div key={letter} id={`letter-${letter}`}>
              <h3 style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border-light)', paddingBottom: 4, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                {letter}
              </h3>
              <div className="term-grid">
                {terms.map((term, i) => (
                  <motion.div
                    key={term.id}
                    className="card card-flat term-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => { markExplored(term.id); navigate(`/term/${term.id}`); }}
                  >
                    <div className="term-word">{term.word}</div>
                    <div className="term-cat">{categoryIcons[term.category]} {term.category}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && search.trim() && (
            <NoResultsGenerator searchQuery={search} navigate={navigate} markExplored={markExplored} />
          )}
        </div>
      </div>
    </div>
  );
}

/* Highlight matching text in suggestions */
function highlightMatch(word: string, query: string) {
  if (!query.trim()) return word;
  const idx = word.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return word;
  return (
    <>
      {word.slice(0, idx)}
      <strong style={{ color: 'var(--accent)' }}>{word.slice(idx, idx + query.length)}</strong>
      {word.slice(idx + query.length)}
    </>
  );
}

/* ── Dynamic AI Term Generator Component ── */
function NoResultsGenerator({ searchQuery, navigate, markExplored }: { searchQuery: string; navigate: any; markExplored: (id: string) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<Term | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'validation' | 'not-cs' | 'generation'>('generation');

  const handleGenerate = async () => {
    setError(null);

    // Pre-validate BEFORE calling AI (instant feedback)
    try {
      validateTermInput(searchQuery.trim());
    } catch (e: any) {
      setError(e.message);
      setErrorType('validation');
      return;
    }

    setIsGenerating(true);
    try {
      const term = await generateTermWithAI(searchQuery.trim());
      addDynamicTerm(term);
      setGenerated(term);
    } catch (e: any) {
      const msg = e.message || 'Failed to generate term. Please try again.';
      setError(msg);
      setErrorType(
        msg.includes('not related to Computer Science') || msg.includes('does not appear to be a Computer Science')
          ? 'not-cs'
          : 'generation'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (generated) {
    return (
      <motion.div
        className="card mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ border: '2px solid var(--accent)', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div className="flex items-center gap-1">
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase' }}>AI Generated</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '99px', border: '1px solid var(--border-light)' }}>
            Shared with all users
          </span>
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>{generated.word}</h3>
        <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{generated.explanation.beginner}</p>
        <button
          className="btn btn-primary mt-2"
          onClick={() => { markExplored(generated.id); navigate(`/term/${generated.id}`); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <BookPlus size={16} /> View Full Definition
        </button>
      </motion.div>
    );
  }

  const errorTitle =
    errorType === 'validation' ? 'Invalid Input' :
    errorType === 'not-cs' ? 'Not a Computer Science Term' :
    'Generation Failed';

  return (
    <motion.div
      className="text-center mt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card" style={{ padding: '2rem', border: '1px dashed var(--border-light)' }}>
        <Wand2 size={36} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
          <strong>"{searchQuery}"</strong> isn't in the dictionary yet.
        </p>
        <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
          Want me to generate a full definition with code examples and explanations using AI?
        </p>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: 'var(--accent)', opacity: 0.7 }}>Rules:</span>{' '}
          CS terms only · 1-3 words max · No sentences · Saved for all users
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={20} style={{ color: '#e74c3c', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: '#e74c3c', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {errorTitle}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 200 }}
        >
          {isGenerating ? (
            <><Loader2 size={16} className="spin" /> Generating with AI...</>
          ) : (
            <><Sparkles size={16} /> {error ? 'Try Again' : 'Generate with AI'}</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

