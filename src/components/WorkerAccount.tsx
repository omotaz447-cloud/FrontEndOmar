import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  Plus,
  Calendar,
  User,
  DollarSign,
  Save,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Filter,
  X,
  ChevronDown,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getRolePermissions } from '@/utils/roleUtils';

interface WorkerAccountData {
  _id?: string;
  id?: string;
  name: string;
  day: string;
  date: string;
  withdrawal: string;
  role?: string;
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

interface WorkerAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkerAccount: React.FC<WorkerAccountProps> = ({ isOpen, onClose }) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('حساب عمال البلينا');

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

  // Check if current user role is factory1-5 (updated to use permissions)
  const isFactoryRole = () => {
    return !permissions.canEdit && !permissions.canDelete;
  };

  const [formData, setFormData] = useState<WorkerAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [workers, setWorkers] = useState<WorkerAccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete states
  const [editingWorker, setEditingWorker] = useState<WorkerAccountData | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<WorkerAccountData>({
    name: '',
    day: '',
    date: '',
    withdrawal: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteWorker, setDeleteWorker] = useState<WorkerAccountData | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [selectedName, setSelectedName] = useState<string>('');
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerAccountData[]>(
    [],
  );
  const [showFilters, setShowFilters] = useState(false);

  // Attendance states
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedWorkerForAttendance, setSelectedWorkerForAttendance] = useState<WorkerAccountData | null>(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

  const days = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  // Function to convert Arabic day name to number
  const convertDayToNumber = (dayName: string): string => {
    const dayMap: { [key: string]: string } = {
      'الأحد': '1',
      'الاثنين': '2',
      'الثلاثاء': '3',
      'الأربعاء': '4',
      'الخميس': '5',
      'الجمعة': '6',
      'السبت': '7'
    };
    
    const result = dayMap[dayName] || dayName;
    console.log(`Converting day: "${dayName}" -> "${result}"`);
    return result;
  };

  // Function to convert number back to Arabic day name
  const convertNumberToDay = (dayNumber: string | number): string => {
    const numberMap: { [key: string]: string } = {
      '1': 'الأحد',
      '2': 'الاثنين',
      '3': 'الثلاثاء',
      '4': 'الأربعاء',
      '5': 'الخميس',
      '6': 'الجمعة',
      '7': 'السبت'
    };
    
    const key = String(dayNumber);
    return numberMap[key] || key;
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

  // Filter workers based on selected month, year, and name
  useEffect(() => {
    let filtered = workers;

    // Filter by name if provided
    if (selectedName) {
      filtered = filtered.filter((worker) =>
        worker.name.toLowerCase().includes(selectedName.toLowerCase()),
      );
    }

    // Filter by month and year
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter((worker) => {
        const workerDate = new Date(worker.date);
        const workerMonth = (workerDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        const workerYear = workerDate.getFullYear().toString();
        return workerMonth === selectedMonth && workerYear === selectedYear;
      });
    } else if (selectedMonth) {
      filtered = filtered.filter((worker) => {
        const workerDate = new Date(worker.date);
        const workerMonth = (workerDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        return workerMonth === selectedMonth;
      });
    } else if (selectedYear) {
      filtered = filtered.filter((worker) => {
        const workerDate = new Date(worker.date);
        const workerYear = workerDate.getFullYear().toString();
        return workerYear === selectedYear;
      });
    }

    setFilteredWorkers(filtered);
  }, [workers, selectedMonth, selectedYear, selectedName]);

  // Clear filters
  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedName('');
    setShowFilters(false);
  };

  // Get the workers to display (filtered or all)
  const workersToDisplay =
    selectedMonth ||
    selectedYear !== new Date().getFullYear().toString() ||
    selectedName
      ? filteredWorkers
      : workers;

  // Load attendance data from cookies and localStorage (same as Attendance component)
  const loadAttendanceData = useCallback((): AttendanceRecord[] => {
    try {
      // First try localStorage (most recent and complete)
      const stored = localStorage.getItem('attendanceSystem');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data || [];
      }

      // Fallback to cookies
      const cookieData = Cookies.get('attendanceData');
      if (cookieData) {
        const compactData = JSON.parse(cookieData);
        return compactData.map((item: {
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
        }));
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
    return [];
  }, []);

  // Save attendance data to cookies (same as Attendance component)
  const saveAttendanceData = useCallback((attendanceData: AttendanceRecord[]) => {
    try {
      // Save full data to localStorage
      const attendanceStorage = {
        data: attendanceData,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('attendanceSystem', JSON.stringify(attendanceStorage));

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
      Cookies.set('attendanceData', JSON.stringify(recentData), {
        expires: 365,
      });

      // Dispatch custom event for same-tab synchronization
      window.dispatchEvent(new CustomEvent('attendanceDataChanged'));

      console.log('Attendance data saved successfully');
    } catch (error) {
      console.error('Error saving attendance data:', error);
    }
  }, []);

  // Fetch existing worker accounts
  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/worker-account`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        const data = await response.json();
        const workersData = Array.isArray(data) ? data : [];
        
        // Load attendance data and merge with workers
        const attendanceData = loadAttendanceData();
        const workersWithAttendance = workersData.map((worker: WorkerAccountData) => {
          const attendance = attendanceData.find(
            (record: AttendanceRecord) => record.employeeName === worker.name && record.date === worker.date
          );
          
          if (attendance) {
            // Completely replace attendance fields with latest data
            return {
              ...worker,
              attendanceStatus: attendance.status,
              checkInTime: attendance.checkInTime,
              checkOutTime: attendance.checkOutTime,
              workingHours: attendance.workingHours,
              attendanceNotes: attendance.notes,
            };
          }
          
          // If no attendance record found, ensure attendance fields are cleared
          return {
            ...worker,
            attendanceStatus: undefined,
            checkInTime: undefined,
            checkOutTime: undefined,
            workingHours: undefined,
            attendanceNotes: undefined,
          };
        });
        
        setWorkers(workersWithAttendance);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        // Token error already handled in getAuthHeaders
        return;
      }
      toast.error('فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, [loadAttendanceData]);

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen, fetchWorkers]);

  // Function to update workers with latest attendance data without API call
  const updateWorkersWithAttendance = useCallback(() => {
    const attendanceData = loadAttendanceData();
    setWorkers(prevWorkers => 
      prevWorkers.map((worker: WorkerAccountData) => {
        const attendance = attendanceData.find(
          (record: AttendanceRecord) => record.employeeName === worker.name && record.date === worker.date
        );
        
        if (attendance) {
          // Completely replace attendance fields with latest data
          return {
            ...worker,
            attendanceStatus: attendance.status,
            checkInTime: attendance.checkInTime,
            checkOutTime: attendance.checkOutTime,
            workingHours: attendance.workingHours,
            attendanceNotes: attendance.notes,
          };
        }
        
        // If no attendance record found, clear attendance fields
        return {
          ...worker,
          attendanceStatus: undefined,
          checkInTime: undefined,
          checkOutTime: undefined,
          workingHours: undefined,
          attendanceNotes: undefined,
        };
      })
    );
  }, [loadAttendanceData]);

  // Listen for changes in attendance data (for synchronization with Attendance component)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'attendanceSystem' && isOpen) {
        // Update workers immediately with latest attendance data
        setTimeout(() => {
          updateWorkersWithAttendance();
        }, 100); // Small delay to ensure data is written
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for changes in the same tab using custom event
    const handleAttendanceChange = () => {
      if (isOpen) {
        // Update workers immediately when attendance changes in same tab
        setTimeout(() => {
          updateWorkersWithAttendance();
        }, 100); // Small delay to ensure data is written
      }
    };

    window.addEventListener('attendanceDataChanged', handleAttendanceChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('attendanceDataChanged', handleAttendanceChange);
    };
  }, [isOpen, updateWorkersWithAttendance]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.day ||
      !formData.date ||
      !formData.withdrawal
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/worker-account`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          name: '',
          day: '',
          date: '',
          withdrawal: '',
        });
        setSelectedDate(undefined);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        // Token error already handled in getAuthHeaders
        return;
      }
      toast.error('فشل في إضافة السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(parseFloat(amount) || 0);
  };

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it's an ISO string, parse and format it
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if formatting fails
    }
  };

  // Handle edit worker
  const handleEditWorker = (worker: WorkerAccountData) => {
    setEditingWorker(worker);
    setEditFormData({
      name: worker.name,
      day: convertNumberToDay(worker.day), // Convert number to Arabic name
      date: worker.date,
      withdrawal: worker.withdrawal,
    });
    // Set the selected date for the calendar picker
    if (worker.date) {
      setEditSelectedDate(new Date(worker.date));
    }
    setEditDialogOpen(true);
  };

  // Handle update worker (PUT request)
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editFormData.name ||
      !editFormData.day ||
      !editFormData.date ||
      !editFormData.withdrawal
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!editingWorker?.name) {
      toast.error('خطأ في تحديد السجل للتحديث');
      return;
    }

    // Convert day name to number for comparison and sending
    const convertedDay = convertDayToNumber(editFormData.day);
    
    // Convert withdrawal to string for comparison (since WorkerAccountData.withdrawal is string)
    const withdrawalAmount = typeof editFormData.withdrawal === 'string' 
      ? editFormData.withdrawal 
      : String(editFormData.withdrawal);

    // Create object with only changed fields
    const updatedFields: Partial<WorkerAccountData> = {};
    if (editFormData.name !== editingWorker.name)
      updatedFields.name = editFormData.name;
    if (convertedDay !== editingWorker.day)
      updatedFields.day = convertedDay;
    if (editFormData.date !== editingWorker.date)
      updatedFields.date = editFormData.date;
    if ( String(withdrawalAmount) !== editingWorker.withdrawal)
      updatedFields.withdrawal = String(withdrawalAmount);

    setIsSubmitting(true);
    try {
      const workerId = editingWorker.id || (editingWorker as any)._id;
      const response = await fetch(
        `${API_BASE_URL}/api/worker-account/${workerId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedFields),
        },
      );
      console.log('Update response:', response);
      if (response.ok) {
        toast.success('تم تحديث السجل بنجاح');
        setEditFormData({
          name: '',
          day: '',
          date: '',
          withdrawal: '',
        });
        setEditSelectedDate(undefined);
        setEditingWorker(null);
        setEditDialogOpen(false);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحديث السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete worker
  const handleDeleteWorker = async () => {
    const workerId = deleteWorker?.id || (deleteWorker as any)?._id;
    if (!workerId) {
      toast.error('خطأ في تحديد السجل للحذف');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/worker-account/${workerId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        setDeleteWorker(null);
        fetchWorkers(); // Refresh the table
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في حذف السجل');
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingWorker(null);
    setEditDialogOpen(false);
    setEditFormData({
      name: '',
      day: '',
      date: '',
      withdrawal: '',
    });
    setEditSelectedDate(undefined);
  };

  // Attendance functions
  const handleMarkAttendance = (worker: WorkerAccountData) => {
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

      setShowAttendanceDialog(false);
      setSelectedWorkerForAttendance(null);

      // Update workers immediately with new attendance data
      setTimeout(() => {
        updateWorkersWithAttendance();
      }, 100);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
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
          <div className="flex items-center justify-between space-x-4 space-x-reverse text-right">
            <motion.div
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <User className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white text-right">
                حساب عمال البلينا
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-right">
                إدارة حسابات وانسحابات العمال
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي العمال</span>
                  <Users className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {workersToDisplay.length}
                </div>
                {(selectedMonth ||
                  selectedYear !== new Date().getFullYear().toString() ||
                  selectedName) && (
                  <div className="text-xs text-gray-400 text-right mt-1">
                    من إجمالي {workers.length} عامل
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50 relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="ml-2">الإجمالي</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <motion.div
                    className="text-2xl font-bold text-green-400 text-right"
                    key={workersToDisplay.reduce(
                      (total, worker) =>
                        total + (parseFloat(worker.withdrawal) || 0),
                      0,
                    )}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatCurrency(
                      workersToDisplay
                        .reduce(
                          (total, worker) =>
                            total + (parseFloat(worker.withdrawal) || 0),
                          0,
                        )
                        .toString(),
                    )}
                  </motion.div>
                  {(selectedMonth ||
                    selectedYear !== new Date().getFullYear().toString() ||
                    selectedName) && (
                    <motion.div
                      className="text-xs text-gray-400 text-right mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      المجموع المفلتر • الكل:{' '}
                      {formatCurrency(
                        workers
                          .reduce(
                            (total, worker) =>
                              total + (parseFloat(worker.withdrawal) || 0),
                            0,
                          )
                          .toString(),
                      )}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">السجلات الحديثة</span>
                  <TrendingUp className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 text-right">
                  {
                    workersToDisplay.filter((w) => {
                      const today = new Date().toISOString().split('T')[0];
                      return w.date === today;
                    }).length
                  }
                </div>
                {(selectedMonth ||
                  selectedYear !== new Date().getFullYear().toString() ||
                  selectedName) && (
                  <div className="text-xs text-gray-400 text-right mt-1">
                    في الفترة المحددة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6 bg-gray-700/50" />

          {/* Form Section */}
          <Card className="bg-gray-800/40 border-gray-700/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-right flex items-center justify-end">
                <span className="ml-2">إضافة سجل جديد</span>
                <Plus className="w-5 h-5 text-blue-400" />
              </CardTitle>
              <CardDescription className="text-gray-400 text-right">
                أدخل بيانات العامل والانسحاب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Name Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Label
                    htmlFor="name"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <User className="w-4 h-4" />
                    <span>اسم العامل</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم العامل"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Day Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, day: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right">
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {days.map((day) => (
                        <SelectItem
                          key={day}
                          value={day}
                          className="text-white"
                        >
                          {day}
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
                  transition={{ duration: 0.3, delay: 0.4 }}
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
                            {format(selectedDate, 'dd/MM/yyyy', { locale: ar })}
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
                              date: format(date, 'yyyy-MM-dd'),
                            });
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
                          caption:
                            'text-white bg-gray-800/80 rounded-t-lg pb-3',
                          caption_label: 'text-white font-semibold text-lg',
                          nav: 'text-white',
                          nav_button:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300 border border-gray-600/50 rounded-md transition-colors',
                          nav_button_previous:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300',
                          nav_button_next:
                            'text-white hover:bg-blue-600/20 hover:text-blue-300',
                          table: 'text-white bg-gray-800',
                          head_row: 'text-white border-b border-gray-600/30',
                          head_cell: 'text-gray-300 font-medium pb-2',
                          row: 'text-white',
                          cell: 'text-white hover:bg-blue-600/10 rounded-md transition-colors',
                          day: 'text-white hover:bg-blue-600/20 hover:text-blue-200 focus:bg-blue-600 focus:text-white rounded-md transition-all duration-200',
                          day_selected:
                            'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-lg font-bold border-2 border-blue-400 !bg-blue-600',
                          day_today:
                            'text-blue-300 border border-blue-500/30 font-semibold',
                          day_outside: 'text-gray-500 hover:text-gray-400',
                          day_disabled:
                            'text-gray-600 opacity-50 cursor-not-allowed',
                          day_range_middle: 'bg-blue-500/30',
                          day_hidden: 'invisible',
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>

                {/* Withdrawal Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Label
                    htmlFor="withdrawal"
                    className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>سحب</span>
                  </Label>
                  <Input
                    id="withdrawal"
                    name="withdrawal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.withdrawal}
                    onChange={handleInputChange}
                    placeholder="أدخل المبلغ"
                    className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                    required
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  className="md:col-span-2 lg:col-span-4 flex justify-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
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

          {/* Filter Section Above Table */}
          <Card className="bg-gray-800/40 border-gray-700/30 mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-right flex items-center">
                  <Filter className="w-5 h-5 ml-2" />
                  <span>تصفية البيانات</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <motion.div
              initial={false}
              animate={{
                height: showFilters ? 'auto' : 0,
                opacity: showFilters ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300 text-right">
                      اسم العامل
                    </Label>
                    <div className="flex gap-1">
                      <Input
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
                        placeholder="ابحث بالاسم..."
                        className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500 text-right"
                      />
                      {selectedName && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedName('')}
                          className="h-10 w-10 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Month Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300 text-right">
                      الشهر
                    </Label>
                    <div className="flex gap-1">
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="كل الشهور" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {months.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value}
                              className="text-white"
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedMonth && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMonth('')}
                          className="h-10 w-10 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300 text-right">
                      السنة
                    </Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {years.map((year) => (
                          <SelectItem
                            key={year}
                            value={year}
                            className="text-white"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Status and Clear Button */}
                {(selectedMonth ||
                  selectedYear !== new Date().getFullYear().toString() ||
                  selectedName) && (
                  <motion.div
                    className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-300 text-right">
                        <div>
                          عرض {workersToDisplay.length} من أصل {workers.length}{' '}
                          سجل
                        </div>
                        {selectedName && (
                          <div className="text-xs mt-1">
                            الاسم: "{selectedName}"
                          </div>
                        )}
                        {selectedMonth && (
                          <div className="text-xs mt-1">
                            الشهر:{' '}
                            {
                              months.find((m) => m.value === selectedMonth)
                                ?.label
                            }
                          </div>
                        )}
                        {selectedYear !==
                          new Date().getFullYear().toString() && (
                          <div className="text-xs mt-1">
                            السنة: {selectedYear}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <X className="w-4 h-4 ml-1" />
                        مسح الكل
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          </Card>

          {/* Table Section */}
          <Card className="bg-gray-800/40 border-gray-700/30">
            <CardHeader className="border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات العمال
                  </CardTitle>
                </div>
                <Button
                  onClick={fetchWorkers}
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
                جميع سجلات الانسحابات والحسابات
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اسم العامل
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        اليوم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        مبلغ الانسحاب
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الحالة
                      </TableHead>
                      {!isFactoryRole() && (
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
                          colSpan={!isFactoryRole() ? 6 : 5}
                          className="text-center py-8"
                        >
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : workersToDisplay.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={!isFactoryRole() ? 6 : 5}
                          className="text-center py-8 text-gray-400"
                        >
                          {selectedMonth ||
                          selectedYear !==
                            new Date().getFullYear().toString() ||
                          selectedName
                            ? 'لا توجد سجلات في الفترة المحددة'
                            : 'لا توجد سجلات متاحة'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      workersToDisplay.map((worker, index) => (
                        <motion.tr
                          key={worker.id || index}
                          className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="text-gray-300 font-medium text-right">
                            {worker.name}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {worker.day}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(worker.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-emerald-400 font-semibold">
                              {formatCurrency(worker.withdrawal)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              {getAttendanceStatusBadge(worker.attendanceStatus, () => handleMarkAttendance(worker))}
                            </div>
                          </TableCell>
                          {!isFactoryRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center space-x-2 space-x-reverse justify-end">
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditWorker(worker)}
                                    className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteWorker(worker)}
                                    className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))
                    )}

                    {/* Total Row when filtering */}
                    {(selectedMonth ||
                      selectedYear !== new Date().getFullYear().toString() ||
                      selectedName) &&
                      workersToDisplay.length > 0 && (
                        <motion.tr
                          className="border-t-2 border-blue-500/30 bg-blue-500/10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <TableCell
                            className="text-blue-300 font-bold text-right"
                            colSpan={4}
                          >
                            الإجمالي ({workersToDisplay.length} سجل)
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-400 font-bold text-lg">
                              {formatCurrency(
                                workersToDisplay
                                  .reduce(
                                    (total, worker) =>
                                      total +
                                      (parseFloat(worker.withdrawal) || 0),
                                    0,
                                  )
                                  .toString(),
                              )}
                            </span>
                          </TableCell>
                          {!isFactoryRole() && <TableCell></TableCell>}
                        </motion.tr>
                      )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Edit Worker Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => !open && handleCancelEdit()}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"
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
          <DialogHeader className="relative z-10 p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4 space-x-reverse text-right">
              <motion.div
                className="p-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Edit className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  تحديث سجل العامل
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  تحديث بيانات العامل "{editingWorker?.name}"
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Edit Form Content */}
          <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <Card className="bg-gray-800/40 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">تحديث البيانات</span>
                  <Edit className="w-5 h-5 text-green-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  تعديل بيانات العامل والانسحاب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUpdateWorker}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Name Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="edit-name"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <User className="w-4 h-4" />
                      <span>اسم العامل</span>
                    </Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      placeholder="أدخل اسم العامل"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Day Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="edit-day"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>اليوم</span>
                    </Label>
                    <Select
                      value={editFormData.day}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, day: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {days.map((day) => (
                          <SelectItem
                            key={day}
                            value={day}
                            className="text-white"
                          >
                            {day}
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
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label
                      htmlFor="edit-date"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>التاريخ</span>
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
                              setEditFormData((prev) => ({
                                ...prev,
                                date: format(date, 'yyyy-MM-dd'),
                              }));
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
                            caption:
                              'text-white bg-gray-800/80 rounded-t-lg pb-3',
                            caption_label: 'text-white font-semibold text-lg',
                            nav: 'text-white',
                            nav_button:
                              'text-white hover:bg-green-600/20 hover:text-green-300 border border-gray-600/50 rounded-md transition-colors',
                            nav_button_previous:
                              'text-white hover:bg-green-600/20 hover:text-green-300',
                            nav_button_next:
                              'text-white hover:bg-green-600/20 hover:text-green-300',
                            table: 'text-white bg-gray-800',
                            head_row: 'text-white border-b border-gray-600/30',
                            head_cell: 'text-gray-300 font-medium pb-2',
                            row: 'text-white',
                            cell: 'text-white hover:bg-green-600/10 rounded-md transition-colors',
                            day: 'text-white hover:bg-green-600/20 hover:text-green-200 focus:bg-green-600 focus:text-white rounded-md transition-all duration-200',
                            day_selected:
                              'bg-green-600 text-white hover:bg-green-700 hover:text-white shadow-lg font-bold border-2 border-green-400 !bg-green-600',
                            day_today:
                              'text-green-300 border border-green-500/30 font-semibold',
                            day_outside: 'text-gray-500 hover:text-gray-400',
                            day_disabled:
                              'text-gray-600 opacity-50 cursor-not-allowed',
                            day_range_middle: 'bg-green-500/30',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </motion.div>

                  {/* Withdrawal Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label
                      htmlFor="edit-withdrawal"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>سحب</span>
                    </Label>
                    <Input
                      id="edit-withdrawal"
                      name="withdrawal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.withdrawal}
                      onChange={handleEditInputChange}
                      placeholder="أدخل المبلغ"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-green-500 focus:border-green-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    className="md:col-span-2 flex justify-end space-x-3 space-x-reverse"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 px-6 py-3 rounded-xl font-medium"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
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
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteWorker}
        onOpenChange={(open) => !open && setDeleteWorker(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل العامل "{deleteWorker?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteWorker(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorker}
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

      {/* Attendance Dialog */}
      <Dialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
      >
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-blue-400 flex items-center justify-end">
              <Clock className="w-5 h-5 ml-2" />
              تسجيل البيانات
            </DialogTitle>
            {selectedWorkerForAttendance && (
              <p className="text-gray-300 text-right">
                العامل: {selectedWorkerForAttendance.name}
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Attendance Status */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-right block">
                الحالة
              </Label>
              <Select
                value={attendanceFormData.status}
                onValueChange={(value: 'present' | 'absent' | 'late' | 'half-day') =>
                  setAttendanceFormData(prev => ({
                    ...prev,
                    status: value
                  }))
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="half-day">نصف يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Check In Time */}
            {attendanceFormData.status !== 'absent' && (
              <div className="space-y-2">
                <Label className="text-gray-300 text-right block">
                  وقت الوصول
                </Label>
                <Input
                  type="time"
                  value={attendanceFormData.checkInTime}
                  onChange={(e) =>
                    setAttendanceFormData(prev => ({
                      ...prev,
                      checkInTime: e.target.value
                    }))
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Check Out Time */}
            {attendanceFormData.status === 'present' && (
              <div className="space-y-2">
                <Label className="text-gray-300 text-right block">
                  وقت الانصراف
                </Label>
                <Input
                  type="time"
                  value={attendanceFormData.checkOutTime}
                  onChange={(e) =>
                    setAttendanceFormData(prev => ({
                      ...prev,
                      checkOutTime: e.target.value
                    }))
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-right block">
                ملاحظات
              </Label>
              <textarea
                value={attendanceFormData.notes}
                onChange={(e) =>
                  setAttendanceFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))
                }
                className="w-full bg-gray-800 border-gray-600 text-white rounded-md p-2 resize-none"
                rows={3}
                placeholder="أضف ملاحظات إضافية..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start space-x-2 space-x-reverse pt-4">
              <Button
                onClick={() => setShowAttendanceDialog(false)}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveAttendance}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserCheck className="w-4 h-4 ml-2" />
                حفظ البيانات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default WorkerAccount;



