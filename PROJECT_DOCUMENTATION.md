# Typers Project - Full Functional Explanation

## Project Overview
Typers is a **typing speed test application** built with React + Vite. It tracks typing accuracy, speed (WPM), consistency, and maintains historical performance data. The app supports multiple test modes and provides detailed analytics.

---

## Tech Stack
- **React 19** – UI framework
- **Vite 8** – Build tool and dev server
- **Recharts** – Chart visualization for WPM trends
- **Lucide React** – Icon library
- **localStorage** – Data persistence

---

## Architecture Overview

```
App.jsx (Main orchestrator)
  ├── useTypingEngine (Core test engine)
  ├── useProgress (History & stats tracking)
  └── 7 major UI components
      ├── TopBar (Navigation & sound toggle)
      ├── TestOptions (Mode/duration selection)
      ├── TypingArea (Live typing display)
      ├── EnhancedResults (Result summary)
      ├── ProfileSection (User stats & leaderboard)
      ├── Leaderboard (Top 10 scores)
      └── CommandPalette (Quick commands)
```

---

## Core Hooks

### 1. useTypingEngine (`src/hooks/useTypingEngine.js`)
**Purpose:** Core typing test engine. Manages typing state, keystroke tracking, and real-time calculations.

**Key State Variables:**
- `phase` – 'setup' | 'playing' | 'finished'
- `text` – Target text to type
- `typed` – Current user input
- `correctHits` – Count of correct keystrokes
- `errors` – Count of wrong keystrokes
- `extraHits` – Count of extra/beyond-scope keystrokes
- `inputHistory` – Full keystroke log
- `history` – Per-second WPM samples for charting

**Key Functions:**

#### handleKeyDown
Processes every keystroke:
- Detects when test should start (first character pressed in 'setup')
- Tracks correct/wrong/extra keypresses separately
- Handles backspace (only removes from visible text, not from counters)
- Detects test completion (when typed length matches target)
- Triggers sounds based on keystroke type

#### calculateStats
Computes final metrics from final visible text:
- **correctChars** – Characters in final text that match target
- **incorrectChars** – Characters in final text that don't match
- **extraChars** – Characters typed beyond target length
- **skippedChars** – Characters in target not reached
- **Gross WPM** – Based on all attempted characters (before accuracy correction)
- **Net WPM** – Based only on correct characters
- **Accuracy** – correct / (correct + incorrect + extra) × 100
- **Consistency** – Same as accuracy (character-based precision)

**Test Modes Supported:**
- **Words** – Type exact number of words
- **Time** – Type for specified duration (15s–120s)
- **Quote** – Type a random quote exactly
- **Custom** – Type user-provided text
- **Zen** – Unlimited freestyle typing (shift+enter to end)

---

### 2. useProgress (`src/hooks/useProgress.js`)
**Purpose:** Tracks historical test results and computes aggregate statistics.

**Key State:**
- `history` – Array of completed test results (persisted to localStorage)

**Key Functions:**

#### saveTestResult
Saves a test result with:
- WPM, accuracy, consistency, errors
- Mode, duration, timestamp
- Character breakdown (correct/incorrect/skipped/extra)

#### getStats
Computes all-time aggregate stats:
- **maxWpm** – Best single test WPM
- **avgWpm** – Average across all tests
- **avgAccuracy** – Average accuracy
- **avgConsistency** – Average consistency
- **totalTests** – Number of tests completed
- **totalTime** – Total time spent typing

---

## Major Components

### 1. App.jsx
Central hub that:
- Manages global state (mode, duration, sound, active view)
- Connects hooks and passes data to child components
- Routes between typing view, profile, and leaderboard
- Saves test results when phase changes to 'finished'

### 2. TopBar.jsx
Navigation and settings:
- Logo/home button
- Sound toggle
- View switcher (Typing | Profile | Leaderboard)

### 3. TestOptions.jsx
Pre-test configuration:
- Mode selector (words/time/quote/custom/zen)
- Duration/word count slider
- Modifiers (punctuation, numbers)
- Only visible during 'setup' phase

### 4. TypingArea.jsx
Live typing display during test:
- Renders target text with color coding:
  - **Green** = correct characters
  - **Red** = wrong characters
  - **Gray** = untyped characters
  - **Cursor** = current position (blinking animation)
- Text virtualization (only renders ~250 char window to keep DOM small)
- Mini stats (time/words left, current WPM)
- Finish & restart buttons
- Blur overlay when window loses focus

### 5. EnhancedResults.jsx
Post-test results summary:
- **Primary metrics:**
  - Gross WPM (main display)
  - Net WPM (subtitle)
  - Accuracy % with color indicator
  - Performance tier (Starter → Legendary)

- **Secondary stats grid:**
  - Time, Words typed, Errors, Consistency

- **WPM trend chart:**
  - Line chart showing gross vs net WPM over time
  - Updated each second during test

- **Character Breakdown:**
  - Correct, Incorrect, Skipped, Extra (from final visible text)

- **Input History:**
  - Shows final typed text
  - Character count matches what's visible

