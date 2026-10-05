"use strict";
/* =================================================================
   SIMRS TERPADU — konstanta, util, seed data, penyimpanan (Store)
   ================================================================= */
const BIAYA_REGISTRASI = 10000;
const BIAYA_LAB = 75000;
const LOW_STOCK_THRESHOLD = 15;

const POLI_COLOR = {UMU:'clinical', GIG:'slate', ANA:'sage', KDG:'plum', MAT:'amber', THT:'brick', JAN:'brick', KUL:'plum', PDL:'slate', SYA:'plum', PAR:'sage'};

function poliColor(id){ return POLI_COLOR[id] || 'clinical'; }


/* ================================================================
   KATALOG LAYANAN RSUD R.T. NOTOPURO — sumber nama layanan publik
   Dashboard memakai ID yang stabil; detail lantai/ruang tidak diasumsikan.
   ================================================================ */
const OFFICIAL_POLI_CATALOG = [
  ['SP-GCU','Klinik General Check Up','Poliklinik Spesialis'],['SP-BPL','Klinik Bedah Plastik','Poliklinik Spesialis'],['SP-BUM','Klinik Bedah Umum','Poliklinik Spesialis'],['SP-BUR','Klinik Bedah Urologi','Poliklinik Spesialis'],['SP-BSR','Klinik Bedah Saraf','Poliklinik Spesialis'],['SP-BOR','Klinik Bedah Orthopedi','Poliklinik Spesialis'],['SP-BDI','Klinik Bedah Digestif','Poliklinik Spesialis'],['SP-PDL','Klinik Penyakit Dalam','Poliklinik Spesialis'],['SP-GER','Klinik Geriatri','Poliklinik Spesialis'],['SP-END','Klinik Endoskopi','Poliklinik Spesialis'],['SP-JAN','Klinik Jantung','Poliklinik Spesialis'],['SP-SAR','Klinik Saraf','Poliklinik Spesialis'],['SP-PAR','Klinik Paru','Poliklinik Spesialis'],['SP-HKB','Klinik Hamil/KB','Poliklinik Spesialis'],['SP-KDG','Klinik Kandungan','Poliklinik Spesialis'],['SP-AND','Klinik Andrologi','Poliklinik Spesialis'],['SP-PSI','Klinik Psikologi','Poliklinik Spesialis'],['SP-PSK','Klinik Psikiatri','Poliklinik Spesialis'],['SP-REH','Klinik Rehabilitasi Medik','Poliklinik Spesialis'],['SP-ANA','Klinik Anak','Poliklinik Spesialis'],['SP-TBK','Klinik Tumbuh Kembang','Poliklinik Spesialis'],['SP-GIG','Klinik Gigi dan Mulut','Poliklinik Spesialis'],['SP-THT','Klinik THT','Poliklinik Spesialis'],['SP-MAT','Klinik Mata','Poliklinik Spesialis'],['SP-KUL','Klinik Kulit dan Kelamin','Poliklinik Spesialis'],['SP-MRV','Klinik Mawar Merah/VCT','Poliklinik Spesialis'],['SP-GIZ','Klinik Gizi','Poliklinik Spesialis'],['SP-HOM','Pelayanan Homecare','Poliklinik Spesialis'],
  ['EX-EST','Klinik Estetika','Poliklinik Eksekutif'],['EX-KUL','Klinik Kulit dan Kelamin','Poliklinik Eksekutif'],['EX-BUM','Klinik Bedah Umum','Poliklinik Eksekutif'],['EX-BUR','Klinik Bedah Urologi','Poliklinik Eksekutif'],['EX-BSR','Klinik Bedah Saraf','Poliklinik Eksekutif'],['EX-BOR','Klinik Bedah Orthopedi','Poliklinik Eksekutif'],['EX-BDI','Klinik Bedah Digestif','Poliklinik Eksekutif'],['EX-BTKV','Klinik Bedah TKV','Poliklinik Eksekutif'],['EX-BONK','Klinik Bedah Onkologi','Poliklinik Eksekutif'],['EX-PDL','Klinik Penyakit Dalam','Poliklinik Eksekutif'],['EX-AKU','Klinik Akupuntur','Poliklinik Eksekutif'],['EX-JAN','Klinik Jantung','Poliklinik Eksekutif'],['EX-SAR','Klinik Saraf','Poliklinik Eksekutif'],['EX-PAR','Klinik Paru','Poliklinik Eksekutif'],['EX-HKB','Klinik Hamil/KB','Poliklinik Eksekutif'],['EX-KDG','Klinik Kandungan','Poliklinik Eksekutif'],['EX-AND','Klinik Andrologi','Poliklinik Eksekutif'],['EX-PSI','Klinik Psikologi','Poliklinik Eksekutif'],['EX-PSK','Klinik Psikiatri','Poliklinik Eksekutif'],['EX-REH','Klinik Rehabilitasi Medik','Poliklinik Eksekutif'],['EX-ANA','Klinik Anak','Poliklinik Eksekutif'],['EX-TBK','Klinik Tumbuh Kembang','Poliklinik Eksekutif'],['EX-GIG','Klinik Gigi dan Mulut','Poliklinik Eksekutif'],['EX-THT','Klinik THT','Poliklinik Eksekutif'],['EX-MAT','Klinik Mata','Poliklinik Eksekutif'],['EX-KUL2','Klinik Kulit dan Kelamin','Poliklinik Eksekutif'],['EX-GIZ','Klinik Gizi','Poliklinik Eksekutif'],['EX-RAD','Klinik Radioterapi','Poliklinik Eksekutif']
];

