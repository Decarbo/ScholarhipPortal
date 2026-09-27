const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true, ref: 'Student' },
  type: {
    type: String,
    enum: ['status_change', 'deadline', 'deficiency', 'disbursal', 'general', 'renewal_reminder', 'sms_alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, required: true },
  smsSent: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
