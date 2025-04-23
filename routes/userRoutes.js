import express from 'express';
import { signup, login, verifyOtp, getProfile, updateProfile, getJob } from '../controllers/userController.js';

import multer from 'multer';
import userAuth from '../middleware/userAuth.js';


const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/profile', userAuth, getProfile);
router.put('/profile', userAuth, upload.single('resume'), updateProfile);
router.get('/job/:id',userAuth,getJob);

export default router;