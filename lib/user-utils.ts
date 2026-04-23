'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDatabase } from '@/lib/firebase';
import { ref, get, set, remove, update } from 'firebase/database';

const ADMIN_EMAILS: string[] = [];

export async function hasAnyAdmin(): Promise<boolean> {
  try {
    const db = getFirebaseDatabase();
    if (!db) return false;
    const snapshot = await get(ref(db, 'admins'));
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if admins exist:', error);
    return false;
  }
}

export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    const db = getFirebaseDatabase();
    if (!db) return false;
    if (ADMIN_EMAILS.includes(email.toLowerCase())) return true;
    const snapshot = await get(ref(db, 'admins'));
    if (snapshot.exists()) {
      const admins = snapshot.val();
      const adminEmailKey = email.toLowerCase().replace(/\./g, '_');
      return admins[adminEmailKey] !== undefined;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

async function isFirstUser(): Promise<boolean> {
  try {
    const db = getFirebaseDatabase();
    if (!db) return false;
    const snapshot = await get(ref(db, 'users'));
    return !snapshot.exists();
  } catch (error) {
    console.error('Error checking if first user:', error);
    return false;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
}

export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
  office?: string,
) {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(result.user, { displayName });

    const isFirst = await isFirstUser();
    const db = getFirebaseDatabase();

    if (db) {
      const userEmailKey = email.toLowerCase().replace(/\./g, '_');
      const userRecord = {
        email: email.toLowerCase(),
        displayName: displayName || email,
        office: office || '',
        createdAt: new Date().toISOString(),
        uid: result.user.uid,
        role: isFirst ? 'admin' : 'user',
      };
      if (isFirst) await set(ref(db, `admins/${userEmailKey}`), userRecord);
      await set(ref(db, `users/${userEmailKey}`), userRecord);
    }

    return result.user;
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}

// ── Types & account management ────────────────────────────────────────────────

export interface UserRecord {
  email: string;
  displayName: string;
  office: string;
  createdAt: string;
  uid: string;
  role: 'admin' | 'user';
}

export async function getAllUsers(): Promise<UserRecord[]> {
  try {
    const db = getFirebaseDatabase();
    if (!db) return [];
    const snapshot = await get(ref(db, 'users'));
    if (!snapshot.exists()) return [];
    const raw = snapshot.val() as Record<string, UserRecord>;
    return Object.values(raw).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserRecord(
  original: UserRecord,
  patch: { displayName: string; office: string; role: 'admin' | 'user' },
): Promise<void> {
  const db = getFirebaseDatabase();
  if (!db) throw new Error('Firebase not initialized');

  const key = original.email.toLowerCase().replace(/\./g, '_');

  const updates: Record<string, unknown> = {
    [`/users/${key}/displayName`]: patch.displayName,
    [`/users/${key}/office`]: patch.office,
    [`/users/${key}/role`]: patch.role,
  };

  if (patch.role === 'admin') {
    updates[`/admins/${key}/displayName`] = patch.displayName;
    updates[`/admins/${key}/office`] = patch.office;
    updates[`/admins/${key}/role`] = patch.role;
    updates[`/admins/${key}/email`] = original.email;
    updates[`/admins/${key}/uid`] = original.uid;
    updates[`/admins/${key}/createdAt`] = original.createdAt;
  } else if (original.role === 'admin') {
    await remove(ref(db, `/admins/${key}`));
  }

  await update(ref(db), updates);
}

export async function deleteUserRecord(email: string): Promise<void> {
  try {
    const db = getFirebaseDatabase();
    if (!db) throw new Error('Firebase not initialized');
    const emailKey = email.toLowerCase().replace(/\./g, '_');
    await remove(ref(db, `users/${emailKey}`));
    await remove(ref(db, `admins/${emailKey}`));
  } catch (error) {
    throw error;
  }
}