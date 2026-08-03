const express = require('express');
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const websiteService = require('../services/websiteService');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const teamDir = path.join(__dirname, "../../uploads/team");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

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
      !email ||
      !phoneNumber ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message: 'Please complete all required appointment fields.'
      });
    }

    const booked = await websiteService.autoBookAppointment({
      appointmentDate,
      appointmentTime,
      durationMinutes,
      fullName,
      email,
      phoneNumber,
      location,
      reasonForBooking
    });

    // Send confirmation email to the website-provided email (best-effort; do not block booking)
    try {
      const safeName = String(fullName || '').trim() || 'Patient';
      const safeLocation = String(location || '').trim() || 'Selected branch';
      const safeReason = String(reasonForBooking || '').trim() || 'Selected service';
      const safeDate = String(appointmentDate || '').trim();
      const safeTime = String(appointmentTime || '').trim();

      const subject = `Appointment Confirmation — ${safeLocation}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b6508, #d4af37); padding: 24px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 20px;">Smile Empress Dental Hub</h2>
            <p style="color: rgba(255,255,255,0.92); margin: 8px 0 0; font-size: 13px;">This is a confirmation email for your appointment booking.</p>
          </div>
          <div style="padding: 28px; color: #172033;">
            <p style="margin-top: 0;">Hi <strong>${safeName}</strong>,</p>
            <p>Your appointment has been booked successfully. Here are your appointment details:</p>

            <div style="background: #fffaf0; border-left: 4px solid #d4af37; padding: 16px 20px; border-radius: 6px; margin: 18px 0; line-height: 1.6;">
              <div><strong>Branch:</strong> ${safeLocation}</div>
              <div><strong>Service:</strong> ${safeReason}</div>
              <div><strong>Date:</strong> ${safeDate}</div>
              <div><strong>Time:</strong> ${safeTime}</div>
            </div>

            <p style="margin: 0 0 10px;">Please arrive on time. If you have any inquiries, kindly send them through the website inquiries form.</p>
            <p style="color: #64748b; font-size: 13px; margin: 0;">— Smile Empress Dental Hub</p>
          </div>
        </div>
      `;

      const text =
        `Appointment Confirmation (Smile Empress Dental Hub)\n\n` +
        `Hi ${safeName},\n\n` +
        `This is a confirmation email for your appointment booking.\n\n` +
        `Branch: ${safeLocation}\n` +
        `Service: ${safeReason}\n` +
        `Date: ${safeDate}\n` +
        `Time: ${safeTime}\n\n` +
        `Please arrive on time. If you have any inquiries, kindly send them through the website inquiries form.\n`;

      await sendEmail({
        to: String(email).trim(),
        subject,
        html,
        text,
      });
    } catch (emailErr) {
      console.error('Appointment confirmation email failed:', emailErr?.message || emailErr);
    }

    return res.status(201).json({
      success: true,
      messageTitle: 'Appointment Booked',
      message:
        'Your appointment has been booked successfully. Please arrive on time.',
      appointmentId: booked?.appointmentId || null,
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

    if (error.message === 'DUPLICATE_ACTIVE_REASON') {
      return res.status(409).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message:
          'You already have a pending appointment for that reason. Please wait for your current booking or choose a different purpose of visit.',
      });
    }

    if (error.message === 'EMAIL_ALREADY_USED_NON_PATIENT') {
      return res.status(409).json({
        success: false,
        messageTitle: 'Appointment Failed',
        message:
          'This email address is already used by another account. Please use a different email.',
      });
    }

    if (error.statusCode === 409 && String(error.message || '').includes('No available dentist')) {
      return res.status(409).json({
        success: false,
        messageTitle: 'No Available Dentist',
        message:
          'No dentist is available for the selected service and time. Please choose another time or service.',
      });
    }

    console.error('Save appointment error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      messageTitle: 'Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }
});

// Public: list clinic services from the centralized services table (not website CMS services)
router.get('/clinic-services', async (req, res) => {
  try {
    const services = await websiteService.listClinicServices();
    res.json({ services });
  } catch (err) {
    console.error('Get clinic services error:', err);
    res.status(500).json({ message: 'Failed to load clinic services.' });
  }
});

// Public: available time slots for a branch + date + clinic service (only slots with an available dentist)
router.get('/availableSlots', async (req, res) => {
  try {
    const { date, branch, service } = req.query;

    if (!date || !branch || !service) {
      return res.status(400).json({ message: 'date, branch, and service are required.' });
    }

    const slots = await websiteService.listAvailableSlots({
      date: String(date),
      branch: String(branch),
      serviceName: String(service),
    });

    return res.json({ slots });
  } catch (err) {
    console.error('Get available slots error:', err);
    return res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load available slots.' });
  }
});

