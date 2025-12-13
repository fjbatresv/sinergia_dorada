function toggleNav(nav, iconEl) {
  if (!nav) return;
  nav.classList.toggle('active');
  if (!iconEl) return;

  const isOpen = nav.classList.contains('active');
  iconEl.classList.remove(isOpen ? 'fa-bars' : 'fa-times');
  iconEl.classList.add(isOpen ? 'fa-times' : 'fa-bars');
}

function closeNav(nav, iconEl) {
  if (!nav) return;
  nav.classList.remove('active');
  if (iconEl) {
    iconEl.classList.remove('fa-times');
    iconEl.classList.add('fa-bars');
  }
}

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
