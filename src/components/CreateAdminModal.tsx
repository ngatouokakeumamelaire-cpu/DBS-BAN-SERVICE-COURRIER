import { useState } from 'react';
import { X, User, Mail, Shield, Eye, EyeOff } from 'lucide-react';

export default function CreateAdminModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between mb-6"><h3 className="text-lg font-semibold text-white">Nouvel Admin</h3><button onClick={onClose} className="text-gray-400">X</button></div>
        <form onSubmit={e => { e.preventDefault(); onCreate(formData.email, formData.name, formData.password); }} className="space-y-4">
          <input type="text" placeholder="Nom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Mot de passe" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 pr-10 text-white" 
              required 
              minLength={6} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg">Créer</button>
        </form>
      </div>
    </div>
  );
}
