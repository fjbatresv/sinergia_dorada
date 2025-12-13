import fallbackContent from '../content/site-content.json';

const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;

/**
 * Generate a pseudorandom floating-point number in the range [0, 1).
 *
 * Produces a number greater than or equal to 0 and less than 1; when the
 * environment provides a crypto-secure source, that source is used, otherwise
 * falls back to Math.random().
 * @returns {number} A value >= 0 and < 1 from a cryptographically secure RNG when available, otherwise from Math.random().
 */
function secureRandomFloat() {
  const crypto = globalScope?.crypto;
  if (crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  // Non-cryptographic fallback; keep range [0, 1)
  return Math.random();
}

/** Mapeo de secciones y sus selectores en el DOM. */
const sectionsSelector = {
  hero: '#inicio',
  about: '#nosotros',
  statistics: '.statistics',
  partners: '.partners',
  testimonials: '.testimonials',
  team: '#equipo',
  join: '.join-us',
  contact: '#contacto'
};

/**
 * Toggle the visibility of all elements matching a CSS selector by adding or removing the 'section-hidden' class.
 *
 * Applies the 'section-hidden' CSS class when visible is false and removes it when visible is true for every element matched by the selector.
 *
 * @param {string} selector - CSS selector matching one or more section elements; if falsy no action is taken.
 * @param {boolean} visible - Whether matched sections should be shown.
 * @param {Document} [doc=document] - Document in which to query elements (defaults to the global document).
 */
function setSectionVisibility(selector, visible, doc = document) {
  /* c8 ignore next */
  if (!selector) return;
  doc.querySelectorAll(selector).forEach((el) => {
    el.classList.toggle('section-hidden', !visible);
  });
}

/**
 * Apply visibility settings to the site's predefined sections.
 *
 * For each recognized section key, uses the provided mapping to show or hide that section; keys not present in the mapping are shown.
 * @param {Record<string, boolean>} [sections={}] - Mapping of section identifiers to visibility: `true` to show, `false` to hide.
 * @param {Document} [doc=document] - Document object whose elements will be updated; defaults to the global `document`.
 */
function applySectionVisibility(sections = {}, doc = document) {
  Object.entries(sectionsSelector).forEach(([key, selector]) => {
    const isVisible = Object.hasOwn(sections, key) ? !!sections[key] : true;
    setSectionVisibility(selector, isVisible, doc);
  });
}

/**
 * Builds the main navigation list from an array of items.
 * @param {HTMLElement|null} list - The list element (e.g., UL/OL) to populate; no action is taken if falsy.
 * @param {Array<{label:string,target:string}>} [items=[]] - Navigation entries; each object provides `label` (link text) and `target` (href).
 */
function populateNavigation(list, items = []) {
  /* c8 ignore next */
  if (!list || !Array.isArray(items) || items.length === 0) return;
  list.innerHTML = '';
  items.forEach(({ label = '', target = '#' }) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = label;
    link.href = target;
    link.classList.add('nav-link');
    li.appendChild(link);
    list.appendChild(li);
  });
}

/**
 * Render statistic cards into the given container and start their animated counters.
 *
 * Each stat produces a card with a numeric value (optionally prefixed with '+') and a label, then invokes the animation runner.
 *
 * @param {HTMLElement|null} container - Element that will receive the statistic cards; if falsy the function is a no-op.
 * @param {Array<{label:string,value:number,plus?:boolean}>} [stats=[]] - Array of stats to render. Each item should contain:
 *   - label: displayed text for the stat.
 *   - value: numeric target for the animated counter.
 *   - plus (optional): when true forces a '+' prefix; otherwise a '+' is also added if the label contains "personas impactadas" (case-insensitive).
 */
