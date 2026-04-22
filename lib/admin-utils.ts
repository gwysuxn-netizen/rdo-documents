import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  ref,
  set,
  update,
  remove,
  push,
  get,
} from 'firebase/database';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getFirebaseAuth, getFirebaseDatabase, getFirebaseStorage } from '@/lib/firebase';
import { DocumentFormData, Document } from '@/lib/types';

export async function loginAdmin(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function uploadDocument(data: DocumentFormData & { file?: File }) {
  try {
    const database = getFirebaseDatabase();
    const storage = getFirebaseStorage();
    
    if (!database || !storage) throw new Error('Firebase not initialized');

    // Create a new document reference
    const docRef = push(ref(database, 'documents'));
    const docId = docRef.key!;

    let fileURL: string | undefined;
    let fileName: string | undefined;

    // Upload file if provided
    if (data.file) {
      const fileRef = storageRef(storage, `documents/${docId}/${data.file.name}`);
      await uploadBytes(fileRef, data.file);
      fileURL = await getDownloadURL(fileRef);
      fileName = data.file.name;
    }

    // Get the current date in the correct format for display
    const currentDate = new Date(data.date);
    const displayDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // Write document to database
    await set(docRef, {
      controlNo: data.controlNo,
      date: displayDate,
      source: data.source,
      category: data.category,
      origin: data.origin,
      destination: data.destination,
      encodedBy: data.encodedBy,
      subject: data.subject,
      status: 'FOR_PICKUP',
      fileURL: fileURL || null,
      fileName: fileName || null,
      uploadedAt: Date.now(),
      receivedAt: null,
      receivedBy: null,
      notes: data.notes,
    });

    return docId;
  } catch (error) {
    throw error;
  }
}

export async function markDocumentReceived(
  docId: string,
  receivedBy: string,
  notes: string,
  receivedDateTime?: string
) {
  try {
    const database = getFirebaseDatabase();
    if (!database) throw new Error('Firebase not initialized');

    const docRef = ref(database, `documents/${docId}`);
    await update(docRef, {
      status: 'RECEIVED',
      receivedAt: Date.now(),
      receivedDateTime: receivedDateTime || new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      receivedBy: receivedBy,
      notes: notes,
    });
  } catch (error) {
    throw error;
  }
}

export async function deleteDoc(docId: string) {
  try {
    const database = getFirebaseDatabase();
    const storage = getFirebaseStorage();
    
    if (!database || !storage) throw new Error('Firebase not initialized');

    // Delete file from storage if exists
    try {
      const docRef = ref(database, `documents/${docId}`);
      const snapshot = await get(docRef);
      const docData = snapshot.val();
      
      if (docData?.fileURL) {
        const fileRef = storageRef(storage, `documents/${docId}`);
        await deleteObject(fileRef);
      }
    } catch (error) {
      // File might not exist, continue with deletion
      console.log('No file to delete or error deleting file:', error);
    }

    // Delete document from database
    const docRef = ref(database, `documents/${docId}`);
    await remove(docRef);
  } catch (error) {
    throw error;
  }
}
