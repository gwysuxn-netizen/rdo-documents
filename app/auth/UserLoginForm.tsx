'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, isUserAdmin } from '@/lib/user-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
      await loginUser(email, password);
      const isAdmin = await isUserAdmin(email);
      toast.success('Login successful');
      router.push(isAdmin ? '/admin/dashboard' : '/');
    } catch (error: any) {
      const errorMessage =
        error?.code === 'auth/user-not-found'
          ? 'User not found. Please register first.'
          : error?.code === 'auth/wrong-password'
          ? 'Invalid credentials'
          : error?.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ── LEFT: HERO TEXT — vertically centered ── */}
      <div className="lg:w-1/2 flex items-center justify-center px-10 py-16 lg:px-20 lg:py-20">
        <div className="space-y-5">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-400 font-medium">
            Regional Director's Office
          </p>
          <h1
            className="font-bold text-gray-900 leading-[1.0]"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(4rem, 8vw, 9rem)',
            }}
          >
            Document<br />Queuing<br />System
          </h1>
          <p className="text-xs text-gray-300 pt-4">
            © {new Date().getFullYear()} RD's Office
          </p>
        </div>
      </div>

      {/* ── RIGHT: LOGIN CARD ── */}
      <div className="lg:w-1/2 flex items-center justify-center px-10 py-16 lg:px-20 lg:py-20">
        <div className={cn('w-full max-w-md', className)} {...props}>

          <div className="border border-gray-200 p-10 lg:p-12">

            <div className="mb-10">
              <h2
                className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Sign in to your account to continue.
              </p>
            </div>

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

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-xs uppercase tracking-widest text-gray-500 font-semibold"
                  >
                    Password
                  </FieldLabel>
                  <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <p className="text-sm text-gray-400 mt-8 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-gray-800 hover:text-black font-semibold transition-colors">
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}