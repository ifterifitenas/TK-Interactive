"use client";
import { useParams } from "next/navigation";
import { HABITS } from "./data";

export function useHabit() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  if (!id) return HABITS[0];
  return HABITS.find((h) => String(h.id) === id);
}
