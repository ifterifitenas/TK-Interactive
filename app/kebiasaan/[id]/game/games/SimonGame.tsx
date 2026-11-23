'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface SimonGameProps {
  onComplete: () => void;
}

const BUTTONS = [
  { color: '#78a5dc', activeColor: '#a9cdf5', shadow: '#5579b8' },
  { color: '#d5ad7b', activeColor: '#efd09f', shadow: '#a07850' },
  { color: '#d77f96', activeColor: '#f1adc0', shadow: '#b45d75' },
  { color: '#70ae86', activeColor: '#a8d2b6', shadow: '#4c8b63' },
];

const BASE_SEQ_LEN = 1;

type GamePhase = 'idle' | 'showing' | 'waiting' | 'success' | 'fail' | 'done';

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export default function SimonGame({ onComplete }: SimonGameProps) {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Show sequence animation
  const showSequence = useCallback((seq: number[]) => {
    setPhase('showing');
    setActiveBtn(null);
    setPlayerIdx(0);

    let t = 400;
    const levelSpeed = Math.max(300, 700 - (level - 1) * 35);
    seq.forEach((btnIdx, i) => {
      // highlight on
      addTimeout(() => {
        setActiveBtn(btnIdx);
        sfx.button(btnIdx);
      }, t);
      t += levelSpeed;
      // highlight off
      addTimeout(() => setActiveBtn(null), t);
      t += 200;
    });

    // After showing, switch to waiting
    addTimeout(() => {
      setPhase('waiting');
    }, t + 100);
  }, [addTimeout, level]);

  // Generate new sequence for a level
  const startLevel = useCallback((lvl: number, existingSeq?: number[]) => {
    clearAllTimeouts();
    const seqLen = BASE_SEQ_LEN + (lvl - 1);
    let seq: number[];
    if (existingSeq) {
      seq = existingSeq;
    } else {
      seq = Array.from({ length: seqLen }, () => randomInt(BUTTONS.length));
    }
    setSequence(seq);
    setPlayerIdx(0);
    showSequence(seq);
  }, [clearAllTimeouts, showSequence]);

  // Start game
  const handleStart = useCallback(() => {
    setLevel(1);
    setLives(3);
    setScore(0);
    setFlashMsg(null);
    const seq = Array.from({ length: BASE_SEQ_LEN }, () => randomInt(BUTTONS.length));
    setSequence(seq);
    setPlayerIdx(0);
    showSequence(seq);
  }, [showSequence]);

  // Player taps a button
  const handleBtnClick = useCallback((idx: number) => {
    if (phase !== 'waiting') return;

    // Brief visual feedback
    sfx.button(idx);
    setActiveBtn(idx);
    addTimeout(() => setActiveBtn(null), 300);

    const expected = sequence[playerIdx];
    const newPlayerIdx = playerIdx + 1;

    if (idx !== expected) {
      // Wrong!
      clearAllTimeouts();
      const newLives = lives - 1;
      setLives(newLives);
      setPhase('fail');
      setFlashMsg('Ups! Coba Lagi!');

      if (newLives <= 0) {
        addTimeout(() => {
          setFlashMsg(null);
          setPhase('done');
        }, 1500);
      } else {
        addTimeout(() => {
          setFlashMsg(null);
          startLevel(level, sequence);
        }, 1500);
      }
      return;
    }

    // Correct tap
    if (newPlayerIdx >= sequence.length) {
      // Completed the sequence
      clearAllTimeouts();
      const gained = level * 20;
      setScore(s => s + gained);
      setPhase('success');
      setFlashMsg(`Hebat! +${gained} poin`);

      const nextLevel = level + 1;
      addTimeout(() => {
        setFlashMsg(null);
        setLevel(nextLevel);
        startLevel(nextLevel);
      }, 1500);
    } else {
      setPlayerIdx(newPlayerIdx);
    }
  }, [phase, sequence, playerIdx, lives, level, clearAllTimeouts, addTimeout, startLevel]);

  // Cleanup on unmount
  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  useEffect(() => {
    if (phase === 'done') {
      if (lives <= 0) sfx.failure();
      else sfx.completion();
    }
  }, [phase, lives]);

  const heartsDisplay = Array.from({ length: 3 }, (_, i) => (
    <span key={i} style={{ opacity: i < lives ? 1 : 0.2, fontSize: '1.3rem' }}>❤️</span>
  ));

  if (phase === 'done') {
    return (
      <>
        <style>{`
          @keyframes sg-pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .sg-done-card {
            animation: sg-pop 0.5s ease forwards;
          }
        `}</style>
        <div style={{
          minHeight: '100vh',
          background: 'rgba(160,120,80,.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}>
          <div className="sg-done-card" style={{
            background: '#fff8ec',
            borderRadius: '24px',
            padding: '40px 32px',
            textAlign: 'center',
            border: '3px solid #c8a870',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            maxWidth: '340px',
            width: '90%',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ color: '#a07850', fontSize: '1.6rem', margin: '0 0 8px' }}>Selesai!</h2>
            <p style={{ color: '#7a5a34', marginBottom: '20px' }}>Kamu sudah mahir bermasyarakat!</p>
            <div style={{
              background: '#fce9b0',
              borderRadius: '16px',
              padding: '16px 24px',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '0.9rem', color: '#7a5a34', marginBottom: '4px' }}>Skor Akhir</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a07850' }}>{score}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleStart}
                style={{
                  background: '#fff',
                  color: '#7a5a34',
                  border: '2px solid #a07850',
                  borderRadius: '14px',
                  padding: '14px 48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Coba Lagi
              </button>
              <button
                onClick={onComplete}
                style={{
                  background: '#a07850',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(160,120,80,0.35)',
                }}
              >
                Lanjut →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes sg-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes sg-bounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes sg-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes sg-fadein {
          from { opacity: 0; transform: translateY(-10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sg-btn {
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .sg-btn:active {
          transform: scale(0.95) !important;
        }
        .sg-btn-active {
          transform: scale(1.08) !important;
        }
        .sg-flash-msg {
          animation: sg-fadein 0.3s ease forwards;
        }
        .sg-shake {
          animation: sg-shake 0.5s ease;
        }
        .sg-bounce {
          animation: sg-bounce 0.6s ease;
        }
        .sg-level-light {
          width: 42px;
          height: 14px;
          border-radius: 99px;
          transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f7f1df 0%, #fffaf0 58%, #edf7e8 100%)',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Header */}
        <div style={{
          width: '100%',
          maxWidth: '760px',
          background: '#a07850',
          border: '3px solid #7a5a34',
          borderRadius: '18px',
          padding: '16px 24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 5px 0 #7a5a34',
          boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Level</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{phase === 'idle' ? '-' : level}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Nyawa</div>
            <div style={{ display: 'flex', gap: '2px' }}>{heartsDisplay}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Poin</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{score}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: '24px', marginBottom: '8px', textAlign: 'center', padding: '0 16px' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#7a5a34', margin: 0, fontWeight: 'bold' }}>
            Ingat Urutan Warna
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>
            {phase === 'idle' && 'Tekan Mulai untuk bermain!'}
            {phase === 'showing' && 'Perhatikan urutannya...'}
            {phase === 'waiting' && '👆 Sekarang giliranmu!'}
            {phase === 'success' && ''}
            {phase === 'fail' && ''}
          </p>
        </div>

        {/* Flash Message */}
        <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {flashMsg && (
            <div
              className={`sg-flash-msg ${phase === 'fail' ? 'sg-shake' : 'sg-bounce'}`}
              style={{
                background: phase === 'fail' ? '#ff5252' : '#66bb6a',
                color: '#fff',
                borderRadius: '20px',
                padding: '6px 20px',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {flashMsg}
            </div>
          )}
        </div>

        {/* Level lights */}
        {phase !== 'idle' && (
          <div style={{ width: 'min(100%, 620px)', marginBottom: '18px', background: 'rgba(255,255,255,.82)', borderRadius: '18px', padding: '12px 18px', boxShadow: '0 4px 12px rgba(124,110,208,.16)', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', color: '#6559bd', fontWeight: 800, marginBottom: '9px' }}>
              Level {level} · Urutan {sequence.length} langkah
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {sequence.map((_, i) => {
                const lit = i < playerIdx;
                return (
                  <div
                    key={i}
                    className="sg-level-light"
                    aria-label={`Level ${i + 1}${lit ? ' aktif' : ''}`}
                    style={{
                      background: lit ? '#f6c343' : '#d9d4f7',
                      boxShadow: lit ? '0 0 12px rgba(246,195,67,.9), 0 3px 0 #b9821e' : 'inset 0 2px 4px rgba(0,0,0,.1)',
                      transform: lit ? 'scaleY(1.15)' : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 180px)',
          gap: '22px',
          padding: '0 16px',
          maxWidth: '420px',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '32px',
          justifyContent: 'center',
        }}>
          {BUTTONS.map((btn, idx) => {
            const isActive = activeBtn === idx;
            return (
              <button
                key={idx}
                className={`sg-btn${isActive ? ' sg-btn-active' : ''}`}
                onClick={() => handleBtnClick(idx)}
                disabled={phase !== 'waiting'}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  border: '8px solid rgba(255,255,255,.92)',
                  background: isActive ? btn.activeColor : btn.color,
                  boxShadow: isActive
                    ? `0 0 0 5px ${btn.shadow}, 0 0 28px ${btn.activeColor}, 0 8px 0 ${btn.shadow}`
                    : `0 8px 0 ${btn.shadow}, 0 12px 20px rgba(160,120,80,.28), inset 0 10px 18px rgba(255,255,255,.28)`,
                  borderColor: isActive ? btn.activeColor : btn.color,
                  cursor: phase === 'waiting' ? 'pointer' : 'default',
                  transition: 'background 0.15s, box-shadow 0.15s, opacity 0.15s, transform 0.15s',
                  padding: 0,
                }}
              >
              </button>
            );
          })}
        </div>

        {/* Start / showing indicator */}
        {phase === 'idle' && (
          <button
            onClick={handleStart}
            style={{
              background: '#a07850',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 48px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(160,120,80,0.35)',
            }}
          >
            Mulai
          </button>
        )}

        {phase === 'showing' && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '10px 24px',
            color: '#9b8cf0',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(155,140,240,0.2)',
            animation: 'sg-flash 1s ease infinite',
          }}>
            Perhatikan!
          </div>
        )}
      </div>
    </>
  );
}