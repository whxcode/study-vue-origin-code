"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMixin = exports.initRender = void 0;
var index_1 = require("../util/index");
var vnode_1 = require("../vdom/vnode");
/*Github:https://github.com/answershuto*/
var create_element_1 = require("../vdom/create-element");
var resolve_slots_1 = require("./render-helpers/resolve-slots");
/** 初始化 render **/
function initRender(vm) {
    vm._vnode = null; // 子树的根节点
    vm._staticTress = null;
    // 父树中的占位符节点
    var parentVnode = vm.$vnode = vm.$options._parentVnode;
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolve_slots_1.resolveSlots(vm.$options._renderChildren, renderContext);
    vm.$scopedSlots = index_1.emptyObject;
    // 将createElement 函数绑定到该实列上,该 vm 存在闭包中,不可修改 vm 实列则固定。
    vm._c = function (a, b, c, d) { return create_element_1.createElement(vm, a, b, c, d, false); };
    // 常规方法用于公共版本,被用来作为用户界面的渲染方法
    vm.$createElement = function (a, b, c, d) { return create_element_1.createElement(vm, a, b, c, d, true); };
}
exports.initRender = initRender;
function renderMixin(Vue) {
    var _this = this;
    Vue.prototype.$nextTick = function (fn) { return index_1.nextTick(fn, _this); };
    /* _render 渲染函数 返回一个 VNode 节点 */
    Vue.prototype._render = function () {
        var vm = this;
        var _a = vm.$options, render = _a.render, staticRenderFns = _a.staticRenderFns, _parentVnode = _a._parentVnode;
        if (vm._isMounted) {
            // 在重新渲染时会克隆槽位节点，不知道是不是因为 VNode 是必须唯一的原因
            for (var key in vm.$slots) {
                // 克隆新的节点
                vm.$slots[key] = vnode_1.cloneVNodes(vm.$slots[key]);
            }
        }
        // 作用域
        vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || index_1.emptyObject;
        if (staticRenderFns && !vm._staticTress) {
            // 用来存放 static 节点，已经被渲染并且不存在 v-for 中的 static 节点不需要重新渲染,只需要浅拷贝一下
            vm._staticTress = [];
        }
        vm.$vnode = _parentVnode;
        var vnode = null;
        try {
            // 调用 render 函数 ,返回一个 vNode 节点
            vnode = render.call(vm._renderProxy, vm.$createElement);
        }
        catch (e) {
            index_1.handleError(e, vm, "render call error.");
            // TODO 环境变量判断
            if (index_1.notProduction()) {
                vnode = vm.$options.renderError ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e) : vm._vnode;
            }
        }
    };
}
exports.renderMixin = renderMixin;
