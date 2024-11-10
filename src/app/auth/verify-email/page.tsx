'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        // Get the base URL from the current window location
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
          console.error('Verification error:', data);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
          <div
            className={`p-4 rounded-md ${
              status === 'loading'
                ? 'bg-blue-50 text-blue-700'
                : status === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <p>{message}</p>
            {status === 'error' && (
              <p className="mt-2 text-sm">
                If you continue to experience issues, please contact support.
              </p>
            )}
          </div>
          {(status === 'success' || status === 'error') && (
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
            <div className="p-4 rounded-md bg-blue-50 text-blue-700">
              <p>Loading verification page...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
