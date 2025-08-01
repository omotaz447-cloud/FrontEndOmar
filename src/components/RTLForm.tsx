import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleDatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, RefreshCw, User, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  day: string;
  date: Date | undefined;
  withdrawal: string;
}

interface RTLFormProps {
  title?: string;
  onSubmit?: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isLoading?: boolean;
}

const RTLForm: React.FC<RTLFormProps> = ({
  title = "نموذج متطور بتصميم RTL",
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || '',
    day: initialData.day || '',
    date: initialData.date || undefined,
    withdrawal: initialData.withdrawal || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Days of the week in Arabic
  const daysOfWeek = [
    { value: 'sunday', label: 'الأحد' },
    { value: 'monday', label: 'الاثنين' },
    { value: 'tuesday', label: 'الثلاثاء' },
    { value: 'wednesday', label: 'الأربعاء' },
    { value: 'thursday', label: 'الخميس' },
    { value: 'friday', label: 'الجمعة' },
    { value: 'saturday', label: 'السبت' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم العامل');
      return;
    }
    
    if (!formData.day) {
      toast.error('يرجى اختيار اليوم');
      return;
    }
    
    if (!formData.date) {
      toast.error('يرجى اختيار التاريخ');
      return;
    }
    
    if (!formData.withdrawal.trim()) {
      toast.error('يرجى إدخال مبلغ السحب');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      toast.success('تم حفظ البيانات بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      day: '',
      date: undefined,
      withdrawal: '',
    });
    toast.info('تم إعادة تعيين النموذج');
  };

  const inputClassName = "h-12 text-right bg-gray-800/60 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl";
  const labelClassName = "text-gray-300 font-medium text-right text-sm";

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <div className="w-20 h-1 bg-gradient-to-l from-purple-500 to-blue-500 rounded-full mx-auto" />
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Worker Name */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="name" className={labelClassName}>
            اسم العامل
          </Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="أدخل اسم العامل"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClassName}
              disabled={isLoading || isSubmitting}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </motion.div>

        {/* Day Selection */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="day" className={labelClassName}>
            اليوم
          </Label>
          <Select
            value={formData.day}
            onValueChange={(value) => setFormData({ ...formData, day: value })}
            disabled={isLoading || isSubmitting}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder="اختر اليوم" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Date Picker */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label htmlFor="date" className={labelClassName}>
            التاريخ
          </Label>
          <SimpleDatePicker
            date={formData.date}
            setDate={(date) => setFormData({ ...formData, date })}
            placeholder="اختر التاريخ"
            className={inputClassName}
            disabled={isLoading || isSubmitting}
          />
        </motion.div>

        {/* Withdrawal Amount */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Label htmlFor="withdrawal" className={labelClassName}>
            مبلغ السحب
          </Label>
          <div className="relative">
            <Input
              id="withdrawal"
              type="number"
              placeholder="أدخل المبلغ"
              value={formData.withdrawal}
              onChange={(e) => setFormData({ ...formData, withdrawal: e.target.value })}
              className={inputClassName}
              disabled={isLoading || isSubmitting}
              min="0"
              step="0.01"
            />
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 h-12 bg-gradient-to-l from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ السجل'}
          </Button>
          
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading || isSubmitting}
            variant="outline"
            className="h-12 px-6 bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 hover:text-white rounded-xl transition-all duration-300"
          >
            إعادة تعيين
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default RTLForm;
