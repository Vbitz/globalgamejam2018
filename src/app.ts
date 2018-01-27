class Player extends THREE.Mesh {}

class Game {
  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private container: HTMLDivElement;

  private raycaster: THREE.Raycaster;

  init() {
    this.container = document.querySelector('#container') || expect();
  }
}