const NOTOPURO_FACILITY_STRUCTURE = [
  {id:'GED-RAWAT-JALAN',type:'gedung',nama:'Pelayanan Rawat Jalan',parentId:null,source:'website'},
  {id:'UNIT-POLI-SPESIALIS',type:'unit',nama:'Poliklinik Spesialis',parentId:'GED-RAWAT-JALAN',source:'website'},
  {id:'UNIT-POLI-EKSEKUTIF',type:'unit',nama:'Poliklinik Eksekutif',parentId:'GED-RAWAT-JALAN',source:'website'},
  {id:'GED-IGD',type:'unit',nama:'Instalasi Gawat Darurat (IGD)',parentId:null,source:'website'},
  {id:'IGD-ZONA-MERAH',type:'zona',nama:'Zona Merah',parentId:'GED-IGD',source:'website'},
  {id:'IGD-ZONA-KUNING',type:'zona',nama:'Zona Kuning',parentId:'GED-IGD',source:'website'},
  {id:'GED-RAWAT-INAP',type:'gedung',nama:'Pelayanan Rawat Inap',parentId:null,source:'website'},
  {id:'RI-TULIP',type:'unit',nama:'Rawat Inap Tulip',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-TERATAI',type:'unit',nama:'Rawat Inap Teratai',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-MAWAR-KUNING',type:'unit',nama:'Rawat Inap Mawar Kuning',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-MAWAR-MP',type:'unit',nama:'Rawat Inap Mawar Merah Putih',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-GDH',type:'unit',nama:'Rawat Inap Graha Delta Husada',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-INTENSIF',type:'unit',nama:'Rawat Intensif Terpadu',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'RI-ICU',type:'unit',nama:'ICU',parentId:'RI-INTENSIF',source:'website'},
  {id:'RI-ICCU',type:'unit',nama:'ICCU',parentId:'RI-INTENSIF',source:'website'},
  {id:'RI-PICU',type:'unit',nama:'PICU',parentId:'RI-INTENSIF',source:'website'},
  {id:'RI-NICU',type:'unit',nama:'NICU',parentId:'RI-INTENSIF',source:'website'},
  {id:'RI-HCU',type:'unit',nama:'HCU',parentId:'RI-INTENSIF',source:'website'},
  {id:'RI-BERSALIN',type:'unit',nama:'Ruang Bersalin',parentId:'GED-RAWAT-INAP',source:'website'},
  {id:'FAR-RAJAL',type:'unit',nama:'Farmasi Rawat Jalan',parentId:null,source:'simrs'},
  {id:'FAR-RANAP',type:'unit',nama:'Farmasi Rawat Inap',parentId:null,source:'simrs'},
  {id:'LAB-PK',type:'unit',nama:'Laboratorium Patologi Klinik',parentId:null,source:'website'},
  {id:'LAB-PA',type:'unit',nama:'Laboratorium Patologi Anatomi',parentId:null,source:'website'},
  {id:'LAB-MIKRO',type:'unit',nama:'Laboratorium Mikrobiologi Klinik dan Biomolekuler',parentId:null,source:'website'},
  {id:'RAD',type:'unit',nama:'Radiologi',parentId:null,source:'website'},
  {id:'IPKT',type:'unit',nama:'Instalasi Pelayanan Kanker Terpadu (IPKT)',parentId:null,source:'website'},
  {id:'HD',type:'unit',nama:'Hemodialisis',parentId:null,source:'website'},
  {id:'KARDIO',type:'unit',nama:'Diagnostik dan Intervensi Kardiovaskuler',parentId:null,source:'website'},
  {id:'CSSD',type:'unit',nama:'Sterilisasi Sentral',parentId:null,source:'website'}
];

function ensureOfficialCatalog(data){
  if(!Array.isArray(data.poli)) data.poli=[];
  OFFICIAL_POLI_CATALOG.forEach(function(x){
    if(!data.poli.some(function(p){return p.id===x[0];})) data.poli.push({id:x[0],nama:x[1],biaya:0,layanan:x[2],official:true});
  });
  if(!Array.isArray(data.facilities)) data.facilities=[];
  NOTOPURO_FACILITY_STRUCTURE.forEach(function(x){
    if(!data.facilities.some(function(f){return f.id===x.id;})) data.facilities.push(Object.assign({},x));
  });
  return data;
}

function uid(prefix){
  return prefix + '-' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2,6);
}
function esc(str){
  if(str===undefined || str===null) return '';
  return String(str).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function pad(n){ return n<10 ? '0'+n : ''+n; }
function todayStr(d){ d = d || new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function nowISO(){ return new Date().toISOString(); }
function daysAgoISO(n){ const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
function formatRupiah(n){
  n = Math.round(n||0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function formatTanggalIndo(dateStr){
  if(!dateStr) return '-';
  const d = new Date(dateStr);
  if(isNaN(d)) return dateStr;
  return d.getDate()+' '+BULAN_ID[d.getMonth()]+' '+d.getFullYear();
}
function formatJam(iso){
  if(!iso) return '-';
  const d = new Date(iso);
  if(isNaN(d)) return '-';
  return pad(d.getHours())+':'+pad(d.getMinutes());
}
function formatTanggalWaktu(iso){
  if(!iso) return '-';
  return formatTanggalIndo(iso) + ', ' + formatJam(iso);
}
function calcUmur(tglLahir){
  if(!tglLahir) return '-';
  const bl = new Date(tglLahir), now = new Date();
  let umur = now.getFullYear() - bl.getFullYear();
  const m = now.getMonth() - bl.getMonth();
  if(m < 0 || (m===0 && now.getDate() < bl.getDate())) umur--;
  return umur;
}

const STATUS_MAP = {
  menunggu_poli:   {label:'Menunggu Poli',        cls:'badge-amber'},
  diperiksa:       {label:'Sedang Diperiksa',      cls:'badge-clinical'},
  menunggu_lab:    {label:'Menunggu Hasil Lab',    cls:'badge-plum'},
  menunggu_farmasi:{label:'Menunggu Farmasi',      cls:'badge-amber'},
  menunggu_bayar:  {label:'Menunggu Pembayaran',   cls:'badge-amber'},
  obat_siap:       {label:'Obat Siap Diambil',     cls:'badge-sage'},
  selesai:         {label:'Selesai',               cls:'badge-slate'},
  terjadwal:       {label:'Terjadwal',              cls:'badge-slate'},
  checked_in:      {label:'Sudah Check-in',         cls:'badge-sage'},
  dibatalkan:      {label:'Dibatalkan',              cls:'badge-brick'},
  tidak_hadir:     {label:'Tidak Hadir',             cls:'badge-brick'},
  rescheduled:     {label:'Dijadwalkan Ulang',       cls:'badge-amber'},
  kadaluarsa:      {label:'Lewat Jadwal',           cls:'badge-brick'},
  dirawat:         {label:'Dirawat',                cls:'badge-clinical'},
  pulang:          {label:'Pulang',                 cls:'badge-sage'},
  meninggal:       {label:'Meninggal',              cls:'badge-brick'},
  rujuk_keluar:    {label:'Rujuk Keluar',           cls:'badge-slate'},
  rujuk_ranap:     {label:'Dirujuk Rawat Inap',     cls:'badge-plum'}
};
function badgeStatus(status){
  const s = STATUS_MAP[status] || {label:status, cls:'badge-slate'};
  return '<span class="badge '+s.cls+'">'+s.label+'</span>';
}

function renderQrSvg(text, size){
  size = size || 160;
  try{
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const cell = size / count;
    let rects = '';
    for(let r=0;r<count;r++){
      for(let c=0;c<count;c++){
        if(qr.isDark(r,c)) rects += '<rect x="'+(c*cell).toFixed(2)+'" y="'+(r*cell).toFixed(2)+'" width="'+(cell+0.5).toFixed(2)+'" height="'+(cell+0.5).toFixed(2)+'"/>';
      }
    }
    return '<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" style="background:#fff;border-radius:14px;box-shadow:var(--shadow-float)" xmlns="http://www.w3.org/2000/svg"><rect width="'+size+'" height="'+size+'" fill="#fff"/><g fill="#182430">'+rects+'</g></svg>';
  }catch(err){
    return '<div class="hint">(Pratinjau QR tidak tersedia, kode tetap valid untuk check-in)</div>';
  }
}

/* ---------------- seed data ---------------- */
function seedData(){
  const poli = [
    {id:'UMU', nama:'Poli Umum', biaya:35000},
    {id:'GIG', nama:'Poli Gigi', biaya:50000},
    {id:'ANA', nama:'Poli Anak', biaya:50000},
    {id:'KDG', nama:'Poli Kandungan', biaya:75000},
    {id:'MAT', nama:'Poli Mata', biaya:60000},
    {id:'THT', nama:'Poli THT', biaya:60000},
    {id:'JAN', nama:'Poli Jantung', biaya:100000},
    {id:'KUL', nama:'Poli Kulit & Kelamin', biaya:65000},
    {id:'PDL', nama:'Poli Penyakit Dalam', biaya:90000},
    {id:'SYA', nama:'Poli Syaraf', biaya:95000},
    {id:'PAR', nama:'Poli Paru', biaya:90000}
  ];
  const users = [
    {id:'U-ADM', username:'admin', password:'admin123', nama:'Siti Rahayu', role:'admin'},
    {id:'U-LOK', username:'loket', password:'loket123', nama:'Budi Santoso', role:'loket'},
    {id:'U-DOK1', username:'dokter.umum', password:'dokter123', nama:'dr. Andi Wijaya', role:'dokter', poliId:'UMU'},
    {id:'U-DOK2', username:'dokter.anak', password:'dokter123', nama:'dr. Maria Christiani, Sp.A', role:'dokter', poliId:'ANA'},
    {id:'U-DOK3', username:'dokter.gigi', password:'dokter123', nama:'drg. Hendra Kusuma', role:'dokter', poliId:'GIG'},
    {id:'U-DOK4', username:'dokter.jantung', password:'dokter123', nama:'dr. Rudi Hartono, Sp.JP', role:'dokter', poliId:'JAN'},
    {id:'U-FAR', username:'farmasi', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi', unit:'rawat-jalan'},
    {id:'U-KAS', username:'kasir', password:'kasir123', nama:'Rina Marlina', role:'kasir', unit:'rawat-jalan'},
    {id:'U-LAB', username:'lab', password:'lab123', nama:'Agus Setiawan', role:'lab'},
    {id:'U-PWT', username:'perawat', password:'perawat123', nama:'Ns. Lestari Handayani, S.Kep', role:'perawat'}
  ];
  const medicines = [
    {id:'OBT001', nama:'Paracetamol 500mg', kategori:'Analgesik', satuan:'Tablet', harga:500, stok:250},
    {id:'OBT002', nama:'Amoxicillin 500mg', kategori:'Antibiotik', satuan:'Kapsul', harga:1200, stok:180},
    {id:'OBT003', nama:'Vitamin C 500mg', kategori:'Vitamin', satuan:'Tablet', harga:800, stok:300},
    {id:'OBT004', nama:'Antasida Doen', kategori:'Lambung', satuan:'Tablet', harga:600, stok:150},
    {id:'OBT005', nama:'CTM 4mg', kategori:'Antihistamin', satuan:'Tablet', harga:300, stok:8},
    {id:'OBT006', nama:'Ibuprofen 400mg', kategori:'Analgesik', satuan:'Tablet', harga:900, stok:200},
    {id:'OBT007', nama:'Omeprazole 20mg', kategori:'Lambung', satuan:'Kapsul', harga:1500, stok:120},
    {id:'OBT008', nama:'Salbutamol Inhaler', kategori:'Pernapasan', satuan:'Botol', harga:35000, stok:15},
    {id:'OBT009', nama:'Salep Gentamicin', kategori:'Topikal', satuan:'Tube', harga:12000, stok:40},
    {id:'OBT010', nama:'Amlodipine 5mg', kategori:'Jantung', satuan:'Tablet', harga:1100, stok:5},
    {id:'OBT011', nama:'Cetirizine 10mg', kategori:'Antihistamin', satuan:'Tablet', harga:700, stok:90},
    {id:'OBT012', nama:'Asam Mefenamat 500mg', kategori:'Analgesik', satuan:'Tablet', harga:650, stok:110}
  ];
  const patients = [
    {id:'RM-2026-0001', nik:'3201012001900001', nama:'Ahmad Fauzi', jenisKelamin:'L', tglLahir:'1990-01-20', alamat:'Jl. Merdeka No. 10, Bandung', noHp:'081234567890', golDarah:'O', alergi:'', createdAt:daysAgoISO(40)},
    {id:'RM-2026-0002', nik:'3201025503850002', nama:'Siti Nurhaliza', jenisKelamin:'P', tglLahir:'1985-03-15', alamat:'Jl. Asia Afrika No. 22, Bandung', noHp:'081298765432', golDarah:'A', alergi:'Penisilin', createdAt:daysAgoISO(30)},
    {id:'RM-2026-0003', nik:'3201031207180003', nama:'Putri Ayu Lestari', jenisKelamin:'P', tglLahir:'2018-07-12', alamat:'Jl. Dago No. 5, Bandung', noHp:'081211112222', golDarah:'B', alergi:'', createdAt:daysAgoISO(20)}
  ];
  const visits = [
    {id:uid('KJ'), patientId:'RM-2026-0001', tanggal:todayStr(new Date(Date.now()-12*86400000)), poliId:'UMU', dokterId:'U-DOK1',
      jenisBayar:'Umum', noBpjs:'', noAntrian:'UMU-014', keluhan:'Demam dan sakit kepala',
      status:'selesai', unit:'rawat-jalan', vital:{td:'120/80', nadi:'82', suhu:'37.8', rr:'20', bb:'68', tb:'170'},
      diagnosis:'ISPA (Infeksi Saluran Pernapasan Atas)', catatan:'Istirahat cukup, kontrol jika demam berlanjut 3 hari.',
      labRequest:null, resepId:null, billing:{registrasi:BIAYA_REGISTRASI, konsultasi:35000, obat:1600, lab:0},
      createdAt:daysAgoISO(12), updatedAt:daysAgoISO(12)}
  ];
  const prescriptions = [
    {id:uid('RSP'), visitId:visits[0].id, jenisLayanan:'rawat-jalan', unit:'rawat-jalan', items:[{medicineId:'OBT001', nama:'Paracetamol 500mg', jumlah:10, hargaSatuan:500, aturanPakai:'3x1 sesudah makan'}], status:'disiapkan', createdAt:daysAgoISO(12)}
  ];
  visits[0].resepId = prescriptions[0].id;
  const transactions = [
    {id:uid('TRX'), visitId:visits[0].id, rincian:[{label:'Biaya Registrasi', jumlah:BIAYA_REGISTRASI},{label:'Konsultasi Poli Umum', jumlah:35000},{label:'Obat', jumlah:1600}], total:46600, metode:'Tunai', createdAt:daysAgoISO(12)}
  ];
  const bookingTanggal = todayStr(new Date(Date.now()+86400000));
  const bookings = [
    {id:'BK-DEMO-0001', patientId:'RM-2026-0002', poliId:'JAN', tanggalKontrol:bookingTanggal, jenisBayar:'BPJS',
      sumber:'JKN Mobile (Simulasi)', noBpjs:'0001234567890', noAntrian:'JAN-001', kodeCheckIn:'DEMOJKN0001',
      status:'terjadwal', visitId:null, reminded:false, remindedAt:null, createdAt:nowISO()},
    {id:'BK-DEMO-0002', patientId:'RM-2026-0001', poliId:'JAN', tanggalKontrol:bookingTanggal, jenisBayar:'Umum',
      sumber:'Aplikasi RS', noBpjs:'', noAntrian:'JAN-002', kodeCheckIn:'DEMOUMU0002',
      status:'terjadwal', visitId:null, reminded:false, remindedAt:null, createdAt:nowISO()}
  ];
  const poliMessages = [
    {id:uid('MSG'), poliId:'JAN', authorName:'dr. Rudi Hartono, Sp.JP', authorRole:'Dokter', tipe:'normal', pesan:'Praktik berjalan sesuai jadwal hari ini.', createdAt:nowISO()}
  ];
  const auditLog = [
    {id:uid('LOG'), userName:'Sistem', role:'-', aksi:'inisialisasi', detail:'Data awal sistem dibuat', createdAt:nowISO()}
  ];

  const wards = [
    {id:'W-K3', nama:'Bangsal Kelas 3', kelas:'3', tarifPerHari:150000},
    {id:'W-K2', nama:'Bangsal Kelas 2', kelas:'2', tarifPerHari:300000},
    {id:'W-K1', nama:'Bangsal Kelas 1', kelas:'1', tarifPerHari:500000},
    {id:'W-VIP', nama:'Ruang VIP', kelas:'VIP', tarifPerHari:900000},
    {id:'W-ICU', nama:'ICU', kelas:'ICU', tarifPerHari:1500000}
  ];
  const bedCounts = {'W-K3':6, 'W-K2':4, 'W-K1':3, 'W-VIP':2, 'W-ICU':2};
  const beds = [];
  wards.forEach(function(w){
    const n = bedCounts[w.id] || 2;
    for(let i=1;i<=n;i++){
      beds.push({id:w.id+'-B'+String(i).padStart(2,'0'), wardId:w.id, noKamar:String(Math.ceil(i/2)).padStart(2,'0'), noBed:(i%2===1?'A':'B'), status:'kosong'});
    }
  });
  beds[6].status = 'terisi'; // W-K2-B01, dipakai admisi demo di bawah
  const admissions = [
    {id:'ADM-DEMO-0001', patientId:'RM-2026-0002', visitId:null, bedId:beds[6].id, wardId:'W-K2',
      dpjpUserId:'U-DOK1', diagnosisMasuk:'Observasi febris + dehidrasi ringan', jenisBayar:'BPJS', noBpjs:'0009876543210',
      status:'dirawat', tanggalMasuk:daysAgoISO(2),
      cppt:[
        {id:uid('CPPT'), waktu:daysAgoISO(2), profesi:'Dokter', penulisNama:'dr. Andi Wijaya', subjektif:'Demam naik turun 3 hari, mual (-), nafsu makan menurun.', objektif:'TD 110/70, N 92x, S 38.4°C, RR 20x. Turgor kulit sedikit menurun.', asesmen:'Febris ec susp. infeksi virus + dehidrasi ringan', planning:'IVFD RL 20 tpm, Paracetamol infus k/p, cek DL & elektrolit, observasi 24 jam'}
      ],
      vitalLog:[
        {id:uid('VS'), waktu:daysAgoISO(2), dicatatOleh:'Ns. Lestari Handayani, S.Kep', rr:20, spo2:98, sistolik:110, nadi:92, suhu:38.4, kesadaran:'alert', oksigen:false, news2:1}
      ],
      orders:[
        {id:uid('ORD'), waktu:daysAgoISO(2), dokterNama:'dr. Andi Wijaya', jenis:'obat', detail:'Paracetamol infus 3x1 gr k/p demam', status:'aktif'},
        {id:uid('ORD'), waktu:daysAgoISO(2), dokterNama:'dr. Andi Wijaya', jenis:'diet', detail:'Diet lunak, minum ad libitum', status:'aktif'}
      ],
      resumeMedis:null,
      billing:{biayaObat:0, biayaTindakan:0, statusBayar:'belum_bayar'},
      createdAt:daysAgoISO(2), updatedAt:daysAgoISO(1)}
  ];

  const seed = {
    poli, users, medicines, patients, visits, prescriptions, transactions, bookings, poliMessages, auditLog,
    wards, beds, admissions,
    doctorSchedules: [],
    notifications: [],
    facilities: [
      {id:'GED-RAWAT-JALAN', type:'gedung', nama:'Gedung Rawat Jalan', parentId:null},
      {id:'GED-RAWAT-INAP', type:'gedung', nama:'Gedung Rawat Inap', parentId:null},
      {id:'GED-IGD', type:'gedung', nama:'Gedung IGD', parentId:null},
      {id:'GED-DIAGNOSTIK', type:'gedung', nama:'Gedung Diagnostik Terpadu', parentId:null}
    ],
    meta:{ rmCounter:3, queueCounters:{ ['JAN-'+bookingTanggal]: 2 }, schemaVersion: DB_SCHEMA_VERSION,
      settings:{avgWaitMinutes:8, doctorQuotaDefault:30, alertQueueThreshold:10, lowStockThreshold:LOW_STOCK_THRESHOLD, pharmacyOutpatientSlaMinutes:30, pharmacyInpatientSlaMinutes:60} }
  };
  return ensureOfficialCatalog(seed);
}

/* ---------------- persistence ---------------- */
const DB_SCHEMA_VERSION = 7;

function ensureDivisionDemoUsers(data){
  if(!Array.isArray(data.users)) data.users=[];
  const demoUsers = [
    {id:'U-RJ-ADM', username:'rawatjalan', password:'rawatjalan123', nama:'Budi Santoso', role:'rawat_jalan', unit:'rawat-jalan'},
    {id:'U-RJ-DOK', username:'dokter.rajal', password:'dokter123', nama:'dr. Andi Wijaya', role:'dokter', unit:'rawat-jalan', poliId:'UMU'},
    {id:'U-RJ-FAR', username:'farmasi.rajal', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi', unit:'rawat-jalan'},
    {id:'U-RJ-KAS', username:'kasir.rajal', password:'kasir123', nama:'Rina Marlina', role:'kasir', unit:'rawat-jalan'},
    {id:'U-IGD-DOK', username:'dokter.igd', password:'dokter123', nama:'dr. Rudi Hartono', role:'dokter_igd', unit:'igd'},
    {id:'U-IGD-PWT', username:'perawat.igd', password:'perawat123', nama:'Ns. Lestari Handayani', role:'perawat_igd', unit:'igd'},
    {id:'U-IGD-FAR', username:'farmasi.igd', password:'farmasi123', nama:'Apt. Sari Wulandari', role:'farmasi', unit:'igd'},
    {id:'U-IGD-KAS', username:'kasir.igd', password:'kasir123', nama:'Rina Pratama', role:'kasir', unit:'igd'},
    {id:'U-RI-DOK', username:'dokter.ranap', password:'dokter123', nama:'dr. Maria Christiani, Sp.A', role:'dokter_ranap', unit:'rawat-inap'},
    {id:'U-RI-PWT', username:'perawat.ranap', password:'perawat123', nama:'Ns. Dimas Saputra', role:'perawat_ranap', unit:'rawat-inap'},
    {id:'U-RI-FAR', username:'farmasi.ranap', password:'farmasi123', nama:'Apt. Nanda Putri', role:'farmasi', unit:'rawat-inap'},
    {id:'U-RI-KAS', username:'kasir.ranap', password:'kasir123', nama:'Rina Permata', role:'kasir', unit:'rawat-inap'}
  ];
  demoUsers.forEach(function(u){
    const old=data.users.find(x=>x.id===u.id || x.username===u.username);
    if(old){ Object.assign(old,u); }
    else data.users.push(Object.assign({},u));
  });
  return data;
}

function migrateData(data){
  if(!data || typeof data!=='object') return seedData();
  if(!data.meta) data.meta = {};
  if(!data.meta.queueCounters) data.meta.queueCounters = {};
  if(!Array.isArray(data.auditLog)) data.auditLog = [];
  if(!Array.isArray(data.bookings)) data.bookings = [];
  if(!Array.isArray(data.poliMessages)) data.poliMessages = [];
  if(!Array.isArray(data.wards)) data.wards = [];
  if(!Array.isArray(data.beds)) data.beds = [];
  if(!Array.isArray(data.admissions)) data.admissions = [];
  data.bookings.forEach(function(b){
    if(!b.status) b.status='terjadwal';
    if(b.reminded===undefined) b.reminded=false;
    if(b.remindedAt===undefined) b.remindedAt=null;
    if(b.visitId===undefined) b.visitId=null;
    if(b.createdAt===undefined) b.createdAt=nowISO();
    if(b.updatedAt===undefined) b.updatedAt=b.createdAt;
    if(b.cancelReason===undefined) b.cancelReason='';
    if(b.rescheduledFrom===undefined) b.rescheduledFrom=null;
  });
  data.meta.schemaVersion = DB_SCHEMA_VERSION;
  data.meta.settings = Object.assign({
    avgWaitMinutes: 8,
    doctorQuotaDefault: 30,
    alertQueueThreshold: 10,
    lowStockThreshold: LOW_STOCK_THRESHOLD
  }, data.meta.settings||{});
  if(!Array.isArray(data.prescriptions)) data.prescriptions=[];
  data.prescriptions.forEach(function(r){ if(r.unit===undefined) r.unit=r.admissionId?'rawat-inap':'rawat-jalan'; if(r.updatedAt===undefined) r.updatedAt=r.createdAt||nowISO(); if(r.siapAt===undefined) r.siapAt=null; if(r.diambilAt===undefined) r.diambilAt=null; if(r.jenisLayanan===undefined) r.jenisLayanan=r.admissionId?'rawat_inap':'rawat_jalan'; });
  if(Array.isArray(data.visits)) data.visits.forEach(function(v){ if(v.unit===undefined) v.unit='rawat-jalan'; });
  if(Array.isArray(data.admissions)) data.admissions.forEach(function(a){ if(a.unit===undefined) a.unit='rawat-inap'; });
  if(!Array.isArray(data.doctorSchedules)) data.doctorSchedules = [];
  if(!Array.isArray(data.notifications)) data.notifications = [];
  if(!Array.isArray(data.facilities)) data.facilities = [];
  ensureOfficialCatalog(data);
  data.users.forEach(function(u){ if(u.username==='farmasi' && !u.unit) u.unit='rawat-jalan'; if(u.username==='kasir' && !u.unit) u.unit='rawat-jalan'; });
  ensureDivisionDemoUsers(data);
  data.meta.settings = Object.assign({pharmacyOutpatientSlaMinutes:30, pharmacyInpatientSlaMinutes:60}, data.meta.settings||{});
  return data;
}

const Store = {
  data:null,
  load(){
    const raw = localStorage.getItem('simrs_db_v1');
    let loaded = null;
    if(raw){ try{ loaded = JSON.parse(raw); }catch(e){ loaded = null; } }
    if(loaded && loaded.meta && loaded.meta.schemaVersion <= DB_SCHEMA_VERSION){
      this.data = migrateData(loaded);
    } else {
      this.data = migrateData(seedData());
    }
    this.save();
  },
  save(){ localStorage.setItem('simrs_db_v1', JSON.stringify(this.data)); }
};

const Session = {
  currentUser:null,
  load(){
    const raw = localStorage.getItem('simrs_session_v1');
    if(raw){ try{ this.currentUser = JSON.parse(raw); }catch(e){ this.currentUser = null; } }
  },
  login(user){ this.currentUser = user; localStorage.setItem('simrs_session_v1', JSON.stringify(user)); },
  logout(){ this.currentUser = null; localStorage.removeItem('simrs_session_v1'); }
};

/* ---------------- getters ---------------- */
function getPoli(id){ return Store.data.poli.find(p=>p.id===id); }
function getMedicine(id){ return Store.data.medicines.find(m=>m.id===id); }
function getPatient(id){ return Store.data.patients.find(p=>p.id===id); }
function getVisit(id){ return Store.data.visits.find(v=>v.id===id); }
function getUserById(id){ return Store.data.users.find(u=>u.id===id); }
function getResep(id){ return Store.data.prescriptions.find(r=>r.id===id); }
function getResepByVisit(visitId){ return Store.data.prescriptions.find(r=>r.visitId===visitId); }
function visitsToday(){ const t = todayStr(); return Store.data.visits.filter(v=>v.tanggal===t); }
function patientVisits(patientId){
  return Store.data.visits.filter(v=>v.patientId===patientId).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
}

/* ---------------- operational monitoring helpers ---------------- */
function getTodayBookings(poliId){
  return Store.data.bookings.filter(function(b){ return b.tanggalKontrol===todayStr() && (!poliId || b.poliId===poliId); });
}
function getTodayVisits(poliId){
  return visitsToday().filter(function(v){ return !poliId || v.poliId===poliId; });
}
function getDoctorForPoli(poliId){
  return Store.data.users.find(function(u){ return u.role==='dokter' && u.poliId===poliId; });
}
function getDoctorAvailability(poliId){
  const doctor = getDoctorForPoli(poliId);
  if(!doctor) return {status:'none', label:'Belum ada dokter', doctor:null};
  const messages = Store.data.poliMessages.filter(function(m){ return m.poliId===poliId; });
  const latest = messages.length ? messages[0] : null;
  if(latest && latest.tipe==='cancel') return {status:'cancel', label:'Tidak Praktik', doctor:doctor, message:latest.pesan};
  if(latest && latest.tipe==='delay') return {status:'delay', label:'Terlambat', doctor:doctor, message:latest.pesan};
  return {status:'available', label:'Tersedia', doctor:doctor, message:latest ? latest.pesan : ''};
}
function queueMetrics(poliId){
  const visits = getTodayVisits(poliId);
  const waiting = visits.filter(function(v){ return v.status==='menunggu_poli'; }).sort(function(a,b){ return (b.prioritas?1:0)-(a.prioritas?1:0) || new Date(a.createdAt)-new Date(b.createdAt); });
  const current = visits.filter(function(v){ return v.status==='diperiksa'; }).sort(function(a,b){ return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt); })[0] || null;
  const completed = visits.filter(function(v){ return v.status==='selesai'; }).length;
  const avg = (Store.data.meta.settings && Store.data.meta.settings.avgWaitMinutes) || 8;
  const estimate = waiting.length * avg;
  return {visits:visits, waiting:waiting, current:current, completed:completed, estimate:estimate};
}
function clinicTodayMetrics(poliId){
  const bookings=getTodayBookings(poliId);
  const visits=getTodayVisits(poliId);
  const q=queueMetrics(poliId);
  return {registered:visits.length + bookings.filter(function(b){return !b.visitId && ['terjadwal','checked_in'].includes(b.status);}).length, bookings:bookings.length, waiting:q.waiting.length, examined:visits.filter(function(v){return v.status==='diperiksa';}).length, completed:visits.filter(function(v){return v.status==='selesai';}).length, queue:q};
}
function pharmacyWaitMinutes(resep){
  if(!resep || !resep.createdAt) return null;
  const end=resep.diambilAt || resep.siapAt || (resep.status==='disiapkan' ? resep.updatedAt : null);
  if(!end) return Math.max(0, Math.round((Date.now()-new Date(resep.createdAt).getTime())/60000));
  return Math.max(0, Math.round((new Date(end).getTime()-new Date(resep.createdAt).getTime())/60000));
}
function pharmacyMetrics(kind, poliId){
  const isInpatient=kind==='rawat_inap';
  const settings=Store.data.meta.settings||{};
  const sla=isInpatient?(settings.pharmacyInpatientSlaMinutes||60):(settings.pharmacyOutpatientSlaMinutes||30);
  let list=[];
  if(isInpatient){ list=Store.data.prescriptions.filter(function(r){return r.admissionId && r.status==='menunggu';}); }
  else { list=Store.data.prescriptions.filter(function(r){ const v=getVisit(r.visitId); return v && (!poliId || v.poliId===poliId) && v.tanggal===todayStr() && !r.admissionId; }); }
  const waits=list.map(pharmacyWaitMinutes).filter(function(x){return x!==null;});
  const maxWait=waits.length?Math.max.apply(null,waits):0;
  return {pending:list.length,maxWait:maxWait,sla:sla,overSla:list.filter(function(r){const w=pharmacyWaitMinutes(r); return w!==null && w>sla;}).length};
}
function alternativeDoctors(poliId){
  const current = getDoctorForPoli(poliId);
  if(!current) return [];
  return Store.data.users.filter(function(u){ return u.role==='dokter' && u.id!==current.id && u.poliId===poliId; });
}
function quotaForPoli(poliId, dateStr){
  const d = dateStr || todayStr();
  const custom = Store.data.doctorSchedules.find(function(s){ return s.poliId===poliId && s.tanggal===d; });
  return custom && custom.kuota ? custom.kuota : ((Store.data.meta.settings && Store.data.meta.settings.doctorQuotaDefault) || 30);
}
function bookingStatusLabel(status){
  return ({terjadwal:'BOOKED',checked_in:'CHECK-IN',dibatalkan:'DIBATALKAN',tidak_hadir:'TIDAK HADIR',rescheduled:'DIJADWALKAN ULANG',kadaluarsa:'KADALUARSA'})[status] || status;
}
function pushNotification(type, title, body, target){
  if(!Array.isArray(Store.data.notifications)) Store.data.notifications=[];
  Store.data.notifications.unshift({id:uid('NTF'), type:type||'info', title:title||'', body:body||'', target:target||null, read:false, createdAt:nowISO()});
  if(Store.data.notifications.length>100) Store.data.notifications.length=100;
}

/* =================================================================
   ROUTER, SHELL, LOGIN, TOAST/MODAL HELPERS
   ================================================================= */
let installPromptEvent = null;
const MODULE_RENDERERS = {};

function operationalContextLabel(ctx){
  return ({'rawat-jalan':'Rawat Jalan / Poli','igd':'IGD','rawat-inap':'Rawat Inap'}[ctx] || 'SIMRS');
}
function routeContext(route){
  if(route==='poli' || route.indexOf('rawat-jalan')>=0) return 'rawat-jalan';
  if(route==='igd' || route.indexOf('-igd')>=0) return 'igd';
  if(route==='ranap' || route.indexOf('rawat-inap')>=0) return 'rawat-inap';
  return null;
}

const NAV_ITEMS = [
  {hash:'dashboard', label:'Dashboard', ic:'📊', roles:['admin']},
  {hash:'beranda', label:'Beranda', ic:'🏠', roles:['loket','dokter','farmasi','kasir','lab','perawat','rawat_jalan','dokter_igd','perawat_igd','dokter_ranap','perawat_ranap']},
  {hash:'pendaftaran', label:'Pendaftaran', ic:'📝', roles:['admin','loket','rawat_jalan']},
  {hash:'booking', label:'Booking Antrian', ic:'📅', roles:['admin','loket','rawat_jalan']},
  {hash:'poli', label:'Rawat Jalan', ic:'🩺', roles:['admin','dokter','rawat_jalan']},
  {hash:'igd', label:'IGD', ic:'🚑', roles:['admin','dokter_igd','perawat_igd']},
  {hash:'ranap', label:'Rawat Inap', ic:'🏨', roles:['admin','dokter','perawat','dokter_ranap','perawat_ranap']},
  {hash:'lab', label:'Laboratorium', ic:'🧪', roles:['admin','lab']},
  {hash:'farmasi-rawat-jalan', label:'Farmasi Rawat Jalan', ic:'💊', roles:['admin','farmasi']},
  {hash:'farmasi-rawat-inap', label:'Farmasi Rawat Inap', ic:'💊', roles:['admin','farmasi']},
  {hash:'farmasi-igd', label:'Farmasi IGD', ic:'💊', roles:['admin','farmasi']},
  {hash:'kasir-rawat-jalan', label:'Kasir Rawat Jalan', ic:'🧾', roles:['admin','kasir']},
  {hash:'kasir-rawat-inap', label:'Kasir Rawat Inap', ic:'🧾', roles:['admin','kasir']},
  {hash:'kasir-igd', label:'Kasir IGD', ic:'🧾', roles:['admin','kasir']},
  {hash:'rekam-medis', label:'Rekam Medis', ic:'📁', roles:['admin','dokter','dokter_igd','dokter_ranap']},
  {hash:'master-data', label:'Master Data', ic:'⚙️', roles:['admin']},
  {hash:'cek-antrian', label:'Cek Antrian', ic:'📺', roles:['admin','loket','dokter','farmasi','kasir','lab','perawat','rawat_jalan','dokter_igd','perawat_igd','dokter_ranap','perawat_ranap']}
];

function roleLabel(role){
  return {admin:'Admin', loket:'Petugas Pendaftaran', rawat_jalan:'Petugas Rawat Jalan', dokter:'Dokter', dokter_igd:'Dokter IGD', dokter_ranap:'Dokter Rawat Inap', farmasi:'Apoteker', kasir:'Kasir', lab:'Petugas Laboratorium', perawat:'Perawat', perawat_igd:'Perawat IGD', perawat_ranap:'Perawat Rawat Inap'}[role] || role;
}
function isRouteAllowed(route, role){
  const item = NAV_ITEMS.find(n=>n.hash===route);
  if(!item || !item.roles.includes(role)) return false;
  const u = Session.currentUser;
  if(!u || role==='admin') return true;
  const ctx = routeContext(route);
  if(ctx && u.unit && u.unit!==ctx) return false;
  return true;
}
function defaultRouteForRole(role){
  return ({admin:'dashboard', loket:'beranda', rawat_jalan:'poli', dokter:'poli', dokter_igd:'igd', dokter_ranap:'ranap', farmasi:'farmasi-rawat-jalan', kasir:'kasir-rawat-jalan', lab:'beranda', perawat:'ranap', perawat_igd:'igd', perawat_ranap:'ranap'})[role] || 'cek-antrian';
}
function navigate(hash){ location.hash = '#/' + hash; }
function currentRoute(){ return location.hash.replace(/^#\/?/, '').split('?')[0]; }

function render(){
  if(!Session.currentUser){ renderLogin(); return; }
  let route = currentRoute();
  if(!route){ location.hash = '#/'+defaultRouteForRole(Session.currentUser.role); return; }
  if(!isRouteAllowed(route, Session.currentUser.role)){
    location.hash = '#/'+defaultRouteForRole(Session.currentUser.role);
    return;
  }
  renderShell(route);
}
window.addEventListener('hashchange', render);

function renderShell(route){
  const u = Session.currentUser;
  const items = NAV_ITEMS.filter(n=>n.roles.includes(u.role));
  const primary = items.slice(0,4);
  const overflow = items.slice(4);
  const initial = (u.nama||'?').trim().charAt(0).toUpperCase();

  const sidebarNavHtml = items.map(n=>
    '<button class="nav-item '+(n.hash===route?'active':'')+'" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span>'+n.label+'</button>'
  ).join('');
  const bottomTabsHtml = primary.map(n=>
    '<button class="tab-item '+(n.hash===route?'active':'')+'" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span><span class="tl">'+n.label+'</span></button>'
  ).join('') + (overflow.length ? '<button class="tab-item" id="btn-more-nav"><span class="ic">⋯</span><span class="tl">Lainnya</span></button>' : '');

  document.getElementById('app').innerHTML =
   '<div class="app-shell">'+
     '<aside class="sidebar" id="sidebar">'+
       '<div class="brand"><div class="brand-mark"></div><div class="brand-text"><div class="t1">SIMRS Terpadu</div><div class="t2">RSU Sehat Sentosa</div></div></div>'+
       '<nav class="nav">'+sidebarNavHtml+'</nav>'+
       '<div class="sidebar-user"><div class="name">'+esc(u.nama)+'</div><div class="role">'+roleLabel(u.role)+(u.poliId?' · '+esc(getPoli(u.poliId).nama):'')+'</div>'+
         '<button class="btn btn-outline btn-sm btn-block" id="btn-logout-sidebar">🚪 Keluar</button></div>'+
     '</aside>'+
     '<div class="main-area">'+
       '<div class="topbar">'+
         '<h1 id="page-title"></h1>'+
         '<div class="topbar-right">'+
           '<button class="btn btn-outline btn-sm hidden" id="btn-install">⭳ Pasang</button>'+
           '<button class="avatar-btn" id="btn-global-search" title="Cari pasien" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--ink);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)">🔍</button>'+
           '<button class="avatar-btn ops-notif-btn" id="btn-notifications" title="Notifikasi">🔔<span id="notif-count" class="'+(((Store.data.notifications||[]).filter(function(n){return !n.read;}).length)?'':'hidden')+'">'+((Store.data.notifications||[]).filter(function(n){return !n.read;}).length)+'</span></button>'+
           '<button class="avatar-btn" id="btn-account" title="Akun">'+esc(initial)+'</button>'+
         '</div>'+
       '</div>'+
       '<div class="content" id="main-content"></div>'+
     '</div>'+
     '<nav class="bottom-tabbar" id="bottom-tabbar">'+bottomTabsHtml+'</nav>'+
   '</div>';

  bindShellEvents(overflow);
  const renderer = MODULE_RENDERERS[route];
  if(renderer) renderer();
}

function bindShellEvents(overflow){
  document.querySelectorAll('.nav-item, .tab-item[data-nav]').forEach(el=>{
    el.addEventListener('click', ()=> navigate(el.dataset.nav));
  });
  const logoutHandler = function(){ logAudit('logout', 'Keluar manual'); Session.logout(); location.hash=''; render(); };
  const sideLogout = document.getElementById('btn-logout-sidebar');
  if(sideLogout) sideLogout.addEventListener('click', logoutHandler);

  const moreBtn = document.getElementById('btn-more-nav');
  if(moreBtn) moreBtn.addEventListener('click', ()=> openMoreSheet(overflow));

  const acctBtn = document.getElementById('btn-account');
  if(acctBtn) acctBtn.addEventListener('click', ()=> openAccountSheet(logoutHandler));

  const searchBtn = document.getElementById('btn-global-search');
  if(searchBtn) searchBtn.addEventListener('click', openGlobalSearch);
  const notifBtn = document.getElementById('btn-notifications');
  if(notifBtn) notifBtn.addEventListener('click', openNotifications);

  const installBtn = document.getElementById('btn-install');
  if(installPromptEvent && installBtn) installBtn.classList.remove('hidden');
  if(installBtn) installBtn.addEventListener('click', doInstallPrompt);
}

function openNotifications(){
  const list=(Store.data.notifications||[]).slice(0,30);
  document.getElementById('modal-root').innerHTML='<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet"><div class="sheet-handle"></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 6px 10px"><h2>🔔 Notifikasi</h2><button class="btn btn-ghost btn-sm" id="btn-mark-notif-read">Tandai semua dibaca</button></div>'+
    (list.length?list.map(function(n){return '<div class="notification-item '+(n.read?'':'unread')+'"><div class="notification-icon">'+(n.type==='queue'?'🎫':n.type==='booking'?'📅':'ℹ️')+'</div><div><strong>'+esc(n.title)+'</strong><div>'+esc(n.body)+'</div><span>'+formatTanggalWaktu(n.createdAt)+'</span></div></div>';}).join(''):'<div class="empty">Belum ada notifikasi.</div>')+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target.id==='modal-overlay')closeModal();});
  const b=document.getElementById('btn-mark-notif-read');
  if(b) b.addEventListener('click',function(){
    (Store.data.notifications||[]).forEach(function(n){n.read=true;});
    Store.save(); closeModal(); renderShell(currentRoute());
  });
  (Store.data.notifications||[]).forEach(function(n){n.read=true;});
  Store.save();
}
function openMoreSheet(overflow){
  const listHtml = overflow.map(n=>
    '<button class="sheet-item" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span>'+n.label+'</button>'
  ).join('');
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet">'+
      '<div class="sheet-handle"></div>'+
      '<h2 style="padding:0 6px 8px">Menu Lainnya</h2>'+listHtml+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') closeModal(); });
  document.querySelectorAll('.sheet-item[data-nav]').forEach(b=>{
    b.addEventListener('click', function(){ closeModal(); navigate(this.dataset.nav); });
  });
}

function openAccountSheet(logoutHandler){
  const u = Session.currentUser;
  const initial = (u.nama||'?').trim().charAt(0).toUpperCase();
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet">'+
      '<div class="sheet-handle"></div>'+
      '<div style="text-align:center;padding:4px 6px 18px">'+
        '<div class="avatar-btn" style="margin:0 auto 10px;width:54px;height:54px;font-size:21px">'+esc(initial)+'</div>'+
        '<div style="font-weight:800;font-size:16px">'+esc(u.nama)+'</div>'+
        '<div style="color:var(--ink-soft);font-size:13px">'+roleLabel(u.role)+(u.poliId?' · '+esc(getPoli(u.poliId).nama):'')+'</div>'+
      '</div>'+
      '<button class="sheet-item" id="btn-logout-sheet"><span class="ic">🚪</span>Keluar</button>'+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') closeModal(); });
  document.getElementById('btn-logout-sheet').addEventListener('click', function(){ closeModal(); logoutHandler(); });
}

function openGlobalSearch(){
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet">'+
      '<div class="sheet-handle"></div>'+
      '<h2 style="padding:0 6px 10px">🔍 Cari Pasien</h2>'+
      '<input type="text" id="gs-input" placeholder="NIK / No. RM / Nama pasien…" style="margin-bottom:10px">'+
      '<div id="gs-results"><div class="hint" style="padding:6px">Ketik NIK, No. RM, atau nama pasien.</div></div>'+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') closeModal(); });
  const input = document.getElementById('gs-input');
  input.addEventListener('input', function(){ renderGlobalSearchResults(this.value.trim()); });
  setTimeout(function(){ input.focus(); }, 60);
}
function renderGlobalSearchResults(q){
  const el = document.getElementById('gs-results');
  if(!el) return;
  if(!q){ el.innerHTML = '<div class="hint" style="padding:6px">Ketik NIK, No. RM, atau nama pasien.</div>'; return; }
  const qLower = q.toLowerCase();
  const results = Store.data.patients.filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower)).slice(0,12);
  if(results.length===0){ el.innerHTML = '<div class="empty">Pasien tidak ditemukan.</div>'; return; }
  el.innerHTML = results.map(p=>
    '<button type="button" class="sheet-item" data-pick-gs="'+p.id+'"><span class="ic">👤</span><span style="text-align:left"><span style="display:block">'+esc(p.nama)+'</span>'+
    '<span style="display:block;font-size:12px;color:var(--ink-soft)" class="mono">'+p.id+' &middot; '+maskNik(p.nik)+'</span></span></button>'
  ).join('');
  el.querySelectorAll('[data-pick-gs]').forEach(b=> b.addEventListener('click', function(){ pickGlobalSearchPatient(this.dataset.pickGs); }));
}
function pickGlobalSearchPatient(patientId){
  closeModal();
  const u = Session.currentUser;
  if(u.role==='admin' || u.role==='dokter'){
    openRiwayatModal(patientId);
    return;
  }
  const p = getPatient(patientId);
  openModal(
    '<div class="modal-head"><h2>'+esc(p.nama)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><p>No. RM: <span class="mono">'+p.id+'</span><br>NIK: <span class="mono">'+maskNik(p.nik)+'</span><br>'+
    'Tgl Lahir: '+formatTanggalIndo(p.tglLahir)+' ('+calcUmur(p.tglLahir)+' th)<br>'+
    'Alamat: '+esc(p.alamat)+'<br>No. HP: '+esc(p.noHp)+
    (p.alergi ? '<br><span style="color:var(--brick);font-weight:700">⚠ Alergi: '+esc(p.alergi)+'</span>' : '')+
    '</p></div>'
  );
}


function setPageTitle(title){ document.getElementById('page-title').textContent = title; }
function closeDrawer(){
  const sb = document.getElementById('sidebar'), ov = document.getElementById('drawer-overlay');
  if(sb){ sb.classList.remove('open'); ov.classList.remove('show'); }
}

/* ---------------- login ---------------- */
function renderLogin(){
  document.getElementById('app').innerHTML =
    '<div class="login-wrap"><div class="login-panel">'+
      '<div class="login-hero">'+
        '<div class="login-emblem"></div>'+
        '<h1>SIMRS Terpadu</h1>'+
        '<div class="sub">RSU Sehat Sentosa — Sistem Informasi Manajemen Rumah Sakit</div>'+
        '<div class="ticket-hint">NO. ANTRIAN &nbsp;— · — · — —</div>'+
      '</div>'+
      '<div class="login-body">'+
        '<div id="login-error"></div>'+
        '<form id="login-form">'+
          '<div class="field"><label>Username</label><input type="text" id="login-username" autocomplete="username" required></div>'+
          '<div class="field"><label>Password</label><input type="password" id="login-password" autocomplete="current-password" required></div>'+
          '<button type="submit" class="btn btn-primary btn-block">Masuk</button>'+
        '</form>'+
        '<div class="login-divider">atau gunakan akun demo</div>'+
        '<div class="chip-row">'+chipsForDemo()+'</div>'+
      '</div>'+
    '</div></div>';

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.querySelectorAll('.chip').forEach(c=>{
    c.addEventListener('click', ()=> doLogin(c.dataset.username, c.dataset.password));
  });
}
function chipsForDemo(){
  const groups = [
    ['admin','Admin'],['loket','Pendaftaran'],['rawatjalan','Rawat Jalan'],['dokter.rajal','Dokter Rawat Jalan'],
    ['farmasi.rajal','Farmasi RJ'],['kasir.rajal','Kasir RJ'],['dokter.igd','Dokter IGD'],['perawat.igd','Perawat IGD'],
    ['farmasi.igd','Farmasi IGD'],['kasir.igd','Kasir IGD'],['dokter.ranap','Dokter RI'],['perawat.ranap','Perawat RI'],
    ['farmasi.ranap','Farmasi RI'],['kasir.ranap','Kasir RI'],['lab','Laboratorium']
  ];
  return groups.map(([uname,label])=>{
    const u = Store.data.users.find(x=>x.username===uname);
    if(!u) return '';
    return '<button type="button" class="chip" data-username="'+uname+'" data-password="'+u.password+'">'+label+'</button>';
  }).join('');
}
function handleLogin(e){
  e.preventDefault();
  doLogin(document.getElementById('login-username').value.trim(), document.getElementById('login-password').value);
}
function doLogin(uname, pass){
  const errEl = document.getElementById('login-error');
  const now = Date.now();
  const attempt = _loginAttempts[uname];
  if(attempt && attempt.lockUntil && now < attempt.lockUntil){
    const sisa = Math.ceil((attempt.lockUntil - now)/1000);
    if(errEl) errEl.innerHTML = '<div class="login-error">Terlalu banyak percobaan gagal. Coba lagi dalam '+sisa+' detik.</div>';
    return;
  }
  const u = Store.data.users.find(x=>x.username===uname && x.password===pass);
  if(!u){
    _loginAttempts[uname] = _loginAttempts[uname] || {count:0, lockUntil:0};
    _loginAttempts[uname].count++;
    if(_loginAttempts[uname].count >= 5){
      _loginAttempts[uname].lockUntil = now + 30000;
      _loginAttempts[uname].count = 0;
    }
    if(errEl) errEl.innerHTML = '<div class="login-error">Username atau password salah.</div>';
    return;
  }
  delete _loginAttempts[uname];
  Session.login(u);
  logAudit('login', 'Masuk sebagai '+roleLabel(u.role));
  resetSessionTimer();
  location.hash = '';
  render();
}

/* ---------------- toast / modal / print ---------------- */
function showToast(msg, type){
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast ' + (type||'');
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3200);
}
function openModal(innerHtml){
  document.getElementById('modal-root').innerHTML = '<div class="modal-overlay" id="modal-overlay"><div class="modal">'+innerHtml+'</div></div>';
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') closeModal(); });
}
function closeModal(){ document.getElementById('modal-root').innerHTML = ''; }
function printArea(html){ document.getElementById('print-area').innerHTML = html; setTimeout(()=>window.print(), 60); }

/* =================================================================
   SHARED: page intro + tabel antrian
   ================================================================= */
function pageIntro(text){
  return '<p style="color:var(--ink-soft);font-size:13.5px;margin:-4px 0 18px;max-width:640px">'+text+'</p>';
}
function renderAntrianTable(visits){
  if(visits.length===0) return '<div class="empty"><div class="big">—</div>Belum ada antrian hari ini</div>';
  const sorted = [...visits].sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
  return '<div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Poli</th><th>Jam Daftar</th><th>Pembayaran</th><th>Status</th></tr></thead><tbody>'+
    sorted.map(v=>{
      const p = getPatient(v.patientId), poli = getPoli(v.poliId);
      return '<tr><td class="mono" style="font-weight:700">'+v.noAntrian+'</td><td>'+esc(p?p.nama:'-')+'</td>'+
        '<td><span class="poli-tag"><span class="poli-dot" style="background:var(--'+poliColor(poli.id)+')"></span>'+esc(poli.nama)+'</span></td>'+
        '<td class="mono">'+formatJam(v.createdAt)+'</td><td>'+esc(v.jenisBayar)+'</td><td>'+badgeStatus(v.status)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
}

/* =================================================================
   MODULE: DASHBOARD
   ================================================================= */
function statCard(lbl, val, sub){
  return '<div class="stat"><div class="lbl">'+lbl+'</div><div class="val">'+val+'</div><div class="sub">'+sub+'</div></div>';
}
function barRow(label, count, max, color){
  const pct = Math.round((count/max)*100);
  return '<div style="margin-bottom:12px">'+
    '<div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:5px"><span>'+esc(label)+'</span><span class="mono" style="font-weight:700">'+count+'</span></div>'+
    '<div style="height:8px;background:var(--ink-hair);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:var(--'+color+')"></div></div></div>';
}
function renderDashboard(){
  setPageTitle('Dashboard Operasional');
  const today=todayStr(), visits=visitsToday();
  const bookingHariIni=Store.data.bookings.filter(function(b){return b.tanggalKontrol===today;});
  const waiting=visits.filter(function(v){return v.status==='menunggu_poli';}).length;
  const diperiksa=visits.filter(function(v){return v.status==='diperiksa';}).length;
  const selesai=visits.filter(function(v){return v.status==='selesai';}).length;
  const checkedIn=bookingHariIni.filter(function(b){return b.status==='checked_in';}).length;
  const obatMenipis=Store.data.medicines.filter(function(m){return m.stok<((Store.data.meta.settings||{}).lowStockThreshold||LOW_STOCK_THRESHOLD);});
  const beds=Store.data.beds||[], bedsAvailable=beds.filter(function(b){return b.status==='kosong';}).length, bedsOccupied=beds.filter(function(b){return b.status==='terisi';}).length;
  const totalPendapatan=Store.data.transactions.filter(function(t){return todayStr(new Date(t.createdAt))===today;}).reduce(function(a,t){return a+t.total;},0);
  const outPh=pharmacyMetrics('rawat_jalan'), inPh=pharmacyMetrics('rawat_inap');
  const settings=Store.data.meta.settings||{};
  const kpi=function(icon,label,value,sub,cls){return '<div class="ops-kpi '+(cls||'')+'"><div class="ops-kpi-icon">'+icon+'</div><div><div class="ops-kpi-label">'+label+'</div><div class="ops-kpi-value">'+value+'</div><div class="ops-kpi-sub">'+sub+'</div></div></div>';};
  const status=function(p){const av=getDoctorAvailability(p.id); return av.status==='available'?'<span class="ops-status ok">● Tersedia</span>':av.status==='delay'?'<span class="ops-status warn">● Terlambat</span>':av.status==='cancel'?'<span class="ops-status bad">● Tidak Praktik</span>':'<span class="ops-status">● Belum ditugaskan</span>';};
  const catalog=Store.data.poli.filter(function(p){return p.official;});
  const renderClinicTable=function(group){
    return catalog.filter(function(p){return p.layanan===group;}).map(function(p){
      const m=clinicTodayMetrics(p.id), ph=pharmacyMetrics('rawat_jalan',p.id), q=m.queue;
      return '<tr><td><strong>'+esc(p.nama)+'</strong><div class="hint">'+esc(group)+'</div></td><td class="mono">'+m.registered+'</td><td class="mono">'+m.bookings+'</td><td class="mono">'+m.waiting+'</td><td class="mono">'+m.examined+'</td><td class="mono">'+m.completed+'</td><td><span class="pharmacy-sla '+(ph.maxWait>ph.sla?'over':'')+'">'+(ph.maxWait?ph.maxWait+' mnt':'—')+'</span><div class="hint">SLA '+ph.sla+' mnt · '+ph.pending+' resep</div></td><td>'+status(p)+'</td></tr>';
    }).join('');
  };
  document.getElementById('main-content').innerHTML=
    '<div class="ops-hero"><div><div class="ops-eyebrow">SIMRS COMMAND CENTER · RSUD R.T. NOTOPURO</div><h2>Monitoring Operasional Harian</h2><p>'+formatTanggalIndo(today)+' · Rawat jalan, IGD, rawat inap, penunjang, dan farmasi.</p></div><div class="ops-hero-actions"><button class="btn btn-outline btn-sm" id="btn-dashboard-refresh">↻ Perbarui</button><button class="btn btn-primary btn-sm" data-nav="cek-antrian">📺 Papan Antrian</button></div></div>'+
    '<div class="ops-kpi-grid">'+
      kpi('👥','Pasien Terdaftar',visits.length,'kunjungan tercatat hari ini')+
      kpi('🎫','Antrean Menunggu',waiting,'semua poli',waiting>=((settings.alertQueueThreshold)||10)?'hot':'')+
      kpi('🩺','Sedang Diperiksa',diperiksa,'pelayanan berlangsung')+
      kpi('✓','Selesai',selesai,'kunjungan selesai')+
      kpi('🗓️','Booking Hari Ini',bookingHariIni.length,checkedIn+' sudah check-in')+
      kpi('💊','Farmasi Rawat Jalan',outPh.pending,'resep menunggu · max '+outPh.maxWait+' mnt',outPh.maxWait>outPh.sla?'hot':'')+
      kpi('🏥','Farmasi Rawat Inap',inPh.pending,'instruksi menunggu · max '+inPh.maxWait+' mnt',inPh.maxWait>inPh.sla?'hot':'')+
      kpi('🛏️','Bed Tersedia',bedsAvailable,beds.length+' total · '+bedsOccupied+' terisi')+
    '</div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>🩺 Rekap Semua Poli</h2><div class="hint">Setiap poli ditampilkan: terdaftar, booking, antrean, diperiksa, selesai, dan waktu farmasi.</div></div></div><div class="panel-body"><div class="table-wrap ops-clinic-table"><table><thead><tr><th>Poli</th><th>Daftar</th><th>Booking</th><th>Menunggu</th><th>Diperiksa</th><th>Selesai</th><th>Farmasi</th><th>Status</th></tr></thead><tbody>'+renderClinicTable('Poliklinik Spesialis')+'</tbody></table></div></div></section></div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>⭐ Poliklinik Eksekutif</h2><div class="hint">Monitoring terpisah dari Poliklinik Spesialis.</div></div></div><div class="panel-body"><div class="table-wrap ops-clinic-table"><table><thead><tr><th>Poli</th><th>Daftar</th><th>Booking</th><th>Menunggu</th><th>Diperiksa</th><th>Selesai</th><th>Farmasi</th><th>Status</th></tr></thead><tbody>'+renderClinicTable('Poliklinik Eksekutif')+'</tbody></table></div></div></section></div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>💊 Farmasi</h2><div class="hint">Rawat jalan memakai konsep waktu tunggu pengambilan obat; rawat inap memakai waktu pemenuhan instruksi obat untuk unit perawatan.</div></div><button class="btn btn-ghost btn-sm" data-nav="farmasi">Buka Farmasi →</button></div><div class="panel-body"><div class="pharmacy-monitor-grid"><div class="pharmacy-monitor"><span>Rawat Jalan</span><strong>'+outPh.pending+'</strong><small>menunggu · max '+outPh.maxWait+' / SLA '+outPh.sla+' mnt</small></div><div class="pharmacy-monitor"><span>Rawat Inap</span><strong>'+inPh.pending+'</strong><small>instruksi · max '+inPh.maxWait+' / SLA '+inPh.sla+' mnt</small></div><div class="pharmacy-monitor '+(outPh.overSla?'danger':'')+'"><span>Lewat SLA RJ</span><strong>'+outPh.overSla+'</strong><small>resep melewati batas</small></div><div class="pharmacy-monitor '+(inPh.overSla?'danger':'')+'"><span>Lewat SLA RI</span><strong>'+inPh.overSla+'</strong><small>instruksi melewati batas</small></div></div><div class="hint" style="margin-top:10px">SLA di atas adalah parameter prototype yang dapat diubah pada pengaturan; bukan klaim standar resmi RSUD.</div></div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>🚑 IGD & Rawat Inap</h2><div class="hint">Struktur layanan berdasarkan informasi publik RSUD.</div></div><button class="btn btn-ghost btn-sm" data-nav="ranap">Rawat Inap →</button></div><div class="panel-body"><div class="service-tree"><div><strong>IGD</strong><span>Zona Merah · Zona Kuning · Ambulans Gawat Darurat</span></div><div><strong>Rawat Inap</strong><span>Tulip · Teratai · Mawar Kuning · Mawar Merah Putih · Graha Delta Husada</span></div><div><strong>Rawat Intensif</strong><span>ICU · ICCU · PICU · NICU · HCU</span></div><div><strong>Ruang Bersalin</strong><span>Pelayanan rawat inap maternal</span></div></div></div></section></div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>📈 Alur Hari Ini</h2><div class="hint">BOOKING → CHECK-IN → MENUNGGU → DIPERIKSA → SELESAI.</div></div></div><div class="panel-body"><div class="flow-status-grid">'+[['BOOKING',bookingHariIni.length,'slate'],['CHECK-IN',checkedIn,'sage'],['MENUNGGU',waiting,'amber'],['DIPERIKSA',diperiksa,'clinical'],['SELESAI',selesai,'slate']].map(function(x){return '<div class="flow-status '+x[2]+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>';}).join('')+'</div></div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>💊 Stok Kritis</h2><div class="hint">Obat di bawah batas minimum.</div></div></div><div class="panel-body">'+(obatMenipis.length?obatMenipis.slice(0,8).map(function(m){return '<div class="ops-stock-row"><span>'+esc(m.nama)+'</span><strong>'+m.stok+' '+esc(m.satuan)+'</strong></div>';}).join(''):'<div class="ops-empty">✓ Stok aman.</div>')+'</div></section></div>';
  const btn=document.getElementById('btn-dashboard-refresh'); if(btn) btn.addEventListener('click',renderDashboard);
}

function renderBeranda(){
  const u = Session.currentUser;
  setPageTitle('Beranda');
  document.getElementById('main-content').innerHTML =
    '<div class="hello-bar"><div><h1>'+greetingWaktu()+', '+esc((u.nama||'').split(' ')[0])+'</h1>'+
    '<p style="color:var(--ink-soft);font-size:13px;margin-top:2px">'+formatTanggalIndo(todayStr())+(u.poliId?' · '+esc(getPoli(u.poliId).nama):'')+'</p></div></div>'+
    '<div id="beranda-body"></div>';
  renderBerandaBody();
}
function renderBerandaBody(){
  const u = Session.currentUser;
  const el = document.getElementById('beranda-body');
  if(!el) return;
  if(u.role==='loket') el.innerHTML = berandaLoket();
  else if(u.role==='dokter') el.innerHTML = berandaDokter();
  else if(u.role==='farmasi') el.innerHTML = berandaFarmasi();
  else if(u.role==='kasir') el.innerHTML = berandaKasir();
  else if(u.role==='lab') el.innerHTML = berandaLab();
  else if(u.role==='perawat') el.innerHTML = berandaPerawat();
  bindBerandaActionEvents();
}
function bindBerandaActionEvents(){
  document.querySelectorAll('.action-card[data-nav], .btn[data-nav]').forEach(c=> c.addEventListener('click', ()=> navigate(c.dataset.nav)));
  document.querySelectorAll('[data-action="global-search"]').forEach(c=> c.addEventListener('click', openGlobalSearch));
}
function berandaLoket(){
  const visits = visitsToday();
  const besok = dateOffset(1);
  const bookingBesok = Store.data.bookings.filter(b=>b.tanggalKontrol===besok && b.status==='terjadwal');
  const belumIngat = bookingBesok.filter(b=>!b.reminded).length;
  return '<div class="grid grid-3">'+
      statCard('Pasien Terdaftar', visits.length, 'hari ini')+
      statCard('Booking Besok', bookingBesok.length, belumIngat+' belum diingatkan')+
      statCard('Sedang Berjalan', visits.filter(v=>v.status!=='selesai').length, 'antrian aktif')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="pendaftaran"><span class="ic">📝</span><span class="lbl">Daftarkan Pasien</span></div>'+
      '<div class="action-card" data-nav="booking"><span class="ic">📅</span><span class="lbl">Booking Antrian</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>'+
    '<div class="panel"><div class="panel-head"><h2>Antrian Hari Ini</h2></div><div class="panel-body">'+renderAntrianTable(visits)+'</div></div>';
}
function berandaDokter(){
  const u = Session.currentUser;
  const visits = visitsToday().filter(v=>v.poliId===u.poliId);
  const menunggu = visits.filter(v=>v.status==='menunggu_poli').sort((a,b)=> (b.prioritas?1:0)-(a.prioritas?1:0) || new Date(a.createdAt)-new Date(b.createdAt));
  const urgentCount = menunggu.filter(v=>v.prioritas).length;
  const hasilLabSiap = visits.filter(v=>v.status==='diperiksa' && v.labRequest && v.labRequest.status==='selesai').length;
  const bookingHariIni = Store.data.bookings.filter(b=>b.poliId===u.poliId && b.tanggalKontrol===todayStr());
  const ranapSaya = Store.data.admissions.filter(a=>a.dpjpUserId===u.id && a.status==='dirawat');
  const ranapPerhatian = ranapSaya.filter(function(a){ const v=a.vitalLog[a.vitalLog.length-1]; return v && v.news2>=5; }).length;

  let html = '<h3 style="color:var(--ink-soft);margin-bottom:10px">🩺 Rawat Jalan — '+esc(getPoli(u.poliId).nama)+'</h3>'+
    '<div class="grid grid-3">'+
      statCard('Menunggu Diperiksa', menunggu.length, urgentCount>0 ? urgentCount+' prioritas 🚩' : 'poli Anda')+
      statCard('Hasil Lab Siap', hasilLabSiap, 'perlu ditindaklanjuti')+
      statCard('Booking Hari Ini', bookingHariIni.length, 'kontrol terjadwal')+
    '</div>';
  if(menunggu.length>0){
    const next = menunggu[0], p = getPatient(next.patientId);
    html += '<div class="panel"><div class="panel-head"><h2>Pasien Berikutnya</h2>'+(next.prioritas?'<span class="badge badge-brick">🚩 Prioritas</span>':'')+'</div><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'+
      '<div><div class="mono" style="font-size:22px;font-weight:700">'+next.noAntrian+'</div><div>'+esc(p.nama)+'</div></div>'+
      '<button class="btn btn-primary" data-nav="poli">Buka di Poli →</button></div></div></div>';
  }
  html += '<div class="action-grid">'+
      '<div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Antrian Poli</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Rekam Medis</span></div>'+
    '</div>'+
    '<h3 style="color:var(--ink-soft);margin:22px 0 10px">🏨 Rawat Inap</h3>'+
    '<div class="grid grid-2">'+
      statCard('Pasien Saya Dirawat', ranapSaya.length, 'sebagai DPJP')+
      statCard('Perlu Perhatian', ranapPerhatian, 'skor NEWS2 ≥5')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="ranap"><span class="ic">🏨</span><span class="lbl">Pasien Rawat Inap</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
  return html;
}
function berandaFarmasi(){
  const visits = visitsToday();
  const stokMenipis = Store.data.medicines.filter(m=>m.stok<LOW_STOCK_THRESHOLD).length;
  const resepRanap = Store.data.prescriptions.filter(r=>r.admissionId && r.status==='menunggu').length;
  return '<div class="grid grid-4">'+
      statCard('Resep Rawat Jalan', visits.filter(v=>v.status==='menunggu_farmasi').length, 'perlu disiapkan')+
      statCard('Resep Rawat Inap', resepRanap, 'perlu disiapkan')+
      statCard('Siap Diambil', visits.filter(v=>v.status==='obat_siap').length, 'menunggu pasien')+
      statCard('Stok Menipis', stokMenipis, stokMenipis>0 ? 'perlu restock' : 'aman')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="farmasi"><span class="ic">💊</span><span class="lbl">Antrian Resep</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
}
function berandaKasir(){
  const today = todayStr();
  const trxHariIni = Store.data.transactions.filter(t=>todayStr(new Date(t.createdAt))===today);
  const tagihanRanap = Store.data.admissions.filter(a=>a.status!=='dirawat' && a.billing.statusBayar==='belum_bayar').length;
  return '<div class="grid grid-4">'+
      statCard('Menunggu Bayar (Rawat Jalan)', visitsToday().filter(v=>v.status==='menunggu_bayar').length, 'tagihan aktif')+
      statCard('Menunggu Bayar (Rawat Inap)', tagihanRanap, 'pasien sudah pulang')+
      statCard('Pendapatan Hari Ini', formatRupiah(trxHariIni.reduce((s,t)=>s+t.total,0)), trxHariIni.length+' transaksi')+
      statCard('Booking Besok', Store.data.bookings.filter(b=>b.tanggalKontrol===dateOffset(1)).length, 'perlu disiapkan')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="kasir"><span class="ic">🧾</span><span class="lbl">Proses Bayar</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
}
function berandaLab(){
  return '<div class="grid grid-3">'+
      statCard('Menunggu Pemeriksaan', visitsToday().filter(v=>v.status==='menunggu_lab').length, 'rujukan masuk')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="lab"><span class="ic">🧪</span><span class="lbl">Antrian Lab</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
}
function berandaPerawat(){
  const aktif = Store.data.admissions.filter(a=>a.status==='dirawat');
  const perluPerhatian = aktif.filter(a=>{
    const v = a.vitalLog[a.vitalLog.length-1];
    return v && v.news2>=5;
  }).length;
  const bedKosong = Store.data.beds.filter(b=>b.status==='kosong').length;
  return '<div class="grid grid-3">'+
      statCard('Pasien Dirawat', aktif.length, 'seluruh bangsal')+
      statCard('Perlu Perhatian', perluPerhatian, 'skor NEWS2 ≥5')+
      statCard('Bed Kosong', bedKosong, 'dari '+Store.data.beds.length+' total')+
    '</div>'+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="ranap"><span class="ic">🏨</span><span class="lbl">Rawat Inap</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
}

/* =================================================================
   MODULE: PENDAFTARAN
   ================================================================= */
let pendaftaranState = { pasienTerpilih:null, mode:'baru' };

function renderPendaftaran(){
  setPageTitle('Pendaftaran');
  pendaftaranState = { pasienTerpilih:null, mode:'baru' };
  document.getElementById('main-content').innerHTML =
    pageIntro('Daftarkan pasien baru atau cari pasien lama, lalu buat kunjungan ke poli tujuan.')+
    '<div class="panel"><div class="panel-head"><h2>Data Pasien</h2>'+
      '<div class="tabs" style="border:none;margin:0"><button class="tab active" id="tab-baru" style="padding:4px 10px">Pasien Baru</button><button class="tab" id="tab-lama" style="padding:4px 10px">Pasien Lama</button></div>'+
    '</div><div class="panel-body" id="pendaftaran-pasien-area"></div></div>'+
    '<div id="pendaftaran-kunjungan-area"></div>'+
    '<div class="panel"><div class="panel-head"><h2>Antrian Hari Ini — Semua Poli</h2></div><div class="panel-body" id="antrian-hari-ini-area"></div></div>';
  document.getElementById('tab-baru').addEventListener('click', ()=> switchPendaftaranTab('baru'));
  document.getElementById('tab-lama').addEventListener('click', ()=> switchPendaftaranTab('lama'));
  switchPendaftaranTab('baru');
  refreshAntrianHariIni();
}
function refreshAntrianHariIni(){
  const el = document.getElementById('antrian-hari-ini-area');
  if(el) el.innerHTML = renderAntrianTable(visitsToday());
}
function switchPendaftaranTab(mode){
  pendaftaranState.mode = mode;
  document.getElementById('tab-baru').classList.toggle('active', mode==='baru');
  document.getElementById('tab-lama').classList.toggle('active', mode==='lama');
  const area = document.getElementById('pendaftaran-pasien-area');
  if(mode==='baru'){
    area.innerHTML = formPasienBaru();
    document.getElementById('form-pasien-baru').addEventListener('submit', submitPatientBaru);
  } else {
    area.innerHTML = formCariPasien();
    document.getElementById('form-cari-pasien').addEventListener('submit', function(e){
      e.preventDefault(); doSearchPatient(document.getElementById('cari-pasien-input').value.trim());
    });
  }
  document.getElementById('pendaftaran-kunjungan-area').innerHTML = '';
}
function formPasienBaru(){
  return '<form id="form-pasien-baru">'+
    '<div class="field-row"><div class="field"><label>NIK (16 digit)</label><input type="text" id="pb-nik" pattern="[0-9]{16}" maxlength="16" required></div>'+
    '<div class="field"><label>Nama Lengkap</label><input type="text" id="pb-nama" required></div></div>'+
    '<div class="field-row3"><div class="field"><label>Jenis Kelamin</label><select id="pb-jk"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>'+
    '<div class="field"><label>Tanggal Lahir</label><input type="date" id="pb-tgl" required></div>'+
    '<div class="field"><label>Golongan Darah</label><select id="pb-gol"><option value="">-</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div></div>'+
    '<div class="field"><label>Alamat</label><input type="text" id="pb-alamat" required></div>'+
    '<div class="field-row"><div class="field"><label>No. HP</label><input type="text" id="pb-hp" required></div>'+
    '<div class="field"><label>Riwayat Alergi (jika ada)</label><input type="text" id="pb-alergi" placeholder="contoh: Penisilin"></div></div>'+
    '<button type="submit" class="btn btn-primary">Simpan &amp; Lanjutkan</button></form>';
}
function submitPatientBaru(e){
  e.preventDefault();
  const nik = document.getElementById('pb-nik').value.trim();
  if(!/^\d{16}$/.test(nik)){ showToast('NIK harus 16 digit angka', 'danger'); return; }
  Store.data.meta.rmCounter++;
  const id = 'RM-' + new Date().getFullYear() + '-' + String(Store.data.meta.rmCounter).padStart(4,'0');
  const patient = {
    id, nik, nama: document.getElementById('pb-nama').value.trim(),
    jenisKelamin: document.getElementById('pb-jk').value, tglLahir: document.getElementById('pb-tgl').value,
    golDarah: document.getElementById('pb-gol').value, alamat: document.getElementById('pb-alamat').value.trim(),
    noHp: document.getElementById('pb-hp').value.trim(), alergi: document.getElementById('pb-alergi').value.trim(),
    createdAt: nowISO()
  };
  Store.data.patients.push(patient); Store.save();
  logAudit('pasien_baru', patient.nama+' ('+patient.id+')');
  showToast('Pasien baru tersimpan: '+patient.id, 'success');
  pilihPasienUntukKunjungan(patient.id);
}
function formCariPasien(){
  return '<form id="form-cari-pasien" class="search-row"><input type="text" id="cari-pasien-input" placeholder="Cari berdasarkan NIK, No. RM, atau Nama...">'+
    '<button type="submit" class="btn btn-primary">Cari</button></form><div id="hasil-cari-pasien"></div>';
}
function doSearchPatient(q){
  const el = document.getElementById('hasil-cari-pasien');
  if(!q){ el.innerHTML=''; return; }
  const qLower = q.toLowerCase();
  const results = Store.data.patients.filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower));
  if(results.length===0){ el.innerHTML = '<div class="empty">Pasien tidak ditemukan. Silakan gunakan tab "Pasien Baru".</div>'; return; }
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>No. RM</th><th>Nama</th><th>NIK</th><th>Tgl Lahir</th><th></th></tr></thead><tbody>'+
    results.map(p=>'<tr><td class="mono">'+p.id+'</td><td>'+esc(p.nama)+'</td><td class="mono">'+maskNik(p.nik)+'</td><td>'+formatTanggalIndo(p.tglLahir)+'</td>'+
      '<td><button class="btn btn-outline btn-sm" data-pick="'+p.id+'">Pilih</button></td></tr>').join('')+'</tbody></table></div>';
  el.querySelectorAll('[data-pick]').forEach(btn=> btn.addEventListener('click', ()=> pilihPasienUntukKunjungan(btn.dataset.pick)));
}
function pilihPasienUntukKunjungan(patientId){
  pendaftaranState.pasienTerpilih = patientId;
  const patient = getPatient(patientId);
  const area = document.getElementById('pendaftaran-kunjungan-area');
  area.innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Buat Kunjungan — '+esc(patient.nama)+' <span class="mono" style="font-weight:400;color:var(--ink-soft);font-size:13px">('+patient.id+')</span></h2></div>'+
    '<div class="panel-body">'+
      (patient.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(patient.alergi)+'</div>' : '')+
      '<form id="form-kunjungan"><div class="field-row">'+
        '<div class="field"><label>Poli Tujuan</label><select id="kj-poli" required>'+Store.data.poli.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+' — '+formatRupiah(p.biaya)+'</option>').join('')+'</select></div>'+
        '<div class="field"><label>Jenis Pembayaran</label><select id="kj-bayar" required><option value="Umum">Umum (Bayar Sendiri)</option><option value="BPJS">BPJS Kesehatan</option><option value="Asuransi">Asuransi Swasta</option></select></div>'+
      '</div><div class="field"><label>Keluhan Utama</label><textarea id="kj-keluhan" required placeholder="contoh: Demam sejak 2 hari, batuk pilek"></textarea></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="kj-prioritas"><label for="kj-prioritas" style="margin:0">🚩 Tandai prioritas / kondisi gawat darurat (didahulukan di antrian)</label></div>'+
      '<button type="submit" class="btn btn-primary">Daftarkan &amp; Ambil Nomor Antrian</button> <button type="button" class="btn btn-ghost" id="btn-batal-kunjungan">Batal</button></form>'+
      '<div id="tiket-area"></div></div></div>';
  document.getElementById('form-kunjungan').addEventListener('submit', submitKunjungan);
  document.getElementById('btn-batal-kunjungan').addEventListener('click', ()=>{ area.innerHTML=''; pendaftaranState.pasienTerpilih=null; });
}
function generateNoAntrian(poliId, dateStr){
  dateStr = dateStr || todayStr();
  const key = poliId + '-' + dateStr;
  const n = (Store.data.meta.queueCounters[key] || 0) + 1;
  Store.data.meta.queueCounters[key] = n;
  return poliId + '-' + String(n).padStart(3,'0');
}
function dateOffset(n){ const d=new Date(); d.setDate(d.getDate()+n); return todayStr(d); }
function getBooking(id){ return Store.data.bookings.find(b=>b.id===id); }
function expireOldBookings(){
  const today = todayStr();
  let changed = false;
  Store.data.bookings.forEach(b=>{
    if(b.status==='terjadwal' && b.tanggalKontrol < today){ b.status = 'kadaluarsa'; changed = true; }
  });
  if(changed) Store.save();
}

/* ---------------- keamanan: audit log, masking, sesi ---------------- */
function logAudit(aksi, detail){
  if(!Store.data.auditLog) Store.data.auditLog = [];
  const u = Session.currentUser;
  Store.data.auditLog.unshift({
    id: uid('LOG'), userName: u ? u.nama : 'Sistem', role: u ? roleLabel(u.role) : '-',
    aksi, detail: detail || '', createdAt: nowISO()
  });
  if(Store.data.auditLog.length > 500) Store.data.auditLog.length = 500;
  Store.save();
}
function maskNik(nik){
  if(!nik || nik.length < 8) return nik || '-';
  return nik.slice(0,4) + '••••••••' + nik.slice(-4);
}
function waLink(noHp, message){
  let digits = (noHp||'').replace(/\D/g,'');
  if(digits.startsWith('0')) digits = '62'+digits.slice(1);
  else if(!digits.startsWith('62')) digits = '62'+digits;
  return 'https://wa.me/'+digits+'?text='+encodeURIComponent(message);
}

const SESSION_TIMEOUT_MS = 15*60*1000;
const SESSION_WARNING_MS = 60*1000;
let _sessionWarnTimer = null, _sessionLogoutTimer = null;
function resetSessionTimer(){
  if(_sessionWarnTimer) clearTimeout(_sessionWarnTimer);
  if(_sessionLogoutTimer) clearTimeout(_sessionLogoutTimer);
  if(!Session.currentUser) return;
  _sessionWarnTimer = setTimeout(showSessionTimeoutWarning, SESSION_TIMEOUT_MS - SESSION_WARNING_MS);
  _sessionLogoutTimer = setTimeout(forceLogoutIdle, SESSION_TIMEOUT_MS);
}
function showSessionTimeoutWarning(){
  if(!Session.currentUser) return;
  openModal(
    '<div class="modal-head"><h2>⏱ Sesi Akan Berakhir</h2></div><div class="modal-body">'+
    '<p>Tidak ada aktivitas selama beberapa saat. Demi keamanan data pasien, sesi ini akan otomatis keluar dalam 1 menit.</p>'+
    '<button class="btn btn-primary btn-block" id="btn-stay-logged-in">Tetap Masuk</button></div>'
  );
  const btn = document.getElementById('btn-stay-logged-in');
  if(btn) btn.addEventListener('click', function(){ closeModal(); resetSessionTimer(); });
}
function forceLogoutIdle(){
  if(!Session.currentUser) return;
  logAudit('logout_otomatis', 'Sesi berakhir karena tidak ada aktivitas selama 15 menit');
  closeModal();
  Session.logout();
  location.hash = '';
  render();
  showToast('Sesi berakhir otomatis karena tidak ada aktivitas', 'warning');
}

let _loginAttempts = {};
function submitKunjungan(e){
  e.preventDefault();
  const poliId = document.getElementById('kj-poli').value;
  const jenisBayar = document.getElementById('kj-bayar').value;
  const keluhan = document.getElementById('kj-keluhan').value.trim();
  const prioritas = document.getElementById('kj-prioritas').checked;
  const patientId = pendaftaranState.pasienTerpilih;
  const poli = getPoli(poliId);
  const noAntrian = generateNoAntrian(poliId);
  const visit = {
    id: uid('KJ'), patientId, tanggal: todayStr(), poliId, dokterId:null, jenisBayar, noBpjs:'', noAntrian, keluhan,
    status:'menunggu_poli', vital:null, diagnosis:'', catatan:'', labRequest:null, resepId:null, prioritas,
    billing:{registrasi:BIAYA_REGISTRASI, konsultasi:0, obat:0, lab:0}, createdAt: nowISO(), updatedAt: nowISO()
  };
  Store.data.visits.push(visit); Store.save();
  logAudit(prioritas?'pendaftaran_prioritas':'pendaftaran', noAntrian+' — '+esc(getPatient(patientId).nama)+' ke '+poli.nama);
  showToast('Kunjungan dibuat — nomor antrian '+noAntrian, 'success');
  const patient = getPatient(patientId);
  document.getElementById('tiket-area').innerHTML =
    '<div class="ticket" style="margin-top:16px"><div class="lbl">NOMOR ANTRIAN — '+esc(poli.nama).toUpperCase()+'</div>'+
    '<div class="num">'+noAntrian+'</div><div class="meta">'+esc(patient.nama)+' &middot; '+formatTanggalWaktu(visit.createdAt)+'</div></div>'+
    '<div style="margin-top:12px;display:flex;gap:8px"><button class="btn btn-outline" id="btn-cetak-tiket">🖶 Cetak Tiket</button>'+
    '<button class="btn btn-ghost" id="btn-daftar-lagi">Daftarkan Pasien Lain</button></div>';
  document.getElementById('btn-cetak-tiket').addEventListener('click', ()=> cetakTiket(visit.id));
  document.getElementById('btn-daftar-lagi').addEventListener('click', renderPendaftaran);
  refreshAntrianHariIni();
}
function cetakTiket(visitId){
  const v = getVisit(visitId), p = getPatient(v.patientId), poli = getPoli(v.poliId);
  printArea('<div style="text-align:center;font-family:monospace;max-width:300px;margin:0 auto"><h2>RSU SEHAT SENTOSA</h2><p>Nomor Antrian</p>'+
    '<div style="font-size:48px;font-weight:700;margin:14px 0">'+v.noAntrian+'</div><p>'+esc(poli.nama)+'</p><hr>'+
    '<p style="text-align:left">Nama: '+esc(p.nama)+'<br>No. RM: '+p.id+'<br>Tanggal: '+formatTanggalWaktu(v.createdAt)+'<br>Pembayaran: '+esc(v.jenisBayar)+'</p></div>');
}

/* =================================================================
   MODULE: BOOKING ANTRIAN (BPJS/JKN Mobile simulasi + umum + check-in QR)
   ================================================================= */
let bookingTab = 'jkn';
let bookingSearchPatientId = null;

function renderBooking(){
  setPageTitle('Booking Antrian');
  expireOldBookings();
  bookingTab = 'jkn';
  document.getElementById('main-content').innerHTML =
    pageIntro('Booking kontrol lanjutan hingga 3 hari ke depan — dari sinkronisasi BPJS/JKN Mobile maupun booking mandiri pasien umum — memakai satu urutan nomor antrian yang sama, lalu check-in barcode/QR di hari kunjungan.')+
    '<div class="tabs"><button class="tab active" data-btab="jkn">BPJS / JKN Mobile</button>'+
    '<button class="tab" data-btab="umum">Pasien Umum</button>'+
    '<button class="tab" data-btab="checkin">Check-in Hari Ini</button>'+
    '<button class="tab" data-btab="h1">Pengingat H-1</button></div>'+
    '<div id="booking-tab-area"></div>';
  document.querySelectorAll('[data-btab]').forEach(t=> t.addEventListener('click', ()=> switchBookingTab(t.dataset.btab)));
  renderBookingJknTab();
}
function switchBookingTab(tab){
  bookingTab = tab;
  document.querySelectorAll('[data-btab]').forEach(t=> t.classList.toggle('active', t.dataset.btab===tab));
  if(tab==='jkn') renderBookingJknTab();
  else if(tab==='umum') renderBookingUmumTab();
  else if(tab==='checkin') renderBookingCheckinTab();
  else renderBookingH1Tab();
}
function bookingFormHtml(jenisBayar){
  const isBpjs = jenisBayar==='BPJS';
  return '<form id="form-booking">'+
    '<div class="field"><label>Pasien</label>'+
      '<div class="search-row"><input type="text" id="bk-cari" placeholder="Cari NIK / No. RM / Nama pasien terdaftar…"><button type="button" class="btn btn-outline" id="bk-btn-cari">Cari</button></div>'+
      '<div id="bk-hasil-cari"></div><div id="bk-pasien-terpilih" class="hint"></div>'+
    '</div>'+
    '<div class="field-row">'+
      '<div class="field"><label>Poli Tujuan</label><select id="bk-poli" required>'+Store.data.poli.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+'</option>').join('')+'</select></div>'+
      '<div class="field"><label>Tanggal Kontrol</label><input type="date" id="bk-tanggal" min="'+dateOffset(1)+'" max="'+dateOffset(3)+'" value="'+dateOffset(1)+'" required></div>'+
    '</div>'+
    (isBpjs ? '<div class="field"><label>No. Kartu BPJS</label><input type="text" id="bk-nobpjs" placeholder="0001234567890" required></div>' : '')+
    '<button type="submit" class="btn btn-primary" disabled id="btn-submit-booking">'+(isBpjs?'Simulasikan Booking Masuk':'Buat Booking')+'</button>'+
    '</form><div id="bk-confirm"></div>';
}
function bindBookingListActions(){
  document.querySelectorAll('[data-reschedule]').forEach(function(b){ b.addEventListener('click',function(){ rescheduleBooking(this.dataset.reschedule); }); });
  document.querySelectorAll('[data-cancel-booking]').forEach(function(b){ b.addEventListener('click',function(){ cancelBooking(this.dataset.cancelBooking); }); });
  document.querySelectorAll('[data-view-booking]').forEach(function(b){ b.addEventListener('click',function(){ const x=getBooking(this.dataset.viewBooking); if(!x)return; openModal('<div class="modal-head"><h2>Detail Booking '+esc(x.noAntrian)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p><strong>Pasien:</strong> '+esc(getPatient(x.patientId).nama)+'<br><strong>Poli:</strong> '+esc(getPoli(x.poliId).nama)+'<br><strong>Tanggal:</strong> '+formatTanggalIndo(x.tanggalKontrol)+'<br><strong>Status:</strong> '+bookingStatusLabel(x.status)+'</p></div>'); }); });
}
function renderBookingJknTab(){
  bookingSearchPatientId = null;
  document.getElementById('booking-tab-area').innerHTML =
    '<div class="alert alert-info">Di lingkungan produksi, data ini akan masuk otomatis lewat API Antrean Online BPJS Kesehatan saat pasien booking dari aplikasi Mobile JKN. Form ini mensimulasikan data yang diterima dari sana untuk keperluan uji alur.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Simulasi Booking Masuk — BPJS / JKN Mobile</h2></div><div class="panel-body">'+bookingFormHtml('BPJS')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Booking BPJS Terjadwal</h2></div><div class="panel-body" id="bk-list-area">'+renderBookingListHtml('BPJS')+'</div></div>';
  bindBookingFormEvents('BPJS');
  bindBookingListActions();
}
function renderBookingUmumTab(){
  bookingSearchPatientId = null;
  document.getElementById('booking-tab-area').innerHTML =
    '<div class="alert alert-info">Booking mandiri untuk pasien umum, maksimal 3 hari sebelum tanggal kunjungan. Nomor antrian melanjutkan urutan yang sama dengan booking BPJS pada poli &amp; tanggal yang sama — bukan antrian terpisah.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Buat Booking — Pasien Umum</h2></div><div class="panel-body">'+bookingFormHtml('Umum')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Booking Umum Terjadwal</h2></div><div class="panel-body" id="bk-list-area">'+renderBookingListHtml('Umum')+'</div></div>';
  bindBookingFormEvents('Umum');
  bindBookingListActions();
}
function bindBookingFormEvents(jenisBayar){
  document.getElementById('bk-btn-cari').addEventListener('click', function(){
    const q = document.getElementById('bk-cari').value.trim();
    const qLower = q.toLowerCase();
    const el = document.getElementById('bk-hasil-cari');
    if(!q){ el.innerHTML=''; return; }
    const results = Store.data.patients.filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower));
    el.innerHTML = results.length===0 ? '<div class="hint">Pasien tidak ditemukan — daftarkan dulu lewat menu Pendaftaran.</div>' :
      '<div class="chip-row" style="margin-top:8px">'+results.map(p=>'<button type="button" class="chip" data-pid="'+p.id+'">'+esc(p.nama)+' ('+p.id+')</button>').join('')+'</div>';
    el.querySelectorAll('[data-pid]').forEach(b=>{
      b.addEventListener('click', function(){
        bookingSearchPatientId = this.dataset.pid;
        const p = getPatient(bookingSearchPatientId);
        document.getElementById('bk-pasien-terpilih').innerHTML = 'Terpilih: <strong>'+esc(p.nama)+'</strong> ('+p.id+')'+(p.alergi?' &middot; Alergi: '+esc(p.alergi):'');
        document.getElementById('bk-hasil-cari').innerHTML = '';
        document.getElementById('btn-submit-booking').disabled = false;
      });
    });
  });
  document.getElementById('form-booking').addEventListener('submit', function(e){ e.preventDefault(); submitBooking(jenisBayar); });
}
function submitBooking(jenisBayar){
  if(!bookingSearchPatientId){ showToast('Pilih pasien terlebih dahulu', 'danger'); return; }
  const poliId = document.getElementById('bk-poli').value;
  const tanggalKontrol = document.getElementById('bk-tanggal').value;
  const noBpjs = jenisBayar==='BPJS' ? document.getElementById('bk-nobpjs').value.trim() : '';
  if(jenisBayar==='BPJS' && !noBpjs){ showToast('Isi nomor kartu BPJS', 'danger'); return; }
  if(!tanggalKontrol){ showToast('Pilih tanggal kontrol', 'danger'); return; }
  const kuota = quotaForPoli(poliId, tanggalKontrol);
  const terjadwal = Store.data.bookings.filter(function(b){ return b.poliId===poliId && b.tanggalKontrol===tanggalKontrol && ['terjadwal','checked_in'].includes(b.status); }).length;
  if(terjadwal >= kuota){ showToast('Kuota booking poli pada tanggal tersebut sudah penuh ('+kuota+' pasien)', 'danger'); return; }
  const noAntrian = generateNoAntrian(poliId, tanggalKontrol);
  const booking = {
    id: uid('BK'), patientId: bookingSearchPatientId, poliId, tanggalKontrol, jenisBayar,
    sumber: jenisBayar==='BPJS' ? 'JKN Mobile (Simulasi)' : 'Aplikasi RS',
    noBpjs, noAntrian, kodeCheckIn: uid('CHK').toUpperCase(), status:'terjadwal', visitId:null,
    reminded:false, remindedAt:null, createdAt: nowISO(), updatedAt: nowISO(), cancelReason:'', rescheduledFrom:null
  };
  Store.data.bookings.push(booking);
  pushNotification('booking','Booking baru',booking.noAntrian+' — '+getPatient(booking.patientId).nama,booking.patientId);
  Store.save();
  logAudit('booking_'+jenisBayar.toLowerCase(), noAntrian+' — '+esc(getPatient(bookingSearchPatientId).nama)+' ('+formatTanggalIndo(tanggalKontrol)+')');
  showToast('Booking dibuat — nomor antrian '+noAntrian, 'success');
  const patient = getPatient(bookingSearchPatientId), poli = getPoli(poliId);
  document.getElementById('bk-confirm').innerHTML =
    '<div class="ticket" style="margin-top:16px"><div class="lbl">BOOKING TERKONFIRMASI — '+esc(poli.nama).toUpperCase()+'</div>'+
    '<div class="num">'+noAntrian+'</div><div class="meta">'+esc(patient.nama)+' &middot; '+formatTanggalIndo(tanggalKontrol)+' &middot; '+jenisBayar+'</div></div>'+
    '<div style="text-align:center;margin-top:16px">'+renderQrSvg(booking.kodeCheckIn,150)+
    '<div class="hint" style="margin-top:8px">Kode check-in: <span class="mono">'+booking.kodeCheckIn+'</span> — tunjukkan QR ini (atau kodenya) saat check-in di hari kunjungan.</div></div>';
  document.getElementById('bk-list-area').innerHTML = renderBookingListHtml(jenisBayar);
}
function renderBookingListHtml(jenisBayar){
  const list = Store.data.bookings.filter(function(b){ return b.jenisBayar===jenisBayar; }).sort(function(a,b){ return b.tanggalKontrol.localeCompare(a.tanggalKontrol) || a.noAntrian.localeCompare(b.noAntrian); });
  if(list.length===0) return '<div class="empty">Belum ada booking.</div>';
  return '<div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Poli</th><th>Tanggal Kontrol</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+
    list.map(function(b){
      const p=getPatient(b.patientId), poli=getPoli(b.poliId);
      const canManage = b.status==='terjadwal' && b.tanggalKontrol>=todayStr();
      return '<tr><td class="mono" style="font-weight:700">'+b.noAntrian+'</td><td>'+esc(p.nama)+'</td><td>'+esc(poli.nama)+'</td>'+
        '<td>'+formatTanggalIndo(b.tanggalKontrol)+'</td><td>'+badgeStatus(b.status)+'<div class="booking-state-label">'+bookingStatusLabel(b.status)+'</div></td>'+
        '<td><div class="chip-row">'+
          (canManage?'<button class="btn btn-outline btn-sm" data-reschedule="'+b.id+'">🔄 Ubah</button><button class="btn btn-danger btn-sm" data-cancel-booking="'+b.id+'">Batal</button>':'')+
          (b.status==='checked_in'?'<button class="btn btn-ghost btn-sm" data-view-booking="'+b.id+'">Detail</button>':'')+
        '</div></td></tr>';
    }).join('')+'</tbody></table></div>';
}
function refreshBookingListAfterAction(){
  const area=document.getElementById('bk-list-area');
  if(area) area.innerHTML=renderBookingListHtml(bookingTab==='jkn'?'BPJS':'Umum');
}
function cancelBooking(bookingId){
  const b=getBooking(bookingId);
  if(!b || b.status!=='terjadwal'){ showToast('Booking tidak dapat dibatalkan','danger'); return; }
  openModal('<div class="modal-head"><h2>Batalkan Booking</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><p>Batalkan booking <strong>'+esc(b.noAntrian)+'</strong> untuk '+esc(getPatient(b.patientId).nama)+'?</p>'+
    '<div class="field"><label>Alasan pembatalan</label><textarea id="cancel-booking-reason" placeholder="Contoh: pasien meminta perubahan jadwal"></textarea></div>'+
    '<button class="btn btn-danger btn-block" id="btn-confirm-cancel">Batalkan Booking</button></div>');
  document.getElementById('btn-confirm-cancel').addEventListener('click',function(){
    const reason=(document.getElementById('cancel-booking-reason').value||'Tidak disebutkan').trim();
    b.status='dibatalkan'; b.cancelReason=reason; b.updatedAt=nowISO();
    Store.save(); logAudit('booking_dibatalkan',b.noAntrian+' — '+reason); pushNotification('booking','Booking dibatalkan',b.noAntrian+' — '+getPatient(b.patientId).nama,b.patientId);
    closeModal(); refreshBookingListAfterAction(); showToast('Booking dibatalkan','success');
  });
}
function rescheduleBooking(bookingId){
  const b=getBooking(bookingId);
  if(!b || b.status!=='terjadwal'){ showToast('Booking tidak dapat diubah','danger'); return; }
  const poliOptions=Store.data.poli.map(function(p){ return '<option value="'+p.id+'" '+(p.id===b.poliId?'selected':'')+'>'+esc(p.nama)+'</option>'; }).join('');
  openModal('<div class="modal-head"><h2>🔄 Ubah Jadwal Booking</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><div class="field"><label>Poli</label><select id="rs-poli">'+poliOptions+'</select></div>'+
    '<div class="field"><label>Tanggal baru</label><input type="date" id="rs-tanggal" min="'+todayStr()+'" value="'+esc(b.tanggalKontrol)+'"></div>'+
    '<button class="btn btn-primary btn-block" id="btn-confirm-reschedule">Simpan Jadwal Baru</button></div>');
  document.getElementById('btn-confirm-reschedule').addEventListener('click',function(){
    const poliId=document.getElementById('rs-poli').value, tanggal=document.getElementById('rs-tanggal').value;
    if(!tanggal){ showToast('Pilih tanggal baru','danger'); return; }
    const oldQueue=b.noAntrian, oldDate=b.tanggalKontrol;
    b.poliId=poliId; b.tanggalKontrol=tanggal; b.noAntrian=generateNoAntrian(poliId,tanggal); b.status='terjadwal'; b.rescheduledFrom=oldQueue; b.updatedAt=nowISO();
    Store.save(); logAudit('booking_reschedule',oldQueue+' → '+b.noAntrian+' ('+formatTanggalIndo(tanggal)+')'); pushNotification('booking','Jadwal diperbarui',b.noAntrian+' — '+getPatient(b.patientId).nama,b.patientId);
    closeModal(); refreshBookingListAfterAction(); showToast('Booking berhasil dijadwalkan ulang','success');
  });
}
function markBookingNoShow(bookingId){
  const b=getBooking(bookingId);
  if(!b || b.status!=='terjadwal' || b.tanggalKontrol!==todayStr()){ showToast('Hanya booking hari ini yang dapat ditandai tidak hadir','danger'); return; }
  b.status='tidak_hadir'; b.updatedAt=nowISO(); Store.save(); logAudit('booking_tidak_hadir',b.noAntrian+' — '+getPatient(b.patientId).nama);
  showToast('Booking ditandai tidak hadir','warning');
}

function renderBookingCheckinTab(){
  const today = todayStr();
  const list = Store.data.bookings.filter(b=>b.tanggalKontrol===today && b.status==='terjadwal').sort((a,b)=>a.noAntrian.localeCompare(b.noAntrian));
  document.getElementById('booking-tab-area').innerHTML =
    '<div style="margin-bottom:14px"><button class="btn btn-primary" id="btn-open-scan">📷 Scan QR Pasien</button></div>'+
    '<div class="panel"><div class="panel-head"><h2>Jadwal Kontrol Hari Ini ('+list.length+')</h2></div><div class="panel-body" id="bk-checkin-list"></div></div>';
  document.getElementById('btn-open-scan').addEventListener('click', openScanSheet);
  renderCheckinList(list);
}
function renderCheckinList(list){
  const el = document.getElementById('bk-checkin-list');
  if(!el) return;
  if(list.length===0){ el.innerHTML = '<div class="empty"><div class="big">—</div>Tidak ada jadwal kontrol untuk hari ini.</div>'; return; }
  el.innerHTML = list.map(b=>{
    const p = getPatient(b.patientId), poli = getPoli(b.poliId);
    return '<div class="queue-list-item" style="cursor:default">'+
      '<div><div class="no">'+b.noAntrian+'</div><div class="nm">'+esc(p.nama)+' · '+esc(poli.nama)+'</div></div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span class="badge '+(b.jenisBayar==='BPJS'?'badge-slate':'badge-amber')+'">'+b.jenisBayar+'</span>'+
        '<button class="btn btn-success btn-sm" data-checkin="'+b.id+'">Check-in</button>'+
        '<button class="btn btn-outline btn-sm" data-noshow="'+b.id+'">Tidak Hadir</button>'+
      '</div></div>';
  }).join('');
  el.querySelectorAll('[data-checkin]').forEach(btn=> btn.addEventListener('click', ()=> doCheckIn(btn.dataset.checkin)));
  el.querySelectorAll('[data-noshow]').forEach(btn=> btn.addEventListener('click', ()=> markBookingNoShow(btn.dataset.noshow)));
}
function doCheckIn(bookingId){
  const booking = getBooking(bookingId);
  if(!booking || booking.status!=='terjadwal'){ showToast('Booking tidak valid atau sudah diproses', 'danger'); return; }
  const visit = {
    id: uid('KJ'), patientId: booking.patientId, tanggal: todayStr(), poliId: booking.poliId, dokterId:null,
    jenisBayar: booking.jenisBayar, noBpjs: booking.noBpjs||'', noAntrian: booking.noAntrian,
    keluhan:'Kontrol terjadwal ('+booking.sumber+')', status:'menunggu_poli', vital:null, diagnosis:'', catatan:'',
    labRequest:null, resepId:null, billing:{registrasi:BIAYA_REGISTRASI, konsultasi:0, obat:0, lab:0},
    bookingId: booking.id, createdAt: nowISO(), updatedAt: nowISO()
  };
  Store.data.visits.push(visit);
  booking.status = 'checked_in';
  booking.visitId = visit.id;
  booking.updatedAt = nowISO();
  pushNotification('queue','Check-in berhasil',booking.noAntrian+' — '+getPatient(booking.patientId).nama,booking.patientId);
  Store.save();
  logAudit('checkin', booking.noAntrian+' — '+esc(getPatient(booking.patientId).nama));
  showToast('Check-in berhasil — '+esc(getPatient(booking.patientId).nama)+' masuk antrian '+booking.noAntrian, 'success');
  const list = Store.data.bookings.filter(b=>b.tanggalKontrol===todayStr() && b.status==='terjadwal').sort((a,b)=>a.noAntrian.localeCompare(b.noAntrian));
  renderCheckinList(list);
  const heading = document.querySelector('#booking-tab-area .panel-head h2');
  if(heading) heading.textContent = 'Jadwal Kontrol Hari Ini ('+list.length+')';
}

let _scanStream = null, _scanRAF = null;
function openScanSheet(){
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet">'+
      '<div class="sheet-handle"></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 4px 10px"><h2>Scan QR Check-in</h2><button class="btn btn-ghost btn-icon" id="btn-close-scan">✕</button></div>'+
      '<div id="scan-status" class="alert alert-info">Mengaktifkan kamera…</div>'+
      '<video id="scan-video" autoplay playsinline muted style="width:100%;border-radius:16px;background:#000;max-height:300px;object-fit:cover"></video>'+
      '<div class="field" style="margin-top:14px"><label>Atau masukkan kode manual</label>'+
        '<div style="display:flex;gap:8px"><input type="text" id="scan-manual-code" placeholder="Kode check-in"><button type="button" class="btn btn-primary" id="btn-scan-manual-submit">Cek</button></div></div>'+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target.id==='modal-overlay') stopScanAndClose(); });
  document.getElementById('btn-close-scan').addEventListener('click', stopScanAndClose);
  document.getElementById('btn-scan-manual-submit').addEventListener('click', function(){
    attemptCheckInByCode(document.getElementById('scan-manual-code').value.trim());
  });
  startCameraScan();
}
async function startCameraScan(){
  const statusEl = document.getElementById('scan-status');
  if(!('BarcodeDetector' in window)){
    statusEl.className = 'alert alert-warning';
    statusEl.textContent = 'Kamera scan tidak didukung browser ini. Gunakan input kode manual di bawah.';
    const v = document.getElementById('scan-video'); if(v) v.classList.add('hidden');
    return;
  }
  try{
    _scanStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    const video = document.getElementById('scan-video');
    if(!video){ _scanStream.getTracks().forEach(t=>t.stop()); return; }
    video.srcObject = _scanStream;
    statusEl.textContent = 'Arahkan kamera ke QR pasien…';
    const detector = new BarcodeDetector({formats:['qr_code']});
    const loop = async function(){
      if(!document.getElementById('scan-video')) return;
      try{
        const codes = await detector.detect(video);
        if(codes.length){ const val = codes[0].rawValue; stopScanAndClose(); attemptCheckInByCode(val); return; }
      }catch(e){}
      _scanRAF = requestAnimationFrame(loop);
    };
    _scanRAF = requestAnimationFrame(loop);
  }catch(err){
    statusEl.className = 'alert alert-danger';
    statusEl.textContent = 'Tidak bisa mengakses kamera ('+err.message+'). Gunakan input kode manual.';
  }
}
function stopScanAndClose(){
  if(_scanRAF) cancelAnimationFrame(_scanRAF);
  if(_scanStream) _scanStream.getTracks().forEach(t=>t.stop());
  _scanStream = null; _scanRAF = null;
  closeModal();
}
function attemptCheckInByCode(code){
  if(!code){ showToast('Masukkan atau scan kode terlebih dahulu', 'danger'); return; }
  const booking = Store.data.bookings.find(b=>b.kodeCheckIn===code.toUpperCase().trim() && b.status==='terjadwal');
  if(!booking){ showToast('Kode tidak ditemukan atau sudah check-in', 'danger'); return; }
  if(booking.tanggalKontrol !== todayStr()){ showToast('Jadwal booking ini untuk '+formatTanggalIndo(booking.tanggalKontrol)+', bukan hari ini', 'danger'); return; }
  doCheckIn(booking.id);
}

/* ---------------- Pengingat H-1 ---------------- */
function renderBookingH1Tab(){
  const besok = dateOffset(1);
  const list = Store.data.bookings.filter(b=>b.tanggalKontrol===besok && b.status==='terjadwal').sort((a,b)=>a.noAntrian.localeCompare(b.noAntrian));
  const notifSupported = 'Notification' in window;
  const notifStatus = notifSupported ? Notification.permission : 'unsupported';
  document.getElementById('booking-tab-area').innerHTML =
    '<div class="alert alert-info">Daftar pasien dengan jadwal kontrol besok ('+formatTanggalIndo(besok)+'). Aplikasi statis ini tidak bisa mengirim notifikasi ke HP pasien saat aplikasi tertutup — gunakan tombol WhatsApp untuk mengingatkan langsung, atau aktifkan notifikasi di perangkat staf sebagai pengingat internal.</div>'+
    (notifSupported ?
      '<div style="margin-bottom:14px"><button class="btn btn-outline btn-sm" id="btn-enable-notif">🔔 '+(notifStatus==='granted'?'Notifikasi Aktif':'Aktifkan Notifikasi Pengingat')+'</button></div>' : '')+
    '<div class="panel"><div class="panel-head"><h2>Pengingat H-1 ('+list.length+')</h2></div><div class="panel-body" id="h1-list"></div></div>';
  const notifBtn = document.getElementById('btn-enable-notif');
  if(notifBtn) notifBtn.addEventListener('click', function(){
    if(Notification.permission==='granted'){ checkAndNotifyH1(true); return; }
    Notification.requestPermission().then(function(perm){
      if(perm==='granted'){ showToast('Notifikasi diaktifkan', 'success'); checkAndNotifyH1(true); renderBookingH1Tab(); }
      else showToast('Izin notifikasi ditolak browser', 'warning');
    });
  });
  renderH1List(list);
}
function renderH1List(list){
  const el = document.getElementById('h1-list');
  if(!el) return;
  if(list.length===0){ el.innerHTML = '<div class="empty"><div class="big">—</div>Tidak ada jadwal kontrol besok.</div>'; return; }
  el.innerHTML = list.map(b=>{
    const p = getPatient(b.patientId), poli = getPoli(b.poliId);
    const pesan = 'Halo '+p.nama+', mengingatkan jadwal kontrol Anda besok ('+formatTanggalIndo(b.tanggalKontrol)+') di '+poli.nama+' RSU Sehat Sentosa, nomor antrian '+b.noAntrian+'. Mohon datang tepat waktu. Terima kasih.';
    return '<div class="queue-list-item" style="cursor:default"><div><div class="no">'+b.noAntrian+'</div><div class="nm">'+esc(p.nama)+' · '+esc(poli.nama)+
      (b.reminded ? ' · <span style="color:var(--sage)">✓ sudah diingatkan</span>' : '')+'</div></div>'+
      '<a class="btn btn-success btn-sm" href="'+waLink(p.noHp, pesan)+'" target="_blank" rel="noopener" data-remind="'+b.id+'">📱 WhatsApp</a></div>';
  }).join('');
  el.querySelectorAll('[data-remind]').forEach(a=> a.addEventListener('click', function(){ tandaiDiingatkan(this.dataset.remind); }));
}
function tandaiDiingatkan(bookingId){
  const b = getBooking(bookingId);
  if(!b) return;
  b.reminded = true; b.remindedAt = nowISO();
  Store.save();
  logAudit('pengingat_h1', b.noAntrian+' — '+esc(getPatient(b.patientId).nama)+' diingatkan via WhatsApp');
  setTimeout(function(){ if(bookingTab==='h1') renderBookingH1Tab(); }, 400);
}
function checkAndNotifyH1(manual){
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  const besok = dateOffset(1);
  const belum = Store.data.bookings.filter(b=>b.tanggalKontrol===besok && b.status==='terjadwal' && !b.reminded);
  if(belum.length===0){ if(manual) showToast('Tidak ada pasien besok yang belum diingatkan', 'success'); return; }
  new Notification('Pengingat Kontrol H-1', {
    body: belum.length+' pasien punya jadwal kontrol besok dan belum diingatkan.',
    icon: 'icon-192.png'
  });
}

/* =================================================================
   MODULE: POLI
   ================================================================= */
let poliState = { poliId:null, activeVisitId:null, resepItems:[] };

function renderPoli(){
  setPageTitle('Poli');
  const u = Session.currentUser;
  poliState = { poliId: u.role==='dokter' ? u.poliId : (Store.data.poli[0] && Store.data.poli[0].id), activeVisitId:null, resepItems:[] };
  const poliSelector = u.role==='admin' ?
    '<div class="field" style="max-width:280px"><label>Pilih Poli</label><select id="poli-select">'+
      Store.data.poli.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+'</option>').join('')+'</select></div>' : '';

  document.getElementById('main-content').innerHTML =
    pageIntro(u.role==='dokter' ? 'Antrian dan pemeriksaan pasien untuk '+esc(getPoli(u.poliId).nama)+'.' : 'Pilih poli untuk melihat antrian dan memeriksa pasien.')+
    poliSelector+
    '<div class="split-2" id="poli-grid">'+
      '<div class="panel"><div class="panel-head"><h2 id="poli-queue-title">Antrian</h2></div><div class="panel-body" id="poli-queue-area"></div></div>'+
      '<div id="poli-exam-area"><div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div></div>'+
    '</div>'+
    '<div class="grid grid-2">'+
      '<div class="panel" id="poli-jadwal-panel"></div>'+
      '<div class="panel" id="poli-info-panel"></div>'+
    '</div>';

  if(u.role==='admin'){
    document.getElementById('poli-select').addEventListener('change', function(){
      poliState.poliId = this.value; poliState.activeVisitId=null;
      refreshPoliQueue();
      document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div>';
      renderJadwalKontrolPoli();
      renderInfoPraktikPoli();
    });
  }
  refreshPoliQueue();
  renderJadwalKontrolPoli();
  renderInfoPraktikPoli();
}

function renderJadwalKontrolPoli(){
  const panel = document.getElementById('poli-jadwal-panel');
  if(!panel) return;
  panel.innerHTML =
    '<div class="panel-head"><h2>📅 Jadwal Kontrol Poli Ini</h2></div><div class="panel-body">'+
    '<div class="field" style="max-width:220px"><label>Tanggal</label><input type="date" id="jkp-tanggal" value="'+todayStr()+'"></div>'+
    '<div id="jkp-summary"></div></div>';
  document.getElementById('jkp-tanggal').addEventListener('change', renderJadwalKontrolSummary);
  renderJadwalKontrolSummary();
}
function renderJadwalKontrolSummary(){
  const el = document.getElementById('jkp-summary');
  if(!el) return;
  const tglInput = document.getElementById('jkp-tanggal');
  const tgl = (tglInput && tglInput.value) || todayStr();
  const list = Store.data.bookings.filter(b=>b.poliId===poliState.poliId && b.tanggalKontrol===tgl);
  const bpjs = list.filter(b=>b.jenisBayar==='BPJS').length;
  const umum = list.filter(b=>b.jenisBayar==='Umum').length;
  const sudahCheckin = list.filter(b=>b.status==='checked_in').length;
  el.innerHTML =
    '<div class="grid grid-3" style="margin-bottom:12px">'+
      statCard('Total Booking', list.length, formatTanggalIndo(tgl))+
      statCard('BPJS / Umum', bpjs+' / '+umum, 'per jenis penjamin')+
      statCard('Sudah Check-in', sudahCheckin, 'dari '+list.length+' booking')+
    '</div>'+
    (list.length===0 ? '<div class="empty">Belum ada booking kontrol di tanggal ini.</div>' :
    '<div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Jenis</th><th>Status</th></tr></thead><tbody>'+
    list.sort((a,b)=>a.noAntrian.localeCompare(b.noAntrian)).map(b=>{
      const p = getPatient(b.patientId);
      return '<tr><td class="mono" style="font-weight:700">'+b.noAntrian+'</td><td>'+esc(p.nama)+'</td><td>'+esc(b.jenisBayar)+'</td><td>'+badgeStatus(b.status)+'</td></tr>';
    }).join('')+'</tbody></table></div>');
}

const POLI_MSG_BADGE = {normal:'badge-sage', delay:'badge-amber', cancel:'badge-brick'};
const POLI_MSG_LABEL = {normal:'Normal', delay:'Tertunda', cancel:'Tidak Praktik'};
function renderInfoPraktikPoli(){
  const panel = document.getElementById('poli-info-panel');
  if(!panel) return;
  const u = Session.currentUser;
  const canPost = u.role==='dokter' || u.role==='admin';
  panel.innerHTML =
    '<div class="panel-head"><h2>💬 Info Praktik</h2></div><div class="panel-body">'+
    (canPost ?
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
        '<select id="ip-tipe" style="max-width:170px"><option value="normal">✅ Normal</option><option value="delay">⏱ Tertunda</option><option value="cancel">✕ Tidak Praktik</option></select>'+
        '<input type="text" id="ip-pesan" placeholder="Tulis info untuk pasien…" style="flex:1;min-width:160px">'+
        '<button class="btn btn-primary" id="btn-kirim-info">Kirim</button>'+
      '</div>' : '')+
    '<div id="ip-feed"></div></div>';
  if(canPost){
    document.getElementById('btn-kirim-info').addEventListener('click', kirimInfoPraktik);
  }
  renderInfoPraktikFeed();
}
function kirimInfoPraktik(){
  const tipe = document.getElementById('ip-tipe').value;
  const pesan = document.getElementById('ip-pesan').value.trim();
  if(!pesan){ showToast('Tulis pesan terlebih dahulu', 'danger'); return; }
  const u = Session.currentUser;
  Store.data.poliMessages.unshift({
    id: uid('MSG'), poliId: poliState.poliId, authorName: u.nama, authorRole: roleLabel(u.role),
    tipe, pesan, createdAt: nowISO()
  });
  Store.save();
  logAudit('info_praktik', esc(getPoli(poliState.poliId).nama)+': '+pesan);
  document.getElementById('ip-pesan').value = '';
  renderInfoPraktikFeed();
  showToast('Info praktik terkirim — tampil di papan Cek Antrian', 'success');
}
function renderInfoPraktikFeed(){
  const el = document.getElementById('ip-feed');
  if(!el) return;
  const list = Store.data.poliMessages.filter(m=>m.poliId===poliState.poliId).slice(0,10);
  if(list.length===0){ el.innerHTML = '<div class="empty">Belum ada info praktik untuk poli ini.</div>'; return; }
  el.innerHTML = list.map(m=>
    '<div class="history-item"><div class="when">'+formatTanggalWaktu(m.createdAt)+' &middot; '+esc(m.authorName)+' ('+esc(m.authorRole)+') '+
    '<span class="badge '+POLI_MSG_BADGE[m.tipe]+'" style="margin-left:6px">'+POLI_MSG_LABEL[m.tipe]+'</span></div>'+
    '<div style="margin-top:3px">'+esc(m.pesan)+'</div></div>'
  ).join('');
}
function refreshPoliQueue(){
  const poli = getPoli(poliState.poliId);
  document.getElementById('poli-queue-title').textContent = 'Antrian — ' + poli.nama;
  const list = visitsToday().filter(v => v.poliId===poliState.poliId && ['menunggu_poli','diperiksa','menunggu_lab'].includes(v.status))
    .sort((a,b)=> (b.prioritas?1:0)-(a.prioritas?1:0) || new Date(a.createdAt)-new Date(b.createdAt));
  const area = document.getElementById('poli-queue-area');
  if(list.length===0){ area.innerHTML = '<div class="empty">Tidak ada antrian saat ini.</div>'; return; }
  area.innerHTML = list.map(v=>{
    const p = getPatient(v.patientId);
    const clickable = v.status !== 'menunggu_lab';
    const cls = (v.id===poliState.activeVisitId?'active':'') + (v.prioritas?' urgent':'');
    return '<div class="queue-list-item '+cls+'" '+(clickable?'data-visit="'+v.id+'"':'style="opacity:.6;cursor:default"')+'>'+
      '<div><div class="no">'+v.noAntrian+'</div><div class="nm">'+esc(p.nama)+'</div></div>'+
      '<div style="display:flex;align-items:center;gap:6px">'+badgeStatus(v.status)+
      '<button type="button" class="flag-btn'+(v.prioritas?' on':'')+'" data-flag="'+v.id+'" title="Tandai/batalkan prioritas">🚩</button></div></div>';
  }).join('');
  area.querySelectorAll('[data-visit]').forEach(el=> el.addEventListener('click', function(e){ if(e.target.closest('[data-flag]')) return; bukaPeriksa(el.dataset.visit); }));
  area.querySelectorAll('[data-flag]').forEach(btn=> btn.addEventListener('click', function(e){ e.stopPropagation(); toggleUrgent(this.dataset.flag); }));
}
function toggleUrgent(visitId){
  const v = getVisit(visitId);
  if(!v) return;
  v.prioritas = !v.prioritas;
  Store.save();
  logAudit(v.prioritas?'tandai_prioritas':'batal_prioritas', v.noAntrian+' — '+esc(getPatient(v.patientId).nama));
  refreshPoliQueue();
}
function bukaPeriksa(visitId){
  poliState.activeVisitId = visitId;
  const visit = getVisit(visitId);
  if(Session.currentUser.role==='dokter') visit.dokterId = Session.currentUser.id;
  if(visit.status==='menunggu_poli') visit.status='diperiksa';
  Store.save();
  refreshPoliQueue();
  poliState.resepItems = [];
  renderFormPeriksa(visit);
}
function historyItemHtml(v){
  const poli = getPoli(v.poliId);
  return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.createdAt)+' &middot; '+esc(poli.nama)+'</div>'+
    '<div><strong>'+esc(v.diagnosis||'-')+'</strong></div><div style="font-size:13px;color:var(--ink-soft)">'+esc(v.catatan||'')+'</div></div>';
}
function renderFormPeriksa(visit){
  const patient = getPatient(visit.patientId);
  const riwayat = patientVisits(patient.id).filter(v=>v.id!==visit.id && v.status==='selesai');
  const vital = visit.vital || {};
  const hasilLabBlock = (visit.labRequest && visit.labRequest.hasil) ?
    '<div class="alert alert-info"><div><strong>Hasil Laboratorium — '+esc(visit.labRequest.jenis)+'</strong><br>'+esc(visit.labRequest.hasil)+'</div></div>' : '';

  document.getElementById('poli-exam-area').innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Pemeriksaan Pasien</h2><div style="display:flex;gap:6px">'+(visit.prioritas?'<span class="badge badge-brick">🚩 Prioritas</span>':'')+badgeStatus(visit.status)+'</div></div><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">'+
        '<div><strong>'+esc(patient.nama)+'</strong> · '+(patient.jenisKelamin==='L'?'Laki-laki':'Perempuan')+' · '+calcUmur(patient.tglLahir)+' tahun<br>'+
        '<span style="color:var(--ink-soft);font-size:13px">No. RM '+patient.id+' &middot; No. Antrian '+visit.noAntrian+'</span></div>'+
        '<button class="btn btn-outline btn-sm" id="btn-lihat-riwayat">📁 Riwayat Rekam Medis</button>'+
      '</div>'+
      (patient.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(patient.alergi)+'</div>' : '')+
      (riwayat.length ? '<details style="margin-bottom:14px"><summary style="cursor:pointer;font-size:13.5px;color:var(--clinical);font-weight:600">Lihat '+riwayat.length+' kunjungan sebelumnya dari semua poli (diagnosis &amp; obat)</summary>'+
        '<div style="margin-top:10px">'+riwayat.map(v=>historyItemHtmlFull(v)).join('')+'</div></details>' : '')+
      hasilLabBlock+
      '<form id="form-periksa">'+
      '<div class="field"><label>Keluhan</label><textarea id="px-keluhan">'+esc(visit.keluhan)+'</textarea></div>'+
      '<div class="field-row3">'+
        '<div class="field"><label>Tekanan Darah</label><input type="text" id="px-td" placeholder="120/80" value="'+esc(vital.td||'')+'"></div>'+
        '<div class="field"><label>Nadi (x/menit)</label><input type="number" id="px-nadi" value="'+esc(vital.nadi||'')+'"></div>'+
        '<div class="field"><label>Suhu (°C)</label><input type="number" step="0.1" id="px-suhu" value="'+esc(vital.suhu||'')+'"></div>'+
      '</div>'+
      '<div class="field-row3">'+
        '<div class="field"><label>Respirasi (x/menit)</label><input type="number" id="px-rr" value="'+esc(vital.rr||'')+'"></div>'+
        '<div class="field"><label>Berat Badan (kg)</label><input type="number" id="px-bb" value="'+esc(vital.bb||'')+'"></div>'+
        '<div class="field"><label>Tinggi Badan (cm)</label><input type="number" id="px-tb" value="'+esc(vital.tb||'')+'"></div>'+
      '</div>'+
      '<div class="field"><label>Diagnosis</label><input type="text" id="px-diagnosis" value="'+esc(visit.diagnosis)+'" required></div>'+
      '<div class="field"><label>Catatan / Tindakan</label><textarea id="px-catatan">'+esc(visit.catatan)+'</textarea></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="px-rujuk-lab" '+(visit.labRequest?'checked disabled':'')+'><label for="px-rujuk-lab" style="margin:0">Rujuk ke Laboratorium / Penunjang</label></div>'+
      '<div class="field hidden" id="px-lab-jenis-wrap"><label>Jenis Pemeriksaan</label><input type="text" id="px-lab-jenis" placeholder="contoh: Darah Lengkap, Rontgen Thorax"></div>'+
      '<div id="px-resep-section">'+resepSectionHtml()+'</div>'+
      '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><button type="submit" class="btn btn-primary">Simpan &amp; Selesai Periksa</button>'+
      '<button type="button" class="btn btn-outline" id="btn-rujuk-ranap">🏥 Admisi Rawat Inap</button></div>'+
      '</form>'+
    '</div></div>';

  document.getElementById('btn-lihat-riwayat').addEventListener('click', ()=> openRiwayatModal(patient.id));
  document.getElementById('btn-rujuk-ranap').addEventListener('click', function(){ rujukRawatInap(visit.id); });
  const rujukChk = document.getElementById('px-rujuk-lab');
  const labWrap = document.getElementById('px-lab-jenis-wrap');
  if(visit.labRequest){ labWrap.classList.remove('hidden'); document.getElementById('px-lab-jenis').value = visit.labRequest.jenis; document.getElementById('px-lab-jenis').disabled = true; }
  rujukChk.addEventListener('change', function(){
    labWrap.classList.toggle('hidden', !this.checked);
    document.getElementById('px-resep-section').classList.toggle('hidden', this.checked);
  });
  bindResepEvents();
  document.getElementById('form-periksa').addEventListener('submit', function(e){ e.preventDefault(); selesaiPeriksa(visit.id); });
}
function resepSectionHtml(){
  return '<div class="field"><label>Resep Obat</label>'+
    '<div class="resep-row"><select id="rsp-obat">'+Store.data.medicines.map(m=>'<option value="'+m.id+'">'+esc(m.nama)+' (stok '+m.stok+')</option>').join('')+'</select>'+
    '<input type="number" id="rsp-jumlah" placeholder="Jml" min="1" value="1">'+
    '<input type="text" id="rsp-aturan" placeholder="Aturan pakai, contoh: 3x1 sesudah makan">'+
    '<button type="button" class="btn btn-outline btn-sm" id="btn-tambah-resep">+ Tambah</button></div>'+
    '<div id="resep-items-table">'+resepItemsTableHtml()+'</div></div>';
}
function resepItemsTableHtml(){
  if(poliState.resepItems.length===0) return '<div style="font-size:13px;color:var(--ink-soft)">Belum ada obat ditambahkan.</div>';
  return '<div class="table-wrap"><table><thead><tr><th>Obat</th><th>Jml</th><th>Aturan Pakai</th><th></th></tr></thead><tbody>'+
    poliState.resepItems.map((it,idx)=>'<tr><td>'+esc(it.nama)+'</td><td class="mono">'+it.jumlah+'</td><td>'+esc(it.aturanPakai)+'</td>'+
      '<td><button type="button" class="btn btn-ghost btn-sm" data-remove="'+idx+'">✕</button></td></tr>').join('')+'</tbody></table></div>';
}
function bindResepEvents(){
  const btn = document.getElementById('btn-tambah-resep');
  if(btn) btn.addEventListener('click', function(){
    const medId = document.getElementById('rsp-obat').value;
    const jumlah = parseInt(document.getElementById('rsp-jumlah').value)||0;
    const aturan = document.getElementById('rsp-aturan').value.trim();
    if(jumlah<=0 || !aturan){ showToast('Lengkapi jumlah dan aturan pakai obat', 'danger'); return; }
    const med = getMedicine(medId);
    poliState.resepItems.push({medicineId:medId, nama:med.nama, jumlah, hargaSatuan:med.harga, aturanPakai:aturan});
    document.getElementById('resep-items-table').innerHTML = resepItemsTableHtml();
    bindResepRemoveEvents();
    document.getElementById('rsp-jumlah').value=1; document.getElementById('rsp-aturan').value='';
  });
  bindResepRemoveEvents();
}
function bindResepRemoveEvents(){
  document.querySelectorAll('[data-remove]').forEach(b=>{
    b.addEventListener('click', function(){
      poliState.resepItems.splice(parseInt(this.dataset.remove),1);
      document.getElementById('resep-items-table').innerHTML = resepItemsTableHtml();
      bindResepRemoveEvents();
    });
  });
}
function openRiwayatModal(patientId){
  const patient = getPatient(patientId);
  const riwayat = patientVisits(patientId);
  openModal(
    '<div class="modal-head"><h2>Rekam Medis — '+esc(patient.nama)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><p style="font-size:13px;color:var(--ink-soft)">No. RM '+patient.id+' &middot; NIK '+maskNik(patient.nik)+' &middot; '+calcUmur(patient.tglLahir)+' tahun'+(patient.alergi?' &middot; Alergi: '+esc(patient.alergi):'')+'</p>'+
    (riwayat.length===0 ? '<div class="empty">Belum ada riwayat kunjungan.</div>' : riwayat.map(v=>historyItemHtmlFull(v)).join(''))+'</div>'
  );
}
function historyItemHtmlFull(v){
  const poli = getPoli(v.poliId);
  const resep = v.resepId ? getResep(v.resepId) : null;
  return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.createdAt)+' &middot; '+esc(poli.nama)+' &middot; '+badgeStatus(v.status)+'</div>'+
    '<div style="margin-top:4px"><strong>Diagnosis:</strong> '+esc(v.diagnosis||'-')+'</div>'+
    (v.catatan ? '<div><strong>Catatan:</strong> '+esc(v.catatan)+'</div>' : '')+
    (resep ? '<div><strong>Resep:</strong> '+resep.items.map(i=>esc(i.nama)+' ×'+i.jumlah).join(', ')+'</div>' : '')+'</div>';
}
function selesaiPeriksa(visitId){
  const visit = getVisit(visitId);
  visit.keluhan = document.getElementById('px-keluhan').value.trim();
  visit.vital = {
    td: document.getElementById('px-td').value.trim(), nadi: document.getElementById('px-nadi').value,
    suhu: document.getElementById('px-suhu').value, rr: document.getElementById('px-rr').value,
    bb: document.getElementById('px-bb').value, tb: document.getElementById('px-tb').value
  };
  visit.diagnosis = document.getElementById('px-diagnosis').value.trim();
  visit.catatan = document.getElementById('px-catatan').value.trim();
  visit.billing.konsultasi = getPoli(visit.poliId).biaya;

  const rujukLab = document.getElementById('px-rujuk-lab').checked && !visit.labRequest;
  if(rujukLab){
    const jenis = document.getElementById('px-lab-jenis').value.trim();
    if(!jenis){ showToast('Isi jenis pemeriksaan laboratorium', 'danger'); return; }
    visit.labRequest = {jenis, status:'menunggu', hasil:null};
    visit.billing.lab = BIAYA_LAB;
    visit.status = 'menunggu_lab';
    Store.save();
    logAudit('rujuk_lab', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' → '+jenis);
    showToast('Pasien dirujuk ke laboratorium', 'success');
  } else if(poliState.resepItems.length>0){
    const resep = {id:uid('RSP'), visitId:visit.id, items:[...poliState.resepItems], status:'menunggu', jenisLayanan:'rawat_jalan', createdAt:nowISO(), updatedAt:nowISO(), siapAt:null, diambilAt:null};
    Store.data.prescriptions.push(resep);
    visit.resepId = resep.id;
    visit.billing.obat = resep.items.reduce((s,it)=>s+it.jumlah*it.hargaSatuan,0);
    visit.status = 'menunggu_farmasi';
    Store.save();
    logAudit('selesai_periksa', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · Dx: '+esc(visit.diagnosis));
    showToast('Pemeriksaan selesai — resep dikirim ke farmasi', 'success');
  } else {
    visit.status = 'menunggu_bayar';
    Store.save();
    logAudit('selesai_periksa', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · Dx: '+esc(visit.diagnosis));
    showToast('Pemeriksaan selesai — pasien diarahkan ke kasir', 'success');
  }
  visit.updatedAt = nowISO();
  poliState.activeVisitId = null;
  poliState.resepItems = [];
  refreshPoliQueue();
  document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div>';
}

/* =================================================================
   MODULE: LABORATORIUM
   ================================================================= */
function renderLab(){
  setPageTitle('Laboratorium');
  const list = visitsToday().filter(v=>v.status==='menunggu_lab').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  document.getElementById('main-content').innerHTML =
    pageIntro('Daftar rujukan pemeriksaan penunjang dari seluruh poli. Hasil yang dikirim akan langsung tampil kembali ke dokter terkait.')+
    '<div class="panel"><div class="panel-head"><h2>Menunggu Pemeriksaan ('+list.length+')</h2></div><div class="panel-body" id="lab-list-area"></div></div>';
  renderLabList(list);
}
function renderLabList(list){
  const area = document.getElementById('lab-list-area');
  if(list.length===0){ area.innerHTML = '<div class="empty"><div class="big">✓</div>Tidak ada rujukan yang menunggu.</div>'; return; }
  area.innerHTML = list.map(v=>{
    const p = getPatient(v.patientId), poli = getPoli(v.poliId);
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
        '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
        '<span style="font-size:13px;color:var(--ink-soft)">Rujukan dari '+esc(poli.nama)+' &middot; '+esc(v.labRequest.jenis)+'</span></div>'+
        badgeStatus('menunggu_lab')+
      '</div>'+
      '<div class="field"><label>Hasil Pemeriksaan</label><textarea id="hasil-'+v.id+'" placeholder="Tuliskan hasil pemeriksaan..."></textarea></div>'+
      '<button class="btn btn-primary btn-sm" data-submit-lab="'+v.id+'">Kirim Hasil ke Dokter</button>'+
    '</div></div>';
  }).join('');
  area.querySelectorAll('[data-submit-lab]').forEach(btn=> btn.addEventListener('click', ()=> submitHasilLab(btn.dataset.submitLab)));
}
function submitHasilLab(visitId){
  const hasil = document.getElementById('hasil-'+visitId).value.trim();
  if(!hasil){ showToast('Isi hasil pemeriksaan terlebih dahulu', 'danger'); return; }
  const visit = getVisit(visitId);
  visit.labRequest.hasil = hasil;
  visit.labRequest.status = 'selesai';
  visit.status = 'diperiksa';
  visit.updatedAt = nowISO();
  Store.save();
  logAudit('hasil_lab', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast('Hasil lab terkirim ke dokter', 'success');
  renderLab();
}

/* =================================================================
   MODULE: FARMASI
   ================================================================= */
let farmasiTab = 'resep';
function renderFarmasi(){
  const ctx = routeContext(currentRoute()) || (Session.currentUser && Session.currentUser.unit) || 'rawat-jalan';
  setPageTitle('Farmasi ' + operationalContextLabel(ctx));
  farmasiTab = 'resep';
  document.getElementById('main-content').innerHTML =
    pageIntro(ctx==='rawat-inap' ? 'Kelola pemenuhan instruksi obat pasien rawat inap dan distribusi obat ke unit perawatan.' : ctx==='igd' ? 'Kelola resep dan kebutuhan obat IGD secara terpisah dari rawat jalan dan rawat inap.' : 'Kelola resep pasien rawat jalan/poli, siapkan obat, serahkan ke pasien, dan pantau waktu tunggu farmasi.')+
    '<div class="ops-alert" style="margin-bottom:12px"><strong>Unit Aktif:</strong> '+operationalContextLabel(ctx)+' — modul farmasi dipisahkan per layanan.</div>'+
    '<div class="tabs"><button class="tab active" data-ftab="resep">Antrian Resep</button>'+
    (ctx==='rawat-inap' ? '<button class="tab" data-ftab="ranap">Instruksi Obat Rawat Inap</button>' : '')+
    '<button class="tab" data-ftab="siap">Obat Siap Diambil</button>'+
    '<button class="tab" data-ftab="stok">Stok Obat</button></div>'+
    '<div id="farmasi-tab-area"></div>';
  document.querySelectorAll('[data-ftab]').forEach(t=> t.addEventListener('click', ()=> switchFarmasiTab(t.dataset.ftab)));
  renderFarmasiResepTab();
}
function switchFarmasiTab(tab){
  farmasiTab = tab;
  document.querySelectorAll('[data-ftab]').forEach(t=> t.classList.toggle('active', t.dataset.ftab===tab));
  if(tab==='resep') renderFarmasiResepTab();
  else if(tab==='ranap') renderFarmasiRanapTab();
  else if(tab==='siap') renderFarmasiSiapTab();
  else renderFarmasiStokTab();
}
function renderFarmasiResepTab(){
  const ctx = routeContext(currentRoute()) || 'rawat-jalan';
  const list = visitsToday().filter(v=>v.status==='menunggu_farmasi' && (ctx==='igd' ? v.unit==='igd' : ctx==='rawat-inap' ? false : (v.unit||'rawat-jalan')==='rawat-jalan')).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const area = document.getElementById('farmasi-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">✓</div>Tidak ada resep yang menunggu diracik.</div></div></div>'; return; }
  area.innerHTML = list.map(v=>{
    const p = getPatient(v.patientId), poli = getPoli(v.poliId), resep = getResep(v.resepId);
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
        '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
        '<span style="font-size:13px;color:var(--ink-soft)">Dari '+esc(poli.nama)+' &middot; No. Antrian '+v.noAntrian+'</span></div>'+badgeStatus('menunggu_farmasi')+
      '</div>'+
      '<div class="table-wrap"><table><thead><tr><th>Obat</th><th>Diminta</th><th>Stok Tersedia</th><th>Disiapkan</th><th>Aturan Pakai</th></tr></thead><tbody>'+
      resep.items.map((it,idx)=>{
        const med = getMedicine(it.medicineId), cukup = med.stok >= it.jumlah;
        return '<tr><td>'+esc(it.nama)+'</td><td class="mono">'+it.jumlah+'</td>'+
          '<td class="mono" style="color:'+(cukup?'var(--sage)':'var(--brick)')+';font-weight:700">'+med.stok+'</td>'+
          '<td><input type="number" min="0" max="'+med.stok+'" value="'+Math.min(it.jumlah,med.stok)+'" style="width:80px" id="siap-'+resep.id+'-'+idx+'"></td>'+
          '<td>'+esc(it.aturanPakai)+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      (resep.items.some(it=>getMedicine(it.medicineId).stok < it.jumlah) ? '<div class="alert alert-warning" style="margin-top:10px">⚠ Ada obat dengan stok tidak mencukupi. Jumlah "Disiapkan" otomatis dibatasi sesuai stok — sesuaikan bila perlu.</div>' : '')+
      '<button class="btn btn-primary btn-sm" style="margin-top:8px" data-siapkan="'+resep.id+'" data-visit="'+v.id+'">Siapkan Obat</button>'+
    '</div></div>';
  }).join('');
  area.querySelectorAll('[data-siapkan]').forEach(btn=> btn.addEventListener('click', ()=> siapkanObat(btn.dataset.siapkan, btn.dataset.visit)));
}
function siapkanObat(resepId, visitId){
  const resep = getResep(resepId), visit = getVisit(visitId);
  let totalObat = 0;
  resep.items.forEach((it,idx)=>{
    const input = document.getElementById('siap-'+resepId+'-'+idx);
    const jumlahSiap = Math.max(0, Math.min(parseInt(input.value)||0, getMedicine(it.medicineId).stok));
    getMedicine(it.medicineId).stok -= jumlahSiap;
    it.jumlahDisiapkan = jumlahSiap;
    totalObat += jumlahSiap * it.hargaSatuan;
  });
  resep.status = 'disiapkan';
  resep.siapAt = nowISO(); resep.updatedAt = resep.siapAt;
  visit.billing.obat = totalObat;
  visit.status = 'menunggu_bayar';
  visit.updatedAt = nowISO();
  Store.save();
  logAudit('obat_disiapkan', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast('Obat disiapkan — pasien diarahkan ke kasir', 'success');
  renderFarmasiResepTab();
}
function renderFarmasiRanapTab(){
  const list = Store.data.prescriptions.filter(r=>r.admissionId && r.status==='menunggu');
  const area = document.getElementById('farmasi-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">✓</div>Tidak ada instruksi obat rawat inap yang menunggu.</div></div></div>'; return; }
  area.innerHTML = list.map(function(resep){
    const a = Store.data.admissions.find(x=>x.id===resep.admissionId);
    const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), bed = Store.data.beds.find(x=>x.id===a.bedId);
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
      '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
      '<span style="font-size:13px;color:var(--ink-soft)">'+esc(ward.nama)+' Kamar '+bed.noKamar+bed.noBed+' · Rawat Inap</span></div>'+badgeStatus('menunggu_farmasi')+'</div>'+
      '<div class="table-wrap"><table><thead><tr><th>Obat</th><th>Diminta</th><th>Stok Tersedia</th><th>Disiapkan</th><th>Aturan Pakai</th></tr></thead><tbody>'+
      resep.items.map(function(it,idx){
        const med = getMedicine(it.medicineId), cukup = med.stok >= it.jumlah;
        return '<tr><td>'+esc(it.nama)+'</td><td class="mono">'+it.jumlah+'</td>'+
          '<td class="mono" style="color:'+(cukup?'var(--sage)':'var(--brick)')+';font-weight:700">'+med.stok+'</td>'+
          '<td><input type="number" min="0" max="'+med.stok+'" value="'+Math.min(it.jumlah,med.stok)+'" style="width:80px" id="siapr-'+resep.id+'-'+idx+'"></td>'+
          '<td>'+esc(it.aturanPakai)+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<button class="btn btn-primary btn-sm" style="margin-top:8px" data-siapkan-ranap="'+resep.id+'">Siapkan Obat</button>'+
    '</div></div>';
  }).join('');
  area.querySelectorAll('[data-siapkan-ranap]').forEach(function(btn){ btn.addEventListener('click', function(){ siapkanObatRanap(this.dataset.siapkanRanap); }); });
}
function siapkanObatRanap(resepId){
  const resep = getResep(resepId);
  const a = Store.data.admissions.find(x=>x.id===resep.admissionId);
  let total = 0;
  resep.items.forEach(function(it,idx){
    const input = document.getElementById('siapr-'+resepId+'-'+idx);
    const jumlahSiap = Math.max(0, Math.min(parseInt(input.value)||0, getMedicine(it.medicineId).stok));
    getMedicine(it.medicineId).stok -= jumlahSiap;
    it.jumlahDisiapkan = jumlahSiap;
    total += jumlahSiap*it.hargaSatuan;
  });
  resep.status = 'disiapkan'; resep.jenisLayanan='rawat_inap'; resep.siapAt=nowISO(); resep.updatedAt=resep.siapAt;
  a.billing.biayaObat = (a.billing.biayaObat||0) + total;
  a.updatedAt = nowISO();
  Store.save();
  logAudit('obat_ranap_disiapkan', esc(getPatient(a.patientId).nama)+' — '+formatRupiah(total));
  showToast('Obat rawat inap disiapkan, biaya masuk tagihan', 'success');
  renderFarmasiRanapTab();
}
function renderFarmasiSiapTab(){
  const ctx = routeContext(currentRoute()) || 'rawat-jalan';
  const list = visitsToday().filter(v=>v.status==='obat_siap' && (ctx==='igd' ? v.unit==='igd' : (v.unit||'rawat-jalan')===ctx)).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const area = document.getElementById('farmasi-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">—</div>Belum ada obat yang menunggu diambil.</div></div></div>'; return; }
  area.innerHTML = '<div class="panel"><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Poli</th><th></th></tr></thead><tbody>'+
    list.map(v=>{ const p = getPatient(v.patientId), poli = getPoli(v.poliId);
      return '<tr><td class="mono" style="font-weight:700">'+v.noAntrian+'</td><td>'+esc(p.nama)+'</td><td>'+esc(poli.nama)+'</td>'+
        '<td><button class="btn btn-success btn-sm" data-serahkan="'+v.id+'">Serahkan Obat</button></td></tr>'; }).join('')+
    '</tbody></table></div></div></div>';
  area.querySelectorAll('[data-serahkan]').forEach(btn=> btn.addEventListener('click', ()=> serahkanObat(btn.dataset.serahkan)));
}
function serahkanObat(visitId){
  const visit = getVisit(visitId);
  visit.status = 'selesai'; visit.updatedAt = nowISO();
  const resep=getResepByVisit(visitId); if(resep){ resep.diambilAt=visit.updatedAt; resep.updatedAt=visit.updatedAt; }
  Store.save();
  logAudit('obat_diserahkan', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast('Obat telah diserahkan ke pasien. Kunjungan selesai.', 'success');
  renderFarmasiSiapTab();
}
function renderFarmasiStokTab(){
  const area = document.getElementById('farmasi-tab-area');
  area.innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Tambah Obat Baru</h2></div><div class="panel-body">'+
      '<form id="form-obat-baru" class="field-row3">'+
        '<div class="field"><label>Nama Obat</label><input type="text" id="ob-nama" required></div>'+
        '<div class="field"><label>Kategori</label><input type="text" id="ob-kategori" required></div>'+
        '<div class="field"><label>Satuan</label><input type="text" id="ob-satuan" placeholder="Tablet/Kapsul/Botol" required></div>'+
        '<div class="field"><label>Harga (Rp)</label><input type="number" id="ob-harga" min="0" required></div>'+
        '<div class="field"><label>Stok Awal</label><input type="number" id="ob-stok" min="0" required></div>'+
        '<div class="field" style="display:flex;align-items:flex-end"><button type="submit" class="btn btn-primary btn-block">Tambah</button></div>'+
      '</form></div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Daftar Stok Obat</h2></div><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Kategori</th><th>Satuan</th><th>Harga</th><th>Stok</th><th></th></tr></thead><tbody>'+
      Store.data.medicines.map(m=>'<tr><td>'+esc(m.nama)+'</td><td>'+esc(m.kategori)+'</td><td>'+esc(m.satuan)+'</td><td class="mono">'+formatRupiah(m.harga)+'</td>'+
        '<td class="mono" style="font-weight:700;color:'+(m.stok<LOW_STOCK_THRESHOLD?'var(--brick)':'var(--ink)')+'">'+m.stok+'</td>'+
        '<td><button class="btn btn-outline btn-sm" data-restock="'+m.id+'">+ Stok</button></td></tr>').join('')+
    '</tbody></table></div></div></div>';
  document.getElementById('form-obat-baru').addEventListener('submit', function(e){
    e.preventDefault();
    const namaObat = document.getElementById('ob-nama').value.trim();
    Store.data.medicines.push({id: uid('OBT'), nama: namaObat, kategori: document.getElementById('ob-kategori').value.trim(),
      satuan: document.getElementById('ob-satuan').value.trim(), harga: parseInt(document.getElementById('ob-harga').value)||0, stok: parseInt(document.getElementById('ob-stok').value)||0});
    Store.save();
    logAudit('obat_baru', namaObat);
    showToast('Obat baru ditambahkan', 'success'); renderFarmasiStokTab();
  });
  area.querySelectorAll('[data-restock]').forEach(btn=>{
    btn.addEventListener('click', function(){
      const med = getMedicine(this.dataset.restock);
      const jumlah = prompt('Tambah stok untuk "'+med.nama+'" (stok saat ini: '+med.stok+'). Masukkan jumlah tambahan:');
      const n = parseInt(jumlah);
      if(jumlah!==null && !isNaN(n) && n>0){ med.stok += n; Store.save(); showToast('Stok diperbarui', 'success'); renderFarmasiStokTab(); }
    });
  });
}

/* =================================================================
   MODULE: KASIR
   ================================================================= */
let kasirTab = 'bayar';
function renderKasir(){
  const ctx = routeContext(currentRoute()) || (Session.currentUser && Session.currentUser.unit) || 'rawat-jalan';
  setPageTitle('Kasir ' + operationalContextLabel(ctx));
  kasirTab = 'bayar';
  document.getElementById('main-content').innerHTML =
    pageIntro(ctx==='rawat-inap' ? 'Kelola tagihan dan pembayaran pasien rawat inap.' : ctx==='igd' ? 'Kelola pembayaran layanan IGD secara terpisah.' : 'Kelola pembayaran pasien rawat jalan/poli secara terpisah.')+
    '<div class="ops-alert" style="margin-bottom:12px"><strong>Unit Aktif:</strong> '+operationalContextLabel(ctx)+' — modul kasir dipisahkan per layanan.</div>'+
    '<div class="tabs"><button class="tab active" data-ktab="bayar">Pembayaran '+(ctx==='rawat-inap'?'Rawat Inap':ctx==='igd'?'IGD':'Rawat Jalan')+'</button>'+
    (ctx==='rawat-inap' ? '<button class="tab" data-ktab="ranap">Tagihan Rawat Inap</button>' : '')+
    '<button class="tab" data-ktab="riwayat">Riwayat Transaksi</button></div>'+
    '<div id="kasir-tab-area"></div>';
  document.querySelectorAll('[data-ktab]').forEach(t=> t.addEventListener('click', ()=> switchKasirTab(t.dataset.ktab)));
  renderKasirBayarTab();
}
function switchKasirTab(tab){
  kasirTab = tab;
  document.querySelectorAll('[data-ktab]').forEach(t=> t.classList.toggle('active', t.dataset.ktab===tab));
  if(tab==='bayar') renderKasirBayarTab();
  else if(tab==='ranap') renderKasirRanapTab();
  else renderKasirRiwayatTab();
}
function computeBilling(visit){
  const registrasi = visit.billing.registrasi||0, konsultasi = visit.billing.konsultasi||0, obat = visit.billing.obat||0, lab = visit.billing.lab||0;
  const subtotal = registrasi + konsultasi + obat + lab;
  let tanggungan = 0;
  if(visit.jenisBayar==='BPJS') tanggungan = subtotal;
  else if(visit.jenisBayar==='Asuransi') tanggungan = Math.round(subtotal*0.8);
  return {registrasi, konsultasi, obat, lab, subtotal, tanggungan, totalBayar: subtotal - tanggungan};
}
function renderKasirBayarTab(){
  const ctx = routeContext(currentRoute()) || 'rawat-jalan';
  const list = visitsToday().filter(v=>v.status==='menunggu_bayar' && (ctx==='igd' ? v.unit==='igd' : (v.unit||'rawat-jalan')==='rawat-jalan')).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const area = document.getElementById('kasir-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">✓</div>Tidak ada tagihan yang menunggu.</div></div></div>'; return; }
  area.innerHTML = list.map(v=>{
    const p = getPatient(v.patientId), poli = getPoli(v.poliId), b = computeBilling(v);
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
        '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
        '<span style="font-size:13px;color:var(--ink-soft)">'+esc(poli.nama)+' &middot; No. Antrian '+v.noAntrian+' &middot; '+esc(v.jenisBayar)+'</span></div>'+
        '<div class="val mono" style="font-size:20px">'+formatRupiah(b.totalBayar)+'</div>'+
      '</div><button class="btn btn-primary btn-sm" data-bayar="'+v.id+'">Buka Rincian &amp; Proses Bayar</button></div></div>';
  }).join('');
  area.querySelectorAll('[data-bayar]').forEach(btn=> btn.addEventListener('click', ()=> openBayarModal(btn.dataset.bayar)));
}
function openBayarModal(visitId){
  const v = getVisit(visitId), p = getPatient(v.patientId), poli = getPoli(v.poliId), b = computeBilling(v);
  const rincianRows = [['Biaya Registrasi', b.registrasi], ['Konsultasi '+poli.nama, b.konsultasi]];
  if(b.obat) rincianRows.push(['Obat / Farmasi', b.obat]);
  if(b.lab) rincianRows.push(['Pemeriksaan Laboratorium', b.lab]);
  const isBpjsFull = v.jenisBayar==='BPJS';
  openModal(
    '<div class="modal-head"><h2>Rincian Pembayaran</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-soft)">'+esc(p.nama)+' &middot; No. RM '+p.id+' &middot; '+esc(v.jenisBayar)+'</p>'+
    '<div class="table-wrap"><table>'+
      rincianRows.map(r=>'<tr><td>'+r[0]+'</td><td class="mono" style="text-align:right">'+formatRupiah(r[1])+'</td></tr>').join('')+
      '<tr><td><strong>Subtotal</strong></td><td class="mono" style="text-align:right"><strong>'+formatRupiah(b.subtotal)+'</strong></td></tr>'+
      (b.tanggungan>0 ? '<tr><td>Ditanggung '+esc(v.jenisBayar)+'</td><td class="mono" style="text-align:right;color:var(--sage)">- '+formatRupiah(b.tanggungan)+'</td></tr>' : '')+
      '<tr><td><strong>Total Dibayar Pasien</strong></td><td class="mono" style="text-align:right;font-size:18px"><strong>'+formatRupiah(b.totalBayar)+'</strong></td></tr></table></div>'+
    (v.jenisBayar==='Asuransi' ? '<p class="hint" style="margin-top:8px">*Simulasi tanggungan asuransi 80% — sesuaikan dengan ketentuan polis masing-masing penjamin untuk kebutuhan produksi.</p>' : '')+
    (isBpjsFull ?
      '<button class="btn btn-success btn-block" style="margin-top:14px" id="btn-proses-bayar" data-metode="BPJS">Verifikasi &amp; Selesaikan (Ditanggung BPJS)</button>' :
      '<div class="field" style="margin-top:14px"><label>Metode Pembayaran</label><select id="metode-bayar"><option>Tunai</option><option>Debit</option><option>QRIS</option></select></div>'+
      '<button class="btn btn-primary btn-block" id="btn-proses-bayar">Proses Pembayaran</button>')+
    '</div>'
  );
  document.getElementById('btn-proses-bayar').addEventListener('click', function(){
    const metode = this.dataset.metode || document.getElementById('metode-bayar').value;
    prosesBayar(visitId, metode, rincianRows, b.totalBayar);
  });
}
function prosesBayar(visitId, metode, rincianRows, total){
  const visit = getVisit(visitId);
  const trx = {id:uid('TRX'), visitId, rincian: rincianRows.map(r=>({label:r[0], jumlah:r[1]})), total, metode, createdAt: nowISO()};
  Store.data.transactions.push(trx);
  visit.status = visit.resepId ? 'obat_siap' : 'selesai';
  visit.updatedAt = nowISO();
  Store.save();
  logAudit('pembayaran', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · '+formatRupiah(total)+' · '+metode);
  closeModal();
  showToast('Pembayaran berhasil diproses', 'success');
  renderKasirBayarTab();
  openInvoiceModal(trx.id);
}
function renderKasirRanapTab(){
  const ctx = routeContext(currentRoute()) || 'rawat-inap';
  const list = ctx==='rawat-inap' ? Store.data.admissions.filter(a=> a.status!=='dirawat' && a.billing.statusBayar==='belum_bayar') : [];
  const area = document.getElementById('kasir-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">✓</div>Tidak ada tagihan rawat inap yang menunggu.</div></div></div>'; return; }
  area.innerHTML = list.map(function(a){
    const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), b = computeBillingRanap(a);
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
      '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
      '<span style="font-size:13px;color:var(--ink-soft)">'+esc(ward.nama)+' · '+b.hari+' hari · '+esc(a.jenisBayar)+'</span></div>'+
      '<div class="val mono" style="font-size:20px">'+formatRupiah(b.totalBayar)+'</div></div>'+
      '<button class="btn btn-primary btn-sm" data-bayar-ranap="'+a.id+'">Buka Rincian &amp; Proses Bayar</button></div></div>';
  }).join('');
  area.querySelectorAll('[data-bayar-ranap]').forEach(function(btn){ btn.addEventListener('click', function(){ openBayarRanapModal(this.dataset.bayarRanap); }); });
}
function openBayarRanapModal(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), b = computeBillingRanap(a);
  const rincianRows = [['Biaya Kamar ('+ward.nama+', '+b.hari+' hari)', b.biayaKamar]];
  if(b.biayaObat) rincianRows.push(['Obat / Farmasi', b.biayaObat]);
  if(b.biayaTindakan) rincianRows.push(['Tindakan', b.biayaTindakan]);
  const isBpjsFull = a.jenisBayar==='BPJS';
  openModal(
    '<div class="modal-head"><h2>Rincian Tagihan Rawat Inap</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-soft)">'+esc(p.nama)+' &middot; No. RM '+p.id+' &middot; '+esc(a.jenisBayar)+'</p>'+
    '<div class="table-wrap"><table>'+
      rincianRows.map(r=>'<tr><td>'+r[0]+'</td><td class="mono" style="text-align:right">'+formatRupiah(r[1])+'</td></tr>').join('')+
      '<tr><td><strong>Subtotal</strong></td><td class="mono" style="text-align:right"><strong>'+formatRupiah(b.subtotal)+'</strong></td></tr>'+
      (b.tanggungan>0 ? '<tr><td>Ditanggung '+esc(a.jenisBayar)+'</td><td class="mono" style="text-align:right;color:var(--sage)">- '+formatRupiah(b.tanggungan)+'</td></tr>' : '')+
      '<tr><td><strong>Total Dibayar Pasien</strong></td><td class="mono" style="text-align:right;font-size:18px"><strong>'+formatRupiah(b.totalBayar)+'</strong></td></tr></table></div>'+
    (a.jenisBayar==='Asuransi' ? '<p class="hint" style="margin-top:8px">*Simulasi tanggungan asuransi 80%.</p>' : '')+
    (isBpjsFull ?
      '<button class="btn btn-success btn-block" style="margin-top:14px" id="btn-proses-bayar-ranap" data-metode="BPJS">Verifikasi &amp; Selesaikan (Ditanggung BPJS)</button>' :
      '<div class="field" style="margin-top:14px"><label>Metode Pembayaran</label><select id="metode-bayar-ranap"><option>Tunai</option><option>Debit</option><option>QRIS</option></select></div>'+
      '<button class="btn btn-primary btn-block" id="btn-proses-bayar-ranap">Proses Pembayaran</button>')+
    '</div>'
  );
  document.getElementById('btn-proses-bayar-ranap').addEventListener('click', function(){
    const metode = this.dataset.metode || document.getElementById('metode-bayar-ranap').value;
    prosesBayarRanap(admissionId, metode, rincianRows, b.totalBayar);
  });
}
function prosesBayarRanap(admissionId, metode, rincianRows, total){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const trx = {id:uid('TRX'), visitId:null, admissionId, rincian: rincianRows.map(r=>({label:r[0], jumlah:r[1]})), total, metode, createdAt: nowISO()};
  Store.data.transactions.push(trx);
  a.billing.statusBayar = 'lunas';
  a.billing.metodeBayar = metode;
  a.updatedAt = nowISO();
  Store.save();
  logAudit('pembayaran_ranap', esc(getPatient(a.patientId).nama)+' · '+formatRupiah(total)+' · '+metode);
  closeModal();
  showToast('Pembayaran rawat inap berhasil diproses', 'success');
  renderKasirRanapTab();
  openInvoiceModal(trx.id);
}
function openInvoiceModal(trxId){
  const trx = Store.data.transactions.find(t=>t.id===trxId);
  const p = trx.visitId ? getPatient(getVisit(trx.visitId).patientId) : getPatient(Store.data.admissions.find(a=>a.id===trx.admissionId).patientId);
  const bodyHtml = '<div id="invoice-content"><h3 style="text-align:center">RSU SEHAT SENTOSA</h3><p style="text-align:center;color:var(--ink-soft);font-size:13px">Kwitansi Pembayaran'+(trx.admissionId?' — Rawat Inap':'')+'</p><hr>'+
    '<p>No. Transaksi: <span class="mono">'+trx.id+'</span><br>Pasien: '+esc(p.nama)+' ('+p.id+')<br>Tanggal: '+formatTanggalWaktu(trx.createdAt)+'<br>Metode: '+esc(trx.metode)+'</p>'+
    '<div class="table-wrap"><table>'+trx.rincian.map(r=>'<tr><td>'+r.label+'</td><td class="mono" style="text-align:right">'+formatRupiah(r.jumlah)+'</td></tr>').join('')+
    '<tr><td><strong>Total</strong></td><td class="mono" style="text-align:right"><strong>'+formatRupiah(trx.total)+'</strong></td></tr></table></div></div>';
  openModal('<div class="modal-head"><h2>Kwitansi</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body">'+bodyHtml+'<div style="margin-top:14px;display:flex;gap:8px"><button class="btn btn-outline" id="btn-cetak-invoice">🖶 Cetak</button><button class="btn btn-primary" onclick="closeModal()">Selesai</button></div></div>');
  document.getElementById('btn-cetak-invoice').addEventListener('click', function(){ printArea(document.getElementById('invoice-content').innerHTML); });
}
function renderKasirRiwayatTab(){
  const today = todayStr();
  const trxToday = Store.data.transactions.filter(t=>todayStr(new Date(t.createdAt))===today).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const total = trxToday.reduce((s,t)=>s+t.total,0);
  const area = document.getElementById('kasir-tab-area');
  area.innerHTML = '<div class="stat" style="max-width:260px;margin-bottom:14px"><div class="lbl">Total Pendapatan Hari Ini</div><div class="val">'+formatRupiah(total)+'</div><div class="sub">'+trxToday.length+' transaksi</div></div>'+
    '<div class="panel"><div class="panel-body">'+(trxToday.length===0 ? '<div class="empty">Belum ada transaksi hari ini.</div>' :
    '<div class="table-wrap"><table><thead><tr><th>No. Transaksi</th><th>Pasien</th><th>Jenis</th><th>Jam</th><th>Metode</th><th>Total</th><th></th></tr></thead><tbody>'+
    trxToday.map(t=>{
      const p = t.visitId ? getPatient(getVisit(t.visitId).patientId) : getPatient(Store.data.admissions.find(a=>a.id===t.admissionId).patientId);
      return '<tr><td class="mono">'+t.id+'</td><td>'+esc(p.nama)+'</td><td>'+(t.admissionId?'🏨 Rawat Inap':'🩺 Rawat Jalan')+'</td><td class="mono">'+formatJam(t.createdAt)+'</td><td>'+esc(t.metode)+'</td>'+
        '<td class="mono">'+formatRupiah(t.total)+'</td><td><button class="btn btn-ghost btn-sm" data-lihat-invoice="'+t.id+'">Lihat</button></td></tr>'; }).join('')+
    '</tbody></table></div>')+'</div></div>';
  area.querySelectorAll('[data-lihat-invoice]').forEach(btn=> btn.addEventListener('click', ()=> openInvoiceModal(btn.dataset.lihatInvoice)));
}

/* =================================================================
   MODULE: RAWAT INAP (admisi, bangsal/bed, CPPT, vital+NEWS2, instruksi, pulang)
   ================================================================= */
let ranapTab = 'pasien';
let ranapActiveAdmission = null;
let ranapDetailTab = 'cppt';
let admisiBaruState = {patientId:null, visitId:null};

function renderRanap(){
  setPageTitle('Rawat Inap');
  ranapTab = 'pasien'; ranapActiveAdmission = null;
  document.getElementById('main-content').innerHTML =
    pageIntro('Admisi, CPPT terintegrasi lintas profesi, tanda vital dengan skor kegawatan NEWS2, instruksi dokter, hingga resume medis pemulangan.')+
    '<div class="tabs"><button class="tab active" data-rtab="pasien">Pasien Dirawat</button>'+
    '<button class="tab" data-rtab="bangsal">Bangsal &amp; Tempat Tidur</button></div>'+
    '<div id="ranap-tab-area"></div>';
  document.querySelectorAll('[data-rtab]').forEach(t=> t.addEventListener('click', ()=> switchRanapTab(t.dataset.rtab)));
  renderRanapPasienTab();
}
function switchRanapTab(tab){
  ranapTab = tab; ranapActiveAdmission = null;
  document.querySelectorAll('[data-rtab]').forEach(t=> t.classList.toggle('active', t.dataset.rtab===tab));
  if(tab==='pasien') renderRanapPasienTab(); else renderRanapBangsalTab();
}
function renderRanapPasienTab(){
  const area = document.getElementById('ranap-tab-area');
  const aktif = Store.data.admissions.filter(a=>a.status==='dirawat').sort((a,b)=> new Date(a.tanggalMasuk)-new Date(b.tanggalMasuk));
  area.innerHTML =
    '<div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" id="btn-admisi-baru">+ Admisi Baru</button></div>'+
    (aktif.length===0 ? '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🏨</div>Tidak ada pasien dirawat saat ini.</div></div></div>' :
    aktif.map(a=>ranapCardHtml(a)).join(''));
  document.getElementById('btn-admisi-baru').addEventListener('click', function(){ admisiBaruState={patientId:null,visitId:null}; openAdmisiBaruSheet(); });
  area.querySelectorAll('[data-buka-admisi]').forEach(el=> el.addEventListener('click', function(){ bukaAdmisi(this.dataset.bukaAdmisi); }));
}
function ranapCardHtml(a){
  const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), bed = Store.data.beds.find(b=>b.id===a.bedId);
  const lastVital = a.vitalLog[a.vitalLog.length-1];
  const band = lastVital ? bandNEWS2(lastVital.news2) : null;
  const news2Badge = lastVital ? '<span class="badge '+band.cls+'">NEWS2: '+lastVital.news2+' — '+band.label+'</span>' : '<span class="badge badge-slate">Belum ada vital</span>';
  const hari = Math.max(1, Math.ceil((Date.now()-new Date(a.tanggalMasuk))/86400000));
  return '<div class="panel tr-click" data-buka-admisi="'+a.id+'" style="cursor:pointer"><div class="panel-body">'+
    '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'+
    '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
    '<span style="font-size:13px;color:var(--ink-soft)">'+esc(ward.nama)+' · Kamar '+bed.noKamar+bed.noBed+' · Hari ke-'+hari+' · DPJP: '+esc(getUserById(a.dpjpUserId).nama)+'</span></div>'+
    news2Badge+'</div>'+
    '<div style="margin-top:6px;font-size:13.5px">'+esc(a.diagnosisMasuk)+'</div></div></div>';
}
function renderRanapBangsalTab(){
  const area = document.getElementById('ranap-tab-area');
  area.innerHTML = Store.data.wards.map(function(w){
    const bedsInWard = Store.data.beds.filter(b=>b.wardId===w.id);
    const terisi = bedsInWard.filter(b=>b.status==='terisi').length;
    return '<div class="panel"><div class="panel-head"><h2>'+esc(w.nama)+'</h2><span class="badge badge-slate">'+terisi+'/'+bedsInWard.length+' terisi</span></div>'+
      '<div class="panel-body"><p class="hint" style="margin-bottom:10px">Tarif kamar: '+formatRupiah(w.tarifPerHari)+' / hari</p>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      bedsInWard.map(function(b){
        const adm = Store.data.admissions.find(a=>a.bedId===b.id && a.status==='dirawat');
        const cls = b.status==='terisi' ? 'badge-brick' : 'badge-sage';
        const title = adm ? esc(getPatient(adm.patientId).nama) : 'Kosong';
        return '<span class="badge '+cls+'" title="'+title+'">'+b.noKamar+b.noBed+(adm?' · '+esc(getPatient(adm.patientId).nama.split(' ')[0]):'')+'</span>';
      }).join('')+'</div></div></div>';
  }).join('');
}

function bukaAdmisi(admissionId){
  ranapActiveAdmission = admissionId;
  ranapDetailTab = 'cppt';
  renderAdmisiDetail();
}
function renderAdmisiDetail(){
  const a = Store.data.admissions.find(x=>x.id===ranapActiveAdmission);
  if(!a) return;
  const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), bed = Store.data.beds.find(b=>b.id===a.bedId);
  const hari = Math.max(1, Math.ceil((Date.now()-new Date(a.tanggalMasuk))/86400000));
  const area = document.getElementById('ranap-tab-area');
  area.innerHTML =
    '<button class="btn btn-ghost btn-sm" id="btn-kembali-ranap" style="margin-bottom:10px">← Kembali ke daftar pasien</button>'+
    '<div class="panel"><div class="panel-body">'+
    '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">'+
    '<div><h2>'+esc(p.nama)+'</h2><span style="font-size:13px;color:var(--ink-soft)">No. RM '+p.id+' · '+calcUmur(p.tglLahir)+' th · '+esc(ward.nama)+' Kamar '+bed.noKamar+bed.noBed+' · Hari ke-'+hari+'</span></div>'+
    '<div>'+badgeStatus(a.status)+'</div></div>'+
    (p.alergi ? '<div class="allergy-flag" style="margin-top:10px">⚠ Alergi: '+esc(p.alergi)+'</div>' : '')+
    '<p style="margin-top:8px"><strong>Diagnosis masuk:</strong> '+esc(a.diagnosisMasuk)+' &middot; <strong>DPJP:</strong> '+esc(getUserById(a.dpjpUserId).nama)+' &middot; '+esc(a.jenisBayar)+'</p>'+
    '</div></div>'+
    '<div class="tabs"><button class="tab '+(ranapDetailTab==='cppt'?'active':'')+'" data-dtab="cppt">CPPT</button>'+
    '<button class="tab '+(ranapDetailTab==='vital'?'active':'')+'" data-dtab="vital">Vital &amp; NEWS2</button>'+
    '<button class="tab '+(ranapDetailTab==='order'?'active':'')+'" data-dtab="order">Instruksi</button>'+
    '<button class="tab '+(ranapDetailTab==='pulang'?'active':'')+'" data-dtab="pulang">'+(a.status==='dirawat'?'Rencana Pulang':'Resume Medis')+'</button></div>'+
    '<div id="ranap-detail-body"></div>';
  document.getElementById('btn-kembali-ranap').addEventListener('click', function(){ ranapActiveAdmission=null; renderRanapPasienTab(); });
  area.querySelectorAll('[data-dtab]').forEach(t=> t.addEventListener('click', function(){ ranapDetailTab=this.dataset.dtab; renderAdmisiDetail(); }));
  renderRanapDetailBody(a);
}
function renderRanapDetailBody(a){
  const el = document.getElementById('ranap-detail-body');
  if(!el) return;
  if(ranapDetailTab==='cppt') el.innerHTML = ranapCpptTabHtml(a);
  else if(ranapDetailTab==='vital') el.innerHTML = ranapVitalTabHtml(a);
  else if(ranapDetailTab==='order') el.innerHTML = ranapOrderTabHtml(a);
  else el.innerHTML = ranapPulangTabHtml(a);
  bindRanapDetailEvents(a);
}
function bindRanapDetailEvents(a){
  const c = document.getElementById('btn-tambah-cppt'); if(c) c.addEventListener('click', function(){ submitCppt(a.id); });
  const v = document.getElementById('btn-tambah-vital'); if(v) v.addEventListener('click', function(){ submitVital(a.id); });
  const o = document.getElementById('btn-tambah-order'); if(o) o.addEventListener('click', function(){ submitOrder(a.id); });
  const pl = document.getElementById('btn-selesaikan-pulang'); if(pl) pl.addEventListener('click', function(){ selesaikanPulang(a.id); });
  const ck = document.getElementById('btn-cetak-resume'); if(ck) ck.addEventListener('click', function(){ cetakResumeMedis(a.id); });
  const jenisSel = document.getElementById('ord-jenis');
  if(jenisSel){
    jenisSel.addEventListener('change', function(){
      const isObat = this.value==='obat';
      document.getElementById('ord-obat-fields').classList.toggle('hidden', !isObat);
      document.getElementById('ord-lain-fields').classList.toggle('hidden', isObat);
      const biayaWrap = document.getElementById('ord-biaya-wrap');
      if(biayaWrap) biayaWrap.classList.toggle('hidden', this.value!=='tindakan');
    });
  }
}

function ranapCpptTabHtml(a){
  const canWrite = a.status==='dirawat';
  return (canWrite ? '<div class="panel"><div class="panel-head"><h2>Tambah Catatan CPPT</h2></div><div class="panel-body">'+
    '<div class="field"><label>Subjektif (keluhan pasien)</label><textarea id="cppt-s" placeholder="Keluhan yang disampaikan pasien…"></textarea></div>'+
    '<div class="field"><label>Objektif (pemeriksaan)</label><textarea id="cppt-o" placeholder="Hasil pemeriksaan fisik/penunjang…"></textarea></div>'+
    '<div class="field"><label>Asesmen</label><textarea id="cppt-a" placeholder="Penilaian/diagnosis kerja…"></textarea></div>'+
    '<div class="field"><label>Planning</label><textarea id="cppt-p" placeholder="Rencana tindak lanjut…"></textarea></div>'+
    '<button class="btn btn-primary btn-sm" id="btn-tambah-cppt">Simpan Catatan</button></div></div>' : '')+
    '<div class="panel"><div class="panel-head"><h2>Riwayat CPPT</h2></div><div class="panel-body">'+
    (a.cppt.length===0 ? '<div class="empty">Belum ada catatan.</div>' :
    [...a.cppt].reverse().map(function(c){
      return '<div class="history-item"><div class="when">'+formatTanggalWaktu(c.waktu)+' &middot; '+esc(c.profesi)+' — '+esc(c.penulisNama)+'</div>'+
      '<div style="margin-top:4px;font-size:13.5px"><strong>S:</strong> '+esc(c.subjektif||'-')+'<br><strong>O:</strong> '+esc(c.objektif||'-')+'<br><strong>A:</strong> '+esc(c.asesmen||'-')+'<br><strong>P:</strong> '+esc(c.planning||'-')+'</div></div>';
    }).join(''))+'</div></div>';
}
function ranapVitalTabHtml(a){
  const canWrite = a.status==='dirawat';
  return (canWrite ? '<div class="panel"><div class="panel-head"><h2>Catat Tanda Vital</h2></div><div class="panel-body">'+
    '<div class="field-row3"><div class="field"><label>Respirasi (x/menit)</label><input type="number" id="vs-rr"></div>'+
    '<div class="field"><label>SpO2 (%)</label><input type="number" id="vs-spo2"></div>'+
    '<div class="field"><label>Suhu (°C)</label><input type="number" step="0.1" id="vs-suhu"></div></div>'+
    '<div class="field-row3"><div class="field"><label>Tekanan Darah Sistolik</label><input type="number" id="vs-sistolik"></div>'+
    '<div class="field"><label>Nadi (x/menit)</label><input type="number" id="vs-nadi"></div>'+
    '<div class="field"><label>Kesadaran</label><select id="vs-kesadaran"><option value="alert">Alert (sadar penuh)</option><option value="cvpu">Menurun (Confusion/Voice/Pain/Unresponsive)</option></select></div></div>'+
    '<div class="field checkbox-row"><input type="checkbox" id="vs-oksigen"><label for="vs-oksigen" style="margin:0">Menggunakan oksigen tambahan</label></div>'+
    '<button class="btn btn-primary btn-sm" id="btn-tambah-vital">Simpan &amp; Hitung NEWS2</button></div></div>' : '')+
    '<div class="panel"><div class="panel-head"><h2>Riwayat Tanda Vital &amp; Skor NEWS2</h2></div><div class="panel-body">'+
    (a.vitalLog.length===0 ? '<div class="empty">Belum ada catatan tanda vital.</div>' :
    '<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>TD/Nadi</th><th>RR/SpO2</th><th>Suhu</th><th>NEWS2</th><th>Dicatat oleh</th></tr></thead><tbody>'+
    [...a.vitalLog].reverse().map(function(v){
      const band = bandNEWS2(v.news2);
      return '<tr><td class="mono">'+formatTanggalWaktu(v.waktu)+'</td><td>'+v.sistolik+' / '+v.nadi+'</td><td>'+v.rr+' / '+v.spo2+'%</td><td>'+v.suhu+'°C</td>'+
        '<td><span class="badge '+band.cls+'">'+v.news2+' — '+band.label+'</span></td><td style="font-size:13px">'+esc(v.dicatatOleh)+'</td></tr>';
    }).join('')+'</tbody></table></div>')+'</div></div>';
}
function ranapOrderTabHtml(a){
  const canWrite = a.status==='dirawat';
  return (canWrite ? '<div class="panel"><div class="panel-head"><h2>Instruksi Baru</h2></div><div class="panel-body">'+
    '<div class="field"><label>Jenis</label><select id="ord-jenis"><option value="obat">Obat</option><option value="tindakan">Tindakan</option><option value="diet">Diet</option><option value="lab">Pemeriksaan Lab</option></select></div>'+
    '<div id="ord-obat-fields">'+
      '<div class="resep-row"><select id="ord-obat-pilih">'+Store.data.medicines.map(function(m){ return '<option value="'+m.id+'">'+esc(m.nama)+' (stok '+m.stok+')</option>'; }).join('')+'</select>'+
      '<input type="number" id="ord-obat-jumlah" placeholder="Jml" min="1" value="1">'+
      '<input type="text" id="ord-obat-aturan" placeholder="Aturan pakai, mis: 3x1 IV"><span></span></div>'+
      '<p class="hint">Instruksi obat otomatis terkirim sebagai resep ke Farmasi, dan stok/biayanya tersambung ke tagihan rawat inap.</p>'+
    '</div>'+
    '<div id="ord-lain-fields" class="hidden">'+
      '<div class="field"><label>Detail Instruksi</label><input type="text" id="ord-detail" placeholder="mis: Ganti perban, GV luka"></div>'+
      '<div class="field" id="ord-biaya-wrap"><label>Estimasi Biaya Tindakan (Rp, opsional)</label><input type="number" id="ord-biaya" min="0" placeholder="0"></div>'+
    '</div>'+
    '<button class="btn btn-primary btn-sm" id="btn-tambah-order">Simpan Instruksi</button></div></div>' : '')+
    '<div class="panel"><div class="panel-head"><h2>Daftar Instruksi Dokter</h2></div><div class="panel-body">'+
    (a.orders.length===0 ? '<div class="empty">Belum ada instruksi.</div>' :
    '<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Jenis</th><th>Detail</th><th>Dokter</th><th>Status</th></tr></thead><tbody>'+
    [...a.orders].reverse().map(function(o){
      let statusHtml;
      if(o.jenis==='obat' && o.resepId){ const r=getResep(o.resepId); statusHtml = r ? badgeStatus(r.status==='disiapkan'?'obat_siap':'menunggu_farmasi') : badgeStatus('menunggu_farmasi'); }
      else statusHtml = o.status==='aktif' ? '<span class="badge badge-amber">Aktif</span>' : '<span class="badge badge-slate">Selesai</span>';
      return '<tr><td class="mono">'+formatTanggalWaktu(o.waktu)+'</td><td style="text-transform:capitalize">'+esc(o.jenis)+'</td><td>'+esc(o.detail)+(o.biaya?' · '+formatRupiah(o.biaya):'')+'</td><td>'+esc(o.dokterNama)+'</td>'+
      '<td>'+statusHtml+'</td></tr>';
    }).join('')+'</tbody></table></div>')+'</div></div>';
}
function computeBillingRanap(a){
  const ward = Store.data.wards.find(w=>w.id===a.wardId);
  const hari = a.billing.totalHari || Math.max(1, Math.ceil((Date.now()-new Date(a.tanggalMasuk))/86400000));
  const biayaKamar = hari*ward.tarifPerHari;
  const biayaObat = a.billing.biayaObat||0;
  const biayaTindakan = a.billing.biayaTindakan||0;
  const subtotal = biayaKamar+biayaObat+biayaTindakan;
  let tanggungan = 0;
  if(a.jenisBayar==='BPJS') tanggungan = subtotal;
  else if(a.jenisBayar==='Asuransi') tanggungan = Math.round(subtotal*0.8);
  return {hari, biayaKamar, biayaObat, biayaTindakan, subtotal, tanggungan, totalBayar: subtotal-tanggungan};
}
function ranapPulangTabHtml(a){
  const b = computeBillingRanap(a);
  if(a.status==='dirawat'){
    return '<div class="panel"><div class="panel-head"><h2>Rencana Pulang &amp; Resume Medis</h2></div><div class="panel-body">'+
      '<div class="alert alert-info">Estimasi tagihan sejauh ini ('+b.hari+' hari):<br>'+
      'Kamar '+formatRupiah(b.biayaKamar)+' + Obat '+formatRupiah(b.biayaObat)+' + Tindakan '+formatRupiah(b.biayaTindakan)+' = <strong>'+formatRupiah(b.subtotal)+'</strong>'+
      (a.jenisBayar!=='Umum' ? ' ('+a.jenisBayar+', akan disesuaikan saat pembayaran)' : '')+'</div>'+
      '<div class="field"><label>Diagnosis Akhir</label><input type="text" id="pl-diagnosis" value="'+esc(a.diagnosisMasuk)+'"></div>'+
      '<div class="field"><label>Ringkasan Perjalanan Penyakit</label><textarea id="pl-ringkasan" placeholder="Ringkasan kondisi selama dirawat…"></textarea></div>'+
      '<div class="field"><label>Obat Pulang</label><textarea id="pl-obat" placeholder="Daftar obat yang dibawa pulang…"></textarea></div>'+
      '<div class="field"><label>Instruksi Kontrol</label><input type="text" id="pl-kontrol" placeholder="mis: Kontrol poli umum 3 hari lagi"></div>'+
      '<div class="field"><label>Kondisi Pulang</label><select id="pl-kondisi"><option value="pulang">Pulang — membaik</option><option value="rujuk_keluar">Dirujuk ke fasilitas lain</option><option value="meninggal">Meninggal dunia</option></select></div>'+
      '<button class="btn btn-success" id="btn-selesaikan-pulang">Selesaikan &amp; Buat Resume Medis</button></div></div>';
  }
  const r = a.resumeMedis || {};
  return '<div class="panel"><div class="panel-head"><h2>Resume Medis</h2>'+badgeStatus(a.status)+'</div><div class="panel-body">'+
    '<p><strong>Diagnosis Akhir:</strong> '+esc(r.diagnosisAkhir||'-')+'</p><p><strong>Ringkasan:</strong> '+esc(r.ringkasan||'-')+'</p>'+
    '<p><strong>Obat Pulang:</strong> '+esc(r.obatPulang||'-')+'</p><p><strong>Instruksi Kontrol:</strong> '+esc(r.instruksiKontrol||'-')+'</p>'+
    '<div class="table-wrap" style="margin-top:10px"><table>'+
      '<tr><td>Biaya Kamar ('+b.hari+' hari)</td><td class="mono" style="text-align:right">'+formatRupiah(b.biayaKamar)+'</td></tr>'+
      '<tr><td>Biaya Obat</td><td class="mono" style="text-align:right">'+formatRupiah(b.biayaObat)+'</td></tr>'+
      '<tr><td>Biaya Tindakan</td><td class="mono" style="text-align:right">'+formatRupiah(b.biayaTindakan)+'</td></tr>'+
      '<tr><td><strong>Total Tagihan</strong></td><td class="mono" style="text-align:right"><strong>'+formatRupiah(b.totalBayar)+'</strong></td></tr>'+
    '</table></div>'+
    '<div style="margin-top:10px">'+(a.billing.statusBayar==='lunas' ? '<span class="badge badge-sage">✓ Sudah Dibayar (Kasir)</span>' : '<span class="badge badge-amber">Menunggu Pembayaran di Kasir</span>')+'</div>'+
    '<button class="btn btn-outline btn-sm" style="margin-top:10px" id="btn-cetak-resume">🖶 Cetak Resume Medis</button></div></div>';
}

function submitCppt(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const u = Session.currentUser;
  const s = document.getElementById('cppt-s').value.trim(), o = document.getElementById('cppt-o').value.trim();
  const asm = document.getElementById('cppt-a').value.trim(), pl = document.getElementById('cppt-p').value.trim();
  if(!s && !o && !asm && !pl){ showToast('Isi minimal salah satu bagian SOAP', 'danger'); return; }
  a.cppt.push({id:uid('CPPT'), waktu:nowISO(), profesi:roleLabel(u.role), penulisNama:u.nama, subjektif:s, objektif:o, asesmen:asm, planning:pl});
  a.updatedAt = nowISO();
  Store.save();
  logAudit('cppt', esc(getPatient(a.patientId).nama)+' — catatan baru oleh '+u.nama);
  showToast('Catatan CPPT tersimpan', 'success');
  renderRanapDetailBody(a);
}
function hitungNEWS2(v){
  if([v.rr,v.spo2,v.suhu,v.sistolik,v.nadi].some(function(x){ return isNaN(x); })) return null;
  let score = 0;
  if(v.rr<=8) score+=3; else if(v.rr<=11) score+=1; else if(v.rr<=20) score+=0; else if(v.rr<=24) score+=2; else score+=3;
  if(v.spo2<=91) score+=3; else if(v.spo2<=93) score+=2; else if(v.spo2<=95) score+=1; else score+=0;
  if(v.oksigen) score+=2;
  if(v.sistolik<=90) score+=3; else if(v.sistolik<=100) score+=2; else if(v.sistolik<=110) score+=1; else if(v.sistolik<=219) score+=0; else score+=3;
  if(v.nadi<=40) score+=3; else if(v.nadi<=50) score+=1; else if(v.nadi<=90) score+=0; else if(v.nadi<=110) score+=1; else if(v.nadi<=130) score+=2; else score+=3;
  if(v.kesadaran==='cvpu') score+=3;
  if(v.suhu<=35.0) score+=3; else if(v.suhu<=36.0) score+=1; else if(v.suhu<=38.0) score+=0; else if(v.suhu<=39.0) score+=1; else score+=2;
  return score;
}
function bandNEWS2(score){
  if(score>=7) return {label:'Risiko Tinggi', cls:'badge-brick'};
  if(score>=5) return {label:'Risiko Sedang', cls:'badge-amber'};
  return {label:'Risiko Rendah', cls:'badge-sage'};
}
function submitVital(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const u = Session.currentUser;
  const v = {
    rr: parseFloat(document.getElementById('vs-rr').value), spo2: parseFloat(document.getElementById('vs-spo2').value),
    suhu: parseFloat(document.getElementById('vs-suhu').value), sistolik: parseFloat(document.getElementById('vs-sistolik').value),
    nadi: parseFloat(document.getElementById('vs-nadi').value), kesadaran: document.getElementById('vs-kesadaran').value,
    oksigen: document.getElementById('vs-oksigen').checked
  };
  const score = hitungNEWS2(v);
  if(score===null){ showToast('Lengkapi semua nilai tanda vital (angka)', 'danger'); return; }
  a.vitalLog.push({id:uid('VS'), waktu:nowISO(), dicatatOleh:u.nama, rr:v.rr, spo2:v.spo2, sistolik:v.sistolik, nadi:v.nadi, suhu:v.suhu, kesadaran:v.kesadaran, oksigen:v.oksigen, news2:score});
  a.updatedAt = nowISO();
  Store.save();
  const band = bandNEWS2(score);
  logAudit('vital_ranap', esc(getPatient(a.patientId).nama)+' — NEWS2: '+score+' ('+band.label+')');
  showToast('Tanda vital tersimpan — NEWS2: '+score+' ('+band.label+')', score>=7?'danger':(score>=5?'warning':'success'));
  renderRanapDetailBody(a);
}
function submitOrder(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const jenis = document.getElementById('ord-jenis').value;
  const dpjp = getUserById(a.dpjpUserId);
  const dokterNama = dpjp ? dpjp.nama : Session.currentUser.nama;
  const patNama = esc(getPatient(a.patientId).nama);

  if(jenis==='obat'){
    const medId = document.getElementById('ord-obat-pilih').value;
    const jumlah = parseInt(document.getElementById('ord-obat-jumlah').value)||0;
    const aturan = document.getElementById('ord-obat-aturan').value.trim();
    if(jumlah<=0 || !aturan){ showToast('Lengkapi jumlah dan aturan pakai obat', 'danger'); return; }
    const med = getMedicine(medId);
    const resep = {id:uid('RSP'), visitId:null, admissionId:a.id, items:[{medicineId:medId, nama:med.nama, jumlah, hargaSatuan:med.harga, aturanPakai:aturan}], status:'menunggu', createdAt:nowISO()};
    Store.data.prescriptions.push(resep);
    a.orders.push({id:uid('ORD'), waktu:nowISO(), dokterNama, jenis:'obat', detail:med.nama+' ×'+jumlah+' — '+aturan, status:'aktif', resepId:resep.id});
    logAudit('instruksi_obat_ranap', patNama+' — '+med.nama+' ×'+jumlah+' (terkirim ke Farmasi)');
    showToast('Instruksi obat tersimpan — terkirim ke Farmasi', 'success');
  } else {
    const detail = document.getElementById('ord-detail').value.trim();
    if(!detail){ showToast('Isi detail instruksi', 'danger'); return; }
    const biaya = jenis==='tindakan' ? (parseInt(document.getElementById('ord-biaya').value)||0) : 0;
    if(biaya>0){ a.billing.biayaTindakan = (a.billing.biayaTindakan||0) + biaya; }
    a.orders.push({id:uid('ORD'), waktu:nowISO(), dokterNama, jenis, detail, status: jenis==='tindakan'?'selesai':'aktif', biaya});
    logAudit('instruksi_ranap', patNama+' — '+jenis+': '+detail+(biaya?' ('+formatRupiah(biaya)+')':''));
    showToast('Instruksi tersimpan'+(biaya?' — biaya masuk tagihan':''), 'success');
  }
  a.updatedAt = nowISO();
  Store.save();
  renderRanapDetailBody(a);
}
function selesaikanPulang(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const diagnosisAkhir = document.getElementById('pl-diagnosis').value.trim();
  if(!diagnosisAkhir){ showToast('Isi diagnosis akhir', 'danger'); return; }
  const hari = Math.max(1, Math.ceil((Date.now()-new Date(a.tanggalMasuk))/86400000));
  a.status = document.getElementById('pl-kondisi').value;
  a.tanggalKeluar = nowISO();
  a.resumeMedis = {
    diagnosisAkhir, ringkasan: document.getElementById('pl-ringkasan').value.trim(),
    obatPulang: document.getElementById('pl-obat').value.trim(), instruksiKontrol: document.getElementById('pl-kontrol').value.trim()
  };
  a.billing.totalHari = hari;
  a.billing.statusBayar = 'belum_bayar';
  const bed = Store.data.beds.find(b=>b.id===a.bedId);
  if(bed) bed.status = 'kosong';
  a.updatedAt = nowISO();
  Store.save();
  logAudit('pulang_ranap', esc(getPatient(a.patientId).nama)+' — '+a.status+', '+hari+' hari rawat, tagihan '+formatRupiah(computeBillingRanap(a).totalBayar));
  showToast('Pasien telah diselesaikan perawatannya — tagihan menunggu di Kasir', 'success');
  renderAdmisiDetail();
}
function cetakResumeMedis(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), r = a.resumeMedis||{}, b = computeBillingRanap(a);
  printArea('<div style="font-family:monospace;max-width:420px;margin:0 auto"><h2 style="text-align:center">RSU SEHAT SENTOSA</h2><p style="text-align:center">Resume Medis Rawat Inap</p><hr>'+
    '<p>Nama: '+esc(p.nama)+'<br>No. RM: '+p.id+'<br>Ruang: '+esc(ward.nama)+'<br>Masuk: '+formatTanggalIndo(a.tanggalMasuk)+'<br>Keluar: '+formatTanggalIndo(a.tanggalKeluar)+' ('+b.hari+' hari)</p><hr>'+
    '<p><strong>Diagnosis Masuk:</strong> '+esc(a.diagnosisMasuk)+'<br><strong>Diagnosis Akhir:</strong> '+esc(r.diagnosisAkhir)+'</p>'+
    '<p><strong>Ringkasan:</strong> '+esc(r.ringkasan)+'</p><p><strong>Obat Pulang:</strong> '+esc(r.obatPulang)+'</p><p><strong>Kontrol:</strong> '+esc(r.instruksiKontrol)+'</p><hr>'+
    '<p>Kamar: '+formatRupiah(b.biayaKamar)+'<br>Obat: '+formatRupiah(b.biayaObat)+'<br>Tindakan: '+formatRupiah(b.biayaTindakan)+'<br><strong>Total: '+formatRupiah(b.totalBayar)+'</strong></p></div>');
}

function openAdmisiBaruSheet(){
  const bedKosong = Store.data.beds.filter(b=>b.status==='kosong');
  const dokterList = Store.data.users.filter(u=>u.role==='dokter');
  openModal(
    '<div class="modal-head"><h2>Admisi Rawat Inap Baru</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div>'+
    '<div class="modal-body">'+
    (admisiBaruState.patientId ? '<p class="hint">Pasien: <strong>'+esc(getPatient(admisiBaruState.patientId).nama)+'</strong></p>' :
      '<div class="field"><label>Cari Pasien</label><div class="search-row"><input type="text" id="ab-cari" placeholder="NIK/No. RM/Nama…"><button type="button" class="btn btn-outline" id="ab-btn-cari">Cari</button></div><div id="ab-hasil"></div><div id="ab-terpilih" class="hint"></div></div>')+
    '<div class="field"><label>Tempat Tidur Tersedia</label><select id="ab-bed">'+
      (bedKosong.length===0 ? '<option value="">Tidak ada bed kosong</option>' :
      bedKosong.map(function(b){ const w=Store.data.wards.find(x=>x.id===b.wardId); return '<option value="'+b.id+'">'+esc(w.nama)+' — Kamar '+b.noKamar+b.noBed+' ('+formatRupiah(w.tarifPerHari)+'/hari)</option>'; }).join(''))+
    '</select></div>'+
    '<div class="field"><label>DPJP (Dokter Penanggung Jawab)</label><select id="ab-dpjp">'+dokterList.map(function(d){ return '<option value="'+d.id+'">'+esc(d.nama)+'</option>'; }).join('')+'</select></div>'+
    '<div class="field-row"><div class="field"><label>Jenis Pembayaran</label><select id="ab-bayar"><option value="Umum">Umum</option><option value="BPJS">BPJS</option><option value="Asuransi">Asuransi</option></select></div>'+
    '<div class="field"><label>No. Kartu (jika ada)</label><input type="text" id="ab-nokartu"></div></div>'+
    '<div class="field"><label>Diagnosis Masuk</label><input type="text" id="ab-diagnosis" placeholder="mis: Observasi febris + dehidrasi ringan"></div>'+
    '<button class="btn btn-primary btn-block" id="btn-simpan-admisi" '+(bedKosong.length===0?'disabled':'')+'>Admisikan Pasien</button>'+
    '</div>'
  );
  if(!admisiBaruState.patientId){
    document.getElementById('ab-btn-cari').addEventListener('click', function(){
      const q = document.getElementById('ab-cari').value.trim(), qLower=q.toLowerCase();
      const el = document.getElementById('ab-hasil');
      if(!q){ el.innerHTML=''; return; }
      const results = Store.data.patients.filter(function(p){ return p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower); });
      el.innerHTML = results.length===0 ? '<div class="hint">Tidak ditemukan.</div>' :
        '<div class="chip-row" style="margin-top:6px">'+results.map(function(p){ return '<button type="button" class="chip" data-pid="'+p.id+'">'+esc(p.nama)+'</button>'; }).join('')+'</div>';
      el.querySelectorAll('[data-pid]').forEach(function(b){
        b.addEventListener('click', function(){ admisiBaruState.patientId=this.dataset.pid; document.getElementById('ab-terpilih').innerHTML='Terpilih: <strong>'+esc(getPatient(admisiBaruState.patientId).nama)+'</strong>'; el.innerHTML=''; });
      });
    });
  }
  document.getElementById('btn-simpan-admisi').addEventListener('click', submitAdmisiBaru);
}
function submitAdmisiBaru(){
  if(!admisiBaruState.patientId){ showToast('Pilih pasien terlebih dahulu', 'danger'); return; }
  const bedId = document.getElementById('ab-bed').value;
  if(!bedId){ showToast('Tidak ada tempat tidur tersedia', 'danger'); return; }
  const diagnosisMasuk = document.getElementById('ab-diagnosis').value.trim();
  if(!diagnosisMasuk){ showToast('Isi diagnosis masuk', 'danger'); return; }
  const bed = Store.data.beds.find(b=>b.id===bedId);
  const admission = {
    id: uid('ADM'), patientId: admisiBaruState.patientId, visitId: admisiBaruState.visitId, bedId, wardId:bed.wardId,
    dpjpUserId: document.getElementById('ab-dpjp').value, diagnosisMasuk,
    jenisBayar: document.getElementById('ab-bayar').value, noBpjs: document.getElementById('ab-nokartu').value.trim(),
    status:'dirawat', tanggalMasuk: nowISO(), cppt:[], vitalLog:[], orders:[], resumeMedis:null,
    billing:{biayaObat:0, biayaTindakan:0, statusBayar:'belum_bayar'}, createdAt: nowISO(), updatedAt: nowISO()
  };
  Store.data.admissions.push(admission);
  bed.status = 'terisi';
  Store.save();
  logAudit('admisi_baru', esc(getPatient(admisiBaruState.patientId).nama)+' — '+diagnosisMasuk);
  closeModal();
  showToast('Pasien berhasil diadmisikan', 'success');
  admisiBaruState = {patientId:null, visitId:null};
  if(currentRoute()==='ranap') renderRanapPasienTab();
}
function rujukRawatInap(visitId){
  const visit = getVisit(visitId);
  visit.diagnosis = (document.getElementById('px-diagnosis').value||'').trim() || visit.diagnosis;
  visit.catatan = (document.getElementById('px-catatan').value||'').trim() || visit.catatan;
  visit.billing.konsultasi = getPoli(visit.poliId).biaya;
  visit.status = 'rujuk_ranap';
  visit.updatedAt = nowISO();
  Store.save();
  logAudit('rujuk_ranap', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  poliState.activeVisitId = null;
  refreshPoliQueue();
  document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div>';
  admisiBaruState = {patientId: visit.patientId, visitId: visit.id};
  openAdmisiBaruSheet();
  setTimeout(function(){ const d=document.getElementById('ab-diagnosis'); if(d) d.value = visit.diagnosis || ''; }, 30);
}

/* =================================================================
   MODULE: REKAM MEDIS
   ================================================================= */
function renderRekamMedis(){
  setPageTitle('Rekam Medis');
  document.getElementById('main-content').innerHTML =
    pageIntro('Cari pasien untuk melihat seluruh riwayat kunjungan lintas poli — diagnosis, tindakan, dan resep.')+
    '<div class="panel"><div class="panel-body">'+
    '<form id="form-cari-rm" class="search-row"><input type="text" id="cari-rm-input" placeholder="Cari berdasarkan NIK, No. RM, atau Nama...">'+
    '<button type="submit" class="btn btn-primary">Cari</button></form><div id="hasil-cari-rm"></div></div></div>'+
    '<div id="detail-rm-area"></div>';
  document.getElementById('form-cari-rm').addEventListener('submit', function(e){
    e.preventDefault(); doSearchRekamMedis(document.getElementById('cari-rm-input').value.trim());
  });
}
function doSearchRekamMedis(q){
  const el = document.getElementById('hasil-cari-rm');
  document.getElementById('detail-rm-area').innerHTML = '';
  if(!q){ el.innerHTML=''; return; }
  const qLower = q.toLowerCase();
  const results = Store.data.patients.filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower));
  if(results.length===0){ el.innerHTML = '<div class="empty">Pasien tidak ditemukan.</div>'; return; }
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>No. RM</th><th>Nama</th><th>NIK</th><th></th></tr></thead><tbody>'+
    results.map(p=>'<tr><td class="mono">'+p.id+'</td><td>'+esc(p.nama)+'</td><td class="mono">'+maskNik(p.nik)+'</td>'+
      '<td><button class="btn btn-outline btn-sm" data-lihat-rm="'+p.id+'">Lihat Rekam Medis</button></td></tr>').join('')+'</tbody></table></div>';
  el.querySelectorAll('[data-lihat-rm]').forEach(btn=> btn.addEventListener('click', ()=> tampilkanRekamMedis(btn.dataset.lihatRm)));
}
function tampilkanRekamMedis(patientId){
  const p = getPatient(patientId);
  const riwayat = patientVisits(patientId);
  document.getElementById('detail-rm-area').innerHTML =
    '<div class="panel"><div class="panel-head"><h2>'+esc(p.nama)+'</h2></div><div class="panel-body">'+
    '<div class="grid grid-4" style="margin-bottom:16px">'+
      statCard('No. RM', p.id, '')+statCard('Usia', calcUmur(p.tglLahir)+' th', p.jenisKelamin==='L'?'Laki-laki':'Perempuan')+
      statCard('Golongan Darah', p.golDarah||'-', '')+statCard('Total Kunjungan', riwayat.length, '')+
    '</div>'+
    (p.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(p.alergi)+'</div>' : '')+
    '<p style="font-size:13.5px;color:var(--ink-soft)">'+esc(p.alamat)+' &middot; '+esc(p.noHp)+'</p>'+
    '<h3 style="margin:16px 0 10px">Riwayat Kunjungan</h3>'+
    (riwayat.length===0 ? '<div class="empty">Belum ada riwayat kunjungan.</div>' : riwayat.map(v=>historyItemHtmlFull(v)).join(''))+
    '</div></div>';
}

