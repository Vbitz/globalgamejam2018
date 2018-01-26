import {Agent} from './game/Agent';
import {Dungeon} from './game/Dungeon';

class TestRunner {
  private dungeon: Dungeon;
  private agents: Agent[];

  constructor() {}

  runTest() {
    this.dungeon = new Dungeon();

    this.dungeon.generateLevel();

    return;

    // while (this.agents.filter((agent) => agent.isAlive()).length > 1) {
    // }
  }

  runTests(runs: number) {
    for (let i = 0; i < runs; i++) {
      this.runTest();
    }
  }
}

async function main(args: string[]): Promise<number> {
  const runner = new TestRunner();

  runner.runTest();

  return 0;
}

if (process.mainModule === module) {
  main(process.argv).then((status) => {
    process.exit(status);
  });
}