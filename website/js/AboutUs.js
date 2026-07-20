document.addEventListener("DOMContentLoaded", function () {
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
});