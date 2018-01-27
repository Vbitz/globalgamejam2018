import {readFile as readFile_, writeFile as writeFile_} from 'fs';
import {promisify} from 'util';

import {Agent} from './game/Agent';
import {Dungeon} from './game/Dungeon';
import {Graph} from './game/Graph';

const writeFile = promisify(writeFile_);
const readFile = promisify(readFile_);

/**
 * Automated testing platform to play the game.
 *
 * The strategy is to send adventurers into the dungeon to try and explore the
 * entire thing and get to the exit.
 *
 * The test runner keeps a graph that gradually tries to map to the real dungeon
 * map.
 *
 * When an agent walks the graph they come back the other end with the set of
 * steps they did. For each node they also know the edges on them. The algorithm
 * for the test runner is to send out all the agents to explore a number of
 * steps beyond their target and come back with the information. Targets are
 * decided by looking at the list of edges with unknown nodes on the other side.
 */
class TestRunner {
  private dungeon: Dungeon;
  private agents: Agent[];

  constructor() {}

  async runTest(): Promise<void> {
    this.dungeon = new Dungeon();

    const currentGraph = new Graph();

    currentGraph.addNode('entry');

    this.dungeon.generateLevel(25, 10);

    // const graph = this.dungeon.exportDot();

    // await writeFile('out.dot', graph, 'utf8');

    // let livingAgents = this.agents.filter((agent) => agent.isAlive());

    // while (livingAgents.length > 1) {
    //   livingAgents = this.agents.filter((agent) => agent.isAlive());
    // }
  }

  async runTests(runs: number): Promise<void> {
    for (let i = 0; i < runs; i++) {
      await this.runTest();
    }
  }
}

async function main(args: string[]): Promise<number> {
  const runner = new TestRunner();

  await runner.runTests(100000);

  return 0;
}

if (process.mainModule === module) {
  main(process.argv).then((status) => {
    process.exit(status);
  });
}