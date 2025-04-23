import express from 'express';
import {
  addJob,
  updateJob,
  deleteJob,
  getJob,
  getAllJobsOfThatCompany,
  getAllJobs,
} from '../controllers/jobController.js';
import companyAuth from '../middleware/companyAuth.js';
import userAuth from '../middleware/userAuth.js';


const router = express.Router();

router.get('/company', companyAuth, getAllJobsOfThatCompany);
router.post('/', companyAuth, addJob);
router.put('/:id', companyAuth, updateJob);
router.delete('/:id', companyAuth, deleteJob);
router.get('/:id',companyAuth, getJob);
router.get('/',userAuth, getAllJobs);

export default router;