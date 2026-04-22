'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, isUserAdmin } from '@/lib/user-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
      
      // Check if user is admin
      const isAdmin = await isUserAdmin(email);
      toast.success('Login successful');
      
      // Route to dashboard based on role
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
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
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className={cn("flex flex-col gap-6 w-full max-w-md relative z-10", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldSeparator className="mb-6 mt-0">
                  Login to your account
                </FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link href="#" className="text-xs text-gray-700 hover:text-black underline-offset-2 hover:underline">
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
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-900 active:bg-black">
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-gray-700 hover:text-black font-medium">
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
