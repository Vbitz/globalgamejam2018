"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function randomId() {
    return 'id_' + (Math.random() * 100000000).toString(16).replace('.', '_');
}
exports.randomId = randomId;
function expect() {
    throw new Error('Expect failed');
}
exports.expect = expect;
function rand(max) {
    return Math.floor(Math.random() * max);
}
exports.rand = rand;
function randArray(arr) {
    return arr[rand(arr.length)];
}
exports.randArray = randArray;
//# sourceMappingURL=common.js.map