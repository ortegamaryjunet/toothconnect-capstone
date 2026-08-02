    const API_BASE_URL = (() => {
        const PROD_API = "https://api.smileempressdentalhub.com";

        try {
            const params = new URLSearchParams(window.location.search || "");
            const override =
                params.get("apiBase") ||
                window.__TOOTHCONNECT_API_BASE_URL__;

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

            if (!el) 
                return;

            if (value === null || value === undefined) {
                el.textContent = "";
                return;
            }

            el.textContent = String(value);
        }

        function normalizeText(value) {
            return String(value || "")
                .toLowerCase()
                .replace(/[\s\-_\/]/g, "");
        }

        function buildImage(path, fallbackImage) {
            if (!path)
                return fallbackImage;

            if (path.startsWith("http://") || path.startsWith("https://"))
                return path;

            if (path.startsWith("./images/"))
                return path;

            if (path.startsWith("/images/"))
                return path;

            if (path.startsWith("images/"))
                return "./" + path;

            if (path.startsWith("/uploads/"))
                return API_BASE_URL + path;

            return API_BASE_URL + "/uploads/" + path.replace(/^\/+/, "");
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

                hero.style.backgroundImage =
                    `linear-gradient(
                        rgba(15,23,42,.38),
                        rgba(15,23,42,.38)
                    ),
                    url("${service.image || fallback.image}")`;

                hero.style.backgroundSize = "cover";
                hero.style.backgroundPosition = "center";
                hero.style.backgroundRepeat = "no-repeat";
            }

            const beforeImg = document.getElementById("comparisonBeforeImg");

            if (beforeImg && service.beforeImage) {
                beforeImg.src = service.beforeImage;
            }

            const afterImg = document.getElementById("comparisonAfterImg");

            if (afterImg && service.afterImage) {
                afterImg.src = service.afterImage;
            }

            const comparisonRange =
                document.getElementById("comparisonRange");

            const comparisonAfter =
                document.getElementById("comparisonAfter");

            const comparisonLine =
                document.getElementById("comparisonLine");

            if (
                comparisonRange &&
                comparisonAfter &&
                comparisonLine
            ) {

                comparisonRange.value = 50;

                comparisonAfter.style.width = "50%";

                comparisonLine.style.left = "50%";
            }

            document.title =
                (service.title || "Dental Service");
        }
        
        const summaryCard =
            document.querySelector(".summary-card");

        const summaryToggle =
            document.getElementById("summaryToggle");

        const summaryLinks =
            document.querySelectorAll(".summary-links a");

        if (summaryCard && summaryToggle) {

            summaryToggle.addEventListener("click", function () {

                if (window.innerWidth <= 720) {

                    summaryCard.classList.toggle("active");
                }
            });
        }

        summaryLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                if (
                    summaryCard &&
                    window.innerWidth <= 720
                ) {

                    summaryCard.classList.remove("active");
                }
            });
        });

        window.addEventListener("resize", function () {

            if (
                summaryCard &&
                window.innerWidth > 720
            ) {

                summaryCard.classList.remove("active");
            }
        });

        const comparisonRange =
            document.getElementById("comparisonRange");

        const comparisonAfter =
            document.getElementById("comparisonAfter");

        const comparisonLine =
            document.getElementById("comparisonLine");

        if (
            comparisonRange &&
            comparisonAfter &&
            comparisonLine
        ) {

            comparisonRange.addEventListener(
                "input",
                function () {

                    const value =
                        comparisonRange.value + "%";

                    comparisonAfter.style.width = value;

                    comparisonLine.style.left = value;
                }
            );
        }

        // Load Service from Admin Settings

        async function loadService() {

            try {

                const response = await fetch(
                    API_BASE_URL + "/api/website/services"
                );

                if (!response.ok) {
                    throw new Error("Unable to load services.");
                }

                const data = await response.json();

                const services = Array.isArray(data.services)
                    ? data.services
                    : [];

                // Match service by slug

                let dbService = services.find(function (item) {

                    return (
                        normalizeText(item.slug) === normalizeText(serviceKey)
                    );
                });


                if (!dbService) {

                    dbService = services.find(function (item) {

                        return (
                            normalizeText(item.name) === normalizeText(serviceKey)
                        );
                    });
                }

                if (!dbService) {

                    console.warn(
                        "Service not found:",
                        serviceKey
                    );

                    applyToPage(fallback);

                    return;
                }


                applyToPage({

                    title:
                        dbService.name ||
                        fallback.title,

                    image:
                        buildImage(
                            dbService.image_path,
                            fallback.image
                        ),

                    beforeImage:
                        buildImage(
                            dbService.before_image,
                            fallback.beforeImage
                        ),

                    afterImage:
                        buildImage(
                            dbService.after_image,
                            fallback.afterImage
                        ),

                    intro:
                        dbService.intro ||
                        fallback.intro,

                    heading:
                        dbService.heading ||
                        fallback.heading,

                    overview:
                        dbService.overview ||
                        fallback.overview,

                    benefits:
                        dbService.benefits ||
                        fallback.benefits,

                    process:
                        dbService.process ||
                        fallback.process,

                    care:
                        dbService.care ||
                        fallback.care,

                    duration:
                        dbService.duration ||
                        fallback.duration,

                    ideal:
                        dbService.ideal_for ||
                        fallback.ideal,

                    reminders:
                        dbService.reminder ||
                        fallback.reminders

                });

            }
            catch (error) {
                console.error(error);

                applyToPage(fallback);
            }
        }

        loadService();

    });