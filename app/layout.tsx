import type { Metadata, Viewport } from "next";
import { ProgressProvider } from "@/lib/progress";
import "./globals.css";

export const metadata: Metadata = {
  title: "7 KAIH – Tujuh Kebiasaan Anak Indonesia Hebat",
  description: "Media interaktif untuk belajar 7 Kebiasaan Anak Indonesia Hebat.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ProgressProvider>
          <div className="shell">{children}</div>
        </ProgressProvider>
      </body>
    </html>
  );
}
