/**
 * Toggle the mobile navigation's open state and update the menu icon.
 *
 * Toggles the 'active' class on the provided navigation container. If an icon element
 * is provided, it swaps Font Awesome classes: adds 'fa-times' and removes 'fa-bars'
 * when the menu becomes open, and reverses that when the menu is closed.
 *
 * @param {HTMLElement|null} nav - The navigation container element whose 'active' class will be toggled.
 * @param {HTMLElement|null} iconEl - Optional icon element (typically an <i>) to switch between 'fa-bars' and 'fa-times'.
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
 * Close the mobile navigation and reset the menu icon to the closed state.
 * @param {HTMLElement|null} nav - Navigation element to close; no-op if null.
 * @param {HTMLElement|null} iconEl - Icon element to update to the "bars" state; ignored if null.
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
 * Register event listeners to toggle the mobile navigation and to close it when a navigation link is clicked.
 *
 * @param {HTMLElement|null} menuBtn - The mobile menu button element; when provided a click listener is added to toggle the nav. May be null.
 * @param {HTMLElement|null} nav - The navigation container element; used to toggle/close the `active` state. May be null.
 * @param {HTMLElement|null} navList - The container holding navigation links; when provided a click listener is added to close the nav on link clicks. May be null.
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
 * Apply shadow and background styling to a header element based on page scroll position.
 *
 * When the page is scrolled more than 50 pixels, a stronger box shadow and a slightly more
 * opaque white background are applied; otherwise a lighter shadow and background are used.
 *
 * @param {HTMLElement|null} header - The header element to update; if null or undefined, no action is taken.
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
 * Initialize page UI by locating navigation and header elements and wiring their behaviors.
 *
 * Finds the mobile menu button, navigation container, navigation list, and header in the DOM,
 * then sets up the navigation menu event handlers and header scroll shadow behavior.
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