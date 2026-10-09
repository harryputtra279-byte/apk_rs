# Laporan Pengujian V15.7.1 — Perbaikan Booking Rawat Jalan

## Perubahan
- Memperbaiki form booking petugas yang sebelumnya mengizinkan pemilihan tanggal sampai H+7.
- Mengubah maksimum tanggal form petugas menjadi H+3.
- Menambahkan validasi bisnis saat submit; batas HTML saja tidak dijadikan pengaman tunggal.
- Menyatukan aturan tanggal booking petugas dengan aturan yang telah disepakati pada sisi pasien.

## Aturan yang diuji
- Reguler: hanya H-1, H-2, H-3; hari H melalui pendaftaran langsung.
- H-3 baru berlaku mulai 00.01 WIB.
- Eksekutif: hari H sampai pukul 12.00 WIB inklusif, atau H-1/H-2/H-3.
- Tanggal lebih dari H+3, termasuk satu bulan ke depan, ditolak.

## Hasil pemeriksaan aktual
- `node --check app.js`: lulus.
- `node --check sw.js`: lulus.
- Unit test langsung atas fungsi validasi tanggal: **11/11 lulus**.
- Pemeriksaan statis form petugas (maksimum H+3 dan pemanggilan validasi bisnis saat submit): lulus.
- Integritas arsip ZIP (`unzip -t`): lulus.

## Batasan
- Uji browser otomatis penuh tidak diklaim pada rilis ini. Pengujian dilakukan pada fungsi validasi aktual yang diekstrak dari source, sintaks JavaScript, pemeriksaan form, dan integritas arsip.
- Prototype masih menggunakan localStorage; bukan integrasi backend rumah sakit atau API Mobile JKN.
