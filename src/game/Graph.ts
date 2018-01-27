import {Bag, expect, rand, randArray, randomId} from '../common';

class Edge {
  /**
   * In seconds
   */
  walkTime: number;

  private id: string = randomId();

  constructor(private target: string) {}

  getTarget(): string {
    return this.target;
  }

  getId(): string {
    return this.id;
  }
}

class Node {
  private edges: Map<string, Edge> = new Map();

  private id: string = randomId();

  private width = 0;
  private height = 0;

  // tslint:disable-next-line:no-any
  private attributes: Bag<any> = {};

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

  addEdgeTo(target: string): string {
    const newEdge = new Edge(target);
    this.edges.set(newEdge.getId(), newEdge);
    return newEdge.getId();
  }

  hasEdgeTo(target: string): boolean {
    const iter = this.edges.values();
    while (true) {
      const val = iter.next();
      if (val.done) {
        return false;
      } else {
        if (val.value.getTarget() === target) {
          return true;
        }
      }
    }
  }

  exportDotEdges(): string {
    return Array
        .from(
            this.edges.values(), (e) => `${this.getId()} -> ${e.getTarget()};`)
        .join('\n');
  }

  exportDotNode(): string {
    let label = this.getId();
    const difficulty = this.attributes['difficulty'] || -1;
    if (difficulty > 0) {
      label = `Level ${difficulty}`;
    }
    const color = this.attributes['optimalPath'] ? 'red' : 'black';
    return `${this.id}[label=${JSON.stringify(label)}, shape=square, width=${
        this.width}, height=${this.height}, color=${JSON.stringify(color)}];`;
  }

  getEdgeTargets(): string[] {
    return Array.from(this.edges.values(), (edge) => edge.getTarget());
  }

  getAttribute<T>(key: string, def: T): T {
    return this.attributes[key] || def;
  }

  // tslint:disable-next-line:no-any
  setAttribute(key: string, value: any) {
    this.attributes[key] = value;
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

  getPath(from: string, to: string): string[] {
    const unvisitedNodes: string[] = [];
    const distances: Bag<number> = {};
    const previousNodes: Bag<string|null> = {};

    this.nodes.forEach((v, k) => {
      distances[k] = Infinity;
      previousNodes[k] = null;
      unvisitedNodes.push(k);
    });

    distances[from] = 0;

    while (unvisitedNodes.length !== 0) {
      const unvisitedNodeDistances = unvisitedNodes.map(
          (n, idx) => ({key: n, index: idx, distance: distances[n]}));

      unvisitedNodeDistances.sort((a, b) => a.distance - b.distance);

      const nextNode = unvisitedNodeDistances[0];

      unvisitedNodes.splice(nextNode.index, 1);

      if (nextNode.key === to) {
        break;
      }

      this.getNodeEdges(nextNode.key).forEach((edge) => {
        const alt = distances[nextNode.key] + 1;
        if (alt < distances[edge]) {
          distances[edge] = alt;
          previousNodes[edge] = nextNode.key;
        }
      });
    }

    const ret: string[] = [];

    let cur = to;

    while (previousNodes[cur]) {
      ret.unshift(cur);
      const nextVal = previousNodes[cur];
      if (nextVal !== null) {
        cur = nextVal;
      }
    }

    ret.unshift(from);

    return ret;
  }

  getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  getNodeEdges(node: string): string[] {
    return (this.getNode(node) || expect()).getEdgeTargets();
  }

  getNodeAttribute<T>(node: string, key: string, def: T): T {
    return (this.getNode(node) || expect()).getAttribute(key, def);
  }

  // tslint:disable-next-line:no-any
  setNodeAttribute(node: string, key: string, value: any) {
    return (this.getNode(node) || expect()).setAttribute(key, value);
  }

  merge(other: Graph) {
    // TODO: Implement this.
  }

  private getNode(id: string): Node|null {
    return this.nodes.get(id) || null;
  }
}