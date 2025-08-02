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
  BarChart3,
  Calendar,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface NewCenterGazaSalesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SalesData {
  _id: string;
  day: string;
  date: string;
  rent: number;
  expenses: number;
  sold: number;
  exitName: string;
  exits: number;
  notes?: string;
  total: number;
  createdAt: string;
}

interface FormData {
  day: string;
  rent: string;
  expenses: string;
  sold: string;
  exitName: string;
  exits: string;
  notes: string;
  total: number;
}

const NewCenterGazaSales: React.FC<NewCenterGazaSalesProps> = ({
  isOpen,
  onClose,
}) => {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    day: '',
    rent: '',
    expenses: '',
    sold: '',
    exitName: '',
    exits: '',
    notes: '',
    total: 0,
  });
  const [editingSale, setEditingSale] = useState<SalesData | null>(null);
  const [deleteSaleId, setDeleteSaleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const calculateTotal = (data: FormData) => {
    const sold = parseFloat(data.sold) || 0;
    const rent = parseFloat(data.rent) || 0;
    const expenses = parseFloat(data.expenses) || 0;
    const exits = parseFloat(data.exits) || 0;
    
    // المباع - الايجار - المصاريف - الخوارج
    return sold - rent - expenses - exits;
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      const response = await fetch('https://backend-omar-puce.vercel.app/api/new-center-gaza-sales', {
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
      let salesArray = [];
      if (data.data && Array.isArray(data.data)) {
        salesArray = data.data;
      } else if (data.sales && Array.isArray(data.sales)) {
        salesArray = data.sales;
      } else if (Array.isArray(data)) {
        salesArray = data;
      }
      
      setSales(salesArray);
    } catch (error) {
      console.error('Error fetching sales:', error);
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

    if (!formData.day || !formData.rent || !formData.expenses || !formData.sold || !formData.exitName || !formData.exits) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        day: formData.day,
        date: format(date, 'yyyy-MM-dd'),
        rent: parseFloat(formData.rent),
        expenses: parseFloat(formData.expenses),
        sold: parseFloat(formData.sold),
        exitName: formData.exitName,
        exits: parseFloat(formData.exits),
        notes: formData.notes,
        total: calculateTotal(formData),
      };

      const url = editingSale
        ? `https://backend-omar-puce.vercel.app/api/new-center-gaza-sales/${editingSale._id}`
        : 'https://backend-omar-puce.vercel.app/api/new-center-gaza-sales';

      const method = editingSale ? 'PUT' : 'POST';

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

      toast.success(editingSale ? 'تم تحديث البيانات بنجاح' : 'تم إضافة المبيعات بنجاح');
      
      // Reset form
      setFormData({
        day: '',
        rent: '',
        expenses: '',
        sold: '',
        exitName: '',
        exits: '',
        notes: '',
        total: 0,
      });
      setDate(undefined);
      setEditingSale(null);
      setShowForm(false);
      
      // Refresh data
      fetchSales();
    } catch (error) {
      console.error('Error saving sales:', error);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: SalesData) => {
    setEditingSale(sale);
    setFormData({
      day: sale.day,
      rent: sale.rent.toString(),
      expenses: sale.expenses.toString(),
      sold: sale.sold.toString(),
      exitName: sale.exitName,
      exits: sale.exits.toString(),
      notes: sale.notes || '',
      total: sale.total,
    });
    setDate(new Date(sale.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteSaleId) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/new-center-gaza-sales/${deleteSaleId}`, {
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

      toast.success('تم حذف المبيعات بنجاح');
      setDeleteSaleId(null);
      fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      day: '',
      rent: '',
      expenses: '',
      sold: '',
      exitName: '',
      exits: '',
      notes: '',
      total: 0,
    });
    setDate(undefined);
    setEditingSale(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSales();
    }
  }, [isOpen, fetchSales]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            مبيعات سنتر غزة
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">
            إدارة مبيعات سنتر غزة ومتابعة الإيرادات والمصروفات اليومية
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
                إضافة مبيعات جديدة
              </Button>
              <Button
                onClick={fetchSales}
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
                  <TableHead className="text-gray-300 text-right">اليوم</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الإيجار</TableHead>
                  <TableHead className="text-gray-300 text-right">المصاريف</TableHead>
                  <TableHead className="text-gray-300 text-right">المباع</TableHead>
                  <TableHead className="text-gray-300 text-right">اسم الخارج</TableHead>
                  <TableHead className="text-gray-300 text-right">الخوارج</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {sales.map((sale, index) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right font-medium">{sale.day}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(sale.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right text-red-400">{sale.rent.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{sale.expenses.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-400">{sale.sold.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{sale.exitName}</TableCell>
                      <TableCell className="text-right text-red-400">{sale.exits.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${sale.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sale.total.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{sale.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEdit(sale)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteSaleId(sale._id)}
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

            {sales.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات مبيعات</p>
                <p className="text-sm">اضغط على "إضافة مبيعات جديدة" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingSale ? 'تعديل بيانات المبيعات' : 'إضافة مبيعات جديدة'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300 text-right block mb-2">اليوم</Label>
                <Input
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="اليوم"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">الإيجار</Label>
                  <Input
                    type="number"
                    value={formData.rent}
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="الإيجار"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">المصاريف</Label>
                  <Input
                    type="number"
                    value={formData.expenses}
                    onChange={(e) => handleInputChange('expenses', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="المصاريف"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">المباع</Label>
                <Input
                  type="number"
                  value={formData.sold}
                  onChange={(e) => handleInputChange('sold', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="المباع"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">اسم الخارج</Label>
                  <Input
                    value={formData.exitName}
                    onChange={(e) => handleInputChange('exitName', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="اسم الخارج"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">الخوارج</Label>
                  <Input
                    type="number"
                    value={formData.exits}
                    onChange={(e) => handleInputChange('exits', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="الخوارج"
                    required
                  />
                </div>
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
                  {loading ? 'جاري الحفظ...' : editingSale ? 'تحديث' : 'إضافة'}
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
        <AlertDialog open={!!deleteSaleId} onOpenChange={() => setDeleteSaleId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذه المبيعات؟ لا يمكن التراجع عن هذا الإجراء.
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

export default NewCenterGazaSales;
