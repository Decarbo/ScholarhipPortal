const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, ref: 'Student' },
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: { type: String, required: true },
  lastUpdated: { type: String, required: true },
  response: { type: String },
  needsAssistance: { type: Boolean, default: false },
  assistanceType: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Grievance', grievanceSchema);
