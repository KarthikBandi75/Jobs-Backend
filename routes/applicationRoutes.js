import express from 'express';
import {
  withdrawApplication,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  applyJob,
  allcompanyapplications,
} from '../controllers/applicationController.js';
import userAuth from '../middleware/userAuth.js';
import companyAuth from '../middleware/companyAuth.js';



const router = express.Router();

router.post('/apply/:id',userAuth, applyJob);
router.delete('/withdraw/:id', userAuth, withdrawApplication);
router.get('/user', userAuth, getUserApplications);
router.get('/job/:id', companyAuth, getJobApplications);
router.get('/company',companyAuth,allcompanyapplications)
router.put('/status/:id', companyAuth, updateApplicationStatus);

export default router;