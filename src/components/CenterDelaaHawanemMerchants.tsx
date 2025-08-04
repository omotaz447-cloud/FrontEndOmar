'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
  Search,
  Clock,
  UserCheck,
  UserX,
  Calculator,
  TrendingUp,
  Users,
  Filter,
  RotateCcw,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { getRolePermissions } from '@/utils/roleUtils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MerchantRecord {
  _id?: string;
  name: string;
  invoice: number | string;
  payment: number | string;
  date: string;
  notes?: string;
  total?: number;
  // Attendance fields
  attendanceStatus?: 'present' | 'absent' | 'late' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  attendanceNotes?: string;
}

interface AttendanceRecord {
  _id?: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  const [editingMerchant, setEditingMerchant] = useState<MerchantRecord | null>(
    null,
  );
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
  const [deleteMerchant, setDeleteMerchant] = useState<MerchantRecord | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [selectedName, setSelectedName] = useState<string>('');
  const [filteredMerchants, setFilteredMerchants] = useState<MerchantRecord[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Attendance states
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedMerchantForAttendance, setSelectedMerchantForAttendance] =
    useState<MerchantRecord | null>(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

  // Load attendance data from cookies and localStorage
  const loadAttendanceData = useCallback((): AttendanceRecord[] => {
    try {
      // First try localStorage (most recent and complete)
      const stored = localStorage.getItem('merchantAttendanceSystem');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data || [];
      }
      // Fallback to cookies
      const cookieData = Cookies.get('merchantAttendanceData');
      if (cookieData) {
        const compactData = JSON.parse(cookieData);
        return compactData.map(
          (item: {
            id: string;
            n: string;
            dt: string;
            ci: string;
            co: string;
            s: AttendanceRecord['status'];
            wh: number;
            nt: string;
          }) => ({
            _id: item.id || `cookie_${Date.now()}_${Math.random()}`,
            employeeName: item.n,
            date: item.dt,
            checkInTime: item.ci,
            checkOutTime: item.co,
            status: item.s,
            workingHours: item.wh,
            notes: item.nt,
          }),
        );
      }
    } catch (error) {
      console.error('Error loading merchant attendance data:', error);
    }
    return [];
  }, []);

