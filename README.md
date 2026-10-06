# SIMRS PROTOTYPE — v13.8.1

**Versi portfolio:** v13.8 — **Feature Freeze + Quality Audit**  
**Patch:** v13.8.1 — **Dynamic Patient Journey**

SIMRS PROTOTYPE adalah **prototype/portfolio aplikasi sistem informasi manajemen rumah sakit**, bukan sistem resmi rumah sakit dan bukan sistem produksi. Fokus v13.8 adalah mematangkan alur **Rawat Jalan end-to-end** dari sisi pasien sampai pelayanan poli.

> **Status:** Portfolio / Demo. Data pasien, akun, jadwal, dan transaksi yang ditampilkan adalah data simulasi/fiktif. Data baseline layanan digunakan sebagai contoh dan tetap dapat diubah melalui Master Data.

## Fokus v13.8

1. **Audit alur end-to-end**: Pendaftaran → Booking → QR → Check-in → Antrean → Dokter → Selesai.
2. **Perjalanan pasien** mempunyai status yang konsisten dan ditampilkan pada Dashboard/Tiket.
3. **Estimasi waktu kedatangan** disimpan pada tiket sebagai jendela waktu estimasi, bukan janji waktu pelayanan.
4. **Master data dipisahkan dari business logic** sehingga dokter, jadwal, poli, kapasitas, dan fasilitas dapat dikelola tanpa mengubah source code utama.
5. **Aturan antrean dijelaskan transparan** pada tiket pasien: Reguler menggunakan konteks poli+tanggal; Eksekutif memiliki konteks dokter/sesi/appointment sendiri.
6. **Branding netral**: aplikasi menggunakan nama SIMRS PROTOTYPE dan tidak mengklaim sebagai aplikasi resmi institusi tertentu.
7. **Batas prototype vs produksi dijelaskan** secara eksplisit. Penggunaan produksi membutuhkan backend, database terpusat, autentikasi/otorisasi server, audit trail, backup, keamanan, dan integrasi resmi.

## Navigasi pasien

Sisi pasien menggunakan tepat **5 tombol**:

1. Dashboard
2. Monitor
3. Rawat Jalan
4. Booking Saya
5. Riwayat

Tidak ada menu **Lainnya** pada bottom navigation pasien.

## Alur Rawat Jalan

### Reguler / Spesialis

```text
Pasien
  ↓
Pilih Poli Reguler
  ↓
Pilih Klinik + Tanggal + Dokter
  ↓
Sistem menentukan sesi & kapasitas
  ↓
Nomor antrean
  ↓
Tiket + QR/barcode
  ↓
Check-in hari-H
  ↓
Menunggu verifikasi/screening
  ↓
Menunggu dokter
  ↓
Dipanggil
  ↓
Sedang diperiksa
  ↓
Pelayanan selesai
```

### Eksekutif

```text
Pasien
  ↓
Pilih Poli Eksekutif
  ↓
Pilih Klinik + Dokter + Tanggal
  ↓
Pilih slot/janji yang tersedia
  ↓
Nomor/tiket Eksekutif
  ↓
QR + Check-in
  ↓
Monitor antrean
  ↓
Dokter
  ↓
Selesai
```

Reguler dan Eksekutif tidak digabung dalam konteks layanan, sesi, appointment, dan kapasitas.

## Status perjalanan pasien — v13.8.1

Perjalanan pasien pada sisi pasien **tidak lagi dipatok hanya 5 tahap**. Sistem membentuk perjalanan secara dinamis berdasarkan layanan yang benar-benar terjadi pada kunjungan tersebut.

Tahap dasar:

**Pendaftaran → Check-in → Verifikasi → Dokter**

Kemudian sistem hanya menampilkan tahap lanjutan yang benar-benar dibutuhkan:

- **Laboratorium** jika dokter membuat permintaan laboratorium.
- **Review Dokter** setelah hasil laboratorium tersedia.
- **Farmasi — Siapkan Obat** jika dokter membuat resep.
- **Kasir** sesuai alur billing kunjungan.
- **Farmasi — Ambil Obat** setelah pembayaran jika pasien memiliki resep.
- **Selesai** setelah seluruh kebutuhan kunjungan terpenuhi.

Contoh tanpa resep:

**Pendaftaran → Check-in → Verifikasi → Dokter → Kasir → Selesai**

Contoh dengan resep:

**Pendaftaran → Check-in → Verifikasi → Dokter → Farmasi (Siapkan) → Kasir → Farmasi (Ambil) → Selesai**

Contoh dengan laboratorium dan resep:

**Pendaftaran → Check-in → Verifikasi → Dokter → Laboratorium → Review Dokter → Farmasi (Siapkan) → Kasir → Farmasi (Ambil) → Selesai**

Dengan pendekatan ini, pasien tidak melihat menu/tahap yang tidak relevan dengan kunjungannya. Jalur pasien mengikuti data visit aktual dan keputusan pelayanan dokter.

