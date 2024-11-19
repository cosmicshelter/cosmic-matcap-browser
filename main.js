import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import CosmicTextureBrowser from './CosmicTextureBrowser';

let scene, renderer, camera;
let geometry, material, mesh;

setupRenderer()
setupScene()
setupGeometry()
setupLights()

function setupRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function setupScene() {
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 5;
}

function setupGeometry() {
  geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
  material = new THREE.MeshMatcapMaterial({ matcap: new THREE.TextureLoader().load('512/ultra-realistic/02.webp') });
  mesh = new THREE.Mesh(geometry, material);
  
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}

function setupLights() {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);
animate();

CosmicTextureBrowser.initFolder(material, 'matcap');
// you can also specify the uniform name if it's different from the default
// CosmicTextureBrowser.initFolder(material, 'matcap', 'uMatcapMap');