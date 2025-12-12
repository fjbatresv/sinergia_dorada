import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as content from '../scripts/content.js';
import {
  applySectionVisibility,
  setSectionVisibility,
  populateNavigation,
  populateStatistics,
  applyHeroFloatingItems,
  applyHeroContent,
  applySectionTexts,
  applySiteContent,
  drawWordCloud,
  fetchSiteContentViaFetch,
  fetchSiteContentViaXHR,
  loadSiteContent,
  setCurrentYear,
  initObservers
} from '../scripts/content.js';

describe('setSectionVisibility', () => {
  it('aplica/remueve section-hidden', () => {
    document.body.innerHTML = `
      <section class="test-section"></section>
      <section class="test-section"></section>
    `;
    setSectionVisibility('.test-section', false);
    document.querySelectorAll('.test-section').forEach((el) => {
      expect(el.classList.contains('section-hidden')).toBe(true);
    });
    setSectionVisibility('.test-section', true);
    document.querySelectorAll('.test-section').forEach((el) => {
      expect(el.classList.contains('section-hidden')).toBe(false);
    });
  });

  it('no revienta con selector falsy', () => {
    expect(() => setSectionVisibility('', true)).not.toThrow();
  });
});

describe('populateNavigation', () => {
  it('crea elementos de navegación', () => {
    const navList = document.createElement('ul');
    populateNavigation(navList, [
      { label: 'Inicio', target: '#inicio' },
      { label: 'Nosotros', target: '#nosotros' }
    ]);
    expect(navList.querySelectorAll('li').length).toBe(2);
    expect(navList.querySelector('a').textContent).toBe('Inicio');
    expect(navList.querySelector('a').getAttribute('href')).toBe('#inicio');
  });
});

describe('populateStatistics', () => {
  it('renderea cards de estadísticas', () => {
    const container = document.createElement('div');
    populateStatistics(container, [
      { label: 'Visitas', value: 10 },
      { label: 'Personas', value: 20 }
    ]);
    const cards = container.querySelectorAll('.stat-item');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('10');
  });

  it('usa el prefijo + y valores por defecto cuando faltan', () => {
    const container = document.createElement('div');
    populateStatistics(container, [{ label: 'Impacto', plus: true }]);
    const stat = container.querySelector('.stat-number');
    expect(stat?.dataset.prefix).toBe('+');
    expect(stat?.dataset.target).toBe('0');
    expect(stat?.textContent).toContain('0');
  });
});

describe('applyHeroFloatingItems y applyHeroContent', () => {
  it('inyecta ítems flotantes y CTA', () => {
    const heroCollage = document.createElement('div');
    const heroCTA = document.createElement('a');
    applyHeroContent(heroCollage, heroCTA, {
      ctaText: 'Ir',
      ctaLink: '#destino',
      floatingItems: [{ image: 'img.png', alt: 'Alt', type: 'dog' }]
    });
    expect(heroCollage.querySelectorAll('.floating-item').length).toBe(1);
    expect(heroCTA.textContent).toBe('Ir');
    expect(heroCTA.getAttribute('href')).toBe('#destino');
  });

  it('reutiliza contenedor existente de ítems flotantes', () => {
    const heroCollage = document.createElement('div');
    const existing = document.createElement('div');
    existing.className = 'floating-items';
    heroCollage.appendChild(existing);

    applyHeroFloatingItems(heroCollage, [
      { image: 'dog.png', alt: 'Dog', type: 'paw' }
    ]);

    expect(heroCollage.querySelectorAll('.floating-item').length).toBe(1);
    expect(heroCollage.querySelector('.floating-items')).toBe(existing);
  });
});

describe('applySectionTexts', () => {
  it('aplica textos en las secciones', () => {
    document.body.innerHTML = `
      <h2 id="partners-title"></h2>
      <p id="partners-subtitle"></p>
      <p id="testimonials-label"></p>
      <h2 id="testimonials-title"></h2>
      <h2 id="team-title"></h2>
      <p id="team-subtitle"></p>
      <h2 id="join-title"></h2>
      <p id="join-text"></p>
      <a id="join-button"></a>
      <h2 id="contact-title"></h2>
      <p id="contact-text"></p>
    `;
    applySectionTexts({
      partners: { title: 'T1', subtitle: 'S1' },
      testimonials: { label: 'L1', titleHtml: 'HTML' },
      team: { title: 'T2', subtitle: 'S2' },
      join: { title: 'T3', text: 'S3', buttonText: 'Btn' },
      contact: { title: 'T4', text: 'S4' }
    });
    expect(document.getElementById('partners-title').textContent).toBe('T1');
    expect(document.getElementById('join-button').textContent).toBe('Btn');
    expect(document.getElementById('testimonials-title').innerHTML).toBe(
      'HTML'
    );
  });

  it('omite valores indefinidos y respeta HTML', () => {
    document.body.innerHTML = `
      <h2 id="testimonials-title"></h2>
      <h2 id="join-title"></h2>
    `;
    applySectionTexts({
      testimonials: { titleHtml: '<em>Hola</em>' },
      join: {}
    });
    expect(document.getElementById('testimonials-title').innerHTML).toBe(
      '<em>Hola</em>'
    );
    expect(document.getElementById('join-title').textContent).toBe('');
  });
});

