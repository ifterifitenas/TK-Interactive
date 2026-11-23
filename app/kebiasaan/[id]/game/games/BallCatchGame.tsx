'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/lib/sfx';

interface BallCatchGameProps {
  onComplete: () => void;
}

type FallingItem = {
  id: number;
  x: number;
  y: number;
  speed: number;
  good: boolean;
};

const GAME_TIME = 30;
const ARENA_HEIGHT = 520;
const MAX_LIVES = 3;

export default function BallCatchGame({ onComplete }: BallCatchGameProps) {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [lives, setLives] = useState(MAX_LIVES);
  const arenaRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const basketXRef = useRef(50);
  const scoreRef = useRef(0);
  const timeRef = useRef(GAME_TIME);
  const idRef = useRef(0);
  const finishedRef = useRef(false);
  const livesRef = useRef(MAX_LIVES);

  const updateBasket = useCallback((x: number) => {
    const nextX = Math.max(8, Math.min(92, x));
    basketXRef.current = nextX;
    setBasketX(nextX);
  }, []);

  const moveBasket = useCallback((delta: number) => {
    updateBasket(basketXRef.current + delta);
  }, [updateBasket]);

  const endGame = useCallback(() => {
    finishedRef.current = true;
    setFinished(true);
    if (livesRef.current <= 0) sfx.failure();
    else sfx.completion();
  }, []);

  useEffect(() => {
    if (!started || finished) return;
    const spawnTimer = setInterval(() => {
      if (finishedRef.current) return;
      const item: FallingItem = {
        id: idRef.current++,
        x: 8 + Math.random() * 84,
        y: -8,
        speed: 0.7 + Math.random() * 0.6,
        good: Math.random() > 0.2,
      };
      itemsRef.current = [...itemsRef.current, item];
      setItems(itemsRef.current);
    }, 850);
    return () => clearInterval(spawnTimer);
  }, [finished, started]);

  useEffect(() => {
    if (!started || finished) return;
    const loop = setInterval(() => {
      const nextItems: FallingItem[] = [];
      let caughtGood = 0;
      let caughtBad = 0;

      for (const item of itemsRef.current) {
        const nextY = item.y + item.speed;
        if (nextY < 86) {
          nextItems.push({ ...item, y: nextY });
          continue;
        }

        const caught = Math.abs(item.x - basketXRef.current) <= 11;
        if (caught) {
          if (item.good) caughtGood += 1;
          else caughtBad += 1;
        }
      }

      if (caughtGood) {
        scoreRef.current += caughtGood * 10;
        setScore(scoreRef.current);
        setFeedback('🎯 Mantap! +10');
      }
      if (caughtBad) {
        scoreRef.current = Math.max(0, scoreRef.current - caughtBad * 10);
        setScore(scoreRef.current);
        livesRef.current = Math.max(0, livesRef.current - caughtBad);
        setLives(livesRef.current);
        setFeedback(`❌ Bola merah! -${caughtBad} nyawa`);
        if (livesRef.current <= 0) endGame();
      }

      itemsRef.current = nextItems;
      setItems(nextItems);
    }, 30);
    return () => clearInterval(loop);
  }, [endGame, finished, started]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) endGame();
    }, 1000);
    return () => clearInterval(timer);
  }, [endGame, finished, started]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') moveBasket(-7);
      if (event.key === 'ArrowRight') moveBasket(7);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveBasket]);

  const handleArenaPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    updateBasket(((event.clientX - rect.left) / rect.width) * 100);
  };

  const reset = () => {
    itemsRef.current = [];
    basketXRef.current = 50;
    scoreRef.current = 0;
    timeRef.current = GAME_TIME;
    finishedRef.current = false;
    livesRef.current = MAX_LIVES;
    setItems([]);
    setBasketX(50);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setFeedback('');
    setLives(MAX_LIVES);
    setFinished(false);
    setStarted(true);
  };

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f7f1df 0%, #fffaf0 58%, #edf7e8 100%)', padding: 16, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#5a4630' }}>
      <div style={{ width: 'min(100%, 760px)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#a07850', color: '#fff', border: '3px solid #7a5a34', borderRadius: 18, padding: '14px 20px', fontSize: 18, fontWeight: 800, boxShadow: '0 5px 0 #7a5a34' }}>
          <span>🏆 Poin: {score}</span>
          <span>{Array.from({ length: MAX_LIVES }, (_, i) => <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️ </span>)}</span>
          <span>⏱️ {timeLeft}s</span>
        </div>

        {!started ? (
          <div style={{ background: '#fff8ec', border: '3px solid #c8a870', borderRadius: 22, padding: '28px 20px', marginTop: 16, textAlign: 'center', boxShadow: '0 6px 18px rgba(160,120,80,.22)' }}>
            <div style={{ fontSize: 64 }}>🏀<span style={{ fontSize: 54 }}>🧺</span></div>
            <h2 style={{ color: '#8c6542', margin: '8px 0', fontSize: 26 }}>Tangkap Bola</h2>
            <p style={{ color: '#7a5a34', lineHeight: 1.5 }}>Gerakkan keranjang untuk menangkap bola yang jatuh. Hindari bola merah agar nyawa tidak berkurang!</p>
            <button onClick={() => { finishedRef.current = false; livesRef.current = MAX_LIVES; setLives(MAX_LIVES); setStarted(true); }} style={{ marginTop: 12, padding: '13px 34px', border: 0, borderRadius: 14, background: '#a07850', color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(160,120,80,.35)' }}>
              Mulai Game 🏀
            </button>
          </div>
        ) : (
          <>
            <div
              ref={arenaRef}
              onPointerMove={handleArenaPointer}
              onPointerDown={handleArenaPointer}
              style={{ position: 'relative', height: ARENA_HEIGHT, marginTop: 14, overflow: 'hidden', border: '4px solid #c8a870', borderRadius: 20, background: 'linear-gradient(#e8f3cf 0 78%, #b9d48d 78%)', boxShadow: '0 5px 16px rgba(160,120,80,.28)', touchAction: 'none' }}
            >
              <div style={{ position: 'absolute', top: 22, right: 34, fontSize: 46 }}>☀️</div>
              <div style={{ position: 'absolute', top: 32, left: 50, fontSize: 34, opacity: .55 }}>☁️</div>
              {items.map((item) => (
                <div key={item.id} style={{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', fontSize: 46 }}>
                  {item.good ? '🏀' : '🔴'}
                </div>
              ))}
              <div style={{ position: 'absolute', left: `${basketX}%`, bottom: 16, transform: 'translateX(-50%)', fontSize: 78 }}>🧺</div>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: '#718c45', fontSize: 16, fontWeight: 800 }}>
                Geser keranjang dengan mouse, sentuhan, atau tombol kiri-kanan
              </div>
            </div>
            <p style={{ minHeight: 24, textAlign: 'center', color: '#7a5a34', fontWeight: 800 }}>{feedback || 'Tangkap bola sebanyak-banyaknya!'}</p>
          </>
        )}

        {finished && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(160,120,80,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#fff8ec', borderRadius: 20, padding: '36px 48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.25)', maxWidth: 360, width: 'calc(100% - 32px)', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 48 }}>{lives <= 0 ? '💔' : score >= 50 ? '🏆' : '⭐'}</div>
              <h2 style={{ color: '#a07850', margin: '12px 0 6px', fontSize: 28, fontWeight: 800 }}>Selesai!</h2>
              <p style={{ color: '#7a5a34', marginBottom: 20 }}>
                {lives <= 0 ? 'Nyawa habis!' : 'Waktu habis!'}<br />
                Skor akhir: <strong>{score}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={reset} style={{ padding: '12px 28px', borderRadius: 12, border: '2px solid #a07850', background: '#fff', color: '#7a5a34', fontWeight: 800, cursor: 'pointer' }}>Coba Lagi</button>
                <button onClick={onComplete} style={{ padding: '12px 28px', borderRadius: 12, border: 0, background: '#a07850', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(160,120,80,.4)' }}>Lanjut</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}