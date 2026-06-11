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

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
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
  "Tujuan Alamat Tinggal (Jalur Mutasi)"
];

// Map a list of users to spreadsheet row arrays
const mapUsersToRows = (users: User[]): string[][] => {
  const studentUsers = users.filter(u => u.role === 'student');
  
  return studentUsers.map(student => {
    const p = student.profile;
    const pathw = p?.pathwayInfo;
    
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
      pathw?.type === 'Mutasi' ? (pathw.mutasi?.targetDestination || "-") : "-"
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
  // Overwrite the first tab contents (A1:AC) with fresh header & row tuples
  const headerRow = SHEET_HEADERS;
  const dataRows = mapUsersToRows(users);
  
  const values = [headerRow, ...dataRows];

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:AM?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'Sheet1!A1:AM',
      majorDimension: 'ROWS',
      values: values
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menyinkronkan data ke Google Sheet: ${errText}`);
  }
};
