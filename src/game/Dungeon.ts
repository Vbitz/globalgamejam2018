import {expect, randArray, randomId} from '../common';

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

  hasEdgeTo(target: string) {
    return this.edges.filter((edge) => edge.getTarget() === target).length > 0;
  }

  exportDot(): string {
    return `${
        this.edges.map((e) => `${this.getId()} -> ${e.getTarget()};`)
            .join('\n')}`;
  }

  getEdgeTargets(): string[] {
    return this.edges.map((edge) => edge.getTarget());
  }
}

export class Dungeon {
  private nodes: Map<string, Node> = new Map();

  generateLevel() {
    const nodeCount = 500;

    // Add random nodes
    const nodes: string[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.addNode());
    }

    // Add random initial edges
    const edgeCount = 100;

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
  }

  exportDot(): string {
    let body = '';

    this.nodes.forEach((v, k) => {
      body += `${k};\n`;
    });

    this.nodes.forEach((v) => {
      body += `${v.exportDot()}\n`;
    });

    return `digraph G {
        ${body}
      }`;
  }

  private addNode(): string {
    const newNode = new Node();
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