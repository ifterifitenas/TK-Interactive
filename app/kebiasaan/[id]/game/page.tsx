"use client";
import { notFound, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { useHabit } from "@/lib/useHabit";
import AlarmGame from "./games/AlarmGame";
import MazeGame from "./games/MazeGame";
import BallCatchGame from "./games/BallCatchGame";
import FoodSortGame from "./games/FoodSortGame";
import WordGame from "./games/WordGame";
import SimonGame from "./games/SimonGame";
import SleepGame from "./games/SleepGame";
export default function GamePage() {
  const habit = useHabit();
  if (!habit) notFound();

  const router = useRouter();
  const handleComplete = () => {
    router.push(`/kebiasaan/${habit.id}/kuis`);
  };

  const gameMap: Record<number, React.ReactNode> = {
    1: <AlarmGame onComplete={handleComplete} />,
    2: <MazeGame onComplete={handleComplete} />,
    3: <BallCatchGame onComplete={handleComplete} />,
    4: <FoodSortGame onComplete={handleComplete} />,
    5: <WordGame onComplete={handleComplete} />,
    6: <SimonGame onComplete={handleComplete} />,
    7: <SleepGame onComplete={handleComplete} />,
  };

  const game = gameMap[habit.id];
  if (!game) notFound();

  return (
    <div className="game-page">
      <TopBar title={habit.title} back={`/kebiasaan/${habit.id}/video`} />
      <main className="game-main">{game}</main>
    </div>
  );
}
