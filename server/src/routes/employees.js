import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create Employee (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { firstName, email, phone, loginId, tempPassword, companyName } = req.body;

    if (!firstName || !email || !loginId || !tempPassword) {
      return res.status(400).json({ message: 'First name, email, login ID, and temp password are required' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { employeeId: loginId }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or employee ID already exists' });
    }

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        employeeId: loginId,
        email,
        passwordHash,
        name: firstName,
        role: 'EMPLOYEE',
        phone: phone || null,
        department: 'Engineering',
        position: 'Software Developer'
      }
    });

    res.status(201).json({
      message: 'Employee account created successfully',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
});

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
    const {
      phone, address, avatarUrl, name, department, position, baseSalary,
      dob, nationality, personalEmail, gender, maritalStatus,
      bankAccountNo, bankName, ifscCode, panNo, uanNo
    } = req.body;

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
      
      // Personal & Bank Info
      if (dob !== undefined) updateData.dob = dob;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (personalEmail !== undefined) updateData.personalEmail = personalEmail;
      if (gender !== undefined) updateData.gender = gender;
      if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
      if (bankAccountNo !== undefined) updateData.bankAccountNo = bankAccountNo;
      if (bankName !== undefined) updateData.bankName = bankName;
      if (ifscCode !== undefined) updateData.ifscCode = ifscCode;
      if (panNo !== undefined) updateData.panNo = panNo;
      if (uanNo !== undefined) updateData.uanNo = uanNo;
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
        baseSalary: true,
        dob: true,
        nationality: true,
        personalEmail: true,
        gender: true,
        maritalStatus: true,
        bankAccountNo: true,
        bankName: true,
        ifscCode: true,
        panNo: true,
        uanNo: true
      }
    });

    const { sendNotification } = await import('../services/notificationService.js');
    await sendNotification({
      employeeId: id,
      type: 'PROFILE',
      message: isAdmin && !isSelf 
        ? 'Your profile was updated by the HR/Admin' 
        : 'Profile details were successfully updated'
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
