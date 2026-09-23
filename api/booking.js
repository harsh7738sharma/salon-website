require('dotenv').config();
const { connectToDatabase, Booking } = require('../lib/db');
const { sendBookingEmails } = require('../lib/mail');

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
    const { customerName, phone, email, service, stylist, date, time, notes, type } = req.body || {};

    if (!customerName || !phone || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerName, phone, service, date, and time are required.'
      });
    }

    const bookingData = {
      customerName,
      phone,
      email: email || '',
      service,
      stylist: stylist || 'Any Available Stylist',
      date,
      time,
      notes: notes || '',
      type: type || 'salon',
      status: 'confirmed',
      createdAt: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    };

    let savedBooking = null;

    // Database Operation
    try {
      const db = await connectToDatabase();
      if (db) {
        savedBooking = await Booking.create(bookingData);
        console.log('✅ Booking saved to MongoDB with ID:', savedBooking._id);
      }
    } catch (dbErr) {
      console.error('⚠️ Database save error:', dbErr.message);
    }

    // Email Dispatch
    const mailResult = await sendBookingEmails(bookingData);

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: savedBooking || bookingData,
      mailStatus: mailResult
    });

  } catch (error) {
    console.error('❌ Serverless Booking Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
