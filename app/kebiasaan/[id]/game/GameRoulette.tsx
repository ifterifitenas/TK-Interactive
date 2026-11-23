"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeak } from "@/lib/speak";
import { ROULETTE_BONUS_GAMES, RouletteOption } from "./rouletteConfig";

interface GameRouletteProps {
  habitId: number;
  habitTitle: string;
  habitColor: string;
  onSelectGame: (option: RouletteOption) => void;
}

export default function GameRoulette({
  habitId,
  habitTitle,
  habitColor,
  onSelectGame,
}: GameRouletteProps) {
  const options = useMemo(() => {
    return ROULETTE_BONUS_GAMES[habitId] || ROULETTE_BONUS_GAMES[1];
  }, [habitId]);

  const numSlices = options.length;
  const sliceAngle = 360 / numSlices;

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedOption, setSelectedOption] = useState<RouletteOption | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [needleTick, setNeedleTick] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopSpeak();
    };
  }, []);

  // Welcome speech
  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        "Hebat! Game utama selesai! Sekarang putar roulette untuk mendapatkan game tambahan!"
      );
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // Calculate slice path for SVG (Circle centered at 200, 200 with radius 185)
  const getSlicePath = (index: number) => {
    const radius = 185;
    const cx = 200;
    const cy = 200;
    // Slices arranged so top (270 deg / -90 deg) is the needle position.
    const startAngleDeg = index * sliceAngle - sliceAngle / 2 - 90;
    const endAngleDeg = startAngleDeg + sliceAngle;

    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Label coordinates and rotation angle
  const getLabelTransform = (index: number) => {
    const cx = 200;
    const cy = 200;
    const textRadius = 118;
    const angleDeg = index * sliceAngle - 90;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = cx + textRadius * Math.cos(angleRad);
    const y = cy + textRadius * Math.sin(angleRad);

    let rotationAngle = angleDeg + 90;
    if (rotationAngle > 90 && rotationAngle <= 270) {
      rotationAngle += 180;
    }

    return { x, y, rotationAngle };
  };

  // Spin with requestAnimationFrame for 100% reliable 60fps animation
  const spinWheel = () => {
    if (isSpinning) return;

    sfx.tap();
    setIsSpinning(true);
    setShowResultModal(false);
    setSelectedOption(null);

    // Pick random target slice
    const targetIndex = Math.floor(Math.random() * numSlices);
    const targetOption = options[targetIndex];

    const startAngle = rotationRef.current;
    const currentBase = Math.floor(startAngle / 360) * 360;
    const targetAngleInCircle = (360 - targetIndex * sliceAngle) % 360;

    // Minimum 5 full turns (1800 deg) + target angle in circle
    let totalTarget = currentBase + 5 * 360 + targetAngleInCircle;
    if (totalTarget <= startAngle + 360 * 4) {
      totalTarget += 360;
    }

    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();
    let lastSliceCrossed = Math.floor(startAngle / sliceAngle);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease out: fast start, dramatic slowing down to standstill
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + (totalTarget - startAngle) * ease;

      rotationRef.current = currentAngle;
      setRotation(currentAngle);

      // Trigger needle bounce & sound tick on crossing slices
      const currentSlice = Math.floor(currentAngle / sliceAngle);
      if (currentSlice !== lastSliceCrossed) {
        lastSliceCrossed = currentSlice;
        sfx.spinTick();
        setNeedleTick((prev) => !prev);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setSelectedOption(targetOption);
        setShowResultModal(true);

        sfx.cheer();
        sfx.fanfare();
        speak(
          `Hore! Kamu mendapatkan game tambahan: ${targetOption.title}! Ayo kita mainkan!`
        );
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleStartGame = () => {
    if (selectedOption) {
      sfx.tap();
      onSelectGame(selectedOption);
    }
  };

  return (
    <div className="roulette-container">
      {/* Confetti when result modal is open */}
      {showResultModal && (
        <div className="roulette-confetti" aria-hidden>
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 29) % 100}%`,
                animationDelay: `${(i * 0.12) % 2}s`,
                backgroundColor: [
                  "#ffc83d",
                  "#4c8df6",
                  "#5cc26a",
                  "#f26d6d",
                  "#9b8cf0",
                  "#ff7043",
                ][i % 6],
              }}
            />
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div className="roulette-header">
        <div className="roulette-badge">
          <span>✨ ROULETTE GAME TAMBAHAN ✨</span>
        </div>
        <h2 className="roulette-title">Putar Roda & Dapatkan Game Tambahan!</h2>
        <p className="roulette-subtitle">
          Pilihan game seru berikutnya untuk materi <strong>{habitTitle}</strong>
        </p>
      </div>

      {/* Wheel Section */}
      <div className="roulette-wheel-wrapper">
        {/* Top Indicator Needle */}
        <div
          className={`roulette-needle ${needleTick ? "needle-tick" : ""}`}
          aria-hidden
        >
          <div className="needle-triangle" />
          <div className="needle-jewel" />
        </div>

        {/* The Wheel Card containing Rotating HTML Wrapper */}
        <div className="roulette-wheel-card">
          <div
            className="roulette-rotator"
            style={{
              transform: `rotate(${rotation}deg)`,
              width: "100%",
              height: "100%",
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <svg viewBox="0 0 400 400" className="roulette-svg">
              <defs>
                {/* Outer rim gradient */}
                <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="90%" stopColor="#d4af37" />
                  <stop offset="96%" stopColor="#fff2a8" />
                  <stop offset="100%" stopColor="#aa820a" />
                </radialGradient>

                {/* Center hub gradient */}
                <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fdf8e2" />
                  <stop offset="100%" stopColor="#eed268" />
                </linearGradient>

                {/* Drop shadow */}
                <filter id="wheelShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Outer Rim Circle */}
              <circle
                cx="200"
                cy="200"
                r="196"
                fill="url(#rimGrad)"
                stroke="#976e05"
                strokeWidth="4"
                filter="url(#wheelShadow)"
              />

              {/* Light Bulbs on Rim */}
              {Array.from({ length: 24 }).map((_, i) => {
                const bulbAngle = (i * 360) / 24;
                const bulbRad = (bulbAngle * Math.PI) / 180;
                const bx = 200 + 190 * Math.cos(bulbRad);
                const by = 200 + 190 * Math.sin(bulbRad);
                return (
                  <circle
                    key={i}
                    cx={bx}
                    cy={by}
                    r="3.5"
                    fill={i % 2 === 0 ? "#ffffff" : "#ffe600"}
                    stroke="#ab7e04"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Wheel Slices */}
              {options.map((opt, i) => (
                <g key={opt.id}>
                  <path
                    d={getSlicePath(i)}
                    fill={opt.color}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                  />
                </g>
              ))}

              {/* Slices Content (Emoji & Label) */}
              {options.map((opt, i) => {
                const { x, y, rotationAngle } = getLabelTransform(i);
                return (
                  <g
                    key={`label-${opt.id}`}
                    transform={`translate(${x}, ${y}) rotate(${rotationAngle})`}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fontSize="32"
                      dominantBaseline="middle"
                    >
                      {opt.emoji}
                    </text>
                    <text
                      x="0"
                      y="22"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13.5"
                      fontWeight="800"
                      fontFamily="Trebuchet MS, Arial Rounded MT Bold, sans-serif"
                      stroke="#14263f"
                      strokeWidth="3"
                      paintOrder="stroke"
                      dominantBaseline="middle"
                    >
                      {opt.shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle
                cx="200"
                cy="200"
                r="40"
                fill="url(#hubGrad)"
                stroke="#d4af37"
                strokeWidth="5"
                filter="url(#wheelShadow)"
              />
              <circle
                cx="200"
                cy="200"
                r="28"
                fill={habitColor}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x="200"
                y="201"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
              >
                🎡
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="roulette-actions">
        <button
          type="button"
          className="btn-roulette-spin"
          onClick={spinWheel}
          disabled={isSpinning}
        >
          <span className="spin-icon">{isSpinning ? "🌀" : "🎡"}</span>
          <span className="spin-text">
            {isSpinning ? "SEDANG BERPUTAR..." : "PUTAR ROULETTE!"}
          </span>
        </button>
      </div>

      {/* Result Modal / Overlay */}
      {showResultModal && selectedOption && (
        <div className="roulette-modal-overlay">
          <div className="roulette-modal-card">
            <div className="modal-confetti-badge">🎉 GAME TAMBAHAN TERPILIH! 🎉</div>
            <div
              className="modal-game-icon"
              style={{ backgroundColor: `${selectedOption.color}22`, borderColor: selectedOption.color }}
            >
              <span>{selectedOption.emoji}</span>
            </div>
            <h3 className="modal-game-title">{selectedOption.title}</h3>
            <p className="modal-game-desc">{selectedOption.description}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-play-game"
                style={{ backgroundColor: selectedOption.color }}
                onClick={handleStartGame}
              >
                MULAI MAIN GAME TAMBAHAN ▶
              </button>
              <button
                type="button"
                className="btn-respin"
                onClick={spinWheel}
                disabled={isSpinning}
              >
                🔄 Putar Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
