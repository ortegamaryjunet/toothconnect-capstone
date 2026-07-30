const API_BASE_URL = (() => {
    const PROD_API = "https://api.smileempressdentalhub.com";
    try {
        const params = new URLSearchParams(window.location.search || "");
        const override = params.get("apiBase") || window.__TOOTHCONNECT_API_BASE_URL__;
        if (override) return String(override).replace(/\/+$/, "");

        const hostname = String(window.location.hostname || "").toLowerCase();
        const port = String(window.location.port || "");

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            // If the website is being served by the backend itself, same-origin works.
            if (port === "4000") return window.location.origin;
            // Otherwise (e.g. Live Server on :5500), point to local backend API.
            return "http://localhost:4000";
        }
    } catch (_) { /* ignore */ }
    return PROD_API;
})();

let cachedServices = null;
let servicesLoading = true;
let servicesLoadFailed = false;

function normalizeBookingBranch(value) {
    return String(value || "")
        .trim()
        .replace(/ Branch$/i, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
}

function getBookingServiceName(service) {
    return typeof service === "string" ? service : String(service && service.name ? service.name : "");
}

function serviceMatchesSelectedBranch(service, branch) {
    if (!branch || typeof service === "string") return true;
    const selected = normalizeBookingBranch(branch);
    const branchKeys = Array.isArray(service.available_branch_keys) ? service.available_branch_keys : [];
    const branchNames = Array.isArray(service.available_branch_names) ? service.available_branch_names : [];
    const candidates = branchKeys.length > 0
        ? branchKeys
        : branchNames.map(normalizeBookingBranch);
    if (candidates.length === 0) return true;
    return candidates.some(function (branchName) {
        const candidate = normalizeBookingBranch(branchName);
        return candidate === selected || candidate.includes(selected) || selected.includes(candidate);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Layout tweak:
    // - Ensure Step 1 (form-card) is the left column
    // - Ensure Step 2 (calendar-card) is the right column
    // - Move Step 3 (time-card) below both columns
    try {
        const bookingLayout = document.querySelector(".booking-layout");
        if (bookingLayout) {
            const formCard = bookingLayout.querySelector(".form-card");
            const calendarCard = bookingLayout.querySelector(".calendar-card");
            const timeCard =
                bookingLayout.querySelector('[data-move="step3"]') ||
                bookingLayout.querySelector(".time-card") ||
                document.querySelector(".calendar-card .time-card");

            if (timeCard) timeCard.classList.add("time-card-wide");

            if (formCard) bookingLayout.appendChild(formCard);
            if (calendarCard) bookingLayout.appendChild(calendarCard);
            if (timeCard) bookingLayout.appendChild(timeCard);
        }
    } catch (_) { /* ignore */ }

    const messageModal = document.getElementById("messageModal");
    const messageTitle = document.getElementById("messageTitle");
    const messageText  = document.getElementById("messageText");
    const messageIcon  = document.getElementById("messageIcon");
    const messageBtn   = document.getElementById("messageBtn");

    function showMessage(title, text, type) {
        messageTitle.textContent = title;
        messageText.textContent  = text;
        if (type === "success") {
            messageIcon.innerHTML        = '<i class="fa-solid fa-circle-check"></i>';
            messageIcon.style.background = "#dcfce7";
            messageIcon.style.color      = "#16a34a";
        } else {
            messageIcon.innerHTML        = '<i class="fa-solid fa-circle-exclamation"></i>';
            messageIcon.style.background = "#fee2e2";
            messageIcon.style.color      = "#dc2626";
        }
        messageModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeMessage() {
        messageModal.classList.remove("show");
        document.body.style.overflow = "";
    }

    if (messageBtn)  messageBtn.addEventListener("click",  closeMessage);
    if (messageModal) {
        messageModal.addEventListener("click", function (e) {
            if (e.target === messageModal) closeMessage();
        });
    }

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
    const phoneCountry = document.getElementById("phoneCountry");

    const step2Notice = document.getElementById("step2Notice");
    const step2Content = document.getElementById("step2Content");
    const stepDateNotice = document.getElementById("stepDateNotice");
    const step3Notice = document.getElementById("step3Notice");
    const step3Content = document.getElementById("step3Content");

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedTime24 = null;
    let selectedBranch = null;
    let currentBookedSlots = [];
    let currentOperatingHours = null;
    let currentAvailableSlots = null;
    let currentAvailableDays = null; // array of YYYY-MM-DD

    // ---- Step lock management ----

    function isStep1DetailsComplete() {
        const nameOk = !validateFullName(patientName.value);
        const emailOk = !validateEmail(emailInput.value);
        const phoneOk = !validatePhone(
            phoneInput.value,
            phoneCountry.value
        );

        const selectedLocation = document.querySelector("input[name='location']:checked");
        const locationOk = Boolean(selectedLocation && selectedLocation.value);
        const reasonOk = Boolean(selectedReason && selectedReason.value && reasonText.textContent !== "Select reason");

        return nameOk && emailOk && phoneOk && locationOk && reasonOk;
    }

    function updateStepLocks() {
        const step1Done = isStep1DetailsComplete();
        const step2Done = selectedDate !== null;

        // Step 1 (details) is always editable; we only guide/lock date selection.
        if (step2Notice) step2Notice.classList.remove("visible");
        if (step2Content) step2Content.classList.remove("locked");

        if (stepDateNotice) stepDateNotice.classList.toggle("visible", !step1Done);

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

    function validatePhone(number, country) {
        const value = number.trim();

        if (!value) {
            return "Phone number is required.";
        }

        const phone = libphonenumber.parsePhoneNumberFromString(
            value,
            country
        );

        if (!phone || !phone.isValid()) {
            return "Please enter a valid phone number.";
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
            updateStepLocks();
        });

        patientName.addEventListener("blur", function () {
            if (!this.value.trim()) return;
            const error = validateFullName(this.value);
            setInputError(this, Boolean(error));
            if (error) showFieldError("nameError", error);
            else clearFieldError("nameError");
            updateStepLocks();
        });
    }

    if (emailInput) {
        emailInput.addEventListener("blur", function () {
            if (!this.value.trim()) return;
            const error = validateEmail(this.value);
            setInputError(this, Boolean(error));
            if (error) showFieldError("emailError", error);
            else clearFieldError("emailError");
            updateStepLocks();
        });

        emailInput.addEventListener("input", function () {
            if (this.classList.contains("input-error")) {
                const error = validateEmail(this.value);
                if (!error) {
                    setInputError(this, false);
                    clearFieldError("emailError");
                }
            }
            updateStepLocks();
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "");
            if (value.length > 11) value = value.substring(0, 11);
            this.value = value;
            fullPhoneNumber.value = toPhInternational(value);

            if (this.classList.contains("input-error")) {
                const error = validatePhone(
                    this.value,
                    phoneCountry.value
                );

                if (!error) {
                    setInputError(this, false);
                    clearFieldError("phoneError");
                }
            }
            updateStepLocks();
        });

        phoneInput.addEventListener("blur", function () {
            if (!this.value.trim()) return;

            const error = validatePhone(
                this.value,
                phoneCountry.value
            );

            setInputError(this, Boolean(error));
            if (error) showFieldError("phoneError", error);
            else clearFieldError("phoneError");
            updateStepLocks();
        });
    }

    if (phoneCountry) {
        libphonenumber.getCountries().forEach((country) => {
            const option = document.createElement("option");

            option.value = country;
            option.textContent =
                `${country} (+${libphonenumber.getCountryCallingCode(country)})`;

            phoneCountry.appendChild(option);
        });

        phoneCountry.value = "PH";
    }

    // ---- Services from DB ----

    async function loadServices() {
        servicesLoading = true;
        servicesLoadFailed = false;
        try {
            // Use centralized clinic services table (not website CMS services)
            // Avoid conditional-cache 304 responses (no body) which break res.json()
            const res = await fetch(API_BASE_URL + "/api/website/clinic-services", { cache: "no-store" });
            if (!res.ok) throw new Error("Unable to load services.");
            const data = await res.json();
            const list = data.services || [];
            if (list.length > 0) {
                cachedServices = list.map(function (s) {
                    return typeof s === "string" ? { name: s, available_branch_names: [] } : s;
                });
            } else {
                cachedServices = [];
                servicesLoadFailed = true;
            }
        } catch (e) {
            cachedServices = [];
            servicesLoadFailed = true;
        } finally {
            servicesLoading = false;
        }
    }

    // ---- Branch selection → filter services + unlock step 3 ----

    function renderReasonOptions() {
        if (!reasonOptions) return;
        reasonOptions.innerHTML = "";

        if (servicesLoading) {
            const p = document.createElement("p");
            p.textContent = "Loading services...";
            p.classList.add("disabled-option");
            reasonOptions.appendChild(p);
            return;
        }

        const services = (Array.isArray(cachedServices) ? cachedServices : []).filter(function (service) {
            return serviceMatchesSelectedBranch(service, selectedBranch);
        });
        if (servicesLoadFailed || services.length === 0) {
            const p = document.createElement("p");
            p.textContent = selectedBranch ? "No services available for this branch." : "Services are temporarily unavailable.";
            p.classList.add("disabled-option");
            reasonOptions.appendChild(p);
            if (reasonText) reasonText.textContent = selectedBranch ? "No services for branch" : "Services unavailable";
            if (selectedReason) selectedReason.value = "";
            if (reasonBtn) reasonBtn.classList.add("input-error");
            showFieldError(
                "reasonError",
                selectedBranch
                    ? "No services are available for the selected branch."
                    : "Services are temporarily unavailable. Please try again later or contact the clinic."
            );
            return;
        }

        services.forEach(function (service) {
            const serviceName = getBookingServiceName(service);
            if (!serviceName) return;
            const p = document.createElement("p");
            p.dataset.value = serviceName;
            p.textContent = serviceName;
            p.addEventListener("click", function () {
                reasonText.textContent = serviceName;
                selectedReason.value = serviceName;
                reasonOptions.classList.remove("show");
                clearFieldError("reasonError");
                if (reasonBtn) reasonBtn.classList.remove("input-error");
                refreshAvailableSlots();
                updateStepLocks();
                refreshAvailableDays();
            });
            reasonOptions.appendChild(p);
        });
    }

    const locationRadios = document.querySelectorAll("input[name='location']");
    locationRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            selectedBranch = this.value;
            clearFieldError("locationError");

            if (this.checked) {
                document
                    .querySelectorAll(".location-option")
                    .forEach(el => el.classList.remove("input-error"));
            }

            // Reset reason when branch changes
            if (reasonText) reasonText.textContent = "Select reason";
            if (selectedReason) selectedReason.value = "";
            if (reasonBtn) reasonBtn.classList.remove("input-error");

            renderReasonOptions();
            updateStepLocks();
            refreshBookedSlots();
            refreshAvailableSlots();
            refreshAvailableDays();
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

    function parseOperatingHoursToMinutes(operatingHours) {
        const raw = String(operatingHours || "").trim();
        const m = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) return null;

        function toMinutes(hh, mm, period) {
            let h = parseInt(hh, 10);
            const mins = parseInt(mm, 10);
            const p = String(period || "").toUpperCase();
            if (p === "PM" && h !== 12) h += 12;
            if (p === "AM" && h === 12) h = 0;
            return h * 60 + mins;
        }

        const startMin = toMinutes(m[1], m[2], m[3]);
        const endMin = toMinutes(m[4], m[5], m[6]);
        if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) return null;
        return { startMin, endMin };
    }

    function minutesTo12hLabel(totalMinutes) {
        const h24 = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const period = h24 >= 12 ? "PM" : "AM";
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        return `${h12}:${String(m).padStart(2, "0")} ${period}`;
    }

    function generateSlotsFromOperatingHours(operatingHours) {
        const parsed = parseOperatingHoursToMinutes(operatingHours);
        if (!parsed) return null;

        const lunchStart = 12 * 60;
        const lunchEnd = 13 * 60 + 30;

        const slots = [];
        for (let t = parsed.startMin; t + 30 <= parsed.endMin; t += 30) {
            if (t >= lunchStart && t < lunchEnd) continue;
            slots.push(minutesTo12hLabel(t));
        }
        return slots;
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

            const dateKey = formatDateForDatabase(dateValue);
            const detailsComplete = isStep1DetailsComplete();
            const dayAllowed = !currentAvailableDays || currentAvailableDays.indexOf(dateKey) !== -1;

            if (!detailsComplete || !dayAllowed) {
                dayButton.classList.add("disabled");
                dayButton.disabled = true;
            }

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
                if (!isStep1DetailsComplete()) return;
                if (currentAvailableDays && currentAvailableDays.indexOf(dateKey) === -1) return;

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
                refreshBookedSlots();
                refreshAvailableSlots();
            });

            calendarDays.appendChild(dayButton);
        }
    }

    function renderTimeSlots() {
        if (!timeSlots) return;

        timeSlots.innerHTML = "";

        if (!selectedDate) {
            timeSlots.innerHTML = '<div class="empty-time-message">Please select a date first.</div>';
            return;
        }

        const now = new Date();
        const selectedDateKey = formatDateForDatabase(selectedDate);
        const todayKey = formatDateForDatabase(new Date());
        const isToday = selectedDateKey === todayKey;
        const isPastDay = selectedDateKey < todayKey;

        const slots =
            generateSlotsFromOperatingHours(currentOperatingHours) || [
                "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
                "1:30 PM",  "2:00 PM",  "2:30 PM",  "3:00 PM",  "3:30 PM",
                "4:00 PM",  "4:30 PM",  "5:00 PM",  "5:30 PM",  "6:00 PM",  "6:30 PM"
            ];

        slots.forEach(function (slot) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "time-slot";
            button.textContent = slot;

            const slot24 = convertTo24Hour(slot);
            const availabilityKnown = Array.isArray(currentAvailableSlots);
            const isBooked = !availabilityKnown && currentBookedSlots.some(function (b) {
                return String(b).slice(0, 5) === slot24.slice(0, 5);
            });

            const isAvailable = !availabilityKnown || currentAvailableSlots.some(function (a) {
                return String(a).slice(0, 5) === slot24.slice(0, 5);
            });

            let isPastTime = false;
            if (isPastDay) {
                isPastTime = true;
            } else if (isToday) {
                const parts = slot24.split(":").map(Number);
                const hh = parts[0] || 0;
                const mm = parts[1] || 0;
                const slotDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
                isPastTime = slotDateTime.getTime() <= now.getTime();
            }

            if (isBooked || isPastTime || !isAvailable) {
                button.classList.add("disabled");
                button.disabled = true;
            } else {
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
            }

            timeSlots.appendChild(button);
        });
    }

    async function refreshBookedSlots() {
        if (!selectedDate || !selectedBranch) {
            currentBookedSlots = [];
            currentOperatingHours = null;
            renderTimeSlots();
            return;
        }
        try {
            const dateStr = formatDateForDatabase(selectedDate);
            const res = await fetch(
                API_BASE_URL + "/api/website/bookedSlots" +
                "?date=" + encodeURIComponent(dateStr) +
                "&branch=" + encodeURIComponent(selectedBranch)
            );
            if (res.ok) {
                const data = await res.json();
                currentBookedSlots = (data && data.bookedSlots) ? data.bookedSlots : [];
                currentOperatingHours = (data && data.operatingHours) ? data.operatingHours : null;
            } else {
                currentBookedSlots = [];
                currentOperatingHours = null;
            }
        } catch (e) {
            currentBookedSlots = [];
            currentOperatingHours = null;
        }
        renderTimeSlots();
    }

    async function refreshAvailableSlots() {
        currentAvailableSlots = null;

        if (!selectedDate || !selectedBranch || !selectedReason || !selectedReason.value) {
            renderTimeSlots();
            return;
        }

        try {
            const dateStr = formatDateForDatabase(selectedDate);
            const res = await fetch(
                API_BASE_URL + "/api/website/availableSlots" +
                "?date=" + encodeURIComponent(dateStr) +
                "&branch=" + encodeURIComponent(selectedBranch) +
                "&service=" + encodeURIComponent(selectedReason.value)
            );
            const data = res.ok ? await res.json() : null;
            currentAvailableSlots = data && Array.isArray(data.slots) ? data.slots : [];
        } catch (e) {
            currentAvailableSlots = null;
        }

        if (selectedTime24 && currentAvailableSlots && currentAvailableSlots.length > 0) {
            const ok = currentAvailableSlots.some(function (a) {
                return String(a).slice(0, 5) === String(selectedTime24).slice(0, 5);
            });
            if (!ok) {
                selectedTime = null;
                selectedTime24 = null;
                if (summaryTime) summaryTime.textContent = "No time selected";
                if (appointmentTimeInput) appointmentTimeInput.value = "";
            }
        }

        renderTimeSlots();
    }

    function monthKeyFromDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
    }

    async function refreshAvailableDays() {
        currentAvailableDays = null;

        if (!selectedBranch || !selectedReason || !selectedReason.value) {
            renderCalendar();
            return;
        }

        try {
            const monthKey = monthKeyFromDate(currentDate);
            const res = await fetch(
                API_BASE_URL + "/api/website/availableDays" +
                "?month=" + encodeURIComponent(monthKey) +
                "&branch=" + encodeURIComponent(selectedBranch) +
                "&service=" + encodeURIComponent(selectedReason.value)
            );
            if (!res.ok) {
                currentAvailableDays = [];
            } else {
                const data = await res.json();
                currentAvailableDays = data && Array.isArray(data.days) ? data.days : [];
            }
        } catch (e) {
            // When branch+service are selected, prefer disabling all dates rather than enabling everything
            // if the availability API fails.
            currentAvailableDays = [];
        }

        renderCalendar();
    }

    if (prevMonth) {
        prevMonth.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
            refreshAvailableDays();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
            refreshAvailableDays();
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
            const phoneError = validatePhone(
                phoneInput.value,
                phoneCountry.value
            );

            const parsedPhone =
                libphonenumber.parsePhoneNumberFromString(
                    phoneInput.value.trim(),
                    phoneCountry.value
                );

            const internationalPhoneNumber = parsedPhone
                ? parsedPhone.number
                : phoneInput.value.trim();

            fullPhoneNumber.value = internationalPhoneNumber;

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
            if (servicesLoading) {
                showFieldError("reasonError", "Services are still loading. Please wait a moment.");
                if (reasonBtn) reasonBtn.classList.add("input-error");
                hasError = true;
            } else if (servicesLoadFailed || !Array.isArray(cachedServices) || cachedServices.length === 0) {
                showFieldError("reasonError", "Services are temporarily unavailable. Please try again later or contact the clinic.");
                if (reasonBtn) reasonBtn.classList.add("input-error");
                hasError = true;
            } else if (!selectedReason.value || reasonText.textContent === "Select reason") {
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

            if (hasError) {
                showMessage(
                    "Required Fields",
                    "Please complete all required fields before scheduling your appointment.",
                    "error"
                );
                return;
            }

            const appointmentData = {
                appointmentDate: appointmentDateInput.value,
                appointmentTime: appointmentTimeInput.value,
                durationMinutes: Number(durationMinutesInput.value) || 30,
                fullName: patientName.value.trim(),
                email: emailInput.value.trim(),
                phoneNumber: fullPhoneNumber.value,
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

                showMessage(
                    result.messageTitle || "Appointment Status",
                    result.message || "Appointment request processed.",
                    result.success ? "success" : "error"
                );

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

                showMessage(
                    "Something Went Wrong",
                    "Something went wrong while submitting your appointment request.",
                    "error"
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
    loadServices().then(function () {
        renderReasonOptions();
        refreshAvailableDays();
    });
});
