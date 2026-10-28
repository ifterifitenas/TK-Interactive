// Semua konten 7 KAIH ada di file ini. Ubah teks, gambar (emoji), atau soal di sini
// tanpa perlu menyentuh komponen.

export type Option = { emoji: string; label: string };
export type Question = { q: string; options: Option[]; answer: number };
export type Item = { emoji: string; label: string; correct?: boolean };
export type SequenceStep = { emoji: string; label: string };

export type Habit = {
  id: number;
  title: string;
  emoji: string; // ikon di menu
  hero: string; // karakter pendamping
  color: string; // warna utama kebiasaan
  soft: string; // warna latar lembut
  story: string; // cerita singkat (dibacakan otomatis)
  // Aktivitas: susun gambar sesuai urutan kebiasaan.
  activity: { prompt: string; items: Item[]; sequence: SequenceStep[] };
  quiz: Question[]; // answer = indeks opsi yang benar
  badge: { name: string; emoji: string };
};

export const HABITS: Habit[] = [
  {
    id: 1,
    title: "Bangun Pagi",
    emoji: "☀️",
    hero: "👦",
    color: "#ffc83d",
    soft: "#fff6d6",
    story: "Bangun pagi membuat tubuh kita lebih segar dan siap beraktivitas!",
    activity: {
      prompt: "Susun gambar kegiatan pagi Bima dari awal sampai selesai!",
      items: [
        { emoji: "🚿", label: "Mandi", correct: true },
        { emoji: "🎮", label: "Main game" },
        { emoji: "🛌", label: "Tidur lagi" },
      ],
      sequence: [
        { emoji: "⏰", label: "Bangun tidur" },
        { emoji: "🪥", label: "Sikat gigi" },
        { emoji: "👕", label: "Berpakaian" },
        { emoji: "🍽️", label: "Sarapan" },
      ],
    },
    quiz: [
      { q: "Kapan waktu yang baik untuk bangun tidur?", options: [{ emoji: "🌙", label: "Tengah malam" }, { emoji: "🌅", label: "Pagi hari" }, { emoji: "😴", label: "Siang bolong" }], answer: 1 },
      { q: "Setelah bangun tidur, apa yang kita rapikan?", options: [{ emoji: "🛏️", label: "Tempat tidur" }, { emoji: "📺", label: "Televisi" }, { emoji: "🍬", label: "Permen" }], answer: 0 },
    ],
    badge: { name: "Bintang Pagi", emoji: "🌞" },
  },
  {
    id: 2,
    title: "Rajin Belajar",
    emoji: "📖",
    hero: "👧",
    color: "#4c8df6",
    soft: "#e3eeff",
    story: "Rajin belajar membuat kita makin pintar dan bisa banyak hal baru!",
    activity: {
      prompt: "Susun kegiatan belajar Sari dari awal sampai selesai!",
      items: [
        { emoji: "🍟", label: "Kentang goreng" },
        { emoji: "📚", label: "Buku", correct: true },
        { emoji: "🛝", label: "Perosotan" },
      ],
      sequence: [
        { emoji: "🎒", label: "Siapkan tas" },
        { emoji: "🏫", label: "Pergi ke sekolah" },
        { emoji: "📚", label: "Belajar" },
        { emoji: "✏️", label: "Mengerjakan tugas" },
      ],
    },
    quiz: [
      { q: "Saat guru menjelaskan, kita harus...", options: [{ emoji: "👂", label: "Mendengarkan" }, { emoji: "🗣️", label: "Mengobrol" }, { emoji: "😴", label: "Tidur" }], answer: 0 },
      { q: "Di mana kita bisa meminjam buku bacaan?", options: [{ emoji: "🛁", label: "Kamar mandi" }, { emoji: "📚", label: "Perpustakaan" }, { emoji: "🚗", label: "Jalan raya" }], answer: 1 },
    ],
    badge: { name: "Bintang Pintar", emoji: "🧠" },
  },
  {
    id: 3,
    title: "Makan Sehat",
    emoji: "🍎",
    hero: "👦",
    color: "#f26d6d",
    soft: "#ffe6e6",
    story: "Makan makanan sehat membuat tubuh kuat dan tumbuh besar!",
    activity: {
      prompt: "Susun kebiasaan makan sehat Bima dari awal sampai selesai!",
      items: [
        { emoji: "🍬", label: "Permen" },
        { emoji: "🍟", label: "Kentang goreng" },
        { emoji: "🍎", label: "Apel", correct: true },
      ],
      sequence: [
        { emoji: "🧼", label: "Cuci tangan" },
        { emoji: "🍽️", label: "Siapkan makanan" },
        { emoji: "🥗", label: "Makan makanan sehat" },
        { emoji: "🧹", label: "Rapikan meja" },
      ],
    },
    quiz: [
      { q: "Sebelum makan, kita harus...", options: [{ emoji: "📱", label: "Main HP" }, { emoji: "🧼", label: "Cuci tangan" }, { emoji: "🏃", label: "Berlari" }], answer: 1 },
      { q: "Minuman apa yang paling sehat?", options: [{ emoji: "🥤", label: "Minuman soda" }, { emoji: "💧", label: "Air putih" }, { emoji: "🧋", label: "Minuman sangat manis" }], answer: 1 },
    ],
    badge: { name: "Bintang Sehat", emoji: "🍏" },
  },
  {
    id: 4,
    title: "Bersosialisasi",
    emoji: "👫",
    hero: "👧",
    color: "#9b8cf0",
    soft: "#eeeaff",
    story: "Bersosialisasi berarti berteman dengan baik, saling menyapa, dan saling menolong.",
    activity: {
      prompt: "Susun cara Sari berkenalan dengan teman baru!",
      items: [
        { emoji: "🙈", label: "Bersembunyi" },
        { emoji: "😠", label: "Cemberut" },
        { emoji: "👋", label: "Menyapa", correct: true },
      ],
      sequence: [
        { emoji: "👀", label: "Melihat teman" },
        { emoji: "👋", label: "Menyapa" },
        { emoji: "😊", label: "Tersenyum" },
        { emoji: "🤝", label: "Berkenalan" },
      ],
    },
    quiz: [
      { q: "Teman terjatuh, kita...", options: [{ emoji: "🤝", label: "Menolong" }, { emoji: "😆", label: "Menertawakan" }, { emoji: "🚶", label: "Pergi saja" }], answer: 0 },
      { q: "Ingin meminjam mainan teman, kita...", options: [{ emoji: "🤚", label: "Merebut" }, { emoji: "🙏", label: "Meminta izin" }, { emoji: "😡", label: "Berteriak" }], answer: 1 },
    ],
    badge: { name: "Bintang Sahabat", emoji: "🤗" },
  },
  {
    id: 5,
    title: "Bermain & Berolahraga",
    emoji: "⚽",
    hero: "👦",
    color: "#5cc26a",
    soft: "#e4f7e7",
    story: "Bermain dan berolahraga membuat badan kuat, gembira, dan tidak mudah sakit!",
    activity: {
      prompt: "Susun kegiatan olahraga Bima dari awal sampai selesai!",
      items: [
        { emoji: "📺", label: "Menonton TV terus" },
        { emoji: "⚽", label: "Main bola", correct: true },
        { emoji: "🛋️", label: "Tiduran" },
      ],
      sequence: [
        { emoji: "👟", label: "Pakai sepatu" },
        { emoji: "🤸", label: "Pemanasan" },
        { emoji: "⚽", label: "Bermain bola" },
        { emoji: "💧", label: "Minum air" },
      ],
    },
    quiz: [
      { q: "Sebelum berolahraga, kita...", options: [{ emoji: "🛋️", label: "Tidur" }, { emoji: "🤸", label: "Pemanasan" }, { emoji: "🍰", label: "Makan kue" }], answer: 1 },
      { q: "Setelah berolahraga, kita perlu...", options: [{ emoji: "💧", label: "Minum air" }, { emoji: "🍭", label: "Makan permen" }, { emoji: "📺", label: "Menonton TV" }], answer: 0 },
    ],
    badge: { name: "Bintang Aktif", emoji: "🏅" },
  },
  {
    id: 6,
    title: "Menjaga Kesehatan Diri",
    emoji: "🛡️",
    hero: "👧",
    color: "#3fb8c9",
    soft: "#dff5f8",
    story: "Menjaga kesehatan diri berarti rajin menjaga badan tetap bersih dan sehat.",
    activity: {
      prompt: "Susun kebiasaan menjaga kebersihan Sari!",
      items: [
        { emoji: "🧸", label: "Boneka" },
        { emoji: "🧼", label: "Sabun", correct: true },
        { emoji: "🍬", label: "Permen" },
      ],
      sequence: [
        { emoji: "🧼", label: "Ambil sabun" },
        { emoji: "🚿", label: "Mandi" },
        { emoji: "🧴", label: "Keringkan badan" },
        { emoji: "👚", label: "Pakai baju bersih" },
      ],
    },
    quiz: [
      { q: "Saat batuk, kita menutup mulut dengan...", options: [{ emoji: "🙌", label: "Tangan kosong" }, { emoji: "🤧", label: "Tisu atau siku" }, { emoji: "🙅", label: "Dibiarkan" }], answer: 1 },
      { q: "Kalau badan tidak enak, kita bilang pada...", options: [{ emoji: "🤐", label: "Tidak bilang siapa-siapa" }, { emoji: "👩", label: "Ibu, ayah, atau guru" }, { emoji: "🏃", label: "Teman di jalan" }], answer: 1 },
    ],
    badge: { name: "Bintang Bersih", emoji: "🛡️" },
  },
  {
    id: 7,
    title: "Berpikir Kritis dan Kreatif",
    emoji: "💡",
    hero: "👦",
    color: "#ff9a3d",
    soft: "#ffeedb",
    story: "Berpikir kritis dan kreatif membuat kita pandai mencari cara dan punya banyak ide!",
    activity: {
      prompt: "Susun langkah mencari solusi saat mainan Bima rusak!",
      items: [
        { emoji: "😭", label: "Menangis saja" },
        { emoji: "🗑️", label: "Membuang" },
        { emoji: "🤔", label: "Mencari cara", correct: true },
      ],
      sequence: [
        { emoji: "🔍", label: "Periksa kerusakan" },
        { emoji: "💡", label: "Cari ide" },
        { emoji: "🧰", label: "Perbaiki mainan" },
        { emoji: "🎉", label: "Coba kembali" },
      ],
    },
    quiz: [
      { q: "Kardus bekas bisa dijadikan...", options: [{ emoji: "🗑️", label: "Sampah saja" }, { emoji: "🚀", label: "Roket mainan" }, { emoji: "🙅", label: "Tidak bisa apa-apa" }], answer: 1 },
      { q: "Jika belum tahu sesuatu, kita...", options: [{ emoji: "🙈", label: "Pura-pura tahu" }, { emoji: "😴", label: "Menyerah" }, { emoji: "❓", label: "Bertanya" }], answer: 2 },
    ],
    badge: { name: "Bintang Kreatif", emoji: "🎨" },
  },
];

export const TOTAL = HABITS.length;
