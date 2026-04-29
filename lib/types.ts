export type DocumentStatus = 'FOR_PICKUP' | 'RECEIVED';

export interface Document {
  id: string;
  controlNo: string;
  date: string;
  category: string;
  destination: string;
  encodedBy: string;
  subject: string;
  status: DocumentStatus;
  fileURL?: string;
  fileName?: string;
  uploadedAt: number;
  receivedAt?: number | null;
  receivedBy?: string | null;
  notes: string;
}

export interface DocumentFormData {
  controlNo: string;
  date: string;
  category: string;
  destination: string;
  encodedBy: string;
  subject: string;
  notes: string;
  file?: File;
}
