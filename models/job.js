import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployAuth', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String },
    duration: { type: String, required: true },
    lastDateToApply: { type: Date, required: true },
    salary: { type: String, required: true },
    skills: { type: [String], default: [] },
    whoCanApply: { type: String },
    otherRequirements: { type: String },
    perks: { type: [String], default: [] },
    noOfOpenings: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;