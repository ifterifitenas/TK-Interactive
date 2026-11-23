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
  const sortedCount = INITIAL_FOODS.length - foods.length;

  const sortFood = (type: FoodType) => {
    if (selectedId === null || finished) return;
    const food = foods.find((item) => item.id === selectedId);
    if (!food) return;

    if (food.type !== type) {
      setScore((value) => Math.max(0, value - 5));
      setFeedback('❌ Belum tepat, coba kelompok yang lain.');
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
    setFinished(false);
  };

  useEffect(() => {
    if (finished) sfx.completion();
  }, [finished]);

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(180deg, #fff6e3 0%, #fffaf0 58%, #eaf7e6 100%)', padding: 18, fontFamily: 'sans-serif', color: '#4a3728' }}>
      <div style={{ width: 'min(100%, 760px)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f6c343, #f4a641)', border: '3px solid #8c5e3c', borderRadius: 20, padding: '16px 22px', fontWeight: 800, boxShadow: '0 6px 0 #8c5e3c' }}>
          <span style={{ fontSize: 20 }}>🥗 Misi Makanan Sehat</span>
          <span>⭐ {score}</span>
        </div>
        <div style={{ margin: '16px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
          <span>Progress sortir</span>
          <span>{sortedCount}/{INITIAL_FOODS.length}</span>
        </div>
        <div style={{ height: 14, overflow: 'hidden', borderRadius: 99, background: '#eadfca', border: '2px solid #8c5e3c' }}>
          <div style={{ height: '100%', width: `${(sortedCount / INITIAL_FOODS.length) * 100}%`, background: '#4caf50', transition: 'width .3s ease' }} />
        </div>
        <p style={{ textAlign: 'center', minHeight: 24, margin: '12px 0', fontWeight: 700 }}>{selectedId === null ? feedback : 'Sekarang pilih kelompok yang tepat!'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 12, margin: '16px 0 22px' }}>
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => setSelectedId(food.id)}
              style={{
                minHeight: 120,
                border: selectedId === food.id ? '4px solid #f6c343' : '3px solid #8c5e3c',
                borderRadius: 18,
                background: selectedId === food.id ? '#fff1c7' : '#fff',
                color: '#4a3728',
                cursor: 'pointer',
                boxShadow: selectedId === food.id ? '0 5px 0 #8c5e3c' : '0 3px 0 rgba(140,94,60,.2)',
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

        {finished && (
          <div style={{ marginTop: 18, padding: 22, textAlign: 'center', background: '#fff', borderRadius: 20, border: '3px solid #4caf50' }}>
            <div style={{ fontSize: 46 }}>🎉</div>
            <h2 style={{ color: '#28752d', margin: '6px 0' }}>Semua makanan sudah terpisah!</h2>
            <p>Skor akhir: <strong>{score}</strong></p>
            <button onClick={reset} style={{ marginRight: 8, padding: '10px 18px', borderRadius: 20, border: '2px solid #8c5e3c', background: '#fff', fontWeight: 800 }}>Coba Lagi</button>
            <button onClick={onComplete} style={{ padding: '10px 22px', borderRadius: 20, border: 0, background: '#f6c343', color: '#4a3728', fontWeight: 800 }}>Lanjut</button>
          </div>
        )}
      </div>
    </div>
  );
}
