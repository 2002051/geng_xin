<template>
	<view class="album-detail-container">
		<!-- 返回按钮 -->
		<view class="nav-back" @click="goBack">
			<uni-icons type="arrowleft" size="32" color="#333"></uni-icons>
		</view>

		<!-- 相册头部信息 -->
		<view class="album-header" :class="{'with-cover': album.cover_photo}">
			<!-- 封面背景图 -->
			<image v-if="album.cover_photo" class="album-cover-background" :src="album.cover_photo" mode="aspectFill" />
			<view class="album-cover-overlay"></view>

			<!-- 相册信息 -->
			<view class="album-header-content">
				<!-- 公开/私密标签（大标签，暂时隐藏） -->
				<!--
				<view class="privacy-tag" :class="{'public': album.is_public, 'private': !album.is_public}">
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
					<view class="stat-item">
						<uni-icons type="calendar" size="28" color="#fff"></uni-icons>
						<text class="stat-text">{{ formatDate(album.created_at) }}</text>
					</view>

					<view class="stat-item album-owner" v-if="album.user">
						<uni-icons type="person" size="28" color="#fff"></uni-icons>
						<text class="stat-text">{{ album.user.username || '未知用户' }}</text>
						<!-- 在用户信息旁边添加公开/私密图标 -->
						<view class="privacy-badge" :class="{'public': album.is_public, 'private': !album.is_public}"
							@click="showPrivacyInfo">
							<uni-icons :type="album.is_public ? 'eye' : 'eye-slash'" size="16" color="#fff"></uni-icons>
						</view>
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

			<view class="action-item" @click="showEditForm = true">
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
				<uni-icons type="checkbox" size="28" color="#333"></uni-icons>
				<text class="select-text">选择</text>
			</button>

			<button class="upload-fab" @click="uploadPhotos">
				<uni-icons type="plusempty" size="40" color="#fff"></uni-icons>
			</button>
		</view>

		<!-- 编辑相册弹窗 -->
		<view v-if="showEditForm" class="edit-album-modal">
			<view class="modal-mask" @click="closeEditForm"></view>
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">编辑相册</text>
					<uni-icons type="close" size="32" color="#999" @click="closeEditForm"></uni-icons>
				</view>

				<view class="modal-body">
					<view class="form-item">
						<text class="form-label">相册名称</text>
						<input class="form-input" type="text" placeholder="请输入相册名称" v-model="editForm.name"
							maxlength="100" />
						<text class="char-count">{{ editForm.name.length }}/100</text>
					</view>

					<view class="form-item">
						<text class="form-label">相册描述</text>
						<textarea class="form-textarea" placeholder="请输入相册描述" v-model="editForm.detail"
							maxlength="200"></textarea>
						<text class="char-count">{{ editForm.detail.length }}/200</text>
					</view>

					<view class="form-item">
						<text class="form-label">封面图片</text>
						<view class="cover-upload-area" @click="selectCoverImage">
							<view v-if="tempCoverPath || album.cover_photo" class="cover-preview">
								<image class="cover-image" :src="tempCoverPath || album.cover_photo" mode="aspectFill">
								</image>
								<view class="cover-overlay">
									<text class="cover-change-text">点击更换</text>
								</view>
							</view>
							<view v-else class="cover-empty">
								<uni-icons type="image" size="48" color="#ccc"></uni-icons>
								<text class="empty-text">选择封面图片</text>
								<text class="empty-tip">支持 JPG/PNG 格式</text>
							</view>
						</view>
					</view>

					<view class="form-item">
						<text class="form-label">访问权限</text>
						<view class="privacy-switch">
							<view class="switch-label">
								<text>设为公开相册</text>
								<text class="switch-description">其他用户可以看到这个相册</text>
							</view>
							<switch :checked="editForm.is_public" @change="onPrivacyChange" color="#667eea" />
						</view>
					</view>
				</view>

				<view class="modal-footer">
					<button class="modal-btn cancel" @click="closeEditForm">取消</button>
					<button class="modal-btn confirm" @click="saveAlbumEdit" :disabled="saving">
						{{ saving ? '保存中...' : '保存' }}
					</button>
				</view>
			</view>
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
	// 导入SCSS样式文件
	import './album-detail.scss'

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
				selectedPhotos: [],
				// 编辑相关数据
				showEditForm: false, // 控制编辑表单显示
				editForm: {
					name: '',
					detail: '',
					is_public: true
				},
				tempCoverPath: null,
				saving: false
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
					// 初始化编辑表单
					this.editForm = {
						name: result.name || '',
						detail: result.detail || '',
						is_public: result.is_public !== undefined ? result.is_public : true
					};
					console.log("相册详情:", this.album)
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
					const result = await request({
						url: `${cfg.base_url}/album/${this.albumId}/`,
						method: 'GET',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (isRefresh) {
						this.photoList = result.photos || result;
					} else {
						this.photoList = [...this.photoList, ...(result.photos || result)];
					}

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

			// 显示隐私信息提示
			showPrivacyInfo() {
				const privacyType = this.album.is_public ? '公开' : '私密';
				const description = this.album.is_public ? 
					'其他用户可以查看此相册' : 
					'只有您自己可以查看此相册';
				
				uni.showToast({
					title: `${privacyType}相册`,
					icon: 'none',
					duration: 2000
				});
			},

			// 关闭编辑表单
			closeEditForm() {
				this.showEditForm = false;
				// 重置表单
				this.editForm = {
					name: this.album.name || '',
					detail: this.album.detail || '',
					is_public: this.album.is_public !== undefined ? this.album.is_public : true
				};
				this.tempCoverPath = null;
			},

			// 隐私设置变化
			onPrivacyChange(e) {
				this.editForm.is_public = e.detail.value;
			},

			// 选择封面图片
			selectCoverImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: (res) => {
						this.tempCoverPath = res.tempFilePaths[0];
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
					}
				});
			},

			// 保存相册编辑
			async saveAlbumEdit() {
				if (!this.editForm.name.trim()) {
					uni.showToast({
						title: '请输入相册名称',
						icon: 'none'
					});
					return;
				}

				this.saving = true;

				try {
					const updateData = {
						name: this.editForm.name.trim(),
						detail: this.editForm.detail.trim(),
						is_public: this.editForm.is_public
					};

					// 如果有新封面图片，先上传
					if (this.tempCoverPath) {
						uni.showLoading({
							title: '上传封面中...',
							mask: true
						});

						try {
							const token = uni.getStorageSync('token');
							const uploadResult = await uni.uploadFile({
								url: `${cfg.base_url}/album/upload/cover/`,
								filePath: this.tempCoverPath,
								name: 'cover_photo',
								header: {
									'token': token
								}
							});

							if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
								const data = JSON.parse(uploadResult.data);
								// 这里保存图片路径，而不是完整的 URL
								updateData.cover_photo = data.image_path;
							}
						} catch (error) {
							console.error('封面上传失败:', error);
							uni.showToast({
								title: '封面上传失败',
								icon: 'error'
							});
						} finally {
							uni.hideLoading();
						}
					}
					// 注意：如果没有选择新封面图片，就不发送 cover_photo 字段
					// 这样后端会保持原有的封面图片不变

					// 更新相册信息
					const token = uni.getStorageSync('token');
					await request({
						url: `${cfg.base_url}/album/${this.albumId}/`,
						method: 'PUT',
						header: {
							'token': `${token}`,
							'Content-Type': 'application/json'
						},
						data: updateData
					});

					uni.showToast({
						title: '修改成功',
						icon: 'success'
					});

					// 关闭弹窗并刷新数据
					this.closeEditForm();
					this.loadAlbumDetail();

				} catch (error) {
					console.error('保存失败:', error);
					uni.showToast({
						title: '保存失败',
						icon: 'error'
					});
				} finally {
					this.saving = false;
				}
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

								// 删除成功后返回首页
								setTimeout(() => {
									// 跳转到首页
									uni.switchTab({
										url: '/pages/index/index',
										success: () => {
											console.log('成功跳转到首页');
										},
										fail: (err) => {
											console.error('跳转失败:', err);
											// 如果跳转失败，返回上一页
											uni.navigateBack();
										}
									});
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
	/* 这里已经导入了外部SCSS文件，所以只需要保留必要的样式 */
	/* 如果需要额外的样式，可以在这里添加 */
</style>