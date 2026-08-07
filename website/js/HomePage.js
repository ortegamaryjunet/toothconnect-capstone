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

    if (el && value != null) {
        el.textContent = value;
    }
}

function setHref(id, value) {
    var el = document.getElementById(id);

    if (el && value) {
        el.href = value;
    }
}

function setImage(id, value) {
    const el = document.getElementById(id);

    if (!el || !value) {
        return;
    }

    el.src = value.startsWith("http")
        ? value
        : API_BASE_URL + value;
}

function applyTextDesign(id, prefix, c) {
    const element = document.getElementById(id);

    if (!element) {
        console.warn(`[applyTextDesign] Element not found: ${id}`);
        return;
    }

    element.style.fontFamily = c[`${prefix}_font_family`] || "";
    element.style.fontSize = c[`${prefix}_font_size`] || "";
    element.style.fontWeight = c[`${prefix}_font_weight`] || "";
    element.style.fontStyle = c[`${prefix}_font_style`] || "";
    element.style.color =
        c[`${prefix}_text_color`] ||
        c[`${prefix}_color`] ||
        "";

    const alignment = (
        c[`${prefix}_text_alignment`] ||
        c[`${prefix}_alignment`] ||
        "left"
    )
    .trim()
    .toLowerCase();

    if (id === "hero-button-label") {
        const button = element.closest(".header-btn");

        if (button) {
            switch (alignment) {
                case "left":
                    button.style.justifyContent = "flex-start";
                    break;

                case "center":
                    button.style.justifyContent = "center";
                    break;

                case "right":
                    button.style.justifyContent = "flex-end";
                    break;

                default:
                    button.style.justifyContent = "center";
                    console.warn("Unknown alignment:", alignment);
            }
        }
    } else {
        element.style.textAlign = alignment;
    }
}

