"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Island from "@/components/Island";
import { SEQUENTIAL_UNLOCK } from "@/lib/config";
import { HABITS } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeak } from "@/lib/speak";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

// Pemilih pulau: satu pulau di tengah, geser kiri-kanan (sentuh, trackpad, mouse,
// tombol panah, atau keyboard). Pulau tetangga mengintip sebagai petunjuk geser.
export default function IslandCarousel() {
  const router = useRouter();
  const { done, ready } = useProgress();
  const track = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLButtonElement | null)[]>([]);
  const raf = useRef(0);
  const inited = useRef(false);
  const first = useRef(true);
  const [index, setIndex] = useState(0);
  const last = HABITS.length - 1;

  const isUnlocked = (id: number) => !SEQUENTIAL_UNLOCK || id === 1 || done.includes(id - 1) || done.includes(id);

  const go = (i: number, smooth = true) => {
    const t = track.current;
    const s = slides.current[i];
    if (!t || !s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - t.clientWidth / 2, behavior: smooth && !reduce ? "smooth" : "auto" });
  };

  const nearest = () => {
    const t = track.current;
    if (!t) return 0;
    const c = t.scrollLeft + t.clientWidth / 2;
    let best = 0;
    let bd = Infinity;
    slides.current.forEach((s, i) => {
      if (!s) return;
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setIndex(nearest()));
  };

  const open = (i: number) => {
    const h = HABITS[i];
    if (!isUnlocked(h.id)) {
      sfx.wrong();
      speak("Selesaikan pulau sebelumnya dulu ya!");
      return;
    }
    sfx.tap();
    router.push(`/kebiasaan/${h.id}/video`);
  };

  const pick = (i: number) => {
    if (i !== index) {
      sfx.tap();
      go(i);
    } else {
      open(i);
    }
  };

  // Awal: langsung ke pulau yang sedang dikerjakan.
  useEffect(() => {
    if (!ready || inited.current) return;
    inited.current = true;
    const cur = HABITS.findIndex((h) => !done.includes(h.id));
    const i = cur === -1 ? last : cur;
    go(i, false);
    setIndex(i);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sebut nama pulau saat berpindah (setelah berhenti menggeser).
  useEffect(() => {
    if (!ready) return;
    const h = HABITS[index];
    const t = setTimeout(() => {
      speak(first.current ? `Geser untuk memilih pulau. ${h.title}` : h.title);
      first.current = false;
    }, 500);
    return () => clearTimeout(t);
  }, [index, ready]);

  useEffect(() => () => stopSpeak(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(Math.min(index + 1, last));
      else if (e.key === "ArrowLeft") go(Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cur = HABITS[index];
  const curLocked = !isUnlocked(cur.id);

  return (
    <div className="isle">
      <div className="sea">
        <div className="isle-track" ref={track} onScroll={onScroll}>
          <span className="isle-spacer" aria-hidden />
          {HABITS.map((h, i) => {
            const locked = !isUnlocked(h.id);
            const isDone = done.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                ref={(el) => { slides.current[i] = el; }}
                className={`isle-slide ${i === index ? "active" : ""} ${locked ? "locked" : ""}`}
                onClick={() => pick(i)}
                aria-label={`Pulau ${h.id}: ${h.title}${locked ? ", terkunci" : isDone ? ", selesai" : ""}`}
              >
                <span className="isle-num">{h.id}</span>
                <Island id={h.id} done={isDone} locked={locked} />
                <span className="isle-title">{h.title}</span>
              </button>
            );
          })}
          <span className="isle-spacer" aria-hidden />
        </div>
      </div>

      <p className="isle-hint" role="status">{curLocked ? "Selesaikan pulau sebelumnya dulu ya!" : ""}</p>

      <div className="dots" aria-label={`Pulau ${index + 1} dari ${HABITS.length}`}>
        {HABITS.map((h, i) => (
          <button
            key={h.id}
            type="button"
            className={`dot ${done.includes(h.id) ? "on" : ""} ${!isUnlocked(h.id) ? "locked" : ""} ${i === index ? "cur" : ""}`}
            onClick={() => { sfx.tap(); go(i); }}
            aria-label={`Ke pulau ${h.id}`}
          />
        ))}
      </div>

      <div className="isle-controls">
        <button className="round-nav" onClick={() => { sfx.tap(); go(index - 1); }} disabled={index === 0} aria-label="Pulau sebelumnya">
          <Chevron dir="left" />
        </button>
        <button className="listen-btn" onClick={() => speak(cur.title)} aria-label="Dengar cerita"><span aria-hidden>🔊</span><strong>DENGAR CERITA</strong></button>
        <button className="btn btn-yellow big play-btn" aria-disabled={curLocked} onClick={() => open(index)}><span aria-hidden>▶</span> Main Sekarang</button>
        <button className="round-nav" onClick={() => { sfx.tap(); go(index + 1); }} disabled={index === last} aria-label="Pulau berikutnya">
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}