// Public: available dates for a month + branch + clinic service (only dates with at least one available slot)
router.get('/availableDays', async (req, res) => {
  try {
    const { month, branch, service } = req.query;

    if (!month || !branch || !service) {
      return res.status(400).json({ message: 'month, branch, and service are required.' });
    }

    const days = await websiteService.listAvailableDays({
      month: String(month),
      branch: String(branch),
      serviceName: String(service),
    });

    return res.json({ days });
  } catch (err) {
    console.error('Get available days error:', err);
    return res.status(err.statusCode || 500).json({ message: err.message || 'Failed to load available days.' });
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
      const branchNames = await websiteService.getBranchNamesByIds(req.user.branches || []);

      const rows = await websiteService.listAppointments({
        search,
        status,
        branchNames
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
      const branchNames = await websiteService.getBranchNamesByIds(req.user.branches || []);
      const rows = await websiteService.listInquiries({ search, branchNames });

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

router.get(
  '/inquiries/:id/replies',
  authenticate,
  requireRole('receptionist'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const branchNames = await websiteService.getBranchNamesByIds(req.user.branches || []);
      const inquiry = await websiteService.getInquiryById(id);

      if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found.' });
      }

      const allowed = branchNames.some(
        (b) => b.trim().toLowerCase() === (inquiry.branch || '').trim().toLowerCase()
      );
      if (!allowed) {
        return res.status(403).json({ message: 'Access denied to this inquiry.' });
      }

      const replies = await websiteService.getInquiryReplies(id);
      return res.json({ replies });
    } catch (error) {
      console.error('Get inquiry replies error:', error);
      return res.status(500).json({ message: 'Failed to load replies.' });
    }
  }
);

router.post(
  '/inquiries/:id/reply',
  authenticate,
  requireRole('receptionist'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reply_message } = req.body;

      if (!reply_message || !reply_message.trim()) {
        return res.status(400).json({ message: 'Reply message is required.' });
      }

      const branchNames = await websiteService.getBranchNamesByIds(req.user.branches || []);
      const inquiry = await websiteService.getInquiryById(id);

      if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found.' });
      }

      const allowed = branchNames.some(
        (b) => b.trim().toLowerCase() === (inquiry.branch || '').trim().toLowerCase()
      );
      if (!allowed) {
        return res.status(403).json({ message: 'Access denied to this inquiry.' });
      }

      if (!inquiry.email_address) {
        return res.status(400).json({ message: 'This inquiry has no email address.' });
      }

      const trimmed = reply_message.trim();

      const html = `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b6508, #d4af37); padding: 24px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-size: 20px;">Smile Empress Dental Hub</h2>
          </div>
          <div style="padding: 28px; color: #172033;">
            <p style="margin-top: 0;">Hi <strong>${inquiry.full_name}</strong>,</p>
            <p>Thank you for contacting us. Here is our response to your inquiry about <em>${inquiry.concern}</em>:</p>
            <div style="background: #fffaf0; border-left: 4px solid #d4af37; padding: 16px 20px; border-radius: 6px; margin: 20px 0; white-space: pre-wrap; line-height: 1.6;">${trimmed}</div>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 4px;">If you have further questions, feel free to reach out again.</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 0;">— ${inquiry.branch} Branch, Smile Empress Dental Hub</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: inquiry.email_address,
        subject: `Re: Your Inquiry — ${inquiry.concern}`,
        html,
        text: `Hi ${inquiry.full_name},\n\nThank you for contacting us. Here is our response to your inquiry about ${inquiry.concern}:\n\n${trimmed}\n\n— ${inquiry.branch} Branch, Smile Empress Dental Hub`,
      });

      await websiteService.saveInquiryReply(id, {
        replyMessage: trimmed,
        repliedBy: req.user.user_id,
        sentToEmail: inquiry.email_address,
      });

      return res.json({ message: 'Reply sent successfully.' });
    } catch (error) {
      console.error('Send inquiry reply error:', error);
      return res.status(500).json({ message: 'Failed to send reply.' });
    }
  }
);

// ── Public: booked time slots for a branch + date ────────────────────────────

router.get('/bookedSlots', async (req, res) => {
  try {
    const { date, branch } = req.query;

    if (!date || !branch) {
      return res.status(400).json({ message: 'date and branch are required.' });
    }

    const data = await websiteService.getBookedSlots(date, branch);
    return res.json(data);
  } catch (err) {
    console.error('Get booked slots error:', err);
    return res.status(500).json({ message: 'Failed to load booked slots.' });
  }
});

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

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await websiteService.listAnnouncements({
      all: false,
    });

    res.json({
      announcements,
    });

  } catch (err) {
    console.error("Get announcements error:", err);

    res.status(500).json({
      message: "Failed to get announcements.",
    });
  }
});

// ── Website CMS — admin CRUD endpoints ──────────────────────────────────────

router.put('/content', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { fields } = req.body;

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({
        message: 'fields object is required.'
      });
    }

    await websiteService.upsertContent('footer', fields);

    const content = await websiteService.getContent();

    res.json({
      message: 'Website content updated.',
      content
    });

  } catch (err) {
    console.error('Update website content error:', err);

    res.status(500).json({
      message: err.message || 'Failed to update website content.'
    });
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

router.put(
  "/website-services/:id",
  authenticate,
  requireRole("admin"),
  upload.fields([
    { name: "image_path", maxCount: 1 },
    { name: "before_image", maxCount: 1 },
    { name: "after_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};

      const image_path = files.image_path?.[0] ? `/uploads/${files.image_path[0].filename}` : req.body.image_path;

      const before_image = files.before_image?.[0] ? `/uploads/${files.before_image[0].filename}` : req.body.before_image;

      const after_image = files.after_image?.[0] ? `/uploads/${files.after_image[0].filename}` : req.body.after_image;

      const {
        name,
        intro,
        heading,
        overview,
        benefits,
        process,
        care,
        duration,
        ideal_for,
        reminder,
        description,
        slug,
        sort_order,
        status,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "name is required.",
        });
      }

      await websiteService.updateWebsiteService(req.params.id, {
        name,
        image_path,
        before_image,
        after_image,
        intro,
        heading,
        overview,
        benefits,
        process,
        care,
        duration,
        ideal_for,
        reminder,
        description,
        slug,
        sort_order,
        status,
      });

      const services = await websiteService.listWebsiteServices({
        all: true,
      });

      res.json({
        message: "Service updated.",
        services,
      });
    } catch (err) {
      console.error("Update website service error:", err);

      res.status(500).json({
        message: err.message || "Failed to update website service.",
      });
    }
  }
);

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

router.post("/announcements", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const {
      title,
      message,
      title_font_family,
      title_font_size,
      title_font_weight,
      title_color,
      title_alignment,
      message_font_family,
      message_font_size,
      message_font_weight,
      message_color,
      message_alignment,
      start_date,
      start_time,
      end_date,
      end_time,
      status,
    } = req.body;

    if (!title || !message || !start_date || !start_time || !end_date || !end_time) {
      return res.status(400).json({
        message: "Title, message, start date, start time, end date, and end time are required.",
      });
    }

    const announcementStart = `${start_date} ${start_time}:00`;

    const announcementEnd = `${end_date} ${end_time}:00`;

    const id = await websiteService.createAnnouncement({
      title,
      message,
      title_font_family,
      title_font_size,
      title_font_weight,
      title_color,
      title_alignment,
      message_font_family,
      message_font_size,
      message_font_weight,
      message_color,
      message_alignment,
      start_date: announcementStart,
      end_date: announcementEnd,
      status,
    });

    const announcements = await websiteService.listAnnouncements({
      all: true,
    });

    res.status(201).json({
      message: "Announcement created.",
      id,
      announcements,
    });
  } catch (err) {
    console.error("Create announcement error:", err);

    res.status(500).json({
      message: "Failed to create announcement.",
    });
  }
});

router.put("/announcements/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const {
      title,
      message,
      title_font_family,
      title_font_size,
      title_font_weight,
      title_color,
      title_alignment,
      message_font_family,
      message_font_size,
      message_font_weight,
      message_color,
      message_alignment,
      start_date,
      start_time,
      end_date,
      end_time,
      status,
    } = req.body;

    if (!title || !message || !start_date || !start_time || !end_date || !end_time) {
      return res.status(400).json({
        message: "Title, message, start date, start time, end date, and end time are required.",
      });
    }

    const announcementStart = `${start_date} ${start_time}:00`;

    const announcementEnd = `${end_date} ${end_time}:00`;

    await websiteService.updateAnnouncement(req.params.id, {
      title,
      message,
      title_font_family,
      title_font_size,
      title_font_weight,
      title_color,
      title_alignment,
      message_font_family,
      message_font_size,
      message_font_weight,
      message_color,
      message_alignment,
      start_date: announcementStart,
      end_date: announcementEnd,
      status,
    });

    const announcements = await websiteService.listAnnouncements({
      all: true,
    });

    res.json({
      message: "Announcement updated.",
      announcements,
    });
  } catch (err) {
    console.error("Update announcement error:", err);

    res.status(500).json({
      message: err.message || "Failed to update announcement.",
    });
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

router.post(
  "/upload-logo",
  authenticate,
  requireRole("admin"),
  upload.single("logo"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No logo uploaded.",
      });
    }

    res.json({
      path: `/uploads/${req.file.filename}`,
    });
  }
);

router.post(
  "/upload-hero-image",
  authenticate,
  requireRole("admin"),
  upload.single("heroImage"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No hero image uploaded.",
      });
    }

    res.json({
      path: `/uploads/${req.file.filename}`,
    });
  }
);

if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, { recursive: true });
}

const teamStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, teamDir);
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const uploadTeam = multer({
    storage: teamStorage,
});

router.post("/upload-team-image", authenticate, requireRole("admin"), uploadTeam.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded.",
      });
    }

    res.json({
      path: `/uploads/team/${req.file.filename}`,
    });
  }
);

module.exports = router;