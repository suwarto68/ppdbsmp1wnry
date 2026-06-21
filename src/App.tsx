import React, { useState, useEffect } from 'react';
import { SchoolConfig, User } from './types';
import { defaultSchoolConfig, defaultUsers } from './initialData';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Shield, FileText, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  syncUserToFirestore, 
  deleteUserFromFirestore, 
  syncSchoolConfigToFirestore, 
  subscribeToUsers, 
  subscribeToSchoolConfig, 
  bootstrapSeedDataIfEmpty 
} from './lib/firebaseStore';

export default function App() {
  // STATE MANAGEMENT
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(defaultSchoolConfig);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dynamic Shared Document URL Previewer State
  const [sharedDocPreview, setSharedDocPreview] = useState<{
    userId: string;
    docKey: string;
    studentName: string;
    url: string;
    label: string;
  } | null>(null);

  // Parse URL Parameters for document sharing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewDocUserId = params.get('view_doc');
    const viewDocKey = params.get('doc');
    
    if (viewDocUserId && viewDocKey && users.length > 0) {
      // Find the user with this ID
      const student = users.find(u => u.id === viewDocUserId || u.pendaftaranId === viewDocUserId);
      if (student) {
        let fileUrl: string | null = null;
        let label = viewDocKey;
        
        if (viewDocKey === 'familyCard') {
          fileUrl = student.documents?.familyCard || null;
          label = 'Kartu Keluarga (KK)';
        } else if (viewDocKey === 'graduationCertificate') {
          fileUrl = student.documents?.graduationCertificate || null;
          label = 'Ijazah / SKL';
        } else if (viewDocKey === 'birthCertificate') {
          fileUrl = student.documents?.birthCertificate || null;
          label = 'Akte Kelahiran';
        } else if (viewDocKey === 'photo') {
          fileUrl = student.documents?.photo || null;
          label = 'Pas Foto 3x4';
        } else if (viewDocKey === 'kipFile') {
          fileUrl = student.profile?.pathwayInfo?.afirmasi?.kipFileUrl || null;
          label = 'Berkas KIP / Siswa Miskin';
        }

        // Also check direct document mapping to cover potential layout differences
        if (!fileUrl && student.documents) {
          const docKeys = ['familyCard', 'graduationCertificate', 'birthCertificate', 'photo'] as const;
          for (const k of docKeys) {
            if (k.toLowerCase() === viewDocKey.toLowerCase()) {
              fileUrl = student.documents[k];
              break;
            }
          }
        }
        
        if (fileUrl) {
          setSharedDocPreview({
            userId: student.id,
            docKey: viewDocKey,
            studentName: student.name,
            url: fileUrl,
            label
          });
        } else {
          console.warn(`File for key "${viewDocKey}" is not yet uploaded by ${student.name}.`);
        }
      }
    }
  }, [users, window.location.search]);
  
  // NAV ROUTING: 'landing' | 'student' | 'admin'
  const [activeView, setActiveView] = useState<'landing' | 'student' | 'admin'>('landing');
  
  // AUTH MODAL STATES
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');

  // LOAD DATABASE FROM FIRESTORE AND LOCAL STORAGE ON INIT
  useEffect(() => {
    // 1. Bootstrap initial data to Firestore if completely empty (non-blocking)
    bootstrapSeedDataIfEmpty(defaultUsers, defaultSchoolConfig);

    // 2. Real-time subscriber for Users
    const unsubscribeUsers = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers.length > 0) {
        setUsers(firestoreUsers);
        localStorage.setItem('ppdb_users', JSON.stringify(firestoreUsers));

        // Sync active user session with latest data if logged in
        const currentActive = localStorage.getItem('ppdb_active_user');
        if (currentActive) {
          try {
            const parsedActive = JSON.parse(currentActive) as User;
            const updatedActive = firestoreUsers.find(u => u.id === parsedActive.id);
            if (updatedActive) {
              setCurrentUser(updatedActive);
              localStorage.setItem('ppdb_active_user', JSON.stringify(updatedActive));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    // 3. Real-time subscriber for School Config
    const unsubscribeConfig = subscribeToSchoolConfig((firestoreConfig) => {
      setSchoolConfig(firestoreConfig);
      localStorage.setItem('ppdb_school_config', JSON.stringify(firestoreConfig));
    });

    // Fallbacks to Local Storage for instant startup render while fetching
    const savedConfig = localStorage.getItem('ppdb_school_config');
    if (savedConfig) {
      try {
        setSchoolConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Gagal memuat config PPDB, memuat seed standar.");
        localStorage.setItem('ppdb_school_config', JSON.stringify(defaultSchoolConfig));
      }
    } else {
      localStorage.setItem('ppdb_school_config', JSON.stringify(defaultSchoolConfig));
    }

    const savedUsers = localStorage.getItem('ppdb_users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers) as User[];
        // Auto-update admin accounts to the new password '12345678'
        const updated = parsed.map(u => {
          if (u.role === 'admin' && u.email === 'admin@sekolah.sch.id') {
            return { ...u, password: '12345678' };
          }
          return u;
        });
        setUsers(updated);
        localStorage.setItem('ppdb_users', JSON.stringify(updated));
      } catch (e) {
        console.error("Gagal memuat akun user PPDB, memuat seed standar.");
        setUsers(defaultUsers);
        localStorage.setItem('ppdb_users', JSON.stringify(defaultUsers));
      }
    } else {
      setUsers(defaultUsers);
      localStorage.setItem('ppdb_users', JSON.stringify(defaultUsers));
    }

    const savedActiveSession = localStorage.getItem('ppdb_active_user');
    if (savedActiveSession) {
      try {
        const u = JSON.parse(savedActiveSession) as User;
        setCurrentUser(u);
        if (u.role === 'admin') {
          setActiveView('admin');
        } else if (u.role === 'student') {
          setActiveView('student');
        }
      } catch (e) {
        localStorage.removeItem('ppdb_active_user');
      }
    }

    return () => {
      unsubscribeUsers();
      unsubscribeConfig();
    };
  }, []);

  // UPDATE STATE AND STORAGE WRAPPER WITH CLOUD REWRITE
  const handleUpdateSchoolConfig = (newConfig: SchoolConfig) => {
    setSchoolConfig(newConfig);
    localStorage.setItem('ppdb_school_config', JSON.stringify(newConfig));
    syncSchoolConfigToFirestore(newConfig);
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Update users array
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('ppdb_users', JSON.stringify(updatedUsers));

    // Update active session metadata if needed
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('ppdb_active_user', JSON.stringify(updatedUser));
    }
    syncUserToFirestore(updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('ppdb_users', JSON.stringify(updatedUsers));
    deleteUserFromFirestore(userId);
  };

  const handleRegisterNewUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('ppdb_users', JSON.stringify(updatedUsers));
    syncUserToFirestore(newUser);
  };

  // AUTH ACTIONS
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ppdb_active_user', JSON.stringify(user));
    
    // Redirect based on role
    if (user.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('student');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ppdb_active_user');
    setActiveView('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthDefaultMode(mode);
    setIsAuthOpen(true);
  };

  const handleNavigate = (view: 'landing' | 'student' | 'admin' | 'auth', subView?: string) => {
    if (view === 'auth') {
      handleOpenAuth(subView === 'register' ? 'register' : 'login');
      return;
    }
    setActiveView(view);
  };

  // Derive counts for landing metrics
  const registeredStudents = users.filter(u => u.role === 'student');
  const totalRegistered = registeredStudents.length;
  const totalAccepted = registeredStudents.filter(u => u.registrationStatus === 'LULUS').length;
  const totalPending = registeredStudents.filter(u => u.registrationStatus === 'SEDANG_DIVERIFIKASI').length;

  return (
    <div className="text-slate-800 antialiased bg-slate-50 min-h-screen" id="applet-root">
      {/* GLOBAL BANNER MODE FOR PREVIEW */}
      <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-[10px] sm:text-xs text-center py-2 px-4 shadow-sm font-semibold flex items-center justify-center gap-2 relative z-50">
        <span className="bg-white/15 px-2 py-0.5 rounded-sm uppercase tracking-wide text-[9px] font-black">INFO DEMO</span>
        <span>Akun Pengujian Instan: 💼 <strong>admin@sekolah.sch.id (********)</strong> untuk verifikator &bull; 🎓 <strong>budi@gmail.com (budi123)</strong> untuk Calon Siswa Lulus</span>
      </div>

      {/* CORE VIEW ROUTER */}
      {activeView === 'landing' && (
        <LandingPage
          schoolConfig={schoolConfig}
          totalRegistered={totalRegistered}
          totalAccepted={totalAccepted}
          totalPending={totalPending}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {activeView === 'student' && currentUser && currentUser.role === 'student' && (
        <StudentDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onNavigateLanding={() => setActiveView('landing')}
        />
      )}

      {activeView === 'admin' && currentUser && currentUser.role === 'admin' && (
        <AdminDashboard
          schoolConfig={schoolConfig}
          onUpdateSchoolConfig={handleUpdateSchoolConfig}
          users={users}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onLogout={handleLogout}
          onNavigateLanding={() => setActiveView('landing')}
        />
      )}

      {/* ENFORCED ACCESS GUARD FALLBACK */}
      {((activeView === 'student' && (!currentUser || currentUser.role !== 'student')) ||
        (activeView === 'admin' && (!currentUser || currentUser.role !== 'admin'))) && (
        <div className="flex flex-col items-center justify-center py-20 px-4 min-h-screen">
          <div className="p-4 bg-rose-100 text-rose-700 rounded-full mb-4">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Akses Terbatas Sistem PPDB</h3>
          <p className="text-slate-500 text-xs sm:text-sm text-center max-w-sm leading-relaxed mt-2 mb-6">
            Anda mencoba membuka area yang mewajibkan autentikasi yang sah. Silakan masuk sebagai pendaftar atau administrator terlebih dahulu.
          </p>
          <button
            onClick={() => { setActiveView('landing'); handleOpenAuth('login'); }}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
          >
            Masuk Sekarang
          </button>
        </div>
      )}

      {/* AUTH CONTROLLER PORTAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsOpenAuth(false)}
        onAuthSuccess={handleAuthSuccess}
        users={users}
        onRegister={handleRegisterNewUser}
        defaultMode={authDefaultMode}
      />

      {/* SHARED DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {sharedDocPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSharedDocPreview(null);
                // Clear URL parameters elegantly
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                      Pemeriksa Berkas PPDB Online 🎓
                    </h4>
                    <span className="block text-slate-500 font-medium text-[11px] sm:text-xs mt-0.5">
                      Siswa: <strong className="text-slate-800 font-bold">{sharedDocPreview.studentName}</strong> &bull; Jenis Berkas: <strong className="text-indigo-600 font-bold">{sharedDocPreview.label}</strong>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSharedDocPreview(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewer Wrapper */}
              <div className="w-full h-[60vh] sm:h-[65vh] bg-slate-900 flex items-center justify-center relative">
                {sharedDocPreview.url.startsWith('data:application/pdf') || sharedDocPreview.url.toLowerCase().includes('.pdf') ? (
                  <div className="w-full h-full flex flex-col items-center justify-between p-3 gap-3 bg-slate-50">
                    <iframe
                      src={sharedDocPreview.url}
                      className="w-full h-[52vh] sm:h-[55vh] rounded-md border border-slate-300 bg-white"
                      title={sharedDocPreview.label}
                    />
                    <a
                      href={sharedDocPreview.url}
                      download={`${sharedDocPreview.studentName.replace(/\s+/g, '_')}_${sharedDocPreview.label.replace(/\s+/g, '_')}.pdf`}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transform active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File PDF Resmi 📥</span>
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={sharedDocPreview.url}
                      alt={sharedDocPreview.label}
                      className="max-h-full max-w-full object-contain rounded-md transition-transform duration-300 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  // Small internal helper to clear typescript modal reference closure
  function setIsOpenAuth(open: boolean) {
    setIsAuthOpen(open);
  }
}
