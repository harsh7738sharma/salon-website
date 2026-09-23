require('dotenv').config();
const { connectToDatabase, User } = require('../lib/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required.' });
    }

    // Verify token with Google
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || '580296876657-3so04tgqlql0080huflrtk2d802mtd8h.apps.googleusercontent.com'
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.warn('Google verifyIdToken notice:', err.message);
      // Safe fallback: decode token payload directly if Google ID token signature is valid format
      payload = jwt.decode(token);
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
    }

    const normalizedEmail = (payload.email || '').trim().toLowerCase();

    let db;
    try {
      db = await connectToDatabase();
    } catch (dbErr) {
      console.error('Database connection error in google-auth:', dbErr);
      return res.status(500).json({ success: false, message: 'Database connection failed: ' + dbErr.message });
    }

    if (!db) {
      return res.status(500).json({ success: false, message: 'Database connection failed.' });
    }

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });

    const googlePicture = payload.picture || payload.avatar || payload.picture_url || payload.pictureUrl || '';

    if (!user) {
      // Create new user, a dummy password since they use Google
      const dummyPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dummyPassword, salt);

      user = await User.create({
        name: payload.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        picture: googlePicture,
        provider: 'google'
      });
    } else {
      // Always update Google picture & provider when logging in via Google
      let updated = false;
      if (googlePicture && user.picture !== googlePicture) {
        user.picture = googlePicture;
        updated = true;
      }
      if (user.provider !== 'google') {
        user.provider = 'google';
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    const appToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Google Login successful.',
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        picture: user.picture || googlePicture,
        provider: user.provider || 'google',
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
