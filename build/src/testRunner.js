"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dungeon_1 = require("./game/Dungeon");
var TestRunner = /** @class */ (function () {
    function TestRunner() {
    }
    TestRunner.prototype.runTest = function () {
        this.dungeon = new Dungeon_1.Dungeon();
    };
    TestRunner.prototype.runTests = function (runs) {
        for (var i = 0; i < runs; i++) {
            this.runTest();
        }
    };
    return TestRunner;
}());
function main() { }
//# sourceMappingURL=testRunner.js.map