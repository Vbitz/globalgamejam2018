import {Agent} from './game/Agent';
import {Dungeon} from './game/Dungeon';

class TestRunner {
  private dungeon: Dungeon;
  private agents: Agent[];

  constructor() {}

  runTest() {
    this.dungeon = new Dungeon();
  }

  runTests(runs: number) {
    for (let i = 0; i < runs; i++) {
      this.runTest();
    }
  }
}

async function main() {}

if (process.mainModule === module) {
  main(process.argv).then((status) => {
    process.exit(1);
  });
}