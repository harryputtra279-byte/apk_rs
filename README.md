# SIMRS Terpadu — RSU Sehat Sentosa

Aplikasi manajemen rumah sakit (PWA) yang mencakup alur lengkap **Pendaftaran → Poli → Laboratorium → Farmasi → Kasir → Obat Diambil**, dengan rekam medis yang terlihat lintas poli. Dibangun murni dengan HTML/CSS/JavaScript (tanpa framework atau dependency eksternal) agar ringan, cepat, dan bisa dipasang (install) sebagai aplikasi serta dipakai offline.

## Cara menjalankan

**Cepat (lokal):** buka langsung `index.html` di browser modern (Chrome/Edge/Firefox/Safari).

**Sebagai PWA yang sesungguhnya** (agar Service Worker & "Install App" aktif, wajib disajikan lewat server, bukan `file://`):
```bash
npx serve .
# atau
python3 -m http.server 8080
```
lalu buka `http://localhost:8080`.

**Hosting produksi:** unggah seluruh isi folder ini (`index.html`, `manifest.json`, `sw.js`, ikon) ke static hosting apa pun — Netlify, Vercel, GitHub Pages, cPanel/shared hosting, atau server internal rumah sakit. Tidak perlu proses build/compile; semua file statis.

## Akun demo

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Pendaftaran (Loket) | `loket` | `loket123` |
| Dokter — Poli Umum | `dokter.umum` | `dokter123` |
| Dokter — Poli Anak | `dokter.anak` | `dokter123` |
| Dokter — Poli Gigi | `dokter.gigi` | `dokter123` |
| Dokter — Poli Jantung | `dokter.jantung` | `dokter123` |
| Laboratorium | `lab` | `lab123` |
| Farmasi | `farmasi` | `farmasi123` |
| Kasir | `kasir` | `kasir123` |

Atau gunakan tombol akun demo di halaman login untuk login sekali klik.

## Alur & integrasi antar modul

1. **Booking (opsional, H-1 s/d H-3)** — booking BPJS disimulasikan sebagai data masuk dari JKN Mobile, atau booking mandiri untuk pasien umum. Keduanya berbagi **satu nomor urut yang sama** per poli & tanggal (BPJS dapat No. 5 → umum berikutnya otomatis No. 6, dst).
2. **Check-in (hari-H)** — pasien check-in via scan QR (kamera, pakai Web API `BarcodeDetector` bawaan browser) atau input kode manual. Setelah check-in, booking berubah jadi kunjungan aktif hari itu dengan nomor antrian yang **sama persis** dengan yang didapat saat booking.
3. **Pendaftaran (jalur walk-in)** — pasien baru/lama tanpa booking tetap bisa mendaftar langsung; nomor antriannya otomatis melanjutkan urutan yang sama (tidak bentrok dengan yang sudah dibooking).
4. **Poli** — dokter memanggil pasien, melihat riwayat rekam medis dari poli mana pun, mengisi tanda vital & diagnosis, membuat e-resep, atau merujuk ke laboratorium.
5. **Laboratorium** *(opsional)* — hasil pemeriksaan dikirim kembali dan langsung tampil ke dokter yang merujuk.
6. **Farmasi** — resep masuk otomatis dari poli, stok berkurang otomatis saat obat disiapkan, ada peringatan stok tidak cukup.
7. **Kasir** — rincian tagihan otomatis terhitung (registrasi + konsultasi + obat + lab), dengan simulasi tanggungan BPJS/Asuransi.
8. **Obat diambil** — setelah pembayaran, status berubah menjadi "Obat Siap Diambil"; petugas farmasi menyerahkan obat dan kunjungan selesai.
9. **Rekam Medis & Dashboard** — semua data di atas terhubung dalam satu penyimpanan sehingga riwayat pasien, statistik, booking hari ini, dan stok selalu konsisten di seluruh modul.

Daftar poli saat ini (11): Umum, Gigi, Anak, Kandungan, Mata, THT, Jantung, Kulit & Kelamin, **Penyakit Dalam, Syaraf, Paru**.

