"use client";
import { useEffect, useState } from "react";
import { isMuted, setMuted } from "@/lib/sound";
import { stopSpeak } from "@/lib/speak";

export default function SoundToggle() {
  const [off, setOff] = useState(false);
  useEffect(() => setOff(isMuted()), []);

  const toggle = () => {
    const next = !off;
    setOff(next);
    setMuted(next);
    if (next) stopSpeak();
  };

  return (
    <button className="icon-btn" onClick={toggle} aria-pressed={off} aria-label={off ? "Nyalakan suara" : "Matikan suara"}>
      {off ? "🔕" : "🔔"}
    </button>
  );
}
