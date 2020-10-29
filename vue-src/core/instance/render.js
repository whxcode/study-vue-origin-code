"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMixin = exports.initRender = void 0;
var index_1 = require("../util/index");
var vnode_1 = require("../vdom/vnode");
/*Github:https://github.com/answershuto*/
var create_element_1 = require("../vdom/create-element");
var render_list_1 = require("./render-helpers/render-list");
var render_slot_1 = require("./render-helpers/render-slot");
var resolve_filter_1 = require("./render-helpers/resolve-filter");
var check_keycodes_1 = require("./render-helpers/check-keycodes");
var bind_object_props_1 = require("./render-helpers/bind-object-props");
var render_static_1 = require("./render-helpers/render-static");
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
            else {
                vnode = vm._vnode;
            }
        }
        /*如果VNode节点没有创建成功则创建一个空节点*/
        if (!(vnode instanceof vnode_1.default)) {
            if (index_1.notProduction() && Array.isArray(vnode)) {
                index_1.warn('Multiple root nodes returned from render function. Render function ' +
                    'should return a single root node.', vm);
            }
            // 创建一个空节点
            vnode = vnode_1.createEmptyVNode();
        }
        vnode.parent = _parentVnode;
        return vnode;
    };
    /*
   内部处理render的函数
   这些函数会暴露在Vue原型上以减小渲染函数大小
 */
    /*处理v-once的渲染函数*/
    Vue.prototype._o = render_static_1.markOnce;
    /*将字符串转化为数字，如果转换失败会返回原字符串*/
    Vue.prototype._n = index_1.toNumber;
    /*将val转化成字符串*/
    Vue.prototype._s = index_1.toString;
    /*处理v-for列表渲染*/
    Vue.prototype._l = render_list_1.renderList;
    /*处理slot的渲染*/
    Vue.prototype._t = render_slot_1.renderSlot;
    /*检测两个变量是否相等*/
    Vue.prototype._q = index_1.looseEqual;
    /*检测arr数组中是否包含与val变量相等的项*/
    Vue.prototype._i = index_1.looseIndexOf;
    /*处理static树的渲染*/
    Vue.prototype._m = render_static_1.renderStatic;
    /*处理filters*/
    Vue.prototype._f = resolve_filter_1.resolveFilter;
    /*从config配置中检查eventKeyCode是否存在*/
    Vue.prototype._k = check_keycodes_1.checkKeyCodes;
    /*合并v-bind指令到VNode中*/
    Vue.prototype._b = bind_object_props_1.bindObjectProps;
    /*创建一个文本节点*/
    Vue.prototype._v = vnode_1.createTextVNode;
    /*创建一个空VNode节点*/
    Vue.prototype._e = vnode_1.createEmptyVNode;
    /*处理ScopedSlots*/
    Vue.prototype._u = resolve_slots_1.resolveScopedSlots;
}
exports.renderMixin = renderMixin;
