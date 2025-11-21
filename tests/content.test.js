import { describe, it, expect, vi, beforeEach } from 'vitest';
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
