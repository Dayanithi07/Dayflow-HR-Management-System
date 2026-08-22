import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ATTENDANCE_THRESHOLDS } from '../config/attendanceRules.js';

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

// Get weekly attendance view for current week (Monday to Friday)
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const targetEmployeeId = req.user.role === 'ADMIN' && req.query.employeeId
      ? req.query.employeeId
      : req.user.id;

    // Calculate Monday and Friday of current week
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(today.setDate(diffToMonday));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const formatStr = (d) => d.toISOString().split('T')[0];
    const mondayStr = formatStr(monday);
    const fridayStr = formatStr(friday);

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: targetEmployeeId,
        date: {
          gte: mondayStr,
          lte: fridayStr
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weekly attendance', error: error.message });
  }
});

// Admin Report Generator (Filtered by Employee & Date Range)
router.get('/report', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const where = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
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
    res.status(500).json({ message: 'Failed to compile report data', error: error.message });
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

      // Configurable Business Threshold Checks
      let status = 'ABSENT';
      if (totalHours >= ATTENDANCE_THRESHOLDS.FULL_DAY_HOURS) {
        status = 'PRESENT';
      } else if (totalHours >= ATTENDANCE_THRESHOLDS.HALF_DAY_HOURS) {
        status = 'HALF_DAY';
      }

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
