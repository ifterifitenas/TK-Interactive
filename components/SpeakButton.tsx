"use client";
import { useEffect } from "react";
import { speak, stopSpeak } from "@/lib/speak";

// Membacakan teks otomatis saat layar muncul (atau teks berganti).
// Tombol 🔊 untuk mengulang. Catatan: browser baru mengizinkan suara
// setelah anak/guru menyentuh layar sekali.
export default function SpeakButton({ text, auto = true }: { text: string; auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => speak(text), 450);
    return () => {
      clearTimeout(t);
      stopSpeak();
    };
  }, [text, auto]);

  return (
    <button className="icon-btn" onClick={() => speak(text)} aria-label="Ulangi suara">
      🔊
    </button>
  );
}
