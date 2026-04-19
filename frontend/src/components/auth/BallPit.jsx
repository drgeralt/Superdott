import { useEffect, useRef } from 'react';
import {
    Vector3,
    MeshPhysicalMaterial,
    InstancedMesh,
    Clock,
    AmbientLight,
    SphereGeometry,
    ShaderChunk,
    Scene,
    Color,
    Object3D,
    SRGBColorSpace,
    MathUtils,
    PMREMGenerator,
    Vector2,
    WebGLRenderer,
    PerspectiveCamera,
    PointLight,
    ACESFilmicToneMapping,
    Plane,
    Raycaster
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class CustomRenderer {
    #options; canvas; camera; cameraMinAspect; cameraMaxAspect; cameraFov;
    maxPixelRatio; minPixelRatio; scene; renderer; #postprocessing;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#internalRender;
    onBeforeRender = () => { };
    onAfterRender = () => { };
    onAfterResize = () => { };
    #isIntersecting = false; #isAnimating = false; isDisposed = false; #intersectionObserver; #resizeObserver; #resizeTimeout; #clock = new Clock();
    #timeData = { elapsed: 0, delta: 0 }; #animationFrameId;

    constructor(options) {
        this.#options = { ...options };
        this.#initCamera();
        this.#initScene();
        this.#initRenderer();
        this.resize();
        this.#initEvents();
    }
    #initCamera() {
        this.camera = new PerspectiveCamera();
        this.cameraFov = this.camera.fov;
    }
    #initScene() {
        this.scene = new Scene();
    }
    #initRenderer() {
        if (this.#options.canvas) {
            this.canvas = this.#options.canvas;
        } else if (this.#options.id) {
            this.canvas = document.getElementById(this.#options.id);
        } else {
            console.error('Three: Missing canvas or id parameter');
        }
        this.canvas.style.display = 'block';
        const opts = {
            canvas: this.canvas,
            powerPreference: 'high-performance',
            ...(this.#options.rendererOptions ?? {})
        };
        this.renderer = new WebGLRenderer(opts);
        this.renderer.outputColorSpace = SRGBColorSpace;
    }
    #initEvents() {
        if (!(this.#options.size instanceof Object)) {
            window.addEventListener('resize', this.#debouncedResize.bind(this));
            if (this.#options.size === 'parent' && this.canvas.parentNode) {
                this.#resizeObserver = new ResizeObserver(this.#debouncedResize.bind(this));
                this.#resizeObserver.observe(this.canvas.parentNode);
            }
        }
        this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection.bind(this), { root: null, rootMargin: '0px', threshold: 0 });
        this.#intersectionObserver.observe(this.canvas);
        document.addEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
    }
    #removeEvents() {
        window.removeEventListener('resize', this.#debouncedResize.bind(this));
        this.#resizeObserver?.disconnect();
        this.#intersectionObserver?.disconnect();
        document.removeEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
    }
    #handleIntersection(entries) {
        this.#isIntersecting = entries[0].isIntersecting;
        this.#isIntersecting ? this.#startAnimation() : this.#stopAnimation();
    }
    #handleVisibilityChange() {
        if (this.#isIntersecting) {
            document.hidden ? this.#stopAnimation() : this.#startAnimation();
        }
    }
    #debouncedResize() {
        if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
    }
    resize() {
        let w, h;
        if (this.#options.size instanceof Object) {
            w = this.#options.size.width;
            h = this.#options.size.height;
        } else if (this.#options.size === 'parent' && this.canvas.parentNode) {
            w = this.canvas.parentNode.offsetWidth;
            h = this.canvas.parentNode.offsetHeight;
        } else {
            w = window.innerWidth;
            h = window.innerHeight;
        }
        this.size.width = w;
        this.size.height = h;
        this.size.ratio = w / h;
        this.#updateCamera();
        this.#updateRendererSize();
        this.onAfterResize(this.size);
    }
    #updateCamera() {
        this.camera.aspect = this.size.width / this.size.height;
        if (this.camera.isPerspectiveCamera && this.cameraFov) {
            if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
                this.#adjustFov(this.cameraMinAspect);
            } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
                this.#adjustFov(this.cameraMaxAspect);
            } else {
                this.camera.fov = this.cameraFov;
            }
        }
        this.camera.updateProjectionMatrix();
        this.updateWorldSize();
    }
    #adjustFov(aspect) {
        const tan = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect);
        this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(tan));
    }
    updateWorldSize() {
        if (this.camera.isPerspectiveCamera) {
            const fovRad = (this.camera.fov * Math.PI) / 180;
            this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
            this.size.wWidth = this.size.wHeight * this.camera.aspect;
        } else if (this.camera.isOrthographicCamera) {
            this.size.wHeight = this.camera.top - this.camera.bottom;
            this.size.wWidth = this.camera.right - this.camera.left;
        }
    }
    #updateRendererSize() {
        this.renderer.setSize(this.size.width, this.size.height);
        this.#postprocessing?.setSize(this.size.width, this.size.height);
        let pr = window.devicePixelRatio;
        if (this.maxPixelRatio && pr > this.maxPixelRatio) {
            pr = this.maxPixelRatio;
        } else if (this.minPixelRatio && pr < this.minPixelRatio) {
            pr = this.minPixelRatio;
        }
        this.renderer.setPixelRatio(pr);
        this.size.pixelRatio = pr;
    }
    get postprocessing() { return this.#postprocessing; }
    set postprocessing(val) {
        this.#postprocessing = val;
        this.render = val.render.bind(val);
    }
    #startAnimation() {
        if (this.#isAnimating) return;
        const animate = () => {
            this.#animationFrameId = requestAnimationFrame(animate);
            this.#timeData.delta = this.#clock.getDelta();
            this.#timeData.elapsed += this.#timeData.delta;
            this.onBeforeRender(this.#timeData);
            this.render();
            this.onAfterRender(this.#timeData);
        };
        this.#isAnimating = true;
        this.#clock.start();
        animate();
    }
    #stopAnimation() {
        if (this.#isAnimating) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#isAnimating = false;
            this.#clock.stop();
        }
    }
    #internalRender() {
        this.renderer.render(this.scene, this.camera);
    }
    clear() {
        this.scene.traverse(obj => {
            if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
                Object.keys(obj.material).forEach(key => {
                    const matProp = obj.material[key];
                    if (matProp !== null && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
                        matProp.dispose();
                    }
                });
                obj.material.dispose();
                obj.geometry.dispose();
            }
        });
        this.scene.clear();
    }
    dispose() {
        this.#removeEvents();
        this.#stopAnimation();
        this.clear();
        this.#postprocessing?.dispose();
        this.renderer.dispose();
        this.isDisposed = true;
    }
}

