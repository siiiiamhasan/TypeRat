// React not needed for JSX-only components in newer React versions
import { Clock, Type, Quote, Hash, AtSign, Mountain, Wrench } from 'lucide-react';
import './TestOptions.css';

const TIME_OPTIONS = [15, 60, 120, 300, 600];
const WORD_OPTIONS = [30, 60, 100, 500];

const TestOptions = ({ 
  phase, mode, setMode, 
  wordCount, setWordCount, 
  duration, setDuration,
  modifiers, setModifiers
}) => {
  if (phase !== 'setup') return null;

  return (
    <div className="test-options-container flex-center">
      <div className="options-group">
        
        {/* Modifiers */}
        <div className="pill-selector">
          <button 
            className={`pill-btn icon-pill ${modifiers.punctuation ? 'active' : ''}`}
            onClick={() => setModifiers(m => ({ ...m, punctuation: !m.punctuation }))}
          >
            <AtSign size={14} /> punctuation
          </button>
          <button 
            className={`pill-btn icon-pill ${modifiers.numbers ? 'active' : ''}`}
            onClick={() => setModifiers(m => ({ ...m, numbers: !m.numbers }))}
          >
            <Hash size={14} /> numbers
          </button>
        </div>

        <div className="divider"></div>

        {/* Mode Selector */}
        <div className="pill-selector">
          <button 
            className={`pill-btn icon-pill ${mode === 'time' ? 'active' : ''}`}
            onClick={() => setMode('time')}
          >
            <Clock size={14} /> time
          </button>
          <button 
            className={`pill-btn icon-pill ${mode === 'words' ? 'active' : ''}`}
            onClick={() => setMode('words')}
          >
            <Type size={14} /> words
          </button>
          <button 
            className={`pill-btn icon-pill ${mode === 'quote' ? 'active' : ''}`}
            onClick={() => setMode('quote')}
          >
            <Quote size={14} /> quote
          </button>
          <button 
            className={`pill-btn icon-pill ${mode === 'zen' ? 'active' : ''}`}
            onClick={() => setMode('zen')}
          >
            <Mountain size={14} /> zen
          </button>
        </div>

        <div className="divider"></div>

        {/* Length Selector */}
        {mode === 'time' && (
          <div className="pill-selector">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                className={`pill-btn ${duration === time ? 'active' : ''}`}
                onClick={() => setDuration(time)}
              >
                {time}
              </button>
            ))}
          </div>
        )}

        {mode === 'words' && (
          <div className="pill-selector">
            {WORD_OPTIONS.map((count) => (
              <button
                key={count}
                className={`pill-btn ${wordCount === count ? 'active' : ''}`}
                onClick={() => setWordCount(count)}
              >
                {count}
              </button>
            ))}
            <button 
              className="pill-btn icon-only" 
              title="Custom word count"
              onClick={() => {
                const count = prompt("Enter custom word count:");
                if (count && !isNaN(count) && Number(count) > 0) {
                  setWordCount(Number(count));
                }
              }}
            >
              <Wrench size={14} />
            </button>
          </div>
        )}


      </div>
    </div>
  );
};

export default TestOptions;