function loadWebsiteContent() {
    fetch(API_BASE_URL + "/api/website/content")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const c = data.content || {};

            /* Website Logo */

            const websiteLogo = document.getElementById("website-logo");

            if (websiteLogo) {
                if (c.website_logo_path) {
                    websiteLogo.src = c.website_logo_path.startsWith("http")
                        ? c.website_logo_path
                        : API_BASE_URL + c.website_logo_path;
                } else {
                    websiteLogo.removeAttribute("src");
                }

                websiteLogo.style.objectFit = c.website_logo_fit || "contain";
                websiteLogo.style.objectPosition = "center";
                websiteLogo.style.width = "100%";
                websiteLogo.style.height = "100%";
            }

            /* Footer */

            setText("footer-brand-name", c.footer_brand_name);
            setText("footer-team-name", c.footer_team_name);
            setText("footer-system-name", c.footer_system_name);

            applyTextDesign("footer-brand-name", "footer_brand_name", c);
            applyTextDesign("footer-team-name", "footer_team_name", c);
            applyTextDesign("footer-system-name", "footer_system_name", c);

            setText("footer-facebook-name", c.contact_facebook_name);
            applyTextDesign("footer-facebook-name", "contact_facebook_name", c);

            const footerEmail = document.getElementById("footer-email");

            if (footerEmail) {
                footerEmail.textContent = c.contact_email || "";
                footerEmail.href = c.contact_email ? `mailto:${c.contact_email}` : "#";
            }

            applyTextDesign("footer-email", "contact_email", c);

            const footerPhone1 = document.getElementById("footer-phone1");

            if (footerPhone1) {
                const phone = formatPhone(c.contact_phone1);

                footerPhone1.textContent = phone;
                footerPhone1.href = phone ? `tel:${phone}` : "#";
            }

            applyTextDesign("footer-phone1", "contact_phone1", c);

            const footerPhone2 = document.getElementById("footer-phone2");

            if (footerPhone2) {
                const phone = formatPhone(c.contact_phone2);

                footerPhone2.textContent = phone;
                footerPhone2.href = phone ? `tel:${phone}` : "#";
            }

            applyTextDesign("footer-phone2", "contact_phone2", c);

            const footerFacebook = document.getElementById("footer-facebook");

            if (footerFacebook) {
                footerFacebook.href = c.contact_facebook_url || "#";
            }

            /* Hero */

            setText("hero-eyebrow", c.hero_eyebrow);
            applyTextDesign("hero-eyebrow", "hero_eyebrow", c);

            setText("hero-heading", c.hero_heading);
            applyTextDesign("hero-heading", "hero_heading", c);

            setText("hero-description", c.hero_description);
            applyTextDesign("hero-description", "hero_description", c);

            setText("hero-button-label", c.hero_button_label);
            applyTextDesign("hero-button-label", "hero_button_label", c);

            setText("hero-stat1-value", c.hero_stat1_value);
            applyTextDesign("hero-stat1-value", "hero_stat1_value", c);

            setText("hero-stat1-label", c.hero_stat1_label);
            applyTextDesign("hero-stat1-label", "hero_stat1_label", c);

            setText("hero-stat2-value", c.hero_stat2_value);
            applyTextDesign("hero-stat2-value", "hero_stat2_value", c);

            setText("hero-stat2-label", c.hero_stat2_label);
            applyTextDesign("hero-stat2-label", "hero_stat2_label", c);

            setText("hero-stat3-value", c.hero_stat3_value);
            applyTextDesign("hero-stat3-value", "hero_stat3_value", c);

            setText("hero-stat3-label", c.hero_stat3_label);
            applyTextDesign("hero-stat3-label", "hero_stat3_label", c);

            const heroImage = document.getElementById("hero-dentist-image");

            if (heroImage) {
                if (c.hero_dentist_image) {
                    heroImage.src = c.hero_dentist_image.startsWith("http")
                        ? c.hero_dentist_image
                        : API_BASE_URL + c.hero_dentist_image;
                }

                heroImage.style.objectFit = c.hero_dentist_image_fit || "contain";
                heroImage.style.objectPosition = "center";
            }

            setText("hero-dentist-name", c.hero_dentist_name);
            applyTextDesign("hero-dentist-name", "hero_dentist_name", c);

            setText("hero-dentist-title", c.hero_dentist_title);
            applyTextDesign("hero-dentist-title", "hero_dentist_title", c);

            setText("hero-booking-title", c.hero_booking_title);
            applyTextDesign("hero-booking-title", "hero_booking_title", c);

            setText("hero-booking-subtitle", c.hero_booking_subtitle);
            applyTextDesign("hero-booking-subtitle", "hero_booking_subtitle", c);
            /* About */

            setText("about-p1", c.about_paragraph1);
            applyTextDesign("about-p1", "about_paragraph1", c);

            setText("about-p2", c.about_paragraph2);
            applyTextDesign("about-p2", "about_paragraph2", c);

            setText("about-p3", c.about_paragraph3);
            applyTextDesign("about-p3", "about_paragraph3", c);

            /* Clinic Hours */

            setText("hours-weekdays", c.hours_weekdays);
            applyTextDesign("hours-weekdays", "hours_weekdays", c);

            setText("hours-weekday-time", c.hours_weekday_time);
            applyTextDesign("hours-weekday-time", "hours_weekday_time", c);

            setText("hours-sunday", c.hours_sunday);
            applyTextDesign("hours-sunday", "hours_sunday", c);

            setText("hours-sunday-note", c.hours_sunday_note);
            applyTextDesign("hours-sunday-note", "hours_sunday_note", c);

            /* Call Card */

            const phone1 = c.contact_phone1
                ? formatPhone(c.contact_phone1)
                : "";

            const phone2 = c.contact_phone2
                ? formatPhone(c.contact_phone2)
                : "";

            setText("call-tagline", c.contact_tagline);
            applyTextDesign("call-tagline", "contact_tagline", c);

            setText("call-phone1", phone1);
            applyTextDesign("call-phone1", "contact_phone1", c);

            setText("call-phone2", phone2);
            applyTextDesign("call-phone2", "contact_phone2", c);

            setText("call-email", c.contact_email);
            applyTextDesign("call-email", "contact_email", c);

            /* Contact */

            setText(
                "contact-tagline",
                c.contact_badge || "Contact Us"
            );
            applyTextDesign("contact-tagline", "contact_badge", c);

            setText(
                "contact-heading",
                c.contact_heading || "Start Your Dental Care Journey Today"
            );
            applyTextDesign("contact-heading", "contact_heading", c);

            let description = "For appointments and questions";

            if (phone1 && phone2) {
                description += `, contact us at ${phone1} or ${phone2}`;
            } else if (phone1) {
                description += `, contact us at ${phone1}`;
            } else if (phone2) {
                description += `, contact us at ${phone2}`;
            }

            if (c.contact_email) {
                description += `, or email us at ${c.contact_email}`;
            }

            description += ".";

            setText("contact-description", description);
            applyTextDesign("contact-description", "contact_description", c);

            const contactFacebook = document.getElementById("contact-facebook");

            if (contactFacebook) {
                contactFacebook.href = c.contact_facebook_url || "#";
            }

            const contactButton = document.getElementById("contact-button");

            if (contactButton) {
                contactButton.textContent =
                    c.contact_button || "Contact Us";

                contactButton.style.fontFamily =
                    c.contact_button_font_family || "";

                contactButton.style.fontSize =
                    c.contact_button_font_size || "";

                contactButton.style.fontWeight =
                    c.contact_button_font_weight || "";

                contactButton.style.fontStyle =
                    c.contact_button_font_style || "";

                contactButton.style.color =
                    c.contact_button_text_color || "";

                contactButton.style.textAlign =
                    c.contact_button_text_alignment || "";
            }
        })
        .catch(function (error) {
            console.error(
                "Failed to load website content:",
                error
            );
        });
}

