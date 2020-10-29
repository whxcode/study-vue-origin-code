"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var init_1 = require("./init");
// import
function warn(message) {
}
function Vue(options) {
    // 如果不是他的实列就警告
    if (this instanceof Vue) {
        warn('Vue is a constructor and should be called with the `new` keyword');
    }
    /* 初始化 */
    this._init(options);
}
// 添加 _init 方法
init_1.initMixin(Vue);
exports.default = Vue;
