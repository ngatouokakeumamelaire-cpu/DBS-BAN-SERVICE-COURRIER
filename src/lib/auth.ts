import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'courier';
  city?: string;
  createdAt: string;
  isArchived?: boolean;
}

export interface Parcel {
  id: string;
  code: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  destinationCity: string;
  packageType: string;
  value: string;
  status: 'ENREGISTRE' | 'PAYE' | 'EN_TRANSIT' | 'ARRIVE' | 'LIVRE' | 'ANNULE';
  price: number;
  isPaid: boolean;
  paidAt?: string;
  arrivedAt?: string;
  deliveredAt?: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  totalParcels: number;
  paidParcels: number;
  deliveredParcels: number;
}

const LOCAL_STORAGE_KEYS = {
  CURRENT_USER: 'dbs_ban_current_user'
};

// Note: In a real app, we'd use Supabase Auth. 
// For this reproduction, we'll simulate the login against a 'profiles' table to match the original logic.

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // In this reproduction, we'll use a 'profiles' table.
    // Password check is simplified for the demo as in the original code.
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !profile) return null;

    // Ne pas autoriser la connexion si archivé
    if (profile.is_archived) {
      console.warn('Tentative de connexion sur un compte archivé');
      return null;
    }

    // Check against stored password
    const isValid = profile.password === password;

    if (isValid) {
      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        city: profile.city,
        createdAt: profile.created_at
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return [];
  return data.map(p => ({
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
    city: p.city,
    createdAt: p.created_at,
    isArchived: p.is_archived
  }));
};

export const createCourierUser = async (email: string, name: string, city: string, password?: string): Promise<User> => {
  const newUser = {
    email,
    name,
    role: 'courier',
    city,
    password: password || 'courier123',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('profiles').insert(newUser).select().single();
  if (error) throw error;
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    city: data.city,
    createdAt: data.created_at
  };
};

export const createAdminUser = async (email: string, name: string, password?: string): Promise<User> => {
  const newUser = {
    email,
    name,
    role: 'admin',
    password: password || 'admin123',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('profiles').insert(newUser).select().single();
  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: data.created_at
  };
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  return !error;
};

export const getParcels = async (): Promise<Parcel[]> => {
  const { data, error } = await supabase.from('parcels').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data.map(p => ({
    id: p.id,
    code: p.code,
    senderName: p.sender_name,
    senderPhone: p.sender_phone,
    recipientName: p.recipient_name,
    recipientPhone: p.recipient_phone,
    destinationCity: p.destination_city,
    packageType: p.package_type,
    value: p.value,
    status: p.status,
    price: p.price,
    isPaid: p.is_paid,
    paidAt: p.paid_at,
    arrivedAt: p.arrived_at,
    deliveredAt: p.delivered_at,
    createdBy: p.created_by,
    createdAt: p.created_at,
    notes: p.notes
  }));
};

