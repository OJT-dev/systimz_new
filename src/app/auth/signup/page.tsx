'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        return;
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-8">Create your account</h2>
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
