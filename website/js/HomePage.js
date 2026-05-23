const API_BASE_URL = "http://localhost:4000";

document.addEventListener("DOMContentLoaded", function () {
    const header = document.getElementById("header");
    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll("#navMenu a");
    const faqItems = document.querySelectorAll(".faq-item");

    const inquiryForm = document.getElementById("inquiryForm");
    const fullNameInput = document.getElementById("inquiryName");
    const emailInput = document.getElementById("inquiryEmail");
    const phoneInput = document.getElementById("phoneNumber");
    const concernInput = document.getElementById("inquiryConcern");
    const messageInput = document.getElementById("inquiryMessage");

    const serviceCards = document.querySelectorAll(".service-card");
    const prevService = document.getElementById("prevService");
    const nextService = document.getElementById("nextService");
    const serviceModals = document.querySelectorAll(".service-modal");
    const closeButtons = document.querySelectorAll(".modal-close");

    const messageModal = document.getElementById("messageModal");
    const closeMessageModal = document.getElementById("closeMessageModal");
    const messageBtn = document.getElementById("messageBtn");
    const messageTitle = document.getElementById("messageTitle");
    const messageText = document.getElementById("messageText");
    const messageIcon = document.getElementById("messageIcon");

    function showMessage(title, text, type = "error") {
        if (!messageModal || !messageTitle || !messageText || !messageIcon) {
            alert(text || title);
            return;
        }

        messageTitle.textContent = title;
        messageText.textContent = text;

        if (type === "success") {
            messageIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
            messageIcon.style.background = "#dcfce7";
            messageIcon.style.color = "#16a34a";
        } else {
            messageIcon.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>`;
            messageIcon.style.background = "#fee2e2";
            messageIcon.style.color = "#dc2626";
        }

        messageModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeMessage() {
        if (!messageModal) return;

        messageModal.classList.remove("show");
        document.body.style.overflow = "";
    }

    function closeMenu() {
        if (!navMenu || !menuBtn) return;

        navMenu.classList.remove("show");

        const icon = menuBtn.querySelector("i");

        if (icon) {
            icon.classList.add("fa-bars");
            icon.classList.remove("fa-xmark");
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    if (fullNameInput) {
        fullNameInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9]/g, "").slice(0, 11);
        });
    }

    if (messageInput) {
        messageInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z0-9\s.,!?'"()\-]/g, "");
        });
    }

    if (emailInput) {
        emailInput.addEventListener("input", function () {
            this.value = this.value.replace(/\s/g, "");
        });
    }

    if (closeMessageModal) {
        closeMessageModal.addEventListener("click", closeMessage);
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

    window.addEventListener("scroll", function () {
        if (header) {
            header.classList.toggle("scrolled", window.scrollY > 40);
        }

        let current = "";

        document.querySelectorAll("section[id]").forEach(function (section) {
            const sectionTop = section.offsetTop - 140;

            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }
        });
    });

    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", function () {
            navMenu.classList.toggle("show");

            const icon = menuBtn.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-xmark");
            }
        });
    }

    navLinks.forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    faqItems.forEach(function (item) {
        const button = item.querySelector("button");
        const icon = item.querySelector("i");

        if (!button || !icon) return;

        button.addEventListener("click", function () {
            faqItems.forEach(function (faq) {
                const faqIcon = faq.querySelector("i");

                if (faq !== item) {
                    faq.classList.remove("active");

                    if (faqIcon) {
                        faqIcon.classList.remove("fa-minus");
                        faqIcon.classList.add("fa-plus");
                    }
                }
            });

            item.classList.toggle("active");

            icon.classList.toggle("fa-plus", !item.classList.contains("active"));
            icon.classList.toggle("fa-minus", item.classList.contains("active"));
        });
    });

    let activeService = 2;

    function updateServices() {
        if (!serviceCards.length) return;

        serviceCards.forEach(function (card) {
            card.classList.remove("show", "active", "prev", "next");
        });

        const total = serviceCards.length;
        const prevIndex = (activeService - 1 + total) % total;
        const nextIndex = (activeService + 1) % total;

        serviceCards[prevIndex].classList.add("show", "prev");
        serviceCards[activeService].classList.add("show", "active");
        serviceCards[nextIndex].classList.add("show", "next");
    }

    if (prevService && nextService && serviceCards.length) {
        nextService.addEventListener("click", function () {
            activeService++;

            if (activeService >= serviceCards.length) {
                activeService = 0;
            }

            updateServices();
        });

        prevService.addEventListener("click", function () {
            activeService--;

            if (activeService < 0) {
                activeService = serviceCards.length - 1;
            }

            updateServices();
        });

        updateServices();
    }

    serviceCards.forEach(function (card, index) {
        card.addEventListener("click", function () {
            activeService = index;
            updateServices();

            const modalId = card.getAttribute("data-modal");
            const modal = document.getElementById(modalId);

            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });

    closeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const modal = button.closest(".service-modal");

            if (modal) {
                modal.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    });

    serviceModals.forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            serviceModals.forEach(function (modal) {
                modal.classList.remove("active");
            });

            closeMessage();
            document.body.style.overflow = "";
        }
    });

    if (inquiryForm) {
        inquiryForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const fullName = fullNameInput ? fullNameInput.value.trim() : "";
            const emailAddress = emailInput ? emailInput.value.trim() : "";
            const phoneNumber = phoneInput ? phoneInput.value.trim() : "";
            const branchInput = inquiryForm.querySelector("input[name='branch']:checked");
            const branch = branchInput ? branchInput.value : "";
            const concern = concernInput ? concernInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

            if (!fullName || !emailAddress || !phoneNumber || !branch || !concern || !message) {
                showMessage(
                    "Incomplete Information",
                    "Please complete all required fields."
                );
                return;
            }

            if (fullName.length < 2) {
                showMessage(
                    "Invalid Full Name",
                    "Please enter a valid full name."
                );
                return;
            }

            if (!isValidEmail(emailAddress)) {
                showMessage(
                    "Invalid Email Address",
                    "Please enter a valid email address."
                );
                return;
            }

            if (!/^09\d{9}$/.test(phoneNumber)) {
                showMessage(
                    "Invalid Phone Number",
                    "Phone number must start with 09 and contain 11 digits only."
                );
                return;
            }

            if (message.length < 5) {
                showMessage(
                    "Invalid Message",
                    "Please enter a message with at least 5 characters."
                );
                return;
            }

            try {
                const response = await fetch("http://localhost:4000/api/website/saveInquiry", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName,
                        emailAddress,
                        phoneNumber,
                        branch,
                        concern,
                        message
                    })
                });

                const result = await response.json();

                showMessage(
                    result.messageTitle || "Inquiry Status",
                    result.message || "Your inquiry has been submitted successfully. Please wait for our response.",
                    result.success ? "success" : "error"
                );

                if (result.success) {
                    inquiryForm.reset();
                }
            } catch (error) {
                console.error("Inquiry submit error:", error);

                showMessage(
                    "Inquiry Failed",
                    "Something went wrong while submitting your inquiry."
                );
            }
        });
    }
});