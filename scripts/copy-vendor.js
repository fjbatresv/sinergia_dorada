/* eslint-env node */
/* global process */
import { cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '..');
const distVendor = join(projectRoot, 'dist', 'vendor');

function copyFontAwesome() {
  const faRoot = join(
    projectRoot,
    'node_modules',
    '@fortawesome',
    'fontawesome-free'
  );
  const destCss = join(distVendor, 'fontawesome', 'css');
  const destFonts = join(distVendor, 'fontawesome', 'webfonts');
  mkdirSync(destCss, { recursive: true });
  mkdirSync(destFonts, { recursive: true });
  cpSync(join(faRoot, 'css', 'all.min.css'), join(destCss, 'all.min.css'));
  cpSync(join(faRoot, 'webfonts'), destFonts, { recursive: true });
}

function copyWordCloud() {
  const src = join(
    projectRoot,
    'node_modules',
    'wordcloud',
    'src',
    'wordcloud2.js'
  );
  const destDir = join(distVendor, 'wordcloud');
  mkdirSync(destDir, { recursive: true });
  cpSync(src, join(destDir, 'wordcloud2.js'));
}

try {
  copyFontAwesome();
  copyWordCloud();
  console.log('Vendor assets copied to dist/vendor');
} catch (err) {
  console.error('Error copying vendor assets', err);
  process.exit(1);
}
