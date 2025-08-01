# ShadCN UI Setup Guide for RTL Arabic Interface

## 🎉 Successfully Installed Components

ShadCN UI has been properly configured in your Vite + React + TypeScript project with full RTL support.

## 📦 Installed Components

The following ShadCN UI components are now available:

- ✅ **Button** - Professional button component with variants
- ✅ **Input** - Form input with proper RTL alignment
- ✅ **Label** - Form labels with RTL text alignment
- ✅ **Select** - Dropdown component with RTL support
- ✅ **Table** - Data table with RTL column alignment
- ✅ **Card** - Container component for content sections
- ✅ **Calendar** - Date picker with Arabic locale support
- ✅ **Popover** - Overlay component for dropdowns and tooltips

## 🛠️ Configuration Files

### `components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Updated `vite.config.ts`
```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Updated `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎨 Theme Configuration

The project uses a dark theme optimized for Arabic interfaces:

- **Style**: New York (recommended by ShadCN)
- **Base Color**: Neutral
- **CSS Variables**: Enabled for easy customization
- **RTL Support**: Full right-to-left layout

## 🚀 Usage Examples

### Basic Button
```tsx
import { Button } from '@/components/ui/button';

<Button>احفظ البيانات</Button>
<Button variant="outline">إلغاء</Button>
<Button size="lg">زر كبير</Button>
```

### Form Input with RTL
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="name">الاسم</Label>
  <Input 
    id="name" 
    placeholder="أدخل الاسم" 
    className="text-right" 
  />
</div>
```

### Select Dropdown
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger className="text-right">
    <SelectValue placeholder="اختر القسم" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sales">المبيعات</SelectItem>
    <SelectItem value="hr">الموارد البشرية</SelectItem>
  </SelectContent>
</Select>
```

### Data Table
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
      <TableHead className="text-right">القسم</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="text-right">أحمد محمد</TableCell>
      <TableCell className="text-right">المبيعات</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Card Component
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
  </CardHeader>
  <CardContent>
    <p>محتوى البطاقة هنا</p>
  </CardContent>
</Card>
```

### Date Picker with Arabic Locale
```tsx
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const [date, setDate] = useState<Date>();

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, "PPP", { locale: ar }) : "اختر التاريخ"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      locale={ar}
    />
  </PopoverContent>
</Popover>
```

## 🎯 Demo Pages

Visit these URLs to see the components in action:

1. **`/shadcn-demo`** - Complete ShadCN UI showcase with employee management form
2. **`/rtl-demo`** - RTL-specific components and layouts
3. **`/dashboard`** - Main application dashboard

## 🎨 RTL-Specific Styling

### Key Classes for RTL Support
- `text-right` - Right-align text
- `space-x-reverse` - Reverse spacing for flex items
- `flex-row-reverse` - Reverse flex direction
- `pr-10` - Padding right for icons in inputs
- `ml-2` - Margin left for icons (reversed in RTL)

### Component-Specific RTL Classes
```css
/* Input with icon */
.input-with-icon {
  @apply text-right pr-10;
}

/* Button with icon */
.button-with-icon {
  @apply flex items-center;
}
.button-with-icon .icon {
  @apply ml-2; /* Icon on the left in RTL */
}

/* Table headers */
.table-header {
  @apply text-right;
}
```

## 🔧 Adding New Components

To add more ShadCN components:

```bash
npx shadcn@latest add [component-name]
```

Available components:
- `accordion`
- `alert`
- `avatar`
- `badge`
- `checkbox`
- `dialog`
- `dropdown-menu`
- `form`
- `progress`
- `radio-group`
- `sheet`
- `switch`
- `tabs`
- `textarea`
- `toast`
- `tooltip`

## 🌐 Arabic Font Integration

The project includes professional Arabic fonts:

```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">
```

Applied globally in CSS:
```css
body {
  font-family: 'Cairo', 'Tajawal', 'Arial', sans-serif;
}
```

## 📱 Responsive Design

All components are fully responsive and work across different screen sizes:

- **Mobile**: Single column layout
- **Tablet**: Adjusted spacing and sizing
- **Desktop**: Full grid layouts with optimal spacing

## 🎭 Dark Theme Support

The project uses a sophisticated dark theme:

- **Background**: Multiple gradient layers
- **Cards**: Semi-transparent with backdrop blur
- **Borders**: Subtle gray borders with opacity
- **Text**: High contrast for readability
- **Accents**: Purple/blue gradients for interactive elements

## 🔍 Testing

Test all components by visiting:
- `/shadcn-demo` - Interactive form with all components
- Use the navigation panel in the top-left corner
- Test responsive behavior on different screen sizes
- Verify RTL behavior with Arabic text input

## 🚀 Next Steps

1. Customize theme colors in `src/index.css`
2. Add more ShadCN components as needed
3. Create reusable form templates
4. Implement data validation
5. Add animations and transitions

Your ShadCN UI setup is now complete and ready for professional Arabic interface development!
