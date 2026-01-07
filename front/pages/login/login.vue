<template>
	<view class="page_login">
		<!-- 动态背景轮播 -->
		<view class="slider-background">
			<!-- 网络背景图（使用image标签而不是background-image） -->
			<image 
				v-if="networkBgImage && !bgLoadFailed" 
				class="network-background-image"
				:src="networkBgImage" 
				mode="aspectFill"
				@error="onNetworkBgError"
				@load="onNetworkBgLoad"
			/>
			<view v-if="networkBgImage && !bgLoadFailed" class="network-bg-overlay"></view>
			
			<!-- 默认背景轮播（当没有网络图片或网络图片加载失败时显示） -->
			<view v-if="(!networkBgImage || bgLoadFailed) && !loadingBg" class="default-background">
				<swiper class="background-swiper" :autoplay="true" :interval="5000" :duration="1000" circular>
					<swiper-item v-for="(item, index) in defaultBgImages" :key="index">
						<image class="bg-image" :src="item" mode="aspectFill" />
						<view class="bg-overlay"></view>
					</swiper-item>
				</swiper>
			</view>

			<!-- 爱心飘落效果 -->
			<view class="falling-hearts">
				<text v-for="i in 15" :key="i" class="heart" :style="getHeartStyle(i)">❤️</text>
			</view>
			
			<!-- 背景加载遮罩 -->
			<view v-if="loadingBg" class="bg-loading-mask">
				<view class="loading-content">
					<view class="loading-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
					<text class="loading-text">加载背景中...</text>
				</view>
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
					<text class="app-slogan">记录每一刻的甜蜜</text>
				</view>
			</view>

			<!-- 登录form -->
			<view class="login_form">
				<view class="input-group">
					<view class="input-box">
						<view class="icon-wrapper">
							<image class="input-icon" :src="imgInfo.icon_user" mode="widthFix" />
						</view>
						<input type="text" v-model="username" placeholder="请输入用户账号" placeholder-class="placeholder"
							@input="inputUsername" />
						<view class="icon-wrapper" @tap="delUser">
							<image v-if="username" class="clear-icon" :src="imgInfo.icon_del" mode="widthFix" />
						</view>
					</view>
				</view>

				<view class="input-group">
					<view class="input-box">
						<view class="icon-wrapper">
							<image class="input-icon" :src="imgInfo.icon_pwd" mode="widthFix" />
						</view>
						<input :type="pwdType" :value="userpwd" @input="inputPwd" placeholder="请输入密码"
							placeholder-class="placeholder" />
						<view class="icon-wrapper" @tap="switchPwd">
							<image class="pwd-toggle-icon" :src="imgInfo.icon_pwd_switch" mode="widthFix" />
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
				<view class="register-guide">
					<text class="guide-text">还没有账号？</text>
					<text class="register-link" @tap="goReg">立即注册</text>
				</view>

				<!-- 背景图切换按钮 -->
				<view class="bg-switch" @tap="refreshBackground" :class="{ 'disabled': loadingBg }">
					<image class="refresh-icon" :src="imgInfo.refresh" mode="widthFix" />
					<text class="refresh-text">{{ loadingBg ? '加载中...' : '换张背景' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import cfg from '../../common/cfg.js';
	import request from '../../utils/request.js';

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
				loadingBg: false, // 背景图加载状态
				bgLoadFailed: false, // 背景图加载失败
				networkBgImage: 'http://127.0.0.1:8000/media/loginBackgroundImg/2026/01/06/bk.jpeg', // 网络背景图URL
				networkBgImages: [], // 所有网络背景图数组
				currentBgIndex: 0, // 当前背景图索引
				defaultBgImages: [
					isUni ? '/static/bg1.jpg' : require('./images/bg1.jpg'),
					isUni ? '/static/bg2.jpg' : require('./images/bg2.jpg'),
					isUni ? '/static/bg3.jpg' : require('./images/bg3.jpg'),
					isUni ? '/static/bg4.jpg' : require('./images/bg4.jpg')
				],
				imgInfo: {
					icon_user: isUni ? '/static/icon_user.png' : require('./images/icon_user.png'),
					icon_del: isUni ? '/static/icon_del.png' : require('./images/icon_del.png'),
					icon_pwd: isUni ? '/static/icon_pwd.png' : require('./images/icon_pwd.png'),
					icon_pwd_switch: isUni ? '/static/icon_pwd_switch.png' : require('./images/icon_pwd_switch.png'),
					refresh: isUni ? '/static/refresh.png' : require('./images/refresh.png')
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
			this.fetchBackgroundImage() // 加载网络背景图
		},
		methods: {
			// 获取网络背景图片
			async fetchBackgroundImage() {
				if (this.loadingBg) return
				
				this.loadingBg = true
				this.bgLoadFailed = false

				try {
					// 这里调用您的API接口获取背景图
					const response = await request({
						url: `${cfg.base_url}/api/loginImg/`, // 您的背景图API
						method: "GET",
						timeout: 8000 // 增加超时时间
					})
					
					console.log('背景图API响应:', response)
					
					if (response && response.results && response.results.length > 0) {
						// 提取所有图片URL
						const images = response.results.map(item => {
							// 确保URL是完整的（如果不是完整URL，则添加基础URL）
							if (item.image && item.image.startsWith('http')) {
								return item.image
							} else if (item.image) {
								return `${cfg.base_url}${item.image.startsWith('/') ? '' : '/'}${item.image}`
							}
							return null
						}).filter(url => url !== null)
						
						if (images.length > 0) {
							this.networkBgImages = images
							// 设置第一张图片
							this.networkBgImage = images[0]
							console.log('设置背景图URL:', this.networkBgImage)
							
							// 不需要预加载，image标签会自动加载
						} else {
							throw new Error('未获取到有效的图片URL')
						}
					} else {
						throw new Error('API返回数据格式错误或为空')
					}
				} catch (error) {
					console.error('加载网络背景图失败:', error)
					this.bgLoadFailed = true
					this.networkBgImage = ''
					this.networkBgImages = []

					// 失败后显示默认背景
					uni.showToast({
						title: '使用默认背景',
						icon: 'none',
						duration: 1500
					})
				} finally {
					// 延迟隐藏loading，确保图片有足够时间开始加载
					setTimeout(() => {
						this.loadingBg = false
					}, 500)
				}
			},

			// 网络背景图加载成功
			onNetworkBgLoad() {
				console.log('网络背景图加载成功')
				this.bgLoadFailed = false
			},

			// 网络背景图加载失败
			onNetworkBgError() {
				console.error('网络背景图加载失败')
				this.bgLoadFailed = true
				this.networkBgImage = ''
			},

			// 刷新背景图
			async refreshBackground() {
				if (this.loadingBg) return
				
				// 如果有多个网络背景图，切换到下一张
				if (this.networkBgImages.length > 1) {
					this.currentBgIndex = (this.currentBgIndex + 1) % this.networkBgImages.length
					this.networkBgImage = this.networkBgImages[this.currentBgIndex]
					uni.showToast({
						title: '切换背景',
						icon: 'none',
						duration: 1000
					})
				} else {
					// 否则重新获取
					this.networkBgImage = ''
					this.fetchBackgroundImage()
					uni.showToast({
						title: '获取新背景中...',
						icon: 'none',
						duration: 1000
					})
				}
			},

			getHeartStyle(index) {
				// 生成更自然的爱心飘落样式
				const left = Math.random() * 100
				const duration = 3 + Math.random() * 4
				const delay = Math.random() * 5
				const size = 20 + Math.random() * 20
				const opacity = 0.2 + Math.random() * 0.3
				const rotate = Math.random() * 360

				return {
					left: `${left}%`,
					animationDuration: `${duration}s`,
					animationDelay: `${delay}s`,
					fontSize: `${size}rpx`,
					opacity: opacity,
					transform: `rotate(${rotate}deg)`
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
				uni.showLoading({
					title: '登录中...'
				})

				try {
					const result = await request({
						url: `${cfg.base_url}/login/in/`,
						method: "POST",
						data: {
							username: this.username,
							password: this.userpwd,
						},
						timeout: 2000
					})

					if (result.code === 200) {
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

						// 保存用户认证信息
						if (result.token) {
							uni.setStorageSync('token', result.token)
						}
						if (result.username) {
							uni.setStorageSync('username', result.username)
						}
						if (result.id) {
							uni.setStorageSync('id', result.id)
						}

						// 跳转到首页
						setTimeout(() => {
							uni.switchTab({
								url: "/pages/index/index",
								success() {
									console.log("跳转成功")
								},
								fail(err) {
									console.log("跳转失败:", err)
								}
							})
						}, 1500)
					} else {
						uni.showToast({
							title: '用户名或密码错误',
							icon: "error",
							duration: 1500
						})
					}
				} catch (error) {
					console.error('网络异常:', error)
					uni.showToast({
						title: '网络异常，请重试',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},

			goReg() {
				uni.navigateTo({
					url: '/pages/reg/reg'
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

// 修复背景区域
.slider-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    // 网络背景图 - 使用image标签
    .network-background-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        animation: fadeIn 0.8s ease-out;
        z-index: 1;
    }
    
    .network-bg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg,
                rgba(252, 44, 93, 0.4),
                rgba(255, 107, 139, 0.3),
                rgba(255, 142, 83, 0.25));
        backdrop-filter: blur(1px);
        z-index: 2;
    }
    
    // 默认背景轮播
    .default-background {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1;
        
        .background-swiper {
            width: 100%;
            height: 100%;
            
            .bg-image {
                width: 100%;
                height: 100%;
                display: block;
            }
            
            .bg-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(252, 44, 93, 0.3), rgba(255, 107, 139, 0.2));
                z-index: 2;
            }
        }
    }
    
    // 爱心飘落效果
    .falling-hearts {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 3;
        
        .heart {
            position: absolute;
            top: -50rpx;
            animation: falling linear infinite;
            color: #ff6b8b;
            text-shadow: 0 2rpx 10rpx rgba(255, 107, 139, 0.3);
            will-change: transform;
        }
    }
    
    // 背景加载遮罩
    .bg-loading-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4;
        
        .loading-content {
            background: rgba(255, 255, 255, 0.9);
            padding: 40rpx 60rpx;
            border-radius: 20rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            
            .loading-dots {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20rpx;
                
                .dot {
                    width: 20rpx;
                    height: 20rpx;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #ff6b8b, #ff8e53);
                    margin: 0 10rpx;
                    animation: bounce 1.4s infinite ease-in-out both;
                    
                    &:nth-child(1) {
                        animation-delay: -0.32s;
                    }
                    
                    &:nth-child(2) {
                        animation-delay: -0.16s;
                    }
                }
            }
            
            .loading-text {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
            }
        }
    }
}

// 登录卡片
.login-card {
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 50rpx;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(15rpx);
    -webkit-backdrop-filter: blur(15rpx);
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
            width: 160rpx;
            height: 160rpx;
            border-radius: 50%;
            background: linear-gradient(45deg, #ff6b8b, #ff8e53);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30rpx;
            box-shadow: 0 20rpx 40rpx rgba(255, 107, 139, 0.4);
            animation: float 3s ease-in-out infinite;
            position: relative;

            &::after {
                content: '';
                position: absolute;
                top: -5rpx;
                left: -5rpx;
                right: -5rpx;
                bottom: -5rpx;
                border-radius: 50%;
                background: linear-gradient(45deg, #ff6b8b, #ff8e53);
                z-index: -1;
                filter: blur(15rpx);
                opacity: 0.6;
            }

            .logo-inner {
                width: 130rpx;
                height: 130rpx;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: inset 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

                .gx-heart {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;

                    .g-letter {
                        font-size: 38rpx;
                        font-weight: 900;
                        color: #ff6b8b;
                        transform: rotate(-10deg);
                        text-shadow: 2rpx 2rpx 0 #ff3b6d;
                    }

                    .heart-dot {
                        font-size: 20rpx;
                        color: #ff3b6d;
                        margin: 0 4rpx;
                        animation: pulse 1.5s infinite;
                    }

                    .x-letter {
                        font-size: 38rpx;
                        font-weight: 900;
                        color: #ff6b8b;
                        transform: rotate(10deg);
                        text-shadow: 2rpx 2rpx 0 #ff3b6d;
                    }
                }
            }
        }

        .app-name {
            font-size: 48rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 10rpx;
            letter-spacing: 2rpx;
        }

        .app-slogan {
            font-size: 28rpx;
            color: #666;
            opacity: 0.8;
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
            background: rgba(248, 249, 250, 0.9);
            border-radius: 45rpx;
            padding: 0 30rpx;
            border: 2rpx solid transparent;
            transition: all 0.3s;

            &:focus-within {
                border-color: #ff6b8b;
                background: white;
                box-shadow: 0 10rpx 30rpx rgba(255, 107, 139, 0.15);
                transform: translateY(-2rpx);
            }

            .icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40rpx;

                .input-icon {
                    width: 30rpx;
                    height: 30rpx;
                    opacity: 0.8;
                }

                .clear-icon {
                    width: 26rpx;
                    height: 26rpx;
                    opacity: 0.6;
                    transition: opacity 0.3s;

                    &:active {
                        opacity: 1;
                    }
                }

                .pwd-toggle-icon {
                    width: 35rpx;
                    height: 15rpx;
                    opacity: 0.8;
                }
            }

            input {
                flex: 1;
                height: 100%;
                margin: 0 20rpx;
                font-size: 32rpx;
                color: #333;
                background: transparent;
                font-weight: 500;
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

        .remember-me {
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
                transition: all 0.3s;

                &.checked {
                    background: linear-gradient(45deg, #ff6b8b, #ff8e53);
                    border-color: transparent;
                    transform: scale(1.1);

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
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }

        &:active {
            transform: scale(0.98);

            &::before {
                left: 100%;
            }
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
            position: relative;

            &::after {
                content: '';
                position: absolute;
                bottom: -4rpx;
                left: 0;
                width: 100%;
                height: 2rpx;
                background: linear-gradient(90deg, #ff6b8b, #ff8e53);
                transform: scaleX(0);
                transition: transform 0.3s;
            }

            &:active::after {
                transform: scaleX(1);
            }
        }
    }

    // 背景切换按钮
    .bg-switch {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 30rpx;
        padding: 20rpx;
        border-radius: 30rpx;
        background: rgba(255, 255, 255, 0.7);
        transition: all 0.3s;
        
        &:not(.disabled):active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(0.95);
        }
        
        &.disabled {
            opacity: 0.6;
        }

        .refresh-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 10rpx;
            opacity: 0.7;
        }

        .refresh-text {
            font-size: 26rpx;
            color: #666;
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

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

/* 调试样式 - 如果仍有问题，可以暂时启用 */
/*
.debug-border {
    border: 2rpx solid red !important;
}
*/
</style>