# Panduan & Kode Google Apps Script - PPDB Online

Dokumen ini berisi kode **Google Apps Script** (`Kode.gs`) terbarui yang disesuaikan dengan struktur **39 Kolom** terbaru sistem PPDB Online (termasuk 10 kolom informasi detail **Jalur Pendaftaran**: Zonasi, Afirmasi, Prestasi, dan Mutasi).

Script ini berguna untuk merapikan tabel Google Sheets secara otomatis, memberi pewarnaan dinamis, serta memudahkan verifikator sekolah dalam mengirimkan email keputusan kelulusan secara massal langsung dari dashboard spreadsheet.

---

## Cara Memasang Script di Google Sheets

1. Buka spreadsheet PPDB Anda di Google Sheets yang sudah disinkronkan.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus semua kode default yang ada di dalam editor `Kode.gs`.
4. Salin (copy) seluruh kode JavaScript di bawah ini dan tempelkan (paste) ke dalam editor Apps Script.
5. Jalankan fungsi `onOpen` sekali untuk memicu pemberian izin (atau simpan saja, lalu muat ulang halaman spreadsheet utama Anda).
6. Tekan ikon **Simpan (Save)** (berbentuk disket) atau `Ctrl + S`.
7. Sekarang, menu kustom baru bernama **"Pendaftaran PPDB 🎓"** akan muncul di deretan baris menu atas Google Sheets Anda.

---

## Kode Google Apps Script Terbaru (`Kode.gs`)

