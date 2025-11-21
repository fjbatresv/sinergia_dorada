const scriptWithDsn =
  typeof document !== 'undefined'
    ? document.currentScript ||
      document.querySelector('script[data-sentry-dsn][src*="sentry.js"]')
    : null;
const metaDsn =
  typeof document !== 'undefined'
    ? document.querySelector('meta[name="sentry-dsn"]')?.content
    : null;
const metaEnv =
  typeof document !== 'undefined'
    ? document.querySelector('meta[name="sentry-environment"]')?.content
    : null;
const metaRelease =
  typeof document !== 'undefined'
    ? document.querySelector('meta[name="sentry-release"]')?.content
    : null;

const dsn =
  (scriptWithDsn && scriptWithDsn.dataset.sentryDsn) ||
  (typeof window !== 'undefined' && window.SENTRY_DSN) ||
  metaDsn;
const environment =
  (scriptWithDsn && scriptWithDsn.dataset.sentryEnv) ||
  (typeof window !== 'undefined' && window.SENTRY_ENVIRONMENT) ||
  metaEnv ||
  'production';
const release =
  (scriptWithDsn && scriptWithDsn.dataset.sentryRelease) ||
  (typeof window !== 'undefined' && window.SENTRY_RELEASE) ||
  metaRelease ||
  '__SENTRY_RELEASE__';

const isTestEnv =
  (typeof window !== 'undefined' && window.__VITEST__) ||
  (typeof globalThis !== 'undefined' && globalThis.process?.env?.VITEST);

let loadingSdk;
const defaultSources = [
  (scriptWithDsn && scriptWithDsn.dataset.sentrySrc) ||
    'assets/sentry.bundle.tracing.replay.min.js',
  'https://browser.sentry-cdn.com/7.120.1/bundle.tracing.replay.min.js'
];

function loadSentrySdk() {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.Sentry) return Promise.resolve(window.Sentry);
  if (loadingSdk) return loadingSdk;

  loadingSdk = new Promise((resolve, reject) => {
    const tryNext = (sources, lastError) => {
      if (!sources.length) {
        reject(lastError || new Error('No se pudo cargar Sentry'));
        return;
      }
      const [src, ...rest] = sources;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (window.Sentry) {
          resolve(window.Sentry);
        } else {
          tryNext(rest, new Error('Sentry no se inicializó'));
        }
      };
      script.onerror = (err) => tryNext(rest, err);
      document.head.appendChild(script);
    };

    tryNext([...defaultSources]);
  });
  return loadingSdk;
}

async function initSentry() {
  if (!dsn || isTestEnv) return;
  try {
    const Sentry = await loadSentrySdk();
    if (!Sentry) return;

    const browserTracingIntegration = Sentry.browserTracingIntegration?.();
    const replayIntegration = Sentry.replayIntegration?.({
      maskAllText: false,
      blockAllMedia: false
    });

    Sentry.init({
      dsn,
      integrations: [browserTracingIntegration, replayIntegration].filter(
        Boolean
      ),
      environment,
      release: release !== '__SENTRY_RELEASE__' ? release : undefined,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      debug: true
    });
    if (typeof window !== 'undefined') {
      window.SENTRY_READY = true;
      console.info('Sentry inicializado');
    }
  } catch (err) {
    console.warn('Sentry no se inicializó', err);
  }
}

initSentry();
