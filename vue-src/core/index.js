"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var instance_1 = require("./instance");
// import
function initGlobalAPI() {
}
// import
function isServerRendering() {
}
// 判断是不是服务器渲染
Object.defineProperty(instance_1.default.prototype, '$isServer', {
    get: isServerRendering
});
// @ts-ignore
instance_1.default.version = '__VERSION__';
exports.default = instance_1.default;
