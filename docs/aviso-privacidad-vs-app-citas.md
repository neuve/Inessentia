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
2. **Transcripciones — resuelto, con una condición**: confirmado desde el repo de la app
   (`inessentia-clientes-r2`, rama `arreglo-erafirme`): el botón de borrado manual de una
   transcripción archivada **ya está implementado** en el panel de admin, y la retención general
   **bajó de 60 a 30 días** (`RETENCION_TRANSCRIPCIONES_DIAS` en `almacen.mjs`, más su duplicado en
   el frontend). El cambio incluyó una enmienda a `CONTRATO.md` §20.5, que era donde vivía la
   decisión contraria. Con esto, la contradicción que este documento señalaba queda cerrada.

   **La condición:** ese cambio **todavía no está commiteado** — queda staged, a la espera de que
   Patricio decida integrarlo. Mientras no esté integrado y desplegado, el aviso actualizado no
   debe publicarse: prometería 30 días y borrado a petición cuando lo que corre en producción
   sigue siendo 60 días sin botón. Es el mismo error que este documento le reprocha a
   "Cancelación", y sería peor cometerlo a sabiendas. **Orden correcto: primero integrar y
   desplegar el cambio de la app, después publicar el aviso.**
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
   antes del plazo, él o Diana lo hacen desde el panel (botón ya implementado, punto 2). No
   construye un flujo self-service para que la paciente lo pida o lo haga directamente.
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

### `transcripciones` — texto libre escrito a un asistente automático; caduca a 30 días (antes 60), con borrado manual a petición

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
> seguimiento a tu solicitud, y se elimina automáticamente a los 30 días. Si quieres que se borre
> antes, escríbeme y lo elimino.

Ambas cosas — el plazo de 30 días y el borrado anticipado — ya están implementadas, pero **aún no
integradas ni desplegadas** (sección 0, punto 2). No publicar este párrafo hasta que lo estén.

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
aparte — solicitudes de cita (mínimo 14 días tras la cita) y conversaciones con el asistente (30
días) — porque hoy son tres mecanismos distintos con comportamientos distintos. Los tres están
integrados en la redacción completa de la sección 5.

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
- **`transcripciones`**: el inventario decía que *"no hay forma de borrar la transcripción de
  alguien a petición antes de los 60 días. Se decidió a conciencia"*. **Eso ya cambió**: hay un
  botón de borrado manual en el panel de admin y la retención bajó a 30 días (sección 0, punto 2).
  Es la única categoría donde hoy existe una vía real de borrado a petición — manual, operada por
  Diana o Patricio, no self-service desde el flujo de la paciente. Pendiente de integrar y
  desplegar.
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
   con el asistente aunque la paciente lo pida antes? — **Resuelta en la práctica.** El plazo bajó
   a 30 días y existe borrado manual a petición desde el panel (sección 0, punto 2). Lo que queda
   como criterio, si Patricio lo consulta: si basta con que esa vía sea manual y mediada por la
   clínica, en vez de un flujo que la paciente pueda accionar por su cuenta.
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

## 5. Redacción completa del aviso actualizado

Esto es el aviso entero, listo para leerse de arriba abajo y aprobarse (o corregirse) como texto.
Está en prosa, no en el marcado de `.astro`, para que se pueda juzgar la redacción sin ruido de
etiquetas; los dos archivos (`privacidad.astro` y `privacy.astro`) espejan las mismas secciones en
el mismo orden, así que trasladarlo es mecánico. **Este chip no ha tocado ninguno de los dos
archivos publicados.**

Las secciones marcadas **[NUEVA]** o **[AMPLIADA]** son las que cambian; el resto se conserva
palabra por palabra como está hoy y se incluye sólo para poder leer el aviso completo.

### ⚠️ Dos bloqueos antes de publicar

1. **El párrafo de conservación de `personas`** (anonimización al dar de baja) describe algo que
   **todavía no está construido**. Va marcado abajo. O se construye antes, o se publica el aviso
   sin ese párrafo y se añade después.
2. **El plazo de 30 días y el borrado a petición del asistente** están implementados pero **sin
   integrar ni desplegar** (sección 0, punto 2). El aviso no debe publicarse antes que ese
   despliegue.

---

### 5.1 — Español (`src/pages/es/privacidad.astro`)

