import * as THREE from 'three';

import {expect} from './common';

/**
 * Level is just the level mesh.
 */
class Level extends THREE.Mesh {}

/**
 * Player is player.json controlled by the player with a gamepad.
 */
class Player extends THREE.Mesh {}

/**
 * Turret is computer controlled. It shoots bullets.
 */
class Turret extends THREE.Mesh {}

/**
 * Bullet damages whatever it runs into. Turrets can be hurt by their own
 * bullets but players can't.
 */
class Bullet extends THREE.Mesh {}

class Game {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

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

    this.container.appendChild(this.renderer.domElement);
  }
}