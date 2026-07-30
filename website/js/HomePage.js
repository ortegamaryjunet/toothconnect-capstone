const API_BASE_URL = (() => {
    const PROD_API = "https://api.smileempressdentalhub.com";
    try {
        const params = new URLSearchParams(window.location.search || "");
        const override = params.get("apiBase") || window.__TOOTHCONNECT_API_BASE_URL__;
        if (override) return String(override).replace(/\/+$/, "");

        const hostname = String(window.location.hostname || "").toLowerCase();
        const port = String(window.location.port || "");

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            if (port === "4000") return window.location.origin;
            return "http://localhost:4000";
        }
    } catch (_) { /* ignore */ }
    return PROD_API;
})();

// ── CMS helpers ───────────────────────────────────────────────────────────────
function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
}

function setHref(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.href = value;
}

function loadWebsiteContent() {
    fetch(API_BASE_URL + "/api/website/content")
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var c = data.content || {};

            const websiteLogo = document.getElementById("website-logo");

            if (websiteLogo && c.website_logo_path) {
                websiteLogo.src = c.website_logo_path.startsWith("http")
                    ? c.website_logo_path
                    : API_BASE_URL + c.website_logo_path;
            }

            setText("hero-eyebrow",      c.hero_eyebrow);
            setText("hero-heading",      c.hero_heading);
            setText("hero-description",  c.hero_description);
            setText("hero-stat1-value",  c.hero_stat1_value);
            setText("hero-stat1-label",  c.hero_stat1_label);
            setText("hero-stat2-value",  c.hero_stat2_value);
            setText("hero-stat2-label",  c.hero_stat2_label);
            setText("hero-stat3-value",  c.hero_stat3_value);
            setText("hero-stat3-label",  c.hero_stat3_label);
            setImage("hero-dentist-image", c.hero_dentist_image);
            setText("hero-dentist-name", c.hero_dentist_name);
            setText("hero-dentist-title",c.hero_dentist_title);
            setText("hero-booking-title", c.hero_booking_title);
            setText("hero-booking-subtitle",c.hero_booking_subtitle);
            setText("about-p1",          c.about_paragraph1);
            setText("about-p2",          c.about_paragraph2);
            setText("about-p3",          c.about_paragraph3);
            setText("hours-weekdays",    c.hours_weekdays);
            setText("hours-weekday-time",c.hours_weekday_time);
            setText("hours-sunday",      c.hours_sunday);
            setText("hours-sunday-note", c.hours_sunday_note);
            setText("call-tagline",      c.contact_tagline);
            setText("call-phone1",       c.contact_phone1);
            setText("call-phone2",       c.contact_phone2);
            setText("call-email",        c.contact_email);
            setText("footer-phone1",     c.contact_phone1 ? "(+63) " + c.contact_phone1 : null);
            setText("footer-phone2",     c.contact_phone2 ? "(+63) " + c.contact_phone2 : null);
            setHref("contact-facebook",  c.contact_facebook_url);
            setText("footer-brand-name", c.footer_brand_name);
            setText("footer-team-name", c.footer_team_name);


            if (c.contact_phone1 && c.contact_phone2 && c.contact_email) {
                setText("contact-description",
                    "For appointments and questions, contact us at " +
                    c.contact_phone1 + " or " + c.contact_phone2 +
                    ", or email us at " + c.contact_email + ".");
            }

            if (c.contact_email) {
                var footerEmail = document.getElementById("footer-email-link");
                if (footerEmail) {
                    footerEmail.textContent = c.contact_email;
                    footerEmail.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(c.contact_email);
                }
            }
        })
        .catch(function() {}); // fail silently — hardcoded defaults remain
}

function loadWebsiteFaqs() {
    fetch(API_BASE_URL + "/api/website/faqs")
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var faqs = data.faqs || [];
            if (!faqs.length) return;

            var container = document.getElementById("faq-list");
            if (!container) return;

            container.innerHTML = faqs.map(function(faq, i) {
                return '<div class="faq-item' + (i === 0 ? ' active' : '') + '">' +
                    '<button type="button">' +
                    '<span>' + escapeHtml(faq.question) + '</span>' +
                    '<i class="fa-solid ' + (i === 0 ? 'fa-xmark' : 'fa-plus') + '"></i>' +
                    '</button>' +
                    '<div class="faq-answer"><p>' + escapeHtml(faq.answer) + '</p></div>' +
                    '</div>';
            }).join('');

            // Re-attach accordion behaviour to the newly rendered items
            var items = container.querySelectorAll(".faq-item");
            items.forEach(function(item) {
                var btn  = item.querySelector("button");
                var icon = item.querySelector("i");
                if (!btn || !icon) return;
                btn.addEventListener("click", function() {
                    items.forEach(function(other) {
                        if (other !== item) {
                            other.classList.remove("active");
                            var oi = other.querySelector("i");
                            if (oi) { oi.classList.remove("fa-minus"); oi.classList.add("fa-plus"); }
                        }
                    });
                    item.classList.toggle("active");
                    var isActive = item.classList.contains("active");
                    icon.classList.toggle("fa-plus", !isActive);
                    icon.classList.toggle("fa-minus", isActive);
                });
            });
        })
        .catch(function() {});
}

