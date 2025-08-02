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
import { CalendarIcon, Package, Calculator, DollarSign, TrendingUp, Edit, Trash2, RefreshCw, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface GargaStorageData {
  _id?: string;
  fixedBeforeInventory: number;
  fixedAfterInventory: number;
  cashAtHome: number;
  withdrawal: number;
  date: string;
  notes?: string;
  total?: number;
}

interface GargaStorageAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fixedBeforeInventory: string;
  fixedAfterInventory: string;
  cashAtHome: string;
  withdrawal: string;
  notes: string;
  date: Date | undefined;
}

const GargaStorageAccount: React.FC<GargaStorageAccountProps> = ({
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
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    notes: '',
    date: undefined,
  });
  const [accounts, setAccounts] = useState<GargaStorageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GargaStorageData | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<GargaStorageData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<FormData>({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    notes: '',
    date: undefined,
  });

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/garga-storage', {
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
    const fixedAfter = parseFloat(formData.fixedAfterInventory) || 0;
    const cash = parseFloat(formData.cashAtHome) || 0;
    const withdrawal = parseFloat(formData.withdrawal) || 0;
    return fixedAfter + cash - withdrawal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fixedBeforeInventory || !formData.fixedAfterInventory || 
        !formData.cashAtHome || !formData.withdrawal || !formData.date) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/garga-storage', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          'ثابت قبل الجرد': parseFloat(formData.fixedBeforeInventory),
          'ثابت بعد الجرد': parseFloat(formData.fixedAfterInventory),
          'فلوس نقدي في البيت': parseFloat(formData.cashAtHome),
          'سحب': parseFloat(formData.withdrawal),
          'التاريخ': formData.date?.toISOString(),
          'Notes': formData.notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء الحساب بنجاح');
        setFormData({
          fixedBeforeInventory: '',
          fixedAfterInventory: '',
          cashAtHome: '',
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

  const handleEdit = (account: GargaStorageData) => {
    setEditingAccount(account);
    setEditFormData({
      fixedBeforeInventory: account.fixedBeforeInventory.toString(),
      fixedAfterInventory: account.fixedAfterInventory.toString(),
      cashAtHome: account.cashAtHome.toString(),
      withdrawal: account.withdrawal.toString(),
      notes: account.notes || '',
      date: new Date(account.date),
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteAccount?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/garga-storage/${deleteAccount._id}`,
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

    if (!editFormData.fixedBeforeInventory || !editFormData.fixedAfterInventory || 
        !editFormData.cashAtHome || !editFormData.withdrawal || !editFormData.date) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/garga-storage/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            'ثابت قبل الجرد': parseFloat(editFormData.fixedBeforeInventory),
            'ثابت بعد الجرد': parseFloat(editFormData.fixedAfterInventory),
            'فلوس نقدي في البيت': parseFloat(editFormData.cashAtHome),
            'سحب': parseFloat(editFormData.withdrawal),
            'التاريخ': editFormData.date?.toISOString(),
            'Notes': editFormData.notes,
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
    const fixedAfter = parseFloat(editFormData.fixedAfterInventory) || 0;
    const cash = parseFloat(editFormData.cashAtHome) || 0;
    const withdrawal = parseFloat(editFormData.withdrawal) || 0;
    return fixedAfter + cash - withdrawal;
  };

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center mb-4">
            <div className="flex items-center justify-center space-x-3 space-x-reverse">
              <Package className="w-8 h-8 text-blue-400" />
              <span>حسابات بايكه ومخازن جرجا</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Fixed Before Inventory */}
              <div className="space-y-2">
                <Label htmlFor="fixedBeforeInventory" className="text-white font-medium">
                  ثابت قبل الجرد
                </Label>
                <div className="relative">
                  <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="fixedBeforeInventory"
                    name="fixedBeforeInventory"
                    type="number"
                    step="0.01"
                    value={formData.fixedBeforeInventory}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                    placeholder="أدخل المبلغ الثابت قبل الجرد"
                    required
                  />
                </div>
              </div>

              {/* Fixed After Inventory */}
              <div className="space-y-2">
                <Label htmlFor="fixedAfterInventory" className="text-white font-medium">
                  ثابت بعد الجرد
                </Label>
                <div className="relative">
                  <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="fixedAfterInventory"
                    name="fixedAfterInventory"
                    type="number"
                    step="0.01"
                    value={formData.fixedAfterInventory}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                    placeholder="أدخل المبلغ الثابت بعد الجرد"
                    required
                  />
                </div>
              </div>

              {/* Cash at Home */}
              <div className="space-y-2">
                <Label htmlFor="cashAtHome" className="text-white font-medium">
                  فلوس نقدي في البيت
                </Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="cashAtHome"
                    name="cashAtHome"
                    type="number"
                    step="0.01"
                    value={formData.cashAtHome}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                    placeholder="أدخل النقدي في البيت"
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
                    className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
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
                      className="text-white [&_button]:text-white [&_button:hover]:bg-gray-700 [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_today]:bg-gray-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Total Display */}
              <div className="space-y-2">
                <Label className="text-white font-medium">الإجمالي</Label>
                <Card className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 border-green-500">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {total.toLocaleString('ar-EG')} جنيه
                      </div>
                      <div className="text-sm text-green-100 mt-1">
                        (ثابت بعد الجرد + نقدي في البيت - سحب)
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
                className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 min-h-[100px]"
                placeholder="أدخل أي ملاحظات إضافية..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white font-medium py-3 transition-all duration-300"
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
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                    <span className="text-white mr-3">جاري تحميل البيانات...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
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
                            ثابت قبل الجرد
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold text-right">
                            ثابت بعد الجرد
                          </TableHead>
                          <TableHead className="text-gray-300 font-semibold text-right">
                            نقدي في البيت
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
                              {account.fixedBeforeInventory.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.fixedAfterInventory.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.cashAtHome.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {account.withdrawal.toLocaleString('ar-EG')} جنيه
                            </TableCell>
                            <TableCell className="text-green-400 font-semibold text-right">
                              {((account.fixedAfterInventory + account.cashAtHome) - account.withdrawal).toLocaleString('ar-EG')} جنيه
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
        <AlertDialog open={!!deleteAccount} onOpenChange={() => setDeleteAccount(null)}>
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
              تعديل حساب بايكه ومخازن جرجا
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل البيانات المالية لتاريخ {editingAccount?.date ? format(new Date(editingAccount.date), 'dd/MM/yyyy', { locale: ar }) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 sm:p-6">
            <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Fixed Before Inventory */}
                <div className="space-y-2">
                  <Label htmlFor="edit-fixedBeforeInventory" className="text-white font-medium">
                    ثابت قبل الجرد
                  </Label>
                  <div className="relative">
                    <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-fixedBeforeInventory"
                      name="fixedBeforeInventory"
                      type="number"
                      step="0.01"
                      value={editFormData.fixedBeforeInventory}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                      placeholder="أدخل المبلغ الثابت قبل الجرد"
                      required
                    />
                  </div>
                </div>

                {/* Fixed After Inventory */}
                <div className="space-y-2">
                  <Label htmlFor="edit-fixedAfterInventory" className="text-white font-medium">
                    ثابت بعد الجرد
                  </Label>
                  <div className="relative">
                    <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-fixedAfterInventory"
                      name="fixedAfterInventory"
                      type="number"
                      step="0.01"
                      value={editFormData.fixedAfterInventory}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                      placeholder="أدخل المبلغ الثابت بعد الجرد"
                      required
                    />
                  </div>
                </div>

                {/* Cash at Home */}
                <div className="space-y-2">
                  <Label htmlFor="edit-cashAtHome" className="text-white font-medium">
                    فلوس نقدي في البيت
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="edit-cashAtHome"
                      name="cashAtHome"
                      type="number"
                      step="0.01"
                      value={editFormData.cashAtHome}
                      onChange={handleEditInputChange}
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
                      placeholder="أدخل النقدي في البيت"
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
                      className="bg-gray-800 border-gray-600 text-white pr-12 focus:border-blue-500"
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
                        className="text-white [&_button]:text-white [&_button:hover]:bg-gray-700 [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_today]:bg-gray-700"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Total Display */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">الإجمالي</Label>
                  <Card className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 border-green-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {calculateEditTotal().toLocaleString('ar-EG')} جنيه
                        </div>
                        <div className="text-sm text-green-100 mt-1">
                          (ثابت بعد الجرد + نقدي في البيت - سحب)
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
                  className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 min-h-[100px]"
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
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
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

export default GargaStorageAccount;
