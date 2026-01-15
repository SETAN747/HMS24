import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    // overall availability switch
    available: { type: Boolean, required: true, default: false },
    // 🆕 doctor availability configuration
    availability: {
      enabled: { type: Boolean, default: true },

      weeklySchedule: {
        monday: [
          {
            start: { type: String }, // "10:00"
            end: { type: String }, // "13:00"
          },
        ],
        tuesday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
        wednesday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
        thursday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
        friday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
        saturday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
        sunday: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
      },

      slotDuration: {
        type: Number,
        default: 15, // minutes
      },
    },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