const interactionMap = new Map();
const mousePos = new Vector2();
let isInteractionInitialized = false;

function setupInteraction(options) {
    const config = {
        position: new Vector2(), nPosition: new Vector2(), hover: false, touching: false,
        onEnter() { }, onMove() { }, onClick() { }, onLeave() { }, ...options
    };
    (function (element, cfg) {
        if (!interactionMap.has(element)) {
            interactionMap.set(element, cfg);
            if (!isInteractionInitialized) {
                document.body.addEventListener('pointermove', onPointerMove);
                document.body.addEventListener('pointerleave', onPointerLeave);
                document.body.addEventListener('click', onClick);
                document.body.addEventListener('touchstart', onTouchStart, { passive: false });
                document.body.addEventListener('touchmove', onTouchMove, { passive: false });
                document.body.addEventListener('touchend', onTouchEnd, { passive: false });
                document.body.addEventListener('touchcancel', onTouchEnd, { passive: false });
                isInteractionInitialized = true;
            }
        }
    })(options.domElement, config);

    config.dispose = () => {
        const element = options.domElement;
        interactionMap.delete(element);
        if (interactionMap.size === 0) {
            document.body.removeEventListener('pointermove', onPointerMove);
            document.body.removeEventListener('pointerleave', onPointerLeave);
            document.body.removeEventListener('click', onClick);
            document.body.removeEventListener('touchstart', onTouchStart);
            document.body.removeEventListener('touchmove', onTouchMove);
            document.body.removeEventListener('touchend', onTouchEnd);
            document.body.removeEventListener('touchcancel', onTouchEnd);
            isInteractionInitialized = false;
        }
    };
    return config;
}

