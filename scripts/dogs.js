import fallbackDogs from '../content/dogs.json';

const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;
const DOGS_JSON_PATH = 'content/dogs.json';
let teardownCarousel = null;

/**
 * Normalize and validate a URL path relative to the page origin.
 * @param {string} path - A URL or path (absolute or relative) to normalize.
 * @returns {string} The absolute `http`/`https` URL resolved against the page origin, or an empty string if `path` is falsy, the page origin is unavailable, the input is invalid, or the resolved protocol is not `http`/`https`.
 */
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
 * Create a DOM card representing a dog with image, name, and breed and wire a click handler.
 * @param {{image?: string, name?: string, breed?: string}} dog - Dog data; properties may be missing or empty.
 * @param {Function} [onOpen] - Callback invoked with the `dog` object when the card is clicked.
 * @returns {HTMLDivElement} The constructed card element.
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
  const normalizedSrc = normalizeUrl(dog?.image);
  if (normalizedSrc) {
    img.src = normalizedSrc;
  } else {
    img.removeAttribute('src');
  }
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
 * Retrieve references to the dog-detail modal and its related DOM elements.
 * @param {Document} [doc=document] - Document to query for modal elements.
 * @returns {{modal: HTMLElement|null, closeModalBtn: HTMLElement|null, modalImg: HTMLImageElement|null, modalName: HTMLElement|null, modalBreed: HTMLElement|null, modalColor: HTMLElement|null, modalColorContainer: HTMLElement|null, modalBirthdate: HTMLElement|null, modalBirthdateContainer: HTMLElement|null, modalDesc: HTMLElement|null, modalInsta: HTMLAnchorElement|null}} Object with element references keyed by name; each value is the element or `null` if not found.
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

/**
 * Safely set or clear the modal image source and ensure consistent image attributes.
 *
 * If a valid absolute HTTP(S) URL is provided, assigns it to the element's `src`; otherwise removes the `src` attribute.
 * Always sets `width` and `height` to 640 and `loading` to `"lazy"`.
 *
 * @param {HTMLImageElement|null|undefined} modalImg - The <img> element in the modal; nothing happens if missing.
 * @param {string|undefined} imageUrl - The image URL to apply; invalid or non-HTTP(S) URLs will result in `src` being cleared.
 */
function setModalImage(modalImg, imageUrl) {
  if (!modalImg) return;
  const safeSrc = imageUrl ? normalizeUrl(imageUrl) : '';
  if (safeSrc) {
    modalImg.src = safeSrc;
  } else {
    modalImg.removeAttribute('src');
  }
  modalImg.width = 640;
  modalImg.height = 640;
  modalImg.loading = 'lazy';
}

/**
 * Set an element's text content safely.
 * Assigns the element's textContent to the provided value, using an empty string when the value is null or undefined; does nothing if the element is falsy.
 * @param {Element|null|undefined} element - The DOM element whose textContent will be set.
 * @param {string} [value=''] - The text to assign; null or undefined becomes an empty string.
 */
function setText(element, value = '') {
  if (element) element.textContent = value ?? '';
}

/**
 * Show or hide an information row and set its text when a value is present.
 * @param {HTMLElement|null|undefined} container - The container element for the info row; will be hidden if not present or value is falsy.
 * @param {string|number|any} value - The value to display; treated as present when truthy.
 * @param {HTMLElement|null|undefined} textElement - Element whose textContent will be set to `value` when present.
 */
function toggleInfoRow(container, value, textElement) {
  if (!container) return;
  const hasValue = Boolean(value);
  container.style.display = hasValue ? 'block' : 'none';
  if (hasValue && textElement) textElement.textContent = value;
}

/**
 * Render a dog description into the provided container element.
 *
 * If `description` is an array of strings, each item is added as text with two
 * line breaks between items. If it's a non-empty string, it is set as the
 * element's text. If no valid description is provided, the element is set to
 * 'Sin descripción disponible.'. If `descElement` is falsy, the function does nothing.
 *
 * @param {HTMLElement|null|undefined} descElement - Container element where the description will be rendered.
 * @param {string|string[]|any} description - Description to render; may be a string or an array of strings.
 */
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

/**
 * Configure an Instagram anchor element: validate and apply the provided URL or hide the element when absent/invalid.
 *
 * @param {HTMLAnchorElement} linkEl - Anchor element to update; if falsy, the function does nothing.
 * @param {string} instagram - URL or path to the Instagram profile; will be validated and normalized. If valid, assigned to the anchor's `href` and `rel="noopener noreferrer"` is set; if invalid or empty, the anchor is hidden.
 */
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
 * Populate the dog detail modal with the provided data and display it.
 *
 * If the modal element is not present, the function exits without side effects.
 * When shown, page scrolling is locked by setting the document body's overflow to "hidden".
 *
 * @param {object} dog - Dog data used to populate the modal. Expected properties: `image`, `name`, `breed`, `color`, `birthdate`, `description`, and `instagram`.
 * @param {ReturnType<typeof getModalElements>} modalElements - References to modal DOM elements returned by `getModalElements`.
 * @param {Document} [doc=document] - Document object to operate on (defaults to the global document).
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
 * Hide the dog detail modal and restore page scrolling.
 *
 * Removes the modal's visible state and resets the document body's overflow style so the page can scroll.
 * @param {ReturnType<typeof getModalElements>} modalElements - Object containing modal DOM references (must include `modal` to be hidden).
 * @param {Document} [doc=document] - Document object whose body overflow will be restored.
 */
