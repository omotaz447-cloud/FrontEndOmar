import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRolePermissions } from '@/utils/roleUtils';
import { API_BASE_URL } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search,
  Filter,
  RotateCcw,
  Clock,
  UserCheck,
  UserX,
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
  // Attendance fields
  attendanceStatus?: 'present' | 'absent' | 'late' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
  attendanceNotes?: string;
}

// Attendance record interface
interface AttendanceRecord {
  _id: string;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedName, setSelectedName] = useState('');

  // Attendance states
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedMerchantForAttendance, setSelectedMerchantForAttendance] = useState<MerchantAccountData | null>(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

  // Months array for filtering
  const months = [
    { value: '01', label: 'يناير' },
    { value: '02', label: 'فبراير' },
    { value: '03', label: 'مارس' },
    { value: '04', label: 'أبريل' },
    { value: '05', label: 'مايو' },
    { value: '06', label: 'يونيو' },
    { value: '07', label: 'يوليو' },
    { value: '08', label: 'أغسطس' },
    { value: '09', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' },
  ];

  // Generate years for filtering (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const calculateTotal = (data: FormData) => {
    const invoice = parseFloat(data.invoice) || 0;
    const payment = parseFloat(data.payment) || 0;
    
    // الفاتوره - الدفعه
    return invoice - payment;
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedName('');
  };

  // Apply filters to merchants
  const accountsToDisplay = accounts.filter((account) => {
    // Date filtering
    if (
      (selectedMonth && selectedMonth !== 'all') ||
      selectedYear !== new Date().getFullYear().toString()
    ) {
      const accountDate = new Date(account.date);
      const accountMonth = (accountDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const accountYear = accountDate.getFullYear().toString();
      if (
        selectedMonth &&
        selectedMonth !== 'all' &&
        accountMonth !== selectedMonth
      ) {
        return false;
      }
      if (
        selectedYear !== new Date().getFullYear().toString() &&
        accountYear !== selectedYear
      ) {
        return false;
      }
    }
    // Name filtering
    if (
      selectedName &&
      !account.name.toLowerCase().includes(selectedName.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter accounts based on search query AND filters
  const filteredAccounts = accountsToDisplay.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Attendance utility functions
  const loadAttendanceData = (): AttendanceRecord[] => {
    try {
      const cookieData = Cookies.get('attendanceData');
      if (cookieData) {
        return JSON.parse(cookieData);
      }
      
      const localData = localStorage.getItem('attendanceData');
      if (localData) {
        return JSON.parse(localData);
      }
      
      return [];
    } catch (error) {
      console.error('Error loading attendance data:', error);
      return [];
    }
  };

  const saveAttendanceData = (attendanceData: AttendanceRecord[]) => {
    try {
      const dataString = JSON.stringify(attendanceData);
      // Save to cookies (primary storage)
      Cookies.set('attendanceData', dataString, { expires: 365 });
      // Save to localStorage (backup)
      localStorage.setItem('attendanceData', dataString);
    } catch (error) {
      console.error('Error saving attendance data:', error);
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    
    if (checkOutTime <= checkInTime) return 0;
    
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  };

  const handleMarkAttendance = (account: MerchantAccountData) => {
    setSelectedMerchantForAttendance(account);
    
    // Check if attendance already exists for this merchant and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) => record.employeeName === account.name && record.date === account.date
    );

    if (existing) {
      // Pre-fill form with existing data
      setAttendanceFormData({
        status: existing.status,
        checkInTime: existing.checkInTime || '',
        checkOutTime: existing.checkOutTime || '',
        notes: existing.notes || '',
      });
    } else {
      // New attendance record
      setAttendanceFormData({
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        notes: '',
      });
    }
    
    setShowAttendanceDialog(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedMerchantForAttendance) return;

    try {
      const workingHours = attendanceFormData.checkInTime && attendanceFormData.checkOutTime
        ? calculateWorkingHours(attendanceFormData.checkInTime, attendanceFormData.checkOutTime)
        : 0;

      // Create attendance record
      const attendanceRecord: AttendanceRecord = {
        _id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeName: selectedMerchantForAttendance.name,
        date: selectedMerchantForAttendance.date,
        checkInTime: attendanceFormData.checkInTime,
        checkOutTime: attendanceFormData.checkOutTime,
        status: attendanceFormData.status,
        workingHours: workingHours,
        notes: attendanceFormData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Load existing attendance data
      const existingAttendance = loadAttendanceData();
      
      // Remove any existing records for this employee and date to prevent duplicates
      const filteredAttendance = existingAttendance.filter(
        (record: AttendanceRecord) => !(record.employeeName === selectedMerchantForAttendance.name && record.date === selectedMerchantForAttendance.date)
      );
      
      // Add the new/updated record
      const updatedAttendance = [...filteredAttendance, attendanceRecord];
      
      toast.success(existingAttendance.length !== filteredAttendance.length ? 'تم التحديث بنجاح' : 'تم التسجيل بنجاح');

      // Save to cookies and localStorage
      saveAttendanceData(updatedAttendance);

      // Update the merchant's attendance status in the local state
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.name === selectedMerchantForAttendance.name && acc.date === selectedMerchantForAttendance.date
            ? { ...acc, attendanceStatus: attendanceFormData.status }
            : acc
        )
      );

      setShowAttendanceDialog(false);
      setSelectedMerchantForAttendance(null);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('حدث خطأ في حفظ الحضور');
    }
  };

  const getAttendanceStatusBadge = (status?: string, onClick?: () => void) => {
    if (!status) {
      // Return a default badge for "No Status" that's clickable
      return (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 bg-gray-500/20 text-gray-400 border-gray-500/50 border text-xs cursor-pointer hover:bg-gray-500/30 transition-colors"
          onClick={onClick}
        >
          <Clock className="w-3 h-3" />
          لم يحدد
        </Badge>
      );
    }
    
    const configs = {
      present: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', label: 'حاضر', icon: UserCheck },
      absent: { color: 'bg-red-500/20 text-red-300 border-red-500/50', label: 'غائب', icon: UserX },
      late: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/50', label: 'متأخر', icon: Clock },
      'half-day': { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', label: 'نصف يوم', icon: Clock },
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${config.color} border text-xs ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={onClick}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      console.log('...', `${API_BASE_URL}/api/center-seima-merchant`); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/center-seima-merchant`, {
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
        ? `${API_BASE_URL}/api/center-seima-merchant/${editingAccount._id}`
        : `${API_BASE_URL}/api/center-seima-merchant`;
      
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
      const response = await fetch(`${API_BASE_URL}/api/center-seima-merchant/${deleteAccountId}`, {
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

  // Role-based access control
  const permissions = getRolePermissions('حساب تجار سنتر سيما');
  
  // Check if user can access this component
 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-purple-500/20 flex flex-col">
        <DialogHeader className="border-b border-purple-500/20 pb-4 flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 h-full overflow-y-auto"
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
                className="p-6 space-y-6 h-full overflow-y-auto"
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
                      تحديث ({filteredAccounts.length})
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

                {/* Filter Section */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="البحث بالاسم..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 text-right pr-10 rounded-xl h-11"
                      />
                      {searchQuery && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="h-auto p-1 text-gray-400 hover:text-gray-300"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Filter Toggle and Stats */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500 hover:text-purple-300 transition-all duration-300 backdrop-blur-sm px-3 h-9 shadow-lg"
                      >
                        <Filter className="w-4 h-4 ml-2" />
                        فلترة
                      </Button>
                      <span className="text-gray-400 text-sm">
                        إجمالي السجلات:{' '}
                        <span className="text-white font-medium">
                          {filteredAccounts.length}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="pt-4 border-t border-gray-600/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Name Filter */}
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm font-medium">
                            اسم التاجر
                          </Label>
                          <Input
                            type="text"
                            placeholder="ابحث بالاسم..."
                            value={selectedName}
                            onChange={(e) => setSelectedName(e.target.value)}
                            className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 h-10"
                          />
                        </div>

                        {/* Month Filter */}
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm font-medium">
                            الشهر
                          </Label>
                          <Select
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white h-10">
                              <SelectValue placeholder="اختر الشهر" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="all" className="text-white hover:bg-gray-700">
                                جميع الشهور
                              </SelectItem>
                              {months.map((month) => (
                                <SelectItem
                                  key={month.value}
                                  value={month.value}
                                  className="text-white hover:bg-gray-700"
                                >
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Year Filter */}
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm font-medium">
                            السنة
                          </Label>
                          <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white h-10">
                              <SelectValue placeholder="اختر السنة" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {years.map((year) => (
                                <SelectItem
                                  key={year}
                                  value={year}
                                  className="text-white hover:bg-gray-700"
                                >
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Clear Filters */}
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm font-medium opacity-0">
                            إجراءات
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={clearFilters}
                            className="w-full border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 backdrop-blur-sm h-10 shadow-lg"
                          >
                            <RotateCcw className="w-4 h-4 ml-2" />
                            مسح الفلاتر
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Info */}
                  {(searchQuery || selectedName || (selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString()) && (
                    <div className="text-sm text-gray-400 mt-3 text-right border-t border-gray-600/30 pt-3">
                      <div className="flex items-center justify-between">
                        <span>
                          {filteredAccounts.length} نتيجة من أصل{' '}
                          {accounts.length} سجل
                        </span>
                        {((selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString() || selectedName) && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">الفلاتر النشطة:</span>
                            {selectedName && (
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 px-2 py-1">
                                الاسم: {selectedName}
                              </Badge>
                            )}
                            {selectedMonth && selectedMonth !== 'all' && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50 px-2 py-1">
                                {months.find(m => m.value === selectedMonth)?.label}
                              </Badge>
                            )}
                            {selectedYear !== new Date().getFullYear().toString() && (
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/50 px-2 py-1">
                                {selectedYear}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                        <TableHead className="text-gray-300 font-semibold text-center">حالة الحضور</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
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
                            {getAttendanceStatusBadge(account.attendanceStatus, () => handleMarkAttendance(account))}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              {permissions.canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                  className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {permissions.canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteAccountId(account._id)}
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

                  {filteredAccounts.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400">
                      {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد حسابات متاحة'}
                    </div>
                  )}
                </div>

                {/* Totals Summary */}
                {filteredAccounts.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <motion.div
                        className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-violet-500/20"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Wallet className="w-4 h-4 text-purple-400" />
                      </motion.div>
                      ملخص الإحصائيات المالية
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Merchants */}
                      <div className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-300 text-sm font-medium">إجمالي التجار</p>
                            <p className="text-white text-2xl font-bold">
                              {filteredAccounts.length}
                            </p>
                          </div>
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Wallet className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                      </div>

                      {/* Total Invoices */}
                      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm font-medium">إجمالي الفواتير</p>
                            <p className="text-white text-2xl font-bold">
                              {filteredAccounts.reduce((sum, account) => sum + account.invoice, 0).toLocaleString()} جنيه
                            </p>
                          </div>
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-blue-400" />
                          </div>
                        </div>
                      </div>

                      {/* Total Payments */}
                      <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-300 text-sm font-medium">إجمالي الدفعات</p>
                            <p className="text-white text-2xl font-bold">
                              {filteredAccounts.reduce((sum, account) => sum + account.payment, 0).toLocaleString()} جنيه
                            </p>
                          </div>
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                          </div>
                        </div>
                      </div>

                      {/* Total Remaining */}
                      <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-300 text-sm font-medium">إجمالي المتبقي</p>
                            <p className={`text-2xl font-bold ${filteredAccounts.reduce((sum, account) => sum + account.total, 0) >= 0 ? 'text-white' : 'text-red-400'}`}>
                              {filteredAccounts.reduce((sum, account) => sum + account.total, 0).toLocaleString()} جنيه
                            </p>
                          </div>
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            <UserCheck className="w-5 h-5 text-amber-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Attendance Breakdown */}
                    <div className="mt-6 pt-4 border-t border-gray-600/30">
                      <h5 className="text-md font-medium text-gray-300 mb-3">تفصيل الحضور</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                          <span className="text-emerald-300 text-sm">حاضر</span>
                          <span className="text-white font-semibold">
                            {filteredAccounts.filter(account => account.attendanceStatus === 'present').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          <span className="text-red-300 text-sm">غائب</span>
                          <span className="text-white font-semibold">
                            {filteredAccounts.filter(account => account.attendanceStatus === 'absent').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                          <span className="text-amber-300 text-sm">متأخر</span>
                          <span className="text-white font-semibold">
                            {filteredAccounts.filter(account => account.attendanceStatus === 'late').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-500/10 border border-gray-500/20 rounded-lg px-3 py-2">
                          <span className="text-gray-300 text-sm">لم يحدد</span>
                          <span className="text-white font-semibold">
                            {filteredAccounts.filter(account => !account.attendanceStatus).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attendance Dialog */}
        <Dialog
          open={showAttendanceDialog}
          onOpenChange={setShowAttendanceDialog}
        >
          <DialogContent className="bg-gray-900/95 border-gray-700 w-[95vw] sm:w-[90vw] max-w-md backdrop-blur-xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-6 border-b border-gray-700/50 flex-shrink-0">
              <DialogTitle className="text-white text-xl font-semibold">
                تسجيل الحضور
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                تسجيل حضور التاجر:{' '}
                <span className="text-purple-400 font-medium">
                  {selectedMerchantForAttendance?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6 overflow-y-auto flex-1 min-h-0">
              {/* Status Selection */}
              <div className="space-y-3">
                <Label className="text-gray-300 font-medium">حالة الحضور</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'present', label: 'حاضر', color: 'emerald' },
                    { value: 'absent', label: 'غائب', color: 'red' },
                    { value: 'late', label: 'متأخر', color: 'amber' },
                    { value: 'half-day', label: 'نصف يوم', color: 'cyan' },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      type="button"
                      variant={attendanceFormData.status === status.value ? "default" : "outline"}
                      onClick={() => setAttendanceFormData(prev => ({ ...prev, status: status.value as 'present' | 'absent' | 'late' | 'half-day' }))}
                      className={`h-12 ${
                        attendanceFormData.status === status.value
                          ? `bg-${status.color}-600 hover:bg-${status.color}-700 text-white border-${status.color}-500`
                          : `border-${status.color}-600/50 text-${status.color}-400 hover:bg-${status.color}-600/20 hover:border-${status.color}-500 hover:text-${status.color}-300`
                      } transition-all duration-300`}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Inputs - Only show for present/late/half-day */}
              {attendanceFormData.status !== 'absent' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">وقت الدخول</Label>
                    <Input
                      type="time"
                      value={attendanceFormData.checkInTime}
                      onChange={(e) => setAttendanceFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-400 focus:ring-purple-400/20 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">وقت الخروج</Label>
                    <Input
                      type="time"
                      value={attendanceFormData.checkOutTime}
                      onChange={(e) => setAttendanceFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-400 focus:ring-purple-400/20 h-11"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">ملاحظات (اختياري)</Label>
                <Input
                  value={attendanceFormData.notes}
                  onChange={(e) => setAttendanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-11"
                  placeholder="أدخل أي ملاحظات..."
                />
              </div>

              {/* Working Hours Display */}
              {attendanceFormData.checkInTime && attendanceFormData.checkOutTime && attendanceFormData.status !== 'absent' && (
                <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <div className="text-gray-300 text-sm">
                    عدد ساعات العمل: 
                    <span className="text-purple-400 font-semibold ml-2">
                      {calculateWorkingHours(attendanceFormData.checkInTime, attendanceFormData.checkOutTime)} ساعة
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-700/50 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white px-6 h-11"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSaveAttendance}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 h-11"
              >
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
            <AlertDialogHeader className="flex-shrink-0">
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Content area if needed */}
            </div>
            <AlertDialogFooter className="flex-shrink-0">
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
