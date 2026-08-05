const express = require('express');
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const websiteService = require('../services/websiteService');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

// Path to the main uploads folder.
const uploadDir = path.join(__dirname, "../../uploads");

// Create the uploads folder if it does not exist.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Path to the team images folder.
const teamDir = path.join(__dirname, "../../uploads/team");

// Create the team folder if it does not exist.
if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, { recursive: true });
}

// Configure Multer storage settings.
const storage = multer.diskStorage({
    // Set the folder where uploaded files will be saved.
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    // Generate a unique filename using the current timestamp.
    // Example: 1754389023456.jpg
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Create the Multer upload middleware.
const upload = multer({ storage });

// Save a new appointment booking from the website.
router.post("/saveAppointment", async (req, res) => {
    try {
        // Get the appointment details submitted by the user.
        const {
            appointmentDate,
            appointmentTime,
            durationMinutes,
            fullName,
            email,
            phoneNumber,
            location,
            reasonForBooking,
        } = req.body;

        // Check that all required fields are provided.
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
                messageTitle: "Appointment Failed",
                message: "Please complete all required appointment fields.",
            });
        }

        // Automatically create the appointment in the system.
        const booked = await websiteService.autoBookAppointment({
            appointmentDate,
            appointmentTime,
            durationMinutes,
            fullName,
            email,
            phoneNumber,
            location,
            reasonForBooking,
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

// Get all clinic services from the centralized services table.
// This endpoint is public and does not use the website CMS services.
router.get("/clinic-services", async (req, res) => {
    try {
        // Retrieve the list of clinic services.
        const services = await websiteService.listClinicServices();

        // Return the services to the client.
        res.json({ services });
    } catch (err) {
        console.error("Get clinic services error:", err);

        // Return an error if the services cannot be loaded.
        res.status(500).json({
            message: "Failed to load clinic services.",
        });
    }
});

// Get available appointment time slots.
// Only returns time slots where at least one qualified dentist is available.
router.get("/availableSlots", async (req, res) => {
    try {
        // Get the selected date, branch, and service from the query string.
        const { date, branch, service } = req.query;

        // Validate the required query parameters.
        if (!date || !branch || !service) {
            return res.status(400).json({
                message: "date, branch, and service are required.",
            });
        }

        // Retrieve all available appointment slots.
        const slots = await websiteService.listAvailableSlots({
            date: String(date),
            branch: String(branch),
            serviceName: String(service),
        });

        // Return the available slots.
        return res.json({ slots });
    } catch (err) {
        console.error("Get available slots error:", err);

        // Return the appropriate error message.
        return res.status(err.statusCode || 500).json({
            message: err.message || "Failed to load available slots.",
        });
    }
});

// Get available appointment dates for a selected month.
// Only returns dates that have at least one available appointment slot.
router.get("/availableDays", async (req, res) => {
    try {
        // Get the selected month, branch, and service.
        const { month, branch, service } = req.query;

        // Validate the required query parameters.
        if (!month || !branch || !service) {
            return res.status(400).json({
                message: "month, branch, and service are required.",
            });
        }

        // Retrieve all available appointment dates.
        const days = await websiteService.listAvailableDays({
            month: String(month),
            branch: String(branch),
            serviceName: String(service),
        });

        // Return the available dates.
        return res.json({ days });
    } catch (err) {
        console.error("Get available days error:", err);

        // Return the appropriate error message.
        return res.status(err.statusCode || 500).json({
            message: err.message || "Failed to load available days.",
        });
    }
});

// Save a new inquiry submitted from the website contact form.
router.post("/saveInquiry", async (req, res) => {
    try {
        // Get the inquiry details submitted by the user.
        const {
            fullName,
            emailAddress,
            phoneNumber,
            branch,
            concern,
            message,
        } = req.body;

        // Check that all required fields are provided.
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
                messageTitle: "Inquiry Failed",
                message: "Please complete all required inquiry fields.",
            });
        }

        // Save the inquiry to the database.
        await websiteService.saveInquiry({
            fullName,
            emailAddress,
            phoneNumber,
            branch,
            concern,
            message,
        });

        // Return a success response after the inquiry is saved.
        return res.status(201).json({
            success: true,
            messageTitle: "Inquiry Submitted",
            message: "Your inquiry has been received. Please wait for our response.",
        });
    } catch (error) {
        // Prevent duplicate inquiry submissions.
        if (error.message === "INQUIRY_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                messageTitle: "Inquiry Failed",
                message: "You already submitted an inquiry with the same details.",
            });
        }

        // Return a server error if something unexpected happens.
        return res.status(500).json({
            success: false,
            messageTitle: "Server Error",
            message: "Something went wrong. Please try again later.",
        });
    }
});

