require('dotenv').config();
const { connectToDatabase, Booking } = require('../lib/db');
const { sendBookingEmails } = require('../lib/mail');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    const { name, phone, email, address, service, stylist, date } = req.body || {};

    if (!name || !phone || !address || !service || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, address, service, and date are required.'
      });
    }

    const bookingData = {
      customerName: name,
      phone,
      email: email || '',
      service,
      stylist: stylist || 'Any Available Stylist',
      date,
      time: 'Home Visit',
      notes: `Home Address: ${address}`,
      type: 'home_service',
      status: 'pending',
      createdAt: new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    };

    let savedBooking = null;

    try {
      const db = await connectToDatabase();
      if (db) {
        savedBooking = await Booking.create(bookingData);
        console.log('✅ Home service booking saved to MongoDB with ID:', savedBooking._id);
      }
    } catch (dbErr) {
      console.error('⚠️ DB Error:', dbErr.message);
    }

    const mailResult = await sendBookingEmails(bookingData);

    return res.status(200).json({
      success: true,
      message: 'Home service request submitted successfully! We will contact you soon.',
      data: savedBooking || bookingData,
      mailStatus: mailResult
    });

  } catch (error) {
    console.error('❌ Serverless Home Service Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
