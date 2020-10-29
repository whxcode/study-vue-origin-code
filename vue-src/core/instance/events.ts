import { updateListeners } from '../vdom/helpers/index'
import {toArray, tip, hyphenate, formatComponentName, notProduction} from '../util/index'
export function initEvents(vm: any) {
    /* 在 vm上创建一个 _events 对象,用来存放事件 */
    vm._events = Object.create(null)
    // 标识这个事件是否位 生命周期函数
    vm._hasHookEvent = false
    // 初始化父组件的 attach 的事情
    const listeners = vm.$options._parentListeners
    if(listeners) {
        updateComponentListeners(vm,listeners)
    }
}
let target: any = null
// 有 once 的时候注册一个只会触发一次的方法，没有 once 的时候注册一个事件方法
function add(event,fn,once) {
    once ? target.$once(event,fn) : target.$on(event.fn)
}
// 销毁一个事件方法
function remove(event,fn) {
    target.$off(event,fn)
}
// 更新组件的监听事件
export function updateComponentListeners(vm: any,listeners: any,oldListeners?: any) {
    target = vm
    updateListeners(listeners,oldListeners || {},add,remove,vm)
}
// 为 Vue 原型加入操作事件的方法
export function eventsMixin(Vue: any) {
    const hookRE = /^hook:/

    /* 在 vm 实列上绑定事件方法 */
    Vue.prototype.$on = function(event: string | Array<string>,fn: Function): any{
        const vm: any = this
        if(Array.isArray(event)) {
            for(let i = 0;i != event.length; ++ i) {
                this.$on(event[i],fn)
            }
        } else {
            // 因为可能有多个一个事件名 绑定多个函数
            ( vm._events[event] || (vm._events[event] = []) ).push(fn)
            ; /*这里在注册事件的时候标记bool值也就是个标志位来表明存在钩子，而不需要通过哈希表的方法来查找是否有钩子，这样做可以减少不必要的开销，优化性能。*/
            if(hookRE.test(event)) {
                vm._hasHookEvent = true
            }
        }
        return vm
    }

    /*注册一个只执行一次的事件方法*/
    Vue.prototype.$once = function(event: string,fn: Function): any {
        const vm: any = this
        function on() {
            // 在第一次执行的时候就将事件销毁
            vm.$off(event,on)
            // 执行注册方法
            fn.apply(vm,arguments)
        }
        on.fn = fn
        vm.$on(event,on)
        return vm
    }

    /*注销一个事件，如果不传参则注销所有事件，如果只传event名则注销该event下的所有方法*/
    Vue.prototype.$off = function(event?: string | Array<string>,fn?: Function): any {
        const vm  = this
        // 如果不参参数 则注销事件
        if(!arguments.length) {
            vm._events = Object.create(null)
            return vm
        }

        if(Array.isArray(event)) {
            for(let i = 0;i < event.length; ++ i) {
                this.$off(event[i],fn)
            }
            return vm
        }
        const cbs = vm._events[event]
        if(!cbs) {
            return vm
        }
        /* 如果只传了 event 参数则注销该 event 方法下所有方法 */
        if(arguments.length == 1) {
            vm._events[event] = null
            return vm
        }
        /* 遍历选择对应方法并删除 */
        let cb = null
        let i = cbs.length
        while(i --) {
            cb = cbs[i]
            if(cb === fn || cb.fn === fn) {
                cbs.splice(i,1)
                break
            }
        }
        return vm
    }
    Vue.prototye.$emit = function(event: string): any {
        const vm = this
        if(notProduction()) {
            const lowerCaseEvent = event.toLowerCase()
            if(lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                tip(
                    `Event "${lowerCaseEvent}" is emitted in component ` +
                    `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
                    `Note that HTML attributes are case-insensitive and you cannot use ` +
                    `v-on to listen to camelCase events when using in-DOM templates. ` +
                    `You should probably use "${hyphenate(event)}" instead of "${event}".`
                )
            }
        }
        let cbs = vm._events[event]
        if(!cbs) {
            return vm
        }
        cbs = cbs.length > 1 ? toArray(cbs) : cbs
        const args = toArray(arguments,1)
        for(const cb of cbs) {
            cb.apply(vm,args)
        }
        return vm
    }
}