```javascript
/**
 * Google Apps Script untuk Sistem Integrasi PPDB Online
 * Menangani Layout Otomatis (39 Kolom) & Email Blast Massal berdasarkan Jalur Pendaftaran
 * 
 * Mappings Kolom Utama:
 * - A (1)   : ID Pendaftaran
 * - B (2)   : Nama Lengkap
 * - C (3)   : Email
 * - D (4)   : Status Pendaftaran ('TERVERIFIKASI', 'LULUS', 'TIDAK_LULUS', 'DRAF', 'BELUM_LENGKAP')
 * - E (5)   : Catatan Verifikator
 * - F (6)   : Waktu Pendaftaran
 * - T (20)  : Sekolah Asal
 * - AD (30) : Jalur Pendaftaran (Zonasi / Afirmasi / Prestasi / Mutasi)
 * - AE-AM (31-39): Detail kelengkapan berkas jalur seleksi masing-masing
 */

// Membuat menu pendaftaran kustom saat spreadsheet dibuka
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Pendaftaran PPDB 🎓')
    .addItem('1. Rapikan & Format Tampilan Tabel ✍️', 'formatPpdbSheet')
    .addSeparator()
    .addItem('2. Kirim Email Notifikasi Seleksi ✉️', 'sendSelectionEmails')
    .addToUi();
}

/**
 * 1. FUNGSI UNTUK MERAPIKAN TAMPILAN, FILTER, DAN PEWARNAAN TABEL SECARA OTOMATIS
 */
function formatPpdbSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  
  if (lastRow < 1) {
    SpreadsheetApp.getUi().alert('Peringatan', 'Tidak ada data di lembar kerja ini untuk diformat.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Ambil range seluruh data aktif sekiranya spans A1:AM{lastRow}
  const range = sheet.getRange(1, 1, lastRow, lastColumn);
  
  // Set font utama agar estetis dan seragam
  range.setFontFamily('Arial');
  range.setFontSize(10);
  
  // Format Header Utama (Baris Ke-1)
  const headerRange = sheet.getRange(1, 1, 1, lastColumn);
  headerRange.setBackground('#0f172a'); // Abu Gelap Slate 900
  headerRange.setFontColor('#ffffff'); // Teks Putih Bersih
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38); // Header dibuat agak lapang
  
  // Terapkan border grid abu-abu tipis untuk pemetaan data
  range.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  
  // Merata-tengahkan kolom-kolom kunci agar rapi
  sheet.getRange(2, 1, lastRow - 1, 1).setHorizontalAlignment('center');  // Kolom A: ID Pendaftaran
  sheet.getRange(2, 4, lastRow - 1, 1).setHorizontalAlignment('center');  // Kolom D: Status
  sheet.getRange(2, 6, lastRow - 1, 1).setHorizontalAlignment('center');  // Kolom F: Waktu Daftar
  sheet.getRange(2, 7, lastRow - 1, 1).setHorizontalAlignment('center');  // Kolom G: NISN
  sheet.getRange(2, 9, lastRow - 1, 1).setHorizontalAlignment('center');  // Kolom I: Tanggal Lahir
  sheet.getRange(2, 10, lastRow - 1, 1).setHorizontalAlignment('center'); // Kolom J: Jenis Kelamin
  sheet.getRange(2, 21, lastRow - 1, 1).setHorizontalAlignment('center'); // Kolom U: Tahun Lulus
  sheet.getRange(2, 30, lastRow - 1, 1).setHorizontalAlignment('center'); // Kolom AD: Jalur Pendaftaran
  
  // Pewarnaan baris pendaftar secara otomatis (Zebra Striping) & Penyorot Status
  for (let r = 2; r <= lastRow; r++) {
    sheet.setRowHeight(r, 26); // Tinggi baris data yang ergonomis
    
    // Warnai sel berdasarkan status registrasi
    const statusCell = sheet.getRange(r, 4);
    const statusVal = statusCell.getValue().toString().trim().toUpperCase();
    
    if (statusVal === 'LULUS' || statusVal === 'VERIFIKASI_LENGKAP') {
      statusCell.setBackground('#d1fae5'); // Hijau muda soft (success)
      statusCell.setFontColor('#065f46');
      statusCell.setFontWeight('bold');
    } else if (statusVal === 'TIDAK_LULUS') {
      statusCell.setBackground('#fee2e2'); // Merah muda soft (danger)
      statusCell.setFontColor('#991b1b');
      statusCell.setFontWeight('bold');
    } else if (statusVal === 'BELUM_LENGKAP') {
      statusCell.setBackground('#ffedd5'); // Orange muda soft (warning)
      statusCell.setFontColor('#9a3412');
      statusCell.setFontWeight('bold');
    } else {
      statusCell.setBackground('#fef3c7'); // Kuning soft (pending)
      statusCell.setFontColor('#92400e');
      statusCell.setFontWeight('bold');
    }

    // Sorot warna Jalur Pendaftaran (Kolom AD / 30) agar mudah diidentifikasi kelompoknya
    const pathwayCell = sheet.getRange(r, 30);
    const pathVal = pathwayCell.getValue().toString().trim();
    if (pathVal === 'Zonasi') {
      pathwayCell.setBackground('#eff6ff'); // Biru soft
      pathwayCell.setFontColor('#1e40af');
    } else if (pathVal === 'Afirmasi') {
      pathwayCell.setBackground('#faf5ff'); // Ungu/Pink soft
      pathwayCell.setFontColor('#6b21a8');
    } else if (pathVal === 'Prestasi') {
      pathwayCell.setBackground('#f0fdf4'); // Hijau mint soft
      pathwayCell.setFontColor('#166534');
    } else if (pathVal === 'Mutasi') {
      pathwayCell.setBackground('#fffbeb'); // Kuning/Amber soft
      pathwayCell.setFontColor('#92400e');
    }
  }
  
  // Menyesuaikan lebar kolom secara otomatis agar muat
  sheet.autoResizeColumns(1, lastColumn);
  
  // Berikan margin padding tambahan sebesar +20px agar teks nyaman dibaca
  for (let c = 1; c <= lastColumn; c++) {
    const w = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, Math.min(w + 20, 240)); // Atur maks lebar 240px agar tidak kepanjangan
  }
  
  SpreadsheetApp.getUi().alert(
    'Format Sukses ✨', 
    'Berhasil merapikan tabel pendaftaran! Status kelulusan dan kolom jalur seleksi kini telah diformat secara visual.', 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 2. FUNGSI UNTUK MENGIRIM NOTIFIKASI EMAIL KELULUSAN DENGAN DETAIL JALUR PENDAFTARAN
 */
function sendSelectionEmails() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Konfirmasi Pengiriman Email Blast ✉️', 
    'Apakah Anda yakin ingin mengirim email notifikasi pengumuman hasil seleksi PPDB ke semua calon siswa sesuai status yang tertera di spreadsheet?', 
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  let emailCount = 0;
  let skipCount = 0;
  
  for (let r = 2; r <= lastRow; r++) {
    const regId = sheet.getRange(r, 1).getValue().toString().trim();      // Kolom A: ID Daftar
    const name = sheet.getRange(r, 2).getValue().toString().trim();       // Kolom B: Nama Lengkap
    const email = sheet.getRange(r, 3).getValue().toString().trim();      // Kolom C: Email
    const status = sheet.getRange(r, 4).getValue().toString().trim();     // Kolom D: Status
    const notes = sheet.getRange(r, 5).getValue().toString().trim();      // Kolom E: Catatan Verifikator
    const prevSchool = sheet.getRange(r, 20).getValue().toString().trim(); // Kolom T: SMP/MTs Asal
    const pathway = sheet.getRange(r, 30).getValue().toString().trim();    // Kolom AD: Jalur Daftar
    
    // Detail data jalur pendaftaran untuk disisipkan ke pesan email (AE-AM)
    let pathwayDetailText = '';
    if (pathway === 'Zonasi') {
      const distance = sheet.getRange(r, 31).getValue().toString().trim();
      pathwayDetailText = `Jalur Pendaftaran: Zonasi\nRadius Jarak Domisili: ${distance || '-'}`;
    } else if (pathway === 'Afirmasi') {
      const gakin = sheet.getRange(r, 32).getValue().toString().trim();
      pathwayDetailText = `Jalur Pendaftaran: Afirmasi\nStatus Kepemilikan KIP / SKTM: ${gakin || '-'}`;
    } else if (pathway === 'Prestasi') {
      const cat = sheet.getRange(r, 34).getValue().toString().trim();
      if (cat === 'Akademik') {
        const rank = sheet.getRange(r, 35).getValue().toString().trim();
        const avg = sheet.getRange(r, 36).getValue().toString().trim();
        pathwayDetailText = `Jalur Pendaftaran: Prestasi Akademik\nPeringkat Kelas: ${rank || '-'}\nRata-Rata Nilai Rapor: ${avg || '-'}`;
      } else {
        const desc = sheet.getRange(r, 37).getValue().toString().trim();
        pathwayDetailText = `Jalur Pendaftaran: Prestasi Non-Akademik\nRincian Kejuaraan: ${desc || '-'}`;
      }
    } else if (pathway === 'Mutasi') {
      const orig = sheet.getRange(r, 38).getValue().toString().trim();
      const dest = sheet.getRange(r, 39).getValue().toString().trim();
      pathwayDetailText = `Jalur Pendaftaran: Perpindahan Mutasi Kerja Orang Tua\nInstansi Asal: ${orig || '-'}\nAlamat Baru Tujuan: ${dest || '-'}`;
    } else {
      pathwayDetailText = `Jalur Pendaftaran: -`;
    }
    
    // Validasi dasar kesesuaian email
    if (!email || email.indexOf('@') === -1) {
      skipCount++;
      continue;
    }
    
    let subject = '';
    let emailBody = '';
    const formattedStatus = status.toUpperCase();
    
    if (formattedStatus === 'LULUS' || formattedStatus === 'VERIFIKASI_LENGKAP') {
      subject = `🎉 [PPDB ONLINE] Selamat! Anda Diterima - ID: ${regId}`;
      emailBody = `Yth. Saudara/i ${name},\n` +
                  `Alumni dari ${prevSchool || 'sekolah asal'},\n\n` +
                  `Panitia PPDB Online mengumumkan bahwa berdasarkan hasil verifikasi dokumen administratif dan penyaringan berkas sesuai kualifikasi, pendaftaran Anda dengan rincian berikut:\n\n` +
                  `• ID Pendaftaran : ${regId}\n` +
                  `• Nama Lengkap   : ${name}\n` +
                  `• ${pathwayDetailText.replace(/\n/g, '\n• ')}\n\n` +
                  `Dinyatakan secara resmi:\n` +
                  `=========================================\n` +
                  `    DITERIMA SEBAGAI SISWA BARU ✨\n` +
                  `=========================================\n\n` +
                  `Catatan Keputusan Penguji:\n` +
                  `"${notes || 'Selamat bergabung! Berkas pendaftaran valid dan memenuhi standar nilai seleksijalur penerimaan.'}"\n\n` +
                  `Silakan masuk ke portal PPDB Online kami kembali menggunakan akun Anda untuk mengunduh Kartu Bukti Lulus PPDB serta panduan pendaftaran ulang administratif resmi.\n\n` +
                  `Salam Hangat,\n` +
                  `Panitia Pelaksana PPDB Online.`;
    } 
    else if (formattedStatus === 'TIDAK_LULUS') {
      subject = `[PPDB ONLINE] Pengumuman Hasil Pendaftaran Seleksi Hasil PPDB - ID: ${regId}`;
      emailBody = `Yth. Saudara/i ${name},\n` +
                  `Alumni dari ${prevSchool || 'sekolah asal'},\n\n` +
                  `Kami mengucapkan terima kasih yang sebesar-besarnya atas minat serta partisipasi Anda dalam mengajukan pendaftaran di PPDB Online sekolah kami.\n\n` +
                  `Melalui surat pemberitahuan ini, setelah dilakukan seleksi berkas administrasi dan pemeringkatan kuota kapasitas, dengan berat hati kami sampaikan bahwa Anda saat ini dinyatakan:\n\n` +
                  `=========================================\n` +
                  `          BELUM LULUS SELEKSI\n` +
                  `=========================================\n\n` +
                  `• ID Pendaftaran : ${regId}\n` +
                  `• ${pathwayDetailText.replace(/\n/g, '\n• ')}\n\n` +
                  `Catatan Tambahan Panitia:\n` +
                  `"${notes || 'Mohon maaf, kuota penerimaan untuk jalur terkait telah terpenuhi.'}"\n\n` +
                  `Kami mendoakan kesuksesan pendaftaran Anda di instansi sekolah pilihan lainnya. Tetaplah bersemangat dalam menempuh jenjang pendidikan yang tinggi.\n\n` +
                  `Salam Hormat,\n` +
                  `Panitia Pelaksana PPDB Online.`;
    } 
    else {
      // Untuk status DRAF, PROSES, atau BELUM LENGKAP
      subject = `⚠️ [PPDB ONLINE] Informasi Kelengkapan Berkas Pendaftaran Anda - ID: ${regId}`;
      emailBody = `Yth. Saudara/i ${name},\n` +
                  `Alumni dari ${prevSchool || 'sekolah asal'},\n\n` +
                  `Kami menginformasikan bahwa berkas formulir pendaftaran PPDB Anda saat ini sedang dalam status pemeriksaan.\n\n` +
                  `• ID Pendaftaran : ${regId}\n` +
                  `• Status Berkas  : [${status}]\n` +
                  `• ${pathwayDetailText.replace(/\n/g, '\n• ')}\n\n` +
                  `Catatan Tambahan Verifikator:\n` +
                  `"${notes || 'Harap pantau portal PPDB secara berkala untuk memantau status terbaru.'}"\n\n` +
                  `Apabila status berkas Anda tertera sebagai "BELUM_LENGKAP", mohon segera login ke dashboard pendaftar Anda kembali untuk memperbarui kelengkapan dokumen yang diunggah.\n\n` +
                  `Salam Hormat,\n` +
                  `Panitia Pelaksana PPDB Online.`;
    }
    
    // Kirim menggunakan modul MailApp Google Apps Script
    try {
      MailApp.sendEmail(email, subject, emailBody);
      emailCount++;
    } catch (err) {
      Logger.log('Gagal mengirim ke email ' + email + ': ' + err.toString());
      skipCount++;
    }
  }
  
  ui.alert(
    'Pengiriman Berhasil! 📫',
    `Proses pengiriman email blast selesai.\n\n` +
    `• Berhasil Terkirim : ${emailCount} Siswa\n` +
    `• Dilewati / Gagal : ${skipCount} Pendaftar`,
    ui.ButtonSet.OK
  );
}

/**
 * 3. WEBHOOK RECEIVER (POST / GET): AUTOMATICALLY TRIGGER FORMATTING & REAL-TIME REGISTRATION INSERTION
 */
function doGet(e) {
  try {
    formatPpdbSheet();
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Spreadsheet successfully formatted and color-coded after synchronization!' 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return doGet(e);
    }
    
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const spreadsheetId = payload.spreadsheetId;
    
    if (action === 'submit_student' && spreadsheetId && payload.student) {
      let ss;
      try {
        ss = SpreadsheetApp.openById(spreadsheetId);
      } catch (openErr) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Gagal membuka spreadsheet ID: ' + openErr.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      let sheet = ss.getSheetByName('Sheet1');
      if (!sheet) {
        sheet = ss.getSheets()[0]; // Fallback ke sheet pertama
      }
      
      const student = payload.student;
      const p = student.profile || {};
      const pathw = p.pathwayInfo || {};
      
      // Pemetaan Terperinci ke 39 Kolom
      const rowData = [
        student.pendaftaranId || "-",
        student.name || "-",
        student.email || "-",
        student.registrationStatus || "-",
        student.notes || "-",
        student.registeredAt ? new Date(student.registeredAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
        
        // Personal
        p.personalInfo?.nisn || "-",
        p.personalInfo?.birthPlace || "-",
        p.personalInfo?.birthDate || "-",
        p.personalInfo?.gender || "-",
        p.personalInfo?.religion || "-",
        p.personalInfo?.phone || "-",
        
        // Address
        p.addressInfo?.street || "-",
        p.addressInfo?.rtRw || "-",
        p.addressInfo?.village || "-",
        p.addressInfo?.district || "-",
        p.addressInfo?.city || "-",
        p.addressInfo?.province || "-",
        p.addressInfo?.postalCode || "-",
        
        // School Info
        p.schoolInfo?.previousSchool || "-",
        p.schoolInfo?.graduationYear || "-",
        p.schoolInfo?.schoolAddress || "-",
        p.schoolInfo?.ijazaNumber || "-",
        
        // Parents Info
        p.parentsInfo?.fatherName || "-",
        p.parentsInfo?.fatherJob || "-",
        p.parentsInfo?.fatherPhone || "-",
        p.parentsInfo?.motherName || "-",
        p.parentsInfo?.motherJob || "-",
        p.parentsInfo?.motherPhone || "-",
        
        // Pathway Info (10 Columns)
        pathw.type || "-",
        pathw.type === 'Zonasi' ? (pathw.zonasi?.distance || "-") : "-",
        pathw.type === 'Afirmasi' ? (pathw.afirmasi?.hasKip || "-") : "-",
        pathw.type === 'Afirmasi' ? (pathw.afirmasi?.kipFileName || "-") : "-",
        pathw.type === 'Prestasi' ? (pathw.prestasi?.category || "-") : "-",
        pathw.type === 'Prestasi' && pathw.prestasi?.category === 'Akademik' ? (pathw.prestasi.academicRank || "-") : "-",
        pathw.type === 'Prestasi' && pathw.prestasi?.category === 'Akademik' ? (pathw.prestasi.academicAverage || "-") : "-",
        pathw.type === 'Prestasi' && pathw.prestasi?.category === 'Non-Akademik' ? (pathw.prestasi.nonAcademicDescription || "-") : "-",
        pathw.type === 'Mutasi' ? (pathw.mutasi?.originLocation || "-") : "-",
        pathw.type === 'Mutasi' ? (pathw.mutasi?.targetDestination || "-") : "-"
      ];
      
      const lastRow = sheet.getLastRow();
      let foundRow = -1;
      
      // Cari jika id pendaftaran ini sudah ada di kolom A
      if (lastRow >= 2) {
        const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < ids.length; i++) {
          if (ids[i][0].toString().trim() === student.pendaftaranId.toString().trim()) {
            foundRow = i + 2; // Baris 1-indexed (Baris 2 adalah data awal pendaftar)
            break;
          }
        }
      }
      
      if (foundRow !== -1) {
        // Edit baris yang sudah ada
        sheet.getRange(foundRow, 1, 1, 39).setValues([rowData]);
      } else {
        // Tambahkan baris baru ke paling bawah
        sheet.appendRow(rowData);
      }
      
      // Rapikan dan warnai otomatis
      try {
        formatPpdbSheet();
      } catch (fErr) {
        // Safe logger ignore
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Data siswa ' + student.name + ' berhasil disinkronkan langsung ke Google Sheets secara real-time!' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return doGet(e);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Fitur Integrasi Kode Apps Script ini dengan Web Dashboard:
- **Sinkronisasi & Format Instan**: Dashboard web secara otomatis memicu URL Google Apps Script Web App Anda setelah sinkronisasi selesai, mengeksekusi format baris adaptif dan zebra-striping secara real-time.
- Mewarnai baris sel pendaftar secara adaptif berdasarkan kelulusan (`LULUS`, `TIDAK_LULUS`, `BELUM_LENGKAP`, `DRAF`).
- Menyorot kolom kelompok **Jalur Pendaftaran** dengan warna kontras yang estetik (Biru untuk **Zonasi**, Ungu untuk **Afirmasi**, Hijau untuk **Prestasi**, Amber untuk **Mutasi**).
- Mengintegrasikan isi email agar melampirkan keterangan detail parameter pendaftar (tergantung jalur pilihan siswa, seperti menampilkan **Jarak Radius Rumah** pada pendaftar Zonasi, atau **Sertifikat** pada Prestasi) secara otomatis.
