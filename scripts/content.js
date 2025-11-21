const sectionSelectors = {
  hero: '#inicio',
  about: '#nosotros',
  statistics: '.statistics',
  partners: '.partners',
  testimonials: '.testimonials',
  team: '#equipo',
  join: '.join-us',
  contact: '#contacto'
};

export function setSectionVisibility(selector, isVisible, doc = document) {
  if (!selector) return;
  doc.querySelectorAll(selector).forEach((el) => {
    el.classList.toggle('section-hidden', !isVisible);
  });
}

export function applySectionVisibility(sectionConfig = {}, doc = document) {
  Object.entries(sectionSelectors).forEach(([key, selector]) => {
    const isVisible = Object.prototype.hasOwnProperty.call(sectionConfig, key)
      ? !!sectionConfig[key]
      : true;
    setSectionVisibility(selector, isVisible, doc);
  });
}

export function populateNavigation(navList, items = []) {
  if (!navList || !Array.isArray(items) || items.length === 0) return;
  navList.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = item.label || '';
    link.href = item.target || '#';
    link.classList.add('nav-link');
    li.appendChild(link);
    navList.appendChild(li);
  });
}

export function populateStatistics(container, stats = []) {
  if (!container || !Array.isArray(stats) || stats.length === 0) return;
  container.innerHTML = '';
  stats.forEach((stat) => {
    const item = document.createElement('div');
    item.className = 'stat-item fade-up visible';
    const needsPlus =
      stat.plus === true ||
      (typeof stat.label === 'string' &&
        stat.label.toLowerCase().includes('personas impactadas'));

    const number = document.createElement('div');
    number.className = 'stat-number';
    number.dataset.target = stat.value || 0;
    number.dataset.prefix = needsPlus ? '+' : '';
    number.innerHTML = `<span class="stat-value">${needsPlus ? '+' : ''}${
      stat.value ?? 0
    }</span>`;

    const label = document.createElement('p');
    label.className = 'stat-label';
    label.textContent = stat.label || '';

    item.appendChild(number);
    item.appendChild(label);
    container.appendChild(item);
  });
  startStatsCounter(container);
}

function sanitizeWordCloud(words) {
  return Array.isArray(words) && words.length ? words : [];
}

function randomizeFloatingItems(container, selector = '.floating-item') {
  const items = container.querySelectorAll(selector);
  if (!items.length) return;
  const placed = [];
  const centerX = 50;
  const centerY = 50;
  const safeRadius = 20;

  items.forEach((item) => {
    let attempts = 0;
    let top = 0;
    let left = 0;
    let valid = false;
    while (!valid && attempts < 100) {
      left = Math.random() * 85;
      top = Math.random() * 85;
      const distCenter = Math.hypot(left - centerX, top - centerY);
      if (distCenter < safeRadius) {
        attempts++;
        continue;
      }
      let tooClose = false;
      for (const pos of placed) {
        const dist = Math.hypot(left - pos.left, top - pos.top);
        if (dist < 10) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) valid = true;
      attempts++;
    }
    item.style.left = `${left}%`;
    item.style.top = `${top}%`;
    placed.push({ left, top });
  });
}

