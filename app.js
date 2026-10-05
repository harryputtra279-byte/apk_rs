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
  ['RJ-UMU','Poli Umum','Rawat Jalan'],
  ['SP-GCU','Klinik General Check Up','Poliklinik Spesialis'],['SP-BPL','Klinik Bedah Plastik','Poliklinik Spesialis'],['SP-BUM','Klinik Bedah Umum','Poliklinik Spesialis'],['SP-BUR','Klinik Bedah Urologi','Poliklinik Spesialis'],['SP-BSR','Klinik Bedah Saraf','Poliklinik Spesialis'],['SP-BOR','Klinik Bedah Orthopedi','Poliklinik Spesialis'],['SP-BDI','Klinik Bedah Digestif','Poliklinik Spesialis'],['SP-PDL','Klinik Penyakit Dalam','Poliklinik Spesialis'],['SP-GER','Klinik Geriatri','Poliklinik Spesialis'],['SP-END','Klinik Endoskopi','Poliklinik Spesialis'],['SP-JAN','Klinik Jantung','Poliklinik Spesialis'],['SP-SAR','Klinik Saraf','Poliklinik Spesialis'],['SP-PAR','Klinik Paru','Poliklinik Spesialis'],['SP-HKB','Klinik Hamil/KB','Poliklinik Spesialis'],['SP-KDG','Klinik Kandungan','Poliklinik Spesialis'],['SP-AND','Klinik Andrologi','Poliklinik Spesialis'],['SP-PSI','Klinik Psikologi','Poliklinik Spesialis'],['SP-PSK','Klinik Psikiatri','Poliklinik Spesialis'],['SP-REH','Klinik Rehabilitasi Medik','Poliklinik Spesialis'],['SP-ANA','Klinik Anak','Poliklinik Spesialis'],['SP-TBK','Klinik Tumbuh Kembang','Poliklinik Spesialis'],['SP-GIG','Klinik Gigi dan Mulut','Poliklinik Spesialis'],['SP-THT','Klinik THT','Poliklinik Spesialis'],['SP-MAT','Klinik Mata','Poliklinik Spesialis'],['SP-KUL','Klinik Kulit dan Kelamin','Poliklinik Spesialis'],['SP-MRV','Klinik Mawar Merah/VCT','Poliklinik Spesialis'],['SP-GIZ','Klinik Gizi','Poliklinik Spesialis'],['SP-HOM','Pelayanan Homecare','Poliklinik Spesialis'],
  ['EX-EST','Klinik Estetika','Poliklinik Eksekutif'],['EX-KUL','Klinik Kulit dan Kelamin','Poliklinik Eksekutif'],['EX-BUM','Klinik Bedah Umum','Poliklinik Eksekutif'],['EX-BUR','Klinik Bedah Urologi','Poliklinik Eksekutif'],['EX-BSR','Klinik Bedah Saraf','Poliklinik Eksekutif'],['EX-BOR','Klinik Bedah Orthopedi','Poliklinik Eksekutif'],['EX-BDI','Klinik Bedah Digestif','Poliklinik Eksekutif'],['EX-BTKV','Klinik Bedah TKV','Poliklinik Eksekutif'],['EX-BONK','Klinik Bedah Onkologi','Poliklinik Eksekutif'],['EX-PDL','Klinik Penyakit Dalam','Poliklinik Eksekutif'],['EX-AKU','Klinik Akupuntur','Poliklinik Eksekutif'],['EX-JAN','Klinik Jantung','Poliklinik Eksekutif'],['EX-SAR','Klinik Saraf','Poliklinik Eksekutif'],['EX-PAR','Klinik Paru','Poliklinik Eksekutif'],['EX-HKB','Klinik Hamil/KB','Poliklinik Eksekutif'],['EX-KDG','Klinik Kandungan','Poliklinik Eksekutif'],['EX-AND','Klinik Andrologi','Poliklinik Eksekutif'],['EX-PSI','Klinik Psikologi','Poliklinik Eksekutif'],['EX-PSK','Klinik Psikiatri','Poliklinik Eksekutif'],['EX-REH','Klinik Rehabilitasi Medik','Poliklinik Eksekutif'],['EX-ANA','Klinik Anak','Poliklinik Eksekutif'],['EX-TBK','Klinik Tumbuh Kembang','Poliklinik Eksekutif'],['EX-GIG','Klinik Gigi dan Mulut','Poliklinik Eksekutif'],['EX-THT','Klinik THT','Poliklinik Eksekutif'],['EX-MAT','Klinik Mata','Poliklinik Eksekutif'],['EX-GIZ','Klinik Gizi','Poliklinik Eksekutif'],['EX-RAD','Klinik Radioterapi','Poliklinik Eksekutif']
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


/* ================================================================
   MASTER DOKTER & JADWAL NOTOPURO V15
   Data publik dipakai sebagai baseline demo dan SELALU editable Admin.
   Status sumber sengaja diberi needs_confirmation karena website resmi
   sendiri menandai sebagian data dokter sebagai "Data Belum Diperbarui".
   ================================================================ */
