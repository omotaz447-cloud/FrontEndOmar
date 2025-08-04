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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  DollarSign,
  Save,
  RefreshCw,
  ShoppingCart,
  FileText,
  Calculator,
  Receipt,
  UserCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getRolePermissions } from '@/utils/roleUtils';

interface MerchantAccountData {
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

interface MerchantAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const MerchantAccount: React.FC<MerchantAccountProps> = ({
  isOpen,
  onClose,
}) => {
  // Get role permissions for this component
  const permissions = getRolePermissions('حسابات تجار البلينا');

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

  // Check if current user role is factory1-5
  const isFactoryRole = () => {
    const userRole = Cookies.get('userRole');
    return userRole?.match(/^factory[1-5]$/i);
  };

  // Check if current user role is admin (updated to use permissions)
  const isAdminRole = () => {
    return permissions.canEdit && permissions.canDelete;
  };

  const [formData, setFormData] = useState<MerchantAccountData>({
    name: '',
    invoice: '',
    payment: '',
    date: '',
    notes: '',
  });
  const [accounts, setAccounts] = useState<MerchantAccountData[]>([]);
  const [editingAccount, setEditingAccount] =
    useState<MerchantAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<MerchantAccountData>({
    name: '',
    invoice: '',
    payment: '',
    date: '',
    notes: '',
  });
  const [editSelectedDate, setEditSelectedDate] = useState<Date>();
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] =
    useState<MerchantAccountData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [selectedName, setSelectedName] = useState<string>('');
  const [filteredAccounts, setFilteredAccounts] = useState<MerchantAccountData[]>(
    [],
  );
  const [showFilters, setShowFilters] = useState(false);

