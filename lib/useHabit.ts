"use client";
import { useParams } from "next/navigation";
import { HABITS } from "./data";

export function useHabit() {
  const { id } = useParams<{ id: string }>();
  return HABITS.find((h) => String(h.id) === id);
}
