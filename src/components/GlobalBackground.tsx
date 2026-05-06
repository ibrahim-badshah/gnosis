import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Global animated background — CS terms rain down ON TOP of all pages
 * as a subtle transparent overlay. pointer-events: none ensures
 * it never blocks user interaction.
 */

const CS_TERMS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'throw',
  'new', 'this', 'null', 'true', 'false', 'void', 'typeof', 'interface',
  '{ }', '[ ]', '( )', '=>', '===', '!==', '&&', '||', '...', '::',
  'npm', 'git', 'ssh', 'SQL', 'API', 'DOM', 'CSS', 'TCP', 'UDP', 'HTTP',
  'map()', 'filter()', 'reduce()', 'push()', 'pop()', 'sort()',
  'O(n)', 'O(1)', 'O(log n)', 'O(n²)',
  'int', 'str', 'bool', 'float', 'list', 'dict', 'set', 'tuple',
  'def', 'print', 'self', 'None', 'lambda', 'yield', 'from',
  '#include', 'struct', 'enum', 'impl', 'pub', 'fn', 'mod',
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN',
  '<div>', '</>', 'useState', 'useEffect', 'props',
  'docker', 'nginx', 'redis', 'node', 'react', 'vue', 'rust',
  '0x1F', '0b1010', '127.0.0.1', 'localhost', 'sudo', 'chmod',
  'merge', 'commit', 'branch', 'push', 'pull', 'clone', 'fork',
  'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'array',
  'mutex', 'thread', 'process', 'pipe', 'socket', 'buffer',
  'encrypt', 'decrypt', 'token', 'auth', 'session', 'cookie',
];

interface Particle {
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
  size: number;
}

const THEME_COLORS: Record<string, [number, number, number]> = {
  dark:  [240, 192, 64],   // gold
  light: [67, 97, 238],    // blue
  sepia: [139, 109, 56],   // brown
};

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 50;

export default function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles spread across the screen
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 0.2 + Math.random() * 0.45,
        text: CS_TERMS[Math.floor(Math.random() * CS_TERMS.length)],
        opacity: 0.08 + Math.random() * 0.14,
        size: 11 + Math.random() * 3,
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      if (!ctx || !canvas) return;

      const [r, g, b] = THEME_COLORS[themeRef.current] || THEME_COLORS.dark;

      // Clear canvas (transparent — we're an overlay)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particlesRef.current.forEach((p, i) => {
        p.y += p.speed;

        // Fade at edges
        const progress = p.y / canvas.height;
        let alpha = p.opacity;
        if (progress < 0.05) alpha *= progress / 0.05;
        if (progress > 0.9) alpha *= (1 - progress) / 0.1;

        ctx.font = `${p.size}px "JetBrains Mono", "Fira Code", "Courier New", monospace`;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, alpha)})`;
        ctx.fillText(p.text, p.x, p.y);

        // Reset when off screen
        if (p.y > canvas.height + 30) {
          particlesRef.current[i] = {
            x: Math.random() * canvas.width,
            y: -(Math.random() * 60 + 10),
            speed: 0.2 + Math.random() * 0.45,
            text: CS_TERMS[Math.floor(Math.random() * CS_TERMS.length)],
            opacity: 0.08 + Math.random() * 0.14,
            size: 11 + Math.random() * 3,
          };
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="global-bg-canvas"
      aria-hidden="true"
    />
  );
}
