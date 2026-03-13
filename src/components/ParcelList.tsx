import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Truck, Package, CreditCard } from 'lucide-react';
import { getParcels, updateParcel, Parcel } from '../lib/auth';
import { sendBothNotifications, createParcelArrivedMessage, createParcelDeliveredMessage, logNotification } from '../lib/notifications';

interface ParcelListProps {
  isAdmin: boolean;
  userCity: string;
}

export default function ParcelList({ isAdmin, userCity }: ParcelListProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadParcels = async () => {
    const data = await getParcels();
    setParcels(data);
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (parcelId: string, newStatus: Parcel['status']) => {
    const parcel = parcels.find(p => p.id === parcelId);
    if (!parcel) return;

    const updates: Partial<Parcel> = { status: newStatus };
    if (newStatus === 'ARRIVE') {
      updates.arrivedAt = new Date().toISOString();
      sendBothNotifications(parcel.recipientPhone, createParcelArrivedMessage(parcel.code));
      logNotification('Arrivée', parcel.recipientPhone, parcel.code);
    } else if (newStatus === 'LIVRE') {
      updates.deliveredAt = new Date().toISOString();
      sendBothNotifications(parcel.senderPhone, createParcelDeliveredMessage(parcel.code));
      logNotification('Livraison', parcel.senderPhone, parcel.code);
    }

    await updateParcel(parcelId, updates);
    loadParcels();
  };

  const handlePayment = async (parcelId: string) => {
    await updateParcel(parcelId, { isPaid: true, paidAt: new Date().toISOString(), status: 'PAYE' });
    loadParcels();
  };

  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all"
            placeholder="Rechercher un colis, un destinataire..."
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-12 pr-10 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.08] transition-all cursor-pointer font-bold text-sm"
          >
            <option value="" className="bg-[#1A223F]">Tous les statuts</option>
            <option value="ENREGISTRE" className="bg-[#1A223F]">Enregistré</option>
            <option value="PAYE" className="bg-[#1A223F]">Payé</option>
            <option value="ARRIVE" className="bg-[#1A223F]">Arrivé</option>
            <option value="LIVRE" className="bg-[#1A223F]">Livré</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Code</th>
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Destinataire</th>
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Destination</th>
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Tarif</th>
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Statut</th>
              <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredParcels.map(parcel => (
              <tr key={parcel.id} className="group hover:bg-white/[0.02] transition-all">
                <td className="py-5 px-4 text-white font-black">{parcel.code}</td>
                <td className="py-5 px-4 text-white font-bold">{parcel.recipientName}</td>
                <td className="py-5 px-4 text-gray-400 font-bold">{parcel.destinationCity}</td>
                <td className="py-5 px-4 text-emerald-400 font-black">{parcel.price.toLocaleString()} FCFA</td>
                <td className="py-5 px-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    parcel.status === 'LIVRE' ? 'bg-emerald-500/20 text-emerald-400' : 
                    parcel.status === 'ARRIVE' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {parcel.status}
                  </span>
                </td>
                <td className="py-5 px-4">
                  <div className="flex gap-2">
                    {!parcel.isPaid && (
                      <button 
                        onClick={() => handlePayment(parcel.id)} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                      >
                        Payer
                      </button>
                    )}
                    {(isAdmin || parcel.destinationCity === userCity) && parcel.isPaid && parcel.status !== 'ARRIVE' && parcel.status !== 'LIVRE' && (
                      <button 
                        onClick={() => handleStatusUpdate(parcel.id, 'ARRIVE')} 
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                      >
                        Arrivé
                      </button>
                    )}
                    {(isAdmin || parcel.destinationCity === userCity) && parcel.status === 'ARRIVE' && (
                      <button 
                        onClick={() => handleStatusUpdate(parcel.id, 'LIVRE')} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
                      >
                        Livrer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