function loadWebsiteServices() {
    fetch(API_BASE_URL + "/api/website/services")
        .then(function (r) {
            return r.json();
        })
        .then(function (data) {
            var services = data.services || [];

            var grid = document.getElementById("serviceGrid");
            if (!grid) return;

            document.querySelectorAll(".service-modal").forEach(function (m) {
                m.remove();
            });

            grid.innerHTML = services.map(function (svc, i) {
                var modalId = "modal-svc-" + svc.id;

                return `
                    <div class="service-card${i < 3 ? " show" : ""}${i === 2 ? " active" : ""}" data-modal="${modalId}">
                        <img src="${escapeHtml(svc.image_path || "")}" alt="${escapeHtml(svc.name)}">
                        <span>${escapeHtml(svc.name)}</span>
                    </div>
                `;
            }).join("");

            var modals = services.map(function (svc) {
                var modalId = "modal-svc-" + svc.id;

                return `
                    <div class="service-modal" id="${modalId}">
                        <div class="service-modal-card">
                            <button type="button" class="modal-close" aria-label="Close modal">
                                <i class="fa-solid fa-xmark"></i>
                            </button>

                            <h2>${escapeHtml(svc.name)}</h2>

                            <div class="modal-img-box">
                                <img src="${escapeHtml(svc.image_path || "")}" alt="${escapeHtml(svc.name)}">
                            </div>

                            <p>${escapeHtml(svc.description || "")}</p>

                            <a href="./Services.html?service=${encodeURIComponent(svc.slug || "")}" class="quote-btn">
                                Read More
                            </a>
                        </div>
                    </div>
                `;
            }).join("");

            document.body.insertAdjacentHTML("beforeend", modals);

            var strip = document.getElementById("strip-track");

            if (strip) {
                var names = services
                    .map(function (svc) {
                        return "<span>" + escapeHtml(svc.name) + "</span>";
                    })
                    .join("");

                strip.innerHTML = names + names;
            }

            rewireServiceCarousel();
        })
        .catch(function (err) {
            console.error("Failed to load website services:", err);
        });
}

function rewireServiceCarousel() {
    var cards = document.querySelectorAll(".service-card");
    var modals = document.querySelectorAll(".service-modal");
    var closes = document.querySelectorAll(".modal-close");
    var prevBtn = document.getElementById("prevService");
    var nextBtn = document.getElementById("nextService");

    var active = 2;

    function updateCarousel() {
        cards.forEach(function(c) { c.classList.remove("show","active","prev","next"); });
        var total = cards.length;
        if (!total) return;
        var prev = (active - 1 + total) % total;
        var next = (active + 1) % total;
        cards[prev].classList.add("show","prev");
        cards[active].classList.add("show","active");
        cards[next].classList.add("show","next");
    }

    if (prevBtn) prevBtn.onclick = function() { active = (active - 1 + cards.length) % cards.length; updateCarousel(); };
    if (nextBtn) nextBtn.onclick = function() { active = (active + 1) % cards.length; updateCarousel(); };

    cards.forEach(function(card, idx) {
        card.onclick = function() {
            active = idx;
            updateCarousel();
            var modalId = card.getAttribute("data-modal");
            var modal = modalId ? document.getElementById(modalId) : null;
            if (modal) { modal.classList.add("active"); document.body.style.overflow = "hidden"; }
        };
    });

    closes.forEach(function(btn) {
        btn.onclick = function() {
            var m = btn.closest(".service-modal");
            if (m) { m.classList.remove("active"); document.body.style.overflow = ""; }
        };
    });

    modals.forEach(function(m) {
        m.onclick = function(e) { if (e.target === m) { m.classList.remove("active"); document.body.style.overflow = ""; } };
    });

    updateCarousel();
}

