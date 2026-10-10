# SIMRS PROTOTYPE — V16.0.1

## Perubahan V16.0.1 — Penyempurnaan Workflow IGD
- Baseline langsung: V16.0.0 (versi terakhir yang dibuat); alur Rawat Jalan dan fitur versi sebelumnya dipertahankan.
- Mengembalikan dan memperjelas Perjalanan Saya untuk episode IGD aktif, termasuk triase, tindakan, penunjang, farmasi, observasi, dan proses pindah/pulang sesuai status tersimpan.
- Menambahkan navbar Beranda IGD untuk akun klinis IGD serta farmasi/kasir yang ditugaskan ke IGD, berisi ringkasan pasien aktif, pasien baru, pelayanan, observasi, rencana admisi, perpindahan terkonfirmasi, kepulangan, dan keterisian bed.
- Menambahkan Monitor IGD berisi Zona Hijau, Zona Kuning, dan Zona Merah, masing-masing 20 bed (total 60). Status bed: kosong, terisi, persiapan/dibersihkan, dan perbaikan.
- Penempatan pasien ke bed dan konfirmasi pasien keluar dibatasi berdasarkan peran. Keputusan pulang belum mengakhiri episode sebelum pasien benar-benar keluar; perpindahan ke Rawat Inap mengakhiri episode IGD setelah admisi dikonfirmasi, sementara riwayat IGD tetap disimpan.
- Menu Riwayat terpisah di akun Dokter IGD dihilangkan untuk menghindari duplikasi dengan Rekam Medis; jejak audit tetap dipertahankan.
- Tema Glass UI, alur Rawat Jalan, serta aset dan fungsi lain yang tidak terkait perubahan ini dipertahankan.

> Batas pengujian V16.0.1: pemeriksaan sintaks, struktur berkas, konfigurasi PWA, dan pemeriksaan statis dilakukan. Pengujian browser interaktif end-to-end tidak berhasil dijalankan karena lingkungan browser memblokir navigasi; karena itu, pengujian tersebut tidak diklaim lulus.

# SIMRS PROTOTYPE — Portfolio / Demo

**Versi historis bagian ini:** V15.8.7  
**Baseline historis:** V15.8.5  
**Platform:** PWA / Web  
**Status:** Prototype portfolio, bukan SIMRS produksi

SIMRS PROTOTYPE adalah proyek portfolio untuk memperlihatkan kemampuan analisis kebutuhan, perancangan alur pelayanan rumah sakit, UI/UX, RBAC (hak akses berbasis peran), PWA, penyimpanan lokal, simulasi antrean, serta integrasi antar-modul pelayanan.

> **Penting:** aplikasi ini adalah prototype/demo. Bukan sistem resmi RSUD R.T. Notopuro, bukan pengganti SIMRS rumah sakit, dan bukan SOP resmi. Data demo bersifat fiktif. Implementasi produksi membutuhkan backend, database terpusat, autentikasi dan otorisasi server, audit terpusat, enkripsi, backup, monitoring, serta integrasi resmi.

## Perubahan V15.8.7 — Navbar dan Beranda Dokter

- Baseline langsung: V15.8.6.
- Navbar dokter memiliki lima menu: **Beranda, Poli, Monitor, Rekam Medis, Riwayat**. Menu Monitor tetap ditujukan untuk layar antrean di depan poli dan dibatasi pada poli yang ditugaskan ke akun dokter.
- Beranda dokter merangkum status kunjungan poli hari ini, Patient Journey, booking kontrol mendatang, serta informasi praktik terkini.
- Halaman Poli tetap menggabungkan dashboard sesi dokter, kontrol antrean, dan ruang pemeriksaan dalam satu halaman.
- Antrean dokter difokuskan pada pasien yang sudah selesai screening, dipanggil, sedang diperiksa, atau membutuhkan review. Tindakan screening awal hanya tersedia pada alur perawat.
- Tombol pasien yang sedang diperiksa menyediakan jalur untuk melanjutkan ruang pemeriksaan setelah kunjungan dipulihkan, tanpa membuat kunjungan tersebut selesai otomatis.
- Cache PWA dan versi aset dinaikkan ke V15.8.7.

> Batas pengujian V15.8.7: syntax JavaScript, JSON manifest, pemeriksaan statis, dan integritas ZIP diperiksa. Browser end-to-end interaktif penuh belum dapat diklaim lulus di lingkungan ini.

## 1. Baseline pengembangan

Baseline untuk versi ini adalah **V15.6.0 SIMRS Booking & Antrean Terpadu**, dengan lineage sebelumnya dari V15.5.0 Patient Journey Integration dan V15.4.0 Integrasi Antarunit. V15.7.0 menambahkan monitor terikat penugasan, master ruang/shift, dan standar navigasi petugas; V15.8.0 memulihkan menu Pelayanan superuser dan memperbaiki layout topbar responsif; V15.8.2 menyegarkan ikon, warna browser, dan border Glass 3D. V15.8.4 menindaklanjuti alur pemeriksaan bertab, autosave tanpa pop-up, serta penyimpanan draft resep terikat kunjungan. Pengujian interaktif tetap wajib sebelum dianggap final.

