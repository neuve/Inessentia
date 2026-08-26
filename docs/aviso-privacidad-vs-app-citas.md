# Aviso de privacidad del sitio vs. lo que guarda la app de citas

Este documento **no es asesoría legal**. Es una comparación de ingeniería: qué dice hoy
`src/pages/es/privacidad.astro` (publicado en `https://inessentia.mx/es/privacidad/`) frente a lo
que efectivamente guarda `pacientes.inessentia.mx`, según el inventario ya verificado en
`/Users/neuve/inessentia-clientes-r2/docs/privacidad-y-borrado.md` (repo hermano, sólo lectura
para este documento). No cita ningún artículo de ley ni afirma qué exige la ley — cada punto que
depende de criterio legal queda marcado explícitamente como pregunta para un abogado, en la
sección 4.

Fuentes:
- Aviso publicado: [`src/pages/es/privacidad.astro`](../src/pages/es/privacidad.astro), última
  actualización declarada 14 de julio de 2026.
- Inventario de la app de citas: `privacidad-y-borrado.md` del repo `inessentia-clientes-r2`.

---

## 0. Decisiones de Patricio (2026-08-26, posteriores al análisis inicial)

Esta sección resume lo que Patricio decidió al revisar el documento. Son decisiones suyas como
responsable del tratamiento, no asesoría legal de este chip — donde una decisión dependía de
criterio legal, se le presentó como tal y él eligió cómo proceder por ahora.

1. **Retención de `personas` tras la baja**: en vez de quedarse indefinida como hoy, decide que el
   registro se **anonimice** — conservar sólo lo necesario para las reglas de frecuencia, borrar
   nombre/correo/ficha/notas. Ver borrador de párrafo en la sección 3. **No está construido
   todavía** — es una decisión de producto pendiente de implementación en el otro repo.
