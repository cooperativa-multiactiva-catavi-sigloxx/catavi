/* =====================================================================
   desierto.js — el mundo caminable como fondo de la página principal.
   Dibuja en su propio canvas (#canvas-desierto) que va DETRÁS del
   canvas del escudo. CATAVI.js / index.html lo controlan con window.Desierto.
   ===================================================================== */
(function () {
  'use strict';
  console.log('desierto.js VERSION 6 cargada');

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

  // ---- Medio fondo ----
  const RUTA_MEDIO_FONDO = './medioFondo.glb';
  const TAMANO_MEDIO_FONDO = 100;
  const POS_MEDIO_FONDO_X = 0, POS_MEDIO_FONDO_Z = 100;
  const GIRO_MEDIO_FONDO = Math.PI;
  const BAJAR_MEDIO_FONDO = 0.3;
  const POS_MEDIO_FONDO_2_X = 0, POS_MEDIO_FONDO_2_Z = 180;

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

  const MOSTRAR_COORDENADAS = false;
  const MARCADORES_DEBUG = false;

  // ---- Entrada principal ----
  const RUTA_ENTRADA = './ENTRADA.glb';
  const TAMANO_ENTRADA = 60;
  const POS_ENTRADA_X = 10, POS_ENTRADA_Z = -2;
  const GIRO_ENTRADA = Math.PI;

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
      imagen: { src: 'imagenes/fundacion.jpg', pie: 'Cooperativa Siglo XX Catavi' },
      texto: ['**Cooperativa Minera Multiactiva Catavi Siglo XX R.L.** fue fundada el **3 de mayo de 1994** en Llallagua, Potosí, Bolivia.'],
      datos: [{ n: '1994', t: 'año de fundación' }, { n: 'N° 04665', t: 'personería jurídica' }],
      fuentes: [
        { t: 'Letrero oficial de la cooperativa en su entrada: «Fundado 3-5-94 · P.J. 04665»' }
      ] },

    { x: 9, z: 28, titulo: 'Un gigante del estaño', etiqueta: 'Historia',
      imagen: { src: 'imagenes/gigante-estano.jpg', pie: 'Mina Siglo XX · foto de archivo' },
      texto: ['El complejo **Catavi–Siglo XX** llegó a ser el mayor de la Corporación Minera de Bolivia, con unos **5.000 trabajadores**.',
              'En Llallagua nació el **sindicalismo minero** y se organizó la **primera industria moderna de Bolivia**.'],
      datos: [{ n: '5.000', t: 'trabajadores en el complejo' }, { n: '31 oct 1952', t: 'se nacionalizan las minas' }],
      fuentes: [
        { t: 'Catavi mine · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_mine' },
        { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' },
        { t: 'Decreto de nacionalización del 31 de octubre de 1952 · Foreign Relations of the United States (Departamento de Estado de EE. UU.)', u: 'https://history.state.gov/historicaldocuments/frus1952-54v04/d145' }
      ] },

    { x: -9, z: 42, titulo: 'El Tío de la mina', etiqueta: 'Tradición',
      imagen: { src: 'imagenes/tio-mina.jpg', pie: 'El Tío en una bocamina · actual' },
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

    const grupo2 = grupo.clone(true);
    grupo2.position.set(POS_MEDIO_FONDO_2_X, 0, POS_MEDIO_FONDO_2_Z);

    scene.add(grupo2);

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
  function cargarVehiculo(ruta, tamano, x, z, giro, bajar) {
    cargarModelo(ruta).then(function (obj) {
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

  // ================== PUNTOS DE INFORMACIÓN: ESTILOS ==================
  const estilo = document.createElement('style');

  estilo.textContent = `
    #info-prompt{position:fixed;left:50%;bottom:64px;transform:translateX(-50%) translateY(8px);z-index:9;opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease}
    #info-prompt.show{opacity:1;pointer-events:auto;transform:translateX(-50%)}
    #info-prompt button{display:flex;align-items:center;gap:10px;font:500 15px Oswald,'Arial Narrow',sans-serif;letter-spacing:.5px;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 24px 10px 10px;cursor:pointer}
    #info-prompt .tecla{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:6px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.3);font:500 14px Oswald,'Arial Narrow',sans-serif;letter-spacing:0}
    #info-prompt button:hover{background:rgba(0,0,0,.7)}

    #info-card{position:fixed;right:24px;bottom:24px;width:min(360px,calc(100vw - 48px));z-index:9;color:#fff;opacity:0;pointer-events:none;transform-origin:right center;transform-style:preserve-3d;transform:perspective(900px) translateY(16px) rotateY(-16deg) scale(.96);transition:opacity .3s ease,transform .5s cubic-bezier(.2,.8,.2,1)}
    #info-card.show{opacity:1;pointer-events:auto;transform:perspective(900px) rotateX(0deg) rotateY(-7deg)}
    #info-card::before{content:'';position:absolute;inset:0;border-radius:18px;background:rgba(4,7,12,.75);filter:blur(2px);transform:translateZ(-18px) translate(8px,10px);pointer-events:none}
    #info-card .cara{position:relative;max-height:calc(100vh - 48px);overflow-y:auto;border-radius:18px;background:linear-gradient(160deg,rgba(34,42,60,.68),rgba(10,14,24,.72));-webkit-backdrop-filter:blur(16px) saturate(1.3);backdrop-filter:blur(16px) saturate(1.3);border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 28px 60px rgba(0,0,0,.5),0 8px 20px rgba(0,0,0,.35);scrollbar-width:thin}
    #info-card figure{position:relative;margin:0;height:150px;background:#10151f}
    #info-card figure img{width:100%;height:100%;object-fit:cover;display:block}
    #info-card figure::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,18,28,0) 45%,rgba(14,18,28,.9) 100%)}
    #info-card figcaption{position:absolute;left:20px;bottom:10px;z-index:1;font:700 11px Lato,'Segoe UI',Arial,sans-serif;letter-spacing:.3px;color:rgba(255,255,255,.85)}
    #info-card .cuerpo{padding:14px 20px 18px}
    #info-card.sin-img .cuerpo{padding-top:22px}
    #info-card .cab{display:flex;align-items:center;gap:8px;margin-bottom:8px;font:500 12px Oswald,'Arial Narrow',sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#7cc8ff}
    #info-card .cab::before{content:'';width:18px;height:2px;border-radius:2px;background:#7cc8ff}
    #info-card .cab .n{margin-left:auto;color:rgba(255,255,255,.5);letter-spacing:1px}
    #info-card h3{font:500 24px/1.1 Oswald,'Arial Narrow',sans-serif;letter-spacing:.4px;margin:0 0 10px}
    #info-card p{font:15px/1.6 Lato,'Segoe UI',Arial,sans-serif;color:rgba(255,255,255,.88);margin:0 0 10px}
    #info-card p strong{color:#fff;font-weight:700;box-shadow:inset 0 -.4em 0 rgba(124,200,255,.28)}
    #info-card .datos{display:flex;margin:14px 0 4px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)}
    #info-card .dato{flex:1;padding:0 12px}
    #info-card .dato:first-child{padding-left:0}
    #info-card .dato + .dato{border-left:1px solid rgba(255,255,255,.12)}
    #info-card .dato b{display:block;font:500 22px/1 Oswald,'Arial Narrow',sans-serif;color:#7cc8ff;margin-bottom:5px}
    #info-card .dato span{font:12px/1.35 Lato,'Segoe UI',Arial,sans-serif;color:rgba(255,255,255,.72)}
    #info-card a{display:inline-block;margin-top:8px;font:500 14px Oswald,'Arial Narrow',sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:8px 20px}
    #info-card a:hover{background:rgba(255,255,255,.2)}

    #info-card .pie{display:flex;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)}
    #info-card .btn-fuente{display:inline-flex;align-items:center;gap:7px;padding:5px 12px 5px 12px;font:500 12px Oswald,'Arial Narrow',sans-serif;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:999px;cursor:pointer}
    #info-card .btn-fuente:hover{background:rgba(255,255,255,.16)}
    #info-card .btn-fuente::after{content:'';width:6px;height:6px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);transition:transform .2s}
    #info-card .btn-fuente.abierto::after{transform:rotate(-135deg) translateY(-1px)}
    #info-card .fuentes{display:none;margin:10px 0 0;padding:0;list-style:none}
    #info-card .fuentes.abierto{display:block}
    #info-card .fuentes li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);font:13px/1.35 Lato,'Segoe UI',Arial,sans-serif;color:rgba(255,255,255,.85)}
    #info-card .fuentes li:last-child{border-bottom:0;padding-bottom:0}
    #info-card .fuentes a{display:block;margin:0;padding:0;font:700 13px/1.35 Lato,'Segoe UI',Arial,sans-serif;letter-spacing:0;text-transform:none;color:#9fd3ff;background:none;border:0;border-radius:0;text-decoration:underline;text-underline-offset:2px}
    #info-card .fuentes a:hover{background:none;color:#fff}
    #info-card .fuentes small{display:block;margin-top:2px;font:11px Lato,'Segoe UI',Arial,sans-serif;color:rgba(255,255,255,.55)}

    #info-card .x{position:absolute;top:10px;right:10px;z-index:2;width:30px;height:30px;padding:0;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);border-radius:50%;color:#fff;font-size:18px;line-height:1;cursor:pointer;transform:translateZ(26px)}
    #info-card .x:hover{background:rgba(0,0,0,.8)}
    @media(max-width:640px){
      #info-card{left:12px;right:12px;bottom:12px;width:auto;transform-origin:center;transform:translateY(14px)}
      #info-card.show{transform:none}
      #info-card figure{height:120px}
    }`;

  document.head.appendChild(estilo);

  const avisoEl = document.createElement('div');
  avisoEl.id = 'info-prompt';
  avisoEl.innerHTML = '<button type="button"><span class="tecla">E</span><span>Presiona E para ver información</span></button>';
  document.body.appendChild(avisoEl);

  const tarjetaEl = document.createElement('div');
  tarjetaEl.id = 'info-card';
  document.body.appendChild(tarjetaEl);

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

  function cerrarInfo() {
    abierto = null;
    tarjetaEl.classList.remove('show');
  }

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
    abierto = p;
    tarjetaEl.innerHTML = '';

    const d = p.d;

    const mk = (tag, cls, txt) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (txt) e.textContent = txt;
      return e;
    };

    tarjetaEl.classList.toggle('sin-img', !d.imagen);

    const cara = mk('div', 'cara');

    if (d.imagen) {
      const fig = mk('figure');
      const img = document.createElement('img');

      img.alt = d.imagen.pie || d.titulo;
      img.decoding = 'async';

      img.addEventListener('error', function () {
        fig.remove();
        tarjetaEl.classList.add('sin-img');
      });

      img.src = d.imagen.src;
      fig.appendChild(img);

      if (d.imagen.pie) {
        fig.appendChild(mk('figcaption', '', d.imagen.pie));
      }

      cara.appendChild(fig);
    }

    const cuerpo = mk('div', 'cuerpo');

    const cab = mk('div', 'cab');
    cab.appendChild(mk('span', '', d.etiqueta || 'Dato curioso'));
    cab.appendChild(mk(
      'span',
      'n',
      String(p.i + 1).padStart(2, '0') + ' / ' +
      String(puntos.length).padStart(2, '0')
    ));

    cuerpo.appendChild(cab);
    cuerpo.appendChild(mk('h3', '', d.titulo));

    d.texto.forEach(function (t) {
      const par = mk('p');
      conResaltado(par, t);
      cuerpo.appendChild(par);
    });

    if (d.datos && d.datos.length) {
      const fila = mk('div', 'datos');

      d.datos.slice(0, 3).forEach(function (x) {
        const c = mk('div', 'dato');
        c.appendChild(mk('b', '', x.n));
        c.appendChild(mk('span', '', x.t));
        fila.appendChild(c);
      });

      cuerpo.appendChild(fila);
    }

    if (d.enlace) {
      const a = mk('a', '', d.enlace.texto + ' →');
      a.href = d.enlace.url;
      cuerpo.appendChild(a);
    }

    if (d.fuentes && d.fuentes.length) {
      const pie = mk('div', 'pie');
      const btn = mk('button', 'btn-fuente', 'Fuente');

      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');

      const lista = mk('ul', 'fuentes');

      d.fuentes.forEach(function (f) {
        const li = mk('li');

        if (f.u) {
          const a = mk('a', '', f.t);
          a.href = f.u;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          li.appendChild(a);

          try {
            li.appendChild(mk(
              'small',
              '',
              new URL(f.u).hostname.replace(/^www\./, '')
            ));
          } catch (e) {
            // Sin dominio
          }
        } else {
          li.textContent = f.t;
        }

        lista.appendChild(li);
      });

      btn.addEventListener('click', function () {
        const abierto = lista.classList.toggle('abierto');
        btn.classList.toggle('abierto', abierto);
        btn.setAttribute('aria-expanded', String(abierto));
      });

      pie.appendChild(btn);
      cuerpo.appendChild(pie);
      cuerpo.appendChild(lista);
    }

    const cerrar = mk('button', 'x', '×');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', 'Cerrar información');

    cerrar.addEventListener('click', cerrarInfo);

    cara.appendChild(cerrar);
    cara.appendChild(cuerpo);
    tarjetaEl.appendChild(cara);

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
    const origen = new THREE.Vector3(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );

    const direccion = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion);

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