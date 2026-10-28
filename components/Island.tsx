// Pulau sementara (placeholder) berupa SVG vektor. Setiap pulau punya siluet dan
// ikon berbeda. Ganti isi file ini dengan ilustrasi final (SVG/WebP) kapan saja:
// cukup pertahankan props { id, done, locked }.

const INK = "#1B2A4A";
const o = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round", strokeLinecap: "round" } as const;

function Ground({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <path d={d} fill="none" stroke="#fff" strokeWidth={18} strokeLinejoin="round" />
      <path d={d} fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </>
  );
}

function starPoints(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return pts.join(" ");
}

const ART: Record<number, () => React.ReactNode> = {
  // 1 Bangun Pagi: bukit dengan matahari terbit dan rumah
  1: () => (
    <>
      <g {...o}>
        <circle cx={205} cy={84} r={36} fill="#FFC72C" />
        {Array.from({ length: 8 }).map((_, k) => {
          const a = (k * Math.PI) / 4;
          return (
            <line
              key={k}
              x1={(205 + Math.cos(a) * 44).toFixed(1)}
              y1={(84 + Math.sin(a) * 44).toFixed(1)}
              x2={(205 + Math.cos(a) * 58).toFixed(1)}
              y2={(84 + Math.sin(a) * 58).toFixed(1)}
            />
          );
        })}
      </g>
      <Ground d="M26 196 C34 150 80 138 118 112 C150 90 196 98 228 126 C260 150 296 156 296 192 C296 218 240 226 160 226 C80 226 20 222 26 196 Z" fill="#6CC56A" />
      <g {...o}>
        <rect x={138} y={104} width={46} height={36} fill="#FFF6E3" />
        <polygon points="132,106 161,80 190,106" fill="#FF6B57" />
        <rect x={154} y={118} width={14} height={22} fill="#19A7B8" />
      </g>
    </>
  ),
  // 2 Rajin Belajar: rumah pohon sekolah dengan bendera pensil
  2: () => (
    <>
      <Ground d="M40 190 C30 150 70 130 110 132 C130 112 200 108 224 128 C268 128 300 156 292 192 C286 220 230 226 160 226 C90 226 46 220 40 190 Z" fill="#6CC56A" />
      <g {...o}>
        <rect x={148} y={96} width={24} height={70} fill="#B5793F" />
        <circle cx={160} cy={80} r={34} fill="#4CB963" />
        <circle cx={124} cy={102} r={26} fill="#4CB963" />
        <circle cx={198} cy={102} r={26} fill="#4CB963" />
        <rect x={138} y={64} width={44} height={30} fill="#FFC72C" />
        <polygon points="132,66 160,42 188,66" fill="#FF6B57" />
        <line x1={160} y1={42} x2={160} y2={14} />
        <polygon points="160,14 198,22 160,30" fill="#19A7B8" />
      </g>
    </>
  ),
  // 3 Makan Sehat: pulau berbentuk mangkuk buah
  3: () => (
    <>
      <g {...o}>
        <circle cx={108} cy={134} r={30} fill="#FF6B57" />
        <line x1={108} y1={104} x2={108} y2={92} />
        <ellipse cx={122} cy={94} rx={12} ry={6} fill="#4CB963" />
        <circle cx={164} cy={116} r={34} fill="#FF9A3D" />
        <circle cx={222} cy={134} r={28} fill="#9BD24C" />
        <line x1={222} y1={106} x2={222} y2={94} />
      </g>
      <Ground d="M28 148 L292 148 C292 200 240 226 160 226 C80 226 28 200 28 148 Z" fill="#7A5CD1" />
      <rect x={22} y={138} width={276} height={18} rx={9} fill="#5E43B5" {...o} />
    </>
  ),
  // 4 Bersosialisasi: alun-alun dengan empat anak bergandengan tangan
  4: () => {
    const xs = [92, 140, 188, 236];
    const cs = ["#FF6B57", "#19A7B8", "#FFC72C", "#7A5CD1"];
    return (
      <>
        <Ground d="M40 180 C40 140 90 118 160 118 C230 118 280 140 280 180 C280 212 230 226 160 226 C90 226 40 212 40 180 Z" fill="#F4D79A" />
        <g {...o}>
          {xs.slice(0, 3).map((x, k) => (
            <line key={k} x1={x + 13} y1={172} x2={xs[k + 1] - 13} y2={172} />
          ))}
          {xs.map((x, k) => (
            <g key={x}>
              <rect x={x - 13} y={156} width={26} height={38} rx={9} fill={cs[k]} />
              <circle cx={x} cy={140} r={14} fill="#F2C9A0" />
            </g>
          ))}
        </g>
      </>
    );
  },
  // 5 Bermain & Berolahraga: lapangan bola dengan gawang
  5: () => (
    <>
      <Ground d="M34 170 C34 140 70 128 110 128 L210 128 C250 128 286 140 286 170 C286 206 240 226 160 226 C80 226 34 206 34 170 Z" fill="#4CB963" />
      <g fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M160 136 V218" />
        <circle cx={160} cy={176} r={24} />
        <path d="M56 156 H92 V200 H56" />
      </g>
      <g {...o}>
        <path d="M70 150 V118 H124 V150" fill="none" stroke="#fff" strokeWidth={6} />
        <circle cx={228} cy={170} r={15} fill="#fff" />
        <polygon points={starPoints(228, 170, 7)} fill={INK} strokeWidth={2} />
      </g>
    </>
  ),
  // 6 Menjaga Kesehatan Diri: mercusuar sikat gigi dan gelembung sabun
  6: () => (
    <>
      <Ground d="M34 190 C28 160 70 150 100 150 C120 130 200 130 222 150 C262 150 296 166 290 194 C284 220 230 226 160 226 C90 226 40 222 34 190 Z" fill="#F4D79A" />
      <g {...o}>
        <path d="M142 178 L150 72 L174 72 L182 178 Z" fill="#FFF6E3" />
        <path d="M147 118 L177 118 L179 142 L145 142 Z" fill="#19A7B8" />
        <rect x={148} y={50} width={28} height={22} fill="#FFC72C" />
        {[152, 158, 164, 170].map((x) => (
          <line key={x} x1={x} y1={50} x2={x} y2={34} />
        ))}
        <circle cx={236} cy={152} r={20} fill="#E6F8FA" />
        <circle cx={258} cy={116} r={13} fill="#E6F8FA" />
        <circle cx={222} cy={112} r={9} fill="#E6F8FA" />
        <circle cx={66} cy={156} r={14} fill="#E6F8FA" />
      </g>
    </>
  ),
  // 7 Berpikir Kritis & Kreatif: bengkel dengan roket kardus dan bohlam
  7: () => (
    <>
      <Ground d="M30 186 C34 150 80 142 120 140 C140 128 190 128 212 140 C258 142 298 156 292 188 C288 218 230 226 160 226 C86 226 26 220 30 186 Z" fill="#6CC56A" />
      <g {...o}>
        <rect x={50} y={140} width={56} height={40} fill="#FFF6E3" />
        <polygon points="44,142 78,114 112,142" fill="#7A5CD1" />
        <rect x={69} y={154} width={18} height={26} fill="#19A7B8" />
        <polygon points="132,120 106,160 132,156" fill="#FF6B57" />
        <polygon points="188,120 214,160 188,156" fill="#FF6B57" />
        <path d="M160 34 C190 58 194 108 188 156 L132 156 C126 108 130 58 160 34 Z" fill="#E3B27A" />
        <circle cx={160} cy={92} r={14} fill="#BFE9EE" />
        <polygon points="146,156 160,190 174,156" fill="#FFC72C" />
        <rect x={238} y={142} width={10} height={34} fill="#B5793F" />
        <circle cx={243} cy={116} r={24} fill="#FFC72C" />
        <rect x={233} y={138} width={20} height={12} fill="#C9D3DD" />
      </g>
    </>
  ),
};

