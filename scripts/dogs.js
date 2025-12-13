import fallbackDogs from '../content/dogs.json';

const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;
const DOGS_JSON_PATH = 'content/dogs.json';

function normalizeUrl(path) {
  if (!path) return '';
  const origin = globalScope?.location?.origin ?? null;
  if (!origin) return '';
  try {
    const url = new URL(path, origin);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function createDogCard(dog, onOpen = () => {}) {
  const card = document.createElement('div');
  card.classList.add('team-card');

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('card-image');
  const img = document.createElement('img');
  const name = typeof dog?.name === 'string' ? dog.name : '';
  img.loading = 'lazy';
  img.width = 320;
  img.height = 320;
  img.alt = name || 'Perro';
  img.src = normalizeUrl(dog?.image);
  imageWrapper.appendChild(img);

  const content = document.createElement('div');
  content.classList.add('card-content');
  const heading = document.createElement('h3');
  heading.textContent = name;
  content.appendChild(heading);

  const breed = document.createElement('span');
  breed.classList.add('breed');
  breed.textContent = typeof dog?.breed === 'string' ? dog.breed : '';
  content.appendChild(breed);

  card.appendChild(imageWrapper);
  card.appendChild(content);
  card.addEventListener('click', () => onOpen(dog));
  return card;
}

function getModalElements(doc = document) {
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

function setModalImage(modalImg, imageUrl) {
  if (!modalImg) return;
  modalImg.src = normalizeUrl(imageUrl);
  modalImg.width = 640;
  modalImg.height = 640;
  modalImg.loading = 'lazy';
}

function setText(element, value = '') {
  if (element) element.textContent = value ?? '';
}

function toggleInfoRow(container, value, textElement) {
  if (!container) return;
  const hasValue = Boolean(value);
  container.style.display = hasValue ? 'block' : 'none';
  if (hasValue && textElement) textElement.textContent = value;
}

function renderDescription(descElement, description) {
  if (!descElement) return;
  while (descElement.firstChild) {
    descElement.firstChild.remove();
  }

  if (Array.isArray(description) && description.length > 0) {
    description.forEach((line, index) => {
      descElement.appendChild(
        document.createTextNode(typeof line === 'string' ? line : '')
      );
      if (index < description.length - 1) {
        descElement.appendChild(document.createElement('br'));
        descElement.appendChild(document.createElement('br'));
      }
    });
    return;
  }

  if (typeof description === 'string' && description) {
    descElement.textContent = description;
    return;
  }

  descElement.textContent = 'Sin descripción disponible.';
}

function renderInstagram(linkEl, instagram) {
  if (!linkEl) return;
  const href = instagram ? normalizeUrl(instagram) : '';
  const hasHref = Boolean(href);
  linkEl.style.display = hasHref ? 'inline-flex' : 'none';
  if (hasHref) {
    linkEl.href = href;
    linkEl.rel = 'noopener noreferrer';
  }
}

function showDogModal(dog, modalElements, doc = document) {
  if (!modalElements?.modal) return;
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
  } = modalElements;

  setModalImage(modalImg, dog.image);
  setText(modalName, dog.name);
  setText(modalBreed, dog.breed);
  toggleInfoRow(modalColorContainer, dog.color, modalColor);
  toggleInfoRow(modalBirthdateContainer, dog.birthdate, modalBirthdate);
  renderDescription(modalDesc, dog.description);
  renderInstagram(modalInsta, dog.instagram);

  modal.classList.add('show');
  if (doc?.body) doc.body.style.overflow = 'hidden';
}

function hideDogModal(modalElements, doc = document) {
  if (modalElements?.modal) modalElements.modal.classList.remove('show');
  if (doc?.body) doc.body.style.overflow = 'auto';
}

function updateDimensions(track, dogCount, gap = 32) {
  const firstCard = track?.querySelector('.team-card');
  if (!firstCard) return { cardWidth: undefined, singleSetWidth: undefined };
  const cardWidth = firstCard.offsetWidth + gap;
  return { cardWidth, singleSetWidth: cardWidth * dogCount };
}

function checkInfiniteScroll(track, singleSetWidth) {
  if (!track || !singleSetWidth) return track?.scrollLeft ?? 0;

  const needsResetForward = track.scrollLeft >= singleSetWidth * 2;
  const needsResetBack = track.scrollLeft <= 0;

  if (needsResetForward) {
    track.scrollLeft -= singleSetWidth;
  } else if (needsResetBack) {
    track.scrollLeft += singleSetWidth;
  }

  return track.scrollLeft;
}

function startAutoScroll(track, getSingleSetWidth, isPaused, step = 1) {
  let intervalId;
  const tick = () => {
    const width = getSingleSetWidth();
    if (!width || isPaused()) return;
    track.scrollLeft += step;
    checkInfiniteScroll(track, width);
  };

  const start = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(tick, 20);
  };

  start();
  return () => clearInterval(intervalId);
}

function renderError(
  track,
  message = 'No pudimos cargar el equipo en este momento.'
) {
  if (!track) return;
  track.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'team-error';
  wrapper.setAttribute('role', 'status');
  wrapper.textContent = message;
  track.appendChild(wrapper);
}

function fetchDogsFromNetwork() {
  return fetch(DOGS_JSON_PATH).then((response) => {
    if (!response?.ok) throw new Error(`HTTP ${response?.status ?? 'error'}`);
    return response.json();
  });
}

function setupDogsCarousel({
  track,
  prevBtn,
  nextBtn,
  dogs,
  modalElements,
  startAutoScrollFn = startAutoScroll
}) {
  if (!track || !Array.isArray(dogs) || dogs.length === 0) return;
  const onOpen = (dog) => showDogModal(dog, modalElements, document);

  const addCard = (dog) => track.appendChild(createDogCard(dog, onOpen));
  dogs.forEach(addCard);
  dogs.forEach(addCard);
  [...dogs].reverse().forEach((dog) => {
    track.insertBefore(createDogCard(dog, onOpen), track.firstChild);
  });

  const state = {
    paused: false,
    cardWidth: undefined,
    singleSetWidth: undefined
  };
  const recalc = () => {
    const dims = updateDimensions(track, dogs.length);
    state.cardWidth = dims.cardWidth;
    state.singleSetWidth = dims.singleSetWidth;
    if (state.singleSetWidth) track.scrollLeft = state.singleSetWidth;
  };

  setTimeout(recalc, 100);
  globalScope?.addEventListener?.('resize', recalc);

  let stopAuto = startAutoScrollFn(
    track,
    () => state.singleSetWidth,
    () => state.paused,
    1
  );

  const toggleHover = (hovered) => {
    state.paused = hovered;
  };
  track.addEventListener('mouseenter', () => toggleHover(true));
  track.addEventListener('mouseleave', () => toggleHover(false));

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.cardWidth)
        track.scrollBy({ left: state.cardWidth, behavior: 'smooth' });
    });
    nextBtn.addEventListener('mouseenter', () => toggleHover(true));
    nextBtn.addEventListener('mouseleave', () => toggleHover(false));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.cardWidth)
        track.scrollBy({ left: -state.cardWidth, behavior: 'smooth' });
    });
    prevBtn.addEventListener('mouseenter', () => toggleHover(true));
    prevBtn.addEventListener('mouseleave', () => toggleHover(false));
  }

  const modal = modalElements.modal;
  const closeModalBtn = modalElements.closeModalBtn;
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () =>
      hideDogModal(modalElements, document)
    );
  }
  document.addEventListener('click', (event) => {
    if (modal && event.target === modal) hideDogModal(modalElements, document);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto?.();
      return;
    }
    stopAuto = startAutoScrollFn(
      track,
      () => state.singleSetWidth,
      () => state.paused,
      1
    );
  });
}

function initDogs() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (!track) return;

  const modalElements = getModalElements(document);
  const fallback = Array.isArray(fallbackDogs) ? fallbackDogs : [];
  const buildCarousel = (dogs) =>
    setupDogsCarousel({
      track,
      prevBtn,
      nextBtn,
      dogs,
      modalElements,
      startAutoScrollFn: startAutoScroll
    });

  fetchDogsFromNetwork()
    .then(buildCarousel)
    .catch((error_) => {
      console.error('Error loading dogs:', error_);
      if (fallback.length) {
        console.info('Usando fallback local para dogs.json');
        buildCarousel(fallback);
        return;
      }
      renderError(track);
    });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDogs);
  } else {
    initDogs();
  }
}

export {
  checkInfiniteScroll,
  createDogCard,
  getModalElements,
  hideDogModal,
  initDogs,
  setupDogsCarousel,
  showDogModal,
  startAutoScroll,
  updateDimensions
};