function populateStatistics(container, stats = []) {
  /* c8 ignore next */
  if (!container || !Array.isArray(stats) || stats.length === 0) return;
  container.innerHTML = '';
  stats.forEach((stat) => {
    const item = document.createElement('div');
    item.className = 'stat-item fade-up visible';

    const hasPlus =
      stat.plus === true ||
      (typeof stat.label === 'string' &&
        stat.label.toLowerCase().includes('personas impactadas'));

    const number = document.createElement('div');
    number.className = 'stat-number';
    number.dataset.target = stat.value || 0;
    number.dataset.prefix = hasPlus ? '+' : '';
    number.innerHTML = `<span class="stat-value">${hasPlus ? '+' : ''}${stat.value ?? 0}</span>`;

    const label = document.createElement('p');
    label.className = 'stat-label';
    label.textContent = stat.label || '';

    item.appendChild(number);
    item.appendChild(label);
    container.appendChild(item);
  });
  animateStats(container);
}

/**
 * Normalize the input into a non-empty array.
 *
 * @param {*} list - Value to normalize.
 * @returns {Array} `list` if it is an array with at least one element, otherwise an empty array.
 */
function ensureArray(list) {
  return Array.isArray(list) && list.length ? list : [];
}

/**
 * Distributes matching child elements inside a container by assigning each a left/top percentage position.
 *
 * Positions elements selected by `itemSelector` with pseudo-random, non-overlapping coordinates (as percentage values)
 * while avoiding a central exclusion zone. Updates each element's inline `left` and `top` styles.
 *
 * @param {Element} container - Parent element containing items to position.
 * @param {string} [itemSelector='.floating-item'] - CSS selector for items to place; defaults to '.floating-item'.
 */
function positionFloatingItems(container, itemSelector = '.floating-item') {
  const items = container.querySelectorAll(itemSelector);
  if (!items.length) return;

  const placed = [];
  const centerX = 50;
  const centerY = 50;
  const minDistance = 20;

  items.forEach((item) => {
    let attempts = 0;
    let left = 0;
    let top = 0;
    let positioned = false;

    while (!positioned && attempts < 100) {
      left = secureRandomFloat() * 85;
      top = secureRandomFloat() * 85;

      if (Math.hypot(left - centerX, top - centerY) < minDistance) {
        attempts++;
        continue;
      }

      const overlaps = placed.some(
        (pos) => Math.hypot(left - pos.left, top - pos.top) < 10
      );

      positioned = !overlaps;
      attempts++;
    }

    item.style.left = `${left}%`;
    item.style.top = `${top}%`;
    placed.push({ left, top });
  });
}

/**
 * Render a word cloud into the given canvas using the provided words or a fallback list.
 * @param {HTMLCanvasElement} canvas - Canvas element where the word cloud will be drawn.
 * @param {HTMLElement} container - Container element used to size the canvas.
 * @param {Array.<[string, number]>} words - Array of [word, weight] pairs to display; if empty or falsy, the `fallback` list is used.
 * @param {Array.<[string, number]>} fallback - Fallback array of [word, weight] pairs used when `words` is empty or not provided.
 */
function drawWordCloud(canvas, container, words, fallback) {
  if (!canvas || !container) return;

  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  if (canvas.width === 0) return;
  if (!globalScope || typeof globalScope.WordCloud !== 'function') return;

  const list = ensureArray(words).length ? words : fallback;
  globalScope.WordCloud(canvas, {
    list,
    gridSize: 8,
    weightFactor(size) {
      return (size / 50) * (canvas.width / 10);
    },
    fontFamily: '"Poppins", sans-serif',
    color() {
      const palette = ['#D4AF37', '#C5A028', '#B08D1E', '#333333', '#555555'];
      const idx = Math.floor(secureRandomFloat() * palette.length);
      return palette[idx];
    },
    rotateRatio: 0,
    backgroundColor: 'transparent',
    shape: 'circle',
    ellipticity: 1
  });
}

/**
 * Injects decorative floating items into the hero collage and arranges them within the collage.
 *
 * Creates a container for floating items if one does not exist, clears its contents,
 * adds one element per provided item (each rendered as a lazy-loaded image with type-based CSS classes
 * and a staggered fade-in delay), and positions the items in a pseudo-random layout inside the collage.
 *
 * @param {HTMLElement|null} heroCollage - The hero collage element to populate; nothing is done if null.
 * @param {Array<Object>} [items=[]] - Array of items to render. Each item should have:
 *   - {string} image: URL of the image.
 *   - {string} [alt]: Alt text for the image.
 *   - {string} [type]: Optional type used to add a modifier CSS class (e.g., "dog").
 */
