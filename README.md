# SIMRS PROTOTYPE — Portfolio / Demo

**Versi:** V14.6.0  
**Baseline pengembangan:** V14.5.2  
**Platform:** PWA / Web  
**Status:** Prototype portfolio, bukan SIMRS produksi

SIMRS PROTOTYPE adalah proyek portfolio untuk memperlihatkan kemampuan analisis kebutuhan, perancangan alur pelayanan rumah sakit, UI/UX, RBAC (hak akses berbasis peran), PWA, penyimpanan lokal, simulasi antrean, serta integrasi antar-modul pelayanan.

> **Penting:** aplikasi ini adalah prototype/demo. Bukan sistem resmi RSUD R.T. Notopuro, bukan pengganti SIMRS rumah sakit, dan bukan SOP resmi. Data demo bersifat fiktif. Implementasi produksi membutuhkan backend, database terpusat, autentikasi dan otorisasi server, audit terpusat, enkripsi, backup, monitoring, serta integrasi resmi.

## 1. Baseline pengembangan

Mulai V14.6.0, **V14.5.2 adalah baseline resmi terakhir** yang digunakan sebagai sumber perubahan.

Aturan pengembangan proyek:

1. Versi terbaru yang sudah dikirim dan disepakati menjadi baseline berikutnya.
2. Perubahan baru selalu dibuat dari baseline terakhir, bukan dari versi lama.
3. Fitur yang sudah benar harus dipertahankan.
4. Setiap perubahan harus melalui pemeriksaan syntax, UI, navigasi, role/RBAC, alur utama, dan regresi fitur sebelum ZIP diberikan.
5. README hanya diperbarui setelah fungsi aplikasi cukup stabil untuk didokumentasikan.

## 2. Perubahan V14.6.0 — UI Navbar Admin & Menu Sekunder

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

## 3. Modul yang tersedia

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

## 4. Navigasi berdasarkan role

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

**Beranda | Rawat Jalan | Rawat Inap | Booking Saya | Monitor | Riwayat**

## 5. Akun demo utama

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Loket | `loket` | `loket123` |
| Petugas Rawat Jalan | `rawatjalan` | `rawatjalan123` |
| Dokter Umum | `dokter.umum` | `dokter123` |
| Dokter Jantung | `dokter.jantung` | `dokter123` |
| Perawat Rawat Jalan | `perawat` | `perawat123` |
| Laboratorium | `lab` | `lab123` |
| Radiologi | `radiologi` | `rad123` |
| Farmasi Rawat Jalan | `farmasi.rajal` | `farmasi123` |
| Kasir Rawat Jalan | `kasir.rajal` | `kasir123` |
| Admisi Rawat Inap | `admisi.ranap` | `admisi123` |
| Dokter Rawat Inap | `dokter.ranap` | `dokter123` |
| Perawat Rawat Inap | `perawat.ranap` | `perawat123` |
| Pasien Demo | `pasien.demo` | `pasien123` |

Akun tambahan tersedia untuk dokter/perawat per unit, dokter jaga dan perawat per shift, Farmasi/Kasir IGD, Farmasi/Kasir Rawat Inap, serta pasien demo Rawat Inap.

## 6. Teknologi

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

## 7. Arsitektur prototype

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
| **V14.6.0** | **UI Navbar Admin dan pemindahan Menu Lainnya ke tombol kiri atas** |

**Baseline aktif untuk pengembangan berikutnya: V14.6.0**

---

**SIMRS PROTOTYPE — Portfolio / Demo**  
Dibuat sebagai proyek portfolio Sistem Informasi untuk menunjukkan kemampuan analisis, desain, implementasi frontend, business logic, RBAC, PWA, dan pengujian alur aplikasi.
