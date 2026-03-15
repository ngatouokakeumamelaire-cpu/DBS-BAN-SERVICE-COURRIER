import { useState } from 'react';
import { Package, User, Phone, MapPin, DollarSign, FileText } from 'lucide-react';
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

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all";
  const labelClasses = "block text-sm font-bold text-gray-300 mb-2 ml-1";
  const iconClasses = "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500";

  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
      <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Nouveau Colis</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Info */}
          <div className="space-y-2">
            <label className={labelClasses}>Nom du déposant</label>
            <div className="relative group">
              <User className={iconClasses} />
              <input 
                type="text" 
                value={formData.senderName} 
                onChange={e => setFormData({...formData, senderName: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Téléphone du déposant</label>
            <div className="relative group">
              <Phone className={iconClasses} />
              <input 
                type="tel" 
                value={formData.senderPhone} 
                onChange={e => setFormData({...formData, senderPhone: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          {/* Recipient Info */}
          <div className="space-y-2">
            <label className={labelClasses}>Nom du destinataire</label>
            <div className="relative group">
              <User className={iconClasses} />
              <input 
                type="text" 
                value={formData.recipientName} 
                onChange={e => setFormData({...formData, recipientName: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Téléphone du destinataire</label>
            <div className="relative group">
              <Phone className={iconClasses} />
              <input 
                type="tel" 
                value={formData.recipientPhone} 
                onChange={e => setFormData({...formData, recipientPhone: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          {/* Parcel Details */}
          <div className="space-y-2">
            <label className={labelClasses}>Ville de destination</label>
            <div className="relative group">
              <MapPin className={iconClasses} />
              <select 
                value={formData.destinationCity} 
                onChange={e => setFormData({...formData, destinationCity: e.target.value})} 
                className={`${inputClasses} appearance-none cursor-pointer`}
                required
              >
                <option value="" className="bg-[#1A223F]">Sélectionner une ville</option>
                {cities.map(c => <option key={c} value={c} className="bg-[#1A223F]">{c}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Type de colis</label>
            <div className="relative group">
              <Package className={iconClasses} />
              <input 
                type="text" 
                value={formData.packageType} 
                onChange={e => setFormData({...formData, packageType: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Valeur déclarée</label>
            <div className="relative group">
              <FileText className={iconClasses} />
              <input 
                type="text" 
                value={formData.value} 
                onChange={e => setFormData({...formData, value: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Tarif d'expédition (FCFA)</label>
            <div className="relative group">
              <DollarSign className={iconClasses} />
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                className={inputClasses} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className={labelClasses}>Notes additionnelles</label>
          <textarea 
            value={formData.notes} 
            onChange={e => setFormData({...formData, notes: e.target.value})} 
            className={`${inputClasses} min-h-[120px] py-4 resize-none`}
            placeholder="Informations complémentaires sur le colis..."
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
        >
          Créer le colis
        </button>
      </form>
    </div>
  );
}