function applyHeroFloatingItems(heroCollage, items = []) {
  /* c8 ignore next */
  if (!heroCollage) return;

  let container = heroCollage.querySelector('.floating-items');
  if (!container) {
    container = document.createElement('div');
    container.className = 'floating-items';
    heroCollage.prepend(container);
  }

  container.innerHTML = '';
  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const typeClass = item.type ? ` floating-${item.type}` : '';
    const floatingItem = document.createElement('div');
    floatingItem.className = `floating-item floating-dog${typeClass} fade-in delay-${(index % 5) + 1}`;
    floatingItem.innerHTML = `<img src="${item.image}" alt="${item.alt || ''}" loading="lazy" width="320" height="320" decoding="async">`;
    container.appendChild(floatingItem);
  });

  positionFloatingItems(container, '.floating-item');
}

/**
 * Apply hero collage floating items and configure the call-to-action button.
 *
 * If `heroContent` is falsy, no changes are made.
 *
 * @param {HTMLElement|null} heroCollage - Container for hero floating items; may be null.
 * @param {HTMLElement|null} ctaButton - Anchor or button element for the hero CTA; may be null.
 * @param {object} heroContent - Content for the hero section.
 * @param {Array<object>} [heroContent.floatingItems] - Floating items to render inside the collage.
 * @param {string} [heroContent.ctaText] - Text to set on the CTA button.
 * @param {string} [heroContent.ctaLink] - Href to set on the CTA button.
 */
function applyHeroContent(heroCollage, ctaButton, heroContent) {
  /* c8 ignore next */
  if (!heroContent) return;

  applyHeroFloatingItems(heroCollage, heroContent.floatingItems);
  if (ctaButton && heroContent.ctaText) {
    ctaButton.textContent = heroContent.ctaText;
    if (heroContent.ctaLink) ctaButton.href = heroContent.ctaLink;
  }
}

/**
 * Populate a container with Mission, Vision, and Values cards.
 *
 * Renders three cards labeled "Misión", "Visión", and "Valores" inside the provided container.
 * Each card receives a data-tab attribute of `mission`, `vision`, or `values`. The first card
 * is given the `active` class. For each field in `about`, a string value is used as-is and an
 * array value is joined with commas. If `container` is falsy or `about` is not provided, the
 * function performs no action.
 *
 * @param {HTMLElement|null} container - Element to populate with the MVV cards; if falsy the call is a no-op.
 * @param {Object} [about={}] - Source content for the cards.
 * @param {string|string[]} [about.mission] - Mission text or array of phrases.
 * @param {string|string[]} [about.vision] - Vision text or array of phrases.
 * @param {string|string[]} [about.values] - Values text or array of phrases.
 */
function applyAboutContent(container, about = {}) {
  /* c8 ignore next */
  if (!container || !about) return;

  container.innerHTML = '';
  const cards = [
    { key: 'mission', label: 'Misión', text: about.mission },
    { key: 'vision', label: 'Visión', text: about.vision },
    { key: 'values', label: 'Valores', text: about.values }
  ];

  cards.forEach((card, index) => {
    const element = document.createElement('div');
    element.className = `mvv-card ${index === 0 ? 'active' : ''}`;
    element.dataset.tab = card.key;
    const content = Array.isArray(card.text)
      ? card.text.join(', ')
      : card.text || '';
    element.innerHTML = `
      <h3>${card.label}</h3>
      <p>${content}</p>
    `;
    container.appendChild(element);
  });
}

/**
 * Render partner logos into the given container element.
 *
 * Each partner is rendered as a `.partner-logo` element containing an `<img>` using lazy loading.
 * The image's `src` is taken from `partner.logo`, `alt` from `partner.name`, and the element
 * includes width="180" and height="100".
 *
 * @param {HTMLElement|null} container - DOM element that will receive the partner logo elements; nothing is done if falsy.
 * @param {Array<{name: string, logo: string}>} [partners=[]] - Array of partner entries with `name` (used for alt text) and `logo` (image URL).
 */
