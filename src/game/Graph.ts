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

  getEdgeTargets(): string[] {
    return Array.from(this.edges.values(), (edge) => edge.getTarget());
  }

  getEdgeTarget(edgeId: string): string {
    return (this.getEdge(edgeId) || expect()).getTarget();
  }

  getEdgeIds(): string[] {
    return Array.from(this.edges.keys());
  }

  getAttribute<T>(key: string, def: T): T {
    return this.attributes[key] === undefined ? this.attributes[key] : def;
  }

  // tslint:disable-next-line:no-any
  setAttribute(key: string, value: any) {
    this.attributes[key] = value;
  }

  private getEdge(edgeId: string): Edge|null {
    return this.edges.get(edgeId) || null;
  }
}

export class Graph {
  private nodes: Map<string, Node> = new Map();

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

      this.getNodeEdgeTargets(nextNode.key).forEach((edge) => {
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

  getNodeEdgeTargets(nodeId: string): string[] {
    return (this.getNode(nodeId) || expect()).getEdgeTargets();
  }

  getNodeEdgeIds(nodeId: string): string[] {
    return (this.getNode(nodeId) || expect()).getEdgeIds();
  }

  getNodeAttribute<T>(nodeId: string, key: string, def: T): T {
    return (this.getNode(nodeId) || expect()).getAttribute(key, def);
  }

  // tslint:disable-next-line:no-any
  setNodeAttribute(nodeId: string, key: string, value: any) {
    return (this.getNode(nodeId) || expect()).setAttribute(key, value);
  }

  getEdgeTarget(nodeId: string, edgeId: string): string {
    return (this.getNode(nodeId) || expect()).getEdgeTarget(edgeId);
  }

  private getNode(nodeId: string): Node|null {
    return this.nodes.get(nodeId) || null;
  }
}