// Semua konten 7 KAIH ada di file ini. Ubah teks, gambar (emoji), atau soal di sini
// tanpa perlu menyentuh komponen.

export type Option = { emoji: string; label: string };
export type Item   = { emoji: string; label: string; correct?: boolean };
export type SequenceStep = { emoji: string; label: string };

// ── Tipe soal yang tersedia ──────────────────────────────────────────────────
/** Pilihan ganda: ketuk satu jawaban benar */
export type QuestionChoice = {
  type: "choice";
  q: string;
  options: Option[]; // 3 pilihan
  answer: number;    // indeks jawaban benar
};

/** Pasangkan: ketuk item kiri lalu item kanan yang cocok */
export type QuestionMatch = {
  type: "match";
  q: string;
  pairs: { left: { emoji: string; label: string }; right: { emoji: string; label: string } }[];
};

/** Temukan yang benar: ketuk SEMUA item yang benar dari grid */
export type QuestionFind = {
  type: "find";
  q: string;
  items: { emoji: string; label: string; correct: boolean }[]; // campur benar & salah
};

/** Benar atau Salah: dua tombol besar */
export type QuestionTrueFalse = {
  type: "truefalse";
  q: string;
  emoji: string;  // gambar besar pendukung pernyataan
  answer: boolean;
};

export type Question = QuestionChoice | QuestionMatch | QuestionFind | QuestionTrueFalse;

export type Habit = {
  id: number;
  title: string;
  emoji: string;  // ikon di menu
  image: string;  // gambar pulau di carousel (path dari /public)
  video: string;  // path file video dari /public (kosong = belum ada)
  poster: string; // thumbnail video (kosong = tanpa poster)
  hero: string;   // karakter pendamping
  color: string;  // warna utama kebiasaan
  soft: string;   // warna latar lembut
  story: string;  // cerita singkat (dibacakan otomatis)
  activity: { prompt: string; items: Item[]; sequence: SequenceStep[] };
  quiz: Question[];
  badge: { name: string; emoji: string };
};

