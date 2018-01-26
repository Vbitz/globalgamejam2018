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

    this.renderer.setClearColor(new THREE.Color('cornflowerBlue'));

    this.scene = new THREE.Scene;

    this.update();
  }

  private update() {
    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GlobalGameJamGame();

  game.init();
});