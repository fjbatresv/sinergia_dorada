export function toggleNav(nav, icon) {
  nav.classList.toggle('active');
  if (!icon) return;
  const isOpen = nav.classList.contains('active');
  icon.classList.remove(isOpen ? 'fa-bars' : 'fa-times');
  icon.classList.add(isOpen ? 'fa-times' : 'fa-bars');
}

export function closeNav(nav, icon) {
  nav.classList.remove('active');
  if (!icon) return;
  icon.classList.remove('fa-times');
  icon.classList.add('fa-bars');
}

export function setupNavMenu({ menuBtn, nav, navList }) {
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const icon = menuBtn.querySelector('i');
      toggleNav(nav, icon);
    });
  }

  if (navList) {
    navList.addEventListener('click', (event) => {
      const link = event.target.closest('.nav-link');
      if (!link || !nav || !menuBtn) return;
      const icon = menuBtn.querySelector('i');
      closeNav(nav, icon);
    });
  }
}

export function setupHeaderShadow(header) {
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    } else {
      header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    }
  });
}

export function initUI() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  const navList = document.querySelector('.nav-list');
  const header = document.querySelector('.header');

  setupNavMenu({ menuBtn, nav, navList });
  setupHeaderShadow(header);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
}
