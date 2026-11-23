"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speak";

// ── Konfigurasi puzzle ───────────────────────────────────────────────────────
const GRID = 3;      // 3×3 = 9 keping
const MISSING = 4;   // 4 keping dimulai di sidebar

// ── Helper ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PuzzleState = { board: (number | null)[]; sidebar: number[] };

function initPuzzle(): PuzzleState {
  const all = Array.from({ length: GRID * GRID }, (_, i) => i);
  const removed = shuffle([...all]).slice(0, MISSING);
  const board = all.map((i) => (removed.includes(i) ? null : i)) as (number | null)[];
  return { board, sidebar: shuffle([...removed]) };
}

// ── Konfeti ───────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#ffc83d","#f26d6d","#5cc26a","#4c8df6","#9b8cf0","#ff9f43","#fff"];
function ConfettiPiece({ i }: { i: number }) {
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const left  = `${(i * 37 + 11) % 100}%`;
  const delay = `${(i * 0.17) % 2}s`;
  const size  = 8 + (i % 5) * 3;
  return (
    <i
      aria-hidden
      style={{
        position: "absolute",
        left,
        top: `-${size}px`,
        width: size,
        height: size * 0.6,
        background: color,
        borderRadius: i % 3 === 0 ? "50%" : 2,
        animationDelay: delay,
      }}
      className="win-confetti-piece"
    />
  );
}

