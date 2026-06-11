import { SchoolConfig, User } from './types';

export const defaultSchoolConfig: SchoolConfig = {
  schoolName: "SMP Negeri 1 Wanaraya",
  schoolProfile: "SMP Negeri 1 Wanaraya adalah sekolah menengah pertama percontohan yang berkomitmen menghasilkan lulusan berakhlak mulia, cerdas, kreatif, dan mandiri. Dilengkapi dengan berbagai fasilitas modern seperti laboratorium komputer dan IPA, perpustakaan digital, sarana olahraga lengkap, serta program ekstrakurikuler unggulan untuk menyalurkan dan mengembangkan potensi maksimal setiap peserta didik.",
  motto: "Cerdas, Berkarakter, Unggul, dan Peduli Lingkungan",
  address: "Jl. Pendidikan Barat No. 45, Harapan Jaya, Kota Metropolitan, DKI Jakarta",
  phone: "(021) 555-1234",
  email: "info@smpn1wanaraya.sch.id",
  registrationStatus: "Buka",
  quota: 120,
  timeline: [
    {
      id: "t1",
      label: "Sosialisasi & Pendaftaran Online",
      date: "11 Juni – 30 Juni 2026",
      desc: "Calon peserta didik baru melakukan registrasi akun secara mandiri dan mengisi berkas biodata sekolah asal."
    },
    {
      id: "t2",
      label: "Batas Akhir Upload Berkas",
      date: "30 Juni 2026 (Pukul 23:59 WIB)",
      desc: "Penutupan pemunggahan dokumen persyaratan utama (KK, Ijazah/SKL, Akta, dan Foto)."
    },
    {
      id: "t3",
      label: "Proses Verifikasi & Seleksi Administrasi",
      date: "01 Juli – 05 Juli 2026",
      desc: "Panitia PPDB melakukan pengecekan validitas berkas, kuota zonasi, dan rekapitulasi data pendaftar."
    },
    {
      id: "t4",
      label: "Pengumuman Kelulusan Akhir",
      date: "10 Juli 2026 (Pukul 10:00 WIB)",
      desc: "Pengumuman hasil seleksi masuk yang sah. Dapat diakses secara mandiri melalui menu Dashboard Siswa."
    },
    {
      id: "t5",
      label: "Lapor Diri / Daftar Ulang Fisik",
      date: "12 Juli – 15 Juli 2026",
      desc: "Bagi calon siswa yang dinyatakan lulus, wajib melakukan daftar ulang dengan membawa berkas asli ke loket sekolah."
    }
  ],
  announcements: [
    {
      id: "a1",
      title: "PPDB Online Tahun Pelajaran 2026/2027 Resmi Dibuka!",
      content: "Kami sampaikan selamat datang di portal resmi PPDB Online SMP Negeri 1 Wanaraya. Pendaftaran dilakukan secara mandiri oleh calon siswa atau orang tua wali mulai tanggal 11 Juni 2026. Persiapkan scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus (SKL), dan Pas Foto formal sebelum mulai mengisi formulir.",
      date: "2026-06-11",
      isImportant: true
    },
    {
      id: "a2",
      title: "Pusat Bantuan WhatsApp (Call Center PPDB)",
      content: "Jika bapak/ibu wali murid atau calon siswa mengalami kesulitan teknis dalam pengisian biodata atau pengunggahan dokumen, silakan hubungi tim Admin PPDB melalui Hotline WhatsApp di 0812-3456-7890. Layanan aktif setiap hari kerja dari pukul 08:00 s.d. 15:00 WIB.",
      date: "2026-06-11",
      isImportant: false
    }
  ]
};

