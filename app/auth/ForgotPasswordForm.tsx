'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordReset } from '@/lib/user-utils';
import toast from 'react-hot-toast';
import { Field, FieldLabel, Input, Button } from '@/components/ui';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.toLowerCase());
      setSubmitted(true);
      toast.success('Password reset email sent!');
      setEmail('');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="border border-gray-200 p-10 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-sm text-gray-400">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Check your email</h2>
              <p className="text-sm text-gray-600 mb-6">
                We've sent a password reset link to <span className="font-semibold">{email}</span>
              </p>
              <p className="text-xs text-gray-500 mb-6">
                The link expires in 1 hour. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-xs uppercase tracking-widest text-gray-500 font-semibold"
                >
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="mt-2 rounded-none border-x-0 border-t-0 border-b border-gray-200 px-0 h-11 text-base shadow-none focus-visible:ring-0 focus:border-gray-700 transition-colors bg-transparent"
                />
              </Field>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gray-900 text-white text-sm font-semibold tracking-wide rounded-none hover:bg-black transition-colors"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-sm text-gray-400 mt-8 text-center">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-gray-800 hover:text-black font-semibold transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
