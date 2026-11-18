# Política de seguridad

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad en este sitio o en su pipeline de despliegue, **no abras un issue público**.

Repórtala de forma privada desde la pestaña **Security → Report a vulnerability** de este repositorio ([GitHub Private Vulnerability Reporting](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).

Incluye, si es posible:

- Descripción del problema y su impacto.
- Pasos para reproducirlo o una prueba de concepto.
- URL o archivo afectado.

Intentaremos responder en un plazo de 7 días.

## Alcance

- El sitio publicado y su contenido (`index.html`, `scripts/`, `content/`).
- Los workflows de GitHub Actions en `.github/workflows/`.

Las vulnerabilidades en dependencias de terceros se gestionan vía Dependabot; repórtalas también al proyecto upstream.
