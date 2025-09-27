import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export const TokenTest: React.FC = () => {
  const { checkToken } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Run token tests
    const runTests = async () => {
      console.log('=== TOKEN TEST COMPONENT ===');
      
      // Test 1: Check localStorage
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Token:', token);
      console.log('User:', user);
      
      // Test 2: Check token format and validate JWT
      let tokenInfo = null;
      if (token) {
        if (token.startsWith('mock-token-')) {
          const timestamp = token.replace('mock-token-', '');
          const date = new Date(parseInt(timestamp));
          tokenInfo = {
            type: 'mock',
            createdAt: date.toLocaleString(),
            isValid: false, // Mock tokens are not valid for real API
            isJWT: false
          };
        } else {
          // Check if it's a valid JWT
          const isValid = authService.isTokenValid(token);
          const jwtInfo = authService.getTokenInfo(token);
          
          tokenInfo = {
            type: isValid ? 'real-jwt' : 'invalid',
            isValid: isValid,
            isJWT: token.includes('.') && token.split('.').length === 3,
            jwtInfo: jwtInfo
          };
        }
      }
      
      // Test 3: Test API call
      let apiTest = null;
      if (token) {
        try {
          const response = await fetch('/api/Vehicle', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          apiTest = {
            status: response.status,
            statusText: response.statusText,
            success: response.status === 200,
            rejected: response.status === 401
          };
        } catch (error) {
          apiTest = {
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          };
        }
      }
      
      const results = {
        token,
        user: user ? JSON.parse(user) : null,
        tokenInfo,
        apiTest,
        timestamp: new Date().toLocaleString()
      };
      
      setTestResults(results);
      console.log('Test Results:', results);
    };
    
    runTests();
  }, []);

  if (!testResults) {
    return <div>Loading token tests...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Token Test Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Token Information</h3>
          {testResults.token ? (
            <div>
              <p><strong>Token:</strong> {testResults.token}</p>
              <p><strong>Type:</strong> {testResults.tokenInfo?.type}</p>
              <p><strong>Is JWT:</strong> {testResults.tokenInfo?.isJWT ? '✅' : '❌'}</p>
              <p><strong>Valid:</strong> {testResults.tokenInfo?.isValid ? '✅' : '❌'}</p>
              {testResults.tokenInfo?.createdAt && (
                <p><strong>Created:</strong> {testResults.tokenInfo.createdAt}</p>
              )}
              {testResults.tokenInfo?.jwtInfo && (
                <div className="mt-2 p-2 bg-blue-100 rounded">
                  <p><strong>JWT Info:</strong></p>
                  <p>• User ID: {testResults.tokenInfo.jwtInfo.userId}</p>
                  <p>• Email: {testResults.tokenInfo.jwtInfo.email}</p>
                  <p>• Role: {testResults.tokenInfo.jwtInfo.role}</p>
                  {testResults.tokenInfo.jwtInfo.expiresAt && (
                    <p>• Expires: {testResults.tokenInfo.jwtInfo.expiresAt}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">❌ No token found</p>
          )}
        </div>

        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">User Information</h3>
          {testResults.user ? (
            <div>
              <p><strong>Email:</strong> {testResults.user.email}</p>
              <p><strong>Name:</strong> {testResults.user.name}</p>
              <p><strong>Role:</strong> {testResults.user.role}</p>
              <p><strong>ID:</strong> {testResults.user.id}</p>
            </div>
          ) : (
            <p className="text-red-600">❌ No user data found</p>
          )}
        </div>

        {/* API Test */}
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">API Test Results</h3>
          {testResults.apiTest ? (
            <div>
              <p><strong>Status:</strong> {testResults.apiTest.status}</p>
              <p><strong>Status Text:</strong> {testResults.apiTest.statusText}</p>
              <p><strong>Success:</strong> {testResults.apiTest.success ? '✅' : '❌'}</p>
              {testResults.apiTest.rejected && (
                <p className="text-orange-600">⚠️ Token rejected by backend (401)</p>
              )}
              {testResults.apiTest.error && (
                <p className="text-red-600">❌ Error: {testResults.apiTest.error}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No API test performed (no token)</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div className="space-y-2">
            <p>• Token stored: {testResults.token ? '✅' : '❌'}</p>
            <p>• User data stored: {testResults.user ? '✅' : '❌'}</p>
            <p>• API accessible: {testResults.apiTest?.success ? '✅' : '❌'}</p>
            <p>• Fallback working: {testResults.apiTest?.rejected ? '✅' : '❓'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Test run at: {testResults.timestamp}
      </div>
    </div>
  );
};

