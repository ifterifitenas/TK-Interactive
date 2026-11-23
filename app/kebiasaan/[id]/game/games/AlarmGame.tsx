'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface AlarmGameProps {
  onComplete: () => void;
}

interface AlarmCell {
  id: number;
  active: boolean;
  timeLeft: number; // ms remaining before this alarm "escapes"
}

const GRID_SIZE = 9; // 3x3
const ALARM_DURATION = 3000; // ms each alarm is visible
const GAME_DURATION = 30; // seconds
const MAX_LIVES = 3;
const SPAWN_INTERVAL = 1400; // ms between new alarm spawns
const MAX_ACTIVE = 3; // max simultaneous active alarms

function createInitialCells(): AlarmCell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: i,
    active: false,
    timeLeft: ALARM_DURATION,
  }));
}

export default function AlarmGame({ onComplete }: AlarmGameProps) {
  const [cells, setCells] = useState<AlarmCell[]>(createInitialCells);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [popScores, setPopScores] = useState<{ id: number; x: number; y: number; key: number }[]>([]);
  const [round, setRound] = useState(0);

  const cellTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const cellTokensRef = useRef<Record<number, number>>({});
  const cellsRef = useRef<AlarmCell[]>(createInitialCells());
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialSpawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const livesRef = useRef(MAX_LIVES);
  const gameOverRef = useRef(false);
  const popKeyRef = useRef(0);

  const endGame = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    if (livesRef.current <= 0) sfx.failure();
    else sfx.completion();
    // Clear all timers
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (initialSpawnRef.current) clearTimeout(initialSpawnRef.current);
    Object.values(cellTimersRef.current).forEach(clearTimeout);
    cellTimersRef.current = {};
    cellTokensRef.current = {};
  }, []);

  const deactivateCell = useCallback((cellId: number, missed: boolean, token: number) => {
    if (gameOverRef.current) return;
    if (cellTokensRef.current[cellId] !== token) return;
    delete cellTimersRef.current[cellId];
    delete cellTokensRef.current[cellId];
    const nextCells = cellsRef.current.map(c =>
      c.id === cellId ? { ...c, active: false, timeLeft: ALARM_DURATION } : c
    );
    cellsRef.current = nextCells;
    setCells(nextCells);
    if (missed) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        endGame();
      }
    }
  }, [endGame]);

  const spawnAlarm = useCallback(() => {
    if (gameOverRef.current) return;
    const inactive = cellsRef.current.filter(c => !c.active);
    const active = cellsRef.current.filter(c => c.active);
    if (inactive.length === 0 || active.length >= MAX_ACTIVE) return;

    const target = inactive[Math.floor(Math.random() * inactive.length)];
    const nextCells = cellsRef.current.map(c =>
      c.id === target.id ? { ...c, active: true, timeLeft: ALARM_DURATION } : c
    );
    cellsRef.current = nextCells;
    setCells(nextCells);

    if (cellTimersRef.current[target.id]) clearTimeout(cellTimersRef.current[target.id]);
    const token = (cellTokensRef.current[target.id] ?? 0) + 1;
    cellTokensRef.current[target.id] = token;
    cellTimersRef.current[target.id] = setTimeout(() => {
      deactivateCell(target.id, true, token);
    }, ALARM_DURATION);
  }, [deactivateCell]);

  const handleClick = useCallback((cellId: number, e: React.MouseEvent) => {
    if (gameOverRef.current) return;
    const cell = cellsRef.current.find(c => c.id === cellId);
    if (!cell || !cell.active) return;

    if (cellTimersRef.current[cellId]) {
      clearTimeout(cellTimersRef.current[cellId]);
      delete cellTimersRef.current[cellId];
    }
    delete cellTokensRef.current[cellId];

    const nextCells = cellsRef.current.map(c =>
      c.id === cellId ? { ...c, active: false, timeLeft: ALARM_DURATION } : c
    );
    cellsRef.current = nextCells;
    setCells(nextCells);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const key = ++popKeyRef.current;
    setPopScores(ps => [...ps, { id: cellId, x: rect.left + rect.width / 2, y: rect.top, key }]);
    setTimeout(() => setPopScores(ps => ps.filter(p => p.key !== key)), 700);
    setScore(s => s + 10);
  }, []);

  const retryGame = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (initialSpawnRef.current) clearTimeout(initialSpawnRef.current);
    Object.values(cellTimersRef.current).forEach(clearTimeout);
    cellTimersRef.current = {};
    cellTokensRef.current = {};
    gameOverRef.current = false;
    livesRef.current = MAX_LIVES;
    const initialCells = createInitialCells();
    cellsRef.current = initialCells;
    setCells(initialCells);
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPopScores([]);
    setRound((currentRound) => currentRound + 1);
  }, []);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [endGame, round]);

  // Spawn loop
  useEffect(() => {
    // Initial spawn
    initialSpawnRef.current = setTimeout(spawnAlarm, 300);
    spawnTimerRef.current = setInterval(spawnAlarm, SPAWN_INTERVAL);
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (initialSpawnRef.current) clearTimeout(initialSpawnRef.current);
      Object.values(cellTimersRef.current).forEach(clearTimeout);
      cellTokensRef.current = {};
    };
  }, [spawnAlarm, round]);

  const progressPct = (timeLeft / GAME_DURATION) * 100;

  return (
    <>
      <style>{`
        @keyframes alarm-pop {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes alarm-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-18deg) scale(1.1); }
          40% { transform: rotate(18deg) scale(1.1); }
          60% { transform: rotate(-12deg) scale(1.05); }
          80% { transform: rotate(12deg) scale(1.05); }
        }
        @keyframes score-fly {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-48px) scale(1.4); }
        }
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes cell-miss {
          0% { background: #fff6d6; }
          50% { background: #ffcdd2; }
          100% { background: #fff6d6; }
        }
        .alarm-cell {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #fff6d6;
          border: 2.5px solid #ffc83d;
          transition: background 0.2s, box-shadow 0.2s;
          position: relative;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          font-size: clamp(2rem, 7vw, 3.2rem);
        }
        .alarm-cell.active {
          background: #fff3b0;
          box-shadow: 0 0 0 4px #ffc83d, 0 4px 18px rgba(255,200,61,0.45);
          animation: alarm-shake 0.4s ease-in-out infinite;
        }
        .alarm-cell.active:active {
          transform: scale(0.88);
        }
        .alarm-emoji {
          display: inline-block;
          animation: alarm-pop 0.25s ease-out;
          pointer-events: none;
        }
        .alarm-timer-bar {
          position: absolute;
          bottom: 4px;
          left: 6px;
          right: 6px;
          height: 4px;
          border-radius: 2px;
          background: #ffc83d;
          transform-origin: left;
          transition: none;
        }
        .score-pop {
          position: fixed;
          pointer-events: none;
          font-size: 1.3rem;
          font-weight: 900;
          color: #e65c00;
          z-index: 9999;
          animation: score-fly 0.7s ease-out forwards;
          transform: translateX(-50%);
          text-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#fff6d6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 32px 0',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>

        {/* Header */}
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: '#ffc83d',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          padding: '18px 24px 14px',
          boxShadow: '0 4px 20px rgba(255,200,61,0.35)',
        }}>
          <h2 style={{
            margin: '0 0 12px',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#5a3200',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}>⏰ Jam Alarm Bima</h2>

          {/* Stats Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#5a3200' }}>
              Skor: <span style={{ fontSize: '1.25rem', color: '#c43b00' }}>{score}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} style={{
                  fontSize: '1.4rem',
                  opacity: i < lives ? 1 : 0.2,
                  display: 'inline-block',
                  animationName: i < lives ? 'heart-beat' : 'none',
                  animationDuration: '1.2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${i * 0.2}s`,
                }}>❤️</span>
              ))}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#5a3200' }}>
              ⏱ <span style={{ fontSize: '1.25rem', color: timeLeft <= 5 ? '#c43b00' : '#5a3200' }}>{timeLeft}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: 10,
            background: 'rgba(255,255,255,0.4)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressPct <= 20 ? '#e53935' : '#fff',
              borderRadius: 8,
              transition: 'width 1s linear, background 0.5s',
              animation: progressPct <= 20 ? 'progress-pulse 0.8s ease-in-out infinite' : 'none',
            }} />
          </div>
        </div>

        {/* Instruction */}
        <p style={{
          margin: '14px 0 10px',
          fontSize: '0.9rem',
          color: '#7a5500',
          textAlign: 'center',
          fontWeight: 600,
        }}>Ketuk alarm yang berdering sebelum waktu habis! 🔔</p>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          width: '100%',
          maxWidth: 420,
          padding: '0 16px',
        }}>
          {cells.map(cell => (
            <button
              key={cell.id}
              className={`alarm-cell${cell.active ? ' active' : ''}`}
              onClick={cell.active ? (e) => handleClick(cell.id, e) : undefined}
              aria-label={cell.active ? 'Ketuk alarm!' : 'Sel kosong'}
            >
              {cell.active && (
                <>
                  <span className="alarm-emoji">⏰</span>
                  <AlarmTimerBar duration={ALARM_DURATION} />
                </>
              )}
            </button>
          ))}
        </div>

        {/* Score pops */}
        {popScores.map(p => (
          <span
            key={p.key}
            className="score-pop"
            style={{ left: p.x, top: p.y }}
          >+10</span>
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
          }}>
            <div style={{
              background: '#fff6d6',
              borderRadius: 28,
              padding: '40px 36px',
              textAlign: 'center',
              boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
              maxWidth: 320,
              width: '90%',
              animation: 'alarm-pop 0.3s ease-out',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>
                {score >= 80 ? '🏆' : score >= 40 ? '⭐' : '😴'}
              </div>
              <h2 style={{ margin: '0 0 6px', color: '#5a3200', fontSize: '1.6rem', fontWeight: 900 }}>
                Selesai!
              </h2>
              <p style={{ margin: '0 0 20px', color: '#7a5500', fontSize: '1rem' }}>
                {lives <= 0 ? 'Kamu kehabisan nyawa!' : 'Waktu habis!'}
              </p>
              <div style={{
                background: '#ffc83d',
                borderRadius: 16,
                padding: '14px 24px',
                marginBottom: 24,
              }}>
                <div style={{ fontSize: '0.85rem', color: '#5a3200', fontWeight: 600, marginBottom: 2 }}>Skor Akhir</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#c43b00', lineHeight: 1 }}>{score}</div>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#7a5500', marginBottom: 24, fontWeight: 600 }}>
                {score >= 100 ? '🌟 Luar biasa! Kamu bisa bangun pagi!' :
                  score >= 50 ? '👍 Bagus! Terus latihan bangun pagi!' :
                    '💪 Jangan menyerah, coba lagi besok!'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={retryGame}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 14,
                    border: 'none',
                    background: '#fff',
                    color: '#5a3200',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(140,94,60,0.25)',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  🔄 Coba Lagi
                </button>
                <button
                  onClick={onComplete}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 14,
                    border: 'none',
                    background: '#ffc83d',
                    color: '#5a3200',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255,200,61,0.5)',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Lanjut →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Sub-component: countdown bar for each active alarm
function AlarmTimerBar({ duration }: { duration: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // Animate from 100% to 0% over `duration` ms
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(1)';
    // Force reflow
    void bar.offsetWidth;
    bar.style.transition = `transform ${duration}ms linear`;
    bar.style.transform = 'scaleX(0)';
  }, [duration]);

  return (
    <div
      ref={barRef}
      className="alarm-timer-bar"
    />
  );
}
