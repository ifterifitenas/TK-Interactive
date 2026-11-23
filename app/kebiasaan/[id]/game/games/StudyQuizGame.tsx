'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';

interface StudyQuizGameProps {
  onComplete: () => void;
}

interface SchoolItem {
  id: number;
  emoji: string;
  name: string;
  isSchool: boolean;
  collected: boolean;
}

const SCHOOL_ITEMS: Omit<SchoolItem, 'collected'>[] = [
  { id: 1, emoji: '📚', name: 'Buku Pelajaran', isSchool: true },
  { id: 2, emoji: '✏️', name: 'Pensil Tulis', isSchool: true },
  { id: 3, emoji: '📏', name: 'Penggaris', isSchool: true },
  { id: 4, emoji: '🎒', name: 'Tas Sekolah', isSchool: true },
  { id: 5, emoji: '🖍️', name: 'Krayon Warna', isSchool: true },
  { id: 6, emoji: '✂️', name: 'Gunting Kertas', isSchool: true },
  { id: 7, emoji: '🍬', name: 'Permen Manis', isSchool: false },
  { id: 8, emoji: '⚽', name: 'Bola Sepak', isSchool: false },
  { id: 9, emoji: '🧸', name: 'Boneka Beruang', isSchool: false },
];

export default function StudyQuizGame({ onComplete }: StudyQuizGameProps) {
  const [items, setItems] = useState<SchoolItem[]>(() =>
    SCHOOL_ITEMS.map((item) => ({ ...item, collected: false }))
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pilih semua perlengkapan belajar untuk ke sekolah!');
  const [finished, setFinished] = useState(false);

  const totalSchool = items.filter((it) => it.isSchool).length;
  const collectedCount = items.filter((it) => it.isSchool && it.collected).length;

  useEffect(() => {
    if (collectedCount === totalSchool && !finished) {
      setFinished(true);
      sfx.completion();
      setFeedback('🎉 Hebat! Semua perlengkapan sekolah sudah lengkap!');
    }
  }, [collectedCount, totalSchool, finished]);

  const tapItem = (item: SchoolItem) => {
    if (finished || item.collected) return;

    if (item.isSchool) {
      sfx.correct();
      setScore((s) => s + 20);
      setFeedback(`✅ Bagus! ${item.name} dimasukkan ke tas!`);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, collected: true } : it))
      );
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 10));
      setFeedback(`❌ ${item.name} bukan untuk belajar di kelas ya.`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 22,
          border: '3px solid #4c8df6',
          boxShadow: '0 8px 24px rgba(76, 141, 246, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1f3a5f', margin: 0 }}>
            🎒 Siapkan Alat Belajar
          </h2>
          <div
            style={{
              background: '#e3eeff',
              border: '2px solid #4c8df6',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              color: '#1a5bc2',
            }}
          >
            Terkumpul: {collectedCount} / {totalSchool}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 800, minHeight: 24, color: '#314e74', margin: '8px 0 16px' }}>
          {feedback}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
                  : '3px solid #d3e3f5',
                background: item.collected
                  ? '#e8f7ea'
                  : item.isSchool
                  ? '#f4f9ff'
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
                  ✓ DI TAS
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
            <div style={{ fontSize: 44 }}>🏆</div>
            <h3 style={{ color: '#23883a', margin: '4px 0 8px' }}>
              Pintar Sekali! Tas Belajar Sudah Lengkap!
            </h3>
            <p style={{ margin: '0 0 14px', color: '#2b405a' }}>
              Skor Belajar: <strong>{score}</strong>
            </p>
            <button
              onClick={onComplete}
              style={{
                padding: '12px 32px',
                borderRadius: 999,
                border: 0,
                background: '#4c8df6',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(76, 141, 246, 0.4)',
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

