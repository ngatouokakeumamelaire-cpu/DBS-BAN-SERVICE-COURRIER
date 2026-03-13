import { useState } from 'react';
import { X, User, Mail, MapPin } from 'lucide-react';

const cities = ['Adjamé', 'Yopougon', 'Man', 'Sangouiné', 'Mahapleu', 'Danané', 'Teapleu', 'Zouhan-Hounien', 'Bin-Houyé', 'Touba', 'Facobly', 'Biankouma', 'Bangolo', 'Duékoué'];

export default function CreateCourierModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({ email: '', name: '', city: '' });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between mb-6"><h3 className="text-lg font-semibold text-white">Nouveau Responsable</h3><button onClick={onClose} className="text-gray-400">X</button></div>
        <form onSubmit={e => { e.preventDefault(); onCreate(formData.email, formData.name, formData.city); }} className="space-y-4">
          <input type="text" placeholder="Nom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-800 border border-white/20 rounded-lg p-3 text-white" required>
            <option value="">Ville</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">Créer</button>
        </form>
      </div>
    </div>
  );
}
