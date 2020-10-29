import { initMixin } from "./init"

// import
function warn(message: string) {

}
function Vue(options: any) {
    // 如果不是他的实列就警告
    if(this instanceof Vue) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    /* 初始化 */
    this._init(options)
}
// 添加 _init 方法
initMixin(Vue)
export default Vue