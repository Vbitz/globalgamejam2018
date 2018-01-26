import {randomId} from '../common';

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
    return '';
  }
}

export class Dungeon {
  private nodes: Map<string, Node> = new Map();

  generateLevel() {}

  exportDot(): string {
    let body: string = '';
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
  }

  private getNode(id: string): Node|null {
    return this.nodes.get(id) || null;
  }
}