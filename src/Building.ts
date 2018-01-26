import * as THREE from 'three';

export enum BuildingHoverState {
  Deselected,
  Hovered,
  Selected,
}

const modelData = JSON.parse(
    require('fs').readFileSync(__dirname + '/../res/building.json', 'utf8'));

interface LoadedMesh {
  geometry: THREE.Geometry;
  materials?: THREE.Material[];
}

export class Building extends THREE.Mesh {
  material: THREE.MeshPhongMaterial[];

  state: BuildingHoverState;

  static mesh: LoadedMesh|null = null;

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
  }

  changeState(newState: BuildingHoverState) {
    this.state = newState;
    this.updateColor();
  }

  getBuildingId(): string {
    return `{${12}-${1234}-${13}}`;
  }

  getBuildingConnected(): boolean {
    return false;
  }

  getBuildingBandwidth(): string {
    return '0 kbps';
  }

  private static loadMesh() {
    const modelLoader = new THREE.JSONLoader();
    console.log(modelData);
    const model = modelLoader.parse(modelData);
    this.mesh = model;
  }

  private updateColor() {
    if (this.state === BuildingHoverState.Selected) {
      this.material[1].color.setHex(0xabfe2d);
    } else if (this.state === BuildingHoverState.Hovered) {
      this.material[1].color.setHex(0x808080);
    } else if (this.state === BuildingHoverState.Deselected)
      this.material[1].color.setHex(0xa7a7a7);
  }
}