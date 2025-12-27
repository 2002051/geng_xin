import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif


// // 拦截 uni.switchTab（注意：switchTab 不支持参数）
// const originalSwitchTab = uni.switchTab
// uni.switchTab = function(options) {
//   routeInterceptor.beforeEach({
//     path: options.url
//   }, null, () => {
//     originalSwitchTab.call(uni, options)
//   })
// }



// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif