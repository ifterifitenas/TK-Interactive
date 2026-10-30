"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useHabit } from "@/lib/useHabit";

export default function VideoPage() {
  const habit = useHabit();
  const [videoError, setVideoError] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  if (!habit) notFound();

  const hasVideo = habit.id === 1;

  return (
    <>
      <main className="video-page">
        <div className="video-background" aria-hidden>
          <img src="/video-bg.png" alt="" />
        </div>
        <div className="video-page-overlay" aria-hidden />
        <header className="video-header">
          <Link className="video-back" href="/menu" aria-label="Kembali ke pilihan pulau">←</Link>
          <div className="video-sign">
            <span>Pulau {habit.id}: {habit.title}</span>
          </div>
          <span className="video-sparkle" aria-hidden>✦</span>
        </header>

        <section className="video-content">
          <h1>{habit.title}</h1>
          {hasVideo && !videoError ? (
            <div className="video-frame">
              <div className="video-frame-corner top-left" />
              <div className="video-frame-corner top-right" />
              <div className="video-frame-corner bottom-left" />
              <div className="video-frame-corner bottom-right" />
              <video
                controls
                playsInline
                preload="metadata"
                poster="/bangun-pagi-poster.jpg"
                src="/bangun-pagi-web.mp4"
                onError={() => setVideoError(true)}
                onEnded={() => setVideoWatched(true)}
              >
                Browser Anda tidak mendukung pemutaran video.
              </video>
            </div>
          ) : (
            <div className="video-unavailable">
              <span aria-hidden>🎬</span>
              <strong>{hasVideo ? "Video tidak dapat dimuat" : "Video sedang disiapkan"}</strong>
              <p>{hasVideo ? "Periksa kembali file video lalu coba lagi." : "Video untuk kebiasaan ini akan segera hadir."}</p>
            </div>
          )}
          {videoWatched && (
            <Link className="video-menu-button" href={`/kebiasaan/${habit.id}/aktivitas`}>
              MAIN <span aria-hidden>▶</span>
            </Link>
          )}
        </section>
      </main>
      <style jsx global>{`
        html,
        body {
          overflow: hidden;
        }

        .shell:has(.video-page) {
          width: 100%;
          max-width: none;
          height: 100svh;
          min-height: 0;
          margin: 0;
          padding: 0;
          gap: 0;
          overflow: hidden;
          background: transparent !important;
          box-shadow: none !important;
        }

        .video-page {
          width: 100%;
          height: 100svh;
          min-height: 0;
          overflow: hidden;
          box-shadow: none !important;
        }

        .video-background,
        .video-background img,
        .video-page-overlay {
          box-shadow: none !important;
          filter: none !important;
        }

        .video-page * {
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
