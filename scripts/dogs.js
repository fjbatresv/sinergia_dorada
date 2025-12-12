import fallbackDogs from '../content/dogs.json';

const globalScope = typeof globalThis !== 'undefined' ? globalThis : undefined;
const b = 'content/dogs.json';
function w(e) {
  if (!e) return '';
  const origin = globalScope?.location?.origin ?? null;
  if (!origin) return '';
  try {
    const n = new URL(e, origin);
    return n.protocol === 'http:' || n.protocol === 'https:' ? n.href : '';
  } catch {
    return '';
  }
}
function v(e, n = () => {}) {
  const o = document.createElement('div');
  o.classList.add('team-card');
  const l = document.createElement('div');
  l.classList.add('card-image');
  const t = document.createElement('img');
  const c = typeof e?.name === 'string' ? e.name : '';
  t.loading = 'lazy';
  t.width = 320;
  t.height = 320;
  t.alt = c || 'Perro';
  t.src = w(e?.image);
  l.appendChild(t);
  const m = document.createElement('div');
  m.classList.add('card-content');
  const h = document.createElement('h3');
  h.textContent = c;
  m.appendChild(h);
  const r = document.createElement('span');
  r.classList.add('breed');
  r.textContent = typeof e?.breed === 'string' ? e.breed : '';
  m.appendChild(r);
  o.appendChild(l);
  o.appendChild(m);
  o.addEventListener('click', () => n(e));
  return o;
}
function g(e = document) {
  return {
    modal: e.getElementById('dog-modal'),
    closeModalBtn: e.querySelector('.close-modal'),
    modalImg: e.getElementById('modal-img'),
    modalName: e.getElementById('modal-name'),
    modalBreed: e.getElementById('modal-breed'),
    modalColor: e.getElementById('modal-color'),
    modalColorContainer: e.getElementById('modal-color-container'),
    modalBirthdate: e.getElementById('modal-birthdate'),
    modalBirthdateContainer: e.getElementById('modal-birthdate-container'),
    modalDesc: e.getElementById('modal-desc'),
    modalInsta: e.getElementById('modal-insta')
  };
}
function B(e, n, o = document) {
  if (!n?.modal) return;
  const {
    modal: l,
    modalImg: t,
    modalName: c,
    modalBreed: m,
    modalColor: h,
    modalColorContainer: r,
    modalBirthdate: f,
    modalBirthdateContainer: d,
    modalDesc: s,
    modalInsta: a
  } = n;
  if (t) {
    t.src = w(e.image);
    t.width = 640;
    t.height = 640;
    t.loading = 'lazy';
  }
  if (c) c.textContent = e.name;
  if (m) m.textContent = e.breed;
  if (r) {
    if (e.color) {
      r.style.display = 'block';
      if (h) h.textContent = e.color;
    } else {
      r.style.display = 'none';
    }
  }
  if (d) {
    if (e.birthdate) {
      d.style.display = 'block';
      if (f) f.textContent = e.birthdate;
    } else {
      d.style.display = 'none';
    }
  }
  if (s) {
    while (s.firstChild) {
      s.firstChild.remove();
    }
    if (Array.isArray(e.description) && e.description.length > 0) {
      e.description.forEach((p, y) => {
        s.appendChild(document.createTextNode(typeof p === 'string' ? p : ''));
        if (y < e.description.length - 1) {
          s.appendChild(document.createElement('br'));
          s.appendChild(document.createElement('br'));
        }
      });
    } else if (typeof e.description === 'string' && e.description) {
      s.textContent = e.description;
    } else {
      s.textContent = 'Sin descripci\xF3n disponible.';
    }
  }
  if (a) {
    if (e.instagram) {
      const p = w(e.instagram);
      if (p) {
        a.href = p;
        a.rel = 'noopener noreferrer';
        a.style.display = 'inline-flex';
      } else {
        a.style.display = 'none';
      }
    } else {
      a.style.display = 'none';
    }
  }
  l.classList.add('show');
  if (o?.body) o.body.style.overflow = 'hidden';
}
function E(e, n = document) {
  if (e?.modal) e.modal.classList.remove('show');
  if (n?.body) n.body.style.overflow = 'auto';
}
function C(e, n, o = 32) {
  const l = e?.querySelector('.team-card');
  if (!l) return { cardWidth: void 0, singleSetWidth: void 0 };
  const t = l.offsetWidth + o;
  return { cardWidth: t, singleSetWidth: t * n };
}
function x(e, n) {
  return !e || !n
    ? (e?.scrollLeft ?? 0)
    : (e.scrollLeft >= n * 2
        ? (e.scrollLeft -= n)
        : e.scrollLeft <= 0 && (e.scrollLeft += n),
      e.scrollLeft);
}
function L(e, n, o, l) {
  let t;
  const start = () => {
    if (t) clearInterval(t);
    t = setInterval(() => {
      if (!o() && n()) {
        e.scrollLeft += l;
        x(e, n());
      }
    }, 20);
  };
  start();
  return () => {
    if (t) clearInterval(t);
  };
}
function A(e, n = 'No pudimos cargar el equipo en este momento.') {
  if (!e) return;
  e.innerHTML = '';
  const o = document.createElement('div');
  o.className = 'team-error';
  o.setAttribute('role', 'status');
  o.textContent = n;
  e.appendChild(o);
}
function I() {
  const e = document.getElementById('carousel-track'),
    n = document.getElementById('prev-btn'),
    o = document.getElementById('next-btn');
  if (!e) return;
  const l = g(document);
  const t = Array.isArray(fallbackDogs) ? fallbackDogs : [];
  const c = (d) =>
    D({
      track: e,
      prevBtn: n,
      nextBtn: o,
      dogs: d,
      modalElements: l,
      startAutoScrollFn: L
    });
  fetch(b)
    .then((r) => {
      if (!r?.ok) throw new Error(`HTTP ${r?.status ?? 'error'}`);
      return r.json();
    })
    .then((r) => c(r))
    .catch((error_) => {
      console.error('Error loading dogs:', error_);
      if (t.length) {
        console.info('Usando fallback local para dogs.json');
        c(t);
        return;
      }
      A(e);
    });
}
function D({
  track: e,
  prevBtn: n,
  nextBtn: o,
  dogs: l,
  modalElements: t,
  startAutoScrollFn: c = L
}) {
  if (!e || !Array.isArray(l) || l.length === 0) return;
  const m = (i) => B(i, t, document);
  const duplicateDogs = () => {
    l.forEach((i) => {
      e.appendChild(v(i, m));
    });
    l.forEach((i) => {
      e.appendChild(v(i, m));
    });
    [...l].reverse().forEach((i) => {
      e.insertBefore(v(i, m), e.firstChild);
    });
  };

  duplicateDogs();
  const h = 1;
  const state = { paused: !1, cardWidth: undefined, singleSetWidth: undefined };
  const recalc = () => {
    const i = C(e, l.length);
    state.cardWidth = i.cardWidth;
    state.singleSetWidth = i.singleSetWidth;
    if (state.singleSetWidth) e.scrollLeft = state.singleSetWidth;
  };

  setTimeout(recalc, 100);
  globalScope?.addEventListener?.('resize', recalc);

  let stopAuto = c(
    e,
    () => state.singleSetWidth,
    () => state.paused,
    h
  );

  const toggleHover = (hovered) => {
    state.paused = hovered;
  };
  e.addEventListener('mouseenter', () => toggleHover(!0));
  e.addEventListener('mouseleave', () => toggleHover(!1));

  if (o) {
    o.addEventListener('click', () => {
      if (state.cardWidth)
        e.scrollBy({ left: state.cardWidth, behavior: 'smooth' });
    });
    o.addEventListener('mouseenter', () => toggleHover(!0));
    o.addEventListener('mouseleave', () => toggleHover(!1));
  }
  if (n) {
    n.addEventListener('click', () => {
      if (state.cardWidth)
        e.scrollBy({ left: -state.cardWidth, behavior: 'smooth' });
    });
    n.addEventListener('mouseenter', () => toggleHover(!0));
    n.addEventListener('mouseleave', () => toggleHover(!1));
  }
  const y = t.modal,
    p = t.closeModalBtn;
  if (p && y) {
    p.addEventListener('click', () => E(t, document));
  }
  document.addEventListener('click', (i) => {
    if (y && i.target === y) E(t, document);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto?.();
      return;
    }
    stopAuto = c(
      e,
      () => state.singleSetWidth,
      () => state.paused,
      h
    );
  });
}
typeof document < 'u' &&
  (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', I)
    : I());
export {
  x as checkInfiniteScroll,
  v as createDogCard,
  g as getModalElements,
  E as hideDogModal,
  I as initDogs,
  D as setupDogsCarousel,
  B as showDogModal,
  L as startAutoScroll,
  C as updateDimensions
};
//# sourceMappingURL=dogs.js.map
