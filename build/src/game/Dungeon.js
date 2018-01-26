"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("../common");
var Edge = /** @class */ (function () {
    function Edge(target) {
        this.target = target;
    }
    Edge.prototype.getTarget = function () {
        return this.target;
    };
    return Edge;
}());
var Node = /** @class */ (function () {
    function Node() {
        this.edges = [];
        this.id = common_1.randomId();
    }
    Node.prototype.getId = function () {
        return this.id;
    };
    Node.prototype.addEdgeTo = function (target) {
        this.edges.push(new Edge(target));
    };
    Node.prototype.exportDot = function () {
        var _this = this;
        return "" + this.edges.map(function (e) { return _this.getId() + " -> " + e.getTarget() + ";"; })
            .join('\n');
    };
    Node.prototype.getEdgeTargets = function () {
        return this.edges.map(function (edge) { return edge.getTarget(); });
    };
    return Node;
}());
var Dungeon = /** @class */ (function () {
    function Dungeon() {
        this.nodes = new Map();
    }
    Dungeon.prototype.generateLevel = function () {
        var _this = this;
        console.log('Generating');
        var nodeCount = 100;
        // Add random nodes
        var nodes = [];
        for (var i = 0; i < nodeCount; i++) {
            nodes.push(this.addNode());
        }
        // Add random initial edges
        var edgeCount = 200;
        for (var i = 0; i < edgeCount; i++) {
            var a = common_1.randArray(nodes);
            var b = common_1.randArray(nodes);
            this.addEdge(a, b);
        }
        var _loop_1 = function () {
            var groups = [];
            var nodeList = Array.from(nodes);
            var _loop_2 = function () {
                var newGroup = [nodeList.pop() || common_1.expect()];
                var walkNodes = function (node) {
                    var nodeObj = _this.getNode(node) || common_1.expect();
                    nodeObj.getEdgeTargets().map(function (target) {
                        if (newGroup.indexOf(target) !== -1) {
                            return;
                        }
                        var targetIndex = nodeList.indexOf(target);
                        // Add the node to the group.
                        newGroup.push(target);
                        // Remove the node from the list.
                        nodeList.splice(targetIndex, 1);
                        walkNodes(target);
                    });
                };
                walkNodes(newGroup[0]);
                groups.push(newGroup);
            };
            while (nodeList.length > 0) {
                _loop_2();
            }
            console.log(groups);
            if (groups.length === 1) {
                return "break";
            }
            else {
                groups.forEach(function (groupA) {
                    var groupB = common_1.randArray(groups);
                    var randNodeA = common_1.randArray(groupA);
                    var randNodeB = common_1.randArray(groupB);
                    _this.addEdge(randNodeA, randNodeB);
                });
            }
        };
        while (true) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    Dungeon.prototype.exportDot = function () {
        var body = '';
        this.nodes.forEach(function (v, k) { body += k + ";\n"; });
        this.nodes.forEach(function (v) { body += v.exportDot() + "\n"; });
        return "digraph G {\n        " + body + "\n      }";
    };
    Dungeon.prototype.addNode = function () {
        var newNode = new Node();
        this.nodes.set(newNode.getId(), newNode);
        return newNode.getId();
    };
    Dungeon.prototype.addEdge = function (from, to) {
        var a = this.getNode(from);
        var b = this.getNode(to);
        if (!a) {
            throw new Error("from{" + from + "} not found.");
        }
        if (!b) {
            throw new Error("to{" + to + "} not found.");
        }
        a.addEdgeTo(to);
        b.addEdgeTo(from);
    };
    Dungeon.prototype.getNode = function (id) {
        return this.nodes.get(id) || null;
    };
    return Dungeon;
}());
exports.Dungeon = Dungeon;
//# sourceMappingURL=Dungeon.js.map