// Get all online appointment bookings assigned to the receptionist's branch.
router.get("/appointments", authenticate, requireRole("receptionist"),
    async (req, res) => {
        try {
            // Get the search keyword and appointment status filter.
            const { search = "", status = "" } = req.query;

            // Get the branch names assigned to the logged-in receptionist.
            const branchNames = await websiteService.getBranchNamesByIds(
                req.user.branches || []
            );

            // Retrieve the appointments for the assigned branches.
            const rows = await websiteService.listAppointments({
                search,
                status,
                branchNames,
            });

            // Return the appointment list.
            return res.json({
                appointments: rows,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to load online appointments.",
            });
        }
    }
);

// Update the status of an online appointment.
router.patch("/appointments/:id/status", authenticate, requireRole("receptionist"),
    async (req, res) => {
        try {
            // Get the appointment ID and new status.
            const { id } = req.params;
            const { status } = req.body;

            // Validate that a status was provided.
            if (!status) {
                return res.status(400).json({
                    message: "Status is required.",
                });
            }

            // Update the appointment status.
            await websiteService.updateAppointmentStatus(id, status);

            // Return a success response.
            return res.json({
                message: "Appointment status updated.",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to update appointment status.",
            });
        }
    }
);

// Get all online inquiries assigned to the receptionist's branch.
router.get("/inquiries", authenticate, requireRole("receptionist"),
    async (req, res) => {
        try {
            // Get the search keyword.
            const { search = "" } = req.query;

            // Get the branch names assigned to the logged-in receptionist.
            const branchNames = await websiteService.getBranchNamesByIds(
                req.user.branches || []
            );

            // Retrieve the inquiries.
            const rows = await websiteService.listInquiries({
                search,
                branchNames,
            });

            // Return the inquiry list.
            return res.json({
                inquiries: rows,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to load online inquiries.",
            });
        }
    }
);

// Get all replies for a specific inquiry.
router.get("/inquiries/:id/replies", authenticate, requireRole("receptionist"),
    async (req, res) => {
        try {
            // Get the inquiry ID.
            const { id } = req.params;

            // Get the branches assigned to the logged-in receptionist.
            const branchNames = await websiteService.getBranchNamesByIds(
                req.user.branches || []
            );

            // Retrieve the selected inquiry.
            const inquiry = await websiteService.getInquiryById(id);

            // Check if the inquiry exists.
            if (!inquiry) {
                return res.status(404).json({
                    message: "Inquiry not found.",
                });
            }

            // Ensure the receptionist can only access inquiries from their assigned branches.
            const allowed = branchNames.some(
                (branch) =>
                    branch.trim().toLowerCase() ===
                    (inquiry.branch || "").trim().toLowerCase()
            );

            if (!allowed) {
                return res.status(403).json({
                    message: "Access denied to this inquiry.",
                });
            }

            // Retrieve all replies for the inquiry.
            const replies = await websiteService.getInquiryReplies(id);

            // Return the replies.
            return res.json({
                replies,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to load replies.",
            });
        }
    }
);

