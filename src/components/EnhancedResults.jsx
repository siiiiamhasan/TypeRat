// React not needed for JSX-only components in newer React versions
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getLevel } from '../utils/levels';
import './EnhancedResults.css';

function EnhancedResults({ stats = {}, wordCount = 0, phase = '', history = [], typed = '', onRetake, onHome }) {
  if (phase !== 'finished' || !stats.wpm) {
    return null;
  }

  const grossWpm   = Math.round(stats.grossWpm ?? stats.wpm ?? 0);
  const netWpm     = Math.round(stats.netWpm ?? stats.rawWpm ?? 0);
  const accuracyNum = parseFloat((stats.accuracy || 0).toFixed(1)); // always a NUMBER
  const accuracy   = accuracyNum.toFixed(1);
  const errors     = stats.errors || 0;
  const time       = stats.time || 0;
  const totalWords = wordCount || Math.round((grossWpm * time) / 60);
  const performance = getLevel(grossWpm);
  const typedChars = typed.length;

  const accuracyClass = accuracyNum >= 95 ? 'excellent' : accuracyNum >= 85 ? 'good' : 'fair';

  return (
    <div className="enhanced-results fade-in">
      <div className="results-container">
        <div className="results-actions">
          <button className="results-action secondary" onClick={onHome} type="button">
            Home
          </button>
          <button className="results-action primary" onClick={onRetake} type="button">
            Retake
          </button>
        </div>

        {/* Main Result Card */}
        <div className="result-main-card">
          <div className="result-wpm-section">
            <span className="result-label">Words Per Minute</span>
            <div className="result-wpm-value">{grossWpm}</div>
            <span className="result-submetric">Net {netWpm} WPM</span>
            <span className="result-level" style={{ color: performance.color }}>
              {performance.label}
            </span>
          </div>

          <div className="result-accuracy-section">
            <span className="result-label">Accuracy</span>
            <div className="result-accuracy-value">{accuracy}%</div>
            <div className={`accuracy-indicator ${accuracyClass}`}></div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="results-grid">
          <div className="result-stat-box">
            <span className="stat-icon">⏱️</span>
            <span className="stat-label">Time</span>
            <span className="stat-value">{time}s</span>
          </div>

          <div className="result-stat-box">
            <span className="stat-icon">📝</span>
            <span className="stat-label">Words</span>
            <span className="stat-value">{totalWords}</span>
          </div>

          <div className="result-stat-box">
            <span className="stat-icon">❌</span>
            <span className="stat-label">Errors</span>
            <span className="stat-value">{errors}</span>
          </div>

          <div className="result-stat-box">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Consistency</span>
            <span className="stat-value">{(stats.consistency || 0).toFixed(0)}%</span>
          </div>
        </div>

        {/* WPM Over Time Chart */}
        {history && history.length > 1 && (
          <div className="results-chart-card">
            <div className="chart-title">WPM over time</div>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <LineChart data={history} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="second" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', background: 'var(--surface-white)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                    labelStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    name="Gross"
                    stroke="var(--text-primary)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--text-primary)', stroke: 'white', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rawWpm"
                    name="Net"
                    stroke="var(--text-muted)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Breakdown Section */}
        <div className="results-breakdown">
          <h3 className="breakdown-title">Character Breakdown</h3>
          <div className="breakdown-stats">
            <div className="breakdown-item">
              <span className="breakdown-label">Correct</span>
              <span className="breakdown-value correct">{stats.correctChars || 0}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Incorrect</span>
              <span className="breakdown-value incorrect">{stats.incorrectChars || 0}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Skipped</span>
              <span className="breakdown-value skipped">{stats.skippedChars || 0}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Extra</span>
              <span className="breakdown-value extra">{stats.extraChars || 0}</span>
            </div>
          </div>
        </div>

        <div className="results-history-card">
          <div className="history-header">
            <h3 className="history-title">Input History</h3>
            <span className="history-meta">{typedChars} characters</span>
          </div>
          <pre className={`history-content ${typed ? '' : 'empty'}`}>
            {typed || 'No input captured.'}
          </pre>
        </div>

        {/* Performance Tips */}
        {accuracyNum < 85 && (
          <div className="performance-tip warning">
            <span className="tip-icon">💡</span>
            <span>Focus on accuracy first. Speed will follow naturally!</span>
          </div>
        )}

        {accuracyNum >= 95 && grossWpm < 60 && (
          <div className="performance-tip success">
            <span className="tip-icon">⭐</span>
            <span>Excellent accuracy! Try increasing your speed.</span>
          </div>
        )}

        {accuracyNum >= 95 && grossWpm >= 120 && (
          <div className="performance-tip success">
            <span className="tip-icon">🎉</span>
            <span>Outstanding performance! You're a typing master!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedResults;