/* =================================================================
   MODULE: MASTER DATA
   ================================================================= */
let masterTab = 'poli';
function renderMasterData(){
  setPageTitle('Master Data');
  masterTab = 'poli';
  document.getElementById('main-content').innerHTML =
    pageIntro('Kelola data induk, struktur fasilitas, staf, hak akses, dan jejak aktivitas sistem.')+
    '<div class="tabs"><button class="tab active" data-mtab="poli">Poli</button><button class="tab" data-mtab="staff">Staf & Pengguna</button>'+
    '<button class="tab" data-mtab="facility">Fasilitas</button><button class="tab" data-mtab="rbac">Hak Akses</button><button class="tab" data-mtab="log">Audit Log</button></div>'+
    '<div id="master-tab-area"></div>';
  document.querySelectorAll('[data-mtab]').forEach(function(t){ t.addEventListener('click',function(){ switchMasterTab(t.dataset.mtab); }); });
  renderMasterPoliTab();
}
function switchMasterTab(tab){
  masterTab = tab;
  document.querySelectorAll('[data-mtab]').forEach(function(t){ t.classList.toggle('active',t.dataset.mtab===tab); });
  if(tab==='poli') renderMasterPoliTab();
  else if(tab==='staff') renderMasterStaffTab();
  else if(tab==='facility') renderMasterFacilityTab();
  else if(tab==='rbac') renderMasterRbacTab();
  else renderMasterLogTab();
}
function renderMasterFacilityTab(){
  const el=document.getElementById('master-tab-area');
  const typeLabel={gedung:'Gedung',lantai:'Lantai',unit:'Unit/Instalasi',ruang:'Ruang',kamar:'Kamar',bed:'Bed'};
  el.innerHTML='<div class="alert alert-info">Struktur fasilitas dibuat bertingkat agar nanti mudah dipetakan ke struktur nyata RSUD R.T. Notopuro. Data yang belum diverifikasi resmi sengaja dibuat sebagai placeholder dan tidak dianggap sebagai denah rumah sakit.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Tambah Node Fasilitas</h2></div><div class="panel-body"><form id="form-facility" class="field-row3">'+
    '<div class="field"><label>Jenis</label><select id="fc-type">'+Object.keys(typeLabel).map(function(k){return '<option value="'+k+'">'+typeLabel[k]+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label>Nama</label><input id="fc-nama" required placeholder="Contoh: Ruang Mawar"></div>'+
    '<div class="field"><label>Induk (opsional)</label><select id="fc-parent"><option value="">Tidak ada</option>'+Store.data.facilities.map(function(f){return '<option value="'+f.id+'">'+esc(typeLabel[f.type]||f.type)+' — '+esc(f.nama)+'</option>';}).join('')+'</select></div>'+
    '<div style="grid-column:1/-1"><button class="btn btn-primary">Tambah</button></div></form></div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Struktur Fasilitas</h2></div><div class="panel-body"><div class="facility-tree">'+
    Store.data.facilities.map(function(f){return '<div class="facility-node"><span class="facility-type">'+(typeLabel[f.type]||f.type)+'</span><strong>'+esc(f.nama)+'</strong><span class="hint">'+(f.parentId?'Induk: '+esc((Store.data.facilities.find(function(x){return x.id===f.parentId;})||{}).nama||f.parentId):'Root')+'</span></div>';}).join('')+
    '</div></div></div>';
  document.getElementById('form-facility').addEventListener('submit',function(e){
    e.preventDefault();
    const f={id:'FAC-'+Date.now().toString(36),type:document.getElementById('fc-type').value,nama:document.getElementById('fc-nama').value.trim(),parentId:document.getElementById('fc-parent').value||null};
    if(!f.nama){showToast('Nama fasilitas wajib diisi','danger');return;}
    Store.data.facilities.push(f); Store.save(); logAudit('fasilitas_baru',f.type+' — '+f.nama); showToast('Fasilitas ditambahkan','success'); renderMasterFacilityTab();
  });
}
function renderMasterRbacTab(){
  const matrix=[
    ['Dashboard','admin','—','—','—','—','—','—'],
    ['Pendaftaran','✓','✓','—','—','—','—','—'],
    ['Booking Antrian','✓','✓','—','—','—','—','—'],
    ['Poli','✓','—','✓','—','—','—','—'],
    ['Rawat Inap','✓','—','✓','—','—','—','✓'],
    ['Laboratorium','✓','—','—','—','✓','—','—'],
    ['Farmasi','✓','—','—','✓','—','—','—'],
    ['Kasir','✓','—','—','—','—','✓','—'],
    ['Rekam Medis','✓','—','✓','—','—','—','—'],
    ['Master Data','✓','—','—','—','—','—','—']
  ];
  const roles=['Admin','Loket','Dokter','Farmasi','Lab','Kasir','Perawat'];
  document.getElementById('master-tab-area').innerHTML='<div class="alert alert-info">RBAC (Role-Based Access Control) membatasi modul berdasarkan peran. Ini masih demo sisi client; autentikasi produksi harus dipindahkan ke backend dengan sesi/token aman.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Matriks Hak Akses</h2></div><div class="panel-body"><div class="table-wrap"><table class="rbac-table"><thead><tr><th>Modul</th>'+roles.map(function(r){return '<th>'+r+'</th>';}).join('')+'</tr></thead><tbody>'+
    matrix.map(function(row){return '<tr>'+row.map(function(v,i){return '<td class="'+(i===0?'rbac-module':'')+'">'+(i===0?esc(v):v)+'</td>';}).join('')+'</tr>';}).join('')+
    '</tbody></table></div></div></div>';
}
function renderMasterLogTab(){
  const list = (Store.data.auditLog||[]).slice(0,150);
  document.getElementById('master-tab-area').innerHTML =
    '<div class="alert alert-info">Riwayat aktivitas untuk akuntabilitas data pasien — siapa melakukan apa dan kapan. Tersimpan di perangkat ini (150 terbaru ditampilkan).</div>'+
    '<div class="panel"><div class="panel-head"><h2>Log Aktivitas</h2></div><div class="panel-body">'+
    (list.length===0 ? '<div class="empty">Belum ada aktivitas tercatat.</div>' :
    '<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Peran</th><th>Aksi</th><th>Detail</th></tr></thead><tbody>'+
    list.map(l=>'<tr><td class="mono">'+formatTanggalWaktu(l.createdAt)+'</td><td>'+esc(l.userName)+'</td><td>'+esc(l.role)+'</td><td>'+esc(l.aksi)+'</td>'+
      '<td style="font-size:13px;color:var(--ink-soft)">'+esc(l.detail)+'</td></tr>').join('')+'</tbody></table></div>')+
    '</div></div>';
}
function renderMasterPoliTab(){
  const area = document.getElementById('master-tab-area');
  area.innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Tambah Poli</h2></div><div class="panel-body">'+
      '<form id="form-poli-baru" class="field-row3">'+
        '<div class="field"><label>Kode Poli</label><input type="text" id="pl-kode" maxlength="4" style="text-transform:uppercase" required></div>'+
        '<div class="field"><label>Nama Poli</label><input type="text" id="pl-nama" required></div>'+
        '<div class="field"><label>Biaya Konsultasi (Rp)</label><input type="number" id="pl-biaya" min="0" required></div>'+
        '<div class="field" style="grid-column:1/-1"><button type="submit" class="btn btn-primary">Tambah Poli</button></div>'+
      '</form></div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Daftar Poli</h2></div><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Poli</th><th>Biaya Konsultasi</th><th>Dokter</th></tr></thead><tbody>'+
      Store.data.poli.map(p=>{
        const dokter = Store.data.users.filter(u=>u.role==='dokter' && u.poliId===p.id);
        return '<tr><td class="mono"><span class="poli-tag"><span class="poli-dot" style="background:var(--'+poliColor(p.id)+')"></span>'+p.id+'</span></td><td>'+esc(p.nama)+'</td>'+
        '<td class="mono">'+formatRupiah(p.biaya)+'</td><td style="font-size:13px">'+(dokter.length?dokter.map(d=>esc(d.nama)).join(', '):'<span style="color:var(--ink-soft)">Belum ada</span>')+'</td></tr>';
      }).join('')+'</tbody></table></div></div></div>';
  document.getElementById('form-poli-baru').addEventListener('submit', function(e){
    e.preventDefault();
    const kode = document.getElementById('pl-kode').value.trim().toUpperCase();
    if(!kode || Store.data.poli.some(p=>p.id===kode)){ showToast('Kode poli kosong atau sudah dipakai', 'danger'); return; }
    const namaPoli = document.getElementById('pl-nama').value.trim();
    Store.data.poli.push({id:kode, nama:namaPoli, biaya: parseInt(document.getElementById('pl-biaya').value)||0});
    Store.save();
    logAudit('poli_baru', kode+' — '+namaPoli);
    showToast('Poli baru ditambahkan', 'success'); renderMasterPoliTab();
  });
}
function renderMasterStaffTab(){
  document.getElementById('master-tab-area').innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Daftar Staf &amp; Pengguna</h2></div><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Username</th><th>Peran</th><th>Poli</th></tr></thead><tbody>'+
    Store.data.users.map(u=>'<tr><td>'+esc(u.nama)+'</td><td class="mono">'+esc(u.username)+'</td><td>'+roleLabel(u.role)+'</td><td>'+(u.poliId?esc(getPoli(u.poliId).nama):'-')+'</td></tr>').join('')+
    '</tbody></table></div><p class="hint" style="margin-top:10px">Akun demo memakai password bawaan. Pada versi produksi, ganti dengan sistem autentikasi & hashing password yang aman di sisi server.</p></div></div>';
}

/* =================================================================
   MODULE: CEK ANTRIAN (papan tampilan publik)
   ================================================================= */
function renderCekAntrian(){
  setPageTitle('Cek Antrian');
  document.getElementById('main-content').innerHTML =
    pageIntro('Papan status antrian seluruh poli hari ini — cocok ditampilkan di layar ruang tunggu.')+
    '<div style="margin-bottom:14px"><button class="btn btn-outline btn-sm" id="btn-kiosk">⛶ Mode Layar Penuh</button> <button class="btn btn-ghost btn-sm" id="btn-refresh-antrian">↻ Perbarui</button></div>'+
    '<h3 style="color:var(--ink-soft);margin-bottom:10px">🩺 Antrian Rawat Jalan</h3>'+
    '<div class="kiosk-grid" id="cek-antrian-grid"></div>'+
    '<h3 style="color:var(--ink-soft);margin:22px 0 10px">🏨 Ketersediaan Tempat Tidur Rawat Inap</h3>'+
    '<div class="kiosk-grid" id="cek-bed-grid"></div>';
  document.getElementById('btn-kiosk').addEventListener('click', toggleKioskMode);
  document.getElementById('btn-refresh-antrian').addEventListener('click', function(){ renderCekAntrianGrid(); renderCekBedGrid(); });
  renderCekAntrianGrid();
  renderCekBedGrid();
}
function renderCekBedGrid(){
  const grid = document.getElementById('cek-bed-grid');
  if(!grid) return;
  grid.innerHTML = Store.data.wards.map(function(w){
    const bedsInWard = Store.data.beds.filter(b=>b.wardId===w.id);
    const kosong = bedsInWard.filter(b=>b.status==='kosong').length;
    const cls = kosong===0 ? 'badge-brick' : (kosong<=Math.ceil(bedsInWard.length*0.3) ? 'badge-amber' : 'badge-sage');
    return '<div class="queue-board-item"><div class="poli-tag" style="margin-bottom:8px"><strong>'+esc(w.nama)+'</strong></div>'+
      '<div style="font-size:11.5px;color:var(--ink-soft);font-weight:700">TEMPAT TIDUR KOSONG</div>'+
      '<div class="num" style="font-size:28px">'+kosong+' <span style="font-size:15px;color:var(--ink-soft)">/ '+bedsInWard.length+'</span></div>'+
      '<span class="badge '+cls+'" style="margin-top:6px">'+(kosong===0?'Penuh':(cls==='badge-amber'?'Hampir Penuh':'Tersedia'))+'</span></div>';
  }).join('');
}
function renderCekAntrianGrid(){
  const grid = document.getElementById('cek-antrian-grid');
  if(!grid) return;
  const visits = visitsToday();
  grid.innerHTML = Store.data.poli.map(poli=>{
    const antrianPoli = visits.filter(v=>v.poliId===poli.id);
    const sedang = antrianPoli.filter(v=>v.status==='diperiksa').sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0];
    const menunggu = antrianPoli.filter(v=>v.status==='menunggu_poli').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    const infoTerbaru = Store.data.poliMessages.filter(m=>m.poliId===poli.id)[0];
    const infoHtml = infoTerbaru ?
      '<div class="badge '+POLI_MSG_BADGE[infoTerbaru.tipe]+'" style="margin-top:9px;white-space:normal;text-align:left">'+esc(infoTerbaru.pesan)+'</div>' : '';
    return '<div class="queue-board-item'+(sedang?' calling':'')+'">'+
      '<div class="poli-tag" style="margin-bottom:8px"><span class="poli-dot" style="background:var(--'+poliColor(poli.id)+')"></span><strong>'+esc(poli.nama)+'</strong></div>'+
      '<div style="font-size:11.5px;color:var(--ink-soft);font-weight:700">SEDANG DILAYANI</div>'+
      '<div class="num">'+(sedang?sedang.noAntrian:'—')+'</div>'+
      '<div style="font-size:12px;color:var(--ink-soft);margin-top:6px">Menunggu: '+(menunggu.length?menunggu.map(v=>v.noAntrian).join(', '):'-')+'</div>'+
      infoHtml+'</div>';
  }).join('');
}
function toggleKioskMode(){
  document.body.classList.toggle('kiosk-on');
  document.getElementById('btn-kiosk').textContent = document.body.classList.contains('kiosk-on') ? '⛶ Keluar Layar Penuh' : '⛶ Mode Layar Penuh';
}

/* =================================================================
   MODULE: IGD
   ================================================================= */
function renderIGD(){
  setPageTitle('Instalasi Gawat Darurat (IGD)');
  const visits = visitsToday().filter(v=>v.unit==='igd');
  const waiting = visits.filter(v=>v.status==='menunggu_poli').length;
  const exam = visits.filter(v=>v.status==='diperiksa').length;
  const done = visits.filter(v=>v.status==='selesai').length;
  document.getElementById('main-content').innerHTML =
    pageIntro('Dashboard operasional IGD. Detail triase, tindakan, farmasi IGD, dan kasir IGD akan kita lengkapi saat review divisi IGD.')+
    '<div class="ops-kpi-grid">'+
      '<div class="ops-kpi"><div class="kpi-label">Pasien IGD Hari Ini</div><div class="kpi-value">'+visits.length+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Menunggu</div><div class="kpi-value">'+waiting+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Diperiksa</div><div class="kpi-value">'+exam+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Selesai</div><div class="kpi-value">'+done+'</div></div>'+
    '</div>'+ 
    '<div class="ops-grid-main"><div class="panel"><div class="panel-head"><h2>Zona IGD</h2></div><div class="panel-body"><div class="ops-queue-grid"><div class="ops-queue-card"><strong>Zona Merah</strong><div class="hint">Prioritas kegawatan tinggi</div></div><div class="ops-queue-card"><strong>Zona Kuning</strong><div class="hint">Prioritas sesuai hasil triase</div></div></div></div></div>'+ 
    '<div class="panel"><div class="panel-head"><h2>Integrasi Layanan</h2></div><div class="panel-body"><div class="hint">Farmasi IGD dan Kasir IGD tersedia sebagai menu terpisah agar alur IGD tidak tercampur dengan Rawat Jalan/Rawat Inap.</div></div></div></div>';
}

/* =================================================================
   INIT / PWA BOOTSTRAP
   ================================================================= */
MODULE_RENDERERS['dashboard'] = renderDashboard;
MODULE_RENDERERS['beranda'] = renderBeranda;
MODULE_RENDERERS['pendaftaran'] = renderPendaftaran;
MODULE_RENDERERS['booking'] = renderBooking;
MODULE_RENDERERS['poli'] = renderPoli;
MODULE_RENDERERS['ranap'] = renderRanap;
MODULE_RENDERERS['lab'] = renderLab;
MODULE_RENDERERS['igd'] = renderIGD;
MODULE_RENDERERS['farmasi-rawat-jalan'] = renderFarmasi;
MODULE_RENDERERS['farmasi-rawat-inap'] = renderFarmasi;
MODULE_RENDERERS['farmasi-igd'] = renderFarmasi;
MODULE_RENDERERS['kasir-rawat-jalan'] = renderKasir;
MODULE_RENDERERS['kasir-rawat-inap'] = renderKasir;
MODULE_RENDERERS['kasir-igd'] = renderKasir;
MODULE_RENDERERS['rekam-medis'] = renderRekamMedis;
MODULE_RENDERERS['master-data'] = renderMasterData;
MODULE_RENDERERS['cek-antrian'] = renderCekAntrian;

function doInstallPrompt(){
  if(!installPromptEvent) return;
  installPromptEvent.prompt();
  installPromptEvent.userChoice.finally(function(){ installPromptEvent = null; });
}
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  installPromptEvent = e;
  const btn = document.getElementById('btn-install');
  if(btn) btn.classList.remove('hidden');
});
function updateOfflineBanner(){
  const banner = document.getElementById('offline-banner');
  if(banner) banner.classList.toggle('hidden', navigator.onLine);
}
window.addEventListener('online', updateOfflineBanner);
window.addEventListener('offline', updateOfflineBanner);

if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(err){ console.log('Service worker tidak aktif pada mode preview ini:', err); });
  });
}

Store.load();
Session.load();
expireOldBookings();
updateOfflineBanner();
['click','keydown','touchstart'].forEach(function(evt){ document.addEventListener(evt, resetSessionTimer); });
if(Session.currentUser) resetSessionTimer();
render();
