import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Palette, 
  Component,
  LogIn,
  Info
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'تسجيل الدخول', icon: LogIn },
    { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/home', label: 'الصفحة الرئيسية', icon: Home },
    { path: '/about', label: 'حول النظام', icon: Info },
    { path: '/rtl-demo', label: 'عرض RTL', icon: Palette },
    { path: '/shadcn-demo', label: 'عرض ShadCN', icon: Component },
  ];

  return (
    <Card className="fixed top-4 left-4 z-50 w-64">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                if (window.history.length > 1) navigate(-1);
              } catch (e) {
                navigate('/home');
              }
            }}
            className="text-sm"
          >
            رجوع
          </Button>
        </div>
        <h3 className="font-semibold text-center mb-4 text-foreground">
          التنقل السريع
        </h3>
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="w-full justify-start text-right"
              >
                <Icon className="ml-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Navigation;