## Tentang integrasi BPJS Kesehatan / Mobile JKN

Ini **simulasi alur & titik integrasi**, bukan koneksi langsung ke server BPJS Kesehatan — sambungan sungguhan butuh kerja sama resmi dan akses API (mis. Antrean Online / Vclaim) dari BPJS Kesehatan ke rumah sakit. Yang sudah dibangun:
- Tab "BPJS / JKN Mobile" di menu **Booking Antrian** mensimulasikan data booking yang *akan* diterima dari JKN Mobile via API — tinggal ganti bagian input manual ini dengan handler webhook/API resmi saat sudah tersedia.
- Penomoran antrian gabungan (BPJS + umum, satu urutan) dan check-in QR sudah berfungsi penuh dan tidak perlu diubah saat integrasi resmi dipasang.

## Tentang check-in barcode/QR

Menggunakan `getUserMedia` (akses kamera) + `BarcodeDetector` (Web API bawaan browser, didukung Chrome/Edge/Android; **belum didukung Safari/iOS & Firefox**) — jika tidak didukung atau kamera tidak diizinkan, otomatis beralih ke input kode manual sehingga check-in tetap bisa dilakukan. Kamera **butuh HTTPS** (atau localhost) untuk aktif — tidak akan berfungsi dibuka langsung dari file lokal atau di dalam pratinjau chat ini, tapi akan berfungsi normal begitu di-hosting.

## Keterbatasan versi saat ini (penting dibaca sebelum produksi)

- **Penyimpanan lokal per perangkat.** Data memakai `localStorage` browser, sehingga loket, poli, farmasi, dan kasir yang berjalan di **komputer/perangkat berbeda tidak akan otomatis sinkron**. Versi ini cocok untuk demo, uji alur kerja, dan pelatihan di satu perangkat.
- **Untuk produksi multi-perangkat**, langkah berikutnya adalah membangun backend (mis. Node.js/PHP + PostgreSQL/MySQL) dengan API dan autentikasi yang aman, lalu PWA ini tinggal disambungkan ke API tersebut — struktur data (`patients`, `visits`, `prescriptions`, `transactions`, dst.) sudah dirancang agar mudah dipetakan ke tabel database.
- **Simulasi tanggungan BPJS/Asuransi** di kasir hanyalah ilustrasi (BPJS 100%, Asuransi 80%) — bukan perhitungan tarif INA-CBG yang sesungguhnya.
- **Password akun demo** tersimpan polos untuk kebutuhan demo; produksi wajib memakai hashing & autentikasi sisi server.
- Cetak tiket/kwitansi memakai `window.print()` bawaan browser (area cetak sudah dipisahkan agar rapi).

## Struktur file

CSS dan JavaScript sudah dipisah dari HTML (bukan lagi satu file gabungan):

```
index.html      → struktur halaman saja
style.css       → seluruh styling (tema "Glass UI")
app.js          → seluruh logika aplikasi
qrcode.lib.js   → pustaka pembuat QR code (open source, MIT license) untuk kode check-in booking
manifest.json   → metadata PWA (nama, ikon, warna tema)
sw.js           → service worker (cache app-shell agar bisa dibuka offline)
icon-*.png      → ikon aplikasi
```

Ketiganya harus berada di folder yang sama saat dibuka/di-hosting (index.html memanggil `style.css` dan `app.js` lewat path relatif).

## Arah desain

Tampilan mengikuti bahasa desain **"Glass UI"** yang mulai dipakai Samsung di One UI 8.5/9 terbaru (terinspirasi Liquid Glass): panel kaca buram (blur + translucent), sudut sangat membulat, elemen mengambang, navigasi bawah berbentuk pil di layar HP, dan lembar menu (bottom sheet) untuk menu tambahan & akun — sambil tetap mempertahankan warna teal klinis khas aplikasi ini.

Beri tahu saya modul atau fitur apa yang ingin ditambah/disesuaikan — misalnya menambah poli lain, modul radiologi terpisah, rawat inap, atau menyambungkan ke backend sungguhan.


