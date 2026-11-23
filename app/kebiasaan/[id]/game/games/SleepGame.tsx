'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface SleepGameProps {
  onComplete: () => void;
}

interface Item {
  id: number;
  emoji: string;
  label: string;
  isGood: boolean;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const ALL_ITEMS: Omit<Item, 'id'>[] = [
  { emoji: '🪥', label: 'Sikat Gigi', isGood: true },
  { emoji: '📿', label: 'Buku Doa', isGood: true },
  { emoji: '🛏️', label: 'Bantal', isGood: true },
  { emoji: '🧸', label: 'Boneka', isGood: true },
  { emoji: '💧', label: 'Air Minum', isGood: true },
  { emoji: '📱', label: 'HP', isGood: false },
  { emoji: '🎮', label: 'Game Controller', isGood: false },
  { emoji: '📺', label: 'TV', isGood: false },
  { emoji: '☕', label: 'Kopi', isGood: false },
];

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    size: (i % 3) * 0.75 + 1,
    delay: (i % 6) * 0.5,
    duration: (i % 5) * 0.4 + 1.5,
  }));
}

export default function SleepGame({ onComplete }: SleepGameProps) {
  const [items] = useState<Item[]>(() =>
    ALL_ITEMS.map((item, i) => ({ ...item, id: i }))
  );
  const [stars] = useState<Star[]>(() => generateStars(60));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isDone, setIsDone] = useState(false);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [animateItem, setAnimateItem] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentItem = currentIndex < items.length ? items[currentIndex] : null;

  useEffect(() => {
    if (isDone) sfx.completion();
  }, [isDone]);

  const showFeedback = useCallback((text: string, color: string) => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setFeedback({ text, color });
    feedbackTimeout.current = setTimeout(() => setFeedback(null), 1200);
  }, []);

  const handleResult = useCallback(
    (droppedRight: boolean) => {
      if (!currentItem) return;
      let newLives = lives;
      let newScore = score;
      const isCorrect = currentItem.isGood === droppedRight;

      if (isCorrect) {
        newScore += 10;
        showFeedback('+10 ✅ Benar!', '#4ade80');
      } else {
        newLives -= 1;
        showFeedback('-1 ❤️ Salah tempat!', '#f87171');
      }

      setScore(newScore);
      setLives(newLives);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= items.length || newLives <= 0) {
        setTimeout(() => setIsDone(true), 800);
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentItem, lives, score, currentIndex, items.length, showFeedback]
  );

  const getClientXY = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  const onDragStart = (clientX: number, clientY: number) => {
    setDragging(true);
    setDragPos({ x: clientX, y: clientY });
    setStartPos({ x: clientX, y: clientY });
    setAnimateItem(false);
  };

  const onDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const { x, y } = getClientXY(e);
      setDragPos({ x, y });
    },
    [dragging]
  );

  const onDragEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      setDragging(false);

      let clientX: number;
      if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }

      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const containerWidth = rect?.width ?? window.innerWidth;
      const localX = rect ? clientX - rect.left : clientX;
      const midpoint = containerWidth / 2;
      const droppedRight = localX > midpoint + 40;
      const droppedLeft = localX < midpoint - 40;

      if (droppedRight) {
        handleResult(true);
      } else if (droppedLeft) {
        handleResult(false);
      } else {
        // Snapped back — no action
        setAnimateItem(true);
        setTimeout(() => setAnimateItem(false), 400);
      }
    },
    [dragging, handleResult]
  );

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [dragging, onDragMove, onDragEnd]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const resetGame = () => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setIsDone(false);
    setDragging(false);
    setFeedback(null);
    setAnimateItem(false);
  };

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateX(-60px) scale(0.7); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes snap-back {
          0% { transform: scale(1); }
          40% { transform: scale(0.9) rotate(-5deg); }
          70% { transform: scale(1.05) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes room-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,107,201,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(63,107,201,0); }
        }
        @keyframes feedback-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.8); }
          30% { opacity: 1; transform: translateY(-8px) scale(1.1); }
          80% { opacity: 1; transform: translateY(-12px) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.9); }
        }
        @keyframes moon-glow {
          0%, 100% { text-shadow: 0 0 10px #fffde7, 0 0 20px #fff9c4; }
          50% { text-shadow: 0 0 20px #fffde7, 0 0 40px #fff59d, 0 0 60px #fff176; }
        }
        @keyframes done-appear {
          from { opacity: 0; transform: scale(0.7) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .sleep-game-container {
          position: relative;
          width: 100%;
          min-height: 680px;
          background: radial-gradient(circle at 50% 12%, #263f86 0%, #111f4c 42%, #080f2b 100%);
          overflow: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          user-select: none;
          -webkit-user-select: none;
        }
        .sleep-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .sleep-star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--dur) var(--delay) infinite ease-in-out;
        }
        .sleep-header {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 26px 12px;
          box-sizing: border-box;
        }
        .sleep-score {
          font-size: 1.25rem;
          font-weight: 700;
          color: #93c5fd;
          background: rgba(63,107,201,0.25);
          border-radius: 20px;
          padding: 7px 16px;
          border: 2px solid rgba(147,197,253,.45);
        }
        .sleep-lives {
          display: flex;
          gap: 4px;
          font-size: 1.3rem;
        }
        .sleep-progress {
          font-size: 1.05rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .sleep-moon {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 3.2rem;
          animation: moon-glow 3s infinite ease-in-out;
          z-index: 5;
          pointer-events: none;
        }
        .sleep-arena {
          position: relative;
          z-index: 10;
          flex: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 0 20px;
        }
        .sleep-zone-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 30%;
          margin: 20px 0;
          border: 2px dashed rgba(148,163,184,.35);
          border-radius: 22px;
          background: rgba(15,23,42,.28);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }
        .sleep-zone-left-label {
          font-size: 0.8rem;
          color: #94a3b8;
          text-align: center;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .sleep-trash {
          font-size: 3.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        .sleep-room {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 150px;
          min-height: 170px;
          background: linear-gradient(145deg, #294caa, #172d78);
          border: 4px solid #60a5fa;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          animation: room-pulse 2.5s infinite;
          pointer-events: none;
        }
        .sleep-room-emoji {
          font-size: 3.5rem;
        }
        .sleep-room-label {
          font-size: 0.72rem;
          color: #93c5fd;
          font-weight: 700;
          text-align: center;
          line-height: 1.2;
        }
        .sleep-item-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: grab;
        }
        .sleep-item-wrapper:active {
          cursor: grabbing;
        }
        .sleep-item-static {
          animation: float-in 0.4s ease-out;
        }
        .sleep-item-snapback {
          animation: snap-back 0.4s ease-out;
        }
        .sleep-item-hint {
          display: flex;
          gap: 20px;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }
        .sleep-drag-ghost {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
        }
        .sleep-item-emoji {
          font-size: 4.5rem;
          line-height: 1;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
        }
        .sleep-item-label {
          font-size: 0.82rem;
          color: #e2e8f0;
          font-weight: 600;
          background: rgba(13,27,64,0.75);
          border-radius: 8px;
          padding: 2px 8px;
        }
        .sleep-feedback {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.3rem;
          font-weight: 800;
          pointer-events: none;
          z-index: 20;
          white-space: nowrap;
          animation: feedback-pop 1.2s ease-out forwards;
        }
        .sleep-drag-hint {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 18px 20px 26px;
          width: min(100% - 32px, 620px);
          border-radius: 18px;
          background: rgba(255,255,255,.08);
          display: flex;
          gap: 24px;
          align-items: center;
          justify-content: center;
        }
        .sleep-hint-left {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .sleep-hint-right {
          font-size: 0.8rem;
          color: #3b82f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .sleep-done-overlay {
          position: absolute;
          inset: 0;
          background: rgba(13,27,64,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          border-radius: 16px;
        }
        .sleep-done-card {
          background: linear-gradient(145deg, #1e3a8a, #1e40af);
          border: 2px solid #3f6bc9;
          border-radius: 20px;
          padding: 32px 36px;
          text-align: center;
          animation: done-appear 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
          max-width: 320px;
          width: 90%;
        }
        .sleep-done-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }
        .sleep-done-score {
          font-size: 3rem;
          font-weight: 900;
          color: #60a5fa;
          margin: 8px 0;
        }
        .sleep-done-msg {
          font-size: 1rem;
          color: #93c5fd;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .sleep-done-btn {
          background: linear-gradient(135deg, #3f6bc9, #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 32px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 0 4px 15px rgba(63,107,201,0.5);
        }
        .sleep-done-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(63,107,201,0.7);
        }
        .sleep-done-btn:active {
          transform: translateY(0);
        }
        .sleep-retry-btn {
          margin-right: 8px;
          background: transparent;
          color: #bfdbfe;
          border: 2px solid #60a5fa;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
        }
        .sleep-divider {
          width: 2px;
          height: 40px;
          background: rgba(100,116,139,0.3);
          border-radius: 2px;
        }
      `}</style>

      <div className="sleep-game-container" ref={containerRef}>
        {/* Stars */}
        <div className="sleep-stars">
          {stars.map((star) => (
            <span
              key={star.id}
              className="sleep-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                '--delay': `${star.delay}s`,
                '--dur': `${star.duration}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Moon */}
        <div className="sleep-moon">🌙</div>

        {/* Header */}
        <div className="sleep-header">
          <div className="sleep-score">⭐ {score}</div>
          <div className="sleep-lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                ❤️
              </span>
            ))}
          </div>
          <div className="sleep-progress">
            {currentIndex + 1 > items.length ? items.length : currentIndex + 1}/{items.length}
          </div>
        </div>

        {/* Arena */}
        <div className="sleep-arena">
          {/* Left zone: trash/discard */}
          <div className="sleep-zone-left">
            <div className="sleep-trash">🗑️</div>
            <div className="sleep-zone-left-label">Buang</div>
          </div>

          {/* Center item */}
          {currentItem && !isDone && (
            <div
              className={`sleep-item-wrapper ${animateItem ? 'sleep-item-snapback' : 'sleep-item-static'}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onDragStart(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                onDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }}
              style={{
                opacity: dragging ? 0.3 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <span className="sleep-item-emoji">{currentItem.emoji}</span>
              <span className="sleep-item-label">{currentItem.label}</span>
            </div>
          )}

          {/* Room (right) */}
          <div className="sleep-room">
            <div className="sleep-room-emoji">🛏️</div>
            <div className="sleep-room-label">Kamar<br />Bima</div>
          </div>

          {/* Feedback pop */}
          {feedback && (
            <div className="sleep-feedback" style={{ color: feedback.color }}>
              {feedback.text}
            </div>
          )}
        </div>

        {/* Bottom hint */}
        {!isDone && (
          <div className="sleep-drag-hint">
            <div className="sleep-hint-left">
              <span>👈 Seret kiri</span>
              <span style={{ color: '#94a3b8' }}>Buang</span>
            </div>
            <div className="sleep-divider" />
            <div className="sleep-hint-right">
              <span>Seret kanan 👉</span>
              <span>Masukkan ke kamar</span>
            </div>
          </div>
        )}

        {/* Drag ghost */}
        {dragging && currentItem && (
          <div
            className="sleep-drag-ghost"
            style={{ left: dragPos.x, top: dragPos.y }}
          >
            <span className="sleep-item-emoji">{currentItem.emoji}</span>
            <span className="sleep-item-label">{currentItem.label}</span>
          </div>
        )}

        {/* Done overlay */}
        {isDone && (
          <div className="sleep-done-overlay">
            <div className="sleep-done-card">
              <div className="sleep-done-title">🌙 Selesai!</div>
              <div className="sleep-done-score">{score}</div>
              <div className="sleep-done-msg">
                {score >= 60
                  ? '🌟 Luar biasa! Bima siap tidur nyenyak!'
                  : score >= 30
                  ? '😊 Lumayan! Bima sudah cukup siap tidur.'
                  : '😴 Bima perlu belajar lagi untuk tidur lebih baik!'}
              </div>
              <button className="sleep-retry-btn" onClick={resetGame}>
                Coba Lagi
              </button>
              <button className="sleep-done-btn" onClick={onComplete}>
                Lanjut →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