const OFFICIAL_DOCTOR_MASTER = [
  {id:'DOC-ANGELA',nama:'dr. ANGELA BETY RATNASARI, Sp.JP',spesialis:'Jantung dan Pembuluh Darah',poliIds:['SP-JAN','EX-JAN'],status:'needs_confirmation'},
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
  OFFICIAL_DOCTOR_MASTER.forEach(function(d){if(!data.doctors.some(function(x){return x.id===d.id;}))data.doctors.push(Object.assign({},d,{source:'RSUD R.T. Notopuro — Dokter Kami',editable:true,updatedAt:nowISO()}));});
  if(!Array.isArray(data.doctorSchedules)) data.doctorSchedules=[];
  OFFICIAL_SCHEDULE_SEED.forEach(function(x){if(!data.doctorSchedules.some(function(s){return s.id===x[0];}))data.doctorSchedules.push({id:x[0],doctorId:x[1],poliId:x[2],tanggal:null,hari:x[3],jamMulai:x[4],jamSelesai:x[5],ruang:'Belum dipetakan',shiftLabel:'Sesuai jadwal resmi',kuota:null,source:'RSUD R.T. Notopuro — publik',needsConfirmation:true,createdAt:nowISO(),updatedAt:nowISO()});});
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
const DB_SCHEMA_VERSION = 15;

function ensureDivisionDemoUsers(data){
  if(!Array.isArray(data.users)) data.users=[];
  const demoUsers = [
    {id:'U-RJ-ADM', username:'rawatjalan', password:'rawatjalan123', nama:'Budi Santoso', role:'rawat_jalan', unit:'rawat-jalan'},
    {id:'U-RJ-DOK', username:'dokter.rajal', password:'dokter123', nama:'dr. Andi Wijaya', role:'dokter', unit:'rawat-jalan', poliId:'UMU'},
    {id:'U-RJ-DOK-01', username:'dokter.umum', password:'dokter123', nama:'dr. Andi Wijaya', role:'dokter', unit:'rawat-jalan', poliId:'UMU'},
    {id:'U-RJ-DOK-02', username:'dokter.anak', password:'dokter123', nama:'dr. Maria Christiani, Sp.A', role:'dokter', unit:'rawat-jalan', poliId:'ANA'},
    {id:'U-RJ-DOK-03', username:'dokter.gigi', password:'dokter123', nama:'drg. Hendra Kusuma', role:'dokter', unit:'rawat-jalan', poliId:'GIG'},
    {id:'U-RJ-DOK-04', username:'dokter.jantung', password:'dokter123', nama:'dr. Rudi Hartono, Sp.JP', role:'dokter', unit:'rawat-jalan', poliId:'SP-JAN'},
    {id:'U-DOK6', username:'dokter.sany', password:'dokter123', nama:'dr. Sany Pratama, Sp.JP', role:'dokter', unit:'rawat-jalan', poliId:'SP-JAN'},
    {id:'U-RJ-DOK-05', username:'dokter.penyakitdalam', password:'dokter123', nama:'dr. Bima Prasetyo, Sp.PD', role:'dokter', unit:'rawat-jalan', poliId:'PDL'},
    {id:'U-RJ-PWT-01', username:'asisten.umum', password:'perawat123', nama:'Ns. Lestari Handayani, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'UMU'},
    {id:'U-RJ-PWT-02', username:'asisten.anak', password:'perawat123', nama:'Ns. Sinta Maharani, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'ANA'},
    {id:'U-RJ-PWT-03', username:'asisten.gigi', password:'perawat123', nama:'Ns. Dedi Kurniawan, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'GIG'},
    {id:'U-RJ-PWT-04', username:'asisten.jantung', password:'perawat123', nama:'Ns. Rina Lestari, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'JAN'},
    {id:'U-RJ-PWT-05', username:'asisten.penyakitdalam', password:'perawat123', nama:'Ns. Fajar Nugroho, S.Kep', role:'perawat', unit:'rawat-jalan', poliId:'PDL'},
    {id:'U-RJ-FAR', username:'farmasi.rajal', password:'farmasi123', nama:'Apt. Dewi Lestari', role:'farmasi', unit:'rawat-jalan'},
    {id:'U-RJ-KAS', username:'kasir.rajal', password:'kasir123', nama:'Rina Marlina', role:'kasir', unit:'rawat-jalan'},
    {id:'U-IGD-DOK', username:'dokter.igd', password:'dokter123', nama:'dr. Rudi Hartono', role:'dokter_igd', unit:'igd'},
    {id:'U-IGD-PWT', username:'perawat.igd', password:'perawat123', nama:'Ns. Lestari Handayani', role:'perawat_igd', unit:'igd'},
    {id:'U-IGD-FAR', username:'farmasi.igd', password:'farmasi123', nama:'Apt. Sari Wulandari', role:'farmasi', unit:'igd'},
    {id:'U-IGD-KAS', username:'kasir.igd', password:'kasir123', nama:'Rina Pratama', role:'kasir', unit:'igd'},
    {id:'U-RI-DOK', username:'dokter.ranap', password:'dokter123', nama:'dr. Maria Christiani, Sp.A', role:'dokter_ranap', unit:'rawat-inap'},
    {id:'U-RI-PWT', username:'perawat.ranap', password:'perawat123', nama:'Ns. Dimas Saputra', role:'perawat_ranap', unit:'rawat-inap'},
    {id:'U-RI-FAR', username:'farmasi.ranap', password:'farmasi123', nama:'Apt. Nanda Putri', role:'farmasi', unit:'rawat-inap'},
    {id:'U-RI-KAS', username:'kasir.ranap', password:'kasir123', nama:'Rina Permata', role:'kasir', unit:'rawat-inap'},
    {id:'U-PAS-001', username:'pasien.demo', password:'pasien123', nama:'Ahmad Fauzi', role:'pasien', unit:'rawat-jalan', patientId:'RM-2026-0001'}
  ];
  demoUsers.forEach(function(u){
    const old=data.users.find(x=>x.id===u.id || x.username===u.username);
    if(old){ Object.assign(old,u); }
    else data.users.push(Object.assign({},u));
  });
  ensurePatientDemoAccounts(data);
  return data;
}

/* ---------------- 5 akun demo pasien ----------------
   Setiap akun memiliki data pasien + tiket booking contoh agar alur
   Dashboard Pasien, buka ulang QR/barcode, dan Download Tiket dapat diuji
   tanpa harus membuat booking baru terlebih dahulu.
   Semua identitas di bawah adalah data fiktif untuk demo.
*/
function ensurePatientDemoAccounts(data){
  if(!Array.isArray(data.patients)) data.patients=[];
  if(!Array.isArray(data.bookings)) data.bookings=[];
  const tanggal=todayStr(new Date(Date.now()+86400000));
  const demos=[
    {uid:'U-PAS-001',pid:'RM-DEMO-P001',username:'pasien.demo1',password:'pasien123',nama:'Andi Pratama',nik:'DEMO320101000001',jk:'L',lahir:'1992-04-12',hp:'081200000001',poli:'SP-JAN',layanan:'Poliklinik Spesialis',bayar:'Umum',no:'SP-JAN-003',kode:'DEMO-P001-JAN'},
    {uid:'U-PAS-002',pid:'RM-DEMO-P002',username:'pasien.demo2',password:'pasien123',nama:'Sari Wulandari',nik:'DEMO320101000002',jk:'P',lahir:'1990-08-21',hp:'081200000002',poli:'EX-JAN',layanan:'Poliklinik Eksekutif',bayar:'Umum',no:'EX-JAN-002',kode:'DEMO-P002-EJAN'},
    {uid:'U-PAS-003',pid:'RM-DEMO-P003',username:'pasien.demo3',password:'pasien123',nama:'Budi Setiawan',nik:'DEMO320101000003',jk:'L',lahir:'1987-02-03',hp:'081200000003',poli:'SP-GIG',layanan:'Poliklinik Spesialis',bayar:'BPJS',no:'SP-GIG-002',kode:'DEMO-P003-GIG'},
    {uid:'U-PAS-004',pid:'RM-DEMO-P004',username:'pasien.demo4',password:'pasien123',nama:'Rina Maharani',nik:'DEMO320101000004',jk:'P',lahir:'1985-11-17',hp:'081200000004',poli:'EX-PDL',layanan:'Poliklinik Eksekutif',bayar:'Asuransi',no:'EX-PDL-001',kode:'DEMO-P004-EPDL'},
    {uid:'U-PAS-005',pid:'RM-DEMO-P005',username:'pasien.demo5',password:'pasien123',nama:'Dimas Saputra',nik:'DEMO320101000005',jk:'L',lahir:'1995-06-28',hp:'081200000005',poli:'SP-ANA',layanan:'Poliklinik Spesialis',bayar:'BPJS',no:'SP-ANA-001',kode:'DEMO-P005-ANA'}
  ];
  demos.forEach(function(d){
    if(!data.patients.some(function(x){return x.id===d.pid;})){
      data.patients.push({id:d.pid,nik:d.nik,nama:d.nama,jenisKelamin:d.jk,tglLahir:d.lahir,alamat:'Data Demo — bukan data pasien nyata',noHp:d.hp,golDarah:'-',alergi:'',createdAt:nowISO()});
    }
    const oldUser=data.users.find(function(x){return x.id===d.uid || x.username===d.username;});
    const user={id:d.uid,username:d.username,password:d.password,nama:d.nama,role:'pasien',unit:'rawat-jalan',patientId:d.pid};
    if(oldUser) Object.assign(oldUser,user); else data.users.push(user);
    const existing=data.bookings.find(function(b){return b.id==='BK-'+d.pid || (b.patientId===d.pid && b.tanggalKontrol===tanggal && samePoli(b.poliId,d.poli));});
    if(!existing){
      data.bookings.push({id:'BK-'+d.pid,patientId:d.pid,poliId:d.poli,tanggalKontrol:tanggal,jenisBayar:d.bayar,sumber:'Aplikasi Pasien RS (Demo)',noBpjs:d.bayar==='BPJS'?'DEMO-'+d.pid:'',noAntrian:d.no,kodeCheckIn:d.kode,status:'terjadwal',visitId:null,reminded:false,remindedAt:null,confirmedAt:null,asuransiNama:d.bayar==='Asuransi'?'Asuransi Demo': '',createdAt:nowISO(),updatedAt:nowISO(),demo:true});
    }
  });
  // Kunjungan hari ini sengaja dibuat beragam agar lima akun pasien dapat menguji
  // Live Queue Monitor, status hijau saat dipanggil, notifikasi, dan Riwayat Kontrol.
  if(!Array.isArray(data.visits)) data.visits=[];
  const demoVisits=[
    {id:'VIS-DEMO-P001',patientId:'RM-DEMO-P001',poliId:'SP-JAN',noAntrian:'SP-JAN-017',status:'diperiksa'},
    {id:'VIS-DEMO-P002',patientId:'RM-DEMO-P002',poliId:'EX-JAN',noAntrian:'EX-JAN-005',status:'dipanggil'},
    {id:'VIS-DEMO-P003',patientId:'RM-DEMO-P003',poliId:'SP-GIG',noAntrian:'SP-GIG-012',status:'menunggu_dokter'},
    {id:'VIS-DEMO-P004',patientId:'RM-DEMO-P004',poliId:'EX-PDL',noAntrian:'EX-PDL-008',status:'selesai'},
    {id:'VIS-DEMO-P005',patientId:'RM-DEMO-P005',poliId:'SP-ANA',noAntrian:'SP-ANA-009',status:'menunggu_dokter'}
  ];
  demoVisits.forEach(function(d){
    if(data.visits.some(function(v){return v.id===d.id;})) return;
    data.visits.push({id:d.id,patientId:d.patientId,tanggal:todayStr(),poliId:d.poliId,dokterId:null,jenisBayar:data.bookings.find(function(b){return b.patientId===d.patientId;})?.jenisBayar||'Umum',noBpjs:'',noAntrian:d.noAntrian,keluhan:'Kontrol demo — data fiktif',status:d.status,unit:'rawat-jalan',vital:null,diagnosis:d.status==='selesai'?'Kontrol rutin':'',catatan:'Data demo — bukan data pasien nyata',labRequest:null,resepId:null,billing:{registrasi:BIAYA_REGISTRASI,konsultasi:0,obat:0,lab:0},bookingId:null,prioritas:false,screening:d.status==='menunggu_dokter'||d.status==='dipanggil'||d.status==='diperiksa'?{td:'120/80',nadi:'80',suhu:'36.7',spo2:'98',bb:'65',tb:'168',keluhan:'Kontrol demo',by:'Sistem Demo',at:nowISO()}:null,workflow:{bookedAt:nowISO(),checkinAt:nowISO(),screeningAt:d.status==='menunggu_dokter'||d.status==='dipanggil'||d.status==='diperiksa'?nowISO():null,doctorStartAt:d.status==='diperiksa'?nowISO():null,supportingAt:null,reviewAt:null,completedAt:d.status==='selesai'?nowISO():null},createdAt:nowISO(),updatedAt:nowISO(),demo:true});
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
  });
  // Pastikan counter antrean tidak pernah menghasilkan nomor duplikat,
  // termasuk ketika sumber booking berasal dari JKN Mobile dan aplikasi RS.
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
  if(!Array.isArray(data.prescriptions)) data.prescriptions=[];
  data.prescriptions.forEach(function(r){ if(r.unit===undefined) r.unit=r.admissionId?'rawat-inap':'rawat-jalan'; if(r.updatedAt===undefined) r.updatedAt=r.createdAt||nowISO(); if(r.siapAt===undefined) r.siapAt=null; if(r.diambilAt===undefined) r.diambilAt=null; if(r.jenisLayanan===undefined) r.jenisLayanan=r.admissionId?'rawat_inap':'rawat_jalan'; });
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
  if(!Array.isArray(data.doctorSchedules)) data.doctorSchedules = [];
  const demoSchedules = [
    {id:'SCH-JAN-RUDI-PAGI', doctorId:'U-RJ-DOK-04', poliId:'SP-JAN', tanggal:null, hari:1, jamMulai:'08:00', jamSelesai:'12:00', ruang:'Ruang 14', shiftLabel:'Pagi', kuota:null},
    {id:'SCH-JAN-SANY-SORE', doctorId:'U-DOK6', poliId:'SP-JAN', tanggal:null, hari:1, jamMulai:'13:00', jamSelesai:'20:00', ruang:'Ruang 14', shiftLabel:'Sore', kuota:null}
  ];
  demoSchedules.forEach(function(sc){ if(!data.doctorSchedules.some(function(x){return x.id===sc.id;})) data.doctorSchedules.push(Object.assign({createdAt:nowISO(),updatedAt:nowISO()},sc)); });
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
  data.meta.settings = Object.assign({pharmacyOutpatientSlaMinutes:30, pharmacyInpatientSlaMinutes:60}, data.meta.settings||{});
  return data;
}

let liveChannel=null;
try{ if(window.BroadcastChannel) liveChannel=new BroadcastChannel('simrs-live-v15'); }catch(e){ liveChannel=null; }
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
function getResepByVisit(visitId){ return Store.data.prescriptions.find(r=>r.visitId===visitId); }
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
  const isInpatient=kind==='rawat_inap';
  const settings=Store.data.meta.settings||{};
  const sla=isInpatient?(settings.pharmacyInpatientSlaMinutes||60):(settings.pharmacyOutpatientSlaMinutes||30);
  let list=[];
  if(isInpatient){ list=Store.data.prescriptions.filter(function(r){return r.admissionId && r.status==='menunggu';}); }
  else { list=Store.data.prescriptions.filter(function(r){ const v=getVisit(r.visitId); return v && (!poliId || samePoli(v.poliId,poliId)) && v.tanggal===todayStr() && !r.admissionId; }); }
  const waits=list.map(pharmacyWaitMinutes).filter(function(x){return x!==null;});
  const maxWait=waits.length?Math.max.apply(null,waits):0;
  return {pending:list.length,maxWait:maxWait,sla:sla,overSla:list.filter(function(r){const w=pharmacyWaitMinutes(r); return w!==null && w>sla;}).length};
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
const NAV_ITEMS = [
  {hash:'dashboard',label:'Dashboard',ic:'▦'},
  {hash:'beranda',label:'Beranda',ic:'⌂'},
  {hash:'pendaftaran',label:'Pendaftaran',ic:'📝'},
  {hash:'booking',label:'Booking',ic:'📅'},
  {hash:'poli',label:'Poli',ic:'🩺'},
  {hash:'igd',label:'IGD',ic:'🚑'},
  {hash:'ranap',label:'Rawat Inap',ic:'🏨'},
  {hash:'lab',label:'Laboratorium',ic:'🧪'},
  {hash:'farmasi-rawat-jalan',label:'Farmasi Rawat Jalan',ic:'💊'},
  {hash:'farmasi-rawat-inap',label:'Farmasi Rawat Inap',ic:'💊'},
  {hash:'farmasi-igd',label:'Farmasi IGD',ic:'💊'},
  {hash:'kasir-rawat-jalan',label:'Kasir Rawat Jalan',ic:'🧾'},
  {hash:'kasir-rawat-inap',label:'Kasir Rawat Inap',ic:'🧾'},
  {hash:'kasir-igd',label:'Kasir IGD',ic:'🧾'},
  {hash:'rekam-medis',label:'Rekam Medis',ic:'📋'},
  {hash:'riwayat-dokter',label:'Riwayat',ic:'🕘'},
  {hash:'master-data',label:'Master Data',ic:'⚙️'},
  {hash:'cek-antrian',label:'Cek Antrian',ic:'📺'},
  {hash:'monitor-antrean',label:'Monitor Poli',ic:'🖥️'},
  {hash:'pasien-dashboard',label:'Dashboard',ic:'⌂'},
  {hash:'pasien-booking',label:'Rawat Jalan',ic:'📅'},
  {hash:'pasien-booking-saya',label:'Booking Saya',ic:'🎫'},
  {hash:'pasien-riwayat',label:'Riwayat Kontrol',ic:'📋'}
];

const ROLE_ROUTE_RULES = {
  admin: ['*'],
  monitor_public: ['monitor-antrean'],
  pasien: ['pasien-dashboard','pasien-booking','pasien-booking-saya','pasien-riwayat'],
  loket: ['pendaftaran','booking','cek-antrian'],
  rawat_jalan: ['pendaftaran','booking','poli','cek-antrian'],
  // Dokter poli: hanya Beranda, Poli, Rekam Medis, dan Riwayat.
  dokter: ['poli','rekam-medis','riwayat-dokter'],
  dokter_igd: ['igd','rekam-medis','riwayat-dokter'],
  dokter_ranap: ['ranap','rekam-medis','riwayat-dokter'],
  perawat: ['beranda','poli','rekam-medis'],
  perawat_igd: ['igd','rekam-medis'],
  perawat_ranap: ['ranap','rekam-medis'],
  lab: ['beranda','lab'],
  farmasi: ['beranda','farmasi-rawat-jalan','farmasi-rawat-inap','farmasi-igd'],
  kasir: ['beranda','kasir-rawat-jalan','kasir-rawat-inap','kasir-igd']
};

function isRouteAllowed(route, role){
  const u = Session.currentUser;
  if(!u || !role) return false;
  if(role==='admin') return true; // super user
  if(route==='monitor-antrean') return true;

  const allowed = ROLE_ROUTE_RULES[role] || [];
  if(!allowed.includes(route)) return false;

  // Akun pasien hanya boleh berada di ruang pasien.
  if(role==='pasien') return route.indexOf('pasien-')===0;

  const ctx = routeContext(route);
  if(ctx && u.unit && u.unit!==ctx) return false;

  // Poli rawat jalan wajib mengikuti poli yang melekat pada akun dokter/perawat.
  if((role==='dokter' || role==='perawat') && route==='poli' && !u.poliId) return false;

  // Rekam medis dan riwayat dokter tetap mengikuti unit akun.
  if(route==='riwayat-dokter' && !['dokter','dokter_igd','dokter_ranap'].includes(role)) return false;

  return true;
}

function roleLabel(role){
  return {admin:'Admin', loket:'Petugas Pendaftaran', rawat_jalan:'Petugas Rawat Jalan', dokter:'Dokter', dokter_igd:'Dokter IGD', dokter_ranap:'Dokter Rawat Inap', farmasi:'Apoteker', kasir:'Kasir', lab:'Petugas Laboratorium', perawat:'Perawat', perawat_igd:'Perawat IGD', perawat_ranap:'Perawat Rawat Inap', pasien:'Pasien'}[role] || role;
}
function defaultRouteForRole(role){
  const u=Session.currentUser||{};
  if(role==='farmasi') return u.unit==='igd'?'farmasi-igd':(u.unit==='rawat-inap'?'farmasi-rawat-inap':'farmasi-rawat-jalan');
  if(role==='kasir') return u.unit==='igd'?'kasir-igd':(u.unit==='rawat-inap'?'kasir-rawat-inap':'kasir-rawat-jalan');
  return ({admin:'dashboard', loket:'pendaftaran', rawat_jalan:'poli', dokter:'poli', dokter_igd:'igd', dokter_ranap:'ranap', lab:'lab', perawat:'poli', perawat_igd:'igd', perawat_ranap:'ranap', pasien:'pasien-dashboard'})[role] || 'cek-antrian';
}
function navigate(hash){ location.hash = '#/' + hash; }
function currentRoute(){ return location.hash.replace(/^#\/?/, '').split('?')[0]; }

function render(){
  try{
    if(currentRoute()==='monitor-antrean'){ renderMonitorAntrean(); return; }
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
  const items = NAV_ITEMS.filter(n=>isRouteAllowed(n.hash,u.role) && !(u.role==='pasien' && (n.hash==='cek-antrian' || /cari|pencarian/i.test(n.label))));
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
       '<div class="brand"><div class="brand-mark"></div><div class="brand-text"><div class="t1">SIMRS Terpadu</div><div class="t2">RSUD R.T. Notopuro Sidoarjo</div></div></div>'+
       '<nav class="nav">'+sidebarNavHtml+'</nav>'+
       '<div class="sidebar-user"><div class="name">'+esc(u.nama)+'</div><div class="role">'+roleLabel(u.role)+(u.poliId?' · '+esc(getPoli(u.poliId).nama):'')+'</div>'+
         '<button class="btn btn-outline btn-sm btn-block" id="btn-logout-sidebar">🚪 Keluar</button></div>'+
     '</aside>'+
     '<div class="main-area">'+
       '<div class="topbar">'+
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
        '<h1>SIMRS Terpadu</h1>'+
        '<div class="sub">RSUD R.T. Notopuro Sidoarjo — Sistem Informasi Manajemen Rumah Sakit</div>'+
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
    {title:'🛡️ ADMIN',hint:'Pengelola sistem, master data, hak akses, dan audit log.',items:[['admin','Admin — Siti Rahayu']]},
    {title:'📝 PENDAFTARAN / RAWAT JALAN',hint:'Registrasi, check-in, booking, dan antrean rawat jalan.',items:[['loket','Pendaftaran / Loket'],['rawatjalan','Petugas Rawat Jalan']]},
    {title:'👨‍⚕️ DOKTER',hint:'Dokter poli dan dokter unit pelayanan khusus.',items:[['dokter.umum','dr. Andi — Poli Umum'],['dokter.anak','dr. Maria — Poli Anak'],['dokter.gigi','drg. Hendra — Poli Gigi'],['dokter.jantung','dr. Rudi — Poli Jantung'],['dokter.penyakitdalam','dr. Bima — Poli Penyakit Dalam'],['dokter.igd','Dokter IGD'],['dokter.ranap','Dokter Rawat Inap']]},
    {title:'👩‍⚕️ PERAWAT / ASISTEN',hint:'Asisten screening poli, perawat IGD, dan perawat rawat inap.',items:[['asisten.umum','Asisten Poli Umum'],['asisten.anak','Asisten Poli Anak'],['asisten.gigi','Asisten Poli Gigi'],['asisten.jantung','Asisten Poli Jantung'],['asisten.penyakitdalam','Asisten Poli Penyakit Dalam'],['perawat.igd','Perawat IGD'],['perawat.ranap','Perawat Rawat Inap']]},
    {title:'💊 FARMASI',hint:'Pelayanan obat berdasarkan resep dari dokter.',items:[['farmasi.rajal','Farmasi Rawat Jalan'],['farmasi.igd','Farmasi IGD'],['farmasi.ranap','Farmasi Rawat Inap']]},
    {title:'🧪 LABORATORIUM',hint:'Penerimaan permintaan pemeriksaan dan input hasil.',items:[['lab','Petugas Laboratorium']]},
    {title:'🧾 KASIR',hint:'Billing dan pembayaran sesuai unit pelayanan.',items:[['kasir.rajal','Kasir Rawat Jalan'],['kasir.igd','Kasir IGD'],['kasir.ranap','Kasir Rawat Inap']]}
  ];
  const patients=[['pasien.demo1','👤 Andi Pratama'],['pasien.demo2','👤 Sari Wulandari'],['pasien.demo3','👤 Budi Setiawan'],['pasien.demo4','👤 Rina Maharani'],['pasien.demo5','👤 Dimas Saputra']];
  const make=function(items){return items.map(function(item){const uname=item[0],label=item[1],u=Store.data.users.find(function(x){return x.username===uname;});if(!u)return '';return '<button type="button" class="chip" data-username="'+uname+'" data-password="'+u.password+'">'+label+'</button>';}).join('');};
  const staffHtml=sections.map(function(sec){return '<div class="login-demo-section"><div class="login-demo-title">'+sec.title+'</div><div class="login-demo-hint">'+sec.hint+'</div><div class="chip-row">'+make(sec.items)+'</div></div>';}).join('');
  return staffHtml+'<div class="login-demo-section patient-demo-section"><div class="login-demo-title">👥 PASIEN DEMO</div><div class="login-demo-hint">5 akun pasien fiktif untuk menguji booking, QR/check-in, antrean, notifikasi, dan riwayat kontrol.</div><div class="chip-row">'+make(patients)+'</div></div>';
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

function getPatientActiveVisit(patientId){
  const activeStatuses=['menunggu_screening','screening','menunggu_dokter','dipanggil','diperiksa','menunggu_lab','menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap'];
  const list=visitsToday().filter(function(v){return v.patientId===patientId && v.unit==='rawat-jalan' && activeStatuses.includes(v.status);});
  return list.sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);})[0] || null;
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
  const v=getPatientActiveVisit(u.patientId); if(!v) return;
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
function patientBookingWindowValid(tanggal){
  const today=todayStr(), max=addDaysISODate(today,3);
  return tanggal>=today && tanggal<=max;
}
function patientBookings(patientId){
  return Store.data.bookings.filter(function(b){return b.patientId===patientId;}).sort(function(a,b){return b.tanggalKontrol.localeCompare(a.tanggalKontrol)||a.noAntrian.localeCompare(b.noAntrian);});
}
function renderPatientBooking(){
  setPageTitle('Rawat Jalan');
  const u=Session.currentUser, p=getPatient(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const today=todayStr(), max=addDaysISODate(today,3);
  const poliOptions=Store.data.poli.filter(function(x){return x.official===true;}).sort(function(a,b){return a.layanan.localeCompare(b.layanan)||a.nama.localeCompare(b.nama);}).map(function(x){return '<option value="'+x.id+'">'+esc(x.layanan)+' — '+esc(x.nama)+'</option>';}).join('');
  document.getElementById('main-content').innerHTML=
    pageIntro('Pendaftaran Rawat Jalan online untuk pasien. Booking tersedia mulai hari ini sampai maksimal H-3. Pembayaran tidak dilakukan di aplikasi pasien; konfirmasi kedatangan dan administrasi pembayaran dilakukan di loket rumah sakit saat QR/barcode diverifikasi.')+
    '<div class="panel"><div class="panel-head"><div><h2>📅 Pendaftaran Rawat Jalan</h2><div class="hint">Satu aplikasi untuk Rawat Jalan Reguler dan Eksekutif.</div></div></div><div class="panel-body">'+
    '<form id="patient-booking-form">'+
    '<div class="field"><label>Jenis Layanan</label><select id="pb-layanan"><option value="Poliklinik Spesialis">Rawat Jalan Reguler</option><option value="Poliklinik Eksekutif">Rawat Jalan Eksekutif</option></select></div>'+ 
    '<div class="field"><label>Poli / Klinik</label><select id="pb-poli" required>'+poliOptions+'</select></div>'+ 
    '<div class="field"><label>Tanggal Kunjungan</label><input type="date" id="pb-tanggal" min="'+today+'" max="'+max+'" value="'+max+'" required><div class="hint">Booking dibuka maksimal 3 hari sebelum kunjungan.</div></div>'+ 
    '<div class="field"><label>Penjamin</label><select id="pb-penjamin"><option value="BPJS">JKN / BPJS</option><option value="Umum">Umum</option><option value="Asuransi">Asuransi</option></select></div>'+ 
    '<div id="pb-asuransi" class="field hidden"><label>Nama Asuransi</label><input id="pb-asuransi-name" placeholder="Masukkan nama perusahaan asuransi"></div>'+ 
    '<div class="alert alert-info">Pembayaran <strong>tidak dilakukan melalui aplikasi</strong>. Setelah datang ke rumah sakit, pasien melakukan konfirmasi kedatangan dengan scan QR/barcode di loket. Petugas kemudian memproses administrasi dan pembayaran sesuai penjamin.</div>'+ 
    '<button class="btn btn-primary btn-block" type="submit">Buat Booking &amp; Nomor Antrean</button></form></div></div>';
  const layanan=document.getElementById('pb-layanan'), poli=document.getElementById('pb-poli'), pen=document.getElementById('pb-penjamin'), as=document.getElementById('pb-asuransi');
  function filterPoli(){ const want=layanan.value; const current=poli.value; const opts=Store.data.poli.filter(function(x){return x.layanan===want;}).sort(function(a,b){return a.nama.localeCompare(b.nama);}).map(function(x){return '<option value="'+x.id+'">'+esc(x.nama)+'</option>';}).join(''); poli.innerHTML=opts; if(Store.data.poli.some(function(x){return x.id===current&&x.layanan===want;})) poli.value=current; }
  layanan.addEventListener('change',filterPoli); filterPoli();
  pen.addEventListener('change',function(){as.classList.toggle('hidden',pen.value!=='Asuransi');});
  document.getElementById('patient-booking-form').addEventListener('submit',function(e){e.preventDefault(); submitPatientBooking();});
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
  setPageTitle('Riwayat Kontrol');
  const u=Session.currentUser, p=getPatient(u.patientId);
  if(!p){document.getElementById('main-content').innerHTML='<div class="empty">Data pasien tidak ditemukan.</div>';return;}
  const list=patientVisits(p.id).filter(function(v){return v.diagnosis || v.catatan || v.vital || v.screening;}).sort(function(a,b){return new Date(b.tanggal||b.createdAt)-new Date(a.tanggal||a.createdAt);});
  document.getElementById('main-content').innerHTML=
    pageIntro('Riwayat kontrol Anda. Informasi yang ditampilkan dibatasi untuk menjaga privasi.')+
    '<section class="panel"><div class="panel-head"><div><h2>📋 Riwayat Kontrol</h2><div class="hint">Hanya ringkasan kunjungan, tanpa membuka detail rekam medis di sisi pasien.</div></div></div><div class="panel-body">'+
    (list.length?list.map(function(v){const poli=getPoli(v.poliId);return '<div class="history-item"><div class="when">'+formatTanggalIndo(v.tanggal||v.createdAt)+'</div><div><strong>'+esc(poli.nama)+'</strong></div><div class="hint">Status: Selesai</div></div>';}).join(''):'<div class="empty"><div class="big">📋</div>Belum ada riwayat kontrol.</div>')+
    '</div></section>';
}

function submitPatientBooking(){
  const u=Session.currentUser, patientId=u.patientId, poliId=document.getElementById('pb-poli').value, tanggal=document.getElementById('pb-tanggal').value, penjamin=document.getElementById('pb-penjamin').value, asuransi=(document.getElementById('pb-asuransi-name')?.value||'').trim();
  const poli=getPoli(poliId);
  if(!poli || !patientBookingWindowValid(tanggal)){showToast('Tanggal booking harus hari ini sampai maksimal H-3.','danger');return;}
  if(penjamin==='Asuransi'&&!asuransi){showToast('Nama asuransi wajib diisi.','danger');return;}
  const existing=Store.data.bookings.find(function(b){return b.patientId===patientId&&samePoli(b.poliId,poliId)&&b.tanggalKontrol===tanggal&&['terjadwal','checked_in'].includes(b.status);});
  if(existing){showToast('Anda sudah memiliki booking aktif pada poli dan tanggal tersebut.','warning');return;}
  const kuota=totalCapacityForPoliDate(poliId,tanggal), terjadwal=Store.data.bookings.filter(function(b){return samePoli(b.poliId,poliId)&&b.tanggalKontrol===tanggal&&['terjadwal','checked_in'].includes(b.status);}).length;
  if(terjadwal>=kuota){showToast('Seluruh kapasitas sesi dokter pada poli dan tanggal tersebut sudah penuh. Silakan pilih tanggal lain.','danger');return;}
  const allocation=allocateVisitSession(poliId,tanggal,null);
  if(!allocation){showToast('Seluruh sesi dokter pada poli ini sudah penuh untuk tanggal tersebut. Silakan pilih tanggal lain.','danger');return;}
  const noAntrian=generateNoAntrian(poliId,tanggal);
  const booking={id:uid('BK'),patientId:patientId,poliId:poliId,tanggalKontrol:tanggal,jenisBayar:penjamin,sumber:'Aplikasi Pasien RS',noBpjs:'',noAntrian:noAntrian,dokterId:allocation.doctorId,sessionId:allocation.schedule&&allocation.schedule.id||null,allocationMode:allocation.reason,kodeCheckIn:'CHK'+Date.now().toString(36).toUpperCase().slice(-8),status:'terjadwal',asuransiNama:penjamin==='Asuransi'?asuransi:'',confirmedAt:null,createdAt:nowISO(),updatedAt:nowISO()};
  Store.data.bookings.push(booking); Store.save();
  pushNotification('booking','Booking Rawat Jalan berhasil',noAntrian+' — '+poli.nama+' pada '+formatTanggalIndo(tanggal),patientId,u.id);
  logAudit('patient_booking',noAntrian+' — '+getPatient(patientId).nama+' · '+poli.nama+' · '+penjamin);
  openPatientBookingTicket(booking.id, true);
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
function openPatientBookingTicket(bookingId, fresh){
  const booking=getPatientBookingById(bookingId);
  if(!booking){showToast('Tiket tidak ditemukan.','danger');return;}
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  openModal('<div class="modal-head"><div><h2>🎫 Tiket Rawat Jalan</h2><div class="hint">Tiket dapat dibuka kembali kapan saja.</div></div><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><div class="patient-ticket ticket-download-target"><span>NOMOR ANTREAN</span><strong>'+esc(booking.noAntrian)+'</strong><b>'+esc(poli.nama)+'</b><small>'+formatTanggalIndo(booking.tanggalKontrol)+' · '+esc(poli.layanan)+' · '+esc(booking.jenisBayar)+'</small><div style="margin-top:14px">'+renderQrSvg(booking.kodeCheckIn,190)+'</div><small style="margin-top:8px">Tunjukkan QR/barcode ini di loket saat Anda datang. Pembayaran dilakukan di rumah sakit.</small><div class="ticket-actions"><button class="btn btn-primary" onclick="downloadPatientTicket(\''+booking.id+'\')">⬇️ Download Tiket</button><button class="btn btn-outline" onclick="printPatientTicket(\''+booking.id+'\')">🖨️ Cetak / Simpan PDF</button></div></div></div>');
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
  ctx.fillStyle='#0e5c56'; ctx.font='700 30px Arial'; ctx.fillText('SIMRS RSUD R.T. Notopuro',80,105);
  ctx.fillStyle='#687773'; ctx.font='18px Arial'; ctx.fillText('TIKET RAWAT JALAN',80,145);
  ctx.fillStyle='#263b37'; ctx.font='700 72px monospace'; ctx.fillText(booking.noAntrian,80,245);
  ctx.font='700 30px Arial'; ctx.fillText(poli.nama,80,300);
  ctx.font='20px Arial'; ctx.fillText(formatTanggalIndo(booking.tanggalKontrol)+' · '+poli.layanan,80,340);
  ctx.fillText('Pasien: '+p.nama,80,380);
  ctx.fillText('Penjamin: '+booking.jenisBayar,80,415);
  const img=new Image(); const blob=new Blob([svg],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob);
  img.onload=function(){ctx.drawImage(img,335,475,230,230);URL.revokeObjectURL(url);ctx.fillStyle='#687773';ctx.font='18px monospace';ctx.textAlign='center';ctx.fillText(booking.kodeCheckIn,450,750);ctx.font='18px Arial';ctx.fillText('Tunjukkan QR/barcode ini saat check-in di loket.',450,805);ctx.fillText('Simpan tiket ini di ponsel Anda.',450,840);ctx.textAlign='left';const a=document.createElement('a');a.download='Tiket-'+booking.noAntrian+'-'+booking.tanggalKontrol+'.png';a.href=canvas.toDataURL('image/png');a.click();showToast('Tiket berhasil diunduh.','success');};
  img.onerror=function(){URL.revokeObjectURL(url);showToast('Tiket gagal diunduh. Silakan coba lagi.','danger');}; img.src=url;
}
function printPatientTicket(bookingId){
  const booking=getPatientBookingById(bookingId); if(!booking)return;
  const p=getPatient(booking.patientId), poli=getPoli(booking.poliId);
  printArea('<div style="max-width:420px;margin:30px auto;text-align:center;font-family:Arial,sans-serif"><h2>SIMRS RSUD R.T. Notopuro</h2><h3>Tiket Rawat Jalan</h3><div style="font-size:64px;font-weight:800;font-family:monospace">'+esc(booking.noAntrian)+'</div><h3>'+esc(poli.nama)+'</h3><p>'+formatTanggalIndo(booking.tanggalKontrol)+' · '+esc(poli.layanan)+'</p><p>Pasien: '+esc(p.nama)+'</p><div style="margin:20px auto;width:190px">'+renderQrSvg(booking.kodeCheckIn,190)+'</div><p>'+esc(booking.kodeCheckIn)+'</p><p>Tunjukkan QR/barcode ini saat check-in di loket.</p></div>');
}

function renderPatientDashboard(){
  setPageTitle('Dashboard Pasien');
  const u=Session.currentUser, p=getPatient(u.patientId), v=getPatientActiveVisit(u.patientId);
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
  const journeyHtml=v?'<section class="panel"><div class="panel-head"><div><h2>📍 Perjalanan Anda</h2><div class="hint">Anda boleh meninggalkan area tunggu sementara, tetapi tetap pantau status ini.</div></div></div><div class="panel-body"><div class="patient-flow">'+patientFlow(v)+'</div></div></section>':'';
  document.getElementById('main-content').innerHTML=
    '<div class="patient-hero ops-hero"><div><div class="ops-eyebrow">PATIENT EXPERIENCE</div><h2>Halo, '+esc(p.nama)+'</h2><p>RM '+esc(p.id)+' · Dashboard hanya menampilkan informasi pelayanan milik Anda.</p></div><div><span class="badge badge-sage">Privasi Aktif</span></div></div>'+liveHtml+
    '<div class="ops-grid-main"><section class="panel"><div class="panel-head"><div><h2>🎫 Tiket Aktif</h2><div class="hint">Tiket dapat dibuka kembali tanpa screenshot.</div></div></div><div class="panel-body">'+ticketHtml+'</div></section>'+
    '<section class="panel"><div class="panel-head"><div><h2>🔔 Notifikasi Antrean</h2><div class="hint">Pasien diberi tahu saat antrean mendekati nomor Anda.</div></div></div><div class="panel-body"><div class="ops-alert '+(v&&getPatientQueueState(v).ahead<=3?'warning':'')+'"><span class="ops-alert-icon">🔔</span><div><strong>Notifikasi 3 pasien sebelum giliran</strong><div>Ketika nomor Anda dipanggil, indikator akan berubah menjadi hijau agar Anda segera masuk ke poli.</div></div></div><div style="margin-top:12px"><button class="btn btn-primary" id="btn-patient-notif">'+(permission==='granted'?'✓ Notifikasi HP Aktif':'🔔 Aktifkan Notifikasi HP')+'</button></div></div></section></div>'+
    journeyHtml;
  const nb=document.getElementById('btn-patient-notif'); if(nb) nb.addEventListener('click',enablePatientNotifications);
  maybeNotifyPatientQueue();
  if(window.__patientPoll) clearInterval(window.__patientPoll);
  window.__patientPoll=setInterval(function(){ if(Session.currentUser && Session.currentUser.role==='pasien' && currentRoute()==='pasien-dashboard'){ maybeNotifyPatientQueue(); renderPatientDashboard(); } },15000);
}
function kpiPatient(icon,label,value,sub){ return '<div class="ops-kpi"><div class="ops-kpi-icon">'+icon+'</div><div><div class="ops-kpi-label">'+label+'</div><div class="ops-kpi-value">'+value+'</div><div class="ops-kpi-sub">'+sub+'</div></div></div>'; }
function patientFlow(v){
  const steps=[['BOOKED','Booking'],['CHECKED','Check-in'],['SCREEN','Screening'],['DOCTOR','Dokter'],['NEXT','Tindak lanjut']];
  const idx=v.status==='menunggu_screening'?2:v.status==='screening'?2:['menunggu_dokter','dipanggil','diperiksa'].includes(v.status)?3:['menunggu_penunjang','menunggu_review','menunggu_farmasi','menunggu_bayar','obat_siap'].includes(v.status)?4:v.status==='selesai'?4:1;
  return steps.map(function(s,i){return '<div class="patient-flow-step '+(i<idx?'done ':i===idx?'active ':'')+'"><span>'+(i<idx?'✓':i+1)+'</span><div><strong>'+s[1]+'</strong><small>'+s[0]+'</small></div></div>';}).join('');
}
function enablePatientNotifications(){
  if(!('Notification' in window)){ showToast('Browser ini tidak mendukung notifikasi sistem','warning'); return; }
  Notification.requestPermission().then(function(permission){ if(permission==='granted'){ showToast('Notifikasi HP aktif','success'); maybeNotifyPatientQueue(); renderPatientDashboard(); } else showToast('Izin notifikasi belum diberikan','warning'); });
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
  const visits = visitsToday().filter(v=>samePoli(v.poliId,u.poliId));
  const menunggu = visits.filter(v=>['menunggu_dokter','dipanggil'].includes(v.status)).sort((a,b)=> (b.prioritas?1:0)-(a.prioritas?1:0) || (queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999));
  const urgentCount = menunggu.filter(v=>v.prioritas).length;
  const hasilLabSiap = visits.filter(v=>v.status==='diperiksa' && v.labRequest && v.labRequest.status==='selesai').length;
  const bookingHariIni = Store.data.bookings.filter(b=>samePoli(b.poliId,u.poliId) && b.tanggalKontrol===todayStr());

  let html = '<h3 style="color:var(--ink-soft);margin-bottom:10px">🩺 Rawat Jalan — '+esc(getPoli(u.poliId).nama)+'</h3>'+
    '<div class="grid grid-3">'+
      statCard('Siap Diperiksa', menunggu.length, urgentCount>0 ? urgentCount+' prioritas 🚩' : 'setelah screening')+
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
      '<div class="action-card" data-nav="rekam-medis"><span class="ic">📋</span><span class="lbl">Rekam Medis</span></div>'+
      '<div class="action-card" data-nav="riwayat-dokter"><span class="ic">🕘</span><span class="lbl">Riwayat</span></div>'+
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
  const visit={id:uid('VIS'),patientId:b.patientId,poliId:b.poliId,unit:'rawat-jalan',tanggal:todayStr(),noAntrian:b.noAntrian,status:'menunggu_screening',prioritas:false,keluhan:'',dokterId:b.dokterId||null,sessionId:b.sessionId||null,allocationMode:b.allocationMode||'booking',workflow:{checkInAt:nowISO()},createdAt:nowISO(),updatedAt:nowISO()};
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
    '<div class="panel"><div class="panel-head"><h2>Buat Kunjungan — '+esc(patient.nama)+' <span class="mono" style="font-weight:400;color:var(--ink-soft);font-size:13px">('+patient.id+')</span></h2></div>'+
    '<div class="panel-body">'+
      (patient.alergi ? '<div class="allergy-flag">⚠ Riwayat alergi: '+esc(patient.alergi)+'</div>' : '')+
      '<form id="form-kunjungan"><div class="field-row">'+
        '<div class="field"><label>Poli Tujuan</label><select id="kj-poli" required>'+Store.data.poli.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+' — '+formatRupiah(p.biaya)+'</option>').join('')+'</select></div>'+
        '<div class="field"><label>Dokter / Sesi Praktik</label><select id="kj-dokter" required></select></div>'+
        '<div class="field"><label>Jenis Pembayaran</label><select id="kj-bayar" required><option value="Umum">Umum (Bayar Sendiri)</option><option value="BPJS">BPJS Kesehatan</option><option value="Asuransi">Asuransi Swasta</option></select></div>'+
      '</div><div class="field"><label>Keluhan Utama</label><textarea id="kj-keluhan" required placeholder="contoh: Demam sejak 2 hari, batuk pilek"></textarea></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="kj-prioritas"><label for="kj-prioritas" style="margin:0">🚩 Tandai prioritas / kondisi gawat darurat (didahulukan di antrian)</label></div>'+
      '<button type="submit" class="btn btn-primary">Daftarkan &amp; Ambil Nomor Antrian</button> <button type="button" class="btn btn-ghost" id="btn-batal-kunjungan">Batal</button></form>'+
      '<div id="tiket-area"></div></div></div>';
  document.getElementById('form-kunjungan').addEventListener('submit', submitKunjungan);
  const kjPoli=document.getElementById('kj-poli'), kjDok=document.getElementById('kj-dokter');
  function refreshKjDoctors(){const list=getDoctorSchedulesForDate(kjPoli.value,todayStr()); kjDok.innerHTML='<option value="AUTO">⚡ Otomatis — sistem memilih sesi yang masih tersedia</option>'+list.map(sc=>{const d=Store.data.users.find(u=>u.id===sc.doctorId)||doctorMasterById(sc.doctorId);return d?'<option value="'+d.id+'">'+esc(d.nama)+' · '+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+' · '+esc(sc.ruang||'')+'</option>':'';}).join('');}
  kjPoli.addEventListener('change',refreshKjDoctors); refreshKjDoctors();
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
  const preferred=preferredDoctorId?list.filter(function(sc){return sc.doctorId===preferredDoctorId;}):[];
  const pool=preferred.length?preferred:list;
  // Jika dokter pilihan masih punya kapasitas, hormati pilihan. Jika penuh,
  // sistem mencari sesi lain pada poli yang sama secara kronologis.
  for(const sc of pool){ const load=queueLoadForSession(poliId,dateStr,sc.id); if(load.total<sessionCapacity(sc)) return {schedule:sc,doctorId:sc.doctorId,reason:preferred.length?'preferred':'auto'}; }
  if(preferred.length){
    for(const sc of list){ if(sc.doctorId===preferredDoctorId) continue; const load=queueLoadForSession(poliId,dateStr,sc.id); if(load.total<sessionCapacity(sc)) return {schedule:sc,doctorId:sc.doctorId,reason:'overflow'}; }
  }
  return {schedule:null,doctorId:null,reason:'full'};
}
function generateNoAntrian(poliId,dateStr){
  dateStr=dateStr||todayStr(); const key=canonicalPoliId(poliId)+'-'+dateStr;
  const n=(Store.data.meta.queueCounters[key]||0)+1; Store.data.meta.queueCounters[key]=n;
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
    id: uid('KJ'), patientId, tanggal: todayStr(), poliId, dokterId:effectiveDoctorId, sessionId:schedule&&schedule.id||null, allocationMode:allocation.reason, jenisBayar, noBpjs, noAntrian, keluhan,
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
  printArea('<div style="text-align:center;font-family:monospace;max-width:300px;margin:0 auto"><h2>RSUD R.T. NOTOPURO</h2><p>Nomor Antrian</p>'+
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
    '<div class="field-row">'+
      '<div class="field"><label>Poli Tujuan</label><select id="bk-poli" required>'+Store.data.poli.map(p=>'<option value="'+p.id+'">'+esc(p.nama)+'</option>').join('')+'</select></div>'+
      '<div class="field"><label>Dokter / Sesi Praktik</label><select id="bk-dokter" required></select></div>'+
      '<div class="field"><label>Tanggal Kontrol</label><input type="date" id="bk-tanggal" min="'+dateOffset(0)+'" max="'+dateOffset(7)+'" value="'+dateOffset(1)+'" required></div>'+
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
  const bkPoli=document.getElementById('bk-poli'), bkDate=document.getElementById('bk-tanggal'), bkDok=document.getElementById('bk-dokter');
  function refreshBkDoctors(){const list=getDoctorSchedulesForDate(bkPoli.value,bkDate.value); bkDok.innerHTML='<option value="AUTO">⚡ Otomatis — sistem memilih dokter/sesi yang masih tersedia</option>'+list.map(sc=>{const d=Store.data.users.find(u=>u.id===sc.doctorId)||doctorMasterById(sc.doctorId);return d?'<option value="'+d.id+'">'+esc(d.nama)+' · '+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+' · '+esc(sc.ruang||'')+'</option>':'';}).join('');}
  bkPoli.addEventListener('change',refreshBkDoctors); bkDate.addEventListener('change',refreshBkDoctors); refreshBkDoctors();
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
  const preferredDoctorId = dokterId && dokterId!=='AUTO' ? dokterId : null;
  const allocation=allocateVisitSession(poliId,tanggalKontrol,preferredDoctorId);
  if(!allocation){showToast('Seluruh sesi dokter pada poli ini sudah penuh untuk tanggal tersebut. Silakan pilih tanggal lain.','danger');return;}
  const schedule = allocation.schedule;
  const assignedDoctorId = allocation.doctorId;
  const noAntrian = generateNoAntrian(poliId,tanggalKontrol);
  const booking = {
    id: uid('BK'), patientId: bookingSearchPatientId, poliId, tanggalKontrol, jenisBayar,
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
    id: uid('KJ'), patientId: booking.patientId, tanggal: todayStr(), poliId: booking.poliId, dokterId:null,
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
    const pesan = 'Halo '+p.nama+', mengingatkan jadwal kontrol Anda besok ('+formatTanggalIndo(b.tanggalKontrol)+') di '+poli.nama+' RSUD R.T. Notopuro, nomor antrian '+b.noAntrian+'. Mohon datang tepat waktu. Terima kasih.';
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
    serviceChooser+poliSelector+'<div id="rj-doctor-session-dashboard"></div>'+'<div id="rj-kpi-area"></div><div id="rj-queue-control-area"></div>'+renderRawatJalanPatientJourney(poliState.poliId)+
    '<div class="rj-work-grid"><div><div class="panel"><div class="panel-head"><div><h2 id="poli-queue-title">Antrian Rawat Jalan</h2><div class="hint">Status pasien ditampilkan per tahap agar petugas tahu apa yang harus dikerjakan berikutnya.</div></div></div><div class="panel-body" id="poli-queue-area"></div></div></div><div id="poli-exam-area"><div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien untuk screening atau pemeriksaan.</div></div></div></div></div>'+renderRawatJalanAlerts(poliState.poliId)+
    '<div class="grid grid-2"><div class="panel" id="poli-jadwal-panel"></div><div class="panel" id="poli-info-panel"></div></div>';
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
  const u=Session.currentUser; if(!u||!['dokter','admin'].includes(u.role)){showToast('Panggilan antrean dokter hanya dapat dilakukan oleh akun dokter atau admin.','danger');return;}
  const active=visitsToday().find(v=>samePoli(v.poliId,poliId)&&v.status==='diperiksa'&&(!u||u.role!=='dokter'||v.dokterId===u.id));
  if(active){showToast('Masih ada pasien yang sedang diperiksa ('+active.noAntrian+'). Selesaikan pasien tersebut terlebih dahulu.','warning');return;}
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
  const u=Session.currentUser; if(!u||!['dokter','admin'].includes(u.role))return '';
  const active=visitsToday().filter(v=>samePoli(v.poliId,poliId)&&v.status==='diperiksa').sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0]||null;
  const called=visitsToday().filter(v=>samePoli(v.poliId,poliId)&&v.status==='dipanggil').sort((a,b)=>new Date(b.queueCalledAt||b.updatedAt||b.createdAt)-new Date(a.queueCalledAt||a.updatedAt||a.createdAt))[0]||null;
  const next=queueCandidates(poliId)[0]||null;
  let body='<div class="queue-control-actions"><div class="ops-alert"><strong>Berikutnya: '+(next?esc(next.noAntrian):'—')+'</strong><div>'+(next?esc(getPatient(next.patientId).nama):'Belum ada pasien siap dipanggil.')+'</div></div>';
  if(!active&&!called) body+='<button class="btn btn-primary" id="btn-queue-call-next">▶️ Panggil Berikutnya</button>';
  if(called) body+='<button class="btn btn-primary" id="btn-queue-open-called">🟢 Mulai Pemeriksaan</button><button class="btn btn-outline" id="btn-queue-recall">↩️ Panggil Ulang</button><button class="btn btn-ghost" id="btn-queue-pause">⏸️ Tunda</button>';
  if(active) body+='<button class="btn btn-outline" id="btn-queue-recall">↩️ Panggil Ulang</button><button class="btn btn-ghost" id="btn-queue-pause">⏸️ Tunda</button><button class="btn btn-primary" id="btn-queue-finish-next">✅ Selesaikan Pemeriksaan &amp; Panggil Berikutnya</button>';
  return '<section class="panel queue-control-panel"><div class="panel-head"><div><div class="ops-eyebrow">ANTREAN POLI · '+esc(getPoli(poliId)?.nama||poliId)+'</div><h2>🔄 Kontrol Antrean</h2><div class="hint">Kontrol ini otomatis mengikuti poli akun yang sedang aktif. Berlaku untuk seluruh poli.</div></div><span class="badge '+(active?'badge-clinical':called?'badge-sage':'badge-slate')+'">'+(active?'Sedang Diperiksa':called?'Dipanggil':'Siap')+'</span></div><div class="panel-body">'+body+'</div></section>';
}
function bindQueueControlPanel(){
  const call=document.getElementById('btn-queue-call-next'); if(call)call.addEventListener('click',()=>callNextPatient(poliState.poliId));
  const open=document.getElementById('btn-queue-open-called'); if(open){open.addEventListener('click',()=>{const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&v.status==='dipanggil');if(v)bukaPeriksa(v.id);});}
  const recall=document.getElementById('btn-queue-recall'); if(recall){recall.addEventListener('click',()=>{const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&['dipanggil','diperiksa'].includes(v.status));if(v)recallPatient(v.id);});}
  const pause=document.getElementById('btn-queue-pause'); if(pause){pause.addEventListener('click',()=>{const v=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&['dipanggil','diperiksa'].includes(v.status));if(v)pausePatient(v.id);});}
  const finish=document.getElementById('btn-queue-finish-next'); if(finish)finish.addEventListener('click',function(){const active=visitsToday().find(v=>samePoli(v.poliId,poliState.poliId)&&v.status==='diperiksa');if(!active)return;const p=getPatient(active.patientId),source=Session.currentUser.role==='perawat'||Session.currentUser.role==='rawat_jalan'?'perawat':'dokter';openModal('<div class="modal-head"><h2>Konfirmasi Penyelesaian</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p>Apakah pemeriksaan pasien <strong>'+esc(p.nama)+'</strong> dengan nomor <strong>'+esc(active.noAntrian)+'</strong> sudah selesai?</p><div class="alert alert-info">Setelah dikonfirmasi, sistem akan menyelesaikan pasien ini dan otomatis memanggil antrean berikutnya pada poli yang sama.</div><button class="btn btn-primary btn-block" id="btn-confirm-queue-finish">Ya, Selesaikan &amp; Panggil Berikutnya</button></div>');document.getElementById('btn-confirm-queue-finish').addEventListener('click',function(){closeModal();finishQueueAndCallNext(active.id,source);});});
}

function openScreening(visitId){
  const v=getVisit(visitId); if(!v)return; const p=getPatient(v.patientId); if(!p)return;
  openModal('<div class="modal-head"><h2>🩺 Screening Awal — '+esc(p.nama)+'</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p class="hint">Data screening akan diteruskan ke dokter agar pasien tidak perlu diukur ulang.</p><div class="field-row"><div class="field"><label>Tekanan Darah</label><input id="scr-td" placeholder="120/80"></div><div class="field"><label>Nadi</label><input id="scr-nadi" type="number" placeholder="80"></div></div><div class="field-row"><div class="field"><label>Suhu °C</label><input id="scr-suhu" type="number" step="0.1" placeholder="36.7"></div><div class="field"><label>SpO₂ %</label><input id="scr-spo2" type="number" placeholder="98"></div></div><div class="field-row"><div class="field"><label>Berat Badan kg</label><input id="scr-bb" type="number" step="0.1"></div><div class="field"><label>Tinggi Badan cm</label><input id="scr-tb" type="number" step="0.1"></div></div><div class="field"><label>Keluhan Utama / Screening</label><textarea id="scr-keluhan">'+esc(v.keluhan||'')+'</textarea></div><div class="field"><label>Alergi</label><input id="scr-alergi" value="'+esc(p.alergi||'')+'" placeholder="Tidak diketahui / sebutkan bila ada"></div><button class="btn btn-primary btn-block" id="btn-save-screening">Simpan Screening & Kirim ke Dokter</button></div>');
  document.getElementById('btn-save-screening').addEventListener('click',function(){
    v.screening={td:document.getElementById('scr-td').value.trim(),nadi:document.getElementById('scr-nadi').value,suhu:document.getElementById('scr-suhu').value,spo2:document.getElementById('scr-spo2').value,bb:document.getElementById('scr-bb').value,tb:document.getElementById('scr-tb').value,keluhan:document.getElementById('scr-keluhan').value.trim(),alergi:document.getElementById('scr-alergi').value.trim(),by:Session.currentUser.nama,at:nowISO()};
    v.vital=v.screening; v.workflow=v.workflow||{}; v.workflow.screeningAt=nowISO();
    v.status='menunggu_dokter';
    v.updatedAt=nowISO();
    if(v.communication===undefined)v.communication=[]; v.communication.push({type:'screening',message:'Screening selesai dan data diteruskan ke dokter.',createdAt:nowISO(),by:Session.currentUser.nama});
    Store.save(); logAudit('screening_selesai',v.noAntrian+' — '+getPatient(v.patientId).nama);
    pushNotification('queue','Pasien siap diperiksa',v.noAntrian+' — screening selesai dan pasien menunggu panggilan dokter.',v.patientId);
    closeModal(); refreshPoliQueue(); refreshQueueControlPanel(); if(window.__rjRerender)window.__rjRerender(); showToast('Screening selesai — pasien masuk antrean dokter','success');
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
  if(u.role==='dokter') allowed=['menunggu_dokter','dipanggil','menunggu_review','menunggu_poli','screening'];
  else if(u.role==='rawat_jalan') allowed=['menunggu_screening','screening','menunggu_dokter','dipanggil','menunggu_review','menunggu_lab','menunggu_penunjang','diperiksa'];
  else allowed=['menunggu_screening','screening','menunggu_dokter','dipanggil','diperiksa','menunggu_review','menunggu_lab','menunggu_penunjang'];
  const list=visitsToday().filter(v=>samePoli(v.poliId,poliState.poliId)&&allowed.includes(v.status)).sort((a,b)=>(b.prioritas?1:0)-(a.prioritas?1:0)||new Date(a.createdAt)-new Date(b.createdAt));
  const area=document.getElementById('poli-queue-area'); if(!area)return;
  if(!list.length){area.innerHTML='<div class="empty"><div class="big">✓</div>Tidak ada pasien pada tahap yang perlu ditangani.</div>';return;}
  area.innerHTML=list.map(v=>{
    const p=getPatient(v.patientId), age=v.workflow&&v.workflow.screeningAt?Math.max(0,Math.round((Date.now()-new Date(v.workflow.screeningAt).getTime())/60000)):Math.max(0,Math.round((Date.now()-new Date(v.createdAt).getTime())/60000));
    let action='';
    if(['rawat_jalan','perawat'].includes(u.role) && ['menunggu_screening','screening'].includes(v.status)) action='<button class="btn btn-primary btn-sm" data-screening="'+v.id+'">🩺 Screening</button>';
    else if(u.role==='dokter' && ['menunggu_dokter','dipanggil','menunggu_review','menunggu_poli','screening'].includes(v.status)) action=v.status==='screening'?'<span class="badge badge-amber">⏳ Screening berjalan</span>':'<button class="btn btn-primary btn-sm" data-openvisit="'+v.id+'">'+(v.status==='dipanggil'?'🟢 Mulai Pemeriksaan':'Buka')+'</button>';
    else if(u.role==='admin' && ['menunggu_screening','screening'].includes(v.status)) action='<button class="btn btn-primary btn-sm" data-screening="'+v.id+'">Screening</button>';
    return '<div class="rj-queue-item '+(v.prioritas?'urgent':'')+'"><div><div class="rj-q-top"><span class="rj-q-no">'+esc(v.noAntrian)+'</span>'+badgeStatus(v.status)+'</div><strong>'+esc(p.nama)+'</strong><div class="hint">RM '+esc(p.id)+' · '+age+' menit dalam tahap aktif'+(v.prioritas?' · 🚩 prioritas':'')+'</div></div><div class="rj-q-actions">'+action+'<button class="btn btn-ghost btn-sm" data-history="'+v.patientId+'">Riwayat</button></div></div>';
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
  if(!['menunggu_dokter','dipanggil','menunggu_review','menunggu_poli'].includes(visit.status)){ showToast('Pasien belum siap untuk pemeriksaan.','warning'); return; }
  visit.status='diperiksa'; visit.workflow=visit.workflow||{}; visit.workflow.doctorStartAt=nowISO(); visit.updatedAt=nowISO();
  Store.save(); refreshPoliQueue(); if(window.__rjRerender)window.__rjRerender(); poliState.resepItems=[]; renderFormPeriksa(visit);
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
      '<div class="field"><label>Rencana / Next Step</label><select id="px-next-step"><option value="selesai" '+(nextStepValue==='selesai'?'selected':'')+'>Selesai / Pulang</option><option value="farmasi" '+(nextStepValue==='farmasi'?'selected':'')+'>Resep → Farmasi Rawat Jalan</option><option value="kontrol" '+(nextStepValue==='kontrol'?'selected':'')+'>Jadwal Kontrol</option><option value="penunjang" '+(nextStepValue==='penunjang'?'selected':'')+'>Pemeriksaan Penunjang</option><option value="ranap" '+(nextStepValue==='ranap'?'selected':'')+'>Admisi Rawat Inap</option><option value="rujuk" '+(nextStepValue==='rujuk'?'selected':'')+'>Rujuk Keluar</option></select></div>'+
      '<div class="field checkbox-row"><input type="checkbox" id="px-rujuk-lab" '+(visit.labRequest?'checked disabled':'')+'><label for="px-rujuk-lab" style="margin:0">Rujuk ke Laboratorium / Penunjang</label></div>'+
      '<div class="field hidden" id="px-lab-jenis-wrap"><label>Jenis Pemeriksaan</label><input type="text" id="px-lab-jenis" placeholder="contoh: Darah Lengkap, Rontgen Thorax"></div>'+
      '<div id="px-resep-section">'+resepSectionHtml()+'</div>'+
      '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-outline" id="btn-simpan-draft-periksa">💾 Simpan Data Pemeriksaan</button><button type="submit" class="btn btn-primary">✅ Selesaikan Pemeriksaan &amp; Panggil Berikutnya</button>'+
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
  document.getElementById('btn-simpan-draft-periksa').addEventListener('click', function(){ simpanDraftPeriksa(visit.id); });
  document.getElementById('form-periksa').addEventListener('submit', function(e){ e.preventDefault();
    openModal('<div class="modal-head"><h2>Konfirmasi Penyelesaian</h2><button class="btn btn-ghost btn-icon" onclick="closeModal()">✕</button></div><div class="modal-body"><p>Apakah pemeriksaan pasien <strong>'+esc(patient.nama)+'</strong> dengan nomor <strong>'+esc(visit.noAntrian)+'</strong> sudah selesai?</p><div class="alert alert-info">Setelah dikonfirmasi, sistem akan memperbarui status pasien dan otomatis memanggil pasien berikutnya.</div><button class="btn btn-primary btn-block" id="btn-confirm-finish-next">Ya, Selesaikan &amp; Panggil Berikutnya</button></div>');
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
  const vital=v.vital||v.screening||{};
  return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.updatedAt||v.createdAt)+' &middot; '+esc(poli.nama)+' &middot; '+badgeStatus(v.status)+'</div>'+
    '<div style="margin-top:4px"><strong>Dokter:</strong> '+esc((getUserById(v.dokterId)||{}).nama||'-')+'</div>'+
    '<div><strong>Keluhan:</strong> '+esc(v.keluhan||'-')+'</div>'+
    '<div><strong>Diagnosis:</strong> '+esc(v.diagnosis||'-')+'</div>'+
    (v.catatan ? '<div><strong>Catatan/Tindakan:</strong> '+esc(v.catatan)+'</div>' : '')+
    ((vital.td||vital.nadi||vital.suhu||vital.rr||vital.bb||vital.tb) ? '<div><strong>Tanda vital:</strong> TD '+esc(vital.td||'-')+' · Nadi '+esc(vital.nadi||'-')+' · Suhu '+esc(vital.suhu||'-')+' °C · RR '+esc(vital.rr||'-')+' · BB '+esc(vital.bb||'-')+' kg · TB '+esc(vital.tb||'-')+' cm</div>' : '')+
    (resep ? '<div><strong>Resep:</strong> '+resep.items.map(i=>esc(i.nama)+' ×'+i.jumlah+' ('+esc(i.aturanPakai||'-')+')').join(', ')+'</div>' : '')+'</div>';
}
function simpanDraftPeriksa(visitId){
  const visit=getVisit(visitId); if(!visit)return;
  const kel=document.getElementById('px-keluhan'), td=document.getElementById('px-td'), nadi=document.getElementById('px-nadi'), suhu=document.getElementById('px-suhu'), rr=document.getElementById('px-rr'), bb=document.getElementById('px-bb'), tb=document.getElementById('px-tb'), dx=document.getElementById('px-diagnosis'), cat=document.getElementById('px-catatan'), next=document.getElementById('px-next-step');
  visit.keluhan=kel?kel.value.trim():visit.keluhan;
  visit.vital={td:td?td.value.trim():'',nadi:nadi?nadi.value:'',suhu:suhu?suhu.value:'',rr:rr?rr.value:'',bb:bb?bb.value:'',tb:tb?tb.value:''};
  visit.diagnosis=dx?dx.value.trim():visit.diagnosis;
  visit.catatan=cat?cat.value.trim():visit.catatan;
  visit.nextStep=next?next.value:visit.nextStep;
  if(!visit.diagnosis){ showToast('Diagnosis wajib diisi sebelum pasien dapat dilepas dari antrean dokter.','danger'); return; }
  visit.queueReadyToAdvance=true;
  visit.updatedAt=nowISO();
  Store.save();
  logAudit('simpan_draft_pemeriksaan',visit.noAntrian+' — '+getPatient(visit.patientId).nama);
  showToast('Data pemeriksaan tersimpan. Perawat/asisten dapat melanjutkan antrean setelah dokter menyatakan pasien selesai.','success');
  refreshPoliQueue();
}
function advanceNextPatientInQueue(completedVisit){
  const candidates=visitsToday().filter(function(v){return v.id!==completedVisit.id && samePoli(v.poliId,completedVisit.poliId) && v.unit==='rawat-jalan' && v.status==='menunggu_dokter' && (!completedVisit.dokterId || v.dokterId===completedVisit.dokterId);}).sort(function(a,b){
    return (b.prioritas?1:0)-(a.prioritas?1:0) || (queueNumberValue(a.noAntrian)||999999)-(queueNumberValue(b.noAntrian)||999999);
  });
  if(!candidates.length) return null;
  const next=candidates[0];
  next.status='dipanggil'; next.queueCalledAt=nowISO(); next.queueCallCount=(next.queueCallCount||0)+1; next.updatedAt=nowISO();
  pushNotification('queue','🟢 Silakan masuk ke poli',next.noAntrian+' — giliran Anda sekarang. Silakan menuju '+getPoli(next.poliId).nama+'.',next.patientId);
  logAudit('antrean_otomatis_berikutnya',completedVisit.noAntrian+' selesai → '+next.noAntrian+' dipanggil');
  return next;
}
function finishQueueAndCallNext(visitId, source){
  const visit=getVisit(visitId); if(!visit)return;
  if(visit.status!=='diperiksa'){showToast('Pasien ini tidak sedang diperiksa.','warning');return;}
  if(!visit.queueReadyToAdvance){
    showToast('Simpan Data Pemeriksaan terlebih dahulu agar data klinis tersimpan sebelum antrean dilanjutkan.','warning');return;
  }
  if(source==='perawat' && visit.nextStep && visit.nextStep!=='selesai'){
    showToast('Untuk rujukan Farmasi/Penunjang/Rawat Inap, dokter harus menyelesaikan dari form pemeriksaan agar alurnya tercatat lengkap.','warning');return;
  }
  const targetStep=visit.nextStep||'selesai';
  visit.status=(targetStep==='farmasi' && visit.resepId)?'menunggu_farmasi':(targetStep==='penunjang' && visit.labRequest)?'menunggu_lab':'menunggu_bayar';
  visit.nextStep=visit.status==='menunggu_farmasi'?'Farmasi Rawat Jalan':visit.status==='menunggu_lab'?'Pemeriksaan penunjang — hasil kembali ke dokter untuk review':'Billing / Kasir Rawat Jalan';
  visit.workflow=visit.workflow||{}; visit.workflow.completedAt=nowISO(); visit.queueReleasedAt=nowISO(); visit.queueReadyToAdvance=false; visit.updatedAt=nowISO();
  const next=advanceNextPatientInQueue(visit);
  Store.save();
  logAudit('selesai_dan_panggil_berikutnya',visit.noAntrian+' — '+getPatient(visit.patientId).nama+(next?' → '+next.noAntrian:''));
  refreshPoliQueue(); refreshQueueControlPanel(); if(window.__rjRerender)window.__rjRerender();
  showToast(next?'Pasien selesai — '+next.noAntrian+' otomatis dipanggil.':'Pasien selesai — belum ada pasien berikutnya.','success');
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
  visit.nextStep = document.getElementById('px-next-step') ? document.getElementById('px-next-step').value : visit.nextStep;
  visit.catatan = document.getElementById('px-catatan').value.trim();
  visit.billing.konsultasi = getPoli(visit.poliId).biaya;

  const rujukLab = document.getElementById('px-rujuk-lab').checked && !visit.labRequest;
  if(rujukLab){
    const jenis = document.getElementById('px-lab-jenis').value.trim();
    if(!jenis){ showToast('Isi jenis pemeriksaan laboratorium', 'danger'); return; }
    visit.labRequest = {jenis, status:'menunggu', hasil:null};
    visit.billing.lab = BIAYA_LAB;
    visit.status = 'menunggu_lab'; visit.nextStep='Pemeriksaan penunjang — hasil kembali ke dokter untuk review'; visit.workflow.supportingAt=nowISO();
    Store.save();
    logAudit('rujuk_lab', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' → '+jenis);
    showToast('Pasien dirujuk ke laboratorium', 'success');
  } else if(poliState.resepItems.length>0){
    const resep = {id:uid('RSP'), visitId:visit.id, items:[...poliState.resepItems], status:'menunggu', jenisLayanan:'rawat_jalan', createdAt:nowISO(), updatedAt:nowISO(), siapAt:null, diambilAt:null};
    Store.data.prescriptions.push(resep);
    visit.resepId = resep.id;
    visit.billing.obat = resep.items.reduce((s,it)=>s+it.jumlah*it.hargaSatuan,0);
    visit.status = 'menunggu_farmasi'; visit.nextStep='Farmasi Rawat Jalan';
    Store.save();
    logAudit('selesai_periksa', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · Dx: '+esc(visit.diagnosis));
    showToast('Pemeriksaan selesai — resep dikirim ke farmasi', 'success');
  } else {
    visit.status = 'menunggu_bayar'; visit.nextStep='Billing / Kasir Rawat Jalan';
    Store.save();
    logAudit('selesai_periksa', visit.noAntrian+' — '+esc(getPatient(visit.patientId).nama)+' · Dx: '+esc(visit.diagnosis));
    showToast('Pemeriksaan selesai — pasien diarahkan ke kasir', 'success');
  }
  visit.updatedAt = nowISO();
  visit.queueReadyToAdvance = false;
  visit.workflow = visit.workflow || {}; visit.workflow.completedAt = nowISO();
  const nextPatient = advanceNextPatientInQueue(visit);
  Store.save();
  poliState.activeVisitId = null;
  poliState.resepItems = [];
  refreshPoliQueue(); refreshQueueControlPanel();
  document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div>';
  if(nextPatient) showToast('Pasien '+visit.noAntrian+' selesai. Nomor '+nextPatient.noAntrian+' otomatis dipanggil.','success');
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
  visit.status = 'menunggu_review';
  visit.workflow=visit.workflow||{}; visit.workflow.reviewAt=nowISO(); visit.updatedAt=nowISO();
  visit.nextStep='Dokter meninjau hasil laboratorium';
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
  visit.status = 'menunggu_bayar'; visit.nextStep='Billing / Kasir Rawat Jalan';
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
  const bodyHtml = '<div id="invoice-content"><h3 style="text-align:center">RSUD R.T. NOTOPURO</h3><p style="text-align:center;color:var(--ink-soft);font-size:13px">Kwitansi Pembayaran'+(trx.admissionId?' — Rawat Inap':'')+'</p><hr>'+
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
  printArea('<div style="font-family:monospace;max-width:420px;margin:0 auto"><h2 style="text-align:center">RSUD R.T. NOTOPURO</h2><p style="text-align:center">Resume Medis Rawat Inap</p><hr>'+
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
  refreshPoliQueue(); refreshQueueControlPanel();
  document.getElementById('poli-exam-area').innerHTML = '<div class="panel"><div class="panel-body"><div class="empty"><div class="big">🩺</div>Pilih pasien dari antrian untuk memulai pemeriksaan.</div></div></div>';
  admisiBaruState = {patientId: visit.patientId, visitId: visit.id};
  openAdmisiBaruSheet();
  setTimeout(function(){ const d=document.getElementById('ab-diagnosis'); if(d) d.value = visit.diagnosis || ''; }, 30);
}

/* =================================================================
   MODULE: RIWAYAT PEMERIKSAAN DOKTER
   ================================================================= */
function renderRiwayatDokter(){
  setPageTitle('Riwayat Pemeriksaan');
  const u=Session.currentUser;
  const list=Store.data.visits.filter(function(v){
    return v.dokterId===u.id && (v.diagnosis || v.catatan || v.vital || v.screening);
  }).sort(function(a,b){return new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt);});
  document.getElementById('main-content').innerHTML=
    pageIntro('Riwayat pemeriksaan khusus dokter yang sedang login. '+(u.poliId?'Hanya pemeriksaan pada '+esc(getPoli(u.poliId).nama)+' yang ditangani akun ini. ':'')+'Data klinis tetap melekat pada nomor rekam medis pasien dan dapat dibuka melalui Rekam Medis.')+
    '<div class="panel"><div class="panel-head"><div><h2>🩺 Riwayat Pemeriksaan Saya</h2><div class="hint">'+list.length+' kunjungan memiliki data klinis yang sudah dicatat.</div></div></div><div class="panel-body">'+
    (list.length ? list.map(function(v){return '<div class="history-item"><div class="when">'+formatTanggalWaktu(v.updatedAt||v.createdAt)+' · '+esc(getPoli(v.poliId).nama)+' · '+esc(v.noAntrian||'-')+' · '+badgeStatus(v.status)+'</div><div><strong>'+esc(getPatient(v.patientId).nama)+'</strong> <span class="hint">· RM '+esc(getPatient(v.patientId).id)+'</span></div>'+clinicalSummaryHtml(v)+'</div>';}).join('') : '<div class="empty"><div class="big">🩺</div>Belum ada pemeriksaan yang tercatat oleh dokter ini.</div>')+
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
    '<button class="tab" data-mtab="facility">Fasilitas</button><button class="tab" data-mtab="rbac">Hak Akses</button><button class="tab" data-mtab="log">Audit Log</button></div>'+
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
  else if(tab==='rbac') renderMasterRbacTab();
  else renderMasterLogTab();
}

function renderMasterDoctorsTab(){
  const el=document.getElementById('master-tab-area');
  const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const docs=Store.data.doctors||[];
  el.innerHTML='<div class="alert alert-info"><strong>Master editable.</strong> Baseline diambil dari halaman publik “Dokter Kami” RSUD R.T. Notopuro. Karena situs resmi juga menandai sebagian entri “Data Belum Diperbarui”, setiap jadwal diberi status verifikasi. Perubahan di sini tersimpan di perangkat/browser ini; gunakan Ekspor/Impor untuk memindahkan master tanpa mengubah kode GitHub.</div>'+
  '<div class="panel"><div class="panel-head"><h2>Tambah Dokter</h2></div><div class="panel-body"><form id="form-doctor-master" class="field-row3"><div class="field"><label>Nama Dokter</label><input id="dm-nama" required></div><div class="field"><label>Spesialisasi</label><input id="dm-spesialis" required></div><div class="field"><label>Poli</label><select id="dm-poli">'+Store.data.poli.map(function(p){return '<option value="'+p.id+'">'+esc(p.nama)+' — '+esc(p.layanan||'')+'</option>';}).join('')+'</select></div><div style="grid-column:1/-1"><button class="btn btn-primary">Tambah Dokter</button></div></form></div></div>'+
  '<div class="panel"><div class="panel-head"><div><h2>Jadwal Praktik</h2><div class="hint">'+docs.length+' dokter master · '+(Store.data.doctorSchedules||[]).length+' slot jadwal</div></div><div class="chip-row"><button class="btn btn-outline btn-sm" id="btn-export-master">⬇️ Ekspor Master JSON</button><button class="btn btn-outline btn-sm" id="btn-import-master">⬆️ Impor Master JSON</button><input id="master-file" type="file" accept="application/json" class="hidden"></div></div><div class="panel-body">'+
  '<form id="form-schedule-master" class="field-row3"><div class="field"><label>Dokter</label><select id="sc-dokter">'+docs.map(function(d){return '<option value="'+d.id+'">'+esc(d.nama)+'</option>';}).join('')+'</select></div><div class="field"><label>Poli/Layanan</label><select id="sc-poli">'+Store.data.poli.map(function(p){return '<option value="'+p.id+'">'+esc(p.nama)+' — '+esc(p.layanan||'')+'</option>';}).join('')+'</select></div><div class="field"><label>Hari</label><select id="sc-hari">'+days.map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).join('')+'</select></div><div class="field"><label>Mulai</label><input id="sc-mulai" type="time" required value="08:00"></div><div class="field"><label>Selesai</label><input id="sc-selesai" type="time" required value="12:00"></div><div class="field"><label>Ruang</label><input id="sc-ruang" value="Belum dipetakan"></div><div class="field"><label>Kuota (opsional)</label><input id="sc-kuota" type="number" min="0" placeholder="Otomatis dari durasi"></div><div style="grid-column:1/-1"><button class="btn btn-primary">Tambah Jadwal</button></div></form>'+
  '<div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Dokter</th><th>Layanan</th><th>Hari</th><th>Jam</th><th>Ruang</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+ (Store.data.doctorSchedules||[]).slice().sort(function(a,b){return String(a.poliId).localeCompare(String(b.poliId))||Number(a.hari)-Number(b.hari)||String(a.jamMulai).localeCompare(String(b.jamMulai));}).map(function(sc){const d=doctorMasterById(sc.doctorId)||Store.data.users.find(function(u){return u.id===sc.doctorId;});const p=getPoli(sc.poliId);return '<tr><td><strong>'+esc(d?d.nama:sc.doctorId)+'</strong><div class="hint">'+esc(d&&d.spesialis||'')+'</div></td><td>'+esc(p?p.nama:sc.poliId)+'<div class="hint">'+esc(p&&p.layanan||'')+'</div></td><td>'+days[Number(sc.hari)||0]+'</td><td class="mono">'+esc(sc.jamMulai)+'–'+esc(sc.jamSelesai)+'</td><td>'+esc(sc.ruang||'Belum dipetakan')+'</td><td><span class="badge '+(sc.needsConfirmation?'badge-amber':'badge-sage')+'">'+(sc.needsConfirmation?'Perlu verifikasi':'Terverifikasi')+'</span></td><td><button class="btn btn-outline btn-sm" data-edit-doc="'+(d?d.id:'')+'">Edit Dokter</button> <button class="btn btn-danger btn-sm" data-del-sc="'+sc.id+'">Hapus</button></td></tr>';}).join('')+'</tbody></table></div></div></div>';
  document.getElementById('form-doctor-master').addEventListener('submit',function(e){e.preventDefault();const d={id:'DOC-'+Date.now().toString(36),nama:document.getElementById('dm-nama').value.trim(),spesialis:document.getElementById('dm-spesialis').value.trim(),poliIds:[document.getElementById('dm-poli').value],status:'needs_confirmation',source:'Admin',editable:true,updatedAt:nowISO()};if(!d.nama||!d.spesialis)return;Store.data.doctors.push(d);Store.save();logAudit('dokter_master_baru',d.nama);renderMasterDoctorsTab();showToast('Dokter master ditambahkan','success');});
  document.getElementById('form-schedule-master').addEventListener('submit',function(e){e.preventDefault();const s={id:'SCH-'+Date.now().toString(36),doctorId:document.getElementById('sc-dokter').value,poliId:canonicalPoliId(document.getElementById('sc-poli').value),tanggal:null,hari:Number(document.getElementById('sc-hari').value),jamMulai:document.getElementById('sc-mulai').value,jamSelesai:document.getElementById('sc-selesai').value,ruang:document.getElementById('sc-ruang').value.trim()||'Belum dipetakan',shiftLabel:'Manual Admin',kuota:Number(document.getElementById('sc-kuota').value)||null,source:'Admin',needsConfirmation:false,createdAt:nowISO(),updatedAt:nowISO()};Store.data.doctorSchedules.push(s);Store.save();logAudit('jadwal_dokter_baru',doctorDisplayName(s.doctorId)+' — '+getPoli(s.poliId).nama);renderMasterDoctorsTab();showToast('Jadwal ditambahkan','success');});
  el.querySelectorAll('[data-edit-doc]').forEach(function(b){b.addEventListener('click',function(){const d=doctorMasterById(b.dataset.editDoc);if(!d)return;const nama=prompt('Nama dokter',d.nama);if(nama===null)return;const sp=prompt('Spesialisasi',d.spesialis||'');if(sp===null)return;d.nama=nama.trim()||d.nama;d.spesialis=sp.trim()||d.spesialis;d.updatedAt=nowISO();Store.save();logAudit('dokter_master_edit',d.nama);renderMasterDoctorsTab();showToast('Master dokter diperbarui','success');});});
  el.querySelectorAll('[data-del-sc]').forEach(function(b){b.addEventListener('click',function(){if(!confirm('Hapus jadwal ini?'))return;Store.data.doctorSchedules=Store.data.doctorSchedules.filter(function(s){return s.id!==b.dataset.delSc;});Store.save();logAudit('jadwal_dokter_hapus',b.dataset.delSc);renderMasterDoctorsTab();});});
  document.getElementById('btn-export-master').addEventListener('click',function(){const payload={version:'15.0',exportedAt:nowISO(),doctors:Store.data.doctors||[],doctorSchedules:Store.data.doctorSchedules||[],poli:Store.data.poli||[]};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='master-simrs-notopuro-v15.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},500);});
  document.getElementById('btn-import-master').addEventListener('click',function(){document.getElementById('master-file').click();});
  document.getElementById('master-file').addEventListener('change',function(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=function(){try{const x=JSON.parse(rd.result);if(!Array.isArray(x.doctors)||!Array.isArray(x.doctorSchedules))throw new Error('Format master tidak valid');Store.data.doctors=x.doctors;Store.data.doctorSchedules=x.doctorSchedules;Store.save();logAudit('master_dokter_impor','Master dokter dan jadwal diperbarui dari JSON');renderMasterDoctorsTab();showToast('Master berhasil diimpor','success');}catch(err){showToast('Import gagal: '+err.message,'danger');}};rd.readAsText(f);});
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
MODULE_RENDERERS['pasien-dashboard'] = renderPatientDashboard;
MODULE_RENDERERS['pasien-booking'] = renderPatientBooking;
MODULE_RENDERERS['pasien-booking-saya'] = renderPatientBookingSaya;
MODULE_RENDERERS['pasien-riwayat'] = renderPatientRiwayat;
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
MODULE_RENDERERS['riwayat-dokter'] = renderRiwayatDokter;
MODULE_RENDERERS['master-data'] = renderMasterData;
MODULE_RENDERERS['cek-antrian'] = renderCekAntrian;
MODULE_RENDERERS['monitor-antrean'] = renderMonitorAntrean;
function openDoctorMonitor(){
  const u=Session.currentUser; if(!u||!['dokter','perawat','rawat_jalan','admin'].includes(u.role))return;
  const poliId=canonicalPoliId(u.poliId||'SP-JAN');
  localStorage.setItem('simrs_monitor_config_v15',JSON.stringify({poliId:poliId}));
  const url=location.href.split('#')[0]+'#/monitor-antrean?poli='+encodeURIComponent(poliId);
  window.open(url,'simrs-monitor-'+poliId,'noopener,noreferrer');
}
let monitorClockTimer=null;
function renderMonitorAntrean(){
  const hash=location.hash||''; const qs=hash.includes('?')?new URLSearchParams(hash.split('?')[1]):null;
  const saved=JSON.parse(localStorage.getItem('simrs_monitor_config_v15')||'null');
  const cfg=qs&&qs.get('poli')?{poliId:qs.get('poli')}:(saved||null);
  const poliId=cfg&&cfg.poliId?canonicalPoliId(cfg.poliId):'SP-JAN';
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
  document.getElementById('main-content').innerHTML='<div class="public-monitor"><div class="monitor-head"><div><div class="ops-eyebrow">SIMRS RSUD R.T. NOTOPURO · MONITOR POLI</div><h1>'+esc(poli.nama).toUpperCase()+'</h1><div>'+doctorInfo+' · '+sessionInfo+'</div></div><div class="monitor-clock" id="monitor-clock"></div></div><div class="monitor-current"><span>NOMOR YANG DIPANGGIL</span><strong>'+esc(active?active.noAntrian:'—')+'</strong><div>'+(active?'Silakan menuju ruang pemeriksaan':'Mohon menunggu panggilan berikutnya')+'</div></div><div class="monitor-next"><h2>ANTREAN MENUNGGU</h2><div class="monitor-queue-list">'+(waiting.length?waiting.slice(0,10).map(function(v){return '<div><strong>'+esc(v.noAntrian)+'</strong><span>Menunggu</span></div>';}).join(''):'<div class="monitor-empty">Belum ada pasien yang menunggu.</div>')+'</div></div><div class="monitor-session-strip"><span>SESI AKTIF</span><strong>'+sessionInfo+'</strong><small>'+esc(nextInfo)+'</small></div><div class="monitor-footer">Nomor antrean dibuat per poli dan tanggal · Dokter/sesi dialokasikan otomatis sesuai jadwal dan kapasitas · Tidak menampilkan nama pasien</div></div>';
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

window.addEventListener('storage',function(e){if(e.key==='simrs_db_v1' && currentRoute()==='monitor-antrean'){Store.load();renderMonitorAntrean();}});
try{if(liveChannel)liveChannel.onmessage=function(e){if(e.data&&e.data.type==='db-updated'&&currentRoute()==='monitor-antrean'){Store.load();renderMonitorAntrean();}};}catch(e){}
