function r(e, t) {
  if ((e.classList.toggle('active'), !t)) return;
  const o = e.classList.contains('active');
  (t.classList.remove(o ? 'fa-bars' : 'fa-times'),
    t.classList.add(o ? 'fa-times' : 'fa-bars'));
}
function c(e, t) {
  (e.classList.remove('active'),
    t && (t.classList.remove('fa-times'), t.classList.add('fa-bars')));
}
function a({ menuBtn: e, nav: t, navList: o }) {
  (e &&
    t &&
    e.addEventListener('click', () => {
      const s = e.querySelector('i');
      r(t, s);
    }),
    o &&
      o.addEventListener('click', (s) => {
        if (!s.target.closest('.nav-link') || !t || !e) return;
        const i = e.querySelector('i');
        c(t, i);
      }));
}
function l(e) {
  e &&
    window.addEventListener('scroll', () => {
      window.scrollY > 50
        ? ((e.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)'),
          (e.style.backgroundColor = 'rgba(255, 255, 255, 0.98)'))
        : ((e.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)'),
          (e.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'));
    });
}
function n() {
  const e = document.querySelector('.mobile-menu-btn'),
    t = document.querySelector('.nav'),
    o = document.querySelector('.nav-list'),
    s = document.querySelector('.header');
  (a({ menuBtn: e, nav: t, navList: o }), l(s));
}
typeof document < 'u' &&
  (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', n)
    : n());
export {
  c as closeNav,
  n as initUI,
  l as setupHeaderShadow,
  a as setupNavMenu,
  r as toggleNav
};
//# sourceMappingURL=ui.js.map
