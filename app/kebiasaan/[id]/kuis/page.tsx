"use client";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Character, { type Mood } from "@/components/Character";
import TopBar from "@/components/TopBar";
import type { Habit } from "@/lib/data";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speak";
import { useHabit } from "@/lib/useHabit";

export default function KuisPage() {
  const h = useHabit();
  if (!h) notFound();
  return <Kuis habit={h} />;
}

function Kuis({ habit: h }: { habit: Habit }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [reaction, setReaction] = useState<{ mood: Mood; n: number }>({ mood: "idle", n: 0 });

  useEffect(() => () => clearTimeout(timer.current), []);

  const q = h.quiz[i];
  const last = i === h.quiz.length - 1;

  const next = () => {
    clearTimeout(timer.current);
    if (last) {
      router.push(`/kebiasaan/${h.id}/reward`);
      return;
    }
    setI((x) => x + 1);
    setRight(false);
    setWrong([]);
    setReaction((r) => ({ mood: "idle", n: r.n + 1 }));
  };

  const choose = (k: number) => {
    if (right || wrong.includes(k)) return;
    if (k === q.answer) {
      setRight(true);
      setReaction((r) => ({ mood: "happy", n: r.n + 1 }));
      sfx.correct();
      speak("Benar! Hebat!");
      timer.current = setTimeout(next, 2300);
    } else {
      setWrong((w) => [...w, k]);
      setReaction((r) => ({ mood: "sad", n: r.n + 1 }));
      sfx.wrong();
      speak("Coba lagi ya!");
    }
  };

  return (
    <>
      <TopBar title={h.title} back={`/kebiasaan/${h.id}/aktivitas`} speakText={q.q} />
      <section className="panel stack">
        <div className="dots" aria-label={`Soal ${i + 1} dari ${h.quiz.length}`}>
          {h.quiz.map((_, k) => (
            <span key={k} className={k < i || (k === i && right) ? "dot on" : "dot"} aria-hidden />
          ))}
        </div>
        <div className="quiz-top">
          <div className="mini-char">
            <Character key={reaction.n} emoji={h.hero} mood={reaction.mood} size="5rem" />
            {reaction.mood === "happy" && <span className="bubble">🎉</span>}
            {reaction.mood === "sad" && <span className="bubble">🤔</span>}
          </div>
          <p className="prompt">{q.q}</p>
        </div>

        <div className="options">
          {q.options.map((o, k) => {
            const state = right && k === q.answer ? "right" : wrong.includes(k) ? "wrong" : "";
            return (
              <button key={k} className={`opt ${state}`} onClick={() => choose(k)} disabled={right || wrong.includes(k)}>
                <span className="e" aria-hidden>{o.emoji}</span>
                {o.label}
              </button>
            );
          })}
        </div>

        {right && (
          <div className="actions">
            <button className="btn btn-yellow big" onClick={next} aria-label={last ? "Selesai" : "Soal berikutnya"}>▶</button>
          </div>
        )}
      </section>
    </>
  );
}
