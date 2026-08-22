import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get Payroll Records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'ADMIN') {
      where.employeeId = req.user.id;
    }

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true, department: true, position: true }
        }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payroll records', error: error.message });
  }
});

// Admin Create or Update Payroll Slip
router.post('/generate', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { employeeId, month, year, allowances = 0, deductions = 0 } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: 'Employee ID, month, and year are required' });
    }

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const baseSalary = employee.baseSalary;
    const netSalary = baseSalary + parseFloat(allowances) - parseFloat(deductions);

    const existing = await prisma.payroll.findFirst({
      where: { employeeId, month, year: parseInt(year) }
    });

    let payroll;
    if (existing) {
      payroll = await prisma.payroll.update({
        where: { id: existing.id },
        data: {
          baseSalary,
          allowances: parseFloat(allowances),
          deductions: parseFloat(deductions),
          netSalary,
          status: 'PAID'
        }
      });
    } else {
      payroll = await prisma.payroll.create({
        data: {
          employeeId,
          month,
          year: parseInt(year),
          baseSalary,
          allowances: parseFloat(allowances),
          deductions: parseFloat(deductions),
          netSalary,
          status: 'PAID'
        }
      });
    }

    res.json({ message: 'Payroll generated successfully', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate payroll', error: error.message });
  }
});

export default router;
