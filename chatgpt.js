

// Load Mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbWJleXNlbnMiLCJhIjoiY2xmcXcxbXEyMDJwbzNzcDE2MTQyM25kYyJ9.i0nNTJSMC6hdqvKUUVEOnA';
const map = new mapboxgl.Map({
    container: 'three-container',
    style: 'mapbox://styles/brambeysens/clfqw6ie4001a01nwmarx0tv3',
    zoom: 0,
    center: [0, 0],
});

// Create Three.js scene
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Create sphere geometry
const geometry = new THREE.SphereGeometry(5, 32, 32);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,1,0,0/1024x512?access_token=' + mapboxgl.accessToken);
const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Update Three.js camera position and rotation based on Mapbox camera
map.on('move', () => {
    const { lng, lat } = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();
    camera.position.setFromSphericalCoords(10, THREE.Math.degToRad(90 - lat), THREE.Math.degToRad(lng));
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.rotation.z = THREE.Math.degToRad(90 - bearing);
});

// Add user interactions
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
container.addEventListener('mousedown', event => {
    isDragging = true;
});
container.addEventListener('mousemove', event => {
    const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y,
    };
    if (isDragging) {
        const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(
            THREE.Math.degToRad(deltaMove.y * 0.5),
            THREE.Math.degToRad(deltaMove.x * 0.5),
            0,
            'XYZ'
        ));
        camera.quaternion.multiply(deltaRotationQuaternion);
    }
    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY,
    };
});
container.addEventListener('mouseup', event => {
    isDragging = false;
});