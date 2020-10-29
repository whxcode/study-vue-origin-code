// 初始化一些基本数据
import config from '../config'
import Dep from '../observer/dep'
import Watcher from '../observer/watcher'
import {
    set,
    del,
    observe,
    observerState,
    defineReactive
} from '../observer/index'
import {
    warn,
    bind,
    noop,
    hasOwn,
    isReserved,
    handleError,
    validateProp,
    isPlainObject, no
} from '../util/index'
import get = Reflect.get;
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}
// by proxy function wild data、props in data proxy vm up，and explain vm.key quality vm.data.key
export function proxy(target: Object,sourceKey: string,key: string) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    // @ts-ignore
    sharedPropertyDefinition.set = function proxySetter(val: any) {
        this[sourceKey][key] = val
    }
}

// initialize props、data、method、computed、watch
export function initState(vm: any) {
    vm._watchers = []
    const opts = vm.$options
    const { props,methods,data,computed,watch } = opts

    if(props) { // 初始化 props
        initProps(vm,props)
    }
    if(methods) { // 初始化 methods
        initMethods(vm,methods)
    }
    if(data) { // 初始化 data
        initData(vm)
    } else {
        observe(vm._data = {},true /* asRootData */)
    }
    // 初始化 computed
    if(computed) {
        initComputed(vm,computed)
    }
    // 初始化 watchers
    if(watch) {
        initWatch(vm,watch)
    }
}

const isReservedProp = {
    key: 1,
    ref: 1,
    slot: 1
}

/*初始化props*/
function initProps (vm: any, propsOptions: Object) {
    const propsData = vm.$options.propsData || {}
    const props = vm._props = {}
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    /*缓存属性的key，使得将来能直接使用数组的索引值来更新props来替代动态地枚举对象*/
    const keys = vm.$options._propKeys = []
    /*根据$parent是否存在来判断当前是否是根结点*/
    const isRoot = !vm.$parent
    // root instance props should be converted
    /*根结点会给shouldConvert赋true，根结点的props应该被转换*/
    observerState.shouldConvert = isRoot
    for (const key in propsOptions) {
        /*props的key值存入keys（_propKeys）中*/
        keys.push(key)
        /*验证prop,不存在用默认值替换，类型为bool则声称true或false，当使用default中的默认值的时候会将默认值的副本进行observe*/
        const value = validateProp(key, propsOptions, propsData, vm)
        /* istanbul ignore else */

            /*判断是否是保留字段，如果是则发出warning*/
            if (isReservedProp[key] || config.isReservedAttr(key)) {
                warn(
                    `"${key}" is a reserved attribute and cannot be used as component prop.`,
                    vm
                )
            }
            defineReactive(props, key, value, () => {
                /*
                  由于父组件重新渲染的时候会重写prop的值，所以应该直接使用prop来作为一个data或者计算属性的依赖
                  https://cn.vuejs.org/v2/guide/components.html#字面量语法-vs-动态语法
                */
                if (vm.$parent && !observerState.isSettingProps) {
                    warn(
                        `Avoid mutating a prop directly since the value will be ` +
                        `overwritten whenever the parent component re-renders. ` +
                        `Instead, use a data or computed property based on the prop's ` +
                        `value. Prop being mutated: "${key}"`,
                        vm
                    )
                }
            })

            defineReactive(props, key, value)
        // static props are already proxied on the component's prototype
        // during Vue.extend(). We only need to proxy props defined at
        // instantiation here.
        /*Vue.extend()期间，静态prop已经在组件原型上代理了，我们只需要在这里进行代理prop*/
        if (!(key in vm)) {
            proxy(vm, `_props`, key)
        }
    }
    observerState.shouldConvert = true
}
// 初始化 data
function initData(vm: any) {
    let data = vm.$options.data
    // 或者数据
    data = vm._data = typeof data === 'function' ? getData(data,vm) : data || { }
    // 是纯 javaScript 对象
    if(!isPlainObject(data)) {
        data = { }
        warn(
            'data functions should return an object:\n' +
            'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
            vm
        )
    }
    const keys = Object.keys(data)
    const props = vm.$options.props
    let i = keys.length
    while(i --) {
        // 验证 data 里面是否与 props中的属性重复
        if(props && hasOwn(props,keys[i])) {
            warn(
                `The data property "${keys[i]}" is already declared as a prop. ` +
                `Use prop default value instead.`,
                vm
            )
        } else if(!isReserved(keys[i])) {
            // 通过代理访问
            props(vm,`_data`,keys[i])
        }
        observe(data,true, /* asRootData */)
    }
}

