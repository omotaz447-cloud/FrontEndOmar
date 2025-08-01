import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import RTLForm from '@/components/RTLForm';
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
import { Plus, Download, Filter, Search } from 'lucide-react';

const RTLDemo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sample data for the table
  const sampleData = [
    { id: 1, name: 'أحمد محمد', day: 'الأحد', date: '2025/01/15', amount: '150.00' },
    { id: 2, name: 'فاطمة علي', day: 'الاثنين', date: '2025/01/14', amount: '200.50' },
    { id: 3, name: 'محمد حسن', day: 'الثلاثاء', date: '2025/01/13', amount: '175.25' },
    { id: 4, name: 'عائشة أحمد', day: 'الأربعاء', date: '2025/01/12', amount: '300.00' },
    { id: 5, name: 'عمر سالم', day: 'الخميس', date: '2025/01/11', amount: '125.75' },
  ];

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'workers', label: 'العمال' },
    { value: 'traders', label: 'التجار' },
    { value: 'sales', label: 'المبيعات' },
  ];

  const handleFormSubmit = (data: {
    name: string;
    day: string;
    date: Date | undefined;
    withdrawal: string;
  }) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 p-4 lg:p-8">
      <Navigation />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 text-right">
            مكونات RTL المتطورة
          </h1>
          <p className="text-xl text-gray-400 text-right">
            مجموعة شاملة من المكونات المُحسّنة للغة العربية
          </p>
          <div className="w-32 h-1 bg-gradient-to-l from-purple-500 to-blue-500 rounded-full mr-auto mt-4" />
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <RTLForm
              title="نموذج إضافة سجل عامل"
              onSubmit={handleFormSubmit}
            />

            {/* Additional Controls */}
            <motion.div
              className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-white text-right mb-4">
                عناصر التحكم الإضافية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium text-right text-sm">
                    البحث
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="ابحث عن سجل..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 text-right bg-gray-800/60 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg pr-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium text-right text-sm">
                    الفئة
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-10 text-right bg-gray-800/60 border-gray-600/30 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة جديد
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 h-10 px-4 rounded-lg"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 h-10 px-4 rounded-lg"
                >
                  <Filter className="w-4 h-4 ml-2" />
                  فلترة
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Table Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white text-right">
                  سجلات العمال
                </h3>
                <div className="text-sm text-gray-400">
                  {sampleData.length} سجل
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-700/30">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-800/50">
                      <TableHead className="text-right font-semibold text-gray-300">الاسم</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">اليوم</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">التاريخ</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                      >
                        <TableCell className="text-right font-medium text-white">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {item.day}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {item.date}
                        </TableCell>
                        <TableCell className="text-right text-green-400 font-medium">
                          ${item.amount}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-gradient-to-l from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-right">
                  <p className="text-blue-300 text-sm">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-white">$951.50</p>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-l from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-right">
                  <p className="text-green-300 text-sm">عدد السجلات</p>
                  <p className="text-2xl font-bold text-white">{sampleData.length}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RTLDemo;
