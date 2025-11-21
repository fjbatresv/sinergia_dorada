document.addEventListener('DOMContentLoaded', () => {
    fetch('content/dogs.json')
        .then(response => response.json())
        .then(dogs => {
            const track = document.getElementById('carousel-track');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');

            if (!track) return;

            /**
             * Create a DOM element representing a dog card and wire it to open the details modal.
             * @param {Object} dog - Dog data used to populate the card.
             * @param {string} dog.image - URL of the dog's image.
             * @param {string} dog.name - Dog's name shown as the card title and image alt text.
             * @param {string} dog.breed - Dog's breed shown on the card.
             * @returns {HTMLElement} The constructed card element with a click handler that opens the modal for this dog.
             */
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
                card.addEventListener('click', () => openModal(dog));
                return card;
            }

            dogs.forEach(dog => {
                track.appendChild(createDogCard(dog));
            });

            dogs.forEach(dog => {
                track.appendChild(createDogCard(dog));
            });

            [...dogs].reverse().forEach(dog => {
                track.insertBefore(createDogCard(dog), track.firstChild);
            });

            const scrollSpeed = 1;
            let isHovered = false;
            let autoScrollId;
            let cardWidth;
            let singleSetWidth;

            /**
             * Recalculates cardWidth and singleSetWidth used for the carousel's scrolling logic.
             *
             * Sets `cardWidth` to the width of the first card plus the fixed gap (32) and
             * sets `singleSetWidth` to `cardWidth` multiplied by the number of dogs.
             * If no card element is found, existing values are left unchanged.
             */
            function updateDimensions() {
                const firstCard = track.querySelector('.team-card');
                if (firstCard) {
                    const gap = 32;
                    cardWidth = firstCard.offsetWidth + gap;
                    singleSetWidth = cardWidth * dogs.length;
                }
            }

            setTimeout(() => {
                updateDimensions();
                if (singleSetWidth) {
                    track.scrollLeft = singleSetWidth;
                }
            }, 100);

            window.addEventListener('resize', () => {
                updateDimensions();
                if (singleSetWidth) {
                    track.scrollLeft = singleSetWidth;
                }
            });

            /**
             * Keeps the carousel track's scroll position within the central range to maintain an infinite-scroll illusion.
             *
             * If `singleSetWidth` is not set this function does nothing. When the track scrolls past the second copy
             * of the set it subtracts `singleSetWidth` to wrap back, and when it scrolls at or before the start
             * it adds `singleSetWidth` to wrap forward. This adjusts `track.scrollLeft` in place.
             */
            function checkInfiniteScroll() {
                if (!singleSetWidth) return;
                if (track.scrollLeft >= singleSetWidth * 2) {
                    track.scrollLeft -= singleSetWidth;
                } else if (track.scrollLeft <= 0) {
                    track.scrollLeft += singleSetWidth;
                }
            }

            /**
             * Starts the carousel's automatic horizontal scrolling and ensures only one auto-scroll interval runs.
             *
             * When started, the function clears any existing auto-scroll interval and begins a new 20ms interval
             * that advances the track's scroll position by the configured speed while the carousel is not hovered
             * and the single set width is known; it also invokes the infinite-scroll wrap check after each advance.
             */
            function startAutoScroll() {
                if (autoScrollId) clearInterval(autoScrollId);
                autoScrollId = setInterval(() => {
                    if (!isHovered && singleSetWidth) {
                        track.scrollLeft += scrollSpeed;
                        checkInfiniteScroll();
                    }
                }, 20);
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    track.scrollBy({ left: cardWidth, behavior: 'smooth' });
                });
                nextBtn.addEventListener('mouseenter', () => isHovered = true);
                nextBtn.addEventListener('mouseleave', () => isHovered = false);
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                });
                prevBtn.addEventListener('mouseenter', () => isHovered = true);
                prevBtn.addEventListener('mouseleave', () => isHovered = false);
            }

            track.addEventListener('mouseenter', () => isHovered = true);
            track.addEventListener('mouseleave', () => isHovered = false);

            startAutoScroll();
        })
        .catch(error => console.error('Error loading dogs:', error));

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

    /**
     * Populate modal elements with a dog's data and show the modal, disabling page scroll.
     * @param {Object} dog - Dog data used to populate the modal.
     * @param {string} dog.image - URL of the dog's image.
     * @param {string} dog.name - Dog's name.
     * @param {string} dog.breed - Dog's breed.
     * @param {string} [dog.color] - Optional color value; when absent the color section is hidden.
     * @param {string} [dog.birthdate] - Optional birthdate; when absent the birthdate section is hidden.
     * @param {string|string[]} [dog.description] - Description text or an array of paragraphs; when absent a default message is shown.
     * @param {string} [dog.instagram] - Optional Instagram URL; when absent the Instagram link is hidden.
     */
    function openModal(dog) {
        if (!modal) return;
        modalImg.src = dog.image;
        modalName.textContent = dog.name;
        modalBreed.textContent = dog.breed;

        if (dog.color) {
            modalColor.textContent = dog.color;
            modalColorContainer.style.display = 'block';
        } else {
            modalColorContainer.style.display = 'none';
        }

        if (dog.birthdate) {
            modalBirthdate.textContent = dog.birthdate;
            modalBirthdateContainer.style.display = 'block';
        } else {
            modalBirthdateContainer.style.display = 'none';
        }

        if (Array.isArray(dog.description)) {
            modalDesc.innerHTML = dog.description.join('<br><br>');
        } else if (dog.description) {
            modalDesc.textContent = dog.description;
        } else {
            modalDesc.textContent = 'Sin descripción disponible.';
        }

        if (dog.instagram) {
            modalInsta.href = dog.instagram;
            modalInsta.style.display = 'inline-flex';
        } else {
            modalInsta.style.display = 'none';
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });
    }

    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
});