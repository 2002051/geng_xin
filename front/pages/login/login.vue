<template>
	<view class="page_login">
		<!-- 动态背景轮播 -->
		<view class="slider-background">
			<swiper class="background-swiper" :autoplay="true" :interval="5000" :duration="1000" circular>
				<swiper-item v-for="(item, index) in bgImages" :key="index">
					<image class="bg-image" :src="item" mode="aspectFill" />
					<view class="bg-overlay"></view>
				</swiper-item>
			</swiper>

			<!-- 爱心飘落效果 -->
			<view class="falling-hearts">
				<text v-for="i in 15" :key="i" class="heart" :style="getHeartStyle(i)">❤️</text>
			</view>
		</view>

		<!-- 登录卡片 -->
		<view class="login-card">
			<!-- 头部logo -->
			<view class="head">
				<view class="logo-container">
					<view class="logo-circle">
						<view class="logo-inner">
							<view class="gx-heart">
								<text class="g-letter">g</text>
								<view class="heart-dot">❤</view>
								<text class="x-letter">x</text>
							</view>
						</view>
					</view>
					<text class="app-name">甜蜜记忆</text>
				</view>
			</view>

			<!-- 登录form -->
			<view class="login_form">
				<view class="input-group">
					<view class="input-box">
						<view class="icon-wrapper">
							<image class="input-icon" :src="imgInfo.icon_user" />
						</view>
						<input type="text" v-model="username" placeholder="请输入用户账号" placeholder-class="placeholder"
							@input="inputUsername" />
						<view class="icon-wrapper" @tap="delUser">
							<image v-if="username" class="clear-icon" :src="imgInfo.icon_del" />
						</view>
					</view>
				</view>

				<view class="input-group">
					<view class="input-box">
						<view class="icon-wrapper">
							<image class="input-icon" :src="imgInfo.icon_pwd" />
						</view>
						<input :type="pwdType" :value="userpwd" @input="inputPwd" placeholder="请输入密码"
							placeholder-class="placeholder" />
						<view class="icon-wrapper" @tap="switchPwd">
							<image class="pwd-toggle-icon" :src="imgInfo.icon_pwd_switch" />
						</view>
					</view>
				</view>

				<!-- 记住密码和忘记密码 -->
				<view class="login-options">
					<view class="remember-me" @tap="toggleRemember">
						<view class="checkbox" :class="{ 'checked': rememberMe }">
							<text v-if="rememberMe" class="check-icon">✓</text>
						</view>
						<text class="option-text">记住密码</text>
					</view>
					<!-- <view class="forgot-pwd" @tap="findPwd">
						<text class="option-text">忘记密码？</text>
					</view> -->
				</view>

				<!-- 登录按钮 -->
				<button class="login-btn" :class="{ 'disabled': !canSubmit }" :disabled="!canSubmit" @tap="login">
					<text v-if="!loading">登录</text>
					<view v-else class="loading">
						<view class="loading-spinner"></view>
						<text>登录中...</text>
					</view>
				</button>

				<!-- 注册引导 -->
				<!-- 	<view class="register-guide">
					<text class="guide-text">还没有账号？</text>
					<text class="register-link" @tap="goReg">立即注册</text>
				</view> -->

				<!-- 分隔线 -->
				<!-- 		<view class="divider">
					<view class="divider-line"></view>
					<text class="divider-text">其他方式登录</text>
					<view class="divider-line"></view>
				</view -->

				<!-- 第三方登录 -->
				<!-- 	<view class="third-login">
					<view class="third-item" @tap="thirdLogin('qq')">
						<view class="third-icon qq">
							<image class="third-img" :src="imgInfo.qq" />
						</view>
						<text class="third-text">QQ</text>
					</view>
					<view class="third-item" @tap="thirdLogin('wechat')">
						<view class="third-icon wechat">
							<image class="third-img" :src="imgInfo.wechat" />
						</view>
						<text class="third-text">微信</text>
					</view>
					<view class="third-item" @tap="thirdLogin('weibo')">
						<view class="third-icon weibo">
							<image class="third-img" :src="imgInfo.weibo" />
						</view>
						<text class="third-text">微博</text>
					</view>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
	import cfg from '../../common/cfg.js';

	export default {
		data() {
			console.log(cfg.base_url)
			const isUni = typeof(uni) !== 'undefined'
			return {
				username: '',
				userpwd: '',
				pwdType: 'password',
				rememberMe: false,
				loading: false,
				bgImages: [
					isUni ? '/static/bg1.jpg' : require('./images/bg1.jpg'),
					isUni ? '/static/bg2.jpg' : require('./images/bg2.jpg'),
					isUni ? '/static/bg3.jpg' : require('./images/bg3.jpg'),
					isUni ? '/static/bg4.jpg' : require('./images/bg4.jpg')
				],
				imgInfo: {
					// head: isUni ? '/static/head.png' : require('./images/head.png'),
					head: isUni ? './images/lixun.gif' : require('./images/head.png'),
					icon_user: isUni ? '/static/icon_user.png' : require('./images/icon_user.png'),
					icon_del: isUni ? '/static/icon_del.png' : require('./images/icon_del.png'),
					icon_pwd: isUni ? '/static/icon_pwd.png' : require('./images/icon_pwd.png'),
					icon_pwd_switch: isUni ? '/static/icon_pwd_switch.png' : require('./images/icon_pwd_switch.png'),
					qq: isUni ? '/static/qq.png' : require('./images/qq.png'),
					wechat: isUni ? '/static/wechat.png' : require('./images/wechat.png'),
					weibo: isUni ? '/static/weibo.png' : require('./images/weibo.png')
				}
			}
		},
		computed: {
			canSubmit() {
				return this.username.length > 0 && this.userpwd.length >= 6 && !this.loading
			}
		},
		onLoad() {
			this.loadRememberedData()
		},
		methods: {
			getHeartStyle(index) {
				// 随机生成爱心飘落样式
				const left = Math.random() * 100
				const duration = 3 + Math.random() * 4
				const delay = Math.random() * 5
				const size = 20 + Math.random() * 20

				return {
					left: `${left}%`,
					animationDuration: `${duration}s`,
					animationDelay: `${delay}s`,
					fontSize: `${size}rpx`,
					opacity: 0.3 + Math.random() * 0.4
				}
			},

			inputUsername(e) {
				this.username = e.detail.value
			},

			inputPwd(e) {
				this.userpwd = e.detail.value
			},

			delUser() {
				this.username = ''
			},

			switchPwd() {
				this.pwdType = this.pwdType === 'text' ? 'password' : 'text'
			},

			toggleRemember() {
				this.rememberMe = !this.rememberMe
			},

			loadRememberedData() {
				try {
					const remembered = uni.getStorageSync('rememberedLogin')
					if (remembered) {
						this.username = remembered.username || ''
						this.userpwd = remembered.password || ''
						this.rememberMe = true
					}
				} catch (e) {
					console.error('读取存储失败:', e)
				}
			},

			async login() {
				if (!this.canSubmit) return

				this.loading = true

				try {
					// 模拟API请求
					await new Promise(resolve => setTimeout(resolve, 1500))
					uni.request({
						url: `${cfg.base_url}/login/in/`,
						method: "POST",
						data: {
							username: this.username,
							password: this.userpwd,
						},
						header: {
							'Content-Type': 'application/json'
						},
						success: function(res) {
							if(res.data.code==200){
								// 登录成功
								uni.showToast({
									title: '登录成功',
									icon: 'success',
									duration: 1500
								})
								// 保存记住密码
								if (this.rememberMe) {
									uni.setStorageSync('rememberedLogin', {
										username: this.username,
										password: this.userpwd
									})
								} else {
									uni.removeStorageSync('rememberedLogin')
								}
								
								// 跳转
								 // 2. 保存用户认证信息
								if (res.data.token) {
									uni.setStorageSync('token', res.data.token);
								}
								if (res.data.username) {
									uni.setStorageSync('username', res.data.username);
								}
						
								// const token = uni.getStorageSync('token');
								// console.log('Token:', token);
								uni.navigateTo({
									url:"/pages/index/index",
									success() {
										console.log("跳转成功");
									},
									fail() {
										console.log("跳转失败");
									}
								})
							
							}else{
								uni.showToast({
									title: '密码错误',
									icon:"error",
									duration: 1500
								})
								console.log(res.data);
							}
					
						},
						fail: function(err) {
							// 登录失败
							uni.showToast({
								title: '登录异常',
								icon: 'fail',
								duration: 1500
							})
							console.error(err);
						}
					})
				
					

					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1500)

				} catch (error) {
					console.error('登录失败:', error)
					uni.showToast({
						title: '登录失败，请重试',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},

			findPwd() {
				uni.navigateTo({
					url: '/pages/find-pwd/find-pwd'
				})
			},

			goReg() {
				uni.navigateTo({
					url: '/pages/reg/reg'
				})
			},

			thirdLogin(type) {
				uni.showToast({
					title: `${type}登录功能开发中`,
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page_login {
		height: 100vh;
		position: relative;
		overflow: hidden;
	}

	// 背景轮播样式
	.slider-background {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 1;

		.background-swiper {
			width: 100%;
			height: 100%;

			.bg-image {
				width: 100%;
				height: 100%;
			}

			.bg-overlay {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: linear-gradient(135deg, rgba(252, 44, 93, 0.3), rgba(255, 107, 139, 0.2));
			}
		}

		.falling-hearts {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;

			.heart {
				position: absolute;
				top: -50rpx;
				animation: falling linear infinite;
				color: #ff6b8b;
			}
		}
	}

	// 登录卡片
	.login-card {
		position: relative;
		z-index: 2;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 50rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20rpx);
	}

	// Logo样式
	.head {
		text-align: center;
		margin-bottom: 60rpx;

		.logo-container {
			display: flex;
			flex-direction: column;
			align-items: center;

			.logo-circle {
				width: 140rpx;
				height: 140rpx;
				border-radius: 50%;
				background: linear-gradient(45deg, #ff6b8b, #ff8e53);
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 30rpx;
				box-shadow: 0 20rpx 40rpx rgba(255, 107, 139, 0.4);
				animation: float 3s ease-in-out infinite;

				.logo-inner {
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					background: white;
					display: flex;
					align-items: center;
					justify-content: center;

					.head_logo {
						width: 55rpx;
						height: 65rpx;
					}
				}
			}

			.app-name {
				font-size: 48rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}

			.app-slogan {
				font-size: 28rpx;
				color: #666;
			}
		}
	}

	// 表单样式
	.login_form {
		.input-group {
			margin-bottom: 40rpx;

			.input-box {
				display: flex;
				align-items: center;
				height: 90rpx;
				background: #f8f9fa;
				border-radius: 45rpx;
				padding: 0 30rpx;
				border: 2rpx solid transparent;
				transition: all 0.3s;

				&:focus-within {
					border-color: #ff6b8b;
					background: white;
					box-shadow: 0 10rpx 30rpx rgba(255, 107, 139, 0.1);
				}

				.icon-wrapper {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 40rpx;

					.input-icon {
						width: 30rpx;
						height: 30rpx;
					}

					.clear-icon {
						width: 26rpx;
						height: 26rpx;
					}

					.pwd-toggle-icon {
						width: 35rpx;
						height: 15rpx;
					}
				}

				input {
					flex: 1;
					height: 100%;
					margin: 0 20rpx;
					font-size: 32rpx;
					color: #333;
					background: transparent;
				}

				.placeholder {
					color: #999;
					font-size: 30rpx;
				}
			}
		}

		.login-options {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 60rpx;

			.remember-me,
			.forgot-pwd {
				display: flex;
				align-items: center;

				.checkbox {
					width: 36rpx;
					height: 36rpx;
					border: 2rpx solid #ddd;
					border-radius: 8rpx;
					margin-right: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;

					&.checked {
						background: #ff6b8b;
						border-color: #ff6b8b;

						.check-icon {
							color: white;
							font-size: 24rpx;
							font-weight: bold;
						}
					}
				}

				.option-text {
					font-size: 28rpx;
					color: #666;
				}
			}

			.forgot-pwd .option-text {
				color: #ff6b8b;
			}
		}

		.login-btn {
			height: 90rpx;
			line-height: 90rpx;
			border-radius: 45rpx;
			background: linear-gradient(90deg, #ff6b8b, #ff8e53);
			color: white;
			font-size: 36rpx;
			font-weight: 600;
			border: none;
			margin-bottom: 40rpx;
			transition: all 0.3s;

			&:active {
				transform: scale(0.98);
			}

			&.disabled {
				opacity: 0.6;
			}

			.loading {
				display: flex;
				align-items: center;
				justify-content: center;

				.loading-spinner {
					width: 36rpx;
					height: 36rpx;
					border: 4rpx solid white;
					border-top-color: transparent;
					border-radius: 50%;
					margin-right: 20rpx;
					animation: spin 1s linear infinite;
				}
			}
		}

		.register-guide {
			text-align: center;
			margin-bottom: 50rpx;

			.guide-text {
				font-size: 28rpx;
				color: #666;
			}

			.register-link {
				font-size: 28rpx;
				color: #ff6b8b;
				margin-left: 10rpx;
				font-weight: 600;
			}
		}

		.divider {
			display: flex;
			align-items: center;
			margin-bottom: 50rpx;

			.divider-line {
				flex: 1;
				height: 1rpx;
				background: #e5e5e5;
			}

			.divider-text {
				padding: 0 30rpx;
				font-size: 24rpx;
				color: #999;
			}
		}

		.third-login {
			display: flex;
			justify-content: center;
			gap: 80rpx;

			.third-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				.third-icon {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 20rpx;
					transition: transform 0.3s;

					&:active {
						transform: scale(0.95);
					}

					&.qq {
						background: linear-gradient(135deg, #12B7F5, #1AAD19);
					}

					&.wechat {
						background: linear-gradient(135deg, #09BB07, #1AAD19);
					}

					&.weibo {
						background: linear-gradient(135deg, #E6162D, #FF9933);
					}

					.third-img {
						width: 50rpx;
						height: 50rpx;
					}
				}

				.third-text {
					font-size: 24rpx;
					color: #666;
				}
			}
		}
	}

	// 动画定义
	@keyframes falling {
		0% {
			transform: translateY(-50rpx) rotate(0deg);
			opacity: 0;
		}

		10% {
			opacity: 1;
		}

		90% {
			opacity: 0.8;
		}

		100% {
			transform: translateY(calc(100vh + 50rpx)) rotate(360deg);
			opacity: 0;
		}
	}

	@keyframes float {

		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-20rpx);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.logo-inner {
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;

		.gx-heart {
			display: flex;
			align-items: center;
			justify-content: center;
			font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;

			.g-letter {
				font-size: 32rpx;
				font-weight: 900;
				color: #ff6b8b;
				transform: rotate(-10deg);
				text-shadow: 1rpx 1rpx 0 #ff3b6d;
			}

			.heart-dot {
				font-size: 16rpx;
				color: #ff3b6d;
				margin: 0 2rpx;
				animation: pulse 1.5s infinite;
			}

			.x-letter {
				font-size: 32rpx;
				font-weight: 900;
				color: #ff6b8b;
				transform: rotate(10deg);
				text-shadow: 1rpx 1rpx 0 #ff3b6d;
			}
		}
	}
</style>