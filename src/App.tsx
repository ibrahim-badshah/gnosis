import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { QuizProvider } from './contexts/QuizContext';
import { AchievementProvider } from './contexts/AchievementContext';
import Home from './pages/Home';
import Landing from './pages/Landing';
import WordDetail from './pages/WordDetail';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import Bookmarks from './pages/Bookmarks';
import About from './pages/About';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Chatbot from './components/Chatbot';
import GlobalBackground from './components/GlobalBackground';
import { BookOpen, Home as HomeIcon, HelpCircle, BarChart3, Bookmark, Info, LogIn, LogOut, Sun, Moon, Menu, X, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switcher">
      <button className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')} title="Sepia"><BookOpen size={14} /></button>
      <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light"><Sun size={14} /></button>
      <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark"><Moon size={14} /></button>
    </div>
  );
}

// Route order for determining page-turn direction
const routeOrder: Record<string, number> = {
  '/home': 0,
  '/quiz': 1,
  '/analytics': 2,
  '/bookmarks': 3,
  '/about': 4,
};

function getRouteIndex(path: string): number {
  if (path.startsWith('/term/')) return 0.5; // term detail is between home and quiz
  return routeOrder[path] ?? 0;
}

function AnimatedRoutes() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    const prevIdx = getRouteIndex(prevPathRef.current);
    const currIdx = getRouteIndex(location.pathname);
    directionRef.current = currIdx >= prevIdx ? 1 : -1;
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const direction = directionRef.current;

  // Page turn variants — simulates a 3D book page curl
  const pageTurnVariants = useMemo(() => ({
    initial: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.92,
      transformOrigin: dir > 0 ? '0% 50%' : '100% 50%',
      boxShadow: 'none',
      filter: 'brightness(0.7)',
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transformOrigin: '50% 50%',
      boxShadow: '0 0 0px rgba(0,0,0,0)',
      filter: 'brightness(1)',
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.92,
      transformOrigin: dir > 0 ? '100% 50%' : '0% 50%',
      boxShadow: dir > 0
        ? '-20px 0 60px rgba(0,0,0,0.35)'
        : '20px 0 60px rgba(0,0,0,0.35)',
      filter: 'brightness(0.7)',
    }),
  }), []);

  return (
    <div className="page-turn-perspective">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageTurnVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.55,
            ease: [0.25, 0.46, 0.45, 0.94],
            rotateY: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.35 },
            scale: { duration: 0.5 },
            filter: { duration: 0.4 },
          }}
          className="page-turn-page"
        >
          {/* Paper texture overlay */}
          <div className="page-paper-texture" />
          {/* Fold shadow that appears during animation */}
          <div className="page-fold-shadow" />
          <div className="page-container">
            <Routes location={location}>
              <Route path="/home" element={<Home />} />
              <Route path="/term/:termId" element={<WordDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
          {/* Page edge effect */}
          <div className="page-edge" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        let newWidth = mouseMoveEvent.clientX;
        if (newWidth < 180) newWidth = 180;
        if (newWidth > 400) newWidth = 400;
        setSidebarWidth(newWidth);
        if (isCollapsed && newWidth > 180) setIsCollapsed(false);
      }
    },
    [isResizing, isCollapsed]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const currentWidth = isCollapsed ? 0 : sidebarWidth;

  return (
    <div className={`app-layout ${isResizing ? 'is-resizing' : ''}`}>
      <GlobalBackground />
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside 
        ref={sidebarRef}
        className={`sidebar ${mobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        style={{ width: mobileOpen ? '260px' : (isCollapsed ? '0px' : `${sidebarWidth}px`), padding: isCollapsed ? '0' : undefined, overflow: isCollapsed ? 'hidden' : undefined }}
      >
        <div className="sidebar-logo">
          <h1><BookOpen size={22} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Gnosis</h1>
          <span>CS Dictionary</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/home" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile} end>
            <HomeIcon size={18} /> Home
          </NavLink>
          <NavLink to="/quiz" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <HelpCircle size={18} /> Quiz
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <BarChart3 size={18} /> Analytics
          </NavLink>
          <NavLink to="/bookmarks" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <Bookmark size={18} /> Bookmarks
          </NavLink>
          <NavLink to="/about" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <Info size={18} /> About
          </NavLink>
        </nav>
        <div className="sidebar-footer" style={{ borderBottom: '1px solid var(--border-light)', borderTop: 'none', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
          {user ? (
            <div className="nav-link" style={{ cursor: 'pointer', marginBottom: 0 }} onClick={() => signOut()}>
              <LogOut size={18} /> Sign Out
            </div>
          ) : (
            <NavLink to="/auth" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile} style={{ marginBottom: 0 }}>
              <LogIn size={18} /> Sign In
            </NavLink>
          )}
        </div>
        <div className="sidebar-footer">
          <ThemeSwitcher />
        </div>
        
        {!mobileOpen && !isCollapsed && (
          <div className="sidebar-resizer" onMouseDown={startResizing} />
        )}
      </aside>
      
      {!mobileOpen && (
        <button 
          className={`sidebar-toggle-btn ${isCollapsed ? 'collapsed' : ''}`} 
          onClick={toggleCollapse}
          style={{ left: isCollapsed ? '0px' : `${sidebarWidth}px` }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      <main className="main-content" style={{ marginLeft: mobileOpen ? '0' : `${currentWidth}px`, transition: isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <AnimatedRoutes />
      </main>

      <Chatbot />
    </div>
  );
}

/* ── App Shell: Landing and Auth are outside the Layout ── */
function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '';
  const isAuth = location.pathname === '/auth';

  if (isLanding) {
    return <Landing />;
  }

  if (isAuth) {
    return <AuthPage />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <ProgressProvider>
            <QuizProvider>
              <AchievementProvider>
                <HashRouter>
                  <AppRoutes />
                  <SpeedInsights />
                </HashRouter>
              </AchievementProvider>
            </QuizProvider>
          </ProgressProvider>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
