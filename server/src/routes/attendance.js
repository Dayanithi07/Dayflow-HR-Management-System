import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const getTodayString = () => new Date().toISOString().split('T')[0];

// Get attendance logs (Employee: self, Admin: all or filtered)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    const where = {};

    if (req.user.role !== 'ADMIN') {
      where.employeeId = req.user.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (date) {
      where.date = date;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true, department: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
});

// Get today's check-in status for current user
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const record = await prisma.attendance.findFirst({
      where: {
        employeeId: req.user.id,
        date: today
      }
    });

    res.json(record || { checkedIn: false, record: null });
  } catch (error) {
    res.status(500).json({ message: 'Error checking today status', error: error.message });
  }
});

// Check-in / Check-out Toggle
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const today = getTodayString();
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: req.user.id,
        date: today
      }
    });

    const now = new Date();

    if (!existing) {
      // Perform Check-in
      const newRecord = await prisma.attendance.create({
        data: {
          employeeId: req.user.id,
          date: today,
          checkIn: now,
          status: 'PRESENT'
        }
      });
      return res.json({ message: 'Checked in successfully!', action: 'CHECK_IN', record: newRecord });
    }

    if (existing && !existing.checkOut) {
      // Perform Check-out
      const diffMs = now - new Date(existing.checkIn);
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      const status = totalHours < 4 ? 'HALF_DAY' : 'PRESENT';

      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: now,
          totalHours,
          status
        }
      });
      return res.json({ message: 'Checked out successfully!', action: 'CHECK_OUT', record: updated });
    }

    res.status(400).json({ message: 'Already checked out for today', record: existing });
  } catch (error) {
    res.status(500).json({ message: 'Attendance toggle failed', error: error.message });
  }
});

export default router;
