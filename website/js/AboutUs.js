document.addEventListener("DOMContentLoaded", function () {
    initializeRevealAnimation();
    initializeTeamHoverEffect();
    loadAboutPageContent();
});

function initializeRevealAnimation() {
    const revealItems = document.querySelectorAll(
        ".section-title, .team-title, .about-card, .value-card, .owner-row, .team-card, .branch-info, .branch-box, .map-card"
    );

    revealItems.forEach(function (item) {
        item.classList.add("reveal");
    });

    function revealOnScroll() {
        revealItems.forEach(function (item) {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (itemTop < windowHeight - 80) {
                item.classList.add("show");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    window.addEventListener("load", revealOnScroll);

    revealOnScroll();
}

function initializeTeamHoverEffect() {
    const teamCards = document.querySelectorAll(".team-card");

    teamCards.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
            teamCards.forEach(function (item) {
                if (item !== card) {
                    item.classList.add("soft-blur");
                }
            });
        });

        card.addEventListener("mouseleave", function () {
            teamCards.forEach(function (item) {
                item.classList.remove("soft-blur");
            });
        });
    });
}

async function loadAboutPageContent() {
    try {
        const response = await fetch("http://localhost:4000/api/website/content")

        if (!response.ok) {
            throw new Error("Failed to load website content.");
        }

        const { content = {} } = await response.json();

        setText("aboutHeroTag", content.about_hero_tag);
        applyTextStyle("aboutHeroTag", content, "about_hero_tag");

        setText("aboutHeroTitle", content.about_hero_title);
        applyTextStyle("aboutHeroTitle", content, "about_hero_title");

        setText("aboutHeroDescription", content.about_hero_description);
        applyTextStyle("aboutHeroDescription", content, "about_hero_description");

        setLink("viewBranchesButton", content.view_branches_button_text, "#branches");
        applyTextStyle("viewBranchesButton", content, "view_branches_button");

        setLink("meetTeamButton", content.meet_team_button_text, "#team");
        applyTextStyle("meetTeamButton", content, "meet_team_button");

        setText("heroCardTitle", content.hero_card_title);
        applyTextStyle("heroCardTitle", content, "hero_card_title");

        setText("heroCardDescription", content.hero_card_description);
        applyTextStyle("heroCardDescription", content, "hero_card_description");

        setText("branchCount", content.branch_count);
        applyTextStyle("branchCount", content, "branch_count");

        setText("branchCountLabel", content.branch_count_label);
        applyTextStyle("branchCountLabel", content, "branch_count_label");

        setText("careTeamCount", content.care_team_count);
        applyTextStyle("careTeamCount", content, "care_team_count");

        setText("careTeamCountLabel", content.care_team_count_label);
        applyTextStyle("careTeamCountLabel", content, "care_team_count_label");

        setText("whoWeAreTag", content.who_we_are_tag);
        applyTextStyle("whoWeAreTag", content, "who_we_are_tag");

        setText("whoWeAreTitle", content.who_we_are_title);
        applyTextStyle("whoWeAreTitle", content, "who_we_are_title");

        setText("whoWeAreDescription", content.who_we_are_description);
        applyTextStyle("whoWeAreDescription", content, "who_we_are_description");

        setText("missionTitle", content.mission_title);
        applyTextStyle("missionTitle", content, "mission_title");

        setText("missionContent", content.mission_content);
        applyTextStyle("missionContent", content, "mission_content");

        setText("visionTitle", content.vision_title);
        applyTextStyle("visionTitle", content, "vision_title");

        setText("visionContent", content.vision_content);
        applyTextStyle("visionContent", content, "vision_content");

        setText("careTitle", content.care_title);
        applyTextStyle("careTitle", content, "care_title");

        setText("careContent", content.care_content);
        applyTextStyle("careContent", content, "care_content");

        setText("teamSectionTag", content.team_section_tag);
        applyTextStyle("teamSectionTag", content, "team_section_tag");

        setText("teamSectionTitle", content.team_section_title);
        applyTextStyle("teamSectionTitle", content, "team_section_title");

        setText("teamSectionDescription", content.team_section_description);
        applyTextStyle("teamSectionDescription", content, "team_section_description");

        setText("ownerLabel", content.owner_label);
        applyTextStyle("ownerLabel", content, "owner_label");

        setText("ownerName", content.owner_name);
        applyTextStyle("ownerName", content, "owner_name");

        setText("ownerPosition", content.owner_position);
        applyTextStyle("ownerPosition", content, "owner_position");

        setText("ownerMessage1", content.owner_message1);
        applyTextStyle("ownerMessage1", content, "owner_message1");

        setText("ownerMessage2", content.owner_message2);
        applyTextStyle("ownerMessage2", content, "owner_message2");

        setImage("ownerImage", content.owner_image, content.owner_name);

        setText("doctor1Name", content.doctor1_name);
        applyTextStyle("doctor1Name", content, "doctor1_name");

        setText("doctor1Position", content.doctor1_position);
        applyTextStyle("doctor1Position", content, "doctor1_position");

        setImage("doctor1Image", content.doctor1_image, content.doctor1_name);

        setText("doctor2Name", content.doctor2_name);
        applyTextStyle("doctor2Name", content, "doctor2_name");

        setText("doctor2Position", content.doctor2_position);
        applyTextStyle("doctor2Position", content, "doctor2_position");

        setImage("doctor2Image", content.doctor2_image, content.doctor2_name);

        setText("assistant1Name", content.assistant1_name);
        applyTextStyle("assistant1Name", content, "assistant1_name");

        setText("assistant1Position", content.assistant1_position);
        applyTextStyle("assistant1Position", content, "assistant1_position");

        setImage("assistant1Image", content.assistant1_image, content.assistant1_name);

        setText("assistant2Name", content.assistant2_name);
        applyTextStyle("assistant2Name", content, "assistant2_name");

        setText("assistant2Position", content.assistant2_position);
        applyTextStyle("assistant2Position", content, "assistant2_position");

        setImage("assistant2Image", content.assistant2_image, content.assistant2_name);

        setText("branchSectionTag", content.branch_section_tag);
        applyTextStyle("branchSectionTag", content, "branch_section_tag");

        setText("branchSectionTitle", content.branch_section_title);
        applyTextStyle("branchSectionTitle", content, "branch_section_title");
        const title = document.getElementById("branchSectionTitle");

console.log("Inline style:", title.style.cssText);

console.log("Computed style:", {
    family: getComputedStyle(title).fontFamily,
    size: getComputedStyle(title).fontSize,
    weight: getComputedStyle(title).fontWeight,
    color: getComputedStyle(title).color,
    align: getComputedStyle(title).textAlign,
});
        applyTextStyle("branchSectionTitle", content, "branch_section_title");

        setText("makatiBranchName", content.makati_branch_name);
        applyTextStyle("makatiBranchName", content, "makati_branch_name");

        setText("makatiBranchStatus", content.makati_branch_status);
        applyTextStyle("makatiBranchStatus", content, "makati_branch_status");

        setText("makatiBranchAddress", content.makati_branch_address);
        applyTextStyle("makatiBranchAddress", content, "makati_branch_address");

        setText("makatiBranchLandmark", content.makati_branch_landmark);
        applyTextStyle("makatiBranchLandmark", content, "makati_branch_landmark");

        setText("makatiBranchHours", content.makati_branch_hours);
        applyTextStyle("makatiBranchHours", content, "makati_branch_hours");

        setText("makatiBranchSchedule", content.makati_branch_schedule);
        applyTextStyle("makatiBranchSchedule", content, "makati_branch_schedule");

        setLink("makatiBranchMapButton", content.makati_branch_map_button, "#makati-map");
        applyTextStyle("makatiBranchMapButton", content, "makati_branch_map_button");

        setText("makatiMapBranchName", content.makati_branch_name);
        applyTextStyle("makatiMapBranchName", content, "makati_branch_name");

        setText("makatiMapBranchAddress", content.makati_branch_address);
        applyTextStyle("makatiMapBranchAddress", content, "makati_branch_address");

        setIframe("makatiBranchMap", getMapUrl(content.makati_branch_address));

        setText("lasPinasBranchName", content.las_pinas_branch_name);
        applyTextStyle("lasPinasBranchName", content, "las_pinas_branch_name");

        setText("lasPinasBranchStatus", content.las_pinas_branch_status);
        applyTextStyle("lasPinasBranchStatus", content, "las_pinas_branch_status");

        setText("lasPinasBranchAddress", content.las_pinas_branch_address);
        applyTextStyle("lasPinasBranchAddress", content, "las_pinas_branch_address");

        setText("lasPinasBranchLandmark", content.las_pinas_branch_landmark);
        applyTextStyle("lasPinasBranchLandmark", content, "las_pinas_branch_landmark");

        setText("lasPinasBranchHours", content.las_pinas_branch_hours);
        applyTextStyle("lasPinasBranchHours", content, "las_pinas_branch_hours");

        setText("lasPinasBranchSchedule", content.las_pinas_branch_schedule);
        applyTextStyle("lasPinasBranchSchedule", content, "las_pinas_branch_schedule");

        setLink("lasPinasBranchMapButton", content.las_pinas_branch_map_button, "#laspinas-map");
        applyTextStyle("lasPinasBranchMapButton", content, "las_pinas_branch_map_button");

        setText("lasPinasMapBranchName", content.las_pinas_branch_name);
        applyTextStyle("lasPinasMapBranchName", content, "las_pinas_branch_name");

        setText("lasPinasMapBranchAddress", content.las_pinas_branch_address);
        applyTextStyle("lasPinasMapBranchAddress", content, "las_pinas_branch_address");

        setIframe("lasPinasBranchMap", getMapUrl(content.las_pinas_branch_address));

        setText("mapSectionTag", content.map_section_tag);
        applyTextStyle("mapSectionTag", content, "map_section_tag");

        setText("mapSectionTitle", content.map_section_title);
        applyTextStyle("mapSectionTitle", content, "map_section_title");

        setText("mapSectionDescription", content.map_section_description);
        applyTextStyle("mapSectionDescription", content, "map_section_description");

        setText("footerCopyright", content.footer_copyright);
        applyTextStyle("footerCopyright", content, "footer_copyright");

    } catch (error) {
        console.error("Error loading About page content:", error);
    }
}

