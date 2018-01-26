class Edge {
  constructor(private target: string) {}

  getTarget(): string {
    return this.target;
  }
}

class Node {
  private edges: Edge[] = [];

  private id: string = randomId();

  constructor() {
    this.id
  }

  addEdgeTo(target: string) {
    this.edges.push(new Edge(target));
  }
}

export class Dungeon {
  private nodes: Map<string, Node> = new Map();

  generateLevel() {}

  private addNode(): string {}

  private addEdge(from: string, to: string) {}
}