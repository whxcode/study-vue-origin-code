"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConstructorOptions = exports.initMixin = void 0;
// 初始化文件
/**
 * 先占一个坑位
 * **/
var config_1 = require("../config");
var proxy_1 = require("./proxy");
var state_1 = require("./state");
var render_1 = require("./render");
var events_1 = require("./events");
var perf_1 = require("../util/perf");
var lifecycle_1 = require("./lifecycle");
var inject_1 = require("./inject");
var index_1 = require("../util/index");
// 每一个组件的唯一 id
var uid = 0;
function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        var vm = this;
        vm._uid = uid++;
        var startTag = '', endTag = '';
        if (config_1.default.performance && perf_1.mark) {
            startTag = "vue-perf-init: " + vm._uid;
            endTag = "vue-perf-end: " + vm._uid;
            // todo 调用 mark 函数
            perf_1.mark(startTag);
        }
        // 防止 vm 实列自身被观察的标志位
        vm._isVue = true;
        // 合并配置项
        if (options && options._isComponent) {
            // todo 合并内部组件配置项
            initInternalComponent(vm, options);
        }
        else {
            vm.$options = index_1.mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
        }
        // unknow
        if (index_1.notProduction()) {
            proxy_1.initProxy(vm);
        }
        else {
            vm._renderProxy = vm;
        }
        // expose real self 暴露自己
        vm._self = vm;
        // 初始化生命周期
        lifecycle_1.initLifecycle(vm);
        // 初始化事件
        events_1.initEvents(vm);
        // 初始化渲染
        render_1.initRender(vm);
        // 调用 beforeCrate 钩子函数并且触发 beforeCrate 钩子事件
        lifecycle_1.callHook(vm, 'beforeCrate');
        // resolved injections before data/props
        inject_1.initInjections(vm);
        // 初始化 props、methods、data、computed、watch
        state_1.initState(vm);
        // resolve provide after data/props
        inject_1.initProvide(vm);
        // 调用 created 钩子函数并且触发 created 钩子事件
        lifecycle_1.callHook(vm, 'created');
        //
        if (0 && config_1.default.performance && perf_1.mark) {
            vm._name = index_1.formatComponentName(vm, false);
            perf_1.mark(endTag);
            perf_1.measure(vm._name + " int", startTag, endTag);
        }
        if (vm.$options.el) {
            // 挂载组件
            vm.$mount(vm.$options.el);
        }
    };
}
exports.initMixin = initMixin;
// 合并内有组件
function initInternalComponent(vm, options) {
    var opts = vm.$optnios = Object.create(vm.constructor.options);
    opts.parent = options.parent;
    opts.propsDate = options.propsDate;
    opts._parentVnode = options._parentVnode;
    opts._parentListeners = options._parentListeners;
    opts._renderChildren = options._renderChildren;
    opts._componentTag = options._componentTag;
    opts._parentElm = options._parentElm;
    opts._refElm = options._refElm;
    if (options.render) {
        opts.render = options.render;
        opts.staticRenderFns = options.staticRenderFns;
    }
}
function resolveConstructorOptions(Ctor) {
    var options = Ctor.optnios;
    if (Ctor.super) {
        var superOptions = resolveConstructorOptions(Ctor.super);
        var cachedSuperOptions = Ctor.superOptions;
        if (superOptions !== cachedSuperOptions) {
            Ctor.superOptions = superOptions;
            var modifiedOptions = resolveModifiedOptions(Ctor);
            if (modifiedOptions) {
                index_1.extend(Ctor.extendOptions, modifiedOptions);
            }
            options = Ctor.optnios = index_1.mergeOptions(superOptions, Ctor.extendOptions);
            if (options.name) {
                options.components[options.name] = Ctor;
            }
        }
        return options;
    }
}
exports.resolveConstructorOptions = resolveConstructorOptions;
function resolveModifiedOptions(Ctor) {
    var modified = {};
    var latest = Ctor.options, extended = Ctor.extendOptions, sealed = Ctor.sealedOptions;
    for (var key in sealed) {
        if (latest[key] !== sealed[key]) {
            modified[key] = dedupe(latest[key], extended[key], sealed[key]);
        }
    }
    return modified;
}
function dedupe(latest, extended, sealed) {
    if (Array.isArray(latest)) {
        var res = [];
        sealed = Array.isArray(sealed) ? sealed : [sealed];
        extended = Array.isArray(extended) ? extended : [extended];
        for (var i = 0; i != latest.length; ++i) {
            if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                res.push(latest[i]);
            }
        }
        return res;
    }
    return latest;
}
