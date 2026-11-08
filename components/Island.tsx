// Komponen pulau: menampilkan gambar ilustrasi per-kebiasaan di dalam lingkaran.
// Props: id (nomor pulau), image (path gambar dari /public), done, locked.

export default function Island({
  image,
  done,
  locked,
}: {
  id: number;
  image: string;
  done: boolean;
  locked: boolean;
}) {
  return (
    <div className="isle-artwork" aria-hidden>
      <img src={image} alt="" />
      {done && <span className="isle-artwork-star">★</span>}
      {locked && (
        <span className="isle-artwork-locked">
          <b aria-label="Terkunci">
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="10" width="12" height="10" rx="2" />
              <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
              <circle cx="12" cy="15" r="1" />
            </svg>
          </b>
        </span>
      )}
    </div>
  );
}
