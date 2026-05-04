import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = ({ 
  isOpen, 
  setIsOpen, 
  setMode, 
  setDuration, 
  setWordCount, 
  setModifiers,
  restart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: 'mode-time', title: 'Mode: Time', action: () => { setMode('time'); restart(); } },
    { id: 'mode-words', title: 'Mode: Words', action: () => { setMode('words'); restart(); } },
    { id: 'mode-quote', title: 'Mode: Quote', action: () => { setMode('quote'); restart(); } },
    { id: 'time-15', title: 'Time: 15s', action: () => { setMode('time'); setDuration(15); restart(); } },
    { id: 'time-30', title: 'Time: 30s', action: () => { setMode('time'); setDuration(30); restart(); } },
    { id: 'time-60', title: 'Time: 60s', action: () => { setMode('time'); setDuration(60); restart(); } },
    { id: 'words-10', title: 'Words: 10', action: () => { setMode('words'); setWordCount(10); restart(); } },
    { id: 'words-25', title: 'Words: 25', action: () => { setMode('words'); setWordCount(25); restart(); } },
    { id: 'words-50', title: 'Words: 50', action: () => { setMode('words'); setWordCount(50); restart(); } },
    { id: 'mod-punct', title: 'Toggle Punctuation', action: () => { setModifiers(m => ({ ...m, punctuation: !m.punctuation })); restart(); } },
    { id: 'mod-num', title: 'Toggle Numbers', action: () => { setModifiers(m => ({ ...m, numbers: !m.numbers })); restart(); } },
  ];

  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      // Batch state updates in a callback to avoid cascading renders
      const timer = setTimeout(() => {
        setSearchTerm('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    // Reset selection when search term changes
    const timer = setTimeout(() => setSelectedIndex(0), 0);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="palette-overlay" onClick={() => setIsOpen(false)}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <div className="palette-header">
          <Search size={18} className="palette-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="palette-list">
          {filteredCommands.map((cmd, idx) => (
            <div 
              key={cmd.id} 
              className={`palette-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => { cmd.action(); setIsOpen(false); }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span>{cmd.title}</span>
              {idx === selectedIndex && <ChevronRight size={16} />}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="palette-empty">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
