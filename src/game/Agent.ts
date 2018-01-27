import {randomId} from '../common';

import {Dungeon} from './Dungeon';
import {Graph} from './Graph';

export enum AgentState {
  /**
   * Waiting for some kind of command from the player.
   */
  Resting,

  /**
   * Using a predetermined path to get to a destination.
   */
  Traveling,

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

/**
 * As they move around
 */
export class Agent {
  private agentId: string;

  private alive = true;

  private state: AgentState = AgentState.Resting;

  private remainingSteps = 0;

  private currentLocationId: string;

  private currentRoute: string[];

  constructor(private dungeon: Dungeon, startingLocation: string) {
    this.currentLocationId = startingLocation;

    this.agentId = randomId();
  }

  isAlive() {
    return this.alive;
  }

  isResting() {
    return this.state === AgentState.Resting;
  }

  changeState(state: AgentState) {
    this.state = state;
  }

  addFood(food: number) {
    this.remainingSteps += food;
  }

  moveToLocation(edgeId: string) {
    this.remainingSteps -= 1;
    this.currentLocationId =
        this.dungeon.getEdgeTarget(this.currentLocationId, edgeId);

    this.onReachLocation();
  }

  idle() {
    if (this.state === AgentState.Resting) {
      return;
    } else if (this.state === AgentState.Traveling) {
      // TODO: step to the next point.
    } else if (this.state === AgentState.Adventuring) {
      // TODO: step to a random node.
    } else if (this.state === AgentState.NOPE) {
      // TODO: Plot a corse to the entry point and move without stopping.
    } else {
      throw new Error('Unknown state');
    }
  }

  private getLocationEdges(): string[] {
    return this.dungeon.getNodeEdges(this.currentLocationId);
  }

  private onReachLocation() {
    // "Look" around the room and gather information into your current graph.
    this.dungeon.getNodeEdges(this.currentLocationId);
  }
}