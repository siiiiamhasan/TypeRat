import { useMemo, useState } from 'react';
import { Award, Clock3, Flame, Medal, PencilLine, Share2, Target, Trash2, TrendingUp, Trophy } from 'lucide-react';
import { getLevel, getLevelProgress } from '../utils/levels';
import './ProfileSection.css';

const LEADERBOARD_OPTIONS = [
  { key: '15', label: '15 seconds', mode: 'time', value: 15 },
  { key: '30', label: '30 seconds', mode: 'time', value: 30 },
  { key: '60', label: '60 seconds', mode: 'time', value: 60 },
  { key: '120', label: '120 seconds', mode: 'time', value: 120 },
  { key: '10w', label: '10 words', mode: 'words', value: 10 },
  { key: '25w', label: '25 words', mode: 'words', value: 25 },
  { key: '50w', label: '50 words', mode: 'words', value: 50 },
  { key: '100w', label: '100 words', mode: 'words', value: 100 }
];

const TIME_RANGES = [
  { key: 'day', label: 'last day', hours: 24 },
  { key: 'week', label: 'last week', hours: 24 * 7 },
  { key: 'month', label: 'last month', hours: 24 * 30 },
  { key: '3months', label: 'last 3 months', hours: 24 * 90 },
  { key: 'all', label: 'all time', hours: null }
];

