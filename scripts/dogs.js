const b = 'content/dogs.json';
function w(e) {
  if (!e) return '';
  try {
    const n = new URL(e, window.location.origin);
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
  ((t.loading = 'lazy'),
    (t.width = 320),
    (t.height = 320),
    (t.alt = c || 'Perro'),
    (t.src = w(e?.image)),
    l.appendChild(t));
  const m = document.createElement('div');
  m.classList.add('card-content');
  const h = document.createElement('h3');
  ((h.textContent = c), m.appendChild(h));
  const r = document.createElement('span');
  (r.classList.add('breed'),
    (r.textContent = typeof e?.breed === 'string' ? e.breed : ''),
    m.appendChild(r));
  return (
    o.appendChild(l),
    o.appendChild(m),
    o.addEventListener('click', () => n(e)),
    o
  );
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
  (t &&
    ((t.src = w(e.image)),
    (t.width = 640),
    (t.height = 640),
    (t.loading = 'lazy')),
    c && (c.textContent = e.name),
    m && (m.textContent = e.breed),
    r &&
      (e.color
        ? ((r.style.display = 'block'), h && (h.textContent = e.color))
        : (r.style.display = 'none')),
    d &&
      (e.birthdate
        ? ((d.style.display = 'block'), f && (f.textContent = e.birthdate))
        : (d.style.display = 'none')),
    s &&
      (() => {
        for (; s.firstChild; ) s.removeChild(s.firstChild);
        if (Array.isArray(e.description) && e.description.length > 0) {
          e.description.forEach((p, y) => {
            s.appendChild(
              document.createTextNode(typeof p === 'string' ? p : '')
            );
            y < e.description.length - 1 &&
              (s.appendChild(document.createElement('br')),
              s.appendChild(document.createElement('br')));
          });
          return;
        }
        if (typeof e.description === 'string' && e.description) {
          s.textContent = e.description;
          return;
        }
        s.textContent = 'Sin descripci\xF3n disponible.';
      })(),
    a &&
      (e.instagram
        ? (() => {
            const p = w(e.instagram);
            p
              ? ((a.href = p),
                (a.rel = 'noopener noreferrer'),
                (a.style.display = 'inline-flex'))
              : (a.style.display = 'none');
          })()
        : (a.style.display = 'none')),
    l.classList.add('show'),
    o?.body && (o.body.style.overflow = 'hidden'));
}
function E(e, n = document) {
  (e?.modal && e.modal.classList.remove('show'),
    n?.body && (n.body.style.overflow = 'auto'));
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
  return (
    (() => {
      (t && clearInterval(t),
        (t = setInterval(() => {
          !o() && n() && ((e.scrollLeft += l), x(e, n()));
        }, 20)));
    })(),
    () => t && clearInterval(t)
  );
}
function I() {
  const e = document.getElementById('carousel-track'),
    n = document.getElementById('prev-btn'),
    o = document.getElementById('next-btn');
  if (!e) return;
  const l = g(document);
  fetch(b)
    .then((t) => t.json())
    .then((t) =>
      D({
        track: e,
        prevBtn: n,
        nextBtn: o,
        dogs: t,
        modalElements: l,
        startAutoScrollFn: L
      })
    )
    .catch((t) => console.error('Error loading dogs:', t));
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
  (l.forEach((i) => {
    e.appendChild(v(i, m));
  }),
    l.forEach((i) => {
      e.appendChild(v(i, m));
    }),
    [...l].reverse().forEach((i) => {
      e.insertBefore(v(i, m), e.firstChild);
    }));
  const h = 1;
  let r = !1,
    f,
    d;
  const s = () => {
    const i = C(e, l.length);
    (i.cardWidth && (f = i.cardWidth),
      i.singleSetWidth && (d = i.singleSetWidth));
  };
  (setTimeout(() => {
    (s(), d && (e.scrollLeft = d));
  }, 100),
    window.addEventListener('resize', () => {
      (s(), d && (e.scrollLeft = d));
    }));
  let a = c(
    e,
    () => d,
    () => r,
    h
  );
  const u = {
    mouseenter: () => {
      r = !0;
    },
    mouseleave: () => {
      r = !1;
    }
  };
  (e.addEventListener('mouseenter', u.mouseenter),
    e.addEventListener('mouseleave', u.mouseleave),
    o &&
      (o.addEventListener('click', () => {
        e.scrollBy({ left: f, behavior: 'smooth' });
      }),
      o.addEventListener('mouseenter', u.mouseenter),
      o.addEventListener('mouseleave', u.mouseleave)),
    n &&
      (n.addEventListener('click', () => {
        e.scrollBy({ left: -f, behavior: 'smooth' });
      }),
      n.addEventListener('mouseenter', u.mouseenter),
      n.addEventListener('mouseleave', u.mouseleave)));
  const y = t.modal,
    p = t.closeModalBtn;
  (p && y && p.addEventListener('click', () => E(t, document)),
    window.addEventListener('click', (i) => {
      y && i.target === y && E(t, document);
    }),
    document.addEventListener('visibilitychange', () => {
      document.hidden
        ? a()
        : (a = c(
            e,
            () => d,
            () => r,
            h
          ));
    }));
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
