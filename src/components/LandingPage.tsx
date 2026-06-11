import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  School, Calendar, Bell, Phone, Mail, MapPin, 
  LogIn, UserPlus, ArrowRight, ClipboardList, Info,
  CheckCircle2, AlertCircle, Sparkles, Building2, ExternalLink
} from 'lucide-react';
import { SchoolConfig, User } from '../types';

interface LandingPageProps {
  schoolConfig: SchoolConfig;
  totalRegistered: number;
  totalAccepted: number;
  totalPending: number;
  currentUser: User | null;
  onNavigate: (view: 'landing' | 'student' | 'admin' | 'auth', subView?: string) => void;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function LandingPage({
  schoolConfig,
  totalRegistered,
  totalAccepted,
  totalPending,
  currentUser,
  onNavigate,
  onLogout,
  onOpenAuth
}: LandingPageProps) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans" id="landing-container">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200" id="landing-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')} id="nav-brand">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-sm shadow-emerald-200">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight tracking-tight sm:block hidden">
                {schoolConfig.schoolName}
              </h1>
              <p className="text-xs text-emerald-600 font-medium tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 inline" /> PORTAL PPDB / SPMB ONLINE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4" id="nav-actions">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 hidden md:inline">
                  Halo, <strong className="text-slate-900">{currentUser.name}</strong>
                </span>
                
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all text-sm font-medium"
                    id="btn-nav-admin"
                  >
                    Dashboard Admin
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('student')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-all text-sm font-medium"
                    id="btn-nav-siswa"
                  >
                    Dashboard Siswa
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="px-3 py-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all text-sm font-medium"
                  id="btn-logout"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-700 hover:text-emerald-600 font-semibold text-sm transition-all"
                  id="btn-open-login"
                >
                  <LogIn className="w-4 h-4" /> Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-100 transition-all"
                  id="btn-open-register"
                >
                  <UserPlus className="w-4 h-4" /> Daftar Akun
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" id="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            className="lg:col-span-7 flex flex-col items-start gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pendaftaran Online TA 2026/2027
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Selamat datang di Portal PPDB <br />
              <span className="text-emerald-300">{schoolConfig.schoolName}</span>
            </h2>
            
            <p className="text-emerald-100/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
              &ldquo;{schoolConfig.motto}&rdquo;. Bergabunglah bersama kami untuk memformulasikan masa depan cerah melalui kualitas akademik mumpuni dan pembentukan karakter terpuji.
            </p>

