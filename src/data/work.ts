import type { Language } from '../lib/i18n';

type Localized = Record<Language, string>;
export type WorkItem = {
  id: string;
  kind: 'paper' | 'talk' | 'project';
  title: string;
  context: string | Localized;
  year?: string;
  summary: Localized;
  links: { label: 'paperLink' | 'talkLink' | 'codeLink' | 'demoLink'; url: string }[];
};

export const work: WorkItem[] = [
  {
    id: 'recsi-2026', kind: 'paper', year: '2026',
    title: 'Inventarios criptográficos para una migración postcuántica ágil y segura',
    context: 'Juan Banga Pardo, Santiago de Vicente Poutás, Xavier Martínez Luaña · RECSI 2026 · pp. 194–199',
    summary: {
      en: 'A framework for cryptographic inventories combining automated discovery, static and dynamic analysis, passive monitoring, and CBOM-based consolidation.',
      gl: 'Un marco para inventarios criptográficos que combina descubrimento automatizado, análise estática e dinámica, monitorización pasiva e consolidación mediante CBOM.',
      es: 'Un marco para inventarios criptográficos que combina descubrimiento automatizado, análisis estático y dinámico, monitorización pasiva y consolidación mediante CBOM.',
    },
    links: [{ label: 'paperLink', url: 'https://cryptull.webs.ull.es/RECSI2026/LibrodeActasRECSI2026.pdf' }],
  },
  {
    id: 'stic-2025', kind: 'talk', year: '2025', title: 'Visibilidad total, agilidad real',
    context: 'XIX Jornadas STIC CCN-CERT · 27.11.2025',
    summary: {
      en: 'Cryptographic discovery, inventories, and methodologies for a secure transition to post-quantum cryptography. From mapping algorithms, keys, and protocols to operational migration planning.',
      gl: 'Descubrimento criptográfico, inventarios e metodoloxías para unha transición segura á criptografía poscuántica. Desde identificar algoritmos, claves e protocolos ata planificar a migración.',
      es: 'Descubrimiento criptográfico, inventarios y metodologías para una transición segura a la criptografía poscuántica. Desde identificar algoritmos, claves y protocolos hasta planificar la migración.',
    },
    links: [{ label: 'talkLink', url: 'https://jornadas.ccn-cert.cni.es/es/xixjornadas-programa-general/xix-jornadas-ccn-cert/ponencia/d27-s16-1000-1025' }],
  },
  {
    id: 'gul-2019', kind: 'talk', year: '2019', title: 'Pulse aquí para optimizar su PC un 101%',
    context: 'XXXIII Jornadas Técnicas del GUL · UC3M · 19.02.2019',
    summary: {
      en: 'A practical talk on performance optimization and energy consumption in GNU/Linux systems, assessing existing configurations and possible improvements.',
      gl: 'Unha charla práctica sobre optimización do rendemento e consumo enerxético en sistemas GNU/Linux, con avaliación de configuracións e posibles melloras.',
      es: 'Una charla práctica sobre optimización del rendimiento y consumo energético en sistemas GNU/Linux, con evaluación de configuraciones y posibles mejoras.',
    },
    links: [{ label: 'talkLink', url: 'https://cursos-gul.uc3m.es/xxxiii-jornadas-tecnicas-del-gul/pulse-aqui-para-optimizar-su-pc-un-101' }],
  },
  {
    id: 'wepsim', kind: 'project', title: 'WepSIM · RISC-V',
    context: { en: 'RISC-V · Education · Microarchitecture', gl: 'RISC-V · Educación · Microarquitectura', es: 'RISC-V · Educación · Microarquitectura' },
    summary: {
      en: 'Contributed a RISC-V microprocessor to the educational WepSIM simulator, implementing its architecture, microprogramming, and compiler/assembler support. Developed as my master’s thesis at UC3M.',
      gl: 'Contribuín cun microprocesador RISC-V ao simulador didáctico WepSIM, implementando a arquitectura, a microprogramación e o soporte de compilador/ensamblador. Foi o meu traballo de fin de mestrado na UC3M.',
      es: 'Contribuí con un microprocesador RISC-V al simulador didáctico WepSIM, implementando la arquitectura, la microprogramación y el soporte de compilador/ensamblador. Fue mi trabajo de fin de máster en la UC3M.',
    },
    links: [
      { label: 'codeLink', url: 'https://github.com/Juanbanpar/wepsim-rv' },
      { label: 'demoLink', url: 'https://wepsim.github.io/wepsim/ws_dist/wepsim-classic.html' },
    ],
  },
  {
    id: 'pkcs11-stack', kind: 'project', title: 'pkcs11-stack', context: 'Rust · PKCS#11 · TLS',
    summary: {
      en: 'Rust libraries and a CLI for managing PKCS#11 tokens and hardware security modules, signing messages, and using token keys for TLS authentication with rustls.',
      gl: 'Bibliotecas en Rust e unha ferramenta de liña de comandos para xestionar tokens PKCS#11 e módulos de seguridade hardware, asinar mensaxes e usar claves dos tokens para autenticación TLS con rustls.',
      es: 'Bibliotecas en Rust y una herramienta de línea de comandos para gestionar tokens PKCS#11 y módulos de seguridad hardware, firmar mensajes y usar claves de los tokens para autenticación TLS con rustls.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/pkcs11-stack' }],
  },
  {
    id: 'denywhy', kind: 'project', title: 'denywhy',
    context: { en: 'Rust · Linux · Permission diagnostics', gl: 'Rust · Linux · Diagnóstico de permisos', es: 'Rust · Linux · Diagnóstico de permisos' },
    summary: {
      en: 'Traces Linux commands to explain permission failures, checking file permissions, ACLs, capabilities, mount flags, and available security audit records.',
      gl: 'Rastrexa comandos de Linux para explicar fallos de permisos, comprobando permisos de ficheiros, ACL, capacidades, opcións de montaxe e rexistros de auditoría de seguridade dispoñibles.',
      es: 'Rastrea comandos de Linux para explicar fallos de permisos, comprobando permisos de archivos, ACL, capacidades, opciones de montaje y registros de auditoría de seguridad disponibles.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/denywhy' }],
  },
  {
    id: 'watchdoctor', kind: 'project', title: 'watchdoctor', context: 'Rust · Linux · inotify',
    summary: {
      en: 'Diagnoses Linux file-watcher exhaustion by identifying processes holding inotify instances and watches, and comparing usage with inotify and file descriptor limits.',
      gl: 'Diagnostica o esgotamento dos recursos de vixilancia de ficheiros en Linux, identificando os procesos que manteñen instancias e vixilancias de inotify e comparando o uso cos límites de inotify e de descritores de ficheiro.',
      es: 'Diagnostica el agotamiento de los recursos de vigilancia de archivos en Linux, identificando los procesos que mantienen instancias y vigilancias de inotify y comparando el uso con los límites de inotify y de descriptores de archivo.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/watchdoctor' }],
  },
  {
    id: 'cargo-unsafe-surface', kind: 'project', title: 'cargo-unsafe-surface',
    context: { en: 'Rust · Static analysis · FFI', gl: 'Rust · Análise estática · FFI', es: 'Rust · Análisis estático · FFI' },
    summary: {
      en: 'A Cargo subcommand that approximates which unsafe operations and FFI calls are reachable from Rust entry points, showing the call paths and unresolved calls.',
      gl: 'Un subcomando de Cargo que estima que operacións unsafe e chamadas FFI son alcanzables desde os puntos de entrada de Rust, amosando as rutas de chamadas e as chamadas sen resolver.',
      es: 'Un subcomando de Cargo que estima qué operaciones unsafe y llamadas FFI son alcanzables desde los puntos de entrada de Rust, mostrando las rutas de llamadas y las llamadas sin resolver.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/cargo-unsafe-surface' }],
  },
  {
    id: 'binport', kind: 'project', title: 'binport', context: 'Rust · Linux · ELF',
    summary: {
      en: 'A tool for checking Linux ELF binaries for ABI compatibility with target distributions.',
      gl: 'Unha ferramenta para comprobar a compatibilidade ABI de binarios ELF de Linux con distribucións de destino.',
      es: 'Una herramienta para comprobar la compatibilidad ABI de binarios ELF de Linux con distribuciones de destino.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/binport' }],
  },
  {
    id: 'cryptopals', kind: 'project', title: 'cryptopals-plusplus',
    context: { en: 'C++ · Applied cryptography', gl: 'C++ · Criptografía aplicada', es: 'C++ · Criptografía aplicada' },
    summary: {
      en: 'C++ implementations of the Cryptopals cryptography challenges, exploring cryptographic constructions and attacks.',
      gl: 'Implementacións en C++ dos desafíos criptográficos de Cryptopals, para explorar construcións criptográficas e ataques.',
      es: 'Implementaciones en C++ de los desafíos criptográficos de Cryptopals, para explorar construcciones criptográficas y ataques.',
    },
    links: [{ label: 'codeLink', url: 'https://github.com/Juanbanpar/cryptopals-plusplus' }],
  },
];

export const selectedWork = ['recsi-2026', 'stic-2025', 'pkcs11-stack', 'binport'];