> **Aviso de privacidad**
>
> Tu privacidad importa, y más aún en un contexto terapéutico. Este aviso explica qué datos
> recabo, para qué los uso y cómo puedes ejercer tus derechos sobre ellos. Está redactado conforme
> a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su
> Reglamento.
>
> **Responsable del tratamiento**
>
> **Patricio Ruiz Abrín**, persona física.
> Colonia Nápoles, Ciudad de México.
> Contacto: patricio@inessentia.mx
>
> **Datos personales que se recaban** — [AMPLIADA]
>
> Para brindar el servicio, recabo los siguientes datos:
>
> - **Datos de contacto:** nombre, correo electrónico y teléfono.
> - **Datos de agenda:** fecha y hora de citas, modalidad de sesión (presencial o en línea).
> - **Datos de facturación** (cuando aplica): RFC y razón social.
> - **Datos de acceso al portal de pacientes:** para identificarte cuando agendas o das seguimiento
>   a tus citas, se genera un identificador de acceso vinculado a tu registro. No es una contraseña
>   y no se guarda de forma legible.
> - **Conversación con el asistente de agenda:** si usas el asistente automatizado del portal para
>   coordinar una cita, el texto que escribes se guarda temporalmente para poder darle seguimiento
>   a tu solicitud.
> - **Datos sensibles:** en el contexto terapéutico, se recaba información relacionada con tu salud
>   física y mental. Estos datos tienen protección especial bajo la LFPDPPP y únicamente se usan
>   con fines terapéuticos, con tu consentimiento expreso.
>
> **Finalidades del tratamiento** — [AMPLIADA]
>
> **Finalidades primarias** (necesarias para el servicio):
>
> - Coordinar y dar seguimiento a las citas, incluido el uso del portal de pacientes y su asistente
>   de agenda.
> - Brindar atención terapéutica.
> - Emitir facturas cuando se solicite.
>
> **Finalidades secundarias** (opcionales):
>
> - Enviarte información sobre talleres, grupos terapéuticos o contenido de interés relacionado con
>   el bienestar mental.
>
> *(Recuadro)* Puedes oponerte a las finalidades secundarias en cualquier momento escribiendo a
> patricio@inessentia.mx. Tu negativa no afecta la prestación del servicio terapéutico.
>
> **Transferencias de datos** — [AMPLIADA]
>
> No vendo ni comparto tus datos personales con terceros con fines comerciales, ni los entrego a
> nadie salvo que exista una obligación legal que lo requiera.
>
> Para prestar el servicio sí me apoyo en plataformas de terceros, que necesariamente procesan
> algunos de tus datos: Zoom (sesiones en línea), Google Calendar (agenda) y Anthropic (el
> asistente automatizado de agenda del portal de pacientes). Cada una opera bajo su propia política
> de privacidad, que te recomiendo consultar directamente.
>
> **Sobre Google Calendar:** cada cita agendada genera una invitación de Google Calendar en la que
> apareces como invitada. Esa invitación te llega directamente de Google por correo y queda
> registrada en tu propia cuenta de Google. Una vez enviada, esa copia está en tus manos y en las
> de Google, no en las mías: si más adelante me pides que borre tus datos, puedo eliminar el evento
> de mi calendario, pero no la copia que ya quedó en el tuyo.
>
> **Sobre el asistente de agenda:** el texto que escribes en esa conversación se envía a Anthropic
> para poder generar una respuesta. No se envía tu nombre, tu correo ni tus datos de pago. Es una
> herramienta administrativa, pensada para coordinar horarios — no es un canal clínico y no cuenta
> con certificaciones de protección de datos de salud como HIPAA. Por eso te pido que no compartas
> ahí información clínica o sensible: para eso estoy yo, por los canales que ya usamos.
>
> **Conservación de tus datos** — [NUEVA]
>
> No conservo todo por el mismo tiempo:
>
> - **Conversaciones con el asistente de agenda:** se eliminan automáticamente a los 30 días. Si
>   quieres que borre alguna antes, escríbeme y lo hago.
> - **Solicitudes de cita:** se conservan al menos 14 días después de la fecha de la cita y se
>   eliminan después, en el curso normal de la operación.
> - ⚠️ **[NO PUBLICAR HASTA CONSTRUIRLO]** **Datos de contacto y de tu práctica:** los conservo
>   mientras estés en activo. Si dejas de venir y me lo pides, anonimizo tu registro: conservo
>   únicamente las fechas necesarias para mis reglas internas de frecuencia y elimino tu nombre,
>   tu correo y cualquier nota asociada.
>
> **Tus derechos ARCO** — [AMPLIADA]
>
> Tienes derecho a:
>
> - **Acceso:** conocer qué datos tengo sobre ti y cómo los uso.
> - **Rectificación:** corregir datos inexactos o incompletos.
> - **Cancelación:** solicitar que elimine tus datos cuando ya no sean necesarios.
> - **Oposición:** oponerte al tratamiento de tus datos para finalidades específicas.
>
> Para ejercer cualquiera de estos derechos, escríbeme a patricio@inessentia.mx indicando tu nombre
> completo y el derecho que deseas ejercer. Responderé en un plazo máximo de **20 días hábiles**,
> conforme a lo establecido en la LFPDPPP.
>
> Una nota honesta sobre los límites: hay dos cosas que no puedo deshacer aunque me las pidas. La
> copia de una invitación de calendario que Google ya envió a tu cuenta, y el texto que ya viajó al
> asistente en una conversación pasada. En ambos casos puedo eliminar lo que está de mi lado, y te
> lo confirmo por escrito.
>
> **Cookies y tecnologías de seguimiento** *(sin cambios)*
>
> **Cambios a este aviso** *(sin cambios)*
>
> Última actualización: [fecha del día en que se publique].

