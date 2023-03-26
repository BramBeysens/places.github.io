import './style.css'
import gsap from 'gsap';
import * as THREE from 'three';

let globeRadius = 5;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 1000
);

const renderer = new THREE.WebGLRenderer(
  {
    antialias: true
  }
);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);


//create the globe
const sphere = new THREE.Mesh(new THREE.
  SphereGeometry(globeRadius, 50, 50), new THREE.
    MeshBasicMaterial({
      //color: 0xFF0000
      map: new THREE.TextureLoader().load(
        './assets/globe_precise.jpg')
    }))

//define the map height and width
let mapWidth = 21600;
let mapHeigth = 10800;

scene.add(sphere);

// create the sphere indicator
const sphereIndicator = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

camera.position.z = 15;

const mouse = {
  x: undefined,
  y: undefined
}

let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
let rotationSpeed = 0.010;
let zoomLevel = 1;

const cameraDirection = new THREE.Vector3();
camera.getWorldDirection(cameraDirection);
const cameraCenter = new THREE.Vector3().addVectors(camera.position, cameraDirection);


renderer.domElement.addEventListener('wheel', onMouseWheel);
renderer.domElement.addEventListener('touchstart', onTouchStart);
renderer.domElement.addEventListener('touchmove', onTouchMove);
renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

function onMouseWheel(event) {
  event.preventDefault();
  const delta = event.deltaY * 0.01;
  // if (camera.position.z > globeRadius / 10) {
  if (event.deltaY < 0) {
    zoomIn();
  }
  if (event.deltaY > 0) {
    zoomOut();
  }
}

function zoomIn() {
  if (camera.position.z > globeRadius + 1) {
    zoomLevel /= 1.1;
    camera.position.z /= 1.1;
    camera.fov *= 2;
  }
  console.log(zoomLevel);
}

function zoomOut() {
  zoomLevel *= 1.1;
  camera.position.z *= 1.1;
  camera.fov /= 1.1;
  console.log(zoomLevel);
}



let touchStart = { x: 0, y: 0 };
function onTouchStart(event) {
  touchStart.x = event.touches[0].clientX;
  touchStart.y = event.touches[0].clientY;
}

function onTouchMove(event) {
  event.preventDefault();
  const touchCurrent = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  const delta = { x: touchCurrent.x - touchStart.x, y: touchCurrent.y - touchStart.y };
  camera.position.z += delta.y * 0.01;
  touchStart = touchCurrent;
}
let mouseDown = false;
let mousePosition = { x: 0, y: 0 };
let globeRotation = { x: 0, y: 0 };

function onMouseDown(event) {
  mouseDown = true;
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
}

function onMouseMove(event) {
  if (mouseDown) {
    const delta = {
      x: event.clientX - mousePosition.x,
      y: event.clientY - mousePosition.y
    };
    targetRotation.x += delta.y * 0.01;
    targetRotation.y += delta.x * 0.01;
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }
}

function onMouseUp(event) {
  mouseDown = false;
}




function animate() {
  requestAnimationFrame(animate);

  // If the mouse button is not down, gradually slow down the rotation speed
  if (!mouseDown) {
    rotationSpeed *= 0.95;
  }
  else{
    rotationSpeed = 0.010;
  }

  currentRotation.x += (targetRotation.x - currentRotation.x) * rotationSpeed * zoomLevel;
  currentRotation.y += (targetRotation.y - currentRotation.y) * rotationSpeed * zoomLevel;
    sphere.rotation.x = currentRotation.x;
    sphere.rotation.y = currentRotation.y;
  renderer.render(scene, camera);
  // gsap.to(sphere.rotation, {
  //   y: mouse.x * 0.5,
  //   duration: 2
  // })

  // create a raycaster from the camera position to the center of the globe
  const raycaster = new THREE.Raycaster(
    camera.position,
    cameraCenter.clone().sub(camera.position).normalize()
  );

  // find the intersection between the ray and the globe
  const intersection = raycaster.intersectObject(sphere)[0];

  // if there is an intersection, show the indicator
  if (intersection) {
    const intersectionPoint = intersection.point;
    // set the indicator position to the intersection point
    sphereIndicator.position.copy(intersection.point);
    scene.add(sphereIndicator);
    // console.log(intersectionPoint)
  } else {
    // otherwise, remove the indicator from the scene
    scene.remove(sphereIndicator);
  }
}
animate()