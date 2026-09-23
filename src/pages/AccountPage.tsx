import React, { useState, useEffect } from 'react';
import {
  Crown,
  Shield,
  ShieldCheck,
  Sparkles,
  Gem,
  Award,
  Coins,
  CheckCircle2,
  TrendingUp,
  User,
  Edit2,
  Save,
  Trophy,
  Flame,
  Star,
  ShoppingBag,
  Zap,
  LogOut,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Home,
  Building,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchAchievements, fetchLeaderboard, fetchUserAddresses, saveUserAddress, deleteUserAddress, setDefaultUserAddress, fetchOrders } from '../lib/api';
import { Achievement, LeaderboardEntry, UserAddress, Order } from '../types';

const KUWAIT_GOVERNORATES: Record<string, string[]> = {
  'العاصمة': ['مدينة الكويت', 'شرق', 'دسمان', 'المرقاب', 'القبلة', 'بنيد القار', 'الدسمة', 'الدعية', 'المنصورية', 'عبدالله السالم', 'النزهة', 'الفيحاء', 'الشامية', 'الروضة', 'العديلية', 'الخالدية', 'كيفان', 'القادسية', 'قرطبة', 'السرة', 'اليرموك', 'الشويخ', 'غرناطة', 'الصليبيخات', 'الدوحة', 'النهضة', 'شمال غرب الصليبيخات', 'جابر الأحمد'],
  'حولي': ['حولي', 'السالمية', 'الرميثية', 'الجابرية', 'مشرف', 'بيان', 'البدع', 'الشعب', 'السلام', 'حطين', 'الشهداء', 'الزهراء', 'الصديق', 'مبارك العبدالله غرب مشرف', 'سلوى'],
  'الفروانية': ['الفروانية', 'خيطان', 'الأندلس', 'إشبيلية', 'جليب الشيوخ', 'الرقعي', 'الرابية', 'الرحاب', 'العارضية', 'صباح الناصر', 'الفردوس', 'عبدالله المبارك (غرب الجليب)', 'العمرية', 'الضجيج'],
  'الأحمدي': ['الأحمدي', 'الفحيحيل', 'المنقف', 'أبو حليفة', 'الفنطاس', 'المهبولة', 'الصباحية', 'الرقة', 'هدية', 'الظهر', 'العقيلة', 'علي صباح السالم (أم الهيمان)', 'صباح الأحمد السكنية', 'الخيران', 'الوفرة'],
  'مبارك الكبير': ['مبارك الكبير', 'العدان', 'القصور', 'القرين', 'صباح السالم', 'المسيلة', 'أبو فطيرة', 'الفنيطيس', 'أبو الحصانية', 'المسايل', 'صبحان'],
  'الجهراء': ['الجهراء', 'الواحة', 'العيون', 'القصر', 'النسيم', 'تيماء', 'النعيم', 'سعد العبدالله', 'الصليبية', 'كبد', 'المطلاع'],
};

const GOVERNORATES_EN: Record<string, string> = {
  'العاصمة': 'Capital (Al Asimah)',
  'حولي': 'Hawalli',
  'الفروانية': 'Farwaniya',
  'الأحمدي': 'Ahmadi',
  'مبارك الكبير': 'Mubarak Al-Kabeer',
  'الجهراء': 'Jahra',
};

const TIER_NAMES_EN: Record<string, string> = {
  'المستوى البرونزي': 'Bronze Tier',
  'المستوى الفضي': 'Silver Tier',
  'المستوى الذهبي': 'Gold Tier',
  'المستوى البلاتيني': 'Platinum Tier',
  'المستوى الماسي': 'Diamond Tier',
};

interface AccountPageProps {
  onNavigate: (page: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { profile, wallet, settings } = useGamification();
  const { user, userProfile, logout, openAuthModal, updateUserData } = useAuth();
  const { dir, isRtl, language, t, formatPrice } = useLanguage();

  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>("");
  const [tempPhone, setTempPhone] = useState<string>("");

  useEffect(() => {
    if (editingName) {
      setTempName(userProfile?.displayName || user?.displayName || "");
      setTempPhone(userProfile?.phone || "");
    }
  }, [editingName]);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTab, setOrdersTab] = useState<'ongoing' | 'previous'>('ongoing');
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'levels' | 'achievements' | 'leaderboard'>('orders');
  const [loading, setLoading] = useState<boolean>(true);

