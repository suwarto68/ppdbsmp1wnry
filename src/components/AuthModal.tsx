import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Key, BookOpen, Sparkles, Check } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  users: User[];
  onRegister: (newUser: User) => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  users,
  onRegister,
  defaultMode = 'login'
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visual states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap isi alamat email dan password.');
      return;
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );

    if (matchedUser) {
      setSuccessMsg(`Berhasil Masuk! Selamat datang kembali, ${matchedUser.name}.`);
      setTimeout(() => {
        onAuthSuccess(matchedUser);
        setSuccessMsg('');
        resetForm();
        onClose();
      }, 900);
    } else {
      setError('Alamat email atau password salah. Cek akun demo di bawah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Semua kolom registrasi wajib diisi.');
      return;
    }

    if (password.length < 5) {
      setError('Password minimal harus terdiri dari 5 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konformasi password tidak cocok.');
      return;
    }

    const existingUser = users.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (existingUser) {
      setError('Alamat email sudah terdaftar di sistem.');
      return;
    }

    // Generate formatted Pendaftaran ID: e.g., PPDB-2026-XXXX
    const studentCount = users.filter(u => u.role === 'student').length;
    const formattedId = `PPDB-2026-00${studentCount + 4}`; // Increment beyond pre-seeds

    const newUser: User = {
      id: `stud-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'student',
      pendaftaranId: formattedId,
      registeredAt: new Date().toISOString().split('T')[0],
      registrationStatus: 'BELUM_LENGKAP',
      notes: 'Pendaftaran mandiri baru. Silakan lengkapi biodata pendaftaran sekolah.',
      profile: {
        personalInfo: {
          name: name.trim(),
          nisn: '',
          birthPlace: '',
          birthDate: '',
          gender: '',
          religion: '',
          phone: ''
        },
        addressInfo: {
          street: '',
          rtRw: '',
          village: '',
          district: '',
          city: '',
          province: '',
          postalCode: ''
        },
        schoolInfo: {
          previousSchool: '',
          graduationYear: '2026',
          schoolAddress: '',
          ijazaNumber: ''
        },
        parentsInfo: {
          fatherName: '',
          fatherJob: '',
          fatherPhone: '',
          motherName: '',
          motherJob: '',
          motherPhone: ''
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
    };

    onRegister(newUser);
    setSuccessMsg('Pendaftaran Akun Berhasil! Mengalihkan ke halaman dashboard...');
    setTimeout(() => {
      onAuthSuccess(newUser);
      setSuccessMsg('');
      resetForm();
      onClose();
    }, 1200);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
  };

  const handleApplyDemoAccount = (demoEmail: string, demoPass: string, modeType: 'login' | 'register' = 'login') => {
    setMode(modeType);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="auth-modal-overlay">
      <motion.div 
        key="auth-modal-body"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative border border-slate-100 my-8"
        id="auth-modal-container"
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-all"
          id="btn-close-auth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HERO BANNER */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white p-6 pb-8 text-center relative">
          <div className="absolute top-4 left-4 text-white/20">
            <BookOpen className="w-16 h-16" />
          </div>
          <h3 className="font-extrabold text-xl leading-snug relative z-10 flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-emerald-300" /> Portal PPDB / SPMB Online
          </h3>
          <p className="text-emerald-100 text-xs mt-1 relative z-10">
            {mode === 'login' ? 'Silakan masuk dengan akun terdaftar Anda' : 'Buat akun siswa baru untuk memulai pendaftaran'}
          </p>

          {/* TAB BUTTONS */}
          <div className="flex bg-emerald-950/40 rounded-full p-1 mt-6 relative z-10 w-fit mx-auto border border-emerald-500/20">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-emerald-400 text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'register' ? 'bg-emerald-400 text-emerald-950 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Daftar Siswa
            </button>
          </div>
        </div>

        {/* FORM STATE WITH MESSAGES */}
        <div className="p-6 md:p-8 flex-grow">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-shake" id="auth-error">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2" id="auth-success">
              <div className="bg-emerald-200 text-emerald-800 p-0.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Pendaftar</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!!successMsg}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                Masuk Sistem PPDB
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap Sesuai Ijazah</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Email Pendaftaran</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Konfirmasi</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-snug">
                Dengan mendaftar, Anda menyetujui bahwa seluruh dokumen dan informasi biodata yang Anda unggah adalah sah milik Anda secara hukum.
              </p>

              <button
                type="submit"
                disabled={!!successMsg}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer mt-1 disabled:opacity-50"
              >
                Buat Akun Siswa Baru
              </button>
            </form>
          )}

          {/* SIMULATOR QUICK CREDENTIALS CORNER */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Key className="w-3.5 h-3.5 text-emerald-600" /> Klik Akun Demo Pengujian (Instan)
            </h5>
            
            <div className="flex flex-col gap-2.5">
              {/* ADMIN ACCOUNT DEMO CARD */}
              <div 
                className="p-2 border border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer flex justify-between items-center gap-2 group"
                onClick={() => handleApplyDemoAccount('admin@sekolah.sch.id', '12345678', 'login')}
              >
                <div>
                  <span className="block text-[11px] font-extrabold text-indigo-700">💼 DEMO ROLE: ADMIN PANITIA</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Email: admin@sekolah.sch.id | Pass: ********</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-700 select-none">
                  Load ⚡
                </span>
              </div>

              {/* STUDENT ACCOUNT DEMO CARDS */}
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className="p-2 border border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer flex flex-col justify-between items-start gap-1 group"
                  onClick={() => handleApplyDemoAccount('budi@gmail.com', 'budi123', 'login')}
                >
                  <span className="text-[10px] font-extrabold text-emerald-700">🎓 BUDI (LULUS)</span>
                  <span className="text-[9px] text-slate-500 font-mono">budi@gmail.com / budi123</span>
                </div>

                <div 
                  className="p-2 border border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer flex flex-col justify-between items-start gap-1 group"
                  onClick={() => handleApplyDemoAccount('siti@gmail.com', 'siti123', 'login')}
                >
                  <span className="text-[10px] font-extrabold text-rose-700">🎓 SITI (PROSES)</span>
                  <span className="text-[9px] text-slate-500 font-mono">siti@gmail.com / siti123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
