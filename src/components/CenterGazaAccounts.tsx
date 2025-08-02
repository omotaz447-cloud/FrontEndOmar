import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building2,
  Calendar,
  Users,
  Wallet,
  DollarSign,
  Bike,
} from 'lucide-react';
import Cookies from 'js-cookie';

interface CenterGazaAccountsProps {
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
  withdrawalFromBike?: number;
  inventoryDate?: string;
  date?: string;
  notes?: string;
  total?: number;
  createdAt?: string;
}

interface FormData {
  fixedBeforeInventory: string;
  fixedAfterInventory: string;
  cashAtHome: string;
  withdrawal: string;
  insurance: string;
  notes: string;
  total: number;
}

const CenterGazaAccounts: React.FC<CenterGazaAccountsProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);

  const sections = [
    {
      id: 'center-gaza',
      title: 'حسابات سنتر غزة',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700',
      component: CenterGazaAccountSection,
      endpoint: '/api/center-gaza-account',
    },
    {
      id: 'mahmoud',
      title: 'حسابات محمود موهوب سنتر غزة',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-600 to-green-700',
      component: MahmoudCenterGazaSection,
      endpoint: '/api/mahmoud-center-gaza-account',
    },
    {
      id: 'waheed',
      title: 'حسابات وحيد سعيد سنتر غزة',
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-purple-600 to-purple-700',
      component: WaheedCenterGazaSection,
      endpoint: '/api/waheed-center-gaza-account',
    },
    {
      id: 'basem',
      title: 'حسابات باسم سعيد عند وحيد سنتر غزة',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-orange-600 to-orange-700',
      component: BasemWaheedCenterGazaSection,
      endpoint: '/api/basem-waheed-center-gaza-account',
    },
    {
      id: 'mina',
      title: 'حسابات مينا ناصر عند وحيد سنتر غزة',
      icon: <Users className="w-6 h-6" />,
      color: 'from-pink-600 to-pink-700',
      component: MinaWaheedCenterGazaSection,
      endpoint: '/api/mina-waheed-center-gaza-account',
    },
    {
      id: 'bike-storage',
      title: 'حسابات بايكة ومخزن سنتر غزة',
      icon: <Bike className="w-6 h-6" />,
      color: 'from-teal-600 to-teal-700',
      component: BikeStorageCenterGazaSection,
      endpoint: '/api/bike-storage-center-gaza-account',
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setShowSectionDialog(true);
  };

  const resetDialog = () => {
    setSelectedSection(null);
    setShowSectionDialog(false);
  };

  const selectedSectionData = sections.find(section => section.id === selectedSection);

  return (
    <>
      {/* Main sections dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-l from-orange-500 to-amber-600 rounded-lg shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              سنتر غزة
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-lg">
              اختر القسم المراد إدارته من الأقسام المتاحة
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleSectionClick(section.id)}
              >
                <div className={`bg-gradient-to-r ${section.color} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {section.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        إدارة وتتبع العمليات المالية
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual section dialog */}
      {selectedSectionData && (
        <selectedSectionData.component
          isOpen={showSectionDialog}
          onClose={resetDialog}
          endpoint={selectedSectionData.endpoint}
          title={selectedSectionData.title}
        />
      )}
    </>
  );
};

// Generic component for handling different account types
interface SectionComponentProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  title: string;
}

