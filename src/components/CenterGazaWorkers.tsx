import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Users,
  Calendar,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterGazaWorkersProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkerData {
  _id: string;
  name: string;
  day: string;
  date: string;
  withdrawal: number;
  createdAt: string;
}

interface FormData {
  name: string;
  day: string;
  withdrawal: string;
}

const CenterGazaWorkers: React.FC<CenterGazaWorkersProps> = ({
  isOpen,
  onClose,
}) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    day: '',
    withdrawal: '',
  });
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);
  const [deleteWorkerId, setDeleteWorkerId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      console.log('Fetching workers with token:', !!token);
      console.log('API endpoint:', 'https://backend-omar-puce.vercel.app/api/worker-center-gaza-account');

      const response = await fetch('https://backend-omar-puce.vercel.app/api/worker-center-gaza-account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Raw response data:', data);
      
      // Handle different response formats
      let workersArray = [];
      if (data.data && Array.isArray(data.data)) {
        workersArray = data.data;
        console.log('Using data.data array');
      } else if (data.account && Array.isArray(data.account)) {
        workersArray = data.account;
        console.log('Using data.account array');
      } else if (Array.isArray(data)) {
        workersArray = data;
        console.log('Using direct data array');
      } else {
        console.log('Unknown response format:', data);
      }
      
      console.log('Final workers array:', workersArray);
      setWorkers(workersArray);
    } catch (error) {
      console.error('Error fetching workers:', error);
      console.error('Full error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to convert Arabic day names to numbers
  const convertDayToNumber = (dayName: string): string => {
    const dayMap: { [key: string]: string } = {
      'السبت': '1',
      'الاحد': '2',
      'الاثنين': '3',
      'الثلاثاء': '4',
      'الاربعاء': '5',
      'الخميس': '6',
      'الجمعه': '7'
    };
    
    const result = dayMap[dayName] || dayName;
    console.log(`Converting day: "${dayName}" -> "${result}"`);
    return result;
  };

  // Function to convert numbers back to Arabic day names
  const convertNumberToDay = (dayNumber: string): string => {
    const numberMap: { [key: string]: string } = {
      '1': 'السبت',
      '2': 'الاحد',
      '3': 'الاثنين',
      '4': 'الثلاثاء',
      '5': 'الاربعاء',
      '6': 'الخميس',
      '7': 'الجمعه'
    };
    
    return numberMap[dayNumber] || dayNumber; // Return the day name if found, otherwise return original value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    if (!formData.name || !formData.day || !formData.withdrawal) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        console.error('No access token found');
        toast.error('لم يتم العثور على رمز التفويض');
        return;
      }

      const convertedDay = convertDayToNumber(formData.day);
      
      const submitData = {
        "الاسم": formData.name,
        "اليوم": convertedDay,
        "التاريخ": format(date, 'yyyy-MM-dd'),
        "السحب": parseFloat(formData.withdrawal),
      };

      // Additional validation for converted day
      if (!['1', '2', '3', '4', '5', '6', '7'].includes(convertedDay)) {
        console.error('Invalid day conversion:', formData.day, '->', convertedDay);
        toast.error('يوم العمل غير صحيح');
        return;
      }

      // Validate all fields are present and valid
      if (!submitData["الاسم"] || !submitData["اليوم"] || !submitData["التاريخ"] || !submitData["السحب"]) {
        console.error('Missing required fields:', submitData);
        toast.error('جميع الحقول مطلوبة');
        return;
      }

      if (isNaN(submitData["السحب"])) {
        console.error('Invalid withdrawal amount:', formData.withdrawal);
        toast.error('مبلغ السحب غير صحيح');
        return;
      }

      const url = editingWorker
        ? `https://backend-omar-puce.vercel.app/api/worker-center-gaza-account/${editingWorker._id}`
        : 'https://backend-omar-puce.vercel.app/api/worker-center-gaza-account';

      const method = editingWorker ? 'PUT' : 'POST';

      console.log('Original day:', formData.day);
      console.log('Converted day:', convertDayToNumber(formData.day));
      console.log('Sending data to API:', submitData);
      console.log('API URL:', url);
      console.log('Method:', method);
      console.log('Token exists:', !!token);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          method,
          sentData: submitData
        });
        throw new Error(errorData.message || `HTTP ${response.status}: فشل في حفظ البيانات`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      toast.success(editingWorker ? 'تم تحديث البيانات بنجاح' : 'تم إضافة العامل بنجاح');
      
      // Reset form
      setFormData({
        name: '',
        day: '',
        withdrawal: '',
      });
      setDate(undefined);
      setEditingWorker(null);
      setShowForm(false);
      
      // Refresh data
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      console.error('Form data:', formData);
      console.error('Date:', date);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker: WorkerData) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      day: convertNumberToDay(worker.day),
      withdrawal: worker.withdrawal.toString(),
    });
    setDate(new Date(worker.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteWorkerId) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        console.error('No access token found for delete');
        toast.error('لم يتم العثور على رمز التفويض');
        return;
      }

      const deleteUrl = `https://backend-omar-puce.vercel.app/api/worker-center-gaza-account/${deleteWorkerId}`;
      console.log('Delete URL:', deleteUrl);
      console.log('Delete worker ID:', deleteWorkerId);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          deleteUrl,
          workerId: deleteWorkerId
        });
        throw new Error(errorData.message || 'فشل في حذف البيانات');
      }

      const responseData = await response.json();
      console.log('Delete success response:', responseData);

      toast.success('تم حذف العامل بنجاح');
      setDeleteWorkerId(null);
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      day: '',
      withdrawal: '',
    });
    setDate(undefined);
    setEditingWorker(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen, fetchWorkers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            حساب عمال سنتر غزة
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">
            إدارة حسابات عمال سنتر غزة ومتابعة السحوبات اليومية
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة عامل جديد
              </Button>
              <Button
                onClick={fetchWorkers}
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
                  <TableHead className="text-gray-300 text-right">الاسم</TableHead>
                  <TableHead className="text-gray-300 text-right">اليوم</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">السحب</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {workers.map((worker, index) => (
                    <motion.tr
                      key={worker._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right font-medium">{worker.name}</TableCell>
                      <TableCell className="text-right">{convertNumberToDay(worker.day)}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(worker.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-400 font-bold">
                          {worker.withdrawal.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(worker)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteWorkerId(worker._id)}
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

            {workers.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات عمال</p>
                <p className="text-sm">اضغط على "إضافة عامل جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingWorker ? 'تعديل بيانات العامل' : 'إضافة عامل جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300 text-right block mb-2">الاسم</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="اسم العامل"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">اليوم</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => handleInputChange('day', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-right">
                    <SelectValue placeholder="اختر يوم العمل" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="السبت">السبت</SelectItem>
                    <SelectItem value="الاحد">الأحد</SelectItem>
                    <SelectItem value="الاثنين">الاثنين</SelectItem>
                    <SelectItem value="الثلاثاء">الثلاثاء</SelectItem>
                    <SelectItem value="الاربعاء">الأربعاء</SelectItem>
                    <SelectItem value="الخميس">الخميس</SelectItem>
                    <SelectItem value="الجمعه">الجمعة</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label className="text-gray-300 text-right block mb-2">السحب</Label>
                <Input
                  type="number"
                  value={formData.withdrawal}
                  onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="مبلغ السحب"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingWorker ? 'تحديث' : 'إضافة'}
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
        <AlertDialog open={!!deleteWorkerId} onOpenChange={() => setDeleteWorkerId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا العامل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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

export default CenterGazaWorkers;
