import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendEmail } from '../config/nodemailer.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import Job from '../models/job.js';
import Application from '../models/application.js';
import CompanyProfile from '../models/companyProfile.js';

dotenv.config();

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashPassword });
    await user.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(email, 'Your OTP for Job Board', `Your OTP is ${otp}. It expires in 10 minutes.`);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error during signup:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, message: 'Login successful', token });
  } catch (err) {
    console.error('Error verifying OTP:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    await sendEmail(email, 'Your OTP for Job Board', `Your OTP is ${otp}. It expires in 10 minutes.`);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'Profile fetched successfully', user });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  
  try {
    const {
      name,
      gender,
      dob,
      phone,
      address,
      branch,
      semester,
      skills,
      achievements,
      projects,
      certifications,
      languages,
      headline
    } = req.body;

    
    // Parse array fields
    const parseArrayField = (field) => {
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(field) ? field : [];
    };

    let resumeUrl = null;
    if (req.file) {
      
      if (req.file.mimetype !== 'application/pdf') {
        return res.json({
          success: false,
          message: 'Only PDF files are allowed for resume uploads.',
        });
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      resumeUrl = uploadResult.secure_url;
    }

    const updates = {
      name,
      gender,
      dob,
      phone,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      branch,
      semester,
      skills: parseArrayField(skills),
      achievements: parseArrayField(achievements),
      projects: parseArrayField(projects),
      certifications: parseArrayField(certifications),
      languages: parseArrayField(languages),
      ...(resumeUrl && { resumeUrl }),
      headline
    };

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password -otp -otpExpires');

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'companyName email');
    if (!job) {
      return res.json({ success: false, message: 'Job not found' });
    }
    const response=await CompanyProfile.findOne({employer:job.company._id}).select('companyLogo');
    const existingApplication = await Application.findOne({
      job: req.params.id,
      user: req.user.userId, 
    });

    const hasApplied = !!existingApplication;

    res.json({ success: true, job, hasApplied ,response});
  } catch (err) {
    console.error('Error fetching job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
