export declare class Dungeon {
    private nodes;
    generateLevel(): void;
    exportDot(): string;
    private addNode();
    private addEdge(from, to);
    private getNode(id);
}