- **Performance tips:**
  - Dynamic encouragement based on accuracy/speed combo

### 6. ProfileSection.jsx
User statistics dashboard:
- **All-time stats card** showing avg/max WPM, accuracy, consistency
- **Level progress** showing advancement toward next tier
- **Top 5 scores** leaderboard
- **Recent results** (last 10 tests)
- **Filterable leaderboards** by mode (15s, 60s, words) and time range
- **Performance snapshot** with 6 key metrics
- Clear history button

### 7. Leaderboard.jsx
Global top 10 scores:
- Sorted by WPM (highest first)
- Shows rank, WPM, accuracy, timestamp
- Color-coded accuracy indicators

### 8. CommandPalette.jsx
Quick command menu (Ctrl+K):
- Switch mode instantly
- Adjust duration/word count
- Toggle sound
- Restart test

---

## Data Flow

### During a Test:
```
User presses key
    ↓
handleKeyDown (useTypingEngine)
    ├─ Updates typed buffer
    ├─ Tracks correctHits/errors/extraHits separately
    ├─ Updates inputHistory log
    └─ Triggers sound effect
    ↓
calculateStats runs every render
    ├─ Counts correct/incorrect in final typed text
    ├─ Calculates WPM, accuracy, consistency
    └─ Returns current stats object
    ↓
TypingArea renders live stats
    └─ Shows user their current WPM & accuracy
    ↓
Every 1 second (history tracking)
    └─ Appends { second, wpm, rawWpm, errors } to history array
       (used for chart later)
```

### After Test Finishes:
```
User completes test or timer runs out
    ↓
phase changes to 'finished'
    ↓
App.jsx detects phase change
    ↓
saveTestResult called with stats
    ├─ Saves to localStorage (in useProgress)
    ├─ Adds to history array
    └─ Updates profile stats
    ↓
EnhancedResults renders
    ├─ Shows final stats
    ├─ Plots WPM trend chart
    └─ Breaks down character accuracy
```

---

## Character Counting Logic (Critical)

The app tracks two separate concepts:

### 1. Final Text Breakdown
Shown in Character Breakdown box:
- Based on final visible `typed` string
- Correct = positions where typed[i] === text[i]
- Incorrect = positions where typed[i] !== text[i]
- Extra = positions where i >= text.length
- Skipped = positions where i >= typed.length

### 2. Input History
Shown in Input History box:
- Shows final visible text only
- Character count = typed.length
- Backspaces are NOT shown (they only remove from the buffer)

**Important:** Deleted characters are NOT retained in stats. The results show the final state only.

---

## WPM Calculation

- **Gross WPM** = (all typed characters / 5) / time in minutes
  - Includes wrong characters and extras
  - Shows true typing speed regardless of accuracy

- **Net WPM** = (correct characters only / 5) / time in minutes
  - Only counts correct keystrokes
  - Shows effective speed after accuracy penalty

---

## Skill Levels (Based on WPM)

| WPM Range | Level | Color |
|-----------|-------|-------|
| 150+ | Legendary | Purple |
| 120–149 | Expert | Green |
| 90–119 | Advanced | Blue |
| 60–89 | Intermediate | Orange |
| 40–59 | Beginner | Red |
| 0–39 | Starter | Gray |

---

## Storage & Persistence

All test history is stored in **localStorage** under key `'typers_history'`:

```javascript
{
  id: Date.now(),
  wpm: 85,
  accuracy: 92.5,
  consistency: 92.5,
  errors: 2,
  time: 60,
  mode: 'time',
  timestamp: ISO timestamp,
  correctChars: 275,
  incorrectChars: 25,
  skippedChars: 0,
  extraChars: 0
}
```

---

## Key Features Summary

✅ **Real-time typing detection** with sound feedback
✅ **5 test modes** (words, time, quote, custom, zen)
✅ **Separate gross/net WPM** tracking
✅ **Character-based accuracy & consistency** (not WPM-variance)
✅ **Keystroke logging** with attempts fully tracked
✅ **Live WPM trend chart** during and after test
✅ **All-time statistics** with level progression
✅ **Leaderboards** (filtered by mode & time range)
✅ **Persistent history** in browser localStorage
✅ **Focus detection** with blur overlay
✅ **Keyboard shortcuts** (Ctrl+K command palette, Shift+Enter to finish zen)

---

## File Structure

```
src/
├── App.jsx                    # Main app component
├── App.css                    # Global styles
├── main.jsx                   # Entry point
├── index.css                  # Base styles
├── components/
│   ├── TopBar.jsx
│   ├── TestOptions.jsx
│   ├── TypingArea.jsx
│   ├── EnhancedResults.jsx
│   ├── ProfileSection.jsx
│   ├── Leaderboard.jsx
│   ├── CommandPalette.jsx
│   └── [component].css files
├── hooks/
│   ├── useTypingEngine.js     # Core typing logic
│   └── useProgress.js         # History & stats tracking
└── utils/
    └── levels.js              # Skill level definitions
```

---

The entire app is **fully functional** and ready to use for tracking typing progress over time.