function formatPhone(phone) {
    if (!phone) return "";

    const digits = String(phone).replace(/\D/g, "");

    if (digits.length === 10 && digits.startsWith("9")) {
        return "+63 " + digits;
    }

    return phone;
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
    fetch(`${API_BASE_URL}/api/website/services`)
        .then(function (r) {
            return r.json();
        })
        .then(function (data) {
            var services = Array.isArray(data.services) ? data.services : [];

            var grid = document.getElementById("serviceGrid");
            if (!grid) return;

            document.querySelectorAll(".service-modal").forEach(function (modal) {
                modal.remove();
            });

            grid.innerHTML = services.map(function (svc, i) {
                var modalId = "modal-svc-" + svc.id;

                return `
                    <div class="service-card${i < 3 ? " show" : ""}${i === 2 ? " active" : ""}" data-modal="${modalId}">
                        <img src="${escapeHtml(buildImage(svc.image_path))}" alt="${escapeHtml(svc.name)}" loading="lazy">
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
                                <img
                                    src="${escapeHtml(buildImage(svc.image_path))}"
                                    alt="${escapeHtml(svc.name)}"
                                    loading="lazy"
                                >
                            </div>

                            <p>${escapeHtml(svc.description || "")}</p>

                            <a
                                href="./Services.html?service=${encodeURIComponent(svc.slug || "")}"
                                class="quote-btn"
                            >
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
                        return `<span>${escapeHtml(svc.name)}</span>`;
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

function buildImage(path) {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return `${path}?v=${Date.now()}`;
    }

    if (path.startsWith("/uploads/")) {
        return `${API_BASE_URL}${path}?v=${Date.now()}`;
    }

    return `${path}?v=${Date.now()}`;
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

                const titleStyle =
                    'font-family:' + (ann.title_font_family || 'Arial') + ';' +
                    'font-size:' + (ann.title_font_size || '20px') + ';' +
                    'font-weight:' + (ann.title_font_weight || '700') + ';' +
                    'color:' + (ann.title_color || '#000000') + ';' +
                    'text-align:' + (ann.title_alignment || 'left') + ';';

                const messageStyle =
                    'font-family:' + (ann.message_font_family || 'Arial') + ';' +
                    'font-size:' + (ann.message_font_size || '14px') + ';' +
                    'font-weight:' + (ann.message_font_weight || '400') + ';' +
                    'color:' + (ann.message_color || '#000000') + ';' +
                    'text-align:' + (ann.message_alignment || 'left') + ';';

                body.innerHTML =
                    '<div class="announcement-item">' +
                        '<h3 style="' + titleStyle + '">' +
                            escapeHtml(ann.title) +
                        '</h3>' +
                        '<p style="' + messageStyle + '">' +
                            escapeHtml(ann.message) +
                        '</p>' +
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

    const messageModal = document.getElementById("messageModal");
    const closeMessageModal = document.getElementById("closeMessageModal");
    const messageBtn = document.getElementById("messageBtn");
    const messageTitle = document.getElementById("messageTitle");
    const messageText = document.getElementById("messageText");
    const messageIcon = document.getElementById("messageIcon");

    const stepButtons = document.querySelectorAll(".step-icon-btn");
    const stepModals = document.querySelectorAll(".step-modal");
    const stepCloseButtons = document.querySelectorAll(".step-modal-close");

    const phoneCountry = document.getElementById("phoneCountry");
    const phoneLib = window.libphonenumber;

    if (phoneCountry && phoneLib?.getCountries) {
        phoneLib.getCountries().forEach((country) => {
            const option = document.createElement("option");

            option.value = country;
            option.textContent =
                `${country} +${phoneLib.getCountryCallingCode(country)}`;

            if (country === "PH") {
                option.selected = true;
            }

            phoneCountry.appendChild(option);
        });
    } else if (phoneCountry) {
        const option = document.createElement("option");
        option.value = "PH";
        option.textContent = "PH +63";
        option.selected = true;
        phoneCountry.appendChild(option);
    }

    function showMessage(title, text, type = "error") {
        if (!messageModal || !messageTitle || !messageText || !messageIcon) {

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
            this.value = this.value.replace(/\D/g, "");
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

    if (!input.value.trim()) {
        setFieldState(input, false, "Full name is required.");
        return false;
    }

    const words = input.value.trim().split(/\s+/).filter(Boolean);

    if (words.length < 2) {
        setFieldState(input, false, "Please enter both your first and last name.");
        return false;
    }

    setFieldState(input, true);
    return true;
}

function validateEmail() {
    const input = document.getElementById("inquiryEmail");
    const value = input.value.trim();

    if (!value) {
        setFieldState(input, false, "Email address is required.");
        return false;
    }

    if (!isValidEmail(value)) {
        setFieldState(input, false, "Enter a valid email address.");
        return false;
    }

    setFieldState(input, true);
    return true;
}

function parsePhoneNumber(value, country) {
    if (phoneLib?.parsePhoneNumberFromString) {
        return phoneLib.parsePhoneNumberFromString(value, country);
    }
    return null;
}

function isFallbackValidPhone(value, country) {
    const digits = value.replace(/\D/g, "");

    if (country === "PH") {
        return /^09\d{9}$/.test(digits) || /^9\d{9}$/.test(digits) || /^639\d{9}$/.test(digits);
    }

    return digits.length >= 7 && digits.length <= 15;
}

function toInternationalPhone(value, country) {
    const phone = parsePhoneNumber(value, country);
    if (phone?.isValid()) return phone.number;

    const digits = value.replace(/\D/g, "");
    if (country === "PH") {
        if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`;
        if (/^9\d{9}$/.test(digits)) return `+63${digits}`;
        if (/^639\d{9}$/.test(digits)) return `+${digits}`;
    }

    return value.trim();
}

function validatePhone() {
    const input = document.getElementById("phoneNumber");
    const country = document.getElementById("phoneCountry")?.value || "PH";
    const value = input.value.trim();
    const phone = parsePhoneNumber(value, country);
    const isValid = phone ? phone.isValid() : isFallbackValidPhone(value, country);

    if (!value) {
        setFieldState(input, false, "Phone number is required.");
        return false;
    }

    if (!isValid) {
        setFieldState(input, false, "Please enter a valid phone number.");
        return false;
    }

    setFieldState(input, true);
    return true;
}

function validateConcern() {
    const input = document.getElementById("inquiryConcern");
    const value = input.value.trim();

    if (!value) {
        setFieldState(input, false, "Please select a concern.");
        return false;
    }

    setFieldState(input, true);
    return true;
}

function validateBranch() {
    const radios = document.querySelectorAll('input[name="branch"]');
    const selected = document.querySelector('input[name="branch"]:checked');
    const group = document.querySelector(".location-grid");
    const error = group.parentElement.querySelector(".input-error");

    radios.forEach((radio) => {
        radio.closest(".location-option").classList.remove("valid", "error");
    });

    if (!selected) {
        error.textContent = "Please select a preferred branch.";

        radios.forEach((radio) => {
            radio.closest(".location-option").classList.add("error");
        });

        return false;
    }

    error.textContent = "";

    selected.closest(".location-option").classList.add("valid");

    return true;
}

document.querySelectorAll('input[name="branch"]').forEach((radio) => {
    radio.addEventListener("change", validateBranch);
});

function validateMessage() {
    const input = document.getElementById("inquiryMessage");
    const value = input.value.trim();

    if (!value) {
        setFieldState(input, false, "Message is required.");
        return false;
    }

    if (value.length < 10) {
        setFieldState(input, false, "Message must be at least 10 characters.");
        return false;
    }

    setFieldState(input, true);
    return true;
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

    if (inquiryForm) {
        inquiryForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const fullName = fullNameInput ? fullNameInput.value.trim() : "";
            const emailAddress = emailInput ? emailInput.value.trim() : "";
            const country = document.getElementById("phoneCountry")?.value || "PH";
            const phoneNumber = phoneInput ? phoneInput.value.trim() : "";
            const branchInput = inquiryForm.querySelector("input[name='branch']:checked");
            const branch = branchInput ? branchInput.value : "";
            const concern = concernInput ? concernInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

        const allFieldsEmpty =
            !fullName &&
            !emailAddress &&
            !phoneNumber &&
            !branch &&
            !concern &&
            !message;

        if (allFieldsEmpty) {
            showMessage(
                "Unable to Send Inquiry",
                "Please provide all required information before sending your inquiry."
            );

            return;
        }

        const validName = validateName();
        const validEmail = validateEmail();
        const validPhone = validatePhone();
        const validConcern = validateConcern();
        const validBranch = validateBranch();
        const validMessage = validateMessage();

        const isValid =
            validName &&
            validEmail &&
            validPhone &&
            validConcern &&
            validBranch &&
            validMessage;

        if (!isValid) {
            return;
        }

        const internationalPhone = toInternationalPhone(phoneNumber, country);

            try {
                const response = await fetch(`${API_BASE_URL}/api/website/saveInquiry`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName,
                        emailAddress,
                        phoneNumber: internationalPhone,
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