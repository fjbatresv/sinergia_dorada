const DOGS_ENDPOINT = 'content/dogs.json';

export function createDogCard(dog, onOpen = () => {}) {
  const card = document.createElement('div');
  card.classList.add('team-card');
  card.innerHTML = `
    <div class="card-image">
      <img src="${dog.image}" alt="${dog.name}" loading="lazy" width="320" height="320">
    </div>
    <div class="card-content">
      <h3>${dog.name}</h3>
      <span class="breed">${dog.breed}</span>
    </div>
  `;
  card.addEventListener('click', () => onOpen(dog));
  return card;
}

export function getModalElements(doc = document) {
  return {
    modal: doc.getElementById('dog-modal'),
    closeModalBtn: doc.querySelector('.close-modal'),
    modalImg: doc.getElementById('modal-img'),
    modalName: doc.getElementById('modal-name'),
    modalBreed: doc.getElementById('modal-breed'),
    modalColor: doc.getElementById('modal-color'),
    modalColorContainer: doc.getElementById('modal-color-container'),
    modalBirthdate: doc.getElementById('modal-birthdate'),
    modalBirthdateContainer: doc.getElementById('modal-birthdate-container'),
    modalDesc: doc.getElementById('modal-desc'),
    modalInsta: doc.getElementById('modal-insta')
  };
}

export function showDogModal(dog, elements, doc = document) {
  if (!elements?.modal) return;
  const {
    modal,
    modalImg,
    modalName,
    modalBreed,
    modalColor,
    modalColorContainer,
    modalBirthdate,
    modalBirthdateContainer,
    modalDesc,
    modalInsta
  } = elements;

  if (modalImg) {
    modalImg.src = dog.image;
    modalImg.width = 640;
    modalImg.height = 640;
    modalImg.loading = 'lazy';
  }
  if (modalName) modalName.textContent = dog.name;
  if (modalBreed) modalBreed.textContent = dog.breed;

  if (modalColorContainer) {
    if (dog.color) {
      modalColorContainer.style.display = 'block';
      if (modalColor) modalColor.textContent = dog.color;
    } else {
      modalColorContainer.style.display = 'none';
    }
  }

  if (modalBirthdateContainer) {
    if (dog.birthdate) {
      modalBirthdateContainer.style.display = 'block';
      if (modalBirthdate) modalBirthdate.textContent = dog.birthdate;
    } else {
      modalBirthdateContainer.style.display = 'none';
    }
  }

  if (modalDesc) {
    if (Array.isArray(dog.description)) {
      modalDesc.innerHTML = dog.description.join('<br><br>');
    } else if (dog.description) {
      modalDesc.textContent = dog.description;
    } else {
      modalDesc.textContent = 'Sin descripción disponible.';
    }
  }

  if (modalInsta) {
    if (dog.instagram) {
      modalInsta.href = dog.instagram;
      modalInsta.style.display = 'inline-flex';
    } else {
      modalInsta.style.display = 'none';
    }
  }

  modal.classList.add('show');
  if (doc?.body) {
    doc.body.style.overflow = 'hidden';
  }
}

export function hideDogModal(elements, doc = document) {
  if (elements?.modal) {
    elements.modal.classList.remove('show');
  }
  if (doc?.body) {
    doc.body.style.overflow = 'auto';
  }
}

export function updateDimensions(track, dogCount, gap = 32) {
  const firstCard = track?.querySelector('.team-card');
  if (!firstCard) {
    return { cardWidth: undefined, singleSetWidth: undefined };
  }
  const cardWidth = firstCard.offsetWidth + gap;
  return { cardWidth, singleSetWidth: cardWidth * dogCount };
}

export function checkInfiniteScroll(track, singleSetWidth) {
  if (!track || !singleSetWidth) {
    return track?.scrollLeft ?? 0;
  }
  if (track.scrollLeft >= singleSetWidth * 2) {
    track.scrollLeft -= singleSetWidth;
  } else if (track.scrollLeft <= 0) {
    track.scrollLeft += singleSetWidth;
  }
  return track.scrollLeft;
}