### Perubahan V15.8.6 — Penyederhanaan Ruang Kerja Dokter

- Baseline langsung V15.8.4 untuk rilis V15.8.5; gaya Glass 3D dan struktur modul utama dipertahankan.
- Kontrol antrean disederhanakan mengikuti status: **Panggil Berikutnya → Mulai Pemeriksaan → Selesaikan Pemeriksaan**. Tombol penyelesaian dari panel antrean mengarahkan ke konfirmasi pada formulir klinis yang sama; antrean berikutnya tidak dilepas diam-diam.
- Ketika halaman Rawat Jalan dibuka ulang setelah refresh, kunjungan yang masih `diperiksa` dan milik dokter aktif dipulihkan ke ruang pemeriksaan berdasarkan ID kunjungan. Draft tetap draft, bukan status selesai.
- Autosave draft mencakup tab aktif, data klinis, screening, pilihan rujukan, dan daftar resep. Perubahan tambah/hapus obat ikut disimpan. Status penyimpanan gagal ditampilkan secara eksplisit.
- Pada V15.8.5, lima tab pemeriksaan memakai lebar area kerja. V15.8.6 menyederhanakannya menjadi empat tab dokter dan memindahkan screening menjadi ringkasan baca-saja di panel kiri.
- Dokter/admin dapat mengoreksi catatan klinis kunjungan yang sudah selesai melalui tindakan khusus; nilai sebelumnya, nilai koreksi, akun, waktu, dan jenis koreksi disimpan dalam riwayat revisi. Resep yang sudah diproses farmasi tidak dapat diubah dari formulir koreksi klinis.
- Patient Journey hanya menampilkan tahap farmasi/pengambilan obat bila kunjungan memiliki resep berisi item. Resep yang sudah masuk antrean farmasi saat dokter masih memeriksa tidak membuat tahap Dokter tampak selesai atau tahap Farmasi tampak aktif bagi pasien sebelum finalisasi.
- Penyelesaian kasir hanya mengarahkan pasien ke pengambilan obat bila resep terkait masih aktif dan berisi item; resep kosong/dibatalkan tidak membuat tahap farmasi palsu.
- Cache PWA dan versi aset dinaikkan ke V15.8.5 agar browser mengambil file terbaru.

- Baseline langsung dari V15.8.5; integrasi antrean, draft, resep/farmasi, dan patient journey dipertahankan.
- Formulir screening hanya dapat dibuka oleh akun perawat (admin berwenang tetap dapat membantu); dokter melihat ringkasan screening baca-saja.
- Akun dokter memiliki empat tab: Pemeriksaan, Diagnosis, Resep, dan Riwayat. Data screening/vital tidak lagi diisi ulang di formulir dokter.
- Tata letak ruang kerja dokter memakai panel ringkasan di kiri (profil, screening, alergi, penjamin/metode pembayaran bila tercatat) dan formulir dokter di kanan; pada layar sempit berubah menjadi satu kolom.
- Penyimpanan draft dan finalisasi tidak mengosongkan keluhan atau tanda vital yang telah diinput oleh perawat ketika field tersebut tidak tersedia di halaman dokter.
- Versi aset dan cache PWA dinaikkan ke V15.8.6.

> Catatan pengujian V15.8.6: syntax dan integritas arsip diperiksa. Pengujian browser interaktif penuh belum tersedia di lingkungan ini; alur klik, pemulihan refresh, hak akses, serta regresi farmasi/patient journey masih harus diuji manual sebelum build dianggap tervalidasi penuh.

> Batas pengujian rilis: pemeriksaan sintaks JavaScript dan pemeriksaan integritas ZIP dijalankan. Browser headless di lingkungan kerja diblokir oleh kebijakan lingkungan, sehingga skenario interaktif penuh (termasuk refresh di tengah pemeriksaan, seluruh role, dan alur end-to-end) belum dapat diklaim lulus. Jalankan Audit Sistem dan skenario manual sebelum menggunakan build ini untuk demo.

Aturan pengembangan proyek:

1. Versi terbaru yang sudah dikirim dan disepakati menjadi baseline berikutnya.
2. Perubahan baru selalu dibuat dari baseline terakhir, bukan dari versi lama.
3. Fitur yang sudah benar harus dipertahankan.
4. Setiap perubahan harus melalui pemeriksaan syntax, UI, navigasi, role/RBAC, alur utama, dan regresi fitur sebelum ZIP diberikan.
5. README hanya diperbarui setelah fungsi aplikasi cukup stabil untuk didokumentasikan.

## Riwayat V15.6.0 — Aturan Booking & Antrean Bersama

