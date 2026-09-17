const PROD_API = "https://api.smileempressdentalhub.com";
const hostname = String(window.location.hostname || "").toLowerCase();
const port = String(window.location.port || "");
const API_BASE_URL = hostname === "localhost" || hostname === "127.0.0.1" ? (port === "4000" ? window.location.origin : "http://localhost:4000") : PROD_API;

document.addEventListener("DOMContentLoaded", function () {
    initializeRevealAnimation();
    loadAboutPageContent();
});

function initializeRevealAnimation() {
    const revealItems = document.querySelectorAll(".section-title, .team-title, .about-card, .value-card, .owner-row, .team-card, .branch-info, .branch-box, .map-card");

    revealItems.forEach(function (item) {
        item.classList.add("reveal");
    });

    function revealOnScroll() {
        const items = document.querySelectorAll(".section-title, .team-title, .about-card, .value-card, .owner-row, .team-card, .branch-info, .branch-box, .map-card");

        items.forEach(function (item) {
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
        const response = await fetch(`${API_BASE_URL}/api/website/content`);

        if (!response.ok) {
            throw new Error("Failed to load website content.");
        }

        const responseData = await response.json();
        const content = responseData.content || {};

        setAboutContent(content);
        setTeamContent(content);
        setGeneralContent(content);

        await Promise.all([
            loadBranches(),
            loadTeamProfiles()
        ]);
    } catch (error) {
        console.error("Error loading About page content:", error);
    }
}

function setAboutContent(content) {
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

    setText("dentistSectionTag", content.dentist_section_tag);
    applyTextStyle("dentistSectionTag", content, "dentist_section_tag");

    setText("dentistSectionTitle", content.dentist_section_title);
    applyTextStyle("dentistSectionTitle", content, "dentist_section_title");

    setText("dentistSectionDescription", content.dentist_section_description);
    applyTextStyle("dentistSectionDescription", content, "dentist_section_description");

    setText("assistantSectionTag", content.assistant_section_tag);
    applyTextStyle("assistantSectionTag", content, "assistant_section_tag");

    setText("assistantSectionTitle", content.assistant_section_title);
    applyTextStyle("assistantSectionTitle", content, "assistant_section_title");

    setText("assistantSectionDescription", content.assistant_section_description);
    applyTextStyle("assistantSectionDescription", content, "assistant_section_description");

    setText("receptionistSectionTag", content.receptionist_section_tag);
    applyTextStyle("receptionistSectionTag", content, "receptionist_section_tag");

    setText("receptionistSectionTitle", content.receptionist_section_title);
    applyTextStyle("receptionistSectionTitle", content, "receptionist_section_title");

    setText("receptionistSectionDescription", content.receptionist_section_description);
    applyTextStyle("receptionistSectionDescription", content, "receptionist_section_description");
}

function setTeamContent(content) {
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
}

function setGeneralContent(content) {
    setText("mapSectionTag", content.map_section_tag);
    applyTextStyle("mapSectionTag", content, "map_section_tag");

    setText("mapSectionTitle", content.map_section_title);
    applyTextStyle("mapSectionTitle", content, "map_section_title");

    setText("mapSectionDescription", content.map_section_description);
    applyTextStyle("mapSectionDescription", content, "map_section_description");

    setText("footerCopyright", content.footer_copyright);
    applyTextStyle("footerCopyright", content, "footer_copyright");
}

async function loadTeamProfiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/website/team`);

        if (!response.ok) {
            throw new Error("Failed to load team profiles.");
        }

        const responseData = await response.json();

        const profiles = responseData.team || responseData.staff || responseData.profiles || responseData.data || [];

        renderTeamProfiles(profiles);
    } catch (error) {
        console.error("Error loading team profiles:", error);
        clearTeamProfileGrids();
    }
}

function renderTeamProfiles(profiles) {
    const dentistGrid = document.getElementById("dentistGrid");
    const assistantGrid = document.getElementById("assistantGrid");
    const receptionistGrid = document.getElementById("receptionistGrid");

    if (!dentistGrid && !assistantGrid && !receptionistGrid) {
        return;
    }

    if (dentistGrid) {
        dentistGrid.innerHTML = "";
    }

    if (assistantGrid) {
        assistantGrid.innerHTML = "";
    }

    if (receptionistGrid) {
        receptionistGrid.innerHTML = "";
    }

    if (!Array.isArray(profiles)) {
        return;
    }

    let dentistCount = 0;
    let assistantCount = 0;
    let receptionistCount = 0;

    profiles.forEach(function (profile) {
        if (!profile) {
            return;
        }

        const role = getProfileRole(profile);
        const card = createTeamProfileCard(profile);

        if (isDentistRole(role)) {
            if (dentistGrid) {
                dentistGrid.appendChild(card);
                dentistCount++;
            }
            return;
        }

        if (isAssistantRole(role)) {
            if (assistantGrid) {
                assistantGrid.appendChild(card);
                assistantCount++;
            }
            return;
        }

        if (isReceptionistRole(role)) {
            if (receptionistGrid) {
                receptionistGrid.appendChild(card);
                receptionistCount++;
            }
        }
    });

    updateTeamSectionVisibility("dentistGrid", dentistCount);
    updateTeamSectionVisibility("assistantGrid", assistantCount);
    updateTeamSectionVisibility("receptionistGrid", receptionistCount);

    const careTeamCount = dentistCount + assistantCount + receptionistCount;
    setText("careTeamCount", careTeamCount);

    initializeTeamHoverEffect();
    initializeRevealAnimation();
}

function createTeamProfileCard(profile) {
    const card = document.createElement("div");
    card.className = "team-card";

    const image = document.createElement("img");
    image.width = 280;
    image.height = 340;
    image.loading = "lazy";
    image.decoding = "async";

    const name = getProfileValue(profile, ["name", "full_name", "employee_name", "staff_name"]);
    const position = getProfileValue(profile, ["position", "role", "job_title", "employee_position"]);
    const description = getProfileValue(profile, ["description", "bio", "profile_description", "about"]);
    const imageValue = getProfileValue(profile, ["image_url", "image", "image_path", "profile_image", "photo", "photo_url"]);

    setProfileImage(image, imageValue, name);

    const info = document.createElement("div");
    info.className = "team-info";

    const nameElement = document.createElement("h3");
    nameElement.textContent = name;

    const positionElement = document.createElement("p");
    positionElement.textContent = position;

    info.appendChild(nameElement);
    info.appendChild(positionElement);

    if (description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.className = "team-description";
        descriptionElement.textContent = description;
        info.appendChild(descriptionElement);
    }

    card.appendChild(image);
    card.appendChild(info);

    return card;
}

function setProfileImage(element, value, alt = "") {
    if (!element) {
        return;
    }

    element.alt = alt || "";
    element.loading = "lazy";
    element.decoding = "async";

    if (!value) {
        element.removeAttribute("src");
        return;
    }

    const imageValue = String(value).trim();

    if (imageValue.startsWith("https://res.cloudinary.com/")) {
        element.src = imageValue;
        return;
    }

    if (imageValue.startsWith("http://") || imageValue.startsWith("https://") || imageValue.startsWith("blob:")) {
        element.src = imageValue;
        return;
    }

    element.src = `${API_BASE_URL}${imageValue.startsWith("/") ? imageValue : `/${imageValue}`}`;
}

function getProfileRole(profile) {
    return getProfileValue(profile, ["role", "position", "job_title", "employee_position"]).toLowerCase().trim();
}

function isDentistRole(role) {
    return role.includes("dentist") && !role.includes("assistant");
}

function isAssistantRole(role) {
    return role.includes("assistant") || role.includes("dental assistant");
}

function isReceptionistRole(role) {
    return role.includes("receptionist");
}

function getProfileValue(profile, keys) {
    for (const key of keys) {
        if (profile[key] !== undefined && profile[key] !== null && String(profile[key]).trim() !== "") {
            return String(profile[key]);
        }
    }

    return "";
}

function updateTeamSectionVisibility(gridId, count) {
    const grid = document.getElementById(gridId);

    if (!grid) {
        return;
    }

    const category = grid.closest(".team-category");

    if (!category) {
        return;
    }

    category.style.display = count > 0 ? "" : "none";
}

function clearTeamProfileGrids() {
    const grids = [
        document.getElementById("dentistGrid"),
        document.getElementById("assistantGrid"),
        document.getElementById("receptionistGrid")
    ];

    grids.forEach(function (grid) {
        if (grid) {
            grid.innerHTML = "";
        }
    });
}

async function loadBranches() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/website/branches`);

        if (!response.ok) {
            throw new Error("Failed to load branch locations.");
        }

        const responseData = await response.json();

        const branches = responseData.branches || responseData.data || responseData.locations || [];

        renderBranches(branches);
    } catch (error) {
        console.error("Error loading branch locations:", error);
        clearBranches();
    }
}

