import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import EmployAuth from '../models/employAuth.js';
import User from '../models/user.js';
import Job from '../models/job.js';
import CompanyProfile from '../models/companyProfile.js';

dotenv.config();

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    if(email=="jobadmin@gmail.com" && password==="qwerty123")
    {
      const token = jwt.sign({email},process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ success: true, message: 'Admin login successful', token });
    }
    return res.json({success:false,message:"Enter Correct Admin Credentials"});
  } catch (err) {
    console.error('Error during admin login:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const employers = await CompanyProfile.find().populate('employer');
    const jobSeekers = await User.find();
    const alljobs=await Job.find().populate('company');
    res.json({
      success: true,
      employers,
      jobSeekers,
      alljobs
    });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteEmployer = async (req, res) => {
  try {
    const employer = await EmployAuth.findByIdAndDelete(req.params.id);
    if (!employer) {
      return res.json({ success: false, message: 'Employer not found' });
    }
    await CompanyProfile.deleteOne({ employer: req.params.id });
    await Job.deleteMany({ company: req.params.id });
    res.json({ success: true, message: 'Employer and associated data deleted' });
  } catch (err) {
    console.error('Error deleting employer:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteJobSeeker = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Job seeker not found' });
    }
    res.json({ success: true, message: 'Job seeker deleted' });
  } catch (err) {
    console.error('Error deleting job seeker:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const manageJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (req.method === 'PUT') {
      const updates = req.body;
      Object.assign(job, updates);
      await job.save();
      res.json({ success: true, message: 'Job updated', job });
    } else if (req.method === 'DELETE') {
      await job.deleteOne();
      res.json({ success: true, message: 'Job deleted' });
    }
  } catch (err) {
    console.error('Error managing job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const flagJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    job.isFlagged = true;
    await job.save();
    res.json({ success: true, message: 'Job flagged for review' });
  } catch (err) {
    console.error('Error flagging job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};