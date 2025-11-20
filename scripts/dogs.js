document.addEventListener('DOMContentLoaded', () => {
    fetch('content/dogs.json')
        .then(response => response.json())
        .then(dogs => {
            const track = document.getElementById('carousel-track');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');

            if (!track) return;

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

            function checkInfiniteScroll() {
                if (!singleSetWidth) return;
                if (track.scrollLeft >= singleSetWidth * 2) {
                    track.scrollLeft -= singleSetWidth;
                } else if (track.scrollLeft <= 0) {
                    track.scrollLeft += singleSetWidth;
                }
            }

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
