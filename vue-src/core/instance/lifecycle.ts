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
    validateProp
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
    vm._isMou
}
