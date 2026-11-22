import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import fs from 'node:fs';
import path from 'node:path';

describe('Accesibilidad básica', () => {
  it.each([
    'index.html',
    '404.html',
    'portfolio/index.html',
    'portfolio/es/index.html',
    'portfolio/404.html'
  ])('%s no reporta violaciones de axe', async (page) => {
    const htmlPath = path.join(process.cwd(), page);
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;

    // Inyecta axe en jsdom
    window.eval(axe.source);

    const results = await window.axe.run(window.document, {
      // Reduce falsos positivos en contenido estático
      rules: {
        'color-contrast': { enabled: false }
      }
    });

    expect(results.violations).toEqual([]);
  });
});
