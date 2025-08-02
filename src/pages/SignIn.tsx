import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, User, Lock, Sparkles, Shield, AlertCircle } from 'lucide-react';

interface JWTPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Removed error and success state, handled by toast

  // Check if user is already authenticated
  React.useEffect(() => {
    const token = Cookies.get('accessToken');
    const role = Cookies.get('userRole');

    if (token && role === 'admin') {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('https://backend-omar-puce.vercel.app/api/sample/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password }),
      });

      // Check if response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'الخادم لا يستجيب بصيغة JSON صحيحة - تأكد من تشغيل الخادم',
        );
      }

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        // Handle different error status codes
        if (res.status === 401) {
          throw new Error(
            data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة',
          );
        } else if (res.status === 404) {
          throw new Error('الخدمة غير متوفرة - تأكد من صحة الرابط');
        } else {
          throw new Error(data.message || `خطأ في الخادم: ${res.status}`);
        }
      }

      // Success case
      if (data.accessToken) {
        Cookies.set('accessToken', data.accessToken, { expires: 7 });
        console.log('Token stored:', data.accessToken);

        // Decode JWT token to extract role
        try {
          const decodedToken = jwtDecode<JWTPayload>(data.accessToken);
          const role = decodedToken.role || 'admin';
          Cookies.set('userRole', role, { expires: 7 });
          console.log('Role extracted from token:', role);
          console.log('Cookies after setting:', {
            token: Cookies.get('accessToken'),
            role: Cookies.get('userRole'),
          });
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Default to admin if decoding fails
          Cookies.set('userRole', 'admin', { expires: 7 });
          console.log('Set default role to admin');
        }

        // Show success message
        toast.success(data.message || 'تم تسجيل الدخول بنجاح');

        // Log before navigation
        console.log('About to navigate to dashboard...');
        console.log('Current cookies:', {
          token: Cookies.get('accessToken'),
          role: Cookies.get('userRole'),
        });

        // Wait a bit for the toast to show, then redirect
        setTimeout(() => {
          console.log('Navigating to dashboard now...');
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error('لم يتم استلام رمز التوثيق من الخادم');
      }
    } catch (err) {
      console.error('Sign in error:', err);

      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('فشل في الاتصال بالخادم');
      } else {
        const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* ShadCN Card with glassmorphism styling */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-l from-purple-600 to-blue-600 rounded-2xl mb-4 mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold text-white mb-2">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-gray-400">
                مرحباً بك مرة أخرى
              </CardDescription>
            </motion.div>
            <div className="flex justify-center mt-4">
              <Badge variant="outline" className="text-xs text-purple-300 border-purple-400/50">
                <Shield className="w-3 h-3 ml-1" />
                أمان عالي
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Login Status Alert */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <Alert className="bg-blue-500/10 border-blue-400/50 text-blue-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  يرجى إدخال بيانات الدخول الصحيحة للوصول إلى لوحة التحكم
                </AlertDescription>
              </Alert>
            </motion.div>

            <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Label
                htmlFor="username"
                className="text-gray-300 font-medium block text-right"
              >
                اسم المستخدم
              </Label>
              <div className="relative flex flex-row-reverse items-center">
                <Input
                  id="username"
                  type="text"
                  placeholder="ادخل اسم المستخدم"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10 h-12 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 text-right"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
                {/* User icon inside input on the right */}
                <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </span>
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Label
                htmlFor="password"
                className="text-gray-300 font-medium block text-right"
              >
                كلمة المرور
              </Label>
              <div className="relative flex flex-row-reverse items-center">
                {/* Lock icon on the right */}
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="ادخل كلمة المرور"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10 h-12 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 text-right"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                {/* Eye/EyeOff icon on the left */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember me & Forgot password */}
            <motion.div
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            ></motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  '...جاري الدخول'
                ) : (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    دخول
                  </motion.span>
                )}
              </Button>
            </motion.div>
            {/* Error and success messages are now only shown as toast notifications */}
          </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignIn;
