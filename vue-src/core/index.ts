import Vue from "./instance"
// import
function initGlobalAPI() {

}
// import
function isServerRendering() {

}
// 判断是不是服务器渲染
Object.defineProperty(Vue.prototype,'$isServer', {
    get: isServerRendering
})
// @ts-ignore
Vue.version = '__VERSION__'
export default Vue
