import { isMuted } from "./sound";

// Suara narasi memakai Web Speech API bawaan browser (tanpa file audio).
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  if (isMuted()) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  u.rate = 0.9;
  u.pitch = 1.15;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
