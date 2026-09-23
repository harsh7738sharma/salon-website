require('dotenv').config();
const { connectToDatabase, User, Booking } = require('../lib/db');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.body && req.body.token);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const db = await connectToDatabase();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database connection failed.' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.method === 'GET') {
      // Fetch user's bookings / payment history by email
      const userBookings = await Booking.find({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          picture: user.picture || '',
          provider: user.provider || 'email',
          role: user.role
        },
        bookings: userBookings
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const { name, phone, address, picture } = req.body || {};

      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (address !== undefined) user.address = address.trim();
      if (picture !== undefined) user.picture = picture.trim();

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          picture: user.picture,
          provider: user.provider,
          role: user.role
        }
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed.' });

  } catch (error) {
    console.error('User Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
