# 🌊 Dayflow HRMS - Human Resource Management System

Dayflow HRMS is a modern, full-stack Human Resource Management System built with a sleek, Odoo-inspired UI design. It empowers organizations to efficiently manage employee records, daily attendance check-ins/check-outs, leave management, and payroll processing.

---

## 🚀 Current Implementation

### 🎨 Frontend Architecture
- **Framework & Tooling**: Built with **React 18** and **Vite** for ultra-fast HMR and build performance.
- **Design System & Aesthetics**: Customized **TailwindCSS v4** styling paired with an Odoo-inspired color palette (`#714B67` Odoo Purple, `#017E84` Odoo Teal, `#F7F7F7` Soft Surface Backgrounds) and **Outfit** typography.
- **UI Components**: Modern claymorphic cards (`clay-card`), inputs (`clay-input`), and action buttons (`clay-button-purple`, `clay-button-teal`) with subtle micro-interactions.
- **Iconography**: Clean, vector icons powered by **Lucide React**.
- **Authentication View**: Responsive Login page (`Login.jsx`) featuring password visibility toggling, input validation, and direct JWT payload processing.

### ⚙️ Backend RESTful API
- **Runtime & Server**: **Node.js** with **Express.js** providing a structured, scalable REST API.
- **Authentication & Security**:
  - Secure password hashing using **bcryptjs** (10 salt rounds).
  - Stateless authentication via **JSON Web Tokens (JWT)** with 24-hour expiration.
  - Role-based Access Control (RBAC) middleware for restricting sensitive actions to `ADMIN` users.
- **API Endpoints**:
  - `/api/auth` — Sign Up, Login, and User Profile (`/me`) endpoints.
  - `/api/employees` — Fetch all employees, view detailed employee profiles, and update profile fields with strict permission checks.
  - `/api/attendance` — Fetch logs, get today's check-in status (`/today`), and execute toggle check-in/check-out (`/toggle`) with automatic hours calculation and status assignment (`PRESENT` / `HALF_DAY`).
  - `/api/leaves` — Submit leave requests, retrieve request lists, and admin approval/rejection workflows (`/:id/approval`) with auto-population of attendance records for approved leaves.
  - `/api/payroll` — Retrieve payroll slips and generate/update monthly payroll calculations (`/generate`).

### 🗄️ Database Schema & Data Modeling
Managed via **Prisma ORM** with a **PostgreSQL** relational database:
- `User`: Employee & Admin profiles (email, password hash, role, department, position, avatar URL, base salary, contact details).
- `Attendance`: Daily attendance logs (date, check-in time, check-out time, status, calculated total hours).
- `LeaveRequest`: Leave applications (type: Paid/Sick/Unpaid, date range, status: Pending/Approved/Rejected, admin comments).
- `Payroll`: Monthly salary slips (base salary, allowances, deductions, net salary, status).
- `Document`: Employee file attachments and document management.

---

## 📋 Upcoming Implementation Plan

### 📌 1. Main Navigation & Redirection
* **Landing Page**: Upon successful authentication, users are automatically redirected to the primary **HRMS Dashboard**.
* **Top Navigation Bar Content**:
  * **Company Logo**: Displayed at the far left of the navbar.
  * **Navigation Tabs**: Direct navigation links for **Employees**, **Attendance**, and **Time Off**.
  * **Search Bar**: Centered search input for quickly filtering employees, departments, or records.
  * **User Profile Picture (Avatar)**: Positioned at the far right of the navigation bar.

### 👥 2. Employee Cards Grid
* **Interactivity**: Each employee card in the grid is fully interactive and clickable.
* **On-Click Action**: Clicking an employee card opens the specific employee details page in a **view-only (non-editable)** mode.
* **Card Content**: Displays the employee's profile picture and basic details (labeled with `[Employee Name]`, department, and designation).
* **Status Indicators (Top-Right Corner of Cards)**:
  * 🟢 **Green Dot**: Employee is currently present in the office.
  * ✈️ **Airplane Icon**: Employee is currently on approved leave.
  * 🟡 **Yellow Dot**: Employee is absent (has not applied for time off and is absent).

### 👤 3. User Profile Dropdown
* **Trigger Action**: Clicking the user profile avatar in the top navigation bar opens a contextual dropdown menu.
* **Dropdown Menu Options**:
  * **My Profile**: Opens the logged-in user's profile in a form view for viewing/editing personal details.
  * **Log Out**: Terminates the session, clears local storage tokens, and redirects to the login screen.

### ⏱️ 4. Attendance Check-In / Check-Out Systray
* **Location**: Positioned in the right sidebar panel of the dashboard.
* **Buttons & Elements**:
  * **Check In** button.
  * **Real-time Clock Display**: Shows current live time (e.g., `10:00 PM`).
  * **Check Out** button.
* **Functional Logic**:
  * Employees can instantly record daily attendance directly from this widget.
  * Attendance records can be reviewed in detail via the dedicated **Attendance** module tab.
  * Upon a successful **Check IN**, the employee's status indicator dot automatically updates from **red** to **green**.

### ⚙️ 5. Footer Element
* **Settings Navigation**: A subtle navigation button labeled **"Settings"** located at the bottom-left area below the main grid for quick access to system configurations.

---

## 🛠️ Project Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL Database

### 1. Backend Setup
```bash
cd server
npm install
```
Configure your `.env` file in the `server` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/dayflow_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

Run database migrations and seed data:
```bash
npx prisma db push
node src/seed.js
```

Start backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📄 License
This project is developed for the Hackathon - NMIT DayFlow HRMS challenge.
