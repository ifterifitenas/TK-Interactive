export interface RouletteOption {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  emoji: string;
  color: string;
  gameKey:
    | 'puzzle'
    | 'kuis'
    | 'morningRoutine'
    | 'worship'
    | 'runner'
    | 'catch'
    | 'studyQuiz'
    | 'helping'
    | 'starCount';
}

// Roulette mengundi game tambahan yang BENAR-BENAR BERBEDA:
// Ada pilihan Puzzle, Kuis, dan Mini Game Tambahan!
export const ROULETTE_BONUS_GAMES: Record<number, RouletteOption[]> = {
  // 1: Bangun Pagi (Game Utama: AlarmGame)
  1: [
    {
      id: 'h1-puzzle',
      title: 'Susun Puzzle Bangun Pagi',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun kepingan puzzle gambar pulau Bangun Pagi sampai utuh!',
    },
    {
      id: 'h1-kuis',
      title: 'Kuis Pintar Bangun Pagi',
      shortLabel: 'Kuis Pintar',
      emoji: '❓',
      color: '#42a5f5',
      gameKey: 'kuis',
      description: 'Uji pengetahuanmu tentang kebiasaan bangun pagi yang hebat!',
    },
    {
      id: 'h1-routine',
      title: 'Bersiap Pagi & Rapikan Kasur',
      shortLabel: 'Bersiap Pagi',
      emoji: '☀️',
      color: '#66bb6a',
      gameKey: 'morningRoutine',
      description: 'Bantu Bima merapikan tempat tidur dan mandi sebelum sekolah!',
    },
    {
      id: 'h1-routine2',
      title: 'Sikat Gigi & Sarapan Sehat',
      shortLabel: 'Pagi Ceria',
      emoji: '🪥',
      color: '#ff7043',
      gameKey: 'morningRoutine',
      description: 'Pilih semua aktivitas pagi agar tubuh segar dan bertenaga!',
    },
  ],

  // 2: Beribadah (Game Utama: MazeGame)
  2: [
    {
      id: 'h2-puzzle',
      title: 'Susun Puzzle Beribadah',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun kepingan puzzle gambar tempat ibadah sampai rapi!',
    },
    {
      id: 'h2-kuis',
      title: 'Kuis Pintar Beribadah',
      shortLabel: 'Kuis Pintar',
      emoji: '❓',
      color: '#5579b8',
      gameKey: 'kuis',
      description: 'Jawab pertanyaan seru seputar kebiasaan ibadah dan bersyukur!',
    },
    {
      id: 'h2-worship',
      title: 'Amalan Kebaikan & Bersuci',
      shortLabel: 'Amalan Baik',
      emoji: '🤲',
      color: '#a07850',
      gameKey: 'worship',
      description: 'Kumpulkan amalan baik, sedekah, dan wudu yang bersih!',
    },
    {
      id: 'h2-worship2',
      title: 'Hati Tenang Penuh Damai',
      shortLabel: 'Hati Damai',
      emoji: '✨',
      color: '#4cb963',
      gameKey: 'worship',
      description: 'Rasakan kedamaian dan kebahagiaan setelah beribadah!',
    },
  ],

  // 3: Berolahraga (Game Utama: BallCatchGame)
  3: [
    {
      id: 'h3-puzzle',
      title: 'Susun Puzzle Berolahraga',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun puzzle gambar anak berolahraga aktif sampai lengkap!',
    },
    {
      id: 'h3-kuis',
      title: 'Kuis Pintar Berolahraga',
      shortLabel: 'Kuis Pintar',
      emoji: '❓',
      color: '#42a5f5',
      gameKey: 'kuis',
      description: 'Tebak manfaat dan kegiatan olahraga yang membuat tubuh bugar!',
    },
    {
      id: 'h3-runner',
      title: 'Lari & Lompat Rintangan',
      shortLabel: 'Lari Rintangan',
      emoji: '🏃',
      color: '#ff7043',
      gameKey: 'runner',
      description: 'Bantu Bima lari melompati gadget dan tangkap bola olahraga!',
    },
    {
      id: 'h3-runner2',
      title: 'Bima Lari Sehat Ceria',
      shortLabel: 'Lari Ceria',
      emoji: '👟',
      color: '#5cc26a',
      gameKey: 'runner',
      description: 'Tantangan lari aktif dan lincah agar badan makin kuat!',
    },
  ],

  // 4: Makan Bergizi (Game Utama: FoodSortGame)
  4: [
    {
      id: 'h4-puzzle',
      title: 'Susun Puzzle Makanan Bergizi',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun puzzle buah dan sayuran segar sampai utuh!',
    },
    {
      id: 'h4-kuis',
      title: 'Kuis Makanan Sehat',
      shortLabel: 'Kuis Sehat',
      emoji: '❓',
      color: '#42a5f5',
      gameKey: 'kuis',
      description: 'Pilih makanan yang baik dan sehat untuk gigi serta tubuh!',
    },
    {
      id: 'h4-catch',
      title: 'Keranjang Buah & Sayur',
      shortLabel: 'Tangkap Buah',
      emoji: '🧺',
      color: '#f26d6d',
      gameKey: 'catch',
      description: 'Geser keranjang dan tangkap buah & sayuran sebanyak-banyaknya!',
    },
    {
      id: 'h4-catch2',
      title: 'Panen Makanan Kaya Vitamin',
      shortLabel: 'Panen Vitamin',
      emoji: '🥦',
      color: '#26a69a',
      gameKey: 'catch',
      description: 'Kumpulkan brokoli dan wortel sehat, hindari permen manis!',
    },
  ],

  // 5: Gemar Belajar (Game Utama: WordGame)
  5: [
    {
      id: 'h5-puzzle',
      title: 'Susun Puzzle Gemar Belajar',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun kepingan puzzle gambar ruang kelas dan buku ilmu!',
    },
    {
      id: 'h5-kuis',
      title: 'Kuis Anak Cerdas Pintar',
      shortLabel: 'Kuis Cerdas',
      emoji: '❓',
      color: '#7e57c2',
      gameKey: 'kuis',
      description: 'Uji pengetahuan belajar dan sikap murid teladan di sekolah!',
    },
    {
      id: 'h5-study',
      title: 'Kemas Tas & Alat Tulis',
      shortLabel: 'Kemas Tas',
      emoji: '🎒',
      color: '#4c8df6',
      gameKey: 'studyQuiz',
      description: 'Siapkan buku dan pensil untuk pergi belajar ke sekolah!',
    },
    {
      id: 'h5-study2',
      title: 'Kumpulkan Buku & Krayon',
      shortLabel: 'Alat Belajar',
      emoji: '📚',
      color: '#ffa726',
      gameKey: 'studyQuiz',
      description: 'Kumpulkan perlengkapan menggambar dan menulis anak juara!',
    },
  ],

  // 6: Bermasyarakat (Game Utama: SimonGame)
  6: [
    {
      id: 'h6-puzzle',
      title: 'Susun Puzzle Bermasyarakat',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun puzzle gambar anak-anak bermain rukun bersama teman!',
    },
    {
      id: 'h6-kuis',
      title: 'Kuis Sahabat yang Baik',
      shortLabel: 'Kuis Sahabat',
      emoji: '❓',
      color: '#42a5f5',
      gameKey: 'kuis',
      description: 'Pilih cara berkenalan yang ramah dan saling menolong sesama!',
    },
    {
      id: 'h6-help',
      title: 'Tolong Teman & Berbagi',
      shortLabel: 'Tolong Teman',
      emoji: '🤝',
      color: '#9b8cf0',
      gameKey: 'helping',
      description: 'Bantu teman yang kesulitan dan berbagi mainan bersama!',
    },
    {
      id: 'h6-help2',
      title: 'Sahabat Penuh Kasih Sayang',
      shortLabel: 'Sahabat Kasih',
      emoji: '💖',
      color: '#ec407a',
      gameKey: 'helping',
      description: 'Tunjukkan rasa peduli dan sayangi teman-teman di sekitar!',
    },
  ],

  // 7: Tidur Cepat (Game Utama: SleepGame)
  7: [
    {
      id: 'h7-puzzle',
      title: 'Susun Puzzle Tidur Cepat',
      shortLabel: 'Susun Puzzle',
      emoji: '🧩',
      color: '#ffb300',
      gameKey: 'puzzle',
      description: 'Susun kepingan puzzle gambar kamar tidur malam yang tenang!',
    },
    {
      id: 'h7-kuis',
      title: 'Kuis Tidur & Istirahat Nyenyak',
      shortLabel: 'Kuis Tidur',
      emoji: '❓',
      color: '#5c6bc0',
      gameKey: 'kuis',
      description: 'Ketahui manfaat tidur cepat agar badan segar di esok hari!',
    },
    {
      id: 'h7-star',
      title: 'Matikan Lampu & Hitung Bintang',
      shortLabel: 'Kamar Bintang',
      emoji: '🌙',
      color: '#3f6bc9',
      gameKey: 'starCount',
      description: 'Redupkan lampu dan hitung bintang di langit malam!',
    },
    {
      id: 'h7-star2',
      title: 'Tidur Cepat Mimpi Indah',
      shortLabel: 'Tidur Nyenyak',
      emoji: '⭐',
      color: '#26c6da',
      gameKey: 'starCount',
      description: 'Waktunya istirahat nyenyak tanpa gangguan layar HP atau TV!',
    },
  ],
};
