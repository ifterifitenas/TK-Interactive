"use client";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { HABITS, TOTAL } from "@/lib/data";
import { useProgress } from "@/lib/progress";

export default function Koleksi() {
  const { done } = useProgress();
  const text = done.length === 0
    ? "Halo, Anak Hebat! Ayo kumpulkan semua tujuh bintang!"
    : `Halo, Anak Hebat! Kamu sudah mengumpulkan ${done.length} dari ${TOTAL} bintang!`;
  return (
    <>
      <TopBar title="Koleksi Bintang" back="/menu" speakText={text} />
      <section className="panel stack">
        <div className="profile">
          <span className="hero-big" aria-hidden>🧒</span>
          <div>
            <h2>Halo, Anak Hebat!</h2>
            <p>Ayo kumpulkan semua {TOTAL} bintang! ({done.length}/{TOTAL})</p>
          </div>
        </div>
        <div className="stars" aria-label={`${done.length} dari ${TOTAL} bintang`}>
          {HABITS.map((h) => (
            <span key={h.id} className={done.includes(h.id) ? "" : "star-off"} aria-hidden>⭐</span>
          ))}
        </div>
        <h3>Koleksi Lencana</h3>
        <div className="grid-badges">
          {HABITS.map((h) => {
            const got = done.includes(h.id);
            return (
              <div key={h.id} className={`badge ${got ? "" : "locked"}`} style={{ "--tile": h.color, "--soft": h.soft } as React.CSSProperties}>
                <span className="badge-emoji" aria-hidden>{got ? h.badge.emoji : "🔒"}</span>
                {h.badge.name}
              </div>
            );
          })}
        </div>
      </section>
      <BottomNav />
    </>
  );
}
