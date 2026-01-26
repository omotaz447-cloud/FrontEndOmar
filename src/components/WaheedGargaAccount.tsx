import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Calendar } from '@/components/ui/calendar';
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
import { toast } from 'sonner';
import { CalendarIcon, User, DollarSign, TrendingUp, Gift, Edit, Trash2, RefreshCw, Save, TrendingDown, Wallet, PiggyBank, Activity, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { API_BASE_URL } from '@/utils/api';

interface WaheedGargaData {
  _id?: string;
  cash: number;
  blessing: number;
  withdrawal: number;
  date: string;
  notes?: string;
  total?: number;
}

interface WaheedGargaAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  cash: string;
  blessing: string;
  withdrawal: string;
  notes: string;
  date: Date | undefined;
}

const WaheedGargaAccount: React.FC<WaheedGargaAccountProps> = ({
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

  const [formData, setFormData] = useState<FormData>({
    cash: '',
    blessing: '',
    withdrawal: '',
    notes: '',
    date: undefined,
  });
  const [accounts, setAccounts] = useState<WaheedGargaData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WaheedGargaData | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<WaheedGargaData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<FormData>({
    cash: '',
    blessing: '',
    withdrawal: '',
    notes: '',
    date: undefined,
  });

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value) || 0;
    return num;
  };

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/waheed-garga-account`, {
        headers: getAuthHeaders(),
      });
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    const cash = parseFloat(formData.cash) || 0;
    const blessing = parseFloat(formData.blessing) || 0;
    const withdrawal = parseFloat(formData.withdrawal) || 0;
    return cash + blessing - withdrawal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cash || !formData.blessing || !formData.withdrawal || !formData.date) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/waheed-garga-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          'نقدي': convertToNumber(formData.cash),
          'ربنا كرم': convertToNumber(formData.blessing),
          'سحب': convertToNumber(formData.withdrawal),
          'ملاحظات': formData.notes,
          'التاريخ': formData.date?.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء الحساب بنجاح');
        setFormData({
          cash: '',
          blessing: '',
          withdrawal: '',
          notes: '',
          date: undefined,
        });
        fetchAccounts(); // Refresh the table
      } else {
        toast.error(result.message || 'حدث خطأ أثناء حفظ الحساب');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: WaheedGargaData) => {
    setEditingAccount(account);
    setEditFormData({
      cash: account.cash.toString(),
      blessing: account.blessing.toString(),
      withdrawal: account.withdrawal.toString(),
      notes: account.notes || '',
      date: new Date(account.date),
    });
    setEditDialogOpen(true);
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.cash || !editFormData.blessing || !editFormData.withdrawal || !editFormData.date) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/waheed-garga-account/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            'نقدي': convertToNumber(editFormData.cash),
            'ربنا كرم': convertToNumber(editFormData.blessing),
            'سحب': convertToNumber(editFormData.withdrawal),
            'ملاحظات': editFormData.notes,
            'التاريخ': editFormData.date?.toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('تم تحديث الحساب بنجاح');
        setEditDialogOpen(false);
        setEditingAccount(null);
        fetchAccounts();
      } else {
        toast.error(result.message || 'حدث خطأ أثناء تحديث الحساب');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء تحديث الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total for edit form
  const calculateEditTotal = () => {
    const cash = parseFloat(editFormData.cash) || 0;
    const blessing = parseFloat(editFormData.blessing) || 0;
    const withdrawal = parseFloat(editFormData.withdrawal) || 0;
    return cash + blessing - withdrawal;
  };

  const handleDelete = async () => {
    if (!deleteAccount?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/waheed-garga-account/${deleteAccount._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('تم حذف الحساب بنجاح');
        fetchAccounts(); // Refresh the table
        setDeleteAccount(null);
      } else {
        toast.error('فشل في حذف الحساب');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء حذف الحساب');
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics calculation functions
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
        const cash = account.cash || 0;
        const blessing = account.blessing || 0;
        const withdrawal = account.withdrawal || 0;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  const stats = calculateStatistics();
  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white text-center mb-4 w-full">
              <div className="flex items-center justify-center space-x-3 space-x-reverse">
                <User className="w-8 h-8 text-purple-400" />
                <span>حسابات وحيد سعيد</span>
              </div>
            </DialogTitle>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
                  <Gift className="w-8 h-8 text-pink-200" />
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
            <Card className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">إجمالي الرصيد</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats.totalBalance)}
                    </p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Average Balance */}
            <Card className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 border-indigo-500/50 shadow-lg hover:shadow-xl transition-all duration-300">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cash */}
              <div className="space-y-2">
                <Label htmlFor="cash" className="text-white font-medium">
                  نقدي
                </Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="cash"
                    name="cash"
                    type="number"
                    step="0.01"
                    value={formData.cash}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                    placeholder="أدخل المبلغ النقدي"
                    required
                  />
                </div>
              </div>

              {/* Blessing */}
              <div className="space-y-2">
                <Label htmlFor="blessing" className="text-white font-medium">
                  ربنا كرم
                </Label>
                <div className="relative">
                  <Gift className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="blessing"
                    name="blessing"
                    type="number"
                    step="0.01"
                    value={formData.blessing}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                    placeholder="أدخل مبلغ ربنا كرم"
                    required
                  />
                </div>
              </div>

              {/* Withdrawal */}
              <div className="space-y-2">
                <Label htmlFor="withdrawal" className="text-white font-medium">
                  سحب
                </Label>
                <div className="relative">
                  <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="withdrawal"
                    name="withdrawal"
                    type="number"
                    step="0.01"
                    value={formData.withdrawal}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                    placeholder="أدخل مبلغ السحب"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-white font-medium">التاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, 'PPP', { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, date }))
                      }
                      initialFocus
                      className="text-white bg-gray-800 [&_table]:text-white [&_th]:text-gray-300 [&_td]:text-white [&_button]:text-white [&_button:hover]:bg-gray-700 [&_button:hover]:text-white [&_.rdp-day_selected]:bg-purple-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-purple-700 [&_.rdp-day_today]:bg-gray-700 [&_.rdp-day_today]:text-white [&_.rdp-nav_button]:text-white [&_.rdp-nav_button:hover]:bg-gray-700 [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption]:text-white [&_.rdp-dropdown]:bg-gray-800 [&_.rdp-dropdown]:text-white [&_.rdp-dropdown]:border-gray-600"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Total Display */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white font-medium">الإجمالي</Label>
                <Card className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 border-purple-500">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {total.toLocaleString('ar-EG')} جنيه
                      </div>
                      <div className="text-sm text-purple-100 mt-1">
                        (نقدي + ربنا كرم - سحب)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white font-medium">
                ملاحظات
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 min-h-[100px]"
                placeholder="أدخل أي ملاحظات إضافية..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-900 text-white font-medium py-3 transition-all duration-300"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                  />
                ) : null}
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الحساب'}
              </Button>
              <Button
                type="button"
                onClick={fetchAccounts}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 transition-all duration-300"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>

          {/* Table Section */}
          <div className="mt-8">
            <Card className="bg-gray-800/60 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">السجلات المحفوظة</h3>
                  <span className="text-gray-400 text-sm">
                    إجمالي السجلات: {accounts.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                    <span className="text-white mr-3">جاري تحميل البيانات...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">لا توجد سجلات محفوظة</p>
                    <p className="text-gray-500 text-sm mt-2">قم بإضافة حساب جديد للبدء</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                          <TableHead className="text-gray-300 font-semibold text-right">
                            التاريخ
                          </TableHead>
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
                            الإجمالي
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold text-right">
                            ملاحظات
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold text-center">
                            الإجراءات
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account, index) => (
                          <TableRow
                            key={account._id || index}
                            className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          >
                            <TableCell className="text-gray-300 text-right">
                              {format(new Date(account.date), 'dd/MM/yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.cash.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.blessing.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.withdrawal.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-green-400 font-semibold text-right">
                              {(account.cash + account.blessing - account.withdrawal).toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right max-w-xs truncate">
                              {account.notes || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(account)}
                                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteAccount(account)}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300"
            >
              إغلاق
            </Button>
          </div>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccount} onOpenChange={(open) => !open && setDeleteAccount(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse">
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white ml-3"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </AlertDialogAction>
              <AlertDialogCancel 
                onClick={() => setDeleteAccount(null)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                إلغاء
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white text-right text-xl">
              تعديل حساب وحيد سعيد
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل البيانات المالية لتاريخ {editingAccount?.date ? format(new Date(editingAccount.date), 'dd/MM/yyyy', { locale: ar }) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash */}
                <div className="space-y-2">
                  <Label htmlFor="edit-cash" className="text-white font-medium">
                    نقدي
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-cash"
                      name="cash"
                      type="number"
                      step="0.01"
                      value={editFormData.cash}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                      placeholder="أدخل المبلغ النقدي"
                      required
                    />
                  </div>
                </div>

                {/* Blessing */}
                <div className="space-y-2">
                  <Label htmlFor="edit-blessing" className="text-white font-medium">
                    ربنا كرم
                  </Label>
                  <div className="relative">
                    <Gift className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-blessing"
                      name="blessing"
                      type="number"
                      step="0.01"
                      value={editFormData.blessing}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                      placeholder="أدخل مبلغ ربنا كرم"
                      required
                    />
                  </div>
                </div>

                {/* Withdrawal */}
                <div className="space-y-2">
                  <Label htmlFor="edit-withdrawal" className="text-white font-medium">
                    سحب
                  </Label>
                  <div className="relative">
                    <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-withdrawal"
                      name="withdrawal"
                      type="number"
                      step="0.01"
                      value={editFormData.withdrawal}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-purple-500"
                      placeholder="أدخل مبلغ السحب"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">التاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {editFormData.date ? (
                          format(editFormData.date, 'PPP', { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                      <Calendar
                        mode="single"
                        selected={editFormData.date}
                        onSelect={(date) =>
                          setEditFormData((prev) => ({ ...prev, date }))
                        }
                        initialFocus
                        className="text-white bg-gray-800 [&_table]:text-white [&_th]:text-gray-300 [&_td]:text-white [&_button]:text-white [&_button:hover]:bg-gray-700 [&_button:hover]:text-white [&_.rdp-day_selected]:bg-purple-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-purple-700 [&_.rdp-day_today]:bg-gray-700 [&_.rdp-day_today]:text-white [&_.rdp-nav_button]:text-white [&_.rdp-nav_button:hover]:bg-gray-700 [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption]:text-white [&_.rdp-dropdown]:bg-gray-800 [&_.rdp-dropdown]:text-white [&_.rdp-dropdown]:border-gray-600"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Total Display */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white font-medium">الإجمالي</Label>
                  <Card className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 border-purple-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {calculateEditTotal().toLocaleString('ar-EG')} جنيه
                        </div>
                        <div className="text-sm text-purple-100 mt-1">
                          (نقدي + ربنا كرم - سحب)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-white font-medium">
                  ملاحظات
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 min-h-[100px]"
                  placeholder="أدخل أي ملاحظات إضافية..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      تحديث الحساب
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default WaheedGargaAccount;