export const createParcel = async (parcelData: Omit<Parcel, 'id' | 'code' | 'createdAt'>): Promise<Parcel> => {
  const code = generateParcelCode();
  const newParcel = {
    code,
    sender_name: parcelData.senderName,
    sender_phone: parcelData.senderPhone,
    recipient_name: parcelData.recipientName,
    recipient_phone: parcelData.recipientPhone,
    destination_city: parcelData.destinationCity,
    package_type: parcelData.packageType,
    value: parcelData.value,
    status: parcelData.status,
    price: parcelData.price,
    is_paid: parcelData.isPaid,
    created_by: parcelData.createdBy,
    notes: parcelData.notes,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('parcels').insert(newParcel).select().single();
  if (error) throw error;

  return {
    id: data.id,
    code: data.code,
    senderName: data.sender_name,
    senderPhone: data.sender_phone,
    recipientName: data.recipient_name,
    recipientPhone: data.recipient_phone,
    destinationCity: data.destination_city,
    packageType: data.package_type,
    value: data.value,
    status: data.status,
    price: data.price,
    isPaid: data.is_paid,
    createdBy: data.created_by,
    createdAt: data.created_at,
    notes: data.notes
  };
};

export const updateParcel = async (id: string, updates: Partial<Parcel>): Promise<Parcel | null> => {
  const supabaseUpdates: any = {};
  if (updates.status) supabaseUpdates.status = updates.status;
  if (updates.isPaid !== undefined) supabaseUpdates.is_paid = updates.isPaid;
  if (updates.paidAt) supabaseUpdates.paid_at = updates.paidAt;
  if (updates.arrivedAt) supabaseUpdates.arrived_at = updates.arrivedAt;
  if (updates.deliveredAt) supabaseUpdates.delivered_at = updates.deliveredAt;

  const { data, error } = await supabase
    .from('parcels')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return {
    id: data.id,
    code: data.code,
    senderName: data.sender_name,
    senderPhone: data.sender_phone,
    recipientName: data.recipient_name,
    recipientPhone: data.recipient_phone,
    destinationCity: data.destination_city,
    packageType: data.package_type,
    value: data.value,
    status: data.status,
    price: data.price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    arrivedAt: data.arrived_at,
    deliveredAt: data.delivered_at,
    createdBy: data.created_by,
    createdAt: data.created_at,
    notes: data.notes
  };
};

export const archiveUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_archived: true })
    .eq('id', userId);
  return !error;
};

export const cleanupOldParcels = async (): Promise<void> => {
  try {
    // 1. Nettoyage des vieux colis livrés
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString();

    const { error: parcelError } = await supabase
      .from('parcels')
      .delete()
      .eq('status', 'LIVRE')
      .lt('delivered_at', dateString);

    if (parcelError) {
      console.error('Error cleaning up old parcels:', parcelError);
    }

    // 2. Nettoyage des utilisateurs archivés sans colis
    const { data: archivedUsers, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_archived', true);

    if (userError) {
      console.error('Error fetching archived users:', userError);
      return;
    }

    for (const user of archivedUsers) {
      // Vérifier s'il reste des colis pour cet utilisateur
      const { count, error: countError } = await supabase
        .from('parcels')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      if (!countError && count === 0) {
        // Supprimer définitivement l'utilisateur
        await supabase.from('profiles').delete().eq('id', user.id);
        console.log(`Utilisateur archivé ${user.id} supprimé définitivement (plus de colis).`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

const generateParcelCode = (): string => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 2 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
  
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `DBS-${month}${day}-${randomLetters}-${randomDigits}`;
};

export const getDailyRevenues = async (): Promise<DailyRevenue[]> => {
  const { data, error } = await supabase
    .from('daily_revenues')
    .select('*')
    .order('date', { ascending: false })
    .limit(7);
    
  if (error) return [];
  
  // Sort back to ascending for the chart
  return data.reverse().map(r => ({
    date: r.date,
    totalRevenue: r.total_revenue,
    totalParcels: r.total_parcels,
    paidParcels: r.paid_parcels,
    deliveredParcels: r.delivered_parcels
  }));
};

export const getCourierDailyStats = async (courierId: string) => {
  const parcels = await getParcels();
  const today = new Date().toISOString().split('T')[0];

  const todayParcels = parcels.filter(p =>
    p.createdAt.startsWith(today) && p.createdBy === courierId
  );

  const deliveredToday = todayParcels.filter(p => p.status === 'LIVRE').length;
  const revenueToday = todayParcels
    .filter(p => p.isPaid)
    .reduce((sum, p) => sum + p.price, 0);

  return {
    totalParcels: todayParcels.length,
    deliveredParcels: deliveredToday,
    revenue: revenueToday,
    paidParcels: todayParcels.filter(p => p.isPaid).length
  };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Verify current password first
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('password')
      .eq('id', userId)
      .single();

    if (fetchError || !profile || profile.password !== currentPassword) {
      return false;
    }

    // Update to new password
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password: newPassword })
      .eq('id', userId);
      
    return !updateError;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
};

// Initialisation de l'admin par défaut si nécessaire
export const initializeAdmin = async () => {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'admin');
  if (error) return;
  if (data.length === 0) {
    await createAdminUser('admin@dbs-ban.ci', 'Administrateur Principal');
  }
};
