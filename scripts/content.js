import fallbackContent from '../content/site-content.json';

const globalScope =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : null;

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

function setSectionVisibility(selector, visible, doc = document) {
  if (!selector) return;
  doc.querySelectorAll(selector).forEach((el) => {
    el.classList.toggle('section-hidden', !visible);
  });
}

function applySectionVisibility(sections = {}, doc = document) {
  Object.entries(sectionsSelector).forEach(([key, selector]) => {
    const isVisible = Object.hasOwn(sections, key) ? !!sections[key] : true;
    setSectionVisibility(selector, isVisible, doc);
  });
}

function populateNavigation(list, items = []) {
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

function populateStatistics(container, stats = []) {
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
      left = Math.random() * 85;
      top = Math.random() * 85;

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
      return palette[Math.floor(Math.random() * palette.length)];
    },
    rotateRatio: 0,
    backgroundColor: 'transparent',
    shape: 'circle',
    ellipticity: 1
  });
}

function applyHeroFloatingItems(heroCollage, items = []) {
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

function applyHeroContent(heroCollage, ctaButton, heroContent) {
  if (!heroContent) return;

  applyHeroFloatingItems(heroCollage, heroContent.floatingItems);
  if (ctaButton && heroContent.ctaText) {
    ctaButton.textContent = heroContent.ctaText;
    if (heroContent.ctaLink) ctaButton.href = heroContent.ctaLink;
  }
}

function applyAboutContent(container, about = {}) {
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

function applyPartners(container, partners = []) {
  if (!container || !partners.length) return;
  container.innerHTML = '';
  partners.forEach((partner) => {
    const div = document.createElement('div');
    div.className = 'partner-logo';
    div.innerHTML = `<img src="${partner.logo}" alt="${partner.name}" loading="lazy" width="180" height="100">`;
    container.appendChild(div);
  });
}

function applyTestimonials(track, dotsContainer, testimonials = []) {
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

function applySectionTexts(
  { partners = {}, testimonials = {}, team = {}, join = {}, contact = {} } = {},
  doc = document
) {
  const partnersTitle = doc.getElementById('partners-title');
  const partnersSubtitle = doc.getElementById('partners-subtitle');
  const testimonialsLabel = doc.getElementById('testimonials-label');
  const testimonialsTitle = doc.getElementById('testimonials-title');
  const teamTitle = doc.getElementById('team-title');
  const teamSubtitle = doc.getElementById('team-subtitle');
  const joinTitle = doc.getElementById('join-title');
  const joinText = doc.getElementById('join-text');
  const joinButton = doc.getElementById('join-button');
  const contactTitle = doc.getElementById('contact-title');
  const contactText = doc.getElementById('contact-text');

  if (partnersTitle && partners.title)
    partnersTitle.textContent = partners.title;
  if (partnersSubtitle && partners.subtitle)
    partnersSubtitle.textContent = partners.subtitle;
  if (testimonialsLabel && testimonials.label)
    testimonialsLabel.textContent = testimonials.label;
  if (testimonialsTitle && testimonials.titleHtml)
    testimonialsTitle.innerHTML = testimonials.titleHtml;
  if (teamTitle && team.title) teamTitle.textContent = team.title;
  if (teamSubtitle && team.subtitle) teamSubtitle.textContent = team.subtitle;
  if (joinTitle && join.title) joinTitle.textContent = join.title;
  if (joinText && join.text) joinText.textContent = join.text;
  if (joinButton && join.buttonText) joinButton.textContent = join.buttonText;
  if (contactTitle && contact.title) contactTitle.textContent = contact.title;
  if (contactText && contact.text) contactText.textContent = contact.text;
}

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

function fetchSiteContentViaFetch() {
  const hasLocation = !!globalScope?.location;
  const isAboutProtocol =
    hasLocation && typeof globalScope.location.href === 'string'
      ? globalScope.location.href.startsWith('about:')
      : false;
  if (!hasLocation || isAboutProtocol) {
    return Promise.reject(new Error('No base URL to resolve content JSON'));
  }
  const url = new URL('content/site-content.json', globalScope.location.href)
    .href;
  return fetch(url, { cache: 'no-store' }).then((response) => {
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return response.json();
  });
}

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

function setCurrentYear(doc = document) {
  const yearEl = doc.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initObservers(
  ObserverCtor = typeof IntersectionObserver !== 'undefined'
    ? IntersectionObserver
    : null,
  doc = document
) {
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

function initContent(content = fallbackContent) {
  const isVitest =
    (globalScope && globalScope.__VITEST__) ||
    (typeof globalThis !== 'undefined' && globalThis.process?.env?.VITEST);

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
