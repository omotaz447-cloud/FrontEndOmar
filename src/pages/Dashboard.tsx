import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WorkerAccount from '@/components/WorkerAccount';
import RepublicExhibitionAccounts from '@/components/RepublicExhibitionAccounts';
import TradeAccounts from '@/components/TradeAccounts';
import MerchantAccount from '@/components/MerchantAccount';
import MerchantGargaAccount from '@/components/MerchantGargaAccount';
import WorkerGargaAccount from '@/components/WorkerGargaAccount';
import ExhibitionSales from '@/components/ExhibitionSales';
import ExhibitionGargaSales from '@/components/ExhibitionGargaSales';
import GargaMallAccounts from '@/components/GargaMallAccounts';
import CenterDelaaHawanemWorkers from '@/components/CenterDelaaHawanemWorkers';
import CenterDelaaHawanemMerchants from '@/components/CenterDelaaHawanemMerchants';
import CenterDelaaHawanemCenter from '@/components/CenterDelaaHawanemCenter';
import CenterDelaaHawanemSales from '@/components/CenterDelaaHawanemSales';
import WorkerCenterSeimaAccount from '@/components/WorkerCenterSeimaAccount';
import CenterSeimaMerchantAccount from '@/components/CenterSeimaMerchantAccount';
import CenterSeimaSales from '@/components/CenterSeimaSales';
import CenterSeimaAccounts from '@/components/CenterSeimaAccounts';
import CenterGazaAccounts from '@/components/CenterGazaAccounts';
import CenterGazaMerchants from '@/components/CenterGazaMerchants';
import CenterGazaWorkers from '@/components/CenterGazaWorkers';
import NewCenterGazaSales from '@/components/NewCenterGazaSales';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  ShoppingCart,
  TrendingUp,
  LogOut,
  ChevronRight,
  Sparkles,
  BarChart3,
  Wallet,
  Crown,
} from 'lucide-react';

interface SubSection {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  subSections: SubSection[];
}

