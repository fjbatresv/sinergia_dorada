/* eslint-env node */
/* global process */
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
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

function resolvePath(baseHtml, urlValue) {
  try {
    const base = new URL(`file://${baseHtml}`);
    const resolved = new URL(urlValue, base);
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
async function main() {
  const htmlPath = path.join(ROOT, 'index.html');
  const html = await fs.readFile(htmlPath, 'utf8');
  const dom = new JSDOM(html, { url: `file://${htmlPath}` });
  const issues = [];
  const checks = [];

  selectors.forEach(({ selector, attr }) => {
    dom.window.document.querySelectorAll(selector).forEach((node) => {
      const value = node.getAttribute(attr);
      if (shouldSkipLink(value)) {
        return;
      }
      const resolved = resolvePath(htmlPath, value);
      if (!resolved) {
        issues.push({ selector, attr, value, reason: 'invalid URL' });
        return;
      }
      if (!resolved.startsWith(ROOT)) {
        issues.push({
          selector,
          attr,
          value,
          reason: 'escaped root',
          path: resolved
        });
        return;
      }
      checks.push(
        (async () => {
          if (!(await fileExists(resolved))) {
            issues.push({ selector, attr, value, path: resolved });
          }
        })()
      );
    });
  });

  await Promise.all(checks);

  if (issues.length > 0) {
    console.error('Broken local links detected:');
    issues.forEach((issue) => {
      const reason = issue.reason ? ` ${issue.reason}` : '';
      console.error(
        `- ${issue.selector}[${issue.attr}]="${issue.value}"${reason} -> ${issue.path ?? ''}`.trim()
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
