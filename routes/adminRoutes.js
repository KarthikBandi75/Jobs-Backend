import express from 'express';
import {
  adminLogin,
  getAllUsers,
  deleteEmployer,
  deleteJobSeeker,
  manageJob,
  flagJob,
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';


const router = express.Router();

router.post('/login', adminLogin);
router.get('/users', adminAuth, getAllUsers);
router.delete('/employer/:id', adminAuth, deleteEmployer);
router.delete('/jobseeker/:id', adminAuth, deleteJobSeeker);
router.route('/job/:id').put(adminAuth, manageJob).delete(adminAuth, manageJob);
router.post('/job/:id/flag', adminAuth, flagJob);

export default router;