"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Character, { type Mood } from "@/components/Character";
import TopBar from "@/components/TopBar";
import type { Habit, QuestionChoice, QuestionFind, QuestionMatch, QuestionTrueFalse } from "@/lib/data";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speak";

// ── helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── sub-components ───────────────────────────────────────────────────────────

/** 🎯 Pilihan Ganda */
function GameChoice({
  q,
  onDone,
  color,
}: {
  q: QuestionChoice;
  onDone: (ok: boolean) => void;
  color: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (k: number) => {
    if (picked === q.answer || wrong.includes(k)) return;
    if (k === q.answer) {
      setPicked(k);
      sfx.correct();
      speak("Benar! Hebat!");
      timer.current = setTimeout(() => onDone(true), 1800);
    } else {
      setWrong((w) => [...w, k]);
      sfx.wrong();
      speak("Coba lagi ya!");
      onDone(false);
    }
  };

  return (
    <div className="game-choice">
      {q.options.map((o, k) => {
        const isRight = picked === q.answer && k === q.answer;
        const isWrong = wrong.includes(k);
        return (
          <button
            key={k}
            className={`game-opt ${isRight ? "right" : isWrong ? "wrong" : ""}`}
            style={isRight ? { borderColor: color, background: `${color}22` } : {}}
            onClick={() => choose(k)}
            disabled={picked === q.answer || wrong.includes(k)}
          >
            <span className="game-opt-emoji">{o.emoji}</span>
            <span className="game-opt-label">{o.label}</span>
            {isRight && <span className="game-badge correct-badge">✓</span>}
            {isWrong && <span className="game-badge wrong-badge">✗</span>}
          </button>
        );
      })}
    </div>
  );
}

/** ✅ Benar atau Salah */
function GameTrueFalse({
  q,
  onDone,
  color,
}: {
  q: QuestionTrueFalse;
  onDone: (ok: boolean) => void;
  color: string;
}) {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (val: boolean) => {
    if (answered !== null) return;
    setAnswered(val);
    if (val === q.answer) {
      sfx.correct();
      speak("Benar! Hebat!");
      timer.current = setTimeout(() => onDone(true), 1800);
    } else {
      sfx.wrong();
      speak("Coba lagi ya!");
      onDone(false);
    }
  };

  const resultColor = answered === null ? "" : answered === q.answer ? "#4cb963" : "#ff6b57";

  return (
    <div className="game-truefalse">
      <div
        className="game-tf-emoji"
        style={answered !== null ? { borderColor: resultColor, background: `${resultColor}22` } : {}}
      >
        {q.emoji}
      </div>
      <div className="game-tf-buttons">
        <button
          className={`game-tf-btn benar ${answered === true ? (q.answer === true ? "right" : "wrong") : ""}`}
          style={answered === true && q.answer === true ? { borderColor: color, background: `${color}22` } : {}}
          onClick={() => choose(true)}
          disabled={answered !== null}
        >
          ✅ Benar
        </button>
        <button
          className={`game-tf-btn salah ${answered === false ? (q.answer === false ? "right" : "wrong") : ""}`}
          style={answered === false && q.answer === false ? { borderColor: color, background: `${color}22` } : {}}
          onClick={() => choose(false)}
          disabled={answered !== null}
        >
          ❌ Salah
        </button>
      </div>
      {answered !== null && (
        <p className={`game-tf-result ${answered === q.answer ? "ok" : "bad"}`}>
          {answered === q.answer
            ? "🎉 Benar! Kamu hebat!"
            : `Jawabannya: ${q.answer ? "✅ BENAR" : "❌ SALAH"}`}
        </p>
      )}
    </div>
  );
}

/** 🎯 Pasangkan */
function GameMatch({
  q,
  onDone,
  color,
}: {
  q: QuestionMatch;
  onDone: (ok: boolean) => void;
  color: string;
}) {
  const rightItems = useMemo(
    () => shuffle(q.pairs.map((p, i) => ({ ...p.right, pairIdx: i }))),
    [q]
  );
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [doneAnim, setDoneAnim] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const pickLeft = (idx: number) => {
    if (matched.includes(idx)) return;
    sfx.tap();
    setLeftSel(leftSel === idx ? null : idx);
  };

  const pickRight = (ridx: number) => {
    if (leftSel === null) return;
    const pairIdx = rightItems[ridx].pairIdx;
    if (pairIdx === leftSel) {
      sfx.correct();
      const newMatched = [...matched, leftSel];
      setMatched(newMatched);
      setLeftSel(null);
      if (newMatched.length === q.pairs.length) {
        setDoneAnim(true);
        speak("Hebat! Semua pasangan benar!");
        timer.current = setTimeout(() => onDone(true), 1600);
      }
    } else {
      sfx.wrong();
      speak("Coba lagi ya!");
      setWrongRight(ridx);
      onDone(false);
      timer.current = setTimeout(() => {
        setWrongRight(null);
        setLeftSel(null);
      }, 800);
    }
  };

  return (
    <div className="game-match">
      <p className="game-match-hint">
        {leftSel !== null
          ? "👆 Sekarang ketuk pasangan yang cocok di kanan!"
          : "👈 Ketuk item di kiri, lalu pasangkan ke kanan!"}
      </p>
      <div className="game-match-grid">
        <div className="game-match-col">
          {q.pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            const isSel = leftSel === i;
            return (
              <button
                key={i}
                className={`game-match-item left-item ${isSel ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                style={
                  isMatched
                    ? { borderColor: "#4cb963", background: "#4cb96322" }
                    : isSel
                    ? { borderColor: color, background: `${color}22`, transform: "scale(1.05)" }
                    : {}
                }
                onClick={() => pickLeft(i)}
                disabled={isMatched}
              >
                <span className="match-emoji">{p.left.emoji}</span>
                <span className="match-label">{p.left.label}</span>
                {isMatched && <span className="match-tick">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="game-match-divider" aria-hidden>
          {q.pairs.map((_, i) => (
            <div
              key={i}
              className={`match-line-dot ${matched.includes(i) ? "lit" : ""}`}
              style={matched.includes(i) ? { background: color } : {}}
            />
          ))}
        </div>

        <div className="game-match-col">
          {rightItems.map((item, ridx) => {
            const isMatched = matched.includes(item.pairIdx);
            const isWrong = wrongRight === ridx;
            const isTargetable = leftSel !== null && !isMatched;
            return (
              <button
                key={ridx}
                className={`game-match-item right-item ${isMatched ? "matched" : ""} ${isWrong ? "wrong shake" : ""} ${isTargetable ? "targetable" : ""}`}
                style={
                  isMatched
                    ? { borderColor: "#4cb963", background: "#4cb96322" }
                    : isWrong
                    ? { borderColor: "#f26d6d", background: "#f26d6d22" }
                    : isTargetable
                    ? { borderColor: color }
                    : {}
                }
                onClick={() => pickRight(ridx)}
                disabled={isMatched}
              >
                <span className="match-emoji">{item.emoji}</span>
                <span className="match-label">{item.label}</span>
                {isMatched && <span className="match-tick">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
      {doneAnim && (
        <p className="game-match-done">🎉 Semua pasangan sudah benar!</p>
      )}
    </div>
  );
}

/** 🔍 Temukan yang Benar */
function GameFind({
  q,
  onDone,
  color,
}: {
  q: QuestionFind;
  onDone: (ok: boolean) => void;
  color: string;
}) {
  const items = useMemo(() => shuffle(q.items.map((it, i) => ({ ...it, origIdx: i }))), [q]);
  const totalCorrect = q.items.filter((it) => it.correct).length;
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const tap = (item: { emoji: string; label: string; correct: boolean; origIdx: number }) => {
    if (finished || found.includes(item.origIdx) || wrong.includes(item.origIdx)) return;
    if (item.correct) {
      const newFound = [...found, item.origIdx];
      setFound(newFound);
      sfx.correct();
      if (newFound.length === totalCorrect) {
        setFinished(true);
        speak("Hebat! Semua ditemukan!");
        timer.current = setTimeout(() => onDone(true), 1800);
      }
    } else {
      setWrong((w) => [...w, item.origIdx]);
      sfx.wrong();
      speak("Itu bukan yang benar, coba lagi!");
      onDone(false);
    }
  };

  return (
    <div className="game-find">
      <div className="game-find-counter">
        Ditemukan: <strong style={{ color }}>{found.length}</strong> / {totalCorrect}
      </div>
      <div className="game-find-grid">
        {items.map((item) => {
          const isFound = found.includes(item.origIdx);
          const isWrong = wrong.includes(item.origIdx);
          return (
            <button
              key={item.origIdx}
              className={`game-find-item ${isFound ? "found" : isWrong ? "wrong" : ""}`}
              style={isFound ? { borderColor: color, background: `${color}22` } : {}}
              onClick={() => tap(item)}
              disabled={isFound}
            >
              <span className="game-find-emoji">{item.emoji}</span>
              <span className="game-find-label">{item.label}</span>
              {isFound && <span className="game-badge correct-badge">✓</span>}
              {isWrong && <span className="game-badge wrong-badge">✗</span>}
            </button>
          );
        })}
      </div>
      {finished && <p className="game-find-done">🎉 Semua jawaban benar ditemukan!</p>}
    </div>
  );
}

// ── labels per type ───────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, { icon: string; name: string }> = {
  choice:    { icon: "🎯", name: "Pilihan Ganda" },
  truefalse: { icon: "✅", name: "Benar atau Salah" },
  match:     { icon: "🎯", name: "Pasangkan!" },
  find:      { icon: "🔍", name: "Temukan yang Benar" },
};

// ── Komponen utama kuis
export default function QuizGame({
  habit: h,
  onComplete,
  hideTopBar = false,
}: {
  habit: Habit;
  onComplete?: () => void;
  hideTopBar?: boolean;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [reaction, setReaction] = useState<{ mood: Mood; n: number }>({ mood: "idle", n: 0 });
  const [wrongCount, setWrongCount] = useState(0);

  const q = h.quiz[i];
  const last = i === h.quiz.length - 1;
  const typeInfo = TYPE_LABELS[q.type] ?? { icon: "❓", name: "Soal" };

  const handleDone = (ok: boolean) => {
    if (ok) {
      setReaction((r) => ({ mood: "happy", n: r.n + 1 }));
      setTimeout(() => {
        if (last) {
          sfx.completion();
          if (onComplete) {
            onComplete();
          } else {
            router.push(`/kebiasaan/${h.id}/puzzle`);
          }
        } else {
          setI((x) => x + 1);
          setWrongCount(0);
          setReaction((r) => ({ mood: "idle", n: r.n + 1 }));
        }
      }, 1900);
    } else {
      setWrongCount((c) => c + 1);
      setReaction((r) => ({ mood: "sad", n: r.n + 1 }));
      setTimeout(() => setReaction((r) => ({ mood: "idle", n: r.n + 1 })), 900);
    }
  };

  return (
    <div className="quiz-page">
      {!hideTopBar && (
        <TopBar title={h.title} back={`/kebiasaan/${h.id}/game`} speakText={q.q} />
      )}

      <section className="panel stack quiz-card">
        {/* Progress dots */}
        <div className="quiz-progress-bar" aria-label={`Soal ${i + 1} dari ${h.quiz.length}`}>
          {h.quiz.map((qq, k) => (
            <div
              key={k}
              className={`quiz-step-dot ${k < i ? "done" : k === i ? "active" : ""}`}
              style={k === i ? { background: h.color, borderColor: h.color } : {}}
              aria-hidden
            >
              {k < i ? "✓" : k + 1}
            </div>
          ))}
        </div>

        {/* Game type badge + question */}
        <div className="quiz-top">
          <div className="mini-char">
            <Character key={reaction.n} emoji={h.hero} mood={reaction.mood} size="5rem" />
            {reaction.mood === "happy" && <span className="bubble">🎉</span>}
            {reaction.mood === "sad" && <span className="bubble">🤔</span>}
          </div>
          <div className="quiz-question-wrap">
            <div className="quiz-type-row">
              <span className="quiz-type-badge" style={{ background: h.color }}>
                {typeInfo.icon} {typeInfo.name}
              </span>
              <span className="quiz-num-badge">Soal {i + 1}/{h.quiz.length}</span>
            </div>
            <p className="prompt">{q.q}</p>
          </div>
        </div>

        {/* Game area */}
        <div className="quiz-game-area" key={i}>
          {q.type === "choice" && (
            <GameChoice q={q} onDone={handleDone} color={h.color} />
          )}
          {q.type === "truefalse" && (
            <GameTrueFalse q={q} onDone={handleDone} color={h.color} />
          )}
          {q.type === "match" && (
            <GameMatch q={q} onDone={handleDone} color={h.color} />
          )}
          {q.type === "find" && (
            <GameFind q={q} onDone={handleDone} color={h.color} />
          )}
        </div>

        {wrongCount > 0 && reaction.mood !== "happy" && (
          <p className="quiz-feedback quiz-feedback-wrong">❌ Coba lagi ya, kamu pasti bisa!</p>
        )}
      </section>
    </div>
  );
}

