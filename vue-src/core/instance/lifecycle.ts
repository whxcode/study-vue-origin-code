/* @flow */
/*Github:https://github.com/answershuto*/
import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { observerState } from '../observer/index'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'

import {
    warn,
    noop,
    remove,
    handleError,
    emptyObject,
    validateProp, notProduction
} from '../util/index'

export let activeInstance :any = null

/* 初始化生命周期 */
export function initLifecycle(vm: any) {
    const options = vm.$options
    // locate first non-abstract parent
    /* 将vm对象存储到parent组件中（保证parent组件是非抽象组件，比如keep-alive） */
    let parent = options.parent
    if(parent && !options.absolute) {
        while(parent.$options.abstract && parent.$parent) {
            parent = parent.$parent
        }
        parent.$children.push(vm)
    }
    vm.$parent = parent
    vm.$root = parent ? parent.$root : vm
    vm.$children = []
    vm.$refs = { }

    vm._watcher = null
    vm._inactive = null
    vm._directInactive = false
    vm._isMounted = false
    vm._isDestroyed = false
    vm._isBeignDestroyed = false
}

export function lifecycleMixin(Vue: any) {
    /* 更新节点 */
    Vue.prototype._update = function(vnode: any,hydrating?: boolean) {
        const vm: any = this
        /*如果已经该组件已经挂载过了则代表进入这个步骤是个更新的过程，触发beforeUpdate钩子*/
        if(vm._isMounted) {
            callHook(vm,'beforeUpdate')
        }
        const prefEl = vm.$el
        const prevVnode = vm._vnode
        const prevActiveInstance = activeInstance // null
        activeInstance = vm // this
        vm._vnode = vnode
        /* 基于后端渲染 Vue.prototype.__patch__ 被作用一个入口 */
        if(!prevVnode) {
            // inital render
            vm.$el = vm.__patch__(
                vm.$el,vnode,hydrating,false,vm.$options._parentElm,vm.$options._refElm
            )
        } else {
            // updates
            vm.$el = vm.__patch__(prevVnode,vnode)
        }
        activeInstance = prevActiveInstance
        // update __vue__ refernce
        /* 更新新的实列对象 __vue__ */
        if(prefEl) {
            prefEl.__vue__ = null
        }
        if(vm.$el) {
            vm.$el.__vue__ = vm
        }

        // 如果父节点是一个零时的节点,也要更新
        if(vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
    }

    // 强制更新
    Vue.prototype.$forceUpdate = function() {
        const vm: any = this
        if(vm._watcher) {
            vm._watcher.update()
        }
    }

    // 销毁
    Vue.prototype.$destroy = function() {
        const vm :any = this
        if(vm._isBeignDestroyed) {
            return
        }
        // 调用 beforeDestroy 钩子函数
        callHook(vm,'beforeDestroy')

        // 设置标志位
        vm.isBeignDestroyed = true
        const parent = vm.$parent
        if(parent && !parent._isBeignDestroyed && !vm.$options.abstract) {
            remove(parent.$children,vm)
        }
        /* 该组件下的所有Watcher从其所在的Dep中释放 */
        if(vm._watcher) {
            vm._watcher.teardown()
        }
        let i = vm._watcher.length
        while(i --) {
            vm._watcher[i].teardown()
        }

        if(vm._data_.__ob__) {
            vm._data_.__ob__.vmCount --
        }

        vm.isDestroyed = true
        vm.__patch__(vm.vnode,null)

        // 调用 destroyed 钩子
        callHook(vm,'destroyed')

        // 移除所有事件监听
        vm.$off()

        // 移除引用
        if(vm.$el) {
            vm.$el.__vue__ = null
        }

        // remove reference to DOM nodes
        // 移除 dom 节点 防止内存遗漏
        vm.$options._parentElm = vm.$options._refElm = null
    }
}

// 挂载组件
export function mountComponent(vm: any,el?: Element,hydrating?: boolean) {
    vm.$el = el
    if(!vm.$options.render) {
        /* render 函数不存在的时候就创建一个空的 VNode 节点 */
        vm.$options.render = createEmptyVNode
        if(notProduction()) {
            if( (vm.$options.template && vm.$options.template.charAt(0) !== '#') || vm.$options.el || el ) {
                warn(
                    'You are using the runtime-only build of Vue where the template ' +
                    'compiler is not available. Either pre-compile the templates into ' +
                    'render functions, or use the compiler-included build.',
                    vm
                )
            } else {
                warn(
                    'Failed to mount component: template or render function not defined.',
                    vm
                )
            }
        }
    }

    // 触发 beforeMounted 钩子
    callHook(vm,'beforeMount')
    let updateComponent = null
    if(notProduction() && config.performance && mark) {
        updateComponent = () => {
            const name = vm._name
            const id = vm._uid
            const startTag = `vue-pref-start:${ id }`
            const endTag = `vue-pref-end:${ id }`
            mark(startTag)
            const vnode = vm._render()
            mark(endTag)
            measure(`${ name } render`,startTag,endTag)

            mark(startTag)
            vm._update(vnode,hydrating)
            mark(endTag)
            measure(`${ name } render`,startTag,endTag)
        }
    } else {
        updateComponent = () => {
            vm._update(vm._render(),hydrating)
        }
    }

    /*这里对该vm注册一个Watcher实例，Watcher的getter为updateComponent函数，用于触发所有渲染所需要用到的数据的getter，进行依赖收集，该Watcher实例会存在所有渲染所需数据的闭包Dep中*/
    vm._watcher = new Watcher(vm,updateComponent,noop)
    hydrating = false

    if(vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm,'mounted')
    }
    return vm
}

export function updateChildComponent(vm: any,propsData?: Object,listeners?: Object,parentVnode: any,renderChildren?: Array<any>) {
    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren
    const hasChildren = !!(
        renderChildren || vm.$options._renderChildren || parentVnode.data.scopedSlots || vm.$scopedSlots !== emptyObject
    )
    vm.$options._parentVnode = parentVnode
    vm.$vnode = parentVnode
    if(vm._vnode) {
        vm._vnode.parent = parentVnode
    }
    vm.$options._renderChildren = renderChildren

    // 更新属性
    if(propsData && vm.$options.props) {
        observerState.shouldConvert = false
        if(notProduction()) {
            observerState.isSettingProps = true
        }
        const props = vm._props
        const propsKeys = vm.$options._propsKeys || []
        for(let i = 0;i != propsKeys.length;++ i) {
            const key = propsKeys[i]
            props[key] = validateProp(key,vm.$options.props,propsData,vm)
        }
        observerState.shouldConvert = true
        if(notProduction()) {
            observerState.isSettingProps = false
        }

        vm.$options.propsData = propsData
    }

}
