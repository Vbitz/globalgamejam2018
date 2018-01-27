import {expect, randArray} from '../common';

import {Graph} from './Graph';

export class Dungeon extends Graph {
  generateLevel(nodeCount: number, edgeCount: number) {
    // Add random nodes
    const nodes: string[] = [];

    nodes.push(this.addNode('entry'));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.addNode());
    }

    // Add random initial edges
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
          this.getNodeEdges(node).map((target) => {
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
      if (this.getNodeAttribute(node, 'difficulty', -1) > -1) {
        return;
      }

      this.setNodeAttribute(node, 'difficulty', level);

      maxDifficulty = Math.max(level, maxDifficulty);

      this.getNodeEdges(node).forEach((edge) => {
        setDifficulty(edge, level + 1);
      });
    };

    setDifficulty('entry', 0);

    this.addNode('end');

    this.getAllNodes().forEach((node) => {
      if (this.getNodeAttribute(node, 'difficulty', -1) === maxDifficulty) {
        this.addEdge(node, 'end');
      }
    });

    const optimalPath = this.getPath('entry', 'end');

    optimalPath.forEach((node) => {
      this.setNodeAttribute(node, 'optimalPath', true);
    });
  }
}