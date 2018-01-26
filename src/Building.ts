import * as THREE from 'three';

export enum BuildingHoverState {
  Deselected,
  Hovered,
  Selected,
}

export class Building extends THREE.Mesh {
  material: THREE.MeshPhysicalMaterial;

  state: BuildingHoverState;

  constructor(height: number) {
    const mat =
        new THREE.MeshPhysicalMaterial({color: new THREE.Color(0xeaeaea)});

    super(new THREE.CubeGeometry(1, height, 1), mat);

    this.position.setY(height / 2);

    this.state = BuildingHoverState.Deselected;
  }

  changeState(newState: BuildingHoverState) {
    this.state = newState;
    this.updateColor();
  }

  getBuildingId(): string {
    return '{13-2321-13}';
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