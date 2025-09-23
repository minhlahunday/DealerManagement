import React, { useState } from 'react';
import { Eye, EyeOff, Car } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleLogin = () => {
    console.log('Login attempt:', { email, password, role: selectedRole });
  };

  const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'staff', label: 'Staff' },
    { id: 'evm', label: 'EVM' },
    { id: 'dealer-manager', label: 'Dealer Manager' }
  ];

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
                placeholder="John Doe"
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
                  placeholder="••••••••••"
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

            {/* Login button */}
            <button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              LOG IN
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

            {/* Role selection */}
            <div className="grid grid-cols-2 gap-3 mt-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}