"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Character from "@/components/Character";
import type { Habit } from "@/lib/data";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeak } from "@/lib/speak";
import { CAST, PLACES, STORIES } from "@/lib/stories";

// Pemutar cerita bergaya game novel: latar, karakter, kotak dialog, teks mengetik,
// narasi suara otomatis. Ketuk panggung atau kotak dialog untuk lanjut.
export default function StoryPlayer({ habit: h }: { habit: Habit }) {
  const scenes = STORIES[h.id] ?? [];
  const [i, setI] = useState(0);
  const [n, setN] = useState(0); // jumlah huruf yang sudah tampil
  const scene = scenes[i];

  const total = scene?.text.length ?? 0;
  const typing = n < total;
  const last = i === scenes.length - 1;

  // Efek mengetik
  useEffect(() => {
    if (!scene) return;
    setN(0);
    const len = scene.text.length;
    const id = setInterval(() => {
      setN((c) => {
        if (c >= len) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 32);
    return () => clearInterval(id);
  }, [i, scene]);

  // Narasi otomatis tiap scene
  useEffect(() => {
    if (!scene) return;
    const t = setTimeout(() => speak(scene.text), 350);
    return () => clearTimeout(t);
  }, [i, scene]);

  useEffect(() => () => stopSpeak(), []);

  const next = () => {
    if (!scene) return;
    sfx.tap();
    if (typing) return setN(total);
    if (!last) setI(i + 1);
  };
  const prev = () => {
    if (i === 0) return;
    sfx.tap();
    setI(i - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "A") return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!scene) return null;
  const place = PLACES[scene.place];
  const speakerEmoji = scene.speaker ? CAST[scene.speaker] : null;

  return (
    <div className="story-view" style={{ "--tile": h.color, "--soft": h.soft } as React.CSSProperties}>
      <div className="story-meta">
        <div className="story-habit-badge"><span aria-hidden>{h.emoji}</span><strong>Pulau {h.id} • {h.title}</strong></div>
        <div className="story-progress" aria-label={`Adegan ${i + 1} dari ${scenes.length}`}>
          {scenes.map((_, k) => (
            <span key={k} className={`story-step ${k < i ? "done" : ""} ${k === i ? "current" : ""}`} aria-hidden>
              {k < i ? "✓" : k === i ? "★" : k + 1}
            </span>
          ))}
          <strong>Adegan {i + 1}/{scenes.length}</strong>
        </div>
        <button className="story-audio" onClick={() => speak(scene.text)} aria-label="Dengarkan cerita">
          <span aria-hidden>🔊</span><strong>DENGARKAN CERITA</strong>
        </button>
      </div>

      <div className="story-stage" key={i} style={{ background: place.bg }} onClick={next} role="button" tabIndex={0} aria-label="Ketuk untuk lanjut">
        <div className="story-sky-deco story-deco-left" aria-hidden>{place.deco[0]}</div>
        <div className="story-sky-deco story-deco-right" aria-hidden>{place.deco[1]}</div>
        <div className="story-window" aria-hidden><span>☀️</span></div>
        <div className="story-stage-label" aria-hidden><span>☀️</span> Pukul 06.00 Pagi</div>
        {scene.prop && <div className="story-prop" aria-hidden>{scene.prop}</div>}
        <div className="story-floor" aria-hidden><span /><span /><span /><span /><span /></div>
        <div className="story-cast">
          {scene.cast.map((e) => {
            const cls = speakerEmoji === null ? "" : e === speakerEmoji ? "speaking" : "dim";
            const name = e === "👦" ? "Bima" : e === "👧" ? "Sari" : e === "👩" ? "Ibu" : e === "👨" ? "Bapak" : e === "👩‍🏫" ? "Bu Guru" : "Dodi";
            return (
              <div key={e} className={`story-character ${cls}`}>
                <div className="story-character-card"><Character emoji={e} size="clamp(7rem, 19vw, 12rem)" />{speakerEmoji === e && <span className="story-speaking-badge">💬 Bicara</span>}</div>
                <span className="story-name">{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="story-dialog" onClick={next}>
        <div className="story-dialog-head">
          <span className="story-speaker">{scene.speaker ?? "Narator"}</span>
          <button className="story-read" onClick={(event) => { event.stopPropagation(); speak(scene.text); }} aria-label="Dengarkan dialog">🔊 Dengarkan suara</button>
        </div>
        <p>
          “{scene.text.slice(0, n)}<span className="story-ghost">{scene.text.slice(n)}</span>”
        </p>
        <span className="story-dialog-hint">{typing ? "Dengarkan ceritanya..." : last ? "Sekarang waktunya bermain!" : "Ketuk untuk melanjutkan"}</span>
      </div>

      <div className="story-controls">
        <Link className="story-map-btn" href="/menu"><span aria-hidden>←</span><strong>PETA PULAU</strong></Link>
        <div className="story-dots" aria-label={`Bagian ${i + 1} dari ${scenes.length}`}>
          {scenes.map((_, k) => <span key={k} className={k === i ? "active" : k < i ? "passed" : ""} aria-hidden />)}
        </div>
        {last && !typing ? (
          <Link className="story-main-btn" href={`/kebiasaan/${h.id}/aktivitas`} onClick={() => sfx.tap()}><strong>MAIN</strong><span aria-hidden>▶</span></Link>
        ) : (
          <button className="story-next-btn" onClick={next} aria-label="Lanjut"><strong>LANJUT</strong><span aria-hidden>→</span></button>
        )}
      </div>
    </div>
  );
}