// Send a reply to a patient's inquiry.
router.post("/inquiries/:id/reply", authenticate, requireRole("receptionist"),
    async (req, res) => {
        try {
            // Get the inquiry ID and reply message.
            const { id } = req.params;
            const { reply_message } = req.body;

            // Ensure a reply message was provided.
            if (!reply_message || !reply_message.trim()) {
                return res.status(400).json({
                    message: "Reply message is required.",
                });
            }

            // Get the branches assigned to the logged-in receptionist.
            const branchNames = await websiteService.getBranchNamesByIds(
                req.user.branches || []
            );

            // Retrieve the selected inquiry.
            const inquiry = await websiteService.getInquiryById(id);

            // Check whether the inquiry exists.
            if (!inquiry) {
                return res.status(404).json({
                    message: "Inquiry not found.",
                });
            }

            // Ensure the receptionist can only reply to inquiries
            // from their assigned branches.
            const allowed = branchNames.some(
                (branch) =>
                    branch.trim().toLowerCase() ===
                    (inquiry.branch || "").trim().toLowerCase()
            );

            if (!allowed) {
                return res.status(403).json({
                    message: "Access denied to this inquiry.",
                });
            }

            // Ensure the inquiry contains an email address.
            if (!inquiry.email_address) {
                return res.status(400).json({
                    message: "This inquiry has no email address.",
                });
            }

            // Remove unnecessary spaces from the reply message.
            const trimmed = reply_message.trim();

            // Create the email content.
            const html = `
                <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #8b6508, #d4af37); padding: 24px; text-align: center;">
                        <h2 style="color: #fff; margin: 0; font-size: 20px;">Smile Empress Dental Hub</h2>
                    </div>

                    <div style="padding: 28px; color: #172033;">
                        <p style="margin-top: 0;">
                            Hi <strong>${inquiry.full_name}</strong>,
                        </p>

                        <p>
                            Thank you for contacting us. Here is our response
                            to your inquiry about
                            <em>${inquiry.concern}</em>:
                        </p>

                        <div
                            style="
                                background: #fffaf0;
                                border-left: 4px solid #d4af37;
                                padding: 16px 20px;
                                border-radius: 6px;
                                margin: 20px 0;
                                white-space: pre-wrap;
                                line-height: 1.6;
                            "
                        >
                            ${trimmed}
                        </div>

                        <p
                            style="
                                color: #64748b;
                                font-size: 13px;
                                margin-bottom: 4px;
                            "
                        >
                            If you have further questions, feel free to reach
                            out again.
                        </p>

                        <p
                            style="
                                color: #64748b;
                                font-size: 13px;
                                margin-top: 0;
                            "
                        >
                            — ${inquiry.branch} Branch,
                            Smile Empress Dental Hub
                        </p>
                    </div>
                </div>
            `;

            // Send the reply email.
            await sendEmail({
                to: inquiry.email_address,
                subject: `Re: Your Inquiry — ${inquiry.concern}`,
                html,
                text: `Hi ${inquiry.full_name},

Thank you for contacting us. Here is our response to your inquiry about ${inquiry.concern}:

${trimmed} — ${inquiry.branch} Branch, Smile Empress Dental Hub`,
            });

            // Save the reply in the database.
            await websiteService.saveInquiryReply(id, {
                replyMessage: trimmed,
                repliedBy: req.user.user_id,
                sentToEmail: inquiry.email_address,
            });

            // Return a success response.
            return res.json({
                message: "Reply sent successfully.",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to send reply.",
            });
        }
    }
);

// Get all booked appointment time slots for a selected branch and date.
router.get("/bookedSlots", async (req, res) => {
    try {
        // Get the selected date and branch.
        const { date, branch } = req.query;

        // Validate the required query parameters.
        if (!date || !branch) {
            return res.status(400).json({
                message: "date and branch are required.",
            });
        }

        // Retrieve all booked time slots.
        const data = await websiteService.getBookedSlots(date, branch);

        // Return the booked slots.
        return res.json(data);
    } catch (err) {
        return res.status(500).json({
            message: "Failed to load booked slots.",
        });
    }
});

// ================================
// Website CMS Public Endpoints
// These routes can be accessed without authentication.
// ================================

// Get all website content.
router.get("/content", async (req, res) => {
    try {
        // Retrieve website content.
        const content = await websiteService.getContent();

        // Return the content.
        res.json({
            content,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to load website content.",
        });
    }
});

// Get all published FAQs.
router.get("/faqs", async (req, res) => {
    try {
        // Retrieve FAQs.
        const faqs = await websiteService.listFaqs({
            all: false,
        });

        // Return the FAQs.
        res.json({
            faqs,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to load FAQs.",
        });
    }
});

// Get all published website services.
router.get("/services", async (req, res) => {
    try {
        // Retrieve website services.
        const services = await websiteService.listWebsiteServices({
            all: false,
        });

        // Return the services.
        res.json({
            services,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to load services.",
        });
    }
});

// Get all published announcements.
router.get("/announcements", async (req, res) => {
    try {
        // Retrieve announcements.
        const announcements = await websiteService.listAnnouncements({
            all: false,
        });

        // Return the announcements.
        res.json({
            announcements,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to get announcements.",
        });
    }
});

// ================================
// Website CMS Admin Endpoints
// These routes require an authenticated admin account.
// ================================