export const defaultUsers: User[] = [
  {
    id: "admin-u",
    name: "Pak Suwarto, S.Pd.",
    email: "admin@sekolah.sch.id",
    password: "12345678",
    role: "admin"
  },
  {
    id: "stud-1",
    name: "Budi Santoso",
    email: "budi@gmail.com",
    password: "budi123",
    role: "student",
    pendaftaranId: "PPDB-2026-0001",
    registeredAt: "2026-06-11",
    registrationStatus: "LULUS",
    notes: "Semua dokumen lengkap. Nilai rata-hari rapor dan jarak zonasi (450 meter) masuk dalam kuota utama penerimaan.",
    profile: {
      personalInfo: {
        name: "Budi Santoso",
        nisn: "3120409852",
        birthPlace: "Jakarta",
        birthDate: "2013-05-14",
        gender: "Laki-laki",
        religion: "Islam",
        phone: "081299887766"
      },
      addressInfo: {
        street: "Jl. Merdeka No. 12",
        rtRw: "003/004",
        village: "Harapan Jaya",
        district: "Kota Bekasi",
        city: "Bekasi",
        province: "Jawa Barat",
        postalCode: "17124"
      },
      schoolInfo: {
        previousSchool: "SD Negeri Menteng 01",
        graduationYear: "2026",
        schoolAddress: "Jl. Menteng Raya No. 1, Jakarta Pusat",
        ijazaNumber: "DN-01/D-SD/06/0012345"
      },
      parentsInfo: {
        fatherName: "Hendra Santoso",
        fatherJob: "Karyawan Swasta",
        fatherPhone: "08122334455",
        motherName: "Siti Rahma",
        motherJob: "Ibu Rumah Tangga",
        motherPhone: "08122334466"
      }
    },
    documents: {
      familyCard: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
      familyCardName: "KK_Budi_Santoso.pdf",
      graduationCertificate: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop",
      graduationCertificateName: "SKL_Budi_Santoso.pdf",
      birthCertificate: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop",
      birthCertificateName: "Akta_Lahir_Budi.pdf",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=200&fit=crop",
      photoName: "Pas_Foto_Budi_3x4.jpg"
    }
  },
  {
    id: "stud-2",
    name: "Siti Aminah",
    email: "siti@gmail.com",
    password: "siti123",
    role: "student",
    pendaftaranId: "PPDB-2026-0002",
    registeredAt: "2026-06-11",
    registrationStatus: "SEDANG_DIVERIFIKASI",
    notes: "Dokumen biodata dan kependudukan valid. Masih menunggu verifikasi titik lintang koordinat rumah dengan radius zonasi sekolah.",
    profile: {
      personalInfo: {
        name: "Siti Aminah",
        nisn: "3120504731",
        birthPlace: "Bandung",
        birthDate: "2013-08-20",
        gender: "Perempuan",
        religion: "Islam",
        phone: "085712345678"
      },
      addressInfo: {
        street: "Jl. Anggrek Indah Gg. Masjid No. 5",
        rtRw: "001/002",
        village: "Harapan Jaya",
        district: "Kota Bekasi",
        city: "Bekasi",
        province: "Jawa Barat",
        postalCode: "17124"
      },
      schoolInfo: {
        previousSchool: "SD Swasta Al-Ikhlas",
        graduationYear: "2026",
        schoolAddress: "Jl. Anggrek Raya No. 10, Kranji",
        ijazaNumber: "DN-01/D-SD/06/0054321"
      },
      parentsInfo: {
        fatherName: "Lukman Hakim",
        fatherJob: "Retail / Wiraswasta",
        fatherPhone: "081388776655",
        motherName: "Dewi Lestari",
        motherJob: "Guru Madrasah",
        motherPhone: "081388776644"
      }
    },
    documents: {
      familyCard: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop",
      familyCardName: "KK_Siti_Aminah.pdf",
      graduationCertificate: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop",
      graduationCertificateName: "SKL_Siti_Aminah.pdf",
      birthCertificate: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop",
      birthCertificateName: "Akta_Kelahiran_Siti.pdf",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&h=200&fit=crop",
      photoName: "Foto_Siti_PPDB.jpg"
    }
  },
  {
    id: "stud-3",
    name: "Rian Hidayat",
    email: "rian@gmail.com",
    password: "rian123",
    role: "student",
    pendaftaranId: "PPDB-2026-0003",
    registeredAt: "2026-06-11",
    registrationStatus: "BELUM_LENGKAP",
    notes: "Profil biodata orang tua dan dokumen belum diunggah secara lengkap.",
    profile: {
      personalInfo: {
        name: "Rian Hidayat",
        nisn: "3120610924",
        birthPlace: "Surabaya",
        birthDate: "2013-11-05",
        gender: "Laki-laki",
        religion: "Islam",
        phone: "081399008811"
      },
      addressInfo: {
        street: "",
        rtRw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        postalCode: ""
      },
      schoolInfo: {
        previousSchool: "SDN Harapan Jaya 03",
        graduationYear: "2026",
        schoolAddress: "",
        ijazaNumber: ""
      },
      parentsInfo: {
        fatherName: "",
        fatherJob: "",
        fatherPhone: "",
        motherName: "",
        motherJob: "",
        motherPhone: ""
      }
    },
    documents: {
      familyCard: null,
      familyCardName: null,
      graduationCertificate: null,
      graduationCertificateName: null,
      birthCertificate: null,
      birthCertificateName: null,
      photo: null,
      photoName: null
    }
  }
];
