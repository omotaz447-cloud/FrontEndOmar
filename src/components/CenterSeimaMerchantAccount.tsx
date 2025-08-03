import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Wallet,
  Calendar,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterSeimaMerchantAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MerchantAccountData {
  _id: string;
  name: string;
  invoice: number;
  payment: number;
  notes?: string;
  date: string;
  total: number;
  createdAt: string;
}

interface FormData {
  name: string;
  invoice: string;
  payment: string;
  notes: string;
  total: number;
}

const CenterSeimaMerchantAccount: React.FC<CenterSeimaMerchantAccountProps> = ({
  isOpen,
  onClose,
}) => {
  const [accounts, setAccounts] = useState<MerchantAccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    invoice: '',
    payment: '',
    notes: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<MerchantAccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const calculateTotal = (data: FormData) => {
    const invoice = parseFloat(data.invoice) || 0;
    const payment = parseFloat(data.payment) || 0;
    
    // الفاتوره - الدفعه
    return invoice - payment;
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      console.log('Fetching merchant accounts from:', 'https://backend-omar-x.vercel.app/api/center-seima-merchant'); // Debug log

      const response = await fetch('https://backend-omar-x.vercel.app/api/center-seima-merchant', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch merchant accounts:', response, errorData);
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Fetched merchant accounts data:', data); // Debug log
      
      // Handle different response formats
      let accountsArray = [];
      if (data.data && Array.isArray(data.data)) {
        accountsArray = data.data;
      } else if (data.merchants && Array.isArray(data.merchants)) {
        accountsArray = data.merchants;
      } else if (data.accounts && Array.isArray(data.accounts)) {
        accountsArray = data.accounts;
      } else if (Array.isArray(data)) {
        accountsArray = data;
      }
      
      setAccounts(accountsArray);
    } catch (error) {
      console.error('Error fetching merchant accounts:', error);
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Calculate total automatically
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, [name]: value, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    if (!formData.name || !formData.invoice || !formData.payment) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      // Convert string values to numbers or keep "0" as string
      const convertToNumber = (value: string | number): number | string => {
        if (typeof value === 'number') return value;
        if (value === '' || value === null || value === undefined) return 0;
        // Keep explicit "0" input as string
        if (value === '0') return "0";
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const submitData = {
        الاسم: formData.name,
        name: formData.name,
        الفاتوره: convertToNumber(formData.invoice),
        invoice: convertToNumber(formData.invoice),
        دفعه: convertToNumber(formData.payment),
        payment: convertToNumber(formData.payment),
        ملاحظات: formData.notes,
        notes: formData.notes,
        التاريخ: format(date, 'yyyy-MM-dd'),
        date: format(date, 'yyyy-MM-dd'),
        total: calculateTotal(formData),
      };

      console.log('Submitting merchant account data:', submitData); // Debug log

      const url = editingAccount 
        ? `https://backend-omar-x.vercel.app/api/center-seima-merchant/${editingAccount._id}`
        : 'https://backend-omar-x.vercel.app/api/center-seima-merchant';
      
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
      console.log('Merchant account response data:', responseData); // Debug log

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
      console.error('Error saving merchant account:', error);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: MerchantAccountData) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      invoice: account.invoice.toString(),
      payment: account.payment.toString(),
      notes: account.notes || '',
      total: account.total,
    });
    setDate(new Date(account.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteAccountId) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`https://backend-omar-x.vercel.app/api/center-seima-merchant/${deleteAccountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في حذف البيانات');
      }

      toast.success('تم الحذف بنجاح');
      setDeleteAccountId(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting merchant account:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      invoice: '',
      payment: '',
      notes: '',
      total: 0,
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-purple-500/20">
        <DialogHeader className="border-b border-purple-500/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-l from-purple-500/20 to-violet-500/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Wallet className="w-6 h-6 text-purple-400" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {showForm ? `${editingAccount ? 'تعديل' : 'إضافة'} حساب تجار سنتر سيما` : 'حساب تجار سنتر سيما'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {showForm ? 'إدارة بيانات حسابات التجار' : 'عرض وإدارة حسابات التجار'}
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
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                        placeholder="أدخل اسم التاجر"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        الفاتوره <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.invoice}
                        onChange={(e) => handleInputChange('invoice', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                        placeholder="أدخل مبلغ الفاتوره"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        دفعه <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.payment}
                        onChange={(e) => handleInputChange('payment', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                        placeholder="أدخل مبلغ الدفعه"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        التاريخ <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 hover:border-purple-500/50"
                          >
                            <Calendar className="ml-2 h-4 w-4 text-purple-400" />
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
                              day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600",
                              day_today: "bg-purple-100 text-purple-900 font-bold",
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

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white font-medium">ملاحظات</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                        placeholder="أدخل ملاحظات إضافية..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white font-medium">المتبقي</Label>
                      <div className="p-4 bg-gradient-to-l from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/20">
                        <span className={`text-2xl font-bold ${formData.total >= 0 ? 'text-purple-300' : 'text-red-400'}`}>
                          {formData.total.toFixed(2)} جنيه
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                          الفاتوره - الدفعه
                        </p>
                      </div>
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
                      className="bg-gradient-to-l from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold px-8"
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
                  <h3 className="text-xl font-semibold text-white">قائمة حسابات التجار</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        console.log('Manual refresh triggered for merchant accounts');
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
                      className="bg-gradient-to-l from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
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
                        <TableHead className="text-gray-300 font-semibold text-right">الفاتوره</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">الدفعه</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">التاريخ</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">المتبقي</TableHead>
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
                          <TableCell className="text-gray-300 text-right">{account.invoice} جنيه</TableCell>
                          <TableCell className="text-gray-300 text-right">{account.payment} جنيه</TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {format(new Date(account.date), 'yyyy-MM-dd', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${account.total >= 0 ? 'text-purple-300' : 'text-red-400'}`}>
                              {account.total} جنيه
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
                                onClick={() => setDeleteAccountId(account._id)}
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
        <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
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

export default CenterSeimaMerchantAccount;
