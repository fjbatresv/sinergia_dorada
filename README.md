# Sinergia Dorada Website

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/fjbatresv/sinergia_dorada?utm_source=oss&utm_medium=github&utm_campaign=fjbatresv%2Fsinergia_dorada&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?logo=amazonaws&logoColor=white)
![CloudFront](https://img.shields.io/badge/CloudFront-8C4FFF?logo=amazonaws&logoColor=white)
![Tests](https://img.shields.io/badge/tests-vitest-green)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fjbatresv_sinergia_dorada&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fjbatresv_sinergia_dorada)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fjbatresv_sinergia_dorada&metric=coverage)](https://sonarcloud.io/summary/new_code?id=fjbatresv_sinergia_dorada)

Sitio oficial de **Sinergia Dorada**, una iniciativa sin fines de lucro que lleva terapia asistida con perros a hospitales, centros educativos y empresas en Guatemala.

## ✨ Características Clave

- **Contenido dinámico**: todos los textos, métricas, testimonios, aliados y el collage del hero se controlan desde archivos JSON en `content/`.
- **Componentización ligera**: CSS y JS divididos por responsabilidad (`styles/` y `scripts/`) para escalar fácilmente.
- **Experiencias interactivas**: collage animado, carrusel infinito del equipo canino, testimonios, contadores y modal con detalles.
- **Sin dependencias pesadas**: HTML + CSS + JavaScript vanilla, ideal para hosting estático (S3, Netlify, GH Pages, etc.).
- **Cobertura y calidad en CI**: Vitest + cobertura (statements/branches >80%), ESLint, Prettier y chequeos de accesibilidad ejecutados en PRs.

## 🗂 Estructura del Proyecto

```bash
content/
  ├─ site-content.json   # Textos, menús, banderas de secciones, héroe, testimonios, etc.
  └─ dogs.json           # Información del equipo canino (carrusel + modal)
assets/                  # Logos, fotos de perros y actividades
scripts/
  ├─ ui.js               # Menú móvil, header sticky
  ├─ content.js          # Carga del JSON, render dinámico de secciones
  ├─ dogs.js             # Carrusel y modal del equipo
  ├─ sentry.js           # Inicialización diferida de Sentry
  ├─ sentry-sdk.js       # Bundle local del SDK de Sentry (sin CDN)
  └─ copy-vendor.js      # Copia vendors (Font Awesome, wordcloud) a dist/vendor
styles/
  ├─ base.css            # Variables, reset, header, utilidades
  ├─ hero.css            # Estilos del collage principal
  └─ sections.css        # Resto de secciones y responsive
dist/vendor/             # Font Awesome + wordcloud servidos localmente (sin cookies 3rd-party)
dist/                    # Bundles minificados (IIFE) + sourcemaps generados por build
.github/workflows/       # CI/CD (deploy a S3 + CloudFront)
index.html               # Layout principal
robots.txt / sitemap.xml # SEO: indexación y mapa del sitio
404.html                 # Página de error que CloudFront sirve en rutas inexistentes (noindex)
```

## 🔧 Personalización de Contenido

1. **Menú, títulos y CTA** se gestionan en `content/site-content.json` (`navigation`, `sectionsContent`, `hero.ctaText/ctaLink`).
2. **Banderas**: en `sections` puedes activar/desactivar bloques completos sin tocar el HTML (`true` / `false`).
3. **Hero collage**: agrega/quita objetos dentro de `hero.floatingItems` (`image`, `alt`, `type: "dog" | "activity"`).
4. **Estadísticas, aliados, testimonios y redes** también viven en `site-content.json`.
5. **Equipo canino**: edita `content/dogs.json` (nombre, raza, foto, descripción, IG, etc.).
6. **Imágenes nuevas**: súbelas en **WebP**, con nombre en minúsculas y guiones (`assets/dogs/nombre.webp`). Redimensiona fotos a 800 px de lado máximo y logos de aliados a 400 px. Por ejemplo, con `cwebp`:

   ```bash
   cwebp -q 80 -m 6 -resize 800 0 -metadata none foto.jpg -o assets/activities/actividad-AAAA-MM-DD.webp
   ```

   El deploy no recodifica los WebP; solo optimiza los JPG/PNG que quedan (`logo.jpg` para JSON-LD, `og-image.jpg` para redes y `icono.jpg` como favicon).

## 🚀 Ejecución Local

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone https://github.com/fjbatresv/sinergia_dorada.git
   cd sinergia_dorada
   ```

2. Instala dependencias y genera `dist/` (`index.html` carga los bundles y los vendors desde ahí):

   ```bash
   npm ci
   npm run build
   ```

3. Levanta un servidor estático (para que `fetch` lea los JSON):

   ```bash
   # Opción 1
   python3 -m http.server 8000

   # Opción 2
   npx serve
   ```

4. Abre `http://localhost:8000` (o el puerto que corresponda).

> ⚠️ Abrir `index.html` con `file://` bloqueará la carga del contenido dinámico por CORS. Usa siempre un servidor local.

## 🧪 Comandos de calidad

- `npm run lint` — ESLint sobre `scripts/**/*.js`.
- `npm run format:check` — Prettier.
- `npm run validate:html` — html-validate sobre `index.html` y `404.html`.
- `npm run check:links` — verifica que cada `href`/`src` local de `index.html` y `404.html` exista en disco (las rutas `/...` se resuelven contra la raíz del repo) (requiere `npm run build` antes, porque referencia `dist/`).
- `npm run test` — suite de Vitest.
- `npm run test:coverage` — cobertura (≈92% statements / 80% branches sobre `content.js`, `dogs.js`, `ui.js`; se excluyen solo scripts de build/Sentry).
- `npm run test:axe` — smoke de accesibilidad (axe-core) sobre `index.html` y `404.html`.
- `npm run build` — copia vendors a `dist/vendor` y genera bundles en `dist/` (IIFE + sourcemaps).
- Hooks locales: Husky ejecuta `lint-staged` en el pre-commit (ESLint, Prettier y tests rápidos sobre archivos staged).

## 📦 Despliegue (CI/CD)

El flujo definido en `.github/workflows/deploy.yml`:

1. Corre en el environment `production` (solo `main`), un deploy a la vez (`concurrency`).
2. Compila, inyecta DSN y release de Sentry en `index.html`, valida y sube sourcemaps a Sentry.
3. Sube a **AWS S3** con caché por tipo: `assets/`, `docs/`, `dist/vendor/` 7 días; `dist/*.js`, `styles/`, `content/` 5 minutos con revalidación; `index.html`, `404.html`, `robots.txt` y `sitemap.xml` 60 s. Los sourcemaps **no** se publican en S3 (solo en Sentry). Ningún archivo es `immutable` porque los nombres no llevan hash; en su lugar, el deploy agrega `?v=<sha>` a las URLs de JS/CSS en `index.html` (cache busting).
4. Invalida **CloudFront** y publica un release en GitHub (tag auto-incremental).

El flujo de PR (`.github/workflows/test.yml`) corre lint, formato, validación de HTML, chequeo de links, tests con cobertura y un smoke de accesibilidad. Los jobs `lint` y `test` son checks obligatorios para mergear a `main`.

Todas las actions están fijadas por SHA (Dependabot las actualiza) y los workflows usan `GITHUB_TOKEN` de solo lectura salvo el deploy, que necesita `contents: write` para el release. SonarCloud se omite en PRs de Dependabot y de forks (no tienen acceso a `SONAR_TOKEN`).

### Configuración en GitHub

1. Ve a `Settings > Secrets and variables > Actions`.
2. Crea los siguientes **Secrets** (preferiblemente en el environment `production`, en `Settings > Environments`; `SONAR_TOKEN` va a nivel de repositorio):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SENTRY_AUTH_TOKEN` (token personal con `project:write`, `release:admin`, `organization:read`)
   - `SENTRY_DSN` (se inyecta en el deploy para no versionarlo)
   - `SONAR_TOKEN`
3. Agrega las **Variables**:
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_ENVIRONMENT` (ej. `production`)
4. En `Settings > Actions > General`, deja **Workflow permissions → Read repository contents**; el workflow de deploy pide `contents: write` explícitamente.

### Sentry

- El DSN se deja como placeholder en `index.html` y se inyecta en CI desde `SENTRY_DSN`.
- El release (SHA del commit) también se inyecta en `index.html` en CI y los sourcemaps (dist/\*.map) se suben a Sentry.
- El SDK de Sentry se empaqueta desde `@sentry/browser` (`scripts/sentry-sdk.js` → `dist/sentry-sdk.js`), versionado por el lockfile; no se descarga de ningún CDN.
- Font Awesome y WordCloud se sirven desde `dist/vendor` para evitar cookies/terceros.
- En tests se omite Sentry para que no afecte la cobertura ni el runtime.

## 🔒 Seguridad

Consulta [SECURITY.md](SECURITY.md) para reportar vulnerabilidades de forma privada.

## ℹ️ Notas

- El build genera bundles IIFE en `dist/`; los scripts fuente quedan sin tocar para desarrollo y tests.
- Si usas un registry privado en local, forzar el público: `npm ci --registry=https://registry.npmjs.org`.
- El menú móvil espera un `<ul id="nav-list" class="nav-list">` para alinearse con los selectores usados en `content.js` y `ui.js`.
- La inicialización de Sentry registra errores y los traga (no rompe la ejecución); en entornos de prueba se omite.

## ❤️ Créditos

- Diseño y desarrollo: **Javier Batres**.
- Ilustraciones/Fotografía: equipo de Sinergia Dorada.

Hecho con amor por y para los amigos peludos de **Sinergia Dorada**.
