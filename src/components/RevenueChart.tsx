import { useState, useEffect } from 'react';
import { DollarSign, Package, CheckCircle, TrendingUp } from 'lucide-react';
import { getDailyRevenues, getParcels } from '../lib/auth';

export default function RevenueChart() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setRevenues(await getDailyRevenues());
      setParcels(await getParcels());
    };
    load();
  }, []);

  const totalRevenue = parcels.filter(p => p.isPaid).reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <p className="text-gray-300 text-sm">Total Revenus</p>
          <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} FCFA</p>
        </div>
      </div>
      <div className="bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Historique</h3>
        <div className="space-y-2">
          {revenues.map(r => (
            <div key={r.date} className="flex justify-between text-white border-b border-white/5 py-2">
              <span>{r.date}</span>
              <span>{r.totalRevenue.toLocaleString()} FCFA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
