import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MinMaxGUIHelper } from './camera.js';
import { ColorGUIHelper } from './ColorGUI.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer(
    { antialias: true, alpha: true }
);
renderer.useLegacyLights = false; // Disable legacy lights
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);

/// ChatGPT helped me with this skybox setup
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
    .setPath('ASG5/')
    .load('sky.hdr', function (hdrTexture) {
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

        scene.environment = envMap; // for reflective materials (MeshStandard, etc.)
        scene.background = envMap;  // optional: to use as skybox

        hdrTexture.dispose();
        pmremGenerator.dispose();
    });

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// This is for texture
const loader = new THREE.TextureLoader();
const texture = loader.load('ASG5/Minecraft-Magmacube.jpg');
texture.colorSpace = THREE.SRGBColorSpace;

// This is for the textured center cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, -4);
scene.add(cube);

/// ChatGPT helped me with these performant cubes
const cubeCount = 5;
const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshStandardMaterial({ map: texture });

const instancedCubes = new THREE.InstancedMesh(cubeGeometry, cubeMaterial, cubeCount);
scene.add(instancedCubes);

const dummy = new THREE.Object3D();

for (let i = 0; i < cubeCount; i++) {
    dummy.position.set(
        i-2,
        Math.random() * 2 + 1, // Random height between 1 and 3
        Math.random() * 2 - 5 // Random position on the z-axis
    );
    dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
    );
    dummy.updateMatrix();
    instancedCubes.setMatrixAt(i, dummy.matrix);
}

// This is for the ground plane
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // changed to grass green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
scene.add(ground);

// This is for the 3d model
const gltfLoader = new GLTFLoader();
gltfLoader.load('ASG5/shotgun.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-1.2, .75, 1);
    model.rotation.set(90, Math.PI / -50, 0);
    model.scale.set(0.1, 0.1, 0.1); // Adjust scale as needed
    scene.add(model);
}, undefined, function (error) {
    console.error('An error occurred while loading the GLTF model:', error);
});

camera.position.z = 5;

const color = 0xFFFFFF; // white
const intensity = 1; // brightness of the light
const directionalLight = new THREE.DirectionalLight(color, intensity);
directionalLight.position.set(0, 5, 10);
directionalLight.castShadow = false;
scene.add(directionalLight);

const color1 = 0xFF0000; // red
const intensity1 = 30;
const spotlight = new THREE.SpotLight(color1, intensity1);
spotlight.castShadow = false;
spotlight.position.set(0, 5, 0);
spotlight.angle = Math.PI / 4;
spotlight.penumbra = 0.1;
spotlight.decay = 2;
spotlight.distance = 10;
scene.add(spotlight);

const skyColor = 0x87CEEB; // light blue
const groundColor = 0xB97A59; // brown
const intensity2 = 1;
const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
hemisphereLight.position.set(0, 5, 0);
scene.add(hemisphereLight);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    instancedCubes.rotation.y += 0.002;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function updateCamera() {
    camera.updateProjectionMatrix();
}

/// ChatGPT helped me with this low-poly person creation
function createLowPolyPerson() {
    const person = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // brown for the body
    const limbMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // gold for the limbs
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC }); // light skin tone for the head

    // cylinder for the body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8), bodyMaterial);
    body.position.y = 1;
    person.add(body);

    // sphere for the head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), headMaterial);
    head.position.y = 2.25;
    person.add(head);

    // left arm
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1, 8), limbMaterial);
    leftArm.position.set(-0.75, 1.5, 0);
    leftArm.rotation.z = Math.PI / 3;
    person.add(leftArm);

    // right arm
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.75;
    rightArm.rotation.z = -Math.PI / 3;
    person.add(rightArm);

    // left leg
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 6), limbMaterial);
    leftLeg.position.set(-0.3, 0, 0);
    person.add(leftLeg);

    // right leg
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    person.add(rightLeg);

    return person;
}

const person = createLowPolyPerson();
person.position.set(2, -1.5, 0);
person.rotation.y = Math.PI / 4; // Rotate to face the camera
scene.add(person);

const person2 = createLowPolyPerson();
person2.position.set(-2, -1.5, 0);
person2.rotation.y = -Math.PI / 4;
scene.add(person2);

/// ChatGPT helped me with this bow and arrow creation
function createSimpleBowAndArrow() {
    const bowAndArrow = new THREE.Group();

    const bowMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d1c });
    const stringMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    // Bow body (semi circle)
    const bow = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 6, 16, Math.PI), bowMaterial);
    bow.rotation.z = Math.PI / 2;
    bow.position.y = 1;
    bowAndArrow.add(bow);

    // Bowstring
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.4, 4), stringMaterial);
    string.position.y = 1;
    bowAndArrow.add(string);

    // Arrow shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6), arrowMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0, 1, 0);
    bowAndArrow.add(shaft);

    // Arrowhead
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 4), headMaterial);
    head.rotation.z = Math.PI / 2;
    head.position.set(-.75, 1, 0);
    bowAndArrow.add(head);

    return bowAndArrow;
}

const bowAndArrow = createSimpleBowAndArrow();
bowAndArrow.position.set(1.3, -1, 0);
bowAndArrow.rotation.y = -Math.PI / 2.5; // Rotate to face the camera
scene.add(bowAndArrow);

/// ChatGPT helped me with this GUI setup
const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 100, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far').onChange(updateCamera);
gui.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('Directional Light Color');
gui.add(directionalLight, 'intensity',0, 5, 0.01);
gui.addColor(new ColorGUIHelper(spotlight, 'color'), 'value').name('Spotlight Color');
gui.add(spotlight, 'intensity', 10, 50, 0.01);
gui.addColor(new ColorGUIHelper(hemisphereLight, 'color'), 'value').name('Hemisphere Sky Color');
gui.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('Hemisphere Ground Color');
gui.add(hemisphereLight, 'intensity', 0, 5, 0.01).name('Hemisphere Intensity');