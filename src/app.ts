import * as THREE from 'three';
import {expect} from './common';

class GlobalGameJamGame {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private container: HTMLDivElement;

  constructor() {}

  init() {
    this.container = document.querySelector('#container') || expect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.renderer.setClearColor(new THREE.Color(0x6495ED));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const cube = new THREE.Mesh(
        new THREE.CubeGeometry(1, 2, 1),
        new THREE.MeshLambertMaterial({color: new THREE.Color(0x101010)}));

    this.scene.add(cube);

    const light = new THREE.AmbientLight(0xeaeaea);

    this.scene.add(light);

    this.container.appendChild(this.renderer.domElement);

    this.update();
  }

  private update() {
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.update.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GlobalGameJamGame();

  game.init();
});