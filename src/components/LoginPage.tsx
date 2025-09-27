import { useState } from 'react';
import { Eye, EyeOff, Car, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left side - Car image */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/VinFast.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Car className="text-white mr-2" size={32} />
              <h1 className="text-2xl font-bold text-white">VinFast</h1>
            </div>
            <h2 className="text-xl text-white font-medium">PLEASE LOG IN</h2>
          </div>

          {/* Login form */}
          <div className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abcx@gmail.com"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="hash123"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  LOGGING IN...
                </>
              ) : (
                'LOG IN'
              )}
            </button>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="remember" className="ml-2 text-gray-300 text-sm">
                Remember me
              </label>
            </div>

            {/* Test credentials info */}
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-sm">
              <h4 className="text-blue-300 font-medium mb-2">Test Credentials (Database Roles):</h4>
              <div className="space-y-1 text-blue-200">
                <p><strong>Admin:</strong> admin@gmail.com / hash123</p>
                <p><strong>Dealer:</strong> dealer@gmail.com / hash456</p>
                <p><strong>EVM Staff:</strong> staff@gmail.com / hash123</p>
                <p><strong>Customer:</strong> customer@gmail.com / hash456</p>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-500/30">
                <button
                  onClick={() => {
                    setEmail('admin@gmail.com');
                    setPassword('hash123');
                  }}
                  className="text-blue-300 hover:text-blue-200 text-xs underline"
                >
                  Auto-fill Admin credentials
                </button>
              </div>
            </div>

            {/* Role selection */}
            {/* <div className="grid grid-cols-2 gap-3 mt-6">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    selectedRole === role.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}