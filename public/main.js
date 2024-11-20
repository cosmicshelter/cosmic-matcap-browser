import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

import CosmicTextureBrowser from './CosmicTextureBrowser';

let scene, renderer, camera;
let material, mesh;

setupRenderer()
setupScene()
setupMesh()
setupLights()

function setupRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'fixed';
}

function setupScene() {
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 3;
}

function setupMesh() {
  const texture = new THREE.TextureLoader().load('assets/512/png/ultra-realistic/02.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  
  material = new THREE.MeshMatcapMaterial({ matcap: texture});
  const model = new GLTFLoader().load('assets/models/model-sample.glb', (gltf) => {
    scene.add(gltf.scene);
    mesh = gltf.scene;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });
  })
}

function animate() {
  requestAnimationFrame(animate);

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

CosmicTextureBrowser.initFolder(material, {name: 'matcap'});
// you can also specify the uniform name if it's different from the default
// CosmicTextureBrowser.initFolder(material, {name: 'matcap', uniformName: 'uMatcapMap'});