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
  Store,
  TrendingUp,
  FileText,
  Calculator,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BikeStorageAccountData {
  _id?: string;
  fixedBeforeInventory: number | string;
  fixedAfterInventory: number | string;
  cashAtHome: number | string;
  withdrawal: number | string;
  date: string;
  notes?: string;
  total?: number;
}

interface BikeStorageAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const BikeStorageAccount: React.FC<BikeStorageAccountProps> = ({
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

  const [formData, setFormData] = useState<BikeStorageAccountData>({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    date: '',
    notes: '',
  });
  const [accounts, setAccounts] = useState<BikeStorageAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Edit and Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<BikeStorageAccountData>({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    date: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);

  // Fetch existing bike storage accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/bike-storage-account',
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
        console.error('Failed to fetch accounts:', response.statusText);
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
    const numericValue = ['fixedBeforeInventory', 'fixedAfterInventory', 'cashAtHome', 'withdrawal'].includes(name)
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

    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/bike-storage-account',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            fixedBeforeInventory: formData.fixedBeforeInventory === '0' ? '0' : toNumber(formData.fixedBeforeInventory),
            fixedAfterInventory: formData.fixedAfterInventory === '0' ? '0' : toNumber(formData.fixedAfterInventory),
            cashAtHome: formData.cashAtHome === '0' ? '0' : toNumber(formData.cashAtHome),
            withdrawal: formData.withdrawal === '0' ? '0' : toNumber(formData.withdrawal),
            date: formData.date,
            notes: formData.notes,
          }),
        }
      );

      if (response.ok) {
        await response.json();
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          fixedBeforeInventory: '',
          fixedAfterInventory: '',
          cashAtHome: '',
          withdrawal: '',
          date: '',
          notes: '',
        });
        setSelectedDate(undefined);
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
      toast.error('فشل في إضافة السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete account function
  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/bike-storage-account/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        setDeleteConfirmId(null);
        fetchAccounts(); // Refresh the table
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

  // Start editing an account
  const startEdit = (account: BikeStorageAccountData) => {
    if (!account._id) return;
    
    setEditingId(account._id);
    setIsEditDialogOpen(true);
    setEditFormData({
      _id: account._id,
      fixedBeforeInventory: account.fixedBeforeInventory,
      fixedAfterInventory: account.fixedAfterInventory,
      cashAtHome: account.cashAtHome,
      withdrawal: account.withdrawal,
      date: account.date,
      notes: account.notes || '',
    });
    
    // Set the selected date for the calendar
    if (account.date) {
      try {
        const dateParts = account.date.split('/');
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          setEditSelectedDate(dateObject);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setIsEditDialogOpen(false);
    setEditFormData({
      fixedBeforeInventory: '',
      fixedAfterInventory: '',
      cashAtHome: '',
      withdrawal: '',
      date: '',
      notes: '',
    });
    setEditSelectedDate(undefined);
  };

  // Update account function
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;
    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/bike-storage-account/${editingId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            fixedBeforeInventory: editFormData.fixedBeforeInventory === '0' ? '0' : toNumber(editFormData.fixedBeforeInventory),
            fixedAfterInventory: editFormData.fixedAfterInventory === '0' ? '0' : toNumber(editFormData.fixedAfterInventory),
            cashAtHome: editFormData.cashAtHome === '0' ? '0' : toNumber(editFormData.cashAtHome),
            withdrawal: editFormData.withdrawal === '0' ? '0' : toNumber(editFormData.withdrawal),
            date: editFormData.date,
            notes: editFormData.notes,
          }),
        }
      );

      if (response.ok) {
        await response.json();
        toast.success('تم تحديث السجل بنجاح');
        cancelEdit();
        fetchAccounts(); // Refresh the table
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

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericValue = ['fixedBeforeInventory', 'fixedAfterInventory', 'cashAtHome', 'withdrawal'].includes(name)
      ? convertToNumber(value)
      : value;
    
    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  // Calculate total amount for edit form
  const calculateEditTotal = () => {
    return toNumber(editFormData.fixedBeforeInventory) + toNumber(editFormData.fixedAfterInventory) + toNumber(editFormData.cashAtHome) - toNumber(editFormData.withdrawal);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

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
    return toNumber(formData.fixedBeforeInventory) + toNumber(formData.fixedAfterInventory) + toNumber(formData.cashAtHome) - toNumber(formData.withdrawal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
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
                className="p-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Store className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  حسابات بايكه ومخازن البلينا
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  إدارة حسابات المعرض والمخازن
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي السجلات</span>
                  <FileText className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {accounts.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي النقدي</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 text-right">
                  {formatCurrency(
                    accounts.reduce((total, account) => total + toNumber(account.cashAtHome || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي السحوبات</span>
                  <TrendingUp className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 text-right">
                  {formatCurrency(
                    accounts.reduce((total, account) => total + toNumber(account.withdrawal || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">الإجمالي العام</span>
                  <Calculator className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 text-right">
                  {formatCurrency(
                    accounts.reduce((total, account) => total + (account.total || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6 bg-gray-700/50" />

          {/* Form Section */}
          {!isFactoryRole() && (
            <Card className="bg-gray-800/40 border-gray-700/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إضافة سجل جديد</span>
                  <Plus className="w-5 h-5 text-green-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  أدخل بيانات الحساب والمعاملات المالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Fixed Before Inventory Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label
                      htmlFor="fixedBeforeInventory"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>ثابت قبل الجرد</span>
                    </Label>
                    <Input
                      id="fixedBeforeInventory"
                      name="fixedBeforeInventory"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fixedBeforeInventory === '' ? '' : formData.fixedBeforeInventory}
                      onChange={handleInputChange}
                      placeholder="أدخل المبلغ الثابت قبل الجرد"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Fixed After Inventory Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="fixedAfterInventory"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>ثابت بعد الجرد</span>
                    </Label>
                    <Input
                      id="fixedAfterInventory"
                      name="fixedAfterInventory"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fixedAfterInventory === '' ? '' : formData.fixedAfterInventory}
                      onChange={handleInputChange}
                      placeholder="أدخل المبلغ الثابت بعد الجرد"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Cash at Home Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="cashAtHome"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>فلوس نقدي في البيت</span>
                    </Label>
                    <Input
                      id="cashAtHome"
                      name="cashAtHome"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cashAtHome === '' ? '' : formData.cashAtHome}
                      onChange={handleInputChange}
                      placeholder="أدخل المبلغ النقدي في البيت"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Withdrawal Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label
                      htmlFor="withdrawal"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
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
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Date Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
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
                    transition={{ duration: 0.3, delay: 0.6 }}
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
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right min-h-[80px]"
                      rows={3}
                    />
                  </motion.div>

                  {/* Total Display */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-green-300 font-semibold text-lg">الإجمالي المحسوب:</span>
                        <span className="text-green-400 font-bold text-xl">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-3 flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          حفظ السجل
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Table Section */}
          <Card className="bg-gray-800/40 border-gray-700/30">
            <CardHeader className="border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Store className="w-4 h-4 text-white" />
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
                جميع سجلات حسابات بايكه ومخازن البلينا
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ثابت قبل الجرد
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ثابت بعد الجرد
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        النقدي في البيت
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        السحب
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
                      {!isFactoryRole() && (
                        <TableHead className="text-gray-300 font-semibold text-right">
                          الإجراءات
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={!isFactoryRole() ? 8 : 7} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : accounts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={!isFactoryRole() ? 8 : 7}
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
                            {formatCurrency(toNumber(account.fixedBeforeInventory))}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatCurrency(toNumber(account.fixedAfterInventory))}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatCurrency(toNumber(account.cashAtHome))}
                          </TableCell>
                          <TableCell className="text-red-400 text-right">
                            {formatCurrency(toNumber(account.withdrawal))}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(account.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-400 font-semibold">
                              {formatCurrency(account.total || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-right max-w-xs truncate">
                            {account.notes || '-'}
                          </TableCell>
                          {!isFactoryRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                                <Button
                                  onClick={() => startEdit(account)}
                                  disabled={editingId === account._id}
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => setDeleteConfirmId(account._id!)}
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
                                >
                                  <Trash2 className="w-3 h-3" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
            {/* Header */}
            <DialogHeader className="relative z-10 p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse text-right">
                    <motion.div
                      className="p-3 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Edit className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-white text-right">
                        تعديل السجل
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 text-right">
                        قم بتعديل بيانات السجل المحدد
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
            </DialogHeader>

            {/* Content */}
            <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Fixed Before Inventory Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Label
                    htmlFor="edit-fixedBeforeInventory"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>ثابت قبل الجرد</span>
                  </Label>
                  <Input
                    id="edit-fixedBeforeInventory"
                    name="fixedBeforeInventory"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.fixedBeforeInventory === '' ? '' : editFormData.fixedBeforeInventory}
                    onChange={handleEditInputChange}
                    placeholder="أدخل المبلغ الثابت قبل الجرد"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Fixed After Inventory Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Label
                    htmlFor="edit-fixedAfterInventory"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>ثابت بعد الجرد</span>
                  </Label>
                  <Input
                    id="edit-fixedAfterInventory"
                    name="fixedAfterInventory"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.fixedAfterInventory === '' ? '' : editFormData.fixedAfterInventory}
                    onChange={handleEditInputChange}
                    placeholder="أدخل المبلغ الثابت بعد الجرد"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Cash at Home Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Label
                    htmlFor="edit-cashAtHome"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>فلوس نقدي في البيت</span>
                  </Label>
                  <Input
                    id="edit-cashAtHome"
                    name="cashAtHome"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.cashAtHome === '' ? '' : editFormData.cashAtHome}
                    onChange={handleEditInputChange}
                    placeholder="أدخل المبلغ النقدي في البيت"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Withdrawal Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Label
                    htmlFor="edit-withdrawal"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>سحب</span>
                  </Label>
                  <Input
                    id="edit-withdrawal"
                    name="withdrawal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.withdrawal === '' ? '' : editFormData.withdrawal}
                    onChange={handleEditInputChange}
                    placeholder="أدخل مبلغ السحب"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Date Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Label
                    htmlFor="edit-date"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>التاريخ</span>
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
                    <PopoverContent
                      className="w-auto p-0 bg-gray-800 border-gray-600"
                      align="start"
                    >
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
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Label
                    htmlFor="edit-notes"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <FileText className="w-4 h-4" />
                    <span>ملاحظات</span>
                  </Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={editFormData.notes}
                    onChange={handleEditInputChange}
                    placeholder="أدخل أي ملاحظات إضافية..."
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right min-h-[80px]"
                    rows={3}
                  />
                </motion.div>

                {/* Total Display */}
                <motion.div
                  className="space-y-2 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300 font-semibold text-lg">الإجمالي المحسوب:</span>
                      <span className="text-blue-400 font-bold text-xl">
                        {formatCurrency(calculateEditTotal())}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Submit and Cancel Buttons */}
                <motion.div
                  className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 space-x-reverse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="outline"
                    className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 px-6 py-3"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
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
                </motion.div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-right">
                تأكيد الحذف
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400 text-right">
                هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-start">
              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
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
      </DialogContent>
    </Dialog>
  );
};

export default BikeStorageAccount;
