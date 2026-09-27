const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const Disbursal = require('../models/Disbursal');

// All routes require authentication and government or admin role
router.use(authMiddleware);
router.use(roleMiddleware(['government', 'admin']));

// @route   GET /api/gov/dashboard-summary
// @desc    Get dashboard summary with aggregation
// @access  Private (Government/Admin)
router.get('/dashboard-summary', async (req, res) => {
  try {
    // Aggregation pipeline for counts by status
    const statusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregation pipeline for counts by state
    const stateCounts = await Application.aggregate([
      {
        $group: {
          _id: '$state',
          total: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] }
          },
          disbursed: {
            $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          state: '$_id',
          applications: '$total',
          selected: 1,
          disbursed: 1,
          _id: 0
        }
      },
      { $sort: { applications: -1 } }
    ]);

    // Total counts
    const totalApplications = await Application.countDocuments();
    const selectedCount = statusCounts.find(s => s._id === 'selected')?.count || 0;
    const rejectedCount = statusCounts.find(s => s._id === 'rejected')?.count || 0;

    // Calculate verified (submitted + under_scrutiny + screening)
    const verifiedCount = statusCounts
      .filter(s => ['submitted', 'under_scrutiny', 'screening', 'selected'].includes(s._id))
      .reduce((sum, s) => sum + s.count, 0);

    // Calculate pending
    const pendingCount = statusCounts
      .filter(s => ['draft', 'submitted', 'under_scrutiny', 'screening'].includes(s._id))
      .reduce((sum, s) => sum + s.count, 0);

    res.json({
      totalApplications,
      verified: verifiedCount,
      selected: selectedCount,
      disbursed: selectedCount, // Simplified for now
      pending: pendingCount,
      rejected: rejectedCount,
      stateWiseData: stateCounts,
      statusCounts
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gov/scheme-performance
// @desc    Get scheme performance metrics
// @access  Private (Government/Admin)
router.get('/scheme-performance', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    const performance = [];

    for (const scheme of schemes) {
      const totalApps = await Application.countDocuments({ schemeId: scheme._id });
      const selectedApps = await Application.countDocuments({ schemeId: scheme._id, status: 'selected' });
      const rejectedApps = await Application.countDocuments({ schemeId: scheme._id, status: 'rejected' });

      // Calculate utilization percentage
      const utilization = scheme.quota > 0 ? (selectedApps / scheme.quota) * 100 : 0;

      // Calculate drop-off rate
      const dropOffRate = totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0;

      // Calculate average processing time (simplified)
      const avgProcessingDays = 30; // Placeholder - would need date calculations

      performance.push({
        scheme: scheme.name,
        utilization: Math.round(utilization),
        avgProcessingDays,
        dropOffRate: Math.round(dropOffRate),
        totalApplications: totalApps,
        selected: selectedApps,
        rejected: rejectedApps,
        quota: scheme.quota
      });
    }

    res.json(performance);
  } catch (error) {
    console.error('Get scheme performance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gov/budget-overview
// @desc    Get budget overview with aggregation
// @access  Private (Government/Admin)
router.get('/budget-overview', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    const budgetData = [];

    for (const scheme of schemes) {
      // Calculate allocated budget
      const allocated = scheme.quota * scheme.amount;

      // Aggregation to sum disbursed amounts
      const disbursedResult = await Disbursal.aggregate([
        {
          $lookup: {
            from: 'applications',
            localField: 'applicationId',
            foreignField: '_id',
            as: 'application'
          }
        },
        { $unwind: '$application' },
        {
          $match: {
            'application.schemeId': scheme._id,
            status: 'processed'
          }
        },
        {
          $group: {
            _id: null,
            totalDisbursed: { $sum: '$amount' }
          }
        }
      ]);

      const disbursed = disbursedResult[0]?.totalDisbursed || 0;
      const remaining = allocated - disbursed;

      budgetData.push({
        scheme: scheme.name,
        allocated,
        disbursed,
        remaining
      });
    }

    res.json(budgetData);
  } catch (error) {
    console.error('Get budget overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gov/export
// @desc    Export data as CSV
// @access  Private (Government/Admin)
router.get('/export', async (req, res) => {
  try {
    const { type } = req.query;

    let data;
    let filename;

    if (type === 'applications') {
      data = await Application.find().lean();
      filename = 'applications.csv';
    } else if (type === 'disbursals') {
      data = await Disbursal.find().lean();
      filename = 'disbursals.csv';
    } else {
      return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(data);

    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
