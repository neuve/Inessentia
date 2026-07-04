# Inessentia — backend sin servidor (Google Sheets + Apps Script)

Un solo Apps Script atiende los tres formularios ocultos:

| Página oculta | Hoja | Se publica en |
|---|---|---|
| `/es/red/registro/` | `Terapeutas` | Mapa Red Inessentia (ES y EN) |
| `/es/testimonios/nuevo/` | `Testimonios` (idioma=es) | `/es/testimonios/` |
| `/en/testimonials/new/` | `Testimonios` (idioma=en) | `/en/testimonials/` |

## Configuración (una sola vez, ~10 min)

1. Crea una Google Sheet nueva llamada **Inessentia — Red y Testimonios** (las pestañas `Terapeutas` y `Testimonios` se crean solas al primer envío).
2. En la hoja: **Extensiones → Apps Script**. Borra el contenido y pega `red-inessentia.gs`.
3. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Tú**
   - Acceso: **Cualquier persona**
4. Copia la URL que termina en `/exec` y pégala en `src/data/red-config.ts` (`RI_API`).
5. `npm run build` y publica el sitio.

## Flujo diario (moderación)

- Cada envío llega como fila nueva con `aprobado = NO`.
- Cambias la celda a `SI` → aparece en el sitio en la siguiente carga de página. `NO` o borrar la fila lo quita.
- Terapeutas: lat/lng llegan geocodificados desde el formulario (zona/CP vía OpenStreetMap). Si quedaron vacíos o mal, corrígelos a mano (Google Maps → clic derecho → copiar coordenadas).
- Testimonios: la columna `nombre` es el nombre real (privado); se publica lo que diga `publicar_como`.

## Notas

- **Respaldo:** si la hoja no responde, el mapa muestra los 20 terapeutas quemados en el código y la página de testimonios muestra los 15 curados en `src/data/testimonials.ts`. Nada se rompe.
- **Testimonios bilingües:** cada formulario manda su `idioma` (`es`/`en`); `/es/testimonios/` solo suma los aprobados con `idioma=es` y `/en/testimonials/` solo los de `idioma=en`. Filas viejas sin esa columna se tratan como `es`.
- **Anti-spam:** los formularios mandan un token (`RI_TOKEN` en `red-config.ts` = `TOKEN` en el .gs). Si llega spam, cambia ambos y re-implementa (Implementar → Administrar implementaciones → editar → Nueva versión).
- **Ocultas de verdad:** las tres páginas llevan `noindex, nofollow`, están fuera del sitemap y de los menús. Compártelas solo por link directo (WhatsApp/mail).
