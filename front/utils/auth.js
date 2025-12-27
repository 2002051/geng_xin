// utils/auth.js
export default {
  // 检查是否登录
  isLogin() {
    const token = uni.getStorageSync('token')
    const userInfo = uni.getStorageSync('userInfo')
    return !!(token && userInfo)
  },
  
  // 获取登录状态
  getLoginStatus() {
    return this.isLogin()
  },
  
  // 退出登录
  logout() {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
}