- Booking Rawat Jalan Reguler online dibatasi pada H-1, H-2, dan H-3. Untuk tanggal kunjungan H+3, pemesanan mulai dibuka pukul 00.01 WIB pada hari H-3. Booking hari H untuk pasien reguler ditolak oleh validasi dan diarahkan untuk datang ke loket RS.
- Booking Rawat Jalan Eksekutif mengikuti pembukaan H-3 pukul 00.01 WIB, bisa memilih dokter, dan dapat dipesan pada hari H sampai pukul 12.00 WIB. Booking hanya dapat berhasil jika jadwal dokter dan slot/kuota masih tersedia; slot eksekutif yang jamnya sudah lewat tidak ditawarkan untuk booking hari H.
- Pasien Reguler tidak dapat memilih dokter. Sistem mengalokasikan dokter/sesi secara otomatis mengikuti jadwal dan kapasitas yang tersedia.
- Nomor antrean baru dihitung dari counter bersama per poli + tanggal, dengan pemindaian nomor booking dan kunjungan yang sudah tersimpan agar kanal simulasi Aplikasi RS, Mobile JKN, dan loket tidak membuat urutan lokal yang saling tumpang tindih.
- Akun demo staf ditambah dengan Petugas Triase IGD (`triase.igd`, sandi demo `triase123`). IGD tetap dimulai oleh petugas atau rujukan internal, bukan pendaftaran mandiri dari akun pasien.
- Warna hanya pada ujung gradasi ungu paling kanan yang dicerahkan menjadi ungu-magenta glossy (`#D946EF`). Stop biru kiri dan biru/indigo tengah serta layout lain dipertahankan.
- Audit internal ditambah untuk aturan booking, nomor antrean lintas kanal simulasi, dan pembatasan pendaftaran IGD.

> **Batas integrasi antrean:** nomor antrean bersama ini berlaku untuk data yang ada di database simulasi lokal. Kesamaan nomor dengan Mobile JKN nyata tidak bisa dijamin sampai tersedia backend dan koneksi/API resmi rumah sakit yang menyinkronkan booking lintas kanal. LocalStorage di browser tidak cukup untuk sinkronisasi perangkat berbeda.

## Perubahan V15.5.0 — Pengalaman Pasien & Akun Demo Bersih

- Navbar pasien tepat lima menu: Beranda, Rawat Jalan, Informasi, Booking Saya, dan Riwayat. Rawat Inap dan Monitor tidak lagi menjadi menu tersendiri di navbar pasien; fungsi rawat inap tetap ditampilkan pada Perjalanan Saya.
- Beranda memuat Profil Pasien dan satu komponen Perjalanan Saya untuk episode aktif. Prioritas perjalanan: Rawat Inap yang masih dirawat, lalu IGD aktif, lalu Rawat Jalan aktif. Tanpa episode aktif, tidak dibuat perjalanan palsu.
- Perjalanan Rawat Jalan memuat nomor antrean, poli, dokter jika sudah dialokasikan, jam kunjungan, estimasi waktu, dan alur tahapan. Estimasi ditandai sebagai perkiraan.
- Riwayat dipisahkan menjadi Rawat Jalan, Rawat Inap, dan IGD.
- Informasi pasien satu arah; Chat Pelayanan dua arah dengan inbox staf. Admin dapat menerbitkan pengumuman umum. Perubahan booking atau penugasan dokter tetap harus disimpan oleh petugas berwenang pada alur operasional, tidak otomatis berubah hanya karena percakapan chat.
- Lima akun demo Rawat Jalan dan lima akun demo Rawat Inap lama diganti menjadi sepuluh akun pasien fiktif bernomor 1–10. Setiap akun baru mulai tanpa booking, kunjungan, admisi, resep, atau riwayat. Satu akun terhubung ke identitas pasien yang sama pada episode layanan berikutnya.
- Cache PWA dan query aset dinaikkan mengikuti versi rilis masing-masing.

> Batas prototype: data disimpan di localStorage per browser/perangkat. Chat, pengumuman, dan pembaruan data belum tersinkron ke perangkat lain tanpa backend bersama.

## Perbaikan V15.4.0 — Integrasi Resep → Farmasi → Perjalanan Saya

- Relasi resep dan kunjungan diperiksa dua arah (`visit.resepId` dan `resep.visitId`) agar data lama yang salah satu tautannya kosong dapat dipulihkan.
- Antrean Farmasi Rawat Jalan dibaca dari resep berstatus `menunggu` yang terhubung ke kunjungan, bukan hanya dari status kunjungan hari ini. Resep yang masih menunggu tidak hilang hanya karena tanggal kunjungan bukan hari ini.
- Jika resep masih `menunggu` tetapi kunjungan salah tercatat sebagai `menunggu_bayar`, status dikembalikan ke `menunggu_farmasi` agar pasien tidak melewati proses farmasi.
- Perjalanan Saya mencari resep lewat relasi kunjungan maupun ID resep; tahap Farmasi dan Pengambilan Obat ditampilkan sesuai statusnya.
- Setelah farmasi menyiapkan obat, resep tetap terhubung ke kunjungan dan alur berlanjut ke kasir; setelah pembayaran, pasien muncul di daftar Obat Siap Diambil. Saat obat diserahkan, status resep menjadi `diambil`.
- UI dan style.css tidak dirombak.

