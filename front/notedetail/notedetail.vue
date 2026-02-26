<template>
	<view class="note-detail-container">
		<!-- 自定义导航栏 -->
		<view class="detail-nav">
			<view class="nav-left" @click="goBack">
				<uni-icons type="arrowleft" size="24" color="#333"></uni-icons>
			</view>
			<view class="nav-title">{{ note.title || '笔记详情' }}</view>
			<view class="nav-right">
				<view class="nav-action" @click="showShare">
					<uni-icons type="redo" size="22" color="#333"></uni-icons>
				</view>
				<view class="nav-action" @click="showMenu">
					<uni-icons type="more" size="22" color="#333"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 主要内容区域 -->
		<scroll-view 
			class="detail-scroll" 
			scroll-y 
			:style="{height: scrollHeight + 'px'}"
			@scroll="handleScroll"
		>
			<!-- 封面图 -->
			<view class="detail-cover" v-if="note.cover_image">
				<image :src="note.cover_image" mode="aspectFill" class="cover-image"></image>
				<view class="cover-gradient"></view>
			</view>
			
			<!-- 标题区域 -->
			<view class="detail-header" :class="{ 'has-cover': note.cover_image }">
				<view class="privacy-tag" :class="{ 'private': !note.is_public }">
					{{ note.is_public ? '公开' : '私密' }}
				</view>
				<h1 class="detail-title">{{ note.title }}</h1>
				
				<!-- 作者信息 -->
				<view class="author-section">
					<image :src="note.user?.avatar || '/static/default-avatar.png'" class="author-avatar"></image>
					<view class="author-info">
						<text class="author-name">{{ note.user?.username }}</text>
						<text class="publish-time">{{ formatDate(note.created_at) }}</text>
					</view>
					
					<view class="action-buttons">
						<button class="action-btn" :class="{ active: isLiked }" @click="toggleLike">
							<uni-icons :type="isLiked ? 'heart-filled' : 'heart'" size="20" :color="isLiked ? '#ff6b6b' : '#999'"></uni-icons>
							<text>{{ note.like_count }}</text>
						</button>
						<button class="action-btn" @click="scrollToComment">
							<uni-icons type="chat" size="20" color="#999"></uni-icons>
							<text>{{ note.comment_count }}</text>
						</button>
					</view>
				</view>
				
				<!-- 分类和标签 -->
				<view class="meta-section" v-if="note.category || (note.tags && note.tags.length)">
					<view class="category-tag" v-if="note.category">
						<uni-icons type="folder" size="16" color="#667eea"></uni-icons>
						<text>{{ note.category.name }}</text>
					</view>
					
					<view class="tags-list" v-if="note.tags && note.tags.length">
						<view 
							class="tag-item" 
							v-for="tag in note.tags" 
							:key="tag.id"
							:style="{ backgroundColor: tag.color + '20', color: tag.color }"
						>
							{{ tag.name }}
						</view>
					</view>
				</view>
			</view>
			
			<!-- 笔记内容（富文本） -->
			<view class="detail-content" v-if="note.content">
				<rich-text :nodes="note.content" class="rich-content"></rich-text>
			</view>
			<view class="empty-content" v-else>
				暂无内容
			</view>
			
			<!-- 阅读统计 -->
			<view class="stats-section">
				<view class="stat-item">
					<uni-icons type="eye" size="18" color="#999"></uni-icons>
					<text>{{ note.view_count }} 次阅读</text>
				</view>
				<view class="stat-item">
					<uni-icons type="calendar" size="18" color="#999"></uni-icons>
					<text>最后更新 {{ formatTime(note.updated_at) }}</text>
				</view>
			</view>
			
			<!-- 评论区域 -->
			<view class="comment-section" v-if="note.allow_comment">
				<view class="comment-header">
					<text class="comment-title">评论 ({{ note.comment_count }})</text>
					<text class="write-comment" @click="showCommentInput = true">写评论</text>
				</view>
				
				<!-- 评论列表 -->
				<view class="comments-list" v-if="comments.length > 0">
					<view class="comment-item" v-for="comment in comments" :key="comment.id">
						<image :src="comment.user?.avatar || '/static/default-avatar.png'" class="comment-avatar"></image>
						<view class="comment-content">
							<view class="comment-header">
								<text class="comment-user">{{ comment.user?.username }}</text>
								<text class="comment-time">{{ formatTime(comment.created_at) }}</text>
							</view>
							<text class="comment-text">{{ comment.content }}</text>
							
							<!-- 回复列表 -->
							<view class="replies-list" v-if="comment.replies && comment.replies.length">
								<view class="reply-item" v-for="reply in comment.replies" :key="reply.id">
									<text class="reply-user">{{ reply.user?.username }}</text>
									<text class="reply-text">{{ reply.content }}</text>
								</view>
							</view>
							
							<!-- 回复按钮 -->
							<view class="comment-actions">
								<text class="reply-btn" @click="replyTo(comment)">回复</text>
							</view>
						</view>
					</view>
				</view>
				<view class="no-comment" v-else>
					<uni-icons type="chat" size="40" color="#ddd"></uni-icons>
					<text>暂无评论，来说两句吧~</text>
				</view>
			</view>
			
			<!-- 底部安全区域 -->
			<view class="bottom-safe"></view>
		</scroll-view>
		
		<!-- 评论输入框弹窗 -->
		<uni-popup ref="commentPopup" type="bottom" :safe-area="false">
			<view class="comment-popup">
				<view class="popup-header">
					<text class="popup-title">{{ replyToUser ? '回复 ' + replyToUser : '写评论' }}</text>
					<text class="popup-close" @click="closeCommentPopup">取消</text>
				</view>
				<textarea 
					v-model="commentText" 
					class="comment-textarea" 
					:placeholder="replyToUser ? '写下你的回复...' : '写下你的评论...'"
					maxlength="500"
					auto-height
				/>
				<view class="popup-footer">
					<text class="word-count">{{ commentText.length }}/500</text>
					<button 
						class="submit-btn" 
						:disabled="!commentText.trim()"
						:class="{ disabled: !commentText.trim() }"
						@click="submitComment"
					>
						发布
					</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 菜单弹窗 -->
		<uni-popup ref="menuPopup" type="bottom">
			<view class="menu-popup">
				<view class="menu-item" v-if="isAuthor" @click="editNote">
					<uni-icons type="compose" size="20" color="#333"></uni-icons>
					<text>编辑笔记</text>
				</view>
				<view class="menu-item" v-if="!isAuthor" @click="reportNote">
					<uni-icons type="flag" size="20" color="#333"></uni-icons>
					<text>举报</text>
				</view>
				<view class="menu-item" @click="copyLink">
					<uni-icons type="link" size="20" color="#333"></uni-icons>
					<text>复制链接</text>
				</view>
				<view class="menu-item" v-if="isAuthor" @click="deleteNote">
					<uni-icons type="trash" size="20" color="#f56c6c"></uni-icons>
					<text style="color: #f56c6c;">删除笔记</text>
				</view>
				<view class="menu-cancel" @click="closeMenu">取消</view>
			</view>
		</uni-popup>
		
		<!-- 返回顶部按钮 -->
		<view class="back-to-top" v-if="showBackToTop" @click="scrollToTop">
			<uni-icons type="arrowup" size="24" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"
	
	export default {
		data() {
			return {
				noteId: null,
				note: {},
				comments: [],
				loading: true,
				scrollHeight: 0,
				showBackToTop: false,
				isLiked: false,
				isAuthor: false,
				
				// 评论相关
				commentText: '',
				replyToUser: null,
				replyToId: null,
				showCommentInput: false
			}
		},
		
		onLoad(options) {
			this.noteId = options.id
			this.calcScrollHeight()
			this.loadNoteDetail()
			this.loadComments()
		},
		
		methods: {
			calcScrollHeight() {
				const systemInfo = uni.getSystemInfoSync()
				this.scrollHeight = systemInfo.windowHeight
			},
			
			async loadNoteDetail() {
				try {
					const token = uni.getStorageSync('token')
					const res = await request({
						url: `${cfg.base_url}/notes/notes/${this.noteId}/`,
						method: 'GET',
						header: { 'token': token }
					})
					this.note = res
					
					// 判断是否为作者
					const currentUser = uni.getStorageSync('userInfo')
					this.isAuthor = currentUser && currentUser.id === res.user?.id
					
					// 设置导航栏标题
					uni.setNavigationBarTitle({
						title: res.title
					})
				} catch (err) {
					console.error('加载笔记失败', err)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},
			
			async loadComments() {
				try {
					const token = uni.getStorageSync('token')
					const res = await request({
						url: `${cfg.base_url}/notes/comments/?note=${this.noteId}`,
						method: 'GET',
						header: { 'token': token }
					})
					this.comments = res.results || res
				} catch (err) {
					console.error('加载评论失败', err)
				}
			},
			
			handleScroll(e) {
				const scrollTop = e.detail.scrollTop
				this.showBackToTop = scrollTop > 500
			},
			
			scrollToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				})
			},
			
			goBack() {
				uni.navigateBack()
			},
			
			async toggleLike() {
				if (!uni.getStorageSync('token')) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
					return
				}
				
				try {
					const token = uni.getStorageSync('token')
					await request({
						url: `${cfg.base_url}/notes/notes/${this.noteId}/like/`,
						method: 'POST',
						header: { 'token': token }
					})
					
					this.isLiked = !this.isLiked
					this.note.like_count += this.isLiked ? 1 : -1
				} catch (err) {
					console.error('操作失败', err)
				}
			},
			
			showShare() {
				uni.showShareMenu({
					withShareTicket: true
				})
			},
			
			showMenu() {
				this.$refs.menuPopup.open()
			},
			
			closeMenu() {
				this.$refs.menuPopup.close()
			},
			
			editNote() {
				this.closeMenu()
				uni.navigateTo({
					url: `/pages/notes/edit?id=${this.noteId}`
				})
			},
			
			async deleteNote() {
				uni.showModal({
					title: '提示',
					content: '确定要删除这篇笔记吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const token = uni.getStorageSync('token')
								await request({
									url: `${cfg.base_url}/notes/notes/${this.noteId}/`,
									method: 'DELETE',
									header: { 'token': token }
								})
								
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								
								setTimeout(() => {
									uni.navigateBack()
								}, 1500)
							} catch (err) {
								console.error('删除失败', err)
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			
			copyLink() {
				uni.setClipboardData({
					data: window.location.href,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'success'
						})
					}
				})
			},
			
			reportNote() {
				uni.showToast({
					title: '已提交举报',
					icon: 'none'
				})
			},
			
			scrollToComment() {
				// 滚动到评论区域
			},
			
			replyTo(comment) {
				this.replyToUser = comment.user.username
				this.replyToId = comment.id
				this.showCommentInput = true
				this.$refs.commentPopup.open()
			},
			
			closeCommentPopup() {
				this.$refs.commentPopup.close()
				this.commentText = ''
				this.replyToUser = null
				this.replyToId = null
			},
			
			async submitComment() {
				if (!this.commentText.trim()) return
				
				try {
					const token = uni.getStorageSync('token')
					const data = {
						note: this.noteId,
						content: this.commentText
					}
					
					if (this.replyToId) {
						data.parent = this.replyToId
					}
					
					await request({
						url: `${cfg.base_url}/notes/comments/`,
						method: 'POST',
						header: { 'token': token },
						data: data
					})
					
					uni.showToast({
						title: '发布成功',
						icon: 'success'
					})
					
					this.closeCommentPopup()
					this.loadComments()
					this.note.comment_count++
					
				} catch (err) {
					console.error('评论失败', err)
					uni.showToast({
						title: '发布失败',
						icon: 'none'
					})
				}
			},
			
			formatDate(dateStr) {
				if (!dateStr) return ''
				const date = new Date(dateStr)
				return date.toLocaleDateString('zh-CN', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			},
			
			formatTime(dateStr) {
				const date = new Date(dateStr)
				const now = new Date()
				const diff = now - date
				
				const minute = 60 * 1000
				const hour = minute * 60
				const day = hour * 24
				
				if (diff < minute) {
					return '刚刚'
				} else if (diff < hour) {
					return Math.floor(diff / minute) + '分钟前'
				} else if (diff < day) {
					return Math.floor(diff / hour) + '小时前'
				} else {
					return this.formatDate(dateStr)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.note-detail-container {
	min-height: 100vh;
	background: #fff;
	position: relative;
}

.detail-nav {
	height: 44px;
	background: white;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	
	.nav-left {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 16px;
		font-weight: 500;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.nav-right {
		display: flex;
		gap: 12px;
		
		.nav-action {
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 20px;
			
			&:active {
				background: #f5f5f5;
			}
		}
	}
}

.detail-scroll {
	margin-top: 44px;
}

.detail-cover {
	position: relative;
	height: 300px;
	
	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.cover-gradient {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100px;
		background: linear-gradient(0deg, white 0%, transparent 100%);
	}
}

.detail-header {
	padding: 24px 20px 16px;
	background: white;
	
	&.has-cover {
		margin-top: -40px;
		border-radius: 20px 20px 0 0;
		position: relative;
		z-index: 10;
	}
	
	.privacy-tag {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		background: rgba(76, 175, 80, 0.1);
		color: #4CAF50;
		margin-bottom: 12px;
		
		&.private {
			background: rgba(244, 67, 54, 0.1);
			color: #f44336;
		}
	}
	
	.detail-title {
		font-size: 28px;
		font-weight: 700;
		color: #333;
		line-height: 1.4;
		margin-bottom: 20px;
	}
	
	.author-section {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		
		.author-avatar {
			width: 48px;
			height: 48px;
			border-radius: 24px;
			margin-right: 12px;
		}
		
		.author-info {
			flex: 1;
			
			.author-name {
				font-size: 16px;
				font-weight: 500;
				color: #333;
				display: block;
				margin-bottom: 4px;
			}
			
			.publish-time {
				font-size: 13px;
				color: #999;
			}
		}
		
		.action-buttons {
			display: flex;
			gap: 12px;
			
			.action-btn {
				display: flex;
				align-items: center;
				gap: 4px;
				padding: 8px 16px;
				border-radius: 20px;
				background: #f5f5f5;
				border: none;
				font-size: 14px;
				color: #666;
				
				&.active {
					background: rgba(255, 107, 107, 0.1);
					color: #ff6b6b;
				}
				
				&:active {
					opacity: 0.8;
				}
			}
		}
	}
	
	.meta-section {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid #f5f5f5;
		
		.category-tag {
			display: flex;
			align-items: center;
			gap: 4px;
			padding: 6px 16px;
			border-radius: 20px;
			background: #f5f5f5;
			font-size: 13px;
			color: #666;
		}
		
		.tags-list {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			
			.tag-item {
				padding: 4px 12px;
				border-radius: 16px;
				font-size: 12px;
			}
		}
	}
}

.detail-content {
	padding: 20px;
	min-height: 200px;
	font-size: 16px;
	line-height: 1.8;
	color: #333;
	
	.rich-content {
		::v-deep img {
			max-width: 100%;
			height: auto;
			border-radius: 8px;
			margin: 16px 0;
		}
		
		::v-deep h1, ::v-deep h2, ::v-deep h3 {
			margin: 24px 0 16px;
			font-weight: 600;
		}
		
		::v-deep p {
			margin-bottom: 16px;
		}
		
		::v-deep blockquote {
			margin: 16px 0;
			padding: 16px 20px;
			background: #f9f9f9;
			border-left: 4px solid #667eea;
			border-radius: 4px;
			font-style: italic;
			color: #666;
		}
		
		::v-deep code {
			background: #f5f5f5;
			padding: 2px 6px;
			border-radius: 4px;
			font-family: monospace;
			font-size: 14px;
		}
		
		::v-deep pre {
			background: #282c34;
			color: #abb2bf;
			padding: 16px;
			border-radius: 8px;
			overflow-x: auto;
			margin: 16px 0;
			
			code {
				background: transparent;
				color: inherit;
				padding: 0;
			}
		}
	}
}

.empty-content {
	padding: 60px 20px;
	text-align: center;
	color: #999;
	font-size: 14px;
}

.stats-section {
	display: flex;
	gap: 24px;
	padding: 16px 20px;
	background: #f9f9f9;
	margin: 0 20px 20px;
	border-radius: 12px;
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: #666;
	}
}

.comment-section {
	padding: 0 20px 20px;
	
	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		
		.comment-title {
			font-size: 18px;
			font-weight: 600;
			color: #333;
		}
		
		.write-comment {
			color: #667eea;
			font-size: 14px;
			
			&:active {
				opacity: 0.8;
			}
		}
	}
	
	.comment-item {
		display: flex;
		gap: 12px;
		margin-bottom: 20px;
		
		.comment-avatar {
			width: 36px;
			height: 36px;
			border-radius: 18px;
			flex-shrink: 0;
		}
		
		.comment-content {
			flex: 1;
			
			.comment-header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 4px;
				
				.comment-user {
					font-size: 14px;
					font-weight: 500;
					color: #333;
				}
				
				.comment-time {
					font-size: 12px;
					color: #999;
				}
			}
			
			.comment-text {
				font-size: 14px;
				color: #333;
				line-height: 1.5;
				margin-bottom: 8px;
			}
			
			.comment-actions {
				.reply-btn {
					font-size: 12px;
					color: #999;
					
					&:active {
						color: #667eea;
					}
				}
			}
			
			.replies-list {
				margin-top: 12px;
				padding-left: 12px;
				border-left: 2px solid #f0f0f0;
				
				.reply-item {
					margin-bottom: 8px;
					
					.reply-user {
						font-size: 13px;
						font-weight: 500;
						color: #667eea;
						margin-right: 8px;
					}
					
					.reply-text {
						font-size: 13px;
						color: #666;
					}
				}
			}
		}
	}
	
	.no-comment {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0;
		color: #999;
		font-size: 14px;
		gap: 12px;
	}
}

.bottom-safe {
	height: env(safe-area-inset-bottom);
}

// 评论弹窗
.comment-popup {
	background: white;
	border-radius: 20px 20px 0 0;
	padding: 20px;
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		
		.popup-title {
			font-size: 16px;
			font-weight: 600;
			color: #333;
		}
		
		.popup-close {
			color: #999;
			font-size: 14px;
			
			&:active {
				color: #333;
			}
		}
	}
	
	.comment-textarea {
		width: 100%;
		min-height: 100px;
		padding: 12px;
		background: #f5f5f5;
		border-radius: 12px;
		font-size: 14px;
		color: #333;
		margin-bottom: 12px;
	}
	
	.popup-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.word-count {
			font-size: 12px;
			color: #999;
		}
		
		.submit-btn {
			height: 40px;
			padding: 0 24px;
			border-radius: 20px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			font-size: 14px;
			border: none;
			
			&.disabled {
				opacity: 0.5;
			}
			
			&:not(.disabled):active {
				opacity: 0.9;
			}
		}
	}
}

// 菜单弹窗
.menu-popup {
	background: white;
	border-radius: 20px 20px 0 0;
	overflow: hidden;
	
	.menu-item {
		height: 50px;
		padding: 0 20px;
		display: flex;
		align-items: center;
		gap: 12px;
		border-bottom: 1px solid #f5f5f5;
		font-size: 16px;
		color: #333;
		
		&:active {
			background: #f5f5f5;
		}
	}
	
	.menu-cancel {
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		color: #999;
		
		&:active {
			background: #f5f5f5;
		}
	}
}

// 返回顶部按钮
.back-to-top {
	position: fixed;
	bottom: 100px;
	right: 20px;
	width: 44px;
	height: 44px;
	border-radius: 22px;
	background: rgba(102, 126, 234, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 99;
	box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
	
	&:active {
		transform: scale(0.95);
	}
}
</style>