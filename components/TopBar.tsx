import Link from "next/link";
import SpeakButton from "./SpeakButton";

type Props = { title: string; back?: string; speakText?: string };

export default function TopBar({ title, back, speakText }: Props) {
  return (
    <header className="topbar">
      <div className="side">
        {back ? (
          <Link className="icon-btn" href={back} aria-label="Kembali">←</Link>
        ) : (
          <Link className="icon-btn" href="/" aria-label="Beranda">🏠</Link>
        )}
      </div>
      <h1>{title}</h1>
      <div className="side end">
        {speakText && <SpeakButton text={speakText} />}
      </div>
    </header>
  );
}
