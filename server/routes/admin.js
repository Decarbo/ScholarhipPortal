const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const AuditEntry = require('../models/AuditEntry');
const Notification = require('../models/Notification');
const Disbursal = require('../models/Disbursal');
const Grievance = require('../models/Grievance');
const AdminUser = require('../models/AdminUser');
const Student = require('../models/Student');

// Valid application status transitions (workflow engine)
const STATUS_FLOW = {
  draft: ['submitted'],
  submitted: ['under_scrutiny', 'screening', 'rejected'],
  under_scrutiny: ['screening', 'more_info_required', 'selected', 'rejected'],
  screening: ['selected', 'rejected', 'more_info_required'],
  more_info_required: ['under_scrutiny', 'screening', 'rejected'],
  selected: ['sanctioned'],
  sanctioned: ['disbursal_pending', 'disbursed'],
  disbursal_pending: ['disbursed'],
  disbursed: [],
  rejected: []
};

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'government']));

// @route   GET /api/admin/students
// @desc    List all registered students (for communication targeting)
// @access  Private (Admin)
router.get('/students', async (req, res) => {
  try {
    const { state, search } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }
    const students = await Student.find(filter).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Aggregated stats for the admin dashboard
// @access  Private (Admin)
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [totalStudents, totalApplications, pendingReview, selected, rejected, flagged, disbursedAgg] =
      await Promise.all([
        Student.countDocuments(),
        Application.countDocuments(),
        Application.countDocuments({ status: { $in: ['submitted', 'under_scrutiny', 'screening'] } }),
        Application.countDocuments({ status: { $in: ['selected', 'sanctioned', 'disbursed'] } }),
        Application.countDocuments({ status: 'rejected' }),
        Application.countDocuments({ aiFlags: { $ne: [] } }),
        Disbursal.aggregate([
          { $match: { status: 'processed' } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ])
      ]);

    const byStatus = await Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const openGrievances = await Grievance.countDocuments({ status: { $ne: 'resolved' } });

    res.json({
      totalStudents,
      totalApplications,
      pendingReview,
      selected,
      rejected,
      flagged,
      openGrievances,
      disbursedAmount: disbursedAgg[0] ? disbursedAgg[0].total : 0,
      disbursedCount: disbursedAgg[0] ? disbursedAgg[0].count : 0,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count]))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications with filters + pagination
// @access  Private (Admin)
router.get('/applications', async (req, res) => {
  try {
    const { scheme, state, status, search, page = 1, limit = 200 } = req.query;
    const filter = {};

    if (scheme) filter.schemeId = scheme;
    if (state) filter.state = state;
    if (status) filter.status = { $in: String(status).split(',') };
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { _id: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(filter).sort({ lastUpdated: -1 }).skip(skip).limit(parseInt(limit)),
      Application.countDocuments(filter)
    ]);

    res.json({ applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/applications/:id
// @desc    Get application by ID
// @access  Private (Admin)
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private (Admin)
router.put('/applications/:id/status', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const admin = await AdminUser.findById(req.user.id);
    const { status, remark } = req.body;

    const allowed = STATUS_FLOW[application.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from '${application.status}' to '${status}'`,
        allowedTransitions: allowed
      });
    }

    const oldStatus = application.status;
    application.status = status;
    application.lastUpdated = new Date().toISOString();

    if (remark) {
      application.plainReason = remark;
    }

    // Add to status history
    application.statusHistory.push({
      status,
      changedBy: admin._id,
      changedAt: new Date().toISOString(),
      remark: remark || `Status changed from ${oldStatus} to ${status}`
    });

    await application.save();

    // Create audit entry
    const auditEntry = new AuditEntry({
      _id: `AUD${Date.now()}`,
      adminId: admin._id,
      adminName: admin.name,
      action: status.charAt(0).toUpperCase() + status.slice(1),
      applicationId: application._id,
      studentName: application.studentName,
      timestamp: new Date().toISOString(),
      details: remark || `Status changed to ${status}`
    });
    await auditEntry.save();

    // Create notification for student
    const notification = new Notification({
      _id: `NOT${Date.now()}`,
      userId: application.studentId,
      type: 'status_change',
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${application.schemeName} application has been ${status}. ${remark || ''}`,
      read: false,
      createdAt: new Date().toISOString(),
      smsSent: false,
      emailSent: false
    });
    await notification.save();

    // Auto-create a disbursal record when application enters disbursal_pending
    if (status === 'disbursal_pending') {
      const existing = await Disbursal.findOne({ applicationId: application._id });
      if (!existing) {
        const disbursal = new Disbursal({
          _id: `DIS${Date.now()}`,
          applicationId: application._id,
          studentName: application.studentName,
          amount: application.amount || 0,
          status: 'pending',
          transactionId: `TXN${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          bankReference: `BR${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        });
        await disbursal.save();
      }
    }

    res.json(await Application.findById(application._id));
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/applications/bulk-status
// @desc    Bulk update application status
// @access  Private (Admin)
router.put('/applications/bulk-status', async (req, res) => {
  try {
    const { applicationIds, status, remark } = req.body;
    const admin = await AdminUser.findById(req.user.id);

    const results = [];

    for (const appId of applicationIds) {
      const application = await Application.findById(appId);
      if (!application) continue;
      if (!(STATUS_FLOW[application.status] || []).includes(status)) continue;

      application.status = status;
      application.lastUpdated = new Date().toISOString();

      if (remark) {
        application.plainReason = remark;
      }

      application.statusHistory.push({
        status,
        changedBy: admin._id,
        changedAt: new Date().toISOString(),
        remark: remark || `Bulk status change to ${status}`
      });

      await application.save();

      // Create audit entry
      const auditEntry = new AuditEntry({
        _id: `AUD${Date.now()}${appId}`,
        adminId: admin._id,
        adminName: admin.name,
        action: status.charAt(0).toUpperCase() + status.slice(1),
        applicationId: application._id,
        studentName: application.studentName,
        timestamp: new Date().toISOString(),
        details: remark || `Bulk status change to ${status}`
      });
      await auditEntry.save();

      // Create notification
      const notification = new Notification({
        _id: `NOT${Date.now()}${appId}`,
        userId: application.studentId,
        type: 'status_change',
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your ${application.schemeName} application has been ${status}.`,
        read: false,
        createdAt: new Date().toISOString(),
        smsSent: false,
        emailSent: false
      });
      await notification.save();

      results.push(application);
    }

    res.json({ message: `${results.length} applications updated`, applications: results });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/schemes
// @desc    Get all schemes
// @access  Private (Admin)
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    console.error('Get schemes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/schemes
// @desc    Create new scheme
// @access  Private (Admin)
router.post('/schemes', async (req, res) => {
  try {
    const schemeId = `SCH${Date.now()}`;
    const scheme = new Scheme({
      _id: schemeId,
      ...req.body,
      activeApplications: 0
    });
    await scheme.save();
    res.status(201).json(scheme);
  } catch (error) {
    console.error('Create scheme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/schemes/:id
// @desc    Update scheme
// @access  Private (Admin)
router.put('/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    Object.assign(scheme, req.body);
    await scheme.save();
    res.json(scheme);
  } catch (error) {
    console.error('Update scheme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/merit-list/:schemeId
// @desc    Get merit list for scheme
// @access  Private (Admin)
router.get('/merit-list/:schemeId', async (req, res) => {
  try {
    const { state } = req.query;
    const filter = { schemeId: req.params.schemeId, status: { $in: ['screening', 'under_scrutiny'] } };
    
    if (state) filter.state = state;

    const applications = await Application.find(filter);

    // Calculate average AI score for each application
    const meritList = applications.map(app => {
      const totalScore = app.documents.reduce((sum, doc) => sum + (doc.aiScore || 0), 0);
      const avgScore = app.documents.length > 0 ? totalScore / app.documents.length : 0;
      
      return {
        ...app.toObject(),
        averageAiScore: avgScore
      };
    });

    // Sort by average AI score descending
    meritList.sort((a, b) => b.averageAiScore - a.averageAiScore);

    res.json(meritList);
  } catch (error) {
    console.error('Get merit list error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/communications
// @desc    Send notification to filtered students
// @access  Private (Admin)
router.post('/communications', async (req, res) => {
  try {
    const { studentIds, title, message, type } = req.body;

    const notifications = [];

    for (const studentId of studentIds) {
      const notification = new Notification({
        _id: `NOT${Date.now()}${studentId}`,
        userId: studentId,
        type: type || 'general',
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        smsSent: false,
        emailSent: false
      });
      await notification.save();
      notifications.push(notification);
    }

    res.status(201).json({ message: `${notifications.length} notifications sent`, notifications });
  } catch (error) {
    console.error('Send communication error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/audit-log
// @desc    Get audit log
// @access  Private (Admin)
router.get('/audit-log', async (req, res) => {
  try {
    const { action, search, limit = 200 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (search) {
      filter.$or = [
        { adminName: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }
    const auditLog = await AuditEntry.find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(parseInt(limit) || 200, 1000));
    res.json(auditLog);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/disbursals
// @desc    Get all disbursals
// @access  Private (Admin)
router.get('/disbursals', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = { $in: String(status).split(',') };
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }
    const disbursals = await Disbursal.find(filter)
      .sort({ date: -1 });
    res.json(disbursals);
  } catch (error) {
    console.error('Get disbursals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/disbursals/:id
// @desc    Update disbursal status
// @access  Private (Admin)
router.put('/disbursals/:id', async (req, res) => {
  try {
    const disbursal = await Disbursal.findById(req.params.id);
    if (!disbursal) {
      return res.status(404).json({ message: 'Disbursal not found' });
    }

    const { status } = req.body;
    if (!['processed', 'pending', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid disbursal status' });
    }
    disbursal.status = status;
    await disbursal.save();

    // Notify the student about the payment update
    const app = await Application.findById(disbursal.applicationId);
    if (app) {
      const notification = new Notification({
        _id: `NOT${Date.now()}`,
        userId: app.studentId,
        type: 'disbursal',
        title: `Disbursal ${status}`,
        message: `Your scholarship payment of INR ${disbursal.amount} is now ${status}. Ref: ${disbursal.transactionId}`,
        read: false,
        createdAt: new Date().toISOString(),
        smsSent: false,
        emailSent: false
      });
      await notification.save();

      if (status === 'processed' && ['disbursal_pending', 'sanctioned'].includes(app.status)) {
        app.status = 'disbursed';
        app.lastUpdated = new Date().toISOString();
        app.statusHistory.push({
          status: 'disbursed',
          changedBy: req.user.id,
          changedAt: new Date().toISOString(),
          remark: `Payment processed via ${disbursal.transactionId}`
        });
        await app.save();
      }
    }
    res.json(disbursal);
  } catch (error) {
    console.error('Update disbursal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/grievances
// @desc    Get all grievances
// @access  Private (Admin)
router.get('/grievances', async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = { $in: String(status).split(',') };
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    const grievances = await Grievance.find(filter)
      .sort({ createdAt: -1 });
    res.json(grievances);
  } catch (error) {
    console.error('Get grievances error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/grievances/:id
// @desc    Respond to grievance
// @access  Private (Admin)
router.put('/grievances/:id', async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    grievance.response = req.body.response;
    grievance.status = req.body.status || 'resolved';
    grievance.lastUpdated = new Date().toISOString();

    await grievance.save();
    res.json(grievance);
  } catch (error) {
    console.error('Update grievance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