function applyPartners(container, partners = []) {
  /* c8 ignore next */
  if (!container || !partners.length) return;
  container.innerHTML = '';
  partners.forEach((partner) => {
    const div = document.createElement('div');
    div.className = 'partner-logo';
    div.innerHTML = `<img src="${partner.logo}" alt="${partner.name}" loading="lazy" width="180" height="100">`;
    container.appendChild(div);
  });
}

/**
 * Render testimonial cards into a track element and corresponding navigation dots.
 *
 * Clears any existing content in the provided track and dots container, then creates
 * a testimonial card for each item and a corresponding dot. The first testimonial
 * is marked as featured and its dot is marked active.
 *
 * @param {HTMLElement|null} track - Container element that will receive testimonial cards; nothing is done if falsy.
 * @param {HTMLElement|null} dotsContainer - Container element that will receive dot indicators; nothing is done if falsy.
 * @param {Array<Object>} [testimonials=[]] - Array of testimonial objects. Each object may include:
 *   - {string} quote - The testimonial text.
 *   - {string} author - The testimonial author's name.
 *   - {string} role - The testimonial author's role or title.
 */
function applyTestimonials(track, dotsContainer, testimonials = []) {
  /* c8 ignore next */
  if (!track || !Array.isArray(testimonials) || testimonials.length === 0) {
    return;
  }

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  testimonials.forEach((testimonial, index) => {
    const card = document.createElement('div');
    card.className = `testimonial-card ${index === 0 ? 'featured' : ''}`;
    card.innerHTML = `
      <div class="quote">"${testimonial.quote || ''}"</div>
      <div class="author">
        <div>
          <h4>${testimonial.author || ''}</h4>
          <p>${testimonial.role || ''}</p>
        </div>
      </div>
    `;
    track.appendChild(card);

    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dotsContainer.appendChild(dot);
  });
}

/**
 * Sets up a horizontal testimonials carousel with autoplay, hover-to-pause, dot navigation, and optional prev/next controls.
 *
 * Initializes layout and active-state handling for child testimonial cards inside `track`, advances the active card automatically every 5 seconds, pauses autoplay while the pointer is over the track, and wires dot clicks and optional prev/next buttons to change the active card and restart autoplay.
 *
 * @param {HTMLElement} track - Container element whose direct children are testimonial cards; must be present in the document.
 * @param {HTMLElement} dotsContainer - Container holding `.dot` elements corresponding to each card; active dot is toggled to match the active card.
 * @param {HTMLElement|null} prevBtn - Optional element that, when provided, navigates to the previous card on click.
 * @param {HTMLElement|null} nextBtn - Optional element that, when provided, navigates to the next card on click.
 */
function initTestimonialsCarousel(track, dotsContainer, prevBtn, nextBtn) {
  const cards = Array.from(track.children);
  if (!cards.length) return;

  track.style.display = 'flex';
  track.style.gap = '24px';
  track.style.position = 'relative';

  const total = cards.length;
  let index = 0;
  let intervalId;

  const getGap = () => {
    const styles = getComputedStyle(track);
    return Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
  };

  const setActive = (withTransition = true) => {
    const gap = getGap();
    const cardWidth = cards[0].getBoundingClientRect().width;
    const offset =
      (cardWidth + gap) * index - (track.clientWidth - cardWidth) / 2;

    cards.forEach((card, idx) =>
      card.classList.toggle('featured', idx === index)
    );
    dotsContainer
      .querySelectorAll('.dot')
      .forEach((dot, idx) => dot.classList.toggle('active', idx === index));

    track.style.transition = withTransition ? 'transform 0.6s ease' : 'none';
    track.style.transform = `translateX(-${offset}px)`;
  };

  const next = () => {
    index = (index + 1) % total;
    setActive();
  };

  const prev = () => {
    index = (index - 1 + total) % total;
    setActive();
  };

  const restartAutoPlay = () => {
    clearInterval(intervalId);
    intervalId = setInterval(next, 5000);
  };

  restartAutoPlay();
  setActive(false);

  track.addEventListener('mouseenter', () => clearInterval(intervalId));
  track.addEventListener('mouseleave', restartAutoPlay);

  dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      index = idx;
      setActive();
      restartAutoPlay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      restartAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      restartAutoPlay();
    });
  }
}
/* c8 ignore stop */

