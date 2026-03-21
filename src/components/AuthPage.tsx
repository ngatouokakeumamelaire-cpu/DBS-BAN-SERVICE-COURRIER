import React, { useState, useEffect } from 'react';
import { Package, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { login, User, initializeAdmin } from '../lib/auth';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre configuration Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#253265] via-[#1F3D86] to-[#1A223F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[480px] z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl p-10 md:p-14">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-2xl border-4 border-white/10">
                <img 
                  src="/logo.png" 
                  alt="Logo DBS" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">DBS-BAN</h1>
            <p className="text-blue-400 font-bold text-sm uppercase tracking-[0.2em]">Service Courrier - Connexion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">Adresse email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="exemple@dbs-ban.ci"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Les responsables courrier sont créés par l'administrateur
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © 2025 DBS-BAN Transport - Système de gestion de courrier
          </p>
        </div>
      </div>
    </div>
  );
}
