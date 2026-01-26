import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  BarChart3,
  FileText,
  Calculator,
  Receipt,
  Store,
  Edit,
  Trash2,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getRolePermissions } from '@/utils/roleUtils';
import { API_BASE_URL } from '@/utils/api';

interface ExhibitionSalesData {
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

interface FormDataType {
  day: string;
  date: string;
  rent: string | number;
  expenses: string | number;
  sold: string | number;
  exitName: string;
  exits: string | number;
  notes?: string;
}

interface ExhibitionSalesProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExhibitionSales: React.FC<ExhibitionSalesProps> = ({
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
    return permissions.canEdit;
  };

  const [formData, setFormData] = useState<FormDataType>({
    day: '',
    date: '',
    rent: '',
    expenses: '',
    sold: '',
    exitName: '',
    exits: '',
    notes: '',
  });
  const [salesData, setSalesData] = useState<ExhibitionSalesData[]>([]);
  const [editingSales, setEditingSales] = useState<ExhibitionSalesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<FormDataType>({
    day: '',
    date: '',
    rent: '',
    expenses: '',
    sold: '',
    exitName: '',
    exits: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteSales, setDeleteSales] = useState<ExhibitionSalesData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Days of the week in Arabic
  const daysOfWeek = [
    { value: 'Sunday', label: 'الأحد' },
    { value: 'Monday', label: 'الإثنين' },
    { value: 'Tuesday', label: 'الثلاثاء' },
    { value: 'Wednesday', label: 'الأربعاء' },
    { value: 'Thursday', label: 'الخميس' },
    { value: 'Friday', label: 'الجمعة' },
    { value: 'Saturday', label: 'السبت' },
  ];

  // Fetch existing sales data
  const fetchSalesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/exhibition-sales`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSalesData(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
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
      fetchSalesData();
    }
  }, [isOpen, fetchSalesData]);

  // Role-based access control
  const permissions = getRolePermissions('مبيعات البلينا معرض الجمهورية');
  
  // Check if user can access this component
 

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Keep numeric fields as strings to allow empty values and proper validation
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.day) {
      toast.error('يرجى اختيار اليوم');
      return;
    }

    if (!formData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (!formData.exitName.trim()) {
      toast.error('يرجى إدخال اسم الخارج');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert string values to numbers or keep "0" as string
      const convertToNumber = (value: string | number): number | string => {
        if (typeof value === 'number') return value;
        if (value === '' || value === null || value === undefined) return 0;
        // Keep explicit "0" input as string
        if (value === '0') return "0";
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const response = await fetch(
        `${API_BASE_URL}/api/exhibition-sales`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            day: formData.day,
            date: formData.date,
            rent: convertToNumber(formData.rent),
            expenses: convertToNumber(formData.expenses),
            sold: convertToNumber(formData.sold),
            exitName: formData.exitName,
            exits: convertToNumber(formData.exits),
            notes: formData.notes,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          day: '',
          date: '',
          rent: '',
          expenses: '',
          sold: '',
          exitName: '',
          exits: '',
          notes: '',
        });
        setSelectedDate(undefined);
        fetchSalesData(); // Refresh the table
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

  // Handle edit sales
  const handleEdit = (sales: ExhibitionSalesData) => {
    setEditingSales(sales);
    setEditFormData({
      day: sales.day,
      date: sales.date,
      rent: sales.rent?.toString() || '',
      expenses: sales.expenses?.toString() || '',
      sold: sales.sold?.toString() || '',
      exitName: sales.exitName,
      exits: sales.exits?.toString() || '',
      notes: sales.notes || '',
    });
    if (sales.date) {
      setEditSelectedDate(new Date(sales.date));
    }
    setEditDialogOpen(true);
  };

  // Handle delete sales
  const handleDelete = (sales: ExhibitionSalesData) => {
    setDeleteSales(sales);
  };

  // Handle actual delete after confirmation
  const handleDeleteSales = async () => {
    if (!deleteSales?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/exhibition-sales/${deleteSales._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        fetchSalesData();
        setDeleteSales(null);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في حذف السجل');
      }
    } catch (error) {
      console.error('Error deleting sales:', error);
      toast.error('فشل في حذف السجل');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Keep numeric fields as strings to allow empty values and proper validation
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit select change
  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.day) {
      toast.error('يرجى اختيار اليوم');
      return;
    }

    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (!editFormData.exitName.trim()) {
      toast.error('يرجى إدخال اسم الخارج');
      return;
    }

    if (!editingSales?._id) return;

    setIsSubmitting(true);
    try {
      // Convert string values to numbers or keep "0" as string
      const convertToNumber = (value: string | number): number | string => {
        if (typeof value === 'number') return value;
        if (value === '' || value === null || value === undefined) return 0;
        // Keep explicit "0" input as string
        if (value === '0') return "0";
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const response = await fetch(
        `${API_BASE_URL}/api/exhibition-sales/${editingSales._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            day: editFormData.day,
            date: editFormData.date,
            rent: convertToNumber(editFormData.rent),
            expenses: convertToNumber(editFormData.expenses),
            sold: convertToNumber(editFormData.sold),
            exitName: editFormData.exitName,
            exits: convertToNumber(editFormData.exits),
            notes: editFormData.notes,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم تحديث السجل بنجاح');
        setEditDialogOpen(false);
        setEditingSales(null);
        fetchSalesData();
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating sales:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحديث السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total for edit form
  const calculateEditTotal = () => {
    const sold = typeof editFormData.sold === 'string' ? parseFloat(editFormData.sold) || 0 : editFormData.sold;
    const rent = typeof editFormData.rent === 'string' ? parseFloat(editFormData.rent) || 0 : editFormData.rent;
    const expenses = typeof editFormData.expenses === 'string' ? parseFloat(editFormData.expenses) || 0 : editFormData.expenses;
    const exits = typeof editFormData.exits === 'string' ? parseFloat(editFormData.exits) || 0 : editFormData.exits;
    
    return sold - rent - expenses - exits;
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

  // Calculate total (sold - rent - expenses - exits)
  const calculateTotal = () => {
    const sold = typeof formData.sold === 'string' ? parseFloat(formData.sold) || 0 : formData.sold;
    const rent = typeof formData.rent === 'string' ? parseFloat(formData.rent) || 0 : formData.rent;
    const expenses = typeof formData.expenses === 'string' ? parseFloat(formData.expenses) || 0 : formData.expenses;
    const exits = typeof formData.exits === 'string' ? parseFloat(formData.exits) || 0 : formData.exits;
    
    return sold - rent - expenses - exits;
  };

  // Get Arabic day name
  const getArabicDay = (englishDay: string) => {
    const day = daysOfWeek.find(d => d.value === englishDay);
    return day ? day.label : englishDay;
  };

  // Calculate net profit for a single sale record
  const calculateSaleNetProfit = (sale: ExhibitionSalesData) => {
    return (sale.sold || 0) - (sale.rent || 0) - (sale.expenses || 0) - (sale.exits || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse text-right">
              <motion.div
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  مبيعات البلينا معرض الجمهوريه
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  إدارة مبيعات المعرض والإيرادات اليومية
                </DialogDescription>
              </div>
            </div>
            <div className="ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
              >
                رجوع
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي السجلات</span>
                  <Store className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {salesData.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المبيعات</span>
                  <TrendingUp className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 text-right">
                  {formatCurrency(
                    salesData.reduce(
                      (total, sale) => total + (sale.sold || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المصروفات</span>
                  <ArrowDownCircle className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 text-right">
                  {formatCurrency(
                    salesData.reduce(
                      (total, sale) => total + (sale.expenses || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">صافي الأرباح</span>
                  <Calculator className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 text-right">
                  {formatCurrency(
                    salesData.reduce(
                      (total, sale) => total + calculateSaleNetProfit(sale),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي الإيجار</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400 text-right">
                  {formatCurrency(
                    salesData.reduce(
                      (total, sale) => total + (sale.rent || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي الخوارج</span>
                  <ArrowUpCircle className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 text-right">
                  {formatCurrency(
                    salesData.reduce(
                      (total, sale) => total + (sale.exits || 0),
                      0,
                    ),
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
                  <span className="ml-2">إضافة سجل مبيعات جديد</span>
                  <Plus className="w-5 h-5 text-purple-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  أدخل بيانات المبيعات اليومية للمعرض
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Day Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
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
                      onValueChange={(value) => handleSelectChange('day', value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-white">
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
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
                    transition={{ duration: 0.3, delay: 0.2 }}
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
                            day: "w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500",
                            day_range_end: "day-range-end",
                            day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white rounded-md",
                            day_today: "bg-gray-700 text-white rounded-md",
                            day_outside: "text-gray-600 opacity-50",
                            day_disabled: "text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent",
                            day_range_middle: "aria-selected:bg-purple-500/30 aria-selected:text-white",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </motion.div>

                  {/* Rent Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="rent"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>الإيجار</span>
                    </Label>
                    <Input
                      id="rent"
                      name="rent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rent}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الإيجار"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right"
                    />
                  </motion.div>

                  {/* Expenses Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label
                      htmlFor="expenses"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>المصاريف</span>
                    </Label>
                    <Input
                      id="expenses"
                      name="expenses"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.expenses}
                      onChange={handleInputChange}
                      placeholder="أدخل المصاريف"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right"
                    />
                  </motion.div>

                  {/* Sold Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label
                      htmlFor="sold"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>المباع</span>
                    </Label>
                    <Input
                      id="sold"
                      name="sold"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sold}
                      onChange={handleInputChange}
                      placeholder="أدخل قيمة المباع"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right"
                    />
                  </motion.div>

                  {/* Exit Name Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Label
                      htmlFor="exitName"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>اسم الخارج</span>
                    </Label>
                    <Input
                      id="exitName"
                      name="exitName"
                      type="text"
                      value={formData.exitName}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الخارج"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Exits Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Label
                      htmlFor="exits"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span>الخوارج</span>
                    </Label>
                    <Input
                      id="exits"
                      name="exits"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.exits}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الخوارج"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right"
                    />
                  </motion.div>

                  {/* Notes Field */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <Label
                      htmlFor="notes"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <FileText className="w-4 h-4" />
                      <span>الملاحظات</span>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أدخل أي ملاحظات إضافية..."
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-purple-500 focus:border-purple-500 text-right min-h-[80px]"
                      rows={3}
                    />
                  </motion.div>

                  {/* Total Display */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 font-semibold text-lg">
                          الإجمالي (المباع - الإيجار - المصاريف - الخوارج):
                        </span>
                        <span className="text-purple-400 font-bold text-xl">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-3 flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
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
                    className="p-2 bg-gradient-to-r from-purple-600 to-pink-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <BarChart3 className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات المبيعات
                  </CardTitle>
                </div>
                <Button
                  onClick={fetchSalesData}
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
                جميع سجلات مبيعات البلينا معرض الجمهوريه
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اليوم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الإيجار
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        المصاريف
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        المباع
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اسم الخارج
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الخوارج
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الإجمالي
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ملاحظات
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
                          colSpan={isAdminRole() ? 10 : 9}
                          className="text-center py-8"
                        >
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : salesData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={isAdminRole() ? 10 : 9}
                          className="text-center py-8 text-gray-400"
                        >
                          لا توجد سجلات متاحة
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.map((sale, index) => (
                        <motion.tr
                          key={sale._id || index}
                          className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="text-gray-300 text-right font-medium">
                            {getArabicDay(sale.day)}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(sale.date)}
                          </TableCell>
                          <TableCell className="text-red-400 text-right">
                            {formatCurrency(sale.rent)}
                          </TableCell>
                          <TableCell className="text-orange-400 text-right">
                            {formatCurrency(sale.expenses)}
                          </TableCell>
                          <TableCell className="text-green-400 text-right">
                            {formatCurrency(sale.sold)}
                          </TableCell>
                          <TableCell className="text-blue-400 text-right">
                            {sale.exitName}
                          </TableCell>
                          <TableCell className="text-yellow-400 text-right">
                            {formatCurrency(sale.exits)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-purple-400 font-semibold">
                              {formatCurrency(calculateSaleNetProfit(sale))}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-right max-w-xs truncate">
                            {sale.notes || '-'}
                          </TableCell>
                          {isAdminRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(sale)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(sale)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1"
                                  disabled={!sale._id}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white text-right text-xl">
              تعديل سجل المبيعات
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل بيانات المبيعات ليوم "{editingSales?.day ? getArabicDay(editingSales.day) : ''}"
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <form
              onSubmit={handleEditSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Day Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-day" className="text-gray-300 text-right">
                  اليوم
                </Label>
                <Select
                  value={editFormData.day}
                  onValueChange={(value) => handleEditSelectChange('day', value)}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white text-right">
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
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
                        day: "w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500",
                        day_range_end: "day-range-end",
                        day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white rounded-md",
                        day_today: "bg-gray-700 text-white rounded-md",
                        day_outside: "text-gray-600 opacity-50",
                        day_disabled: "text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent",
                        day_range_middle: "aria-selected:bg-purple-500/30 aria-selected:text-white",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rent Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-rent" className="text-gray-300 text-right">
                  الإيجار
                </Label>
                <Input
                  id="edit-rent"
                  name="rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.rent}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                />
              </div>

              {/* Expenses Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-expenses"
                  className="text-gray-300 text-right"
                >
                  المصاريف
                </Label>
                <Input
                  id="edit-expenses"
                  name="expenses"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.expenses}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                />
              </div>

              {/* Sold Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-sold" className="text-gray-300 text-right">
                  المباع
                </Label>
                <Input
                  id="edit-sold"
                  name="sold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.sold}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                />
              </div>

              {/* Exit Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-exitName"
                  className="text-gray-300 text-right"
                >
                  اسم الخارج
                </Label>
                <Input
                  id="edit-exitName"
                  name="exitName"
                  type="text"
                  value={editFormData.exitName}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Exits Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-exits" className="text-gray-300 text-right">
                  الخوارج
                </Label>
                <Input
                  id="edit-exits"
                  name="exits"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.exits}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                />
              </div>

              {/* Notes Field */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="edit-notes"
                  className="text-gray-300 text-right"
                >
                  الملاحظات
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Total Display */}
              <div className="md:col-span-2">
                <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-semibold text-lg">
                      الإجمالي:
                    </span>
                    <span className="text-purple-400 font-bold text-xl">
                      {formatCurrency(calculateEditTotal())}
                    </span>
                  </div>
                </div>
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
                  className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white"
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
        open={!!deleteSales}
        onOpenChange={(open) => !open && setDeleteSales(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل مبيعات يوم "{deleteSales?.day ? getArabicDay(deleteSales.day) : ''}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteSales(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSales}
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

export default ExhibitionSales;



