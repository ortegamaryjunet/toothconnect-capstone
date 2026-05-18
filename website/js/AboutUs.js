document.addEventListener("DOMContentLoaded", function () {
    const revealItems = document.querySelectorAll(
        ".section-title, .team-title, .about-card, .owner-row, .owner-name, .team-card, .branch-info, .branch-box, .services-heading, .service-item, .map-card"
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

    const serviceItems = document.querySelectorAll(".service-item");

    serviceItems.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
            serviceItems.forEach(function (item) {
                if (item !== card) {
                    item.classList.add("soft-blur");
                }
            });
        });

        card.addEventListener("mouseleave", function () {
            serviceItems.forEach(function (item) {
                item.classList.remove("soft-blur");
            });
        });
    });
});