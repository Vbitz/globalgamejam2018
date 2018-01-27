import {expect, randArray} from '../common';

import {Graph} from './Graph';

enum DungeonSpecialNodes {
  DungeonEntry = 'entry',
  DungeonTreasure = 'treasure'
}

enum DungeonAttributes {
  Difficulty = 'difficulty',
  OptimalPath = 'optimalPath'
}

function makePermissionPair(agentId: string, resourceId: string): string {
  return `${agentId}_${resourceId}`;
}

export class Dungeon {
  private graph = new Graph();

  private permissions: Map<string, boolean> = new Map();

  /**
   * Generates a new dungeon level.
   * @param nodeCount The number of initial nodes added.
   * @param edgeCount The number of edges added.
   */
  generateLevel(nodeCount: number, edgeCount: number) {
    // Add random nodes
    const nodes: string[] = [];

    nodes.push(this.graph.addNode(DungeonSpecialNodes.DungeonEntry));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.graph.addNode());
    }

    // Add random initial edges
    for (let i = 0; i < edgeCount; i++) {
      const a = randArray(nodes);
      const b = randArray(nodes);

      this.graph.addEdge(a, b);
    }

    // Keep connecting groups together until there is 1 group.
    while (true) {
      const groups: string[][] = [];

      const nodeList = Array.from(nodes);

      while (nodeList.length > 0) {
        const newGroup = [nodeList.pop() || expect()];

        const walkNodes = (node: string) => {
          this.graph.getNodeEdgeTargets(node).map((target) => {
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

          this.graph.addEdge(randNodeA, randNodeB);
        });
      }
    }

    let maxDifficulty = 0;

    const setDifficulty = (node: string, level: number) => {
      const diff =
          this.graph.getNodeAttribute(node, DungeonAttributes.Difficulty, -1);

      if (diff > -1) {
        return;
      }

      this.graph.setNodeAttribute(node, DungeonAttributes.Difficulty, level);

      maxDifficulty = Math.max(level, maxDifficulty);

      this.graph.getNodeEdgeTargets(node).forEach((edge) => {
        setDifficulty(edge, level + 1);
      });
    };

    setDifficulty('entry', 0);

    this.graph.addNode(DungeonSpecialNodes.DungeonTreasure);

    this.graph.getAllNodes().forEach((node) => {
      if (this.graph.getNodeAttribute(
              node, DungeonAttributes.Difficulty, -1) === maxDifficulty) {
        this.graph.addEdge(node, DungeonSpecialNodes.DungeonTreasure);
      }
    });

    const optimalPath = this.graph.getPath(
        DungeonSpecialNodes.DungeonEntry, DungeonSpecialNodes.DungeonTreasure);

    optimalPath.forEach((node) => {
      this.graph.setNodeAttribute(node, DungeonAttributes.OptimalPath, true);
    });
  }

  getEdgeTarget(agentId: string, nodeId: string, edgeId: string): string|null {
    if (!this.checkRead(agentId, nodeId)) {
      return null;
    } else {
      return this.graph.getEdgeTarget(nodeId, edgeId);
    }
  }

  getNodeEdges(agentId: string, nodeId: string): string[]|null {
    if (!this.checkRead(agentId, nodeId)) {
      return null;
    } else {
      return this.graph.getNodeEdgeTargets(nodeId);
    }
  }

  visit(agentId: string, nodeId: string) {
    this.permissions.set(makePermissionPair(agentId, nodeId), true);
  }

  getAllNodes(agentId: string): string[] {
    return this.graph.getAllNodes().filter((n) => this.hasAccess(agentId, n));
  }

  exportDotEdges(nodeId: string): string {
    return Array
        .from(
            this.graph.getNodeEdgeIds(nodeId),
            (e) => `${nodeId} -> ${this.graph.getEdgeTarget(nodeId, e)};`)
        .join('\n');
  }

  exportDotNode(nodeId: string): string {
    let label = nodeId;
    const difficulty =
        this.graph.getNodeAttribute(nodeId, DungeonAttributes.Difficulty, -1);
    if (difficulty > 0) {
      label = `Level ${difficulty}`;
    }
    const color = this.graph.getNodeAttribute(
                      nodeId, DungeonAttributes.OptimalPath, false) ?
        'red' :
        'black';
    return `${nodeId}[label=${JSON.stringify(label)}, shape=square, color=${
        JSON.stringify(color)}];`;
  }

  exportDot(): string {
    let body = '';

    this.graph.getAllNodes().forEach((v) => {
      body += `${this.exportDotNode(v)}\n`;
    });

    this.graph.getAllNodes().forEach((v) => {
      body += `${this.exportDotEdges(v)}\n`;
    });

    return `digraph G {
        ${body}
      }`;
  }

  hasAccess(agentId: string, resourceId: string): boolean {
    return this.checkRead(agentId, resourceId);
  }

  isInDungeon(agentId: string, nodeId: string): boolean {
    return nodeId === DungeonSpecialNodes.DungeonEntry;
  }

  private checkRead(agentId: string, resourceId: string): boolean {
    return this.permissions.has(makePermissionPair(agentId, resourceId));
  }
}