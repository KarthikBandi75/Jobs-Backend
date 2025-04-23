import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const companyAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.companyId) {
      return res.json({ success: false, message: 'Not authorized, invalid token' });
    }

    req.user = { companyId: decoded.companyId };
    next();
  } catch (err) {
    console.error('Error in company auth:', err.message);
    res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

export default companyAuth;