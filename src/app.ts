import * as THREE from 'three';

import {expect, LoadedMesh} from './common';

abstract class GameObject extends THREE.Object3D {
  protected mesh: THREE.Mesh;

  private raycaster: THREE.Raycaster;

  constructor(protected game: Game, mesh: LoadedMesh) {
    super();

    if (!mesh.materials) {
      throw new Error('Bad Mesh');
    }

    this.mesh = new THREE.Mesh(
        mesh.geometry.clone(), mesh.materials.map((mat) => mat.clone()));

    this.add(this.mesh);

    this.raycaster = new THREE.Raycaster();
  }

  abstract update(frameTime?: number): void;

  protected collides(vector: THREE.Vector3, distance: number) {
    this.raycaster.set(this.position, vector.clone());

    const objs = this.game.getObjects();

    const intersections = this.raycaster.intersectObjects(objs, true);

    const collides = intersections.filter(
        (int) => int.object !== this && int.distance < distance);

    return collides;
  }
}

/**
 * Level is just the level mesh.
 */
class Level extends GameObject {
  constructor(game: Game) {
    super(game, Game.levelMesh);

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

  private line: THREE.Line;
  private lineGeometry: THREE.Geometry;

  private rightTriggerPressed = true;

  private lastFire: number;

  constructor(game: Game) {
    super(game, Game.playerMesh);

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 50, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.add(this.camera);

    this.scale.set(0.25, 0.25, 0.25);

    const light = new THREE.PointLight(0x10ea10, 0.3, 10);

    light.position.setY(3);

    this.add(light);

    this.position.setY(0.5);

    this.lineGeometry = new THREE.Geometry();

    this.line = new THREE.Line(
        this.lineGeometry, new THREE.LineBasicMaterial({color: 0x00ff00}));

    this.add(this.line);
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

    const collides = this.collides(moveVector, 1).filter((int) => {
      return int.object.parent instanceof Turret;
    });

    console.log(collides);

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

    if (leftTriggerPressed) {
      this.fire();
    }

    if (rightTriggerPressed && !this.rightTriggerPressed) {
      this.teleport();
    }

    this.rightTriggerPressed = rightTriggerPressed;

    // Update lazar
    const rotationVector = new THREE
                               .Vector3(
                                   Math.cos(this.mesh.rotation.y), 0,
                                   -Math.sin(this.mesh.rotation.y))
                               .normalize();

    const laserCollides = this.collides(rotationVector, 100);

    const laserTarget = laserCollides.filter(
        (inter) => inter.object.parent instanceof Level ||
            inter.object.parent instanceof Turret);

    if (laserTarget.length > 1) {
      this.lineGeometry.vertices = [
        new THREE.Vector3(),
        this.line.worldToLocal(laserTarget[0].point.clone())
      ];
    } else {
      this.lineGeometry.vertices =
          [new THREE.Vector3(), rotationVector.clone().multiplyScalar(100)];
    }
    this.lineGeometry.verticesNeedUpdate = true;

    // Update lastUpdate

    this.lastUpdate = time;
  }

  onHitByBullet() {
    // TODO
  }

  private fire() {
    if (this.lastUpdate < this.lastFire + 0.2) {
      return;
    }
    this.game.addObject(new Bullet(
        this.game, this, false, this.getWorldPosition(), this.mesh.rotation.y,
        1));
    this.lastFire = this.lastUpdate;
  }

  private teleport() {
    const rotationVector = new THREE
                               .Vector3(
                                   Math.cos(this.mesh.rotation.y), 0,
                                   -Math.sin(this.mesh.rotation.y))
                               .normalize();

    const laserCollides = this.collides(rotationVector, 100);

    const laserTarget =
        laserCollides.filter((inter) => inter.object.parent instanceof Turret);

    if (laserTarget.length > 0) {
      const turretPosition = laserTarget[0].object.parent.position.clone();
      const thisPosition = this.position.clone();

      this.position.copy(turretPosition);
      laserTarget[0].object.parent.position.copy(thisPosition);

      this.position.clamp(
          new THREE.Vector3(-6.75, 0.5, -6.75),
          new THREE.Vector3(6.75, 0.5, 6.75));
    }
  }
}

/**
 * Turret is computer controlled. It shoots bullets.
 */
class Turret extends GameObject {
  private lastFire: number;