// ── Pop-up menang (gaya reward page) ─────────────────────────────────────────
function WinPopup({
  image,
  color,
  badge,
  onNext,
  onHome,
}: {
  image: string;
  color: string;
  badge: { name: string; emoji: string };
  onNext: () => void;
  onHome: () => void;
}) {
  return (
    <div className="win-overlay" role="dialog" aria-modal aria-label="Puzzle selesai!">
      {/* Konfeti */}
      <div className="win-confetti" aria-hidden>
        {Array.from({ length: 32 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
      </div>

      <div className="win-card">
        {/* Gambar puzzle utuh + bintang */}
        <div className="win-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="puzzle selesai" className="win-img" />
          <span className="win-img-stars" aria-hidden>⭐⭐⭐</span>
        </div>

        {/* Badge habit (seperti reward page) */}
        <div className="win-badge-box" style={{ "--tile": color, borderColor: `${color}55` } as React.CSSProperties}>
          <span className="win-badge-emoji" aria-hidden>{badge.emoji}</span>
          <strong className="win-badge-name">{badge.name}</strong>
        </div>

        <h2 className="win-title">Luar Biasa! 🎉</h2>
        <p className="win-desc">Kamu berhasil menyusun puzzle dengan sempurna!</p>

        {/* Dua tombol: Lanjut & Kembali */}
        <div className="win-buttons">
          <button className="win-btn-secondary" onClick={onHome} aria-label="Kembali ke menu">
            🏠 Menu
          </button>
          <button className="win-btn" style={{ background: color }} onClick={onNext}>
            Lanjut ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen kepingan gambar ──────────────────────────────────────────────────
function PieceImg({
  idx,
  image,
  size,
}: {
  idx: number;
  image: string;
  size: number;
}) {
  const col = idx % GRID;
  const row = Math.floor(idx / GRID);
  const offsetX = -(col * size);
  const offsetY = -(row * size);
  const totalSize = GRID * size;

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        borderRadius: 4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        draggable={false}
        style={{
          width: totalSize,
          height: totalSize,
          position: "absolute",
          top: offsetY,
          left: offsetX,
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Komponen utama puzzle ─────────────────────────────────────────────────────
export default function PuzzleGame({
  habitId,
  image,
  title,
  color,
  soft,
  badge,
  onComplete,
  hideTopBar = false,
}: {
  habitId: number;
  image: string;
  title: string;
  color: string;
  soft: string;
  badge: { name: string; emoji: string };
  onComplete?: () => void;
  hideTopBar?: boolean;
}) {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<PuzzleState>(initPuzzle);
  const [sel, setSel] = useState<number | null>(null);
  const [pop, setPop] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const dragRef = useRef<number | null>(null);

  const SIZE = 108;
  const placed = MISSING - puzzle.sidebar.length;

  const handleNext = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push(`/kebiasaan/${habitId}/reward`);
    }
  };

  const placePiece = (pieceIdx: number, slotIdx: number) => {
    if (showWin || puzzle.board[slotIdx] !== null) return;

    if (pieceIdx === slotIdx) {
      sfx.correct();
      const nb = [...puzzle.board];
      nb[slotIdx] = pieceIdx;
      const ns = puzzle.sidebar.filter((p) => p !== pieceIdx);

      setSel(null);
      setPop(slotIdx);
      setTimeout(() => setPop(null), 700);
      setPuzzle({ board: nb, sidebar: ns });

      if (ns.length === 0) {
        // Tampilkan pop-up menang setelah animasi selesai
        setTimeout(() => {
          sfx.completion();
          speak("Hore! Puzzle selesai! Kamu hebat sekali!");
          setShowWin(true);
        }, 600);
      }
    } else {
      sfx.wrong();
      speak("Coba tempat yang lain ya!");
    }
  };

  return (
    <div
      className="puzzle-page"
      style={{ "--tile": color, "--soft": soft } as React.CSSProperties}
    >
      {!hideTopBar && (
        <TopBar
          title={title}
          back={`/kebiasaan/${habitId}/kuis`}
          speakText="Susun kepingan puzzle ke tempat yang benar!"
        />
      )}

      <section className="panel stack puzzle-card">
        {/* ── Header ── */}
        <div className="puzzle-header-row">
          <h2 className="puzzle-heading">🧩 Susun Puzzlenya!</h2>
          <div className="puzzle-meta">
            <span className="puzzle-counter" style={{ color }}>
              {placed}/{MISSING} terpasang
            </span>
            <button
              className="puzzle-hint-btn"
              onPointerDown={() => setShowHint(true)}
              onPointerUp={() => setShowHint(false)}
              onPointerLeave={() => setShowHint(false)}
            >
              🖼️ Petunjuk
            </button>
          </div>
        </div>

        {/* ── Instruksi dinamis ── */}
        <p className="puzzle-instruction">
          {sel !== null
            ? "👆 Ketuk kotak kosong yang sesuai!"
            : "👇 Pilih kepingan di samping, lalu ketuk kotak yang kosong!"}
        </p>

        {/* ── Area utama: papan + sidebar ── */}
        <div className="puzzle-main">
          {/* Papan puzzle */}
          <div className="puzzle-board-wrap">
            <div className="puzzle-board">
              {showHint && (
                <div className="puzzle-hint-overlay">
                  <img src={image} alt="petunjuk" />
                </div>
              )}

              {Array.from({ length: GRID }, (_, row) => (
                <div key={row} className="puzzle-row">
                  {Array.from({ length: GRID }, (_, col) => {
                    const slotIdx = row * GRID + col;
                    const piece = puzzle.board[slotIdx];
                    const isDroppable = piece === null && sel !== null;

                    return (
                      <div
                        key={col}
                        className={[
                          "puzzle-slot",
                          piece !== null ? "filled" : "empty",
                          isDroppable ? "droppable" : "",
                          pop === slotIdx ? "pop" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={isDroppable ? { borderColor: color } : {}}
                        onClick={() => {
                          if (sel !== null) placePiece(sel, slotIdx);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const p = dragRef.current;
                          if (p !== null) placePiece(p, slotIdx);
                          dragRef.current = null;
                        }}
                      >
                        {piece !== null ? (
                          <PieceImg idx={piece} image={image} size={SIZE} />
                        ) : (
                          <div className="puzzle-empty-slot">
                            {isDroppable && (
                              <span className="puzzle-drop-hint" style={{ color }}>
                                +
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar kepingan */}
          <div className="puzzle-sidebar">
            <p className="puzzle-sidebar-label">Kepingan:</p>
            <div className="puzzle-sidebar-pieces">
              {puzzle.sidebar.map((pieceIdx) => (
                <div
                  key={pieceIdx}
                  className={`puzzle-piece-card ${sel === pieceIdx ? "selected" : ""}`}
                  style={
                    sel === pieceIdx
                      ? { borderColor: color, boxShadow: `0 0 0 3px ${color}55` }
                      : {}
                  }
                  onClick={() => {
                    sfx.tap();
                    setSel(sel === pieceIdx ? null : pieceIdx);
                  }}
                  draggable
                  onDragStart={() => {
                    dragRef.current = pieceIdx;
                    setSel(pieceIdx);
                  }}
                  onDragEnd={() => {
                    dragRef.current = null;
                  }}
                >
                  <PieceImg idx={pieceIdx} image={image} size={88} />
                  {sel === pieceIdx && (
                    <span className="puzzle-selected-mark">✓</span>
                  )}
                </div>
              ))}

              {puzzle.sidebar.length === 0 && !showWin && (
                <p className="puzzle-sidebar-empty">Semua sudah terpasang!</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pop-up menang ── */}
      {showWin && (
        <WinPopup
          image={image}
          color={color}
          badge={badge}
          onNext={handleNext}
          onHome={() => router.push("/menu")}
        />
      )}
    </div>
  );
}

