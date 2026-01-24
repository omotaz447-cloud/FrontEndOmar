import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  DialogFooter,
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
  Search,
  Filter,
  RotateCcw,
  Clock,
  UserCheck,
  UserX,
  DollarSign,
  Calculator,
  TrendingUp,
  TrendingDown,
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
  const [editingMerchant, setEditingMerchant] = useState<MerchantData | null>(
    null,
  );
  const [deleteMerchantId, setDeleteMerchantId] = useState<string | null>(null);
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
  const [selectedMerchantForAttendance, setSelectedMerchantForAttendance] =
    useState<MerchantData | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<
    'present' | 'absent' | 'late' | 'half-day'
  >('present');
  const [attendanceDate, setAttendanceDate] = useState<Date | undefined>(
    new Date(),
  );
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

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
  const merchantsToDisplay = merchants.filter((merchant) => {
    // Date filtering
    if (
      (selectedMonth && selectedMonth !== 'all') ||
      selectedYear !== new Date().getFullYear().toString()
    ) {
      const merchantDate = new Date(merchant.date);
      const merchantMonth = (merchantDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const merchantYear = merchantDate.getFullYear().toString();
      if (
        selectedMonth &&
        selectedMonth !== 'all' &&
        merchantMonth !== selectedMonth
      ) {
        return false;
      }
      if (
        selectedYear !== new Date().getFullYear().toString() &&
        merchantYear !== selectedYear
      ) {
        return false;
      }
    }
    // Name filtering
    if (
      selectedName &&
      !merchant.name.toLowerCase().includes(selectedName.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter merchants based on search query AND filters
  const filteredMerchants = merchantsToDisplay.filter((merchant) =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Attendance utility functions
  const loadAttendanceData = (): AttendanceRecord[] => {
    try {
      const cookieData = Cookies.get('centerGazaMerchantsAttendanceData');
      if (cookieData) {
        return JSON.parse(cookieData);
      }

      const localData = localStorage.getItem(
        'centerGazaMerchantsAttendanceData',
      );
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
      Cookies.set('centerGazaMerchantsAttendanceData', dataString, {
        expires: 365,
      });
      // Save to localStorage (backup)
      localStorage.setItem('centerGazaMerchantsAttendanceData', dataString);
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

  const handleMarkAttendance = (merchant: MerchantData) => {
    setSelectedMerchantForAttendance(merchant);

    // Check if attendance already exists for this merchant and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) =>
        record.employeeName === merchant.name && record.date === merchant.date,
    );

    if (existing) {
      // Pre-fill form with existing data
      setAttendanceStatus(existing.status);
      setTimeIn(existing.checkInTime || '');
      setTimeOut(existing.checkOutTime || '');
      setAttendanceNotes(existing.notes || '');
    } else {
      // New attendance record
      setAttendanceStatus('present');
      setTimeIn('');
      setTimeOut('');
      setAttendanceNotes('');
    }

    setAttendanceDate(new Date(merchant.date));
    setShowAttendanceDialog(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedMerchantForAttendance || !attendanceDate) return;

    try {
      const workingHours =
        timeIn && timeOut ? calculateWorkingHours(timeIn, timeOut) : 0;

      // Create attendance record
      const attendanceRecord: AttendanceRecord = {
        _id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeName: selectedMerchantForAttendance.name,
        date: format(attendanceDate, 'yyyy-MM-dd'),
        checkInTime: timeIn,
        checkOutTime: timeOut,
        status: attendanceStatus,
        workingHours: workingHours,
        notes: attendanceNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Load existing attendance data
      const existingAttendance = loadAttendanceData();

      // Remove any existing records for this employee and date to prevent duplicates
      const filteredAttendance = existingAttendance.filter(
        (record: AttendanceRecord) =>
          !(
            record.employeeName === selectedMerchantForAttendance.name &&
            record.date === format(attendanceDate, 'yyyy-MM-dd')
          ),
      );

      // Add the new/updated record
      const updatedAttendance = [...filteredAttendance, attendanceRecord];

      toast.success(
        existingAttendance.length !== filteredAttendance.length
          ? 'تم تحديث الحضور بنجاح'
          : 'تم تسجيل الحضور بنجاح',
      );

      // Save to cookies and localStorage
      saveAttendanceData(updatedAttendance);

      // Update the merchant's attendance status in the local state
      setMerchants((prevMerchants) =>
        prevMerchants.map((merchant) =>
          merchant.name === selectedMerchantForAttendance.name &&
          merchant.date === format(attendanceDate, 'yyyy-MM-dd')
            ? { ...merchant, attendanceStatus: attendanceStatus }
            : merchant,
        ),
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
      present: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        label: 'حاضر',
        icon: UserCheck,
      },
      absent: {
        color: 'bg-red-500/20 text-red-300 border-red-500/50',
        label: 'غائب',
        icon: UserX,
      },
      late: {
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        label: 'متأخر',
        icon: Clock,
      },
      'half-day': {
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
        label: 'نصف يوم',
        icon: Clock,
      },
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

  // Calculate totals for the filtered merchants
  const totals = filteredMerchants.reduce(
    (acc, merchant) => {
      acc.totalInvoices += merchant.invoice;
      acc.totalPayments += merchant.payment;
      acc.totalBalance += merchant.total;
      return acc;
    },
    { totalInvoices: 0, totalPayments: 0, totalBalance: 0 },
  );

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');

      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/center-gaza-sales',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

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
    setFormData((prev) => ({ ...prev, total }));
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
        if (value === '0') return '0';
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حفظ البيانات');
      }

      toast.success(
        editingMerchant ? 'تم تحديث البيانات بنجاح' : 'تم إضافة التاجر بنجاح',
      );

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

      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/center-gaza-sales/${deleteMerchantId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

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
      <DialogContent className="max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة تاجر جديد
              </Button>
              <Button
                onClick={fetchMerchants}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`}
                />
                تحديث
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-4">
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
                  className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 text-right pr-10 rounded-xl h-11"
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
                  className="border-orange-600/50 text-orange-400 hover:bg-orange-600/20 hover:border-orange-500 hover:text-orange-300 transition-all duration-300 backdrop-blur-sm px-3 h-9 shadow-lg"
                >
                  <Filter className="w-4 h-4 ml-2" />
                  فلترة
                </Button>
                <span className="text-gray-400 text-sm">
                  إجمالي السجلات:{' '}
                  <span className="text-white font-medium">
                    {filteredMerchants.length}
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
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 h-10"
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
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-gray-700"
                        >
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
            {(searchQuery ||
              selectedName ||
              (selectedMonth && selectedMonth !== 'all') ||
              selectedYear !== new Date().getFullYear().toString()) && (
              <div className="text-sm text-gray-400 mt-3 text-right border-t border-gray-600/30 pt-3">
                <div className="flex items-center justify-between">
                  <span>
                    {filteredMerchants.length} نتيجة من أصل {merchants.length}{' '}
                    سجل
                  </span>
                  {((selectedMonth && selectedMonth !== 'all') ||
                    selectedYear !== new Date().getFullYear().toString() ||
                    selectedName) && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">الفلاتر النشطة:</span>
                      {selectedName && (
                        <Badge
                          variant="outline"
                          className="bg-orange-500/20 text-orange-300 border-orange-500/50 px-2 py-1"
                        >
                          الاسم: {selectedName}
                        </Badge>
                      )}
                      {selectedMonth && selectedMonth !== 'all' && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-300 border-green-500/50 px-2 py-1"
                        >
                          {months.find((m) => m.value === selectedMonth)?.label}
                        </Badge>
                      )}
                      {selectedYear !== new Date().getFullYear().toString() && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/20 text-amber-300 border-amber-500/50 px-2 py-1"
                        >
                          {selectedYear}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <motion.div
              className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    إجمالي الفواتير
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totals.totalInvoices.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    إجمالي الدفعات
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totals.totalPayments.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`bg-gradient-to-br ${
                totals.totalBalance >= 0
                  ? 'from-orange-500/20 to-amber-600/20 border-orange-500/30'
                  : 'from-red-500/20 to-pink-600/20 border-red-500/30'
              } border rounded-lg p-4`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`${
                      totals.totalBalance >= 0
                        ? 'text-orange-300'
                        : 'text-red-300'
                    } text-sm font-medium`}
                  >
                    صافي الرصيد
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      totals.totalBalance >= 0 ? 'text-white' : 'text-red-300'
                    }`}
                  >
                    {totals.totalBalance.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`p-3 ${
                    totals.totalBalance >= 0
                      ? 'bg-orange-500/20'
                      : 'bg-red-500/20'
                  } rounded-full`}
                >
                  {totals.totalBalance >= 0 ? (
                    <Calculator
                      className={`w-6 h-6 ${totals.totalBalance >= 0 ? 'text-orange-400' : 'text-red-400'}`}
                    />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scrollable Table Container */}
          <div className="overflow-auto bg-gray-800/30 rounded-lg border border-gray-700/50">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-800 z-10">
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">
                    الاسم
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الفاتورة
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الدفعة
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الإجمالي
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    التاريخ
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الملاحظات
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الحضور
                  </TableHead>
                  <TableHead className="text-gray-300 text-right">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredMerchants.map((merchant, index) => (
                    <motion.tr
                      key={merchant._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right font-medium">
                        {merchant.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {merchant.invoice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {merchant.payment.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${merchant.total >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {merchant.total.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(merchant.date), 'yyyy/MM/dd', {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {merchant.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {getAttendanceStatusBadge(
                          merchant.attendanceStatus,
                          () => handleMarkAttendance(merchant),
                        )}
                      </TableCell>
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
                          <span className="text-gray-500 text-sm">
                            غير مسموح
                          </span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {filteredMerchants.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد بيانات تجار'}
                </p>
                <p className="text-sm">
                  {searchQuery
                    ? 'جرب كلمة بحث أخرى'
                    : 'اضغط على "إضافة تاجر جديد" لبدء الإدخال'}
                </p>
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
                <Label className="text-gray-300 text-right block mb-2">
                  الاسم
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="اسم التاجر"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">
                  الفاتورة
                </Label>
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
                <Label className="text-gray-300 text-right block mb-2">
                  الدفعة
                </Label>
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
                <Label className="text-gray-300 text-right block mb-2">
                  التاريخ
                </Label>
                <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {date
                        ? format(date, 'yyyy/MM/dd', { locale: ar })
                        : 'اختر التاريخ'}
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
                <Label className="text-gray-300 text-right block mb-2">
                  الملاحظات (اختياري)
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="أضف ملاحظات إضافية"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">
                  الإجمالي
                </Label>
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
                  {loading
                    ? 'جاري الحفظ...'
                    : editingMerchant
                      ? 'تحديث'
                      : 'إضافة'}
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
        <AlertDialog
          open={!!deleteMerchantId}
          onOpenChange={(open) => !open && setDeleteMerchantId(null)}
        >
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                تأكيد الحذف
              </AlertDialogTitle>
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

        {/* Attendance Dialog */}
        <Dialog
          open={showAttendanceDialog}
          onOpenChange={setShowAttendanceDialog}
        >
          <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                تسجيل الحضور والانصراف
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                سجل حضور وانصراف التاجر
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-gray-300">التاجر</Label>
                <div className="text-lg font-medium text-white">
                  {selectedMerchantForAttendance?.name || ''}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceStatus" className="text-gray-300">
                    الحالة
                  </Label>
                  <Select
                    value={attendanceStatus}
                    onValueChange={(value) =>
                      setAttendanceStatus(
                        value as 'present' | 'absent' | 'late' | 'half-day',
                      )
                    }
                  >
                    <SelectTrigger
                      id="attendanceStatus"
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    >
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem
                        value="present"
                        className="text-white hover:bg-gray-700"
                      >
                        حاضر
                      </SelectItem>
                      <SelectItem
                        value="absent"
                        className="text-white hover:bg-gray-700"
                      >
                        غائب
                      </SelectItem>
                      <SelectItem
                        value="late"
                        className="text-white hover:bg-gray-700"
                      >
                        متأخر
                      </SelectItem>
                      <SelectItem
                        value="half-day"
                        className="text-white hover:bg-gray-700"
                      >
                        نصف يوم
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendanceDate" className="text-gray-300">
                    التاريخ
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between text-right w-full bg-gray-700/50 border-gray-600/50 text-white"
                      >
                        {attendanceDate ? (
                          format(attendanceDate, 'PPP', { locale: ar })
                        ) : (
                          <span className="text-gray-400">اختر التاريخ</span>
                        )}
                        <Calendar className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-gray-800 border-gray-700"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={attendanceDate}
                        onSelect={setAttendanceDate}
                        locale={ar}
                        className="border-gray-700"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {attendanceStatus === 'present' || attendanceStatus === 'late' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeIn" className="text-gray-300">
                      وقت الحضور
                    </Label>
                    <Input
                      id="timeIn"
                      type="time"
                      value={timeIn}
                      onChange={(e) => setTimeIn(e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeOut" className="text-gray-300">
                      وقت الانصراف
                    </Label>
                    <Input
                      id="timeOut"
                      type="time"
                      value={timeOut}
                      onChange={(e) => setTimeOut(e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>
                </div>
              ) : null}

              {timeIn &&
                timeOut &&
                (attendanceStatus === 'present' ||
                  attendanceStatus === 'late') && (
                  <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span className="text-orange-300 font-medium">
                        ساعات العمل: {calculateWorkingHours(timeIn, timeOut)}{' '}
                        ساعة
                      </span>
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="attendanceNotes" className="text-gray-300">
                  ملاحظات
                </Label>
                <Textarea
                  id="attendanceNotes"
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  className="bg-gray-700/50 border-gray-600/50 text-white h-20"
                  placeholder="أدخل أي ملاحظات إضافية هنا"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSaveAttendance}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                حفظ الحضور
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default CenterGazaMerchants;
