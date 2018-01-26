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

    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    for (let x = -32; x < 32; x++) {
      for (let z = -32; z < 32; z++) {
        const cube = new THREE.Mesh(
            new THREE.CubeGeometry(1, 5, 1),
            new THREE.MeshLambertMaterial({color: new THREE.Color(0x101010)}));
        cube.position.set(x * 2, 2.5, z * 2);

        this.scene.add(cube);
      }
    }

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({color: 0xeaeaea}));

    plane.rotateX(THREE.Math.degToRad(-90));

    this.scene.add(plane);

    const light = new THREE.AmbientLight(0xeaeaea);

    this.scene.add(light);

    this.container.appendChild(this.renderer.domElement);

    document.body.addEventListener('keypress', (ev) => {
      this.onKeyPress(ev);
    });

    window.addEventListener('resize', (ev) => {
      this.onResize();
    });

    this.onResize();

    this.update();
  }

  private update() {
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.update.bind(this));
  }

  private onKeyPress(ev: KeyboardEvent) {
    if (ev.key === 'w') {
      this.camera.position.add(new THREE.Vector3(0, 0, 1));
    } else if (ev.key === 's') {
      this.camera.position.add(new THREE.Vector3(0, 0, -1));
    } else if (ev.key === 'a') {
      this.camera.position.add(new THREE.Vector3(1, 0, 0));
    } else if (ev.key === 'd') {
      this.camera.position.add(new THREE.Vector3(-1, 0, 0));
    }
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GlobalGameJamGame();

  game.init();
});