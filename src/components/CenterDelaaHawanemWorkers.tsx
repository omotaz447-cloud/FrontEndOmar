'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRolePermissions } from '@/utils/roleUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search,
  Filter,
  DollarSign,
  UserCircle,
  Calculator,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface WorkerRecord {
  _id?: string;
  id?: string;
  name: string;
  day: string;
  date: string;
  withdrawal: number | string;
  // Attendance fields
  attendanceStatus?: 'present' | 'absent' | 'late' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
  attendanceNotes?: string;
}

// Attendance record interface (same format as Attendance component)
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CenterDelaaHawanemWorkers: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<WorkerRecord>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete states
  const [editingWorker, setEditingWorker] = useState<WorkerRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<WorkerRecord>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteWorker, setDeleteWorker] = useState<WorkerRecord | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedName, setSelectedName] = useState('');

  // Attendance states
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedWorkerForAttendance, setSelectedWorkerForAttendance] = useState<WorkerRecord | null>(null);
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

  // Helper function to create authenticated headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = Cookies.get('accessToken');
    if (!token) {
      toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      window.location.href = '/';
      throw new Error('No token available');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const daysOfWeek = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  // Fetch workers data
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker',
        {
          headers,
        },
      );
      if (response.ok) {
        const data = await response.json();
        const workersData = Array.isArray(data) ? data : [];
        
        // Load attendance data and merge with workers
        const attendanceData = loadAttendanceData();
        const workersWithAttendance = workersData.map((worker: WorkerRecord) => {
          const attendance = attendanceData.find(
            (record: AttendanceRecord) => 
              record.employeeName === worker.name && record.date === worker.date
          );
          return {
            ...worker,
            attendanceStatus: attendance ? attendance.status : undefined,
            checkInTime: attendance ? attendance.checkInTime : undefined,
            checkOutTime: attendance ? attendance.checkOutTime : undefined,
            attendanceNotes: attendance ? attendance.notes : undefined,
          };
        });
        
        setWorkers(workersWithAttendance);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل بيانات العمال');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      if (error instanceof Error && error.message === 'No token available') {
        return; // Don't show error toast, already handled by getAuthHeaders
      }
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedName('');
  };

  // Apply filters to workers
  const workersToDisplay = workers.filter((worker) => {
    // Date filtering
    if (
      (selectedMonth && selectedMonth !== 'all') ||
      selectedYear !== new Date().getFullYear().toString()
    ) {
      const workerDate = new Date(worker.date);
      const workerMonth = (workerDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const workerYear = workerDate.getFullYear().toString();
      if (
        selectedMonth &&
        selectedMonth !== 'all' &&
        workerMonth !== selectedMonth
      ) {
        return false;
      }
      if (
        selectedYear !== new Date().getFullYear().toString() &&
        workerYear !== selectedYear
      ) {
        return false;
      }
    }
    // Name filtering
    if (
      selectedName &&
      !worker.name.toLowerCase().includes(selectedName.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter workers based on search query AND filters
  const filteredWorkers = workersToDisplay.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  // Attendance utility functions
  const loadAttendanceData = (): AttendanceRecord[] => {
    try {
      const cookieData = Cookies.get('centerDelaaHawanemWorkersAttendanceData');
      if (cookieData) {
        return JSON.parse(cookieData);
      }
      
      const localData = localStorage.getItem('centerDelaaHawanemWorkersAttendanceData');
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
      Cookies.set('centerDelaaHawanemWorkersAttendanceData', dataString, { expires: 365 });
      // Save to localStorage (backup)
      localStorage.setItem('centerDelaaHawanemWorkersAttendanceData', dataString);
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

  const handleMarkAttendance = (worker: WorkerRecord) => {
    setSelectedWorkerForAttendance(worker);
    
    // Check if attendance already exists for this worker and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) => record.employeeName === worker.name && record.date === worker.date
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
    if (!selectedWorkerForAttendance) return;

    try {
      const workingHours = attendanceFormData.checkInTime && attendanceFormData.checkOutTime
        ? calculateWorkingHours(attendanceFormData.checkInTime, attendanceFormData.checkOutTime)
        : 0;

      // Create attendance record (same format as Attendance component)
      const attendanceRecord: AttendanceRecord = {
        _id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeName: selectedWorkerForAttendance.name,
        date: selectedWorkerForAttendance.date,
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
        (record: AttendanceRecord) => !(record.employeeName === selectedWorkerForAttendance.name && record.date === selectedWorkerForAttendance.date)
      );
      
      // Add the new/updated record
      const updatedAttendance = [...filteredAttendance, attendanceRecord];
      
      toast.success(existingAttendance.length !== filteredAttendance.length ? 'تم التحديث بنجاح' : 'تم التسجيل بنجاح');

      // Save to cookies and localStorage (same as Attendance component)
      saveAttendanceData(updatedAttendance);

      // Update the worker's attendance status in the local state
      setWorkers(prevWorkers => 
        prevWorkers.map(w => 
          w.name === selectedWorkerForAttendance.name && w.date === selectedWorkerForAttendance.date
            ? { 
                ...w, 
                attendanceStatus: attendanceFormData.status,
                checkInTime: attendanceFormData.checkInTime,
                checkOutTime: attendanceFormData.checkOutTime,
                attendanceNotes: attendanceFormData.notes
              }
            : w
        )
      );

      setShowAttendanceDialog(false);
      setSelectedWorkerForAttendance(null);
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

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
      // Load attendance data when component opens to restore state
      const savedAttendanceData = loadAttendanceData();
      if (savedAttendanceData.length > 0) {
        console.log('Loaded attendance data for Center Delaa Hawanem Workers:', savedAttendanceData.length, 'records');
      }
    }
  }, [isOpen, fetchWorkers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.day ||
      !formData.date ||
      formData.withdrawal === ''
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingWorker
        ? `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${editingWorker._id}`
        : 'https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker';

      const method = editingWorker ? 'PUT' : 'POST';
      const headers = getAuthHeaders();

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingWorker ? 'تم تحديث البيانات بنجاح' : 'تم إضافة العامل بنجاح',
        );
        await fetchWorkers();
        resetForm();
      } else {
        toast.error('فشل في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error('حدث خطأ في حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (worker: WorkerRecord) => {
    setEditingWorker(worker);
    setEditFormData({ ...worker });
    setEditDialogOpen(true);
    // Set the selected date for the calendar picker
    if (worker.date) {
      setEditSelectedDate(new Date(worker.date));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker || !editingWorker.name) return;

    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${encodeURIComponent(editingWorker.name)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(editFormData),
        },
      );

      if (response.ok) {
        toast.success('تم تحديث البيانات بنجاح');
        setEditDialogOpen(false);
        setEditingWorker(null);
        setEditSelectedDate(undefined);
        fetchWorkers();
      } else {
        toast.error('فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handleDelete = async () => {
    if (!deleteWorker?.name) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/center-delaa-hawanem-worker/${encodeURIComponent(deleteWorker.name)}`,
        {
          method: 'DELETE',
          headers,
        },
      );

      if (response.ok) {
        toast.success('تم حذف العامل بنجاح');
        await fetchWorkers();
        setDeleteWorker(null);
      } else {
        toast.error('فشل في حذف العامل');
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('حدث خطأ في حذف العامل');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      day: '',
      date: '',
      withdrawal: '',
    });
    setEditingWorker(null);
    setSelectedDate(undefined);
    setEditSelectedDate(undefined);
  };

  const handleInputChange = (
    field: keyof WorkerRecord,
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

  // Role-based access control
  const permissions = getRolePermissions('حسابات عمال سنتر دلع الهوانم');

  // Check if user can access this component
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-[95vw] max-w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] 2xl:w-[70vw] h-[90vh] sm:h-[95vh] max-h-[90vh] sm:max-h-[95vh] backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Professional Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-transparent to-slate-800/30 rounded-3xl" />
          <motion.div
            className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-32 -left-32 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"
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
                  className="bg-blue-600/20 border border-blue-500/30 rounded-xl backdrop-blur-sm p-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Building2 className="w-6 h-6 text-blue-400" />
                </motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
                    حسابات عمال سنتر دلع الهوانم
                  </h2>
                  <p className="text-slate-300 text-sm mt-1">
                    إدارة حسابات العمال وسحوباتهم
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
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-2 sm:p-4 md:p-6 relative z-10 space-y-6">
              {/* Professional Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-blue-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          إجمالي العمال
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {workers.length}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">عامل نشط</p>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3">
                        <UserCircle className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-emerald-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          إجمالي السحوبات
                        </p>
                        <p className="text-emerald-400 text-2xl font-bold mt-1 truncate">
                          {formatCurrency(
                            workers.reduce(
                              (total, worker) =>
                                total + toNumber(worker.withdrawal),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          جميع المعاملات
                        </p>
                      </div>
                      <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3">
                        <DollarSign className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:border-amber-400/50 sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-sm font-medium">
                          متوسط السحب
                        </p>
                        <p className="text-amber-400 text-2xl font-bold mt-1 truncate">
                          {formatCurrency(
                            workers.length > 0
                              ? workers.reduce(
                                  (total, worker) =>
                                    total + toNumber(worker.withdrawal),
                                  0,
                                ) / workers.length
                              : 0,
                          )}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">لكل عامل</p>
                      </div>
                      <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
                        <Calculator className="w-8 h-8 text-amber-400" />
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
                      <Plus className="w-5 h-5 ml-2 text-blue-400" />
                      إضافة عامل جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Name */}
                        <div className="space-y-2 lg:col-span-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-300 font-medium text-sm"
                          >
                            اسم العامل
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange('name', e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-11 backdrop-blur-sm"
                            placeholder="أدخل اسم العامل"
                            required
                          />
                        </div>
                        {/* Day */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="day"
                            className="text-slate-300 font-medium text-sm"
                          >
                            اليوم
                          </Label>
                          <Select
                            value={formData.day}
                            onValueChange={(value) =>
                              handleInputChange('day', value)
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white h-11 backdrop-blur-sm">
                              <SelectValue placeholder="اختر اليوم" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800/95 border-slate-600 backdrop-blur-xl">
                              {daysOfWeek.map((day) => (
                                <SelectItem
                                  key={day}
                                  value={day}
                                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                                >
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                                    'text-white hover:bg-blue-600/20 hover:text-blue-300 border border-slate-600/50 rounded-md transition-colors',
                                  nav_button_previous:
                                    'text-white hover:bg-blue-600/20 hover:text-blue-300',
                                  nav_button_next:
                                    'text-white hover:bg-blue-600/20 hover:text-blue-300',
                                  table: 'text-white bg-slate-800',
                                  head_row:
                                    'text-white border-b border-slate-600/30',
                                  head_cell:
                                    'text-slate-300 font-medium pb-1 text-xs',
                                  row: 'text-white',
                                  cell: 'text-white hover:bg-blue-600/10 rounded-md transition-colors',
                                  day: 'text-white hover:bg-blue-600/20 hover:text-blue-200 focus:bg-blue-600 focus:text-white rounded-md transition-all duration-200 text-xs h-7 w-7',
                                  day_selected:
                                    'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-lg font-bold border-2 border-blue-400 !bg-blue-600',
                                  day_today:
                                    'text-blue-300 border border-blue-500/30 font-semibold',
                                  day_outside:
                                    'text-slate-500 hover:text-slate-400',
                                  day_disabled:
                                    'text-slate-600 opacity-50 cursor-not-allowed',
                                  day_range_middle: 'bg-blue-500/30',
                                  day_hidden: 'invisible',
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        {/* Withdrawal */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="withdrawal"
                            className="text-slate-300 font-medium text-sm"
                          >
                            السحبة (جنيه)
                          </Label>
                          <Input
                            id="withdrawal"
                            type="number"
                            value={formData.withdrawal}
                            onChange={(e) =>
                              handleInputChange(
                                'withdrawal',
                                convertToNumber(e.target.value),
                              )
                            }
                            className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-11 backdrop-blur-sm"
                            placeholder="أدخل المبلغ"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-slate-600/30">
                        {editingWorker && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white px-6 py-2 h-11 backdrop-blur-sm bg-transparent"
                          >
                            إلغاء
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-8 py-2 h-11"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                          ) : (
                            <Plus className="w-4 h-4 ml-2" />
                          )}
                          {editingWorker ? 'تحديث' : 'إضافة'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Search and Filter Section */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                          className="w-full bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 text-right pr-10 rounded-xl h-11"
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
                      {/* Filter Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => setShowFilters(!showFilters)}
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 flex items-center gap-2 h-11 px-4"
                        >
                          <Filter className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
                          </span>
                          <span className="sm:hidden">فلتر</span>
                        </Button>

                        {((selectedMonth && selectedMonth !== 'all') ||
                          selectedYear !==
                            new Date().getFullYear().toString() ||
                          selectedName) && (
                          <Button
                            onClick={clearFilters}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-11 px-4"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline ml-2">
                              مسح الفلاتر
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-600/30"
                      >
                        {/* Name Filter */}
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-right block text-sm">
                            البحث بالاسم
                          </Label>
                          <Input
                            type="text"
                            placeholder="اسم العامل..."
                            value={selectedName}
                            onChange={(e) => setSelectedName(e.target.value)}
                            className="bg-slate-700/50 border-slate-600/50 text-white text-right h-11"
                          />
                        </div>
                        {/* Month Filter */}
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-right block text-sm">
                            الشهر
                          </Label>
                          <Select
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                          >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white text-right h-11">
                              <SelectValue placeholder="اختر الشهر" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="all">جميع الشهور</SelectItem>
                              {months.map((month) => (
                                <SelectItem
                                  key={month.value}
                                  value={month.value}
                                >
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Year Filter */}
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-right block text-sm">
                            السنة
                          </Label>
                          <Select
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                          >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white text-right h-11">
                              <SelectValue placeholder="اختر السنة" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}
                    {searchQuery && (
                      <motion.p
                        className="text-sm text-slate-400 mt-3 text-right"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {filteredWorkers.length} نتيجة من أصل {workers.length}{' '}
                        سجل
                      </motion.p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Data Table */}
              <Card className="bg-white/5 border border-slate-600/30 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Building2 className="w-5 h-5 ml-2 text-blue-400" />
                      سجلات العمال
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        إجمالي السجلات:{' '}
                        <span className="text-white font-medium">
                          {filteredWorkers.length}
                        </span>
                      </span>
                    </div>
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
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                      />
                      <span className="text-white mr-4 text-base">
                        جاري تحميل البيانات...
                      </span>
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">
                        {searchQuery
                          ? 'لا توجد نتائج للبحث'
                          : 'لا توجد سجلات عمال'}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        {searchQuery
                          ? 'جرب البحث بكلمات أخرى'
                          : 'قم بإضافة عمال جدد للبدء'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Scrollable Table Container */}
                      <div className="max-h-[400px] overflow-y-auto rounded-xl border border-slate-600/30 backdrop-blur-sm">
                        <Table className="w-full">
                          <TableHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
                            <TableRow className="border-slate-600/30 hover:bg-slate-800/30">
                              <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                                اسم العامل
                              </TableHead>
                              <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                                اليوم
                              </TableHead>
                              <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                                التاريخ
                              </TableHead>
                              <TableHead className="text-slate-300 font-semibold text-right px-4 py-4 whitespace-nowrap">
                                السحبة
                              </TableHead>
                              <TableHead className="text-slate-300 font-semibold text-center px-4 py-4 whitespace-nowrap">
                                حالة الحضور
                              </TableHead>
                              <TableHead className="text-slate-300 font-semibold text-center px-4 py-4 whitespace-nowrap">
                                الإجراءات
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredWorkers.map((worker, index) => (
                              <TableRow
                                key={worker._id || index}
                                className="border-slate-600/30 hover:bg-slate-800/20 transition-colors duration-200"
                              >
                                <TableCell className="text-white px-4 py-4">
                                  <div className="font-medium truncate max-w-[150px]">
                                    {worker.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-300 px-4 py-4 whitespace-nowrap">
                                  {worker.day}
                                </TableCell>
                                <TableCell className="text-slate-300 px-4 py-4 whitespace-nowrap">
                                  {format(new Date(worker.date), 'dd/MM/yyyy', {
                                    locale: ar,
                                  })}
                                </TableCell>
                                <TableCell className="text-emerald-400 px-4 py-4 whitespace-nowrap">
                                  <span className="font-semibold">
                                    {worker.withdrawal} جنيه
                                  </span>
                                </TableCell>
                                <TableCell className="text-center px-4 py-4 whitespace-nowrap">
                                  {getAttendanceStatusBadge(worker.attendanceStatus, () => handleMarkAttendance(worker))}
                                </TableCell>
                                <TableCell className="text-center px-4 py-4 whitespace-nowrap">
                                  <div className="flex justify-center space-x-2 space-x-reverse">
                                    {permissions.canEdit && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(worker)}
                                        className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-300 transition-all duration-300 h-8 w-8 p-0"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {permissions.canDelete && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeleteWorker(worker)}
                                        className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300 h-8 w-8 p-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Professional Filtered Totals */}
                      {((selectedMonth && selectedMonth !== 'all') ||
                        selectedYear !== new Date().getFullYear().toString() ||
                        selectedName) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="p-6 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border border-blue-500/20 rounded-xl backdrop-blur-sm"
                        >
                          <div className="text-center mb-6">
                            <h3 className="text-blue-300 text-lg font-semibold">
                              ملخص البيانات المفلترة
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                              <div className="text-blue-300 text-sm mb-2 font-medium">
                                إجمالي السجلات
                              </div>
                              <div className="text-white text-2xl font-bold">
                                {filteredWorkers.length}
                              </div>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                              <div className="text-emerald-300 text-sm mb-2 font-medium">
                                إجمالي السحوبات
                              </div>
                              <div className="text-emerald-400 text-2xl font-bold truncate">
                                {formatCurrency(
                                  filteredWorkers.reduce(
                                    (total, worker) =>
                                      total + toNumber(worker.withdrawal || 0),
                                    0,
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                              <div className="text-amber-300 text-sm mb-2 font-medium">
                                متوسط السحب
                              </div>
                              <div className="text-amber-400 text-2xl font-bold truncate">
                                {formatCurrency(
                                  filteredWorkers.length > 0
                                    ? filteredWorkers.reduce(
                                        (total, worker) =>
                                          total +
                                          toNumber(worker.withdrawal || 0),
                                        0,
                                      ) / filteredWorkers.length
                                    : 0,
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
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

        {/* Professional Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-slate-900/95 border-slate-700 w-[95vw] sm:w-[90vw] max-w-2xl backdrop-blur-xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-6 border-b border-slate-700/50">
              <DialogTitle className="text-white text-xl font-semibold">
                تعديل بيانات العامل
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                تعديل معلومات العامل:{' '}
                <span className="text-blue-400 font-medium">
                  {editingWorker?.name}
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
                      اسم العامل
                    </Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm h-11"
                      placeholder="أدخل اسم العامل"
                      required
                    />
                  </div>
                  {/* Day */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-day"
                      className="text-slate-300 font-medium"
                    >
                      اليوم
                    </Label>
                    <Select
                      value={editFormData.day}
                      onValueChange={(value) => handleInputChange('day', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white backdrop-blur-sm h-11">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 border-slate-700 backdrop-blur-xl">
                        {daysOfWeek.map((day) => (
                          <SelectItem
                            key={day}
                            value={day}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                              'text-white hover:bg-blue-600/20 hover:text-blue-300 border border-slate-600/50 rounded-md transition-colors',
                            nav_button_previous:
                              'text-white hover:bg-blue-600/20 hover:text-blue-300',
                            nav_button_next:
                              'text-white hover:bg-blue-600/20 hover:text-blue-300',
                            table: 'text-white bg-slate-800',
                            head_row: 'text-white border-b border-slate-600/30',
                            head_cell: 'text-slate-300 font-medium pb-2',
                            row: 'text-white',
                            cell: 'text-white hover:bg-blue-600/10 rounded-md transition-colors',
                            day: 'text-white hover:bg-blue-600/20 hover:text-blue-200 focus:bg-blue-600 focus:text-white rounded-md transition-all duration-200',
                            day_selected:
                              'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-lg font-bold border-2 border-blue-400 !bg-blue-600',
                            day_today:
                              'text-blue-300 border border-blue-500/30 font-semibold',
                            day_outside: 'text-slate-500 hover:text-slate-400',
                            day_disabled:
                              'text-slate-600 opacity-50 cursor-not-allowed',
                            day_range_middle: 'bg-blue-500/30',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Withdrawal */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-withdrawal"
                      className="text-slate-300 font-medium"
                    >
                      السحبة (جنيه)
                    </Label>
                    <Input
                      id="edit-withdrawal"
                      type="number"
                      value={editFormData.withdrawal}
                      onChange={(e) =>
                        handleInputChange(
                          'withdrawal',
                          convertToNumber(e.target.value),
                        )
                      }
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm h-11"
                      placeholder="أدخل المبلغ"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
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
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-8 h-11"
                  >
                    تحديث
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Dialog */}
        <Dialog
          open={showAttendanceDialog}
          onOpenChange={setShowAttendanceDialog}
        >
          <DialogContent className="bg-slate-900/95 border-slate-700 w-[95vw] sm:w-[90vw] max-w-md backdrop-blur-xl">
            <DialogHeader className="pb-6 border-b border-slate-700/50">
              <DialogTitle className="text-white text-xl font-semibold">
                تسجيل الحضور
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                تسجيل حضور العامل:{' '}
                <span className="text-blue-400 font-medium">
                  {selectedWorkerForAttendance?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Status Selection */}
              <div className="space-y-3">
                <Label className="text-slate-300 font-medium">حالة الحضور</Label>
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
                    <Label className="text-slate-300 font-medium">وقت الدخول</Label>
                    <Input
                      type="time"
                      value={attendanceFormData.checkInTime}
                      onChange={(e) => setAttendanceFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-400 focus:ring-blue-400/20 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">وقت الخروج</Label>
                    <Input
                      type="time"
                      value={attendanceFormData.checkOutTime}
                      onChange={(e) => setAttendanceFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-400 focus:ring-blue-400/20 h-11"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">ملاحظات (اختياري)</Label>
                <Input
                  value={attendanceFormData.notes}
                  onChange={(e) => setAttendanceFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                  placeholder="أدخل أي ملاحظات..."
                />
              </div>

              {/* Working Hours Display */}
              {attendanceFormData.checkInTime && attendanceFormData.checkOutTime && attendanceFormData.status !== 'absent' && (
                <div className="p-3 bg-slate-800/30 border border-slate-600/30 rounded-lg">
                  <div className="text-slate-300 text-sm">
                    عدد ساعات العمل: 
                    <span className="text-blue-400 font-semibold ml-2">
                      {calculateWorkingHours(attendanceFormData.checkInTime, attendanceFormData.checkOutTime)} ساعة
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t border-slate-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white px-6 h-11"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSaveAttendance}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 h-11"
              >
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Professional Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteWorker}
          onOpenChange={() => setDeleteWorker(null)}
        >
          <AlertDialogContent className="bg-slate-900/95 border-slate-700 w-[90vw] max-w-md backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-lg">
                تأكيد الحذف
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                هل أنت متأكد من حذف عامل "
                <span className="text-red-400 font-medium">
                  {deleteWorker?.name}
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
      </div>
    </AnimatePresence>
  );
};

export default CenterDelaaHawanemWorkers;