/**
 * Apply text content to configurable site sections by populating specific elements by ID.
 *
 * Populates titles, subtitles, labels, and button text for partners, testimonials, team, join, and contact sections.
 * Elements are selected by fixed IDs (e.g., "partners-title", "testimonials-title", "join-button"). Missing elements or values are skipped.
 * When `testimonials.titleHtml` is provided it is set as HTML; all other values are assigned to textContent.
 *
 * @param {Object} [sectionsContent={}] - Section content values.
 * @param {{ title?: string, subtitle?: string }} [sectionsContent.partners] - Partners section texts.
 * @param {{ label?: string, titleHtml?: string }} [sectionsContent.testimonials] - Testimonials texts; `titleHtml` is injected as HTML.
 * @param {{ title?: string, subtitle?: string }} [sectionsContent.team] - Team section texts.
 * @param {{ title?: string, text?: string, buttonText?: string }} [sectionsContent.join] - Join section texts and CTA label.
 * @param {{ title?: string, text?: string }} [sectionsContent.contact] - Contact section texts.
 * @param {Document} [doc=document] - Document to query and update (useful for testing or shadow DOM contexts).
 */
function applySectionTexts(
  { partners = {}, testimonials = {}, team = {}, join = {}, contact = {} } = {},
  doc = document
) {
  const fields = [
    { el: doc.getElementById('partners-title'), value: partners.title },
    { el: doc.getElementById('partners-subtitle'), value: partners.subtitle },
    { el: doc.getElementById('testimonials-label'), value: testimonials.label },
    {
      el: doc.getElementById('testimonials-title'),
      value: testimonials.titleHtml,
      mode: 'html'
    },
    { el: doc.getElementById('team-title'), value: team.title },
    { el: doc.getElementById('team-subtitle'), value: team.subtitle },
    { el: doc.getElementById('join-title'), value: join.title },
    { el: doc.getElementById('join-text'), value: join.text },
    { el: doc.getElementById('join-button'), value: join.buttonText },
    { el: doc.getElementById('contact-title'), value: contact.title },
    { el: doc.getElementById('contact-text'), value: contact.text }
  ];

  fields.forEach(({ el, value, mode }) => {
    if (!el || value === undefined || value === null) return;
    if (mode === 'html') {
      el.innerHTML = value;
      return;
    }
    el.textContent = value;
  });
}

/**
 * Populate the page DOM with the provided site content.
 *
 * Populates or updates top-level page sections: toggles section visibility, fills navigation, injects hero content and floating items, renders about (mission/vision/values), statistics, partner logos, and testimonials. If testimonial controls and dots exist, initializes the testimonial carousel.
 *
 * @param {object} [content={}] - Site content object. Expected shape includes optional properties: `sections` (visibility map), `navigation` (array of {label, target}), `sectionsContent` (titles/texts for sections), `hero`, `about`, `statistics`, `partners`, and `testimonials`.
 * @param {Document} [doc=document] - Document object to operate on (allows using a test or shadow document).
 */