function getMapUrl(address) {
    if (!address) {
        return "";
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = value ?? "";
}

function setImage(id, value, alt = "") {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    if (value) {
        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("blob:")
        ) {
            element.src = value;
        } else {
            element.src = `http://localhost:4000${value}`;
        }
    } else {
        element.removeAttribute("src");
    }

    element.alt = alt || "";
}

function setLink(id, text, href) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = text ?? "";
    element.href = href || "#";
}

function setIframe(id, value) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.src = value || "";
}

function applyTextStyle(id, content, prefix) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    const fontFamily = content[`${prefix}_font_family`];
    const fontSize = content[`${prefix}_font_size`];
    const fontWeight = content[`${prefix}_font_weight`];
    const fontStyle = content[`${prefix}_font_style`];

    const textColor =
        content[`${prefix}_text_color`] ??
        content[`${prefix}_color`];

    const textAlignment =
        content[`${prefix}_text_alignment`] ??
        content[`${prefix}_alignment`];

    if (fontFamily) {
        element.style.fontFamily = fontFamily;
    }

    if (fontSize) {
        element.style.fontSize = /^\d+$/.test(String(fontSize))
            ? `${fontSize}px`
            : fontSize;
    }

    if (fontWeight) {
        element.style.fontWeight = fontWeight;
    }

    if (fontStyle) {
        element.style.fontStyle = fontStyle;
    }

    if (textColor) {
        element.style.color = textColor;
    }

    if (textAlignment) {
        element.style.textAlign = textAlignment;

        const parent = element.parentElement;

        if (parent) {
            // Section headers (Who We Are, Team, Map)
            if (
                parent.classList.contains("section-title") ||
                parent.classList.contains("branch-header")
            ) {
                parent.style.textAlign = textAlignment;

                if (textAlignment === "left") {
                    parent.style.margin = "0 0 50px";
                } else if (textAlignment === "right") {
                    parent.style.margin = "0 0 50px auto";
                } else {
                    parent.style.margin = "0 auto 50px";
                }
            }

            // Owner section
            if (parent.classList.contains("owner-content")) {
                parent.style.textAlign = textAlignment;

                if (textAlignment === "left") {
                    parent.style.alignItems = "flex-start";
                } else if (textAlignment === "right") {
                    parent.style.alignItems = "flex-end";
                } else {
                    parent.style.alignItems = "center";
                }
            }

            // Team cards
            if (parent.classList.contains("team-info")) {
                parent.style.textAlign = textAlignment;
            }

            // Branch card header
            if (parent.classList.contains("branch-top")) {
                parent.style.textAlign = textAlignment;
            }

            // Branch details
            if (parent.classList.contains("branch-details")) {
                parent.style.textAlign = textAlignment;
            }

            // Map card header
            if (parent.classList.contains("map-header")) {
                parent.style.textAlign = textAlignment;
            }
        }
    }
}