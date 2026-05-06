import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { allTerms, categories, categoryIcons, getTermById } from '../data/dictionary';
import { useQuiz } from '../contexts/QuizContext';

interface Question {
  termId: string;
  question: string;
  options: string[];
  correctIdx: number;
  category: string;
}

function generateQuestions(selectedCats: string[], count: number): Question[] {
  let pool = selectedCats.includes('All') ? [...allTerms] : allTerms.filter(t => selectedCats.includes(t.category));
  pool = pool.sort(() => Math.random() - 0.5).slice(0, count);

  return pool.map(term => {
    const correct = term.explanation.beginner.slice(0, 100);
    const wrongs = allTerms.filter(t => t.id !== term.id).sort(() => Math.random() - 0.5).slice(0, 3)
      .map(t => t.explanation.beginner.slice(0, 100));
    const options = [...wrongs, correct].sort(() => Math.random() - 0.5);
    return { termId: term.id, question: `What is "${term.word}"?`, options, correctIdx: options.indexOf(correct), category: term.category };
  });
}

export default function Quiz() {
  const navigate = useNavigate();
  const { addResult } = useQuiz();
  const [started, setStarted] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>(['All']);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const toggleCat = (cat: string) => {
    if (cat === 'All') {
      setSelectedCats(['All']);
      return;
    }
    
    let newCats = selectedCats.filter(c => c !== 'All');
    if (newCats.includes(cat)) {
      newCats = newCats.filter(c => c !== cat);
      if (newCats.length === 0) newCats = ['All'];
    } else {
      newCats.push(cat);
    }
    setSelectedCats(newCats);
  };

  const start = () => {
    const qs = generateQuestions(selectedCats, 10);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setWrongIds([]);
    setFinished(false);
    setStarted(true);
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === questions[current].correctIdx) {
      setScore(s => s + 1);
    } else {
      setWrongIds(prev => [...prev, questions[current].termId]);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      addResult({
        date: new Date().toISOString(),
        score: score,
        total: questions.length,
        category: selectedCats.includes('All') ? 'All' : (selectedCats.length === 1 ? selectedCats[0] : 'Mixed Categories'),
        wrongTermIds: wrongIds
      });
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="mb-2">Quiz Mode</h1>
        <p className="text-muted mb-3">Test your CS knowledge! Choose one or more categories and answer 10 questions.</p>
        <div className="card" style={{ maxWidth: 800 }}>
          <h3 className="mb-2">Select Categories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button className={`btn ${selectedCats.includes('All') ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleCat('All')}>📋 All</button>
            {categories.map(cat => (
              <button key={cat} className={`btn ${selectedCats.includes(cat) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleCat(cat)}>
                {categoryIcons[cat]} {cat}
              </button>
            ))}
          </div>
          <button className="btn btn-primary w-full" onClick={start} style={{ justifyContent: 'center' }}>
            Start Quiz <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="card" style={{ maxWidth: 500, margin: '2rem auto' }}>
          <Trophy size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h1>Quiz Complete!</h1>
          <div className="stat-value" style={{ fontSize: '3rem', margin: '1rem 0' }}>{pct}%</div>
          <p className="text-muted mb-2">{score} out of {questions.length} correct</p>
          <div className="progress-bar mb-2">
            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)' }} />
          </div>
          {wrongIds.length > 0 && (
            <div className="mt-2" style={{ textAlign: 'left' }}>
              <h4 className="mb-1">Review these terms:</h4>
              {wrongIds.map(id => {
                const t = getTermById(id);
                return t ? (
                  <div key={id} className="card card-flat term-card mb-1" onClick={() => navigate(`/term/${id}`)}>
                    <div className="term-word">{t.word}</div>
                    <div className="term-cat">{t.category}</div>
                  </div>
                ) : null;
              })}
            </div>
          )}
          <div className="flex gap-2 mt-3" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={start}><RotateCcw size={16} /> Retry</button>
            <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>View Analytics</button>
          </div>
        </div>
      </motion.div>
    );
  }

  const q = questions[current];
  const term = getTermById(q.termId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-2">
        <h2>Quiz</h2>
        <span className="badge">Question {current + 1} / {questions.length}</span>
      </div>

      <div className="progress-bar mb-2">
        <div className="progress-bar-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="quiz-paper">
        <div className="quiz-question">{q.question}</div>

        <AnimatePresence mode="wait">
          {q.options.map((opt, idx) => (
            <motion.div
              key={idx}
              className={`quiz-option ${selected === idx ? (idx === q.correctIdx ? 'correct' : 'wrong') : ''} ${selected !== null && idx === q.correctIdx ? 'correct' : ''}`}
              onClick={() => handleSelect(idx)}
              whileHover={selected === null ? { scale: 1.01 } : {}}
              style={{ cursor: selected === null ? 'pointer' : 'default' }}
            >
              <span style={{ fontWeight: 600, minWidth: 24 }}>{String.fromCharCode(65 + idx)}.</span>
              <span>{opt}...</span>
              {selected !== null && idx === q.correctIdx && <CheckCircle size={18} style={{ color: 'var(--success)', marginLeft: 'auto' }} />}
              {selected === idx && idx !== q.correctIdx && <XCircle size={18} style={{ color: 'var(--error)', marginLeft: 'auto' }} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {showExplanation && selected !== q.correctIdx && term && (
          <motion.div className="quiz-explanation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <strong>Explanation:</strong> {term.explanation.beginner}
            <br />
            <button className="btn btn-ghost mt-1" onClick={() => navigate(`/term/${term.id}`)}>
              Learn more about {term.word} →
            </button>
          </motion.div>
        )}

        {selected !== null && (
          <div style={{ textAlign: 'right', marginTop: '1rem', paddingLeft: 80 }}>
            <button className="btn btn-primary" onClick={next}>
              {current + 1 >= questions.length ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
