import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = typeof window !== 'undefined' ? sessionStorage.getItem('google_sheets_access_token') : null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Try to retrieve again
        const storedToken = sessionStorage.getItem('google_sheets_access_token');
        if (storedToken) {
          cachedAccessToken = storedToken;
          if (onAuthSuccess) onAuthSuccess(user, storedToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInGoogleSheets = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('google_sheets_access_token', credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logoutGoogleSheets = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem('google_sheets_access_token');
};

// Form Questions mapping as headers
const SHEET_HEADERS = [
  "ID Pendaftaran",
  "Nama Lengkap",
  "Email",
  "Status Pendaftaran",
  "Catatan Verifikator",
  "Waktu Pendaftaran",
  "NISN",
  "Tempat Lahir",
  "Tanggal Lahir",
  "Jenis Kelamin",
  "Agama",
  "No. HP Siswa",
  "Alamat (Jalan)",
  "RT / RW",
  "Kelurahan / Desa",
  "Kecamatan",
  "Kota / Kabupaten",
  "Provinsi",
  "Kode Pos",
  "SMP/MTs / Sekolah Asal",
  "Tahun Kelulusan",
  "Alamat Sekolah Asal",
  "No. Seri Ijazah / SKL",
  "Nama Ayah Kandung",
  "Pekerjaan Ayah",
  "No. HP Ayah",
  "Nama Ibu Kandung",
  "Pekerjaan Ibu",
  "No. HP Ibu",
  
  // Pathway specifics (10 Columns)
  "Jalur Pendaftaran",
  "Jarak Rumah ke Sekolah (Zonasi)",
  "Memperoleh KIP / Siswa Miskin (Afirmasi)",
  "Nama Bukti Berkas KIP/Miskin (Afirmasi)",
  "Kategori Prestasi",
  "Peringkat Kelas (Prestasi Akademik)",
  "Rata-Rata Nilai (Prestasi Akademik)",
  "Deskripsi Prestasi (Prestasi Non-Akademik)",
  "Daerah/Instansi Asal (Jalur Mutasi)",
  "Tujuan Alamat Tinggal (Jalur Mutasi)",

  // Uploaded Files (5 Columns)
  "Link Kartu Keluarga (KK)",
  "Link Ijazah / SKL",
  "Link Akte Kelahiran",
  "Link Pas Foto 3x4",
  "Link Berkas KIP / Siswa Miskin"
];

const getFileUrl = (studentId: string, docKey: string, fileContent: string | null | undefined): string => {
  if (!fileContent) return "-";
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `${origin}/?view_doc=${studentId}&doc=${docKey}`;
};

// Map a list of users to spreadsheet row arrays
const mapUsersToRows = (users: User[]): string[][] => {
  const studentUsers = users.filter(u => u.role === 'student');
  
  return studentUsers.map(student => {
    const p = student.profile;
    const pathw = p?.pathwayInfo;
    const docs = student.documents;
    
    // Check if KIP file exists
    const kipUrlField = pathw?.afirmasi?.kipFileUrl;
    
    return [
      student.pendaftaranId || "-",
      student.name || "-",
      student.email || "-",
      student.registrationStatus || "-",
      student.notes || "-",
      student.registeredAt ? new Date(student.registeredAt).toLocaleString('id-ID') : "-",
      
      // Personal
      p?.personalInfo?.nisn || "-",
      p?.personalInfo?.birthPlace || "-",
      p?.personalInfo?.birthDate || "-",
      p?.personalInfo?.gender || "-",
      p?.personalInfo?.religion || "-",
      p?.personalInfo?.phone || "-",
      
      // Address
      p?.addressInfo?.street || "-",
      p?.addressInfo?.rtRw || "-",
      p?.addressInfo?.village || "-",
      p?.addressInfo?.district || "-",
      p?.addressInfo?.city || "-",
      p?.addressInfo?.province || "-",
      p?.addressInfo?.postalCode || "-",
      
      // School Info
      p?.schoolInfo?.previousSchool || "-",
      p?.schoolInfo?.graduationYear || "-",
      p?.schoolInfo?.schoolAddress || "-",
      p?.schoolInfo?.ijazaNumber || "-",
      
      // Parents Info
      p?.parentsInfo?.fatherName || "-",
      p?.parentsInfo?.fatherJob || "-",
      p?.parentsInfo?.fatherPhone || "-",
      p?.parentsInfo?.motherName || "-",
      p?.parentsInfo?.motherJob || "-",
      p?.parentsInfo?.motherPhone || "-",
      
      // Pathway Info (10 Columns)
      pathw?.type || "-",
      pathw?.type === 'Zonasi' ? (pathw.zonasi?.distance || "-") : "-",
      pathw?.type === 'Afirmasi' ? (pathw.afirmasi?.hasKip || "-") : "-",
      pathw?.type === 'Afirmasi' ? (pathw.afirmasi?.kipFileName || "-") : "-",
      pathw?.type === 'Prestasi' ? (pathw.prestasi?.category || "-") : "-",
      pathw?.type === 'Prestasi' && pathw.prestasi?.category === 'Akademik' ? (pathw.prestasi.academicRank || "-") : "-",
      pathw?.type === 'Prestasi' && pathw.prestasi?.category === 'Akademik' ? (pathw.prestasi.academicAverage || "-") : "-",
      pathw?.type === 'Prestasi' && pathw.prestasi?.category === 'Non-Akademik' ? (pathw.prestasi.nonAcademicDescription || "-") : "-",
      pathw?.type === 'Mutasi' ? (pathw.mutasi?.originLocation || "-") : "-",
      pathw?.type === 'Mutasi' ? (pathw.mutasi?.targetDestination || "-") : "-",

      // Uploaded Files (5 columns)
      getFileUrl(student.id, 'familyCard', docs?.familyCard),
      getFileUrl(student.id, 'graduationCertificate', docs?.graduationCertificate),
      getFileUrl(student.id, 'birthCertificate', docs?.birthCertificate),
      getFileUrl(student.id, 'photo', docs?.photo),
      getFileUrl(student.id, 'kipFile', kipUrlField)
    ];
  });
};

export const createGoogleSheet = async (accessToken: string, schoolName: string): Promise<{ id: string; url: string }> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `PPDB ${schoolName} - Data Pendaftar`
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal membuat Google Sheet: ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`
  };
};

export const syncDataToGoogleSheet = async (
  spreadsheetId: string,
  users: User[],
  accessToken: string
): Promise<void> => {
  const headerRow = SHEET_HEADERS;
  const dataRows = mapUsersToRows(users);
  const values = [headerRow, ...dataRows];

  // Dynamically resolve the first sheet name to support automatic locale translation (e.g. Lembar1, Sheet1, Work Area)
  let firstSheetName = "Sheet1";
  try {
    const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (metadataRes.ok) {
      const meta = await metadataRes.json();
      if (meta.sheets && meta.sheets.length > 0) {
        firstSheetName = meta.sheets[0].properties.title || "Sheet1";
      }
    }
  } catch (metaErr) {
    console.warn("Failed to dynamically fetch first sheet title, defaulting to Sheet1:", metaErr);
  }

  const rangeStr = `${firstSheetName}!A1:AR`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: rangeStr,
      majorDimension: 'ROWS',
      values: values
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menyinkronkan data ke Google Sheet (${rangeStr}): ${errText}`);
  }
};

