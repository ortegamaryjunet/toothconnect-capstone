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

    const phoneInput = document.getElementById("phoneNumber");
    const fullPhoneNumber = document.getElementById("fullPhoneNumber");

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedTime24 = null;
    let iti = null;

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

    function updateFullPhoneNumber() {
        if (!phoneInput || !fullPhoneNumber) {
            return;
        }

        if (iti) {
            fullPhoneNumber.value = iti.getNumber();
        } else {
            fullPhoneNumber.value = phoneInput.value.trim();
        }
    }

    if (phoneInput && window.intlTelInput) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "ph",
            preferredCountries: ["ph", "us", "gb", "au", "jp", "kr", "sg", "ae"],
            separateDialCode: true,
            nationalMode: false,
            autoPlaceholder: "aggressive",
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
        });

        phoneInput.addEventListener("input", function () {
            let value = this.value.replace(/\D/g, "");

            if (value.length > 10) {
                value = value.substring(0, 10);
            }

            this.value = value;
            updateFullPhoneNumber();
        });

        phoneInput.addEventListener("countrychange", updateFullPhoneNumber);
    }

    if (patientName) {
        patientName.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
        });
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

                renderCalendar();
                renderTimeSlots();

                document.querySelector(".time-card")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
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

    if (reasonBtn && reasonOptions) {
        reasonBtn.addEventListener("click", function () {
            reasonOptions.classList.toggle("show");
        });
    }

    if (reasonOptions) {
        reasonOptions.querySelectorAll("p").forEach(function (option) {
            option.addEventListener("click", function () {
                const value = option.getAttribute("data-value") || option.textContent.trim();

                reasonText.textContent = value;
                selectedReason.value = value;

                reasonOptions.classList.remove("show");
            });
        });
    }

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".custom-select") && reasonOptions) {
            reasonOptions.classList.remove("show");
        }
    });

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            updateFullPhoneNumber();

            const selectedLocation = document.querySelector(
                "input[name='location']:checked"
            );

            if (!selectedDate || !appointmentDateInput.value) {
                alert("Please select your appointment date.");
                return;
            }

            if (!selectedTime || !appointmentTimeInput.value) {
                alert("Please select your appointment time.");
                return;
            }

            if (!patientName.value.trim()) {
                alert("Please enter your full name.");
                patientName.focus();
                return;
            }

            if (!phoneInput.value.trim()) {
                alert("Please enter your phone number.");
                phoneInput.focus();
                return;
            }

            if (iti && !iti.isValidNumber()) {
                alert("Please enter a valid phone number.");
                phoneInput.focus();
                return;
            }

            if (!selectedLocation) {
                alert("Please select your preferred branch.");
                return;
            }

            if (!selectedReason.value || reasonText.textContent === "Select reason") {
                alert("Please select a reason for booking.");
                return;
            }

            const appointmentData = {
                appointmentDate: appointmentDateInput.value,
                appointmentTime: appointmentTimeInput.value,
                durationMinutes: Number(durationMinutesInput.value) || 30,
                fullName: patientName.value.trim(),
                phoneNumber: fullPhoneNumber.value || phoneInput.value.trim(),
                location: selectedLocation.value,
                reasonForBooking: selectedReason.value
            };

            const submitButton = document.querySelector(".schedule-btn");

            submitButton.disabled = true;
            submitButton.textContent = "Scheduling...";

            try {
                const response = await fetch("/api/website/saveAppointment", {
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

                summaryDate.textContent = "No date selected";
                summaryTime.textContent = "No time selected";

                appointmentDateInput.value = "";
                appointmentTimeInput.value = "";
                durationMinutesInput.value = "30";

                reasonText.textContent = "Select reason";
                selectedReason.value = "";

                if (iti) {
                    iti.setCountry("ph");
                }

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

    renderCalendar();
    renderTimeSlots();
});