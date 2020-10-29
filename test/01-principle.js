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
var outDep = null;
function observe(value) {
    Object.keys(value).forEach(function (key) {
        defineReactive(value, key, value[key]);
    });
}
function defineReactive(obj, key, val) {
    var dep = new Dep();
    outDep = dep;
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            // 收集依赖等....
            // console.log(`collect ... ${ key }`)
            // @ts-ignore
            if (Dep.target) {
                // @ts-ignore
                dep.addSub(Dep.target);
            }
            return val;
        },
        set: function (newVal) {
            val = newVal;
            // console.log(dep,key,Dep.target)
            dep.notify();
            // 触发一些事件
            // cb()
        }
    });
}
function _proxy(data) {
    var _this = this;
    Object.keys(data).forEach(function (key) {
        Object.defineProperty(_this, key, {
            get: function () {
                return data[key];
            },
            set: function (nV) {
                data[key] = nV;
            }
        });
    });
}
var Dep = /** @class */ (function () {
    function Dep() {
        this.subs = [];
    }
    Dep.prototype.addSub = function (sub) {
        this.subs.push(sub);
    };
    Dep.prototype.removeSub = function (sub) {
        remove(this.subs, sub);
    };
    Dep.prototype.notify = function () {
        var subs = this.subs.slice();
        for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
            var sub = subs_1[_i];
            sub.update && sub.update();
        }
    };
    return Dep;
}());
var Watcher = /** @class */ (function () {
    function Watcher(vm, expOrFn, cb, options) {
        this.cb = cb;
        this.vm = vm;
        // @ts-ignore
        Dep.target = this;
        this.cb.call(this.vm);
    }
    Watcher.prototype.update = function () {
        this.cb.call(this.vm);
    };
    return Watcher;
}());
var Vue = /** @class */ (function () {
    function Vue(options) {
        this._data = options.data;
        observe(this._data);
        _proxy.call(this, options.data);
        var watcher = new Watcher(this, null, options.render, options);
        this.render = options.render;
    }
    return Vue;
}());
function remove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}
var app = new Vue({
    data: {
        name: 'whx',
        age: 12,
        gender: 'male'
    },
    render: function () {
        console.log("render " + this.name + " -- " + this.age);
    }
});
app.name = 'whxhwhx';
// 执行默认渲染
// app.render()
// app.gender = 'male'
// app.name = 'xhw'
// app.age = 123
// app.gender = 'email'
// app.age = 123
