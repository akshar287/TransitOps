# TransitOps — Smart Transport Operations Platform

TransitOps is a full-stack, enterprise-grade transport operations platform built using Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, and MongoDB. The application features a premium warm light cream/sand theme, role-based access control (RBAC), database transaction-backed trip workflows, and an analytics suite with CSV/PDF reporting capabilities.

---

## 🚀 Key Features

*   **Warm Cream/Sand UI**: Premium, high-quality light B2B theme matching modern ERP dashboards.
*   **Role-Based Access Control (RBAC)**: Exposes customized pages and actions based on user session roles:
    *   **Fleet Manager**: Total operational control (Fleet registry, Maintenance tracking, System settings).
    *   **Dispatcher**: Manage trip planning, workflows, live boards, and dispatching.
    *   **Safety Officer**: Handle driver profiles, compliance records, and license monitoring.
    *   **Financial Analyst**: Track fuel consumption, trip expenses, and analytics.
*   **MongoDB Transactions**: Dispatching, completing, and canceling trips are protected with atomic database transactions to ensure consistency between Vehicles, Drivers, and Trips.
*   **Analytics Dashboard**: Visual reports showcasing fleet utilization, fuel efficiency, operational costs, and ROI. Supports exporting data to CSV and printing/saving to PDF.
*   **Simplified Sign In/Sign Up**: Self-serve registration page that stores credentials securely in MongoDB (password hashed via `bcrypt`), and a streamlined sign-in screen that automatically routes users to their dashboard.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router) + TypeScript
*   **Styling**: Tailwind CSS + shadcn/ui + Lucide Icons
*   **State Management**: Zustand
*   **Database**: MongoDB via Mongoose
*   **Authentication**: NextAuth.js (Credentials Provider)
*   **Charts**: Recharts

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the project:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
MONGODB_URI=mongodb://localhost:27017/transitops
```

*Note: Since MongoDB Transactions are utilized, your local MongoDB instance must run as a **Replica Set**. Alternatively, you can use a MongoDB Atlas connection string.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Seeding

To quickly populate your local database with 50 vehicles, 50 drivers, and matching operational datasets (trips, maintenance, fuel, and expenses) modeled around the Indian logistics context (Tata/Ashok Leyland trucks, major Indian cities, and INR pricing):

1.  Start the development server.
2.  Navigate to: **`http://localhost:3000/api/seed`**
3.  You will receive a success response, and the database will be populated.