> Catatan teknis: data prototype masih disimpan di `localStorage` browser/perangkat. Sinkronisasi antarperangkat atau antar-browser memerlukan backend/database bersama dan tidak bisa dijamin hanya dengan GitHub Pages statis.

## 2. Perubahan V14.6.2 — Patient Journey & Mobile Responsive Fix

Perubahan dibuat langsung dari baseline **V14.6.1**:

- Alur resep Rawat Jalan sekarang tetap menampilkan tahap **Pengambilan Obat — Ambil obat di farmasi** ketika kunjungan sudah berstatus `obat_siap`.
- Patient Journey memiliki fallback berdasarkan status `menunggu_farmasi` / `obat_siap` sehingga data lama yang belum memiliki `resepId` tidak kehilangan tahap pengambilan obat.
- Form Screening Perawat diperketat agar modal, field, dan konten tidak melewati viewport pada layar kecil.
- Form Pemeriksaan/Diagnosis Dokter diperketat agar area tombol dan input tidak menyebabkan horizontal overflow.
- Pengujian responsif dilakukan pada viewport **360×800, 390×844, dan 412×915**.
- Pengujian alur resep dilakukan untuk memastikan status bergerak dari **Farmasi → Kasir → Pengambilan Obat** dan tahap pengambilan obat tampil pada Patient Journey.
- Service Worker/cache dinaikkan ke **V14.6.2** agar browser mengambil aset aplikasi terbaru.

## 3. Perubahan V14.6.0 — UI Navbar Admin & Menu Sekunder

### Navbar Admin Super User

Navbar utama Admin sekarang terdiri dari **tepat lima menu** dan tidak lagi memiliki tombol `Lainnya` di bottom navbar:

**Dashboard | Rawat Jalan | Pendaftaran | Rawat Inap | Beranda**

Posisi dirancang dengan prinsip:

- Dashboard di sisi kiri.
- Beranda di sisi kanan.
- Pendaftaran berada di bagian tengah.
- Rawat Jalan dan Rawat Inap menjadi dua menu pelayanan utama di antara keduanya.

### Menu sekunder Admin

Menu yang sebelumnya berada di `Lainnya` tidak dihapus. Aksesnya dipindahkan ke **tombol `☰ Menu` di kiri atas topbar Admin**.

Tombol tersebut membuka folder glass berisi modul sekunder, antara lain:

- Booking
- IGD
- Laboratorium
- Radiologi
- Farmasi Rawat Jalan
- Farmasi Rawat Inap
- Farmasi IGD
- Kasir Rawat Jalan
- Kasir Rawat Inap
- Kasir IGD
- Rekam Medis
- Riwayat Aktivitas Sistem
- Master Data
- Audit Sistem
- Cek Antrian
- Monitor

`Pendaftaran` sengaja tidak lagi berada di folder tersebut karena sudah menjadi menu utama Admin.

### Prinsip UI

Menu utama digunakan untuk fungsi yang paling sering dipakai, sedangkan modul sekunder tetap tersedia melalui tombol Menu. Dengan demikian navbar tidak penuh, tetapi fungsi Admin tetap lengkap.

## 4. Modul yang tersedia

### Rawat Jalan

- Pendaftaran pasien
- Booking / antrean
- Klinik reguler dan eksekutif
- Alokasi dokter otomatis untuk klinik reguler
- Pemilihan dokter hanya untuk klinik eksekutif
- QR/barcode tiket antrean
- Check-in pasien
- Monitor antrean
- Rekam medis
- Riwayat pemeriksaan dokter

### Rawat Inap

- Admisi
- Sumber admisi: IGD, Rawat Jalan, Rujukan, Transfer Internal
- Kelas perawatan
- Bed management
- Status bed
- Transfer pasien
- CPPT
- Tanda vital dan simulasi NEWS2
- DPJP dan dokter jaga
- Perawat berdasarkan shift
- Handover shift
- Laboratorium dan Radiologi berdasarkan order
- Farmasi dan simulasi eMAR
- Rencana pulang
- Resume medis
- Billing dan pelepasan bed
- Patient Journey Rawat Inap

### Penunjang

- Laboratorium
- Radiologi
- Pengiriman hasil pemeriksaan
- Integrasi hasil dengan perjalanan pasien

### Administrasi

- Pendaftaran
- Booking
- Kasir Rawat Jalan
- Kasir Rawat Inap
- Kasir IGD
- Master Data
- Audit Sistem
- Monitor antrean

## 5. Navigasi berdasarkan role

### Admin Super User

**Dashboard | Rawat Jalan | Pendaftaran | Rawat Inap | Beranda**

Modul sekunder dibuka melalui **☰ Menu** di kiri atas.

### Petugas Rawat Jalan

**Pendaftaran | Booking | Poli | Monitor**

### Dokter Rawat Jalan

**Poli | Rekam Medis | Riwayat | Monitor**

### Dokter IGD

