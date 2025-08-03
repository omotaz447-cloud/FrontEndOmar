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
  Users,
  Calendar,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { getRolePermissions } from '@/utils/roleUtils';

interface CenterGazaMerchantsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MerchantData {
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

const CenterGazaMerchants: React.FC<CenterGazaMerchantsProps> = ({
  isOpen,
  onClose,
}) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('حساب تجار سنتر غزة');

  // Check if user can access this component
  useEffect(() => {
    if (isOpen && !permissions.canAccess) {
      toast.error('غير مخول للوصول إلى هذه الصفحة');
      onClose();
      return;
    }
  }, [isOpen, permissions.canAccess, onClose]);

  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    invoice: '',
    payment: '',
    notes: '',
    total: 0,
  });
  const [editingMerchant, setEditingMerchant] = useState<MerchantData | null>(null);
  const [deleteMerchantId, setDeleteMerchantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const calculateTotal = (data: FormData) => {
    const invoice = parseFloat(data.invoice) || 0;
    const payment = parseFloat(data.payment) || 0;
    
    // الفاتوره - الدفعه
    return invoice - payment;
  };

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      const response = await fetch('https://backend-omar-puce.vercel.app/api/center-gaza-sales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      
      // Handle different response formats
      let merchantsArray = [];
      if (data.data && Array.isArray(data.data)) {
        merchantsArray = data.data;
      } else if (data.sales && Array.isArray(data.sales)) {
        merchantsArray = data.sales;
      } else if (Array.isArray(data)) {
        merchantsArray = data;
      }
      
      setMerchants(merchantsArray);
    } catch (error) {
      console.error('Error fetching merchants:', error);
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
    setFormData(prev => ({ ...prev, total }));
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
        name: formData.name,
        date: format(date, 'yyyy-MM-dd'),
        invoice: convertToNumber(formData.invoice),
        payment: convertToNumber(formData.payment),
        notes: formData.notes,
        total: calculateTotal(formData),
      };

      const url = editingMerchant
        ? `https://backend-omar-puce.vercel.app/api/center-gaza-sales/${editingMerchant._id}`
        : 'https://backend-omar-puce.vercel.app/api/center-gaza-sales';

      const method = editingMerchant ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حفظ البيانات');
      }

      toast.success(editingMerchant ? 'تم تحديث البيانات بنجاح' : 'تم إضافة التاجر بنجاح');
      
      // Reset form
      setFormData({
        name: '',
        invoice: '',
        payment: '',
        notes: '',
        total: 0,
      });
      setDate(undefined);
      setEditingMerchant(null);
      setShowForm(false);
      
      // Refresh data
      fetchMerchants();
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (merchant: MerchantData) => {
    setEditingMerchant(merchant);
    setFormData({
      name: merchant.name,
      invoice: merchant.invoice.toString(),
      payment: merchant.payment.toString(),
      notes: merchant.notes || '',
      total: merchant.total,
    });
    setDate(new Date(merchant.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteMerchantId) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-gaza-sales/${deleteMerchantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حذف البيانات');
      }

      toast.success('تم حذف التاجر بنجاح');
      setDeleteMerchantId(null);
      fetchMerchants();
    } catch (error) {
      console.error('Error deleting merchant:', error);
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
    setEditingMerchant(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMerchants();
    }
  }, [isOpen, fetchMerchants]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            حساب تجار سنتر غزة
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">
            إدارة حسابات تجار سنتر غزة ومتابعة الفواتير والدفعات
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
                إضافة تاجر جديد
              </Button>
              <Button
                onClick={fetchMerchants}
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
                  <TableHead className="text-gray-300 text-right">الفاتورة</TableHead>
                  <TableHead className="text-gray-300 text-right">الدفعة</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {merchants.map((merchant, index) => (
                    <motion.tr
                      key={merchant._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right font-medium">{merchant.name}</TableCell>
                      <TableCell className="text-right">{merchant.invoice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{merchant.payment.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${merchant.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {merchant.total.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(merchant.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{merchant.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        {permissions.canEdit && permissions.canDelete ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleEdit(merchant)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => setDeleteMerchantId(merchant._id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">غير مسموح</span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {merchants.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات تجار</p>
                <p className="text-sm">اضغط على "إضافة تاجر جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingMerchant ? 'تعديل بيانات التاجر' : 'إضافة تاجر جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300 text-right block mb-2">الاسم</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="اسم التاجر"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الفاتورة</Label>
                <Input
                  type="number"
                  value={formData.invoice}
                  onChange={(e) => handleInputChange('invoice', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="قيمة الفاتورة"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الدفعة</Label>
                <Input
                  type="number"
                  value={formData.payment}
                  onChange={(e) => handleInputChange('payment', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="قيمة الدفعة"
                  required
                />
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
                <Label className="text-gray-300 text-right block mb-2">الملاحظات (اختياري)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="أضف ملاحظات إضافية"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                  placeholder="سيتم حسابه تلقائياً"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingMerchant ? 'تحديث' : 'إضافة'}
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
        <AlertDialog open={!!deleteMerchantId} onOpenChange={() => setDeleteMerchantId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا التاجر؟ لا يمكن التراجع عن هذا الإجراء.
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

export default CenterGazaMerchants;
