import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all employees (Admin / HR view)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        avatarUrl: true,
        phone: true,
        address: true,
        joinDate: true,
        baseSalary: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
});

// Get single employee details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Non-admin can only view their own profile
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        attendances: { take: 10, orderBy: { date: 'desc' } },
        leaveRequests: { take: 10, orderBy: { createdAt: 'desc' } },
        payrolls: { take: 12, orderBy: { year: 'desc' } },
        documents: true
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employee details', error: error.message });
  }
});

// Edit profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, avatarUrl, department, position, baseSalary, name } = req.body;

    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Unauthorized to edit this profile' });
    }

    // Build payload according to role permissions
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Admin-only editable fields
    if (isAdmin) {
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (position !== undefined) updateData.position = position;
      if (baseSalary !== undefined) updateData.baseSalary = parseFloat(baseSalary);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        avatarUrl: true,
        phone: true,
        address: true,
        baseSalary: true
      }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