---

### 5.2 — Inglés (`src/pages/en/privacy.astro`)

> **Privacy notice**
>
> Your privacy matters, even more so in a therapeutic context. This notice explains what data I
> collect, what I use it for, and how you can exercise your rights over it. It's written in
> accordance with Mexico's Federal Law on the Protection of Personal Data Held by Private Parties
> (LFPDPPP) and its Regulations.
>
> **Data controller**
>
> **Patricio Ruiz Abrín**, individual practitioner.
> Colonia Nápoles, Mexico City.
> Contact: patricio@inessentia.mx
>
> **Personal data collected** — [AMPLIADA]
>
> To provide the service, I collect the following data:
>
> - **Contact data:** name, email, and phone number.
> - **Scheduling data:** appointment date and time, session format (in-person or online).
> - **Billing data** (when applicable): tax ID and billing name.
> - **Patient portal access data:** to identify you when you book or follow up on appointments, an
>   access identifier tied to your record is generated. It is not a password and is not stored in
>   readable form.
> - **Conversations with the scheduling assistant:** if you use the portal's automated assistant to
>   arrange an appointment, the text you write is stored temporarily so I can follow up on your
>   request.
> - **Sensitive data:** in the therapeutic context, information related to your physical and mental
>   health is collected. This data receives special protection under the LFPDPPP and is used solely
>   for therapeutic purposes, with your express consent.
>
> **Purposes of processing** — [AMPLIADA]
>
> **Primary purposes** (necessary for the service):
>
> - Coordinating and following up on appointments, including through the patient portal and its
>   scheduling assistant.
> - Providing therapeutic care.
> - Issuing invoices upon request.
>
> **Secondary purposes** (optional):
>
> - Sending you information about workshops, therapeutic groups, or content related to mental
>   wellbeing.
>
> *(Callout)* You can opt out of the secondary purposes at any time by writing to
> patricio@inessentia.mx. Declining does not affect the provision of therapeutic services.
>
> **Data transfers** — [AMPLIADA]
>
> I do not sell or share your personal data with third parties for commercial purposes, and I do
> not hand it to anyone except where a legal obligation requires it.
>
> To provide the service I do rely on third-party platforms, which necessarily process some of your
> data: Zoom (online sessions), Google Calendar (scheduling), and Anthropic (the patient portal's
> automated scheduling assistant). Each operates under its own privacy policy, which I recommend
> reviewing directly.
>
> **About Google Calendar:** every booked appointment creates a Google Calendar invitation with you
> as a guest. That invitation reaches you directly from Google by email and is recorded in your own
> Google account. Once sent, that copy is in your hands and Google's, not mine: if you later ask me
> to delete your data, I can remove the event from my calendar, but not the copy already sitting in
> yours.
>
> **About the scheduling assistant:** the text you write in that conversation is sent to Anthropic
> in order to generate a reply. Your name, email, and payment details are not sent. It is an
> administrative tool, meant for coordinating times — it is not a clinical channel and it does not
> carry health-data certifications such as HIPAA. For that reason I ask you not to share clinical
> or sensitive information there: that is what I am for, through the channels we already use.
>
> **How long I keep your data** — [NUEVA]
>
> I don't keep everything for the same length of time:
>
> - **Conversations with the scheduling assistant:** automatically deleted after 30 days. If you
>   want one deleted sooner, write to me and I'll do it.
> - **Appointment requests:** kept for at least 14 days after the appointment date, and deleted
>   afterwards in the normal course of operation.
> - ⚠️ **[DO NOT PUBLISH UNTIL BUILT]** **Contact data and your practice history:** kept while you
>   are an active client. If you stop coming and ask me to, I anonymize your record: I keep only
>   the dates my internal scheduling rules need, and delete your name, your email, and any
>   associated notes.
>
> **Your rights (ARCO)** — [AMPLIADA]
>
> You have the right to:
>
> - **Access:** know what data I hold about you and how it's used.
> - **Rectification:** correct inaccurate or incomplete data.
> - **Cancellation:** request that I delete your data when it's no longer needed.
> - **Objection:** object to the processing of your data for specific purposes.
>
> To exercise any of these rights, write to me at patricio@inessentia.mx stating your full name and
> the right you wish to exercise. I'll respond within a maximum of **20 business days**, as
> established by the LFPDPPP.
>
> An honest note about the limits: there are two things I cannot undo, even if you ask. The copy of
> a calendar invitation Google has already delivered to your account, and text that has already
> travelled to the assistant in a past conversation. In both cases I can delete what sits on my
> side, and I'll confirm that to you in writing.
>
> **Cookies and tracking technologies** *(unchanged)*
>
> **Changes to this notice** *(unchanged)*
>
> Last updated: [date of publication].

