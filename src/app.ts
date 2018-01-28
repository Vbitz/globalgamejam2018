import * as THREE from 'three';

import {expect, LoadedMesh} from './common';

abstract class GameObject extends THREE.Object3D {
  protected mesh: THREE.Mesh;
  constructor(mesh: LoadedMesh) {
    if (!mesh.materials) {
      throw new Error('Bad Mesh');
    }
    super();
    this.mesh = new THREE.Mesh(
        mesh.geometry.clone(), mesh.materials.map((mat) => mat.clone()));
    this.add(this.mesh);
  }

  abstract update(frameTime?: number): void;
}

/**
 * Level is just the level mesh.
 */
class Level extends GameObject {
  constructor() {
    super(Game.levelMesh);

    const material = this.mesh.material as THREE.MeshPhongMaterial[];

    material[0].emissiveIntensity = 0.4;
    material[0].emissive = new THREE.Color(0x404040);

    material[1].emissiveIntensity = 0.4;
    material[1].emissive = new THREE.Color(0x101060);

    material[2].emissiveIntensity = 0.4;
    material[2].emissive = new THREE.Color(0x101010);
  }

  update(frameTime?: number) {}
}

/**
 * Player is player.json controlled by the player with a gamepad.
 */
class Player extends GameObject {
  private camera: THREE.PerspectiveCamera;

  private gamepad: Gamepad|null = null;

  private lastUpdate: number = 0;

  private speed = 5;

  private raycaster: THREE.Raycaster;

  private lineGeometry: THREE.Geometry;

  private leftTriggerPressed = true;
  private rightTriggerPressed = true;

  constructor(private owner: Game) {
    super(Game.playerMesh);

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 30, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scale.set(0.25, 0.25, 0.25);

    this.add(this.camera);

    const light = new THREE.PointLight(0x10ea10, 0.3, 10);

    light.position.setY(3);

    this.add(light);

    this.position.setY(0.5);

    this.lineGeometry = new THREE.Geometry();

    this.add(new THREE.Line(
        this.lineGeometry, new THREE.LineBasicMaterial({color: 0x00ff00})));

    this.raycaster = new THREE.Raycaster();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  update(frameTime?: number) {
    const time = (frameTime || 0) / 1000;

    if (this.lastUpdate === 0) {
      this.lastUpdate = time || 0;
    }

    if (this.gamepad === null) {
      const gamepadList = navigator.getGamepads();
      if (gamepadList[0] !== null) {
        console.log('Attached Gamepad');
        this.gamepad = gamepadList[0];
      } else {
        return;
      }
    }

    if (!this.gamepad.connected) {
      console.log('Detached Gamepad');
      this.gamepad = null;
      return;
    }

    const data = navigator.getGamepads()[this.gamepad.index];

    // Try movement

    let x = data.axes[0];
    let y = data.axes[1];

    // Implement Deadzone
    if (x > -0.1 && x < 0.1) {
      x = 0;
    }

    if (y > -0.1 && y < 0.1) {
      y = 0;
    }

    const moveVector = new THREE.Vector3(x, 0, y)
                           .multiplyScalar(time - this.lastUpdate)
                           .multiplyScalar(this.speed);

    const collides = this.collides(moveVector, 1);

    if (!(collides.length > 1)) {
      this.position.add(moveVector);

      // Fix small issues with collision and prevent the player from breaking
      // the game.
      this.position.clamp(
          new THREE.Vector3(-6.75, 0.5, -6.75),
          new THREE.Vector3(6.75, 0.5, 6.75));
    }

    // Update turret angle.

    const angleX = data.axes[2];
    const angleY = data.axes[3];

    if (!(angleX > -0.1 && angleX < 0.1) || !(angleY > -0.1 && angleY > 0.1)) {
      this.mesh.rotation.set(0, Math.atan2(angleX, angleY) - (Math.PI / 2), 0);
    }

    // Check for buttons pressed.

    const leftTriggerPressed = data.buttons[7].pressed;
    const rightTriggerPressed = data.buttons[6].pressed;

    if (leftTriggerPressed && !this.leftTriggerPressed) {
      this.fire();
    }

    this.leftTriggerPressed = leftTriggerPressed;

    if (rightTriggerPressed && !this.rightTriggerPressed) {
      this.teleport();
    }

    this.rightTriggerPressed = rightTriggerPressed;

    // Update lazar
    const rotationVector = new THREE.Vector3(
        Math.cos(this.mesh.rotation.y), 0, -Math.sin(this.mesh.rotation.y));

    const laserCollides = this.collides(rotationVector, 100);

    const laserTarget = laserCollides.filter(
        (inter) =>
            inter.object instanceof Level || inter.object instanceof Turret);

    if (laserTarget.length > 1) {
      this.lineGeometry.vertices = [
        new THREE.Vector3(),
        this.position.clone().sub(laserTarget[0].point.clone())
      ];
    } else {
      this.lineGeometry.vertices =
          [new THREE.Vector3(), rotationVector.clone().multiplyScalar(100)];
    }
    this.lineGeometry.verticesNeedUpdate = true;

    // Update lastUpdate

    this.lastUpdate = time;
  }

  private collides(vector: THREE.Vector3, distance: number) {
    this.raycaster.set(this.position, vector.clone().normalize());

    const intersections =
        this.raycaster.intersectObjects(this.owner.getObjects());

    const collides = intersections.filter(
        (int) => int.object !== this && int.distance < distance);

    return collides;
  }

  private fire() {
    this.owner.addObject(new Bullet(
        this.owner, this, false, this.getWorldPosition(), this.mesh.rotation.y,
        0.75));
  }

  private teleport() {
    console.log('teleport');
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
  private speed: 10;

  constructor(
      private game: Game, private owner: Player|Turret,
      private hitsOwner: boolean, private firePosition: THREE.Vector3,
      private fireAngle: number, private fireDistance: number) {
    super(Game.bulletMesh);

    const material = this.mesh.material as THREE.MeshPhongMaterial[];

    material[0].emissiveIntensity = 0.4;
    material[0].emissive = new THREE.Color(0xffffff);

    this.scale.set(0.15, 0.15, 0.15);

    this.position.copy(this.firePosition);

    console.log(fireAngle);

    this.position.add(
        new THREE.Vector3(Math.cos(fireAngle), 0, -Math.sin(fireAngle))
            .multiplyScalar(fireDistance));
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

  private level: Level;
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

    this.level = new Level();

    this.scene.add(this.level);

    this.player = new Player(this);

    this.scene.add(this.player);

    this.playerCamera = this.player.getCamera();

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', (ev) => {
      this.onResize();
    });

    this.onResize();

    this.update();
  }

  getLevel() {
    return this.level;
  }

  getObjects() {
    return this.scene.children;
  }

  addObject(gameObject: GameObject) {
    this.scene.add(gameObject);
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.playerCamera.aspect = window.innerWidth / window.innerHeight;
    this.playerCamera.updateProjectionMatrix();
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