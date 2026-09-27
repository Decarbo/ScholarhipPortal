const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('aadharNumber').trim().notEmpty().withMessage('Aadhar number is required'),
  body('stCertificateNumber').trim().notEmpty().withMessage('ST certificate number is required'),
  body('tribeName').trim().notEmpty().withMessage('Tribe name is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('familyIncome').isNumeric().withMessage('Family income must be a number'),
  body('bankAccountNumber').trim().notEmpty().withMessage('Bank account number is required'),
  body('bankName').trim().notEmpty().withMessage('Bank name is required'),
  body('ifscCode').trim().notEmpty().withMessage('IFSC code is required'),
  body('courseName').trim().notEmpty().withMessage('Course name is required'),
  body('courseLevel').trim().notEmpty().withMessage('Course level is required'),
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('yearOfStudy').isNumeric().withMessage('Year of study must be a number'),
  body('guardianName').trim().notEmpty().withMessage('Guardian name is required'),
  body('guardianRelation').trim().notEmpty().withMessage('Guardian relation is required'),
  body('guardianPhone').trim().notEmpty().withMessage('Guardian phone is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, ...studentData } = req.body;

    // Check if user already exists
    const existingUser = await User.findById(studentData.id || `STU${Date.now()}`);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create student ID if not provided
    const studentId = studentData.id || `STU${Date.now()}`;

    // Create student
    const student = new Student({
      _id: studentId,
      ...studentData,
      email,
      documentVault: [],
      bankVerified: false,
      enrolmentConfirmed: false,
      preferredLanguage: studentData.preferredLanguage || 'en',
      voiceInputEnabled: studentData.voiceInputEnabled || false,
      guardianEmail: studentData.guardianEmail || ''
    });

    await student.save();

    // Create user account
    const user = new User({
      _id: studentId,
      email,
      password,
      role: 'student'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: student.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get additional info based on role
    let userInfo = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'student') {
      const student = await Student.findById(user._id);
      if (student) {
        userInfo.name = student.name;
      }
    } else if (user.role === 'admin') {
      userInfo.adminRole = user.adminRole;
    }

    res.json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userInfo = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'student') {
      const student = await Student.findById(user._id);
      if (student) {
        userInfo.name = student.name;
        userInfo.studentData = student;
      }
    } else if (user.role === 'admin') {
      userInfo.adminRole = user.adminRole;
    }

    res.json(userInfo);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
