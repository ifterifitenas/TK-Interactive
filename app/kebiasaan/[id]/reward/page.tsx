"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import Character from "@/components/Character";
import { HABITS, TOTAL } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeak } from "@/lib/speak";
import { useHabit } from "@/lib/useHabit";

const COLORS = ["#ffc83d", "#4c8df6", "#5cc26a", "#f26d6d", "#9b8cf0"];

export default function RewardPage() {
  const h = useHabit();
  if (!h) notFound();
  return <Reward id={h.id} />;
}

function Reward({ id }: { id: number }) {
  const h = HABITS.find((x) => x.id === id)!;
  const { complete } = useProgress();
  const isLast = id === TOTAL;

  useEffect(() => {
    complete(id);
    sfx.cheer();
    const t = setTimeout(() => speak(`Hebat! Kamu mendapat ${h.badge.name}!`), 700);
    return () => {
      clearTimeout(t);
      stopSpeak();
    };
  }, [id, h.badge.name, complete]);

  return (
    <section className="reward reward-page">
      <div className="confetti" aria-hidden>
        {Array.from({ length: 28 }).map((_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.23) % 3}s`, background: COLORS[i % COLORS.length] }} />
        ))}
      </div>
      <h1>Hebat!</h1>
      <Character emoji={h.hero} mood="happy" size="7rem" />
      <div className="badge-got" style={{ "--tile": h.color, "--soft": h.soft } as React.CSSProperties}>
        <span aria-hidden>{h.badge.emoji}</span>
        <strong>{h.badge.name}</strong>
      </div>
      <div className="actions">
        {isLast ? (
          <Link className="btn btn-yellow big" href="/koleksi" aria-label="Lihat koleksi bintang">⭐</Link>
        ) : (
          <Link className="btn btn-navy big" href={`/kebiasaan/${id + 1}`} aria-label="Kebiasaan berikutnya">▶</Link>
        )}
        <Link className="btn btn-soft big" href="/menu" aria-label="Kembali ke menu">🏠</Link>
      </div>
    </section>
  );
}
