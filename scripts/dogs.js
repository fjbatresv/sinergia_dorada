import fallbackDogs from '../content/dogs.json';

const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;
const DOGS_JSON_PATH = 'content/dogs.json';
let teardownCarousel = null;

/* c8 ignore start */
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
/* c8 ignore stop */

/**
 * Crea una tarjeta del equipo canino y enlaza el handler de apertura.
 * @param {object} dog - Datos del perro (imagen, nombre, raza).
 * @param {Function} [onOpen] - Callback cuando se hace clic.
 * @returns {HTMLDivElement}
 */
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

/**
 * Obtiene las referencias del modal de perros.
 * @param {Document} [doc=document]
 * @returns {{modal: HTMLElement|null, closeModalBtn: HTMLElement|null, modalImg: HTMLImageElement|null, modalName: HTMLElement|null, modalBreed: HTMLElement|null, modalColor: HTMLElement|null, modalColorContainer: HTMLElement|null, modalBirthdate: HTMLElement|null, modalBirthdateContainer: HTMLElement|null, modalDesc: HTMLElement|null, modalInsta: HTMLAnchorElement|null}}
 */
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

/**
 * Pinta el contenido del modal y lo muestra.
 * @param {object} dog - Datos del perro seleccionados.
 * @param {ReturnType<typeof getModalElements>} modalElements
 * @param {Document} [doc=document]
 */
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

/**
 * Oculta el modal y restablece el scroll del body.
 * @param {ReturnType<typeof getModalElements>} modalElements
 * @param {Document} [doc=document]
 */
function hideDogModal(modalElements, doc = document) {
  if (modalElements?.modal) modalElements.modal.classList.remove('show');
  if (doc?.body) doc.body.style.overflow = 'auto';
}

/**
 * Calcula el ancho de tarjeta y del set completo.
 * @param {HTMLElement} track
 * @param {number} dogCount
 * @param {number} [gap=32]
 * @returns {{cardWidth: number|undefined, singleSetWidth: number|undefined}}
 */
function updateDimensions(track, dogCount, gap = 32) {
  const firstCard = track?.querySelector('.team-card');
  if (!firstCard) return { cardWidth: undefined, singleSetWidth: undefined };
  const cardWidth = firstCard.offsetWidth + gap;
  return { cardWidth, singleSetWidth: cardWidth * dogCount };
}

/**
 * Reposiciona el scroll cuando se alcanza el límite para simular carrusel infinito.
 * @param {HTMLElement} track
 * @param {number} singleSetWidth
 * @returns {number}
 */
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

/**
 * Inicia el auto-scroll del carrusel y devuelve un limpiador.
 * @param {HTMLElement} track
 * @param {Function} getSingleSetWidth
 * @param {Function} isPaused
 * @param {number} [step=1]
 * @returns {Function} cleanup interval
 */
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

/* c8 ignore start */
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
/* c8 ignore stop */

/**
 * Configura el carrusel del equipo canino (tarjetas, controles, modal).
 * @returns {Function|undefined} cleanup de listeners y timers.
 */
function setupDogsCarousel({
  track,
  prevBtn,
  nextBtn,
  dogs,
  modalElements,
  startAutoScrollFn = startAutoScroll
}) {
  if (!track || !Array.isArray(dogs) || dogs.length === 0) return;
  const cleanup = [];
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
  const handleResize = () => recalc();
  globalScope?.addEventListener?.('resize', handleResize);
  cleanup.push(() =>
    globalScope?.removeEventListener?.('resize', handleResize)
  );

  let stopAuto = startAutoScrollFn(
    track,
    () => state.singleSetWidth,
    () => state.paused,
    1
  );

  const toggleHover = (hovered) => {
    state.paused = hovered;
  };
  const handleTrackEnter = () => toggleHover(true);
  const handleTrackLeave = () => toggleHover(false);
  track.addEventListener('mouseenter', handleTrackEnter);
  track.addEventListener('mouseleave', handleTrackLeave);
  cleanup.push(() => {
    track.removeEventListener('mouseenter', handleTrackEnter);
    track.removeEventListener('mouseleave', handleTrackLeave);
  });

  if (nextBtn) {
    const handleNextClick = () => {
      if (state.cardWidth)
        track.scrollBy({ left: state.cardWidth, behavior: 'smooth' });
    };
    const handleNextEnter = () => toggleHover(true);
    const handleNextLeave = () => toggleHover(false);
    nextBtn.addEventListener('click', handleNextClick);
    nextBtn.addEventListener('mouseenter', handleNextEnter);
    nextBtn.addEventListener('mouseleave', handleNextLeave);
    cleanup.push(() => {
      nextBtn.removeEventListener('click', handleNextClick);
      nextBtn.removeEventListener('mouseenter', handleNextEnter);
      nextBtn.removeEventListener('mouseleave', handleNextLeave);
    });
  }

  if (prevBtn) {
    const handlePrevClick = () => {
      if (state.cardWidth)
        track.scrollBy({ left: -state.cardWidth, behavior: 'smooth' });
    };
    const handlePrevEnter = () => toggleHover(true);
    const handlePrevLeave = () => toggleHover(false);
    prevBtn.addEventListener('click', handlePrevClick);
    prevBtn.addEventListener('mouseenter', handlePrevEnter);
    prevBtn.addEventListener('mouseleave', handlePrevLeave);
    cleanup.push(() => {
      prevBtn.removeEventListener('click', handlePrevClick);
      prevBtn.removeEventListener('mouseenter', handlePrevEnter);
      prevBtn.removeEventListener('mouseleave', handlePrevLeave);
    });
  }

  const modal = modalElements.modal;
  const closeModalBtn = modalElements.closeModalBtn;
  if (closeModalBtn && modal) {
    const handleClose = () => hideDogModal(modalElements, document);
    closeModalBtn.addEventListener('click', handleClose);
    cleanup.push(() => closeModalBtn.removeEventListener('click', handleClose));
  }
  const handleDocClick = (event) => {
    if (modal && event.target === modal) hideDogModal(modalElements, document);
  };
  document.addEventListener('click', handleDocClick);
  cleanup.push(() => document.removeEventListener('click', handleDocClick));

  const handleVisibility = () => {
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
  };
  document.addEventListener('visibilitychange', handleVisibility);
  cleanup.push(
    () => document.removeEventListener('visibilitychange', handleVisibility),
    () => stopAuto?.(),
    () => cleanup.length && cleanup.splice(0).forEach((fn) => fn())
  );

  return () => {
    const tasks = cleanup.splice(0);
    tasks.forEach((fn) => fn());
  };
}

/**
 * Punto de entrada para inicializar el carrusel de perros en la página.
 */
function initDogs() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (!track) return;

  teardownCarousel?.();

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
    .then((dogsData) => {
      teardownCarousel = buildCarousel(dogsData);
    })
    .catch((error_) => {
      console.error('Error loading dogs:', error_);
      if (fallback.length) {
        console.info('Usando fallback local para dogs.json');
        teardownCarousel = buildCarousel(fallback);
        return;
      }
      renderError(track);
    });
}

/* c8 ignore start */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDogs);
  } else {
    initDogs();
  }
}
/* c8 ignore stop */

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
