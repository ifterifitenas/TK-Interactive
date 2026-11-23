"use client";

import { useEffect, useRef } from "react";
import { isMuted } from "@/lib/sound";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio("/background.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.05;
    audioRef.current = audio;

    const play = () => {
      if (isMuted() || startedRef.current) return;
      void audio.play()
        .then(() => {
          startedRef.current = true;
        })
        .catch(() => {});
    };

    const syncMute = (muted: boolean) => {
      if (muted) {
        audio.pause();
        startedRef.current = false;
      } else {
        void audio.play()
          .then(() => {
            startedRef.current = true;
          })
          .catch(() => {});
      }
    };

    const onMutedChange = (event: Event) => {
      syncMute((event as CustomEvent<boolean>).detail);
    };

    const onFirstInteraction = () => {
      play();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    if (!isMuted()) play();
    window.addEventListener("7kaih-muted-change", onMutedChange);
    window.addEventListener("pointerdown", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);

    return () => {
      audio.pause();
      audioRef.current = null;
      window.removeEventListener("7kaih-muted-change", onMutedChange);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  return null;
}
