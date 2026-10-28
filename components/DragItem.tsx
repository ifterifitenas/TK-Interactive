"use client";
import { useRef, useState } from "react";
import type { Item } from "@/lib/data";
import { sfx } from "@/lib/sfx";

type Props = {
  item: Item;
  targetRef: React.RefObject<HTMLElement | null>;
  onDrop: (item: Item) => void;
  disabled?: boolean;
};

// Bisa diseret (mouse & layar sentuh) ke sasaran, atau cukup diketuk.
export default function DragItem({ item, targetRef, onDrop, disabled }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);

  const end = (e: React.PointerEvent, cancelled = false) => {
    if (!start.current) return;
    const r = targetRef.current?.getBoundingClientRect();
    const inside = !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const hit = !moved.current || inside; // ketukan singkat dianggap menjatuhkan ke sasaran
    start.current = null;
    setDrag(false);
    setPos({ x: 0, y: 0 });
    if (!cancelled && hit) onDrop(item);
  };

  return (
    <button
      type="button"
      className={`item ${drag ? "dragging" : ""}`}
      disabled={disabled}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${drag ? 1.12 : 1})`, touchAction: "none" }}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        moved.current = false;
        setDrag(true);
        sfx.tap();
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (Math.hypot(dx, dy) > 8) moved.current = true;
        setPos({ x: dx, y: dy });
      }}
      onPointerUp={(e) => end(e)}
      onPointerCancel={(e) => end(e, true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) onDrop(item);
        }
      }}
    >
      <span className="e" aria-hidden>{item.emoji}</span>
      <span className="l">{item.label}</span>
    </button>
  );
}
