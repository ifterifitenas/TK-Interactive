"use client";
import { notFound } from "next/navigation";
import StoryPlayer from "@/components/StoryPlayer";
import TopBar from "@/components/TopBar";
import { useHabit } from "@/lib/useHabit";

// Cerita bergaya game novel. Alur: Cerita → Aktivitas → Kuis → Reward.
export default function Detail() {
  const h = useHabit();
  if (!h) notFound();
  return (
    <div className="story-page">
      <TopBar title={h.title} back="/menu" />
      <StoryPlayer key={h.id} habit={h} />
    </div>
  );
}
