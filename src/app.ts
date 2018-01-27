import * as THREE from 'three';

import {expect, LoadedMesh} from './common';

abstract class GameObject extends THREE.Mesh {
  abstract update(frameTime?: number): void;
}

/**
 * Level is just the level mesh.
 */
class Level extends GameObject {
  constructor() {
    super(Game.levelMesh.geometry, Game.levelMesh.materials);
  }

  update(frameTime?: number) {}
}

/**
 * Player is player.json controlled by the player with a gamepad.
 */
class Player extends GameObject {
  private camera: THREE.PerspectiveCamera;

  private gamepad: Gamepad;

  constructor() {
    super(Game.playerMesh.geometry, Game.playerMesh.materials);

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 10, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.gamepad = navigator.getGamepads()[0] || expect();

    this.add(this.camera);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  update(frameTime?: number) {}
}

/**
 * Turret is computer controlled. It shoots bullets.
 */
class Turret extends GameObject {
  constructor() {
    super(Game.turretMesh.geometry, Game.turretMesh.materials);
  }

  update(frameTime?: number) {}
}

/**
 * Bullet damages whatever it runs into. Turrets can be hurt by their own
 * bullets but players can't.
 */
class Bullet extends GameObject {
  constructor() {
    super(Game.bulletMesh.geometry, Game.bulletMesh.materials);
  }

  update(frameTime?: number) {}
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

  private player: Player;

  private playerCamera: THREE.PerspectiveCamera;

  init() {
    this.container = document.querySelector('#container') || expect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.renderer.setClearColor(new THREE.Color(0x101010));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

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

    this.scene.add(this.player);

    this.playerCamera = this.player.getCamera();

    this.container.appendChild(this.renderer.domElement);

    this.update();

    this.loadAllMeshes();
  }

  private update(frameTime?: number) {
    this.scene.children.forEach((child) => {
      if (child instanceof GameObject) {
        child.update(frameTime);
      }
    });

    this.renderer.render(this.scene, this.playerCamera, this.mainTarget, true);

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