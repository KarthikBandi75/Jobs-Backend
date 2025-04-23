import express from 'express';
import { login, signUp, getCompanyProfile, updateProfile } from '../controllers/employController.js';

import multer from 'multer';
import companyAuth from '../middleware/companyAuth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/profile', companyAuth, getCompanyProfile);
router.put('/profile', companyAuth, upload.single('companyLogo'), updateProfile);

export default router;