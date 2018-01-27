import * as THREE from 'three';
import {AmbientLight, Color, DirectionalLight} from 'three';

import {expect, LoadedMesh} from './common';

abstract class GameObject extends THREE.Mesh {
  constructor(mesh: LoadedMesh) {
    if (!mesh.materials) {
      throw new Error('Bad Mesh');
    }
    super(mesh.geometry.clone(), mesh.materials.map((mat) => mat.clone()));
  }

  abstract update(frameTime?: number): void;
}

/**
 * Level is just the level mesh.
 */
class Level extends GameObject {
  material: THREE.MeshPhongMaterial[];
  constructor() {
    super(Game.levelMesh);

    this.material[0].emissiveIntensity = 0.4;
    this.material[0].emissive = new Color(0x404040);

    this.material[1].emissiveIntensity = 0.4;
    this.material[1].emissive = new Color(0x101060);

    this.material[2].emissiveIntensity = 0.4;
    this.material[2].emissive = new Color(0x101010);
  }

  update(frameTime?: number) {}
}

/**
 * Player is player.json controlled by the player with a gamepad.
 */
class Player extends GameObject {
  private camera: THREE.PerspectiveCamera;

  private gamepad: Gamepad|null = null;

  constructor() {
    super(Game.playerMesh);

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 30, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scale.set(0.25, 0.25, 0.25);

    this.add(this.camera);

    const light = new THREE.PointLight(0x10ea10, 0.1);

    light.position.setY(3);

    this.add(light);

    this.position.setY(1.0);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  update(frameTime?: number) {
    if (this.gamepad === null) {
      const gamepadList = navigator.getGamepads();
      if (gamepadList[0] !== null) {
        console.log('Attached Gamepad');
        this.gamepad = gamepadList[0];
      } else {
        return;
      }
    }

    console.log(this.gamepad.axes[0], this.gamepad.axes[1]);
  }
}

/**
 * Turret is computer controlled. It shoots bullets.
 */
class Turret extends GameObject {
  constructor() {
    super(Game.turretMesh);
  }

  update(frameTime?: number) {}
}

/**
 * Bullet damages whatever it runs into. Turrets can be hurt by their own
 * bullets but players can't.
 */
class Bullet extends GameObject {
  constructor() {
    super(Game.bulletMesh);
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
    this.loadAllMeshes();

    this.container = document.querySelector('#container') || expect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.renderer.setClearColor(new THREE.Color(0x101010));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.mainTarget = new THREE.WebGLRenderTarget(
        640, 480,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    this.screenScene = new THREE.Scene();

    this.screenScene.add(new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 1, 1),
        new THREE.MeshBasicMaterial({map: this.mainTarget.texture})));

    this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1);

    this.screenCamera.position.setZ(100);
    this.screenCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene.add(new Level());

    this.player = new Player();

    this.scene.add(this.player);

    this.playerCamera = this.player.getCamera();

    this.container.appendChild(this.renderer.domElement);

    this.update();
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
        require('fs').readFileSync(__dirname + '/../res/level.json', 'utf8');
    const playerJson =
        require('fs').readFileSync(__dirname + '/../res/player.json', 'utf8');
    const turretJson =
        require('fs').readFileSync(__dirname + '/../res/turret.json', 'utf8');
    const bulletJson =
        require('fs').readFileSync(__dirname + '/../res/bullet.json', 'utf8');

    Game.levelMesh = loader.parse(JSON.parse(levelJson));
    Game.playerMesh = loader.parse(JSON.parse(playerJson));
    Game.turretMesh = loader.parse(JSON.parse(turretJson));
    Game.bulletMesh = loader.parse(JSON.parse(bulletJson));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  game.init();
});