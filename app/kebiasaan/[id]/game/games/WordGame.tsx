"use client";

import { useState, useEffect, useCallback } from "react";
import { sfx } from '@/lib/sfx';

interface WordGameProps {
  onComplete: () => void;
}

const WORDS = [
  { word: "BUKU", emoji: "📚", hint: "Tempat ilmu pengetahuan" },
  { word: "GURU", emoji: "👩‍🏫", hint: "Orang yang mengajar kita" },
  { word: "TULIS", emoji: "✏️", hint: "Kegiatan dengan pensil" },
  { word: "KELAS", emoji: "🏫", hint: "Tempat belajar di sekolah" },
  { word: "PINTAR", emoji: "🧠", hint: "Hasil rajin belajar" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface LetterTile {
  id: number;
  char: string;
}

export default function WordGame({ onComplete }: WordGameProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<LetterTile[]>([]);
  const [bankLetters, setBankLetters] = useState<LetterTile[]>([]);
  const [status, setStatus] = useState<"playing" | "success" | "reveal" | "done">("playing");
  const [showAnswer, setShowAnswer] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const [flashError, setFlashError] = useState(false);

  const currentWord = WORDS[wordIndex];

  const initWord = useCallback((idx: number) => {
    const word = WORDS[idx].word;
    const tiles: LetterTile[] = word.split("").map((char, i) => ({ id: i, char }));
    let shuffled = shuffleArray(tiles);
    // ensure shuffled is different from original if word length > 1
    let tries = 0;
    while (
      tries < 10 &&
      shuffled.map((t) => t.char).join("") === word
    ) {
      shuffled = shuffleArray(tiles);
      tries++;
    }
    setBankLetters(shuffled);
    setSelectedLetters([]);
    setMistakes(0);
    setShowAnswer(false);
    setStatus("playing");
  }, []);

  useEffect(() => {
    initWord(wordIndex);
  }, [wordIndex, initWord]);

  const handleBankClick = (tile: LetterTile) => {
    if (status !== "playing") return;
    setBankLetters((prev) => prev.filter((t) => t.id !== tile.id));
    setSelectedLetters((prev) => [...prev, tile]);
  };

  const handleSelectedClick = (tile: LetterTile) => {
    if (status !== "playing") return;
    setSelectedLetters((prev) => prev.filter((t) => t.id !== tile.id));
    setBankLetters((prev) => [...prev, tile]);
  };

  const handleCheck = () => {
    if (status !== "playing") return;
    const attempt = selectedLetters.map((t) => t.char).join("");
    const word = currentWord.word;

    if (attempt === word) {
      // correct!
      setScore((s) => s + 20);
      setFlashSuccess(true);
      setStatus("success");
      setTimeout(() => {
        setFlashSuccess(false);
        const next = wordIndex + 1;
        if (next >= WORDS.length) {
          setStatus("done");
        } else {
          setWordIndex(next);
        }
      }, 1500);
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setFlashError(true);
      setTimeout(() => setFlashError(false), 600);

      if (newMistakes >= 3) {
        // reveal answer
        setShowAnswer(true);
        setStatus("reveal");
        setTimeout(() => {
          const next = wordIndex + 1;
          if (next >= WORDS.length) {
            setStatus("done");
          } else {
            setWordIndex(next);
          }
        }, 2500);
      }
    }
  };

  const handleClear = () => {
    if (status !== "playing") return;
    const all = [...selectedLetters, ...bankLetters];
    setBankLetters(shuffleArray(all));
    setSelectedLetters([]);
  };

  useEffect(() => {
    if (status === "done") sfx.completion();
  }, [status]);

  if (status === "done") {
    return (
      <>
        <style>{`
          @keyframes wg-pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .wg-done-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 20px;
            animation: wg-pop 0.5s ease forwards;
          }
          .wg-done-emoji { font-size: 64px; }
          .wg-done-title { font-size: 28px; font-weight: 800; color: #4c8df6; }
          .wg-done-score { font-size: 22px; font-weight: 700; color: #333; }
          .wg-done-btn {
            background: #4c8df6;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 40px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 10px;
            box-shadow: 0 4px 14px rgba(76,141,246,0.4);
          }
          .wg-done-btn:active { transform: scale(0.96); }
        `}</style>
        <div className="wg-done-container">
          <div className="wg-done-emoji">🎉</div>
          <div className="wg-done-title">Selesai!</div>
          <div className="wg-done-score">Skor kamu: {score} poin</div>
          <button className="wg-done-btn" onClick={onComplete}>
            Lanjut →
          </button>
        </div>
      </>
    );
  }

  const wordLen = currentWord.word.length;

  return (
    <>
      <style>{`
        @keyframes wg-success-flash {
          0%,100% { background: #e3eeff; }
          50% { background: #c3f7c3; }
        }
        @keyframes wg-error-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes wg-tile-pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wg-reveal-bounce {
          0% { transform: translateY(-20px); opacity: 0; }
          60% { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        .wg-wrapper {
          background:
            radial-gradient(circle at 8% 12%, rgba(255,255,255,.9) 0 42px, transparent 43px),
            radial-gradient(circle at 92% 18%, rgba(255,255,255,.75) 0 54px, transparent 55px),
            linear-gradient(180deg, #dceaff 0%, #eef5ff 58%, #e8f7ed 100%);
          min-height: 100vh;
          padding: 26px 18px 34px;
          font-family: 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          transition: background 0.4s;
        }
        .wg-wrapper.flash-success {
          animation: wg-success-flash 1.5s ease;
        }
        .wg-header {
          width: 100%;
          max-width: 760px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,.94);
          border: 3px solid #4c8df6;
          border-radius: 22px;
          padding: 16px 22px;
          box-shadow: 0 6px 0 rgba(76,141,246,.25), 0 10px 20px rgba(76,141,246,.12);
        }
        .wg-header-level { font-size: 14px; color: #666; font-weight: 600; }
        .wg-header-score { font-size: 16px; font-weight: 800; color: #4c8df6; }
        .wg-header-mistakes { font-size: 14px; color: #e55; font-weight: 600; }
        .wg-hint-box {
          background: rgba(255,255,255,.96);
          border: 3px solid #8c5e3c;
          border-radius: 24px;
          padding: 22px 28px;
          text-align: center;
          box-shadow: 0 7px 0 rgba(140,94,60,.2), 0 12px 22px rgba(76,141,246,.12);
          max-width: 760px;
          width: 100%;
        }
        .wg-hint-emoji { font-size: 64px; margin-bottom: 8px; }
        .wg-hint-text { font-size: 18px; color: #4a3728; font-weight: 700; }
        .wg-slots {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 760px;
          width: 100%;
        }
        .wg-slot {
          width: 62px;
          height: 72px;
          border-radius: 14px;
          border: 2.5px dashed #4c8df6;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: #4c8df6;
          cursor: pointer;
          transition: transform 0.1s, border-color 0.2s;
          box-shadow: 0 2px 6px rgba(76,141,246,0.08);
        }
        .wg-slot.filled {
          border-color: #4c8df6;
          border-style: solid;
          background: #4c8df6;
          color: white;
          animation: wg-tile-pop 0.2s ease;
        }
        .wg-slot.filled:active { transform: scale(0.9); }
        .wg-slot.shake {
          animation: wg-error-shake 0.5s ease;
        }
        .wg-reveal-word {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          animation: wg-reveal-bounce 0.5s ease forwards;
        }
        .wg-reveal-letter {
          width: 48px;
          height: 56px;
          border-radius: 10px;
          background: #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: #333;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .wg-reveal-label {
          font-size: 13px;
          color: #e55;
          font-weight: 700;
          text-align: center;
          margin-bottom: 4px;
        }
        .wg-bank-label {
          font-size: 13px;
          color: #888;
          font-weight: 600;
          text-align: center;
          width: 100%;
        }
        .wg-bank {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 760px;
          width: 100%;
          min-height: 70px;
          background: white;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(76,141,246,0.1);
        }
        .wg-bank-tile {
          width: 62px;
          height: 72px;
          border-radius: 14px;
          background: #4c8df6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(76,141,246,0.3);
          transition: transform 0.1s;
          animation: wg-tile-pop 0.2s ease;
        }
        .wg-bank-tile:active { transform: scale(0.9); }
        .wg-actions {
          display: flex;
          gap: 10px;
          max-width: 760px;
          width: 100%;
        }
        .wg-btn-check {
          flex: 2;
          background: #4c8df6;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(76,141,246,0.35);
          transition: transform 0.1s;
        }
        .wg-btn-check:active { transform: scale(0.96); }
        .wg-btn-check:disabled { background: #aac5f8; cursor: not-allowed; box-shadow: none; }
        .wg-btn-clear {
          flex: 1;
          background: white;
          color: #4c8df6;
          border: 2px solid #4c8df6;
          border-radius: 50px;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .wg-btn-clear:active { transform: scale(0.96); }
        .wg-success-msg {
          font-size: 20px;
          font-weight: 800;
          color: #2b8c2b;
          text-align: center;
          animation: wg-reveal-bounce 0.4s ease;
        }
        .wg-progress {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .wg-progress-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #c5d8fc;
          transition: background 0.3s;
        }
        .wg-progress-dot.done { background: #4c8df6; }
      `}</style>

      <div className={`wg-wrapper${flashSuccess ? " flash-success" : ""}`}>
        {/* Header */}
        <div className="wg-header">
          <span className="wg-header-level">Kata ke-{wordIndex + 1} dari {WORDS.length}</span>
          <span className="wg-header-score">⭐ {score} poin</span>
          <span className="wg-header-mistakes">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i}>{i < mistakes ? "💔" : "❤️"}</span>
            ))}
          </span>
        </div>

        {/* Progress dots */}
        <div className="wg-progress">
          {WORDS.map((_, i) => (
            <div
              key={i}
              className={`wg-progress-dot${i < wordIndex ? " done" : ""}`}
            />
          ))}
        </div>

        {/* Hint */}
        <div className="wg-hint-box">
          <div className="wg-hint-emoji">{currentWord.emoji}</div>
          <div className="wg-hint-text">💡 {currentWord.hint}</div>
        </div>

        {/* Target slots or reveal */}
        {status === "reveal" || showAnswer ? (
          <div>
            <div className="wg-reveal-label">Jawaban: </div>
            <div className="wg-reveal-word">
              {currentWord.word.split("").map((ch, i) => (
                <div key={i} className="wg-reveal-letter">{ch}</div>
              ))}
            </div>
          </div>
        ) : status === "success" ? (
          <>
            <div className="wg-slots">
              {selectedLetters.map((tile, i) => (
                <div key={tile.id} className="wg-slot filled">{tile.char}</div>
              ))}
            </div>
            <div className="wg-success-msg">✅ Benar! +20 poin 🎉</div>
          </>
        ) : (
          <div className={`wg-slots${flashError ? " shake" : ""}`}>
            {Array.from({ length: wordLen }, (_, i) => {
              const tile = selectedLetters[i];
              return (
                <div
                  key={i}
                  className={`wg-slot${tile ? " filled" : ""}`}
                  onClick={() => tile && handleSelectedClick(tile)}
                >
                  {tile ? tile.char : ""}
                </div>
              );
            })}
          </div>
        )}

        {/* Bank */}
        {status === "playing" && (
          <>
            <div className="wg-bank-label">Ketuk huruf untuk menyusun kata:</div>
            <div className="wg-bank">
              {bankLetters.map((tile) => (
                <div
                  key={tile.id}
                  className="wg-bank-tile"
                  onClick={() => handleBankClick(tile)}
                >
                  {tile.char}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="wg-actions">
              <button className="wg-btn-clear" onClick={handleClear}>
                🔄 Ulang
              </button>
              <button
                className="wg-btn-check"
                onClick={handleCheck}
                disabled={selectedLetters.length !== wordLen}
              >
                ✔ Cek Jawaban
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
