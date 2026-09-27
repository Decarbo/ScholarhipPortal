const mongoose = require('mongoose');

const cscCenterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String, required: true },
  available: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CSCCenter', cscCenterSchema);
