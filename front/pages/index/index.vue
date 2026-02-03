<template>
	<view class="album-container">
		<!-- 下拉刷新区域 -->
		<uni-refresher :enable="true" @refresh="onRefresh" />

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

		<!-- 加载状态 -->
		<view v-if="loading && albumList.length === 0" class="loading-state">
			<uni-load-more status="loading"
				:content-text="{contentdown: '上拉显示更多', contentrefresh: '正在加载...', contentnomore: '没有更多了'}"></uni-load-more>
		</view>

		<!-- 加载更多 -->
		<view v-if="albumList.length > 0 && hasMore">
			<uni-load-more :status="loadMoreStatus" @clickLoadMore="loadMore"></uni-load-more>
		</view>

		<!-- 创建相册悬浮按钮 -->
		<view class="fab-container">
			<button class="fab-button" @click="showCreateForm = true">
				<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
				<text class="fab-text">新建相册</text>
			</button>
		</view>

		<!-- 新建相册表单弹窗 -->
		<view v-if="showCreateForm" class="album-form-overlay" @touchmove.prevent>
			<!-- 遮罩层 -->
			<view class="overlay-mask" @click="showCreateForm = false"></view>

			<!-- 表单内容 -->
			<view class="album-form-wrapper" :style="{ bottom: keyboardHeight + 'px' }">
				<!-- 表单头部 -->
				<view class="form-header">
					<text class="form-title">新建相册</text>
					<view class="close-btn" @click="showCreateForm = false">
						<uni-icons type="close" size="36" color="#666"></uni-icons>
					</view>
				</view>

				<!-- 表单主体 -->
				<scroll-view class="form-content" scroll-y :show-scrollbar="false">
					<!-- 相册名称 -->
					<view class="form-item">
						<text class="form-label required">相册名称</text>
						<input v-model="formData.name" class="form-input" placeholder="请输入相册名称"
							placeholder-class="placeholder" maxlength="20" :focus="formFocus" @focus="onInputFocus"
							@blur="onInputBlur" />
						<view class="char-counter">
							{{ formData.name.length }}/20
						</view>
					</view>

					<!-- 相册描述 -->
					<view class="form-item">
						<text class="form-label">相册描述（可选）</text>
						<textarea v-model="formData.detail" class="form-textarea" placeholder="请输入相册描述..."
							placeholder-class="placeholder" maxlength="100" auto-height @focus="onInputFocus"
							@blur="onInputBlur" />
						<view class="char-counter">
							{{ formData.detail.length }}/100
						</view>
					</view>

					<!-- 封面图片上传 -->
					<view class="form-item cover-upload-item">
						<text class="form-label">相册封面（可选）</text>
						<view class="cover-upload-container">
							<!-- 上传区域 -->
							<view class="cover-upload-area" @click="chooseCoverImage"
								:class="{ 'has-cover': formData.cover_photo }">
								<!-- 已选择封面时的预览 -->
								<view v-if="formData.cover_photo" class="cover-preview">
									<image :src="formData.cover_photo" class="cover-image" mode="aspectFill" />
									<view class="cover-overlay">
										<uni-icons type="camera-filled" size="40" color="#fff"></uni-icons>
										<text class="cover-hint">更换封面</text>
									</view>
								</view>

								<!-- 未选择封面时的占位 -->
								<view v-else class="cover-placeholder">
									<uni-icons type="image" size="50" color="#ccc"></uni-icons>
									<text class="placeholder-text">点击上传封面图片</text>
									<text class="placeholder-hint">建议尺寸 750×500</text>
								</view>
							</view>

							<!-- 封面操作按钮 -->
							<view v-if="formData.cover_photo" class="cover-actions">
								<view class="cover-action-btn preview-btn" @click="previewCover">
									<uni-icons type="eye" size="24" color="#666"></uni-icons>
									<text>预览</text>
								</view>
								<view class="cover-action-btn delete-btn" @click="removeCover">
									<uni-icons type="trash" size="24" color="#f56c6c"></uni-icons>
									<text>删除</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 隐私设置 -->
					<view class="form-item">
						<text class="form-label">隐私设置</text>
						<view class="privacy-options">
							<view class="privacy-option" :class="{ active: formData.is_public }"
								@click="formData.is_public = true">
								<view class="option-icon">
									<uni-icons type="eye" size="32"
										:color="formData.is_public ? '#4CAF50' : '#666'"></uni-icons>
								</view>
								<view class="option-content">
									<text class="option-title">公开</text>
									<text class="option-desc">所有人都可以查看</text>
								</view>
								<view class="option-check" v-if="formData.is_public">
									<uni-icons type="checkmarkempty" size="28" color="#4CAF50"></uni-icons>
								</view>
							</view>

							<view class="privacy-option" :class="{ active: !formData.is_public }"
								@click="formData.is_public = false">
								<view class="option-icon">
									<uni-icons type="eye-slash" size="32"
										:color="!formData.is_public ? '#FF9800' : '#666'"></uni-icons>
								</view>
								<view class="option-content">
									<text class="option-title">私密</text>
									<text class="option-desc">仅自己可以查看</text>
								</view>
								<view class="option-check" v-if="!formData.is_public">
									<uni-icons type="checkmarkempty" size="28" color="#FF9800"></uni-icons>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>

				<!-- 表单底部按钮 -->
				<view class="form-footer">
					<button class="form-btn submit-btn" :class="{ disabled: !formValid || submitting }"
						:disabled="!formValid || submitting" @click="submitAlbumForm">
						<text v-if="!submitting">创建相册</text>
						<text v-else class="loading-text">
							<uni-icons type="spinner-cycle" size="24" color="#fff" class="loading-icon"></uni-icons>
							创建中...
						</text>
					</button>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"

	export default {
		data() {
			return {
				albumList: [],
				loading: false,
				refreshing: false,
				page: 1,
				pageSize: 10,
				hasMore: true,
				loadMoreStatus: 'more',

				// 表单相关数据
				showCreateForm: false,
				formData: {
					name: '',
					detail: '',
					is_public: true,
					cover_photo: '',
					user: uni.getStorageInfoSync("username")
				},
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

		onLoad() {
			this.loadAlbums();
		},

		onPullDownRefresh() {
			this.onRefresh();
		},

		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.loadMore();
			}
		},

		methods: {

			async chooseCoverImage() {
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});

					if (res.tempFilePaths.length > 0) {
						this.formData.cover_photo = res.tempFilePaths[0];
						// 这里可以添加图片压缩或上传逻辑
					}
				} catch (error) {
					console.error('选择图片失败:', error);
					if (error.errMsg !== 'chooseImage:fail cancel') {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				}
			},

			async loadAlbums(isRefresh = false) {
				if (this.loading) return;

				this.loading = true;
				if (isRefresh) {
					this.refreshing = true;
					this.page = 1;
					this.hasMore = true;
				}

				try {
					const token = uni.getStorageSync('token');
					if (!token) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
						return;
					}

					const params = {
						page: this.page,
						page_size: this.pageSize
					};

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

					if (isRefresh) {
						this.albumList = result.results || result;
					} else {
						this.albumList = [...this.albumList, ...(result.results || result)];
					}

					// 判断是否还有更多数据
					this.hasMore = result.next !== null && result.next !== undefined;

				} catch (err) {
					console.error("获取失败:", err);
					uni.showToast({
						title: '加载失败',
						icon: 'error'
					});
				} finally {
					this.loading = false;
					this.refreshing = false;
					uni.stopPullDownRefresh();
				}
			},

			onRefresh() {
				this.loadAlbums(true);
			},

			async loadMore() {
				if (!this.hasMore || this.loading) return;

				this.loadMoreStatus = 'loading';
				this.page++;

				try {
					await this.loadAlbums();
				} finally {
					this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
				}
			},

			goToAlbum(albumId) {
				uni.navigateTo({
					url: `/pages/detailPic/detailPic?id=${albumId}`,
					animationType: 'slide-in-right'
				});
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

			// 提交相册表单
			async submitAlbumForm() {
				console.log("111111")
				if (!this.formValid || this.submitting) return;

				this.submitting = true;
				console.log("222222")
				try {
					const token = uni.getStorageSync('token');
					if (!token) {
						throw new Error('请先登录');
					}

					// 如果有封面图片，需要先上传（这里需要根据你的后端接口实现）
					let coverUrl = this.formData.cover_photo;
					// 如果封面是本地路径，需要上传到服务器
					if (coverUrl && !coverUrl.startsWith('http')) {
						// 这里需要实现图片上传逻辑
						// coverUrl = await this.uploadCoverImage(coverUrl);
					}

					const submitData = {
						name: this.formData.name.trim(),
						detail: this.formData.detail.trim(),
						is_public: this.formData.is_public,
						cover_photo: coverUrl || '' // 添加封面URL
					};
					
					request()
					
					// ... 其他提交逻辑保持不变
				} catch (error) {
					console.error(error)
					// ... 错误处理
				} finally {
					console.log("3333333")
					this.submitting = false;
				}
			},
			// 重置表单
			resetForm() {
				this.formData = {
					name: '',
					detail: '',
					is_public: true
				};
				this.formFocus = false;
			},

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
				console.log('图片加载成功');
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
		padding: 20rpx;
		position: relative;
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

	.fab-container {
		position: fixed;
		bottom: 150rpx;
		right: 40rpx;
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

	/* 新建相册表单弹窗样式 */
	.album-form-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.overlay-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		animation: fadeIn 0.3s ease;
	}

	.album-form-wrapper {
		position: relative;
		background: white;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		animation: slideUp 0.3s ease;
		max-height: 80vh;
		display: flex;
		flex-direction: column;

	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;

		.form-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #333;
		}

		.close-btn {
			padding: 12rpx;
			border-radius: 50%;

			&:active {
				background: #f5f5f5;
			}
		}
	}

	.form-content {
		flex: 1;
		padding: 32rpx 32rpx !important;
		/* 确保上下左右都有内边距 */
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		box-sizing: border-box;
		/* 确保内边距计算正确 */
	}

	.form-item {
		margin: 32rpx 0;

		.form-label {
			display: block;
			font-size: 30rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 16rpx;

			&.required::after {
				content: "*";
				color: #f5222d;
				margin-left: 4rpx;
			}
		}

		.char-counter {
			text-align: right;
			font-size: 24rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		padding: 0 24rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		border: 2rpx solid transparent;

		&:focus {
			border-color: #667eea;
			background: white;
		}
	}

	.form-textarea {
		width: 100%;
		min-height: 120rpx;
		padding: 24rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		border: 2rpx solid transparent;
		line-height: 1.5;

		&:focus {
			border-color: #667eea;
			background: white;
		}
	}

	.placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.privacy-options {
		background: #f8f9fa;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.privacy-option {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background: white;
		margin-bottom: 1rpx;

		&:last-child {
			margin-bottom: 0;
		}

		&.active {
			background: #f0f7ff;
		}

		&:active {
			opacity: 0.8;
		}
	}

	.option-icon {
		width: 60rpx;
		display: flex;
		justify-content: center;
	}

	.option-content {
		flex: 1;
		margin-left: 20rpx;

		.option-title {
			display: block;
			font-size: 28rpx;
			font-weight: 600;
			color: #333;
		}

		.option-desc {
			display: block;
			font-size: 24rpx;
			color: #666;
			margin-top: 4rpx;
		}
	}

	.option-check {
		margin-left: 16rpx;
	}

	.form-footer {
		padding: 32rpx;
		border-top: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.form-btn {
		width: 100%;
		height: 88rpx;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.98);
		}
	}

	.submit-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;

		&.disabled {
			opacity: 0.6;
		}

		&:not(.disabled):active {
			opacity: 0.9;
		}
	}

	.loading-text {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.loading-icon {
		animation: rotate 1s linear infinite;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	/* 响应式调整 */
	@media (max-width: 750rpx) {
		.album-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 16rpx;
		}

		.album-cover-container {
			height: 280rpx;
		}

		.album-info {
			padding: 20rpx;
		}

		.album-name {
			font-size: 30rpx;
		}

		.album-detail {
			font-size: 24rpx;
		}
	}

	@media (min-width: 751rpx) {
		.album-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 24rpx;
		}

		.album-form-wrapper {
			max-width: 600rpx;
			margin: 0 auto;
			border-radius: 32rpx;
			bottom: 50% !important;
			transform: translateY(50%);
			animation: scaleIn 0.3s ease;
			max-height: 70vh;
		}

		@keyframes scaleIn {
			from {
				opacity: 0;
				transform: translateY(50%) scale(0.9);
			}

			to {
				opacity: 1;
				transform: translateY(50%) scale(1);
			}
		}
	}

	/* 暗色模式适配 */
	@media (prefers-color-scheme: dark) {
		.album-container {
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		}

		.album-card {
			background: #2d3748;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
		}

		.album-name {
			color: #e2e8f0;
		}

		.album-detail {
			color: #a0aec0;
		}

		.no-detail {
			color: #718096;
		}

		.album-cover-container {
			background: linear-gradient(45deg, #2d3748, #4a5568);
		}

		/* 暗色模式表单样式 */
		.album-form-wrapper {
			background: #2d3748;
		}

		.form-header {
			border-bottom-color: #4a5568;

			.form-title {
				color: #e2e8f0;
			}

			.close-btn:active {
				background: #4a5568;
			}
		}

		.form-item .form-label {
			color: #e2e8f0;
		}

		.form-input,
		.form-textarea {
			background: #4a5568;
			color: #e2e8f0;
			border-color: #4a5568;

			&:focus {
				background: #4a5568;
				border-color: #667eea;
			}
		}

		.placeholder {
			color: #718096;
		}

		.privacy-options {
			background: #4a5568;
		}

		.privacy-option {
			background: #2d3748;
			margin-bottom: 1rpx;

			&.active {
				background: #1a365d;
			}

			&:active {
				background: #4a5568;
			}
		}

		.option-content .option-title {
			color: #e2e8f0;
		}

		.option-content .option-desc {
			color: #a0aec0;
		}

		.form-footer {
			border-top-color: #4a5568;
		}

		.char-counter {
			color: #718096;
		}

		.overlay-mask {
			background: rgba(0, 0, 0, 0.7);
		}
	}

	/* 在 <style> 部分添加 */
	.cover-upload-item {
		margin-bottom: 32rpx;
	}

	.cover-upload-container {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.cover-upload-area {
		background: #f8f9fa;
		border-radius: 16rpx;
		border: 2rpx dashed #ddd;
		height: 280rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;

		&.has-cover {
			border-style: solid;
			border-color: #4CAF50;
		}

		&:active {
			background: #f0f0f0;
		}
	}

	.cover-preview {
		width: 100%;
		height: 100%;
		position: relative;

		.cover-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.cover-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			opacity: 0;
			transition: opacity 0.3s ease;

			.cover-hint {
				color: white;
				font-size: 24rpx;
				margin-top: 12rpx;
			}
		}

		&:active .cover-overlay {
			opacity: 1;
		}
	}

	.cover-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30rpx;

		.placeholder-text {
			font-size: 28rpx;
			color: #666;
			margin-top: 16rpx;
			margin-bottom: 8rpx;
		}

		.placeholder-hint {
			font-size: 22rpx;
			color: #999;
		}
	}

	.cover-actions {
		display: flex;
		gap: 20rpx;
		justify-content: center;
	}

	.cover-action-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 24rpx;
		background: #f8f9fa;
		border-radius: 12rpx;

		text {
			font-size: 24rpx;
			color: #666;
		}

		&:active {
			background: #e9ecef;
		}

		&.delete-btn {
			background: #fff5f5;

			text {
				color: #f56c6c;
			}

			&:active {
				background: #ffe6e6;
			}
		}
	}

	/* 暗色模式适配 */
	@media (prefers-color-scheme: dark) {
		.cover-upload-area {
			background: #4a5568;
			border-color: #718096;

			&.has-cover {
				border-color: #4CAF50;
			}

			&:active {
				background: #2d3748;
			}
		}

		.cover-placeholder {
			.placeholder-text {
				color: #a0aec0;
			}

			.placeholder-hint {
				color: #718096;
			}
		}

		.cover-action-btn {
			background: #4a5568;

			text {
				color: #a0aec0;
			}

			&:active {
				background: #2d3748;
			}

			&.delete-btn {
				background: #2c1817;

				text {
					color: #f56c6c;
				}

				&:active {
					background: #1a100f;
				}
			}
		}

		.cover-overlay {
			background: rgba(0, 0, 0, 0.7);
		}
	}
</style>