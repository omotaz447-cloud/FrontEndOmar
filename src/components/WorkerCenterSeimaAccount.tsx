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
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  X,
  Users,
  Calendar,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface WorkerCenterSeimaAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkerAccountData {
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

const WorkerCenterSeimaAccount: React.FC<WorkerCenterSeimaAccountProps> = ({
  isOpen,
  onClose,
}) => {
  const [accounts, setAccounts] = useState<WorkerAccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    day: '',
    withdrawal: '',
  });
  const [editingAccount, setEditingAccount] = useState<WorkerAccountData | null>(null);
  const [deleteAccountName, setDeleteAccountName] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      console.log('Fetching worker accounts from:', 'https://backend-omar-x.vercel.app/api/worker-center-seima-account'); // Debug log

      const response = await fetch('https://backend-omar-x.vercel.app/api/worker-center-seima-account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch worker accounts:', response, errorData);
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Fetched worker accounts data:', data); // Debug log
      
      // Handle different response formats
      let accountsArray = [];
      if (data.data && Array.isArray(data.data)) {
        accountsArray = data.data;
      } else if (data.accounts && Array.isArray(data.accounts)) {
        accountsArray = data.accounts;
      } else if (Array.isArray(data)) {
        accountsArray = data;
      }
      
      setAccounts(accountsArray);
    } catch (error) {
      console.error('Error fetching worker accounts:', error);
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
    const dayMap: Record<string, string> = {
      'السبت': '1',
      'الاحد': '2',
      'الاثنين': '3',
      'الثلاثاء': '4',
      'الاربعاء': '5',
      'الخميس': '6',
      'الجمعه': '7',
      'الجمعة': '7', // Alternative spelling
    };
    
    return dayMap[dayName.trim()] || dayName; // Return the number or original value if not found
  };

  // Function to convert number back to Arabic day name for display
  const convertNumberToDay = (dayNumber: string): string => {
    const numberMap: Record<string, string> = {
      '1': 'السبت',
      '2': 'الاحد',
      '3': 'الاثنين',
      '4': 'الثلاثاء',
      '5': 'الاربعاء',
      '6': 'الخميس',
      '7': 'الجمعه',
    };
    
    return numberMap[dayNumber] || dayNumber; // Return the day name or original value if not found
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

    // Validate day name
    const validDays = ['السبت', 'الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعه', 'الجمعة'];
    if (!validDays.includes(formData.day.trim())) {
      toast.error('يرجى إدخال اسم يوم صحيح (السبت، الاحد، الاثنين، الثلاثاء، الاربعاء، الخميس، الجمعه)');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      // Convert day name to number before sending
      const dayNumber = convertDayToNumber(formData.day);
      
      const submitData = {
        الاسم: formData.name,
        name: formData.name,
        اليوم: dayNumber, // Send the number instead of day name
        day: dayNumber,   // Send the number instead of day name
        التاريخ: format(date, 'yyyy-MM-dd'),
        date: format(date, 'yyyy-MM-dd'),
        السحب: parseFloat(formData.withdrawal),
        withdrawal: parseFloat(formData.withdrawal),
      };

      console.log('Submitting worker account data:', submitData); // Debug log

      const url = editingAccount 
        ? `https://backend-omar-x.vercel.app/api/worker-center-seima-account/${editingAccount._id}`
        : 'https://backend-omar-x.vercel.app/api/worker-center-seima-account';
      
      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('Worker account response data:', responseData); // Debug log

      if (!response.ok) {
        console.error('Server error:', responseData);
        throw new Error(responseData.message || 'فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      resetForm();
      
      // Add a small delay before fetching to ensure server has processed the request
      setTimeout(() => {
        fetchAccounts();
      }, 100);
    } catch (error) {
      console.error('Error saving worker account:', error);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: WorkerAccountData) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      day: convertNumberToDay(account.day), // Convert number back to day name for form
      withdrawal: account.withdrawal.toString(),
    });
    setDate(new Date(account.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteAccountName) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`https://backend-omar-x.vercel.app/api/worker-center-seima-account/${encodeURIComponent(deleteAccountName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في حذف البيانات');
      }

      toast.success('تم الحذف بنجاح');
      setDeleteAccountName(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting worker account:', error);
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
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleBack = () => {
    resetForm();
  };

  useEffect(() => {
    if (isOpen && !showForm) {
      fetchAccounts();
    }
  }, [isOpen, showForm, fetchAccounts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-blue-500/20">
        <DialogHeader className="border-b border-blue-500/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-l from-blue-500/20 to-cyan-500/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Users className="w-6 h-6 text-blue-400" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {showForm ? `${editingAccount ? 'تعديل' : 'إضافة'} حسابات عمال سنتر سيما` : 'حسابات عمال سنتر سيما'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {showForm ? 'إدارة بيانات حسابات العمال' : 'عرض وإدارة حسابات العمال'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showForm && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                >
                  رجوع
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 overflow-y-auto max-h-[70vh]"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        الاسم <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50"
                        placeholder="أدخل اسم العامل"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        اليوم <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.day}
                        onChange={(e) => handleInputChange('day', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50"
                        placeholder="أدخل اليوم (مثال: السبت، الاحد، الاثنين...)"
                      />
                      <p className="text-xs text-gray-400">
                        أدخل: السبت، الاحد، الاثنين، الثلاثاء، الاربعاء، الخميس، الجمعه
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        التاريخ <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 hover:border-blue-500/50"
                          >
                            <Calendar className="ml-2 h-4 w-4 text-blue-400" />
                            {date ? format(date, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              setDate(selectedDate);
                              setIsDateOpen(false);
                            }}
                            locale={ar}
                            className="bg-gray-800 text-white"
                            classNames={{
                              day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600",
                              day_today: "bg-blue-100 text-blue-900 font-bold",
                              day: "text-white hover:bg-gray-700",
                              head_cell: "text-gray-300",
                              nav_button: "text-white hover:bg-gray-700",
                              nav_button_previous: "text-white hover:bg-gray-700",
                              nav_button_next: "text-white hover:bg-gray-700",
                              caption: "text-white",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        السحب <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.withdrawal}
                        onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50"
                        placeholder="أدخل مبلغ السحب"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Plus className="ml-2 h-4 w-4" />
                          {editingAccount ? 'تحديث' : 'إضافة'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">قائمة حسابات العمال</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        console.log('Manual refresh triggered for worker accounts');
                        fetchAccounts();
                      }}
                      variant="outline"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                    >
                      <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      تحديث ({accounts.length})
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة جديد
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-700/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/80">
                        <TableHead className="text-gray-300 font-semibold text-right">الاسم</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">اليوم</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">التاريخ</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">السحب</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow
                          key={account._id}
                          className="bg-gray-900/50 border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                        >
                          <TableCell className="text-gray-300 text-right">{account.name}</TableCell>
                          <TableCell className="text-gray-300 text-right">{convertNumberToDay(account.day)}</TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {format(new Date(account.date), 'yyyy-MM-dd', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            <span className="font-semibold text-blue-300">
                              {account.withdrawal} جنيه
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(account)}
                                className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteAccountName(account.name)}
                                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {accounts.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400">
                      لا توجد حسابات متاحة
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountName} onOpenChange={() => setDeleteAccountName(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف سجل العامل "{deleteAccountName}"؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
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

export default WorkerCenterSeimaAccount;
