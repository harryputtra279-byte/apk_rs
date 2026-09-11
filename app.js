"use strict";
/* =================================================================
   SIMRS TERPADU — konstanta, util, seed data, penyimpanan (Store)
   ================================================================= */
const BIAYA_REGISTRASI = 10000;
const BIAYA_LAB = 75000;
const LOW_STOCK_THRESHOLD = 15;

const POLI_COLOR = {UMU:'clinical', GIG:'slate', ANA:'sage', KDG:'plum', MAT:'amber', THT:'brick', JAN:'brick', KUL:'plum', PDL:'slate', SYA:'plum', PAR:'sage'};

function poliColor(id){ return POLI_COLOR[id] || 'clinical'; }

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
  kadaluarsa:      {label:'Lewat Jadwal',           cls:'badge-brick'}
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
    {id:'U-FAR', username:'farmasi', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi'},
    {id:'U-KAS', username:'kasir', password:'kasir123', nama:'Rina Marlina', role:'kasir'},
    {id:'U-LAB', username:'lab', password:'lab123', nama:'Agus Setiawan', role:'lab'}
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
      status:'selesai', vital:{td:'120/80', nadi:'82', suhu:'37.8', rr:'20', bb:'68', tb:'170'},
      diagnosis:'ISPA (Infeksi Saluran Pernapasan Atas)', catatan:'Istirahat cukup, kontrol jika demam berlanjut 3 hari.',
      labRequest:null, resepId:null, billing:{registrasi:BIAYA_REGISTRASI, konsultasi:35000, obat:1600, lab:0},
      createdAt:daysAgoISO(12), updatedAt:daysAgoISO(12)}
  ];
  const prescriptions = [
    {id:uid('RSP'), visitId:visits[0].id, items:[{medicineId:'OBT001', nama:'Paracetamol 500mg', jumlah:10, hargaSatuan:500, aturanPakai:'3x1 sesudah makan'}], status:'disiapkan', createdAt:daysAgoISO(12)}
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
  return {
    poli, users, medicines, patients, visits, prescriptions, transactions, bookings, poliMessages, auditLog,
    meta:{ rmCounter:3, queueCounters:{ ['JAN-'+bookingTanggal]: 2 }, schemaVersion: DB_SCHEMA_VERSION }
  };
}

