import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get recent notifications for employee
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { employeeId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.notification.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Verify ownership
    if (record.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update alert state', error: error.message });
  }
});

export default router;
