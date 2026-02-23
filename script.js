import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);


const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// camera.position.set(3, 1.5, 5);
camera.position.set(3.05, 1.3, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0.19,0.44,-0.22);
const loader = new GLTFLoader();

let textArray = ['TextShuffle','TextCup','TextClub'];
let textGlowInterval;

loader.load('releases/download/Glb/fullScene.glb', (gltf) => {

    //  gltf.scene.children.push(gltf.scene.children[8].clone(true));

    scene.add(gltf.scene);
    gltf.scene.position.x = 1.2;
    gltf.scene.position.y = 0;
    gltf.scene.position.z = 2;
    
    gltf.scene.rotation.y = 3.7;

    
    gltf.scene.traverse((child) => {
        if (child.isLight) {
            // child.intensity = 100;
            child.castShadow = true;
            
            child.shadow.bias = -0.0002;
            child.shadow.normalBias = 0.02;
            //child.position.y = 1.8;

             if(child.name == "Point" || child.name == "Point001"){
                child.intensity=20;
             }else{
                child.intensity = 5;
             }
        }
        
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
            
            if(['PurpleCup_2','RedCup_2','CyanCup_2'].includes(child.name)){
                child.material.color.r = 1;
                child.material.color.g = 0;
                child.material.color.b = 0;    
            }

            if(textArray.includes(child.name)){
                child.material.emissiveIntensity = -0.5;
            }
        }
    });

    // animating glowing text
    let i = 0;
    textGlowInterval = setInterval(() => {
        scene.children[0].children.find(x=> x.name == textArray[i==0 ? 2 : i-1]).material.emissiveIntensity = -0.5;
        scene.children[0].children.find(x=> x.name == textArray[i]).material.emissiveIntensity = 1;
        i += 1;
        if(i == 3) i=0;
    }, 800);

});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // console.clear();
    // console.log(camera.position);
    // console.log(controls.target);
}

animate();


//logic For game
let ball;
let ballUnder; // inmdex of glass under which the ball is
let ballPositions = [-0.027320039272308305,-0.4273200392723083,-0.8273200392723083];
let cups = ['CyanCup','PurpleCup','RedCup'];
let combinations = [[0,1],[1,0],[1,2],[2,1]];
let shuffleInterval;

//Cup colors:
let colors = {
    "red": { "r": 1, "g": 0, "b": 0 },
    "green": { "r": 0, "g": 1, "b": 0 },
    "blue": { "r": 0, "g": 0, "b": 1 },

    "crimson": { "r": 0.74, "g": 0.21, "b": 0.21 },
    "o_b": { "r": 0.17, "g": 0.51, "b": 0.74 },
    "mustard": { "r": 0.85, "g": 0.65, "b": 0.13 },

    "forest": { "r": 0.13, "g": 0.55, "b": 0.13 },
    "burnt_orange": { "r": 0.80, "g": 0.33, "b": 0.00 },
    "royal_purple": { "r": 0.47, "g": 0.32, "b": 0.66 },

    "slate_teal": { "r": 0.20, "g": 0.50, "b": 0.50 },
    "dusty_rose": { "r": 0.77, "g": 0.45, "b": 0.49 },
    "steel_gray": { "r": 0.44, "g": 0.50, "b": 0.56 },

    "electric_currant": { "r": 0.90, "g": 0.15, "b": 0.35 },
    "deep_azure":       { "r": 0.10, "g": 0.65, "b": 0.95 },
    "hyper_violet":     { "r": 0.60, "g": 0.25, "b": 1.00 },
    "arctic_teal":      { "r": 0.20, "g": 0.85, "b": 0.75 }
};
window.changeCupColor = (selectedColor) => {
    cups.forEach(cup=>{
        let cup_color = scene.children[0].children.find(x=> x.name == cup).children.find(x=> x.name == (cup+"_2")).material.color;
        ({ r: cup_color.r, g: cup_color.g, b: cup_color.b } = colors[selectedColor]);
    });
}