function applySiteContent(content = {}, doc = document) {
  const heroCollage = doc.getElementById('hero-collage');
  const navList = doc.getElementById('nav-list');
  const aboutCards = doc.getElementById('mvv-cards');
  const statsContainer = doc.getElementById('stats-container');
  const partnersTrack = doc.getElementById('partners-track');
  const testimonialsTrack = doc.getElementById('testimonials-track');
  const testimonialDots = doc.getElementById('testimonial-dots');
  const heroCta = doc.getElementById('hero-cta');
  const prevTestimonial = doc.getElementById('prev-testimonial');
  const nextTestimonial = doc.getElementById('next-testimonial');

  applySectionVisibility(content.sections, doc);
  populateNavigation(navList, content.navigation);
  applySectionTexts(content.sectionsContent, doc);
  applyHeroContent(heroCollage, heroCta, content.hero);
  applyAboutContent(aboutCards, content.about);
  populateStatistics(statsContainer, content.statistics);
  applyPartners(partnersTrack, content.partners);
  applyTestimonials(testimonialsTrack, testimonialDots, content.testimonials);
  if (testimonialsTrack && testimonialDots) {
    initTestimonialsCarousel(
      testimonialsTrack,
      testimonialDots,
      prevTestimonial,
      nextTestimonial
    );
  }
}

/* c8 ignore start */
/**
 * Load the site's content JSON using fetch.
 * @param {Location} [locationLike=globalScope?.location] - Optional base Location to resolve "content/site-content.json"; when omitted the global location is used.
 * @returns {any} The parsed JSON content object.
 * @throws {Error} If no base URL is available to resolve the content URL.
 * @throws {Error} If the fetch response has a non-OK HTTP status.
 */
function fetchSiteContentViaFetch(locationLike = globalScope?.location) {
  const hasLocation = !!locationLike;
  const isAboutProtocol =
    hasLocation && typeof locationLike?.href === 'string'
      ? locationLike.href.startsWith('about:')
      : false;
  if (!hasLocation || isAboutProtocol) {
    return Promise.reject(new Error('No base URL to resolve content JSON'));
  }
  const url = new URL('content/site-content.json', locationLike.href).href;
  return fetch(url, { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return response.json();
  });
}

/**
 * Load and parse content/site-content.json using XMLHttpRequest (intended for file:// usage).
 * @returns {Promise<any>} The parsed JSON content from content/site-content.json. Rejects if the request fails or the response cannot be parsed.
 */
function fetchSiteContentViaXHR() {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', 'content/site-content.json', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error_) {
            reject(error_);
          }
        } else {
          reject(new Error(`XHR status ${xhr.status}`));
        }
      };
      xhr.onerror = reject;
      xhr.send(null);
    } catch (error_) {
      reject(error_);
    }
  });
}

/**
 * Attempts to load remote site content and applies the provided fallback if loading fails.
 *
 * Chooses the loader based on protocol: uses the XHR loader when the resolved protocol is "file:", otherwise uses the fetch loader. On success calls the apply function with the loaded content; on failure calls the apply function with the fallback content if one is provided.
 *
 * @param {object} [defaultContent=fallbackContent] - Fallback content to apply when remote loading fails.
 * @param {Object} [options] - Optional overrides.
 * @param {Function} [options.fetchFn] - Function that returns a promise resolving to remote content (used for non-file protocols).
 * @param {Function} [options.xhrFn] - Function that returns a promise resolving to remote content (used for file protocol).
 * @param {Function} [options.applyFn] - Function invoked with content to render/apply.
 * @param {string} [options.protocol] - Optional protocol string to force loader selection (e.g., "file:"), otherwise resolved from global location.
 * @returns {Promise<void>} Promise that resolves after the content (remote or fallback) has been applied.
function loadSiteContent(
  defaultContent = fallbackContent,
  {
    fetchFn = fetchSiteContentViaFetch,
    xhrFn = fetchSiteContentViaXHR,
    applyFn = applySiteContent,
    protocol
  } = {}
) {
  const contentToApply = defaultContent || fallbackContent;
  const resolvedProtocol = protocol || globalScope?.location?.protocol || '';
  const isFileProtocol = resolvedProtocol === 'file:';
  const loader = isFileProtocol ? xhrFn : fetchFn;

  return loader()
    .then(applyFn)
    .catch((error_) => {
      console.warn(
        'No fue posible cargar content/site-content.json. Usando contenido por defecto.',
        error_
      );
      if (globalScope?.location?.protocol === 'file:') {
        console.info(
          'Levanta la web con un servidor local para cargar el JSON dinámicamente.'
        );
      }
      if (contentToApply) applyFn(contentToApply);
    });
}

/**
 * Update the element with id "current-year" to the current calendar year.
 * @param {Document} [doc=document] - Document to query for the target element; defaults to the global `document`.
 */
