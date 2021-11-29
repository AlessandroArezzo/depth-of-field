import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader.js";
import {GUI} from "three/examples/jsm/libs/dat.gui.module.js";
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import vertexShader from "./VertexShader.glsl"
import cocShader from "./CoCFragmentShader.glsl"
import dofShader from "./DoFFragmentShader.glsl"
import {TWEEN} from "three/examples/jsm/libs/tween.module.min";
import Stats from "three/examples/jsm/libs/stats.module"
import {OrbitControls} from  "three/examples/jsm/controls/OrbitControls";
import px_background from "../textures/cube/MilkyWay/dark-s_px.jpg"
import nx_background from "../textures/cube/MilkyWay/dark-s_nx.jpg"
import py_background from "../textures/cube/MilkyWay/dark-s_py.jpg"
import ny_background from "../textures/cube/MilkyWay/dark-s_ny.jpg"
import pz_background from "../textures/cube/MilkyWay/dark-s_pz.jpg"
import nz_background from "../textures/cube/MilkyWay/dark-s_nz.jpg"
import px_portal from "../textures/cube/portal_map/px.png"
import nx_portal from "../textures/cube/portal_map/nx.png"
import py_portal from "../textures/cube/portal_map/py.png"
import ny_portal from "../textures/cube/portal_map/ny.png"
import pz_portal from "../textures/cube/portal_map/pz.png"
import nz_portal from "../textures/cube/portal_map/nz.png"

import earth_texture from "../textures/planets/earth_atmos_2048.jpg"
import diffuse_texture_planet from "../textures/planet/rough_plasterbrick_05_diff_2k.jpg"
import roughness_texture_planet from "../textures/planet/rough_plasterbrick_05_rough_2k.jpg"

import fantasy_warped_terrain from "../models/fantasy_warped_terrain/scene.gltf"
import astro_run from "../models/astro13_run/scene.gltf"
import astro_jump from "../models/astro13_jump/scene.gltf"
import alduin from "../models/alduin/scene.gltf"
import rocket from "../models/rocket/scene.gltf"
import stageLightObj from "../models/stage_light/scene.gltf"
import monkey from "../models/monkeys/suzanne_buffergeometry.json"

function degrees_to_radians(degrees) {
    const pi = Math.PI;
    return degrees * (pi/180);
}

