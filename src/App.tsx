import React, { useState, useEffect } from 'react';
import { SchoolConfig, User } from './types';
import { defaultSchoolConfig, defaultUsers } from './initialData';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Shield } from 'lucide-react';

export default function App() {
  // STATE MANAGEMENT
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(defaultSchoolConfig);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // NAV ROUTING: 'landing' | 'student' | 'admin'
  const [activeView, setActiveView] = useState<'landing' | 'student' | 'admin'>('landing');
  
  // AUTH MODAL STATES
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');

  // LOAD DATABASE FROM LOCAL STORAGE ON INIT
  useEffect(() => {
    // 1. Load School Profiling
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

    // 2. Load User accounts database
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

    // 3. Keep current logged-in session alive across refreshes
    const savedActiveSession = localStorage.getItem('ppdb_active_user');
    if (savedActiveSession) {
      try {
        const u = JSON.parse(savedActiveSession) as User;
        setCurrentUser(u);
        // Automatically redirect to respective view if user is logged in
        if (u.role === 'admin') {
          setActiveView('admin');
        } else if (u.role === 'student') {
          setActiveView('student');
        }
      } catch (e) {
        localStorage.removeItem('ppdb_active_user');
      }
    }
  }, []);

  // UPDATE STATE AND STORAGE WRAPPER
  const handleUpdateSchoolConfig = (newConfig: SchoolConfig) => {
    setSchoolConfig(newConfig);
    localStorage.setItem('ppdb_school_config', JSON.stringify(newConfig));
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
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('ppdb_users', JSON.stringify(updatedUsers));
  };

  const handleRegisterNewUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('ppdb_users', JSON.stringify(updatedUsers));
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
    </div>
  );

  // Small internal helper to clear typescript modal reference closure
  function setIsOpenAuth(open: boolean) {
    setIsAuthOpen(open);
  }
}
