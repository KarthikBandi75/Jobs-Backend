import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.json({ success: false, message: 'Not authorized, invalid token' });
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error('Error in user auth:', err.message);
    res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

export default userAuth;