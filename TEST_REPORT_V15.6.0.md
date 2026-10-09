# Laporan Pengujian V15.6.0 — SIMRS PROTOTYPE

## Ringkasan hasil

- **Sintaks JavaScript:** `app.js` dan `sw.js` lulus `node --check`.
- **Self-test logika internal:** 43 dari 43 pemeriksaan lulus pada Node.js VM terisolasi.
- **Integritas ZIP:** paket rilis dibuat dan diverifikasi dengan pemeriksaan CRC seluruh entri arsip.
- **Uji visual browser penuh:** belum berhasil diselesaikan pada runtime ini; jangan menganggap laporan ini sebagai uji visual lintas browser/perangkat.

## Pemeriksaan yang ditambahkan untuk V15.6.0

1. Booking Reguler hanya menerima H-1, H-2, dan H-3; tanggal H+3 baru lolos mulai pukul 00.01. Booking hari H dan tanggal lebih jauh ditolak.
2. Booking Eksekutif dapat untuk hari H sampai tepat pukul 12.00, dan H-1/H-2/H-3; setelah pukul 12.00 atau lebih dari H-3 ditolak.
3. Generator nomor antrean memindai booking dan kunjungan yang sudah tersimpan untuk poli/tanggal yang sama sebelum mengeluarkan nomor baru, termasuk booking yang diberi label sumber Mobile JKN (simulasi).
4. Role demo staf lintas unit tersedia: triase/dokter/perawat IGD, Farmasi/Kasir per unit, Admisi Rawat Inap, Laboratorium, dan Radiologi.
5. Pembatasan menu diuji: petugas IGD tidak membuka Rawat Inap atau menu pasien; petugas Laboratorium tidak membuka Radiologi/IGD; akun pasien tidak membuka IGD atau route Rawat Inap tersendiri.
6. Sepuluh akun pasien demo tetap bersih dari booking, antrean, kunjungan, admisi, resep, dan riwayat awal.
7. Tema CSS dibandingkan dengan baseline V15.5.0. Hanya empat baris yang berubah: ujung gradasi ungu kanan pada token warna, gradasi utama, cincin gradasi, dan hover tombol utama. Stop biru kiri dan biru/indigo tengah tidak berubah.

## Batas integrasi antrean

Antrean bersama ini menyelaraskan nomor untuk seluruh data booking/kunjungan yang tersedia di penyimpanan simulasi yang sama. **Ini bukan koneksi nyata ke Mobile JKN.** Untuk mencegah bentrok nomor antara aplikasi RS, Mobile JKN, dan loket pada penggunaan nyata, rumah sakit memerlukan backend/database antrean bersama dan integrasi resmi dengan sistem yang digunakan rumah sakit. `localStorage` tidak dapat menyinkronkan nomor secara andal antarperangkat/browser.

## Batas pengujian

- Pemeriksaan logika dilakukan dalam Node.js VM dengan data demo; ini bukan uji penerimaan klinis.
- Uji visual interaktif di browser tidak berhasil diselesaikan di runtime ini, sehingga pemilik proyek masih perlu melakukan smoke test tampilan dan alur klik pada browser/perangkat target.
- Prototype tidak boleh digunakan untuk keputusan klinis nyata atau menggantikan SIMRS produksi.