**IGD | Rekam Medis | Riwayat | Monitor**

### Dokter Rawat Inap

**Rawat Inap | Rekam Medis | Riwayat | Monitor**

### Perawat Rawat Jalan

**Beranda | Poli | Rekam Medis | Monitor**

### Perawat IGD

**IGD | Rekam Medis | Monitor**

### Perawat Rawat Inap

**Rawat Inap | Rekam Medis | Monitor**

### Laboratorium

**Beranda | Laboratorium**

### Radiologi

**Beranda | Radiologi**

### Farmasi / Kasir

Menu utama menyesuaikan unit kerja akun, sehingga modul yang tidak relevan tidak dipaksakan masuk ke `Lainnya`.

### Pasien

**Beranda | Rawat Jalan | Informasi | Booking Saya | Riwayat**

## 6. Akun demo per unit

Seluruh akun berikut hanya untuk pengujian prototype. Login cepat tersedia pada halaman masuk; password demo bukan kredensial produksi.

### Administrasi dan Rawat Jalan

| Unit / peran | Username | Password |
|---|---|---|
| Admin Super User | `admin` | `admin123` |
| Petugas Loket | `loket` | `loket123` |
| Petugas Rawat Jalan | `rawatjalan` | `rawatjalan123` |
| Dokter Poli Umum | `dokter.umum` | `dokter123` |
| Dokter Poli Anak | `dokter.anak` | `dokter123` |
| Dokter Poli Gigi | `dokter.gigi` | `dokter123` |
| Dokter Poli Jantung | `dokter.jantung` | `dokter123` |
| Dokter Poli Penyakit Dalam | `dokter.penyakitdalam` | `dokter123` |
| Perawat/Asisten Poli Umum | `asisten.umum` | `perawat123` |
| Perawat/Asisten Poli Anak | `asisten.anak` | `perawat123` |
| Perawat/Asisten Poli Gigi | `asisten.gigi` | `perawat123` |
| Perawat/Asisten Poli Jantung | `asisten.jantung` | `perawat123` |
| Perawat/Asisten Poli Penyakit Dalam | `asisten.penyakitdalam` | `perawat123` |

### IGD

| Unit / peran | Username | Password |
|---|---|---|
| Petugas Triase IGD | `triase.igd` | `triase123` |
| Dokter IGD | `dokter.igd` | `dokter123` |
| Perawat IGD | `perawat.igd` | `perawat123` |
| Farmasi IGD | `farmasi.igd` | `farmasi123` |
| Kasir IGD | `kasir.igd` | `kasir123` |

IGD tidak menyediakan pendaftaran mandiri dari akun pasien. Episode IGD dimulai melalui petugas/triase atau penerimaan rujukan internal sesuai alur prototype.

### Rawat Inap

| Unit / peran | Username | Password |
|---|---|---|
| Admisi Rawat Inap | `admisi.ranap` | `admisi123` |
| Dokter Rawat Inap / DPJP | `dokter.ranap` | `dokter123` |
| Dokter Jaga Shift Pagi | `dokter.jaga.pagi` | `dokter123` |
| Dokter Jaga Shift Sore | `dokter.jaga.sore` | `dokter123` |
| Dokter Jaga Shift Malam | `dokter.jaga.malam` | `dokter123` |
| Perawat Rawat Inap | `perawat.ranap` | `perawat123` |
| Perawat Shift Pagi | `perawat.ranap.pagi` | `perawat123` |
| Perawat Shift Sore | `perawat.ranap.sore` | `perawat123` |
| Perawat Shift Malam | `perawat.ranap.malam` | `perawat123` |
| Farmasi Rawat Inap | `farmasi.ranap` | `farmasi123` |
| Kasir Rawat Inap | `kasir.ranap` | `kasir123` |

### Penunjang dan layanan unit

| Unit / peran | Username | Password |
|---|---|---|
| Laboratorium | `lab` | `lab123` |
| Radiologi | `radiologi` | `rad123` |
| Farmasi Rawat Jalan | `farmasi.rajal` | `farmasi123` |
| Kasir Rawat Jalan | `kasir.rajal` | `kasir123` |

### Pasien demo

| Akun | Username | Password |
|---|---|---|
| Pasien 1–10 | `pasien.demo1` s.d. `pasien.demo10` | `pasien123` |

Sepuluh akun pasien menggunakan data fiktif dan mulai tanpa booking, nomor antrean, kunjungan, admisi, resep, atau riwayat. Akun yang sama dapat digunakan untuk mencoba alur Rawat Jalan dan kemudian episode layanan lain. Nomor 1–10 hanya label akun demo, bukan nomor antrean.

## 7. Teknologi

- HTML5
- CSS3
- JavaScript ES6+
- Progressive Web App (PWA)
- Service Worker
- localStorage
- BroadcastChannel
- QR generator lokal
- Browser Barcode Detection API sebagai opsi kamera

Prototype sengaja dibuat tanpa framework frontend besar agar source mudah dibaca, dipelajari, dan dipresentasikan sebagai portfolio.

