import { useState, useEffect } from 'react';
import { DollarSign, Package, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { getDailyRevenues, getParcels } from '../lib/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function RevenueChart() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const revData = await getDailyRevenues();
        const parcelData = await getParcels();
        setRevenues(revData);
        setParcels(parcelData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue = parcels.filter(p => p.isPaid).reduce((sum, p) => sum + p.price, 0);
  const paidParcelsCount = parcels.filter(p => p.isPaid).length;
  const deliveredParcelsCount = parcels.filter(p => p.status === 'LIVRE').length;
  
  const last7DaysRevenue = revenues.reduce((sum, r) => sum + r.totalRevenue, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A223F] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
          <p className="text-white font-black text-lg">{payload[0].value.toLocaleString()} FCFA</p>
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-tighter mt-1">
            {payload[0].payload.paidParcels} colis payés
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Revenus</p>
              <p className="text-xl font-black text-white">{totalRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">7 derniers jours</p>
              <p className="text-xl font-black text-white">{last7DaysRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Colis Payés</p>
              <p className="text-xl font-black text-white">{paidParcelsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/20 p-3 rounded-xl">
              <Package className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Colis Livrés</p>
              <p className="text-xl font-black text-white">{deliveredParcelsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Revenus des 7 derniers jours</h3>
            <p className="text-gray-400 text-sm font-bold">Évolution quotidienne des encaissements</p>
          </div>
          <div className="bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
            <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Dernière semaine</span>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenues}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight="bold"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight="bold"
                tickFormatter={(value) => `${(value / 1000)}k`}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="totalRevenue" 
                stroke="#3B82F6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
        <h3 className="text-xl font-black text-white mb-8 tracking-tight">Historique Détaillé</h3>
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Date</th>
                <th className="pb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Colis Enregistrés</th>
                <th className="pb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">Colis Payés</th>
                <th className="pb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest text-right">Revenu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {revenues.slice().reverse().map(r => (
                <tr key={r.date} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 text-white font-bold">{new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                  <td className="py-4 text-gray-400 font-bold">{r.totalParcels}</td>
                  <td className="py-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {r.paidParcels} payés
                    </span>
                  </td>
                  <td className="py-4 text-right text-white font-black">{r.totalRevenue.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
