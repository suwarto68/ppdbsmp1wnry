import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, Users, Calendar, Bell, Plus, Trash2, Edit2, CheckCircle, 
  XCircle, AlertCircle, FileText, Search, Filter, ShieldAlert,
  ArrowLeft, Phone, Mail, MapPin, ExternalLink, RefreshCw, Sparkles,
  Check, X, ChevronRight, User as UserIcon, GraduationCap, ArrowUpDown, Minimize2,
  FileSpreadsheet
} from 'lucide-react';
import { SchoolConfig, User, RegistrationStatus, StudentProfile, StudentDocuments } from '../types';
import { 
  initGoogleAuth, 
  signInGoogleSheets, 
  logoutGoogleSheets, 
  createGoogleSheet, 
  syncDataToGoogleSheet 
} from '../lib/googleSheets';

interface AdminDashboardProps {
  schoolConfig: SchoolConfig;
  onUpdateSchoolConfig: (config: SchoolConfig) => void;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
  onNavigateLanding: () => void;
}

export default function AdminDashboard({
  schoolConfig,
  onUpdateSchoolConfig,
  users,
  onUpdateUser,
  onDeleteUser,
  onLogout,
  onNavigateLanding
}: AdminDashboardProps) {
  // Tabs: 'applicants' | 'school' | 'sheets'
  const [activeSubTab, setActiveSubTab] = useState<'applicants' | 'school' | 'sheets'>('applicants');

  // SEC 3: GOOGLE SHEETS SYNCER STATE PROPERTIES
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
  
  const [sheetId, setSheetId] = useState<string | null>(localStorage.getItem('ppdb_google_sheet_id'));
  const [sheetUrl, setSheetUrl] = useState<string | null>(localStorage.getItem('ppdb_google_sheet_url'));
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('ppdb_last_sheets_sync'));
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(
    localStorage.getItem('ppdb_google_apps_script_url') || 
    'https://script.google.com/macros/s/AKfycbyZg8jTEPhv0v7_WE35C0ltN6h1ZsZxjfGWDi6XOCJ5McBQEK9MTbfn5psVmwOBlIfF4Q/exec'
  );
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Init Google authentication listener
  React.useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingInGoogle(true);
    setSyncStatus({ type: 'idle', message: '' });
    try {
      const res = await signInGoogleSheets();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSyncStatus({ type: 'success', message: 'Koneksi ke Akun Google berhasil diaktifkan!' });
      }
    } catch (e: any) {
      setSyncStatus({ type: 'error', message: e.message || 'Gagal login Google.' });
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogleSheets();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncStatus({ type: 'idle', message: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!googleToken) return;
    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: '' });
    try {
      const res = await createGoogleSheet(googleToken, schoolConfig.schoolName);
      setSheetId(res.id);
      setSheetUrl(res.url);
      localStorage.setItem('ppdb_google_sheet_id', res.id);
      localStorage.setItem('ppdb_google_sheet_url', res.url);
      
      // Perform initial sync automatically!
      await syncDataToGoogleSheet(res.id, users, googleToken);
      const timestamp = new Date().toLocaleString('id-ID');
      setLastSync(timestamp);
      localStorage.setItem('ppdb_last_sheets_sync', timestamp);
      
      // Trigger Google Apps Script Web App
      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ action: 'sync', spreadsheetId: res.id, timestamp })
          });
        } catch (scriptErr) {
          console.warn('Google Apps Script trigger non-blocking:', scriptErr);
        }
      }
      
      setSyncStatus({ type: 'success', message: 'Spreadsheet baru berhasil dibuat, data disinkronkan, & Apps Script dipicu!' });
    } catch (e: any) {
      setSyncStatus({ type: 'error', message: e.message || 'Gagal membuat Google Sheet.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (!googleToken || !sheetId) return;
    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: '' });
    try {
      await syncDataToGoogleSheet(sheetId, users, googleToken);
      const timestamp = new Date().toLocaleString('id-ID');
      setLastSync(timestamp);
      localStorage.setItem('ppdb_last_sheets_sync', timestamp);
      
      // Trigger Google Apps Script Web App
      if (appsScriptUrl) {
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ action: 'sync', spreadsheetId: sheetId, timestamp })
          });
        } catch (scriptErr) {
          console.warn('Google Apps Script trigger non-blocking:', scriptErr);
        }
      }
      
      setSyncStatus({ type: 'success', message: 'Sinkronisasi berhasil! Data terbaru telah dikirim & Web App Apps Script berhasil dipicu.' });
    } catch (e: any) {
      setSyncStatus({ type: 'error', message: e.message || 'Gagal menyinkronkan data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectSheet = () => {
    const ok = window.confirm('Apakah Anda yakin ingin melepas hubungan spreadsheet ini dari dashboard? (File asli di Google Drive Anda tidak akan dihapus)');
    if (ok) {
      setSheetId(null);
      setSheetUrl(null);
      localStorage.removeItem('ppdb_google_sheet_id');
      localStorage.removeItem('ppdb_google_sheet_url');
      setSyncStatus({ type: 'idle', message: '' });
    }
  };
  
  // SEC 1: APPLICANTS MANAGER
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('name');
  const [selectedApplicant, setSelectedApplicant] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Verification action States inside Applicant Modal
  const [adminStatusInput, setAdminStatusInput] = useState<RegistrationStatus>('BELUM_LENGKAP');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [showDocPreview, setShowDocPreview] = useState<{ url: string; label: string } | null>(null);

  // SEC 2: SCHOOL EDITORS
  const [editedConfig, setEditedConfig] = useState<SchoolConfig>({ ...schoolConfig });
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementIsImportant, setAnnouncementIsImportant] = useState(false);
  const [schoolEditSuccess, setSchoolEditSuccess] = useState(false);

  // Extract applicant students
  const students = users.filter(u => u.role === 'student');

  // Filter & Search Applicants logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.profile?.personalInfo.nisn || '').includes(searchTerm) ||
      (student.pendaftaranId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && student.registrationStatus === statusFilter;
  });

  // Sort Applicants logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      return (b.registeredAt || '').localeCompare(a.registeredAt || '');
    } else {
      // Sort by completion progress
      const progressA = getProgressRate(a);
      const progressB = getProgressRate(b);
      return progressB - progressA;
    }
  });

  function getProgressRate(user: User): number {
    if (!user.profile) return 0;
    let fields = 0, filled = 0;
    // Personal (7)
    const personalKeys: (keyof typeof user.profile.personalInfo)[] = ['name', 'nisn', 'birthPlace', 'birthDate', 'gender', 'religion', 'phone'];
    personalKeys.forEach(k => { fields++; if (user.profile?.personalInfo[k]) filled++; });
    // Address (4)
    const addressKeys: (keyof typeof user.profile.addressInfo)[] = ['street', 'village', 'district', 'city'];
    addressKeys.forEach(k => { fields++; if (user.profile?.addressInfo[k]) filled++; });
    // Documents (4)
    fields += 4;
    if (user.documents?.familyCard) filled++;
    if (user.documents?.graduationCertificate) filled++;
    if (user.documents?.birthCertificate) filled++;
    if (user.documents?.photo) filled++;
    return Math.round((filled / fields) * 100);
  }

  // Open candidate details inspector
  const handleInspectApplicant = (student: User) => {
    setSelectedApplicant(student);
    setAdminStatusInput(student.registrationStatus || 'BELUM_LENGKAP');
    setAdminNotesInput(student.notes || '');
  };

  // Submit verified status changes
  const handleSaveVerification = () => {
    if (!selectedApplicant) return;

    const updated: User = {
      ...selectedApplicant,
      registrationStatus: adminStatusInput,
      notes: adminNotesInput.trim()
    };

    onUpdateUser(updated);
    setSelectedApplicant(updated); // Reload details modal
    alert(`Status pendaftaran '${selectedApplicant.name}' berhasil diubah ke: ${adminStatusInput}!`);
  };

  // School profiling save
  const handleSaveSchoolProfiling = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolConfig(editedConfig);
    setSchoolEditSuccess(true);
    setTimeout(() => setSchoolEditSuccess(false), 2000);
  };

  // Timeline changes handler
  const handleTimelineChange = (id: string, field: 'label' | 'date' | 'desc', val: string) => {
    setEditedConfig(prev => ({
      ...prev,
      timeline: prev.timeline.map(t => t.id === id ? { ...t, [field]: val } : t)
    }));
  };

  // Add Announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      date: new Date().toISOString().split('T')[0],
      isImportant: announcementIsImportant
    };

    const updated = {
      ...editedConfig,
      announcements: [newAnn, ...editedConfig.announcements]
    };

    setEditedConfig(updated);
    onUpdateSchoolConfig(updated);
    
    // Clear
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setAnnouncementIsImportant(false);
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    const updated = {
      ...editedConfig,
      announcements: editedConfig.announcements.filter(a => a.id !== id)
    };
    setEditedConfig(updated);
    onUpdateSchoolConfig(updated);
  };

  // Count dashboard cards
  const totalStudents = students.length;
  const verifiedCount = students.filter(s => s.registrationStatus === 'DIVERIFIKASI').length;
  const acceptedCount = students.filter(s => s.registrationStatus === 'LULUS').length;
  const pendingCount = students.filter(s => s.registrationStatus === 'SEDANG_DIVERIFIKASI').length;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800" id="admin-dashboard-container">
      {/* TOP HEADER */}
      <div className="bg-slate-900 text-slate-400 py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800 flex justify-between items-center text-xs">
        <button
          onClick={onNavigateLanding}
          className="hover:text-emerald-400 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Buka Halaman Utama Sekolah
        </button>
        <span className="text-indigo-400 font-extrabold tracking-wider flex items-center gap-1">
          🛡️ MODE ADMINISTRATOR (PANITIA PPDB)
        </span>
      </div>

      <header className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-700 p-3 rounded-2xl">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 leading-tight">{schoolConfig.schoolName}</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                Administrator: <strong>Pak Suwarto, S.Pd.</strong> • Akses Verifikasi &amp; Konfigurasi Profil
              </p>
            </div>
          </div>

          {/* ADMIN PRIMARY TAB CONTROLS */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200/50 w-full md:w-auto self-start sm:self-center gap-1 sm:gap-0">
            <button
              onClick={() => setActiveSubTab('applicants')}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'applicants' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Manajemen Pendaftar ({totalStudents})
            </button>
            <button
              onClick={() => setActiveSubTab('school')}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'school' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit2 className="w-4 h-4" /> Kelola Website &amp; Profil
            </button>
            <button
              onClick={() => setActiveSubTab('sheets')}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'sheets' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Integrasi Google Sheets
            </button>
          </div>
        </div>
      </header>

      {/* CORE ADMIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col gap-6">
        
        {/* STATS STRIP BANNER */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registrasi Masuk</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-2">{totalStudents} Siswa</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Verifikasi</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 block mt-2">{pendingCount} Siswa</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Berkas Terverifikasi</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 block mt-2">{verifiedCount} Siswa</span>
          </div>
          <div className="bg-white border border-emerald-200 bg-emerald-50/10 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Dinyatakan Lulus</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-2">{acceptedCount} Siswa</span>
          </div>
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between col-span-2 md:col-span-1 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Kuota Kursi</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-2">
              {Math.max(0, schoolConfig.quota - acceptedCount)} / {schoolConfig.quota}
            </span>
          </div>
        </div>

        {/* TAB 1: MANAGE APPLICANTS LIST VIEW */}
        {activeSubTab === 'applicants' && (
          <div className="flex flex-col gap-5">
            {/* SEARCH, FILTER AND SORT PANEL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Nama, NISN, ID Pendaftaran, atau Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all bg-slate-50/50"
                />
              </div>

              {/* Filtering Status selector */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Filter className="w-3.5 h-3.5" /> Filter Status:
                </div>
                
                {[
                  { key: 'ALL', label: 'Semua' },
                  { key: 'BELUM_LENGKAP', label: 'Belum Lengkap' },
                  { key: 'SEDANG_DIVERIFIKASI', label: 'Verifikasi' },
                  { key: 'DIVERIFIKASI', label: 'Terverifikasi' },
                  { key: 'LULUS', label: 'Lulus' },
                  { key: 'TIDAK_LULUS', label: 'Tidak Lulus' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === f.key 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 w-full lg:w-auto sm:justify-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Urutan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'progress')}
                  className="p-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden bg-white font-bold text-slate-700"
                >
                  <option value="name">Abjad Nama</option>
                  <option value="date">Tanggal Daftar</option>
                  <option value="progress">Kelengkapan data</option>
                </select>
              </div>
            </div>

            {/* APPLICANT LIST TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
                      <th className="px-6 py-4">No. Pendaftaran / Tanggal</th>
                      <th className="px-6 py-4">Nama / NISN</th>
                      <th className="px-6 py-4">Sekolah Asal</th>
                      <th className="px-6 py-4 text-center">Kelengkapan</th>
                      <th className="px-6 py-4">Status Seleksi</th>
                      <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {sortedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400 font-semibold">
                          Tidak ditemukan calon pendaftar yang cocok dengan filter / pencarian.
                        </td>
                      </tr>
                    ) : (
                      sortedStudents.map((student, sIdx) => {
                        const progressRate = getProgressRate(student);
                        
                        // Status styling generator helper
                        const renderBadge = (status: RegistrationStatus = 'BELUM_LENGKAP') => {
                          switch (status) {
                            case 'BELUM_LENGKAP':
                              return <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">🔴 Belum Lengkap</span>;
                            case 'SEDANG_DIVERIFIKASI':
                              return <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold animate-pulse">⚡ Verifikasi</span>;
                            case 'DIVERIFIKASI':
                              return <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">🔵 Valid/Terverif</span>;
                            case 'LULUS':
                              return <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">🟢 Lulus Seleksi</span>;
                            case 'TIDAK_LULUS':
                              return <span className="inline-block px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">❌ Tidak Lulus</span>;
                          }
                        };

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-medium">
                              <span className="block font-mono text-xs text-indigo-700 font-bold">{student.pendaftaranId}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">📅 {student.registeredAt}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block font-extrabold text-sm text-slate-900">{student.name}</span>
                              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">NISN: {student.profile?.personalInfo.nisn || '---'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block text-slate-700 font-bold">{student.profile?.schoolInfo.previousSchool || '---'}</span>
                              <span className="block text-[10px] text-slate-500 mt-0.5">Lulus: {student.profile?.schoolInfo.graduationYear || '2026'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-600">{progressRate}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${progressRate === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                    style={{ width: `${progressRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold">{renderBadge(student.registrationStatus)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleInspectApplicant(student)}
                                  className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                  title="Detail & Verifikasi Berkas"
                                >
                                  Detail &amp; Verifikasi <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setUserToDelete(student)}
                                  className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all cursor-pointer"
                                  title="Hapus Calon Siswa mendaftar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT WEBSITE LANDING PAGE, TIMELINES AND ANNOUNCEMENTS */}
        {activeSubTab === 'school' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: School Info Form */}
            <form onSubmit={handleSaveSchoolProfiling} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-600" /> Profil Pokok &amp; Pengaturan Sekolah
                </h3>
                <p className="text-xs text-slate-500 mt-1">Data pendaftaran dan kontak administratif akan diperbarui langsung pada halaman utama</p>
              </div>

              {schoolEditSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                  🚀 Konfigurasi landing page diperbarui secara real-time dan tersimpan dalam sistem!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={editedConfig.schoolName}
                    onChange={(e) => setEditedConfig({ ...editedConfig, schoolName: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Visi &amp; Profil Sekolah</label>
                  <textarea
                    required
                    rows={4}
                    value={editedConfig.schoolProfile}
                    onChange={(e) => setEditedConfig({ ...editedConfig, schoolProfile: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl text-xs leading-relaxed bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Motto / Slogan Sekolah</label>
                  <input
                    type="text"
                    required
                    value={editedConfig.motto}
                    onChange={(e) => setEditedConfig({ ...editedConfig, motto: e.target.value })}
                    className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                    placeholder="Contoh: Maju Bersama, Berkarakter Luhur"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Status Pendaftaran (PPDB)</label>
                  <select
                    value={editedConfig.registrationStatus}
                    onChange={(e) => setEditedConfig({ ...editedConfig, registrationStatus: e.target.value as 'Buka' | 'Tutup' })}
                    className="p-3 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="Buka">🟢 BUAKAN (ONLINE)</option>
                    <option value="Tutup">🔴 TUTUP (OFFLINE)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Batas Kuota Penerimaan Utama</label>
                  <input
                    type="number"
                    required
                    value={editedConfig.quota}
                    onChange={(e) => setEditedConfig({ ...editedConfig, quota: parseInt(e.target.value) || 0 })}
                    className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5 bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">📞 Detil Hubungi Kami</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">No. Telepon Sekolah</label>
                      <input
                        type="text"
                        required
                        value={editedConfig.phone}
                        onChange={(e) => setEditedConfig({ ...editedConfig, phone: e.target.value })}
                        className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500">Email Sekolah</label>
                      <input
                        type="email"
                        required
                        value={editedConfig.email}
                        onChange={(e) => setEditedConfig({ ...editedConfig, email: e.target.value })}
                        className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2.5">
                    <label className="text-[10px] font-bold text-slate-500">Alamat Lengkap Strategis</label>
                    <input
                      type="text"
                      required
                      value={editedConfig.address}
                      onChange={(e) => setEditedConfig({ ...editedConfig, address: e.target.value })}
                      className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* TIMELINES SUB FORM */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Penjadwalan Alur Kegiatan PPDB
                </h4>
                
                <div className="flex flex-col gap-4">
                  {editedConfig.timeline.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
                      <div className="flex justify-between items-center bg-white/50 p-2 border border-slate-100 rounded-lg">
                        <span className="text-xs font-extrabold text-indigo-700">Tahap {idx + 1}: Nama Skenario</span>
                        <input
                          type="text"
                          required
                          value={item.label}
                          onChange={(e) => handleTimelineChange(item.id, 'label', e.target.value)}
                          className="px-3 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-900 bg-white ml-2 flex-1"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1 sm:col-span-1">
                          <label className="text-[10px] font-semibold text-slate-500">Tanggal Target</label>
                          <input
                            type="text"
                            required
                            value={item.date}
                            onChange={(e) => handleTimelineChange(item.id, 'date', e.target.value)}
                            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500">Keterangan Instruksi</label>
                          <input
                            type="text"
                            required
                            value={item.desc}
                            onChange={(e) => handleTimelineChange(item.id, 'desc', e.target.value)}
                            className="p-2 border border-slate-200 rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition-all cursor-pointer shadow-md"
              >
                Simpan Pokok Profil &amp; Timeline Belajar
              </button>
            </form>

            {/* Right Col: Manage Announcements */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* POST NEW ANNOUNCEMENT */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                <h4 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Bell className="w-5 h-5 text-indigo-600" /> Buat Pengumuman Baru
                </h4>
                
                <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Judul Pengumuman</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan judul pengumuman penting"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Isi Informasi Pengumuman</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tuliskan isi keterangan perihal PPDB/SPMB..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="ann-important"
                      checked={announcementIsImportant}
                      onChange={(e) => setAnnouncementIsImportant(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500"
                    />
                    <label htmlFor="ann-important" className="text-xs font-bold text-rose-700 cursor-pointer flex items-center gap-1">
                      ⚠️ Berikan Label Pengumuman PENTING (Warna Merah)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Publikasikan Berita
                  </button>
                </form>
              </div>

              {/* LIST OF EXISTINGS ANNOUNCEMENT */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                <h4 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">Daftar Berita Aktif</h4>
                
                <div className="flex flex-col gap-3">
                  {editedConfig.announcements.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border rounded-xl flex items-start justify-between gap-3 ${
                        item.isImportant ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100 background-white'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <span className="block text-[9px] text-slate-400 font-bold mb-1">📅 {item.date}</span>
                        <h5 className="font-extrabold text-xs text-slate-900 tracking-tight leading-snug">{item.title}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="p-1 px-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: GOOGLE SHEETS SYNCHRONIZER */}
        {activeSubTab === 'sheets' && (
          <div className="flex flex-col gap-6" id="google-sheets-section">
            {/* Sync Alert Banner if status is success or error */}
            {syncStatus.type !== 'idle' && (
              <div className={`p-4 rounded-2xl border ${
                syncStatus.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              } text-xs font-semibold flex items-center justify-between gap-3 shadow-xs`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${syncStatus.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{syncStatus.message}</span>
                </div>
                <button 
                  onClick={() => setSyncStatus({ type: 'idle', message: '' })}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Connection Setup & Actions */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Integration Info Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Integrasi Google Sheets
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">Export &amp; Sinkronisasi Data PPDB</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hubungkan data pendaftar baru milik sekolah secara real-time ke spreadsheet di Google Drive Anda. Format kolom (header) akan secara otomatis disesuaikan dengan formulir pendaftaran siswa.
                  </p>

                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pertanyaan Formulir Terpeta (39 Kolom)</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">📝 ID Pendaftaran</span>
                      <span className="flex items-center gap-1.5 font-medium">👤 Nama Lengkap</span>
                      <span className="flex items-center gap-1.5 font-medium">🎯 NISN Siswa</span>
                      <span className="flex items-center gap-1.5 font-medium">📅 Tanggal Lahir</span>
                      <span className="flex items-center gap-1.5 font-medium">🏠 Alamat Lengkap</span>
                      <span className="flex items-center gap-1.5 font-medium">🏫 SMP/MTs Asal</span>
                      <span className="flex items-center gap-1.5 font-medium">👨&zwj;👨&zwj;👦 Data Wali / Ortu</span>
                      <span className="flex items-center gap-1.5 font-medium">✨ Jalur Pendaftaran (10 Kolom)</span>
                    </div>
                  </div>
                </div>

                {/* Google Authentication Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Koneksi Akun Google</h4>
                  
                  {!googleUser ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Silakan hubungkan akun Google sekolah (misal: panitia) untuk memberikan izin penyimpanan &amp; pembuatan file spreadsheet.
                      </p>
                      
                      <button 
                        onClick={handleGoogleLogin}
                        disabled={isLoggingInGoogle}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-4 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingInGoogle ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          </svg>
                        )}
                        <span>{isLoggingInGoogle ? 'Menyambungkan...' : 'Hubungkan Akun Google'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* User Profile */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl">
                        {googleUser.photoURL ? (
                          <img 
                            src={googleUser.photoURL} 
                            alt={googleUser.displayName} 
                            className="w-10 h-10 rounded-full border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                            {(googleUser.displayName || googleUser.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <span className="block font-black text-xs text-slate-900 leading-tight truncate">{googleUser.displayName || 'User Google'}</span>
                          <span className="block text-[10px] text-slate-500 font-mono truncate">{googleUser.email}</span>
                        </div>
                        <span className="ml-auto bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">TERKONEKSI</span>
                      </div>

                      <button 
                        onClick={handleGoogleLogout}
                        className="text-slate-450 hover:text-slate-600 font-bold text-xs py-1 self-start flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Logout Akun Google
                      </button>
                    </div>
                  )}
                </div>

                {/* Google Spreadsheet Control Box */}
                {googleUser && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Pengaturan Spreadsheet</h4>

                    {!sheetId ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Hubungkan dashboard ini dengan dokumen spreadsheet baru. Kami akan membuat file spreadsheet baru bernama <strong>"PPDB {schoolConfig.schoolName} - Data Pendaftar"</strong> di Google Drive Anda.
                        </p>
                        <button
                          onClick={handleCreateNewSheet}
                          disabled={isSyncing}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isSyncing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>{isSyncing ? 'Mempersiapkan File...' : 'Buat Spreadsheet Baru'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl relative">
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block">FILE SPREADSHEET TERINTEGRASI</span>
                          <span className="block font-bold text-xs text-indigo-950 mt-1 truncate">PPDB {schoolConfig.schoolName} - Data Pendaftar</span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-1 select-all break-all overflow-hidden">{sheetId}</span>
                        </div>

                        {/* Google Apps Script Web App URL Input */}
                        <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            ⚙️ URL Web App Google Apps Script (Connected)
                          </label>
                          <input
                            type="text"
                            value={appsScriptUrl}
                            onChange={(e) => {
                              setAppsScriptUrl(e.target.value);
                              localStorage.setItem('ppdb_google_apps_script_url', e.target.value);
                            }}
                            className="p-2 border border-slate-200 rounded-xl text-[10px] bg-white text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                            placeholder="https://script.google.com/macros/s/.../exec"
                          />
                          <p className="text-[9px] text-slate-400 leading-normal">
                            Menghubungkan Web App Google Apps Script untuk format layout 39 kolom dan trigger pengumuman email real-time.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'Mengunggah Data...' : 'Sinkronkan Sekarang 🔄'}</span>
                          </button>

                          {sheetUrl && (
                            <a
                              href={sheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              className="w-full py-3 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 text-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Buka Google Sheets ↗</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-500 font-medium">
                          <span>Terakhir Sinkron: <strong className="text-slate-800">{lastSync || 'Belum dilakukan'}</strong></span>
                          <button 
                            onClick={handleDisconnectSheet}
                            className="text-rose-500 hover:text-rose-700 font-extrabold cursor-pointer transition-colors"
                          >
                            Putus Hubungan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Right Column: Spreadsheet Preview Mapping Mock */}
              <div className="lg:col-span-7 bg-slate-900 text-slate-300 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-4 overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-slate-500 ml-2">google_spreadsheet_preview_layout.json</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 select-none bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-0.5 rounded-sm uppercase font-black">SHEET1 ACTIVE</span>
                </div>

                <div className="flex flex-col gap-1.5 flex-grow">
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Visualisasi pemetaan isian pendaftar (registrant) dari formulir database lokal ke lembar spreadsheet sekolah.
                  </p>

                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 font-mono text-[10px] sm:text-xs overflow-x-auto select-none mt-2">
                    {/* Header Columns Grid */}
                    <div className="flex border-b border-slate-800 pb-2 mb-2 font-black text-emerald-400 uppercase tracking-wider text-[9px] gap-4 min-w-[500px]">
                      <span className="w-24 shrink-0">Kolom Sheet</span>
                      <span className="w-28 shrink-0">Kunci Data</span>
                      <span className="flex-grow">Pertanyaan/Isian Penilai</span>
                    </div>

                    {/* Columns Mapping List */}
                    <div className="flex flex-col gap-2 text-slate-400 max-h-[350px] overflow-y-auto pr-2 divide-y divide-slate-950 min-w-[500px]">
                      {[
                        { col: "A", name: "ID Pendaftaran", desc: "No Pendaftaran atau Registrasi ID" },
                        { col: "B", name: "Nama Lengkap", desc: "Identitas nama pendaftar" },
                        { col: "C", name: "Email", desc: "Alamat surel pendaftar" },
                        { col: "D", name: "Status Pendaftaran", desc: "Status administrasi seleksi sekolah" },
                        { col: "E", name: "Catatan Verifikator", desc: "Umpan balik peninjau verifikasi panitia" },
                        { col: "F", name: "Waktu Pendaftaran", desc: "Tanggal pendaftaran dikirim" },
                        { col: "G", name: "NISN", desc: "Identitas Nomor Induk Siswa Nasional" },
                        { col: "H", name: "Tempat Lahir", desc: "Kabupaten/Kota domisili bersalin" },
                        { col: "I", name: "Tanggal Lahir", desc: "Sesuai akta kelahiran pendaftar" },
                        { col: "J", name: "Jenis Kelamin", desc: "Laki-laki / Perempuan" },
                        { col: "K", name: "Agama", desc: "Agama pendaftar resmi" },
                        { col: "L", name: "No. HP Siswa", desc: "Kontak WhatsApp aktif siswa pendaftar" },
                        { col: "M", name: "Alamat (Jalan)", desc: "Alamat tinggal pendaftar" },
                        { col: "N", name: "RT / RW", desc: "Keterangan rukun tetangga & warga" },
                        { col: "O", name: "Kelurahan / Desa", desc: "Kelurahan tempat tinggal pendaftar" },
                        { col: "P", name: "Kecamatan", desc: "Kecamatan domisili pendaftar" },
                        { col: "Q", name: "Kota / Kabupaten", desc: "Kota Administrasi / Kabupaten" },
                        { col: "R", name: "Provinsi", desc: "Provinsi asal pendaftar" },
                        { col: "S", name: "Kode Pos", desc: "Kode pos wilayah" },
                        { col: "T", name: "Sekolah Asal", desc: "SMP/MTs atau Madrasah lulusan" },
                        { col: "U", name: "Tahun Kelulusan", desc: "Angkatan kelulusan" },
                        { col: "V", name: "Alamat Sekolah Asal", desc: "Alamat SMP/MTs lulusan" },
                        { col: "W", name: "No. Seri Ijazah / SKL", desc: "Nomor seri Ijazah lulus atau SKL" },
                        { col: "X", name: "Nama Ayah Kandung", desc: "Nama Wali Ayah kandung" },
                        { col: "Y", name: "Pekerjaan Ayah", desc: "Mata pencaharian ayah kandung" },
                        { col: "Z", name: "No. HP Ayah", desc: "Nomor kontak ayah" },
                        { col: "AA", name: "Nama Ibu Kandung", desc: "Identitas Ibu kandung" },
                        { col: "AB", name: "Pekerjaan Ibu", desc: "Mata pencaharian ibu kandung" },
                        { col: "AC", name: "No. HP Ibu", desc: "Nomor kontak ibu kandung" },
                        { col: "AD", name: "Jalur Pendaftaran", desc: "Pilihan Jalur Penerimaan Siswa" },
                        { col: "AE", name: "Jarak Rumah (Zonasi)", desc: "Radius jarak tempat tinggal ke sekolah" },
                        { col: "AF", name: "Memperoleh KIP (Afirmasi)", desc: "Pernyataan status kepemilikan KIP / SKTM" },
                        { col: "AG", name: "Nama Bukti KIP (Afirmasi)", desc: "Nama berkas bukti upload KIP digital" },
                        { col: "AH", name: "Kategori Prestasi", desc: "Jenis perlombaan / rapor akademik" },
                        { col: "AI", name: "Peringkat Kelas (Prestasi)", desc: "Peringkat kelas terakhir" },
                        { col: "AJ", name: "Rata-Rata Nilai (Prestasi)", desc: "Kalkulasi nilai akademik rapor" },
                        { col: "AK", name: "Deskripsi Prestasi", desc: "Deskripsi piagam kejuaraan non-akademik" },
                        { col: "AL", name: "Asal Instansi (Mutasi)", desc: "Daerah mutasi kerja orang tua" },
                        { col: "AM", name: "Tujuan Tinggal (Mutasi)", desc: "Domisili baru yang ditempati" },
                      ].map((mapped, idx) => (
                        <div key={idx} className="flex gap-4 items-center py-2 text-[10px] sm:text-xs">
                          <span className="w-24 shrink-0 text-emerald-400 font-bold block">Kolom {mapped.col}</span>
                          <span className="w-28 shrink-0 text-indigo-300 font-bold truncate block">{mapped.name}</span>
                          <span className="flex-grow text-slate-500 text-[10px] truncate block">{mapped.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-800 pt-4 mt-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                  <span>Semua pendaftar baru atau perubahannya di database lokal akan otomatis terkirim sewaktu Anda menyinkronkan data.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* DETAILED APPLICANT DRAWER / DIALOG MODAL */}
      <AnimatePresence>
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto" id="applicant-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 my-8"
              id="applicant-modal"
            >
              
              {/* MODAL TITLE HEADER BAR */}
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                    {selectedApplicant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight">{selectedApplicant.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedApplicant.pendaftaranId} • Daftar: {selectedApplicant.registeredAt}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL DETAILED CONTENT SCROLLER */}
              <div className="p-6 md:p-8 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
                
                {/* Left Side: Applicant Datas (Biodata, Address, Parents, School) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  
                  {/* Personal */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                      <UserIcon className="w-4 h-4 text-indigo-700" /> a. Identitas Diri Calon Siswa
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Nama Lengkap</span>
                        <strong className="text-slate-800 font-extrabold leading-snug">{selectedApplicant.profile?.personalInfo.name || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">NISN (Sekolah Dasar)</span>
                        <strong className="text-slate-800 font-mono font-bold">{selectedApplicant.profile?.personalInfo.nisn || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Tempat, Tanggal Lahir</span>
                        <strong className="text-slate-800">{selectedApplicant.profile?.personalInfo.birthPlace || '---'}, {selectedApplicant.profile?.personalInfo.birthDate || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Jenis Kelamin</span>
                        <strong className="text-slate-800">{selectedApplicant.profile?.personalInfo.gender || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Agama</span>
                        <strong className="text-slate-800">{selectedApplicant.profile?.personalInfo.religion || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Kontak Handphone</span>
                        <strong className="text-indigo-700 font-bold">{selectedApplicant.profile?.personalInfo.phone || '---'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-indigo-700" /> b. Alamat Rumah Domisili
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <div className="col-span-2">
                        <span className="block text-slate-400 font-semibold mb-0.5">Alamat Jalan / No</span>
                        <strong className="text-slate-800 font-bold">{selectedApplicant.profile?.addressInfo.street || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">RT / RW</span>
                        <strong className="text-slate-800 font-mono">{selectedApplicant.profile?.addressInfo.rtRw || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Kelurahan / Kecamatan</span>
                        <strong className="text-slate-800">{selectedApplicant.profile?.addressInfo.village || '---'} / {selectedApplicant.profile?.addressInfo.district || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Kota / Provinsi</span>
                        <strong className="text-slate-800">{selectedApplicant.profile?.addressInfo.city || '---'}, {selectedApplicant.profile?.addressInfo.province || '---'}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-semibold mb-0.5">Kode Pos</span>
                        <strong className="text-slate-800 font-mono">{selectedApplicant.profile?.addressInfo.postalCode || '---'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* School & Parents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SD info */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                        <GraduationCap className="w-4 h-4 text-indigo-700" /> c. Asal Sekolah Dasar
                      </h4>
                      <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col gap-2">
                        <span>🏫 <strong>SD Asal:</strong> {selectedApplicant.profile?.schoolInfo.previousSchool || '---'}</span>
                        <span>📅 <strong>Tahun Lulus:</strong> {selectedApplicant.profile?.schoolInfo.graduationYear || '---'}</span>
                        <span>📜 <strong>No. Ijazah:</strong> <span className="font-mono">{selectedApplicant.profile?.schoolInfo.ijazaNumber || '---'}</span></span>
                      </div>
                    </div>

                    {/* Parents info */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                        <Users className="w-4 h-4 text-indigo-700" /> d. Data Orang Tua
                      </h4>
                      <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col gap-2">
                        <span>👨 <strong>Ayah:</strong> {selectedApplicant.profile?.parentsInfo.fatherName || '---'} ({selectedApplicant.profile?.parentsInfo.fatherJob || '---'})</span>
                        <span>👩 <strong>Ibu:</strong> {selectedApplicant.profile?.parentsInfo.motherName || '---'} ({selectedApplicant.profile?.parentsInfo.motherJob || '---'})</span>
                        <span>📞 <strong>Kontak Ayah/Ibu:</strong> {selectedApplicant.profile?.parentsInfo.fatherPhone || selectedApplicant.profile?.parentsInfo.motherPhone || '---'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pathway Selection detail card */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-indigo-700" /> e. Jalur Penerimaan Pendaftaran Calon Siswa
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Jalur Terpilih</span>
                          <span className="font-extrabold text-sm text-indigo-900">
                            {selectedApplicant.profile?.pathwayInfo?.type || 'Belum Ditentukan'}
                          </span>
                        </div>
                        {selectedApplicant.profile?.pathwayInfo?.type && (
                          <span className="bg-indigo-100/50 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Pilihan Jalur Siswa
                          </span>
                        )}
                      </div>

                      {/* Display sub-details */}
                      {selectedApplicant.profile?.pathwayInfo?.type === 'Zonasi' && (
                        <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs leading-normal">
                          📍 <strong>Jarak Radius Tinggal:</strong> <span className="font-semibold text-slate-800">{selectedApplicant.profile.pathwayInfo.zonasi?.distance || '---'}</span>
                        </div>
                      )}

                      {selectedApplicant.profile?.pathwayInfo?.type === 'Afirmasi' && (
                        <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs leading-normal flex flex-col gap-2">
                          <div>
                            💳 <strong>Memiliki Kartu KIP / SKTM:</strong> <span className="font-semibold text-purple-700">{selectedApplicant.profile.pathwayInfo.afirmasi?.hasKip || '---'}</span>
                          </div>
                          {selectedApplicant.profile.pathwayInfo.afirmasi?.kipFileUrl && (
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                              <span className="text-xs">📜 <strong>Berkas KIP / Gakin:</strong></span>
                              <button
                                type="button"
                                onClick={() => setShowDocPreview({ url: selectedApplicant.profile!.pathwayInfo!.afirmasi!.kipFileUrl!, label: 'Bukti KIP / Siswa-Miskin' })}
                                className="text-[10px] hover:underline hover:text-indigo-600 font-bold flex items-center gap-1 text-indigo-600 cursor-pointer"
                              >
                                Lihat Berkas Bukti {selectedApplicant.profile.pathwayInfo.afirmasi.kipFileName ? `(${selectedApplicant.profile.pathwayInfo.afirmasi.kipFileName})` : ''} 🔎
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedApplicant.profile?.pathwayInfo?.type === 'Prestasi' && (
                        <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs leading-normal flex flex-col gap-1.5">
                          <div>
                            🎖️ <strong>Kategori Kualifikasi:</strong> <span className="font-semibold text-indigo-700">{selectedApplicant.profile.pathwayInfo.prestasi?.category || '---'}</span>
                          </div>
                          {selectedApplicant.profile.pathwayInfo.prestasi?.category === 'Akademik' ? (
                            <>
                              <div>
                                📈 <strong>Peringkat Kelas:</strong> <span className="font-semibold text-slate-800">{selectedApplicant.profile.pathwayInfo.prestasi.academicRank || '---'}</span>
                              </div>
                              <div>
                                📊 <strong>Rata-Rata Nilai Rapor:</strong> <span className="font-semibold text-slate-800">{selectedApplicant.profile.pathwayInfo.prestasi.academicAverage || '---'}</span>
                              </div>
                            </>
                          ) : (
                            <div>
                              📝 <strong>Deskripsi Kemenangan / Prestasi:</strong> <span className="font-semibold text-slate-800 block mt-1 bg-slate-50 p-2 rounded border border-slate-105">{selectedApplicant.profile.pathwayInfo.prestasi?.nonAcademicDescription || '---'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedApplicant.profile?.pathwayInfo?.type === 'Mutasi' && (
                        <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs leading-normal flex flex-col gap-1.5">
                          <div>
                            🏢 <strong>Asal Instansi Pindahan Kerja:</strong> <span className="font-semibold text-slate-800">{selectedApplicant.profile.pathwayInfo.mutasi?.originLocation || '---'}</span>
                          </div>
                          <div>
                            🏠 <strong>Alamat Domisili Baru:</strong> <span className="font-semibold text-slate-800">{selectedApplicant.profile.pathwayInfo.mutasi?.targetDestination || '---'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Uploads Preview cards */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wide">
                      <FileText className="w-4 h-4 text-indigo-700" /> f. Kelengkapan File Berkas Pendaftaran
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { key: 'familyCard', label: 'Kartu Keluarga', nameKey: 'familyCardName' },
                        { key: 'graduationCertificate', label: 'Ijazah / SKL', nameKey: 'graduationCertificateName' },
                        { key: 'birthCertificate', label: 'Akta Lahir', nameKey: 'birthCertificateName' },
                        { key: 'photo', label: 'Pas Foto 3x4', nameKey: 'photoName' }
                      ].map((item) => {
                        const link = selectedApplicant.documents?.[item.key as keyof StudentDocuments];
                        const fileName = selectedApplicant.documents?.[item.nameKey as keyof StudentDocuments];

                        return (
                          <div key={item.key} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2 items-center text-center">
                            <span className="text-[10px] text-slate-500 font-bold block">{item.label}</span>
                            
                            {link ? (
                              <div className="w-full">
                                <div className="w-full h-16 bg-slate-200 border border-slate-300 rounded-lg overflow-hidden mb-1.5">
                                  <img 
                                    src={link} 
                                    className="w-full h-full object-cover" 
                                    alt="preview" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="block text-[9px] text-slate-400 font-mono truncate">{fileName}</span>
                                <button
                                  type="button"
                                  onClick={() => setShowDocPreview({ url: link, label: item.label })}
                                  className="text-[9px] px-2 py-0.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-md text-indigo-700 font-bold tracking-wide mt-1 cursor-pointer transition-colors w-full"
                                >
                                  Zoom Berkas 🔎
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center p-3 text-slate-300 bg-white border border-dashed border-slate-200 rounded-lg">
                                <span className="text-[10px] leading-tight text-rose-500 font-extrabold uppercase">Belum Upload</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Side: Verification Panel & Status Updater */}
                <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-5 self-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 mb-2 uppercase tracking-tight text-xs">
                      PANEL VERIFIKASI SELEKSI
                    </h4>
                    <p className="text-[11px] text-slate-500">Tentukan kelulusan pendaftar dengan bijak</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">Ubah Status</label>
                    <select
                      value={adminStatusInput}
                      onChange={(e) => setAdminStatusInput(e.target.value as RegistrationStatus)}
                      className="p-3 border border-slate-300 rounded-xl text-xs bg-white font-extrabold text-slate-800"
                    >
                      <option value="BELUM_LENGKAP">🔴 Belum Lengkap / Tolak Draft</option>
                      <option value="SEDANG_DIVERIFIKASI">⚡ Sedang Diverifikasi Panitia</option>
                      <option value="DIVERIFIKASI">🔵 Berkas Sah / Terverifikasi</option>
                      <option value="LULUS">🟢 DITERIMA / LULUS UTAMA</option>
                      <option value="TIDAK_LULUS">❌ TIDAK LULUS SELEKSI</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Catatan Panitia PPDB</label>
                    <textarea
                      rows={4}
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      placeholder="Contoh: Dokumen lengkap dan sah. Nilai rata-hari rapor memenuhi kuota utama zonasi sekolah."
                      className="p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 leading-normal"
                    />
                  </div>

                  <button
                    onClick={handleSaveVerification}
                    className="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-1 cursor-pointer"
                  >
                    Terapkan &amp; Simpan Status ✔
                  </button>

                  <button
                    onClick={() => setUserToDelete(selectedApplicant)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Pendaftar Ini
                  </button>

                  <div className="h-px bg-slate-200 my-1"></div>

                  <div className="flex flex-col gap-2 text-[10px] text-slate-500 leading-normal">
                    <span className="font-bold text-slate-700">💡 Petunjuk Pendaftaran:</span>
                    <span>1. Status <strong>"Terverifikasi"</strong> menyatakan dokumen valid dan lolos administrasi.</span>
                    <span>2. Status <strong>"Lulus"</strong> akan mengirimkan pengumuman resmi ke dashboard murid beserta serial keputusan sekolah.</span>
                    <span>3. Kuota sekolah berkurang otomatis 1 slot saat Anda menyatakan calon siswa <strong>"Lulus"</strong>.</span>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT ZOOM MODAL PREVIEW */}
      <AnimatePresence>
        {showDocPreview && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="zoom-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-4 relative"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-4">
                <h4 className="font-bold text-slate-900 text-sm">Inspeksi Berkas: {showDocPreview.label}</h4>
                <button
                  onClick={() => setShowDocPreview(null)}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  Tutup [Esc]
                </button>
              </div>
              
              <div className="w-full max-h-[70vh] rounded-lg overflow-hidden border border-slate-200 flex justify-center bg-slate-900">
                <img 
                  src={showDocPreview.url} 
                  alt="Zoom detail" 
                  className="max-h-[68vh] object-contain w-auto h-auto transition-transform duration-300 hover:scale-110 cursor-zoom-in"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="bg-rose-100 p-2.5 rounded-full">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900 font-sans">Hapus Pendaftar?</h4>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Apakah Anda yakin ingin menghapus akun dan berkas pendaftaran milik pendaftar <strong>{userToDelete.name}</strong> ({userToDelete.pendaftaranId})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
              
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(userToDelete.id);
                    setUserToDelete(null);
                    if (selectedApplicant && selectedApplicant.id === userToDelete.id) {
                      setSelectedApplicant(null);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
