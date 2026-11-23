"use client";
import { notFound, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speak";
import { useHabit } from "@/lib/useHabit";

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

// ── Entry point ───────────────────────────────────────────────────────────────
export default function PuzzlePage() {
  const h = useHabit();
  if (!h) notFound();
  return (
    <Puzzle
      habitId={h.id}
      image={h.image}
      title={h.title}
      color={h.color}
      soft={h.soft}
    />
  );
}

// ── Komponen kepingan gambar (pakai <img> + clip agar spasi di nama file aman)
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
  // posisi offset gambar: geser sehingga bagian yang benar kelihatan
  const offsetX = -(col * size);
  const offsetY = -(row * size);
  const totalSize = GRID * size; // ukuran penuh gambar

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
function Puzzle({
  habitId,
  image,
  title,
  color,
  soft,
}: {
  habitId: number;
  image: string;
  title: string;
  color: string;
  soft: string;
}) {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<PuzzleState>(initPuzzle);
  const [sel, setSel] = useState<number | null>(null);   // keping dipilih dari sidebar
  const [pop, setPop] = useState<number | null>(null);   // animasi pas dipasang
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const dragRef = useRef<number | null>(null);

  const SIZE = 108; // ukuran tiap slot di papan (px)
  const placed = MISSING - puzzle.sidebar.length;

  // ── Pasang keping ke slot ──────────────────────────────────────────────────
  const placePiece = (pieceIdx: number, slotIdx: number) => {
    if (done || puzzle.board[slotIdx] !== null) return;

    if (pieceIdx === slotIdx) {
      // ✅ Posisi benar!
      sfx.correct();
      const nb = [...puzzle.board];
      nb[slotIdx] = pieceIdx;
      const ns = puzzle.sidebar.filter((p) => p !== pieceIdx);

      setSel(null);
      setPop(slotIdx);
      setTimeout(() => setPop(null), 700);
      setPuzzle({ board: nb, sidebar: ns });

      if (ns.length === 0) {
        setDone(true);
        sfx.completion();
        speak("Hore! Puzzle selesai! Kamu hebat sekali!");
        setTimeout(() => router.push(`/kebiasaan/${habitId}/reward`), 3200);
      }
    } else {
      // ❌ Posisi salah
      sfx.wrong();
      speak("Coba tempat yang lain ya!");
    }
  };

  return (
    <div
      className="puzzle-page"
      style={{ "--tile": color, "--soft": soft } as React.CSSProperties}
    >
      <TopBar
        title={title}
        back={`/kebiasaan/${habitId}/kuis`}
        speakText="Susun kepingan puzzle ke tempat yang benar!"
      />

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
          {done
            ? "🎉 Selamat! Puzzle berhasil disusun!"
            : sel !== null
            ? "👆 Ketuk kotak kosong yang sesuai!"
            : "👇 Pilih kepingan di samping, lalu ketuk kotak yang kosong!"}
        </p>

        {/* ── Area utama: papan + sidebar ── */}
        <div className="puzzle-main">

          {/* Papan puzzle */}
          <div className="puzzle-board-wrap">
            <div className="puzzle-board">
              {/* Overlay petunjuk */}
              {showHint && (
                <div className="puzzle-hint-overlay">
                  <img src={image} alt="petunjuk" />
                </div>
              )}

              {/* Grid slot */}
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
                              <span
                                className="puzzle-drop-hint"
                                style={{ color }}
                              >
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
                  className={`puzzle-piece-card ${
                    sel === pieceIdx ? "selected" : ""
                  }`}
                  style={
                    sel === pieceIdx
                      ? {
                          borderColor: color,
                          boxShadow: `0 0 0 3px ${color}55`,
                        }
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

              {puzzle.sidebar.length === 0 && !done && (
                <p className="puzzle-sidebar-empty">Semua sudah terpasang!</p>
              )}
            </div>
          </div>
        </div>

        {/* Banner selesai */}
        {done && (
          <div className="puzzle-done-banner" style={{ background: color }}>
            🎉 Luar biasa! Kamu berhasil menyusun puzzle!<br />
            <small>Sebentar lagi menuju hadiah...</small>
          </div>
        )}

      </section>
    </div>
  );
}

