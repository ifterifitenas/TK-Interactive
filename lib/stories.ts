// Cerita bergaya game novel (visual novel) untuk setiap kebiasaan.
// Tiap scene = satu "layar dialog". Teks pendek karena dibacakan otomatis.
// Urutan kebiasaan: 1-Bangun Pagi, 2-Beribadah, 3-Berolahraga,
//                   4-Makan Bergizi, 5-Gemar Belajar, 6-Bermasyarakat, 7-Tidur Cepat.

export type Place = "pagi" | "kamar" | "mandi" | "dapur" | "rumah" | "kelas" | "taman" | "lapangan" | "masjid" | "malam";
export type Speaker = "Bima" | "Ibu" | "Bapak" | "Bu Guru" | "Dodi";

export const PLACES: Record<Place, { bg: string; deco: [string, string] }> = {
  pagi:     { bg: "linear-gradient(#ffd89b, #ffe9c2 58%, #bfe8a8 58.1%)",  deco: ["☁️", "🐦"] },
  kamar:    { bg: "linear-gradient(#ffe3ec, #fff3f6 62%, #d9b38c 62.1%)",  deco: ["🪟", "🖼️"] },
  mandi:    { bg: "linear-gradient(#d9f3fb, #eefaff 62%, #bfe7ef 62.1%)",  deco: ["🪞", "🛁"] },
  dapur:    { bg: "linear-gradient(#fff0d6, #fff8ea 62%, #e3c79a 62.1%)",  deco: ["🍳", "🥣"] },
  rumah:    { bg: "linear-gradient(#ffe9d1, #fff6ea 62%, #d7b98f 62.1%)",  deco: ["🪴", "🖼️"] },
  kelas:    { bg: "linear-gradient(#e3eeff, #f3f8ff 62%, #c9a77c 62.1%)",  deco: ["🕰️", "📝"] },
  taman:    { bg: "linear-gradient(#bfe4ff, #e9f7ff 60%, #9fdc86 60.1%)",  deco: ["🌳", "🌷"] },
  lapangan: { bg: "linear-gradient(#bfe4ff, #e9f7ff 55%, #7fd16e 55.1%)",  deco: ["🥅", "🌳"] },
  masjid:   { bg: "linear-gradient(#e8d5ff, #f5eeff 60%, #c9a77c 60.1%)",  deco: ["🕌", "🌙"] },
  malam:    { bg: "linear-gradient(#1a1a4e, #2d2d7a 55%, #1b3a1b 55.1%)",  deco: ["🌙", "⭐"] },
};

const B = "👦", I = "👩", P = "👨", G = "👩‍🏫", D = "🧒";

export const CAST: Record<Speaker, string> = { Bima: B, Ibu: I, Bapak: P, "Bu Guru": G, Dodi: D };

export type Scene = {
  place: Place;
  speaker?: Speaker; // kosong = narator
  cast: string[];    // emoji karakter di panggung (maks. 2)
  prop?: string;     // gambar besar pendukung di atas panggung
  text: string;
};

