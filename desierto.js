/* =====================================================================
   desierto.js — el mundo caminable como fondo de la página principal.
   Dibuja en su propio canvas (#canvas-desierto) que va DETRÁS del
   canvas del escudo. CATAVI.js / index.html lo controlan con window.Desierto.
   ===================================================================== */
(function () {
  'use strict';
  console.log('desierto.js VERSION 17 cargada');

  // ================== CONFIGURACIÓN ==================
  const RUTA_SUELO = './TEXTURA DE ARENA.jpg';
  const RUTA_MONTANAS = './MONTAÑAS.png';
  const RUTA_PERSONAJE = './P CAMINANDO.fbx';

  const TAMANO = 2000, REPETICIONES = 100;
  const RADIO_FONDO = 900, ALTO_FONDO = 460, BAJAR_FONDO = 100;
  const VELOCIDAD = 8, GIRO = 2.2;

  const ALTURA_PERSONAJE = 3.5, ORIENTACION = 0;
  const VELOCIDAD_ANIMACION = 1, SUAVIZADO_BUCLE = 0.2;

  // ---- Casas ----
  const CASAS = ['./CASA 1.glb', './CASA 2.glb', './CASA IZQUIERDA.glb', './CASA DERECHA.glb', './CASA 3.glb'];
  const TAMANO_POR_MODELO = [25, 25, 35, 25, 25];
  const GIRO_EXTRA_POR_MODELO = [Math.PI, 0, 0, Math.PI, 0];
  const ALTURA_EXTRA_POR_MODELO = [0, 0, 0, 0, 0];

  const DISTANCIA_CALLE = 26;
  const Z_CASA_DER = 40, Z_CASA_IZQ = 15, ADELANTE_NUEVAS = -27;
  const ROTACION_IZQ = 0, ROTACION_DER = Math.PI;
  const ATRAS_CASA_IZQUIERDA = 8, DERECHA_CASA_IZQUIERDA = 6;

  const ADELANTE_CASA_DERECHA = -20;
  const ADELANTE_CASA_3 = 25;

  const ADELANTE_CASA_GRANDE = 45;
  const X_CASA_GRANDE = -DISTANCIA_CALLE;
  const Z_CASA_GRANDE = Z_CASA_IZQ + ADELANTE_CASA_GRANDE;
  const ROTACION_CASA_GRANDE = ROTACION_IZQ;
  const RUTA_CASA_GRANDE = './CASA GRANDE.glb';
  const ESCALA_CASA_GRANDE = 10;

  // ---- Volqueta ----
  const RUTA_VOLQUETA = './volqueta.glb';
  const TAMANO_VOLQUETA = 16;
  const DETRAS_VOLQUETA = -6;
  const LADO_VOLQUETA = -28;
  const GIRO_VOLQUETA = 0;
  const BAJAR_VOLQUETA = 0;
  const POS_VOLQUETA_X = X_CASA_GRANDE - DETRAS_VOLQUETA;
  const POS_VOLQUETA_Z = Z_CASA_GRANDE + LADO_VOLQUETA;

      // ---- Bus 1 (detrás de la volqueta que está cerca de la entrada) ----
  const RUTA_BUS1 = './bus1.glb';        // cambia por el nombre real de tu archivo
  const TAMANO_BUS1 = 22;                // TAMAÑO: más grande = número mayor
  const HUECO_BUS1 = 4;                  // espacio entre la volqueta y el bus
    const LADO_BUS1 = 1;                   // 1 = DELANTE de la volqueta (número mayor de Z); -1 = detrás
  const VERTICAL_BUS1 = true;            // true = el bus queda de adelante hacia atrás; false = a lo ancho                // -1 = hacia el número menor de Z (MÁS ATRÁS, como en el resto del archivo); 1 = hacia el otro lado
  const POS_BUS1_X = POS_VOLQUETA_X;     // DERECHA (+) o IZQUIERDA (-)
  const POS_BUS1_Z = POS_VOLQUETA_Z + LADO_BUS1 * (TAMANO_VOLQUETA / 2 + HUECO_BUS1 + TAMANO_BUS1 / 2);
  const GIRO_BUS1 = GIRO_VOLQUETA;       // hacia dónde mira (Math.PI = media vuelta)
  const BAJAR_BUS1 = 0;
  // ---- Medio fondo ----
  const RUTA_MEDIO_FONDO = './medioFondo.glb';
  const TAMANO_MEDIO_FONDO = 100;
  const POS_MEDIO_FONDO_X = 0, POS_MEDIO_FONDO_Z = 100;
  const GIRO_MEDIO_FONDO = Math.PI;
  const BAJAR_MEDIO_FONDO = 0.3;
  const POS_MEDIO_FONDO_2_X = 0, POS_MEDIO_FONDO_2_Z = 180;

    // ---- Parrilla (reemplaza al segundo medio fondo, el que está más adentro) ----
  const RUTA_PARRILA = './parrilla.glb';          // cambia por el nombre real de tu archivo
  const TAMANO_PARRILA = TAMANO_MEDIO_FONDO;     // TAMAÑO: más grande = número mayor
  const POS_PARRILA_X = POS_MEDIO_FONDO_2_X;     // DERECHA (+) o IZQUIERDA (-)
  const POS_PARRILA_Z = POS_MEDIO_FONDO_2_Z;     // MÁS ADELANTE (número menor) o MÁS ATRÁS (número mayor)
  const GIRO_PARRILA = GIRO_MEDIO_FONDO;         // hacia dónde mira (Math.PI = media vuelta)
  const BAJAR_PARRILA = 0;

  // ---- Tractor y volqueta 2 (detrás de los medioFondo) ----
  const RUTA_TRACTOR = './tractor.glb';
  const TAMANO_TRACTOR = 18;
  const POS_TRACTOR_X = 0, POS_TRACTOR_Z = 140;
  const GIRO_TRACTOR = 0;
  const BAJAR_TRACTOR = 0;

  const RUTA_VOLQUETA2 = './volqueta2.glb';
  const TAMANO_VOLQUETA2 = 19;
  const POS_VOLQUETA2_X = 22, POS_VOLQUETA2_Z = 140;
  const GIRO_VOLQUETA2 = 0;
  const BAJAR_VOLQUETA2 = 0;

  // ---- Calaminas ----
  const RUTA_CALAMINAS = './calaminas.glb';
  const RUTA_CALAMINAV = './calaminav.glb';
  const TAMANO_CALAMINAS = 70;
  const TAMANO_CALAMINAV = 10;
  const BAJAR_CALAMINAS = 0;
  const BAJAR_CALAMINAV = 0;
  const X_LADO_CALAMINAS = 42;
  const Z_CALAMINAS = [92, 116, 168, 192];
  const GIRO_CALAMINAS = 0;

  // Pon MARCADORES_DEBUG en true para ver postes de colores donde van las casas nuevas
  const MOSTRAR_COORDENADAS = false;
  const MARCADORES_DEBUG = false;

  // ---- Entrada principal ----
  const RUTA_ENTRADA = './ENTRADA.glb';
  const TAMANO_ENTRADA = 60;
  const POS_ENTRADA_X = 10, POS_ENTRADA_Z = -2;
  const GIRO_ENTRADA = Math.PI;

  // ---- Casa roja y casa vieja (cada una se repite en fila, como una casa larga) ----
  const RUTA_CASA_ROJA = './casaroja.glb';
  const RUTA_CASA_VIEJA = './casavieja.glb';
  const TAMANO_CASA_ROJA = 40;
  const TAMANO_CASA_VIEJA = 59;
  const REPETIR_CASA_ROJA = 4;    // cuántas casas rojas hay en la fila
  const REPETIR_CASA_VIEJA = 4;   // cuántas casas viejas hay en la fila
  const SEPARACION_FILA = 0;    // 0 = automática (casas pegadas según su ancho real); un número = fijo
  // Qué tan pegadas quedan las casas de cada fila (en unidades del mundo):
  // 0 = justo tocándose por su medida real; negativo = se meten una dentro de otra (más juntas); positivo = deja un hueco
  const AJUSTE_JUNTAS_CASA_ROJA = 0;
  const AJUSTE_JUNTAS_CASA_VIEJA = -2.5;   // más negativo (-4, -6...) = más pegadas, como una sola casa
  // Hacia dónde se alarga cada fila: 'auto' (según el lado largo del modelo), 'x' o 'z'
  const EJE_CASA_ROJA = 'auto';
  const EJE_CASA_VIEJA = 'auto';
  // true = endereza el modelo (por si viene girado unos grados) para que la fila quede recta y pegada
  const ENDEREZAR_CASA_ROJA = false;   // la casa roja ya está bien: no se toca
  const ENDEREZAR_CASA_VIEJA = true;

  // Casa roja (va por su cuenta)
  const LADO_CASA_ROJA = -1;    // -1 = lado izquierdo de la entrada, 1 = lado derecho
  const POS_CASA_ROJA_X = -45;  // izquierda (-) o derecha (+)
  const POS_CASA_ROJA_Z = -10;  // más atrás (número menor) o más adelante (número mayor)
  const GIRO_CASA_ROJA = 0;

  // Casa vieja (va por su cuenta, no depende de la casa roja)
  const LADO_CASA_VIEJA = -1;   // hacia dónde crece su fila: -1 izquierda, 1 derecha
  const POS_CASA_VIEJA_X = -58;
  const POS_CASA_VIEJA_Z = -65;
  const GIRO_CASA_VIEJA = Math.PI;

  // Casas de adobe (como la de la foto): las armo con formas de Three.js, no necesitan modelo.
  // Van del OTRO costado de la entrada, o sea del lado contrario de la casa roja y la casa vieja.
  const RUTAS_PARED = ['./pared.jpg', './pared.jpeg', './pared.png', './pared.webp'];      // textura de las paredes
  const RUTAS_PUERTA = ['./puerta.jpg', './puerta.jpeg', './puerta.png', './puerta.webp']; // textura de las puertas
  const REPETIR_CASA_ADOBE = 3;        // cuántas casas hay en la fila (quedan pegadas una con otra)
  const LARGO_CASA_ADOBE = 29;         // largo de cada casa
  const FONDO_CASA_ADOBE = 14;          // qué tan profunda es la casa
  const ALTO_CASA_ADOBE = 6;           // altura de las paredes
  const ALTURA_TECHO_ADOBE = 4;        // cuánto sube el techo de calamina
  const VOLADO_TECHO_ADOBE = 0.8;      // cuánto sobresale el techo hacia adelante y atrás
  const LADO_CASA_ADOBE = -LADO_CASA_ROJA;   // la fila crece hacia el lado contrario que la casa roja
  const SEPARACION_ENTRADA_ADOBE = 5;  // hueco entre la entrada y la primera casa
  const POS_CASA_ADOBE_X = POS_ENTRADA_X + TAMANO_ENTRADA / 2 + SEPARACION_ENTRADA_ADOBE + LARGO_CASA_ADOBE / 2;
  const POS_CASA_ADOBE_Z = POS_CASA_ROJA_Z;  // más atrás (número menor) o más adelante (número mayor)
  const GIRO_CASA_ADOBE = 0;           // 0 = puertas hacia donde llegas caminando; Math.PI = al revés

  // Casa de afuera (casaafuera.glb): va DELANTE de las casas de adobe y se repite en fila, como la casa vieja.
  const RUTA_CASA_AFUERA = './casaafuera.glb';
  const TAMANO_CASA_AFUERA = 42;                          // TAMAÑO: más grande = número mayor
  const REPETIR_CASA_AFUERA = 2;                          // cuántas casas hay en la fila
  const AJUSTE_JUNTAS_CASA_AFUERA = -2.5;                 // más negativo = más pegadas; positivo = deja un hueco
  const EJE_CASA_AFUERA = 'auto';                         // hacia dónde se alarga la fila: 'auto', 'x' o 'z'
  const ENDEREZAR_CASA_AFUERA = true;                     // endereza el modelo si viene girado unos grados
  const HORIZONTAL_CASA_AFUERA = true;                    // true = casas acostadas a lo ancho (lado largo en X) y fila en horizontal
  const LADO_CASA_AFUERA = LADO_CASA_ADOBE;               // hacia dónde crece la fila: 1 = derecha, -1 = izquierda
  const POS_CASA_AFUERA_X = POS_CASA_ADOBE_X;             // DERECHA (+) o IZQUIERDA (-)
  const POS_CASA_AFUERA_Z = POS_CASA_ADOBE_Z - 65;        // MÁS ADELANTE (número mayor) o MÁS ATRÁS (número menor)
  const GIRO_CASA_AFUERA = 0;                             // hacia dónde miran (Math.PI = media vuelta)

  // Dos volquetas al costado de la casa de afuera (siguen a la casa: si la mueves, ellas se mueven con ella)
  const RUTA_VOLQUETAS_AFUERA = RUTA_VOLQUETA;                       // o RUTA_VOLQUETA2 para usar la otra volqueta
  const CANTIDAD_VOLQUETAS_AFUERA = 2;                               // cuántas volquetas
  const TAMANO_VOLQUETAS_AFUERA = TAMANO_VOLQUETA;                   // TAMAÑO: más grande = número mayor
  const SEPARACION_VOLQUETAS_AFUERA = 10;                            // distancia entre una volqueta y otra
  const HUECO_VOLQUETAS_AFUERA = 8;                                  // hueco entre la última casa y la primera volqueta
    // Van del OTRO lado de la fila de casas: empiezan junto a la primera casa y crecen hacia el lado contrario
  const LADO_VOLQUETAS_AFUERA = -LADO_CASA_AFUERA;   // pon LADO_CASA_AFUERA para volver al lado de antes
  const POS_VOLQUETAS_AFUERA_X = POS_CASA_AFUERA_X + LADO_VOLQUETAS_AFUERA *
    (TAMANO_CASA_AFUERA / 2 + HUECO_VOLQUETAS_AFUERA + TAMANO_VOLQUETAS_AFUERA / 2);
  const POS_VOLQUETAS_AFUERA_Z = POS_CASA_AFUERA_Z;                  // MÁS ADELANTE (número mayor) o MÁS ATRÁS (número menor)
  const GIRO_VOLQUETAS_AFUERA = 0;                                   // hacia dónde miran (Math.PI = media vuelta)
  const BAJAR_VOLQUETAS_AFUERA = BAJAR_VOLQUETA;

  // Tractores detrás de la casa roja (siguen a la casa roja: si la mueves, ellos se mueven con ella)
  const CANTIDAD_TRACTORES_ROJA = 3;
  const TAMANO_TRACTORES_ROJA = TAMANO_TRACTOR;          // mismo tamaño que el otro tractor
  const POS_TRACTORES_ROJA_X = POS_CASA_ROJA_X;          // izquierda (-) o derecha (+)
  const POS_TRACTORES_ROJA_Z = POS_CASA_ROJA_Z - 15;     // más atrás (número menor) o más adelante (número mayor)
  const SEPARACION_TRACTORES_ROJA = 22;                  // distancia entre un tractor y otro
  const GIRO_TRACTORES_ROJA = 0;                         // hacia dónde miran (en radianes: Math.PI = media vuelta)

  // ---- Personaje y cámara ----
  const INICIO_EXPLORAR_Z = -18;
  const ATRAS_PORTADA = 12;
  const ATRAS_JUGADOR = 28;
  const Z_APARECER = INICIO_EXPLORAR_Z - ATRAS_JUGADOR;
  const DIST_CAM = 7;
  const ALTURA_CAM = 4;
  const POS_CAM_INTRO = { x: 0, y: ALTURA_CAM, z: INICIO_EXPLORAR_Z - DIST_CAM - ATRAS_PORTADA };
  const PITCH_CAM = Math.atan((ALTURA_CAM - 2.5) / DIST_CAM);
  const AMPL_GIRO = 1.3, VEL_GIRO_CAM = 0.2;

  // ---- Puntos de información ----
  // Campos: etiqueta, imagen {src,pie}, texto (**resaltado**), datos (hasta 3 cifras), enlace,
  // fuentes [{ t: 'título', u: 'https://...' }]  (si no tiene "u", se muestra solo como texto)
  const RADIO_INFO = 5;
  const PUNTOS_INFO = [
    { x: 6, z: -2, titulo: 'Quiénes somos', etiqueta: 'La cooperativa',
      imagen: { src: 'imagenes/quienes-somos.jpg', pie: 'Socios de la cooperativa · actual' },
      texto: ['Somos una organización nacida en Llallagua, Potosí, que reúne el trabajo **minero, comercial y social** de sus socios bajo un modelo **cooperativo, solidario y democrático**.',
              'Nuestro nombre une dos lugares mineros históricos: **Siglo XX** y **Catavi**.'],
      fuentes: [
        { t: 'Presentación institucional de la Cooperativa Minera Multiactiva Catavi Siglo XX R.L.' },
        { t: 'Catavi mine (complejo Catavi–Siglo XX) · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_mine' },
        { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' }
      ] },

    { x: -9, z: 15, titulo: 'Nuestra fundación', etiqueta: 'Acta de nacimiento',
      imagen: { src: 'imagenes/fundacion.jpeg', pie: 'Cooperativa Siglo XX Catavi' },
      texto: ['**Cooperativa Minera Multiactiva Catavi Siglo XX R.L.** fue fundada el **3 de mayo de 1994** en Llallagua, Potosí, Bolivia.'],
      datos: [{ n: '1994', t: 'año de fundación' }, { n: 'N° 04665', t: 'personería jurídica' }],
      fuentes: [
        { t: 'Letrero oficial de la cooperativa en su entrada: «Fundado 3-5-94 · P.J. 04665»' }
      ] },

    { x: 9, z: 28, titulo: 'Un gigante del estaño', etiqueta: 'Historia',
      imagen: { src: 'imagenes/gigante-estaño.jpg', pie: 'Mina Siglo XX · foto de archivo' },
      texto: ['El complejo **Catavi–Siglo XX** llegó a ser el mayor de la Corporación Minera de Bolivia, con unos **5.000 trabajadores**.',
              'En Llallagua nació el **sindicalismo minero** y se organizó la **primera industria moderna de Bolivia**.'],
      datos: [{ n: '5.000', t: 'trabajadores en el complejo' }, { n: '31 oct 1952', t: 'se nacionalizan las minas' }],
      fuentes: [
        { t: 'Catavi mine · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_mine' },
        { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' },
        { t: 'Decreto de nacionalización del 31 de octubre de 1952 · Foreign Relations of the United States (Departamento de Estado de EE. UU.)', u: 'https://history.state.gov/historicaldocuments/frus1952-54v04/d145' }
      ] },

    { x: -9, z: 42, titulo: 'El Tío de la mina', etiqueta: 'Tradición',
      imagen: { src: 'imagenes/tio-mina.jpeg', pie: 'El Tío en una bocamina · actual' },
      texto: ['Bajo tierra, muchos mineros respetan al **Tío**, el dueño de la mina: una figura con cuernos a la que ofrecen **coca, cigarros y alcohol** para pedir protección.',
              'Esta ofrenda, la **ch’alla**, se repite a lo largo del año y tiene su día grande en el carnaval, en el **Martes de Ch’alla**.'],
      datos: [{ n: 'Carnaval', t: 'Martes de Ch’alla' }],
      fuentes: [
        { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' },
        { t: 'Cultos mineros: los rituales de las minas bolivianas · Semana', u: 'https://www.semana.com/mundo/articulo/cultos-mineros-rituales-produccion-minas-bolivianas/121965-3/' },
        { t: 'Origen del Carnaval Minero · Los Tiempos', u: 'https://www.lostiempos.com/oh/actualidad/20260209/origen-del-carnaval-minero' }
      ] },

    { x: 9, z: 55, titulo: 'Así nacieron las cooperativas', etiqueta: 'Historia',
      imagen: { src: 'imagenes/cooperativas.jpg', pie: 'Socios en una bocamina · actual' },
      texto: ['Cuando el precio del estaño se desplomó en la **década de 1980**, miles de mineros despedidos ocuparon **túneles abandonados**. Así empezó el movimiento cooperativista actual.',
              'Hoy las cooperativas agrupan cerca del **8 % de la fuerza laboral** de Bolivia y aportan **la mitad de la extracción minera**.'],
      datos: [{ n: '≈8 %', t: 'de la fuerza laboral' }, { n: '≈50 %', t: 'de la extracción minera' }],
      fuentes: [
        { t: 'Medio millón de mineros amenazan el auge de los minerales críticos en Bolivia · Gestión', u: 'https://gestion.pe/mundo/internacional/medio-millon-de-mineros-amenazan-el-auge-de-los-minerales-criticos-en-bolivia-noticia/' },
        { t: 'Cajías de la Vega: Crisis, diáspora y reconstitución de la memoria histórica de la minería boliviana, 1986-2003 · Redalyc', u: 'https://www.redalyc.org/pdf/3379/337930338003.pdf' }
      ] },

    { x: -9, z: 68, titulo: 'Nombres con historia', etiqueta: 'Dato curioso',
      imagen: { src: 'imagenes/nombres.jpg', pie: 'Llallagua y Siglo XX · actual' },
      texto: ['El yacimiento se conocía desde **1564**, pero entonces el estaño valía poco. Se llamó **Siglo XX** porque la explotación a gran escala empezó a **principios del siglo XX**.',
              '**Llallagua**, en cambio, viene de una palabra andina ligada a las **buenas cosechas de papa**.'],
      datos: [{ n: '1564', t: 'se descubre el yacimiento' }, { n: '12–15 %', t: 'de estaño en el mineral' }],
      fuentes: [
        { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' },
        { t: 'Municipio de Llallagua · Instituto Nacional de Estadística (INE) de Bolivia', u: 'https://www.ine.gob.bo/?p=39868' }
      ] },

    { x: 9, z: 90, titulo: 'La Salvadora', etiqueta: 'Historia',
      imagen: { src: 'imagenes/salvadora.jpg', pie: 'Simón I. Patiño · foto de archivo' },
      texto: ['La mina se llamaba **La Salvadora** y en **1900** Simón I. Patiño halló en ella una veta riquísima de estaño.',
              'Con los años llegó a ser uno de los **hombres más ricos del mundo**.'],
      datos: [{ n: '1900', t: 'se halla la veta' }, { n: '1940', t: 'década en que era de los más ricos' }],
      fuentes: [
        { t: 'Simón Iturri Patiño · Wikipedia', u: 'https://en.wikipedia.org/wiki/Sim%C3%B3n_Iturri_Pati%C3%B1o' },
        { t: 'Simón I. Patiño · Biografías y Vidas', u: 'https://www.biografiasyvidas.com/biografia/p/patino_simon.htm' }
      ] },

    { x: -9, z: 112, titulo: 'La Voz del Minero', etiqueta: 'Dato curioso',
      imagen: { src: 'imagenes/voz-minero.jpg', pie: 'Radio La Voz del Minero · Siglo XX' },
      texto: ['En **1947** nació en Siglo XX la radio **La Voz del Minero**, una de las primeras radios populares de América Latina.',
              'La sostenían los propios mineros con **un día de salario al mes**.'],
      datos: [{ n: '1947', t: 'primeras transmisiones' }],
      fuentes: [
        { t: 'Aguirre: La radio sindical minera, historia, mito y tradicional abandono · Universidad Católica Boliviana (SECRAD)', u: 'https://secrad.lpz.ucb.edu.bo/wp-content/uploads/2022/03/LA-RADIO-SINDICAL-MINERA-HISTORIA-MITO-Y-TRADICIONAL-ABANDONO-AGUIRRE.pdf' },
        { t: 'Passion for Radio, capítulo 23 · Comunica.org', u: 'https://comunica.org/passion/pdf/chapter23.pdf' }
      ] },

    { x: 9, z: 137, titulo: 'Domitila y las amas de casa', etiqueta: 'Personaje',
      imagen: { src: 'imagenes/domitila.jpg', pie: 'Domitila Barrios de Chungara' },
      texto: ['**Domitila Barrios de Chungara**, de la comunidad minera de Siglo XX, fue una voz del **Comité de Amas de Casa**, que reunía a esposas de mineros.',
              'En **1975** viajó a México a la Tribuna del Año Internacional de la Mujer de la ONU.'],
      datos: [{ n: '1963', t: 'se une al Comité' }, { n: '1975', t: 'Tribuna de la ONU' }],
      fuentes: [
        { t: 'Fallece Domitila Barrios de Chungara · Comisión Nacional de los Derechos Humanos de México', u: 'https://www.cndh.org.mx/sites/default/files/documentos/2023-02/FRI_MAR_13-1.pdf' },
        { t: 'Moema Viezzer: «Si me permiten hablar… Testimonio de Domitila, una mujer de las minas de Bolivia» · Siglo XXI Editores' }
      ] },

    { x: -9, z: 165, titulo: 'Día del Trabajador Minero', etiqueta: 'Memoria',
      imagen: { src: 'imagenes/dia-minero.jpg', pie: 'Monumento al Minero · Siglo XX' },
      texto: ['Cada **21 de diciembre** Bolivia celebra el Día del Trabajador Minero, por una ley de **1944**.',
              'Recuerda a los caídos de la **masacre de Catavi** (1942), cuando mineros y sus familias marcharon reclamando mejores salarios.'],
      datos: [{ n: '21 dic', t: 'Día del Trabajador Minero' }, { n: '1942', t: 'masacre de Catavi' }],
      fuentes: [
        { t: 'Mineros celebrarán su día este miércoles y suspenderán actividades · Eju.tv', u: 'https://eju.tv/2022/12/mineros-celebraran-su-dia-este-miercoles-y-suspenderan-actividades/' },
        { t: 'Catavi massacre · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_massacre' }
      ] }
  ];

  // ================== COMPROBACIONES ==================
  const canvas = document.getElementById('canvas-desierto');
  if (!canvas || !window.THREE || !THREE.FBXLoader || !THREE.GLTFLoader) {
    console.warn('[Desierto] Falta #canvas-desierto o alguna librería (THREE / FBXLoader / GLTFLoader). Se usará la imagen de fondo.');
    return;
  }

  const panelPos = document.createElement('div');
  panelPos.style.cssText = 'position:fixed;left:60px;top:18px;z-index:99;background:rgba(0,0,0,.75);color:#fff;font:14px monospace;padding:8px 12px;border-radius:6px;pointer-events:none;';
  if (MOSTRAR_COORDENADAS) document.body.appendChild(panelPos);

  // ================== ESCENA BASE ==================
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ec5e8);
  scene.fog = new THREE.Fog(0xc9b8a0, 150, 700);
  const fogBase = new THREE.Color(0xc9b8a0);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.set(POS_CAM_INTRO.x, POS_CAM_INTRO.y, POS_CAM_INTRO.z);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7a66, 0.85);
  scene.add(hemi);

  const sol = new THREE.DirectionalLight(0xfff2d6, 0.9);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  const sc = sol.shadow.camera;
  sc.left = -40;
  sc.right = 40;
  sc.top = 40;
  sc.bottom = -40;
  sc.near = 1;
  sc.far = 250;
  scene.add(sol, sol.target);

  // ================== PISO ==================
  const matSuelo = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0
  });

  new THREE.TextureLoader().load(
    RUTA_SUELO,
    (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(REPETICIONES, REPETICIONES);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.encoding = THREE.sRGBEncoding;
      matSuelo.map = tex;
      matSuelo.needsUpdate = true;
    },
    undefined,
    () => {
      matSuelo.color.set(0x8b6f4e);
      console.warn('[Desierto] No se encontró ' + RUTA_SUELO);
    }
  );

  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(TAMANO, TAMANO),
    matSuelo
  );
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  scene.add(suelo);

  // ================== FONDO DE MONTAÑAS ==================
  const matFondo = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false
  });

  new THREE.TextureLoader().load(
    RUTA_MONTANAS,
    (tex) => {
      tex.encoding = THREE.sRGBEncoding;
      tex.wrapS = THREE.MirroredRepeatWrapping;

      const anchoImagen = ALTO_FONDO * (tex.image.width / tex.image.height);
      const vueltas = (2 * Math.PI * RADIO_FONDO) / anchoImagen;
      tex.repeat.x = Math.max(2, 2 * Math.round(vueltas / 2));

      matFondo.map = tex;
      matFondo.needsUpdate = true;

      try {
        const cv = document.createElement('canvas');
        cv.width = 32;
        cv.height = 100;

        const cx = cv.getContext('2d');
        cx.drawImage(tex.image, 0, 0, 32, 100);

        const fila = Math.min(
          99,
          Math.max(0, Math.round((1 - BAJAR_FONDO / ALTO_FONDO) * 100))
        );

        const d = cx.getImageData(0, fila, 32, 1).data;

        let r = 0, g = 0, b = 0;

        for (let i = 0; i < 32; i++) {
          r += d[i * 4];
          g += d[i * 4 + 1];
          b += d[i * 4 + 2];
        }

        fogBase.setRGB(
          r / 32 / 255,
          g / 32 / 255,
          b / 32 / 255
        ).convertSRGBToLinear();

        const dt2 = cx.getImageData(0, 1, 32, 1).data;

        let r2 = 0, g2 = 0, b2 = 0;

        for (let i = 0; i < 32; i++) {
          r2 += dt2[i * 4];
          g2 += dt2[i * 4 + 1];
          b2 += dt2[i * 4 + 2];
        }

        TEMAS.claro.cielo.setRGB(
          r2 / 32 / 255,
          g2 / 32 / 255,
          b2 / 32 / 255
        );

        TEMAS.oscuro.cielo.copy(TEMAS.claro.cielo).multiplyScalar(0.04);

        TEMAS.atardecer.cielo.copy(TEMAS.claro.cielo).multiply(
          new THREE.Color(1, 0.62, 0.45)
        );

        mezcla.cielo.copy(tema.cielo);

      } catch (e) {
        console.warn('[Desierto] No se pudo igualar la niebla:', e);
      }
    },
    undefined,
    () => {
      matFondo.color.set(0x6f8aa8);
      console.warn('[Desierto] No se encontró ' + RUTA_MONTANAS);
    }
  );

  const fondo = new THREE.Mesh(
    new THREE.CylinderGeometry(
      RADIO_FONDO,
      RADIO_FONDO,
      ALTO_FONDO,
      64,
      1,
      true
    ),
    matFondo
  );

  fondo.position.y = ALTO_FONDO / 2 - BAJAR_FONDO;
  fondo.renderOrder = -1;
  scene.add(fondo);

  // ================== TEMA: DÍA / ATARDECER / NOCHE ==================
  const TEMAS = {
    claro: {
      cielo: new THREE.Color(0x9ec5e8),
      tinte: new THREE.Color(1, 1, 1),
      hemi: 0.85,
      sol: 0.9,
      solColor: new THREE.Color(0xfff2d6),
      solY: 80,
      luces: 0,
      luna: 0
    },

    atardecer: {
      cielo: new THREE.Color(0xe8a070),
      tinte: new THREE.Color(1, 0.7, 0.52),
      hemi: 0.62,
      sol: 0.85,
      solColor: new THREE.Color(0xff9a4d),
      solY: 26,
      luces: 0.4,
      luna: 0
    },

    oscuro: {
      cielo: new THREE.Color(0x0a1020),
      tinte: new THREE.Color(0.02, 0.03, 0.07),
      hemi: 0.09,
      sol: 0.08,
      solColor: new THREE.Color(0x7f95d6),
      solY: 60,
      luces: 1,
      luna: 1
    }
  };

  const TIEMPO_TRANSICION = 1.1;
  let tema = TEMAS.claro;

  const mezcla = {
    cielo: TEMAS.claro.cielo.clone(),
    tinte: TEMAS.claro.tinte.clone(),
    hemi: TEMAS.claro.hemi,
    sol: TEMAS.claro.sol,
    solColor: TEMAS.claro.solColor.clone(),
    solY: TEMAS.claro.solY,
    luces: 0,
    luna: 0
  };

  function actualizarTema(dt) {
    const k = 1 - Math.exp(-dt / TIEMPO_TRANSICION);

    mezcla.cielo.lerp(tema.cielo, k);
    mezcla.tinte.lerp(tema.tinte, k);
    mezcla.solColor.lerp(tema.solColor, k);

    mezcla.hemi += (tema.hemi - mezcla.hemi) * k;
    mezcla.sol += (tema.sol - mezcla.sol) * k;
    mezcla.solY += (tema.solY - mezcla.solY) * k;
    mezcla.luces += (tema.luces - mezcla.luces) * k;
    mezcla.luna += (tema.luna - mezcla.luna) * k;

    actualizarLuces(mezcla.luces);

    scene.background.copy(mezcla.cielo);
    matFondo.color.copy(mezcla.tinte);
    scene.fog.color.copy(fogBase).multiply(mezcla.tinte);

    hemi.intensity = mezcla.hemi;
    sol.intensity = mezcla.sol;
    sol.color.copy(mezcla.solColor);
  }

  // ================== LUNA (solo de noche) ==================
  const LUNA_ANGULO = 20;
  const LUNA_ALTURA = 15;
  const LUNA_TAMANO = 110;
  const LUNA_DISTANCIA = 850;

  const texLuna = (function () {
    const c = document.createElement('canvas');
    c.width = c.height = 256;

    const x = c.getContext('2d');

    const halo = x.createRadialGradient(128, 128, 50, 128, 128, 128);
    halo.addColorStop(0, 'rgba(200,215,255,.45)');
    halo.addColorStop(1, 'rgba(200,215,255,0)');

    x.fillStyle = halo;
    x.fillRect(0, 0, 256, 256);

    x.save();
    x.beginPath();
    x.arc(128, 128, 52, 0, Math.PI * 2);
    x.clip();

    const cara = x.createRadialGradient(112, 112, 5, 128, 128, 56);
    cara.addColorStop(0, '#fffdf2');
    cara.addColorStop(1, '#d9e0ee');

    x.fillStyle = cara;
    x.fillRect(60, 60, 136, 136);

    x.fillStyle = 'rgba(140,150,175,.28)';

    [[108, 110, 11], [143, 102, 8], [138, 142, 13], [110, 146, 7], [126, 124, 5]]
      .forEach(function (k) {
        x.beginPath();
        x.arc(k[0], k[1], k[2], 0, Math.PI * 2);
        x.fill();
      });

    x.restore();

    return new THREE.CanvasTexture(c);
  })();

  const luna = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texLuna,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false
    })
  );

  luna.scale.set(LUNA_TAMANO, LUNA_TAMANO, 1);
  luna.visible = false;
  scene.add(luna);

  function actualizarLuna() {
    luna.visible = mezcla.luna > 0.01;
    if (!luna.visible) return;

    luna.material.opacity = mezcla.luna;

    const az = LUNA_ANGULO * Math.PI / 180;
    const el = LUNA_ALTURA * Math.PI / 180;

    luna.position.set(
      camera.position.x + Math.sin(az) * Math.cos(el) * LUNA_DISTANCIA,
      Math.sin(el) * LUNA_DISTANCIA,
      camera.position.z + Math.cos(az) * Math.cos(el) * LUNA_DISTANCIA
    );
  }

  // ================== PERSONAJE ==================
  const jugador = new THREE.Group();
  scene.add(jugador);
  jugador.visible = false;

  let mixer = null;
  let accionCaminar = null;
  let huesoCadera = null;
  let modeloGrupo = null;

  const baseCadera = new THREE.Vector3();
  const _v = new THREE.Vector3();

  const ES_RAIZ_POS = /(hips|root|pelvis|armature).*\.position$/i;

  function bloquearCadera() {
    jugador.updateMatrixWorld(true);
    huesoCadera.getWorldPosition(_v);
    modeloGrupo.worldToLocal(_v);

    _v.x = baseCadera.x;
    _v.z = baseCadera.z;

    modeloGrupo.localToWorld(_v);
    huesoCadera.parent.worldToLocal(_v);
    huesoCadera.position.copy(_v);
  }

  function cerrarBucle(clip, fraccion) {
    if (fraccion <= 0) return;

    const L = clip.duration * fraccion;
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    clip.tracks.forEach((t) => {
      if (ES_RAIZ_POS.test(t.name)) return;

      const size = t.getValueSize();
      const v = t.values;
      const tm = t.times;
      const n = tm.length;

      if (n < 3) return;

      const T = tm[n - 1];

      for (let i = 0; i < n; i++) {
        if (tm[i] < T - L) continue;

        const w = (tm[i] - (T - L)) / L;
        const k = w * w * (3 - 2 * w);

        if (size === 4) {
          q0.fromArray(v, 0);
          q1.fromArray(v, i * 4);
          q1.slerp(q0, k);
          q1.toArray(v, i * 4);
        } else {
          for (let j = 0; j < size; j++) {
            v[i * size + j] += (v[j] - v[i * size + j]) * k;
          }
        }
      }
    });
  }

  new THREE.FBXLoader().load(
    RUTA_PERSONAJE,
    (obj) => {
      const caja = new THREE.Box3().setFromObject(obj);

      obj.scale.setScalar(
        ALTURA_PERSONAJE / (caja.max.y - caja.min.y)
      );

      caja.setFromObject(obj);
      obj.position.y -= caja.min.y;

      obj.traverse((m) => {
        if (!m.isMesh) return;

        m.castShadow = true;
        m.frustumCulled = false;

        [].concat(m.material).forEach((mt) => {
          if (mt && mt.map) mt.map.encoding = THREE.sRGBEncoding;
        });
      });

      if (obj.animations.length) {
        const clip = obj.animations.find(
          (c) => /walk|camin/i.test(c.name)
        ) || obj.animations[0];

        cerrarBucle(clip, SUAVIZADO_BUCLE);

        mixer = new THREE.AnimationMixer(obj);
        accionCaminar = mixer.clipAction(clip);
        accionCaminar.play();
        accionCaminar.paused = true;
      }

      const modelo = new THREE.Group();
      modelo.rotation.y = ORIENTACION;
      modelo.add(obj);
      jugador.add(modelo);

      if (mixer) {
        modeloGrupo = modelo;
        mixer.update(0);
        jugador.updateMatrixWorld(true);

        let primero = null;

        obj.traverse((h) => {
          if (!h.isBone) return;

          if (!primero) primero = h;

          if (!huesoCadera && /hips|pelvis/i.test(h.name)) {
            huesoCadera = h;
          }
        });

        huesoCadera = huesoCadera || primero;

        if (huesoCadera) {
          huesoCadera.getWorldPosition(baseCadera);
          modelo.worldToLocal(baseCadera);
        }
      }
    },
    undefined,
    (err) => console.error('[Desierto] No se pudo cargar ' + RUTA_PERSONAJE, err)
  );

  // ================== MARCADORES DE DEPURACIÓN ==================
  function marcador(x, z, color) {
    if (!MARCADORES_DEBUG) return;

    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 120, 12),
      new THREE.MeshBasicMaterial({ color: color, fog: false })
    );

    m.position.set(x, 60, z);
    scene.add(m);
  }

  marcador(POS_MEDIO_FONDO_X, POS_MEDIO_FONDO_Z, 0xff0000);
  marcador(X_CASA_GRANDE, Z_CASA_GRANDE, 0x00ff00);
  marcador(POS_VOLQUETA_X, POS_VOLQUETA_Z, 0x0000ff);
  marcador(POS_CASA_ROJA_X, POS_CASA_ROJA_Z, 0xff0000);     // poste rojo: inicio de la fila de casa roja
  marcador(POS_CASA_VIEJA_X, POS_CASA_VIEJA_Z, 0xffff00);   // poste amarillo: inicio de la fila de casa vieja
  marcador(POS_CASA_ADOBE_X, POS_CASA_ADOBE_Z, 0x00ffff);   // poste celeste: inicio de la fila de casa de adobe
  marcador(POS_CASA_AFUERA_X, POS_CASA_AFUERA_Z, 0xff00ff); // poste rosado: inicio de la fila de casa de afuera
  marcador(POS_VOLQUETAS_AFUERA_X, POS_VOLQUETAS_AFUERA_Z, 0xffa500); // poste naranja: primera volqueta de la casa de afuera

  function estado(msg, ok) {
    if (!ok) console.warn('[Desierto] ' + msg);
  }

  // ================== CARGADOR DE MODELOS ==================
  function cargarModelo(ruta) {
    return new Promise(function (resolve, reject) {
      const ext = ruta.split('.').pop().toLowerCase();

      if (ext === 'fbx') {
        new THREE.FBXLoader().load(ruta, resolve, undefined, reject);
      } else {
        new THREE.GLTFLoader().load(
          ruta,
          function (gltf) {
            resolve(gltf.scene);
          },
          undefined,
          reject
        );
      }
    });
  }

  // Apoya en el suelo con los vértices reales
  function bajarAlSuelo(obj, extra) {
    obj.updateMatrixWorld(true);

    const ys = [];
    const v = new THREE.Vector3();

    obj.traverse(function (m) {
      if (!m.isMesh || !m.visible || !m.geometry.attributes.position) return;

      const pos = m.geometry.attributes.position;
      const salto = Math.max(1, Math.floor(pos.count / 4000));

      for (let i = 0; i < pos.count; i += salto) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        ys.push(v.y);
      }
    });

    ys.sort(function (p, q) {
      return p - q;
    });

    const base = ys.length
      ? ys[Math.floor(ys.length * 0.02)]
      : new THREE.Box3().setFromObject(obj).min.y;

    obj.position.y -= base + (extra || 0);
  }

  function sombras(obj, sinCulling) {
    obj.traverse(function (m) {
      if (!m.isMesh) return;

      m.castShadow = true;
      m.receiveShadow = true;

      if (sinCulling) m.frustumCulled = false;
    });
  }

  // ================== PREPARAR CASAS ==================
  function prepararCasa(obj, tamano) {
    const caja = new THREE.Box3().setFromObject(obj);
    const tam = caja.getSize(new THREE.Vector3());

    if (tamano) {
      obj.scale.multiplyScalar(tamano / Math.max(tam.x, tam.z));
    }

    const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());

    obj.position.x -= c.x;
    obj.position.z -= c.z;

    bajarAlSuelo(obj, 0);
    sombras(obj, false);

    const grupo = new THREE.Group();
    grupo.add(obj);

    return grupo;
  }

  Promise.allSettled(CASAS.map(cargarModelo)).then(function (resultados) {
    const bases = resultados.map(function (r, i) {
      if (r.status === 'fulfilled') {
        const t = TAMANO_POR_MODELO[i];
        return prepararCasa(r.value, t === undefined ? 18 : t);
      }

      console.warn('[Desierto] No se pudo cargar la casa ' + CASAS[i], r.reason);
      estado('FALLÓ ' + CASAS[i], false);

      return null;
    });

    function colocar(indice, x, z, giro) {
      if (!bases[indice]) return;

      const casa = bases[indice].clone(true);
      casa.position.set(x, ALTURA_EXTRA_POR_MODELO[indice] || 0, z);
      casa.rotation.y = giro + (GIRO_EXTRA_POR_MODELO[indice] || 0);

      scene.add(casa);

      return casa;
    }

    colocar(0, -DISTANCIA_CALLE, Z_CASA_IZQ, ROTACION_IZQ);

    colocar(
      3,
      -DISTANCIA_CALLE,
      Z_CASA_IZQ + ADELANTE_CASA_DERECHA,
      ROTACION_IZQ
    );

    colocar(1, DISTANCIA_CALLE, Z_CASA_DER, ROTACION_DER);

    colocar(
      2,
      DISTANCIA_CALLE - DERECHA_CASA_IZQUIERDA,
      Z_CASA_DER + ADELANTE_NUEVAS - ATRAS_CASA_IZQUIERDA,
      ROTACION_DER
    );

    colocar(
      4,
      DISTANCIA_CALLE,
      Z_CASA_DER + ADELANTE_CASA_3,
      ROTACION_DER
    );
  });

  // ================== CASA GRANDE ==================
  cargarModelo(RUTA_CASA_GRANDE).then(function (obj) {
    obj.scale.setScalar(ESCALA_CASA_GRANDE);
    obj.updateMatrixWorld(true);

    let caja = new THREE.Box3().setFromObject(obj);
    const centro = caja.getCenter(new THREE.Vector3());

    obj.position.x -= centro.x;
    obj.position.z -= centro.z;

    obj.updateMatrixWorld(true);

    caja = new THREE.Box3().setFromObject(obj);
    obj.position.y -= caja.min.y;

    sombras(obj, false);

    const grupo = new THREE.Group();
    grupo.add(obj);

    grupo.position.set(X_CASA_GRANDE, 0, Z_CASA_GRANDE);
    grupo.rotation.y = ROTACION_CASA_GRANDE;

    scene.add(grupo);

    const t = new THREE.Box3().setFromObject(grupo).getSize(new THREE.Vector3());

    console.log(
      '[CASA GRANDE] tamaño final:',
      t.x.toFixed(1),
      t.y.toFixed(1),
      t.z.toFixed(1)
    );

    estado(
      'CASA GRANDE ok, tamaño ' +
      t.x.toFixed(1) + ' x ' +
      t.y.toFixed(1) + ' x ' +
      t.z.toFixed(1),
      true
    );

  }).catch(function (err) {
    console.error('[Desierto] No se pudo cargar CASA GRANDE:', err);
    estado('FALLÓ ' + RUTA_CASA_GRANDE, false);
  });

  // ================== VOLQUETA ==================
  cargarModelo(RUTA_VOLQUETA).then(function (obj) {
    const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    const dimension = Math.max(tam.x, tam.z);

    if (dimension <= 0) {
      throw new Error('El modelo volqueta no tiene dimensiones válidas.');
    }

    obj.scale.multiplyScalar(TAMANO_VOLQUETA / dimension);
    obj.updateMatrixWorld(true);

    const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());

    obj.position.x -= c.x;
    obj.position.z -= c.z;

    bajarAlSuelo(obj, BAJAR_VOLQUETA);
    sombras(obj, false);

    const grupo = new THREE.Group();
    grupo.add(obj);

    grupo.position.set(POS_VOLQUETA_X, 0, POS_VOLQUETA_Z);
    grupo.rotation.y = GIRO_VOLQUETA;

    scene.add(grupo);

    estado('volqueta ok', true);

  }).catch(function (err) {
    console.error('[Desierto] No se pudo cargar ' + RUTA_VOLQUETA, err);
    estado('FALLÓ ' + RUTA_VOLQUETA, false);
  });

  // ================== MEDIO FONDO ==================
  cargarModelo(RUTA_MEDIO_FONDO).then(function (obj) {
    const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    const dimension = Math.max(tam.x, tam.z);

    if (dimension <= 0) {
      throw new Error('El modelo medioFondo no tiene dimensiones válidas.');
    }

    obj.scale.multiplyScalar(TAMANO_MEDIO_FONDO / dimension);
    obj.updateMatrixWorld(true);

    const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());

    obj.position.x -= c.x;
    obj.position.z -= c.z;

    bajarAlSuelo(obj, BAJAR_MEDIO_FONDO);
    sombras(obj, false);

    const grupo = new THREE.Group();
    grupo.add(obj);

    grupo.position.set(POS_MEDIO_FONDO_X, 0, POS_MEDIO_FONDO_Z);
    grupo.rotation.y = GIRO_MEDIO_FONDO;

    scene.add(grupo);

    const tf = new THREE.Box3().setFromObject(grupo).getSize(new THREE.Vector3());

    console.log(
      '[medioFondo] cargado. Posición:',
      POS_MEDIO_FONDO_X,
      POS_MEDIO_FONDO_Z,
      '| tamaño final:',
      tf.x.toFixed(1),
      tf.y.toFixed(1),
      tf.z.toFixed(1)
    );

    estado(
      'medioFondo ok, tamaño ' +
      tf.x.toFixed(1) + ' x ' +
      tf.y.toFixed(1) + ' x ' +
      tf.z.toFixed(1),
      true
    );

  }).catch(function (err) {
    console.error('[Desierto] No se pudo cargar ' + RUTA_MEDIO_FONDO, err);
    estado('FALLÓ ' + RUTA_MEDIO_FONDO, false);
  });

  // ================== TRACTOR Y VOLQUETA 2 ==================
  function cargarVehiculo(ruta, tamano, x, z, giro, bajar,vertical) {
    cargarModelo(ruta).then(function (obj) {
       // vertical: si el modelo es más largo en X, lo gira 90° para que su lado largo quede de adelante hacia atrás (eje Z)
      if (vertical) {
        const t0 = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());

        if (t0.x > t0.z) {
          obj.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
          obj.updateMatrixWorld(true);
        }
      }
     
      const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
      const dimension = Math.max(tam.x, tam.z);

      if (dimension <= 0) {
        throw new Error('El modelo ' + ruta + ' no tiene dimensiones válidas.');
      }

      obj.scale.multiplyScalar(tamano / dimension);
      obj.updateMatrixWorld(true);

      const centro = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());

      obj.position.x -= centro.x;
      obj.position.z -= centro.z;

      bajarAlSuelo(obj, bajar);
      sombras(obj, false);

      const grupo = new THREE.Group();
      grupo.add(obj);

      grupo.position.set(x, 0, z);
      grupo.rotation.y = giro;

      scene.add(grupo);

      console.log('[Desierto] Vehículo cargado:', ruta);
      estado(ruta + ' ok', true);

    }).catch(function (err) {
      console.error('[Desierto] No se pudo cargar ' + ruta, err);
      estado('FALLÓ ' + ruta, false);
    });
  }

  cargarVehiculo(
    RUTA_TRACTOR,
    TAMANO_TRACTOR,
    POS_TRACTOR_X,
    POS_TRACTOR_Z,
    GIRO_TRACTOR,
    BAJAR_TRACTOR
  );

  cargarVehiculo(
    RUTA_VOLQUETA2,
    TAMANO_VOLQUETA2,
    POS_VOLQUETA2_X,
    POS_VOLQUETA2_Z,
    GIRO_VOLQUETA2,
    BAJAR_VOLQUETA2
  );

    cargarVehiculo(RUTA_PARRILA, TAMANO_PARRILA, POS_PARRILA_X, POS_PARRILA_Z, GIRO_PARRILA, BAJAR_PARRILA);

        cargarVehiculo(RUTA_BUS1, TAMANO_BUS1, POS_BUS1_X, POS_BUS1_Z, GIRO_BUS1, BAJAR_BUS1, VERTICAL_BUS1);
  // ================== CALAMINAS (a los costados de los medioFondo) ==================
  // Cada modelo se prepara una vez y luego se clona en cada posición.
  function prepararCalamina(ruta, tamano, bajar) {
    return cargarModelo(ruta).then(function (obj) {
      const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
      const dimension = Math.max(tam.x, tam.z);

      if (dimension <= 0) {
        throw new Error('El modelo ' + ruta + ' no tiene dimensiones válidas.');
      }

      obj.scale.multiplyScalar(tamano / dimension);
      obj.updateMatrixWorld(true);

      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      obj.position.x -= c.x;
      obj.position.z -= c.z;

      bajarAlSuelo(obj, bajar);
      sombras(obj, false);

      const grupo = new THREE.Group();
      grupo.add(obj);

      return grupo;
    });
  }

  Promise.allSettled([
    prepararCalamina(RUTA_CALAMINAS, TAMANO_CALAMINAS, BAJAR_CALAMINAS),
    prepararCalamina(RUTA_CALAMINAV, TAMANO_CALAMINAV, BAJAR_CALAMINAV)
  ]).then(function (res) {
    const bases = res.map(function (r, i) {
      if (r.status === 'fulfilled') return r.value;

      const ruta = i === 0 ? RUTA_CALAMINAS : RUTA_CALAMINAV;

      console.error('[Desierto] No se pudo cargar ' + ruta, r.reason);
      estado('FALLÓ ' + ruta, false);

      return null;
    });

    let colocadas = 0;

    [-1, 1].forEach(function (lado) {
      Z_CALAMINAS.forEach(function (z, i) {
        const base = bases[(i + (lado > 0 ? 1 : 0)) % 2];

        if (!base) return;

        const g = base.clone(true);

        g.position.set(
          lado * (X_LADO_CALAMINAS + (i % 2) * 3),
          0,
          z
        );

        g.rotation.y =
          (lado > 0 ? Math.PI : 0) +
          GIRO_CALAMINAS +
          (((i * 37) % 10) - 5) * 0.02;

        scene.add(g);
        colocadas++;
      });
    });

    estado('calaminas: ' + colocadas + ' colocadas', colocadas > 0);
  });

  // ================== POSTES DE LUZ ==================
  // Se encienden de noche y un poco al atardecer.
  const POSTES_LUZ = [
    [-12, -30.5],
    [16.5, -36],
    [-12, 32],
    [12, 62],
    [-12, 84],
    [12, 108],
    [-12, 130],
    [12, 154],
    [-12, 176],
    [12, 198]
  ];

  const ALTURA_POSTE = 9.5;
  const RADIO_LUZ_SUELO = 14;

  const LAMPARA_APAGADA = new THREE.Color(0x8a8a80);
  const LAMPARA_ENCENDIDA = new THREE.Color(0xfff0c4);

  const texLuz = (function () {
    const c = document.createElement('canvas');
    c.width = c.height = 128;

    const x = c.getContext('2d');

    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);

    g.addColorStop(0, 'rgba(255,228,170,1)');
    g.addColorStop(0.35, 'rgba(255,205,125,.4)');
    g.addColorStop(1, 'rgba(255,190,100,0)');

    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(c);
  })();

  const matPoste = new THREE.MeshStandardMaterial({
    color: 0x2b2d2f,
    roughness: 0.7,
    metalness: 0.3
  });

  const matLampara = new THREE.MeshBasicMaterial({
    color: LAMPARA_APAGADA
  });

  const matBrillo = new THREE.SpriteMaterial({
    map: texLuz,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });

  const matMancha = new THREE.MeshBasicMaterial({
    map: texLuz,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });

  const geoPoste = new THREE.CylinderGeometry(0.1, 0.15, ALTURA_POSTE, 10);
  const geoBrazo = new THREE.BoxGeometry(1.6, 0.12, 0.12);
  const geoLampara = new THREE.BoxGeometry(0.6, 0.16, 0.36);
  const geoMancha = new THREE.CircleGeometry(RADIO_LUZ_SUELO, 32);

  const postesGrupo = new THREE.Group();
  postesGrupo.visible = false;
  scene.add(postesGrupo);

  function crearPoste(px, pz, dir) {
    const hacia = (dir !== undefined) ? dir : (px > 0 ? -1 : 1);

    const g = new THREE.Group();
    g.position.set(px, 0, pz);

    const poste = new THREE.Mesh(geoPoste, matPoste);
    poste.position.y = ALTURA_POSTE / 2;
    poste.castShadow = true;

    const brazo = new THREE.Mesh(geoBrazo, matPoste);
    brazo.position.set(hacia * 0.8, ALTURA_POSTE, 0);

    const lampara = new THREE.Mesh(geoLampara, matLampara);
    lampara.position.set(hacia * 1.5, ALTURA_POSTE - 0.12, 0);

    const brillo = new THREE.Sprite(matBrillo);
    brillo.scale.set(5, 5, 1);
    brillo.position.set(hacia * 1.5, ALTURA_POSTE - 0.3, 0);

    const mancha = new THREE.Mesh(geoMancha, matMancha);
    mancha.rotation.x = -Math.PI / 2;
    mancha.position.set(hacia * 1.5, 0.07, 0);

    g.add(poste, brazo, lampara, brillo, mancha);
    postesGrupo.add(g);
  }

  POSTES_LUZ.forEach(function (pos) {
    crearPoste(pos[0], pos[1]);
  });

  // v: 0 = apagados, 1 = encendidos del todo
  function actualizarLuces(v) {
    postesGrupo.visible = true;
    matBrillo.opacity = v * 0.9;
    matMancha.opacity = v * 0.65;
    matLampara.color.copy(LAMPARA_APAGADA).lerp(LAMPARA_ENCENDIDA, v);
  }

  // ================== ENTRADA PRINCIPAL ==================
  cargarModelo(RUTA_ENTRADA).then(function (obj) {
    let caja = new THREE.Box3().setFromObject(obj);

    const tam = caja.getSize(new THREE.Vector3());
    const dimensionHorizontal = Math.max(tam.x, tam.z);

    if (dimensionHorizontal <= 0) {
      throw new Error('El modelo ENTRADA no tiene dimensiones válidas.');
    }

    obj.scale.multiplyScalar(TAMANO_ENTRADA / dimensionHorizontal);
    obj.updateMatrixWorld(true);

    caja = new THREE.Box3().setFromObject(obj);

    const centro = caja.getCenter(new THREE.Vector3());

    obj.position.x -= centro.x;
    obj.position.z -= centro.z;

    obj.updateMatrixWorld(true);

    caja = new THREE.Box3().setFromObject(obj);
    obj.position.y -= caja.min.y;

    obj.traverse(function (m) {
      if (!m.isMesh) return;

      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;

      [].concat(m.material || []).forEach(function (mt) {
        if (mt && mt.map) {
          mt.map.encoding = THREE.sRGBEncoding;
        }
      });
    });

    obj.position.x += POS_ENTRADA_X;
    obj.position.z += POS_ENTRADA_Z;
    obj.rotation.y = GIRO_ENTRADA;

    scene.add(obj);

    console.log('[Desierto] Entrada principal cargada correctamente:', RUTA_ENTRADA);
    estado('ENTRADA ok', true);

  }).catch(function (err) {
    console.error('[Desierto] No se pudo cargar la entrada ' + RUTA_ENTRADA, err);
    estado('FALLÓ ' + RUTA_ENTRADA, false);
  });

  // ================== CASA ROJA Y CASA VIEJA (filas largas) ==================
  // Algunos modelos vienen con la casa girada unos grados dentro del archivo. Así, aunque las
  // pongas en línea recta, se ven en zigzag (una más atrás, otra más adelante). Esta función mide
  // cuánto está girada la casa (el giro que deja su rectángulo más ajustado) para enderezarla.
  function anguloParaEnderezar(obj) {
    obj.updateMatrixWorld(true);

    const pts = [];
    const v = new THREE.Vector3();

    obj.traverse(function (m) {
      if (!m.isMesh || !m.geometry.attributes.position) return;

      const pos = m.geometry.attributes.position;
      const salto = Math.max(1, Math.floor(pos.count / 3000));

      for (let i = 0; i < pos.count; i += salto) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        pts.push(v.x, v.z);
      }
    });

    // prueba giros de -45° a +45° (empezando por 0°) y se queda con el que da el rectángulo más chico
    const lista = [0];
    for (let g = 0.5; g <= 45; g += 0.5) lista.push(g, -g);

    let mejor = 0;
    let areaMin = Infinity;

    lista.forEach(function (grados) {
      const a = grados * Math.PI / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);

      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;

      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i] * c + pts[i + 1] * s;
        const z = -pts[i] * s + pts[i + 1] * c;

        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (z < z0) z0 = z;
        if (z > z1) z1 = z;
      }

      const area = (x1 - x0) * (z1 - z0);

      if (area < areaMin - 1e-9) {
        areaMin = area;
        mejor = a;
      }
    });

    return mejor;
  }

  function cargarFila(ruta, tamano, x, z, giro, lado, eje, enderezar, ajuste, cantidad, horizontal) {
    cargarModelo(ruta).then(function (obj) {
      // 1) endereza la casa (si se pidió) ANTES de medirla
      if (enderezar) {
        const a = anguloParaEnderezar(obj);
        obj.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), a);
        obj.updateMatrixWorld(true);
        console.log('[Desierto] ' + ruta + ' enderezada ' + (a * 180 / Math.PI).toFixed(1) + '°');
      }

      // 1b) horizontal: si la casa es más larga en Z (de adelante hacia atrás), la gira 90° para que
      //     su lado largo quede a lo ancho de la pantalla (eje X)
      if (horizontal) {
        const t0 = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());

        if (t0.z > t0.x) {
          obj.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
          obj.updateMatrixWorld(true);
          console.log('[Desierto] ' + ruta + ' girada 90° para quedar horizontal');
        }
      }

      const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
      const dimension = Math.max(tam.x, tam.z);

      if (dimension <= 0) {
        throw new Error('El modelo ' + ruta + ' no tiene dimensiones válidas.');
      }

      obj.scale.multiplyScalar(tamano / dimension);
      obj.updateMatrixWorld(true);

      const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      obj.position.x -= c.x;
      obj.position.z -= c.z;

      bajarAlSuelo(obj, 0);
      sombras(obj, false);

      // 2) medidas reales de la casa para pegarlas una con otra por su lado largo
      const medida = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());

      // si el giro de la fila es de 90°, el largo en X y en Z se intercambian
      const girado = Math.abs(Math.sin(giro)) > 0.7;
      const largoX = girado ? medida.z : medida.x;
      const largoZ = girado ? medida.x : medida.z;

      const ejeUsado = horizontal ? 'x' : eje;
      const alargarEnX = ejeUsado === 'x' || (ejeUsado !== 'z' && largoX >= largoZ);
      const paso = (SEPARACION_FILA > 0 ? SEPARACION_FILA : (alargarEnX ? largoX : largoZ)) + ajuste;

      const base = new THREE.Group();
      base.add(obj);

      // 3) fila recta: solo cambia una coordenada, la otra queda fija
      for (let i = 0; i < cantidad; i++) {
        const casa = base.clone(true);

        casa.position.set(
          x + (alargarEnX ? lado * i * paso : 0),
          0,
          z + (alargarEnX ? 0 : lado * i * paso)
        );

        casa.rotation.y = giro;
        scene.add(casa);
      }

      console.log('[Desierto] Fila cargada:', ruta, '| paso:', paso.toFixed(2), '| eje:', alargarEnX ? 'x' : 'z');

    }).catch(function (err) {
      console.error('[Desierto] No se pudo cargar ' + ruta, err);
    });
  }

  cargarFila(RUTA_CASA_ROJA, TAMANO_CASA_ROJA, POS_CASA_ROJA_X, POS_CASA_ROJA_Z, GIRO_CASA_ROJA, LADO_CASA_ROJA, EJE_CASA_ROJA, ENDEREZAR_CASA_ROJA, AJUSTE_JUNTAS_CASA_ROJA, REPETIR_CASA_ROJA);
  cargarFila(RUTA_CASA_VIEJA, TAMANO_CASA_VIEJA, POS_CASA_VIEJA_X, POS_CASA_VIEJA_Z, GIRO_CASA_VIEJA, LADO_CASA_VIEJA, EJE_CASA_VIEJA, ENDEREZAR_CASA_VIEJA, AJUSTE_JUNTAS_CASA_VIEJA, REPETIR_CASA_VIEJA);
  // ================== CASAS DE ADOBE (hechas con formas, sin modelo) ==================
  // Textura de la pared: prueba varias extensiones hasta encontrar la que existe.
  function cargarTexturaPared(rutas, nombre, listo) {
    function probar(k) {
      if (k >= rutas.length) {
        console.warn('[Desierto] No se encontró la textura de ' + nombre + ' (' + rutas.join(', ') + '). Se usa un color liso.');
        listo(null);
        return;
      }

      new THREE.TextureLoader().load(rutas[k], listo, undefined, function () {
        probar(k + 1);
      });
    }

    probar(0);
  }

  // Techo de calamina: rayas rojizas y grises dibujadas en un canvas
  function texturaCalamina() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');

    const tonos = ['#7b5a49', '#8d9296', '#6a4b3c', '#a1a5a8', '#845e4a', '#5f4a3f', '#9a8f86'];

    for (let i = 0; i < 32; i++) {
      x.fillStyle = tonos[(i * 5) % tonos.length];
      x.fillRect(i * 8, 0, 8, 256);
      x.fillStyle = 'rgba(0,0,0,.25)';
      x.fillRect(i * 8, 0, 2, 256);
    }

    // manchas de óxido
    for (let k = 0; k < 60; k++) {
      x.fillStyle = 'rgba(60,35,25,.12)';
      x.fillRect(Math.random() * 256, Math.random() * 256, 6 + Math.random() * 20, 10 + Math.random() * 40);
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(LARGO_CASA_ADOBE / 4, 1);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  // Una casa: zócalo, paredes, dos triángulos de los extremos, techo a dos aguas, puertas y ventanas
  function construirCasaAdobe(matPared, matGablete, matTecho, matPuerta) {
    const L = LARGO_CASA_ADOBE;
    const F = FONDO_CASA_ADOBE;
    const H = ALTO_CASA_ADOBE;
    const R = ALTURA_TECHO_ADOBE;

    const casa = new THREE.Group();

    const matZocalo = new THREE.MeshStandardMaterial({ color: 0x5b4a3c, roughness: 1 });
    const matMarco = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
    const matVidrio = new THREE.MeshStandardMaterial({ color: 0x58777a, roughness: 0.4 });

    // zócalo (la parte baja y oscura de la pared)
    const zocalo = new THREE.Mesh(new THREE.BoxGeometry(L, 0.8, F + 0.15), matZocalo);
    zocalo.position.y = 0.4;
    casa.add(zocalo);

    // paredes
    const paredes = new THREE.Mesh(new THREE.BoxGeometry(L, H, F), matPared);
    paredes.position.y = H / 2;
    casa.add(paredes);

    // triángulos de los extremos
    const forma = new THREE.Shape();
    forma.moveTo(-F / 2, 0);
    forma.lineTo(F / 2, 0);
    forma.lineTo(0, R);
    forma.closePath();

    const geoGablete = new THREE.ShapeGeometry(forma);

    [-1, 1].forEach(function (lado) {
      const g = new THREE.Mesh(geoGablete, matGablete);
      g.rotation.y = lado * Math.PI / 2;
      g.position.set(lado * L / 2, H, 0);
      casa.add(g);
    });

    // techo a dos aguas (no sobresale a los lados, así las casas quedan como una sola)
    const avance = F / 2 + VOLADO_TECHO_ADOBE;
    const largoAgua = Math.hypot(avance, R);
    const inclinacion = Math.atan2(avance, R);
    const geoAgua = new THREE.PlaneGeometry(L, largoAgua);

    [-1, 1].forEach(function (lado) {
      const agua = new THREE.Mesh(geoAgua, matTecho);
      agua.rotation.x = -lado * inclinacion;
      agua.position.set(0, H + R / 2, lado * avance / 2);
      casa.add(agua);
    });

    // puertas y ventanas en la fachada de adelante (la del lado negativo de Z)
    const zf = -F / 2 - 0.1;

    function puerta(px) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.7), matPuerta);
      m.rotation.y = Math.PI;
      m.position.set(px, 1.35, zf);
      casa.add(m);
    }

    function ventana(px) {
      const marco = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), matMarco);
      const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), matVidrio);
      const barraV = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 1.1), matMarco);
      const barraH = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.06), matMarco);

      [marco, vidrio, barraV, barraH].forEach(function (m, k) {
        m.rotation.y = Math.PI;
        m.position.set(px, 2.3, zf - k * 0.01);
        casa.add(m);
      });
    }

    ventana(-8);
    puerta(-4);
    ventana(0);
    puerta(4);
    ventana(8);

    casa.traverse(function (m) {
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
    });

    return casa;
  }

  cargarTexturaPared(RUTAS_PARED, 'la pared', function (tex) {
  cargarTexturaPared(RUTAS_PUERTA, 'la puerta', function (texPuerta) {
    const matPared = new THREE.MeshStandardMaterial({ color: 0xc9b79c, roughness: 1, side: THREE.DoubleSide });
    const matGablete = matPared.clone();

    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(LARGO_CASA_ADOBE / 6, 1);
      tex.encoding = THREE.sRGBEncoding;

      const texGablete = tex.clone();
      texGablete.repeat.set(1 / 5, 1 / 5);   // el triángulo usa medidas del mundo, no de 0 a 1
      texGablete.needsUpdate = true;

      matPared.map = tex;
      matPared.color.set(0xffffff);
      matGablete.map = texGablete;
      matGablete.color.set(0xffffff);
    }

    // puerta: con textura si existe; si no, celeste liso
    const matPuerta = new THREE.MeshStandardMaterial({ color: 0x3f9aa0, roughness: 0.8 });

    if (texPuerta) {
      texPuerta.encoding = THREE.sRGBEncoding;
      matPuerta.map = texPuerta;
      matPuerta.color.set(0xffffff);
    }

    const matTecho = new THREE.MeshStandardMaterial({
      map: texturaCalamina(),
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < REPETIR_CASA_ADOBE; i++) {
      const casa = construirCasaAdobe(matPared, matGablete, matTecho, matPuerta);

      casa.position.set(POS_CASA_ADOBE_X + LADO_CASA_ADOBE * i * LARGO_CASA_ADOBE, 0, POS_CASA_ADOBE_Z);
      casa.rotation.y = GIRO_CASA_ADOBE;
      scene.add(casa);
    }

    console.log('[Desierto] Casas de adobe:', REPETIR_CASA_ADOBE,
      '| pared:', tex ? 'con textura' : 'lisa',
      '| puerta:', texPuerta ? 'con textura' : 'lisa');
  });
  });

  // ================== CASA DE AFUERA (delante de las casas de adobe) ==================
  // Se carga igual que la casa vieja: una sola vez y se repite en fila, recta y pegada.
  cargarFila(RUTA_CASA_AFUERA, TAMANO_CASA_AFUERA, POS_CASA_AFUERA_X, POS_CASA_AFUERA_Z, GIRO_CASA_AFUERA, LADO_CASA_AFUERA, EJE_CASA_AFUERA, ENDEREZAR_CASA_AFUERA, AJUSTE_JUNTAS_CASA_AFUERA, REPETIR_CASA_AFUERA, HORIZONTAL_CASA_AFUERA);


  // ================== VOLQUETAS AL COSTADO DE LA CASA DE AFUERA ==================
  // El modelo se carga una sola vez y se repite en fila, hacia el mismo lado que crece la fila de casas.
  cargarModelo(RUTA_VOLQUETAS_AFUERA).then(function (obj) {
    const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    const dimension = Math.max(tam.x, tam.z);

    if (dimension <= 0) {
      throw new Error('El modelo ' + RUTA_VOLQUETAS_AFUERA + ' no tiene dimensiones válidas.');
    }

    obj.scale.multiplyScalar(TAMANO_VOLQUETAS_AFUERA / dimension);
    obj.updateMatrixWorld(true);

    const centro = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
    obj.position.x -= centro.x;
    obj.position.z -= centro.z;

    bajarAlSuelo(obj, BAJAR_VOLQUETAS_AFUERA);
    sombras(obj, false);

    const base = new THREE.Group();
    base.add(obj);

    for (let i = 0; i < CANTIDAD_VOLQUETAS_AFUERA; i++) {
      const volqueta = base.clone(true);

      volqueta.position.set(
               POS_VOLQUETAS_AFUERA_X + LADO_VOLQUETAS_AFUERA * i * SEPARACION_VOLQUETAS_AFUERA,
        0,
        POS_VOLQUETAS_AFUERA_Z
      );

      volqueta.rotation.y = GIRO_VOLQUETAS_AFUERA;
      scene.add(volqueta);
    }

    console.log('[Desierto] Volquetas al costado de la casa de afuera:', CANTIDAD_VOLQUETAS_AFUERA);

  }).catch(function (err) {
    console.error('[Desierto] No se pudieron cargar las volquetas de la casa de afuera', err);
  });

  // ================== TRACTORES DETRÁS DE LA CASA ROJA ==================
  // El modelo se carga una sola vez y se repite en fila, hacia el mismo lado que crece la casa roja.
  cargarModelo(RUTA_TRACTOR).then(function (obj) {
    const tam = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    const dimension = Math.max(tam.x, tam.z);

    if (dimension <= 0) {
      throw new Error('El modelo ' + RUTA_TRACTOR + ' no tiene dimensiones válidas.');
    }

    obj.scale.multiplyScalar(TAMANO_TRACTORES_ROJA / dimension);
    obj.updateMatrixWorld(true);

    const centro = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
    obj.position.x -= centro.x;
    obj.position.z -= centro.z;

    bajarAlSuelo(obj, BAJAR_TRACTOR);
    sombras(obj, false);

    const base = new THREE.Group();
    base.add(obj);

    for (let i = 0; i < CANTIDAD_TRACTORES_ROJA; i++) {
      const tractor = base.clone(true);

      tractor.position.set(
        POS_TRACTORES_ROJA_X + LADO_CASA_ROJA * i * SEPARACION_TRACTORES_ROJA,
        0,
        POS_TRACTORES_ROJA_Z
      );

      tractor.rotation.y = GIRO_TRACTORES_ROJA;
      scene.add(tractor);
    }

    console.log('[Desierto] Tractores detrás de la casa roja:', CANTIDAD_TRACTORES_ROJA);

  }).catch(function (err) {
    console.error('[Desierto] No se pudieron cargar los tractores de la casa roja', err);
  });

  // ================== CONTROLES ==================
  let visible = false;
  let pausado = false;
  let modo = 'intro';

  const teclas = {};

  const hay = (...codes) => codes.some((c) => teclas[c]);

  const activo = () => visible && !pausado && modo === 'explorar';

  const TECLAS_MOV = [
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight'
  ];

  addEventListener('keydown', (e) => {
    if (!activo() || !TECLAS_MOV.includes(e.code)) return;
    teclas[e.code] = true;
    e.preventDefault();
  });

  addEventListener('keyup', (e) => {
    teclas[e.code] = false;
  });

  addEventListener('blur', () => {
    for (const k in teclas) teclas[k] = false;
  });

  let angulo = 0;
  const LIMITE = TAMANO / 2 - 20;

  // ================== TARJETAS DE INFORMACIÓN: ESTILOS ==================
  const estilo = document.createElement('style');

  estilo.textContent = `
    #info-prompt{position:fixed;left:50%;bottom:64px;transform:translateX(-50%) translateY(8px);z-index:9;opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease}
    #info-prompt.show{opacity:1;pointer-events:auto;transform:translateX(-50%)}
    #info-prompt button{display:flex;align-items:center;gap:10px;font:500 15px Oswald,'Arial Narrow',sans-serif;letter-spacing:.5px;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 24px 10px 10px;cursor:pointer}
    #info-prompt .tecla{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:6px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.3);font:500 14px Oswald,'Arial Narrow',sans-serif;letter-spacing:0}
    #info-prompt button:hover{background:rgba(0,0,0,.7)}

    /* Tarjeta al costado (esquina inferior derecha) */
    #tarjeta-info{position:fixed;right:24px;bottom:24px;z-index:50;width:min(440px,calc(100vw - 48px));opacity:0;pointer-events:none;transform:translateX(30px);transition:opacity .35s ease,transform .5s cubic-bezier(.25,1,.5,1)}
    #tarjeta-info.show{opacity:1;pointer-events:auto;transform:none}
    .tj-carta{position:relative;width:100%;height:min(540px,calc(100vh - 110px));border-radius:18px;overflow:hidden;background:#171311;border:1px solid rgba(255,255,255,.12);color:#fff;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 25px 60px rgba(0,0,0,.8),0 0 30px rgba(197,168,128,.2)}
    .tj-foto{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .tj-velo{position:absolute;inset:0;pointer-events:none;transition:opacity .5s ease;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.1) 22%,rgba(0,0,0,.55) 48%,rgba(0,0,0,.94) 100%)}
    .tj-contenido{position:relative;z-index:2;width:100%;height:100%;box-sizing:border-box;padding:56px 22px 22px;display:flex;flex-direction:column;justify-content:flex-end;text-align:left}
    .tj-arriba{position:absolute;top:0;left:0;right:0;z-index:4;box-sizing:border-box;padding:16px 56px 0 22px;display:flex;justify-content:space-between;align-items:center}
    .tj-tag{font-size:.74rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.8)}
    .tj-der{display:flex;align-items:center;gap:10px}
    .tj-btn-fuente{background:none;border:none;padding:0;cursor:pointer;font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.06em;color:#c5a880;text-decoration:underline;text-shadow:0 2px 6px rgba(0,0,0,.8)}
    .tj-btn-fuente:hover{color:#f3e3c3}
    .tj-btn-despejar{padding:4px 12px;border:1px solid rgba(197,168,128,.75);border-radius:9999px;background:rgba(0,0,0,.4);color:#e6cfa5;font:inherit;font-size:.7rem;font-weight:700;letter-spacing:.08em;cursor:pointer}
    .tj-btn-despejar:hover{background:rgba(0,0,0,.7)}

    .tj-cuerpo{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-height:0;transition:opacity .4s ease}
    .tj-titulo{margin:0;font-size:1.55rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;line-height:1.1;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95)}
    .tj-linea{width:34px;height:2px;margin:8px 0 10px;border-radius:2px;background:#c5a880;box-shadow:0 0 8px rgba(197,168,128,.7)}
    .tj-textos{max-height:170px;overflow-y:auto;padding:0 6px 0 0;scrollbar-width:thin;scrollbar-color:rgba(197,168,128,.5) transparent}
    .tj-textos p{margin:0 0 8px;font-size:.88rem;font-style:italic;line-height:1.4;color:rgba(255,255,255,.92);text-shadow:0 2px 8px rgba(0,0,0,.9)}
    .tj-textos strong{color:#e6cfa5;font-weight:700}
    .tj-datos{display:flex;flex-wrap:wrap;gap:6px 16px;margin:4px 0 12px}
    .tj-dato{display:flex;flex-direction:column;max-width:130px}
    .tj-dato b{font-size:1rem;color:#c5a880;text-shadow:0 2px 6px rgba(0,0,0,.9)}
    .tj-dato span{font-size:.68rem;line-height:1.25;color:rgba(255,255,255,.8)}
    .tj-btn-video,.tj-enlace{display:inline-flex;align-items:center;gap:6px;padding:8px 22px;border:none;border-radius:9999px;cursor:pointer;text-decoration:none;background:linear-gradient(135deg,#c5a880 0%,#a48256 100%);color:#110d0c;font-size:.74rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,.4);transition:transform .2s ease}
    .tj-btn-video:hover,.tj-enlace:hover{transform:scale(1.05)}
    .tj-carta.despejado .tj-velo{opacity:0}
    .tj-carta.despejado .tj-cuerpo,.tj-carta.despejado .tj-tag,.tj-carta.despejado .tj-btn-fuente{opacity:0;pointer-events:none}

    .tj-fuentes{position:absolute;inset:0;z-index:3;box-sizing:border-box;padding:56px 22px 22px;overflow-y:auto;background:rgba(12,10,9,.97);text-align:left;opacity:0;pointer-events:none;transition:opacity .3s ease}
    .tj-fuentes.abierto{opacity:1;pointer-events:auto}
    .tj-fuentes h4{margin:0 0 12px;font-size:.78rem;letter-spacing:.3em;text-transform:uppercase;color:#c5a880}
    .tj-fuentes ul{margin:0;padding:0;list-style:none}
    .tj-fuentes li{margin-bottom:12px;font-size:.8rem;line-height:1.35;color:rgba(255,255,255,.85)}
    .tj-fuentes a{color:#e6cfa5;text-decoration:underline}
    .tj-fuentes small{display:block;margin-top:2px;font-size:.66rem;color:rgba(255,255,255,.45)}

    .tj-x{position:absolute;top:10px;right:10px;z-index:5;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.55);color:#fff;font-size:1.3rem;line-height:1;cursor:pointer}
    .tj-x:hover{background:rgba(0,0,0,.85)}
    @media(max-width:640px){#tarjeta-info{right:12px;bottom:12px;width:calc(100vw - 24px)}.tj-carta{height:min(520px,calc(100vh - 90px))}}

    /* TV retro del video */
    #tv-retro{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);opacity:0;pointer-events:none;transition:opacity .3s ease}
    #tv-retro.show{opacity:1;pointer-events:auto}
    .tv-caja{width:min(680px,92vw);box-sizing:border-box;padding:1.3rem;background:#2f363a;border:.4rem solid #24231f;border-radius:1rem;display:grid;gap:1rem;box-shadow:0 30px 80px rgba(0,0,0,.9)}
    .tv-marco{position:relative;padding:1.4rem;border-radius:1rem;background:#24231f}
    .tv-pantalla{position:relative;overflow:hidden;border-radius:2rem/1rem;background:#4e5e55;aspect-ratio:16/9}
    .tv-pantalla video{display:block;width:100%;height:100%;object-fit:contain;background:#000}
    .tv-error{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:1rem;text-align:center;color:#d9e6dc;font-size:.9rem}
    .tv-abajo{display:flex;justify-content:space-between;align-items:center;gap:.75rem}
    .tv-parlante{width:6rem;height:2.4rem;background-image:radial-gradient(#000 .1rem,transparent 0);background-size:.5rem .5rem}
    .tv-controles{display:flex;align-items:center;gap:.5rem}
    .tv-boton{width:1.7rem;height:1.7rem;border-radius:50%;border:1px solid #000;background:none;color:#cfd6d9;font-size:.85rem;line-height:1;cursor:pointer}
    .tv-boton:hover{background:rgba(255,255,255,.12)}
    .tv-pestanas{display:flex;justify-content:center;gap:.6rem}
    .tv-pestana{padding:.3rem 1rem;border:1px solid #000;border-radius:9999px;background:none;color:#cfd6d9;font-size:.78rem;cursor:pointer}
    .tv-pestana.activa{background:#4e5e55;color:#fff}
    @media(max-width:520px){.tv-parlante{display:none}}`;

  document.head.appendChild(estilo);

  const avisoEl = document.createElement('div');
  avisoEl.id = 'info-prompt';
  avisoEl.innerHTML = '<button type="button"><span class="tecla">E</span><span>Presiona E para ver información</span></button>';
  document.body.appendChild(avisoEl);

  const tarjetaEl = document.createElement('div');
  tarjetaEl.id = 'tarjeta-info';
  document.body.appendChild(tarjetaEl);

  const tvEl = document.createElement('div');
  tvEl.id = 'tv-retro';
  document.body.appendChild(tvEl);

  // ================== PUNTOS DE INFORMACIÓN: MARCADORES ==================
  const COLOR_ANILLO_1 = '#ffffff';
  const COLOR_ANILLO_2 = '#7cc8ff';
  const COLOR_CENTRO = '#f7ce8d';
  const ALTURA_MARCADOR = 1;
  const RADIO_ANILLO = 0.6;
  const PUNTOS_POR_ANILLO = 32;
  const VELOCIDAD_LATIDO = 2.2;
  const AMPLITUD_LATIDO = 0.2;
  const BRILLO_NOCHE = 0.5;

  function texAnillo(color, n) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    const r = 112, circ = 2 * Math.PI * r;

    x.strokeStyle = color;
    x.lineWidth = 14;
    x.lineCap = 'round';
    x.setLineDash([0.01, circ / n - 0.01]);
    x.beginPath();
    x.arc(128, 128, r, 0, Math.PI * 2);
    x.stroke();

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }

  const texAnillo1 = texAnillo(COLOR_ANILLO_1, PUNTOS_POR_ANILLO);
  const texAnillo2 = texAnillo(COLOR_ANILLO_2, Math.round(PUNTOS_POR_ANILLO * 0.65));

  const texCentro = (function () {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = COLOR_CENTRO;
    x.beginPath();
    x.arc(32, 32, 26, 0, Math.PI * 2);
    x.fill();
    return new THREE.CanvasTexture(c);
  })();

  const texHalo = (function () {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);

    g.addColorStop(0, 'rgba(190,230,255,.95)');
    g.addColorStop(0.35, 'rgba(124,200,255,.45)');
    g.addColorStop(1, 'rgba(124,200,255,0)');

    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(c);
  })();

  const ESCALA_ANILLO = 1 / 0.4375;
  const geoLinea = new THREE.CylinderGeometry(0.025, 0.025, 1, 6, 1, true);
  const matLinea = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    fog: false
  });

  const puntosGrupo = new THREE.Group();
  puntosGrupo.visible = false;
  scene.add(puntosGrupo);

  const puntos = PUNTOS_INFO.map(function (d, i) {
    const g = new THREE.Group();
    g.position.set(d.x, 0, d.z);

    function sprite(tex, extra) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign(
        { map: tex, transparent: true, depthWrite: false, fog: false },
        extra || {}
      )));
      s.position.y = ALTURA_MARCADOR;
      return s;
    }

    const halo = sprite(texHalo, { blending: THREE.AdditiveBlending, opacity: 0 });
    const a1 = sprite(texAnillo1);
    const a2 = sprite(texAnillo2);
    const centro = sprite(texCentro);

    const altoLinea = ALTURA_MARCADOR - RADIO_ANILLO;
    const linea = new THREE.Mesh(geoLinea, matLinea);
    linea.scale.y = altoLinea;
    linea.position.y = altoLinea / 2;

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.y = ALTURA_MARCADOR;

    g.add(linea, halo, a1, a2, centro, hit);
    puntosGrupo.add(g);

    return {
      g: g,
      halo: halo,
      a1: a1,
      a2: a2,
      centro: centro,
      hit: hit,
      d: d,
      i: i
    };
  });

  let cercano = null, abierto = null;

  function mostrarAviso(v) {
    avisoEl.classList.toggle('show', !!v);
  }

  function mk(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  // ---- TV retro con el video (mientras está abierta, el mundo se pausa) ----
  let videoTV = null;

  function cerrarTV() {
    if (!tvEl.classList.contains('show')) return false;
    if (videoTV) { videoTV.pause(); videoTV.removeAttribute('src'); videoTV.load(); videoTV = null; }
    tvEl.classList.remove('show');
    tvEl.innerHTML = '';
    pausado = false;
    return true;
  }

  function abrirTV(d) {
    tvEl.innerHTML = '';
    const caja = mk('div', 'tv-caja');
    const marco = mk('div', 'tv-marco');
    const pantalla = mk('div', 'tv-pantalla');

    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    const lista = Array.isArray(d.video) ? d.video : [d.video];   // un video o varios
    let actual = 0;
    const pestanas = [];
    const error = mk('div', 'tv-error');

    function cargar(i) {
      actual = i;
      error.style.display = 'none';
      video.style.display = 'block';
      error.textContent = 'No se encontró el video (' + lista[i] + ')';
      video.src = lista[i];
      video.play().catch(function () { /* si el navegador pide un clic, el usuario le da play */ });
      pestanas.forEach(function (p, k) { p.classList.toggle('activa', k === i); });
    }
    video.addEventListener('error', function () { video.style.display = 'none'; error.style.display = 'flex'; });
    video.addEventListener('ended', function () { if (actual < lista.length - 1) cargar(actual + 1); });
    pantalla.appendChild(video);
    pantalla.appendChild(error);
    marco.appendChild(pantalla);
    caja.appendChild(marco);

    if (lista.length > 1) {
      const fila = mk('div', 'tv-pestanas');
      lista.forEach(function (ruta, k) {
        const b = mk('button', 'tv-pestana', 'Video ' + (k + 1));
        b.type = 'button';
        b.addEventListener('click', function () { cargar(k); b.blur(); });
        pestanas.push(b);
        fila.appendChild(b);
      });
      caja.appendChild(fila);
    }
    cargar(0);

    const boton = function (txt, titulo, accion) {
      const b = mk('button', 'tv-boton', txt);
      b.type = 'button';
      b.title = titulo;
      b.setAttribute('aria-label', titulo);
      b.addEventListener('click', function () { accion(); b.blur(); });
      return b;
    };
    const c1 = mk('div', 'tv-controles'), c2 = mk('div', 'tv-controles'), c3 = mk('div', 'tv-controles');
    c1.appendChild(boton('⏻', 'Apagar', cerrarTV));
    c2.appendChild(boton('−', 'Bajar volumen', function () { video.volume = Math.max(0, video.volume - 0.2); }));
    c2.appendChild(boton('+', 'Subir volumen', function () { video.volume = Math.min(1, video.volume + 0.2); }));
    c3.appendChild(boton('‹', 'Retroceder 5 s', function () { video.currentTime = Math.max(0, video.currentTime - 5); }));
    c3.appendChild(boton('›', 'Adelantar 5 s', function () { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }));

    const abajo = mk('div', 'tv-abajo');
    abajo.appendChild(mk('div', 'tv-parlante'));
    abajo.appendChild(c1);
    abajo.appendChild(c2);
    abajo.appendChild(c3);
    abajo.appendChild(mk('div', 'tv-parlante'));
    caja.appendChild(abajo);

    tvEl.appendChild(caja);
    tvEl.addEventListener('click', function (e) { if (e.target === tvEl) cerrarTV(); }, { once: true });
    videoTV = video;
    for (const k in teclas) teclas[k] = false;
    pausado = true;                        // el mundo se detiene mientras ves el video
    tvEl.classList.add('show');
  }

  // ESC: cierra primero la TV y, si no hay TV, la tarjeta
  addEventListener('keydown', function (e) {
    if (e.code === 'Escape') { if (!cerrarTV()) cerrarInfo(); }
  });

  function cerrarInfo() {
    cerrarTV();
    abierto = null;
    tarjetaEl.classList.remove('show');
  }

  // "texto **resaltado** texto" -> nodos seguros (sin innerHTML)
  function conResaltado(el, txt) {
    txt.split('**').forEach(function (parte, k) {
      if (!parte) return;
      if (k % 2) {
        const s = document.createElement('strong');
        s.textContent = parte;
        el.appendChild(s);
      } else {
        el.appendChild(document.createTextNode(parte));
      }
    });
  }

  function abrirInfo(p) {
    cerrarTV();
    abierto = p;
    tarjetaEl.innerHTML = '';
    const d = p.d;

    const carta = mk('div', 'tj-carta');

    // foto de fondo (si no carga, queda el fondo oscuro)
    if (d.imagen) {
      const img = document.createElement('img');
      img.className = 'tj-foto';
      img.style.objectPosition = d.imagen.foco || '60% 40%';   // qué parte de la foto se queda (x% y%)
      img.alt = d.imagen.pie || d.titulo;
      img.decoding = 'async';
      img.addEventListener('error', function () { img.remove(); });
      img.src = d.imagen.src;
      carta.appendChild(img);
    }
    carta.appendChild(mk('div', 'tj-velo'));

    // cuerpo (abajo)
    const contenido = mk('div', 'tj-contenido');
    const cuerpo = mk('div', 'tj-cuerpo');
    cuerpo.appendChild(mk('h2', 'tj-titulo', d.titulo));
    cuerpo.appendChild(mk('div', 'tj-linea'));

    const textos = mk('div', 'tj-textos');
    d.texto.forEach(function (t) {
      const par = mk('p');
      conResaltado(par, t);
      textos.appendChild(par);
    });
    cuerpo.appendChild(textos);

    if (d.datos && d.datos.length) {
      const fila = mk('div', 'tj-datos');
      d.datos.slice(0, 3).forEach(function (x) {
        const c = mk('div', 'tj-dato');
        c.appendChild(mk('b', '', x.n));
        c.appendChild(mk('span', '', x.t));
        fila.appendChild(c);
      });
      cuerpo.appendChild(fila);
    }

    if (d.video) {                               // botón "Ver video" (solo si el punto tiene video)
      const btnVideo = mk('button', 'tj-btn-video', 'Ver video');
      btnVideo.type = 'button';
      btnVideo.addEventListener('click', function () { abrirTV(d); btnVideo.blur(); });
      cuerpo.appendChild(btnVideo);
    }
    if (d.enlace) {
      const a = mk('a', 'tj-enlace', d.enlace.texto + ' →');
      a.href = d.enlace.url;
      cuerpo.appendChild(a);
    }

    contenido.appendChild(cuerpo);
    carta.appendChild(contenido);

    // barra de arriba: Fuente (izquierda) · etiqueta y Despejar (derecha)
    const arriba = mk('div', 'tj-arriba');
    const tieneFuentes = d.fuentes && d.fuentes.length;
    const btnFuente = mk('button', 'tj-btn-fuente', 'Fuente');
    btnFuente.type = 'button';
    if (!tieneFuentes) btnFuente.style.visibility = 'hidden';
    arriba.appendChild(btnFuente);

    const der = mk('div', 'tj-der');
    der.appendChild(mk('span', 'tj-tag', (d.etiqueta || 'Dato curioso') + ' · ' + String(p.i + 1).padStart(2, '0') + '/' + String(puntos.length).padStart(2, '0')));
    const btnDespejar = mk('button', 'tj-btn-despejar', 'Despejar');
    btnDespejar.type = 'button';
    btnDespejar.addEventListener('click', function () {
      const despejado = carta.classList.toggle('despejado');
      btnDespejar.textContent = despejado ? 'Mostrar' : 'Despejar';
      const panelF = carta.querySelector('.tj-fuentes');
      if (panelF) { panelF.classList.remove('abierto'); btnFuente.textContent = 'Fuente'; }
      btnDespejar.blur();
    });
    der.appendChild(btnDespejar);
    arriba.appendChild(der);
    carta.appendChild(arriba);

    // panel con la lista de fuentes
    if (tieneFuentes) {
      const panel = mk('div', 'tj-fuentes');
      panel.appendChild(mk('h4', '', 'Fuentes'));
      const lista = document.createElement('ul');
      d.fuentes.forEach(function (f) {
        const li = document.createElement('li');
        if (f.u) {
          const a = mk('a', '', f.t);
          a.href = f.u;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          li.appendChild(a);
          try { li.appendChild(mk('small', '', new URL(f.u).hostname.replace(/^www\./, ''))); } catch (e) { /* sin dominio */ }
        } else {
          li.textContent = f.t;
        }
        lista.appendChild(li);
      });
      panel.appendChild(lista);
      carta.appendChild(panel);

      btnFuente.addEventListener('click', function () {
        const ab = panel.classList.toggle('abierto');
        btnFuente.textContent = ab ? 'Volver' : 'Fuente';
        btnFuente.blur();
      });
    }

    const x = mk('button', 'tj-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Cerrar');
    x.addEventListener('click', cerrarInfo);
    carta.appendChild(x);

    tarjetaEl.appendChild(carta);
    tarjetaEl.classList.add('show');
    mostrarAviso(false);
  }

  // ================== INTERACCIÓN CON PUNTOS ==================
  const teclaE = (e) => {
    if (e.code !== 'KeyE' || !activo()) return;

    if (abierto) {
      cerrarInfo();
    } else if (cercano) {
      abrirInfo(cercano);
    }
  };

  addEventListener('keydown', teclaE);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener('click', function (e) {
    if (!activo()) return;

    const rect = canvas.getBoundingClientRect();

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(
      puntos.map(function (p) { return p.hit; }),
      false
    );

    if (hits.length) {
      const p = puntos.find(function (x) {
        return x.hit === hits[0].object;
      });

      if (p) abrirInfo(p);
    }
  });

  function actualizarPuntos(te) {
    const cercaMax = 9;
    let mejor = null;
    let mejorDist = Infinity;

    puntos.forEach(function (p) {
      const pos = p.g.position;
      const dx = pos.x - jugador.position.x;
      const dz = pos.z - jugador.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < cercaMax && dist < mejorDist) {
        mejor = p;
        mejorDist = dist;
      }
    });

    cercano = mejor;

    if (cercano && cercano !== abierto) {
      mostrarAviso(true);
    } else {
      mostrarAviso(false);
    }

    const noche = Math.min(1, mezcla.luces) * BRILLO_NOCHE;

    puntos.forEach(function (p) {
      const dist = Math.hypot(
        jugador.position.x - p.g.position.x,
        jugador.position.z - p.g.position.z
      );

      const cerca = Math.max(0, Math.min(1, 1 - dist / 30));
      const activoP = p === cercano;
      const amp = AMPLITUD_LATIDO * (activoP ? 1.4 : 1);
      const fase = te * VELOCIDAD_LATIDO + p.i * 0.9;
      const crece = 1 + 0.12 * noche;

      const s1 = RADIO_ANILLO * ESCALA_ANILLO * crece *
        (1 + amp * Math.sin(fase));

      const s2 = RADIO_ANILLO * 0.62 * ESCALA_ANILLO * crece *
        (1 + amp * Math.sin(fase + Math.PI));

      p.a1.scale.set(s1, s1, 1);
      p.a2.scale.set(s2, s2, 1);

      p.a1.material.rotation = te * 0.25;
      p.a2.material.rotation = -te * 0.35;

      p.a1.material.opacity = 0.75 + 0.2 * cerca + (activoP ? 0.05 : 0);
      p.a2.material.opacity = 0.8 + 0.2 * cerca;

      const c = ((activoP ? 1.5 : 1) + 0.15 * Math.sin(fase)) *
        0.5 * (1 + 0.3 * noche);

      p.centro.scale.set(c, c, 1);

      const h = RADIO_ANILLO * ESCALA_ANILLO * 1.7 *
        (1 + 0.12 * Math.sin(fase));

      p.halo.scale.set(h, h, 1);
      p.halo.material.opacity = noche *
        (0.55 + 0.25 * Math.sin(fase) + (activoP ? 0.15 : 0));
    });
  }

  // ================== BUCLE ==================
  const reloj = new THREE.Clock();
  let tCam = 0, cambiando = false, snap = false;

  const objCam = new THREE.Vector3();
  const objMira = new THREE.Vector3();

  const mira = new THREE.Vector3(
    POS_CAM_INTRO.x,
    POS_CAM_INTRO.y - Math.sin(PITCH_CAM) * 40,
    POS_CAM_INTRO.z + Math.cos(PITCH_CAM) * 40
  );

  const foco = new THREE.Vector3();

  function ajustarTamano() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (!w || !h) return;

    const pr = renderer.getPixelRatio();

    if (
      canvas.width !== Math.floor(w * pr) ||
      canvas.height !== Math.floor(h * pr)
    ) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  function loop() {
    requestAnimationFrame(loop);

    const dt = Math.min(reloj.getDelta(), 0.05);

    if (!visible || pausado) return;

    ajustarTamano();

    if (modo === 'explorar') {
      if (hay('KeyA', 'ArrowLeft')) angulo += GIRO * dt;
      if (hay('KeyD', 'ArrowRight')) angulo -= GIRO * dt;

      let avance = 0;

      if (hay('KeyW', 'ArrowUp')) avance = 1;
      if (hay('KeyS', 'ArrowDown')) avance = -0.6;

      jugador.rotation.y = angulo;

      const dx = Math.sin(angulo);
      const dz = Math.cos(angulo);

      jugador.position.x = THREE.MathUtils.clamp(
        jugador.position.x + dx * avance * VELOCIDAD * dt,
        -LIMITE,
        LIMITE
      );

      jugador.position.z = THREE.MathUtils.clamp(
        jugador.position.z + dz * avance * VELOCIDAD * dt,
        -LIMITE,
        LIMITE
      );

      if (mixer) {
        if (accionCaminar) {
          accionCaminar.paused = (avance === 0);
          accionCaminar.timeScale = avance * VELOCIDAD_ANIMACION;
        }

        mixer.update(dt);

        if (huesoCadera) bloquearCadera();
      }

      objCam.set(
        jugador.position.x - dx * DIST_CAM,
        ALTURA_CAM,
        jugador.position.z - dz * DIST_CAM
      );

      camera.position.lerp(objCam, 1 - Math.pow(0.001, dt));

      objMira.set(
        jugador.position.x,
        2.5,
        jugador.position.z
      );

      foco.copy(jugador.position);

    } else {
      tCam += dt;

      const giro = AMPL_GIRO * Math.sin(tCam * VEL_GIRO_CAM);

      camera.position.set(
        POS_CAM_INTRO.x,
        POS_CAM_INTRO.y,
        POS_CAM_INTRO.z
      );

      objMira.set(
        camera.position.x + Math.sin(giro) * Math.cos(PITCH_CAM) * 40,
        camera.position.y - Math.sin(PITCH_CAM) * 40,
        camera.position.z + Math.cos(giro) * Math.cos(PITCH_CAM) * 40
      );

      foco.set(0, 0, 15);
    }

    if (MOSTRAR_COORDENADAS && modo === 'explorar') {
      panelPos.textContent =
        'x ' + jugador.position.x.toFixed(1) +
        '   z ' + jugador.position.z.toFixed(1);
    }

    actualizarPuntos(reloj.elapsedTime);

    if (snap) {
      mira.copy(objMira);
      snap = false;
    } else {
      mira.lerp(objMira, 1 - Math.pow(0.002, dt));
    }

    camera.lookAt(mira);

    fondo.position.x = camera.position.x;
    fondo.position.z = camera.position.z;

    actualizarLuna();

    sol.position.set(
      foco.x + 50,
      mezcla.solY,
      foco.z + 30
    );

    sol.target.position.copy(foco);

    actualizarTema(dt);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(loop);

  // ================== PRECOMPILAR ==================
  function precompilar() {
    const jv = jugador.visible;
    const pv = puntosGrupo.visible;

    jugador.visible = true;
    puntosGrupo.visible = true;

    try {
      renderer.compile(scene, camera);
    } catch (e) {
      // Si falla, se compila al entrar como antes.
    }

    jugador.visible = jv;
    puntosGrupo.visible = pv;
  }

  window.addEventListener('load', function () {
    setTimeout(precompilar, 5000);
  });

  // ================== API PARA index.html ==================
  window.Desierto = {
    mostrar() {
      visible = true;
      canvas.style.opacity = '1';
    },

    explorar() {
      if (modo === 'explorar' || cambiando) return;

      cambiando = true;
      precompilar();

      canvas.style.transition = 'opacity .4s ease';
      canvas.style.opacity = '0';

      setTimeout(() => {
        modo = 'explorar';
        angulo = 0;

        jugador.position.set(0, 0, Z_APARECER);
        jugador.rotation.y = 0;
        jugador.visible = true;

        // MOSTRAR LOS PUNTOS DE INFORMACIÓN
        puntosGrupo.visible = true;

        camera.position.set(
          0,
          ALTURA_CAM,
          Z_APARECER - DIST_CAM
        );

        mira.set(0, 2.5, Z_APARECER);
        snap = false;

        canvas.style.opacity = '1';
        cambiando = false;

        const h = document.getElementById('desierto-hint');

        if (h) {
          h.classList.add('show');
          setTimeout(() => h.classList.remove('show'), 9000);
        }
      }, 450);
    },

    volver() {
      if (modo === 'intro' || cambiando) return;

      cambiando = true;
      canvas.style.transition = 'opacity .4s ease';
      canvas.style.opacity = '0';

      for (const k in teclas) teclas[k] = false;

      cerrarInfo();
      cercano = null;
      mostrarAviso(false);

      const h = document.getElementById('desierto-hint');
      if (h) h.classList.remove('show');

      setTimeout(() => {
        modo = 'intro';
        jugador.visible = false;

        // OCULTAR LOS PUNTOS AL SALIR DE EXPLORAR
        puntosGrupo.visible = false;

        snap = true;

        canvas.style.opacity = '1';
        cambiando = false;
      }, 450);
    },

    ocultar() {
      visible = false;
      canvas.style.opacity = '0';
    },

    pausar(p) {
      pausado = !!p;

      if (pausado) {
        for (const k in teclas) teclas[k] = false;
      }
    },

    setTema(nombre) {
      tema = TEMAS[nombre] || TEMAS.claro;
    }
  };
})();