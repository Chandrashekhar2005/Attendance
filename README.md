# Attendly

A modern, mobile-optimized student attendance management system with real-time tracking and reporting.

## Features

- **Real-time Attendance**: Mark and track student attendance with ease.
- **Student Management**: Add, edit, and delete student records.
- **Reporting**: Generate and export attendance reports (PDF support).
- **Dashboard**: Get a quick overview of today's attendance and trends.
- **Firebase Integration**: Secure data storage and authentication.
- **Dark Mode**: Support for light and dark themes.
- **Mobile Optimized**: Designed for a great experience on mobile devices.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion
- **Backend**: Firebase (Firestore, Auth)
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF, jsPDF-autotable

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd attendly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The app can be deployed to any static site hosting service (e.g., Vercel, Netlify, Firebase Hosting).

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder.

## License

This project is licensed under the Apache-2.0 License.
