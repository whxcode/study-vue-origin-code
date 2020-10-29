/*function observeArray<T>(arr: Array<T>): Array<T> {
    const result = []
    for(let i = 0;i != arr.length;++ i) {
        Object.defineProperty(result,i,{
            get(): T {
                console.log('get value')
                return  arr[i]
            },
            set(v: T) {
                // 执行其他操作
                arr[i] = v
            }
        })
    }
    return  result
}
const arr = [1,2,3,4]
const proxyArray = observeArray<number>(arr)

console.log(proxyArray[0])
proxyArray[0] = 1000
console.log(proxyArray[0])*/
let outDep = null
function observe(value) {
    Object.keys(value).forEach(key => {
        defineReactive(value,key,value[key])
    })
}

function defineReactive(obj,key,val) {
    const dep = new Dep()
    outDep = dep
    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get() {
            // 收集依赖等....
            // console.log(`collect ... ${ key }`)
            // @ts-ignore
            if(Dep.target) {
                // @ts-ignore
                dep.addSub(Dep.target)
            }
            return val
        },
        set(newVal) {
            val = newVal
            // console.log(dep,key,Dep.target)
            dep.notify()
            // 触发一些事件
            // cb()
        }
    })
}

function _proxy(data) {
    Object.keys(data).forEach(key => {
        Object.defineProperty(this,key,{
            get() {
                return data[key]
            },
            set(nV) {
                data[key] = nV
            }
        })
    })
}

class Dep  {
    subs: Array<any>
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    removeSub(sub) {
        remove(this.subs,sub)
    }
    notify() {
        const subs = this.subs.slice()
        for(const sub of subs) {
            sub.update && sub.update()
        }
    }
}

class Watcher {
    [index: string] : any
    constructor(vm,expOrFn,cb,options) {
        this.cb = cb
        this.vm = vm
        // @ts-ignore
        Dep.target = this
        this.cb.call(this.vm)
    }
    update() {
        this.cb.call(this.vm)
    }
}

class Vue {
    private _data: any
    public render : any
    constructor(options) {
        this._data = options.data
        observe(this._data)
        _proxy.call(this,options.data)
        const watcher = new Watcher(this,null,options.render,options)
        this.render = options.render
    }
}
function remove(arr,item) {
    if(arr.length) {
        const index = arr.indexOf(item)
        if(index > -1) {
            return arr.splice(index,1)
        }
    }
}


const app: any = new Vue({
    data: {
        name: 'whx',
        age: 12,
        gender: 'male'
    },
    render() {
      console.log(`render ${ this.name } -- ${ this.age }`)
    }
})

app.name = 'whxhwhx'

// 执行默认渲染
// app.render()
// app.gender = 'male'
// app.name = 'xhw'
// app.age = 123
// app.gender = 'email'
// app.age = 123
