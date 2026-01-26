import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Building2,
  Calendar,
  Users,
  Wallet,
  DollarSign,
  Bike,
  BarChart3,
  TrendingDown,
  PiggyBank,
  FileText,
  Crown,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterGazaAccountsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountData {
  _id: string;
  fixedBeforeInventory?: number;
  fixedAfterInventory?: number;
  cashAtHome?: number;
  withdrawal?: number;
  insurance?: number;
  cash?: number;
  blessing?: number;
  withdrawalFromBike?: number;
  inventoryDate?: string;
  date?: string;
  notes?: string;
  total?: number;
  createdAt?: string;
}

interface FormData {
  fixedBeforeInventory: string;
  fixedAfterInventory: string;
  cashAtHome: string;
  withdrawal: string;
  insurance: string;
  notes: string;
  total: number;
}

const CenterGazaAccounts: React.FC<CenterGazaAccountsProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);

  const sections = [
    {
      id: 'center-gaza',
      title: 'حسابات سنتر غزة',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700',
      component: CenterGazaAccountSection,
      endpoint: '/api/center-gaza-account',
    },
    {
      id: 'mahmoud',
      title: 'حسابات محمود موهوب سنتر غزة',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-600 to-green-700',
      component: MahmoudCenterGazaSection,
      endpoint: '/api/mahmoud-center-gaza-account',
    },
    {
      id: 'waheed',
      title: 'حسابات وحيد سعيد سنتر غزة',
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-purple-600 to-purple-700',
      component: WaheedCenterGazaSection,
      endpoint: '/api/waheed-center-gaza-account',
    },
    {
      id: 'basem',
      title: 'حسابات باسم سعيد عند وحيد سنتر غزة',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-orange-600 to-orange-700',
      component: BasemWaheedCenterGazaSection,
      endpoint: '/api/basem-waheed-center-gaza-account',
    },
    {
      id: 'mina',
      title: 'حسابات مينا ناصر عند وحيد سنتر غزة',
      icon: <Users className="w-6 h-6" />,
      color: 'from-pink-600 to-pink-700',
      component: MinaWaheedCenterGazaSection,
      endpoint: '/api/mina-waheed-center-gaza-account',
    },
    {
      id: 'bike-storage',
      title: 'حسابات بايكة ومخزن سنتر غزة',
      icon: <Bike className="w-6 h-6" />,
      color: 'from-teal-600 to-teal-700',
      component: BikeStorageCenterGazaSection,
      endpoint: '/api/bike-storage-center-gaza-account',
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setShowSectionDialog(true);
  };

  const resetDialog = () => {
    setSelectedSection(null);
    setShowSectionDialog(false);
  };

  const selectedSectionData = sections.find(section => section.id === selectedSection);

  return (
    <>
      {/* Main sections dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
          <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              سنتر غزة
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-lg">
              اختر القسم المراد إدارته من الأقسام المتاحة
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
              {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleSectionClick(section.id)}
              >
                <div className={`bg-gradient-to-r ${section.color} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {section.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        إدارة وتتبع العمليات المالية
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>      {/* Individual section dialog */}
      {selectedSectionData && (
        <selectedSectionData.component
          isOpen={showSectionDialog}
          onClose={resetDialog}
          endpoint={selectedSectionData.endpoint}
          title={selectedSectionData.title}
        />
      )}
    </>
  );
};

// Generic component for handling different account types
interface SectionComponentProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  title: string;
}

