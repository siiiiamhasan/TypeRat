import { useState, useCallback } from 'react';

export const useProgress = () => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('typers_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse history', e);
        return [];
      }
    }
    return [];
  });

  const saveTestResult = useCallback((stats) => {
    const newResult = {
      id: Date.now(),
      wpm: stats.wpm,
      grossWpm: stats.grossWpm || stats.wpm || 0,
      netWpm: stats.netWpm || stats.rawWpm || 0,
      accuracy: stats.accuracy,
      errors: stats.errors,
      time: stats.time,
      mode: stats.mode,
      timestamp: stats.timestamp || new Date().toISOString(),
      wordCount: stats.wordCount || 0,
      consistency: stats.consistency || 0,
      correctChars: stats.correctChars || 0,
      incorrectChars: stats.incorrectChars || 0,
      skippedChars: stats.skippedChars || 0,
      extraChars: stats.extraChars || 0
    };

    setHistory(prev => {
      const newHistory = [newResult, ...prev];
      localStorage.setItem('typers_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('typers_history');
    setHistory([]);
  }, []);

  const getStats = () => {
    if (history.length === 0) return { maxWpm: 0, avgWpm: 0, avgAccuracy: 0, totalTests: 0, totalTime: 0, consistency: 0 };
    
    const maxWpm = Math.max(...history.map(h => h.wpm || 0));
    const avgWpm = Math.round(history.reduce((sum, h) => sum + (h.wpm || 0), 0) / history.length);
    const avgAccuracy = Math.round(history.reduce((sum, h) => sum + (h.accuracy || 0), 0) / history.length);
    const avgConsistency = Math.round(history.reduce((sum, h) => sum + (h.consistency || 0), 0) / history.length);
    const totalTests = history.length;
    const totalTime = history.reduce((sum, h) => sum + (h.time || 0), 0);

    return { maxWpm, avgWpm, avgAccuracy, totalTests, totalTime, consistency: avgConsistency };
  };

  return { history, saveTestResult, clearHistory, getStats };
};
