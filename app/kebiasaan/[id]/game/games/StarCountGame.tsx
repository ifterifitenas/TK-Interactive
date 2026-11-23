'use client';

import { useState } from 'react';
import { sfx } from '@/lib/sfx';

interface StarCountGameProps {
  onComplete: () => void;
}

export default function StarCountGame({ onComplete }: StarCountGameProps) {
  const [lightsOff, setLightsOff] = useState<number[]>([]);
  const [starsClicked, setStarsClicked] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const totalLights = 3;
  const totalStars = 5;

  const toggleLight = (id: number) => {
    if (finished || lightsOff.includes(id)) return;
    sfx.tap();
    const next = [...lightsOff, id];
    setLightsOff(next);

    if (next.length === totalLights && starsClicked.length === totalStars) {
      setFinished(true);
      sfx.completion();
    }
  };

  const clickStar = (id: number) => {
    if (finished || starsClicked.includes(id)) return;
    sfx.correct();
    const next = [...starsClicked, id];
    setStarsClicked(next);

    if (lightsOff.length === totalLights && next.length === totalStars) {
      setFinished(true);
      sfx.completion();
    }
  };

  const allReady = lightsOff.length === totalLights && starsClicked.length === totalStars;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px' }}>
      <div
        style={{
          background: 'linear-gradient(180deg, #182848 0%, #29487d 100%)',
          borderRadius: 24,
          padding: 24,
          border: '3px solid #3f6bc9',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(24, 40, 72, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#ffde59', margin: 0 }}>
            🌙 Kamar Bintang Tidur Nyenyak
          </h2>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#fff',
            }}
          >
            Lampu: {lightsOff.length}/{totalLights} | Bintang: {starsClicked.length}/{totalStars}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontWeight: 800, minHeight: 24, color: '#d0e2ff', margin: '6px 0 16px' }}>
          {lightsOff.length < totalLights
            ? '1. Matikan lampu-lampu kamar agar ruangan redup dan tenang!'
            : !allReady
            ? '2. Ketuk bintang-bintang di langit malam untuk menghitungnya!'
            : '🎉 Ruangan tenang, saatnya tidur cepat! Selamat malam, mimpi indah!'}
        </p>

        {/* Bagian Matikan Lampu */}
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: '0.95rem', color: '#ffd768', display: 'block', marginBottom: 8 }}>
            💡 Lampu Kamar (Ketuk untuk matikan):
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { id: 1, label: 'Lampu Meja', emoji: '🛋️' },
              { id: 2, label: 'Lampu Utama', emoji: '💡' },
              { id: 3, label: 'Layar TV/HP', emoji: '📺' },
            ].map((light) => {
              const isOff = lightsOff.includes(light.id);
              return (
                <button
                  key={light.id}
                  onClick={() => toggleLight(light.id)}
                  disabled={isOff || finished}
                  style={{
                    padding: '14px 8px',
                    borderRadius: 16,
                    border: isOff ? '2px solid rgba(255, 255, 255, 0.2)' : '3px solid #ffde59',
                    background: isOff ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 222, 89, 0.2)',
                    color: isOff ? '#8aa2c8' : '#ffffff',
                    cursor: isOff ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '2rem', filter: isOff ? 'grayscale(1)' : 'none' }}>
                    {isOff ? '🌑' : light.emoji}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    {light.label} {isOff ? '(Mati)' : '(Nyala)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bagian Langit & Bintang */}
        <div>
          <strong style={{ fontSize: '0.95rem', color: '#ffd768', display: 'block', marginBottom: 8 }}>
            ⭐ Langit Malam (Ketuk semua bintang):
          </strong>
          <div
            style={{
              height: 140,
              background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
              borderRadius: 18,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 16px',
            }}
          >
            {[1, 2, 3, 4, 5].map((sId) => {
              const isClicked = starsClicked.includes(sId);
              return (
                <button
                  key={sId}
                  onClick={() => clickStar(sId)}
                  disabled={isClicked || finished}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: isClicked ? 'default' : 'pointer',
                    fontSize: isClicked ? '2.8rem' : '2rem',
                    transform: isClicked ? 'scale(1.2)' : 'scale(1)',
                    opacity: isClicked ? 1 : 0.45,
                    filter: isClicked
                      ? 'drop-shadow(0 0 10px #ffe600)'
                      : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  ⭐
                </button>
              );
            })}
          </div>
        </div>

        {allReady && (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              border: '2px solid #5cc26a',
            }}
          >
            <div style={{ fontSize: 44 }}>😴</div>
            <h3 style={{ color: '#90ee90', margin: '4px 0 8px' }}>
              Kamar Sudah Nyaman! Bima Tidur Nyenyak!
            </h3>
            <p style={{ margin: '0 0 14px', color: '#e0edff' }}>
              Tidur cepat membuat esok hari badan segar dan bertenaga!
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

