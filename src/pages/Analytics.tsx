import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, Award, Clock, Trophy, Lock, CheckCircle2, GitBranch } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useAchievements } from '../contexts/AchievementContext';
import type { Achievement } from '../contexts/AchievementContext';
import { useProgress } from '../contexts/ProgressContext';
import { getTermById, categoryIcons } from '../data/dictionary';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const COLORS = ['#b8860b', '#d4a017', '#e67e22', '#2d8a4e', '#4361ee', '#c0392b', '#8e44ad', '#1abc9c'];

const BRANCH_COLORS: Record<string, string> = {
  explore:  '#f0c040',
  quiz:     '#4361ee',
  bookmark: '#2d8a4e',
  streak:   '#e67e22',
  master:   '#8e44ad',
};

const BRANCH_LABELS: Record<string, string> = {
  explore:  'Exploration',
  quiz:     'Quiz',
  bookmark: 'Bookmarks',
  streak:   'Streak',
  master:   'Mastery',
};

const BRANCH_ICONS: Record<string, React.ReactNode> = {
  explore:  <GitBranch size={14} />,
  quiz:     <CheckCircle2 size={14} />,
  bookmark: <Award size={14} />,
  streak:   <Clock size={14} />,
  master:   <Trophy size={14} />,
};

/* ── Skill Tree Branch ── */
function SkillTreeBranch({ branchId, nodes, color }: { branchId: string; nodes: (Achievement & { unlocked: boolean })[]; color: string }) {
  const sorted = [...nodes].sort((a, b) => a.tier - b.tier);
  const unlockedCount = sorted.filter(n => n.unlocked).length;
  const progress = sorted.length > 0 ? Math.round((unlockedCount / sorted.length) * 100) : 0;

  return (
    <div className="skill-tree-branch">
      {/* Branch header */}
      <div className="skill-branch-header" style={{ '--branch-color': color } as React.CSSProperties}>
        <div className="skill-branch-icon" style={{ background: `${color}20`, color }}>
          {BRANCH_ICONS[branchId]}
        </div>
        <div className="skill-branch-info">
          <div className="skill-branch-name">{BRANCH_LABELS[branchId]}</div>
          <div className="skill-branch-progress-bar">
            <motion.div 
              className="skill-branch-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: color }}
            />
          </div>
        </div>
        <span className="skill-branch-count" style={{ color }}>{unlockedCount}/{sorted.length}</span>
      </div>

      {/* Tree nodes with connecting lines */}
      <div className="skill-tree-nodes">
        {sorted.map((node, i) => {
          const isUnlocked = node.unlocked;
          const prevUnlocked = i === 0 ? true : sorted[i - 1].unlocked;
          const isAvailable = !isUnlocked && prevUnlocked;

          return (
            <React.Fragment key={node.id}>
              {/* Connector line */}
              {i > 0 && (
                <div className="skill-tree-connector">
                  <div 
                    className={`skill-tree-line ${sorted[i - 1].unlocked ? 'active' : ''}`}
                    style={{ '--branch-color': color } as React.CSSProperties}
                  />
                </div>
              )}

              {/* Node */}
              <motion.div
                className={`skill-tree-node ${isUnlocked ? 'unlocked' : ''} ${isAvailable ? 'available' : ''} ${!isUnlocked && !isAvailable ? 'locked' : ''}`}
                style={{ '--branch-color': color } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="skill-node-icon-ring">
                  {isUnlocked ? (
                    <div className="skill-node-icon unlocked-icon">{node.icon}</div>
                  ) : (
                    <div className="skill-node-icon locked-icon">
                      <Lock size={14} />
                    </div>
                  )}
                  {/* Glow ring for unlocked */}
                  {isUnlocked && <div className="skill-node-glow" />}
                  {/* Pulse for available */}
                  {isAvailable && <div className="skill-node-pulse" />}
                </div>
                <div className="skill-node-info">
                  <div className="skill-node-name">{node.name}</div>
                  <div className="skill-node-desc">{node.description}</div>
                </div>
                {/* Tier badge */}
                <div className="skill-node-tier">T{node.tier}</div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { history, totalQuizzes, averageScore, getWeakCategories, getWeakTerms } = useQuiz();
  const { achievements } = useAchievements();
  const { exploredCount } = useProgress();

  const weakCats = getWeakCategories();
  const weakTerms = getWeakTerms();

  const scoreData = history.slice(-20).map((r, i) => ({
    quiz: i + 1,
    score: Math.round((r.score / r.total) * 100),
    date: new Date(r.date).toLocaleDateString()
  }));

  const catData = weakCats.slice(0, 8).map(c => ({
    category: c.category.length > 10 ? c.category.slice(0, 10) + '…' : c.category,
    accuracy: c.totalCount > 0 ? Math.round(((c.totalCount - c.wrongCount) / c.totalCount) * 100) : 100
  }));

  const radarData = weakCats.slice(0, 6).map(c => ({
    subject: c.category.length > 8 ? c.category.slice(0, 8) + '…' : c.category,
    score: c.totalCount > 0 ? Math.round(((c.totalCount - c.wrongCount) / c.totalCount) * 100) : 100
  }));

  // Group achievements by branch
  const branches = useMemo(() => {
    const groups: Record<string, (Achievement & { unlocked: boolean })[]> = {};
    achievements.forEach(a => {
      if (!groups[a.branch]) groups[a.branch] = [];
      groups[a.branch].push(a);
    });
    return groups;
  }, [achievements]);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="mb-3"><BarChart3 size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-value">{totalQuizzes}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{averageScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{exploredCount}</div>
          <div className="stat-label">Words Explored</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{totalUnlocked}/{achievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card text-center mt-3">
          <p className="text-muted">No quiz data yet. Take a quiz to see your analytics!</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/quiz')}>Start a Quiz</button>
        </div>
      ) : (
        <div className="grid-2 mt-2">
          {/* Score History */}
          <div className="card">
            <h3 className="mb-2">Score History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreData}>
                <XAxis dataKey="quiz" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Radar */}
          <div className="card">
            <h3 className="mb-2">Category Strengths</h3>
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Bar dataKey="accuracy" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Weak Terms */}
      {weakTerms.length > 0 && (
        <div className="card mt-2">
          <h3 className="mb-2"><TrendingDown size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Terms to Review</h3>
          <div className="term-grid">
            {weakTerms.slice(0, 8).map(({ termId, wrongCount }) => {
              const t = getTermById(termId);
              if (!t) return null;
              return (
                <div key={termId} className="card card-flat term-card" onClick={() => navigate(`/term/${termId}`)}>
                  <div className="term-word">{t.word}</div>
                  <div className="term-cat">{categoryIcons[t.category]} {t.category}</div>
                  <span className="badge badge-error mt-1">Wrong {wrongCount}x</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Achievement Skill Tree ── */}
      <div className="card mt-2 skill-tree-card">
        <div className="skill-tree-header">
          <h3>
            <Trophy size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />
            Achievement Tree
          </h3>
          <div className="skill-tree-summary">
            <span className="skill-tree-unlocked-count">{totalUnlocked}</span>
            <span className="skill-tree-total-count">/ {achievements.length} unlocked</span>
          </div>
        </div>

        {/* Legend */}
        <div className="skill-tree-legend">
          {Object.entries(BRANCH_COLORS).map(([key, color]) => (
            <div key={key} className="skill-tree-legend-item">
              <div className="skill-tree-legend-dot" style={{ background: color }} />
              <span>{BRANCH_LABELS[key]}</span>
            </div>
          ))}
        </div>

        {/* Tree branches */}
        <div className="skill-tree-container">
          {Object.entries(branches).map(([branchId, nodes]) => (
            <SkillTreeBranch
              key={branchId}
              branchId={branchId}
              nodes={nodes}
              color={BRANCH_COLORS[branchId]}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