const Dashboard: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isWorkerAccountOpen, setIsWorkerAccountOpen] = useState(false);
  const [isRepublicExhibitionOpen, setIsRepublicExhibitionOpen] = useState(false);
  const [isTradeAccountsOpen, setIsTradeAccountsOpen] = useState(false);
  const [isMerchantAccountOpen, setIsMerchantAccountOpen] = useState(false);
  const [isMerchantGargaAccountOpen, setIsMerchantGargaAccountOpen] = useState(false);
  const [isWorkerGargaAccountOpen, setIsWorkerGargaAccountOpen] = useState(false);
  const [isExhibitionSalesOpen, setIsExhibitionSalesOpen] = useState(false);
  const [isExhibitionGargaSalesOpen, setIsExhibitionGargaSalesOpen] = useState(false);
  const [isGargaMallAccountsOpen, setIsGargaMallAccountsOpen] = useState(false);
  const [isCenterDelaaHawanemWorkersOpen, setIsCenterDelaaHawanemWorkersOpen] = useState(false);
  const [isCenterDelaaHawanemMerchantsOpen, setIsCenterDelaaHawanemMerchantsOpen] = useState(false);
  const [isCenterDelaaHawanemCenterOpen, setIsCenterDelaaHawanemCenterOpen] = useState(false);
  const [isCenterDelaaHawanemSalesOpen, setIsCenterDelaaHawanemSalesOpen] = useState(false);
  const [isWorkerCenterSeimaAccountOpen, setIsWorkerCenterSeimaAccountOpen] = useState(false);
  const [isCenterSeimaMerchantAccountOpen, setIsCenterSeimaMerchantAccountOpen] = useState(false);
  const [isCenterSeimaSalesOpen, setIsCenterSeimaSalesOpen] = useState(false);
  const [isCenterSeimaAccountsOpen, setIsCenterSeimaAccountsOpen] = useState(false);
  const [isCenterGazaAccountsOpen, setIsCenterGazaAccountsOpen] = useState(false);
  const [isCenterGazaMerchantsOpen, setIsCenterGazaMerchantsOpen] = useState(false);
  const [isCenterGazaWorkersOpen, setIsCenterGazaWorkersOpen] = useState(false);
  const [isNewCenterGazaSalesOpen, setIsNewCenterGazaSalesOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = Cookies.get('accessToken');
    const role = Cookies.get('userRole');

    console.log('Dashboard - Token:', token);
    console.log('Dashboard - Role:', role);

    if (!token) {
      console.log('No token found, redirecting to login');
      toast.error('يجب تسجيل الدخول أولاً');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      return;
    }

    // Allow access for admin and factory roles
    const allowedRoles = [
      'admin',
      'factory1',
      'factory2',
      'factory3',
      'factory4',
      'factory5',
    ];
    if (role && !allowedRoles.includes(role)) {
      console.log('User role is not authorized:', role);
      toast.error('غير مصرح لك بدخول هذه الصفحة');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      return;
    }

    console.log('User authorized, setting role:', role || 'admin');
    setUserRole(role || 'admin');
  }, []);

  const sections: Section[] = [
    {
      id: 'ballina',
      title: 'البلينا للتجارة والحسابات',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-blue-600 via-blue-700 to-indigo-800',
      subSections: [
        {
          id: 'ballina-workers',
          name: 'حساب عمال البلينا',
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: 'ballina-showroom',
          name: 'البلينا معرض الجمهورية الدولي',
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          id: 'ballina-traders',
          name: 'حسابات تجار البلينا',
          icon: <TrendingUp className="w-5 h-5" />,
        },
        {
          id: 'ballina-sales',
          name: 'مبيعات البلينا معرض الجمهورية',
          icon: <BarChart3 className="w-5 h-5" />,
        },
      ],
    },
    {
      id: 'girga',
      title: 'جرجا للتجارة والحسابات',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-emerald-600 via-green-700 to-teal-800',
      subSections: [
        {
          id: 'girga-traders',
          name: 'حساب تجار جرجا معرض مول العرب',
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          id: 'girga-workers',
          name: 'حسابات عمال جرجا معرض مول العرب',
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: 'girga-mall',
          name: 'جرجا معرض مول العرب',
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          id: 'girga-sales',
          name: 'مبيعات جرجا مول العرب',
          icon: <BarChart3 className="w-5 h-5" />,
        },
      ],
    },
    {
      id: 'dalaa-hawanem',
      title: 'سنتر دلع الهوانم للحسابات',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-pink-600 via-rose-700 to-fuchsia-800',
      subSections: [
        {
          id: 'dalaa-workers',
          name: 'حسابات عمال سنتر دلع الهوانم',
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: 'dalaa-traders',
          name: 'حسابات تجار سنتر دلع الهوانم',
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          id: 'dalaa-center',
          name: 'سنتر دلع الهوانم',
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          id: 'dalaa-sales',
          name: 'مبيعات سنتر دلع الهوانم',
          icon: <BarChart3 className="w-5 h-5" />,
        },
      ],
    },
    {
      id: 'sima',
      title: 'سنتر سيما للحسابات',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-600 via-violet-700 to-purple-800',
      subSections: [
        {
          id: 'sima-center',
          name: 'سنتر سيما',
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          id: 'sima-workers',
          name: 'حسابات عمال سنتر سيما',
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: 'sima-sales',
          name: 'مبيعات سنتر سيما',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          id: 'sima-traders',
          name: 'حساب تجار سنتر سيما',
          icon: <Wallet className="w-5 h-5" />,
        },
      ],
    },
    {
      id: 'gaza',
      title: 'سنتر غزة للحسابات',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-orange-600 via-amber-700 to-yellow-800',
      subSections: [
        {
          id: 'gaza-sales',
          name: 'مبيعات سنتر غزة',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          id: 'gaza-center',
          name: 'سنتر غزة',
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          id: 'gaza-traders',
          name: 'حساب تجار سنتر غزة',
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          id: 'gaza-workers',
          name: 'حسابات عمال سنتر غزة',
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
  ];

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userRole');
    toast.success('تم تسجيل الخروج بنجاح');
    window.location.href = '/';
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSubSectionClick = (subSectionId: string) => {
    if (subSectionId === 'ballina-workers') {
      setIsWorkerAccountOpen(true);
    } else if (subSectionId === 'ballina-showroom') {
      setIsRepublicExhibitionOpen(true);
    } else if (subSectionId === 'ballina-traders') {
      setIsMerchantAccountOpen(true);
    } else if (subSectionId === 'ballina-sales') {
      setIsExhibitionSalesOpen(true);
    } else if (subSectionId === 'girga-traders') {
      setIsMerchantGargaAccountOpen(true);
    } else if (subSectionId === 'girga-workers') {
      setIsWorkerGargaAccountOpen(true);
    } else if (subSectionId === 'girga-mall') {
      setIsGargaMallAccountsOpen(true);
    } else if (subSectionId === 'girga-sales') {
      setIsExhibitionGargaSalesOpen(true);
    } else if (subSectionId === 'dalaa-workers') {
      setIsCenterDelaaHawanemWorkersOpen(true);
    } else if (subSectionId === 'dalaa-traders') {
      setIsCenterDelaaHawanemMerchantsOpen(true);
    } else if (subSectionId === 'dalaa-center') {
      setIsCenterDelaaHawanemCenterOpen(true);
    } else if (subSectionId === 'dalaa-sales') {
      setIsCenterDelaaHawanemSalesOpen(true);
    } else if (subSectionId === 'sima-workers') {
      setIsWorkerCenterSeimaAccountOpen(true);
    } else if (subSectionId === 'sima-traders') {
      setIsCenterSeimaMerchantAccountOpen(true);
    } else if (subSectionId === 'sima-sales') {
      setIsCenterSeimaSalesOpen(true);
    } else if (subSectionId === 'sima-center') {
      setIsCenterSeimaAccountsOpen(true);
    } else if (subSectionId === 'gaza-sales') {
      setIsNewCenterGazaSalesOpen(true);
    } else if (subSectionId === 'gaza-center') {
      setIsCenterGazaAccountsOpen(true);
    } else if (subSectionId === 'gaza-traders') {
      setIsCenterGazaMerchantsOpen(true);
    } else if (subSectionId === 'gaza-workers') {
      setIsCenterGazaWorkersOpen(true);
    }
    // Add more handlers for other subsections as needed
  };

  // Filter sections based on user role
  const getFilteredSections = () => {
    if (userRole === 'admin') {
      return sections; // Admin sees all sections
    }

    const roleToSectionMap: Record<string, string> = {
      factory1: 'ballina',
      factory2: 'girga',
      factory3: 'dalaa-hawanem',
      factory4: 'sima',
      factory5: 'gaza',
    };

    const allowedSectionId = roleToSectionMap[userRole];
    return sections.filter((section) => section.id === allowedSectionId);
  };

  const filteredSections = getFilteredSections();

  // Get role-specific title and greeting
  const getRoleSpecificContent = () => {
    const roleContent: Record<
      string,
      { title: string; greeting: string; accent: string }
    > = {
      admin: {
        title: 'لوحة التحكم الإدارية',
        greeting: 'مرحباً بك في نظام إدارة الحسابات المتطور',
        accent: 'from-purple-500 to-blue-500',
      },
      factory1: {
        title: 'مرحباً بك في البلينا للتجارة',
        greeting: 'نظام إدارة حسابات البلينا ومعرض الجمهورية الدولي',
        accent: 'from-blue-500 to-indigo-600',
      },
      factory2: {
        title: 'مرحباً بك في جرجا للتجارة',
        greeting: 'نظام إدارة حسابات جرجا ومعرض مول العرب',
        accent: 'from-emerald-500 to-teal-600',
      },
      factory3: {
        title: 'مرحباً بك في سنتر دلع الهوانم',
        greeting: 'نظام إدارة حسابات وعمليات سنتر دلع الهوانم',
        accent: 'from-pink-500 to-rose-600',
      },
      factory4: {
        title: 'مرحباً بك في سنتر سيما',
        greeting: 'نظام إدارة حسابات وعمليات سنتر سيما',
        accent: 'from-purple-500 to-violet-600',
      },
      factory5: {
        title: 'مرحباً بك في سنتر غزة',
        greeting: 'نظام إدارة حسابات وعمليات سنتر غزة',
        accent: 'from-orange-500 to-amber-600',
      },
    };

    return roleContent[userRole] || roleContent['admin'];
  };

  const roleContent = getRoleSpecificContent();

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-white text-xl flex items-center space-x-4 space-x-reverse"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          />
          <span>جاري التحميل...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative z-10 p-4 lg:p-8">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="text-white mb-6 lg:mb-0">
            <motion.h1
              className="text-3xl lg:text-2xl font-bold mb-4 bg-gradient-to-l from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent text-right"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {roleContent.title}
            </motion.h1>
            <motion.p
              className="text-lg text-gray-400 text-right"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {roleContent.greeting}
            </motion.p>
            <motion.div
              className={`w-20 h-1 bg-gradient-to-l ${roleContent.accent} rounded-full mt-4 mr-auto`}
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-red-500/25 px-6 py-3"
            >
              <LogOut className="w-5 h-5 ml-2" />
              تسجيل الخروج
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            {
              label: 'إجمالي الأقسام',
              value: filteredSections.length,
              icon: <Building2 className="w-8 h-8" />,
              color: 'from-blue-500 to-purple-600',
              // badge: 'نشط',
              badgeVariant: 'default' as const,
            },
            {
              label: 'الحسابات المفعلة',
              value: filteredSections.reduce(
                (acc, section) => acc + section.subSections.length,
                0,
              ),
              icon: <Users className="w-8 h-8" />,
              color: 'from-emerald-500 to-teal-600',
              // badge: 'متاح',
              badgeVariant: 'secondary' as const,
            },
            {
              label: 'الأنظمة المتاحة',
              value: '100%',
              icon: <TrendingUp className="w-8 h-8" />,
              color: 'from-orange-500 to-red-600',
              // badge: 'مكتمل',
              badgeVariant: 'outline' as const,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <CardDescription className="text-gray-400 text-sm">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold text-gray-100 mt-2">
                        {stat.value}
                      </CardTitle>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-l ${stat.color} shadow-lg`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end"></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Sections Grid */}
        <motion.div
          className={`${
            userRole === 'admin'
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'
              : 'flex justify-center'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <AnimatePresence>
            {filteredSections.map((section, index) => (
              <motion.div
                key={section.id}
                className={`group ${
                  userRole !== 'admin' ? 'max-w-2xl w-full' : ''
                }`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 1 + index * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{ y: -8 }}
                layout
              >
                <div
                  className={`backdrop-blur-xl bg-gray-900/60 border border-gray-700/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-gray-600/50 relative overflow-hidden ${
                    userRole !== 'admin' ? 'p-12 lg:p-16' : 'p-8'
                  }`}
                >
                  {/* Enhanced decorative elements for factory roles */}
                  {userRole !== 'admin' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-gray-800/20 rounded-3xl" />
                      <motion.div
                        className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
                        animate={{
                          scale: [1.2, 1, 1.2],
                          rotate: [360, 180, 0],
                        }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </>
                  )}

                  {/* Standard decorative elements for admin */}
                  {userRole === 'admin' && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-800/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-800/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
                    </>
                  )}

                  {/* Section Header */}
                  <motion.div
                    className={`bg-gradient-to-r ${section.color} rounded-2xl cursor-pointer shadow-lg relative overflow-hidden ${
                      userRole !== 'admin' ? 'p-8 mb-8' : 'p-6 mb-6'
                    }`}
                    onClick={() => toggleSection(section.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Enhanced shine effect for factory roles */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                      animate={
                        expandedSection === section.id
                          ? { x: ['100%', '200%'] }
                          : userRole !== 'admin'
                            ? { x: ['-100%', '200%'] }
                            : {}
                      }
                      transition={{
                        duration: userRole !== 'admin' ? 2 : 0.6,
                        ease: 'easeInOut',
                        repeat: userRole !== 'admin' ? Infinity : 0,
                        repeatDelay: userRole !== 'admin' ? 3 : 0,
                      }}
                    />

                    <div className="flex items-center justify-between text-white relative z-10">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <h2
                          className={`font-bold text-right ${
                            userRole !== 'admin'
                              ? 'text-2xl lg:text-3xl'
                              : 'text-xl'
                          }`}
                        >
                          {section.title}
                        </h2>
                        <motion.div
                          className={`bg-black/30 rounded-xl backdrop-blur-sm ${
                            userRole !== 'admin' ? 'p-4' : 'p-3'
                          }`}
                          whileHover={{
                            rotate: 360,
                            scale: userRole !== 'admin' ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <div
                            className={
                              userRole !== 'admin' ? 'w-8 h-8' : 'w-6 h-6'
                            }
                          >
                            {section.icon}
                          </div>
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{
                          rotate: expandedSection === section.id ? -90 : 180,
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="p-2 rounded-lg hover:bg-black/30 transition-colors duration-300"
                      >
                        <ChevronRight
                          className={
                            userRole !== 'admin' ? 'w-8 h-8' : 'w-6 h-6'
                          }
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Sub-sections */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSection === section.id ? 'auto' : 0,
                      opacity: expandedSection === section.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      {section.subSections.map((subSection, subIndex) => (
                        <motion.div
                          key={subSection.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: expandedSection === section.id ? 1 : 0,
                            x: expandedSection === section.id ? 0 : 20,
                          }}
                          transition={{ duration: 0.3, delay: subIndex * 0.08 }}
                          whileHover={{ scale: 1.02, x: -4 }}
                        >
                          <Card className="bg-gray-800/60 hover:bg-gray-700/60 border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 cursor-pointer group/sub relative overflow-hidden">
                            {/* Hover effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-300"
                              initial={false}
                            />

                            <CardContent
                              className="p-4"
                              onClick={() =>
                                handleSubSectionClick(subSection.id)
                              }
                            >
                              <div className="flex items-center justify-between text-white relative z-10">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <CardTitle className="text-base font-medium group-hover/sub:text-blue-300 transition-colors duration-300 text-right">
                                    {subSection.name}
                                  </CardTitle>
                                  <motion.div
                                    className="p-2 bg-gradient-to-l from-purple-500/20 to-blue-500/20 rounded-lg group-hover/sub:from-purple-500/30 group-hover/sub:to-blue-500/30 transition-all duration-300"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <span className="text-gray-400 group-hover/sub:text-gray-200 transition-colors duration-300">
                                      {subSection.icon}
                                    </span>
                                  </motion.div>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-300 border-gray-500/50"
                                  >
                                    متاح
                                  </Badge>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover/sub:text-gray-200 transition-colors duration-300" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Worker Account Modal */}
      <WorkerAccount
        isOpen={isWorkerAccountOpen}
        onClose={() => setIsWorkerAccountOpen(false)}
      />

      {/* Republic Exhibition Accounts Modal */}
      <RepublicExhibitionAccounts
        isOpen={isRepublicExhibitionOpen}
        onClose={() => setIsRepublicExhibitionOpen(false)}
      />

      {/* Trade Accounts Modal */}
      <TradeAccounts
        isOpen={isTradeAccountsOpen}
        onClose={() => setIsTradeAccountsOpen(false)}
      />

      {/* Merchant Account Modal */}
      <MerchantAccount
        isOpen={isMerchantAccountOpen}
        onClose={() => setIsMerchantAccountOpen(false)}
      />

      {/* Merchant Garga Account Modal */}
      <MerchantGargaAccount
        isOpen={isMerchantGargaAccountOpen}
        onClose={() => setIsMerchantGargaAccountOpen(false)}
      />

      {/* Worker Garga Account Modal */}
      <WorkerGargaAccount
        isOpen={isWorkerGargaAccountOpen}
        onClose={() => setIsWorkerGargaAccountOpen(false)}
      />

      {/* Exhibition Sales Modal */}
      <ExhibitionSales
        isOpen={isExhibitionSalesOpen}
        onClose={() => setIsExhibitionSalesOpen(false)}
      />

      {/* Exhibition Garga Sales Modal */}
      <ExhibitionGargaSales
        isOpen={isExhibitionGargaSalesOpen}
        onClose={() => setIsExhibitionGargaSalesOpen(false)}
      />

      {/* Garga Mall Accounts Modal */}
      <GargaMallAccounts
        isOpen={isGargaMallAccountsOpen}
        onClose={() => setIsGargaMallAccountsOpen(false)}
      />

      {/* Center Delaa Hawanem Workers Modal */}
      <CenterDelaaHawanemWorkers
        isOpen={isCenterDelaaHawanemWorkersOpen}
        onClose={() => setIsCenterDelaaHawanemWorkersOpen(false)}
      />

      {/* Center Delaa Hawanem Merchants Modal */}
      <CenterDelaaHawanemMerchants
        isOpen={isCenterDelaaHawanemMerchantsOpen}
        onClose={() => setIsCenterDelaaHawanemMerchantsOpen(false)}
      />

      {/* Center Delaa Hawanem Center Modal */}
      <CenterDelaaHawanemCenter
        isOpen={isCenterDelaaHawanemCenterOpen}
        onClose={() => setIsCenterDelaaHawanemCenterOpen(false)}
      />

      {/* Center Delaa Hawanem Sales Modal */}
      <CenterDelaaHawanemSales
        isOpen={isCenterDelaaHawanemSalesOpen}
        onClose={() => setIsCenterDelaaHawanemSalesOpen(false)}
      />

      {/* Worker Center Seima Account Modal */}
      <WorkerCenterSeimaAccount
        isOpen={isWorkerCenterSeimaAccountOpen}
        onClose={() => setIsWorkerCenterSeimaAccountOpen(false)}
      />

      {/* Center Seima Merchant Account Modal */}
      <CenterSeimaMerchantAccount
        isOpen={isCenterSeimaMerchantAccountOpen}
        onClose={() => setIsCenterSeimaMerchantAccountOpen(false)}
      />

      {/* Center Seima Sales Modal */}
      <CenterSeimaSales
        isOpen={isCenterSeimaSalesOpen}
        onClose={() => setIsCenterSeimaSalesOpen(false)}
      />

      {/* Center Seima Accounts Modal */}
      <CenterSeimaAccounts
        isOpen={isCenterSeimaAccountsOpen}
        onClose={() => setIsCenterSeimaAccountsOpen(false)}
      />

      {/* Center Gaza Accounts Modal */}
      <CenterGazaAccounts
        isOpen={isCenterGazaAccountsOpen}
        onClose={() => setIsCenterGazaAccountsOpen(false)}
      />

      {/* Center Gaza Merchants Modal */}
      <CenterGazaMerchants
        isOpen={isCenterGazaMerchantsOpen}
        onClose={() => setIsCenterGazaMerchantsOpen(false)}
      />

      {/* Center Gaza Workers Modal */}
      <CenterGazaWorkers
        isOpen={isCenterGazaWorkersOpen}
        onClose={() => setIsCenterGazaWorkersOpen(false)}
      />

      {/* New Center Gaza Sales Modal */}
      <NewCenterGazaSales
        isOpen={isNewCenterGazaSalesOpen}
        onClose={() => setIsNewCenterGazaSalesOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
