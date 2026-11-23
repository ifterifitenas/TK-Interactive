'use client';

import { useEffect, useState } from 'react';
import { sfx } from '@/lib/sfx';

interface FoodSortGameProps {
  onComplete: () => void;
}

type FoodType = 'fruit' | 'veggie';
type Food = { id: number; emoji: string; label: string; type: FoodType };

const INITIAL_FOODS: Food[] = [
  { id: 1, emoji: '🍎', label: 'Apel', type: 'fruit' },
  { id: 2, emoji: '🥦', label: 'Brokoli', type: 'veggie' },
  { id: 3, emoji: '🍌', label: 'Pisang', type: 'fruit' },
  { id: 4, emoji: '🥕', label: 'Wortel', type: 'veggie' },
  { id: 5, emoji: '🍇', label: 'Anggur', type: 'fruit' },
  { id: 6, emoji: '🌽', label: 'Jagung', type: 'veggie' },
  { id: 7, emoji: '🍊', label: 'Jeruk', type: 'fruit' },
  { id: 8, emoji: '🥬', label: 'Selada', type: 'veggie' },
];

export default function FoodSortGame({ onComplete }: FoodSortGameProps) {
  const [foods, setFoods] = useState(INITIAL_FOODS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pilih makanan, lalu masukkan ke kelompoknya.');
  const [finished, setFinished] = useState(false);
  const [notification, setNotification] = useState('');
  const sortedCount = INITIAL_FOODS.length - foods.length;

  const sortFood = (type: FoodType) => {
    if (selectedId === null || finished) return;
    const food = foods.find((item) => item.id === selectedId);
    if (!food) return;

    if (food.type !== type) {
      setScore((value) => Math.max(0, value - 5));
      setFeedback('Coba lagi, pilih kelompok yang lain.');
      setNotification('Belum tepat. Coba lagi ya!');
      return;
    }

    const remaining = foods.filter((item) => item.id !== selectedId);
    setFoods(remaining);
    setSelectedId(null);
    setScore((value) => value + 10);
    setFeedback('✅ Benar! Makanan sudah dikelompokkan.');
    if (remaining.length === 0) setFinished(true);
  };

  const reset = () => {
    setFoods(INITIAL_FOODS);
    setSelectedId(null);
    setScore(0);
    setFeedback('Pilih makanan, lalu masukkan ke kelompoknya.');
    setNotification('');
    setFinished(false);
  };

  useEffect(() => {
    if (finished) sfx.completion();
  }, [finished]);

  useEffect(() => {
    if (!notification) return;
    const timeout = setTimeout(() => setNotification(''), 2200);
    return () => clearTimeout(timeout);
  }, [notification]);

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(180deg, #f7f1df 0%, #fffaf0 58%, #edf7e8 100%)', padding: 18, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#5a4630' }}>
      <div style={{ width: 'min(100%, 760px)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#a07850', color: '#fff', border: '3px solid #7a5a34', borderRadius: 18, padding: '14px 20px', fontWeight: 800, boxShadow: '0 5px 0 #7a5a34' }}>
          <span style={{ fontSize: 20 }}>🥗 Sortir Makanan Sehat</span>
          <span>⭐ {score}</span>
        </div>
        <div style={{ margin: '16px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
          <span>Progress sortir</span>
          <span>{sortedCount}/{INITIAL_FOODS.length}</span>
        </div>
        <div style={{ height: 14, overflow: 'hidden', borderRadius: 99, background: '#eadfca', border: '2px solid #c8a870' }}>
          <div style={{ height: '100%', width: `${(sortedCount / INITIAL_FOODS.length) * 100}%`, background: '#a07850', transition: 'width .3s ease' }} />
        </div>
        <p style={{ textAlign: 'center', minHeight: 24, margin: '12px 0', fontWeight: 700 }}>{selectedId === null ? feedback : 'Sekarang pilih kelompok yang tepat!'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 12, margin: '16px 0 22px' }}>
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => setSelectedId(food.id)}
              style={{
                minHeight: 120,
                border: selectedId === food.id ? '4px solid #a07850' : '3px solid #c8a870',
                borderRadius: 18,
                background: selectedId === food.id ? '#fff1d2' : '#fff8ec',
                color: '#5a4630',
                cursor: 'pointer',
                boxShadow: selectedId === food.id ? '0 5px 0 #7a5a34' : '0 3px 0 rgba(160,120,80,.2)',
                transform: selectedId === food.id ? 'translateY(-5px) scale(1.03)' : 'none',
                transition: 'transform .15s, box-shadow .15s, background .15s',
              }}
            >
              <span style={{ display: 'block', fontSize: 48 }}>{food.emoji}</span>
              <strong>{food.label}</strong>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 6 }}>
          <button onClick={() => sortFood('fruit')} style={{ minHeight: 150, border: '4px solid #e67e22', borderRadius: 24, background: 'linear-gradient(145deg, #fff8e8, #ffdca7)', color: '#9a4f0b', fontSize: 22, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 0 #c66d22', transition: 'transform .15s' }}>
            <span style={{ display: 'block', fontSize: 46 }}>🍎🍌</span>
            Buah-buahan
          </button>
          <button onClick={() => sortFood('veggie')} style={{ minHeight: 150, border: '4px solid #4caf50', borderRadius: 24, background: 'linear-gradient(145deg, #f4fff0, #bce8ae)', color: '#28752d', fontSize: 22, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 0 #36843c', transition: 'transform .15s' }}>
            <span style={{ display: 'block', fontSize: 46 }}>🥦🥕</span>
            Sayur-sayuran
          </button>
        </div>

        {notification && (
          <div role="alert" style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: 'calc(100% - 32px)', maxWidth: 420, background: '#fff4c4', color: '#795a28', border: '2px solid #d6b45a', borderRadius: 12, padding: '12px 16px', textAlign: 'center', fontWeight: 700, boxShadow: '0 6px 20px rgba(108,76,38,.25)', boxSizing: 'border-box' }}>
            {notification}
          </div>
        )}

        {finished && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(160,120,80,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#fff8ec', borderRadius: 20, padding: '36px 48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.25)', maxWidth: 360, width: 'calc(100% - 32px)', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <h2 style={{ color: '#a07850', margin: '12px 0 6px', fontSize: 28, fontWeight: 800 }}>Selesai!</h2>
              <p style={{ color: '#7a5a34', marginBottom: 20 }}>Semua makanan sudah terpisah!<br />Skor akhir: <strong>{score}</strong></p>
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