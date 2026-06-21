import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, MapPin, GraduationCap, Users, FileCheck, CheckCircle2, 
  AlertTriangle, Clock, XCircle, ChevronRight, Upload, Info,
  Save, Sparkles, LogOut, ArrowLeft, ArrowRight, Eye, Phone, Trash2, FileText, Bell
} from 'lucide-react';
import { StudentProfile, StudentDocuments, User, RegistrationStatus } from '../types';

interface StudentDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateLanding: () => void;
}

export default function StudentDashboard({
  currentUser,
  onLogout,
  onUpdateUser,
  onNavigateLanding
}: StudentDashboardProps) {
  // Tabs: 'personal' | 'pathway' | 'address' | 'school_parents' | 'documents' | 'announcement'
  const [activeTab, setActiveTab] = useState<'personal' | 'pathway' | 'address' | 'school_parents' | 'documents' | 'announcement'>('personal');
  
  // Local form states (initialized with current user data or default empty structures)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const defaultProf: StudentProfile = {
      personalInfo: { name: currentUser.name, nisn: '', birthPlace: '', birthDate: '', gender: '', religion: '', phone: '' },
      addressInfo: { street: '', rtRw: '', village: '', district: '', city: '', province: '', postalCode: '' },
      schoolInfo: { previousSchool: '', graduationYear: '2026', schoolAddress: '', ijazaNumber: '' },
      parentsInfo: { fatherName: '', fatherJob: '', fatherPhone: '', motherName: '', motherJob: '', motherPhone: '' },
      pathwayInfo: {
        type: '',
        zonasi: { distance: '' },
        afirmasi: { hasKip: '', kipFileName: null, kipFileUrl: null },
        prestasi: { category: '', academicRank: '', academicAverage: '', nonAcademicDescription: '' },
        mutasi: { originLocation: '', targetDestination: '' }
      }
    };

    if (!currentUser.profile) return defaultProf;

    // Deep merge or ensure pathwayInfo properties exist
    const merged = { ...currentUser.profile };
    if (!merged.pathwayInfo) {
      merged.pathwayInfo = defaultProf.pathwayInfo;
    } else {
      // make sure subordinate structures exist
      merged.pathwayInfo = {
        type: merged.pathwayInfo.type || '',
        zonasi: { distance: merged.pathwayInfo.zonasi?.distance || '' },
        afirmasi: {
          hasKip: merged.pathwayInfo.afirmasi?.hasKip || '',
          kipFileName: merged.pathwayInfo.afirmasi?.kipFileName || null,
          kipFileUrl: merged.pathwayInfo.afirmasi?.kipFileUrl || null
        },
        prestasi: {
          category: merged.pathwayInfo.prestasi?.category || '',
          academicRank: merged.pathwayInfo.prestasi?.academicRank || '',
          academicAverage: merged.pathwayInfo.prestasi?.academicAverage || '',
          nonAcademicDescription: merged.pathwayInfo.prestasi?.nonAcademicDescription || ''
        },
        mutasi: {
          originLocation: merged.pathwayInfo.mutasi?.originLocation || '',
          targetDestination: merged.pathwayInfo.mutasi?.targetDestination || ''
        }
      };
    }
    return merged as StudentProfile;
  });

  const [documents, setDocuments] = useState<StudentDocuments>(currentUser.documents || {
    familyCard: null, familyCardName: null,
    graduationCertificate: null, graduationCertificateName: null,
    birthCertificate: null, birthCertificateName: null,
    photo: null, photoName: null
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // File drag states
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({
    familyCard: false,
    graduationCertificate: false,
    birthCertificate: false,
    photo: false
  });

  // Handle generic profile input updates
  const handlePersonalChange = (key: keyof typeof profile.personalInfo, value: string) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [key]: value }
    }));
  };

  const handleAddressChange = (key: keyof typeof profile.addressInfo, value: string) => {
    setProfile(prev => ({
      ...prev,
      addressInfo: { ...prev.addressInfo, [key]: value }
    }));
  };

  const handleSchoolParentsChange = (section: 'schoolInfo' | 'parentsInfo', key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handlePathwayTypeChange = (type: 'Zonasi' | 'Afirmasi' | 'Prestasi' | 'Mutasi' | '') => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        type
      }
    }));
  };

  const handleZonasiChange = (distance: string) => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        zonasi: { distance }
      }
    }));
  };

  const handleAfirmasiChange = (hasKip: 'Ya' | 'Tidak' | '') => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        afirmasi: {
          ...prev.pathwayInfo?.afirmasi,
          hasKip,
          kipFileName: hasKip === 'Tidak' ? null : (prev.pathwayInfo?.afirmasi?.kipFileName || null),
          kipFileUrl: hasKip === 'Tidak' ? null : (prev.pathwayInfo?.afirmasi?.kipFileUrl || null)
        }
      }
    }));
  };

  const simulateKipUpload = (fileName: string) => {
    const mockUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop";
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        afirmasi: {
          ...prev.pathwayInfo?.afirmasi!,
          kipFileName: fileName,
          kipFileUrl: mockUrl
        }
      }
    }));
  };

  const deleteKipDocument = () => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        afirmasi: {
          ...prev.pathwayInfo?.afirmasi!,
          kipFileName: null,
          kipFileUrl: null
        }
      }
    }));
  };

  const handlePrestasiCategoryChange = (category: 'Akademik' | 'Non-Akademik' | '') => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        prestasi: {
          ...prev.pathwayInfo?.prestasi!,
          category
        }
      }
    }));
  };

  const handleAcademicChange = (key: 'academicRank' | 'academicAverage', value: string) => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        prestasi: {
          ...prev.pathwayInfo?.prestasi!,
          [key]: value
        }
      }
    }));
  };

  const handleNonAcademicChange = (description: string) => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        prestasi: {
          ...prev.pathwayInfo?.prestasi!,
          nonAcademicDescription: description
        }
      }
    }));
  };

  const handleMutasiChange = (key: 'originLocation' | 'targetDestination', value: string) => {
    setProfile(prev => ({
      ...prev,
      pathwayInfo: {
        ...prev.pathwayInfo!,
        mutasi: {
          ...prev.pathwayInfo?.mutasi!,
          [key]: value
        }
      }
    }));
  };

  // Simulated Document Upload trigger
  const simulateUpload = (docType: keyof StudentDocuments, fileName: string, customUrl?: string) => {
    // Generate a beautiful, high-quality Unsplash image placeholder based on the docType for rich UI previews
    let mockUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop";
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      // PDF file format marker
      mockUrl = "data:application/pdf;base64,JVBERi0xLjQKJbXtrscKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDQgMCBSID4+ID4+CiAgICAgL0NvbnRlbnRzIDUgMCBSCiAgPj4KZW5kb2JqCjQgMCBvYmoKICA8PCAvVHlwZSAvRm9udAogICAgIC9TdWJ0eXBlIC9UeXBlMQogICAgIC9CYXNlRm9udCAvSGVsdmV0aWNhCiAgPj4KZW5kb2JqCjUgMCBvYmoKICA8PCAvTGVuZ3RoIDQzID4+CnN0cmVhbQpCVAovRjEgMTIgVGYKODQgNzg0IFRkCihIZWxsbywgV29ybGQhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNyAwMDAwMCBuIAowMDAwMDAwMDgxIDAwMDAwIG4gCjAwMDAwMDAxNTAgMDAwMDAgbSamplePDF";
    } else if (docType === 'photo') {
      mockUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&h=200&fit=crop";
    } else if (docType === 'familyCard') {
      mockUrl = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop";
    } else if (docType === 'birthCertificate') {
      mockUrl = "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop";
    }

    const nameKey = `${docType}Name` as keyof StudentDocuments;

    setDocuments(prev => ({
      ...prev,
      [docType]: customUrl || mockUrl,
      [nameKey]: fileName
    }));
  };

  // Drag over handlers
  const handleDrag = (e: React.DragEvent, docType: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [docType]: active }));
  };

  const handleDrop = (e: React.DragEvent, docType: keyof StudentDocuments) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [docType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        simulateUpload(docType, file.name, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelector = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof StudentDocuments) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        simulateUpload(docType, file.name, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteDocument = (docType: keyof StudentDocuments) => {
    const nameKey = `${docType}Name` as keyof StudentDocuments;
    setDocuments(prev => ({
      ...prev,
      [docType]: null,
      [nameKey]: null
    }));
  };

  // Save current drafts
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const updatedUser: User = {
      ...currentUser,
      profile,
      documents
    };
    onUpdateUser(updatedUser);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  // Submit profile for verification
  const handleSubmitForVerification = () => {
    // Basic verification - check if critical fields are entered or if all documents are present
    const errors: string[] = [];
    if (!profile.personalInfo.nisn) errors.push('NISN wajib diisi');
    if (!profile.personalInfo.phone) errors.push('No HP wajib diisi');
    if (!profile.addressInfo.street) errors.push('Nama Jalan alamat wajib diisi');
    if (!profile.schoolInfo.previousSchool) errors.push('Sekolah Asal wajib diisi');

    // Pathway validations
    const pathw = profile.pathwayInfo;
    if (!pathw?.type) {
      errors.push('Jalur Pendaftaran harus dipilih terlebih dahulu');
    } else {
      if (pathw.type === 'Zonasi' && !pathw.zonasi?.distance) {
        errors.push('Lebar jarak domisili ke sekolah wajib diisi untuk Jalur Zonasi');
      } else if (pathw.type === 'Afirmasi') {
        if (!pathw.afirmasi?.hasKip) {
          errors.push('Pernyataan KIP / Surat Keterangan tidak mampu wajib diisi');
        }
        if (pathw.afirmasi?.hasKip === 'Ya' && !pathw.afirmasi?.kipFileUrl) {
          errors.push('Unduhan bukti kelengkapan KIP / Gakin wajib diunggah untuk Jalur Afirmasi');
        }
      } else if (pathw.type === 'Prestasi') {
        if (!pathw.prestasi?.category) {
          errors.push('Kategori prestasi (Akademik / Non-Akademik) wajib ditentukan');
        } else if (pathw.prestasi.category === 'Akademik' && (!pathw.prestasi.academicRank || !pathw.prestasi.academicAverage)) {
          errors.push('Peringkat kelas dan nilai rata-rata wajib diisi untuk Jalur Prestasi Akademik');
        } else if (pathw.prestasi.category === 'Non-Akademik' && !pathw.prestasi.nonAcademicDescription) {
          errors.push('Perolehan rincian prestasi non-akademik wajib dicantumkan');
        }
      } else if (pathw.type === 'Mutasi' && (!pathw.mutasi?.originLocation || !pathw.mutasi?.targetDestination)) {
        errors.push('Asal daerah pembawaan tugas dan domisili baru wajib diisi untuk Jalur Mutasi');
      }
    }

    if (!documents.familyCard || !documents.graduationCertificate || !documents.birthCertificate || !documents.photo) {
      errors.push('Seluruh 4 Dokumen wajib diunggah');
    }

    if (errors.length > 0) {
      alert(`Mohon lengkapi terlebih dahulu seluruh berkas Anda:\n\n• ${errors.join('\n• ')}`);
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      profile,
      documents,
      registrationStatus: 'SEDANG_DIVERIFIKASI',
      notes: 'Berkas selesai diunggah secara mandiri oleh siswa. Menunggu panitia memverifikasi administrasi pendaftaran.'
    };

    onUpdateUser(updatedUser);

    // Dynamic Google Sheet background syncing via Web App
    const sheetId = localStorage.getItem('ppdb_google_sheet_id');
    const oldDefault1 = 'https://script.google.com/macros/s/AKfycbyZg8jTEPhv0v7_WE35C0ltN6h1ZsZxjfGWDi6XOCJ5McBQEK9MTbfn5psVmwOBlIfF4Q/exec';
    const oldDefault2 = 'https://script.google.com/a/macros/guru.smp.belajar.id/s/AKfycbyNzEJgfGwCrMmgOrH5ACGbjnnF3DBkDxagr71BFrdMaTulwQVTSEyUWngZW7jbvsdRmQ/exec';
    const newDefault = 'https://script.google.com/macros/s/AKfycbz58cVhj0kWLtMKPQ5WW4qj2Lox0lTvTiU44W24fOrFokFnesMBSOxa4PAPZMN-aA5M/exec';
    let appsScriptUrl = localStorage.getItem('ppdb_google_apps_script_url');
    if (!appsScriptUrl || appsScriptUrl === oldDefault1 || appsScriptUrl === oldDefault2) {
      appsScriptUrl = newDefault;
      localStorage.setItem('ppdb_google_apps_script_url', newDefault);
    }

    if (appsScriptUrl && sheetId) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit_student',
          spreadsheetId: sheetId,
          student: updatedUser
        })
      }).then(() => {
        console.log('Synchronized student registration to Google Sheet successfully.');
      }).catch(err => {
        console.warn('Google Sheets background sync failed:', err);
      });
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  // Calculate fields completion rate
  const getProgressPercentage = () => {
    let fields = 0;
    let filled = 0;

    // Personal Info Fields (7)
    const personalKeys: (keyof typeof profile.personalInfo)[] = ['name', 'nisn', 'birthPlace', 'birthDate', 'gender', 'religion', 'phone'];
    personalKeys.forEach(k => {
      fields++;
      if (profile.personalInfo[k]) filled++;
    });

    // Address Info Fields (4 key)
    const addressKeys: (keyof typeof profile.addressInfo)[] = ['street', 'village', 'district', 'city'];
    addressKeys.forEach(k => {
      fields++;
      if (profile.addressInfo[k]) filled++;
    });

    // School Asal & Wali (5 key)
    if (profile.schoolInfo.previousSchool) filled++; fields++;
    if (profile.schoolInfo.graduationYear) filled++; fields++;
    if (profile.parentsInfo.fatherName) filled++; fields++;
    if (profile.parentsInfo.motherName) filled++; fields++;
    if (profile.parentsInfo.motherPhone || profile.parentsInfo.fatherPhone) filled++; fields++;

    // Pathway Info fields
    fields++; // Select path type
    if (profile.pathwayInfo?.type) {
      filled++;
      const type = profile.pathwayInfo.type;
      if (type === 'Zonasi') {
        fields++;
        if (profile.pathwayInfo.zonasi?.distance) filled++;
      } else if (type === 'Afirmasi') {
        fields++; // hasKip
        if (profile.pathwayInfo.afirmasi?.hasKip) {
          filled++;
          if (profile.pathwayInfo.afirmasi.hasKip === 'Ya') {
            fields++;
            if (profile.pathwayInfo.afirmasi.kipFileUrl) filled++;
          }
        }
      } else if (type === 'Prestasi') {
        fields++; // category
        if (profile.pathwayInfo.prestasi?.category) {
          filled++;
          if (profile.pathwayInfo.prestasi.category === 'Akademik') {
            fields += 2; // rank + average
            if (profile.pathwayInfo.prestasi.academicRank) filled++;
            if (profile.pathwayInfo.prestasi.academicAverage) filled++;
          } else {
            fields++; // nonAcademicDescription
            if (profile.pathwayInfo.prestasi.nonAcademicDescription) filled++;
          }
        }
      } else if (type === 'Mutasi') {
        fields += 2; // originLocation + targetDestination
        if (profile.pathwayInfo.mutasi?.originLocation) filled++;
        if (profile.pathwayInfo.mutasi?.targetDestination) filled++;
      }
    }

    // Documents (4)
    fields += 4;
    if (documents.familyCard) filled++;
    if (documents.graduationCertificate) filled++;
    if (documents.birthCertificate) filled++;
    if (documents.photo) filled++;

    return Math.round((filled / fields) * 100);
  };

  const pct = getProgressPercentage();

  // Status visual component
  const renderStatusAlert = (status: RegistrationStatus = 'BELUM_LENGKAP') => {
    switch (status) {
      case 'BELUM_LENGKAP':
        return (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-base mb-1">📝 Biodata &amp; Berkas Belum Lengkap</h4>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed mb-3">
                Akun pendaftaran Anda berhasil terdaftar. Silakan lengkapi seluruh formulir profil Anda di kolom tab bawah (Biodata, Alamat, Orang Tua/Asal Sekolah, dan Unggah Berkas). Setelah seluruh data mencapai 100%, silakan ajukan verifikasi berkas.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-200 font-bold px-2.5 py-1 rounded-md text-amber-900">
                  Kemajuan Data: {pct}%
                </span>
                <span className="text-[11px] text-amber-700 font-medium">Lengkapi formulir untuk membuka tombol "Ajukan Verifikasi"</span>
              </div>
            </div>
          </div>
        );
      case 'SEDANG_DIVERIFIKASI':
        return (
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-base mb-1">🔍 Dokumen Sedang Diperiksa Panitia</h4>
              <p className="text-xs sm:text-sm text-indigo-800 leading-relaxed mb-3">
                Terima kasih! Berkas Anda telah terkirim kepada Panitia PPDB sekolah kami. Saat ini status berkas Anda sedang dalam tahap verifikasi validitas dan zonasi tempat tinggal. Selama proses ini berjalan, Anda tidak dapat mengubah biodata kecuali diberikan tinjauan ulang oleh Admin.
              </p>
              {currentUser.notes && (
                <div className="p-3 bg-white/70 border border-indigo-200/50 rounded-xl">
                  <p className="text-xs font-mono text-indigo-950">
                    <strong>Catatan Panitia:</strong> {currentUser.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 'DIVERIFIKASI':
        return (
          <div className="bg-blue-50 border border-blue-100 text-blue-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-base mb-1">✅ Berkas Terverifikasi Sah!</h4>
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed mb-3">
                Selamat! Hasil pengecekan administrasi berkas kelengkapan Anda dinyatakan **VALID &amp; SAH** oleh Panitia PPDB. Data diri Anda telah dimasukkan dalam sistem database kuota zonasi utama. Silakan menunggu pengumuman hasil kelulusan penerimaan final sesuai kalender jadwal pendaftaran.
              </p>
              {currentUser.notes && (
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                  📌 {currentUser.notes}
                </p>
              )}
            </div>
          </div>
        );
      case 'LULUS':
        return (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-6 rounded-2xl flex flex-col sm:flex-row items-start gap-5 shadow-xs">
            <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md rotate-3 flex-shrink-0">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-lg text-emerald-900 tracking-tight mb-1">🎉 SELAMAT! ANDA DINYATAKAN LULUS SELEKSI PPDB</h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed mb-4">
                Berdasarkan hasil musyawarah panitia pendaftaran dan akurasi skor kelayakan data, Anda secara resmi dinyatakan **DITERIMA** sebagai siswa baru di **{currentUser.notes || 'SMP Negeri 1 Wanaraya'}** Tahun Ajaran 2026/2027.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-white/80 border border-emerald-200 rounded-xl px-4 py-3 flex-1">
                  <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">No. Keputusan</span>
                  <span className="font-mono text-xs text-emerald-950 font-bold">SK-PPDB/2026/00{currentUser.pendaftaranId?.split('-').pop()}</span>
                </div>
                <div className="bg-white/80 border border-emerald-200 rounded-xl px-4 py-3 flex-1 flex flex-col justify-center">
                  <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Langkah Lanjut</span>
                  <span className="text-xs text-slate-800 font-extrabold">Wajib Daftar Ulang Fisik (12-15 Juli)</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'TIDAK_LULUS':
        return (
          <div className="bg-rose-50 border border-rose-200 text-rose-950 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-xl flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-base text-rose-900 mb-1">❌ Belum Diterima Seleksi</h4>
              <p className="text-xs sm:text-sm text-rose-800 leading-relaxed mb-3">
                Kami mohon maaf yang mendalam, setelah melalui proses verifikasi dan penyaringan kuota seleksi PPDB, Anda saat ini **Belum Dinyatakan Lulus** seleksi di SMP Negeri 1 Wanaraya. Terima kasih yang tak terhingga atas minat besar dan perjuangan mendaftar di sekolah kami. Tetap semangat mengukir masa depan cerah di institusi pendidikan lainnya!
              </p>
              {currentUser.notes && (
                <div className="p-3 bg-white/70 border border-rose-200/50 rounded-xl">
                  <p className="text-xs text-rose-950">
                    <strong>Alasan Panitia:</strong> {currentUser.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const isReadOnly = currentUser.registrationStatus === 'SEDANG_DIVERIFIKASI' || 
                      currentUser.registrationStatus === 'DIVERIFIKASI' ||
                      currentUser.registrationStatus === 'LULUS' ||
                      currentUser.registrationStatus === 'TIDAK_LULUS';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="student-dashboard">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 text-white py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800 flex justify-between items-center text-xs">
        <button
          onClick={onNavigateLanding}
          className="hover:text-emerald-400 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Buka Halaman Rumah Sekolah
        </button>
        <span className="text-slate-400 font-mono hidden md:inline">Sesi: Pendaftaran Siswa Baru T.A. 2026/2027</span>
      </div>

      <header className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl text-slate-900 leading-tight">{currentUser.name}</h2>
                <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold select-none text-slate-600">
                  Siswa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                ID Pendaftaran: <strong className="text-emerald-700 font-mono">{currentUser.pendaftaranId}</strong> • Registered: {currentUser.registeredAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar Akun
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col gap-6 w-full">
        
        {/* LANDING NOTIFICATION STATUS BLOCK */}
        {renderStatusAlert(currentUser.registrationStatus)}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION NAVIGATION AND SUMMARIES */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4">Urutan Pengisian</h5>
              
              <div className="flex flex-col gap-1 text-slate-600">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'personal' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" /> 1. Biodata Pribadi
                  </span>
                  {profile.personalInfo.nisn && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'address' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 2. Alamat Tinggal
                  </span>
                  {profile.addressInfo.street && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => setActiveTab('school_parents')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'school_parents' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> 3. Asal Sekolah &amp; Wali
                  </span>
                  {profile.schoolInfo.previousSchool && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => setActiveTab('pathway')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'pathway' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> 4. Jalur Pendaftaran
                  </span>
                  {profile.pathwayInfo?.type && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'documents' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> 5. Unggah Berkas
                  </span>
                  {documents.photo && documents.familyCard && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('announcement')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'announcement' ? 'bg-indigo-50 text-indigo-900 border-l-2 border-indigo-600 font-bold animate-pulse' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" /> 6. Cek Pengumuman
                  </span>
                  {currentUser.registrationStatus === 'LULUS' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xl font-black uppercase animate-bounce">LULUS</span>
                  ) : currentUser.registrationStatus === 'TIDAK_LULUS' ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-xl font-bold uppercase">GAGAL</span>
                  ) : currentUser.registrationStatus === 'DIVERIFIKASI' ? (
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xl font-bold uppercase">SAH</span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-xl font-bold uppercase">PROSES</span>
                  )}
                </button>
              </div>

              {/* Progress Bar Component */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                  <span>Kelengkapan Berkas</span>
                  <span className="text-emerald-700 font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* ACTION CENTER - SUBMIT TO VERIFY */}
            {!isReadOnly && (
              <div className="bg-emerald-900 text-emerald-100 border border-emerald-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">Konfirmasi Kelengkapan</h5>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Jika kemajuan data sudah mencapai **100%**, pastikan Anda mengklik tombol "Kirim Berkas" di bawah demi pengajuan verifikasi administrasi ke panitia sekolah.
                </p>
                <button
                  onClick={handleSubmitForVerification}
                  disabled={pct < 100}
                  className={`w-full py-3 text-emerald-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md ${
                    pct >= 100 
                      ? 'bg-emerald-400 hover:bg-emerald-300 cursor-pointer text-emerald-950 shadow-emerald-950/20' 
                      : 'bg-emerald-800 text-emerald-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  Kirim Berkas Sekarang
                </button>
              </div>
            )}
          </div>

          {/* MAIN TAB FORM MODULE (Left / 9 columns) */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            
            {/* SUCCESS BANNER SAVING SYSTEM */}
            {saveSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <span>💾 Data pendaftaran draf berhasil tersimpan aman di sistem lokal!</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md">Tersimpan</span>
              </div>
            )}

            {submitSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold flex items-center justify-between">
                <span>🚀 Berkas kiriman pendaftaran Anda telah berhasil diserahkan kepada Panitia PPDB!</span>
                <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-bold">TERKIRIM</span>
              </div>
            )}

            {isReadOnly && (
              <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Saat ini formulir bersangkutan bersifat <strong>HANYA BACA (Read-Only)</strong> karena akun Anda sedang dalam tahap seleksi atau selesai diverifikasi.</span>
              </div>
            )}

            <form onSubmit={handleSaveDraft} className="flex flex-col gap-6">
              
              {/* TAB 1: BIODATA PRIBADI */}
              {activeTab === 'personal' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-emerald-600" /> 1. Informasi Biodata Pribadi Calon Siswa
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Sertakan informasi data kependudukan pendaftaran resmi Anda</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.name}
                        onChange={(e) => handlePersonalChange('name', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Nomor Induk Siswa Nasional (NISN)</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        maxLength={10}
                        value={profile.personalInfo.nisn}
                        onChange={(e) => handlePersonalChange('nisn', e.target.value.replace(/[^0-9]/g, ''))}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="10 digit NISN Anda"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Tempat Lahir</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.birthPlace}
                        onChange={(e) => handlePersonalChange('birthPlace', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: Jakarta"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.birthDate}
                        onChange={(e) => handlePersonalChange('birthDate', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Jenis Kelamin</label>
                      <select
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.gender}
                        onChange={(e) => handlePersonalChange('gender', e.target.value as 'Laki-laki' | 'Perempuan')}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Agama</label>
                      <select
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.religion}
                        onChange={(e) => handlePersonalChange('religion', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Pilih Agama --</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Nomor Handphone (Aktif WhatsApp)</label>
                      <input
                        type="tel"
                        required
                        disabled={isReadOnly}
                        value={profile.personalInfo.phone}
                        onChange={(e) => handlePersonalChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: 0812XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ALAMAT TINGGAL */}
              {activeTab === 'address' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600" /> 2. Alamat Domisili Utama Calon Siswa
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Alamat domisili yang terdaftar resmi pada rincian Kartu Keluarga (KK)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Nama Jalan, No. Rumah, Komplek / Dusun</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: Jl. Diponegoro Indah No. 4B"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">RT / RW</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.rtRw}
                        onChange={(e) => handleAddressChange('rtRw', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: 012/003"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Kelurahan / Desa</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.village}
                        onChange={(e) => handleAddressChange('village', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Masukkan kelurahan"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Kecamatan</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.district}
                        onChange={(e) => handleAddressChange('district', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Masukkan kecamatan"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Kota / Kabupaten</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: Kota Bekasi"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Provinsi</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        value={profile.addressInfo.province}
                        onChange={(e) => handleAddressChange('province', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Contoh: Jawa Barat"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Kode Pos</label>
                      <input
                        type="text"
                        required
                        disabled={isReadOnly}
                        maxLength={5}
                        value={profile.addressInfo.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value.replace(/[^0-9]/g, ''))}
                        className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                        placeholder="Masukkan 5 digit kode pos"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEKOLAH ASAL & WALI */}
              {activeTab === 'school_parents' && (
                <div className="flex flex-col gap-8">
                  {/* Sub section A: Asal Sekolah */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-600" /> 3a. Informasi Sekolah Asal (SD / MI)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Sertakan rincian data kelulusan instansi pendidikan dasar Anda</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Nama Sekolah Dasar Asal</label>
                        <input
                          type="text"
                          required
                          disabled={isReadOnly}
                          value={profile.schoolInfo.previousSchool}
                          onChange={(e) => handleSchoolParentsChange('schoolInfo', 'previousSchool', e.target.value)}
                          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                          placeholder="Contoh: SDN Menteng 01"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Tahun Kelulusan</label>
                        <input
                          type="text"
                          required
                          disabled={isReadOnly}
                          maxLength={4}
                          value={profile.schoolInfo.graduationYear}
                          onChange={(e) => handleSchoolParentsChange('schoolInfo', 'graduationYear', e.target.value.replace(/[^0-9]/g, ''))}
                          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                          placeholder="Contoh: 2026"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Alamat Sekolah Asal</label>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={profile.schoolInfo.schoolAddress}
                          onChange={(e) => handleSchoolParentsChange('schoolInfo', 'schoolAddress', e.target.value)}
                          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 disabled:opacity-75 disabled:cursor-not-allowed"
                          placeholder="Masukkan alamat jalan sekolah asal"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Nomor Seri Ijazah / SKL</label>
                        <input
                          type="text"
                          required
                          disabled={isReadOnly}
                          value={profile.schoolInfo.ijazaNumber}
                          onChange={(e) => handleSchoolParentsChange('schoolInfo', 'ijazaNumber', e.target.value)}
                          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                          placeholder="Nomor Seri Ijazah (misal: DN-01/D-SD/... )"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub section B: Orang Tua / Wali */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" /> 3b. Informasi Data Orang Tua Kandung / Wali
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Konfirmasi identitas wali pertanggungjawaban sekolah murid</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Father info */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200/50 pb-1.5 flex items-center gap-2">👨 Ayah Kandung</h4>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600">Nama Lengkap Ayah</label>
                          <input
                            type="text"
                            required
                            disabled={isReadOnly}
                            value={profile.parentsInfo.fatherName}
                            onChange={(e) => handleSchoolParentsChange('parentsInfo', 'fatherName', e.target.value)}
                            className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                            placeholder="Sesuai Akta Anak"
                          />
                        </div>
                        <div className="flex grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">Pekerjaan</label>
                            <input
                              type="text"
                              disabled={isReadOnly}
                              value={profile.parentsInfo.fatherJob}
                              onChange={(e) => handleSchoolParentsChange('parentsInfo', 'fatherJob', e.target.value)}
                              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                              placeholder="Wiraswasta / PNS"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">No HP</label>
                            <input
                              type="tel"
                              disabled={isReadOnly}
                              value={profile.parentsInfo.fatherPhone}
                              onChange={(e) => handleSchoolParentsChange('parentsInfo', 'fatherPhone', e.target.value.replace(/[^0-9]/g, ''))}
                              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden font-mono"
                              placeholder="0813..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mother info */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200/50 pb-1.5 flex items-center gap-2">👩 Ibu Kandung</h4>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600">Nama Lengkap Ibu</label>
                          <input
                            type="text"
                            required
                            disabled={isReadOnly}
                            value={profile.parentsInfo.motherName}
                            onChange={(e) => handleSchoolParentsChange('parentsInfo', 'motherName', e.target.value)}
                            className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                            placeholder="Sesuai Akta Anak"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">Pekerjaan</label>
                            <input
                              type="text"
                              disabled={isReadOnly}
                              value={profile.parentsInfo.motherJob}
                              onChange={(e) => handleSchoolParentsChange('parentsInfo', 'motherJob', e.target.value)}
                              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                              placeholder="Ibu Rumah Tangga"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-600">No HP</label>
                            <input
                              type="tel"
                              disabled={isReadOnly}
                              value={profile.parentsInfo.motherPhone}
                              onChange={(e) => handleSchoolParentsChange('parentsInfo', 'motherPhone', e.target.value.replace(/[^0-9]/g, ''))}
                              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden font-mono"
                              placeholder="0812..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: JALUR PENDAFTARAN */}
              {activeTab === 'pathway' && (
                <div className="flex flex-col gap-6" id="pathway-selection-section">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" /> 4. Penentuan Jalur Pendaftaran Calon Siswa
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Pilih salah satu dari 4 jalur penerimaan resmi sesuai kondisi administrasi pendaftar</p>
                  </div>

                  {/* Pathways Grid Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'Zonasi' as const,
                        title: 'Jalur Zonasi',
                        desc: 'Berdasarkan radius jarak domisili tinggal terdekat ke sekolah.',
                        color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 text-emerald-800'
                      },
                      {
                        id: 'Afirmasi' as const,
                        title: 'Jalur Afirmasi',
                        desc: 'Khusus bagi siswa dari keluarga kurang mampu pemegang KIP.',
                        color: 'border-purple-200 hover:border-purple-400 bg-purple-50/20 text-purple-800'
                      },
                      {
                        id: 'Prestasi' as const,
                        title: 'Jalur Prestasi',
                        desc: 'Berdasarkan prestasi nilai akademik maupun perlombaan non-akademik.',
                        color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 text-indigo-800'
                      },
                      {
                        id: 'Mutasi' as const,
                        title: 'Jalur Mutasi',
                        desc: 'Bagi siswa dengan perpindahan tugas pengabdian orang tua.',
                        color: 'border-amber-200 hover:border-amber-400 bg-amber-50/20 text-amber-800'
                      }
                    ].map((pwy) => (
                      <div
                        key={pwy.id}
                        type="button"
                        onClick={() => !isReadOnly && handlePathwayTypeChange(pwy.id)}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 relative ${
                          profile.pathwayInfo?.type === pwy.id
                            ? 'ring-2 ring-indigo-600 bg-indigo-50/40 border-indigo-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        } ${isReadOnly ? 'opacity-70 pointer-events-none' : ''}`}
                      >
                        {profile.pathwayInfo?.type === pwy.id && (
                          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-600 block" />
                        )}
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">{pwy.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">{pwy.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* PATHWAY CONDITIONAL FORMS */}
                  {profile.pathwayInfo?.type && (
                    <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* 1. ZONASI */}
                      {profile.pathwayInfo.type === 'Zonasi' && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Detail Persyaratan Jalur Zonasi</h4>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-700">Jarak Rumah ke Sekolah (Zonasi)</label>
                            <input
                              type="text"
                              required
                              disabled={isReadOnly}
                              value={profile.pathwayInfo.zonasi?.distance || ''}
                              onChange={(e) => handleZonasiChange(e.target.value)}
                              className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden w-full sm:max-w-md"
                              placeholder="Contoh: 350 meter atau 1.2 KM"
                            />
                            <p className="text-[11px] text-slate-400 font-medium">Ukur perkiraan jarak menggunakan Google Maps dari alamat rumah di Kartu Keluarga ke koordinat sekolah.</p>
                          </div>
                        </div>
                      )}

                      {/* 2. AFIRMASI */}
                      {profile.pathwayInfo.type === 'Afirmasi' && (
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-750" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Detail Dokumen Jalur Afirmasi</h4>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-slate-700">Apakah Memperoleh KIP (Kartu Indonesia Pintar) / Berstatus Siswa Kurang Mampu?</label>
                              <div className="flex gap-3">
                                {[
                                  { value: 'Ya' as const, label: 'Ya, Memiliki Kartu KIP / Surat Keterangan Tidak Mampu' },
                                  { value: 'Tidak' as const, label: 'Tidak' }
                                ].map((opt) => (
                                  <label 
                                    key={opt.value}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer text-xs transition-colors ${
                                      profile.pathwayInfo?.afirmasi?.hasKip === opt.value
                                        ? 'bg-purple-100/50 border-purple-300 text-purple-950 font-bold'
                                        : 'bg-white hover:bg-slate-100 border-slate-200'
                                    } ${isReadOnly ? 'pointer-events-none opacity-60' : ''}`}
                                  >
                                    <input 
                                      type="radio" 
                                      name="has_kip_radio"
                                      disabled={isReadOnly}
                                      checked={profile.pathwayInfo?.afirmasi?.hasKip === opt.value}
                                      onChange={() => handleAfirmasiChange(opt.value)}
                                      className="sr-only"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {profile.pathwayInfo.afirmasi?.hasKip === 'Ya' && (
                              <div className="flex flex-col gap-3 pt-3 border-t border-slate-200/50">
                                <label className="text-xs font-bold text-slate-700">Unggah Bukti KIP atau Surat Miskin (STKM/SDA)</label>
                                
                                {profile.pathwayInfo.afirmasi.kipFileUrl ? (
                                  <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl relative max-w-lg">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs shrink-0 select-none">
                                      KIP
                                    </div>
                                    <div className="overflow-hidden">
                                      <span className="block font-bold text-xs text-slate-800 leading-tight truncate">{profile.pathwayInfo.afirmasi.kipFileName}</span>
                                      <span className="block text-[10px] text-slate-400 font-medium">Berhasil diupload</span>
                                    </div>
                                    
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        onClick={deleteKipDocument}
                                        className="ml-auto p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-full max-w-lg">
                                    <label
                                      className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                        isReadOnly 
                                          ? 'bg-slate-100 border-slate-200/50 cursor-not-allowed opacity-50' 
                                          : 'bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/5'
                                      }`}
                                    >
                                      <input 
                                        type="file" 
                                        disabled={isReadOnly}
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            simulateKipUpload(e.target.files[0].name);
                                          }
                                        }}
                                        className="sr-only" 
                                      />
                                      <Upload className="w-7 h-7 text-purple-500 mb-2" />
                                      <span className="block font-extrabold text-xs text-slate-800">Klik untuk upload bukti berkas KIP / Siswa-Miskin</span>
                                      <span className="block text-[10px] text-slate-400 mt-1">Format PDF/PNG/JPG maks 2MB</span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      )}

                      {/* 3. PRESTASI */}
                      {profile.pathwayInfo.type === 'Prestasi' && (
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-750" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Detail Registrasi Jalur Prestasi</h4>
                          </div>

                          <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-slate-700">Pilih Kategori Prestasi</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              {[
                                { value: 'Akademik' as const, label: 'Prestasi Akademik (Peringkat Kelas & Rata-Rata Rapor)' },
                                { value: 'Non-Akademik' as const, label: 'Jalur Prestasi Non-Akademik (Sertifikat / Piagam Lomba)' }
                              ].map((opt) => (
                                <label 
                                  key={opt.value}
                                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer text-xs transition-colors ${
                                    profile.pathwayInfo?.prestasi?.category === opt.value
                                      ? 'bg-indigo-100/50 border-indigo-300 text-indigo-950 font-bold'
                                      : 'bg-white hover:bg-slate-100 border-slate-200'
                                  } ${isReadOnly ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                  <input 
                                    type="radio" 
                                    name="prestasi_category_radio"
                                    disabled={isReadOnly}
                                    checked={profile.pathwayInfo?.prestasi?.category === opt.value}
                                    onChange={() => handlePrestasiCategoryChange(opt.value)}
                                    className="sr-only"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {profile.pathwayInfo.prestasi?.category === 'Akademik' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/50 animate-in fade-in duration-150">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700">Peringkat Kelas Terakhir</label>
                                <input
                                  type="text"
                                  required
                                  disabled={isReadOnly}
                                  value={profile.pathwayInfo.prestasi.academicRank || ''}
                                  onChange={(e) => handleAcademicChange('academicRank', e.target.value)}
                                  className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                                  placeholder="Contoh: Peringkat Kelas 1 / Juara Umum"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-700">Rata-Rata Nilai Rapor Semester Terakhir</label>
                                <input
                                  type="text"
                                  required
                                  disabled={isReadOnly}
                                  value={profile.pathwayInfo.prestasi.academicAverage || ''}
                                  onChange={(e) => handleAcademicChange('academicAverage', e.target.value)}
                                  className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                                  placeholder="Contoh: 89.2 atau 92.5"
                                />
                              </div>
                            </div>
                          )}

                          {profile.pathwayInfo.prestasi?.category === 'Non-Akademik' && (
                            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/50 animate-in fade-in duration-150">
                              <label className="text-xs font-bold text-slate-700">Cantumkan Rincian Prestasi &amp; Kejuaraan</label>
                              <textarea
                                required
                                disabled={isReadOnly}
                                value={profile.pathwayInfo.prestasi.nonAcademicDescription || ''}
                                onChange={(e) => handleNonAcademicChange(e.target.value)}
                                rows={3}
                                className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden w-full resize-y font-medium"
                                placeholder="Sebutkan tingkat juara, nama kejuaraan, penyelenggara, dan tahun. Contoh: Juara 1 FLS2N Pidato Bahasa Inggris Kab. Bekasi 2025"
                              />
                            </div>
                          )}

                        </div>
                      )}

                      {/* 4. MUTASI */}
                      {profile.pathwayInfo.type === 'Mutasi' && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Detail Persyaratan Jalur Mutasi Kerja Ortu</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-700">Daerah / Instansi Asal Mutasi</label>
                              <input
                                type="text"
                                required
                                disabled={isReadOnly}
                                value={profile.pathwayInfo.mutasi?.originLocation || ''}
                                onChange={(e) => handleMutasiChange('originLocation', e.target.value)}
                                className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                                placeholder="Contoh: Polres Kab. Sukabumi / Dinas Pendidikan Bandung"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-700">Alamat Tujuan Tempat Tinggal yang Ditinggali (Saat Ini)</label>
                              <input
                                type="text"
                                required
                                disabled={isReadOnly}
                                value={profile.pathwayInfo.mutasi?.targetDestination || ''}
                                onChange={(e) => handleMutasiChange('targetDestination', e.target.value)}
                                className="p-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                                placeholder="Tuliskan alamat tinggal baru di dekat sekolah"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: UNGGAH SURAT / PERSYARATAN */}
              {activeTab === 'documents' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-emerald-600" /> 4. Unggah Scan Surat Berkas Persyaratan PPDB
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Harap unggah seluruh 4 dokumen wajib di bawah. PDF atau format gambar diperbolehkan.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document card generator helper */}
                    {[
                      { 
                        key: 'familyCard', 
                        label: '1. Scan Kartu Keluarga (KK)', 
                        desc: 'Kartu keluarga asli (format PDF/Gambar jernih)',
                        testFile: 'KK_Asli_Keluarga.pdf'
                      },
                      { 
                        key: 'graduationCertificate', 
                        label: '2. Scan Ijazah SD / SKL', 
                        desc: 'Lulusan SD/MI terafiliasi resmi Kementerian Pendidikan',
                        testFile: 'SKL_Lulus_SD_Asli.pdf'
                      },
                      { 
                        key: 'birthCertificate', 
                        label: '3. Scan Akta Kelahiran', 
                        desc: 'Menunjukkan keselarasan nama dan tanggal lahir',
                        testFile: 'Akta_Kelahiran_Negara.jpg'
                      },
                      { 
                        key: 'photo', 
                        label: '4. Pas Foto Formal (3x4)', 
                        desc: 'Wajib berlatar merah/biru, ekspresi formal',
                        testFile: 'Pas_Foto_PPDB_Terbaru.png'
                      }
                    ].map((doc) => {
                      const docKey = doc.key as keyof StudentDocuments;
                      const nameKey = `${doc.key}Name` as keyof StudentDocuments;
                      const fileIsUploaded = !!documents[docKey];
                      const fileName = documents[nameKey];

                      return (
                        <div 
                          key={doc.key}
                          className={`border rounded-2xl p-5 flex flex-col gap-3 relative transition-all ${
                            fileIsUploaded 
                              ? 'border-emerald-200 bg-emerald-50/10' 
                              : dragActive[doc.key] 
                                ? 'border-emerald-500 bg-emerald-50/30 border-dashed animate-pulse' 
                                : 'border-slate-200 hover:border-slate-300 border-dashed bg-slate-50/20'
                          }`}
                          onDragOver={(e) => !isReadOnly && handleDrag(e, doc.key, true)}
                          onDragLeave={(e) => !isReadOnly && handleDrag(e, doc.key, false)}
                          onDrop={(e) => !isReadOnly && handleDrop(e, docKey)}
                        >
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{doc.label}</h4>
                          <p className="text-[11px] text-slate-500">{doc.desc}</p>
                          
                          {fileIsUploaded ? (
                            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl mt-1">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-10 h-12 bg-slate-100 rounded-md border border-slate-200 flex-shrink-0 overflow-hidden relative group flex items-center justify-center">
                                  {fileName && (fileName.toLowerCase().endsWith('.pdf') || (documents[docKey] || '').startsWith('data:application/pdf')) ? (
                                    <FileText className="w-6 h-6 text-red-500 animate-pulse" />
                                  ) : (
                                    <img 
                                      src={documents[docKey] || ""} 
                                      alt="preview" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <span className="block text-xs font-bold text-slate-800 truncate">{fileName}</span>
                                  <span className="block text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                    🟢 Siap Diunggah
                                  </span>
                                </div>
                              </div>

                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => deleteDocument(docKey)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50/50 border border-slate-200/60 rounded-xl mt-1 gap-2 text-center group">
                              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-xs text-slate-600">
                                  {isReadOnly ? 'Dokumen Belum Diunggah' : 'Letakkan file di sini atau'}
                                </span>
                                
                                {!isReadOnly && (
                                  <>
                                    <label className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer">
                                      Pilih Berkas Komputer
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileSelector(e, docKey)}
                                        className="hidden"
                                      />
                                    </label>
                                    
                                    <span className="text-[10px] text-slate-400">Atau gunakan file demo standar:</span>
                                    <button
                                      type="button"
                                      onClick={() => simulateUpload(docKey, doc.testFile)}
                                      className="px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-bold hover:bg-emerald-50 transition-colors"
                                    >
                                      ⚡ Upload Otomatis '{doc.testFile}'
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: CEK PENGUMUMAN SELEKSI PPDB */}
              {activeTab === 'announcement' && (
                <div className="flex flex-col gap-6 animate-fadeIn" id="announcement-checking-section">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-600 animate-pulse" /> 6. Pengumuman Kelulusan Seleksi PPDB Online
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Pantau status pendaftaran, hasil seleksi utama, dan langkah-langkah selanjutnya di sini.</p>
                  </div>

                  {/* Rendering the alert right at the top for emphasis */}
                  <div>
                    {renderStatusAlert(currentUser.registrationStatus)}
                  </div>

                  {/* Detailed Information Card about the student */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Lembar Identitas Pendaftar</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">Nama Calon Siswa</span>
                        <strong className="text-slate-800 font-extrabold">{currentUser.name}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">ID Pendaftaran</span>
                        <strong className="font-mono text-slate-800 font-bold">{currentUser.pendaftaranId || 'Belum Dibuat'}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">Jalur Pendaftaran</span>
                        <strong className="text-indigo-700 font-extrabold">{profile.pathwayInfo?.type ? `Jalur ${profile.pathwayInfo.type}` : 'Belum Ditentukan'}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">NISN Terdaftar</span>
                        <strong className="font-mono text-slate-800 font-bold">{profile.personalInfo?.nisn || 'Belum Diisi'}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">Sekolah Asal</span>
                        <strong className="text-slate-800 font-bold">{profile.schoolInfo?.previousSchool || 'Belum Diisi'}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-slate-400 font-medium mb-1">Waktu Cek</span>
                        <strong className="text-slate-500 font-medium">{new Date().toLocaleString('id-ID')} WIB</strong>
                      </div>
                    </div>
                  </div>

                  {/* PPDB Flow Milestones / Timeline */}
                  <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/40">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-5">Timeline Prosedur PPDB 2026/2027</h4>
                    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 flex flex-col gap-6">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            Pendaftaran Akun
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">SELESAI</span>
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">Membuat akun dan menerima ID Pendaftaran resmi.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          pct >= 100 ? 'border-emerald-500' : 'border-slate-300'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            pct >= 100 ? 'bg-emerald-500' : 'bg-slate-300'
                          }`} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            Pengisian Formulir &amp; Berkas
                            {pct >= 100 ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">100% LENGKAP</span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">{pct}% BELUM LENGKAP</span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">Mengisi data diri, jalur pilihan, serta mengunggah file persyaratan lengkap.</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          currentUser.registrationStatus !== 'BELUM_LENGKAP' ? 'border-emerald-500' : 'border-slate-300'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            currentUser.registrationStatus !== 'BELUM_LENGKAP' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            Proses Verifikasi Panitia
                            {currentUser.registrationStatus === 'SEDANG_DIVERIFIKASI' && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-md animate-pulse">SEDANG BERJALAN</span>
                            )}
                            {currentUser.registrationStatus !== 'BELUM_LENGKAP' && currentUser.registrationStatus !== 'SEDANG_DIVERIFIKASI' && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">VERIFIED</span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">Pemeriksaan validasi berkas fisik, scan raport asli, serta akurasi radius peta zonasi domisili.</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          (currentUser.registrationStatus === 'LULUS' || currentUser.registrationStatus === 'TIDAK_LULUS') ? 'border-indigo-600 ring-2 ring-indigo-100 animate-pulse' : 'border-slate-300'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            (currentUser.registrationStatus === 'LULUS' || currentUser.registrationStatus === 'TIDAK_LULUS') ? 'bg-indigo-600' : 'bg-slate-300'
                          }`} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            Pengumuman Hasil Akhir
                            {currentUser.registrationStatus === 'LULUS' && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">DITERIMA / LULUS</span>
                            )}
                            {currentUser.registrationStatus === 'TIDAK_LULUS' && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-md">TIDAK LULUS SELEKSI</span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">Penetapan kuota kelulusan resmi PPDB. Pengumuman dirilis bertahap oleh sekolah.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Kalender / Jadwal PPDB */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jadwal Kalender PPDB 2026/2027</span>
                    <div className="flex flex-col gap-2.5 text-xs">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700">Pendaftaran &amp; Kelengkapan Berkas</span>
                        <span className="font-mono text-slate-500 font-medium">10 Juni - 30 Juni 2026</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700">Verifikasi Dokumen &amp; Lokasi Fisik</span>
                        <span className="font-mono text-slate-500 font-medium">01 Juli - 05 Juli 2026</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700">Pengumuman Kelulusan Akhir</span>
                        <span className="font-mono text-indigo-700 font-bold">10 Juli 2026</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700">Daftar Ulang Administrasi Fisik</span>
                        <span className="font-mono text-slate-500 font-medium">12 Juli - 15 Juli 2026</span>
                      </div>
                    </div>
                  </div>

                  {currentUser.registrationStatus === 'LULUS' && (
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                      <div>
                        <h5 className="font-extrabold text-sm sm:text-base">Mulai Siapkan Daftar Ulang Anda</h5>
                        <p className="text-[11px] text-indigo-100/90 leading-normal mt-0.5">Silakan unduh bukti kelulusan Anda untuk dibawa saat registrasi fisik ke SMP Negeri 1 Wanaraya.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Pengumuman: Bukti kelulusan Anda resmi terdaftar dengan ID Pendaftaran: ${currentUser.pendaftaranId}. Silakan cetak halaman ini sebagai bukti sementara untuk dibawa pada tanggal 12-15 Juli 2026!`)}
                        className="flex-shrink-0 bg-white hover:bg-slate-100 text-indigo-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        Cetak Bukti Lulus Cetak 🖨️
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* SAVE ACTION BUTTONS AT BOTTOM BAR */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
                <span className="text-slate-500 text-xs flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Progress input tab ini tersimpan otomatis saat Anda menekan tombol "Simpan Formulir"
                </span>

                <div className="flex gap-2 w-full sm:w-auto">
                  {activeTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ('personal' | 'address' | 'school_parents' | 'pathway' | 'documents' | 'announcement')[] = ['personal', 'address', 'school_parents', 'pathway', 'documents', 'announcement'];
                        const curIdx = tabs.indexOf(activeTab);
                        if (curIdx > 0) setActiveTab(tabs[curIdx - 1]);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      ← Kembali Tab
                    </button>
                  )}

                  {!isReadOnly && activeTab !== 'announcement' && (
                    <button
                      type="submit"
                      disabled={pct === 0}
                      className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Simpan Formulir
                    </button>
                  )}

                  {activeTab !== 'announcement' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: ('personal' | 'address' | 'school_parents' | 'pathway' | 'documents' | 'announcement')[] = ['personal', 'address', 'school_parents', 'pathway', 'documents', 'announcement'];
                        const curIdx = tabs.indexOf(activeTab);
                        if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1]);
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      Lanjut Tab →
                    </button>
                  ) : (
                    !isReadOnly && (
                      <button
                        type="button"
                        onClick={handleSubmitForVerification}
                        className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-400/10"
                      >
                        Ajukan Dokumen Verifikasi ✔
                      </button>
                    )
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
