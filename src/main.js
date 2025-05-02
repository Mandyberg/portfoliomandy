import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Loaders
const textureLoader = new THREE.TextureLoader();

//Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  First: {
    day:"/textures/World/Day/first_texture_set_day.webp",
    night:"/textures/World/Night/first_texture_set_night.webp",
  },
  Second: {
    day:"/textures/World/Day/second_texture_set_day.webp",
    night:"/textures/World/Night/second_texture_set_night.webp",
  },
  Third: {
    day:"/textures/World/Day/third_texture_set_day.webp",
    night:"/textures/World/Night/third_texture_set_night.webp",
  },
  Fourth: {
    day:"/textures/World/Day/fourth_texture_set_day.webp",
    night:"/textures/World/Night/fourth_texture_set_night.webp",
  },
};

const loadedTextures = {
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.night[key] = nightTexture;
});

loader.load("/models/Portfolio_Mandy_World_v2.glb", (glb)=>{

  glb.scene.traverse((child) => {
    if(child.isMesh){
      Object.keys(textureMap).forEach((key)=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;
          if(child.material.map){
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });
    }
  });
  scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  35, 
  sizes.width / sizes.height, 
  0.1, 
  1000 
);
camera.position.set(
  14.878830056186674, 
  4.817340198638351, 
  11.419435204022996
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
  -0.1292503276082901, 
  1.2583773474329245, 
  -0.33672136892309645
);

//Event Listeners
window.addEventListener("resize", ()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize( sizes.width, sizes.height );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ));
});

const render = () =>{
  controls.update();

  // console.log(camera.position);
  // console.log("0000000000000");
  // console.log(controls.target);

  
  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();