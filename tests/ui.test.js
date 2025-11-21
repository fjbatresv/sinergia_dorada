import { describe, it, expect } from 'vitest';
import {
  setupNavMenu,
  toggleNav,
  closeNav,
  setupHeaderShadow
} from '../scripts/ui.js';

describe('toggleNav y closeNav', () => {
  it('alternan clases e ícono del menú', () => {
    const nav = document.createElement('nav');
    const icon = document.createElement('i');
    icon.classList.add('fa-bars');

    toggleNav(nav, icon);
    expect(nav.classList.contains('active')).toBe(true);
    expect(icon.classList.contains('fa-times')).toBe(true);
    expect(icon.classList.contains('fa-bars')).toBe(false);

    closeNav(nav, icon);
    expect(nav.classList.contains('active')).toBe(false);
    expect(icon.classList.contains('fa-bars')).toBe(true);
  });
});

describe('setupNavMenu', () => {
  it('abre con el botón y cierra al hacer click en un enlace', () => {
    document.body.innerHTML = `
      <button class="mobile-menu-btn"><i class="fa-bars"></i></button>
      <nav class="nav"></nav>
      <ul class="nav-list">
        <li><a class="nav-link" href="#inicio">Inicio</a></li>
      </ul>
    `;

    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navList = document.querySelector('.nav-list');

    setupNavMenu({ menuBtn, nav, navList });

    menuBtn.click();
    expect(nav.classList.contains('active')).toBe(true);

    const link = document.querySelector('.nav-link');
    link.dispatchEvent(new Event('click', { bubbles: true }));
    expect(nav.classList.contains('active')).toBe(false);
  });
});

describe('setupHeaderShadow', () => {
  it('aplica estilo al hacer scroll', () => {
    const header = document.createElement('header');
    setupHeaderShadow(header);
    Object.defineProperty(window, 'scrollY', { value: 60, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(header.style.boxShadow).toContain('rgba(0,0,0,0.1)');
  });
});
