# README: RD's Office Pickup Documents

This is a full-stack document management system for the Regional Director's office. It allows admins to upload and manage documents, while public users can view and search for documents available for pickup.

## Features

- **Public Document Board**: View all available documents with real-time updates
- **Admin Dashboard**: Manage documents with status tracking
- **File Upload**: Upload PDF, JPG, or PNG files with document metadata
- **Real-time Updates**: Live updates using Firebase Realtime Database listeners
- **Authentication**: Firebase Email/Password authentication for admins
- **Status Tracking**: Monitor document status (For Pickup / Received)
- **Search & Filter**: Search by Control No, Subject, or Destination

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Notifications**: react-hot-toast

## Environment Setup

1. Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Copy your Firebase config values to `.env.local`

3. Configure Firebase Security Rules:
   ```json
   {
     "rules": {
       "documents": {
         ".read": true,
         ".write": "auth != null"
       }
     }
   }
   ```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public board.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to log in as admin.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx                 # Root layout with Toast provider
├── page.tsx                   # Public document board
├── DocumentBoardContent.tsx   # Client component for board
├── admin/
│   ├── page.tsx              # Login page
│   ├── AdminLoginForm.tsx    # Login form
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard page
│   │   └── AdminDashboardContent.tsx  # Dashboard client component
│   └── upload/
│       ├── page.tsx          # Upload page
│       └── AdminUploadContent.tsx     # Upload client component
├── globals.css               # Tailwind CSS imports
└── favicon.ico

components/
├── DocumentTrackingForm.tsx   # Replica of physical tracking form
├── DocumentCard.tsx          # Public card view
├── DocumentModal.tsx         # Detail modal for documents
├── Toast.tsx                 # Toast notifications provider
└── admin/
    ├── AdminDocumentTable.tsx      # Admin document table
    ├── AdminStats.tsx              # Statistics dashboard
    ├── AdminSearchAndFilter.tsx    # Search & filter component
    ├── DocumentUploadForm.tsx      # Upload form
    └── MarkReceivedModal.tsx       # Mark received dialog

lib/
├── firebase.ts               # Firebase initialization
├── types.ts                  # TypeScript interfaces
├── admin-utils.ts            # Admin database operations
└── hooks/
    ├── useAdminAuth.ts       # Admin authentication hook
    └── useDocuments.ts       # Real-time documents hook

public/                        # Static files

middleware.ts                  # Route protection middleware
```

## Routes

### Public Routes
- `/` - Document pickup board (no login required)

### Admin Routes (Protected)
- `/admin` - Login page
- `/admin/dashboard` - Document management dashboard
- `/admin/upload` - Upload new document

## Database Schema

### Documents Collection
```typescript
documents/{documentId}: {
  controlNo: string;           // Unique tracking number
  date: string;                // ISO format date/time
  source: string;              // Document source
  category: string;            // Document category
  origin: string;              // Where document came from
  destination: string;         // Who should pick it up
  encodedBy: string;           // Person who encoded
  subject: string;             // Document subject
  status: 'FOR_PICKUP' | 'RECEIVED';
  fileURL?: string;            // Firebase Storage URL
  fileName?: string;           // Original file name
  uploadedAt: number;          // Timestamp
  receivedAt?: number;         // Timestamp when received
  receivedBy?: string;         // Who received it
  notes: string;               // Admin notes
}
```

## Key Features Explained

### Real-time Updates
The public board uses Firebase's `onValue` listener to automatically update when documents are added or marked as received—no page refresh needed.

### File Uploads
Files are stored in Firebase Storage under `documents/{docId}/` and accessible URLs are stored in the database.

### Admin Authentication
Protected with Firebase email/password auth. The `useAdminAuth` hook redirects unauthenticated users to `/admin`.

### Document Tracking Form
Renders a replica of the physical tracking form in both admin and public views for consistency.

## Deployment

This project is optimized for deployment on Vercel:

```bash
vercel deploy
```

Make sure to set environment variables in your Vercel project settings.

## Support

For issues or questions, contact your system administrator.
