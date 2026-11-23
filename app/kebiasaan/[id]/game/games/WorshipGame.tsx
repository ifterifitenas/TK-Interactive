'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';

interface WorshipGameProps {
  onComplete: () => void;
}

interface GoodDeed {
  id: number;
  emoji: string;
  title: string;
  isGood: boolean;
  done: boolean;
}

const DEEDS: Omit<GoodDeed, 'done'>[] = [
  { id: 1, emoji: '💧', title: 'Berwudu / Bersuci', isGood: true },
  { id: 2, emoji: '👕', title: 'Pakaian Bersih & Rapi', isGood: true },
  { id: 3, emoji: '🤲', title: 'Berdoa Bersyukur', isGood: true },
  { id: 4, emoji: '🪙', title: 'Bersedekah / Berbagi', isGood: true },
  { id: 5, emoji: '😊', title: 'Senyum Ramah', isGood: true },
  { id: 6, emoji: '📖', title: 'Membaca Kitab Suci', isGood: true },
  { id: 7, emoji: '😠', title: 'Marah-marah', isGood: false },
  { id: 8, emoji: '🛋️', title: 'Malas Beribadah', isGood: false },
];

export default function WorshipGame({ onComplete }: WorshipGameProps) {
  const [deeds, setDeeds] = useState<GoodDeed[]>(() =>
    DEEDS.map((d) => ({ ...d, done: false }))
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pilih semua amalan baik dan bersuci!');
  const [finished, setFinished] = useState(false);

  const totalGood = deeds.filter((d) => d.isGood).length;
  const goodDone = deeds.filter((d) => d.isGood && d.done).length;

  useEffect(() => {
    if (goodDone === totalGood && !finished) {
      setFinished(true);
      sfx.completion();
      setFeedback('🎉 MasyaAllah! Semua amalan baik terkumpul!');
    }
  }, [goodDone, totalGood, finished]);

  const tapDeed = (deed: GoodDeed) => {
    if (finished || deed.done) return;

    if (deed.isGood) {
      sfx.correct();
      setScore((s) => s + 20);
      setFeedback(`✅ Bagus sekali! ${deed.title}`);
      setDeeds((prev) =>
        prev.map((d) => (d.id === deed.id ? { ...d, done: true } : d))
      );
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 10));
      setFeedback(`❌ ${deed.title} adalah perbuatan yang harus dihindari.`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 22,
          border: '3px solid #a07850',
          boxShadow: '0 8px 24px rgba(160, 120, 80, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1f3a5f', margin: 0 }}>
            🕌 Kumpulkan Amalan Ibadah
          </h2>
          <div
            style={{
              background: '#f5edd6',
              border: '2px solid #a07850',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              color: '#704f2c',
            }}
          >
            Terkumpul: {goodDone} / {totalGood}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 800, minHeight: 24, color: '#314e74', margin: '8px 0 16px' }}>
          {feedback}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {deeds.map((deed) => (
            <button
              key={deed.id}
              onClick={() => tapDeed(deed)}
              disabled={deed.done || finished}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 18,
                border: deed.done
                  ? '3px solid #5cc26a'
                  : '3px solid #d3e3f5',
                background: deed.done
                  ? '#e8f7ea'
                  : deed.isGood
                  ? '#fffef9'
                  : '#fff8f7',
                cursor: deed.done || finished ? 'default' : 'pointer',
                opacity: deed.done ? 0.7 : 1,
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '2.4rem' }}>{deed.emoji}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#2b405a' }}>
                  {deed.title}
                </strong>
                {deed.done && (
                  <span style={{ fontSize: '0.8rem', color: '#23883a', fontWeight: 800 }}>
                    ✓ Selesai
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {finished && (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              textAlign: 'center',
              background: '#e8f7ea',
              borderRadius: 20,
              border: '3px solid #5cc26a',
            }}
          >
            <div style={{ fontSize: 44 }}>✨</div>
            <h3 style={{ color: '#23883a', margin: '4px 0 8px' }}>
              Hati Tenang & Amalan Terkumpul!
            </h3>
            <p style={{ margin: '0 0 14px', color: '#2b405a' }}>
              Skor Kebaikan: <strong>{score}</strong>
            </p>
            <button
              onClick={onComplete}
              style={{
                padding: '12px 32px',
                borderRadius: 999,
                border: 0,
                background: '#a07850',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(160, 120, 80, 0.4)',
              }}
            >
              Lanjut ke Materi Baru ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