// Center Gaza Account Section
const CenterGazaAccountSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    insurance: '',
    notes: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: FormData) => {
    const fixedAfter = convertToNumber(data.fixedAfterInventory);
    const cash = convertToNumber(data.cashAtHome);
    const withdrawal = convertToNumber(data.withdrawal);
    const insurance = convertToNumber(data.insurance);
    
    return Number(fixedAfter) + Number(cash) - Number(withdrawal) - Number(insurance);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['fixedBeforeInventory', 'fixedAfterInventory', 'cashAtHome', 'withdrawal', 'insurance'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        ...formData,
        date: format(date, 'yyyy-MM-dd'),
        fixedBeforeInventory: convertToNumber(formData.fixedBeforeInventory),
        fixedAfterInventory: convertToNumber(formData.fixedAfterInventory),
        cashAtHome: convertToNumber(formData.cashAtHome),
        withdrawal: convertToNumber(formData.withdrawal),
        insurance: convertToNumber(formData.insurance),
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fixedBeforeInventory: '',
      fixedAfterInventory: '',
      cashAtHome: '',
      withdrawal: '',
      insurance: '',
      notes: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalFixedAfterInventory: accounts.reduce((sum, acc) => sum + (acc.fixedAfterInventory || 0), 0),
      totalCashAtHome: accounts.reduce((sum, acc) => sum + (acc.cashAtHome || 0), 0),
      totalWithdrawals: accounts.reduce((sum, acc) => sum + (acc.withdrawal || 0), 0),
      totalInsurance: accounts.reduce((sum, acc) => sum + (acc.insurance || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">ثابت بعد الجرد</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalFixedAfterInventory)}</p>
                  </div>
                  <div className="p-3 bg-green-500/30 rounded-full">
                    <BarChart3 className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">نقدي في البيت</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCashAtHome)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/30 rounded-full">
                    <PiggyBank className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">إجمالي التأمين</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalInsurance)}</p>
                  </div>
                  <div className="p-3 bg-orange-500/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">ثابت قبل الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">ثابت بعد الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">نقدي في البيت</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">تأمين</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.fixedBeforeInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.fixedAfterInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.cashAtHome?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.insurance?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{account.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                fixedBeforeInventory: account.fixedBeforeInventory?.toString() || '',
                                fixedAfterInventory: account.fixedAfterInventory?.toString() || '',
                                cashAtHome: account.cashAtHome?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                insurance: account.insurance?.toString() || '',
                                notes: account.notes || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت قبل الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedBeforeInventory}
                    onChange={(e) => handleInputChange('fixedBeforeInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت بعد الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedAfterInventory}
                    onChange={(e) => handleInputChange('fixedAfterInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي في البيت</Label>
                  <Input
                    type="number"
                    value={formData.cashAtHome}
                    onChange={(e) => handleInputChange('cashAtHome', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">تأمين</Label>
                <Input
                  type="number"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">التاريخ</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date ? format(date, 'yyyy/MM/dd', { locale: ar }) : 'اختر التاريخ'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الملاحظات (اختياري)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

// Similar components for other sections...
const MahmoudCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cash: '',
    blessing: '',
    withdrawal: '',
    insurance: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: typeof formData) => {
    const cash = convertToNumber(data.cash);
    const blessing = convertToNumber(data.blessing);
    const withdrawal = convertToNumber(data.withdrawal);
    const insurance = convertToNumber(data.insurance);
    
    return Number(cash) + Number(blessing) - Number(withdrawal) - Number(insurance);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['cash', 'blessing', 'withdrawal', 'insurance'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        cash: convertToNumber(formData.cash),
        blessing: convertToNumber(formData.blessing),
        withdrawal: convertToNumber(formData.withdrawal),
        insurance: convertToNumber(formData.insurance),
        date: format(date, 'yyyy-MM-dd'),
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cash: '',
      blessing: '',
      withdrawal: '',
      insurance: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalCash: accounts.reduce((sum, acc) => sum + (acc.cash || 0), 0),
      totalBlessing: accounts.reduce((sum, acc) => sum + (acc.blessing || 0), 0),
      totalWithdrawals: accounts.reduce((sum, acc) => sum + (acc.withdrawal || 0), 0),
      totalInsurance: accounts.reduce((sum, acc) => sum + (acc.insurance || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-green-500 to-green-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-green-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">إجمالي النقدي</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCash)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">ربنا كرم</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalBlessing)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/30 rounded-full">
                    <PiggyBank className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">إجمالي التأمين</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalInsurance)}</p>
                  </div>
                  <div className="p-3 bg-orange-500/30 rounded-full">
                    <BarChart3 className="w-6 h-6 text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">نقدي</TableHead>
                  <TableHead className="text-gray-300 text-right">ربنا كرم</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">تأمين</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.cash?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-400">{account.blessing?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.insurance?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                cash: account.cash?.toString() || '',
                                blessing: account.blessing?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                insurance: account.insurance?.toString() || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي</Label>
                  <Input
                    type="number"
                    value={formData.cash}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">ربنا كرم</Label>
                  <Input
                    type="number"
                    value={formData.blessing}
                    onChange={(e) => handleInputChange('blessing', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">تأمين</Label>
                  <Input
                    type="number"
                    value={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">التاريخ</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date ? format(date, 'yyyy/MM/dd', { locale: ar }) : 'اختر التاريخ'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

const WaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cash: '',
    blessing: '',
    withdrawal: '',
    insurance: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: typeof formData) => {
    const cash = convertToNumber(data.cash);
    const blessing = convertToNumber(data.blessing);
    const withdrawal = convertToNumber(data.withdrawal);
    const insurance = convertToNumber(data.insurance);
    
    return Number(cash) + Number(blessing) - Number(withdrawal) - Number(insurance);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['cash', 'blessing', 'withdrawal', 'insurance'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        cash: convertToNumber(formData.cash),
        blessing: convertToNumber(formData.blessing),
        withdrawal: convertToNumber(formData.withdrawal),
        insurance: convertToNumber(formData.insurance),
        date: format(date, 'yyyy-MM-dd'),
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cash: '',
      blessing: '',
      withdrawal: '',
      insurance: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalCash: accounts.reduce((sum, acc) => sum + (acc.cash || 0), 0),
      totalBlessing: accounts.reduce((sum, acc) => sum + (acc.blessing || 0), 0),
      totalWithdrawals: accounts.reduce((sum, acc) => sum + (acc.withdrawal || 0), 0),
      totalInsurance: accounts.reduce((sum, acc) => sum + (acc.insurance || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-purple-500 to-purple-600 rounded-lg shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-purple-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">إجمالي النقدي</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCash)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">ربنا كرم</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalBlessing)}</p>
                  </div>
                  <div className="p-3 bg-green-500/30 rounded-full">
                    <PiggyBank className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">إجمالي التأمين</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalInsurance)}</p>
                  </div>
                  <div className="p-3 bg-orange-500/30 rounded-full">
                    <BarChart3 className="w-6 h-6 text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">نقدي</TableHead>
                  <TableHead className="text-gray-300 text-right">ربنا كرم</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">تأمين</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.cash?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-400">{account.blessing?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.insurance?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{account.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                cash: account.cash?.toString() || '',
                                blessing: account.blessing?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                insurance: account.insurance?.toString() || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي</Label>
                  <Input
                    type="number"
                    value={formData.cash}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">ربنا كرم</Label>
                  <Input
                    type="number"
                    value={formData.blessing}
                    onChange={(e) => handleInputChange('blessing', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">تأمين</Label>
                  <Input
                    type="number"
                    value={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">التاريخ</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date ? format(date, 'yyyy/MM/dd', { locale: ar }) : 'اختر التاريخ'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BasemWaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cash: '',
    withdrawal: '',
    notes: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: typeof formData) => {
    const cash = convertToNumber(data.cash);
    const withdrawal = convertToNumber(data.withdrawal);
    
    return Number(cash) - Number(withdrawal);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['cash', 'withdrawal'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        cash: convertToNumber(formData.cash),
        withdrawal: convertToNumber(formData.withdrawal),
        date: format(date, 'yyyy-MM-dd'),
        notes: formData.notes,
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cash: '',
      withdrawal: '',
      notes: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalCash: accounts.reduce((sum, acc) => sum + (acc.cash || 0), 0),
      totalWithdrawals: accounts.reduce((sum, acc) => sum + (acc.withdrawal || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-orange-500 to-orange-600 rounded-lg shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-orange-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">إجمالي النقدي</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCash)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">نقدي</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.cash?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{account.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                cash: account.cash?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                notes: account.notes || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي</Label>
                  <Input
                    type="number"
                    value={formData.cash}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">التاريخ</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date ? format(date, 'yyyy/MM/dd', { locale: ar }) : 'اختر التاريخ'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الملاحظات (اختياري)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

const MinaWaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cash: '',
    withdrawal: '',
    notes: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: typeof formData) => {
    const cash = convertToNumber(data.cash);
    const withdrawal = convertToNumber(data.withdrawal);
    
    return Number(cash) - Number(withdrawal);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['cash', 'withdrawal'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        cash: convertToNumber(formData.cash),
        withdrawal: convertToNumber(formData.withdrawal),
        date: format(date, 'yyyy-MM-dd'),
        notes: formData.notes,
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cash: '',
      withdrawal: '',
      notes: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalCash: accounts.reduce((sum, acc) => sum + (acc.cash || 0), 0),
      totalWithdrawals: accounts.reduce((sum, acc) => sum + (acc.withdrawal || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-pink-500 to-pink-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/30 border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-pink-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-pink-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">إجمالي النقدي</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCash)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">نقدي</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.cash?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{account.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                cash: account.cash?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                notes: account.notes || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي</Label>
                  <Input
                    type="number"
                    value={formData.cash}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">التاريخ</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date ? format(date, 'yyyy/MM/dd', { locale: ar }) : 'اختر التاريخ'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الملاحظات (اختياري)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

const BikeStorageCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    withdrawalFromBike: '',
    cashAtHome: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [inventoryDate, setInventoryDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return num;
  };

  const calculateTotal = (data: typeof formData) => {
    const fixedBefore = convertToNumber(data.fixedBeforeInventory);
    const fixedAfter = convertToNumber(data.fixedAfterInventory);
    const withdrawalFromBike = convertToNumber(data.withdrawalFromBike);
    const cashAtHome = convertToNumber(data.cashAtHome);
    
    return Number(fixedBefore) + Number(fixedAfter) + Number(cashAtHome) - Number(withdrawalFromBike);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryDate) {
      toast.error('يرجى اختيار تاريخ الجرد');
      return;
    }

    const requiredFields = ['fixedBeforeInventory', 'fixedAfterInventory', 'withdrawalFromBike', 'cashAtHome'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        fixedBeforeInventory: convertToNumber(formData.fixedBeforeInventory),
        fixedAfterInventory: convertToNumber(formData.fixedAfterInventory),
        withdrawalFromBike: convertToNumber(formData.withdrawalFromBike),
        cashAtHome: convertToNumber(formData.cashAtHome),
        inventoryDate: format(inventoryDate, 'yyyy-MM-dd'),
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `${API_BASE_URL}${endpoint}/${editingAccount._id}`
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fixedBeforeInventory: '',
      fixedAfterInventory: '',
      withdrawalFromBike: '',
      cashAtHome: '',
      total: 0,
    });
    setInventoryDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Statistics calculations
  const calculateStatistics = () => {
    return {
      totalAccounts: accounts.length,
      totalFixedBeforeInventory: accounts.reduce((sum, acc) => sum + (acc.fixedBeforeInventory || 0), 0),
      totalFixedAfterInventory: accounts.reduce((sum, acc) => sum + (acc.fixedAfterInventory || 0), 0),
      totalCashAtHome: accounts.reduce((sum, acc) => sum + (acc.cashAtHome || 0), 0),
      totalWithdrawalFromBike: accounts.reduce((sum, acc) => sum + (acc.withdrawalFromBike || 0), 0),
      netTotal: accounts.reduce((sum, acc) => sum + (acc.total || 0), 0),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = calculateStatistics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-teal-500 to-teal-600 rounded-lg shadow-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-teal-500/20 to-teal-600/30 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-300 text-sm font-medium">إجمالي الحسابات</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                  </div>
                  <div className="p-3 bg-teal-500/30 rounded-full">
                    <FileText className="w-6 h-6 text-teal-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">ثابت قبل الجرد</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalFixedBeforeInventory)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-full">
                    <BarChart3 className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">ثابت بعد الجرد</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalFixedAfterInventory)}</p>
                  </div>
                  <div className="p-3 bg-green-500/30 rounded-full">
                    <BarChart3 className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">نقدي في البيت</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalCashAtHome)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/30 rounded-full">
                    <PiggyBank className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">سحب من البايكة</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.totalWithdrawalFromBike)}</p>
                  </div>
                  <div className="p-3 bg-red-500/30 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className={`${stats.netTotal >= 0 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/50 hover:shadow-red-500/25'
            } hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'} text-sm font-medium`}>
                      صافي الإجمالي
                    </p>
                    <p className={`text-xl font-bold ${stats.netTotal >= 0 ? 'text-emerald-100' : 'text-red-100'}`}>
                      {formatCurrency(stats.netTotal)}
                    </p>
                  </div>
                  <div className={`p-3 ${stats.netTotal >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} rounded-full`}>
                    <Crown className={`w-6 h-6 ${stats.netTotal >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">ثابت قبل الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">ثابت بعد الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب من البايكة</TableHead>
                  <TableHead className="text-gray-300 text-right">نقدي في البيت</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">تاريخ الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.fixedBeforeInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.fixedAfterInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawalFromBike?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.cashAtHome?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.inventoryDate && format(new Date(account.inventoryDate), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                fixedBeforeInventory: account.fixedBeforeInventory?.toString() || '',
                                fixedAfterInventory: account.fixedAfterInventory?.toString() || '',
                                withdrawalFromBike: account.withdrawalFromBike?.toString() || '',
                                cashAtHome: account.cashAtHome?.toString() || '',
                                total: account.total || 0,
                              });
                              setInventoryDate(account.inventoryDate ? new Date(account.inventoryDate) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Bike className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت قبل الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedBeforeInventory}
                    onChange={(e) => handleInputChange('fixedBeforeInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت بعد الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedAfterInventory}
                    onChange={(e) => handleInputChange('fixedAfterInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب من البايكة</Label>
                  <Input
                    type="number"
                    value={formData.withdrawalFromBike}
                    onChange={(e) => handleInputChange('withdrawalFromBike', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي في البيت</Label>
                  <Input
                    type="number"
                    value={formData.cashAtHome}
                    onChange={(e) => handleInputChange('cashAtHome', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">تاريخ الجرد</Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {inventoryDate ? format(inventoryDate, 'yyyy/MM/dd', { locale: ar }) : 'اختر تاريخ الجرد'}
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <CalendarComponent
                      mode="single"
                      selected={inventoryDate}
                      onSelect={(selectedDate) => {
                        setInventoryDate(selectedDate);
                        setIsDateOpen(false);
                      }}
                      locale={ar}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`${API_BASE_URL}${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default CenterGazaAccounts;