// Update website content.
router.put("/content", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the updated website content.
            const { fields } = req.body;

            // Validate the request.
            if (!fields || typeof fields !== "object") {
                return res.status(400).json({
                    message: "fields object is required.",
                });
            }

            // Save the updated website content.
            await websiteService.upsertContent("footer", fields);

            // Retrieve the latest content.
            const content = await websiteService.getContent();

            // Return the updated content.
            res.json({
                message: "Website content updated.",
                content,
            });
        } catch (err) {
            res.status(500).json({
                message: err.message || "Failed to update website content.",
            });
        }
    }
);

// Get all FAQs, including unpublished ones.
router.get("/faqs/all", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            const faqs = await websiteService.listFaqs({
                all: true,
            });

            res.json({
                faqs,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to load FAQs.",
            });
        }
    }
);

// Create a new FAQ.
router.post("/faqs", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the FAQ details.
            const {
                question,
                answer,
                sort_order,
                status,
            } = req.body;

            // Validate the required fields.
            if (!question || !answer) {
                return res.status(400).json({
                    message: "question and answer are required.",
                });
            }

            // Create the FAQ.
            const id = await websiteService.createFaq({
                question,
                answer,
                sort_order,
                status,
            });

            // Retrieve the updated FAQ list.
            const faqs = await websiteService.listFaqs({
                all: true,
            });

            // Return the updated list.
            res.status(201).json({
                message: "FAQ created.",
                id,
                faqs,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to create FAQ.",
            });
        }
    }
);

// Update an existing FAQ.
router.put("/faqs/:id", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the updated FAQ details.
            const {
                question,
                answer,
                sort_order,
                status,
            } = req.body;

            // Validate the required fields.
            if (!question || !answer) {
                return res.status(400).json({
                    message: "question and answer are required.",
                });
            }

            // Update the FAQ.
            await websiteService.updateFaq(req.params.id, {
                question,
                answer,
                sort_order,
                status,
            });

            // Retrieve the updated FAQ list.
            const faqs = await websiteService.listFaqs({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "FAQ updated.",
                faqs,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to update FAQ.",
            });
        }
    }
);

// Delete a FAQ.
router.delete("/faqs/:id", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Delete the selected FAQ.
            await websiteService.deleteFaq(req.params.id);

            // Retrieve the updated FAQ list.
            const faqs = await websiteService.listFaqs({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "FAQ deleted.",
                faqs,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to delete FAQ.",
            });
        }
    }
);

// Get all website services, including unpublished ones.
router.get("/website-services/all", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            const services = await websiteService.listWebsiteServices({
                all: true,
            });

            res.json({
                services,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to load website services.",
            });
        }
    }
);

// Create a new website service.
router.post("/website-services", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the service details.
            const {
                name,
                image_path,
                description,
                slug,
                sort_order,
                status,
            } = req.body;

            // Validate the required fields.
            if (!name) {
                return res.status(400).json({
                    message: "name is required.",
                });
            }

            // Create the website service.
            const id = await websiteService.createWebsiteService({
                name,
                image_path,
                description,
                slug,
                sort_order,
                status,
            });

            // Retrieve the updated service list.
            const services = await websiteService.listWebsiteServices({
                all: true,
            });

            // Return the updated list.
            res.status(201).json({
                message: "Service created.",
                id,
                services,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to create website service.",
            });
        }
    }
);

// Update an existing website service.
router.put("/website-services/:id", authenticate, requireRole("admin"),
    upload.fields([
        { name: "image_path", maxCount: 1 },
        { name: "before_image", maxCount: 1 },
        { name: "after_image", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            // Get uploaded files.
            const files = req.files || {};

            // Use uploaded images if available.
            // Otherwise, keep the existing image paths.
            const image_path = files.image_path?.[0]
                ? `/uploads/${files.image_path[0].filename}`
                : req.body.image_path;

            const before_image = files.before_image?.[0]
                ? `/uploads/${files.before_image[0].filename}`
                : req.body.before_image;

            const after_image = files.after_image?.[0]
                ? `/uploads/${files.after_image[0].filename}`
                : req.body.after_image;

            // Get the service details.
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

            // Validate the required fields.
            if (!name) {
                return res.status(400).json({
                    message: "name is required.",
                });
            }

            // Update the website service.
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

            // Retrieve the updated service list.
            const services = await websiteService.listWebsiteServices({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "Service updated.",
                services,
            });
        } catch (err) {
            res.status(500).json({
                message: err.message || "Failed to update website service.",
            });
        }
    }
);

// Delete a website service.
router.delete("/website-services/:id", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Delete the selected service.
            await websiteService.deleteWebsiteService(req.params.id);

            // Retrieve the updated service list.
            const services = await websiteService.listWebsiteServices({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "Service deleted.",
                services,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to delete website service.",
            });
        }
    }
);

