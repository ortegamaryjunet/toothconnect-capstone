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

        if (hostname === "www.smileempressdentalhub.com" || hostname === "smileempressdentalhub.com") {
            return PROD_API;
        }
    } catch (_) {}

    return PROD_API;
})();

document.addEventListener("DOMContentLoaded", function () {

    const aliases = {
        "deep-scaling": "scaling",
        "scaling": "scaling",

        "smile-makeovers": "smilemakeovers",
        "smilemakeovers": "smilemakeovers",
        "smile": "smilemakeovers",

        "teeth-whitening": "whitening",
        "whitening": "whitening",

        "veneers": "veneers",

        "porcelain-crowns": "crowns",
        "porcelain-jacket-crowns": "crowns",
        "crowns": "crowns",

        "dentures": "dentures",

        "root-canal": "rootcanal",
        "rootcanal": "rootcanal",

        "braces": "braces",

        "clear-aligners": "aligners",
        "aligners": "aligners",

        "dental-implants": "implants",
        "implants": "implants"
    };

    const params = new URLSearchParams(window.location.search);

    let serviceKey = (
        params.get("service") || "braces"
    )
        .trim()
        .toLowerCase();

    serviceKey = aliases[serviceKey] || serviceKey;

    const fallback = {
        title: "Dental Service",
        image: "",
        beforeImage: null,
        afterImage: null,
        intro: "",
        heading: "",
        overview: "",
        benefits: "",
        process: "",
        care: "",
        duration: "",
        ideal: "",
        reminders: ""
    };

    function setText(id, value) {
        const el = document.getElementById(id);

        if (!el) {
            return;
        }

        if (value === null || value === undefined) {
            el.textContent = "";
            return;
        }

        el.textContent = String(value);
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/[\s\-_\/]/g, "");
    }

    function addCacheBuster(url) {
        if (!url) {
            return "";
        }

        return url;
    }

    function buildImage(value) {
        if (!value) {
            return "";
        }

        const image = stripVolatileImageParams(String(value).trim());

        if (image.startsWith("http://") || image.startsWith("https://")) {
            return optimizeCloudinaryImage(image, 1200);
        }

        if (image.startsWith("/images/")) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return `${API_BASE_URL}${image}`;
        }

        if (image.startsWith("uploads/")) {
            return `${API_BASE_URL}/${image}`;
        }

        return `${API_BASE_URL}/uploads/${image}`;
    }

    function stripVolatileImageParams(url) {
        if (!url) return "";

        try {
            const parsed = new URL(url, window.location.origin);

            ["v", "_cb", "cb", "cacheBust"].forEach(function (param) {
                parsed.searchParams.delete(param);
            });

            if (url.startsWith("http://") || url.startsWith("https://")) {
                return parsed.toString();
            }

            return parsed.pathname + parsed.search + parsed.hash;
        } catch (_) {
            return String(url).replace(/([?&])(?:v|_cb|cb|cacheBust)=\d+&?/g, "$1").replace(/[?&]$/, "");
        }
    }

    function optimizeCloudinaryImage(url, width) {
        if (!url || !/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) {
            return url;
        }

        return url.replace(
            /\/image\/upload\/(?!f_auto|q_auto|c_limit|w_\d+)(?:v\d+\/)?/,
            function (match) {
                return match + `f_auto,q_auto:eco,c_limit,w_${width || 1200}/`;
            }
        );
    }

    function setComparisonImage(img, src, altText) {
        if (!img || !src) {
            return;
        }

        img.alt = altText;
        img.src = addCacheBuster(src);

        img.onerror = function () {
            console.error("Failed to load comparison image:", img.src);
        };
    }

    function applyToPage(service) {
        service = service || {};

        setText("serviceTitle", service.title);
        setText("serviceCrumb", service.title);
        setText("serviceIntro", service.intro);
        setText("mainHeading", service.heading);
        setText("overview", service.overview);
        setText("benefitsText", service.benefits);
        setText("processText", service.process);
        setText("careText", service.care);

        setText("durationText", service.duration ||  "Treatment duration depends on the patient's condition.");
        setText("idealText", service.ideal || "Please consult our dentist to determine whether this treatment is suitable for you.");
        setText("remindersText", service.reminders || "Please follow your dentist's recommendations before and after treatment.");

        const hero = document.getElementById("serviceHero");
        const heroImg = document.getElementById("serviceHeroImage");

        if (hero) {
            const heroImage = service.image || fallback.image;

            if (heroImg && heroImage) {
                heroImg.src = heroImage;
                heroImg.alt = service.title ? `${service.title} dental service` : "";
            }
        }

        const comparisonSection = document.getElementById("comparisonSection");
        const beforeImg = document.getElementById("comparisonBeforeImg");
        const afterImg = document.getElementById("comparisonAfterImg");
        const comparisonBefore = document.getElementById("comparisonBefore");
        const comparisonRange = document.getElementById("comparisonRange");
        const comparisonLine = document.getElementById("comparisonLine");
        const beforeTag = document.getElementById("beforeTag");
        const afterTag = document.getElementById("afterTag");

        if (comparisonSection && service.beforeImage && service.afterImage) {
            comparisonSection.style.display = "";

            setComparisonImage(beforeImg, service.beforeImage, "Before dental treatment");

            setComparisonImage(afterImg, service.afterImage, "After dental treatment");

            if (comparisonRange && comparisonBefore && comparisonLine) {
                comparisonRange.value = 50;
                comparisonBefore.style.clipPath = "inset(0 50% 0 0)";
                comparisonLine.style.left = "50%";
            }

            if (beforeTag) {
                beforeTag.style.opacity = "1";
            }

            if (afterTag) {
                afterTag.style.opacity = "1";
            }
        } else if (comparisonSection) {
            comparisonSection.style.display = "none";
        }

        document.title = service.title || "Dental Service";
    }

    const summaryCard = document.querySelector(".summary-card");
    const summaryToggle = document.getElementById("summaryToggle");
    const summaryLinks = document.querySelectorAll(".summary-links a");

    if (summaryCard && summaryToggle) {
        summaryToggle.addEventListener("click", function () {
            if (window.innerWidth <= 720) {
                summaryCard.classList.toggle("active");
            }
        });
    }

    summaryLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (summaryCard && window.innerWidth <= 720) {
                summaryCard.classList.remove("active");
            }
        });
    });

    window.addEventListener("resize", function () {
        if (summaryCard && window.innerWidth > 720) {
            summaryCard.classList.remove("active");
        }
    });

    const comparisonRange = document.getElementById("comparisonRange");
    const comparisonBefore = document.getElementById("comparisonBefore");
    const comparisonLine = document.getElementById("comparisonLine");
    const beforeTag = document.getElementById("beforeTag");
    const afterTag = document.getElementById("afterTag");

    if (comparisonRange && comparisonBefore && comparisonLine) {
        function updateComparison() {
            const value = Number(comparisonRange.value);

            comparisonBefore.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
            comparisonLine.style.left = value + "%";

            if (beforeTag && afterTag) {
                if (value === 0) {
                    beforeTag.style.opacity = "0";
                    afterTag.style.opacity = "1";
                } else if (value === 100) {
                    beforeTag.style.opacity = "1";
                    afterTag.style.opacity = "0";
                } else {
                    beforeTag.style.opacity = "1";
                    afterTag.style.opacity = "1";
                }
            }
        }

        comparisonRange.addEventListener(
            "input",
            function () {
                updateComparison();
            }
        );

        updateComparison();
    }

    async function loadService() {
        try {
            const response = await fetch(API_BASE_URL + "/api/website/services?_cb=" + Date.now(), {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load services.");
            }

            const data = await response.json();
            const services = Array.isArray(data.services) ? data.services : [];

            let dbService = services.find(function (item) {
                return (normalizeText(item.slug) === normalizeText(serviceKey));
            });

            if (!dbService) {
                dbService = services.find(function (item) {
                    return (
                        normalizeText(item.name) ===
                        normalizeText(serviceKey)
                    );
                });
            }

            if (!dbService) {
                applyToPage(fallback);
                return;
            }

            const beforeImage = buildImage(dbService.before_image, fallback.beforeImage);
            const afterImage = buildImage(dbService.after_image, fallback.afterImage);

            applyToPage({
                title: dbService.name || fallback.title,
                image: buildImage(dbService.image_path, fallback.image),
                beforeImage: beforeImage,
                afterImage: afterImage,
                intro: dbService.intro || fallback.intro,
                heading: dbService.heading || fallback.heading,
                overview: dbService.overview || fallback.overview,
                benefits: dbService.benefits || fallback.benefits,
                process: dbService.process || fallback.process,
                care: dbService.care || fallback.care,
                duration: dbService.duration || fallback.duration,
                ideal: dbService.ideal_for || fallback.ideal,
                reminders: dbService.reminder || fallback.reminders
            });

        } catch (error) {
            applyToPage(fallback);
        }
    }

    loadService();
});
