<template>
	<view class="album-container">
		<!-- 相册列表网格 -->
		<scroll-view 
			:scroll-y="true" 
			:style="{height: scrollViewHeight + 'px'}"
			@scrolltolower="loadMore"
			refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			:lower-threshold="100"
			:scroll-with-animation="true"
			class="scroll-view"
		>
			<view class="album-grid" v-if="albumList.length > 0">
				<view class="album-card" v-for="(album, index) in albumList" :key="index" @click="goToAlbum(album.id)">
					<!-- 封面图片容器 -->
					<view class="album-cover-container">
						<image v-if="album.cover_photo" class="album-cover-image" :src="album.cover_photo" mode="aspectFill"
							@load="onImageLoad" @error="onImageError" />
						<!-- 无封面时的占位图 -->
						<view v-else class="album-cover-placeholder">
							<uni-icons type="image" size="60" color="#ccc"></uni-icons>
							<text class="placeholder-text">暂无封面</text>
						</view>

						<!-- 照片数量角标 -->
						<view class="photo-count-badge" v-if="album.photo_count > 0">
							<uni-icons type="camera-filled" size="24" color="#fff"></uni-icons>
							<text class="count-text">{{ album.photo_count }}</text>
						</view>

						<!-- 公开/私密标签 -->
						<view class="privacy-badge" :class="{'public': album.is_public, 'private': !album.is_public}">
							{{ album.is_public ? '公开' : '私密' }}
						</view>
					</view>

					<!-- 相册信息 -->
					<view class="album-info">
						<!-- 相册名称 -->
						<text class="album-name">{{ album.name }}</text>

						<!-- 相册描述 -->
						<text class="album-detail" v-if="album.detail">
							{{ album.detail }}
						</text>
						<text class="no-detail" v-else>暂无描述</text>

						<!-- 相册元信息 -->
						<view class="album-meta">
							<view class="meta-item">
								<uni-icons type="calendar" size="24" color="#999"></uni-icons>
								<text class="meta-text">{{ formatDate(album.created_at) }}</text>
							</view>

							<view class="meta-item" v-if="album.user && album.user.username">
								<uni-icons type="person" size="24" color="#999"></uni-icons>
								<text class="meta-text">{{ album.user.username }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!loading" class="empty-state">
				<image class="empty-image" src="/static/empty-album.png" mode="widthFix"></image>
				<text class="empty-title">还没有相册</text>
				<text class="empty-subtitle">点击下方按钮创建一个吧</text>
				<button class="create-button" @click="showCreateForm = true">创建相册</button>
			</view>

			<!-- 加载状态（首次加载） -->
			<view v-if="loading && albumList.length === 0" class="loading-state">
				<uni-load-more status="loading" :content-text="loadMoreText"></uni-load-more>
			</view>

			<!-- 加载更多（底部加载） -->
			<view v-if="albumList.length > 0" class="load-more-container">
				<uni-load-more 
					:status="loadMoreStatus" 
					:content-text="loadMoreText"
					@clickLoadMore="loadMore"
				></uni-load-more>
			</view>
		</scroll-view>

		<!-- 创建相册悬浮按钮 -->
		<view class="fab-container">
			<button class="fab-button" @click="showCreateForm = true">
				<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
				<text class="fab-text">新建相册</text>
			</button>
		</view>

		<!-- 新建相册表单弹窗（你的原有代码，这里省略） -->
	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"

	export default {
		data() {
			return {
				// 列表数据
				albumList: [],
				loading: false,
				refreshing: false,
				
				// 分页参数
				page: 1,
				pageSize: 10,
				total: 0,
				hasMore: true,
				loadMoreStatus: 'more',
				
				// 加载更多文本配置
				loadMoreText: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多了'
				},
				
				// 滚动视图高度
				scrollViewHeight: 0,

				// 表单相关数据
				showCreateForm: false,
				formData: {
					name: '',
					detail: '',
					is_public: true,
					cover_photo: '',
					user: uni.getStorageSync("token")
				},
				pre_cover: "",
				formFocus: false,
				submitting: false,
				keyboardHeight: 0
			};
		},

		computed: {
			formValid() {
				return this.formData.name.trim().length > 0
			}
		},

		// 页面生命周期钩子
		onLoad() {
			// 计算滚动视图高度
			this.getScrollViewHeight();
			// 加载数据
			this.loadAlbums(true);
		},

		onShow() {
			// 每次显示页面时重新计算高度
			this.getScrollViewHeight();
		},

		// 监听原生下拉刷新（如果不使用scroll-view的refresher）
		onPullDownRefresh() {
			this.onRefresh();
		},

		// 监听原生上拉加载更多（如果不使用scroll-view的scrolltolower）
		onReachBottom() {
			console.log('触底了', this.hasMore, this.loading);
			if (this.hasMore && !this.loading && !this.refreshing) {
				this.loadMore();
			}
		},

		methods: {
			/**
			 * 计算滚动视图高度
			 */
			getScrollViewHeight() {
				const systemInfo = uni.getSystemInfoSync();
				// 减去可能的导航栏高度和底部安全区域
				this.scrollViewHeight = systemInfo.windowHeight;
			},

			/**
			 * 加载相册列表
			 * @param {Boolean} isRefresh 是否是下拉刷新
			 */
			async loadAlbums(isRefresh = false) {
				// 防止重复请求
				if (this.loading) {
					console.log('正在加载中，跳过请求');
					return;
				}
				
				// 如果没有更多数据且不是刷新，不继续加载
				if (!isRefresh && !this.hasMore) {
					console.log('没有更多数据，跳过加载');
					return;
				}

				this.loading = true;
				
				// 更新状态
				if (isRefresh) {
					console.log('执行下拉刷新');
					this.refreshing = true;
					this.page = 1;
					this.hasMore = true;
					this.loadMoreStatus = 'more';
				} else {
					console.log('执行加载更多，页码：', this.page + 1);
					this.loadMoreStatus = 'loading';
				}

				try {
					// 获取token
					const token = uni.getStorageSync('token');
					if (!token) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
						return;
					}

					// 构建请求参数
					const params = {
						page: isRefresh ? 1 : this.page,
						page_size: this.pageSize
					};

					console.log('请求参数：', params);

					// 发送请求
					const result = await request({
						url: `${cfg.base_url}/album/list`,
						method: 'GET',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						},
						data: params,
						timeout: 10000
					});

					console.log('返回结果：', result);

					// 处理返回数据
					let newList = [];
					let total = 0;
					
					// 根据不同的返回格式处理
					if (Array.isArray(result)) {
						newList = result;
						total = result.length;
					} else if (result.results) {
						newList = result.results;
						total = result.count || newList.length;
					} else if (result.data) {
						newList = result.data;
						total = result.total || newList.length;
					} else {
						newList = result;
						total = newList.length;
					}
					
					if (isRefresh) {
						// 刷新：替换整个列表
						this.albumList = newList;
						console.log('刷新后列表长度：', this.albumList.length);
					} else {
						// 加载更多：追加到列表
						this.albumList = [...this.albumList, ...newList];
						console.log('追加后列表长度：', this.albumList.length);
					}
					
					// 更新总条数
					this.total = total;
					
					// 判断是否还有更多数据
					// 方法1: 根据后端返回的next字段
					if (result.next !== undefined) {
						this.hasMore = result.next !== null;
					} else {
						// 方法2: 根据返回的数据长度判断
						this.hasMore = newList.length === this.pageSize;
					}
					
					// 更新页码（只有在加载更多成功后才增加页码）
					if (!isRefresh && newList.length > 0) {
						this.page++;
					}
					
					// 更新加载更多状态
					if (this.hasMore) {
						this.loadMoreStatus = 'more';
					} else {
						this.loadMoreStatus = 'noMore';
					}
					
					console.log(`当前页: ${this.page}, 总数: ${this.total}, 还有更多: ${this.hasMore}`);

				} catch (err) {
					console.error("获取失败:", err);
					uni.showToast({
						title: '加载失败',
						icon: 'error'
					});
					
					// 加载失败时恢复状态
					this.loadMoreStatus = 'more';
				} finally {
					this.loading = false;
					this.refreshing = false;
					
					// 停止原生下拉刷新
					uni.stopPullDownRefresh();
				}
			},

			/**
			 * 下拉刷新
			 */
			onRefresh() {
				console.log("触发下拉刷新");
				this.loadAlbums(true);
			},

			/**
			 * 加载更多
			 */
			loadMore() {
				console.log("触发加载更多，当前状态：", {
					hasMore: this.hasMore,
					loading: this.loading,
					refreshing: this.refreshing,
					currentPage: this.page
				});
				
				if (!this.hasMore) {
					console.log("没有更多数据了");
					return;
				}
				
				if (this.loading) {
					console.log("正在加载中");
					return;
				}
				
				if (this.refreshing) {
					console.log("正在刷新中");
					return;
				}
				
				this.loadAlbums();
			},

			/**
			 * 跳转到相册详情
			 */
			goToAlbum(albumId) {
				uni.navigateTo({
					url: `/pages/detailPic/detailPic?id=${albumId}`,
					animationType: 'slide-in-right'
				});
			},

			/**
			 * 选择封面图片
			 */
			async chooseCoverImage() {
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});

					if (res.tempFilePaths.length > 0) {
						this.pre_cover = res.tempFilePaths[0];
						const tempFilePath = res.tempFilePaths[0];
						
						uni.showLoading({
							title: '上传中...'
						});
						
						// 上传图片
						const uploadRes = await uni.uploadFile({
							url: `${cfg.base_url}/album/upload/cover/`,
							name: 'cover_photo',
							filePath: tempFilePath,
							method: "POST",
							header: {
								'token': `${uni.getStorageSync('token')}`
							}
						});
						
						uni.hideLoading();
						
						if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
							const uploadResult = JSON.parse(uploadRes.data);
							const imagePath = uploadResult.image_path || uploadResult.url || uploadResult.path;
							if (!imagePath) {
								uni.showToast({
									title: '上传失败',
									icon: 'none'
								});
								return;
							}
							this.formData.cover_photo = imagePath;
							
							uni.showToast({
								title: '上传成功',
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							});
						}
					}
				} catch (error) {
					uni.hideLoading();
					console.error('选择图片失败:', error);
					if (error.errMsg !== 'chooseImage:fail cancel') {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				}
			},

			/**
			 * 预览封面图片
			 */
			previewCover() {
				if (this.pre_cover) {
					uni.previewImage({
						urls: [this.pre_cover],
						current: 0
					});
				}
			},

			/**
			 * 移除封面图片
			 */
			removeCover() {
				this.pre_cover = "";
				this.formData.cover_photo = "";
			},

			// 处理键盘弹出
			onInputFocus() {
				uni.onKeyboardHeightChange(res => {
					this.keyboardHeight = res.height;
				});
			},

			onInputBlur() {
				setTimeout(() => {
					this.keyboardHeight = 0;
				}, 100);
			},

			/**
			 * 提交相册表单
			 */
			async submitAlbumForm() {
				console.log(this.formData)
				if (!this.formValid || this.submitting) return;

				this.submitting = true;
				console.log("开始提交")

				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					this.submitting = false;
					return;
				}
				
				try {
					const result = await request({
						url: `${cfg.base_url}/album/`,
						method: 'POST',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						},
						data: {
							...this.formData
						},
						timeout: 10000
					});
					
					uni.showToast({
						title: "添加成功!",
						icon: 'success',
						duration: 1500,
					});
					
					// 将新创建的相册添加到列表顶部
					this.albumList = [result, ...this.albumList];
					
					// 重置表单并关闭弹窗
					this.resetForm();
					this.showCreateForm = false;
					
					// 刷新页面数据
					this.onRefresh();

				} catch (e) {
					console.log("提交失败", e);
					uni.showToast({
						title: "请检查参数!",
						icon: 'error',
						duration: 1500,
					});
				} finally {
					this.submitting = false;
				}
			},
			
			/**
			 * 重置表单
			 */
			resetForm() {
				this.formData = {
					name: '',
					detail: '',
					is_public: true,
					cover_photo: '',
					user: uni.getStorageSync("token")
				};
				this.pre_cover = "";
				this.formFocus = false;
			},

			/**
			 * 格式化日期
			 */
			formatDate(dateString) {
				if (!dateString) return '';

				const date = new Date(dateString);
				const now = new Date();
				const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

				if (diffDays === 0) return '今天';
				if (diffDays === 1) return '昨天';
				if (diffDays < 7) return `${diffDays}天前`;
				if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');

				if (year === now.getFullYear()) {
					return `${month}-${day}`;
				}

				return `${year}-${month}-${day}`;
			},

			onImageLoad(e) {
				// console.log('图片加载成功');
			},

			onImageError(e) {
				console.error('图片加载失败:', e);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.album-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		position: relative;
		display: flex;
		flex-direction: column;
	}
	
	.scroll-view {
		flex: 1;
		padding: 20rpx;
	}

	.album-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}

	.album-card {
		background: white;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;

		&:active {
			transform: translateY(-4rpx);
			box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
		}
	}

	.album-cover-container {
		position: relative;
		width: 100%;
		height: 320rpx;
		overflow: hidden;
		background: linear-gradient(45deg, #f5f7fa, #e4efe9);

		.album-cover-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.5s ease;
		}

		&:hover .album-cover-image {
			transform: scale(1.05);
		}
	}

	.album-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #ccc;

		.placeholder-text {
			font-size: 24rpx;
			margin-top: 16rpx;
			color: #999;
		}
	}

	.photo-count-badge {
		position: absolute;
		bottom: 16rpx;
		right: 16rpx;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10rpx);
		border-radius: 20rpx;
		padding: 6rpx 16rpx;
		display: flex;
		align-items: center;
		gap: 6rpx;

		.count-text {
			font-size: 22rpx;
			color: white;
			font-weight: 500;
		}
	}

	.privacy-badge {
		position: absolute;
		top: 16rpx;
		left: 16rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		font-size: 20rpx;
		font-weight: 500;

		&.public {
			background: rgba(76, 175, 80, 0.9);
			color: white;
		}

		&.private {
			background: rgba(244, 67, 54, 0.9);
			color: white;
		}
	}

	.album-info {
		padding: 24rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.album-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
		line-height: 1.4;
		margin-bottom: 12rpx;
		font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.album-detail {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 16rpx;
		flex: 1;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
	}

	.no-detail {
		font-size: 26rpx;
		color: #999;
		font-style: italic;
		margin-bottom: 16rpx;
		flex: 1;
	}

	.album-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6rpx;

		.meta-text {
			font-size: 22rpx;
			color: #999;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;

		.empty-image {
			width: 300rpx;
			height: 300rpx;
			opacity: 0.6;
		}

		.empty-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #666;
			margin-top: 40rpx;
		}

		.empty-subtitle {
			font-size: 28rpx;
			color: #999;
			margin-top: 16rpx;
		}

		.create-button {
			margin-top: 48rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border-radius: 50rpx;
			padding: 24rpx 48rpx;
			font-size: 28rpx;
			font-weight: 600;
			border: none;

			&:active {
				opacity: 0.9;
			}
		}
	}

	.loading-state {
		display: flex;
		justify-content: center;
		padding: 80rpx 0;
	}
	
	.load-more-container {
		margin-top: 20rpx;
		padding-bottom: 20rpx;
	}

	.fab-container {
		position: fixed;
		bottom: 30rpx;
		right: 30rpx;
		z-index: 99;
	}

	.fab-button {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50rpx;
		padding: 0 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		font-size: 28rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.4);
		border: none;
		height: 80rpx;
		line-height: 80rpx;
		white-space: nowrap;

		.fab-text {
			font-size: 28rpx;
			font-weight: 600;
		}

		&:active {
			transform: scale(0.95);
		}
	}
</style>