# SIMRS PROTOTYPE — Portfolio / Demo

**Versi:** V15.7.2  
**Baseline pengembangan:** V15.6.0  
**Platform:** PWA / Web  
**Status:** Prototype portfolio, bukan SIMRS produksi

SIMRS PROTOTYPE adalah proyek portfolio untuk memperlihatkan kemampuan analisis kebutuhan, perancangan alur pelayanan rumah sakit, UI/UX, RBAC (hak akses berbasis peran), PWA, penyimpanan lokal, simulasi antrean, serta integrasi antar-modul pelayanan.

> **Penting:** aplikasi ini adalah prototype/demo. Bukan sistem resmi RSUD R.T. Notopuro, bukan pengganti SIMRS rumah sakit, dan bukan SOP resmi. Data demo bersifat fiktif. Implementasi produksi membutuhkan backend, database terpusat, autentikasi dan otorisasi server, audit terpusat, enkripsi, backup, monitoring, serta integrasi resmi.

## 1. Baseline pengembangan

Baseline untuk versi ini adalah **V15.6.0 SIMRS Booking & Antrean Terpadu**, dengan lineage sebelumnya dari V15.5.0 Patient Journey Integration dan V15.4.0 Integrasi Antarunit. V15.7.0 mempertahankan alur booking, antrean, perjalanan pasien, dan integrasi antarunit yang sudah ada sambil menambahkan monitor terikat penugasan, master ruang/shift, dan standar navigasi petugas.

Aturan pengembangan proyek:

1. Versi terbaru yang sudah dikirim dan disepakati menjadi baseline berikutnya.
2. Perubahan baru selalu dibuat dari baseline terakhir, bukan dari versi lama.
3. Fitur yang sudah benar harus dipertahankan.
4. Setiap perubahan harus melalui pemeriksaan syntax, UI, navigasi, role/RBAC, alur utama, dan regresi fitur sebelum ZIP diberikan.
5. README hanya diperbarui setelah fungsi aplikasi cukup stabil untuk didokumentasikan.

## Perbaikan V15.7.2 — Booking maksimal H+3

- Kalender booking pasien dan petugas kini dibatasi maksimal H+3.
- Validasi saat submit berlaku pada sisi pasien dan petugas; tanggal H+4, H+7, dan sebulan ke depan ditolak meskipun input dimanipulasi.
- Reguler hanya H-1 sampai H-3 (tanggal H wajib loket); pembukaan H+3 pukul 00.01 WIB.
- Eksekutif mengikuti jendela H-3 sampai H+3, dapat booking hari H sampai pukul 12.00 WIB, dengan pemeriksaan jadwal dan kapasitas dokter.
- Versi aset dan Service Worker dinaikkan ke 15.7.2 agar browser mengambil cache baru.

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
