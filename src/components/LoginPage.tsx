import { useState } from 'react';
import { Eye, EyeOff, Car, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setError('');

    try {
      const success = await login(email, password);
      console.log('Login success:', success);
      
      if (success) {
        // Get user data from localStorage to determine role
        const userData = localStorage.getItem('user');
        console.log('User data from localStorage:', userData);
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('Parsed user:', user);
          console.log('User role:', user.role);
          
          // Navigate to dashboard for all roles
          const targetRoute = '/portal/dashboard';
          
          console.log('Navigating to:', targetRoute);
          navigate(targetRoute);
        } else {
          console.error('No user data found in localStorage');
          setError('Không tìm thấy thông tin người dùng. Vui lòng thử lại.');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };


  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Left side - Video Background */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/VinFast.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to<br />
            <span className="text-red-500">VinFast EVM</span>
          </h1>
          <p className="text-xl opacity-90 max-w-md leading-relaxed">
            Quản lý đại lý thông minh, hiệu quả và chuyên nghiệp
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:w-2/5 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-2xl">
              <Car className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">VinFast</h1>
            <p className="text-gray-400 text-lg">Đăng nhập vào hệ thống</p>
          </div>

          {/* Error/Success Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Địa chỉ email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 group-hover:border-gray-500/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Mật khẩu
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 group-hover:border-gray-500/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500/20 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-3 text-gray-300 text-sm">
                  Ghi nhớ đăng nhập
                </label>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] disabled:hover:scale-100 shadow-xl hover:shadow-red-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={20} />
                  Đang đăng nhập...
                </>
              ) : (
                'ĐĂNG NHẬP'
              )}
            </button>

            {/* Quick Login Section */}
            
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}