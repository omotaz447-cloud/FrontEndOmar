import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  Plus,
  Calendar,
  User,
  DollarSign,
  Save,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WorkerAccountData {
  id?: string;
  name: string;
  day: string;
  date: string;
  withdrawal: string;
  role?: string;
}

interface WorkerAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkerAccount: React.FC<WorkerAccountProps> = ({ isOpen, onClose }) => {
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
    const isFactory = userRole?.match(/^factory[1-5]$/i);
    return isFactory;
  };

  const [formData, setFormData] = useState<WorkerAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [workers, setWorkers] = useState<WorkerAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete states
  const [editingWorker, setEditingWorker] = useState<WorkerAccountData | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<WorkerAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteWorker, setDeleteWorker] = useState<WorkerAccountData | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const days = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  // Fetch existing worker accounts
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/worker-account', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        // Token error already handled in getAuthHeaders
        return;
      }
      toast.error('فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen, fetchWorkers]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.day ||
      !formData.date ||
      !formData.withdrawal
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/worker-account', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          name: '',
          day: '',
          date: '',
          withdrawal: '',
        });
        setSelectedDate(undefined);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        // Token error already handled in getAuthHeaders
        return;
      }
      toast.error('فشل في إضافة السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(parseFloat(amount) || 0);
  };

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it's an ISO string, parse and format it
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if formatting fails
    }
  };

  // Handle edit worker
  const handleEditWorker = (worker: WorkerAccountData) => {
    setEditingWorker(worker);
    setEditFormData({
      name: worker.name,
      day: worker.day,
      date: worker.date,
      withdrawal: worker.withdrawal,
    });
    // Set the selected date for the calendar picker
    if (worker.date) {
      setEditSelectedDate(new Date(worker.date));
    }
    setEditDialogOpen(true);
  };

  // Handle update worker (PUT request)
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editFormData.name ||
      !editFormData.day ||
      !editFormData.date ||
      !editFormData.withdrawal
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!editingWorker?.name) {
      toast.error('خطأ في تحديد السجل للتحديث');
      return;
    }

    // Create object with only changed fields
    const updatedFields: Partial<WorkerAccountData> = {};
    if (editFormData.name !== editingWorker.name)
      updatedFields.name = editFormData.name;
    if (editFormData.day !== editingWorker.day)
      updatedFields.day = editFormData.day;
    if (editFormData.date !== editingWorker.date)
      updatedFields.date = editFormData.date;
    if (editFormData.withdrawal !== editingWorker.withdrawal)
      updatedFields.withdrawal = editFormData.withdrawal;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/worker-account/${encodeURIComponent(editingWorker.name)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedFields),
        },
      );
      console.log('Update response:', response);
      if (response.ok) {
        toast.success('تم تحديث السجل بنجاح');
        setEditFormData({
          name: '',
          day: '',
          date: '',
          withdrawal: '',
        });
        setEditSelectedDate(undefined);
        setEditingWorker(null);
        setEditDialogOpen(false);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحديث السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete worker
  const handleDeleteWorker = async () => {
    if (!deleteWorker?.name) {
      toast.error('خطأ في تحديد السجل للحذف');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/worker-account/${encodeURIComponent(deleteWorker.name)}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        setDeleteWorker(null);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في حذف السجل');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingWorker(null);
    setEditDialogOpen(false);
    setEditFormData({
      name: '',
      day: '',
      date: '',
      withdrawal: '',
    });
    setEditSelectedDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
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
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <User className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white text-right">
                حساب عمال البلينا
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-right">
                إدارة حسابات وانسحابات العمال
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
                  <Users className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {workers.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">الاجمالي</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 text-right">
                  {formatCurrency(
                    workers
                      .reduce(
                        (total, worker) =>
                          total + (parseFloat(worker.withdrawal) || 0),
                        0,
                      )
                      .toString(),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">السجلات الحديثة</span>
                  <TrendingUp className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 text-right">
                  {
                    workers.filter((w) => {
                      const today = new Date().toISOString().split('T')[0];
                      return w.date === today;
                    }).length
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6 bg-gray-700/50" />

          {/* Form Section */}
          <Card className="bg-gray-800/40 border-gray-700/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-right flex items-center justify-end">
                <span className="ml-2">إضافة سجل جديد</span>
                <Plus className="w-5 h-5 text-blue-400" />
              </CardTitle>
              <CardDescription className="text-gray-400 text-right">
                أدخل بيانات العامل والانسحاب
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
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Label
                    htmlFor="name"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <User className="w-4 h-4" />
                    <span>اسم العامل</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم العامل"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Day Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Label
                    htmlFor="day"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>اليوم</span>
                  </Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, day: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right">
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {days.map((day) => (
                        <SelectItem
                          key={day}
                          value={day}
                          className="text-white"
                        >
                          {day}
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
                              date: format(date, 'yyyy-MM-dd'),
                            });
                          }
                          setCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                        className="bg-gray-800 text-white border-gray-600"
                        classNames={{
                          months: 'text-white bg-gray-800',
                          month: 'text-white bg-gray-800',
                          caption:
                            'text-white bg-gray-800/80 rounded-t-lg pb-3',
                          caption_label: 'text-white font-semibold text-lg',
                          nav: 'text-white',
                          nav_button:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300 border border-gray-600/50 rounded-md transition-colors',
                          nav_button_previous:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300',
                          nav_button_next:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300',
                          table: 'text-white bg-gray-800',
                          head_row: 'text-white border-b border-gray-600/30',
                          head_cell: 'text-gray-300 font-medium pb-2',
                          row: 'text-white',
                          cell: 'text-white hover:bg-blue-600/10 rounded-md transition-colors',
                          day: 'text-white hover:bg-blue-600/20 hover:text-blue-200 focus:bg-blue-600 focus:text-white rounded-md transition-all duration-200',
                          day_selected:
                            'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-lg font-bold border-2 border-blue-400 !bg-blue-600',
                          day_today:
                            'text-blue-300 border border-blue-500/30 font-semibold',
                          day_outside: 'text-gray-500 hover:text-gray-400',
                          day_disabled:
                            'text-gray-600 opacity-50 cursor-not-allowed',
                          day_range_middle: 'bg-blue-500/30',
                          day_hidden: 'invisible',
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
                  transition={{ duration: 0.3, delay: 0.5 }}
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
                    value={formData.withdrawal}
                    onChange={handleInputChange}
                    placeholder="أدخل المبلغ"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  className="md:col-span-2 lg:col-span-4 flex justify-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
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

          {/* Table Section */}
          <Card className="bg-gray-800/40 border-gray-700/30">
            <CardHeader className="border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات العمال
                  </CardTitle>
                </div>
                <Button
                  onClick={fetchWorkers}
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
                جميع سجلات الانسحابات والحسابات
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اسم العامل
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اليوم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        مبلغ الانسحاب
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
                        <TableCell
                          colSpan={!isFactoryRole() ? 5 : 4}
                          className="text-center py-8"
                        >
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : workers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={!isFactoryRole() ? 5 : 4}
                          className="text-center py-8 text-gray-400"
                        >
                          لا توجد سجلات متاحة
                        </TableCell>
                      </TableRow>
                    ) : (
                      workers.map((worker, index) => (
                        <motion.tr
                          key={worker.id || index}
                          className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="text-gray-300 font-medium text-right">
                            {worker.name}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {worker.day}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(worker.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-emerald-400 font-semibold">
                              {formatCurrency(worker.withdrawal)}
                            </span>
                          </TableCell>
                          {!isFactoryRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center space-x-2 space-x-reverse justify-end">
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditWorker(worker)}
                                    className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteWorker(worker)}
                                    className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
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

      {/* Edit Worker Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => !open && handleCancelEdit()}
      >
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
          </div>

          {/* Header */}
          <DialogHeader className="relative z-10 p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4 space-x-reverse text-right">
              <motion.div
                className="p-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Edit className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  تحديث سجل العامل
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  تحديث بيانات العامل "{editingWorker?.name}"
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Edit Form Content */}
          <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <Card className="bg-gray-800/40 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">تحديث البيانات</span>
                  <Edit className="w-5 h-5 text-green-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  تعديل بيانات العامل والانسحاب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUpdateWorker}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Name Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="edit-name"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <User className="w-4 h-4" />
                      <span>اسم العامل</span>
                    </Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      placeholder="أدخل اسم العامل"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Day Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="edit-day"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>اليوم</span>
                    </Label>
                    <Select
                      value={editFormData.day}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, day: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {days.map((day) => (
                          <SelectItem
                            key={day}
                            value={day}
                            className="text-white"
                          >
                            {day}
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
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label
                      htmlFor="edit-date"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>التاريخ</span>
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
                              setEditFormData((prev) => ({
                                ...prev,
                                date: format(date, 'yyyy-MM-dd'),
                              }));
                            }
                            setEditCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          className="bg-gray-800 text-white border-gray-600"
                          classNames={{
                            months: 'text-white bg-gray-800',
                            month: 'text-white bg-gray-800',
                            caption:
                              'text-white bg-gray-800/80 rounded-t-lg pb-3',
                            caption_label: 'text-white font-semibold text-lg',
                            nav: 'text-white',
                            nav_button:
                              'text-white hover:bg-green-600/20 hover:text-green-300 border border-gray-600/50 rounded-md transition-colors',
                            nav_button_previous:
                              'text-white hover:bg-green-600/20 hover:text-green-300',
                            nav_button_next:
                              'text-white hover:bg-green-600/20 hover:text-green-300',
                            table: 'text-white bg-gray-800',
                            head_row: 'text-white border-b border-gray-600/30',
                            head_cell: 'text-gray-300 font-medium pb-2',
                            row: 'text-white',
                            cell: 'text-white hover:bg-green-600/10 rounded-md transition-colors',
                            day: 'text-white hover:bg-green-600/20 hover:text-green-200 focus:bg-green-600 focus:text-white rounded-md transition-all duration-200',
                            day_selected:
                              'bg-green-600 text-white hover:bg-green-700 hover:text-white shadow-lg font-bold border-2 border-green-400 !bg-green-600',
                            day_today:
                              'text-green-300 border border-green-500/30 font-semibold',
                            day_outside: 'text-gray-500 hover:text-gray-400',
                            day_disabled:
                              'text-gray-600 opacity-50 cursor-not-allowed',
                            day_range_middle: 'bg-green-500/30',
                            day_hidden: 'invisible',
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
                    transition={{ duration: 0.3, delay: 0.5 }}
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
                      value={editFormData.withdrawal}
                      onChange={handleEditInputChange}
                      placeholder="أدخل المبلغ"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    className="md:col-span-2 flex justify-end space-x-3 space-x-reverse"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 px-6 py-3 rounded-xl font-medium"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
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
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteWorker}
        onOpenChange={() => setDeleteWorker(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل العامل "{deleteWorker?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteWorker(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorker}
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

export default WorkerAccount;
