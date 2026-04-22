# RD's Office Pickup Documents - Setup & Usage Guide

## ✅ Complete Application Built Successfully!

Your document management system is now fully built and ready to deploy.

---

## 🚀 Quick Start

### 1. Environment Configuration
The `.env.local` file has been created with your Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZqar6EQDaNeMc4K2iPrGTfPLcXQSQLlk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rdopdocuments.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rdopdocuments
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rdopdocuments.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=604740279168
NEXT_PUBLIC_FIREBASE_APP_ID=1:604740279168:web:4dfefac4058272bc397f65
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Access the Application

**Public Board** (no login required):
- URL: http://localhost:3000
- Search and filter documents
- View document details
- Check status and receive information

**Admin Portal**:
- URL: http://localhost:3000/admin
- Email: (use your Firebase auth account)
- Password: (use your Firebase auth password)
- Dashboard: http://localhost:3000/admin/dashboard
- Upload: http://localhost:3000/admin/upload

---

## 📋 Features Implemented

### ✅ Public Interface
- **Document Pickup Board** - Full-screen view with search and filter
- **Real-time Updates** - Live updates when documents are added/marked received
- **Document Cards** - Grid layout with status badges
- **Search & Filter** - By Control No, Subject, Destination, or Status
- **Document Detail Modal** - View full tracking form with attachments

### ✅ Admin Interface
- **Login Page** - Secure Firebase authentication
- **Dashboard** - Overview with stats and document table
- **Document Management**:
  - View documents with full details
  - Mark documents as received (with recipient name & notes)
  - Delete documents with confirmation
  - Upload new documents
- **Upload Form** - Complete form with all tracking fields
- **Real-time Updates** - Auto-refresh when changes occur
- **Sidebar Navigation** - Easy access to all admin features

### ✅ UI/UX Design
- **Professional Layout** - Sidebar + Header + Main content
- **Color Scheme** - Teal/Green theme matching your department
- **Responsive Design** - Works on desktop and tablet
- **Status Badges** - Amber for "For Receiving", Green for "Received"
- **Toast Notifications** - Feedback on all actions
- **Loading States** - User-friendly indicators

---

## 🔧 Firebase Setup (To Complete)

### Set Up Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **rdopdocuments** project
3. Go to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Create admin user: **Authentication** > **Users** > **Add user**

### Set Up Firebase Realtime Database
1. Go to **Realtime Database**
2. Create a new database
3. Set security rules:
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

### Set Up Firebase Storage
1. Go to **Storage**
2. Create a new storage bucket
3. Set security rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📂 Project Structure

```
rdo-documents/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Public board
│   ├── DocumentBoardContent.tsx   # Public board component
│   ├── admin/
│   │   ├── layout.tsx            # Admin layout
│   │   ├── page.tsx              # Login page
│   │   ├── AdminLoginForm.tsx    # Login form
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard page
│   │   │   └── AdminDashboardContent.tsx
│   │   └── upload/
│   │       ├── page.tsx          # Upload page
│   │       └── AdminUploadContent.tsx
│   └── globals.css
├── components/
│   ├── DocumentCard.tsx           # Public card view
│   ├── DocumentModal.tsx          # Detail view modal
│   ├── DocumentTrackingForm.tsx   # Form replica
│   ├── Toast.tsx                  # Toast provider
│   ├── layout/
│   │   ├── Sidebar.tsx           # Admin sidebar nav
│   │   ├── Header.tsx            # Header with search
│   │   ├── AdminLayout.tsx       # Admin layout wrapper
│   │   └── Breadcrumb.tsx        # Breadcrumb nav
│   └── admin/
│       ├── AdminDocumentTable.tsx
│       ├── AdminStats.tsx
│       ├── AdminSearchAndFilter.tsx
│       ├── DocumentUploadForm.tsx
│       └── MarkReceivedModal.tsx
├── lib/
│   ├── firebase.ts               # Firebase config
│   ├── types.ts                  # TypeScript types
│   ├── admin-utils.ts            # Admin functions
│   └── hooks/
│       ├── useAdminAuth.ts       # Auth hook
│       └── useDocuments.ts       # Documents hook
├── public/                        # Static files
├── .env.local                    # Firebase credentials
├── middleware.ts                  # Route protection
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🎨 Color Palette

- **Primary (Teal)**: #118880 (sidebar, header, buttons)
- **Accent (Amber)**: #F59E0B (For Pickup status)
- **Success (Green)**: #22C55E (Received status)
- **Info (Blue)**: #3B82F6 (Actions)
- **Danger (Red)**: #EF4444 (Delete)

---

## 📦 Dependencies Installed

```json
{
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "firebase": "latest",
    "react-hot-toast": "latest"
  }
}
```

---

## 🚢 Deployment (Vercel Recommended)

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables on Vercel
Add your `.env.local` variables to Vercel project settings:
- Go to Settings > Environment Variables
- Add all Firebase keys from `.env.local`

---

## 🐛 Troubleshooting

### Firebase Not Initializing
- Verify `.env.local` has all credentials
- Check Firebase project website is correct
- Clear `.next` build cache: `rm -rf .next`

### Authentication Issues
- Ensure email/password user is created in Firebase Console
- Check Authentication > Users section
- Verify credentials are correct

### Database Not Syncing
- Check Realtime Database exists in Firebase Console
- Verify security rules allow reads
- Check browser console for Firebase errors

### File Upload Issues
- Ensure Storage bucket exists
- Check file size < 10MB
- Verify file type is PDF, JPG, or PNG

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check Firebase Console logs
3. Verify Firebase security rules
4. Ensure `.env.local` is not committed to git

---

## ✨ Next Steps

1. ✅ Test login with Firebase credentials
2. ✅ Upload a test document
3. ✅ Verify real-time updates on public board
4. ✅ Test mark as received functionality
5. ✅ Deploy to Vercel when ready

---

**Application built on:** April 15, 2026
**Status:** Ready for testing and deployment
