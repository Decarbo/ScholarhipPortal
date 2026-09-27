const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['scrutiny_officer', 'screening_committee', 'nodal_officer', 'super_admin'],
    required: true
  },
  state: { type: String, required: true },
  department: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
