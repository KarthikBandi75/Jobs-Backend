import mongoose from 'mongoose';

const employAuthSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

const EmployAuth = mongoose.model('EmployAuth', employAuthSchema);
export default EmployAuth;