import * as THREE from 'three';

import {Building, BuildingHoverState} from './Building';
import {expect} from './common';

type Tile = Building|Road;

class GlobalGameJamGame {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private container: HTMLDivElement;
  private buildingInfoPanel: HTMLPreElement;

  private raycaster: THREE.Raycaster;

  private mouse = new THREE.Vector2();

  private hoverObject: Building|null = null;
  private selectedObject: Building|null = null;

  private mainTarget: THREE.WebGLRenderTarget;

  private screenScene: THREE.Scene;
  private screenCamera: THREE.OrthographicCamera;

  private map: Tile[][];

  constructor() {}

  init() {
    this.container = document.querySelector('#container') || expect();

    this.buildingInfoPanel =
        document.querySelector('#buildingInfoPanel') || expect();

    this.renderer =
        new THREE.WebGLRenderer({antialias: true, devicePixelRatio: 128});

    this.renderer.setClearColor(new THREE.Color(0x6495ED));

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera();

    this.camera.position.set(0, 10, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.raycaster = new THREE.Raycaster();

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

    this.container.addEventListener('mousemove', (ev) => {
      this.onMouseMove(ev);
    });

    this.container.addEventListener('click', (ev) => {
      this.onMouseClick();
    });

    this.generateMap(32, 32);

    this.onResize();

    this.update();
  }

  private update(frameTime?: number) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      intersects.sort((a, b) => a.distance - b.distance);

      const obj = intersects[0].object;
      if (obj instanceof Building) {
        this.onHoverBuilding(obj);
      } else {
        if (this.hoverObject &&
            this.hoverObject.state === BuildingHoverState.Hovered) {
          this.hoverObject.changeState(BuildingHoverState.Deselected);
        }
        this.hoverObject = null;
      }
    }

    this.renderer.render(this.scene, this.camera, this.mainTarget, true);

    this.renderer.render(this.screenScene, this.screenCamera);

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
    if (!this.hoverObject) {
      return;
    }
    if (this.selectedObject) {
      this.selectedObject.changeState(BuildingHoverState.Deselected);
    }
    this.selectedObject = this.hoverObject;
    this.selectedObject.changeState(BuildingHoverState.Selected);
    this.buildingInfoPanel.innerText = `=== BUILDING INFO PANEL ===
BLDID     = ${this.selectedObject.getBuildingId()}
CONNECT   = ${this.selectedObject.getBuildingConnected() ? 'TRUE' : 'FALSE'}
BANDWIDTH = ${this.selectedObject.getBuildingBandwidth()}`;
  }

  private onHoverBuilding(building: Building) {
    if (building != this.hoverObject && building != this.selectedObject) {
      if (this.hoverObject &&
          this.hoverObject.state === BuildingHoverState.Hovered) {
        this.hoverObject.changeState(BuildingHoverState.Deselected);
      }
      building.changeState(BuildingHoverState.Hovered);
      this.hoverObject = building;
    }
  }

  private generateMap(width: number, height: number) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new GlobalGameJamGame();

  game.init();
});