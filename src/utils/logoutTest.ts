// Utility to test logout functionality
export const testLogout = () => {
  console.log('=== LOGOUT TEST ===');
  
  // Check what's in localStorage before logout
  console.log('Before logout:');
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('user:', localStorage.getItem('user'));
  console.log('token:', localStorage.getItem('token'));
  console.log('userRole:', localStorage.getItem('userRole'));
  
  // Find any auth-related keys
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('auth') || 
    key.includes('token') || 
    key.includes('user') ||
    key.includes('role')
  );
  console.log('Auth-related keys:', authKeys);
  
  return {
    user: localStorage.getItem('user'),
    token: localStorage.getItem('token'),
    keys: Object.keys(localStorage),
    authKeys
  };
};

export const clearAllAuthData = () => {
  console.log('=== CLEARING ALL AUTH DATA ===');
  
  const keysToRemove = ['user', 'token', 'userRole'];
  keysToRemove.forEach(key => {
    const existed = localStorage.getItem(key);
    if (existed) {
      console.log(`Removing ${key} from localStorage`);
      localStorage.removeItem(key);
    }
  });
  
  // Clear any other auth-related keys
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('token') || key.includes('user')) {
      const existed = localStorage.getItem(key);
      if (existed) {
        console.log(`Removing additional auth key ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    }
  });
  
  console.log('All authentication data cleared from localStorage');
  console.log('Remaining keys:', Object.keys(localStorage));
};
