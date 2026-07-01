export interface Testimonial {
  id: string;
  q: string;
  name: string;
  link: string | null;
  tag: string | null;
}

// Canonical list, same ids/order in both locales. Full list is shown on
// /es/testimonios/ and /en/testimonials/; the home page teaser shows only
// the subset in `homeTeaserIds` (in that order).
export const testimonials: Record<'es' | 'en', Testimonial[]> = {
  es: [
    { id: 'dan-gunter', q: 'Me cambió la vida. He aprendido a atravesar mi ansiedad y mis ataques de pánico de una manera mucho más suave, y esto me ha brindado paz y confianza en mi propio poder y autorregulación.', name: 'Dan Gunter', link: null, tag: null },
    { id: 'isabel-de-la-rosa', q: 'Mi cuerpo está más equilibrado y recuperando la salud. Hay menos dolor y más energía. La presencia compasiva, paciente y abierta de Pato me ha permitido mirarme más completa.', name: 'Isabel de la Rosa', link: 'https://www.youtube.com/@DescubrimientoInterior', tag: null },
    { id: 'valeria-salazar', q: 'En mi proceso me he sentido siempre cobijada, respaldada, respetada y sobre todo que no estoy sola y que cuento con un lugar seguro.', name: 'Valeria Salazar', link: null, tag: null },
    { id: 'kar-el', q: 'He desarrollado tolerancia ante asuntos que me hacían saltar, que ahora puedo manejar con más consciencia, bajarles la intensidad y disminuir su duración.', name: 'Kar-El', link: 'https://www.instagram.com/karellifesherpa/', tag: 'Life Sherpa' },
    { id: 'paloma-tovar', q: 'Estamos en terapia familiar mi hija adolescente y yo, y ahora es de una apertura hermosa. Andar las crisis de la adolescencia contigo acompañándonos ha sido de los procesos más hermosos que hemos vivido.', name: 'Paloma Tovar', link: null, tag: 'Terapia familiar' },
    { id: 'anonimo-pareja', q: 'Llegamos por una terrible crisis de pareja. Aprendimos a comunicarnos sin miedo, a expresar nuestras diferencias de manera civilizada y a evitar que un problema estalle irremediablemente.', name: 'Anónimo', link: null, tag: 'Terapia de pareja' },
    { id: 'thalia-dorronsoro', q: 'Aprendí a priorizarme y a hacerme las preguntas necesarias para encontrar el core, entendiendo que lo que siento es válido. Siempre me sentí muy segura.', name: 'Thalía Dorronsoro', link: null, tag: null },
    { id: 'renato-picard', q: 'Quería reconectarme con mis emociones desde el sentir y no desde lo mental. Hoy vivo más pleno, con más tranquilidad y paz.', name: 'Renato Picard', link: null, tag: null },
    { id: 'maru-marquez', q: 'Me gusta que salgo del relato y puedo sentir con más honestidad. He aprendido a reconocer las memorias de mi cuerpo y lo que me dicen de mí.', name: 'Maru Marquez', link: null, tag: null },
    { id: 'alejandra-bm', q: 'Un proceso muy suave, respetuoso y amoroso, de movimientos sutiles que me han ayudado a liberarme de la desregulación de mi sistema nervioso. Aprendí que menos es más.', name: 'Alejandra BM', link: null, tag: null },
    { id: 'jackie-baltazar', q: 'Cada sesión fue muy significativa: darme el momento para respirar y sentirme en consciencia. Ha sido un paso de crecimiento mucho mayor que otros en mi vida.', name: 'Jackie Baltazar', link: null, tag: null },
    { id: 'margarita-costa', q: 'Lo más importante ha sido el proceso de autoaceptación y validación en mi estima quebrantada, desde el respeto a cada expresión y la suavidad de los movimientos.', name: 'Margarita Costa', link: null, tag: null },
    { id: 'nay', q: 'Aprendí a decir las cosas y no guardármelas. Definitivamente cambió mi relación y mi visión de cómo hacía y decía las cosas antes de la terapia.', name: 'Nay', link: null, tag: 'Terapia de pareja' },
    { id: 'chiara-v', q: 'In every session I learn something about myself, my past and my traumas. Most importantly, I overcome traumas that were stuck in me — slowly I found my way up again.', name: 'Chiara V', link: null, tag: null },
    { id: 'anonimo-botiquin', q: 'El proceso fue suave, amoroso y profundo; me ayudó a mirar mis propios límites sin sentirme desbordada. Es como tener un botiquín de primeros auxilios conmigo.', name: 'Anónimo', link: null, tag: null },
  ],
  en: [
    { id: 'dan-gunter', q: 'It changed my life. I have learned to move through my anxiety and panic attacks in a much gentler way, and this has given me peace and confidence in my own power and self-regulation.', name: 'Dan Gunter', link: null, tag: null },
    { id: 'isabel-de-la-rosa', q: "My body is more balanced and recovering its health. There is less pain and more energy. Pato's compassionate, patient and open presence has allowed me to see myself more fully.", name: 'Isabel de la Rosa', link: 'https://www.youtube.com/@DescubrimientoInterior', tag: null },
    { id: 'valeria-salazar', q: 'Throughout my process I have always felt held, supported, respected, and above all that I am not alone and that I have a safe place.', name: 'Valeria Salazar', link: null, tag: null },
    { id: 'kar-el', q: 'I have developed tolerance for issues that used to make me jump, which I can now handle with more awareness, bring down the intensity and shorten their duration.', name: 'Kar-El', link: 'https://www.instagram.com/karellifesherpa/', tag: 'Life Sherpa' },
    { id: 'paloma-tovar', q: 'My teenage daughter and I are in family therapy, and now she opens up beautifully. Walking through the crises of adolescence with you alongside us has been one of the most beautiful processes we have ever lived.', name: 'Paloma Tovar', link: null, tag: 'Family therapy' },
    { id: 'anonimo-pareja', q: 'We came because of a terrible crisis as a couple. We learned to communicate without fear, to express our differences in a civilized way, and to prevent a problem from exploding beyond repair.', name: 'Anonymous', link: null, tag: 'Couples therapy' },
    { id: 'thalia-dorronsoro', q: 'I learned to prioritize myself and to ask the right questions to find the core, understanding that what I feel is valid. I always felt very safe.', name: 'Thalia Dorronsoro', link: null, tag: null },
    { id: 'renato-picard', q: 'I wanted to reconnect with my emotions through feeling rather than thinking. Today I live more fully, with more calm and peace.', name: 'Renato Picard', link: null, tag: null },
    { id: 'maru-marquez', q: 'I like that I step out of the narrative and can feel with more honesty. I have learned to recognize the memories in my body and what they tell me about myself.', name: 'Maru Marquez', link: null, tag: null },
    { id: 'alejandra-bm', q: 'A very gentle, respectful and loving process, with subtle movements that have helped me free myself from the dysregulation of my nervous system. I learned that less is more.', name: 'Alejandra BM', link: null, tag: null },
    { id: 'jackie-baltazar', q: 'Every session was deeply meaningful: giving myself the moment to breathe and feel myself with awareness. It has been a step of growth far greater than others in my life.', name: 'Jackie Baltazar', link: null, tag: null },
    { id: 'margarita-costa', q: 'The most important thing has been the process of self-acceptance and validation of my broken self-esteem, through respect for every expression and the gentleness of the movements.', name: 'Margarita Costa', link: null, tag: null },
    { id: 'nay', q: 'I learned to say things and not keep them inside. It definitely changed my relationship and my view of how I used to do and say things before therapy.', name: 'Nay', link: null, tag: 'Couples therapy' },
    { id: 'chiara-v', q: 'In every session I learn something about myself, my past and my traumas. Most importantly, I overcome traumas that were stuck in me — and slowly I found my way up again.', name: 'Chiara V', link: null, tag: null },
    { id: 'anonimo-botiquin', q: "The process was gentle, loving and deep; it helped me look at my own limits without feeling overwhelmed. It's like having a first-aid kit with me at all times.", name: 'Anonymous', link: null, tag: null },
  ],
};

export const homeTeaserIds = [
  'dan-gunter', 'isabel-de-la-rosa', 'valeria-salazar', 'kar-el', 'paloma-tovar',
  'thalia-dorronsoro', 'renato-picard', 'alejandra-bm', 'chiara-v', 'anonimo-pareja',
];
