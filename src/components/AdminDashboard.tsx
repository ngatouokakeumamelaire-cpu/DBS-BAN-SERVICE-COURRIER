import { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, Plus, Eye, Shield, Trash2 } from 'lucide-react';
import { getUsers, getParcels, createCourierUser, createAdminUser, deleteUser, archiveUser, getDailyRevenues, getCourierDailyStats } from '../lib/auth';
import CreateCourierModal from './CreateCourierModal';
import CreateAdminModal from './CreateAdminModal';
import ParcelList from './ParcelList';
import RevenueChart from './RevenueChart';
import { Archive } from 'lucide-react';

import { User } from '../lib/auth';

export default function AdminDashboard({ user }: { user: User }) {
  const [users, setUsers] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'couriers' | 'parcels' | 'revenue'>('overview');
  const [dailyRevenues, setDailyRevenues] = useState<any[]>([]);

  const loadData = async () => {
    const usersData = await getUsers();
    const parcelsData = await getParcels();
    const revenuesData = await getDailyRevenues();
    setUsers(usersData);
    setParcels(parcelsData);
    setDailyRevenues(revenuesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const courierUsers = users.filter(u => u.role === 'courier' && !u.isArchived);
  const totalRevenue = parcels.filter(p => p.isPaid).reduce((sum, p) => sum + p.price, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = parcels
    .filter(p => p.isPaid && p.paidAt?.startsWith(today))
    .reduce((sum, p) => sum + p.price, 0);

  const handleCreateCourier = async (email: string, name: string, city: string, password?: string) => {
    try {
      await createCourierUser(email, name, city, password);
      loadData();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating courier:', err);
    }
  };

  const handleCreateAdmin = async (email: string, name: string, password?: string) => {
    try {
      await createAdminUser(email, name, password);
      loadData();
      setShowCreateAdminModal(false);
    } catch (err) {
      console.error('Error creating admin:', err);
    }
  };

  const handleArchiveUser = async (userId: string, userName: string, userEmail: string) => {
    if (userEmail === 'admin@dbs-ban.ci') {
      alert("L'administrateur principal ne peut pas être archivé.");
      return;
    }
    if (confirm(`Archiver l'utilisateur "${userName}" ? Il ne pourra plus se connecter. Il sera supprimé définitivement une fois que tous ses colis auront été purgés (après 30 jours).`)) {
      const success = await archiveUser(userId);
      if (success) loadData();
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    if (userEmail === 'admin@dbs-ban.ci') {
      alert("L'administrateur principal ne peut pas être supprimé.");
      return;
    }
    if (confirm(`Supprimer IMMÉDIATEMENT l'utilisateur "${userName}" ? Attention, cela peut causer des erreurs si des colis lui sont encore rattachés.`)) {
      const success = await deleteUser(userId);
      if (success) loadData();
    }
  };

  const stats = [
    { title: 'Responsables', value: courierUsers.length, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Colis', value: parcels.length, icon: Package, color: 'bg-green-500' },
    { title: 'Revenus Total', value: `${totalRevenue.toLocaleString()} FCFA`, icon: DollarSign, color: 'bg-purple-500' },
    { title: 'Aujourd\'hui', value: `${todayRevenue.toLocaleString()} FCFA`, icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: Eye },
            { key: 'couriers', label: 'Utilisateurs', icon: Users },
            { key: 'parcels', label: 'Colis', icon: Package },
            { key: 'revenue', label: 'Revenus', icon: DollarSign }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
          {/* Responsables Summary */}
          <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight">Résumé des Responsables</h3>
            <div className="space-y-4">
              {courierUsers.map(user => {
                const userParcels = parcels.filter(p => p.createdBy === user.id);
                const userRevenue = userParcels.filter(p => p.isPaid).reduce((sum, p) => sum + p.price, 0);
                const userTodayRevenue = userParcels
                  .filter(p => p.isPaid && p.paidAt?.startsWith(today))
                  .reduce((sum, p) => sum + p.price, 0);
                const deliveredCount = userParcels.filter(p => p.status === 'LIVRE').length;
                const destinedCount = parcels.filter(p => p.destinationCity === user.city).length;
                
                return (
                  <div key={user.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:bg-white/[0.06] transition-all">
                    <div>
                      <p className="font-black text-white text-lg">{user.name}</p>
                      <p className="text-sm font-bold text-gray-400">{user.city} ({destinedCount} à recevoir)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-black">{userRevenue.toLocaleString()} FCFA</p>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Aujourd'hui: {userTodayRevenue.toLocaleString()} FCFA</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{deliveredCount} livrés</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight">Activité Récente</h3>
            <div className="space-y-4">
              {parcels.slice(0, 6).map(parcel => (
                <div key={parcel.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:bg-white/[0.06] transition-all">
                  <div>
                    <p className="text-white font-black text-lg">{parcel.code}</p>
                    <p className="text-sm font-bold text-gray-400">{parcel.destinationCity}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    parcel.status === 'LIVRE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {parcel.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'couriers' && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Gestion des Utilisateurs</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateAdminModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Shield className="w-4 h-4" />Admin</button>
              <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" />Responsable</button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 text-gray-300">Nom</th>
                <th className="py-3 text-gray-300">Email</th>
                <th className="py-3 text-gray-300">Rôle</th>
                <th className="py-3 text-gray-300">Ville</th>
                <th className="py-3 text-gray-300">Destinés</th>
                <th className="py-3 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const destinedCount = parcels.filter(p => p.destinationCity === user.city).length;
                return (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="py-3 text-white">{user.name}</td>
                    <td className="py-3 text-gray-300">{user.email}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>{user.role}</span></td>
                    <td className="py-3 text-gray-300">{user.city || '-'}</td>
                    <td className="py-3 text-gray-300">{user.role === 'courier' ? destinedCount : '-'}</td>
                    <td className="py-3">
                    <div className="flex items-center gap-3">
                      {user.isArchived && (
                        <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase tracking-tighter">Archivé</span>
                      )}
                      {user.email !== 'admin@dbs-ban.ci' && (
                        <>
                          {!user.isArchived && (
                            <button 
                              onClick={() => handleArchiveUser(user.id, user.name, user.email)} 
                              className="text-orange-400 hover:text-orange-300 transition-colors"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name, user.email)} 
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      )}

      {activeTab === 'parcels' && <ParcelList isAdmin={true} userCity="" userId={user.id} />}
      {activeTab === 'revenue' && <RevenueChart />}

      {showCreateModal && <CreateCourierModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateCourier} />}
      {showCreateAdminModal && <CreateAdminModal onClose={() => setShowCreateAdminModal(false)} onCreate={handleCreateAdmin} />}
    </div>
  );
}
