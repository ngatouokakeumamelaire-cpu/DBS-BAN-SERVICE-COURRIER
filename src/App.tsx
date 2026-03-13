import { useState, useEffect } from 'react';
import { Package, LogOut, Settings } from 'lucide-react';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import CourierDashboard from './components/CourierDashboard';
import ChangePasswordModal from './components/ChangePasswordModal';
import { User, getCurrentUser, logout, cleanupOldParcels } from './lib/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      setUser(getCurrentUser());
      await cleanupOldParcels();
      setLoading(false);
    };
    initApp();
  }, []);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-[#253265] via-[#1F3D86] to-[#1A223F] flex items-center justify-center text-white">Chargement...</div>;
  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#253265] via-[#1F3D86] to-[#1A223F]">
      <header className="bg-white/[0.03] border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-xl">
              <img 
                src="https://i.imgur.com/your-logo-here.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">DBS-BAN Service Courrier</h1>
              <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.2em]">
                {user.role === 'admin' ? 'ADMINISTRATION CENTRALE' : `RESPONSABLE - ${user.city}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/5"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { logout(); setUser(null); }} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-all border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {user.role === 'admin' ? <AdminDashboard /> : <CourierDashboard user={user} />}
      </main>

      {showPasswordModal && <ChangePasswordModal userId={user.id} onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

export default App;
