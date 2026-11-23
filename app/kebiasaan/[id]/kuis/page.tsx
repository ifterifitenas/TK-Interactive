"use client";

import { notFound } from "next/navigation";
import QuizGame from "@/components/QuizGame";
import { useHabit } from "@/lib/useHabit";

export default function KuisPage() {
  const h = useHabit();
  if (!h) notFound();

  return <QuizGame habit={h} />;
}