---

### 5.3 — Notas de redacción

Tres decisiones de redacción que conviene revisar, porque son juicios y no traducciones
mecánicas del análisis:

1. **"No vendo ni comparto… con fines comerciales"** sustituye al "no se comparten con terceros"
   de hoy. El texto actual afirmaba algo que el propio aviso contradecía dos líneas después al
   listar Zoom y Google; la nueva redacción distingue entre *no entregar tus datos a nadie* y
   *apoyarse en proveedores que necesariamente los procesan*. Si un abogado prefiere la
   terminología formal de la LFPDPPP (transferencia vs. remisión), ahí es donde entraría.
2. **La "nota honesta sobre los límites"** en ARCO no estaba en el aviso ni la pediste. La incluí
   porque el hueco existe de verdad (documentado en la sección 4) y decirlo de frente es más
   defendible que una promesa de borrado que no se puede cumplir del todo. Es removible si te
   parece que resta más de lo que suma.
3. **El disclaimer de HIPAA** está redactado como límite de la herramienta y petición a la
   paciente, no como afirmación sobre lo que la ley mexicana exige — consistente con tu postura
   (sección 0, punto 9) sin apoyarse en la parte que sigue sin confirmar.

---

## Resumen

| Categoría | ¿Cubierta en el aviso hoy? | Estado tras esta conversación |
|---|---|---|
| `personas` (nombre, correo, token, sin caducidad) | Parcial — nombre/correo sí, token y "no caduca nunca" no | Decisión: anonimizar al dar de baja. Falta construirlo y redactar el párrafo (sección 3) |
| `solicitudes` (fecha, hora, estado, retención 14 días) | Parcial — fecha/hora sí, retención no; "estado" sin confirmar en el inventario técnico | Sin cambios |
| `transcripciones` (texto libre, ahora 30 días, con borrado manual) | No aparece | Confirmado en código: botón implementado y plazo bajado a 30 días. Pendiente integrar/desplegar |
| Google Calendar (invitada real, correo, copia en su cuenta) | Mencionado genéricamente, mecanismo no | Sin cambios; párrafo propuesto en sección 3 |
| Anthropic (proveedor de IA) | No aparece | Banner en desarrollo ya lo nombra; falta que el aviso también lo haga (párrafo en sección 3) |
| Promesa de "Cancelación" en 20 días hábiles | Existe en el aviso, sin ruta técnica que la cumpla para varias categorías | Patricio decide mantener el plazo tal cual |
| Consentimiento explícito para el asistente de IA | No existía | Patricio decide agregarlo — banner en el primer load de la agenda |
| Eventos ya escritos en Google, al pedir borrarse | Sin ruta en el código de la app | Patricio decide: basta con borrar la copia de la clínica |
| Borrado anticipado de transcripciones, ¿self-service? | No existe flujo directo para la paciente | Patricio decide: el manual (él/Diana) basta, no construye self-service |
| Garantía HIPAA/PHI de Anthropic | No aplicaba | No bloqueante para Patricio; propone avisar "uso administrativo, sin HIPAA" (párrafo en sección 3) — lectura legal sin confirmar |
