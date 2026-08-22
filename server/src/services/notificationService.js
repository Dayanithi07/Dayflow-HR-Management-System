import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendNotification = async ({ employeeId, type, message }) => {
  try {
    // 1. Create in-app notification in database
    const notification = await prisma.notification.create({
      data: {
        employeeId,
        type,
        message,
        read: false
      }
    });

    // 2. Mock Email Notification System
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { email: true, name: true }
    });

    if (employee) {
      console.log(`\n======================================================`);
      console.log(`📧 [MOCK EMAIL ALERT] Sending email to: ${employee.email}`);
      console.log(`Subject: Dayflow HRMS Alert - ${type}`);
      console.log(`Dear ${employee.name},\n`);
      console.log(`${message}`);
      console.log(`\nBest regards,\nDayflow HRMS Notification Service`);
      console.log(`======================================================\n`);
    }

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error.message);
  }
};
