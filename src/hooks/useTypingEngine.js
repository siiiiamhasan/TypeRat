import { useState, useEffect, useCallback } from 'react';

const WORDS_LIST = [
  // Core function words
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  // Verb forms
  "is", "are", "was", "were", "been", "being", "has", "had", "doing", "does", "did", "going", "gone", "went",
  "makes", "made", "making", "takes", "took", "taking", "knows", "knew", "thinks", "thought", "sees", "saw",
  "comes", "came", "wants", "wanted", "uses", "used", "find", "found", "tell", "told", "ask", "asked",
  "seem", "feel", "felt", "try", "tried", "leave", "left", "call", "called", "keep", "kept", "put", "let",
  "begin", "began", "begun", "help", "helped", "show", "showed", "shown", "hear", "heard", "play", "played",
  "run", "ran", "move", "moved", "live", "lived", "believe", "believed", "bring", "brought", "happen", "happened",
  "write", "wrote", "written", "sit", "sat", "stand", "stood", "lose", "lost", "pay", "paid", "meet", "met",
  "include", "continue", "learn", "learned", "change", "changed", "lead", "led", "understand", "understood",
  "watch", "watched", "follow", "followed", "stop", "stopped", "create", "created", "speak", "spoke", "spoken",
  "read", "allow", "allowed", "add", "spend", "spent", "grow", "grew", "grown", "open", "opened", "walk", "walked",
  "win", "won", "offer", "remember", "love", "loved", "consider", "appear", "appeared", "buy", "bought",
  "wait", "waited", "serve", "served", "send", "sent", "expect", "build", "built", "stay", "stayed",
  "fall", "fell", "fallen", "cut", "reach", "reached", "remain", "suggest", "raise",
  // Nouns
  "water", "mother", "father", "child", "children", "problem", "school", "state", "city", "country",
  "night", "morning", "system", "group", "number", "part", "word", "hand", "place", "home",
  "house", "picture", "animal", "point", "world", "earth", "head", "page", "answer", "tree",
  "farm", "story", "life", "sea", "paper", "music", "letter", "food", "sun", "plant",
  "eye", "city", "north", "example", "cross", "mark",
  // Adjectives & adverbs
  "again", "kind", "off", "near", "far", "hard", "real", "few", "white", "still",
  "always", "often", "together", "next", "both", "those", "late", "last", "never",
  "while", "close", "might", "should", "between", "four", "cover", "draw", "press", "got",
  "ease", "start", "seem", "begin", "open"
];

const QUOTES_LIST = [
  "The quick brown fox jumps over the lazy dog.",
  "To be, or not to be, that is the question.",
  "All that glitters is not gold.",
  "I think, therefore I am.",
  "A journey of a thousand miles begins with a single step.",
  "Life is what happens when you're busy making other plans.",
  "That which does not kill us makes us stronger.",
  "The only thing we have to fear is fear itself.",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
  "Be the change that you wish to see in the world.",
  "In three words I can sum up everything I've learned about life: it goes on.",
  "If you tell the truth, you don't have to remember anything.",
  "Always forgive your enemies; nothing annoys them so much.",
  "To live is the rarest thing in the world. Most people exist, that is all.",
  "Without music, life would be a mistake."
];

// Constants for text modifiers
const PUNCTUATION_MARKS = [",", ".", "?", "!", ";", ":", '"', "'"];
const PUNCTUATION_PROBABILITY = 0.3; // 30% chance to add punctuation
const NUMBER_PROBABILITY = 0.2; // 20% chance to add number
const QUOTE_WRAPPED_MARKS = ['"', "'"];

const addPunctuation = (word) => {
  if (Math.random() > (1 - PUNCTUATION_PROBABILITY)) {
    const mark = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
    if (QUOTE_WRAPPED_MARKS.includes(mark)) {
      return `${mark}${word}${mark}`;
    }
    return word + mark;
  }
  return word;
};

const addNumber = (word) => {
  if (Math.random() > (1 - NUMBER_PROBABILITY)) {
    return Math.floor(Math.random() * 100).toString();
  }
  return word;
};

