/**
 * Alterna el estado del menú móvil y el ícono.
 * @param {HTMLElement|null} nav
 * @param {HTMLElement|null} iconEl
 */
function toggleNav(nav, iconEl) {
  if (!nav) return;
  nav.classList.toggle('active');
  if (!iconEl) return;

  const isOpen = nav.classList.contains('active');
  iconEl.classList.remove(isOpen ? 'fa-bars' : 'fa-times');
  iconEl.classList.add(isOpen ? 'fa-times' : 'fa-bars');
}

/**
 * Cierra el menú móvil y restaura el ícono.
 * @param {HTMLElement|null} nav
 * @param {HTMLElement|null} iconEl
 */
function closeNav(nav, iconEl) {
  if (!nav) return;
  nav.classList.remove('active');
  if (iconEl) {
    iconEl.classList.remove('fa-times');
    iconEl.classList.add('fa-bars');
  }
}

/**
 * Registra los eventos de apertura/cierre del menú y navegación.
 * @param {{menuBtn: HTMLElement|null, nav: HTMLElement|null, navList: HTMLElement|null}} param0
 */
function setupNavMenu({ menuBtn, nav, navList }) {
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const icon = menuBtn.querySelector('i');
      toggleNav(nav, icon);
    });
  }

  if (nav && navList) {
    navList.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-link')) return;
      const icon = menuBtn?.querySelector('i');
      closeNav(nav, icon);
    });
  }
}

/**
 * Aplica estilos de sombra y fondo al header según el scroll.
 * @param {HTMLElement|null} header
 */
function setupHeaderShadow(header) {
  if (!header) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    header.style.boxShadow = scrolled
      ? '0 2px 20px rgba(0,0,0,0.1)'
      : '0 2px 20px rgba(0,0,0,0.05)';
    header.style.backgroundColor = scrolled
      ? 'rgba(255, 255, 255, 0.98)'
      : 'rgba(255, 255, 255, 0.95)';
  });
}

/**
 * Inicializa los comportamientos de UI en la página.
 */
function initUI() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  const navList = document.querySelector('.nav-list');
  const header = document.querySelector('.header');
  setupNavMenu({ menuBtn, nav, navList });
  setupHeaderShadow(header);
}

/* c8 ignore start */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
}
/* c8 ignore stop */

export { closeNav, initUI, setupHeaderShadow, setupNavMenu, toggleNav };