export function drawWordCloud(
  canvas,
  container,
  wordCloudWords,
  defaultWordCloudWords
) {
  if (!canvas || !container) return;
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  if (canvas.width === 0) return;
  if (typeof window.WordCloud !== 'function') return;

  window.WordCloud(canvas, {
    list: sanitizeWordCloud(wordCloudWords).length
      ? wordCloudWords
      : defaultWordCloudWords,
    gridSize: 8,
    weightFactor(size) {
      return (size / 50) * (canvas.width / 10);
    },
    fontFamily: '"Poppins", sans-serif',
    color() {
      const colors = ['#D4AF37', '#C5A028', '#B08D1E', '#333333', '#555555'];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    rotateRatio: 0,
    backgroundColor: 'transparent',
    shape: 'circle',
    ellipticity: 1
  });
}

export function applyHeroFloatingItems(heroCollage, items = []) {
  if (!heroCollage) return;
  let floatingLayer = heroCollage.querySelector('.floating-items');
  if (!floatingLayer) {
    floatingLayer = document.createElement('div');
    floatingLayer.className = 'floating-items';
    heroCollage.prepend(floatingLayer);
  }
  floatingLayer.innerHTML = '';
  const sanitized = Array.isArray(items) ? items : [];
  sanitized.forEach((item, index) => {
    const typeClass = item.type ? ` floating-${item.type}` : '';
    const el = document.createElement('div');
    el.className = `floating-item floating-dog${typeClass} fade-in delay-${
      (index % 5) + 1
    }`;
    el.innerHTML = `<img src="${item.image}" alt="${item.alt || ''}" loading="lazy" width="320" height="320" decoding="async">`;
    floatingLayer.appendChild(el);
  });
  randomizeFloatingItems(floatingLayer, '.floating-item');
}

export function applyHeroContent(heroCollage, heroCTAButton, hero) {
  if (!hero) return;
  applyHeroFloatingItems(heroCollage, hero.floatingItems);
  if (heroCTAButton && hero.ctaText) {
    heroCTAButton.textContent = hero.ctaText;
    if (hero.ctaLink) heroCTAButton.href = hero.ctaLink;
  }
}

export function applyAboutContent(mvvContainer, about = {}) {
  if (!mvvContainer || !about) return;
  mvvContainer.innerHTML = '';
  const tabs = [
    { key: 'mission', label: 'Misión', text: about.mission },
    { key: 'vision', label: 'Visión', text: about.vision },
    { key: 'values', label: 'Valores', text: about.values }
  ];
  tabs.forEach((tab, idx) => {
    const card = document.createElement('div');
    card.className = `mvv-card ${idx === 0 ? 'active' : ''}`;
    card.dataset.tab = tab.key;
    card.innerHTML = `
      <h3>${tab.label}</h3>
      <p>${Array.isArray(tab.text) ? tab.text.join(', ') : tab.text || ''}</p>
    `;
    mvvContainer.appendChild(card);
  });
}

export function applyPartners(partnersTrack, partners = []) {
  if (!partnersTrack || !partners.length) return;
  partnersTrack.innerHTML = '';
  partners.forEach((partner) => {
    const logo = document.createElement('div');
    logo.className = 'partner-logo';
    logo.innerHTML = `<img src="${partner.logo}" alt="${partner.name}" loading="lazy" width="180" height="100">`;
    partnersTrack.appendChild(logo);
  });
}

export function applyTestimonials(track, dotsContainer, testimonials = []) {
  if (!track || !Array.isArray(testimonials) || testimonials.length === 0)
    return;
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  testimonials.forEach((testimonial, idx) => {
    const card = document.createElement('div');
    card.className = `testimonial-card ${idx === 0 ? 'featured' : ''}`;
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
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dotsContainer.appendChild(dot);
  });
}

function initTestimonialsCarousel(track, dotsContainer, prevBtn, nextBtn) {
  const cards = Array.from(track.children);
  if (!cards.length) return;

  track.style.display = 'flex';
  track.style.gap = '24px';
  track.style.overflow = 'hidden';
  track.style.position = 'relative';

  const total = cards.length;
  let index = 0;
  let autoId;

  const getGap = () => {
    const cs = getComputedStyle(track);
    return Number.parseFloat(cs.columnGap || cs.gap || '0') || 0;
  };

  const update = (smooth = true) => {
    const gap = getGap();
    const cardWidth = cards[0].getBoundingClientRect().width;
    const offset =
      (cardWidth + gap) * index - (track.clientWidth - cardWidth) / 2;

    cards.forEach((card, idx) =>
      card.classList.toggle('featured', idx === index)
    );
    dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    track.style.transition = smooth ? 'transform 0.6s ease' : 'none';
    track.style.transform = `translateX(-${offset}px)`;
  };

  const next = () => {
    index = (index + 1) % total;
    update();
  };
  const prev = () => {
    index = (index - 1 + total) % total;
    update();
  };

  const startAuto = () => {
    clearInterval(autoId);
    autoId = setInterval(next, 5000);
  };

  startAuto();
  update(false);
  track.addEventListener('mouseenter', () => clearInterval(autoId));
  track.addEventListener('mouseleave', startAuto);

  dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      index = idx;
      update();
      startAuto();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      startAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      startAuto();
    });
  }
}

