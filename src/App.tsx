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
      try {
        // Vérification des variables d'environnement
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          setLoading(false);
          return;
        }

        setUser(getCurrentUser());
        await cleanupOldParcels();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A223F] flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-black tracking-tight mb-2">Chargement de DBS-BAN...</p>
        <p className="text-gray-400 font-bold text-sm">Vérification de la connexion...</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Actualiser la page
        </button>
      </div>
    );
  }

  // Affichage d'une erreur claire si la configuration est manquante
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#1A223F] flex items-center justify-center p-6 text-center">
        <div className="bg-white/5 border border-red-500/30 p-8 rounded-[32px] max-w-md backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Configuration Manquante</h2>
          <p className="text-gray-400 font-bold mb-8">
            Les variables d'environnement Supabase ne sont pas configurées sur Netlify. 
            L'application ne peut pas se connecter à la base de données.
          </p>
          <div className="text-left bg-black/20 p-4 rounded-xl font-mono text-xs text-red-300/80 space-y-2">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#253265] via-[#1F3D86] to-[#1A223F]">
      <header className="bg-white/[0.03] border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-2xl border border-white/10">
              <img 
                src="https://i.imgur.com/your-logo-here.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">DBS-BAN</h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
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
        {user.role === 'admin' ? <AdminDashboard user={user} /> : <CourierDashboard user={user} />}
      </main>

      {showPasswordModal && <ChangePasswordModal userId={user.id} onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

export default App;
