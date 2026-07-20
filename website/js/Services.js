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
    } catch (_) {
        // Ignore and use production API
    }

    return PROD_API;
})();

document.addEventListener("DOMContentLoaded", function () {
    var services = {
        scaling: {
            title: "Deep Scaling",
            image: "./images/deep-scaling.webp",
            beforeImage: "./images/scaling-before.jpg",
            afterImage: "./images/scaling-after.jpg",
            intro: "Deep Scaling is a dental treatment that removes plaque, tartar, and harmful bacteria from below the gumline to improve gum health and help prevent the progression of gum disease.",
            heading: "Everything You Need to Know About Deep Scaling",
            overview: "Deep Scaling, also known as scaling and root planing, is recommended for patients with moderate to advanced plaque and tartar buildup beneath the gums. The procedure thoroughly cleans the tooth surfaces and root areas, removing bacteria that cause gum inflammation while allowing the gums to heal and reattach to the teeth.",
            benefits: "Deep Scaling helps reduce gum inflammation, control bleeding gums, eliminate harmful bacteria, improve bad breath, prevent the progression of gum disease, reduce pocket depth around the teeth, and support long-term oral health.",
            process: "Our dentist will examine your gums and measure the depth of the gum pockets before beginning treatment. Using specialized dental instruments, plaque, tartar, and bacteria are carefully removed from above and below the gumline. The tooth roots are then smoothed to make it more difficult for bacteria to accumulate and to encourage healthy gum healing.",
            care: "Brush gently using a soft toothbrush, floss every day, use any prescribed mouthwash as directed, avoid smoking during healing, eat soft foods if your gums feel sensitive, and attend all recommended follow-up appointments to monitor gum health.",
            duration: "Treatment usually takes between 45 minutes and 2 hours depending on the amount of buildup, the number of teeth involved, and the severity of the gum condition.",
            ideal: "Deep scaling is recommended for patients with heavy plaque and tartar buildup, bleeding gums, gum recession, persistent bad breath, deep gum pockets, or early to moderate gum disease.",
            reminders: "Mild gum tenderness, slight bleeding, or temporary tooth sensitivity may occur after treatment and usually improves within a few days. Maintaining good oral hygiene and regular dental cleanings helps prevent future gum problems."
        },

        smilemakeovers: {
            title: "Smile Make-Overs",
            image: "./images/smile-makeover.jpg",
            beforeImage: "./images/smilemakeover-before.jpg",
            afterImage: "./images/smilemakeover-after.jpg",
            intro: "Smile Make-overs combine multiple cosmetic and restorative dental treatments to enhance the appearance, function, and overall harmony of your smile based on your individual needs and goals.",
            heading: "Everything You Need to Know About Smile Make-Overs",
            overview: "A smile make-over is a personalized treatment plan designed to improve the color, shape, size, alignment, spacing, and balance of your teeth. Depending on your oral condition and desired results, treatment may include teeth whitening, veneers, crowns, dental bonding, orthodontics, dental implants, gum contouring, or other restorative procedures.",
            benefits: "Smile make-overs improve smile aesthetics, increase self-confidence, correct discoloration, repair damaged teeth, close gaps, improve alignment, restore missing teeth, enhance facial harmony, and create a healthier, more attractive smile.",
            process: "Our dentist will perform a comprehensive examination, discuss your concerns and smile goals, take photographs, digital scans, or impressions, and develop a customized treatment plan. Depending on your needs, treatment may be completed in a single procedure or through multiple appointments combining different dental services to achieve the desired outcome.",
            care: "Brush twice daily, floss regularly, attend routine dental checkups, avoid biting hard objects, limit foods and beverages that may stain your teeth, and follow your dentist's recommendations to maintain your new smile.",
            duration: "Treatment time varies depending on the number and type of procedures included in your personalized treatment plan. Some smile make-overs can be completed within a few visits, while more comprehensive cases may require several months.",
            ideal: "Smile make-overs are ideal for patients who want to improve the appearance of discolored, chipped, worn, uneven, misaligned, or missing teeth while achieving a healthier and more confident smile.",
            reminders: "Every smile is unique, and treatment recommendations are based on your oral health, cosmetic goals, and overall dental condition. A consultation is the best way to determine the most suitable combination of treatments for your desired results."
        },

        whitening: {
            title: "Teeth Whitening",
            image: "./images/teeth-whitening.jpg",
            beforeImage: "./images/whitening-before.jpg",
            afterImage: "./images/whitening-after.jpg",
            intro: "Teeth Whitening is a cosmetic dental treatment that helps brighten your smile by reducing stains and discoloration.",
            heading: "Everything You Need to Know About Teeth Whitening",
            overview: "Teeth can become stained from coffee, tea, soft drinks, red wine, smoking, certain foods, aging, and poor oral hygiene. Teeth whitening uses a specially formulated whitening gel that helps break down stains within the enamel, making your teeth appear noticeably brighter. Results vary depending on the type and severity of the discoloration.",
            benefits: "Teeth whitening enhances the appearance of your smile by reducing stains and yellowing, giving your teeth a cleaner and brighter look. It can improve confidence, refresh your overall appearance, and provide noticeable results in a short amount of time without altering the natural structure of your teeth.",
            process: "Our dentist will first examine your teeth and gums to ensure they are suitable for whitening. The teeth are cleaned if needed, and the gums are protected before the whitening gel is carefully applied. Depending on the whitening system, the gel may be activated with a special light. The treatment is completed in several stages until the desired shade is achieved, after which the gel is removed and your teeth are rinsed.",
            care: "For the first 24 to 48 hours, avoid foods and drinks that can stain your teeth, including coffee, tea, red wine, soft drinks, tomato-based sauces, and colored beverages. Avoid smoking, brush and floss daily, and continue regular dental checkups to help maintain your brighter smile.",
            duration: "The procedure usually takes between 30 and 1 hour, depending on the condition of your teeth and the whitening method used.",
            ideal: "Teeth whitening is ideal for individuals with healthy teeth and gums who want to reduce yellowing or stains caused by food, beverages, tobacco, or natural aging. It works best on natural teeth and may not change the color of dental fillings, crowns, or veneers.",
            reminders: "Results vary from person to person depending on tooth condition, lifestyle, and oral hygiene habits. Some patients may experience temporary tooth sensitivity after treatment, which usually subsides within a few days. Regular brushing, flossing, and routine dental visits can help maintain longer-lasting whitening results."
        },

        veneers: {
            title: "Veneers",
            image: "./images/veneers.jpg",
            beforeImage: "./images/veneers-before.jpg",
            afterImage: "./images/veneers-after.jpg",
            intro: "Dental Veneers are thin shells placed over the front surface of teeth to improve the appearance of your smile.",
            heading: "Everything You Need to Know About Dental Veneers",
            overview: "Veneers are custom-made restorations that cover the front surface of teeth to correct cosmetic concerns such as discoloration, chips, cracks, worn edges, uneven shapes, and small gaps. They are carefully crafted to match the surrounding teeth, creating a brighter and more balanced smile while maintaining a natural appearance.",
            benefits: "Dental veneers improve the color, shape, size, and alignment of teeth while covering stains, chips, cracks, and minor gaps. They provide a long-lasting smile enhancement, resist staining better than natural enamel, and deliver natural-looking results that boost confidence.",
            process: "Our dentist will examine your teeth, discuss your desired smile, and prepare a small amount of the tooth surface if necessary. Impressions are then taken to create custom veneers. During a follow-up visit, the veneers are checked for fit, color, and appearance before being permanently bonded to the teeth using a strong dental adhesive.",
            care: "Brush twice daily, floss regularly, avoid biting hard objects such as ice or pens, and wear a night guard if you grind your teeth. Maintain regular dental checkups and professional cleanings to keep your veneers and surrounding teeth healthy.",
            duration: "Treatment usually requires two or more visits depending on the number of teeth involved and the complexity of the case.",
            ideal: "Dental veneers are ideal for patients with stained, chipped, worn, uneven, misshapen, or slightly spaced teeth who want to improve the appearance of their smile.",
            reminders: "Veneers are durable but not indestructible. Good oral hygiene, regular dental visits, and avoiding excessive force on the teeth will help extend their lifespan."
        },

        crowns: {
            title: "Porcelain Jacket Crowns",
            image: "./images/crowns.jpeg",
            beforeImage: "./images/crowns-before.jpg",
            afterImage: "./images/crowns-after.jpg",
            intro: "Porcelain Jacket Crowns are custom-made tooth coverings that restore the strength, function, and appearance of damaged or weakened teeth while blending naturally with your smile.",
            heading: "Everything You Need to Know About Porcelain Jacket Crowns",
            overview: "A porcelain jacket crown completely covers the visible portion of a damaged tooth to protect it from further wear while restoring its natural shape, size, and color. Crowns are commonly recommended for teeth that are cracked, broken, severely decayed, worn down, or have undergone root canal treatment.",
            benefits: "Porcelain Jacket Crowns restore damaged teeth, improve chewing ability, strengthen weakened teeth, protect teeth from further damage, improve appearance, and provide a durable, natural-looking restoration that matches surrounding teeth.",
            process: "Our dentist will examine and prepare the affected tooth by removing damaged areas and shaping it for the crown. Impressions are taken to fabricate a custom crown that fits comfortably and matches your natural teeth. A temporary crown may be placed while the permanent crown is being made. During the final visit, the custom crown is checked for fit and bite before being permanently cemented into place.",
            care: "Brush and floss daily, avoid chewing extremely hard foods or objects, maintain regular dental checkups, and keep the gums around the crown clean to prevent decay and gum disease.",
            duration: "Treatment generally requires two or more visits, although the number of appointments may vary depending on the condition of the tooth and the treatment plan.",
            ideal: "Porcelain Jacket Crowns are ideal for patients with cracked, broken, heavily filled, worn, weak, or root canal-treated teeth that require added protection and restoration.",
            reminders: "Although porcelain crowns are strong and durable, they should be cared for like natural teeth. Proper oral hygiene and regular dental visits help maintain the crown and the health of the supporting tooth and gums."
        },

        dentures: {
            title: "Dentures",
            image: "./images/dentures.jpg",
            beforeImage: "./images/dentures-before.jpg",
            afterImage: "./images/dentures-after.jpg",
            intro: "Dentures are custom-made removable dental appliances designed to replace missing teeth and restore your ability to eat, speak, and smile with confidence.",
            heading: "Everything You Need to Know About Dentures",
            overview: "Dentures are used to replace several or all missing teeth, helping restore both appearance and function. They are carefully designed to fit comfortably over the gums and can be made as complete dentures for patients who have lost all teeth or partial dentures for those with remaining healthy natural teeth.",
            benefits: "Dentures restore your smile, improve chewing ability, enhance speech, support facial structure, prevent the sunken appearance caused by missing teeth, and improve confidence during daily activities.",
            process: "Our dentist will examine your mouth, take detailed impressions, and create custom dentures that fit comfortably and naturally. Several appointments may be needed to check the fit, bite, and appearance before the final dentures are delivered. Adjustments may also be made to improve comfort after placement.",
            care: "Clean your dentures every day using a soft denture brush and denture cleanser, remove them before sleeping unless advised otherwise, soak them in clean water or denture solution overnight, and continue cleaning your gums, tongue, and any remaining natural teeth. Visit your dentist regularly for adjustments and routine examinations.",
            duration: "The complete treatment usually requires several appointments over a few weeks, depending on the type of denture and any additional procedures required.",
            ideal: "Dentures are ideal for patients who have lost several teeth or all of their teeth and want to restore normal chewing, speaking, facial support, and smile appearance.",
            reminders: "It may take a short adjustment period to become comfortable wearing new dentures. Minor soreness, increased saliva, or slight difficulty speaking and chewing are normal during the first few weeks. Regular dental visits help ensure your dentures continue to fit properly as your gums and jaw naturally change over time."
        },

        rootcanal: {
            title: "Root Canal Treatment",
            image: "./images/root-canal.jpg",
            beforeImage: "./images/rootcanal-before.jpg",
            afterImage: "./images/rootcanal-after.jpg",
            intro: "Root Canal Treatment is a procedure that removes infected or damaged tissue inside a tooth to eliminate pain, stop infection, and preserve the natural tooth whenever possible.",
            heading: "Everything You Need to Know About Root Canal Treatment",
            overview: "Inside every tooth is a soft tissue called the pulp, which contains nerves and blood vessels. When the pulp becomes infected due to deep decay, cracks, trauma, or repeated dental procedures, root canal treatment removes the infection, cleans the inside of the tooth, and seals it to prevent future problems while allowing you to keep your natural tooth.",
            benefits: "Root Canal Treatment relieves severe tooth pain, removes infection, prevents the spread of bacteria, preserves your natural tooth, restores normal chewing function, and helps avoid tooth extraction whenever possible.",
            process: "Our dentist begins by numbing the affected tooth before creating a small opening to access the infected pulp. The damaged tissue is carefully removed, and the root canals are cleaned, disinfected, shaped, and filled with a special material. The tooth is then sealed, and in many cases, a dental crown is recommended to restore its strength and protect it from future damage.",
            care: "Avoid chewing hard foods on the treated tooth until the final restoration is completed. Brush twice daily, floss regularly, attend all follow-up appointments, and maintain good oral hygiene to help keep the treated tooth healthy.",
            duration: "Treatment usually takes one to two visits, although more appointments may be necessary depending on the severity of the infection and the complexity of the tooth.",
            ideal: "Root Canal Treatment is recommended for patients with deep cavities, severe tooth pain, prolonged sensitivity to hot or cold, dental abscesses, cracked teeth, or infection affecting the dental pulp.",
            reminders: "Mild discomfort for a few days after treatment is normal and usually improves with prescribed or over-the-counter medication. A dental crown is often recommended for back teeth to provide additional strength and long-term protection."
        },

        braces: {
            title: "Braces",
            image: "./images/braces.jpg",
            beforeImage: "./images/braces-before.jpg",
            afterImage: "./images/braces-after.jpg",
            intro: "Braces are orthodontic appliances designed to gradually straighten teeth, correct bite problems, and improve the overall alignment of your smile.",
            heading: "Everything You Need to Know About Braces",
            overview: "Braces use brackets, wires, and other orthodontic components to apply gentle, continuous pressure that gradually moves teeth into their ideal positions. They can correct crooked teeth, overcrowding, gaps, overbites, underbites, crossbites, and other alignment issues while improving both appearance and oral health.",
            benefits: "Braces create a straighter smile, improve bite alignment, make teeth easier to clean, reduce the risk of tooth decay and gum disease caused by overcrowding, improve chewing and speech, and increase confidence.",
            process: "Our dentist or orthodontist will examine your teeth, take X-rays and impressions or digital scans, and develop a personalized treatment plan. Brackets are bonded to the teeth and connected with orthodontic wires that are adjusted periodically to guide the teeth into proper alignment throughout the treatment.",
            care: "Brush carefully after every meal using a soft toothbrush, floss daily with orthodontic floss or floss threaders, avoid sticky, chewy, and hard foods that may damage the braces, and attend all scheduled adjustment appointments to keep your treatment on track.",
            duration: "Treatment commonly lasts between 12 and 36 months depending on the severity of the alignment problem, the type of braces used, and patient cooperation.",
            ideal: "Braces are recommended for patients with crooked teeth, overcrowding, gaps, bite problems, or jaw alignment concerns who want to improve both function and appearance.",
            reminders: "Mild soreness after adjustments is normal and usually subsides within a few days. Wearing retainers after treatment is essential to help maintain your new smile and prevent teeth from shifting back."
        },

        aligners: {
            title: "Clear Aligners",
            image: "./images/clear-aligner.webp",
            beforeImage: "./images/aligners-before.jpg",
            afterImage: "./images/aligners-after.jpg",
            intro: "Clear Aligners are transparent, removable trays that gradually move teeth into better alignment while offering a discreet alternative to traditional braces.",
            heading: "Everything You Need to Know About Clear Aligners",
            overview: "Clear Aligners are custom-made plastic trays designed to gently shift teeth into their desired positions over time. Each set of aligners is worn for a specific period before progressing to the next set, allowing gradual and controlled tooth movement without brackets or wires.",
            benefits: "Clear Aligners are nearly invisible, removable for eating and brushing, comfortable to wear, easier to clean than traditional braces, and allow patients to maintain their normal oral hygiene routine throughout treatment.",
            process: "Our dentist will examine your teeth, take digital scans or impressions, and create a customized treatment plan. A series of aligners is fabricated specifically for your teeth, with each aligner moving them slightly closer to their ideal position. Regular checkups are scheduled to monitor progress and provide new aligners as treatment continues.",
            care: "Wear your aligners for at least 20 to 22 hours each day, remove them before eating or drinking anything except water, clean them daily using a soft toothbrush and lukewarm water, and store them in their protective case whenever they are not being worn.",
            duration: "Treatment usually takes between 6 and 24 months depending on the complexity of the case and how consistently the aligners are worn.",
            ideal: "Clear Aligners are ideal for patients with mild to moderate crowding, spacing, or bite concerns who want a more discreet orthodontic treatment.",
            reminders: "Successful treatment depends on wearing the aligners as instructed every day. Skipping wear time may delay progress and affect the final results."
        },

        implants: {
            title: "Dental Implants",
            image: "./images/dental-implant.jpg",
            beforeImage: "./images/implants-before.jpg",
            afterImage: "./images/implants-after.jpg",
            intro: "Dental Implants are a long-lasting solution for replacing missing teeth, restoring your smile, improving chewing ability, and helping preserve the health of your jawbone.",
            heading: "Everything You Need to Know About Dental Implants",
            overview: "A dental implant is a titanium post that is surgically placed into the jawbone to serve as an artificial tooth root. After the implant integrates with the bone, it supports a custom-made crown, bridge, or denture that closely resembles the appearance and function of a natural tooth.",
            benefits: "Dental Implants restore missing teeth, improve chewing and speaking, preserve jawbone health, prevent neighboring teeth from shifting, provide excellent stability, improve confidence, and offer a natural-looking, long-lasting replacement option.",
            process: "Our dentist will perform a thorough examination, including X-rays or 3D imaging, to determine whether you are a suitable candidate. The implant is surgically placed into the jawbone and allowed to heal over several months as it fuses with the bone. Once healing is complete, an abutment and custom-made dental crown are attached to complete the restoration.",
            care: "Brush and floss daily, maintain regular dental checkups and professional cleanings, avoid smoking whenever possible, and follow your dentist's instructions during the healing period to support successful implant integration.",
            duration: "The complete treatment may take three to nine months or longer depending on healing time, bone condition, and whether additional procedures such as bone grafting are required.",
            ideal: "Dental Implants are recommended for patients with one or more missing teeth who have healthy gums, adequate jawbone support, and good overall oral health.",
            reminders: "A comprehensive dental evaluation is necessary before treatment begins. Good oral hygiene and regular dental visits are essential for maintaining the long-term success of your dental implants."
        }
    };

    var aliases = {
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

    var params = new URLSearchParams(window.location.search);
    var serviceKey = (params.get("service") || "braces").trim().toLowerCase();
    serviceKey = aliases[serviceKey] || serviceKey;

    var fallback = services[serviceKey] || services.braces;

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value || "";
    }

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[\s\-_/]/g, "");
    }

    function applyToPage(service) {
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
            service.duration || "Treatment duration may vary depending on the patient’s dental condition."
        );

        setText(
            "idealText",
            service.ideal || "This service is recommended based on the dentist’s assessment."
        );

        setText(
            "remindersText",
            service.reminders || "Please consult the dentist for proper diagnosis and treatment recommendations."
        );

        var hero = document.getElementById("serviceHero");
        var beforeImg = document.getElementById("comparisonBeforeImg");
        var afterImg = document.getElementById("comparisonAfterImg");
        var comparisonRange = document.getElementById("comparisonRange");
        var comparisonAfter = document.getElementById("comparisonAfter");
        var comparisonLine = document.getElementById("comparisonLine");

        if (hero && service.image) {
            hero.style.backgroundImage =
                "linear-gradient(rgba(15, 23, 42, 0.38), rgba(15, 23, 42, 0.38)), url(\"" + service.image + "\")";
        }

        if (beforeImg) {
            beforeImg.src = service.beforeImage || "./images/tooth-before.jpg";
        }

        if (afterImg) {
            afterImg.src = service.afterImage || "./images/tooth-after.jpg";
        }

        if (comparisonRange && comparisonAfter && comparisonLine) {
            comparisonRange.value = 50;
            comparisonAfter.style.width = "50%";
            comparisonLine.style.left = "50%";
        }

        document.title = service.title + " | Smile Empress Dental Hub";
    }

    // Render from hardcoded fallback immediately (no flash of empty content)
    applyToPage(fallback);

    var summaryCard = document.querySelector(".summary-card");
    var summaryToggle = document.getElementById("summaryToggle");
    var summaryLinks = document.querySelectorAll(".summary-links a");

    if (summaryCard && summaryToggle) {
        summaryToggle.addEventListener("click", function () {
            if (window.innerWidth <= 720) {
                summaryCard.classList.toggle("active");
            }
        });
    }

    if (summaryCard && summaryLinks.length) {
        summaryLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 720) {
                    summaryCard.classList.remove("active");
                }
            });
        });
    }

    window.addEventListener("resize", function () {
        if (summaryCard && window.innerWidth > 720) {
            summaryCard.classList.remove("active");
        }
    });

    var comparisonRange = document.getElementById("comparisonRange");
    var comparisonAfter = document.getElementById("comparisonAfter");
    var comparisonLine = document.getElementById("comparisonLine");

    if (comparisonRange && comparisonAfter && comparisonLine) {
        comparisonRange.addEventListener("input", function () {
            var value = comparisonRange.value + "%";
            comparisonAfter.style.width = value;
            comparisonLine.style.left = value;
        });
    }

    // Override with database data where available
    // Use Website CMS services (admin-editable via website_services table)
    fetch(API_BASE_URL + "/api/website/services")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to load website services.");
            }

            return response.json();
        })
        .then(function (data) {
            var list = Array.isArray(data.services) ? data.services : [];

            // Match by slug first, then by normalised name
            var dbSvc = list.find(function (s) {
                return normalizeText(s.slug) === normalizeText(serviceKey);
            });

            if (!dbSvc) {
                dbSvc = list.find(function (s) {
                    return normalizeText(s.name) === normalizeText(serviceKey);
                });
            }

            if (!dbSvc) return; // keep hardcoded entirely

            applyToPage({
                title: dbSvc.name || fallback.title,
                image: dbSvc.image_path || fallback.image,
                beforeImage: fallback.beforeImage,
                afterImage: fallback.afterImage,
                intro: dbSvc.description || fallback.intro,
                heading: "A Comprehensive Guide to " + (dbSvc.name || fallback.title),
                overview: dbSvc.description || fallback.overview,
                benefits: fallback.benefits,  // DB has no separate benefits field
                process: fallback.process,    // DB has no separate process field
                care: fallback.care,          // DB has no separate care field
                duration: fallback.duration,
                ideal: fallback.ideal,
                reminders: fallback.reminders
            });
        })
        .catch(function () {
            // Keep hardcoded fallback if API is unavailable
            applyToPage(fallback);
        });
});