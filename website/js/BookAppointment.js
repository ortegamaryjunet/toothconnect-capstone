const API_BASE_URL = "http://localhost:4000";

const servicesByBranch = {
    "Makati Branch": [
        "I would like to schedule a general dental check-up.",
        "I would like to have my teeth professionally cleaned.",
        "I would like to book an orthodontic consultation.",
        "I would like to inquire about dental filling treatment.",
        "I would like to undergo a tooth extraction procedure.",
        "I would like to schedule my routine braces adjustment.",
        "I am experiencing dental pain or discomfort.",
        "I would like a cosmetic dental consultation.",
        "I have another dental concern to discuss."
    ],
    "Las Piñas Branch": [
        "I would like to schedule a general dental check-up.",
        "I would like to have my teeth professionally cleaned.",
        "I would like to inquire about dental filling treatment.",
        "I would like to undergo a tooth extraction procedure.",
        "I am experiencing dental pain or discomfort.",
        "I would like a cosmetic dental consultation.",
        "I have another dental concern to discuss."
    ]
};

document.addEventListener("DOMContentLoaded", function () {
    const calendarDays = document.getElementById("calendarDays");
    const monthYear = document.getElementById("monthYear");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");

    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");
    const timeSlots = document.getElementById("timeSlots");

    const reasonBtn = document.getElementById("reasonBtn");
    const reasonText = document.getElementById("reasonText");
    const reasonOptions = document.getElementById("reasonOptions");
    const selectedReason = document.getElementById("selectedReason");

    const appointmentForm = document.getElementById("appointmentForm");
    const appointmentDateInput = document.getElementById("appointmentDate");
    const appointmentTimeInput = document.getElementById("appointmentTime");
    const durationMinutesInput = document.getElementById("durationMinutes");

    const patientName = document.getElementById("patientName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phoneNumber");
    const fullPhoneNumber = document.getElementById("fullPhoneNumber");

    const step2Notice = document.getElementById("step2Notice");
    const step2Content = document.getElementById("step2Content");
    const step3Notice = document.getElementById("step3Notice");
    const step3Content = document.getElementById("step3Content");

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedTime24 = null;
    let selectedBranch = null;

    // ---- Step lock management ----

    function updateStepLocks() {
        const step1Done = selectedDate !== null;
        const step2Done = selectedBranch !== null;

        if (step2Notice) step2Notice.classList.toggle("visible", !step1Done);
        if (step2Content) step2Content.classList.toggle("locked", !step1Done);

        if (step3Notice) step3Notice.classList.toggle("visible", !step2Done);
        if (step3Content) step3Content.classList.toggle("locked", !step2Done);
    }

    // ---- Inline error helpers ----

    function showFieldError(errorId, message) {
        const el = document.getElementById(errorId);
        if (!el) return;
        el.textContent = message;
        el.classList.add("active");
    }

    function clearFieldError(errorId) {
        const el = document.getElementById(errorId);
        if (!el) return;
        el.textContent = "";
        el.classList.remove("active");
    }

    function setInputError(input, hasError) {
        if (!input) return;
        if (hasError) {
            input.classList.add("input-error");
        } else {
            input.classList.remove("input-error");
        }
    }

    // ---- Validation ----

    function validateFullName(value) {
        const name = value.trim();
        if (!name) return "Full name is required.";
        if (/[0-9]/.test(name)) return "Name must not contain numbers.";
        if (/[^a-zA-ZÀ-ɏ\s]/.test(name)) return "Name must not contain special characters.";
        const words = name.split(/\s+/).filter(function (w) { return w.length > 0; });
        if (words.length < 2) return "Please enter both your first and last name.";
        return "";
    }

    function validateEmail(value) {
        const email = value.trim();
        if (!email) return "Email address is required.";
        const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._\-]*@[a-zA-Z0-9][a-zA-Z0-9._\-]*\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address.";
        return "";
    }

    function validatePhone(value) {
        const digits = value.replace(/\D/g, "");
        if (!digits) return "Phone number is required.";
        if (!/^09\d{9}$/.test(digits)) {
            return "Enter a valid Philippine number (09XXXXXXXXX).";
        }
        return "";
    }

    function toPhInternational(localNumber) {
        const digits = localNumber.replace(/\D/g, "");
        if (/^09\d{9}$/.test(digits)) {
            return "+63" + digits.substring(1);
        }
        return localNumber;
    }

    // ---- Input sanitization + blur validation ----

    if (patientName) {
        patientName.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-ZÀ-ɏ\s]/g, "");
            if (this.classList.contains("input-error")) {
                const error = validateFullName(this.value);
                if (!error) {
                    setInputError(this, false);
                    clearFieldError("nameError");
                }
            }
        });

        patientName.addEventListener("blur", function () {
            if (!this.value.trim()) return;
            const error = validateFullName(this.value);
            setInputError(this, Boolean(error));
            if (error) showFieldError("nameError", error);
            else clearFieldError("nameError");
        });
    }

    if (emailInput) {
        emailInput.addEventListener("blur", function () {
            if (!this.value.trim()) return;
            const error = validateEmail(this.value);
            setInputError(this, Boolean(error));
            if (error) showFieldError("emailError", error);
            else clearFieldError("emailError");
        });

        emailInput.addEventListener("input", function () {
            if (this.classList.contains("input-error")) {
                const error = validateEmail(this.value);
                if (!error) {
                    setInputError(this, false);
                    clearFieldError("emailError");
                }
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "");
            if (value.length > 11) value = value.substring(0, 11);
            this.value = value;
            fullPhoneNumber.value = toPhInternational(value);

            if (this.classList.contains("input-error")) {
                const error = validatePhone(value);
                if (!error) {
                    setInputError(this, false);
                    clearFieldError("phoneError");
                }
            }
        });

        phoneInput.addEventListener("blur", function () {
            if (!this.value.trim()) return;
            const error = validatePhone(this.value);
            setInputError(this, Boolean(error));
            if (error) showFieldError("phoneError", error);
            else clearFieldError("phoneError");
        });
    }

    // ---- Branch selection → filter services + unlock step 3 ----

    function renderReasonOptions(branch) {
        if (!reasonOptions) return;
        reasonOptions.innerHTML = "";

        const services = servicesByBranch[branch] || [];
        services.forEach(function (service) {
            const p = document.createElement("p");
            p.dataset.value = service;
            p.textContent = service;
            p.addEventListener("click", function () {
                reasonText.textContent = service;
                selectedReason.value = service;
                reasonOptions.classList.remove("show");
                clearFieldError("reasonError");
                if (reasonBtn) reasonBtn.classList.remove("input-error");
            });
            reasonOptions.appendChild(p);
        });
    }

    const locationRadios = document.querySelectorAll("input[name='location']");
    locationRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            selectedBranch = this.value;
            clearFieldError("locationError");

            // Reset reason when branch changes
            if (reasonText) reasonText.textContent = "Select reason";
            if (selectedReason) selectedReason.value = "";
            if (reasonBtn) reasonBtn.classList.remove("input-error");

            renderReasonOptions(selectedBranch);
            updateStepLocks();
        });
    });

    // ---- Calendar ----

    function formatDateForDatabase(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function convertTo24Hour(timeText) {
        const parts = timeText.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

        if (!parts) {
            return timeText;
        }

        let hour = parseInt(parts[1], 10);
        const minute = parts[2];
        const period = parts[3].toUpperCase();

        if (period === "PM" && hour !== 12) {
            hour += 12;
        }

        if (period === "AM" && hour === 12) {
            hour = 0;
        }

        return `${String(hour).padStart(2, "0")}:${minute}:00`;
    }

    function renderCalendar() {
        if (!calendarDays || !monthYear) return;

        calendarDays.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement("button");

            emptyDay.type = "button";
            emptyDay.className = "day empty";

            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayButton = document.createElement("button");

            const dateValue = new Date(year, month, day);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            dateValue.setHours(0, 0, 0, 0);

            dayButton.type = "button";
            dayButton.className = "day";
            dayButton.textContent = day;

            if (dateValue < today) {
                dayButton.classList.add("disabled");
                dayButton.disabled = true;
            }

            if (
                selectedDate &&
                dateValue.toDateString() === selectedDate.toDateString()
            ) {
                dayButton.classList.add("active");
            }

            dayButton.addEventListener("click", function () {
                if (dateValue < today) return;

                selectedDate = dateValue;
                selectedTime = null;
                selectedTime24 = null;

                const readableDate = selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                });

                summaryDate.textContent = readableDate;
                summaryTime.textContent = "No time selected";

                appointmentDateInput.value = formatDateForDatabase(selectedDate);
                appointmentTimeInput.value = "";

                clearFieldError("timeError");
                clearFieldError("timeSubmitError");

                updateStepLocks();
                renderCalendar();
                renderTimeSlots();
            });

            calendarDays.appendChild(dayButton);
        }
    }

    function renderTimeSlots() {
        if (!timeSlots) return;

        timeSlots.innerHTML = "";

        if (!selectedDate) {
            timeSlots.innerHTML = `
                <div class="empty-time-message">
                    Please select a date first.
                </div>
            `;
            return;
        }

        const slots = [
            "10:00 AM",
            "10:30 AM",
            "11:00 AM",
            "11:30 AM",
            "12:00 PM",
            "1:30 PM",
            "2:00 PM",
            "2:30 PM",
            "3:00 PM",
            "3:30 PM",
            "4:00 PM",
            "4:30 PM",
            "5:00 PM",
            "5:30 PM",
            "6:00 PM",
            "6:30 PM"
        ];

        slots.forEach(function (slot) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "time-slot";
            button.textContent = slot;

            if (slot === selectedTime) {
                button.classList.add("active");
            }

            button.addEventListener("click", function () {
                selectedTime = slot;
                selectedTime24 = convertTo24Hour(slot);

                summaryTime.textContent = slot;
                appointmentTimeInput.value = selectedTime24;

                clearFieldError("timeError");
                clearFieldError("timeSubmitError");

                renderTimeSlots();
            });

            timeSlots.appendChild(button);
        });
    }

    if (prevMonth) {
        prevMonth.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // ---- Reason dropdown ----

    if (reasonBtn && reasonOptions) {
        reasonBtn.addEventListener("click", function () {
            reasonOptions.classList.toggle("show");
        });
    }

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".custom-select") && reasonOptions) {
            reasonOptions.classList.remove("show");
        }
    });

    // ---- Form submission ----

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            fullPhoneNumber.value = toPhInternational(phoneInput.value.trim());

            const selectedLocation = document.querySelector(
                "input[name='location']:checked"
            );

            let hasError = false;

            // Validate Full Name
            const nameError = validateFullName(patientName.value);
            setInputError(patientName, Boolean(nameError));
            if (nameError) {
                showFieldError("nameError", nameError);
                hasError = true;
            } else {
                clearFieldError("nameError");
            }

            // Validate Email
            const emailError = validateEmail(emailInput.value);
            setInputError(emailInput, Boolean(emailError));
            if (emailError) {
                showFieldError("emailError", emailError);
                hasError = true;
            } else {
                clearFieldError("emailError");
            }

            // Validate Phone
            const phoneError = validatePhone(phoneInput.value);
            setInputError(phoneInput, Boolean(phoneError));
            if (phoneError) {
                showFieldError("phoneError", phoneError);
                hasError = true;
            } else {
                clearFieldError("phoneError");
            }

            // Validate Location
            if (!selectedLocation) {
                showFieldError("locationError", "Please select your preferred branch.");
                hasError = true;
            } else {
                clearFieldError("locationError");
            }

            // Validate Reason
            if (!selectedReason.value || reasonText.textContent === "Select reason") {
                showFieldError("reasonError", "Please select a reason for booking.");
                if (reasonBtn) reasonBtn.classList.add("input-error");
                hasError = true;
            } else {
                clearFieldError("reasonError");
                if (reasonBtn) reasonBtn.classList.remove("input-error");
            }

            // Validate Date (step 1)
            if (!selectedDate || !appointmentDateInput.value) {
                hasError = true;
            }

            // Validate Time (step 3)
            if (!selectedTime || !appointmentTimeInput.value) {
                showFieldError("timeSubmitError", "Please select your appointment time in Step 3.");
                hasError = true;
            } else {
                clearFieldError("timeSubmitError");
            }

            if (hasError) return;

            const appointmentData = {
                appointmentDate: appointmentDateInput.value,
                appointmentTime: appointmentTimeInput.value,
                durationMinutes: Number(durationMinutesInput.value) || 30,
                fullName: patientName.value.trim(),
                email: emailInput.value.trim(),
                phoneNumber: fullPhoneNumber.value || phoneInput.value.trim(),
                location: selectedLocation.value,
                reasonForBooking: selectedReason.value
            };

            const submitButton = document.querySelector(".schedule-btn");

            submitButton.disabled = true;
            submitButton.textContent = "Scheduling...";

            try {
                const response = await fetch(`${API_BASE_URL}/api/website/saveAppointment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(appointmentData)
                });

                const result = await response.json();

                alert(result.message || "Appointment request processed.");

                if (!response.ok || !result.success) {
                    return;
                }

                appointmentForm.reset();

                selectedDate = null;
                selectedTime = null;
                selectedTime24 = null;
                selectedBranch = null;

                summaryDate.textContent = "No date selected";
                summaryTime.textContent = "No time selected";

                appointmentDateInput.value = "";
                appointmentTimeInput.value = "";
                durationMinutesInput.value = "30";

                reasonText.textContent = "Select reason";
                selectedReason.value = "";
                if (reasonOptions) reasonOptions.innerHTML = "";

                ["nameError", "emailError", "phoneError", "locationError", "reasonError", "timeError", "timeSubmitError"].forEach(clearFieldError);
                [patientName, emailInput, phoneInput].forEach(function (el) { setInputError(el, false); });
                if (reasonBtn) reasonBtn.classList.remove("input-error");

                updateStepLocks();
                renderCalendar();
                renderTimeSlots();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            } catch (error) {
                console.error("Appointment submit error:", error);

                alert(
                    "Something went wrong while submitting your appointment request."
                );
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Schedule Appointment";
            }
        });
    }

    updateStepLocks();
    renderCalendar();
    renderTimeSlots();
});