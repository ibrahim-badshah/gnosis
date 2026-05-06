import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Download, Trash2 } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { getTermById, categoryIcons } from '../data/dictionary';
import { exportBookmarksAsPDF } from '../utils/helpers';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useBookmarks();

  const terms = useMemo(() =>
    bookmarks.map(id => getTermById(id)).filter(Boolean).map(t => t!),
    [bookmarks]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-3">
        <h1><Bookmark size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Bookmarks</h1>
        {terms.length > 0 && (
          <button className="btn btn-secondary" onClick={() => exportBookmarksAsPDF(terms)}>
            <Download size={16} /> Export PDF
          </button>
        )}
      </div>

      {terms.length === 0 ? (
        <div className="card text-center mt-3">
          <p className="text-muted">No bookmarks yet. Browse the dictionary and bookmark terms you want to remember!</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Browse Dictionary</button>
        </div>
      ) : (
        <div className="term-grid">
          {terms.map((term, i) => (
            <motion.div
              key={term.id}
              className="card relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bookmark-ribbon" onClick={(e) => { e.stopPropagation(); toggleBookmark(term.id); }} title="Remove Bookmark" />
              <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/term/${term.id}`)}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="badge">{categoryIcons[term.category]} {term.category}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{term.word}</h3>
                <p className="text-sm text-muted" style={{ lineHeight: 1.5 }}>
                  {term.explanation.beginner.slice(0, 120)}...
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
