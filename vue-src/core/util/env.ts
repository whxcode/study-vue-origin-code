import { noop } from "../../shared/util"
import { handleError } from './error'

// can we use __proto__
export const hasProto = '__proto__' in {}

export const inBrowser = typeof window !== 'undefined'

export const UA = inBrowser && window.navigator.userAgent.toLowerCase()

export const isIE = UA && /msie|trident/.test(UA)

export const isIE9 = isIE && UA && UA.indexOf('msie 9.0') > 0

export const isEdge = UA && UA.indexOf('edge/') > 0

export const isAndroid = UA && UA.indexOf('android') > 0

export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)

export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

export let supportsPassive = false

interface ISet {
    has(key: string | number): boolean;
    add(key: string | number): mixed;
    clear(): void;
}


if(inBrowser) {
    try {
        const opts = {}
        Object.defineProperty(opts,'passive',{
            get() {
                // istanbul ignore next
                supportsPassive = true
            }
        })
        window.addEventListener('test-passive',null,opts)
    } catch (e) {

    }
}

let _isServer = null
export const isServerRendering = () => {
    if(_isServer === undefined) {
        if(!inBrowser && typeof global !== 'undefined') {
            //
            _isServer = global['process'].env.VUE_ENV === 'server'
        } else {
            _isServer = false
        }
    }
    return _isServer
}

export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

export function isNative(Ctor: any): boolean {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

// 判断是有新的类型 Symbol
export const hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys)

export const nextTick = (function() {
    /* 保存异步执行的回调 */
    const callbacks: Array<any> = []

    let pending = false // 一个标记为 如果已经有 timerFunc 被推送到任务队列中去则不需要重复推送
    let timerFunc = null // 一个函数指针，指向函数将被推送到任务队列中，等到主线程任务执行完时，任务队列中的timerFunc被调用

    function nextTickHandler() {
        /*一个标记位，标记等待状态（即函数已经被推入任务队列或者主线程，已经在等待当前栈执行完毕去执行），这样就不需要在push多个回调到callbacks时将timerFunc多次推入任务队列或者主线程*/
        pending = false
        /*执行所有callback*/
        const copies = callbacks.slice(0)
        callbacks.length = 0
        for(let i = 0;i < copies.length; ++ i) {
            copies[i]()
        }
    }

    /*
        这里解释一下，一共有Promise、MutationObserver以及setTimeout三种尝试得到timerFunc的方法。
        优先使用Promise，在Promise不存在的情况下使用MutationObserver，这两个方法的回调函数都会在microtask中执行，它们会比setTimeout更早执行，所以优先使用。
        如果上述两种方法都不支持的环境则会使用setTimeout，在task尾部推入这个函数，等待调用执行。
        为啥要用 microtask？我在顾轶灵在知乎的回答中学习到：
        根据 HTML Standard，在每个 task 运行完以后，UI 都会重渲染，那么在 microtask 中就完成数据更新，
        当前 task 结束就可以得到最新的 UI 了。反之如果新建一个 task 来做数据更新，那么渲染就会进行两次。
        参考：https://www.zhihu.com/question/55364497/answer/144215284
  */
   if(typeof Promise !== 'undefined' && isNative(Promise)) {
       var p = Promise.resolve()
       var logError = err => { console.error(err) }
       timerFunc = () => {
           p.then(nextTickHandler).catch(logError)

           // 在 ios 中该任务有可能很奇怪,可以设置一个强制刷新方法
           if (isIOS) setTimeout(noop)

       }
   } else if(typeof MutationObserver !== 'undefined' && ( isNative(MutationObserver)) || MutationObserver.toString() === ['object MutationObserverConstructor']) {
       var counter = 1
       var observer = new MutationObserver(nextTickHandler)
       var textNode = document.createTextNode(String(counter))
       observer.observe(textNode,{
           characterData: true
       })
       timerFunc = () => {
           counter = (counter + 1) % 2
           textNode.data = String(counter)
       }
   } else {
       // 最糟糕的用 setTimeout
       timerFunc = () => {
           setTimeout(nextTickHandler,0)
       }
   }
   /**
    * 推送到队列中下一个 tick 时执行
    * cb 回调函数
    * ctx 上下文
    * **/
   return function queueNextTick(cb?: Function,ctx?: Object) {
       let _resolve = null
       callbacks.push(() => {
           if(cb) {
               try {
                   cb.call(ctx)
               } catch(err) {
                   handleError(e,ctx,'nextTick')
               }
           } else if(_resolve) {
               _resolve(ctx)
           }

           if(!pending) {
               pending = true
               timerFunc() // 执行函数
           }
           if(!cb && typeof Promise !== 'undefined') {
               return new Promise((resolve,reject) => {
                   _resolve = resolve
               })
           }
       })
   }
})();


let _Set = null
if(typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set data struct type
    _Set = Set
} else {
    _Set = class Set implements ISet{
        private set: Object = []
        has(key: string | number): boolean {
            return !!this.set[key]
        }
        add(key: string | number): any {
            this.set[key] = true
        }
        clear() {
            this.set = []
        }
    }
}

interface ISet {
    has(key: string | number): boolean
    add(key: string | number): any
    clear(): void
}

export { _Set }
export type { ISet}
