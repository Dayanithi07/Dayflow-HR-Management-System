import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dayflow HRMS database...');

  // Password hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const empPassword = await bcrypt.hash('emp123', 10);

  // 1. Create Admin / HR Officer
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP-001',
      email: 'admin@dayflow.com',
      passwordHash: adminPassword,
      name: 'Sarah Connor',
      role: 'ADMIN',
      department: 'Human Resources',
      position: 'HR Director & System Admin',
      phone: '+1 (555) 019-2834',
      address: '100 Enterprise Way, Suite 400, Innovation City',
      baseSalary: 95000,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
    }
  });

  // 2. Create Regular Employees
  const emp1 = await prisma.user.upsert({
    where: { email: 'alex.morgan@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP-102',
      email: 'alex.morgan@dayflow.com',
      passwordHash: empPassword,
      name: 'Alex Morgan',
      role: 'EMPLOYEE',
      department: 'Engineering',
      position: 'Senior Full Stack Engineer',
      phone: '+1 (555) 012-9847',
      address: '42 Developer Lane, Tech Park',
      baseSalary: 78000,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    }
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'david.chen@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP-103',
      email: 'david.chen@dayflow.com',
      passwordHash: empPassword,
      name: 'David Chen',
      role: 'EMPLOYEE',
      department: 'Product Design',
      position: 'Lead UX/UI Designer',
      phone: '+1 (555) 014-4321',
      address: '88 Creative Blvd, Studio 12',
      baseSalary: 72000,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    }
  });

  console.log(`Created users: Admin (${admin.email}), Employee 1 (${emp1.email}), Employee 2 (${emp2.email})`);

  // 3. Seed Attendance
  const dates = ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22'];
  for (const date of dates) {
    await prisma.attendance.create({
      data: {
        employeeId: emp1.id,
        date,
        checkIn: new Date(`${date}T09:00:00Z`),
        checkOut: new Date(`${date}T17:30:00Z`),
        status: 'PRESENT',
        totalHours: 8.5
      }
    });

    await prisma.attendance.create({
      data: {
        employeeId: emp2.id,
        date,
        checkIn: new Date(`${date}T09:15:00Z`),
        checkOut: new Date(`${date}T17:15:00Z`),
        status: 'PRESENT',
        totalHours: 8.0
      }
    });
  }

  // 4. Seed Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp1.id,
      leaveType: 'PAID',
      startDate: '2026-08-28',
      endDate: '2026-08-30',
      remarks: 'Annual family vacation leave',
      status: 'PENDING'
    }
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp2.id,
      leaveType: 'SICK',
      startDate: '2026-08-10',
      endDate: '2026-08-11',
      remarks: 'Fever and medical rest',
      status: 'APPROVED',
      adminComment: 'Approved by HR. Get well soon!'
    }
  });

  // 5. Seed Payroll
  await prisma.payroll.create({
    data: {
      employeeId: emp1.id,
      month: 'August',
      year: 2026,
      baseSalary: 78000,
      allowances: 3500,
      deductions: 1200,
      netSalary: 80300,
      status: 'PAID'
    }
  });

  await prisma.payroll.create({
    data: {
      employeeId: emp2.id,
      month: 'August',
      year: 2026,
      baseSalary: 72000,
      allowances: 2500,
      deductions: 900,
      netSalary: 73600,
      status: 'PAID'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
