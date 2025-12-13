const globalScope = typeof globalThis === 'undefined' ? undefined : globalThis;
const doc = globalScope?.document;
const win = globalScope?.window ?? globalScope;

const scriptWithDsn =
  doc?.currentScript ||
  doc?.querySelector('script[data-sentry-dsn][src*="sentry.js"]') ||
  null;
const metaDsn = doc?.querySelector('meta[name="sentry-dsn"]')?.content ?? null;
const metaEnv =
  doc?.querySelector('meta[name="sentry-environment"]')?.content ?? null;
const metaRelease =
  doc?.querySelector('meta[name="sentry-release"]')?.content ?? null;

const rawDsn = scriptWithDsn?.dataset?.sentryDsn ?? win?.SENTRY_DSN ?? metaDsn;
const dsn = typeof rawDsn === 'string' ? rawDsn.trim() : rawDsn;
const hasValidDsn = Boolean(dsn && dsn !== '__SENTRY_DSN__');
const environment =
  scriptWithDsn?.dataset?.sentryEnv ??
  win?.SENTRY_ENVIRONMENT ??
  metaEnv ??
  'production';
const release =
  scriptWithDsn?.dataset?.sentryRelease ??
  win?.SENTRY_RELEASE ??
  metaRelease ??
  '__SENTRY_RELEASE__';

const isTestEnv = Boolean(win?.__VITEST__ || globalScope?.process?.env?.VITEST);
const releaseOption = release === '__SENTRY_RELEASE__' ? undefined : release;
const shouldInitSentry = hasValidDsn && !isTestEnv;

let loadingSdk;
const defaultSources = [
  scriptWithDsn?.dataset?.sentrySrc ||
    'assets/sentry.bundle.tracing.replay.min.js',
  'https://browser.sentry-cdn.com/10.30.0/bundle.tracing.replay.min.js'
];

function loadSentrySdk() {
  if (!win || !doc) {
    return Promise.reject(new Error('No window/document available for Sentry'));
  }
  if (win.Sentry) return Promise.resolve(win.Sentry);
  if (loadingSdk) return loadingSdk;

  loadingSdk = new Promise((resolve, reject) => {
    const tryNext = (sources, lastError) => {
      if (sources.length === 0) {
        reject(lastError ?? new Error('No se pudo cargar Sentry'));
        return;
      }

      const [src, ...rest] = sources;
      const script = doc.createElement('script');
      if (!script) {
        reject(new Error('No se pudo crear el script de Sentry'));
        return;
      }

      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (win?.Sentry) {
          resolve(win.Sentry);
        } else {
          tryNext(rest, new Error('Sentry no se inicializó'));
        }
      };
      script.onerror = (error_) => tryNext(rest, error_);
      doc.head?.appendChild(script);
    };

    tryNext([...defaultSources]);
  });

  return loadingSdk;
}

async function initSentry() {
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
      release: releaseOption,
      tracesSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      debug: false
    });

    if (win) {
      win.SENTRY_READY = true;
    }
  } catch (error_) {
    console.warn('Sentry no se inicializó', error_);
  }
}

const sentryReady = shouldInitSentry ? initSentry() : Promise.resolve();

export { sentryReady };
