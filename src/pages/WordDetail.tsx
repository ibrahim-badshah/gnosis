import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Volume2, ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import { getTermById, getRelatedTerms, categoryIcons } from '../data/dictionary';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useProgress } from '../contexts/ProgressContext';
import { speak } from '../utils/helpers';
import CodeBlock from '../components/CodeBlock';
import ConceptMap from '../components/ConceptMap';


export default function WordDetail() {
  const { termId } = useParams<{ termId: string }>();
  const navigate = useNavigate();
  const term = getTermById(termId || '');
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { markExplored } = useProgress();
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');

  useEffect(() => {
    if (termId) markExplored(termId);
  }, [termId]);

  if (!term) return (
    <div className="text-center mt-3">
      <h2>Term not found</h2>
      <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const related = getRelatedTerms(term.id);
  const bookmarked = isBookmarked(term.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className="btn btn-ghost mb-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card relative" style={{ marginBottom: '1.5rem' }}>
        {/* Bookmark ribbon */}
        <div
          className={`bookmark-ribbon ${bookmarked ? '' : 'inactive'}`}
          onClick={() => toggleBookmark(term.id)}
          title={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
        />

        <div className="flex items-center gap-1 mb-1">
          <span className="badge">{categoryIcons[term.category]} {term.category}</span>
          {term.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>#{tag}</span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <h1>{term.word}</h1>
          <button className="btn-ghost btn-icon" onClick={() => speak(term.word)} title="Pronounce">
            <Volume2 size={20} />
          </button>
        </div>
        <p className="text-muted text-sm">/{term.pronunciation}/</p>

        {/* Explanation Tabs */}
        <div className="tabs mt-2">
          {(['beginner', 'intermediate', 'expert'] as const).map(l => (
            <button key={l} className={`tab ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
              {l === 'beginner' ? 'I' : l === 'intermediate' ? 'II' : 'III'} {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <motion.div key={level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>{term.explanation[level]}</p>
        </motion.div>

        {/* Code Example */}
        {term.codeExample && (
          <div className="mt-2">
            <h3 className="mb-1">Code Example</h3>
            <CodeBlock code={term.codeExample.code} language={term.codeExample.language} description={term.codeExample.description} />
          </div>
        )}

        {/* Historical Context */}
        <div className="mt-2" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--accent)' }}>
          <div className="flex items-center gap-1 mb-1">
            <Clock size={16} style={{ color: 'var(--accent)' }} />
            <h4>Historical Context</h4>
          </div>
          <p className="text-sm">{term.historicalContext}</p>
        </div>
      </div>

      {/* Concept Map */}
      {term.relatedTerms.length > 0 && (
        <div className="card mb-3">
          <h3 className="mb-2">Concept Map</h3>
          <ConceptMap termId={term.id} relatedIds={term.relatedTerms} />
        </div>
      )}

      {/* Related Terms */}
      {related.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-2">Related Concepts</h3>
          <div className="term-grid">
            {related.map(r => r && (
              <motion.div
                key={r.id}
                className="card card-flat term-card"
                whileHover={{ scale: 1.02 }}
                onClick={() => { markExplored(r.id); navigate(`/term/${r.id}`); }}
              >
                <div className="term-word">{r.word}</div>
                <div className="term-cat">{categoryIcons[r.category]} {r.category}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
