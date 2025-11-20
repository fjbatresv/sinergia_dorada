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
    // Fetch and Render Dogs
    // Fetch and Render Dogs
    fetch('dogs.json')
        .then(response => response.json())
        .then(dogs => {
            const track = document.getElementById('carousel-track');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            
            // Function to create a dog card
            function createDogCard(dog) {
                const card = document.createElement('div');
                card.classList.add('team-card');
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${dog.image}" alt="${dog.name}">
                    </div>
                    <div class="card-content">
                        <h3>${dog.name}</h3>
                        <span class="breed">${dog.breed}</span>
                    </div>
                `;
                
                // Click event for modal
                card.addEventListener('click', () => openModal(dog));
                return card;
            }

            // 1. Append original dogs
            dogs.forEach(dog => {
                track.appendChild(createDogCard(dog));
            });

            // 2. Append duplicates for infinite scroll (end)
            dogs.forEach(dog => {
                track.appendChild(createDogCard(dog));
            });
            
            // 3. Prepend duplicates for infinite scroll (start)
            // We reverse to keep order correct when prepending
            [...dogs].reverse().forEach(dog => {
                track.insertBefore(createDogCard(dog), track.firstChild);
            });

            // Scroll Logic
            // We need to wait for the DOM to be fully rendered to get accurate widths
            const scrollSpeed = 1; // Pixels per frame for auto scroll
            let isHovered = false;
            let autoScrollId;
            let cardWidth, singleSetWidth;

            function updateDimensions() {
                const firstCard = track.querySelector('.team-card');
                if (firstCard) {
                    const gap = 32; // 2rem gap
                    cardWidth = firstCard.offsetWidth + gap;
                    singleSetWidth = cardWidth * dogs.length;
                }
            }

            // Initial setup
            setTimeout(() => {
                 updateDimensions();
                 if (singleSetWidth) {
                     track.scrollLeft = singleSetWidth;
                 }
            }, 100);
            
            // Update on resize
            window.addEventListener('resize', () => {
                updateDimensions();
                if (singleSetWidth) {
                    track.scrollLeft = singleSetWidth; // Reset to center on resize to avoid getting lost
                }
            });

            function startAutoScroll() {
                if (autoScrollId) clearInterval(autoScrollId);
                autoScrollId = setInterval(() => {
                    if (!isHovered && singleSetWidth) {
                        track.scrollLeft += scrollSpeed;
                        checkInfiniteScroll();
                    }
                }, 20);
            }

            function checkInfiniteScroll() {
                if (!singleSetWidth) return;

                // If we have scrolled past the second set (Original Set), jump back to the start of the Original Set
                if (track.scrollLeft >= singleSetWidth * 2) {
                    track.scrollLeft -= singleSetWidth;
                }
                // If we have scrolled into the first set (Clone Set 1), jump forward to the Original Set
                else if (track.scrollLeft <= 0) {
                    track.scrollLeft += singleSetWidth;
                }
            }

            // Manual Navigation
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: cardWidth, behavior: 'smooth' });
                // We can't check immediately because smooth scroll takes time
                // But the auto-scroll loop will eventually catch it, or we can check after a delay
            });

            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });

            // Pause on Hover
            track.addEventListener('mouseenter', () => isHovered = true);
            track.addEventListener('mouseleave', () => isHovered = false);
            
            // Also pause when hovering buttons
            prevBtn.addEventListener('mouseenter', () => isHovered = true);
            prevBtn.addEventListener('mouseleave', () => isHovered = false);
            nextBtn.addEventListener('mouseenter', () => isHovered = true);
            nextBtn.addEventListener('mouseleave', () => isHovered = false);

            // Start
            startAutoScroll();
        })
        .catch(error => console.error('Error loading dogs:', error));

    // Modal Logic
    const modal = document.getElementById('dog-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalBreed = document.getElementById('modal-breed');
    
    const modalColor = document.getElementById('modal-color');
    const modalColorContainer = document.getElementById('modal-color-container');
    
    const modalBirthdate = document.getElementById('modal-birthdate');
    const modalBirthdateContainer = document.getElementById('modal-birthdate-container');
    
    const modalDesc = document.getElementById('modal-desc');
    const modalInsta = document.getElementById('modal-insta');

    function openModal(dog) {
        modalImg.src = dog.image;
        modalName.textContent = dog.name;
        modalBreed.textContent = dog.breed;
        
        // Handle Color
        if (dog.color) {
            modalColor.textContent = dog.color;
            modalColorContainer.style.display = 'block';
        } else {
            modalColorContainer.style.display = 'none';
        }

        // Handle Birthdate
        if (dog.birthdate) {
            modalBirthdate.textContent = dog.birthdate;
            modalBirthdateContainer.style.display = 'block';
        } else {
            modalBirthdateContainer.style.display = 'none';
        }
        
        // Handle description as string or array
        if (Array.isArray(dog.description)) {
            modalDesc.innerHTML = dog.description.join('<br><br>'); // Double break for paragraphs
        } else if (dog.description) {
            modalDesc.textContent = dog.description;
        } else {
            modalDesc.textContent = 'Sin descripción disponible.';
        }
        
        // Handle Instagram
        if (dog.instagram) {
            modalInsta.href = dog.instagram;
            modalInsta.style.display = 'inline-flex';
        } else {
            modalInsta.style.display = 'none';
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // --- Mission/Vision/Values Tabs Logic ---
    const tabBtns = document.querySelectorAll('.mv-tab-btn');
    const tabContents = document.querySelectorAll('.mv-tab-content');
    const tabsContainer = document.querySelector('.mv-tabs-container');
    let currentTab = 'mission';
    let tabInterval;
    let progressInterval;
    let progress = 0;
    const switchTime = 8000; // 8 seconds
    const updateFreq = 100; // Update progress every 100ms

    function switchTab(tabId) {
        currentTab = tabId;
        
        // Update container background via data attribute
        if (tabsContainer) {
            tabsContainer.setAttribute('data-active-tab', tabId);
        }
        
        // Update Buttons
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
                const bar = btn.querySelector('.progress-bar');
                if(bar) bar.style.width = '0%';
            }
        });

        // Update Content
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // If Values tab, draw wordcloud (needs to be visible to draw correctly)
        if (tabId === 'values') {
            // Small delay to ensure layout is applied
            setTimeout(drawWordCloud, 50);
        }

        // Reset Progress
        progress = 0;
    }

    function startTabCycle() {
        clearInterval(tabInterval);
        clearInterval(progressInterval);

        tabInterval = setInterval(() => {
            let nextTab;
            if (currentTab === 'mission') nextTab = 'vision';
            else if (currentTab === 'vision') nextTab = 'values';
            else nextTab = 'mission';
            
            switchTab(nextTab);
        }, switchTime);

        progressInterval = setInterval(() => {
            progress += (updateFreq / switchTime) * 100;
            if (progress > 100) progress = 0;
            
            const activeBtn = document.querySelector('.mv-tab-btn.active');
            if (activeBtn) {
                const bar = activeBtn.querySelector('.progress-bar');
                if(bar) bar.style.width = `${progress}%`;
            }
        }, updateFreq);
    }

    // Manual Click
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
            startTabCycle(); // Restart timer on manual interaction
        });
    });

    // Start initially
    startTabCycle();

    // --- WordCloud Logic ---
    const canvas = document.getElementById('values-canvas');
    const container = document.getElementById('canvas-container');

    const words = [
        ['Amor incondicional', 50],
        ['Empatía', 45],
        ['Servicio', 40],
        ['Alegría', 35],
        ['Respeto', 45],
        ['Conexión humano-animal', 38],
        ['Confianza', 35],
        ['Bienestar animal', 40],
        ['Inclusión', 35],
        ['Respeto', 45]
    ];

    function drawWordCloud() {
        if (!canvas || !container) return;
        
        // Set canvas size to match container
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // If width is 0 (hidden), don't draw
        if (canvas.width === 0) return;

        WordCloud(canvas, {
            list: words,
            gridSize: 8,
            weightFactor: function (size) {
                return (size / 50) * (canvas.width / 10); // Responsive scaling
            },
            fontFamily: '"Poppins", sans-serif',
            color: function (word, weight) {
                const colors = ['#D4AF37', '#C5A028', '#B08D1E', '#333333', '#555555'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0, // All horizontal
            backgroundColor: 'transparent',
            shape: 'circle',
            ellipticity: 1
        });
    }

    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (currentTab === 'values') drawWordCloud();
        }, 200);
    });

    // --- Testimonials Carousel Logic ---
    const testimonialsTrack = document.getElementById('testimonials-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const progressBar = document.getElementById('testimonial-progress-bar');
    
    let currentIndex = 0;
    const totalCards = testimonialCards.length;
    let autoRotateInterval;
    let isTransitioning = false;

    function updateCarousel() {
        if (isTransitioning) return;
        isTransitioning = true;

        // Calculate the offset - each card is 33.333% + gap
        const cardWidth = testimonialCards[0].offsetWidth;
        const gap = 32; // 2rem = 32px
        const offset = -(currentIndex * (cardWidth + gap));
        
        // Apply transform
        testimonialsTrack.style.transform = `translateX(${offset}px)`;
        
        // Update featured class - center card is always at index 1 in the visible set
        testimonialCards.forEach((card, index) => {
            card.classList.remove('featured');
            // The center card in view is currentIndex + 1
            if (index === currentIndex + 1) {
                card.classList.add('featured');
            }
        });
        
        // Restart progress bar animation
        if (progressBar) {
            progressBar.classList.remove('active');
            void progressBar.offsetWidth;
            progressBar.classList.add('active');
        }
        
        // Update dots
        testimonialDots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === currentIndex);
        });
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
    }

    // Navigation buttons
    if (prevTestimonialBtn) {
        prevTestimonialBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            currentIndex--;
            if (currentIndex < 0) currentIndex = totalCards - 3;
            updateCarousel();
            resetAutoRotate();
        });
    }

    if (nextTestimonialBtn) {
        nextTestimonialBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            currentIndex++;
            if (currentIndex > totalCards - 3) currentIndex = 0;
            updateCarousel();
            resetAutoRotate();
        });
    }

    // Dots navigation
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            if (index <= totalCards - 3) {
                currentIndex = index;
                updateCarousel();
                resetAutoRotate();
            }
        });
    });

    // Auto-rotate function
    function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex > totalCards - 3) currentIndex = 0;
            updateCarousel();
        }, 6000);
    }

    // Reset auto-rotate when user interacts
    function resetAutoRotate() {
        clearInterval(autoRotateInterval);
        startAutoRotate();
    }

    // Initialize
    updateCarousel();
    startAutoRotate();

    // --- Statistics Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    }

    // Intersection Observer for statistics
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statNumbers.forEach((stat, index) => {
                    setTimeout(() => {
                        animateCounter(stat);
                    }, index * 100); // Stagger animation
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.statistics');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});
