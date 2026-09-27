const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Scheme = require('../models/Scheme');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');
const Disbursal = require('../models/Disbursal');
const Notification = require('../models/Notification');

// ============ ADVANCED FILE UPLOAD CONFIGURATION ============
const fs = require('fs');
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

// Document category detection from filename keywords
const detectCategory = (filename) => {
  const f = filename.toLowerCase();
  if (f.includes('st-cert') || f.includes('scert') || f.includes('tribal') || f.includes('caste')) return 'st_certificate';
  if (f.includes('income')) return 'income_certificate';
  if (f.includes('marksheet') || f.includes('marks') || f.includes('grade') || f.includes('degree')) return 'marksheet';
  if (f.includes('bank') || f.includes('passbook')) return 'bank_passbook';
  if (f.includes('aadhar') || f.includes('aadhaar') || f.includes('uidai')) return 'aadhaar';
  if (f.includes('passport')) return 'passport';
  if (f.includes('bonafide') || f.includes('bona-fide')) return 'bonafide';
  if (f.includes('proposal') || f.includes('research') || f.includes('synopsis')) return 'research_proposal';
  return 'other';
};

// Simulated AI/OCR verification score based on file properties
const computeAiScore = (file) => {
  let score = 62;
  if (/\.pdf$/i.test(file.originalname)) score += 18; else score += 12;
  if (file.size > 20 * 1024) score += 10;
  if (file.size <= 3 * 1024 * 1024) score += 8;
  score += Math.floor(Math.random() * 6);
  return Math.min(score, 99);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Per-student, date-partitioned folders: uploads/<userId>/2026-09/
    const sub = path.join(req.user ? String(req.user.id) : 'temp', new Date().toISOString().slice(0, 7));
    const dest = path.join(UPLOADS_ROOT, sub);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
    cb(null, `${unique}-${safe}`);
  }
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const extOk = /\.(jpe?g|png|webp|pdf)$/i.test(file.originalname);
    if (ALLOWED_MIME.includes(file.mimetype) && extOk) return cb(null, true);
    cb(new Error(`Unsupported file "${file.originalname}". Only JPG, PNG, WEBP and PDF are allowed.`));
  }
});

// Multer error normalizer (file too large, unexpected field, bad type...)
const handleUpload = (middleware, maxFiles = 10) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const maxMb = ((parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024) / (1024 * 1024)).toFixed(1);
      const messages = {
        LIMIT_FILE_SIZE: `File too large. Maximum size is ${maxMb} MB.`,
        LIMIT_UNEXPECTED_FILE: `Too many files or wrong field name. Send files under the expected field (max ${maxFiles}).`,
        LIMIT_FILE_COUNT: `You can upload at most ${maxFiles} files at once.`
      };
      return res.status(400).json({ message: messages[err.code] || err.message, code: err.code });
    }
    return res.status(400).json({ message: err.message });
  });
};

// Build a vault document record from an uploaded multer file
const buildVaultDoc = (file) => ({
  _id: `VDOC${Date.now()}${Math.floor(Math.random() * 1000)}`,
  name: file.originalname,
  type: file.mimetype,
  category: detectCategory(file.originalname),
  status: 'pending',
  uploadDate: new Date().toISOString().split('T')[0],
  aiScore: computeAiScore(file),
  usedInApplications: [],
  sampleAvailable: false,
  fileName: file.filename,
  filePath: '/uploads/' + path.relative(UPLOADS_ROOT, path.join(file.destination, file.filename)).split(path.sep).join('/'),
  sizeBytes: file.size
});

// All routes require authentication and student role
router.use(authMiddleware);
router.use(roleMiddleware(['student']));

