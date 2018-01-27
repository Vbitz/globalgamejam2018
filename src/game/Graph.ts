import {expect, rand, randArray, randomId} from '../common';

class Edge {
  /**
   * In seconds
   */
  walkTime: number;

  constructor(private target: string) {}

  getTarget(): string {
    return this.target;
  }
}

class Node {
  /** Distance from starting node */
  difficulty = -1;

  private edges: Edge[] = [];

  private id: string = randomId();

  private width = 0;
  private height = 0;

  constructor(overrideId?: string) {
    if (overrideId) {
      this.id = overrideId;
    }

    this.width = Math.random() * 4;
    this.height = Math.random() * 4;
  }

  getId(): string {
    return this.id;
  }

  addEdgeTo(target: string) {
    this.edges.push(new Edge(target));
  }

  hasEdgeTo(target: string) {
    return this.edges.filter((edge) => edge.getTarget() === target).length > 0;
  }

  exportDotEdges(): string {
    return `${
        this.edges.map((e) => `${this.getId()} -> ${e.getTarget()};`)
            .join('\n')}`;
  }

  exportDotNode(): string {
    let label = this.getId();
    if (this.difficulty > 0) {
      label = `Level ${this.difficulty}`;
    }
    return `${this.id}[label=${JSON.stringify(label)}, shape=square, width=${
        this.width}, height=${this.height}];`;
  }

  getEdgeTargets(): string[] {
    return this.edges.map((edge) => edge.getTarget());
  }
}

export class Graph {
  private nodes: Map<string, Node> = new Map();

  exportDot(): string {
    let body = '';

    this.nodes.forEach((v, k) => {
      body += `${v.exportDotNode()}\n`;
    });

    this.nodes.forEach((v) => {
      body += `${v.exportDotEdges()}\n`;
    });

    return `digraph G {
        ${body}
      }`;
  }

  addNode(overrideId?: string): string {
    const newNode = new Node(overrideId);
    this.nodes.set(newNode.getId(), newNode);
    return newNode.getId();
  }

  addEdge(from: string, to: string): boolean {
    if (from === to) {
      return false;
    }

    const a = this.getNode(from);
    const b = this.getNode(to);

    if (!a) {
      throw new Error(`from{${from}} not found.`);
    }

    if (!b) {
      throw new Error(`to{${to}} not found.`);
    }

    if (a.hasEdgeTo(to)) {
      return false;
    }

    a.addEdgeTo(to);
    b.addEdgeTo(from);

    return true;
  }

  private getNode(id: string): Node|null {
    return this.nodes.get(id) || null;
  }
}