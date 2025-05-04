import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from './utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

/**  -------------------------- Audio setup -------------------------- */

// moet nog komen. 


/** ----------------------------Scene setup-------------------------------- */
const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 8;
controls.maxDistance = 35;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = -0.8;
controls.maxAzimuthAngle = Math.PI / 0;

controls.enableDamping = true;
controls.dampingFactor = 0.05;


controls.update();

//Set starting camera position
if (window.innerWidth < 768) {
  camera.position.set(
    4.255816354890382,
    3.7801235321991182,
    23.16581973654613
  );
  controls.target.set(
    -2.1824645696469567,
    1.5394316514922293,
    -0.17525163814624226
  );
} else {
  camera.position.set(
    12.562337674469752, 
    3.360207618340808, 
    8.926306254456454);
  controls.target.set(
    0.8131327153401671,
    1.1040596411764165,
    -0.6394363206917698
  );
}

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**-----------------------------------End Scene setup------------------------------------------*/

let touchHappend = false;
document.querySelectorAll(".modal-exit-button").forEach(button => {
  button.addEventListener("touchend", (e) => {
    touchHappend = true;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, { passive: false });

  button.addEventListener("click", (e) => {
    if (touchHappend) return;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, { passive: false });
});

const showModal = (modal) => {
  modal.style.display = "flex";
  gsap.set(modal, { opacity: 0, scale: 0.2 });
  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: "back.out(1.7)"
  });
  document.body.style.overflow = 'hidden';
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    scale: 0.2,
    duration: 0.4,
    ease: "power1.inOut",
    onComplete: () => {
      modal.style.display = "none";
      document.body.style.overflow = '';
    },
  });
};

const zAxisHowl = [];
const yAxisHowl = [];
const xAxisHowl = [];
const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const socialLinks = {
  "Linked": "https://www.linkedin.com/in/mandy-van-den-berg/", 
  "Insta" : "https://www.instagram.com/mandyvanden_berg/",
  "Mail" : "mailto:info@mandyvandenberg.com",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/**----------------------------Loaders & Texture ------------------------------------------------------- */
const textureLoader = new THREE.TextureLoader();
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
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.night[key] = nightTexture;
});

window.addEventListener("mousemove", (e) => {
  touchHappend = false;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("touchstart", (e) => {
  e.preventDefault();
  pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

window.addEventListener("touchend", (e) => {
  e.preventDefault();
  handleRaycasterInteraction();
}, { passive: false });

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Button_My_Work")) {
      showModal(modals.work);
    } else if (object.name.includes("Button_About")) {
      showModal(modals.about);
    }
  }
};


window.addEventListener("click", handleRaycasterInteraction);



/** ----------------------------------------------Animation--------------------------- */
let howlState = "waiting";
let stateTimer = 0;
const waitDuration = 400;
const rotateDuration = 190;
const jumpDuration = 60;
let jumpStart = 0;
let jumpTarget = 0;

function playHoverAnimation(object, isHovering) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  const name = object.name;
  
  if (isHovering) {
    // V2 animatie (zoals het nu is)
    if (name.includes("HoverV2")) {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.1,
        y: object.userData.initialScale.y * 1.1,
        z: object.userData.initialScale.z * 1.1,
        duration: 0.5,
        ease: "back.out(2)",
      });
      gsap.to(object.position, {
        z: object.userData.initialPosition.z + 0.2,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }

    // V3 animatie
    if (name.includes("HoverV3")) {
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.2,
        y: object.userData.initialScale.y * 1.2,
        z: object.userData.initialScale.z * 1.2,
        duration: 0.5,
        ease: "back.out(2)",
      });
      gsap.to(object.rotation, {
        y: object.userData.initialRotation.y + 0,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }

  } else {
    // Terug naar oorspronkelijke staat
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "back.out(2)",
    });
    gsap.to(object.position, {
      z: object.userData.initialPosition.z,
      duration: 0.3,
      ease: "back.out(2)",
    });
    gsap.to(object.rotation, {
      y: object.userData.initialRotation.y,
      duration: 0.3,
      ease: "back.out(2)",
    });
  }
}

loader.load("/models/Portfolio_Mandy_World_v7.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("_Raycaster")) {
        raycasterObjects.push(child);
      }

      if (child.name.includes("HoverV2")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      if (child.name.includes("HoverV3")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if (child.name.includes("Howls")) {
            zAxisHowl.push(child);
          }

          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });
    }
  });
  scene.add(glb.scene);
});

const render = () => {
  controls.update();

  // console.log(camera.position);
  // console.log("0000000000000");
  // console.log(controls.target);
  
  zAxisHowl.forEach((howl) => {
    switch (howlState) {
      case "waiting":
        if (stateTimer >= waitDuration) {
          howlState = "rotating";
          stateTimer = 0;
        }
        break;
      case "rotating":
        howl.rotation.z += 0.003;
        if (stateTimer >= rotateDuration) {
          howlState = "jumping";
          jumpStart = howl.rotation.z;
          jumpTarget = jumpStart - THREE.MathUtils.degToRad(123);
          stateTimer = 0;
        }
        break;
      case "jumping":
        const t = stateTimer / jumpDuration;
        howl.rotation.z = THREE.MathUtils.lerp(jumpStart, jumpTarget, t);
        if (stateTimer >= jumpDuration) {
          howlState = "waiting";
          stateTimer = 0;
        }
        break;
    }
  });

  stateTimer++;


  /**-------------------------------Raycaster setup--------------------------------------------------- */
  raycaster.setFromCamera(pointer, camera);
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;

    if (currentIntersectObject.name.includes("HoverV2")) {
      if (currentIntersectObject !== currentHoveredObject) {
        if (currentHoveredObject) {
          playHoverAnimation(currentHoveredObject, false);
        }
        playHoverAnimation(currentIntersectObject, true);
        currentHoveredObject = currentIntersectObject;
      }
    }

    if (currentIntersectObject.name.includes("HoverV3")) {
      if (currentIntersectObject !== currentHoveredObject) {
        if (currentHoveredObject) {
          playHoverAnimation(currentHoveredObject, false);
        }
        playHoverAnimation(currentIntersectObject, true);
        currentHoveredObject = currentIntersectObject;
      }
    }

    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    if (currentHoveredObject) {
      playHoverAnimation(currentHoveredObject, false);
      currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};

render();
