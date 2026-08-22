import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get employee documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.query;
    const isAdmin = req.user.role === 'ADMIN';

    // Build query filter
    const where = {};
    if (!isAdmin) {
      // Force non-admins to only view their own documents
      where.employeeId = req.user.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve documents', error: error.message });
  }
});

// Admin upload document metadata
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { employeeId, title, fileUrl, documentType } = req.body;

    if (!employeeId || !title || !fileUrl) {
      return res.status(400).json({ message: 'Employee ID, title, and file link are required' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!targetUser) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = await prisma.document.create({
      data: {
        employeeId,
        title,
        fileUrl,
        documentType: documentType || 'Other',
        uploadedBy: req.user.name || req.user.email
      }
    });

    // Notify employee of document addition
    const { sendNotification } = await import('../services/notificationService.js');
    await sendNotification({
      employeeId,
      type: 'PROFILE',
      message: `A new document "${title}" (${documentType}) was uploaded by HR/Admin.`
    });

    res.status(201).json({ message: 'Document registered successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record document', error: error.message });
  }
});

// Admin delete document
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await prisma.document.delete({ where: { id } });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

export default router;
