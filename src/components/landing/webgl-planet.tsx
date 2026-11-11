"use client";

import React, { useEffect, useRef } from "react";

export function WebGLPlanet() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;
    let animId: number | null = null;
    let resizeListener: (() => void) | null = null;

    // Load Three.js r0.143.0 and dependencies dynamically in browser
    async function initPlanet() {
      try {
        const loadModule = (url: string) => {
          // Dynamic ESM import in browser
          const importer = new Function("u", "return import(u)");
          return importer(url);
        };

        const THREE = await loadModule("https://unpkg.com/three@0.143.0/build/three.module.js");
        const { EffectComposer } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/postprocessing/EffectComposer.js");
        const { RenderPass } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/postprocessing/RenderPass.js");
        const { UnrealBloomPass } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/postprocessing/UnrealBloomPass.js");
        const { ShaderPass } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/postprocessing/ShaderPass.js");
        const { GammaCorrectionShader } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/shaders/GammaCorrectionShader.js");
        const { CopyShader } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/shaders/CopyShader.js");
        const { GLTFLoader } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/loaders/GLTFLoader.js");
        const { DRACOLoader } = await loadModule("https://unpkg.com/three@0.143.0/examples/jsm/loaders/DRACOLoader.js");

        if (isDisposed || !canvas) return;

        const CONFIG = {
          rimColor: "#c1faff", rimPower: 2.4, nightLights: 10, terrainDepth: 0.33, terrainShade: 1.3,
          oceanGlint: 0.45, oceanDeep: 0.12, oceanFlow: 3, oceanFlowSpeed: 0.8, oceanFlowScale: 2.1,
          glowColor: "#3a6cff", glowIntensity: 3.35, planetRadius: 1.95, spin: 0.03, initRotation: 2.07,
          tilt: 0.37, autoRotate: 0,
          cloud1Height: 1.005, cloud1Opacity: 0.6, cloud1Spin: 0.06,
          cloud2Height: 1.03, cloud2Opacity: 0.5, cloud2Spin: 0.14,
          cloud3Height: 1.075, cloud3Opacity: 0.5, cloud3Spin: 0.1,
          bgColor: "#040a1e", flameColor: "#3a6cff", flameColor2: "#c1faff", flameAmt: 0.15,
          atmoColor: "#9fc4ff", atmoCount: 320, atmoSize: 22, atmoSpeed: 0.8,
          starColor: "#cfe0ff", starCount: 1400, starSize: 1.6, starFlicker: 1,
          markerColor: "#ffd27a", markerCount: 60, markerSize: 16, markerSpeed: 0.5,
        };

        const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

        const Lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
        function hexToVec3(hex: string) {
          const c = new THREE.Color(hex);
          return new THREE.Vector3(c.r, c.g, c.b);
        }
        function sample(stops: Array<{ p: number; v: number }>, p: number) {
          if (p <= stops[0].p) return stops[0].v;
          if (p >= stops[stops.length - 1].p) return stops[stops.length - 1].v;
          for (let i = 0; i < stops.length - 1; i++) {
            const s0 = stops[i], s1 = stops[i + 1];
            if (p >= s0.p && p <= s1.p) {
              const t = (p - s0.p) / (s1.p - s0.p);
              const st = t * t * (3 - 2 * t);
              return Lerp(s0.v, s1.v, st);
            }
          }
          return stops[0].v;
        }

        const SNOISE = `
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        `;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const renderer = new THREE.WebGL1Renderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
        camera.position.set(0, 0, 8);
        camera.layers.enable(LAYERS.TORUS_SCENE);
        camera.layers.enable(LAYERS.BLOOM_SCENE);
        camera.layers.enable(LAYERS.ENTIRE_SCENE);
        scene.add(camera);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
        ambientLight.layers.set(LAYERS.ENTIRE_SCENE);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 2);
        directionalLight.layers.set(LAYERS.ENTIRE_SCENE);
        scene.add(directionalLight);

        // Composers
        const torusComposer = new EffectComposer(renderer);
        torusComposer.renderToScreen = false;
        torusComposer.addPass(new RenderPass(scene, camera));
        torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
        torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.22, 0.2, 0));
        torusComposer.addPass(new ShaderPass(CopyShader));

        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(new RenderPass(scene, camera));
        bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.6, 0));
        bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

        const FinalPass = {
          uniforms: {
            iTime: { value: 0 },
            tDiffuse: { value: null },
            torusTexture: { value: null },
            bloomTexture: { value: null },
            haloTexture: { value: null },
            uBg: { value: hexToVec3(CONFIG.bgColor) },
            uFlameA: { value: hexToVec3(CONFIG.flameColor) },
            uFlameB: { value: hexToVec3(CONFIG.flameColor2) },
            uFlameAmt: { value: CONFIG.flameAmt },
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
          fragmentShader: `
            uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
            uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
            varying vec2 vUv;
            vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
              pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
              pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
              pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
              return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
            void main(){
              vec2 uv = 2.*vUv - 1.;
              vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
              vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
              flame *= smoothstep(0.25, 1., abs(uv.y));
              float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
              vec3 bg = uBg * (1.0 - 0.4 * length(uv));
              vec3 halo = texture2D(haloTexture, vUv).xyz;
              gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
            }`,
        };

        const finalPass = new ShaderPass(FinalPass);
        finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
        finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

        const finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(new RenderPass(scene, camera));
        finalComposer.addPass(finalPass);

        const STOPS_X = [{ p: 0, v: 0 }, { p: 0.32, v: -3.1 }, { p: 0.64, v: 3.2 }, { p: 1, v: 0 }];
        const STOPS_Y = [{ p: 0, v: -4.5 }, { p: 0.32, v: 0.55 }, { p: 0.64, v: 0.45 }, { p: 1, v: 0.15 }];
        const STOPS_S = [{ p: 0, v: 2.15 }, { p: 0.32, v: 1.0 }, { p: 0.64, v: 0.92 }, { p: 1, v: 1.12 }];

        const worldGroup = new THREE.Group();
        const planetGroup = new THREE.Group();
        planetGroup.rotation.z = CONFIG.tilt;

        const cloudGroup = new THREE.Group();
        cloudGroup.rotation.z = CONFIG.tilt;
        cloudGroup.visible = false;

        worldGroup.add(planetGroup);
        worldGroup.add(cloudGroup);
        scene.add(worldGroup);

        worldGroup.position.set(STOPS_X[0].v, STOPS_Y[0].v, 0);
        worldGroup.scale.setScalar(STOPS_S[0].v);

        // Halo glow
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uGlow: { value: hexToVec3(CONFIG.glowColor) },
            uIntensity: { value: CONFIG.glowIntensity }
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `
            uniform vec3 uGlow; uniform float uIntensity; varying vec2 vUv;
            void main(){
              float d = length(vUv - 0.5) * 2.0;
              float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
              gl_FragColor = vec4(uGlow * a * uIntensity, a);
            }
          `
        });
        const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMat);
        glowMesh.scale.setScalar(CONFIG.planetRadius * 2.3);
        glowMesh.layers.set(LAYERS.ENTIRE_SCENE);
        worldGroup.add(glowMesh);

        // Clouds
        let cloudTime = 0;
        const cloudTexture = new THREE.TextureLoader().load(
          "https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-clouds.png"
        );
        cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
        cloudTexture.repeat.set(5, 5);

        const cloudLayers = [
          { h: CONFIG.cloud1Height, o: CONFIG.cloud1Opacity, s: CONFIG.cloud1Spin, ry: 0.0, phase: 0.0 },
          { h: CONFIG.cloud2Height, o: CONFIG.cloud2Opacity, s: CONFIG.cloud2Spin, ry: 2.2, phase: 13.0 },
          { h: CONFIG.cloud3Height, o: CONFIG.cloud3Opacity, s: CONFIG.cloud3Spin, ry: 4.3, phase: 27.0 }
        ];
        const cloudMeshes: Array<{ mesh: any; spin: number }> = [];

        cloudLayers.forEach((layer) => {
          const geo = new THREE.SphereGeometry(CONFIG.planetRadius * layer.h, 64, 64);
          const mat = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            depthWrite: false
          });
          mat.onBeforeCompile = (shader: any) => {
            shader.uniforms.uTime = { get value() { return cloudTime; } };
            shader.uniforms.noiseScale = { value: 20 };
            shader.uniforms.uSpeedX = { value: 1 };
            shader.uniforms.uSpeedY = { value: 2 };
            shader.uniforms.uSpeedZ = { value: 2 };
            shader.uniforms.uOpacity = { value: layer.o };
            shader.uniforms.uPhase = { value: layer.phase };

            shader.vertexShader = `varying vec2 vCloudUv;\n` + shader.vertexShader.replace(
              "void main() {",
              "void main() { vCloudUv = uv;"
            );

            shader.fragmentShader = `
              uniform float uTime;
              uniform float noiseScale;
              uniform float uSpeedX, uSpeedY, uSpeedZ;
              uniform float uOpacity;
              uniform float uPhase;
              varying vec2 vCloudUv;
              ${SNOISE}
            ` + shader.fragmentShader.replace(
              "#include <dithering_fragment>",
              `
              #include <dithering_fragment>
              gl_FragColor.rgb = vec3(1.0);
              float cloudNoise = snoise(vec3(vCloudUv.x * noiseScale + uTime * uSpeedX + uPhase, vCloudUv.y * noiseScale - uTime * uSpeedY + uPhase, uTime * uSpeedZ + uPhase));
              float cloudNdv = max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
              float cloudEdge = pow(1.0 - cloudNdv, 3.0);
              float cloudMod = mix(cloudNoise, 1.0, cloudEdge);
              float cloudNdl = dot(normalize(vNormal), normalize(vec3(-0.9, 0.18, 0.4)));
              float cloudDay = 1.0 - smoothstep(0.30, -0.30, cloudNdl) * 0.9;
              gl_FragColor.a *= cloudMod * uOpacity * cloudDay;
              `
            );
          };

          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.y = layer.ry;
          mesh.renderOrder = 2;
          mesh.layers.set(LAYERS.ENTIRE_SCENE);
          cloudGroup.add(mesh);
          cloudMeshes.push({ mesh, spin: layer.s });
        });

        // Ambient motes
        const motesGeo = new THREE.BufferGeometry();
        const motesPos = [];
        const motesSizes = [];
        const motesSeeds = [];
        for (let i = 0; i < CONFIG.atmoCount; i++) {
          motesPos.push((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
          motesSizes.push(CONFIG.atmoSize * (0.4 + Math.random()));
          motesSeeds.push(Math.random() * 100);
        }
        motesGeo.setAttribute("position", new THREE.Float32BufferAttribute(motesPos, 3));
        motesGeo.setAttribute("size", new THREE.Float32BufferAttribute(motesSizes, 1));
        motesGeo.setAttribute("seed", new THREE.Float32BufferAttribute(motesSeeds, 1));

        const motesMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uRes: { value: new THREE.Vector2(width, height) },
            uColor: { value: hexToVec3(CONFIG.atmoColor) }
          },
          vertexShader: `
            attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
            varying float vA;
            vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
              p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
              p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
              return cos(p+vec3(1,2,4)); }
            void main(){
              vec3 v = position*4.0 + warp(position, uTime)*1.2;
              vec4 mv = modelViewMatrix * vec4(v, 1.0);
              float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
              vA = farF * nearF;
              gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uColor; varying float vA;
            void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
              float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.55); }
          `
        });
        const motesPoints = new THREE.Points(motesGeo, motesMat);
        motesPoints.layers.set(LAYERS.ENTIRE_SCENE);
        scene.add(motesPoints);

        // Starfield
        let starTime = 0;
        const starGeo = new THREE.BufferGeometry();
        const starPos = [];
        const starSeeds = [];
        const starBrights = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 90.0;
          const sinPhi = Math.sin(phi);
          starPos.push(r * sinPhi * Math.cos(theta), r * sinPhi * Math.sin(theta), r * Math.cos(phi));
          starSeeds.push(Math.random() * 100);
          starBrights.push(0.35 + Math.random() * 0.65);
        }
        starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
        starGeo.setAttribute("seed", new THREE.Float32BufferAttribute(starSeeds, 1));
        starGeo.setAttribute("bright", new THREE.Float32BufferAttribute(starBrights, 1));

        const starMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { get value() { return starTime; } },
            uSize: { value: CONFIG.starSize },
            uFlicker: { value: CONFIG.starFlicker },
            uColor: { value: hexToVec3(CONFIG.starColor) },
            uRes: { value: new THREE.Vector2(width, height) }
          },
          vertexShader: `
            attribute float seed; attribute float bright;
            uniform float uTime; uniform float uSize; uniform float uFlicker; uniform vec2 uRes;
            varying float vTw;
            void main(){
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              float tw = 0.6 + 0.4 * sin(uTime * uFlicker + seed);
              vTw = bright * tw;
              gl_PointSize = max(uSize * uRes.y / 900.0 * (90.0 / max(-mv.z, 1.0)), 1.0);
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uColor; varying float vTw;
            void main(){
              vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
              float core = smoothstep(0.5, 0.0, l);
              gl_FragColor = vec4(uColor, core * vTw);
            }
          `
        });
        const starPoints = new THREE.Points(starGeo, starMat);
        starPoints.frustumCulled = false;
        starPoints.layers.set(LAYERS.ENTIRE_SCENE);
        scene.add(starPoints);

        // Planet & Markers
        let planetMesh: any = null;
        let planetTime = 0;
        let markerTime = 0;
        let entryProgress = 0;
        let entryActive = false;
        const ENTRY_DUR = 1.9;
        const ENTRY_START_Y = -6.5;

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load(
          "https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-lights.glb",
          (lightsGltf: any) => {
            let nightTex: any = null;
            lightsGltf.scene.traverse((child: any) => {
              if (child.isMesh && child.material && child.material.map && !nightTex) {
                nightTex = child.material.map;
              }
            });

            gltfLoader.load(
              "https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet.glb",
              (planetGltf: any) => {
                if (isDisposed) return;
                planetGltf.scene.traverse((child: any) => {
                  if (child.isMesh && !planetMesh) {
                    planetMesh = child;
                  }
                });

                if (!planetMesh) return;

                planetMesh.geometry.computeBoundingSphere();
                const currentRadius = planetMesh.geometry.boundingSphere.radius;
                const scaleFactor = CONFIG.planetRadius / currentRadius;
                planetMesh.scale.setScalar(scaleFactor);

                const baseMat = planetMesh.material.clone();
                baseMat.metalness = 0;
                baseMat.roughness = 1;
                baseMat.envMapIntensity = 0;

                baseMat.onBeforeCompile = (shader: any) => {
                  shader.uniforms.time = { get value() { return planetTime; } };
                  shader.uniforms.noiseScale = { value: 30 };
                  shader.uniforms.speedX = { value: 1.5 };
                  shader.uniforms.speedY = { value: 2.0 };
                  shader.uniforms.speedZ = { value: 2.5 };
                  shader.uniforms.rimColor = { value: hexToVec3(CONFIG.rimColor) };
                  shader.uniforms.rimPower = { value: CONFIG.rimPower };
                  shader.uniforms.nightBlendTexture = { value: nightTex };
                  shader.uniforms.nightLights = { value: CONFIG.nightLights };
                  shader.uniforms.terrainDepth = { value: CONFIG.terrainDepth };
                  shader.uniforms.terrainShade = { value: CONFIG.terrainShade };
                  shader.uniforms.oceanGlint = { value: CONFIG.oceanGlint };
                  shader.uniforms.oceanDeep = { value: CONFIG.oceanDeep };
                  shader.uniforms.oceanFlow = { value: CONFIG.oceanFlow };
                  shader.uniforms.oceanFlowSpeed = { value: CONFIG.oceanFlowSpeed };
                  shader.uniforms.oceanFlowScale = { value: CONFIG.oceanFlowScale };

                  shader.vertexShader = `varying vec2 vCustomUv;\n` + shader.vertexShader.replace(
                    "void main() {",
                    "void main() { vCustomUv = uv;"
                  );

                  shader.fragmentShader = `
                    uniform float time;
                    uniform float noiseScale;
                    uniform float speedX, speedY, speedZ;
                    uniform vec3 rimColor;
                    uniform float rimPower;
                    uniform sampler2D nightBlendTexture;
                    uniform float nightLights;
                    uniform float terrainDepth;
                    uniform float terrainShade;
                    uniform float oceanGlint;
                    uniform float oceanDeep;
                    uniform float oceanFlow;
                    uniform float oceanFlowSpeed;
                    uniform float oceanFlowScale;
                    varying vec2 vCustomUv;
                    ${SNOISE}
                  ` + shader.fragmentShader.replace(
                    "#include <dithering_fragment>",
                    `
                    #include <dithering_fragment>
                    vec3 normalizedNormal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    float rim = 1.0 - max(dot(viewDir, normalizedNormal), 0.0);
                    rim = pow(rim, rimPower); rim = pow(rim, 1.5); rim *= 0.7;
                    vec3 currentColor = gl_FragColor.rgb;
                    float blueDom = currentColor.b - max(currentColor.r, currentColor.g);
                    float waterMask = clamp(smoothstep(-0.005, 0.03, blueDom), 0.0, 1.0);
                    float shimmer = snoise(vec3(vCustomUv.x * noiseScale + time * speedX, vCustomUv.y * noiseScale - time * speedY, time * speedZ));
                    gl_FragColor.rgb += waterMask * shimmer * 0.025;
                    float fT = time * oceanFlowSpeed * 4.0;
                    float fS = 4.0 * oceanFlowScale;
                    float warp = snoise(vec3(vCustomUv.x * fS - fT * 0.5, vCustomUv.y * fS + fT * 0.4, fT * 0.5));
                    float flow = snoise(vec3(vCustomUv.x * fS * 2.0 + fT * 0.6 + warp, vCustomUv.y * fS * 2.0 - fT * 0.5, fT * 0.7));
                    flow = warp * 0.6 + flow * 0.4;
                    gl_FragColor.rgb += waterMask * flow * 0.12 * oceanFlow;
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.01, 0.06, 0.16), waterMask * oceanDeep);
                    vec3 finalColor = mix(gl_FragColor.rgb, rimColor, rim);
                    gl_FragColor = vec4(finalColor, 1.0);
                    vec3 surfPos = -vViewPosition;
                    float terrH = dot(texture2D(map, vCustomUv).rgb, vec3(0.299, 0.587, 0.114));
                    vec3 sigX = dFdx(surfPos), sigY = dFdy(surfPos);
                    vec3 vR1 = cross(sigY, normalizedNormal), vR2 = cross(normalizedNormal, sigX);
                    float fDet = dot(sigX, vR1);
                    vec3 vGrad = sign(fDet) * (dFdx(terrH) * vR1 + dFdy(terrH) * vR2);
                    vec3 bumpedNormal = normalize(abs(fDet) * normalizedNormal - terrainDepth * vGrad);
                    vec3 shadeNormal = mix(bumpedNormal, normalizedNormal, waterMask);
                    vec3 cityLights = texture2D(nightBlendTexture, vCustomUv).rgb * gl_FragColor.rgb * nightLights;
                    vec3 viewSunDir = normalize(vec3(-0.9, 0.18, 0.4));
                    float ndl = dot(normalizedNormal, viewSunDir);
                    float dayAmt = smoothstep(-0.05, 0.35, ndl);
                    float relief = dot(shadeNormal, viewSunDir) - ndl;
                    gl_FragColor.rgb *= clamp(1.0 + relief * terrainShade * dayAmt, 0.55, 1.6);
                    float nightFactor  = smoothstep(0.18, -0.30, ndl);
                    float lightsFactor = smoothstep(0.30, -0.35, ndl);
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.08, nightFactor);
                    gl_FragColor.rgb += cityLights * lightsFactor;
                    vec3 halfDir = normalize(viewSunDir + viewDir);
                    float ripple = snoise(vec3(vCustomUv * 240.0, time * 4.0));
                    float ndh = max(dot(normalizedNormal, halfDir) + ripple * 0.02, 0.0);
                    float glint = pow(ndh, 140.0);
                    gl_FragColor.rgb += glint * waterMask * dayAmt * oceanGlint * vec3(1.0, 0.97, 0.88);
                    `
                  );
                };

                planetMesh.material = baseMat;
                planetMesh.layers.set(LAYERS.ENTIRE_SCENE);
                planetGroup.add(planetMesh);
                cloudGroup.visible = true;
                entryActive = true;

                // Sample land markers
                if (planetMesh.material && planetMesh.material.map && planetMesh.material.map.image) {
                  try {
                    const img = planetMesh.material.map.image;
                    const canvasSample = document.createElement("canvas");
                    const ctx = canvasSample.getContext("2d");
                    if (ctx) {
                      canvasSample.width = img.width || 512;
                      canvasSample.height = img.height || 256;
                      ctx.drawImage(img, 0, 0, canvasSample.width, canvasSample.height);
                      const imgData = ctx.getImageData(0, 0, canvasSample.width, canvasSample.height).data;

                      const geo = planetMesh.geometry.toNonIndexed();
                      const posAttr = geo.attributes.position;
                      const uvAttr = geo.attributes.uv;
                      const triCount = posAttr.count / 3;

                      const areas: number[] = [];
                      let totalArea = 0;
                      const pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
                      const vAB = new THREE.Vector3(), vAC = new THREE.Vector3();

                      for (let i = 0; i < triCount; i++) {
                        pA.fromBufferAttribute(posAttr, i * 3);
                        pB.fromBufferAttribute(posAttr, i * 3 + 1);
                        pC.fromBufferAttribute(posAttr, i * 3 + 2);
                        vAB.subVectors(pB, pA);
                        vAC.subVectors(pC, pA);
                        const area = vAB.cross(vAC).length() * 0.5;
                        totalArea += area;
                        areas.push(totalArea);
                      }

                      const markerPositions: number[] = [];
                      const markerSeeds: number[] = [];
                      let gathered = 0;
                      let attempts = 0;

                      while (gathered < CONFIG.markerCount && attempts < 5000) {
                        attempts++;
                        const target = Math.random() * totalArea;
                        let low = 0, high = triCount - 1, triIdx = 0;
                        while (low <= high) {
                          const mid = (low + high) >> 1;
                          if (areas[mid] >= target) {
                            triIdx = mid;
                            high = mid - 1;
                          } else {
                            low = mid + 1;
                          }
                        }

                        let r1 = Math.random(), r2 = Math.random();
                        if (r1 + r2 > 1.0) { r1 = 1.0 - r1; r2 = 1.0 - r2; }
                        const r3 = 1.0 - r1 - r2;

                        const uA = new THREE.Vector2().fromBufferAttribute(uvAttr, triIdx * 3);
                        const uB = new THREE.Vector2().fromBufferAttribute(uvAttr, triIdx * 3 + 1);
                        const uC = new THREE.Vector2().fromBufferAttribute(uvAttr, triIdx * 3 + 2);
                        const uvSample = new THREE.Vector2(
                          uA.x * r3 + uB.x * r1 + uC.x * r2,
                          uA.y * r3 + uB.y * r1 + uC.y * r2
                        );

                        const px = Math.floor(uvSample.x * canvasSample.width) % canvasSample.width;
                        const py = Math.floor((1.0 - uvSample.y) * canvasSample.height) % canvasSample.height;
                        const pIdx = (py * canvasSample.width + px) * 4;
                        const cr = imgData[pIdx], cg = imgData[pIdx + 1], cb = imgData[pIdx + 2];

                        if (cb > cr + 6 && cb > cg + 6) continue;

                        pA.fromBufferAttribute(posAttr, triIdx * 3);
                        pB.fromBufferAttribute(posAttr, triIdx * 3 + 1);
                        pC.fromBufferAttribute(posAttr, triIdx * 3 + 2);
                        const markerPos = new THREE.Vector3(
                          pA.x * r3 + pB.x * r1 + pC.x * r2,
                          pA.y * r3 + pB.y * r1 + pC.y * r2,
                          pA.z * r3 + pB.z * r1 + pC.z * r2
                        );
                        markerPos.multiplyScalar(1.012);

                        markerPositions.push(markerPos.x, markerPos.y, markerPos.z);
                        markerSeeds.push(Math.random() * 100);
                        gathered++;
                      }

                      if (markerPositions.length > 0) {
                        const markerGeo = new THREE.BufferGeometry();
                        markerGeo.setAttribute("position", new THREE.Float32BufferAttribute(markerPositions, 3));
                        markerGeo.setAttribute("seed", new THREE.Float32BufferAttribute(markerSeeds, 1));

                        const markerMat = new THREE.ShaderMaterial({
                          transparent: true,
                          depthTest: true,
                          depthWrite: false,
                          blending: THREE.AdditiveBlending,
                          uniforms: {
                            uTime: { get value() { return markerTime; } },
                            uColor: { value: hexToVec3(CONFIG.markerColor) },
                            uSize: { value: CONFIG.markerSize },
                            uSpeed: { value: CONFIG.markerSpeed },
                            uRes: { value: new THREE.Vector2(width, height) }
                          },
                          vertexShader: `
                            attribute float seed; uniform float uSize; uniform vec2 uRes;
                            varying float vSeed; varying float vFade;
                            void main(){
                              vSeed = seed;
                              vec4 mv = modelViewMatrix * vec4(position, 1.0);
                              vec3 vn = normalize(normalMatrix * normalize(position));
                              vec3 vd = normalize(-mv.xyz);
                              vFade = smoothstep(0.15, 0.5, dot(vn, vd));
                              gl_PointSize = max(uSize * uRes.y / 900.0 * (7.0 / max(-mv.z, 1.0)), 2.0);
                              gl_Position = projectionMatrix * mv;
                            }
                          `,
                          fragmentShader: `
                            uniform vec3 uColor; uniform float uTime; uniform float uSpeed;
                            varying float vSeed; varying float vFade;
                            void main(){
                              if (vFade <= 0.001) discard;
                              vec2 p = gl_PointCoord - 0.5;
                              float d = length(p) * 2.0;
                              if (d > 1.0) discard;
                              float core = smoothstep(0.30, 0.0, d) * 1.2;
                              float ph = fract(uTime * uSpeed + vSeed);
                              float ring = smoothstep(0.07, 0.0, abs(d - ph)) * (1.0 - ph);
                              gl_FragColor = vec4(uColor, clamp(core + ring, 0.0, 1.0) * vFade);
                            }
                          `
                        });
                        const markersMesh = new THREE.Points(markerGeo, markerMat);
                        markersMesh.layers.set(LAYERS.ENTIRE_SCENE);
                        planetMesh.add(markersMesh);
                      }
                    }
                  } catch (e) {
                    console.warn("Marker sampling skipped:", e);
                  }
                }
              }
            );
          }
        );

        let curP = 0;
        let curX = STOPS_X[0].v;
        let curY = STOPS_Y[0].v;
        let curS = STOPS_S[0].v;
        let spinPhase = 0;
        let lastTime = performance.now();

        function renderLoop(now: number) {
          if (isDisposed) return;
          animId = requestAnimationFrame(renderLoop);
          const dt = Math.min((now - lastTime) / 1000, 0.05);
          lastTime = now;

          planetTime += dt / 12;
          cloudTime += dt / 20;
          starTime += dt;
          markerTime += dt;

          const scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const pTarget = clamp(scrollY / scrollMax, 0, 1);
          curP += (pTarget - curP) * Math.min(1, dt * 4.5);

          const sideScale = clamp(window.innerWidth / 1200, 0.5, 1.0);
          const targetX = sample(STOPS_X, curP) * sideScale;
          const targetY = sample(STOPS_Y, curP);
          const targetS = sample(STOPS_S, curP);

          const k = Math.min(1, dt * 3.2);
          curX += (targetX - curX) * k;
          curY += (targetY - curY) * k;
          curS += (targetS - curS) * k;

          let entryY = 0;
          if (entryActive) {
            entryProgress += dt / ENTRY_DUR;
            if (entryProgress >= 1.0) {
              entryProgress = 1.0;
              entryActive = false;
            }
            const eased = 1.0 - Math.pow(1.0 - entryProgress, 3);
            entryY = ENTRY_START_Y * (1.0 - eased);
          }

          worldGroup.position.set(curX, curY + entryY, 0);
          worldGroup.scale.setScalar(curS);

          spinPhase += dt * CONFIG.spin;
          planetGroup.rotation.y = CONFIG.initRotation + spinPhase + curP * Math.PI * 1.6;

          cloudMeshes.forEach(item => {
            item.mesh.rotation.y += dt * item.spin;
          });

          motesMat.uniforms.uTime.value = now * 0.001 * CONFIG.atmoSpeed * 8.0;
          motesPoints.position.copy(camera.position);

          glowMesh.quaternion.copy(camera.quaternion);

          finalPass.uniforms.iTime.value = now * 0.001;

          camera.layers.set(LAYERS.TORUS_SCENE);
          torusComposer.render();

          camera.layers.set(LAYERS.BLOOM_SCENE);
          bloomComposer.render();

          camera.layers.set(LAYERS.ENTIRE_SCENE);
          finalComposer.render();
        }
        animId = requestAnimationFrame(renderLoop);

        resizeListener = () => {
          if (isDisposed) return;
          width = window.innerWidth;
          height = window.innerHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();

          const pixelRatio = Math.min(window.devicePixelRatio, 2);
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(width, height);

          torusComposer.setPixelRatio(pixelRatio);
          torusComposer.setSize(width, height);

          bloomComposer.setPixelRatio(pixelRatio);
          bloomComposer.setSize(width, height);

          finalComposer.setPixelRatio(pixelRatio);
          finalComposer.setSize(width, height);

          const res = new THREE.Vector2(width, height);
          motesMat.uniforms.uRes.value.copy(res);
          starMat.uniforms.uRes.value.copy(res);
        };
        window.addEventListener("resize", resizeListener);

      } catch (err) {
        console.warn("WebGL Planet initialization error:", err);
      }
    }

    initPlanet();

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      if (resizeListener) window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="planet-canvas" 
      id="planetCanvas" 
      aria-hidden="true" 
    />
  );
}