const CLOUD = [[88, 150, 44], [140, 128, 52], [200, 140, 50], [242, 162, 40], [120, 180, 40], [182, 182, 44]] as const;

function Cloud() {
  return (
    <g>
      <g fill="#FFF6E3" stroke={INK} strokeWidth={5}>
        {CLOUD.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} />)}
      </g>
      <g fill="#FFF6E3">
        {CLOUD.map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r - 2.5} />)}
      </g>
      <g transform="translate(160 152)">
        <path d="M-12 -2 V-14 a12 12 0 0 1 24 0 V-2" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <rect x={-20} y={-4} width={40} height={32} rx={7} fill={INK} />
        <circle cy={11} r={4} fill="#FFC72C" />
      </g>
    </g>
  );
}

function Flag() {
  return (
    <g {...o}>
      <line x1={270} y1={34} x2={270} y2={112} />
      <polygon points="270,36 308,52 270,68" fill="#FFC72C" />
      <polygon points={starPoints(284, 52, 7)} fill={INK} strokeWidth={2} />
    </g>
  );
}

export default function Island({ id, done, locked }: { id: number; done: boolean; locked: boolean }) {
  return (
    <div className="isle-artwork" aria-hidden>
      <img src="/island.png" alt="" />
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
    /*
    <svg viewBox="0 0 320 240" aria-hidden>
      <ellipse cx={160} cy={216} rx={150} ry={20} fill="#fff" opacity={0.35} />
      {ART[id]?.()}
      {done && <Flag />}
      {locked && <Cloud />}
    </svg>
    */
  );
}
