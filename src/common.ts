import * as THREE from 'three';

export function expect(): never {
  throw new Error('Expect failed');
}

export interface LoadedMesh {
  geometry: THREE.Geometry;
  materials?: THREE.Material[];
}