function onPointerMove(e) { mousePos.x = e.clientX; mousePos.y = e.clientY; processInteraction(); }
function processInteraction() {
    for (const [elem, cfg] of interactionMap) {
        const rect = elem.getBoundingClientRect();
        if (isInsideRect(rect)) {
            updatePositions(cfg, rect);
            if (!cfg.hover) { cfg.hover = true; cfg.onEnter(cfg); }
            cfg.onMove(cfg);
        } else if (cfg.hover && !cfg.touching) {
            cfg.hover = false; cfg.onLeave(cfg);
        }
    }
}
function onClick(e) {
    mousePos.x = e.clientX; mousePos.y = e.clientY;
    for (const [elem, cfg] of interactionMap) {
        const rect = elem.getBoundingClientRect();
        updatePositions(cfg, rect);
        if (isInsideRect(rect)) cfg.onClick(cfg);
    }
}
function onPointerLeave() {
    for (const cfg of interactionMap.values()) {
        if (cfg.hover) { cfg.hover = false; cfg.onLeave(cfg); }
    }
}
function onTouchStart(e) {
    if (e.touches.length > 0) {
        e.preventDefault();
        mousePos.x = e.touches[0].clientX; mousePos.y = e.touches[0].clientY;
        for (const [elem, cfg] of interactionMap) {
            const rect = elem.getBoundingClientRect();
            if (isInsideRect(rect)) {
                cfg.touching = true; updatePositions(cfg, rect);
                if (!cfg.hover) { cfg.hover = true; cfg.onEnter(cfg); }
                cfg.onMove(cfg);
            }
        }
    }
}
function onTouchMove(e) {
    if (e.touches.length > 0) {
        e.preventDefault();
        mousePos.x = e.touches[0].clientX; mousePos.y = e.touches[0].clientY;
        for (const [elem, cfg] of interactionMap) {
            const rect = elem.getBoundingClientRect();
            updatePositions(cfg, rect);
            if (isInsideRect(rect)) {
                if (!cfg.hover) { cfg.hover = true; cfg.touching = true; cfg.onEnter(cfg); }
                cfg.onMove(cfg);
            } else if (cfg.hover && cfg.touching) {
                cfg.onMove(cfg);
            }
        }
    }
}
function onTouchEnd() {
    for (const [, cfg] of interactionMap) {
        if (cfg.touching) {
            cfg.touching = false;
            if (cfg.hover) { cfg.hover = false; cfg.onLeave(cfg); }
        }
    }
}
function updatePositions(cfg, rect) {
    const { position: pos, nPosition: nPos } = cfg;
    pos.x = mousePos.x - rect.left; pos.y = mousePos.y - rect.top;
    nPos.x = (pos.x / rect.width) * 2 - 1; nPos.y = (-pos.y / rect.height) * 2 + 1;
}
function isInsideRect(rect) {
    const { x, y } = mousePos;
    const { left, top, width, height } = rect;
    return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const vec1 = new Vector3(); const vec2 = new Vector3(); const vec3 = new Vector3(); const vec4 = new Vector3();
const vec5 = new Vector3(); const vec6 = new Vector3(); const vec7 = new Vector3(); const vec8 = new Vector3();
const vec9 = new Vector3(); const vec10 = new Vector3();

class PhysicsEngine {
    constructor(config) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count).fill(0);
        this.velocityData = new Float32Array(3 * config.count).fill(0);
        this.sizeData = new Float32Array(config.count).fill(1);
        this.center = new Vector3();
        this.#initPositions();
        this.setSizes();
    }
    #initPositions() {
        const { config, positionData } = this;
        this.center.toArray(positionData, 0);
        for (let i = 1; i < config.count; i++) {
            const offset = 3 * i;
            positionData[offset] = randFloatSpread(2 * config.maxX);
            positionData[offset + 1] = randFloatSpread(2 * config.maxY);
            positionData[offset + 2] = randFloatSpread(2 * config.maxZ);
        }
    }
    setSizes() {
        const { config, sizeData } = this;
        sizeData[0] = config.size0;
        for (let i = 1; i < config.count; i++) {
            sizeData[i] = randFloat(config.minSize, config.maxSize);
        }
    }
    update(timeData) {
        const { config, center, positionData, sizeData, velocityData } = this;
        let startIdx = 0;
        if (config.controlSphere0) {
            startIdx = 1;
            vec1.fromArray(positionData, 0);
            vec1.lerp(center, 0.1).toArray(positionData, 0);
            vec4.set(0, 0, 0).toArray(velocityData, 0);
        }
        for (let idx = startIdx; idx < config.count; idx++) {
            const base = 3 * idx;
            vec2.fromArray(positionData, base); vec5.fromArray(velocityData, base);
            vec5.y -= timeData.delta * config.gravity * sizeData[idx];
            vec5.multiplyScalar(config.friction); vec5.clampLength(0, config.maxVelocity);
            vec2.add(vec5); vec2.toArray(positionData, base); vec5.toArray(velocityData, base);
        }
        for (let idx = startIdx; idx < config.count; idx++) {
            const base = 3 * idx;
            vec2.fromArray(positionData, base); vec5.fromArray(velocityData, base);
            const radius = sizeData[idx];
            for (let jdx = idx + 1; jdx < config.count; jdx++) {
                const otherBase = 3 * jdx;
                vec3.fromArray(positionData, otherBase); vec6.fromArray(velocityData, otherBase);
                const otherRadius = sizeData[jdx];
                vec7.copy(vec3).sub(vec2);
                const dist = vec7.length();
                const sumRadius = radius + otherRadius;
                if (dist < sumRadius) {
                    const overlap = sumRadius - dist;
                    vec8.copy(vec7).normalize().multiplyScalar(0.5 * overlap);
                    vec9.copy(vec8).multiplyScalar(Math.max(vec5.length(), 1));
                    vec10.copy(vec8).multiplyScalar(Math.max(vec6.length(), 1));
                    vec2.sub(vec8); vec5.sub(vec9);
                    vec2.toArray(positionData, base); vec5.toArray(velocityData, base);
                    vec3.add(vec8); vec6.add(vec10);
                    vec3.toArray(positionData, otherBase); vec6.toArray(velocityData, otherBase);
                }
            }
            if (config.controlSphere0) {
                vec7.copy(vec1).sub(vec2);
                const dist = vec7.length();
                const sumRadius0 = radius + sizeData[0];
                if (dist < sumRadius0) {
                    const diff = sumRadius0 - dist;
                    vec8.copy(vec7.normalize()).multiplyScalar(diff);
                    vec9.copy(vec8).multiplyScalar(Math.max(vec5.length(), 2));
                    vec2.sub(vec8); vec5.sub(vec9);
                }
            }
            if (Math.abs(vec2.x) + radius > config.maxX) {
                vec2.x = Math.sign(vec2.x) * (config.maxX - radius);
                vec5.x = -vec5.x * config.wallBounce;
            }
            if (config.gravity === 0) {
                if (Math.abs(vec2.y) + radius > config.maxY) {
                    vec2.y = Math.sign(vec2.y) * (config.maxY - radius); vec5.y = -vec5.y * config.wallBounce;
                }
            } else if (vec2.y - radius < -config.maxY) {
                vec2.y = -config.maxY + radius; vec5.y = -vec5.y * config.wallBounce;
            }
            const maxBoundary = Math.max(config.maxZ, config.maxSize);
            if (Math.abs(vec2.z) + radius > maxBoundary) {
                vec2.z = Math.sign(vec2.z) * (config.maxZ - radius); vec5.z = -vec5.z * config.wallBounce;
            }
            vec2.toArray(positionData, base); vec5.toArray(velocityData, base);
        }
    }
}