  constructor(game: Game) {
    super(game, Game.turretMesh);

    this.scale.set(0.5, 0.5, 0.5);

    const light = new THREE.PointLight(0xea1010, 0.3, 10);

    light.position.setY(3);

    this.add(light);

    this.position.setY(0.5);
  }

  update(frameTime?: number) {}

  onHitByBullet() {
    // Die
    this.parent.remove(this);
  }
}

/**
 * Bullet damages whatever it runs into. Turrets can be hurt by their own
 * bullets but players can't.
 */
class Bullet extends GameObject {
  private speed: number = 10;

  private lastUpdate: number = 0;

  constructor(
      game: Game, private owner: Player|Turret, private hitsOwner: boolean,
      private firePosition: THREE.Vector3, private fireAngle: number,
      private fireDistance: number) {
    super(game, Game.bulletMesh);

    const material = this.mesh.material as THREE.MeshPhongMaterial[];

    material[0].emissiveIntensity = 0.4;
    if (owner instanceof Player) {
      material[0].emissive = new THREE.Color(0x00ff00);
      this.speed = 20;
    } else if (owner instanceof Turret) {
      material[0].emissive = new THREE.Color(0xff0000);
    }

    this.scale.set(0.15, 0.15, 0.15);

    this.position.copy(this.firePosition);

    console.log(fireAngle);

    this.position.add(
        new THREE
            .Vector3(Math.cos(this.fireAngle), 0, -Math.sin(this.fireAngle))
            .multiplyScalar(fireDistance));
  }

  update(frameTime?: number) {
    const time = (frameTime || 0) / 1000;

    if (this.lastUpdate === 0) {
      this.lastUpdate = time || 0;
    }

    const moveVector =
        new THREE
            .Vector3(Math.cos(this.fireAngle), 0, -Math.sin(this.fireAngle))
            .normalize();

    const moveAmount = this.speed * (time - this.lastUpdate);

    const rawCollides = this.collides(moveVector, moveAmount * 2);

    const collides = rawCollides.filter((int) => {
      const obj = int.object.parent;
      if (obj === this.owner) {
        return this.hitsOwner;
      }
      // We don't hit other bullets
      if (obj instanceof Bullet) {
        return false;
      } else {
        if (obj instanceof Turret && this.owner instanceof Turret) {
          return false;
        } else {
          return true;
        }
      }
    });

    if (collides.length === 0) {
      this.position.add(moveVector.multiplyScalar(moveAmount));
    } else {
      const obj = collides[0].object.parent;
      if (obj instanceof Player) {
        obj.onHitByBullet();
      } else if (obj instanceof Turret) {
        obj.onHitByBullet();
      }
      this.parent.remove(this);
      this.position.clamp(
          new THREE.Vector3(-6.75, 0.5, -6.75),
          new THREE.Vector3(6.75, 0.5, 6.75));
    }

    // Update lastUpdate

    this.lastUpdate = time;
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

  private level: Level;
  private player: Player;

  private playerCamera: THREE.PerspectiveCamera;

  private lastSpawn: number = 0;
  private lastUpdate: number = 0;

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

    this.level = new Level(this);

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

  getPlayerPosition(): THREE.Vector3 {
    return this.player.position;
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.playerCamera.aspect = window.innerWidth / window.innerHeight;
    this.playerCamera.updateProjectionMatrix();
  }

  private update(frameTime?: number) {
    const time = (frameTime || 0) / 1000;

    if (this.lastUpdate > this.lastSpawn + 2) {
      this.spawnTurret();
      this.lastSpawn = this.lastUpdate;
    }

    this.scene.children.forEach((child) => {
      if (child instanceof GameObject) {
        child.update(frameTime);
      }
    });

    this.renderer.render(this.scene, this.playerCamera, this.mainTarget, true);

    this.renderer.render(this.screenScene, this.screenCamera);

    requestAnimationFrame(this.update.bind(this));

    this.lastUpdate = time;
  }

  private spawnTurret() {
    const otherTurrets =
        this.getObjects().filter((obj) => obj instanceof Turret);
    if (otherTurrets.length > 5) {
      return;
    }

    const newPosition = new THREE.Vector3(
        THREE.Math.randFloat(-6.5, 6.5), 0, THREE.Math.randFloat(-6.5, 6.5));

    const newTurret = new Turret(this);

    newTurret.position.copy(newPosition);

    this.addObject(newTurret);
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