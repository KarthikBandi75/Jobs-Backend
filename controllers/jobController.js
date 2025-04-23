import Application from '../models/application.js';
import Job from '../models/job.js';
import moment from 'moment'; // format date and time 

export const addJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      duration,
      lastDateToApply,
      salary,
      skills,
      whoCanApply,
      otherRequirements,
      perks,
      noOfOpenings,
      isActive,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !duration ||
      !lastDateToApply ||
      !salary ||
      !skills ||
      !perks ||
      !noOfOpenings
    ) {
      return res.json({ success: false, message: 'All required fields must be provided' });
    }

    if (moment(lastDateToApply).isBefore(moment())) {
      return res.json({ success: false, message: 'Last date to apply must be in the future' });
    }

    const job = new Job({
      company: req.user.companyId,
      title,
      description,
      location,
      duration,
      lastDateToApply,
      salary,
      skills,
      whoCanApply,
      otherRequirements,
      perks,
      noOfOpenings,
      isActive: isActive !== undefined ? isActive : true,
    });

    await job.save();
    res.json({ success: true, message: 'Job added successfully', job });
  } catch (err) {
    console.error('Error adding job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!job) {
      return res.json({ success: false, message: 'Job not found or unauthorized' });
    }

    const updates = req.body;
    if (updates.lastDateToApply && moment(updates.lastDateToApply).isBefore(moment())) {
      return res.json({ success: false, message: 'Last date to apply must be in the future' });
    }

    Object.assign(job, updates);
    await job.save();
    res.json({ success: true, message: 'Job updated', job });
  } catch (err) {
    console.error('Error updating job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, company: req.user.companyId });
    if (!job) {
      return res.json({ success: false, message: 'Job not found or unauthorized' });
    }
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    console.error('Error deleting job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'companyName email'); 
    if (!job) {
      return res.json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (err) {
    console.error('Error fetching job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllJobsOfThatCompany = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user.companyId });
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Error fetching company jobs:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', 'companyName email');
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Error fetching all jobs:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};