import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
   docId: { type: String },
  title: { type: String, required: true },
   message: {
    patient: { type: String },
    doctor: { type: String },
  },
  link: { type: String }, // optional (e.g. redirect to appointment detail)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel = mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default notificationModel;
