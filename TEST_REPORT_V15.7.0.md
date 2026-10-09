# Laporan Pengujian V15.7.0 — SIMRS PROTOTYPE

## Ringkasan hasil

- **Sintaks JavaScript:** `app.js` dan `sw.js` lulus `node --check`.
- **Self-test logika internal:** 54 dari 54 pemeriksaan lulus.
- **Browser smoke test Chromium:** 20 dari 20 skenario lulus; tidak ada `console.error` atau `pageerror` pada skenario tersebut.
- **Uji migrasi regresi V15.6.0 → V15.7.0:** jumlah booking, kunjungan, admisi, dan resep dipertahankan; referensi bed dan ward admisi aktif tetap valid; username tetap unik.
- **Integritas paket:** arsip ZIP diverifikasi menggunakan `unzip -t` setelah dibuat.

## Cakupan pengujian

1. Monitor perawat rawat jalan tetap mengikuti poli akun walaupun URL dimodifikasi untuk meminta poli lain.
2. Monitor rawat inap mengikuti `wardId` penugasan, menampilkan seluruh bed di ruang tugas, status kosong/terisi, serta nama pasien pada bed yang ditempati.
3. Aplikasi pasien menampilkan hirarki gedung, lantai, ruangan, kamar, dan bed pada perjalanan rawat inap.
4. Master data memuat 36 ruang reguler dan 2 ruang VVIP, dengan 10 kamar × 3 bed per ruang reguler dan 20 kamar × 1 bed per ruang VVIP.
5. Perubahan nama ruangan dapat disimpan; perubahan ketua shift di ruang demo memperbarui akun perawat yang ditautkan.
6. Setiap ruang memiliki kepala ruang dan roster untuk shift pagi, sore, dan malam. Jadwal awal 06.00–14.00, 14.00–22.00, dan 22.00–06.00 bersifat editable.
7. Navbar dibatasi maksimal enam menu, tidak menampilkan tombol “Lainnya”, dan Chat dapat dibuka dari kiri atas.
8. Akun Admin, dokter, triase IGD, laboratorium, radiologi, farmasi, kasir, loket, dan pasien diuji untuk navbar serta akses Chat.
9. Akses cepat Admin berisi 19 modul tambahan dan tetap dapat digunakan di viewport ponsel 390 px tanpa horizontal overflow.
10. Self-test memeriksa booking/antrean bersama, isolasi role, akun per unit, akun pasien demo bersih, keterkaitan resep/admisi, dan konsistensi struktur ruangan.

## Struktur awal rawat inap

- 3 gedung, masing-masing memiliki 4 lantai reguler dengan 3 ruangan per lantai: **36 ruang reguler**.
- Gedung A lantai 5 dan 6 memiliki **2 ruang VVIP**.
- Kapasitas struktur yang dikelola: **400 kamar dan 1.120 bed** (360 kamar/1.080 bed reguler serta 40 kamar/40 bed VVIP).
- Data baseline juga mempertahankan 7 unit khusus legacy dengan 14 bed yang tidak termasuk hitungan 400 kamar/1.120 bed struktur reguler/VVIP. Karena itu data keseluruhan awal memiliki 45 record ruang/unit dan 1.134 record bed.

## Batasan pengujian dan prototype

- Browser smoke test dijalankan di Chromium dengan DOM dan penyimpanan lokal terisolasi; ini bukan pengujian lintas browser pada hosting produksi.
- Data disimpan dalam `localStorage`, sehingga tidak tersinkron antarperangkat dan tidak cocok untuk operasional klinis nyata.
- Integrasi Mobile JKN, SIMRS rumah sakit, sistem billing, farmasi, dan identitas nasional masih simulasi lokal; tidak ada klaim integrasi API eksternal aktif.
- Sistem belum boleh dipakai untuk pelayanan nyata sebelum ada backend terpusat, autentikasi/otorisasi server, audit trail, backup, keamanan, validasi klinis, dan UAT bersama rumah sakit.
