'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';

interface MorningRoutineGameProps {
  onComplete: () => void;
}

interface RoutineItem {
  id: number;
  emoji: string;
  name: string;
  isGood: boolean;
  collected: boolean;
}

const ROUTINE_ITEMS: Omit<RoutineItem, 'collected'>[] = [
  { id: 1, emoji: '🛏️', name: 'Rapikan Kasur', isGood: true },
  { id: 2, emoji: '🪥', name: 'Sikat Gigi', isGood: true },
  { id: 3, emoji: '🚿', name: 'Mandi Segar', isGood: true },
  { id: 4, emoji: '👕', name: 'Pakai Baju Rapi', isGood: true },
  { id: 5, emoji: '🍳', name: 'Sarapan Sehat', isGood: true },
  { id: 6, emoji: '🎒', name: 'Siapkan Tas', isGood: true },
  { id: 7, emoji: '🎮', name: 'Main Game', isGood: false },
  { id: 8, emoji: '😴', name: 'Tidur Lagi', isGood: false },
  { id: 9, emoji: '📺', name: 'Nonton TV', isGood: false },
];

export default function MorningRoutineGame({ onComplete }: MorningRoutineGameProps) {
  const [items, setItems] = useState<RoutineItem[]>(() =>
    ROUTINE_ITEMS.map((item) => ({ ...item, collected: false }))
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Ketuk semua kegiatan pagi yang baik!');
  const [finished, setFinished] = useState(false);

  const totalGood = items.filter((it) => it.isGood).length;
  const goodCollected = items.filter((it) => it.isGood && it.collected).length;

  useEffect(() => {
    if (goodCollected === totalGood && !finished) {
      setFinished(true);
      sfx.completion();
      setFeedback('🎉 Luar biasa! Semua kegiatan pagi sudah siap!');
    }
  }, [goodCollected, totalGood, finished]);

  const tapItem = (item: RoutineItem) => {
    if (finished || item.collected) return;

    if (item.isGood) {
      sfx.correct();
      setScore((s) => s + 20);
      setFeedback(`✅ Bagus! ${item.name} selesai!`);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, collected: true } : it))
      );
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 10));
      setFeedback(`❌ ${item.name} sebaiknya tidak dilakukan pagi-pagi.`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 22,
          border: '3px solid #ffc83d',
          boxShadow: '0 8px 24px rgba(255, 200, 61, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1f3a5f', margin: 0 }}>
            ☀️ Bersiap Pagi Bima
          </h2>
          <div
            style={{
              background: '#fff6d6',
              border: '2px solid #ffc83d',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              color: '#a46b00',
            }}
          >
            Selesai: {goodCollected} / {totalGood}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 800, minHeight: 24, color: '#314e74', margin: '8px 0 16px' }}>
          {feedback}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => tapItem(item)}
              disabled={item.collected || finished}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '16px 8px',
                borderRadius: 20,
                border: item.collected
                  ? '3px solid #5cc26a'
                  : '3px solid #e1ecf8',
                background: item.collected
                  ? '#e8f7ea'
                  : item.isGood
                  ? '#fafffb'
                  : '#fff8f7',
                cursor: item.collected || finished ? 'default' : 'pointer',
                opacity: item.collected ? 0.65 : 1,
                transform: item.collected ? 'scale(0.96)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '2.8rem' }}>{item.emoji}</span>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: item.collected ? '#23883a' : '#2b405a',
                  textAlign: 'center',
                }}
              >
                {item.name}
              </span>
              {item.collected && (
                <span style={{ fontSize: '0.85rem', color: '#23883a', fontWeight: 900 }}>
                  ✓ SELESAI
                </span>
              )}
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
            <div style={{ fontSize: 44 }}>🎉</div>
            <h3 style={{ color: '#23883a', margin: '4px 0 8px' }}>
              Hebat! Bima Siap Berangkat Sekolah!
            </h3>
            <p style={{ margin: '0 0 14px', color: '#2b405a' }}>
              Skor Pagi: <strong>{score}</strong>
            </p>
            <button
              onClick={onComplete}
              style={{
                padding: '12px 32px',
                borderRadius: 999,
                border: 0,
                background: '#ffc83d',
                color: '#5a3b00',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 200, 61, 0.4)',
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

