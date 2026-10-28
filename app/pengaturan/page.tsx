"use client";
import BottomNav from "@/components/BottomNav";
import SoundToggle from "@/components/SoundToggle";
import TopBar from "@/components/TopBar";
import { useProgress } from "@/lib/progress";

export default function Pengaturan() {
  const { done, reset } = useProgress();
  return (
    <>
      <TopBar title="Pengaturan" back="/" />
      <section className="panel stack">
        <div className="setting">
          <div>
            <h2>Suara</h2>
            <p>Narasi dan efek suara. Matikan bila dipakai di tempat tenang.</p>
          </div>
          <SoundToggle />
        </div>
        <h2>Mulai dari awal</h2>
        <p>Progres belajar disimpan di perangkat ini. Hapus progres untuk mengosongkan semua bintang.</p>
        <button
          className="btn btn-soft"
          disabled={done.length === 0}
          onClick={() => { if (window.confirm("Hapus semua bintang dan mulai dari awal?")) reset(); }}
        >
          Hapus Progres
        </button>
      </section>
      <BottomNav />
    </>
  );
}
