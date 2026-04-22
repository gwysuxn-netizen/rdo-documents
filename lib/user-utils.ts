import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDatabase } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

// Hardcoded list of admin emails - can be extended as needed
const ADMIN_EMAILS: string[] = [
  // Add admin emails here
];

export async function hasAnyAdmin(): Promise<boolean> {
  try {
    const db = getFirebaseDatabase();
    if (!db) return false;

    const adminsRef = ref(db, 'admins');
    const snapshot = await get(adminsRef);
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

    // Check if email is in admin list
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return true;
    }
    
    // Check Realtime Database for admin status
    const adminsRef = ref(db, 'admins');
    const snapshot = await get(adminsRef);
    
    if (snapshot.exists()) {
      const admins = snapshot.val();
      // Convert email to same format used when storing (dots replaced with underscores)
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

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
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

export async function registerUser(email: string, password: string, displayName?: string) {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, {
        displayName,
      });
    }
    
    // Check if this is the first user
    const isFirst = await isFirstUser();
    const db = getFirebaseDatabase();
    if (db) {
      const userEmailKey = email.toLowerCase().replace(/\./g, '_');
      
      if (isFirst) {
        // First user becomes admin
        const adminRef = ref(db, `admins/${userEmailKey}`);
        await set(adminRef, {
          email: email.toLowerCase(),
          displayName: displayName || email,
          createdAt: new Date().toISOString(),
          uid: result.user.uid,
          role: 'admin',
        });
      }
      
      // Add user to users collection
      const userRef = ref(db, `users/${userEmailKey}`);
      await set(userRef, {
        email: email.toLowerCase(),
        displayName: displayName || email,
        createdAt: new Date().toISOString(),
        uid: result.user.uid,
        role: isFirst ? 'admin' : 'user',
      });
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
