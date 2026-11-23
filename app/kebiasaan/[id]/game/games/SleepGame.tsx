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

function shuffleItems(items: Omit<Item, 'id'>[]): Omit<Item, 'id'>[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SleepGame({ onComplete }: SleepGameProps) {
  const [items, setItems] = useState<Item[]>(() =>
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
  const [dropFeedback, setDropFeedback] = useState<{ type: 'correct' | 'wrong'; side: 'left' | 'right' } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentItem = currentIndex < items.length ? items[currentIndex] : null;

  useEffect(() => {
    setItems(shuffleItems(ALL_ITEMS).map((item, i) => ({ ...item, id: i })));
  }, []);

  useEffect(() => {
    if (!isDone) return;
    if (lives <= 0) sfx.failure();
    else sfx.completion();
  }, [isDone, lives]);

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
        sfx.correct();
        setDropFeedback({ type: 'correct', side: droppedRight ? 'right' : 'left' });
      } else {
        newLives -= 1;
        showFeedback('-1 ❤️ Salah tempat!', '#f87171');
        sfx.wrong();
        setDropFeedback({ type: 'wrong', side: droppedRight ? 'right' : 'left' });
        setAnimateItem(true);
        setTimeout(() => setAnimateItem(false), 400);
        setScore(score);
        setLives(newLives);
        if (newLives <= 0) setTimeout(() => setIsDone(true), 800);
        setTimeout(() => setDropFeedback(null), 800);
        return;
      }

      setScore(newScore);
      setLives(newLives);
      setTimeout(() => setDropFeedback(null), 800);

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
        sfx.wrong();
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
    setItems(shuffleItems(ALL_ITEMS).map((item, i) => ({ ...item, id: i })));
    setCurrentIndex(0);
    setScore(0);
    setLives(3);
    setIsDone(false);
    setDragging(false);
    setFeedback(null);
    setAnimateItem(false);
    setDropFeedback(null);
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
          min-height: 820px;
          background: linear-gradient(90deg, #edf8eb 0 32%, #fff7da 32% 68%, #fde9ef 68% 100%);
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
          color: #2f7d32;
          background: rgba(255,255,255,.9);
          border-radius: 20px;
          padding: 7px 16px;
          border: 2px solid #4caf50;
        }
        .sleep-lives {
          display: flex;
          gap: 4px;
          font-size: 1.3rem;
        }
        .sleep-progress {
          font-size: 1.05rem;
          color: #64748b;
          font-weight: 600;
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
        .sleep-zone-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 0;
          border-left: 4px dashed rgba(160,120,80,.65);
          z-index: 12;
          pointer-events: none;
        }
        .sleep-zone-divider-left {
          left: 32%;
        }
        .sleep-zone-divider-right {
          left: 68%;
        }
        .sleep-zone-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 32%;
          margin: 0;
          border: 0;
          border-radius: 22px;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }
        .sleep-zone-left.drop-correct {
          background: rgba(74,222,128,.50);
          box-shadow: inset 0 0 100px rgba(74,222,128,.35);
        }
        .sleep-zone-left.drop-wrong {
          background: rgba(248,113,113,.50);
          box-shadow: inset 0 0 100px rgba(248,113,113,.35);
        }
        .sleep-zone-left-label {
          font-size: 0.8rem;
          color: #2f7d32;
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
          right: 0;
          top: 0;
          bottom: 0;
          width: 32%;
          min-height: 0;
          background: transparent;
          border: 0;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          pointer-events: none;
        }
        .sleep-room.drop-correct {
          background: rgba(74,222,128,.50);
          box-shadow: inset 0 0 100px rgba(74,222,128,.35);
          border-radius: 0;
        }
        .sleep-room.drop-wrong {
          background: rgba(248,113,113,.50);
          box-shadow: inset 0 0 100px rgba(248,113,113,.35);
          border-radius: 0;
        }
        .sleep-room-emoji {
          font-size: 3.5rem;
        }
        .sleep-room-label {
          font-size: 0.72rem;
          color: #c2185b;
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
          top: 18px;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1rem;
          font-weight: 800;
          pointer-events: none;
          z-index: 20;
          white-space: nowrap;
          background: rgba(255,255,255,.95);
          border: 2px solid currentColor;
          border-radius: 999px;
          padding: 8px 16px;
          box-shadow: 0 4px 12px rgba(160,120,80,.18);
        }
        .sleep-drag-hint {
          display: none;
        }
        .sleep-done-overlay {
          position: fixed;
          inset: 0;
          background: rgba(160,120,80,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(3px);
        }
        .sleep-done-card {
          background: #fff8ec;
          border: 3px solid #c8a870;
          border-radius: 20px;
          padding: 36px 32px;
          text-align: center;
          animation: done-appear 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
          max-width: 360px;
          width: calc(100% - 32px);
          box-sizing: border-box;
          box-shadow: 0 8px 32px rgba(0,0,0,.25);
        }
        .sleep-done-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #a07850;
          margin-bottom: 8px;
        }
        .sleep-done-score {
          font-size: 3rem;
          font-weight: 900;
          color: #a07850;
          margin: 12px 0;
          background: #fce9b0;
          border-radius: 14px;
          padding: 14px;
        }
        .sleep-done-msg {
          font-size: 1rem;
          color: #7a5a34;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .sleep-done-btn {
          width: 100%;
          background: #a07850;
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
          width: 100%;
          margin: 0 0 10px;
          background: #fff;
          color: #7a5a34;
          border: 2px solid #a07850;
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
          <div className="sleep-zone-divider sleep-zone-divider-left" />
          <div className="sleep-zone-divider sleep-zone-divider-right" />
          {/* Left zone: trash/discard */}
          <div className={`sleep-zone-left${dropFeedback?.side === "left" ? ` drop-${dropFeedback.type}` : ""}`}>
            <div className="sleep-trash">📱</div>
            <div className="sleep-zone-left-label">Ganggu Tidur</div>
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
          <div className={`sleep-room${dropFeedback?.side === "right" ? ` drop-${dropFeedback.type}` : ""}`}>
            <div className="sleep-room-emoji">🌙</div>
            <div className="sleep-room-label">Siap<br />Tidur</div>
          </div>

          {/* Feedback pop */}
          {feedback && (
            <div className="sleep-feedback" style={{ color: feedback.color }}>
              {feedback.text}
            </div>
          )}
        </div>


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