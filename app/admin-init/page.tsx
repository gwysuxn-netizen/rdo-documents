'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseDatabase } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { AdminInitForm } from './AdminInitForm';

export default function AdminInitPage() {
  const [shouldRender, setShouldRender] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUsersExist = async () => {
      try {
        const db = getFirebaseDatabase();
        if (!db) {
          router.push('/auth/login');
          return;
        }

        // Check if any users exist in the database
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          // Users already exist, redirect to login
          router.push('/auth/login');
        } else {
          // No users exist, show init form
          setShouldRender(true);
        }
      } catch (error: any) {
        console.error('Error checking users:', error);
        
        // If permission denied, it means setup has already been done
        if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
          router.push('/auth/login');
        } else {
          // For other errors, show init form to allow setup
          setShouldRender(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUsersExist();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">Checking system setup...</p>
      </div>
    );
  }

  if (!shouldRender) {
    return null;
  }

  return <AdminInitForm />;
}
