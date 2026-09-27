const mongoose = require('mongoose');

const eligibilityCheckSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: {
    type: String,
    enum: ['equals', 'greater_than', 'less_than', 'contains', 'in'],
    required: true
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  label: { type: String, required: true }
}, { _id: false });

const sampleDocumentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  tips: [{ type: String }],
  commonMistakes: [{ type: String }]
}, { _id: false });

const schemeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  description: { type: String, required: true },
  eligibility: [{ type: String }],
  eligibilityCheck: [eligibilityCheckSchema],
  requiredDocuments: [{ type: String }],
  amount: { type: Number, required: true },
  duration: { type: String, required: true },
  deadline: { type: String, required: true },
  quota: { type: Number, required: true },
  activeApplications: { type: Number, default: 0 },
  sampleDocuments: [sampleDocumentSchema],
  renewable: { type: Boolean, default: false },
  renewalDeadline: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Scheme', schemeSchema);
