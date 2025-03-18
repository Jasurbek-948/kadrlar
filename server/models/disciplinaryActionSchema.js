const mongoose = require("mongoose");

const disciplinarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  orderDetails: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Disciplinary", disciplinarySchema);