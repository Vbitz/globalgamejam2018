import * as THREE from 'three';

import {expect, LoadedMesh} from './common';

/**
 * Level is just the level mesh.
 */
class Level extends THREE.Mesh {
  constructor() {
    super(Game.levelMesh.geometry, Game.levelMesh.materials);
  }
}

/**
 * Player is player.json controlled by the player with a gamepad.
 */
class Player extends THREE.Mesh {
  private camera: THREE.PerspectiveCamera;

  constructor() {
    super(Game.playerMesh.geometry, Game.playerMesh.materials);

    this.add(this.camera);
  }
}

/**
 * Turret is computer controlled. It shoots bullets.
 */
class Turret extends THREE.Mesh {
  constructor() {
    super(Game.turretMesh.geometry, Game.turretMesh.materials);
  }
}

/**
 * Bullet damages whatever it runs into. Turrets can be hurt by their own
 * bullets but players can't.
 */
class Bullet extends THREE.Mesh {
  constructor() {
    super(Game.bulletMesh.geometry, Game.bulletMesh.materials);
  }
}

class Game {
  static levelMesh: LoadedMesh;
  static playerMesh: LoadedMesh;
  static turretMesh: LoadedMesh;
  static bulletMesh: LoadedMesh;

  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private container: HTMLDivElement;

  private raycaster: THREE.Raycaster;

  private mainTarget: THREE.WebGLRenderTarget;

  private screenScene: THREE.Scene;
  private screenCamera: THREE.OrthographicCamera;

  init() {
    this.container = document.querySelector('#container') || expect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.renderer.setClearColor(new THREE.Color(0x101010));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 10, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.mainTarget = new THREE.WebGLRenderTarget(
        256, 240,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    this.screenScene = new THREE.Scene();

    this.screenScene.add(new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 1, 1),
        new THREE.MeshBasicMaterial({map: this.mainTarget.texture})));

    this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1);

    this.screenCamera.position.setZ(100);
    this.screenCamera.lookAt(new THREE.Vector3(0, 0, 0));

    const directionLight = new THREE.DirectionalLight(0xeaeaea);
    directionLight.lookAt(new THREE.Vector3(0, 0, 0));
    directionLight.position.set(20, 20, -20);

    this.scene.add(directionLight);

    this.scene.add(new Level());

    this.player = new Player();

    this.container.appendChild(this.renderer.domElement);

    this.update();

    this.loadAllMeshes();
  }

  private update(frameTime?: number) {
    this.renderer.render(this.scene, this.camera, this.mainTarget, true);

    this.renderer.render(this.screenScene, this.screenCamera);

    requestAnimationFrame(this.update.bind(this));
  }

  private loadAllMeshes() {
    const loader = new THREE.JSONLoader();

    const levelJson =
        require('fs').readFileSync(__dirname + '../res/level.json', 'utf8');
    const playerJson =
        require('fs').readFileSync(__dirname + '../res/player.json', 'utf8');
    const turretJson =
        require('fs').readFileSync(__dirname + '../res/turret.json', 'utf8');
    const bulletJson =
        require('fs').readFileSync(__dirname + '../res/bullet.json', 'utf8');


    Game.playerMesh = loader.parse(JSON.parse(playerJson));
  }
}