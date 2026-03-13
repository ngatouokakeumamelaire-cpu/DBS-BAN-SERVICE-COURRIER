import { useState } from 'react';
import { X, Lock, CheckCircle } from 'lucide-react';
import { changePassword } from '../lib/auth';

export default function ChangePasswordModal({ userId, onClose }: any) {
  const [formData, setFormData] = useState({ current: '', new: '', confirm: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new !== formData.confirm) return alert('Mots de passe différents');
    const ok = await changePassword(userId, formData.current, formData.new);
    if (ok) {
      setSuccess(true);
      setTimeout(onClose, 2000);
    } else {
      alert('Erreur');
    }
  };

  if (success) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-slate-900 p-6 rounded-xl text-center"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h3 className="text-white">Modifié !</h3></div></div>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-6">Changer mot de passe</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Actuel" value={formData.current} onChange={e => setFormData({...formData, current: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="password" placeholder="Nouveau" value={formData.new} onChange={e => setFormData({...formData, new: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required minLength={6} />
          <input type="password" placeholder="Confirmer" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Modifier</button>
          <button type="button" onClick={onClose} className="w-full text-gray-400">Annuler</button>
        </form>
      </div>
    </div>
  );
}
