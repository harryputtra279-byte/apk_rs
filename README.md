
## V14.1 — Real-Life Flow Rawat Inap

V14.1 memperkuat Rawat Inap agar sumber admisi dan perjalanan pasien tidak diperlakukan sama. Jalur yang didukung:

- **IGD → keputusan rawat inap → Admisi → Bed → Rawat Inap**.
- **Rawat Jalan → indikasi rawat inap → rujukan/permintaan rawat inap → Admisi → Bed → Rawat Inap**.
- **Rujukan → Admisi → Bed → Rawat Inap**.
- **Transfer Internal → Admisi → Bed → Rawat Inap**.

Untuk skenario prototype **BPJS**, pilihan kelas reguler dibatasi pada **Kelas III, II, dan I**. Jika sumbernya Rawat Jalan/Rujukan, nomor rujukan atau surat permintaan rawat inap wajib dicatat. Sumber IGD dapat langsung menjadi admission ketika dokter menetapkan rawat inap. Ini adalah simulasi alur bisnis, bukan klaim bahwa seluruh kasus BPJS wajib melalui IGD.

Master ruang menggunakan nama referensi yang dipublikasikan RSUD R.T. Notopuro seperti **Tulip, Teratai, Mawar Kuning, Mawar Merah Putih, dan Graha Delta Husada**, serta unit intensif seperti ICU/ICCU/HCU/PICU/NICU. Data kamar pada prototype tetap bersifat simulasi dan harus diverifikasi sebelum penggunaan nyata.

### Patient Journey Rawat Inap

Sisi pasien menampilkan **Perjalanan Rawat Inap Anda** secara dinamis. Sumber admission ditampilkan secara eksplisit, misalnya `IGD → Rawat Inap` atau `Rawat Jalan → Admisi → Rawat Inap`. Tahap Laboratorium/Penunjang dan Farmasi hanya muncul jika benar-benar ada order/resep pada admission. Setelah pulang, alur berlanjut ke Kasir dan Selesai.

# SIMRS PROTOTYPE — v14.1

**Versi portfolio:** v14.1 — **Rawat Inap Terintegrasi**  
**Baseline:** V13.8.1 Dynamic Patient Journey Rawat Jalan

SIMRS PROTOTYPE adalah **prototype/portfolio aplikasi sistem informasi manajemen rumah sakit**, bukan sistem resmi rumah sakit dan bukan sistem produksi. V14 memulai modul **Rawat Inap** dengan alur admisi sampai pemulangan dan tetap menjaga koneksi dengan Rawat Jalan, IGD, Farmasi, Laboratorium, Radiologi, dan Kasir sebagai modul yang akan terus dikembangkan.

## Dasar desain Rawat Inap

Desain V14 menggunakan referensi publik RSUD R.T. Notopuro: rumah sakit menyediakan layanan rawat inap 24 jam dan publikasi ketersediaan tempat tidur membedakan jenis layanan seperti VVIP, VIP, Kelas I–III, ICU, ICCU, PICU, NICU, HCU, isolasi, ruang bersalin, serta IGD. Status bed pada sistem informasi kamar juga dibedakan antara terisi, persiapan, dipesan, perbaikan, dan siap ditempati. Data tersebut dipakai sebagai **referensi desain**, bukan koneksi data real-time RSUD.

## Alur V14

**Rawat Jalan / IGD / Rujukan** → **Keputusan Rawat Inap** → **Admisi** → **Pilih kelas & bed** → **Perawatan di bangsal** → **CPPT + vital/NEWS2 + instruksi dokter** → **Lab/Radiologi/Farmasi bila diperlukan** → **Rencana pulang** → **Resume medis** → **Administrasi/Kasir** → **Bed masuk status persiapan** → **Bed kembali siap**.

Tidak semua pasien melewati semua unit. Penunjang dan Farmasi muncul berdasarkan order/resep yang benar-benar dibuat selama admission.

## Fitur Rawat Inap V14

- **Admisi baru:** pasien dapat masuk dari Rawat Jalan, IGD, rujukan, atau transfer internal.
- **Kelas dan tingkat perawatan:** Bangsal, Intensif, Bersalin; kelas perawatan berasal dari master bed/ward.
- **Bed management:** tersedia, terisi, dipesan, persiapan/dibersihkan, dan perbaikan.
- **Transfer bed:** pasien dapat dipindahkan antar-bed yang tersedia dan perpindahan dicatat pada CPPT/audit.
- **CPPT:** catatan S/O/A/P dengan profesi dan waktu pencatatan.
- **Vital & NEWS2:** simulasi pencatatan tanda vital dan perhitungan skor untuk monitoring prototype.
- **Instruksi dokter:** obat, tindakan, diet, dan pemeriksaan laboratorium. Instruksi obat membuat resep Rawat Inap yang terhubung ke Farmasi.
- **Patient Journey Rawat Inap:** status perjalanan admission ditampilkan dari admisi sampai selesai.
- **Rencana pulang & resume medis:** diagnosis akhir, ringkasan, obat pulang, kontrol, dan kondisi pulang.
- **Billing:** kamar, obat, penunjang, dan tindakan dipisahkan.
- **Bed release:** setelah pasien pulang, bed masuk status persiapan terlebih dahulu; petugas kemudian dapat mengembalikannya menjadi siap ditempati.
- **Audit sistem:** self-test ditambah pemeriksaan khusus admission, bed, billing, dan role Rawat Inap.

## Integrasi yang disiapkan

1. **Rawat Jalan → Rawat Inap:** keputusan admisi dapat membawa `patientId` dan `visitId`.
2. **IGD → Rawat Inap:** sumber admisi dapat dicatat sebagai IGD.
3. **Rawat Inap → Farmasi:** order obat menjadi resep dengan `admissionId`.
4. **Rawat Inap → Laboratorium/Radiologi:** order penunjang disimpan sebagai bagian dari perjalanan admission dan menjadi dasar modul penunjang berikutnya.
5. **Rawat Inap → Kasir:** billing admission dipisahkan dari transaksi Rawat Jalan.
6. **Rawat Inap → Rekam Medis:** CPPT dan resume medis menjadi bagian dari riwayat pasien.

## Catatan penting

- V14 **bukan replika database atau SOP internal RSUD**. Detail ruangan, tarif, hak kelas, alur BPJS, formularium, DPJP, dan aturan discharge harus dikonfigurasi sesuai kebijakan rumah sakit yang benar-benar menggunakan sistem.
- NEWS2 di sini adalah simulasi prototype dan **bukan alat keputusan klinis**.
- `localStorage` hanya untuk demo. Produksi memerlukan backend/database terpusat, autentikasi server, RBAC server-side, audit terpusat, backup, enkripsi, dan integrasi resmi.

---

|---|---|
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

**SIMRS PROTOTYPE v14.1 — Portfolio / Demo**
