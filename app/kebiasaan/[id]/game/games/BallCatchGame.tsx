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

export default function BallCatchGame({ onComplete }: BallCatchGameProps) {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState('');
  const arenaRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const basketXRef = useRef(50);
  const scoreRef = useRef(0);
  const timeRef = useRef(GAME_TIME);
  const idRef = useRef(0);
  const finishedRef = useRef(false);

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
    sfx.completion();
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
        setFeedback('Bola merah! -10 poin');
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
    setItems([]);
    setBasketX(50);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setFeedback('');
    setFinished(false);
    setStarted(true);
  };

  return (
    <div style={{ minHeight: '100%', background: '#e4f7e7', padding: 16, fontFamily: 'sans-serif', color: '#315b3b' }}>
      <div style={{ width: 'min(100%, 760px)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#5cc26a', color: '#fff', borderRadius: 20, padding: '16px 24px', fontSize: 20, fontWeight: 800 }}>
          <span>🏆 {score}</span>
          <span>⏱️ {timeLeft}s</span>
        </div>

        {!started ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, marginTop: 16, textAlign: 'center', boxShadow: '0 4px 18px rgba(92,194,106,.2)' }}>
            <div style={{ fontSize: 64 }}>🏀🧺</div>
            <h2 style={{ color: '#5cc26a', margin: '8px 0' }}>Tangkap Bola</h2>
            <p style={{ color: '#666', lineHeight: 1.5 }}>Gerakkan keranjang untuk menangkap bola yang jatuh. Hindari bola merah!</p>
            <button onClick={() => { finishedRef.current = false; setStarted(true); }} style={{ marginTop: 12, padding: '12px 30px', border: 0, borderRadius: 24, background: '#5cc26a', color: '#fff', fontSize: 17, fontWeight: 800 }}>
              Mulai! 🏀
            </button>
          </div>
        ) : (
          <>
            <div
              ref={arenaRef}
              onPointerMove={handleArenaPointer}
              onPointerDown={handleArenaPointer}
              style={{ position: 'relative', height: ARENA_HEIGHT, marginTop: 14, overflow: 'hidden', border: '4px solid #5cc26a', borderRadius: 20, background: 'linear-gradient(#c8f0d0 0 78%, #8dd49a 78%)', touchAction: 'none' }}
            >
              <div style={{ position: 'absolute', top: 22, right: 34, fontSize: 46 }}>☀️</div>
              <div style={{ position: 'absolute', top: 32, left: 50, fontSize: 34, opacity: .55 }}>☁️</div>
              {items.map((item) => (
                <div key={item.id} style={{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', fontSize: 46 }}>
                  {item.good ? '🏀' : '🔴'}
                </div>
              ))}
              <div style={{ position: 'absolute', left: `${basketX}%`, bottom: 16, transform: 'translateX(-50%)', fontSize: 78 }}>🧺</div>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: '#398d49', fontSize: 16, fontWeight: 800 }}>
                Geser keranjang dengan mouse, sentuhan, atau tombol kiri-kanan
              </div>
            </div>
            <p style={{ minHeight: 22, textAlign: 'center', fontWeight: 800 }}>{feedback || 'Tangkap bola sebanyak-banyaknya!'}</p>
          </>
        )}

        {finished && (
          <div style={{ background: '#fff', borderRadius: 18, padding: 20, marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 44 }}>{score >= 50 ? '🏆' : '💪'}</div>
            <h2 style={{ color: '#5cc26a', margin: '6px 0' }}>Selesai!</h2>
            <p>Skor akhir: <strong>{score}</strong></p>
            <button onClick={reset} style={{ marginRight: 8, padding: '10px 18px', borderRadius: 20, border: '2px solid #5cc26a', background: '#fff', color: '#398d49', fontWeight: 800 }}>Coba Lagi</button>
            <button onClick={onComplete} style={{ padding: '10px 22px', borderRadius: 20, border: 0, background: '#5cc26a', color: '#fff', fontWeight: 800 }}>Lanjut</button>
          </div>
        )}
      </div>
    </div>
  );
}
