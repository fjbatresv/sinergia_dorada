import { copyFile, mkdir } from 'node:fs/promises';

const fonts = [
  [
    '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2',
    'fraunces-latin.woff2'
  ],
  [
    '@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2',
    'fraunces-latin-italic.woff2'
  ],
  [
    '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2',
    'schibsted-grotesk-latin.woff2'
  ],
  [
    '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
    'ibm-plex-mono-latin.woff2'
  ]
];

await mkdir('portfolio/fonts', { recursive: true });
await Promise.all(
  fonts.map(([source, target]) =>
    copyFile(`node_modules/${source}`, `portfolio/fonts/${target}`)
  )
);