function getData(data: Function,vm: any) {
    try {
        return data.call(vm)
    } catch(e) {
        handleError(e,vm,`data call error`)
        return {}
    }
}

const computedWatcherOptions = { lazy: true }
function initComputed(vm: any,computed: Object) {
    const watchers = vm._computedWatchers = Object.create(null)
    for(const key in computed) {
        // value cloud a function and { get() => v,set(v) }
        const userDef = computed[key]
        let getter = typeof userDef === 'function' ? userDef : userDef.get
        if(getter == undefined) {
            warn(
                `No getter function has been defined for computed property "${key}".`,
                vm
            )
            getter = noop
        }
        watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)
        if(!(key in vm)) {
            defineComputed(vm,key,userDef)
        } else if(key in vm.$data) { // 重复定义
            warn(`The computed property "${key}" is already defined in data.`, vm)
        } else if(key in vm.$options.props && key in vm.$options.props) { // 重复定义
            warn(`The computed property "${key}" is already defined as a prop.`, vm)
        }
    }
}

// 定义计算属性
export function defineComputed(target: any,key: string,userDef: any) {
    if(typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key)
        sharedPropertyDefinition.set = noop
    } else {
        sharedPropertyDefinition.get = userDef.get ? userDef.cache !== false ?
            createComputedGetter(key) : userDef.get : noop
        sharedPropertyDefinition.set = userDef.set || noop
    }
    Object.defineProperty(target,key,sharedPropertyDefinition)
}

// 创建计算属性的 getter
function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if(watcher && watcher.dirty) {
            watcher.evaluate()
        }
        if(watcher && Dep.target) {
            watcher.depend()
        }
        return watcher.value
    }
}
// 初始化方法
function initMethods(vm: any,methods: any) {
    const props = vm.$options.props
    for(const key in methods) {
        if(methods[key] == null) {
            warn(
                `method "${key}" has an undefined value in the component definition. ` +
                `Did you reference the function correctly?`,
                vm
            )
        }
        vm[key] = methods[key] == null ? noop  : bind(methods[key],vm)

        if(props && hasOwnp(props,key)) {
            warn(
                `method "${key}" has already been defined as a prop.`,
                vm
            )
        }
    }
}

// 初始化 watchers
function initWatch(vm: any,watch: Object) {
    for(const key in watch) {
        const handler = watch[key]
        if(Array.isArray(handler)) {
            for(const handle of handler) {
                createWatcher(vm,key,handle)
            }
        } else {
            createWatcher(vm,key,handler)
        }
    }
}

// 创建一个观察者 Watcher
function createWatcher(vm: any,key: string,handler: any) {
    let options = null
    if(isPlainObject(handler)) {
        // watch 处理对象形式
        /**
         * watch: {
         *     test: {
         *         handler: function {}
         *     }
         * }
         *
         * */
        options = handler
        handler = handler.handler
    }
    // 也可以直接使用 vm 中的 methods里面的方法
    if(typeof handler === 'string') {
        handler = vm[handler]
    }
    /* 使用 $watch 方法创建一个 watch 来观察该对象的变化 */
    vm.$watch(key,handler,options)
}

export function stateMixin(Vue: any) {
    const dataDef: any = {}
    dataDef.get = function() { return this._data }
    const propsDef = {
        get() {
            return this._props
        },
        set() {
            warn(`$props is readonly.`, this)
        }
    }
    dataDef.set = function(newData: Object) {
        warn(
            'Avoid replacing instance root $data. ' +
            'Use nested data properties instead.',
            this
        )
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef)
    Object.defineProperty(Vue.prototype, '$props', propsDef)
    Vue.prototype.$set = set
    Vue.prototype.$delete = del
    /**
     * $watch 方法
     * */
    Vue.prototype.$watch = function(expOrFn: any,cb: Function,options?: Object): Function {
        const vm: any = this
        options = options || {}
        // @ts-ignore
        options.user = true
        const watcher = new Watcher(vm,expOrFn,cb,options)
        // @ts-ignore
        options.immediate && cb.call(vm,watcher.value)
        return function unwatchFn() {
            watcher.teardown()
        }
    }
}
