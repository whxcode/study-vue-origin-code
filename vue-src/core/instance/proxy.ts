import config from '../config'
import { warn, makeMap } from '../util'
let initProxy: Function | null = null
// TODO 判断环境变量
// @ts-ignore
if(0 && 'evn' !== 'production') {
    const allowedGlobals = makeMap(
        'Infinity,undefined,NaN,isFinite,isNaN,' +
        'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
        'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
        'require' // for Webpack/Browserify
    )


    const warnNonPresent = (target, key) => {
        warn(
            `Property or method "${key}" is not defined on the instance but ` +
            `referenced during render. Make sure to declare reactive data ` +
            `properties in the data option.`,
            target
        )
    }

    const hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/)
    if(hasProxy) {
        // 使用内建 key 防止用户覆盖
        const isBuiltInModifier = makeMap(`stop,prevent,self,ctrl,shift,alt,meta`)
        config.keyCodes = new Proxy(config.keyCodes,{
            set(target,key,value) {
                if(isBuiltInModifier(key)) {
                    // 防止用户覆盖内建快捷键
                    warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
                    return false
                }
                return Reflect.set(target,key,value)
            }
        })
    }

    const hasHandler = {
        has(target,key) {
            const has = key in target
            const isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
            if(!has && !isAllowed) {
                warnNonPresent(target,key)
            }
            return has || !isAllowed
        }
    }
    const getHandler = {
        get(target,key) {
            if(typeof key === 'string' && !(key in target)) {
                warnNonPresent(target,key)
            }
            return target[key]
        }
    }
    initProxy = function initProxy(vm) {
        if(hasProxy) {
            const options = vm.$options
            const handlers = options.render && options.render._withStripped ? getHandler : hasHandler
            vm._renderProxy = new Proxy(vm,handlers)
        } else {
            vm._renderProxy = vm
        }
    }
}
export { initProxy }



