import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building2,
  Calendar,
  User,
  Receipt,
  DollarSign,
  FileText,
  Search
} from 'lucide-react';
import Cookies from 'js-cookie';
import { getRolePermissions } from '@/utils/roleUtils';

interface MerchantRecord {
  _id?: string;
  name: string;
  invoice: number | string;
  payment: number | string;
  date: string;
  notes?: string;
  total?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CenterDelaaHawanemMerchants: React.FC<Props> = ({ isOpen, onClose }) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('حسابات تجار سنتر دلع الهوانم');

  // Check if user can access this component
  useEffect(() => {
    if (isOpen && !permissions.canAccess) {
      toast.error('غير مخول للوصول إلى هذه الصفحة');
      onClose();
      return;
    }
  }, [isOpen, permissions.canAccess, onClose]);

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

  const [formData, setFormData] = useState<MerchantRecord>({
    name: '',
    invoice: '',
    payment: '',
    date: '',
    notes: '',
  });

  const [merchants, setMerchants] = useState<MerchantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete states
  const [editingMerchant, setEditingMerchant] = useState<MerchantRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<MerchantRecord>({
    name: '',
    invoice: '',
    payment: '',
    date: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteMerchant, setDeleteMerchant] = useState<MerchantRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch existing merchants
  const fetchMerchants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setMerchants(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
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
      fetchMerchants();
    }
  }, [isOpen, fetchMerchants]);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  const handleInputChange = (field: keyof MerchantRecord, value: string | number) => {
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

  const calculateTotal = (invoice: number | string, payment: number | string) => {
    const invoiceNum = typeof invoice === 'string' ? (invoice === '0' ? 0 : parseFloat(invoice) || 0) : invoice;
    const paymentNum = typeof payment === 'string' ? (payment === '0' ? 0 : parseFloat(payment) || 0) : payment;
    return invoiceNum - paymentNum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.invoice === '' || formData.payment === '' || !formData.date) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          الاسم: formData.name,
          الفاتوره: formData.invoice,
          دفعه: formData.payment,
          التاريخ: formData.date,
          ملاحظات: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة التاجر بنجاح');
        await fetchMerchants();
        resetForm();
      } else {
        toast.error('فشل في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast.error('حدث خطأ في حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      invoice: '',
      payment: '',
      date: '',
      notes: '',
    });
    setEditingMerchant(null);
    setSelectedDate(undefined);
    setEditSelectedDate(undefined);
  };

  const handleEdit = (merchant: MerchantRecord) => {
    setEditingMerchant(merchant);
    setEditFormData({ ...merchant });
    setEditDialogOpen(true);
    if (merchant.date) {
      setEditSelectedDate(new Date(merchant.date));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant || !editingMerchant.name) return;

    try {
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant/${encodeURIComponent(editingMerchant.name)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          الاسم: editFormData.name,
          الفاتوره: editFormData.invoice,
          دفعه: editFormData.payment,
          التاريخ: editFormData.date,
          ملاحظات: editFormData.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث البيانات بنجاح');
        setEditDialogOpen(false);
        setEditingMerchant(null);
        setEditSelectedDate(undefined);
        fetchMerchants();
      } else {
        toast.error('فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handleDelete = async () => {
    if (!deleteMerchant?.name) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant/${encodeURIComponent(deleteMerchant.name)}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast.success('تم حذف التاجر بنجاح');
        await fetchMerchants();
        setDeleteMerchant(null);
      } else {
        toast.error('فشل في حذف التاجر');
      }
    } catch (error) {
      console.error('Error deleting merchant:', error);
      toast.error('حدث خطأ في حذف التاجر');
    }
  };

  // Filter merchants based on search query
  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border border-gray-700/50 w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden backdrop-blur-xl"
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
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
          <motion.div
            className="bg-gradient-to-r from-pink-600 via-rose-700 to-fuchsia-800 rounded-t-3xl shadow-lg relative overflow-hidden p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                <h2 className="text-2xl font-bold">حسابات تجار سنتر دلع الهوانم</h2>
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
            <p className="text-pink-100 text-sm mt-2 relative z-10">إدارة حسابات التجار وفواتيرهم</p>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-h-0 flex flex-col p-6 relative z-10">
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
                        اسم التاجر
                      </Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 h-8 text-xs backdrop-blur-sm pr-8"
                          placeholder="أدخل اسم التاجر"
                          required
                        />
                      </div>
                    </div>

                    {/* Invoice */}
                    <div className="space-y-1">
                      <Label htmlFor="invoice" className="text-white font-medium text-xs">
                        الفاتورة (جنيه)
                      </Label>
                      <div className="relative">
                        <Receipt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <Input
                          id="invoice"
                          type="number"
                          value={formData.invoice}
                          onChange={(e) => handleInputChange('invoice', convertToNumber(e.target.value))}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 h-8 text-xs backdrop-blur-sm pr-8"
                          placeholder="أدخل المبلغ"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="space-y-1">
                      <Label htmlFor="payment" className="text-white font-medium text-xs">
                        الدفعة (جنيه)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <Input
                          id="payment"
                          type="number"
                          value={formData.payment}
                          onChange={(e) => handleInputChange('payment', convertToNumber(e.target.value))}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 h-8 text-xs backdrop-blur-sm pr-8"
                          placeholder="أدخل المبلغ"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
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
                  </div>

                  {/* Total Display */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 mt-2">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-medium">الإجمالي:</span>
                      <span className={`text-sm font-bold ${calculateTotal(formData.invoice, formData.payment) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {calculateTotal(formData.invoice, formData.payment).toFixed(2)} جنيه
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-white font-medium text-xs">
                      ملاحظات (اختياري)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-3 text-gray-400 w-3 h-3" />
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 text-xs backdrop-blur-sm pr-8 min-h-[60px]"
                        placeholder="أدخل أي ملاحظات..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-2 space-x-reverse pt-2">
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
                      إضافة
                    </Button>
                  </div>
                </form>
              </div>

              {/* Table Section */}
              <div className="mt-2">
                <Card className="bg-gray-800/40 border-gray-700/30 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                      <h3 className="text-sm font-bold text-white">سجلات التجار</h3>
                      <span className="text-gray-400 text-xs">
                        إجمالي السجلات: {merchants.length}
                      </span>
                    </div>

                    {/* Search Input */}
                    <motion.div
                      className="mb-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative max-w-md ml-auto">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="البحث بالاسم..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 text-right pr-10 rounded-xl h-8 text-xs"
                        />
                        {searchQuery && (
                          <motion.div
                            className="absolute inset-y-0 left-0 flex items-center pl-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearchQuery('')}
                              className="h-auto p-1 text-gray-400 hover:text-gray-300"
                            >
                              ×
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      {searchQuery && (
                        <motion.p
                          className="text-xs text-gray-400 mt-1 text-right"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {filteredMerchants.length} نتيجة من أصل {merchants.length} سجل
                        </motion.p>
                      )}
                    </motion.div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full"
                        />
                        <span className="text-white mr-3 text-sm">جاري تحميل البيانات...</span>
                      </div>
                    ) : filteredMerchants.length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-base">
                          {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد سجلات تجار'}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {searchQuery ? 'جرب كلمة بحث أخرى' : 'قم بإضافة تجار جدد للبدء'}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="w-full">
                          <div className="rounded-lg border border-gray-700/30 backdrop-blur-sm">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">اسم التاجر</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">الفاتورة</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">الدفعة</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">الإجمالي</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">التاريخ</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-right text-xs px-1 py-1 whitespace-nowrap">ملاحظات</TableHead>
                                  <TableHead className="text-gray-300 font-semibold text-center text-xs px-1 py-1 whitespace-nowrap">الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredMerchants.map((merchant, index) => (
                                  <TableRow key={merchant._id || index} className="border-gray-700/30 hover:bg-gray-800/30">
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{merchant.name}</TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{merchant.invoice} جنيه</TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">{merchant.payment} جنيه</TableCell>
                                    <TableCell className={`text-xs px-1 py-1 whitespace-nowrap font-bold ${calculateTotal(merchant.invoice, merchant.payment) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {calculateTotal(merchant.invoice, merchant.payment).toFixed(2)} جنيه
                                    </TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 whitespace-nowrap">
                                      {format(new Date(merchant.date), 'dd/MM/yyyy', { locale: ar })}
                                    </TableCell>
                                    <TableCell className="text-white text-xs px-1 py-1 max-w-[80px] truncate">
                                      {merchant.notes || '-'}
                                    </TableCell>
                                    <TableCell className="text-center px-1 py-1 whitespace-nowrap">
                                      {permissions.canEdit && permissions.canDelete ? (
                                        <div className="flex justify-center space-x-1 space-x-reverse">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(merchant)}
                                            className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 p-1 h-6 w-6 backdrop-blur-sm"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeleteMerchant(merchant)}
                                            className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 p-1 h-6 w-6 backdrop-blur-sm"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <span className="text-gray-500 text-xs">غير مسموح</span>
                                      )}
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
              <DialogTitle className="text-white text-lg">تعديل بيانات التاجر</DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                تعديل معلومات التاجر: {editingMerchant?.name}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white font-medium">
                    اسم التاجر
                  </Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm"
                    placeholder="أدخل اسم التاجر"
                    required
                  />
                </div>

                {/* Invoice */}
                <div className="space-y-2">
                  <Label htmlFor="edit-invoice" className="text-white font-medium">
                    الفاتورة (جنيه)
                  </Label>
                  <Input
                    id="edit-invoice"
                    type="number"
                    value={editFormData.invoice}
                    onChange={(e) => handleInputChange('invoice', convertToNumber(e.target.value))}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm"
                    placeholder="أدخل المبلغ"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Payment */}
                <div className="space-y-2">
                  <Label htmlFor="edit-payment" className="text-white font-medium">
                    الدفعة (جنيه)
                  </Label>
                  <Input
                    id="edit-payment"
                    type="number"
                    value={editFormData.payment}
                    onChange={(e) => handleInputChange('payment', convertToNumber(e.target.value))}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm"
                    placeholder="أدخل المبلغ"
                    min="0"
                    step="0.01"
                    required
                  />
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
              </div>

              {/* Total Display */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">الإجمالي:</span>
                  <span className={`text-lg font-bold ${calculateTotal(editFormData.invoice, editFormData.payment) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calculateTotal(editFormData.invoice, editFormData.payment).toFixed(2)} جنيه
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-white font-medium">
                  ملاحظات (اختياري)
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 backdrop-blur-sm min-h-[80px]"
                  placeholder="أدخل أي ملاحظات..."
                />
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
        <AlertDialog open={!!deleteMerchant} onOpenChange={() => setDeleteMerchant(null)}>
          <AlertDialogContent className="bg-gray-900/95 border-gray-700 w-[90vw] max-w-md backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-base">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-sm">
                هل أنت متأكد من حذف التاجر "{deleteMerchant?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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

export default CenterDelaaHawanemMerchants;
