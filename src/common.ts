import * as THREE from 'three';

export function expect(): never {
  throw new Error('Expect failed');
}

export function isPhysicalMaterial(mat: THREE.Material|THREE.Material[]):
    mat is THREE.MeshPhysicalMaterial {
  return mat instanceof THREE.MeshPhysicalMaterial;
}