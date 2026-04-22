'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/admin-utils';
import toast from 'react-hot-toast';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await loginAdmin(email, password);
      toast.success('Login successful');
      router.push('/admin/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.code === 'auth/user-not-found'
          ? 'User not found'
          : error?.code === 'auth/wrong-password'
            ? 'Invalid credentials'
            : 'Login failed';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white/30 backdrop-blur-xl flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-1">Welcome</h1>
            <p className="text-xs text-gray-500 font-light">Department of Health Western Visayas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-light text-gray-700 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/40 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white/60 transition-all font-light"
                placeholder="your@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-gray-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/40 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white/60 transition-all font-light"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-900 text-white font-light rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 text-sm tracking-wide"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-white/30 text-center">
            <p className="text-xs text-gray-500 font-light">
              Contact administrator for access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
