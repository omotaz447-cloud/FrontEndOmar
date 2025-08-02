import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  Clock,
  Calculator,
  UserCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WorkerGargaAccountData {
  _id?: string;
  name: string;
  day: string;
  date: string;
  withdrawal: number;
}

interface WorkerGargaAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

// Arabic days mapping to English values
const daysOptions = [
  { label: 'السبت', value: 'Saturday' },
  { label: 'الأحد', value: 'Sunday' },
  { label: 'الاثنين', value: 'Monday' },
  { label: 'الثلاثاء', value: 'Tuesday' },
  { label: 'الأربعاء', value: 'Wednesday' },
  { label: 'الخميس', value: 'Thursday' },
  { label: 'الجمعة', value: 'Friday' },
];

const WorkerGargaAccount: React.FC<WorkerGargaAccountProps> = ({
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

  const [formData, setFormData] = useState<WorkerGargaAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: 0,
  });
  const [accounts, setAccounts] = useState<WorkerGargaAccountData[]>([]);
  const [editingAccount, setEditingAccount] =
    useState<WorkerGargaAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<WorkerGargaAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: 0,
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteAccountName, setDeleteAccountName] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/worker-garga-account',
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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = name === 'withdrawal'
      ? parseFloat(value) || 0
      : value;

    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleDayChange = (value: string) => {
    setFormData((prev) => ({ ...prev, day: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم العامل');
      return;
    }

    if (!formData.day) {
      toast.error('يرجى اختيار اليوم');
      return;
    }

    if (!formData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (formData.withdrawal <= 0) {
      toast.error('يرجى إدخال مبلغ السحب');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/worker-garga-account',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            الاسم: formData.name,
            اليوم: formData.day,
            التاريخ: formData.date,
            السحب: formData.withdrawal,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          name: '',
          day: '',
          date: '',
          withdrawal: 0,
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
  const handleEdit = (account: WorkerGargaAccountData) => {
    setEditingAccount(account);
    setEditFormData({
      name: account.name,
      day: account.day,
      date: account.date,
      withdrawal: account.withdrawal,
    });
    if (account.date) {
      setEditSelectedDate(new Date(account.date));
    }
    setEditDialogOpen(true);
  };

  // Handle delete account
  const handleDelete = (account: WorkerGargaAccountData) => {
    setDeleteAccountName(account.name);
  };

  // Handle actual delete after confirmation
  const handleDeleteAccount = async () => {
    if (!deleteAccountName) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/worker-garga-account/${encodeURIComponent(deleteAccountName)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        fetchAccounts();
        setDeleteAccountName(null);
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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = name === 'withdrawal'
      ? parseFloat(value) || 0
      : value;

    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  // Handle edit day change
  const handleEditDayChange = (value: string) => {
    setEditFormData((prev) => ({ ...prev, day: value }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      toast.error('يرجى إدخال اسم العامل');
      return;
    }

    if (!editFormData.day) {
      toast.error('يرجى اختيار اليوم');
      return;
    }

    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (editFormData.withdrawal <= 0) {
      toast.error('يرجى إدخال مبلغ السحب');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/worker-garga-account/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            الاسم: editFormData.name,
            اليوم: editFormData.day,
            التاريخ: editFormData.date,
            السحب: editFormData.withdrawal,
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

  // Get Arabic day name from English value
  const getArabicDay = (englishDay: string) => {
    const dayOption = daysOptions.find(day => day.value === englishDay);
    return dayOption ? dayOption.label : englishDay;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"
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
              className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white text-right">
                حسابات عمال جرجا معرض مول العرب
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-right">
                إدارة حسابات وسحوبات العمال
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي العمال</span>
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
                  <span className="ml-2">إجمالي السحوبات</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + (account.withdrawal || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">متوسط السحب</span>
                  <Calculator className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-400 text-right">
                  {formatCurrency(
                    accounts.length > 0
                      ? accounts.reduce(
                          (total, account) => total + (account.withdrawal || 0),
                          0,
                        ) / accounts.length
                      : 0,
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
                  <span className="ml-2">إضافة حساب عامل جديد</span>
                  <Plus className="w-5 h-5 text-emerald-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  أدخل بيانات العامل والسحب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                      placeholder="أدخل اسم العامل"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-emerald-500 focus:border-emerald-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Day Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="day"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Clock className="w-4 h-4" />
                      <span>اليوم</span>
                    </Label>
                    <Select value={formData.day} onValueChange={handleDayChange}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-emerald-500 focus:border-emerald-500 text-right">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-white">
                        {daysOptions.map((day) => (
                          <SelectItem
                            key={day.value}
                            value={day.value}
                            className="text-right hover:bg-gray-700 focus:bg-gray-700"
                          >
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Date Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
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
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center text-white",
                            caption_label: "text-sm font-medium text-white",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0",
                            day: "w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                            day_range_end: "day-range-end",
                            day_selected: "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white rounded-md",
                            day_today: "bg-gray-700 text-white rounded-md",
                            day_outside: "text-gray-600 opacity-50",
                            day_disabled: "text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent",
                            day_range_middle: "aria-selected:bg-emerald-500/30 aria-selected:text-white",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
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
                      <span>السحب</span>
                    </Label>
                    <Input
                      id="withdrawal"
                      name="withdrawal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.withdrawal}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ السحب"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-emerald-500 focus:border-emerald-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-4 flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
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
                    className="p-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات حسابات عمال جرجا
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
                جميع سجلات حسابات عمال جرجا معرض مول العرب
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
                        اليوم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        السحب
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
                          colSpan={isAdminRole() ? 5 : 4}
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
                          colSpan={isAdminRole() ? 5 : 4}
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
                          <TableCell className="text-blue-400 text-right">
                            {getArabicDay(account.day)}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(account.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-emerald-400 font-semibold">
                              {formatCurrency(account.withdrawal)}
                            </span>
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
        <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white text-right text-xl">
              تعديل حساب العامل
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل بيانات العامل "{editingAccount?.name}"
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
                  اسم العامل
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

              {/* Day Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-day" className="text-gray-300 text-right">
                  اليوم
                </Label>
                <Select value={editFormData.day} onValueChange={handleEditDayChange}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white text-right">
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {daysOptions.map((day) => (
                      <SelectItem
                        key={day.value}
                        value={day.value}
                        className="text-right hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-white",
                        caption_label: "text-sm font-medium text-white",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0",
                        day: "w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                        day_range_end: "day-range-end",
                        day_selected: "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white rounded-md",
                        day_today: "bg-gray-700 text-white rounded-md",
                        day_outside: "text-gray-600 opacity-50",
                        day_disabled: "text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent",
                        day_range_middle: "aria-selected:bg-emerald-500/30 aria-selected:text-white",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Withdrawal Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-withdrawal"
                  className="text-gray-300 text-right"
                >
                  السحب
                </Label>
                <Input
                  id="edit-withdrawal"
                  name="withdrawal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.withdrawal}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
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
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
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
        open={!!deleteAccountName}
        onOpenChange={() => setDeleteAccountName(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل العامل "{deleteAccountName}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteAccountName(null)}
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

export default WorkerGargaAccount;
