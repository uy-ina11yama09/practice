import { Lightbulb, Settings, Moon, Sun, Monitor } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Header = ({ currentView, setCurrentView }) => {
  const { settings, updateSettings } = useApp();

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  const ThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <Lightbulb size={28} className="header-icon" />
        <h1>Idea Manager</h1>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-btn ${currentView === 'new' ? 'active' : ''}`}
          onClick={() => setCurrentView('new')}
        >
          新規作成
        </button>
        <button
          className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentView('list')}
        >
          アイデア一覧
        </button>
        <button
          className={`nav-btn ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          カレンダー
        </button>
      </nav>

      <div className="header-right">
        <button
          className="icon-btn"
          onClick={cycleTheme}
          title={`テーマ: ${settings.theme}`}
        >
          <ThemeIcon />
        </button>
        <button
          className={`icon-btn ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
          title="設定"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
