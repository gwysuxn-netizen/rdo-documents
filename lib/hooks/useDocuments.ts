'use client';

import { useEffect, useState } from 'react';
import { getFirebaseDatabase } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Document } from '@/lib/types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const database = getFirebaseDatabase();
    if (!database) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const documentsRef = ref(database, 'documents');
    
    const listener = onValue(
      documentsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const docArray = Object.entries(data).map(([id, doc]: [string, any]) => ({
            id,
            ...doc,
          }));
          setDocuments(docArray);
        } else {
          setDocuments([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading documents:', error);
        setLoading(false);
      }
    );

    return () => off(documentsRef, 'value', listener);
  }, []);

  return { documents, loading };
}