function renderBranches(branches) {
    const branchesGrid = document.getElementById("branchesGrid");
    const mapGrid = document.getElementById("mapGrid");

    if (!branchesGrid || !mapGrid) {
        return;
    }

    branchesGrid.innerHTML = "";
    mapGrid.innerHTML = "";

    if (!Array.isArray(branches) || branches.length === 0) {
        setText("branchCount", "0");
        return;
    }

    setText("branchCount", branches.length);

    branches.forEach(function (branch, index) {
        const branchId = getBranchId(branch, index);
        const branchName = getBranchValue(branch, ["branch_name", "name", "location_name"]);
        const branchStatus = getBranchValue(branch, ["branch_status", "status"]);
        const branchAddress = getBranchValue(branch, ["branch_address", "address", "location"]);
        const branchHours = getBranchValue(branch, ["branch_hours", "hours", "operating_hours"]);
        const branchSchedule = getBranchValue(branch, ["branch_schedule", "schedule"]);
        const branchMapButton = getBranchValue(branch, ["branch_map_button", "map_button", "map_button_text"]) || "View Location";
        const branchIcon = getBranchValue(branch, ["branch_icon", "icon"]) || "fa-building";

        const branchCard = document.createElement("div");
        branchCard.className = "branch-box";
        branchCard.id = `branch-${branchId}`;

        const branchTop = document.createElement("div");
        branchTop.className = "branch-top";

        const iconContainer = document.createElement("div");
        iconContainer.className = "branch-icon";

        const icon = document.createElement("i");
        icon.className = `fa-solid ${branchIcon}`;

        iconContainer.appendChild(icon);

        const branchText = document.createElement("div");
        branchText.className = "branch-text";

        const nameElement = document.createElement("h3");
        nameElement.textContent = branchName;

        const statusElement = document.createElement("p");
        statusElement.textContent = branchStatus;

        branchText.appendChild(nameElement);
        branchText.appendChild(statusElement);

        branchTop.appendChild(iconContainer);
        branchTop.appendChild(branchText);

        const details = document.createElement("div");
        details.className = "branch-details";

        if (branchAddress) {
            details.appendChild(createBranchDetail("fa-location-dot", branchAddress));
        }

        if (branchHours) {
            details.appendChild(createBranchDetail("fa-clock", branchHours));
        }

        if (branchSchedule) {
            details.appendChild(createBranchDetail("fa-calendar-check", branchSchedule));
        }

        const mapButton = document.createElement("a");
        mapButton.className = "branch-btn";
        mapButton.href = `#${branchId}-map`;
        mapButton.textContent = branchMapButton;

        branchCard.appendChild(branchTop);
        branchCard.appendChild(details);
        branchCard.appendChild(mapButton);

        branchesGrid.appendChild(branchCard);

        const mapCard = createMapCard(branchId, branchName, branchAddress);
        mapGrid.appendChild(mapCard);
    });

    initializeBranchReveal();
}

