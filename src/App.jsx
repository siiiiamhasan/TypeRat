import { useState, useEffect, useMemo } from 'react';
import TopBar from './components/TopBar';
import TestOptions from './components/TestOptions';
import TypingArea from './components/TypingArea';
import CommandPalette from './components/CommandPalette';
import ProfileSection from './components/ProfileSection';
import Leaderboard from './components/Leaderboard';
import EnhancedResults from './components/EnhancedResults';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useProgress } from './hooks/useProgress';
import './App.css';

function App() {
  const [mode, setMode] = useState('time');
  const [wordCount, setWordCount] = useState(30);
  const [duration, setDuration] = useState(60);
  const [modifiers, setModifiers] = useState({ punctuation: false, numbers: false });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeView, setActiveView] = useState('typing');
  
  const {
    phase,
    text,
    typed,
    stats,
    history: engineHistory,
    timeLeft,
    isFocused,
    restart,
    finishTest
  } = useTypingEngine(mode, wordCount, duration, modifiers, soundEnabled);

  const { history: progressHistory, saveTestResult, getStats } = useProgress();

  useEffect(() => {
    if (phase === 'finished' && stats.wpm > 0) {
      saveTestResult({ 
        ...stats, 
        mode, 
        timestamp: new Date().toISOString(),
        wordCount: mode === 'words' ? wordCount : 0
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]); // intentionally only on phase change — stats/mode are stable at this point

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const goHome = () => {
    setActiveView('typing');
    restart();
  };

  const handleRetake = () => {
    goHome();
  };

  const profileStats = useMemo(() => getStats(), [getStats]);

  return (
    <>
      {phase !== 'playing' && (
        <TopBar 
          soundEnabled={soundEnabled} 
          toggleSound={toggleSound} 
          activeView={activeView}
          onViewChange={setActiveView}
          onLogoClick={goHome}
        />
      )}
      
      <main>
        {activeView === 'profile' ? (
          <ProfileSection 
            stats={profileStats} 
            totalTests={progressHistory.length} 
            history={progressHistory}
          />
        ) : activeView === 'leaderboard' ? (
          <Leaderboard 
            history={progressHistory} 
          />
        ) : (
          <>
            {phase !== 'playing' && (
              <TestOptions 
                phase={phase} 
                mode={mode}
                setMode={setMode}
                wordCount={wordCount} 
                setWordCount={setWordCount} 
                duration={duration}
                setDuration={setDuration}
                modifiers={modifiers}
                setModifiers={setModifiers}
              />
            )}
            
            <TypingArea 
              phase={phase}
              mode={mode}
              text={text}
              typed={typed}
              stats={stats}
              timeLeft={timeLeft}
              isFocused={isFocused}
              restart={restart}
              onFinish={finishTest}
            />
            
            {phase !== 'playing' && (
              <EnhancedResults 
                phase={phase}
                stats={stats}
                wordCount={mode === 'words' ? wordCount : 0}
                history={engineHistory}
                typed={typed}
                onRetake={handleRetake}
                onHome={goHome}
              />
            )}
          </>
        )}
      </main>

      <CommandPalette 
        isOpen={isPaletteOpen}
        setIsOpen={setIsPaletteOpen}
        setMode={setMode}
        setDuration={setDuration}
        setWordCount={setWordCount}
        setModifiers={setModifiers}
        restart={restart}
      />
      
      {activeView === 'typing' && phase !== 'playing' && (
        <div className="command-hint">
          press <kbd>ctrl</kbd> + <kbd>k</kbd> for command palette
        </div>
      )}
    </>
  );
}

export default App;
