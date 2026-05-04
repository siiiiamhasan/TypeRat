import { useMemo } from 'react';
import './Leaderboard.css';

function Leaderboard({ history = [] }) {
  const leaderboard = useMemo(() => {
    if (!history || history.length === 0) {
      return [];
    }

    return history
      .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [history]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard">
        <h2 className="leaderboard-title">🏆 Leaderboard</h2>
        <div className="leaderboard-empty">
          <p>No tests completed yet. Start typing to appear on the leaderboard!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>
      
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <div className="col-rank">Rank</div>
          <div className="col-wpm">WPM</div>
          <div className="col-accuracy">Accuracy</div>
          <div className="col-date">Date</div>
        </div>

        <div className="leaderboard-rows">
          {leaderboard.map((entry, index) => (
            <div key={index} className={`leaderboard-row rank-${entry.rank}`}>
              <div className="col-rank">
                <span className="rank-badge">{entry.rank}</span>
              </div>
              <div className="col-wpm">
                <span className="wpm-value">{Math.round(entry.wpm || 0)}</span>
              </div>
              <div className="col-accuracy">
                <span className={`accuracy-value ${(entry.accuracy || 0) >= 95 ? 'excellent' : (entry.accuracy || 0) >= 85 ? 'good' : 'okay'}`}>
                  {(entry.accuracy || 0).toFixed(1)}%
                </span>
              </div>
              <div className="col-date">
                <span className="date-value">{formatDate(entry.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