export const HABITS: Habit[] = [
  // ── 1 BANGUN PAGI ───────────────────────────────────────────────────────────
  {
    id: 1,
    title: "Bangun Pagi",
    emoji: "☀️",
    image: "/Bangun pagi.png",
    video: "/bangun-pagi.mp4",
    poster: "/bangun-pagi-poster.jpg",
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
      // 1. Pilihan ganda
      {
        type: "choice",
        q: "Kapan waktu terbaik untuk bangun pagi?",
        options: [
          { emoji: "🌅", label: "Sebelum matahari tinggi" },
          { emoji: "☀️", label: "Saat matahari sudah tinggi" },
          { emoji: "🌙", label: "Tengah malam" },
        ],
        answer: 0,
      },
      // 2. Pasangkan kegiatan pagi dengan manfaatnya
      {
        type: "match",
        q: "Pasangkan kegiatan pagi dengan manfaatnya!",
        pairs: [
          { left: { emoji: "⏰", label: "Bangun tidur" },   right: { emoji: "🌅", label: "Pagi segar" } },
          { left: { emoji: "🛏️", label: "Rapikan kasur" },  right: { emoji: "✨", label: "Kamar rapi" } },
          { left: { emoji: "🚿", label: "Mandi" },           right: { emoji: "💧", label: "Tubuh bersih" } },
          { left: { emoji: "🍳", label: "Sarapan" },         right: { emoji: "⚡", label: "Badan bertenaga" } },
        ],
      },
      // 3. Temukan yang benar
      {
        type: "find",
        q: "Pilih semua kegiatan pagi yang baik!",
        items: [
          { emoji: "🪥", label: "Sikat gigi", correct: true },
          { emoji: "🙏", label: "Berdoa", correct: true },
          { emoji: "🎒", label: "Siapkan tas", correct: true },
          { emoji: "📱", label: "Main HP", correct: false },
          { emoji: "😴", label: "Tidur lagi", correct: false },
          { emoji: "📺", label: "Nonton TV", correct: false },
        ],
      },
    ],
    badge: { name: "Bintang Pagi", emoji: "🌞" },
  },

  // ── 2 BERIBADAH ─────────────────────────────────────────────────────────────
  {
    id: 2,
    title: "Beribadah",
    emoji: "🕌",
    image: "/Beribadah.png",
    video: "/beribadah.mp4",
    poster: "",
    hero: "👦",
    color: "#a07850",
    soft: "#f5edd6",
    story: "Beribadah membuat hati tenang dan kita selalu bersyukur kepada Tuhan!",
    activity: {
      prompt: "Susun kegiatan beribadah Bima dari awal sampai selesai!",
      items: [
        { emoji: "🕌", label: "Beribadah", correct: true },
        { emoji: "🎮", label: "Main game" },
        { emoji: "📺", label: "Nonton TV" },
      ],
      sequence: [
        { emoji: "🧼", label: "Berwudu" },
        { emoji: "🕌", label: "Pergi ke masjid" },
        { emoji: "🙏", label: "Berdoa" },
        { emoji: "😊", label: "Hati tenang" },
      ],
    },
    quiz: [
      // 1. Benar/Salah
      {
        type: "truefalse",
        q: "Kita boleh melewatkan ibadah karena sedang malas.",
        emoji: "🕌",
        answer: false,
      },
      // 2. Pasangkan langkah ibadah dengan maknanya
      {
        type: "match",
        q: "Pasangkan langkah ibadah dengan maknanya!",
        pairs: [
          { left: { emoji: "🧼", label: "Berwudu" },         right: { emoji: "💧", label: "Bersuci dulu" } },
          { left: { emoji: "👕", label: "Pakai baju bersih" }, right: { emoji: "✨", label: "Tampil rapi" } },
          { left: { emoji: "🙏", label: "Sholat" },           right: { emoji: "🕌", label: "Ibadah ke Tuhan" } },
          { left: { emoji: "📿", label: "Berdoa sesudahnya" }, right: { emoji: "❤️", label: "Hati tenang" } },
        ],
      },
      // 3. Pilihan ganda
      {
        type: "choice",
        q: "Apa yang kita rasakan setelah beribadah dengan sungguh-sungguh?",
        options: [
          { emoji: "😤", label: "Jadi marah-marah" },
          { emoji: "😩", label: "Jadi capek sekali" },
          { emoji: "😊", label: "Hati tenang dan damai" },
        ],
        answer: 2,
      },
    ],
    badge: { name: "Bintang Ibadah", emoji: "🕌" },
  },

  // ── 3 BEROLAHRAGA ───────────────────────────────────────────────────────────
  {
    id: 3,
    title: "Berolahraga",
    emoji: "⚽",
    image: "/Berolahraga.png",
    video: "/Berolahraga.mp4",
    poster: "",
    hero: "👦",
    color: "#5cc26a",
    soft: "#e4f7e7",
    story: "Berolahraga membuat badan kuat, gembira, dan tidak mudah sakit!",
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
      // 1. Pilihan ganda
      {
        type: "choice",
        q: "Sebelum berolahraga, apa yang harus kita lakukan?",
        options: [
          { emoji: "🤸", label: "Pemanasan dulu" },
          { emoji: "🛋️", label: "Tidur-tiduran" },
          { emoji: "🍰", label: "Makan kue dulu" },
        ],
        answer: 0,
      },
      // 2. Temukan yang benar
      {
        type: "find",
        q: "Pilih semua kegiatan olahraga yang baik!",
        items: [
          { emoji: "🏃", label: "Lari pagi", correct: true },
          { emoji: "⚽", label: "Main bola", correct: true },
          { emoji: "🤸", label: "Senam", correct: true },
          { emoji: "📺", label: "Nonton TV", correct: false },
          { emoji: "🎮", label: "Main game", correct: false },
          { emoji: "😴", label: "Tiduran", correct: false },
        ],
      },
      // 3. Benar/Salah
      {
        type: "truefalse",
        q: "Minum air putih penting setelah berolahraga.",
        emoji: "💧",
        answer: true,
      },
    ],
    badge: { name: "Bintang Aktif", emoji: "🏅" },
  },

  // ── 4 MAKAN BERGIZI ─────────────────────────────────────────────────────────
  {
    id: 4,
    title: "Makan Bergizi",
    emoji: "🍎",
    image: "/Makan Bergizi, Hidup Sehat.png",
    video: "/Makan Bergizi.mp4",
    poster: "",
    hero: "👦",
    color: "#f26d6d",
    soft: "#ffe6e6",
    story: "Makan makanan bergizi membuat tubuh kuat, sehat, dan tumbuh besar!",
    activity: {
      prompt: "Susun kebiasaan makan bergizi Bima dari awal sampai selesai!",
      items: [
        { emoji: "🍬", label: "Permen" },
        { emoji: "🍟", label: "Kentang goreng" },
        { emoji: "🍎", label: "Apel", correct: true },
      ],
      sequence: [
        { emoji: "🧼", label: "Cuci tangan" },
        { emoji: "🍽️", label: "Siapkan makanan" },
        { emoji: "🥗", label: "Makan makanan bergizi" },
        { emoji: "🧹", label: "Rapikan meja" },
      ],
    },
    quiz: [
      // 1. Temukan yang benar
      {
        type: "find",
        q: "Pilih semua makanan yang bergizi dan sehat!",
        items: [
          { emoji: "🥦", label: "Sayuran", correct: true },
          { emoji: "🍎", label: "Buah-buahan", correct: true },
          { emoji: "🥚", label: "Telur", correct: true },
          { emoji: "🍬", label: "Permen", correct: false },
          { emoji: "🍟", label: "Kentang goreng", correct: false },
          { emoji: "🥤", label: "Minuman soda", correct: false },
        ],
      },
      // 2. Benar/Salah
      {
        type: "truefalse",
        q: "Makan permen setiap hari baik untuk gigi dan tubuh kita.",
        emoji: "🍬",
        answer: false,
      },
      // 3. Pasangkan makanan dengan manfaatnya
      {
        type: "match",
        q: "Pasangkan makanan dengan manfaatnya!",
        pairs: [
          { left: { emoji: "🥦", label: "Sayuran" },   right: { emoji: "💪", label: "Tubuh kuat" } },
          { left: { emoji: "🍎", label: "Buah" },       right: { emoji: "🌟", label: "Kaya vitamin" } },
          { left: { emoji: "🥛", label: "Susu" },       right: { emoji: "🦴", label: "Tulang kuat" } },
          { left: { emoji: "🧼", label: "Cuci tangan" }, right: { emoji: "🦠", label: "Jauh dari kuman" } },
        ],
      },
    ],
    badge: { name: "Bintang Sehat", emoji: "🍏" },
  },

  // ── 5 GEMAR BELAJAR ─────────────────────────────────────────────────────────
  {
    id: 5,
    title: "Gemar Belajar",
    emoji: "📖",
    image: "/Gemar Belajar.png",
    video: "/Gemar belajar.mp4",
    poster: "",
    hero: "👦",
    color: "#4c8df6",
    soft: "#e3eeff",
    story: "Gemar belajar membuat kita makin pintar dan bisa banyak hal baru!",
    activity: {
      prompt: "Susun kegiatan belajar Bima dari awal sampai selesai!",
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
      // 1. Pilihan ganda
      {
        type: "choice",
        q: "Saat Bu Guru sedang menjelaskan pelajaran, kita harus...",
        options: [
          { emoji: "🗣️", label: "Mengobrol dengan teman" },
          { emoji: "👂", label: "Mendengarkan dengan seksama" },
          { emoji: "😴", label: "Tidur-tiduran" },
        ],
        answer: 1,
      },
      // 2. Benar/Salah
      {
        type: "truefalse",
        q: "Membaca buku bisa menambah pengetahuan dan membuat kita makin pintar.",
        emoji: "📚",
        answer: true,
      },
      // 3. Temukan yang benar
      {
        type: "find",
        q: "Pilih semua sikap belajar yang baik!",
        items: [
          { emoji: "👂", label: "Mendengarkan guru", correct: true },
          { emoji: "✏️", label: "Mencatat pelajaran", correct: true },
          { emoji: "📖", label: "Membaca buku", correct: true },
          { emoji: "🗣️", label: "Mengobrol saat belajar", correct: false },
          { emoji: "🎈", label: "Bermain di kelas", correct: false },
          { emoji: "😴", label: "Tidur di kelas", correct: false },
        ],
      },
    ],
    badge: { name: "Bintang Pintar", emoji: "🧠" },
  },

  // ── 6 BERMASYARAKAT ─────────────────────────────────────────────────────────
  {
    id: 6,
    title: "Bermasyarakat",
    emoji: "👫",
    image: "/Bermasyarakat.png",
    video: "/Bermasyarakat.mp4",
    poster: "",
    hero: "👦",
    color: "#9b8cf0",
    soft: "#eeeaff",
    story: "Bermasyarakat berarti berteman dengan baik, saling menyapa, dan saling menolong.",
    activity: {
      prompt: "Susun cara Bima berkenalan dengan teman baru!",
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
      // 1. Benar/Salah
      {
        type: "truefalse",
        q: "Kita boleh merebut mainan teman tanpa meminta izin terlebih dahulu.",
        emoji: "🧸",
        answer: false,
      },
      // 2. Pasangkan sikap bermasyarakat dengan artinya
      {
        type: "match",
        q: "Pasangkan sikap dengan artinya yang tepat!",
        pairs: [
          { left: { emoji: "👋", label: "Menyapa" },       right: { emoji: "😊", label: "Ramah" } },
          { left: { emoji: "🤝", label: "Jabat tangan" },  right: { emoji: "👫", label: "Berteman baik" } },
          { left: { emoji: "🎁", label: "Berbagi" },        right: { emoji: "❤️", label: "Baik hati" } },
          { left: { emoji: "🆘", label: "Menolong" },       right: { emoji: "🌟", label: "Pahlawan kecil" } },
        ],
      },
      // 3. Temukan yang benar
      {
        type: "find",
        q: "Pilih semua sikap baik dalam bermasyarakat!",
        items: [
          { emoji: "🤝", label: "Menolong teman", correct: true },
          { emoji: "🎁", label: "Berbagi dengan teman", correct: true },
          { emoji: "👋", label: "Menyapa dengan ramah", correct: true },
          { emoji: "😂", label: "Menertawakan teman", correct: false },
          { emoji: "😡", label: "Berteriak-teriak", correct: false },
          { emoji: "🙅", label: "Tidak mau bermain bersama", correct: false },
        ],
      },
    ],
    badge: { name: "Bintang Sahabat", emoji: "🤗" },
  },

  // ── 7 TIDUR CEPAT ───────────────────────────────────────────────────────────
  {
    id: 7,
    title: "Tidur Cepat",
    emoji: "🌙",
    image: "/Tidur Cepat.png",
    video: "/Tidur Cepat.mp4",
    poster: "",
    hero: "👦",
    color: "#3f6bc9",
    soft: "#dde8ff",
    story: "Tidur cepat membuat tubuh dan pikiran kita kembali segar untuk hari esok!",
    activity: {
      prompt: "Susun kebiasaan tidur cepat Bima dari awal sampai selesai!",
      items: [
        { emoji: "🎮", label: "Main game" },
        { emoji: "🛏️", label: "Tidur", correct: true },
        { emoji: "📱", label: "Main HP" },
      ],
      sequence: [
        { emoji: "🧼", label: "Cuci muka" },
        { emoji: "🪥", label: "Sikat gigi" },
        { emoji: "🙏", label: "Berdoa" },
        { emoji: "😴", label: "Tidur nyenyak" },
      ],
    },
    quiz: [
      // 1. Pasangkan kegiatan malam dengan manfaatnya
      {
        type: "match",
        q: "Pasangkan kegiatan malam dengan manfaatnya!",
        pairs: [
          { left: { emoji: "🚿", label: "Mandi sore" },    right: { emoji: "💧", label: "Tubuh bersih" } },
          { left: { emoji: "🪥", label: "Sikat gigi" },    right: { emoji: "😁", label: "Gigi sehat" } },
          { left: { emoji: "🙏", label: "Berdoa" },         right: { emoji: "🌙", label: "Hati tenang" } },
          { left: { emoji: "😴", label: "Tidur cepat" },   right: { emoji: "🌈", label: "Segar besok" } },
        ],
      },
      // 2. Benar/Salah
      {
        type: "truefalse",
        q: "Bermain HP sampai larut malam itu baik untuk kesehatan kita.",
        emoji: "📱",
        answer: false,
      },
      // 3. Pilihan ganda
      {
        type: "choice",
        q: "Apa manfaat tidur cepat dan cukup setiap malam?",
        options: [
          { emoji: "😵", label: "Badan jadi lemas dan lesu" },
          { emoji: "😴", label: "Jadi sulit bangun pagi" },
          { emoji: "✨", label: "Badan segar dan otak siap belajar" },
        ],
        answer: 2,
      },
    ],
    badge: { name: "Bintang Istirahat", emoji: "🌙" },
  },
];

export const TOTAL = HABITS.length;
