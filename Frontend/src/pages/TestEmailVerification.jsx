import React, { useState } from 'react';
import { VITE_API_BASE_URL } from '../utils/api';
import { toast } from 'react-hot-toast';

const TestEmailVerification = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check API connectivity
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/verify-email?token=test`, {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.success === false && data.message.includes('Invalid')) {
        addResult('API Connectivity', true, 'Backend API is responding correctly');
      } else {
        addResult('API Connectivity', false, 'Unexpected API response');
      }
    } catch (error) {
      addResult('API Connectivity', false, `API connection failed: ${error.message}`);
    }

    // Test 2: Test email service configuration
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', type: 'verification' })
      });
      const data = await response.json();
      
      if (data.success) {
        addResult('Email Service', true, 'Email service is configured correctly');
      } else {
        addResult('Email Service', false, `Email service error: ${data.message}`);
      }
    } catch (error) {
      addResult('Email Service', false, `Email service test failed: ${error.message}`);
    }

    // Test 3: Test user registration
    const testUser = {
      first_name: 'Test',
      last_name: 'User',
      email: `test${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'testpass123',
      user_type: 'user'
    };

    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/InsertUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      const data = await response.json();
      
      if (response.ok && data.requiresVerification) {
        addResult('User Registration', true, 'Registration successful with email verification requirement');
      } else if (response.status === 400 && data.message.includes('already exists')) {
        addResult('User Registration', true, 'Duplicate user validation working correctly');
      } else {
        addResult('User Registration', false, `Registration failed: ${data.message}`);
      }
    } catch (error) {
      addResult('User Registration', false, `Registration test failed: ${error.message}`);
    }

    // Test 4: Test resend verification
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/User/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      const data = await response.json();
      
      if (data.success) {
        addResult('Resend Verification', true, 'Resend verification email working');
      } else {
        addResult('Resend Verification', false, `Resend failed: ${data.message}`);
      }
    } catch (error) {
      addResult('Resend Verification', false, `Resend test failed: ${error.message}`);
    }

    setIsRunning(false);
    toast.success('Email verification tests completed!');
  };

  const testManualVerification = () => {
    // Generate a test verification link
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ1c2VyX2lkIjoidGVzdC11c2VyLWlkIiwidHlwZSI6ImVtYWlsX3ZlcmlmaWNhdGlvbiIsImV4cCI6MTczNzQ2NzQwMH0.test';
    const verificationLink = `${window.location.origin}/verify-email?token=${testToken}`;
    
    navigator.clipboard.writeText(verificationLink).then(() => {
      toast.success('Test verification link copied to clipboard!');
      addResult('Manual Test', true, `Test link: ${verificationLink}`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Email Verification System Test
          </h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run Automated Tests'}
            </button>
            
            <button
              onClick={testManualVerification}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Generate Test Verification Link
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Test Results:</h2>
            
            {testResults.length === 0 && !isRunning && (
              <p className="text-gray-500">Click "Run Automated Tests" to start testing the email verification system.</p>
            )}
            
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Running tests...
              </div>
            )}
            
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {result.success ? '✅' : '❌'} {result.test}
                  </h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Manual Testing Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Register a new user with a real email address</li>
              <li>Check your email inbox for the verification email</li>
              <li>Click the verification link in the email</li>
              <li>Verify that the verification page shows success</li>
              <li>Try logging in with the verified account</li>
              <li>Try logging in before verification (should be blocked)</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚙️ System Configuration:</h3>
            <ul className="space-y-1 text-yellow-800">
              <li><strong>API URL:</strong> {VITE_API_BASE_URL}</li>
              <li><strong>Frontend URL:</strong> {window.location.origin}</li>
              <li><strong>Email Service:</strong> Gmail SMTP (configured in backend)</li>
              <li><strong>Token Expiry:</strong> 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmailVerification;