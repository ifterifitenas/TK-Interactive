'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface CatchGameProps {
  onComplete: () => void;
}

type FoodType = 'fruit' | 'veggie' | 'junk';

interface FoodItem {
  id: number;
  emoji: string;
  type: FoodType;
  x: number; // percentage 0-100
  startTime: number; // ms timestamp when spawned
  duration: number; // ms to fall full height
  caught: boolean;
  missed: boolean;
}

const FRUITS = ['🍎', '🍊', '🍇', '🍓'];
const VEGGIES = ['🥦', '🥕', '🌽', '🥬'];
const JUNK = ['🍬', '🍟', '🥤', '🍕'];

const BASKET_WIDTH_PCT = 18; // % of container width
const FOOD_SIZE = 36; // px
const BASKET_Y_PCT = 88; // how far down (%) the basket sit
const CATCH_TOLERANCE = 10; // % tolerance for catch zone

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickFood(): { emoji: string; type: FoodType } {
  const roll = Math.random();
  if (roll < 0.35) {
    return { emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)], type: 'fruit' };
  } else if (roll < 0.70) {
    return { emoji: VEGGIES[Math.floor(Math.random() * VEGGIES.length)], type: 'veggie' };
  } else {
    return { emoji: JUNK[Math.floor(Math.random() * JUNK.length)], type: 'junk' };
  }
}

