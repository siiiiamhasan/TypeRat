import { Volume2, VolumeX, User, Trophy } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ soundEnabled, toggleSound, activeView, onViewChange, onLogoClick }) => {
  return (
    <header className="topbar">
      <button className="logo flex-center" type="button" onClick={onLogoClick} aria-label="Go to home">
        <img src="/logo.png" alt="TypeRat Logo" className="logo-icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        <h1>TypeRat</h1>
      </button>

      <nav className="topbar-nav">
        <button 
          className={`nav-button ${activeView === 'typing' ? 'active' : ''}`}
          onClick={() => onViewChange('typing')}
          title="Typing Test"
        >
          ⌨️ Test
        </button>
        <button 
          className={`nav-button ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => onViewChange('profile')}
          title="Profile"
        >
          <User size={16} /> Profile
        </button>
        <button 
          className={`nav-button ${activeView === 'leaderboard' ? 'active' : ''}`}
          onClick={() => onViewChange('leaderboard')}
          title="Leaderboard"
        >
          <Trophy size={16} /> Leaderboard
        </button>
      </nav>

      <div className="controls">
        <button className="icon-button" onClick={toggleSound} aria-label="Toggle sound" title="Toggle Sound">
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
