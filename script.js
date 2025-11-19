document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-up');
    animatedElements.forEach(el => observer.observe(el));

    // Header background change on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
            header.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
        } else {
            header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.05)";
            header.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
        }
    });

    // Randomize Hero Dog Positions
    function randomizeDogs() {
        const dogs = document.querySelectorAll('.floating-dog');
        const hero = document.querySelector('.hero');
        const placedPositions = [];

        // Center exclusion zone (percentage)
        const centerX = 50;
        const centerY = 50;
        const safeRadius = 25; // % radius around center to keep clear

        dogs.forEach((dog, index) => {
            let validPosition = false;
            let attempts = 0;
            let top, left;

            while (!validPosition && attempts < 100) {
                // Generate random position (0-90% to keep within screen)
                left = Math.random() * 85;
                top = Math.random() * 85;

                // Calculate distance from center
                const distToCenter = Math.sqrt(Math.pow(left - centerX, 2) + Math.pow(top - centerY, 2));

                // Check collision with center
                if (distToCenter < safeRadius) {
                    attempts++;
                    continue;
                }

                // Check collision with other dogs (simple proximity check)
                let tooClose = false;
                for (let pos of placedPositions) {
                    const dist = Math.sqrt(Math.pow(left - pos.left, 2) + Math.pow(top - pos.top, 2));
                    if (dist < 10) { // Reduced minimum distance to 10% to fit more items
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    validPosition = true;
                }
                attempts++;
            }

            // Apply position
            dog.style.left = `${left}%`;
            dog.style.top = `${top}%`;

            // Randomize animation delays
            const floatDelay = Math.random() * 2; // 0-2s delay
            const hoverDelay = Math.random() * 2;
            dog.style.animationDelay = `${floatDelay}s, ${floatDelay + 1}s`; // Entrance delay, then hover starts

            // Store position
            placedPositions.push({ left, top });
        });
    }

    // Run on load
    randomizeDogs();

    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
