export type Locale = 'es' | 'en';

export interface PostLocaleMeta {
  title: string;
  description: string;
  category: string;
  disqusIdentifier: string;
}

export interface PostEntry {
  id: string;
  slugEs: string;
  slugEn: string;
  heroImage: string;
  heroAlt: { es: string; en: string };
  heroPosition: string;
  /** small credit/caption line shown under the hero image on the full post view only */
  heroCaption?: { es: string; en: string };
  /** short teaser shown on the resources/recursos card grid (distinct from the meta description) */
  cardBlurb?: { es: string; en: string };
  /** overrides heroPosition just for the card thumbnail, when the card crop differs from the post's own hero crop */
  cardHeroPosition?: { es?: string; en?: string };
  /** overrides heroAlt just for the card thumbnail, when it differs from the post's own hero alt */
  cardAlt?: { es?: string; en?: string };
  es: PostLocaleMeta;
  en: PostLocaleMeta;
  /** id of the post this one links to via "read next", or null for standalone hub posts */
  next: string | null;
}

// Single source of truth for blog post metadata (ES + EN). The article body
// itself stays in each src/pages/{locale}/blog/<slug>.astro file — only the
// title/description/category/hero/disqus/nextPost metadata lives here, so it
// can't drift between the post page, the resources grid, and the nav search
// index.
export const posts: PostEntry[] = [
  {
    id: 'terapia-corporal',
    cardBlurb: { es: 'El cuerpo guarda lo que la mente no alcanza a procesar.', en: 'The body holds what the mind can\'t fully process.' },
    slugEs: 'terapia-corporal',
    slugEn: 'body-based-therapy',
    heroImage: '/uploads/terapia-corporal.webp',
    heroAlt: {
      es: 'Acercamiento a una mano abierta apoyada sobre una rodilla, luz natural',
      en: 'Close-up of a hand resting open on a knee, natural light',
    },
    heroPosition: 'center 30%',
    es: { title: '¿Qué es la terapia corporal?', description: 'El cuerpo guarda lo que la mente no alcanza a procesar. Descubre cómo la terapia corporal trabaja con sensaciones, postura y sistema nervioso para sanar desde adentro.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-terapia-corporal.html' },
    en: { title: 'What is body-based therapy?', description: "The body holds what the mind can't fully process. Discover how body-based therapy works with sensation, posture, and the nervous system to heal from the inside.", category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-body-based-therapy.html' },
    next: 'teoria-polivagal',
  },
  {
    id: 'teoria-polivagal',
    cardBlurb: { es: 'Por qué reaccionamos como reaccionamos.', en: 'Why we react the way we react.' },
    slugEs: 'teoria-polivagal',
    slugEn: 'polyvagal-theory',
    heroImage: '/uploads/placeholder-teoria-polivagal.svg',
    heroAlt: {
      es: 'Ondas concéntricas en calma sobre agua quieta, luz dorada',
      en: 'Calm concentric waves on still water, golden light',
    },
    heroPosition: 'center 40%',
    es: { title: 'Teoría Polivagal: el sistema nervioso como brújula', description: 'La Teoría Polivagal de Stephen Porges explica cómo el sistema nervioso autónomo regula nuestra capacidad de conexión, movilización y colapso — y por qué eso transforma la terapia.', category: 'Sistema nervioso', disqusIdentifier: '/blog-teoria-polivagal.html' },
    en: { title: 'Polyvagal Theory: the nervous system as a compass', description: "Stephen Porges's Polyvagal Theory explains how the autonomic nervous system regulates our capacity for connection, mobilization, and collapse — and why that transforms therapy.", category: 'Nervous system', disqusIdentifier: '/en/blog-polyvagal-theory.html' },
    next: 'experiencia-somatica',
  },
  {
    id: 'experiencia-somatica',
    cardBlurb: { es: 'Completar ciclos de defensa interrumpidos.', en: 'Completing interrupted defense cycles.' },
    slugEs: 'experiencia-somatica',
    slugEn: 'somatic-experiencing',
    heroImage: '/uploads/placeholder-experiencia-somatica.svg',
    heroAlt: {
      es: 'Venado en un claro de bosque, luz moteada entre los árboles',
      en: 'A deer in a forest clearing, dappled light through trees',
    },
    heroPosition: 'center 40%',
    es: { title: 'Experiencia Somática (SE)', description: 'La Experiencia Somática trabaja con el sistema nervioso para completar ciclos de defensa interrumpidos. Así es cómo funciona y qué ocurre en sesión.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-experiencia-somatica.html' },
    en: { title: 'Somatic Experiencing (SE)', description: "Somatic Experiencing works with the nervous system to complete interrupted defense cycles. Here's how it works and what happens in session.", category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-somatic-experiencing.html' },
    next: 'sistemas-familiares-internos',
  },
  {
    id: 'sistemas-familiares-internos',
    cardAlt: { es: 'Reflejos múltiples del cielo en charcos de agua sobre una calle', en: 'Multiple reflections of the sky in puddles on a quiet street' },
    cardBlurb: { es: 'Conocer las partes que te habitan.', en: 'Getting to know the parts that live in you.' },
    slugEs: 'sistemas-familiares-internos',
    slugEn: 'internal-family-systems',
    heroImage: '/uploads/placeholder-sistemas-familiares-internos.svg',
    heroAlt: {
      es: 'Reflejos múltiples del cielo en charcos de agua sobre una calle, metáfora de la multiplicidad interna',
      en: 'Multiple reflections of the sky in puddles on a quiet street, a metaphor for inner multiplicity',
    },
    heroPosition: 'center 40%',
    es: { title: 'Sistemas Familiares Internos (IFS): conocer las partes que te habitan', description: 'Descubre cómo Internal Family Systems te ayuda a relacionarte con compasión con tu mundo interior y recuperar el liderazgo del Self.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-sistemas-familiares-internos.html' },
    en: { title: 'Internal Family Systems (IFS): getting to know the parts that live in you', description: 'Discover how Internal Family Systems helps you relate with compassion to your inner world and reclaim the leadership of the Self.', category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-internal-family-systems.html' },
    next: 'tapping-eft',
  },
  {
    id: 'tapping-eft',
    cardBlurb: { es: 'Cuando el cuerpo recibe la señal de que ya estás a salvo.', en: 'When the body gets the signal that you\'re safe now.' },
    slugEs: 'tapping-eft',
    slugEn: 'tapping-eft',
    heroImage: '/uploads/placeholder-tapping-eft.svg',
    heroAlt: {
      es: 'Acercamiento a unas yemas de los dedos tocando suavemente la clavícula',
      en: 'Close-up of fingertips gently touching a collarbone',
    },
    heroPosition: 'center 40%',
    es: { title: 'Tapping / EFT: cuando el cuerpo recibe la señal de que ya estás a salvo', description: 'Qué es la Técnica de Libertad Emocional, cómo funciona en el sistema nervioso y para qué sirve en el trabajo terapéutico con Patricio Ruiz.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-tapping-eft.html' },
    en: { title: "Tapping / EFT: when the body gets the signal that you're safe now", description: "What the Emotional Freedom Technique is, how it works in the nervous system, and what it's used for in therapeutic work with Patricio Ruiz.", category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-tapping-eft.html' },
    next: 'core-energetica',
  },
  {
    id: 'core-energetica',
    cardBlurb: { es: 'El cuerpo como archivo emocional.', en: 'The body as an emotional archive.' },
    slugEs: 'core-energetica',
    slugEn: 'core-energetics',
    heroImage: '/uploads/core-energetica-generacion-corpore.webp',
    heroAlt: {
      es: 'Grupo de personas acostadas en disposición radial sobre el pasto, vista en picada, foto de dron',
      en: 'A group of people lying in a radial circle on the grass, seen from above, drone photo',
    },
    heroPosition: '40% 58%',
    heroCaption: {
      es: 'Mi Generación, la 8a, en Córpore: 2015-2017',
      en: 'My Generation, the 8th, at Corpore: 2015-2017',
    },
    es: { title: 'Core Energética: el cuerpo como archivo de tu historia', description: 'La Core Energética trabaja con el cuerpo, la energía y la psique para liberar patrones emocionales que se alojan en la tensión muscular, la postura y la respiración.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-core-energetica.html' },
    en: { title: 'Core Energetics: the body as an archive of your history', description: 'Core Energetics works with the body, energy, and psyche to release emotional patterns held in muscular tension, posture, and breath.', category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-core-energetics.html' },
    next: 'que-esperar-de-la-terapia',
  },
  {
    id: 'que-esperar-de-la-terapia',
    slugEs: 'que-esperar-de-la-terapia',
    slugEn: 'what-to-expect',
    heroImage: '/uploads/que-esperar-terapia.webp',
    heroAlt: {
      es: '¿Qué esperar de la terapia?',
      en: 'What to expect from therapy?',
    },
    heroPosition: 'center 20%',
    es: { title: '¿Qué esperar de la terapia?', description: 'La terapia es un proceso de auto-transformación: revisamos qué versiones de ti siguen respondiendo a un mundo que ya no existe, y las actualizamos.', category: 'Proceso terapéutico', disqusIdentifier: '/blog-que-esperar-de-la-terapia.html' },
    en: { title: 'What to expect from therapy?', description: 'How the therapeutic relationship, techniques, and time come together in a real process.', category: 'Therapeutic process', disqusIdentifier: '/en/blog-what-to-expect.html' },
    next: 'primera-cita',
  },
  {
    id: 'primera-cita',
    cardHeroPosition: { en: 'center 30%' },
    cardBlurb: { es: 'Qué pasa, cuánto dura, qué llevarte.', en: 'What happens, how long it lasts, what to bring.' },
    slugEs: 'primera-cita',
    slugEn: 'first-session',
    heroImage: '/uploads/primera-cita-terapia.webp',
    heroAlt: {
      es: 'Sala de terapia vacía con dos sillones uno frente al otro, luz cálida de tarde',
      en: 'Empty therapy room with two armchairs facing each other, warm afternoon light',
    },
    heroPosition: 'center 35%',
    es: { title: '¿Cómo es la primera cita?', description: 'Saber qué esperar antes y durante la primera sesión de terapia puede calmar la incertidumbre. Así funciona el proceso inicial en mi consulta.', category: 'Primera sesión', disqusIdentifier: '/blog-primera-cita.html' },
    en: { title: "What's a first session usually like?", description: "Knowing what to expect before and during the first therapy session can ease the uncertainty. Here's how the initial process works in my practice.", category: 'First session', disqusIdentifier: '/en/blog-first-session.html' },
    next: 'cuando-es-buen-momento',
  },
  {
    id: 'cuando-es-buen-momento',
    cardHeroPosition: { es: 'center 55%', en: 'center 55%' },
    cardBlurb: { es: 'Las señales que vale la pena escuchar.', en: 'The signs worth listening to.' },
    slugEs: 'cuando-es-buen-momento',
    slugEn: 'good-time-to-start',
    heroImage: '/uploads/buen-momento-pareja.webp',
    heroAlt: {
      es: 'Persona sentada junto a una ventana en la mañana sosteniendo una taza, ambiente contemplativo',
      en: 'Person sitting by a window in morning light, holding a cup, contemplative mood',
    },
    heroPosition: 'center 65%',
    es: { title: '¿Cuándo es buen momento para empezar terapia?', description: 'No hace falta estar en crisis para ir a terapia. Reconoce las señales que piden atención y los mitos que suelen posponer una decisión que vale la pena tomar.', category: 'Bienestar', disqusIdentifier: '/blog-cuando-es-buen-momento-para-iniciar.html' },
    en: { title: 'When is a good time to start therapy?', description: "You don't need to be in crisis to go to therapy. Recognize the signs worth paying attention to, and the myths that tend to postpone a decision worth making.", category: 'Wellbeing', disqusIdentifier: '/en/blog-when-to-start-therapy.html' },
    next: 'estres-cronico',
  },
  {
    id: 'estres-cronico',
    cardBlurb: { es: 'Por qué relajarse no siempre es suficiente.', en: 'Why relaxing isn\'t always enough.' },
    slugEs: 'estres-cronico',
    slugEn: 'chronic-stress',
    heroImage: '/uploads/placeholder-estres-cronico.svg',
    heroAlt: {
      es: 'Reloj de arena junto a una ventana, luz tensa de mediodía',
      en: 'Hourglass by a window, tense midday light',
    },
    heroPosition: 'center 40%',
    es: { title: 'Qué es el estrés crónico y cómo afecta al cuerpo', description: 'El estrés crónico no es un rasgo de carácter ni una señal de debilidad. Es el cuerpo diciéndonos que algo en la forma en que estamos viviendo ya no es sostenible. Aquí exploro qué lo distingue del estrés agudo, cómo se instala en la biología y por qué relajarse no siempre es suficiente.', category: 'Sistema nervioso', disqusIdentifier: '/blog-estres-cronico.html' },
    en: { title: 'What chronic stress is and how it affects the body', description: "Chronic stress isn't a personality trait or a sign of weakness. It's the body telling us that something about how we're living is no longer sustainable. Here I explore what sets it apart from acute stress, how it settles into biology, and why relaxing isn't always enough.", category: 'Nervous system', disqusIdentifier: '/en/blog-chronic-stress.html' },
    next: 'ansiedad-somatica',
  },
  {
    id: 'ansiedad-somatica',
    cardBlurb: { es: 'Cómo el cuerpo registra la ansiedad antes que la mente le ponga nombre.', en: 'How the body registers anxiety before the mind can name it.' },
    slugEs: 'ansiedad-somatica',
    slugEn: 'somatic-anxiety',
    heroImage: '/uploads/placeholder-ansiedad-somatica.svg',
    heroAlt: {
      es: 'Manos entrelazadas sobre el pecho, respiración consciente',
      en: 'Hands clasped over the chest, conscious breathing',
    },
    heroPosition: 'center 40%',
    es: { title: 'Siento ansiedad en el cuerpo, no solo en la mente', description: 'La ansiedad somática se manifiesta como tensión, opresión en el pecho o intestino revuelto antes de que la mente pueda ponerle nombre. Entender cómo el cuerpo registra la ansiedad es el primer paso para trabajar con ella desde adentro.', category: 'Bienestar', disqusIdentifier: '/blog-ansiedad-somatica.html' },
    en: { title: 'I feel anxiety in my body, not just my mind', description: 'Somatic anxiety shows up as tension, chest tightness, or a knotted stomach before the mind can put a name to it. Understanding how the body registers anxiety is the first step to working with it from the inside.', category: 'Wellbeing', disqusIdentifier: '/en/blog-somatic-anxiety.html' },
    next: 'regulacion-sistema-nervioso',
  },
  {
    id: 'regulacion-sistema-nervioso',
    cardBlurb: { es: 'No es calmarse con fuerza de voluntad.', en: 'It isn\'t calming down through willpower.' },
    slugEs: 'regulacion-sistema-nervioso',
    slugEn: 'nervous-system-regulation',
    heroImage: '/uploads/placeholder-regulacion-sistema-nervioso.svg',
    heroAlt: {
      es: 'Balanza suspendida en equilibrio, luz suave',
      en: 'Balance scale suspended in equilibrium, soft light',
    },
    heroPosition: 'center 40%',
    es: { title: 'Qué es la regulación del sistema nervioso y por qué importa', description: 'Regular el sistema nervioso no es calmarse con fuerza de voluntad. Es recuperar la capacidad de moverse fluidamente entre activación y reposo. Aquí exploro qué significa esto en la práctica, cómo se trabaja en terapia y por qué es la base de todo lo demás.', category: 'Sistema nervioso', disqusIdentifier: '/blog-regulacion-sistema-nervioso.html' },
    en: { title: 'What nervous system regulation means and why it matters', description: "Regulating the nervous system isn't about calming down through willpower. It's about recovering the capacity to move fluidly between activation and rest. Here I explore what this means in practice, how it's worked with in therapy, and why it's the foundation everything else rests on.", category: 'Nervous system', disqusIdentifier: '/en/blog-nervous-system-regulation.html' },
    next: 'trauma-sin-diagnosticar',
  },
  {
    id: 'trauma-sin-diagnosticar',
    cardBlurb: { es: 'El trauma es lo que queda en el cuerpo, no lo que ocurrió.', en: 'Trauma is what stays in the body, not what occurred.' },
    slugEs: 'trauma-sin-diagnosticar',
    slugEn: 'undiagnosed-trauma',
    heroImage: '/uploads/placeholder-trauma-sin-diagnosticar.svg',
    heroAlt: {
      es: 'Silueta pensativa mirando por una ventana empañada',
      en: 'Pensive silhouette looking through a fogged-up window',
    },
    heroPosition: 'center 40%',
    es: { title: 'No puedo dejar de pensar en algo que pasó', description: 'La rumiación persistente sobre algo del pasado puede ser una señal de trauma sin diagnosticar. No necesita haber sido un evento dramático: el trauma es lo que queda en el cuerpo, no lo que ocurrió.', category: 'Bienestar', disqusIdentifier: '/blog-trauma-sin-diagnosticar.html' },
    en: { title: "I can't stop thinking about something that happened", description: "Persistent rumination about something from the past can be a sign of undiagnosed trauma. It doesn't need to have been a dramatic event: trauma is what remains in the body, not what occurred.", category: 'Wellbeing', disqusIdentifier: '/en/blog-undiagnosed-trauma.html' },
    next: 'duelo-somatico',
  },
  {
    id: 'duelo-somatico',
    cardBlurb: { es: 'El duelo no se resuelve — se integra.', en: 'Grief doesn\'t resolve — it integrates.' },
    slugEs: 'duelo-somatico',
    slugEn: 'somatic-grief',
    heroImage: '/uploads/placeholder-duelo-somatico.svg',
    heroAlt: {
      es: 'Pluma blanca flotando suavemente en el aire',
      en: 'White feather floating gently in the air',
    },
    heroPosition: 'center 40%',
    es: { title: 'Duelo: cuando la pérdida se queda en el cuerpo', description: "El duelo no es un proceso que se resuelve. Es algo que se integra. Y antes de poder integrarlo, hay que dejar de presionarse para 'ya estar bien'.", category: 'Bienestar', disqusIdentifier: '/blog-duelo-somatico.html' },
    en: { title: 'Grief: when loss stays in the body', description: "Grief isn't a process that gets resolved. It's something that gets integrated. And before that integration is possible, you have to stop pressuring yourself to already 'be fine'.", category: 'Wellbeing', disqusIdentifier: '/en/blog-somatic-grief.html' },
    next: 'terapia-adolescentes',
  },
  {
    id: 'terapia-adolescentes',
    cardBlurb: { es: 'Una de las reorganizaciones neurológicas más profundas de la vida.', en: 'One of the deepest neurological reorganizations of a lifetime.' },
    slugEs: 'terapia-adolescentes',
    slugEn: 'teen-therapy',
    heroImage: '/uploads/placeholder-terapia-adolescentes.svg',
    heroAlt: {
      es: 'Brote verde emergiendo de la tierra, luz de mañana',
      en: 'Green sprout emerging from the soil, morning light',
    },
    heroPosition: 'center 40%',
    es: { title: 'Terapia para adolescentes: cuándo y cómo', description: 'La adolescencia no es una etapa difícil que hay que aguantar — es una de las reorganizaciones neurológicas más profundas de la vida. Aquí exploro cuándo puede ayudar la terapia y cómo funciona en la práctica.', category: 'Proceso terapéutico', disqusIdentifier: '/blog-terapia-adolescentes.html' },
    en: { title: 'Therapy for teenagers: when and how', description: "Adolescence isn't a difficult phase you just have to get through — it's one of the deepest neurological reorganizations of a lifetime. Here I explore when therapy can help and how it works in practice.", category: 'Therapeutic process', disqusIdentifier: '/en/blog-teen-therapy.html' },
    next: 'patrones-de-pareja',
  },
  {
    id: 'patrones-de-pareja',
    cardBlurb: { es: 'Reconocer el ciclo es el primer paso para salir de él.', en: 'Recognizing the cycle is the first step out of it.' },
    slugEs: 'patrones-de-pareja',
    slugEn: 'couples-patterns',
    heroImage: '/uploads/placeholder-patrones-de-pareja.svg',
    heroAlt: {
      es: 'Dos siluetas en espejo, movimiento circular',
      en: 'Two mirrored silhouettes, circular motion',
    },
    heroPosition: 'center 40%',
    es: { title: 'Mi pareja y yo repetimos siempre el mismo patrón', description: 'La mayoría de las parejas no tienen un problema nuevo cada semana — tienen el mismo problema disfrazado de distintas situaciones. Reconocer el ciclo es el primer paso para salir de él.', category: 'Bienestar', disqusIdentifier: '/blog-patrones-de-pareja.html' },
    en: { title: 'My partner and I keep repeating the same pattern', description: "Most couples don't have a new problem every week — they have the same problem wearing a different costume each time. Recognizing the cycle is the first step to getting out of it.", category: 'Wellbeing', disqusIdentifier: '/en/blog-couples-patterns.html' },
    next: 'terapia-individual-o-pareja',
  },
  {
    id: 'terapia-individual-o-pareja',
    cardBlurb: { es: 'La respuesta casi nunca es binaria.', en: 'The answer is almost never binary.' },
    slugEs: 'terapia-individual-o-pareja',
    slugEn: 'individual-or-couples-therapy',
    heroImage: '/uploads/placeholder-terapia-individual-o-pareja.svg',
    heroAlt: {
      es: 'Dos caminos que se bifurcan en un bosque claro',
      en: 'Two paths splitting in a bright forest',
    },
    heroPosition: 'center 40%',
    es: { title: '¿Necesito terapia individual o de pareja?', description: 'Es una de las preguntas que más me hacen antes de la primera sesión. La respuesta casi nunca es binaria — y explorarla juntos suele ser el mejor punto de partida.', category: 'Proceso terapéutico', disqusIdentifier: '/blog-terapia-individual-o-pareja.html' },
    en: { title: 'Do I need individual or couples therapy?', description: "It's one of the questions I get asked most before a first session. The answer is almost never binary — and exploring it together is usually the best place to start.", category: 'Therapeutic process', disqusIdentifier: '/en/blog-individual-or-couples-therapy.html' },
    next: 'terapia-presencial-vs-online',
  },
  {
    id: 'terapia-presencial-vs-online',
    cardBlurb: { es: 'Qué dice la evidencia y cómo pienso la elección.', en: 'What the evidence says and how I think about the choice.' },
    slugEs: 'terapia-presencial-vs-online',
    slugEn: 'in-person-vs-online-therapy',
    heroImage: '/uploads/placeholder-terapia-presencial-vs-online.svg',
    heroAlt: {
      es: 'Pantalla iluminada junto a una silla vacía en un espacio cálido',
      en: 'Lit screen beside an empty chair in a warm room',
    },
    heroPosition: 'center 40%',
    es: { title: 'Terapia presencial vs online: ¿qué funciona mejor?', description: 'La terapia en línea funciona. Pero hay matices. Te cuento qué dice la evidencia y cómo pienso yo la elección entre modalidad presencial y online según el proceso de cada persona.', category: 'Proceso terapéutico', disqusIdentifier: '/blog-terapia-presencial-vs-online.html' },
    en: { title: 'In-person vs online therapy: which works better?', description: "Online therapy works. But there are nuances. Here's what the evidence says and how I think about the choice between in-person and online, depending on each person's process.", category: 'Therapeutic process', disqusIdentifier: '/en/blog-in-person-vs-online-therapy.html' },
    next: 'psicologo-psicoterapeuta-psiquiatra',
  },
  {
    id: 'psicologo-psicoterapeuta-psiquiatra',
    cardBlurb: { es: 'La pregunta más frecuente de quien busca ayuda por primera vez.', en: 'The most frequent question from anyone seeking help for the first time.' },
    slugEs: 'psicologo-psicoterapeuta-psiquiatra',
    slugEn: 'psychologist-therapist-psychiatrist',
    heroImage: '/uploads/placeholder-psicologo-psicoterapeuta-psiquiatra.svg',
    heroAlt: {
      es: 'Brújula sobre un mapa, luz cálida de escritorio',
      en: 'Compass on a map, warm desk light',
    },
    heroPosition: 'center 40%',
    es: { title: 'Diferencia entre psicólogo, psicoterapeuta y psiquiatra', description: 'Es la pregunta más frecuente de quien considera buscar ayuda por primera vez. Te explico en qué se diferencian estas tres figuras y cómo encontrar lo que necesitas.', category: 'Proceso terapéutico', disqusIdentifier: '/blog-psicologo-psicoterapeuta-psiquiatra.html' },
    en: { title: 'The difference between a psychologist, a psychotherapist, and a psychiatrist', description: 'It’s the most frequent question from anyone considering seeking help for the first time. I explain what sets these three roles apart and how to find what you actually need.', category: 'Therapeutic process', disqusIdentifier: '/en/blog-psychologist-therapist-psychiatrist.html' },
    next: 'que-esperar-de-la-terapia',
  },
  {
    id: 'tipos-de-terapia',
    cardAlt: { es: 'Fotografía con acercamiento a un par de manos que se tocan cálida y firmemente', en: 'Close-up photograph of a pair of hands touching each other warmly and firmly' },
    cardHeroPosition: { es: 'center 55%' },
    cardBlurb: { es: 'Cuatro aproximaciones que integro.', en: 'Four approaches I integrate.' },
    slugEs: 'tipos-de-terapia',
    slugEn: 'types-of-therapy',
    heroImage: '/uploads/tipos-terapia.webp',
    heroAlt: {
      es: 'Tipos de terapia',
      en: 'Types of therapy',
    },
    heroPosition: 'center 25%',
    es: { title: 'Tipos de terapia: cómo trabajo en sesión', description: 'Cuatro aproximaciones que integro para acompañarte desde el cuerpo, las emociones y la historia que cargas.', category: 'Aproximaciones terapéuticas', disqusIdentifier: '/blog-tipos-de-terapia.html' },
    en: { title: 'Types of therapy: how I work in session', description: 'Four approaches I integrate to support you through the body, emotions, and the story you carry.', category: 'Therapeutic approaches', disqusIdentifier: '/en/blog-types-of-therapy.html' },
    next: null,
  },
];

export function getPost(id: string): PostEntry | undefined {
  return posts.find(p => p.id === id);
}

export function getPostBySlug(locale: Locale, slug: string): PostEntry | undefined {
  return posts.find(p => (locale === 'es' ? p.slugEs : p.slugEn) === slug);
}

export function postHref(locale: Locale, id: string): string {
  const p = getPost(id);
  if (!p) return '#';
  const slug = locale === 'es' ? p.slugEs : p.slugEn;
  return `/${locale}/blog/${slug}/`;
}

export function nextPostFor(id: string, locale: Locale): { href: string; label: string } | null {
  const p = getPost(id);
  if (!p || !p.next) return null;
  const n = getPost(p.next);
  if (!n) return null;
  return { href: postHref(locale, n.id), label: `${n[locale].title} →` };
}

// Display order for the /recursos/ and /resources/ card grid, excluding
// 'que-esperar-de-la-terapia' which is shown separately as the featured post.
export const resourcesGridOrder: string[] = [
  'primera-cita',
  'cuando-es-buen-momento',
  'tipos-de-terapia',
  'terapia-corporal',
  'teoria-polivagal',
  'experiencia-somatica',
  'sistemas-familiares-internos',
  'tapping-eft',
  'core-energetica',
  'ansiedad-somatica',
  'duelo-somatico',
  'estres-cronico',
  'patrones-de-pareja',
  'psicologo-psicoterapeuta-psiquiatra',
  'regulacion-sistema-nervioso',
  'terapia-adolescentes',
  'terapia-individual-o-pareja',
  'terapia-presencial-vs-online',
  'trauma-sin-diagnosticar',
];

export function getResourcesGrid(): PostEntry[] {
  return resourcesGridOrder.map(id => getPost(id)!).filter(Boolean);
}