## 8. Arsitektur prototype

```text
PWA / Browser
      │
      ├── UI / Role-based Navigation
      ├── Business Logic
      ├── Queue & Booking Simulation
      ├── Patient Journey
      └── localStorage
```

Untuk implementasi produksi, arsitektur yang disarankan:

```text
Web / PWA / Mobile
        ↓
API Gateway / Backend
        ↓
Authentication + Authorization
        ↓
Business Logic
        ↓
Database Terpusat
        ↓
Audit Log + Backup + Monitoring
```

## 8. Penyimpanan dan keamanan prototype

Prototype masih menggunakan `localStorage`, sehingga data hanya berada di browser/perangkat yang digunakan. Tidak ada sinkronisasi database pusat.

Jangan memasukkan:

- data pasien nyata
- NIK nyata
- password produksi
- API key
- private key
- kredensial rumah sakit

ke repository publik.

Untuk produksi diperlukan autentikasi server-side, RBAC server-side, session management, enkripsi, audit trail terpusat, backup, pemulihan bencana, logging, monitoring, serta kontrol akses database.

## 9. Batasan klinis

NEWS2 pada prototype hanya digunakan untuk simulasi monitoring dan **bukan alat diagnosis atau keputusan klinis**.

CPPT, resep, farmasi, laboratorium, radiologi, billing, BPJS, tarif, formularium, bed, DPJP, discharge, dan seluruh aturan pelayanan masih merupakan simulasi yang harus dikonfigurasi serta divalidasi terhadap kebijakan resmi ketika masuk tahap produksi.

## 10. Cara menjalankan

Dengan server lokal:

```bash
python3 -m http.server 8080
```

atau:

```bash
npx serve .
```

Kemudian buka alamat localhost yang diberikan server.

Untuk fitur PWA dan akses kamera, gunakan HTTPS atau localhost.

## 11. Tujuan portfolio

Proyek ini dibuat untuk menunjukkan kemampuan dalam:

- analisis kebutuhan sistem
- analisis alur bisnis rumah sakit
- desain UI/UX
- RBAC dan pemisahan role
- sistem antrean
- booking dan check-in QR/barcode
- Rawat Jalan
- Rawat Inap
- Patient Journey
- integrasi Farmasi, Laboratorium, Radiologi, dan Kasir
- PWA
- penyimpanan lokal
- dokumentasi teknis
- pengujian dan self-test
- perancangan sistem yang dapat dikembangkan menuju arsitektur backend terpusat

## 12. Status versi

| Versi | Fokus |
|---|---|
| V14.5.2 | Rawat Jalan, UI Penunjang, alokasi dokter klinik reguler |
| V14.6.1 | Penyempurnaan UI tombol hasil Lab/Radiologi dan posisi tombol Menu Admin |
| **V14.6.0** | **UI Navbar Admin dan pemindahan Menu Lainnya ke tombol kiri atas** |

**Baseline aktif untuk pengembangan berikutnya: V14.6.1**

---

**SIMRS PROTOTYPE — Portfolio / Demo**  
Dibuat sebagai proyek portfolio Sistem Informasi untuk menunjukkan kemampuan analisis, desain, implementasi frontend, business logic, RBAC, PWA, dan pengujian alur aplikasi.

## V15.4.0 — Integrasi alur antarunit (prototype)

- Memperkuat tautan resep ↔ kunjungan/admisi dan memisahkan antrean farmasi Rawat Jalan, Rawat Inap, dan IGD.
- Menambahkan permintaan/rujukan antarunit dengan status konfirmasi, termasuk rujukan Rawat Jalan ke IGD dan permintaan admisi dari IGD.
- Menambahkan order Radiologi Rawat Jalan/IGD; order Rawat Inap tetap terikat ke admisi. Hasil dikembalikan ke episode sumber dan diberi notifikasi in-app.
- Menambahkan alur asesmen/instruksi dasar IGD serta pendaftaran/penerimaan IGD pada prototype.
- Mempertahankan UI utama V15.3.0; pembaruan cache PWA dinaikkan ke v15.4.0.

**Batasan penting:** ini adalah prototype portofolio berbasis penyimpanan lokal per browser/perangkat, bukan SIMRS produksi dan belum sinkron antarperangkat. Status/antrean/notifikasi lintas perangkat membutuhkan backend bersama, kontrol akses server, audit trail yang kuat, validasi klinis, serta uji penerimaan pengguna rumah sakit. Tidak boleh dipakai untuk keputusan klinis nyata.

## Validasi V15.4.0 yang dilakukan pada paket ini

