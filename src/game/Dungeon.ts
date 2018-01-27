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

export class Dungeon {
  private graph = new Graph();

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
          this.graph.getNodeEdges(node).map((target) => {
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
      if (this.graph.getNodeAttribute(node, DungeonAttributes.Difficulty, -1) >
          -1) {
        return;
      }

      this.graph.setNodeAttribute(node, DungeonAttributes.Difficulty, level);

      maxDifficulty = Math.max(level, maxDifficulty);

      this.graph.getNodeEdges(node).forEach((edge) => {
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
}