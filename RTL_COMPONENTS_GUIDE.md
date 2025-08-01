# RTL Components Usage Guide

This guide explains how to use the comprehensive RTL (Right-to-Left) components built for Arabic interfaces.

## 🎯 Overview

Our RTL implementation includes:
- ✅ Full RTL layout support
- ✅ Consistent input styling (same width/height)
- ✅ Professional ShadCN UI components
- ✅ Arabic fonts (Cairo, Tajawal)
- ✅ Responsive design
- ✅ Professional animations with Framer Motion

## 🛠️ Components

### 1. RTL Form Component (`RTLForm.tsx`)

A complete form component with consistent styling and RTL support.

```tsx
import RTLForm from '@/components/RTLForm';

const MyPage = () => {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
    // Handle form submission
  };

  return (
    <RTLForm
      title="نموذج إضافة عامل"
      onSubmit={handleSubmit}
      initialData={{ name: 'أحمد محمد' }}
      isLoading={false}
    />
  );
};
```

### 2. RTL Select Component (`ui/select.tsx`)

Dropdown component with RTL support:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={selectedDay} onValueChange={setSelectedDay}>
  <SelectTrigger className="h-12 text-right">
    <SelectValue placeholder="اختر اليوم" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sunday">الأحد</SelectItem>
    <SelectItem value="monday">الاثنين</SelectItem>
  </SelectContent>
</Select>
```

### 3. RTL Date Picker (`ui/date-picker.tsx`)

Date picker with Arabic locale support:

```tsx
import { SimpleDatePicker } from '@/components/ui/date-picker';

const [date, setDate] = useState<Date | undefined>();

<SimpleDatePicker
  date={date}
  setDate={setDate}
  placeholder="اختر التاريخ"
  className="h-12 text-right"
/>
```

### 4. RTL Input Component

Updated input with RTL support:

```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="أدخل النص"
  className="h-12 text-right"
  style={{ direction: 'rtl' }}
/>
```

### 5. RTL Table Component

Table with RTL text alignment:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-right">الاسم</TableHead>
      <TableHead className="text-right">التاريخ</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="text-right">أحمد محمد</TableCell>
      <TableCell className="text-right">2025/01/15</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 🎨 Consistent Styling Classes

All components use these standardized classes for consistency:

### Input Styling
```css
h-12 text-right bg-gray-800/60 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl
```

### Label Styling
```css
text-gray-300 font-medium text-right text-sm
```

### Button Styling
```css
h-12 bg-gradient-to-l from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl
```

## 🔧 RTL Utility Functions

Use the RTL utility functions from `utils/rtl.ts`:

```tsx
import { rtlUtils, useRTL } from '@/utils/rtl';

const { isRTL, conditional, utils } = useRTL();

// Convert margin classes
const marginClass = utils.marginRight('4'); // Returns 'ml-4' in RTL

// Conditional styling
const alignment = conditional('text-right', 'text-left');

// Gradient direction
const gradientClass = utils.gradient.toRight; // Returns 'bg-gradient-to-l' in RTL
```

## 🌐 Global RTL Setup

The application is configured for RTL at multiple levels:

### 1. HTML Level (`index.html`)
```html
<html lang="ar" dir="rtl">
```

### 2. CSS Level (`index.css`)
```css
body {
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', 'Tajawal', 'Arial', sans-serif;
}
```

### 3. React Level (`RTLProvider.tsx`)
```tsx
// Automatically sets document direction and classes
<RTLProvider>
  <App />
</RTLProvider>
```

## 📱 Responsive RTL Design

All components are responsive and maintain RTL behavior across screen sizes:

```tsx
// Grid layout that works in RTL
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Content flows right-to-left */}
</div>

// Flex with RTL support
<div className="flex flex-row-reverse space-x-4 space-x-reverse">
  {/* Icons and text in correct RTL order */}
</div>
```

## 🎭 Animation Support

RTL-aware animations using Framer Motion:

```tsx
// Slide in from right (correct for RTL)
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}

// Hover effects that respect RTL
whileHover={{ x: -4 }} // Moves left in RTL context
```

## 🚀 Demo Page

Visit `/rtl-demo` to see all components in action with:
- Live form interactions
- Table data display
- Consistent styling showcase
- Responsive behavior testing

## 📋 Best Practices

1. **Always use `text-right` for Arabic text**
2. **Use `space-x-reverse` for proper icon spacing**
3. **Apply `h-12` consistently for all inputs**
4. **Use gradient directions that flow right-to-left**
5. **Test on different screen sizes**
6. **Ensure proper contrast for dark theme**

## 🔍 Testing RTL Components

1. Navigate to `/rtl-demo`
2. Test form inputs and validation
3. Verify dropdown and date picker behavior
4. Check table responsiveness
5. Test on mobile devices

## 🎨 Color Scheme

The RTL components use a professional dark theme:

- **Background**: `bg-gray-900/60` with backdrop blur
- **Borders**: `border-gray-700/30` for subtle separation
- **Text**: `text-white` for primary, `text-gray-300` for secondary
- **Accents**: Purple/blue gradients for interactive elements
- **Focus states**: Blue highlights for better UX

This creates a modern, professional appearance that works well with Arabic text and RTL layouts.
