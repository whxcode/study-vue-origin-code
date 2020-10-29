"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProxy = void 0;
var config_1 = require("../config");
var util_1 = require("../util");
var initProxy = null;
exports.initProxy = initProxy;
// TODO 判断环境变量
// @ts-ignore
if (0 && 'evn' !== 'production') {
    var allowedGlobals_1 = util_1.makeMap('Infinity,undefined,NaN,isFinite,isNaN,' +
        'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
        'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
        'require' // for Webpack/Browserify
    );
    var warnNonPresent_1 = function (target, key) {
        util_1.warn("Property or method \"" + key + "\" is not defined on the instance but " +
            "referenced during render. Make sure to declare reactive data " +
            "properties in the data option.", target);
    };
    var hasProxy_1 = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);
    if (hasProxy_1) {
        // 使用内建 key 防止用户覆盖
        var isBuiltInModifier_1 = util_1.makeMap("stop,prevent,self,ctrl,shift,alt,meta");
        config_1.default.keyCodes = new Proxy(config_1.default.keyCodes, {
            set: function (target, key, value) {
                if (isBuiltInModifier_1(key)) {
                    // 防止用户覆盖内建快捷键
                    util_1.warn("Avoid overwriting built-in modifier in config.keyCodes: ." + key);
                    return false;
                }
                return Reflect.set(target, key, value);
            }
        });
    }
    var hasHandler_1 = {
        has: function (target, key) {
            var has = key in target;
            var isAllowed = allowedGlobals_1(key) || key.charAt(0) === '_';
            if (!has && !isAllowed) {
                warnNonPresent_1(target, key);
            }
            return has || !isAllowed;
        }
    };
    var getHandler_1 = {
        get: function (target, key) {
            if (typeof key === 'string' && !(key in target)) {
                warnNonPresent_1(target, key);
            }
            return target[key];
        }
    };
    exports.initProxy = initProxy = function initProxy(vm) {
        if (hasProxy_1) {
            var options = vm.$options;
            var handlers = options.render && options.render._withStripped ? getHandler_1 : hasHandler_1;
            vm._renderProxy = new Proxy(vm, handlers);
        }
        else {
            vm._renderProxy = vm;
        }
    };
}
