// Preventa del libro (página oculta /libro/). El Apps Script sólo recibe:
// valida otra vez del lado del servidor y escribe en la hoja de pedidos.
// Contesta {ok:true} o {ok:false, errores:{campo:mensaje}}.
export const LIBRO_API = 'https://script.google.com/macros/s/AKfycbzm46ChL7Zfv3017uVN5fppCeaKI9gjP00hGiJv-g-yzji6PtyD6tx61Hw8GJevAfOH/exec';

// Precio por libro, para el respaldo cuando el receptor no puede cotizar el envío.
// La cotización normal trae su propio `libros`; si cambia el precio, cambia aquí también.
export const LIBRO_PRECIO = 1100;
