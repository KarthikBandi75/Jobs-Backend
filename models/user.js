import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    otp: { type: String },
    otpExpires: { type: Date },
    image: { type: String, default: 'https://assets.leetcode.com/users/default_avatar.jpg' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Not Selected'], default: 'Not Selected' },
    dob: { type: String, default: 'Not Selected' },
    phone: { type: String, default: '0000000000' },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
    },
    branch: { type: String, default: 'CSE' },
    semester: { type: String, default: '1' },
    resumeUrl: { type: String, default: '' },
    skills: [
      {
        skillname: { type: String, required: true },
        proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [String],
        link: { type: String, default: '' },
      },
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuingorganization: { type: String, required: true },
        issuedate: { type: Date, required: true },
        expirationDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String },
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
        proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'], required: true },
      },
    ],
    headline:{type:String}
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;