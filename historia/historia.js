/* =====================================================================
   historia.js — "El cerro del tiempo": un camino en espiral que sube por el cerro.
   Cada época de la historia de Catavi Siglo XX es una parada del camino.
   - Personaje, controles y cámara: los mismos del mundo principal (desierto.js)
   - Tarjetas, aros punteados, botón Fuente y Despejar: los mismos de Procesos (extraccion.js)
   Se usa con el mismo HTML de Procesos (cambiando solo el <script src="historia.js">).
   ===================================================================== */
window.addEventListener('load', function () {
    'use strict';
    const $ = function (id) { return document.getElementById(id); };
    if ($('loading')) $('loading').style.display = 'none';

    // ================== AJUSTES ==================
    // Personaje y cámara (valores del mundo principal)
    // Carpeta donde están los archivos del mundo principal (modelos .glb, personaje, texturas).
    // '../' si historia.html está en una subcarpeta (como Procesos); './' si está junto a CATAVI.html.
    const RUTA_BASE = '../';
    const RUTA_PERSONAJE = RUTA_BASE + 'P CAMINANDO.fbx';
    const RUTA_SUELO = RUTA_BASE + 'TEXTURA DE ARENA.jpg';   // piso (si no existe, queda una textura procedural)
    const RUTA_MONTANAS = RUTA_BASE + 'MONTAÑAS.png';        // montañas del fondo

    // Dónde se ve el mundo principal (calle, casas, entrada...) respecto al cerro, que está en el centro (0, 0)
    const MUNDO_X = 0, MUNDO_Z = 170, MUNDO_GIRO = 0;
    const ALTURA_PERSONAJE = 3.5, ORIENTACION = 0;
    const VELOCIDAD = 9, GIRO = 2.2;
    const VELOCIDAD_ANIMACION = 1, SUAVIZADO_BUCLE = 0.2;
    const DIST_CAM = 7, ALTURA_CAM = 4;

    // El cerro
    const R_BASE = 70;      // radio del camino al pie del cerro
    const R_CIMA = 12;      // radio del camino arriba
    const ALTO = 80;        // altura de la cima
    const VUELTAS = 3;      // vueltas que da el camino
    const ANCHO = 8;        // ancho del camino
    const R_PLAT = R_CIMA + ANCHO / 2;   // radio de la plataforma de la cima

    // Marcadores (aros punteados que laten)
    const RADIO_INFO = 6;
    const ALTURA_MARCADOR = 1.4, RADIO_ANILLO = 0.75, PUNTOS_POR_ANILLO = 32;
    const VELOCIDAD_LATIDO = 2.2, AMPLITUD_LATIDO = 0.2;

    // ================== UTILIDADES ==================
    const TAU = Math.PI * 2;
    function seededRandom(seed) {
        let s = seed;
        return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    }
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
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.encoding = THREE.sRGBEncoding;
        return tex;
    }
    function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }
    function mk(tag, cls, txt) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt) e.textContent = txt;
        return e;
    }

    // ================== GEOMETRÍA DE LA ESPIRAL ==================
    // t va de 0 (pie del cerro) a 1 (cima)
    function radioEn(t) { return R_BASE + (R_CIMA - R_BASE) * t; }
    function anguloEn(t) { return t * VUELTAS * TAU; }
    function puntoEn(t, lado) {
        const r = radioEn(t) + (lado || 0), a = anguloEn(t);
        return new THREE.Vector3(Math.cos(a) * r, t * ALTO, Math.sin(a) * r);
    }
    function tangenteEn(t) {
        const d = puntoEn(Math.min(1, t + 0.002)).sub(puntoEn(Math.max(0, t - 0.002)));
        d.y = 0;
        return d.normalize();
    }

    // ================== ESCENA ==================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8a070);   // atardecer (el mismo cielo del mundo principal)
    scene.fog = new THREE.Fog(0xcf9568, 150, 700);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;   // igual que el mundo principal
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = false;
    ($('canvas-container') || document.body).appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffd9b0, 0x6e5a48, 0.95));
    const sol = new THREE.DirectionalLight(0xff9a4d, 0.9);
    sol.position.set(-120, 45, 70);
    scene.add(sol);

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
    const brilloSol = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrillo, color: 0xff9a4d, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.9 }));
    brilloSol.scale.set(420, 420, 1);
    brilloSol.position.set(-560, 110, 330);
    scene.add(brilloSol);

    // ================== PISO, CERRO Y CAMINO ==================
    const matTierra = new THREE.MeshLambertMaterial({
        map: makeSpeckleTexture(256, '#8a6f4e', ['#7a6040', '#9b8260', '#6b5338'], 900, { minSize: 1, maxSize: 4, minAlpha: 0.1, maxAlpha: 0.3 }), color: 0xe0d0c0
    });
    matTierra.map.repeat.set(100, 100);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), matTierra);
    piso.rotation.x = -Math.PI / 2;
    scene.add(piso);
    new THREE.TextureLoader().load(RUTA_SUELO, function (t) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(100, 100);
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        matTierra.map = t;
        matTierra.needsUpdate = true;
    }, undefined, function () { /* queda la textura procedural */ });

    const texRoca = makeSpeckleTexture(256, '#6b5646', ['#55443a', '#7d6652', '#3f322a', '#8a7058'], 800,
        { minSize: 1, maxSize: 6, minAlpha: 0.1, maxAlpha: 0.35, scratches: 30, scratchColor: 'rgba(0,0,0,.25)' });
    texRoca.repeat.set(24, 6);
    // El cerro: cono truncado cuya pared pasa justo por el borde INTERIOR del camino.
    // Así el camino queda como una cornisa que sale de la pared (no enterrado dentro del cerro).
    const colina = new THREE.Mesh(
        new THREE.CylinderGeometry(R_CIMA - ANCHO / 2, R_BASE - ANCHO / 2, ALTO, 72, 1, false),
        new THREE.MeshLambertMaterial({ map: texRoca, color: 0xc0a088 })
    );
    colina.position.y = ALTO / 2;
    scene.add(colina);

    const aux = new THREE.Object3D();
    const texMadera = makeSpeckleTexture(128, '#5a3d22', ['#47301a', '#6d4a2a', '#3a2814'], 200,
        { minSize: 1, maxSize: 3, minAlpha: 0.1, maxAlpha: 0.3, scratches: 30, scratchColor: 'rgba(0,0,0,.25)' });
    const matMadera = new THREE.MeshLambertMaterial({ map: texMadera, color: 0xc0a080 });

    // Camino tallado en el cerro
    (function camino() {
        const N = 420, pos = [], uv = [], idx = [];
        for (let i = 0; i <= N; i++) {
            const t = i / N, a = anguloEn(t), r = radioEn(t), c = Math.cos(a), s = Math.sin(a), y = t * ALTO + 0.08;
            pos.push(c * (r - ANCHO / 2), y, s * (r - ANCHO / 2), c * (r + ANCHO / 2), y, s * (r + ANCHO / 2));
            uv.push(0, i * 0.35, 1, i * 0.35);
            if (i < N) { const n = i * 2; idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        const tex = makeSpeckleTexture(256, '#8c7350', ['#7a6040', '#a08862', '#5e4a30'], 700, { minSize: 1, maxSize: 4, minAlpha: 0.1, maxAlpha: 0.3, scratches: 20, scratchColor: 'rgba(0,0,0,.18)' });
        scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex, color: 0xe8d8c0, side: THREE.DoubleSide })));

        // muro de contención bajo el borde exterior: sostiene el camino y se une a la pared del cerro
        const wp = [], wu = [], wi = [];
        for (let i = 0; i <= N; i++) {
            const t = i / N, a = anguloEn(t), ro = radioEn(t) + ANCHO / 2, y = t * ALTO;
            const c = Math.cos(a), s = Math.sin(a), baja = Math.max(0, y - 12);
            wp.push(c * ro, y + 0.08, s * ro, c * ro, baja, s * ro);
            wu.push(i * 0.3, 0, i * 0.3, (y + 0.08 - baja) / 6);
            if (i < N) { const n = i * 2; wi.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
        }
        const gm = new THREE.BufferGeometry();
        gm.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3));
        gm.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2));
        gm.setIndex(wi);
        gm.computeVertexNormals();
        const texMuro = makeSpeckleTexture(256, '#6b5646', ['#55443a', '#7d6652', '#3f322a', '#8a7058'], 800,
            { minSize: 1, maxSize: 6, minAlpha: 0.1, maxAlpha: 0.35, scratches: 30, scratchColor: 'rgba(0,0,0,.25)' });
        scene.add(new THREE.Mesh(gm, new THREE.MeshLambertMaterial({ map: texMuro, color: 0xc0a088, side: THREE.DoubleSide })));

        // postes de madera en el borde exterior (para no caer)
        const NP = 90;
        const postes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 1.6, 0.25), matMadera, NP);
        for (let i = 0; i < NP; i++) {
            const p = puntoEn((i + 1) / (NP + 2) * 0.98, ANCHO / 2 - 0.3);
            aux.position.set(p.x, p.y + 0.9, p.z);
            aux.updateMatrix();
            postes.setMatrixAt(i, aux.matrix);
        }
        scene.add(postes);
    })();

    // Plataforma de la cima + castillete (torre de mina)
    const plat = new THREE.Mesh(new THREE.CircleGeometry(R_PLAT, 40), matTierra);
    plat.rotation.x = -Math.PI / 2;
    plat.position.y = ALTO + 0.06;
    scene.add(plat);
    const faldon = new THREE.Mesh(new THREE.CylinderGeometry(R_PLAT, R_PLAT, 12, 40, 1, true), colina.material);
    faldon.position.y = ALTO - 6;
    scene.add(faldon);
    (function castillete() {
        const g = new THREE.Group();
        [-1, 1].forEach(function (l) {
            const pata = new THREE.Mesh(new THREE.BoxGeometry(0.6, 15, 0.6), matMadera);
            pata.position.set(l * 1.6, 7.3, 0);
            pata.rotation.z = -l * 0.2;
            g.add(pata);
        });
        const viga = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.5), matMadera);
        viga.position.y = 14.6;
        g.add(viga);
        const rueda = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.4, 18), new THREE.MeshLambertMaterial({ color: 0x2b2b2b }));
        rueda.rotation.x = Math.PI / 2;
        rueda.position.y = 15.6;
        g.add(rueda);
        g.position.set(-9, ALTO, -6);
        g.rotation.y = 0.6;
        scene.add(g);
    })();

    // ================== EL MUNDO PRINCIPAL, DE FONDO ==================
    // Las mismas montañas, calle, casas, entrada, volquetas y calaminas del mundo caminable.
    const RADIO_FONDO = 900, ALTO_FONDO = 460, BAJAR_FONDO = 100;
    const matFondo = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.7, 0.52), side: THREE.BackSide, fog: false, depthWrite: false });
    new THREE.TextureLoader().load(RUTA_MONTANAS, function (tex) {
        tex.encoding = THREE.sRGBEncoding;
        tex.wrapS = THREE.MirroredRepeatWrapping;
        const anchoImagen = ALTO_FONDO * (tex.image.width / tex.image.height);
        tex.repeat.x = Math.max(2, 2 * Math.round((TAU * RADIO_FONDO / anchoImagen) / 2));
        matFondo.map = tex;
        matFondo.needsUpdate = true;
    }, undefined, function () { matFondo.color.set(0x6f8aa8); console.warn('No se encontró ' + RUTA_MONTANAS); });
    const fondo = new THREE.Mesh(new THREE.CylinderGeometry(RADIO_FONDO, RADIO_FONDO, ALTO_FONDO, 64, 1, true), matFondo);
    fondo.position.y = ALTO_FONDO / 2 - BAJAR_FONDO;
    fondo.renderOrder = -1;
    scene.add(fondo);

    const MUNDO = new THREE.Group();                 // todo el mundo principal va dentro de este grupo
    MUNDO.position.set(MUNDO_X, 0, MUNDO_Z);
    MUNDO.rotation.y = MUNDO_GIRO;
    scene.add(MUNDO);

    function cargarGLB(ruta) {
        return new Promise(function (ok, mal) {
            new THREE.GLTFLoader().load(RUTA_BASE + ruta, function (g) { ok(g.scene); }, undefined, mal);
        });
    }
    function bajarAlSuelo(obj, extra) {              // apoya el modelo en el suelo con sus vértices reales
        obj.updateMatrixWorld(true);
        const ys = [], v = new THREE.Vector3();
        obj.traverse(function (m) {
            if (!m.isMesh || !m.visible || !m.geometry.attributes.position) return;
            const pos = m.geometry.attributes.position, salto = Math.max(1, Math.floor(pos.count / 4000));
            for (let i = 0; i < pos.count; i += salto) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); ys.push(v.y); }
        });
        ys.sort(function (p, q) { return p - q; });
        const base = ys.length ? ys[Math.floor(ys.length * 0.02)] : new THREE.Box3().setFromObject(obj).min.y;
        obj.position.y -= base + (extra || 0);
    }
    // o.tam = tamaño máximo en X/Z; o.esc = escala fija; o.bajar = cuánto hundirlo
    function preparar(ruta, o) {
        return cargarGLB(ruta).then(function (obj) {
            if (o.esc) obj.scale.setScalar(o.esc);
            else {
                const t = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
                obj.scale.multiplyScalar(o.tam / Math.max(t.x, t.z));
            }
            obj.updateMatrixWorld(true);
            const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
            obj.position.x -= c.x;
            obj.position.z -= c.z;
            bajarAlSuelo(obj, o.bajar || 0);
            const g = new THREE.Group();
            g.add(obj);
            return g;
        });
    }
    function ponerEn(base, x, z, giro) {
        const g = base.clone(true);
        g.position.set(x, 0, z);
        g.rotation.y = giro;
        MUNDO.add(g);
    }
    function fallo(ruta) { return function (e) { console.warn('[Historia] No se pudo cargar ' + RUTA_BASE + ruta, e); }; }

    // Casas de la calle: [archivo, tamaño, giro extra]
    const CASAS = [['CASA 1.glb', 25, Math.PI], ['CASA 2.glb', 25, 0], ['CASA IZQUIERDA.glb', 35, 0], ['CASA DERECHA.glb', 25, Math.PI], ['CASA 3.glb', 25, 0]];
    // [índice de casa, x, z, giro]
    const LUGAR_CASAS = [[0, -26, 15, 0], [3, -26, -5, 0], [1, 26, 40, Math.PI], [2, 20, 5, Math.PI], [4, 26, 65, Math.PI]];
    Promise.allSettled(CASAS.map(function (c) { return preparar(c[0], { tam: c[1] }); })).then(function (res) {
        LUGAR_CASAS.forEach(function (p) {
            const r = res[p[0]];
            if (r.status === 'fulfilled') ponerEn(r.value, p[1], p[2], p[3] + CASAS[p[0]][2]);
            else fallo(CASAS[p[0]][0])(r.reason);
        });
    });

    // Casa grande y volqueta junto a ella
    preparar('CASA GRANDE.glb', { esc: 10 }).then(function (b) { ponerEn(b, -26, 60, 0); }).catch(fallo('CASA GRANDE.glb'));
    preparar('volqueta.glb', { tam: 16 }).then(function (b) { ponerEn(b, -20, 32, 0); }).catch(fallo('volqueta.glb'));

    // Medio fondo (dos), tractor y segunda volqueta
    preparar('medioFondo.glb', { tam: 100, bajar: 0.3 }).then(function (b) {
        ponerEn(b, 0, 100, Math.PI);
        ponerEn(b, 0, 180, Math.PI);
    }).catch(fallo('medioFondo.glb'));
    preparar('tractor.glb', { tam: 18 }).then(function (b) { ponerEn(b, 0, 140, 0); }).catch(fallo('tractor.glb'));
    preparar('volqueta2.glb', { tam: 19 }).then(function (b) { ponerEn(b, 22, 140, 0); }).catch(fallo('volqueta2.glb'));

    // Calaminas a los costados
    Promise.allSettled([preparar('calaminas.glb', { tam: 70 }), preparar('calaminav.glb', { tam: 10 })]).then(function (res) {
        [-1, 1].forEach(function (lado) {
            [92, 116, 168, 192].forEach(function (z, i) {
                const r = res[(i + (lado > 0 ? 1 : 0)) % 2];
                if (r.status !== 'fulfilled') return;
                ponerEn(r.value, lado * (42 + (i % 2) * 3), z, (lado > 0 ? Math.PI : 0) + (((i * 37) % 10) - 5) * 0.02);
            });
        });
    });

    // Entrada principal
    cargarGLB('ENTRADA.glb').then(function (obj) {
        const t = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
        obj.scale.multiplyScalar(60 / Math.max(t.x, t.z));
        obj.updateMatrixWorld(true);
        let caja = new THREE.Box3().setFromObject(obj);
        const c = caja.getCenter(new THREE.Vector3());
        obj.position.x -= c.x;
        obj.position.z -= c.z;
        obj.updateMatrixWorld(true);
        caja = new THREE.Box3().setFromObject(obj);
        obj.position.y -= caja.min.y;
        obj.traverse(function (m) { if (m.isMesh) m.frustumCulled = false; });
        obj.position.x += 10;
        obj.position.z += -2;
        obj.rotation.y = Math.PI;
        MUNDO.add(obj);
    }).catch(fallo('ENTRADA.glb'));

    // ================== ÉPOCAS (una parada por cada una) ==================
    const FUENTE = {
        upc: { t: 'Alfonso, Zambrana y Loredo: Relevancia mundial de la minería de estaño de Llallagua (UPC y Universidad Nacional Siglo XX)', u: 'https://upcommons.upc.edu/bitstreams/5e02d83f-c259-4dff-839d-f84f0c2128bf/download' },
        catavi: { t: 'Catavi mine · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_mine' },
        ine: { t: 'Municipio de Llallagua · Instituto Nacional de Estadística (INE) de Bolivia', u: 'https://www.ine.gob.bo/?p=39868' },
        patinoW: { t: 'Simón Iturri Patiño · Wikipedia', u: 'https://en.wikipedia.org/wiki/Sim%C3%B3n_Iturri_Pati%C3%B1o' },
        patinoB: { t: 'Simón I. Patiño · Biografías y Vidas', u: 'https://www.biografiasyvidas.com/biografia/p/patino_simon.htm' },
        eju: { t: 'Mineros celebrarán su día este miércoles y suspenderán actividades · Eju.tv', u: 'https://eju.tv/2022/12/mineros-celebraran-su-dia-este-miercoles-y-suspenderan-actividades/' },
        masacre: { t: 'Catavi massacre · Wikipedia', u: 'https://en.wikipedia.org/wiki/Catavi_massacre' },
        voz1: { t: 'Aguirre: La radio sindical minera, historia, mito y tradicional abandono · Universidad Católica Boliviana (SECRAD)', u: 'https://secrad.lpz.ucb.edu.bo/wp-content/uploads/2022/03/LA-RADIO-SINDICAL-MINERA-HISTORIA-MITO-Y-TRADICIONAL-ABANDONO-AGUIRRE.pdf' },
        voz2: { t: 'Passion for Radio, capítulo 23 · Comunica.org', u: 'https://comunica.org/passion/pdf/chapter23.pdf' },
        decreto: { t: 'Decreto de nacionalización del 31 de octubre de 1952 · Foreign Relations of the United States (Departamento de Estado de EE. UU.)', u: 'https://history.state.gov/historicaldocuments/frus1952-54v04/d145' },
        cndh: { t: 'Fallece Domitila Barrios de Chungara · Comisión Nacional de los Derechos Humanos de México', u: 'https://www.cndh.org.mx/sites/default/files/documentos/2023-02/FRI_MAR_13-1.pdf' },
        viezzer: { t: 'Moema Viezzer: «Si me permiten hablar… Testimonio de Domitila, una mujer de las minas de Bolivia» · Siglo XXI Editores' },
        gestion: { t: 'Medio millón de mineros amenazan el auge de los minerales críticos en Bolivia · Gestión', u: 'https://gestion.pe/mundo/internacional/medio-millon-de-mineros-amenazan-el-auge-de-los-minerales-criticos-en-bolivia-noticia/' },
        redalyc: { t: 'Cajías de la Vega: Crisis, diáspora y reconstitución de la memoria histórica de la minería boliviana, 1986-2003 · Redalyc', u: 'https://www.redalyc.org/pdf/3379/337930338003.pdf' },
        letrero: { t: 'Letrero oficial de la cooperativa en su entrada: «Fundado 3-5-94 · P.J. 04665»' }
    };

    // t = en qué punto del camino está (0 = pie, 1 = cima). La última está en el centro de la cima.
    const estaciones = [
        { anio: '1564', sub: 'SE CONOCE EL YACIMIENTO', t: 0.07, color: 0xe8b923,
          info: { etiqueta: 'Dato curioso', titulo: 'Nombres con historia', imagen: { src: 'imagenes/nombres.jpg', pie: 'Llallagua y Siglo XX · actual' },
              texto: ['El yacimiento se conocía desde **1564**, pero entonces el estaño valía poco. Se llamó **Siglo XX** porque la explotación a gran escala empezó a **principios del siglo XX**.',
                      '**Llallagua**, en cambio, viene de una palabra andina ligada a las **buenas cosechas de papa**.'],
              datos: [{ n: '1564', t: 'se descubre el yacimiento' }, { n: '12–15 %', t: 'de estaño en el mineral' }],
              fuentes: [FUENTE.upc, FUENTE.ine] } },
        { anio: '1900', sub: 'LA SALVADORA', t: 0.19, color: 0xff9f43,
          info: { etiqueta: 'Historia', titulo: 'La Salvadora', imagen: { src: 'imagenes/salvadora.jpg', pie: 'Simón I. Patiño · foto de archivo' },
              texto: ['La mina se llamaba **La Salvadora** y en **1900** Simón I. Patiño halló en ella una veta riquísima de estaño.',
                      'Con los años llegó a ser uno de los **hombres más ricos del mundo**.'],
              datos: [{ n: '1900', t: 'se halla la veta' }, { n: '1940', t: 'década en que era de los más ricos' }],
              fuentes: [FUENTE.patinoW, FUENTE.patinoB] } },
        { anio: '1942', sub: 'MASACRE DE CATAVI', t: 0.31, color: 0xe06b5a,
          info: { etiqueta: 'Memoria', titulo: 'Día del Trabajador Minero', imagen: { src: 'imagenes/dia-minero.jpg', pie: 'Monumento al Minero · Siglo XX' },
              texto: ['Cada **21 de diciembre** Bolivia celebra el Día del Trabajador Minero, por una ley de **1944**.',
                      'Recuerda a los caídos de la **masacre de Catavi** (1942), cuando mineros y sus familias marcharon reclamando mejores salarios.'],
              datos: [{ n: '21 dic', t: 'Día del Trabajador Minero' }, { n: '1942', t: 'masacre de Catavi' }],
              fuentes: [FUENTE.eju, FUENTE.masacre] } },
        { anio: '1947', sub: 'LA VOZ DEL MINERO', t: 0.42, color: 0x7fd1e6,
          info: { etiqueta: 'Dato curioso', titulo: 'La Voz del Minero', imagen: { src: 'imagenes/voz-minero.jpg', pie: 'Radio La Voz del Minero · Siglo XX' },
              texto: ['En **1947** nació en Siglo XX la radio **La Voz del Minero**, una de las primeras radios populares de América Latina.',
                      'La sostenían los propios mineros con **un día de salario al mes**.'],
              datos: [{ n: '1947', t: 'primeras transmisiones' }],
              fuentes: [FUENTE.voz1, FUENTE.voz2] } },
        { anio: '1952', sub: 'NACIONALIZACIÓN', t: 0.53, color: 0xf2d16b,
          info: { etiqueta: 'Historia', titulo: 'Un gigante del estaño', imagen: { src: 'imagenes/gigante-estaño.jpg', pie: 'Mina Siglo XX · foto de archivo' },
              texto: ['El complejo **Catavi–Siglo XX** llegó a ser el mayor de la Corporación Minera de Bolivia, con unos **5.000 trabajadores**.',
                      'En Llallagua nació el **sindicalismo minero** y se organizó la **primera industria moderna de Bolivia**.'],
              datos: [{ n: '5.000', t: 'trabajadores en el complejo' }, { n: '31 oct 1952', t: 'se nacionalizan las minas' }],
              fuentes: [FUENTE.catavi, FUENTE.upc, FUENTE.decreto] } },
        { anio: '1975', sub: 'DOMITILA', t: 0.64, color: 0xc9a0e8,
          info: { etiqueta: 'Personaje', titulo: 'Domitila y las amas de casa', imagen: { src: 'imagenes/domitila.jpg', pie: 'Domitila Barrios de Chungara' },
              texto: ['**Domitila Barrios de Chungara**, de la comunidad minera de Siglo XX, fue una voz del **Comité de Amas de Casa**, que reunía a esposas de mineros.',
                      'En **1975** viajó a México a la Tribuna del Año Internacional de la Mujer de la ONU.'],
              datos: [{ n: '1963', t: 'se une al Comité' }, { n: '1975', t: 'Tribuna de la ONU' }],
              fuentes: [FUENTE.cndh, FUENTE.viezzer] } },
        { anio: '1980s', sub: 'NACEN LAS COOPERATIVAS', t: 0.76, color: 0xf4a261,
          info: { etiqueta: 'Historia', titulo: 'Así nacieron las cooperativas', imagen: { src: 'imagenes/cooperativas.jpg', pie: 'Socios en una bocamina · actual' },
              texto: ['Cuando el precio del estaño se desplomó en la **década de 1980**, miles de mineros despedidos ocuparon **túneles abandonados**. Así empezó el movimiento cooperativista actual.',
                      'Hoy las cooperativas agrupan cerca del **8 % de la fuerza laboral** de Bolivia y aportan **la mitad de la extracción minera**.'],
              datos: [{ n: '≈8 %', t: 'de la fuerza laboral' }, { n: '≈50 %', t: 'de la extracción minera' }],
              fuentes: [FUENTE.gestion, FUENTE.redalyc] } },
        { anio: '1994', sub: 'NUESTRA COOPERATIVA', t: 1, cima: true, color: 0xffb347,
          info: { etiqueta: 'Acta de nacimiento', titulo: 'Nuestra fundación', imagen: { src: 'imagenes/fundacion.jpeg', pie: 'Cooperativa Siglo XX Catavi' },
              texto: ['**Cooperativa Minera Multiactiva Catavi Siglo XX R.L.** fue fundada el **3 de mayo de 1994** en Llallagua, Potosí, Bolivia.'],
              datos: [{ n: '1994', t: 'año de fundación' }, { n: 'N° 04665', t: 'personería jurídica' }],
              fuentes: [FUENTE.letrero] } }
    ];
    estaciones.forEach(function (e, i) {
        e.indice = i;
        e.pos = e.cima ? new THREE.Vector3(0, ALTO, 0) : puntoEn(e.t);
        e.puntoInfo = { x: e.pos.x, z: e.pos.z };
    });

    // ================== LETREROS, MARCADORES ==================
    const LET_W = 5, LET_H = 2.5, LET_Y = 3.2;
    const geoPoste = new THREE.BoxGeometry(0.25, LET_Y + LET_H / 2, 0.25);
    const geoMarcoLet = new THREE.BoxGeometry(LET_W + 0.3, LET_H + 0.3, 0.16);
    const geoTablero = new THREE.PlaneGeometry(LET_W, LET_H);
    const FUENTE_LET = 'Oswald, "Arial Narrow", Impact, sans-serif';

    function letrero(est) {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 512;
        const ctx = c.getContext('2d');
        const col = hex(est.color);
        function franjas(y, h) {
            ctx.save();
            ctx.beginPath(); ctx.rect(0, y, 1024, h); ctx.clip();
            ctx.fillStyle = '#e8b923'; ctx.fillRect(0, y, 1024, h);
            ctx.fillStyle = '#17140f';
            for (let x = -h; x < 1024 + h; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, y + h); ctx.lineTo(x + h, y); ctx.lineTo(x + h + 32, y); ctx.lineTo(x + 32, y + h);
                ctx.closePath(); ctx.fill();
            }
            ctx.restore();
        }
        function dibujar() {
            ctx.fillStyle = '#25221d';
            ctx.fillRect(0, 0, 1024, 512);
            for (let i = 0; i < 900; i++) {
                ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
                const t = 1 + Math.random() * 2.5;
                ctx.fillRect(Math.random() * 1024, Math.random() * 512, t, t);
            }
            franjas(0, 44);
            franjas(468, 44);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillStyle = col;
            ctx.font = '500 44px ' + FUENTE_LET;
            ctx.fillText('ÉPOCA ' + (est.indice + 1) + ' DE ' + estaciones.length, 60, 100);
            ctx.font = '700 230px ' + FUENTE_LET;
            ctx.fillStyle = '#f4efe6';
            ctx.fillText(est.anio, 60, 240);
            let tam = 70;
            ctx.font = '500 ' + tam + 'px ' + FUENTE_LET;
            while (ctx.measureText(est.sub).width > 900 && tam > 36) { tam -= 4; ctx.font = '500 ' + tam + 'px ' + FUENTE_LET; }
            ctx.fillStyle = col;
            ctx.fillText(est.sub, 60, 395);
        }
        dibujar();
        const tex = new THREE.CanvasTexture(c);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 8;
        if (document.fonts && document.fonts.load) {
            document.fonts.load('500 100px Oswald').then(function () { dibujar(); tex.needsUpdate = true; }).catch(function () {});
        }
        const g = new THREE.Group();
        [-1, 1].forEach(function (l) {
            const p = new THREE.Mesh(geoPoste, matMadera);
            p.position.set(l * (LET_W / 2 - 0.3), (LET_Y + LET_H / 2) / 2, -0.2);
            g.add(p);
        });
        const marco = new THREE.Mesh(geoMarcoLet, matMadera);
        marco.position.set(0, LET_Y, 0);
        g.add(marco);
        const tablero = new THREE.Mesh(geoTablero, new THREE.MeshBasicMaterial({ map: tex }));
        tablero.position.set(0, LET_Y, 0.09);
        g.add(tablero);
        if (est.cima) {
            g.position.set(-5, ALTO, 0);
            g.rotation.y = Math.PI / 2;           // mira hacia donde termina el camino
        } else {
            const p = puntoEn(est.t + 0.008, ANCHO / 2 - 1.4), T = tangenteEn(est.t);
            g.position.copy(p);
            g.rotation.y = Math.atan2(-T.x, -T.z); // mira hacia quien sube
        }
        scene.add(g);
    }

    function texAnillo(color, n) {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const x = c.getContext('2d');
        const r = 112, circ = TAU * r;
        x.strokeStyle = color; x.lineWidth = 14; x.lineCap = 'round';
        x.setLineDash([0.01, circ / n - 0.01]);
        x.beginPath(); x.arc(128, 128, r, 0, TAU); x.stroke();
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
        x.beginPath(); x.arc(32, 32, 26, 0, TAU); x.fill();
        return new THREE.CanvasTexture(c);
    })();
    const ESCALA_ANILLO = 1 / 0.4375;
    const geoLinea = new THREE.CylinderGeometry(0.025, 0.025, 1, 6, 1, true);
    const matLinea = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
    function sprite(tex, extra) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: tex, transparent: true, depthWrite: false, fog: false }, extra || {})));
        s.position.y = ALTURA_MARCADOR;
        return s;
    }

    estaciones.forEach(function (est) {
        letrero(est);
        const g = new THREE.Group();
        g.position.copy(est.pos);
        const halo = sprite(texBrillo, { blending: THREE.AdditiveBlending, opacity: 0.6 });
        const a1 = sprite(texAnillo1), a2 = sprite(texAnillo2), centro = sprite(texCentro);
        const altoLinea = ALTURA_MARCADOR - RADIO_ANILLO;
        const linea = new THREE.Mesh(geoLinea, matLinea);
        linea.scale.y = altoLinea;
        linea.position.y = altoLinea / 2;
        g.add(linea, halo, a1, a2, centro);
        scene.add(g);
        est.marcador = { halo: halo, a1: a1, a2: a2, centro: centro };
    });

    // ================== ESTILOS (tarjeta igual que en Procesos) ==================
    const estiloEl = document.createElement('style');
    estiloEl.textContent = [
        '#info-prompt{position:fixed;left:50%;bottom:64px;transform:translateX(-50%) translateY(8px);z-index:9;opacity:0;pointer-events:none;transition:opacity .25s ease,transform .25s ease}',
        '#info-prompt.show{opacity:1;pointer-events:auto;transform:translateX(-50%)}',
        '#info-prompt button{display:flex;align-items:center;gap:10px;font:500 15px Oswald,"Arial Narrow",sans-serif;letter-spacing:.5px;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 24px 10px 10px;cursor:pointer}',
        '#info-prompt .tecla{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:6px;background:#000;color:#fff;border:1px solid rgba(255,255,255,.3);font:500 14px Oswald,"Arial Narrow",sans-serif}',
        '#info-prompt button:hover{background:rgba(0,0,0,.7)}',

        '#tarjeta-info{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(12,10,9,.62);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s ease}',
        '#tarjeta-info.show{opacity:1;pointer-events:auto}',
        '.tj-carta{position:relative;width:min(900px,95vw);height:min(500px,88vh);border-radius:18px;overflow:hidden;background:#171311;border:1px solid rgba(255,255,255,.12);color:#fff;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 25px 60px rgba(0,0,0,.9),0 0 35px rgba(197,168,128,.25);transform:scale(.88);transition:transform .7s cubic-bezier(.25,1,.5,1)}',
        '#tarjeta-info.show .tj-carta{transform:scale(1)}',
        '.tj-foto{position:absolute;top:0;bottom:0;right:0;left:auto;height:100%;width:64%;object-fit:cover;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 28%);mask-image:linear-gradient(90deg,transparent 0%,#000 28%);transition:width .6s ease}',
        '.tj-velo{position:absolute;inset:0;pointer-events:none;transition:opacity .5s ease;background:linear-gradient(90deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.82) 30%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.06) 68%,rgba(0,0,0,0) 100%),linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,0) 20%)}',
        '.tj-contenido{position:relative;z-index:2;width:100%;height:100%;box-sizing:border-box;padding:22px 30px 26px;display:flex;flex-direction:column;justify-content:space-between;text-align:left}',
        '.tj-arriba{position:relative;z-index:4;display:flex;justify-content:space-between;align-items:center;padding:0 4px}',
        '.tj-tag{font-size:.78rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.9);text-shadow:0 2px 6px rgba(0,0,0,.8)}',
        '.tj-btn-fuente{background:none;border:none;padding:0;cursor:pointer;font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.06em;color:#c5a880;text-decoration:underline;text-shadow:0 2px 6px rgba(0,0,0,.8)}',
        '.tj-btn-fuente:hover{color:#f3e3c3}',
        '.tj-cuerpo{display:flex;flex-direction:column;align-items:flex-start;max-width:48%;text-align:left;margin-top:auto;min-height:0}',
        '.tj-titulo{margin:0;font-size:1.9rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;line-height:1.1;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95)}',
        '.tj-subtitulo{font-size:1.1rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;line-height:1.2;color:#f3f0ea;text-shadow:0 3px 10px rgba(0,0,0,.9)}',
        '.tj-linea{width:34px;height:2px;margin:8px 0 10px;border-radius:2px;background:#c5a880;box-shadow:0 0 8px rgba(197,168,128,.7)}',
        '.tj-textos{max-height:165px;overflow-y:auto;padding:0 6px 0 0;scrollbar-width:thin;scrollbar-color:rgba(197,168,128,.5) transparent}',
        '.tj-textos p{margin:0 0 8px;font-size:.9rem;font-style:italic;line-height:1.35;color:rgba(255,255,255,.9);text-shadow:0 2px 8px rgba(0,0,0,.9)}',
        '.tj-textos strong{color:#e6cfa5;font-weight:700}',
        '.tj-datos{display:flex;flex-wrap:wrap;justify-content:flex-start;gap:6px 14px;margin:2px 0 12px}',
        '.tj-dato{display:flex;flex-direction:column;align-items:flex-start;text-align:left;max-width:130px}',
        '.tj-dato b{font-size:.95rem;color:#c5a880;text-shadow:0 2px 6px rgba(0,0,0,.9)}',
        '.tj-dato span{font-size:.68rem;line-height:1.2;color:rgba(255,255,255,.8)}',
        '.tj-fuentes{position:absolute;inset:0;z-index:3;box-sizing:border-box;padding:60px 36px 26px;overflow-y:auto;background:rgba(12,10,9,.97);text-align:left;opacity:0;pointer-events:none;transition:opacity .3s ease}',
        '.tj-fuentes.abierto{opacity:1;pointer-events:auto}',
        '.tj-fuentes h4{margin:0 0 12px;font-size:.78rem;letter-spacing:.3em;text-transform:uppercase;color:#c5a880}',
        '.tj-fuentes ul{margin:0;padding:0;list-style:none}',
        '.tj-fuentes li{margin-bottom:12px;font-size:.85rem;line-height:1.35;color:rgba(255,255,255,.85)}',
        '.tj-fuentes a{color:#e6cfa5;text-decoration:underline}',
        '.tj-fuentes small{display:block;margin-top:2px;font-size:.66rem;color:rgba(255,255,255,.45)}',
        '.tj-der{display:flex;align-items:center;gap:14px}',
        '.tj-btn-despejar{padding:5px 14px;border:1px solid rgba(197,168,128,.75);border-radius:9999px;background:rgba(0,0,0,.4);color:#e6cfa5;font:inherit;font-size:.72rem;font-weight:700;letter-spacing:.08em;cursor:pointer;backdrop-filter:blur(4px)}',
        '.tj-btn-despejar:hover{background:rgba(0,0,0,.7)}',
        '.tj-cuerpo,.tj-tag,.tj-btn-fuente{transition:opacity .4s ease}',
        '.tj-carta.despejado .tj-foto{width:100%;-webkit-mask-image:none;mask-image:none}',
        '.tj-carta.despejado .tj-velo{opacity:0}',
        '.tj-carta.despejado .tj-cuerpo,.tj-carta.despejado .tj-tag,.tj-carta.despejado .tj-btn-fuente{opacity:0;pointer-events:none}',
        '@media (max-width:700px){.tj-cuerpo{max-width:100%}.tj-carta{height:min(560px,88vh)}.tj-foto{width:100%;-webkit-mask-image:none;mask-image:none}.tj-velo{background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.2) 25%,rgba(0,0,0,.75) 60%,rgba(0,0,0,.96) 100%)}}',
        '.tj-x{position:fixed;top:18px;right:22px;z-index:60;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.55);color:#fff;font-size:1.4rem;line-height:1;cursor:pointer}',
        '.tj-x:hover{background:rgba(0,0,0,.8)}'
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

    let cercano = null, abierto = null;
    function mostrarAviso(v) { avisoEl.classList.toggle('show', !!v); }
    function cerrarInfo() { abierto = null; tarjetaEl.classList.remove('show'); }

    function conResaltado(el, txt) {
        txt.split('**').forEach(function (parte, k) {
            if (!parte) return;
            if (k % 2) { const s = document.createElement('strong'); s.textContent = parte; el.appendChild(s); }
            else el.appendChild(document.createTextNode(parte));
        });
    }

    function abrirInfo(est) {
        abierto = est;
        tarjetaEl.innerHTML = '';
        const d = est.info;
        const carta = mk('div', 'tj-carta');

        if (d.imagen) {
            const img = document.createElement('img');
            img.className = 'tj-foto';
            img.style.objectPosition = d.imagen.foco || '60% 90%';
            img.alt = d.imagen.pie || d.titulo;
            img.decoding = 'async';
            img.addEventListener('error', function () { img.remove(); });
            img.src = d.imagen.src;
            carta.appendChild(img);
        }
        carta.appendChild(mk('div', 'tj-velo'));

        const contenido = mk('div', 'tj-contenido');
        const arriba = mk('div', 'tj-arriba');
        const tieneFuentes = d.fuentes && d.fuentes.length;
        const btnFuente = mk('button', 'tj-btn-fuente', 'Fuente');
        btnFuente.type = 'button';
        if (!tieneFuentes) btnFuente.style.visibility = 'hidden';
        arriba.appendChild(btnFuente);

        const der = mk('div', 'tj-der');
        der.appendChild(mk('span', 'tj-tag', (d.etiqueta || 'Dato curioso') + ' · ' + String(est.indice + 1).padStart(2, '0') + '/' + String(estaciones.length).padStart(2, '0')));
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

        const cuerpo = mk('div', 'tj-cuerpo');
        cuerpo.appendChild(mk('h2', 'tj-titulo', d.titulo));
        cuerpo.appendChild(mk('span', 'tj-subtitulo', '– ' + est.anio));
        cuerpo.appendChild(mk('div', 'tj-linea'));
        const textos = mk('div', 'tj-textos');
        d.texto.forEach(function (t) { const p = mk('p'); conResaltado(p, t); textos.appendChild(p); });
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
        contenido.appendChild(cuerpo);
        carta.appendChild(contenido);

        if (tieneFuentes) {
            const panel = mk('div', 'tj-fuentes');
            panel.appendChild(mk('h4', '', 'Fuentes'));
            const lista = document.createElement('ul');
            d.fuentes.forEach(function (f) {
                const li = document.createElement('li');
                if (f.u) {
                    const a = mk('a', '', f.t);
                    a.href = f.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
                    li.appendChild(a);
                    try { li.appendChild(mk('small', '', new URL(f.u).hostname.replace(/^www\./, ''))); } catch (e) { /* sin dominio */ }
                } else li.textContent = f.t;
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

        tarjetaEl.appendChild(carta);
        const x = mk('button', 'tj-x', '×');
        x.type = 'button';
        x.setAttribute('aria-label', 'Cerrar');
        x.addEventListener('click', cerrarInfo);
        tarjetaEl.appendChild(x);
        carta.addEventListener('click', function (e) { e.stopPropagation(); });
        tarjetaEl.onclick = cerrarInfo;
        tarjetaEl.classList.add('show');
        mostrarAviso(false);
    }
    avisoEl.querySelector('button').addEventListener('click', function () { if (cercano) abrirInfo(cercano); });

    // Puntos numerados arriba (si la página tiene el contenedor #ruta)
    const rutaEl = $('ruta');
    const botonesRuta = estaciones.map(function (est, i) {
        if (!rutaEl) return null;
        if (i > 0) { const sep = document.createElement('span'); sep.className = 'sep'; rutaEl.appendChild(sep); }
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = String(i + 1);
        b.title = est.anio + ' · ' + est.sub;
        b.addEventListener('click', function () { irA(i); b.blur(); });
        rutaEl.appendChild(b);
        return b;
    });

    // ================== PERSONAJE (el mismo del mundo principal) ==================
    const jugador = new THREE.Group();
    scene.add(jugador);
    let mixer = null, accionCaminar = null, huesoCadera = null, modeloGrupo = null;
    const baseCadera = new THREE.Vector3(), _v = new THREE.Vector3();
    const ES_RAIZ_POS = /(hips|root|pelvis|armature).*\.position$/i;

    function bloquearCadera() {
        jugador.updateMatrixWorld(true);
        huesoCadera.getWorldPosition(_v);
        modeloGrupo.worldToLocal(_v);
        _v.x = baseCadera.x; _v.z = baseCadera.z;
        modeloGrupo.localToWorld(_v);
        huesoCadera.parent.worldToLocal(_v);
        huesoCadera.position.copy(_v);
    }
    function cerrarBucle(clip, fraccion) {
        if (fraccion <= 0) return;
        const L = clip.duration * fraccion, q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion();
        clip.tracks.forEach(function (t) {
            if (ES_RAIZ_POS.test(t.name)) return;
            const size = t.getValueSize(), v = t.values, tm = t.times, n = tm.length;
            if (n < 3) return;
            const T = tm[n - 1];
            for (let i = 0; i < n; i++) {
                if (tm[i] < T - L) continue;
                const w = (tm[i] - (T - L)) / L, k = w * w * (3 - 2 * w);
                if (size === 4) { q0.fromArray(v, 0); q1.fromArray(v, i * 4); q1.slerp(q0, k); q1.toArray(v, i * 4); }
                else for (let j = 0; j < size; j++) v[i * size + j] += (v[j] - v[i * size + j]) * k;
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
                if (huesoCadera) { huesoCadera.getWorldPosition(baseCadera); modelo.worldToLocal(baseCadera); }
            }
        },
        undefined,
        function (err) { console.error('No se pudo cargar el personaje (' + RUTA_PERSONAJE + '). Revisa la ruta.', err); }
    );

    // ================== MOVERSE SOBRE EL CAMINO ==================
    // El personaje camina libre (A/D giran, W/S avanzan), pero queda dentro del ancho del
    // camino y su altura sigue la subida. tAct = en qué punto del camino va (0 a 1).
    let tAct = 0, arriba = false;

    function ajustarAlCerro(p) {
        const r = Math.hypot(p.x, p.z) || 0.001;
        const a0 = (((Math.atan2(p.z, p.x) % TAU) + TAU) % TAU) / TAU;

        if (arriba) {                                   // en la plataforma de la cima
            if (r > R_PLAT) {
                const d = Math.min(a0, 1 - a0) * TAU;   // ¿está donde empieza el camino de bajada?
                if (d < 0.5) arriba = false;
                else { p.x *= R_PLAT / r; p.z *= R_PLAT / r; }
            }
            if (arriba) { p.y = ALTO; tAct = 1; return true; }
        }

        // de las vueltas posibles, la más cercana a donde iba (así no salta de una vuelta a otra)
        let mejor = null, dm = Infinity;
        for (let k = 0; k <= VUELTAS; k++) {
            const t = (a0 + k) / VUELTAS;
            if (t > 1.03) continue;
            const d = Math.abs(t - tAct);
            if (d < dm) { dm = d; mejor = t; }
        }
        if (mejor === null || dm > 0.06) return false;  // pared invisible (por ejemplo, detrás del inicio)

        const tt = Math.min(mejor, 1), rt = radioEn(tt);
        if (tt > 0.9 && r <= R_PLAT) { arriba = true; p.y = ALTO; tAct = 1; return true; }
        const rr = THREE.MathUtils.clamp(r, rt - ANCHO / 2, rt + ANCHO / 2);
        if (rr !== r) { p.x *= rr / r; p.z *= rr / r; }
        p.y = tt * ALTO;
        tAct = tt;
        return true;
    }

    // Si la cámara quedaría dentro de la pared del cerro, se acerca al personaje (sale por el lado del aire)
    function evitarCerro(p) {
        if (p.y >= ALTO || p.y < 0) return;
        const r = Math.hypot(p.x, p.z) || 0.001;
        const rc = (R_BASE - ANCHO / 2) + (R_CIMA - R_BASE) * (p.y / ALTO) + 1.5;   // radio de la pared a esa altura
        if (r < rc) { p.x *= rc / r; p.z *= rc / r; }
    }

    // ================== CONTROLES (igual que el mundo principal) ==================
    const teclas = {};
    const hay = function () { return Array.prototype.slice.call(arguments).some(function (c) { return teclas[c]; }); };
    const TECLAS_MOV = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    let angulo = 0, estacionActual = -1;
    const objCam = new THREE.Vector3(), objMira = new THREE.Vector3(), mira = new THREE.Vector3();

    function poner(x, y, z, giro) {
        jugador.position.set(x, y, z);
        angulo = giro;
        camera.position.set(x - Math.sin(giro) * DIST_CAM, y + ALTURA_CAM, z - Math.cos(giro) * DIST_CAM);
        mira.set(x, y + 2.5, z);
        camera.lookAt(mira);
    }
    function irA(i) {
        const est = estaciones[i];
        estacionActual = i;
        if (est.cima) {
            arriba = true; tAct = 1;
            poner(9, ALTO, 0, -Math.PI / 2);             // frente al letrero, mirando al centro
        } else {
            arriba = false; tAct = est.t - 0.012;
            const p = puntoEn(tAct), T = tangenteEn(tAct);
            poner(p.x, p.y, p.z, Math.atan2(T.x, T.z));
        }
        cercano = est;
        abrirInfo(est);
    }
    (function inicio() {
        tAct = 0.012;
        const p = puntoEn(tAct), T = tangenteEn(tAct);
        poner(p.x, p.y, p.z, Math.atan2(T.x, T.z));
    })();

    document.addEventListener('keydown', function (e) {
        const k = e.code;
        if (TECLAS_MOV.indexOf(k) !== -1) { teclas[k] = true; e.preventDefault(); }
        if (k === 'Space') { e.preventDefault(); irA((estacionActual + 1) % estaciones.length); }
        if (/^Digit[1-8]$/.test(k)) irA(parseInt(k.slice(5), 10) - 1);
        if (k === 'KeyF' && cercano) { if (abierto === cercano) cerrarInfo(); else abrirInfo(cercano); }
        if (k === 'Escape') cerrarInfo();
    });
    document.addEventListener('keyup', function (e) { teclas[e.code] = false; });
    window.addEventListener('blur', function () { for (const k in teclas) teclas[k] = false; });

    const botonAyuda = $('help-button'), panelControles = document.querySelector('.controls');
    if (botonAyuda && panelControles) {
        botonAyuda.addEventListener('click', function () {
            panelControles.style.display = (panelControles.style.display === 'none' || panelControles.style.display === '') ? 'block' : 'none';
        });
    }
    const pista = $('hint');
    if (pista) {
        setTimeout(function () { pista.classList.add('show'); }, 600);
        setTimeout(function () { pista.classList.remove('show'); }, 9000);
    }

    // ================== BUCLE ==================
    const reloj = new THREE.Clock();
    let tiempo = 0;

    function animar() {
        requestAnimationFrame(animar);
        const dt = Math.min(reloj.getDelta(), 0.05);
        tiempo += dt;

        if (hay('KeyA', 'ArrowLeft')) angulo += GIRO * dt;
        if (hay('KeyD', 'ArrowRight')) angulo -= GIRO * dt;
        let avance = 0;
        if (hay('KeyW', 'ArrowUp')) avance = 1;
        if (hay('KeyS', 'ArrowDown')) avance = -0.6;

        jugador.rotation.y = angulo;
        const dx = Math.sin(angulo), dz = Math.cos(angulo);
        if (avance !== 0) {
            const px = jugador.position.x, pz = jugador.position.z, pArriba = arriba, pT = tAct;
            jugador.position.x += dx * avance * VELOCIDAD * dt;
            jugador.position.z += dz * avance * VELOCIDAD * dt;
            if (!ajustarAlCerro(jugador.position)) {    // pared invisible: vuelve donde estaba
                jugador.position.x = px; jugador.position.z = pz;
                arriba = pArriba; tAct = pT;
            }
        }

        if (mixer) {
            if (accionCaminar) {
                accionCaminar.paused = (avance === 0);
                accionCaminar.timeScale = avance * VELOCIDAD_ANIMACION;
            }
            mixer.update(dt);
            if (huesoCadera) bloquearCadera();
        }

        // cámara detrás del personaje (igual que el mundo principal)
        objCam.set(jugador.position.x - dx * DIST_CAM, jugador.position.y + ALTURA_CAM, jugador.position.z - dz * DIST_CAM);
        camera.position.lerp(objCam, 1 - Math.pow(0.001, dt));
        evitarCerro(camera.position);
        fondo.position.x = camera.position.x;
        fondo.position.z = camera.position.z;
        objMira.set(jugador.position.x, jugador.position.y + 2.5, jugador.position.z);
        mira.lerp(objMira, 1 - Math.pow(0.002, dt));
        camera.lookAt(mira);

        // parada más cercana
        let mejor = null, mejorDist = RADIO_INFO, masCerca = 0, distMin = Infinity;
        estaciones.forEach(function (est, i) {
            const dm = Math.hypot(jugador.position.x - est.puntoInfo.x, jugador.position.z - est.puntoInfo.z);
            if (dm < mejorDist) { mejor = est; mejorDist = dm; }
            if (dm < distMin) { distMin = dm; masCerca = i; }
        });
        if (mejor !== cercano) {
            cercano = mejor;
            if (abierto && abierto !== cercano) cerrarInfo();   // te alejaste: la tarjeta se cierra sola
            mostrarAviso(cercano && abierto !== cercano);
        }
        botonesRuta.forEach(function (b, i) { if (b) b.classList.toggle('activo', i === masCerca); });

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