/* ---------------- persistence ---------------- */
const DB_SCHEMA_VERSION = 3;
const Store = {
  data:null,
  load(){
    const raw = localStorage.getItem('simrs_db_v1');
    let loaded = null;
    if(raw){ try{ loaded = JSON.parse(raw); }catch(e){ loaded = null; } }
    if(loaded && loaded.meta && loaded.meta.schemaVersion === DB_SCHEMA_VERSION){
      this.data = loaded;
    } else {
      this.data = seedData();
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

/* =================================================================
   ROUTER, SHELL, LOGIN, TOAST/MODAL HELPERS
   ================================================================= */
let installPromptEvent = null;
const MODULE_RENDERERS = {};

const NAV_ITEMS = [
  {hash:'dashboard', label:'Dashboard', ic:'📊', roles:['admin']},
  {hash:'beranda', label:'Beranda', ic:'🏠', roles:['loket','dokter','farmasi','kasir','lab']},
  {hash:'pendaftaran', label:'Pendaftaran', ic:'📝', roles:['admin','loket']},
  {hash:'booking', label:'Booking Antrian', ic:'📅', roles:['admin','loket']},
  {hash:'poli', label:'Poli', ic:'🩺', roles:['admin','dokter']},
  {hash:'lab', label:'Laboratorium', ic:'🧪', roles:['admin','lab']},
  {hash:'farmasi', label:'Farmasi', ic:'💊', roles:['admin','farmasi']},
  {hash:'kasir', label:'Kasir', ic:'🧾', roles:['admin','kasir']},
  {hash:'rekam-medis', label:'Rekam Medis', ic:'📁', roles:['admin','dokter']},
  {hash:'master-data', label:'Master Data', ic:'⚙️', roles:['admin']},
  {hash:'cek-antrian', label:'Cek Antrian', ic:'📺', roles:['admin','loket','dokter','farmasi','kasir','lab']}
];

function roleLabel(role){
  return {admin:'Admin', loket:'Petugas Pendaftaran', dokter:'Dokter', farmasi:'Apoteker', kasir:'Kasir', lab:'Petugas Laboratorium'}[role] || role;
}
function isRouteAllowed(route, role){
  const item = NAV_ITEMS.find(n=>n.hash===route);
  return item ? item.roles.includes(role) : false;
}
function defaultRouteForRole(role){
  return ({admin:'dashboard', loket:'beranda', dokter:'beranda', farmasi:'beranda', kasir:'beranda', lab:'beranda'})[role] || 'cek-antrian';
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

  const installBtn = document.getElementById('btn-install');
  if(installPromptEvent && installBtn) installBtn.classList.remove('hidden');
  if(installBtn) installBtn.addEventListener('click', doInstallPrompt);
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
  const list = [['admin','Admin'],['loket','Loket'],['dokter.umum','Dr. Umum'],['dokter.anak','Dr. Anak'],
    ['dokter.gigi','Dr. Gigi'],['dokter.jantung','Dr. Jantung'],['lab','Lab'],['farmasi','Farmasi'],['kasir','Kasir']];
  return list.map(([uname,label])=>{
    const u = Store.data.users.find(x=>x.username===uname);
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
  setPageTitle('Dashboard');
  const today = todayStr();
  const visits = visitsToday();
  const totalPendapatan = Store.data.transactions.filter(t=>todayStr(new Date(t.createdAt))===today).reduce((s,t)=>s+t.total,0);
  const obatMenipis = Store.data.medicines.filter(m=>m.stok < LOW_STOCK_THRESHOLD);
  const selesai = visits.filter(v=>v.status==='selesai').length;
  const bookingHariIni = Store.data.bookings.filter(b=>b.tanggalKontrol===today);
  const perPoli = Store.data.poli.map(p=>({poli:p, count: visits.filter(v=>v.poliId===p.id).length}));
  const maxCount = Math.max(1, ...perPoli.map(p=>p.count));

  document.getElementById('main-content').innerHTML =
    pageIntro('Ringkasan operasional hari ini, '+formatTanggalIndo(today)+'.')+
    '<div class="action-grid">'+
      '<div class="action-card" data-nav="pendaftaran"><span class="ic">📝</span><span class="lbl">Pendaftaran</span></div>'+
      '<div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Poli</span></div>'+
      '<div class="action-card" data-action="global-search"><span class="ic">🔍</span><span class="lbl">Cari Pasien</span></div>'+
      '<div class="action-card" data-nav="master-data"><span class="ic">⚙️</span><span class="lbl">Master Data</span></div>'+
    '</div>'+
    '<div class="grid grid-4">'+
      statCard('Pasien Hari Ini', visits.length, 'kunjungan tercatat')+
      statCard('Pendapatan Hari Ini', formatRupiah(totalPendapatan), 'dari transaksi selesai')+
      statCard('Kunjungan Selesai', selesai, 'dari total '+visits.length)+
      statCard('Obat Menipis', obatMenipis.length, 'perlu restock segera')+
      statCard('Booking Terjadwal', bookingHariIni.length, 'kontrol hari ini (BPJS &amp; umum)')+
    '</div>'+
    '<div class="grid grid-2">'+
      '<div class="panel"><div class="panel-head"><h2>Pasien per Poli (Hari Ini)</h2></div><div class="panel-body">'+
        (perPoli.every(p=>p.count===0) ? '<div class="empty"><div class="big">—</div>Belum ada kunjungan hari ini</div>' :
        perPoli.map(p=>barRow(p.poli.nama, p.count, maxCount, poliColor(p.poli.id))).join(''))+
      '</div></div>'+
      '<div class="panel"><div class="panel-head"><h2>Stok Obat Menipis</h2></div><div class="panel-body">'+
        (obatMenipis.length===0 ? '<div class="empty"><div class="big">✓</div>Semua stok obat aman</div>' :
        '<div class="table-wrap"><table><thead><tr><th>Obat</th><th>Sisa Stok</th><th>Satuan</th></tr></thead><tbody>'+
        obatMenipis.map(m=>'<tr><td>'+esc(m.nama)+'</td><td class="mono" style="color:var(--brick);font-weight:700">'+m.stok+'</td><td>'+esc(m.satuan)+'</td></tr>').join('')+
        '</tbody></table></div>')+
      '</div></div>'+
    '</div>'+
    '<div class="panel"><div class="panel-head"><h2>Antrian Hari Ini — Semua Poli</h2></div><div class="panel-body">'+renderAntrianTable(visits)+'</div></div>';
  bindBerandaActionEvents();
}

/* =================================================================
   MODULE: BERANDA (ringkasan personal per peran + aksi cepat)
   ================================================================= */
function greetingWaktu(){
  const h = new Date().getHours();
  if(h<11) return 'Selamat pagi';
  if(h<15) return 'Selamat siang';
  if(h<18) return 'Selamat sore';
  return 'Selamat malam';
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
  let html = '<div class="grid grid-3">'+
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
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Cek Antrian</span></div>'+
    '</div>';
  return html;
}
function berandaFarmasi(){
  const visits = visitsToday();
  const stokMenipis = Store.data.medicines.filter(m=>m.stok<LOW_STOCK_THRESHOLD).length;
  return '<div class="grid grid-3">'+
      statCard('Resep Menunggu', visits.filter(v=>v.status==='menunggu_farmasi').length, 'perlu disiapkan')+
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
  return '<div class="grid grid-3">'+
      statCard('Menunggu Bayar', visitsToday().filter(v=>v.status==='menunggu_bayar').length, 'tagihan aktif')+
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
function renderBookingJknTab(){
  bookingSearchPatientId = null;
  document.getElementById('booking-tab-area').innerHTML =
    '<div class="alert alert-info">Di lingkungan produksi, data ini akan masuk otomatis lewat API Antrean Online BPJS Kesehatan saat pasien booking dari aplikasi Mobile JKN. Form ini mensimulasikan data yang diterima dari sana untuk keperluan uji alur.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Simulasi Booking Masuk — BPJS / JKN Mobile</h2></div><div class="panel-body">'+bookingFormHtml('BPJS')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Booking BPJS Terjadwal</h2></div><div class="panel-body" id="bk-list-area">'+renderBookingListHtml('BPJS')+'</div></div>';
  bindBookingFormEvents('BPJS');
}
function renderBookingUmumTab(){
  bookingSearchPatientId = null;
  document.getElementById('booking-tab-area').innerHTML =
    '<div class="alert alert-info">Booking mandiri untuk pasien umum, maksimal 3 hari sebelum tanggal kunjungan. Nomor antrian melanjutkan urutan yang sama dengan booking BPJS pada poli &amp; tanggal yang sama — bukan antrian terpisah.</div>'+
    '<div class="panel"><div class="panel-head"><h2>Buat Booking — Pasien Umum</h2></div><div class="panel-body">'+bookingFormHtml('Umum')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Booking Umum Terjadwal</h2></div><div class="panel-body" id="bk-list-area">'+renderBookingListHtml('Umum')+'</div></div>';
  bindBookingFormEvents('Umum');
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
  const noAntrian = generateNoAntrian(poliId, tanggalKontrol);
  const booking = {
    id: uid('BK'), patientId: bookingSearchPatientId, poliId, tanggalKontrol, jenisBayar,
    sumber: jenisBayar==='BPJS' ? 'JKN Mobile (Simulasi)' : 'Aplikasi RS',
    noBpjs, noAntrian, kodeCheckIn: uid('CHK').toUpperCase(), status:'terjadwal', visitId:null,
    reminded:false, remindedAt:null, createdAt: nowISO()
  };
  Store.data.bookings.push(booking);
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
  const list = Store.data.bookings.filter(b=>b.jenisBayar===jenisBayar).sort((a,b)=> b.tanggalKontrol.localeCompare(a.tanggalKontrol) || a.noAntrian.localeCompare(b.noAntrian));
  if(list.length===0) return '<div class="empty">Belum ada booking.</div>';
  return '<div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Poli</th><th>Tanggal Kontrol</th><th>Kode</th><th>Status</th></tr></thead><tbody>'+
    list.map(b=>{ const p=getPatient(b.patientId), poli=getPoli(b.poliId);
      return '<tr><td class="mono" style="font-weight:700">'+b.noAntrian+'</td><td>'+esc(p.nama)+'</td><td>'+esc(poli.nama)+'</td>'+
        '<td>'+formatTanggalIndo(b.tanggalKontrol)+'</td><td class="mono">'+b.kodeCheckIn+'</td><td>'+badgeStatus(b.status)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
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
      '</div></div>';
  }).join('');
  el.querySelectorAll('[data-checkin]').forEach(btn=> btn.addEventListener('click', ()=> doCheckIn(btn.dataset.checkin)));
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
      '<div style="margin-top:16px"><button type="submit" class="btn btn-primary">Simpan &amp; Selesai Periksa</button></div>'+
      '</form>'+
    '</div></div>';

  document.getElementById('btn-lihat-riwayat').addEventListener('click', ()=> openRiwayatModal(patient.id));
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
    const resep = {id:uid('RSP'), visitId:visit.id, items:[...poliState.resepItems], status:'menunggu', createdAt:nowISO()};
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
  setPageTitle('Farmasi');
  farmasiTab = 'resep';
  document.getElementById('main-content').innerHTML =
    pageIntro('Kelola resep masuk dari seluruh poli, siapkan obat, serahkan ke pasien, dan pantau stok.')+
    '<div class="tabs"><button class="tab active" data-ftab="resep">Antrian Resep</button>'+
    '<button class="tab" data-ftab="siap">Obat Siap Diambil</button>'+
    '<button class="tab" data-ftab="stok">Stok Obat</button></div>'+
    '<div id="farmasi-tab-area"></div>';
  document.querySelectorAll('[data-ftab]').forEach(t=> t.addEventListener('click', ()=> switchFarmasiTab(t.dataset.ftab)));
  renderFarmasiResepTab();
}
function switchFarmasiTab(tab){
  farmasiTab = tab;
  document.querySelectorAll('[data-ftab]').forEach(t=> t.classList.toggle('active', t.dataset.ftab===tab));
  if(tab==='resep') renderFarmasiResepTab(); else if(tab==='siap') renderFarmasiSiapTab(); else renderFarmasiStokTab();
}
function renderFarmasiResepTab(){
  const list = visitsToday().filter(v=>v.status==='menunggu_farmasi').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
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
  visit.billing.obat = totalObat;
  visit.status = 'menunggu_bayar';
  visit.updatedAt = nowISO();
  Store.save();
  logAudit('obat_disiapkan', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast('Obat disiapkan — pasien diarahkan ke kasir', 'success');
  renderFarmasiResepTab();
}
function renderFarmasiSiapTab(){
  const list = visitsToday().filter(v=>v.status==='obat_siap').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
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
  setPageTitle('Kasir');
  kasirTab = 'bayar';
  document.getElementById('main-content').innerHTML =
    pageIntro('Proses pembayaran kunjungan pasien dan lihat riwayat transaksi.')+
    '<div class="tabs"><button class="tab active" data-ktab="bayar">Menunggu Pembayaran</button><button class="tab" data-ktab="riwayat">Riwayat Transaksi</button></div>'+
    '<div id="kasir-tab-area"></div>';
  document.querySelectorAll('[data-ktab]').forEach(t=> t.addEventListener('click', ()=> switchKasirTab(t.dataset.ktab)));
  renderKasirBayarTab();
}
function switchKasirTab(tab){
  kasirTab = tab;
  document.querySelectorAll('[data-ktab]').forEach(t=> t.classList.toggle('active', t.dataset.ktab===tab));
  if(tab==='bayar') renderKasirBayarTab(); else renderKasirRiwayatTab();
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
  const list = visitsToday().filter(v=>v.status==='menunggu_bayar').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
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
function openInvoiceModal(trxId){
  const trx = Store.data.transactions.find(t=>t.id===trxId);
  const visit = getVisit(trx.visitId), p = getPatient(visit.patientId);
  const bodyHtml = '<div id="invoice-content"><h3 style="text-align:center">RSU SEHAT SENTOSA</h3><p style="text-align:center;color:var(--ink-soft);font-size:13px">Kwitansi Pembayaran</p><hr>'+
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
    '<div class="table-wrap"><table><thead><tr><th>No. Transaksi</th><th>Pasien</th><th>Jam</th><th>Metode</th><th>Total</th><th></th></tr></thead><tbody>'+
    trxToday.map(t=>{ const visit = getVisit(t.visitId), p = getPatient(visit.patientId);
      return '<tr><td class="mono">'+t.id+'</td><td>'+esc(p.nama)+'</td><td class="mono">'+formatJam(t.createdAt)+'</td><td>'+esc(t.metode)+'</td>'+
        '<td class="mono">'+formatRupiah(t.total)+'</td><td><button class="btn btn-ghost btn-sm" data-lihat-invoice="'+t.id+'">Lihat</button></td></tr>'; }).join('')+
    '</tbody></table></div>')+'</div></div>';
  area.querySelectorAll('[data-lihat-invoice]').forEach(btn=> btn.addEventListener('click', ()=> openInvoiceModal(btn.dataset.lihatInvoice)));
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
    pageIntro('Kelola data induk rumah sakit: daftar poli, staf pengguna sistem, dan log aktivitas.')+
    '<div class="tabs"><button class="tab active" data-mtab="poli">Poli</button><button class="tab" data-mtab="staff">Staf &amp; Pengguna</button>'+
    '<button class="tab" data-mtab="log">Log Aktivitas</button></div>'+
    '<div id="master-tab-area"></div>';
  document.querySelectorAll('[data-mtab]').forEach(t=> t.addEventListener('click', ()=> switchMasterTab(t.dataset.mtab)));
  renderMasterPoliTab();
}
function switchMasterTab(tab){
  masterTab = tab;
  document.querySelectorAll('[data-mtab]').forEach(t=> t.classList.toggle('active', t.dataset.mtab===tab));
  if(tab==='poli') renderMasterPoliTab(); else if(tab==='staff') renderMasterStaffTab(); else renderMasterLogTab();
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
    '<div class="kiosk-grid" id="cek-antrian-grid"></div>';
  document.getElementById('btn-kiosk').addEventListener('click', toggleKioskMode);
  document.getElementById('btn-refresh-antrian').addEventListener('click', renderCekAntrianGrid);
  renderCekAntrianGrid();
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
   INIT / PWA BOOTSTRAP
   ================================================================= */
MODULE_RENDERERS['dashboard'] = renderDashboard;
MODULE_RENDERERS['beranda'] = renderBeranda;
MODULE_RENDERERS['pendaftaran'] = renderPendaftaran;
MODULE_RENDERERS['booking'] = renderBooking;
MODULE_RENDERERS['poli'] = renderPoli;
MODULE_RENDERERS['lab'] = renderLab;
MODULE_RENDERERS['farmasi'] = renderFarmasi;
MODULE_RENDERERS['kasir'] = renderKasir;
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
