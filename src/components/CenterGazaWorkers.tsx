import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRolePermissions } from '@/utils/roleUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Calculator,
  TrendingDown,
  
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterGazaWorkersProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkerData {
  _id: string;
  name: string;
  day: string;
  date: string;
  withdrawal: number;
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
  day: string;
  withdrawal: string;
}

const CenterGazaWorkers: React.FC<CenterGazaWorkersProps> = ({
  isOpen,
  onClose,
}) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    day: '',
    withdrawal: '',
  });
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);
  const [deleteWorkerName, setDeleteWorkerName] = useState<string | null>(null);
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
  const [selectedWorkerForAttendance, setSelectedWorkerForAttendance] = useState<WorkerData | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<
    'present' | 'absent' | 'late' | 'half-day'
  >('present');
  const [attendanceDate, setAttendanceDate] = useState<Date | undefined>(
    new Date()
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

  // Attendance utility functions
  const loadAttendanceData = (): AttendanceRecord[] => {
    try {
      const cookieData = Cookies.get('centerGazaWorkersAttendanceData');
      if (cookieData) {
        return JSON.parse(cookieData);
      }
      
      const localData = localStorage.getItem('centerGazaWorkersAttendanceData');
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
      Cookies.set('centerGazaWorkersAttendanceData', dataString, { expires: 365 });
      // Save to localStorage (backup)
      localStorage.setItem('centerGazaWorkersAttendanceData', dataString);
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

  const handleMarkAttendance = (worker: WorkerData) => {
    setSelectedWorkerForAttendance(worker);
    
    // Check if attendance already exists for this worker and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) => record.employeeName === worker.name && record.date === worker.date
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
    
    setAttendanceDate(new Date(worker.date));
    setShowAttendanceDialog(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedWorkerForAttendance || !attendanceDate) return;

    try {
      const workingHours = timeIn && timeOut
        ? calculateWorkingHours(timeIn, timeOut)
        : 0;

      // Create attendance record
      const attendanceRecord: AttendanceRecord = {
        _id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeName: selectedWorkerForAttendance.name,
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
      const attendanceDateFormatted = format(attendanceDate, 'yyyy-MM-dd');
      const filteredAttendance = existingAttendance.filter(
        (record: AttendanceRecord) => !(record.employeeName === selectedWorkerForAttendance.name && record.date === attendanceDateFormatted)
      );
      
      // Add the new/updated record
      const updatedAttendance = [...filteredAttendance, attendanceRecord];
      
      toast.success(existingAttendance.length !== filteredAttendance.length ? 'تم تحديث الحضور بنجاح' : 'تم تسجيل الحضور بنجاح');

      // Save to cookies and localStorage
      saveAttendanceData(updatedAttendance);

      // Update the worker's attendance status in the local state
      setWorkers(prevWorkers => 
        prevWorkers.map(worker => {
          // Normalize both dates to yyyy-MM-dd format for comparison
          const workerDateNormalized = format(new Date(worker.date), 'yyyy-MM-dd');
          const attendanceDateNormalized = format(attendanceDate, 'yyyy-MM-dd');
          
          return worker.name === selectedWorkerForAttendance.name && workerDateNormalized === attendanceDateNormalized
            ? { 
                ...worker, 
                attendanceStatus: attendanceStatus,
                checkInTime: timeIn,
                checkOutTime: timeOut,
                attendanceNotes: attendanceNotes
              }
            : worker;
        })
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

  // Calculate totals for the filtered workers
  const totals = filteredWorkers.reduce(
    (acc, worker) => {
      acc.totalWithdrawals += worker.withdrawal;
      acc.workerCount = filteredWorkers.length;
      return acc;
    },
    { totalWithdrawals: 0, workerCount: 0 }
  );

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز التفويض');
      }

      console.log('Fetching workers with token:', !!token);
      console.log('API endpoint:', 'https://backend-omar-puce.vercel.app/api/worker-center-gaza-account');

      const response = await fetch('https://backend-omar-puce.vercel.app/api/worker-center-gaza-account', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || 'فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Raw response data:', data);
      
      // Handle different response formats
      let workersArray = [];
      if (data.data && Array.isArray(data.data)) {
        workersArray = data.data;
        console.log('Using data.data array');
      } else if (data.account && Array.isArray(data.account)) {
        workersArray = data.account;
        console.log('Using data.account array');
      } else if (Array.isArray(data)) {
        workersArray = data;
        console.log('Using direct data array');
      } else {
        console.log('Unknown response format:', data);
      }
      
      console.log('Final workers array:', workersArray);
      
      // Load attendance data and merge with workers
      const attendanceData = loadAttendanceData();
      const workersWithAttendance = workersArray.map((worker: WorkerData) => {
        // Normalize worker date to yyyy-MM-dd format for consistent comparison
        const workerDateNormalized = format(new Date(worker.date), 'yyyy-MM-dd');
        const attendance = attendanceData.find(
          (record: AttendanceRecord) => 
            record.employeeName === worker.name && record.date === workerDateNormalized
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
    } catch (error) {
      console.error('Error fetching workers:', error);
      console.error('Full error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to convert Arabic day names to numbers
  const convertDayToNumber = (dayName: string): string => {
    const dayMap: { [key: string]: string } = {
      'السبت': '1',
      'الاحد': '2',
      'الاثنين': '3',
      'الثلاثاء': '4',
      'الاربعاء': '5',
      'الخميس': '6',
      'الجمعه': '7'
    };
    
    const result = dayMap[dayName] || dayName;
    console.log(`Converting day: "${dayName}" -> "${result}"`);
    return result;
  };

  // Function to convert numbers back to Arabic day names
  const convertNumberToDay = (dayNumber: string): string => {
    const numberMap: { [key: string]: string } = {
      '1': 'السبت',
      '2': 'الاحد',
      '3': 'الاثنين',
      '4': 'الثلاثاء',
      '5': 'الاربعاء',
      '6': 'الخميس',
      '7': 'الجمعه'
    };
    
    return numberMap[dayNumber] || dayNumber; // Return the day name if found, otherwise return original value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    if (!formData.name || !formData.day || !formData.withdrawal) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        console.error('No access token found');
        toast.error('لم يتم العثور على رمز التفويض');
        return;
      }

      const convertedDay = convertDayToNumber(formData.day);
      
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
        "الاسم": formData.name,
        "اليوم": convertedDay,
        "التاريخ": format(date, 'yyyy-MM-dd'),
        "السحب": convertToNumber(formData.withdrawal),
      };

      // Additional validation for converted day
      if (!['1', '2', '3', '4', '5', '6', '7'].includes(convertedDay)) {
        console.error('Invalid day conversion:', formData.day, '->', convertedDay);
        toast.error('يوم العمل غير صحيح');
        return;
      }

      // Validate all fields are present and valid
      if (!submitData["الاسم"] || !submitData["اليوم"] || !submitData["التاريخ"] || 
          (submitData["السحب"] !== "0" && !submitData["السحب"])) {
        console.error('Missing required fields:', submitData);
        toast.error('جميع الحقول مطلوبة');
        return;
      }

      if (typeof submitData["السحب"] === 'number' && isNaN(submitData["السحب"])) {
        console.error('Invalid withdrawal amount:', formData.withdrawal);
        toast.error('مبلغ السحب غير صحيح');
        return;
      }

      const url = editingWorker
        ? `https://backend-omar-puce.vercel.app/api/worker-center-gaza-account/${editingWorker.name}`
        : 'https://backend-omar-puce.vercel.app/api/worker-center-gaza-account';

      const method = editingWorker ? 'PUT' : 'POST';

      console.log('Original day:', formData.day);
      console.log('Converted day:', convertDayToNumber(formData.day));
      console.log('Sending data to API:', submitData);
      console.log('API URL:', url);
      console.log('Method:', method);
      console.log('Token exists:', !!token);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          method,
          sentData: submitData
        });
        throw new Error(errorData.message || `HTTP ${response.status}: فشل في حفظ البيانات`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      toast.success(editingWorker ? 'تم تحديث البيانات بنجاح' : 'تم إضافة العامل بنجاح');
      
      // Reset form
      setFormData({
        name: '',
        day: '',
        withdrawal: '',
      });
      setDate(undefined);
      setEditingWorker(null);
      setShowForm(false);
      
      // Refresh data
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      console.error('Form data:', formData);
      console.error('Date:', date);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker: WorkerData) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      day: convertNumberToDay(worker.day),
      withdrawal: worker.withdrawal.toString(),
    });
    setDate(new Date(worker.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteWorkerName) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        console.error('No access token found for delete');
        toast.error('لم يتم العثور على رمز التفويض');
        return;
      }

      const deleteUrl = `https://backend-omar-puce.vercel.app/api/worker-center-gaza-account/${encodeURIComponent(deleteWorkerName)}`;
      console.log('Delete URL:', deleteUrl);
      console.log('Delete worker name:', deleteWorkerName);
      console.log('Encoded worker name:', encodeURIComponent(deleteWorkerName));
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      // Get response text first to see what the server is actually returning
      const responseText = await response.text();
      console.log('Delete response text:', responseText);

      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { message: responseText || `HTTP ${response.status}` };
        }
        
        console.error('Delete Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          deleteUrl,
          workerName: deleteWorkerName,
          responseText
        });
        throw new Error(errorData.message || `فشل في حذف البيانات - HTTP ${response.status}: ${response.statusText}`);
      }

      let responseData = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.log('Response is not JSON, treating as success');
        responseData = { message: 'تم الحذف بنجاح' };
      }
      console.log('Delete success response:', responseData);

      toast.success('تم حذف العامل بنجاح');
      setDeleteWorkerName(null);
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      day: '',
      withdrawal: '',
    });
    setDate(undefined);
    setEditingWorker(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen, fetchWorkers]);

  // Role-based access control
  const permissions = getRolePermissions('حسابات عمال سنتر غزة');
  
  // Check if user can access this component
 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
        <DialogHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            حساب عمال سنتر غزة
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">
            إدارة حسابات عمال سنتر غزة ومتابعة السحوبات اليومية
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800">
          <div className="flex flex-col min-h-0 p-4 space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة عامل جديد
              </Button>
              <Button
                onClick={fetchWorkers}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
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
                    {filteredWorkers.length}
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
                      اسم العامل
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
                    {filteredWorkers.length} نتيجة من أصل{' '}
                    {workers.length} سجل
                  </span>
                  {((selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString() || selectedName) && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">الفلاتر النشطة:</span>
                      {selectedName && (
                        <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/50 px-2 py-1">
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

          {/* Totals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <motion.div 
              className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">عدد العمال</p>
                  <p className="text-2xl font-bold text-white">
                    {totals.workerCount}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">إجمالي السحوبات</p>
                  <p className="text-2xl font-bold text-white">
                    {totals.totalWithdrawals.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">متوسط السحب</p>
                  <p className="text-2xl font-bold text-white">
                    {totals.workerCount > 0 ? 
                      Math.round(totals.totalWithdrawals / totals.workerCount).toLocaleString() 
                      : '0'
                    }
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Calculator className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scrollable Table Container */}
          <div className="flex-1 overflow-auto min-h-0 bg-gray-800/30 rounded-lg border border-gray-700/50 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-800 z-10">
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">الاسم</TableHead>
                  <TableHead className="text-gray-300 text-right">اليوم</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">السحب</TableHead>
                  <TableHead className="text-gray-300 text-right">الحضور</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredWorkers.map((worker, index) => (
                    <motion.tr
                      key={worker._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right font-medium">{worker.name}</TableCell>
                      <TableCell className="text-right">{convertNumberToDay(worker.day)}</TableCell>
                      <TableCell className="text-right">
                        {format(new Date(worker.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-400 font-bold">
                          {worker.withdrawal.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getAttendanceStatusBadge(
                          worker.attendanceStatus,
                          () => handleMarkAttendance(worker)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {permissions.canEdit && (
                            <Button
                              onClick={() => handleEdit(worker)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              onClick={() => setDeleteWorkerName(worker.name)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {filteredWorkers.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد بيانات عمال'}
                </p>
                <p className="text-sm">
                  {searchQuery
                    ? 'جرب كلمة بحث أخرى'
                    : 'اضغط على "إضافة عامل جديد" لبدء الإدخال'}
                </p>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Attendance Dialog */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent className="max-w-md max-h-[70vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                تسجيل حضور العامل
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                {selectedWorkerForAttendance?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">حالة الحضور</Label>
                  <Select
                    value={attendanceStatus}
                    onValueChange={(value) => setAttendanceStatus(value as 'present' | 'absent' | 'late' | 'half-day')}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="present" className="text-green-400 hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          حاضر
                        </div>
                      </SelectItem>
                      <SelectItem value="absent" className="text-red-400 hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4" />
                          غائب
                        </div>
                      </SelectItem>
                      <SelectItem value="late" className="text-yellow-400 hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          متأخر
                        </div>
                      </SelectItem>
                      <SelectItem value="half-day" className="text-cyan-400 hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          نصف يوم
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">وقت الدخول</Label>
                  <Input
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="bg-gray-700/50 border-gray-600/50 text-white"
                    disabled={attendanceStatus === 'absent'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">وقت الخروج</Label>
                <Input
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  className="bg-gray-700/50 border-gray-600/50 text-white"
                  disabled={attendanceStatus === 'absent'}
                />
              </div>

              {timeIn && timeOut && attendanceStatus !== 'absent' && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-300 text-sm mb-1">ساعات العمل</div>
                  <div className="text-white font-bold text-lg">
                    {calculateWorkingHours(timeIn, timeOut)} ساعة
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">ملاحظات</Label>
                <Textarea
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  placeholder="أضف ملاحظات إضافية..."
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 resize-none h-20"
                />
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 space-y-2">
                <h4 className="text-gray-300 text-sm font-medium mb-2">معلومات إضافية</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• حاضر: الموظف حضر في الموعد المحدد</div>
                  <div>• غائب: الموظف لم يحضر في هذا اليوم</div>
                  <div>• متأخر: الموظف حضر بعد الموعد المحدد</div>
                  <div>• نصف يوم: الموظف عمل نصف يوم فقط</div>
                </div>
              </div>

              {/* Date Information */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="text-sm text-orange-300">
                  <div className="font-medium mb-1">تاريخ العمل</div>
                  <div className="text-gray-300">
                    {attendanceDate && format(attendanceDate, 'yyyy/MM/dd', { locale: ar })}
                  </div>
                </div>
              </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAttendanceDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSaveAttendance}
                className="bg-gradient-to-l from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white"
              >
                حفظ الحضور
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg max-h-[70vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-bold text-white">
                {editingWorker ? 'تعديل بيانات العامل' : 'إضافة عامل جديد'}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div>
                <Label className="text-gray-300 text-right block mb-2">الاسم</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="اسم العامل"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">اليوم</Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => handleInputChange('day', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-right">
                    <SelectValue placeholder="اختر يوم العمل" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="السبت">السبت</SelectItem>
                    <SelectItem value="الاحد">الأحد</SelectItem>
                    <SelectItem value="الاثنين">الاثنين</SelectItem>
                    <SelectItem value="الثلاثاء">الثلاثاء</SelectItem>
                    <SelectItem value="الاربعاء">الأربعاء</SelectItem>
                    <SelectItem value="الخميس">الخميس</SelectItem>
                    <SelectItem value="الجمعه">الجمعة</SelectItem>
                  </SelectContent>
                </Select>
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

              <div>
                <Label className="text-gray-300 text-right block mb-2">السحب</Label>
                <Input
                  type="number"
                  value={formData.withdrawal}
                  onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  placeholder="مبلغ السحب"
                  required
                />
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 space-y-2">
                <h4 className="text-gray-300 text-sm font-medium mb-2">إرشادات الإدخال</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• أدخل اسم العامل كاملاً</div>
                  <div>• اختر يوم العمل المحدد</div>
                  <div>• حدد تاريخ العمل بدقة</div>
                  <div>• أدخل مبلغ السحب بالضبط</div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="text-sm text-orange-300">
                  <div className="font-medium mb-1">حالة النموذج</div>
                  <div className="text-gray-300">
                    {editingWorker ? 'تعديل بيانات موجودة' : 'إضافة عامل جديد'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingWorker ? 'تحديث' : 'إضافة'}
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteWorkerName} onOpenChange={(open) => !open && setDeleteWorkerName(null)}>
          <AlertDialogContent className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف العامل "{deleteWorkerName}"؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Additional Warning Content */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 my-4">
              <h4 className="text-red-300 font-medium mb-2">تحذير مهم:</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>• سيتم حذف جميع بيانات العامل نهائياً</div>
                <div>• سيتم حذف سجلات الحضور المرتبطة</div>
                <div>• سيتم حذف السحوبات المسجلة</div>
                <div>• لا يمكن استرداد البيانات بعد الحذف</div>
              </div>
            </div>
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

export default CenterGazaWorkers;
