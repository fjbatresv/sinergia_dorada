import { describe, it, expect, vi } from 'vitest';
import * as dogsModule from '../scripts/dogs.js';
import {
  createDogCard,
  showDogModal,
  getModalElements,
  checkInfiniteScroll,
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
});
