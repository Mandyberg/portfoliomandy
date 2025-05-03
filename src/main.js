import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
};

document.querySelectorAll(".modal-exit-button").forEach(button=>{
  button.addEventListener("click" , (e)=>{
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const showModal = (modal) => {
  modal.style.display = "block"

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

const zAxisHowl = []
const yAxisHowl = []
const xAxisHowl = []

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
  "Linked": "https://www.linkedin.com/in/mandy-van-den-berg/", 
  "Insta" : "https://www.instagram.com/mandyvanden_berg/",
  "Mail" : "mailto:info@mandyvandenberg.com",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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

window.addEventListener("mousemove", (e)=> {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", (e)=> {
  if (currentIntersects.length> 0){
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if(object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Button_My_Work")) {
      showModal(modals.work);
    }else if (object.name.includes("Button_About")) {
      showModal(modals.about);
    }
  }
});

loader.load("/models/Portfolio_Mandy_World_v4.glb", (glb)=>{

  glb.scene.traverse((child) => {
    if(child.isMesh){
      
      if (child.name.includes("_Raycaster")) {
      raycasterObjects.push(child);
    }

      Object.keys(textureMap).forEach((key)=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if (child.name.includes("Howls")) {
            if (child.name.includes("Howls")
            ){
          zAxisHowl.push(child);
          }
        }

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

// onderstaande state machine - code verbeterd met Chat GPT

let howlState = "waiting"; // 'waiting' → 'rotating' → 'jumping' → 'waiting' ...
let stateTimer = 0;

const waitDuration = 400;    // frames dat hij stilstaat (~2 sec bij 60fps)
const rotateDuration = 190;  // frames dat hij rechts draait
const jumpDuration = 60;     // frames waarin hij vloeiend 45 graden terugdraait

let jumpStart = 0;
let jumpTarget = 0;

const render = () => {
  controls.update();

  zAxisHowl.forEach((howl) => {
    switch (howlState) {
      case "waiting":
        // doe niks, laat schijf stil staan
        if (stateTimer >= waitDuration) {
          howlState = "rotating";
          stateTimer = 0;
        }
        break;

      case "rotating":
        // langzaam naar rechts draaien
        howl.rotation.z += 0.003; // Dit bepaalt de snelheid van de rotatie.

        // Na 'rotateDuration' frames begint hij met springen
        if (stateTimer >= rotateDuration) {
          howlState = "jumping";
          jumpStart = howl.rotation.z;
          jumpTarget = jumpStart - THREE.MathUtils.degToRad(123); // spring 45 graden terug
          stateTimer = 0;
        }
        break;

      case "jumping":
        // vloeiend draaien naar de doelrotatie (45 graden terug)
        const t = stateTimer / jumpDuration;
        howl.rotation.z = THREE.MathUtils.lerp(jumpStart, jumpTarget, t);

        // Na de sprong wacht de schijf weer
        if (stateTimer >= jumpDuration) {
          howlState = "waiting";
          stateTimer = 0;
        }
        break;
    }
  });

  stateTimer++;

  // Raycaster
  raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	currentIntersects = raycaster.intersectObjects(raycasterObjects);

	for ( let i = 0; i < currentIntersects.length; i ++ ) {
	}
  
  if (currentIntersects.length > 0 && currentIntersects[0].object.name.includes("Pointer")) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
  
 
  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();