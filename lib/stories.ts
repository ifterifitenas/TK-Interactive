// Cerita bergaya game novel (visual novel) untuk setiap kebiasaan.
// Tiap scene = satu "layar dialog". Teks pendek karena dibacakan otomatis.
// Ubah/tambah scene di sini tanpa menyentuh komponen.

export type Place = "pagi" | "kamar" | "mandi" | "dapur" | "rumah" | "kelas" | "taman" | "lapangan";
export type Speaker = "Bima" | "Sari" | "Ibu" | "Bapak" | "Bu Guru" | "Dodi";

export const PLACES: Record<Place, { bg: string; deco: [string, string] }> = {
  pagi: { bg: "linear-gradient(#ffd89b, #ffe9c2 58%, #bfe8a8 58.1%)", deco: ["☁️", "🐦"] },
  kamar: { bg: "linear-gradient(#ffe3ec, #fff3f6 62%, #d9b38c 62.1%)", deco: ["🪟", "🖼️"] },
  mandi: { bg: "linear-gradient(#d9f3fb, #eefaff 62%, #bfe7ef 62.1%)", deco: ["🪞", "🛁"] },
  dapur: { bg: "linear-gradient(#fff0d6, #fff8ea 62%, #e3c79a 62.1%)", deco: ["🍳", "🥣"] },
  rumah: { bg: "linear-gradient(#ffe9d1, #fff6ea 62%, #d7b98f 62.1%)", deco: ["🪴", "🖼️"] },
  kelas: { bg: "linear-gradient(#e3eeff, #f3f8ff 62%, #c9a77c 62.1%)", deco: ["🕰️", "📝"] },
  taman: { bg: "linear-gradient(#bfe4ff, #e9f7ff 60%, #9fdc86 60.1%)", deco: ["🌳", "🌷"] },
  lapangan: { bg: "linear-gradient(#bfe4ff, #e9f7ff 55%, #7fd16e 55.1%)", deco: ["🥅", "🌳"] },
};

const B = "👦", S = "👧", I = "👩", P = "👨", G = "👩‍🏫", D = "🧒";

export const CAST: Record<Speaker, string> = { Bima: B, Sari: S, Ibu: I, Bapak: P, "Bu Guru": G, Dodi: D };

export type Scene = {
  place: Place;
  speaker?: Speaker; // kosong = narator
  cast: string[]; // emoji karakter di panggung (maks. 2)
  prop?: string; // gambar besar pendukung di atas panggung
  text: string;
};