## ✨ Peningkatan SIMRS — Operational Command Center

Versi pengembangan ini mempertahankan identitas UI glassmorphism dan menambahkan lapisan monitoring operasional:

- Dashboard Operational Command Center dengan KPI pasien, antrean, dokter, bed, pendapatan, dan stok.
- Antrean aktif per poli: nomor sedang dilayani, jumlah menunggu, estimasi waktu tunggu, dan progres.
- Status booking terstruktur: BOOKED, CHECK-IN, DIBATALKAN, TIDAK HADIR, DIJADWALKAN ULANG, dan KADALUARSA.
- Estimasi waktu tunggu berdasarkan konfigurasi rata-rata waktu pelayanan.
- Pusat notifikasi internal untuk booking/check-in dan aktivitas operasional.
- Reschedule booking dan pembatalan dengan alasan.
- Penandaan pasien/booking tidak hadir.
- Kuota booking per poli/tanggal.
- Monitoring ketersediaan dokter: tersedia, terlambat, tidak praktik.
- Rancangan alternatif dokter dengan spesialisasi yang sama.
- Pencarian pasien lintas NIK, nomor rekam medis, dan nama.
- Master data diperluas dengan struktur fasilitas.
- Matriks Role-Based Access Control (RBAC).
- Audit log aktivitas pengguna.
- Alert antrean panjang, dokter tidak praktik, stok kritis, dan bed penuh.
- Bed Management dengan status kosong/terisi dan ringkasan per bangsal.
- Ringkasan alur BOOKING → CHECK-IN → MENUNGGU → DIPERIKSA → SELESAI.

> **Catatan keamanan:** project ini adalah prototype/portfolio. Data pasien demo harus berupa data fiktif. Penyimpanan `localStorage`, password demo, dan logic client-side bukan pengganti backend produksi, database server, enkripsi, manajemen secret, dan kontrol akses sisi server.

## 🏥 Struktur Layanan RSUD R.T. Notopuro

Versi ini memprioritaskan pemodelan layanan berdasarkan informasi publik resmi RSUD R.T. Notopuro. Struktur aplikasi menggunakan hierarki:

`Rumah Sakit → Kelompok Layanan → Instalasi/Unit → Sub-layanan/Zona → Ruang/Kamar/Bed`

Katalog rawat jalan dipisahkan menjadi **Poliklinik Spesialis** dan **Poliklinik Eksekutif**, mengikuti daftar klinik yang dipublikasikan RSUD. Struktur IGD memuat Zona Merah dan Zona Kuning. Rawat inap dimodelkan dengan unit Tulip, Teratai, Mawar Kuning, Mawar Merah Putih, Graha Delta Husada, Rawat Intensif Terpadu, ICU, ICCU, PICU, NICU, HCU, dan Ruang Bersalin.

Untuk farmasi, aplikasi sengaja memisahkan:
- **Farmasi Rawat Jalan** — memantau resep dari poli dan waktu tunggu sampai obat diserahkan kepada pasien.
- **Farmasi Rawat Inap** — memantau instruksi obat untuk pasien yang dirawat dan waktu pemenuhan oleh farmasi; bukan dianggap sebagai pasien rawat inap mengambil obat sendiri.

Nama layanan di atas diambil dari halaman pelayanan publik RSUD. Detail lantai, nomor kamar, dan denah fisik tidak dibuat-buat apabila belum tersedia pada sumber resmi.

## 📊 Dashboard Operasional Harian

Dashboard menampilkan:
- jumlah pasien terdaftar hari ini;
- jumlah booking dan check-in;
- jumlah antrean menunggu;
- jumlah pasien sedang diperiksa;
- jumlah pasien selesai;
- monitoring setiap Poliklinik Spesialis dan setiap Poliklinik Eksekutif;
- jumlah resep Farmasi Rawat Jalan dan Farmasi Rawat Inap;
- waktu tunggu farmasi maksimum dan jumlah resep yang melewati SLA prototype;
- status dokter/poli;
- ringkasan IGD dan Rawat Inap;
- ketersediaan bed dan stok obat kritis.