- Pemeriksaan sintaks JavaScript pada `app.js` dan `sw.js`.
- Simulasi logika antrean resep untuk memastikan Rawat Jalan, Rawat Inap, dan IGD terpisah.
- Simulasi perjalanan paralel Laboratorium + Radiologi + Farmasi agar satu permintaan tidak dianggap selesai hanya karena status unit lain berubah.
- Simulasi rujukan internal IGD: episode IGD dibuat setelah unit IGD menerima rujukan.
- Simulasi Farmasi IGD: resep → persiapan → pencatatan pemberian; stok tidak berkurang dua kali dan episode IGD tidak otomatis ditutup.
- Simulasi item obat duplikat untuk memastikan jumlah total yang disiapkan dibatasi stok gabungan dan inventori tidak menjadi negatif.
- Smoke test render markup untuk layar IGD (tanpa dan dengan kunjungan aktif), Laboratorium, dan Radiologi menggunakan DOM stub.

Pengujian ini merupakan validasi sintaks dan logika terisolasi, **bukan** pengujian penerimaan klinis, keamanan produksi, atau validasi UI penuh pada perangkat nyata. Sebelum dipakai sebagai demonstrasi langsung kepada rumah sakit, lakukan uji manual semua akun demo dan skenario lintas unit pada browser/perangkat sasaran.


## V15.7.0 — Monitor per unit, struktur ruang rawat inap, dan navbar petugas

- Monitor rawat jalan untuk dokter/perawat yang login mengunci poli berdasarkan penugasan akun; parameter URL tidak dapat mengganti poli akun.
- Monitor rawat inap mengikuti `wardId`/`wardIds` akun dan menampilkan semua kamar/bed dalam ruang yang ditugaskan, termasuk bed kosong dan status bed.
- Struktur awal: 3 gedung, masing-masing 4 lantai reguler dengan 3 ruang per lantai (36 ruang reguler; 10 kamar × 3 bed), ditambah Gedung A lantai 5 dan 6 sebagai dua ruang VVIP (20 kamar × 1 bed).
- Master Data memiliki tab Ruangan & Shift untuk mengedit nama gedung, lantai, ruangan, label kamar/bed, fasilitas, kepala ruang, ketua shift, nama perawat, dan jam shift. Setiap ruang mendapat roster awal berbeda; ruang demo Meranti menghubungkan ketua shift dengan akun perawat demo yang relevan.
- Chat dipindahkan ke tombol topbar kiri untuk semua akun; Chat tidak menjadi item navbar. Navbar maksimal enam item dan tidak menampilkan menu Lainnya.
- Akun IGD tidak menggunakan monitor antrean poli.
- Batasan tetap: penyimpanan localStorage adalah simulasi lokal dan tidak menyediakan sinkronisasi lintas perangkat atau autentikasi backend produksi.


### Validasi V15.7.0

- Audit logika internal mencakup 54 pemeriksaan pada source yang dibundel.
- Browser smoke test memeriksa navbar/chat pada akun Admin, dokter, triase IGD, laboratorium, radiologi, farmasi, kasir, loket, pasien; monitor poli; monitor ruang rawat inap; penyimpanan edit master ruang/shift; dan akses cepat Admin.
- Uji migrasi dari struktur V15.6.0 menjaga jumlah booking, kunjungan, admisi, resep, serta referensi bed admisi aktif.
- Seluruh hasil adalah pengujian prototype client-side; belum menggantikan UAT rumah sakit, pengujian backend, dan integrasi sistem eksternal.


## V15.8.0 — Pelayanan superuser dan topbar responsif

- Mengembalikan tombol hamburger **Pelayanan** di kiri atas akun superuser. Tombol membuka 16 ikon akses cepat dalam grid 4×4; Chat tetap terpisah.
- Menghapus label identitas versi yang sebelumnya dapat bertumpuk dengan judul halaman pada topbar.
- Mengatur ulang topbar sebagai grid responsif supaya Chat tidak menutupi judul pada akun petugas maupun pasien. Pada layar sempit, tombol Chat dan Pelayanan menjadi ikon ringkas.
- Menambah self-test untuk jumlah ikon menu Pelayanan dan pemisahan tombol Chat/judul halaman.
- Data tetap disimpan di localStorage per browser/perangkat; perubahan master data tersimpan lokal dan tidak otomatis pindah antar browser; fitur ekspor/impor yang ada saat ini hanya untuk master dokter, jadwal, dan poli.

## V15.8.0 — Pelayanan superuser dan topbar responsif

- Mengembalikan tombol hamburger **Pelayanan** di kiri atas akun superuser. Tombol membuka 16 ikon akses cepat dalam grid 4×4; Chat tetap terpisah.
- Menghapus label identitas versi pada topbar yang dapat bertumpuk dengan judul halaman.
- Mengatur ulang topbar sebagai grid responsif supaya Chat tidak menutupi judul pada akun petugas maupun pasien. Pada layar sempit, tombol Chat dan Pelayanan menjadi ikon ringkas.
- Menambah pemeriksaan statis untuk jumlah ikon menu Pelayanan dan pemisahan tombol Chat/judul halaman.
- Data tetap disimpan di `localStorage` per browser/perangkat; fitur ekspor/impor yang tersedia saat ini hanya mencakup master dokter, jadwal, dan poli; data ruangan/shift belum tersinkron otomatis lintas browser.
- Validasi browser penuh belum dapat dilakukan di lingkungan build; lihat `TEST_REPORT_V15.8.0.md` untuk batas pengujian.


