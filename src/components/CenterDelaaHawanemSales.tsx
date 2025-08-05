import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRolePermissions } from '@/utils/roleUtils';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  BarChart3,
  Calendar,
  Store,
  TrendingUp,
  Receipt,
  Calculator,
  DollarSign,
  ArrowUpCircle,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterDelaaHawanemSalesProps {
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

const CenterDelaaHawanemSales: React.FC<CenterDelaaHawanemSalesProps> = ({
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

      console.log('Fetching sales from:', 'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-sales'); // Debug log

      const response = await fetch('https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-sales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch sales:', response, errorData);
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Fetched sales data:', data); // Debug log
      
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
        day: formData.day,
        date: format(date, 'yyyy-MM-dd'),
        rent: convertToNumber(formData.rent),
        expenses: convertToNumber(formData.expenses),
        sold: convertToNumber(formData.sold),
        exitName: formData.exitName,
        exits: convertToNumber(formData.exits),
        notes: formData.notes,
        total: calculateTotal(formData),
      };

      console.log('Submitting sales data:', submitData); // Debug log

      const url = editingSale 
        ? `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-sales/${editingSale._id}`
        : 'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-sales';
      
      const method = editingSale ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('Sales response data:', responseData); // Debug log

      if (!response.ok) {
        console.error('Server error:', responseData);
        throw new Error(responseData.message || 'فشل في حفظ البيانات');
      }

      toast.success(editingSale ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      resetForm();
      
      // Add a small delay before fetching to ensure server has processed the request
      setTimeout(() => {
        fetchSales();
      }, 100);
    } catch (error) {
      console.error('Error saving sale:', error);
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
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-sales/${deleteSaleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في حذف البيانات');
      }

      toast.success('تم الحذف بنجاح');
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

  const handleBack = () => {
    resetForm();
  };

  useEffect(() => {
    if (isOpen && !showForm) {
      fetchSales();
    }
  }, [isOpen, showForm, fetchSales]);

  // Role-based access control
  const permissions = getRolePermissions('مبيعات سنتر دلع الهوانم');
  
  // Calculate net profit for a single sale record
  const calculateSaleNetProfit = (sale: SalesData) => {
    return (sale.sold || 0) - (sale.rent || 0) - (sale.expenses || 0) - (sale.exits || 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-pink-500/20 flex flex-col">
        <DialogHeader className="border-b border-pink-500/20 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-l from-pink-500/20 to-purple-500/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {showForm ? `${editingSale ? 'تعديل' : 'إضافة'} مبيعات سنتر دلع الهوانم` : 'مبيعات سنتر دلع الهوانم'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {showForm ? 'إدارة بيانات المبيعات اليومية' : 'عرض وإدارة المبيعات'}
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

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 sm:p-6"
              >
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        اليوم <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.day}
                        onChange={(e) => handleInputChange('day', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل اليوم"
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
                            className="w-full justify-start text-right bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 hover:border-pink-500/50"
                          >
                            <Calendar className="ml-2 h-4 w-4 text-pink-400" />
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
                              day_selected: "bg-pink-600 text-white hover:bg-pink-700 focus:bg-pink-600",
                              day_today: "bg-pink-100 text-pink-900 font-bold",
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
                        الايجار <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.rent}
                        onChange={(e) => handleInputChange('rent', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل قيمة الايجار"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        المصاريف <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.expenses}
                        onChange={(e) => handleInputChange('expenses', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل قيمة المصاريف"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        المباع <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.sold}
                        onChange={(e) => handleInputChange('sold', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل قيمة المباع"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        اسم الخارج <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.exitName}
                        onChange={(e) => handleInputChange('exitName', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل اسم الخارج"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        الخوارج <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.exits}
                        onChange={(e) => handleInputChange('exits', e.target.value)}
                        required
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل قيمة الخوارج"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white font-medium">ملاحظات</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل ملاحظات إضافية..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white font-medium">صافي الربح</Label>
                      <div className="p-4 bg-gradient-to-l from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/20">
                        <span className="text-2xl font-bold text-pink-300">
                          {formData.total.toFixed(2)} جنيه
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                          المباع - الايجار - المصاريف - الخوارج
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-700/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 w-full sm:w-auto"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-8 w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Plus className="ml-2 h-4 w-4" />
                          {editingSale ? 'تحديث' : 'إضافة'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="sales"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">إجمالي السجلات</span>
                        <Store className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-blue-400 text-right">
                        {sales.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">إجمالي المبيعات</span>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-green-400 text-right">
                        {formatCurrency(
                          sales.reduce(
                            (total, sale) => total + (sale.sold || 0),
                            0,
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">إجمالي المصروفات</span>
                        <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-red-400 text-right">
                        {formatCurrency(
                          sales.reduce(
                            (total, sale) => total + (sale.expenses || 0),
                            0,
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">صافي الأرباح</span>
                        <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-purple-400 text-right">
                        {formatCurrency(
                          sales.reduce(
                            (total, sale) => total + calculateSaleNetProfit(sale),
                            0,
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">إجمالي الإيجار</span>
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-orange-400 text-right">
                        {formatCurrency(
                          sales.reduce(
                            (total, sale) => total + (sale.rent || 0),
                            0,
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/40 border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-right flex items-center justify-end text-xs sm:text-sm">
                        <span className="ml-2">إجمالي الخوارج</span>
                        <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-xl font-bold text-yellow-400 text-right">
                        {formatCurrency(
                          sales.reduce(
                            (total, sale) => total + (sale.exits || 0),
                            0,
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="my-6 bg-gray-700/50" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                  <h3 className="text-xl font-semibold text-white">قائمة المبيعات</h3>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => {
                        console.log('Manual refresh triggered for sales');
                        fetchSales();
                      }}
                      variant="outline"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 w-full sm:w-auto"
                    >
                      <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      تحديث ({sales.length})
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white w-full sm:w-auto"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة جديد
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/80">
                        <TableHead className="text-gray-300 font-semibold text-right">اليوم</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">التاريخ</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">الايجار</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">المصاريف</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">المباع</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">اسم الخارج</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">الخوارج</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">صافي الربح</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow
                          key={sale._id}
                          className="bg-gray-900/50 border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                        >
                          <TableCell className="text-gray-300 text-right">{sale.day}</TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {format(new Date(sale.date), 'yyyy-MM-dd', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">{sale.rent} جنيه</TableCell>
                          <TableCell className="text-gray-300 text-right">{sale.expenses} جنيه</TableCell>
                          <TableCell className="text-gray-300 text-right">{sale.sold} جنيه</TableCell>
                          <TableCell className="text-gray-300 text-right">{sale.exitName}</TableCell>
                          <TableCell className="text-gray-300 text-right">{sale.exits} جنيه</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${calculateSaleNetProfit(sale) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(calculateSaleNetProfit(sale))}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              {permissions.canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(sale)}
                                  className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {permissions.canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteSaleId(sale._id)}
                                  className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {sales.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400">
                      لا توجد مبيعات متاحة
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteSaleId} onOpenChange={() => setDeleteSaleId(null)}>
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

export default CenterDelaaHawanemSales;
