import * as THREE from 'three';

export class Building extends THREE.Mesh {
  constructor(height: number) {
    const mat =
        new THREE.MeshPhysicalMaterial({color: new THREE.Color(0xeaeaea)});
    mat.wireframe = true;
    mat.wireframeLinewidth = 2.0;
    super(new THREE.CubeGeometry(1, height, 1), mat);
    this.position.setY(height / 2);
  }
}