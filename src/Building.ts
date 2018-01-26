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

  static mesh:|null = null;

  constructor(floors: number) {
    const modelLoader = new THREE.JSONLoader();
    console.log(modelData);
    const model = modelLoader.parse(modelData);

    console.log(model);

    const mat =
        new THREE.MeshPhysicalMaterial({color: new THREE.Color(0xeaeaea)});

    super(new THREE.CubeGeometry(1, floors / 2, 1), mat);

    this.position.setY(floors / 4);

    this.state = BuildingHoverState.Deselected;
  }

  static loadMesh() {}

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

  private updateColor() {
    if (this.state === BuildingHoverState.Selected) {
      this.material.color.setHex(0xabfe2d);
    } else if (this.state === BuildingHoverState.Hovered) {
      this.material.color.setHex(0x808080);
    } else if (this.state === BuildingHoverState.Deselected)
      this.material.color.setHex(0xeaeaea);
  }
}