export function applySectionTexts(
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

export function applySiteContent(content = {}, doc = document) {
  const heroCollage = doc.getElementById('hero-collage');
  const navList = doc.getElementById('nav-list');
  const mvvContainer = doc.getElementById('mvv-cards');
  const statsContainer = doc.getElementById('stats-container');
  const partnersTrack = doc.getElementById('partners-track');
  const testimonialsTrack = doc.getElementById('testimonials-track');
  const testimonialDotsContainer = doc.getElementById('testimonial-dots');
  const heroCTAButton = doc.getElementById('hero-cta');
  const prevTestimonialBtn = doc.getElementById('prev-testimonial');
  const nextTestimonialBtn = doc.getElementById('next-testimonial');

  applySectionVisibility(content.sections, doc);
  populateNavigation(navList, content.navigation);
  applySectionTexts(content.sectionsContent, doc);
  applyHeroContent(heroCollage, heroCTAButton, content.hero);
  applyAboutContent(mvvContainer, content.about);
  populateStatistics(statsContainer, content.statistics);
  applyPartners(partnersTrack, content.partners);
  applyTestimonials(
    testimonialsTrack,
    testimonialDotsContainer,
    content.testimonials
  );
  if (testimonialsTrack && testimonialDotsContainer) {
    initTestimonialsCarousel(
      testimonialsTrack,
      testimonialDotsContainer,
      prevTestimonialBtn,
      nextTestimonialBtn
    );
  }
}

export function fetchSiteContentViaFetch() {
  const base =
    typeof window !== 'undefined' &&
    window.location &&
    !window.location.href.startsWith('about:')
      ? window.location.href
      : null;

  if (!base) {
    return Promise.reject(new Error('No base URL to resolve content JSON'));
  }

  const url = new URL('content/site-content.json', base).href;

  return fetch(url, { cache: 'no-store' }).then((response) => {
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    return response.json();
  });
}

export function fetchSiteContentViaXHR() {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', 'content/site-content.json', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (parseError) {
              reject(parseError);
            }
          } else {
            reject(new Error(`XHR status ${xhr.status}`));
          }
        }
      };
      xhr.onerror = reject;
      xhr.send(null);
    } catch (xhrError) {
      reject(xhrError);
    }
  });
}

export function loadSiteContent(
  defaultSiteContent,
  {
    fetchFn = fetchSiteContentViaFetch,
    xhrFn = fetchSiteContentViaXHR,
    applyFn = applySiteContent,
    protocol
  } = {}
) {
  const resolvedProtocol = protocol || window.location.protocol;
  const loader = resolvedProtocol === 'file:' ? xhrFn() : fetchFn();

  return loader.then(applyFn).catch((error) => {
    console.warn(
      'No fue posible cargar content/site-content.json. Usando contenido por defecto.',
      error
    );
    if (window.location.protocol === 'file:') {
      console.info(
        'Levanta la web con un servidor local para cargar el JSON dinámicamente.'
      );
    }
    applyFn(defaultSiteContent);
  });
}

export function setCurrentYear(doc = document) {
  const yearEl = doc.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

export function initObservers(
  ObserverImpl = typeof IntersectionObserver !== 'undefined'
    ? IntersectionObserver
    : null,
  doc = document
) {
  if (!ObserverImpl) return;
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new ObserverImpl((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = doc.querySelectorAll(
    '.fade-in, .fade-in-left, .fade-in-right, .fade-up'
  );
  animatedElements.forEach((el) => observer.observe(el));
}

function startStatsCounter(container) {
  const numbers = container.querySelectorAll('.stat-number');
  if (!numbers.length) return;
  let hasRun = false;
  const animate = () => {
    if (hasRun) return;
    hasRun = true;
    numbers.forEach((num) => {
      const target = Number(num.dataset.target || 0);
      const prefix = num.dataset.prefix || '';
      const valueSpan = num.querySelector('.stat-value') || num;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const tick = () => {
        current += step;
        if (current >= target) {
          valueSpan.textContent = `${prefix}${target}`;
          return;
        }
        valueSpan.textContent = `${prefix}${Math.floor(current)}`;
        requestAnimationFrame(tick);
      };
      tick();
    });
  };
  // trigger once immediately
  animate();

  if (typeof IntersectionObserver === 'undefined') {
    numbers.forEach((num) => {
      const prefix = num.dataset.prefix || '';
      num.textContent = `${prefix}${num.dataset.target || '0'}`;
    });
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );
  obs.observe(container);
}

export function initContent(defaults) {
  const isVitestEnv =
    (typeof window !== 'undefined' && window.__VITEST__) ||
    (typeof globalThis !== 'undefined' && globalThis.process?.env?.VITEST);
  setCurrentYear();
  initObservers();
  if (defaults) {
    applySiteContent(defaults);
  }
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.protocol !== 'about:' &&
    !isVitestEnv
  ) {
    loadSiteContent(defaults || {});
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initContent({}));
  } else {
    initContent({});
  }
}
