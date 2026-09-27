const mongoose = require('mongoose');

const auditEntrySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  adminId: { type: String, required: true, ref: 'AdminUser' },
  adminName: { type: String, required: true },
  action: { type: String, required: true },
  applicationId: { type: String, required: true, ref: 'Application' },
  studentName: { type: String, required: true },
  timestamp: { type: String, required: true },
  details: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditEntry', auditEntrySchema);
