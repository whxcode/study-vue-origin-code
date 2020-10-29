"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateMixin = exports.defineComputed = exports.initState = exports.proxy = void 0;
// 初始化一些基本数据
var config_1 = require("../config");
var dep_1 = require("../observer/dep");
var watcher_1 = require("../observer/watcher");
var index_1 = require("../observer/index");
var index_2 = require("../util/index");
var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: index_2.noop,
    set: index_2.noop
};
// by proxy function wild data、props in data proxy vm up，and explain vm.key quality vm.data.key
function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key];
    };
    // @ts-ignore
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val;
    };
}
exports.proxy = proxy;
// initialize props、data、method、computed、watch
function initState(vm) {
    vm._watchers = [];
    var opts = vm.$options;
    var props = opts.props, methods = opts.methods, data = opts.data, computed = opts.computed, watch = opts.watch;
    if (props) { // 初始化 props
        initProps(vm, props);
    }
    if (methods) { // 初始化 methods
        initMethods(vm, methods);
    }
    if (data) { // 初始化 data
        initData(vm);
    }
    else {
        index_1.observe(vm._data = {}, true /* asRootData */);
    }
    // 初始化 computed
    if (computed) {
        initComputed(vm, computed);
    }
    // 初始化 watchers
    if (watch) {
        initWatch(vm, watch);
    }
}
exports.initState = initState;
var isReservedProp = {
    key: 1,
    ref: 1,
    slot: 1
};
/*初始化props*/
function initProps(vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    /*缓存属性的key，使得将来能直接使用数组的索引值来更新props来替代动态地枚举对象*/
    var keys = vm.$options._propKeys = [];
    /*根据$parent是否存在来判断当前是否是根结点*/
    var isRoot = !vm.$parent;
    // root instance props should be converted
    /*根结点会给shouldConvert赋true，根结点的props应该被转换*/
    index_1.observerState.shouldConvert = isRoot;
    var _loop_1 = function (key) {
        /*props的key值存入keys（_propKeys）中*/
        keys.push(key);
        /*验证prop,不存在用默认值替换，类型为bool则声称true或false，当使用default中的默认值的时候会将默认值的副本进行observe*/
        var value = index_2.validateProp(key, propsOptions, propsData, vm);
        /* istanbul ignore else */
        /*判断是否是保留字段，如果是则发出warning*/
        if (isReservedProp[key] || config_1.default.isReservedAttr(key)) {
            index_2.warn("\"" + key + "\" is a reserved attribute and cannot be used as component prop.", vm);
        }
        index_1.defineReactive(props, key, value, function () {
            /*
              由于父组件重新渲染的时候会重写prop的值，所以应该直接使用prop来作为一个data或者计算属性的依赖
              https://cn.vuejs.org/v2/guide/components.html#字面量语法-vs-动态语法
            */
            if (vm.$parent && !index_1.observerState.isSettingProps) {
                index_2.warn("Avoid mutating a prop directly since the value will be " +
                    "overwritten whenever the parent component re-renders. " +
                    "Instead, use a data or computed property based on the prop's " +
                    ("value. Prop being mutated: \"" + key + "\""), vm);
            }
        });
        index_1.defineReactive(props, key, value);
        // static props are already proxied on the component's prototype
        // during Vue.extend(). We only need to proxy props defined at
        // instantiation here.
        /*Vue.extend()期间，静态prop已经在组件原型上代理了，我们只需要在这里进行代理prop*/
        if (!(key in vm)) {
            proxy(vm, "_props", key);
        }
    };
    for (var key in propsOptions) {
        _loop_1(key);
    }
    index_1.observerState.shouldConvert = true;
}
// 初始化 data
function initData(vm) {
    var data = vm.$options.data;
    // 或者数据
    data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
    // 是纯 javaScript 对象
    if (!index_2.isPlainObject(data)) {
        data = {};
        index_2.warn('data functions should return an object:\n' +
            'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
    }
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var i = keys.length;
    while (i--) {
        // 验证 data 里面是否与 props中的属性重复
        if (props && index_2.hasOwn(props, keys[i])) {
            index_2.warn("The data property \"" + keys[i] + "\" is already declared as a prop. " +
                "Use prop default value instead.", vm);
        }
        else if (!index_2.isReserved(keys[i])) {
            // 通过代理访问
            props(vm, "_data", keys[i]);
        }
        index_1.observe(data, true);
    }
}
function getData(data, vm) {
    try {
        return data.call(vm);
    }
    catch (e) {
        index_2.handleError(e, vm, "data call error");
        return {};
    }
}
var computedWatcherOptions = { lazy: true };
function initComputed(vm, computed) {
    var watchers = vm._computedWatchers = Object.create(null);
    for (var key in computed) {
        // value cloud a function and { get() => v,set(v) }
        var userDef = computed[key];
        var getter = typeof userDef === 'function' ? userDef : userDef.get;
        if (getter == undefined) {
            index_2.warn("No getter function has been defined for computed property \"" + key + "\".", vm);
            getter = index_2.noop;
        }
        watchers[key] = new watcher_1.default(vm, getter, index_2.noop, computedWatcherOptions);
        if (!(key in vm)) {
            defineComputed(vm, key, userDef);
        }
        else if (key in vm.$data) { // 重复定义
            index_2.warn("The computed property \"" + key + "\" is already defined in data.", vm);
        }
        else if (key in vm.$options.props && key in vm.$options.props) { // 重复定义
            index_2.warn("The computed property \"" + key + "\" is already defined as a prop.", vm);
        }
    }
}
// 定义计算属性
function defineComputed(target, key, userDef) {
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = index_2.noop;
    }
    else {
        sharedPropertyDefinition.get = userDef.get ? userDef.cache !== false ?
            createComputedGetter(key) : userDef.get : index_2.noop;
        sharedPropertyDefinition.set = userDef.set || index_2.noop;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
}
exports.defineComputed = defineComputed;
// 创建计算属性的 getter
function createComputedGetter(key) {
    return function computedGetter() {
        var watcher = this._computedWatchers && this._computedWatchers[key];
        if (watcher && watcher.dirty) {
            watcher.evaluate();
        }
        if (watcher && dep_1.default.target) {
            watcher.depend();
        }
        return watcher.value;
    };
}
// 初始化方法
function initMethods(vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
        if (methods[key] == null) {
            index_2.warn("method \"" + key + "\" has an undefined value in the component definition. " +
                "Did you reference the function correctly?", vm);
        }
        vm[key] = methods[key] == null ? index_2.noop : index_2.bind(methods[key], vm);
        if (props && hasOwnp(props, key)) {
            index_2.warn("method \"" + key + "\" has already been defined as a prop.", vm);
        }
    }
}
// 初始化 watchers
function initWatch(vm, watch) {
    for (var key in watch) {
        var handler = watch[key];
        if (Array.isArray(handler)) {
            for (var _i = 0, handler_1 = handler; _i < handler_1.length; _i++) {
                var handle = handler_1[_i];
                createWatcher(vm, key, handle);
            }
        }
        else {
            createWatcher(vm, key, handler);
        }
    }
}
// 创建一个观察者 Watcher
function createWatcher(vm, key, handler) {
    var options = null;
    if (index_2.isPlainObject(handler)) {
        // watch 处理对象形式
        /**
         * watch: {
         *     test: {
         *         handler: function {}
         *     }
         * }
         *
         * */
        options = handler;
        handler = handler.handler;
    }
    // 也可以直接使用 vm 中的 methods里面的方法
    if (typeof handler === 'string') {
        handler = vm[handler];
    }
    /* 使用 $watch 方法创建一个 watch 来观察该对象的变化 */
    vm.$watch(key, handler, options);
}
function stateMixin(Vue) {
    var dataDef = {};
    dataDef.get = function () { return this._data; };
    var propsDef = {
        get: function () {
            return this._props;
        },
        set: function () {
            index_2.warn("$props is readonly.", this);
        }
    };
    dataDef.set = function (newData) {
        index_2.warn('Avoid replacing instance root $data. ' +
            'Use nested data properties instead.', this);
    };
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);
    Vue.prototype.$set = index_1.set;
    Vue.prototype.$delete = index_1.del;
    /**
     * $watch 方法
     * */
    Vue.prototype.$watch = function (expOrFn, cb, options) {
        var vm = this;
        options = options || {};
        // @ts-ignore
        options.user = true;
        var watcher = new watcher_1.default(vm, expOrFn, cb, options);
        // @ts-ignore
        options.immediate && cb.call(vm, watcher.value);
        return function unwatchFn() {
            watcher.teardown();
        };
    };
}
exports.stateMixin = stateMixin;
