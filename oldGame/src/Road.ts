import * as THREE from 'three';
import {LoadedMesh} from './common';

const road4xModelData = JSON.parse(
    require('fs').readFileSync(__dirname + '/../res/road4x.json', 'utf8'));

const road2xModelData = JSON.parse(
    require('fs').readFileSync(__dirname + '/../res/road2x.json', 'utf8'));

export class Road extends THREE.Mesh {
  private static loadedMeshes = false;

  static mesh4x: LoadedMesh|null = null;
  static mesh2x: LoadedMesh|null = null;

  constructor(up: boolean, down: boolean, left: boolean, right: boolean) {
    if (!Road.loadedMeshes) {
      Road.loadMeshes();
    }

    if (up && down && left && right) {
      super(Road.mesh4x.geometry, Road.mesh4x.materials);
    } else if (up && down && !left && !right) {
      super(Road.mesh2x.geometry, Road.mesh2x.materials);
      this.rotateY(THREE.Math.degToRad(90));
    } else if (!up && !down && left && right) {
      super(Road.mesh2x.geometry, Road.mesh2x.materials);
    } else {
      super(Road.mesh4x.geometry, Road.mesh4x.materials);
    }

    this.scale.set(0.5, 0.5, 0.5);
  }

  private static loadMeshes() {
    const modelLoader = new THREE.JSONLoader();

    const model4x = modelLoader.parse(road4xModelData);
    Road.mesh4x = model4x;

    const model2x = modelLoader.parse(road2xModelData);
    Road.mesh2x = model2x;

    Road.loadedMeshes = true;
  }
}