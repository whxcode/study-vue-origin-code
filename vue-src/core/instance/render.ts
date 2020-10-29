import {
    warn,
    nextTick,
    toNumber,
    toString,
    looseEqual,
    emptyObject,
    handleError,
    looseIndexOf,
    notProduction
} from '../util/index'

import VNode, {
    cloneVNodes,
    createTextVNode,
    createEmptyVNode
} from '../vdom/vnode'
/*Github:https://github.com/answershuto*/
import { createElement } from '../vdom/create-element'
import { renderList } from './render-helpers/render-list'
import { renderSlot } from './render-helpers/render-slot'
import { resolveFilter } from './render-helpers/resolve-filter'
import { checkKeyCodes } from './render-helpers/check-keycodes'
import { bindObjectProps } from './render-helpers/bind-object-props'
import { renderStatic, markOnce } from './render-helpers/render-static'
import { resolveSlots, resolveScopedSlots } from './render-helpers/resolve-slots'

/** 初始化 render **/
export function initRender(vm: any) {
    vm._vnode = null // 子树的根节点
    vm._staticTress = null
    // 父树中的占位符节点
    const parentVnode = vm.$vnode = vm.$options._parentVnode
    const renderContext = parentVnode && parentVnode.context
    vm.$slots = resolveSlots(vm.$options._renderChildren,renderContext)
    vm.$scopedSlots = emptyObject
    // 将createElement 函数绑定到该实列上,该 vm 存在闭包中,不可修改 vm 实列则固定。
    vm._c = (a,b,c,d) => createElement(vm,a,b,c,d,false)
    // 常规方法用于公共版本,被用来作为用户界面的渲染方法
    vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)
}

export function renderMixin(Vue: any) {
    Vue.prototype.$nextTick = (fn: Function) => nextTick(fn,this)
    /* _render 渲染函数 返回一个 VNode 节点 */
    Vue.prototype._render = function(): VNode {
        const vm: any = this
        const { render,staticRenderFns,_parentVnode } = vm.$options
        if(vm._isMounted) {
            // 在重新渲染时会克隆槽位节点，不知道是不是因为 VNode 是必须唯一的原因
            for(const key in vm.$slots) {
                // 克隆新的节点
                vm.$slots[key] = cloneVNodes(vm.$slots[key])
            }
        }
        // 作用域
        vm.$scopedSlots = ( _parentVnode && _parentVnode.data.scopedSlots ) || emptyObject
        if(staticRenderFns && !vm._staticTress) {
            // 用来存放 static 节点，已经被渲染并且不存在 v-for 中的 static 节点不需要重新渲染,只需要浅拷贝一下
            vm._staticTress = []
        }
        vm.$vnode = _parentVnode
        let vnode = null
        try {
            // 调用 render 函数 ,返回一个 vNode 节点
            vnode = render.call(vm._renderProxy,vm.$createElement)
        } catch (e) {
            handleError(e,vm,`render call error.`)
            // TODO 环境变量判断
            if (notProduction()) {
                vnode = vm.$options.renderError ? vm.$options.renderError.call(vm._renderProxy,vm.$createElement,e) : vm._vnode
            }
        }
    }
}