function main() {

    const defaultCameraParameters = {
        focalDepth: 0.11,
        focalLength: 35,
        aperture: 6
    };

    // Set renderer
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // set scene
    var scene = new THREE.Scene(); // scena contenente tutti gli oggetti

    // Set camera
    var camera = new THREE.PerspectiveCamera(
        75, // field of view
        window.innerWidth / window.innerHeight, // aspect ratio
        0.1, // near clipping plane
        2500 // far clipping plane
    );

    // Set controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()

    // init scene

    initScene();
    controls.target = scene.getObjectByName( "portal" ).position;

    // init DoF shaders

    const basicTarget = getRenderTarget();

    const CoCShader = {
        vertexShader: vertexShader,
        fragmentShader: cocShader,
        uniforms: {
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            tDepth: { value: null },
            focalDepth: {value: defaultCameraParameters.focalDepth},
            focalLength: {value: defaultCameraParameters.focalLength},
            aperture: {value: defaultCameraParameters.aperture},
        },
    };

    const DoFShader = {
        vertexShader: vertexShader,
        fragmentShader: dofShader,
        uniforms: {
            tDiffuse: {value: null},
            tOriginal: {value: null},
            heightTex: {value: 1.0 / window.innerHeight.toFixed(1)},
            widthTex: {value: 1.0 / window.innerWidth.toFixed(1)},
            blurSize: {value: 3.0},
            applyEffect: {value: true},
        }
    };

    const antialiasingPass = new ShaderPass( FXAAShader );
    antialiasingPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    antialiasingPass.renderToScreen = true;

    const DoFComposer = new EffectComposer(renderer);
    const CoCPass = new ShaderPass( CoCShader )
    const DoFPass = new ShaderPass( DoFShader )
    DoFComposer.addPass( CoCPass );
    DoFComposer.addPass( DoFPass );
    DoFComposer.addPass(antialiasingPass);

    // init GUI

    let gui = new GUI();
    gui.width = 250;


    const guiControls = new function(){
        this.dofEnabled = true;
        this.pointOfView = "Free";
        this.target = "Portal";
    }
    {
        const sceneFolder = gui.addFolder("Scene");
        sceneFolder.add(guiControls, "pointOfView", ["Free", "Dragons", "Astronauts", "Planet",
            "Square", "Rocket"])
            .name("Point of View").onChange(function (){
                changePointOfView();
            }).listen();

        sceneFolder.add(guiControls, "target", ["Portal", "Dragons", "Astronauts", "Planet",
            "Square", "Rocket"])
            .name("Camera Target").onChange(function (){
                let target;
                if (guiControls.target === "Portal") {
                    target = scene.getObjectByName("portal").position;
                } else if (guiControls.target === "Dragons") {
                    target = new THREE.Vector3(472, 250, 289);
                } else if (guiControls.target === "Astronauts") {
                    target = new THREE.Vector3(453, 68, -54);
                } else if (guiControls.target === "Planet") {
                    target = scene.getObjectByName("planet").position;
                } else if (guiControls.target === "Square") {
                    target = scene.getObjectByName("square").position;
                } else if (guiControls.target === "Rocket") {
                    target = scene.getObjectByName("rocket").position;
                }
                changePointOfView(target);

        });
        sceneFolder.open();
    }

    function changePointOfView(targetPosition = null){
        const pointOfView = guiControls.pointOfView;
        const targetObject = guiControls.target;
        let newPos;
        if (pointOfView === "Dragons"){
            if(targetObject === "Portal" || targetObject === "Dragons")
                newPos= new THREE.Vector3( 552, 276, 507);
            else if (targetObject === "Astronauts")
                newPos= new THREE.Vector3( 363, 300, 436);
            else if (targetObject === "Planet")
                newPos= new THREE.Vector3( 656, 170, 224);
            else if (targetObject === "Square")
                newPos= new THREE.Vector3( 549, 227, 499);
            else if (targetObject === "Rocket")
                newPos= new THREE.Vector3( 372, 268, 391);
        }
        else if (pointOfView === "Astronauts"){
            if(targetObject === "Portal" || targetObject === "Astronauts")
                newPos= new THREE.Vector3( 538, 89, -15);
            else if (targetObject === "Dragons")
                newPos= new THREE.Vector3( 416, 26, -186);
            else if (targetObject === "Planet")
                newPos= new THREE.Vector3( 567, 49, -183);
            else if (targetObject === "Square")
                newPos= new THREE.Vector3( 500, 26, 25);
            else if (targetObject === "Rocket")
                newPos= new THREE.Vector3( 387, 73, -168);
        }
        else if (pointOfView === "Planet"){
            if(targetObject === "Portal" || targetObject === "Astronauts" || targetObject === "Square")
                newPos= new THREE.Vector3(49, 537, 620);
            else if (targetObject === "Planet" || targetObject === "Dragons" || targetObject === "Rocket")
                newPos= new THREE.Vector3( -89, 585, 308);
        }
        else if (pointOfView === "Square"){
            if(targetObject === "Portal")
                newPos= new THREE.Vector3( 128, 481, -91);
            else if (targetObject === "Dragons")
                newPos= new THREE.Vector3( 112, 355, -358);
            else if (targetObject === "Astronauts")
                newPos= new THREE.Vector3( 114, 452, -238);
            else if (targetObject === "Planet")
                newPos= new THREE.Vector3( 292, 441, -566);
            else if (targetObject === "Square")
                newPos= new THREE.Vector3( 391, 447, -554);
            else if (targetObject === "Rocket")
                newPos= new THREE.Vector3( 309, 536, -378);
        }
        else if (pointOfView === "Rocket"){
            if(targetObject === "Portal")
                newPos= new THREE.Vector3( 895, 125, 680);
            else if (targetObject === "Dragons")
                newPos= new THREE.Vector3( 917, 118, 701);
            else if (targetObject === "Astronauts")
                newPos= new THREE.Vector3( 865, 108, 649);
            else if (targetObject === "Planet")
                newPos= new THREE.Vector3( 1019, 66, 442);
            else if (targetObject === "Square")
                newPos= new THREE.Vector3( 888, 113, 681);
            else if (targetObject === "Rocket")
                newPos= new THREE.Vector3( 859, 175, 680);
        }
        new TWEEN.Tween(camera.position)
            .to(newPos, 2000)
            .onUpdate(() =>
                camera.position.set(camera.position.x,camera.position.y,camera.position.z)
            )
            .start().onComplete(() => {
                if (targetPosition) {
                    const startRotation = new THREE.Euler().copy(camera.rotation);
                    camera.lookAt(targetPosition);
                    const endRotation = new THREE.Euler().copy(camera.rotation);
                    camera.rotation.copy(startRotation);
                    new TWEEN.Tween(camera.rotation)
                        .to({x: endRotation.x, y: endRotation.y, z: endRotation.z}, 600)
                        .onUpdate(() =>
                            camera.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
                        )
                        .start().onComplete(() => {
                            controls.target = targetPosition;
                        }
                    )
                }
            }
        );
    }

    {
        const DofFolder = gui.addFolder("Depth Of Field");

        DofFolder.add(guiControls, "dofEnabled", "enabled").name("DoF enabled").listen().onChange(function (){
            const dofEnabled = guiControls.dofEnabled;
            DoFPass.uniforms.applyEffect = {value: dofEnabled};
            antialiasingPass.enabled = dofEnabled;
        });

        DofFolder.add(CoCPass.uniforms.focalDepth, 'value', 0, 1., defaultCameraParameters.focalDepth).step(0.001).name('focalDepth');
        DofFolder.add(CoCPass.uniforms.focalLength, 'value', 12., 100., defaultCameraParameters.focalLength).step(1.0).name('focalLength');
        DofFolder.add(CoCPass.uniforms.aperture, 'value', 1., 10., defaultCameraParameters.aperture).step(0.1).name('aperture');
        DofFolder.add(DoFPass.uniforms.blurSize, 'value', 1, 5., 3.).step(1,).name('blurSize');
        DofFolder.open();
    }
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // launch animate function
    animate();

    function initScene(){

        // Set background
        const urls_background = [ px_background, nx_background,
            py_background, ny_background,
            pz_background, nz_background ];

        const cubeTextureBackground = new THREE.CubeTextureLoader().load(urls_background);
        scene.background = cubeTextureBackground;

        // Set floor
        var floor = new THREE.Mesh( new THREE.PlaneGeometry( 100000, 100000, 1,
            1 ), new THREE.MeshBasicMaterial( { color: 0x0, side: THREE.DoubleSide } ) );
        floor.rotation.x = degrees_to_radians(90);
        floor.position.y = -15;
        scene.add( floor );

        // set camera position
        camera.position.set(720, 230, 500);

        // set ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        addLightToScene(ambientLight);

        addPortalToScene(cubeTextureBackground, 300, -250);

        addPlanet();

        addGLTFToScene(fantasy_warped_terrain, [0, 0, 0],
            [2000, 2000, 2000], 0, 0, false);

        addGLTFToScene(astro_run, [400, 55, 0],
            [0.2, 0.2, 0.2], degrees_to_radians(205));

        addGLTFToScene(astro_jump, [470, 46, -140],
            [20, 20, 20], degrees_to_radians(240));

        addGLTFToScene(alduin, [600, 130, 300],
            [0.15, 0.15, 0.15], degrees_to_radians(120));

        addGLTFToScene(alduin, [400, 250, 420],
            [0.07, 0.07, 0.07], degrees_to_radians(120));

        addGLTFToScene(rocket, [850, 30, 500],
            [0.4, 0.4, 0.4]);

        addGLTFToScene(stageLightObj, [850, 30, 400],
            [7,7,7,], degrees_to_radians(-90), 0, true,
            true, "rocket");

        const stageLight = new THREE.PointLight(0xffffff, 15, 70);
        addLightToScene(stageLight, [830, 60, 380], true, 0.1, 70);
    }

    function addPlanet(){
        const textureLoader = new THREE.TextureLoader();

        const diffuse = textureLoader.load( diffuse_texture_planet );
        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.repeat.x = 10;
        diffuse.repeat.y = 10;

        const roughness = textureLoader.load( roughness_texture_planet );
        roughness.wrapS = THREE.RepeatWrapping;
        roughness.wrapT = THREE.RepeatWrapping;

        const planetMaterial = new THREE.MeshPhysicalMaterial( {
            color: 0x8FCBFF,
            map: diffuse,
            roughness: roughness,
            reflectivity:0,
            emissiveIntensity:0.6,
            emissive: 0x8FCBFF
        } );

        const planetGeometry = new THREE.SphereGeometry(100, 64, 32)
        const planet = new THREE.Mesh( planetGeometry, planetMaterial );
        planet.name = "planet";
        planet.receiveShadow = true;
        planet.castShadow = false;
        planet.position.set(-50, 450, 450);
        scene.add( planet );

        const planetLight = new THREE.PointLight(0x8FCBFF, 27, 1700);
        addLightToScene(planetLight, null, true, 0.1, 1700,
            2, null, 0.8, planet)

        planet.add(planetLight);

        const stageSpotLight = new THREE.SpotLight( 0xDEFDFF, 1 , 0, Math.PI / 28);
        addLightToScene(stageSpotLight, [830, 60, 380], true, 0.1, 1300,
            3, planet)
    }


    function addPortalToScene(cubeTextureBackground, xPos, zPos){
        const urls_portal = [ px_portal, nx_portal,
            py_portal, ny_portal,
            pz_portal, nz_portal ];
        const cubeTexturePortal = new THREE.CubeTextureLoader().load(urls_portal);

        // set portal
        const portal = new THREE.Mesh( new THREE.CircleGeometry( 100, 100 ),
            new THREE.MeshBasicMaterial( { envMap: cubeTexturePortal } ) );
        portal.position.set(xPos,160, zPos);
        portal.name = "portal";
        scene.add( portal );

        // set particles around the portal
        function randomPointInSphere( radius, xPos, yPos ) {
            const x = THREE.Math.randFloat( -1, 1 );
            const y = THREE.Math.randFloat( -1, 1 );
            const normalizationFactor = 1 / Math.sqrt( x * x + y * y );

            const v = new THREE.Vector3();
            v.x = x * normalizationFactor * THREE.Math.randFloat( 0.5 * radius, 0.6 * radius ) + xPos;
            v.y = y * normalizationFactor *  THREE.Math.randFloat( 0.5 * radius, 0.6 * radius ) +yPos;
            v.z = 0;

            return v;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesPositions = [];
        for (let i = 0; i < 300000; i ++ ) {
            const vertex = randomPointInSphere( 200, xPos, 130 );
            particlesPositions.push( vertex.x, vertex.y, 0 );
        }

        particlesGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( particlesPositions, 3 ) );
        const particlesMaterial = new THREE.PointsMaterial( { color: 0xffffff, size: 0.2} );
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add( particles );
        particles.position.z = zPos;
        particles.position.y = 30;

        // set square of triangles over the portal
        // (code from 'https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_uint.html')
        const triangles = 10000;

        const squareGeometry = new THREE.BufferGeometry();

        const positions = [];
        const normals = [];
        const colors = [];

        const color = new THREE.Color();

        const n = 100, n2 = n / 2;
        const d = 3, d2 = d / 2;

        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        for ( let i = 0; i < triangles; i ++ ) {

            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;

            const ax = x + Math.random() * d - d2;
            const ay = y + Math.random() * d - d2;
            const az = z + Math.random() * d - d2;

            const bx = x + Math.random() * d - d2;
            const by = y + Math.random() * d - d2;
            const bz = z + Math.random() * d - d2;

            const cx = x + Math.random() * d - d2;
            const cy = y + Math.random() * d - d2;
            const cz = z + Math.random() * d - d2;

            positions.push( ax, ay, az );
            positions.push( bx, by, bz );
            positions.push( cx, cy, cz );

            pA.set( ax, ay, az );
            pB.set( bx, by, bz );
            pC.set( cx, cy, cz );

            cb.subVectors( pC, pB );
            ab.subVectors( pA, pB );
            cb.cross( ab );

            cb.normalize();

            const nx = cb.x;
            const ny = cb.y;
            const nz = cb.z;

            normals.push( nx, ny, nz );
            normals.push( nx, ny, nz );
            normals.push( nx, ny, nz );

            const vx = ( x / n ) + 0.5;
            const vy = ( y / n ) + 0.5;
            const vz = ( z / n ) + 0.5;

            color.setRGB( vx, vy, vz );

            const alpha = Math.random();

            colors.push( color.r, color.g, color.b, alpha );
            colors.push( color.r, color.g, color.b, alpha );
            colors.push( color.r, color.g, color.b, alpha );
        }
        function disposeArray() {
            this.array = null;
        }
        squareGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
        squareGeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
        squareGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 4 ).onUpload( disposeArray ) );
        squareGeometry.computeBoundingSphere();
        const squareMaterial = new THREE.MeshPhongMaterial( {
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            side: THREE.DoubleSide, vertexColors: true, transparent: false,
            emissive: 0xaaaaaa, emissiveIntensity: 0.05
        } );
        const square = new THREE.Mesh( squareGeometry, squareMaterial );
        square.name = "square";
        square.position.set(xPos, 380, zPos)
        scene.add( square );

        // set circle of monkeys over the portal
        // (code from 'https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_dof2.html')
        const loader2 = new THREE.BufferGeometryLoader();
        loader2.load( monkey, function ( monkeyGeometry ) {
            monkeyGeometry.computeVertexNormals();
            const monkeyMaterial = new THREE.MeshPhongMaterial( {
                envMap: cubeTextureBackground, color:0xffffff,
                refractionRatio: 0.5, reflectivity: 0.98 , combine: THREE.MultiplyOperation,
                emissive: 0xffffff, emissiveIntensity: 0.9
            } );
            const n_monkeys = 10;

            for ( let i = 0; i < n_monkeys; i ++ ) {

                const monkey = new THREE.Mesh( monkeyGeometry, monkeyMaterial );

                monkey.position.z = Math.cos( i / n_monkeys * Math.PI * 2 ) * 200;
                monkey.position.y = Math.sin( i / n_monkeys * Math.PI * 3 ) * 20;
                monkey.position.x = Math.sin( i / n_monkeys * Math.PI * 2 ) * 200;

                monkey.rotation.y = i / n_monkeys * Math.PI * 2;

                monkey.position.x += xPos
                monkey.position.y += 380
                monkey.position.z += zPos

                monkey.scale.setScalar( 20 );

                scene.add( monkey );

            }

        } );

        // set earth over the portal
        new THREE.TextureLoader().load( earth_texture, function ( texture ) {
            let earthMaterial = new THREE.MeshPhysicalMaterial({
                    roughness: 0.5,
                    map: texture,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.1
                }
            );
            let earthGeometry = new THREE.SphereGeometry(30, 60, 60);

            let earth = new THREE.Mesh(earthGeometry, earthMaterial);
            earth.position.set(300, 380, -250);
            scene.add( earth );

            const earthLight = new THREE.PointLight(0xffffff, 15, 1700);
            addLightToScene(earthLight, null, true, 0.1, 1700,
                null, null, 7, earth)
            });

    }


    function addGLTFToScene(gltfObject, position, scale, yRotation = 0, xRotation = 0,
                            castShadow=true, receiveShadow=true, name =null) {
        const object = new GLTFLoader();
        object.load(gltfObject,
            function (gltf) {
                gltf.scene.position.set(position[0], position[1], position[2]);
                gltf.scene.scale.set(scale[0], scale[1], scale[2]);
                gltf.scene.rotation.x = xRotation;
                gltf.scene.rotation.y = yRotation;
                if (name)
                    gltf.scene.name = name;
                gltf.scene.traverse( function( node ) {
                    if ( node.isMesh ) {
                        node.castShadow = castShadow;
                        node.receiveShadow = receiveShadow;
                    }
                } );
                scene.add(gltf.scene);
            }, function (error) {
                console.error(error);
            });
    }

    function addLightToScene(light, position = null, castShadow = false, shadowNear=null,
                             shadowFar=null, shadowRadius=null, target=null, decay=null,
                             objectToAppend=null) {
        if (position)
            light.position.set(position[0], position[1], position[2]);
        if (castShadow)
            light.castShadow = true
        if (shadowNear)
            light.shadow.camera.near = shadowNear;
        if (shadowFar)
            light.shadow.camera.far = shadowFar;
        if (shadowRadius)
            light.shadow.radius = shadowRadius;
        if (decay)
            light.decay = decay;
        if (target) {
            light.target = target;
            scene.add(light)
            scene.add(light.target)
        }
        else if (objectToAppend){
            objectToAppend.add(light);
        }
        else
            scene.add(light)
    }

    function getRenderTarget() {
        let target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        target.texture.format = THREE.RGBFormat;
        target.texture.encoding = THREE.sRGBEncoding;
        target.texture.minFilter = THREE.NearestFilter;
        target.texture.magFilter = THREE.NearestFilter;
        target.texture.generateMipmaps = false;
        target.stencilBuffer = false;
        target.depthBuffer = true;
        target.depthTexture = new THREE.DepthTexture();
        target.depthTexture.format = THREE.DepthFormat;
        target.depthTexture.type = THREE.UnsignedIntType;
        return target;
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        renderer.setRenderTarget(basicTarget);
        renderer.render(scene, camera);
        sceneToRender();
    }

    function sceneToRender() {

        // update controls
        controls.update();
        stats.update();

        // Rotate planet
        const planet = scene.getObjectByName( "planet" );
        planet.rotation.x +=0.002
        planet.rotation.y +=0.002

        //rotate square of triangles
        const square = scene.getObjectByName( "square" );
        const time = Date.now() * 0.001;
        square.rotation.x = time * 0.025;
        square.rotation.y = time * 0.05;

        // apply DoF effect
        CoCPass.uniforms.tDepth.value = basicTarget.depthTexture;
        DoFPass.uniforms.tOriginal.value = basicTarget.texture;
        DoFComposer.render();
    }
}

main();



