import * as THREE from 'three';

import {Building} from './Building';
import {expect, isPhysicalMaterial} from './common';

class GlobalGameJamGame {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private container: HTMLDivElement;

  private raycaster: THREE.Raycaster;

  private mouse = new THREE.Vector2();

  private hoverObject: Building|null = null;
  private selectedObject: Building|null = null;

  constructor() {}

  init() {
    this.container = document.querySelector('#container') || expect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.renderer.setClearColor(new THREE.Color(0x6495ED));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 10, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.raycaster = new THREE.Raycaster();

    // Add basic building geometry.

    // TODO: Add Roads? Maybe a mesh or maybe something more complex.

    let x1 = -10;
    let z1 = -10;

    for (let x = -8; x < 8; x++) {
      z1 = -10;

      for (let z = -8; z < 8; z++) {
        const height = Math.random() * 4;
        THREE.Math.clamp(height, 1, 4);
        const building = new Building(height);
        building.position.setX(x1);
        building.position.setZ(z1);

        this.scene.add(building);

        z1 += 1;
        if (z1 % 4 === 0) {
          z1 += 1;
        }
      }

      x1 += 1;
      if (x1 % 6 === 0) {
        x1 += 1;
      }
    }

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({color: 0x101010}));

    plane.position.setX(-10);
    plane.position.setZ(-10);

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

    window.addEventListener('mousemove', (ev) => {
      this.onMouseMove(ev);
    });

    window.addEventListener('click', (ev) => {
      this.onMouseClick();
    });

    this.onResize();

    this.update();
  }

  private update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      intersects.sort((a, b) => a.distance - b.distance);

      const obj = intersects[0].object;
      if (obj instanceof Building && obj != this.hoverObject &&
          obj != this.selectedObject) {
        if (this.hoverObject && this.hoverObject !== this.selectedObject &&
            this.hoverObject.material instanceof THREE.MeshPhysicalMaterial) {
          this.hoverObject.material.color.setHex(0xeaeaea);
        }
        obj.material.color.setHex(0xff0000);
        this.hoverObject = obj;
      } else if (!(obj instanceof Building)) {
        if (this.hoverObject && this.hoverObject !== this.selectedObject) {
          this.hoverObject.material.color.setHex(0xeaeaea);
        }
        this.hoverObject = null;
      }
    }

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

  private onMouseMove(ev: MouseEvent) {
    this.mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  }

  private onMouseClick() {
    console.log('click');
    if (!this.hoverObject) {
      return;
    }
    if (!isPhysicalMaterial(this.hoverObject.material)) {
      return;
    }
    if (this.selectedObject &&
        isPhysicalMaterial(this.selectedObject.material)) {
      this.selectedObject.material.color.setHex(0xeaeaea);
    }
    this.selectedObject = this.hoverObject;
    this.hoverObject.material.color.setHex(0x1010ea);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GlobalGameJamGame();

  game.init();
});