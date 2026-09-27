const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: {
    type: String,
    enum: ['verified', 'pending', 'flagged', 'missing'],
    default: 'pending'
  },
  uploadDate: { type: String },
  aiScore: { type: Number, default: 0 },
  aiFeedback: { type: String },
  sampleUrl: { type: String }
}, { _id: false });

const aiFlagSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  type: {
    type: String,
    enum: ['ocr_mismatch', 'missing_field', 'eligibility_concern', 'duplicate_detected', 'blurry_image', 'expired_document'],
    required: true
  },
  message: { type: String, required: true },
  plainLanguageMessage: { type: String, required: true },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  createdAt: { type: String, required: true },
  suggestion: { type: String }
}, { _id: false });

const deficiencyNoticeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  documentId: { type: String, required: true },
  message: { type: String, required: true },
  plainLanguageMessage: { type: String, required: true },
  issuedDate: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  reuploadUrl: { type: String }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: String, required: true },
  changedAt: { type: String, required: true },
  remark: { type: String }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, ref: 'Student' },
  studentName: { type: String, required: true },
  schemeId: { type: String, required: true, ref: 'Scheme' },
  schemeName: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_scrutiny', 'screening', 'selected', 'waitlisted', 'rejected'],
    default: 'draft'
  },
  state: { type: String, required: true },
  category: { type: String, required: true },
  submittedDate: { type: String },
  lastUpdated: { type: String },
  documents: [documentSchema],
  vaultDocumentIds: [{ type: String }],
  aiFlags: [aiFlagSchema],
  deficiencyNotices: [deficiencyNoticeSchema],
  amount: { type: Number, required: true },
  plainReason: { type: String },
  draftProgress: { type: Number, default: 0 },
  draftLastSaved: { type: String },
  enrolmentConfirmed: { type: Boolean, default: false },
  enrolmentDate: { type: String },
  attendancePercentage: { type: Number },
  progressReportUploaded: { type: Boolean, default: false },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Application', applicationSchema);
