export interface SchoolConfig {
  schoolName: string;
  schoolProfile: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  registrationStatus: 'Buka' | 'Tutup';
  quota: number;
  timeline: {
    id: string;
    label: string;
    date: string;
    desc: string;
  }[];
  announcements: {
    id: string;
    title: string;
    content: string;
    date: string;
    isImportant: boolean;
  }[];
}

export interface PathwayInfo {
  type: 'Zonasi' | 'Afirmasi' | 'Prestasi' | 'Mutasi' | '';
  zonasi?: {
    distance: string; // Jarak dari rumah ke sekolah (dalam meter atau km)
  };
  afirmasi?: {
    hasKip: 'Ya' | 'Tidak' | ''; // Memperoleh KIP/Siswa miskin
    kipFileName: string | null;  // Nama file berkas KIP
    kipFileUrl: string | null;   // Konten berkas KIP (Base64 atau mock url)
  };
  prestasi?: {
    category: 'Akademik' | 'Non-Akademik' | '';
    academicRank?: string;      // Peringkat kelas
    academicAverage?: string;   // Rata-rata nilai
    nonAcademicDescription?: string; // Deskripsi prestasi non-akademik
  };
  mutasi?: {
    originLocation: string;     // Daerah asal instansi/sekolah mutasi
    targetDestination: string;  // Tujuan domisili/alamat baru
  };
}

export interface StudentProfile {
  personalInfo: {
    name: string;
    nisn: string;
    birthPlace: string;
    birthDate: string;
    gender: 'Laki-laki' | 'Perempuan' | '';
    religion: string;
    phone: string;
  };
  addressInfo: {
    street: string;
    rtRw: string;
    village: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  schoolInfo: {
    previousSchool: string;
    graduationYear: string;
    schoolAddress: string;
    ijazaNumber: string;
  };
  parentsInfo: {
    fatherName: string;
    fatherJob: string;
    fatherPhone: string;
    motherName: string;
    motherJob: string;
    motherPhone: string;
  };
  pathwayInfo?: PathwayInfo;
}

export interface StudentDocuments {
  familyCard: string | null;            // Storing either file name or Mock URL / Base64 status
  familyCardName: string | null;
  graduationCertificate: string | null; // Storing either file name or Mock URL
  graduationCertificateName: string | null;
  birthCertificate: string | null;      // Storing either file name or Mock URL
  birthCertificateName: string | null;
  photo: string | null;                 // Storing either file name or Mock URL/Base64
  photoName: string | null;
}

export type RegistrationStatus = 'BELUM_LENGKAP' | 'SEDANG_DIVERIFIKASI' | 'DIVERIFIKASI' | 'LULUS' | 'TIDAK_LULUS';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  profile?: StudentProfile;
  documents?: StudentDocuments;
  registrationStatus?: RegistrationStatus;
  pendaftaranId?: string;
  registeredAt?: string;
  notes?: string; // Catatan Admin
}
