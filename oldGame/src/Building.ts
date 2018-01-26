import * as THREE from 'three';
import {LoadedMesh} from './common';

export enum BuildingHoverState {
  Deselected,
  Hovered,
  Selected,
}

const modelData = JSON.parse(
    require('fs').readFileSync(__dirname + '/../res/building.json', 'utf8'));

export class Building extends THREE.Mesh {
  material: THREE.MeshPhongMaterial[];

  state: BuildingHoverState;

  static mesh: LoadedMesh|null = null;

  private connected: boolean;

  constructor(floors: number) {
    if (!Building.mesh) {
      Building.loadMesh();
    }

    super(
        Building.mesh.geometry.clone(),
        Building.mesh.materials.map((mat) => mat.clone()));

    this.scale.set(0.5, 0.5, 0.5);

    this.position.setY(-(floors));

    this.state = BuildingHoverState.Deselected;

    this.connected = Math.random() > 0.25;

    this.updateColor();
  }

  changeState(newState: BuildingHoverState) {
    this.state = newState;
    this.updateColor();
  }

  getBuildingId(): string {
    return `{${12}-${1234}-${13}}`;
  }

  getBuildingConnected(): boolean {
    return this.connected;
  }

  getBuildingBandwidth(): string {
    return '0 kbps';
  }

  private static loadMesh() {
    const modelLoader = new THREE.JSONLoader();
    const model = modelLoader.parse(modelData);
    Building.mesh = model;
  }

  private updateColor() {
    if (this.state === BuildingHoverState.Selected) {
      this.material[1].color.setHex(0xabfe2d);
    } else if (this.state === BuildingHoverState.Hovered) {
      this.material[1].color.setHex(0x808080);
    } else if (this.state === BuildingHoverState.Deselected) {
      this.material[1].color.setHex(0x575757);
    }

    if (this.getBuildingConnected()) {
      this.material[2].color.setHex(0x10ea10);
    } else {
      this.material[2].color.setHex(0xea1010);
    }

    const buildingActivityLevels = [0x808080, 0x808080, 0x808080];

    const activityLevel = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < 3; i++) {
      if (activityLevel > i) {
        this.material[3 + i].color.setHex(buildingActivityLevels[i]);
      } else {
        this.material[3 + i].color.setHex(0x404040);
      }
    }
  }
}