  // Address Form Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrTitle, setAddrTitle] = useState(isRtl ? 'المنزل' : 'Home');
  const [addrCustomerName, setAddrCustomerName] = useState('');
  const [addrCustomerPhone, setAddrCustomerPhone] = useState('');
  const [addrGovernorate, setAddrGovernorate] = useState('العاصمة');
  const [addrArea, setAddrArea] = useState(KUWAIT_GOVERNORATES['العاصمة'][0] || '');
  const [addrBlock, setAddrBlock] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrAvenue, setAddrAvenue] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrFloor, setAddrFloor] = useState('');
  const [addrApartment, setAddrApartment] = useState('');
  const [addrNotes, setAddrNotes] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || (isRtl ? 'عميل المتجر' : 'Store Customer');

  const loadAddresses = async () => {
    const uId = user?.uid || profile?.id;
    if (!uId) return;
    try {
      const res = await fetchUserAddresses(uId);
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  useEffect(() => {
    const loadExtraData = async () => {
      const uId = user?.uid || profile?.id;
      if (!uId) {
        setLoading(false);
        return;
      }
      try {
        const phoneToUse = userProfile?.phone || '';
        const [achData, leadData, addrData, ordersData] = await Promise.all([
          fetchAchievements(uId),
          fetchLeaderboard(),
          fetchUserAddresses(uId),
          fetchOrders({ phone: phoneToUse }),
        ]);
        if (achData.success) setAchievements(achData.achievements);
        if (leadData.success) setLeaderboard(leadData.leaderboard);
        if (addrData.success && addrData.addresses) setAddresses(addrData.addresses);
        if (ordersData.success && ordersData.orders) setOrders(ordersData.orders);
      } catch (err) {
        console.error('Failed to load user account data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadExtraData();
  }, [user?.uid, profile?.id]);

  const handleSaveProfile = async () => {
    if (tempName.trim()) {
      try {
        await updateUserData({ displayName: tempName.trim(), phone: tempPhone.trim() });
        setEditingName(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddrTitle(isRtl ? 'المنزل' : 'Home');
    setAddrCustomerName(displayName || '');
    setAddrCustomerPhone(userProfile?.phone || '');
    setAddrGovernorate('العاصمة');
    setAddrArea(KUWAIT_GOVERNORATES['العاصمة'][0] || '');
    setAddrBlock('');
    setAddrStreet('');
    setAddrAvenue('');
    setAddrBuilding('');
    setAddrFloor('');
    setAddrApartment('');
    setAddrNotes('');
    setAddrIsDefault(addresses.length === 0);
    setAddrError(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddrTitle(addr.title || (isRtl ? 'المنزل' : 'Home'));
    setAddrCustomerName(addr.customerName);
    setAddrCustomerPhone(addr.customerPhone);
    setAddrGovernorate(addr.governorate);
    setAddrArea(addr.area);
    setAddrBlock(addr.block);
    setAddrStreet(addr.street);
    setAddrAvenue(addr.avenue || '');
    setAddrBuilding(addr.building);
    setAddrFloor(addr.floor || '');
    setAddrApartment(addr.apartment || '');
    setAddrNotes(addr.notes || '');
    setAddrIsDefault(Boolean(addr.isDefault));
    setAddrError(null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);

    const uId = user?.uid || profile?.id;
    if (!uId) {
      setAddrError(isRtl ? 'يرجى تسجيل الدخول لحفظ العنوان' : 'Please log in to save address');
      return;
    }

    if (!addrCustomerName.trim() || !addrCustomerPhone.trim() || !addrBlock.trim() || !addrStreet.trim() || !addrBuilding.trim()) {
      setAddrError(isRtl ? 'يرجى تعبئة الحقول الأساسية المطلوبة: الاسم، الهاتف، القطعة، الشارع، المبنى' : 'Please fill all required fields: Name, Phone, Block, Street, Building');
      return;
    }

    setIsSavingAddr(true);
    try {
      const res = await saveUserAddress({
        id: editingAddressId || undefined,
        userId: uId,
        title: addrTitle.trim() || (isRtl ? 'المنزل' : 'Home'),
        customerName: addrCustomerName.trim(),
        customerPhone: addrCustomerPhone.trim(),
        governorate: addrGovernorate,
        area: addrArea,
        block: addrBlock.trim(),
        street: addrStreet.trim(),
        avenue: addrAvenue.trim() || undefined,
        building: addrBuilding.trim(),
        floor: addrFloor.trim() || undefined,
        apartment: addrApartment.trim() || undefined,
        notes: addrNotes.trim() || undefined,
        isDefault: addrIsDefault,
      });

      if (res.success) {
        await loadAddresses();
        setIsAddressModalOpen(false);
      } else {
        setAddrError(res.error || (isRtl ? 'فشل حفظ العنوان' : 'Failed to save address'));
      }
    } catch (err: any) {
      setAddrError(err.message || (isRtl ? 'حدث خطأ أثناء حفظ العنوان' : 'Error saving address'));
    } finally {
      setIsSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const uId = user?.uid || profile?.id;
    if (!uId) return;
    if (!window.confirm(isRtl ? 'هل تريد حذف هذا العنوان نهائياً؟' : 'Are you sure you want to delete this address?')) return;

    try {
      const res = await deleteUserAddress(id, uId);
      if (res.success) {
        await loadAddresses();
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const uId = user?.uid || profile?.id;
    if (!uId) return;
    try {
      const res = await setDefaultUserAddress(id, uId);
      if (res.success) {
        await loadAddresses();
      }
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const tiers = settings?.tiers || [];
  const rawTierName = profile?.currentTier || userProfile?.currentTier || 'المستوى البرونزي';
  const currentTierName = language === 'en' ? (TIER_NAMES_EN[rawTierName] || rawTierName) : rawTierName;

  // If not logged in, prompt sign in
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6" dir={dir}>
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">{isRtl ? 'سجّل دخولك للوصول إلى حسابك' : 'Sign in to access your account'}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRtl
              ? 'سجّل دخولك لمتابعة عناوينك المحفوظة، مستواك، شارات الإنجاز، ورصيد محفظة الألعاب'
              : 'Sign in to manage your saved addresses, track tier status, badges, and rewards wallet balance'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('auth.login_submit')}</span>
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('auth.register_submit')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8" dir={dir}>
      {/* User Header & Profile Identity */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/25 border border-amber-300/40 shrink-0">
              {displayName.charAt(0) || 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        placeholder={isRtl ? 'الاسم' : 'Name'}
                        className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-amber-500"
                        maxLength={30}
                      />
                      <input
                        type="tel"
                        value={tempPhone}
                        onChange={e => setTempPhone(e.target.value)}
                        placeholder={isRtl ? 'الهاتف' : 'Phone'}
                        className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                        maxLength={15}
                        dir="ltr"
                      />
                      <button
                        onClick={handleSaveProfile}
                        disabled={!tempName.trim()}
                        className={`p-1.5 rounded-lg text-slate-950 cursor-pointer transition-colors ${tempName.trim() ? 'bg-amber-500 hover:bg-amber-400' : 'bg-slate-500 opacity-50 cursor-not-allowed'}`}
                        title={isRtl ? 'حفظ التعديلات' : 'Save Changes'}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-black text-white">{displayName}</h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                      title={isRtl ? 'تعديل الاسم والهاتف' : 'Edit Name & Phone'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {user.email && (
                  <span className="text-slate-300 flex items-center gap-1 font-mono text-[11px]" dir="ltr">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {user.email}
                  </span>
                )}
                <span className="text-slate-400">•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {currentTierName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-cyan-300 font-bold">{profile?.xp || userProfile?.xp || 0} XP</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {formatPrice(wallet?.activeBalance ?? 0)} {isRtl ? 'بالمحفظة' : 'in Wallet'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/wallet')}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>{isRtl ? 'محفظة المكافآت' : 'Rewards Wallet'}</span>
            </button>
            <button
              onClick={() => onNavigate('/games')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{isRtl ? 'مركز الألعاب والـ XP' : 'Games & XP Center'}</span>
            </button>
            <button
              onClick={logout}
              className="py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={t('auth.logout')}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isRtl ? `مشترياتي (${orders.length})` : `My Orders (${orders.length})`}</span>
        </button>


        <button
          onClick={() => setActiveTab('addresses')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isRtl ? `العناوين المحفوظة (${addresses.length})` : `Saved Addresses (${addresses.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'levels'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{isRtl ? 'المستويات والمزايا' : 'Tiers & Perks'}</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'achievements'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>
            {isRtl
              ? `الأوسمة والإنجازات (${achievements.filter(a => a.isUnlocked).length})`
              : `Badges & Achievements (${achievements.filter(a => a.isUnlocked).length})`}
          </span>
        </button>

        {settings?.enableLeaderboard && (
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{isRtl ? 'لوحة المتصدرين' : 'Leaderboard'}</span>
          </button>
        )}
      </div>

            {/* 0. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRtl ? 'مشترياتك' : 'Your Purchases'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'تابع حالة طلباتك الجارية واستعرض تفاصيل مشترياتك السابقة'
                : 'Track your ongoing orders and review your previous purchases'}
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setOrdersTab('ongoing')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                ordersTab === 'ongoing'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {isRtl ? 'مشترياتك الجارية' : 'Ongoing Purchases'}
            </button>
            <button
              onClick={() => setOrdersTab('previous')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                ordersTab === 'previous'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {isRtl ? 'مشترياتك السابقة' : 'Previous Purchases'}
            </button>
          </div>

          {(() => {
            const displayOrders = ordersTab === 'ongoing'
              ? orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.orderStatus))
              : orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.orderStatus));

            if (displayOrders.length === 0) {
              return (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {ordersTab === 'ongoing'
                      ? (isRtl ? 'لا توجد مشتريات جارية' : 'No ongoing purchases')
                      : (isRtl ? 'لا توجد مشتريات سابقة' : 'No previous purchases')}
                  </h3>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex"
                  >
                    {isRtl ? 'تسوق الآن' : 'Shop Now'}
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {displayOrders.map(order => (
                  <div key={order.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                          order.orderStatus === 'completed' || order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                          order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                          'bg-sky-50 text-sky-600'
                        }`}>
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {isRtl ? 'طلب #' : 'Order #'}{order.orderNumber}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          order.orderStatus === 'completed' || order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {t(`order.status_${order.orderStatus}`, order.orderStatus)}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatPrice(order.total || order.subtotal)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">
                          {order.items.length} {isRtl ? 'عناصر' : 'items'}
                        </span>
                        <button
                          onClick={() => onNavigate(`/order/${order.id}`)}
                          className="font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                        >
                          {isRtl ? 'عرض التفاصيل' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 1. SAVED ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isRtl ? 'عناوين التوصيل المسجلة' : 'Registered Delivery Addresses'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl
                  ? 'احفظ عناوينك لتسريع وتسهيل إتمام طلباتك دون الحاجة لإعادة إدخالها عند كل شراء'
                  : 'Save your addresses to speed up checkout without re-typing each time'}
              </p>
            </div>
            <button
              onClick={openNewAddressModal}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isRtl ? 'لا توجد عناوين محفوظة بعد' : 'No saved addresses yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {isRtl
                    ? 'أضف عنوان منزلك أو عملك الآن لتجربة شراء سريعة ومريحة في خطوات بسيطة'
                    : 'Add your home or office address now for a fast and effortless checkout experience'}
                </p>
              </div>
              <button
                onClick={openNewAddressModal}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isRtl ? 'إضافة عنوان الآن' : 'Add Address Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(addr => {
                const govDisplay = language === 'en' ? (GOVERNORATES_EN[addr.governorate] || addr.governorate) : addr.governorate;
                return (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border transition-all relative ${
                      addr.isDefault
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {addr.title?.toLowerCase().includes('office') || addr.title?.includes('عمل') || addr.title?.includes('مكتب') ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.title || (isRtl ? 'العنوان' : 'Address')}</span>
                          {addr.isDefault && (
                            <span className={`${isRtl ? 'mr-2' : 'ml-2'} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300`}>
                              <Check className="w-3 h-3" />
                              {isRtl ? 'العنوان الافتراضي' : 'Default Address'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditAddressModal(addr)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isRtl ? 'تعديل العنوان' : 'Edit Address'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={isRtl ? 'حذف العنوان' : 'Delete Address'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className={`space-y-1.5 text-xs text-slate-600 dark:text-slate-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {addr.customerName} ({addr.customerPhone})
                      </div>
                      <div className="leading-relaxed">
                        {govDisplay} - {addr.area}، {isRtl ? 'قطعة' : 'Block'} {addr.block}، {isRtl ? 'شارع' : 'Street'} {addr.street}
                        {addr.avenue ? `، ${isRtl ? 'جادة' : 'Avenue'} ${addr.avenue}` : ''}، {isRtl ? 'مبنى/منزل' : 'Bldg/House'} {addr.building}
                        {addr.floor ? `، ${isRtl ? 'الدور' : 'Floor'} ${addr.floor}` : ''}
                        {addr.apartment ? `، ${isRtl ? 'شقة' : 'Apt'} ${addr.apartment}` : ''}
                      </div>
                      {addr.notes && (
                        <div className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-2">
                          {isRtl ? 'ملاحظات: ' : 'Notes: '} {addr.notes}
                        </div>
                      )}
                    </div>

                    {!addr.isDefault && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          {isRtl ? 'تعيين كعنوان افتراضي للطلبات' : 'Set as Default Delivery Address'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. LEVELS TAB */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'كلما أجبت على المزيد من التحديات وأتممت الطلبات، ارتفع مستواك ونلت شارات ومزايا استثنائية.'
              : 'Complete more challenges and orders to level up and unlock exclusive perks and discounts.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map(tier => {
              const isCurrent = rawTierName === tier.name;
              const isUnlocked = (profile?.xp || 0) >= tier.minXp;
              const tierDisplayName = language === 'en' ? (TIER_NAMES_EN[tier.name] || tier.name) : tier.name;

              return (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20'
                      : isUnlocked
                      ? 'border-emerald-500/40 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {tier.name.includes('ماسي') ? (
                          <Gem className="w-6 h-6 text-violet-400" />
                        ) : tier.name.includes('بلاتيني') ? (
                          <Sparkles className="w-6 h-6 text-cyan-400" />
                        ) : tier.name.includes('ذهبي') ? (
                          <Crown className="w-6 h-6 text-amber-400" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{tierDisplayName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                              {isRtl ? 'مستواك الحالي' : 'Current Tier'}
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                          {isRtl ? `يبدأ من ${tier.minXp} XP` : `Starts from ${tier.minXp} XP`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{tier.perks}</p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{isRtl ? 'مضاعف نقاط التحدي:' : 'Challenge Points Multiplier:'}</span>
                    <span className="font-bold text-amber-600 font-mono">{tier.rewardMultiplier}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'أوسمة وإنجازات تمنحك نقاط خبرة ورصيد مكافآت نقدي في المحفظة عند إكمال شروطها.'
              : 'Badges and milestones that grant experience points and cash wallet credits upon completion.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  ach.isUnlocked
                    ? 'border-amber-500/40 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-2xl">{ach.icon || '🏅'}</div>
                  {ach.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {isRtl ? 'مكتمل' : 'Unlocked'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      {ach.progress}/{ach.target}
                    </span>
                  )}
                </div>

                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ach.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">+{ach.rewardXp} XP</span>
                  {ach.rewardKwd && (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatPrice(ach.rewardKwd)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'أبرز المتسابقين الحاصلين على أعلى نقاط خبرة XP في مكتبة الشاطئ الازرق.'
              : 'Top rankers with the highest XP in Blue Beach Stationery.'}
          </p>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map(item => (
                <div key={item.rank} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                        item.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.rank}
                    </div>

                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.displayName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          {language === 'en' ? (TIER_NAMES_EN[item.tierName] || item.tierName) : item.tierName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {isRtl ? `${item.completedChallenges} تحديات مكتملة` : `${item.completedChallenges} challenges completed`}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    {item.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto" dir={dir}>
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 start-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingAddressId ? (isRtl ? 'تعديل العنوان' : 'Edit Address') : (isRtl ? 'إضافة عنوان توصيل جديد' : 'Add New Delivery Address')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRtl ? 'يرجى كتابة تفاصيل العنوان في دولة الكويت بدقة' : 'Please provide accurate Kuwait address details'}
                </p>
              </div>
            </div>

            {addrError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addrError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isRtl ? 'تسمية العنوان' : 'Address Label'}
                </label>
                <div className="flex gap-2">
                  {(isRtl ? ['المنزل', 'العمل', 'الشاليه', 'الديوانية'] : ['Home', 'Office', 'Chalet', 'Diwaniya']).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddrTitle(t)}
                      className={`py-1.5 px-3 rounded-lg border font-bold transition-all cursor-pointer ${
                        addrTitle === t
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={addrTitle}
                    onChange={e => setAddrTitle(e.target.value)}
                    placeholder={isRtl ? 'أو اكتب اسماً آخر' : 'Or enter custom name'}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isRtl ? 'اسم المستلم *' : 'Recipient Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={addrCustomerName}
                    onChange={e => setAddrCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrCustomerPhone}
                    onChange={e => setAddrCustomerPhone(e.target.value)}
                    placeholder="9xxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.governorate')} *
                  </label>
                  <select
                    value={addrGovernorate}
                    onChange={e => {
                      const gov = e.target.value;
                      setAddrGovernorate(gov);
                      setAddrArea(KUWAIT_GOVERNORATES[gov]?.[0] || '');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    {Object.keys(KUWAIT_GOVERNORATES).map(gov => (
                      <option key={gov} value={gov}>
                        {language === 'en' ? (GOVERNORATES_EN[gov] || gov) : gov}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.area')} *
                  </label>
                  <select
                    value={addrArea}
                    onChange={e => setAddrArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    {(KUWAIT_GOVERNORATES[addrGovernorate] || []).map(ar => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.block')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrBlock}
                    onChange={e => setAddrBlock(e.target.value)}
                    placeholder={isRtl ? 'مثال: 4' : 'e.g. 4'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.street')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrStreet}
                    onChange={e => setAddrStreet(e.target.value)}
                    placeholder={isRtl ? 'مثال: شارع 12' : 'e.g. Street 12'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.avenue')} ({isRtl ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={addrAvenue}
                    onChange={e => setAddrAvenue(e.target.value)}
                    placeholder={isRtl ? 'مثال: 3' : 'e.g. 3'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.building')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrBuilding}
                    onChange={e => setAddrBuilding(e.target.value)}
                    placeholder={isRtl ? 'مثال: 15' : 'e.g. 15'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('checkout.floor')} ({isRtl ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={addrFloor}
                    onChange={e => setAddrFloor(e.target.value)}
                    placeholder={isRtl ? 'مثال: 2' : 'e.g. 2'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isRtl ? 'الشقة (اختياري)' : 'Apt (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={addrApartment}
                    onChange={e => setAddrApartment(e.target.value)}
                    placeholder={isRtl ? 'مثال: 4B' : 'e.g. 4B'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('checkout.notes')} ({isRtl ? 'اختياري' : 'Optional'})
                </label>
                <input
                  type="text"
                  value={addrNotes}
                  onChange={e => setAddrNotes(e.target.value)}
                  placeholder={isRtl ? 'مثال: الباب الجانبي، بجانب المسجد...' : 'e.g. Side entrance, next to mosque...'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_default_addr"
                  checked={addrIsDefault}
                  onChange={e => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="chk_default_addr" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {isRtl ? 'تعيين هذا العنوان كعنوان افتراضي لتوصيل الطلبات' : 'Set as default address for delivery'}
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSavingAddr}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingAddr ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ العنوان' : 'Save Address')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