function hideDogModal(modalElements, doc = document) {
  if (modalElements?.modal) modalElements.modal.classList.remove('show');
  if (doc?.body) doc.body.style.overflow = 'auto';
}

/**
 * Compute the width of a single card (including gap) and the total width of one set of cards.
 * @param {HTMLElement} track - Container element that holds card elements.
 * @param {number} dogCount - Number of cards in a single logical set.
 * @param {number} [gap=32] - Horizontal gap in pixels added to each card's offsetWidth.
 * @returns {{cardWidth: number|undefined, singleSetWidth: number|undefined}} Object with `cardWidth` (width in pixels of one card plus gap) and `singleSetWidth` (`cardWidth` multiplied by `dogCount`); both are `undefined` if no card element is found.
 */
function updateDimensions(track, dogCount, gap = 32) {
  const firstCard = track?.querySelector('.team-card');
  if (!firstCard) return { cardWidth: undefined, singleSetWidth: undefined };
  const cardWidth = firstCard.offsetWidth + gap;
  return { cardWidth, singleSetWidth: cardWidth * dogCount };
}

/**
 * Repositions the horizontal scroll to simulate an infinite looping carousel.
 *
 * Adjusts the track's scroll position when it has moved past the duplicated set boundaries so the visible sequence appears continuous.
 * @param {HTMLElement} track - The scrolling container element for the carousel.
 * @param {number} singleSetWidth - The width (in pixels) of one full set of items.
 * @returns {number} The track's updated scrollLeft value.
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
 * Start automatic horizontal scrolling of the given track.
 *
 * Begins periodic small horizontal increments and applies the carousel's infinite-scroll adjustment while not paused.
 * @param {HTMLElement} track - The scrollable track element to advance.
 * @param {Function} getSingleSetWidth - Function returning the current width (in pixels) of one set of cards; used for infinite-loop calculations.
 * @param {Function} isPaused - Function returning `true` when auto-scrolling should be suspended, `false` otherwise.
 * @param {number} [step=1] - Number of pixels to advance the track on each tick.
 * @returns {Function} A cleanup function that stops the automatic scrolling when invoked.
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

/**
 * Display a centered error message inside the carousel track element.
 *
 * Clears the track's contents, creates a container with role="status" and class "team-error",
 * sets its text to the provided message, and appends it to the track.
 * @param {HTMLElement|null|undefined} track - Container element where the error message will be rendered; nothing happens if falsy.
 * @param {string} [message='No pudimos cargar el equipo en este momento.'] - Message text to show inside the error container.
 */
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

/**
 * Fetches dog data JSON from the configured network path.
 *
 * @returns {any} Parsed JSON value containing the dogs dataset.
 * @throws {Error} If the HTTP response is not OK; the error message includes the response status.
 */
function fetchDogsFromNetwork() {
  const url = normalizeUrl(DOGS_JSON_PATH);
  return fetch(url).then((response) => {
    if (!response?.ok) throw new Error(`HTTP ${response?.status ?? 'error'}`);
    return response.json();
  });
}
/* c8 ignore stop */

/**
 * Initialize and wire a horizontal carousel of dog cards with navigation controls and modal interactions.
 *
 * @param {Object} options - Configuration options.
 * @param {HTMLElement} options.track - Scrollable container element that will hold the dog cards.
 * @param {HTMLElement} [options.prevBtn] - Optional previous button; wired to scroll the track backward.
 * @param {HTMLElement} [options.nextBtn] - Optional next button; wired to scroll the track forward.
 * @param {Array<Object>} options.dogs - Array of dog data objects used to build the cards.
 * @param {Object} options.modalElements - References to modal DOM elements used for displaying dog details.
 * @param {Function} [options.startAutoScrollFn=startAutoScroll] - Function that starts auto-scrolling; receives (track, getSingleSetWidth, isPaused, step) and returns a stop function.
 * @returns {Function|undefined} A cleanup function that removes event listeners and stops timers created by the carousel, or `undefined` if the carousel was not initialized due to invalid inputs.
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
 * Initialize the dogs carousel on the page.
 *
 * Finds the carousel track and navigation controls in the DOM, builds and displays dog cards populated from the network or a local fallback, wires modal and interaction handlers, and retains a teardown function to remove listeners and stop auto-scrolling. If the carousel track element is not found, the function returns immediately. Errors loading remote data are logged and, when available, a local fallback array is used instead; if no data is available an error message is rendered into the track.
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