  // Save attendance data to cookies
  const saveAttendanceData = useCallback(
    (attendanceData: AttendanceRecord[]) => {
      try {
        // Save full data to localStorage
        const attendanceStorage = {
          data: attendanceData,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(
          'merchantAttendanceSystem',
          JSON.stringify(attendanceStorage),
        );

        // Save recent records to cookies (for persistence across sessions)
        const recentData = attendanceData.slice(-20).map((record) => ({
          id: record._id,
          n: record.employeeName,
          dt: record.date,
          ci: record.checkInTime,
          co: record.checkOutTime || '',
          s: record.status,
          wh: record.workingHours || 0,
          nt: record.notes || '',
        }));

        Cookies.set('merchantAttendanceData', JSON.stringify(recentData), {
          expires: 365,
        });

        // Dispatch custom event for same-tab synchronization
        window.dispatchEvent(new CustomEvent('merchantAttendanceDataChanged'));
        console.log('Merchant attendance data saved successfully');
      } catch (error) {
        console.error('Error saving merchant attendance data:', error);
      }
    },
    [],
  );

  // Fetch existing merchants
  const fetchMerchants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant',
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const merchantsData = Array.isArray(data) ? data : [];

        // Load attendance data and merge with merchants
        const attendanceData = loadAttendanceData();
        const merchantsWithAttendance = merchantsData.map(
          (merchant: MerchantRecord) => {
            const attendance = attendanceData.find(
              (record: AttendanceRecord) =>
                record.employeeName === merchant.name &&
                record.date === merchant.date,
            );

            if (attendance) {
              return {
                ...merchant,
                attendanceStatus: attendance.status,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                workingHours: attendance.workingHours,
                attendanceNotes: attendance.notes,
              };
            }

            return {
              ...merchant,
              attendanceStatus: undefined,
              checkInTime: undefined,
              checkOutTime: undefined,
              workingHours: undefined,
              attendanceNotes: undefined,
            };
          },
        );

        setMerchants(merchantsWithAttendance);
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
  }, [loadAttendanceData]);

  useEffect(() => {
    if (isOpen) {
      fetchMerchants();
    }
  }, [isOpen, fetchMerchants]);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    const num = Number.parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  // Helper function to safely convert to number for calculations
  const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return Number.parseFloat(value.toString()) || 0;
  };

  const handleInputChange = (
    field: keyof MerchantRecord,
    value: string | number,
  ) => {
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

  const calculateTotal = (
    invoice: number | string,
    payment: number | string,
  ) => {
    const invoiceNum =
      typeof invoice === 'string'
        ? invoice === '0'
          ? 0
          : Number.parseFloat(invoice) || 0
        : invoice;
    const paymentNum =
      typeof payment === 'string'
        ? payment === '0'
          ? 0
          : Number.parseFloat(payment) || 0
        : payment;
    return invoiceNum - paymentNum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      formData.invoice === '' ||
      formData.payment === '' ||
      !formData.date
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            الاسم: formData.name,
            الفاتوره: String(formData.invoice),
            دفعه: String(formData.payment),
            التاريخ: formData.date,
            ملاحظات: formData.notes,
          }),
        },
      );

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
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant/${encodeURIComponent(editingMerchant.name)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            الاسم: editFormData.name,
            الفاتوره: String(editFormData.invoice),
            دفعه: String(editFormData.payment),
            التاريخ: editFormData.date,
            ملاحظات: editFormData.notes,
          }),
        },
      );

      if (response.ok) {
        toast.success('تم تحديث البيانات بنجاح');
        setEditDialogOpen(false);
        setEditingMerchant(null);
        setEditSelectedDate(undefined);
        fetchMerchants();
      } else {
        console.error('Failed to update merchant:', response.statusText);
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
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-merchant/${encodeURIComponent(deleteMerchant.name)}`,
        {
          method: 'DELETE',
          headers,
        },
      );

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

  // Months in Arabic
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

  // Generate years (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // Filter merchants based on selected month, year, and name
  useEffect(() => {
    let filtered = merchants;

    // Filter by name if provided (includes search query)
    if (selectedName || searchQuery) {
      const nameQuery = selectedName || searchQuery;
      filtered = filtered.filter((merchant) =>
        merchant.name.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    // Filter by month and year (skip if month is "all")
    if (selectedMonth && selectedMonth !== 'all' && selectedYear) {
      filtered = filtered.filter((merchant) => {
        const merchantDate = new Date(merchant.date);
        const merchantMonth = (merchantDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        const merchantYear = merchantDate.getFullYear().toString();
        return merchantMonth === selectedMonth && merchantYear === selectedYear;
      });
    } else if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter((merchant) => {
        const merchantDate = new Date(merchant.date);
        const merchantMonth = (merchantDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        return merchantMonth === selectedMonth;
      });
    } else if (selectedYear) {
      filtered = filtered.filter((merchant) => {
        const merchantDate = new Date(merchant.date);
        const merchantYear = merchantDate.getFullYear().toString();
        return merchantYear === selectedYear;
      });
    }

    setFilteredMerchants(filtered);
  }, [merchants, selectedMonth, selectedYear, selectedName, searchQuery]);

  // Clear filters
  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedName('');
    setSearchQuery('');
    setShowFilters(false);
  };

  // Get the merchants to display (filtered or all)
  const merchantsToDisplay =
    (selectedMonth && selectedMonth !== 'all') ||
    selectedYear !== new Date().getFullYear().toString() ||
    selectedName ||
    searchQuery
      ? filteredMerchants
      : merchants;

  // Update merchants with latest attendance data
  const updateMerchantsWithAttendance = useCallback(() => {
    const attendanceData = loadAttendanceData();
    setMerchants((prevMerchants) =>
      prevMerchants.map((merchant: MerchantRecord) => {
        const attendance = attendanceData.find(
          (record: AttendanceRecord) =>
            record.employeeName === merchant.name &&
            record.date === merchant.date,
        );

        if (attendance) {
          return {
            ...merchant,
            attendanceStatus: attendance.status,
            checkInTime: attendance.checkInTime,
            checkOutTime: attendance.checkOutTime,
            workingHours: attendance.workingHours,
            attendanceNotes: attendance.notes,
          };
        }

        return {
          ...merchant,
          attendanceStatus: undefined,
          checkInTime: undefined,
          checkOutTime: undefined,
          workingHours: undefined,
          attendanceNotes: undefined,
        };
      }),
    );
  }, [loadAttendanceData]);

  // Attendance functions
  const handleMarkAttendance = (merchant: MerchantRecord) => {
    setSelectedMerchantForAttendance(merchant);

    // Check if attendance already exists for this merchant and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) =>
        record.employeeName === merchant.name && record.date === merchant.date,
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
      const workingHours =
        attendanceFormData.checkInTime && attendanceFormData.checkOutTime
          ? calculateWorkingHours(
              attendanceFormData.checkInTime,
              attendanceFormData.checkOutTime,
            )
          : 0;

      const attendanceRecord: AttendanceRecord = {
        _id: `merchant_attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

      const existingAttendance = loadAttendanceData();

      // Remove any existing records for this merchant and date to prevent duplicates
      const filteredAttendance = existingAttendance.filter(
        (record: AttendanceRecord) =>
          !(
            record.employeeName === selectedMerchantForAttendance.name &&
            record.date === selectedMerchantForAttendance.date
          ),
      );

      // Add the new/updated record
      const updatedAttendance = [...filteredAttendance, attendanceRecord];

      toast.success(
        existingAttendance.length !== filteredAttendance.length
          ? 'تم التحديث بنجاح'
          : 'تم التسجيل بنجاح',
      );
      saveAttendanceData(updatedAttendance);
      setShowAttendanceDialog(false);
      setSelectedMerchantForAttendance(null);

      // Update merchants immediately with new attendance data
      setTimeout(() => {
        updateMerchantsWithAttendance();
      }, 100);
    } catch (error) {
      console.error('Error saving merchant attendance:', error);
      toast.error('فشل في التسجيل');
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;
    const workingMinutes = outTotalMinutes - inTotalMinutes;
    return Math.max(0, workingMinutes / 60);
  };

  const getAttendanceStatusBadge = (status?: string, onClick?: () => void) => {
    if (!status) {
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

  // Listen for changes in attendance data (for synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'merchantAttendanceSystem' && isOpen) {
        setTimeout(() => {
          updateMerchantsWithAttendance();
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for changes in the same tab using custom event
    const handleAttendanceChange = () => {
      if (isOpen) {
        setTimeout(() => {
          updateMerchantsWithAttendance();
        }, 100);
      }
    };

    window.addEventListener(
      'merchantAttendanceDataChanged',
      handleAttendanceChange,
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'merchantAttendanceDataChanged',
        handleAttendanceChange,
      );
    };
  }, [isOpen, updateMerchantsWithAttendance]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-[95vw] max-w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw] h-[90vh] sm:h-[95vh] max-h-[90vh] sm:max-h-[95vh] backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col relative"
        >
          {/* Professional Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-transparent to-slate-800/30 rounded-3xl" />
          <motion.div
            className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-emerald-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [180, 90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />

          {/* Professional Header */}
          <motion.div
            className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-t-3xl shadow-xl relative overflow-hidden border-b border-slate-600/50 flex-shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Subtle shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 5,
              }}
            />

            <div className="flex items-center justify-between text-white relative z-10 p-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <motion.div
                  className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm p-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
                    حسابات تجار سنتر دلع الهوانم
                  </h2>
                  <p className="text-slate-300 text-sm mt-1">
                    إدارة حسابات التجار وفواتيرهم
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl p-2 transition-all duration-300 border border-slate-600/30"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Scrollable Content Container */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            <div className="p-2 sm:p-4 md:p-6 relative z-10 space-y-6">
              {/* Professional Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-emerald-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          إجمالي التجار
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {merchants.length}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">تاجر نشط</p>
                      </div>
                      <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3">
                        <Users className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-pink-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          إجمالي الفواتير
                        </p>
                        <p className="text-pink-400 text-2xl font-bold mt-1 truncate">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP',
                          }).format(
                            merchants.reduce(
                              (total, merchant) =>
                                total + toNumber(merchant.invoice),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          جميع المعاملات
                        </p>
                      </div>
                      <div className="bg-pink-500/20 border border-pink-400/30 rounded-xl p-3">
                        <Receipt className="w-8 h-8 text-pink-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-amber-400/50 sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          صافي الأرباح
                        </p>
                        <p className="text-amber-400 text-2xl font-bold mt-1 truncate">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP',
                          }).format(
                            merchants.reduce(
                              (total, merchant) =>
                                total +
                                (toNumber(merchant.invoice) -
                                  toNumber(merchant.payment)),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">الإجمالي</p>
                      </div>
                      <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
                        <TrendingUp className="w-8 h-8 text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md">
                  <CardContent className="p-6">
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                      <Plus className="w-5 h-5 ml-2 text-emerald-400" />
                      إضافة تاجر جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Name */}
                        <div className="space-y-2 lg:col-span-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-300 font-medium text-sm"
                          >
                            اسم التاجر
                          </Label>
                          <div className="relative">
                            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange('name', e.target.value)
                              }
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 h-11 backdrop-blur-sm pr-10"
                              placeholder="أدخل اسم التاجر"
                              required
                            />
                          </div>
                        </div>
                        {/* Invoice */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="invoice"
                            className="text-slate-300 font-medium text-sm"
                          >
                            الفاتورة (جنيه)
                          </Label>
                          <div className="relative">
                            <Receipt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="invoice"
                              type="number"
                              value={formData.invoice}
                              onChange={(e) =>
                                handleInputChange(
                                  'invoice',
                                  convertToNumber(e.target.value),
                                )
                              }
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 h-11 backdrop-blur-sm pr-10"
                              placeholder="أدخل المبلغ"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                        {/* Payment */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="payment"
                            className="text-slate-300 font-medium text-sm"
                          >
                            الدفعة (جنيه)
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="payment"
                              type="number"
                              value={formData.payment}
                              onChange={(e) =>
                                handleInputChange(
                                  'payment',
                                  convertToNumber(e.target.value),
                                )
                              }
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 h-11 backdrop-blur-sm pr-10"
                              placeholder="أدخل المبلغ"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                        {/* Date */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="date"
                            className="text-slate-300 font-medium text-sm"
                          >
                            التاريخ
                          </Label>
                          <Popover
                            open={calendarOpen}
                            onOpenChange={setCalendarOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 text-right h-11 px-3"
                              >
                                {selectedDate ? (
                                  <span className="text-white truncate">
                                    {format(selectedDate, 'dd/MM/yyyy', {
                                      locale: ar,
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 truncate">
                                    اختر التاريخ
                                  </span>
                                )}
                                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 bg-slate-800 border-slate-600"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date);
                                  if (date) {
                                    handleInputChange(
                                      'date',
                                      format(date, 'yyyy-MM-dd'),
                                    );
                                  }
                                  setCalendarOpen(false);
                                }}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                                className="bg-slate-800 text-white border-slate-600"
                                classNames={{
                                  months: 'text-white bg-slate-800',
                                  month: 'text-white bg-slate-800',
                                  caption:
                                    'text-white bg-slate-800/80 rounded-t-lg pb-3',
                                  caption_label:
                                    'text-white font-semibold text-sm',
                                  nav: 'text-white',
                                  nav_button:
                                    'text-white hover:bg-emerald-600/20 hover:text-emerald-300 border border-slate-600/50 rounded-md transition-colors',
                                  nav_button_previous:
                                    'text-white hover:bg-emerald-600/20 hover:text-emerald-300',
                                  nav_button_next:
                                    'text-white hover:bg-emerald-600/20 hover:text-emerald-300',
                                  table: 'text-white bg-slate-800',
                                  head_row:
                                    'text-white border-b border-slate-600/30',
                                  head_cell:
                                    'text-slate-300 font-medium pb-1 text-xs',
                                  row: 'text-white',
                                  cell: 'text-white hover:bg-emerald-600/10 rounded-md transition-colors',
                                  day: 'text-white hover:bg-emerald-600/20 hover:text-emerald-200 focus:bg-emerald-600 focus:text-white rounded-md transition-all duration-200 text-xs h-7 w-7',
                                  day_selected:
                                    'bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-lg font-bold border-2 border-emerald-400 !bg-emerald-600',
                                  day_today:
                                    'text-emerald-300 border border-emerald-500/30 font-semibold',
                                  day_outside:
                                    'text-slate-500 hover:text-slate-400',
                                  day_disabled:
                                    'text-slate-600 opacity-50 cursor-not-allowed',
                                  day_range_middle: 'bg-emerald-500/30',
                                  day_hidden: 'invisible',
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Total Display */}
                      <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium flex items-center">
                            <Calculator className="w-4 h-4 ml-2 text-slate-400" />
                            الإجمالي:
                          </span>
                          <span
                            className={`text-lg font-bold ${calculateTotal(formData.invoice, formData.payment) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                          >
                            {calculateTotal(
                              formData.invoice,
                              formData.payment,
                            ).toFixed(2)}{' '}
                            جنيه
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="notes"
                          className="text-slate-300 font-medium text-sm"
                        >
                          ملاحظات (اختياري)
                        </Label>
                        <div className="relative">
                          <FileText className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                              handleInputChange('notes', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm pr-10 min-h-[80px]"
                            placeholder="أدخل أي ملاحظات..."
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-slate-600/30">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 px-8 py-2 h-11"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                          ) : (
                            <Plus className="w-4 h-4 ml-2" />
                          )}
                          إضافة
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Filter Section */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                      {/* Search Input */}
                      <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="البحث بالاسم..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 text-right pr-10 rounded-xl h-11"
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
                              className="h-auto p-1 text-slate-400 hover:text-slate-300"
                            >
                              ×
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Filter Toggle and Stats */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 backdrop-blur-sm px-3 h-9 shadow-lg"
                        >
                          <Filter className="w-4 h-4 ml-2" />
                          فلترة
                        </Button>
                        <span className="text-slate-400 text-sm">
                          إجمالي السجلات:{' '}
                          <span className="text-white font-medium">
                            {merchantsToDisplay.length}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Advanced Filters */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: showFilters ? 'auto' : 0,
                        opacity: showFilters ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-slate-600/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {/* Name Filter */}
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm font-medium">
                              اسم التاجر
                            </Label>
                            <Input
                              type="text"
                              placeholder="ابحث بالاسم..."
                              value={selectedName}
                              onChange={(e) => setSelectedName(e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 h-10"
                            />
                          </div>

                          {/* Month Filter */}
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm font-medium">
                              الشهر
                            </Label>
                            <Select
                              value={selectedMonth}
                              onValueChange={setSelectedMonth}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white h-10">
                                <SelectValue placeholder="اختر الشهر" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="all" className="text-white hover:bg-slate-700">
                                  جميع الشهور
                                </SelectItem>
                                {months.map((month) => (
                                  <SelectItem
                                    key={month.value}
                                    value={month.value}
                                    className="text-white hover:bg-slate-700"
                                  >
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Year Filter */}
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm font-medium">
                              السنة
                            </Label>
                            <Select
                              value={selectedYear}
                              onValueChange={setSelectedYear}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white h-10">
                                <SelectValue placeholder="اختر السنة" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                {years.map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year}
                                    className="text-white hover:bg-slate-700"
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Clear Filters */}
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm font-medium opacity-0">
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
                    </motion.div>

                    {/* Results Info */}
                    {(searchQuery || selectedName || (selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString()) && (
                      <motion.div
                        className="text-sm text-slate-400 mt-3 text-right border-t border-slate-600/30 pt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {merchantsToDisplay.length} نتيجة من أصل{' '}
                            {merchants.length} سجل
                          </span>
                          {((selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString() || selectedName) && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">الفلاتر النشطة:</span>
                              {selectedName && (
                                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 px-2 py-1">
                                  الاسم: {selectedName}
                                </Badge>
                              )}
                              {selectedMonth && selectedMonth !== 'all' && (
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50 px-2 py-1">
                                  {months.find(m => m.value === selectedMonth)?.label}
                                </Badge>
                              )}
                              {selectedYear !== new Date().getFullYear().toString() && (
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 px-2 py-1">
                                  {selectedYear}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Table Section */}
              <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Building2 className="w-5 h-5 ml-2 text-emerald-400" />
                      سجلات التجار
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                        className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"
                      />
                      <span className="text-white mr-4 text-base">
                        جاري تحميل البيانات...
                      </span>
                    </div>
                  ) : merchantsToDisplay.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">
                        {searchQuery
                          ? 'لا توجد نتائج للبحث'
                          : 'لا توجد سجلات تجار'}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        {searchQuery
                          ? 'جرب البحث بكلمات أخرى'
                          : 'قم بإضافة تجار جدد للبدء'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
                          <TableRow className="border-slate-600/30 hover:bg-slate-800/30">
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              اسم التاجر
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              الفاتورة
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              الدفعة
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              الإجمالي
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              التاريخ
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-center px-4 py-4 whitespace-nowrap">
                              حالة الحضور
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                              ملاحظات
                            </TableHead>
                            <TableHead className="text-slate-300 font-semibold text-center px-4 py-4 whitespace-nowrap">
                              الإجراءات
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {merchantsToDisplay.map((merchant, index) => (
                            <TableRow
                              key={merchant._id || index}
                              className="border-slate-600/30 hover:bg-slate-800/20 transition-colors duration-200"
                            >
                              <TableCell className="text-white px-4 py-4">
                                <div className="font-medium truncate max-w-[150px]">
                                  {merchant.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-white px-4 py-4 whitespace-nowrap">
                                {merchant.invoice} جنيه
                              </TableCell>
                              <TableCell className="text-white px-4 py-4 whitespace-nowrap">
                                {merchant.payment} جنيه
                              </TableCell>
                              <TableCell
                                className={`px-4 py-4 whitespace-nowrap font-bold ${calculateTotal(merchant.invoice, merchant.payment) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                              >
                                {calculateTotal(
                                  merchant.invoice,
                                  merchant.payment,
                                ).toFixed(2)}{' '}
                                جنيه
                              </TableCell>
                              <TableCell className="text-white px-4 py-4 whitespace-nowrap">
                                {format(new Date(merchant.date), 'dd/MM/yyyy', {
                                  locale: ar,
                                })}
                              </TableCell>
                              <TableCell className="text-center px-4 py-4 whitespace-nowrap">
                                {getAttendanceStatusBadge(
                                  merchant.attendanceStatus,
                                  () => handleMarkAttendance(merchant),
                                )}
                              </TableCell>
                              <TableCell className="text-white px-4 py-4 max-w-[120px] truncate">
                                {merchant.notes || '-'}
                              </TableCell>
                              <TableCell className="text-center px-4 py-4 whitespace-nowrap">
                                {permissions.canEdit &&
                                permissions.canDelete ? (
                                  <div className="flex justify-center space-x-2 space-x-reverse">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(merchant)}
                                      className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setDeleteMerchant(merchant)
                                      }
                                      className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 text-sm">
                                    غير مسموح
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Totals Summary Section - appears after table */}
                  {!isLoading && merchantsToDisplay.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl backdrop-blur-sm"
                    >
                      <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                        <Calculator className="w-4 h-4 ml-2 text-emerald-400" />
                        ملخص الإجماليات
                        {(searchQuery || selectedName || (selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString()) && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50 px-2 py-1 text-xs mr-2">
                            مفلتر ({merchantsToDisplay.length} من {merchants.length})
                          </Badge>
                        )}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Merchants */}
                        <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-400 text-xs font-medium">عدد التجار</p>
                              <p className="text-white text-lg font-bold mt-1">
                                {merchantsToDisplay.length}
                              </p>
                            </div>
                            <Users className="w-5 h-5 text-emerald-400" />
                          </div>
                        </div>

                        {/* Total Invoices */}
                        <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-400 text-xs font-medium">إجمالي الفواتير</p>
                              <p className="text-pink-400 text-lg font-bold mt-1 truncate">
                                {new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  merchantsToDisplay.reduce(
                                    (total, merchant) => total + toNumber(merchant.invoice),
                                    0,
                                  ),
                                )}
                              </p>
                            </div>
                            <Receipt className="w-5 h-5 text-pink-400 flex-shrink-0" />
                          </div>
                        </div>

                        {/* Total Payments */}
                        <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-400 text-xs font-medium">إجمالي الدفعات</p>
                              <p className="text-blue-400 text-lg font-bold mt-1 truncate">
                                {new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  merchantsToDisplay.reduce(
                                    (total, merchant) => total + toNumber(merchant.payment),
                                    0,
                                  ),
                                )}
                              </p>
                            </div>
                            <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          </div>
                        </div>

                        {/* Net Total */}
                        <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-400 text-xs font-medium">الصافي</p>
                              <p className={`text-lg font-bold mt-1 truncate ${
                                merchantsToDisplay.reduce(
                                  (total, merchant) => 
                                    total + (toNumber(merchant.invoice) - toNumber(merchant.payment)),
                                  0,
                                ) >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  merchantsToDisplay.reduce(
                                    (total, merchant) => 
                                      total + (toNumber(merchant.invoice) - toNumber(merchant.payment)),
                                    0,
                                  ),
                                )}
                              </p>
                            </div>
                            <TrendingUp className={`w-5 h-5 flex-shrink-0 ${
                              merchantsToDisplay.reduce(
                                (total, merchant) => 
                                  total + (toNumber(merchant.invoice) - toNumber(merchant.payment)),
                                0,
                              ) >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`} />
                          </div>
                        </div>
                      </div>

                      {/* Additional Statistics */}
                      <div className="mt-4 pt-3 border-t border-slate-600/30">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-slate-400 text-xs">متوسط الفاتورة</p>
                            <p className="text-white text-sm font-semibold mt-1">
                              {merchantsToDisplay.length > 0 ? 
                                new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  merchantsToDisplay.reduce((total, merchant) => total + toNumber(merchant.invoice), 0) / merchantsToDisplay.length
                                ) : '0 جنيه'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">متوسط الدفعة</p>
                            <p className="text-white text-sm font-semibold mt-1">
                              {merchantsToDisplay.length > 0 ? 
                                new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  merchantsToDisplay.reduce((total, merchant) => total + toNumber(merchant.payment), 0) / merchantsToDisplay.length
                                ) : '0 جنيه'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">أعلى فاتورة</p>
                            <p className="text-white text-sm font-semibold mt-1">
                              {merchantsToDisplay.length > 0 ? 
                                new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  Math.max(...merchantsToDisplay.map(merchant => toNumber(merchant.invoice)))
                                ) : '0 جنيه'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">أقل فاتورة</p>
                            <p className="text-white text-sm font-semibold mt-1">
                              {merchantsToDisplay.length > 0 ? 
                                new Intl.NumberFormat('ar-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(
                                  Math.min(...merchantsToDisplay.map(merchant => toNumber(merchant.invoice)))
                                ) : '0 جنيه'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Close Button */}
              <div className="flex justify-center pt-6 pb-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 hover:text-white transition-all duration-300 px-8 py-3 h-12 backdrop-blur-sm shadow-lg min-w-[120px] bg-transparent"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-slate-900/95 border-slate-700 w-[95vw] sm:w-[90vw] max-w-2xl backdrop-blur-xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-6 border-b border-slate-700/50">
              <DialogTitle className="text-white text-xl font-semibold">
                تعديل بيانات التاجر
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                تعديل معلومات التاجر:{' '}
                <span className="text-emerald-400 font-medium">
                  {editingMerchant?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1">
              <form onSubmit={handleEditSubmit} className="space-y-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-name"
                      className="text-slate-300 font-medium"
                    >
                      اسم التاجر
                    </Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm h-11"
                      placeholder="أدخل اسم التاجر"
                      required
                    />
                  </div>
                  {/* Invoice */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-invoice"
                      className="text-slate-300 font-medium"
                    >
                      الفاتورة (جنيه)
                    </Label>
                    <Input
                      id="edit-invoice"
                      type="number"
                      value={editFormData.invoice}
                      onChange={(e) =>
                        handleInputChange(
                          'invoice',
                          convertToNumber(e.target.value),
                        )
                      }
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm h-11"
                      placeholder="أدخل المبلغ"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {/* Payment */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-payment"
                      className="text-slate-300 font-medium"
                    >
                      الدفعة (جنيه)
                    </Label>
                    <Input
                      id="edit-payment"
                      type="number"
                      value={editFormData.payment}
                      onChange={(e) =>
                        handleInputChange(
                          'payment',
                          convertToNumber(e.target.value),
                        )
                      }
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm h-11"
                      placeholder="أدخل المبلغ"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {/* Date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-date"
                      className="text-slate-300 font-medium"
                    >
                      التاريخ
                    </Label>
                    <Popover
                      open={editCalendarOpen}
                      onOpenChange={setEditCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 text-right h-11"
                        >
                          {editSelectedDate ? (
                            <span className="text-white">
                              {format(editSelectedDate, 'dd/MM/yyyy', {
                                locale: ar,
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400">اختر التاريخ</span>
                          )}
                          <Calendar className="mr-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-slate-800 border-slate-600"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={editSelectedDate}
                          onSelect={(date) => {
                            setEditSelectedDate(date);
                            if (date) {
                              handleInputChange(
                                'date',
                                format(date, 'yyyy-MM-dd'),
                              );
                            }
                            setEditCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          className="bg-slate-800 text-white border-slate-600"
                          classNames={{
                            months: 'text-white bg-slate-800',
                            month: 'text-white bg-slate-800',
                            caption:
                              'text-white bg-slate-800/80 rounded-t-lg pb-3',
                            caption_label: 'text-white font-semibold text-sm',
                            nav: 'text-white',
                            nav_button:
                              'text-white hover:bg-emerald-600/20 hover:text-emerald-300 border border-slate-600/50 rounded-md transition-colors',
                            nav_button_previous:
                              'text-white hover:bg-emerald-600/20 hover:text-emerald-300',
                            nav_button_next:
                              'text-white hover:bg-emerald-600/20 hover:text-emerald-300',
                            table: 'text-white bg-slate-800',
                            head_row: 'text-white border-b border-slate-600/30',
                            head_cell: 'text-slate-300 font-medium pb-2',
                            row: 'text-white',
                            cell: 'text-white hover:bg-emerald-600/10 rounded-md transition-colors',
                            day: 'text-white hover:bg-emerald-600/20 hover:text-emerald-200 focus:bg-emerald-600 focus:text-white rounded-md transition-all duration-200',
                            day_selected:
                              'bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-lg font-bold border-2 border-emerald-400 !bg-emerald-600',
                            day_today:
                              'text-emerald-300 border border-emerald-500/30 font-semibold',
                            day_outside: 'text-slate-500 hover:text-slate-400',
                            day_disabled:
                              'text-slate-600 opacity-50 cursor-not-allowed',
                            day_range_middle: 'bg-emerald-500/30',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Total Display */}
                <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm font-medium">الإجمالي:</span>
                    <span
                      className={`text-lg font-bold ${calculateTotal(editFormData.invoice, editFormData.payment) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {calculateTotal(
                        editFormData.invoice,
                        editFormData.payment,
                      ).toFixed(2)}{' '}
                      جنيه
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-notes"
                    className="text-slate-300 font-medium"
                  >
                    ملاحظات (اختياري)
                  </Label>
                  <Textarea
                    id="edit-notes"
                    value={editFormData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm min-h-[80px]"
                    placeholder="أدخل أي ملاحظات..."
                  />
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm px-6 h-11"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 px-8 h-11"
                  >
                    تحديث
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteMerchant}
          onOpenChange={() => setDeleteMerchant(null)}
        >
          <AlertDialogContent className="bg-slate-900/95 border-slate-700 w-[90vw] max-w-md backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-lg">
                تأكيد الحذف
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                هل أنت متأكد من حذف التاجر "
                <span className="text-red-400 font-medium">
                  {deleteMerchant?.name}
                </span>
                "؟
                <br />
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm h-11">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg h-11"
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
          <DialogContent className="bg-slate-900/95 border-slate-700 w-[95vw] sm:w-[90vw] max-w-md backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">
                تسجيل حضور التاجر
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-sm">
                {selectedMerchantForAttendance?.name} -{' '}
                {selectedMerchantForAttendance?.date &&
                  format(
                    new Date(selectedMerchantForAttendance.date),
                    'dd/MM/yyyy',
                    { locale: ar },
                  )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">
                  حالة الحضور
                </Label>
                <Select
                  value={attendanceFormData.status}
                  onValueChange={(
                    value: 'present' | 'absent' | 'late' | 'half-day',
                  ) =>
                    setAttendanceFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem
                      value="present"
                      className="text-white hover:bg-slate-700"
                    >
                      حاضر
                    </SelectItem>
                    <SelectItem
                      value="absent"
                      className="text-white hover:bg-slate-700"
                    >
                      غائب
                    </SelectItem>
                    <SelectItem
                      value="late"
                      className="text-white hover:bg-slate-700"
                    >
                      متأخر
                    </SelectItem>
                    <SelectItem
                      value="half-day"
                      className="text-white hover:bg-slate-700"
                    >
                      نصف يوم
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Check In Time */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">وقت الدخول</Label>
                <Input
                  type="time"
                  value={attendanceFormData.checkInTime}
                  onChange={(e) =>
                    setAttendanceFormData((prev) => ({
                      ...prev,
                      checkInTime: e.target.value,
                    }))
                  }
                  className="bg-slate-800/50 border-slate-600/50 text-white h-11"
                />
              </div>

              {/* Check Out Time */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">وقت الخروج</Label>
                <Input
                  type="time"
                  value={attendanceFormData.checkOutTime}
                  onChange={(e) =>
                    setAttendanceFormData((prev) => ({
                      ...prev,
                      checkOutTime: e.target.value,
                    }))
                  }
                  className="bg-slate-800/50 border-slate-600/50 text-white h-11"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">
                  ملاحظات (اختياري)
                </Label>
                <Textarea
                  value={attendanceFormData.notes}
                  onChange={(e) =>
                    setAttendanceFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 min-h-[80px]"
                  placeholder="أدخل أي ملاحظات..."
                />
              </div>

              {/* Working Hours Display */}
              {attendanceFormData.checkInTime &&
                attendanceFormData.checkOutTime && (
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">ساعات العمل:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {calculateWorkingHours(
                          attendanceFormData.checkInTime,
                          attendanceFormData.checkOutTime,
                        ).toFixed(1)}{' '}
                        ساعة
                      </span>
                    </div>
                  </div>
                )}

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAttendanceDialog(false)}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm px-6 h-11"
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 px-8 h-11"
                >
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1);
        }
      `}</style>
    </AnimatePresence>
  );
};

export default CenterDelaaHawanemMerchants;
