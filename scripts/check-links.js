/* eslint-env node */
/* global process */
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(process.cwd());
const SHOULD_SKIP = [
  'http://',
  'https://',
  'mailto:',
  'tel:',
  'javascript:',
  'data:',
  '//',
  '#'
];

const selectors = [
  { selector: 'a[href]', attr: 'href' },
  { selector: 'link[href]', attr: 'href' },
  { selector: 'script[src]', attr: 'src' },
  { selector: 'img[src]', attr: 'src' }
];

function shouldSkipLink(value) {
  if (!value) return true;
  const trimmed = value.trim();
  if (trimmed === '') return true;
  return SHOULD_SKIP.some((prefix) => trimmed.startsWith(prefix));
}

// Páginas publicadas cuyos enlaces locales se verifican
const PAGES = ['index.html', '404.html'];

function resolvePath(baseHtml, urlValue) {
  try {
    // Las rutas absolutas ("/styles/base.css") se resuelven contra la raíz del
    // sitio, no contra la raíz del sistema de archivos
    const isRootRelative = urlValue.startsWith('/');
    const base = new URL(`file://${isRootRelative ? `${ROOT}/` : baseHtml}`);
    const resolved = new URL(isRootRelative ? `.${urlValue}` : urlValue, base);
    if (resolved.protocol !== 'file:') {
      return null;
    }
    return path.normalize(decodeURIComponent(resolved.pathname));
  } catch {
    return null;
  }
}

async function fileExists(resourcePath) {
  try {
    await fs.access(resourcePath);
    return true;
  } catch {
    return false;
  }
}
async function checkPage(page, issues, checks) {
  const htmlPath = path.join(ROOT, page);
  const html = await fs.readFile(htmlPath, 'utf8');
  const dom = new JSDOM(html, { url: `file://${htmlPath}` });

  selectors.forEach(({ selector, attr }) => {
    dom.window.document.querySelectorAll(selector).forEach((node) => {
      const value = node.getAttribute(attr);
      if (shouldSkipLink(value)) {
        return;
      }
      const resolved = resolvePath(htmlPath, value);
      if (!resolved) {
        issues.push({ page, selector, attr, value, reason: 'invalid URL' });
        return;
      }
      const absoluteResolved = path.resolve(resolved);
      const relativeToRoot = path.relative(ROOT, absoluteResolved);
      if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        issues.push({
          page,
          selector,
          attr,
          value,
          reason: 'escaped root',
          path: absoluteResolved
        });
        return;
      }
      checks.push(
        (async () => {
          if (!(await fileExists(absoluteResolved))) {
            issues.push({
              page,
              selector,
              attr,
              value,
              path: absoluteResolved
            });
          }
        })()
      );
    });
  });
}

async function main() {
  const issues = [];
  const checks = [];

  for (const page of PAGES) {
    await checkPage(page, issues, checks);
  }

  await Promise.all(checks);

  if (issues.length > 0) {
    console.error('Broken local links detected:');
    issues.forEach((issue) => {
      const reason = issue.reason ? ` ${issue.reason}` : '';
      console.error(
        `- ${issue.page}: ${issue.selector}[${issue.attr}]="${issue.value}"${reason} -> ${issue.path ?? ''}`.trim()
      );
    });
    process.exit(1);
  }

  console.log('Local link check passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