## Estimasi waktu kedatangan

Setiap booking dapat memiliki:

- `arrivalWindowStart`
- `arrivalWindowEnd`
- `suggestedArrivalAt`

Estimasi dihitung dari sesi dokter, nomor antrean, dan rata-rata waktu tunggu konfigurasi prototype. Nilai tersebut **bukan jaminan waktu pelayanan medis**.

## Aturan antrean

- Nomor antrean Reguler menggunakan identitas **poli + tanggal**.
- Dokter/sesi merupakan alokasi pelayanan, bukan identitas nomor antrean.
- Kapasitas dihitung dari sesi dokter dan konfigurasi kuota.
- Eksekutif mempunyai konteks layanan terpisah dan dapat menggunakan appointment/slot waktu.
- Nomor antrean yang sudah pernah diterbitkan tidak dipakai ulang ketika booking dibatalkan.
- Booking dan check-in membawa `jenisLayanan`, `dokterId`, `sessionId`, `noAntrian`, dan `kodeCheckIn` agar konteks kunjungan tidak hilang.

## QR / Check-in

QR/barcode adalah identitas check-in prototype. Kamera menggunakan API browser bila tersedia; input kode manual menjadi fallback.

Setelah check-in:

```text
Booking.status = checked_in
        ↓
Visit dibuat
        ↓
Visit.workflow.checkinAt diisi
        ↓
Pasien masuk antrean aktif
```

## Master Data

Admin dapat mengelola baseline:

- Master dokter
- Jadwal dokter
- Poli/klinik
- Fasilitas
- Hak akses demo
- Export/import master dokter dan jadwal

Data publik/baseline diberi status yang dapat diedit dan tidak dianggap sebagai data operasional rumah sakit produksi.

## Audit Sistem v13.8

Admin mempunyai menu **Audit Sistem** untuk menjalankan self-test terhadap:

- keberadaan database demo
- role utama
- 5 navigasi pasien
- pemisahan Reguler/Eksekutif
- konsistensi nomor antrean demo
- workflow kunjungan
- estimasi kedatangan
- keunikan kode QR/check-in
- data pasien demo

Self-test ini merupakan **pemeriksaan sisi client**, bukan pengganti penetration test, security audit, atau integration test produksi.

## Akun demo

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Pendaftaran/Loket | `loket` | `loket123` |
| Rawat Jalan | `rawatjalan` | `rawatjalan123` |
| Dokter Umum | `dokter.umum` | `dokter123` |
| Dokter Anak | `dokter.anak` | `dokter123` |
| Dokter Gigi | `dokter.gigi` | `dokter123` |
| Dokter Jantung | `dokter.jantung` | `dokter123` |
| Dokter Penyakit Dalam | `dokter.penyakitdalam` | `dokter123` |
| Pasien Demo | `pasien.demo` | `pasien123` |

Akun tambahan tersedia untuk Farmasi, Kasir, Laboratorium, Perawat, IGD, dan Rawat Inap.

## Teknologi

- HTML5
- CSS3
- JavaScript ES6+
- PWA
- Service Worker
- localStorage
- BroadcastChannel
- QR generator lokal
- Browser Barcode Detection API sebagai opsi kamera

Tidak menggunakan framework frontend besar agar prototype mudah dibaca recruiter dan mudah dijalankan.

## Penyimpanan

Versi ini masih menggunakan `localStorage` browser. Artinya data antar perangkat **tidak benar-benar tersinkron**.

Untuk implementasi produksi, arsitektur yang disarankan:

```text
PWA / Web / Mobile
       ↓
API Gateway / Backend
       ↓
Authentication + Authorization
       ↓
Business Logic / Queue Engine
       ↓
Database Terpusat
       ↓
Audit Log + Backup + Monitoring
```

## Batasan penting

Prototype ini **tidak boleh** digunakan untuk menyimpan data kesehatan nyata atau NIK nyata. Jangan memasukkan API key, password produksi, private key, atau kredensial sistem rumah sakit ke repository publik.

Integrasi BPJS/Mobile JKN, SIMRS eksternal, rekam medis elektronik produksi, pembayaran nyata, notifikasi resmi, dan data klinis produksi memerlukan integrasi serta otorisasi resmi.

## Cara menjalankan

```bash
npx serve .
```

atau:

```bash
python3 -m http.server 8080
```

Kemudian buka alamat lokal tersebut. Untuk PWA dan akses kamera QR, gunakan HTTPS atau localhost.

## Tujuan portfolio

Proyek ini dibuat untuk menunjukkan kemampuan dalam:

- analisis kebutuhan sistem
- pemodelan alur bisnis
- RBAC
- desain UI/UX
- business logic antrean
- pemisahan master data dan transaksi
- PWA
- local persistence
- QR/check-in
- simulasi integrasi antar-modul
- dokumentasi sistem
- quality audit dan self-test

**SIMRS PROTOTYPE v13.8 — Portfolio / Demo**
