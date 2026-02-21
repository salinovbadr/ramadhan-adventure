import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import StarfieldBg from './components/StarfieldBg';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import { useApp } from './context/AppContext';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const { crew, activeUser, initialized } = useApp();

  // Sync activePage with URL path
  useEffect(() => {
    const path = window.location.pathname.replace('/', '') || 'dashboard';
    if (path && path !== activePage) {
      setActivePage(path);
    }
  }, []);

  // Update URL when activePage changes
  useEffect(() => {
    if (activePage && window.location.pathname !== `/${activePage}`) {
      window.history.pushState({}, '', `/${activePage}`);
    }
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'analysis': return <Analysis />;
      case 'leaderboard': return <Leaderboard />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen">
      <StarfieldBg />
      {initialized && crew.length > 0 && activeUser && (
        <TopNav activeTab={activePage} onNavigate={setActivePage} />
      )}

      {/* Main Content - Adjusted for TopNav */}
      <main className={`${initialized && crew.length > 0 && activeUser ? 'pt-24' : 'pt-6'} px-4 md:px-8 pb-12 w-full relative z-10`}>
        {initialized && (!activeUser || crew.length === 0) ? (
          <Onboarding onDone={() => setActivePage('dashboard')} />
        ) : (
          renderPage()
        )}

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-display">
            Ramadan Adventure • System Version 2.4 • © 1447H
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
