# Laporan Pengujian V15.5.0 — SIMRS PROTOTYPE

## Status

Pemeriksaan logika sisi klien berhasil untuk skenario yang tercantum di bawah. Paket ini tetap prototype dan belum dinyatakan layak produksi.

## Pemeriksaan yang dilakukan

- Sintaks JavaScript `app.js` dan `sw.js` diperiksa dengan Node.js.
- Self-Test internal aplikasi: 37 pemeriksaan lulus.
- Migrasi data berulang: booking dan kunjungan uji pada akun demo baru tetap ada setelah `migrateData` dijalankan kembali.
- Akun demo: 10 akun unik bernomor 1–10 tersedia; data awal tidak berisi booking, kunjungan, admisi, atau resep untuk akun baru; akun demo lama tidak lagi digunakan.
- Navbar pasien: 5 tab utama; Rawat Jalan, Informasi, dan Riwayat tersedia; Rawat Inap, Monitor, dan Chat tidak muncul sebagai tab tersendiri.
- Perjalanan pasien: skenario Rawat Jalan menampilkan nomor antrean dan tidak menampilkan kartu Live Queue Monitor terpisah; skenario Rawat Inap tidak mencampur perjalanan Rawat Jalan/IGD; episode Rawat Inap tetap tampil saat pasien menunggu penyelesaian tagihan.
- Informasi: pengumuman dapat disimpan oleh admin dan muncul di sisi pasien tanpa formulir balasan.
- Chat: skenario pesan pasien → inbox staf → balasan staf berjalan; notifikasi balasan ditujukan ke pasien terkait.
- Integrasi farmasi: pemeriksaan antrean Rawat Jalan, Rawat Inap, dan IGD menguji isolasi unit; resep harus tertaut pada episode.
- Perbandingan berkas: `style.css` tidak diubah dari baseline V15.4.0.
- Arsip rilis diuji ulang menggunakan pemeriksaan integritas ZIP.

## Batas pengujian

- Pengujian logika dijalankan di runtime JavaScript dengan DOM mock; ini bukan uji visual lintas browser/perangkat secara penuh.
- Data prototype menggunakan `localStorage` dan sinkronisasi tab pada origin yang sama. Tidak ada backend/database bersama, push notification terpusat, atau sinkronisasi antarperangkat.
- Alur perubahan jadwal/dokter lewat chat adalah komunikasi; perubahan booking dan penugasan tetap harus disimpan melalui alur operasional yang berwenang.
- Sebelum penggunaan nyata, diperlukan pengujian manual oleh pemilik proyek, validasi data, keamanan, otorisasi server, backup, dan integrasi backend.
- Migrasi akun lama diuji dengan data sintetis V15.4.0: akun dan kunjungan demo lama dihapus, sementara akun baru dan data uji milik akun baru tetap dipertahankan.
- Skenario perjalanan pasien diuji untuk memastikan antrean tidak mengirim notifikasi rawat jalan saat perjalanan utama sedang Rawat Inap.
