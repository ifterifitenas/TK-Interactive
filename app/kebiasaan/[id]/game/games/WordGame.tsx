"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

interface WordGameProps {
  onComplete: () => void;
}

type FruitRound = {
  items: string[];
  answer: number;
};

const FRUIT_TYPES = ["🍎", "🍌", "🍊", "🍇", "🍓", "🥝", "🍍", "🍑"];
const GAME_TIME = 60;

const INITIAL_ROUND: FruitRound = {
  items: ["🍎", "🍎", "🍎"],
  answer: 3,
};

function createRandomRound(): FruitRound {
  const fruit = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
  const answer = 3 + Math.floor(Math.random() * 8);
  return {
    items: Array.from({ length: answer }, () => fruit),
    answer,
  };
}

export default function WordGame({ onComplete }: WordGameProps) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState<FruitRound>(INITIAL_ROUND);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [answers, setAnswers] = useState({ 1: "", 2: "" });
  const [feedback, setFeedback] = useState({ 1: "", 2: "" });
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    setRound(createRandomRound());
  }, []);

  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          finishedRef.current = true;
          setFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished, started]);

  useEffect(() => {
    if (finished) sfx.completion();
  }, [finished]);

  const resetGame = () => {
    finishedRef.current = false;
    setRound(createRandomRound());
    setTimeLeft(GAME_TIME);
    setScores({ 1: 0, 2: 0 });
    setAnswers({ 1: "", 2: "" });
    setFeedback({ 1: "", 2: "" });
    setFinished(false);
    setStarted(true);
  };

  const pressNumber = (player: 1 | 2, number: number) => {
    if (finishedRef.current) return;
    setFeedback((value) => ({ ...value, [player]: "" }));
    setAnswers((value) => ({
      ...value,
      [player]: value[player].length >= 2 ? value[player] : `${value[player]}${number}`,
    }));
  };

  const clearAnswer = (player: 1 | 2) => {
    if (finishedRef.current) return;
    setAnswers((value) => ({ ...value, [player]: "" }));
    setFeedback((value) => ({ ...value, [player]: "" }));
  };

  const submitAnswer = (player: 1 | 2) => {
    if (!answers[player] || finishedRef.current) return;

    if (Number(answers[player]) === round.answer) {
      setScores((value) => ({ ...value, [player]: value[player] + 10 }));
      setFeedback((value) => ({ ...value, [player]: "Benar! +10 poin" }));
      sfx.correct();
      setAnswers({ 1: "", 2: "" });
      setFeedback({ 1: "", 2: "" });
      setRound(createRandomRound());
    } else {
      setFeedback((value) => ({ ...value, [player]: "Belum tepat, coba lagi!" }));
      sfx.wrong();
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff8ec",
    border: "3px solid #c8a870",
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(160,120,80,.22)",
  };

  if (finished) {
    const winner =
      scores[1] === scores[2]
        ? "Seri!"
        : scores[1] > scores[2]
          ? "Pemain 1 Menang!"
          : "Pemain 2 Menang!";

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(160,120,80,.75)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
        <div style={{ ...cardStyle, padding: "36px 32px", textAlign: "center", maxWidth: 420, width: "calc(100% - 32px)", boxSizing: "border-box" }}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <h2 style={{ color: "#a07850", margin: "12px 0 6px", fontSize: 28, fontWeight: 800 }}>{winner}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "18px 0" }}>
            <div style={{ background: "#e3eeff", borderRadius: 14, padding: 14 }}>
              <strong>Pemain 1</strong>
              <div style={{ color: "#5579b8", fontSize: 30, fontWeight: 900 }}>{scores[1]}</div>
            </div>
            <div style={{ background: "#fce9b0", borderRadius: 14, padding: 14 }}>
              <strong>Pemain 2</strong>
              <div style={{ color: "#a07850", fontSize: 30, fontWeight: 900 }}>{scores[2]}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={resetGame} style={{ padding: "12px 28px", borderRadius: 12, border: "2px solid #a07850", background: "#fff", color: "#7a5a34", fontWeight: 800, cursor: "pointer" }}>Main Lagi</button>
            <button onClick={onComplete} style={{ padding: "12px 28px", borderRadius: 12, border: 0, background: "#a07850", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 3px 10px rgba(160,120,80,.4)" }}>Lanjut</button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div style={{ minHeight: "100%", background: "linear-gradient(180deg, #f7f1df 0%, #fffaf0 58%, #edf7e8 100%)", padding: 16, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#5a4630" }}>
        <div style={{ width: "min(100%, 760px)", margin: "0 auto" }}>
          <div style={{ ...cardStyle, padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 64 }}>🍎🍌🍊</div>
            <h2 style={{ color: "#a07850", margin: "10px 0 6px", fontSize: 28 }}>Duel Hitung Buah</h2>
            <p style={{ color: "#7a5a34", lineHeight: 1.5 }}>Dua pemain bermain bersamaan selama 1 menit. Hitung buah yang acak, masukkan jawaban, dan kumpulkan poin terbanyak.</p>
            <button onClick={() => { setRound(createRandomRound()); setStarted(true); }} style={{ marginTop: 12, padding: "13px 34px", border: 0, borderRadius: 14, background: "#a07850", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(160,120,80,.35)" }}>Mulai</button>
          </div>
        </div>
      </div>
    );
  }

  const keypad = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const renderCalculator = (player: 1 | 2) => (
    <div style={{ ...cardStyle, padding: 14, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong style={{ color: player === 1 ? "#5579b8" : "#a07850" }}>Pemain {player}</strong>
        <strong style={{ color: player === 1 ? "#5579b8" : "#a07850", fontSize: 20 }}>⭐ {scores[player]}</strong>
      </div>
      <div style={{ minHeight: 54, display: "flex", alignItems: "center", justifyContent: "center", background: "#4b4b45", color: "#fff", borderRadius: 12, fontSize: 30, fontWeight: 900, letterSpacing: 4 }}>
        {answers[player] || "?"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginTop: 8 }}>
        {keypad.map((number) => (
          <button key={number} onClick={() => pressNumber(player, number)} style={{ height: 48, border: "2px solid #c8a870", borderRadius: 10, background: "#fff", color: "#5a4630", fontSize: 18, fontWeight: 900, cursor: "pointer" }}>{number}</button>
        ))}
        <button onClick={() => clearAnswer(player)} style={{ height: 48, border: "2px solid #c8a870", borderRadius: 10, background: "#fff", color: "#a07850", fontSize: 13, fontWeight: 900, cursor: "pointer" }}>Hapus</button>
        <button onClick={() => pressNumber(player, 0)} style={{ height: 48, border: "2px solid #c8a870", borderRadius: 10, background: "#fff", color: "#5a4630", fontSize: 18, fontWeight: 900, cursor: "pointer" }}>0</button>
        <button
          onClick={() => submitAnswer(player)}
          disabled={!answers[player]}
          style={{ height: 48, border: 0, borderRadius: 10, background: answers[player] ? "#a07850" : "#d9cdb9", color: "#fff", fontSize: 13, fontWeight: 900, cursor: answers[player] ? "pointer" : "not-allowed" }}
        >
          Jawab
        </button>
      </div>
      <div style={{ minHeight: 24, marginTop: 8, color: feedback[player].startsWith("Benar") ? "#397c38" : "#795a28", fontSize: 13, fontWeight: 800 }}>
        {feedback[player]}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(180deg, #f7f1df 0%, #fffaf0 58%, #edf7e8 100%)", padding: 16, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#5a4630" }}>
      <div style={{ width: "min(100%, 760px)", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: timeLeft <= 5 ? "#c43b00" : "#a07850", color: "#fff", border: "3px solid #7a5a34", borderRadius: 16, padding: "12px 18px", fontWeight: 900 }}>
          <span>⏱️ Waktu</span>
          <span style={{ fontSize: 24 }}>{timeLeft} detik</span>
        </div>
        <div style={{ height: 14, marginTop: 12, overflow: "hidden", borderRadius: 99, background: "#eadfca", border: "2px solid #c8a870" }}>
          <div style={{ height: "100%", width: `${(timeLeft / GAME_TIME) * 100}%`, background: timeLeft <= 5 ? "#c43b00" : "#a07850", transition: "width 1s linear" }} />
        </div>

        <div style={{ ...cardStyle, marginTop: 12, padding: "16px", textAlign: "center" }}>
          <h3 style={{ color: "#7a5a39", margin: "0 0 10px" }}>Hitung banyak buah!</h3>
          <div style={{ minHeight: 112, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, padding: 12, borderRadius: 16, background: "#fff" }}>
            {round.items.map((fruit, index) => (
              <span key={index} style={{ fontSize: 46, lineHeight: 1 }}>{fruit}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
          {renderCalculator(1)}
          {renderCalculator(2)}
        </div>
      </div>
    </div>
  );
}