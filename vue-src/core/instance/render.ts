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
            } else {
                vnode = vm._vnode
            }
        }

        /*如果VNode节点没有创建成功则创建一个空节点*/
        if(!(vnode instanceof VNode)) {
            if(notProduction() && Array.isArray(vnode)) {
                warn(
                    'Multiple root nodes returned from render function. Render function ' +
                    'should return a single root node.',
                    vm
                )
            }
            // 创建一个空节点
            vnode = createEmptyVNode()
        }
        vnode.parent = _parentVnode
        return vnode
    }
    /*
   内部处理render的函数
   这些函数会暴露在Vue原型上以减小渲染函数大小
 */
    /*处理v-once的渲染函数*/
    Vue.prototype._o = markOnce
    /*将字符串转化为数字，如果转换失败会返回原字符串*/
    Vue.prototype._n = toNumber
    /*将val转化成字符串*/
    Vue.prototype._s = toString
    /*处理v-for列表渲染*/
    Vue.prototype._l = renderList
    /*处理slot的渲染*/
    Vue.prototype._t = renderSlot
    /*检测两个变量是否相等*/
    Vue.prototype._q = looseEqual
    /*检测arr数组中是否包含与val变量相等的项*/
    Vue.prototype._i = looseIndexOf
    /*处理static树的渲染*/
    Vue.prototype._m = renderStatic
    /*处理filters*/
    Vue.prototype._f = resolveFilter
    /*从config配置中检查eventKeyCode是否存在*/
    Vue.prototype._k = checkKeyCodes
    /*合并v-bind指令到VNode中*/
    Vue.prototype._b = bindObjectProps
    /*创建一个文本节点*/
    Vue.prototype._v = createTextVNode
    /*创建一个空VNode节点*/
    Vue.prototype._e = createEmptyVNode
    /*处理ScopedSlots*/
    Vue.prototype._u = resolveScopedSlots
}