  // Attendance states
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedMerchantForAttendance, setSelectedMerchantForAttendance] = useState<MerchantAccountData | null>(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

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

  // Filter accounts based on selected month, year, and name
  useEffect(() => {
    let filtered = accounts;

    // Filter by name if provided
    if (selectedName) {
      filtered = filtered.filter((account) =>
        account.name.toLowerCase().includes(selectedName.toLowerCase()),
      );
    }

    // Filter by month and year
    if (selectedMonth && selectedMonth !== 'all' && selectedYear) {
      filtered = filtered.filter((account) => {
        const accountDate = new Date(account.date);
        const accountMonth = (accountDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        const accountYear = accountDate.getFullYear().toString();
        return accountMonth === selectedMonth && accountYear === selectedYear;
      });
    } else if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter((account) => {
        const accountDate = new Date(account.date);
        const accountMonth = (accountDate.getMonth() + 1)
          .toString()
          .padStart(2, '0');
        return accountMonth === selectedMonth;
      });
    } else if (selectedYear) {
      filtered = filtered.filter((account) => {
        const accountDate = new Date(account.date);
        const accountYear = accountDate.getFullYear().toString();
        return accountYear === selectedYear;
      });
    }

    setFilteredAccounts(filtered);
  }, [accounts, selectedMonth, selectedYear, selectedName]);

  // Clear filters
  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedName('');
    setShowFilters(false);
  };

  // Get the accounts to display (filtered or all)
  const accountsToDisplay =
    (selectedMonth && selectedMonth !== 'all') ||
    selectedYear !== new Date().getFullYear().toString() ||
    selectedName
      ? filteredAccounts
      : accounts;

  // Load attendance data from cookies and localStorage (same as WorkerAccount component)
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

  // Save attendance data to cookies (same as WorkerAccount component)
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

  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/merchant-account',
        {
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        const data = await response.json();
        const accountsData = Array.isArray(data) ? data : [];
        
        // Load attendance data and merge with accounts
        const attendanceData = loadAttendanceData();
        const accountsWithAttendance = accountsData.map((account: MerchantAccountData) => {
          const attendance = attendanceData.find(
            (record: AttendanceRecord) => record.employeeName === account.name && record.date === account.date
          );
          
          if (attendance) {
            // Completely replace attendance fields with latest data
            return {
              ...account,
              attendanceStatus: attendance.status,
              checkInTime: attendance.checkInTime,
              checkOutTime: attendance.checkOutTime,
              workingHours: attendance.workingHours,
              attendanceNotes: attendance.notes,
            };
          }
          
          // If no attendance record found, ensure attendance fields are cleared
          return {
            ...account,
            attendanceStatus: undefined,
            checkInTime: undefined,
            checkOutTime: undefined,
            workingHours: undefined,
            attendanceNotes: undefined,
          };
        });
        
        setAccounts(accountsWithAttendance);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
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
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  // Function to update accounts with latest attendance data
  const updateAccountsWithAttendance = useCallback(() => {
    const attendanceData = loadAttendanceData();
    setAccounts(prevAccounts => 
      prevAccounts.map((account: MerchantAccountData) => {
        const attendance = attendanceData.find(
          (record: AttendanceRecord) => record.employeeName === account.name && record.date === account.date
        );
        
        if (attendance) {
          // Completely replace attendance fields with latest data
          return {
            ...account,
            attendanceStatus: attendance.status,
            checkInTime: attendance.checkInTime,
            checkOutTime: attendance.checkOutTime,
            workingHours: attendance.workingHours,
            attendanceNotes: attendance.notes,
          };
        }
        
        // If no attendance record found, clear attendance fields
        return {
          ...account,
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
        // Update accounts immediately with latest attendance data
        setTimeout(() => {
          updateAccountsWithAttendance();
        }, 100); // Small delay to ensure data is written
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for changes in the same tab using custom event
    const handleAttendanceChange = () => {
      if (isOpen) {
        // Update accounts immediately when attendance changes in same tab
        setTimeout(() => {
          updateAccountsWithAttendance();
        }, 100); // Small delay to ensure data is written
      }
    };

    window.addEventListener('attendanceDataChanged', handleAttendanceChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('attendanceDataChanged', handleAttendanceChange);
    };
  }, [isOpen, updateAccountsWithAttendance]);

  const convertToNumber = (value: string): number | string => {
    if (value === '0') {
      return '0';
    }
    if (value === '' || value === undefined || value === null) {
      return '';
    }
    const num = parseFloat(value);
    return isNaN(num) ? '' : num;
  };

  // Helper function to convert string|number to number for calculations
  const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (value === '0') return 0;
    if (value === '' || value === undefined || value === null) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericValue = ['invoice', 'payment'].includes(name)
      ? convertToNumber(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم التاجر');
      return;
    }

    if (!formData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        'https://backend-omar-puce.vercel.app/api/merchant-account',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: formData.name,
            invoice: formData.invoice === '0' ? '0' : toNumber(formData.invoice),
            payment: formData.payment === '0' ? '0' : toNumber(formData.payment),
            notes: formData.notes,
            date: formData.date,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم إضافة السجل بنجاح');
        setFormData({
          name: '',
          invoice: '',
          payment: '',
          date: '',
          notes: '',
        });
        setSelectedDate(undefined);
        fetchAccounts(); // Refresh the table
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

  // Handle edit account
  const handleEdit = (account: MerchantAccountData) => {
    setEditingAccount(account);
    setEditFormData({
      name: account.name,
      invoice: account.invoice,
      payment: account.payment,
      date: account.date,
      notes: account.notes || '',
    });
    if (account.date) {
      setEditSelectedDate(new Date(account.date));
    }
    setEditDialogOpen(true);
  };

  // Handle delete account
  const handleDelete = (account: MerchantAccountData) => {
    setDeleteAccount(account);
  };

  // Handle actual delete after confirmation
  const handleDeleteAccount = async () => {
    if (!deleteAccount?._id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/merchant-account/${deleteAccount._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح');
        fetchAccounts();
        setDeleteAccount(null);
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('فشل في حذف السجل');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
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
    const numericValue = ['invoice', 'payment'].includes(name)
      ? convertToNumber(value)
      : value;

    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      toast.error('يرجى إدخال اسم التاجر');
      return;
    }

    if (!editFormData.date) {
      toast.error('يرجى تحديد التاريخ');
      return;
    }

    if (!editingAccount?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://backend-omar-puce.vercel.app/api/merchant-account/${editingAccount._id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: editFormData.name,
            invoice: editFormData.invoice === '0' ? '0' : toNumber(editFormData.invoice),
            payment: editFormData.payment === '0' ? '0' : toNumber(editFormData.payment),
            notes: editFormData.notes,
            date: editFormData.date,
          }),
        },
      );

      if (response.ok) {
        await response.json();
        toast.success('تم تحديث السجل بنجاح');
        setEditDialogOpen(false);
        setEditingAccount(null);
        fetchAccounts();
      } else if (response.status === 401) {
        toast.error('غير مخول للوصول - يرجى تسجيل الدخول مرة أخرى');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      if (error instanceof Error && error.message === 'No access token found') {
        return;
      }
      toast.error('فشل في تحديث السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate remaining amount for edit form
  const calculateEditRemaining = () => {
    return toNumber(editFormData.invoice) - toNumber(editFormData.payment);
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

  // Calculate remaining amount (invoice - payment)
  const calculateRemaining = () => {
    return toNumber(formData.invoice) - toNumber(formData.payment);
  };

  // Attendance functions
  const handleMarkAttendance = (merchant: MerchantAccountData) => {
    setSelectedMerchantForAttendance(merchant);
    
    // Check if attendance already exists for this merchant and date
    const existingAttendance = loadAttendanceData();
    const existing = existingAttendance.find(
      (record: AttendanceRecord) => record.employeeName === merchant.name && record.date === merchant.date
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

      // Create attendance record (same format as WorkerAccount component)
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

      // Save to cookies and localStorage (same as WorkerAccount component)
      saveAttendanceData(updatedAttendance);

      setShowAttendanceDialog(false);
      setSelectedMerchantForAttendance(null);

      // Update accounts immediately with new attendance data
      setTimeout(() => {
        updateAccountsWithAttendance();
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

  // Filter accounts based on search query AND filters
  const filteredAccountsForSearch = accountsToDisplay.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"
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
          <div className="flex items-center space-x-4 space-x-reverse text-right">
            <motion.div
              className="p-3 bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white text-right">
                حسابات تجار البلينا
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-right">
                إدارة حسابات التجار والفواتير
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي التجار</span>
                  <UserCircle className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {accounts.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي الفواتير</span>
                  <Receipt className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + toNumber(account.invoice || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المدفوعات</span>
                  <DollarSign className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + toNumber(account.payment || 0),
                      0,
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-right flex items-center justify-end">
                  <span className="ml-2">إجمالي المتبقي</span>
                  <Calculator className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-400 text-right">
                  {formatCurrency(
                    accounts.reduce(
                      (total, account) => total + (account.total || 0),
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
                  <span className="ml-2">إضافة حساب تاجر جديد</span>
                  <Plus className="w-5 h-5 text-teal-400" />
                </CardTitle>
                <CardDescription className="text-gray-400 text-right">
                  أدخل بيانات التاجر والفاتورة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Name Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label
                      htmlFor="name"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>الاسم</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم التاجر"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Invoice Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Label
                      htmlFor="invoice"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>فاتوره</span>
                    </Label>
                    <Input
                      id="invoice"
                      name="invoice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.invoice === '' ? '' : formData.invoice}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الفاتورة"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
                      required
                    />
                  </motion.div>

                  {/* Payment Field */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Label
                      htmlFor="payment"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>دفعه</span>
                    </Label>
                    <Input
                      id="payment"
                      name="payment"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.payment === '' ? '' : formData.payment}
                      onChange={handleInputChange}
                      placeholder="أدخل مبلغ الدفعة"
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right"
                      required
                    />
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
                            months:
                              'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                            month: 'space-y-4',
                            caption:
                              'flex justify-center pt-1 relative items-center text-white',
                            caption_label: 'text-sm font-medium text-white',
                            nav: 'space-x-1 flex items-center',
                            nav_button:
                              'h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer',
                            nav_button_previous: 'absolute left-1',
                            nav_button_next: 'absolute right-1',
                            table: 'w-full border-collapse space-y-1',
                            head_row: 'flex',
                            head_cell:
                              'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: 'text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0',
                            day: 'w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                            day_range_end: 'day-range-end',
                            day_selected:
                              'bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white rounded-md',
                            day_today: 'bg-gray-700 text-white rounded-md',
                            day_outside: 'text-gray-600 opacity-50',
                            day_disabled:
                              'text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent',
                            day_range_middle:
                              'aria-selected:bg-teal-500/30 aria-selected:text-white',
                            day_hidden: 'invisible',
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </motion.div>

                  {/* Notes Field */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label
                      htmlFor="notes"
                      className="text-gray-300 flex items-center space-x-2 space-x-reverse text-right"
                    >
                      <FileText className="w-4 h-4" />
                      <span>ملاحظات</span>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أدخل أي ملاحظات إضافية..."
                      className="bg-gray-700/50 border-gray-600/50 text-white focus:ring-teal-500 focus:border-teal-500 text-right min-h-[80px]"
                      rows={3}
                    />
                  </motion.div>

                  {/* Remaining Display */}
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-teal-300 font-semibold text-lg">
                          المبلغ المتبقي:
                        </span>
                        <span className="text-teal-400 font-bold text-xl">
                          {formatCurrency(calculateRemaining())}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    className="md:col-span-2 lg:col-span-3 flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
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
                    className="p-2 bg-gradient-to-r from-teal-600 to-cyan-700 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-white text-right">
                    سجلات حسابات التجار
                  </CardTitle>
                </div>
                <Button
                  onClick={fetchAccounts}
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
                جميع سجلات حسابات تجار البلينا
              </CardDescription>

              {/* Search Input */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative max-w-md ml-auto">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="البحث بالاسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 text-right pr-10 rounded-xl"
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
                    className="text-sm text-gray-400 mt-2 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredAccountsForSearch.length} نتيجة من أصل {accounts.length} سجل
                  </motion.p>
                )}
              </motion.div>

              {/* Filter Section */}
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 flex items-center gap-2 w-full"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'تصفيه البيانات' : 'إظهار كيفيه تصفيه البيانات'}
                  </Button>
                  
                  {((selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString() || selectedName) && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Button
                        onClick={clearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="w-4 h-4" />
                        مسح الفلاتر
                      </Button>
                    </div>
                  )}
                </div>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
                  >
                    {/* Name Filter */}
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-right block">البحث بالاسم</Label>
                      <Input
                        type="text"
                        placeholder="اسم التاجر..."
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
                        className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                      />
                    </div>

                    {/* Month Filter */}
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-right block">الشهر</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white text-right">
                          <SelectValue placeholder="اختر الشهر" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="all">جميع الشهور</SelectItem>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-right block">السنة</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white text-right">
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
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

              </motion.div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700/30 hover:bg-gray-800/30">
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الاسم
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الفاتورة
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الدفعة
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الباقي
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        ملاحظات
                      </TableHead>
                      <TableHead className="text-gray-300 font-semibold text-right">
                        الحالة
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
                          colSpan={isAdminRole() ? 8 : 7}
                          className="text-center py-8"
                        >
                          <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-400">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري التحميل...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAccountsForSearch.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={isAdminRole() ? 8 : 7}
                          className="text-center py-8 text-gray-400"
                        >
                          {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد سجلات متاحة'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccountsForSearch.map((account, index) => (
                        <motion.tr
                          key={account._id || index}
                          className="border-gray-700/30 hover:bg-gray-800/50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="text-gray-300 text-right font-medium">
                            {account.name}
                          </TableCell>
                          <TableCell className="text-green-400 text-right">
                            {formatCurrency(toNumber(account.invoice))}
                          </TableCell>
                          <TableCell className="text-blue-400 text-right">
                            {formatCurrency(toNumber(account.payment))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-teal-400 font-semibold">
                              {formatCurrency(account.total || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-right">
                            {formatDate(account.date)}
                          </TableCell>
                          <TableCell className="text-gray-300 text-right max-w-xs truncate">
                            {account.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {getAttendanceStatusBadge(account.attendanceStatus, () => handleMarkAttendance(account))}
                          </TableCell>
                          {isAdminRole() && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(account)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1"
                                  disabled={!account._id}
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

              {/* Total Display when Filtered - Under Table */}
              {((selectedMonth && selectedMonth !== 'all') || selectedYear !== new Date().getFullYear().toString() || selectedName) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 mx-4 mb-4 p-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-lg"
                >
                  <div className="text-center mb-3">
                    <h3 className="text-teal-300 text-lg font-semibold">الإجمالي للبيانات المفلترة</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-teal-300 text-sm">إجمالي السجلات</div>
                      <div className="text-white text-lg font-bold">{filteredAccountsForSearch.length}</div>
                    </div>
                    <div>
                      <div className="text-green-300 text-sm">إجمالي الفواتير</div>
                      <div className="text-green-400 text-lg font-bold">
                        {formatCurrency(
                          filteredAccountsForSearch.reduce(
                            (total, account) => total + toNumber(account.invoice || 0),
                            0,
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300 text-sm">إجمالي المدفوعات</div>
                      <div className="text-blue-400 text-lg font-bold">
                        {formatCurrency(
                          filteredAccountsForSearch.reduce(
                            (total, account) => total + toNumber(account.payment || 0),
                            0,
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-teal-300 text-sm">إجمالي المتبقي</div>
                      <div className="text-teal-400 text-lg font-bold">
                        {formatCurrency(
                          filteredAccountsForSearch.reduce(
                            (total, account) => total + (account.total || 0),
                            0,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white text-right text-xl">
              تعديل حساب التاجر
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-right">
              تعديل بيانات التاجر "{editingAccount?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <form
              onSubmit={handleEditSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-gray-300 text-right">
                  اسم التاجر
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  type="text"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Invoice Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-invoice"
                  className="text-gray-300 text-right"
                >
                  الفاتورة
                </Label>
                <Input
                  id="edit-invoice"
                  name="invoice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.invoice === '' ? '' : editFormData.invoice}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
              </div>

              {/* Payment Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-payment"
                  className="text-gray-300 text-right"
                >
                  الدفعة
                </Label>
                <Input
                  id="edit-payment"
                  name="payment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.payment === '' ? '' : editFormData.payment}
                  onChange={handleEditInputChange}
                  className="bg-gray-700/50 border-gray-600/50 text-white text-right"
                  required
                />
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
                        months:
                          'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                        month: 'space-y-4',
                        caption:
                          'flex justify-center pt-1 relative items-center text-white',
                        caption_label: 'text-sm font-medium text-white',
                        nav: 'space-x-1 flex items-center',
                        nav_button:
                          'h-7 w-7 bg-transparent p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell:
                          'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'text-center text-sm relative [&>button]:w-9 [&>button]:h-9 [&>button]:p-0',
                        day: 'w-9 h-9 p-0 font-normal text-gray-300 bg-transparent border-0 cursor-pointer rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500',
                        day_range_end: 'day-range-end',
                        day_selected:
                          'bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white rounded-md',
                        day_today: 'bg-gray-700 text-white rounded-md',
                        day_outside: 'text-gray-600 opacity-50',
                        day_disabled:
                          'text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent',
                        day_range_middle:
                          'aria-selected:bg-teal-500/30 aria-selected:text-white',
                        day_hidden: 'invisible',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes Field */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="edit-notes"
                  className="text-gray-300 text-right"
                >
                  ملاحظات
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

              {/* Remaining Display */}
              <div className="md:col-span-2">
                <div className="p-4 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-300 font-semibold text-lg">
                      المبلغ المتبقي:
                    </span>
                    <span className="text-teal-400 font-bold text-xl">
                      {formatCurrency(calculateEditRemaining())}
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
                  className="bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white"
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
            {selectedMerchantForAttendance && (
              <p className="text-gray-300 text-right">
                التاجر: {selectedMerchantForAttendance.name}
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
                    status: value,
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
                      checkInTime: e.target.value,
                    }))
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Check Out Time */}
            {attendanceFormData.status !== 'absent' && (
              <div className="space-y-2">
                <Label className="text-gray-300 text-right block">
                  وقت المغادرة
                </Label>
                <Input
                  type="time"
                  value={attendanceFormData.checkOutTime}
                  onChange={(e) =>
                    setAttendanceFormData(prev => ({
                      ...prev,
                      checkOutTime: e.target.value,
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
              <Textarea
                value={attendanceFormData.notes}
                onChange={(e) =>
                  setAttendanceFormData(prev => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="أدخل ملاحظات إضافية..."
                className="bg-gray-800 border-gray-600 text-white text-right"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAccount}
        onOpenChange={() => setDeleteAccount(null)}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-400">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-right">
              هل أنت متأكد من حذف سجل التاجر "{deleteAccount?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
            <AlertDialogCancel
              onClick={() => setDeleteAccount(null)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
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

export default MerchantAccount;
