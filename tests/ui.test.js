import { describe, it, expect, vi } from 'vitest';
import {
  setupNavMenu,
  toggleNav,
  closeNav,
  setupHeaderShadow
} from '../scripts/ui.js';

describe('toggleNav y closeNav', () => {
  it('no explota si falta el nav', () => {
    const icon = document.createElement('i');
    toggleNav(null, icon);
    expect(icon.classList.contains('fa-times')).toBe(false);
  });

  it('si falta ícono solo alterna nav', () => {
    const nav = document.createElement('nav');
    toggleNav(nav, null);
    expect(nav.classList.contains('active')).toBe(true);
  });

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
  it('omite listeners cuando faltan referencias', () => {
    const menuBtn = document.createElement('button');
    expect(() =>
      setupNavMenu({ menuBtn, nav: null, navList: null })
    ).not.toThrow();
    menuBtn.click();
  });

  it('abre con el botón y cierra al hacer click en un enlace', () => {
    document.body.innerHTML = `
      <button class="mobile-menu-btn"><i class="fa-bars"></i></button>
      <nav class="nav"></nav>
      <ul id="nav-list" class="nav-list">
        <li><a class="nav-link" href="#inicio">Inicio</a></li>
      </ul>
    `;

    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navList = document.getElementById('nav-list');

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

  it('usa estilo ligero cuando no hay scroll', () => {
    const header = document.createElement('header');
    setupHeaderShadow(header);
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(header.style.backgroundColor).toContain('0.95');
  });
});

describe('auto-inicialización', () => {
  it('se enlaza a DOMContentLoaded cuando el documento está cargando', async () => {
    vi.resetModules();
    const addEventSpy = vi.spyOn(document, 'addEventListener');
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      configurable: true
    });
    document.body.innerHTML = `
      <button class="mobile-menu-btn"><i class="fa-bars"></i></button>
      <nav class="nav"></nav>
      <ul id="nav-list" class="nav-list"></ul>
      <header class="header"></header>
    `;

    await import('../scripts/ui.js');

    expect(addEventSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );
    addEventSpy.mockRestore();
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true
    });
  });
});
