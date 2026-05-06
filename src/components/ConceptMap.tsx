import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTermById, categoryIcons } from '../data/dictionary';
import { ExternalLink, Zap } from 'lucide-react';

interface Props {
  termId: string;
  relatedIds: string[];
}

interface NodeData {
  id: string;
  word: string;
  category: string;
  x: number;
  y: number;
  angle: number;
}

export default function ConceptMap({ termId, relatedIds }: Props) {
  const navigate = useNavigate();
  const term = getTermById(termId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ w: 600, h: 380 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setDimensions({
        w: entry.contentRect.width,
        h: Math.max(entry.contentRect.height, 340),
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const related = useMemo(
    () => relatedIds.map(id => getTermById(id)).filter(Boolean).slice(0, 8),
    [relatedIds]
  );

  const { cx, cy, radius, nodes } = useMemo(() => {
    const cx = dimensions.w / 2;
    const cy = dimensions.h / 2;
    const r = Math.min(dimensions.w, dimensions.h) * 0.34;
    const count = related.length;

    const nodes: NodeData[] = related.map((rel, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return {
        id: rel!.id,
        word: rel!.word,
        category: rel!.category,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        angle,
      };
    });

    return { cx, cy, radius: r, nodes };
  }, [related, dimensions]);

  const handleNodeClick = useCallback(
    (id: string) => navigate(`/term/${id}`),
    [navigate]
  );

  if (!term) return null;

  // Color coding: unique soft colors per category
  const categoryColors: Record<string, string> = {
    'Algorithms': '#6366f1',
    'Data Structures': '#ec4899',
    'Machine Learning': '#8b5cf6',
    'Databases': '#f59e0b',
    'Web Development': '#10b981',
    'Networking': '#06b6d4',
    'Operating Systems': '#64748b',
    'Security': '#ef4444',
    'Software Engineering': '#3b82f6',
    'Programming Languages': '#f97316',
    'Cloud Computing': '#0ea5e9',
    'Computer Architecture': '#78716c',
    'AI & NLP': '#a855f7',
    'Cryptography': '#14b8a6',
    'DevOps': '#22c55e',
  };

  const getNodeColor = (category: string) =>
    categoryColors[category] || 'var(--accent)';

  const isHovered = (id: string) => hoveredNode === id;

  return (
    <div ref={containerRef} className="concept-map-container">
      {/* Background decorative rings */}
      <svg
        className="concept-map-svg"
        width={dimensions.w}
        height={dimensions.h}
        viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}
      >
        {/* Decorative orbit rings */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.6}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          opacity="0.3"
        />

        {/* Connection lines from center to nodes */}
        {nodes.map((node, i) => (
          <motion.line
            key={`line-${node.id}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke={isHovered(node.id) ? getNodeColor(node.category) : 'var(--border)'}
            strokeWidth={isHovered(node.id) ? 2.5 : 1.5}
            strokeDasharray={isHovered(node.id) ? 'none' : '4 3'}
            opacity={hoveredNode && !isHovered(node.id) ? 0.2 : 0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            style={{ transition: 'stroke 0.3s, opacity 0.3s, stroke-width 0.3s' }}
          />
        ))}

        {/* Pulse ring on hovered connection */}
        {hoveredNode && nodes.filter(n => n.id === hoveredNode).map(node => (
          <motion.circle
            key={`pulse-${node.id}`}
            cx={cx}
            cy={cy}
            r={20}
            fill="none"
            stroke={getNodeColor(node.category)}
            strokeWidth="2"
            initial={{ r: 20, opacity: 0.6 }}
            animate={{ r: radius * 0.5, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Center node */}
      <motion.div
        className="concept-node concept-node-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{ left: cx, top: cy }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="concept-node-icon">{categoryIcons[term.category]}</div>
        <div className="concept-node-label">{term.word}</div>
      </motion.div>

      {/* Related nodes */}
      <AnimatePresence>
        {nodes.map((node, i) => {
          const nodeColor = getNodeColor(node.category);
          return (
            <motion.div
              key={node.id}
              className={`concept-node concept-node-related ${isHovered(node.id) ? 'hovered' : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 14,
                delay: 0.2 + i * 0.06,
              }}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.25}
              style={{
                left: node.x,
                top: node.y,
                '--node-color': nodeColor,
                zIndex: isHovered(node.id) ? 10 : 1,
                cursor: 'grab'
              } as React.CSSProperties}
            >
              <span className="concept-node-emoji">
                {categoryIcons[node.category as keyof typeof categoryIcons]}
              </span>
              <span className="concept-node-name">{node.word}</span>
              {isHovered(node.id) && (
                <motion.span
                  className="concept-node-go"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <ExternalLink size={10} />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Tooltip for hovered node */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const node = nodes.find(n => n.id === hoveredNode);
          const hoveredTerm = node ? getTermById(node.id) : null;
          if (!node || !hoveredTerm) return null;

          // Position tooltip
          const tooltipX = node.x > cx ? node.x - 140 : node.x + 20;
          const tooltipY = node.y > cy ? node.y - 60 : node.y + 35;

          return (
            <motion.div
              key={`tooltip-${node.id}`}
              className="concept-tooltip"
              style={{ left: tooltipX, top: tooltipY }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="concept-tooltip-cat">
                {categoryIcons[hoveredTerm.category]} {hoveredTerm.category}
              </div>
              <div className="concept-tooltip-desc">
                {hoveredTerm.explanation.beginner.slice(0, 80)}…
              </div>
              <div className="concept-tooltip-hint">
                <Zap size={10} /> Click to explore
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Legend */}
      <div className="concept-legend">
        {Array.from(new Set(nodes.map(n => n.category))).map(cat => (
          <div key={cat} className="concept-legend-item">
            <span
              className="concept-legend-dot"
              style={{ background: getNodeColor(cat) }}
            />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
