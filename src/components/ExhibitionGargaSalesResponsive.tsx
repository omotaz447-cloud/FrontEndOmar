import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { CalendarIcon, Building2, DollarSign, TrendingDown, TrendingUp, User, FileText, Edit, Trash2, RefreshCw, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ExhibitionGargaSalesData {
  _id?: string;
  day: string;
  date: string;
  rent: number;
  expenses: number;
  sold: number;
  exitName: string;
  exits: number;
  notes?: string;
  total?: number;
}

interface ExhibitionGargaSalesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  day: string;
  date: Date | undefined;
  rent: string;
  expenses: string;
  sold: string;
  exitName: string;
  exits: string;
  notes: string;
}

const ExhibitionGargaSales: React.FC<ExhibitionGargaSalesProps> = ({
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

  const [formData, setFormData] = useState<FormData>({
    day: '',
    date: undefined,
    rent: '',
    expenses: '',
    sold: '',
    exitName: '',
    exits: '',
    notes: '',
  });

  const [sales, setSales] = useState<ExhibitionGargaSalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<ExhibitionGargaSalesData | null>(null);
  const [deleteSale, setDeleteSale] = useState<ExhibitionGargaSalesData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<FormData>({
    day: '',
    date: undefined,
    rent: '',
    expenses: '',
    sold: '',
    exitName: '',
    exits: '',
    notes: '',
  });

  // Fetch existing sales
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://waheed-web.vercel.app/api/exhibition-garga-sales', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSales(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
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
      fetchSales();
    }
  }, [isOpen, fetchSales]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    const sold = parseFloat(formData.sold) || 0;
    const rent = parseFloat(formData.rent) || 0;
    const expenses = parseFloat(formData.expenses) || 0;
    const exits = parseFloat(formData.exits) || 0;
    return sold - rent - expenses - exits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day || !formData.date || !formData.rent || !formData.expenses || 
        !formData.sold || !formData.exitName || !formData.exits) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://waheed-web.vercel.app/api/exhibition-garga-sales', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          'اليوم': formData.day,
          'التاريخ': formData.date?.toISOString(),
          'الايجار': parseFloat(formData.rent),
          'المصاريف': parseFloat(formData.expenses),
          'المباع': parseFloat(formData.sold),
          'اسم الخارج': formData.exitName,
          'الخوارج': parseFloat(formData.exits),
          'الملاحظات': formData.notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء المبيعات بنجاح');
        setFormData({
          day: '',
          date: undefined,
          rent: '',
          expenses: '',
          sold: '',
          exitName: '',
          exits: '',
          notes: '',
        });
        fetchSales(); // Refresh the table
      } else {
        toast.error(result.message || 'حدث خطأ أثناء حفظ المبيعات');
      }
    } catch (error) {
      console.error('Error saving sales:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sale: ExhibitionGargaSalesData) => {
    setEditingSale(sale);
    setEditFormData({
      day: sale.day,
      date: new Date(sale.date),
      rent: sale.rent.toString(),
      expenses: sale.expenses.toString(),
      sold: sale.sold.toString(),
      exitName: sale.exitName,
      exits: sale.exits.toString(),
      notes: sale.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteSale?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://waheed-web.vercel.app/api/exhibition-garga-sales/${deleteSale._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('تم حذف المبيعات بنجاح');
        fetchSales(); // Refresh the table
        setDeleteSale(null);
      } else {
        toast.error('فشل في حذف المبيعات');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء حذف المبيعات');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.day || !editFormData.date || !editFormData.rent || 
        !editFormData.expenses || !editFormData.sold || !editFormData.exitName || !editFormData.exits) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (!editingSale?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://waheed-web.vercel.app/api/exhibition-garga-sales/${editingSale._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            'اليوم': editFormData.day,
            'التاريخ': editFormData.date?.toISOString(),
            'الايجار': parseFloat(editFormData.rent),
            'المصاريف': parseFloat(editFormData.expenses),
            'المباع': parseFloat(editFormData.sold),
            'اسم الخارج': editFormData.exitName,
            'الخوارج': parseFloat(editFormData.exits),
            'الملاحظات': editFormData.notes,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success('تم تحديث المبيعات بنجاح');
        setEditDialogOpen(false);
        setEditingSale(null);
        fetchSales();
      } else {
        toast.error(result.message || 'حدث خطأ أثناء تحديث المبيعات');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('حدث خطأ أثناء تحديث المبيعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total for edit form
  const calculateEditTotal = () => {
    const sold = parseFloat(editFormData.sold) || 0;
    const rent = parseFloat(editFormData.rent) || 0;
    const expenses = parseFloat(editFormData.expenses) || 0;
    const exits = parseFloat(editFormData.exits) || 0;
    return sold - rent - expenses - exits;
  };

  const total = calculateTotal();

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-700/50 flex-shrink-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-center">
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                  <span>مبيعات جرجا مول العرب</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="py-4"
                >
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Day */}
                      <div className="space-y-2">
                        <Label htmlFor="day" className="text-white font-medium text-sm sm:text-base">
                          اليوم
                        </Label>
                        <div className="relative">
                          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                          <Select
                            value={formData.day}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base">
                              <SelectValue placeholder="اختر اليوم" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="الأحد" className="text-white hover:bg-gray-700 focus:bg-gray-700">الأحد</SelectItem>
                              <SelectItem value="الاثنين" className="text-white hover:bg-gray-700 focus:bg-gray-700">الاثنين</SelectItem>
                              <SelectItem value="الثلاثاء" className="text-white hover:bg-gray-700 focus:bg-gray-700">الثلاثاء</SelectItem>
                              <SelectItem value="الأربعاء" className="text-white hover:bg-gray-700 focus:bg-gray-700">الأربعاء</SelectItem>
                              <SelectItem value="الخميس" className="text-white hover:bg-gray-700 focus:bg-gray-700">الخميس</SelectItem>
                              <SelectItem value="الجمعة" className="text-white hover:bg-gray-700 focus:bg-gray-700">الجمعة</SelectItem>
                              <SelectItem value="السبت" className="text-white hover:bg-gray-700 focus:bg-gray-700">السبت</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="space-y-2">
                        <Label className="text-white font-medium text-sm sm:text-base">التاريخ</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700 h-10 sm:h-12 text-sm sm:text-base"
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {formData.date ? (
                                format(formData.date, 'PPP', { locale: ar })
                              ) : (
                                <span>اختر التاريخ</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                            <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                              initialFocus
                              className="bg-gray-800 text-white border-0 [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day]:hover:bg-emerald-600/20 [&_.rdp-day]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-nav_button]:text-white [&_.rdp-nav_button]:hover:bg-gray-700 [&_.rdp-caption]:text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Rent */}
                      <div className="space-y-2">
                        <Label htmlFor="rent" className="text-white font-medium text-sm sm:text-base">
                          الإيجار
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="rent"
                            name="rent"
                            type="number"
                            value={formData.rent}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="أدخل قيمة الإيجار"
                            required
                          />
                        </div>
                      </div>

                      {/* Expenses */}
                      <div className="space-y-2">
                        <Label htmlFor="expenses" className="text-white font-medium text-sm sm:text-base">
                          المصاريف
                        </Label>
                        <div className="relative">
                          <TrendingDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="expenses"
                            name="expenses"
                            type="number"
                            value={formData.expenses}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="أدخل المصاريف"
                            required
                          />
                        </div>
                      </div>

                      {/* Sold */}
                      <div className="space-y-2">
                        <Label htmlFor="sold" className="text-white font-medium text-sm sm:text-base">
                          المباع
                        </Label>
                        <div className="relative">
                          <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="sold"
                            name="sold"
                            type="number"
                            value={formData.sold}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="أدخل قيمة المباع"
                            required
                          />
                        </div>
                      </div>

                      {/* Exit Name */}
                      <div className="space-y-2">
                        <Label htmlFor="exitName" className="text-white font-medium text-sm sm:text-base">
                          اسم الخارج
                        </Label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="exitName"
                            name="exitName"
                            type="text"
                            value={formData.exitName}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="أدخل اسم الخارج"
                            required
                          />
                        </div>
                      </div>

                      {/* Exits */}
                      <div className="space-y-2">
                        <Label htmlFor="exits" className="text-white font-medium text-sm sm:text-base">
                          الخوارج
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="exits"
                            name="exits"
                            type="number"
                            value={formData.exits}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="أدخل قيمة الخوارج"
                            required
                          />
                        </div>
                      </div>

                      {/* Total Display */}
                      <div className="space-y-2">
                        <Label className="text-white font-medium text-sm sm:text-base">الإجمالي</Label>
                        <div className="relative">
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                          <div className={`bg-gray-700 border border-gray-600 rounded-md pr-10 sm:pr-12 py-2 sm:py-3 text-white font-bold text-sm sm:text-base ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {total.toFixed(2)} جنيه
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-white font-medium text-sm sm:text-base">
                        ملاحظات (اختياري)
                      </Label>
                      <div className="relative">
                        <FileText className="absolute right-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                          placeholder="أدخل أي ملاحظات إضافية..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 hover:from-emerald-700 hover:via-green-800 hover:to-teal-900 text-white font-medium py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                          />
                        ) : null}
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ المبيعات'}
                      </Button>
                      <Button
                        type="button"
                        onClick={fetchSales}
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base transition-all duration-300"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Table Section */}
                  <div className="mt-6 sm:mt-8">
                    <Card className="bg-gray-800/60 border-gray-700/50">
                      <CardContent className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-white">سجلات المبيعات</h3>
                          <span className="text-gray-400 text-xs sm:text-sm">
                            إجمالي السجلات: {sales.length}
                          </span>
                        </div>

                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-emerald-500 border-t-transparent rounded-full"
                            />
                            <span className="text-white mr-3 text-sm sm:text-base">جاري تحميل البيانات...</span>
                          </div>
                        ) : sales.length === 0 ? (
                          <div className="text-center py-8">
                            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 text-base sm:text-lg">لا توجد سجلات مبيعات</p>
                            <p className="text-gray-500 text-xs sm:text-sm mt-2">قم بإضافة مبيعات جديدة للبدء</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto -mx-3 sm:-mx-6">
                            <div className="inline-block min-w-full align-middle">
                              <div className="overflow-hidden shadow-sm border border-gray-700/30 rounded-lg">
                                <Table className="min-w-full">
                                  <TableHeader>
                                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">اليوم</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">التاريخ</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">الإيجار</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">المصاريف</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">المباع</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">اسم الخارج</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">الخوارج</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">الإجمالي</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-right text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">ملاحظات</TableHead>
                                      <TableHead className="text-gray-300 font-semibold text-center text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">الإجراءات</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {sales.map((sale, index) => (
                                      <TableRow key={sale._id || index} className="border-gray-700/30 hover:bg-gray-800/30">
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.day}</TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                          {format(new Date(sale.date), 'dd/MM/yyyy', { locale: ar })}
                                        </TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.rent} جنيه</TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.expenses} جنيه</TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.sold} جنيه</TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.exitName}</TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{sale.exits} جنيه</TableCell>
                                        <TableCell className={`text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 font-bold whitespace-nowrap ${(sale.sold - sale.rent - sale.expenses - sale.exits) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {(sale.sold - sale.rent - sale.expenses - sale.exits).toFixed(2)} جنيه
                                        </TableCell>
                                        <TableCell className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 max-w-[120px] truncate">
                                          {sale.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-center px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                          <div className="flex justify-center space-x-2 space-x-reverse">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleEdit(sale)}
                                              className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 p-1 sm:p-2"
                                            >
                                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => setDeleteSale(sale)}
                                              className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 p-1 sm:p-2"
                                            >
                                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
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

                  <div className="flex justify-center pt-4 sm:pt-6">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                      إغلاق
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteSale} onOpenChange={() => setDeleteSale(null)}>
            <AlertDialogContent className="bg-gray-900 border-gray-700 w-[90vw] max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white text-base sm:text-lg">تأكيد الحذف</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 text-sm sm:text-base">
                  هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-4">
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2 px-4"
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
                </AlertDialogAction>
                <AlertDialogCancel 
                  onClick={() => setDeleteSale(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm sm:text-base py-2 px-4"
                >
                  إلغاء
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-700/50 flex-shrink-0">
              <DialogTitle className="text-white text-right text-lg sm:text-xl">
                تعديل مبيعات جرجا مول العرب
              </DialogTitle>
              <p className="text-gray-400 text-right text-sm sm:text-base">
                تعديل بيانات المبيعات لتاريخ {editingSale?.date ? format(new Date(editingSale.date), 'dd/MM/yyyy', { locale: ar }) : ''}
              </p>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6 py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Day - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-day" className="text-white font-medium text-sm sm:text-base">
                        اليوم
                      </Label>
                      <div className="relative">
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
                        <Select
                          value={editFormData.day}
                          onValueChange={(value) => setEditFormData((prev: FormData) => ({ ...prev, day: value }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="اختر اليوم" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="الأحد" className="text-white hover:bg-gray-700 focus:bg-gray-700">الأحد</SelectItem>
                            <SelectItem value="الاثنين" className="text-white hover:bg-gray-700 focus:bg-gray-700">الاثنين</SelectItem>
                            <SelectItem value="الثلاثاء" className="text-white hover:bg-gray-700 focus:bg-gray-700">الثلاثاء</SelectItem>
                            <SelectItem value="الأربعاء" className="text-white hover:bg-gray-700 focus:bg-gray-700">الأربعاء</SelectItem>
                            <SelectItem value="الخميس" className="text-white hover:bg-gray-700 focus:bg-gray-700">الخميس</SelectItem>
                            <SelectItem value="الجمعة" className="text-white hover:bg-gray-700 focus:bg-gray-700">الجمعة</SelectItem>
                            <SelectItem value="السبت" className="text-white hover:bg-gray-700 focus:bg-gray-700">السبت</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Date - Edit */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">التاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {editFormData.date ? (
                              format(editFormData.date, 'PPP', { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                          <Calendar
                            mode="single"
                            selected={editFormData.date}
                            onSelect={(date) => setEditFormData((prev: FormData) => ({ ...prev, date }))}
                            initialFocus
                            className="bg-gray-800 text-white border-0 [&_.rdp-day_selected]:bg-emerald-600 [&_.rdp-day_selected]:text-white [&_.rdp-day]:hover:bg-emerald-600/20 [&_.rdp-day]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-nav_button]:text-white [&_.rdp-nav_button]:hover:bg-gray-700 [&_.rdp-caption]:text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Rent - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-rent" className="text-white font-medium text-sm sm:text-base">
                        الإيجار
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="edit-rent"
                          name="rent"
                          type="number"
                          value={editFormData.rent}
                          onChange={handleEditInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="أدخل قيمة الإيجار"
                          required
                        />
                      </div>
                    </div>

                    {/* Expenses - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-expenses" className="text-white font-medium text-sm sm:text-base">
                        المصاريف
                      </Label>
                      <div className="relative">
                        <TrendingDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="edit-expenses"
                          name="expenses"
                          type="number"
                          value={editFormData.expenses}
                          onChange={handleEditInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="أدخل المصاريف"
                          required
                        />
                      </div>
                    </div>

                    {/* Sold - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-sold" className="text-white font-medium text-sm sm:text-base">
                        المباع
                      </Label>
                      <div className="relative">
                        <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="edit-sold"
                          name="sold"
                          type="number"
                          value={editFormData.sold}
                          onChange={handleEditInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="أدخل قيمة المباع"
                          required
                        />
                      </div>
                    </div>

                    {/* Exit Name - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-exitName" className="text-white font-medium text-sm sm:text-base">
                        اسم الخارج
                      </Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="edit-exitName"
                          name="exitName"
                          type="text"
                          value={editFormData.exitName}
                          onChange={handleEditInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="أدخل اسم الخارج"
                          required
                        />
                      </div>
                    </div>

                    {/* Exits - Edit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-exits" className="text-white font-medium text-sm sm:text-base">
                        الخوارج
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="edit-exits"
                          name="exits"
                          type="number"
                          value={editFormData.exits}
                          onChange={handleEditInputChange}
                          className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 h-10 sm:h-12 text-sm sm:text-base"
                          placeholder="أدخل قيمة الخوارج"
                          required
                        />
                      </div>
                    </div>

                    {/* Total Display - Edit */}
                    <div className="space-y-2">
                      <Label className="text-white font-medium text-sm sm:text-base">الإجمالي</Label>
                      <div className="relative">
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <div className={`bg-gray-700 border border-gray-600 rounded-md pr-10 sm:pr-12 py-2 sm:py-3 text-white font-bold text-sm sm:text-base ${calculateEditTotal() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {calculateEditTotal().toFixed(2)} جنيه
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes - Edit */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes" className="text-white font-medium text-sm sm:text-base">
                      ملاحظات (اختياري)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <Textarea
                        id="edit-notes"
                        name="notes"
                        value={editFormData.notes}
                        onChange={handleEditInputChange}
                        className="bg-gray-800 border-gray-600 text-white pr-10 sm:pr-12 focus:border-emerald-500 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                        placeholder="أدخل أي ملاحظات إضافية..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons - Edit */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 hover:from-emerald-700 hover:via-green-800 hover:to-teal-900 text-white font-medium py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                        />
                      ) : (
                        <Save className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      )}
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديل'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base transition-all duration-300"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExhibitionGargaSales;
