"use strict";
/* =================================================================
   SIMRS PROTOTYPE — konstanta, util, seed data, penyimpanan (Store)
   ================================================================= */
const BIAYA_REGISTRASI = 10000;
const BIAYA_LAB = 75000;
const LOW_STOCK_THRESHOLD = 15;
const PROTOTYPE_VERSION = 'v15.8.2';
const PROTOTYPE_NAME = 'SIMRS PROTOTYPE';
const PROTOTYPE_MODE = 'Portfolio / Demo';
const QUEUE_JOURNEY = [
  {key:'terjadwal',label:'Booking dibuat',icon:'📅'},
  {key:'checked_in',label:'Sudah check-in',icon:'✓'},
  {key:'menunggu_screening',label:'Menunggu verifikasi',icon:'🩺'},
  {key:'menunggu_dokter',label:'Menunggu dipanggil',icon:'⏳'},
  {key:'dipanggil',label:'Dipanggil',icon:'🔔'},
  {key:'diperiksa',label:'Sedang dilayani',icon:'👨‍⚕️'},
  {key:'selesai',label:'Pelayanan selesai',icon:'✓'}
];


const INPATIENT_BED_STATUS = {
  kosong:{label:'Kosong',cls:'badge-sage'},
  terisi:{label:'Terisi',cls:'badge-brick'},
  dipesan:{label:'Dipesan',cls:'badge-amber'},
  persiapan:{label:'Persiapan / dibersihkan',cls:'badge-amber'},
  perbaikan:{label:'Perbaikan',cls:'badge-slate'}
};
const INPATIENT_JOURNEY = [
  {key:'admission',label:'Admisi',icon:'🏥'},
  {key:'bed',label:'Bed / Kamar',icon:'🛏️'},
  {key:'perawatan',label:'Perawatan',icon:'🩺'},
  {key:'penunjang',label:'Penunjang',icon:'🔬'},
  {key:'farmasi',label:'Farmasi',icon:'💊'},
  {key:'discharge',label:'Pulang',icon:'📋'},
  {key:'billing',label:'Kasir',icon:'🧾'},
  {key:'selesai',label:'Selesai',icon:'✓'}
];
const INPATIENT_SHIFTS = [
  {id:'PAGI',label:'Shift Pagi',jamMulai:'06:00',jamSelesai:'14:00',start:6,end:14},
  {id:'SORE',label:'Shift Sore',jamMulai:'14:00',jamSelesai:'22:00',start:14,end:22},
  {id:'MALAM',label:'Shift Malam',jamMulai:'22:00',jamSelesai:'06:00',start:22,end:6}
];
function currentInpatientShift(date){
  const h=(date||new Date()).getHours();
  return INPATIENT_SHIFTS.find(function(x){return x.id==='MALAM'? (h>=22||h<6) : (h>=x.start&&h<x.end);}) || INPATIENT_SHIFTS[0];
}
function inpatientDutyAccounts(wardId){
  const shift=currentInpatientShift();
  const doctors={PAGI:'U-RI-DOK-JAGA-PAGI',SORE:'U-RI-DOK-JAGA-SORE',MALAM:'U-RI-DOK-JAGA-MALAM'};
  const nurses={PAGI:'U-RI-PWT-PAGI',SORE:'U-RI-PWT-SORE',MALAM:'U-RI-PWT-MALAM'};
  const ward=(Store.data&&Store.data.wards||[]).find(function(w){return w.id===wardId;});
  const staffing=ward&&ward.shiftAssignments&&ward.shiftAssignments[shift.id];
  const account=(Store.data&&Store.data.users||[]).find(function(u){return u.role==='perawat_ranap'&&u.wardId===wardId&&u.shiftId===shift.id;});
  return {shift:staffing?Object.assign({},shift,{jamMulai:staffing.jamMulai,jamSelesai:staffing.jamSelesai,leaderName:staffing.ketuaShift}):shift,doctorUserId:doctors[shift.id],nurseUserId:wardId?(account?account.id:null):nurses[shift.id],staffing:staffing};
}
function getCurrentInpatientDuty(wardId){
  const d=inpatientDutyAccounts(wardId);
  const configured=d.staffing;
  const account=getUserById(d.nurseUserId);
  const nurse=account||(configured?{id:null,nama:(configured.perawat||[])[0]||configured.ketuaShift}:null);
  const doctor=getUserById(d.doctorUserId);
  return {shift:d.shift,doctor:doctor,nurse:nurse,shiftLeader:configured?configured.ketuaShift:(account&&account.isShiftLeader?account.nama:null),nurseNames:configured?configured.perawat:[]};
}

function inpatientLocationLabel(ward,bed){
  ward=ward||{};bed=bed||{};
  return [ward.buildingName||'Gedung belum ditetapkan',ward.floorName||(ward.floorNumber?'Lantai '+ward.floorNumber:''),ward.nama||'Ruang belum ditetapkan','Kamar '+(bed.noKamar||'-'),bed.bedLabel||('Bed '+(bed.noBed||'-'))].filter(Boolean).join(' · ');
}
function inpatientJourneyForAdmission(a){
  const orders=Array.isArray(a.orders)?a.orders:[];
  const hasLab=orders.some(function(o){return o.jenis==='lab';});
  const hasRad=orders.some(function(o){return o.jenis==='radiologi';});
  const hasRx=Array.isArray(Store.data.prescriptions) && Store.data.prescriptions.some(function(r){return r.admissionId===a.id;});
  const source=a.sumberAdmisi||'Admisi';
  const sourceLabel=source==='IGD'?'IGD → Rawat Inap':source==='Rawat Jalan'?'Rawat Jalan → Admisi → Rawat Inap':source==='Rujukan'?'Rujukan → Admisi → Rawat Inap':'Transfer → Rawat Inap';
  const steps=[{key:'admission',label:'Admisi',sub:sourceLabel,icon:'🏥'},{key:'bed',label:'Bed / Kamar',icon:'🛏️'},{key:'perawatan',label:'Perawatan',icon:'🩺'}];
  if(hasLab) steps.push({key:'lab',label:'Laboratorium',icon:'🧪'});
  if(hasRad) steps.push({key:'radiologi',label:'Radiologi',icon:'☢️'});
  if(hasRx) steps.push({key:'farmasi',label:'Farmasi',icon:'💊'});
  steps.push({key:'discharge',label:'Pulang',icon:'📋'},{key:'billing',label:'Kasir',icon:'🧾'},{key:'selesai',label:'Selesai',icon:'✓'});
  return steps;
}

const POLI_COLOR = {UMU:'clinical', GIG:'slate', ANA:'sage', KDG:'plum', MAT:'amber', THT:'brick', JAN:'brick', KUL:'plum', PDL:'slate', SYA:'plum', PAR:'sage'};

function poliColor(id){ return POLI_COLOR[id] || 'clinical'; }


/* ================================================================
   KATALOG LAYANAN SIMRS PROTOTYPE — sumber nama layanan publik
   Dashboard memakai ID yang stabil; detail lantai/ruang tidak diasumsikan.
   ================================================================ */
const OFFICIAL_POLI_CATALOG = [
  ['RJ-UMU','Poli Umum','Rawat Jalan'],
  ['SP-GCU','Klinik General Check Up','Poliklinik Spesialis'],['SP-BPL','Klinik Bedah Plastik','Poliklinik Spesialis'],['SP-BUM','Klinik Bedah Umum','Poliklinik Spesialis'],['SP-BUR','Klinik Bedah Urologi','Poliklinik Spesialis'],['SP-BSR','Klinik Bedah Saraf','Poliklinik Spesialis'],['SP-BOR','Klinik Bedah Orthopedi','Poliklinik Spesialis'],['SP-BDI','Klinik Bedah Digestif','Poliklinik Spesialis'],['SP-PDL','Klinik Penyakit Dalam','Poliklinik Spesialis'],['SP-GER','Klinik Geriatri','Poliklinik Spesialis'],['SP-END','Klinik Endoskopi','Poliklinik Spesialis'],['SP-JAN','Klinik Jantung','Poliklinik Spesialis'],['SP-SAR','Klinik Saraf','Poliklinik Spesialis'],['SP-PAR','Klinik Paru','Poliklinik Spesialis'],['SP-HKB','Klinik Hamil/KB','Poliklinik Spesialis'],['SP-KDG','Klinik Kandungan','Poliklinik Spesialis'],['SP-AND','Klinik Andrologi','Poliklinik Spesialis'],['SP-PSI','Klinik Psikologi','Poliklinik Spesialis'],['SP-PSK','Klinik Psikiatri','Poliklinik Spesialis'],['SP-REH','Klinik Rehabilitasi Medik','Poliklinik Spesialis'],['SP-ANA','Klinik Anak','Poliklinik Spesialis'],['SP-TBK','Klinik Tumbuh Kembang','Poliklinik Spesialis'],['SP-GIG','Klinik Gigi dan Mulut','Poliklinik Spesialis'],['SP-THT','Klinik THT','Poliklinik Spesialis'],['SP-MAT','Klinik Mata','Poliklinik Spesialis'],['SP-KUL','Klinik Kulit dan Kelamin','Poliklinik Spesialis'],['SP-MRV','Klinik Mawar Merah/VCT','Poliklinik Spesialis'],['SP-GIZ','Klinik Gizi','Poliklinik Spesialis'],['SP-HOM','Pelayanan Homecare','Poliklinik Spesialis'],
  ['EX-EST','Klinik Estetika','Poliklinik Eksekutif'],['EX-KUL','Klinik Kulit dan Kelamin','Poliklinik Eksekutif'],['EX-BUM','Klinik Bedah Umum','Poliklinik Eksekutif'],['EX-BUR','Klinik Bedah Urologi','Poliklinik Eksekutif'],['EX-BSR','Klinik Bedah Saraf','Poliklinik Eksekutif'],['EX-BOR','Klinik Bedah Orthopedi','Poliklinik Eksekutif'],['EX-BDI','Klinik Bedah Digestif','Poliklinik Eksekutif'],['EX-BTKV','Klinik Bedah TKV','Poliklinik Eksekutif'],['EX-BONK','Klinik Bedah Onkologi','Poliklinik Eksekutif'],['EX-PDL','Klinik Penyakit Dalam','Poliklinik Eksekutif'],['EX-AKU','Klinik Akupuntur','Poliklinik Eksekutif'],['EX-JAN','Klinik Jantung','Poliklinik Eksekutif'],['EX-SAR','Klinik Saraf','Poliklinik Eksekutif'],['EX-PAR','Klinik Paru','Poliklinik Eksekutif'],['EX-HKB','Klinik Hamil/KB','Poliklinik Eksekutif'],['EX-KDG','Klinik Kandungan','Poliklinik Eksekutif'],['EX-AND','Klinik Andrologi','Poliklinik Eksekutif'],['EX-PSI','Klinik Psikologi','Poliklinik Eksekutif'],['EX-PSK','Klinik Psikiatri','Poliklinik Eksekutif'],['EX-REH','Klinik Rehabilitasi Medik','Poliklinik Eksekutif'],['EX-ANA','Klinik Anak','Poliklinik Eksekutif'],['EX-TBK','Klinik Tumbuh Kembang','Poliklinik Eksekutif'],['EX-GIG','Klinik Gigi dan Mulut','Poliklinik Eksekutif'],['EX-THT','Klinik THT','Poliklinik Eksekutif'],['EX-MAT','Klinik Mata','Poliklinik Eksekutif'],['EX-GIZ','Klinik Gizi','Poliklinik Eksekutif'],['EX-RAD','Klinik Radioterapi','Poliklinik Eksekutif']
];

const PROTOTYPE_FACILITY_STRUCTURE = [
  {id:'GED-RAWAT-JALAN',type:'gedung',nama:'Pelayanan Rawat Jalan',parentId:null,source:'baseline-prototype'},
  {id:'UNIT-POLI-SPESIALIS',type:'unit',nama:'Poliklinik Spesialis',parentId:'GED-RAWAT-JALAN',source:'baseline-prototype'},
  {id:'UNIT-POLI-EKSEKUTIF',type:'unit',nama:'Poliklinik Eksekutif',parentId:'GED-RAWAT-JALAN',source:'baseline-prototype'},
  {id:'GED-IGD',type:'unit',nama:'Instalasi Gawat Darurat (IGD)',parentId:null,source:'baseline-prototype'},
  {id:'IGD-ZONA-MERAH',type:'zona',nama:'Zona Merah',parentId:'GED-IGD',source:'baseline-prototype'},
  {id:'IGD-ZONA-KUNING',type:'zona',nama:'Zona Kuning',parentId:'GED-IGD',source:'baseline-prototype'},
  {id:'GED-RAWAT-INAP',type:'gedung',nama:'Pelayanan Rawat Inap',parentId:null,source:'baseline-prototype'},
  {id:'RI-TULIP',type:'unit',nama:'Rawat Inap Tulip',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-TERATAI',type:'unit',nama:'Rawat Inap Teratai',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-MAWAR-KUNING',type:'unit',nama:'Rawat Inap Mawar Kuning',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-MAWAR-MP',type:'unit',nama:'Rawat Inap Mawar Merah Putih',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-GDH',type:'unit',nama:'Rawat Inap Graha Delta Husada',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-INTENSIF',type:'unit',nama:'Rawat Intensif Terpadu',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'RI-ICU',type:'unit',nama:'ICU',parentId:'RI-INTENSIF',source:'baseline-prototype'},
  {id:'RI-ICCU',type:'unit',nama:'ICCU',parentId:'RI-INTENSIF',source:'baseline-prototype'},
  {id:'RI-PICU',type:'unit',nama:'PICU',parentId:'RI-INTENSIF',source:'baseline-prototype'},
  {id:'RI-NICU',type:'unit',nama:'NICU',parentId:'RI-INTENSIF',source:'baseline-prototype'},
  {id:'RI-HCU',type:'unit',nama:'HCU',parentId:'RI-INTENSIF',source:'baseline-prototype'},
  {id:'RI-BERSALIN',type:'unit',nama:'Ruang Bersalin',parentId:'GED-RAWAT-INAP',source:'baseline-prototype'},
  {id:'FAR-RAJAL',type:'unit',nama:'Farmasi Rawat Jalan',parentId:null,source:'baseline-prototype'},
  {id:'FAR-RANAP',type:'unit',nama:'Farmasi Rawat Inap',parentId:null,source:'baseline-prototype'},
  {id:'LAB-PK',type:'unit',nama:'Laboratorium Patologi Klinik',parentId:null,source:'baseline-prototype'},
  {id:'LAB-PA',type:'unit',nama:'Laboratorium Patologi Anatomi',parentId:null,source:'baseline-prototype'},
  {id:'LAB-MIKRO',type:'unit',nama:'Laboratorium Mikrobiologi Klinik dan Biomolekuler',parentId:null,source:'baseline-prototype'},
  {id:'RAD',type:'unit',nama:'Radiologi',parentId:null,source:'baseline-prototype'},
  {id:'IPKT',type:'unit',nama:'Instalasi Pelayanan Kanker Terpadu (IPKT)',parentId:null,source:'baseline-prototype'},
  {id:'HD',type:'unit',nama:'Hemodialisis',parentId:null,source:'baseline-prototype'},
  {id:'KARDIO',type:'unit',nama:'Diagnostik dan Intervensi Kardiovaskuler',parentId:null,source:'baseline-prototype'},
  {id:'CSSD',type:'unit',nama:'Sterilisasi Sentral',parentId:null,source:'baseline-prototype'}
];


/* ================================================================
   MASTER DOKTER & JADWAL PROTOTYPE V13.8
   Data baseline demo dipakai sebagai contoh dan SELALU editable Admin.
   Status sumber sengaja diberi needs_confirmation karena data baseline
   sendiri menandai sebagian data dokter sebagai "Data Belum Diperbarui".
   ================================================================ */
const OFFICIAL_DOCTOR_MASTER = [
  {id:'DOC-ANGELA',nama:'dr. ANGELA BETY RATNASARI, Sp.JP',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
  {id:'DOC-ADITYA-UMUM',nama:'dr. ADITYA BALADIKA',spesialis:'Dokter Umum',poliIds:['RJ-UMU'],status:'needs_confirmation'},
  {id:'DOC-ARIEF',nama:'dr. ARIEF BOWO KURNIAWAN Sp.JP (K)',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
  {id:'DOC-SANY',nama:'dr. SANY RAHMAWANSA SISWARDANA, M Biomed., Sp.JP.,(K) FIHA',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
  {id:'DOC-RADITYA',nama:'dr. RADITYA RIZKI MUHAMMAD, Sp.JP',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
  {id:'DOC-UMIRA',nama:'dr. UMIRA, Sp.JP (K)',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
  {id:'DOC-FARIZ',nama:'dr. AKHMAD FARIZ NURDIANSYAH, Sp.PD',spesialis:'Penyakit Dalam',poliIds:['SP-PDL','EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-JOHANNES',nama:'dr. JOHANNES VINCENTIUS LUSIDA, Sp.PD',spesialis:'Penyakit Dalam',poliIds:['SP-PDL','EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-DAVIQ',nama:'dr. MOCHAMMAD DAVIQ, Sp.PD',spesialis:'Penyakit Dalam',poliIds:['SP-PDL','EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-PUGUH',nama:'dr. PUGUH WIDAGDO, Sp.PD',spesialis:'Penyakit Dalam',poliIds:['SP-PDL','EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-RIDWAN',nama:'dr. RIDWAN PRASETYO, Sp.PD',spesialis:'Penyakit Dalam',poliIds:['SP-PDL','EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-ADE',nama:'dr. RR. ADE RATNA AYU VITARIANI, Sp.A',spesialis:'Anak',poliIds:['SP-ANA','EX-ANA'],status:'needs_confirmation'},
  {id:'DOC-YUSTINA',nama:'dr. YUSTINA ROSANTI, Sp.A',spesialis:'Anak',poliIds:['SP-ANA','EX-ANA'],status:'needs_confirmation'},
  {id:'DOC-FITA',nama:'dr. FITA SOFIYAH., Sp. A',spesialis:'Anak',poliIds:['SP-ANA','EX-ANA'],status:'needs_confirmation'},
  {id:'DOC-BARNABAS',nama:'drg. BARNABAS HOWUK HANO BONARDO SIBARANI, Sp.KGA',spesialis:'Kedokteran Gigi Anak',poliIds:['SP-GIG','EX-GIG'],status:'needs_confirmation'},
  {id:'DOC-SHINTA',nama:'dr. SHINTA ARTA WIGUNA, Sp.M, M.Ked. Klin.',spesialis:'Mata',poliIds:['SP-MAT','EX-MAT'],status:'needs_confirmation'},
  {id:'DOC-AGNES',nama:'dr. AGNES WINDYASARI, Sp.T.H.T.B.K.L',spesialis:'THT',poliIds:['SP-THT','EX-THT'],status:'needs_confirmation'},
  {id:'DOC-PUJI',nama:'dr. PUJI KURNIAWAN, Sp.THT-KL',spesialis:'THT',poliIds:['SP-THT','EX-THT'],status:'needs_confirmation'},
  {id:'DOC-REZA',nama:'dr. REZA RAHMAN RAMADHANI, Sp.OT (K) Hip & Knee',spesialis:'Bedah Orthopedi dan Traumatologi',poliIds:['SP-BOR','EX-BOR'],status:'needs_confirmation'},
  {id:'DOC-ERFAN',nama:'dr. ERFAN NASRULLAH, Sp.OT., M.Ked.Klin',spesialis:'Bedah Orthopedi dan Traumatologi',poliIds:['SP-BOR','EX-BOR'],status:'needs_confirmation'},
  {id:'DOC-FARMI',nama:'dr. FAHMI MUHAMMAD, Sp.B',spesialis:'Bedah',poliIds:['SP-BUM','EX-BUM'],status:'needs_confirmation'},
  {id:'DOC-PRIJONO',nama:'dr. R. PRIJONO WIBOWO, Sp.OG (K)',spesialis:'Obstetri & Ginekologi',poliIds:['SP-HKB','SP-KDG','EX-KDG'],status:'needs_confirmation'},
  {id:'DOC-ANAOG',nama:'dr. ANA PUJI RAHAYU, Sp.OG.,M.Ked.Klin.',spesialis:'Obstetri & Ginekologi',poliIds:['EX-KDG'],status:'needs_confirmation'},
  {id:'DOC-ANDIVA',nama:'dr. ANDIVA SATRIO RINALDI, Sp.N., FINA',spesialis:'Saraf',poliIds:['SP-SAR','EX-SAR'],status:'needs_confirmation'},
  {id:'DOC-SARI',nama:'dr. SARI MANDAYANI, Sp.P',spesialis:'Pulmonologi (Paru)',poliIds:['SP-PAR','EX-PAR'],status:'needs_confirmation'},
  {id:'DOC-YOHANA',nama:'dr. YOHANA AVILLA DESTALIA, Sp.KJ',spesialis:'Kedokteran Jiwa/Psikiatri',poliIds:['SP-PSK','EX-PSK'],status:'needs_confirmation'},
  {id:'DOC-DIAN',nama:'Dr. dr. DIAN SAMUDRA, Sp.PD - KGH',spesialis:'Penyakit Dalam / Ginjal Hipertensi',poliIds:['EX-PDL'],status:'needs_confirmation'},
  {id:'DOC-ADITYA-URO',nama:'dr. ADITYA PRAMANTA, Sp.U.',spesialis:'Urologi',poliIds:['SP-BUR','EX-BUR'],status:'needs_confirmation'},
  {id:'DOC-ADITYA-ONK',nama:'dr. ADITYA HERLAMBANG, Sp.OG., Subsp.Onk., M.Ked.Klin',spesialis:'Ginekologi Onkologi',poliIds:['EX-EST'],status:'needs_confirmation'},
  {id:'DOC-ANDOHARMAN',nama:'dr. Andoharman Damanik, Sp.OG (K)',spesialis:'Obstetri & Ginekologi',poliIds:['SP-HKB','SP-KDG','EX-KDG'],status:'needs_confirmation'},
  {id:'DOC-ANDRE-ONK',nama:'dr. ANDRE KURNIAWAN NUR HUDA, SpB.Subsp.Onk.(K)FINACS',spesialis:'Bedah Onkologi',poliIds:['EX-BONK'],status:'needs_confirmation'},
  {id:'DOC-ARIEK',nama:'dr. ARIEK DESNANTIKA, Sp.BP-RE',spesialis:'Bedah Plastik Rekonstruksi dan Estetik',poliIds:['SP-BPL','EX-EST'],status:'needs_confirmation'}
];
const OFFICIAL_SCHEDULE_SEED = [
  ['SCH-A1','DOC-ANGELA','SP-JAN',1,'11:00','14:00'],['SCH-A2','DOC-ANGELA','SP-JAN',2,'08:00','11:00'],['SCH-A3','DOC-ANGELA','SP-JAN',3,'08:00','11:00'],['SCH-A4','DOC-ANGELA','SP-JAN',4,'11:00','14:00'],['SCH-A5','DOC-ANGELA','SP-JAN',5,'10:00','11:00'],
  ['SCH-AE1','DOC-ANGELA','EX-JAN',1,'08:30','10:00'],['SCH-AE2','DOC-ANGELA','EX-JAN',2,'11:00','13:00'],['SCH-AE3','DOC-ANGELA','EX-JAN',3,'11:30','13:00'],['SCH-AE4','DOC-ANGELA','EX-JAN',4,'08:30','10:00'],['SCH-AE5','DOC-ANGELA','EX-JAN',5,'13:00','14:00'],['SCH-AE6','DOC-ANGELA','EX-JAN',6,'11:00','13:00'],['SCH-AE7','DOC-ANGELA','EX-JAN',1,'18:00','19:00'],
  ['SCH-AR1','DOC-ARIEF','SP-JAN',2,'08:00','11:00'],['SCH-AR2','DOC-ARIEF','SP-JAN',4,'08:00','11:00'],['SCH-AR3','DOC-ARIEF','SP-JAN',5,'08:00','11:00'],['SCH-AR4','DOC-ARIEF','SP-JAN',6,'11:00','12:30'],['SCH-ARE1','DOC-ARIEF','EX-JAN',1,'09:00','10:00'],['SCH-ARE2','DOC-ARIEF','EX-JAN',3,'09:00','10:00'],['SCH-ARE3','DOC-ARIEF','EX-JAN',4,'16:00','17:00'],['SCH-ARE4','DOC-ARIEF','EX-JAN',6,'09:00','10:00'],
  ['SCH-S1','DOC-SANY','SP-JAN',1,'10:00','13:00'],['SCH-S2','DOC-SANY','SP-JAN',3,'08:00','12:00'],['SCH-S3','DOC-SANY','SP-JAN',4,'08:00','11:00'],['SCH-SE1','DOC-SANY','EX-JAN',2,'08:30','09:30'],['SCH-SE2','DOC-SANY','EX-JAN',3,'11:00','12:00'],['SCH-SE3','DOC-SANY','EX-JAN',6,'10:30','11:30'],
  ['SCH-RD1','DOC-RADITYA','SP-JAN',2,'11:00','14:00'],['SCH-RD2','DOC-RADITYA','SP-JAN',4,'11:00','14:00'],['SCH-RD3','DOC-RADITYA','SP-JAN',5,'08:00','11:00'],['SCH-RD4','DOC-RADITYA','SP-JAN',6,'08:00','11:00'],['SCH-RDE1','DOC-RADITYA','EX-JAN',1,'15:00','17:00'],['SCH-RDE2','DOC-RADITYA','EX-JAN',2,'15:00','16:00'],['SCH-RDE3','DOC-RADITYA','EX-JAN',4,'15:00','17:00'],['SCH-RDE4','DOC-RADITYA','EX-JAN',5,'18:00','20:00'],
  ['SCH-U1','DOC-UMIRA','SP-JAN',1,'08:00','11:00'],['SCH-U2','DOC-UMIRA','SP-JAN',3,'11:00','14:00'],['SCH-U3','DOC-UMIRA','SP-JAN',5,'08:00','11:00'],['SCH-U4','DOC-UMIRA','SP-JAN',6,'11:00','12:30'],['SCH-UE1','DOC-UMIRA','EX-JAN',1,'11:00','13:00'],['SCH-UE2','DOC-UMIRA','EX-JAN',2,'12:00','14:00'],['SCH-UE3','DOC-UMIRA','EX-JAN',4,'12:00','14:00'],['SCH-UE4','DOC-UMIRA','EX-JAN',5,'11:00','13:00'],['SCH-UE5','DOC-UMIRA','EX-JAN',6,'07:00','10:00'],
  ['SCH-JOH1','DOC-JOHANNES','SP-PDL',3,'08:00','10:00'],['SCH-JOHE1','DOC-JOHANNES','EX-PDL',1,'11:00','12:00'],['SCH-JOHE2','DOC-JOHANNES','EX-PDL',2,'11:00','12:00'],['SCH-JOHE3','DOC-JOHANNES','EX-PDL',3,'11:00','12:00'],['SCH-JOHE4','DOC-JOHANNES','EX-PDL',4,'11:00','12:00'],
  ['SCH-DAV1','DOC-DAVIQ','SP-PDL',1,'08:30','14:00'],['SCH-DAV2','DOC-DAVIQ','SP-PDL',2,'08:30','14:00'],['SCH-DAV3','DOC-DAVIQ','SP-PDL',3,'08:30','14:00'],['SCH-DAV4','DOC-DAVIQ','SP-PDL',4,'08:30','14:00'],['SCH-DAV5','DOC-DAVIQ','SP-PDL',5,'08:30','12:30'],['SCH-DAV6','DOC-DAVIQ','SP-PDL',6,'08:30','12:30'],['SCH-DAVE1','DOC-DAVIQ','EX-PDL',1,'16:00','18:00'],['SCH-DAVE2','DOC-DAVIQ','EX-PDL',3,'16:00','18:00'],['SCH-DAVE3','DOC-DAVIQ','EX-PDL',5,'16:00','18:00'],
  ['SCH-PUG1','DOC-PUGUH','SP-PDL',1,'10:00','12:00'],['SCH-PUG2','DOC-PUGUH','SP-PDL',3,'10:00','12:00'],['SCH-PUG3','DOC-PUGUH','SP-PDL',5,'10:00','11:00'],['SCH-PUGE1','DOC-PUGUH','EX-PDL',2,'08:00','09:30'],['SCH-PUGE2','DOC-PUGUH','EX-PDL',4,'08:00','09:30'],['SCH-PUGE3','DOC-PUGUH','EX-PDL',6,'08:00','09:30'],
  ['SCH-RID1','DOC-RIDWAN','SP-PDL',2,'08:00','10:00'],['SCH-RID2','DOC-RIDWAN','SP-PDL',3,'08:00','10:00'],['SCH-RID3','DOC-RIDWAN','SP-PDL',4,'08:00','10:00'],['SCH-RIDE1','DOC-RIDWAN','EX-PDL',1,'08:30','09:30'],['SCH-RIDE2','DOC-RIDWAN','EX-PDL',2,'10:00','11:00'],['SCH-RIDE3','DOC-RIDWAN','EX-PDL',3,'10:00','11:00'],['SCH-RIDE4','DOC-RIDWAN','EX-PDL',4,'10:00','11:00'],['SCH-RIDE5','DOC-RIDWAN','EX-PDL',5,'08:30','09:30'],
  ['SCH-ANA1','DOC-ADE','SP-ANA',1,'08:00','12:30'],['SCH-ANA2','DOC-ADE','SP-ANA',2,'08:00','12:30'],['SCH-ANA3','DOC-ADE','SP-ANA',3,'08:00','12:30'],['SCH-ANA4','DOC-ADE','SP-ANA',4,'08:00','12:30'],['SCH-ANA5','DOC-ADE','SP-ANA',5,'08:00','10:30'],['SCH-ANA6','DOC-ADE','SP-ANA',6,'08:00','12:00'],['SCH-ANAE1','DOC-ADE','EX-ANA',1,'18:00','19:00'],['SCH-ANAE2','DOC-ADE','EX-ANA',2,'12:00','13:00'],['SCH-ANAE3','DOC-ADE','EX-ANA',3,'18:00','19:00'],['SCH-ANAE4','DOC-ADE','EX-ANA',4,'12:00','13:00'],['SCH-ANAE5','DOC-ADE','EX-ANA',5,'18:00','19:00'],
  ['SCH-YUS1','DOC-YUSTINA','SP-ANA',1,'08:00','12:30'],['SCH-YUS2','DOC-YUSTINA','SP-ANA',2,'08:00','12:30'],['SCH-YUS3','DOC-YUSTINA','SP-ANA',3,'08:00','12:30'],['SCH-YUS4','DOC-YUSTINA','SP-ANA',4,'08:00','12:30'],['SCH-YUS5','DOC-YUSTINA','SP-ANA',5,'08:00','10:30'],['SCH-YUS6','DOC-YUSTINA','SP-ANA',6,'08:00','12:00'],['SCH-YUSE1','DOC-YUSTINA','EX-ANA',1,'07:30','09:00'],['SCH-YUSE2','DOC-YUSTINA','EX-ANA',2,'07:30','09:00'],['SCH-YUSE3','DOC-YUSTINA','EX-ANA',3,'07:30','09:00'],['SCH-YUSE4','DOC-YUSTINA','EX-ANA',4,'07:30','09:00'],['SCH-YUSE5','DOC-YUSTINA','EX-ANA',5,'07:30','09:00'],['SCH-YUSE6','DOC-YUSTINA','EX-ANA',6,'07:30','09:00'],
  ['SCH-MAT1','DOC-SHINTA','SP-MAT',1,'08:00','14:00'],['SCH-MAT3','DOC-SHINTA','SP-MAT',3,'08:00','14:00'],['SCH-MAT4','DOC-SHINTA','SP-MAT',4,'08:00','14:00'],['SCH-MAT5','DOC-SHINTA','SP-MAT',5,'08:00','11:00'],['SCH-MAT6','DOC-SHINTA','SP-MAT',6,'08:00','12:30'],['SCH-MATE1','DOC-SHINTA','EX-MAT',1,'09:00','11:30'],['SCH-MATE4','DOC-SHINTA','EX-MAT',4,'09:00','11:30'],
  ['SCH-THT1','DOC-AGNES','SP-THT',1,'08:00','12:00'],['SCH-THT2','DOC-AGNES','SP-THT',2,'08:00','12:00'],['SCH-THT3','DOC-AGNES','SP-THT',3,'08:00','12:00'],['SCH-THT4','DOC-AGNES','SP-THT',4,'08:00','09:00'],['SCH-THTX1','DOC-AGNES','SP-THT',4,'11:00','12:00'],['SCH-THTE3','DOC-AGNES','EX-THT',3,'13:00','15:00'],['SCH-THTE4','DOC-AGNES','EX-THT',4,'09:00','11:00'],['SCH-THTE5','DOC-AGNES','EX-THT',5,'13:00','15:00'],
  ['SCH-PUJI6','DOC-PUJI','SP-THT',6,'08:00','13:00'],
  ['SCH-REZA1','DOC-REZA','SP-BOR',1,'07:00','12:00'],['SCH-REZA4','DOC-REZA','SP-BOR',4,'07:00','14:30'],['SCH-REZAE2','DOC-REZA','EX-BOR',2,'07:00','08:00'],['SCH-REZAE3','DOC-REZA','EX-BOR',3,'07:00','08:00'],['SCH-REZAE5','DOC-REZA','EX-BOR',5,'07:00','08:00'],['SCH-REZAE6','DOC-REZA','EX-BOR',6,'07:00','08:00'],['SCH-REZAE5B','DOC-REZA','EX-BOR',5,'16:00','17:30'],
  ['SCH-ERF6','DOC-ERFAN','SP-BOR',6,'07:00','09:30'],['SCH-ERFE2','DOC-ERFAN','EX-BOR',2,'07:30','08:30'],['SCH-ERFE4','DOC-ERFAN','EX-BOR',4,'07:30','08:30'],['SCH-ERFE6','DOC-ERFAN','EX-BOR',6,'07:30','08:30'],
  ['SCH-FHM1','DOC-FARMI','SP-BUM',1,'08:00','12:00'],['SCH-FHM2','DOC-FARMI','SP-BUM',2,'08:00','12:00'],['SCH-FHM3','DOC-FARMI','SP-BUM',3,'08:00','12:00'],['SCH-FHM4','DOC-FARMI','SP-BUM',4,'08:00','12:00'],['SCH-FHM5','DOC-FARMI','SP-BUM',5,'08:00','11:00'],['SCH-FHM6','DOC-FARMI','SP-BUM',6,'08:00','12:30'],['SCH-FHME1','DOC-FARMI','EX-BUM',1,'12:00','13:00'],['SCH-FHME2','DOC-FARMI','EX-BUM',2,'12:00','13:00'],['SCH-FHME4','DOC-FARMI','EX-BUM',4,'12:00','13:00'],['SCH-FHME5','DOC-FARMI','EX-BUM',5,'12:30','13:30'],
  ['SCH-PRI1','DOC-PRIJONO','SP-HKB',5,'08:00','11:00'],['SCH-PRIK1','DOC-PRIJONO','SP-KDG',3,'08:00','12:30'],['SCH-PRIEX1','DOC-PRIJONO','EX-KDG',1,'10:00','11:00'],['SCH-PRIEX2','DOC-PRIJONO','EX-KDG',2,'08:00','10:00'],
  ['SCH-ANAOGE1','DOC-ANAOG','EX-KDG',1,'15:00','16:00'],['SCH-ANAOGE2','DOC-ANAOG','EX-KDG',2,'18:00','19:00'],['SCH-ANAOGE4','DOC-ANAOG','EX-KDG',4,'14:00','15:00'],['SCH-ANAOGE5','DOC-ANAOG','EX-KDG',5,'13:00','14:00'],
  ['SCH-AND1','DOC-ANDIVA','SP-SAR',2,'08:00','12:00'],['SCH-AND2','DOC-ANDIVA','SP-SAR',5,'08:00','10:00'],['SCH-ANDIEX1','DOC-ANDIVA','EX-SAR',1,'10:00','11:00'],['SCH-ANDIEX3','DOC-ANDIVA','EX-SAR',3,'11:00','12:00'],['SCH-ANDIEX4','DOC-ANDIVA','EX-SAR',4,'10:00','11:00'],
  ['SCH-SAR3','DOC-SARI','SP-PAR',3,'08:00','12:00'],['SCH-SAR4','DOC-SARI','SP-PAR',4,'08:00','12:00'],['SCH-SAR6','DOC-SARI','SP-PAR',6,'08:00','11:00'],['SCH-SARE1','DOC-SARI','EX-PAR',1,'09:00','10:00'],['SCH-SARE5','DOC-SARI','EX-PAR',5,'09:00','10:00'],
  ['SCH-YOH1','DOC-YOHANA','SP-PSK',1,'08:00','14:00'],['SCH-YOH3','DOC-YOHANA','SP-PSK',3,'08:00','14:00'],['SCH-YOH4','DOC-YOHANA','SP-PSK',4,'08:00','10:00'],['SCH-YOHE2','DOC-YOHANA','EX-PSK',2,'18:00','20:00'],['SCH-YOHE5','DOC-YOHANA','EX-PSK',5,'18:00','20:00']
];
function ensureOfficialDoctorMaster(data){
  if(!Array.isArray(data.doctors)) data.doctors=[];
  OFFICIAL_DOCTOR_MASTER.forEach(function(d){if(!data.doctors.some(function(x){return x.id===d.id;}))data.doctors.push(Object.assign({},d,{source:'SIMRS PROTOTYPE — Dokter Kami',editable:true,updatedAt:nowISO()}));});
  if(!Array.isArray(data.doctorSchedules)) data.doctorSchedules=[];
  OFFICIAL_SCHEDULE_SEED.forEach(function(x){if(!data.doctorSchedules.some(function(s){return s.id===x[0];}))data.doctorSchedules.push({id:x[0],doctorId:x[1],poliId:x[2],tanggal:null,hari:x[3],jamMulai:x[4],jamSelesai:x[5],ruang:'Belum dipetakan',shiftLabel:'Sesuai jadwal resmi',kuota:null,source:'SIMRS PROTOTYPE — publik',needsConfirmation:true,createdAt:nowISO(),updatedAt:nowISO()});});
  const extraOfficialSchedules = [
    ['SCH-FITA-SP1','DOC-FITA','SP-ANA',1,'08:00','12:30'],['SCH-FITA-SP2','DOC-FITA','SP-ANA',2,'08:00','12:30'],['SCH-FITA-SP3','DOC-FITA','SP-ANA',3,'08:00','12:30'],['SCH-FITA-SP4','DOC-FITA','SP-ANA',4,'08:00','12:30'],['SCH-FITA-SP5','DOC-FITA','SP-ANA',5,'08:00','10:30'],['SCH-FITA-SP6','DOC-FITA','SP-ANA',6,'08:00','12:00'],
    ['SCH-FITA-EX1','DOC-FITA','EX-ANA',1,'07:30','08:30'],['SCH-FITA-EX3','DOC-FITA','EX-ANA',3,'07:30','08:30'],['SCH-FITA-EX5','DOC-FITA','EX-ANA',5,'07:30','08:30'],
    ['SCH-BARN-SP2','DOC-BARNABAS','SP-GIG',2,'09:00','14:00'],['SCH-BARN-SP3','DOC-BARNABAS','SP-GIG',3,'11:00','14:00'],['SCH-BARN-SP4','DOC-BARNABAS','SP-GIG',4,'09:00','14:00'],
    ['SCH-BARN-EX2','DOC-BARNABAS','EX-GIG',2,'13:00','15:00'],['SCH-BARN-EX4','DOC-BARNABAS','EX-GIG',4,'13:00','15:00']
  ];
  extraOfficialSchedules.forEach(function(x){if(!data.doctorSchedules.some(function(sc){return sc.id===x[0];}))data.doctorSchedules.push({id:x[0],doctorId:x[1],poliId:x[2],tanggal:null,hari:x[3],jamMulai:x[4],jamSelesai:x[5],ruang:'Belum dipetakan',shiftLabel:'Sesuai jadwal resmi',kuota:null,source:'SIMRS PROTOTYPE — publik',needsConfirmation:true,createdAt:nowISO(),updatedAt:nowISO()});});
  // Demo operasional Poli Umum: diperlukan agar layanan reguler RJ-UMU juga memiliki pilihan dokter.
  // Ini data prototype, bukan klaim jadwal resmi rumah sakit.
  const demoGeneralSchedules = [1,2,3,4,5,6].map(function(day){return ['SCH-UMU-DEMO-'+day,'DOC-ADITYA-UMUM','RJ-UMU',day,'08:00','14:00'];});
  demoGeneralSchedules.forEach(function(x){if(!data.doctorSchedules.some(function(sc){return sc.id===x[0];}))data.doctorSchedules.push({id:x[0],doctorId:x[1],poliId:x[2],tanggal:null,hari:x[3],jamMulai:x[4],jamSelesai:x[5],ruang:'Poli Umum (Demo)',shiftLabel:'Demo Prototype',kuota:null,source:'SIMRS PROTOTYPE — demo',needsConfirmation:true,createdAt:nowISO(),updatedAt:nowISO()});});
  return data;
}
function doctorMasterById(id){return (Store.data&&Array.isArray(Store.data.doctors)?Store.data.doctors:[]).find(function(d){return d.id===id;})||null;}
function doctorDisplayName(id){const u=(Store.data.users||[]).find(function(x){return x.id===id;}); if(u)return u.nama; const d=doctorMasterById(id); return d?d.nama:id||'Dokter';}
function doctorMasterForSchedule(sc){return doctorMasterById(sc&&sc.doctorId);}

function ensureOfficialCatalog(data){
  if(!Array.isArray(data.poli)) data.poli=[];
  OFFICIAL_POLI_CATALOG.forEach(function(x){
    if(!data.poli.some(function(p){return p.id===x[0];})) data.poli.push({id:x[0],nama:x[1],biaya:0,layanan:x[2],official:true});
  });
  if(!Array.isArray(data.facilities)) data.facilities=[];
  PROTOTYPE_FACILITY_STRUCTURE.forEach(function(x){
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
  menunggu_screening:{label:'Menunggu Screening', cls:'badge-amber'},
  screening:        {label:'Screening',            cls:'badge-clinical'},
  menunggu_dokter:  {label:'Menunggu Dokter',      cls:'badge-amber'},
  dipanggil:        {label:'Silakan Masuk',         cls:'badge-sage'},
  menunggu_review:  {label:'Menunggu Review',      cls:'badge-plum'},
  menunggu_penunjang:{label:'Menunggu Penunjang',  cls:'badge-plum'},
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
    {id:'U-DOK1', username:'dokter.umum', password:'dokter123', nama:'dr. ADITYA BALADIKA', role:'dokter', unit:'rawat-jalan', poliId:'RJ-UMU', doctorMasterId:'DOC-ADITYA-UMUM'},
    {id:'U-DOK2', username:'dokter.anak', password:'dokter123', nama:'dr. FITA SOFIYAH., Sp. A', role:'dokter', unit:'rawat-jalan', poliId:'SP-ANA', doctorMasterId:'DOC-FITA'},
    {id:'U-DOK3', username:'dokter.gigi', password:'dokter123', nama:'drg. BARNABAS HOWUK HANO BONARDO SIBARANI, Sp.KGA', role:'dokter', unit:'rawat-jalan', poliId:'SP-GIG', doctorMasterId:'DOC-BARNABAS'},
    {id:'U-DOK4', username:'dokter.jantung', password:'dokter123', nama:'dr. ANGELA BETY RATNASARI, Sp.JP', role:'dokter', unit:'rawat-jalan', poliId:'SP-JAN', doctorMasterId:'DOC-ANGELA'},
    {id:'U-FAR', username:'farmasi', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi', unit:'rawat-jalan'},
    {id:'U-KAS', username:'kasir', password:'kasir123', nama:'Rina Marlina', role:'kasir', unit:'rawat-jalan'},
    {id:'U-LAB', username:'lab', password:'lab123', nama:'Agus Setiawan', role:'lab'},
    {id:'U-RAD', username:'radiologi', password:'rad123', nama:'Bambang Prasetyo', role:'radiologi'},
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
    {id:'W-K3', nama:'Mawar Kuning', kelas:'3', tarifPerHari:150000},
    {id:'W-K3-MMP', nama:'Mawar Merah Putih', kelas:'3', tarifPerHari:150000},
    {id:'W-K2', nama:'Teratai', kelas:'2', tarifPerHari:300000},
    {id:'W-K1', nama:'Tulip', kelas:'1', tarifPerHari:500000},
    {id:'W-VIP', nama:'Graha Delta Husada — VIP', kelas:'VIP', tarifPerHari:900000},
    {id:'W-ICU', nama:'ICU', kelas:'ICU', tarifPerHari:1500000},
    {id:'W-ICCU', nama:'ICCU', kelas:'ICCU', tarifPerHari:1500000},
    {id:'W-HCU', nama:'HCU', kelas:'HCU', tarifPerHari:1200000},
    {id:'W-PICU', nama:'PICU', kelas:'PICU', tarifPerHari:1200000},
    {id:'W-NICU', nama:'NICU', kelas:'NICU', tarifPerHari:1200000},
    {id:'W-ISO', nama:'Ruang Isolasi', kelas:'ISOLASI', tarifPerHari:600000},
    {id:'W-BERSALIN', nama:'Ruang Bersalin', kelas:'BERSALIN', tarifPerHari:600000}
  ];
  const bedCounts = {'W-K3':4, 'W-K3-MMP':4, 'W-K2':4, 'W-K1':3, 'W-VIP':2, 'W-ICU':2, 'W-ICCU':2, 'W-HCU':2, 'W-PICU':2, 'W-NICU':2, 'W-ISO':2, 'W-BERSALIN':2};
  const beds = [];
  wards.forEach(function(w){
    const n = bedCounts[w.id] || 2;
    for(let i=1;i<=n;i++){
      beds.push({id:w.id+'-B'+String(i).padStart(2,'0'), wardId:w.id, noKamar:String(Math.ceil(i/2)).padStart(2,'0'), noBed:(i%2===1?'A':'B'), status:'kosong', updatedAt:nowISO(), reservedFor:null, note:''});
    }
  });
  const demoBed = beds.find(function(b){return b.wardId==='W-K2' && b.noKamar==='01' && b.noBed==='A';});
  if(demoBed) demoBed.status = 'terisi'; // Bed demo selalu dicari berdasarkan ward + nomor, bukan indeks array.
  const admissions = [
    {id:'ADM-DEMO-0001', patientId:'RM-2026-0002', visitId:null, bedId:demoBed ? demoBed.id : 'W-K2-B01', wardId:'W-K2',
      dpjpUserId:'U-DOK1', sumberAdmisi:'Rawat Jalan', noRujukan:'RJ-DEMO-2026-0001', kelasPerawatan:'2', tingkatPerawatan:'Bangsal', diagnosisMasuk:'Observasi febris + dehidrasi ringan', jenisBayar:'BPJS', noBpjs:'0009876543210',
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
      billing:{biayaObat:0, biayaTindakan:0, biayaPenunjang:0, statusBayar:'belum_bayar'}, discharge:{status:'belum_direncanakan',rencanaTanggal:null,kondisi:null},
      createdAt:daysAgoISO(2), updatedAt:daysAgoISO(1)}
  ];

  const seed = {
    poli, users, medicines, patients, visits, prescriptions, transactions, bookings, poliMessages, auditLog,
    wards, beds, admissions,
    doctorSchedules: [],
    notifications: [],
    hospitalAnnouncements: [],
    patientChats: [],
    facilities: [
      {id:'GED-RAWAT-JALAN', type:'gedung', nama:'Gedung Rawat Jalan', parentId:null},
      {id:'GED-RAWAT-INAP', type:'gedung', nama:'Gedung Rawat Inap', parentId:null},
      {id:'GED-IGD', type:'gedung', nama:'Gedung IGD', parentId:null},
      {id:'GED-DIAGNOSTIK', type:'gedung', nama:'Gedung Diagnostik Terpadu', parentId:null}
    ],
    meta:{ rmCounter:3, queueCounters:{ ['JAN-'+bookingTanggal]: 2 }, schemaVersion: DB_SCHEMA_VERSION,
      settings:{avgWaitMinutes:8, doctorQuotaDefault:30, alertQueueThreshold:10, lowStockThreshold:LOW_STOCK_THRESHOLD, pharmacyOutpatientSlaMinutes:30, pharmacyInpatientSlaMinutes:60, pharmacyIgdSlaMinutes:15} }
  };
  ensureInpatientStructure(seed);
  return ensureOfficialCatalog(seed);
}

/* ---------------- persistence ---------------- */
const DB_SCHEMA_VERSION = 23;

const INPATIENT_ROOM_SEED = [
  ['GED-A',1,'Cendana'],['GED-A',1,'Mahoni'],['GED-A',1,'Meranti'],
  ['GED-A',2,'Kenanga'],['GED-A',2,'Kamboja'],['GED-A',2,'Flamboyan'],
  ['GED-A',3,'Bougenville'],['GED-A',3,'Teratai'],['GED-A',3,'Seroja'],
  ['GED-A',4,'Cemara'],['GED-A',4,'Pinus'],['GED-A',4,'Akasia'],
  ['GED-B',1,'Nusa'],['GED-B',1,'Samudra'],['GED-B',1,'Puspa'],
  ['GED-B',2,'Harmoni'],['GED-B',2,'Kirana'],['GED-B',2,'Sejahtera'],
  ['GED-B',3,'Cakrawala'],['GED-B',3,'Mentari'],['GED-B',3,'Purnama'],
  ['GED-B',4,'Wijaya'],['GED-B',4,'Nirmala'],['GED-B',4,'Pratama'],
  ['GED-C',1,'Adikara'],['GED-C',1,'Paramita'],['GED-C',1,'Srikandi'],
  ['GED-C',2,'Wening'],['GED-C',2,'Larasati'],['GED-C',2,'Candrakirana'],
  ['GED-C',3,'Bimasena'],['GED-C',3,'Arunika'],['GED-C',3,'Maheswari'],
  ['GED-C',4,'Dharmawangsa'],['GED-C',4,'Jayendra'],['GED-C',4,'Satyawira']
];
const INPATIENT_NURSE_FIRST_NAMES=['Ayu','Dimas','Sinta','Fajar','Rina','Maya','Dewi','Budi','Nadia','Rizky','Putri','Aditya','Lestari','Bagas','Intan','Rafi','Citra','Agung','Nabila','Dedi','Wulan','Yoga','Nisa','Farhan','Anisa','Galih','Indah','Arif','Yuni','Reza','Vina','Dian','Bayu','Lia','Taufik','Sari','Naufal','Rosa','Andika','Fitri'];
const INPATIENT_NURSE_LAST_NAMES=['Pratama','Lestari','Nugroho','Saputra','Anggraini','Kurniawan','Permata','Wibowo','Puspitasari','Setiawan','Ramadhan','Maharani','Santoso','Wijaya','Handayani','Firmansyah','Utami','Prakoso','Suryani','Hidayat','Susanto','Oktaviani','Putra','Safitri','Maulana','Kartika','Fauzi','Amalia','Wirawan','Kusuma','Rahmawati','Prameswari','Hartono','Yuliana','Permadi','Siregar','Wulandari','Syahputra','Damayanti','Febriani'];
function generatedNurseName(roomIndex,shiftIndex,slotIndex){const fi=(roomIndex*7+shiftIndex*11+slotIndex*13)%INPATIENT_NURSE_FIRST_NAMES.length;const li=(roomIndex*11+shiftIndex*5+slotIndex*17)%INPATIENT_NURSE_LAST_NAMES.length;return 'Ns. '+INPATIENT_NURSE_FIRST_NAMES[fi]+' '+INPATIENT_NURSE_LAST_NAMES[li]+', S.Kep';}
function makeRoomShiftAssignments(roomIndex){const out={};[['PAGI','06:00','14:00'],['SORE','14:00','22:00'],['MALAM','22:00','06:00']].forEach(function(x,si){const leader=generatedNurseName(roomIndex,si,0),member=generatedNurseName(roomIndex,si,1);out[x[0]]={jamMulai:x[1],jamSelesai:x[2],ketuaShift:leader,perawat:[leader,member]};});return out;}
function ensureInpatientStructure(data){
  if(!data || typeof data!=='object') return data;
  if(!Array.isArray(data.wards)) data.wards=[];
  if(!Array.isArray(data.beds)) data.beds=[];
  if(!Array.isArray(data.admissions)) data.admissions=[];
  const legacyRoomIds=['W-K3','W-K3-MMP','W-K2','W-K1'];
  const roomIdFor=function(building,floor,name){
    const index=INPATIENT_ROOM_SEED.findIndex(x=>x[0]===building&&x[1]===floor&&x[2]===name);
    const legacy=legacyRoomIds[index];
    return legacy || ('WARD-'+building+'-L'+floor+'-'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'-'));
  };
  const roomSeeds=INPATIENT_ROOM_SEED.map(function(x){return {id:roomIdFor(x[0],x[1],x[2]),buildingId:x[0],buildingName:({ 'GED-A':'Gedung A — Rawat Inap Utama','GED-B':'Gedung B — Rawat Inap Terpadu','GED-C':'Gedung C — Rawat Inap Khusus'})[x[0]],floorNumber:x[1],floorName:'Lantai '+x[1],nama:x[2],kelas:'3',tarifPerHari:150000,category:'reguler',locationManaged:true};});
  // Map the previous four general wards to the first four real structured rooms so existing admissions keep their ward IDs.
  const legacyNameMap={'W-K3':'Cendana','W-K3-MMP':'Mahoni','W-K2':'Meranti','W-K1':'Kenanga'};
  roomSeeds.forEach(function(seed,roomIndex){
    let ward=data.wards.find(function(w){return w.id===seed.id;});
    if(!ward){ward=Object.assign({},seed);data.wards.push(ward);} else if(!ward.locationManaged){Object.assign(ward,seed);}
    ward.kamarLabels=Array.isArray(ward.kamarLabels)&&ward.kamarLabels.length===10?ward.kamarLabels:['A','B','C','D','E','F','G','H','I','J'];
    ward.bedLabels=Array.isArray(ward.bedLabels)&&ward.bedLabels.length===3?ward.bedLabels:['Bed 1','Bed 2','Bed 3'];
    ward.headNurseName=ward.headNurseName||generatedNurseName(roomIndex,1,2);
    ward.headNurseUserId=ward.headNurseUserId||null;
    if(!ward.shiftAssignments) ward.shiftAssignments=makeRoomShiftAssignments(roomIndex);
    if(ward.id==='W-K2'&&!(ward.shiftAssignments.PAGI||{}).ketuaShiftUserId){ward.shiftAssignments.PAGI={jamMulai:'06:00',jamSelesai:'14:00',ketuaShift:'Ns. Ayu Lestari, S.Kep',perawat:['Ns. Ayu Lestari, S.Kep','Ns. Dimas Saputra, S.Kep'],ketuaShiftUserId:'U-RI-PWT-PAGI',perawatUserIds:['U-RI-PWT-PAGI','U-RI-PWT']};ward.shiftAssignments.SORE={jamMulai:'14:00',jamSelesai:'22:00',ketuaShift:'Ns. Fajar Nugroho, S.Kep',perawat:['Ns. Fajar Nugroho, S.Kep','Ns. Sinta Maharani, S.Kep'],ketuaShiftUserId:'U-RI-PWT-SORE',perawatUserIds:['U-RI-PWT-SORE','U-RJ-PWT-02']};ward.shiftAssignments.MALAM={jamMulai:'22:00',jamSelesai:'06:00',ketuaShift:'Ns. Rina Lestari, S.Kep',perawat:['Ns. Rina Lestari, S.Kep','Ns. Lestari Handayani, S.Kep'],ketuaShiftUserId:'U-RI-PWT-MALAM',perawatUserIds:['U-RI-PWT-MALAM','U-RJ-PWT-01']};}
  });
  // Two VVIP rooms, one on each of Gedung A's fifth and sixth floors, 20 single-bed rooms each.
  const vipSeeds=[{id:'W-VIP',buildingId:'GED-A',buildingName:'Gedung A — Rawat Inap Utama',floorNumber:5,floorName:'Lantai 5 — VVIP',nama:'VVIP Arunika',kelas:'VVIP',tarifPerHari:1500000,category:'vvip',kamarCount:20},{id:'WARD-GED-A-L6-VVIP-MAHARDIKA',buildingId:'GED-A',buildingName:'Gedung A — Rawat Inap Utama',floorNumber:6,floorName:'Lantai 6 — VVIP',nama:'VVIP Mahardika',kelas:'VVIP',tarifPerHari:1500000,category:'vvip',kamarCount:20}];
  vipSeeds.forEach(function(seed,vipIndex){let w=data.wards.find(function(x){return x.id===seed.id;});if(!w){w=Object.assign({},seed);data.wards.push(w);}else if(!w.locationManaged){Object.assign(w,seed);}w.locationManaged=true;w.headNurseName=w.headNurseName||generatedNurseName(36+vipIndex,2,2);w.headNurseUserId=w.headNurseUserId||null;w.kamarLabels=Array.isArray(w.kamarLabels)&&w.kamarLabels.length===20?w.kamarLabels:Array.from({length:20},function(_,i){return String(i+1).padStart(2,'0');});w.bedLabels=Array.isArray(w.bedLabels)&&w.bedLabels.length===1?w.bedLabels:['Bed 1'];w.facilities=Array.isArray(w.facilities)&&w.facilities.length?w.facilities:['Tempat tidur elektrik','Kamar mandi pribadi','Sofa pendamping','Televisi','AC','Panel medis','Tombol panggil perawat','Titik oksigen sesuai standar'];if(!w.shiftAssignments)w.shiftAssignments=makeRoomShiftAssignments(36+vipIndex);});
  // Ensure the room/bed layout is exact while preserving admission occupancy and stable legacy IDs.
  const structuredIds=new Set(roomSeeds.map(x=>x.id).concat(vipSeeds.map(x=>x.id)));
  const activeAdmissionByBed=new Map(data.admissions.filter(a=>a.status==='dirawat').map(a=>[a.bedId,a]));
  const oldBedsById=new Map(data.beds.map(b=>[b.id,b]));
  const nextBeds=data.beds.filter(b=>!structuredIds.has(b.wardId));
  roomSeeds.concat(vipSeeds).forEach(function(w){
    const room=data.wards.find(function(x){return x.id===w.id;});
    const kamarLabels=room.kamarLabels;
    const bedLabels=room.bedLabels;
    const count=room.category==='vvip'?20:10;
    const perRoom=room.category==='vvip'?1:3;
    for(let ki=0;ki<count;ki++){
      for(let bi=0;bi<perRoom;bi++){
        const seq=ki*perRoom+bi+1;
        const id=seq<=30 && legacyRoomIds.concat(['W-VIP']).includes(room.id) ? room.id+'-B'+String(seq).padStart(2,'0') : room.id+'-K'+String(ki+1).padStart(2,'0')+'-B'+String(bi+1);
        const old=oldBedsById.get(id), admission=activeAdmissionByBed.get(id);
        nextBeds.push({id:id,wardId:room.id,noKamar:String(kamarLabels[ki]||ki+1),noBed:String(bedLabels[bi]||('Bed '+(bi+1))).replace(/^Bed\s*/i,''),bedLabel:String(bedLabels[bi]||('Bed '+(bi+1))),status:admission?'terisi':(old&&['persiapan','perbaikan','dipesan'].includes(old.status)?old.status:(old&&old.status==='terisi'?'kosong':'kosong')),updatedAt:old&&old.updatedAt||nowISO(),reservedFor:admission?admission.patientId:(old&&old.reservedFor||null),note:old&&old.note||'',buildingId:room.buildingId,buildingName:room.buildingName,floorNumber:room.floorNumber,roomName:room.nama,category:room.category});
      }
    }
  });
  data.beds=nextBeds;
  // Keep old active admissions attached to their stable bed IDs and correct structured ward.
  data.admissions.forEach(function(a){const b=data.beds.find(function(x){return x.id===a.bedId;});if(b){a.wardId=b.wardId;} });
  data.wards.forEach(function(w){if(!w.locationManaged && !w.buildingName){w.buildingName='Unit Khusus';w.floorNumber=null;w.category='khusus';}});
  return data;
}

function ensureDivisionDemoUsers(data){
  if(!Array.isArray(data.users)) data.users=[];
  const retiredGenericAccounts=['U-RJ-DOK','U-FAR','U-KAS','U-PWT'];
  const retiredGenericNames=['dokter.rajal','farmasi','kasir','perawat'];
  data.users=data.users.filter(function(u){return !retiredGenericAccounts.includes(u.id)&&!retiredGenericNames.includes(u.username);});
  const demoUsers = [
    {id:'U-LOK', username:'loket', password:'loket123', nama:'Petugas Loket SIMRS PROTOTYPE', role:'loket', unit:'rawat-jalan'},
    {id:'U-RJ-ADM', username:'rawatjalan', password:'rawatjalan123', nama:'Budi Santoso', role:'rawat_jalan', unit:'rawat-jalan'},
    {id:'U-RJ-DOK-01', username:'dokter.umum', password:'dokter123', nama:'dr. ADITYA BALADIKA', role:'dokter', unit:'rawat-jalan', poliId:'RJ-UMU', doctorMasterId:'DOC-ADITYA-UMUM'},
    {id:'U-RJ-DOK-02', username:'dokter.anak', password:'dokter123', nama:'dr. FITA SOFIYAH., Sp. A', role:'dokter', unit:'rawat-jalan', poliId:'SP-ANA', doctorMasterId:'DOC-FITA'},
    {id:'U-RJ-DOK-03', username:'dokter.gigi', password:'dokter123', nama:'drg. BARNABAS HOWUK HANO BONARDO SIBARANI, Sp.KGA', role:'dokter', unit:'rawat-jalan', poliId:'SP-GIG', doctorMasterId:'DOC-BARNABAS'},
    {id:'U-RJ-DOK-04', username:'dokter.jantung', password:'dokter123', nama:'dr. ANGELA BETY RATNASARI, Sp.JP', role:'dokter', unit:'rawat-jalan', poliId:'SP-JAN', doctorMasterId:'DOC-ANGELA'},
    {id:'U-DOK6', username:'dokter.sany', password:'dokter123', nama:'dr. SANY RAHMAWANSA SISWARDANA, M Biomed., Sp.JP.,(K) FIHA', role:'dokter', unit:'rawat-jalan', poliId:'SP-JAN', doctorMasterId:'DOC-SANY'},
    {id:'U-RJ-DOK-05', username:'dokter.penyakitdalam', password:'dokter123', nama:'dr. PUGUH WIDAGDO, Sp.PD', role:'dokter', unit:'rawat-jalan', poliId:'SP-PDL', doctorMasterId:'DOC-PUGUH'},
    {id:'U-RJ-PWT-01', username:'asisten.umum', password:'perawat123', nama:'Ns. Lestari Handayani, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'UMU'},
    {id:'U-RJ-PWT-02', username:'asisten.anak', password:'perawat123', nama:'Ns. Sinta Maharani, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'ANA'},
    {id:'U-RJ-PWT-03', username:'asisten.gigi', password:'perawat123', nama:'Ns. Dedi Kurniawan, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'GIG'},
    {id:'U-RJ-PWT-04', username:'asisten.jantung', password:'perawat123', nama:'Ns. Rina Lestari, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'JAN'},
    {id:'U-RJ-PWT-05', username:'asisten.penyakitdalam', password:'perawat123', nama:'Ns. Fajar Nugroho, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'PDL'},
    {id:'U-RJ-FAR', username:'farmasi.rajal', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi', unit:'rawat-jalan'},
    {id:'U-RJ-KAS', username:'kasir.rajal', password:'kasir123', nama:'Rina Marlina', role:'kasir', unit:'rawat-jalan'},
    {id:'U-IGD-DOK', username:'dokter.igd', password:'dokter123', nama:'dr. ADITYA BALADIKA', role:'dokter_igd', unit:'igd', doctorMasterId:'DOC-ADITYA-UMUM'},
    {id:'U-IGD-PWT', username:'perawat.igd', password:'perawat123', nama:'Ns. Lestari Handayani', role:'perawat_igd', unit:'igd'},
    {id:'U-IGD-TRI', username:'triase.igd', password:'triase123', nama:'Ns. Maya Kurniawati, S.Kep', role:'perawat_igd', unit:'igd', tugas:'Triase dan asesmen awal IGD'},
    {id:'U-IGD-FAR', username:'farmasi.igd', password:'farmasi123', nama:'Apt. Sari Wulandari', role:'farmasi', unit:'igd'},
    {id:'U-IGD-KAS', username:'kasir.igd', password:'kasir123', nama:'Rina Pratama', role:'kasir', unit:'igd'},
    {id:'U-RI-DOK', username:'dokter.ranap', password:'dokter123', nama:'dr. YUSTINA ROSANTI, Sp.A', role:'dokter_ranap', unit:'rawat-inap', doctorMasterId:'DOC-YUSTINA'},
    {id:'U-RI-DOK-JAGA-PAGI', username:'dokter.jaga.pagi', password:'dokter123', nama:'dr. Andika Prasetyo', role:'dokter_ranap', unit:'rawat-inap', shiftId:'PAGI'},
    {id:'U-RI-DOK-JAGA-SORE', username:'dokter.jaga.sore', password:'dokter123', nama:'dr. Sinta Maharani', role:'dokter_ranap', unit:'rawat-inap', shiftId:'SORE'},
    {id:'U-RI-DOK-JAGA-MALAM', username:'dokter.jaga.malam', password:'dokter123', nama:'dr. Raka Wijaya', role:'dokter_ranap', unit:'rawat-inap', shiftId:'MALAM'},
    {id:'U-RI-PWT', username:'perawat.ranap', password:'perawat123', nama:'Ns. Dimas Saputra', role:'perawat_ranap', unit:'rawat-inap', wardId:'W-K2'},
    {id:'U-RI-PWT-PAGI', username:'perawat.ranap.pagi', password:'perawat123', nama:'Ns. Ayu Lestari, S.Kep', role:'perawat_ranap', unit:'rawat-inap', wardId:'W-K2', shiftId:'PAGI', isShiftLeader:true},
    {id:'U-RI-PWT-SORE', username:'perawat.ranap.sore', password:'perawat123', nama:'Ns. Fajar Nugroho, S.Kep', role:'perawat_ranap', unit:'rawat-inap', wardId:'W-K2', shiftId:'SORE', isShiftLeader:true},
    {id:'U-RI-PWT-MALAM', username:'perawat.ranap.malam', password:'perawat123', nama:'Ns. Rina Lestari, S.Kep', role:'perawat_ranap', unit:'rawat-inap', wardId:'W-K2', shiftId:'MALAM', isShiftLeader:true},
    {id:'U-RI-FAR', username:'farmasi.ranap', password:'farmasi123', nama:'Apt. Nanda Putri', role:'farmasi', unit:'rawat-inap'},
    {id:'U-RI-ADM', username:'admisi.ranap', password:'admisi123', nama:'Petugas Admisi Rawat Inap', role:'admisi_ranap', unit:'rawat-inap'},
    {id:'U-RI-KAS', username:'kasir.ranap', password:'kasir123', nama:'Rina Permata', role:'kasir', unit:'rawat-inap'},
  ];
  demoUsers.forEach(function(u){
    const old=data.users.find(x=>x.id===u.id || x.username===u.username);
    if(old){ Object.assign(old,u); }
    else data.users.push(Object.assign({},u));
  });
  const links = {'DOC-ADITYA-UMUM':'U-RJ-DOK-01','DOC-FITA':'U-RJ-DOK-02','DOC-BARNABAS':'U-RJ-DOK-03','DOC-ANGELA':'U-RJ-DOK-04','DOC-SANY':'U-DOK6','DOC-PUGUH':'U-RJ-DOK-05','DOC-YUSTINA':'U-RI-DOK'};
  Object.keys(links).forEach(function(docId){const d=data.doctors&&data.doctors.find(function(x){return x.id===docId;}); if(d){d.linkedUserId=links[docId];}});
  // Pastikan akun dokter memakai nama master resmi, bukan nama demo lama.
  data.users.forEach(function(u){if(u.doctorMasterId){const d=data.doctors.find(function(x){return x.id===u.doctorMasterId;});if(d){u.nama=d.nama;if(u.role==='dokter'&&u.unit==='rawat-jalan')u.poliId=u.poliId||d.poliIds[0];else if(['dokter_ranap','dokter_igd'].includes(u.role))delete u.poliId;}}});
  ensurePatientDemoAccounts(data);
  ensureInpatientDemoAccounts(data);
  (data.users||[]).forEach(function(u){if(u.role==='perawat_ranap'&&!u.wardId)u.wardId='W-K2';if(u.role==='dokter_ranap'&&!u.wardId)u.wardId='W-K2';});
  return data;
}

/* ---------------- Demo Rawat Inap V14.3 ----------------
   Lima akun pasien tambahan khusus Rawat Inap. Setiap akun mewakili
   skenario berbeda agar recruiter dapat menguji journey end-to-end.
*/
function ensureInpatientDemoAccounts(data){
  // V15.5: akun pasien demo Rawat Inap lama tidak lagi menjadi akun login.
  // Bersihkan hanya record seeded khusus demo RI lama; akun staf dan data layanan lain tetap dipertahankan.
  const oldIds=['RM-DEMO-RI001','RM-DEMO-RI002','RM-DEMO-RI003','RM-DEMO-RI004','RM-DEMO-RI005'];
  const oldUserIds=['U-PAS-RI-01','U-PAS-RI-02','U-PAS-RI-03','U-PAS-RI-04','U-PAS-RI-05'];
  const oldNames=['pasien.ri1','pasien.ri2','pasien.ri3','pasien.ri4','pasien.ri5'];
  const oldAdmissionIds=['ADM-DEMO-RI-01','ADM-DEMO-RI-02','ADM-DEMO-RI-03','ADM-DEMO-RI-04','ADM-DEMO-RI-05'];
  const oldVisitIds=['VIS-DEMO-P001','VIS-DEMO-P002','VIS-DEMO-P003','VIS-DEMO-P004','VIS-DEMO-P005'];
  data.users=(data.users||[]).filter(function(u){return !oldUserIds.includes(u.id)&&!oldNames.includes(u.username);});
  data.patients=(data.patients||[]).filter(function(p){return !oldIds.includes(p.id);});
  data.bookings=(data.bookings||[]).filter(function(b){return !oldIds.includes(b.patientId);});
  data.visits=(data.visits||[]).filter(function(v){return !oldIds.includes(v.patientId)&&!oldVisitIds.includes(v.id);});
  data.admissions=(data.admissions||[]).filter(function(a){return !oldIds.includes(a.patientId)&&!oldAdmissionIds.includes(a.id);});
  data.prescriptions=(data.prescriptions||[]).filter(function(r){return !oldAdmissionIds.includes(r.admissionId)&&!oldVisitIds.includes(r.visitId)&&!oldIds.includes(r.patientId);});
  (data.beds||[]).forEach(function(b){if(oldIds.includes(b.reservedFor)){b.status='kosong';b.reservedFor=null;b.note='';b.updatedAt=nowISO();}});
}

/* ---------------- 5 akun demo pasien ----------------
   Setiap akun memiliki data pasien + tiket booking contoh agar alur
   Dashboard Pasien, buka ulang QR/barcode, dan Download Tiket dapat diuji
   tanpa harus membuat booking baru terlebih dahulu.
   Semua identitas di bawah adalah data fiktif untuk demo.
*/
function ensurePatientDemoAccounts(data){
  if(!Array.isArray(data.patients)) data.patients=[];
  if(!Array.isArray(data.users)) data.users=[];
  if(!Array.isArray(data.bookings)) data.bookings=[];
  if(!Array.isArray(data.visits)) data.visits=[];
  if(!Array.isArray(data.admissions)) data.admissions=[];
  if(!Array.isArray(data.prescriptions)) data.prescriptions=[];
  if(!Array.isArray(data.transactions)) data.transactions=[];
  const legacyPatientIds=['RM-DEMO-P001','RM-DEMO-P002','RM-DEMO-P003','RM-DEMO-P004','RM-DEMO-P005'];
  const legacyUserIds=['U-PAS-001','U-PAS-002','U-PAS-003','U-PAS-004','U-PAS-005'];
  const legacyUsernames=['pasien.demo','pasien.demo1','pasien.demo2','pasien.demo3','pasien.demo4','pasien.demo5'];
  const legacyVisitIds=['VIS-DEMO-P001','VIS-DEMO-P002','VIS-DEMO-P003','VIS-DEMO-P004','VIS-DEMO-P005'];
  const legacyAdmissionIds=['ADM-DEMO-RI-01','ADM-DEMO-RI-02','ADM-DEMO-RI-03','ADM-DEMO-RI-04','ADM-DEMO-RI-05'];
  data.users=data.users.filter(function(u){return !legacyUserIds.includes(u.id)&&!legacyUsernames.includes(u.username);});
  data.patients=data.patients.filter(function(p){return !legacyPatientIds.includes(p.id);});
  data.bookings=data.bookings.filter(function(b){return !legacyPatientIds.includes(b.patientId);});
  data.visits=data.visits.filter(function(v){return !legacyPatientIds.includes(v.patientId)&&!legacyVisitIds.includes(v.id);});
  data.admissions=data.admissions.filter(function(a){return !legacyPatientIds.includes(a.patientId)&&!legacyAdmissionIds.includes(a.id);});
  data.prescriptions=data.prescriptions.filter(function(r){return !legacyPatientIds.includes(r.patientId)&&!legacyVisitIds.includes(r.visitId)&&!legacyAdmissionIds.includes(r.admissionId);});
  data.transactions=data.transactions.filter(function(t){if(legacyVisitIds.includes(t.visitId)||legacyAdmissionIds.includes(t.admissionId))return false;const v=data.visits.find(function(x){return x.id===t.visitId;});const a=data.admissions.find(function(x){return x.id===t.admissionId;});return !(v&&legacyPatientIds.includes(v.patientId))&&!(a&&legacyPatientIds.includes(a.patientId));});
  (data.beds||[]).forEach(function(b){if(legacyPatientIds.includes(b.reservedFor)){b.status='kosong';b.reservedFor=null;b.note='';b.updatedAt=nowISO();}});
  const demos=[
    {n:1,nama:'Aditya Pratama',jk:'L',lahir:'1994-03-12'},
    {n:2,nama:'Siti Rahmawati',jk:'P',lahir:'1992-07-24'},
    {n:3,nama:'Budi Santoso',jk:'L',lahir:'1989-01-15'},
    {n:4,nama:'Nur Aisyah Putri',jk:'P',lahir:'1996-10-08'},
    {n:5,nama:'Rizky Ramadhan',jk:'L',lahir:'1993-05-19'},
    {n:6,nama:'Dewi Anggraini',jk:'P',lahir:'1990-12-02'},
    {n:7,nama:'Fajar Setiawan',jk:'L',lahir:'1995-08-17'},
    {n:8,nama:'Rina Oktaviani',jk:'P',lahir:'1991-04-27'},
    {n:9,nama:'Dimas Saputra',jk:'L',lahir:'1997-02-11'},
    {n:10,nama:'Maya Puspitasari',jk:'P',lahir:'1994-09-30'}
  ];
  demos.forEach(function(d){
    const pid='RM-DEMO-NP'+String(d.n).padStart(3,'0'), uid='U-PAS-DEMO-'+String(d.n).padStart(2,'0'), username='pasien.demo'+d.n;
    if(!data.patients.some(function(x){return x.id===pid;})) data.patients.push({id:pid,nik:'DEMO-PAS-'+String(d.n).padStart(3,'0'),nama:d.nama,jenisKelamin:d.jk,tglLahir:d.lahir,alamat:'Data Demo — bukan data pasien nyata',noHp:'08'+String(1200000000+d.n),golDarah:'-',alergi:'',createdAt:nowISO(),demo:true});
    const user={id:uid,username:username,password:'pasien123',nama:d.nama,role:'pasien',unit:'pasien',patientId:pid,demoPatientNumber:d.n};
    const old=data.users.find(function(x){return x.id===uid||x.username===username;});
    if(old) Object.assign(old,user); else data.users.push(user);
  });
  // No booking, visit, admission, prescription, or history is seeded for these accounts.
  return data;
}

function migrateData(data){
  if(!data || typeof data!=='object') return seedData();
  if(!data.meta) data.meta = {};
  data.meta.prototypeVersion=PROTOTYPE_VERSION; data.meta.prototypeName=PROTOTYPE_NAME; data.meta.prototypeMode=PROTOTYPE_MODE;
  if(!data.meta.queueCounters) data.meta.queueCounters = {};
  if(!Array.isArray(data.auditLog)) data.auditLog = [];
  if(!Array.isArray(data.bookings)) data.bookings = [];
  if(!Array.isArray(data.poliMessages)) data.poliMessages = [];
  if(!Array.isArray(data.hospitalAnnouncements)) data.hospitalAnnouncements = [];
  if(!Array.isArray(data.patientChats)) data.patientChats = [];
  if(!Array.isArray(data.wards)) data.wards = [];
  if(!Array.isArray(data.beds)) data.beds = [];
  if(!Array.isArray(data.admissions)) data.admissions = [];
  ensureInpatientStructure(data);
  // Pastikan demo pasien v12 (termasuk kunjungan Live Queue) ikut tersedia saat
  // pengguna membuka data lama dari v11 yang masih tersimpan di localStorage.
  ensurePatientDemoAccounts(data);
  data.bookings.forEach(function(b){
    if(!b.status) b.status='terjadwal';
    if(b.reminded===undefined) b.reminded=false;
    if(b.remindedAt===undefined) b.remindedAt=null;
    if(b.visitId===undefined) b.visitId=null;
    if(b.createdAt===undefined) b.createdAt=nowISO();
    if(b.updatedAt===undefined) b.updatedAt=b.createdAt;
    if(b.cancelReason===undefined) b.cancelReason='';
    if(b.rescheduledFrom===undefined) b.rescheduledFrom=null;
    if(b.arrivalWindowStart===undefined) b.arrivalWindowStart=null;
    if(b.arrivalWindowEnd===undefined) b.arrivalWindowEnd=null;
    if(b.suggestedArrivalAt===undefined) b.suggestedArrivalAt=null;
    if(b.journeyVersion===undefined) b.journeyVersion=1;
  });
  // Pastikan counter antrean tidak pernah menghasilkan nomor duplikat,
  // termasuk ketika sumber booking berasal dari JKN Mobile dan aplikasi RS.
  if(Array.isArray(data.bookings)) data.bookings.forEach(function(b){ if(b.jenisLayanan===undefined){const pp=data.poli.find(function(p){return p.id===b.poliId;});b.jenisLayanan=pp&&pp.layanan||'Rawat Jalan';} });
  if(Array.isArray(data.bookings)) data.bookings.forEach(function(b){
    if(!b.arrivalWindowStart || !b.arrivalWindowEnd){ const aw=suggestedArrivalWindow(b); if(aw){b.arrivalWindowStart=aw.start;b.arrivalWindowEnd=aw.end;b.suggestedArrivalAt=aw.start;} }
    if(!b.journeyVersion)b.journeyVersion=1;
  });
  if(Array.isArray(data.visits)) data.visits.forEach(function(v){ if(v.jenisLayanan===undefined){const pp=data.poli.find(function(p){return p.id===v.poliId;});v.jenisLayanan=pp&&pp.layanan||'Rawat Jalan';} });
  if(Array.isArray(data.visits)) data.visits.forEach(function(v){
    if(v.unit==='rawat-jalan' && v.status==='screening' && v.screening && v.workflow && v.workflow.screeningAt){
      v.status='menunggu_dokter';
      v.updatedAt=v.updatedAt||nowISO();
    }
    const n=queueNumberValue(v.noAntrian), key=v.poliId+'-'+(v.tanggal||todayStr());
    if(n!==null) data.meta.queueCounters[key]=Math.max(data.meta.queueCounters[key]||0,n);
  });
  data.bookings.forEach(function(b){
    const n=queueNumberValue(b.noAntrian), key=b.poliId+'-'+b.tanggalKontrol;
    if(n!==null) data.meta.queueCounters[key]=Math.max(data.meta.queueCounters[key]||0,n);
  });
  data.meta.schemaVersion = DB_SCHEMA_VERSION;
  data.meta.settings = Object.assign({
    avgWaitMinutes: 8,
    doctorQuotaDefault: 30,
    alertQueueThreshold: 10,
    lowStockThreshold: LOW_STOCK_THRESHOLD
  }, data.meta.settings||{});
  if(!Array.isArray(data.careRequests)) data.careRequests=[];
  if(!Array.isArray(data.prescriptions)) data.prescriptions=[];
  data.prescriptions.forEach(function(r){ if(r.unit===undefined) r.unit=r.admissionId?'rawat-inap':'rawat-jalan'; if(r.updatedAt===undefined) r.updatedAt=r.createdAt||nowISO(); if(r.siapAt===undefined) r.siapAt=null; if(r.diambilAt===undefined) r.diambilAt=null; if(r.jenisLayanan===undefined) r.jenisLayanan=r.admissionId?'rawat_inap':'rawat_jalan'; });
  data.prescriptions.forEach(function(r){if(!r.admissionId){const v=r.visitId?data.visits.find(function(x){return x.id===r.visitId;}):data.visits.find(function(x){return x.resepId===r.id;});if(v&&v.unit==='igd'){r.unit='igd';r.jenisLayanan='igd';r.patientId=r.patientId||v.patientId;}}});
  if(Array.isArray(data.visits)) data.visits.forEach(function(v){
    if(v.unit===undefined) v.unit='rawat-jalan';
    if(!v.workflow) v.workflow={bookedAt:v.createdAt||null, checkinAt:null, screeningAt:null, doctorStartAt:null, supportingAt:null, reviewAt:null, completedAt:null};
    if(v.screening===undefined) v.screening=null;
    if(v.nextStep===undefined) v.nextStep=null;
    if(v.communication===undefined) v.communication=[];
    if(v.supportingOrders===undefined) v.supportingOrders=[];
    if(v.status==='menunggu_poli' && !v.workflow.screeningAt) v.status='menunggu_screening';
  });
  if(Array.isArray(data.admissions)) data.admissions.forEach(function(a){ if(a.unit===undefined) a.unit='rawat-inap'; });
  if(Array.isArray(data.admissions)) data.admissions.forEach(function(a){ if(a.sumberAdmisi===undefined) a.sumberAdmisi=a.visitId?'Rawat Jalan':'Rujukan/Admisi'; if(a.kelasPerawatan===undefined){const w=data.wards&&data.wards.find(x=>x.id===a.wardId);a.kelasPerawatan=w?w.kelas:'3';} if(a.tingkatPerawatan===undefined)a.tingkatPerawatan='Bangsal'; if(!a.discharge)a.discharge={status:'belum_direncanakan',rencanaTanggal:null,kondisi:null}; if(a.billing&&a.billing.biayaPenunjang===undefined)a.billing.biayaPenunjang=0; });
  if(Array.isArray(data.users) && !data.users.some(function(u){return u.id==='U-RAD';})) data.users.push({id:'U-RAD',username:'radiologi',password:'rad123',nama:'Bambang Prasetyo',role:'radiologi'});
  if(Array.isArray(data.prescriptions)) data.prescriptions.forEach(function(r){ if(r.admissionId && r.status==='disiapkan' && !r.distribusiStatus) r.distribusiStatus='menunggu_serah'; });
  if(!Array.isArray(data.doctorSchedules)) data.doctorSchedules = [];
  const demoSchedules = [
    {id:'SCH-JAN-ANGELA-PAGI', doctorId:'DOC-ANGELA', poliId:'SP-JAN', tanggal:null, hari:1, jamMulai:'08:00', jamSelesai:'12:00', ruang:'Ruang 14', shiftLabel:'Pagi', kuota:null},
    {id:'SCH-JAN-SANY-SORE', doctorId:'DOC-SANY', poliId:'SP-JAN', tanggal:null, hari:1, jamMulai:'13:00', jamSelesai:'20:00', ruang:'Ruang 14', shiftLabel:'Sore', kuota:null}
  ];
  demoSchedules.forEach(function(sc){ if(!data.doctorSchedules.some(function(x){return x.id===sc.id;})) data.doctorSchedules.push(Object.assign({createdAt:nowISO(),updatedAt:nowISO()},sc)); });
  data.doctorSchedules.forEach(function(sc){if(sc.id==='SCH-JAN-RUDI-PAGI'){sc.id='SCH-JAN-ANGELA-PAGI';sc.doctorId='DOC-ANGELA';sc.poliId='SP-JAN';} if(sc.id==='SCH-JAN-SANY-SORE'){sc.doctorId='DOC-SANY';sc.poliId='SP-JAN';}});
  if(!Array.isArray(data.notifications)) data.notifications = [];
  data.notifications.forEach(function(n){ if(n.read===undefined) n.read=false; if(n.target===undefined) n.target=null; if(n.targetUserId===undefined) n.targetUserId=null; });
  if(!Array.isArray(data.facilities)) data.facilities = [];
  ensureOfficialCatalog(data);
  ensureOfficialDoctorMaster(data);
  // Normalisasi seluruh referensi poli lama/baru ke ID kanonik.
  // Ini mencegah data booking, kunjungan, user, jadwal dan pesan terpecah
  // hanya karena satu bagian memakai alias lama seperti UMU/JAN.
  data.users.forEach(function(u){ if(u.poliId) u.poliId=canonicalPoliId(u.poliId); if(u.username==='farmasi' && !u.unit) u.unit='rawat-jalan'; if(u.username==='kasir' && !u.unit) u.unit='rawat-jalan'; });
  data.bookings.forEach(function(b){ if(b.poliId) b.poliId=canonicalPoliId(b.poliId); });
  data.visits.forEach(function(v){ if(v.poliId) v.poliId=canonicalPoliId(v.poliId); });
  data.doctorSchedules.forEach(function(sc){ if(sc.poliId) sc.poliId=canonicalPoliId(sc.poliId); });
  if(Array.isArray(data.poliMessages)) data.poliMessages.forEach(function(m){ if(m.poliId) m.poliId=canonicalPoliId(m.poliId); });
  // V13.4: counter antrean sekarang milik POLI + TANGGAL, bukan dokter/sesi.
  // Nomor lama tetap dipertahankan agar tiket historis tidak berubah, tetapi
  // nomor baru selalu mengikuti counter poli/tanggal yang sama.
  data.meta.queueCounters={};
  data.visits.forEach(function(v){ const n=queueNumberValue(v.noAntrian), key=canonicalPoliId(v.poliId)+'-'+(v.tanggal||todayStr()); if(n!==null) data.meta.queueCounters[key]=Math.max(data.meta.queueCounters[key]||0,n); });
  data.bookings.forEach(function(b){ const n=queueNumberValue(b.noAntrian), key=canonicalPoliId(b.poliId)+'-'+b.tanggalKontrol; if(n!==null) data.meta.queueCounters[key]=Math.max(data.meta.queueCounters[key]||0,n); });
  // Backfill alokasi sesi/dokter untuk data lama bila nomor sudah memiliki
  // jadwal yang dapat ditentukan. Data lama tidak dipaksa pindah dokter.
  data.bookings.forEach(function(b){ if(b.dokterId===undefined) b.dokterId=null; if(b.sessionId===undefined) b.sessionId=null; });
  data.visits.forEach(function(v){ if(v.dokterId===undefined) v.dokterId=null; if(v.sessionId===undefined) v.sessionId=null; });
  ensureDivisionDemoUsers(data);
  data.users.forEach(function(u){if(u.doctorMasterId){const d=data.doctors.find(function(x){return x.id===u.doctorMasterId;});if(d){u.nama=d.nama;}}});
  data.meta.settings = Object.assign({pharmacyOutpatientSlaMinutes:30, pharmacyInpatientSlaMinutes:60, pharmacyIgdSlaMinutes:15}, data.meta.settings||{});
  return data;
}

let liveChannel=null;
try{ if(window.BroadcastChannel) liveChannel=new BroadcastChannel('simrs-live-v16'); }catch(e){ liveChannel=null; }
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
  save(){ localStorage.setItem('simrs_db_v1', JSON.stringify(this.data)); try{ if(liveChannel) liveChannel.postMessage({type:'db-updated',at:Date.now()}); }catch(e){} }
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
// Normalisasi ID poli agar akun demo lama (UMU/JAN/...) tetap terhubung
// dengan katalog resmi (RJ-UMU/SP-JAN/...). Semua modul antrean memakai helper ini.
const POLI_ALIAS = {UMU:'RJ-UMU',GIG:'SP-GIG',ANA:'SP-ANA',KDG:'SP-KDG',MAT:'SP-MAT',THT:'SP-THT',JAN:'SP-JAN',KUL:'SP-KUL',PDL:'SP-PDL',SYA:'SP-SAR',PAR:'SP-PAR'};
function canonicalPoliId(id){ return POLI_ALIAS[id] || id; }
function samePoli(a,b){ return canonicalPoliId(a)===canonicalPoliId(b); }
function getPoli(id){
  const cid=canonicalPoliId(id);
  return (Store.data && Array.isArray(Store.data.poli)) ? Store.data.poli.find(p=>p.id===cid) : null;
}

function getMedicine(id){ return Store.data.medicines.find(m=>m.id===id); }
function getPatient(id){ return Store.data.patients.find(p=>p.id===id); }
function getVisit(id){ return Store.data.visits.find(v=>v.id===id); }
function getUserById(id){ return Store.data.users.find(u=>u.id===id); }
function getResep(id){ return Store.data.prescriptions.find(r=>r.id===id); }
function getResepByVisit(visitId){
  const visit=getVisit(visitId);
  return (visit && visit.resepId ? getResep(visit.resepId) : null) || Store.data.prescriptions.find(r=>r.visitId===visitId) || null;
}
function linkPrescriptionToVisit(resep, visit){
  if(!resep || !visit) return false;
  let changed=false;
  if(!resep.visitId){resep.visitId=visit.id;changed=true;}
  if(!visit.resepId){visit.resepId=resep.id;changed=true;}
  if(!resep.unit){resep.unit=resep.admissionId?'rawat-inap':(visit.unit||'rawat-jalan');changed=true;}
  if(!resep.jenisLayanan){resep.jenisLayanan=resep.admissionId?'rawat-inap':(visit.unit||'rawat-jalan');changed=true;}
  return changed;
}
function reconcileOutpatientPrescriptions(){
  let changed=false;
  (Store.data.prescriptions||[]).forEach(function(resep){
    if(resep.admissionId || (resep.unit && !['rawat-jalan','rawat_jalan'].includes(resep.unit))) return;
    const visit=resep.visitId?getVisit(resep.visitId):Store.data.visits.find(function(v){return v.resepId===resep.id;});
    if(!visit) return;
    if(linkPrescriptionToVisit(resep,visit)) changed=true;
    const unit=visit.unit||'rawat-jalan';
    if(unit==='rawat-jalan' && resep.status==='menunggu' && visit.status!=='dibatalkan' && !['menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_rujukan_igd','rujuk_ranap'].includes(visit.status)){
      if(visit.status!=='menunggu_farmasi' || visit.nextStep!=='Farmasi Rawat Jalan'){
        visit.status='menunggu_farmasi'; visit.nextStep='Farmasi Rawat Jalan'; visit.updatedAt=nowISO(); changed=true;
      }
    }
    if(unit==='rawat-jalan' && resep.status==='disiapkan' && !['menunggu_bayar','obat_siap','selesai','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_rujukan_igd','rujuk_ranap'].includes(visit.status)){
      visit.status='menunggu_bayar'; visit.nextStep='Billing / Kasir Rawat Jalan'; visit.updatedAt=nowISO(); changed=true;
    }
  });
  if(changed) Store.save();
  return changed;
}
function visitsToday(){ const t = todayStr(); return Store.data.visits.filter(v=>v.tanggal===t); }
function patientVisits(patientId){
  return Store.data.visits.filter(v=>v.patientId===patientId).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
}

/* ---------------- operational monitoring helpers ---------------- */
function getTodayBookings(poliId){
  return Store.data.bookings.filter(function(b){ return b.tanggalKontrol===todayStr() && (!poliId || samePoli(b.poliId,poliId)); });
}
function getTodayVisits(poliId){
  return visitsToday().filter(function(v){ return !poliId || samePoli(v.poliId,poliId); });
}
function getDoctorForPoli(poliId){
  return Store.data.users.find(function(u){ return u.role==='dokter' && samePoli(u.poliId,poliId); });
}
function getDoctorAvailability(poliId){
  const doctor = getDoctorForPoli(poliId);
  if(!doctor) return {status:'none', label:'Belum ada dokter', doctor:null};
  const messages = Store.data.poliMessages.filter(function(m){ return samePoli(m.poliId,poliId); });
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
  const isInpatient=kind==='rawat_inap' || kind==='rawat-inap';
  const isIgd=kind==='igd';
  const settings=(Store.data&&Store.data.meta&&Store.data.meta.settings)||{};
  const sla=isInpatient?(settings.pharmacyInpatientSlaMinutes||60):(isIgd?(settings.pharmacyIgdSlaMinutes||15):(settings.pharmacyOutpatientSlaMinutes||30));
  let list=[];
  if(isInpatient){ list=Store.data.prescriptions.filter(function(r){return !!r.admissionId && ['menunggu','disiapkan'].includes(r.status) && (r.distribusiStatus!=='diberikan');}); }
  else { list=Store.data.prescriptions.filter(function(r){
    const v=getVisit(r.visitId || (Store.data.visits.find(function(x){return x.resepId===r.id;})||{}).id);
    const unit=(r.unit || r.jenisLayanan || (v&&v.unit) || 'rawat-jalan').replace('_','-');
    const expected=isIgd?'igd':'rawat-jalan';
    return !!v && unit===expected && (!poliId || samePoli(v.poliId,poliId)) && ['menunggu','disiapkan'].includes(r.status) && !r.admissionId;
  }); }
  const waits=list.map(pharmacyWaitMinutes).filter(function(x){return x!==null;});
  const maxWait=waits.length?Math.max.apply(null,waits):0;
  return {pending:list.filter(function(r){return r.status==='menunggu';}).length,maxWait:maxWait,sla:sla,overSla:list.filter(function(r){const w=pharmacyWaitMinutes(r); return r.status==='menunggu' && w!==null && w>sla;}).length};
}
function alternativeDoctors(poliId){
  const current = getDoctorForPoli(poliId);
  if(!current) return [];
  return Store.data.users.filter(function(u){ return u.role==='dokter' && u.id!==current.id && samePoli(u.poliId,poliId); });
}
function totalCapacityForPoliDate(poliId,dateStr){
  const sessions=getSessionCandidates(poliId,dateStr);
  if(!sessions.length) return ((Store.data.meta.settings&&Store.data.meta.settings.doctorQuotaDefault)||30);
  return sessions.reduce(function(sum,sc){return sum+sessionCapacity(sc);},0);
}
function quotaForPoli(poliId, dateStr){
  const d = dateStr || todayStr();
  const custom = Store.data.doctorSchedules.find(function(s){ return samePoli(s.poliId,poliId) && s.tanggal===d; });
  return custom && custom.kuota ? custom.kuota : ((Store.data.meta.settings && Store.data.meta.settings.doctorQuotaDefault) || 30);
}
function journeyIndex(status){
  const map={terjadwal:0,checked_in:1,menunggu_screening:2,menunggu_dokter:3,menunggu_poli:3,dipanggil:4,diperiksa:5,menunggu_lab:5,menunggu_farmasi:5,menunggu_bayar:5,obat_siap:5,selesai:6,dibatalkan:-1,tidak_hadir:-1,rescheduled:0,kadaluarsa:-1};
  return map[status]===undefined?3:map[status];
}
function journeyHtml(status, compact){
  const idx=journeyIndex(status);
  if(idx<0) return '<div class="alert alert-warning">'+(status==='dibatalkan'?'Booking dibatalkan.':status==='tidak_hadir'?'Pasien ditandai tidak hadir.':'Status booking sudah tidak aktif.')+'</div>';
  const cls=compact?' journey-compact':'';
  return '<div class="journey'+cls+'">'+QUEUE_JOURNEY.map(function(s,i){return '<div class="journey-step '+(i<idx?'done ':'')+(i===idx?'active':'')+'"><span>'+s.icon+'</span><div><strong>'+esc(s.label)+'</strong></div></div>';}).join('')+'</div>';
}
function suggestedArrivalWindow(booking){
  if(!booking) return null;
  const settings=(Store.data&&Store.data.meta&&Store.data.meta.settings)||{};
  const avg=Math.max(5,parseInt(settings.avgWaitMinutes||8,10));
  const sc=booking.sessionId?Store.data.doctorSchedules.find(function(x){return x.id===booking.sessionId;}):null;
  let startMinutes=null;
  if(booking.appointmentTime){ const m=String(booking.appointmentTime).match(/(\d{1,2}):(\d{2})/); if(m) startMinutes=parseInt(m[1],10)*60+parseInt(m[2],10); }
  if(startMinutes===null && sc && sc.jamMulai){ const m=String(sc.jamMulai).split(':'); startMinutes=parseInt(m[0],10)*60+parseInt(m[1],10); }
  if(startMinutes===null) startMinutes=8*60;
  const n=Math.max(1,queueNumberValue(booking.noAntrian)||1);
  const offset=Math.min(180,(n-1)*avg);
  const s=startMinutes+offset;
  const e=s+avg;
  function fmt(x){const h=Math.floor(x/60)%24,m=x%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
  return {start:fmt(s),end:fmt(e),text:fmt(s)+'–'+fmt(e),base:fmt(startMinutes),avgWait:avg};
}
function queueRuleExplanation(booking){
  if(!booking) return '';
  const isEx=(booking.jenisLayanan||'').toLowerCase().includes('eksekutif') || String(booking.poliId||'').startsWith('EX-');
  const q=queueNumberValue(booking.noAntrian);
  const cap=booking.sessionId?sessionCapacity(Store.data.doctorSchedules.find(function(x){return x.id===booking.sessionId;})||{}):null;
  return '<div class="alert alert-info"><strong>Aturan antrean prototype:</strong> '+(isEx?'Eksekutif memakai konteks klinik, dokter, sesi, dan appointment sendiri; tidak digabung dengan Reguler.':'Reguler memakai urutan nomor per poli + tanggal, lalu sistem mengalokasikan dokter/sesi berdasarkan jadwal dan kapasitas.')+(q!==null?' Nomor Anda <strong>'+esc(booking.noAntrian)+'</strong> tetap menjadi identitas antrean pada kunjungan ini.':'')+(cap?' Kapasitas sesi saat ini '+cap+' pasien.':'')+'</div>';
}
function bookingStatusLabel(status){
  return ({terjadwal:'BOOKED',checked_in:'CHECK-IN',dibatalkan:'DIBATALKAN',tidak_hadir:'TIDAK HADIR',rescheduled:'DIJADWALKAN ULANG',kadaluarsa:'KADALUARSA'})[status] || status;
}
function pushNotification(type, title, body, target, targetUserId){
  if(!Array.isArray(Store.data.notifications)) Store.data.notifications=[];
  Store.data.notifications.unshift({id:uid('NTF'), type:type||'info', title:title||'', body:body||'', target:target||null, targetUserId:targetUserId||null, read:false, createdAt:nowISO()});
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
  // Konteks unit harus diperiksa sebelum pemeriksaan "rawat-jalan"
  // karena nama rute farmasi/kasir juga mengandung kata rawat-jalan.
  if(route==='igd' || route==='farmasi-igd' || route==='kasir-igd') return 'igd';
  if(route==='ranap' || route==='farmasi-rawat-inap' || route==='kasir-rawat-inap') return 'rawat-inap';
  if(route==='poli' || route==='farmasi-rawat-jalan' || route==='kasir-rawat-jalan' || route==='booking' || route==='pendaftaran') return 'rawat-jalan';
  return null;
}

/* ================================================================
   NAVIGASI V13.1 — satu katalog menu, lalu disaring oleh RBAC.
   Urutan sengaja dibuat agar menu klinis utama muncul lebih dulu.
   ================================================================ */
const ADMIN_SERVICE_MENU_ROUTES = [
  'pendaftaran','booking','igd','lab','radiologi',
  'farmasi-rawat-jalan','farmasi-rawat-inap','farmasi-igd',
  'kasir-rawat-jalan','kasir-rawat-inap','kasir-igd',
  'rekam-medis','master-data','audit-sistem','cek-antrian','monitor-antrean'
];

const NAV_ITEMS = [
  {hash:'dashboard',label:'Dashboard',ic:'▦'},
  {hash:'beranda',label:'Beranda',ic:'⌂'},
  {hash:'pendaftaran',label:'Pendaftaran',ic:'📝'},
  {hash:'booking',label:'Booking',ic:'📅'},
  {hash:'poli',label:'Poli',ic:'🩺'},
  {hash:'igd',label:'IGD',ic:'🚑'},
  {hash:'ranap',label:'Rawat Inap',ic:'🏨'},
  {hash:'lab',label:'Laboratorium',ic:'🧪'},
  {hash:'radiologi',label:'Radiologi',ic:'☢️'},
  {hash:'farmasi-rawat-jalan',label:'Farmasi Rawat Jalan',ic:'💊'},
  {hash:'farmasi-rawat-inap',label:'Farmasi Rawat Inap',ic:'💊'},
  {hash:'farmasi-igd',label:'Farmasi IGD',ic:'💊'},
  {hash:'kasir-rawat-jalan',label:'Kasir Rawat Jalan',ic:'🧾'},
  {hash:'kasir-rawat-inap',label:'Kasir Rawat Inap',ic:'🧾'},
  {hash:'kasir-igd',label:'Kasir IGD',ic:'🧾'},
  {hash:'rekam-medis',label:'Rekam Medis',ic:'📋'},
  {hash:'riwayat-dokter',label:'Riwayat',ic:'🕘'},
  {hash:'riwayat-admin',label:'Riwayat',ic:'🕘'},
  {hash:'master-data',label:'Master Data',ic:'⚙️'},
  {hash:'audit-sistem',label:'Audit Sistem',ic:'🧪'},
  {hash:'cek-antrian',label:'Cek Antrian',ic:'📺'},
  {hash:'monitor-antrean',label:'Monitor',ic:'🖥️'},
  {hash:'informasi-rs',label:'Informasi RS',ic:'ℹ️'},
  {hash:'pasien-dashboard',label:'Beranda',ic:'⌂'},
  {hash:'pasien-booking',label:'Rawat Jalan',ic:'📅'},
  {hash:'pasien-rawat-inap',label:'Rawat Inap',ic:'🏥'},
  {hash:'pasien-info',label:'Informasi',ic:'ℹ️'},
  {hash:'pasien-booking-saya',label:'Booking Saya',ic:'🎫'},
  {hash:'pasien-riwayat',label:'Riwayat',ic:'🕘'}
];

const ROLE_ROUTE_RULES = {
  admin: ['*'],
  monitor_public: ['monitor-antrean'],
  pasien: ['pasien-dashboard','pasien-booking','pasien-info','pasien-booking-saya','pasien-riwayat','pasien-chat'],
  loket: ['pendaftaran','booking','cek-antrian','chat-pasien'],
  // Petugas Rawat Jalan: Monitor menjadi tab utama; Cek Antrian tetap merupakan route sekunder/desktop.
  rawat_jalan: ['pendaftaran','booking','poli','cek-antrian','monitor-antrean','chat-pasien'],
  dokter: ['beranda','poli','rekam-medis','monitor-antrean','chat-pasien'],
  dokter_igd: ['igd','rekam-medis','riwayat-dokter','chat-pasien'],
  dokter_ranap: ['ranap','rekam-medis','riwayat-dokter','monitor-antrean','chat-pasien'],
  // Perawat Rawat Jalan: Monitor sejajar dengan workspace utama, bukan di Lainnya.
  perawat: ['beranda','poli','rekam-medis','monitor-antrean','chat-pasien'],
  perawat_igd: ['igd','rekam-medis','chat-pasien'],
  perawat_ranap: ['ranap','rekam-medis','monitor-antrean','chat-pasien'],
  admisi_ranap: ['ranap','chat-pasien'],
  lab: ['beranda','lab','chat-pasien'],
  radiologi: ['beranda','radiologi','chat-pasien'],
  farmasi: ['beranda','farmasi-rawat-jalan','farmasi-rawat-inap','farmasi-igd','chat-pasien'],
  kasir: ['beranda','kasir-rawat-jalan','kasir-rawat-inap','kasir-igd','chat-pasien']
};

// Urutan navbar utama ditetapkan per role agar fungsi penting tidak terdorong ke Menu Lainnya
// hanya karena urutan katalog NAV_ITEMS berubah. Overflow tetap berisi modul sekunder.
const PRIMARY_NAV_BY_ROLE = {
  admin: ['dashboard','poli','pendaftaran','ranap','master-data','beranda'],
  pasien: ['pasien-dashboard','pasien-booking','pasien-info','pasien-booking-saya','pasien-riwayat'],
  loket: ['pendaftaran','booking','cek-antrian'],
  rawat_jalan: ['pendaftaran','booking','poli','monitor-antrean'],
  dokter: ['beranda','poli','monitor-antrean','rekam-medis'],
  dokter_igd: ['igd','rekam-medis','riwayat-dokter'],
  dokter_ranap: ['ranap','rekam-medis','riwayat-dokter','monitor-antrean'],
  perawat: ['beranda','poli','rekam-medis','monitor-antrean'],
  perawat_igd: ['igd','rekam-medis'],
  perawat_ranap: ['ranap','rekam-medis','monitor-antrean'],
  admisi_ranap: ['ranap'],
  lab: ['beranda','lab'],
  radiologi: ['beranda','radiologi'],
  farmasi: ['beranda'],
  kasir: ['beranda']
};

function primaryNavHashesForUser(u){
  if(!u) return [];
  if(u.role==='farmasi') return ['beranda', u.unit==='igd'?'farmasi-igd':(u.unit==='rawat-inap'?'farmasi-rawat-inap':'farmasi-rawat-jalan')];
  if(u.role==='kasir') return ['beranda', u.unit==='igd'?'kasir-igd':(u.unit==='rawat-inap'?'kasir-rawat-inap':'kasir-rawat-jalan')];
  return PRIMARY_NAV_BY_ROLE[u.role] || [];
}

function isRouteAllowed(route, role){
  const u = Session.currentUser;
  if(!u || !role) return false;
  // Menu pasien tidak boleh bocor ke navigasi staf/admin; pasien memiliki shell sendiri.
  if(role!=='pasien' && route.indexOf('pasien-')===0) return false;
  if(role==='pasien' && ['informasi-rs','chat-pasien'].includes(route)) return false;
  if(role==='admin') return true; // super user
  const allowed = ROLE_ROUTE_RULES[role] || [];
  if(!allowed.includes(route)) return false;

  // Akun pasien hanya boleh berada di ruang pasien.
  if(role==='pasien') return route.indexOf('pasien-')===0 && route!=='pasien-rawat-inap';

  const ctx = routeContext(route);
  if(ctx && u.unit && u.unit!==ctx) return false;

  // Poli rawat jalan wajib mengikuti poli yang melekat pada akun dokter/perawat.
  if((role==='dokter' || role==='perawat') && route==='poli' && !u.poliId) return false;

  // Rekam medis dan riwayat dokter tetap mengikuti unit akun.
  if(route==='riwayat-dokter' && !['dokter','dokter_igd','dokter_ranap'].includes(role)) return false;

  return true;
}

function roleLabel(role){
  return {admin:'Admin', loket:'Petugas Pendaftaran', rawat_jalan:'Petugas Rawat Jalan', admisi_ranap:'Petugas Admisi Rawat Inap', dokter:'Dokter', dokter_igd:'Dokter IGD', dokter_ranap:'Dokter Rawat Inap', farmasi:'Apoteker', kasir:'Kasir', lab:'Petugas Laboratorium', radiologi:'Petugas Radiologi', perawat:'Perawat', perawat_igd:'Perawat IGD', perawat_ranap:'Perawat Rawat Inap', pasien:'Pasien'}[role] || role;
}
function defaultRouteForRole(role){
  const u=Session.currentUser||{};
  if(role==='farmasi') return u.unit==='igd'?'farmasi-igd':(u.unit==='rawat-inap'?'farmasi-rawat-inap':'farmasi-rawat-jalan');
  if(role==='kasir') return u.unit==='igd'?'kasir-igd':(u.unit==='rawat-inap'?'kasir-rawat-inap':'kasir-rawat-jalan');
  return ({admin:'dashboard', loket:'pendaftaran', rawat_jalan:'poli', dokter:'poli', dokter_igd:'igd', dokter_ranap:'ranap', lab:'lab', radiologi:'radiologi', perawat:'poli', perawat_igd:'igd', perawat_ranap:'ranap', admisi_ranap:'ranap', pasien:'pasien-dashboard'})[role] || 'cek-antrian';
}
function navigate(hash){ location.hash = '#/' + hash; }
function currentRoute(){ return location.hash.replace(/^#\/?/, '').split('?')[0]; }

function render(){
  try{
    if(currentRoute()==='monitor-antrean' && !Session.currentUser){ renderMonitorAntrean(); return; }
    if(!Session.currentUser){ renderLogin(); return; }
    let route = currentRoute();
    if(!route){ location.hash = '#/'+defaultRouteForRole(Session.currentUser.role); return; }
    if(!isRouteAllowed(route, Session.currentUser.role)){
      location.hash = '#/'+defaultRouteForRole(Session.currentUser.role);
      return;
    }
    renderShell(route);
  }catch(err){
    console.error('SIMRS render error:',err);
    const app=document.getElementById('app');
    if(app){
      app.innerHTML='<div style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui"><h2>SIMRS sedang memulihkan data demo</h2><p>Data browser sebelumnya kemungkinan terhapus. Tekan tombol di bawah untuk membuat ulang data demo.</p><button id="btn-recover-demo" style="padding:12px 18px;border:0;border-radius:12px;cursor:pointer">Pulihkan Data Demo</button><pre style="white-space:pre-wrap;margin-top:16px;opacity:.65">'+esc(err&&err.message?err.message:String(err))+'</pre></div>';
      const b=document.getElementById('btn-recover-demo');
      if(b) b.onclick=function(){ localStorage.removeItem('simrs_db_v1'); localStorage.removeItem('simrs_session_v1'); location.reload(); };
    }
  }
}
window.addEventListener('hashchange', render);

function getVisibleNotifications(){
  const u=Session.currentUser;
  const list=Store.data.notifications||[];
  if(!u) return [];
  if(u.role==='pasien') return list.filter(function(n){ return n.target===u.patientId || n.targetUserId===u.id; });
  return list;
}
function renderShell(route){
  const u = Session.currentUser;
  const visibleNotifications=getVisibleNotifications();
  // Katalog menu SELALU dibatasi oleh RBAC lalu dideduplikasi berdasarkan route.
  // Ini mencegah menu pasien/dokter bocor ke Admin dan mencegah satu route tampil dua kali.
  const items = NAV_ITEMS.filter(n=>isRouteAllowed(n.hash,u.role) && !(u.role==='pasien' && (n.hash==='cek-antrian' || n.hash==='pasien-chat' || /cari|pencarian/i.test(n.label))))
    .filter(function(n,i,arr){ return arr.findIndex(function(x){return x.hash===n.hash;})===i; });
  // Navbar dibatasi maksimal enam menu. Chat selalu berada di kiri atas, bukan di navbar.
  const patientFixedNav = PRIMARY_NAV_BY_ROLE.pasien;
  const primary = u.role==='pasien'
    ? patientFixedNav.map(h=>items.find(n=>n.hash===h)).filter(Boolean)
    : primaryNavHashesForUser(u).map(h=>items.find(n=>n.hash===h)).filter(Boolean);
  const ADMIN_FOLDER_ROUTES = []; 
  const primaryHashes = new Set(primary.map(function(n){return n.hash;}));
  const MOBILE_NAV_HIDDEN_ROUTES = ['cek-antrian'];
  const overflowCandidates = items.filter(function(n){return !primaryHashes.has(n.hash) && !(MOBILE_NAV_HIDDEN_ROUTES.includes(n.hash) && u.role!=='admin');});
  const overflow = [];
  const initial = (u.nama||'?').trim().charAt(0).toUpperCase();

  const sidebarNavHtml = items.map(n=>
    '<button class="nav-item '+(n.hash===route?'active':'')+'" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span>'+n.label+'</button>'
  ).join('');
  const bottomTabsHtml = primary.slice(0,6).map(n=>
    '<button class="tab-item '+(n.hash===route?'active':'')+'" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span><span class="tl">'+(u.role==='admin'&&n.hash==='poli'?'Rawat Jalan':n.label)+'</span></button>'
  ).join('');

  document.getElementById('app').innerHTML =
   '<div class="app-shell">'+
     '<aside class="sidebar" id="sidebar">'+
       '<div class="brand"><div class="brand-mark"></div><div class="brand-text"><div class="t1">SIMRS PROTOTYPE</div><div class="t2">Portfolio / Demo</div></div></div>'+
       '<nav class="nav">'+sidebarNavHtml+'</nav>'+
       '<div class="sidebar-user"><div class="name">'+esc(u.nama)+'</div><div class="role">'+roleLabel(u.role)+(u.poliId?' · '+esc(getPoli(u.poliId).nama):'')+'</div>'+
         '<button class="btn btn-outline btn-sm btn-block" id="btn-logout-sidebar">🚪 Keluar</button></div>'+
     '</aside>'+
     '<div class="main-area">'+
       '<div class="topbar '+(u.role==='admin'?'admin-topbar':'')+'">'+
         '<div class="topbar-left">'+(u.role==='admin'?'<button class="btn btn-outline btn-sm admin-top-menu-btn" id="btn-admin-service-menu" title="Buka menu Pelayanan" aria-label="Buka menu Pelayanan"><span class="admin-menu-hamburger" aria-hidden="true">☰</span><span class="admin-menu-label">Pelayanan</span></button>':'')+'<button class="btn btn-outline btn-sm staff-chat-top-btn" id="btn-top-chat" title="Buka Chat" aria-label="Buka Chat"><span aria-hidden="true">💬</span><span class="chat-top-label">Chat</span></button></div>'+
         '<h1 id="page-title"></h1>'+
         '<div class="topbar-right">'+
           '<button class="btn btn-outline btn-sm hidden" id="btn-install">⭳ Pasang</button>'+
           (u.role!=='pasien' ? '<button class="avatar-btn" id="btn-global-search" title="Cari pasien" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--ink);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)">🔍</button>' : '')+
           '<button class="avatar-btn ops-notif-btn" id="btn-notifications" title="Notifikasi">🔔<span id="notif-count" class="'+(visibleNotifications.filter(function(n){return !n.read;}).length?'':'hidden')+'">'+visibleNotifications.filter(function(n){return !n.read;}).length+'</span></button>'+
           '<button class="avatar-btn" id="btn-account" title="Akun">'+esc(initial)+'</button>'+
         '</div>'+
       '</div>'+
       '<div class="content" id="main-content"></div>'+
     '</div>'+
     '<nav class="bottom-tabbar '+(u.role==='pasien'?'patient-bottom-nav':(u.role==='admin'?'admin-bottom-nav':(u.role==='dokter'?'doctor-bottom-nav':'')))+'" id="bottom-tabbar">'+bottomTabsHtml+'</nav>'+
   '</div>';

  bindShellEvents(overflow);
  const renderer = MODULE_RENDERERS[route];
  if(renderer) renderer();
  bindContentNavigation();
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
  const topChat = document.getElementById('btn-top-chat');
  if(topChat) topChat.addEventListener('click', ()=> navigate(Session.currentUser && Session.currentUser.role==='pasien' ? 'pasien-chat' : 'chat-pasien'));
  const adminServiceMenu = document.getElementById('btn-admin-service-menu');
  if(adminServiceMenu) adminServiceMenu.addEventListener('click', ()=> openAdminMenuFolder());

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
  const list=getVisibleNotifications().slice(0,30);
  document.getElementById('modal-root').innerHTML='<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet"><div class="sheet-handle"></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 6px 10px"><h2>🔔 Notifikasi</h2><button class="btn btn-ghost btn-sm" id="btn-mark-notif-read">Tandai semua dibaca</button></div>'+
    (list.length?list.map(function(n){return '<div class="notification-item '+(n.read?'':'unread')+'"><div class="notification-icon">'+(n.type==='queue'?'🎫':n.type==='booking'?'📅':'ℹ️')+'</div><div><strong>'+esc(n.title)+'</strong><div>'+esc(n.body)+'</div><span>'+formatTanggalWaktu(n.createdAt)+'</span></div></div>';}).join(''):'<div class="empty">Belum ada notifikasi.</div>')+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target.id==='modal-overlay')closeModal();});
  const b=document.getElementById('btn-mark-notif-read');
  if(b) b.addEventListener('click',function(){
    getVisibleNotifications().forEach(function(n){n.read=true;});
    Store.save(); closeModal(); renderShell(currentRoute());
  });
  getVisibleNotifications().forEach(function(n){n.read=true;});
  Store.save();
}
function openAdminMenuFolder(){
  // Menu Pelayanan superuser: tepat 16 akses cepat dalam grid 4×4.
  // Semua route tetap terdaftar di sidebar desktop; kartu di sini adalah akses cepat.
  const ordered = ADMIN_SERVICE_MENU_ROUTES.map(function(h){return NAV_ITEMS.find(function(n){return n.hash===h;});}).filter(Boolean);
  const cards=ordered.map(function(n){return '<button class="admin-folder-item" data-nav="'+n.hash+'"><span class="admin-folder-icon">'+n.ic+'</span><span>'+esc(n.label)+'</span></button>';}).join('');
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay admin-folder-overlay" id="modal-overlay"><div class="admin-menu-folder">'+
      '<div class="admin-folder-head"><div><div class="ops-eyebrow">AKSES CEPAT SUPERUSER</div><h2>Pelayanan</h2><div class="hint">16 modul dalam susunan ikon 4 × 4.</div></div><button class="btn btn-ghost btn-icon" id="btn-close-admin-folder" aria-label="Tutup menu Pelayanan">✕</button></div>'+
      '<div class="admin-folder-grid">'+cards+'</div>'+
    '</div></div>';
  document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target.id==='modal-overlay')closeModal();});
  const close=document.getElementById('btn-close-admin-folder'); if(close) close.addEventListener('click',closeModal);
  document.querySelectorAll('.admin-folder-item[data-nav]').forEach(function(b){b.addEventListener('click',function(){closeModal();navigate(this.dataset.nav);});});
}

function openMoreSheet(overflow){
  const listHtml = overflow.map(n=>
    '<button class="sheet-item" data-nav="'+n.hash+'"><span class="ic">'+n.ic+'</span>'+n.label+'</button>'
  ).join('');
  document.getElementById('modal-root').innerHTML =
    '<div class="sheet-overlay" id="modal-overlay"><div class="bottom-sheet">'+
      '<div class="sheet-handle"></div>'+
      '<h2 style="padding:0 6px 8px">Akses Modul</h2>'+listHtml+
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
  if(!Session.currentUser || Session.currentUser.role==='pasien'){ return; }
  if(!isRouteAllowed('rekam-medis', Session.currentUser.role) && Session.currentUser.role!=='loket' && Session.currentUser.role!=='rawat_jalan'){ return; }
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
  const results = accessiblePatients(Session.currentUser).filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower)).slice(0,12);
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
        '<h1>SIMRS PROTOTYPE</h1>'+
        '<div class="sub">SIMRS PROTOTYPE — Sistem Informasi Manajemen Rumah Sakit</div>'+
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
  const sections=[
    {title:'🛡️ ADMINISTRASI SISTEM',hint:'Pengelolaan konfigurasi, akun, master data, dan audit.',items:[['admin','Admin Sistem — Siti Rahayu']]},
    {title:'📝 PENDAFTARAN RAWAT JALAN',hint:'Registrasi, booking, check-in, dan antrean sesuai kewenangan.',items:[['loket','Petugas Loket'],['rawatjalan','Petugas Rawat Jalan']]},
    {title:'🩺 DOKTER & PERAWAT RAWAT JALAN',hint:'Akun dokter dan perawat/asisten dibatasi menurut poli penugasan.',items:[['dokter.umum','Dokter Poli Umum'],['dokter.anak','Dokter Poli Anak'],['dokter.gigi','Dokter Poli Gigi'],['dokter.jantung','Dokter Poli Jantung'],['dokter.sany','Dokter Poli Jantung — Sesi Alternatif'],['dokter.penyakitdalam','Dokter Penyakit Dalam'],['asisten.umum','Perawat/Asisten Poli Umum'],['asisten.anak','Perawat/Asisten Poli Anak'],['asisten.gigi','Perawat/Asisten Poli Gigi'],['asisten.jantung','Perawat/Asisten Poli Jantung'],['asisten.penyakitdalam','Perawat/Asisten Penyakit Dalam']]},
    {title:'🚑 INSTALASI GAWAT DARURAT',hint:'IGD dimulai petugas/rujukan; monitor poli tidak ditampilkan di akun IGD.',items:[['dokter.igd','Dokter IGD'],['perawat.igd','Perawat IGD'],['triase.igd','Perawat Triase IGD'],['farmasi.igd','Farmasi IGD'],['kasir.igd','Kasir IGD']]},
    {title:'🏥 RAWAT INAP — ADMISI & DOKTER',hint:'Admisi, dokter DPJP, serta dokter jaga per shift.',items:[['admisi.ranap','Petugas Admisi Rawat Inap'],['dokter.ranap','Dokter DPJP Rawat Inap'],['dokter.jaga.pagi','Dokter Jaga Pagi'],['dokter.jaga.sore','Dokter Jaga Sore'],['dokter.jaga.malam','Dokter Jaga Malam']]},
    {title:'👩‍⚕️ RAWAT INAP — PERAWAT',hint:'Ruang utama dan penugasan shift; ketua shift ditentukan pada master ruang.',items:[['perawat.ranap','Perawat Rawat Inap'],['perawat.ranap.pagi','Perawat Shift Pagi'],['perawat.ranap.sore','Perawat Shift Sore'],['perawat.ranap.malam','Perawat Shift Malam']]},
    {title:'💊 FARMASI & KASIR RAWAT INAP/JALAN',hint:'Akun terpisah untuk setiap konteks pelayanan.',items:[['farmasi.rajal','Farmasi Rawat Jalan'],['kasir.rajal','Kasir Rawat Jalan'],['farmasi.ranap','Farmasi Rawat Inap'],['kasir.ranap','Kasir Rawat Inap']]},
    {title:'🧪 LABORATORIUM & RADIOLOGI',hint:'Pemrosesan permintaan penunjang dan pengembalian hasil ke episode pasien.',items:[['lab','Petugas Laboratorium'],['radiologi','Petugas Radiologi']]},
    {title:'👤 10 AKUN DEMO PASIEN TERPADU',hint:'Setiap akun mulai kosong tanpa booking, antrean, kunjungan, admisi, resep, atau riwayat.',items:[['pasien.demo1','Pasien 1 — Aditya Pratama'],['pasien.demo2','Pasien 2 — Siti Rahmawati'],['pasien.demo3','Pasien 3 — Budi Santoso'],['pasien.demo4','Pasien 4 — Nur Aisyah Putri'],['pasien.demo5','Pasien 5 — Rizky Ramadhan'],['pasien.demo6','Pasien 6 — Dewi Anggraini'],['pasien.demo7','Pasien 7 — Fajar Setiawan'],['pasien.demo8','Pasien 8 — Rina Oktaviani'],['pasien.demo9','Pasien 9 — Dimas Saputra'],['pasien.demo10','Pasien 10 — Maya Puspitasari']]}
  ];
  const make=function(items){return items.map(function(item){const uname=item[0],label=item[1],u=Store.data.users.find(function(x){return x.username===uname;});if(!u)return '';return '<button type="button" class="chip" data-username="'+uname+'" data-password="'+u.password+'">'+label+'</button>';}).join('');};
  return sections.map(function(sec){return '<div class="login-demo-section"><div class="login-demo-title">'+sec.title+'</div><div class="login-demo-hint">'+sec.hint+'</div><div class="chip-row">'+make(sec.items)+'</div></div>';}).join('');
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
  const waiting=visits.filter(function(v){return ['menunggu_screening','screening','menunggu_dokter','menunggu_review'].includes(v.status);}).length;
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
    '<div class="ops-hero"><div><div class="ops-eyebrow">SIMRS COMMAND CENTER · SIMRS PROTOTYPE</div><h2>Monitoring Operasional Harian</h2><p>'+formatTanggalIndo(today)+' · Rawat jalan, IGD, rawat inap, penunjang, dan farmasi.</p></div><div class="ops-hero-actions"><button class="btn btn-outline btn-sm" id="btn-dashboard-refresh">↻ Perbarui</button><button class="btn btn-primary btn-sm" data-nav="cek-antrian">📺 Papan Antrian</button></div></div>'+
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
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>💊 Farmasi</h2><div class="hint">Rawat jalan memakai konsep waktu tunggu pengambilan obat; rawat inap memakai waktu pemenuhan instruksi obat untuk unit perawatan.</div></div><button class="btn btn-ghost btn-sm" data-nav="farmasi-rawat-jalan">Buka Farmasi Rawat Jalan →</button></div><div class="panel-body"><div class="pharmacy-monitor-grid"><div class="pharmacy-monitor"><span>Rawat Jalan</span><strong>'+outPh.pending+'</strong><small>menunggu · max '+outPh.maxWait+' / SLA '+outPh.sla+' mnt</small></div><div class="pharmacy-monitor"><span>Rawat Inap</span><strong>'+inPh.pending+'</strong><small>instruksi · max '+inPh.maxWait+' / SLA '+inPh.sla+' mnt</small></div><div class="pharmacy-monitor '+(outPh.overSla?'danger':'')+'"><span>Lewat SLA RJ</span><strong>'+outPh.overSla+'</strong><small>resep melewati batas</small></div><div class="pharmacy-monitor '+(inPh.overSla?'danger':'')+'"><span>Lewat SLA RI</span><strong>'+inPh.overSla+'</strong><small>instruksi melewati batas</small></div></div><div class="hint" style="margin-top:10px">SLA di atas adalah parameter prototype yang dapat diubah pada pengaturan; bukan klaim standar resmi institusi kesehatan manapun.</div></div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>🚑 IGD & Rawat Inap</h2><div class="hint">Struktur layanan baseline prototype; detail fasilitas wajib diverifikasi sebelum implementasi nyata.</div></div><button class="btn btn-ghost btn-sm" data-nav="ranap">Rawat Inap →</button></div><div class="panel-body"><div class="service-tree"><div><strong>IGD</strong><span>Zona Merah · Zona Kuning · Ambulans Gawat Darurat</span></div><div><strong>Rawat Inap</strong><span>Tulip · Teratai · Mawar Kuning · Mawar Merah Putih · Graha Delta Husada</span></div><div><strong>Rawat Intensif</strong><span>ICU · ICCU · PICU · NICU · HCU</span></div><div><strong>Ruang Bersalin</strong><span>Pelayanan rawat inap maternal</span></div></div></div></section></div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>📈 Alur Hari Ini</h2><div class="hint">BOOKING → CHECK-IN → MENUNGGU → DIPERIKSA → SELESAI.</div></div></div><div class="panel-body"><div class="flow-status-grid">'+[['BOOKING',bookingHariIni.length,'slate'],['CHECK-IN',checkedIn,'sage'],['MENUNGGU',waiting,'amber'],['DIPERIKSA',diperiksa,'clinical'],['SELESAI',selesai,'slate']].map(function(x){return '<div class="flow-status '+x[2]+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>';}).join('')+'</div></div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>💊 Stok Kritis</h2><div class="hint">Obat di bawah batas minimum.</div></div></div><div class="panel-body">'+(obatMenipis.length?obatMenipis.slice(0,8).map(function(m){return '<div class="ops-stock-row"><span>'+esc(m.nama)+'</span><strong>'+m.stok+' '+esc(m.satuan)+'</strong></div>';}).join(''):'<div class="ops-empty">✓ Stok aman.</div>')+'</div></section></div>';
  const btn=document.getElementById('btn-dashboard-refresh'); if(btn) btn.addEventListener('click',renderDashboard);
}

function getPatientActiveIgdVisit(patientId){
  const active=['menunggu_poli','dipanggil','diperiksa','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','obat_siap','menunggu_bayar'];
  return Store.data.visits.filter(function(v){return v.patientId===patientId&&v.unit==='igd'&&active.includes(v.status);}).sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);})[0]||null;
}
function getPatientActiveVisit(patientId){
  const activeStatuses=['menunggu_screening','screening','menunggu_dokter','dipanggil','diperiksa','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap','menunggu_rujukan_igd','rujuk_ranap'];
  const list=Store.data.visits.filter(function(v){
    if(v.patientId!==patientId || (v.unit||'rawat-jalan')!=='rawat-jalan' || ['dibatalkan','tidak_hadir'].includes(v.status)) return false;
    const resep=getResepByVisit(v.id);
    const resepMasihBerjalan=!!(resep && ['menunggu','disiapkan'].includes(resep.status));
    return activeStatuses.includes(v.status) || resepMasihBerjalan;
  });
  return list.sort(function(a,b){return new Date(b.updatedAt||b.createdAt||b.tanggal)-new Date(a.updatedAt||a.createdAt||a.tanggal);})[0] || null;
}

function getPatientActiveJourney(patientId){
  // Satu perjalanan utama per pasien. Prioritas mengikuti episode yang benar-benar aktif,
  // bukan tombol/menu terakhir yang dibuka pasien.
  const admission=getPatientActiveAdmission(patientId);
  if(admission) return {unit:'rawat-inap',episode:admission};
  const igd=getPatientActiveIgdVisit(patientId);
  if(igd) return {unit:'igd',episode:igd};
  const visit=getPatientActiveVisit(patientId);
  if(visit) return {unit:'rawat-jalan',episode:visit};
  return null;
}
function queueNumberValue(no){ const m=String(no||'').match(/(\d+)$/); return m?parseInt(m[1],10):null; }
function getPatientQueueState(visit){
  if(!visit) return null;
  const all=visitsToday().filter(function(v){return samePoli(v.poliId,visit.poliId) && v.unit==='rawat-jalan' && !['tidak_hadir','dibatalkan'].includes(v.status);});
  const mine=queueNumberValue(visit.noAntrian);
  const servedStatuses=['menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap','selesai'];
  const served=all.filter(function(v){ const n=queueNumberValue(v.noAntrian); return n!==null && mine!==null && n<mine && servedStatuses.includes(v.status); });
  const active=all.filter(function(v){return ['diperiksa','dipanggil'].includes(v.status);}).sort(function(a,b){
    const rank=function(v){return v.status==='diperiksa'?0:1;};
    return rank(a)-rank(b) || (queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999);
  })[0] || null;
  const activeNo=queueNumberValue(active && active.noAntrian);
  const aheadList=all.filter(function(v){
    const n=queueNumberValue(v.noAntrian);
    return n!==null && mine!==null && n<mine && !servedStatuses.includes(v.status) && v.id!==visit.id;
  });
  const ahead=aheadList.length;
  const waitingAfter=all.filter(function(v){
    const n=queueNumberValue(v.noAntrian);
    return n!==null && mine!==null && n>mine && !servedStatuses.includes(v.status);
  });
  const currentNo=activeNo!==null ? active.noAntrian : (aheadList[0]?aheadList.sort(function(a,b){return (queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999);})[0].noAntrian:'—');
  return {list:all,mine:mine,active:active,currentNo:currentNo,ahead:ahead,waitingBefore:aheadList.length,servedCount:served.length,waitingAfter:waitingAfter.length,total:all.length};
}
function maybeNotifyPatientQueue(){
  const u=Session.currentUser;
  if(!u || u.role!=='pasien' || !u.patientId) return;
  const activeJourney=getPatientActiveJourney(u.patientId);
  if(!activeJourney||activeJourney.unit!=='rawat-jalan') return;
  const v=activeJourney.episode; if(!v) return;
  const q=getPatientQueueState(v); if(!q) return;
  const ahead=q.ahead;
  if(ahead<=3 && ahead>=0 && !['selesai','menunggu_farmasi','menunggu_bayar','obat_siap'].includes(v.status)){
    const key='queue-alert-'+v.id+'-'+ahead;
    const sent=JSON.parse(localStorage.getItem('simrs_patient_alerts_v1')||'{}');
    if(!sent[key]){
      const poli=getPoli(v.poliId);
      const body=ahead===0 ? 'Nomor Anda sedang dipanggil. Silakan segera menuju '+poli.nama+'.' : 'Antrean Anda '+v.noAntrian+'. Tinggal '+ahead+' pasien lagi. Mohon segera menuju '+poli.nama+' agar tidak terlewat.';
      pushNotification('queue','⏰ Giliran Anda semakin dekat',body,u.patientId,u.id);
      sent[key]=Date.now(); localStorage.setItem('simrs_patient_alerts_v1',JSON.stringify(sent));
      if('Notification' in window && Notification.permission==='granted'){
        try{ new Notification('SIMRS — '+poli.nama,{body:body,tag:key}); }catch(e){}
      }
    }
  }
}
function addDaysISODate(dateStr, days){ const d=new Date(dateStr+'T00:00:00'); d.setDate(d.getDate()+days); return todayStr(d); }
function patientBookingWindowValid(tanggal, layanan, now){
  now=now instanceof Date?now:new Date();
  const today=todayStr(now), h3=addDaysISODate(today,3);
  if(!tanggal) return false;
  const isExecutive=layanan==='Poliklinik Eksekutif';
  // Pembukaan tanggal H+3 mengikuti pola Mobile JKN: mulai pukul 00.01 WIB.
  if(tanggal===h3 && (now.getHours()*60+now.getMinutes())<1) return false;
  if(isExecutive){
    if(tanggal<today || tanggal>h3) return false;
    // Booking eksekutif hari H masih dibuka sampai tepat pukul 12.00 WIB.
    if(tanggal===today && (now.getHours()*60+now.getMinutes())>12*60) return false;
    return true;
  }
  // Reguler: hanya H-1, H-2, dan H-3; hari H wajib melalui petugas loket.
  return tanggal>=addDaysISODate(today,1) && tanggal<=h3;
}
function patientBookingWindowHint(layanan){
  if(layanan==='Poliklinik Eksekutif') return 'Booking dibuka mulai 00.01 WIB pada H-3 sampai H-1. Hari H dapat dipesan online hingga pukul 12.00 WIB, hanya jika jadwal dokter dan kuota masih tersedia. Anda boleh memilih dokter.';
  return 'Booking online hanya untuk H-1, H-2, atau H-3 dan dibuka mulai 00.01 WIB pada H-3. Hari H wajib mendaftar langsung di loket; dokter ditentukan otomatis oleh sistem.';
}
function patientBookingMaxDate(now){
  now=now instanceof Date?now:new Date();
  return addDaysISODate(todayStr(now),3);
}
function patientBookings(patientId){
  return Store.data.bookings.filter(function(b){return b.patientId===patientId;}).sort(function(a,b){return b.tanggalKontrol.localeCompare(a.tanggalKontrol)||a.noAntrian.localeCompare(b.noAntrian);});
}
function doctorMasterForSchedule(sc){
  if(!sc) return null;
  return doctorMasterById(sc.doctorId) || Store.data.users.find(function(u){return u.id===scheduleDoctorUserId(sc);}) || null;
}
function patientDoctorOptions(poliId,tanggal, layanan){
  const list=getDoctorSchedulesForDate(poliId,tanggal);
  const seen={};
  return list.filter(function(sc){
    const did=scheduleDoctorUserId(sc); if(!did || seen[did]) return false;
    seen[did]=true; return true;
  }).map(function(sc){
    const d=doctorMasterForSchedule(sc); if(!d) return '';
    return '<option value="'+esc(String(scheduleDoctorUserId(sc)))+'">'+esc(d.nama||'Dokter')+'</option>';
  }).join('');
}
function doctorLabelForSchedule(sc){
  const d=doctorMasterForSchedule(sc); return d ? (d.nama||'Dokter') : 'Dokter';
}
function patientScheduleList(poliId,tanggal,doctorId, layanan){
  if(!poliId || !tanggal || layanan!=='Poliklinik Eksekutif') return [];
  return getDoctorSchedulesForDate(poliId,tanggal).filter(function(sc){
    return scheduleMatchesDoctor(sc,doctorId);
  }).filter(function(sc){
    const load=queueLoadForSession(poliId,tanggal,sc.id);
    return load.total<sessionCapacity(sc);
  });
}
function buildExecutiveTimeSlots(poliId,tanggal,doctorId){
  const sessions=patientScheduleList(poliId,tanggal,doctorId,'Poliklinik Eksekutif');
  const slots=[];
  sessions.forEach(function(sc){
    const parts=String(sc.jamMulai||'00:00').split(':').map(Number);
    const end=String(sc.jamSelesai||'23:59').split(':').map(Number);
    let cur=parts[0]*60+parts[1], finish=end[0]*60+end[1];
    const step=15;
    while(cur<finish){
      const hh=String(Math.floor(cur/60)%24).padStart(2,'0'), mm=String(cur%60).padStart(2,'0');
      const time=hh+':'+mm, value=time+'|'+sc.id;
      const used=Store.data.bookings.some(function(b){return samePoli(b.poliId,poliId)&&b.tanggalKontrol===tanggal&&b.sessionId===sc.id&&b.appointmentTime===time&&!['dibatalkan','kadaluarsa','tidak_hadir'].includes(b.status);});
      const now=new Date(), currentTime=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
      const alreadyPassed=tanggal===todayStr() && time<=currentTime;
      if(!used&&!alreadyPassed&&!slots.some(function(x){return x.value===value;})) slots.push({value:value,label:time,session:sc});
      cur+=step;
    }
  });
  return slots;
}
function renderPatientBooking(){
  setPageTitle('Rawat Jalan');
  const u=Session.currentUser, p=getPatient(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const today=todayStr(), min=addDaysISODate(today,1), max=patientBookingMaxDate();
  document.getElementById('main-content').innerHTML=
    pageIntro('Pendaftaran pasien dibuat terpisah antara Poli Reguler/Spesialis dan Poli Eksekutif. QR/barcode yang diterbitkan membawa jenis layanan, poli, dokter, jadwal, dan nomor antrean untuk proses check-in.')+
    '<div class="panel"><div class="panel-head"><div><h2>📅 Pendaftaran Rawat Jalan</h2><div class="hint">Pilih alur layanan terlebih dahulu agar proses pendaftaran sesuai konteks pelayanan.</div></div></div><div class="panel-body">'+
    '<form id="patient-booking-form">'+
    '<div class="service-choice-grid patient-service-choice"><button type="button" class="service-choice active" data-pb-service="Poliklinik Spesialis"><strong>🩺 Poli Reguler</strong><span>Poliklinik Spesialis · antrean reguler</span></button><button type="button" class="service-choice" data-pb-service="Poliklinik Eksekutif"><strong>⭐ Poli Eksekutif</strong><span>Pilih dokter dan waktu/janji</span></button></div>'+ 
    '<div class="field"><label>Poli / Klinik</label><select id="pb-poli" required></select></div>'+ 
    '<div class="field"><label>Tanggal Kunjungan</label><input type="date" id="pb-tanggal" min="'+min+'" max="'+max+'" value="'+min+'" required><div class="hint" id="pb-window-hint"></div></div>'+ 
    '<div class="field hidden" id="pb-dokter-wrap"><label>Pilih Dokter</label><select id="pb-dokter"></select><div class="hint">Pilihan dokter hanya tersedia untuk Poli Eksekutif. Poli Reguler menggunakan alokasi dokter/sesi otomatis.</div></div>'+ 
    '<div class="field hidden" id="pb-waktu-wrap"><label>Waktu / Janji Eksekutif</label><select id="pb-waktu"><option value="">Pilih waktu tersedia</option></select><div class="hint">Waktu merupakan slot prototype berdasarkan sesi dokter yang masih memiliki kapasitas.</div></div>'+ 
    '<div class="field"><label>Penjamin</label><select id="pb-penjamin"><option value="BPJS">JKN / BPJS</option><option value="Umum">Umum</option><option value="Asuransi">Asuransi</option></select></div>'+ 
    '<div id="pb-asuransi" class="field hidden"><label>Nama Asuransi</label><input id="pb-asuransi-name" placeholder="Masukkan nama perusahaan asuransi"></div>'+ 
    '<div id="pb-service-note" class="alert alert-info"></div>'+ 
    '<button class="btn btn-primary btn-block" type="submit">Buat Pendaftaran &amp; Tiket</button></form></div></div>';
  const layananButtons=document.querySelectorAll('[data-pb-service]'), poli=document.getElementById('pb-poli'), tanggal=document.getElementById('pb-tanggal'), dokter=document.getElementById('pb-dokter'), dokterWrap=document.getElementById('pb-dokter-wrap'), waktuWrap=document.getElementById('pb-waktu-wrap'), waktu=document.getElementById('pb-waktu'), pen=document.getElementById('pb-penjamin'), as=document.getElementById('pb-asuransi'), hint=document.getElementById('pb-window-hint'), note=document.getElementById('pb-service-note');
  let layanan='Poliklinik Spesialis';
  function refreshPoli(){
    const options=Store.data.poli.filter(function(x){return x.official===true && (layanan==='Poliklinik Spesialis' ? (x.layanan==='Poliklinik Spesialis' || x.layanan==='Rawat Jalan') : x.layanan===layanan);}).sort(function(a,b){return a.nama.localeCompare(b.nama);});
    poli.innerHTML=options.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.nama)+'</option>';}).join('');
    refreshDoctors();
  }
  function refreshDoctors(){
    const isEx=layanan==='Poliklinik Eksekutif';
    const currentToday=todayStr(), earliest=isEx?currentToday:addDaysISODate(currentToday,1), latest=patientBookingMaxDate();
    tanggal.min=earliest; tanggal.max=latest;
    if(!tanggal.value || tanggal.value<earliest || tanggal.value>latest) tanggal.value=earliest;
    dokterWrap.classList.toggle('hidden',!isEx);
    dokter.required=isEx;
    const list=getDoctorSchedulesForDate(poli.value,tanggal.value).filter(function(sc){
      const load=queueLoadForSession(poli.value,tanggal.value,sc.id);
      if(load.total>=sessionCapacity(sc)) return false;
      if(tanggal.value===todayStr()){
        const now=new Date(), currentTime=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
        if(String(sc.jamSelesai||'23:59')<=currentTime) return false;
      }
      return true;
    });
    const byDoctor={};
    list.forEach(function(sc){const did=scheduleDoctorUserId(sc);if(did&&!byDoctor[did])byDoctor[did]=sc;});
    const ids=Object.keys(byDoctor);
    if(isEx){
      dokter.innerHTML=ids.length?'<option value="">Pilih dokter</option>'+ids.map(function(did){const d=doctorMasterForSchedule(byDoctor[did]);return '<option value="'+esc(did)+'">'+esc(d?d.nama:did)+'</option>';}).join(''):'<option value="">Tidak ada jadwal dokter pada tanggal ini</option>';
    }else{
      dokter.innerHTML='<option value="AUTO">⚡ Sistem memilih dokter/sesi otomatis</option>';
    }
    if(!isEx) dokter.value='AUTO';
    waktuWrap.classList.toggle('hidden',!isEx);
    refreshTimes();
    hint.textContent=patientBookingWindowHint(layanan);
    note.innerHTML=isEx?'<strong>Alur Eksekutif:</strong> pasien memilih klinik, dokter, serta waktu/janji yang tersedia. Pendaftaran dan antrean Eksekutif dipisahkan dari Reguler.':'<strong>Alur Reguler:</strong> pasien memilih klinik dan tanggal. Dokter/sesi ditentukan otomatis oleh sistem berdasarkan jadwal dan kapasitas.';
  }
  function refreshTimes(){
    if(layanan!=='Poliklinik Eksekutif'){waktu.innerHTML='<option value="">Tidak diperlukan</option>';return;}
    const slots=buildExecutiveTimeSlots(poli.value,tanggal.value,dokter.value);
    waktu.innerHTML=slots.length?'<option value="">Pilih waktu tersedia</option>'+slots.map(function(x){return '<option value="'+esc(x.value)+'">'+esc(x.label)+' · sesi '+esc(x.session.jamMulai)+'–'+esc(x.session.jamSelesai)+'</option>';}).join(''):'<option value="">Tidak ada slot tersedia</option>';
  }
  layananButtons.forEach(function(btn){btn.addEventListener('click',function(){layanan=btn.dataset.pbService;layananButtons.forEach(function(x){x.classList.remove('active');});btn.classList.add('active');refreshPoli();});});
  poli.addEventListener('change',refreshDoctors); tanggal.addEventListener('change',refreshDoctors); dokter.addEventListener('change',refreshTimes); pen.addEventListener('change',function(){as.classList.toggle('hidden',pen.value!=='Asuransi');});
  refreshPoli();
  document.getElementById('patient-booking-form').addEventListener('submit',function(e){e.preventDefault();submitPatientBooking();});
}

function renderPatientBookingSaya(){
  setPageTitle('Booking Saya');
  const u=Session.currentUser, p=getPatient(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const list=patientBookings(p.id).slice(0,20);
  document.getElementById('main-content').innerHTML=
    pageIntro('Semua tiket booking Rawat Jalan Anda tersimpan di sini. Ketuk tiket kapan saja untuk menampilkan kembali QR/barcode tanpa perlu screenshot.')+
    '<section class="panel"><div class="panel-head"><div><h2>🎫 Booking Saya</h2><div class="hint">Tiket dapat dibuka kembali dan diunduh kapan saja.</div></div></div><div class="panel-body" id="patient-booking-list"></div></section>';
  renderPatientBookingList(p.id);
}

function renderPatientRiwayat(){
  setPageTitle('Riwayat');
  const u=Session.currentUser, p=getPatient(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const visits=patientVisits(p.id).filter(function(v){return v.diagnosis||v.catatan||v.vital||v.screening||v.status==='selesai';}).sort(function(a,b){return new Date(b.tanggal||b.createdAt)-new Date(a.tanggal||a.createdAt);});
  const admissions=(Store.data.admissions||[]).filter(function(a){return a.patientId===p.id;}).sort(function(a,b){return new Date(b.tanggalMasuk||b.createdAt)-new Date(a.tanggalMasuk||a.createdAt);});
  const rj=visits.filter(function(v){return (v.unit||'rawat-jalan')==='rawat-jalan';});
  const igd=visits.filter(function(v){return v.unit==='igd';});
  const card=function(v,unit){const poli=getPoli(v.poliId);return '<div class="history-item"><div class="when">'+formatTanggalIndo(v.tanggal||v.createdAt)+'</div><strong>'+esc(unit==='igd'?'Kunjungan IGD':(poli?poli.nama:'Rawat Jalan'))+'</strong><div class="hint">Status: '+esc((STATUS_MAP[v.status]||{label:v.status||'Tercatat'}).label)+'</div></div>';};
  document.getElementById('main-content').innerHTML=pageIntro('Riwayat pelayanan disusun berdasarkan jenis layanan. Episode tetap terpisah dan tertaut ke identitas pasien yang sama.')+
    '<div class="panel"><div class="panel-head"><h2>🩺 Rawat Jalan</h2><span class="badge">'+rj.length+'</span></div><div class="panel-body">'+(rj.length?rj.map(function(v){return card(v,'rawat-jalan');}).join(''):'<div class="empty">Belum ada riwayat Rawat Jalan.</div>')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>🏥 Rawat Inap</h2><span class="badge">'+admissions.length+'</span></div><div class="panel-body">'+(admissions.length?admissions.map(function(a){const w=(Store.data.wards||[]).find(function(x){return x.id===a.wardId;});return '<div class="history-item"><div class="when">'+formatTanggalIndo(a.tanggalMasuk||a.createdAt)+'</div><strong>'+(w?esc(w.nama):'Rawat Inap')+'</strong><div class="hint">Status: '+esc(a.status||'Tercatat')+' · Kelas '+esc(a.kelasPerawatan||'-')+'</div></div>';}).join(''):'<div class="empty">Belum ada riwayat Rawat Inap.</div>')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>🚑 IGD</h2><span class="badge">'+igd.length+'</span></div><div class="panel-body">'+(igd.length?igd.map(function(v){return card(v,'igd');}).join(''):'<div class="empty">Belum ada riwayat IGD.</div>')+'</div></div>';
}

let selectedStaffChatPatientId=null;
function renderPatientInfo(){
  setPageTitle('Informasi');
  const u=Session.currentUser, p=getPatient(u.patientId);
  const notices=(Store.data.hospitalAnnouncements||[]).filter(function(n){return n.active!==false;}).sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
  const activeVisit=getPatientActiveVisit(u.patientId), upcomingBooking=Store.data.bookings.filter(function(b){return b.patientId===u.patientId&&b.tanggalKontrol>=todayStr()&&['terjadwal','checked_in'].includes(b.status);}).sort(function(a,b){return a.tanggalKontrol.localeCompare(b.tanggalKontrol);})[0];
  const relevantPoliIds=new Set([activeVisit&&canonicalPoliId(activeVisit.poliId),upcomingBooking&&canonicalPoliId(upcomingBooking.poliId)].filter(Boolean));
  const practice=(Store.data.poliMessages||[]).filter(function(m){return relevantPoliIds.has(canonicalPoliId(m.poliId));}).slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
  const relevant=(Store.data.notifications||[]).filter(function(n){return n.target===u.patientId&&['schedule','announcement','info','news','promotion'].includes(n.type);});
  document.getElementById('main-content').innerHTML=pageIntro('Informasi satu arah dari rumah sakit. Untuk membalas pesan atau mengatur tindak lanjut pelayanan, buka Chat Pelayanan.')+
    '<div class="panel"><div class="panel-head"><h2>📣 Pengumuman Rumah Sakit</h2></div><div class="panel-body">'+(notices.length?notices.map(function(n){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(n.createdAt)+' · '+esc(n.kategori||'Informasi')+'</div><strong>'+esc(n.judul)+'</strong><div>'+esc(n.isi)+'</div></div>';}).join(''):'<div class="empty">Belum ada pengumuman terbaru.</div>')+'</div></div>'+
    '<div class="panel"><div class="panel-head"><h2>🩺 Informasi Jadwal & Pelayanan</h2></div><div class="panel-body">'+(relevant.length?relevant.map(function(n){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(n.createdAt)+'</div><strong>'+esc(n.title)+'</strong><div>'+esc(n.body)+'</div></div>';}).join(''):'')+(practice.length?practice.slice(0,10).map(function(m){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(m.createdAt)+' · '+esc(m.authorName||'Petugas')+' · '+esc((getPoli(m.poliId)||{nama:'Rumah Sakit'}).nama)+'</div><strong>'+esc(POLI_MSG_LABEL[m.tipe]||'Informasi praktik')+'</strong><div>'+esc(m.pesan)+'</div></div>';}).join(''):'')+((!relevant.length&&!practice.length)?'<div class="empty">Belum ada informasi jadwal untuk ditampilkan.</div>':'')+'</div></div>'+
    '<div class="panel"><div class="panel-body"><h2>💬 Butuh tindak lanjut?</h2><p>Gunakan Chat Pelayanan untuk pesan dua arah mengenai jadwal ulang, dokter pengganti, atau pertanyaan kunjungan.</p><button class="btn btn-primary" id="btn-open-patient-chat">Buka Chat Pelayanan</button></div></div>';
  const b=document.getElementById('btn-open-patient-chat'); if(b)b.addEventListener('click',function(){navigate('pasien-chat');});
}
function renderPatientChat(){
  setPageTitle('Chat Pelayanan');
  const u=Session.currentUser, p=getPatient(u.patientId); if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const msgs=(Store.data.patientChats||[]).filter(function(m){return m.patientId===p.id;}).sort(function(a,b){return new Date(a.createdAt)-new Date(b.createdAt);});
  document.getElementById('main-content').innerHTML=pageIntro('Chat dua arah untuk komunikasi terkait pelayanan. Hindari mengirim keadaan gawat darurat melalui chat; segera hubungi IGD atau layanan darurat.')+
    '<div class="panel"><div class="panel-head"><h2>💬 Chat Pelayanan</h2><span class="badge">'+msgs.length+' pesan</span></div><div class="panel-body"><div class="chat-thread">'+(msgs.length?msgs.map(function(m){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(m.createdAt)+' · '+esc(m.authorName)+' · '+esc(m.authorRole)+(m.topic?' · '+esc(m.topic):'')+'</div><div>'+esc(m.message)+'</div></div>';}).join(''):'<div class="empty">Belum ada percakapan. Anda dapat mengirim pertanyaan atau permintaan tindak lanjut.</div>')+'</div><form id="patient-chat-form" style="margin-top:14px"><div class="field"><label>Kategori pesan</label><select id="patient-chat-topic"><option value="Pertanyaan umum">Pertanyaan umum</option><option value="Permintaan jadwal ulang">Permintaan jadwal ulang</option><option value="Permintaan dokter pengganti">Permintaan dokter pengganti</option><option value="Konfirmasi kunjungan">Konfirmasi kunjungan</option></select></div><div class="field"><label>Pesan untuk petugas rumah sakit</label><textarea id="patient-chat-message" rows="3" maxlength="1200" required placeholder="Tulis pesan atau permintaan tindak lanjut..."></textarea></div><button class="btn btn-primary btn-block" type="submit">Kirim Pesan</button></form></div></div>';
  document.getElementById('patient-chat-form').addEventListener('submit',function(e){e.preventDefault();const input=document.getElementById('patient-chat-message'), message=input.value.trim(), topic=document.getElementById('patient-chat-topic').value;if(!message)return;Store.data.patientChats.push({id:uid('CHAT'),patientId:p.id,authorUserId:u.id,authorName:p.nama,authorRole:'Pasien',topic:topic,message:message,createdAt:nowISO(),readByStaff:false});Store.save();logAudit('chat_pasien_kirim',p.nama+' · '+topic);renderPatientChat();showToast('Pesan terkirim ke inbox petugas.','success');});
}
function renderStaffPatientChat(){
  setPageTitle('Chat Pasien');
  const chats=Store.data.patientChats||[];
  const patientIds=Array.from(new Set(chats.map(function(m){return m.patientId;}).concat((Store.data.patients||[]).map(function(p){return p.id;}))));
  if(!selectedStaffChatPatientId||!patientIds.includes(selectedStaffChatPatientId))selectedStaffChatPatientId=patientIds[0]||null;
  const selected=selectedStaffChatPatientId;
  const patient=selected?getPatient(selected):null;
  const msgs=chats.filter(function(m){return m.patientId===selected;}).sort(function(a,b){return new Date(a.createdAt)-new Date(b.createdAt);});
  document.getElementById('main-content').innerHTML=pageIntro('Inbox komunikasi dua arah untuk petugas. Tindak lanjut jadwal atau dokter pengganti harus berdasarkan keputusan dan jadwal yang sudah dikonfirmasi rumah sakit.')+
    '<div class="panel"><div class="panel-head"><h2>📥 Inbox Chat Pelayanan</h2></div><div class="panel-body">'+(patientIds.length?'<div class="field"><label>Pilih percakapan pasien</label><select id="staff-chat-patient">'+patientIds.map(function(id){const p=getPatient(id);return '<option value="'+esc(id)+'" '+(id===selected?'selected':'')+'>'+esc(p?p.nama:id)+' · '+esc(id)+'</option>';}).join('')+'</select></div><div class="chat-thread">'+msgs.map(function(m){if(!m.readByStaff&&m.authorRole==='Pasien')m.readByStaff=true;return '<div class="history-item"><div class="when">'+formatTanggalWaktu(m.createdAt)+' · '+esc(m.authorName)+' · '+esc(m.authorRole)+'</div><div>'+esc(m.message)+'</div></div>';}).join('')+'</div><form id="staff-chat-form" style="margin-top:14px"><div class="field"><label>Balasan petugas</label><textarea id="staff-chat-message" rows="3" maxlength="1200" required placeholder="Tulis tindak lanjut pelayanan..."></textarea></div><button class="btn btn-primary" type="submit">Kirim Balasan</button></form>':'<div class="empty">Belum ada percakapan pasien.</div>')+'</div></div>';
  const sel=document.getElementById('staff-chat-patient');if(sel)sel.addEventListener('change',function(){selectedStaffChatPatientId=this.value;renderStaffPatientChat();});
  const form=document.getElementById('staff-chat-form');if(form)form.addEventListener('submit',function(e){e.preventDefault();const input=document.getElementById('staff-chat-message'),message=input.value.trim();if(!message||!selectedStaffChatPatientId)return;const u=Session.currentUser,p=getPatient(selectedStaffChatPatientId);Store.data.patientChats.push({id:uid('CHAT'),patientId:selectedStaffChatPatientId,authorUserId:u.id,authorName:u.nama,authorRole:roleLabel(u.role),topic:'Balasan petugas',message:message,createdAt:nowISO(),readByStaff:true});Store.save();pushNotification('chat-reply','Balasan Chat Pelayanan',message,selectedStaffChatPatientId,null);logAudit('chat_pasien_balasan',(p?p.nama:selectedStaffChatPatientId)+' · '+u.nama);renderStaffPatientChat();showToast('Balasan terkirim ke pasien.','success');});
}
function renderHospitalInformationAdmin(){
  setPageTitle('Informasi RS');
  const list=(Store.data.hospitalAnnouncements||[]).slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
  document.getElementById('main-content').innerHTML=pageIntro('Buat pengumuman satu arah untuk aplikasi pasien. Jangan gunakan pengumuman umum untuk mengirim informasi klinis individual.')+
    '<div class="panel"><div class="panel-head"><h2>📣 Buat Pengumuman</h2></div><div class="panel-body"><form id="hospital-announcement-form"><div class="field"><label>Kategori</label><select id="ha-category"><option>Pengumuman</option><option>Jadwal Dokter</option><option>Berita</option><option>Promosi Layanan</option><option>Edukasi Kesehatan</option></select></div><div class="field"><label>Judul</label><input id="ha-title" maxlength="140" required></div><div class="field"><label>Isi informasi</label><textarea id="ha-body" rows="4" maxlength="3000" required></textarea></div><button class="btn btn-primary" type="submit">Terbitkan Informasi</button></form></div></div>'+
    '<div class="panel"><div class="panel-head"><h2>Informasi Terbit</h2></div><div class="panel-body">'+(list.length?list.map(function(n){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(n.createdAt)+' · '+esc(n.kategori)+'</div><strong>'+esc(n.judul)+'</strong><div>'+esc(n.isi)+'</div></div>';}).join(''):'<div class="empty">Belum ada pengumuman.</div>')+'</div></div>';
  document.getElementById('hospital-announcement-form').addEventListener('submit',function(e){e.preventDefault();const kategori=document.getElementById('ha-category').value,judul=document.getElementById('ha-title').value.trim(),isi=document.getElementById('ha-body').value.trim();if(!judul||!isi)return;Store.data.hospitalAnnouncements.unshift({id:uid('INFO'),kategori: kategori,judul:judul,isi:isi,active:true,createdAt:nowISO(),authorId:Session.currentUser.id});Store.save();logAudit('pengumuman_diterbitkan',kategori+' · '+judul);renderHospitalInformationAdmin();showToast('Informasi berhasil diterbitkan.','success');});
}

function submitPatientBooking(){
  const u=Session.currentUser, patientId=u.patientId;
  const layanan=document.querySelector('[data-pb-service].active')?.dataset.pbService || 'Poliklinik Spesialis';
  const poliId=document.getElementById('pb-poli').value, tanggal=document.getElementById('pb-tanggal').value, doctorId=document.getElementById('pb-dokter').value, penjamin=document.getElementById('pb-penjamin').value;
  const waktuRaw=document.getElementById('pb-waktu')?.value||'', asuransi=(document.getElementById('pb-asuransi-name')?.value||'').trim();
  const poli=getPoli(poliId);
  const regularService = layanan==='Poliklinik Spesialis' && poli && (poli.layanan==='Poliklinik Spesialis' || poli.layanan==='Rawat Jalan');
  if(!poli || !(regularService || poli.layanan===layanan)){showToast('Poli tidak sesuai dengan jenis layanan yang dipilih.','danger');return;}
  if(!patientBookingWindowValid(tanggal,layanan)){showToast('Tanggal pendaftaran harus berada pada rentang pendaftaran yang tersedia.','danger');return;}
  if(layanan==='Poliklinik Eksekutif' && !doctorId){showToast('Dokter wajib dipilih untuk Poli Eksekutif.','warning');return;}
  if(penjamin==='Asuransi'&&!asuransi){showToast('Nama asuransi wajib diisi.','danger');return;}
  const existing=Store.data.bookings.find(function(b){return b.patientId===patientId&&samePoli(b.poliId,poliId)&&b.tanggalKontrol===tanggal&&['terjadwal','checked_in'].includes(b.status);});
  if(existing){showToast('Anda sudah memiliki booking aktif pada poli dan tanggal tersebut.','warning');return;}
  let allocation=null, appointmentTime=null;
  if(layanan==='Poliklinik Eksekutif'){
    if(!waktuRaw){showToast('Pilih waktu/janji Eksekutif terlebih dahulu.','warning');return;}
    const parts=waktuRaw.split('|'), sessionId=parts[1];
    const sc=Store.data.doctorSchedules.find(function(x){return x.id===sessionId;});
    if(!sc || !scheduleMatchesDoctor(sc,doctorId)){showToast('Sesi dokter yang dipilih tidak valid. Silakan pilih ulang dokter dan waktu.','danger');return;}
    const load=queueLoadForSession(poliId,tanggal,sc.id);
    if(load.total>=sessionCapacity(sc)){showToast('Sesi dokter tersebut sudah penuh. Silakan pilih waktu lain.','danger');return;}
    allocation={schedule:sc,doctorId:scheduleDoctorUserId(sc),reason:'executive_appointment'};
    appointmentTime=parts[0];
  }else{
    allocation=allocateVisitSession(poliId,tanggal,null);
    if(!allocation){showToast('Seluruh sesi dokter pada poli tersebut sudah penuh. Silakan pilih tanggal lain.','danger');return;}
  }
  const noAntrian=generateNoAntrian(poliId,tanggal);
  const booking={id:uid('BK'),patientId:patientId,poliId:poliId,tanggalKontrol:tanggal,jenisLayanan:layanan,jenisBayar:penjamin,sumber:'Aplikasi Pasien SIMRS PROTOTYPE — Demo',noBpjs:'',noAntrian:noAntrian,dokterId:allocation.doctorId,sessionId:allocation.schedule&&allocation.schedule.id||null,allocationMode:allocation.reason,appointmentTime:appointmentTime,kodeCheckIn:'CHK'+Date.now().toString(36).toUpperCase().slice(-8),status:'terjadwal',asuransiNama:penjamin==='Asuransi'?asuransi:'',confirmedAt:null,arrivalWindowStart:null,arrivalWindowEnd:null,suggestedArrivalAt:null,journeyVersion:1,createdAt:nowISO(),updatedAt:nowISO()};
  const aw=suggestedArrivalWindow(booking); if(aw){booking.arrivalWindowStart=aw.start;booking.arrivalWindowEnd=aw.end;booking.suggestedArrivalAt=aw.start;}
  Store.data.bookings.push(booking); Store.save();
  const doctor=doctorMasterById(booking.dokterId)||Store.data.users.find(function(x){return x.id===booking.dokterId;});
  pushNotification('booking','Pendaftaran Rawat Jalan berhasil',noAntrian+' — '+poli.nama+' · '+layanan+' pada '+formatTanggalIndo(tanggal),patientId,u.id);
  logAudit('patient_booking',noAntrian+' — '+getPatient(patientId).nama+' · '+poli.nama+' · '+layanan+' · '+(doctor?.nama||'Dokter')+(appointmentTime?' · '+appointmentTime:''));
  openPatientBookingTicket(booking.id,true);
  renderPatientBookingList(patientId);
}
function renderPatientBookingList(patientId){
  const el=document.getElementById('patient-booking-list'); if(!el)return;
  const list=patientBookings(patientId).slice(0,20);
  el.innerHTML=list.length?list.map(function(b){
    const p=getPoli(b.poliId), canCancel=b.status==='terjadwal' && ['Umum','Asuransi'].includes(b.jenisBayar) && b.tanggalKontrol>=todayStr();
    const cancelInfo=b.jenisBayar==='BPJS'&&b.status==='terjadwal'?'<div class="hint" style="margin-top:5px">🔒 Pembatalan JKN/BPJS melalui petugas RS</div>':'';
    return '<div class="queue-list-item patient-ticket-row-wrap"><button type="button" class="patient-ticket-row" onclick="openPatientBookingTicket(\''+b.id+'\')"><div><div class="no">'+esc(b.noAntrian)+'</div><div class="nm">'+esc(getPoli(b.poliId).nama)+'</div><div class="hint">'+esc(getPoli(b.poliId).layanan||'Rawat Jalan')+' · '+formatTanggalIndo(b.tanggalKontrol)+' · '+esc(b.jenisBayar)+'</div></div><div style="text-align:right"><span class="badge '+(b.status==='checked_in'?'badge-sage':b.status==='dibatalkan'?'badge-brick':'badge-amber')+'">'+bookingStatusLabel(b.status)+'</span><div class="hint" style="margin-top:6px">Tap untuk buka tiket</div></div></button>'+cancelInfo+(canCancel?'<div class="ticket-row-actions"><button type="button" class="btn btn-danger btn-sm" onclick="cancelPatientBooking(\''+b.id+'\')">✕ Batalkan Booking</button></div>':'')+'</div>';
  }).join(''):'<div class="empty"><div class="big">🎫</div>Belum ada booking.</div>';
}
function cancelPatientBooking(bookingId){
  const b=getPatientBookingById(bookingId);
  if(!b){showToast('Booking tidak ditemukan.','danger');return;}
  if(b.jenisBayar==='BPJS'){showToast('Booking JKN/BPJS tidak dapat dibatalkan dari aplikasi pasien. Hubungi petugas RS.','warning');return;}
  if(!['Umum','Asuransi'].includes(b.jenisBayar)){showToast('Pembatalan mandiri tidak tersedia untuk penjamin ini.','warning');return;}
  if(b.status!=='terjadwal'){showToast('Booking sudah diproses dan tidak dapat dibatalkan dari aplikasi pasien.','warning');return;}
  if(b.tanggalKontrol<todayStr()){showToast('Booking yang sudah lewat tidak dapat dibatalkan.','warning');return;}
  openModal('<div class="modal-head"><div><h2>Batalkan Booking</h2><div class="hint">'+esc(b.noAntrian)+' · '+esc(getPoli(b.poliId).nama)+'</div></div><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p>Apakah Anda yakin ingin membatalkan booking ini?</p><div class="field"><label>Alasan (opsional)</label><textarea id="patient-cancel-reason" placeholder="Contoh: tidak dapat hadir"></textarea></div><div class="alert alert-info">Setelah dibatalkan, nomor antrean tersebut tetap tercatat sebagai pembatalan dan tidak dipakai ulang.</div><button class="btn btn-danger btn-block" id="btn-patient-confirm-cancel">Ya, Batalkan Booking</button></div>');
  document.getElementById('btn-patient-confirm-cancel').addEventListener('click',function(){
    const reason=(document.getElementById('patient-cancel-reason').value||'Tidak disebutkan').trim();
    b.status='dibatalkan'; b.cancelReason=reason; b.updatedAt=nowISO();
    Store.save(); logAudit('patient_booking_dibatalkan',b.noAntrian+' — '+reason); pushNotification('booking','Booking dibatalkan',b.noAntrian+' — '+getPatient(b.patientId).nama,b.patientId);
    closeModal(); renderPatientBookingList(b.patientId); showToast('Booking berhasil dibatalkan.','success');
  });
}

function getPatientBookingById(bookingId){
  const u=Session.currentUser;
  if(!u || u.role!=='pasien') return null;
  return Store.data.bookings.find(function(b){return b.id===bookingId && b.patientId===u.patientId;}) || null;
}
function bookingDoctorMaster(booking){
  if(!booking) return null;
  const sc=booking.sessionId?Store.data.doctorSchedules.find(function(x){return x.id===booking.sessionId;}):null;
  return (sc&&doctorMasterById(sc.doctorId)) || doctorMasterById(booking.dokterId) || Store.data.users.find(function(x){return x.id===booking.dokterId;}) || null;
}
function openPatientBookingTicket(bookingId, fresh){
  const booking=getPatientBookingById(bookingId);
  if(!booking){showToast('Tiket tidak ditemukan.','danger');return;}
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  const aw=suggestedArrivalWindow(booking);
  const dm=bookingDoctorMaster(booking);
  const status=bookingStatusLabel(booking.status);
  openModal('<div class="modal-head"><div><h2>🎫 Tiket Rawat Jalan</h2><div class="hint">'+PROTOTYPE_NAME+' · '+PROTOTYPE_MODE+'</div></div><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body ticket-modal-compact">'+
    '<div class="patient-ticket ticket-download-target">'+
      '<span>NOMOR ANTREAN</span><strong>'+esc(booking.noAntrian)+'</strong><b>'+esc(poli.nama)+'</b>'+ 
      '<small>'+formatTanggalIndo(booking.tanggalKontrol)+' · '+esc(booking.jenisLayanan||poli.layanan)+' · '+esc(booking.jenisBayar)+'</small>'+ 
      (dm?'<small class="ticket-doctor">👨‍⚕️ '+esc(dm.nama)+(booking.appointmentTime?' · '+esc(booking.appointmentTime):'')+'</small>':'')+
      (aw?'<div class="ticket-arrival"><span>⏰ Estimasi kedatangan</span><strong>'+esc(aw.text)+'</strong><small>Estimasi prototype berdasarkan sesi dan posisi antrean.</small></div>':'')+
      '<div class="ticket-qr">'+renderQrSvg(booking.kodeCheckIn,150)+'</div>'+ 
      '<small class="ticket-code">Kode check-in: <span class="mono">'+esc(booking.kodeCheckIn)+'</span></small>'+ 
      '<span class="badge '+(booking.status==='checked_in'?'badge-sage':booking.status==='dibatalkan'?'badge-brick':'badge-amber')+'">'+esc(status)+'</span>'+ 
    '</div>'+ 
    '<div class="ticket-note">Tunjukkan QR/barcode ini saat check-in di loket.</div>'+ 
    '<div class="ticket-actions"><button class="btn btn-primary" onclick="downloadPatientTicket(\''+booking.id+'\')">⬇️ Download Tiket</button><button class="btn btn-outline" onclick="printPatientTicket(\''+booking.id+'\')">🖨️ Cetak / Simpan PDF</button></div>'+ 
    '<div class="ticket-rule-hint">'+(String(booking.poliId||'').startsWith('EX-')?'Eksekutif: dokter dan sesi mengikuti jadwal eksekutif yang dipilih.':'Reguler: nomor antrean mengikuti poli + tanggal dan dokter dialokasikan sesuai jadwal/kapasitas.')+'</div>'+ 
  '</div></div>');
}
function downloadPatientTicket(bookingId){
  const booking=getPatientBookingById(bookingId); if(!booking)return;
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  const svg=renderQrSvg(booking.kodeCheckIn,230);
  const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d'), scale=2;
  canvas.width=900*scale; canvas.height=1250*scale; ctx.scale(scale,scale);
  ctx.fillStyle='#f7faf9'; ctx.fillRect(0,0,900,1250);
  ctx.fillStyle='#ffffff'; ctx.strokeStyle='#d8e5e1'; ctx.lineWidth=2;
  if(ctx.roundRect) ctx.roundRect(45,45,810,1160,30); else ctx.rect(45,45,810,1160); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#0e5c56'; ctx.font='700 30px Arial'; ctx.fillText('SIMRS PROTOTYPE',80,105);
  ctx.fillStyle='#687773'; ctx.font='18px Arial'; ctx.fillText('TIKET RAWAT JALAN',80,145);
  ctx.fillStyle='#263b37'; ctx.font='700 72px monospace'; ctx.fillText(booking.noAntrian,80,245);
  ctx.font='700 30px Arial'; ctx.fillText(poli.nama,80,300);
  ctx.font='20px Arial'; ctx.fillText(formatTanggalIndo(booking.tanggalKontrol)+' · '+(booking.jenisLayanan||poli.layanan),80,340);
  const dm=bookingDoctorMaster(booking); if(dm){ctx.fillText('Dokter: '+dm.nama,80,450);} if(booking.appointmentTime){ctx.fillText('Janji: '+booking.appointmentTime,80,485);}
  ctx.fillText('Pasien: '+p.nama,80,380);
  ctx.fillText('Penjamin: '+booking.jenisBayar,80,415);
  const img=new Image(); const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob);
  img.onload=function(){ctx.drawImage(img,335,475,230,230);URL.revokeObjectURL(url);ctx.fillStyle='#687773';ctx.font='18px monospace';ctx.textAlign='center';ctx.fillText(booking.kodeCheckIn,450,750);ctx.font='18px Arial';ctx.fillText('Tunjukkan QR/barcode ini saat check-in di loket.',450,805);ctx.fillText('Simpan tiket ini di ponsel Anda.',450,840);ctx.textAlign='left';const a=document.createElement('a');a.download='Tiket-'+booking.noAntrian+'-'+booking.tanggalKontrol+'.png';a.href=canvas.toDataURL('image/png');a.click();showToast('Tiket berhasil diunduh.','success');};
  img.onerror=function(){URL.revokeObjectURL(url);showToast('Tiket gagal diunduh. Silakan coba lagi.','danger');}; img.src=url;
}
function printPatientTicket(bookingId){
  const booking=getPatientBookingById(bookingId); if(!booking)return;
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  printArea('<div style="max-width:420px;margin:30px auto;text-align:center;font-family:Arial,sans-serif"><h2>SIMRS PROTOTYPE</h2><h3>Tiket Rawat Jalan</h3><div style="font-size:64px;font-weight:800;font-family:monospace">'+esc(booking.noAntrian)+'</div><h3>'+esc(poli.nama)+'</h3><p>'+formatTanggalIndo(booking.tanggalKontrol)+' · '+esc(poli.layanan)+'</p><p>Pasien: '+esc(p.nama)+'</p><div style="margin:20px auto;width:190px">'+renderQrSvg(booking.kodeCheckIn,190)+'</div><p>'+esc(booking.kodeCheckIn)+'</p><p>Tunjukkan QR/barcode ini saat check-in di loket.</p></div>');
}

function getPatientActiveAdmission(patientId){
  // Episode RI tetap tampil sampai tagihan selesai; status selesai medis saja belum berarti seluruh perjalanan administrasi berakhir.
  return Store.data.admissions.filter(function(a){return a.patientId===patientId && (a.status==='dirawat' || (a.billing&&a.billing.statusBayar!=='lunas'));}).sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);})[0]||null;
}
function patientInpatientJourney(a){
  if(!a) return '';
  const bed=Store.data.beds.find(function(b){return b.id===a.bedId;})||{};
  const ward=Store.data.wards.find(function(w){return w.id===a.wardId;})||{};
  const orders=Array.isArray(a.orders)?a.orders:[];
  const hasLab=orders.some(function(o){return o.jenis==='lab';});
  const hasRad=orders.some(function(o){return o.jenis==='radiologi';});
  const hasRx=Array.isArray(Store.data.prescriptions) && Store.data.prescriptions.some(function(r){return r.admissionId===a.id;});
  const labDone=hasLab && orders.some(function(o){return o.jenis==='lab'&&o.status==='selesai';});
  const radDone=hasRad && orders.some(function(o){return o.jenis==='radiologi'&&o.status==='selesai';});
  const rxDone=hasRx && Store.data.prescriptions.filter(function(r){return r.admissionId===a.id;}).every(function(r){return ['diambil','diberikan','selesai'].includes(r.status);});
  const hasEvaluation=Array.isArray(a.cppt)&&a.cppt.length>0;
  const dischargePlanned=a.discharge&&a.discharge.status==='direncanakan';
  const discharged=a.status!=='dirawat';
  const main=[
    {key:'admission',label:'Admisi',icon:'📝',state:'done',sub:a.sumberAdmisi||'Episode dibuat'},
    {key:'bed',label:'Gedung / Lantai / Ruang / Kamar / Bed',icon:'🛏️',state:a.bedId?'done':'active',sub:inpatientLocationLabel(ward,bed)},
    {key:'perawatan',label:'Perawatan',icon:'🏥',state:a.status==='dirawat'?'active':'done',sub:a.status==='dirawat'?'Sedang dirawat':'Episode selesai'},
    {key:'evaluasi',label:'Evaluasi',icon:'👨‍⚕️',state:hasEvaluation?'done':(a.status==='dirawat'?'active':'done'),sub:hasEvaluation?'CPPT/visit tercatat':'Menunggu evaluasi'},
    {key:'pulang',label:'Pulang',icon:'🏠',state:discharged?'done':(dischargePlanned?'active':'pending'),sub:discharged?'Selesai medis':(dischargePlanned?'Rencana pulang dibuat':'Belum direncanakan')},
    {key:'billing',label:'Kasir',icon:'🧾',state:a.billing&&a.billing.statusBayar==='lunas'?'done':(discharged?'active':'pending'),sub:a.billing&&a.billing.statusBayar==='lunas'?'Tagihan lunas':'Menunggu penyelesaian tagihan'}
  ];
  const supporting=[];
  if(hasLab) supporting.push({label:'Laboratorium',icon:'🧪',state:labDone?'done':'active',sub:labDone?'Hasil tersedia':'Order menunggu'});
  if(hasRad) supporting.push({label:'Radiologi',icon:'☢️',state:radDone?'done':'active',sub:radDone?'Hasil tersedia':'Order menunggu'});
  if(hasRx) supporting.push({label:'Farmasi',icon:'💊',state:rxDone?'done':'active',sub:rxDone?'Obat selesai diproses':'Instruksi obat aktif'});
  if(a.vitalLog&&a.vitalLog.length) supporting.push({label:'Monitoring',icon:'📈',state:'done',sub:'Tanda vital tercatat'});
  const step=function(x){return '<div class="inpatient-journey-step '+x.state+'"><span class="journey-icon">'+(x.state==='done'?'✓':x.icon)+'</span><div><strong>'+esc(x.label)+'</strong><small>'+esc(x.sub||'')+'</small></div></div>';};
  return '<section class="patient-journey-card"><div class="patient-journey-title"><div><div class="ops-eyebrow">ONE PATIENT · ONE EPISODE · ONE JOURNEY</div><h3>🧭 Perjalanan Rawat Inap</h3></div><span class="journey-legend"><i class="done">✓</i> selesai <i class="active">●</i> aktif <i class="pending">○</i> belum</span></div>'+
    '<div class="inpatient-main-journey">'+main.map(step).join('')+'</div>'+
    (supporting.length?'<div class="journey-support"><div class="hint journey-support-title">AKTIVITAS PENDUKUNG</div><div class="journey-support-grid">'+supporting.map(step).join('')+'</div></div>':'')+
    '<div class="journey-note">Ikon <strong>menyala</strong> menunjukkan tahap yang sedang aktif. Tahap Lab/Radiologi/Farmasi hanya muncul jika memang ada order atau aktivitas pada episode ini.</div></section>';
}

function renderPatientRawatInap(){
  setPageTitle('Rawat Inap');
  const u=Session.currentUser, p=getPatient(u.patientId), a=getPatientActiveAdmission(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  if(!a){
    document.getElementById('main-content').innerHTML=pageIntro('Menu ini menampilkan perjalanan Rawat Inap pasien secara dinamis. Jika belum ada episode aktif, tidak ada data Rawat Inap yang ditampilkan.')+
      '<section class="panel"><div class="panel-body"><div class="empty"><div class="big">🏥</div><strong>Belum ada Rawat Inap aktif</strong><div class="hint">Perjalanan Rawat Inap akan muncul otomatis setelah proses admisi dibuat.</div></div></div></section>';
    return;
  }
  const duty=getCurrentInpatientDuty(a.wardId), dpjp=getUserById(a.dpjpUserId);
  const bed=Store.data.beds.find(function(b){return b.id===a.bedId;})||{}, ward=Store.data.wards.find(function(w){return w.id===a.wardId;})||{};
  const shift=duty.shift;
  document.getElementById('main-content').innerHTML=pageIntro('Informasi pasien dibuat ringkas: dokter yang menangani, petugas jaga saat ini, lokasi perawatan, dan perjalanan pelayanan.')+
    '<section class="panel"><div class="panel-head"><div><div class="ops-eyebrow">RAWAT INAP AKTIF</div><h2>🏥 '+esc(p.nama)+'</h2></div><span class="badge '+(a.status==='dirawat'?'badge-sage':'badge-slate')+'">'+esc(a.status)+'</span></div><div class="panel-body"><div class="patient-inpatient-grid">'+
      '<div><span>Dokter Penanggung Jawab</span><strong>'+esc(dpjp?dpjp.nama:'-')+'</strong><small>DPJP</small></div>'+
      '<div><span>Dokter Jaga</span><strong>'+esc(duty.doctor?duty.doctor.nama:'-')+'</strong><small>'+esc(shift.label)+' · '+shift.jamMulai+'–'+shift.jamSelesai+'</small></div>'+
      '<div><span>Petugas Keperawatan</span><strong>'+esc(duty.nurse?duty.nurse.nama:'-')+'</strong><small>'+esc(shift.label)+'</small></div>'+
      '<div><span>Lokasi Perawatan</span><strong>'+esc(ward.buildingName||'Gedung belum ditetapkan')+' · '+esc(ward.floorName||(ward.floorNumber?'Lantai '+ward.floorNumber:'Lantai belum ditetapkan'))+'</strong><small>'+esc(ward.nama||'Ruang belum ditetapkan')+' · Kamar '+esc(bed.noKamar||'-')+' · '+esc(bed.bedLabel||('Bed '+(bed.noBed||'-')))+' · Kelas '+esc(a.kelasPerawatan||ward.kelas||'-')+'</small></div>'+
    '</div></div></section>'+
    '<section class="panel"><div class="panel-head"><div><h2>🧭 Perjalanan Saya</h2><div class="hint">Status mengikuti aktivitas pelayanan yang tercatat pada episode Rawat Inap.</div></div></div><div class="panel-body">'+patientInpatientJourney(a)+'</div></section>'+
    '<section class="panel"><div class="panel-head"><div><h2>ℹ️ Informasi Perawatan</h2><div class="hint">Sumber admisi dan penjamin ditampilkan sebagai informasi perjalanan.</div></div></div><div class="panel-body"><p><strong>Sumber:</strong> '+esc(a.sumberAdmisi||'-')+'<br><strong>Penjamin:</strong> '+esc(a.jenisBayar||'-')+'<br><strong>Diagnosis masuk:</strong> '+esc(a.diagnosisMasuk||'-')+'</p><div class="alert alert-info">Data ini adalah simulasi portfolio. Keputusan medis tetap berada pada tenaga kesehatan yang berwenang.</div></div></section>';
}

function renderPatientDashboard(){
  setPageTitle('Dashboard Pasien');
  reconcileOutpatientPrescriptions();
  const u=Session.currentUser, p=getPatient(u.patientId), activeJourney=getPatientActiveJourney(u.patientId), a=activeJourney&&activeJourney.unit==='rawat-inap'?activeJourney.episode:null, igdV=activeJourney&&activeJourney.unit==='igd'?activeJourney.episode:null, v=activeJourney&&activeJourney.unit==='rawat-jalan'?activeJourney.episode:null;
  if(!p){ document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>'; return; }
  const upcoming=Store.data.bookings.filter(function(b){return b.patientId===u.patientId && b.tanggalKontrol>=todayStr() && ['terjadwal','checked_in'].includes(b.status);}).sort(function(a,b){return a.tanggalKontrol.localeCompare(b.tanggalKontrol)||a.noAntrian.localeCompare(b.noAntrian);})[0];
  const permission=('Notification' in window)?Notification.permission:'unsupported';
  let liveHtml='';
  if(v){
    const poli=getPoli(v.poliId), q=getPatientQueueState(v), statusInfo=STATUS_MAP[v.status]||{label:v.status,cls:'badge-slate'};
    const called=v.status==='dipanggil'||v.status==='diperiksa'||q.ahead===0;
    const alertText=called?'🟢 SILAKAN MASUK — nomor Anda sedang dipanggil.':q.ahead<=3?'🟡 BERSIAP — tinggal '+q.ahead+' pasien lagi sebelum giliran Anda.':'🔵 MENUNGGU — aplikasi akan memberi tahu saat tersisa 3 pasien.';
    const liveClass=called?'patient-live-green':q.ahead<=3?'patient-live-warn':'patient-live-blue';
    liveHtml='<section class="panel patient-live-queue '+liveClass+'"><div class="panel-head"><div><div class="ops-eyebrow">LIVE QUEUE MONITOR</div><h2>🎫 '+esc(poli.nama)+'</h2><div class="hint">Antrean diperbarui otomatis dari status pelayanan poli.</div></div><span class="badge '+statusInfo.cls+'">'+statusInfo.label+'</span></div><div class="patient-live-grid">'+
      '<div class="patient-live-card primary"><span>Nomor Anda</span><strong>'+esc(v.noAntrian)+'</strong><small>Posisi antrean Anda</small></div>'+
      '<div class="patient-live-card"><span>Sedang Dilayani</span><strong>'+esc(q.currentNo)+'</strong><small>Nomor yang sedang dipanggil/diperiksa</small></div>'+
      '<div class="patient-live-card"><span>Sudah Dilayani</span><strong>'+q.servedCount+'</strong><small>Pasien sebelum nomor Anda</small></div>'+
      '<div class="patient-live-card"><span>Belum Dilayani</span><strong>'+q.ahead+'</strong><small>Pasien sebelum giliran Anda</small></div>'+
      '<div class="patient-live-card"><span>Setelah Anda</span><strong>'+q.waitingAfter+'</strong><small>Antrean setelah nomor Anda</small></div>'+
      '<div class="patient-live-card"><span>Perkiraan Tunggu</span><strong>± '+Math.max(0,q.ahead*8)+' mnt</strong><small>Estimasi dinamis</small></div>'+
      '</div><div class="patient-live-status"><strong>'+alertText+'</strong><span>Notifikasi otomatis tetap aktif pada ambang 3 pasien sebelum giliran.</span></div></section>';
  } else {
    liveHtml='<section class="panel patient-live-queue patient-live-blue"><div class="panel-head"><div><div class="ops-eyebrow">LIVE QUEUE MONITOR</div><h2>📍 Menunggu Check-in</h2><div class="hint">Setelah pasien datang dan QR/barcode diverifikasi di loket, posisi antrean akan tampil otomatis di sini.</div></div></div><div class="patient-live-status"><strong>🔵 Tiket Anda sudah tersimpan.</strong><span>Silakan lakukan check-in di rumah sakit sesuai jadwal kunjungan.</span></div></section>';
  }
  const ticketHtml=upcoming?'<button type="button" class="patient-ticket patient-ticket-clickable" onclick="openPatientBookingTicket(\''+upcoming.id+'\')"><span>Jadwal Berikutnya · Tap untuk buka tiket</span><strong>'+esc(upcoming.noAntrian)+'</strong><b>'+esc(getPoli(upcoming.poliId).nama)+'</b><small>'+formatTanggalIndo(upcoming.tanggalKontrol)+' · '+esc(upcoming.jenisBayar)+'</small><span class="ticket-reopen-hint">🎫 QR/barcode dapat dibuka kembali kapan saja</span></button>':'<div class="empty"><div class="big">🎫</div>Belum ada booking aktif.</div>';
  let journeyHtml='';
  if(a){
    const bed=Store.data.beds.find(function(b){return b.id===a.bedId;})||{}, ward=Store.data.wards.find(function(w){return w.id===a.wardId;})||{}, dpjp=getUserById(a.dpjpUserId);
    journeyHtml='<section class="panel"><div class="panel-head"><div><div class="ops-eyebrow">PERJALANAN SAYA</div><h2>🏥 PERJALANAN RAWAT INAP</h2><div class="hint">Rawat inap aktif · '+esc(a.status)+'</div></div><span class="badge badge-sage">Aktif</span></div><div class="panel-body"><div class="patient-inpatient-grid"><div><span>Gedung / Lantai</span><strong>'+esc(ward.buildingName||'Gedung belum ditetapkan')+'</strong><small>'+esc(ward.floorName||(ward.floorNumber?'Lantai '+ward.floorNumber:'Lantai belum ditetapkan'))+'</small></div><div><span>Ruang / Kamar / Bed</span><strong>'+esc(ward.nama||'Ruang belum ditetapkan')+'</strong><small>Kamar '+esc(bed.noKamar||'-')+' · '+esc(bed.bedLabel||('Bed '+(bed.noBed||'-')) )+'</small></div><div><span>Dokter penanggung jawab</span><strong>'+esc(dpjp?dpjp.nama:'-')+'</strong></div></div>'+patientInpatientJourney(a)+'</div></section>';
  }else if(igdV){
    const st=(STATUS_MAP[igdV.status]||{label:igdV.status}).label;
    journeyHtml='<section class="panel"><div class="panel-head"><div><div class="ops-eyebrow">PERJALANAN SAYA</div><h2>🚑 PERJALANAN IGD</h2><div class="hint">Episode IGD · '+esc(igdV.noAntrian||igdV.id)+'</div></div><span class="badge badge-sage">'+esc(st)+'</span></div><div class="panel-body"><div class="patient-flow"><div class="patient-flow-step done"><span>✓</span><div><strong>Kedatangan / Rujukan</strong><small>Episode IGD tercatat</small></div></div><div class="patient-flow-step active"><span>🚑</span><div><strong>Triase dan Pelayanan IGD</strong><small>'+esc(st)+'</small></div></div>'+(igdV.labRequest?'<div class="patient-flow-step '+(igdV.labRequest.status==='selesai'?'done':'active')+'"><span>🧪</span><div><strong>Laboratorium</strong><small>'+esc(igdV.labRequest.status)+'</small></div></div>':'')+(igdV.radiologyRequest?'<div class="patient-flow-step '+(igdV.radiologyRequest.status==='selesai'?'done':'active')+'"><span>☢️</span><div><strong>Radiologi</strong><small>'+esc(igdV.radiologyRequest.status)+'</small></div></div>':'')+(getResepByVisit(igdV.id)?'<div class="patient-flow-step '+(['diberikan','diambil','selesai'].includes(getResepByVisit(igdV.id).status)?'done':'active')+'"><span>💊</span><div><strong>Farmasi IGD</strong><small>'+esc(getResepByVisit(igdV.id).status)+'</small></div></div>':'')+'</div></div></section>';
  }else if(v){
    const poli=getPoli(v.poliId), q=getPatientQueueState(v), schedule=(Store.data.doctorSchedules||[]).find(function(sc){return sc.id===v.sessionId;})||null, doctor=doctorMasterById(v.dokterId)||Store.data.users.find(function(x){return x.id===v.dokterId;})||null;
    const booking=Store.data.bookings.find(function(b){return b.visitId===v.id||b.id===v.bookingId;})||null;
    const jam=(v.appointmentTime||(booking&&booking.appointmentTime)||(schedule&&schedule.jamMulai)||'Belum ditentukan');
    const waitMinutes=Math.max(0,(q?q.ahead:0)*Number((Store.data.meta.settings||{}).avgWaitMinutes||8));
    const estimate=new Date(Date.now()+waitMinutes*60000).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    const estimateText=['selesai','menunggu_farmasi','menunggu_bayar','obat_siap'].includes(v.status)?'Tahap poli selesai':(q&&q.ahead===0&&['dipanggil','diperiksa'].includes(v.status)?'Sedang dilayani':estimate);
    journeyHtml='<section class="panel"><div class="panel-head"><div><div class="ops-eyebrow">PERJALANAN SAYA</div><h2>🩺 PERJALANAN RAWAT JALAN</h2><div class="hint">Status: '+esc((STATUS_MAP[v.status]||{label:v.status}).label)+'</div></div><span class="badge badge-sage">Aktif</span></div><div class="panel-body"><div class="ops-kpi-grid"><div class="ops-kpi"><div class="kpi-label">NOMOR ANTREAN</div><div class="kpi-value">'+esc(v.noAntrian||'—')+'</div></div><div class="ops-kpi"><div class="kpi-label">POLI</div><div class="kpi-value" style="font-size:16px">'+esc(poli?poli.nama:'-')+'</div></div><div class="ops-kpi"><div class="kpi-label">DOKTER</div><div class="kpi-value" style="font-size:14px">'+esc(doctor?doctor.nama:'Mengikuti alokasi poli')+'</div></div><div class="ops-kpi"><div class="kpi-label">JAM KUNJUNGAN</div><div class="kpi-value">'+esc(jam)+'</div></div><div class="ops-kpi"><div class="kpi-label">ESTIMASI DILAYANI</div><div class="kpi-value">'+esc(estimateText)+'</div></div></div><div class="hint">Estimasi antrean merupakan perkiraan dan dapat berubah mengikuti pelayanan aktual.</div><div class="patient-flow">'+patientFlow(v)+'</div></div></section>';
  }
  const inpatientJourney='';
  const igdJourney='';
  document.getElementById('main-content').innerHTML=
    '<div class="patient-hero ops-hero"><div><div class="ops-eyebrow">PATIENT EXPERIENCE</div><h2>Halo, '+esc(p.nama)+'</h2><p>RM '+esc(p.id)+' · Dashboard hanya menampilkan informasi pelayanan milik Anda.</p></div><div><span class="badge badge-sage">Privasi Aktif</span></div></div>'+
    '<section class="panel"><div class="panel-head"><div><h2>👤 Profil Pasien</h2><div class="hint">Identitas akun yang terhubung ke seluruh pelayanan rumah sakit.</div></div></div><div class="panel-body"><div class="patient-inpatient-grid"><div><span>Nama</span><strong>'+esc(p.nama)+'</strong></div><div><span>Nomor Rekam Medis</span><strong>'+esc(p.id)+'</strong></div><div><span>Jenis Kelamin</span><strong>'+esc(p.jenisKelamin==='L'?'Laki-laki':p.jenisKelamin==='P'?'Perempuan':'Belum diisi')+'</strong></div><div><span>Tanggal Lahir</span><strong>'+esc(p.tglLahir||'Belum diisi')+'</strong></div></div></div></section>'+
    journeyHtml+
    '<div class="ops-grid-main"><section class="panel"><div class="panel-head"><div><h2>🎫 Tiket Aktif</h2><div class="hint">Tiket dapat dibuka kembali tanpa screenshot.</div></div></div><div class="panel-body">'+ticketHtml+'</div></section>'+
    (v?'<section class="panel"><div class="panel-head"><div><h2>🔔 Notifikasi Antrean</h2><div class="hint">Pasien diberi tahu saat antrean mendekati nomor Anda.</div></div></div><div class="panel-body"><div class="ops-alert '+(getPatientQueueState(v).ahead<=3?'warning':'')+'"><span class="ops-alert-icon">🔔</span><div><strong>Notifikasi 3 pasien sebelum giliran</strong><div>Ketika nomor Anda dipanggil, indikator akan berubah menjadi hijau agar Anda segera masuk ke poli.</div></div></div><div style="margin-top:12px"><button class="btn btn-primary" id="btn-patient-notif">'+(permission==='granted'?'✓ Notifikasi HP Aktif':'🔔 Aktifkan Notifikasi HP')+'</button></div></div></section>':'')+'</div>'; 
  const nb=document.getElementById('btn-patient-notif'); if(nb) nb.addEventListener('click',enablePatientNotifications);
  maybeNotifyPatientQueue();
  if(window.__patientPoll) clearInterval(window.__patientPoll);
  window.__patientPoll=setInterval(function(){ if(Session.currentUser && Session.currentUser.role==='pasien' && currentRoute()==='pasien-dashboard'){ maybeNotifyPatientQueue(); renderPatientDashboard(); } },15000);


}
function kpiPatient(icon,label,value,sub){ return '<div class="ops-kpi"><div class="ops-kpi-icon">'+icon+'</div><div><div class="ops-kpi-label">'+label+'</div><div class="ops-kpi-value">'+value+'</div><div class="ops-kpi-sub">'+sub+'</div></div></div>'; }
function patientJourneyDefinition(v){
  // Patient Journey bersifat dinamis: unit yang tidak dibutuhkan pasien tidak ditampilkan.
  // Jalur aktual ditentukan oleh tindakan/permintaan dokter, bukan sekadar poli.
  const hasLab=!!(v && v.labRequest);
  const hasRad=!!(v && v.radiologyRequest);
  const rx=v?getResepByVisit(v.id):null;
  const hasRx=!!(v && rx && Array.isArray(rx.items) && rx.items.length>0 && ['menunggu','disiapkan','diambil','diberikan','selesai'].includes(rx.status));
  const steps=[
    {key:'booking',label:'Pendaftaran',icon:'📅'},
    {key:'checkin',label:'Check-in',icon:'✓'},
    {key:'screening',label:'Verifikasi',icon:'🩺'},
    {key:'doctor',label:'Dokter',icon:'👨‍⚕️'}
  ];
  if(hasLab){
    steps.push({key:'lab',label:'Laboratorium',icon:'🧪'});
    steps.push({key:'review',label:'Review Dokter',icon:'📋'});
  }
  if(hasRad){steps.push({key:'radiology',label:'Radiologi',icon:'☢️'});steps.push({key:'review_rad',label:'Review Hasil Radiologi',icon:'📋'});}
  if((v.referrals||[]).some(function(r){return r.destination==='igd';}) || v.status==='menunggu_rujukan_igd') steps.push({key:'igd_referral',label:'Konfirmasi Rujukan IGD',icon:'🚑'});
  if((v.referrals||[]).some(function(r){return r.destination==='rawat-inap';}) || v.status==='rujuk_ranap') steps.push({key:'rawat_inap_referral',label:'Konfirmasi Admisi Rawat Inap',icon:'🏥'});
  if(hasRx){
    steps.push({key:'pharmacy_prepare',label:'Farmasi',sub:'Siapkan obat',icon:'💊'});
  }
  steps.push({key:'payment',label:'Kasir',icon:'💳'});
  if(hasRx){
    steps.push({key:'pharmacy_pickup',label:'Pengambilan Obat',sub:'Ambil obat di farmasi',icon:'💊'});
  }
  steps.push({key:'done',label:'Selesai',icon:'✓'});
  return steps;
}
function patientJourneyIndex(v,steps){
  if(!v) return 0;
  const rx=getResepByVisit(v.id);
  let status=v.status;
  // Status episode adalah sumber kebenaran. Resep yang tersimpan tidak boleh membuat
  // tahap dokter tampak selesai ketika visit masih berstatus diperiksa.
  if(status!=='diperiksa' && rx && rx.status==='menunggu' && !['dibatalkan','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_rujukan_igd'].includes(status)) status='menunggu_farmasi';
  if(status!=='diperiksa' && rx && rx.status==='disiapkan' && !['obat_siap','selesai','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_rujukan_igd'].includes(status)) status='menunggu_bayar';
  const key= status==='terjadwal' ? 'booking' :
    status==='checked_in' ? 'checkin' :
    ['menunggu_screening','screening'].includes(status) ? 'screening' :
    ['menunggu_dokter','dipanggil','diperiksa'].includes(status) ? 'doctor' :
    status==='menunggu_lab' ? 'lab' :
    status==='menunggu_penunjang' ? 'radiology' :
    status==='menunggu_rujukan_igd' ? 'igd_referral' :
    status==='menunggu_review' ? (v.radiologyRequest&&v.radiologyRequest.status==='selesai'?'review_rad':'review') :
    status==='menunggu_farmasi' ? 'pharmacy_prepare' :
    status==='menunggu_bayar' ? 'payment' :
    status==='obat_siap' ? 'pharmacy_pickup' :
    status==='selesai' ? 'done' : 'checkin';
  const idx=steps.findIndex(function(x){return x.key===key;});
  return idx>=0?idx:Math.min(steps.length-1,1);
}
function patientJourneyStepState(v, step){
  if(!v)return 'pending';
  const rx=getResepByVisit(v.id),status=v.status||'';
  const active=['menunggu_screening','screening','menunggu_dokter','dipanggil','diperiksa','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap','menunggu_rujukan_igd'].includes(status);
  if(step.key==='booking')return v.workflow&&v.workflow.bookedAt?'done':'done';
  if(step.key==='checkin')return (v.workflow&&v.workflow.checkinAt)||v.status!=='terjadwal'?'done':'active';
  if(step.key==='screening')return (v.workflow&&v.workflow.screeningAt)?'done':(['menunggu_screening','screening'].includes(status)?'active':(active?'done':'done'));
  if(step.key==='doctor')return status==='diperiksa'? 'active' : (['menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap','selesai','menunggu_rujukan_igd'].includes(status)?'done':(['menunggu_dokter','dipanggil'].includes(status)?'active':'pending'));
  if(step.key==='lab')return !v.labRequest?'pending':(v.labRequest.status==='selesai'?'done':'active');
  if(step.key==='radiology')return !v.radiologyRequest?'pending':(v.radiologyRequest.status==='selesai'?'done':'active');
  if(step.key==='review')return !v.labRequest?'pending':(v.labRequest.status!=='selesai'?'pending':((v.workflow&&v.workflow.reviewAt)?'done':'active'));
  if(step.key==='review_rad')return !v.radiologyRequest?'pending':(v.radiologyRequest.status!=='selesai'?'pending':((v.workflow&&v.workflow.reviewAt)?'done':'active'));
  if(step.key==='rawat_inap_referral'){const req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='rawat-inap';});return req&&req.status==='selesai'?'done':(req&&['menunggu_konfirmasi','sedang_diproses'].includes(req.status)?'active':(status==='rujuk_ranap'?'active':'pending'));}
  if(step.key==='igd_referral'){
    const req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='igd';});
    return req&&req.status==='diterima'?'done':(req&&req.status==='menunggu_konfirmasi'?'active':(status==='menunggu_rujukan_igd'?'active':'pending'));
  }
  if(step.key==='pharmacy_prepare')return !rx||!Array.isArray(rx.items)||!rx.items.length?'pending':(status==='diperiksa'?'pending':(['diambil','diberikan','selesai'].includes(rx.status)?'done':(rx.status==='menunggu'?'active':(rx.status==='disiapkan'?'done':'pending'))));
  if(step.key==='payment')return status==='menunggu_bayar'?'active':(['obat_siap','selesai'].includes(status)?'done':'pending');
  if(step.key==='pharmacy_pickup')return !rx||!Array.isArray(rx.items)||!rx.items.length?'pending':(rx.status==='diambil'?'done':(status==='obat_siap'?'active':'pending'));
  if(step.key==='done')return status==='selesai'?'done':'pending';
  return 'pending';
}
function patientFlow(v){
  const steps=patientJourneyDefinition(v);
  return steps.map(function(step){
    const state=patientJourneyStepState(v,step),isDone=state==='done',isActive=state==='active';
    const sub=step.sub?'<small>'+esc(step.sub)+'</small>':'<small>'+esc(step.key.toUpperCase())+'</small>';
    return '<div class="patient-flow-step '+(isDone?'done ':'')+(isActive?'active ':'')+' '+(state==='pending'?'pending':'')+'"><span>'+(isDone?'✓':step.icon)+'</span><div><strong>'+esc(step.label)+'</strong>'+sub+'</div></div>';
  }).join('');
}
function enablePatientNotifications(){
  if(!('Notification' in window)){ showToast('Browser ini tidak mendukung notifikasi sistem','warning'); return; }
  Notification.requestPermission().then(function(permission){ if(permission==='granted'){ showToast('Notifikasi HP aktif','success'); maybeNotifyPatientQueue(); renderPatientDashboard(); } else showToast('Izin notifikasi belum diberikan','warning'); });
}

function greetingWaktu(){ const h=new Date().getHours(); return h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam'; }
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
  if(u.role==='admin') el.innerHTML = berandaAdmin();
  else if(u.role==='loket') el.innerHTML = berandaLoket();
  else if(u.role==='dokter') el.innerHTML = berandaDokter();
  else if(u.role==='farmasi') el.innerHTML = berandaFarmasi();
  else if(u.role==='kasir') el.innerHTML = berandaKasir();
  else if(u.role==='lab') el.innerHTML = berandaLab();
  else if(u.role==='perawat') el.innerHTML = berandaPerawat();
  if(u.role==='dokter'){
    poliState.poliId=canonicalPoliId(u.poliId);
    renderJadwalKontrolPoli();
    renderInfoPraktikPoli();
  }
  bindBerandaActionEvents();
}
function bindContentNavigation(){
  document.querySelectorAll('#main-content [data-nav]').forEach(function(c){if(c.dataset.navBound==='1')return;c.dataset.navBound='1';c.addEventListener('click',function(){navigate(c.dataset.nav);});});
}
function bindBerandaActionEvents(){
  bindContentNavigation();
  document.querySelectorAll('[data-action="global-search"]').forEach(c=> c.addEventListener('click', openGlobalSearch));
}
function berandaAdmin(){
  const today=todayStr();
  const visits=visitsToday();
  const activeRI=Store.data.admissions.filter(function(a){return a.status==='dirawat';});
  const activeOrders=activeRI.reduce(function(n,a){return n+(Array.isArray(a.orders)?a.orders.filter(function(o){return ['lab','radiologi'].includes(o.jenis)&&o.status==='menunggu';}).length:0);},0);
  const labPending=visits.filter(function(v){return v.status==='menunggu_lab';}).length + Store.data.admissions.reduce(function(n,a){return n+(Array.isArray(a.orders)?a.orders.filter(function(o){return o.jenis==='lab'&&o.status==='menunggu';}).length:0);},0);
  const radPending=Store.data.admissions.reduce(function(n,a){return n+(Array.isArray(a.orders)?a.orders.filter(function(o){return o.jenis==='radiologi'&&o.status==='menunggu';}).length:0);},0);
  const pharmacyPending=pharmacyMetrics('rawat-jalan').pending+pharmacyMetrics('rawat-inap').pending;
  const beds=Store.data.beds||[];
  const recent=(Store.data.audit||[]).slice(-5).reverse();
  return '<div class="ops-hero"><div><div class="ops-eyebrow">ADMIN OPERATIONAL OVERVIEW</div><h2>Ringkasan Operasional</h2><p>'+formatTanggalIndo(today)+' · Pantau layanan utama dari satu halaman.</p></div><div class="ops-hero-actions"><button class="btn btn-primary btn-sm" data-nav="dashboard">▦ Buka Dashboard</button></div></div>'+
    '<div class="ops-kpi-grid">'+
      statCard('Rawat Jalan',visits.length,'kunjungan hari ini')+
      statCard('Rawat Inap',activeRI.length,'pasien sedang dirawat')+
      statCard('Bed Tersedia',beds.filter(function(b){return b.status==='kosong';}).length,beds.length+' total')+
      statCard('IGD',Store.data.visits.filter(function(v){return v.unit==='igd'&&v.tanggal===today;}).length,'kunjungan hari ini')+
      statCard('Laboratorium',labPending,'order menunggu')+
      statCard('Radiologi',radPending,'order menunggu')+
      statCard('Farmasi',pharmacyPending,'order/resep menunggu')+
      statCard('Aktivitas',recent.length,'audit terbaru')+
    '</div>'+
    '<div class="ops-grid-main"><section class="panel ops-panel"><div class="panel-head"><div><h2>⚡ Akses Cepat</h2><div class="hint">Modul yang paling sering digunakan Admin.</div></div></div><div class="panel-body"><div class="action-grid admin-quick-grid">'+
      '<div class="action-card" data-nav="pendaftaran"><span class="ic">📝</span><span class="lbl">Pendaftaran</span></div>'+
      '<div class="action-card" data-nav="booking"><span class="ic">📅</span><span class="lbl">Booking</span></div>'+
      '<div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Rawat Jalan</span></div>'+
      '<div class="action-card" data-nav="igd"><span class="ic">🚑</span><span class="lbl">IGD</span></div>'+
      '<div class="action-card" data-nav="ranap"><span class="ic">🏥</span><span class="lbl">Rawat Inap</span></div>'+
      '<div class="action-card" data-nav="lab"><span class="ic">🧪</span><span class="lbl">Laboratorium</span></div>'+
      '<div class="action-card" data-nav="radiologi"><span class="ic">☢️</span><span class="lbl">Radiologi</span></div>'+
      '<div class="action-card" data-nav="farmasi-rawat-jalan"><span class="ic">💊</span><span class="lbl">Farmasi RJ</span></div>'+
      '<div class="action-card" data-nav="farmasi-rawat-inap"><span class="ic">💊</span><span class="lbl">Farmasi RI</span></div>'+
      '<div class="action-card" data-nav="farmasi-igd"><span class="ic">💊</span><span class="lbl">Farmasi IGD</span></div>'+
      '<div class="action-card" data-nav="kasir-rawat-jalan"><span class="ic">🧾</span><span class="lbl">Kasir RJ</span></div>'+
      '<div class="action-card" data-nav="kasir-rawat-inap"><span class="ic">🧾</span><span class="lbl">Kasir RI</span></div>'+
      '<div class="action-card" data-nav="kasir-igd"><span class="ic">🧾</span><span class="lbl">Kasir IGD</span></div>'+
      '<div class="action-card" data-nav="rekam-medis"><span class="ic">📋</span><span class="lbl">Rekam Medis</span></div>'+
      '<div class="action-card" data-nav="cek-antrian"><span class="ic">📺</span><span class="lbl">Papan Antrian</span></div>'+
      '<div class="action-card" data-nav="monitor-antrean"><span class="ic">🖥️</span><span class="lbl">Monitor</span></div>'+
      '<div class="action-card" data-nav="informasi-rs"><span class="ic">ℹ️</span><span class="lbl">Informasi RS</span></div>'+
      '<div class="action-card" data-nav="master-data"><span class="ic">⚙️</span><span class="lbl">Master Data</span></div>'+
      '<div class="action-card" data-nav="audit-sistem"><span class="ic">🔍</span><span class="lbl">Audit Sistem</span></div>'+
    '</div></div></section><section class="panel ops-panel"><div class="panel-head"><div><h2>🕘 Aktivitas Terbaru</h2><div class="hint">Ringkasan aktivitas sistem, bukan catatan klinis.</div></div></div><div class="panel-body">'+
      (recent.length?recent.map(function(x){return '<div class="history-item"><strong>'+esc(x.action||x.type||'Aktivitas')+'</strong><div class="hint">'+esc(x.at?formatTanggalWaktu(x.at):'Waktu tidak tersedia')+' · '+esc(x.userName||x.user||'Sistem')+'</div></div>';}).join(''):'<div class="empty">Belum ada aktivitas terbaru.</div>')+
    '</div></section></div>';
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
  const poli = getPoli(u.poliId);
  const visits = visitsToday().filter(v=>samePoli(v.poliId,u.poliId) && v.unit==='rawat-jalan');
  const menunggu = visits.filter(v=>['menunggu_dokter','dipanggil'].includes(v.status)).sort((a,b)=> (b.prioritas?1:0)-(a.prioritas?1:0) || (queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999));
  const aktif = visits.find(v=>v.status==='diperiksa' && v.dokterId===u.id);
  const urgentCount = menunggu.filter(v=>v.prioritas).length;
  const hasilLabSiap = visits.filter(v=>v.labRequest && v.labRequest.status==='selesai' && ['diperiksa','menunggu_review'].includes(v.status)).length;
  return '<div class="panel"><div class="panel-head"><div><div class="ops-eyebrow">BERANDA DOKTER</div><h2>Ringkasan Praktik — '+esc(poli.nama)+'</h2><div class="hint">'+formatTanggalIndo(todayStr())+' · Informasi umum ada di sini; ruang Poli difokuskan pada pemeriksaan pasien.</div></div><span class="badge badge-sage">Dokter Rawat Jalan</span></div><div class="panel-body">'+
    '<div class="grid grid-3">'+statCard('Siap Diperiksa',menunggu.length,urgentCount?urgentCount+' prioritas':'menunggu panggilan')+statCard('Sedang Diperiksa',aktif?1:0,aktif?aktif.noAntrian:'tidak ada kunjungan aktif')+statCard('Hasil Penunjang Siap',hasilLabSiap,'perlu ditinjau')+'</div>'+
    '<div class="action-grid"><div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Buka Ruang Poli</span></div><div class="action-card" data-nav="monitor-antrean"><span class="ic">🖥️</span><span class="lbl">Monitor Antrean</span></div><div class="action-card" data-nav="rekam-medis"><span class="ic">📋</span><span class="lbl">Cari Rekam Medis</span></div></div></div></div>'+
    '<div class="panel"><div class="panel-head"><div><h2>📊 Ringkasan Pelayanan Poli</h2><div class="hint">Sembilan indikator operasional berdasarkan data kunjungan dan farmasi poli ini.</div></div></div><div class="panel-body"><div id="doctor-beranda-kpi">'+rawatJalanKpiHtml(u.poliId)+'</div></div></div>'+
    '<div id="doctor-beranda-journey">'+renderRawatJalanPatientJourney(u.poliId)+'</div>'+
    '<div class="grid grid-2"><div class="panel" id="poli-jadwal-panel"></div><div class="panel" id="poli-info-panel"></div></div>';
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
  const u = Session.currentUser || {};
  // Asisten/perawat Rawat Jalan memiliki workspace screening sendiri.
  if(u.unit==='rawat-jalan' && u.poliId){
    const poliId=canonicalPoliId(u.poliId);
    const visits=visitsToday().filter(v=>samePoli(v.poliId,poliId));
    const screening=visits.filter(v=>['menunggu_screening','screening'].includes(v.status));
    const siapDokter=visits.filter(v=>v.status==='menunggu_dokter');
    return '<h3 style="color:var(--ink-soft);margin-bottom:10px">🩺 Asisten Poli — '+esc(getPoli(poliId)?.nama||'Rawat Jalan')+'</h3>'+
      '<div class="grid grid-3">'+
        statCard('Menunggu Screening', screening.length, 'perlu ditangani')+
        statCard('Menunggu Dokter', siapDokter.length, 'screening selesai')+
        statCard('Selesai Hari Ini', visits.filter(v=>v.status==='selesai').length, 'kunjungan')+
      '</div>'+
      '<div class="action-grid">'+
        '<div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Screening & Antrian Poli</span></div>'+
        '<div class="action-card" data-nav="rekam-medis"><span class="ic">📋</span><span class="lbl">Rekam Medis</span></div>'+
        '<div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Buka Poli</span></div>'+
      '</div>'+
      '<div class="panel"><div class="panel-head"><h2>Pasien yang Perlu Ditangani</h2></div><div class="panel-body">'+
        (screening.length ? screening.map(v=>{const p=getPatient(v.patientId);return '<div class="rj-queue-item"><div><div class="rj-q-top"><span class="rj-q-no">'+esc(v.noAntrian)+'</span>'+badgeStatus(v.status)+'</div><strong>'+esc(p?.nama||'-')+'</strong></div><button class="btn btn-primary btn-sm" data-nav="poli">Buka Screening</button></div>';}).join('') : '<div class="empty">Tidak ada pasien yang menunggu screening.</div>')+
      '</div></div>';
  }
  const aktif = Store.data.admissions.filter(a=>a.status==='dirawat');
  const perluPerhatian = aktif.filter(a=>{ const v=a.vitalLog[a.vitalLog.length-1]; return v && v.news2>=5; }).length;
  const bedKosong = Store.data.beds.filter(b=>b.status==='kosong').length;
  return '<div class="grid grid-3">'+statCard('Pasien Dirawat',aktif.length,'seluruh bangsal')+statCard('Perlu Perhatian',perluPerhatian,'skor NEWS2 ≥5')+statCard('Bed Kosong',bedKosong,'dari '+Store.data.beds.length+' total')+'</div>'+
    '<div class="action-grid"><div class="action-card" data-nav="poli"><span class="ic">🩺</span><span class="lbl">Poli Saya</span></div><div class="action-card" data-nav="rekam-medis"><span class="ic">📋</span><span class="lbl">Rekam Medis</span></div><div class="action-card" data-nav="riwayat-dokter"><span class="ic">🕘</span><span class="lbl">Riwayat</span></div></div>';
}

/* =================================================================
   MODULE: PENDAFTARAN
   ================================================================= */
let pendaftaranState = { pasienTerpilih:null, mode:'baru' };

function renderPendaftaran(){
  setPageTitle('Pendaftaran');
  const isLoket = Session.currentUser && Session.currentUser.role==='loket';
  pendaftaranState = { pasienTerpilih:null, mode:'baru' };
  document.getElementById('main-content').innerHTML =
    pageIntro((Session.currentUser&&Session.currentUser.role==='loket') ? 'Loket adalah pintu utama registrasi dan check-in. Petugas memverifikasi pasien, menerima pasien lama/baru, memindai QR/barcode, lalu mengaktifkan kunjungan.' : 'Petugas Rawat Jalan menangani pendaftaran langsung ke poli dan pengambilan nomor antrean. Pilih layanan reguler atau eksekutif sebelum mendaftarkan pasien.')+
    (isLoket ? renderCheckInScannerPanel() : '<div class="alert alert-info"><strong>Mode Petugas Rawat Jalan:</strong> gunakan halaman ini untuk pendaftaran langsung. Check-in QR/barcode tetap menjadi tugas Loket.</div>')+
    '<div class="panel"><div class="panel-head"><h2>Data Pasien</h2>'+
      '<div class="tabs" style="border:none;margin:0"><button class="tab active" id="tab-baru" style="padding:4px 10px">Pasien Baru</button><button class="tab" id="tab-lama" style="padding:4px 10px">Pasien Lama</button></div>'+
    '</div><div class="panel-body" id="pendaftaran-pasien-area"></div></div>'+
    '<div id="pendaftaran-kunjungan-area"></div>'+
    '<div class="panel"><div class="panel-head"><h2>Antrian Hari Ini — Semua Poli</h2></div><div class="panel-body" id="antrian-hari-ini-area"></div></div>';
  document.getElementById('tab-baru').addEventListener('click', ()=> switchPendaftaranTab('baru'));
  document.getElementById('tab-lama').addEventListener('click', ()=> switchPendaftaranTab('lama'));
  switchPendaftaranTab('baru');
  refreshAntrianHariIni();
  bindCheckinScanner();
}
function refreshAntrianHariIni(){
  const el = document.getElementById('antrian-hari-ini-area');
  if(el) el.innerHTML = renderAntrianTable(visitsToday());
}
function renderCheckInScannerPanel(){
  return '<section class="panel checkin-panel"><div class="panel-head"><div><div class="ops-eyebrow">CHECK-IN PASIEN</div><h2>📷 Scan QR / Barcode Tiket</h2><div class="hint">Gunakan kamera sebagai cara utama. Input manual tetap tersedia sebagai cadangan bila kamera atau barcode bermasalah.</div></div><span class="badge badge-sage">Loket / Pendaftaran</span></div><div class="panel-body">'+
    '<div class="checkin-grid"><div><div class="scanner-frame"><video id="checkin-camera" playsinline muted></video><div id="checkin-camera-placeholder" class="scanner-placeholder">📷<br><span>Kamera belum aktif</span></div></div><div class="scanner-actions"><button type="button" class="btn btn-primary" id="btn-start-checkin-camera">📷 Buka Kamera</button><button type="button" class="btn btn-ghost hidden" id="btn-stop-checkin-camera">⏹ Hentikan Kamera</button></div><div id="checkin-camera-status" class="hint" style="margin-top:8px">Browser akan meminta izin kamera. Gunakan HTTPS (GitHub Pages) atau localhost.</div></div>'+
    '<div><div class="field"><label>⌨️ Input Manual Kode Booking / Check-in</label><input id="checkin-manual-code" type="text" autocomplete="off" placeholder="Contoh: CHKABC123 atau DEMO-P001-JAN"></div><button type="button" class="btn btn-outline btn-block" id="btn-checkin-manual">🔎 Cari Booking Manual</button><div class="hint" style="margin-top:8px">Cadangan jika kamera tidak tersedia. Bisa memakai kode pada tiket pasien.</div></div></div><div id="checkin-result" style="margin-top:16px"></div></div></section>';
}
let checkinScanner={stream:null,timer:null,detector:null};
function findBookingByScanValue(value){
  const q=String(value||'').trim(); if(!q)return null;
  const exact=Store.data.bookings.find(b=>[b.kodeCheckIn,b.id,b.noAntrian].some(x=>String(x||'').toLowerCase()===q.toLowerCase()));
  if(exact)return exact;
  return Store.data.bookings.find(b=>String(b.kodeCheckIn||'').toLowerCase().includes(q.toLowerCase()))||null;
}
function renderCheckinResult(booking){
  const el=document.getElementById('checkin-result'); if(!el)return;
  if(!booking){el.innerHTML='<div class="alert alert-warning"><strong>Booking tidak ditemukan.</strong><br>Periksa kembali kode QR/barcode atau gunakan input manual sesuai tiket.</div>';return;}
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  if(!p||!poli){el.innerHTML='<div class="alert alert-warning">Data pasien/poli pada booking tidak lengkap.</div>';return;}
  const already=booking.status==='checked_in' || !!booking.visitId;
  el.innerHTML='<div class="checkin-result-card"><div class="checkin-result-head"><div><div class="ops-eyebrow">BOOKING DITEMUKAN</div><h3>'+esc(p.nama)+'</h3><div class="hint">RM '+esc(p.id)+' · '+esc(poli.nama)+' · '+esc(booking.noAntrian)+'</div></div><span class="badge '+(already?'badge-sage':'badge-amber')+'">'+(already?'SUDAH CHECK-IN':'BELUM CHECK-IN')+'</span></div><div class="checkin-detail-grid"><div><span>Jadwal</span><strong>'+formatTanggalIndo(booking.tanggalKontrol)+'</strong></div><div><span>Penjamin</span><strong>'+esc(booking.jenisBayar)+'</strong></div><div><span>Kode</span><strong class="mono">'+esc(booking.kodeCheckIn)+'</strong></div><div><span>Sumber</span><strong>'+esc(booking.sumber||'Aplikasi RS')+'</strong></div></div>'+
    (already?'<div class="alert alert-info" style="margin-top:12px">Pasien sudah dikonfirmasi hadir. Antrean aktif pada '+esc(poli.nama)+'.</div>':'<button type="button" class="btn btn-primary btn-block" style="margin-top:12px" id="btn-confirm-patient-checkin">✅ Konfirmasi Pasien Hadir / Check-in</button>')+'</div>';
  const btn=document.getElementById('btn-confirm-patient-checkin'); if(btn)btn.addEventListener('click',()=>confirmPatientCheckin(booking.id));
}
function confirmPatientCheckin(bookingId){
  const b=getBooking(bookingId); if(!b){showToast('Booking tidak ditemukan.','danger');return;}
  if(b.status==='dibatalkan'||b.status==='kadaluarsa'){showToast('Booking tidak dapat di-check-in karena statusnya '+bookingStatusLabel(b.status)+'.','danger');return;}
  if(b.visitId){b.status='checked_in';b.confirmedAt=b.confirmedAt||nowISO();b.updatedAt=nowISO();Store.save();renderCheckinResult(b);return;}
  const p=getPatient(b.patientId); const poli=getPoli(b.poliId); if(!p||!poli){showToast('Data booking tidak lengkap.','danger');return;}
  const visit={id:uid('VIS'),patientId:b.patientId,poliId:b.poliId,jenisLayanan:b.jenisLayanan||getPoli(b.poliId)?.layanan||'Rawat Jalan',unit:'rawat-jalan',tanggal:todayStr(),noAntrian:b.noAntrian,status:'menunggu_screening',prioritas:false,keluhan:'',dokterId:b.dokterId||null,sessionId:b.sessionId||null,allocationMode:b.allocationMode||'booking',workflow:{checkInAt:nowISO()},createdAt:nowISO(),updatedAt:nowISO()};
  Store.data.visits.push(visit); b.visitId=visit.id; b.status='checked_in'; b.confirmedAt=nowISO(); b.updatedAt=nowISO();
  Store.save(); logAudit('pasien_checkin',b.noAntrian+' — '+p.nama+' ke '+poli.nama); pushNotification('queue','Check-in berhasil',b.noAntrian+' — Anda sudah check-in di '+poli.nama+'. Silakan ikuti antrean.',b.patientId);
  renderCheckinResult(b); refreshAntrianHariIni(); showToast('Check-in berhasil. Pasien masuk antrean '+poli.nama+'.','success');
}
async function startCheckinCamera(){
  const video=document.getElementById('checkin-camera'), status=document.getElementById('checkin-camera-status');
  if(!video)return;
  if(!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia){if(status)status.textContent='Kamera tidak didukung browser ini. Gunakan input manual.';return;}
  try{
    stopCheckinCamera();
    checkinScanner.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
    video.srcObject=checkinScanner.stream; await video.play();
    document.getElementById('checkin-camera-placeholder')?.classList.add('hidden');
    document.getElementById('btn-start-checkin-camera')?.classList.add('hidden'); document.getElementById('btn-stop-checkin-camera')?.classList.remove('hidden');
    if('BarcodeDetector' in window){
      checkinScanner.detector=new BarcodeDetector({formats:['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e']});
      status.textContent='Kamera aktif. Arahkan QR/barcode tiket ke kotak kamera.';
      checkinScanner.timer=setInterval(async()=>{if(!checkinScanner.detector||video.readyState<2)return;try{const codes=await checkinScanner.detector.detect(video);if(codes&&codes[0]?.rawValue){const b=findBookingByScanValue(codes[0].rawValue);renderCheckinResult(b);if(b){stopCheckinCamera();}}}catch(e){}},500);
    }else status.textContent='Kamera aktif, tetapi browser belum mendukung pembacaan barcode otomatis. Gunakan input manual sebagai cadangan.';
  }catch(e){if(status)status.textContent='Kamera tidak dapat dibuka ('+e.name+'). Gunakan input manual.';}
}
function stopCheckinCamera(){
  if(checkinScanner.timer){clearInterval(checkinScanner.timer);checkinScanner.timer=null;} if(checkinScanner.stream){checkinScanner.stream.getTracks().forEach(t=>t.stop());checkinScanner.stream=null;} checkinScanner.detector=null;
  const video=document.getElementById('checkin-camera'); if(video)video.srcObject=null;
  document.getElementById('btn-start-checkin-camera')?.classList.remove('hidden'); document.getElementById('btn-stop-checkin-camera')?.classList.add('hidden');
}
function bindCheckinScanner(){
  document.getElementById('btn-start-checkin-camera')?.addEventListener('click',startCheckinCamera);
  document.getElementById('btn-stop-checkin-camera')?.addEventListener('click',stopCheckinCamera);
  document.getElementById('btn-checkin-manual')?.addEventListener('click',()=>renderCheckinResult(findBookingByScanValue(document.getElementById('checkin-manual-code')?.value)));
  document.getElementById('checkin-manual-code')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('btn-checkin-manual')?.click();}});
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
    '<div class="panel"><div class="panel-head"><div><h2>Buat Kunjungan — '+esc(patient.nama)+' <span class="mono" style="font-weight:400;color:var(--ink-soft);font-size:13px">('+patient.id+')</span></h2><div class="hint">Alur pendaftaran langsung mengikuti jenis layanan RS: Reguler/Spesialis atau Eksekutif.</div></div></div>'+
    '<div class="panel-body">'+
      (patient.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(patient.alergi)+'</div>' : '')+
      '<form id="form-kunjungan"><div class="service-choice-grid"><button type="button" class="service-choice active" data-kj-service="Poliklinik Spesialis"><strong>🩺 Poli Reguler</strong><span>Poliklinik Spesialis · alur reguler</span></button><button type="button" class="service-choice" data-kj-service="Poliklinik Eksekutif"><strong>⭐ Poli Eksekutif</strong><span>Layanan eksekutif · jadwal khusus</span></button></div>'+
      '<div class="field-row"><div class="field"><label>Poli Tujuan</label><select id="kj-poli" required></select></div>'+
        '<div class="field hidden" id="kj-dokter-wrap"><label>Pilih Dokter / Sesi Praktik</label><select id="kj-dokter"></select><div class="hint">Pilihan dokter hanya untuk Poli Eksekutif. Poli Reguler menggunakan alokasi dokter/sesi otomatis.</div></div>'+
        '<div class="field"><label>Jenis Pembayaran</label><select id="kj-bayar" required><option value="Umum">Umum (Bayar Sendiri)</option><option value="BPJS">BPJS Kesehatan</option><option value="Asuransi">Asuransi Swasta</option></select></div>'+
      '</div><div id="kj-service-note" class="alert alert-info" style="margin-top:10px"></div><div class="field"><label>Keluhan Utama</label><textarea id="kj-keluhan" required placeholder="contoh: Demam sejak 2 hari, batuk pilek"></textarea></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="kj-prioritas"><label for="kj-prioritas" style="margin:0">🚩 Tandai prioritas / kondisi gawat darurat (didahulukan di antrian)</label></div>'+
      '<button type="submit" class="btn btn-primary">Daftarkan &amp; Ambil Nomor Antrian</button> <button type="button" class="btn btn-ghost" id="btn-batal-kunjungan">Batal</button></form>'+
      '<div id="tiket-area"></div></div></div>';
  document.getElementById('form-kunjungan').addEventListener('submit', submitKunjungan);
  const kjPoli=document.getElementById('kj-poli'), kjDok=document.getElementById('kj-dokter'), kjDokWrap=document.getElementById('kj-dokter-wrap');
  let kjService='Poliklinik Spesialis';
  function refreshKjPoli(){const options=Store.data.poli.filter(p=>p.official && (kjService==='Poliklinik Spesialis' ? (p.layanan==='Poliklinik Spesialis' || p.layanan==='Rawat Jalan') : p.layanan===kjService)).sort((a,b)=>a.nama.localeCompare(b.nama)); kjPoli.innerHTML=options.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+'</option>').join(''); refreshKjDoctors();}
  function refreshKjDoctors(){const isEx=kjService==='Poliklinik Eksekutif'; kjDokWrap.classList.toggle('hidden',!isEx); kjDok.required=isEx; const list=getDoctorSchedulesForDate(kjPoli.value,todayStr()); if(isEx){kjDok.innerHTML='<option value="AUTO">⚡ Otomatis — sistem memilih sesi yang masih tersedia</option>'+list.map(sc=>{const d=Store.data.users.find(u=>u.doctorMasterId===sc.doctorId)||Store.data.users.find(u=>u.id===sc.doctorId)||doctorMasterById(sc.doctorId);return d?'<option value="'+(d.id||sc.doctorId)+'">'+esc(d.nama)+' · '+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+' · '+esc(sc.ruang||'')+'</option>':'';}).join('');}else{kjDok.innerHTML='<option value="AUTO">⚡ Sistem memilih dokter/sesi otomatis</option>';} kjDok.value='AUTO'; const note=document.getElementById('kj-service-note'); if(note){note.innerHTML=isEx?'<strong>Alur Eksekutif:</strong> pasien masuk antrean khusus klinik eksekutif dan hanya dapat dialokasikan ke sesi dokter Eksekutif pada tanggal yang dipilih.':'<strong>Alur Reguler:</strong> pasien masuk antrean Poliklinik Spesialis dan sistem dapat mengalihkan alokasi ke sesi dokter berikutnya dalam poli yang sama bila kuota sesi sebelumnya penuh.';}}
  document.querySelectorAll('[data-kj-service]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-kj-service]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');kjService=btn.dataset.kjService;refreshKjPoli();}));
  kjPoli.addEventListener('change',refreshKjDoctors); refreshKjPoli();
  document.getElementById('btn-batal-kunjungan').addEventListener('click', ()=>{ area.innerHTML=''; pendaftaranState.pasienTerpilih=null; });
}
function getDoctorSchedulesForDate(poliId, dateStr){
  const d=dateStr||todayStr(); const day=new Date(d+'T12:00:00').getDay();
  return Store.data.doctorSchedules.filter(function(sc){return samePoli(sc.poliId,poliId)&&(sc.tanggal===d||(sc.tanggal==null&&sc.hari===day));}).sort(function(a,b){return String(a.jamMulai||'').localeCompare(String(b.jamMulai||''));});
}
function getDoctorScheduleForUser(poliId,doctorId,dateStr){return getDoctorSchedulesForDate(poliId,dateStr).find(function(sc){return sc.doctorId===doctorId || (doctorMasterById(sc.doctorId)&&doctorMasterById(sc.doctorId).linkedUserId===doctorId);})||null;}
function getActiveDoctorSchedule(poliId,atDate){
  const now=atDate||new Date(), list=getDoctorSchedulesForDate(poliId,todayStr(now)), mins=now.getHours()*60+now.getMinutes();
  return list.find(function(sc){const a=String(sc.jamMulai||'00:00').split(':').map(Number),b=String(sc.jamSelesai||'23:59').split(':').map(Number);return mins>=a[0]*60+a[1]&&mins<=b[0]*60+b[1];})||null;
}
function doctorShortCode(doctor){const m=String(doctor&&doctor.nama||'DOK').replace(/^drg?\.\s*/i,'').split(/\s+/);return (m[0]||'DOK').slice(0,3).toUpperCase();}
function poliQueuePrefix(poliId){
  const p=getPoli(poliId); if(p&&p.kode) return String(p.kode).toUpperCase();
  const id=String(poliId||'POLI').toUpperCase().replace(/^(SP|EX)-/,'');
  return id.replace(/[^A-Z0-9]+/g,'').slice(0,5)||'POLI';
}
function sessionDurationMinutes(sc){
  if(!sc||!sc.jamMulai||!sc.jamSelesai) return 0;
  const a=String(sc.jamMulai).split(':').map(Number), b=String(sc.jamSelesai).split(':').map(Number);
  let start=a[0]*60+a[1], end=b[0]*60+b[1]; if(end<start) end+=1440; return Math.max(0,end-start);
}
function sessionCapacity(sc){
  if(sc&&Number(sc.kuota)>0) return Math.max(1,Number(sc.kuota));
  const avg=Number((Store.data.meta.settings||{}).avgConsultMinutes)||12;
  return Math.max(1,Math.floor(sessionDurationMinutes(sc)/Math.max(5,avg)));
}
function queueLoadForSession(poliId,dateStr,sessionId){
  const visits=Store.data.visits.filter(v=>samePoli(v.poliId,poliId)&&v.tanggal===dateStr&&v.sessionId===sessionId&&!['dibatalkan','tidak_hadir'].includes(v.status)).length;
  const bookings=Store.data.bookings.filter(b=>samePoli(b.poliId,poliId)&&b.tanggalKontrol===dateStr&&b.sessionId===sessionId&&!['dibatalkan','kadaluarsa','tidak_hadir'].includes(b.status)).length;
  return {visits,bookings,total:Math.max(visits,bookings)};
}
function sessionSortValue(sc){ return String(sc&&sc.jamMulai||'99:99'); }
function scheduleDoctorUserId(sc){
  if(!sc) return null;
  const master=doctorMasterById(sc.doctorId);
  if(master&&master.linkedUserId) return master.linkedUserId;
  const direct=Store.data.users.find(function(u){return u.id===sc.doctorId;});
  return direct?direct.id:sc.doctorId||null;
}
function scheduleMatchesDoctor(sc,doctorId){
  if(!doctorId) return false;
  return sc.doctorId===doctorId || scheduleDoctorUserId(sc)===doctorId;
}
function getSessionCandidates(poliId,dateStr){ return getDoctorSchedulesForDate(poliId,dateStr).filter(Boolean).sort(function(a,b){return sessionSortValue(a).localeCompare(sessionSortValue(b));}); }
function chooseQueueAllocation(poliId,dateStr,preferredDoctorId){
  let list=getSessionCandidates(poliId,dateStr);
  if(!list.length) return {schedule:null,doctorId:preferredDoctorId||null,reason:'no_schedule'};
  // Untuk pendaftaran hari ini, sesi yang sudah selesai tidak boleh menerima
  // pasien baru. Sesi aktif dan sesi berikutnya tetap boleh dipilih.
  if(dateStr===todayStr()){
    const mins=new Date().getHours()*60+new Date().getMinutes();
    list=list.filter(function(sc){
      const a=String(sc.jamMulai||'00:00').split(':').map(Number), b=String(sc.jamSelesai||'23:59').split(':').map(Number);
      const end=b[0]*60+b[1]; return end>=mins;
    });
    if(!list.length) return {schedule:null,doctorId:null,reason:'closed'};
  }
  const preferred=preferredDoctorId?list.filter(function(sc){return scheduleMatchesDoctor(sc,preferredDoctorId);}):[];
  const pool=preferred.length?preferred:list;
  // Jika dokter pilihan masih punya kapasitas, hormati pilihan. Jika penuh,
  // sistem mencari sesi lain pada poli yang sama secara kronologis.
  for(const sc of pool){ const load=queueLoadForSession(poliId,dateStr,sc.id); if(load.total<sessionCapacity(sc)) return {schedule:sc,doctorId:scheduleDoctorUserId(sc),reason:preferred.length?'preferred':'auto'}; }
  if(preferred.length){
    for(const sc of list){ if(scheduleMatchesDoctor(sc,preferredDoctorId)) continue; const load=queueLoadForSession(poliId,dateStr,sc.id); if(load.total<sessionCapacity(sc)) return {schedule:sc,doctorId:scheduleDoctorUserId(sc),reason:'overflow'}; }
  }
  return {schedule:null,doctorId:null,reason:'full'};
}
function generateNoAntrian(poliId,dateStr){
  dateStr=dateStr||todayStr();
  const canonical=canonicalPoliId(poliId), key=canonical+'-'+dateStr;
  // Satu counter bersama untuk semua kanal simulasi: aplikasi RS, Mobile JKN simulasi, dan loket.
  // Pindai booking/kunjungan yang sudah tersimpan agar nomor dari kanal lain tidak tertimpa
  // ketika counter lokal tertinggal atau data eksternal disinkronkan saat aplikasi berjalan.
  let highest=Number(Store.data.meta.queueCounters[key]||0);
  (Store.data.bookings||[]).forEach(function(b){
    if(canonicalPoliId(b.poliId)===canonical && b.tanggalKontrol===dateStr){
      const n=queueNumberValue(b.noAntrian); if(n!==null) highest=Math.max(highest,n);
    }
  });
  (Store.data.visits||[]).forEach(function(v){
    if(canonicalPoliId(v.poliId)===canonical && (v.tanggal||todayStr())===dateStr){
      const n=queueNumberValue(v.noAntrian); if(n!==null) highest=Math.max(highest,n);
    }
  });
  const n=highest+1; Store.data.meta.queueCounters[key]=n;
  return poliQueuePrefix(poliId)+'-'+String(n).padStart(3,'0');
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
function allocateVisitSession(poliId,dateStr,preferredDoctorId){
  const result=chooseQueueAllocation(poliId,dateStr,preferredDoctorId||null);
  if(result.reason==='full') return null;
  return result;
}

function submitKunjungan(e){
  e.preventDefault();
  const poliId = document.getElementById('kj-poli').value;
  const doctorRaw = document.getElementById('kj-dokter') ? document.getElementById('kj-dokter').value : '';
  const doctorId = doctorRaw && doctorRaw!=='AUTO' ? doctorRaw : null;
  const jenisBayar = document.getElementById('kj-bayar').value;
  const layananId = getPoli(poliId)?.layanan || 'Rawat Jalan';
  const keluhan = document.getElementById('kj-keluhan').value.trim();
  const prioritas = document.getElementById('kj-prioritas').checked;
  const noBpjs = document.getElementById('kj-nobpjs') ? document.getElementById('kj-nobpjs').value.trim() : '';
  const patientId = pendaftaranState.pasienTerpilih;
  const poli = getPoli(poliId);
  const allocation = allocateVisitSession(poliId,todayStr(),doctorId);
  if(!allocation){ showToast('Seluruh sesi dokter pada poli ini sudah mencapai kapasitas. Silakan pilih poli/tanggal lain atau gunakan jalur yang ditetapkan petugas.','danger'); return; }
  const schedule = allocation.schedule;
  const effectiveDoctorId = allocation.doctorId;
  const noAntrian = generateNoAntrian(poliId,todayStr());
  const visit = {
    id: uid('KJ'), patientId, tanggal: todayStr(), poliId, jenisLayanan:layananId, dokterId:effectiveDoctorId, sessionId:schedule&&schedule.id||null, allocationMode:allocation.reason, jenisBayar, noBpjs, noAntrian, keluhan,
    status:'menunggu_screening', vital:null, diagnosis:'', catatan:'', labRequest:null, resepId:null, prioritas, screening:null, nextStep:null, communication:[], supportingOrders:[], workflow:{bookedAt:nowISO(),checkinAt:null,screeningAt:null,doctorStartAt:null,supportingAt:null,reviewAt:null,completedAt:null},
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
  printArea('<div style="text-align:center;font-family:monospace;max-width:300px;margin:0 auto"><h2>SIMRS PROTOTYPE</h2><p>Nomor Antrian</p>'+
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
    '<div class="tabs booking-tabs-grid"><button class="tab active" data-btab="jkn">BPJS / JKN Mobile</button>'+
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
    '<div class="service-choice-grid"><button type="button" class="service-choice active" data-bk-service="Poliklinik Spesialis"><strong>🩺 Poli Reguler</strong><span>Poliklinik Spesialis</span></button><button type="button" class="service-choice" data-bk-service="Poliklinik Eksekutif"><strong>⭐ Poli Eksekutif</strong><span>Jadwal & ketentuan khusus</span></button></div>'+
    '<div class="field-row">'+
      '<div class="field"><label>Poli Tujuan</label><select id="bk-poli" required></select></div>'+
      '<div class="field hidden" id="bk-dokter-wrap"><label>Dokter / Sesi Praktik</label><select id="bk-dokter"></select><div class="hint">Pilihan dokter hanya untuk Poli Eksekutif. Poli Reguler menggunakan alokasi dokter/sesi otomatis.</div></div>'+
      '<div class="field"><label>Tanggal Kontrol</label><input type="date" id="bk-tanggal" min="'+dateOffset(0)+'" max="'+dateOffset(7)+'" value="'+dateOffset(1)+'" required></div>'+
    '</div><div id="bk-service-note" class="alert alert-info"></div>'+
    (isBpjs ? '<div class="field"><label>No. Kartu BPJS</label><input type="text" id="bk-nobpjs" placeholder="0001234567890" required></div>' : '')+
    '<button type="submit" class="btn btn-primary" disabled id="btn-submit-booking">'+(isBpjs?'Simulasikan Booking Masuk':'Buat Booking')+'</button>'+
    '</form><div id="bk-confirm"></div>';
}
function bindBookingListActions(){
  document.querySelectorAll('[data-reschedule]').forEach(function(b){ b.addEventListener('click',function(){ rescheduleBooking(this.dataset.reschedule); }); });
  document.querySelectorAll('[data-cancel-booking]').forEach(function(b){ b.addEventListener('click',function(){ cancelBooking(this.dataset.cancelBooking); }); });
  document.querySelectorAll('[data-view-booking]').forEach(function(b){ b.addEventListener('click',function(){ const x=getBooking(this.dataset.viewBooking); if(!x)return; openModal('<div class="modal-head"><h2>Detail Booking '+esc(x.noAntrian)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p><strong>Pasien:</strong> '+esc(getPatient(x.patientId).nama)+'<br><strong>Poli:</strong> '+esc(getPoli(x.poliId).nama)+'<br><strong>Layanan:</strong> '+esc(x.jenisLayanan||getPoli(x.poliId).layanan||'Rawat Jalan')+'<br><strong>Tanggal:</strong> '+formatTanggalIndo(x.tanggalKontrol)+'<br><strong>Status:</strong> '+bookingStatusLabel(x.status)+'</p></div>'); }); });
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
  const bkPoli=document.getElementById('bk-poli'), bkDate=document.getElementById('bk-tanggal'), bkDok=document.getElementById('bk-dokter'), bkDokWrap=document.getElementById('bk-dokter-wrap');
  let bkService='Poliklinik Spesialis';
  function refreshBkPoli(){const opts=Store.data.poli.filter(p=>p.official&&p.layanan===bkService).sort((a,b)=>a.nama.localeCompare(b.nama));bkPoli.innerHTML=opts.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+'</option>').join('');refreshBkDoctors();}
  function refreshBkDoctors(){const isEx=bkService==='Poliklinik Eksekutif';bkDokWrap.classList.toggle('hidden',!isEx);bkDok.required=isEx;const list=getDoctorSchedulesForDate(bkPoli.value,bkDate.value);if(isEx){bkDok.innerHTML='<option value="AUTO">⚡ Otomatis — sistem memilih dokter/sesi yang masih tersedia</option>'+list.map(sc=>{const d=Store.data.users.find(u=>u.doctorMasterId===sc.doctorId)||Store.data.users.find(u=>u.id===sc.doctorId)||doctorMasterById(sc.doctorId);return d?'<option value="'+(d.id||sc.doctorId)+'">'+esc(d.nama)+' · '+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+' · '+esc(sc.ruang||'')+'</option>':'';}).join('');}else{bkDok.innerHTML='<option value="AUTO">⚡ Sistem memilih dokter/sesi otomatis</option>';}bkDok.value='AUTO';const note=document.getElementById('bk-service-note');if(note)note.innerHTML=isEx?'<strong>Eksekutif:</strong> booking dibatasi H-1 atau hari H sesuai jendela sesi dokter; pasien tidak digabung dengan antrean Reguler.':'<strong>Reguler:</strong> booking masuk antrean Poliklinik Spesialis dan dokter/sesi ditentukan otomatis berdasarkan jadwal dan kapasitas.';}
  document.querySelectorAll('[data-bk-service]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-bk-service]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');bkService=btn.dataset.bkService;refreshBkPoli();}));
  bkPoli.addEventListener('change',refreshBkDoctors); bkDate.addEventListener('change',refreshBkDoctors); refreshBkPoli();
  document.getElementById('form-booking').addEventListener('submit', function(e){ e.preventDefault(); submitBooking(jenisBayar); });
}
function isExecutivePoli(poliId){ const p=getPoli(poliId); return !!(p&&p.layanan==='Poliklinik Eksekutif'); }
function executiveBookingAllowed(poliId,dateStr,doctorId){
  if(!isExecutivePoli(poliId)) return {ok:true};
  const today=todayStr(), tomorrow=dateOffset(1);
  if(dateStr!==today && dateStr!==tomorrow) return {ok:false,message:'Booking Poliklinik Eksekutif mengikuti ketentuan H-1 atau sampai 1 jam sebelum praktik dimulai.'};
  const sessions=getSessionCandidates(poliId,dateStr).filter(function(sc){return !doctorId||sc.doctorId===doctorId;});
  if(!sessions.length) return {ok:false,message:'Belum ada jadwal dokter Eksekutif pada tanggal tersebut.'};
  if(dateStr===tomorrow) return {ok:true};
  const now=new Date(), mins=now.getHours()*60+now.getMinutes();
  const allowed=sessions.some(function(sc){const a=String(sc.jamMulai).split(':').map(Number);return mins < (a[0]*60+a[1]-60);});
  return allowed?{ok:true}:{ok:false,message:'Batas booking Eksekutif untuk sesi dokter yang dipilih sudah lewat. Silakan pilih sesi/dokter lain.'};
}
function submitBooking(jenisBayar){
  if(!bookingSearchPatientId){ showToast('Pilih pasien terlebih dahulu', 'danger'); return; }
  const poliId = document.getElementById('bk-poli').value;
  const tanggalKontrol = document.getElementById('bk-tanggal').value;
  const dokterId = document.getElementById('bk-dokter') ? document.getElementById('bk-dokter').value : null;
  const noBpjs = jenisBayar==='BPJS' ? document.getElementById('bk-nobpjs').value.trim() : '';
  if(jenisBayar==='BPJS' && !noBpjs){ showToast('Isi nomor kartu BPJS', 'danger'); return; }
  if(!tanggalKontrol){ showToast('Pilih tanggal kontrol', 'danger'); return; }
  const execWindow=executiveBookingAllowed(poliId,tanggalKontrol,(dokterId&&dokterId!=='AUTO')?dokterId:null);
  if(!execWindow.ok){ showToast(execWindow.message,'danger'); return; }
  const kuota = totalCapacityForPoliDate(poliId, tanggalKontrol);
  const terjadwal = Store.data.bookings.filter(function(b){ return samePoli(b.poliId,poliId) && b.tanggalKontrol===tanggalKontrol && ['terjadwal','checked_in'].includes(b.status); }).length;
  if(terjadwal >= kuota){ showToast('Seluruh kapasitas sesi dokter pada poli dan tanggal tersebut sudah penuh ('+kuota+' pasien)', 'danger'); return; }
  const preferredDoctorId = isExecutivePoli(poliId) && dokterId && dokterId!=='AUTO' ? dokterId : null;
  const allocation=allocateVisitSession(poliId,tanggalKontrol,preferredDoctorId);
  if(!allocation){showToast('Seluruh sesi dokter pada poli ini sudah penuh untuk tanggal tersebut. Silakan pilih tanggal lain.','danger');return;}
  const schedule = allocation.schedule;
  const assignedDoctorId = allocation.doctorId;
  const noAntrian = generateNoAntrian(poliId,tanggalKontrol);
  const booking = {
    id: uid('BK'), patientId: bookingSearchPatientId, poliId, jenisLayanan:getPoli(poliId)?.layanan||'Rawat Jalan', tanggalKontrol, jenisBayar,
    sumber: jenisBayar==='BPJS' ? 'JKN Mobile (Simulasi)' : 'Aplikasi RS',
    dokterId:assignedDoctorId, sessionId:schedule&&schedule.id||null, allocationMode:allocation.reason,
    noBpjs, noAntrian, kodeCheckIn: uid('CHK').toUpperCase(), status:'terjadwal', visitId:null,
    reminded:false, remindedAt:null, createdAt: nowISO(), updatedAt: nowISO(), cancelReason:'', rescheduledFrom:null
  };
  Store.data.bookings.push(booking);
  pushNotification('booking','Booking baru',booking.noAntrian+' — '+getPatient(booking.patientId).nama,booking.patientId);
  Store.save();
  logAudit('booking_'+jenisBayar.toLowerCase(), noAntrian+' — '+esc(getPatient(bookingSearchPatientId).nama)+' ('+formatTanggalIndo(tanggalKontrol)+')');
  showToast('Booking dibuat — nomor antrian '+noAntrian, 'success');
  const patient = getPatient(bookingSearchPatientId), poli = getPoli(poliId);
  const arrival=suggestedArrivalWindow(booking);
  document.getElementById('bk-confirm').innerHTML =
    '<div class="ticket ticket-compact" style="margin-top:16px"><div class="lbl">BOOKING TERKONFIRMASI — '+esc(poli.nama).toUpperCase()+'</div>'+
    '<div class="num">'+noAntrian+'</div><div class="meta">'+esc(patient.nama)+' · '+formatTanggalIndo(tanggalKontrol)+' · '+jenisBayar+'</div>'+
    (arrival?'<div class="ticket-arrival"><span>⏰ Estimasi kedatangan</span><strong>'+esc(arrival.text)+'</strong><small>Estimasi prototype.</small></div>':'')+
    '<div class="ticket-qr">'+renderQrSvg(booking.kodeCheckIn,130)+'</div><div class="ticket-code">Kode: <span class="mono">'+booking.kodeCheckIn+'</span></div></div>'+
    '<div class="hint ticket-note">Tunjukkan QR ini atau kode check-in saat datang ke loket.</div>';
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
    const allocation=allocateVisitSession(poliId,tanggal,b.dokterId||null);
    if(!allocation){showToast('Tidak ada sesi dokter yang masih memiliki kapasitas pada tanggal tersebut.','danger');return;}
    b.poliId=poliId; b.tanggalKontrol=tanggal; b.noAntrian=generateNoAntrian(poliId,tanggal); b.dokterId=allocation.doctorId; b.sessionId=allocation.schedule&&allocation.schedule.id||null; b.allocationMode=allocation.reason; b.status='terjadwal'; b.rescheduledFrom=oldQueue; b.updatedAt=nowISO();
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
    id: uid('KJ'), patientId: booking.patientId, tanggal: todayStr(), poliId: booking.poliId, jenisLayanan:booking.jenisLayanan||getPoli(booking.poliId)?.layanan||'Rawat Jalan', dokterId:booking.dokterId||null, sessionId:booking.sessionId||null,
    jenisBayar: booking.jenisBayar, noBpjs: booking.noBpjs||'', noAntrian: booking.noAntrian,
    keluhan:'Kontrol terjadwal ('+booking.sumber+')', status:'menunggu_screening', vital:null, diagnosis:'', catatan:'',
    labRequest:null, resepId:null, billing:{registrasi:BIAYA_REGISTRASI, konsultasi:0, obat:0, lab:0},
    bookingId: booking.id, unit:'rawat-jalan', workflow:{bookedAt:booking.createdAt||null,checkinAt:null,screeningAt:null,doctorStartAt:null,supportingAt:null,reviewAt:null,completedAt:null}, createdAt: nowISO(), updatedAt: nowISO()
  };
  Store.data.visits.push(visit);
  booking.status = 'checked_in';
  booking.visitId = visit.id;
  visit.workflow.checkinAt = nowISO();
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
    const pesan = 'Halo '+p.nama+', mengingatkan jadwal kontrol Anda besok ('+formatTanggalIndo(b.tanggalKontrol)+') di '+poli.nama+' SIMRS PROTOTYPE, nomor antrian '+b.noAntrian+'. Mohon datang tepat waktu. Terima kasih.';
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

function rawatJalanKpiHtml(poliId){
  const m=clinicTodayMetrics(poliId), visits=m.queue.visits;
  const screening=visits.filter(v=>['menunggu_screening','screening'].includes(v.status)).length;
  const waitingDoctor=visits.filter(v=>v.status==='menunggu_dokter').length;
  const review=visits.filter(v=>v.status==='menunggu_review').length;
  const penunjang=visits.filter(v=>v.status==='menunggu_penunjang'||v.status==='menunggu_lab').length;
  const ph=pharmacyMetrics('rawat_jalan',poliId);
  const k=(ic,l,v,sub,cls)=>'<div class="rj-kpi '+(cls||'')+'"><span>'+ic+'</span><div><b>'+v+'</b><small>'+l+'</small><em>'+sub+'</em></div></div>';
  return '<div class="rj-kpi-grid">'+
    k('👥','Terdaftar',m.registered,'kunjungan hari ini')+
    k('🎫','Booking',m.bookings,'terjadwal')+
    k('🟡','Screening',screening,'belum selesai')+
    k('⏳','Menunggu Dokter',waitingDoctor,'siap dipanggil',waitingDoctor? 'warn':'')+
    k('🩺','Diperiksa',m.examined,'sedang berlangsung')+
    k('🧪','Penunjang',penunjang,'menunggu hasil/order')+
    k('🔎','Review',review,'hasil siap ditinjau',review?'warn':'')+
    k('✓','Selesai',m.completed,'kunjungan selesai')+
    k('💊','Farmasi',ph.pending,'resep · max '+ph.maxWait+' mnt',ph.maxWait>ph.sla?'danger':'')+
  '</div>';
}
function renderRawatJalanPatientJourney(poliId){
  const list=visitsToday(poliId).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const counts={booking:Store.data.bookings.filter(b=>samePoli(b.poliId,poliId)&&b.tanggalKontrol===todayStr()).length,checkin:list.filter(v=>v.workflow&&v.workflow.checkinAt).length,screening:list.filter(v=>['screening','menunggu_dokter'].includes(v.status)||v.screening).length,doctor:list.filter(v=>v.status==='diperiksa').length,penunjang:list.filter(v=>['menunggu_lab','menunggu_penunjang','menunggu_review'].includes(v.status)).length,done:list.filter(v=>v.status==='selesai').length};
  const steps=[['BOOKING',counts.booking,'slate'],['CHECK-IN',counts.checkin,'sage'],['SCREENING',counts.screening,'clinical'],['DOKTER',counts.doctor,'plum'],['PENUNJANG/REVIEW',counts.penunjang,'amber'],['SELESAI',counts.done,'slate']];
  return '<div class="panel rj-journey"><div class="panel-head"><div><h2>🧭 Patient Journey Hari Ini</h2><div class="hint">Satu perjalanan pasien dari registrasi sampai selesai, tanpa input identitas berulang.</div></div></div><div class="panel-body"><div class="rj-flow">'+steps.map((x,i)=>'<div class="rj-flow-step '+x[2]+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong>'+(i<steps.length-1?'<i>→</i>':'')+'</div>').join('')+'</div></div></div>';
}
function renderRawatJalanAlerts(poliId){
  const visits=visitsToday(poliId), av=getDoctorAvailability(poliId), now=Date.now();
  const late=visits.filter(v=>v.status==='menunggu_dokter' && v.workflow && v.workflow.screeningAt && now-new Date(v.workflow.screeningAt).getTime()>30*60000).length;
  const items=[];
  if(av.status==='delay') items.push('Dokter terlambat: '+(av.message||'silakan koordinasikan jadwal dokter.'));
  if(av.status==='cancel') items.push('Dokter tidak praktik: informasikan pasien dan lakukan penjadwalan ulang sesuai kewenangan.');
  if(late) items.push(late+' pasien menunggu dokter lebih dari 30 menit setelah screening.');
  const ph=pharmacyMetrics('rawat_jalan',poliId); if(ph.maxWait>ph.sla) items.push('Farmasi rawat jalan melewati parameter SLA pada resep pasien poli ini.');
  return '<div class="panel rj-alert-panel"><div class="panel-head"><h2>🔔 Perhatian Operasional</h2></div><div class="panel-body">'+(items.length?items.map(x=>'<div class="rj-alert">⚠ '+esc(x)+'</div>').join(''):'<div class="rj-ok">✓ Tidak ada alert kritis pada poli ini.</div>')+'</div></div>';
}
function renderPoli(){
  setPageTitle('Rawat Jalan');
  const u=Session.currentUser;
  poliState={poliId:canonicalPoliId((u.role==='dokter'||u.role==='perawat')&&u.poliId ? u.poliId : (Store.data.poli[0]&&Store.data.poli[0].id)),activeVisitId:null,resepItems:[]};
  const serviceChooser = u.role==='rawat_jalan'
    ? '<div class="poli-service-switch"><button type="button" class="poli-service-btn active" data-service="Poliklinik Spesialis">🩺 Poli Reguler</button><button type="button" class="poli-service-btn" data-service="Poliklinik Eksekutif">⭐ Poli Eksekutif</button></div>'
    : '';
  const poliSelector=(u.role==='admin'||u.role==='rawat_jalan')?'<div class="field" style="max-width:520px"><label>Unit / Poli</label><select id="poli-select"></select></div>':'';
  document.getElementById('main-content').innerHTML=
    pageIntro(u.role==='dokter'?'Workspace dokter untuk '+esc(getPoli(u.poliId).nama)+'.':'Command Center pelayanan Rawat Jalan — pilih kategori poli terlebih dahulu, lalu pilih klinik untuk pendaftaran langsung dan pengelolaan antrean.')+
    serviceChooser+poliSelector+'<div id="rj-doctor-session-dashboard"></div>'+(u.role==='dokter'?'':'<div id="rj-kpi-area"></div>')+'<div id="rj-queue-control-area"></div>'+(u.role==='dokter'?'':renderRawatJalanPatientJourney(poliState.poliId))+
    '<div class="rj-work-grid"><div><div class="panel"><div class="panel-head"><div><h2 id="poli-queue-title">Antrian Rawat Jalan</h2><div class="hint">Status pasien ditampilkan per tahap agar petugas tahu apa yang harus dikerjakan berikutnya.</div></div></div><div class="panel-body" id="poli-queue-area"></div></div></div><div id="poli-exam-area"><div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien yang siap diperiksa. Skrining awal dilakukan oleh perawat.</div></div></div></div></div>'+(u.role==='dokter'?'':renderRawatJalanAlerts(poliState.poliId))+
    (u.role==='dokter'?'':'<div class="grid grid-2"><div class="panel" id="poli-jadwal-panel"></div><div class="panel" id="poli-info-panel"></div></div>');
  const serviceButtons=document.querySelectorAll('[data-service]');
  const poliSelect=document.getElementById('poli-select');
  function populatePoliOptions(service){
    if(!poliSelect) return;
    const options=Store.data.poli.filter(p=>p.official && (!service || p.layanan===service)).sort((a,b)=>a.nama.localeCompare(b.nama));
    poliSelect.innerHTML=options.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+' — '+esc(p.layanan||'Rawat Jalan')+'</option>').join('');
    if(options.some(p=>samePoli(p.id,poliState.poliId))) poliSelect.value=poliState.poliId;
    else if(options[0]){ poliState.poliId=options[0].id; poliSelect.value=options[0].id; }
    rerenderHeader(); refreshPoliQueue(); refreshQueueControlPanel(); renderJadwalKontrolPoli(); renderInfoPraktikPoli();
  }
  serviceButtons.forEach(btn=>btn.addEventListener('click',()=>{
    serviceButtons.forEach(x=>x.classList.remove('active')); btn.classList.add('active'); populatePoliOptions(btn.dataset.service);
  }));
  if(poliSelect){
    poliSelect.addEventListener('change',()=>{ poliState.poliId=canonicalPoliId(poliSelect.value); rerenderHeader(); refreshPoliQueue(); refreshQueueControlPanel(); renderJadwalKontrolPoli(); renderInfoPraktikPoli(); });
    populatePoliOptions(u.role==='rawat_jalan'?'Poliklinik Spesialis':null);
  }

  function rerenderHeader(){
    const k=document.getElementById('rj-kpi-area'); if(k) k.innerHTML=rawatJalanKpiHtml(poliState.poliId);
    const j=document.querySelector('.rj-journey'); if(j) j.outerHTML=renderRawatJalanPatientJourney(poliState.poliId);
    const a=document.querySelector('.rj-alert-panel'); if(a) a.outerHTML=renderRawatJalanAlerts(poliState.poliId);
  }
  window.__rjRerender=rerenderHeader;
  renderDoctorSessionDashboard();
  rerenderHeader(); refreshPoliQueue(); refreshQueueControlPanel(); renderJadwalKontrolPoli(); renderInfoPraktikPoli();
  // Pulihkan ruang pemeriksaan aktif setelah refresh: kunjungan tetap berstatus diperiksa,
  // bukan dibuat ulang atau ditandai selesai. Data diambil dari kunjungan tersimpan.
  const currentActive=visitsToday().find(function(v){return samePoli(v.poliId,poliState.poliId)&&v.unit==='rawat-jalan'&&v.status==='diperiksa'&&(!u||u.role!=='dokter'||v.dokterId===u.id);});
  if(currentActive){
    poliState.activeVisitId=currentActive.id;
    const currentRx=getResepByVisit(currentActive.id);
    poliState.resepItems=(currentRx&&['draft','menunggu'].includes(currentRx.status))?(currentRx.items||[]).map(function(it){return Object.assign({},it);}):[];
    renderFormPeriksa(currentActive);
  }
}

function renderDoctorSessionDashboard(){
  const el=document.getElementById('rj-doctor-session-dashboard'); if(!el)return;
  const u=Session.currentUser; if(!u||u.role!=='dokter'){el.innerHTML='';return;}
  const poliId=canonicalPoliId(u.poliId), sc=getDoctorScheduleForUser(poliId,u.id,todayStr());
  const mine=visitsToday().filter(v=>samePoli(v.poliId,poliId)&&v.dokterId===u.id&&v.unit==='rawat-jalan').sort((a,b)=>(queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999));
  const active=mine.find(v=>v.status==='diperiksa')||mine.find(v=>v.status==='dipanggil'); const waiting=mine.filter(v=>['menunggu_dokter','menunggu_poli','screening'].includes(v.status));
  el.innerHTML='<div class="doctor-session-dashboard panel"><div class="panel-head"><div><div class="ops-eyebrow">DASHBOARD SESI DOKTER</div><h2>📺 '+esc(getPoli(poliId).nama)+' · '+esc(u.nama)+'</h2><div class="hint">'+(sc?'Sesi '+esc(sc.shiftLabel||'')+' · '+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+' · '+esc(sc.ruang||'Ruang Poli'):'Belum ada sesi terjadwal hari ini')+'</div></div><span class="badge '+(sc?'badge-sage':'badge-amber')+'">'+(sc?'TERJADWAL':'TIDAK TERJADWAL')+'</span></div><div class="panel-body"><div class="doctor-live-grid"><div><span class="kpi-label">SEDANG DIPANGGIL</span><strong class="doctor-live-number">'+esc(active?active.noAntrian:'—')+'</strong></div><div><span class="kpi-label">MENUNGGU</span><strong class="doctor-live-number small">'+waiting.length+'</strong></div><div><span class="kpi-label">ANTREAN SESI</span><strong class="doctor-live-number small">'+(mine.length?'001 → '+String(mine.length).padStart(3,'0'):'001 → —')+'</strong></div></div><div class="hint" style="margin-top:10px">Nomor antrean sekarang milik <strong>poli + tanggal</strong>. Dokter dan sesi hanya menentukan alokasi pelayanan. Contoh: Jantung <strong>JAN-001</strong> dapat dilayani dr. Rudi, lalu <strong>JAN-021</strong> oleh dr. Sany tanpa membuat nomor baru dari 001.</div></div></div>';
}

function refreshQueueControlPanel(){
  const el=document.getElementById('rj-queue-control-area'); if(!el)return;
  el.innerHTML=renderQueueControlPanel(poliState.poliId);
  bindQueueControlPanel();
}
function queueCandidates(poliId){
  const u=Session.currentUser;
  return visitsToday().filter(function(v){
    if(!(samePoli(v.poliId,poliId) && v.unit==='rawat-jalan' && v.status==='menunggu_dokter')) return false;
    if(u&&u.role==='dokter'){ const dm=Store.data.doctors.find(function(d){return d.linkedUserId===u.id;}); return v.dokterId===u.id || (dm&&v.dokterId===dm.id); }
    return true;
  }).sort(function(a,b){
    return (b.prioritas?1:0)-(a.prioritas?1:0)||(queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999);
  });
}
function callNextPatient(poliId){
  const u=Session.currentUser; if(!u||!['dokter','perawat','admin'].includes(u.role)){showToast('Kontrol antrean hanya dapat dilakukan oleh petugas berwenang.','danger');return;}
  const active=visitsToday().find(v=>samePoli(v.poliId,poliId)&&v.unit==='rawat-jalan'&&v.status==='diperiksa'&&(!u||u.role!=='dokter'||v.dokterId===u.id));
  if(active){showToast('Masih ada pasien yang sedang diperiksa ('+active.noAntrian+'). Selesaikan pasien tersebut terlebih dahulu.','warning');return;}
  const called=visitsToday().find(v=>samePoli(v.poliId,poliId)&&v.unit==='rawat-jalan'&&v.status==='dipanggil'&&(!u||u.role!=='dokter'||v.dokterId===u.id));
  if(called){showToast('Pasien '+called.noAntrian+' sudah dipanggil. Mulai atau tangani pasien tersebut sebelum memanggil nomor lain.','warning');return;}
  const next=queueCandidates(poliId)[0]; if(!next){showToast('Belum ada pasien yang siap dipanggil di poli ini. Selesaikan screening terlebih dahulu.','warning');return;}
  next.status='dipanggil'; next.queueCalledAt=nowISO(); next.queueCallCount=(next.queueCallCount||0)+1; next.updatedAt=nowISO();
  Store.save(); pushNotification('queue','🟢 SILAKAN MASUK',next.noAntrian+' — silakan menuju '+getPoli(next.poliId).nama,next.patientId); logAudit('panggil_berikutnya',next.noAntrian+' — '+getPatient(next.patientId).nama);
  refreshPoliQueue(); refreshQueueControlPanel(); if(window.__rjRerender)window.__rjRerender(); showToast(next.noAntrian+' dipanggil.','success');
}
function recallPatient(visitId){
  const v=getVisit(visitId); if(!v)return; if(!['dipanggil','diperiksa'].includes(v.status)){showToast('Pasien belum berstatus dipanggil.','warning');return;}
  v.status='dipanggil'; v.queueCallCount=(v.queueCallCount||0)+1; v.queueCalledAt=nowISO(); v.updatedAt=nowISO(); Store.save(); pushNotification('queue','🔔 Panggilan Ulang',v.noAntrian+' — silakan menuju '+getPoli(v.poliId).nama,v.patientId); logAudit('panggil_ulang',v.noAntrian+' — '+getPatient(v.patientId).nama); refreshPoliQueue(); refreshQueueControlPanel(); showToast('Panggilan ulang dikirim.','success');
}
function pausePatient(visitId){
  const v=getVisit(visitId); if(!v)return; v.status='menunggu_dokter'; v.queuePausedAt=nowISO(); v.updatedAt=nowISO(); Store.save(); logAudit('tunda_antrean',v.noAntrian+' — '+getPatient(v.patientId).nama); refreshPoliQueue(); refreshQueueControlPanel(); showToast(v.noAntrian+' ditunda dan kembali ke antrean.','success');
}
function renderQueueControlPanel(poliId){
  const u=Session.currentUser; if(!u||!['dokter','perawat','admin'].includes(u.role))return '';
  const user=Session.currentUser;
  const mine=function(v){return samePoli(v.poliId,poliId)&&v.unit==='rawat-jalan'&&(!user||user.role!=='dokter'||v.dokterId===user.id);};
  const active=visitsToday().filter(function(v){return mine(v)&&v.status==='diperiksa';}).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0]||null;
  const called=visitsToday().filter(function(v){return mine(v)&&v.status==='dipanggil';}).sort((a,b)=>new Date(b.queueCalledAt||b.updatedAt||b.createdAt)-new Date(a.queueCalledAt||a.updatedAt||a.createdAt))[0]||null;
  const next=queueCandidates(poliId)[0]||null;
  const current=active||called;
  let body='<div class="queue-control-actions"><div class="ops-alert"><strong>'+(current?'Pasien aktif: '+esc(current.noAntrian):'Berikutnya: '+(next?esc(next.noAntrian):'—'))+'</strong><div>'+(current?esc(getPatient(current.patientId).nama)+(active?' · Sedang diperiksa':' · Menunggu mulai pemeriksaan'):(next?esc(getPatient(next.patientId).nama):'Belum ada pasien siap dipanggil.'))+'</div></div>';
  if(!active&&!called) body+='<button type="button" class="btn btn-primary" id="btn-queue-call-next">▶️ Panggil Berikutnya</button>';
  if(called) body+='<button type="button" class="btn btn-primary" id="btn-queue-open-called">🩺 Mulai Pemeriksaan</button><button type="button" class="btn btn-outline" id="btn-queue-recall">↩️ Panggil Ulang</button><button type="button" class="btn btn-ghost" id="btn-queue-pause">⏸️ Pasien Tidak Hadir / Tunda</button>';
  if(active) body+='<button type="button" class="btn btn-primary" id="btn-queue-finish-next">✅ Selesaikan Pemeriksaan</button>';
  return '<section class="panel queue-control-panel"><div class="panel-head"><div><div class="ops-eyebrow">ANTREAN POLI · '+esc(getPoli(poliId)?.nama||poliId)+'</div><h2>🔄 Kontrol Antrean</h2><div class="hint">Satu pasien aktif dalam satu waktu. Selesaikan pemeriksaan sebelum memanggil pasien berikutnya.</div></div><span class="badge '+(active?'badge-clinical':called?'badge-sage':'badge-slate')+'">'+(active?'Sedang Diperiksa':called?'Menunggu Mulai':'Siap')+'</span></div><div class="panel-body">'+body+'</div></section>';
}
function bindQueueControlPanel(){
  const call=document.getElementById('btn-queue-call-next'); if(call)call.addEventListener('click',()=>callNextPatient(poliState.poliId));
  const open=document.getElementById('btn-queue-open-called'); if(open){open.addEventListener('click',()=>{const u=Session.currentUser;const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&v.unit==='rawat-jalan'&&v.status==='dipanggil'&&(!u||u.role!=='dokter'||v.dokterId===u.id));if(v)bukaPeriksa(v.id);});}
  const recall=document.getElementById('btn-queue-recall'); if(recall){recall.addEventListener('click',()=>{const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&['dipanggil','diperiksa'].includes(v.status));if(v)recallPatient(v.id);});}
  const pause=document.getElementById('btn-queue-pause'); if(pause){pause.addEventListener('click',()=>{const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&['dipanggil','diperiksa'].includes(v.status));if(v)pausePatient(v.id);});}
  const finish=document.getElementById('btn-queue-finish-next'); if(finish)finish.addEventListener('click',function(){
    const active=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&v.status==='diperiksa'&&(!Session.currentUser||Session.currentUser.role!=='dokter'||v.dokterId===Session.currentUser.id));
    if(!active)return;
    const form=document.getElementById('form-periksa');
    if(form && poliState.activeVisitId===active.id){form.requestSubmit();return;}
    const p=getPatient(active.patientId);
    showToast('Draft pasien '+p.nama+' dipulihkan. Periksa formulir lalu selesaikan dari halaman pemeriksaan.','warning');
    poliState.activeVisitId=active.id;
    const rx=getResepByVisit(active.id);poliState.resepItems=(rx&&['draft','menunggu'].includes(rx.status))?(rx.items||[]).map(function(it){return Object.assign({},it);}):[];
    renderFormPeriksa(active);
  });
}

function openScreening(visitId){
  const actor=Session.currentUser; if(!actor||actor.role!=='perawat'){showToast('Screening hanya dapat diisi oleh akun perawat.','danger');return;}
  const v=getVisit(visitId); if(!v)return; const p=getPatient(v.patientId); if(!p)return;
  const statusSebelumScreening=v.status; const oldScr=v.screening||{}; openModal('<div class="modal-head"><h2>🩺 Screening Awal — '+esc(p.nama)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p class="hint">Screening dapat dikoreksi sebelum/follow-up sesuai kewenangan. Perubahan dicatat dalam riwayat.</p><div class="field-row"><div class="field"><label>Tekanan Darah</label><input id="scr-td" placeholder="120/80" value="'+esc(oldScr.td||'')+'"></div><div class="field"><label>Nadi</label><input id="scr-nadi" type="number" placeholder="80" value="'+esc(oldScr.nadi||'')+'"></div></div><div class="field-row"><div class="field"><label>Suhu °C</label><input id="scr-suhu" type="number" step="0.1" placeholder="36.7" value="'+esc(oldScr.suhu||'')+'"></div><div class="field"><label>SpO₂ %</label><input id="scr-spo2" type="number" placeholder="98" value="'+esc(oldScr.spo2||'')+'"></div></div><div class="field-row"><div class="field"><label>Berat Badan kg</label><input id="scr-bb" type="number" step="0.1" value="'+esc(oldScr.bb||'')+'"></div><div class="field"><label>Tinggi Badan cm</label><input id="scr-tb" type="number" step="0.1" value="'+esc(oldScr.tb||'')+'"></div></div><div class="field"><label>Keluhan Utama / Screening</label><textarea id="scr-keluhan">'+esc(oldScr.keluhan||v.keluhan||'')+'</textarea></div><div class="field"><label>Alergi</label><input id="scr-alergi" value="'+esc(oldScr.alergi||p.alergi||'')+'" placeholder="Tidak diketahui / sebutkan bila ada"></div><button class="btn btn-primary btn-block" id="btn-save-screening">Simpan Koreksi Screening & Kirim ke Dokter</button></div>');
  document.getElementById('btn-save-screening').addEventListener('click',function(){
    const previous=v.screening?JSON.parse(JSON.stringify(v.screening)):null;
    const revisedAt=nowISO();
    if(previous){if(!Array.isArray(v.screeningRevisions))v.screeningRevisions=[];v.screeningRevisions.push({previous:previous,changedAt:revisedAt,changedBy:Session.currentUser.id||Session.currentUser.nama});}
    v.screening={td:document.getElementById('scr-td').value.trim(),nadi:document.getElementById('scr-nadi').value,suhu:document.getElementById('scr-suhu').value,spo2:document.getElementById('scr-spo2').value,bb:document.getElementById('scr-bb').value,tb:document.getElementById('scr-tb').value,keluhan:document.getElementById('scr-keluhan').value.trim(),alergi:document.getElementById('scr-alergi').value.trim(),by:Session.currentUser.nama,at:previous?(previous.at||revisedAt):revisedAt,updatedAt:revisedAt};
    v.workflow=v.workflow||{}; if(!v.workflow.screeningAt)v.workflow.screeningAt=v.screening.at||nowISO();
    const tahapSebelumnya=statusSebelumScreening;
    const screeningBaru=['menunggu_screening','screening','menunggu_dokter','dipanggil','menunggu_poli'].includes(tahapSebelumnya);
    if(screeningBaru)v.status='menunggu_dokter'; // Koreksi setelah dokter/antarunit dimulai tidak boleh memundurkan status kunjungan.
    v.updatedAt=nowISO();
    if(v.communication===undefined)v.communication=[]; v.communication.push({type:'screening',message:screeningBaru?'Screening disimpan dan data tersedia untuk dokter.':'Koreksi data screening dicatat tanpa mengubah tahap pelayanan.',createdAt:nowISO(),by:Session.currentUser.nama});
    Store.save(); logAudit(previous?'screening_dikoreksi':'screening_selesai',v.noAntrian+' — '+getPatient(v.patientId).nama);
    if(screeningBaru)pushNotification('queue','Pasien siap diperiksa',v.noAntrian+' — screening selesai dan pasien menunggu panggilan dokter.',v.patientId);
    closeModal(); refreshPoliQueue(); refreshQueueControlPanel(); if(window.__rjRerender)window.__rjRerender(); showToast(screeningBaru?'Screening tersimpan — pasien masuk antrean dokter':'Koreksi screening tersimpan tanpa mengubah tahap kunjungan','success');
  });
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
  const list = Store.data.bookings.filter(b=>samePoli(b.poliId,poliState.poliId) && b.tanggalKontrol===tgl);
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
  const list = Store.data.poliMessages.filter(m=>samePoli(m.poliId,poliState.poliId)).slice(0,10);
  if(list.length===0){ el.innerHTML = '<div class="empty">Belum ada info praktik untuk poli ini.</div>'; return; }
  el.innerHTML = list.map(m=>
    '<div class="history-item"><div class="when">'+formatTanggalWaktu(m.createdAt)+' &middot; '+esc(m.authorName)+' ('+esc(m.authorRole)+') '+
    '<span class="badge '+POLI_MSG_BADGE[m.tipe]+'" style="margin-left:6px">'+POLI_MSG_LABEL[m.tipe]+'</span></div>'+
    '<div style="margin-top:3px">'+esc(m.pesan)+'</div></div>'
  ).join('');
}
function refreshPoliQueue(){
  const poli=getPoli(poliState.poliId), u=Session.currentUser;
  const title=document.getElementById('poli-queue-title'); if(title) title.textContent='Antrian — '+poli.nama;
  let allowed;
  if(u.role==='dokter') allowed=['menunggu_dokter','dipanggil','diperiksa','menunggu_review'];
  else if(u.role==='rawat_jalan') allowed=['menunggu_screening','screening','menunggu_dokter','dipanggil','menunggu_review','menunggu_lab','menunggu_penunjang','diperiksa'];
  else allowed=['menunggu_screening','screening','menunggu_dokter','dipanggil','diperiksa','menunggu_review','menunggu_lab','menunggu_penunjang'];
  const list=visitsToday().filter(v=>samePoli(v.poliId,poliState.poliId)&&allowed.includes(v.status)).sort((a,b)=>(b.prioritas?1:0)-(a.prioritas?1:0)||new Date(a.createdAt)-new Date(b.createdAt));
  const area=document.getElementById('poli-queue-area'); if(!area)return;
  if(!list.length){area.innerHTML='<div class="empty"><div class="big">✓</div>Tidak ada pasien pada tahap yang perlu ditangani.</div>';return;}
  area.innerHTML=list.map(v=>{
    const p=getPatient(v.patientId), age=v.workflow&&v.workflow.screeningAt?Math.max(0,Math.round((Date.now()-new Date(v.workflow.screeningAt).getTime())/60000)):Math.max(0,Math.round((Date.now()-new Date(v.createdAt).getTime())/60000));
    let action='';
    if(['perawat'].includes(u.role) && ['menunggu_screening','screening'].includes(v.status)) action='<button class="btn btn-primary btn-sm" data-screening="'+v.id+'">🩺 Screening</button>';
    else if(u.role==='dokter' && ['menunggu_dokter','dipanggil','diperiksa','menunggu_review'].includes(v.status)) action='<button class="btn btn-primary btn-sm" data-openvisit="'+v.id+'">'+(v.status==='diperiksa'?'↩ Lanjutkan':'Buka Pemeriksaan')+'</button>';
    else if(u.role==='admin' && ['menunggu_screening','screening'].includes(v.status)) action='<span class="badge badge-amber">Screening hanya oleh perawat</span>';
    return '<div class="rj-queue-item '+(v.prioritas?'urgent':'')+'"><div><div class="rj-q-top"><span class="rj-q-no">'+esc(v.noAntrian)+'</span>'+badgeStatus(v.status)+'</div>'+(u.role==='dokter' && ['menunggu_dokter','dipanggil','diperiksa','menunggu_review'].includes(v.status)?'<button type="button" class="btn btn-ghost btn-sm" style="padding:0;font-weight:700" data-openvisit="'+v.id+'">'+esc(p.nama)+'</button>':'<strong>'+esc(p.nama)+'</strong>')+'<div class="hint">RM '+esc(p.id)+' · '+age+' menit dalam tahap aktif'+(v.prioritas?' · 🚩 prioritas':'')+'</div></div><div class="rj-q-actions">'+action+'<button class="btn btn-ghost btn-sm" data-history="'+v.patientId+'">Riwayat</button></div></div>';
  }).join('');
  area.querySelectorAll('[data-screening]').forEach(b=>b.addEventListener('click',()=>openScreening(b.dataset.screening)));
  area.querySelectorAll('[data-openvisit]').forEach(b=>b.addEventListener('click',()=>bukaPeriksa(b.dataset.openvisit)));
  area.querySelectorAll('[data-history]').forEach(b=>b.addEventListener('click',()=>openRiwayatModal(b.dataset.history)));
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
  poliState.activeVisitId=visitId;
  const visit=getVisit(visitId);
  if(!visit)return;
  if(Session.currentUser.role==='dokter') visit.dokterId=Session.currentUser.id;
  if(!['menunggu_dokter','dipanggil','diperiksa','menunggu_review'].includes(visit.status)){ showToast('Pasien belum siap untuk pemeriksaan. Skrining awal ditangani perawat.','warning'); return; }
  if(visit.status==='menunggu_review')visit.reviewPending=true;
  const wasAlreadyInExam=visit.status==='diperiksa';
  visit.status='diperiksa'; visit.workflow=visit.workflow||{}; if(!wasAlreadyInExam&&!visit.workflow.doctorStartAt)visit.workflow.doctorStartAt=nowISO(); visit.updatedAt=nowISO();
  Store.save(); refreshPoliQueue(); if(window.__rjRerender)window.__rjRerender(); const existingRx=getResepByVisit(visit.id); poliState.resepItems=(existingRx && ['draft','menunggu'].includes(existingRx.status)) ? (existingRx.items||[]).map(function(it){return Object.assign({},it);}) : []; renderFormPeriksa(visit);
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
  const screeningBlock = visit.screening ? '<div class="alert alert-info"><strong>Screening Awal</strong><br>TD '+esc(visit.screening.td||'-')+' · Nadi '+esc(visit.screening.nadi||'-')+' · Suhu '+esc(visit.screening.suhu||'-')+' °C · SpO₂ '+esc(visit.screening.spo2||'-')+'% · BB '+esc(visit.screening.bb||'-')+' kg · TB '+esc(visit.screening.tb||'-')+' cm<br><span class="hint">Dicatat oleh '+esc(visit.screening.by||'-')+' · '+formatTanggalWaktu(visit.screening.at)+'</span></div>' : '';
  const hasilLabBlock = (visit.labRequest && visit.labRequest.hasil) ?
    '<div class="alert alert-info"><div><strong>Hasil Laboratorium — '+esc(visit.labRequest.jenis)+'</strong><br>'+esc(visit.labRequest.hasil)+'</div></div>' : '';

  const nextStepValue=visit.nextStep||'selesai';

  document.getElementById('poli-exam-area').innerHTML =
    '<div class="panel"><div class="panel-head"><h2>Pemeriksaan Pasien</h2><div style="display:flex;gap:6px">'+(visit.prioritas?'<span class="badge badge-brick">🚩 Prioritas</span>':'')+badgeStatus(visit.status)+'</div></div><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">'+
        '<div><strong>'+esc(patient.nama)+'</strong> · '+(patient.jenisKelamin==='L'?'Laki-laki':'Perempuan')+' · '+calcUmur(patient.tglLahir)+' tahun<br>'+
        '<span style="color:var(--ink-soft);font-size:13px">No. RM '+patient.id+' &middot; No. Antrian '+visit.noAntrian+'</span></div>'+
        '<button class="btn btn-outline btn-sm" id="btn-lihat-riwayat">📁 Riwayat Rekam Medis</button>'+
      '</div>'+
      screeningBlock+
      (patient.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(patient.alergi)+'</div>' : '')+
      (riwayat.length ? '<details style="margin-bottom:14px"><summary style="cursor:pointer;font-size:13.5px;color:var(--clinical);font-weight:600">Lihat '+riwayat.length+' kunjungan sebelumnya dari semua poli (diagnosis &amp; obat)</summary>'+
        '<div style="margin-top:10px">'+riwayat.map(v=>historyItemHtmlFull(v)).join('')+'</div></details>' : '')+
      hasilLabBlock+
      '<form id="form-periksa">'+
      '<div class="field"><label>Pemeriksaan Dokter / Temuan Klinis</label><textarea id="px-catatan" placeholder="Catat anamnesis tambahan, pemeriksaan fisik dokter, dan temuan klinis. Data screening perawat tersedia di panel kiri.">'+esc(visit.catatan)+'</textarea></div>'+
      '<div class="field"><label>Diagnosis</label><input type="text" id="px-diagnosis" value="'+esc(visit.diagnosis)+'"></div>'+
      '<div class="field"><label>Rencana / Next Step</label><select id="px-next-step"><option value="selesai" '+(nextStepValue==='selesai'?'selected':'')+'>Selesai / Pulang</option><option value="farmasi" '+(nextStepValue==='farmasi'?'selected':'')+'>Resep → Farmasi Rawat Jalan</option><option value="kontrol" '+(nextStepValue==='kontrol'?'selected':'')+'>Jadwal Kontrol</option><option value="penunjang" '+(nextStepValue==='penunjang'?'selected':'')+'>Pemeriksaan Penunjang</option><option value="ranap" '+(nextStepValue==='ranap'?'selected':'')+'>Admisi Rawat Inap</option><option value="rujuk" '+(nextStepValue==='rujuk'?'selected':'')+'>Rujuk Keluar</option></select></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="px-rujuk-lab" '+(visit.labRequest?'checked disabled':'')+'><label for="px-rujuk-lab" style="margin:0">Permintaan Laboratorium</label></div>'+
      '<div class="field hidden" id="px-lab-jenis-wrap"><label>Jenis Pemeriksaan Laboratorium</label><input type="text" id="px-lab-jenis" placeholder="contoh: Darah Lengkap"></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="px-rujuk-rad" '+(visit.radiologyRequest?'checked disabled':'')+'><label for="px-rujuk-rad" style="margin:0">Permintaan Radiologi</label></div>'+
      '<div class="field hidden" id="px-rad-jenis-wrap"><label>Jenis Pemeriksaan Radiologi</label><input type="text" id="px-rad-jenis" placeholder="contoh: Foto Thorax"></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="px-rujuk-igd" '+((visit.referrals||[]).some(function(r){return r.destination==='igd'&&r.status!=='ditolak'&&r.status!=='dibatalkan';})?'checked disabled':'')+'><label for="px-rujuk-igd" style="margin:0">Rujukan ke IGD (berdasarkan keputusan klinis)</label></div>'+
      '<div class="field hidden" id="px-igd-alasan-wrap"><label>Alasan / ringkasan rujukan IGD</label><textarea id="px-igd-alasan" placeholder="Ringkasan klinis untuk serah terima ke IGD"></textarea></div>'+
      '<div id="px-resep-section">'+resepSectionHtml()+'</div>'+
      '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-outline" id="btn-simpan-draft-periksa">💾 Simpan Data Pemeriksaan</button><button type="submit" class="btn btn-primary">✅ Selesaikan Pemeriksaan</button>'+
      '<button type="button" class="btn btn-outline" id="btn-rujuk-ranap">🏥 Admisi Rawat Inap</button></div>'+
      '</form>'+
    '</div></div>';

  // Susun form menjadi satu halaman pemeriksaan bertab; elemen dan ID field dipertahankan agar alur simpan lama tetap terhubung.
  (function buildExamTabs(){
    const form=document.getElementById('form-periksa'); if(!form)return;
    const parent=form.parentElement;
    const nav=document.createElement('div'); nav.className='tabs exam-tabs'; nav.setAttribute('role','tablist');
    nav.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 10px;width:100%;box-sizing:border-box;align-items:stretch';
    const names=[['dokter','Pemeriksaan'],['diagnosis','Diagnosis'],['resep','Resep'],['riwayat','Riwayat']];
    const panes={};
    const previousTab=visit.examDraft&&visit.examDraft.activeTab; const savedTab=(previousTab&&names.some(function(x){return x[0]===previousTab;}))?previousTab:(previousTab==='screening'?'dokter':'dokter');
    names.forEach(function(pair,i){
      const b=document.createElement('button'); b.type='button'; b.className='tab'+(pair[0]===savedTab?' active':''); b.dataset.examtab=pair[0]; b.textContent=pair[1]; b.setAttribute('role','tab'); b.setAttribute('aria-selected',pair[0]===savedTab?'true':'false'); nav.appendChild(b);
      const pane=document.createElement('section'); pane.dataset.exampane=pair[0]; pane.style.display=pair[0]===savedTab?'block':'none'; pane.style.padding='8px 0'; panes[pair[0]]=pane;
    });
    parent.insertBefore(nav,form);
    const draftStatus=form.querySelector('#exam-draft-status');
    if(draftStatus) form.removeChild(draftStatus);
    names.slice().reverse().forEach(function(pair){form.insertBefore(panes[pair[0]],form.firstChild);});
    const history=Array.from(parent.children).find(function(el){return el.tagName==='DETAILS';}); if(history)panes.riwayat.appendChild(history);
    const result=Array.from(parent.children).find(function(el){return el.classList&&el.classList.contains('alert')&&/Hasil Laboratorium/.test(el.textContent);}); if(result)panes.dokter.appendChild(result);
    const fieldToPane={
      'px-catatan':'dokter',
      'px-diagnosis':'diagnosis','px-next-step':'diagnosis','px-rujuk-lab':'diagnosis','px-lab-jenis':'diagnosis','px-rujuk-rad':'diagnosis','px-rad-jenis':'diagnosis','px-rujuk-igd':'diagnosis','px-igd-alasan':'diagnosis',
      'px-resep-section':'resep','btn-simpan-draft-periksa':'dokter','btn-rujuk-ranap':'diagnosis'
    };
    Array.from(form.children).forEach(function(el){
      if(el.matches('[data-exampane]'))return;
      if(el.id==='exam-draft-status')return;
      const field=el.querySelector('input,textarea,select,button');
      const id=field&&field.id; let pane=fieldToPane[id]||null;
      if(!pane && el.id==='px-resep-section')pane='resep';
      if(el.tagName==='BUTTON' || (el.querySelector && el.querySelector('#btn-simpan-draft-periksa')))pane=pane||'dokter';
      if(pane)panes[pane].appendChild(el);
    });
    // Indikator draft dan workspace dua kolom: ringkasan pasien di kiri, formulir dokter di kanan.
    const status=document.createElement('div'); status.id='exam-draft-status'; status.className='hint'; status.setAttribute('aria-live','polite'); status.style.margin='8px 0'; status.textContent='Draft otomatis aktif — perubahan disimpan setelah jeda singkat.'; nav.insertAdjacentElement('afterend',status);
    const workspace=document.createElement('div'); workspace.className='doctor-workspace';
    const sidebar=document.createElement('aside'); sidebar.className='doctor-summary'; sidebar.setAttribute('aria-label','Ringkasan pasien');
    const main=document.createElement('section'); main.className='doctor-workspace-main'; main.setAttribute('aria-label','Ruang kerja dokter');
    parent.insertBefore(workspace,parent.firstChild); workspace.appendChild(sidebar); workspace.appendChild(main);
    const initialHeader=Array.from(parent.children).find(function(el){return el!==workspace&&el.querySelector&&el.querySelector('#btn-lihat-riwayat');});
    const screeningSummary=Array.from(parent.children).find(function(el){return el!==workspace&&el.classList&&el.classList.contains('alert')&&/Screening Awal/.test(el.textContent);});
    const allergySummary=Array.from(parent.children).find(function(el){return el!==workspace&&el.classList&&el.classList.contains('allergy-flag');});
    if(initialHeader)sidebar.appendChild(initialHeader);
    if(screeningSummary){screeningSummary.innerHTML=screeningSummary.innerHTML+'<div class=\"hint\" style=\"margin-top:6px\">Ringkasan baca-saja dari screening perawat.</div>';sidebar.appendChild(screeningSummary);}
    if(allergySummary)sidebar.appendChild(allergySummary);
    const payer=document.createElement('div'); payer.className='doctor-payer-summary'; payer.innerHTML='<strong>Penjamin &amp; pembayaran</strong><div>Penjamin: '+esc(visit.jenisBayar||visit.penjamin||'-')+'</div><div>Metode pembayaran: '+esc((visit.billing&&visit.billing.metodeBayar)||'Belum dicatat')+'</div><div class=\"hint\">Informasi saja — transaksi tetap dikelola kasir.</div>'; sidebar.appendChild(payer);
    main.appendChild(nav); main.appendChild(status); main.appendChild(form);
    nav.querySelectorAll('[data-examtab]').forEach(function(btn){btn.addEventListener('click',function(){
      nav.querySelectorAll('[data-examtab]').forEach(function(b){b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',b===btn?'true':'false');});
      Object.keys(panes).forEach(function(key){panes[key].style.display=key===btn.dataset.examtab?'block':'none';}); visit.examDraft=visit.examDraft||{};visit.examDraft.activeTab=btn.dataset.examtab;try{Store.save();}catch(e){}
    });});
  })();
  document.getElementById('btn-lihat-riwayat').addEventListener('click', ()=> openRiwayatModal(patient.id));
  document.getElementById('btn-rujuk-ranap').addEventListener('click', function(){ rujukRawatInap(visit.id); });
  const rujukChk = document.getElementById('px-rujuk-lab');
  const labWrap = document.getElementById('px-lab-jenis-wrap');
  const examDraft=visit.examDraft||{};
  if(rujukChk&&!rujukChk.disabled)rujukChk.checked=!!examDraft.rujukLab;
  if(document.getElementById('px-lab-jenis')&&!visit.labRequest)document.getElementById('px-lab-jenis').value=examDraft.labJenis||'';
  if(document.getElementById('px-rujuk-rad')&&!document.getElementById('px-rujuk-rad').disabled)document.getElementById('px-rujuk-rad').checked=!!examDraft.rujukRad;
  if(document.getElementById('px-rad-jenis')&&!visit.radiologyRequest)document.getElementById('px-rad-jenis').value=examDraft.radJenis||'';
  if(document.getElementById('px-rujuk-igd')&&!document.getElementById('px-rujuk-igd').disabled)document.getElementById('px-rujuk-igd').checked=!!examDraft.rujukIgd;
  if(document.getElementById('px-igd-alasan'))document.getElementById('px-igd-alasan').value=examDraft.igdAlasan||'';
  if(visit.labRequest){ labWrap.classList.remove('hidden'); document.getElementById('px-lab-jenis').value = visit.labRequest.jenis; document.getElementById('px-lab-jenis').disabled = true; }
  const radChk=document.getElementById('px-rujuk-rad'), radWrap=document.getElementById('px-rad-jenis-wrap'), igdChk=document.getElementById('px-rujuk-igd'), igdWrap=document.getElementById('px-igd-alasan-wrap');
  if(visit.radiologyRequest){radWrap.classList.remove('hidden');document.getElementById('px-rad-jenis').value=visit.radiologyRequest.jenis;document.getElementById('px-rad-jenis').disabled=true;}
  if(igdChk && igdChk.checked){igdWrap.classList.remove('hidden');}
  if(radChk)radChk.addEventListener('change',function(){radWrap.classList.toggle('hidden',!this.checked);});
  if(igdChk)igdChk.addEventListener('change',function(){igdWrap.classList.toggle('hidden',!this.checked);});
  if(rujukChk&&!rujukChk.disabled)labWrap.classList.toggle('hidden',!rujukChk.checked);
  if(radChk&&!radChk.disabled)radWrap.classList.toggle('hidden',!radChk.checked);
  if(igdChk)igdWrap.classList.toggle('hidden',!igdChk.checked);
  rujukChk.addEventListener('change', function(){
    labWrap.classList.toggle('hidden', !this.checked);
    document.getElementById('px-resep-section').classList.toggle('hidden', this.checked);
  });
  bindResepEvents();
  document.getElementById('btn-simpan-draft-periksa').addEventListener('click', function(){ simpanDraftPeriksa(visit.id); logAudit('simpan_draft_pemeriksaan',visit.noAntrian+' — '+getPatient(visit.patientId).nama); const st=document.getElementById('exam-draft-status'); if(st)st.textContent='Data pemeriksaan tersimpan · '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); });
  let examDraftTimer=null;
  document.getElementById('form-periksa').querySelectorAll('input,textarea,select').forEach(function(field){if(field.type==='button'||field.type==='submit')return;field.addEventListener('input',function(){clearTimeout(examDraftTimer);const status=document.getElementById('exam-draft-status');if(status)status.textContent='Perubahan belum tersimpan…';examDraftTimer=setTimeout(function(){if(poliState.activeVisitId===visit.id)simpanDraftPeriksa(visit.id);},900);});field.addEventListener('change',function(){clearTimeout(examDraftTimer);examDraftTimer=setTimeout(function(){if(poliState.activeVisitId===visit.id)simpanDraftPeriksa(visit.id);},250);});});
  document.getElementById('form-periksa').addEventListener('submit', function(e){ e.preventDefault();
    openModal('<div class="modal-head"><h2>Konfirmasi Penyelesaian</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p>Apakah pemeriksaan pasien <strong>'+esc(patient.nama)+'</strong> dengan nomor <strong>'+esc(visit.noAntrian)+'</strong> sudah selesai?</p><div class="alert alert-info">Setelah dikonfirmasi, hasil pemeriksaan disimpan dan status pasien diperbarui. Pasien berikutnya dapat dipanggil setelah ini.</div><button class="btn btn-primary btn-block" id="btn-confirm-finish-next">Ya, Selesaikan Pemeriksaan</button></div>');
    document.getElementById('btn-confirm-finish-next').addEventListener('click', function(){ closeModal(); selesaiPeriksa(visit.id); });
  });
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
    document.getElementById('rsp-jumlah').value=1; document.getElementById('rsp-aturan').value=''; if(poliState.activeVisitId)simpanDraftPeriksa(poliState.activeVisitId);
  });
  bindResepRemoveEvents();
}
function bindResepRemoveEvents(){
  document.querySelectorAll('[data-remove]').forEach(b=>{
    b.addEventListener('click', function(){
      poliState.resepItems.splice(parseInt(this.dataset.remove),1);
      document.getElementById('resep-items-table').innerHTML = resepItemsTableHtml();
      bindResepRemoveEvents(); if(poliState.activeVisitId)simpanDraftPeriksa(poliState.activeVisitId);
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
  const vital=Object.assign({},v.screening||{},v.vital||{});
  return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.updatedAt||v.createdAt)+' &middot; '+esc(poli.nama)+' &middot; '+badgeStatus(v.status)+'</div>'+
    '<div style="margin-top:4px"><strong>Dokter:</strong> '+esc((getUserById(v.dokterId)||{}).nama||'-')+'</div>'+
    '<div><strong>Keluhan:</strong> '+esc(v.keluhan||'-')+'</div>'+
    '<div><strong>Diagnosis:</strong> '+esc(v.diagnosis||'-')+'</div>'+
    (v.catatan ? '<div><strong>Catatan/Tindakan:</strong> '+esc(v.catatan)+'</div>' : '')+
    ((vital.td||vital.nadi||vital.suhu||vital.rr||vital.bb||vital.tb) ? '<div><strong>Tanda vital:</strong> TD '+esc(vital.td||'-')+' · Nadi '+esc(vital.nadi||'-')+' · Suhu '+esc(vital.suhu||'-')+' °C · RR '+esc(vital.rr||'-')+' · BB '+esc(vital.bb||'-')+' kg · TB '+esc(vital.tb||'-')+' cm</div>' : '')+
    (resep ? '<div><strong>Resep:</strong> '+(resep.items||[]).map(i=>esc(i.nama)+' ×'+i.jumlah+' ('+esc(i.aturanPakai||'-')+')').join(', ')+'</div>' : '')+
    ((Session.currentUser&&['dokter','admin'].includes(Session.currentUser.role)&&Array.isArray(v.examRevisions)&&v.examRevisions.length)?'<details style="margin-top:8px"><summary>Riwayat koreksi ('+v.examRevisions.length+')</summary><div class="hint">'+v.examRevisions.slice().reverse().map(function(r){const prev=r.previous||{};return '<div style="padding:6px 0;border-bottom:1px solid var(--line)"><strong>'+esc(r.stage||'perubahan draft')+'</strong><br>'+esc(r.changedBy||'-')+' · '+esc(r.changedAt?formatTanggalWaktu(r.changedAt):'-')+(prev.diagnosis?'<br>Diagnosis sebelumnya: '+esc(prev.diagnosis):'')+(r.correctedTo&&r.correctedTo.diagnosis?'<br>Diagnosis koreksi: '+esc(r.correctedTo.diagnosis):'')+'</div>';}).join('')+'</div></details>':'')+
    ((Session.currentUser&&['dokter','admin'].includes(Session.currentUser.role)&&v.status==='selesai')?'<div style="margin-top:8px"><button type="button" class="btn btn-outline btn-sm" onclick="openFinalVisitCorrection(\''+v.id+'\')">✏️ Koreksi Catatan Klinis</button></div>':'')+'</div>';
}
function openFinalVisitCorrection(visitId){
  const v=getVisit(visitId),u=Session.currentUser;if(!v||v.status!=='selesai'||!u||!['dokter','admin'].includes(u.role)){showToast('Koreksi hanya tersedia bagi dokter/admin pada kunjungan yang sudah selesai.','danger');return;}
  const vital=v.vital||{};
  openModal('<div class="modal-head"><h2>Koreksi Catatan Klinis</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="alert alert-warning">Koreksi akan menyimpan nilai sebelumnya dalam riwayat audit. Resep yang sudah diproses tidak dapat diubah dari formulir ini.</div><div class="field"><label>Keluhan</label><textarea id="corr-keluhan">'+esc(v.keluhan||'')+'</textarea></div><div class="field-row"><div class="field"><label>Tekanan darah</label><input id="corr-td" value="'+esc(vital.td||'')+'"></div><div class="field"><label>Nadi</label><input id="corr-nadi" value="'+esc(vital.nadi||'')+'"></div></div><div class="field-row"><div class="field"><label>Suhu °C</label><input id="corr-suhu" value="'+esc(vital.suhu||'')+'"></div><div class="field"><label>Respirasi</label><input id="corr-rr" value="'+esc(vital.rr||'')+'"></div></div><div class="field-row"><div class="field"><label>Berat badan</label><input id="corr-bb" value="'+esc(vital.bb||'')+'"></div><div class="field"><label>Tinggi badan</label><input id="corr-tb" value="'+esc(vital.tb||'')+'"></div></div><div class="field"><label>Diagnosis</label><input id="corr-dx" value="'+esc(v.diagnosis||'')+'" required></div><div class="field"><label>Catatan / Tindakan</label><textarea id="corr-catatan">'+esc(v.catatan||'')+'</textarea></div><button class="btn btn-primary btn-block" id="btn-save-clinical-correction">Simpan Koreksi dengan Riwayat</button></div>');
  document.getElementById('btn-save-clinical-correction').addEventListener('click',function(){
    const dx=document.getElementById('corr-dx').value.trim();if(!dx){showToast('Diagnosis wajib diisi.','danger');return;}
    const previous={keluhan:v.keluhan||'',vital:JSON.parse(JSON.stringify(v.vital||{})),diagnosis:v.diagnosis||'',catatan:v.catatan||''};
    const next={keluhan:document.getElementById('corr-keluhan').value.trim(),vital:{td:document.getElementById('corr-td').value.trim(),nadi:document.getElementById('corr-nadi').value.trim(),suhu:document.getElementById('corr-suhu').value.trim(),rr:document.getElementById('corr-rr').value.trim(),bb:document.getElementById('corr-bb').value.trim(),tb:document.getElementById('corr-tb').value.trim()},diagnosis:dx,catatan:document.getElementById('corr-catatan').value.trim()};
    if(!Array.isArray(v.examRevisions))v.examRevisions=[];v.examRevisions.push({previous:previous,correctedTo:JSON.parse(JSON.stringify(next)),changedAt:nowISO(),changedBy:u.id||u.nama,stage:'koreksi-final'});
    v.keluhan=next.keluhan;v.vital=next.vital;v.diagnosis=next.diagnosis;v.catatan=next.catatan;v.lastClinicalCorrectionAt=nowISO();v.lastClinicalCorrectionBy=u.id||u.nama;v.updatedAt=nowISO();
    try{Store.save();logAudit('koreksi_catatan_klinis',v.noAntrian+' · '+getPatient(v.patientId).nama);closeModal();showToast('Koreksi tersimpan dan riwayat sebelumnya dipertahankan.','success');if(window.__rjRerender)window.__rjRerender();}catch(e){showToast('Gagal menyimpan koreksi. Data belum dapat dipastikan tersimpan.','danger');}
  });
}
function simpanDraftPeriksa(visitId){
  const visit=getVisit(visitId); if(!visit)return;
  const kel=document.getElementById('px-keluhan'), td=document.getElementById('px-td'), nadi=document.getElementById('px-nadi'), suhu=document.getElementById('px-suhu'), rr=document.getElementById('px-rr'), bb=document.getElementById('px-bb'), tb=document.getElementById('px-tb'), dx=document.getElementById('px-diagnosis'), cat=document.getElementById('px-catatan'), next=document.getElementById('px-next-step');
  const before={keluhan:visit.keluhan||'',vital:JSON.parse(JSON.stringify(visit.vital||{})),diagnosis:visit.diagnosis||'',catatan:visit.catatan||'',nextStep:visit.nextStep||'selesai'};
  if(kel)visit.keluhan=kel.value.trim();
  if(td||nadi||suhu||rr||bb||tb)visit.vital={td:td?td.value.trim():'',nadi:nadi?nadi.value:'',suhu:suhu?suhu.value:'',rr:rr?rr.value:'',bb:bb?bb.value:'',tb:tb?tb.value:''};
  visit.diagnosis=dx?dx.value.trim():visit.diagnosis;
  visit.catatan=cat?cat.value.trim():visit.catatan;
  visit.nextStep=next?next.value:visit.nextStep;
  if(JSON.stringify(before)!==JSON.stringify({keluhan:visit.keluhan,vital:visit.vital,diagnosis:visit.diagnosis,catatan:visit.catatan,nextStep:visit.nextStep})){
    if(!Array.isArray(visit.examRevisions))visit.examRevisions=[];
    visit.examRevisions.push({previous:before,changedAt:nowISO(),changedBy:Session.currentUser?(Session.currentUser.id||Session.currentUser.nama):null,stage:'draft'});
  }
  visit.examDraft=visit.examDraft||{};
  visit.examDraft.activeTab=(document.querySelector('.exam-tabs [data-examtab].active')||{}).dataset?.examtab||visit.examDraft.activeTab||'dokter';
  visit.examDraft.rujukLab=!!(document.getElementById('px-rujuk-lab')&&document.getElementById('px-rujuk-lab').checked);
  visit.examDraft.labJenis=(document.getElementById('px-lab-jenis')||{}).value||'';
  visit.examDraft.rujukRad=!!(document.getElementById('px-rujuk-rad')&&document.getElementById('px-rujuk-rad').checked);
  visit.examDraft.radJenis=(document.getElementById('px-rad-jenis')||{}).value||'';
  visit.examDraft.rujukIgd=!!(document.getElementById('px-rujuk-igd')&&document.getElementById('px-rujuk-igd').checked);
  visit.examDraft.igdAlasan=(document.getElementById('px-igd-alasan')||{}).value||'';
  // Menyimpan resep membuat satu item antrean farmasi yang terhubung ke ID kunjungan.
  // Status pemeriksaan dokter tetap 'diperiksa' sampai tombol finalisasi dipilih.
  if(Array.isArray(poliState.resepItems) && poliState.resepItems.length){
    let rx=getResepByVisit(visit.id);
    if(rx && ['diambil','diberikan','selesai','disiapkan'].includes(rx.status)){
      // Resep yang sudah diproses tidak boleh ditimpa dari editor pemeriksaan.
    }else if(rx){
      rx.items=poliState.resepItems.map(function(it){return Object.assign({},it);});
      const firstQueue=!['menunggu'].includes(rx.status); rx.status='menunggu'; rx.updatedAt=nowISO(); visit.resepId=rx.id;
      if(firstQueue)notifyCareUnit(visit.patientId,'farmasi-rawat-jalan','Resep Rawat Jalan masuk antrean','Resep tersimpan dari '+getPoli(visit.poliId).nama+' · antrean '+visit.noAntrian);
    }else{
      rx={id:uid('RSP'),visitId:visit.id,patientId:visit.patientId,unit:'rawat-jalan',jenisLayanan:'rawat-jalan',items:poliState.resepItems.map(function(it){return Object.assign({},it);}),status:'menunggu',createdAt:nowISO(),updatedAt:nowISO(),siapAt:null,diambilAt:null};
      Store.data.prescriptions.push(rx); visit.resepId=rx.id;
      notifyCareUnit(visit.patientId,'farmasi-rawat-jalan','Resep Rawat Jalan masuk antrean','Resep tersimpan dari '+getPoli(visit.poliId).nama+' · antrean '+visit.noAntrian);
    }
    visit.billing=visit.billing||{registrasi:BIAYA_REGISTRASI,konsultasi:0,obat:0,lab:0};
    visit.billing.obat=poliState.resepItems.reduce(function(sum,it){return sum+(Number(it.jumlah)||0)*(Number(it.hargaSatuan)||0);},0);
  }else{
    const existingEmptyRx=getResepByVisit(visit.id);
    if(existingEmptyRx&&['draft','menunggu'].includes(existingEmptyRx.status)){
      existingEmptyRx.items=[];existingEmptyRx.status='dibatalkan';existingEmptyRx.updatedAt=nowISO();existingEmptyRx.cancelReason='Resep dikosongkan sebelum finalisasi oleh petugas pemeriksa';
      visit.resepId=existingEmptyRx.id;
    }
    visit.billing=visit.billing||{registrasi:BIAYA_REGISTRASI,konsultasi:0,obat:0,lab:0};visit.billing.obat=0;
  }
  // Screening dikelola akun perawat; halaman dokter hanya menampilkan ringkasan baca-saja.
  visit.examDraftSavedAt=nowISO(); visit.examDraftSavedBy=Session.currentUser?(Session.currentUser.id||Session.currentUser.nama):null;
  visit.queueReadyToAdvance=false; // Draft tersimpan bukan berarti pemeriksaan selesai.
  visit.updatedAt=nowISO();
  try{Store.save();const persisted=JSON.parse(localStorage.getItem('simrs_db_v1')||'null');const persistedVisit=persisted&&Array.isArray(persisted.visits)?persisted.visits.find(function(v){return v.id===visitId;}):null;if(!persistedVisit){throw new Error('Kunjungan tidak ditemukan setelah penyimpanan');}}catch(saveError){const failed=document.getElementById('exam-draft-status');if(failed)failed.textContent='GAGAL MENYIMPAN. Data belum terkonfirmasi tersimpan; salin catatan sebelum menutup halaman.';console.error('SIMRS draft save failed',saveError);return;}
  const draftStatus=document.getElementById('exam-draft-status');
  if(draftStatus) draftStatus.textContent='Tersimpan · '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  refreshPoliQueue();
}
function notifyCareUnit(patientId, unit, title, body){
  const p=getPatient(patientId); if(!p)return;
  pushNotification('info',title,body,unit,null);
  pushNotification('info',title,body,p.id,null);
}
function createCareRequest(visit, destination, kind, detail){
  if(!Array.isArray(Store.data.careRequests))Store.data.careRequests=[];
  const request={id:uid('REQ'),patientId:visit.patientId,sourceVisitId:visit.id,sourceUnit:visit.unit||'rawat-jalan',destination:destination,kind:kind,detail:detail,status:'menunggu_konfirmasi',createdAt:nowISO(),createdBy:Session.currentUser?Session.currentUser.id:null,acceptedAt:null,acceptedBy:null,completedAt:null,result:null};
  Store.data.careRequests.unshift(request);
  if(!Array.isArray(visit.careRequestIds))visit.careRequestIds=[];
  visit.careRequestIds.push(request.id);
  notifyCareUnit(visit.patientId,destination,'Permintaan pelayanan baru',detail+' · menunggu konfirmasi '+({lab:'Laboratorium',radiologi:'Radiologi',igd:'IGD',rawat_inap:'Admisi Rawat Inap'}[destination]||destination));
  return request;
}
function selesaiPeriksa(visitId){
  const visit = getVisit(visitId); if(!visit)return;
  if(visit.status!=='diperiksa'){showToast('Kunjungan tidak lagi berstatus sedang diperiksa; cegah penyelesaian ganda.','warning');return;}
  // Simpan seluruh nilai tab yang masih terbuka sebelum membaca data final agar klik cepat tidak kehilangan perubahan.
  simpanDraftPeriksa(visitId);
  const keluhanInput=document.getElementById('px-keluhan'); if(keluhanInput)visit.keluhan=keluhanInput.value.trim();
  const tdInput=document.getElementById('px-td'), nadiInput=document.getElementById('px-nadi'), suhuInput=document.getElementById('px-suhu'), rrInput=document.getElementById('px-rr'), bbInput=document.getElementById('px-bb'), tbInput=document.getElementById('px-tb');
  if(tdInput||nadiInput||suhuInput||rrInput||bbInput||tbInput)visit.vital={td:tdInput?tdInput.value.trim():'',nadi:nadiInput?nadiInput.value:'',suhu:suhuInput?suhuInput.value:'',rr:rrInput?rrInput.value:'',bb:bbInput?bbInput.value:'',tb:tbInput?tbInput.value:''};
  visit.diagnosis = document.getElementById('px-diagnosis').value.trim();
  visit.nextStep = document.getElementById('px-next-step') ? document.getElementById('px-next-step').value : visit.nextStep;
  visit.catatan = document.getElementById('px-catatan').value.trim();
  if(!visit.diagnosis){showToast('Diagnosis wajib diisi sebelum pemeriksaan dapat difinalisasi. Draft tetap tersimpan.','danger');simpanDraftPeriksa(visitId);return;}
  if(visit.examDraftSavedAt){if(!Array.isArray(visit.examRevisions))visit.examRevisions=[];visit.examRevisions.push({changedAt:nowISO(),changedBy:Session.currentUser?(Session.currentUser.id||Session.currentUser.nama):null,stage:'finalisasi',diagnosis:visit.diagnosis});}
  if(visit.reviewPending){visit.workflow=visit.workflow||{};visit.workflow.reviewAt=nowISO();visit.reviewPending=false;}
  visit.billing.konsultasi = getPoli(visit.poliId).biaya;

  const rujukLab = document.getElementById('px-rujuk-lab').checked && !visit.labRequest;
  const rujukRad = document.getElementById('px-rujuk-rad') && document.getElementById('px-rujuk-rad').checked && !visit.radiologyRequest;
  const rujukIgd = document.getElementById('px-rujuk-igd') && document.getElementById('px-rujuk-igd').checked && !(visit.referrals||[]).some(function(r){return r.destination==='igd'&&r.status!=='ditolak'&&r.status!=='dibatalkan';});
  if(rujukLab){
    const jenis=document.getElementById('px-lab-jenis').value.trim();
    if(!jenis){showToast('Isi jenis pemeriksaan laboratorium','danger');return;}
    visit.labRequest={id:uid('LAB'),jenis:jenis,status:'menunggu',hasil:null,requestedAt:nowISO(),requestedBy:Session.currentUser?Session.currentUser.id:null,unit:'rawat-jalan'};
    visit.billing.lab=BIAYA_LAB;
    createCareRequest(visit,'lab','laboratorium',jenis);
  }
  if(rujukRad){
    const jenisRad=document.getElementById('px-rad-jenis').value.trim();
    if(!jenisRad){showToast('Isi jenis pemeriksaan radiologi','danger');return;}
    visit.radiologyRequest={id:uid('RAD'),jenis:jenisRad,status:'menunggu',hasil:null,requestedAt:nowISO(),requestedBy:Session.currentUser?Session.currentUser.id:null,unit:'rawat-jalan'};
    createCareRequest(visit,'radiologi','radiologi',jenisRad);
  }
  if(rujukIgd){
    const alasan=(document.getElementById('px-igd-alasan').value||'').trim();
    if(!alasan){showToast('Isi ringkasan klinis rujukan IGD','danger');return;}
    if(!Array.isArray(visit.referrals))visit.referrals=[];
    const ref=createCareRequest(visit,'igd','rujukan_igd',alasan); visit.referrals.push(ref);
    visit.nextStep='Menunggu konfirmasi penerimaan IGD';
  }
  if(poliState.resepItems.length>0){
    let resep=visit.resepId?getResep(visit.resepId):getResepByVisit(visit.id);
    if(resep && !['draft','menunggu'].includes(resep.status)){
      showToast('Resep kunjungan ini sudah diproses farmasi. Gunakan prosedur revisi resep, bukan membuat resep baru otomatis.','danger');return;
    }
    if(resep){
      const wasDraft=resep.status==='draft'; resep.items=[...poliState.resepItems.map(function(it){return Object.assign({},it);})]; resep.status='menunggu'; resep.updatedAt=nowISO(); if(wasDraft)notifyCareUnit(visit.patientId,'farmasi-rawat-jalan','Resep Rawat Jalan masuk antrean','Resep dari '+getPoli(visit.poliId).nama+' · antrean '+visit.noAntrian);
    }else{
      resep={id:uid('RSP'),visitId:visit.id,patientId:visit.patientId,unit:'rawat-jalan',items:[...poliState.resepItems.map(function(it){return Object.assign({},it);})],status:'menunggu',jenisLayanan:'rawat-jalan',createdAt:nowISO(),updatedAt:nowISO(),siapAt:null,diambilAt:null};
      Store.data.prescriptions.push(resep); visit.resepId=resep.id;
      notifyCareUnit(visit.patientId,'farmasi-rawat-jalan','Resep Rawat Jalan masuk antrean','Resep dari '+getPoli(visit.poliId).nama+' · antrean '+visit.noAntrian);
    }
    visit.resepId=resep.id;
    visit.billing.obat=resep.items.reduce((sum,it)=>sum+it.jumlah*it.hargaSatuan,0);
  }
  if(rujukLab){visit.status='menunggu_lab';visit.nextStep='Laboratorium Rawat Jalan — menunggu konfirmasi/pemeriksaan';visit.workflow.supportingAt=nowISO();}
  else if(rujukRad){visit.status='menunggu_penunjang';visit.nextStep='Radiologi Rawat Jalan — menunggu konfirmasi/pemeriksaan';visit.workflow.supportingAt=nowISO();}
  else if(rujukIgd){visit.status='menunggu_rujukan_igd';}
  else if(poliState.resepItems.length>0){visit.status='menunggu_farmasi';visit.nextStep='Farmasi Rawat Jalan';}
  else {visit.status='menunggu_bayar';visit.nextStep='Loket/Kasir Rawat Jalan sesuai ketentuan';}
  visit.updatedAt = nowISO();
  visit.queueReadyToAdvance = false;
  visit.workflow = visit.workflow || {}; visit.workflow.completedAt = nowISO();
  Store.save();
  logAudit('selesai_periksa',visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · Dx: '+esc(visit.diagnosis));
  showToast('Pemeriksaan dan instruksi antarunit tersimpan sesuai pilihan','success');
  visit.updatedAt = nowISO();
  visit.queueReadyToAdvance = false;
  visit.workflow = visit.workflow || {}; visit.workflow.completedAt = nowISO();
  Store.save();
  poliState.activeVisitId = null;
  poliState.resepItems = [];
  refreshPoliQueue(); refreshQueueControlPanel(); if(window.__rjRerender)window.__rjRerender();
  document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pemeriksaan '+esc(visit.noAntrian)+' selesai. Panggil pasien berikutnya jika siap.</div></div></div>';
  showToast('Pemeriksaan '+visit.noAntrian+' selesai. Antrean berikutnya siap dipanggil secara manual.','success');
}

/* =================================================================
   MODULE: LABORATORIUM
   ================================================================= */
function renderLab(){
  setPageTitle('Laboratorium');
  const visits=visitsToday().filter(v=>v.labRequest&&v.labRequest.status==='menunggu'&&['rawat-jalan','igd'].includes(v.unit||'rawat-jalan')).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  const admissions=Store.data.admissions.filter(function(a){return a.status==='dirawat'&&Array.isArray(a.orders)&&a.orders.some(function(o){return o.jenis==='lab'&&o.status==='menunggu';});});
  document.getElementById('main-content').innerHTML=pageIntro('Laboratorium menerima permintaan Rawat Jalan dan IGD serta order Rawat Inap. Setiap hasil dikembalikan ke episode pasien yang benar.')+
    '<div class="panel"><div class="panel-head"><h2>Rawat Jalan / IGD — Menunggu Pemeriksaan ('+visits.length+')</h2></div><div class="panel-body" id="lab-rajal-area"></div></div>'+
    '<div class="panel" style="margin-top:12px"><div class="panel-head"><h2>Rawat Inap — Menunggu Pemeriksaan ('+admissions.length+')</h2></div><div class="panel-body" id="lab-ranap-area"></div></div>';
  renderLabList(visits); renderLabRanapList(admissions);
}
function renderLabList(list){
  const area=document.getElementById('lab-rajal-area');
  if(!list.length){area.innerHTML='<div class="empty">Tidak ada permintaan Laboratorium Rawat Jalan / IGD.</div>';return;}
  area.innerHTML=list.map(function(v){const p=getPatient(v.patientId),poli=getPoli(v.poliId),asal=v.unit==='igd'?'IGD':poli.nama,req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='lab'&&r.status==='menunggu_konfirmasi';});return '<div class="panel" style="margin-bottom:10px"><div class="panel-body"><strong>'+esc(p.nama)+'</strong> <span class="mono">('+p.id+')</span><div class="hint">Asal: '+esc(asal)+' · '+esc(v.labRequest.jenis)+'</div>'+(req?'<button class="btn btn-outline btn-sm" data-lab-accept="'+req.id+'">Konfirmasi Penerimaan Laboratorium</button>':'<span class="badge badge-sage">Permintaan diterima</span>')+'<div class="field"><label>Hasil Pemeriksaan</label><textarea id="hasil-'+v.id+'"></textarea></div><div class="result-actions"><button class="btn btn-primary btn-sm" data-submit-lab="'+v.id+'">Kirim Hasil ke Dokter</button></div></div></div>';}).join('');
  area.querySelectorAll('[data-lab-accept]').forEach(function(btn){btn.addEventListener('click',function(){confirmCareRequest(this.dataset.labAccept,'terima');renderLab();});});
  area.querySelectorAll('[data-submit-lab]').forEach(function(btn){btn.addEventListener('click',function(){submitHasilLab(this.dataset.submitLab);});});
}
function submitHasilLab(visitId){
  if(!Session.currentUser||!['lab','admin'].includes(Session.currentUser.role)){showToast('Hasil Laboratorium hanya dapat disimpan petugas Laboratorium atau admin demo.','danger');return;}
  const el=document.getElementById('hasil-'+visitId),hasil=el?el.value.trim():''; if(!hasil){showToast('Isi hasil pemeriksaan terlebih dahulu','danger');return;}
  const visit=getVisit(visitId); if(!visit||!visit.labRequest)return; const reqCheck=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===visit.id&&r.destination==='lab'&&r.status!=='ditolak';});if(reqCheck&&reqCheck.status!=='diterima'){showToast('Laboratorium harus mengonfirmasi penerimaan sebelum mengirim hasil.','warning');return;}if(visit.labRequest.status==='selesai'){showToast('Hasil Laboratorium sudah disimpan.','warning');return;} visit.labRequest.hasil=hasil; visit.labRequest.status='selesai'; visit.status='menunggu_review'; visit.workflow=visit.workflow||{}; visit.workflow.resultReceivedAt=nowISO(); visit.updatedAt=nowISO(); visit.nextStep='Dokter meninjau hasil laboratorium'; const req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===visit.id&&r.destination==='lab'&&r.status!=='ditolak';});if(req){req.status='selesai';req.completedAt=nowISO();req.result=hasil;} pushNotification('info','Hasil laboratorium tersedia','Hasil pemeriksaan '+visit.labRequest.jenis+' telah dikirim kepada dokter.',visit.patientId,null); Store.save(); logAudit('hasil_lab',visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)); showToast('Hasil lab terkirim ke dokter','success'); renderLab();
}
function renderLabRanapList(list){
  const area=document.getElementById('lab-ranap-area'); if(!list.length){area.innerHTML='<div class="empty">Tidak ada order Lab Rawat Inap.</div>';return;}
  area.innerHTML=list.map(function(a){const p=getPatient(a.patientId),ward=Store.data.wards.find(function(w){return w.id===a.wardId;}),bed=Store.data.beds.find(function(b){return b.id===a.bedId;});return '<div class="panel" style="margin-bottom:10px"><div class="panel-body"><strong>'+esc(p.nama)+'</strong> <span class="mono">('+p.id+')</span><div class="hint">'+esc(ward?ward.nama:'-')+' · '+esc(bed?bed.noKamar+bed.noBed:'-')+'</div>'+a.orders.filter(function(o){return o.jenis==='lab'&&o.status==='menunggu';}).map(function(o){const req=(Store.data.careRequests||[]).find(function(r){return r.admissionId===a.id&&r.orderId===o.id&&r.destination==='lab'&&r.status==='menunggu_konfirmasi';});return '<div class="alert alert-info" style="margin-top:10px"><strong>Order:</strong> '+esc(o.detail)+(req?'<div><button class="btn btn-outline btn-sm" data-lab-accept="'+req.id+'">Konfirmasi Penerimaan</button></div>':'')+'<div class="field" style="margin-top:8px"><label>Hasil Pemeriksaan</label><textarea id="hasil-lab-ri-'+o.id+'"></textarea></div><div class="result-actions"><button class="btn btn-primary btn-sm" data-submit-lab-ri="'+o.id+'" data-adm="'+a.id+'">Kirim Hasil ke EMR</button></div></div>';}).join('')+'</div></div>';}).join('');
  area.querySelectorAll('[data-lab-accept]').forEach(function(btn){btn.addEventListener('click',function(){confirmCareRequest(this.dataset.labAccept,'terima');renderLab();});});
  area.querySelectorAll('[data-submit-lab-ri]').forEach(function(btn){btn.addEventListener('click',function(){submitHasilLabRanap(this.dataset.adm,this.dataset.submitLabRi);});});
}
function submitHasilLabRanap(admissionId,orderId){
  if(!Session.currentUser||!['lab','admin'].includes(Session.currentUser.role)){showToast('Hasil Laboratorium hanya dapat disimpan petugas Laboratorium atau admin demo.','danger');return;}
  const a=Store.data.admissions.find(function(x){return x.id===admissionId;});if(!a)return;const o=a.orders.find(function(x){return x.id===orderId;});if(!o)return;const el=document.getElementById('hasil-lab-ri-'+orderId),hasil=el?el.value.trim():'';if(!hasil){showToast('Isi hasil Lab terlebih dahulu','danger');return;}const reqCheck=(Store.data.careRequests||[]).find(function(r){return r.admissionId===a.id&&r.orderId===o.id;});if(reqCheck&&reqCheck.status!=='diterima'){showToast('Laboratorium harus mengonfirmasi penerimaan sebelum mengirim hasil.','warning');return;}if(o.status==='selesai'){showToast('Hasil Laboratorium sudah disimpan.','warning');return;}o.status='selesai';o.hasil=hasil;o.selesaiAt=nowISO();o.dilakukanOleh=Session.currentUser?Session.currentUser.nama:'';const req=(Store.data.careRequests||[]).find(function(r){return r.admissionId===a.id&&r.orderId===o.id;});if(req){req.status='selesai';req.completedAt=nowISO();req.result=hasil;}pushNotification('info','Hasil laboratorium tersedia','Hasil pemeriksaan Rawat Inap telah dikirim kepada dokter.',a.patientId,null);a.billing.biayaPenunjang=(a.billing.biayaPenunjang||0)+50000;a.updatedAt=nowISO();Store.save();logAudit('hasil_lab_ranap',esc(getPatient(a.patientId).nama)+' — '+esc(o.detail));showToast('Hasil Lab Rawat Inap tersimpan ke EMR','success');renderLab();
}

/* =================================================================
   MODULE: RADIOLOGI
   ================================================================= */
function renderRadiologi(){
  setPageTitle('Radiologi');
  const visits=Store.data.visits.filter(function(v){return ['rawat-jalan','igd'].includes(v.unit||'rawat-jalan')&&v.radiologyRequest&&v.radiologyRequest.status==='menunggu';});
  const admissions=Store.data.admissions.filter(function(a){return a.status==='dirawat'&&Array.isArray(a.orders)&&a.orders.some(function(o){return o.jenis==='radiologi'&&o.status==='menunggu';});});
  document.getElementById('main-content').innerHTML=pageIntro('Radiologi menerima permintaan Rawat Jalan dan Rawat Inap. Setiap permintaan terikat ke kunjungan/admisi sumber; hasil dikirim kembali ke rekam medis.')+
    '<div class="panel"><div class="panel-head"><h2>Rawat Jalan / IGD — Menunggu ('+visits.length+')</h2></div><div class="panel-body" id="radiologi-rajal-area"></div></div>'+ 
    '<div class="panel" style="margin-top:12px"><div class="panel-head"><h2>Rawat Inap — Menunggu ('+admissions.length+')</h2></div><div class="panel-body" id="radiologi-list-area"></div></div>';
  const rj=document.getElementById('radiologi-rajal-area');
  rj.innerHTML=visits.length?visits.map(function(v){const p=getPatient(v.patientId),req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='radiologi'&&r.kind==='radiologi'&&r.status!=='ditolak';});return '<div class="history-item"><strong>'+esc(p?p.nama:'Pasien')+'</strong> · '+esc(v.noAntrian||v.id)+'<div class="hint">'+esc(v.radiologyRequest.jenis)+' · '+esc(v.status)+'</div>'+(req&&req.status==='menunggu_konfirmasi'?'<button class="btn btn-outline btn-sm" data-rad-accept="'+req.id+'">Konfirmasi Penerimaan</button>':'')+'<div class="field"><label>Hasil Radiologi</label><textarea id="hasil-rad-rj-'+v.id+'"></textarea></div><button class="btn btn-primary btn-sm" data-rad-rj-submit="'+v.id+'">Simpan Hasil &amp; Kirim ke Dokter</button></div>';}).join(''):'<div class="empty">Tidak ada permintaan radiologi Rawat Jalan.</div>';
  rj.querySelectorAll('[data-rad-accept]').forEach(function(b){b.addEventListener('click',function(){confirmCareRequest(this.dataset.radAccept,'terima');renderRadiologi();});});
  rj.querySelectorAll('[data-rad-rj-submit]').forEach(function(b){b.addEventListener('click',function(){submitHasilRadiologiRJ(this.dataset.radRjSubmit);});});
  const area=document.getElementById('radiologi-list-area');
  if(!admissions.length){area.innerHTML='<div class="empty">Tidak ada order Radiologi Rawat Inap.</div>';return;}
  area.innerHTML=admissions.map(function(a){const p=getPatient(a.patientId),ward=Store.data.wards.find(function(w){return w.id===a.wardId;}),bed=Store.data.beds.find(function(b){return b.id===a.bedId;});return '<div class="panel" style="margin-bottom:10px"><div class="panel-body"><strong>'+esc(p?p.nama:'Pasien')+'</strong> <span class="mono">('+esc(a.patientId)+')</span><div class="hint">'+esc(ward?ward.nama:'-')+' · '+esc(bed?bed.noKamar+bed.noBed:'-')+'</div>'+a.orders.filter(function(o){return o.jenis==='radiologi'&&o.status==='menunggu';}).map(function(o){return '<div class="alert alert-info" style="margin-top:10px"><strong>Order:</strong> '+esc(o.detail)+'<div class="field" style="margin-top:8px"><label>Hasil Pemeriksaan</label><textarea id="hasil-rad-'+o.id+'"></textarea></div><button class="btn btn-primary btn-sm" data-submit-rad="'+o.id+'" data-adm="'+a.id+'">Kirim Hasil ke EMR</button></div>';}).join('')+'</div></div>';}).join('');
  area.querySelectorAll('[data-rad-accept]').forEach(function(btn){btn.addEventListener('click',function(){confirmCareRequest(this.dataset.radAccept,'terima');renderRadiologi();});});
  area.querySelectorAll('[data-submit-rad]').forEach(function(btn){btn.addEventListener('click',function(){submitHasilRadiologi(this.dataset.adm,this.dataset.submitRad);});});
}
function submitHasilRadiologiRJ(visitId){
  if(!Session.currentUser||!['radiologi','admin'].includes(Session.currentUser.role)){showToast('Hasil Radiologi hanya dapat disimpan petugas Radiologi atau admin demo.','danger');return;}
  const v=getVisit(visitId);if(!v||!v.radiologyRequest)return;
  const el=document.getElementById('hasil-rad-rj-'+visitId),hasil=el?el.value.trim():'';if(!hasil){showToast('Isi hasil radiologi terlebih dahulu','danger');return;}const reqCheck=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='radiologi'&&r.status!=='ditolak';});if(reqCheck&&reqCheck.status!=='diterima'){showToast('Radiologi harus mengonfirmasi penerimaan sebelum mengirim hasil.','warning');return;}if(v.radiologyRequest.status==='selesai'){showToast('Hasil Radiologi sudah disimpan.','warning');return;}
  v.radiologyRequest.hasil=hasil;v.radiologyRequest.status='selesai';v.radiologyRequest.selesaiAt=nowISO();v.radiologyRequest.dilakukanOleh=Session.currentUser?Session.currentUser.nama:'';v.status='menunggu_review';v.nextStep='Dokter meninjau hasil radiologi';v.workflow=v.workflow||{};v.workflow.resultReceivedAt=nowISO();v.updatedAt=nowISO();
  const req=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===v.id&&r.destination==='radiologi'&&r.kind==='radiologi'&&r.status!=='ditolak';});if(req){req.status='selesai';req.completedAt=nowISO();req.result=hasil;}
  pushNotification('info','Hasil radiologi tersedia','Hasil pemeriksaan '+v.radiologyRequest.jenis+' telah dikirim kepada dokter.',v.patientId,null);Store.save();logAudit('hasil_radiologi_rj',esc(getPatient(v.patientId).nama)+' — '+esc(v.radiologyRequest.jenis));showToast('Hasil radiologi Rawat Jalan tersimpan dan dikirim ke dokter','success');renderRadiologi();
}

function submitHasilRadiologi(admissionId,orderId){
  if(!Session.currentUser||!['radiologi','admin'].includes(Session.currentUser.role)){showToast('Hasil Radiologi hanya dapat disimpan petugas Radiologi atau admin demo.','danger');return;}
  const a=Store.data.admissions.find(function(x){return x.id===admissionId;}); if(!a)return;
  const o=a.orders.find(function(x){return x.id===orderId;}); if(!o)return;
  const el=document.getElementById('hasil-rad-'+orderId),hasil=el?el.value.trim():''; if(!hasil){showToast('Isi hasil radiologi terlebih dahulu','danger');return;}const reqCheck=(Store.data.careRequests||[]).find(function(r){return r.admissionId===a.id&&r.orderId===o.id;});if(reqCheck&&reqCheck.status!=='diterima'){showToast('Radiologi harus mengonfirmasi penerimaan sebelum mengirim hasil.','warning');return;}if(o.status==='selesai'){showToast('Hasil Radiologi sudah disimpan.','warning');return;}
  o.status='selesai'; o.hasil=hasil; o.selesaiAt=nowISO(); o.dilakukanOleh=Session.currentUser?Session.currentUser.nama:''; const req=(Store.data.careRequests||[]).find(function(r){return r.admissionId===a.id&&r.orderId===o.id;});if(req){req.status='selesai';req.completedAt=nowISO();req.result=hasil;}pushNotification('info','Hasil radiologi tersedia','Hasil radiologi Rawat Inap telah dikirim kepada dokter.',a.patientId,null);
  a.billing.biayaPenunjang=(a.billing.biayaPenunjang||0)+75000; a.updatedAt=nowISO(); Store.save();
  logAudit('hasil_radiologi',esc(getPatient(a.patientId).nama)+' — '+esc(o.detail)); showToast('Hasil radiologi tersimpan ke EMR','success'); renderRadiologi();
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
  reconcileOutpatientPrescriptions();
  const list = Store.data.visits.filter(function(v){
    const unit=v.unit||'rawat-jalan', resep=getResepByVisit(v.id);
    const matchesUnit=ctx==='igd'?unit==='igd':ctx==='rawat-inap'?false:unit==='rawat-jalan';
    return matchesUnit && resep && resep.status==='menunggu' && !resep.admissionId && v.status!=='dibatalkan';
  }).sort((a,b)=>new Date(a.createdAt||a.tanggal)-new Date(b.createdAt||b.tanggal));
  const area = document.getElementById('farmasi-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">✓</div>Tidak ada resep yang menunggu diracik.</div></div></div>'; return; }
  area.innerHTML = list.map(v=>{
    const p = getPatient(v.patientId), poli = getPoli(v.poliId), resep = getResepByVisit(v.id), asal = v.unit==='igd'?'IGD':poli.nama;
    if(!p || !resep) return '';
    return '<div class="panel" style="margin-bottom:10px"><div class="panel-body">'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px">'+
        '<div><strong>'+esc(p.nama)+'</strong> <span class="mono" style="color:var(--ink-soft)">('+p.id+')</span><br>'+
        '<span style="font-size:13px;color:var(--ink-soft)">Dari '+esc(asal)+' &middot; No. Antrian '+v.noAntrian+'</span></div>'+badgeStatus('menunggu_farmasi')+
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
  if(!Session.currentUser||!['farmasi','admin'].includes(Session.currentUser.role)){showToast('Pemrosesan resep hanya dapat dilakukan petugas Farmasi atau admin demo.','danger');return;}
  const resep = getResep(resepId), visit = getVisit(visitId);
  if(!resep || !visit || getResepByVisit(visitId)?.id!==resepId){showToast('Resep dan kunjungan pasien tidak terhubung. Muat ulang antrean farmasi.','danger');return;}
  if(resep.status!=='menunggu'){showToast('Resep ini sudah diproses; cegah stok terpotong dua kali.','warning');return;}
  let totalObat=0;const reservedByMedicine={};
  for(let idx=0;idx<resep.items.length;idx++){
    const it=resep.items[idx],input=document.getElementById('siap-'+resepId+'-'+idx),med=getMedicine(it.medicineId);
    if(!med){showToast('Master obat tidak ditemukan: '+it.nama,'danger');return;}
    const available=Math.max(0,(parseInt(med.stok,10)||0)-(reservedByMedicine[it.medicineId]||0));
    const jumlahSiap=Math.max(0,Math.min(parseInt(input&&input.value,10)||0,available,parseInt(it.jumlah,10)||0));
    if(jumlahSiap<=0){showToast('Jumlah obat yang disiapkan harus lebih dari nol dan tidak boleh melebihi stok gabungan.','danger');return;}
    it.jumlahDisiapkan=jumlahSiap;reservedByMedicine[it.medicineId]=(reservedByMedicine[it.medicineId]||0)+jumlahSiap;totalObat+=jumlahSiap*(Number(it.hargaSatuan)||0);
  }
  resep.items.forEach(function(it){getMedicine(it.medicineId).stok-=it.jumlahDisiapkan;});
  resep.status = 'disiapkan';
  resep.unit=resep.unit||'rawat-jalan'; resep.jenisLayanan=resep.jenisLayanan||'rawat-jalan';
  resep.siapAt = nowISO(); resep.updatedAt = resep.siapAt;
  visit.resepId=resep.id; resep.visitId=visit.id;
  visit.billing=visit.billing||{registrasi:BIAYA_REGISTRASI,konsultasi:0,obat:0,lab:0};
  visit.billing.obat = totalObat;
  const unit=(visit.unit||resep.unit||'rawat-jalan').replace('_','-');
  if(unit==='igd'){
    visit.status='obat_siap'; visit.nextStep='Farmasi IGD — menunggu penyerahan/pemberian sesuai instruksi';
    resep.unit='igd'; resep.jenisLayanan='igd';
    pushNotification('info','Obat IGD siap diproses','Obat untuk kunjungan IGD Anda siap diproses sesuai instruksi.',visit.patientId,null);
  }else{
    visit.status='menunggu_bayar'; visit.nextStep='Kasir Rawat Jalan — sesuai ketentuan pembayaran';
    pushNotification('info','Resep Rawat Jalan disiapkan','Silakan ikuti petunjuk pembayaran dan pengambilan obat dari petugas.',visit.patientId,null);
  }
  visit.updatedAt=nowISO(); Store.save();
  logAudit('obat_disiapkan',visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast(unit==='igd'?'Obat IGD disiapkan — ikuti alur pemberian IGD':'Obat disiapkan — pasien diarahkan sesuai alur Rawat Jalan','success');
  renderFarmasiResepTab();
}
function renderFarmasiRanapTab(){
  const list = Store.data.prescriptions.filter(r=>r.admissionId && (r.status==='menunggu' || (r.status==='disiapkan' && r.distribusiStatus==='menunggu_serah')));
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
  area.querySelectorAll('[data-siapkan-ranap]').forEach(function(btn){ btn.addEventListener('click', function(){ const id=this.dataset.siapkanRanap; const r=getResep(id); if(r && r.status==='menunggu') siapkanObatRanap(id); else serahkanObatKePerawatRanap(id); }); });
}
function siapkanObatRanap(resepId){
  if(!Session.currentUser||!['farmasi','admin'].includes(Session.currentUser.role)){showToast('Pemrosesan instruksi obat hanya dapat dilakukan petugas Farmasi atau admin demo.','danger');return;}
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
  resep.status = 'disiapkan'; resep.jenisLayanan='rawat_inap'; resep.siapAt=nowISO(); resep.updatedAt=resep.siapAt; resep.distribusiStatus='menunggu_serah';
  a.billing.biayaObat = (a.billing.biayaObat||0) + total;
  a.updatedAt = nowISO();
  Store.save();
  logAudit('obat_ranap_disiapkan', esc(getPatient(a.patientId).nama)+' — '+formatRupiah(total));
  showToast('Obat rawat inap disiapkan, biaya masuk tagihan', 'success');
  renderFarmasiRanapTab();
}
function serahkanObatKePerawatRanap(resepId){
  if(!Session.currentUser||!['farmasi','admin'].includes(Session.currentUser.role)){showToast('Distribusi obat hanya dapat dicatat petugas Farmasi atau admin demo.','danger');return;}
  const resep=getResep(resepId); if(!resep)return;
  const a=Store.data.admissions.find(function(x){return x.id===resep.admissionId;}); if(!a)return;
  resep.distribusiStatus='diserahkan'; resep.diserahkanAt=nowISO(); resep.diserahkanOleh=Session.currentUser?Session.currentUser.nama:''; resep.updatedAt=nowISO();
  a.updatedAt=nowISO(); Store.save(); logAudit('serah_obat_ranap',esc(getPatient(a.patientId).nama)+' — obat diserahkan ke unit/perawat'); showToast('Obat diserahkan ke perawat ruang','success'); renderFarmasiRanapTab();
}
function administrasikanObatRanap(resepId){
  if(!Session.currentUser||!['perawat_ranap','admin'].includes(Session.currentUser.role)){showToast('Pencatatan pemberian obat Rawat Inap hanya dapat dilakukan perawat berwenang atau admin demo.','danger');return;}
  const resep=getResep(resepId); if(!resep)return;
  const a=Store.data.admissions.find(function(x){return x.id===resep.admissionId;}); if(!a||a.status!=='dirawat')return;
  resep.status='diambil'; resep.distribusiStatus='diberikan'; resep.diambilAt=nowISO(); resep.diberikanAt=nowISO(); resep.diberikanOleh=Session.currentUser?Session.currentUser.nama:''; resep.updatedAt=nowISO();
  const order=a.orders.find(function(o){return o.resepId===resep.id;}); if(order){order.status='selesai'; order.selesaiAt=nowISO();}
  a.updatedAt=nowISO(); Store.save(); logAudit('pemberian_obat_ranap',esc(getPatient(a.patientId).nama)+' — obat diberikan oleh '+esc(Session.currentUser?Session.currentUser.nama:'')); showToast('Pemberian obat tercatat di eMAR simulasi','success'); renderRanapDetailBody(a);
}

function renderFarmasiSiapTab(){
  const ctx = routeContext(currentRoute()) || 'rawat-jalan';
  const list = Store.data.visits.filter(v=>v.status==='obat_siap' && (ctx==='igd' ? v.unit==='igd' : (v.unit||'rawat-jalan')===ctx) && !!getResepByVisit(v.id)).sort((a,b)=>new Date(a.createdAt||a.tanggal)-new Date(b.createdAt||b.tanggal));
  const area = document.getElementById('farmasi-tab-area');
  if(list.length===0){ area.innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">—</div>Belum ada obat yang menunggu diambil.</div></div></div>'; return; }
  area.innerHTML = '<div class="panel"><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>No. Antrian</th><th>Pasien</th><th>Poli</th><th></th></tr></thead><tbody>'+
    list.map(v=>{ const p = getPatient(v.patientId), poli = getPoli(v.poliId);
      return '<tr><td class="mono" style="font-weight:700">'+v.noAntrian+'</td><td>'+esc(p.nama)+'</td><td>'+esc(poli.nama)+'</td>'+
        '<td><button class="btn btn-success btn-sm" data-serahkan="'+v.id+'">'+(ctx==='igd'?'Catat Pemberian / Penyerahan':'Serahkan Obat')+'</button></td></tr>'; }).join('')+
    '</tbody></table></div></div></div>';
  area.querySelectorAll('[data-serahkan]').forEach(btn=> btn.addEventListener('click', ()=> serahkanObat(btn.dataset.serahkan)));
}
function serahkanObat(visitId){
  if(!Session.currentUser||!['farmasi','admin'].includes(Session.currentUser.role)){showToast('Penyerahan/pemberian obat hanya dapat dicatat petugas Farmasi atau admin demo.','danger');return;}
  const visit=getVisit(visitId);if(!visit){showToast('Kunjungan pasien tidak ditemukan.','danger');return;}
  const resep=getResepByVisit(visitId);if(!resep){showToast('Resep pasien tidak ditemukan; obat tidak dapat diserahkan.','danger');return;}
  if(resep.status!=='disiapkan'){showToast('Resep bukan dalam status siap diserahkan.','warning');return;}
  visit.updatedAt=nowISO();resep.diambilAt=visit.updatedAt;resep.updatedAt=visit.updatedAt;
  const unit=(visit.unit||resep.unit||'rawat-jalan').replace('_','-');
  if(unit==='igd'){
    resep.status='diberikan';resep.diberikanAt=visit.updatedAt;resep.diberikanOleh=Session.currentUser?Session.currentUser.nama:'';
    visit.status='diperiksa';visit.nextStep='Lanjutkan observasi dan keputusan klinis IGD';
    pushNotification('info','Pemberian obat IGD tercatat','Petugas telah mencatat pemenuhan obat pada episode IGD.',visit.patientId,null);
  }else{
    resep.status='diambil';visit.status='selesai';visit.nextStep='Pelayanan Rawat Jalan selesai';
    pushNotification('info','Obat diserahkan','Obat Rawat Jalan telah diserahkan oleh petugas farmasi.',visit.patientId,null);
  }
  Store.save();logAudit('obat_diserahkan',visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  showToast(unit==='igd'?'Pemberian obat IGD tercatat; episode IGD tetap aktif':'Obat Rawat Jalan diserahkan; kunjungan selesai','success');renderFarmasiSiapTab();
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
  const rxForVisit=getResepByVisit(visit.id);
  visit.status = (rxForVisit && Array.isArray(rxForVisit.items) && rxForVisit.items.length>0 && ['menunggu','disiapkan'].includes(rxForVisit.status)) ? 'obat_siap' : 'selesai';
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
  const bodyHtml = '<div id="invoice-content"><h3 style="text-align:center">SIMRS PROTOTYPE</h3><p style="text-align:center;color:var(--ink-soft);font-size:13px">Kwitansi Pembayaran'+(trx.admissionId?' — Rawat Inap':'')+'</p><hr>'+
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
    '<button class="tab" data-rtab="bangsal">Bangsal &amp; Tempat Tidur</button>'+
    '<button class="tab" data-rtab="handover">Handover Shift</button></div>'+
    '<div id="ranap-tab-area"></div>';
  document.querySelectorAll('[data-rtab]').forEach(t=> t.addEventListener('click', ()=> switchRanapTab(t.dataset.rtab)));
  renderRanapPasienTab();
}
function switchRanapTab(tab){
  ranapTab = tab; ranapActiveAdmission = null;
  document.querySelectorAll('[data-rtab]').forEach(t=> t.classList.toggle('active', t.dataset.rtab===tab));
  if(tab==='pasien') renderRanapPasienTab(); else if(tab==='bangsal') renderRanapBangsalTab(); else renderRanapHandoverTab();
}
function renderRanapPasienTab(){
  const area = document.getElementById('ranap-tab-area');
  const actor=Session.currentUser||{};
  const scopeIds=actor.role==='admin'||actor.role==='admisi_ranap'?null:(Array.isArray(actor.wardIds)&&actor.wardIds.length?actor.wardIds:(actor.wardId?[actor.wardId]:[]));
  const aktif = Store.data.admissions.filter(a=>a.status==='dirawat'&&(!scopeIds||scopeIds.includes(a.wardId))).sort((a,b)=> new Date(a.tanggalMasuk)-new Date(b.tanggalMasuk));
  const pendingRef=(Store.data.careRequests||[]).filter(function(r){return r.destination==='rawat-inap'&&['menunggu_konfirmasi','sedang_diproses'].includes(r.status);});
  area.innerHTML =
    (Session.currentUser && ['admisi_ranap','admin'].includes(Session.currentUser.role) ? '<div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" id="btn-admisi-baru">+ Admisi Baru</button></div>' : '')+
    (pendingRef.length?'<div class="panel" style="margin-bottom:12px"><div class="panel-head"><h2>Permintaan Admisi dari Unit Lain ('+pendingRef.length+')</h2></div><div class="panel-body">'+pendingRef.map(function(r){const p=getPatient(r.patientId);return '<div class="history-item"><strong>'+esc(p?p.nama:'Pasien')+'</strong><div class="hint">'+esc(r.sourceUnit)+' · '+esc(r.detail)+'</div><button class="btn btn-primary btn-sm" data-accept-ri="'+r.id+'">Terima &amp; Proses Admisi</button></div>';}).join('')+'</div></div>':'')+
    (aktif.length===0 ? '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🏨</div>Tidak ada pasien dirawat saat ini.</div></div></div>' : aktif.map(a=>ranapCardHtml(a)).join(''));
  const btnAdm=document.getElementById('btn-admisi-baru'); if(btnAdm) btnAdm.addEventListener('click', function(){ admisiBaruState={patientId:null,visitId:null}; openAdmisiBaruSheet(); });
  area.querySelectorAll('[data-accept-ri]').forEach(function(b){b.addEventListener('click',function(){acceptInpatientReferral(this.dataset.acceptRi);});});
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
    '<span style="font-size:13px;color:var(--ink-soft)">'+esc(ward.nama)+' · Kamar '+bed.noKamar+bed.noBed+' · Kelas '+esc(a.kelasPerawatan||ward.kelas)+' · Hari ke-'+hari+' · DPJP: '+esc((getUserById(a.dpjpUserId)||{}).nama||'-')+'</span><br><span class="hint">Sumber: '+esc(a.sumberAdmisi||'Admisi')+' · '+esc(a.jenisBayar)+'</span></div>'+
    news2Badge+'</div>'+
    '<div style="margin-top:6px;font-size:13.5px">'+esc(a.diagnosisMasuk)+'</div></div></div>';
}
function renderRanapHandoverTab(){
  const area=document.getElementById('ranap-tab-area');
  const actor=Session.currentUser||{};
  const duty=getCurrentInpatientDuty(actor.wardId);
  const activeIds=actor.role==='admin'||actor.role==='admisi_ranap'?null:(Array.isArray(actor.wardIds)&&actor.wardIds.length?actor.wardIds:(actor.wardId?[actor.wardId]:[]));
  const aktif=Store.data.admissions.filter(function(a){return a.status==='dirawat'&&(!activeIds||activeIds.includes(a.wardId));});
  area.innerHTML=pageIntro('Handover membantu pergantian tanggung jawab antar shift. Catatan ini adalah simulasi portfolio; keputusan klinis tetap mengikuti tenaga kesehatan yang berwenang.')+
    '<div class="panel"><div class="panel-head"><div><h2>🔄 '+esc(duty.shift.label)+'</h2><div class="hint">'+duty.shift.jamMulai+'–'+duty.shift.jamSelesai+' · Dokter jaga: '+esc(duty.doctor?duty.doctor.nama:'-')+' · Perawat: '+esc(duty.nurse?duty.nurse.nama:'-')+'</div></div></div><div class="panel-body">'+
    (aktif.length?aktif.map(function(a){
      const p=getPatient(a.patientId), h=a.handover||{};
      return '<div class="handover-card"><div><strong>'+esc(p?p.nama:'-')+'</strong> <span class="mono">'+esc(p?p.id:'')+'</span><div class="hint">'+esc(h.terakhirDari||'Belum ada handover')+' → '+esc(h.terakhirKe||duty.shift.label)+'</div><p style="margin:7px 0">'+esc(h.catatan||'Belum ada catatan handover.')+'</p></div><button class="btn btn-primary btn-sm" data-accept-handover="'+a.id+'">✓ Terima Handover</button></div>';
    }).join(''):'<div class="empty">Tidak ada pasien aktif untuk handover.</div>')+
    '</div></div>';
  area.querySelectorAll('[data-accept-handover]').forEach(function(btn){btn.addEventListener('click',function(){acceptHandoverRanap(this.dataset.acceptHandover);});});
}
function acceptHandoverRanap(admissionId){
  if(!Session.currentUser || !['perawat_ranap','admin'].includes(Session.currentUser.role)){showToast('Handover harus dikonfirmasi oleh perawat shift.','danger');return;}
  const a=Store.data.admissions.find(function(x){return x.id===admissionId;}); if(!a)return;
  const duty=getCurrentInpatientDuty(a.wardId);
  a.handover={status:'diterima',diterimaAt:nowISO(),diterimaOleh:duty.nurse?duty.nurse.id:(Session.currentUser||{}).id,terakhirDari:a.handover&&a.handover.terakhirKe||'Shift sebelumnya',terakhirKe:duty.shift.label,catatan:(a.handover&&a.handover.catatan)||'Handover diterima dan menjadi konteks shift aktif.'};
  a.perawatJagaUserId=duty.nurse?duty.nurse.id:null; a.dokterJagaUserId=duty.doctor?duty.doctor.id:null; a.updatedAt=nowISO();
  Store.save(); logAudit('handover_diterima',getPatient(a.patientId).nama+' — '+duty.shift.label); showToast('Handover pasien diterima untuk '+duty.shift.label,'success'); renderRanapHandoverTab();
}

function renderRanapBangsalTab(){
  const area = document.getElementById('ranap-tab-area');
  const actor=Session.currentUser||{};
  const assignedIds=Array.isArray(actor.wardIds)&&actor.wardIds.length?actor.wardIds:(actor.wardId?[actor.wardId]:[]);
  const visibleWards=actor.role==='admin'||actor.role==='admisi_ranap'?Store.data.wards:Store.data.wards.filter(function(w){return assignedIds.includes(w.id);});
  area.innerHTML = visibleWards.map(function(w){
    const bedsInWard = Store.data.beds.filter(b=>b.wardId===w.id);
    const terisi = bedsInWard.filter(b=>b.status==='terisi').length;
    return '<div class="panel"><div class="panel-head"><h2>'+esc(w.nama)+'</h2><span class="badge badge-slate">'+terisi+'/'+bedsInWard.length+' terisi</span></div>'+
      '<div class="panel-body"><p class="hint" style="margin-bottom:10px">Tarif kamar: '+formatRupiah(w.tarifPerHari)+' / hari</p>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      bedsInWard.map(function(b){
        const adm = Store.data.admissions.find(a=>a.bedId===b.id && a.status==='dirawat');
        const meta = INPATIENT_BED_STATUS[b.status] || INPATIENT_BED_STATUS.kosong;
        const title = adm ? esc(getPatient(adm.patientId).nama) : meta.label;
        return '<span class="badge '+meta.cls+'" title="'+title+'">Kamar '+esc(b.noKamar)+' · '+esc(b.bedLabel||('Bed '+b.noBed))+(adm?' · '+esc(getPatient(adm.patientId).nama.split(' ')[0]):' · '+meta.label)+'</span>';
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
    '<div>'+badgeStatus(a.status)+(a.status==='dirawat'?' <button class="btn btn-outline btn-sm" id="btn-pindah-bed">Pindah Bed</button>':'')+'</div></div>'+
    (p.alergi ? '<div class="allergy-flag" style="margin-top:10px">⚠ Alergi: '+esc(p.alergi)+'</div>' : '')+
    '<p style="margin-top:8px"><strong>Diagnosis masuk:</strong> '+esc(a.diagnosisMasuk)+' &middot; <strong>DPJP:</strong> '+esc((getUserById(a.dpjpUserId)||{}).nama||'-')+' &middot; <strong>Dokter jaga:</strong> '+esc((getCurrentInpatientDuty(a.wardId).doctor||{}).nama||'-')+' &middot; '+esc(a.jenisBayar)+'</p>'+
    '<div class="alert alert-info" style="margin-top:10px"><strong>Shift saat ini:</strong> '+esc(getCurrentInpatientDuty(a.wardId).shift.label)+' ('+getCurrentInpatientDuty(a.wardId).shift.jamMulai+'–'+getCurrentInpatientDuty(a.wardId).shift.jamSelesai+') · <strong>Perawat:</strong> '+esc((getCurrentInpatientDuty(a.wardId).nurse||{}).nama||'-')+'</div>'+
    '</div></div>'+
    '<div class="tabs"><button class="tab '+(ranapDetailTab==='ringkasan'?'active':'')+'" data-dtab="ringkasan">Ringkasan</button><button class="tab '+(ranapDetailTab==='cppt'?'active':'')+'" data-dtab="cppt">CPPT</button>'+
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
  if(ranapDetailTab==='ringkasan') el.innerHTML = ranapRingkasanTabHtml(a);
  else if(ranapDetailTab==='cppt') el.innerHTML = ranapCpptTabHtml(a);
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
  const pb = document.getElementById('btn-pindah-bed'); if(pb) pb.addEventListener('click', function(){ pindahBedRanap(a.id); });
  const ck = document.getElementById('btn-cetak-resume'); if(ck) ck.addEventListener('click', function(){ cetakResumeMedis(a.id); });
  document.querySelectorAll('[data-admin-obat]').forEach(function(btn){btn.addEventListener('click',function(){administrasikanObatRanap(this.dataset.adminObat);});});
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

function ranapRingkasanTabHtml(a){
  const ward=Store.data.wards.find(w=>w.id===a.wardId), bed=Store.data.beds.find(b=>b.id===a.bedId), p=getPatient(a.patientId);
  const b=computeBillingRanap(a), last=a.vitalLog[a.vitalLog.length-1], band=last?bandNEWS2(last.news2):null;
  const pendingOrders=a.orders.filter(o=>o.status==='aktif').length;
  const pendingRx=Store.data.prescriptions.filter(r=>r.admissionId===a.id && r.status!=='diambil').length;
  return '<div class="ops-kpi-grid">'+
    '<div class="ops-kpi"><div class="kpi-label">Status</div><div class="kpi-value" style="font-size:20px">'+esc(a.status)+'</div></div>'+
    '<div class="ops-kpi"><div class="kpi-label">Hari Rawat</div><div class="kpi-value">'+b.hari+'</div></div>'+ 
    '<div class="ops-kpi"><div class="kpi-label">Instruksi Aktif</div><div class="kpi-value">'+pendingOrders+'</div></div>'+ 
    '<div class="ops-kpi"><div class="kpi-label">Resep Belum Selesai</div><div class="kpi-value">'+pendingRx+'</div></div></div>'+ 
    '<div class="panel"><div class="panel-head"><h2>Patient Journey Rawat Inap</h2><div class="hint">'+esc((a.sumberAdmisi||'Admisi'))+' → Rawat Inap</div></div><div class="panel-body"><div class="journey-steps">'+inpatientJourneyForAdmission(a).map(function(j){
      const done = (j.key==='admission') || (j.key==='bed' && !!bed) || (j.key==='perawatan' && a.status==='dirawat') || (j.key==='lab' && a.orders.some(function(o){return o.jenis==='lab'&&o.status==='selesai';})) || (j.key==='radiologi' && a.orders.some(function(o){return o.jenis==='radiologi'&&o.status==='selesai';})) || (j.key==='farmasi' && a.orders.some(function(o){return o.jenis==='obat'&&o.resepId&&getResep(o.resepId)&&getResep(o.resepId).status==='diambil';})) || (j.key==='discharge' && a.status!=='dirawat') || (j.key==='billing' && a.billing.statusBayar==='lunas') || (j.key==='selesai' && a.status!=='dirawat' && a.billing.statusBayar==='lunas');
      return '<div class="journey-step '+(done?'done':'')+'"><span>'+j.icon+'</span><strong>'+j.label+'</strong>'+(j.sub?'<small>'+esc(j.sub)+'</small>':'')+'</div>';}).join('')+'</div></div></div>'+ 
    '<div class="panel"><div class="panel-head"><h2>Informasi Admisi</h2></div><div class="panel-body"><p><strong>Pasien:</strong> '+esc(p.nama)+' · '+p.id+'</p><p><strong>Sumber:</strong> '+esc(a.sumberAdmisi||'-')+' · <strong>Kelas:</strong> '+esc(a.kelasPerawatan||ward.kelas)+' · <strong>Perawatan:</strong> '+esc(a.tingkatPerawatan||'-')+'</p><p><strong>Ruang:</strong> '+esc(ward.nama)+' · Kamar '+bed.noKamar+bed.noBed+'</p><p><strong>Diagnosis masuk:</strong> '+esc(a.diagnosisMasuk)+'</p>'+(last?'<p><strong>NEWS2 terakhir:</strong> <span class="badge '+band.cls+'">'+last.news2+' — '+band.label+'</span></p>':'<p class="hint">Belum ada tanda vital.</p>')+'</div></div>';
}

function ranapCpptTabHtml(a){
  const canWrite = a.status==='dirawat' && Session.currentUser && ['dokter_ranap','perawat_ranap','admin'].includes(Session.currentUser.role);
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
  const canWrite = a.status==='dirawat' && Session.currentUser && ['dokter_ranap','perawat_ranap','admin'].includes(Session.currentUser.role);
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
  const canWrite = a.status==='dirawat' && Session.currentUser && Session.currentUser.role==='dokter_ranap';
  const canAdminMed = a.status==='dirawat' && Session.currentUser && Session.currentUser.role==='perawat_ranap';
  const medOrders = Store.data.prescriptions.filter(function(r){return r.admissionId===a.id;});
  return (canWrite ? '<div class="panel"><div class="panel-head"><h2>Instruksi Baru</h2></div><div class="panel-body">'+
    '<div class="field"><label>Jenis</label><select id="ord-jenis"><option value="obat">Obat</option><option value="tindakan">Tindakan</option><option value="diet">Diet</option><option value="lab">Pemeriksaan Lab</option><option value="radiologi">Pemeriksaan Radiologi</option></select></div>'+
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
      return '<tr><td class="mono">'+formatTanggalWaktu(o.waktu)+'</td><td style="text-transform:capitalize">'+esc(o.jenis)+'</td><td>'+esc(o.detail)+(o.hasil?' · <strong>Hasil:</strong> '+esc(o.hasil):'')+(o.biaya?' · '+formatRupiah(o.biaya):'')+'</td><td>'+esc(o.dokterNama)+'</td>'+
      '<td>'+statusHtml+'</td></tr>';
    }).join('')+'</tbody></table></div>')+'</div></div>'+
    (medOrders.length ? '<div class="panel" style="margin-top:10px"><div class="panel-head"><h2>💊 Status Pemberian Obat</h2></div><div class="panel-body">'+medOrders.map(function(r){var label=r.status==='menunggu'?'Menunggu Farmasi':r.status==='disiapkan'?(r.distribusiStatus==='diserahkan'?'Diserahkan ke Perawat':'Disiapkan Farmasi'):'Diberikan'; var btn=canAdminMed&&r.status==='disiapkan'&&r.distribusiStatus==='diserahkan'?'<button class="btn btn-success btn-sm" data-admin-obat="'+r.id+'">✓ Catat Diberikan</button>':''; return '<div class="history-item"><strong>'+esc((r.items&&r.items[0]&&r.items[0].nama)||'Obat')+'</strong> · '+esc(label)+'<div class="hint">'+(r.diberikanOleh?'Diberikan oleh '+esc(r.diberikanOleh):'')+'</div>'+btn+'</div>';}).join('')+'</div></div>' : '')+
    '';
}
function computeBillingRanap(a){
  const ward = Store.data.wards.find(w=>w.id===a.wardId);
  const hari = a.billing.totalHari || Math.max(1, Math.ceil((Date.now()-new Date(a.tanggalMasuk))/86400000));
  const biayaKamar = hari*ward.tarifPerHari;
  const biayaObat = a.billing.biayaObat||0;
  const biayaTindakan = a.billing.biayaTindakan||0;
  const biayaPenunjang = a.billing.biayaPenunjang||0;
  const subtotal = biayaKamar+biayaObat+biayaTindakan+biayaPenunjang;
  let tanggungan = 0;
  if(a.jenisBayar==='BPJS') tanggungan = subtotal;
  else if(a.jenisBayar==='Asuransi') tanggungan = Math.round(subtotal*0.8);
  return {hari, biayaKamar, biayaObat, biayaTindakan, biayaPenunjang, subtotal, tanggungan, totalBayar: subtotal-tanggungan};
}
function ranapPulangTabHtml(a){
  const b = computeBillingRanap(a);
  const canDischarge = Session.currentUser && ['dokter_ranap','admin'].includes(Session.currentUser.role);
  if(a.status==='dirawat'){
    if(!canDischarge) return '<div class="panel"><div class="panel-body"><div class="alert alert-info">Rencana pulang medis hanya dapat dibuat oleh DPJP/Dokter Rawat Inap. Petugas lain dapat melihat statusnya.</div></div></div>';
    return '<div class="panel"><div class="panel-head"><h2>Rencana Pulang &amp; Resume Medis</h2></div><div class="panel-body">'+
      '<div class="alert alert-info">Estimasi tagihan sejauh ini ('+b.hari+' hari):<br>'+
      'Kamar '+formatRupiah(b.biayaKamar)+' + Obat '+formatRupiah(b.biayaObat)+' + Penunjang '+formatRupiah(b.biayaPenunjang)+' + Tindakan '+formatRupiah(b.biayaTindakan)+' = <strong>'+formatRupiah(b.subtotal)+'</strong>'+
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
      '<tr><td>Biaya Penunjang</td><td class="mono" style="text-align:right">'+formatRupiah(b.biayaPenunjang)+'</td></tr>'+
      '<tr><td>Biaya Tindakan</td><td class="mono" style="text-align:right">'+formatRupiah(b.biayaTindakan)+'</td></tr>'+
      '<tr><td><strong>Total Tagihan</strong></td><td class="mono" style="text-align:right"><strong>'+formatRupiah(b.totalBayar)+'</strong></td></tr>'+
    '</table></div>'+
    '<div style="margin-top:10px">'+(a.billing.statusBayar==='lunas' ? '<span class="badge badge-sage">✓ Sudah Dibayar (Kasir)</span>' : '<span class="badge badge-amber">Menunggu Pembayaran di Kasir</span>')+'</div>'+
    '<button class="btn btn-outline btn-sm" style="margin-top:10px" id="btn-cetak-resume">🖶 Cetak Resume Medis</button></div></div>';
}

function submitCppt(admissionId){
  if(!Session.currentUser || !['dokter_ranap','perawat_ranap','admin'].includes(Session.currentUser.role)){showToast('Role ini tidak dapat menulis CPPT Rawat Inap.','danger');return;}
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
  if(!Session.currentUser || !['dokter_ranap','perawat_ranap','admin'].includes(Session.currentUser.role)){showToast('Role ini tidak dapat mencatat tanda vital.','danger');return;}
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
  if(!Session.currentUser || !['dokter_ranap','admin'].includes(Session.currentUser.role)){showToast('Hanya dokter rawat inap yang dapat membuat instruksi klinis.','danger');return;}
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const jenis = document.getElementById('ord-jenis').value;
  const dokterNama = Session.currentUser && Session.currentUser.role==='dokter_ranap' ? Session.currentUser.nama : (getUserById(a.dpjpUserId)||Session.currentUser).nama;
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
    const status = (jenis==='lab'||jenis==='radiologi') ? 'menunggu' : (jenis==='tindakan'?'selesai':'aktif');
    const order={id:uid('ORD'), waktu:nowISO(), dokterNama, jenis, detail, status, biaya, hasil:null}; a.orders.push(order);
    if(jenis==='lab'||jenis==='radiologi'){
      if(!Array.isArray(Store.data.careRequests))Store.data.careRequests=[];
      const req={id:uid('REQ'),patientId:a.patientId,admissionId:a.id,orderId:order.id,sourceUnit:'rawat-inap',destination:jenis==='lab'?'lab':'radiologi',kind:jenis,detail:detail,status:'menunggu_konfirmasi',createdAt:nowISO(),createdBy:Session.currentUser?Session.currentUser.id:null,acceptedAt:null,acceptedBy:null,completedAt:null,result:null};
      Store.data.careRequests.unshift(req); pushNotification('info','Order penunjang Rawat Inap',detail+' · menunggu konfirmasi '+(jenis==='lab'?'Laboratorium':'Radiologi'),jenis==='lab'?'lab':'radiologi',null); pushNotification('info','Permintaan pemeriksaan tercatat',detail+' · mengikuti alur Rawat Inap',a.patientId,null);
    }
    logAudit('instruksi_ranap', patNama+' — '+jenis+': '+detail+(biaya?' ('+formatRupiah(biaya)+')':''));
    showToast((jenis==='lab'?'Order lab terkirim ke Laboratorium':jenis==='radiologi'?'Order radiologi terkirim ke Radiologi':'Instruksi tersimpan')+(biaya?' — biaya masuk tagihan':''), 'success');
  }
  a.updatedAt = nowISO();
  Store.save();
  renderRanapDetailBody(a);
}
function selesaikanPulang(admissionId){
  if(!Session.currentUser || !['dokter_ranap','admin'].includes(Session.currentUser.role)){showToast('Hanya dokter rawat inap yang dapat menyelesaikan pulang medis.','danger');return;}
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
  a.discharge = {status:'selesai_medis',rencanaTanggal:null,kondisi:a.status};
  const bed = Store.data.beds.find(b=>b.id===a.bedId);
  if(bed){ bed.status = 'persiapan'; bed.updatedAt=nowISO(); bed.note='Persiapan setelah pasien pulang'; }
  a.updatedAt = nowISO();
  Store.save();
  logAudit('pulang_ranap', esc(getPatient(a.patientId).nama)+' — '+a.status+', '+hari+' hari rawat, tagihan '+formatRupiah(computeBillingRanap(a).totalBayar));
  showToast('Pasien telah diselesaikan perawatannya — tagihan menunggu di Kasir', 'success');
  renderAdmisiDetail();
}
function cetakResumeMedis(admissionId){
  const a = Store.data.admissions.find(x=>x.id===admissionId);
  const p = getPatient(a.patientId), ward = Store.data.wards.find(w=>w.id===a.wardId), r = a.resumeMedis||{}, b = computeBillingRanap(a);
  printArea('<div style="font-family:monospace;max-width:420px;margin:0 auto"><h2 style="text-align:center">SIMRS PROTOTYPE</h2><p style="text-align:center">Resume Medis Rawat Inap</p><hr>'+
    '<p>Nama: '+esc(p.nama)+'<br>No. RM: '+p.id+'<br>Ruang: '+esc(ward.nama)+'<br>Masuk: '+formatTanggalIndo(a.tanggalMasuk)+'<br>Keluar: '+formatTanggalIndo(a.tanggalKeluar)+' ('+b.hari+' hari)</p><hr>'+
    '<p><strong>Diagnosis Masuk:</strong> '+esc(a.diagnosisMasuk)+'<br><strong>Diagnosis Akhir:</strong> '+esc(r.diagnosisAkhir)+'</p>'+
    '<p><strong>Ringkasan:</strong> '+esc(r.ringkasan)+'</p><p><strong>Obat Pulang:</strong> '+esc(r.obatPulang)+'</p><p><strong>Kontrol:</strong> '+esc(r.instruksiKontrol)+'</p><hr>'+
    '<p>Kamar: '+formatRupiah(b.biayaKamar)+'<br>Obat: '+formatRupiah(b.biayaObat)+'<br>Penunjang: '+formatRupiah(b.biayaPenunjang)+'<br>Tindakan: '+formatRupiah(b.biayaTindakan)+'<br><strong>Total: '+formatRupiah(b.totalBayar)+'</strong></p></div>');
}

function setBedReadyRanap(bedId){
  const b=Store.data.beds.find(function(x){return x.id===bedId;}); if(!b)return;
  if(b.status!=='persiapan'){showToast('Bed ini tidak sedang dalam status persiapan','warning');return;}
  b.status='kosong'; b.updatedAt=nowISO(); b.note='Siap ditempati'; Store.save(); logAudit('bed_ready',b.id+' — bed siap ditempati'); showToast('Bed sekarang siap ditempati','success'); renderRanapBangsalTab();
}

function pindahBedRanap(admissionId){
  if(!Session.currentUser || !['admisi_ranap','perawat_ranap','admin'].includes(Session.currentUser.role)){showToast('Pemindahan bed hanya dapat dilakukan oleh Admisi/Perawat Rawat Inap.','danger');return;}
  const a=Store.data.admissions.find(x=>x.id===admissionId); if(!a||a.status!=='dirawat') return;
  const current=Store.data.beds.find(b=>b.id===a.bedId);
  const available=Store.data.beds.filter(b=>b.status==='kosong' && b.id!==a.bedId);
  if(!available.length){showToast('Tidak ada bed kosong untuk pemindahan','warning');return;}
  openModal('<div class="modal-head"><h2>Pindah Kamar / Bed</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body">'+
    '<p class="hint">Bed saat ini: '+esc(current?current.noKamar+current.noBed:'-')+'</p><div class="field"><label>Bed tujuan</label><select id="transfer-bed">'+available.map(function(b){const w=Store.data.wards.find(x=>x.id===b.wardId);return '<option value="'+b.id+'">'+esc(w.nama)+' · Kamar '+b.noKamar+b.noBed+' · Kelas '+esc(w.kelas)+'</option>';}).join('')+'</select></div><button class="btn btn-primary btn-block" id="btn-transfer-bed">Konfirmasi Pemindahan</button></div>');
  document.getElementById('btn-transfer-bed').addEventListener('click',function(){const target=Store.data.beds.find(b=>b.id===document.getElementById('transfer-bed').value);if(!target)return; if(current)current.status='kosong';target.status='terisi';a.bedId=target.id;a.wardId=target.wardId;a.updatedAt=nowISO();a.cppt.push({id:uid('CPPT'),waktu:nowISO(),profesi:roleLabel(Session.currentUser.role),penulisNama:Session.currentUser.nama,subjektif:'-',objektif:'-',asesmen:'Transfer kamar/bed',planning:'Pasien dipindahkan ke '+target.noKamar+target.noBed});Store.save();logAudit('transfer_bed',getPatient(a.patientId).nama+' → '+target.noKamar+target.noBed);closeModal();showToast('Pasien berhasil dipindahkan','success');renderAdmisiDetail();});
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
      bedKosong.map(function(b){ const w=Store.data.wards.find(x=>x.id===b.wardId); return '<option value="'+b.id+'" data-kelas="'+esc(w.kelas)+'">'+esc(w.nama)+' — Kamar '+b.noKamar+b.noBed+' ('+esc(w.kelas)+') · '+formatRupiah(w.tarifPerHari)+'/hari</option>'; }).join(''))+
    '</select><div id="ab-bed-hint" class="hint" style="margin-top:5px">Pilihan bed akan mengikuti penjamin dan tingkat perawatan.</div></div>'+
    '<div class="field-row"><div class="field"><label>Sumber Admisi</label><select id="ab-sumber"><option>IGD</option><option>Rawat Jalan</option><option>Rujukan</option><option>Transfer Internal</option></select><div id="ab-sumber-hint" class="hint" style="margin-top:5px">IGD dapat langsung menjadi sumber admisi bila dokter memutuskan rawat inap.</div></div><div class="field"><label>Tingkat Perawatan</label><select id="ab-tingkat"><option>Bangsal</option><option>Intensif</option><option>Bersalin</option></select></div></div>'+
    '<div class="field"><label>DPJP (Dokter Penanggung Jawab)</label><select id="ab-dpjp">'+dokterList.map(function(d){ return '<option value="'+d.id+'">'+esc(d.nama)+'</option>'; }).join('')+'</select></div>'+
    '<div class="field-row"><div class="field"><label>Jenis Pembayaran / Penjamin</label><select id="ab-bayar"><option value="Umum">Umum</option><option value="BPJS">BPJS</option><option value="Asuransi">Asuransi</option><option value="KSO">KSO</option></select></div>'+
    '<div class="field"><label>No. Kartu / Dokumen Penjamin</label><input type="text" id="ab-nokartu" placeholder="BPJS: nomor kartu / rujukan / SEP simulasi"></div></div>'+
    '<div class="field"><label>No. Rujukan / Surat Permintaan Rawat Inap <span class="hint">(wajib untuk BPJS dari Rawat Jalan/Rujukan pada prototype)</span></label><input type="text" id="ab-rujukan" placeholder="Contoh: RJ/2026/000123"></div>'+
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
  const srcSel=document.getElementById('ab-sumber'), paySel=document.getElementById('ab-bayar'), bedSel=document.getElementById('ab-bed');
  function refreshAdmissionRules(){
    const src=srcSel.value, pay=paySel.value;
    const isBpjs=pay==='BPJS', directIgd=src==='IGD';
    document.getElementById('ab-sumber-hint').textContent = directIgd ? 'IGD dapat langsung menjadi sumber admisi bila dokter memutuskan rawat inap; tidak memerlukan rujukan rawat jalan.' : 'Untuk BPJS dari Rawat Jalan/Rujukan, nomor rujukan atau surat permintaan rawat inap harus dicatat.';
    document.getElementById('ab-rujukan').required = isBpjs && !directIgd;
    Array.from(bedSel.options).forEach(function(opt){
      const k=opt.dataset.kelas||'';
      const allowed = !isBpjs || ['1','2','3'].includes(k);
      opt.hidden=!allowed;
    });
    const current=bedSel.options[bedSel.selectedIndex];
    if(current && current.hidden){ const next=Array.from(bedSel.options).find(function(o){return !o.hidden;}); if(next) bedSel.value=next.value; }
    document.getElementById('ab-bed-hint').textContent = isBpjs ? 'BPJS: pilihan kelas rawat inap reguler dibatasi Kelas III, II, atau I. Ketersediaan dan hak perawatan tetap mengikuti ketentuan penjamin/rumah sakit.' : 'Penjamin non-BPJS dapat memakai kelas/ruang sesuai kebijakan rumah sakit dan ketersediaan bed.';
  }
  srcSel.addEventListener('change',refreshAdmissionRules); paySel.addEventListener('change',refreshAdmissionRules); refreshAdmissionRules();
}
function submitAdmisiBaru(){
  if(!Session.currentUser||!['admin','admisi_ranap'].includes(Session.currentUser.role)){showToast('Konfirmasi admisi hanya dapat dilakukan petugas Admisi Rawat Inap atau admin demo.','danger');return;}
  if(!admisiBaruState.patientId){ showToast('Pilih pasien terlebih dahulu', 'danger'); return; }
  const bedId = document.getElementById('ab-bed').value;
  if(!bedId){ showToast('Tidak ada tempat tidur tersedia', 'danger'); return; }
  const diagnosisMasuk = document.getElementById('ab-diagnosis').value.trim();
  const sumberAdmisi = document.getElementById('ab-sumber').value;
  const jenisBayar = document.getElementById('ab-bayar').value;
  const noKartu = document.getElementById('ab-nokartu').value.trim();
  const noRujukan = document.getElementById('ab-rujukan').value.trim();
  if(!diagnosisMasuk){ showToast('Isi diagnosis masuk', 'danger'); return; }
  if(jenisBayar==='BPJS' && sumberAdmisi!=='IGD' && !noRujukan){ showToast('BPJS dari Rawat Jalan/Rujukan membutuhkan nomor rujukan atau surat permintaan rawat inap.', 'danger'); return; }
  const bed = Store.data.beds.find(b=>b.id===bedId);
  const ward = bed ? Store.data.wards.find(w=>w.id===bed.wardId) : null;
  if(!bed || !ward){ showToast('Bed atau ruangan tidak valid', 'danger'); return; }
  if(jenisBayar==='BPJS' && !['1','2','3'].includes(ward.kelas)){ showToast('Pasien BPJS reguler hanya dapat diarahkan ke Kelas I, II, atau III pada prototype.', 'danger'); return; }
  const admission = {
    id: uid('ADM'), patientId: admisiBaruState.patientId, visitId: admisiBaruState.visitId, bedId, wardId:bed.wardId,
    dpjpUserId: document.getElementById('ab-dpjp').value, diagnosisMasuk,
    sumberAdmisi, jenisBayar, noBpjs:noKartu, noRujukan,
    kelasPerawatan:ward.kelas, tingkatPerawatan:document.getElementById('ab-tingkat').value,
    status:'dirawat', tanggalMasuk: nowISO(), cppt:[], vitalLog:[], orders:[], resumeMedis:null,
    billing:{biayaObat:0, biayaTindakan:0, biayaPenunjang:0, statusBayar:'belum_bayar'}, discharge:{status:'belum_direncanakan',rencanaTanggal:null,kondisi:null}, createdAt: nowISO(), updatedAt: nowISO()
  };
  Store.data.admissions.push(admission);
  const sourceReferral=(Store.data.careRequests||[]).find(function(r){return r.destination==='rawat-inap'&&r.patientId===admission.patientId&&r.sourceVisitId===admission.visitId&&r.status==='sedang_diproses';});
  if(sourceReferral){sourceReferral.status='selesai';sourceReferral.admissionId=admission.id;sourceReferral.completedAt=nowISO();pushNotification('info','Perjalanan Rawat Inap aktif','Admisi Rawat Inap telah dikonfirmasi. Perjalanan pasien sekarang mengikuti episode Rawat Inap.',admission.patientId,null);}
  bed.status = 'terisi';
  if(admisiBaruState.visitId){
    const srcVisit=Store.data.visits.find(function(v){return v.id===admisiBaruState.visitId;});
    if(srcVisit){ srcVisit.admissionId=admission.id; srcVisit.status='dirawat'; srcVisit.nextStep='Rawat Inap'; srcVisit.updatedAt=nowISO(); }
  }
  Store.save();
  logAudit('admisi_baru', esc(getPatient(admisiBaruState.patientId).nama)+' — '+diagnosisMasuk);
  closeModal();
  showToast('Pasien berhasil diadmisikan', 'success');
  admisiBaruState = {patientId:null, visitId:null};
  if(currentRoute()==='ranap') renderRanapPasienTab();
}
function rujukRawatInap(visitId){
  if(!Session.currentUser||!['dokter','admin'].includes(Session.currentUser.role)){showToast('Permintaan Rawat Inap hanya dapat dibuat dokter penanggung jawab.','danger');return;}
  const visit=getVisit(visitId);if(!visit)return;
  visit.diagnosis=(document.getElementById('px-diagnosis').value||'').trim()||visit.diagnosis;
  visit.catatan=(document.getElementById('px-catatan').value||'').trim()||visit.catatan;
  visit.billing.konsultasi=getPoli(visit.poliId).biaya;
  if(!Array.isArray(visit.referrals))visit.referrals=[];
  const existing=(Store.data.careRequests||[]).find(function(r){return r.sourceVisitId===visit.id&&r.destination==='rawat-inap'&&!['ditolak','dibatalkan'].includes(r.status);});
  if(!existing){const req=createCareRequest(visit,'rawat-inap','admisi_rawat_inap','Permintaan Rawat Inap dari '+getPoli(visit.poliId).nama+' · diagnosis: '+(visit.diagnosis||'belum diisi'));visit.referrals.push(req);}
  visit.status='rujuk_ranap';visit.nextStep='Menunggu konfirmasi Admisi Rawat Inap';visit.updatedAt=nowISO();Store.save();
  logAudit('rujuk_ranap',visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama));
  poliState.activeVisitId=null;refreshPoliQueue();refreshQueueControlPanel();
  document.getElementById('poli-exam-area').innerHTML='<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🏥</div>Permintaan Rawat Inap telah dikirim ke Admisi. Perjalanan Rawat Inap aktif setelah admisi dikonfirmasi.</div></div></div>';
  showToast('Permintaan dikirim ke Admisi Rawat Inap; menunggu konfirmasi unit tujuan.','success');
}
/* =================================================================
   MODULE: RIWAYAT PEMERIKSAAN DOKTER
   ================================================================= */
function renderRiwayatDokterInline(u){
  const list=Store.data.visits.filter(function(v){return v.dokterId===u.id && (v.diagnosis || v.catatan || v.vital || v.screening);})
    .sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);}).slice(0,30);
  return list.length ? '<div class="hint" style="margin-bottom:10px">Menampilkan maksimal 30 pemeriksaan terbaru. Catatan klinis lengkap tetap dibuka melalui pencarian Rekam Medis.</div>'+list.map(function(v){const p=getPatient(v.patientId);return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.updatedAt||v.createdAt)+' · '+esc(getPoli(v.poliId).nama)+' · '+esc(v.noAntrian||'-')+' · '+badgeStatus(v.status)+'</div><div><strong>'+esc(p?p.nama:'Pasien')+'</strong> <span class="hint">· RM '+esc(p?p.id:'-')+'</span></div>'+clinicalSummaryHtml(v)+'</div>';}).join('') : '<div class="empty">Belum ada pemeriksaan yang dicatat oleh akun dokter ini.</div>';
}

function renderRiwayatDokter(){
  setPageTitle('Riwayat Pemeriksaan');
  const u=Session.currentUser;
  const list=Store.data.visits.filter(function(v){
    return v.dokterId===u.id && (v.diagnosis || v.catatan || v.vital || v.screening);
  }).sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);});
  // Variabel ini wajib didefinisikan sebelum template dirender. Versi sebelumnya
  // merujuk medOrders/canAdminMed tanpa deklarasi sehingga menu Riwayat dokter
  // berhenti dengan ReferenceError dan tampak seperti tombol tidak berfungsi.
  const medOrders = [];
  const canAdminMed = false;
  document.getElementById('main-content').innerHTML=
    pageIntro('Riwayat pemeriksaan khusus dokter yang sedang login. '+(u.poliId?'Hanya pemeriksaan pada '+esc(getPoli(u.poliId).nama)+' yang ditangani akun ini. ':'')+'Data klinis tetap melekat pada nomor rekam medis pasien dan dapat dibuka melalui Rekam Medis.')+
    '<div class="panel"><div class="panel-head"><div><h2>🩺 Riwayat Pemeriksaan Saya</h2><div class="hint">'+list.length+' kunjungan memiliki data klinis yang sudah dicatat.</div></div></div><div class="panel-body">'+
    (list.length ? list.map(function(v){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.updatedAt||v.createdAt)+' · '+esc(getPoli(v.poliId).nama)+' · '+esc(v.noAntrian||'-')+' · '+badgeStatus(v.status)+'</div><div><strong>'+esc(getPatient(v.patientId).nama)+'</strong> <span class="hint">· RM '+esc(getPatient(v.patientId).id)+'</span></div>'+clinicalSummaryHtml(v)+'</div>';}).join('') : '<div class="empty"><div class="big">🩺</div>Belum ada pemeriksaan yang tercatat oleh dokter ini.</div>')+
    '</div></div>'+
    (medOrders.length ? '<div class="panel" style="margin-top:10px"><div class="panel-head"><h2>💊 Status Pemberian Obat</h2></div><div class="panel-body">'+medOrders.map(function(r){var label=r.status==='menunggu'?'Menunggu Farmasi':r.status==='disiapkan'?(r.distribusiStatus==='diserahkan'?'Diserahkan ke Perawat':'Disiapkan Farmasi'):'Diberikan'; var btn=canAdminMed&&r.status==='disiapkan'&&r.distribusiStatus==='diserahkan'?'<button class="btn btn-success btn-sm" data-admin-obat="'+r.id+'">✓ Catat Diberikan</button>':''; return '<div class="history-item"><strong>'+esc((r.items&&r.items[0]&&r.items[0].nama)||'Obat')+'</strong> · '+esc(label)+'<div class="hint">'+(r.diberikanOleh?'Diberikan oleh '+esc(r.diberikanOleh):'')+'</div>'+btn+'</div>';}).join('')+'</div></div>' : '')+
    '</div></div>';
}
function clinicalSummaryHtml(v){
  const vital=v.vital||v.screening||{};
  const parts=[];
  if(v.diagnosis) parts.push('<div><strong>Diagnosis:</strong> '+esc(v.diagnosis)+'</div>');
  if(v.catatan) parts.push('<div><strong>Catatan/Tindakan:</strong> '+esc(v.catatan)+'</div>');
  if(vital.td||vital.nadi||vital.suhu||vital.rr||vital.bb||vital.tb) parts.push('<div><strong>Tanda vital:</strong> TD '+esc(vital.td||'-')+' · Nadi '+esc(vital.nadi||'-')+' · Suhu '+esc(vital.suhu||'-')+' °C · RR '+esc(vital.rr||'-')+' · BB '+esc(vital.bb||'-')+' kg · TB '+esc(vital.tb||'-')+' cm</div>');
  const resep=v.resepId?getResep(v.resepId):null;
  if(resep) parts.push('<div><strong>Resep:</strong> '+resep.items.map(function(i){return esc(i.nama)+' ×'+i.jumlah+' ('+esc(i.aturanPakai||'-')+')';}).join(', ')+'</div>');
  return parts.join('') || '<div class="hint">Data klinis belum lengkap.</div>';
}

/* =================================================================
   MODULE: REKAM MEDIS
   ================================================================= */
function getClinicalScopeUser(){ return Session.currentUser || {}; }
function visitAccessibleToUser(v,u){
  if(!u) return false;
  if(u.role==='admin') return true;
  if(['dokter','perawat'].includes(u.role)) return v.unit==='rawat-jalan' && u.poliId && samePoli(v.poliId,u.poliId);
  if(['dokter_igd','perawat_igd'].includes(u.role)) return v.unit==='igd';
  if(['dokter_ranap','perawat_ranap'].includes(u.role)) return v.unit==='rawat-inap';
  return false;
}
function accessiblePatientVisits(patientId,u){
  return patientVisits(patientId).filter(function(v){ return visitAccessibleToUser(v,u); });
}
function accessiblePatients(u){
  if(!u || u.role==='admin') return Store.data.patients;
  const ids=new Set(Store.data.visits.filter(function(v){return visitAccessibleToUser(v,u);}).map(function(v){return v.patientId;}));
  return Store.data.patients.filter(function(p){return ids.has(p.id);});
}
function renderRekamMedis(){
  setPageTitle('Rekam Medis');
  const u=getClinicalScopeUser();
  document.getElementById('main-content').innerHTML =
    pageIntro('Pencarian rekam medis dibatasi sesuai hak akses akun. Dokter/perawat hanya dapat melihat pasien dalam unit/poli yang menjadi tanggung jawabnya.')+
    '<div class="panel"><div class="panel-body">'+
    '<form id="form-cari-rm" class="search-row"><input type="text" id="cari-rm-input" placeholder="Cari berdasarkan NIK, No. RM, atau Nama...">'+
    '<button type="submit" class="btn btn-primary">Cari</button></form><div id="hasil-cari-rm"></div></div></div>'+
    (u.role==='dokter' ? '<details class="panel" style="margin-top:12px"><summary class="panel-head" style="cursor:pointer"><strong>🕘 Riwayat Pemeriksaan Saya</strong><span class="hint">Daftar pemeriksaan yang pernah dicatat akun dokter ini</span></summary><div class="panel-body">'+renderRiwayatDokterInline(u)+'</div></details>' : '')+
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
  const results = accessiblePatients(Session.currentUser).filter(p => p.nik.includes(q) || p.id.toLowerCase().includes(qLower) || p.nama.toLowerCase().includes(qLower));
  if(results.length===0){ el.innerHTML = '<div class="empty">Pasien tidak ditemukan atau tidak termasuk kewenangan akun ini.</div>'; return; }
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>No. RM</th><th>Nama</th><th>NIK</th><th></th></tr></thead><tbody>'+
    results.map(p=>'<tr><td class="mono">'+p.id+'</td><td>'+esc(p.nama)+'</td><td class="mono">'+maskNik(p.nik)+'</td>'+
      '<td><button class="btn btn-outline btn-sm" data-lihat-rm="'+p.id+'">Lihat Rekam Medis</button></td></tr>').join('')+'</tbody></table></div>';
  el.querySelectorAll('[data-lihat-rm]').forEach(btn=> btn.addEventListener('click', ()=> tampilkanRekamMedis(btn.dataset.lihatRm)));
}
function tampilkanRekamMedis(patientId){
  const p = getPatient(patientId), u=Session.currentUser;
  if(!p || !accessiblePatients(u).some(function(x){return x.id===patientId;})){ showToast('Akses rekam medis ditolak untuk akun ini.','danger'); return; }
  const riwayat = accessiblePatientVisits(patientId,u);
  document.getElementById('detail-rm-area').innerHTML =
    '<div class="panel"><div class="panel-head"><h2>'+esc(p.nama)+'</h2></div><div class="panel-body">'+
    '<div class="grid grid-4" style="margin-bottom:16px">'+
      statCard('No. RM', p.id, '')+statCard('Usia', calcUmur(p.tglLahir)+' th', p.jenisKelamin==='L'?'Laki-laki':'Perempuan')+
      statCard('Golongan Darah', p.golDarah||'-', '')+statCard('Kunjungan Terakses', riwayat.length, '')+
    '</div>'+
    (p.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(p.alergi)+'</div>' : '')+
    '<p style="font-size:13.5px;color:var(--ink-soft)">'+esc(p.alamat)+' &middot; '+esc(p.noHp)+'</p>'+
    '<h3 style="margin:16px 0 10px">Riwayat Kunjungan dalam Kewenangan Akun</h3>'+
    (riwayat.length===0 ? '<div class="empty">Belum ada riwayat yang dapat diakses.</div>' : riwayat.map(v=>historyItemHtmlFull(v)).join(''))+
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
    '<div class="tabs"><button class="tab active" data-mtab="poli">Poli</button><button class="tab" data-mtab="doctors">Dokter & Jadwal</button><button class="tab" data-mtab="staff">Staf & Pengguna</button>'+
    '<button class="tab" data-mtab="facility">Fasilitas</button><button class="tab" data-mtab="wards">Ruangan &amp; Shift</button><button class="tab" data-mtab="rbac">Hak Akses</button><button class="tab" data-mtab="log">Audit Log</button></div>'+
    '<div id="master-tab-area"></div>';
  document.querySelectorAll('[data-mtab]').forEach(function(t){ t.addEventListener('click',function(){ switchMasterTab(t.dataset.mtab); }); });
  renderMasterPoliTab();
}
function switchMasterTab(tab){
  masterTab = tab;
  document.querySelectorAll('[data-mtab]').forEach(function(t){ t.classList.toggle('active',t.dataset.mtab===tab); });
  if(tab==='poli') renderMasterPoliTab();
  else if(tab==='doctors') renderMasterDoctorsTab();
  else if(tab==='staff') renderMasterStaffTab();
  else if(tab==='facility') renderMasterFacilityTab();
  else if(tab==='wards') renderMasterWardsTab();
  else if(tab==='rbac') renderMasterRbacTab();
  else renderMasterLogTab();
}

function renderMasterDoctorsTab(){
  const el=document.getElementById('master-tab-area');
  const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const docs=Store.data.doctors||[];
  el.innerHTML='<div class="alert alert-info"><strong>Master editable.</strong> Baseline diambil dari halaman publik “Dokter Kami” SIMRS PROTOTYPE. Karena situs resmi juga menandai sebagian entri “Data Belum Diperbarui”, setiap jadwal diberi status verifikasi. Perubahan di sini tersimpan di perangkat/browser ini; gunakan Ekspor/Impor untuk memindahkan master tanpa mengubah kode GitHub.</div>'+
  '<div class="panel"><div class="panel-head"><h2>Tambah Dokter</h2></div><div class="panel-body"><form id="form-doctor-master" class="field-row3"><div class="field"><label>Nama Dokter</label><input id="dm-nama" required></div><div class="field"><label>Spesialisasi</label><input id="dm-spesialis" required></div><div class="field"><label>Poli</label><select id="dm-poli">'+Store.data.poli.map(function(p){return '<option value="'+p.id+'">'+esc(p.nama)+' — '+esc(p.layanan||'')+'</option>';}).join('')+'</select></div><div style="grid-column:1/-1"><button class="btn btn-primary">Tambah Dokter</button></div></form></div></div>'+
  '<div class="panel"><div class="panel-head"><div><h2>Jadwal Praktik</h2><div class="hint">'+docs.length+' dokter master · '+(Store.data.doctorSchedules||[]).length+' slot jadwal</div></div><div class="chip-row"><button class="btn btn-outline btn-sm" id="btn-export-master">⬇️ Ekspor Master JSON</button><button class="btn btn-outline btn-sm" id="btn-import-master">⬆️ Impor Master JSON</button><input id="master-file" type="file" accept="application/json" class="hidden"></div></div><div class="panel-body">'+
  '<form id="form-schedule-master" class="field-row3"><div class="field"><label>Dokter</label><select id="sc-dokter">'+docs.map(function(d){return '<option value="'+d.id+'">'+esc(d.nama)+'</option>';}).join('')+'</select></div><div class="field"><label>Poli/Layanan</label><select id="sc-poli">'+Store.data.poli.map(function(p){return '<option value="'+p.id+'">'+esc(p.nama)+' — '+esc(p.layanan||'')+'</option>';}).join('')+'</select></div><div class="field"><label>Hari</label><select id="sc-hari">'+days.map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).join('')+'</select></div><div class="field"><label>Mulai</label><input id="sc-mulai" type="time" required value="08:00"></div><div class="field"><label>Selesai</label><input id="sc-selesai" type="time" required value="12:00"></div><div class="field"><label>Ruang</label><input id="sc-ruang" value="Belum dipetakan"></div><div class="field"><label>Kuota (opsional)</label><input id="sc-kuota" type="number" min="0" placeholder="Otomatis dari durasi"></div><div style="grid-column:1/-1"><button class="btn btn-primary">Tambah Jadwal</button></div></form>'+
  '<div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Dokter</th><th>Layanan</th><th>Hari</th><th>Jam</th><th>Ruang</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+ (Store.data.doctorSchedules||[]).slice().sort(function(a,b){return String(a.poliId).localeCompare(String(b.poliId))||Number(a.hari)-Number(b.hari)||String(a.jamMulai).localeCompare(String(b.jamMulai));}).map(function(sc){const d=doctorMasterById(sc.doctorId)||Store.data.users.find(function(u){return u.id===sc.doctorId;});const p=getPoli(sc.poliId);return '<tr><td><strong>'+esc(d?d.nama:sc.doctorId)+'</strong><div class="hint">'+esc(d&&d.spesialis||'')+'</div></td><td>'+esc(p?p.nama:sc.poliId)+'<div class="hint">'+esc(p&&p.layanan||'')+'</div></td><td>'+days[Number(sc.hari)||0]+'</td><td class="mono">'+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+'</td><td>'+esc(sc.ruang||'Belum dipetakan')+'</td><td><span class="badge '+(sc.needsConfirmation?'badge-amber':'badge-sage')+'">'+(sc.needsConfirmation?'Perlu verifikasi':'Terverifikasi')+'</span></td><td><button class="btn btn-outline btn-sm" data-edit-doc="'+(d?d.id:'')+'">Edit Dokter</button> <button class="btn btn-danger btn-sm" data-del-sc="'+sc.id+'">Hapus</button></td></tr>';}).join('')+'</tbody></table></div></div></div>';
  document.getElementById('form-doctor-master').addEventListener('submit',function(e){e.preventDefault();const d={id:'DOC-'+Date.now().toString(36),nama:document.getElementById('dm-nama').value.trim(),spesialis:document.getElementById('dm-spesialis').value.trim(),poliIds:[document.getElementById('dm-poli').value],status:'needs_confirmation',source:'Admin',editable:true,updatedAt:nowISO()};if(!d.nama||!d.spesialis)return;Store.data.doctors.push(d);Store.save();logAudit('dokter_master_baru',d.nama);renderMasterDoctorsTab();showToast('Dokter master ditambahkan','success');});
  document.getElementById('form-schedule-master').addEventListener('submit',function(e){e.preventDefault();const s={id:'SCH-'+Date.now().toString(36),doctorId:document.getElementById('sc-dokter').value,poliId:canonicalPoliId(document.getElementById('sc-poli').value),tanggal:null,hari:Number(document.getElementById('sc-hari').value),jamMulai:document.getElementById('sc-mulai').value,jamSelesai:document.getElementById('sc-selesai').value,ruang:document.getElementById('sc-ruang').value.trim()||'Belum dipetakan',shiftLabel:'Manual Admin',kuota:Number(document.getElementById('sc-kuota').value)||null,source:'Admin',needsConfirmation:false,createdAt:nowISO(),updatedAt:nowISO()};Store.data.doctorSchedules.push(s);Store.save();logAudit('jadwal_dokter_baru',doctorDisplayName(s.doctorId)+' — '+getPoli(s.poliId).nama);renderMasterDoctorsTab();showToast('Jadwal ditambahkan','success');});
  el.querySelectorAll('[data-edit-doc]').forEach(function(b){b.addEventListener('click',function(){const d=doctorMasterById(b.dataset.editDoc);if(!d)return;const nama=prompt('Nama dokter',d.nama);if(nama===null)return;const sp=prompt('Spesialisasi',d.spesialis||'');if(sp===null)return;d.nama=nama.trim()||d.nama;d.spesialis=sp.trim()||d.spesialis;d.updatedAt=nowISO();Store.save();logAudit('dokter_master_edit',d.nama);renderMasterDoctorsTab();showToast('Master dokter diperbarui','success');});});
  el.querySelectorAll('[data-del-sc]').forEach(function(b){b.addEventListener('click',function(){if(!confirm('Hapus jadwal ini?'))return;Store.data.doctorSchedules=Store.data.doctorSchedules.filter(function(s){return s.id!==b.dataset.delSc;});Store.save();logAudit('jadwal_dokter_hapus',b.dataset.delSc);renderMasterDoctorsTab();});});
  document.getElementById('btn-export-master').addEventListener('click',function(){const payload={version:'14.0',exportedAt:nowISO(),doctors:Store.data.doctors||[],doctorSchedules:Store.data.doctorSchedules||[],poli:Store.data.poli||[]};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='master-simrs-prototype-v14.0.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},500);});
  document.getElementById('btn-import-master').addEventListener('click',function(){document.getElementById('master-file').click();});
  document.getElementById('master-file').addEventListener('change',function(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=function(){try{const x=JSON.parse(rd.result);if(!Array.isArray(x.doctors)||!Array.isArray(x.doctorSchedules))throw new Error('Format master tidak valid');Store.data.doctors=x.doctors;Store.data.doctorSchedules=x.doctorSchedules;Store.save();logAudit('master_dokter_impor','Master dokter dan jadwal diperbarui dari JSON');renderMasterDoctorsTab();showToast('Master berhasil diimpor','success');}catch(err){showToast('Import gagal: '+err.message,'danger');}};rd.readAsText(f);});
}

function renderMasterWardsTab(){
  const el=document.getElementById('master-tab-area');
  const shiftOrder=['PAGI','SORE','MALAM'];
  const managed=Store.data.wards.filter(function(w){return w.locationManaged;}).sort(function(a,b){return String(a.buildingId).localeCompare(String(b.buildingId))||Number(a.floorNumber)-Number(b.floorNumber)||String(a.nama).localeCompare(String(b.nama));});
  el.innerHTML='<div class="alert alert-info"><strong>Master rawat inap editable.</strong> Data gedung, lantai, ruang, label kamar/bed, kepala ruang, ketua shift, anggota perawat, dan jam shift tersimpan di browser ini. Data akun perawat tetap perlu dipetakan ke penugasan yang sesuai.</div>'+managed.map(function(w){return '<div class="panel ward-master-card" data-ward-card="'+w.id+'"><div class="panel-head"><div><h2>'+esc(w.nama)+'</h2><div class="hint">'+esc(w.buildingName)+' · '+esc(w.floorName||('Lantai '+w.floorNumber))+' · '+(w.category==='vvip'?'VVIP · 20 kamar × 1 bed':'Reguler · 10 kamar × 3 bed')+'</div></div><span class="badge badge-slate">'+Store.data.beds.filter(function(b){return b.wardId===w.id;}).length+' bed</span></div><div class="panel-body"><div class="field-row3"><div class="field"><label>Nama gedung</label><input data-field="buildingName" value="'+esc(w.buildingName||'')+'"></div><div class="field"><label>Nomor lantai</label><input data-field="floorNumber" type="number" min="1" max="20" value="'+esc(w.floorNumber||1)+'"></div><div class="field"><label>Nama lantai</label><input data-field="floorName" value="'+esc(w.floorName||('Lantai '+(w.floorNumber||1)))+'"></div><div class="field"><label>Nama ruangan</label><input data-field="nama" value="'+esc(w.nama||'')+'" required></div><div class="field"><label>Kepala ruangan</label><input data-field="headNurseName" value="'+esc(w.headNurseName||'')+'"></div><div class="field"><label>Tarif per hari (simulasi)</label><input data-field="tarifPerHari" type="number" min="0" value="'+esc(w.tarifPerHari||0)+'"></div><div class="field"><label>Label kamar (pisahkan koma)</label><input data-field="kamarLabels" value="'+esc((w.kamarLabels||[]).join(', '))+'"></div><div class="field"><label>Label bed (pisahkan koma)</label><input data-field="bedLabels" value="'+esc((w.bedLabels||[]).join(', '))+'"></div><div class="field"><label>Fasilitas (pisahkan koma)</label><input data-field="facilities" value="'+esc((w.facilities||[]).join(', '))+'"></div></div><h3 style="margin:16px 0 8px">Jadwal dan tim shift</h3><div class="field-row3">'+shiftOrder.map(function(k){const sh=(w.shiftAssignments||{})[k]||{};return '<div class="panel" style="margin:0"><div class="panel-body"><strong>'+({PAGI:'Pagi',SORE:'Sore',MALAM:'Malam'})[k]+'</strong><div class="field"><label>Mulai</label><input data-shift="'+k+'" data-shift-field="jamMulai" type="time" value="'+esc(sh.jamMulai||({PAGI:'06:00',SORE:'14:00',MALAM:'22:00'})[k])+'"></div><div class="field"><label>Selesai</label><input data-shift="'+k+'" data-shift-field="jamSelesai" type="time" value="'+esc(sh.jamSelesai||({PAGI:'14:00',SORE:'22:00',MALAM:'06:00'})[k])+'"></div><div class="field"><label>Ketua shift</label><input data-shift="'+k+'" data-shift-field="ketuaShift" value="'+esc(sh.ketuaShift||'')+'"></div><div class="field"><label>Nama perawat (pisahkan titik koma)</label><input data-shift="'+k+'" data-shift-field="perawat" value="'+esc((sh.perawat||[]).join('; '))+'"></div></div></div>';}).join('')+'</div><div style="margin-top:14px"><button class="btn btn-primary" data-save-ward="'+w.id+'">Simpan perubahan ruang</button></div></div></div>';}).join('');
  el.querySelectorAll('[data-save-ward]').forEach(function(btn){btn.addEventListener('click',function(){const card=el.querySelector('[data-ward-card="'+btn.dataset.saveWard+'"]');const w=Store.data.wards.find(function(x){return x.id===btn.dataset.saveWard;});if(!card||!w)return;const val=function(k){const x=card.querySelector('[data-field="'+k+'"]');return x?x.value.trim():'';};const building=val('buildingName'),name=val('nama'),floor=Number(val('floorNumber')),floorName=val('floorName');if(!building||!name||!floorName||!Number.isInteger(floor)||floor<1){showToast('Nama gedung, ruangan, dan lantai wajib valid.','danger');return;}const previousBuildingId=w.buildingId,previousFloor=Number(w.floorNumber);Store.data.wards.filter(function(x){return x.locationManaged&&x.buildingId===previousBuildingId;}).forEach(function(x){x.buildingName=building;});if(floor===previousFloor)Store.data.wards.filter(function(x){return x.locationManaged&&x.buildingId===previousBuildingId&&Number(x.floorNumber)===previousFloor;}).forEach(function(x){x.floorName=floorName;});w.buildingName=building;w.floorNumber=floor;w.floorName=floorName;w.nama=name;w.tarifPerHari=Math.max(0,Number(val('tarifPerHari'))||0);w.headNurseName=val('headNurseName');const kamar=val('kamarLabels').split(',').map(function(x){return x.trim();}).filter(Boolean);const beds=val('bedLabels').split(',').map(function(x){return x.trim();}).filter(Boolean);const kamarCount=w.category==='vvip'?20:10,bedCount=w.category==='vvip'?1:3;if(kamar.length!==kamarCount||new Set(kamar).size!==kamarCount){showToast('Jumlah label kamar harus tepat '+kamarCount+' dan tidak boleh duplikat.','danger');return;}if(beds.length!==bedCount||new Set(beds).size!==bedCount){showToast('Jumlah label bed harus tepat '+bedCount+' dan tidak boleh duplikat.','danger');return;}w.kamarLabels=kamar;w.bedLabels=beds;w.facilities=val('facilities').split(',').map(function(x){return x.trim();}).filter(Boolean);w.shiftAssignments=w.shiftAssignments||{};for(const k of ['PAGI','SORE','MALAM']){const field=function(f){const x=card.querySelector('[data-shift="'+k+'"][data-shift-field="'+f+'"]');return x?x.value.trim():'';};if(!field('jamMulai')||!field('jamSelesai')||!field('ketuaShift')||!field('perawat')){showToast('Lengkapi jam, ketua, dan nama perawat untuk semua shift.','danger');return;}}['PAGI','SORE','MALAM'].forEach(function(k){const sh=w.shiftAssignments[k]||{};const field=function(f){const x=card.querySelector('[data-shift="'+k+'"][data-shift-field="'+f+'"]');return x?x.value.trim():'';};const staff=field('perawat').split(';').map(function(x){return x.trim();}).filter(Boolean);if(!field('jamMulai')||!field('jamSelesai')||!field('ketuaShift')||!staff.length)return;const previousShift=w.shiftAssignments[k]||{};const linkedLeader=(Store.data.users||[]).find(function(u){return u.id===previousShift.ketuaShiftUserId;});if(linkedLeader)linkedLeader.nama=field('ketuaShift');(previousShift.perawatUserIds||[]).forEach(function(id,i){const linked=(Store.data.users||[]).find(function(u){return u.id===id;});if(linked&&staff[i])linked.nama=staff[i];});w.shiftAssignments[k]={jamMulai:field('jamMulai'),jamSelesai:field('jamSelesai'),ketuaShift:field('ketuaShift'),perawat:staff,ketuaShiftUserId:previousShift.ketuaShiftUserId||null,perawatUserIds:previousShift.perawatUserIds||[]};});Store.data.beds.filter(function(b){return b.wardId===w.id;}).forEach(function(b){const idx=(w.category==='vvip'?Number(b.noKamar)-1:'ABCDEFGHIJ'.indexOf(String(b.noKamar)));const bi=(w.category==='vvip'?0:Number(String(b.noBed).replace(/\D/g,''))-1);b.noKamar=w.kamarLabels[Math.max(0,idx)]||b.noKamar;b.bedLabel=w.bedLabels[Math.max(0,bi)]||b.bedLabel;b.noBed=String(Math.max(1,bi+1));b.buildingName=w.buildingName;b.floorNumber=w.floorNumber;b.floorName=w.floorName;b.roomName=w.nama;});Store.save();logAudit('master_ruang_shift_edit',w.nama+' · '+w.buildingName+' lantai '+w.floorNumber);showToast('Master ruang dan shift berhasil disimpan.','success');renderMasterWardsTab();});});
}

function renderMasterFacilityTab(){
  const el=document.getElementById('master-tab-area');
  const typeLabel={gedung:'Gedung',lantai:'Lantai',unit:'Unit/Instalasi',ruang:'Ruang',kamar:'Kamar',bed:'Bed'};
  el.innerHTML='<div class="alert alert-info">Struktur fasilitas dibuat bertingkat agar nanti mudah dipetakan ke struktur nyata SIMRS PROTOTYPE. Data yang belum diverifikasi resmi sengaja dibuat sebagai placeholder dan tidak dianggap sebagai denah rumah sakit.</div>'+
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
        const dokter = Store.data.users.filter(u=>u.role==='dokter' && samePoli(u.poliId,p.id));
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
    '<div class="panel"><div class="panel-head"><h2>Daftar Staf &amp; Pengguna</h2></div><div class="panel-body"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Username</th><th>Peran</th><th>Unit / Poli</th><th>Ruang</th><th>Shift</th></tr></thead><tbody>'+
    Store.data.users.map(u=>{const w=(Store.data.wards||[]).find(function(x){return x.id===u.wardId;});return '<tr><td>'+esc(u.nama)+'</td><td class="mono">'+esc(u.username)+'</td><td>'+roleLabel(u.role)+(u.isShiftLeader?' · Ketua Shift':'')+'</td><td>'+(u.poliId?esc((getPoli(u.poliId)||{}).nama||u.poliId):esc(u.unit||'-'))+'</td><td>'+esc(w?w.nama:(u.wardId||'-'))+'</td><td>'+esc(u.shiftId||'-')+'</td></tr>';}).join('')+
    '</tbody></table></div><p class="hint" style="margin-top:10px">Akun demo memakai password bawaan. Pada versi produksi, autentikasi dan izin wajib ditegakkan di backend. Penugasan ruang/shift perawat dikelola melalui tab Ruangan &amp; Shift.</p></div></div>';
}

/* =================================================================
   MODULE: CEK ANTRIAN (papan tampilan publik)
   ================================================================= */
function renderCekAntrian(){
  setPageTitle('Cek Antrian');
  document.getElementById('main-content').innerHTML =
    pageIntro('Papan monitor antrean untuk petugas loket/operator dan layar ruang tunggu. Menu ini bukan menu kerja dokter atau perawat.')+
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
    const antrianPoli = visits.filter(v=>samePoli(v.poliId,poli.id));
    const sedang = antrianPoli.filter(v=>v.status==='diperiksa').sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0];
    const dipanggil = antrianPoli.filter(v=>v.status==='dipanggil').sort((a,b)=>(queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999))[0];
    const menunggu = antrianPoli.filter(v=>['menunggu_dokter','menunggu_poli'].includes(v.status)).sort((a,b)=>(queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999));
    const infoTerbaru = Store.data.poliMessages.filter(m=>samePoli(m.poliId,poli.id))[0];
    const active=sedang||dipanggil;
    const infoHtml = infoTerbaru ? '<div class="badge '+POLI_MSG_BADGE[infoTerbaru.tipe]+'" style="margin-top:9px;white-space:normal;text-align:left">'+esc(infoTerbaru.pesan)+'</div>' : '';
    return '<div class="queue-board-item'+(active?' calling':'')+'">'+
      '<div class="poli-tag" style="margin-bottom:8px"><span class="poli-dot" style="background:var(--'+poliColor(poli.id)+')"></span><strong>'+esc(poli.nama)+'</strong></div>'+
      '<div style="font-size:11.5px;color:var(--ink-soft);font-weight:700">'+(sedang?'SEDANG DILAYANI':'DIPANGGIL')+'</div>'+
      '<div class="num">'+(active?active.noAntrian:'—')+'</div>'+
      '<div style="font-size:12px;color:var(--ink-soft);margin-top:6px">Berikutnya: '+(menunggu.length?menunggu[0].noAntrian:'—')+' · Menunggu: '+menunggu.length+'</div>'+
      infoHtml+'</div>';
  }).join('');
}
function toggleKioskMode(){
  document.body.classList.toggle('kiosk-on');
  document.getElementById('btn-kiosk').textContent = document.body.classList.contains('kiosk-on') ? '⛶ Keluar Layar Penuh' : '⛶ Mode Layar Penuh';
}

function confirmCareRequest(requestId, decision){
  const actor=Session.currentUser||{},allowed=({igd:['admin','dokter_igd','perawat_igd'],lab:['admin','lab'],radiologi:['admin','radiologi'],'rawat-inap':['admin','admisi_ranap']});
  const req=(Store.data.careRequests||[]).find(function(x){return x.id===requestId;}); if(!req)return;
  if(allowed[req.destination]&&!allowed[req.destination].includes(actor.role)){showToast('Konfirmasi hanya dapat dilakukan oleh unit tujuan yang berwenang.','danger');return;}
  if(req.status!=='menunggu_konfirmasi'){showToast('Permintaan ini sudah dikonfirmasi sebelumnya.','warning');return;}
  req.status=decision==='terima'?'diterima':'ditolak'; req.acceptedAt=nowISO(); req.acceptedBy=Session.currentUser?Session.currentUser.id:null;
  const patient=getPatient(req.patientId);
  pushNotification('info',decision==='terima'?'Permintaan diterima':'Permintaan tidak diterima',req.detail+' · '+(decision==='terima'?'diterima oleh ':'ditolak oleh ')+(Session.currentUser?Session.currentUser.nama:'petugas'),req.patientId,null);
  if(decision==='terima' && req.destination==='igd'){
    if(!Array.isArray(Store.data.visits))Store.data.visits=[];
    const existing=Store.data.visits.find(function(v){return v.sourceCareRequestId===req.id;});
    if(!existing){
      const count=Store.data.visits.filter(function(v){return v.unit==='igd'&&v.tanggal===todayStr();}).length+1;
      const igdVisit={id:uid('VIS'),patientId:req.patientId,tanggal:todayStr(),poliId:'RJ-UMU',dokterId:null,jenisBayar:(getVisit(req.sourceVisitId)||{}).jenisBayar||'Umum',noBpjs:(getVisit(req.sourceVisitId)||{}).noBpjs||'',noAntrian:'IGD-'+String(count).padStart(3,'0'),keluhan:req.detail,status:'menunggu_poli',unit:'igd',sourceVisitId:req.sourceVisitId,sourceCareRequestId:req.id,vital:null,diagnosis:'',catatan:'Rujukan internal dari '+(req.sourceUnit||'unit asal'),labRequest:null,resepId:null,billing:{registrasi:0,konsultasi:0,obat:0,lab:0},prioritas:true,screening:null,workflow:{bookedAt:nowISO(),checkinAt:nowISO(),screeningAt:null,doctorStartAt:null,supportingAt:null,reviewAt:null,completedAt:null},createdAt:nowISO(),updatedAt:nowISO(),demo:false};
      Store.data.visits.push(igdVisit); req.igdVisitId=igdVisit.id;
    }
    req.status='diterima'; req.acceptedAt=nowISO();
    pushNotification('info','Rujukan IGD diterima','Silakan menuju IGD sesuai instruksi petugas.',req.patientId,null);
  }
  Store.save(); showToast('Konfirmasi unit tersimpan','success');
}
function registerDirectIgdPatient(){
  const patientId=document.getElementById('igd-reg-patient').value, complaint=document.getElementById('igd-reg-complaint').value.trim();
  if(!patientId||!complaint){showToast('Pilih pasien dan isi keluhan utama IGD.','danger');return;}
  if(Store.data.visits.some(function(v){return v.patientId===patientId&&v.unit==='igd'&&!['selesai','dibatalkan'].includes(v.status);})){showToast('Pasien ini sudah memiliki episode IGD aktif; buka episode tersebut agar tidak membuat pendaftaran ganda.','warning');return;}
  const count=Store.data.visits.filter(function(v){return v.unit==='igd'&&v.tanggal===todayStr();}).length+1;
  const v={id:uid('VIS'),patientId:patientId,tanggal:todayStr(),poliId:'RJ-UMU',dokterId:null,jenisBayar:'Umum',noBpjs:'',noAntrian:'IGD-'+String(count).padStart(3,'0'),keluhan:complaint,status:'menunggu_poli',unit:'igd',sourceVisitId:null,sourceCareRequestId:null,vital:null,diagnosis:'',catatan:'Pendaftaran langsung IGD',labRequest:null,radiologyRequest:null,resepId:null,billing:{registrasi:0,konsultasi:0,obat:0,lab:0},prioritas:true,screening:null,workflow:{bookedAt:nowISO(),checkinAt:nowISO(),screeningAt:null,doctorStartAt:null,supportingAt:null,reviewAt:null,completedAt:null},createdAt:nowISO(),updatedAt:nowISO(),demo:false};
  Store.data.visits.push(v);logAudit('pendaftaran_igd',esc(getPatient(patientId).nama)+' — '+v.noAntrian);pushNotification('info','Pendaftaran IGD tercatat','Nomor IGD '+v.noAntrian+' · silakan lanjut triase.',patientId,null);Store.save();showToast('Episode IGD berhasil dibuat; lanjutkan triase dan asesmen.','success');renderIGD();
}
function renderIgdClinicalHtml(){
  const list=visitsToday().filter(function(v){return v.unit==='igd'&&!['selesai','dibatalkan'].includes(v.status);});
  if(!list.length)return '<div class="empty">Belum ada pasien IGD aktif.</div>';
  return list.map(function(v){const p=getPatient(v.patientId),rx=getResepByVisit(v.id);return '<div class="history-item"><div><strong>'+esc(p?p.nama:'Pasien')+'</strong> · '+esc(v.noAntrian||v.id)+' <span class="badge badge-sage">'+esc(v.status)+'</span></div><div class="hint">Rujukan asal: '+esc(v.sourceVisitId||'Kedatangan langsung')+' · Keluhan: '+esc(v.keluhan||'-')+'</div>'+(rx?'<div class="alert alert-info">Resep IGD: '+esc((rx.items||[]).map(function(x){return x.nama+' ×'+x.jumlah;}).join(', '))+' · '+esc(rx.status)+'</div>':'')+(v.labRequest?'<div class="alert alert-info"><strong>Laboratorium · '+esc(v.labRequest.jenis)+'</strong><div>Status: '+esc(v.labRequest.status)+'</div>'+(v.labRequest.hasil?'<div>Hasil: '+esc(v.labRequest.hasil)+'</div>':'')+'</div>':'')+(v.radiologyRequest?'<div class="alert alert-info"><strong>Radiologi · '+esc(v.radiologyRequest.jenis)+'</strong><div>Status: '+esc(v.radiologyRequest.status)+'</div>'+(v.radiologyRequest.hasil?'<div>Hasil: '+esc(v.radiologyRequest.hasil)+'</div>':'')+'</div>':'')+'<div class="field"><label>Diagnosis / asesmen IGD</label><input id="igd-dx-'+v.id+'" value="'+esc(v.diagnosis||'')+'" placeholder="Diagnosis atau asesmen klinis"></div><div class="field"><label>Catatan klinis / rencana</label><textarea id="igd-note-'+v.id+'" placeholder="Rencana tindak lanjut, observasi, atau disposisi">'+esc(v.catatan||'')+'</textarea></div><div class="field"><label>Resep obat (opsional)</label><select id="igd-med-'+v.id+'"><option value="">Tidak menambah resep</option>'+Store.data.medicines.map(function(m){return '<option value="'+m.id+'">'+esc(m.nama)+' · stok '+m.stok+'</option>';}).join('')+'</select><div class="field-row"><input id="igd-qty-'+v.id+'" type="number" min="1" value="1" aria-label="Jumlah obat"><input id="igd-rule-'+v.id+'" placeholder="Aturan pakai / instruksi pemberian"></div></div><div class="field checkbox-row"><input type="checkbox" id="igd-lab-'+v.id+'"><label for="igd-lab-'+v.id+'">Minta Laboratorium</label></div><div class="field hidden" id="igd-lab-wrap-'+v.id+'"><input id="igd-lab-detail-'+v.id+'" placeholder="Jenis pemeriksaan laboratorium"></div><div class="field checkbox-row"><input type="checkbox" id="igd-rad-'+v.id+'"><label for="igd-rad-'+v.id+'">Minta Radiologi</label></div><div class="field hidden" id="igd-rad-wrap-'+v.id+'"><input id="igd-rad-detail-'+v.id+'" placeholder="Jenis pemeriksaan radiologi"></div><div class="field checkbox-row"><input type="checkbox" id="igd-ri-'+v.id+'"><label for="igd-ri-'+v.id+'">Ajukan admisi Rawat Inap (jika diputuskan dokter)</label></div><button class="btn btn-primary btn-sm" data-save-igd="'+v.id+'">Simpan Asesmen &amp; Instruksi</button></div>';}).join('');
}
function saveIgdClinicalOrders(visitId){
  if(!Session.currentUser||!['dokter_igd','admin'].includes(Session.currentUser.role)){showToast('Instruksi klinis dan resep IGD hanya dapat dibuat dokter IGD atau admin demo.','danger');return;}
  const v=getVisit(visitId);if(!v||v.unit!=='igd')return;
  const wasReview=v.status==='menunggu_review';
  const dx=document.getElementById('igd-dx-'+visitId).value.trim(),note=document.getElementById('igd-note-'+visitId).value.trim();
  const medId=document.getElementById('igd-med-'+visitId).value,labChk=document.getElementById('igd-lab-'+visitId).checked,radChk=document.getElementById('igd-rad-'+visitId).checked,riChk=document.getElementById('igd-ri-'+visitId).checked;
  const labDetail=labChk?document.getElementById('igd-lab-detail-'+visitId).value.trim():'',radDetail=radChk?document.getElementById('igd-rad-detail-'+visitId).value.trim():'';
  const rule=medId?document.getElementById('igd-rule-'+visitId).value.trim():'';
  if(!dx){showToast('Isi diagnosis/asesmen IGD terlebih dahulu.','danger');return;}
  if(medId && getResepByVisit(visitId)){showToast('Resep untuk episode ini sudah ada. Jangan membuat resep ganda; tinjau resep yang ada.','warning');return;}
  if(medId&&!rule){showToast('Isi instruksi/aturan pemberian obat.','danger');return;}
  if(labChk&&!labDetail){showToast('Isi jenis pemeriksaan Laboratorium.','danger');return;}
  if(radChk&&!radDetail){showToast('Isi jenis pemeriksaan Radiologi.','danger');return;}
  if(v.labRequest&&labChk){showToast('Permintaan Laboratorium sudah ada pada episode ini.','warning');return;}
  if(v.radiologyRequest&&radChk){showToast('Permintaan Radiologi sudah ada pada episode ini.','warning');return;}
  v.diagnosis=dx;v.catatan=note;v.status='diperiksa';v.updatedAt=nowISO();v.workflow=v.workflow||{};v.workflow.doctorStartAt=v.workflow.doctorStartAt||nowISO();if(wasReview)v.workflow.reviewAt=nowISO();
  if(medId){const med=getMedicine(medId),qty=Math.max(1,parseInt(document.getElementById('igd-qty-'+visitId).value,10)||1);const rx={id:uid('RSP'),visitId:v.id,patientId:v.patientId,unit:'igd',jenisLayanan:'igd',items:[{medicineId:med.id,nama:med.nama,jumlah:qty,hargaSatuan:med.harga,aturanPakai:rule}],status:'menunggu',createdAt:nowISO(),updatedAt:nowISO(),siapAt:null,diambilAt:null};Store.data.prescriptions.push(rx);v.resepId=rx.id;notifyCareUnit(v.patientId,'farmasi-igd','Instruksi obat IGD baru','Obat '+med.nama+' · '+v.noAntrian+' · menunggu penerimaan Farmasi IGD');}
  if(labChk){v.labRequest={id:uid('LAB'),jenis:labDetail,status:'menunggu',hasil:null,unit:'igd',requestedAt:nowISO()};createCareRequest(v,'lab','laboratorium',labDetail);}
  if(radChk){v.radiologyRequest={id:uid('RAD'),jenis:radDetail,status:'menunggu',hasil:null,unit:'igd',requestedAt:nowISO()};createCareRequest(v,'radiologi','radiologi',radDetail);}
  if(riChk){createCareRequest(v,'rawat-inap','admisi_rawat_inap','Permintaan evaluasi admisi Rawat Inap dari IGD: '+dx);}
  if(!labChk&&!radChk&&!medId&&!riChk)pushNotification('info','Asesmen IGD diperbarui','Asesmen IGD telah disimpan.',v.patientId,null);
  Store.save();logAudit('asesmen_igd',esc(getPatient(v.patientId).nama)+' — '+esc(dx));showToast('Asesmen IGD tersimpan; instruksi dikirim ke unit terkait.','success');renderIGD();
}
function acceptInpatientReferral(requestId){
  if(!Session.currentUser||!['admin','admisi_ranap'].includes(Session.currentUser.role)){showToast('Penerimaan rujukan Rawat Inap hanya dapat dilakukan petugas Admisi atau admin demo.','danger');return;}
  const req=(Store.data.careRequests||[]).find(function(r){return r.id===requestId&&r.destination==='rawat-inap'&&['menunggu_konfirmasi','sedang_diproses'].includes(r.status);});if(!req)return;
  req.status='sedang_diproses';req.acceptedAt=nowISO();req.acceptedBy=Session.currentUser?Session.currentUser.id:null;Store.save();
  admisiBaruState={patientId:req.patientId,visitId:req.sourceVisitId||null};openAdmisiBaruSheet();
  setTimeout(function(){const hint=document.getElementById('ab-sumber-hint'),src=document.getElementById('ab-sumber');if(src){src.value=req.sourceUnit==='igd'?'IGD':(req.sourceUnit==='rawat-jalan'?'Rawat Jalan':'Rujukan');src.dispatchEvent(new Event('change'));}if(hint)hint.textContent='Rujukan internal diterima. Admisi belum aktif sampai petugas menyelesaikan formulir dan mengonfirmasi kamar/bed.';},30);
  pushNotification('info','Rujukan Rawat Inap diterima','Petugas admisi mulai memproses penerimaan Rawat Inap.',req.patientId,null);Store.save();
}
function renderIgdReferralsHtml(){
  const refs=(Store.data.careRequests||[]).filter(function(r){return r.destination==='igd'&&r.status==='menunggu_konfirmasi';});
  if(!refs.length)return '<div class="empty">Tidak ada rujukan internal IGD yang menunggu konfirmasi.</div>';
  return refs.map(function(r){const p=getPatient(r.patientId),v=getVisit(r.sourceVisitId);return '<div class="history-item"><strong>'+(p?esc(p.nama):'Pasien tidak ditemukan')+'</strong> · '+esc(p?p.id:r.patientId)+'<div class="hint">Asal: '+esc(r.sourceUnit)+' · '+esc(r.detail)+'</div><div class="result-actions"><button class="btn btn-primary btn-sm" data-igd-accept="'+r.id+'">Terima &amp; Buat Episode IGD</button><button class="btn btn-outline btn-sm" data-igd-reject="'+r.id+'">Tolak / Minta Klarifikasi</button></div></div>';}).join('');
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
    pageIntro('Dashboard operasional IGD prototype. Rujukan internal perlu dikonfirmasi IGD; episode, instruksi, dan obat dipisahkan dari Rawat Jalan/Rawat Inap.')+
    ((Session.currentUser&&['admin','perawat_igd','dokter_igd'].includes(Session.currentUser.role))?'<div class="panel" style="margin-bottom:12px"><div class="panel-head"><h2>Pendaftaran / Penerimaan IGD</h2></div><div class="panel-body"><div class="field-row"><div class="field"><label>Pasien terdaftar</label><select id="igd-reg-patient"><option value="">Pilih pasien</option>'+Store.data.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.nama)+' · '+esc(p.id)+'</option>';}).join('')+'</select></div><div class="field"><label>Keluhan utama / alasan datang</label><input id="igd-reg-complaint" placeholder="Keluhan utama dan informasi awal"></div></div><button type="button" class="btn btn-primary btn-sm" id="btn-igd-register">Daftarkan / Buat Episode IGD</button><div class="hint">Pendaftaran hanya membuat episode dan nomor antrean; triase serta prioritas klinis tetap harus dilakukan petugas.</div></div></div>':'')+
    '<div class="ops-kpi-grid">'+
      '<div class="ops-kpi"><div class="kpi-label">Pasien IGD Hari Ini</div><div class="kpi-value">'+visits.length+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Menunggu</div><div class="kpi-value">'+waiting+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Diperiksa</div><div class="kpi-value">'+exam+'</div></div>'+
      '<div class="ops-kpi"><div class="kpi-label">Selesai</div><div class="kpi-value">'+done+'</div></div>'+
    '</div>'+ 
    '<div class="ops-grid-main"><div class="panel"><div class="panel-head"><h2>Zona IGD</h2></div><div class="panel-body"><div class="ops-queue-grid"><div class="ops-queue-card"><strong>Zona Merah</strong><div class="hint">Prioritas kegawatan tinggi</div></div><div class="ops-queue-card"><strong>Zona Kuning</strong><div class="hint">Prioritas sesuai hasil triase</div></div></div></div></div>'+ 
    '<div class="panel"><div class="panel-head"><h2>Integrasi Layanan</h2></div><div class="panel-body"><div class="hint">Farmasi IGD dan Kasir IGD dipisahkan. Pasien rujukan internal baru menjadi episode IGD setelah penerimaan dikonfirmasi.</div></div></div></div>'+
    '<div class="panel" style="margin-top:12px"><div class="panel-head"><h2>Rujukan Internal Menunggu Konfirmasi ('+((Store.data.careRequests||[]).filter(function(r){return r.destination==='igd'&&r.status==='menunggu_konfirmasi';}).length)+')</h2></div><div class="panel-body" id="igd-referral-list">'+renderIgdReferralsHtml()+'</div></div>'+
    '<div class="panel" style="margin-top:12px"><div class="panel-head"><h2>Asesmen &amp; Instruksi Klinis IGD</h2></div><div class="panel-body" id="igd-clinical-list">'+renderIgdClinicalHtml()+'</div></div>';
  const directReg=document.getElementById('btn-igd-register');if(directReg)directReg.addEventListener('click',registerDirectIgdPatient);
  const refArea=document.getElementById('igd-referral-list'); if(refArea){refArea.querySelectorAll('[data-igd-accept]').forEach(function(b){b.addEventListener('click',function(){confirmCareRequest(this.dataset.igdAccept,'terima');renderIGD();});});refArea.querySelectorAll('[data-igd-reject]').forEach(function(b){b.addEventListener('click',function(){confirmCareRequest(this.dataset.igdReject,'tolak');renderIGD();});});}
  const clinical=document.getElementById('igd-clinical-list');if(clinical){clinical.querySelectorAll('[data-save-igd]').forEach(function(b){b.addEventListener('click',function(){saveIgdClinicalOrders(this.dataset.saveIgd);});});clinical.querySelectorAll('[id^="igd-lab-"]').forEach(function(el){if(el.type==='checkbox')el.addEventListener('change',function(){const w=document.getElementById('igd-lab-wrap-'+this.id.replace('igd-lab-',''));if(w)w.classList.toggle('hidden',!this.checked);});});clinical.querySelectorAll('[id^="igd-rad-"]').forEach(function(el){if(el.type==='checkbox')el.addEventListener('change',function(){const w=document.getElementById('igd-rad-wrap-'+this.id.replace('igd-rad-',''));if(w)w.classList.toggle('hidden',!this.checked);});});}
}

function renderRiwayatAdmin(){
  setPageTitle('Riwayat');
  const logs=Array.isArray(Store.data.auditLog)?Store.data.auditLog.slice(0,100):[];
  document.getElementById('main-content').innerHTML=
    pageIntro('Riwayat aktivitas sistem untuk Admin. Riwayat ini berbeda dari Riwayat Pemeriksaan Dokter dan tidak menampilkan menu pasien.')+
    '<div class="panel"><div class="panel-head"><div><h2>🕘 Riwayat Aktivitas Sistem</h2><div class="hint">'+logs.length+' aktivitas terakhir tersimpan pada demo perangkat ini.</div></div></div><div class="panel-body">'+
    (logs.length?'<div class="table-wrap"><table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Peran</th><th>Aktivitas</th><th>Detail</th></tr></thead><tbody>'+logs.map(function(x){return '<tr><td>'+esc(formatTanggalWaktu(x.createdAt))+'</td><td>'+esc(x.userName||'-')+'</td><td>'+esc(x.role||'-')+'</td><td><strong>'+esc(x.aksi||'-')+'</strong></td><td>'+esc(x.detail||'-')+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty"><div class="big">🕘</div>Belum ada aktivitas yang tercatat.</div>')+
    '</div></div>';
}

function runSystemAudit(){
  const checks=[];
  function check(id,label,pass,detail){checks.push({id,label,pass,detail});}
  check('db','Database demo dapat dimuat',!!Store.data&&Array.isArray(Store.data.users)&&Array.isArray(Store.data.bookings), 'Store.data tersedia dan memiliki users + bookings.');
  check('v1585-active-visit-restore','Ruang pemeriksaan aktif dipulihkan ketika Rawat Jalan dibuka',/currentActive/.test(renderPoli.toString())&&/renderFormPeriksa\(currentActive\)/.test(renderPoli.toString()),'Kunjungan berstatus diperiksa dipulihkan berdasarkan ID kunjungan tanpa mengubah statusnya.');
  check('v1585-queue-simplified','Kontrol antrean menggunakan tombol sesuai status',/Panggil Berikutnya/.test(renderQueueControlPanel.toString())&&/Mulai Pemeriksaan/.test(renderQueueControlPanel.toString())&&/Selesaikan Pemeriksaan/.test(renderQueueControlPanel.toString()),'Tombol utama mengikuti status menunggu, dipanggil, atau sedang diperiksa.');
  check('v1585-final-correction','Koreksi catatan final menyimpan jejak revisi',typeof openFinalVisitCorrection==='function'&&/koreksi-final/.test(openFinalVisitCorrection.toString()),'Koreksi final menyimpan snapshot sebelumnya, nilai terbaru, waktu, dan akun pengoreksi.');
  check('v1585-no-phantom-pharmacy','Perjalanan pasien tidak membuat tahap farmasi untuk resep kosong',/rx && Array\.isArray\(rx\.items\) && rx\.items\.length>0/.test(patientJourneyDefinition.toString()),'Tahap farmasi hanya muncul bila kunjungan benar-benar memiliki resep aktif berisi item.');
  check('roles','Role utama tersedia',['admin','loket','rawat_jalan','dokter','pasien'].every(function(r){return Store.data.users.some(function(u){return u.role===r;});}), 'Admin, Loket, Rawat Jalan, Dokter, Pasien.');
  check('patient-nav','Navigasi pasien memiliki lima menu sesuai kesepakatan',['pasien-dashboard','pasien-booking','pasien-info','pasien-booking-saya','pasien-riwayat'].every(function(r){return ROLE_ROUTE_RULES.pasien.includes(r);}) && !ROLE_ROUTE_RULES.pasien.includes('pasien-rawat-inap') && !ROLE_ROUTE_RULES.pasien.includes('monitor-antrean'), 'Beranda · Rawat Jalan · Informasi · Booking Saya · Riwayat; Rawat Inap dan Monitor bukan menu navbar pasien.');
  check('catalog','Master poli memiliki Reguler dan Eksekutif',Store.data.poli.some(function(x){return x.layanan==='Poliklinik Spesialis';})&&Store.data.poli.some(function(x){return x.layanan==='Poliklinik Eksekutif';}), 'Konteks layanan tidak dicampur.');
  check('booking-window-reguler','Booking reguler mengikuti H-1/H-2/H-3 dan pembukaan 00.01 WIB',(function(){
    const d='2026-10-12';
    return !patientBookingWindowValid(d,'Poliklinik Spesialis',new Date('2026-10-09T00:00:00')) &&
      patientBookingWindowValid(d,'Poliklinik Spesialis',new Date('2026-10-09T00:01:00')) &&
      patientBookingWindowValid('2026-10-11','Poliklinik Spesialis',new Date('2026-10-09T10:00:00')) &&
      patientBookingWindowValid('2026-10-10','Poliklinik Spesialis',new Date('2026-10-09T10:00:00')) &&
      !patientBookingWindowValid('2026-10-09','Poliklinik Spesialis',new Date('2026-10-09T10:00:00')) &&
      !patientBookingWindowValid('2026-10-13','Poliklinik Spesialis',new Date('2026-10-09T10:00:00'));
  })(),'Tanggal H-3 baru aktif pukul 00.01; H-2/H-1 bisa, hari H dan lebih dari H-3 ditolak.');
  check('booking-window-eksekutif','Booking eksekutif hari H sampai pukul 12.00 WIB',(function(){
    return patientBookingWindowValid('2026-10-09','Poliklinik Eksekutif',new Date('2026-10-09T12:00:00')) &&
      !patientBookingWindowValid('2026-10-09','Poliklinik Eksekutif',new Date('2026-10-09T12:01:00')) &&
      patientBookingWindowValid('2026-10-12','Poliklinik Eksekutif',new Date('2026-10-09T10:00:00')) &&
      !patientBookingWindowValid('2026-10-13','Poliklinik Eksekutif',new Date('2026-10-09T10:00:00'));
  })(),'Eksekutif bisa booking hari H hingga 12.00, serta H-1/H-2/H-3; di luar rentang ditolak.');
  check('queue-shared-channels','Nomor antrean baru melanjutkan booking lintas kanal pada poli/tanggal sama',(function(){
    const original=Store.data;
    try{
      Store.data={meta:{queueCounters:{'SP-JAN-2026-10-12':1}},poli:[],bookings:[
        {id:'JKN-1',poliId:'SP-JAN',tanggalKontrol:'2026-10-12',noAntrian:'JAN-002',sumber:'Mobile JKN (simulasi)',status:'terjadwal'},
        {id:'APP-1',poliId:'SP-JAN',tanggalKontrol:'2026-10-12',noAntrian:'JAN-001',sumber:'Aplikasi RS',status:'terjadwal'}
      ],visits:[]};
      const next=generateNoAntrian('SP-JAN','2026-10-12');
      return /003$/.test(next)&&Store.data.meta.queueCounters['SP-JAN-2026-10-12']===3;
    }catch(e){return false;}finally{Store.data=original;}
  })(),'Generator memindai booking/visit tersimpan dan counter lokal sebelum mengeluarkan nomor berikutnya.');
  check('igd-demo-no-patient-self-registration','Akun demo IGD hanya petugas, bukan pasien self-registration',Store.data.users.some(function(u){return u.username==='triase.igd'&&u.role==='perawat_igd'&&u.unit==='igd';}) && !ROLE_ROUTE_RULES.pasien.includes('igd') && !ROLE_ROUTE_RULES.pasien.includes('pasien-igd'),'IGD dimulai oleh petugas/rujukan internal; tidak ada route pendaftaran IGD mandiri untuk pasien.');
  check('queue','Nomor antrean konsisten per poli+tanggal',(function(){const s=new Map();let ok=true;Store.data.bookings.forEach(function(x){if(!x.noAntrian)return;const k=x.poliId+'|'+(x.tanggalKontrol||'')+'|'+x.noAntrian;if(s.has(k))ok=false;s.set(k,x.id);});Store.data.visits.forEach(function(x){if(!x.noAntrian)return;const k=x.poliId+'|'+(x.tanggal||'')+'|'+x.noAntrian;const booking=x.bookingId?Store.data.bookings.find(function(b){return b.id===x.bookingId;}):null;if(s.has(k)&&!(booking&&s.get(k)===booking.id))ok=false;if(!s.has(k))s.set(k,x.id);});return ok;})(), 'Booking dan visit boleh berbagi nomor jika visit berasal dari booking yang sama.');
  check('journey','Kunjungan memiliki workflow',Store.data.visits.filter(function(v){return v.unit==='rawat-jalan';}).every(function(v){return v.workflow&&Object.prototype.hasOwnProperty.call(v.workflow,'checkinAt');}), 'Workflow check-in dan tahapan layanan tersedia.');
  check('arrival','Booking memiliki estimasi jendela kedatangan',Store.data.bookings.filter(function(b){return ['terjadwal','checked_in'].includes(b.status);}).every(function(b){return b.arrivalWindowStart&&b.arrivalWindowEnd;}), 'Jam kedatangan disimpan sebagai estimasi, bukan janji medis.');
  check('qr','Booking memiliki kode check-in unik',(function(){const s=new Set();return Store.data.bookings.every(function(b){if(!b.kodeCheckIn)return false;if(s.has(b.kodeCheckIn))return false;s.add(b.kodeCheckIn);return true;});})(), 'Kode QR/barcode tidak boleh duplikat.');
  check('ranap-bed-status','Status bed rawat inap valid',Store.data.beds.every(function(b){return !!INPATIENT_BED_STATUS[b.status];}),'Bed memakai status siap, terisi, dipesan, persiapan, atau perbaikan.');
  check('ranap-admission','Admisi memiliki sumber dan kelas perawatan',Store.data.admissions.every(function(a){return !!a.sumberAdmisi&&!!a.kelasPerawatan&&!!a.wardId&&!!a.bedId;}),'Sumber admisi, kelas, ward, dan bed wajib tersedia.');
  check('ranap-billing','Billing rawat inap memiliki komponen penunjang',Store.data.admissions.every(function(a){return a.billing&&Object.prototype.hasOwnProperty.call(a.billing,'biayaPenunjang');}),'Kamar, obat, penunjang, dan tindakan dipisahkan.');
  check('ranap-users','Role rawat inap tersedia',['dokter_ranap','perawat_ranap'].every(function(r){return Store.data.users.some(function(u){return u.role===r;});}),'Dokter dan perawat rawat inap tersedia.');
  check('demo-patients-clean-start','Sepuluh akun demo pasien baru belum memiliki riwayat',['RM-DEMO-NP001','RM-DEMO-NP002','RM-DEMO-NP003','RM-DEMO-NP004','RM-DEMO-NP005','RM-DEMO-NP006','RM-DEMO-NP007','RM-DEMO-NP008','RM-DEMO-NP009','RM-DEMO-NP010'].every(function(id){return Store.data.patients.some(function(p){return p.id===id;})&&!Store.data.bookings.some(function(b){return b.patientId===id;})&&!Store.data.visits.some(function(v){return v.patientId===id;})&&!Store.data.admissions.some(function(a){return a.patientId===id;})&&!Store.data.prescriptions.some(function(r){return r.patientId===id;});})&&Store.data.users.filter(function(u){return /^pasien\.demo(10|[1-9])$/.test(u.username);}).length===10&&new Set(Store.data.users.filter(function(u){return /^pasien\.demo(10|[1-9])$/.test(u.username);}).map(function(u){return u.patientId;})).size===10&&!Store.data.users.some(function(u){return /^pasien\.ri[1-5]$/.test(u.username)||u.username==='pasien.demo';}),'10 akun baru lintas layanan memiliki identitas unik tanpa booking, visit, admission, atau resep bawaan; akun pasien demo lama dibersihkan.');
  check('unit-demo-accounts','Akun demo staf mencakup layanan utama dan unit terpisah',(function(){
    const required={
      'triase.igd':['perawat_igd','igd'],'dokter.igd':['dokter_igd','igd'],'perawat.igd':['perawat_igd','igd'],
      'farmasi.igd':['farmasi','igd'],'kasir.igd':['kasir','igd'],'farmasi.rajal':['farmasi','rawat-jalan'],
      'kasir.rajal':['kasir','rawat-jalan'],'farmasi.ranap':['farmasi','rawat-inap'],'kasir.ranap':['kasir','rawat-inap'],
      'admisi.ranap':['admisi_ranap','rawat-inap'],'lab':['lab',null],'radiologi':['radiologi',null]
    };
    return Object.keys(required).every(function(username){const u=Store.data.users.find(function(x){return x.username===username;});return !!u&&u.role===required[username][0]&&(required[username][1]===null||u.unit===required[username][1]);});
  })(),'Akun triase, dokter/perawat IGD, farmasi/kasir per unit, admisi RI, laboratorium, dan radiologi terdaftar.');
  check('role-route-isolation','Role staf dibatasi pada menu sesuai unit kerja',(function(){
    const original=Session.currentUser;
    try{
      const igd=Store.data.users.find(function(u){return u.username==='perawat.igd';});
      const lab=Store.data.users.find(function(u){return u.username==='lab';});
      const patient=Store.data.users.find(function(u){return u.username==='pasien.demo1';});
      Session.currentUser=igd;
      const igdOk=isRouteAllowed('igd','perawat_igd')&&!isRouteAllowed('ranap','perawat_igd')&&!isRouteAllowed('pasien-booking','perawat_igd');
      Session.currentUser=lab;
      const labOk=isRouteAllowed('lab','lab')&&!isRouteAllowed('radiologi','lab')&&!isRouteAllowed('igd','lab');
      Session.currentUser=patient;
      const patientOk=isRouteAllowed('pasien-booking','pasien')&&!isRouteAllowed('igd','pasien')&&!isRouteAllowed('pasien-rawat-inap','pasien');
      return igdOk&&labOk&&patientOk;
    }catch(e){return false;}finally{Session.currentUser=original;}
  })(),'Triase IGD tidak membuka Rawat Inap/pasien; lab tidak membuka radiologi/IGD; pasien tidak membuka IGD atau route Rawat Inap tersendiri.');
  check('ranap-demo-roles','Akun demo Rawat Inap terpisah dan terkelompok',['admisi.ranap','dokter.jaga.pagi','dokter.jaga.sore','dokter.jaga.malam','perawat.ranap.pagi','perawat.ranap.sore','perawat.ranap.malam','farmasi.ranap'].every(function(u){return Store.data.users.some(function(x){return x.username===u;});}),'Admisi, dokter jaga, perawat shift, dan farmasi RI tersedia.');
  check('ranap-shift','Shift Rawat Inap 24 jam terdefinisi',INPATIENT_SHIFTS.length===3&&INPATIENT_SHIFTS.every(function(x){return x.jamMulai&&x.jamSelesai;}),'Pagi 06–14, Sore 14–22, Malam 22–06.');
  check('admin-radiology-route','Admin memiliki menu Radiologi',ROLE_ROUTE_RULES.admin.includes('*') && NAV_ITEMS.some(function(n){return n.hash==='radiologi';}),'Radiologi tetap diizinkan Admin melalui daftar modul pada tampilan desktop.')
  check('admin-mobile-nav','Navbar Admin maksimal enam menu tanpa tombol Lainnya', PRIMARY_NAV_BY_ROLE.admin.length<=6 && PRIMARY_NAV_BY_ROLE.admin.length===6 && PRIMARY_NAV_BY_ROLE.admin.includes('beranda'),'Navbar Admin dibatasi enam menu; Beranda Admin menyediakan akses cepat ke modul tambahan.');
  check('staff-chat-top','Chat tersedia sebagai akses topbar terpisah dari navbar',typeof renderStaffPatientChat==='function'&&Object.keys(ROLE_ROUTE_RULES).filter(function(r){return r!=='pasien'&&r!=='monitor_public'&&r!=='admin';}).every(function(r){return ROLE_ROUTE_RULES[r].includes('chat-pasien');})&&!NAV_ITEMS.some(function(n){return n.hash==='chat-pasien'||n.hash==='pasien-chat';}),'Chat dibuka dari sisi kiri atas dan tidak dihitung sebagai menu navbar.');
  check('patient-info-chat','Informasi satu arah dan Chat dua arah tersedia',typeof renderPatientInfo==='function'&&typeof renderPatientChat==='function'&&typeof renderStaffPatientChat==='function'&&typeof renderHospitalInformationAdmin==='function'&&!NAV_ITEMS.some(function(n){return n.hash==='chat-pasien'||n.hash==='pasien-chat';}),'Informasi RS terpisah dari percakapan dua arah.');
  check('nav-no-patient-monitor','Monitor dan Rawat Inap tidak masuk navbar pasien',PRIMARY_NAV_BY_ROLE.pasien.length===5&&!PRIMARY_NAV_BY_ROLE.pasien.includes('monitor-antrean')&&!PRIMARY_NAV_BY_ROLE.pasien.includes('pasien-rawat-inap')&&!PRIMARY_NAV_BY_ROLE.pasien.includes('pasien-chat')&&ROLE_ROUTE_RULES.pasien.includes('pasien-chat')&&!ROLE_ROUTE_RULES.pasien.includes('pasien-rawat-inap'),'Fungsi Rawat Inap tetap muncul dalam Perjalanan Saya; Monitor digantikan Informasi.');
  check('nav-no-duplicate-history','Route Riwayat tidak terduplikasi untuk dokter',NAV_ITEMS.filter(function(n){return n.hash==='riwayat-dokter';}).length===1,'Riwayat dokter hanya memiliki satu route: riwayat-dokter.');
  check('v1588-doctor-navbar','Navbar dokter rawat jalan berisi empat menu setelah Riwayat digabung ke Rekam Medis',['beranda','poli','monitor-antrean','rekam-medis'].every(function(h){return PRIMARY_NAV_BY_ROLE.dokter.includes(h);})&&PRIMARY_NAV_BY_ROLE.dokter.length===4&&!PRIMARY_NAV_BY_ROLE.dokter.includes('riwayat-dokter')&&!ROLE_ROUTE_RULES.dokter.includes('riwayat-dokter')&&ROLE_ROUTE_RULES.dokter.includes('beranda'),'Beranda, Poli, Monitor, Rekam Medis.');
  check('v1588-doctor-beranda-sections','Beranda dokter menampilkan sembilan KPI, Patient Journey, jadwal kontrol, dan info praktik',/rawatJalanKpiHtml/.test(berandaDokter.toString())&&/renderRawatJalanPatientJourney/.test(berandaDokter.toString())&&/poli-jadwal-panel/.test(berandaDokter.toString())&&/poli-info-panel/.test(berandaDokter.toString()),'KPI, Journey, jadwal kontrol, dan info praktik berada di Beranda.');
  check('v1588-doctor-history-merged','Riwayat pemeriksaan dokter tersedia di dalam Rekam Medis',/renderRiwayatDokterInline/.test(renderRekamMedis.toString())&&typeof renderRiwayatDokterInline==='function','Fungsi daftar pemeriksaan dokter dipertahankan tanpa menu navbar terpisah.');
  check('nav-primary-monitor-rj','Monitor Rawat Jalan berada di navbar utama',PRIMARY_NAV_BY_ROLE.rawat_jalan.includes('monitor-antrean') && ROLE_ROUTE_RULES.rawat_jalan.includes('monitor-antrean'),'Monitor sejajar dengan Pendaftaran, Booking, dan Poli.');
  check('nav-no-more-rj','Rawat Jalan tidak memerlukan tombol Lainnya di mobile',PRIMARY_NAV_BY_ROLE.rawat_jalan.length===4 && !PRIMARY_NAV_BY_ROLE.rawat_jalan.includes('cek-antrian'),'Navbar mobile Rawat Jalan berisi tepat empat menu utama; Cek Antrian tidak didorong ke Lainnya.');
  check('nav-primary-monitor-perawat','Monitor Perawat Rawat Jalan berada di navbar utama',PRIMARY_NAV_BY_ROLE.perawat.includes('monitor-antrean'),'Monitor sejajar dengan Beranda, Poli, dan Rekam Medis.');
  check('nav-primary-monitor-clinical','Monitor klinis tidak masuk overflow untuk dokter/perawat', ['dokter','dokter_ranap','perawat','perawat_ranap'].every(function(r){return PRIMARY_NAV_BY_ROLE[r].includes('monitor-antrean');})&&!PRIMARY_NAV_BY_ROLE.dokter_igd.includes('monitor-antrean')&&!PRIMARY_NAV_BY_ROLE.perawat_igd.includes('monitor-antrean'),'Semua role klinis yang memakai Monitor menempatkannya di navbar utama.');
  check('nav-unit-module-primary','Farmasi/Kasir menampilkan modul unit sebagai navbar utama',['farmasi','kasir'].every(function(r){return primaryNavHashesForUser({role:r,unit:'rawat-jalan'}).length===2;}),'Tidak ada tombol Lainnya hanya untuk memuat satu modul unit.');
  check('admin-folder-no-patient-menu','Menu pasien tidak bocor ke folder Admin',!['pasien-booking-saya','pasien-riwayat','pasien-dashboard','pasien-booking','pasien-rawat-inap','pasien-info','pasien-chat'].some(function(h){return ['pendaftaran','booking','igd','lab','radiologi','farmasi-rawat-jalan','farmasi-rawat-inap','farmasi-igd','kasir-rawat-jalan','kasir-rawat-inap','kasir-igd','rekam-medis','riwayat-admin','master-data','audit-sistem','cek-antrian','monitor-antrean','informasi-rs','chat-pasien'].includes(h);}), 'Daftar modul Admin tidak mencakup route pasien.');
  check('inpatient-journey','Journey Rawat Inap memiliki alur utama dan aktivitas dinamis', typeof patientInpatientJourney==='function' && typeof inpatientJourneyForAdmission==='function','Admisi · Kamar/Bed · Perawatan · Evaluasi · Pulang + aktivitas pendukung sesuai order.');
  check('care-request-schema','Skema permintaan antarunit tersedia',Array.isArray(Store.data.careRequests)&&typeof createCareRequest==='function'&&typeof confirmCareRequest==='function','Permintaan memiliki unit sumber/tujuan, status konfirmasi, dan jejak waktu.');
  check('pharmacy-unit-separation','Farmasi memiliki pemisahan konteks unit',typeof pharmacyMetrics==='function'&&typeof getResepByVisit==='function','Rawat Jalan, Rawat Inap, dan IGD menggunakan konteks resep/episode masing-masing.');
  check('igd-referral-acceptance','Penerimaan rujukan IGD tersedia',typeof renderIgdReferralsHtml==='function'&&typeof confirmCareRequest==='function','Rujukan internal baru membuat episode IGD setelah diterima.');
  check('radiology-outpatient','Radiologi menerima order Rawat Jalan dan IGD',typeof submitHasilRadiologiRJ==='function'&&typeof renderRadiologi==='function','Order memiliki status dan hasil kembali ke episode sumber.');
  check('prescription-episode-links','Resep tertaut ke kunjungan atau admisi',Store.data.prescriptions.every(function(r){return !!r.admissionId || !!r.visitId || Store.data.visits.some(function(v){return v.resepId===r.id;});}),'Resep tanpa episode sumber dianggap tidak konsisten dan perlu diperbaiki.');
  check('pharmacy-routing-isolation','Uji isolasi antrean Farmasi RJ/RI/IGD',(function(){const original=Store.data;try{const now=nowISO(),today=todayStr();Store.data={visits:[{id:'T-RJ',unit:'rawat-jalan',tanggal:today,poliId:'T',resepId:'RX-RJ'},{id:'T-IGD',unit:'igd',tanggal:today,poliId:'T',resepId:'RX-IGD'}],prescriptions:[{id:'RX-RJ',visitId:'T-RJ',unit:'rawat-jalan',status:'menunggu',createdAt:now},{id:'RX-IGD',visitId:'T-IGD',unit:'igd',status:'menunggu',createdAt:now},{id:'RX-RI',admissionId:'T-ADM',unit:'rawat-inap',status:'menunggu',createdAt:now}],meta:{settings:{}}};return pharmacyMetrics('rawat-jalan').pending===1&&pharmacyMetrics('igd').pending===1&&pharmacyMetrics('rawat_inap').pending===1;}catch(e){return false;}finally{Store.data=original;}})(),'Skenario sintetis memastikan resep satu unit tidak masuk antrean unit lain.');
  check('concurrent-journey-states','Perjalanan pasien mempertahankan status beberapa permintaan sekaligus',(function(){const original=Store.data;try{const v={id:'T-VIS',patientId:'T-P',unit:'rawat-jalan',status:'menunggu_lab',resepId:'T-RX',labRequest:{status:'menunggu'},radiologyRequest:{status:'menunggu'},workflow:{bookedAt:nowISO(),checkinAt:nowISO()}};Store.data={visits:[v],prescriptions:[{id:'T-RX',visitId:'T-VIS',status:'menunggu',unit:'rawat-jalan'}],careRequests:[],patients:[],users:[],bookings:[],admissions:[],beds:[],transactions:[],medicines:[],meta:{settings:{}}};const steps=patientJourneyDefinition(v);return steps.some(function(x){return x.key==='lab';})&&steps.some(function(x){return x.key==='radiology';})&&steps.some(function(x){return x.key==='pharmacy_prepare';})&&patientJourneyStepState(v,steps.find(function(x){return x.key==='lab';}))==='active'&&patientJourneyStepState(v,steps.find(function(x){return x.key==='radiology';}))==='active'&&patientJourneyStepState(v,steps.find(function(x){return x.key==='pharmacy_prepare';}))==='active';}catch(e){return false;}finally{Store.data=original;}})(),'Laboratorium, Radiologi, dan Farmasi dapat sama-sama aktif tanpa saling menandai selesai.');
  check('active-journey-priority','Beranda memilih satu perjalanan aktif sesuai prioritas pelayanan',(function(){const original=Store.data;try{const pid='T-PAT';Store.data={admissions:[{id:'A1',patientId:pid,status:'dirawat',billing:{statusBayar:'belum_bayar'},updatedAt:nowISO()}],visits:[{id:'V1',patientId:pid,unit:'igd',status:'diperiksa',updatedAt:nowISO()},{id:'V2',patientId:pid,unit:'rawat-jalan',status:'menunggu_dokter',updatedAt:nowISO()}],prescriptions:[],beds:[],wards:[],patients:[],users:[],bookings:[],transactions:[],medicines:[],careRequests:[],meta:{settings:{}}};if(getPatientActiveJourney(pid).unit!=='rawat-inap')return false;Store.data.admissions[0].status='pulang';if(getPatientActiveJourney(pid).unit!=='rawat-inap')return false;Store.data.admissions[0].billing.statusBayar='lunas';if(getPatientActiveJourney(pid).unit!=='igd')return false;Store.data.visits[0].status='selesai';return getPatientActiveJourney(pid).unit==='rawat-jalan';}catch(e){return false;}finally{Store.data=original;}})(),'Prioritas: Rawat Inap aktif → IGD aktif → Rawat Jalan aktif.');

  check('inpatient-structure-counts','Struktur rawat inap 3 gedung, 12 lantai reguler, 36 ruang reguler, 2 ruang VVIP',Store.data.wards.filter(function(w){return w.locationManaged&&w.category==='reguler';}).length===36&&Store.data.wards.filter(function(w){return w.locationManaged&&w.category==='vvip';}).length===2&&Store.data.beds.filter(function(b){return b.category==='reguler';}).length===1080&&Store.data.beds.filter(function(b){return b.category==='vvip';}).length===40,'36 ruang reguler × 30 bed dan 2 ruang VVIP × 20 bed tunggal.');
  check('inpatient-room-bed-counts','Setiap ruang reguler 10 kamar × 3 bed dan VVIP 20 kamar × 1 bed',Store.data.wards.filter(function(w){return w.locationManaged&&w.category==='reguler';}).every(function(w){return Store.data.beds.filter(function(b){return b.wardId===w.id;}).length===30;})&&Store.data.wards.filter(function(w){return w.locationManaged&&w.category==='vvip';}).every(function(w){return Store.data.beds.filter(function(b){return b.wardId===w.id;}).length===20;}),'Kapasitas struktur harus persis sesuai spesifikasi.');


  check('inpatient-floor-layout','Tiga gedung memiliki empat lantai reguler dengan tiga ruangan per lantai',(function(){const rooms=Store.data.wards.filter(function(w){return w.locationManaged&&w.category==='reguler';});const buildings=new Set(rooms.map(function(w){return w.buildingId;}));return buildings.size===3&&Array.from(buildings).every(function(id){const br=rooms.filter(function(w){return w.buildingId===id;});const floors=new Set(br.map(function(w){return Number(w.floorNumber);}));return floors.size===4&&Array.from(floors).every(function(f){return br.filter(function(w){return Number(w.floorNumber)===f;}).length===3;});})&&Store.data.wards.some(function(w){return w.category==='vvip'&&w.buildingId==='GED-A'&&Number(w.floorNumber)===5;})&&Store.data.wards.some(function(w){return w.category==='vvip'&&w.buildingId==='GED-A'&&Number(w.floorNumber)===6;});})(),'Gedung A/B/C: lantai 1–4 reguler, Gedung A lantai 5–6 VVIP.');
  check('service-account-unit-isolation','Akun farmasi/kasir terpisah per unit dan dokter IGD/RI tidak membawa poli rawat jalan',(function(){const users=Store.data.users;const find=function(username){return users.find(function(u){return u.username===username;});};return find('farmasi.rajal')?.unit==='rawat-jalan'&&find('farmasi.ranap')?.unit==='rawat-inap'&&find('farmasi.igd')?.unit==='igd'&&find('kasir.rajal')?.unit==='rawat-jalan'&&find('kasir.ranap')?.unit==='rawat-inap'&&find('kasir.igd')?.unit==='igd'&&!find('dokter.ranap')?.poliId&&!find('dokter.igd')?.poliId;})(),'Konteks farmasi/kasir mengikuti unit; dokter IGD/RI tidak salah ditautkan ke poli RJ.');
  check('inpatient-staffing-roster','Semua ruang memiliki kepala ruang dan tiga roster shift',Store.data.wards.filter(function(w){return w.locationManaged;}).length===38&&Store.data.wards.filter(function(w){return w.locationManaged;}).every(function(w){return !!w.headNurseName&&['PAGI','SORE','MALAM'].every(function(k){const sh=w.shiftAssignments&&w.shiftAssignments[k];return !!sh&&!!sh.ketuaShift&&!!sh.jamMulai&&!!sh.jamSelesai&&Array.isArray(sh.perawat)&&sh.perawat.length>0&&sh.perawat.includes(sh.ketuaShift);});})&&new Set(Store.data.wards.filter(function(w){return w.locationManaged;}).map(function(w){return w.headNurseName;})).size===38,'Setiap ruang mempunyai kepala ruang dan roster petugas per shift yang dapat diedit.');
  check('inpatient-nurse-assignment','Akun perawat rawat inap memiliki ruang dan shift yang valid',['perawat.ranap.pagi','perawat.ranap.sore','perawat.ranap.malam'].every(function(name){const u=Store.data.users.find(function(x){return x.username===name;});return !!u&&!!u.wardId&&!!u.shiftId&&Store.data.wards.some(function(w){return w.id===u.wardId;});}),'Akun shift tidak boleh masuk ke monitor tanpa penugasan ruang.');
  check('navbar-max-six','Semua navbar role dibatasi maksimal enam menu',Object.keys(PRIMARY_NAV_BY_ROLE).every(function(role){return PRIMARY_NAV_BY_ROLE[role].length<=6;})&&!NAV_ITEMS.some(function(n){return n.label==='Lainnya'||n.hash==='chat-pasien'||n.hash==='pasien-chat';}),'Chat tidak dihitung sebagai menu navbar; tidak ada menu Lainnya.');
  check('admin-service-menu-4x4','Superuser memiliki tombol Pelayanan dengan 16 ikon akses cepat',typeof openAdminMenuFolder==='function'&&ADMIN_SERVICE_MENU_ROUTES.length===16&&new Set(ADMIN_SERVICE_MENU_ROUTES).size===16&&ADMIN_SERVICE_MENU_ROUTES.every(function(h){return NAV_ITEMS.some(function(n){return n.hash===h;});}),'Tombol ☰ Pelayanan membuka grid 4×4; Chat tetap menjadi tombol terpisah.');
  check('topbar-chat-title-layout','Topbar menggunakan elemen terpisah untuk Chat dan judul halaman',/id=\"btn-top-chat\"/.test(renderShell.toString())&&/btn-admin-service-menu/.test(renderShell.toString()),'Chat tidak menimpa label judul halaman; tombol Pelayanan hanya untuk Admin.');

  check('monitor-poli-lock','Monitor tidak bisa diganti melalui parameter URL untuk akun poli',resolveMonitorPoliId({role:'perawat',poliId:'ANA'},'SP-JAN','SP-JAN')==='SP-ANA'&&resolveMonitorPoliId({role:'dokter',poliId:'GIG'},'SP-JAN',null)==='SP-GIG'&&resolveMonitorPoliId({role:'perawat'},'SP-JAN',null)===null,'Akun perawat/dokter mengikuti poli penugasan, bukan query URL.');
  check('inpatient-edit-persistence','Nama ruangan/gedung tetap setelah migrasi ulang',(function(){const d=migrateData(seedData());const w=d.wards.find(function(x){return x.id==='W-K3';});w.nama='Ruang Uji Edit';w.buildingName='Gedung Uji Edit';ensureInpatientStructure(d);return w.nama==='Ruang Uji Edit'&&w.buildingName==='Gedung Uji Edit';})(),'Master data yang diedit tidak ditimpa kembali oleh seed pada reload.');

  check('demo-account-catalog-complete','Semua akun demo tercantum tepat sekali pada login', (function(){const matches=Array.from(chipsForDemo().matchAll(/data-username="([^"]+)"/g)).map(function(x){return x[1];});return matches.length===Store.data.users.length&&new Set(matches).size===matches.length&&Store.data.users.every(function(u){return matches.includes(u.username);});})(),'Daftar login mencakup semua akun dokter, petugas per unit, admin, dan 10 pasien demo tanpa duplikasi.');
  check('unique-usernames','Username akun demo tidak duplikat',new Set(Store.data.users.map(function(u){return u.username;})).size===Store.data.users.length,'Satu username hanya boleh menunjuk ke satu akun login.');
  check('demo-data','Tidak ada identitas pasien nyata pada akun demo',Store.data.patients.filter(function(p){return String(p.id).startsWith('RM-DEMO-');}).every(function(p){return String(p.alamat||'').includes('bukan data pasien nyata')||String(p.nik||'').startsWith('DEMO');}), 'Akun demo menggunakan data fiktif.');
  return checks;
}
function renderAuditSistem(){
  setPageTitle('Audit Sistem');
  const checks=runSystemAudit(), pass=checks.filter(function(x){return x.pass;}).length;
  document.getElementById('main-content').innerHTML=pageIntro('Pemeriksaan internal V15.8.5 untuk memeriksa aturan booking, nomor antrean bersama simulasi, jalur utama, data demo, permintaan antarunit, dan batas prototype.')+
    '<div class="ops-kpi-grid"><div class="ops-kpi"><div class="kpi-label">Lulus</div><div class="kpi-value">'+pass+'</div></div><div class="ops-kpi"><div class="kpi-label">Diperiksa</div><div class="kpi-value">'+checks.length+'</div></div><div class="ops-kpi"><div class="kpi-label">Status</div><div class="kpi-value" style="font-size:20px">'+(pass===checks.length?'SIAP':'PERLU REVIEW')+'</div></div></div>'+
    '<div class="panel"><div class="panel-head"><div><h2>🧪 Self-Test V15.8.5</h2><div class="hint">Ini adalah audit data/aturan sisi client, bukan pengganti pengujian keamanan backend.</div></div><button class="btn btn-outline btn-sm" onclick="renderAuditSistem()">↻ Jalankan Lagi</button></div><div class="panel-body">'+
    '<div class="table-wrap"><table><thead><tr><th>Status</th><th>Pemeriksaan</th><th>Detail</th></tr></thead><tbody>'+checks.map(function(c){return '<tr><td>'+(c.pass?'<span class="badge badge-sage">✓ LULUS</span>':'<span class="badge badge-brick">✕ GAGAL</span>')+'</td><td><strong>'+esc(c.label)+'</strong></td><td>'+esc(c.detail)+'</td></tr>';}).join('')+'</tbody></table></div></div></div>'+
    '<div class="alert alert-warning"><strong>Batas prototype:</strong> localStorage hanya untuk simulasi. Untuk produksi dibutuhkan backend, database terpusat, autentikasi server, otorisasi server, audit trail terpusat, enkripsi, backup, dan integrasi resmi.</div>';
}

/* =================================================================
   INIT / PWA BOOTSTRAP
   ================================================================= */
MODULE_RENDERERS['dashboard'] = renderDashboard;
MODULE_RENDERERS['pasien-dashboard'] = renderPatientDashboard;
MODULE_RENDERERS['pasien-info'] = renderPatientInfo;
MODULE_RENDERERS['pasien-chat'] = renderPatientChat;
MODULE_RENDERERS['chat-pasien'] = renderStaffPatientChat;
MODULE_RENDERERS['informasi-rs'] = renderHospitalInformationAdmin;
MODULE_RENDERERS['pasien-booking'] = renderPatientBooking;
MODULE_RENDERERS['pasien-rawat-inap'] = renderPatientRawatInap;
MODULE_RENDERERS['pasien-booking-saya'] = renderPatientBookingSaya;
MODULE_RENDERERS['pasien-riwayat'] = renderPatientRiwayat;
MODULE_RENDERERS['beranda'] = renderBeranda;
MODULE_RENDERERS['pendaftaran'] = renderPendaftaran;
MODULE_RENDERERS['booking'] = renderBooking;
MODULE_RENDERERS['poli'] = renderPoli;
MODULE_RENDERERS['ranap'] = renderRanap;
MODULE_RENDERERS['lab'] = renderLab;
MODULE_RENDERERS['radiologi'] = renderRadiologi;
MODULE_RENDERERS['igd'] = renderIGD;
MODULE_RENDERERS['farmasi-rawat-jalan'] = renderFarmasi;
MODULE_RENDERERS['farmasi-rawat-inap'] = renderFarmasi;
MODULE_RENDERERS['farmasi-igd'] = renderFarmasi;
MODULE_RENDERERS['kasir-rawat-jalan'] = renderKasir;
MODULE_RENDERERS['kasir-rawat-inap'] = renderKasir;
MODULE_RENDERERS['kasir-igd'] = renderKasir;
MODULE_RENDERERS['rekam-medis'] = renderRekamMedis;
MODULE_RENDERERS['riwayat-dokter'] = renderRiwayatDokter;
MODULE_RENDERERS['riwayat-admin'] = renderRiwayatAdmin;
MODULE_RENDERERS['master-data'] = renderMasterData;
MODULE_RENDERERS['cek-antrian'] = renderCekAntrian;
MODULE_RENDERERS['monitor-antrean'] = renderMonitorAntrean;
MODULE_RENDERERS['audit-sistem'] = renderAuditSistem;
function openDoctorMonitor(){
  const u=Session.currentUser; if(!u||!['dokter','perawat','rawat_jalan','dokter_igd','perawat_igd','dokter_ranap','perawat_ranap','admin'].includes(u.role))return;
  if(['perawat_ranap','dokter_ranap'].includes(u.role)){window.open(location.href.split('#')[0]+'#/monitor-antrean','simrs-monitor-ri-'+encodeURIComponent(u.wardId||'unassigned'),'noopener,noreferrer');return;}
  const rawPoli=u.poliId; if(!rawPoli && ['dokter','perawat'].includes(u.role)){showToast('Akun belum memiliki penugasan poli. Hubungi administrator.','warning');return;}
  const poliId=canonicalPoliId(rawPoli||'SP-JAN');
  localStorage.setItem('simrs_monitor_config_v15',JSON.stringify({poliId:poliId}));
  const url=location.href.split('#')[0]+'#/monitor-antrean?poli='+encodeURIComponent(poliId);
  window.open(url,'simrs-monitor-'+poliId,'noopener,noreferrer');
}
let monitorClockTimer=null;
function renderInpatientNurseMonitor(){
  const u=Session.currentUser||{};
  const admin=u.role==='admin';
  const assignedIds=Array.isArray(u.wardIds)&&u.wardIds.length?u.wardIds:(u.wardId?[u.wardId]:[]);
  const wards=Store.data.wards.filter(function(w){return admin?(w.locationManaged||w.category==='khusus'):assignedIds.includes(w.id);});
  setPageTitle('Monitor Ruang Rawat Inap');
  if(!admin&&!assignedIds.length){document.getElementById('main-content').innerHTML='<div class="panel"><div class="panel-body"><div class="empty">Akun belum memiliki penugasan ruang rawat inap. Administrator perlu menetapkan ruang sebelum monitor digunakan.</div></div></div>';return;}
  document.getElementById('main-content').innerHTML='<div class="public-monitor inpatient-room-monitor"><div class="monitor-head"><div><div class="ops-eyebrow">SIMRS PROTOTYPE · MONITOR RAWAT INAP</div><h1>'+ (admin?'MONITOR RAWAT INAP':esc((wards[0]||{}).nama||'RUANG RAWAT INAP').toUpperCase()) +'</h1><div>'+(admin?'Seluruh ruang yang dikelola':'Penugasan: '+esc((wards[0]||{}).buildingName||'Gedung')+' · '+esc((wards[0]||{}).floorNumber?((wards[0]||{}).floorName||('Lantai '+wards[0].floorNumber)):'') )+'</div></div><div class="monitor-clock" id="monitor-clock"></div></div>'+wards.map(function(w){const beds=Store.data.beds.filter(function(b){return b.wardId===w.id;});const occupied=beds.filter(function(b){return b.status==='terisi';}).length;return '<section class="monitor-next inpatient-room-section"><h2>'+esc(w.nama)+' <span class="badge badge-slate">'+esc(w.buildingName||'Unit khusus')+(w.floorNumber?' · Lantai '+w.floorNumber:'')+'</span></h2><div class="hint">Kepala ruang: '+esc(w.headNurseName||'Belum ditetapkan')+' · '+occupied+'/'+beds.length+' bed terisi</div><div class="inpatient-bed-grid">'+beds.map(function(b){const adm=Store.data.admissions.find(function(a){return a.bedId===b.id&&a.status==='dirawat';});const patient=adm?getPatient(adm.patientId):null;const meta=INPATIENT_BED_STATUS[b.status]||INPATIENT_BED_STATUS.kosong;const location='Kamar '+esc(b.noKamar)+' · '+esc(b.bedLabel||('Bed '+b.noBed));return '<div class="inpatient-bed-card"><div><strong>'+location+'</strong><span class="badge '+meta.cls+'">'+(adm?'Terisi':meta.label)+'</span></div><div class="inpatient-bed-patient">'+(patient?'<strong>'+esc(patient.nama)+'</strong><small>No. RM '+esc(patient.id)+'</small><small>Status: '+esc(adm.status)+'</small>':(b.status==='kosong'?'Belum ditempati':esc(meta.label)))+'</div></div>';}).join('')+'</div></section>';}).join('')+'</div>';
  if(monitorClockTimer)clearInterval(monitorClockTimer);const clock=document.getElementById('monitor-clock');if(clock){const tick=()=>clock.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});tick();monitorClockTimer=setInterval(tick,1000);}
}
function resolveMonitorPoliId(user, requestedPoliId, savedPoliId){
  if(user&&['dokter','perawat'].includes(user.role)) return user.poliId?canonicalPoliId(user.poliId):null;
  return canonicalPoliId(requestedPoliId||savedPoliId||'SP-JAN');
}
function renderMonitorAntrean(){
  const signedIn=Session.currentUser;
  if(signedIn&&['perawat_ranap','dokter_ranap'].includes(signedIn.role)){renderInpatientNurseMonitor();return;}
  const hash=location.hash||''; const qs=hash.includes('?')?new URLSearchParams(hash.split('?')[1]):null;
  const saved=JSON.parse(localStorage.getItem('simrs_monitor_config_v15')||'null');
  let poliId;
  if(signedIn&&['dokter','perawat'].includes(signedIn.role)){
    if(!signedIn.poliId){document.getElementById('main-content').innerHTML='<div class="panel"><div class="panel-body"><div class="empty">Akun belum memiliki penugasan poli. Monitor tidak dapat menampilkan poli lain secara otomatis.</div></div></div>';return;}
    poliId=resolveMonitorPoliId(signedIn,qs&&qs.get('poli'),saved&&saved.poliId);
  } else if(signedIn&&['dokter_igd','perawat_igd'].includes(signedIn.role)){
    document.getElementById('main-content').innerHTML='<div class="panel"><div class="panel-body"><div class="empty">Akun IGD tidak menggunakan monitor antrean poli. Gunakan monitor dan daftar kerja IGD.</div></div></div>';return;
  } else {
    const cfg=qs&&qs.get('poli')?{poliId:qs.get('poli')}:(saved||null);
    poliId=resolveMonitorPoliId(signedIn,cfg&&cfg.poliId,saved&&saved.poliId);
  }
  const poli=getPoli(poliId)||{id:poliId,nama:poliId};
  const now=new Date(), date=todayStr(now), schedules=getSessionCandidates(poliId,date);
  const activeSchedule=getActiveDoctorSchedule(poliId,now);
  const activeDoctor=activeSchedule?(Store.data.users.find(u=>u.id===activeSchedule.doctorId)||doctorMasterById(activeSchedule.doctorId)):null;
  const visits=visitsToday().filter(v=>samePoli(v.poliId,poliId));
  const active=visits.filter(v=>['dipanggil','diperiksa'].includes(v.status)).sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);})[0]||null;
  const waiting=visits.filter(v=>['menunggu_dokter','menunggu_poli'].includes(v.status)).sort(function(a,b){return (b.prioritas?1:0)-(a.prioritas?1:0)||(queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999);});
  const sessionInfo=activeSchedule?(esc(activeSchedule.jamMulai)+'–'+esc(activeSchedule.jamSelesai)+' · '+esc(activeSchedule.ruang||'Ruang Poli')):'Tidak ada sesi yang sedang berlangsung';
  const doctorInfo=activeDoctor?esc(activeDoctor.nama):'Menunggu sesi dokter berikutnya';
  const nextSession=schedules.find(sc=>{const a=String(sc.jamMulai||'00:00').split(':').map(Number);return (now.getHours()*60+now.getMinutes()) < a[0]*60+a[1];});
  const nextInfo=nextSession?('Berikutnya: '+esc((Store.data.users.find(u=>u.id===nextSession.doctorId)||doctorMasterById(nextSession.doctorId)||{}).nama||'Dokter')+' · '+esc(nextSession.jamMulai)+'–'+esc(nextSession.jamSelesai)):'';
  document.getElementById('main-content').innerHTML='<div class="public-monitor"><div class="monitor-head"><div><div class="ops-eyebrow">SIMRS PROTOTYPE · MONITOR POLI</div><h1>'+esc(poli.nama).toUpperCase()+'</h1><div>'+doctorInfo+' · '+sessionInfo+'</div></div><div class="monitor-clock" id="monitor-clock"></div></div><div class="monitor-current"><span>NOMOR YANG DIPANGGIL</span><strong>'+esc(active?active.noAntrian:'—')+'</strong><div>'+(active?'Silakan menuju ruang pemeriksaan':'Mohon menunggu panggilan berikutnya')+'</div></div><div class="monitor-next"><h2>ANTREAN MENUNGGU</h2><div class="monitor-queue-list">'+(waiting.length?waiting.slice(0,10).map(function(v){return '<div><strong>'+esc(v.noAntrian)+'</strong><span>Menunggu</span></div>';}).join(''):'<div class="monitor-empty">Belum ada pasien yang menunggu.</div>')+'</div></div><div class="monitor-session-strip"><span>SESI AKTIF</span><strong>'+sessionInfo+'</strong><small>'+esc(nextInfo)+'</small></div><div class="monitor-footer">Nomor antrean dibuat per poli dan tanggal · Dokter/sesi dialokasikan otomatis sesuai jadwal dan kapasitas · Tidak menampilkan nama pasien</div></div>';
  if(monitorClockTimer)clearInterval(monitorClockTimer); const clock=document.getElementById('monitor-clock'); if(clock){const tick=()=>clock.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});tick();monitorClockTimer=setInterval(tick,1000);}
}


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

window.addEventListener('storage',function(e){if(e.key==='simrs_db_v1'){Store.load();if(Session.currentUser)render();}});
try{if(liveChannel)liveChannel.onmessage=function(e){if(e.data&&e.data.type==='db-updated'){Store.load();if(Session.currentUser)render();}};}catch(e){}
