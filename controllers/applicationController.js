import Job from '../models/job.js';
import User from '../models/user.js';
import Application from '../models/application.js';
import { sendEmail } from '../config/nodemailer.js';

export const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) {
      return res.json({ success: false, message: 'Job not found or inactive' });
    }

    const existingApplication = await Application.findOne({
      job: req.params.id,
      user: req.user.userId,
    });
    if (existingApplication) {
      return res.json({ success: false, message: 'Already applied to this job' });
    }

    const application = new Application({
      job: req.params.id,
      user: req.user.userId,
      status: 'pending',
    });
    await application.save();

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Error applying to job:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      job: req.params.id,
      user: req.user.userId,
    });
    if (!application) {
      return res.json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    console.error('Error withdrawing application:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.userId })
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          model: 'EmployAuth', // optional if you want to be explicit
          select: 'companyName email',
        },
      });

    res.json({ success: true, applications });
  } catch (err) {
    console.error('Error fetching user applications:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!job) {
      return res.json({ success: false, message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ job: req.params.id }).populate('user', 'name email resumeUrl');
    res.json({ success: true, applications });
  } catch (err) {
    console.error('Error fetching job applications:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      job: { $in: await Job.find({ company: req.user.companyId }).distinct('_id') },
    }).populate('job', 'title')
      .populate('user', 'email');

    if (!application) {
      return res.json({ success: false, message: 'Application not found or unauthorized' });
    }

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      await sendEmail(
        application.user.email,
        'Application Accepted',
        `Congratulations! Your application for ${application.job.title} has been accepted. Next steps: Please complete the assigned task within 5 days. [Task details here].`
      );
    } else if (status === 'rejected') {
      await sendEmail(
        application.user.email,
        'Application Update',
        `Thank you for applying to ${application.job.title}. Unfortunately, we have decided to move forward with other candidates.`
      );
    }

    res.json({ success: true, message: 'Application status updated Email Sent to the user' });
  } catch (err) {
    console.error('Error updating application status:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const allcompanyapplications = async (req, res) => {
  try {
    const companyId = req.usercompanyId;

    const jobs = await Job.find({ company: companyId }).select('_id');

    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job') 
      .populate('user');
      
    return res.json({ success: true, applications });
  } catch (err) {
    console.error('Error fetching company applications:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
