<template>

	<view class="album-detail-container">
		<!-- 返回按钮 -->
		<!--     <view class="nav-back" @click="goBack">
            <uni-icons type="arrowleft" size="32" color="#333"></uni-icons>
        </view>
        -->
		<!-- 相册头部信息 -->
		<view class="album-header" :class="{'with-cover': album.cover_photo}">
			<!-- 封面背景图 -->
			<image v-if="album.cover_photo" class="album-cover-background" :src="album.cover_photo" mode="aspectFill" />
			<view class="album-cover-overlay"></view>

			<!-- 相册信息 -->
			<view class="album-header-content">
				<!-- 公开/私密标签 -->
				<!--     <view class="privacy-tag" :class="{'public': album.is_public, 'private': !album.is_public}">
                    {{ album.is_public ? '公开相册' : '私密相册' }}
                </view>
                -->
				<!-- 相册名称 -->
				<text class="album-title">{{ album.name }}</text>

				<!-- 相册描述 -->
				<text class="album-description" v-if="album.detail">
					{{ album.detail }}
				</text>
				<text class="album-no-description" v-else>
					暂无描述
				</text>

				<!-- 相册统计信息 -->
				<view class="album-stats">
					<!--  <view class="stat-item">
                        <uni-icons type="camera-filled" size="28" color="#fff"></uni-icons>
                        <text class="stat-text">{{ album.photo_count || 0 }} 张照片</text>
                    </view>
                    -->
					<view class="stat-item">
						<uni-icons type="calendar" size="28" color="#fff"></uni-icons>
						<text class="stat-text">{{ formatDate(album.created_at) }}</text>
					</view>

					<view class="stat-item" v-if="album.user && album.user.username">
						<uni-icons type="person" size="28" color="#fff"></uni-icons>
						<text class="stat-text">{{ album.user.username }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作工具栏 -->
		<view class="action-toolbar">
			<view class="action-item" @click="uploadPhotos">
				<uni-icons type="plus" size="32" color="#667eea"></uni-icons>
				<text class="action-text">添加照片</text>
			</view>

			<view class="action-item" @click="editAlbum">
				<uni-icons type="compose" size="32" color="#667eea"></uni-icons>
				<text class="action-text">编辑相册</text>
			</view>

			<view class="action-item" @click="shareAlbum">
				<uni-icons type="redo" size="32" color="#667eea"></uni-icons>
				<text class="action-text">分享</text>
			</view>

			<view class="action-item" @click="showMoreActions">
				<uni-icons type="more-filled" size="32" color="#667eea"></uni-icons>
				<text class="action-text">更多</text>
			</view>
		</view>

		<!-- 照片网格区域 -->
		<view class="photo-section">
			<view class="section-header">
				<text class="section-title">所有照片</text>
				<text class="photo-count">{{ photoList.length }} 张</text>
			</view>

			<view v-if="photoList.length > 0" class="photo-grid">
				<view class="photo-item" v-for="(photo, index) in photoList" :key="photo.id || index"
					@click="previewPhoto(index)">
					<image class="photo-image" :src="photo.image" mode="aspectFill" :lazy-load="true" />

					<!-- 照片信息悬浮层 -->
					<view class="photo-overlay">
						<text class="photo-name" v-if="photo.name">{{ photo.name }}</text>
						<text class="photo-date" v-if="photo.created_at">
							{{ formatPhotoDate(photo.created_at) }}
						</text>
					</view>

					<!-- 选中标记 -->
					<view v-if="selectionMode" class="selection-marker"
						:class="{'selected': selectedPhotos.includes(photo.id)}">
						<uni-icons v-if="selectedPhotos.includes(photo.id)" type="checkmark-filled" size="24"
							color="#fff">
						</uni-icons>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!photoLoading" class="empty-photos">
				<image class="empty-photo-image" src="/static/empty-photo.png" mode="widthFix"></image>
				<text class="empty-photo-title">还没有照片</text>
				<text class="empty-photo-subtitle">点击"添加照片"上传第一张照片</text>
				<button class="upload-button" @click="uploadPhotos">
					上传照片
				</button>
			</view>

			<!-- 加载状态 -->
			<view v-if="photoLoading" class="photo-loading">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 加载更多 -->
			<view v-if="photoList.length > 0 && photoHasMore">
				<uni-load-more :status="photoLoadMoreStatus" @clickLoadMore="loadMorePhotos"></uni-load-more>
			</view>
		</view>

		<!-- 批量操作栏 -->
		<view v-if="selectionMode" class="batch-action-bar">
			<view class="selected-count">
				已选择 {{ selectedPhotos.length }} 张照片
			</view>
			<view class="batch-actions">
				<button class="batch-action-btn delete" @click="deleteSelectedPhotos">
					删除
				</button>
				<button class="batch-action-btn download" @click="downloadSelectedPhotos">
					下载
				</button>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view v-if="!selectionMode" class="bottom-action-bar">
			<button class="select-btn" @click="enterSelectionMode">
				<uni-icons type="checkbox" size="28"></uni-icons>
				<text>选择</text>
			</button>

			<button class="upload-fab" @click="uploadPhotos">+
				<uni-icons type="contact" size="30"></uni-icons>
			</button>
		</view>

		<!-- 加载动画 -->
		<view v-if="loading" class="loading-overlay">
			<uni-load-more status="loading" :icon-size="48"></uni-load-more>
		</view>
	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"

	export default {
		data() {
			return {
				albumId: null,
				album: {},
				photoList: [],
				loading: false,
				photoLoading: false,
				photoPage: 1,
				photoPageSize: 12,
				photoHasMore: true,
				photoLoadMoreStatus: 'more',
				selectionMode: false,
				selectedPhotos: []
			};
		},

		onLoad(options) {
			if (options.id) {
				this.albumId = options.id;
				this.loadAlbumDetail();
				this.loadPhotos();
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'error'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},

		onPullDownRefresh() {
			this.refreshData();
		},

		onReachBottom() {
			if (this.photoHasMore && !this.photoLoading) {
				this.loadMorePhotos();
			}
		},

		methods: {
			async loadAlbumDetail() {
				this.loading = true;
				try {
					const token = uni.getStorageSync('token');
					const result = await request({
						url: `${cfg.base_url}/album/${this.albumId}/`,
						method: 'GET',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						}
					});

					this.album = result;
					console.log("this.album:", this.album)
				} catch (error) {
					console.error('加载相册详情失败:', error);
					uni.showToast({
						title: '加载失败',
						icon: 'error'
					});
				} finally {
					this.loading = false;
				}
			},

			async loadPhotos(isRefresh = false) {
				if (this.photoLoading) return;

				this.photoLoading = true;
				if (isRefresh) {
					this.photoPage = 1;
					this.photoHasMore = true;
				}

				try {
					const token = uni.getStorageSync('token');
					const params = {
						page: this.photoPage,
						page_size: this.photoPageSize,
						// album_id: this.albumId
					};

					const result = await request({
						url: `${cfg.base_url}/album/${this.albumId}/`,
						method: 'GET',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						},
						// data: params
					});
					if (isRefresh) {
						this.photoList = result.photos || result;
					} else {
						this.photoList = [...this.photoList, ...(result.photos || result)];
					}
					console.log("ytwytw", this.photoList)

					this.photoHasMore = result.next !== null && result.next !== undefined;

				} catch (error) {
					console.error('加载照片失败:', error);
				} finally {
					this.photoLoading = false;
					uni.stopPullDownRefresh();
				}
			},

			async refreshData() {
				await Promise.all([
					this.loadAlbumDetail(),
					this.loadPhotos(true)
				]);
				uni.showToast({
					title: '刷新成功',
					icon: 'success'
				});
			},

			async loadMorePhotos() {
				if (!this.photoHasMore || this.photoLoading) return;

				this.photoLoadMoreStatus = 'loading';
				this.photoPage++;

				try {
					await this.loadPhotos();
				} finally {
					this.photoLoadMoreStatus = this.photoHasMore ? 'more' : 'noMore';
				}
			},

			previewPhoto(index) {
				if (this.selectionMode) {
					this.togglePhotoSelection(this.photoList[index].id);
					return;
				}

				const urls = this.photoList.map(photo => photo.image_url);
				uni.previewImage({
					current: index,
					urls: urls,
					indicator: 'number',
					loop: true
				});
			},

			goBack() {
				uni.navigateBack({
					delta: 1,
					animationType: 'slide-out-left'
				});
			},
			uploadPhotos() {
				const that = this; // 保存 this 引用

				uni.chooseImage({
					count: 9,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempFilePaths = res.tempFilePaths;

						uni.showLoading({
							title: '上传中...',
							mask: true
						});

						try {
							const token = uni.getStorageSync('token');
							const albumId = that.albumId; // 使用保存的引用

							// 使用 Promise.allSettled 代替 Promise.all
							const uploadPromises = tempFilePaths.map((filePath, index) => {
								return new Promise((resolve, reject) => {
									uni.uploadFile({
										url: `${cfg.base_url}/album/uploadPhoto/`,
										filePath: filePath,
										name: 'image',
										formData: {
											album_id: albumId, // 使用保存的 albumId
											title: `照片_${index + 1}`,
											// description: '' // 可选
										},
										header: {
											'token': token
										},
										success: (uploadRes) => {
											console.log(`第${index + 1}张上传响应:`,
												uploadRes);

											// 检查 HTTP 状态码
											if (uploadRes.statusCode !== 200 &&
												uploadRes.statusCode !== 201) {
												console.error(
													`上传失败，状态码: ${uploadRes.statusCode}`
												);
												reject(new Error(
													`HTTP ${uploadRes.statusCode}`
												));
												return;
											}

											try {
												const data = JSON.parse(uploadRes
													.data);
												console.log(`第${index + 1}张上传成功:`,
													data);

												if (data.success === false || data
													.error) {
													reject(new Error(data
														.message || data
														.error || '上传失败'));
												} else {
													resolve({
														success: true,
														data: data,
														index: index
													});
												}
											} catch (e) {
												console.error('解析响应失败:', e,
													'原始响应:', uploadRes.data);
												reject(new Error('服务器响应格式错误'));
											}
										},
										fail: (err) => {
											console.error(`第${index + 1}张上传失败:`,
												err);
											reject(err);
										}
									});
								});
							});

							// 等待所有上传完成
							const results = await Promise.allSettled(uploadPromises);
							console.log('所有上传结果:', results);

							// 统计成功和失败的数量
							const successful = results.filter(r =>
								r.status === 'fulfilled' && r.value.success === true
							).length;

							const failed = results.filter(r => r.status === 'rejected').length;

							console.log(`上传统计: 成功 ${successful} 张, 失败 ${failed} 张`);

							// 获取所有成功的数据
							const successfulData = results
								.filter(r => r.status === 'fulfilled' && r.value.success === true)
								.map(r => r.value.data);

							if (successful > 0) {
								uni.showToast({
									title: `成功上传 ${successful} 张照片${failed > 0 ? `，${failed} 张失败` : ''}`,
									icon: 'success',
									duration: 2000
								});

								// 如果有成功的数据，可以先添加到本地列表
								if (successfulData.length > 0 && that.photoList) {
									successfulData.forEach(photo => {
										// 添加到照片列表前面
										if (photo) {
											that.photoList.unshift(photo);
										}
									});
								}

								// 刷新照片列表（从服务器获取最新）
								setTimeout(() => {
									that.loadPhotos(true);
								}, 500);

							} else {
								uni.showToast({
									title: '所有照片上传失败',
									icon: 'error',
									duration: 2000
								});
							}

							// 如果有失败的，可以详细记录
							if (failed > 0) {
								const failures = results.filter(r => r.status === 'rejected');
								console.warn('失败的图片:', failures);
							}

						} catch (error) {
							console.error('上传过程出错:', error);
							uni.showToast({
								title: '上传过程出错',
								icon: 'error',
								duration: 2000
							});
						} finally {
							uni.hideLoading();
						}
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
						uni.showToast({
							title: '选择图片失败',
							icon: 'error'
						});
					}
				});
			},

			editAlbum() {
				uni.showModal({
					title: '编辑相册',
					content: '请输入新的相册名称',
					editable: true,
					placeholderText: this.album.name,
					success: async (res) => {
						if (res.confirm && res.content.trim()) {
							try {
								const token = uni.getStorageSync('token');
								await request({
									url: `${cfg.base_url}/album/${this.albumId}/`,
									method: 'PUT',
									header: {
										'token': `${token}`,
										'Content-Type': 'application/json'
									},
									data: {
										name: res.content.trim(),
										detail: this.album.detail,
										is_public: this.album.is_public
									}
								});

								uni.showToast({
									title: '修改成功',
									icon: 'success'
								});

								this.loadAlbumDetail();

							} catch (error) {
								console.error('修改失败:', error);
								uni.showToast({
									title: '修改失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},

			shareAlbum() {
				uni.showActionSheet({
					itemList: ['分享给好友', '生成分享链接', '保存到相册'],
					success: (res) => {
						if (res.tapIndex === 0) {
							// 分享给好友
							uni.share({
								provider: 'weixin',
								scene: 'WXSceneSession',
								type: 0,
								title: `分享相册：${this.album.name}`,
								summary: this.album.detail || '一起来看我的相册吧',
								href: `https://your-domain.com/share/album/${this.albumId}`,
								success: function(res) {
									console.log("share success");
								},
								fail: function(err) {
									console.log("share fail", err);
								}
							});
						} else if (res.tapIndex === 1) {
							// 生成分享链接
							const shareLink = `https://your-domain.com/share/album/${this.albumId}`;
							uni.setClipboardData({
								data: shareLink,
								success: () => {
									uni.showToast({
										title: '链接已复制',
										icon: 'success'
									});
								}
							});
						}
					}
				});
			},

			showMoreActions() {
				uni.showActionSheet({
					itemList: ['设为封面', '导出相册', '删除相册'],
					success: async (res) => {
						if (res.tapIndex === 0) {
							// 设为封面逻辑
							this.setCoverPhoto();
						} else if (res.tapIndex === 2) {
							// 删除相册
							this.deleteAlbum();
						}
					}
				});
			},

			enterSelectionMode() {
				this.selectionMode = true;
				this.selectedPhotos = [];
			},

			exitSelectionMode() {
				this.selectionMode = false;
				this.selectedPhotos = [];
			},

			togglePhotoSelection(photoId) {
				const index = this.selectedPhotos.indexOf(photoId);
				if (index > -1) {
					this.selectedPhotos.splice(index, 1);
				} else {
					this.selectedPhotos.push(photoId);
				}

				// 如果没有选中任何照片，退出选择模式
				if (this.selectedPhotos.length === 0) {
					this.exitSelectionMode();
				}
			},

			async deleteSelectedPhotos() {
				if (this.selectedPhotos.length === 0) return;

				uni.showModal({
					title: '确认删除',
					content: `确定要删除选中的 ${this.selectedPhotos.length} 张照片吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...',
								mask: true
							});

							try {
								const token = uni.getStorageSync('token');
								const deletePromises = this.selectedPhotos.map(photoId =>
									request({
										url: `${cfg.base_url}/album/photos/${photoId}/`,
										method: 'DELETE',
										header: {
											'token': token
										}
									})
								);

								await Promise.all(deletePromises);

								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});

								// 刷新照片列表并退出选择模式
								this.loadPhotos(true);
								this.exitSelectionMode();

							} catch (error) {
								console.error('删除失败:', error);
								uni.showToast({
									title: '删除失败',
									icon: 'error'
								});
							} finally {
								uni.hideLoading();
							}
						}
					}
				});
			},

			downloadSelectedPhotos() {
				if (this.selectedPhotos.length === 0) return;

				uni.showModal({
					title: '下载照片',
					content: `确定要下载选中的 ${this.selectedPhotos.length} 张照片到本地吗？`,
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '下载中...'
							});

							// 这里可以实现批量下载逻辑
							// 由于微信小程序限制，可能需要一张张下载

							setTimeout(() => {
								uni.hideLoading();
								uni.showToast({
									title: '下载完成',
									icon: 'success'
								});
							}, 2000);
						}
					}
				});
			},

			async deleteAlbum() {
				uni.showModal({
					title: '删除相册',
					content: '确定要删除这个相册吗？删除后所有照片将丢失。',
					success: async (res) => {
						if (res.confirm) {
							try {
								const token = uni.getStorageSync('token');
								await request({
									url: `${cfg.base_url}/album/${this.albumId}/`,
									method: 'DELETE',
									header: {
										'token': token
									}
								});

								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});

								setTimeout(() => {
									uni.navigateBack();
								}, 1500);

							} catch (error) {
								console.error('删除失败:', error);
								uni.showToast({
									title: '删除失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},

			formatDate(dateString) {
				if (!dateString) return '';

				const date = new Date(dateString);
				const now = new Date();
				const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

				if (diffDays === 0) return '今天创建';
				if (diffDays === 1) return '昨天创建';
				if (diffDays < 7) return `${diffDays}天前创建`;
				if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前创建`;

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');

				if (year === now.getFullYear()) {
					return `${month}月${day}日创建`;
				}

				return `${year}年${month}月${day}日创建`;
			},

			formatPhotoDate(dateString) {
				if (!dateString) return '';

				const date = new Date(dateString);
				const month = date.getMonth() + 1;
				const day = date.getDate();

				return `${month}月${day}日`;
			},

			setCoverPhoto() {
				// 实现设置封面照片的逻辑
				uni.showToast({
					title: '请选择一张照片作为封面',
					icon: 'none'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.album-detail-container {
		min-height: 100vh;
		background: #f5f7fa;
		position: relative;
	}

	.nav-back {
		position: fixed;
		top: 80rpx;
		left: 32rpx;
		width: 72rpx;
		height: 72rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(10rpx);
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

		&:active {
			background: rgba(255, 255, 255, 1);
		}
	}

	.album-header {
		position: relative;
		height: 480rpx;
		padding: 120rpx 40rpx 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		&.with-cover {
			color: white;
		}

		&:not(.with-cover) {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
		}
	}

	.album-cover-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.album-cover-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%);
	}

	.album-header-content {
		position: relative;
		z-index: 2;
	}

	.privacy-tag {
		align-self: flex-start;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: 600;
		margin-bottom: 24rpx;
		backdrop-filter: blur(10rpx);

		&.public {
			background: rgba(76, 175, 80, 0.8);
			border: 1rpx solid rgba(255, 255, 255, 0.3);
		}

		&.private {
			background: rgba(244, 67, 54, 0.8);
			border: 1rpx solid rgba(255, 255, 255, 0.3);
		}
	}

	.album-title {
		font-size: 48rpx;
		font-weight: 800;
		line-height: 1.3;
		margin-bottom: 16rpx;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.album-description {
		font-size: 28rpx;
		line-height: 1.6;
		opacity: 0.95;
		margin-bottom: 32rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.album-no-description {
		font-size: 28rpx;
		opacity: 0.7;
		font-style: italic;
		margin-bottom: 32rpx;
	}

	.album-stats {
		display: flex;
		gap: 32rpx;
		flex-wrap: wrap;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		backdrop-filter: blur(10rpx);
	}

	.stat-text {
		font-size: 24rpx;
		font-weight: 500;
	}

	.action-toolbar {
		background: white;
		border-radius: 24rpx 24rpx 0 0;
		margin-top: -24rpx;
		padding: 32rpx;
		display: flex;
		justify-content: space-around;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;

		&:active {
			opacity: 0.6;
		}
	}

	.action-text {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
	}

	.photo-section {
		padding: 32rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #333;
	}

	.photo-count {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8rpx;
	}

	.photo-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 16rpx;
		overflow: hidden;
		background: #f0f0f0;

		&:active {
			opacity: 0.9;
		}
	}

	.photo-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;

		.photo-item:active & {
			transform: scale(1.05);
		}
	}

	.photo-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
		padding: 24rpx 16rpx 16rpx;
		opacity: 0;
		transition: opacity 0.3s ease;

		.photo-item:active & {
			opacity: 1;
		}
	}

	.photo-name {
		display: block;
		font-size: 22rpx;
		color: white;
		font-weight: 500;
		margin-bottom: 4rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.photo-date {
		display: block;
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.selection-marker {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		border: 2rpx solid white;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);

		&.selected {
			background: #667eea;
			border-color: #667eea;
		}
	}

	.empty-photos {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 40rpx;

		.empty-photo-image {
			width: 280rpx;
			height: 280rpx;
			opacity: 0.5;
		}

		.empty-photo-title {
			font-size: 32rpx;
			color: #666;
			margin-top: 32rpx;
			font-weight: 600;
		}

		.empty-photo-subtitle {
			font-size: 26rpx;
			color: #999;
			margin-top: 16rpx;
			text-align: center;
		}

		.upload-button {
			margin-top: 48rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border-radius: 50rpx;
			padding: 20rpx 40rpx;
			font-size: 28rpx;
			font-weight: 600;
			border: none;

			&:active {
				opacity: 0.9;
			}
		}
	}

	.photo-loading {
		display: flex;
		justify-content: center;
		padding: 80rpx 0;
	}

	.batch-action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 24rpx 32rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.selected-count {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
	}

	.batch-actions {
		display: flex;
		gap: 16rpx;
	}

	.batch-action-btn {
		padding: 16rpx 32rpx;
		border-radius: 50rpx;
		font-size: 26rpx;
		font-weight: 600;
		border: none;

		&.delete {
			background: #ff4444;
			color: white;
		}

		&.download {
			background: #667eea;
			color: white;
		}

		&:active {
			opacity: 0.9;
		}
	}

	.bottom-action-bar {
		position: fixed;
		bottom: 40rpx;
		right: 40rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		z-index: 1000;
	}

	.select-btn {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10rpx);
		border-radius: 50rpx;
		padding: 16rpx 32rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		border: none;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

		&:active {
			background: white;
		}
	}

	.upload-fab {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.4);

		&:active {
			transform: scale(0.95);
		}
	}

	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	/* 暗色模式适配 */
	@media (prefers-color-scheme: dark) {
		.album-detail-container {
			background: #1a1a2e;
		}

		.nav-back {
			background: rgba(45, 55, 72, 0.9);
		}

		.action-toolbar {
			background: #2d3748;
		}

		.action-text {
			color: #a0aec0;
		}

		.photo-section {
			background: transparent;
		}

		.section-title {
			color: #e2e8f0;
		}

		.photo-count {
			color: #a0aec0;
		}

		.photo-item {
			background: #4a5568;
		}

		.batch-action-bar {
			background: #2d3748;
		}

		.selected-count {
			color: #e2e8f0;
		}

		.select-btn {
			background: rgba(45, 55, 72, 0.9);
			color: #e2e8f0;
		}
	}

	/* 响应式调整 */
	@media (max-width: 750rpx) {
		.photo-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 6rpx;
		}

		.album-header {
			height: 440rpx;
			padding: 100rpx 32rpx 32rpx;
		}

		.album-title {
			font-size: 42rpx;
		}
	}

	@media (min-width: 751rpx) {
		.photo-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 12rpx;
		}

		.album-header {
			height: 520rpx;
		}

		.album-title {
			font-size: 56rpx;
		}
	}
</style>