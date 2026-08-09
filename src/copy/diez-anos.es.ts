/**
 * Copy editable de «Diez años en números» (ES).
 * Edita solo los strings de este archivo — el editor los resalta en color.
 * Los párrafos con números dinámicos viven en diez-anos.astro (también como strings).
 */

//#region 📝 Meta y hero
export const COPY = {
  meta: {
    title: 'Diez años en números | InEssentia',
    descriptionIntro: 'Diez años de consulta, en cifras:',
    descriptionOutro:
      'personas atendidas, {sesiones} sesiones acompañadas. Cuánto duran los procesos, cuándo y dónde ocurren, y quién llega.',
  },
  hero: {
    h1: 'Diez años en números',
    kpiPersonas: 'personas atendidas',
    kpiSesiones: 'sesiones acompañadas',
    kpiAnios: 'años de práctica ({desde}–{hasta})',
    kpiEnCurso: 'en curso hoy — con sesión en los últimos dos meses',
  },
  //#endregion

  //#region 📝 01 · Los procesos
  s01: {
    label: '01 · Los procesos',
    h2: 'Cuánto duran los procesos',
    bandaPct: 'de las personas',
    bandaMediana: 'Suele abarcar',
  },
  //#endregion

  //#region 📝 02 · Cuándo
  s02: {
    label: '02 · Cuándo',
    h2: 'Cuándo se toman más sesiones',
    leyendaLlenos: 'Los tres meses de más sesiones',
    leyendaResto: 'Resto del año',
    leyendaFlacos: 'Los tres de menos',
    kpiLlenos: 'Meses llenos',
    kpiFlacos: 'Meses flacos',
    sesion: 'sesión',
    sesiones: 'sesiones',
  },
  //#endregion

  //#region 📝 03 · Dónde
  s03: {
    label: '03 · Dónde',
    h2: 'Online y presencial',
    presencial: 'Presencial',
    online: 'Online',
    hibrido: 'Híbrido',
    modalidadPresencial: 'presencial',
    modalidadOnline: 'en línea',
  },
  //#endregion

  //#region 📝 04 · Quiénes
  s04: {
    label: '04 · Quiénes',
    h2: 'Quién llega, con qué edad, y cuánto se queda',
    pirMujeres: 'Mujeres',
    pirEdad: 'Edad al llegar',
    pirHombres: 'Hombres',
    durH3: 'Cuánto duran los procesos, según quién',
    durPorGenero: 'Por género',
    durPorEdad: 'Por edad al llegar',
    durPorTipo: 'Por tipo de proceso',
    durColMediana: 'Duración mediana',
    durColDias: 'Días',
    durColSesiones: 'Sesiones',
    durColPersonas: 'Personas',
    persona: 'persona',
    personas: 'personas',
  },
  //#endregion

  //#region 📝 Cierre
  cierre: {
    cta: 'Cada proceso empieza con una conversación.',
    ctaBtn: 'Agenda tu primera cita',
    notaIntro: 'Corte de datos:',
    notaOutro:
      'procesos de una o dos sesiones quedan fuera de las figuras de modalidad, edad/género y duración por grupo (se cuentan arriba, en la banda «Trabajo inicial»).',
  },
  //#endregion
} as const;

//#region 📝 Bandas de permanencia
export const BANDA_META: Record<string, { lbl: string; rango: string; desc: string }> = {
  inicial: {
    lbl: 'Trabajo inicial',
    rango: '1 a 3 sesiones',
    desc: 'Una consulta, una segunda opinión, algo que no llegó a arrancar.',
  },
  basico: {
    lbl: 'Trabajo básico',
    rango: '4 a 7 sesiones',
    desc: 'Un motivo acotado que se trabaja y se cierra: ya es proceso, todavía es corto.',
  },
  profundo: {
    lbl: 'Trabajo profundo',
    rango: '8 a 21 sesiones',
    desc: 'De un par de meses a un año. El terreno donde la mayoría del trabajo ocurre de verdad.',
  },
  vida: {
    lbl: 'Camino de vida',
    rango: '22 sesiones o más',
    desc: 'Procesos de años, con temporadas y regresos. Pocas personas, muchísimas sesiones.',
  },
};
//#endregion

//#region 📝 Párrafos estáticos (sin números)
export const PARRAFOS = {
  durNota:
    'Cada renglón es la mediana de su grupo en los dos ejes con que se mide un proceso: días de calendario entre la primera y la última sesión, y número de sesiones. La mediana y no el promedio, porque unos pocos procesos de años arrastrarían la media muy por encima de lo que le pasa a la mayoría. Aquí se cuentan PROCESOS y no personas —un proceso de pareja es uno solo, y se clasifica por quien abrió la ficha—, así que estos totales no cuadran con los de la pirámide de arriba, que cuenta a las dos personas por separado.',
  modSinDato:
    'no llegaron a tres sesiones: en una o dos citas no se elige una forma de trabajar, se toma la que había ese día.',
  pirSinAdolescentes: 'No hay adolescentes en el retrato. ',
  horFootTodas: ' — todas.',
  horFootSinHorario: ' sin horario.',
};
//#endregion