2. **Transcripciones**: Patricio indica que **sí existe** una forma de borrarlas a mano desde el
   panel — un botón que el inventario que leí no documenta. Esto contradice, en apariencia, lo que
   dice `privacidad-y-borrado.md` (*"no hay forma de borrar la transcripción de alguien a petición
   antes de los 60 días"*). No pude verificar esto en el código — este chip sólo tiene acceso de
   lectura a un archivo de ese repo, no al código fuente de la app. Recomendable confirmarlo ahí y,
   si existe, actualizar el inventario del otro repo para que no quede desactualizado.
3. **Plazo de "Cancelación" (20 días hábiles)**: decide mantenerlo tal como está publicado, aunque
   la ruta técnica para cumplirlo en todas las categorías no exista todavía.
4. **Aviso antes de seguir creciendo**: en vez de pausar altas, está integrando un **banner de
   consentimiento de un solo uso** en el portal de pacientes que bloquea el uso hasta aceptar el
   aviso. Texto que ya redactó para ese banner:

   > Al hacer uso de esta plataforma aceptas que tus datos serán tratados conforme al aviso de
   > privacidad para fines administrativos y de comunicación de ofertas de mi trabajo (link) y al
   > hacer uso del bot, comprendes que la información que intercambies con el chatbot será
   > manejada por Anthropic Inc. conforme a sus reglas de operación (link a la privacidad del API
   > de Claude).

   Ese banner vive en el portal de pacientes (otro repo, fuera del alcance de este chip), pero
   enlaza directamente a este aviso — por lo que el aviso necesita cubrir lo que el banner promete
   (el asistente, y a Anthropic por nombre) para que los dos textos no se contradigan.
5. **Consentimiento explícito para el asistente de IA**: decide que sí, aparte del aviso general —
   se avisa en el primer load de la pantalla de agenda (consistente con el banner del punto 4).
6. **Dato nuevo, no resuelto**: Patricio menciona que, a la fecha, Anthropic no le ha dado una
   garantía tipo HIPAA/PHI (protección de información de salud) para este uso.
7. **Eventos de Google al pedir borrarse**: decide borrar sólo la copia de la clínica. La copia
   que Google ya le mandó a la paciente, y la que quedó en su propia cuenta, se quedan fuera de
   esta acción.
8. **Borrado manual de transcripciones, ¿basta?**: decide que sí — si alguien pide que se borre
   antes de los 60 días, él o Diana lo hacen desde el panel (una vez confirmado que ese botón
   existe, sección 0 punto 2). No construye un flujo self-service para que la paciente lo pida o
   lo haga directamente.
9. **Urgencia del hueco HIPAA/PHI**: no bloqueante. Su postura: depende de Anthropic resolverlo, y
   además considera que HIPAA no es un requisito en México. Su mitigación es notificar a las
   personas usuarias que el asistente se ofrece para fines administrativos, que no cuenta con
   HIPAA, y pedirles explícitamente que no compartan información sensible ahí. (La frase "no es
   necesario en México" es su lectura, no una afirmación de este documento — si quiere apoyarse en
   ella para el aviso, es exactamente el tipo de cosa que vale la pena confirmar con abogado.)

---

## 1. ¿El aviso cubre cada categoría de dato que guarda la app?

### `personas` — nombre, correo, huella de token; sin caducidad

**Parcial.** El aviso sí recaba nombre y correo, bajo "Datos de contacto: nombre, correo
electrónico y teléfono" (línea 36). Pero:

- La huella del token de acceso (`huellaToken`) no aparece en ningún lado del aviso. No es un
  dato sensible por sí mismo (es un hash, no el token), pero es un identificador que la app
  guarda y el aviso no lo contempla como categoría.
- El aviso no dice en ningún lado que estos datos **no caducan nunca** — ver sección 3, donde esto
  choca directamente con lo que el aviso promete bajo "Cancelación".

### `solicitudes` — fecha, hora y estado de cada cita; retención mínima 14 días, purgada al leer el panel

**Parcial.** El aviso cubre el dato en sí — "Datos de agenda: fecha y hora de citas, modalidad de
sesión (presencial o en línea)" (línea 37) — pero no menciona ningún plazo de retención para estos
datos. No aparece en el aviso ninguna mención a que una solicitud vive un mínimo de 14 días tras la
cita y se purga sólo cuando alguien abre el panel, sin tope superior verificado si nadie lo hace.
(Nota: el campo "estado" viene dado tal cual en la categoría que se me pidió verificar; la tabla
de `personas`/`solicitudes` del inventario técnico no lo itemiza como campo separado — lista id de
persona, evento de Google, fecha, horas, modalidad y fecha de solicitud. No pude confirmar de forma
independiente, contra ese archivo, que exista un campo de "estado" distinto de esos.)

### `transcripciones` — texto libre escrito a un asistente automático; caduca a 60 días, sin borrado anticipado

**No aparece.** El aviso no menciona en ningún lugar que existe un asistente conversacional
automatizado, que las pacientes le escriben texto libre, ni que ese texto se guarda (aunque sea
temporalmente). No hay ninguna sección de "Datos personales que se recaban" que lo cubra, y
tampoco aparece en "Finalidades del tratamiento".

### Google Calendar — evento con la paciente como invitada, notificación por correo, copia en su calendario

**Mencionado, pero de forma genérica.** El aviso sí nombra a Google Calendar: "Para prestar el
servicio, utilizo plataformas de terceros como Zoom (sesiones en línea) y Google Calendar
(agenda). Estas plataformas operan bajo sus propias políticas de privacidad, que te recomiendo
consultar directamente" (línea 64). Eso cubre el nombre de la plataforma, pero no el mecanismo
concreto: que cada cita crea un evento de Google donde la paciente queda como **invitada real**,
que le llega una notificación por correo de Google, y que el evento queda también en su propio
calendario — fuera del control de la clínica una vez enviado.

### Anthropic — el texto libre de la conversación viaja a un proveedor de IA para poder contestar

**No aparece.** Ningún proveedor de inteligencia artificial está nombrado en el aviso, ni de forma
genérica ("proveedores de IA") ni específica ("Anthropic"). Esto es más notorio porque la sección
"Transferencias de datos" abre con "Tus datos personales **no se comparten con terceros**, salvo
que exista una obligación legal que lo requiera" (línea 63) y luego lista dos excepciones (Zoom,
Google Calendar) sin incluir esta tercera.

