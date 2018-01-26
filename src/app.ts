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

    this.camera.position.set(0, 20, 3);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    for (let x = -50; x < 50; x += 1.5) {
      for (let z = -50; z < 50; z += 1.5) {
        if (Math.random() > 0.8) {
          continue;
        }
        const height = Math.random() * 4;
        THREE.Math.clamp(height, 0.5, 4);
        const mat =
            new THREE.MeshPhysicalMaterial({color: new THREE.Color(0xeaeaea)});
        const cube = new THREE.Mesh(new THREE.CubeGeometry(1, height, 1), mat);
        cube.position.set(x, height / 2, z);

        this.scene.add(cube);
      }
    }

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({color: 0x101010}));

    plane.rotateX(THREE.Math.degToRad(-90));

    this.scene.add(plane);

    const light = new THREE.AmbientLight(0xeaeaea);

    this.scene.add(light);

    const directionLight = new THREE.DirectionalLight(0xeaeaea);
    directionLight.lookAt(new THREE.Vector3(0, 0, 0));
    directionLight.position.set(20, 20, -20);

    this.scene.add(directionLight);

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
      this.camera.position.add(new THREE.Vector3(0, 0, -1));
    } else if (ev.key === 's') {
      this.camera.position.add(new THREE.Vector3(0, 0, 1));
    } else if (ev.key === 'a') {
      this.camera.position.add(new THREE.Vector3(-1, 0, 0));
    } else if (ev.key === 'd') {
      this.camera.position.add(new THREE.Vector3(1, 0, 0));
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