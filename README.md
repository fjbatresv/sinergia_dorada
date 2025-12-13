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

## 🗂 Estructura del Proyecto

```bash
content/
  ├─ site-content.json   # Textos, menús, banderas de secciones, héroe, testimonios, etc.
  └─ dogs.json           # Información del equipo canino (carrusel + modal)
assets/                  # Logos, fotos de perros y actividades
scripts/
  ├─ ui.js               # Menú móvil, header sticky
  ├─ content.js          # Carga del JSON, render dinámico de secciones
  └─ dogs.js             # Carrusel y modal del equipo
  └─ copy-vendor.js      # Copia vendors (Font Awesome, wordcloud) a assets/vendor
styles/
  ├─ base.css            # Variables, reset, header, utilidades
  ├─ hero.css            # Estilos del collage principal
  └─ sections.css        # Resto de secciones y responsive
dist/vendor/             # Font Awesome + wordcloud servidos localmente (sin cookies 3rd-party)
dist/                    # Bundles minificados (IIFE) + sourcemaps generados por build
.github/workflows/       # CI/CD (deploy a S3 + CloudFront)
index.html               # Layout principal
```

## 🔧 Personalización de Contenido

1. **Menú, títulos y CTA** se gestionan en `content/site-content.json` (`navigation`, `sectionsContent`, `hero.ctaText/ctaLink`).
2. **Banderas**: en `sections` puedes activar/desactivar bloques completos sin tocar el HTML (`true` / `false`).
3. **Hero collage**: agrega/quita objetos dentro de `hero.floatingItems` (`image`, `alt`, `type: "dog" | "activity"`).
4. **Estadísticas, aliados, testimonios y redes** también viven en `site-content.json`.
5. **Equipo canino**: edita `content/dogs.json` (nombre, raza, foto, descripción, IG, etc.).

## 🚀 Ejecución Local

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone https://github.com/fjbatresv/sinergia_dorada.git
   cd sinergia_dorada
   ```

2. Levanta un servidor estático (para que `fetch` lea los JSON):

   ```bash
   # Opción 1
   python3 -m http.server 8000

   # Opción 2
   npx serve
   ```

3. Abre `http://localhost:8000` (o el puerto que corresponda).

> ⚠️ Abrir `index.html` con `file://` bloqueará la carga del contenido dinámico por CORS. Usa siempre un servidor local.

## 🧪 Comandos de calidad

- `npm run lint` — ESLint sobre `scripts/**/*.js`.
- `npm run format:check` — Prettier.
- `npm run validate:html` — html-validate.
- `npm run check:links` — Linkinator sirviendo la web en localhost (requiere poder abrir un puerto; en algunos entornos locales puede bloquearse).
- `npm run test` — suite de Vitest.
- `npm run test:coverage` — cobertura (≈92% statements / 80% branches sobre `content.js`, `dogs.js`, `ui.js`; se excluyen solo scripts de build/Sentry).
- `npm run test:axe` — smoke de accesibilidad (axe-core) sobre `index.html`.
- `npm run build` — copia vendors a `assets/vendor` y genera bundles en `dist/` (IIFE + sourcemaps).

## 📦 Despliegue (CI/CD)

El flujo definido en `.github/workflows/deploy.yml`:

1. Sube la versión compilada al bucket de **AWS S3**.
2. Ejecuta una invalidación en **CloudFront** para propagar los cambios.
3. Publica release en GitHub (tag auto-incremental) y sube sourcemaps a Sentry.
4. Solo se publican `dist/*.js|*.map`, `assets/*`, `styles/*`, `content/*.json`; los HTML van con cache corto.

El flujo de PR (`.github/workflows/test.yml`) corre lint, formato, validación de HTML, chequeo de links, tests con cobertura y un smoke de accesibilidad.

### Configuración en GitHub

1. Ve a `Settings > Secrets and variables > Actions`.
2. Crea los siguientes **Secrets**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `SENTRY_AUTH_TOKEN` (token personal con `project:write`, `release:admin`, `organization:read`)
   - `SENTRY_DSN` (se inyecta en el deploy para no versionarlo)
3. Agrega las **Variables**:
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_ENVIRONMENT` (ej. `production`)
4. En `Settings > Actions > General`, habilita **Workflow permissions → Read and write** para que `GITHUB_TOKEN` pueda crear releases.

### Sentry

- El DSN se deja como placeholder en `index.html` y se inyecta en CI desde `SENTRY_DSN`.
- El release se inyecta en CI con el SHA y sourcemaps (dist/\*.map) se suben a Sentry.
- Sentry y vendors externos (Font Awesome, WordCloud) se sirven de `assets/vendor` para evitar cookies/terceros.
- En tests se omite Sentry para que no afecte la cobertura ni el runtime.

## ℹ️ Notas

- `check:links` levanta un servidor en `localhost:4173`; si tu entorno bloquea la apertura de puertos (p. ej. con restricciones de SO), ejecuta un server manual (`npx serve -l 4173`) antes de correr el comando.
- El build genera bundles IIFE en `dist/`; los scripts fuente quedan sin tocar para desarrollo y tests.
- Si usas un registry privado en local, forzar el público: `npm ci --registry=https://registry.npmjs.org`.

## ❤️ Créditos

- Diseño y desarrollo: **Javier Batres**.
- Ilustraciones/Fotografía: equipo de Sinergia Dorada.

Hecho con amor por y para los amigos peludos de **Sinergia Dorada**.