---

## 2. ¿El aviso menciona a los terceros por lo que son?

- **Google**: sí, nombrado explícitamente como "Google Calendar (agenda)". No explica qué hace
  Google con esos datos más allá de remitir a su política de privacidad — no dice que la paciente
  recibe la invitación directamente de Google ni que queda registrada en su cuenta de Google.
- **Proveedor de IA (Anthropic)**: no, en ningún grado. Ni el nombre de la empresa ni una
  categoría genérica ("servicio de inteligencia artificial", "asistente automatizado") aparece en
  el aviso.

---

## 3. Qué le falta — propuesta de párrafos concretos

Estos son borradores de texto para que Patricio (y, donde se marca, un abogado) los revise, ajuste
o descarte — no son la redacción final. Van pensados para insertarse en las secciones existentes
del aviso, siguiendo su mismo tono.

**Para "Datos personales que se recaban"** — agregar un punto a la lista:

> **Datos de acceso:** para identificarte al agendar o dar seguimiento a tus citas a través del
> portal de pacientes, se genera un identificador de acceso vinculado a tu registro. No se guarda
> como contraseña ni es legible por sí mismo.

**Para el mismo bloque, o como bloque nuevo** — cubrir el asistente conversacional:

> **Conversación con el asistente de agenda:** si usas el asistente automatizado del portal de
> pacientes para coordinar una cita, el texto que escribes se guarda temporalmente para poder darle
> seguimiento a tu solicitud, y se elimina automáticamente pasado un plazo determinado. También
> puede borrarse antes, a solicitud tuya, desde el panel administrativo.

La última oración depende de que se confirme el punto 2 de la sección 0 (el botón de borrado
manual que Patricio menciona) en el código de la app — si no se confirma, hay que quitarla antes
de publicar, para no prometer algo que no existe.

**Para "Transferencias de datos"** — ampliar el párrafo de plataformas de terceros, nombrando a
Anthropic por su nombre (como ya hace el banner en desarrollo, sección 0 punto 4):

> Para prestar el servicio, utilizo plataformas de terceros como Zoom (sesiones en línea), Google
> Calendar (agenda) y Anthropic (para operar el asistente automatizado de agenda del portal de
> pacientes). Estas plataformas operan bajo sus propias políticas de privacidad, que te recomiendo
> consultar directamente.

Y, siguiendo la mitigación que Patricio propone para el hueco HIPAA/PHI (sección 0, punto 9), un
párrafo aparte junto a la mención de Anthropic:

> El asistente de agenda es una herramienta administrativa, no un canal clínico. No cuenta con
> certificaciones de protección de datos de salud tipo HIPAA. Te pido que no compartas ahí
> información clínica o sensible — para eso, usa los canales que ya conoces conmigo directamente.

Y, específicamente sobre Google Calendar, un párrafo aparte que explique el mecanismo real:

> Cada cita agendada genera una invitación de Google Calendar en la que apareces como invitada.
> Esa invitación te llega directamente de Google por correo y queda registrada en tu propia cuenta
> de Google, fuera de mi control una vez enviada.

**Sobre retención** — con la decisión de la sección 0 (anonimizar `personas` al dar de baja), este
sería el borrador del párrafo — pero **sólo para publicarse cuando esa anonimización ya esté
construida** en el otro repo; hoy no existe ninguna ruta que la haga, y publicarlo antes repetiría
el mismo problema que ya tiene "Cancelación" (sección 4): prometer algo que el sistema no cumple.

> Conservo tus datos de contacto y de práctica mientras estés en activo. Si te das de baja,
> anonimizo tu registro: conservo únicamente las fechas necesarias para mis reglas internas de
> frecuencia, y elimino tu nombre, correo y cualquier nota asociada.

Ese párrafo cubre `personas`. Quedan dos plazos más por cubrir, en el mismo bloque o en uno
aparte — solicitudes de cita (mínimo 14 días tras la cita) y conversaciones con el asistente (60
días) — porque hoy son tres mecanismos distintos con comportamientos distintos.

---

