"use client";

import { notFound } from "next/navigation";
import PuzzleGame from "@/components/PuzzleGame";
import { useHabit } from "@/lib/useHabit";

export default function PuzzlePage() {
  const h = useHabit();
  if (!h) notFound();

  return (
    <PuzzleGame
      habitId={h.id}
      image={h.image}
      title={h.title}
      color={h.color}
      soft={h.soft}
      badge={h.badge}
    />
  );
}
