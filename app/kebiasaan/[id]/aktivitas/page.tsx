"use client";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import type { Habit, SequenceStep } from "@/lib/data";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speak";
import { useHabit } from "@/lib/useHabit";

const shuffled = <T,>(steps: T[]) => [...steps.slice(2), ...steps.slice(0, 2)];

export default function AktivitasPage() {
  const h = useHabit();
  if (!h) notFound();
  return <Aktivitas habit={h} />;
}

function Aktivitas({ habit: h }: { habit: Habit }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragging = useRef<{ step: SequenceStep; from: number | null } | null>(null);
  const [slots, setSlots] = useState<(SequenceStep | null)[]>(() => h.activity.sequence.map(() => null));
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [message, setMessage] = useState("Tarik gambar ke kotak urutan yang kosong.");
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = () => {
    clearTimeout(timer.current);
    router.push(`/kebiasaan/${h.id}/kuis`);
  };

  const dropAtPoint = (x: number, y: number) => {
    const active = dragging.current;
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-sequence-slot]");
    const to = target ? Number(target.dataset.sequenceSlot) : -1;
    if (!active || to < 0) return;
    setSlots((current) => {
      const next = [...current];
      if (active.from !== null) next[active.from] = current[to];
      next[to] = active.step;
      return next;
    });
    setChecked(false);
    setMessage("Bagus! Lanjutkan menyusun gambar lainnya.");
    sfx.tap();
  };

  const startDrag = (step: SequenceStep, from: number | null, event: React.PointerEvent<HTMLElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = { step, from };
    setDraggingLabel(step.label);
  };

  const finishDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dropAtPoint(event.clientX, event.clientY);
    dragging.current = null;
    setDraggingLabel(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const checkOrder = () => {
    if (slots.some((step) => !step)) {
      setChecked(true);
      setMessage("Lengkapi semua kotak urutan terlebih dahulu.");
      return;
    }
    const correct = slots.every((step, index) => step?.label === h.activity.sequence[index].label);
    setChecked(true);
    if (correct) {
      setDone(true);
      setMessage("Hebat! Urutannya benar.");
      sfx.correct();
      speak("Hebat! Urutannya benar!");
      timer.current = setTimeout(go, 2300);
    } else {
      setMessage("Belum tepat. Coba susun lagi urutannya.");
      sfx.wrong();
      speak("Coba susun lagi ya!");
    }
  };

  return (
    <div className="activity-page">
      <TopBar title={h.title} back={`/kebiasaan/${h.id}`} speakText={h.activity.prompt} />
      <main className="activity-main">
        <section className="sequence-intro" aria-label="Instruksi aktivitas">
          <div className="sequence-intro-icon" aria-hidden>🧩</div>
          <div><span className="sequence-kicker">AYO SUSUN!</span><p>{h.activity.prompt}</p></div>
        </section>

        <section className="sequence-board" aria-label="Slot urutan aktivitas">
          <div className="sequence-board-heading"><strong>URUTKAN KEGIATANNYA</strong></div>
          <div className="sequence-cards">
            {slots.map((step, index) => (
              <article
                className={`sequence-card sequence-card-${index + 1}${step ? "" : " is-empty"}${draggingLabel === step?.label ? " is-dragging" : ""}`}
                data-sequence-slot={index}
                key={step?.label ?? `empty-${index}`}
                onPointerDown={(event) => step && startDrag(step, index, event)}
                onPointerUp={finishDrag}
                onPointerCancel={() => { dragging.current = null; setDraggingLabel(null); }}
                aria-label={step ? `${index + 1}. ${step.label}` : `Slot urutan ${index + 1} kosong`}
              >
                <div className="sequence-picture" aria-hidden>{step?.emoji ?? "?"}</div>
                <div className="sequence-number">{index + 1}</div>
                <h2>{step?.label ?? "Kosong"}</h2>
              </article>
            ))}
          </div>
        </section>

        <section className="sequence-pool" aria-label="Kumpulan gambar aktivitas">
          <strong>PILIH GAMBAR</strong>
          <div className="sequence-pool-cards">
            {shuffled(h.activity.sequence).map((step) => {
              const placed = slots.some((slot) => slot?.label === step.label);
              return (
                <button
                  type="button"
                  className={`sequence-pool-card${placed ? " is-placed" : ""}${draggingLabel === step.label ? " is-dragging" : ""}`}
                  key={step.label}
                  disabled={done || placed}
                  onPointerDown={(event) => startDrag(step, null, event)}
                  onPointerUp={finishDrag}
                  onPointerCancel={() => { dragging.current = null; setDraggingLabel(null); }}
                >
                  <span aria-hidden>{step.emoji}</span><b>{step.label}</b>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="activity-footer sequence-footer">
          <div className={`activity-feedback${done ? " success" : checked ? " wrong" : ""}`} role="status">
            <span aria-hidden>{done ? "🎉" : checked ? "💭" : "👆"}</span>{message}
          </div>
          <div className="activity-actions">
            <button className="activity-check" onClick={done ? go : checkOrder}>{done ? "LANJUT ▶" : "CEK URUTAN ✓"}</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