export default function CatchGame({ onComplete }: CatchGameProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(35);
  const [gameOver, setGameOver] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);

  // Basket positions: fruitX and veggieX as % from left of container
  const [fruitBasketX, setFruitBasketX] = useState(20);
  const [veggieBasketX, setVeggieBasketX] = useState(65);

  const containerRef = useRef<HTMLDivElement>(null);
  const foodIdRef = useRef(0);
  const feedbackIdRef = useRef(0);
  const gameOverRef = useRef(false);
  const livesRef = useRef(3);
  const fruitXRef = useRef(20);
  const veggieXRef = useRef(65);
  const foodsRef = useRef<FoodItem[]>([]);
  const scoreRef = useRef(0);
  const activeDragRef = useRef<'fruit' | 'veggie' | null>(null);

  // Keep refs in sync
  useEffect(() => { fruitXRef.current = fruitBasketX; }, [fruitBasketX]);
  useEffect(() => { veggieXRef.current = veggieBasketX; }, [veggieBasketX]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const addFeedback = useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++feedbackIdRef.current;
    setFeedbacks(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 800);
  }, []);

  // Spawn foods
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (gameOverRef.current) return;
      const { emoji, type } = pickFood();
      const id = ++foodIdRef.current;
      const x = randomBetween(5, 90);
      const duration = randomBetween(2800, 4200);
      const item: FoodItem = { id, emoji, type, x, startTime: Date.now(), duration, caught: false, missed: false };
      setFoods(prev => [...prev, item]);
    }, 900);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Countdown timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          gameOverRef.current = true;
          setGameOver(true);
          sfx.completion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Collision detection loop
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (gameOverRef.current) return;
      const now = Date.now();
      const container = containerRef.current;
      if (!container) return;
      const containerH = container.offsetHeight;

      setFoods(prev => {
        let newLivesLoss = 0;
        let newScoreGain = 0;
        const updated = prev.map(food => {
          if (food.caught || food.missed) return food;
          const elapsed = now - food.startTime;
          const progress = elapsed / food.duration; // 0 → 1
          // The food's Y position (top of food) relative to container:
          // animates from -50px to 110% of containerH
          const foodY = -50 + progress * (containerH * 1.1 + 50);

          // Check if food reached basket zone
          const basketTopPct = BASKET_Y_PCT - 6;
          const basketTopPx = (basketTopPct / 100) * containerH;

          if (foodY >= basketTopPx && foodY < basketTopPx + 60) {
            const foodCenterX = food.x; // % from left
            const fX = fruitXRef.current + BASKET_WIDTH_PCT / 2;
            const vX = veggieXRef.current + BASKET_WIDTH_PCT / 2;

            const inFruitBasket = Math.abs(foodCenterX - fruitXRef.current - BASKET_WIDTH_PCT / 2) < BASKET_WIDTH_PCT / 2 + CATCH_TOLERANCE;
            const inVeggieBasket = Math.abs(foodCenterX - veggieXRef.current - BASKET_WIDTH_PCT / 2) < BASKET_WIDTH_PCT / 2 + CATCH_TOLERANCE;

            if (inFruitBasket || inVeggieBasket) {
              const basket = inFruitBasket ? 'fruit' : 'veggie';
              let caught = true;
              if (food.type === 'junk') {
                // Junk food caught = lose life
                newLivesLoss += 1;
                addFeedback('💔 -1', food.x, basketTopPct, '#e74c3c');
              } else if (food.type === 'fruit' && basket === 'fruit') {
                newScoreGain += 10;
                addFeedback('+10 ✅', food.x, basketTopPct, '#27ae60');
              } else if (food.type === 'veggie' && basket === 'veggie') {
                newScoreGain += 10;
                addFeedback('+10 ✅', food.x, basketTopPct, '#27ae60');
              } else {
                // Wrong basket
                newLivesLoss += 1;
                addFeedback('❌ -1', food.x, basketTopPct, '#e74c3c');
              }
              return { ...food, caught };
            }
          }

          // Food fell off bottom
          if (foodY > containerH + 60) {
            // Junk food reaching bottom safely (missed) = ok, no penalty
            return { ...food, missed: true };
          }

          return food;
        });

        if (newScoreGain > 0) setScore(s => s + newScoreGain);
        if (newLivesLoss > 0) {
          setLives(l => {
            const next = Math.max(0, l - newLivesLoss);
            livesRef.current = next;
            if (next <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
              sfx.failure();
            }
            return next;
          });
        }

        // Cleanup caught/missed
        return updated.filter(f => !f.missed && !(f.caught && (Date.now() - f.startTime) > f.duration + 500));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [gameOver, addFeedback]);

  // Mouse & touch handlers for baskets
  const getContainerX = (clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 50;
    const rect = container.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeDragRef.current || gameOver) return;
    const pct = getContainerX(e.clientX);
    const clamped = Math.min(Math.max(pct - BASKET_WIDTH_PCT / 2, 0), 100 - BASKET_WIDTH_PCT);
    if (activeDragRef.current === 'fruit') setFruitBasketX(clamped);
    else setVeggieBasketX(clamped);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameOver) return;
    const touch = e.touches[0];
    const pct = getContainerX(touch.clientX);
    const clamped = Math.min(Math.max(pct - BASKET_WIDTH_PCT / 2, 0), 100 - BASKET_WIDTH_PCT);
    // determine which basket is closest to touch
    const fCenter = fruitXRef.current + BASKET_WIDTH_PCT / 2;
    const vCenter = veggieXRef.current + BASKET_WIDTH_PCT / 2;
    if (Math.abs(pct - fCenter) < Math.abs(pct - vCenter)) {
      setFruitBasketX(clamped);
    } else {
      setVeggieBasketX(clamped);
    }
  };

  const hearts = Array.from({ length: 3 }, (_, i) => i < lives ? '❤️' : '🖤');

  return (
    <>
      <style>{`
        @keyframes foodFall {
          from { transform: translateY(-50px); }
          to   { transform: translateY(110vh);  }
        }
        @keyframes feedbackRise {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        @keyframes basketBounce {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.88); }
        }
        .catch-game-container {
          position: relative;
          width: 100%;
          height: min(700px, calc(100svh - 120px));
          min-height: 520px;
          background: #ffe6e6;
          overflow: hidden;
          user-select: none;
          touch-action: none;
          font-family: sans-serif;
        }
        .catch-hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #f26d6d;
          color: white;
          font-weight: bold;
          font-size: 15px;
          z-index: 10;
        }
        .catch-timer-bar-wrap {
          height: 6px;
          background: #fbb;
          position: relative;
        }
        .catch-timer-bar {
          height: 100%;
          background: #f26d6d;
          transition: width 1s linear;
        }
        .catch-food {
          position: absolute;
          font-size: 32px;
          line-height: 1;
          cursor: default;
          pointer-events: none;
          animation-name: foodFall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          top: 0;
        }
        .catch-basket {
          position: absolute;
          bottom: 4%;
          font-size: 28px;
          text-align: center;
          cursor: grab;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          line-height: 1.1;
          z-index: 5;
          transition: left 0.05s linear;
        }
        .catch-basket-label {
          font-size: 11px;
          color: #a33;
          font-weight: bold;
          background: rgba(255,255,255,0.7);
          border-radius: 4px;
          padding: 1px 4px;
        }
        .catch-feedback {
          position: absolute;
          font-size: 14px;
          font-weight: bold;
          pointer-events: none;
          animation: feedbackRise 0.8s ease-out forwards;
          z-index: 20;
          white-space: nowrap;
        }
        .catch-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 30;
          gap: 16px;
        }
        .catch-overlay-card {
          background: white;
          border-radius: 20px;
          padding: 32px 40px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        .catch-overlay-card h2 {
          font-size: 28px;
          color: #f26d6d;
          margin: 0 0 8px;
        }
        .catch-overlay-card p {
          font-size: 18px;
          color: #333;
          margin: 4px 0;
        }
        .catch-btn {
          margin-top: 20px;
          background: #f26d6d;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 32px;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(242,109,109,0.4);
        }
        .catch-btn:active { transform: scale(0.96); }
        .catch-game-area {
          position: relative;
          width: 100%;
          flex: 1;
        }
        .catch-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .catch-instructions {
          text-align: center;
          font-size: 11px;
          color: #a33;
          padding: 2px 8px;
          background: #ffd5d5;
        }
      `}</style>

      <div
        className="catch-game-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={() => { activeDragRef.current = null; }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { activeDragRef.current = null; }}
      >
        <div className="catch-wrapper">
          {/* HUD */}
          <div className="catch-hud">
            <span>⏱ {timeLeft}s</span>
            <span>⭐ {score}</span>
            <span>{hearts.join(' ')}</span>
          </div>
          <div className="catch-timer-bar-wrap">
            <div className="catch-timer-bar" style={{ width: `${(timeLeft / 35) * 100}%` }} />
          </div>
          <div className="catch-instructions">
            Geser keranjang untuk tangkap 🍎Buah &amp; 🥦Sayur · Hindari junk food!
          </div>

          {/* Game area */}
          <div className="catch-game-area">
            {/* Falling foods */}
            {foods.map(food => !food.caught && !food.missed && (
              <span
                key={food.id}
                className="catch-food"
                style={{
                  left: `${food.x}%`,
                  animationDuration: `${food.duration}ms`,
                  animationDelay: '0ms',
                }}
              >
                {food.emoji}
              </span>
            ))}

            {/* Feedback labels */}
            {feedbacks.map(fb => (
              <span
                key={fb.id}
                className="catch-feedback"
                style={{ left: `${fb.x}%`, top: `${fb.y}%`, color: fb.color }}
              >
                {fb.text}
              </span>
            ))}

            {/* Fruit basket */}
            <div
              className="catch-basket"
              style={{ left: `${fruitBasketX}%`, width: `${BASKET_WIDTH_PCT}%` }}
              onMouseDown={() => { activeDragRef.current = 'fruit'; }}
              onTouchStart={() => { activeDragRef.current = 'fruit'; }}
            >
              <span style={{ fontSize: 32 }}>🧺</span>
              <span className="catch-basket-label">🍎 Buah</span>
            </div>

            {/* Veggie basket */}
            <div
              className="catch-basket"
              style={{ left: `${veggieBasketX}%`, width: `${BASKET_WIDTH_PCT}%` }}
              onMouseDown={() => { activeDragRef.current = 'veggie'; }}
              onTouchStart={() => { activeDragRef.current = 'veggie'; }}
            >
              <span style={{ fontSize: 32 }}>🧺</span>
              <span className="catch-basket-label">🥦 Sayur</span>
            </div>

            {/* Game over overlay */}
            {gameOver && (
              <div className="catch-overlay">
                <div className="catch-overlay-card">
                  <h2>🎉 Selesai!</h2>
                  <p>Skor Akhir: <strong>{score}</strong></p>
                  <p>Sisa Nyawa: {hearts.join(' ')}</p>
                  <button className="catch-btn" onClick={onComplete}>Lanjut →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
