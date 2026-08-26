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
> seguimiento a tu solicitud, y se elimina automáticamente pasado un plazo determinado.

**Para "Transferencias de datos"** — ampliar el párrafo de plataformas de terceros:

> Para prestar el servicio, utilizo plataformas de terceros como Zoom (sesiones en línea), Google
> Calendar (agenda) y un proveedor de inteligencia artificial (para operar el asistente
> automatizado de agenda del portal de pacientes). Estas plataformas operan bajo sus propias
> políticas de privacidad, que te recomiendo consultar directamente.

Y, específicamente sobre Google Calendar, un párrafo aparte que explique el mecanismo real:

> Cada cita agendada genera una invitación de Google Calendar en la que apareces como invitada.
> Esa invitación te llega directamente de Google por correo y queda registrada en tu propia cuenta
> de Google, fuera de mi control una vez enviada.

**Sobre retención** — el aviso hoy no tiene ninguna sección de "cuánto tiempo se conservan tus
datos". Antes de escribir ese párrafo hace falta resolver la pregunta 1 de la sección 4 más abajo
(cuánto debe durar `personas` después de una baja), porque prometer un plazo en el aviso que el
sistema no cumple sería peor que no prometer nada. Con esa decisión tomada, el párrafo tendría
que cubrir, como mínimo, tres plazos distintos (contacto y ficha, solicitudes de cita,
conversaciones con el asistente) — no uno solo, porque hoy son tres mecanismos distintos con
comportamientos distintos.

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
- **`transcripciones`**: tampoco hay borrado a petición. El propio inventario lo dice sin
  rodeos: *"no hay forma de borrar la transcripción de alguien a petición antes de los 60 días. Se
  decidió a conciencia"*. Es la única categoría con caducidad automática — pero automática a 60
  días, no al pedirlo.
- **Eventos ya escritos en Google Calendar**: no existe, dentro del código de la app, ninguna ruta
  que borre el evento de la cuenta de Google de la paciente — borrar el evento de la agenda de la
  clínica no borra la copia que Google ya le envió a ella. El inventario deja explícitamente como
  "no verificado" si existe algún mecanismo o costumbre externa al código (un proceso manual, una
  herramienta de Google) que sí lo haga; no se puede afirmar de forma categórica que no exista
  ninguna vía, sólo que el código de la app no la tiene.
- **Lo que ya viajó a Anthropic**: una vez enviado, queda fuera del control de ambos repos.

En resumen: el aviso promete una "Cancelación" que hoy, para cuatro de las cinco categorías de
esta lista, no tiene ninguna implementación detrás. Lo único que existe es `activa: false`, que
apaga el acceso de la paciente al portal — no borra un solo byte de lo que la app tiene de ella.

### Preguntas para abogado (no las contesta este documento)

Estas ya estaban planteadas en `privacidad-y-borrado.md` (sección 5) y son las que le dan forma
legal a las decisiones de producto e ingeniería pendientes:

1. ¿Existe una obligación de poder cumplir "Cancelación" en un plazo dado, y qué tan literal tiene
   que ser esa capacidad técnica frente a lo que el aviso promete hoy?
2. Si alguien pide borrarse, ¿qué hay que hacer con los eventos que Google ya le mandó a su propia
   cuenta? ¿Basta con borrar la copia de la clínica?
3. ¿Es aceptable que el aviso, o la práctica real, tarden hasta 60 días en borrar una conversación
   con el asistente aunque la paciente lo pida antes?
4. Dado que se trata de un consultorio de psicoterapia — que alguien vaya a terapia, con qué
   frecuencia y desde cuándo son datos personales sensibles — ¿el aviso actual, redactado antes de
   que existiera el portal de pacientes con asistente automatizado, sigue siendo suficiente para
   cubrir ese portal, o hace falta actualizarlo (o darlo a conocer de nuevo) antes de seguir
   dándolo de alta a más personas?
5. ¿El uso de un asistente de IA para conversar con pacientes sobre su agenda necesita un
   consentimiento informado explícito y separado del resto del aviso, dado que el texto que
   escriben puede rozar lo clínico?

---

## Resumen

| Categoría | ¿Cubierta en el aviso? |
|---|---|
| `personas` (nombre, correo, token, sin caducidad) | Parcial — nombre/correo sí, token y "no caduca nunca" no |
| `solicitudes` (fecha, hora, estado, retención 14 días) | Parcial — fecha/hora sí, retención no; "estado" sin confirmar en el inventario técnico |
| `transcripciones` (texto libre, 60 días, sin borrado a petición) | No aparece |
| Google Calendar (invitada real, correo, copia en su cuenta) | Mencionado genéricamente, mecanismo no |
| Anthropic (proveedor de IA) | No aparece |
| Promesa de "Cancelación" en 20 días hábiles | Existe en el aviso, pero sin ruta técnica que la cumpla para 4 de 5 categorías |
