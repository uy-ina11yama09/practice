import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import IdeaForm from './components/IdeaForm';
import IdeaList from './components/IdeaList';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import './App.css';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('new');
  const { settings, isLoading } = useApp();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  const handleIdeaComplete = () => {
    setCurrentView('list');
  };

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {currentView === 'new' && (
          <div className="view-container">
            <h2>新しいアイデアを記録</h2>
            <IdeaForm onComplete={handleIdeaComplete} />
          </div>
        )}
        {currentView === 'list' && (
          <div className="view-container">
            <h2>アイデア一覧</h2>
            <IdeaList />
          </div>
        )}
        {currentView === 'calendar' && (
          <div className="view-container">
            <h2>カレンダー</h2>
            <CalendarView />
          </div>
        )}
        {currentView === 'settings' && (
          <div className="view-container">
            <Settings />
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