function ProfileSection({ stats = {}, totalTests = 0, history = [] }) {
  const [leaderboardFilter, setLeaderboardFilter] = useState('60');
  const [timeRange, setTimeRange] = useState('all');

  const sortedByRecent = useMemo(
    () => [...history].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)),
    [history]
  );

  const filteredByTime = useMemo(() => {
    const range = TIME_RANGES.find(item => item.key === timeRange);
    if (!range || !range.hours) return sortedByRecent;

    // Calculate time limit based on current time
    // eslint-disable-next-line react-hooks/purity
    const currentTime = Date.now();
    const limit = currentTime - range.hours * 60 * 60 * 1000;
    return sortedByRecent.filter(test => {
      const testTime = new Date(test.timestamp || 0).getTime();
      return Number.isFinite(testTime) && testTime >= limit;
    });
  }, [sortedByRecent, timeRange]);

  const selectedLeaderboard = useMemo(() => {
    const option = LEADERBOARD_OPTIONS.find(item => item.key === leaderboardFilter);
    if (!option) return [];

    return filteredByTime
      .filter(test => {
        if (option.mode === 'time') {
          // Match by the test's selected duration, not elapsed time
          // A 60s test that finishes early still has mode='time' and duration ~= 60
          return test.mode === 'time' && (
            Number(test.time) === option.value ||
            (test.duration && Number(test.duration) === option.value)
          );
        }
        return test.mode === 'words' && Number(test.wordCount) === option.value;
      })
      .sort((a, b) => {
        if ((b.wpm || 0) !== (a.wpm || 0)) return (b.wpm || 0) - (a.wpm || 0);
        return (b.accuracy || 0) - (a.accuracy || 0);
      })
      .slice(0, 5);
  }, [filteredByTime, leaderboardFilter]);

  const topScores = useMemo(() => {
    return [...history]
      .sort((a, b) => {
        if ((b.wpm || 0) !== (a.wpm || 0)) return (b.wpm || 0) - (a.wpm || 0);
        return (b.accuracy || 0) - (a.accuracy || 0);
      })
      .slice(0, 5);
  }, [history]);

  const recentResults = useMemo(() => sortedByRecent.slice(0, 10), [sortedByRecent]);

  const avgWpm = Number(stats?.avgWpm || 0);
  const maxWpm = Number(stats?.maxWpm || 0);
  const avgAccuracy = Number(stats?.avgAccuracy || 0);
  const consistency = Number(stats?.consistency || 0);
  const totalTime = Number(stats?.totalTime || 0);

  const completionRate = totalTests > 0 ? Math.round((history.filter(item => item?.wpm > 0).length / totalTests) * 100) : 0;
  const typingHours = Math.floor(totalTime / 3600);
  const typingMinutes = Math.floor((totalTime % 3600) / 60);
  const levelInfo = getLevel(avgWpm);
  const progress = getLevelProgress(avgWpm);
  const username = 'typist';
  const joinDate = '02 May 2026';
  const emptyLeaderboard = selectedLeaderboard.length === 0;

  return (
    <div className="profile-page">
      <section className="profile-hero card-surface">
        <div className="profile-identity">
          <div className="profile-avatar">
            <span>{username.slice(0, 1).toUpperCase()}</span>
          </div>
          <div>
            <p className="profile-kicker">profile</p>
            <h1 className="profile-name">{username}</h1>
            <p className="profile-meta">Joined {joinDate}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="profile-action-btn" aria-label="Edit profile" onClick={() => alert("Profile editing will be available in a future update!")}>
            <PencilLine size={16} />
            <span>Edit</span>
          </button>
          <button type="button" className="profile-action-btn" aria-label="Delete profile" onClick={() => { if(window.confirm("Are you sure you want to clear your local typing history?")) { localStorage.removeItem('typers_history'); window.location.reload(); } }}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
          <button type="button" className="profile-action-btn" aria-label="Share profile" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Profile link copied to clipboard!"); }}>
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </section>

      <section className="profile-grid card-surface">
        <div className="profile-summary">
          <div>
            <p className="section-kicker">all-time stats</p>
            <h2>All-Time Stats</h2>
          </div>
          <div className="level-chip" style={{ color: levelInfo.color }}>{levelInfo.label}</div>
        </div>

        <div className="stats-cards">
          <StatCard icon={<TrendingUp size={18} />} label="Average WPM" value={Math.round(avgWpm)} helper="session average" accent />
          <StatCard icon={<Trophy size={18} />} label="Best WPM" value={maxWpm} helper="best score" />
          <StatCard icon={<Target size={18} />} label="Accuracy" value={`${avgAccuracy.toFixed(1)}%`} helper="all tests" />
          <StatCard icon={<Clock3 size={18} />} label="Consistency" value={`${consistency.toFixed(0)}%`} helper="stability" />
        </div>

        <div className="progress-block">
          <div className="progress-row">
            <span>Level progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-hint">Next tier gets unlocked by steady improvement, not just one fast run.</div>
        </div>
      </section>

      <section className="profile-grid card-surface">
        <div className="section-header">
          <div>
            <p className="section-kicker">personal records</p>
            <h2>All-Time Leaderboards</h2>
          </div>
          <div className="section-pill">your best runs</div>
        </div>

        <div className="filter-panel">
          <div className="filter-row">
            <span className="filter-label">Mode</span>
            <div className="filter-group">
              {LEADERBOARD_OPTIONS.map(option => (
                <button
                  key={option.key}
                  type="button"
                  className={`filter-chip ${leaderboardFilter === option.key ? 'active' : ''}`}
                  onClick={() => setLeaderboardFilter(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Period</span>
            <div className="time-range-group">
              {TIME_RANGES.map(range => (
                <button
                  key={range.key}
                  type="button"
                  className={`time-chip ${timeRange === range.key ? 'active' : ''}`}
                  onClick={() => setTimeRange(range.key)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="leaderboard-card">
          <div className="leaderboard-title-row">
            <h3>Top 5 scores</h3>
            <span>{selectedLeaderboard.length} results</span>
          </div>

          {emptyLeaderboard ? (
            <EmptyState text="No matching runs yet. Complete a test for this filter to appear here." icon={<Flame size={20} />} />
          ) : (
            <div className="leaderboard-list">
              {selectedLeaderboard.map((test, index) => (
                <LeaderboardRow key={test.id || `${test.timestamp}-${index}`} index={index} test={test} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="profile-grid two-columns">
        <div className="card-surface compact-card">
          <div className="section-header">
            <div>
              <p className="section-kicker">top scores</p>
              <h2>Top 5 Scores</h2>
            </div>
            <div className="section-pill">user history</div>
          </div>

          {topScores.length > 0 ? (
            <div className="top-score-list">
              {topScores.map((test, index) => (
                <TopScoreRow key={test.id || `${test.timestamp}-${index}`} index={index} test={test} />
              ))}
            </div>
          ) : (
            <EmptyState text="Your best five scores will appear here after a few completed tests." icon={<Medal size={20} />} />
          )}
        </div>

        <div className="card-surface compact-card">
          <div className="section-header">
            <div>
              <p className="section-kicker">recent results</p>
              <h2>Last 10 Results</h2>
            </div>
            <div className="section-pill">latest history</div>
          </div>

          {recentResults.length > 0 ? (
            <div className="recent-list">
              {recentResults.map((test, index) => (
                <RecentRow key={test.id || `${test.timestamp}-${index}`} test={test} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState text="No test results yet. Type a few runs and they will show up here." icon={<Award size={20} />} />
          )}
        </div>
      </section>

      <section className="profile-grid card-surface">
        <div className="section-header">
          <div>
            <p className="section-kicker">summary</p>
            <h2>Performance Snapshot</h2>
          </div>
          <div className="section-pill">quick view</div>
        </div>

        <div className="snapshot-grid">
          <SnapshotItem label="Avg WPM" value={Math.round(avgWpm)} />
          <SnapshotItem label="Best WPM" value={maxWpm} />
          <SnapshotItem label="Accuracy" value={`${avgAccuracy.toFixed(1)}%`} />
          <SnapshotItem label="Consistency" value={`${consistency.toFixed(0)}%`} />
          <SnapshotItem label="Completion" value={`${completionRate}%`} />
          <SnapshotItem label="Typing Time" value={formatClock(typingHours, typingMinutes)} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, helper, accent = false }) {
  return (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-helper">{helper}</span>
    </div>
  );
}

function LeaderboardRow({ test, index }) {
  return (
    <div className="leaderboard-row">
      <div className={`leaderboard-rank rank-${index + 1}`}>{index + 1}</div>
      <div className="leaderboard-main">
        <strong>{test.wpm} wpm</strong>
        <span>{test.mode === 'words' ? `${test.wordCount || 0} words` : `${test.time || 0} seconds`}</span>
      </div>
      <div className="leaderboard-meta">
        <span>{Number(test.accuracy || 0).toFixed(0)}%</span>
        <small>{formatTimeAgo(test.timestamp)}</small>
      </div>
    </div>
  );
}

function TopScoreRow({ test, index }) {
  return (
    <div className="history-row highlight-row">
      <div className={`history-rank rank-${index + 1}`}>{index + 1}</div>
      <div className="history-main">
        <strong>{test.wpm} wpm</strong>
        <span>{Number(test.accuracy || 0).toFixed(0)}% accuracy</span>
      </div>
      <div className="history-meta">{formatTimeAgo(test.timestamp)}</div>
    </div>
  );
}

function RecentRow({ test, index }) {
  return (
    <div className="history-row">
      <div className="history-rank">{index + 1}</div>
      <div className="history-main">
        <strong>{test.wpm} wpm</strong>
        <span>{test.mode === 'words' ? `${test.wordCount || 0} words` : `${test.time || 0} seconds`}</span>
      </div>
      <div className="history-meta">
        <span>{Number(test.accuracy || 0).toFixed(0)}%</span>
        <small>{formatTimeAgo(test.timestamp)}</small>
      </div>
    </div>
  );
}

function SnapshotItem({ label, value }) {
  return (
    <div className="snapshot-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text, icon }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}



function formatClock(hours, minutes) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const diffSeconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default ProfileSection;