export const STORIES: Record<number, Scene[]> = {
  // 1 — Bangun Pagi
  1: [
    { place: "pagi",  cast: [B],       prop: "🌅", text: "Pagi hari yang cerah. Matahari mulai terbit." },
    { place: "kamar", speaker: "Bima", cast: [B],    prop: "☀️",  text: "Hoaam... Selamat pagi, Matahari! Aku bangun pagi hari ini." },
    { place: "kamar", speaker: "Ibu",  cast: [B, I], prop: "🛏️", text: "Selamat pagi, Bima! Ayo rapikan tempat tidur, lalu beribadah." },
    { place: "mandi", speaker: "Bima", cast: [B],    prop: "🚿",  text: "Aku mandi dan sarapan. Badanku jadi segar!" },
    { place: "taman", cast: [B],       prop: "🎒",   text: "Bangun pagi membuat Bima semangat ke sekolah. Sekarang, ayo bantu Bima!" },
  ],

  // 2 — Beribadah
  2: [
    { place: "pagi",   cast: [B],       prop: "🌅", text: "Pagi yang tenang. Bima terbangun dan ingat untuk beribadah." },
    { place: "mandi",  speaker: "Bima", cast: [B],    prop: "🧼",  text: "Aku berwudu dulu agar bersih sebelum beribadah." },
    { place: "masjid", speaker: "Ibu",  cast: [B, I], prop: "🕌",  text: "Bagus, Bima! Beribadah tepat waktu membuat hati tenang." },
    { place: "masjid", speaker: "Bima", cast: [B],    prop: "🙏",  text: "Aku berdoa semoga hari ini menyenangkan dan penuh kebaikan." },
    { place: "taman",  cast: [B],       prop: "😊",  text: "Hati Bima terasa damai setelah beribadah. Ayo bantu Bima!" },
  ],

  // 3 — Berolahraga
  3: [
    { place: "pagi",     cast: [B],       prop: "☀️", text: "Pagi cerah. Bima sudah siap dengan sepatu olahraganya." },
    { place: "lapangan", speaker: "Bima", cast: [B, D], prop: "🤸", text: "Ayo Dodi, kita pemanasan dulu supaya badan siap!" },
    { place: "lapangan", speaker: "Dodi", cast: [B, D], prop: "⚽", text: "Siap! Ayo tendang bolanya, Bima!" },
    { place: "lapangan", speaker: "Bima", cast: [B],    prop: "💧", text: "Hore, seru! Sekarang aku minum air putih dulu." },
    { place: "lapangan", cast: [B, D],    prop: "💪", text: "Berolahraga membuat badan kuat dan tidak mudah sakit. Ayo bantu Bima!" },
  ],

  // 4 — Makan Bergizi
  4: [
    { place: "rumah", cast: [B],       prop: "😋", text: "Bima pulang sekolah. Perutnya keroncongan." },
    { place: "dapur", speaker: "Bima", cast: [B, I], text: "Ibu, aku lapar sekali!" },
    { place: "dapur", speaker: "Ibu",  cast: [B, I], prop: "🧼", text: "Cuci tangan dulu ya, Bima. Lalu kita makan sayur dan buah." },
    { place: "dapur", speaker: "Ibu",  cast: [B, I], prop: "💧", text: "Minumnya air putih, bukan minuman yang terlalu manis." },
    { place: "dapur", speaker: "Bima", cast: [B],    prop: "🥦", text: "Enak! Makan bergizi membuat tubuhku kuat dan sehat. Ayo bantu Bima!" },
  ],

  // 5 — Gemar Belajar
  5: [
    { place: "kelas", cast: [B],          prop: "🏫", text: "Bima tiba di sekolah dengan semangat." },
    { place: "kelas", speaker: "Bu Guru", cast: [B, G], text: "Selamat pagi, anak-anak! Dengarkan Bu Guru menjelaskan, ya." },
    { place: "kelas", speaker: "Bima",    cast: [B],    prop: "👂", text: "Aku dengarkan Bu Guru baik-baik dan mencatat yang penting." },
    { place: "kelas", speaker: "Bu Guru", cast: [B, G], prop: "📚", text: "Kalau mau pinjam buku bacaan, pergilah ke perpustakaan." },
    { place: "kelas", speaker: "Bima",    cast: [B],    prop: "✏️", text: "Gemar belajar membuatku makin pintar dan tahu banyak hal baru. Ayo bantu Bima!" },
  ],

  // 6 — Bermasyarakat
  6: [
    { place: "taman", cast: [B, D],    prop: "🌳", text: "Di taman, Bima bertemu teman baru bernama Dodi." },
    { place: "taman", speaker: "Bima", cast: [B, D], text: "Halo! Namaku Bima. Siapa namamu?" },
    { place: "taman", speaker: "Dodi", cast: [B, D], prop: "👋", text: "Halo, Bima! Namaku Dodi. Senang berkenalan!" },
    { place: "taman", speaker: "Bima", cast: [B, D], prop: "🧸", text: "Boleh aku pinjam mainanmu sebentar, Dodi?" },
    { place: "taman", cast: [B, D],    prop: "🤝", text: "Dodi terjatuh. Bima cepat menolongnya. Bermasyarakat itu menyenangkan! Ayo bantu Bima!" },
  ],

  // 7 — Tidur Cepat
  7: [
    { place: "malam", cast: [B],       prop: "🌙", text: "Malam tiba. Bima sudah selesai belajar dan bermain." },
    { place: "kamar", speaker: "Ibu",  cast: [B, I], prop: "🕐", text: "Sudah malam, Bima. Waktunya sikat gigi dan cuci muka." },
    { place: "kamar", speaker: "Bima", cast: [B],    prop: "🪥", text: "Baik, Bu! Aku sikat gigi lalu berdoa sebelum tidur." },
    { place: "kamar", speaker: "Bima", cast: [B],    prop: "🙏", text: "Ya Tuhan, terima kasih atas hari yang menyenangkan ini." },
    { place: "kamar", cast: [B],       prop: "😴", text: "Tidur cepat membuat Bima segar dan semangat esok pagi. Ayo bantu Bima!" },
  ],
};
