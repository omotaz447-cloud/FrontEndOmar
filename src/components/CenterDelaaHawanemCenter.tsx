import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Wallet,
  Crown,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterDelaaHawanemCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountData {
  _id: string;
  fixedBeforeInventory?: number;
  fixedAfterInventory?: number;
  cashAtHome?: number;
  withdrawal?: number;
  insurance?: number;
  cash?: number;
  blessing?: number;
  date: string;
  notes?: string;
  total: number;
  createdAt: string;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  endpoint: string;
  fields: {
    name: string;
    arabicKey: string;
    type: 'number' | 'text';
    required: boolean;
  }[];
}

interface FormData {
  fixedBeforeInventory?: number;
  fixedAfterInventory?: number;
  cashAtHome?: number;
  withdrawal?: number;
  insurance?: number;
  cash?: number;
  blessing?: number;
  date?: string;
  notes?: string;
  total?: number;
  [key: string]: string | number | undefined;
}

const CenterDelaaHawanemCenter: React.FC<CenterDelaaHawanemCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const sections = useMemo((): SectionConfig[] => [
    {
      id: 'main-accounts',
      title: 'حسابات رئيسية',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-blue-600 to-indigo-700',
      endpoint: '/api/center-delaa-hawanem-account',
      fields: [
        { name: 'fixedBeforeInventory', arabicKey: 'ثابت قبل الجرد', type: 'number' as const, required: true },
        { name: 'fixedAfterInventory', arabicKey: 'ثابت بعد الجرد', type: 'number' as const, required: true },
        { name: 'cashAtHome', arabicKey: 'فلوس نقدي في البيت', type: 'number' as const, required: true },
        { name: 'withdrawal', arabicKey: 'سحب', type: 'number' as const, required: true },
        { name: 'insurance', arabicKey: 'تامين', type: 'number' as const, required: true },
      ],
    },
    {
      id: 'mahmoud-account',
      title: 'محمود موهوب',
      icon: <User className="w-6 h-6" />,
      color: 'from-green-600 to-emerald-700',
      endpoint: '/api/mahmoud-center-delaa-hawanem-account',
      fields: [
        { name: 'cash', arabicKey: 'نقدي', type: 'number' as const, required: true },
        { name: 'blessing', arabicKey: 'ربنا كرم', type: 'number' as const, required: true },
        { name: 'withdrawal', arabicKey: 'سحب', type: 'number' as const, required: true },
      ],
    },
    {
      id: 'basem-account',
      title: 'باسم سعيد',
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-purple-600 to-violet-700',
      endpoint: '/api/basem-center-delaa-hawanem-account',
      fields: [
        { name: 'cash', arabicKey: 'نقدي', type: 'number' as const, required: true },
        { name: 'blessing', arabicKey: 'ربنا كرم', type: 'number' as const, required: true },
        { name: 'withdrawal', arabicKey: 'سحب', type: 'number' as const, required: true },
      ],
    },
    {
      id: 'waheed-account',
      title: 'وحيد سعيد',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-orange-600 to-red-700',
      endpoint: '/api/waheed-center-delaa-hawanem-account',
      fields: [
        { name: 'cash', arabicKey: 'نقدي', type: 'number' as const, required: true },
        { name: 'blessing', arabicKey: 'ربنا كرم', type: 'number' as const, required: true },
        { name: 'withdrawal', arabicKey: 'سحب', type: 'number' as const, required: true },
      ],
    },
    {
      id: 'emad-account',
      title: 'عماد ناصر',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-teal-600 to-cyan-700',
      endpoint: '/api/emad-center-delaa-hawanem-account',
      fields: [
        { name: 'cash', arabicKey: 'نقدي', type: 'number' as const, required: true },
        { name: 'blessing', arabicKey: 'ربنا كرم', type: 'number' as const, required: true },
        { name: 'withdrawal', arabicKey: 'سحب', type: 'number' as const, required: true },
      ],
    },
  ], []);

  const getCurrentSection = () => sections.find(s => s.id === selectedSection);

  const calculateTotal = (data: FormData, section: SectionConfig) => {
    if (section.id === 'main-accounts') {
      // ثابت بعد الجرد + فلوس نقدي في البيت - سحب - تامين
      return (data.fixedAfterInventory || 0) + (data.cashAtHome || 0) - (data.withdrawal || 0) - (data.insurance || 0);
    } else {
      // نقدي + ربنا كرم - سحب
      return (data.cash || 0) + (data.blessing || 0) - (data.withdrawal || 0);
    }
  };

  const fetchAccounts = useCallback(async () => {
    if (!selectedSection) return;
    
    const section = sections.find(s => s.id === selectedSection);
    if (!section) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`https://waheed-web.vercel.app${section.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Failed to fetch accounts:', response);
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error( 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [selectedSection, sections]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Calculate total automatically
    const section = getCurrentSection();
    if (section) {
      const total = calculateTotal(newFormData, section);
      setFormData(prev => ({ ...prev, total }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const section = getCurrentSection();
    if (!section) return;

    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        ...formData,
        date: format(date, 'yyyy-MM-dd'),
        total: calculateTotal(formData, section),
      };

      const url = editingAccount 
        ? `https://waheed-web.vercel.app${section.endpoint}/${editingAccount._id}`
        : `https://waheed-web.vercel.app${section.endpoint}`;
      
      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: AccountData) => {
    setEditingAccount(account);
    setFormData({
      ...account,
    });
    setDate(new Date(account.date));
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteAccountId) return;
    
    const section = getCurrentSection();
    if (!section) return;

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`https://waheed-web.vercel.app${section.endpoint}/${deleteAccountId}`, {
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
      console.error('Error deleting account:', error);
      toast.error('فشل في حذف البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setAccounts([]);
    resetForm();
  };

  const handleBack = () => {
    if (showForm) {
      resetForm();
    } else {
      setSelectedSection(null);
    }
  };

  useEffect(() => {
    if (selectedSection && !showForm) {
      fetchAccounts();
    }
  }, [selectedSection, showForm, fetchAccounts]);

  const currentSection = getCurrentSection();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-pink-500/20">
        <DialogHeader className="border-b border-pink-500/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-l from-pink-500/20 to-purple-500/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Building2 className="w-6 h-6 text-pink-400" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {selectedSection ? 
                    (showForm ? 
                      `${editingAccount ? 'تعديل' : 'إضافة'} - ${currentSection?.title}` 
                      : currentSection?.title
                    ) 
                    : 'سنتر دلع الهوانم'
                  }
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedSection ? 
                    (showForm ? 'إدارة البيانات المالية' : 'عرض وإدارة الحسابات') 
                    : 'اختر القسم المطلوب'
                  }
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(selectedSection || showForm) && (
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

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!selectedSection ? (
              <motion.div
                key="sections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
              >
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => handleSectionSelect(section.id)}
                  >
                    <Card className="bg-gray-800/60 border-gray-700/30 hover:border-pink-500/30 transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className={`p-3 rounded-xl bg-gradient-to-l ${section.color} group-hover:scale-110 transition-transform duration-300`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <div className="text-white">
                              {section.icon}
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              إدارة الحسابات والعمليات المالية
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 overflow-y-auto max-h-[70vh]"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentSection?.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label className="text-white font-medium">
                          {field.arabicKey}
                          {field.required && <span className="text-red-400 mr-1">*</span>}
                        </Label>
                        <Input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                          placeholder={`أدخل ${field.arabicKey}`}
                        />
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label className="text-white font-medium">
                        التاريخ <span className="text-red-400 mr-1">*</span>
                      </Label>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 hover:border-pink-500/50"
                          >
                            <Calendar className="ml-2 h-4 w-4 text-pink-400" />
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
                              day_selected: "bg-pink-600 text-white hover:bg-pink-700 focus:bg-pink-600",
                              day_today: "bg-pink-100 text-pink-900 font-bold",
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

                    <div className="space-y-2">
                      <Label className="text-white font-medium">ملاحظات</Label>
                      <Textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-pink-500/50"
                        placeholder="أدخل ملاحظات إضافية..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white font-medium">الإجمالي</Label>
                      <div className="p-3 bg-gradient-to-l from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/20">
                        <span className="text-2xl font-bold text-pink-300">
                          {formData.total || 0} جنيه
                        </span>
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
                      className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-8"
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
                className="p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">قائمة الحسابات</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={fetchAccounts}
                      variant="outline"
                      disabled={loading}
                      className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                    >
                      <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      تحديث
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة جديد
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-700/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/80">
                        {currentSection?.fields.map((field) => (
                          <TableHead key={field.name} className="text-gray-300 font-semibold text-right">
                            {field.arabicKey}
                          </TableHead>
                        ))}
                        <TableHead className="text-gray-300 font-semibold text-right">التاريخ</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-right">الإجمالي</TableHead>
                        <TableHead className="text-gray-300 font-semibold text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow
                          key={account._id}
                          className="bg-gray-900/50 border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                        >
                          {currentSection?.fields.map((field) => (
                            <TableCell key={field.name} className="text-gray-300 text-right">
                              {account[field.name as keyof AccountData] || '-'}
                            </TableCell>
                          ))}
                          <TableCell className="text-gray-300 text-right">
                            {format(new Date(account.date), 'yyyy-MM-dd', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-pink-300">
                              {account.total} جنيه
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(account)}
                                className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteAccountId(account._id)}
                                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {accounts.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-400">
                      لا توجد سجلات متاحة
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
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

export default CenterDelaaHawanemCenter;
