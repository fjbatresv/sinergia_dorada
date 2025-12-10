import fallbackContent from '../content/site-content.json';

const b = {
  hero: '#inicio',
  about: '#nosotros',
  statistics: '.statistics',
  partners: '.partners',
  testimonials: '.testimonials',
  team: '#equipo',
  join: '.join-us',
  contact: '#contacto'
};
function w(t, n, e = document) {
  t &&
    e.querySelectorAll(t).forEach((o) => {
      o.classList.toggle('section-hidden', !n);
    });
}
function C(t = {}, n = document) {
  Object.entries(b).forEach(([e, o]) => {
    const s = Object.prototype.hasOwnProperty.call(t, e) ? !!t[e] : !0;
    w(o, s, n);
  });
}
function T(t, n = []) {
  !t ||
    !Array.isArray(n) ||
    n.length === 0 ||
    ((t.innerHTML = ''),
    n.forEach((e) => {
      const o = document.createElement('li'),
        s = document.createElement('a');
      ((s.textContent = e.label || ''),
        (s.href = e.target || '#'),
        s.classList.add('nav-link'),
        o.appendChild(s),
        t.appendChild(o));
    }));
}
function I(t, n = []) {
  !t ||
    !Array.isArray(n) ||
    n.length === 0 ||
    ((t.innerHTML = ''),
    n.forEach((e) => {
      const o = document.createElement('div');
      o.className = 'stat-item fade-up visible';
      const s =
          e.plus === !0 ||
          (typeof e.label == 'string' &&
            e.label.toLowerCase().includes('personas impactadas')),
        i = document.createElement('div');
      ((i.className = 'stat-number'),
        (i.dataset.target = e.value || 0),
        (i.dataset.prefix = s ? '+' : ''),
        (i.innerHTML = `<span class="stat-value">${s ? '+' : ''}${e.value ?? 0}</span>`));
      const r = document.createElement('p');
      ((r.className = 'stat-label'),
        (r.textContent = e.label || ''),
        o.appendChild(i),
        o.appendChild(r),
        t.appendChild(o));
    }),
    P(t));
}
function L(t) {
  return Array.isArray(t) && t.length ? t : [];
}
function S(t, n = '.floating-item') {
  const e = t.querySelectorAll(n);
  if (!e.length) return;
  const o = [],
    s = 50,
    i = 50,
    r = 20;
  e.forEach((a) => {
    let c = 0,
      l = 0,
      d = 0,
      f = !1;
    for (; !f && c < 100; ) {
      if (
        ((d = Math.random() * 85),
        (l = Math.random() * 85),
        Math.hypot(d - s, l - i) < r)
      ) {
        c++;
        continue;
      }
      let u = !1;
      for (const m of o)
        if (Math.hypot(d - m.left, l - m.top) < 10) {
          u = !0;
          break;
        }
      (u || (f = !0), c++);
    }
    ((a.style.left = `${d}%`),
      (a.style.top = `${l}%`),
      o.push({ left: d, top: l }));
  });
}
function z(t, n, e, o) {
  !t ||
    !n ||
    ((t.width = n.offsetWidth),
    (t.height = n.offsetHeight),
    t.width !== 0 &&
      typeof window.WordCloud == 'function' &&
      window.WordCloud(t, {
        list: L(e).length ? e : o,
        gridSize: 8,
        weightFactor(s) {
          return (s / 50) * (t.width / 10);
        },
        fontFamily: '"Poppins", sans-serif',
        color() {
          const s = ['#D4AF37', '#C5A028', '#B08D1E', '#333333', '#555555'];
          return s[Math.floor(Math.random() * s.length)];
        },
        rotateRatio: 0,
        backgroundColor: 'transparent',
        shape: 'circle',
        ellipticity: 1
      }));
}
function $(t, n = []) {
  if (!t) return;
  let e = t.querySelector('.floating-items');
  (e ||
    ((e = document.createElement('div')),
    (e.className = 'floating-items'),
    t.prepend(e)),
    (e.innerHTML = ''),
    (Array.isArray(n) ? n : []).forEach((s, i) => {
      const r = s.type ? ` floating-${s.type}` : '',
        a = document.createElement('div');
      ((a.className = `floating-item floating-dog${r} fade-in delay-${(i % 5) + 1}`),
        (a.innerHTML = `<img src="${s.image}" alt="${s.alt || ''}" loading="lazy" width="320" height="320" decoding="async">`),
        e.appendChild(a));
    }),
    S(e, '.floating-item'));
}
function M(t, n, e) {
  e &&
    ($(t, e.floatingItems),
    n &&
      e.ctaText &&
      ((n.textContent = e.ctaText), e.ctaLink && (n.href = e.ctaLink)));
}
function B(t, n = {}) {
  if (!t || !n) return;
  ((t.innerHTML = ''),
    [
      { key: 'mission', label: 'Misi\xF3n', text: n.mission },
      { key: 'vision', label: 'Visi\xF3n', text: n.vision },
      { key: 'values', label: 'Valores', text: n.values }
    ].forEach((o, s) => {
      const i = document.createElement('div');
      ((i.className = `mvv-card ${s === 0 ? 'active' : ''}`),
        (i.dataset.tab = o.key),
        (i.innerHTML = `
      <h3>${o.label}</h3>
      <p>${Array.isArray(o.text) ? o.text.join(', ') : o.text || ''}</p>
    `),
        t.appendChild(i));
    }));
}
function A(t, n = []) {
  !t ||
    !n.length ||
    ((t.innerHTML = ''),
    n.forEach((e) => {
      const o = document.createElement('div');
      ((o.className = 'partner-logo'),
        (o.innerHTML = `<img src="${e.logo}" alt="${e.name}" loading="lazy" width="180" height="100">`),
        t.appendChild(o));
    }));
}
function H(t, n, e = []) {
  !t ||
    !Array.isArray(e) ||
    e.length === 0 ||
    ((t.innerHTML = ''),
    (n.innerHTML = ''),
    e.forEach((o, s) => {
      const i = document.createElement('div');
      ((i.className = `testimonial-card ${s === 0 ? 'featured' : ''}`),
        (i.innerHTML = `
      <div class="quote">"${o.quote || ''}"</div>
      <div class="author">
        <div>
          <h4>${o.author || ''}</h4>
          <p>${o.role || ''}</p>
        </div>
      </div>
    `),
        t.appendChild(i));
      const r = document.createElement('span');
      ((r.className = `dot ${s === 0 ? 'active' : ''}`), n.appendChild(r));
    }));
}
function N(t, n, e, o) {
  const s = Array.from(t.children);
  if (!s.length) return;
  ((t.style.display = 'flex'),
    (t.style.gap = '24px'),
    (t.style.position = 'relative'));
  const i = s.length;
  let r = 0,
    a;
  const c = () => {
      const u = getComputedStyle(t);
      return Number.parseFloat(u.columnGap || u.gap || '0') || 0;
    },
    l = (u = !0) => {
      const m = c(),
        h = s[0].getBoundingClientRect().width,
        g = (h + m) * r - (t.clientWidth - h) / 2;
      (s.forEach((y, x) => y.classList.toggle('featured', x === r)),
        n.querySelectorAll('.dot').forEach((y, x) => {
          y.classList.toggle('active', x === r);
        }),
        (t.style.transition = u ? 'transform 0.6s ease' : 'none'),
        (t.style.transform = `translateX(-${g}px)`));
    },
    d = () => {
      ((r = (r + 1) % i), l());
    },
    f = () => {
      ((r = (r - 1 + i) % i), l());
    },
    p = () => {
      (clearInterval(a), (a = setInterval(d, 5e3)));
    };
  (p(),
    l(!1),
    t.addEventListener('mouseenter', () => clearInterval(a)),
    t.addEventListener('mouseleave', p),
    n.querySelectorAll('.dot').forEach((u, m) => {
      u.addEventListener('click', () => {
        ((r = m), l(), p());
      });
    }),
    e &&
      e.addEventListener('click', () => {
        (f(), p());
      }),
    o &&
      o.addEventListener('click', () => {
        (d(), p());
      }));
}
function q(
  {
    partners: t = {},
    testimonials: n = {},
    team: e = {},
    join: o = {},
    contact: s = {}
  } = {},
  i = document
) {
  const r = i.getElementById('partners-title'),
    a = i.getElementById('partners-subtitle'),
    c = i.getElementById('testimonials-label'),
    l = i.getElementById('testimonials-title'),
    d = i.getElementById('team-title'),
    f = i.getElementById('team-subtitle'),
    p = i.getElementById('join-title'),
    u = i.getElementById('join-text'),
    m = i.getElementById('join-button'),
    h = i.getElementById('contact-title'),
    g = i.getElementById('contact-text');
  (r && t.title && (r.textContent = t.title),
    a && t.subtitle && (a.textContent = t.subtitle),
    c && n.label && (c.textContent = n.label),
    l && n.titleHtml && (l.innerHTML = n.titleHtml),
    d && e.title && (d.textContent = e.title),
    f && e.subtitle && (f.textContent = e.subtitle),
    p && o.title && (p.textContent = o.title),
    u && o.text && (u.textContent = o.text),
    m && o.buttonText && (m.textContent = o.buttonText),
    h && s.title && (h.textContent = s.title),
    g && s.text && (g.textContent = s.text));
}
function E(t = {}, n = document) {
  const e = n.getElementById('hero-collage'),
    o = n.getElementById('nav-list'),
    s = n.getElementById('mvv-cards'),
    i = n.getElementById('stats-container'),
    r = n.getElementById('partners-track'),
    a = n.getElementById('testimonials-track'),
    c = n.getElementById('testimonial-dots'),
    l = n.getElementById('hero-cta'),
    d = n.getElementById('prev-testimonial'),
    f = n.getElementById('next-testimonial');
  (C(t.sections, n),
    T(o, t.navigation),
    q(t.sectionsContent, n),
    M(e, l, t.hero),
    B(s, t.about),
    I(i, t.statistics),
    A(r, t.partners),
    H(a, c, t.testimonials),
    a && c && N(a, c, d, f));
}
function O() {
  const t =
    typeof window < 'u' &&
    window.location &&
    !window.location.href.startsWith('about:')
      ? window.location.href
      : null;
  if (!t)
    return Promise.reject(new Error('No base URL to resolve content JSON'));
  const n = new URL('content/site-content.json', t).href;
  return fetch(n, { cache: 'no-store' }).then((e) => {
    if (!e.ok) throw new Error(`Status ${e.status}`);
    return e.json();
  });
}
function V() {
  return new Promise((t, n) => {
    try {
      const e = new XMLHttpRequest();
      (e.overrideMimeType('application/json'),
        e.open('GET', 'content/site-content.json', !0),
        (e.onreadystatechange = function () {
          if (e.readyState === 4)
            if (e.status === 200 || e.status === 0)
              try {
                t(JSON.parse(e.responseText));
              } catch (o) {
                n(o);
              }
            else n(new Error(`XHR status ${e.status}`));
        }),
        (e.onerror = n),
        e.send(null));
    } catch (e) {
      n(e);
    }
  });
}
function j(
  t = fallbackContent,
  { fetchFn: n = O, xhrFn: e = V, applyFn: o = E, protocol: s } = {}
) {
  const r = t || fallbackContent;
  return ((s || window.location.protocol) === 'file:' ? e() : n())
    .then(o)
    .catch((a) => {
      (console.warn(
        'No fue posible cargar content/site-content.json. Usando contenido por defecto.',
        a
      ),
        window.location.protocol === 'file:' &&
          console.info(
            'Levanta la web con un servidor local para cargar el JSON din\xE1micamente.'
          ),
        r && o(r));
    });
}
function R(t = document) {
  const n = t.getElementById('current-year');
  n && (n.textContent = new Date().getFullYear());
}
function F(
  t = typeof IntersectionObserver < 'u' ? IntersectionObserver : null,
  n = document
) {
  if (!t) return;
  const e = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    o = new t((i) => {
      i.forEach((r) => {
        r.isIntersecting &&
          (r.target.classList.add('visible'), o.unobserve(r.target));
      });
    }, e);
  n.querySelectorAll(
    '.fade-in, .fade-in-left, .fade-in-right, .fade-up'
  ).forEach((i) => o.observe(i));
}
function P(t) {
  const n = t.querySelectorAll('.stat-number');
  if (!n.length) return;
  let e = !1;
  const o = () => {
    e ||
      ((e = !0),
      n.forEach((i) => {
        const r = Number(i.dataset.target || 0),
          a = i.dataset.prefix || '',
          c = i.querySelector('.stat-value') || i;
        let l = 0;
        const d = Math.max(1, Math.floor(r / 60)),
          f = () => {
            if (((l += d), l >= r)) {
              c.textContent = `${a}${r}`;
              return;
            }
            ((c.textContent = `${a}${Math.floor(l)}`),
              requestAnimationFrame(f));
          };
        f();
      }));
  };
  if ((o(), typeof IntersectionObserver > 'u')) {
    n.forEach((i) => {
      const r = i.dataset.prefix || '';
      i.textContent = `${r}${i.dataset.target || '0'}`;
    });
    return;
  }
  const s = new IntersectionObserver(
    (i) => {
      i.forEach((r) => {
        r.isIntersecting && (o(), s.disconnect());
      });
    },
    { threshold: 0.2 }
  );
  s.observe(t);
}
function v(t = fallbackContent) {
  const n =
    (typeof window < 'u' && window.__VITEST__) ||
    (typeof globalThis < 'u' && globalThis.process?.env?.VITEST);
  (R(),
    F(),
    t && E(t),
    typeof window < 'u' &&
      window.location &&
      window.location.protocol !== 'about:' &&
      !n &&
      j(t));
}
typeof document < 'u' &&
  (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => v())
    : v());
export {
  B as applyAboutContent,
  M as applyHeroContent,
  $ as applyHeroFloatingItems,
  A as applyPartners,
  q as applySectionTexts,
  C as applySectionVisibility,
  E as applySiteContent,
  H as applyTestimonials,
  z as drawWordCloud,
  O as fetchSiteContentViaFetch,
  V as fetchSiteContentViaXHR,
  v as initContent,
  F as initObservers,
  j as loadSiteContent,
  T as populateNavigation,
  I as populateStatistics,
  R as setCurrentYear,
  w as setSectionVisibility
};
//# sourceMappingURL=content.js.map