class ScatteringMaterial extends MeshPhysicalMaterial {
    constructor(parameters) {
        super(parameters);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 }, thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 }, thicknessPower: { value: 2 }, thicknessScale: { value: 10 }
        };
        this.defines.USE_UV = '';
        this.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.fragmentShader = '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
            );
            const replacement = ShaderChunk.lights_fragment_begin.replaceAll(
                'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
            );
            shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', replacement);
            if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
        };
    }
}

const DEFAULT_CONFIG = {
    count: 200, colors: [0, 0, 0], ambientColor: 16777215, ambientIntensity: 1, lightIntensity: 200,
    materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 },
    minSize: 0.5, maxSize: 1, size0: 1, gravity: 0.5, friction: 0.9975, wallBounce: 0.95,
    maxVelocity: 0.15, maxX: 5, maxY: 5, maxZ: 2, controlSphere0: false, followCursor: true
};

const dummyObj = new Object3D();

class BallInstancedMesh extends InstancedMesh {
    constructor(renderer, customConfig = {}) {
        const config = { ...DEFAULT_CONFIG, ...customConfig };
        const pmremScene = new RoomEnvironment();
        const envMap = new PMREMGenerator(renderer, 0.04).fromScene(pmremScene).texture;
        const geometry = new SphereGeometry(1, 14, 14);
        const material = new ScatteringMaterial({ envMap: envMap, ...config.materialParams });
        super(geometry, material, config.count);
        this.config = config;
        this.physics = new PhysicsEngine(config);
        this.#initLights();
        this.setColors(config.colors);
    }
    #initLights() {
        this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
        this.add(this.ambientLight);
        this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
        this.add(this.light);
    }
    setColors(colorsArr) {
        if (Array.isArray(colorsArr) && colorsArr.length > 1) {
            const gradientGenerator = (function (colors) {
                let colorList = [];
                function setColors(cArr) {
                    colorList = [];
                    cArr.forEach(col => { colorList.push(new Color(col)); });
                }
                setColors(colors);
                return {
                    getColorAt: function (ratio, out = new Color()) {
                        const scaled = Math.max(0, Math.min(1, ratio)) * (colorList.length - 1);
                        const idx = Math.floor(scaled);
                        const start = colorList[idx];
                        if (idx >= colorList.length - 1) return start.clone();
                        const alpha = scaled - idx;
                        const end = colorList[idx + 1];
                        out.r = start.r + alpha * (end.r - start.r);
                        out.g = start.g + alpha * (end.g - start.g);
                        out.b = start.b + alpha * (end.b - start.b);
                        return out;
                    }
                };
            })(colorsArr);

            for (let idx = 0; idx < this.count; idx++) {
                this.setColorAt(idx, gradientGenerator.getColorAt(idx / this.count));
                if (idx === 0) { this.light.color.copy(gradientGenerator.getColorAt(idx / this.count)); }
            }
            this.instanceColor.needsUpdate = true;
        }
    }
    update(timeData) {
        this.physics.update(timeData);
        for (let idx = 0; idx < this.count; idx++) {
            dummyObj.position.fromArray(this.physics.positionData, 3 * idx);
            if (idx === 0 && this.config.followCursor === false) {
                dummyObj.scale.setScalar(0);
            } else {
                dummyObj.scale.setScalar(this.physics.sizeData[idx]);
            }
            dummyObj.updateMatrix();
            this.setMatrixAt(idx, dummyObj.matrix);
            if (idx === 0) this.light.position.copy(dummyObj.position);
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

function createBallpit(canvasElement, options = {}) {
    const rendererSystem = new CustomRenderer({ canvas: canvasElement, size: 'parent', rendererOptions: { antialias: true, alpha: true } });
    let meshInstance;
    rendererSystem.maxPixelRatio = 1.5;
    rendererSystem.renderer.toneMapping = ACESFilmicToneMapping;
    rendererSystem.camera.position.set(0, 0, 20);
    rendererSystem.camera.lookAt(0, 0, 0);
    rendererSystem.cameraMaxAspect = 1.5;
    rendererSystem.resize();
    initInstance(options);

    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersectPoint = new Vector3();
    let isPaused = false;

    canvasElement.style.touchAction = 'none';
    canvasElement.style.userSelect = 'none';
    canvasElement.style.webkitUserSelect = 'none';

    const interactionConfig = setupInteraction({
        domElement: canvasElement,
        onMove() {
            raycaster.setFromCamera(interactionConfig.nPosition, rendererSystem.camera);
            rendererSystem.camera.getWorldDirection(plane.normal);
            raycaster.ray.intersectPlane(plane, intersectPoint);
            meshInstance.physics.center.copy(intersectPoint);
            meshInstance.config.controlSphere0 = true;
        },
        onLeave() { meshInstance.config.controlSphere0 = false; }
    });

    function initInstance(cfg) {
        if (meshInstance) { rendererSystem.clear(); rendererSystem.scene.remove(meshInstance); }
        meshInstance = new BallInstancedMesh(rendererSystem.renderer, cfg);
        rendererSystem.scene.add(meshInstance);
    }

    rendererSystem.onBeforeRender = timeData => { if (!isPaused) meshInstance.update(timeData); };
    rendererSystem.onAfterResize = sizeData => {
        meshInstance.config.maxX = sizeData.wWidth / 2;
        meshInstance.config.maxY = sizeData.wHeight / 2;
    };

    return {
        three: rendererSystem,
        get spheres() { return meshInstance; },
        setCount(count) { initInstance({ ...meshInstance.config, count: count }); },
        togglePause() { isPaused = !isPaused; },
        dispose() { interactionConfig.dispose(); rendererSystem.dispose(); }
    };
}

const BallPit = ({ className = '', followCursor = true, ...props }) => {
    const canvasRef = useRef(null);
    const spheresInstanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });

        return () => {
            if (spheresInstanceRef.current) {
                spheresInstanceRef.current.dispose();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default BallPit;