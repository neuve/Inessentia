# Handoff — la sesión que cuida el aviso de privacidad

Eres la continuación de **S6**, la sesión que mantiene el aviso publicado en
`https://inessentia.mx/es/privacidad/` y `/en/privacy/`. Trabajas en
`/Users/neuve/inessentia-website`. La sesión anterior perdió `SendMessage` y quedó incomunicada
con las demás; tú la tienes, y ése es el motivo de que existas.

---

## 0 · Orientarte y nombrarte

Antes de nada, la convención de este entorno: llama a `ListAgents`, lee tu `[código]` de la primera
línea, y ponte título con `mcp__ccd_session_mgmt__set_session_title` (`session_id: "self"`):

    [<código>] S6 website-<n> aviso de privacidad del sitio

Hazlo en silencio, sin narrarlo.

---

## 1 · TU PRIMERA TAREA: mandarle esto a S1

Búscala con `ListAgents` — es `S1 integrar ramas y supervisar la migración`, el código cambia. Si
falla el envío, vuelve a listar y reintenta con el nombre exacto.

Mándale **este texto**, que es una corrección que S6 le debía y no pudo entregar:

> Tienes razón y me equivoqué. Aquí está el sello que pediste, y confirma tu cronología, no la mía:
>
>     2fd84df  «El enlace de privacidad de FacturaGorila estaba muerto»   15:38:13
>
> Tu medición de las 15:34 con `Bisimplex = 0` era **correcta**: el arreglo no existía todavía. La
> de las 15:48 con `= 1` también. No hubo despliegue a medias — hubo un mensaje tuyo en camino
> mientras yo arreglaba, y yo leí «tu medición era anterior a mi corrección» cuando lo cierto es lo
> contrario: mi corrección fue posterior a tu medición.
>
> Y tu razón para no dejarlo pasar es mejor que la corrección misma. Si aceptas «tu dato estaba
> viejo» cuando no lo estaba, la próxima vez desconfías de una medición buena — y en este trabajo
> la medición correcta es lo único que nos ha salvado tres veces. Un dato con hora se refuta con
> otro dato con hora; el mío decía lo que tú decías.
>
> Una atribución que me toca corregir también: quien encontró el desajuste de Bisimplex fue
> `[1eb9f9] r2-3f`, no yo. Yo llegué al enlace muerto **tirando de su hilo**. Sin su mensaje no
> habría mirado esas URLs, y el enlace roto seguiría publicado. El hallazgo que dice que valía más
> no era mío de origen.
>
> Sobre lo demás: de acuerdo en cómo anota §8.3.1 —guarda del otro lado, con su alcance y su
> hueco, sin describirla como si cerrara el problema—, y de acuerdo en pasarle a r2-3f lo del
> nombre como opcional y sin valor de bloqueo.
>
> (Va de parte de la sesión anterior, que perdió SendMessage a mitad del trabajo. Soy su
> continuación y desde ahora el canal funciona.)

---

## 2 · Las reglas que este trabajo aprendió a golpes

Son cinco y ninguna es teórica. Cada una viene de un error concreto que se cazó a tiempo.

**El aviso y el despliegue del código que describe son el mismo evento.** Ni antes —describiría
algo inexistente— ni después —dejaría viva una promesa falsa—. Se cumplió en las tres
publicaciones de la semana: anonimización, Stripe y medición de recorridos.

**No publiques nunca lo que otra sesión te describa sin leer el código tú.** Tres veces una
descripción de buena fe habría metido un dato falso en el aviso: que el nombre no viajaba a Stripe
(sí viaja), un octavo paso de medición que nadie emite, y dos campos fiscales que no se recogen
(«domicilio fiscal» cuando sólo es el CP; «uso de CFDI», que lo deriva el código). Las tres se
cazaron leyendo el archivo.

**Comprueba los enlaces que publicas.** `facturagorila.com/privacidad.aspx` estuvo un día vivo en
el aviso como «su aviso de privacidad» y era un 302 en bucle con cero bytes. Lo publicó S6 sin
hacerle un `curl`.

**Verifica contra producción, no contra el commit.** La suite del repo hermano inyecta su
`getStore` y nunca toca Blobs: estar en verde no dice nada sobre el almacén real. La anonimización
se comprobó creando un registro desechable, pulsando el botón en el panel vivo, y viendo que el
correo dejaba de estar.

**Declara lo que una guarda NO cubre.** Una guarda que promete cobertura completa es peor que
ninguna, porque nadie vuelve a mirar.

---

## 3 · Estado hoy (2026-09-06)

El aviso está publicado, al día, y coincide con lo que corre en producción. Cubre: datos de
contacto, agenda, facturación (cuatro campos), acceso al portal, conversaciones con el asistente,
uso del portal, y datos sensibles. Terceros declarados: **Zoom, Google Calendar, Anthropic, Stripe
y FacturaGorila (operada por Bisimplex)** — los tres últimos con enlace a su política.

`tools/check-terceros.mjs` corre en cada build (y por tanto en Actions, en cada despliegue):
compara los dominios a los que enlaza el consentimiento de `pacientes.inessentia.mx` contra el
aviso construido, y falla si alguno no aparece. **No atrapa** un tercero nombrado sin enlace, y
sólo salta cuando publicas tú.

El análisis completo, con las siete preguntas para abogado y la postura de Patricio en cada una,
está en [`docs/aviso-privacidad-vs-app-citas.md`](aviso-privacidad-vs-app-citas.md). Léelo antes de
tocar el aviso.

---

## 4 · Lo que sigue abierto

- **La fase 1 de facturación** (la pantalla donde la paciente teclea sus datos fiscales) no existe
  todavía; está bloqueada por una ApiKey que da de alta Patricio. Cuando llegue **no cambia quién
  recibe los datos**, así que el aviso ya es correcto y no hay nada que coordinar.
- **`r2-3f`** está fundiendo el consentimiento en un onboarding de primer uso, y la clave sube a
  `inessentia_consentimiento_v2` — a todas las pacientes se les vuelve a pedir. Si el texto cambia
  por algo, que cambie en esa misma versión.
- **Ninguna de las siete preguntas para abogado pasó por un abogado.** Todas son decisiones de
  Patricio como responsable del tratamiento. Está dicho así en el documento a propósito.

---

## 5 · Cómo trabajar con Patricio

Está en `CLAUDE.md` y va en serio: **si algo lo puedes correr tú, córrelo.** No termines un turno
con un bloque `bash` para que lo pegue, salvo que necesite su criterio o su acceso. Si una
herramienta te bloquea, ofrécele la regla de permiso — no el comando.

Publicar el aviso sí es suyo: es un documento público. Pero una vez aprobado el fondo, no le pidas
permiso para cada coma.
