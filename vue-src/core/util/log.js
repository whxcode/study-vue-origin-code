"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = void 0;
function warn() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    console.warn.apply(console, arg);
}
exports.warn = warn;