## 4. Borrado y derechos ARCO: lo que el aviso promete vs. lo que la app puede cumplir hoy

El aviso dice, bajo "Tus derechos ARCO":

> **Cancelación:** solicitar que elimine tus datos cuando ya no sean necesarios.
>
> Para ejercer cualquiera de estos derechos, escríbeme a patricio@inessentia.mx indicando tu
> nombre completo y el derecho que deseas ejercer. Responderé en un plazo máximo de 20 días
> hábiles, conforme a lo establecido en la LFPDPPP.

Esto es una promesa de que existe una ruta de borrado, y de que responde en un plazo. Según el
inventario verificado en `privacidad-y-borrado.md`, hoy esa ruta no existe para casi ninguno de los
datos que la app guarda:

- **`personas`**: no hay ninguna ruta de borrado. Dar de baja a alguien (`activa: false`) no borra
  el registro — nombre, correo, ficha y notas operativas quedan indefinidamente. Cita textual del
  inventario: *"su registro no se borra — porque borrarlo perdería el historial"*. Es una decisión
  de producto tomada a conciencia, no un descuido, pero es lo opuesto de lo que "Cancelación"
  promete.
- **`solicitudes`**: no hay borrado a petición. Se purgan solas, pero sólo después de un mínimo de
  14 días tras la cita, y sólo cuando alguien abre el panel — no hay un botón que las borre antes
  si una paciente lo pide.
- **`transcripciones`**: el inventario dice sin rodeos que *"no hay forma de borrar la
  transcripción de alguien a petición antes de los 60 días. Se decidió a conciencia"* — pero
  Patricio indica que sí existe un botón manual en el panel para hacerlo (sección 0, punto 2). No
  verificado en el código por este chip; si se confirma, esta es la única categoría donde ya
  existe una vía de borrado a petición, aunque manual y no automatizada desde el flujo de la
  paciente.
- **Eventos ya escritos en Google Calendar**: no existe, dentro del código de la app, ninguna ruta
  que borre el evento de la cuenta de Google de la paciente — borrar el evento de la agenda de la
  clínica no borra la copia que Google ya le envió a ella. El inventario deja explícitamente como
  "no verificado" si existe algún mecanismo o costumbre externa al código (un proceso manual, una
  herramienta de Google) que sí lo haga; no se puede afirmar de forma categórica que no exista
  ninguna vía, sólo que el código de la app no la tiene.
- **Lo que ya viajó a Anthropic**: una vez enviado, queda fuera del control de ambos repos.

En resumen: el aviso promete una "Cancelación" que hoy, para al menos tres de las cinco categorías
de esta lista (`personas`, eventos ya escritos en Google, lo ya enviado a Anthropic), no tiene
ninguna implementación a petición. Para `transcripciones`, la existencia de una vía manual está
pendiente de confirmar (ver arriba). Lo único verificado en el código es `activa: false`, que
apaga el acceso de la paciente al portal — no borra un solo byte de lo que la app tiene de ella.

### Preguntas para abogado (no las contesta este documento)

Estas ya estaban planteadas en `privacidad-y-borrado.md` (sección 5). Donde Patricio ya tomó una
postura como responsable del tratamiento (sección 0), lo anoto, sin que sustituya una opinión
legal si él decide buscarla más adelante:

1. ¿Existe una obligación de poder cumplir "Cancelación" en un plazo dado, y qué tan literal tiene
   que ser esa capacidad técnica frente a lo que el aviso promete hoy? — **Postura de Patricio:**
   mantener el compromiso de 20 días hábiles tal como está publicado (sección 0, punto 3).
2. Si alguien pide borrarse, ¿qué hay que hacer con los eventos que Google ya le mandó a su propia
   cuenta? ¿Basta con borrar la copia de la clínica? — **Postura de Patricio:** sí, basta con
   borrar la copia de la clínica; la que ya tiene la paciente en su propia cuenta de Google queda
   fuera de esta acción (sección 0, punto 7).
