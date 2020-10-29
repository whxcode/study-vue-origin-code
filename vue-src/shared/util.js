"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMap = exports.notProduction = exports.identity = exports.no = exports.noop = void 0;
// 不执行任何操作
function noop() { }
exports.noop = noop;
exports.no = function () { return false; };
exports.identity = function (_) { return _; };
exports.notProduction = function () { return process.env.NODE_ENV !== 'production'; };
function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var value = list_1[_i];
        map[value] = true;
    }
    return function (key) {
        return expectsLowerCase ? map[key.toLocaleString()] : map[key];
    };
}
exports.makeMap = makeMap;
