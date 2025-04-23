import CompanyProfile from '../models/companyProfile.js';
import EmployAuth from '../models/employAuth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { uploadToCloudinary } from '../middleware/upload.js';


dotenv.config();

export const signUp = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    if (!companyName || !email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const existingCompany = await EmployAuth.findOne({ email });
    if (existingCompany) {
      return res.json({ success: false, message: 'Company already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newCompany = new EmployAuth({ companyName, email, password: hashPassword });
    await newCompany.save();

    const token = jwt.sign({ companyId: newCompany._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const data=new CompanyProfile({employer:newCompany._id});
    await data.save();

    return res.json({ success: true, message: 'SignUp successful', token });
  } catch (err) {
    console.error('Error during signup:', err.message);
    return res.json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    const company = await EmployAuth.findOne({ email });
    if (!company) {
      return res.json({ success: false, message: 'Company not found' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    const token = jwt.sign({ companyId: company._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
   
    return res.json({ success: true, message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ employer: req.user.companyId }).populate('employer', 'companyName email');
    if (!profile) {
      return res.json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, message: 'Profile fetched successfully', profile });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { description, website, location, numberOfEmployees, achievements, awards } = req.body;
    let companyLogo = null;
 
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      companyLogo = uploadResult.secure_url;
    }

    const profile = await CompanyProfile.findOneAndUpdate(
      { employer: req.user.companyId },
      {
        description,
        website,
        location,
        numberOfEmployees,
        achievements,
        awards,
        ...(companyLogo && { companyLogo }),
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};