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

document.addEventListener("DOMContentLoaded", function () {
    var services = {
        scaling: {
            title: "Deep Scaling",
            image: "./images/deep-scaling.webp",
            intro: "Deep scaling removes plaque, tartar, and buildup for healthier gums.",
            heading: "A Comprehensive Guide to Deep Scaling",
            overview: "Deep scaling is a dental cleaning treatment that removes plaque, tartar, and bacteria from teeth and gum areas.",
            benefits: "Deep scaling helps improve gum health, reduce bad breath, prevent gum disease, and protect teeth from tartar buildup.",
            process: "The dentist carefully cleans around the teeth and gumline using dental tools to remove hardened deposits.",
            care: "Brush gently, floss daily, use mouthwash if advised, and follow your dentist's cleaning schedule."
        },
        smilemakeovers: {
            title: "Smile Make-Overs",
            image: "./images/smile-makeover.jpg",
            intro: "Smile make-overs improve the overall look of your smile through personalized cosmetic dental treatments.",
            heading: "A Comprehensive Guide to Smile Make-Overs",
            overview: "Smile make-overs are customized treatments that improve tooth color, shape, size, spacing, alignment, and smile balance.",
            benefits: "They can improve confidence, tooth appearance, and overall smile harmony.",
            process: "The dentist checks your teeth, gums, and smile goals before creating a treatment plan. It may include whitening, veneers, crowns, restorations, or orthodontic treatment.",
            care: "Brush and floss daily, avoid biting hard objects, limit stain-causing food and drinks, and visit your dentist regularly."
        },
        whitening: {
            title: "Teeth Whitening",
            image: "./images/teeth-whitening.jpg",
            intro: "Teeth whitening helps reduce stains and brighten your smile.",
            heading: "A Comprehensive Guide to Teeth Whitening",
            overview: "Teeth whitening is a cosmetic dental treatment that helps lighten tooth color and reduce visible stains.",
            benefits: "It improves smile brightness and gives a cleaner, fresher appearance.",
            process: "A whitening solution is applied to the teeth to help break down stains and improve tooth color.",
            care: "Avoid dark drinks, smoking, and stain-causing food after treatment. Brush regularly and follow your dentist's advice."
        },
        veneers: {
            title: "Veneers",
            image: "./images/veneers.jpg",
            intro: "Veneers improve tooth shape, color, spacing, and smile appearance.",
            heading: "A Comprehensive Guide to Veneers",
            overview: "Veneers are thin covers placed on the front surface of teeth to improve their appearance.",
            benefits: "They improve stained, chipped, uneven, or slightly spaced teeth.",
            process: "The tooth surface is prepared, impressions are taken, and the veneer is bonded to the front of the tooth.",
            care: "Brush and floss daily, avoid biting hard objects, and visit your dentist regularly."
        },
        crowns: {
            title: "Porcelain Jacket Crowns",
            image: "./images/crowns.jpeg",
            intro: "Porcelain jacket crowns restore damaged teeth while improving strength and appearance.",
            heading: "A Comprehensive Guide to Porcelain Jacket Crowns",
            overview: "Porcelain jacket crowns are tooth-shaped covers placed over damaged or weakened teeth.",
            benefits: "They protect weak teeth, improve chewing function, restore damaged teeth, and improve smile appearance.",
            process: "The dentist prepares the tooth, takes impressions, and places a custom crown over the tooth.",
            care: "Brush and floss daily, avoid biting hard objects, and visit your dentist for regular checkups."
        },
        dentures: {
            title: "Dentures",
            image: "./images/dentures.jpg",
            intro: "Dentures replace missing teeth for chewing, speaking, and smiling support.",
            heading: "A Comprehensive Guide to Dentures",
            overview: "Dentures are removable tooth replacements used to restore missing teeth and support daily oral function.",
            benefits: "They restore smile appearance, support chewing, improve speech, and help maintain facial shape.",
            process: "The dentist takes impressions, creates custom dentures, and adjusts them for comfort and fit.",
            care: "Clean dentures daily, store them properly, and visit your dentist for adjustments when needed."
        },
        rootcanal: {
            title: "Root Canal Treatment",
            image: "./images/root-canal.jpg",
            intro: "Root canal treatment helps save infected or damaged teeth.",
            heading: "A Comprehensive Guide to Root Canal Treatment",
            overview: "Root canal treatment removes infected or damaged tissue inside the tooth.",
            benefits: "It relieves pain, removes infection, saves the natural tooth, and prevents the problem from spreading.",
            process: "The infected pulp is removed, the inside of the tooth is cleaned, filled, and sealed.",
            care: "Avoid hard foods until the tooth is fully restored. Brush, floss, and attend follow-up visits."
        },
        braces: {
            title: "Braces",
            image: "./images/braces.jpg",
            intro: "Learn about braces, including types, colors, materials, and possible costs.",
            heading: "A Comprehensive Guide to Braces",
            overview: "Braces are orthodontic appliances used to correct teeth misalignment, bite problems, gaps, and overcrowding.",
            benefits: "Braces improve smile appearance, bite balance, oral function, and long-term dental health.",
            process: "The dentist attaches brackets and wires to guide teeth into better positions over time.",
            care: "Brush carefully around brackets and wires, floss daily, avoid sticky or hard foods, and attend adjustment appointments."
        },
        aligners: {
            title: "Clear Aligners",
            image: "./images/clear-aligner.webp",
            intro: "Clear aligners straighten teeth using removable trays.",
            heading: "A Comprehensive Guide to Clear Aligners",
            overview: "Clear aligners are removable trays that gradually move teeth into better alignment.",
            benefits: "They are clear, removable, comfortable, and easier to clean compared to braces.",
            process: "A series of custom aligners is made for the patient and worn daily based on the dentist's schedule.",
            care: "Clean aligners daily, remove them when eating, and keep them in their case when not in use."
        },
        implants: {
            title: "Dental Implants",
            image: "./images/dental-implant.jpg",
            intro: "Dental implants replace missing teeth and restore chewing comfort.",
            heading: "A Comprehensive Guide to Dental Implants",
            overview: "Dental implants are artificial tooth roots placed in the jawbone to support replacement teeth.",
            benefits: "They improve chewing ability, restore smile appearance, support nearby teeth, and improve confidence.",
            process: "The implant is placed in the jawbone and allowed to heal. After healing, a crown or replacement tooth is attached.",
            care: "Keep the area clean, brush and floss daily, avoid smoking, and visit your dentist regularly."
        }
    };

    var aliases = {
        "deep-scaling": "scaling",      "scaling": "scaling",
        "smile-makeovers": "smilemakeovers", "smilemakeovers": "smilemakeovers", "smile": "smilemakeovers",
        "teeth-whitening": "whitening", "whitening": "whitening",
        "veneers": "veneers",
        "porcelain-crowns": "crowns",   "porcelain-jacket-crowns": "crowns", "crowns": "crowns",
        "dentures": "dentures",
        "root-canal": "rootcanal",      "rootcanal": "rootcanal",
        "braces": "braces",
        "clear-aligners": "aligners",   "aligners": "aligners",
        "dental-implants": "implants",  "implants": "implants"
    };

    var params = new URLSearchParams(window.location.search);
    var serviceKey = (params.get("service") || "braces").trim().toLowerCase();
    serviceKey = aliases[serviceKey] || serviceKey;
    var fallback = services[serviceKey] || services.braces;

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el && value) el.textContent = value;
    }

    function applyToPage(title, image, intro, heading, overview, benefits, process, care) {
        setText("serviceTitle",  title);
        setText("serviceCrumb",  title);
        setText("serviceIntro",  intro);
        setText("mainHeading",   heading);
        setText("overview",      overview);
        setText("benefitsText",  benefits);
        setText("processText",   process);
        setText("careText",      care);

        var hero = document.getElementById("serviceHero");
        if (hero && image) {
            hero.style.backgroundImage =
                "linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.35)), url(\"" + image + "\")";
        }
    }

    // Render from hardcoded fallback immediately (no flash of empty content)
    applyToPage(
        fallback.title, fallback.image, fallback.intro,
        fallback.heading, fallback.overview,
        fallback.benefits, fallback.process, fallback.care
    );

    // Override with database data where available
    // Use Website CMS services (admin-editable via website_services table)
    fetch(API_BASE_URL + "/api/website/services")
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var list = data.services || [];

            // Match by slug first, then by normalised name
            var dbSvc = list.find(function (s) { return s.slug === serviceKey; });
            if (!dbSvc) {
                dbSvc = list.find(function (s) {
                    return (s.name || "").toLowerCase().replace(/[\s\-]/g, "") ===
                           serviceKey.replace(/[\s\-]/g, "");
                });
            }

            if (!dbSvc) return; // keep hardcoded entirely

            applyToPage(
                dbSvc.name        || fallback.title,
                dbSvc.image_path  || fallback.image,
                dbSvc.description || fallback.intro,
                "A Comprehensive Guide to " + (dbSvc.name || fallback.title),
                dbSvc.description || fallback.overview,
                fallback.benefits,  // DB has no separate benefits field
                fallback.process,   // DB has no separate process field
                fallback.care       // DB has no separate care field
            );
        })
        .catch(function () { /* keep hardcoded fallback */ });
});
