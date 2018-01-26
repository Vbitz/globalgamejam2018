import {readFile as readFile_, writeFile as writeFile_} from 'fs';
import {promisify} from 'util';

import {Agent} from './game/Agent';
import {Dungeon} from './game/Dungeon';

const writeFile = promisify(writeFile_);
const readFile = promisify(readFile_);

class TestRunner {
  private dungeon: Dungeon;
  private agents: Agent[];

  constructor() {}

  async runTest(): Promise<void> {
    this.dungeon = new Dungeon();

    this.dungeon.generateLevel();

    const graph = this.dungeon.exportDot();

    await writeFile('out.dot', graph, 'utf8');

    return;

    // while (this.agents.filter((agent) => agent.isAlive()).length > 1) {
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

  await runner.runTest();

  return 0;
}

if (process.mainModule === module) {
  main(process.argv).then((status) => {
    process.exit(status);
  });
}