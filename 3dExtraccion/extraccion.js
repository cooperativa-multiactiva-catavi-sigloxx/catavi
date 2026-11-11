/* =====================================================================
   extraccion.js — "Del mineral al estaño": recorrido caminable por la planta.
   Una estación por cada paso del proceso, unidas por un camino amarillo.
   Cada estación tiene un aro punteado (como el mundo principal): al acercarte
   aparece "Presiona F" y se abre una tarjeta con un dato curioso y su fuente.
   La tarjeta tiene botón "Ver video" (abre una TV retro) y botón "Fuente" (texto).
   ===================================================================== */
window.addEventListener('load', function () {
    'use strict';
    document.getElementById('loading').style.display = 'none';

    // ================== AJUSTES ==================
    const ALTURA_OJOS = 8;           // altura de la cámara
    const VELOCIDAD = 15;            // velocidad al caminar (unidades por segundo)
    const GIRO_TECLAS = 2.4;         // velocidad de giro con Q / E (radianes por segundo)
    const USAR_LINTERNA = true;      // luz del casco pegada a la cámara (tecla L)
    const RADIO_INFO = 6;            // a qué distancia del aro aparece "Presiona F"
    const POLVO = 320;               // partículas de polvo en el aire (0 = sin polvo)

    // Marcadores (aros punteados que laten, igual que en el mundo principal)
    const ALTURA_MARCADOR = 1.4;
    const RADIO_ANILLO = 0.75;
    const PUNTOS_POR_ANILLO = 32;
    const VELOCIDAD_LATIDO = 2.2;
    const AMPLITUD_LATIDO = 0.2;

    // Camino amarillo
    const ANCHO_CAMINO = 2.4;
    const VELOCIDAD_CAMINO = 0.35;   // qué tan rápido avanzan las flechas

    // Sala (la planta es una nave de 100 x 80)
    const SALA = { x: 50, zMin: -40, zMax: 40, alto: 18 };

    // ================== UTILIDADES ==================
    function seededRandom(seed) {
        let s = seed;
        return function () {
            s = (s * 1664525 + 1013904223) % 4294967296;
            return s / 4294967296;
        };
    }

    // Textura procedural: fondo + manchas + rayones (para que nada se vea liso)
    function makeSpeckleTexture(size, baseColor, speckleColors, speckleCount, opts) {
        opts = opts || {};
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < speckleCount; i++) {
            ctx.fillStyle = speckleColors[Math.floor(Math.random() * speckleColors.length)];
            const s = (opts.minSize || 1) + Math.random() * ((opts.maxSize || 4) - (opts.minSize || 1));
            ctx.globalAlpha = (opts.minAlpha || 0.08) + Math.random() * ((opts.maxAlpha || 0.3) - (opts.minAlpha || 0.08));
            ctx.fillRect(Math.random() * size, Math.random() * size, s, s);
        }
        ctx.globalAlpha = 1;
        if (opts.scratches) {
            ctx.strokeStyle = opts.scratchColor || 'rgba(0,0,0,0.12)';
            for (let k = 0; k < opts.scratches; k++) {
                ctx.lineWidth = 0.5 + Math.random();
                ctx.beginPath();
                const sx = Math.random() * size, sy = Math.random() * size;
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + (Math.random() - 0.5) * size * 0.4, sy + (Math.random() - 0.5) * size * 0.4);
                ctx.stroke();
            }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }

    // ================== ESCENA ==================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0806);
    scene.fog = new THREE.Fog(0x0b0806, 25, 95);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
    scene.add(camera);   // en la escena para que la linterna (hija de la cámara) funcione

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = false;   // las sombras en tiempo real son muy caras
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Luces: pocas a propósito (cada luz real encarece TODOS los materiales).
    // El "brillo" de las lámparas es falso (sprites y manchas aditivas), sin costo de luz.
    scene.add(new THREE.AmbientLight(0x9a8468, 1.35));
    const luzGeneral = new THREE.DirectionalLight(0xffe0b0, 0.8);
    luzGeneral.position.set(-10, 25, 15);
    scene.add(luzGeneral);

    let linterna = null;
    if (USAR_LINTERNA) {
        linterna = new THREE.SpotLight(0xffe6b0, 1.5, 48, Math.PI / 5, 0.6, 1);
        linterna.position.set(0, 0, 0);
        linterna.target.position.set(0, 0, -1);
        camera.add(linterna);
        camera.add(linterna.target);
    }

    // ================== SALA: PISO, PAREDES DE ROCA, TECHO ==================
    const texPiso = makeSpeckleTexture(512, '#1b1510', ['#241c15', '#120d09', '#2c2219', '#1f1812'], 1400,
        { minSize: 1, maxSize: 5, minAlpha: 0.05, maxAlpha: 0.25, scratches: 30, scratchColor: 'rgba(255,180,80,0.04)' });
    texPiso.repeat.set(14, 11);
    const piso = new THREE.Mesh(
        new THREE.PlaneGeometry(SALA.x * 2, SALA.zMax - SALA.zMin),
        new THREE.MeshLambertMaterial({ map: texPiso, color: 0xb0a090 })
    );
    piso.rotation.x = -Math.PI / 2;
    scene.add(piso);

    // Textura de tierra (imagenes/tierra.jpeg). Mientras carga, se ve la textura procedural de arriba.
    new THREE.TextureLoader().load(
        'imagenes/tierra.jpeg',
        function (t) {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(12, 10);        // cuántas veces se repite en el piso (más número = tierra más fina)
            t.anisotropy = 4;
            piso.material.map = t;
            piso.material.color.set(0xd8c8b8);
            piso.material.needsUpdate = true;
        },
        undefined,
        function () { console.warn('No se encontró imagenes/tierra.jpeg: se queda la textura procedural.'); }
    );

    function texRoca(rx, ry) {
        const t = makeSpeckleTexture(256, '#4b4036', ['#3a3029', '#5e5145', '#2a231e', '#6b5a48'], 700,
            { minSize: 1, maxSize: 6, minAlpha: 0.1, maxAlpha: 0.35, scratches: 25, scratchColor: 'rgba(0,0,0,.25)' });
        t.repeat.set(rx, ry);
        return t;
    }
    const matParedLarga = new THREE.MeshLambertMaterial({ map: texRoca(10, 2.5), color: 0xa89a8a });
    const matParedCorta = new THREE.MeshLambertMaterial({ map: texRoca(12, 2.5), color: 0xa89a8a });
    const largoZ = SALA.zMax - SALA.zMin;

    [-1, 1].forEach(function (lado) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(2, SALA.alto, largoZ + 4), matParedLarga);
        p.position.set(lado * (SALA.x + 1), SALA.alto / 2, 0);
        scene.add(p);
    });
    [SALA.zMin - 1, SALA.zMax + 1].forEach(function (z) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(SALA.x * 2 + 4, SALA.alto, 2), matParedCorta);
        p.position.set(0, SALA.alto / 2, z);
        scene.add(p);
    });

    const texTecho = texRoca(10, 8);
    const techo = new THREE.Mesh(
        new THREE.PlaneGeometry(SALA.x * 2 + 4, largoZ + 4),
        new THREE.MeshLambertMaterial({ map: texTecho, color: 0x6b5e52 })
    );
    techo.rotation.x = Math.PI / 2;
    techo.position.y = SALA.alto;
    scene.add(techo);

    // Vigas de madera (techo) y postes (paredes): un solo InstancedMesh cada uno
    const texMadera = makeSpeckleTexture(128, '#5a3d22', ['#47301a', '#6d4a2a', '#3a2814'], 200,
        { minSize: 1, maxSize: 3, minAlpha: 0.1, maxAlpha: 0.3, scratches: 30, scratchColor: 'rgba(0,0,0,.25)' });
    const matMadera = new THREE.MeshLambertMaterial({ map: texMadera, color: 0xc0a080 });
    const aux = new THREE.Object3D();

    const NUM_VIGAS = 8;
    const vigas = new THREE.InstancedMesh(new THREE.BoxGeometry(SALA.x * 2, 0.7, 0.7), matMadera, NUM_VIGAS);
    for (let i = 0; i < NUM_VIGAS; i++) {
        aux.position.set(0, SALA.alto - 0.8, SALA.zMin + 4 + i * ((largoZ - 8) / (NUM_VIGAS - 1)));
        aux.updateMatrix();
        vigas.setMatrixAt(i, aux.matrix);
    }
    scene.add(vigas);

    const postes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, SALA.alto - 1, 0.8), matMadera, NUM_VIGAS * 2);
    let pi = 0;
    [-1, 1].forEach(function (lado) {
        for (let i = 0; i < NUM_VIGAS; i++) {
            aux.position.set(lado * (SALA.x - 1.5), (SALA.alto - 1) / 2, SALA.zMin + 4 + i * ((largoZ - 8) / (NUM_VIGAS - 1)));
            aux.updateMatrix();
            postes.setMatrixAt(pi++, aux.matrix);
        }
    });
    scene.add(postes);

    // Montones de mineral junto a las paredes
    const rndPilas = seededRandom(77);
    const NUM_PILAS = 14;
    const matPila = new THREE.MeshLambertMaterial({
        map: makeSpeckleTexture(128, '#5a5048', ['#3f372f', '#6e6358', '#2c2620'], 260, { minSize: 1, maxSize: 4, minAlpha: 0.15, maxAlpha: 0.35 }),
        color: 0xb5a595
    });
    const pilas = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), matPila, NUM_PILAS);
    for (let i = 0; i < NUM_PILAS; i++) {
        const lado = i % 2 ? 1 : -1;
        const r = 1.6 + rndPilas() * 2.2;
        aux.position.set(lado * (SALA.x - 4 - rndPilas() * 5), r * 0.4, SALA.zMin + 4 + rndPilas() * (largoZ - 8));
        aux.rotation.set(0, rndPilas() * Math.PI, 0);
        aux.scale.set(r, r * 0.8, r);
        aux.updateMatrix();
        pilas.setMatrixAt(i, aux.matrix);
    }
    aux.rotation.set(0, 0, 0);
    aux.scale.set(1, 1, 1);
    scene.add(pilas);

    // ================== ESTACIONES (en serpentina: el camino nunca se cruza) ==================
    // Fila de adelante (1→3, de izquierda a derecha) y fila de atrás (4→6, de derecha a izquierda)
    // modelPath: archivo .glb de cada estación (cámbialo si quieres otro modelo en alguna)
    // video: archivo de video de la estación (las estaciones 5 y 6 no tienen, así que no muestran el botón)
    const estaciones = [
        { id: 'transporte', nombre: '1. TRANSPORTE', descripcion: 'Lleva el material desde la mina y los desmontes hasta la planta',
          pos: { x: -20, z: 10 }, color: 0xffc857, modelPath: 'alimentacion.glb', video: 'videos/transporte.mp4',
          info: {
              etiqueta: 'Dato curioso', titulo: 'El material viaja hasta la planta',
              imagen: { src: 'imagenes/transporte.png', pie: 'Transporte · planta actual' },
              texto: ['Antes de procesarlo hay que **llevar el material hasta la planta**. En Catavi no solo llega mineral de la mina: gran parte de lo que se trata son **colas, arenas y desmontes** acumulados durante más de un siglo.',
                      'En las cooperativas mineras bolivianas, el mineral acumulado se traslada normalmente en **volquetas**.'],
              datos: [{ n: '250 t', t: 'de colas retratadas por día en la Planta C-4' }, { n: '20,7 millones t', t: 'de colas con ≈ 0,3 % de estaño (estimado)' }],
              fuentes: [
                  { t: 'Retratamiento de colas finales planta C-4 de la mina de Catavi · Revista de Medio Ambiente y Minería (SciELO Bolivia)', u: 'http://www.scielo.org.bo/scielo.php?script=sci_arttext&pid=S2519-53522016000100002' },
                  { t: 'Sendrós: Caracterización física y mineralógica de las colas de Llallagua · Universitat Politècnica de Catalunya', u: 'https://upcommons.upc.edu/server/api/core/bitstreams/4bf61504-8f97-4217-8b7f-2fef677b2d8b/content' },
                  { t: 'Cooperativas mineras en Bolivia · CEDIB', u: 'https://www.cedib.org/wp-content/uploads/2014/04/Cooperativas-MinerasBR.pdf' }
              ] } },

        { id: 'trituracion', nombre: '2. TRITURACIÓN', descripcion: 'Reduce el tamaño del material para liberar el estaño',
          pos: { x: 0, z: 10 }, color: 0xff9f43, modelPath: 'molienda.glb', video: ['videos/trituracion1.mp4', 'videos/trituracion2.mp4'],
          info: {
              etiqueta: 'Dato curioso', titulo: 'Moler no siempre libera todo el estaño',
              imagen: { src: 'imagenes/trituracion.jpg', pie: 'Trituración · planta actual' },
              texto: ['Los desmontes traen rocas de **4 a 15 cm**. Para separar la casiterita hay que **reducir su tamaño**.',
                      'En la planta, la molienda es muy limitada: a la salida del molino el material es apenas menor que el de entrada, con un tamaño medio de **0,5 mm**. La casiterita se libera hacia las **150 µm**, por eso parte del estaño sale en las colas.'],
              datos: [{ n: '4–15 cm', t: 'tamaño de las rocas de desmonte' }, { n: '0,5 mm', t: 'tamaño medio tras el molino' }, { n: '≈ 150 µm', t: 'tamaño de liberación de la casiterita' }],
              fuentes: [
                  { t: 'Sendrós: Caracterización física y mineralógica de las colas de Llallagua · Universitat Politècnica de Catalunya', u: 'https://upcommons.upc.edu/server/api/core/bitstreams/4bf61504-8f97-4217-8b7f-2fef677b2d8b/content' }
              ] } },

        { id: 'clasificacion', nombre: '3. CLASIFICACIÓN', descripcion: 'Separa finos (que siguen adelante) de gruesos (que vuelven al molino)',
          pos: { x: 20, z: 10 }, color: 0xf2d16b, modelPath: 'filtro.glb', video: 'videos/clasificacion.mp4',
          info: {
              etiqueta: 'Dato curioso', titulo: 'Un remolino que separa por tamaño',
              imagen: { src: 'imagenes/clasificacion.jpg', pie: 'Clasificación · planta actual' },
              texto: ['En un equipo como el **hidrociclón** la pulpa gira como un torbellino: la fuerza centrífuga lanza los granos **gruesos** hacia afuera y los **finos** salen por arriba.',
                      'Los gruesos **vuelven al molino**, así el mineral se muele hasta quedar del tamaño justo.'],
              datos: [{ n: '10–300 µm', t: 'tamaños que clasifica en circuitos de molienda' }],
              fuentes: [
                  { t: 'Hidrociclones · ERAL, equipos y procesos (Construnews)', u: 'https://construnews.com/archivos/27766/hidrociclones.pdf' },
                  { t: 'Unidad IV: Hidrociclones · Colegio del Prado, Tratamiento de Minerales I', u: 'https://storage.e-nodos.com.ar/generico/2023-12/808714_UNIDAD_IV_Hidrociclones.pdf' }
              ] } },

        { id: 'recuperacion', nombre: '4. RECUPERACIÓN', descripcion: 'Recupera la casiterita pesada separándola de la ganga',
          pos: { x: 20, z: -24 }, color: 0xeeeeee, modelPath: 'mesas.glb', video: 'videos/recuperacion.mp4',
          info: {
              etiqueta: 'Dato curioso', titulo: 'Mesas que separan por peso',
              imagen: { src: 'imagenes/recuperacion.jpg', pie: 'Mesas concentradoras · planta actual' },
              texto: ['En la Planta C-4, la cooperativa recupera la casiterita con un **proceso gravimétrico en mesas vibrantes**: el agua y la sacudida arrastran lo liviano y el estaño, más pesado, se queda.',
                      'El material pasa por **mesas de sacudidas en tres niveles** hasta obtener el concentrado.'],
              datos: [{ n: '6,8–7,1', t: 'g/cm³: densidad de la casiterita' }, { n: '≈ 2,6', t: 'g/cm³: densidad del cuarzo, la ganga más común' }, { n: '47–51 %', t: 'de estaño en el concentrado comercial' }],
              fuentes: [
                  { t: 'Sendrós: Caracterización física y mineralógica de las colas de Llallagua · Universitat Politècnica de Catalunya', u: 'https://upcommons.upc.edu/server/api/core/bitstreams/4bf61504-8f97-4217-8b7f-2fef677b2d8b/content' },
                  { t: 'Retratamiento de colas finales planta C-4 de la mina de Catavi · Revista de Medio Ambiente y Minería (SciELO Bolivia)', u: 'http://www.scielo.org.bo/scielo.php?script=sci_arttext&pid=S2519-53522016000100002' },
                  { t: 'Cooperativa de Catavi arrendó planta de procesamiento de minerales de COMIBOL · ANF', u: 'https://www.noticiasfides.com/nacional/sociedad/procesamiento-de-minerales-de-comibol-273375' }
              ] } },

        // Secado: SIN modelo (modelPath: null). En su lugar se dibujan yutes en el piso (bloque 5).
        { id: 'secado', nombre: '5. SECADO', descripcion: 'El concentrado se extiende sobre yutes para secarse con el calor',
          pos: { x: 0, z: -24 }, color: 0x7fd1e6, modelPath: null, sinPlataforma: true, video: null,
          info: {
              etiqueta: 'Así lo hace la cooperativa', titulo: 'Se seca con el calor del sol',
              imagen: { src: 'imagenes/secado.jpeg', pie: 'Secado del concentrado · planta actual' },
              texto: ['Al salir de las mesas, el concentrado está **mojado**. Se lleva al lugar de secado y se **esparce sobre el piso, encima de grandes yutes**.',
                      'Ahí se deja **secar con el calor** hasta que está listo para el ensacado. Es un secado **natural**, sin combustible.'],
              fuentes: [
                  { t: 'Proceso de secado descrito por la propia cooperativa Catavi Siglo XX' }
              ] } },

        { id: 'ensacado', nombre: '6. ENSACADO', descripcion: 'Los trabajadores envasan en sacos el concentrado ya seco',
          pos: { x: -20, z: -24 }, color: 0xf4a261, modelPath: 'almacenamiento.glb', video: null,
          info: {
              etiqueta: 'Así lo hace la cooperativa', titulo: 'Del piso al saco',
              imagen: { src: 'imagenes/envolsado.jpeg', pie: 'Ensacado del concentrado · planta actual' },
              texto: ['Cuando el concentrado ya está **seco**, los trabajadores lo **envasan en sacos** para guardarlo y transportarlo.',
                      'En las cooperativas mineras la comercialización se hace por **sacos o volquetas**: los socios piden a la cooperativa una orden, la **tornaguía**, donde declaran cuántos van a vender.'],
              datos: [{ n: '≈ 1 t', t: 'de concentrado al día en la Planta C-4' }],
              fuentes: [
                  { t: 'Proceso de ensacado descrito por la propia cooperativa Catavi Siglo XX' },
                  { t: 'Cooperativas mineras en Bolivia (comercialización por sacos o volquetas) · CEDIB', u: 'https://www.cedib.org/wp-content/uploads/2014/04/Cooperativas-MinerasBR.pdf' },
                  { t: 'Retratamiento de colas finales planta C-4 de la mina de Catavi · Revista de Medio Ambiente y Minería (SciELO Bolivia)', u: 'http://www.scielo.org.bo/scielo.php?script=sci_arttext&pid=S2519-53522016000100002' }
              ] } }
    ];

    const INICIO = { x: -20, z: 28 };      // aquí aparece el visitante, mirando hacia la estación 1
    camera.position.set(INICIO.x, ALTURA_OJOS, INICIO.z);

    // ================== CAMINO AMARILLO (una sola malla con flechas que avanzan) ==================
    const rutaPuntos = [{ x: INICIO.x, z: INICIO.z + 4 }].concat(estaciones.map(function (e) { return e.pos; }));

    const cvCamino = document.createElement('canvas');
    cvCamino.width = 128;
    cvCamino.height = 256;
    (function () {
        const c = cvCamino.getContext('2d');
        c.clearRect(0, 0, 128, 256);
        c.fillStyle = 'rgba(255,179,71,0.12)';
        c.fillRect(0, 0, 128, 256);
        c.fillStyle = 'rgba(255,200,80,0.8)';
        c.fillRect(4, 0, 5, 256);
        c.fillRect(119, 0, 5, 256);
        c.fillStyle = '#ffb347';
        c.beginPath();                      // flecha (chevron) que apunta hacia +v = sentido del recorrido
        c.moveTo(64, 40);
        c.lineTo(112, 112);
        c.lineTo(88, 112);
        c.lineTo(64, 76);
        c.lineTo(40, 112);
        c.lineTo(16, 112);
        c.closePath();
        c.fill();
    })();
    const texCamino = new THREE.CanvasTexture(cvCamino);
    texCamino.wrapS = THREE.RepeatWrapping;
    texCamino.wrapT = THREE.RepeatWrapping;

    (function construirCamino() {
        const pos = [], uv = [], idx = [];
        const tile = ANCHO_CAMINO * 2;
        const ext = ANCHO_CAMINO / 2;
        let acum = 0, n = 0;
        for (let i = 0; i < rutaPuntos.length - 1; i++) {
            const a = rutaPuntos[i], b = rutaPuntos[i + 1];
            const dx = b.x - a.x, dz = b.z - a.z;
            const L = Math.hypot(dx, dz);
            const ux = dx / L, uz = dz / L;
            const px = -uz * ANCHO_CAMINO / 2, pz = ux * ANCHO_CAMINO / 2;
            const e0 = i > 0 ? ext : 0;                       // se alarga en las esquinas para que no queden huecos
            const e1 = i < rutaPuntos.length - 2 ? ext : 0;
            const ax = a.x - ux * e0, az = a.z - uz * e0;
            const bx = b.x + ux * e1, bz = b.z + uz * e1;
            const v0 = (acum - e0) / tile, v1 = (acum + L + e1) / tile;
            const Y = 0.06;
            pos.push(ax + px, Y, az + pz,  ax - px, Y, az - pz,  bx + px, Y, bz + pz,  bx - px, Y, bz - pz);
            uv.push(0, v0,  1, v0,  0, v1,  1, v1);
            idx.push(n, n + 1, n + 2,  n + 1, n + 3, n + 2);
            n += 4;
            acum += L;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
            map: texCamino, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: true
        }));
        m.renderOrder = 2;
        scene.add(m);
    })();

    // ================== LÁMPARAS DE MINA (falsas: brillo y mancha de luz, sin luces reales) ==================
    const texBrillo = (function () {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,225,160,1)');
        g.addColorStop(0.3, 'rgba(255,190,100,.45)');
        g.addColorStop(1, 'rgba(255,170,80,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    })();

    const lamparas = estaciones.map(function (e) { return { x: e.pos.x, z: e.pos.z }; })
        .concat([{ x: INICIO.x, z: 24 }, { x: 20, z: -7 }, { x: 0, z: -7 }, { x: -20, z: -7 }]);

    const LAMP_Y = SALA.alto - 3;
    const bombillos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe3a8 }), lamparas.length);
    const cables = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 4), new THREE.MeshBasicMaterial({ color: 0x15110d }), lamparas.length);
    const matBrilloLamp = new THREE.SpriteMaterial({ map: texBrillo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9, fog: false });
    const matMancha = new THREE.MeshBasicMaterial({ map: texBrillo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55, fog: false });
    const geoMancha = new THREE.CircleGeometry(10, 24);
    lamparas.forEach(function (l, i) {
        aux.position.set(l.x, LAMP_Y, l.z);
        aux.updateMatrix();
        bombillos.setMatrixAt(i, aux.matrix);

        aux.position.set(l.x, (LAMP_Y + SALA.alto) / 2, l.z);
        aux.scale.set(1, SALA.alto - LAMP_Y, 1);
        aux.updateMatrix();
        cables.setMatrixAt(i, aux.matrix);
        aux.scale.set(1, 1, 1);

        const brillo = new THREE.Sprite(matBrilloLamp);
        brillo.scale.set(7, 7, 1);
        brillo.position.set(l.x, LAMP_Y, l.z);
        scene.add(brillo);

        const mancha = new THREE.Mesh(geoMancha, matMancha);
        mancha.rotation.x = -Math.PI / 2;
        mancha.position.set(l.x, 0.04, l.z);
        mancha.renderOrder = 1;
        scene.add(mancha);
    });
    scene.add(bombillos);
    scene.add(cables);

    // ================== LETRERO EN LA PARED DEL FONDO ==================
    (function letrero() {
        const g = new THREE.Group();
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 512;
        const x = c.getContext('2d');
        const fondo = x.createLinearGradient(0, 0, 0, 512);
        fondo.addColorStop(0, '#1d140c');
        fondo.addColorStop(1, '#0f0a06');
        x.fillStyle = fondo;
        x.fillRect(0, 0, 1024, 512);
        x.strokeStyle = '#ffb347';
        x.lineWidth = 10;
        x.strokeRect(18, 18, 988, 476);
        x.textAlign = 'center';
        x.fillStyle = '#ffb347';
        x.font = 'bold 92px Arial';
        x.fillText('PLANTA DE BENEFICIO', 512, 215);
        x.fillStyle = '#ffffff';
        x.font = 'bold 56px Arial';
        x.fillText('DEL MINERAL AL ESTAÑO', 512, 305);
        x.fillStyle = 'rgba(255,255,255,.7)';
        x.font = '34px Arial';
        x.fillText('Cooperativa Siglo XX Catavi', 512, 380);
        x.fillStyle = '#ffb347';
        x.fillRect(260, 410, 504, 6);
        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        const cartel = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: tex }));
        g.add(cartel);
        const marco = new THREE.Mesh(new THREE.BoxGeometry(31, 16, 0.6), matMadera);
        marco.position.z = -0.35;
        g.add(marco);
        g.position.set(0, 9.5, SALA.zMin - 0.05);
        scene.add(g);
    })();

    // ================== PANELES, PLATAFORMAS Y MARCADORES ==================
    // Letrero de cada estación: tablero de mina con franjas de seguridad, número grande y nombre grande.
    // Se dibuja en un canvas de 1024 x 512 (misma proporción que el tablero, así las letras no se deforman).
    const LET_W = 3.6, LET_H = 1.8, LET_Y = 1.7;
    const geoPoste = new THREE.BoxGeometry(0.22, LET_Y + LET_H / 2 - 0.1, 0.22);
    const geoMarcoLet = new THREE.BoxGeometry(LET_W + 0.3, LET_H + 0.3, 0.16);
    const geoTablero = new THREE.PlaneGeometry(LET_W, LET_H);

    function panelDeEstacion(est) {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 512;
        const ctx = c.getContext('2d');
        const col = hex(est.color);
        const numero = est.nombre.split('.')[0];
        const nombre = est.nombre.replace(/^\d+\.\s*/, '');
        const FUENTE = 'Oswald, "Arial Narrow", Impact, sans-serif';

        function franjas(y, h) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, y, 1024, h);
            ctx.clip();
            ctx.fillStyle = '#e8b923';
            ctx.fillRect(0, y, 1024, h);
            ctx.fillStyle = '#17140f';
            for (let x = -h; x < 1024 + h; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, y + h);
                ctx.lineTo(x + h, y);
                ctx.lineTo(x + h + 32, y);
                ctx.lineTo(x + 32, y + h);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }

        function dibujar() {
            // chapa pintada y gastada
            ctx.fillStyle = '#25221d';
            ctx.fillRect(0, 0, 1024, 512);
            for (let i = 0; i < 900; i++) {
                ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
                const t = 1 + Math.random() * 2.5;
                ctx.fillRect(Math.random() * 1024, Math.random() * 512, t, t);
            }
            ctx.strokeStyle = 'rgba(120,60,20,0.14)';       // chorreados de óxido
            for (let i = 0; i < 14; i++) {
                const x = 60 + Math.random() * 900, y = 60 + Math.random() * 300;
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 8, y + 40 + Math.random() * 90);
                ctx.stroke();
            }

            franjas(0, 44);
            franjas(468, 44);

            // tornillos en las esquinas
            ctx.fillStyle = '#8a8378';
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 3;
            [[30, 76], [994, 76], [30, 436], [994, 436]].forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            // círculo con el número del paso
            ctx.fillStyle = col;
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(170, 256, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#14110d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '700 150px ' + FUENTE;
            ctx.fillText(numero, 170, 266);

            // "PASO n DE 6"
            ctx.textAlign = 'left';
            ctx.fillStyle = col;
            ctx.font = '500 44px ' + FUENTE;
            ctx.fillText('PASO ' + numero + ' DE ' + estaciones.length, 310, 188);

            // nombre grande (se achica solo si es muy largo)
            let tam = 135;
            ctx.font = '500 ' + tam + 'px ' + FUENTE;
            while (ctx.measureText(nombre).width > 670 && tam > 50) {
                tam -= 4;
                ctx.font = '500 ' + tam + 'px ' + FUENTE;
            }
            ctx.fillStyle = '#f4efe6';
            ctx.fillText(nombre, 310, 270);

            ctx.fillStyle = col;
            ctx.fillRect(310, 345, 150, 7);
        }

        dibujar();
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        // la tipografía Oswald (de Google Fonts) puede tardar en cargar: se vuelve a dibujar cuando llegue
        if (document.fonts && document.fonts.load) {
            document.fonts.load('500 100px Oswald').then(function () { dibujar(); tex.needsUpdate = true; }).catch(function () {});
        }

        // dos postes de madera, marco y tablero
        [-1, 1].forEach(function (lado) {
            const poste = new THREE.Mesh(geoPoste, matMadera);
            poste.position.set(est.pos.x + lado * (LET_W / 2 - 0.3), (LET_Y + LET_H / 2 - 0.1) / 2, est.pos.z + 5.3);
            scene.add(poste);
        });
        const marco = new THREE.Mesh(geoMarcoLet, matMadera);
        marco.position.set(est.pos.x, LET_Y, est.pos.z + 5.5);
        scene.add(marco);
        const tablero = new THREE.Mesh(geoTablero, new THREE.MeshBasicMaterial({ map: tex }));
        tablero.position.set(est.pos.x, LET_Y, est.pos.z + 5.59);
        scene.add(tablero);
    }

    const loader = new THREE.GLTFLoader();

    const geoPlataforma = new THREE.CylinderGeometry(4, 4, 0.3, 28);
    const geoAro = new THREE.TorusGeometry(4.1, 0.1, 6, 40);

    // --- Aros punteados que laten (los mismos del mundo principal) ---
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
    const texAnillo1 = texAnillo('#ffffff', PUNTOS_POR_ANILLO);
    const texAnillo2 = texAnillo('#ffb347', Math.round(PUNTOS_POR_ANILLO * 0.65));
    const texCentro = (function () {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const x = c.getContext('2d');
        x.fillStyle = '#ffd08a';
        x.beginPath();
        x.arc(32, 32, 26, 0, Math.PI * 2);
        x.fill();
        return new THREE.CanvasTexture(c);
    })();
    const ESCALA_ANILLO = 1 / 0.4375;
    const geoLinea = new THREE.CylinderGeometry(0.025, 0.025, 1, 6, 1, true);
    const matLinea = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });

    function sprite(tex, extra, y) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: tex, transparent: true, depthWrite: false, fog: false }, extra || {})));
        s.position.y = y;
        return s;
    }

    const marcadores = new THREE.Group();
    scene.add(marcadores);

    estaciones.forEach(function (est, i) {
        // plataforma con textura de concreto gastado
        const texPlat = makeSpeckleTexture(256, '#2a2622', ['#34302b', '#1d1a17', '#3b352e', hex(est.color)], 330,
            { minSize: 1, maxSize: 5, minAlpha: 0.05, maxAlpha: 0.18, scratches: 22, scratchColor: 'rgba(0,0,0,0.3)' });
        const plataforma = new THREE.Mesh(geoPlataforma, new THREE.MeshLambertMaterial({
            map: texPlat, color: 0xc8bfb0, emissive: est.color, emissiveIntensity: 0.22
        }));
        plataforma.position.set(est.pos.x, 0.15, est.pos.z);
        scene.add(plataforma);

        // aro amarillo de seguridad
        const aro = new THREE.Mesh(geoAro, new THREE.MeshBasicMaterial({ color: 0xffc400 }));
        aro.rotation.x = Math.PI / 2;
        aro.position.set(est.pos.x, 0.36, est.pos.z);
        scene.add(aro);
        if (est.sinPlataforma) { plataforma.visible = false; aro.visible = false; }

        panelDeEstacion(est);
        cargarModelo(est);

        // marcador de información (en frente de la plataforma)
        const g = new THREE.Group();
        g.position.set(est.pos.x, 0, est.pos.z + 8);
        const halo = sprite(texBrillo, { blending: THREE.AdditiveBlending, opacity: 0.6 }, ALTURA_MARCADOR);
        const a1 = sprite(texAnillo1, null, ALTURA_MARCADOR);
        const a2 = sprite(texAnillo2, null, ALTURA_MARCADOR);
        const centro = sprite(texCentro, null, ALTURA_MARCADOR);
        const altoLinea = ALTURA_MARCADOR - RADIO_ANILLO;
        const linea = new THREE.Mesh(geoLinea, matLinea);
        linea.scale.y = altoLinea;
        linea.position.y = altoLinea / 2;
        g.add(linea, halo, a1, a2, centro);
        marcadores.add(g);

        est.indice = i;
        est.marcador = { g: g, halo: halo, a1: a1, a2: a2, centro: centro };
        est.puntoInfo = { x: est.pos.x, z: est.pos.z + 8 };

        // aura de brillo falso (un solo sprite aditivo: casi no cuesta rendimiento)
        const esSecado = est.id === 'secado';
        const aura = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texBrillo, color: est.color, transparent: true,
            blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4, fog: false
        }));
        aura.scale.set(esSecado ? 22 : 15, esSecado ? 22 : 15, 1);
        aura.position.set(est.pos.x, esSecado ? 3 : 4.5, est.pos.z - 1.5);
        scene.add(aura);
        est.aura = aura;
    });

    // --- Modelos .glb de cada estación (materiales Lambert: mucho más baratos que PBR) ---
    function cargarModelo(est) {
        if (!est.modelPath) return;     // Secado no tiene modelo
        loader.load(
            est.modelPath,
            function (gltf) {
                const modelo = gltf.scene;
                modelo.position.set(est.pos.x, 2.5, est.pos.z);
                modelo.scale.set(5.5, 5.5, 5.5);
                modelo.traverse(function (m) {
                    if (!m.isMesh || !m.material) return;
                    const mats = Array.isArray(m.material) ? m.material : [m.material];
                    const nuevos = mats.map(function (mt) {
                        const col = mt.color ? mt.color.clone() : new THREE.Color(0xffffff);
                        return new THREE.MeshLambertMaterial({
                            map: mt.map || null,
                            color: col,
                            // autoiluminado: con textura usa esa misma textura; sin textura, un poco de su propio color
                            emissive: mt.map ? new THREE.Color(0x666666) : col.clone().multiplyScalar(0.4),
                            emissiveMap: mt.map || null,
                            transparent: mt.transparent,
                            opacity: mt.opacity
                        });
                    });
                    m.material = Array.isArray(m.material) ? nuevos : nuevos[0];
                });
                modelo.userData = { giro: 0.01, flota: 0.5, yBase: 2.5 };
                scene.add(modelo);
                est.model = modelo;
            },
            undefined,
            function (error) {
                console.error('No se pudo cargar el modelo de ' + est.nombre + ' (' + est.modelPath + '):', error);
                const alterno = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0),
                    new THREE.MeshBasicMaterial({ color: est.color, transparent: true, opacity: 0.5, wireframe: true }));
                alterno.position.set(est.pos.x, 2.5, est.pos.z);
                alterno.userData = { giro: 0.02, flota: 0.5, yBase: 2.5 };
                scene.add(alterno);
                est.model = alterno;
            }
        );
    }

    // ================== YUTES EXTENDIDOS (estación de secado, con volumen) ==================
    (function yutesDeSecado() {
        const est = estaciones.filter(function (e) { return e.id === 'secado'; })[0];
        if (!est) return;

        // textura de yute tejido
        const texYute = makeSpeckleTexture(256, '#a28555', ['#8b7043', '#b79b69', '#7a6038'], 900,
            { minSize: 1, maxSize: 3, minAlpha: 0.1, maxAlpha: 0.3 });
        const cy = texYute.image.getContext('2d');
        cy.strokeStyle = 'rgba(60,40,15,0.28)';
        cy.lineWidth = 1;
        for (let i = 0; i < 256; i += 4) {
            cy.beginPath(); cy.moveTo(i, 0); cy.lineTo(i, 256); cy.stroke();
            cy.beginPath(); cy.moveTo(0, i); cy.lineTo(256, i); cy.stroke();
        }
        texYute.repeat.set(3, 2);
        texYute.needsUpdate = true;

        // concentrado esparcido encima (gris oscuro, húmedo-seco)
        const texMineral = makeSpeckleTexture(256, '#4a4038', ['#2e2822', '#5e5347', '#3a322a', '#6d6050'], 1400,
            { minSize: 1, maxSize: 4, minAlpha: 0.1, maxAlpha: 0.35 });
        texMineral.repeat.set(2, 2);

        const matYute = new THREE.MeshLambertMaterial({ map: texYute, color: 0xe0d0b0 });
        const matMineral = new THREE.MeshLambertMaterial({ map: texMineral, color: 0xc8b8a8 });
        const geoYute = new THREE.BoxGeometry(7.6, 0.14, 5.8);          // el yute ahora tiene grosor
        const geoCapa = new THREE.BoxGeometry(6.6, 0.22, 4.9);          // capa de concentrado
        const geoSurco = new THREE.CylinderGeometry(0.26, 0.26, 6.2, 8); // surcos, como si lo hubieran rastrillado
        const geoMonton = new THREE.ConeGeometry(1, 1, 8);

        const rnd = seededRandom(31);
        const lugares = [[-5.6, -4.2], [5.6, -4.2], [-5.6, 4.2], [5.6, 4.2]];   // 4 yutes alrededor de la estación
        lugares.forEach(function (p) {
            const g = new THREE.Group();
            g.position.set(est.pos.x + p[0], 0, est.pos.z + p[1]);
            g.rotation.y = (rnd() - 0.5) * 0.12;

            const yute = new THREE.Mesh(geoYute, matYute);
            yute.position.y = 0.07;
            g.add(yute);

            const capa = new THREE.Mesh(geoCapa, matMineral);
            capa.position.y = 0.25;
            g.add(capa);

            // 4 surcos a lo largo del yute
            [-1.8, -0.6, 0.6, 1.8].forEach(function (z) {
                const surco = new THREE.Mesh(geoSurco, matMineral);
                surco.rotation.z = Math.PI / 2;
                surco.position.set(0, 0.34, z);
                g.add(surco);
            });

            // montones altos de concentrado
            for (let k = 0; k < 3; k++) {
                const r = 0.55 + rnd() * 0.5, h = 0.7 + rnd() * 0.8;
                const m = new THREE.Mesh(geoMonton, matMineral);
                m.scale.set(r, h, r);
                m.position.set((rnd() - 0.5) * 4.6, 0.32 + h / 2, (rnd() - 0.5) * 3.2);
                m.rotation.y = rnd() * Math.PI;
                g.add(m);
            }
            scene.add(g);
        });

        // un rastrillo de madera tirado entre los yutes
        const rastrillo = new THREE.Group();
        const mango = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 6), matMadera);
        mango.rotation.z = Math.PI / 2;
        rastrillo.add(mango);
        const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.5), matMadera);
        cabeza.position.x = 2.1;
        rastrillo.add(cabeza);
        rastrillo.position.set(est.pos.x - 0.5, 0.14, est.pos.z + 0.2);
        rastrillo.rotation.y = 0.5;
        scene.add(rastrillo);
    })();

    // ================== POLVO EN EL AIRE ==================
    let polvo = null, polvoPos = null;
    if (POLVO > 0) {
        const rp = seededRandom(5);
        polvoPos = new Float32Array(POLVO * 3);
        for (let i = 0; i < POLVO; i++) {
            polvoPos[i * 3] = (rp() - 0.5) * SALA.x * 2;
            polvoPos[i * 3 + 1] = 0.5 + rp() * (SALA.alto - 2);
            polvoPos[i * 3 + 2] = SALA.zMin + rp() * largoZ;
        }
        const gp = new THREE.BufferGeometry();
        gp.setAttribute('position', new THREE.BufferAttribute(polvoPos, 3));
        polvo = new THREE.Points(gp, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.14, transparent: true, opacity: 0.45, depthWrite: false }));
        scene.add(polvo);
    }

    // ================== ESTILOS DE LA TARJETA Y DE LA TV (van aquí mismo, no hace falta tocar el CSS) ==================
    const estiloEl = document.createElement('style');
    estiloEl.textContent = [
        /* --- fondo oscuro detrás de la tarjeta --- */
        '#tarjeta-info{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(12,10,9,.62);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s ease}',
        '#tarjeta-info.show{opacity:1;pointer-events:auto}',

        /* --- la tarjeta --- */
        '.tj-carta{position:relative;width:min(900px,95vw);height:min(500px,88vh);border-radius:18px;overflow:hidden;background:#171311;border:1px solid rgba(255,255,255,.12);color:#fff;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 25px 60px rgba(0,0,0,.9),0 0 35px rgba(197,168,128,.25);transform:scale(.88);transition:transform .7s cubic-bezier(.25,1,.5,1)}',
        '#tarjeta-info.show .tj-carta{transform:scale(1)}',
        '.tj-foto{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
        '.tj-velo{position:absolute;inset:0;pointer-events:none;transition:opacity .5s ease;background:linear-gradient(90deg,rgba(0,0,0,.94) 0%,rgba(0,0,0,.78) 38%,rgba(0,0,0,.25) 68%,rgba(0,0,0,.05) 100%),linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 22%)}',
        '.tj-contenido{position:relative;z-index:2;width:100%;height:100%;box-sizing:border-box;padding:22px 30px 26px;display:flex;flex-direction:column;justify-content:space-between;text-align:left}',
        '.tj-arriba{position:relative;z-index:4;display:flex;justify-content:space-between;align-items:center;padding:0 4px}',
        '.tj-tag{font-size:.78rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.8)}',

        /* --- botón "Fuente": solo texto --- */
        '.tj-btn-fuente{background:none;border:none;padding:0;cursor:pointer;font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.06em;color:#c5a880;text-decoration:underline;text-shadow:0 2px 6px rgba(0,0,0,.8)}',
        '.tj-btn-fuente:hover{color:#f3e3c3}',

        /* --- cuerpo --- */
        '.tj-cuerpo{display:flex;flex-direction:column;align-items:center;gap:3px;margin-top:auto;padding-bottom:4px;min-height:0}',
        '.tj-titulo{margin:0;font-size:1.5rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;line-height:1.1;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95)}',
        '.tj-subtitulo{font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;line-height:1.2;color:#f3f0ea;text-shadow:0 3px 10px rgba(0,0,0,.9)}',
        '.tj-linea{width:34px;height:2px;margin:5px auto 4px;border-radius:2px;background:#c5a880;box-shadow:0 0 8px rgba(197,168,128,.7)}',
        '.tj-textos{max-height:185px;overflow-y:auto;padding:0 4px;scrollbar-width:thin;scrollbar-color:rgba(197,168,128,.5) transparent}',
        '.tj-textos p{margin:0 0 8px;font-size:.82rem;font-style:italic;line-height:1.35;color:rgba(255,255,255,.9);text-shadow:0 2px 8px rgba(0,0,0,.9)}',
        '.tj-textos strong{color:#e6cfa5;font-weight:700}',
        '.tj-datos{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;margin:2px 0 10px}',
        '.tj-dato{display:flex;flex-direction:column;align-items:center;max-width:105px}',
        '.tj-dato b{font-size:.95rem;color:#c5a880;text-shadow:0 2px 6px rgba(0,0,0,.9)}',
        '.tj-dato span{font-size:.62rem;line-height:1.2;color:rgba(255,255,255,.8)}',

        /* --- botón central "Ver video" --- */
        '.tj-btn-video{display:inline-flex;align-items:center;gap:6px;padding:7px 18px;border:none;border-radius:9999px;cursor:pointer;background:linear-gradient(135deg,#c5a880 0%,#a48256 100%);color:#110d0c;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 4px 14px rgba(0,0,0,.4),0 0 15px rgba(197,168,128,.3);transition:transform .2s ease}',
        '.tj-btn-video:hover{transform:scale(1.06)}',

        /* --- panel de fuentes (cubre la tarjeta) --- */
        '.tj-fuentes{position:absolute;inset:0;z-index:3;box-sizing:border-box;padding:56px 22px 22px;overflow-y:auto;background:rgba(12,10,9,.97);text-align:left;opacity:0;pointer-events:none;transition:opacity .3s ease}',
        '.tj-fuentes.abierto{opacity:1;pointer-events:auto}',
        '.tj-fuentes h4{margin:0 0 12px;font-size:.78rem;letter-spacing:.3em;text-transform:uppercase;color:#c5a880}',
        '.tj-fuentes ul{margin:0;padding:0;list-style:none}',
        '.tj-fuentes li{margin-bottom:12px;font-size:.78rem;line-height:1.35;color:rgba(255,255,255,.85)}',
        '.tj-fuentes a{color:#e6cfa5;text-decoration:underline}',
        '.tj-fuentes small{display:block;margin-top:2px;font-size:.66rem;color:rgba(255,255,255,.45)}',
        /* --- formato horizontal: el texto va a la izquierda y la foto se ve a la derecha --- */
        '.tj-cuerpo{align-items:flex-start;max-width:48%;text-align:left;padding-bottom:0}',
        '.tj-titulo{font-size:1.9rem}',
        '.tj-subtitulo{font-size:1.1rem}',
        '.tj-linea{margin:8px 0 10px}',
        '.tj-textos{max-height:165px;padding:0 6px 0 0}',
        '.tj-textos p{font-size:.9rem}',
        '.tj-datos{justify-content:flex-start;margin:2px 0 12px}',
        '.tj-dato{align-items:flex-start;text-align:left;max-width:130px}',
        '.tj-dato span{font-size:.68rem}',
        '.tj-btn-video{padding:9px 24px;font-size:.78rem}',
        '.tj-fuentes{padding:60px 36px 26px}',
        '.tj-fuentes li{font-size:.85rem}',

        /* --- la foto ocupa la parte derecha (ahí no tapa a las personas) y al Despejar se agranda a toda la tarjeta --- */
        '.tj-foto{left:auto;right:0;width:64%;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 28%);mask-image:linear-gradient(90deg,transparent 0%,#000 28%);transition:width .6s ease}',
        '.tj-velo{background:linear-gradient(90deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.82) 30%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.06) 68%,rgba(0,0,0,0) 100%),linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,0) 20%)}',
        '.tj-carta.despejado .tj-foto{width:100%;-webkit-mask-image:none;mask-image:none}',

        /* --- botón Despejar: oculta letras y velo para ver bien la foto --- */
        '.tj-der{display:flex;align-items:center;gap:14px}',
        '.tj-btn-despejar{padding:5px 14px;border:1px solid rgba(197,168,128,.75);border-radius:9999px;background:rgba(0,0,0,.4);color:#e6cfa5;font:inherit;font-size:.72rem;font-weight:700;letter-spacing:.08em;cursor:pointer;backdrop-filter:blur(4px)}',
        '.tj-btn-despejar:hover{background:rgba(0,0,0,.7)}',
        '.tj-cuerpo,.tj-tag,.tj-btn-fuente{transition:opacity .4s ease}',
        '.tj-carta.despejado .tj-velo{opacity:0}',
        '.tj-carta.despejado .tj-cuerpo,.tj-carta.despejado .tj-tag,.tj-carta.despejado .tj-btn-fuente{opacity:0;pointer-events:none}',

        '@media (max-width:700px){.tj-cuerpo{max-width:100%}.tj-carta{height:min(560px,88vh)}.tj-velo{background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.2) 25%,rgba(0,0,0,.75) 60%,rgba(0,0,0,.96) 100%)}}',

        '@media (max-width:700px){.tj-foto{width:100%;-webkit-mask-image:none;mask-image:none}}',

        /* --- botón cerrar --- */
        '.tj-x{position:fixed;top:18px;right:22px;z-index:60;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.55);color:#fff;font-size:1.4rem;line-height:1;cursor:pointer}',
        '.tj-x:hover{background:rgba(0,0,0,.8)}',

        /* --- TV retro del video --- */
        '#tv-retro{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);opacity:0;pointer-events:none;transition:opacity .3s ease}',
        '#tv-retro.show{opacity:1;pointer-events:auto}',
        '.tv-caja{width:min(680px,92vw);box-sizing:border-box;padding:1.3rem;background:#2f363a;border:.4rem solid #24231f;border-radius:1rem;display:grid;gap:1rem;box-shadow:0 30px 80px rgba(0,0,0,.9);font-family:system-ui,-apple-system,sans-serif}',
        '.tv-marco{position:relative;padding:1.4rem;border-radius:1rem;background:#24231f}',
        '.tv-marco::after{content:"";position:absolute;inset:1rem 1.4rem;z-index:2;border-radius:2rem/1rem;pointer-events:none;background-image:repeating-linear-gradient(transparent,transparent 5px,rgba(0,0,0,.05) 5px,rgba(0,0,0,.05) 10px);box-shadow:inset 6px 5px 20px 11px rgba(36,35,31,.45)}',
        '.tv-pantalla{position:relative;overflow:hidden;border-radius:2rem/1rem;background:#4e5e55;aspect-ratio:16/9}',
        '.tv-pantalla video{display:block;width:100%;height:100%;object-fit:contain;background:#000}',
        '.tv-error{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:1rem;text-align:center;color:#d9e6dc;font-size:.9rem}',
        '.tv-abajo{display:flex;justify-content:space-between;align-items:center;gap:.75rem}',
        '.tv-parlante{width:6rem;height:2.4rem;background-image:radial-gradient(#000 .1rem,transparent 0);background-size:.5rem .5rem}',
        '.tv-controles{display:flex;align-items:center;gap:.5rem}',
        '.tv-boton{width:1.7rem;height:1.7rem;border-radius:50%;border:1px solid #000;background:none;color:#cfd6d9;font-size:.85rem;line-height:1;cursor:pointer}',
        '.tv-boton:hover{background:rgba(255,255,255,.12)}',
        '.tv-pestanas{display:flex;justify-content:center;gap:.6rem}',
        '.tv-pestana{padding:.3rem 1rem;border:1px solid #000;border-radius:9999px;background:none;color:#cfd6d9;font-size:.78rem;cursor:pointer}',
        '.tv-pestana:hover{background:rgba(255,255,255,.12)}',
        '.tv-pestana.activa{background:#4e5e55;color:#fff}',
        '@media (max-width:520px){.tv-parlante{display:none}}'
    ].join('\n');
    document.head.appendChild(estiloEl);

    // ================== TARJETA DE INFORMACIÓN ==================
    const avisoEl = document.createElement('div');
    avisoEl.id = 'info-prompt';
    avisoEl.innerHTML = '<button type="button"><span class="tecla">F</span><span>Presiona F para ver información</span></button>';
    document.body.appendChild(avisoEl);

    const tarjetaEl = document.createElement('div');
    tarjetaEl.id = 'tarjeta-info';
    document.body.appendChild(tarjetaEl);

    const tvEl = document.createElement('div');
    tvEl.id = 'tv-retro';
    document.body.appendChild(tvEl);

    let cercano = null, abierto = null;
    let videoTV = null;

    function mostrarAviso(v) { avisoEl.classList.toggle('show', !!v); }

    function mk(tag, cls, txt) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt) e.textContent = txt;
        return e;
    }

    // ---- TV retro con el video ----
    function cerrarTV() {
        if (!tvEl.classList.contains('show')) return false;
        if (videoTV) { videoTV.pause(); videoTV.removeAttribute('src'); videoTV.load(); videoTV = null; }
        tvEl.classList.remove('show');
        tvEl.innerHTML = '';
        return true;
    }

    function abrirTV(est) {
        tvEl.innerHTML = '';
        const caja = mk('div', 'tv-caja');
        const marco = mk('div', 'tv-marco');
        const pantalla = mk('div', 'tv-pantalla');

        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        // est.video puede ser un solo video ('a.mp4') o varios (['a.mp4', 'b.mp4'])
        const lista = Array.isArray(est.video) ? est.video : [est.video];
        let actual = 0;
        const pestanas = [];
        const error = mk('div', 'tv-error');
        function cargar(i) {
            actual = i;
            error.style.display = 'none';
            video.style.display = 'block';
            error.textContent = 'No se encontró el video (' + lista[i] + ')';
            video.src = lista[i];
            video.play().catch(function () { /* el navegador pidió un clic: el usuario le da play */ });
            pestanas.forEach(function (p, k) { p.classList.toggle('activa', k === i); });
        }
        video.addEventListener('error', function () { video.style.display = 'none'; error.style.display = 'flex'; });
        video.addEventListener('ended', function () { if (actual < lista.length - 1) cargar(actual + 1); });   // al terminar pasa al siguiente
        pantalla.appendChild(video);
        pantalla.appendChild(error);
        marco.appendChild(pantalla);
        caja.appendChild(marco);

        // si hay más de un video, aparecen los botones "Video 1", "Video 2"...
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

        const abajo = mk('div', 'tv-abajo');
        const boton = function (txt, titulo, accion) {
            const b = mk('button', 'tv-boton', txt);
            b.type = 'button';
            b.title = titulo;
            b.setAttribute('aria-label', titulo);
            b.addEventListener('click', function () { accion(); b.blur(); });
            return b;
        };
        const grupo = function () { return mk('div', 'tv-controles'); };

        const c1 = grupo(), c2 = grupo(), c3 = grupo();
        c1.appendChild(boton('⏻', 'Apagar', cerrarTV));
        c2.appendChild(boton('−', 'Bajar volumen', function () { video.volume = Math.max(0, video.volume - 0.2); }));
        c2.appendChild(boton('+', 'Subir volumen', function () { video.volume = Math.min(1, video.volume + 0.2); }));
        c3.appendChild(boton('‹', 'Retroceder 5 s', function () { video.currentTime = Math.max(0, video.currentTime - 5); }));
        c3.appendChild(boton('›', 'Adelantar 5 s', function () { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }));

        abajo.appendChild(mk('div', 'tv-parlante'));
        abajo.appendChild(c1);
        abajo.appendChild(c2);
        abajo.appendChild(c3);
        abajo.appendChild(mk('div', 'tv-parlante'));
        caja.appendChild(abajo);

        tvEl.appendChild(caja);
        tvEl.addEventListener('click', function (e) { if (e.target === tvEl) cerrarTV(); }, { once: true });
        videoTV = video;
        tvEl.classList.add('show');
    }

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

    function abrirInfo(est) {
        cerrarTV();
        abierto = est;
        tarjetaEl.innerHTML = '';
        const d = est.info;

        const carta = mk('div', 'tj-carta');

        // foto de fondo (si no carga, queda el fondo oscuro)
        if (d.imagen) {
            const img = document.createElement('img');
            img.className = 'tj-foto';
            img.style.objectPosition = d.imagen.foco || '60% 90%';   // qué parte de la foto se queda (x% y%); sube el 2.º número para ver más arriba
            img.alt = d.imagen.pie || d.titulo;
            img.decoding = 'async';
            img.addEventListener('error', function () { img.remove(); });
            img.src = d.imagen.src;
            carta.appendChild(img);
        }
        carta.appendChild(mk('div', 'tj-velo'));

        const contenido = mk('div', 'tj-contenido');

        // arriba: botón Fuente (texto) a la izquierda, etiqueta a la derecha
        const arriba = mk('div', 'tj-arriba');
        const tieneFuentes = d.fuentes && d.fuentes.length;
        const btnFuente = mk('button', 'tj-btn-fuente', 'Fuente');
        btnFuente.type = 'button';
        if (!tieneFuentes) btnFuente.style.visibility = 'hidden';
        arriba.appendChild(btnFuente);
        const der = mk('div', 'tj-der');
        der.appendChild(mk('span', 'tj-tag', (d.etiqueta || 'Dato curioso') + ' · ' + String(est.indice + 1).padStart(2, '0') + '/' + String(estaciones.length).padStart(2, '0')));

        // botón Despejar: esconde las letras para ver bien la foto
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
        contenido.appendChild(arriba);

        // cuerpo
        const cuerpo = mk('div', 'tj-cuerpo');
        cuerpo.appendChild(mk('h2', 'tj-titulo', d.titulo));
        cuerpo.appendChild(mk('span', 'tj-subtitulo', '– ' + est.nombre.replace(/^\d+\.\s*/, '')));
        cuerpo.appendChild(mk('div', 'tj-linea'));

        const textos = mk('div', 'tj-textos');
        d.texto.forEach(function (t) {
            const p = mk('p');
            conResaltado(p, t);
            textos.appendChild(p);
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

        // botón "Ver video" (solo si la estación tiene video)
        if (est.video) {
            const btnVideo = mk('button', 'tj-btn-video', 'Ver video');
            btnVideo.type = 'button';
            btnVideo.addEventListener('click', function () { abrirTV(est); btnVideo.blur(); });
            cuerpo.appendChild(btnVideo);
        }

        contenido.appendChild(cuerpo);
        carta.appendChild(contenido);

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

            // el botón "Fuente" queda por encima del panel para poder cerrarlo
            arriba.classList.add('sobre-panel');
            btnFuente.addEventListener('click', function () {
                const ab = panel.classList.toggle('abierto');
                btnFuente.textContent = ab ? 'Volver' : 'Fuente';
                btnFuente.blur();
            });
        }

        tarjetaEl.appendChild(carta);

        const x = mk('button', 'tj-x', '×');
        x.type = 'button';
        x.setAttribute('aria-label', 'Cerrar');
        x.addEventListener('click', cerrarInfo);
        tarjetaEl.appendChild(x);

        carta.addEventListener('click', function (e) { e.stopPropagation(); });
        tarjetaEl.onclick = cerrarInfo;   // clic en el fondo oscuro cierra

        tarjetaEl.classList.add('show');
        mostrarAviso(false);
    }

    avisoEl.querySelector('button').addEventListener('click', function () { if (cercano) abrirInfo(cercano); });

    // ================== RECORRIDO (puntos numerados arriba) ==================
    const rutaEl = document.getElementById('ruta');
    const botonesRuta = estaciones.map(function (est, i) {
        if (i > 0) {
            const sep = document.createElement('span');
            sep.className = 'sep';
            rutaEl.appendChild(sep);
        }
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = String(i + 1);
        b.title = est.nombre;
        b.addEventListener('click', function () { irA(i); b.blur(); });
        rutaEl.appendChild(b);
        return b;
    });

    // ================== PERSONAJE (el mismo del mundo principal) ==================
    const RUTA_PERSONAJE = '../P CAMINANDO.fbx';   // si copias el archivo a esta carpeta: 'P CAMINANDO.fbx'
    const ALTURA_PERSONAJE = 4.5;                  // tamaño del personaje
    const ORIENTACION = 0;                         // si camina de espaldas: Math.PI
    const VELOCIDAD_ANIMACION = 1, SUAVIZADO_BUCLE = 0.2;
    const GIRO_PERSONAJE = 2.2;                    // velocidad de giro con A / D
    const DIST_CAM = 10;                           // qué tan atrás va la cámara (menor = más cerca)
    const ALTURA_CAM = 6;                          // altura de la cámara

    const jugador = new THREE.Group();
    jugador.position.set(INICIO.x, 0, INICIO.z);
    scene.add(jugador);

    let mixer = null, accionCaminar = null, huesoCadera = null, modeloGrupo = null;
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
        const q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion();
        clip.tracks.forEach(function (t) {
            if (ES_RAIZ_POS.test(t.name)) return;
            const size = t.getValueSize(), v = t.values, tm = t.times, n = tm.length;
            if (n < 3) return;
            const T = tm[n - 1];
            for (let i = 0; i < n; i++) {
                if (tm[i] < T - L) continue;
                const w = (tm[i] - (T - L)) / L;
                const k = w * w * (3 - 2 * w);
                if (size === 4) {
                    q0.fromArray(v, 0); q1.fromArray(v, i * 4); q1.slerp(q0, k); q1.toArray(v, i * 4);
                } else {
                    for (let j = 0; j < size; j++) v[i * size + j] += (v[j] - v[i * size + j]) * k;
                }
            }
        });
    }

    new THREE.FBXLoader().load(
        RUTA_PERSONAJE,
        function (obj) {
            const caja = new THREE.Box3().setFromObject(obj);
            obj.scale.setScalar(ALTURA_PERSONAJE / (caja.max.y - caja.min.y));
            caja.setFromObject(obj);
            obj.position.y -= caja.min.y;
            obj.traverse(function (m) { if (m.isMesh) m.frustumCulled = false; });

            if (obj.animations.length) {
                const clip = obj.animations.find(function (c) { return /walk|camin/i.test(c.name); }) || obj.animations[0];
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
                obj.traverse(function (h) {
                    if (!h.isBone) return;
                    if (!primero) primero = h;
                    if (!huesoCadera && /hips|pelvis/i.test(h.name)) huesoCadera = h;
                });
                huesoCadera = huesoCadera || primero;
                if (huesoCadera) {
                    huesoCadera.getWorldPosition(baseCadera);
                    modelo.worldToLocal(baseCadera);
                }
            }
        },
        undefined,
        function (err) { console.error('No se pudo cargar el personaje (' + RUTA_PERSONAJE + '). Revisa la ruta.', err); }
    );

    // ================== CONTROLES (igual que el mundo principal) ==================
    const teclas = {};
    const hay = function () {
        return Array.prototype.slice.call(arguments).some(function (c) { return teclas[c]; });
    };
    const TECLAS_MOV = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    let angulo = Math.PI;            // PI = mirando hacia el fondo de la planta (hacia la estación 1)
    let estacionActual = -1;
    let linternaOn = true;

    const objCam = new THREE.Vector3(), objMira = new THREE.Vector3();
    const mira = new THREE.Vector3(INICIO.x, 3, INICIO.z - 20);
    camera.position.set(INICIO.x, ALTURA_CAM, INICIO.z + DIST_CAM);

    // Lleva al personaje frente a una estación
    function irA(i) {
        const est = estaciones[i];
        estacionActual = i;
        jugador.position.set(est.pos.x, 0, est.pos.z + 11);
        angulo = Math.PI;
        cercano = est;
        abrirInfo(est);
    }

    document.addEventListener('keydown', function (e) {
        const k = e.code;

        // con la TV abierta: solo ESC (la barra espaciadora la usa el reproductor)
        if (tvEl.classList.contains('show')) {
            if (k === 'Escape') cerrarTV();
            return;
        }

        if (TECLAS_MOV.indexOf(k) !== -1) {
            teclas[k] = true;
            e.preventDefault();
        }
        if (k === 'Space') {
            e.preventDefault();
            irA((estacionActual + 1) % estaciones.length);
        }
        if (/^Digit[1-6]$/.test(k)) irA(parseInt(k.slice(5), 10) - 1);
        if (k === 'KeyF' && cercano) {
            if (abierto === cercano) cerrarInfo(); else abrirInfo(cercano);
        }
        if (k === 'Escape') cerrarInfo();
        if (k === 'KeyL' && linterna) {
            linternaOn = !linternaOn;
            linterna.visible = linternaOn;
        }
    });
    document.addEventListener('keyup', function (e) { teclas[e.code] = false; });
    window.addEventListener('blur', function () { for (const k in teclas) teclas[k] = false; });

    // Ayuda
    const botonAyuda = document.getElementById('help-button');
    const panelControles = document.querySelector('.controls');
    botonAyuda.addEventListener('click', function () {
        panelControles.style.display = (panelControles.style.display === 'none' || panelControles.style.display === '') ? 'block' : 'none';
    });

    // Mensaje de bienvenida
    const pista = document.getElementById('hint');
    setTimeout(function () { pista.classList.add('show'); }, 600);
    setTimeout(function () { pista.classList.remove('show'); }, 9000);

    // ================== BUCLE ==================
    const reloj = new THREE.Clock();
    let tiempo = 0;
    const adelanteV = new THREE.Vector3(), derechaV = new THREE.Vector3(), mov = new THREE.Vector3();

    function animar() {
        requestAnimationFrame(animar);
        const dt = Math.min(reloj.getDelta(), 0.05);
        tiempo += dt;

        // flechas del camino avanzando
        texCamino.offset.y -= dt * VELOCIDAD_CAMINO;

        // modelos girando y flotando
        estaciones.forEach(function (est) {
            if (est.aura) est.aura.material.opacity = 0.38 + 0.1 * Math.sin(tiempo * 1.5 + est.indice);
            if (est.model) {
                est.model.rotation.y += est.model.userData.giro * dt * 60;
                est.model.position.y = est.model.userData.yBase + Math.sin(tiempo * est.model.userData.flota * 0.6) * 0.3;
            }
        });

        // polvo a la deriva
        if (polvo) {
            for (let i = 0; i < POLVO; i++) {
                polvoPos[i * 3 + 1] += Math.sin(tiempo * 0.6 + i) * 0.003;
                polvoPos[i * 3] += Math.cos(tiempo * 0.3 + i * 1.7) * 0.004;
                if (polvoPos[i * 3 + 1] > SALA.alto - 1) polvoPos[i * 3 + 1] = 0.5;
                if (polvoPos[i * 3 + 1] < 0.4) polvoPos[i * 3 + 1] = SALA.alto - 2;
            }
            polvo.geometry.attributes.position.needsUpdate = true;
        }

        // movimiento (igual que el mundo principal: A/D giran, W/S caminan)
        if (hay('KeyA', 'ArrowLeft')) angulo += GIRO_PERSONAJE * dt;
        if (hay('KeyD', 'ArrowRight')) angulo -= GIRO_PERSONAJE * dt;
        let avance = 0;
        if (hay('KeyW', 'ArrowUp')) avance = 1;
        if (hay('KeyS', 'ArrowDown')) avance = -0.6;

        jugador.rotation.y = angulo;
        const dx = Math.sin(angulo), dz = Math.cos(angulo);
        jugador.position.x = THREE.MathUtils.clamp(jugador.position.x + dx * avance * VELOCIDAD * dt, -(SALA.x - 6), SALA.x - 6);
        jugador.position.z = THREE.MathUtils.clamp(jugador.position.z + dz * avance * VELOCIDAD * dt, SALA.zMin + 6, SALA.zMax - 6);

        if (mixer) {
            if (accionCaminar) {
                accionCaminar.paused = (avance === 0);
                accionCaminar.timeScale = avance * VELOCIDAD_ANIMACION;
            }
            mixer.update(dt);
            if (huesoCadera) bloquearCadera();
        }

        // cámara detrás del personaje (sin salirse de la nave)
        objCam.set(jugador.position.x - dx * DIST_CAM, ALTURA_CAM, jugador.position.z - dz * DIST_CAM);
        camera.position.lerp(objCam, 1 - Math.pow(0.001, dt));
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -(SALA.x - 2), SALA.x - 2);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, SALA.zMin + 1.5, SALA.zMax - 1.5);
        objMira.set(jugador.position.x, 3, jugador.position.z);
        mira.lerp(objMira, 1 - Math.pow(0.002, dt));
        camera.lookAt(mira);

        // estación más cercana al aro de información
        let mejor = null, mejorDist = RADIO_INFO;
        let masCerca = 0, distMin = Infinity;
        estaciones.forEach(function (est, i) {
            const dm = Math.hypot(jugador.position.x - est.puntoInfo.x, jugador.position.z - est.puntoInfo.z);
            if (dm < mejorDist) { mejor = est; mejorDist = dm; }
            const de = Math.hypot(jugador.position.x - est.pos.x, jugador.position.z - est.pos.z);
            if (de < distMin) { distMin = de; masCerca = i; }
        });
        if (mejor !== cercano) {
            cercano = mejor;
            if (abierto && abierto !== cercano) cerrarInfo();   // te alejaste: la tarjeta se cierra sola
            mostrarAviso(cercano && abierto !== cercano);
        }
        botonesRuta.forEach(function (b, i) { b.classList.toggle('activo', i === masCerca); });

        // aros punteados: laten, giran y brillan
        estaciones.forEach(function (est) {
            const m = est.marcador;
            const dist = Math.hypot(jugador.position.x - est.puntoInfo.x, jugador.position.z - est.puntoInfo.z);
            const cerca = Math.max(0, Math.min(1, 1 - dist / 30));
            const activo = est === cercano;
            const amp = AMPLITUD_LATIDO * (activo ? 1.4 : 1);
            const fase = tiempo * VELOCIDAD_LATIDO + est.indice * 0.9;

            const s1 = RADIO_ANILLO * ESCALA_ANILLO * (1 + amp * Math.sin(fase));
            const s2 = RADIO_ANILLO * 0.62 * ESCALA_ANILLO * (1 + amp * Math.sin(fase + Math.PI));
            m.a1.scale.set(s1, s1, 1);
            m.a2.scale.set(s2, s2, 1);
            m.a1.material.rotation = tiempo * 0.25;
            m.a2.material.rotation = -tiempo * 0.35;
            m.a1.material.opacity = 0.75 + 0.2 * cerca + (activo ? 0.05 : 0);
            m.a2.material.opacity = 0.8 + 0.2 * cerca;

            const c = ((activo ? 1.5 : 1) + 0.15 * Math.sin(fase)) * 0.5;
            m.centro.scale.set(c, c, 1);

            const h = RADIO_ANILLO * ESCALA_ANILLO * 1.7 * (1 + 0.12 * Math.sin(fase));
            m.halo.scale.set(h, h, 1);
            m.halo.material.opacity = 0.55 + 0.2 * Math.sin(fase) + (activo ? 0.15 : 0);
        });

        renderer.render(scene, camera);
    }
    animar();

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});