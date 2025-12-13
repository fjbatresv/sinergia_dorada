import fallbackContent from '../content/site-content.json';

const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;

function secureRandomFloat() {
  const crypto = globalScope?.crypto;
  if (crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff;
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
 * Alterna visibilidad de secciones mediante clase CSS.
 * @param {string} selector - Selector CSS de la sección.
 * @param {boolean} visible - Si la sección debe mostrarse.
 * @param {Document} [doc=document]
 */
function setSectionVisibility(selector, visible, doc = document) {
  /* c8 ignore next */
  if (!selector) return;
  doc.querySelectorAll(selector).forEach((el) => {
    el.classList.toggle('section-hidden', !visible);
  });
}

/**
 * Aplica configuración de visibilidad a todas las secciones conocidas.
 * @param {Record<string, boolean>} [sections={}]
 * @param {Document} [doc=document]
 */
function applySectionVisibility(sections = {}, doc = document) {
  Object.entries(sectionsSelector).forEach(([key, selector]) => {
    const isVisible = Object.hasOwn(sections, key) ? !!sections[key] : true;
    setSectionVisibility(selector, isVisible, doc);
  });
}

/**
 * Construye la navegación principal desde un array de items.
 * @param {HTMLElement|null} list
 * @param {Array<{label:string,target:string}>} [items=[]]
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
 * Renderiza las tarjetas de estadísticas con animación.
 * @param {HTMLElement|null} container
 * @param {Array<{label:string,value:number,plus?:boolean}>} [stats=[]]
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

function ensureArray(list) {
  return Array.isArray(list) && list.length ? list : [];
}

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
 * Dibuja una nube de palabras dentro del canvas indicado.
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement} container
 * @param {Array} words - Lista de pares [palabra, peso].
 * @param {Array} fallback - Lista a usar si no hay palabras.
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
 * Inyecta y posiciona ítems flotantes en el hero.
 * @param {HTMLElement|null} heroCollage
 * @param {Array} [items=[]]
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
 * Pinta CTA y collage del hero.
 * @param {HTMLElement|null} heroCollage
 * @param {HTMLElement|null} ctaButton
 * @param {object} heroContent
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
 * Renderiza las tarjetas de misión/visión/valores.
 * @param {HTMLElement|null} container
 * @param {object} [about={}]
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
 * Renderiza los logos de aliados.
 * @param {HTMLElement|null} container
 * @param {Array<{name:string,logo:string}>} [partners=[]]
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
 * Construye el slider de testimonios y sus dots.
 * @param {HTMLElement|null} track
 * @param {HTMLElement|null} dotsContainer
 * @param {Array} [testimonials=[]]
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

/* c8 ignore start */
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
 * Aplica textos a las secciones parametrizadas.
 * @param {object} [sectionsContent={}]
 * @param {Document} [doc=document]
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
 * Aplica todo el contenido del sitio (hero, navegación, secciones).
 * @param {object} [content={}]
 * @param {Document} [doc=document]
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
 * Descarga el JSON de contenido vía fetch.
 * @param {Location} [locationLike=globalScope?.location]
 * @returns {Promise<any>}
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
 * Descarga el JSON de contenido vía XHR (para file://).
 * @returns {Promise<any>}
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
 * Intenta cargar contenido remoto y aplica fallback en caso de error.
 * @param {object} [defaultContent=fallbackContent]
 * @param {object} options
 * @returns {Promise<void>}
 */
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
 * Setea el año actual en el elemento correspondiente.
 * @param {Document} [doc=document]
 */
function setCurrentYear(doc = document) {
  const yearEl = doc.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Activa las animaciones de aparición con IntersectionObserver.
 * @param {typeof IntersectionObserver|null} [ObserverCtor]
 * @param {Document} [doc=document]
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
 * Inicializa el contenido del sitio y los observers.
 * @param {object} [content=fallbackContent]
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
