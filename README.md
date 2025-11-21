# Sinergia Dorada Website

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/fjbatresv/sinergia_dorada?utm_source=oss&utm_medium=github&utm_campaign=fjbatresv%2Fsinergia_dorada&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?logo=amazonaws&logoColor=white)
![CloudFront](https://img.shields.io/badge/CloudFront-8C4FFF?logo=amazonaws&logoColor=white)


Sitio oficial de **Sinergia Dorada**, una iniciativa sin fines de lucro que lleva terapia asistida con perros a hospitales, centros educativos y empresas en Guatemala.

## ✨ Características Clave

- **Contenido dinámico**: todos los textos, métricas, testimonios, aliados y el collage del hero se controlan desde archivos JSON en `content/`.
- **Componentización ligera**: CSS y JS divididos por responsabilidad (`styles/` y `scripts/`) para escalar fácilmente.
- **Experiencias interactivas**: collage animado, carrusel infinito del equipo canino, testimonios, contadores y modal con detalles.
- **Sin dependencias pesadas**: HTML + CSS + JavaScript vanilla, ideal para hosting estático (S3, Netlify, GH Pages, etc.).

## 🗂 Estructura del Proyecto

```
content/
  ├─ site-content.json   # Textos, menús, banderas de secciones, héroe, testimonios, etc.
  └─ dogs.json           # Información del equipo canino (carrusel + modal)
assets/                  # Logos, fotos de perros y actividades
scripts/
  ├─ ui.js               # Menú móvil, header sticky
  ├─ content.js          # Carga del JSON, render dinámico de secciones
  └─ dogs.js             # Carrusel y modal del equipo
styles/
  ├─ base.css            # Variables, reset, header, utilidades
  ├─ hero.css            # Estilos del collage principal
  └─ sections.css        # Resto de secciones y responsive
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

## 📦 Despliegue (CI/CD)

El flujo definido en `.github/workflows/deploy.yml`:
1. Sube la versión compilada al bucket de **AWS S3**.
2. Ejecuta una invalidación en **CloudFront** para propagar los cambios.

### Configuración en GitHub

1. Ve a `Settings > Secrets and variables > Actions`.
2. Crea los siguientes **Secrets**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
3. Agrega las **Variables**:
   - `AWS_S3_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`
4. En `Settings > Actions > General`, habilita **Workflow permissions → Read and write** para que `GITHUB_TOKEN` pueda crear releases.

## ❤️ Créditos

- Diseño y desarrollo: **Javier Batres**.
- Ilustraciones/Fotografía: equipo de Sinergia Dorada.

Hecho con amor por y para los amigos peludos de **Sinergia Dorada**.