function createBranchDetail(iconClass, text) {
    const row = document.createElement("div");
    row.className = "branch-detail-row";

    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconClass}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    row.appendChild(icon);
    row.appendChild(paragraph);

    return row;
}

function createMapCard(branchId, branchName, branchAddress) {
    const mapCard = document.createElement("div");
    mapCard.className = "map-card";
    mapCard.id = `${branchId}-map`;

    const mapHeader = document.createElement("div");
    mapHeader.className = "map-header";

    const mapText = document.createElement("div");
    mapText.className = "map-text";

    const name = document.createElement("h3");
    name.textContent = branchName;

    const address = document.createElement("p");
    address.textContent = branchAddress;

    mapText.appendChild(name);
    mapText.appendChild(address);
    mapHeader.appendChild(mapText);

    const mapWrapper = document.createElement("div");
    mapWrapper.className = "map-wrapper";

    const iframe = document.createElement("iframe");
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.src = getMapUrl(branchAddress);
    iframe.title = `${branchName} location map`;

    mapWrapper.appendChild(iframe);
    mapCard.appendChild(mapHeader);
    mapCard.appendChild(mapWrapper);

    return mapCard;
}

function getBranchId(branch, index) {
    const value = branch.branch_id ?? branch.id ?? branch.location_id ?? branch.branch_name ?? branch.name ?? `branch-${index + 1}`;

    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getBranchValue(branch, keys) {
    for (const key of keys) {
        if (branch[key] !== undefined && branch[key] !== null && String(branch[key]).trim() !== "") {
            return String(branch[key]);
        }
    }

    return "";
}

function initializeBranchReveal() {
    const revealItems = document.querySelectorAll(".branch-box, .map-card");

    revealItems.forEach(function (item) {
        item.classList.add("reveal");
    });

    function revealBranches() {
        const items = document.querySelectorAll(".branch-box, .map-card");

        items.forEach(function (item) {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (itemTop < windowHeight - 80) {
                item.classList.add("show");
            }
        });
    }

    window.addEventListener("scroll", revealBranches);
    window.addEventListener("load", revealBranches);
    revealBranches();
}

function clearBranches() {
    const branchesGrid = document.getElementById("branchesGrid");
    const mapGrid = document.getElementById("mapGrid");

    if (branchesGrid) {
        branchesGrid.innerHTML = "";
    }

    if (mapGrid) {
        mapGrid.innerHTML = "";
    }

    setText("branchCount", "0");
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

    element.loading = "lazy";
    element.decoding = "async";
    element.alt = alt || "";

    if (!value) {
        element.removeAttribute("src");
        return;
    }

    const imageValue = String(value);

    if (
        imageValue.startsWith("http://") ||
        imageValue.startsWith("https://") ||
        imageValue.startsWith("blob:")
    ) {
        element.src = imageValue;
    } else {
        element.src = `${API_BASE_URL}${imageValue.startsWith("/") ? imageValue : `/${imageValue}`}`;
    }
}

function setLink(id, text, href) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = text ?? "";
    element.href = href || "#";
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

    const textColor = content[`${prefix}_text_color`] ?? content[`${prefix}_color`];

    const textAlignment = content[`${prefix}_text_alignment`] ?? content[`${prefix}_alignment`];

    if (fontFamily) {
        element.style.fontFamily = fontFamily;
    }

    if (fontSize) {
        element.style.fontSize = /^\d+$/.test(String(fontSize)) ? `${fontSize}px` : fontSize;
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

    if (!textAlignment) {
        return;
    }

    element.style.textAlign = textAlignment;

    const sectionTitle = element.closest(".section-title");
    const branchHeader = element.closest(".branch-header");
    const ownerContent = element.closest(".owner-content");
    const teamInfo = element.closest(".team-info");
    const branchTop = element.closest(".branch-top");
    const branchDetails = element.closest(".branch-details");
    const mapHeader = element.closest(".map-header");

    if (sectionTitle || branchHeader) {
        const container = sectionTitle || branchHeader;

        container.style.textAlign = textAlignment;

        if (textAlignment === "left") {
            container.style.margin = "0 0 50px";
        } else if (textAlignment === "right") {
            container.style.margin = "0 0 50px auto";
        } else {
            container.style.margin = "0 auto 50px";
        }
    }

    if (ownerContent) {
        ownerContent.style.textAlign = textAlignment;
        element.style.textAlign = textAlignment;

        if (
            id === "ownerMessage1" ||
            id === "ownerMessage2" ||
            id === "ownerName" ||
            id === "ownerPosition"
        ) {
            element.style.width = "100%";
        }

        if (id === "ownerLabel") {
            element.style.width = "fit-content";

            if (textAlignment === "left") {
                element.style.marginLeft = "0";
                element.style.marginRight = "auto";
            } else if (textAlignment === "center") {
                element.style.marginLeft = "auto";
                element.style.marginRight = "auto";
            } else {
                element.style.marginLeft = "auto";
                element.style.marginRight = "0";
            }
        }

        if (element.classList.contains("owner-label")) {
            switch (textAlignment) {
                case "left":
                    element.style.alignSelf = "flex-start";
                    break;
                case "center":
                    element.style.alignSelf = "center";
                    break;
                case "right":
                    element.style.alignSelf = "flex-end";
                    break;
            }
        }
    }

    if (teamInfo) {
        teamInfo.style.textAlign = textAlignment;
    }

    if (branchTop) {
        const textContainer = element.parentElement;

        if (textContainer) {
            textContainer.style.width = "100%";
            textContainer.style.textAlign = textAlignment;
        }

        element.style.width = "100%";
        element.style.textAlign = textAlignment;
    }

    if (branchDetails) {
        branchDetails.querySelectorAll("div").forEach(function (row) {
            const icon = row.querySelector("i");
            const text = row.querySelector("p");

            row.style.display = "flex";
            row.style.alignItems = "flex-start";
            row.style.gap = "14px";

            if (text) {
                text.style.width = "100%";
                text.style.textAlign = textAlignment;
            }

            switch (textAlignment) {
                case "left":
                    row.style.justifyContent = "flex-start";

                    if (icon) {
                        icon.style.order = "0";
                    }

                    if (text) {
                        text.style.order = "1";
                    }

                    break;

                case "center":
                    row.style.justifyContent = "center";

                    if (icon) {
                        icon.style.order = "0";
                    }

                    if (text) {
                        text.style.order = "1";
                    }

                    break;

                case "right":
                    row.style.justifyContent = "flex-end";

                    if (icon) {
                        icon.style.order = "1";
                    }

                    if (text) {
                        text.style.order = "0";
                    }

                    break;
            }
        });
    }

    if (mapHeader) {
        mapHeader.style.textAlign = textAlignment;

        mapHeader.querySelectorAll("h3, p").forEach(function (item) {
            item.style.width = "100%";
            item.style.textAlign = textAlignment;
        });
    }
}