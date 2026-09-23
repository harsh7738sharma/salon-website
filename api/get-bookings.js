require('dotenv').config();
const { connectToDatabase, Booking } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return res.status(200).json({
        success: true,
        source: 'fallback',
        data: []
      });
    }

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};