window.executeGame = async () => {
    document.getElementById('playBtn').style.display = 'none';
    clearInterval(textGlowInterval);
    textArray.forEach(text=>{
        scene.children[0].children.find(x=> x.name == text).material.emissiveIntensity = 0.5;
    });
    let diff = 0.01;
    const interval = setInterval(async () => {
        if(camera.position.x > 2.29){
            camera.position.x -= diff; 
        }
        if(camera.position.y > 1.08){
            camera.position.y -= diff; 
        }
        if(camera.position.z > 2.95){
            camera.position.z -= diff; 
        }
        if(controls.target.x < 0.32){
            controls.target.x += diff; 
        }
        if(controls.target.y < 0.48){
            controls.target.y += diff; 
        }
        if(controls.target.z > -0.31){
            controls.target.z -= diff;
        }

        if(camera.position.x <= 2.29 && camera.position.y <= 1.08 && camera.position.z <= 2.95 && controls.target.x >= 0.32 && controls.target.y >= 0.48 && controls.target.z <= -0.31){
            clearInterval(interval);

            ball = scene.children[0].children.find(x=> x.name == "Ball");
            ball.position.y = 0.67;
            ballUnder = Math.floor(Math.random() * 3);
            ball.position.x = ballPositions[ballUnder];

            await takeCupUpDown('up');
            document.getElementById('shuffleBtn').style.display = '';
        }
    }, 10);
    
}

window.startShuffling = async () => {
    document.getElementById('ui').style.display = 'none';
    document.getElementById('shuffleBtn').style.display = 'none';
    await takeCupUpDown('down');
    document.getElementById('stopShuffleBtn').style.display = '';
    shuffleCups();
}

window.stopShuffling = () => {
    document.getElementById('stopShuffleBtn').style.display = 'none';
    clearInterval(shuffleInterval);
    document.getElementById('revealBallBtn').style.display = '';
}

window.revealBall = async () =>{
    document.getElementById('revealBallBtn').style.display = 'none';
    await takeCupUpDown('up');
     document.getElementById('endGameBtn').style.display = '';
}

window.endGame = async () =>{
    document.getElementById('endGameBtn').style.display = 'none';
    await takeCupUpDown('down');
     document.getElementById('playBtn').style.display = '';
     document.getElementById('ui').style.display = '';
}

//async function takeCupUpDown(type="up"){
window.takeCupUpDown = async (type="up") =>{
    return new Promise((resolve) => {
        let y = 0;
        const interval = setInterval(() => {

            if(y >= 0.2){
                clearInterval(interval);
                resolve();
                return;
            }

            if(type == "up"){
                scene.children[0].children.find(x=> x.name == cups[ballUnder]).position.y += 0.01;
            }else{
                scene.children[0].children.find(x=> x.name == cups[ballUnder]).position.y -= 0.01;
            }

            y += 0.01;
        }, 10);
    });
}

let spinDuration = 600;
let intervalTime = 800;
window.changeDifficulty = (selectedDifficulty) => {
    spinDuration = parseInt(selectedDifficulty);
    intervalTime = spinDuration+100;
}

function shuffleCups() {
    shuffleInterval = setInterval(async () => {
        const comboIndex = Math.floor(Math.random() * combinations.length);
        const [i1, i2] = combinations[comboIndex];

        const cup1 = scene.children[0].children.find(x => x.name == cups[i1]);
        const cup2 = scene.children[0].children.find(x => x.name == cups[i2]);

        let tempCup = JSON.parse(JSON.stringify(cups[i1]));
        cups[i1] = JSON.parse(JSON.stringify(cups[i2]));
        cups[i2] = JSON.parse(JSON.stringify(tempCup));

        const start1 = cup1.position.clone();
        const start2 = cup2.position.clone();

        const arcHeight = 0.2;
        const startTime = performance.now();

        function animate(time) {

            let t = (time - startTime) / spinDuration;
            if (t > 1) t = 1;

            // linear swap
            cup1.position.x = THREE.MathUtils.lerp(start1.x, start2.x, t);
            cup2.position.x = THREE.MathUtils.lerp(start2.x, start1.x, t);

            // arc motion (sin wave)
            const arc = Math.sin(t * Math.PI) * arcHeight;
            cup1.position.z = start1.z + arc;
            cup2.position.z = start2.z - arc;

            // move ball with correct cup
            if (ballUnder === i1) {
                ball.position.x = cup1.position.x;
                ball.position.z = cup1.position.z;
            }
            else if (ballUnder === i2) {
                ball.position.x = cup2.position.x;
                ball.position.z = cup2.position.z;
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // animation finished → update logic
                if (ballUnder === i1) ballUnder = i2;
                else if (ballUnder === i2) ballUnder = i1;
            }
        }

        requestAnimationFrame(animate);
    },intervalTime);
}



const sleep = ms => new Promise(r => setTimeout(r, ms));



