const express = require('express');
const router = express.Router();

const websiteService = require('../services/websiteService');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/saveAppointment', async (req, res) => {
  try {
    const {
      appointmentDate,
      appointmentTime,
      durationMinutes,
      fullName,
      email,
      phoneNumber,
      location,
      reasonForBooking
    } = req.body;

    if (!appointmentDate || !appointmentTime || !fullName || !phoneNumber || !location) {
      return res.status(400).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message: 'Please complete all required appointment fields.'
      });
    }

    await websiteService.saveAppointment({
      appointmentDate,
      appointmentTime,
      durationMinutes,
      fullName,
      email,
      phoneNumber,
      location,
      reasonForBooking
    });

    return res.status(201).json({
      success: true,
      messageTitle: 'Appointment Submitted',
      message: 'Your appointment request has been received. Please wait for clinic confirmation.'
    });
  } catch (error) {
    if (error.message === 'APPOINTMENT_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message: 'This appointment already exists. Please check your appointment details.'
      });
    }
    console.error('Save appointment error:', error);
    return res.status(500).json({
      success: false,
      messageTitle: 'Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }
});

router.post('/saveInquiry', async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      concern,
      message
    } = req.body;

    if (!fullName || !phoneNumber || !concern || !message) {
      return res.status(400).json({
        success: false,
        messageTitle: 'Inquiry Failed',
        message: 'Please complete all required inquiry fields.'
      });
    }

    await websiteService.saveInquiry({
      fullName,
      phoneNumber,
      concern,
      message
    });

    return res.status(201).json({
      success: true,
      messageTitle: 'Inquiry Submitted',
      message: 'Your inquiry has been received. Please wait for our response.'
    });
  } catch (error) {
    if (error.message === 'INQUIRY_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        messageTitle: 'Inquiry Failed',
        message: 'You already submitted an inquiry with the same details.'
      });
    }
    console.error('Save inquiry error:', error);
    return res.status(500).json({
      success: false,
      messageTitle: 'Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }
});

router.get('/appointments', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const rows = await websiteService.listAppointments({ search, status });
    res.json({ appointments: rows });
  } catch (error) {
    console.error('List online appointments error:', error);
    res.status(500).json({ message: 'Failed to load online appointments.' });
  }
});

router.patch('/appointments/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required.' });
    await websiteService.updateAppointmentStatus(id, status);
    res.json({ message: 'Appointment status updated.' });
  } catch (error) {
    console.error('Update online appointment status error:', error);
    res.status(500).json({ message: 'Failed to update appointment status.' });
  }
});

router.get('/inquiries', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { search = '' } = req.query;
    const rows = await websiteService.listInquiries({ search });
    res.json({ inquiries: rows });
  } catch (error) {
    console.error('List online inquiries error:', error);
    res.status(500).json({ message: 'Failed to load online inquiries.' });
  }
});

module.exports = router;