export function startAutoScroll(
  track,
  singleSetWidthGetter,
  isHoveredGetter,
  scrollSpeed
) {
  let autoScrollId;
  const restart = () => {
    if (autoScrollId) clearInterval(autoScrollId);
    autoScrollId = setInterval(() => {
      if (!isHoveredGetter() && singleSetWidthGetter()) {
        track.scrollLeft += scrollSpeed;
        checkInfiniteScroll(track, singleSetWidthGetter());
      }
    }, 20);
  };
  restart();
  return () => autoScrollId && clearInterval(autoScrollId);
}

export function initDogs() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (!track) return;

  const modalElements = getModalElements(document);
  fetch(DOGS_ENDPOINT)
    .then((response) => response.json())
    .then((dogs) =>
      setupDogsCarousel({
        track,
        prevBtn,
        nextBtn,
        dogs,
        modalElements,
        startAutoScrollFn: startAutoScroll
      })
    )
    .catch((error) => console.error('Error loading dogs:', error));
}

export function setupDogsCarousel({
  track,
  prevBtn,
  nextBtn,
  dogs,
  modalElements,
  startAutoScrollFn = startAutoScroll
}) {
  if (!track || !Array.isArray(dogs) || dogs.length === 0) return;

  const onOpenDog = (dog) => showDogModal(dog, modalElements, document);

  dogs.forEach((dog) => {
    track.appendChild(createDogCard(dog, onOpenDog));
  });

  dogs.forEach((dog) => {
    track.appendChild(createDogCard(dog, onOpenDog));
  });

  [...dogs].reverse().forEach((dog) => {
    track.insertBefore(createDogCard(dog, onOpenDog), track.firstChild);
  });

  const scrollSpeed = 1;
  let isHovered = false;
  let cardWidth;
  let singleSetWidth;

  const recalcDimensions = () => {
    const sizes = updateDimensions(track, dogs.length);
    if (sizes.cardWidth) cardWidth = sizes.cardWidth;
    if (sizes.singleSetWidth) singleSetWidth = sizes.singleSetWidth;
  };

  setTimeout(() => {
    recalcDimensions();
    if (singleSetWidth) {
      track.scrollLeft = singleSetWidth;
    }
  }, 100);

  window.addEventListener('resize', () => {
    recalcDimensions();
    if (singleSetWidth) {
      track.scrollLeft = singleSetWidth;
    }
  });

  let stopAutoScroll = startAutoScrollFn(
    track,
    () => singleSetWidth,
    () => isHovered,
    scrollSpeed
  );

  const hoverHandlers = {
    mouseenter: () => {
      isHovered = true;
    },
    mouseleave: () => {
      isHovered = false;
    }
  };

  track.addEventListener('mouseenter', hoverHandlers.mouseenter);
  track.addEventListener('mouseleave', hoverHandlers.mouseleave);

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
    nextBtn.addEventListener('mouseenter', hoverHandlers.mouseenter);
    nextBtn.addEventListener('mouseleave', hoverHandlers.mouseleave);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    prevBtn.addEventListener('mouseenter', hoverHandlers.mouseenter);
    prevBtn.addEventListener('mouseleave', hoverHandlers.mouseleave);
  }

  const modal = modalElements.modal;
  const closeModalBtn = modalElements.closeModalBtn;

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () =>
      hideDogModal(modalElements, document)
    );
  }

  window.addEventListener('click', (e) => {
    if (modal && e.target === modal) {
      hideDogModal(modalElements, document);
    }
  });

  // Stop auto scroll if the tab is hidden to avoid running intervals unnecessarily.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoScroll();
    } else {
      stopAutoScroll = startAutoScrollFn(
        track,
        () => singleSetWidth,
        () => isHovered,
        scrollSpeed
      );
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDogs);
  } else {
    initDogs();
  }
}
