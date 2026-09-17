const API_BASE_URL = (() => {
    const PROD_API = "https://api.smileempressdentalhub.com";

    try {
        const params = new URLSearchParams(window.location.search || "");
        const override = params.get("apiBase") || window.__TOOTHCONNECT_API_BASE_URL__;

        if (override) {
            return String(override).replace(/\/+$/, "");
        }

        const hostname = String(window.location.hostname || "").toLowerCase();
        const port = String(window.location.port || "");

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            if (port === "4000") {
                return window.location.origin;
            }

            return "http://localhost:4000";
        }
    } catch (_) {
        /* ignore */
    }

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
    return typeof service === "string"
        ? service
        : String(service && service.name ? service.name : "");
}

function serviceMatchesSelectedBranch(service, branch) {
    if (!branch || typeof service === "string") {
        return true;
    }

    const selected = normalizeBookingBranch(branch);

    const branchKeys = Array.isArray(service.available_branch_keys)
        ? service.available_branch_keys
        : [];

    const branchNames = Array.isArray(service.available_branch_names)
        ? service.available_branch_names
        : [];

    const candidates = branchKeys.length > 0
        ? branchKeys
        : branchNames.map(normalizeBookingBranch);

    if (candidates.length === 0) {
        return true;
    }

    return candidates.some(function (branchName) {
        const candidate = normalizeBookingBranch(branchName);

        return (
            candidate === selected ||
            candidate.includes(selected) ||
            selected.includes(candidate)
        );
    });
}

