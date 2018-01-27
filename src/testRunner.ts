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
 */
class TestRunner {
  private dungeon: Dungeon;
  private agents: Agent[];

  constructor() {}

  async runTest(): Promise<void> {
    this.dungeon = new Dungeon();

    const currentGraph = new Graph();

    currentGraph.addNode('entry');

    this.dungeon.generateLevel();

    let livingAgents = this.agents.filter((agent) => agent.isAlive());

    while (livingAgents.length > 1) {
      livingAgents = this.agents.filter((agent) => agent.isAlive());
    }
  }

  async runTests(runs: number): Promise<void> {
    for (let i = 0; i < runs; i++) {
      await this.runTest();
    }
  }
}

async function main(args: string[]): Promise<number> {
  const runner = new TestRunner();

  await runner.runTest();

  return 0;
}

if (process.mainModule === module) {
  main(process.argv).then((status) => {
    process.exit(status);
  });
}