describe('applySiteContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="hero-collage"></div>
      <ul id="nav-list"></ul>
      <div id="mvv-cards"></div>
      <div id="stats-container"></div>
      <div id="partners-track"></div>
      <div id="testimonials-track"></div>
      <div id="testimonial-dots"></div>
      <button id="prev-testimonial"></button>
      <button id="next-testimonial"></button>
      <a id="hero-cta"></a>
      <h2 id="partners-title"></h2>
      <p id="partners-subtitle"></p>
      <p id="testimonials-label"></p>
      <h2 id="testimonials-title"></h2>
      <h2 id="team-title"></h2>
      <p id="team-subtitle"></p>
      <h2 id="join-title"></h2>
      <p id="join-text"></p>
      <a id="join-button"></a>
      <h2 id="contact-title"></h2>
      <p id="contact-text"></p>
      <section id="inicio"></section>
      <section id="nosotros"></section>
      <section class="statistics"></section>
      <section class="partners"></section>
      <section class="testimonials"></section>
      <section id="equipo"></section>
      <section class="join-us"></section>
      <section id="contacto"></section>
    `;
  });

  it('puebla la página con el contenido', () => {
    const content = {
      sections: { testimonials: false },
      navigation: [{ label: 'Inicio', target: '#inicio' }],
      hero: {
        ctaText: 'CTA',
        ctaLink: '#cta',
        floatingItems: [{ image: 'a', alt: 'b' }]
      },
      about: { mission: 'Misión', vision: 'Visión', values: ['Valor'] },
      statistics: [{ label: 'Visitas', value: 5 }],
      partners: [{ name: 'Aliado', logo: 'logo.png' }],
      testimonials: [{ quote: 'Q', author: 'A', role: 'R', photo: 'p' }],
      sectionsContent: {
        partners: { title: 'PT', subtitle: 'PS' },
        testimonials: { label: 'TL', titleHtml: 'TT' },
        team: { title: 'TT1', subtitle: 'TS' },
        join: { title: 'JT', text: 'JT2', buttonText: 'JB' },
        contact: { title: 'CT', text: 'CT2' }
      }
    };

    applySiteContent(content);

    expect(document.querySelectorAll('.floating-item').length).toBe(1);
    expect(document.querySelectorAll('.partner-logo').length).toBe(1);
    expect(
      document.querySelectorAll('.testimonial-card').length
    ).toBeGreaterThan(0);
    expect(document.querySelectorAll('.stat-item').length).toBe(1);
    expect(
      document.getElementById('inicio').classList.contains('section-hidden')
    ).toBe(false);
    expect(
      document
        .querySelector('.testimonials')
        .classList.contains('section-hidden')
    ).toBe(true);

    document.getElementById('next-testimonial').click();
    document.getElementById('prev-testimonial').click();
    document.querySelector('#testimonial-dots .dot')?.click();
  });

  it('por defecto muestra secciones no declaradas', () => {
    applySectionVisibility({ about: false });
    expect(
      document.querySelector('#inicio').classList.contains('section-hidden')
    ).toBe(false);
    expect(
      document.querySelector('#nosotros').classList.contains('section-hidden')
    ).toBe(true);
  });

  it('maneja navegación/testimonios vacíos sin error', () => {
    expect(() =>
      applySiteContent({
        navigation: [],
        sections: {},
        hero: {},
        about: {},
        statistics: [],
        partners: [],
        testimonials: [],
        sectionsContent: {}
      })
    ).not.toThrow();
  });

  it('no falla si faltan los botones de navegación de testimonios', () => {
    document.getElementById('prev-testimonial')?.remove();
    document.getElementById('next-testimonial')?.remove();

    applySiteContent({
      navigation: [],
      sections: {},
      hero: { floatingItems: [] },
      about: {},
      statistics: [{ label: 'Visitas', value: 1 }],
      partners: [],
      testimonials: [{ quote: 'Bien', author: 'X', role: 'R' }],
      sectionsContent: {
        partners: {},
        testimonials: {},
        team: {},
        join: {},
        contact: {}
      }
    });

    expect(
      document.querySelectorAll('#testimonials-track .testimonial-card').length
    ).toBe(1);
  });
});

describe('drawWordCloud', () => {
  it('no dibuja si canvas width es 0 o falta WordCloud', () => {
    const canvas = document.createElement('canvas');
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', {
      value: 0,
      configurable: true
    });
    drawWordCloud(canvas, container, [], []);
    Object.defineProperty(container, 'offsetWidth', {
      value: 200,
      configurable: true
    });
    const wordCloudSpy = vi.fn();
    window.WordCloud = wordCloudSpy;
    drawWordCloud(canvas, container, [], []);
    expect(canvas.width).toBe(200);
    expect(wordCloudSpy).toHaveBeenCalled();
  });

  it('ejecuta callbacks de WordCloud', () => {
    const canvas = document.createElement('canvas');
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', {
      value: 200,
      configurable: true
    });
    Object.defineProperty(container, 'offsetHeight', {
      value: 200,
      configurable: true
    });

    const spyWeight = vi.fn();
    const spyColor = vi.fn();
    globalThis.WordCloud = (_canvas, opts) => {
      spyWeight(opts.weightFactor(50));
      spyColor(opts.color());
    };

    drawWordCloud(canvas, container, [['hola', 10]], [['fallback', 5]]);
    expect(spyWeight).toHaveBeenCalled();
    expect(spyColor).toHaveBeenCalled();
  });

  it('usa fallback y retorna si no hay WordCloud o canvas', () => {
    expect(() => drawWordCloud(null, null, [], [])).not.toThrow();

    const originalWordCloud = globalThis.WordCloud;
    const canvas = document.createElement('canvas');
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', {
      value: 150,
      configurable: true
    });
    Object.defineProperty(container, 'offsetHeight', {
      value: 100,
      configurable: true
    });

    // Sin WordCloud definido no debe lanzar
    globalThis.WordCloud = undefined;
    expect(() => drawWordCloud(canvas, container, [], [])).not.toThrow();

    const spy = vi.fn();
    globalThis.WordCloud = spy;
    drawWordCloud(canvas, container, [], [['fallback', 2]]);
    const listPassed = spy.mock.calls[0][1].list;
    expect(listPassed[0][0]).toBe('fallback');
    globalThis.WordCloud = originalWordCloud;
  });
});

describe('fetchSiteContentViaFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('rechaza cuando la ubicación no es válida', async () => {
    global.fetch = vi.fn();
    await expect(fetchSiteContentViaFetch(null)).rejects.toThrow(/No base URL/);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rechaza si la respuesta no es ok', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, json: vi.fn() });
    await expect(
      fetchSiteContentViaFetch({
        href: 'https://acme.test',
        protocol: 'https:'
      })
    ).rejects.toThrow('Status 500');
  });

  it('resuelve con JSON cuando todo es válido', async () => {
    const payload = { foo: 'bar' };
    const json = vi.fn().mockResolvedValue(payload);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json });

    const result = await fetchSiteContentViaFetch({
      href: 'https://acme.test/path/',
      protocol: 'https:'
    });

    expect(result).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://acme.test/path/content/site-content.json',
      { cache: 'no-store' }
    );
  });
});

describe('fetchSiteContentViaXHR', () => {
  const originalXHR = global.XMLHttpRequest;

  afterEach(() => {
    global.XMLHttpRequest = originalXHR;
  });

  it('resuelve con el JSON cuando la respuesta es 200', async () => {
    class MockXHR {
      constructor() {
        this.readyState = 0;
        this.status = 0;
        this.responseText = '';
      }
      overrideMimeType() {}
      open() {}
      send() {
        this.readyState = 4;
        this.status = 200;
        this.responseText = JSON.stringify({ ok: true });
        this.onreadystatechange?.();
      }
    }
    global.XMLHttpRequest = MockXHR;
    await expect(fetchSiteContentViaXHR()).resolves.toEqual({ ok: true });
  });

  it('rechaza cuando la respuesta es un error', async () => {
    class MockXHR {
      constructor() {
        this.readyState = 0;
        this.status = 0;
        this.responseText = '';
      }
      overrideMimeType() {}
      open() {}
      send() {
        this.readyState = 4;
        this.status = 500;
        this.onreadystatechange?.();
      }
    }
    global.XMLHttpRequest = MockXHR;
    await expect(fetchSiteContentViaXHR()).rejects.toThrow('XHR status 500');
  });
});

describe('loadSiteContent', () => {
  it('usa defaults cuando fetch falla', async () => {
    const defaults = { navigation: [] };
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'));
    const applyFn = vi.fn();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    await loadSiteContent(defaults, { fetchFn, xhrFn: fetchFn, applyFn });
    expect(applyFn).toHaveBeenCalledWith(defaults);
    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('aplica contenido si fetch resuelve', async () => {
    const data = { navigation: [{ label: 'X', target: '#x' }] };
    const fetchFn = vi.fn().mockResolvedValue(data);
    const applyFn = vi.fn();
    await loadSiteContent(
      {},
      { fetchFn, xhrFn: fetchFn, applyFn, protocol: 'http:' }
    );
    expect(applyFn).toHaveBeenCalledWith(data);
  });

  it('usa xhr cuando el protocolo es file:', async () => {
    const data = { navigation: [{ label: 'Y', target: '#y' }] };
    const fetchFn = vi.fn();
    const xhrFn = vi.fn().mockResolvedValue(data);
    const applyFn = vi.fn();
    await loadSiteContent({}, { fetchFn, xhrFn, applyFn, protocol: 'file:' });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(xhrFn).toHaveBeenCalled();
    expect(applyFn).toHaveBeenCalledWith(data);
  });
});

describe('helpers defensivos', () => {
  it('positionFloatingItems coloca coordenadas determinísticas', () => {
    const container = document.createElement('div');
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4);
    content.applyHeroFloatingItems(container, [
      { image: 'a.png', alt: 'a', type: 'dog' }
    ]);
    const first = container.querySelector('.floating-item');
    expect(first?.style.left).not.toBe('');
    expect(first?.style.top).not.toBe('');
    randomSpy.mockRestore();
  });

  it('populateNavigation y populateStatistics retornan rápido con entrada vacía', () => {
    expect(() => populateNavigation(null, null)).not.toThrow();
    expect(() => populateStatistics(null, null)).not.toThrow();
  });

  it('initObservers retorna si no hay constructor', () => {
    expect(() => initObservers(null, document)).not.toThrow();
  });

  it('animateStats retorna si no hay stats', () => {
    const container = document.createElement('div');
    expect(
      () => content.__esModule && content.applyHeroFloatingItems
    ).not.toThrow();
    // call animateStats indirectly via populateStatistics guard path
    expect(() => content.populateStatistics(container, [])).not.toThrow();
  });

  it('animateStats usa IntersectionObserver cuando está disponible', () => {
    const originalObserver = globalThis.IntersectionObserver;
    const originalRAF = globalThis.requestAnimationFrame;
    const observations = [];
    const disconnect = vi.fn();

    globalThis.requestAnimationFrame = (cb) => {
      cb();
      return 1;
    };
    globalThis.IntersectionObserver = class {
      constructor(cb) {
        this.cb = cb;
      }
      observe(el) {
        observations.push(el);
        this.cb([{ target: el, isIntersecting: true }]);
      }
      disconnect() {
        disconnect();
      }
    };

    const container = document.createElement('div');
    populateStatistics(container, [{ label: 'personas impactadas', value: 3 }]);

    expect(observations.length).toBe(1);
    expect(disconnect).toHaveBeenCalled();
    expect(container.querySelector('.stat-value')?.textContent).toBe('+3');

    if (originalRAF) {
      globalThis.requestAnimationFrame = originalRAF;
    } else {
      delete globalThis.requestAnimationFrame;
    }
    if (originalObserver) {
      globalThis.IntersectionObserver = originalObserver;
    } else {
      delete globalThis.IntersectionObserver;
    }
  });
});

describe('setCurrentYear', () => {
  it('setea el año cuando el elemento existe', () => {
    document.body.innerHTML = `<span id="current-year"></span>`;
    setCurrentYear();
    expect(document.getElementById('current-year').textContent).toMatch(
      /20[0-9]{2}/
    );
  });
});

describe('initObservers', () => {
  it('observa elementos y añade visible al intersectar', () => {
    const observed = [];
    let callback;
    class MockObserver {
      constructor(cb, options) {
        callback = cb;
        this.options = options;
      }
      observe(el) {
        observed.push(el);
      }
      unobserve(el) {
        el.unobserved = true;
      }
    }
    document.body.innerHTML = `
      <div class="fade-in" id="a"></div>
      <div class="fade-up" id="b"></div>
    `;
    initObservers(MockObserver, document);
    expect(observed.length).toBe(2);
    const entries = observed.map((el) => ({
      target: el,
      isIntersecting: true
    }));
    callback(entries);
    expect(document.getElementById('a').classList.contains('visible')).toBe(
      true
    );
    expect(document.getElementById('a').unobserved).toBe(true);
  });
});
