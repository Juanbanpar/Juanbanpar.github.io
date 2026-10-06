export const languages = ['en', 'gl', 'es'] as const;
export type Language = (typeof languages)[number];
export type Section = 'home' | 'about' | 'work' | 'writing';
export const languageNames: Record<Language, string> = { en: 'English', gl: 'Galego', es: 'Español' };

export function pathFor(language: Language, section: Section = 'home'): string {
  const prefix = language === 'en' ? '' : `/${language}`;
  return `${prefix}/${section === 'home' ? '' : `${section}/`}`;
}

export const ui = {
  en: {
    nav: { home: 'Home', about: 'About', work: 'Work', writing: 'Writing' },
    role: 'Research & engineering',
    greeting: "Hi, I'm Juan.",
    introduction: 'I write software and ask awkward questions about what it trusts.',
    introDetail: 'Software engineer and cybersecurity researcher at Gradiant. I work on cryptography, confidential computing, and Linux/RISC-V systems.',
    aboutLink: 'More about me', workLink: 'All work', writingLink: 'All writing',
    interests: 'Areas of interest', selected: 'Selected work', latest: 'Latest writing',
    workIntro: "Papers I've co-written, talks I've given, and things I've built.",
    writingIntro: 'Notes on security, code, and things I probably spent too long investigating.',
    writingEmpty: 'No posts yet. For now, the code and talks are in Work.',
    publications: 'Publications', talks: 'Talks', projects: 'Projects',
    paper: 'Publication', talk: 'Talk', project: 'Project', article: 'Article', note: 'Note',
    paperLink: 'Proceedings', talkLink: 'Event', codeLink: 'Source code', demoLink: 'Try WepSIM',
    skip: 'Skip to content', languages: 'Language', theme: 'Color theme',
    themeSystem: 'System', themeLight: 'Light', themeDark: 'Dark',
    translations: 'Translations', archiveLabel: 'Writing archive', archiveFallback: 'Writing archive; this entry is not translated',
    back: 'Back to writing', notFound: 'Page not found',
    notFoundIntro: 'This page may have moved, or the address may be incorrect.', returnHome: 'Return home',
    rss: 'RSS feed', footer: 'Code, cryptography, and occasional detours.',
    aboutDescription: 'Background, experience, and interests of Juan Banga Pardo, software engineer and cybersecurity researcher.',
    writingDescription: 'Articles and notes by Juan Banga Pardo on cryptography, security, and systems.',
  },
  gl: {
    nav: { home: 'Inicio', about: 'Sobre min', work: 'Traballo', writing: 'Escritos' },
    role: 'Investigación e enxeñaría',
    greeting: 'Ola, son Juan.',
    introduction: 'Escribo software e fago preguntas incómodas sobre en que confía.',
    introDetail: 'Enxeñeiro de software e investigador en ciberseguridade en Gradiant. Traballo en criptografía, computación confidencial e sistemas Linux/RISC-V.',
    aboutLink: 'Máis sobre min', workLink: 'Todo o traballo', writingLink: 'Todos os escritos',
    interests: 'Áreas de interese', selected: 'Traballo seleccionado', latest: 'Últimos escritos',
    workIntro: 'Artigos nos que participei, charlas que dei e cousas que desenvolvín.',
    writingIntro: 'Notas sobre seguridade, código e cousas que probablemente investiguei máis tempo da conta.',
    writingEmpty: 'Aínda non hai entradas. Polo de agora, o código e as charlas están en Traballo.',
    publications: 'Publicacións', talks: 'Charlas', projects: 'Proxectos',
    paper: 'Publicación', talk: 'Charla', project: 'Proxecto', article: 'Artigo', note: 'Nota',
    paperLink: 'Actas', talkLink: 'Evento', codeLink: 'Código fonte', demoLink: 'Probar WepSIM',
    skip: 'Saltar ao contido', languages: 'Idioma', theme: 'Tema de cor',
    themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Escuro',
    translations: 'Traducións', archiveLabel: 'Arquivo de escritos', archiveFallback: 'Arquivo de escritos; esta entrada non está traducida',
    back: 'Volver aos escritos', notFound: 'Páxina non atopada',
    notFoundIntro: 'Esta páxina pode ter cambiado de sitio ou o enderezo pode ser incorrecto.', returnHome: 'Volver ao inicio',
    rss: 'Fonte RSS', footer: 'Código, criptografía e algún desvío.',
    aboutDescription: 'Traxectoria, experiencia e intereses de Juan Banga Pardo, enxeñeiro de software e investigador en ciberseguridade.',
    writingDescription: 'Artigos e notas de Juan Banga Pardo sobre criptografía, seguridade e sistemas.',
  },
  es: {
    nav: { home: 'Inicio', about: 'Sobre mí', work: 'Trabajo', writing: 'Escritos' },
    role: 'Investigación e ingeniería',
    greeting: 'Hola, soy Juan.',
    introduction: 'Escribo software y hago preguntas incómodas sobre en qué confía.',
    introDetail: 'Ingeniero de software e investigador en ciberseguridad en Gradiant. Trabajo en criptografía, computación confidencial y sistemas Linux/RISC-V.',
    aboutLink: 'Más sobre mí', workLink: 'Todo el trabajo', writingLink: 'Todos los escritos',
    interests: 'Áreas de interés', selected: 'Trabajo seleccionado', latest: 'Últimos escritos',
    workIntro: 'Artículos que he escrito con otros, charlas que he dado y cosas que he desarrollado.',
    writingIntro: 'Notas sobre seguridad, código y cosas que probablemente investigué más tiempo de la cuenta.',
    writingEmpty: 'Todavía no hay entradas. Por ahora, el código y las charlas están en Trabajo.',
    publications: 'Publicaciones', talks: 'Charlas', projects: 'Proyectos',
    paper: 'Publicación', talk: 'Charla', project: 'Proyecto', article: 'Artículo', note: 'Nota',
    paperLink: 'Actas', talkLink: 'Evento', codeLink: 'Código fuente', demoLink: 'Probar WepSIM',
    skip: 'Saltar al contenido', languages: 'Idioma', theme: 'Tema de color',
    themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Oscuro',
    translations: 'Traducciones', archiveLabel: 'Archivo de escritos', archiveFallback: 'Archivo de escritos; esta entrada no está traducida',
    back: 'Volver a los escritos', notFound: 'Página no encontrada',
    notFoundIntro: 'Esta página puede haberse movido o la dirección puede ser incorrecta.', returnHome: 'Volver al inicio',
    rss: 'Fuente RSS', footer: 'Código, criptografía y algún desvío.',
    aboutDescription: 'Trayectoria, experiencia e intereses de Juan Banga Pardo, ingeniero de software e investigador en ciberseguridad.',
    writingDescription: 'Artículos y notas de Juan Banga Pardo sobre criptografía, seguridad y sistemas.',
  },
} satisfies Record<Language, Record<string, unknown>>;

export const interests: Record<Language, string[]> = {
  en: ['Cryptographic inventories & agility', 'Post-quantum migration', 'Confidential computing & attestation', 'Linux & RISC-V security'],
  gl: ['Inventarios e axilidade criptográfica', 'Migración poscuántica', 'Computación confidencial e atestación', 'Seguridade en Linux e RISC-V'],
  es: ['Inventarios y agilidad criptográfica', 'Migración poscuántica', 'Computación confidencial y atestación', 'Seguridad en Linux y RISC-V'],
};