export interface SheetUserUpdate {
  pendaftaranId: string;
  registrationStatus: string;
  notes: string;
}

export const pullDataFromGoogleSheet = async (
  spreadsheetId: string,
  accessToken: string
): Promise<SheetUserUpdate[]> => {
  let firstSheetName = "Sheet1";
  try {
    const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (metadataRes.ok) {
      const meta = await metadataRes.json();
      if (meta.sheets && meta.sheets.length > 0) {
        firstSheetName = meta.sheets[0].properties.title || "Sheet1";
      }
    }
  } catch (metaErr) {
    console.warn("Failed to dynamically fetch first sheet title, defaulting to Sheet1:", metaErr);
  }

  const rangeStr = `${firstSheetName}!A2:E`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeStr)}?valueRenderOption=FORMATTED_VALUE`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menarik data dari Google Sheet (${rangeStr}): ${errText}`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];
  
  const updates: SheetUserUpdate[] = [];
  rows.forEach((row) => {
    const pendaftaranId = row[0]?.trim();
    if (pendaftaranId) {
      // Normalize any status to correct enum mapping if matches
      let rawStatus = row[3]?.trim() || '';
      let statusValue = rawStatus;
      
      const upperStatus = rawStatus.toUpperCase();
      if (upperStatus === 'LULUS') {
        statusValue = 'LULUS';
      } else if (upperStatus === 'TIDAK_LULUS' || upperStatus === 'TIDAK LULUS') {
        statusValue = 'TIDAK_LULUS';
      } else if (upperStatus === 'DIVERIFIKASI' || upperStatus === 'VERIFIKASI_LENGKAP' || upperStatus === 'TERVERIFIKASI') {
        statusValue = 'DIVERIFIKASI';
      } else if (upperStatus === 'SEDANG_DIVERIFIKASI' || upperStatus === 'PROSES' || upperStatus === 'MENUNGU' || upperStatus === 'MENUNGGU VERIFIKASI') {
        statusValue = 'SEDANG_DIVERIFIKASI';
      } else if (upperStatus === 'BELUM_LENGKAP' || upperStatus === 'BELUM LENGKAP' || upperStatus === 'DRAF') {
        statusValue = 'BELUM_LENGKAP';
      }

      updates.push({
        pendaftaranId,
        registrationStatus: statusValue,
        notes: row[4]?.trim() || ''
      });
    }
  });

  return updates;
};

