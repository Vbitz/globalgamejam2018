import {expect, randArray} from '../common';

import {Graph} from './Graph';

export class Dungeon extends Graph {
  generateLevel() {
    const nodeCount = 200;

    // Add random nodes
    const nodes: string[] = [];

    nodes.push(this.addNode('entry'));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.addNode());
    }

    // Add random initial edges
    const edgeCount = 50;

    for (let i = 0; i < edgeCount; i++) {
      const a = randArray(nodes);
      const b = randArray(nodes);

      this.addEdge(a, b);
    }

    // Keep connecting groups together until there is 1 group.
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

    let maxDifficulty = 0;

    const setDifficulty = (node: string, level: number) => {
      const nodeObj = this.getNode(node) || expect();

      if (nodeObj.difficulty > -1) {
        return;
      }

      nodeObj.difficulty = level;

      maxDifficulty = Math.max(level, maxDifficulty);

      nodeObj.getEdgeTargets().forEach((edge) => {
        setDifficulty(edge, level + 1);
      });
    };

    setDifficulty('entry', 0);

    this.addNode('end');

    this.nodes.forEach((node) => {
      if (node.difficulty === maxDifficulty) {
        this.addEdge(node.getId(), 'end');
      }
    });
  }
}