// Center Gaza Account Section
const CenterGazaAccountSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fixedBeforeInventory: '',
    fixedAfterInventory: '',
    cashAtHome: '',
    withdrawal: '',
    insurance: '',
    notes: '',
    total: 0,
  });
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isDateOpen, setIsDateOpen] = useState(false);

  const calculateTotal = (data: FormData) => {
    const fixedAfter = parseFloat(data.fixedAfterInventory) || 0;
    const cash = parseFloat(data.cashAtHome) || 0;
    const withdrawal = parseFloat(data.withdrawal) || 0;
    const insurance = parseFloat(data.insurance) || 0;
    
    return fixedAfter + cash - withdrawal - insurance;
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`https://backend-omar-puce.vercel.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : data.data || data.account || []);
    } catch {
      toast.error('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const total = calculateTotal(newFormData);
    setFormData(prev => ({ ...prev, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }

    const requiredFields = ['fixedBeforeInventory', 'fixedAfterInventory', 'cashAtHome', 'withdrawal', 'insurance'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const submitData = {
        ...formData,
        date: format(date, 'yyyy-MM-dd'),
        fixedBeforeInventory: parseFloat(formData.fixedBeforeInventory),
        fixedAfterInventory: parseFloat(formData.fixedAfterInventory),
        cashAtHome: parseFloat(formData.cashAtHome),
        withdrawal: parseFloat(formData.withdrawal),
        insurance: parseFloat(formData.insurance),
        total: calculateTotal(formData),
      };

      const url = editingAccount
        ? `https://backend-omar-puce.vercel.app${endpoint}/${editingAccount._id}`
        : `https://backend-omar-puce.vercel.app${endpoint}`;

      const response = await fetch(url, {
        method: editingAccount ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ البيانات');
      }

      toast.success(editingAccount ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الحساب بنجاح');
      resetForm();
      fetchAccounts();
    } catch {
      toast.error('فشل في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fixedBeforeInventory: '',
      fixedAfterInventory: '',
      cashAtHome: '',
      withdrawal: '',
      insurance: '',
      notes: '',
      total: 0,
    });
    setDate(undefined);
    setEditingAccount(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fetchAccounts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-l from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حساب جديد
              </Button>
              <Button
                onClick={fetchAccounts}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 text-right">ثابت قبل الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">ثابت بعد الجرد</TableHead>
                  <TableHead className="text-gray-300 text-right">نقدي في البيت</TableHead>
                  <TableHead className="text-gray-300 text-right">سحب</TableHead>
                  <TableHead className="text-gray-300 text-right">تأمين</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجمالي</TableHead>
                  <TableHead className="text-gray-300 text-right">التاريخ</TableHead>
                  <TableHead className="text-gray-300 text-right">الملاحظات</TableHead>
                  <TableHead className="text-gray-300 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {accounts.map((account, index) => (
                    <motion.tr
                      key={account._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-gray-700 hover:bg-gray-800/50 text-gray-200"
                    >
                      <TableCell className="text-right">{account.fixedBeforeInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.fixedAfterInventory?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{account.cashAtHome?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.withdrawal?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">{account.insurance?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${(account.total ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(account.total ?? 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {account.date && format(new Date(account.date), 'yyyy/MM/dd', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">{account.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingAccount(account);
                              setFormData({
                                fixedBeforeInventory: account.fixedBeforeInventory?.toString() || '',
                                fixedAfterInventory: account.fixedAfterInventory?.toString() || '',
                                cashAtHome: account.cashAtHome?.toString() || '',
                                withdrawal: account.withdrawal?.toString() || '',
                                insurance: account.insurance?.toString() || '',
                                notes: account.notes || '',
                                total: account.total || 0,
                              });
                              setDate(account.date ? new Date(account.date) : undefined);
                              setShowForm(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAccountId(account._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {accounts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد بيانات حسابات</p>
                <p className="text-sm">اضغط على "إضافة حساب جديد" لبدء الإدخال</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت قبل الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedBeforeInventory}
                    onChange={(e) => handleInputChange('fixedBeforeInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">ثابت بعد الجرد</Label>
                  <Input
                    type="number"
                    value={formData.fixedAfterInventory}
                    onChange={(e) => handleInputChange('fixedAfterInventory', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-right block mb-2">نقدي في البيت</Label>
                  <Input
                    type="number"
                    value={formData.cashAtHome}
                    onChange={(e) => handleInputChange('cashAtHome', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-right block mb-2">سحب</Label>
                  <Input
                    type="number"
                    value={formData.withdrawal}
                    onChange={(e) => handleInputChange('withdrawal', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">تأمين</Label>
                <Input
                  type="number"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  required
                />
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
                <Label className="text-gray-300 text-right block mb-2">الملاحظات (اختياري)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-right"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-right block mb-2">الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.total}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white text-right"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingAccount ? 'تحديث' : 'إضافة'}
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
        <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
          <AlertDialogContent className="bg-gray-900 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deleteAccountId) return;
                  try {
                    const token = Cookies.get('accessToken');
                    const response = await fetch(`https://backend-omar-puce.vercel.app${endpoint}/${deleteAccountId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });

                    if (!response.ok) {
                      throw new Error('فشل في حذف البيانات');
                    }

                    toast.success('تم حذف الحساب بنجاح');
                    setDeleteAccountId(null);
                    fetchAccounts();
                  } catch {
                    toast.error('فشل في حذف البيانات');
                  }
                }}
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

// Similar components for other sections...
const MahmoudCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  // Implementation similar to CenterGazaAccountSection but with different fields
  // cash, blessing, withdrawal, insurance, date
  return <CenterGazaAccountSection isOpen={isOpen} onClose={onClose} endpoint={endpoint} title={title} />;
};

const WaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  // Implementation similar to CenterGazaAccountSection but with different fields
  // cash, blessing, withdrawal, insurance, date
  return <CenterGazaAccountSection isOpen={isOpen} onClose={onClose} endpoint={endpoint} title={title} />;
};

const BasemWaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  // Implementation similar to CenterGazaAccountSection but with different fields
  // cash, withdrawal, date, notes
  return <CenterGazaAccountSection isOpen={isOpen} onClose={onClose} endpoint={endpoint} title={title} />;
};

const MinaWaheedCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  // Implementation similar to CenterGazaAccountSection but with different fields
  // cash, withdrawal, date, notes
  return <CenterGazaAccountSection isOpen={isOpen} onClose={onClose} endpoint={endpoint} title={title} />;
};

const BikeStorageCenterGazaSection: React.FC<SectionComponentProps> = ({ isOpen, onClose, endpoint, title }) => {
  // Implementation similar to CenterGazaAccountSection but with different fields
  // fixedBeforeInventory, fixedAfterInventory, withdrawalFromBike, cashAtHome, inventoryDate
  return <CenterGazaAccountSection isOpen={isOpen} onClose={onClose} endpoint={endpoint} title={title} />;
};

export default CenterGazaAccounts;
