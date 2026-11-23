"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import PuzzleGame from "@/components/PuzzleGame";
import QuizGame from "@/components/QuizGame";
import { TOTAL } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { useHabit } from "@/lib/useHabit";

// Game Utama (Game 1 yang dimainkan pertama)
import AlarmGame from "./games/AlarmGame";
import MazeGame from "./games/MazeGame";
import BallCatchGame from "./games/BallCatchGame";
import FoodSortGame from "./games/FoodSortGame";
import WordGame from "./games/WordGame";
import SimonGame from "./games/SimonGame";
import SleepGame from "./games/SleepGame";

// Game Tambahan Mini yang bisa diundi oleh Roulette
import MorningRoutineGame from "./games/MorningRoutineGame";
import WorshipGame from "./games/WorshipGame";
import RunnerGame from "./games/RunnerGame";
import CatchGame from "./games/CatchGame";
import StudyQuizGame from "./games/StudyQuizGame";
import HelpingGame from "./games/HelpingGame";
import StarCountGame from "./games/StarCountGame";

import GameRoulette from "./GameRoulette";
import type { RouletteOption } from "./rouletteConfig";

type GameStage = "first_game" | "roulette" | "second_game";

export default function GamePage() {
  const habit = useHabit();
  const router = useRouter();
  const { complete } = useProgress();

  const [stage, setStage] = useState<GameStage>("first_game");
  const [selectedBonusGame, setSelectedBonusGame] = useState<RouletteOption | null>(null);

  if (!habit) notFound();

  // Selesai Game Utama -> Lanjut ke Roulette
  const handleFirstGameComplete = () => {
    setStage("roulette");
  };

  // Selesai Game Tambahan -> Langsung lanjut ke MATERI BARU
  const handleSecondGameComplete = () => {
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

  // Render Game Tambahan yang dipilih Roulette (Puzzle / Kuis / Mini Game)
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
            {stage === "second_game" ? selectedBonusGame?.emoji || "⭐" : "🎲"}
          </span>
          <span className="stage-text">Game Tambahan</span>
        </div>
      </div>

      <main className="game-main">
        {/* Tahap 1: Game Utama */}
        {stage === "first_game" && mainGame}

        {/* Tahap 2: Roulette Pengundi Game Tambahan */}
        {stage === "roulette" && (
          <GameRoulette
            habitId={habit.id}
            habitTitle={habit.title}
            habitColor={habit.color}
            onSelectGame={handleSelectRouletteGame}
          />
        )}

        {/* Tahap 3: Game Tambahan yang Ditentukan oleh Roulette */}
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
    </div>
  );
}
