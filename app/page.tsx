import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import SoundToggle from "@/components/SoundToggle";
import SpeakButton from "@/components/SpeakButton";

const WELCOME = "Selamat datang! Yuk, jelajahi tujuh kebiasaan baik untuk menjadi anak hebat!";

export default function Home() {
  return (
    <>
      <main className="home-screen">
        <div className="home-art" aria-hidden>
          <picture>
            <source media="(max-width: 600px)" srcSet="/hero-portrait.png" />
            <img src="/hero-landscape.png" alt="" />
          </picture>
          <div className="home-light" />
        </div>

        <header className="home-header">
          <div className="home-header-row">
            <SoundToggle />
          </div>

          <div className="title-board">
            <span className="board-rope left-rope" />
            <span className="board-rope right-rope" />
            <h1 aria-label="7 KAIH"><span>★</span> 7 KAIH <span>★</span></h1>
            <p>7 Kebiasaan Anak Indonesia Hebat</p>
          </div>

          <div className="greeting">
            <span /> “Halo teman-teman! Ayo main bersama!” <SpeakButton text={WELCOME} auto={false} />
          </div>
        </header>

        <section className="home-actions">
          <Link href="/menu" className="start-sign">
            <span className="start-icon">▶</span>
            <strong>Mulai</strong>
          </Link>
          <p className="start-hint"></p>
        </section>
        <BottomNav />
      </main>
    </>
  );
}
