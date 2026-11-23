'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface RunnerGameProps {
  onComplete: () => void;
}

interface GameObject {
  id: number;
  type: 'obstacle' | 'ball';
  emoji: string;
  x: number; // percentage from left (0–110)
  speed: number; // px per frame
}

const GAME_WIDTH = 520;
const GAME_HEIGHT = 300;
const BIMA_LEFT = 68; // px from left
const GROUND_BOTTOM = 36; // px from bottom for ground objects
const BIMA_WIDTH = 64;
const BIMA_HEIGHT = 64;
const OBJ_SIZE = 52;

const OBSTACLE_EMOJIS = ['🛋️', '📱', '📺'];
const BALL_EMOJI = '⚽';

const TOTAL_TIME = 30;
const MAX_LIVES = 3;

export default function RunnerGame({ onComplete }: RunnerGameProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isJumping, setIsJumping] = useState(false);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [bimaBottom, setBimaBottom] = useState(GROUND_BOTTOM);
  const [hitFlash, setHitFlash] = useState(false);

  const gameStateRef = useRef<'idle' | 'playing' | 'done'>('idle');
  const objectsRef = useRef<GameObject[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const timeLeftRef = useRef(TOTAL_TIME);
  const isJumpingRef = useRef(false);
  const bimaBottomRef = useRef(GROUND_BOTTOM);
  const nextIdRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hitCooldownRef = useRef(0);
  const jumpedObstacleIdsRef = useRef<Set<number>>(new Set());

  // Sync refs with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { objectsRef.current = objects; }, [objects]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
  useEffect(() => { bimaBottomRef.current = bimaBottom; }, [bimaBottom]);

  const endGame = useCallback(() => {
    gameStateRef.current = 'done';
    setGameState('done');
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
  }, []);

  const getSpeedMultiplier = useCallback(() => {
    const elapsed = TOTAL_TIME - timeLeftRef.current;
    if (elapsed >= 20) return 1.6;
    if (elapsed >= 10) return 1.3;
    return 1.0;
  }, []);

  const spawnObject = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const isObstacle = Math.random() < 0.65;
    const mult = getSpeedMultiplier();
    const baseSpeed = isObstacle
      ? 1.8 + Math.random() * 1
      : 1.2 + Math.random() * 0.6;

    const newObj: GameObject = {
      id: nextIdRef.current++,
      type: isObstacle ? 'obstacle' : 'ball',
      emoji: isObstacle
        ? OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)]
        : BALL_EMOJI,
      x: GAME_WIDTH + 10,
      speed: baseSpeed * mult,
    };

    objectsRef.current = [...objectsRef.current, newObj];
    setObjects([...objectsRef.current]);

    // Schedule next spawn
    const delay = 1600 + Math.random() * 1600;
    spawnTimerRef.current = setTimeout(spawnObject, delay);
  }, [getSpeedMultiplier]);

  // Game loop: move objects + collision detection
  const startGameLoop = useCallback(() => {
    gameLoopRef.current = setInterval(() => {
      if (gameStateRef.current !== 'playing') return;

      const mult = getSpeedMultiplier();

      // Update object positions
      const updated = objectsRef.current
        .map((obj) => ({
          ...obj,
          x: obj.x - obj.speed * mult,
        }))
        .filter((obj) => obj.x > -60);

      // Collision detection (manual position calc)
      const bimaLeft = BIMA_LEFT;
      const bimaRight = bimaLeft + BIMA_WIDTH;
      const bimaTop = GAME_HEIGHT - bimaBottomRef.current - BIMA_HEIGHT;
      const bimaBottom_ = GAME_HEIGHT - bimaBottomRef.current;

      const surviving: GameObject[] = [];
      let scoreGain = 0;
      let hitObstacle = false;
      const now = Date.now();
      const isAirborne = isJumpingRef.current || bimaBottomRef.current > GROUND_BOTTOM + 20;

      for (const obj of updated) {
        const objLeft = obj.x;
        const objRight = obj.x + OBJ_SIZE;
        const objTop = GAME_HEIGHT - GROUND_BOTTOM - OBJ_SIZE;
        const objBottom_ = GAME_HEIGHT - GROUND_BOTTOM;
        const jumpedOver = jumpedObstacleIdsRef.current.has(obj.id);

        // Overlap check (shrink hitbox a bit for fairness)
        const hOverlap = bimaRight - 8 > objLeft + 4 && bimaLeft + 8 < objRight - 4;
        const vOverlap =
          !isAirborne &&
          !jumpedOver &&
          bimaBottom_ - 6 > objTop + 4 &&
          bimaTop + 6 < objBottom_ - 4;

        if (obj.type === 'obstacle' && isAirborne && hOverlap) {
          jumpedObstacleIdsRef.current.add(obj.id);
        }

        if (hOverlap && vOverlap) {
          if (obj.type === 'ball') {
            scoreGain += 10;
            // consumed — don't add to surviving
            continue;
          } else {
            // Remove a hit obstacle so it cannot drain multiple lives.
            if (now >= hitCooldownRef.current) {
              hitObstacle = true;
              hitCooldownRef.current = now + 700;
            }
            continue;
          }
        }
        surviving.push(obj);
      }

      objectsRef.current = surviving;
      setObjects([...surviving]);

      if (scoreGain > 0) {
        scoreRef.current += scoreGain;
        setScore(scoreRef.current);
      }

      if (hitObstacle) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 400);
        if (livesRef.current <= 0) {
          endGame();
        }
      }
    }, 30);
  }, [getSpeedMultiplier, endGame]);

  const startGame = useCallback(() => {
    // Reset state
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(TOTAL_TIME);
    setObjects([]);
    setIsJumping(false);
    setBimaBottom(GROUND_BOTTOM);
    scoreRef.current = 0;
    livesRef.current = MAX_LIVES;
    timeLeftRef.current = TOTAL_TIME;
    isJumpingRef.current = false;
    bimaBottomRef.current = GROUND_BOTTOM;
    objectsRef.current = [];
    nextIdRef.current = 0;
    hitCooldownRef.current = 0;
    jumpedObstacleIdsRef.current.clear();
    gameStateRef.current = 'playing';
    setGameState('playing');

    // Start timers
    spawnTimerRef.current = setTimeout(spawnObject, 800);
    startGameLoop();

    countdownRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        endGame();
      }
    }, 1000);
  }, [spawnObject, startGameLoop, endGame]);

  const handleJump = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    if (isJumpingRef.current) return;

    isJumpingRef.current = true;
    setIsJumping(true);

    // Animate jump using state
    const jumpHeight = 150;
    const steps = 36;
    const halfSteps = steps / 2;
    let step = 0;

    const jumpInterval = setInterval(() => {
      step++;
      if (step <= halfSteps) {
        const progress = step / halfSteps;
        const y = GROUND_BOTTOM + jumpHeight * Math.sin(progress * Math.PI / 2);
        bimaBottomRef.current = y;
        setBimaBottom(y);
      } else {
        const progress = (step - halfSteps) / halfSteps;
        const y = GROUND_BOTTOM + jumpHeight * Math.cos(progress * Math.PI / 2);
        bimaBottomRef.current = Math.max(GROUND_BOTTOM, y);
        setBimaBottom(Math.max(GROUND_BOTTOM, y));
      }

      if (step >= steps) {
        clearInterval(jumpInterval);
        bimaBottomRef.current = GROUND_BOTTOM;
        setBimaBottom(GROUND_BOTTOM);
        isJumpingRef.current = false;
        setIsJumping(false);
      }
    }, 25);

    jumpTimerRef.current = jumpInterval as unknown as ReturnType<typeof setTimeout>;
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleJump]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    };
  }, []);

  const livesDisplay = Array.from({ length: MAX_LIVES }, (_, i) =>
    i < lives ? '❤️' : '🖤'
  );

  return (
    <>
      <style>{`
        @keyframes runnerGroundScroll {
          from { background-position-x: 0; }
          to { background-position-x: -60px; }
        }
        @keyframes bimaRun {
          0%, 100% { transform: translateY(0px) scaleX(-1); }
          50% { transform: translateY(-3px) scaleX(-1); }
        }
        .runner-bima-idle {
          animation: bimaRun 0.4s ease-in-out infinite;
        }
        @keyframes hitShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .runner-hit-shake {
          animation: hitShake 0.4s ease;
        }
        @keyframes scorePopup {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-24px) scale(1.3); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          background: '#e4f7e7',
          fontFamily: 'sans-serif',
          padding: '12px',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Header */}
        {gameState !== 'idle' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: GAME_WIDTH,
              maxWidth: '100%',
              marginBottom: 8,
              padding: '6px 12px',
              background: '#5cc26a',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          >
            <span>{livesDisplay.join(' ')}</span>
            <span>⏱️ {timeLeft}s</span>
            <span>🏆 {score}</span>
          </div>
        )}

        {/* Game Arena */}
        {gameState === 'playing' && (
          <div
            ref={containerRef}
            onClick={handleJump}
            className={hitFlash ? 'runner-hit-shake' : ''}
            style={{
              position: 'relative',
              width: GAME_WIDTH,
              maxWidth: '100%',
              height: GAME_HEIGHT,
              background: 'linear-gradient(to bottom, #c8f0d0 0%, #c8f0d0 60%, #8dd49a 60%, #8dd49a 72%, #b5e8bc 72%)',
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '3px solid #5cc26a',
              boxSizing: 'border-box',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Tap to jump"
          >
            {/* Ground line decoration */}
            <div
              style={{
                position: 'absolute',
                bottom: GROUND_BOTTOM + 2,
                left: 0,
                right: 0,
                height: 2,
                background: '#5cc26a',
                opacity: 0.5,
              }}
            />

            {/* Sun decoration */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 20,
                fontSize: 28,
                opacity: 0.6,
              }}
            >
              ☀️
            </div>

            {/* Clouds */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 60,
                fontSize: 22,
                opacity: 0.5,
              }}
            >
              ☁️
            </div>
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 160,
                fontSize: 18,
                opacity: 0.4,
              }}
            >
              ☁️
            </div>

            {/* Bima */}
            <div
              className={gameState === 'playing' ? 'runner-bima-idle' : ''}
              style={{
                position: 'absolute',
                left: BIMA_LEFT,
                bottom: bimaBottom,
                fontSize: BIMA_WIDTH - 4,
                width: BIMA_WIDTH,
                height: BIMA_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'none',
                zIndex: 10,
                lineHeight: 1,
              }}
            >
              🏃
            </div>

            {/* Game Objects (obstacles + balls) */}
            {objects.map((obj) => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: obj.x,
                  bottom: GROUND_BOTTOM,
                  fontSize: OBJ_SIZE - 4,
                  width: OBJ_SIZE,
                  height: OBJ_SIZE,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  zIndex: 8,
                  lineHeight: 1,
                }}
              >
                {obj.emoji}
              </div>
            ))}

            {/* Tap hint */}
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 11,
                color: '#5cc26a',
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              Tap / Spasi untuk loncat!
            </div>
          </div>
        )}

        {/* Idle / Start Screen */}
        {gameState === 'idle' && (
          <div
            style={{
              textAlign: 'center',
              padding: 24,
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(92,194,106,0.2)',
              maxWidth: 320,
              width: '100%',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 8 }}>🏃⚽</div>
            <h2 style={{ color: '#5cc26a', margin: '0 0 8px', fontSize: 22 }}>
              Kejar Bola Bima
            </h2>
            <p style={{ color: '#555', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
              Hindari rintangan 🛋️📱📺 dan tangkap bola ⚽ untuk poin!
              <br />
              Tap layar atau tekan Spasi untuk loncat.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 20,
                fontSize: 13,
                color: '#888',
              }}
            >
              <span>❤️ 3 Nyawa</span>
              <span>⏱️ 30 Detik</span>
              <span>⚽ +10 Poin</span>
            </div>
            <button
              onClick={startGame}
              style={{
                background: '#5cc26a',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                padding: '12px 36px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(92,194,106,0.4)',
              }}
            >
              Mulai! 🏃
            </button>
          </div>
        )}

        {/* Done Screen */}
        {gameState === 'done' && (
          <div
            style={{
              textAlign: 'center',
              padding: 28,
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(92,194,106,0.2)',
              maxWidth: 320,
              width: '100%',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 8 }}>
              {score >= 60 ? '🏆' : score >= 30 ? '😄' : '😤'}
            </div>
            <h2 style={{ color: '#5cc26a', margin: '0 0 4px', fontSize: 22 }}>
              {lives <= 0 ? 'Game Over!' : 'Waktu Habis!'}
            </h2>
            <p style={{ color: '#777', fontSize: 14, margin: '0 0 16px' }}>
              {lives <= 0 ? 'Bima tersandung!' : 'Bima sudah berlari!'}
            </p>
            <div
              style={{
                background: '#e4f7e7',
                borderRadius: 12,
                padding: '12px 20px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: '#5cc26a' }}>
                {score}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>Total Poin</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={startGame}
                style={{
                  background: '#fff',
                  color: '#5cc26a',
                  border: '2px solid #5cc26a',
                  borderRadius: 24,
                  padding: '10px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ulang 🔄
              </button>
              <button
                onClick={onComplete}
                style={{
                  background: '#5cc26a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 24,
                  padding: '10px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(92,194,106,0.4)',
                }}
              >
                Lanjut ➡️
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
