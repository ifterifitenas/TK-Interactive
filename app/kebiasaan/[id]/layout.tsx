import { HABITS } from "@/lib/data";

export function generateStaticParams() {
  return HABITS.map((h) => ({ id: String(h.id) }));
}

export default function HabitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

