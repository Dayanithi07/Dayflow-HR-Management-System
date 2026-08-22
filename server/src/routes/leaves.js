import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get leave requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'ADMIN') {
      where.employeeId = req.user.id;
    }

    const requests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true, department: true, position: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
});

// Employee Apply for Leave
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Leave type, start date, and end date are required' });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: req.user.id,
        leaveType,
        startDate,
        endDate,
        remarks,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Leave application submitted successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit leave application', error: error.message });
  }
});

// Admin Approve / Reject Leave Request
router.put('/:id/approval', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body; // status: APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminComment
      },
      include: { employee: true }
    });

    // If approved, create attendance LEAVE record for the date range
    if (status === 'APPROVED') {
      const start = new Date(updatedLeave.startDate);
      const end = new Date(updatedLeave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existingAttendance = await prisma.attendance.findFirst({
          where: { employeeId: updatedLeave.employeeId, date: dateStr }
        });

        if (!existingAttendance) {
          await prisma.attendance.create({
            data: {
              employeeId: updatedLeave.employeeId,
              date: dateStr,
              status: 'LEAVE',
              totalHours: 0
            }
          });
        }
      }
    }

    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leaveRequest: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process leave approval', error: error.message });
  }
});

export default router;