function loadWebsiteAnnouncements() {
    fetch(API_BASE_URL + "/api/website/announcements")
        .then(function (r) {
            return r.json();
        })
        .then(function (data) {
            var list = data.announcements || [];
            if (!list.length) return;

            // Remove old modal if it already exists
            var existing = document.getElementById("announcementModal");
            if (existing) existing.remove();

            var html =
                '<div id="announcementModal" class="announcement-modal">' +
                    '<div class="announcement-modal-content">' +

                        '<button type="button" class="announcement-close">' +
                            '<i class="fa-solid fa-xmark"></i>' +
                        '</button>' +

                        '<h2>Announcements</h2>' +

                        '<div id="announcementBody"></div>' +

                        (list.length > 1
                            ? '<div class="announcement-pagination">' +
                                '<button type="button" id="announcementPrev" class="announcement-nav-btn">' +
                                    '<i class="fa-solid fa-chevron-left"></i>' +
                                '</button>' +

                                '<span id="announcementPage"></span>' +

                                '<button type="button" id="announcementNext" class="announcement-nav-btn">' +
                                    '<i class="fa-solid fa-chevron-right"></i>' +
                                '</button>' +
                            '</div>'
                            : ''
                        )

                    '</div>' +
                '</div>';

            document.body.insertAdjacentHTML("beforeend", html);

            var modal = document.getElementById("announcementModal");
            var close = modal.querySelector(".announcement-close");
            var body = document.getElementById("announcementBody");

            var prevBtn = document.getElementById("announcementPrev");
            var nextBtn = document.getElementById("announcementNext");
            var pageText = document.getElementById("announcementPage");

            var currentPage = 0;

            function renderAnnouncement() {
                var ann = list[currentPage];

                body.innerHTML =
                    '<div class="announcement-item">' +
                        '<h3>' + escapeHtml(ann.title) + '</h3>' +
                        '<p>' + escapeHtml(ann.message) + '</p>' +
                    '</div>';

                if (pageText) {
                    pageText.textContent =
                        (currentPage + 1) + " of " + list.length;
                }

                if (prevBtn) {
                    prevBtn.disabled = currentPage === 0;
                }

                if (nextBtn) {
                    nextBtn.disabled = currentPage === list.length - 1;
                }
            }

            renderAnnouncement();

            if (prevBtn) {
                prevBtn.addEventListener("click", function () {
                    if (currentPage > 0) {
                        currentPage--;
                        renderAnnouncement();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    if (currentPage < list.length - 1) {
                        currentPage++;
                        renderAnnouncement();
                    }
                });
            }

            modal.style.display = "flex";

            close.addEventListener("click", function () {
                modal.remove();
            });

            modal.addEventListener("click", function (e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            document.addEventListener("keydown", function esc(e) {
                if (e.key === "Escape") {
                    modal.remove();
                    document.removeEventListener("keydown", esc);
                }
            });
        })
        .catch(function () {});
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", function () {
    loadWebsiteContent();
    loadWebsiteFaqs();
    loadWebsiteServices();
    loadWebsiteAnnouncements();


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

    const stepButtons = document.querySelectorAll(".step-icon-btn");
    const stepModals = document.querySelectorAll(".step-modal");
    const stepCloseButtons = document.querySelectorAll(".step-modal-close");

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
            validateName();
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9]/g, "").slice(0, 11);
            validatePhone();
        });
    }

    if (messageInput) {
        messageInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^a-zA-Z0-9\s.,!?'"()\-]/g, "");
            validateMessage();
        });
    }

    if (emailInput) {
        emailInput.addEventListener("input", function () {
            this.value = this.value.replace(/\s/g, "");
            validateEmail();
        });
    }

    if (concernInput) {
        concernInput.addEventListener("change", validateConcern);
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

function setFieldState(input, valid, message = "") {
    const group = input.closest(".form-group");
    const error = group.querySelector(".input-error");

    input.classList.remove("error", "valid");

    if (valid) {
        input.classList.add("valid");
        if (error) error.textContent = "";
    } else {
        input.classList.add("error");
        if (error) error.textContent = message;
    }
}

function validateName() {
    const input = document.getElementById("inquiryName");
    const value = input.value.trim();

    const words = value.split(/\s+/).filter(Boolean);

    if (words.length < 2) {
        setFieldState(input, false, "Please enter both your first and last name.");
    } else {
        setFieldState(input, true);
    }
}

function validateEmail() {
    const input = document.getElementById("inquiryEmail");
    const value = input.value.trim();

    if (!isValidEmail(value)) {
        setFieldState(input, false, "Enter a valid email address.");
    } else {
        setFieldState(input, true);
    }
}

function validatePhone() {
    const input = document.getElementById("phoneNumber");
    const value = input.value.trim();

    if (!/^09\d{9}$/.test(value)) {
        setFieldState(input, false, "Enter a valid 11-digit Philippine mobile number.");
    } else {
        setFieldState(input, true);
    }
}

function validateConcern() {
    const input = document.getElementById("inquiryConcern");

    if (!input.value) {
        setFieldState(input, false, "Please select a concern.");
    } else {
        setFieldState(input, true);
    }
}

function validateMessage() {
    const input = document.getElementById("inquiryMessage");
    const value = input.value.trim();

    if (value.length < 10) {
        setFieldState(input, false, "Message must be at least 10 characters.");
    } else {
        setFieldState(input, true);
    }
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
            document.querySelectorAll(".service-modal").forEach(function (modal) {
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
                const response = await fetch(`${API_BASE_URL}/api/website/saveInquiry`, {
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

    function closeStepModal(element) {
        const modal = element.closest(".step-modal");

        if (modal) {
            modal.classList.remove("show");
            document.body.style.overflow = "";
        }
    }

    stepButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const modalId = button.getAttribute("data-modal");
            const modal = document.getElementById(modalId);

            if (modal) {
                modal.classList.add("show");
                document.body.style.overflow = "hidden";
            }
        });
    });

    stepCloseButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            closeStepModal(button);
        });
    });

    stepModals.forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.remove("show");
                document.body.style.overflow = "";
            }
        });
    });

    document.querySelectorAll(".step-modal-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            closeStepModal(button);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            stepModals.forEach(function (modal) {
                modal.classList.remove("show");
            });

            document.body.style.overflow = "";
        }
    });
});
