// 路由守卫
const whiteList = ['/pages/login/login', '/pages/register/register', '/pages/index/index']; // 白名单

export function createRouterGuard() {
  // 获取当前页面栈
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  // 获取当前路由
  const route = currentPage ? currentPage.route : '';
  const fullPath = `/${route}`;
  
  // 检查是否在白名单
  if (whiteList.includes(fullPath)) {
    return true;
  }
  
  // 检查登录状态
  const token = uni.getStorageSync('token');
  const username = uni.getStorageSync('username');
  console.log(123);
  if (!token || !username) {
    // 跳转到登录页
    uni.redirectTo({
      url: '/pages/login/login',
      success: () => {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
      }
    });
    return false;
  }
  
  return true;
}