import { useRef, useState, useEffect } from 'react';
import { RotateCcw, Square } from 'lucide-react';
import './TypingArea.css';

const TypingArea = ({ phase, mode, text, typed, stats, timeLeft, isFocused, restart, onFinish }) => {
  const containerRef  = useRef(null);
  const highWaterRef  = useRef(0);  // tracks furthest char position ever reached — never goes backwards
  const [showConfirm, setShowConfirm] = useState(false);

  // Update high-water mark whenever the user types further forward or phase changes
  useEffect(() => {
    if (typed.length > highWaterRef.current) {
      highWaterRef.current = typed.length;
    }
    if (phase === 'setup') {
      highWaterRef.current = 0;
    }
  }, [typed.length, phase]);

  if (phase === 'finished') return null;

  const handleFinish = () => {
    setShowConfirm(true);
  };

  const confirmFinish = () => {
    setShowConfirm(false);
    if (onFinish) onFinish();
  };

  const renderText = () => {
    if (mode === 'zen') {
      const startZen = Math.max(0, typed.length - 200);
      const visibleTyped = typed.slice(startZen);
      return (
        <>
          {visibleTyped.split('').map((char, i) => (
            <span key={startZen + i} className="char correct">{char}</span>
          ))}
          <span className="char active">&nbsp;</span>
        </>
      );
    }

    // Text Virtualization: Render only a window of text so the DOM stays small.
    // Use the high-water mark (furthest char ever reached) as the anchor.
    // This prevents the view from teleporting back when the user backspaces
    // across a page boundary (e.g. from char 251 back to char 249).
    const PAGE_SIZE = 250;
    const pageIndex = Math.floor(highWaterRef.current / PAGE_SIZE);

    let baseIdx = pageIndex * PAGE_SIZE;
    // Snap backwards to the beginning of the nearest word
    while (baseIdx > 0 && text[baseIdx - 1] !== ' ') {
      baseIdx--;
    }

    let endIdx = Math.min(text.length, baseIdx + PAGE_SIZE + 200);
    // Snap forwards to the end of a word
    while (endIdx < text.length && text[endIdx] !== ' ') {
      endIdx++;
    }

    const visibleText = text.substring(baseIdx, endIdx);

    return visibleText.split('').map((char, idx) => {
      const absoluteIdx = baseIdx + idx;
      let className = 'char ';
      if (absoluteIdx < typed.length) {
        className += typed[absoluteIdx] === char ? 'correct' : 'incorrect';
      } else if (absoluteIdx === typed.length) {
        className += 'active';
      }
      return (
        <span key={absoluteIdx} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="typing-area-wrapper">
      {!isFocused && (
        <div className="blur-overlay flex-center">
          <div className="blur-message">Click or press any key to focus</div>
        </div>
      )}

      {showConfirm && (
        <div className="confirmation-overlay flex-center">
          <div className="confirmation-modal">
            <h3>Finish Test?</h3>
            <p>Are you sure you want to finish this test early?</p>
            <div className="confirmation-buttons">
              <button 
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmFinish}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="mini-stats">
          {mode === 'time' && (
            <>
              <span>{timeLeft}s</span>
              <span className="dot">•</span>
            </>
          )}
          {mode === 'words' && (
            <>
              <span>{typed.split(' ').filter(w => w).length}/{text.split(' ').length}</span>
              <span className="dot">•</span>
            </>
          )}
          {mode === 'zen' && (
            <>
              <span>zen mode (shift+enter to end)</span>
              <span className="dot">•</span>
            </>
          )}
          <span>{stats.wpm} wpm</span>
        </div>
      )}

      <div className={`typing-area-container ${!isFocused ? 'blurred' : ''}`}>
        
        <div className="text-display" ref={containerRef}>
          {/* eslint-disable-next-line react-hooks/refs */}
          {renderText()}
        </div>

        <div className="restart-container flex-center">
          {phase === 'playing' && (
            <button 
              className="finish-btn icon-button" 
              onClick={handleFinish} 
              title="Finish Test"
              aria-label="Finish"
            >
              <Square size={24} />
            </button>
          )}
          <button 
            className="restart-btn icon-button" 
            onClick={() => restart()} 
            title="Restart Test"
            aria-label="Restart"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypingArea;
