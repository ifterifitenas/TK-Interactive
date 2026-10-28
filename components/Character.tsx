export type Mood = "idle" | "happy" | "sad" | "wave";

// Karakter beranimasi. Ganti `key` dari luar untuk memutar ulang animasi reaksi.
export default function Character({ emoji, mood = "idle", size = "7rem" }: { emoji: string; mood?: Mood; size?: string }) {
  return (
    <span className={`char ${mood}`} style={{ fontSize: size }} aria-hidden>
      {emoji}
    </span>
  );
}
