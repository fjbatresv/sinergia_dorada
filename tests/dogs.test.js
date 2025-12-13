import { waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import * as dogsModule from '../scripts/dogs.js';
import {
  createDogCard,
  checkInfiniteScroll,
  showDogModal,
  getModalElements,
  hideDogModal,
  updateDimensions,
  startAutoScroll,
  initDogs,
  setupDogsCarousel
} from '../scripts/dogs.js';

describe('createDogCard', () => {
  it('renders dog data and wires click handler', () => {
    const dog = { image: '/img/dog.png', name: 'Brie', breed: 'Labrador' };
    const onOpen = vi.fn();

    const card = createDogCard(dog, onOpen);

    expect(card.querySelector('img').src).toContain(dog.image);
    expect(card.querySelector('h3').textContent).toBe('Brie');
    card.click();
    expect(onOpen).toHaveBeenCalledWith(dog);
  });

  it('devuelve src vacío cuando no hay imagen disponible', () => {
    const card = createDogCard({ name: 'Brie', breed: 'Labrador' }, () => {});

    expect(card.querySelector('img').getAttribute('src')).toBeNull();
  });
});

describe('updateDimensions', () => {
  it('calcula cardWidth y singleSetWidth basado en offsetWidth', () => {
    const track = document.createElement('div');
    const card = document.createElement('div');
    Object.defineProperty(card, 'offsetWidth', {
      value: 120,
      configurable: true
    });
    card.className = 'team-card';
    track.appendChild(card);

    const { cardWidth, singleSetWidth } = updateDimensions(track, 3, 10);

    expect(cardWidth).toBe(130);
    expect(singleSetWidth).toBe(390);
  });

  it('retorna undefined si no hay tarjetas', () => {
    const track = document.createElement('div');
    const result = updateDimensions(track, 2, 10);
    expect(result.cardWidth).toBeUndefined();
    expect(result.singleSetWidth).toBeUndefined();
  });
});

describe('startAutoScroll', () => {
  it('incrementa scroll automáticamente y se puede detener', () => {
    vi.useFakeTimers();
    const track = document.createElement('div');
    Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true });

    const stop = startAutoScroll(
      track,
      () => 50,
      () => false,
      2
    );

    vi.advanceTimersByTime(60); // ~3 ticks
    expect(track.scrollLeft).toBeGreaterThanOrEqual(6);

    const current = track.scrollLeft;
    stop();
    vi.advanceTimersByTime(60);
    expect(track.scrollLeft).toBe(current);
    vi.useRealTimers();
  });

  it('respeta el estado hover y no avanza', () => {
    vi.useFakeTimers();
    const track = document.createElement('div');
    Object.defineProperty(track, 'scrollLeft', { value: 0, writable: true });
    let hovered = true;

    startAutoScroll(
      track,
      () => 50,
      () => hovered,
      2
    );

    vi.advanceTimersByTime(60);
    expect(track.scrollLeft).toBe(0);

    hovered = false;
    vi.advanceTimersByTime(60);
    expect(track.scrollLeft).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('no avanza si no hay ancho calculado', () => {
    vi.useFakeTimers();
    const track = document.createElement('div');
    Object.defineProperty(track, 'scrollLeft', { value: 5, writable: true });

    startAutoScroll(
      track,
      () => undefined,
      () => false,
      3
    );

    vi.advanceTimersByTime(40);
    expect(track.scrollLeft).toBe(5);
    vi.useRealTimers();
  });
});

describe('showDogModal', () => {
  it('pinta los datos y controla secciones opcionales', () => {
    document.body.innerHTML = `
      <div id="dog-modal"></div>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <div id="modal-color-container"><span id="modal-color"></span></div>
      <div id="modal-birthdate-container"><span id="modal-birthdate"></span></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    const elements = getModalElements(document);
    const dog = {
      image: '/img.png',
      name: 'Mohana',
      breed: 'Mestizo',
      color: 'Café',
      birthdate: '2020-01-01',
      description: ['Linea 1', 'Linea 2'],
      instagram: 'https://example.com'
    };

    showDogModal(dog, elements, document);

    expect(elements.modal).toHaveClass('show');
    expect(elements.modalName.textContent).toBe('Mohana');
    expect(elements.modalColorContainer.style.display).toBe('block');
    expect(elements.modalInsta.style.display).toBe('inline-flex');
    expect(elements.modalDesc.innerHTML).toContain('Linea 1');
  });

  it('maneja campos faltantes y usa mensajes por defecto', () => {
    document.body.innerHTML = `
      <div id="dog-modal"></div>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <div id="modal-color-container"><span id="modal-color"></span></div>
      <div id="modal-birthdate-container"><span id="modal-birthdate"></span></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    const elements = getModalElements(document);
    showDogModal({ name: 'Sin IG', description: '' }, elements, document);

    expect(elements.modalColorContainer.style.display).toBe('none');
    expect(elements.modalBirthdateContainer.style.display).toBe('none');
    expect(elements.modalInsta.style.display).toBe('none');
    expect(elements.modalDesc.textContent).toContain(
      'Sin descripción disponible'
    );
  });

  it('renderiza descripción cuando es string', () => {
    document.body.innerHTML = `
      <div id="dog-modal"></div>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <div id="modal-color-container"><span id="modal-color"></span></div>
      <div id="modal-birthdate-container"><span id="modal-birthdate"></span></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;
    const elements = getModalElements(document);
    showDogModal(
      {
        name: 'Luna',
        breed: 'Mix',
        description: 'Una perrita feliz',
        instagram: 'https://instagram.com/luna'
      },
      elements,
      document
    );

    expect(elements.modalDesc.textContent).toContain('Una perrita feliz');
    expect(elements.modalInsta.style.display).toBe('inline-flex');
  });
});

describe('hideDogModal', () => {
  it('cierra el modal y devuelve el scroll del body', () => {
    document.body.innerHTML = `
      <div id="dog-modal" class="show"></div>
    `;
    document.body.style.overflow = 'hidden';
    const elements = { modal: document.getElementById('dog-modal') };

    hideDogModal(elements, document);

    expect(elements.modal.classList.contains('show')).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });
});

describe('checkInfiniteScroll', () => {
  it('aplica wrap al mover el carrusel', () => {
    const track = document.createElement('div');
    track.scrollLeft = 250;

    const resultForward = checkInfiniteScroll(track, 100);
    expect(resultForward).toBe(150);

    track.scrollLeft = -10;
    const resultBack = checkInfiniteScroll(track, 100);
    expect(resultBack).toBe(90);
  });

  it('devuelve scroll actual cuando faltan argumentos', () => {
    expect(checkInfiniteScroll(null, 100)).toBe(0);
    const track = { scrollLeft: 10 };
    expect(checkInfiniteScroll(track, null)).toBe(10);
  });
});

describe('initDogs', () => {
  it('renderiza tarjetas, calcula scroll y maneja botones/modal', async () => {
    vi.useFakeTimers();
    const dogs = [
      { image: 'a.png', name: 'A', breed: 'B' },
      { image: 'c.png', name: 'C', breed: 'D' }
    ];
    document.body.innerHTML = `
      <div id="carousel-track"></div>
      <button id="prev-btn"></button>
      <button id="next-btn"></button>
      <div id="dog-modal"></div>
      <span class="close-modal"></span>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <span id="modal-color"></span><div id="modal-color-container"></div>
      <span id="modal-birthdate"></span><div id="modal-birthdate-container"></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    const track = document.getElementById('carousel-track');
    track.scrollBy = vi.fn(({ left }) => {
      track.scrollLeft += left;
    });

    const startAutoScrollMock = vi.fn().mockReturnValue(() => {});
    setupDogsCarousel({
      track,
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      dogs,
      modalElements: getModalElements(document),
      startAutoScrollFn: startAutoScrollMock
    });

    const cards = track.querySelectorAll('.team-card');
    expect(cards.length).toBe(6); // 2 sets + 1 reversed set

    Object.defineProperty(cards[0], 'offsetWidth', {
      value: 120,
      configurable: true
    });

    vi.advanceTimersByTime(120); // setTimeout recalc + auto scroll
    const initialScroll = track.scrollLeft;
    expect(initialScroll).toBeGreaterThan(0);

    document.getElementById('next-btn').click();
    expect(track.scrollBy).toHaveBeenCalled();

    // Abrir y cerrar modal
    cards[0].click();
    expect(
      document.getElementById('dog-modal').classList.contains('show')
    ).toBe(true);
    document
      .getElementById('dog-modal')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(
      document.getElementById('dog-modal').classList.contains('show')
    ).toBe(false);

    vi.useRealTimers();
  });

  it('usa fetch exitoso y crea el carrusel', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([{ name: 'F', breed: 'G' }])
    });

    document.body.innerHTML = `
      <div id="carousel-track"></div>
      <button id="prev-btn"></button>
      <button id="next-btn"></button>
      <div id="dog-modal"></div>
      <span class="close-modal"></span>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <span id="modal-color"></span><div id="modal-color-container"></div>
      <span id="modal-birthdate"></span><div id="modal-birthdate-container"></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    await dogsModule.initDogs();
    expect(global.fetch).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        document.querySelectorAll('#carousel-track .team-card').length
      ).toBeGreaterThan(0);
    });

    global.fetch = originalFetch;
  });

  it('usa fallback local cuando fetch falla', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const consoleInfoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    document.body.innerHTML = `
      <div id="carousel-track"></div>
      <button id="prev-btn"></button>
      <button id="next-btn"></button>
      <div id="dog-modal"></div>
      <span class="close-modal"></span>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <span id="modal-color"></span><div id="modal-color-container"></div>
      <span id="modal-birthdate"></span><div id="modal-birthdate-container"></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    dogsModule.initDogs();

    await waitFor(() => {
      expect(
        document.querySelectorAll('#carousel-track .team-card').length
      ).toBeGreaterThan(0);
    });

    global.fetch = originalFetch;
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  it('retorna cleanup y libera listeners/auto-scroll', () => {
    vi.useFakeTimers();
    const dogs = [{ name: 'X', breed: 'Y' }];
    document.body.innerHTML = `
      <div id="carousel-track"></div>
      <button id="prev-btn"></button>
      <button id="next-btn"></button>
      <div id="dog-modal"></div>
      <span class="close-modal"></span>
      <img id="modal-img">
      <div id="modal-name"></div>
      <div id="modal-breed"></div>
      <span id="modal-color"></span><div id="modal-color-container"></div>
      <span id="modal-birthdate"></span><div id="modal-birthdate-container"></div>
      <div id="modal-desc"></div>
      <a id="modal-insta"></a>
    `;

    const startAutoScrollMock = vi.fn().mockReturnValue(vi.fn());
    const track = document.getElementById('carousel-track');
    const cleanup = setupDogsCarousel({
      track,
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      dogs,
      modalElements: getModalElements(document),
      startAutoScrollFn: startAutoScrollMock
    });

    window.dispatchEvent(new Event('resize'));
    track.dispatchEvent(new Event('mouseenter'));
    track.dispatchEvent(new Event('mouseleave'));
    document.dispatchEvent(new Event('click', { bubbles: true }));
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));

    cleanup?.();
    expect(startAutoScrollMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('retorna temprano cuando no existe el track', () => {
    document.body.innerHTML = '';
    expect(() => dogsModule.initDogs()).not.toThrow();
  });
});

describe('defensivos adicionales', () => {
  it('createDogCard ignora URLs no seguras', () => {
    const card = createDogCard(
      { image: 'ftp://example.com/img.png', name: 'Pip' },
      () => {}
    );
    expect(card.querySelector('img').getAttribute('src')).toBeNull();
  });

  it('setupDogsCarousel sin datos retorna undefined', () => {
    expect(
      setupDogsCarousel({
        track: null,
        prevBtn: null,
        nextBtn: null,
        dogs: [],
        modalElements: {}
      })
    ).toBeUndefined();
  });
});