// Get all announcements, including unpublished ones.
router.get("/announcements/all", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            const announcements = await websiteService.listAnnouncements({
                all: true,
            });

            res.json({
                announcements,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to load announcements.",
            });
        }
    }
);

// Create a new announcement.
router.post("/announcements", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the announcement details.
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

            // Validate the required fields.
            if (
                !title ||
                !message ||
                !start_date ||
                !start_time ||
                !end_date ||
                !end_time
            ) {
                return res.status(400).json({
                    message:
                        "Title, message, start date, start time, end date, and end time are required.",
                });
            }

            // Combine the date and time values.
            const announcementStart = `${start_date} ${start_time}:00`;
            const announcementEnd = `${end_date} ${end_time}:00`;

            // Create the announcement.
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

            // Retrieve the updated announcement list.
            const announcements = await websiteService.listAnnouncements({
                all: true,
            });

            // Return the updated list.
            res.status(201).json({
                message: "Announcement created.",
                id,
                announcements,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to create announcement.",
            });
        }
    }
);

// Update an existing announcement.
router.put("/announcements/:id", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Get the updated announcement details.
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

            // Validate the required fields.
            if (
                !title ||
                !message ||
                !start_date ||
                !start_time ||
                !end_date ||
                !end_time
            ) {
                return res.status(400).json({
                    message:
                        "Title, message, start date, start time, end date, and end time are required.",
                });
            }

            // Combine the date and time values.
            const announcementStart = `${start_date} ${start_time}:00`;
            const announcementEnd = `${end_date} ${end_time}:00`;

            // Update the announcement.
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

            // Retrieve the updated announcement list.
            const announcements = await websiteService.listAnnouncements({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "Announcement updated.",
                announcements,
            });
        } catch (err) {
            res.status(500).json({
                message: err.message || "Failed to update announcement.",
            });
        }
    }
);

// Delete an announcement.
router.delete("/announcements/:id", authenticate, requireRole("admin"),
    async (req, res) => {
        try {
            // Delete the selected announcement.
            await websiteService.deleteAnnouncement(req.params.id);

            // Retrieve the updated announcement list.
            const announcements = await websiteService.listAnnouncements({
                all: true,
            });

            // Return the updated list.
            res.json({
                message: "Announcement deleted.",
                announcements,
            });
        } catch (err) {
            res.status(500).json({
                message: "Failed to delete announcement.",
            });
        }
    }
);

// Upload the website logo.
router.post("/upload-logo", authenticate, requireRole("admin"), upload.single("logo"),
    (req, res) => {
        // Check if a logo file was uploaded.
        if (!req.file) {
            return res.status(400).json({
                message: "No logo uploaded.",
            });
        }

        // Return the uploaded file path.
        res.json({
            path: `/uploads/${req.file.filename}`,
        });
    }
);

// Upload the homepage hero image.
router.post("/upload-hero-image", authenticate, requireRole("admin"), upload.single("heroImage"),
    (req, res) => {
        // Check if a hero image was uploaded.
        if (!req.file) {
            return res.status(400).json({
                message: "No hero image uploaded.",
            });
        }

        // Return the uploaded file path.
        res.json({
            path: `/uploads/${req.file.filename}`,
        });
    }
);

// Create the team image folder if it does not exist.
if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, {
        recursive: true,
    });
}

// Configure Multer storage for team member images.
const teamStorage = multer.diskStorage({
    // Save uploaded files inside the team folder.
    destination(req, file, cb) {
        cb(null, teamDir);
    },

    // Generate a unique filename.
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
        );
    },
});

// Create the upload middleware for team images.
const uploadTeam = multer({
    storage: teamStorage,
});

// Upload a team member image.
router.post("/upload-team-image", authenticate, requireRole("admin"),  uploadTeam.single("image"),
    (req, res) => {
        // Check if an image was uploaded.
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded.",
            });
        }

        // Return the uploaded image path.
        res.json({
            path: `/uploads/team/${req.file.filename}`,
        });
    }
);

module.exports = router;