"use client";

import React, { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import PuzzleGame from "@/components/PuzzleGame";
import QuizGame from "@/components/QuizGame";
import { TOTAL } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { useHabit } from "@/lib/useHabit";
import { sfx } from "@/lib/sfx";

// Game Utama
import AlarmGame from "./games/AlarmGame";
import MazeGame from "./games/MazeGame";
import BallCatchGame from "./games/BallCatchGame";
import FoodSortGame from "./games/FoodSortGame";
import WordGame from "./games/WordGame";
import SimonGame from "./games/SimonGame";
import SleepGame from "./games/SleepGame";

// Game Tambahan
import MorningRoutineGame from "./games/MorningRoutineGame";
import WorshipGame from "./games/WorshipGame";
import RunnerGame from "./games/RunnerGame";
import CatchGame from "./games/CatchGame";
import StudyQuizGame from "./games/StudyQuizGame";
import HelpingGame from "./games/HelpingGame";
import StarCountGame from "./games/StarCountGame";

import GameRoulette from "./GameRoulette";
import type { RouletteOption } from "./rouletteConfig";

// ── Konfeti ───────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#ffc83d","#f26d6d","#5cc26a","#4c8df6","#9b8cf0","#ff9f43","#fff"];

function ConfettiPiece({ i }: { i: number }) {
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  return (
    <i
      aria-hidden
      style={{
        position: "absolute",
        left: `${(i * 37 + 11) % 100}%`,
        top: `-${8 + (i % 5) * 3}px`,
        width: 8 + (i % 5) * 3,
        height: (8 + (i % 5) * 3) * 0.6,
        background: color,
        borderRadius: i % 3 === 0 ? "50%" : 2,
        animationDelay: `${(i * 0.17) % 2}s`,
      }}
      className="win-confetti-piece"
    />
  );
}

// ── Popup Reward ──────────────────────────────────────────────────────────────
function GameWinPopup({
  badge,
  color,
  hero,
  onNext,
  onHome,
}: {
  badge: { name: string; emoji: string };
  color: string;
  hero: string;
  onNext: () => void;
  onHome: () => void;
}) {
  return (
    <div className="win-overlay" role="dialog" aria-modal aria-label="Game selesai!">
      <div className="win-confetti" aria-hidden>
        {Array.from({ length: 32 }).map((_, i) => (
          <ConfettiPiece key={i} i={i} />
        ))}
      </div>

      <div className="win-card">
        <div className="win-emoji-big" aria-hidden>{hero}</div>
        <div className="win-stars" aria-hidden>⭐⭐⭐</div>

        <div
          className="win-badge-box"
          style={{ "--tile": color, borderColor: `${color}55` } as React.CSSProperties}
        >
          <span className="win-badge-emoji" aria-hidden>{badge.emoji}</span>
          <strong className="win-badge-name">{badge.name}</strong>
        </div>

        <h2 className="win-title">Luar Biasa! 🎉</h2>
        <p className="win-desc">Kamu berhasil menyelesaikan semua tantangan!</p>

        <div className="win-buttons">
          <button
            className="win-btn-secondary"
            onClick={onHome}
            aria-label="Kembali ke menu"
          >
            🏠 Menu
          </button>
          <button
            className="win-btn"
            style={{ background: color }}
            onClick={onNext}
          >
            Lanjut ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type GameStage = "first_game" | "roulette" | "second_game";

// ── Komponen Utama ────────────────────────────────────────────────────────────
export default function GamePage() {
  const habit = useHabit();
  const router = useRouter();
  const { complete } = useProgress();

  const [stage, setStage] = useState<GameStage>("first_game");
  const [selectedBonusGame, setSelectedBonusGame] = useState<RouletteOption | null>(null);
  // Popup reward ditampilkan sebagai overlay di ATAS game (tanpa unmount game)
  const [showWinPopup, setShowWinPopup] = useState(false);

  if (!habit) notFound();

  // Selesai Game Utama -> Lanjut ke Roulette
  const handleFirstGameComplete = () => {
    setStage("roulette");
  };

  // Selesai Game Tambahan -> Tampilkan popup reward DI ATAS (tanpa unmount game)
  const handleSecondGameComplete = () => {
    setShowWinPopup(true);
    setTimeout(() => sfx.clap(), 100);
  };

  // Dari popup reward -> lanjut ke materi/habit berikutnya
  const handleGoNext = () => {
    complete(habit.id);
    if (habit.id < TOTAL) {
      router.push(`/kebiasaan/${habit.id + 1}/video`);
    } else {
      router.push("/koleksi");
    }
  };

  // Pilih game dari hasil putaran Roulette
  const handleSelectRouletteGame = (option: RouletteOption) => {
    setSelectedBonusGame(option);
    setStage("second_game");
  };

  // Render Game Tambahan
  const renderBonusGameByKey = (key: string, onComplete: () => void) => {
    switch (key) {
      case "puzzle":
        return (
          <PuzzleGame
            habitId={habit.id}
            image={habit.image}
            title={habit.title}
            color={habit.color}
            soft={habit.soft}
            badge={habit.badge}
            onComplete={onComplete}
            hideTopBar
          />
        );
      case "kuis":
        return <QuizGame habit={habit} onComplete={onComplete} hideTopBar />;
      case "morningRoutine":
        return <MorningRoutineGame onComplete={onComplete} />;
      case "worship":
        return <WorshipGame onComplete={onComplete} />;
      case "runner":
        return <RunnerGame onComplete={onComplete} />;
      case "catch":
        return <CatchGame onComplete={onComplete} />;
      case "studyQuiz":
        return <StudyQuizGame onComplete={onComplete} />;
      case "helping":
        return <HelpingGame onComplete={onComplete} />;
      case "starCount":
        return <StarCountGame onComplete={onComplete} />;
      default:
        return (
          <PuzzleGame
            habitId={habit.id}
            image={habit.image}
            title={habit.title}
            color={habit.color}
            soft={habit.soft}
            badge={habit.badge}
            onComplete={onComplete}
            hideTopBar
          />
        );
    }
  };

  // Game Utama per habit
  const mainGameMap: Record<number, React.ReactNode> = {
    1: <AlarmGame onComplete={handleFirstGameComplete} />,
    2: <MazeGame onComplete={handleFirstGameComplete} />,
    3: <BallCatchGame onComplete={handleFirstGameComplete} />,
    4: <FoodSortGame onComplete={handleFirstGameComplete} />,
    5: <WordGame onComplete={handleFirstGameComplete} />,
    6: <SimonGame onComplete={handleFirstGameComplete} />,
    7: <SleepGame onComplete={handleFirstGameComplete} />,
  };

  const mainGame = mainGameMap[habit.id];
  if (!mainGame) notFound();

  // Konfigurasi TopBar
  let topBarTitle = habit.title;
  let topBarSpeak = `Mainkan game utama ${habit.title}!`;
  if (stage === "roulette") {
    topBarTitle = `🎡 Roulette Game: ${habit.title}`;
    topBarSpeak = "Game utama selesai! Putar roulette untuk mengundi game tambahanmu!";
  } else if (stage === "second_game") {
    topBarTitle = selectedBonusGame
      ? `${selectedBonusGame.emoji} Game Tambahan: ${selectedBonusGame.title}`
      : `Game Tambahan: ${habit.title}`;
    topBarSpeak = selectedBonusGame
      ? `Mainkan ${selectedBonusGame.title}!`
      : `Mainkan game tambahan ${habit.title}!`;
  }

  return (
    <div className="game-page">
      <TopBar
        title={topBarTitle}
        back={`/kebiasaan/${habit.id}/video`}
        speakText={topBarSpeak}
      />

      {/* Stage Indicator Bar */}
      <div className="game-stage-indicator" aria-label="Alur Permainan">
        <div
          className={`stage-pill ${
            stage === "first_game" ? "active" : "completed"
          }`}
        >
          <span className="stage-icon">
            {stage === "first_game" ? "🎮" : "✅"}
          </span>
          <span className="stage-text">Game Utama</span>
        </div>

        <div className="stage-connector" />

        <div
          className={`stage-pill ${
            stage === "roulette"
              ? "active"
              : stage === "second_game"
              ? "completed"
              : "waiting"
          }`}
        >
          <span className="stage-icon">
            {stage === "second_game" ? "✅" : "🎡"}
          </span>
          <span className="stage-text">Roulette</span>
        </div>

        <div className="stage-connector" />

        <div
          className={`stage-pill ${
            stage === "second_game" ? "active" : "waiting"
          }`}
        >
          <span className="stage-icon">
            {stage === "second_game"
              ? selectedBonusGame?.emoji || "⭐"
              : "🎲"}
          </span>
          <span className="stage-text">Game Tambahan</span>
        </div>
      </div>

      <main className="game-main">
        {/* Tahap 1: Game Utama */}
        {stage === "first_game" && mainGame}

        {/* Tahap 2: Roulette */}
        {stage === "roulette" && (
          <GameRoulette
            habitId={habit.id}
            habitTitle={habit.title}
            habitColor={habit.color}
            onSelectGame={handleSelectRouletteGame}
          />
        )}

        {/* Tahap 3: Game Tambahan */}
        {stage === "second_game" && selectedBonusGame && (
          <div className="second-game-container">
            <div
              className="second-game-banner"
              style={{ borderLeftColor: selectedBonusGame.color }}
            >
              <span className="second-game-badge">Game Tambahan Terpilih dari Roulette</span>
              <h2 className="second-game-title">
                {selectedBonusGame.emoji} {selectedBonusGame.title}
              </h2>
              <p className="second-game-desc">
                {selectedBonusGame.description}
              </p>
            </div>
            {renderBonusGameByKey(
              selectedBonusGame.gameKey,
              handleSecondGameComplete
            )}
          </div>
        )}
      </main>

      {/* ── Popup Reward muncul sebagai overlay DI ATAS game ── */}
      {showWinPopup && (
        <GameWinPopup
          badge={habit.badge}
          color={habit.color}
          hero={habit.hero}
          onNext={handleGoNext}
          onHome={() => router.push("/menu")}
        />
      )}
    </div>
  );
}
