<script>
	import { createRouterGuard } from '@/utils/routeInterceptor.js';

	export default {
	  onLaunch() {
	    // 初始化登录状态检查
	    this.checkLoginStatus();
	  },
	  
	  onShow() {
	    // 每次应用显示时检查路由
	    createRouterGuard();
	  },
	  
	  methods: {
	    checkLoginStatus() {
	      // 这里可以添加更复杂的登录状态检查
	      // 例如检查token是否过期等
	    }
	  }
	}
</script>

<style>
	/*每个页面公共css */
</style>
