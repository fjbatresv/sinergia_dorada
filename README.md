# Sinergia Dorada Website

Este es el repositorio del sitio web oficial de **Sinergia Dorada**, un grupo sin fines de lucro dedicado a la terapia asistida con perros en Guatemala.

## 🛠 Tecnologías

- **HTML5**: Estructura semántica.
- **CSS3**: Estilos personalizados, diseño responsivo y animaciones (sin frameworks pesados).
- **JavaScript (Vanilla)**: Lógica para el menú móvil, animaciones de scroll y posicionamiento aleatorio en el hero.
- **Google Fonts**: Tipografía *Nunito*.
- **Font Awesome**: Iconos.

## 🚀 Instalación y Uso Local

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/sinergia_dorada.git
    ```
2.  **Abrir el proyecto:**
    Navega a la carpeta del proyecto y abre el archivo `index.html` en tu navegador web favorito.

## 📦 Despliegue Automático (CI/CD)

El proyecto cuenta con un flujo de trabajo de **GitHub Actions** configurado en `.github/workflows/deploy.yml`. Este flujo se encarga de:

1.  Subir los archivos modificados a un bucket de **AWS S3**.
2.  Invalidar la caché de **AWS CloudFront** para que los cambios se reflejen inmediatamente.

### Configuración de GitHub

Ve a la configuración de tu repositorio en GitHub (`Settings` > `Secrets and variables` > `Actions`).

#### Repository Secrets
Agrega estos valores en la pestaña **Secrets**:

| Nombre | Descripción |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Tu ID de clave de acceso de AWS. |
| `AWS_SECRET_ACCESS_KEY` | Tu clave de acceso secreta de AWS. |
| `AWS_REGION` | La región de AWS (ej. `us-east-1`). |

#### Repository Variables
Agrega estos valores en la pestaña **Variables**:

| Nombre | Descripción |
| :--- | :--- |
| `AWS_S3_BUCKET` | El nombre de tu bucket de S3 (ej. `sinergia-web`). |
| `CLOUDFRONT_DISTRIBUTION_ID` | El ID de tu distribución de CloudFront. |

## 📂 Estructura de Archivos

- `index.html`: Página principal.
- `styles.css`: Hoja de estilos global.
- `script.js`: Lógica de interacción y animaciones.
- `assets/`: Carpeta de imágenes (logos, fotos de perros, actividades).
- `.github/workflows/`: Configuración de CI/CD.

---
Hecho con ❤️ para Sinergia Dorada.
