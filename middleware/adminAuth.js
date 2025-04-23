import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    if (!decoded) {
      return res.json({ success: false, message: 'Not authorized, invalid token' });
    }

    req.user = { email: decoded.email };
   
    next();
  } catch (err) {
    console.error('Error in admin auth:', err.message);
    res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

export default adminAuth;