## V15.8.4 — Perbaikan keterhubungan kunjungan, pemeriksaan, dan farmasi (working copy)

- Form screening memuat kembali nilai sebelumnya agar dapat dikoreksi. Koreksi screening sebelumnya disimpan pada `screeningRevisions`.
- Draft pemeriksaan tidak lagi mewajibkan diagnosis; draft tidak menandai antrean siap maju. Perubahan klinis dicatat pada `examRevisions`.
- Form pemeriksaan memiliki autosave draft dengan indikator status, selain tombol simpan manual.
- Finalisasi ditolak jika diagnosis kosong atau kunjungan tidak lagi berstatus `diperiksa`.
- Pengiriman resep memakai resep yang sudah terhubung ke kunjungan jika masih berstatus menunggu, untuk mencegah duplikasi resep saat submit ulang. Resep yang sudah diproses farmasi tidak otomatis ditimpa.

## V15.8.2 — Penyegaran UI dan ikon

- Ikon aplikasi, favicon, ikon PWA, dan Apple Touch Icon diseragamkan: simbol medis putih di atas latar biru glossy dengan aksen violet/magenta.
- Warna browser/PWA diperbarui ke Brighter Blue (`#4A8BFF`).
- Menu Pelayanan mempertahankan bidang putih polos; efek Glass 3D diterapkan pada border biru-ke-ungu dan bayangan halus.
- Kartu menu dan sejumlah panel yang sebelumnya terlihat polos mendapat border Glass 3D yang ringan, tanpa mengubah teks maupun alur kerja.
- Versi file dan cache service worker dinaikkan ke V15.8.2.
- Identitas tetap SIMRS PROTOTYPE; bukan logo resmi rumah sakit.


## V15.8.2 — Penyempurnaan UI Glass 3D
- Menyempurnakan border dengan highlight kaca yang lebih cerah, kedalaman bayangan, dan aksen violet yang tetap halus.
- Bidang menu Pelayanan tetap putih polos; perubahan dibatasi pada border, highlight, dan bayangan.
- Menambahkan fokus keyboard yang terlihat pada tombol/kartu menu tanpa mengubah rute atau alur bisnis.
- Versi aset runtime dan cache PWA dinaikkan ke V15.8.2.
- Tidak ada perubahan skema data atau penggantian alur pelayanan pada rilis ini.


## V15.8.4 — Halaman pemeriksaan bertab dan draft resep
- Halaman pemeriksaan dokter disusun menjadi tab Screening, Pemeriksaan Dokter, Diagnosis, Resep, dan Riwayat.
- Nama pasien pada antrean dokter dapat membuka kunjungan terkait.
- Simpan draft menggunakan indikator inline dan tidak menampilkan pop-up berulang.
- Saat resep disimpan, resep masuk antrean Farmasi Rawat Jalan dengan ID kunjungan yang sama. Status tahap dokter pada Perjalanan Pasien tetap aktif sampai dokter melakukan finalisasi pemeriksaan.
- Resep pending dimuat kembali ketika halaman pemeriksaan dibuka ulang.
- Penyimpanan draft menangani kegagalan localStorage dengan indikator gagal simpan.
- Batasan: data masih tersimpan di localStorage perangkat; sinkronisasi antarperangkat memerlukan backend.


### Catatan pengujian V15.8.4

V15.8.4 masih working copy pengembangan dan belum dinyatakan rilis bebas bug. Penyimpanan lokal menggunakan localStorage pada perangkat/browser yang sama; belum ada sinkronisasi backend lintas perangkat. Alur klinis harus divalidasi dengan uji interaktif sebelum digunakan sebagai rilis portfolio.


## Perubahan V16.0.0 — Pemisahan Workflow IGD

- Baseline pengembangan: arsip V15.8.8; alur rawat jalan dan Glass UI dipertahankan.
- Ruang kerja dipisahkan untuk Perawat Triase IGD, Dokter IGD, dan Perawat Pelaksana IGD dengan role dan route masing-masing.
- Triase menyimpan prioritas, tanda vital, ringkasan, petugas, waktu, dan riwayat evaluasi ulang. Daftar triase diprioritaskan berdasarkan level kegawatan.
- Dokter IGD melihat pasien yang sudah ditriase, menyimpan diagnosis/asesmen, membuat instruksi, serta mencatat disposisi. Observasi tetap aktif; keputusan pulang/rujukan/rawat inap menggunakan status terpisah.
- Perawat pelaksana memiliki daftar instruksi, konfirmasi penerimaan, pencatatan pelaksanaan, dan catatan keperawatan terpisah.
- Hak akses diperiksa pada tampilan dan fungsi penyimpanan.
- ZIP rilis tidak menyertakan laporan pengujian, berkas audit sementara, atau berkas pengembangan.

Akun demo IGD: `triase.igd` / `triase123`; `dokter.igd` / `dokter123`; `perawat.igd` / `perawat123`.
