import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Truck, Package, CreditCard, Printer } from 'lucide-react';
import { getParcels, updateParcel, Parcel } from '../lib/auth';
import { sendBothNotifications, createParcelArrivedMessage, createParcelDeliveredMessage, createParcelShippedMessage, logNotification } from '../lib/notifications';

interface ParcelListProps {
  isAdmin: boolean;
  userCity: string;
  userId: string;
}

export default function ParcelList({ isAdmin, userCity, userId }: ParcelListProps) {
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

  const printReceipt = (parcel: Parcel) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Reçu DBS-BAN - ${parcel.code}</title>
          <style>
            @page { size: 100mm 100mm; margin: 0; }
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 20px;
              width: 100mm;
              height: 100mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              border: 1px solid #eee;
            }
            .header { margin-bottom: 15px; }
            .logo { font-size: 28px; font-weight: 900; margin: 0; color: #1e3a8a; }
            .sub-logo { font-size: 14px; margin: 0; color: #444; font-weight: bold; }
            .section-title { 
              font-weight: bold; 
              text-transform: uppercase; 
              margin-top: 15px; 
              margin-bottom: 5px;
              border-bottom: 1px solid #000;
              display: inline-block;
              padding: 0 10px;
              width: 100%;
            }
            .info { font-size: 12px; margin: 3px 0; }
            .price { font-size: 16px; font-weight: 900; margin-top: 5px; color: #059669; }
            .code { font-size: 14px; font-weight: bold; margin-top: 5px; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; }
            @media print {
              body { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo">DBS-BAN</h1>
            <p class="sub-logo">Diomandé Ban Service</p>
          </div>

          <div class="section-title">EXPEDITEUR</div>
          <div class="info"><strong>${parcel.senderName}</strong></div>
          <div class="info">Contact: ${parcel.senderPhone}</div>
          <div class="info">Colis: ${parcel.packageType}</div>
          <div class="info">Destination: ${parcel.destinationCity}</div>
          <div class="price">${parcel.price.toLocaleString()} FCFA</div>

          <div class="section-title">DESTINATAIRE</div>
          <div class="info"><strong>${parcel.recipientName}</strong></div>
          <div class="info">Contact: ${parcel.recipientPhone}</div>
          <div class="code">${parcel.code}</div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
  };

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
    } else if (newStatus === 'EN_TRANSIT') {
      sendBothNotifications(parcel.recipientPhone, createParcelShippedMessage(parcel.code));
      logNotification('Expédition', parcel.recipientPhone, parcel.code);
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
            <option value="EN_TRANSIT" className="bg-[#1A223F]">En transit</option>
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
                    parcel.status === 'EN_TRANSIT' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {parcel.status}
                  </span>
                </td>
                <td className="py-5 px-4">
                  <div className="flex gap-2">
                    {!parcel.isPaid && parcel.createdBy === userId && (
                      <button 
                        onClick={() => handlePayment(parcel.id)} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                      >
                        <CreditCard className="w-3 h-3" />
                        Payer
                      </button>
                    )}
                    {parcel.isPaid && parcel.status === 'PAYE' && parcel.createdBy === userId && (
                      <button 
                        onClick={() => handleStatusUpdate(parcel.id, 'EN_TRANSIT')} 
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                      >
                        <Truck className="w-3 h-3" />
                        Expédier
                      </button>
                    )}
                    {parcel.isPaid && (
                      <button 
                        onClick={() => printReceipt(parcel)} 
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                        title="Imprimer le reçu"
                      >
                        <Printer className="w-3 h-3" />
                        Reçu
                      </button>
                    )}
                    {!isAdmin && parcel.destinationCity === userCity && parcel.isPaid && parcel.status === 'EN_TRANSIT' && (
                      <button 
                        onClick={() => handleStatusUpdate(parcel.id, 'ARRIVE')} 
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                      >
                        Arrivé
                      </button>
                    )}
                    {!isAdmin && parcel.destinationCity === userCity && parcel.status === 'ARRIVE' && (
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