const generateWords = (mode, count, duration, modifiers, customText = "") => {
  if (mode === 'quote') {
    return QUOTES_LIST[Math.floor(Math.random() * QUOTES_LIST.length)];
  }
  if (mode === 'custom') {
    return customText || "This is a custom text mode. You can replace this text.";
  }
  if (mode === 'zen') {
    return ""; // Zen mode has no predefined text
  }

  // For time mode: estimate words needed (at ~150 WPM = 2.5 words/sec, use 3x multiplier for buffer)
  const wordCount = mode === 'time' ? Math.max(200, duration * 3) : count;
  const generatedWords = [];
  
  for (let i = 0; i < wordCount; i++) {
    let word = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
    if (modifiers.numbers) word = addNumber(word);
    if (modifiers.punctuation) word = addPunctuation(word);
    generatedWords.push(word);
  }
  
  return generatedWords.join(' ');
};

// Classify a keystroke as correct, wrong, or extra
const classifyKeystroke = (inputChar, targetChar, currentIndex, targetLength) => {
  if (currentIndex < targetLength) {
    return inputChar === targetChar ? 'correct' : 'wrong';
  }
  return 'extra';
};

// Calculate WPM from character counts and time
const calculateWpm = (characterCount, timeInSeconds) => {
  if (timeInSeconds <= 0) return 0;
  return Math.round((characterCount / 5) / (timeInSeconds / 60));
};

