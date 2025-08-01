import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  CalendarIcon, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  User, 
  Mail, 
  Phone,
  Save,
  RefreshCw 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

const ShadCNDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
  });

  // Sample data for the table
  const sampleData = [
    { id: 1, name: 'أحمد محمد علي', email: 'ahmed@example.com', phone: '01234567890', department: 'المبيعات' },
    { id: 2, name: 'فاطمة حسن أحمد', email: 'fatma@example.com', phone: '01987654321', department: 'المحاسبة' },
    { id: 3, name: 'محمد عبد الله', email: 'mohamed@example.com', phone: '01555666777', department: 'التسويق' },
    { id: 4, name: 'عائشة سالم', email: 'aisha@example.com', phone: '01444555666', department: 'الموارد البشرية' },
  ];

  const departments = [
    { value: 'sales', label: 'المبيعات' },
    { value: 'accounting', label: 'المحاسبة' },
    { value: 'marketing', label: 'التسويق' },
    { value: 'hr', label: 'الموارد البشرية' },
    { value: 'it', label: 'تكنولوجيا المعلومات' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success('تم حفظ البيانات بنجاح');
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', department: '' });
    setSelectedDate(undefined);
    toast.info('تم إعادة تعيين النموذج');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Navigation />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            مكونات ShadCN UI مع دعم RTL
          </h1>
          <p className="text-muted-foreground text-lg">
            جميع المكونات الأساسية مع التصميم الاحترافي للغة العربية
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>نموذج إضافة موظف جديد</CardTitle>
                  <CardDescription>
                    أدخل بيانات الموظف الجديد بالنظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="أدخل الاسم الكامل"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="text-right pr-10"
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="أدخل البريد الإلكتروني"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="text-right pr-10"
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          placeholder="أدخل رقم الهاتف"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="text-right pr-10"
                        />
                        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </div>

                    {/* Department Select */}
                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => setFormData({...formData, department: value})}
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label>تاريخ البدء</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-right"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        <Save className="ml-2 h-4 w-4" />
                        حفظ البيانات
                      </Button>
                      <Button type="button" variant="outline" onClick={handleReset}>
                        <RefreshCw className="ml-2 h-4 w-4" />
                        إعادة تعيين
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search and Filter Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>البحث والفلترة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label>البحث</Label>
                      <div className="relative">
                        <Input
                          placeholder="ابحث عن موظف..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="text-right pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <Label>فلترة حسب القسم</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="text-right">
                          <SelectValue placeholder="جميع الأقسام" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأقسام</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="ml-2 h-4 w-4" />
                        تطبيق الفلتر
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="ml-2 h-4 w-4" />
                        تصدير
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Table and Stats */}
          <div className="space-y-6">
            {/* Table Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>قائمة الموظفين</CardTitle>
                  <CardDescription>
                    جميع الموظفين المسجلين في النظام
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الاسم</TableHead>
                          <TableHead className="text-right">البريد الإلكتروني</TableHead>
                          <TableHead className="text-right">الهاتف</TableHead>
                          <TableHead className="text-right">القسم</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleData.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="text-right font-medium">
                              {employee.name}
                            </TableCell>
                            <TableCell className="text-right">
                              {employee.email}
                            </TableCell>
                            <TableCell className="text-right">
                              {employee.phone}
                            </TableCell>
                            <TableCell className="text-right">
                              {employee.department}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {sampleData.length}
                  </CardTitle>
                  <CardDescription>
                    إجمالي الموظفين
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {departments.length}
                  </CardTitle>
                  <CardDescription>
                    عدد الأقسام
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <motion.div
          className="flex justify-center gap-4 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button size="lg">
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف جديد
          </Button>
          <Button variant="outline" size="lg">
            <Download className="ml-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ShadCNDemo;
