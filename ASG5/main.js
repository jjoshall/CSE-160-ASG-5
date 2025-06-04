import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MinMaxGUIHelper } from './camera.js';
import { ColorGUIHelper } from './ColorGUI.js';
import { modelDirection } from 'three/tsl';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;

// This is for checkerboard texture
const loader = new THREE.TextureLoader();
const texture = loader.load('ASG5/checkerboard.jpg');
texture.colorSpace = THREE.SRGBColorSpace;

// This is for the checkered cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
scene.add(ground);

// This is for the sphere
const geometry2 = new THREE.SphereGeometry(0.5, 32, 32);
const material2 = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
const sphere = new THREE.Mesh(geometry2, material2);
sphere.position.set(2, 0, 0);
scene.add(sphere);

// This is for the torus
const geometry3 = new THREE.TorusGeometry(0.5, 0.2, 8, 50);
const material3 = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true });
const torus = new THREE.Mesh(geometry3, material3);
torus.position.set(-2, 0, 0);
scene.add(torus);

// This is for the 3d model
const gltfLoader = new GLTFLoader();
gltfLoader.load('ASG5/shotgun.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-5, 1, -10);
    model.rotation.set(0, Math.PI / 2, 0);
    scene.add(model);
}, undefined, function (error) {
    console.error('An error occurred while loading the GLTF model:', error);
});

camera.position.z = 5;

console.log("Hello, World!");
//console.log(gltf.scene);

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
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function updateCamera() {
    camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 100, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 100, 0.1).name('far').onChange(updateCamera);
gui.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('Directional Light Color');
gui.add(directionalLight, 'intensity',0, 5, 0.01);
gui.addColor(new ColorGUIHelper(spotlight, 'color'), 'value').name('Spotlight Color');
gui.add(spotlight, 'intensity', 10, 50, 0.01);
// gui.addColor(new ColorGUIHelper(hemisphereLight, 'skyColor'), 'value').name('Hemisphere Sky Color');
// gui.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('Hemisphere Ground Color');
// gui.add(hemisphereLight, 'intensity', 0, 5, 0.01).name('Hemisphere Intensity');