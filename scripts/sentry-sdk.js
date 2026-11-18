// Bundle local del SDK de Sentry (versionado por package-lock.json).
// scripts/sentry.js lo carga de forma diferida desde dist/sentry-sdk.js.
// Solo se exponen las APIs que usa sentry.js para mantener el bundle pequeño.
import {
  browserTracingIntegration,
  init,
  replayIntegration
} from '@sentry/browser';

globalThis.Sentry = { browserTracingIntegration, init, replayIntegration };
