import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  CalendarIcon,
  Clock,
  Users,
  UserCheck,
  UserX,
  Timer,
  TrendingUp,
  Calendar as CalendarCheck,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import Cookies from 'js-cookie';

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



interface AttendanceProps {
  isOpen: boolean;
  onClose: () => void;
}

const Attendance: React.FC<AttendanceProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'today' | 'monthly' | 'all'>(
    'today',
  );
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({
    employeeName: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    notes: '',
  });

  // Calculate working hours
  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;

    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);

    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;

    const workingMinutes = outTotalMinutes - inTotalMinutes;
    return Math.max(0, workingMinutes / 60);
  };

  // Calculate statistics
  const calculateStats = useCallback((attendanceData: AttendanceRecord[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');

    const todayRecords = attendanceData.filter(
      (record) => record.date === today,
    );
    const monthlyRecords = attendanceData.filter((record) =>
      record.date.startsWith(currentMonth),
    );

    const uniqueEmployees = new Set(
      attendanceData.map((record) => record.employeeName),
    ).size;

    const presentToday = todayRecords.filter(
      (record) => record.status === 'present',
    ).length;
    const absentToday = todayRecords.filter(
      (record) => record.status === 'absent',
    ).length;
    const lateToday = todayRecords.filter(
      (record) => record.status === 'late',
    ).length;

    const totalWorkingHours = attendanceData
      .filter((record) => record.workingHours)
      .reduce((sum, record) => sum + (record.workingHours || 0), 0);

    const averageWorkingHours =
      attendanceData.length > 0 ? totalWorkingHours / attendanceData.length : 0;

    const presentDays = monthlyRecords.filter(
      (record) => record.status === 'present' || record.status === 'late',
    ).length;

    const monthlyAttendanceRate =
      monthlyRecords.length > 0
        ? (presentDays / monthlyRecords.length) * 100
        : 0;

    return {
      totalEmployees: uniqueEmployees,
      presentToday,
      absentToday,
      lateToday,
      averageWorkingHours: Number(averageWorkingHours.toFixed(1)),
      monthlyAttendanceRate: Number(monthlyAttendanceRate.toFixed(1)),
    };
  }, []);

  // Save attendance data to cookies (primary storage)
  const saveAttendanceData = useCallback(
    (attendanceData: AttendanceRecord[]) => {
      try {
        // Save full data to localStorage
        const attendanceStorage = {
          data: attendanceData,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(
          'attendanceSystem',
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
        Cookies.set('attendanceData', JSON.stringify(recentData), {
          expires: 365,
        });

        // Save stats separately for quick access
        const stats = calculateStats(attendanceData);
        Cookies.set('attendanceStats', JSON.stringify(stats), { expires: 7 });

        // Dispatch custom event for same-tab synchronization with WorkerAccount
        window.dispatchEvent(new CustomEvent('attendanceDataChanged'));

        console.log('Attendance data saved successfully');
      } catch (error) {
        console.error('Error saving attendance data:', error);
      }
    },
    [calculateStats],
  );

  // Load attendance data from cookies and localStorage
  const loadAttendanceData = (): AttendanceRecord[] => {
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
      console.error('Error loading attendance data:', error);
    }
    return [];
  };

  // Quick attendance marking for current time with employee name input

  // Fetch attendance records from cookies/localStorage only
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      // Load data from cookies and localStorage
      const localData = loadAttendanceData();
      setRecords(localData);

      console.log(
        'Loaded attendance records from local storage:',
        localData.length,
      );
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save attendance record (cookies only)
  const saveRecord = async (recordData: Partial<AttendanceRecord>) => {
    setLoading(true);
    try {
      const workingHours =
        recordData.checkInTime && recordData.checkOutTime
          ? calculateWorkingHours(
              recordData.checkInTime,
              recordData.checkOutTime,
            )
          : 0;

      const record: AttendanceRecord = {
        ...recordData,
        date: recordData.date || format(selectedDate, 'yyyy-MM-dd'),
        workingHours,
      } as AttendanceRecord;

      // Update local records
      const currentRecords = [...records];
      if (editingRecord && editingRecord._id) {
        // Remove existing record and add updated one to prevent duplicates
        const filteredRecords = currentRecords.filter(r => r._id !== editingRecord._id);
        record._id = editingRecord._id;
        filteredRecords.push(record);
        currentRecords.splice(0, currentRecords.length, ...filteredRecords);
      } else {
        // Remove any existing record for same employee and date, then add new one
        const filteredRecords = currentRecords.filter(
          r => !(r.employeeName === record.employeeName && r.date === record.date)
        );
        record._id = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        filteredRecords.push(record);
        currentRecords.splice(0, currentRecords.length, ...filteredRecords);
      }

      // Save to cookies and localStorage
      setRecords(currentRecords);
      saveAttendanceData(currentRecords);

      toast.success(
        editingRecord ? 'تم تحديث السجل بنجاح' : 'تم إضافة السجل بنجاح',
      );
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('فشل في حفظ السجل');
    } finally {
      setLoading(false);
    }
  };

  // Delete attendance record (cookies only)
  const deleteRecord = async () => {
    if (!deleteRecordId) return;

    setLoading(true);
    try {
      // Delete from local records
      const currentRecords = records.filter((r) => r._id !== deleteRecordId);

      // Update state and save to cookies
      setRecords(currentRecords);
      saveAttendanceData(currentRecords);

      toast.success('تم حذف السجل بنجاح');
      setDeleteRecordId(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('فشل في حذف السجل');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeName || !formData.checkInTime) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    await saveRecord(formData);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employeeName: '',
      checkInTime: '',
      checkOutTime: '',
      status: 'present',
      notes: '',
    });
    setEditingRecord(null);
    setShowForm(false);
    setSelectedDate(new Date());
  };

  // Handle edit
  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setSelectedDate(new Date(record.date));
    setShowForm(true);
  };

  // Filter records based on current view and search term
  const getFilteredRecords = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');

    let filtered: AttendanceRecord[];
    switch (currentView) {
      case 'today':
        filtered = records.filter((record) => record.date === today);
        break;
      case 'monthly':
        filtered = records.filter((record) => record.date.startsWith(currentMonth));
        break;
      default:
        filtered = records;
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((record) =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Get status badge
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const configs = {
      present: {
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20 border-emerald-500/50',
      },
      absent: {
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/20 border-red-500/50',
      },
      late: {
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/20 border-amber-500/50',
      },
      'half-day': {
        variant: 'outline' as const,
        icon: Timer,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/20 border-cyan-500/50',
      },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${config.bg} ${config.color} border`}
      >
        <Icon className="w-3 h-3" />
        {status === 'present' && 'حاضر'}
        {status === 'absent' && 'غائب'}
        {status === 'late' && 'متأخر'}
        {status === 'half-day' && 'نصف يوم'}
      </Badge>
    );
  };

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      const existingData = loadAttendanceData();
      if (existingData.length === 0) {
        // Initialize with sample data if no data exists
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sampleData: AttendanceRecord[] = [
          {
            _id: 'sample_1',
            employeeName: 'أحمد محمد',
            date: format(today, 'yyyy-MM-dd'),
            checkInTime: '09:00',
            checkOutTime: '17:00',
            status: 'present',
            workingHours: 8,
            notes: 'حضور منتظم',
          },
          {
            _id: 'sample_2',
            employeeName: 'فاطمة أحمد',
            date: format(today, 'yyyy-MM-dd'),
            checkInTime: '09:15',
            checkOutTime: '17:00',
            status: 'late',
            workingHours: 7.75,
            notes: 'تأخير بسيط',
          },
          {
            _id: 'sample_3',
            employeeName: 'محمد علي',
            date: format(yesterday, 'yyyy-MM-dd'),
            checkInTime: '09:00',
            checkOutTime: '17:00',
            status: 'present',
            workingHours: 8,
            notes: '',
          },
        ];

        setRecords(sampleData);
        saveAttendanceData(sampleData);

        toast.success('تم تحميل بيانات تجريبية للبدء');
      } else {
        fetchRecords();
      }
    }
  }, [isOpen, fetchRecords, calculateStats, saveAttendanceData]);

  // Update working hours when times change
  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime) {
      const hours = calculateWorkingHours(
        formData.checkInTime,
        formData.checkOutTime,
      );
      setFormData((prev) => ({ ...prev, workingHours: hours }));
    }
  }, [formData.checkInTime, formData.checkOutTime]);

  const filteredRecords = getFilteredRecords();

  // Calculate dynamic stats based on currently viewed data
  const getDynamicStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = filteredRecords.filter(record => record.date === today);
    const uniqueEmployees = new Set(filteredRecords.map(record => record.employeeName)).size;
    
    const presentToday = todayRecords.filter(record => record.status === 'present').length;
    const absentToday = todayRecords.filter(record => record.status === 'absent').length;
    const lateToday = todayRecords.filter(record => record.status === 'late').length;
    
    const totalWorkingHours = filteredRecords
      .filter(record => record.workingHours)
      .reduce((sum, record) => sum + (record.workingHours || 0), 0);
    
    const averageWorkingHours = filteredRecords.length > 0 
      ? totalWorkingHours / filteredRecords.length 
      : 0;
    
    const presentDays = filteredRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    
    const attendanceRate = filteredRecords.length > 0 
      ? (presentDays / filteredRecords.length) * 100 
      : 0;

    return {
      totalEmployees: uniqueEmployees,
      presentToday,
      absentToday,
      lateToday,
      averageWorkingHours: Number(averageWorkingHours.toFixed(1)),
      monthlyAttendanceRate: Number(attendanceRate.toFixed(1)),
    };
  };

  const dynamicStats = getDynamicStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
        <DialogHeader className="border-b border-gray-700/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <motion.div
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  نظام الحضور والانصراف
                </DialogTitle>
                <p className="text-gray-400 text-right text-sm mt-1">
                  إدارة حضور الموظفين ومتابعة الأداء
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: 'إجمالي الموظفين',
                value: dynamicStats.totalEmployees,
                icon: Users,
                color: 'from-slate-600 to-slate-700',
                textColor: 'text-slate-200',
              },
              {
                label: 'حاضر اليوم',
                value: dynamicStats.presentToday,
                icon: UserCheck,
                color: 'from-emerald-600 to-emerald-700',
                textColor: 'text-emerald-100',
              },
              {
                label: 'غائب اليوم',
                value: dynamicStats.absentToday,
                icon: UserX,
                color: 'from-red-600 to-red-700',
                textColor: 'text-red-100',
              },
              {
                label: 'متأخر اليوم',
                value: dynamicStats.lateToday,
                icon: Timer,
                color: 'from-amber-600 to-amber-700',
                textColor: 'text-amber-100',
              },
              {
                label: 'متوسط ساعات العمل',
                value: `${dynamicStats.averageWorkingHours}h`,
                icon: Clock,
                color: 'from-violet-600 to-violet-700',
                textColor: 'text-violet-100',
              },
              {
                label: currentView === 'today' ? 'نسبة الحضور اليوم' : currentView === 'monthly' ? 'نسبة الحضور الشهرية' : 'نسبة الحضور الإجمالية',
                value: `${dynamicStats.monthlyAttendanceRate}%`,
                icon: TrendingUp,
                color: 'from-cyan-600 to-cyan-700',
                textColor: 'text-cyan-100',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-lg font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}
                      >
                        <stat.icon
                          className={`w-4 h-4 ${stat.textColor || 'text-white'}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800/40 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white text-right flex items-center justify-between">
                <span>إجراءات سريعة</span>
                <Zap className="w-5 h-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  تسجيل حضور
                </Button>

                <Button
                  onClick={fetchRecords}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 bg-gray-800/50"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  تحديث البيانات
                </Button>
                <Button
                  onClick={() => {
                    const csvData = records
                      .map(
                        (record) =>
                          `${record.employeeName},${record.date},${record.status},${record.checkInTime},${record.checkOutTime || ''}`,
                      )
                      .join('\n');
                    const blob = new Blob(
                      [`Employee,Date,Status,Check In,Check Out\n${csvData}`],
                      { type: 'text/csv' },
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
                    a.click();
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 bg-gray-800/50"
                >
                  <Award className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search and View Controls */}
          <div className="space-y-4">
            {/* Search Input */}
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex-1">
                    <Label className="text-white text-right block mb-2">
                      البحث بالاسم
                    </Label>
                    <div className="relative">
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white text-right pl-10"
                        placeholder="ابحث عن موظف بالاسم..."
                      />
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm('')}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-gray-700 mt-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-400 text-right">
                    البحث عن: "{searchTerm}" - {filteredRecords.length} نتيجة
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 space-x-reverse">
                {[
                  { key: 'today' as const, label: 'اليوم', icon: CalendarCheck },
                  {
                    key: 'monthly' as const,
                    label: 'الشهر الحالي',
                    icon: BarChart3,
                  },
                  { key: 'all' as const, label: 'جميع السجلات', icon: Activity },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    variant={currentView === key ? 'default' : 'outline'}
                    size="sm"
                    className={
                      currentView === key
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800/50'
                    }
                  >
                    <Icon className="w-4 h-4 ml-2" />
                    {label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                {searchTerm && (
                  <Badge variant="secondary" className="text-gray-300 border-gray-600 bg-blue-500/20 border-blue-500/50">
                    نتائج البحث: {filteredRecords.length}
                  </Badge>
                )}
                <Badge variant="outline" className="text-gray-300 border-gray-600 bg-gray-800/50">
                  {filteredRecords.length} سجل
                </Badge>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <Card className="bg-gray-800/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white text-right">
                سجلات الحضور -{' '}
                {currentView === 'today'
                  ? 'اليوم'
                  : currentView === 'monthly'
                    ? 'الشهر الحالي'
                    : 'جميع السجلات'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-right text-gray-300">
                        الاسم
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        وقت الدخول
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        وقت الخروج
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        ساعات العمل
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        الحالة
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        ملاحظات
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span>جاري التحميل...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-12 text-gray-400"
                          >
                            <div className="flex flex-col items-center space-y-3">
                              <Users className="w-16 h-16 opacity-50" />
                              {searchTerm ? (
                                <>
                                  <p className="text-lg">لا توجد نتائج للبحث</p>
                                  <p className="text-sm">
                                    لم يتم العثور على موظفين بالاسم "{searchTerm}"
                                  </p>
                                  <Button
                                    onClick={() => setSearchTerm('')}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-gray-800/50"
                                  >
                                    مسح البحث
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <p className="text-lg">لا توجد سجلات حضور</p>
                                  <p className="text-sm">
                                    اضغط على "تسجيل حضور" لإضافة سجل جديد
                                  </p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record._id || index}
                            className="border-gray-700 hover:bg-gray-700/30 transition-colors duration-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                          >
                            <TableCell className="text-gray-300 text-right font-medium">
                              {record.employeeName}
                            </TableCell>
                            <TableCell className="text-gray-400 text-right">
                              {format(new Date(record.date), 'dd/MM/yyyy', {
                                locale: ar,
                              })}
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {record.checkInTime}
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {record.checkOutTime || '-'}
                            </TableCell>
                            <TableCell className="text-gray-300 text-right">
                              {record.workingHours
                                ? `${record.workingHours.toFixed(1)}h`
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {getStatusBadge(record.status)}
                            </TableCell>
                            <TableCell className="text-gray-400 text-right max-w-32 truncate">
                              {record.notes || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                                <Button
                                  onClick={() => handleEdit(record)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    setDeleteRecordId(record._id || '')
                                  }
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white text-right">
                {editingRecord ? 'تعديل سجل الحضور' : 'إضافة سجل حضور جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label
                    htmlFor="employeeName"
                    className="text-white text-right block mb-2"
                  >
                    اسم الموظف *
                  </Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeName: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="أدخل اسم الموظف"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white text-right block mb-2">
                    التاريخ *
                  </Label>
                  <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {format(selectedDate, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsDateOpen(false);
                          }
                        }}
                        initialFocus
                        className="bg-gray-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="checkInTime"
                      className="text-white text-right block mb-2"
                    >
                      وقت الدخول *
                    </Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkInTime: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="checkOutTime"
                      className="text-white text-right block mb-2"
                    >
                      وقت الخروج
                    </Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkOutTime: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-white text-right block mb-2"
                  >
                    الحالة *
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as AttendanceRecord['status'],
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-600 text-white text-right rounded-md px-3 py-2"
                    required
                  >
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                    <option value="half-day">نصف يوم</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="notes"
                    className="text-white text-right block mb-2"
                  >
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    placeholder="أضف ملاحظات إضافية..."
                    rows={3}
                  />
                </div>

                {formData.workingHours && formData.workingHours > 0 && (
                  <Alert className="bg-blue-500/10 border-blue-500/50">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300 text-right">
                      ساعات العمل المحسوبة: {formData.workingHours.toFixed(1)}{' '}
                      ساعة
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator className="bg-gray-600" />

              <div className="flex justify-end space-x-3 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      {editingRecord ? 'تحديث السجل' : 'إضافة السجل'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteRecordId}
          onOpenChange={(open) => !open && setDeleteRecordId(null)}
        >
          <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white text-right">
                تأكيد الحذف
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-300 text-right">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setDeleteRecordId(null)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                onClick={deleteRecord}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف السجل
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default Attendance;


