/**
 * Inessentia — API de Google Apps Script (Red de terapeutas + Testimonios).
 * doPost: recibe registros de los formularios ocultos y los agrega a su hoja (aprobado = NO).
 * doGet:  devuelve en JSON solo los registros con aprobado = SI.
 *   - GET <url>/exec                              → terapeutas aprobados (lo lee el mapa)
 *   - GET <url>/exec?form=testimonios&idioma=es   → testimonios ES (lo lee /es/testimonios/)
 *   - GET <url>/exec?form=testimonios&idioma=en   → testimonios EN (lo lee /en/testimonials/)
 *
 * Instrucciones de despliegue: ver README.md en esta carpeta.
 */

var TOKEN = 'inessentia-red-2026'; // debe coincidir con RI_TOKEN en src/data/red-config.ts
var NOTIFY_EMAIL = 'patricio@inessentia.mx'; // a quién avisar cuando llega un registro nuevo

var SHEET_TERAPEUTAS = 'Terapeutas';
var SHEET_TESTIMONIOS = 'Testimonios';

var HEADERS_TERAPEUTAS = [
  'timestamp','aprobado','nombre','tipo','subtipo','enfoques','especialidades',
  'telefono','webpage','casos','modalidades','zona','cp','pais','idiomas',
  'costo','disponibilidad','lat','lng','email'
];

var HEADERS_TESTIMONIOS = [
  'timestamp','aprobado','nombre','publicar_como','testimonio','tipo_terapia',
  'link','email','consentimiento','idioma'
];

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return json_({ ok: false, error: 'token' });

    if (d.form === 'testimonio') {
      if (!d.testimonio) return json_({ ok: false, error: 'testimonio requerido' });
      var sh = getSheet_(SHEET_TESTIMONIOS, HEADERS_TESTIMONIOS);
      sh.appendRow([
        new Date(), 'NO',
        String(d.nombre || ''), String(d.publicar_como || d.nombre || 'Anónimo'),
        String(d.testimonio || ''), String(d.tipo_terapia || ''),
        String(d.link || ''), String(d.email || ''),
        d.consentimiento ? 'SI' : 'NO', String(d.idioma || 'es')
      ]);
      notify_('Nuevo testimonio (' + String(d.idioma || 'es').toUpperCase() + ')',
        'De: ' + String(d.nombre || '') + ' (publicar como: ' + String(d.publicar_como || d.nombre || 'Anónimo') + ')\n\n' +
        String(d.testimonio || ''));
      return json_({ ok: true });
    }

    // default: registro de terapeuta (Red Inessentia)
    if (!d.nombre) return json_({ ok: false, error: 'nombre requerido' });
    var sh2 = getSheet_(SHEET_TERAPEUTAS, HEADERS_TERAPEUTAS);
    sh2.appendRow([
      new Date(), 'NO',
      String(d.nombre || ''), String(d.tipo || ''), String(d.subtipo || ''),
      (d.enfoques || []).join(', '), String(d.especialidades || ''),
      String(d.telefono || ''), String(d.webpage || ''),
      (d.casos || []).join(', '), (d.modalidades || []).join(', '),
      String(d.zona || ''), String(d.cp || ''), String(d.pais || ''),
      (d.idiomas || []).join(', '),
      d.costo || '', String(d.disponibilidad || ''),
      d.lat || '', d.lng || '', String(d.email || '')
    ]);
    notify_('Nuevo registro en la Red Inessentia',
      'Nombre: ' + String(d.nombre || '') + '\n' +
      'Tipo: ' + String(d.tipo || '') + (d.subtipo ? ' / ' + d.subtipo : '') + '\n' +
      'Zona: ' + String(d.zona || '') + '\n' +
      'Tel/WhatsApp: ' + String(d.telefono || '') + '\n' +
      'Email: ' + String(d.email || ''));
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var form = (e && e.parameter && e.parameter.form) || '';
  if (form === 'testimonios') {
    var idioma = (e && e.parameter && e.parameter.idioma) || '';
    return getTestimonios_(idioma);
  }
  return getTerapeutas_();
}

function getTerapeutas_() {
  var rows = readApproved_(SHEET_TERAPEUTAS, HEADERS_TERAPEUTAS);
  var out = rows.map(function (r) {
    return {
      nombre: r.nombre,
      tipo: r.tipo,
      subtipo: r.subtipo || null,
      enfoques: splitList_(r.enfoques),
      especialidades: r.especialidades || '',
      telefono: String(r.telefono || ''),
      webpage: r.webpage || null,
      casos: splitList_(r.casos),
      modalidades: splitList_(r.modalidades),
      zona: r.zona,
      cp: String(r.cp || ''),
      idiomas: splitList_(r.idiomas),
      costo: r.costo === '' ? null : Number(r.costo),
      disponibilidad: r.disponibilidad || 'Agenda abierta',
      lat: r.lat === '' ? null : Number(r.lat),
      lng: r.lng === '' ? null : Number(r.lng)
    };
  });
  return json_(out);
}

function getTestimonios_(idioma) {
  var rows = readApproved_(SHEET_TESTIMONIOS, HEADERS_TESTIMONIOS);
  if (idioma) {
    rows = rows.filter(function (r) { return (String(r.idioma || 'es').trim() || 'es') === idioma; });
  }
  var out = rows.map(function (r, k) {
    return {
      id: 'web-' + k,
      q: String(r.testimonio || ''),
      name: String(r.publicar_como || 'Anónimo'),
      link: r.link || null,
      tag: r.tipo_terapia || null
    };
  });
  return json_(out);
}

function readApproved_(sheetName, headers) {
  var sh = getSheet_(sheetName, headers);
  var rows = sh.getDataRange().getValues();
  var head = rows.shift();
  var idx = {};
  head.forEach(function (h, i) { idx[h] = i; });
  return rows
    .filter(function (r) { return String(r[idx.aprobado]).trim().toUpperCase() === 'SI'; })
    .map(function (r) {
      var obj = {};
      head.forEach(function (h) { obj[h] = r[idx[h]]; });
      return obj;
    });
}

function splitList_(v) {
  if (!v) return [];
  return String(v).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

function notify_(subject, body) {
  try {
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body + '\n\nRevisar y aprobar aquí: ' + sheetUrl);
  } catch (err) {
    // no interrumpe el guardado del registro si el correo falla
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
