import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export interface FieldConfig {
  label: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

interface GenericFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  totalFormula?: (values: Record<string, string | number>) => number;
  totalLabel?: string;
  defaultValues?: Record<string, string | number>;
  onSuccess?: () => void;
}

const GenericFormDialog: React.FC<GenericFormDialogProps> = ({
  isOpen,
  onClose,
  title,
  endpoint,
  fields,
  totalFormula,
  totalLabel = 'الإجمالي',
  defaultValues = {},
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, string | number> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get('accessToken');
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(Array.isArray(result) ? result : result.data || []);
      } else {
        console.error('Failed to fetch data');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    // Initialize form data with default values
    const initialData: Record<string, string | number> = { ...defaultValues };
    fields.forEach(field => {
      if (!(field.name in initialData)) {
        initialData[field.name] = field.type === 'number' ? 0 : '';
      }
    });
    setFormData(initialData);
  }, [fields, defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = Cookies.get('accessToken');
      
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem && editingItem.id ? `${endpoint}/${editingItem.id}` : endpoint;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingItem ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح');
        resetForm();
        fetchData();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'حدث خطأ أثناء العملية');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء العملية');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      const token = Cookies.get('accessToken');
      
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('تم الحذف بنجاح');
        fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const initialData: Record<string, string | number> = { ...defaultValues };
    fields.forEach(field => {
      if (!(field.name in initialData)) {
        initialData[field.name] = field.type === 'number' ? 0 : '';
      }
    });
    setFormData(initialData);
    setEditingItem(null);
    setShowForm(false);
  };

  const startEdit = (item: Record<string, string | number>) => {
    setFormData({ ...item });
    setEditingItem(item);
    setShowForm(true);
  };

  const calculateTotal = () => {
    if (!totalFormula) return null;
    return totalFormula(formData);
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || '';

    if (field.type === 'date') {
      const dateValue = value ? new Date(value as string) : undefined;
      
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-right block text-white">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 justify-start text-right bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {dateValue ? format(dateValue, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  setFormData({
                    ...formData,
                    [field.name]: date ? date.toISOString().split('T')[0] : ''
                  });
                }}
                locale={ar}
                className="bg-gray-800 text-white"
                classNames={{
                  day_selected: "bg-pink-600 text-white hover:bg-pink-700",
                  day_today: "bg-gray-700 text-white",
                  day: "hover:bg-gray-700",
                  head_cell: "text-gray-300",
                  nav_button: "hover:bg-gray-700 text-white",
                  nav_button_previous: "hover:bg-gray-700",
                  nav_button_next: "hover:bg-gray-700",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-right block text-white">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </Label>
          <Textarea
            id={field.name}
            value={value as string}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder || field.label}
            className="w-full bg-gray-800 border-gray-600 text-white text-right resize-none"
            rows={3}
            required={field.required}
          />
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-right block text-white">
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={(e) => {
            const newValue = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            setFormData({ ...formData, [field.name]: newValue });
          }}
          placeholder={field.placeholder || field.label}
          className="w-full h-10 bg-gray-800 border-gray-600 text-white text-right"
          required={field.required}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl font-bold bg-gradient-to-l from-pink-400 to-purple-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Add Button */}
          {!showForm && (
            <div className="mb-4">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة جديد
              </Button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(renderField)}
              </div>

              {/* Total Display */}
              {totalFormula && (
                <div className="bg-gradient-to-l from-pink-900/50 to-purple-900/50 p-4 rounded-lg">
                  <div className="text-right text-lg font-semibold text-pink-200">
                    {totalLabel}: {calculateTotal()?.toLocaleString('ar-EG') || 0}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-l from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                >
                  {loading ? 'جاري الحفظ...' : editingItem ? 'تحديث' : 'حفظ'}
                </Button>
              </div>
            </form>
          )}

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-gray-400">لا توجد بيانات</div>
            ) : (
              <div className="space-y-2">
                {data.map((item, index) => (
                  <div key={item.id || index} className="bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      {fields.map(field => (
                        <div key={field.name} className="text-right">
                          <span className="text-gray-400 text-sm">{field.label}:</span>
                          <div className="text-white">
                            {field.type === 'date' && item[field.name] 
                              ? format(new Date(item[field.name] as string), 'dd/MM/yyyy', { locale: ar })
                              : field.type === 'number' && typeof item[field.name] === 'number'
                              ? item[field.name].toLocaleString('ar-EG')
                              : item[field.name] || '-'
                            }
                          </div>
                        </div>
                      ))}
                      {totalFormula && (
                        <div className="text-right">
                          <span className="text-gray-400 text-sm">{totalLabel}:</span>
                          <div className="text-pink-400 font-semibold">
                            {totalFormula(item)?.toLocaleString('ar-EG') || 0}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
                        className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => item.id && handleDelete(item.id)}
                        className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenericFormDialog;
