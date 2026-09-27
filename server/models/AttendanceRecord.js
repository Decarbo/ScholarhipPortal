const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  applicationId: { type: String, required: true, ref: 'Application' },
  studentId: { type: String, required: true, ref: 'Student' },
  year: { type: String, required: true },
  percentage: { type: Number, required: true },
  uploadedDate: { type: String, required: true },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
