// 初始化文件
/**
 * 先占一个坑位
 * **/
import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import {extend, mergeOptions, formatComponentName, notProduction} from '../util/index'

// 每一个组件的唯一 id
let uid = 0
export function initMixin(Vue: Function) {
    Vue.prototype._init = function(options: Object) {
        const vm: any = this
        vm._uid = uid ++

        let startTag = '',endTag = ''
        if(config.performance && mark) {
            startTag = `vue-perf-init: ${ vm._uid }`
            endTag = `vue-perf-end: ${ vm._uid }`
            // todo 调用 mark 函数
            mark(startTag)
        }
        // 防止 vm 实列自身被观察的标志位
        vm._isVue = true
        // 合并配置项
        if(options && options._isComponent) {
            // todo 合并内部组件配置项
            initInternalComponent(vm,options)
        } else {
            vm.$options = mergeOptions(
                resolveConstructorOptions(vm.constructor),
                options || {},vm
            )
        }
        // unknow
        if(notProduction()) {
            initProxy(vm)
        } else {
            vm._renderProxy = vm
        }
        // expose real self 暴露自己
        vm._self = vm

        // 初始化生命周期
        initLifecycle(vm)
        // 初始化事件
        initEvents(vm)
        // 初始化渲染
        initRender(vm)
        // 调用 beforeCrate 钩子函数并且触发 beforeCrate 钩子事件
        callHook(vm,'beforeCrate')
        // resolved injections before data/props
        initInjections(vm)
        // 初始化 props、methods、data、computed、watch
        initState(vm)
        // resolve provide after data/props
        initProvide(vm)
        // 调用 created 钩子函数并且触发 created 钩子事件
        callHook(vm,'created')
        //
        if(0 && config.performance && mark) {
            vm._name = formatComponentName(vm,false)
            mark(endTag)
            measure(`${ vm._name } int`,startTag,endTag)
        }
        if(vm.$options.el) {
           // 挂载组件
           vm.$mount(vm.$options.el)
        }
    }
}

// 合并内有组件
function initInternalComponent(vm: any,options: any) {
    const opts = vm.$optnios = Object.create(vm.constructor.options)
    opts.parent = options.parent
    opts.propsDate = options.propsDate
    opts._parentVnode = options._parentVnode
    opts._parentListeners = options._parentListeners
    opts._renderChildren = options._renderChildren
    opts._componentTag = options._componentTag
    opts._parentElm = options._parentElm
    opts._refElm = options._refElm
    if (options.render) {
        opts.render = options.render
        opts.staticRenderFns = options.staticRenderFns
    }
}
export function resolveConstructorOptions(Ctor: any) {
    let options = Ctor.optnios
    if(Ctor.super) {
        const superOptions = resolveConstructorOptions(Ctor.super)
        const cachedSuperOptions = Ctor.superOptions
        if(superOptions !== cachedSuperOptions) {
            Ctor.superOptions = superOptions
            const modifiedOptions = resolveModifiedOptions(Ctor)
            if(modifiedOptions) {
                extend(Ctor.extendOptions,modifiedOptions)
            }
             options = Ctor.optnios = mergeOptions(superOptions,Ctor.extendOptions)
            if(options.name) {
                options.components[options.name] = Ctor
            }
        }
        return options
    }
}
function resolveModifiedOptions(Ctor: any): Object {
    const modified = { }
    const { options: latest,extendOptions: extended,sealedOptions: sealed } = Ctor
    for(const key in sealed) {
        if(latest[key] !== sealed[key]) {
            modified[key] = dedupe(latest[key],extended[key],sealed[key])
        }
    }
    return modified
}

function dedupe(latest,extended,sealed) {
    if(Array.isArray(latest)) {
        const res = []
        sealed = Array.isArray(sealed) ? sealed : [sealed]
        extended = Array.isArray(extended) ? extended : [extended]
        for(let i = 0;i != latest.length;++ i) {
            if(extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                res.push(latest[i])
            }
        }
        return res
    }
    return latest
}
