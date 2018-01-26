import {randArray, randomId} from '../common';

class Edge {
  constructor(private target: string) {}

  getTarget(): string {
    return this.target;
  }
}

class Node {
  private edges: Edge[] = [];

  private id: string = randomId();

  constructor() {}

  getId(): string {
    return this.id;
  }

  addEdgeTo(target: string) {
    this.edges.push(new Edge(target));
  }

  exportDot(): string {
    return `${
        this.edges.map((e) => `${this.getId()} -> ${e.getTarget()};`)
            .join('\n')}`;
  }
}

export class Dungeon {
  private nodes: Map<string, Node> = new Map();

  generateLevel() {
    const nodeCount = 100;

    // Add random nodes
    const nodes: string[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.addNode());
    }

    // Add random initial edges
    const edgeCount = 200;

    for (let i = 0; i < edgeCount; i++) {
      const a = randArray(nodes);
      const b = randArray(nodes);
      this.addEdge(a, b);
    }

    while (true) {
      let nodeList = Array.from(nodes);
    }
  }

  exportDot(): string {
    let body: string = '';
    this.nodes.forEach((v, k) => {body += `${k};\n`});
    this.nodes.forEach((v) => {body += `${v.exportDot()}\n`});
    return `digraph G {
        ${body}
      }`
  }

  private addNode(): string {
    const newNode = new Node();
    this.nodes.set(newNode.getId(), newNode);
    return newNode.getId();
  }

  private addEdge(from: string, to: string) {
    const a = this.getNode(from);
    const b = this.getNode(to);

    if (!a) {
      throw new Error(`from{${from}} not found.`)
    }

    if (!b) {
      throw new Error(`to{${to}} not found.`)
    }

    a.addEdgeTo(to);
    b.addEdgeTo(from);
  }

  private getNode(id: string): Node|null {
    return this.nodes.get(id) || null;
  }
}