document.addEventListener("DOMContentLoaded", function () {
    try {
        const bookingLayout = document.querySelector(".booking-layout");

        if (bookingLayout) {
            const formCard = bookingLayout.querySelector(".form-card");
            const calendarCard = bookingLayout.querySelector(".calendar-card");

            const timeCard =
                bookingLayout.querySelector('[data-move="step3"]') ||
                bookingLayout.querySelector(".time-card") ||
                document.querySelector(".calendar-card .time-card");

            if (timeCard) {
                timeCard.classList.add("time-card-wide");
            }

            if (formCard) {
                bookingLayout.appendChild(formCard);
            }

            if (calendarCard) {
                bookingLayout.appendChild(calendarCard);
            }

            if (timeCard) {
                bookingLayout.appendChild(timeCard);
            }
        }
    } catch (_) {
        /* ignore */
    }

    const messageModal = document.getElementById("messageModal");
    const messageTitle = document.getElementById("messageTitle");
    const messageText = document.getElementById("messageText");
    const messageIcon = document.getElementById("messageIcon");
    const messageBtn = document.getElementById("messageBtn");
    const toothLoading = document.getElementById("toothLoading");

    function showToothLoading() {
        toothLoading.classList.add("show");
        toothLoading.setAttribute("aria-hidden", "false");
    }

    function hideToothLoading() {
        toothLoading.classList.remove("show");
        toothLoading.setAttribute("aria-hidden", "true");
    }

    function showMessage(title, text, type) {
        if (messageTitle) {
            messageTitle.textContent = title;
        }

        if (messageText) {
            messageText.textContent = text;
        }

        if (messageIcon) {
            if (type === "success") {
                messageIcon.innerHTML =
                    '<i class="fa-solid fa-circle-check"></i>';

                messageIcon.style.background = "#dcfce7";
                messageIcon.style.color = "#16a34a";
            } else {
                messageIcon.innerHTML =
                    '<i class="fa-solid fa-circle-exclamation"></i>';

                messageIcon.style.background = "#fee2e2";
                messageIcon.style.color = "#dc2626";
            }
        }

        if (messageModal) {
            messageModal.classList.add("show");
        }

        document.body.style.overflow = "hidden";
    }

    function closeMessage() {
        if (messageModal) {
            messageModal.classList.remove("show");
        }

        document.body.style.overflow = "";
    }

    if (messageBtn) {
        messageBtn.addEventListener("click", closeMessage);
    }

    if (messageModal) {
        messageModal.addEventListener("click", function (event) {
            if (event.target === messageModal) {
                closeMessage();
            }
        });
    }

    const closeMessageModal = document.getElementById("closeMessageModal");

    if (closeMessageModal) {
        closeMessageModal.addEventListener("click", closeMessage);
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
    const appointmentDateInput =
        document.getElementById("appointmentDate");
    const appointmentTimeInput =
        document.getElementById("appointmentTime");
    const durationMinutesInput =
        document.getElementById("durationMinutes");

    const patientName = document.getElementById("patientName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phoneNumber");
    const fullPhoneNumber =
        document.getElementById("fullPhoneNumber");
    const phoneCountry = document.getElementById("phoneCountry");
    const phoneLib = window.libphonenumber;

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
    let currentAvailableDays = null;

    function isStep1DetailsComplete() {
        const nameOk = patientName
            ? !validateFullName(patientName.value)
            : false;

        const emailOk = emailInput
            ? !validateEmail(emailInput.value)
            : false;

        const phoneOk = phoneInput
            ? !validatePhone(
                phoneInput.value,
                phoneCountry?.value || "PH"
            )
            : false;

        const selectedLocation = document.querySelector(
            "input[name='location']:checked"
        );

        const locationOk = Boolean(
            selectedLocation && selectedLocation.value
        );

        const reasonOk = Boolean(
            selectedReason &&
            selectedReason.value &&
            reasonText &&
            reasonText.textContent !== "Select reason"
        );

        return nameOk && emailOk && phoneOk && locationOk && reasonOk;
    }

    function updateStepLocks() {
        const step1Done = isStep1DetailsComplete();
        const step2Done = selectedDate !== null;

        if (step2Notice) {
            step2Notice.classList.remove("visible");
        }

        if (step2Content) {
            step2Content.classList.remove("locked");
        }

        if (stepDateNotice) {
            stepDateNotice.classList.toggle("visible", !step1Done);
        }

        if (step3Notice) {
            step3Notice.classList.toggle("visible", !step2Done);
        }

        if (step3Content) {
            step3Content.classList.toggle("locked", !step2Done);
        }
    }

    function showFieldError(errorId, message) {
        const element = document.getElementById(errorId);

        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.add("active");
    }

    function clearFieldError(errorId) {
        const element = document.getElementById(errorId);

        if (!element) {
            return;
        }

        element.textContent = "";
        element.classList.remove("active");
    }

    function setInputError(input, hasError) {
        if (!input) {
            return;
        }

        if (hasError) {
            input.classList.add("input-error");
        } else {
            input.classList.remove("input-error");
        }
    }

    function validateFullName(value) {
        const name = String(value || "").trim();

        if (!name) {
            return "Full name is required.";
        }

        if (/[0-9]/.test(name)) {
            return "Name must not contain numbers.";
        }

        if (/[^a-zA-ZÀ-ɏ\s]/.test(name)) {
            return "Name must not contain special characters.";
        }

        const words = name
            .split(/\s+/)
            .filter(function (word) {
                return word.length > 0;
            });

        if (words.length < 2) {
            return "Please enter both your first and last name.";
        }

        return "";
    }

    function validateEmail(value) {
        const email = String(value || "").trim();

        if (!email) {
            return "Email address is required.";
        }

        const emailRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return "Please enter a valid email address.";
        }

        return "";
    }

    function validatePhone(number, country) {
        const value = String(number || "").trim();

        if (!value) {
            return "Phone number is required.";
        }

        const phone = parsePhoneNumber(value, country);

        const isValid = phone
            ? phone.isValid()
            : isFallbackValidPhone(value, country);

        if (!isValid) {
            return "Please enter a valid phone number.";
        }

        return "";
    }

    function parsePhoneNumber(value, country) {
        if (phoneLib?.parsePhoneNumberFromString) {
            return phoneLib.parsePhoneNumberFromString(
                value,
                country
            );
        }

        return null;
    }

    function isFallbackValidPhone(value, country) {
        const digits = String(value || "").replace(/\D/g, "");

        if (country === "PH") {
            return (
                /^09\d{9}$/.test(digits) ||
                /^9\d{9}$/.test(digits) ||
                /^639\d{9}$/.test(digits)
            );
        }

        return digits.length >= 7 && digits.length <= 15;
    }

    function toInternationalPhone(value, country) {
        const phone = parsePhoneNumber(value, country);

        if (phone?.isValid()) {
            return phone.number;
        }

        const digits = String(value || "").replace(/\D/g, "");

        if (country === "PH") {
            if (/^09\d{9}$/.test(digits)) {
                return `+63${digits.slice(1)}`;
            }

            if (/^9\d{9}$/.test(digits)) {
                return `+63${digits}`;
            }

            if (/^639\d{9}$/.test(digits)) {
                return `+${digits}`;
            }
        }

        return String(value || "").trim();
    }

    function toPhInternational(localNumber) {
        const digits = String(localNumber || "").replace(/\D/g, "");

        if (/^09\d{9}$/.test(digits)) {
            return "+63" + digits.substring(1);
        }

        return String(localNumber || "");
    }

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
            if (!this.value.trim()) {
                return;
            }

            const error = validateFullName(this.value);

            setInputError(this, Boolean(error));

            if (error) {
                showFieldError("nameError", error);
            } else {
                clearFieldError("nameError");
            }

            updateStepLocks();
        });
    }

    if (emailInput) {
        emailInput.addEventListener("blur", function () {
            if (!this.value.trim()) {
                return;
            }

            const error = validateEmail(this.value);

            setInputError(this, Boolean(error));

            if (error) {
                showFieldError("emailError", error);
            } else {
                clearFieldError("emailError");
            }

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

            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            this.value = value;

            if (fullPhoneNumber) {
                fullPhoneNumber.value = toPhInternational(value);
            }

            if (this.classList.contains("input-error")) {
                const error = validatePhone(
                    this.value,
                    phoneCountry?.value || "PH"
                );

                if (!error) {
                    setInputError(this, false);
                    clearFieldError("phoneError");
                }
            }

            updateStepLocks();
        });

        phoneInput.addEventListener("blur", function () {
            if (!this.value.trim()) {
                return;
            }

            const error = validatePhone(
                this.value,
                phoneCountry?.value || "PH"
            );

            setInputError(this, Boolean(error));

            if (error) {
                showFieldError("phoneError", error);
            } else {
                clearFieldError("phoneError");
            }

            updateStepLocks();
        });
    }

    if (phoneCountry && phoneLib?.getCountries) {
        phoneLib.getCountries().forEach(function (country) {
            const option = document.createElement("option");

            option.value = country;
            option.textContent =
                `${country} (+${phoneLib.getCountryCallingCode(country)})`;

            phoneCountry.appendChild(option);
        });

        phoneCountry.value = "PH";
    } else if (phoneCountry) {
        const option = document.createElement("option");

        option.value = "PH";
        option.textContent = "PH (+63)";
        option.selected = true;

        phoneCountry.appendChild(option);
    }

    async function loadServices() {
        servicesLoading = true;
        servicesLoadFailed = false;

        try {
            const res = await fetch(
                API_BASE_URL + "/api/website/clinic-services",
                {
                    cache: "no-store"
                }
            );

            if (!res.ok) {
                throw new Error("Unable to load services.");
            }

            const data = await res.json();
            const list = Array.isArray(data.services)
                ? data.services
                : [];

            if (list.length > 0) {
                cachedServices = list.map(function (service) {
                    if (typeof service === "string") {
                        return {
                            name: service,
                            available_branch_names: []
                        };
                    }

                    return service;
                });
            } else {
                cachedServices = [];
                servicesLoadFailed = true;
            }
        } catch (error) {
            console.error("Load services error:", error);

            cachedServices = [];
            servicesLoadFailed = true;
        } finally {
            servicesLoading = false;
        }
    }

    async function loadBranches() {
        const locationGrid =
            document.getElementById("locationGrid");

        if (!locationGrid) {
            return;
        }

        locationGrid.innerHTML = "";

        try {
            const res = await fetch(
                API_BASE_URL + "/api/website/branches",
                {
                    cache: "no-store"
                }
            );

            if (!res.ok) {
                throw new Error("Unable to load branches.");
            }

            const data = await res.json();

            const branches = Array.isArray(data.branches)
                ? data.branches
                : [];

            if (branches.length === 0) {
                locationGrid.innerHTML = `
                    <p class="disabled-option">No branches available.</p>
                `;

                return;
            }

            branches.forEach(function (branch) {
                const label = document.createElement("label");
                label.className = "location-option";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "location";
                input.value =
                    branch.name ||
                    branch.branch_name ||
                    branch.location_name ||
                    "";

                const radioDesign = document.createElement("span");
                radioDesign.className = "radio-design";

                const content = document.createElement("div");
                content.className = "branch-content";

                const strong = document.createElement("strong");

                const branchName =
                    branch.name ||
                    branch.branch_name ||
                    branch.location_name ||
                    "Branch";

                const branchLocation =
                    branch.location ||
                    branch.address ||
                    branch.branch_location ||
                    branch.branch_address ||
                    branch.clinic_location ||
                    "";

                strong.textContent = branchName;

                const location = document.createElement("div");
                location.className = "branch-location";
                location.textContent = branchLocation
                    ? branchLocation + " City Branch"
                    : "Location Unavailable";

                content.appendChild(strong);
                content.appendChild(location);

                label.appendChild(input);
                label.appendChild(radioDesign);
                label.appendChild(content);

                locationGrid.appendChild(label);

                input.addEventListener("change", function () {
                    selectedBranch = this.value;

                    clearFieldError("locationError");

                    document
                        .querySelectorAll(".location-option")
                        .forEach(function (element) {
                            element.classList.remove("input-error");
                        });

                    if (reasonText) {
                        reasonText.textContent = "Select reason";
                    }

                    if (selectedReason) {
                        selectedReason.value = "";
                    }

                    if (reasonBtn) {
                        reasonBtn.classList.remove("input-error");
                    }

                    currentAvailableSlots = null;
                    currentAvailableDays = null;
                    selectedDate = null;
                    selectedTime = null;
                    selectedTime24 = null;

                    if (summaryDate) {
                        summaryDate.textContent = "No date selected";
                    }

                    if (summaryTime) {
                        summaryTime.textContent = "No time selected";
                    }

                    if (appointmentDateInput) {
                        appointmentDateInput.value = "";
                    }

                    if (appointmentTimeInput) {
                        appointmentTimeInput.value = "";
                    }

                    renderReasonOptions();
                    updateStepLocks();
                    refreshBookedSlots();
                    refreshAvailableSlots();
                    refreshAvailableDays();
                    renderCalendar();
                    renderTimeSlots();
                });
            });
        } catch (error) {
            console.error("Load branches error:", error);

            locationGrid.innerHTML = `
                <p class="disabled-option">Branches are temporarily unavailable.</p>
            `;
        }
    }

    function renderReasonOptions() {
        if (!reasonOptions) {
            return;
        }

        reasonOptions.innerHTML = "";

        if (servicesLoading) {
            const p = document.createElement("p");

            p.textContent = "Loading services...";
            p.classList.add("disabled-option");

            reasonOptions.appendChild(p);

            return;
        }

        const services = (
            Array.isArray(cachedServices)
                ? cachedServices
                : []
        ).filter(function (service) {
            return serviceMatchesSelectedBranch(
                service,
                selectedBranch
            );
        });

        if (servicesLoadFailed || services.length === 0) {
            const p = document.createElement("p");

            p.textContent = selectedBranch
                ? "No services available for this branch."
                : "Services are temporarily unavailable.";

            p.classList.add("disabled-option");

            reasonOptions.appendChild(p);

            if (reasonText) {
                reasonText.textContent = selectedBranch
                    ? "No services for branch"
                    : "Services unavailable";
            }

            if (selectedReason) {
                selectedReason.value = "";
            }

            if (reasonBtn) {
                reasonBtn.classList.add("input-error");
            }

            showFieldError(
                "reasonError",
                selectedBranch
                    ? "No services are available for the selected branch."
                    : "Services are temporarily unavailable. Please try again later or contact the clinic."
            );

            return;
        }

        services.forEach(function (service) {
            const serviceName =
                getBookingServiceName(service);

            if (!serviceName) {
                return;
            }

            const p = document.createElement("p");

            p.dataset.value = serviceName;
            p.textContent = serviceName;

            p.addEventListener("click", function () {
                reasonText.textContent = serviceName;
                selectedReason.value = serviceName;

                reasonOptions.classList.remove("show");

                clearFieldError("reasonError");

                if (reasonBtn) {
                    reasonBtn.classList.remove("input-error");
                }

                selectedDate = null;
                selectedTime = null;
                selectedTime24 = null;
                currentAvailableSlots = null;
                currentAvailableDays = null;

                if (summaryDate) {
                    summaryDate.textContent = "No date selected";
                }

                if (summaryTime) {
                    summaryTime.textContent = "No time selected";
                }

                if (appointmentDateInput) {
                    appointmentDateInput.value = "";
                }

                if (appointmentTimeInput) {
                    appointmentTimeInput.value = "";
                }

                updateStepLocks();
                refreshAvailableSlots();
                refreshAvailableDays();
                renderCalendar();
                renderTimeSlots();
            });

            reasonOptions.appendChild(p);
        });
    }

    function formatDateForDatabase(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function convertTo24Hour(timeText) {
        const parts = timeText.match(
            /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i
        );

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

        const match = raw.match(
            /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
        );

        if (!match) {
            return null;
        }

        function toMinutes(hour, minute, period) {
            let h = parseInt(hour, 10);
            const mins = parseInt(minute, 10);
            const p = String(period || "").toUpperCase();

            if (p === "PM" && h !== 12) {
                h += 12;
            }

            if (p === "AM" && h === 12) {
                h = 0;
            }

            return h * 60 + mins;
        }

        const startMin = toMinutes(
            match[1],
            match[2],
            match[3]
        );

        const endMin = toMinutes(
            match[4],
            match[5],
            match[6]
        );

        if (
            !Number.isFinite(startMin) ||
            !Number.isFinite(endMin) ||
            endMin <= startMin
        ) {
            return null;
        }

        return {
            startMin,
            endMin
        };
    }

    function minutesTo12hLabel(totalMinutes) {
        const h24 = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const period = h24 >= 12 ? "PM" : "AM";

        let h12 = h24 % 12;

        if (h12 === 0) {
            h12 = 12;
        }

        return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
    }

    function generateSlotsFromOperatingHours(operatingHours) {
        const parsed =
            parseOperatingHoursToMinutes(operatingHours);

        if (!parsed) {
            return null;
        }

        const lunchStart = 12 * 60;
        const lunchEnd = 13 * 60 + 30;

        const slots = [];

        for (
            let time = parsed.startMin;
            time + 30 <= parsed.endMin;
            time += 30
        ) {
            if (
                time >= lunchStart &&
                time < lunchEnd
            ) {
                continue;
            }

            slots.push(minutesTo12hLabel(time));
        }

        return slots;
    }

    function renderCalendar() {
        if (!calendarDays || !monthYear) {
            return;
        }

        calendarDays.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay =
            new Date(year, month, 1).getDay();

        const lastDate =
            new Date(year, month + 1, 0).getDate();

        monthYear.textContent =
            currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });

        for (let i = 0; i < firstDay; i++) {
            const emptyDay =
                document.createElement("button");

            emptyDay.type = "button";
            emptyDay.className = "day empty";

            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayButton =
                document.createElement("button");

            const dateValue =
                new Date(year, month, day);

            const today = new Date();

            today.setHours(0, 0, 0, 0);
            dateValue.setHours(0, 0, 0, 0);

            dayButton.type = "button";
            dayButton.className = "day";
            dayButton.textContent = day;

            const dateKey =
                formatDateForDatabase(dateValue);

            const detailsComplete =
                isStep1DetailsComplete();

            const dayAllowed =
                !currentAvailableDays ||
                currentAvailableDays.indexOf(dateKey) !== -1;

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
                dateValue.toDateString() ===
                    selectedDate.toDateString()
            ) {
                dayButton.classList.add("active");
            }

            dayButton.addEventListener("click", function () {
                if (dateValue < today) {
                    return;
                }

                if (!isStep1DetailsComplete()) {
                    return;
                }

                if (
                    currentAvailableDays &&
                    currentAvailableDays.indexOf(dateKey) === -1
                ) {
                    return;
                }

                selectedDate = dateValue;
                selectedTime = null;
                selectedTime24 = null;

                const readableDate =
                    selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    });

                if (summaryDate) {
                    summaryDate.textContent = readableDate;
                }

                if (summaryTime) {
                    summaryTime.textContent =
                        "No time selected";
                }

                if (appointmentDateInput) {
                    appointmentDateInput.value =
                        formatDateForDatabase(selectedDate);
                }

                if (appointmentTimeInput) {
                    appointmentTimeInput.value = "";
                }

                clearFieldError("dateSubmitError");
                clearFieldError("timeError");

                updateStepLocks();
                renderCalendar();
                refreshBookedSlots();
                refreshAvailableSlots();
            });

            calendarDays.appendChild(dayButton);
        }
    }

    function renderTimeSlots() {
        if (!timeSlots) {
            return;
        }

        timeSlots.innerHTML = "";

        if (!selectedDate) {
            timeSlots.innerHTML = `
                <div class="empty-time-message">Please select a date first.</div>
            `;

            return;
        }

        const now = new Date();

        const selectedDateKey =
            formatDateForDatabase(selectedDate);

        const todayKey =
            formatDateForDatabase(new Date());

        const isToday =
            selectedDateKey === todayKey;

        const isPastDay =
            selectedDateKey < todayKey;

        const slots =
            generateSlotsFromOperatingHours(
                currentOperatingHours
            ) || [
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
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "time-slot";
            button.textContent = slot;

            const slot24 = convertTo24Hour(slot);

            const availabilityKnown =
                Array.isArray(currentAvailableSlots);

            const isBooked =
                !availabilityKnown &&
                currentBookedSlots.some(function (booked) {
                    return (
                        String(booked).slice(0, 5) ===
                        slot24.slice(0, 5)
                    );
                });

            const isAvailable =
                !availabilityKnown ||
                currentAvailableSlots.some(function (available) {
                    return (
                        String(available).slice(0, 5) ===
                        slot24.slice(0, 5)
                    );
                });

            let isPastTime = false;

            if (isPastDay) {
                isPastTime = true;
            } else if (isToday) {
                const parts =
                    slot24.split(":").map(Number);

                const hour = parts[0] || 0;
                const minute = parts[1] || 0;

                const slotDateTime = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    hour,
                    minute,
                    0,
                    0
                );

                isPastTime =
                    slotDateTime.getTime() <= now.getTime();
            }

            if (
                isBooked ||
                isPastTime ||
                !isAvailable
            ) {
                button.classList.add("disabled");
                button.disabled = true;
            } else {
                if (slot === selectedTime) {
                    button.classList.add("active");
                }

                button.addEventListener("click", function () {
                    selectedTime = slot;
                    selectedTime24 =
                        convertTo24Hour(slot);

                    if (summaryTime) {
                        summaryTime.textContent = slot;
                    }

                    if (appointmentTimeInput) {
                        appointmentTimeInput.value =
                            selectedTime24;
                    }

                    clearFieldError("timeError");

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
            const dateStr =
                formatDateForDatabase(selectedDate);

            const res = await fetch(
                API_BASE_URL + "/api/website/bookedSlots" +
                "?date=" +
                encodeURIComponent(dateStr) +
                "&branch=" +
                encodeURIComponent(selectedBranch),
                {
                    cache: "no-store"
                }
            );

            if (res.ok) {
                const data = await res.json();

                currentBookedSlots =
                    data && data.bookedSlots
                        ? data.bookedSlots
                        : [];

                currentOperatingHours =
                    data && data.operatingHours
                        ? data.operatingHours
                        : null;
            } else {
                currentBookedSlots = [];
                currentOperatingHours = null;
            }
        } catch (error) {
            console.error(
                "Refresh booked slots error:",
                error
            );

            currentBookedSlots = [];
            currentOperatingHours = null;
        }

        renderTimeSlots();
    }

    async function refreshAvailableSlots() {
        currentAvailableSlots = null;

        if (
            !selectedDate ||
            !selectedBranch ||
            !selectedReason ||
            !selectedReason.value
        ) {
            renderTimeSlots();
            return;
        }

        try {
            const dateStr =
                formatDateForDatabase(selectedDate);

            const res = await fetch(
                API_BASE_URL + "/api/website/availableSlots" +
                "?date=" +
                encodeURIComponent(dateStr) +
                "&branch=" +
                encodeURIComponent(selectedBranch) +
                "&service=" +
                encodeURIComponent(selectedReason.value),
                {
                    cache: "no-store"
                }
            );

            const data = res.ok
                ? await res.json()
                : null;

            currentAvailableSlots =
                data && Array.isArray(data.slots)
                    ? data.slots
                    : [];
        } catch (error) {
            console.error(
                "Refresh available slots error:",
                error
            );

            currentAvailableSlots = null;
        }

        if (
            selectedTime24 &&
            currentAvailableSlots &&
            currentAvailableSlots.length > 0
        ) {
            const isStillAvailable =
                currentAvailableSlots.some(function (available) {
                    return (
                        String(available).slice(0, 5) ===
                        String(selectedTime24).slice(0, 5)
                    );
                });

            if (!isStillAvailable) {
                selectedTime = null;
                selectedTime24 = null;

                if (summaryTime) {
                    summaryTime.textContent =
                        "No time selected";
                }

                if (appointmentTimeInput) {
                    appointmentTimeInput.value = "";
                }
            }
        }

        renderTimeSlots();
    }

    function monthKeyFromDate(date) {
        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        return `${year}-${month}`;
    }

    async function refreshAvailableDays() {
        currentAvailableDays = null;

        if (
            !selectedBranch ||
            !selectedReason ||
            !selectedReason.value
        ) {
            renderCalendar();
            return;
        }

        try {
            const monthKey =
                monthKeyFromDate(currentDate);

            const res = await fetch(
                API_BASE_URL + "/api/website/availableDays" +
                "?month=" +
                encodeURIComponent(monthKey) +
                "&branch=" +
                encodeURIComponent(selectedBranch) +
                "&service=" +
                encodeURIComponent(selectedReason.value),
                {
                    cache: "no-store"
                }
            );

            if (!res.ok) {
                currentAvailableDays = [];
            } else {
                const data = await res.json();

                currentAvailableDays =
                    data && Array.isArray(data.days)
                        ? data.days
                        : [];
            }
        } catch (error) {
            console.error(
                "Refresh available days error:",
                error
            );

            currentAvailableDays = [];
        }

        renderCalendar();
    }

    if (prevMonth) {
        prevMonth.addEventListener("click", function () {
            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            renderCalendar();
            refreshAvailableDays();
        });
    }

    if (nextMonth) {
        nextMonth.addEventListener("click", function () {
            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            renderCalendar();
            refreshAvailableDays();
        });
    }

    if (reasonBtn && reasonOptions) {
        reasonBtn.addEventListener("click", function () {
            reasonOptions.classList.toggle("show");
        });
    }

    document.addEventListener("click", function (event) {
        if (
            !event.target.closest(".custom-select") &&
            reasonOptions
        ) {
            reasonOptions.classList.remove("show");
        }
    });

    if (appointmentForm) {
        appointmentForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                if (!patientName || !emailInput || !phoneInput) {
                    return;
                }

                if (fullPhoneNumber) {
                    fullPhoneNumber.value =
                        toPhInternational(
                            phoneInput.value.trim()
                        );
                }

                const selectedLocation =
                    document.querySelector(
                        "input[name='location']:checked"
                    );

                let hasError = false;

                const nameError =
                    validateFullName(
                        patientName.value
                    );

                setInputError(
                    patientName,
                    Boolean(nameError)
                );

                if (nameError) {
                    showFieldError(
                        "nameError",
                        nameError
                    );

                    hasError = true;
                } else {
                    clearFieldError("nameError");
                }

                const emailError =
                    validateEmail(emailInput.value);

                setInputError(
                    emailInput,
                    Boolean(emailError)
                );

                if (emailError) {
                    showFieldError(
                        "emailError",
                        emailError
                    );

                    hasError = true;
                } else {
                    clearFieldError("emailError");
                }

                const phoneError =
                    validatePhone(
                        phoneInput.value,
                        phoneCountry?.value || "PH"
                    );

                const internationalPhoneNumber =
                    toInternationalPhone(
                        phoneInput.value.trim(),
                        phoneCountry?.value || "PH"
                    );

                if (fullPhoneNumber) {
                    fullPhoneNumber.value =
                        internationalPhoneNumber;
                }

                setInputError(
                    phoneInput,
                    Boolean(phoneError)
                );

                if (phoneError) {
                    showFieldError(
                        "phoneError",
                        phoneError
                    );

                    hasError = true;
                } else {
                    clearFieldError("phoneError");
                }

                if (!selectedLocation) {
                    showFieldError(
                        "locationError",
                        "Please select your preferred branch."
                    );

                    hasError = true;
                } else {
                    clearFieldError("locationError");
                }

                if (servicesLoading) {
                    showFieldError(
                        "reasonError",
                        "Services are still loading. Please wait a moment."
                    );

                    if (reasonBtn) {
                        reasonBtn.classList.add(
                            "input-error"
                        );
                    }

                    hasError = true;
                } else if (
                    servicesLoadFailed ||
                    !Array.isArray(cachedServices) ||
                    cachedServices.length === 0
                ) {
                    showFieldError(
                        "reasonError",
                        "Services are temporarily unavailable. Please try again later or contact the clinic."
                    );

                    if (reasonBtn) {
                        reasonBtn.classList.add(
                            "input-error"
                        );
                    }

                    hasError = true;
                } else if (
                    !selectedReason ||
                    !selectedReason.value ||
                    !reasonText ||
                    reasonText.textContent === "Select reason"
                ) {
                    showFieldError(
                        "reasonError",
                        "Please select a reason for booking."
                    );

                    if (reasonBtn) {
                        reasonBtn.classList.add(
                            "input-error"
                        );
                    }

                    hasError = true;
                } else {
                    clearFieldError("reasonError");

                    if (reasonBtn) {
                        reasonBtn.classList.remove(
                            "input-error"
                        );
                    }
                }

                const dateSelected = Boolean(
                    selectedDate &&
                    appointmentDateInput &&
                    appointmentDateInput.value
                );

                if (!dateSelected) {
                    clearFieldError("dateSubmitError");
                    clearFieldError("timeError");

                    showMessage(
                        "Appointment Date Required",
                        "Please select your appointment date in Step 2 before scheduling.",
                        "error"
                    );

                    return;
                }

                clearFieldError("dateSubmitError");

                const timeSelected = Boolean(
                    selectedTime &&
                    appointmentTimeInput &&
                    appointmentTimeInput.value
                );

                if (!timeSelected) {
                    clearFieldError("timeError");

                    showMessage(
                        "Appointment Time Required",
                        "Please select your appointment time in Step 3 before scheduling.",
                        "error"
                    );

                    return;
                }

                clearFieldError("timeError");

                const allRequiredFieldsEmpty = !patientName.value.trim() && !emailInput.value.trim() && !phoneInput.value.trim() && !selectedLocation &&
                    (!selectedReason || !selectedReason.value || (reasonText && reasonText.textContent === "Select reason")) && !appointmentDateInput.value && !appointmentTimeInput.value;

                if (hasError) {
                    if (allRequiredFieldsEmpty) {
                        showMessage(
                            "Appointment Details Required",
                            "Please complete the appointment form before scheduling.",
                            "error"
                        );
                    }

                    return;
                }

                const appointmentData = {
                    appointmentDate: appointmentDateInput.value,

                    appointmentTime: appointmentTimeInput.value,

                    durationMinutes:
                        Number(
                            durationMinutesInput?.value
                        ) || 30,

                    fullName: patientName.value.trim(),

                    email: emailInput.value.trim(),

                    phoneNumber: fullPhoneNumber ? fullPhoneNumber.value : internationalPhoneNumber,

                    location: selectedLocation.value,

                    reasonForBooking: selectedReason.value
                };

                const submitButton =
                    document.querySelector(
                        ".schedule-btn"
                    );

                if (!submitButton) {
                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent = "Scheduling...";

                try {
                    const response = await fetch(
                        `${API_BASE_URL}/api/website/saveAppointment`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(
                                    appointmentData
                                )
                        }
                    );

                    let result = {};

                    try {
                        result = await response.json();
                    } catch (_) {
                        result = {};
                    }

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        showMessage(
                            result.messageTitle || "Appointment Status",
                            result.message || "Appointment request processed.",
                            "error"
                        );

                        return;
                    }

                    showToothLoading();

                    await new Promise(function (resolve) {
                        setTimeout(resolve, 10000);
                    });

                    hideToothLoading();

                    showMessage(
                        result.messageTitle || "Appointment Status",
                        result.message || "Appointment request processed.",
                        "success"
                    );

                    appointmentForm.reset();

                    selectedDate = null;
                    selectedTime = null;
                    selectedTime24 = null;
                    selectedBranch = null;

                    currentBookedSlots = [];
                    currentOperatingHours = null;
                    currentAvailableSlots = null;
                    currentAvailableDays = null;

                    if (summaryDate) {
                        summaryDate.textContent = "No date selected";
                    }

                    if (summaryTime) {
                        summaryTime.textContent = "No time selected";
                    }

                    if (appointmentDateInput) {
                        appointmentDateInput.value = "";
                    }

                    if (appointmentTimeInput) {
                        appointmentTimeInput.value = "";
                    }

                    if (durationMinutesInput) {
                        durationMinutesInput.value = "30";
                    }

                    if (reasonText) {
                        reasonText.textContent = "Select reason";
                    }

                    if (selectedReason) {
                        selectedReason.value = "";
                    }

                    if (reasonOptions) {
                        reasonOptions.innerHTML = "";
                    }

                    [
                        "nameError",
                        "emailError",
                        "phoneError",
                        "locationError",
                        "reasonError",
                        "dateSubmitError",
                        "timeError"
                    ].forEach(clearFieldError);

                    [
                        patientName,
                        emailInput,
                        phoneInput
                    ].forEach(function (element) {
                        setInputError(
                            element,
                            false
                        );
                    });

                    if (reasonBtn) {
                        reasonBtn.classList.remove("input-error");
                    }

                    updateStepLocks();
                    renderCalendar();
                    renderTimeSlots();
                    renderReasonOptions();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                } catch (error) {
                    console.error(
                        "Appointment submit error:",
                        error
                    );

                    hideToothLoading();

                    showMessage(
                        "Something Went Wrong",
                        "Something went wrong while submitting your appointment request.",
                        "error"
                    );
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = "Schedule Appointment";
                }
            }
        );
    }

    updateStepLocks();
    renderCalendar();
    renderTimeSlots();

    Promise.all([
        loadBranches(),
        loadServices()
    ]).then(function () {
        renderReasonOptions();
        refreshAvailableDays();
    });
});