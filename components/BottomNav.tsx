"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", icon: "🏠", label: "Beranda" },
  { href: "/koleksi", icon: "⭐", label: "Koleksi" },
  { href: "/pengaturan", icon: "⚙️", label: "Pengaturan" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={path === i.href ? "active" : ""}>
          <span aria-hidden>{i.icon}</span>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
