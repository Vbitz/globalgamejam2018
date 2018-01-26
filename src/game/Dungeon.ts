import {expect, randArray, randomId} from '../common';

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
  difficulty: number = -1;

  private edges: Edge[] = [];

  private id: string = randomId();

  constructor(overrideId?: string) {
    if (overrideId) {
      this.id = overrideId;
    }
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
    return `${this.id}[label=${JSON.stringify(label)}];`;
  }

  getEdgeTargets(): string[] {
    return this.edges.map((edge) => edge.getTarget());
  }
}

export class Dungeon {
  private nodes: Map<string, Node> = new Map();

  generateLevel() {
    const nodeCount = 20;

    // Add random nodes
    const nodes: string[] = [];

    nodes.push(this.addNode('entry'));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.addNode());
    }

    // Add random initial edges
    const edgeCount = 5;

    for (let i = 0; i < edgeCount; i++) {
      const a = randArray(nodes);
      const b = randArray(nodes);
      this.addEdge(a, b);
    }

    while (true) {
      const groups: string[][] = [];

      const nodeList = Array.from(nodes);

      while (nodeList.length > 0) {
        const newGroup = [nodeList.pop() || expect()];

        const walkNodes = (node: string) => {
          const nodeObj = this.getNode(node) || expect();

          nodeObj.getEdgeTargets().map((target) => {
            if (newGroup.indexOf(target) !== -1) {
              return;
            }

            const targetIndex = nodeList.indexOf(target);

            // Add the node to the group.
            newGroup.push(target);

            // Remove the node from the list.
            nodeList.splice(targetIndex, 1);

            walkNodes(target);
          });
        };

        walkNodes(newGroup[0]);

        groups.push(newGroup);
      }

      if (groups.length === 1) {
        break;
      } else {
        groups.forEach((groupA) => {
          const groupB = randArray(groups);
          const randNodeA = randArray(groupA);
          const randNodeB = randArray(groupB);
          this.addEdge(randNodeA, randNodeB);
        });
      }
    }

    const setDifficulty = (node: string, level: number) => {
      const nodeObj = this.getNode(node) || expect();
      if (nodeObj.difficulty > 0) {
        return;
      }
      nodeObj.getEdgeTargets().forEach(
          (edge) => {

          });
    };

    setDifficulty('entry', 0);
  }

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

  private addNode(overrideId?: string): string {
    const newNode = new Node(overrideId);
    this.nodes.set(newNode.getId(), newNode);
    return newNode.getId();
  }

  private addEdge(from: string, to: string): boolean {
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