export const STORIES: Record<number, Scene[]> = {
  1: [
    { place: "pagi", cast: [B], prop: "🌅", text: "Pagi hari yang cerah. Matahari mulai terbit." },
    { place: "kamar", speaker: "Bima", cast: [B], prop: "☀️", text: "Hoaam... Selamat pagi, Matahari! Aku bangun pagi hari ini." },
    { place: "kamar", speaker: "Ibu", cast: [B, I], prop: "🛏️", text: "Selamat pagi, Bima! Ayo rapikan tempat tidur, lalu beribadah." },
    { place: "mandi", speaker: "Bima", cast: [B], prop: "🚿", text: "Aku mandi dan sarapan. Badanku jadi segar!" },
    { place: "taman", cast: [B], prop: "🎒", text: "Bangun pagi membuat Bima semangat ke sekolah. Sekarang, ayo bantu Bima!" },
  ],
  2: [
    { place: "taman", cast: [S], prop: "🏫", text: "Sari berangkat ke sekolah dengan gembira." },
    { place: "kelas", speaker: "Bu Guru", cast: [S, G], text: "Selamat pagi, anak-anak! Dengarkan Bu Guru menjelaskan, ya." },
    { place: "kelas", speaker: "Sari", cast: [S], prop: "👂", text: "Aku dengarkan Bu Guru baik-baik." },
    { place: "kelas", speaker: "Bu Guru", cast: [S, G], prop: "📚", text: "Kalau mau pinjam buku bacaan, pergilah ke perpustakaan." },
    { place: "kelas", speaker: "Sari", cast: [S], prop: "✏️", text: "Aku rajin belajar. Sekarang aku bisa banyak hal baru! Ayo bantu Sari!" },
  ],
  3: [
    { place: "rumah", cast: [B], prop: "😋", text: "Bima pulang sekolah. Perutnya keroncongan." },
    { place: "dapur", speaker: "Bima", cast: [B, I], text: "Ibu, aku lapar!" },
    { place: "dapur", speaker: "Ibu", cast: [B, I], prop: "🧼", text: "Cuci tangan dulu, ya. Lalu kita makan sayur dan buah." },
    { place: "dapur", speaker: "Ibu", cast: [B, I], prop: "💧", text: "Minumnya air putih, bukan minuman yang terlalu manis." },
    { place: "dapur", speaker: "Bima", cast: [B], prop: "🥦", text: "Enak! Makan sehat membuat tubuhku kuat. Ayo bantu Bima!" },
  ],
  4: [
    { place: "taman", cast: [S, D], prop: "🌳", text: "Di taman, Sari bertemu teman baru." },
    { place: "taman", speaker: "Sari", cast: [S, D], text: "Halo! Namaku Sari. Siapa namamu?" },
    { place: "taman", speaker: "Dodi", cast: [S, D], prop: "👋", text: "Halo, Sari! Namaku Dodi. Ayo main bersama!" },
    { place: "taman", speaker: "Sari", cast: [S, D], prop: "🧸", text: "Boleh aku pinjam mainanmu, Dodi?" },
    { place: "taman", cast: [S, D], prop: "🤝", text: "Dodi terjatuh. Sari cepat menolongnya. Berteman itu menyenangkan!" },
  ],
  5: [
    { place: "lapangan", cast: [B], prop: "⚽", text: "Hari ini cerah. Bima bermain di lapangan." },
    { place: "lapangan", speaker: "Bima", cast: [B, D], prop: "🤸", text: "Ayo pemanasan dulu supaya badan siap!" },
    { place: "lapangan", speaker: "Dodi", cast: [B, D], prop: "⚽", text: "Ayo, Bima! Tendang bolanya!" },
    { place: "lapangan", speaker: "Bima", cast: [B], prop: "💧", text: "Hore, seru! Sekarang aku minum air dulu." },
    { place: "lapangan", cast: [B, D], prop: "💪", text: "Bermain dan berolahraga membuat badan kuat dan gembira. Ayo bantu Bima!" },
  ],
  6: [
    { place: "rumah", cast: [S], prop: "🌿", text: "Sari pulang dengan badan kotor setelah bermain." },
    { place: "rumah", speaker: "Ibu", cast: [S, I], prop: "🧼", text: "Sari, ayo mandi dan cuci tangan pakai sabun." },
    { place: "rumah", speaker: "Sari", cast: [S], prop: "🤧", text: "Kalau batuk, aku tutup mulut dengan tisu atau siku." },
    { place: "rumah", speaker: "Sari", cast: [S, I], prop: "🤒", text: "Ibu, badanku kurang enak. Aku bilang pada Ibu, ya." },
    { place: "rumah", cast: [S, I], prop: "💖", text: "Badan bersih dan sehat membuat Sari ceria. Ayo bantu Sari!" },
  ],
  7: [
    { place: "rumah", cast: [B], prop: "🧸", text: "Mainan Bima rusak. Bima sedih sebentar." },
    { place: "rumah", speaker: "Bima", cast: [B], prop: "🤔", text: "Aku tidak mau menangis. Aku harus memikirkan cara memperbaikinya." },
    { place: "rumah", speaker: "Bima", cast: [B], prop: "🚀", text: "Ada kardus bekas! Aku buat roket mainan yang baru!" },
    { place: "rumah", speaker: "Bima", cast: [B, P], prop: "❓", text: "Aku belum tahu cara menempelnya. Aku bertanya pada Bapak." },
    { place: "rumah", speaker: "Bapak", cast: [B, P], prop: "👍", text: "Pintar! Bertanya itu hebat. Ayo bantu Bima!" },
  ],
};
