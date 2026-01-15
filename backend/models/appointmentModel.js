import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  appointmentToken: { type: String, required: true, unique: true },
  tokenSeq: { type: Number }, // sequence number for that doc+slotDate
  appointmentStatus: {
    type: String,
    enum: [
      "no_show", // on booking
      "checked_in", // on verification
      "in_consultation", // 
      "completed", // on completed
      "cancelled_by_user", // 
      "cancelled_by_doctor", //
    ],
    default: "no_show",
  },
  appointmentPriority: {
    type: String,
    enum: ["normal", "high", "urgent", "emergency"],
    default: "normal",
  },
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  patientDetails: {
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    mobile: { type: String, required: true },
    bloodGroup: { type: String },
    symptoms: { type: String },
    mode: { type: String, enum: ["online", "in-person"], required: true },
    emergencyName: { type: String },
    emergencyContact: { type: String },
  },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  isReviewed: { type: Boolean, default: false },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  rescheduled: { type: Boolean, default: false },
  rescheduleHistory: [
    {
      fromDate: String,
      fromTime: String,
      toDate: String,
      toTime: String,
      by: String, // doctorId
      at: Date,
    },
  ],
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
