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
