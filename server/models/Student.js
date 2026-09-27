const mongoose = require('mongoose');

const vaultDocumentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  category: {
    type: String,
    enum: ['st_certificate', 'income_certificate', 'marksheet', 'bank_passbook', 'aadhaar', 'passport', 'bonafide', 'research_proposal', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['verified', 'pending', 'flagged', 'expired'],
    default: 'pending'
  },
  uploadDate: { type: String, required: true },
  expiryDate: { type: String },
  aiScore: { type: Number, default: 0 },
  usedInApplications: [{ type: String }],
  sampleAvailable: { type: Boolean, default: false }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  stCertificateNumber: { type: String, required: true },
  tribeName: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  familyIncome: { type: Number, required: true },
  bankAccountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  courseName: { type: String, required: true },
  courseLevel: { type: String, required: true },
  institution: { type: String, required: true },
  yearOfStudy: { type: Number, required: true },
  guardianName: { type: String, required: true },
  guardianRelation: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  guardianEmail: { type: String },
  preferredLanguage: { type: String, default: 'en' },
  voiceInputEnabled: { type: Boolean, default: false },
  documentVault: [vaultDocumentSchema],
  bankVerified: { type: Boolean, default: false },
  enrolmentConfirmed: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Student', studentSchema);