// @route   GET /api/student/schemes
// @desc    Get all available schemes
// @access  Private (Student)
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    console.error('Get schemes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/schemes/:id
// @desc    Get scheme by ID
// @access  Private (Student)
router.get('/schemes/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    console.error('Get scheme error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/me
// @desc    Get current student profile
// @access  Private (Student)
router.get('/me', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/me
// @desc    Update student profile
// @access  Private (Student)
router.put('/me', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'phone', 'guardianName', 'guardianRelation', 'guardianPhone', 
      'guardianEmail', 'preferredLanguage', 'voiceInputEnabled'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();
    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/student/applications
// @desc    Create new application
// @access  Private (Student)
router.post('/applications', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const scheme = await Scheme.findById(req.body.schemeId);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const applicationId = `APP${Date.now()}`;

    // Resolve requested vault document IDs against the student's vault.
    // Matching vault docs are copied into the application's document list
    // (keeping their verified status / AI score) and referenced by ID.
    // Load the student fresh so vault docs added via upload are visible
    // (avoids stale in-memory documents with memory-server / autoSave setups).
    const freshStudent = await Student.findById(student._id);
    const vaultOwner = freshStudent || student;

    const requestedVaultIds = Array.isArray(req.body.vaultDocumentIds) ? req.body.vaultDocumentIds.map(String) : [];
    const matchedVaultDocs = (vaultOwner.documentVault || []).filter(d => requestedVaultIds.includes(String(d._id)));
    const vaultAsAppDocs = matchedVaultDocs.map((d, i) => ({
      _id: `VREF${Date.now()}${i}`,
      name: d.name,
      type: d.type,
      status: d.status || 'verified',
      uploadDate: d.uploadDate || new Date().toISOString().split('T')[0],
      aiScore: d.aiScore || 0,
      aiFeedback: 'Reused from Document Vault',
      sampleUrl: ''
    }));
    const bodyDocs = Array.isArray(req.body.documents) ? req.body.documents : [];

    const application = new Application({
      _id: applicationId,
      studentId: student._id,
      studentName: student.name,
      schemeId: scheme._id,
      schemeName: scheme.name,
      status: 'draft',
      state: student.state,
      category: 'General ST',
      amount: scheme.amount,
      documents: [...bodyDocs, ...vaultAsAppDocs],
      vaultDocumentIds: matchedVaultDocs.map(d => String(d._id)),
      aiFlags: [],
      deficiencyNotices: [],
      draftProgress: req.body.draftProgress || 0,
      enrolmentConfirmed: false,
      statusHistory: [{
        status: 'draft',
        changedBy: student._id,
        changedAt: new Date().toISOString(),
        remark: 'Application created'
      }]
    });

    await application.save();

    // Update scheme active applications count
    scheme.activeApplications += 1;
    await scheme.save();

    res.status(201).json(application);
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/applications/:id/draft
// @desc    Auto-save application draft
// @access  Private (Student)
router.put('/applications/:id/draft', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update draft fields
    if (req.body.documents) application.documents = req.body.documents;
    if (req.body.vaultDocumentIds) application.vaultDocumentIds = req.body.vaultDocumentIds;
    if (req.body.draftProgress) application.draftProgress = req.body.draftProgress;
    application.draftLastSaved = new Date().toISOString();

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/applications/my
// @desc    Get all applications for current student
// @access  Private (Student)
router.get('/applications/my', async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/applications/:id
// @desc    Get application by ID
// @access  Private (Student)
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/applications/:id/documents
// @desc    Upload documents for application
// @access  Private (Student)
router.put('/applications/:id/documents', handleUpload(upload.array('documents', 10), 10), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Process uploaded files
    const newDocuments = req.files.map((file, index) => ({
      _id: `DOC${Date.now()}${index}`,
      name: file.originalname,
      type: file.mimetype,
      status: 'pending', // TODO: Integrate AI/OCR verification here
      uploadDate: new Date().toISOString().split('T')[0],
      aiScore: 0,
      aiFeedback: '',
      sampleUrl: ''
    }));

    application.documents.push(...newDocuments);
    application.lastUpdated = new Date().toISOString();

    // Auto-resolve matching deficiency notices
    if (application.deficiencyNotices) {
      application.deficiencyNotices.forEach(notice => {
        if (!notice.resolved) {
          const matchingDoc = newDocuments.find(doc => 
            doc.name.toLowerCase().includes(notice.documentId.toLowerCase())
          );
          if (matchingDoc) {
            notice.resolved = true;
          }
        }
      });
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/student/grievances
// @desc    Create new grievance
// @access  Private (Student)
router.post('/grievances', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const grievanceId = `GRV${Date.now()}`;

    const grievance = new Grievance({
      _id: grievanceId,
      studentId: student._id,
      studentName: student.name,
      subject: req.body.subject,
      description: req.body.description,
      status: 'open',
      priority: req.body.priority || 'medium',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      needsAssistance: req.body.needsAssistance || false,
      assistanceType: req.body.assistanceType || ''
    });

    await grievance.save();
    res.status(201).json(grievance);
  } catch (error) {
    console.error('Create grievance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/grievances/my
// @desc    Get all grievances for current student
// @access  Private (Student)
router.get('/grievances/my', async (req, res) => {
  try {
    const grievances = await Grievance.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(grievances);
  } catch (error) {
    console.error('Get grievances error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/notifications/my
// @desc    Get all notifications for current student
// @access  Private (Student)
router.get('/notifications/my', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Student)
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============ DOCUMENT VAULT ============

// @route   POST /api/student/vault/upload
// @desc    Upload documents into the student's personal Document Vault (multipart, field "files")
// @access  Private (Student)
router.post('/vault/upload', handleUpload(upload.array('files', 10), 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files received. Send multipart form-data with field name "files".' });
    }
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const docs = req.files.map(buildVaultDoc);
    student.documentVault.push(...docs);
    await student.save();
    res.status(201).json({ message: `${docs.length} document(s) uploaded to vault`, documents: docs });
  } catch (error) {
    console.error('Vault upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/student/vault
// @desc    List all documents in the student's vault
// @access  Private (Student)
router.get('/vault', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student.documentVault);
  } catch (error) {
    console.error('Get vault error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/vault/:docId/verify
// @desc    Simulate AI/OCR verification of a vault document
// @access  Private (Student)
router.put('/vault/:docId/verify', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const doc = student.documentVault.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found in vault' });
    doc.status = 'verified';
    doc.aiScore = Math.max(doc.aiScore, 90);
    await student.save();
    res.json(doc);
  } catch (error) {
    console.error('Verify vault doc error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/student/vault/:docId
// @desc    Delete a document from the vault (and its file from disk)
// @access  Private (Student)
router.delete('/vault/:docId', async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const doc = student.documentVault.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found in vault' });

    // Remove physical file if present
    if (doc.filePath) {
      const abs = path.join(__dirname, '..', doc.filePath.replace(/^\//, ''));
      fs.existsSync(abs) && fs.unlinkSync(abs);
    }
    doc.deleteOne();
    await student.save();
    res.json({ message: 'Document removed from vault' });
  } catch (error) {
    console.error('Delete vault doc error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ APPLICATION SUBMISSION ============

// @route   PUT /api/student/applications/:id/submit
// @desc    Finalize & submit an application (validates documents are attached)
// @access  Private (Student)
router.put('/applications/:id/submit', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.studentId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const totalDocs = (application.documents?.length || 0) + (application.vaultDocumentIds?.length || 0);
    if (totalDocs === 0) {
      return res.status(400).json({ message: 'Please attach at least one document before submitting.' });
    }

    const now = new Date().toISOString();
    application.status = 'submitted';
    application.submittedDate = now.split('T')[0];
    application.lastUpdated = now;
    application.draftProgress = 100;
    application.statusHistory = application.statusHistory || [];
    application.statusHistory.push({
      status: 'submitted',
      changedBy: req.user.id,
      changedAt: now,
      remark: 'Application submitted by student'
    });

    // Mark vault documents as used in this application
    if (application.vaultDocumentIds?.length) {
      const student = await Student.findById(req.user.id);
      if (student) {
        application.vaultDocumentIds.forEach(vid => {
          const vdoc = student.documentVault.id(vid);
          if (vdoc && !vdoc.usedInApplications.includes(application._id)) {
            vdoc.usedInApplications.push(application._id);
          }
        });
        await student.save();
      }
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ============ DISBURSALS, ENROLMENT & ATTENDANCE ============

// @route   GET /api/student/disbursals/my
// @desc    Get disbursals for the current student's applications
// @access  Private (Student)
router.get('/disbursals/my', async (req, res) => {
  try {
    const apps = await Application.find({ studentId: req.user.id }).select('_id');
    const ids = apps.map(a => String(a._id));
    const disbursals = await Disbursal.find({ applicationId: { $in: ids } }).sort({ createdAt: -1 });
    res.json(disbursals);
  } catch (error) {
    console.error('Get disbursals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/applications/:id/enrolment
// @desc    Confirm enrolment for a selected application
// @access  Private (Student)
router.put('/applications/:id/enrolment', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.studentId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.enrolmentConfirmed = true;
    application.enrolmentDate = new Date().toISOString().split('T')[0];
    application.lastUpdated = new Date().toISOString();
    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Confirm enrolment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/student/applications/:id/attendance
// @desc    Upload attendance percentage (for renewals)
// @access  Private (Student)
router.put('/applications/:id/attendance', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.studentId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const pct = Number(req.body.percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ message: 'percentage must be a number between 0 and 100' });
    }
    application.attendancePercentage = pct;
    application.lastUpdated = new Date().toISOString();
    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Upload attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
