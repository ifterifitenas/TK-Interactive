# 7 KAIH – Tujuh Kebiasaan Anak Indonesia Hebat

Web interaktif untuk anak TK, dibuat dengan Next.js (App Router) + TypeScript.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Alur

Beranda → Menu 7 KAIH → Cerita bergaya game novel → Aktivitas (seret/ketuk gambar yang benar ke karakter) → Kuis (2 soal, pilih gambar) → Reward → Koleksi

| Rute | Isi |
| --- | --- |
| `/` | Beranda |
| `/menu` | Pemilih pulau (satu pulau per layar, geser kiri-kanan) |
| `/kebiasaan/[id]` | Cerita bergaya game novel (dialog, karakter, narasi suara) |
| `/kebiasaan/[id]/aktivitas` | Aktivitas seret/ketuk gambar |
| `/kebiasaan/[id]/kuis` | Kuis pilih gambar |
| `/kebiasaan/[id]/reward` | Selamat + lencana |
| `/koleksi` | Progress & koleksi bintang |
| `/pengaturan` | Hapus progres |

## Mengubah konten

Semua cerita, kegiatan, soal kuis, warna, dan lencana ada di `lib/data.ts`.
Progres tersimpan di `localStorage` (`lib/progress.tsx`). Suara memakai Web Speech API
bahasa `id-ID` (`lib/speak.ts`); ketersediaan suara Indonesia tergantung browser/perangkat.

## Ide pengembangan

- Ganti emoji dengan ilustrasi karakter (taruh di `public/`, pakai `next/image`).
- Tambah efek suara & rekaman narasi (`public/audio/*.mp3`).
- Simpan progres per anak (login/profil) dengan database.

## Ramah anak pra-baca

- Setiap layar membacakan teksnya otomatis (tombol 🔊 untuk mengulang). Browser baru mengizinkan
  suara setelah layar disentuh sekali, jadi sambutan di beranda bisa belum berbunyi sampai itu.
- Efek suara dibuat dengan Web Audio (`lib/sfx.ts`), tanpa file. Tombol 🔔/🔕 mematikan semua suara.
- Karakter bereaksi (`components/Character.tsx`): melompat saat benar, menggeleng saat salah.
- Jawaban salah tidak menghukum: karakter berpikir, item meredup, dan suara mengajak mencoba lagi.
- Setelah jawaban benar, layar lanjut otomatis; tombol ▶ besar tersedia untuk melewati jeda.

## Cerita game novel

Tiap kebiasaan punya 5 scene dialog di `lib/stories.ts` (latar, karakter, gambar pendukung, teks).
Teks muncul seperti mengetik dan dibacakan otomatis. Ketuk panggung/kotak dialog, tombol ▶, atau
tekan Spasi/→ untuk lanjut; ◀ untuk kembali. Isi cerita sengaja memuat jawaban soal kuis supaya
anak bisa menjawab dari apa yang baru didengar.

## Pemilih pulau

`/menu` menampilkan satu pulau per layar dengan pulau tetangga mengintip di sisi. Geser dengan jari,
trackpad, mouse (seret), tombol ◀ ▶, titik di bawah, atau panah keyboard. Ketuk pulau yang di tengah
atau tombol ▶ Main untuk masuk. Nama pulau dibacakan otomatis saat berpindah.

- Pulau dibuka berurutan. Matikan di `lib/config.ts` (`SEQUENTIAL_UNLOCK = false`) kalau ingin semua terbuka.
- Pulau di `components/Island.tsx` masih berupa SVG sementara. Ganti dengan ilustrasi final
  (pertahankan props `id`, `done`, `locked`). Awan penutup dan bendera bintang digambar di atasnya.
