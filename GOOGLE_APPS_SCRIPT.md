# Panduan & Kode Google Apps Script - PPDB Online SMP Negeri 1 Wanaraya

Dokumen ini berisi kode **Google Apps Script** yang dapat Anda tempelkan langsung di spreadsheet Google Sheets yang telah dibuat oleh sistem PPDB. Script ini berguna untuk mempercantik tampilan tabel secara otomatis dan mengirimkan email pengumuman kelulusan ke calon siswa secara massal langsung dari spreadsheet.

---

## Cara Memasang Script di Google Sheets

1. Buka spreadsheet PPDB Anda di Google Sheets.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus semua kode default yang ada di dalam editor `Kode.gs`.
4. Salin (copy) seluruh kode JavaScript di bawah ini dan tempelkan (paste) ke dalam editor Apps Script.
5. Klik ikon **Simpan (Save)** (berbentuk disket) atau tekan `Ctrl + S`.
6. Tutup tab Apps Script. Sekarang Anda akan melihat menu baru bernama **"Pendaftaran PPDB 🎓"** di bilah menu atas Google Sheets Anda (mungkin perlu memuat ulang halaman spreadsheet).

---

## Kode Google Apps Script (`Kode.gs`)

```javascript
/**
 * Google Apps Script untuk Sistem Integrasi PPDB Online
 * SMP Negeri 1 Wanaraya
 * 
 * Fitur:
 * 1. Auto-Format Tabel: Merapikan kolom, mewarnai header, memberikan border, dan mengatur lebar kolom otomatis.
 * 2. Kirim Email Notifikasi Massal: Mengirim surat keputusan hasil seleksi (DITERIMA / BELUM LULUS) secara langsung ke email pendaftar.
 */

// Membuat menu khusus di Google Sheets saat dokumen dibuka
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Pendaftaran PPDB 🎓')
    .addItem('1. Rapikan & Format Tampilan Tabel ✍️', 'formatPpdbSheet')
    .addSeparator()
    .addItem('2. Kirim Email Notifikasi Seleksi ✉️', 'sendSelectionEmails')
    .addToUi();
}

/**
 * 1. FUNGSI UNTUK MERAPIKAN DAN MEWARNAI TABEL SPREADSHEET
 */
function formatPpdbSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  
  if (lastRow < 1) {
    SpreadsheetApp.getUi().alert('Peringatan', 'Tidak ada data di lembar kerja ini untuk diformat.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Ambil range seluruh data aktif
  const range = sheet.getRange(1, 1, lastRow, lastColumn);
  
  // Set font ke font sans-serif modern (Inter / Arial)
  range.setFontFamily('Arial');
  range.setFontSize(10);
  
  // Format Header (Baris Pertama)
  const headerRange = sheet.getRange(1, 1, 1, lastColumn);
  headerRange.setBackground('#0f172a'); // Slate 900 (Gelap Elegan)
  headerRange.setFontColor('#ffffff'); // Teks Putih
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38); // Header lebih tebal
  
  // Berikan garis pembatas tipis (border) abu-abu di seluruh tabel
  range.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  
  // Atur perataan teks (Alignment) untuk kolom-kolom kunci
  sheet.getRange(2, 1, lastRow - 1, 1).setHorizontalAlignment('center'); // ID Pendaftaran
  sheet.getRange(2, 4, lastRow - 1, 1).setHorizontalAlignment('center'); // Status
  sheet.getRange(2, 6, lastRow - 1, 1).setHorizontalAlignment('center'); // Waktu
  sheet.getRange(2, 7, lastRow - 1, 1).setHorizontalAlignment('center'); // NISN
  sheet.getRange(2, 9, lastRow - 1, 1).setHorizontalAlignment('center'); // Tanggal Lahir
  
  // Mewarnai baris selang-seling (Zebra striping) untuk kenyamanan membaca
  for (let r = 2; r <= lastRow; r++) {
    sheet.setRowHeight(r, 26); // Tinggi baris data yang nyaman
    
    // Status warna latar belakang berdasarkan kelulusan
    const statusCell = sheet.getRange(r, 4);
    const statusVal = statusCell.getValue().toString().toUpperCase();
    
    if (statusVal === 'LULUS' || statusVal === 'VERIFIKASI_LENGKAP') {
      statusCell.setBackground('#d1fae5'); // Hijau muda hangat
      statusCell.setFontColor('#065f46');
      statusCell.setFontWeight('bold');
    } else if (statusVal === 'TIDAK_LULUS' || statusVal === 'BELUM_LENGKAP') {
      statusCell.setBackground('#fee2e2'); // Merah muda hangat
      statusCell.setFontColor('#991b1b');
      statusCell.setFontWeight('bold');
    } else {
      statusCell.setBackground('#fef3c7'); // Kuning hangat
      statusCell.setFontColor('#92400e');
      statusCell.setFontWeight('bold');
    }
  }
  
  // Otomatis menyesuaikan ukuran lebar kolom agar pas dengan teks
  sheet.autoResizeColumns(1, lastColumn);
  
  // Tambah padding ekstra pada kolom agar tidak terlalu sempit
  for (let c = 1; c <= lastColumn; c++) {
    const currentWidth = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, currentWidth + 24);
  }
  
  // Tampilkan pesan sukses
  SpreadsheetApp.getUi().alert(
    'Format Selesai ✨', 
    'Tampilan tabel pendaftaran PPDB Anda sekarang telah dirapikan secara otomatis dengan konfigurasi warna tema sekolah.', 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * 2. FUNGSI UNTUK MENGIRIM NOTIFIKASI EMAIL KELULUSAN MASSAL
 */
function sendSelectionEmails() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Konfirmasi Pengiriman Email ✉️', 
    'Apakah Anda yakin ingin mengirim email notifikasi hasil seleksi PPDB ke semua calon siswa yang terdaftar di spreadsheet ini?', 
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  let emailCount = 0;
  let skipCount = 0;
  
  // Membaca data pendaftar dari setiap baris
  for (let r = 2; r <= lastRow; r++) {
    const regId = sheet.getRange(r, 1).getValue().toString(); // Kolom A
    const name = sheet.getRange(r, 2).getValue().toString();  // Kolom B
    const email = sheet.getRange(r, 3).getValue().toString(); // Kolom C
    const status = sheet.getRange(r, 4).getValue().toString(); // Kolom D
    const notes = sheet.getRange(r, 5).getValue().toString();  // Kolom E
    
    // Validasi alamat email dasar
    if (!email || email.indexOf('@') === -1) {
      skipCount++;
      continue;
    }
    
    // Format pesan subjek & isi email dalam Bahasa Indonesia resmi
    let subject = '';
    let emailBody = '';
    
    const formattedStatus = status.toUpperCase();
    
    if (formattedStatus === 'LULUS') {
      subject = `🎉 Selamat! Anda Diterima di SMP Negeri 1 Wanaraya (No: ${regId})`;
      emailBody = `Yth. Saudara/i ${name},\n\n` +
                  `Selamat! Berdasarkan hasil rapat panitia pendaftaran dan akurasi berkas kesesuaian nilai calon pendaftar, Anda secara resmi dinyatakan:\n\n` +
                  `====== DITERIMA / LULUS SELEKSI ======\n` +
                  `sebagai siswa baru di SMP Negeri 1 Wanaraya Tahun Ajaran 2026/2027.\n\n` +
                  `Catatan Panitia:\n"${notes || 'Dokumen lengkap dan memenuhi kriteria zonasi utama SMP Negeri 1 Wanaraya.'}"\n\n` +
                  `Silakan masuk ke portal PPDB Online menggunakan akun Anda untuk mengunduh Bukti Pendaftaran, Surat Pernyataan, serta petunjuk daftar ulang resmi sekolah.\n\n` +
                  `Hormat Kami,\nPanitia PPDB Online SMP Negeri 1 Wanaraya.`;
    } 
    else if (formattedStatus === 'TIDAK_LULUS') {
      subject = `Pemberitahuan Hasil Seleksi PPDB Online SMP Negeri 1 Wanaraya`;
      emailBody = `Yth. Saudara/i ${name},\n\n` +
                  `Terima kasih telah berpartisipasi dan mengikuti seluruh rangkaian proses pendaftaran PPDB Online di sekolah kami.\n\n` +
                  `Kami memohon maaf yang sebesar-besarnya, setelah dilakukan penyaringan kuota zonasi dan verifikasi dokumen, Anda saat ini dinyatakan:\n\n` +
                  `====== BELUM DINYATAKAN LULUS ======\n\n` +
                  `Catatan Panitia:\n"${notes || 'Kuota pendaftaran telah penuh atau dokumen pendaftaran belum sesuai kualifikasi.'}"\n\n` +
                  `Kami sangat menghargai perjuangan dan minat besar yang Anda tunjukkan untuk bersekolah di SMP Negeri 1 Wanaraya. Tetap semangat untuk terus mengukir prestasi gemilang di sekolah pilihan lainnya.\n\n` +
                  `Hormat Kami,\nPanitia PPDB Online SMP Negeri 1 Wanaraya.`;
    } 
    else {
      // Jika statusnya proses, menunggu berkas, dll, opsional untuk mengirim email info akun
      subject = `Informasi Berkas Pendaftaran PPDB Online SMP Negeri 1 Wanaraya`;
      emailBody = `Yth. Saudara/i ${name},\n\n` +
                  `Sebagai tindak lanjut verifikasi data PPDB Online Anda dengan ID: ${regId}, status berkas Anda saat ini adalah:\n` +
                  `⚙️ STATUS: [${status}]\n\n` +
                  `Catatan Tambahan Verifikator:\n"${notes || 'Menunggu verifikasi lanjutan oleh panitia sekolah.'}"\n\n` +
                  `Silakan pantau portal PPDB Online secara berkala untuk memperbarui dokumen apabila status Anda tertulis "BELUM_LENGKAP".\n\n` +
                  `Hormat Kami,\nPanitia PPDB Online SMP Negeri 1 Wanaraya.`;
    }
    
    // Menggunakan MailApp Google Apps Script untuk mengirimkan surat
    try {
      MailApp.sendEmail(email, subject, emailBody);
      emailCount++;
    } catch (err) {
      Logger.log('Gagal mengirim ke email ' + email + ': ' + err.toString());
      skipCount++;
    }
  }
  
  // Tampilkan notifikasi rekap email terkirim
  ui.alert(
    'Pengiriman Selesai! 📫',
    `Proses selesai.\n` +
    `- Sukses terkirim: ${emailCount} siswa\n` +
    `- Gagal/Dilewati: ${skipCount} data pendaftar`,
    ui.ButtonSet.OK
  );
}
```