function setCurrentYear(doc = document) {
  const yearEl = doc.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Enables reveal-on-scroll animations by observing elements and adding the `visible` class when they enter the viewport.
 *
 * Observes elements with the classes `.fade-in`, `.fade-in-left`, `.fade-in-right`, and `.fade-up`. When an observed element becomes visible, the `visible` class is added and the element is unobserved. If `ObserverCtor` is `null`, the function does nothing.
 *
 * @param {typeof IntersectionObserver|null} [ObserverCtor] - IntersectionObserver constructor to use; pass `null` to disable observer-based reveals.
 * @param {Document} [doc=document] - Document root used to query and observe elements.
 */
function initObservers(
  ObserverCtor = typeof IntersectionObserver === 'undefined'
    ? null
    : IntersectionObserver,
  doc = document
) {
  /* c8 ignore next */
  if (!ObserverCtor) return;
  const options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new ObserverCtor((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  doc
    .querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-up')
    .forEach((element) => observer.observe(element));
}

/**
 * Animate numeric stat elements inside a container by counting from 0 to each element's `data-target`.
 *
 * When present, each `.stat-number` element's `data-target` defines the final value and `data-prefix` is prepended.
 * If a `.stat-value` child exists it is updated; otherwise the `.stat-number` element itself is updated.
 * If IntersectionObserver is available, animation is deferred until the container is approximately 20% visible; otherwise values are rendered immediately.
 * @param {HTMLElement} container - The element containing `.stat-number` elements to animate.
 */
function animateStats(container) {
  const stats = container.querySelectorAll('.stat-number');
  if (!stats.length) return;

  let started = false;
  const startAnimation = () => {
    if (started) return;
    started = true;
    stats.forEach((stat) => {
      const target = Number(stat.dataset.target || 0);
      const prefix = stat.dataset.prefix || '';
      const valueEl = stat.querySelector('.stat-value') || stat;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));

      const tick = () => {
        current += step;
        if (current >= target) {
          valueEl.textContent = `${prefix}${target}`;
          return;
        }
        valueEl.textContent = `${prefix}${Math.floor(current)}`;
        requestAnimationFrame(tick);
      };

      tick();
    });
  };

  startAnimation();
  if (typeof IntersectionObserver === 'undefined') {
    stats.forEach((stat) => {
      const prefix = stat.dataset.prefix || '';
      stat.textContent = `${prefix}${stat.dataset.target || '0'}`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(container);
}
/* c8 ignore stop */

/**
 * Initialize site content, reveal-on-scroll observers, and trigger remote content loading when appropriate.
 *
 * Sets the current year in the page, registers IntersectionObservers for reveal animations,
 * applies the provided content immediately (if any), and — unless running under Vitest or
 * when the environment uses the `about:` protocol — attempts to load and apply remote site content.
 *
 * @param {object} [content=fallbackContent] - Optional content object to apply immediately and use as the fallback when loading remote content.
 */
function initContent(content = fallbackContent) {
  const isVitest = Boolean(
    globalScope?.__VITEST__ || globalThis?.process?.env?.VITEST
  );

  setCurrentYear();
  initObservers();
  if (content) applySiteContent(content);

  if (
    globalScope?.location &&
    globalScope.location.protocol !== 'about:' &&
    !isVitest
  ) {
    loadSiteContent(content);
  }
}
/* c8 ignore stop */

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initContent());
  } else {
    initContent();
  }
}

export {
  applyAboutContent,
  applyHeroContent,
  applyHeroFloatingItems,
  applyPartners,
  applySectionTexts,
  applySectionVisibility,
  applySiteContent,
  applyTestimonials,
  drawWordCloud,
  secureRandomFloat,
  fetchSiteContentViaFetch,
  fetchSiteContentViaXHR,
  initContent,
  initObservers,
  loadSiteContent,
  populateNavigation,
  populateStatistics,
  setCurrentYear,
  setSectionVisibility
};