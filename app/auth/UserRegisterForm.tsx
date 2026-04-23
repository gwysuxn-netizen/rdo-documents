'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/user-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function UserRegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [name, setName] = useState('');
  const [office, setOffice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !office || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password, name, office);
      toast.success('Registration successful! Please log in.');
      router.push('/auth/login');
    } catch (error: any) {
      const errorMessage =
        error?.code === 'auth/email-already-in-use'
          ? 'Email already registered'
          : error?.code === 'auth/weak-password'
          ? 'Password is too weak'
          : error?.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-2 rounded-none border-x-0 border-t-0 border-b border-gray-200 px-0 h-11 text-base shadow-none focus-visible:ring-0 focus:border-gray-700 transition-colors bg-transparent';
  const labelClass =
    'text-xs uppercase tracking-widest text-gray-500 font-semibold';

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* LEFT: Hero text */}
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

      {/* RIGHT: Register card */}
      <div className="lg:w-1/2 flex items-center justify-center px-10 py-16 lg:px-20 lg:py-20">
        <div className={cn('w-full max-w-md', className)} {...props}>
          <div className="border border-gray-200 p-10 lg:p-12">

            <div className="mb-10">
              <h2
                className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Create account
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Join the document pickup board.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <Field>
                <FieldLabel htmlFor="name" className={labelClass}>Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="office" className={labelClass}>Office</FieldLabel>
                <Input
                  id="office"
                  type="text"
                  placeholder="e.g. Records Section"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className={labelClass}>Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className={labelClass}>Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword" className={labelClass}>Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </Field>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gray-900 text-white text-sm font-semibold tracking-wide rounded-none hover:bg-black transition-colors"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </div>
            </form>

            <p className="text-sm text-gray-400 mt-8 text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gray-800 hover:text-black font-semibold transition-colors">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}