export const useTypingEngine = (mode = 'words', count = 30, duration = 60, modifiers = { punctuation: false, numbers: false }, soundEnabled = false, customText = "") => {
  const [phase, setPhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [correctHits, setCorrectHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [extraHits, setExtraHits] = useState(0);
  const [inputHistory, setInputHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [history, setHistory] = useState([]); // { second, wpm, raw, errors }
  const [isFocused, setIsFocused] = useState(true);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log('Audio error', e);
    }
  }, [soundEnabled]);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const restart = useCallback(() => {
    setText(generateWords(mode, count, duration, modifiers, customText));
    setTyped('');
    setPhase('setup');
    setStartTime(null);
    setEndTime(null);
    setCorrectHits(0);
    setErrors(0);
    setExtraHits(0);
    setInputHistory([]);
    setTimeLeft(duration);
    setHistory([]);
  }, [mode, count, duration, modifiers, customText]);

  const finishTest = useCallback(() => {
    setPhase('finished');
    setEndTime(Date.now());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restart();
  }, [mode, count, duration, modifiers.punctuation, modifiers.numbers, customText, restart]);

  // Timer logic for 'time' mode
  useEffect(() => {
    let interval;
    if (phase === 'playing' && mode === 'time') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase('finished');
            setEndTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, mode]);

  // History tracking logic: record WPM samples every second
  useEffect(() => {
    let interval;
    if (phase === 'playing') {
      interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 1000;
        const timeInSeconds = timeElapsed;
        
        // For zen mode, use typed length; otherwise use attempt counters
        const correctChars = mode === 'zen' ? typed.length : correctHits;
        const attemptedChars = mode === 'zen' ? typed.length : (correctHits + errors + extraHits);
        
        const grossWpm = calculateWpm(attemptedChars, timeInSeconds);
        const netWpm = calculateWpm(correctChars, timeInSeconds);

        setHistory(h => [...h, { 
          second: Math.floor(timeElapsed), 
          wpm: grossWpm, 
          rawWpm: netWpm, 
          grossWpm, 
          netWpm, 
          errors 
        }]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, startTime, typed, correctHits, errors, extraHits, mode]);

  // Check if user is trying to exit zen mode (Shift+Enter)
  const isZenModeExit = (e) => mode === 'zen' && e.key === 'Enter' && e.shiftKey;

  // Check if this is the first keystroke (should start test)
  const isFirstKeystroke = (e) => phase === 'setup' && e.key.length === 1 && !e.ctrlKey && !e.metaKey;

  // Check if this is a regular character (not control key)
  const isRegularCharacter = (e) => e.key.length === 1 && !e.ctrlKey && !e.metaKey;

  const handleKeyDown = useCallback((e) => {
    if (!isFocused) return;
    if (phase === 'finished') return;

    // Exit zen mode early with Shift+Enter
    if (isZenModeExit(e)) {
      setPhase('finished');
      setEndTime(Date.now());
      return;
    }

    // Start test on first keystroke
    if (isFirstKeystroke(e)) {
      setPhase('playing');
      setStartTime(Date.now());
    }

    // Prevent space from scrolling page
    if (e.key === ' ') {
      e.preventDefault();
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      setTyped((prev) => {
        playSound('type');
        setInputHistory(history => [...history, { key: 'Backspace', type: 'backspace', typed: prev.slice(0, -1) }]);
        return prev.slice(0, -1);
      });
      return;
    }

    // Handle regular character input
    if (isRegularCharacter(e)) {
      setTyped((prev) => {
        const nextTyped = prev + e.key;
        const keystrokeType = mode === 'zen' 
          ? 'correct' 
          : classifyKeystroke(e.key, text[prev.length], prev.length, text.length);

        // Update counters based on keystroke classification
        if (mode !== 'zen') {
          if (keystrokeType === 'correct') {
            setCorrectHits(c => c + 1);
            playSound('type');
          } else {
            if (keystrokeType === 'wrong') {
              setErrors(err => err + 1);
            } else {
              setExtraHits(extra => extra + 1);
            }
            playSound('error');
          }
        } else {
          playSound('type');
        }

        // Log keystroke to history
        setInputHistory(history => [...history, { key: e.key, type: keystrokeType, typed: nextTyped }]);

        // Check if test should end (for words/quote/custom modes)
        if ((mode === 'words' || mode === 'quote' || mode === 'custom') && nextTyped.length === text.length) {
          setPhase('finished');
          setEndTime(Date.now());
        }

        return nextTyped;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, text, mode, isFocused, playSound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const calculateStats = () => {
    if (!startTime) {
      return {
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        time: 0,
        errors: 0,
        consistency: 0,
        correctChars: 0,
        incorrectChars: 0,
        skippedChars: 0,
        extraChars: 0
      };
    }
    
    const timeToUse = phase === 'finished' && endTime ? endTime : Date.now(); // eslint-disable-line react-hooks/purity
    const timeInSeconds = (timeToUse - startTime) / 1000;
    
    // Calculate character breakdown from final visible text
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    
    if (mode === 'zen') {
      // In zen mode, all typed characters are considered correct
      correctChars = typed.length;
    } else {
      // Compare final typed text against target text character by character
      for (let i = 0; i < typed.length; i++) {
        if (i < text.length) {
          if (typed[i] === text[i]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        } else {
          extraChars++;
        }
      }
    }
    
    const skippedChars = Math.max(0, text.length - typed.length);
    const attemptedChars = correctChars + incorrectChars + extraChars;
    
    // Calculate WPM metrics
    const grossWpm = calculateWpm(attemptedChars, timeInSeconds);
    const netWpm = calculateWpm(correctChars, timeInSeconds);
    
    // Accuracy = correct keystrokes / total keystrokes
    const accuracy = attemptedChars > 0 ? Math.round((correctChars / attemptedChars) * 100) : 100;
    
    return {
      wpm: Math.max(0, grossWpm),
      rawWpm: Math.max(0, netWpm),
      grossWpm: Math.max(0, grossWpm),
      netWpm: Math.max(0, netWpm),
      accuracy,
      time: Math.round(timeInSeconds),
      errors: mode === 'zen' ? 0 : errors,
      consistency: accuracy, // consistency = accuracy for this typing engine
      correctChars,
      incorrectChars,
      skippedChars,
      extraChars
    };
  };

  const stats = calculateStats();

  return {
    phase,
    text,
    typed,
    inputHistory,
    stats,
    history,
    timeLeft,
    mode,
    isFocused,
    restart,
    finishTest
  };
};
