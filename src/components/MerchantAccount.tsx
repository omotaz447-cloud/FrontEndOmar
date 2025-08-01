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
  ShoppingCart,
  FileText,
  Calculator,
  Receipt,
  UserCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MerchantAccountData {
  _id?: string;
  name: string;
  invoice: number;
  payment: number;
  date: string;
  notes?: string;
  total?: number;
}

interface MerchantAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const MerchantAccount: React.FC<MerchantAccountProps> = ({
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

  const [formData, setFormData] = useState<MerchantAccountData>({
    name: '',
    invoice: 0,
    payment: 0,
    date: '',
    notes: '',
  });
  const [accounts, setAccounts] = useState<MerchantAccountData[]>([]);
  const [editingAccount, setEditingAccount] =
    useState<MerchantAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<MerchantAccountData>({
    name: '',
    invoice: 0,
    payment: 0,
    date: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] =
    useState<MerchantAccountData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://waheed-web.vercel.app/api/merchant-account',
        {
          headers: getAuthHeaders(),
        },
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = ['invoice', 'payment'].includes(name)
      ? parseFloat(value) || 0
      : value;

    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم التاجر');
      return;
    }

    if (!formData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://waheed-web.vercel.app/api/merchant-account',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: formData.name,
            invoice: formData.invoice,
            payment: formData.payment,
            notes: formData.notes,
            date: formData.date,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          name: '',
          invoice: 0,
          payment: 0,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  // Handle edit account
  const handleEdit = (account: MerchantAccountData) => {
    setEditingAccount(account);
    setEditFormData({
      name: account.name,
      invoice: account.invoice,
      payment: account.payment,
      date: account.date,
      notes: account.notes || '',
    });
    if (account.date) {
      setEditSelectedDate(new Date(account.date));
    }
    setEditDialogOpen(true);
  };

  // Handle delete account
  const handleDelete = (account: MerchantAccountData) => {
    setDeleteAccount(account);
  };

  // Handle actual delete after confirmation
  const handleDeleteAccount = async () => {
    if (!deleteAccount?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://waheed-web.vercel.app/api/merchant-account/${deleteAccount._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        fetchAccounts();
        setDeleteAccount(null);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في حذف السجل');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('فشل في حذف السجل');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = ['invoice', 'payment'].includes(name)
      ? parseFloat(value) || 0
      : value;

    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      toast.error('يرجى إدخال اسم التاجر');
      return;
    }

    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://waheed-web.vercel.app/api/merchant-account/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: editFormData.name,
            invoice: editFormData.invoice,
            payment: editFormData.payment,
            notes: editFormData.notes,
            date: editFormData.date,
          }),
        },
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

  // Calculate remaining amount for edit form
  const calculateEditRemaining = () => {
    return editFormData.invoice - editFormData.payment;
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

  // Calculate remaining amount (invoice - payment)
  const calculateRemaining = () => {
    return formData.invoice - formData.payment;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"
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
          <div className="flex items-center space-x-4 space-x-reverse text-right">
            <motion.div
              className="p-3 bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white text-right">
                حسابات تجار البلينا
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-right">
                إدارة حسابات التجار والفواتير
              </DialogDescription>
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
                  <span className="ml-2">إجمالي التجار</span>
                  <UserCircle className="w-5 h-5" />
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
                  <span className="ml-2">إجمالي الفواتير</span>
                  <Receipt className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + (account.invoice || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المدفوعات</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + (account.payment || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المتبقي</span>
                  <Calculator className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + (account.total || 0),
                      0,
                    ),
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
                  <span className="ml-2">إضافة حساب تاجر جديد</span>
                  <Plus className="w-5 h-5 text-teal-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  أدخل بيانات التاجر والفاتورة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Name Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label
                      htmlFor="name"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>الاسم</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم التاجر"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Invoice Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="invoice"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>فاتوره</span>
                    </Label>
                    <Input
                      id="invoice"
                      name="invoice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.invoice}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الفاتورة"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Payment Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="payment"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>دفعه</span>
                    </Label>
                    <Input
                      id="payment"
                      name="payment"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.payment}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الدفعة"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
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
                              {format(selectedDate, 'dd/MM/yyyy', {
                                locale: ar,
                              })}
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
                          className="bg-gray-800 text-white border-gray-600 rounded-md p-3"
                          classNames={{
                            months:
                              'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                            month: 'space-y-4',
                            caption:
                              'flex justify-center pt-1 relative items-center text-white',
                            caption_label: 'text-sm font-medium text-white',
                            nav: 'space-x-1 flex items-center',
                            nav_button:
                              'h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer',
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell:
                              'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: 'text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0',
                            day: 'w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                            day_range_end: 'day-range-end',
                            day_selected:
                              'bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white rounded-md',
                            day_today: 'bg-gray-700 text-white rounded-md',
                            day_outside: 'text-gray-600 opacity-50',
                            day_disabled:
                              'text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent',
                            day_range_middle:
                              'aria-selected:bg-teal-500/30 aria-selected:text-white',
                            day_hidden: 'invisible',
                          }}
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
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right min-h-[80px]"
                      rows={3}
                    />
                  </motion.div>

                  {/* Remaining Display */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-teal-300 font-semibold text-lg">
                          المبلغ المتبقي:
                        </span>
                        <span className="text-teal-400 font-bold text-xl">
                          {formatCurrency(calculateRemaining())}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-3 flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
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
                    className="p-2 bg-gradient-to-r from-teal-600 to-cyan-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات حسابات التجار
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
                جميع سجلات حسابات تجار البلينا
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الاسم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الفاتورة
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الدفعة
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الباقي
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
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
                        <TableCell
                          colSpan={isAdminRole() ? 7 : 6}
                          className="text-center py-8"
                        >
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
                          <TableCell className="text-gray-300 text-right font-medium">
                            {account.name}
                          </TableCell>
                          <TableCell className="text-green-400 text-right">
                            {formatCurrency(account.invoice)}
                          </TableCell>
                          <TableCell className="text-blue-400 text-right">
                            {formatCurrency(account.payment)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-teal-400 font-semibold">
                              {formatCurrency(account.total || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(account.date)}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right max-w-xs truncate">
                            {account.notes || '-'}
                          </TableCell>
                          {isAdminRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(account)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1"
                                  disabled={!account._id}
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
              تعديل حساب التاجر
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل بيانات التاجر "{editingAccount?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <form
              onSubmit={handleEditSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-300 text-right">
                  اسم التاجر
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Invoice Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-invoice"
                  className="text-gray-300 text-right"
                >
                  الفاتورة
                </Label>
                <Input
                  id="edit-invoice"
                  name="invoice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.invoice}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Payment Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-payment"
                  className="text-gray-300 text-right"
                >
                  الدفعة
                </Label>
                <Input
                  id="edit-payment"
                  name="payment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.payment}
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
                <Popover
                  open={editCalendarOpen}
                  onOpenChange={setEditCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 text-right rtl"
                    >
                      {editSelectedDate ? (
                        <span className="text-white">
                          {format(editSelectedDate, 'dd/MM/yyyy', {
                            locale: ar,
                          })}
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
                      className="bg-gray-800 text-white border-gray-600 rounded-md p-3"
                      classNames={{
                        months:
                          'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                        month: 'space-y-4',
                        caption:
                          'flex justify-center pt-1 relative items-center text-white',
                        caption_label: 'text-sm font-medium text-white',
                        nav: 'space-x-1 flex items-center',
                        nav_button:
                          'h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell:
                          'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0',
                        day: 'w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                        day_range_end: 'day-range-end',
                        day_selected:
                          'bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white rounded-md',
                        day_today: 'bg-gray-700 text-white rounded-md',
                        day_outside: 'text-gray-600 opacity-50',
                        day_disabled:
                          'text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent',
                        day_range_middle:
                          'aria-selected:bg-teal-500/30 aria-selected:text-white',
                        day_hidden: 'invisible',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes Field */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="edit-notes"
                  className="text-gray-300 text-right"
                >
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

              {/* Remaining Display */}
              <div className="md:col-span-2">
                <div className="p-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-300 font-semibold text-lg">
                      المبلغ المتبقي:
                    </span>
                    <span className="text-teal-400 font-bold text-xl">
                      {formatCurrency(calculateEditRemaining())}
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
                  className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white"
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
        onOpenChange={() => setDeleteAccount(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل التاجر "{deleteAccount?.name}"؟
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

export default MerchantAccount;
