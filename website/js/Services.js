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

        if (
            hostname === "www.smileempressdentalhub.com" ||
            hostname === "smileempressdentalhub.com"
        ) {
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

        const separator = url.includes("?") ? "&" : "?";

        return url + separator + "_cb=" + Date.now();
    }

    function buildImage(value) {
        if (!value) {
            return "";
        }

        const image = String(value).trim();

        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
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

    function setComparisonImage(img, src, altText) {
        if (!img) {
            return;
        }

        img.src = "";

        img.onload = function () {
            console.log("[Services] Loaded image:", img.id, img.currentSrc || img.src);
        };

        img.onerror = function () {
            console.error("[Services] Failed to load image:", img.id, src);
        };

        img.alt = altText;
        img.src = src;
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

        setText(
            "durationText",
            service.duration ||
            "Treatment duration depends on the patient's condition."
        );

        setText(
            "idealText",
            service.ideal ||
            "Please consult our dentist to determine whether this treatment is suitable for you."
        );

        setText(
            "remindersText",
            service.reminders ||
            "Please follow your dentist's recommendations before and after treatment."
        );

        const hero = document.getElementById("serviceHero");

        if (hero) {
            const heroImage = service.image || fallback.image;

            hero.style.backgroundImage =
                `linear-gradient(
                    rgba(15,23,42,.38),
                    rgba(15,23,42,.38)
                ),
                url("${heroImage}")`;

            hero.style.backgroundSize = "cover";
            hero.style.backgroundPosition = "center";
            hero.style.backgroundRepeat = "no-repeat";
        }

        const comparisonSection = document.getElementById("comparisonSection");
        const beforeImg = document.getElementById("comparisonBeforeImg");
        const afterImg = document.getElementById("comparisonAfterImg");
        const comparisonBefore = document.getElementById("comparisonBefore");
        const comparisonRange = document.getElementById("comparisonRange");
        const comparisonLine = document.getElementById("comparisonLine");
        const beforeTag = document.getElementById("beforeTag");
        const afterTag = document.getElementById("afterTag");

        if (
            comparisonSection &&
            service.beforeImage &&
            service.afterImage
        ) {
            comparisonSection.style.display = "";

            console.log("[Services] BEFORE IMAGE:", service.beforeImage);
            console.log("[Services] AFTER IMAGE:", service.afterImage);

            if (beforeImg) {
                beforeImg.style.width = "100%";
                beforeImg.style.height = "100%";
                beforeImg.style.objectFit = "cover";
                beforeImg.style.objectPosition = "center";

                setComparisonImage(
                    beforeImg,
                    service.beforeImage,
                    "Before dental treatment"
                );
            }

            if (afterImg) {
                afterImg.style.width = "100%";
                afterImg.style.height = "100%";
                afterImg.style.objectFit = "cover";
                afterImg.style.objectPosition = "center";

                setComparisonImage(
                    afterImg,
                    service.afterImage,
                    "After dental treatment"
                );
            }

            if (
                comparisonRange &&
                comparisonBefore &&
                comparisonLine
            ) {
                comparisonRange.value = 50;
                comparisonBefore.style.width = "50%";
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

    if (
        comparisonRange &&
        comparisonBefore &&
        comparisonLine
    ) {
        function updateComparison() {
            const value = Number(comparisonRange.value);

            comparisonBefore.style.width = value + "%";
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
            const response = await fetch(
                API_BASE_URL + "/api/website/services?_cb=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load services.");
            }

            const data = await response.json();

            const services = Array.isArray(data.services)
                ? data.services
                : [];

            console.log("[Services] API services:", services);

            let dbService = services.find(function (item) {
                return (
                    normalizeText(item.slug) ===
                    normalizeText(serviceKey)
                );
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
                console.warn(
                    "[Services] Service not found:",
                    serviceKey
                );

                applyToPage(fallback);
                return;
            }

            console.log("[Services] Selected service:", dbService);
            console.log(
                "[Services] Database before_image:",
                dbService.before_image
            );
            console.log(
                "[Services] Database after_image:",
                dbService.after_image
            );

            const beforeImage = buildImage(
                dbService.before_image,
                fallback.beforeImage
            );

            const afterImage = buildImage(
                dbService.after_image,
                fallback.afterImage
            );

            console.log(
                "[Services] Final BEFORE URL:",
                beforeImage
            );

            console.log(
                "[Services] Final AFTER URL:",
                afterImage
            );

            applyToPage({
                title: dbService.name || fallback.title,
                image: buildImage(
                    dbService.image_path,
                    fallback.image
                ),
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
            console.error(
                "[Services] Error loading service:",
                error
            );

            applyToPage(fallback);
        }
    }

    loadService();
});