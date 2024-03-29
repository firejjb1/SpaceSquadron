﻿"use strict";
var currentColor = new BABYLON.Color3(0.5, 0.5, 1);
var bulletActive = false;
var Radius = 200;
var user;

// Find child mesh inside of ship
var findMesh = (ship, childName) => {
    return ship.getChildMeshes(false, (child) => {
        if (child.name == childName) {
            return true;
        }
        else {
            return false;
        }
    })[0];
}

function createComet(scene, index) {
    var generatePoint = () => {
        return (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random()*50);
    }

    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    const rock = BABYLON.Mesh.CreateSphere("rock" + index, 20, 32, scene, true, BABYLON.Mesh.FRONTSIDE);
    const rockMat = new BABYLON.StandardMaterial("rockMat", scene);
    rockMat.diffuseTexture = new BABYLON.Texture("img/floor.png", scene);
    rockMat.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    rock.material = rockMat;
    const position = new BABYLON.Vector3(generatePoint(), generatePoint(), generatePoint());
    rock.position = position;
    rock.targetPos = new BABYLON.Vector3(0 - position.x, 0 - position.y, 0 - position.z);
    rock.checkCollisions = true;
    return rock;
}

function createShip(scene, camera) {

    let currentColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

    /*** Primary part of ship ***/
    const nose = BABYLON.MeshBuilder.CreateCylinder("nose", { height: 3, diameterTop: 0, diameterBottom: 1, tessellation: 4 });

    /*** Tail and Jet Propulsion ***/
    const tail = BABYLON.MeshBuilder.CreateCylinder("tail", { height: 1, diameterTop: 1, diameterBottom: 0.5, tessellation: 4 });
    tail.position.y = -2;
    tail.parent = nose;
    const jet = BABYLON.MeshBuilder.CreateCylinder("jet", { height: 0.5, diameterTop: 0.4, diameterBottom: 0, tessellation: 4 });
    jet.position.y = -0.75;
    jet.parent = tail;
    const jetMat = new BABYLON.StandardMaterial("jetMat", scene);
    jetMat.emissiveColor = currentColor;
    jetMat.alpha = 0.5;
    jet.material = jetMat;

    // Create a particle system
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

    // Where the particles come from
    particleSystem.emitter = jet; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.5, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.1;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 1;

    // Emission rate
    particleSystem.emitRate = 2000;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    // Start the particle system
    particleSystem.start();

    const boostAnim = new BABYLON.Animation("boostAnim", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
   /**  const boostKeys = [];
    boostKeys.push({
        frame: 0,
        value: camera.position.z
    });
    boostKeys.push({
        frame: 5,
        value: camera.position.z
    });
    boostKeys.push({
        frame: 90,
        value: camera.position.z - 1
    });
    boostKeys.push({
        frame: 120,
        value: camera.position.z
    });
    boostAnim.setKeys(boostKeys);
    camera.animations.push(boostAnim);
    */
    /*** Blasters and bullets ***/
    const blasterMat = new BABYLON.StandardMaterial("blastMat", scene);
    blasterMat.diffuseColor = currentColor;

    const blasterLeft = BABYLON.MeshBuilder.CreateCylinder("blasterLeft", { height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4 });
    blasterLeft.position = new BABYLON.Vector3(-0.75, -0.5, 0.25);
    blasterLeft.parent = nose;
    blasterLeft.material = blasterMat;

    const blasterRight = BABYLON.MeshBuilder.CreateCylinder("blasterRight", { height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4 });
    blasterRight.position = new BABYLON.Vector3(0.75, -0.5, 0.25);
    blasterRight.parent = nose;
    blasterRight.material = blasterMat;

    const bulletLeft = BABYLON.MeshBuilder.CreateCylinder("bulletLeft", { diameter: 0.6, height: 1.5 });
    const bulletRight = BABYLON.MeshBuilder.CreateCylinder("bulletRight", { diameter: 0.6, height: 1.5 });
    bulletLeft.parent = blasterLeft;
    bulletRight.parent = bulletLeft;
    bulletRight.position.x = 1.5;
    bulletLeft.checkCollisions = true;
    const bulletMat = new BABYLON.StandardMaterial("bulletMaterial", scene);
    bulletMat.emissiveColor = currentColor;
    bulletLeft.material = bulletMat;
    bulletRight.material = bulletMat;
    const bulletAnim = new BABYLON.Animation("bulletAnim", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const bulletKeys = [];

    bulletKeys.push({
        frame: 0,
        value: 0
    });
    bulletKeys.push({
        frame: 30,
        value: 600
    });

    bulletAnim.setKeys(bulletKeys);
    bulletLeft.animations.push(bulletAnim);

    /*** Wings and Shield ***/
    const wingLeft = BABYLON.MeshBuilder.CreateCylinder("wLeft", { height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4 });
    wingLeft.position.x = -1.75;
    wingLeft.position.y = -3;
    wingLeft.rotate(BABYLON.Axis.Z, -Math.PI / 4);
    wingLeft.parent = nose;

    const wingRight = BABYLON.MeshBuilder.CreateCylinder("wRight", { height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4 });
    wingRight.position.x = 1.75;
    wingRight.position.y = -3;
    wingRight.rotate(BABYLON.Axis.Z, Math.PI / 4);
    wingRight.parent = nose;

    const shield = BABYLON.MeshBuilder.CreateSphere("shield", { diameterX: 7, diameterY: 8, diameterZ: 2 });
    shield.position.y = -2;
    shield.parent = nose;
    const shieldMat = new BABYLON.StandardMaterial("shieldMat", scene);
    shieldMat.alpha = 0.0;
    shieldMat.emissiveColor = currentColor;
    shield.material = shieldMat;

    const shieldAnim = new BABYLON.Animation("shieldAnim", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const shieldKeys = [];

    shieldKeys.push({
        frame: 0,
        value: 0
    });
    shieldKeys.push({
        frame: 30,
        value: 0.1
    });
    shieldKeys.push({
        frame: 60,
        value: 0.1
    });
    shieldKeys.push({
        frame: 90,
        value: 0
    });

    shieldAnim.setKeys(shieldKeys);

    shield.animations.push(shieldAnim);

    nose.setPivotPoint(new BABYLON.Vector3(0, -2.25, 0));
    //nose.rotate(BABYLON.Axis.X, Math.PI / 2);
    //nose.rotate(BABYLON.Axis.Z, Math.PI);
    let Radius = 150 + Math.random() * 100;
    nose.position = new BABYLON.Vector3(0, 0, -Radius);
    // lock camera
    if (!camera.lockedTarget)
       camera.lockedTarget = nose;

    
    nose.Radius = Radius;
    nose.CurrentColor = currentColor;
    return nose;
}

// Activate blaster animation
var fireBlasters = (scene, ship, camera, sound) => {
    if (!bulletActive) {
        bulletActive = true;
        sound.play();
        const bulletLeft = findMesh(ship, "bulletLeft");
        ship.lookAt(camera.getFrontPosition(10));
        ship.rotate(BABYLON.Axis.X, -Math.PI / 2.2);
        setTimeout(async () => {
            const anim = scene.beginAnimation(bulletLeft, 0, 500, false);

            await anim.waitAsync();
            bulletLeft.position.y = 0;
            bulletActive = false;

        });
    }
}


var turnLeft = (ship) => {
  //  if (ship.position.x > -5) {
    //ship.position.x -= 0.4;
    ship.position.z -= 0.4;
    //    ship.rotate(BABYLON.Axis.Z, -0.1, BABYLON.Space.LOCAL);
  //  }
}

var turnRight = (ship) => {
  //  if (ship.position.x < 5) {
    //ship.position.x += 0.4;
     ship.position.z += 0.4;
    //ship.rotate(BABYLON.Axis.Z, 0.1, BABYLON.Space.LOCAL);
  //  }
}

var turnUp = (ship) => {
    //ship.position.y += 0.4;
    ship.rotate(BABYLON.Axis.X, -0.1, BABYLON.Space.LOCAL);
}

var turnDown = (ship) => {
    // ship.position.y -= 0.4;
    ship.rotate(BABYLON.Axis.X, 0.1, BABYLON.Space.LOCAL);
}

var goForward = (ship) => {
    ship.position.z += 0.4;
} 

var goBackward = (ship) => {
    ship.position.z -= 0.4;
}

// Create Skybox object
var createSkybox = (scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    const files = [
        "img/Space/space_left.jpg",
        "img/Space/space_up.jpg",
        "img/Space/space_front.jpg",
        "img/Space/space_right.jpg",
        "img/Space/space_down.jpg",
        "img/Space/space_back.jpg",
    ];
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages(files, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    return skybox;
}

var ship;

function initializeSounds(scene) {
    const shootSound = new BABYLON.Sound("shootSound", "sfx/Retro Gun Laser SingleShot 01.wav", scene, null, { loop: false, autoplay: false });
    const impactSound = new BABYLON.Sound("impactSound", "sfx/Retro Explosion Long 02.wav", scene, null, { loop: false, autoplay: false });
    const accelSound = new BABYLON.Sound("accelSound", "sfx/Retro Charge 13.wav", scene, null, { loop: false, autoplay: false });
    const decelSound = new BABYLON.Sound("decelSound", "sfx/Retro Charge Off StereoUP 02.wav", scene, null, { loop: false, autoplay: false });
    const hitSound = new BABYLON.Sound("hit Sound", "sfx/Retro Magic 06.wav", scene, null, { loop: false, autoplay: false });

    return {
        shootSound,
        impactSound,
        accelSound,
        decelSound,
        hitSound,
    };
}

function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    // CreateScene function that creates and return the scene
    var createScene = function () {

        // Create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        var soundObj = initializeSounds(scene);
        var gl = new BABYLON.GlowLayer("glow", scene);
        
        // device manager
        var deviceSourceManager = new BABYLON.DeviceSourceManager(scene.getEngine());
        deviceSourceManager.onDeviceConnectedObservable.add((device) => {
            console.log(device.deviceType + " connected");
        });
        var diameter = 200;
        // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
        var sphere = BABYLON.Mesh.CreateSphere('sphere1', 160, diameter, scene, false, BABYLON.Mesh.FRONTSIDE);

        //const camera = new BABYLON.FreeCamera("FollowCam", new BABYLON.Vector3(0, 0, -15), scene);
        var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 50, ship, scene);
        var ships = {};
        var comets = {};
        if (!ship)
            ship = createShip(scene, camera);
        ship.position.z = Math.random() * 200 - 10;

        // GUI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const skybox = createSkybox(scene);

        camera.attachControl(canvas, true);
        // ship.position = BABYLON.Vector3(0, 5, -5);
        // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

        const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
        sphereMat.diffuseTexture = new BABYLON.Texture("img/earthmap.jpg", scene); 
        sphere.material = sphereMat;
        sphere.rotate(BABYLON.Axis.X, Math.PI);
        var i = 0;
        var lastSpawn = 0;
        var spawnInterval = 5;
        var lastSync = 0;
        var syncInterval = 0.01;
        var selfCometHit = 0;
        var totalCometsEarth = 0;
        var accel = 1;
        var shipMotion = 0;
        var isAccel = false;
        var isDecel = false;
        scene.registerBeforeRender(() => {
            if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
                if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(37) == 1) {
                    turnLeft(ship);
                } else if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(39) == 1) {
                    turnRight(ship);
                }
                if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(38) == 1) {
                    // goForward(ship);
                    turnUp(ship);
                } else if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(40) == 1) {
                    // goBackward(ship);
                    turnDown(ship);
                    
                }
                // X = accelerate
                if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(88) == 1) {
                    if (!isAccel) {
                        soundObj.accelSound.play();
                        isAccel = true;
                    }
                    if (accel < 3)
                        accel += 0.1;
                    
                } else if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(90) == 1) {
                    if (!isDecel) {
                        soundObj.decelSound.play();
                        isDecel = true;
                    }
                    if (accel > 0.2) {
                        accel -= 0.1;
                    }
                } else {
                    // accel = 1;
                    isAccel = false;
                    isDecel = false;
                    soundObj.accelSound.stop();
                }

                if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(32) == 1) {
                    fireBlasters(scene, ship, camera, soundObj.shootSound);
                }
            }

            // sync with other ships
            if (i - lastSync > syncInterval) {
                user = document.getElementById("userInput").value;
                var posToSend = {};
                posToSend.X = ship.position.x;
                posToSend.Y = ship.position.y;
                posToSend.Z = ship.position.z;

                var message = JSON.stringify(posToSend);

                connection.invoke("SendMessage", user, message).catch(function (err) {
                    return console.error(err.toString());
                });
                for (const key in window.ships) {
                    if (key.toString() == user.toString()) continue;
                    var shipC;
                    var positionC = window.ships[key];
                    if (!ships[key]) {
                        // create ship
                        shipC = createShip(scene, camera);
                        ships[key] = shipC;

                    } else {
                        shipC = ships[key];
                        // console.log(positionC);
                        var positionTmp = new BABYLON.Vector3(positionC.X, positionC.Y, positionC.Z);
                        //shipC.lookAt(positionTmp);
                        //ship.rotate(BABYLON.Axis.X, Math.PI / 2);
                        shipC.position = positionTmp;

                        
                    }
                    //console.log(shipC.position);
                }
                lastSync = i;
            }

            // spawn comet
            if (i - lastSpawn > spawnInterval) {
                var comet = createComet(scene, i);
                if (camera.lockedTarget == null)
                    camera.lockedTarget = comet;
                
              //  setTimeout(function () {
              //      camera.lockedTarget = ship;
              //  }, 500);
                //  window.comets.push(comet);
                lastSpawn = i;
                var cometJSON = {
                    position: comet.position,
                    name: (user+i).toString(),
                    hitBullet: false,
                    hitEarth: false,
                };
                console.log("comet spawn: " + name);
                comets[cometJSON.name] = comet;
                window.comets[cometJSON.name] = comet;
                connection.invoke("SendMessage", "comet", JSON.stringify(cometJSON)).catch(function (err) {
                    return console.error(err.toString());
                });
                // progressive difficulty
                if (spawnInterval > 3) {
                    spawnInterval -= 0.2;
                }
            }

            // orbit
            var position = new BABYLON.Vector3(ship.Radius * Math.cos(shipMotion), ship.Radius * Math.sin(shipMotion), ship.position.z);

            if (!bulletActive) {
                ship.lookAt(position);
                ship.rotate(BABYLON.Axis.X, Math.PI / 2);
            }

            ship.position = position;
           // render other ships client side to avoid jankiness
            /**
           for (const key in ships) {
                var shipC = ships[key];
                var positionC = new BABYLON.Vector3(shipC.position.x + 0.005, shipC.position.y + 0.005, shipC.position.z);

                shipC.lookAt(positionC);
                shipC.rotate(BABYLON.Axis.X, Math.PI / 2);

                shipC.position = positionC;
            } 
            */
            const bulletLeft = findMesh(ship, "bulletLeft");
            var totalCometsHit = 0;
 
            for (const key in window.comets) {
                // if (window.comets[key].user == user) continue;
                // console.log(key);

                var cometC;
                if (!comets[key]) {
                    console.log(key, comets);
                    cometC = createComet(scene, i);
                    comets[key] = cometC;
                    var positionC = window.comets[key].position;
                    cometC.position = new BABYLON.Vector3(positionC._x, positionC._y, position._z);

                   
                } else {
                    cometC = comets[key];
                    cometC.hitEarth = cometC.hitEarth || window.comets[key].hitEarth;
                    cometC.hitBullet = cometC.hitBullet || window.comets[key].hitBullet;
                }
                if (cometC.intersectsMesh(bulletLeft) && !cometC.hitBullet) {
                    selfCometHit++;
                    console.log("bullet hit");
                    cometC.hitBullet = true;
                    // sync bullet hit
                    var cometJSON = {
                        position: cometC.position,
                        name: window.comets[key].name,
                        hitBullet: true,
                        hitEarth: false,
                    };
                    soundObj.hitSound.play();

                    connection.invoke("SendMessage", "comet", JSON.stringify(cometJSON)).catch(function (err) {
                        return console.error(err.toString());
                    });
                }
                if (cometC.position.length() < diameter / 2 && !cometC.hitEarth) {
                    console.log("hit earth")
                    cometC.hitEarth = true;
                    totalCometsEarth++;
                    soundObj.impactSound.play();
                }
                if (cometC.hitBullet && !cometC.hitEarth)
                    totalCometsHit++;
                if (cometC.hitEarth || cometC.hitBullet) {
                   
                    cometC.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
                    continue;
                } 
               

                var positionC = new BABYLON.Vector3(cometC.position.x - 0.0001 * i * cometC.position.x, cometC.position.y - 0.0001 * i * cometC.position.y, cometC.position.z - 0.0001 * i * cometC.position.z);
                cometC.rotate(BABYLON.Axis.X, 0.1);
                cometC.position = positionC;
            }
            document.getElementById("totalRocksStopped").innerHTML = totalCometsHit;
            document.getElementById("selfRocksStopped").innerHTML = selfCometHit;
            document.getElementById("totalRocksEarth").innerHTML = totalCometsEarth;
            i += 0.005;
            shipMotion += 0.005 * accel;
        });
        
        // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
        // var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
       // const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 });
        // Return the created scene
        return scene;
    }
    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });
    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
        engine.resize();
    });
}

var gameStart = false;
document.getElementById("sendButton").addEventListener("click", function (event) {
    if (!gameStart) {
        main();
        gameStart = true;
        // share data real time
     /**   setInterval(function () {
            user = document.getElementById("userInput").value;
            var posToSend = { "X": ship.position.x, "Y": ship.position.y, "Z": ship.position.z };
            
            var message = JSON.stringify(posToSend);
            // console.log(message)
            connection.invoke("SendMessage", user, message).catch(function (err) {
                return console.error(err.toString());
            });
        }, 500);
        */
    }
});