**Catatan:** SLA farmasi pada prototype adalah parameter yang dapat dikonfigurasi untuk simulasi dan bukan klaim bahwa angka tersebut merupakan standar resmi RSUD R.T. Notopuro.

## 🔐 Keamanan

Project ini tetap merupakan prototype/portfolio. Data pasien harus fiktif. `localStorage`, password demo, dan autentikasi client-side tidak boleh dianggap sebagai kontrol keamanan produksi. Implementasi produksi membutuhkan backend, database server, sesi/token aman, audit server-side, enkripsi, backup, dan kontrol akses yang sesuai.

## Akun Demo Per Divisi

Akun demo dipisahkan agar setiap divisi dapat direview satu per satu tanpa mencampur alur Rawat Jalan, IGD, Rawat Inap, Farmasi, dan Kasir. Password demo bersifat dummy untuk portfolio lokal.

| Divisi | Username | Password |
|---|---|---|
| Rawat Jalan | `rawatjalan` | `rawatjalan123` |
| Dokter Rawat Jalan | `dokter.rajal` | `dokter123` |
| Farmasi Rawat Jalan | `farmasi.rajal` | `farmasi123` |
| Kasir Rawat Jalan | `kasir.rajal` | `kasir123` |
| Dokter IGD | `dokter.igd` | `dokter123` |
| Perawat IGD | `perawat.igd` | `perawat123` |
| Farmasi IGD | `farmasi.igd` | `farmasi123` |
| Kasir IGD | `kasir.igd` | `kasir123` |
| Dokter Rawat Inap | `dokter.ranap` | `dokter123` |
| Perawat Rawat Inap | `perawat.ranap` | `perawat123` |
| Farmasi Rawat Inap | `farmasi.ranap` | `farmasi123` |
| Kasir Rawat Inap | `kasir.ranap` | `kasir123` |

Menu Farmasi dan Kasir sekarang dipisahkan menjadi **Rawat Jalan, IGD, dan Rawat Inap**.

## Rawat Jalan UX v8

Versi ini memprioritaskan penyempurnaan alur Rawat Jalan tanpa menggantikan sistem rumah sakit yang sudah berjalan.

Cakupan workflow:
- Registrasi/booking dan check-in terintegrasi.
- Satu identitas pasien dan satu kunjungan sebagai sumber data lintas unit.
- Status perjalanan pasien: booking → check-in → screening → menunggu dokter → pemeriksaan → penunjang/review → farmasi/kasir → selesai.
- Screening awal dapat dicatat sebelum pasien masuk antrean dokter dan datanya ditampilkan kembali pada workspace dokter.
- Monitoring per poli: pasien terdaftar, booking, screening, menunggu dokter, diperiksa, penunjang, review, selesai, dan antrean farmasi.
- Peringatan keterlambatan dokter, pasien yang terlalu lama menunggu, dan farmasi yang melewati parameter SLA prototype.
- Riwayat rekam medis tetap dapat dibuka dari antrean.
- Rencana langkah berikutnya (farmasi, kontrol, penunjang, rawat inap, rujuk, atau selesai) ditampilkan di proses pemeriksaan.
- Hasil laboratorium dikembalikan ke status `Menunggu Review` agar dokter meninjau hasil sebelum kunjungan ditutup.

### Prinsip desain
Aplikasi ini diposisikan sebagai lapisan UX/operasional di atas sistem yang sudah ada. Tujuannya mengurangi input berulang, perpindahan pasien yang tidak perlu, waktu tunggu yang tidak terlihat, dan komunikasi manual yang dapat digantikan notifikasi/audit trail, tanpa mengambil keputusan klinis dari tenaga kesehatan.

Target desain menggunakan prinsip patient-centered care, continuity of care, workflow efficiency, auditability, dan interoperabilitas nasional/internasional. Klaim kepatuhan akreditasi internasional tidak dibuat; implementasi produksi tetap membutuhkan validasi SOP, kebijakan RSUD, keamanan, integrasi sistem, dan asesmen resmi.
