document.addEventListener('DOMContentLoaded', () => {
  const heroCollage = document.getElementById('hero-collage');
  const navList = document.getElementById('nav-list');
  const mvvContainer = document.getElementById('mvv-cards');
  const statsContainer = document.getElementById('stats-container');
  const partnersTrack = document.getElementById('partners-track');
  const testimonialsTrack = document.getElementById('testimonials-track');
  const testimonialDotsContainer = document.getElementById('testimonial-dots');
  const prevTestimonialBtn = document.getElementById('prev-testimonial');
  const nextTestimonialBtn = document.getElementById('next-testimonial');
  const progressBar = document.getElementById('testimonial-progress-bar');
  const heroCTAButton = document.getElementById('hero-cta');
  const partnersTitle = document.getElementById('partners-title');
  const partnersSubtitle = document.getElementById('partners-subtitle');
  const testimonialsLabel = document.getElementById('testimonials-label');
  const testimonialsTitle = document.getElementById('testimonials-title');
  const teamTitle = document.getElementById('team-title');
  const teamSubtitle = document.getElementById('team-subtitle');
  const joinTitle = document.getElementById('join-title');
  const joinText = document.getElementById('join-text');
  const joinButton = document.getElementById('join-button');
  const contactTitle = document.getElementById('contact-title');
  const contactText = document.getElementById('contact-text');

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    '.fade-in, .fade-in-left, .fade-in-right, .fade-up'
  );
  animatedElements.forEach((el) => observer.observe(el));

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

  const defaultHeroItems = [
    { image: 'assets/dogs/brie.png', alt: 'Brie', type: 'dog' },
    { image: 'assets/dogs/duke.png', alt: 'Duke', type: 'dog' },
    { image: 'assets/dogs/fontina.png', alt: 'Fontina', type: 'dog' },
    { image: 'assets/dogs/gaia.png', alt: 'Gaia', type: 'dog' },
    { image: 'assets/dogs/ginger.png', alt: 'Ginger', type: 'dog' },
    { image: 'assets/dogs/lena.png', alt: 'Lena', type: 'dog' },
    { image: 'assets/dogs/mohana.png', alt: 'Mohana', type: 'dog' },
    { image: 'assets/dogs/pinata.png', alt: 'Piñata', type: 'dog' },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-16 at 11.01.16.jpeg',
      alt: 'Visita 16 de septiembre',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-25 at 19.16.08.jpeg',
      alt: 'Visita 25 de septiembre',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-29 at 12.26.44.jpeg',
      alt: 'Visita 29 de septiembre',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-29 at 12.26.46.jpeg',
      alt: 'Visita 29 de septiembre (2)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-29 at 14.18.45.jpeg',
      alt: 'Visita 29 de septiembre (3)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-29 at 18.00.27.jpeg',
      alt: 'Visita 29 de septiembre (4)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-09-29 at 18.00.35.jpeg',
      alt: 'Visita 29 de septiembre (5)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-10-08 at 19.31.24.jpeg',
      alt: 'Visita 8 de octubre',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-10-08 at 20.22.52.jpeg',
      alt: 'Visita 8 de octubre (2)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-10-08 at 20.28.00.jpeg',
      alt: 'Visita 8 de octubre (3)',
      type: 'activity'
    },
    {
      image: 'assets/activities/WhatsApp Image 2025-10-08 at 20.58.03.jpeg',
      alt: 'Visita 8 de octubre (4)',
      type: 'activity'
    }
  ];

  const defaultWordCloudWords = [
    ['Amor incondicional', 50],
    ['Empatía', 45],
    ['Servicio', 40],
    ['Alegría', 35],
    ['Respeto', 45],
    ['Conexión humano-animal', 38],
    ['Confianza', 35],
    ['Bienestar animal', 40],
    ['Inclusión', 35]
  ];
  let wordCloudWords = [...defaultWordCloudWords];
  let testimonialCards = [];
  let testimonialDots = [];
  let totalCards = 0;
  let currentIndex = 0;
  let autoRotateInterval;
  let isTransitioning = false;
  let statsObserver;
  let statsAnimated = false;
  let currentTab = 'mission';
  const defaultSiteContent = {
    sections: {
      hero: true,
      about: true,
      statistics: true,
      partners: true,
      testimonials: true,
      team: true,
      join: true,
      contact: true
    },
    navigation: [
      { label: 'Inicio', target: '#inicio' },
      { label: 'Nosotros', target: '#nosotros' },
      { label: 'El Equipo', target: '#equipo' },
      { label: 'Contacto', target: '#contacto' }
    ],
    hero: {
      ctaText: 'Contáctanos',
      ctaLink: '#contacto',
      floatingItems: defaultHeroItems
    },
    about: {
      mission:
        'Creemos en el poder curativo de los animales. Nuestro equipo está formado por voluntarios apasionados y sus perros entrenados para brindar apoyo emocional y terapia a hospitales, centros de rehabilitación y entornos corporativos.',
      vision:
        'Ser la organización referente en Guatemala en terapia asistida por perros, expandiendo nuestro alcance para tocar más vidas y fomentar una cultura de empatía y bienestar a través del vínculo humano-animal.',
      values: [
        'Amor incondicional',
        'Empatía',
        'Servicio',
        'Alegría',
        'Respeto',
        'Confianza'
      ],
      wordCloud: [
        ['Amor incondicional', 50],
        ['Empatía', 45],
        ['Servicio', 40],
        ['Alegría', 35],
        ['Respeto', 45],
        ['Conexión humano-animal', 38],
        ['Confianza', 35],
        ['Bienestar animal', 40],
        ['Inclusión', 35]
      ]
    },
    statistics: [
      { label: 'Visitas Completadas', value: 95 },
      { label: 'Personas Impactadas', value: 500 },
      { label: 'Instituciones Aliadas', value: 25 }
    ],
    partners: [
      { name: 'Partner 1', logo: 'assets/partners/logo1.png' },
      { name: 'Partner 2', logo: 'assets/partners/logo2.png' },
      { name: 'Partner 3', logo: 'assets/partners/logo3.png' },
      { name: 'Partner 4', logo: 'assets/partners/logo4.png' },
      { name: 'Partner 5', logo: 'assets/partners/logo5.png' },
      { name: 'Partner 6', logo: 'assets/partners/logo6.png' },
      { name: 'Partner 7', logo: 'assets/partners/logo7.png' },
      { name: 'Partner 8', logo: 'assets/partners/logo8.png' }
    ],
    testimonials: [
      {
        quote:
          'La visita de Sinergia Dorada a nuestro hospital fue increíble. Los pacientes se iluminaron al ver a los perros, y el ambiente se llenó de alegría y esperanza.',
        author: 'María González',
        role: 'Directora, Hospital San Juan',
        photo: 'assets/testimonials/person1.jpg'
      },
      {
        quote:
          'Nuestros empleados esperan con ansias las visitas de Sinergia Dorada. El estrés laboral disminuye notablemente y el ambiente de trabajo mejora.',
        author: 'Carlos Méndez',
        role: 'Gerente de RRHH, Empresa Tech',
        photo: 'assets/testimonials/person2.jpg',
        featured: true
      },
      {
        quote:
          'Los niños en nuestro centro han mostrado avances increíbles desde que comenzaron las sesiones con los perros de terapia. Es hermoso ver cómo se conectan.',
        author: 'Ana Rodríguez',
        role: 'Terapeuta, Centro Infantil',
        photo: 'assets/testimonials/person3.jpg'
      },
      {
        quote:
          'La terapia asistida con perros ha transformado la vida de muchos de nuestros pacientes. El equipo de Sinergia Dorada es excepcional y muy profesional.',
        author: 'Dr. Roberto Pérez',
        role: 'Médico, Clínica de Rehabilitación',
        photo: 'assets/testimonials/person1.jpg'
      },
      {
        quote:
          'Como institución educativa, valoramos enormemente las visitas de Sinergia Dorada. Los estudiantes aprenden sobre empatía y responsabilidad de manera práctica.',
        author: 'Lic. Patricia Morales',
        role: 'Directora, Colegio Internacional',
        photo: 'assets/testimonials/person2.jpg'
      },
      {
        quote:
          'El impacto positivo en nuestros adultos mayores es innegable. Los perros traen alegría y compañía que mejora significativamente su calidad de vida.',
        author: 'Enf. Laura Castillo',
        role: 'Coordinadora, Hogar de Ancianos',
        photo: 'assets/testimonials/person3.jpg'
      }
    ],
    sectionsContent: {
      partners: {
        title: 'Lugares que Hemos Visitado',
        subtitle: 'Instituciones y organizaciones que han confiado en nosotros'
      },
      testimonials: {
        label: 'TESTIMONIOS',
        titleHtml:
          'Historias que <span class="highlight">Inspiran</span> Nuestro Trabajo'
      },
      team: {
        title: 'Nuestro Equipo Peludo',
        subtitle: 'Conoce a los héroes de cuatro patas'
      },
      join: {
        title: 'Únete a Sinergia Dorada',
        text: '¿Tienes un perro y te gustaría ser parte de nuestro voluntariado? ¡Nos encantaría conocerte!',
        buttonText: 'Llenar Formulario',
        buttonLink: 'https://forms.gle/1CtC5LUgSz7rVSKX9'
      },
      contact: {
        title: 'Únete a la Sinergia',
        text: '¿Te gustaría que visitemos tu institución o quieres saber más sobre nosotros? ¡Síguenos en nuestras redes!'
      }
    }
  };

  /**
   * Places and staggers floating dog elements around the hero area.
   *
   * Positions each element with the `.floating-dog` class using percentage `left`/`top` values within the visible hero bounds, avoiding a centered exclusion zone and keeping elements a minimum distance apart, and assigns randomized animation delays for entrance/hover timing.
   */
  function randomizeDogs() {
    const dogs = document.querySelectorAll('.floating-dog');
    if (!dogs.length) return;
    const placedPositions = [];

    // Center exclusion zone (percentage)
    const centerX = 50;
    const centerY = 50;
    const safeRadius = 25; // % radius around center to keep clear

    dogs.forEach((dog, index) => {
      let validPosition = false;
      let attempts = 0;
      let top, left;

      while (!validPosition && attempts < 100) {
        // Generate random position (0-90% to keep within screen)
        left = Math.random() * 85;
        top = Math.random() * 85;

        // Calculate distance from center
        const distToCenter = Math.sqrt(
          Math.pow(left - centerX, 2) + Math.pow(top - centerY, 2)
        );

        // Check collision with center
        if (distToCenter < safeRadius) {
          attempts++;
          continue;
        }

        // Check collision with other dogs (simple proximity check)
        let tooClose = false;
        for (let pos of placedPositions) {
          const dist = Math.sqrt(
            Math.pow(left - pos.left, 2) + Math.pow(top - pos.top, 2)
          );
          if (dist < 10) {
            // Reduced minimum distance to 10% to fit more items
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          validPosition = true;
        }
        attempts++;
      }

      // Apply position
      dog.style.left = `${left}%`;
      dog.style.top = `${top}%`;

      // Randomize animation delays
      const floatDelay = Math.random() * 2; // 0-2s delay
      const hoverDelay = Math.random() * 2;
      dog.style.animationDelay = `${floatDelay}s, ${floatDelay + 1}s`; // Entrance delay, then hover starts

      // Store position
      placedPositions.push({ left, top });
    });
  }

  // Set current year (defensive against missing element)
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Initial placeholders
  populateNavigation(defaultSiteContent.navigation);
  applySectionTexts(defaultSiteContent.sectionsContent);
  populateHero(defaultSiteContent.hero);
  loadSiteContent();
  /**
   * Loads the site's content JSON and applies it to the page, falling back to built-in defaults on failure.
   *
   * If running from the file: protocol, attempts a file-compatible XHR fetch; otherwise uses the standard fetch path.
   * On failure it logs a warning and informative hint (when on file:) and applies the default site content.
   */
  function loadSiteContent() {
    const loader =
      window.location.protocol === 'file:'
        ? fetchSiteContentViaXHR()
        : fetchSiteContentViaFetch();

    loader.then(applySiteContent).catch((error) => {
      console.warn(
        'No fue posible cargar content/site-content.json. Usando contenido por defecto.',
        error
      );
      if (window.location.protocol === 'file:') {
        console.info(
          'Levanta la web con un servidor local para cargar el JSON dinámicamente.'
        );
      }
      applySiteContent(defaultSiteContent);
    });
  }

  /**
   * Load site content from content/site-content.json and parse it as JSON.
   * @returns {Promise<Object>} The parsed site content object.
   * @throws {Error} If the HTTP response has a non-OK status (error message includes the status code).
   */
  function fetchSiteContentViaFetch() {
    return fetch('content/site-content.json', { cache: 'no-store' }).then(
      (response) => {
        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }
        return response.json();
      }
    );
  }

  /**
   * Load and parse the site's content JSON from content/site-content.json.
   *
   * @returns {Promise<Object>} The parsed site content object. Rejection occurs for non-200 HTTP statuses, network errors, or JSON parse errors.
   */
  function fetchSiteContentViaXHR() {
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

  /**
   * Apply a site content payload to the page, updating visibility, navigation and all major sections.
   *
   * Applies section visibility flags, renders the navigation, updates section texts, and repopulates
   * the hero, about (MVV), statistics, partners, and testimonials areas from the provided content object.
   *
   * @param {Object} content - Site content payload. Expected shape includes keys: `sections` (visibility flags), `navigation` (nav items), `sectionsContent` (titles/subtitles/text for sections), `hero`, `about`, `statistics`, `partners`, and `testimonials`. Missing keys will result in their respective sections remaining unchanged or using defaults.
   */
  function applySiteContent(content = {}) {
    applySectionVisibility(content.sections);
    populateNavigation(content.navigation);
    applySectionTexts(content.sectionsContent);
    populateHero(content.hero);
    populateAbout(content.about);
    populateStatistics(content.statistics);
    populatePartners(content.partners);
    initTestimonials(content.testimonials);
  }

  /**
   * Apply visibility settings to page sections based on a key→boolean config.
   *
   * For each entry in the internal sectionSelectors map, show the matching elements
   * when the config value is truthy and hide them when falsy. Keys not present in
   * `sectionConfig` are treated as visible.
   *
   * @param {Object<string, any>} [sectionConfig={}] - Map of section keys to visibility values; truthy means visible, falsy means hidden.
   */
  function applySectionVisibility(sectionConfig = {}) {
    Object.entries(sectionSelectors).forEach(([key, selector]) => {
      const isVisible = sectionConfig.hasOwnProperty(key)
        ? !!sectionConfig[key]
        : true;
      setSectionVisibility(selector, isVisible);
    });
  }

  /**
   * Toggle visibility of elements matched by a CSS selector by adding or removing the `section-hidden` class.
   * @param {string} selector - CSS selector for target elements; if falsy, the function does nothing.
   * @param {boolean} isVisible - `true` to show matched elements (remove `section-hidden`), `false` to hide them (add `section-hidden`).
   */
  function setSectionVisibility(selector, isVisible) {
    if (!selector) return;
    document.querySelectorAll(selector).forEach((element) => {
      if (isVisible) {
        element.classList.remove('section-hidden');
      } else {
        element.classList.add('section-hidden');
      }
    });
  }

  /**
   * Populate the global navigation list element with entries built from the provided items.
   *
   * Clears any existing navigation content and appends an <li> containing an <a> for each item.
   * If the cached `navList` element is not present or `items` is empty or not an array, the function does nothing.
   *
   * @param {Array<{label?: string, target?: string}>} items - Array of navigation entries. Each entry may include:
   *   - label: visible text for the link.
   *   - target: href for the link (e.g., a URL or hash). When absent, `'#'` is used.
   */
  function populateNavigation(items = []) {
    if (!navList || !Array.isArray(items) || !items.length) return;
    navList.innerHTML = '';

    items.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = item && item.target ? item.target : '#';
      link.textContent = item && item.label ? item.label : '';
      li.appendChild(link);
      navList.appendChild(li);
    });
  }

  /**
   * Update section headings, subtitles, labels, and join/contact texts from the provided content object.
   *
   * Applies values (when present) to cached DOM nodes for: partners, testimonials, team, join, and contact sections.
   *
   * @param {Object} sectionsContent - Partial mapping of section content.
   * @param {Object} [sectionsContent.partners] - Partners section content.
   * @param {string} [sectionsContent.partners.title] - Partners section title.
   * @param {string} [sectionsContent.partners.subtitle] - Partners section subtitle.
   * @param {Object} [sectionsContent.testimonials] - Testimonials section content.
   * @param {string} [sectionsContent.testimonials.label] - Small label/eyebrow for testimonials.
   * @param {string} [sectionsContent.testimonials.title] - Plain-text testimonials title (used when `titleHtml` absent).
   * @param {string} [sectionsContent.testimonials.titleHtml] - HTML testimonials title (preferred over `title` when present).
   * @param {Object} [sectionsContent.team] - Team section content.
   * @param {string} [sectionsContent.team.title] - Team section title.
   * @param {string} [sectionsContent.team.subtitle] - Team section subtitle.
   * @param {Object} [sectionsContent.join] - Join section content.
   * @param {string} [sectionsContent.join.title] - Join section title.
   * @param {string} [sectionsContent.join.text] - Join section descriptive text.
   * @param {string} [sectionsContent.join.buttonLink] - URL for the join CTA button.
   * @param {string} [sectionsContent.join.buttonText] - Text for the join CTA button.
   * @param {Object} [sectionsContent.contact] - Contact section content.
   * @param {string} [sectionsContent.contact.title] - Contact section title.
   * @param {string} [sectionsContent.contact.text] - Contact section descriptive text.
   */
  function applySectionTexts(sectionsContent = {}) {
    const partners = sectionsContent.partners || {};
    if (partnersTitle && partners.title)
      partnersTitle.textContent = partners.title;
    if (partnersSubtitle && 'subtitle' in partners)
      partnersSubtitle.textContent = partners.subtitle || '';

    const testimonials = sectionsContent.testimonials || {};
    if (testimonialsLabel && testimonials.label)
      testimonialsLabel.textContent = testimonials.label;
    if (testimonialsTitle) {
      if (testimonials.titleHtml) {
        testimonialsTitle.innerHTML = testimonials.titleHtml;
      } else if (testimonials.title) {
        testimonialsTitle.textContent = testimonials.title;
      }
    }

    const team = sectionsContent.team || {};
    if (teamTitle && team.title) teamTitle.textContent = team.title;
    if (teamSubtitle && 'subtitle' in team)
      teamSubtitle.textContent = team.subtitle || '';

    const join = sectionsContent.join || {};
    if (joinTitle && join.title) joinTitle.textContent = join.title;
    if (joinText && 'text' in join) joinText.textContent = join.text || '';
    if (joinButton) {
      if (join.buttonLink) joinButton.href = join.buttonLink;
      if ('buttonText' in join) joinButton.textContent = join.buttonText || '';
    }

    const contact = sectionsContent.contact || {};
    if (contactTitle && contact.title) contactTitle.textContent = contact.title;
    if (contactText && 'text' in contact)
      contactText.textContent = contact.text || '';
  }

  /**
   * Update the hero section call-to-action button's label and destination from the provided configuration.
   *
   * If the CTA button element is not present in the DOM, the function does nothing.
   * @param {Object} [heroConfig] - Configuration for the hero CTA.
   * @param {string} [heroConfig.ctaText] - Text to display on the CTA button; defaults to "Contáctanos".
   * @param {string} [heroConfig.ctaLink] - URL or fragment the CTA should link to; defaults to "#contacto".
   */
  function updateHeroCTA(heroConfig) {
    if (!heroCTAButton) return;
    const text =
      heroConfig && heroConfig.ctaText ? heroConfig.ctaText : 'Contáctanos';
    const link =
      heroConfig && heroConfig.ctaLink ? heroConfig.ctaLink : '#contacto';
    heroCTAButton.textContent = text;
    heroCTAButton.href = link;
  }

  /**
   * Populate the hero collage with floating items and update the hero call-to-action.
   *
   * Iterates `heroConfig.floatingItems` (or default items) to create `.floating-dog` elements
   * (image, optional `activity` class, and any additional classes), replaces existing items
   * in the collage, and schedules position randomization.
   *
   * @param {Object} heroConfig - Configuration for the hero area.
   * @param {Array<Object>} [heroConfig.floatingItems] - Array of items to render. Each item may include:
   *   - {string} image - URL for the item's image.
   *   - {string} [alt] - Alt text for the image.
   *   - {string} [type] - If equal to `"activity"`, adds the `activity` class.
   *   - {Array<string>} [classes] - Additional CSS classes to apply to the wrapper.
   */
  function populateHero(heroConfig) {
    if (!heroCollage) return;
    updateHeroCTA(heroConfig);

    heroCollage.querySelectorAll('.floating-dog').forEach((el) => el.remove());

    const items =
      heroConfig &&
      Array.isArray(heroConfig.floatingItems) &&
      heroConfig.floatingItems.length
        ? heroConfig.floatingItems
        : defaultHeroItems;

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('floating-dog');
      if (item && item.type === 'activity') {
        wrapper.classList.add('activity');
      }

      if (item && Array.isArray(item.classes)) {
        item.classes.forEach((cls) => wrapper.classList.add(cls));
      }

      const img = document.createElement('img');
      img.src = item && item.image ? item.image : '';
      img.alt = item && item.alt ? item.alt : 'Sinergia Dorada';

      wrapper.appendChild(img);
      fragment.appendChild(wrapper);
    });

    heroCollage.appendChild(fragment);

    requestAnimationFrame(() => {
      randomizeDogs();
    });
  }

  /**
   * Render the Mission/Vision/Values (MVV) cards and configure the word cloud source.
   *
   * Uses the provided `about` content to populate the MVV container with three cards (mission, vision, values), attaches an observer to new cards for scroll animations when available, updates the internal `wordCloudWords` source with `about.wordCloud` or a default list, and triggers a redraw of the word cloud if the currently active tab is the values tab.
   *
   * @param {Object} about - Content for the MVV section.
   * @param {string} [about.mission] - Text for the Mission card.
   * @param {string} [about.vision] - Text for the Vision card.
   * @param {string[]} [about.values] - List of value labels for the Values card.
   * @param {Array} [about.wordCloud] - Words to use for the word cloud; if absent or empty, defaults are used.
   */
  function populateAbout(about) {
    if (!mvvContainer) return;

    const missionText =
      about && typeof about.mission === 'string' ? about.mission : '';
    const visionText =
      about && typeof about.vision === 'string' ? about.vision : '';
    const valuesList = about && Array.isArray(about.values) ? about.values : [];

    mvvContainer.innerHTML = '';

    const cards = [
      { title: 'Nuestra Misión', content: missionText },
      { title: 'Nuestra Visión', content: visionText },
      { title: 'Nuestros Valores', values: valuesList }
    ];

    cards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'mvv-card fade-up';

      const title = document.createElement('h3');
      title.textContent = card.title;
      cardEl.appendChild(title);

      if (card.values && card.values.length) {
        const valuesContainer = document.createElement('div');
        valuesContainer.className = 'values-list-compact';
        card.values.forEach((value) => {
          const tag = document.createElement('span');
          tag.className = 'value-tag';
          tag.textContent = value;
          valuesContainer.appendChild(tag);
        });
        cardEl.appendChild(valuesContainer);
      } else {
        const paragraph = document.createElement('p');
        paragraph.textContent = card.content || 'Contenido en preparación.';
        cardEl.appendChild(paragraph);
      }

      mvvContainer.appendChild(cardEl);
      if (observer) {
        observer.observe(cardEl);
      }
    });

    if (about && Array.isArray(about.wordCloud) && about.wordCloud.length) {
      wordCloudWords = about.wordCloud;
    } else {
      wordCloudWords = [...defaultWordCloudWords];
    }

    if (currentTab === 'values') {
      setTimeout(drawWordCloud, 0);
    }
  }

  /**
   * Render statistic tiles into the statistics container and start the animation observer for their numeric counts.
   * @param {{label?: string, value?: number}[]} stats - Array of statistic entries; each object may provide `label` (string) and `value` (number). If omitted or empty, no tiles are rendered.
   */
  function populateStatistics(stats = []) {
    if (!statsContainer) return;

    statsContainer.innerHTML = '';
    stats.forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'stat-item';

      const number = document.createElement('h3');
      number.className = 'stat-number';
      const needsPlus =
        (stat.label || '').toLowerCase().includes('personas impactadas') ||
        stat.plus === true;
      number.dataset.target = stat.value || 0;
      number.dataset.prefix = needsPlus ? '+' : '';
      number.textContent = `${needsPlus ? '+' : ''}0`;

      const label = document.createElement('p');
      label.className = 'stat-label';
      label.textContent = stat.label || '';

      item.appendChild(number);
      item.appendChild(label);
      statsContainer.appendChild(item);
    });

    setupStatisticsObserver();
  }

  /**
   * Render partner logo elements into the partners track container.
   *
   * If a non-empty list is provided, it is duplicated to allow seamless/continuous display.
   * If the partners track element is not present in the DOM, the function does nothing.
   *
   * @param {Array<Object>} partners - Array of partner descriptors (e.g., objects containing a logo source and optional link).
   */
  function populatePartners(partners = []) {
    if (!partnersTrack) return;

    partnersTrack.innerHTML = '';
    const partnersList = partners.length ? [...partners, ...partners] : [];

    partnersList.forEach((partner) => {
      partnersTrack.appendChild(createPartnerLogo(partner));
    });
  }

  /**
   * Create a DOM element representing a partner logo, optionally wrapped in an external link.
   * @param {Object} partner - Partner descriptor.
   * @param {string} partner.logo - URL of the partner logo image.
   * @param {string} [partner.name] - Accessible name for the partner; used as image alt text.
   * @param {string} [partner.url] - External URL to open when the logo is clicked; when present the logo is wrapped in a link that opens in a new tab.
   * @returns {HTMLElement} A `.partner-logo` element containing the partner image (and a link wrapper when `partner.url` is provided).
   */
  function createPartnerLogo(partner) {
    const logo = document.createElement('div');
    logo.className = 'partner-logo';

    const img = document.createElement('img');
    img.src = partner.logo;
    img.alt = partner.name || 'Aliado';

    if (partner.url) {
      logo.classList.add('clickable');
      const link = document.createElement('a');
      link.href = partner.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.classList.add('partner-link');
      link.appendChild(img);
      logo.appendChild(link);
    } else {
      logo.appendChild(img);
    }

    return logo;
  }

  /**
   * Initialize the testimonials carousel: render provided testimonials, reset to the first item, update the carousel view, and restart automatic rotation.
   * @param {Array<Object>} [testimonials=[]] - Array of testimonial objects used to render testimonial cards; if omitted or not an array, an empty list is used.
   * Notes: If the testimonials track element is not present in the DOM, the function does nothing.
   */
  function initTestimonials(testimonials = []) {
    if (!testimonialsTrack) return;

    renderTestimonials(Array.isArray(testimonials) ? testimonials : []);
    currentIndex = 0;
    updateCarousel(true);
    resetAutoRotate();
  }

  /**
   * Populate the testimonials carousel track with the provided testimonial entries.
   *
   * @param {Array<Object>} testimonials - Array of testimonial objects.
   * @param {string} testimonials[].quote - Quote text to display.
   * @param {string} testimonials[].author - Author's name.
   * @param {string} testimonials[].role - Author's role or title.
   * @param {string} testimonials[].photo - URL to the author's photo.
   * @param {boolean} [testimonials[].featured] - If true, mark this testimonial as featured.
   */
  function renderTestimonials(testimonials) {
    testimonialsTrack.innerHTML = '';

    testimonials.forEach((testimonial) => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      if (testimonial.featured) {
        card.classList.add('featured');
      }

      card.innerHTML = `
                <div class="quote-icon">
                    <i class="fas fa-quote-left"></i>
                </div>
                <p class="testimonial-text">&ldquo;${testimonial.quote}&rdquo;</p>
                <div class="testimonial-author">
                    <div>
                        <h4>${testimonial.author}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
            `;

      testimonialsTrack.appendChild(card);
    });

    testimonialCards = Array.from(testimonialsTrack.children);
    totalCards = testimonialCards.length;
    buildTestimonialDots(Math.max(totalCards - 2, 0));
  }

  /**
   * Render the testimonial navigation dots and wire their click behavior.
   *
   * Creates `count` dot elements inside the testimonial dots container, marks the first dot active,
   * updates the shared `testimonialDots` list, and attaches click handlers that switch the visible
   * testimonial and restart the auto-rotate when a dot is clicked (clicks are ignored while a
   * transition is in progress or when there are fewer than three testimonial cards).
   * @param {number} count - Number of dots to create inside the testimonial dots container.
   */
  function buildTestimonialDots(count) {
    if (!testimonialDotsContainer) return;

    testimonialDotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (i === 0) {
        dot.classList.add('active');
      }
      dot.addEventListener('click', () => {
        if (isTransitioning || totalCards < 3) return;
        currentIndex = i;
        updateCarousel();
        resetAutoRotate();
      });
      testimonialDotsContainer.appendChild(dot);
    }

    testimonialDots = Array.from(testimonialDotsContainer.children);
  }

  // --- Mission/Vision/Values Tabs Logic ---
  const tabBtns = document.querySelectorAll('.mv-tab-btn');
  const tabContents = document.querySelectorAll('.mv-tab-content');
  const tabsContainer = document.querySelector('.mv-tabs-container');
  let tabInterval;
  let progressInterval;
  let progress = 0;
  const switchTime = 8000; // 8 seconds
  const updateFreq = 100; /**
   * Activate the given MVV tab, update related UI state, and reset the tab progress.
   *
   * Updates the container's active-tab data attribute, toggles the active class on tab buttons
   * and content panels, resets per-button progress bars, and sets the internal progress counter to 0.
   * If the `values` tab is activated, schedules a word cloud redraw shortly after activation.
   *
   * @param {string} tabId - The id of the tab to activate (e.g., "mission", "vision", "values").
   */

  function switchTab(tabId) {
    currentTab = tabId;

    // Update container background via data attribute
    if (tabsContainer) {
      tabsContainer.setAttribute('data-active-tab', tabId);
    }

    // Update Buttons
    tabBtns.forEach((btn) => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
        const bar = btn.querySelector('.progress-bar');
        if (bar) bar.style.width = '0%';
      }
    });

    // Update Content
    tabContents.forEach((content) => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // If Values tab, draw wordcloud (needs to be visible to draw correctly)
    if (tabId === 'values') {
      // Small delay to ensure layout is applied
      setTimeout(drawWordCloud, 50);
    }

    // Reset Progress
    progress = 0;
  }

  /**
   * Start automatic cycling through the Mission/Vision/Values tabs and drive the per-tab progress bar.
   *
   * Clears any existing tab and progress timers, then:
   * - sets a timer that advances the active tab in the order mission → vision → values → mission at intervals defined by `switchTime` by calling `switchTab`.
   * - sets a progress timer that increments an internal `progress` value every `updateFreq`, updates the `.progress-bar` width inside the currently active `.mv-tab-btn`, and resets `progress` to 0 when it exceeds 100.
   */
  function startTabCycle() {
    clearInterval(tabInterval);
    clearInterval(progressInterval);

    tabInterval = setInterval(() => {
      let nextTab;
      if (currentTab === 'mission') nextTab = 'vision';
      else if (currentTab === 'vision') nextTab = 'values';
      else nextTab = 'mission';

      switchTab(nextTab);
    }, switchTime);

    progressInterval = setInterval(() => {
      progress += (updateFreq / switchTime) * 100;
      if (progress > 100) progress = 0;

      const activeBtn = document.querySelector('.mv-tab-btn.active');
      if (activeBtn) {
        const bar = activeBtn.querySelector('.progress-bar');
        if (bar) bar.style.width = `${progress}%`;
      }
    }, updateFreq);
  }

  // Manual Click
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      startTabCycle(); // Restart timer on manual interaction
    });
  });

  // Start initially
  startTabCycle();

  // --- WordCloud Logic ---
  const canvas = document.getElementById('values-canvas');
  const container = document.getElementById('canvas-container');

  /**
   * Renders a responsive word cloud into the configured canvas element.
   *
   * Resizes the canvas to match its container, then draws a word cloud using the current
   * word list (falls back to defaults). If the canvas or container is missing, the canvas
   * is hidden (width 0), or the WordCloud library is not available, the function does nothing.
   *
   * The visual output is horizontal words arranged in a circular layout with responsive sizing.
   */
  function drawWordCloud() {
    if (!canvas || !container) return;

    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // If width is 0 (hidden), don't draw
    if (canvas.width === 0) return;

    if (typeof window.WordCloud !== 'function') {
      console.warn('WordCloud library no disponible. Se omite el wordcloud.');
      return;
    }

    window.WordCloud(canvas, {
      list: wordCloudWords.length ? wordCloudWords : defaultWordCloudWords,
      gridSize: 8,
      weightFactor: function (size) {
        return (size / 50) * (canvas.width / 10); // Responsive scaling
      },
      fontFamily: '"Poppins", sans-serif',
      color: function (word, weight) {
        const colors = ['#D4AF37', '#C5A028', '#B08D1E', '#333333', '#555555'];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      rotateRatio: 0, // All horizontal
      backgroundColor: 'transparent',
      shape: 'circle',
      ellipticity: 1
    });
  }

  // Redraw on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentTab === 'values') drawWordCloud();
    }, 200);
  });

  /**
   * Repositions the testimonial carousel and updates visual states (featured card, dots, and progress).
   *
   * Updates the track translation to show the testimonial at `currentIndex`, toggles the `featured`
   * class on cards, activates the corresponding dot, and restarts the progress bar animation.
   *
   * @param {boolean} [skipTransitionLock=false] - If true, force-updates the carousel even while a transition is in progress.
   */
  function updateCarousel(skipTransitionLock = false) {
    if (!testimonialsTrack || !testimonialCards.length) return;
    if (isTransitioning && !skipTransitionLock) return;

    if (!skipTransitionLock) {
      isTransitioning = true;
    }

    const firstCard = testimonialCards[0];
    const cardWidth = firstCard ? firstCard.offsetWidth : 0;
    const gap = testimonialCards.length > 1 ? 32 : 0;
    const offset = -(currentIndex * (cardWidth + gap));

    testimonialsTrack.style.transform = `translateX(${offset}px)`;

    testimonialCards.forEach((card, index) => {
      card.classList.toggle('featured', index === currentIndex + 1);
    });

    if (progressBar) {
      progressBar.classList.remove('active');
      void progressBar.offsetWidth;
      progressBar.classList.add('active');
    }

    testimonialDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentIndex);
    });

    if (!skipTransitionLock) {
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
  }

  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
      if (isTransitioning || totalCards < 3) return;
      currentIndex--;
      if (currentIndex < 0) currentIndex = Math.max(totalCards - 3, 0);
      updateCarousel();
      resetAutoRotate();
    });
  }

  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
      if (isTransitioning || totalCards < 3) return;
      currentIndex++;
      if (currentIndex > totalCards - 3) currentIndex = 0;
      updateCarousel();
      resetAutoRotate();
    });
  }

  /**
   * Starts the automatic rotation of the testimonials carousel.
   *
   * Clears any existing auto-rotate timer, then if a testimonials track exists and there are more than three cards,
   * begins a 6-second interval that advances the visible carousel index, wraps to the start when reaching the end,
   * and calls updateCarousel on each tick. Stores the timer in `autoRotateInterval` and updates `currentIndex`.
   */
  function startAutoRotate() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    if (!testimonialsTrack || totalCards <= 3) return;

    autoRotateInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex > totalCards - 3) currentIndex = 0;
      updateCarousel();
    }, 6000);
  }

  /**
   * Restart the testimonials auto-rotation timer.
   *
   * Stops any existing auto-rotation interval (if present) and starts a new one.
   */
  function resetAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
    }
    startAutoRotate();
  }

  /**
   * Initializes an IntersectionObserver that triggers the statistics counters to animate once when the statistics section enters the viewport.
   *
   * If a previous observer exists it is disconnected. The observer watches the `.statistics` section (threshold 0.5) and, on first intersection, starts each `.stat-number` counter with a 100ms stagger between items.
   */
  function setupStatisticsObserver() {
    if (!statsContainer) return;

    const statNumbers = statsContainer.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    statsAnimated = false;
    if (statsObserver) {
      statsObserver.disconnect();
    }

    const statsSection = document.querySelector('.statistics');
    if (!statsSection) return;

    statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statNumbers.forEach((stat, index) => {
              setTimeout(() => {
                animateCounter(stat);
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    statsObserver.observe(statsSection);
  }

  /**
   * Animates a numeric counter on an element from 0 up to the integer in its `data-target` attribute over ~2000ms.
   *
   * The element's `textContent` is updated each frame with the current integer value; when finished the `textContent` equals the parsed `data-target`.
   * @param {Element} element - DOM element with a `data-target` attribute containing the desired integer end value.
   */
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10) || 0;
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const increment = target / (duration / 16);
    let currentValue = 0;

    const updateCounter = () => {
      currentValue += increment;
      if (currentValue < target) {
        element.textContent = `${prefix}${Math.floor(currentValue)}`;
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${prefix}${target}`;
      }
    };

    updateCounter();
  }
});
