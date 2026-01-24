import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Calendar,
  DollarSign,
  Save,
  RefreshCw,
  User,
  TrendingUp,
  FileText,
  Heart,
  Edit,
  Trash2,
  TrendingDown,
  Wallet,
  PiggyBank,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MahmoudGargaAccountData {
  _id?: string;
  cash: number | string;
  blessing: number | string;
  withdrawal: number | string;
  date: string;
  notes?: string;
  total?: number;
}

interface MahmoudGargaAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const MahmoudGargaAccount: React.FC<MahmoudGargaAccountProps> = ({
  isOpen,
  onClose,
}) => {
  // Helper function to create authenticated headers
  const getAuthHeaders = () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      toast.error('الجلسة منتهية الصلاحية - يرجى تسجيل الدخول مرة أخرى');
      throw new Error('No access token found');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Check if current user role is factory1-5
  const isFactoryRole = () => {
    const userRole = Cookies.get('userRole');
    return userRole?.match(/^factory[1-5]$/i);
  };

  // Check if current user role is admin
  const isAdminRole = () => {
    const userRole = Cookies.get('userRole');
    return userRole === 'admin';
  };

  const [formData, setFormData] = useState<MahmoudGargaAccountData>({
    cash: '',
    blessing: '',
    withdrawal: '',
    date: '',
    notes: '',
  });
  const [accounts, setAccounts] = useState<MahmoudGargaAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MahmoudGargaAccountData | null>(null);

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<MahmoudGargaAccountData>({
    cash: '',
    blessing: '',
    withdrawal: '',
    date: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<MahmoudGargaAccountData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/mahmoud-garga-account',
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAccounts(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    if (value === '' || value === undefined || value === null) {
      return '';
    }
    const num = parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  // Helper function to convert string|number to number for calculations
  const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (value === '0') return 0;
    if (value === '' || value === undefined || value === null) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericValue = ['cash', 'blessing', 'withdrawal'].includes(name)
      ? convertToNumber(value)
      : value;
    
    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    // Calculate remaining (total)
    const remaining = toNumber(formData.cash) + toNumber(formData.blessing) - toNumber(formData.withdrawal);

    setIsSubmitting(true);
    try {
      const url = editingAccount 
        ? `https://backend-omar-puce.vercel.app/api/mahmoud-garga-account/${editingAccount._id}`
        : 'https://backend-omar-puce.vercel.app/api/mahmoud-garga-account';
      
      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cash: formData.cash === '0' ? '0' : toNumber(formData.cash),
          blessing: formData.blessing === '0' ? '0' : toNumber(formData.blessing),
          withdrawal: formData.withdrawal === '0' ? '0' : toNumber(formData.withdrawal),
          remaining: remaining,
          notes: formData.notes,
          date: formData.date,
        }),
      });

      if (response.ok) {
        await response.json();
        toast.success(editingAccount ? 'تم تحديث السجل بنجاح' : 'تم إضافة السجل بنجاح');
        setFormData({
          cash: '',
          blessing: '',
          withdrawal: '',
          date: '',
          notes: '',
        });
        setSelectedDate(undefined);
        setEditingAccount(null);
        fetchAccounts(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error(editingAccount ? 'فشل في تحديث السجل' : 'فشل في إضافة السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: MahmoudGargaAccountData) => {
    setEditingAccount(account);
    setEditFormData({
      cash: account.cash,
      blessing: account.blessing,
      withdrawal: account.withdrawal,
      date: account.date,
      notes: account.notes || '',
    });
    // Parse the date string and set the selected date
    if (account.date) {
      try {
        const date = new Date(account.date);
        setEditSelectedDate(date);
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    setEditDialogOpen(true);
  };

  const handleDelete = (account: MahmoudGargaAccountData) => {
    setDeleteAccount(account);
  };

  // Handle actual delete after confirmation
  const handleDeleteAccount = async () => {
    if (!deleteAccount?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/mahmoud-garga-account/${deleteAccount._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        fetchAccounts(); // Refresh the table
        setDeleteAccount(null);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في حذف السجل');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setFormData({
      cash: '',
      blessing: '',
      withdrawal: '',
      date: '',
      notes: '',
    });
    setSelectedDate(undefined);
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericValue = ['cash', 'blessing', 'withdrawal'].includes(name)
      ? convertToNumber(value)
      : value;
    
    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/mahmoud-garga-account/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            cash: editFormData.cash === '0' ? '0' : toNumber(editFormData.cash),
            blessing: editFormData.blessing === '0' ? '0' : toNumber(editFormData.blessing),
            withdrawal: editFormData.withdrawal === '0' ? '0' : toNumber(editFormData.withdrawal),
            notes: editFormData.notes,
            date: editFormData.date,
          }),
        }
      );

      if (response.ok) {
        await response.json();
        toast.success('تم تحديث السجل بنجاح');
        setEditDialogOpen(false);
        setEditingAccount(null);
        fetchAccounts();
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحديث السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total for edit form
  const calculateEditTotal = () => {
    return toNumber(editFormData.cash) + toNumber(editFormData.blessing) - toNumber(editFormData.withdrawal);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  // Enhanced statistics calculation functions
  const calculateStatistics = () => {
    if (accounts.length === 0) {
      return {
        totalAccounts: 0,
        totalCash: 0,
        totalBlessing: 0,
        totalWithdrawals: 0,
        totalBalance: 0,
        averageBalance: 0,
      };
    }

    const stats = accounts.reduce(
      (acc, account) => {
        const cash = toNumber(account.cash || 0);
        const blessing = toNumber(account.blessing || 0);
        const withdrawal = toNumber(account.withdrawal || 0);
        const balance = cash + blessing - withdrawal;
        
        return {
          totalCash: acc.totalCash + cash,
          totalBlessing: acc.totalBlessing + blessing,
          totalWithdrawals: acc.totalWithdrawals + withdrawal,
          totalBalance: acc.totalBalance + balance,
        };
      },
      {
        totalCash: 0,
        totalBlessing: 0,
        totalWithdrawals: 0,
        totalBalance: 0,
      }
    );

    return {
      totalAccounts: accounts.length,
      ...stats,
      averageBalance: stats.totalBalance / accounts.length,
    };
  };

  const stats = calculateStatistics();

  // Format date from ISO string to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return toNumber(formData.cash) + toNumber(formData.blessing) - toNumber(formData.withdrawal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"
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
        </div>

        {/* Header */}
        <DialogHeader className="relative z-10 p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse text-right">
              <motion.div
                className="p-3 bg-gradient-to-r from-orange-600 to-amber-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  حسابات محمود موهوب جرجا
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  إدارة حسابات محمود موهوب في موقع جرجا
                </DialogDescription>
              </div>
            </div>
            <div className="ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
              >
                رجوع
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {/* Total Accounts */}
            <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">إجمالي السجلات</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalAccounts}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Cash */}
            <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 border-emerald-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-emerald-100 text-sm font-medium">إجمالي النقدي</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.totalCash)}
                    </p>
                  </div>
                  <Wallet className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Blessing */}
            <Card className="bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 border-pink-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-pink-100 text-sm font-medium">إجمالي ربنا كرم</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.totalBlessing)}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-pink-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Withdrawals */}
            <Card className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-red-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-red-100 text-sm font-medium">إجمالي السحوبات</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.totalWithdrawals)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Balance */}
            <Card className="bg-gradient-to-br from-orange-600 via-orange-700 to-amber-800 border-orange-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-orange-100 text-sm font-medium">إجمالي الرصيد</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.totalBalance)}
                    </p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            {/* Average Balance */}
            <Card className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border-indigo-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-indigo-100 text-sm font-medium">متوسط الرصيد</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.averageBalance)}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6 bg-gray-700/50" />

          {/* Form Section */}
          {!isFactoryRole() && (
            <Card className="bg-gray-800/40 border-orange-500/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">{editingAccount ? 'تعديل السجل' : 'إضافة سجل جديد'}</span>
                  <Plus className="w-5 h-5 text-orange-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  {editingAccount ? 'تعديل بيانات حساب محمود موهوب جرجا' : 'أدخل بيانات حساب محمود موهوب جرجا'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Cash Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label
                      htmlFor="cash"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>نقدي</span>
                    </Label>
                    <Input
                      id="cash"
                      name="cash"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cash === '' ? '' : formData.cash}
                      onChange={handleInputChange}
                      placeholder="أدخل المبلغ النقدي"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-orange-500 focus:border-orange-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Blessing Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="blessing"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Heart className="w-4 h-4" />
                      <span>ربنا كرم</span>
                    </Label>
                    <Input
                      id="blessing"
                      name="blessing"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.blessing === '' ? '' : formData.blessing}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ ربنا كرم"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-orange-500 focus:border-orange-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Withdrawal Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="withdrawal"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>سحب</span>
                    </Label>
                    <Input
                      id="withdrawal"
                      name="withdrawal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.withdrawal === '' ? '' : formData.withdrawal}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ السحب"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-orange-500 focus:border-orange-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Date Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label
                      htmlFor="date"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>التاريخ</span>
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 text-right rtl"
                        >
                          {selectedDate ? (
                            <span className="text-white">
                              {format(selectedDate, 'dd/MM/yyyy', { locale: ar })}
                            </span>
                          ) : (
                            <span className="text-gray-400">اختر التاريخ</span>
                          )}
                          <Calendar className="mr-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-gray-800 border-gray-600"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setFormData({
                                ...formData,
                                date: format(date, 'dd/MM/yyyy'),
                              });
                            }
                            setCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          className="bg-gray-800 text-white border-gray-600"
                        />
                      </PopoverContent>
                    </Popover>
                  </motion.div>

                  {/* Notes Field */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label
                      htmlFor="notes"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <FileText className="w-4 h-4" />
                      <span>ملاحظات</span>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أدخل أي ملاحظات إضافية..."
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-orange-500 focus:border-orange-500 text-right min-h-[80px]"
                      rows={3}
                    />
                  </motion.div>

                  {/* Total Display */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-300 font-semibold text-lg">الإجمالي المحسوب:</span>
                        <span className="text-orange-400 font-bold text-xl">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 space-x-reverse"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    {editingAccount && (
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 px-8 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        إلغاء
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          {editingAccount ? 'جاري التحديث...' : 'جاري الحفظ...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          {editingAccount ? 'تحديث السجل' : 'حفظ السجل'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Table Section */}
          <Card className="bg-gray-800/40 border-orange-500/20">
            <CardHeader className="border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-orange-600 to-amber-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات الحسابات
                  </CardTitle>
                </div>
                <Button
                  onClick={fetchAccounts}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <CardDescription className="text-gray-400 text-right">
                جميع سجلات حسابات محمود موهوب جرجا
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        نقدي
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ربنا كرم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        سحب
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الإجمالي
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ملاحظات
                      </TableHead>
                      {isAdminRole() && (
                        <TableHead className="text-gray-300 font-semibold text-right">
                          الإجراءات
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={isAdminRole() ? 7 : 6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : accounts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={isAdminRole() ? 7 : 6}
                          className="text-center py-8 text-gray-400"
                        >
                          لا توجد سجلات متاحة
                        </TableCell>
                      </TableRow>
                    ) : (
                      accounts.map((account, index) => (
                        <motion.tr
                          key={account._id || index}
                          className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="text-gray-300 text-right">
                            {formatCurrency(toNumber(account.cash))}
                          </TableCell>
                          <TableCell className="text-pink-400 text-right">
                            {formatCurrency(toNumber(account.blessing))}
                          </TableCell>
                          <TableCell className="text-red-400 text-right">
                            {formatCurrency(toNumber(account.withdrawal))}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(account.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-orange-400 font-semibold">
                              {formatCurrency(account.total || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-right max-w-xs truncate">
                            {account.notes || '-'}
                          </TableCell>
                          {isAdminRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                                <Button
                                  onClick={() => handleEdit(account)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400 transition-all duration-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(account)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400 transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white text-right text-xl">
              تعديل سجل محمود موهوب جرجا
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل البيانات المالية لتاريخ {editingAccount?.date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-cash" className="text-gray-300 text-right">
                  نقدي
                </Label>
                <Input
                  id="edit-cash"
                  name="cash"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.cash === '' ? '' : editFormData.cash}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Blessing Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-blessing" className="text-gray-300 text-right">
                  ربنا كرم
                </Label>
                <Input
                  id="edit-blessing"
                  name="blessing"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.blessing === '' ? '' : editFormData.blessing}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Withdrawal Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-withdrawal" className="text-gray-300 text-right">
                  سحب
                </Label>
                <Input
                  id="edit-withdrawal"
                  name="withdrawal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.withdrawal === '' ? '' : editFormData.withdrawal}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Date Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-gray-300 text-right">
                  التاريخ
                </Label>
                <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 text-right rtl"
                    >
                      {editSelectedDate ? (
                        <span className="text-white">
                          {format(editSelectedDate, 'dd/MM/yyyy', { locale: ar })}
                        </span>
                      ) : (
                        <span className="text-gray-400">اختر التاريخ</span>
                      )}
                      <Calendar className="mr-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editSelectedDate}
                      onSelect={(date) => {
                        setEditSelectedDate(date);
                        if (date) {
                          setEditFormData({
                            ...editFormData,
                            date: format(date, 'dd/MM/yyyy'),
                          });
                        }
                        setEditCalendarOpen(false);
                      }}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      className="bg-gray-800 text-white border-gray-600"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes Field */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-notes" className="text-gray-300 text-right">
                  ملاحظات
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Total Display */}
              <div className="md:col-span-2">
                <div className="p-4 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-300 font-semibold text-lg">الإجمالي:</span>
                    <span className="text-orange-400 font-bold text-xl">
                      {formatCurrency(calculateEditTotal())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      تحديث السجل
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAccount}
        onOpenChange={(open) => !open && setDeleteAccount(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل محمود موهوب جرجا لتاريخ "{deleteAccount?.date}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteAccount(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default MahmoudGargaAccount;
