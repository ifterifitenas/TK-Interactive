'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';

interface HelpingGameProps {
  onComplete: () => void;
}

interface KindnessAct {
  id: number;
  emoji: string;
  title: string;
  desc: string;
  isGood: boolean;
  helped: boolean;
}

const ACTS: Omit<KindnessAct, 'helped'>[] = [
  { id: 1, emoji: '🤝', title: 'Tolong Teman Terjatuh', desc: 'Bantu teman berdiri saat tersandung', isGood: true },
  { id: 2, emoji: '🎨', title: 'Berbagi Krayon Warna', desc: 'Pinjamkan warna saat teman membutuhkan', isGood: true },
  { id: 3, emoji: '👋', title: 'Menyapa Teman Baru', desc: 'Tersenyum ramah kepada teman di kelas', isGood: true },
  { id: 4, emoji: '🍪', title: 'Berbagi Bekal Sehat', desc: 'Berbagi makanan lezat bersama sahabat', isGood: true },
  { id: 5, emoji: '🧹', title: 'Bantu Bersihkan Kelas', desc: 'Bekerja sama merapikan mainan bersama', isGood: true },
  { id: 6, emoji: '😠', title: 'Rebut Mainan Teman', desc: 'Mengambil mainan tanpa izin', isGood: false },
  { id: 7, emoji: '😂', title: 'Ejek Teman yang Kalah', desc: 'Menertawakan teman yang kesulitan', isGood: false },
];

export default function HelpingGame({ onComplete }: HelpingGameProps) {
  const [acts, setActs] = useState<KindnessAct[]>(() =>
    ACTS.map((a) => ({ ...a, helped: false }))
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pilih semua sikap baik untuk saling menolong!');
  const [finished, setFinished] = useState(false);

  const totalGood = acts.filter((a) => a.isGood).length;
  const goodHelped = acts.filter((a) => a.isGood && a.helped).length;

  useEffect(() => {
    if (goodHelped === totalGood && !finished) {
      setFinished(true);
      sfx.completion();
      setFeedback('🎉 Luar biasa! Kamu sahabat kecil yang sangat baik hati!');
    }
  }, [goodHelped, totalGood, finished]);

  const tapAct = (act: KindnessAct) => {
    if (finished || act.helped) return;

    if (act.isGood) {
      sfx.correct();
      setScore((s) => s + 20);
      setFeedback(`💖 Hebat! ${act.title}!`);
      setActs((prev) =>
        prev.map((a) => (a.id === act.id ? { ...a, helped: true } : a))
      );
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 10));
      setFeedback(`❌ ${act.title} membuat teman sedih.`);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 22,
          border: '3px solid #9b8cf0',
          boxShadow: '0 8px 24px rgba(155, 140, 240, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#1f3a5f', margin: 0 }}>
            🤗 Sahabat yang Baik Hati
          </h2>
          <div
            style={{
              background: '#eeeaff',
              border: '2px solid #9b8cf0',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              color: '#6552cc',
            }}
          >
            Kebaikan: {goodHelped} / {totalGood}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 800, minHeight: 24, color: '#314e74', margin: '8px 0 16px' }}>
          {feedback}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {acts.map((act) => (
            <button
              key={act.id}
              onClick={() => tapAct(act)}
              disabled={act.helped || finished}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 18,
                border: act.helped
                  ? '3px solid #5cc26a'
                  : '3px solid #d3e3f5',
                background: act.helped
                  ? '#e8f7ea'
                  : act.isGood
                  ? '#ffffff'
                  : '#fff7f7',
                cursor: act.helped || finished ? 'default' : 'pointer',
                opacity: act.helped ? 0.7 : 1,
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: '2.4rem', flexShrink: 0 }}>{act.emoji}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: '#2b405a' }}>
                  {act.title}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#6882a1' }}>
                  {act.desc}
                </span>
              </div>
              {act.helped && (
                <span style={{ fontSize: '1.1rem', color: '#23883a', fontWeight: 900 }}>
                  ✓
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
            <div style={{ fontSize: 44 }}>🌟</div>
            <h3 style={{ color: '#23883a', margin: '4px 0 8px' }}>
              Kamu Bintang Sahabat Sejati!
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
                background: '#9b8cf0',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(155, 140, 240, 0.4)',
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

