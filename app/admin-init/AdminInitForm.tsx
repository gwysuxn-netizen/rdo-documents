'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDatabase } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
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

export function AdminInitForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
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
      const auth = getFirebaseAuth();
      const db = getFirebaseDatabase();

      if (!auth || !db) {
        toast.error('Firebase not initialized');
        return;
      }

      // Create user account
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(result.user, {
        displayName: name,
      });

      // Add to admins in Realtime Database
      const adminEmailKey = email.toLowerCase().replace(/\./g, '_');
      const adminsRef = ref(db, `admins/${adminEmailKey}`);
      await set(adminsRef, {
        email: email.toLowerCase(),
        displayName: name,
        createdAt: new Date().toISOString(),
        uid: result.user.uid,
        role: 'admin',
      });

      // Add to users in Realtime Database
      const usersRef = ref(db, `users/${adminEmailKey}`);
      await set(usersRef, {
        email: email.toLowerCase(),
        displayName: name,
        createdAt: new Date().toISOString(),
        uid: result.user.uid,
        role: 'admin',
      });

      toast.success('Admin account created successfully!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.code === 'auth/email-already-in-use'
          ? 'Email already registered'
          : error?.code === 'auth/weak-password'
            ? 'Password is too weak'
            : error?.code === 'auth/invalid-email'
              ? 'Invalid email address'
              : 'Failed to create admin account';
      toast.error(errorMessage);
      console.error('Admin init error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black">Initialize Admin Account</CardTitle>
            <CardDescription className="text-gray-600">
              Create the first admin account for the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldSeparator className="mb-6 mt-0 text-black">
                  Admin Setup
                </FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="name" className="text-black">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Admin Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email" className="text-black">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password" className="text-black">Password</FieldLabel>
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
                  <FieldLabel htmlFor="confirmPassword" className="text-black">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-900 active:bg-black">
                    {loading ? 'Creating Admin...' : 'Create Admin Account'}
                  </Button>
                  <FieldDescription className="text-center text-gray-600">
                    Already have an admin?{' '}
                    <Link href="/auth/login" className="text-gray-700 hover:text-black font-medium">
                      Login
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