            <div className="w-full h-px bg-emerald-500/20 my-2"></div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {currentUser ? (
                <button
                  onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin' : 'student')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/20 text-sm group"
                >
                  Buka Dashboard Sesi Anda <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/20 text-sm group"
                  >
                    Mulai Pendaftaran Online <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('alur-ppdb');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 font-semibold rounded-xl text-sm transition-all text-white flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" /> Lihat Alur Seleksi
                  </button>
                </>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6">
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5">
                <span className="block text-emerald-300 text-xl sm:text-2xl font-black">{schoolConfig.quota}</span>
                <span className="block text-emerald-100/70 text-[11px] font-medium tracking-wider uppercase mt-1">Kuota Kursi</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5">
                <span className="block text-emerald-300 text-xl sm:text-2xl font-black">{totalRegistered}</span>
                <span className="block text-emerald-100/70 text-[11px] font-medium tracking-wider uppercase mt-1">Total Pendaftar</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5">
                <span className="block text-emerald-300 text-xl sm:text-2xl font-black">{totalPending}</span>
                <span className="block text-emerald-100/70 text-[11px] font-medium tracking-wider uppercase mt-1">Sesi Verifikasi</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3.5">
                <span className="block text-emerald-400 text-xl sm:text-2xl font-black">{totalAccepted}</span>
                <span className="block text-emerald-100/70 text-[11px] font-medium tracking-wider uppercase mt-1">Siswa Diterima</span>
              </div>
            </div>
          </motion.div>

          {/* School Status Card / Illustration */}
          <motion.div 
            className="lg:col-span-5 hidden lg:block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-xl shadow-emerald-950/30 relative">
              <div className="absolute top-4 right-4 animate-bounce">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Status: {schoolConfig.registrationStatus === 'Buka' ? '🟢 BUKA' : '🔴 TUTUP'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">Profil Singkat</h3>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {schoolConfig.schoolProfile}
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{schoolConfig.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{schoolConfig.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{schoolConfig.email}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECONDARY INFO BLOCK (Mobile Profile fallback + Info banner) */}
      <section className="bg-white border-b border-slate-200 block lg:hidden py-8 px-4" id="mobile-profile-section">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Profil Sekolah</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">{schoolConfig.schoolProfile}</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-500">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{schoolConfig.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{schoolConfig.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{schoolConfig.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PORTAL LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* TIMELINE SECTION (Left / 2 columns on wide) */}
        <div className="lg:col-span-2 flex flex-col gap-8" id="alur-ppdb">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="bg-slate-100 text-slate-700 p-2.5 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900">Alur &amp; Jadwal Kegiatan</h3>
              <p className="text-xs text-slate-500">Timeline penting PPDB {schoolConfig.schoolName}</p>
            </div>
          </div>

          <motion.div 
            className="flex flex-col gap-4 relative pl-4 sm:pl-6 border-l-2 border-emerald-200"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {schoolConfig.timeline.map((time, idx) => (
              <motion.div 
                key={time.id} 
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-200 transition-all relative"
                variants={itemVariants}
              >
                {/* Timeline Dot Indicator */}
                <div className="absolute -left-[25px] sm:-left-[33px] top-6 bg-emerald-600 text-white w-4 h-4 rounded-full border-4 border-white flex items-center justify-center shadow-xs"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                    {time.label}
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold self-start sm:self-center">
                    {time.date}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-7">
                  {time.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ANNOUNCEMENT SIDEBAR (Right / 1 column) */}
        <div className="flex flex-col gap-8" id="halaman-pengumuman">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"></span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900">Pengumuman &amp; Berita</h3>
              <p className="text-xs text-slate-500">Informasi penting panitia pendaftaran</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {schoolConfig.announcements.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-xl p-6 text-slate-500 flex flex-col items-center gap-2">
                <Info className="w-8 h-8 text-slate-400" />
                <p className="text-sm">Belum ada pengumuman terbaru saat ini.</p>
              </div>
            ) : (
              schoolConfig.announcements.map((item) => (
                <div 
                  key={item.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer ${
                    item.isImportant 
                      ? 'border-rose-100 bg-rose-50/10 hover:border-rose-200' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setActiveAnnouncement(activeAnnouncement === item.id ? null : item.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500">
                      📅 {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {item.isImportant && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5 inline" /> Penting
                      </span>
                    )}
                  </div>
                  
                  <h4 className={`font-bold text-sm tracking-tight mb-2 ${
                    item.isImportant ? 'text-rose-950 hover:text-rose-700' : 'text-slate-900 hover:text-emerald-700'
                  }`}>
                    {item.title}
                  </h4>
                  
                  <p className={`text-xs text-slate-600 transition-all ${
                    activeAnnouncement === item.id ? 'line-clamp-none' : 'line-clamp-2'
                  }`}>
                    {item.content}
                  </p>

                  <div className="text-right mt-2">
                    <span className="text-[11px] font-semibold text-emerald-600 hover:underline">
                      {activeAnnouncement === item.id ? 'Sembunyikan ↑' : 'Baca Selengkapnya ...'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-gradient-to-tr from-slate-100 to-slate-200/50 border border-slate-200/60 rounded-2xl p-6 flex flex-col gap-4 mt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" /> Informasi Berkas PPDB
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap calon pendaftar diwajibkan mengunggah file berkas dalam format gambar/PDF berkualitas jernih. Silakan mempersiapkan:
            </p>
            <ul className="text-xs text-slate-600 flex flex-col gap-2 list-disc list-inside">
              <li><strong>Kartu Keluarga (KK)</strong> terbaru.</li>
              <li><strong>Ijazah Terakhir / Surat Keterangan Lulus (SKL)</strong>.</li>
              <li><strong>Akta Kelahiran</strong> sah dari Catatan Sipil.</li>
              <li><strong>Pas Foto berwarna kontras</strong> ukuran 3x4 formal.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto" id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <School className="w-4 h-4 animate-spin-slow" />
              </div>
              {schoolConfig.schoolName}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Gerbang pendaftaran online PPDB digital terpercaya, akuntabel, transparan, dan dapat diakses kapan saja demi kelancaran penerimaan peserta didik baru.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Akses Navigasi</h5>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a href="#landing-navbar" className="hover:text-amber-300 transition-all">↑ Kembali ke Atas</a>
              </li>
              <li>
                <a href="#alur-ppdb" className="hover:text-emerald-400 transition-all">Timeline &amp; Alur Kegiatan</a>
              </li>
              <li>
                <a href="#halaman-pengumuman" className="hover:text-emerald-400 transition-all">Pusat Informasi Pengumuman</a>
              </li>
              <li>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="hover:text-emerald-400 transition-all text-left"
                >
                  Sesi Login Sistem PPDB
                </button>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Kontak Administratif</h5>
            <div className="flex flex-col gap-2 text-xs">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {schoolConfig.address}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> {schoolConfig.phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500" /> {schoolConfig.email}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 text-center py-6 text-xs text-slate-500">
          &copy; 10 Juni 2026 - {schoolConfig.schoolName}. All Rights Reserved. Portal PPDB Nasional.
        </div>
      </footer>
    </div>
  );
}
