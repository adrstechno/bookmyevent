import React from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyAuthCleanup } from '../utils/tokenValidation';

const EmergencyReset = () => {
  const navigate = useNavigate();

  const handleEmergencyReset = () => {
    if (window.confirm('This will clear all stored data and log you out. Continue?')) {
      emergencyAuthCleanup();
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Emergency Reset</h1>
          <p className="text-gray-600">Clear all stored data and start fresh</p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Warning:</strong> This will clear all stored authentication data, 
              preferences, and cached information. You will need to log in again.
            </p>
          </div>

          <button
            onClick={handleEmergencyReset}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
          >
            🔄 Clear All Data & Reset
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
          >
            ← Back to Home
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Having issues? Contact our{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyReset;