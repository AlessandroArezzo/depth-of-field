var app = (function(){

        "use strict";

        var scene = new THREE.Scene(), // scena contenente tutti gli oggetti
            renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({ antialias: true })
                : new THREE.CanvasRenderer(),
            ambientLight = new THREE.AmbientLight(0xffffff, 1),
            pointRedLight = new THREE.PointLight(0xff0000, 10, 100),
            directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 ),
            spotLight = new THREE.SpotLight(0x3344FF, 3, 0, Math.PI /12),
            camera;

        function initScene() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio( window.devicePixelRatio );
            document.getElementById("webgl-container").appendChild(renderer.domElement);

            // Set camera
            camera = new THREE.PerspectiveCamera(
                75, // field of view
                window.innerWidth / window.innerHeight, // aspect ratio
                0.1, // near clipping plane
                1000 // far clipping plane
            );
            camera.position.set(0, 100, 620);

            // Set lights
            addLightToScene(ambientLight)
            addLightToScene(directionalLight, [0, 40, 500], true)
            addLightToScene(pointRedLight, [0, 120, 40], true)
            addLightToScene(spotLight, [0, 130, 600], true)

            // Set controls
            const controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target = new THREE.Vector3(-2.5, 3, -200);
            controls.update()

            // Set element of the scene
            addGLTFToScene("models/sci-fi_corridor/scene.gltf", [0,0, 0], [3, 3, 3])
            addGLTFToScene("models/darth_vader/scene.gltf",[0, 150, -15], [3, 3, 3])
            //addGLTFToScene("models/drone_futuriste/scene.gltf", [0,120, 310], [0.1, 0.1, 0.1])
            addGLTFToScene("models/yoda/scene.gltf",[0, 0, 490], [120, 120, 120],
                        0, 180, spotLight)

            render();
        }

        function addGLTFToScene(gltfPathFile, position, scale, xRotation= 0, yRotation=0,
                              spotLight = null){
            const object = new THREE.GLTFLoader();
            object.load(gltfPathFile,
                function ( gltf ) {
                    gltf.scene.position.set(position[0], position[1], position[2]);
                    gltf.scene.scale.set(scale[0], scale[1], scale[2]);
                    gltf.scene.rotation.x= xRotation
                    gltf.scene.rotation.y= yRotation
                    scene.add(gltf.scene);
                    if (spotLight) {
                        spotLight.target = gltf.scene;
                        scene.add(spotLight)
                        scene.add(spotLight.target)
                    }
                }, function ( error ) {
                    console.error( error );
                } );
        }

        function addLightToScene(light, position=null, castShadow=false) {
            if (position)
                light.position.set(position[0], position[1], position[2]);
            if (castShadow)
                light.castShadow = true
                /*
                    spotLight.shadow.mapSize.width = 1024;
                    spotLight.shadow.mapSize.height = 1024;

                    spotLight.shadow.camera.near = 500;
                    spotLight.shadow.camera.far = 4000;
                    spotLight.shadow.camera.fov = 30;
                    spotLight.shadow.camera.fov = 30;
                 */
            scene.add(light)
        }

        function render() {
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }

        window.onload = initScene;

        return {
            scene: scene
        }

})();