3. ¿Es aceptable que el aviso, o la práctica real, tarden hasta 60 días en borrar una conversación
   con el asistente aunque la paciente lo pida antes? — **Postura de Patricio:** sí, con el matiz
   de que el borrado anticipado es manual (él o Diana lo hacen desde el panel al recibir la
   petición), no un flujo directo para la paciente (sección 0, punto 8). Sigue condicionado a que
   se confirme en código que ese botón manual existe de verdad.
4. Dado que se trata de un consultorio de psicoterapia — que alguien vaya a terapia, con qué
   frecuencia y desde cuándo son datos personales sensibles — ¿el aviso actual, redactado antes de
   que existiera el portal de pacientes con asistente automatizado, sigue siendo suficiente para
   cubrir ese portal, o hace falta actualizarlo antes de seguir dándolo de alta a más personas? —
   **Postura de Patricio:** no pausar altas; en desarrollo un banner de consentimiento de un solo
   uso que bloquea el acceso hasta aceptar el aviso (sección 0, punto 4). Eso no resuelve por sí
   solo si el *contenido* del aviso está completo — sigue dependiendo de que cubra lo que el
   banner promete.
5. ¿El uso de un asistente de IA para conversar con pacientes sobre su agenda necesita un
   consentimiento informado explícito y separado del resto del aviso, dado que el texto que
   escriben puede rozar lo clínico? — **Postura de Patricio:** sí, aparte del aviso general; se
   avisa en el primer load de la pantalla de agenda (sección 0, punto 5).
6. **Nueva, no estaba en el inventario original:** Patricio menciona que, a la fecha, Anthropic no
   le ha dado una garantía tipo HIPAA/PHI (protección de información de salud) para este uso.
   Dado que se trata de datos de salud mental, ¿es relevante esa ausencia para el aviso, para el
   consentimiento del banner, o para la relación contractual con Anthropic? — **Postura de
   Patricio:** no bloqueante; considera que HIPAA no es un requisito en México y que, mientras
   Anthropic no lo resuelva, la mitigación es avisar a las personas usuarias que el asistente es
   para fines administrativos, sin HIPAA, y pedirles que no compartan información sensible ahí
   (sección 0, punto 9). Sigue siendo la pregunta con más peso de las seis por el tipo de dato
   involucrado — y la lectura de que HIPAA "no es necesario en México" es precisamente el tipo de
   afirmación que vale la pena confirmar con abogado antes de apoyarse en ella para el aviso.

---

## Resumen

| Categoría | ¿Cubierta en el aviso hoy? | Estado tras esta conversación |
|---|---|---|
| `personas` (nombre, correo, token, sin caducidad) | Parcial — nombre/correo sí, token y "no caduca nunca" no | Decisión: anonimizar al dar de baja. Falta construirlo y redactar el párrafo (sección 3) |
| `solicitudes` (fecha, hora, estado, retención 14 días) | Parcial — fecha/hora sí, retención no; "estado" sin confirmar en el inventario técnico | Sin cambios |
| `transcripciones` (texto libre, 60 días, sin borrado a petición) | No aparece | Patricio indica que sí hay borrado manual — pendiente verificar en código |
| Google Calendar (invitada real, correo, copia en su cuenta) | Mencionado genéricamente, mecanismo no | Sin cambios; párrafo propuesto en sección 3 |
| Anthropic (proveedor de IA) | No aparece | Banner en desarrollo ya lo nombra; falta que el aviso también lo haga (párrafo en sección 3) |
| Promesa de "Cancelación" en 20 días hábiles | Existe en el aviso, sin ruta técnica que la cumpla para varias categorías | Patricio decide mantener el plazo tal cual |
| Consentimiento explícito para el asistente de IA | No existía | Patricio decide agregarlo — banner en el primer load de la agenda |
| Eventos ya escritos en Google, al pedir borrarse | Sin ruta en el código de la app | Patricio decide: basta con borrar la copia de la clínica |
| Borrado anticipado de transcripciones, ¿self-service? | No existe flujo directo para la paciente | Patricio decide: el manual (él/Diana) basta, no construye self-service |
| Garantía HIPAA/PHI de Anthropic | No aplicaba | No bloqueante para Patricio; propone avisar "uso administrativo, sin HIPAA" (párrafo en sección 3) — lectura legal sin confirmar |
