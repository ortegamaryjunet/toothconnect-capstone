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

    if (
      !appointmentDate ||
      !appointmentTime ||
      !fullName ||
      !phoneNumber ||
      !location
    ) {
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
      message:
        'Your appointment request has been received. Please wait for clinic confirmation.'
    });
  } catch (error) {
    if (error.message === 'APPOINTMENT_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message:
          'This appointment already exists. Please check your appointment details.'
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
      emailAddress,
      phoneNumber,
      branch,
      concern,
      message
    } = req.body;

    if (
      !fullName ||
      !emailAddress ||
      !phoneNumber ||
      !branch ||
      !concern ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        messageTitle: 'Inquiry Failed',
        message: 'Please complete all required inquiry fields.'
      });
    }

    await websiteService.saveInquiry({
      fullName,
      emailAddress,
      phoneNumber,
      branch,
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

router.get(
  '/appointments',
  authenticate,
  requireRole('receptionist'),
  async (req, res) => {
    try {
      const { search = '', status = '' } = req.query;

      const rows = await websiteService.listAppointments({
        search,
        status
      });

      return res.json({
        appointments: rows
      });
    } catch (error) {
      console.error('List online appointments error:', error);

      return res.status(500).json({
        message: 'Failed to load online appointments.'
      });
    }
  }
);

router.patch(
  '/appointments/:id/status',
  authenticate,
  requireRole('receptionist'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          message: 'Status is required.'
        });
      }

      await websiteService.updateAppointmentStatus(id, status);

      return res.json({
        message: 'Appointment status updated.'
      });
    } catch (error) {
      console.error('Update online appointment status error:', error);

      return res.status(500).json({
        message: 'Failed to update appointment status.'
      });
    }
  }
);

router.get(
  '/inquiries',
  authenticate,
  requireRole('receptionist'),
  async (req, res) => {
    try {
      const { search = '' } = req.query;

      const rows = await websiteService.listInquiries({
        search
      });

      return res.json({
        inquiries: rows
      });
    } catch (error) {
      console.error('List online inquiries error:', error);

      return res.status(500).json({
        message: 'Failed to load online inquiries.'
      });
    }
  }
);

// ── Website CMS — public GET endpoints (no auth) ────────────────────────────

router.get('/content', async (req, res) => {
  try {
    const content = await websiteService.getContent();
    res.json({ content });
  } catch (err) {
    console.error('Get website content error:', err);
    res.status(500).json({ message: 'Failed to load website content.' });
  }
});

router.get('/faqs', async (req, res) => {
  try {
    const faqs = await websiteService.listFaqs({ all: false });
    res.json({ faqs });
  } catch (err) {
    console.error('Get website faqs error:', err);
    res.status(500).json({ message: 'Failed to load FAQs.' });
  }
});

router.get('/services', async (req, res) => {
  try {
    const services = await websiteService.listWebsiteServices({ all: false });
    res.json({ services });
  } catch (err) {
    console.error('Get website services error:', err);
    res.status(500).json({ message: 'Failed to load services.' });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await websiteService.listAnnouncements({ all: false });
    res.json({ announcements });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ message: 'Failed to load announcements.' });
  }
});

// ── Website CMS — admin CRUD endpoints ──────────────────────────────────────

router.put('/content', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { fields } = req.body;
    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ message: 'fields object is required.' });
    }
    await websiteService.upsertContent(fields);
    const content = await websiteService.getContent();
    res.json({ message: 'Website content updated.', content });
  } catch (err) {
    console.error('Update website content error:', err);
    res.status(500).json({ message: 'Failed to update website content.' });
  }
});

router.get('/faqs/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const faqs = await websiteService.listFaqs({ all: true });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load FAQs.' });
  }
});

router.post('/faqs', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, sort_order, status } = req.body;
    if (!question || !answer) return res.status(400).json({ message: 'question and answer are required.' });
    const id = await websiteService.createFaq({ question, answer, sort_order, status });
    const faqs = await websiteService.listFaqs({ all: true });
    res.status(201).json({ message: 'FAQ created.', id, faqs });
  } catch (err) {
    console.error('Create FAQ error:', err);
    res.status(500).json({ message: 'Failed to create FAQ.' });
  }
});

router.put('/faqs/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, sort_order, status } = req.body;
    if (!question || !answer) return res.status(400).json({ message: 'question and answer are required.' });
    await websiteService.updateFaq(req.params.id, { question, answer, sort_order, status });
    const faqs = await websiteService.listFaqs({ all: true });
    res.json({ message: 'FAQ updated.', faqs });
  } catch (err) {
    console.error('Update FAQ error:', err);
    res.status(500).json({ message: 'Failed to update FAQ.' });
  }
});

router.delete('/faqs/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await websiteService.deleteFaq(req.params.id);
    const faqs = await websiteService.listFaqs({ all: true });
    res.json({ message: 'FAQ deleted.', faqs });
  } catch (err) {
    console.error('Delete FAQ error:', err);
    res.status(500).json({ message: 'Failed to delete FAQ.' });
  }
});

router.get('/website-services/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const services = await websiteService.listWebsiteServices({ all: true });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load website services.' });
  }
});

router.post('/website-services', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, image_path, description, slug, sort_order, status } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    const id = await websiteService.createWebsiteService({ name, image_path, description, slug, sort_order, status });
    const services = await websiteService.listWebsiteServices({ all: true });
    res.status(201).json({ message: 'Service created.', id, services });
  } catch (err) {
    console.error('Create website service error:', err);
    res.status(500).json({ message: 'Failed to create website service.' });
  }
});

router.put('/website-services/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, image_path, description, slug, sort_order, status } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    await websiteService.updateWebsiteService(req.params.id, { name, image_path, description, slug, sort_order, status });
    const services = await websiteService.listWebsiteServices({ all: true });
    res.json({ message: 'Service updated.', services });
  } catch (err) {
    console.error('Update website service error:', err);
    res.status(500).json({ message: 'Failed to update website service.' });
  }
});

router.delete('/website-services/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await websiteService.deleteWebsiteService(req.params.id);
    const services = await websiteService.listWebsiteServices({ all: true });
    res.json({ message: 'Service deleted.', services });
  } catch (err) {
    console.error('Delete website service error:', err);
    res.status(500).json({ message: 'Failed to delete website service.' });
  }
});

router.get('/announcements/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const announcements = await websiteService.listAnnouncements({ all: true });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load announcements.' });
  }
});

router.post('/announcements', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, message, start_date, end_date, status } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message are required.' });
    const id = await websiteService.createAnnouncement({ title, message, start_date, end_date, status });
    const announcements = await websiteService.listAnnouncements({ all: true });
    res.status(201).json({ message: 'Announcement created.', id, announcements });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
});

router.put('/announcements/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, message, start_date, end_date, status } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message are required.' });
    await websiteService.updateAnnouncement(req.params.id, { title, message, start_date, end_date, status });
    const announcements = await websiteService.listAnnouncements({ all: true });
    res.json({ message: 'Announcement updated.', announcements });
  } catch (err) {
    console.error('Update announcement error:', err);
    res.status(500).json({ message: 'Failed to update announcement.' });
  }
});

router.delete('/announcements/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await websiteService.deleteAnnouncement(req.params.id);
    const announcements = await websiteService.listAnnouncements({ all: true });
    res.json({ message: 'Announcement deleted.', announcements });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ message: 'Failed to delete announcement.' });
  }
});

module.exports = router;