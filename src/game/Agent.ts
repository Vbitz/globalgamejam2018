enum AgentState {
  /**
   * Waiting for some kind of command from the player.
   */
  Resting,

  /**
   * Just walking though the dungeon gradually producing a map of the interior.
   */
  Adventuring,

  /**
   * Just encountered something really scarry. Backtracking though the history
   * to get to the entrance..
   */
  NOPE,
}

export class Agent {
  private alive = true;

  private state: AgentState = AgentState.Resting;

  isAlive() {
    return this.alive;
  }

  isResting() {
    return this.state === AgentState.Resting;
  }
}