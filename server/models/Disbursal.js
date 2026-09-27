const mongoose = require('mongoose');

const disbursalSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  applicationId: { type: String, required: true, ref: 'Application' },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['processed', 'pending', 'failed'],
    default: 'pending'
  },
  transactionId: { type: String, required: true },
  date: { type: String, required: true },
  bankReference: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Disbursal', disbursalSchema);
