import { useState, useEffect } from 'react';
import { Package, DollarSign, CheckCircle, Clock, Plus, Truck } from 'lucide-react';
import { User, getCourierDailyStats, getParcels } from '../lib/auth';
import ParcelList from './ParcelList';
import CreateParcelForm from './CreateParcelForm';

interface CourierDashboardProps {
  user: User;
}

export default function CourierDashboard({ user }: CourierDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'parcels' | 'create'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [allParcels, setAllParcels] = useState<any[]>([]);

  const loadData = async () => {
    const statsData = await getCourierDailyStats(user.id);
    const parcelsData = await getParcels();
    setStats(statsData);
    setAllParcels(parcelsData);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const myParcels = allParcels.filter(p => p.createdBy === user.id);
  const destinedParcelsCount = allParcels.filter(p => p.destinationCity === user.city).length;
  
  const statCards = stats ? [
    { title: 'Colis Créés', value: stats.totalParcels, icon: Package, color: 'bg-blue-500' },
    { title: 'Colis Destinés', value: destinedParcelsCount, icon: Truck, color: 'bg-indigo-500' },
    { title: 'Revenus', value: `${stats.revenue.toLocaleString()} FCFA`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'Payés', value: stats.paidParcels, icon: CheckCircle, color: 'bg-purple-500' },
    { title: 'Livrés', value: stats.deliveredParcels, icon: Clock, color: 'bg-orange-500' }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'overview', label: 'Tableau de bord', icon: Package },
            { key: 'parcels', label: 'Tous les colis', icon: Package },
            { key: 'create', label: 'Nouveau colis', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-bold mb-1">{stat.title}</p>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-xl p-3.5 shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight">Mes Colis Récents</h3>
            <div className="space-y-4">
              {myParcels.slice(0, 5).map(parcel => (
                <div key={parcel.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:bg-white/[0.06] transition-all">
                  <div>
                    <p className="font-black text-white text-lg">{parcel.code}</p>
                    <p className="text-sm font-bold text-gray-400">{parcel.recipientName}</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400">
                    {parcel.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight">Colis pour {user.city} ({destinedParcelsCount})</h3>
            <div className="space-y-4">
              {allParcels.filter(p => p.destinationCity === user.city).slice(0, 5).map(parcel => (
                <div key={parcel.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:bg-white/[0.06] transition-all">
                  <div>
                    <p className="font-black text-white text-lg">{parcel.code}</p>
                    <p className="text-sm font-bold text-gray-400">{parcel.recipientName}</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400">
                    {parcel.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parcels' && <ParcelList isAdmin={false} userCity={user.city || ''} userId={user.id} />}
      {activeTab === 'create' && <CreateParcelForm userId={user.id} />}
    </div>
  );
}
