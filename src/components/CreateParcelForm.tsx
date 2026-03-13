import { useState } from 'react';
import { Package, User, Phone, MapPin, DollarSign } from 'lucide-react';
import { createParcel, getCurrentUser } from '../lib/auth';
import { sendBothNotifications, createParcelRegisteredMessage, logNotification } from '../lib/notifications';

const cities = ['Adjamé', 'Yopougon', 'Man', 'Sangouiné', 'Mahapleu', 'Danané', 'Teapleu', 'Zouhan-Hounien', 'Bin-Houyé', 'Touba', 'Facobly', 'Biankouma', 'Bangolo', 'Duékoué'];

export default function CreateParcelForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState({
    senderName: '', senderPhone: '', recipientName: '', recipientPhone: '',
    destinationCity: '', packageType: '', value: '', price: '', notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parcel = await createParcel({
        ...formData,
        price: Number(formData.price),
        status: 'ENREGISTRE',
        isPaid: false,
        createdBy: userId
      });
      sendBothNotifications(formData.recipientPhone, createParcelRegisteredMessage(parcel.code, formData.senderName, getCurrentUser()?.city || '', Number(formData.price)));
      logNotification('Enregistrement', formData.recipientPhone, parcel.code);
      alert('Colis créé !');
      setFormData({ senderName: '', senderPhone: '', recipientName: '', recipientPhone: '', destinationCity: '', packageType: '', value: '', price: '', notes: '' });
    } catch (err) {
      alert('Erreur');
    }
  };

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Nouveau colis</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Expéditeur" value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="tel" placeholder="Tél Expéditeur" value={formData.senderPhone} onChange={e => setFormData({...formData, senderPhone: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="text" placeholder="Destinataire" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="tel" placeholder="Tél Destinataire" value={formData.recipientPhone} onChange={e => setFormData({...formData, recipientPhone: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <select value={formData.destinationCity} onChange={e => setFormData({...formData, destinationCity: e.target.value})} className="bg-slate-800 border border-white/20 rounded-lg p-3 text-white" required>
            <option value="">Destination</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Type de colis" value={formData.packageType} onChange={e => setFormData({...formData, packageType: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
          <input type="number" placeholder="Tarif (FCFA)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/10 border border-white/20 rounded-lg p-3 text-white" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Créer le colis</button>
      </form>
    </div>
  );
}
