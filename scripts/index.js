
function degrees_to_radians(degrees) {
    const pi = Math.PI;
    return degrees * (pi/180);
}

main()

function main() {

    const defaultCameraParameters = {
        focalDepth: 0.09,
        focalLength: 35,
        fstop: 5.6
    };

    // Set renderer
    var renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true})
            : new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.getElementById("webgl-container").appendChild(renderer.domElement);

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
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(-2.5, 3, -200);
    controls.update()
    //controls.minDistance = 100;
    //controls.maxDistance = 200;

    // init scene

    initScene();

    // launch animate function
    animate();

    function initScene(){

        // Set background
        const r_background = '/textures/cube/MilkyWay/';
        const urls_background = [ r_background + 'dark-s_px.jpg', r_background + 'dark-s_nx.jpg',
            r_background + 'dark-s_py.jpg', r_background + 'dark-s_ny.jpg',
            r_background + 'dark-s_pz.jpg', r_background + 'dark-s_nz.jpg' ];

        /*
        const r_background = '/textures/cube/skyboxsun25deg/'
        const urls_background = [ r_background + 'px.jpg', r_background + 'nx.jpg',
            r_background + 'py.jpg', r_background + 'ny.jpg',
            r_background + 'pz.jpg', r_background + 'nz.jpg' ];
        */

        const cubeTextureBackground = new THREE.CubeTextureLoader().load(urls_background);
        scene.background = cubeTextureBackground;

        // Set floor
        var floor = new THREE.Mesh( new THREE.PlaneGeometry( 100000, 100000, 1,
            1 ), new THREE.MeshBasicMaterial( { color: 0x0, side: THREE.DoubleSide } ) );
        floor.rotation.x = degrees_to_radians(90);
        scene.add( floor );

        // set camera position
        camera.position.set(720, 230, 500);

        // set ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        addLightToScene(ambientLight);

        // add element to the scene

        addPortalToScene(cubeTextureBackground, 300, -250);

        addPlanet();

        addGLTFToScene("models/fantasy_warped_terrain/scene.gltf", [0, 0, 0],
            [2000, 2000, 2000], 0, 0, false);

        addGLTFToScene("models/astro13_run/scene.gltf", [400, 55, 0],
            [0.2, 0.2, 0.2], degrees_to_radians(205));

        addGLTFToScene("models/astro13_jump/scene.gltf", [470, 55, -140],
            [20, 20, 20], degrees_to_radians(240));

        addGLTFToScene("models/alduin/scene.gltf", [600, 130, 300],
            [0.15, 0.15, 0.15], degrees_to_radians(120));

        addGLTFToScene("models/alduin/scene.gltf", [400, 250, 420],
            [0.07, 0.07, 0.07], degrees_to_radians(120));

        addGLTFToScene("models/rocket/scene.gltf", [850, 30, 500],
            [0.4, 0.4, 0.4]);

        addGLTFToScene("models/stage_light/scene.gltf", [850, 30, 400],
            [7,7,7,], degrees_to_radians(-90));

        const stageLight = new THREE.PointLight(0xffffff, 15, 70);
        addLightToScene(stageLight, [830, 60, 380], true, 0.1, 70)
    }

    function addPlanet(){
        const textureLoader = new THREE.TextureLoader();

        const diffuse = textureLoader.load( '/textures/planet/rough_plasterbrick_05_diff_2k.jpg' );
        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.repeat.x = 10;
        diffuse.repeat.y = 10;

        const roughness = textureLoader.load( '/textures/planet/rough_plasterbrick_05_rough_2k.exr' );
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

        //scene.add( new THREE.CameraHelper( stageSpotLight.shadow.camera ) );

        //spotLightHelper = new THREE.SpotLightHelper( stageSpotLight );
        //scene.add( spotLightHelper );
        //addLightToScene(planetLight, [-100, 450, 350], true);
    }


    function addPortalToScene(cubeTextureBackground, xPos, zPos){
        const r_portal = '/textures/cube/portal_map/';
        const urls_portal = [ r_portal + 'px.png', r_portal + 'nx.png',
            r_portal + 'py.png', r_portal + 'ny.png',
            r_portal + 'pz.png', r_portal + 'nz.png' ];
        const cubeTexturePortal = new THREE.CubeTextureLoader().load(urls_portal);

        // set portal
        const portal = new THREE.Mesh( new THREE.CircleGeometry( 100, 100 ),
            new THREE.MeshBasicMaterial( { envMap: cubeTexturePortal } ) );
        portal.position.set(xPos,160,-250);
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
            side: THREE.DoubleSide, vertexColors: true, transparent: true,
            emissive: 0xaaaaaa, emissiveIntensity: 0.05
        } );
        const square = new THREE.Mesh( squareGeometry, squareMaterial );
        square.name = "square";
        square.position.set(xPos, 380, zPos)
        scene.add( square );

        // set circle of monkeys over the portal
        const loader2 = new THREE.BufferGeometryLoader();
        loader2.load( '/models/suzanne_buffergeometry.json', function ( monkeyGeometry ) {
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
        new THREE.TextureLoader().load( '/textures/planets/earth_atmos_2048.jpg', function ( texture ) {
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


    function addGLTFToScene(gltfPathFile, position, scale, yRotation = 0, xRotation = 0,
                            castShadow=true, receiveShadow=true) {
        const object = new THREE.GLTFLoader();
        object.load(gltfPathFile,
            function (gltf) {
                gltf.scene.position.set(position[0], position[1], position[2]);
                gltf.scene.scale.set(scale[0], scale[1], scale[2]);
                gltf.scene.rotation.x = xRotation
                gltf.scene.rotation.y = yRotation
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


    function animate() {
        //spotLightHelper.update();
        renderer.render(scene, camera);
        sceneToRender();
        requestAnimationFrame(animate);
    }

    function sceneToRender() {

        // update controls
        controls.update();
        // Rotate planet
        const planet = scene.getObjectByName( "planet" );
        planet.rotation.x +=0.002
        planet.rotation.y +=0.002

        //rotate square of triangles
        const square = scene.getObjectByName( "square" );
        const time = Date.now() * 0.001;
        square.rotation.x = time * 0.025;
        square.rotation.y = time * 0.05;

    }


}



