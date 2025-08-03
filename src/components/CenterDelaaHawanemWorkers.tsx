import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRolePermissions } from '@/utils/roleUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  X,
  Building2,
  Calendar
} from 'lucide-react';
import Cookies from 'js-cookie';

interface WorkerRecord {
  _id?: string;
  id?: string;
  name: string;
  day: string;
  date: string;
  withdrawal: number | string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CenterDelaaHawanemWorkers: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<WorkerRecord>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Edit/Delete states
  const [editingWorker, setEditingWorker] = useState<WorkerRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<WorkerRecord>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteWorker, setDeleteWorker] = useState<WorkerRecord | null>(null);

  // Helper function to create authenticated headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = Cookies.get('accessToken');
    if (!token) {
      toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      window.location.href = '/';
      throw new Error('No token available');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const daysOfWeek = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  // Fetch workers data
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch('https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker', {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل بيانات العمال');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      if (error instanceof Error && error.message === 'No token available') {
        return; // Don't show error toast, already handled by getAuthHeaders
      }
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen, fetchWorkers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.day || !formData.date || formData.withdrawal === '') {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingWorker 
        ? `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${editingWorker._id}`
        : 'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker';
      
      const method = editingWorker ? 'PUT' : 'POST';
      const headers = getAuthHeaders();
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingWorker ? 'تم تحديث البيانات بنجاح' : 'تم إضافة العامل بنجاح');
        await fetchWorkers();
        resetForm();
      } else {
        toast.error('فشل في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error('حدث خطأ في حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (worker: WorkerRecord) => {
    setEditingWorker(worker);
    setEditFormData({ ...worker });
    setEditDialogOpen(true);
    // Set the selected date for the calendar picker
    if (worker.date) {
      setEditSelectedDate(new Date(worker.date));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker || !editingWorker.name) return;

    try {
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${encodeURIComponent(editingWorker.name)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        toast.success('تم تحديث البيانات بنجاح');
        setEditDialogOpen(false);
        setEditingWorker(null);
        setEditSelectedDate(undefined);
        fetchWorkers();
      } else {
        toast.error('فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handleDelete = async () => {
    if (!deleteWorker?.name) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${encodeURIComponent(deleteWorker.name)}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast.success('تم حذف العامل بنجاح');
        await fetchWorkers();
        setDeleteWorker(null);
      } else {
        toast.error('فشل في حذف العامل');
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('حدث خطأ في حذف العامل');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      day: '',
      date: '',
      withdrawal: '',
    });
    setEditingWorker(null);
    setSelectedDate(undefined);
    setEditSelectedDate(undefined);
  };

  const handleInputChange = (field: keyof WorkerRecord, value: string | number) => {
    if (editDialogOpen) {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Role-based access control
  const permissions = getRolePermissions('حسابات عمال سنتر دلع الهوانم');
  
  // Check if user can access this component


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="w-[98vw] max-w-[98vw] sm:w-[95vw] h-[95vh] max-h-[95vh] backdrop-blur-xl bg-gray-900/60 border border-gray-700/30 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Enhanced decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-gray-800/20 rounded-3xl" />
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-fuchsia-500/10 to-pink-500/10 rounded-full blur-3xl"
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

          {/* Header */}
          <motion.div
            className="bg-gradient-to-r from-pink-600 via-rose-700 to-fuchsia-800 rounded-t-3xl shadow-lg relative overflow-hidden p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
            
            <div className="flex items-center justify-between text-white relative z-10">
              <div className="flex items-center space-x-4 space-x-reverse">
                <h2 className="text-2xl font-bold">حسابات عمال سنتر دلع الهوانم</h2>
                <motion.div
                  className="bg-black/30 rounded-xl backdrop-blur-sm p-3"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Building2 className="w-6 h-6" />
                </motion.div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-black/30 rounded-xl p-2 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-pink-100 text-sm mt-2 relative z-10">إدارة حسابات العمال وسحوباتهم</p>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-h-0 flex flex-col p-6 relative z-10">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 min-h-0 flex flex-col">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-white font-medium text-xs">
                        اسم العامل
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 h-8 text-xs backdrop-blur-sm"
                        placeholder="أدخل اسم العامل"
                        required
                      />
                    </div>

                    {/* Day */}
                    <div className="space-y-1">
                      <Label htmlFor="day" className="text-white font-medium text-xs">
                        اليوم
                      </Label>
                      <Select 
                        value={formData.day} 
                        onValueChange={(value) => handleInputChange('day', value)}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white h-8 text-xs backdrop-blur-sm">
                          <SelectValue placeholder="اختر اليوم" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-gray-700 backdrop-blur-xl">
                          {daysOfWeek.map((day) => (
                            <SelectItem 
                              key={day} 
                              value={day}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-1">
                      <Label htmlFor="date" className="text-white font-medium text-xs">
                        التاريخ
                      </Label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 text-right h-8 text-xs"
                          >
                            {selectedDate ? (
                              <span className="text-white">
                                {format(selectedDate, 'dd/MM/yyyy', { locale: ar })}
                              </span>
                            ) : (
                              <span className="text-gray-400">اختر التاريخ</span>
                            )}
                            <Calendar className="mr-1 h-3 w-3" />
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
                                handleInputChange('date', format(date, 'yyyy-MM-dd'));
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
                              caption: 'text-white bg-gray-800/80 rounded-t-lg pb-3',
                              caption_label: 'text-white font-semibold text-sm',
                              nav: 'text-white',
                              nav_button: 'text-white hover:bg-pink-600/20 hover:text-pink-300 border border-gray-600/50 rounded-md transition-colors',
                              nav_button_previous: 'text-white hover:bg-pink-600/20 hover:text-pink-300',
                              nav_button_next: 'text-white hover:bg-pink-600/20 hover:text-pink-300',
                              table: 'text-white bg-gray-800',
                              head_row: 'text-white border-b border-gray-600/30',
                              head_cell: 'text-gray-300 font-medium pb-1 text-xs',
                              row: 'text-white',
                              cell: 'text-white hover:bg-pink-600/10 rounded-md transition-colors',
                              day: 'text-white hover:bg-pink-600/20 hover:text-pink-200 focus:bg-pink-600 focus:text-white rounded-md transition-all duration-200 text-xs h-7 w-7',
                              day_selected: 'bg-pink-600 text-white hover:bg-pink-700 hover:text-white shadow-lg font-bold border-2 border-pink-400 !bg-pink-600',
                              day_today: 'text-pink-300 border border-pink-500/30 font-semibold',
                              day_outside: 'text-gray-500 hover:text-gray-400',
                              day_disabled: 'text-gray-600 opacity-50 cursor-not-allowed',
                              day_range_middle: 'bg-pink-500/30',
                              day_hidden: 'invisible',
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Withdrawal */}
                    <div className="space-y-1">
                      <Label htmlFor="withdrawal" className="text-white font-medium text-xs">
                        السحبة (جنيه)
                      </Label>
                      <Input
                        id="withdrawal"
                        type="number"
                        value={formData.withdrawal}
                        onChange={(e) => handleInputChange('withdrawal', convertToNumber(e.target.value))}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 h-8 text-xs backdrop-blur-sm"
                        placeholder="أدخل المبلغ"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    {editingWorker && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white text-xs px-3 py-1 h-7 backdrop-blur-sm"
                      >
                        إلغاء
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-l from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-xs px-3 py-1 h-7"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3 h-3 animate-spin ml-1" />
                      ) : (
                        <Plus className="w-3 h-3 ml-1" />
                      )}
                      {editingWorker ? 'تحديث' : 'إضافة'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Table Section */}
              <div className="mt-2">
                <Card className="bg-gray-800/40 border-gray-700/30 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                      <h3 className="text-sm font-bold text-white">سجلات العمال</h3>
                      <span className="text-gray-400 text-xs">
                        إجمالي السجلات: {workers.length}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full"
                        />
                        <span className="text-white mr-3 text-sm">جاري تحميل البيانات...</span>
                      </div>
                    ) : workers.length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-base">لا توجد سجلات عمال</p>
                        <p className="text-gray-500 text-xs mt-2">قم بإضافة عمال جدد للبدء</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="w-full">
                          <div className="rounded-lg border border-gray-700/30 backdrop-blur-sm">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">اسم العامل</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">اليوم</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">التاريخ</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">السحبة</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-center text-xs px-1 py-1 whitespace-nowrap">الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {workers.map((worker, index) => (
                                  <TableRow key={worker._id || index} className="border-gray-700/30 hover:bg-gray-800/30">
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{worker.name}</TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{worker.day}</TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">
                                      {format(new Date(worker.date), 'dd/MM/yyyy', { locale: ar })}
                                    </TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{worker.withdrawal} جنيه</TableCell>
                                    <TableCell className="text-center px-1 py-1 whitespace-nowrap">
                                      <div className="flex justify-center space-x-1 space-x-reverse">
                                        {permissions.canEdit && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(worker)}
                                            className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 p-1 h-6 w-6 backdrop-blur-sm"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                        )}
                                        {permissions.canDelete && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeleteWorker(worker)}
                                            className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 p-1 h-6 w-6 backdrop-blur-sm"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 text-sm px-6 py-2 h-10 backdrop-blur-sm shadow-lg"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-gray-900/95 border-gray-700 w-[90vw] max-w-2xl backdrop-blur-xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">تعديل بيانات العامل</DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                تعديل معلومات العامل: {editingWorker?.name}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white font-medium">
                    اسم العامل
                  </Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm"
                    placeholder="أدخل اسم العامل"
                    required
                  />
                </div>

                {/* Day */}
                <div className="space-y-2">
                  <Label htmlFor="edit-day" className="text-white font-medium">
                    اليوم
                  </Label>
                  <Select 
                    value={editFormData.day} 
                    onValueChange={(value) => handleInputChange('day', value)}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white backdrop-blur-sm">
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800/95 border-gray-700 backdrop-blur-xl">
                      {daysOfWeek.map((day) => (
                        <SelectItem 
                          key={day} 
                          value={day}
                          className="text-white hover:bg-gray-700 focus:bg-gray-700"
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="text-white font-medium">
                    التاريخ
                  </Label>
                  <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 text-right"
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
                            handleInputChange('date', format(date, 'yyyy-MM-dd'));
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
                          caption: 'text-white bg-gray-800/80 rounded-t-lg pb-3',
                          caption_label: 'text-white font-semibold text-lg',
                          nav: 'text-white',
                          nav_button: 'text-white hover:bg-pink-600/20 hover:text-pink-300 border border-gray-600/50 rounded-md transition-colors',
                          nav_button_previous: 'text-white hover:bg-pink-600/20 hover:text-pink-300',
                          nav_button_next: 'text-white hover:bg-pink-600/20 hover:text-pink-300',
                          table: 'text-white bg-gray-800',
                          head_row: 'text-white border-b border-gray-600/30',
                          head_cell: 'text-gray-300 font-medium pb-2',
                          row: 'text-white',
                          cell: 'text-white hover:bg-pink-600/10 rounded-md transition-colors',
                          day: 'text-white hover:bg-pink-600/20 hover:text-pink-200 focus:bg-pink-600 focus:text-white rounded-md transition-all duration-200',
                          day_selected: 'bg-pink-600 text-white hover:bg-pink-700 hover:text-white shadow-lg font-bold border-2 border-pink-400 !bg-pink-600',
                          day_today: 'text-pink-300 border border-pink-500/30 font-semibold',
                          day_outside: 'text-gray-500 hover:text-gray-400',
                          day_disabled: 'text-gray-600 opacity-50 cursor-not-allowed',
                          day_range_middle: 'bg-pink-500/30',
                          day_hidden: 'invisible',
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Withdrawal */}
                <div className="space-y-2">
                  <Label htmlFor="edit-withdrawal" className="text-white font-medium">
                    السحبة (جنيه)
                  </Label>
                  <Input
                    id="edit-withdrawal"
                    type="number"
                    value={editFormData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', convertToNumber(e.target.value))}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm"
                    placeholder="أدخل المبلغ"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-l from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                >
                  تحديث
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteWorker} onOpenChange={() => setDeleteWorker(null)}>
          <AlertDialogContent className="bg-gray-900/95 border-gray-700 w-[90vw] max-w-md backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-base">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-sm">
                هل أنت متأكد من حذف عامل "{deleteWorker?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AnimatePresence>
  );
};

export default CenterDelaaHawanemWorkers;
