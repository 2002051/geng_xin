<template>
	<view class="note-list">
		<!-- 自定义导航栏 (增加顶部安全区适配) -->
		<view class="nav-bar">
			<view class="status-bar" v-if="statusBarHeight > 0" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-content">
				<view class="nav-left">
					<text class="nav-title">📝 我的笔记</text>
				</view>
				<view class="nav-right">
					<view class="nav-icon" @click="toggleSearch" :class="{ active: showSearch }">
						<uni-icons type="search" size="22" :color="showSearch ? '#6366f1' : '#666'"></uni-icons>
					</view>
					<view class="nav-icon" @click="showFilterPanel">
						<uni-icons type="list" size="22" color="#666"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-section" v-if="showSearch">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					type="text" 
					v-model="searchKeyword" 
					placeholder="搜索笔记标题或内容..."
					placeholder-class="search-placeholder"
					@confirm="handleSearch"
					class="search-input"
					confirm-type="search"
				/>
				<text v-if="searchKeyword" class="search-clear" @click="clearSearch">✕</text>
			</view>
		</view>

		<!-- 分类快捷导航 -->
		<scroll-view 
			class="category-scroll" 
			scroll-x 
			show-scrollbar="false"
			v-if="!showSearch"
			enable-flex="true"
		>
			<view class="category-list">
				<view 
					class="category-chip" 
					:class="{ active: currentCategory === 'all' }"
					@click="selectCategory('all')"
				>
					<text class="chip-emoji">📚</text>
					<text class="chip-text">全部</text>
				</view>
				<view 
					class="category-chip" 
					v-for="cat in categories" 
					:key="cat.id"
					:class="{ active: currentCategory === cat.id }"
					@click="selectCategory(cat.id)"
				>
					<text class="chip-emoji">{{ cat.icon || '📄' }}</text>
					<text class="chip-text">{{ cat.name }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 欢迎语和统计 -->
			<view class="welcome-section" v-if="!loading && notes.length > 0">
				<text class="welcome-title">📖 继续阅读</text>
				<text class="welcome-count">共 {{ totalNotes }} 篇</text>
			</view>

			<!-- 笔记列表 (修复为 Flex 布局以兼容多端) -->
			<view class="notes-grid" v-if="notes.length > 0">
				<view 
					class="note-card" 
					v-for="(note, index) in notes" 
					:key="note.id"
					:class="{ 'card-large': index % 5 === 0 }" 
					@click="goToDetail(note.id)"
				>
					<!-- 封面图区域 -->
					<view class="card-cover" :class="{ 'no-cover': !note.cover_image }">
						<image 
							v-if="note.cover_image" 
							:src="note.cover_image" 
							mode="aspectFill" 
							class="cover-image"
							lazy-load
						/>
						<view v-else class="cover-placeholder">
							<text class="placeholder-emoji">{{ getRandomEmoji(note.title) }}</text>
						</view>
						
						<!-- 隐私标签 -->
						<view class="privacy-tag" :class="{ private: !note.is_public }">
							<uni-icons 
								:type="note.is_public ? 'eye' : 'eye-slash'" 
								size="12" 
								:color="note.is_public ? '#10b981' : '#f59e0b'"
							></uni-icons>
							<text>{{ note.is_public ? '公开' : '私密' }}</text>
						</view>
					</view>

					<!-- 卡片内容 -->
					<view class="card-content">
						<view class="card-header">
							<text class="note-title">{{ note.title }}</text>
							<text class="note-time">{{ formatTime(note.created_at) }}</text>
						</view>
						
						<text class="note-summary">{{ note.summary || '暂无内容描述' }}</text>
						
						<!-- 标签区域 -->
						<view class="note-tags" v-if="note.tags && note.tags.length">
							<view 
								class="tag-item" 
								v-for="tag in note.tags.slice(0, 2)" 
								:key="tag.id"
							>
								<text class="tag-dot" :style="{ backgroundColor: tag.color || '#6366f1' }"></text>
								<text class="tag-name">{{ tag.name }}</text>
							</view>
							<text v-if="note.tags.length > 2" class="tag-more">+{{ note.tags.length - 2 }}</text>
						</view>

						<!-- 底部统计 -->
						<view class="card-footer">
							<view class="author-info">
								<image 
									:src="note.user?.avatar || '/static/default-avatar.png'" 
									class="author-avatar"
									mode="aspectFill"
								></image>
								<text class="author-name">{{ note.user?.username || '匿名' }}</text>
							</view>
							
							<view class="stats-group">
								<view class="stat-item">
									<uni-icons type="eye" size="14" color="#94a3b8"></uni-icons>
									<text>{{ note.view_count || 0 }}</text>
								</view>
								<view class="stat-item">
									<uni-icons type="heart" size="14" color="#94a3b8"></uni-icons>
									<text>{{ note.like_count || 0 }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else-if="!loading">
				<view class="empty-illustration">
					<text class="empty-emoji">📝✨</text>
				</view>
				<text class="empty-title">还没有笔记</text>
				<text class="empty-desc">记录你的想法、灵感或日常</text>
				<button class="create-btn" @click="goToCreate" hover-class="btn-hover">
					<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
					<text>创建第一篇笔记</text>
				</button>
			</view>

			<!-- 加载状态 -->
			<view class="loading-skeleton" v-if="loading && notes.length === 0">
				<view class="skeleton-card" v-for="i in 4" :key="i">
					<view class="skeleton-cover"></view>
					<view class="skeleton-content">
						<view class="skeleton-title"></view>
						<view class="skeleton-line"></view>
						<view class="skeleton-line short"></view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="notes.length > 0 && !loading">
				<uni-load-more 
					:status="loadMoreStatus" 
					:content-text="{
						contentdown: '上拉加载更多',
						contentrefresh: '加载中...',
						contentnomore: '—— 已经没有更多了 ——'
					}"
				></uni-load-more>
			</view>
		</view>

		<!-- 悬浮创建按钮 -->
		<view class="fab-button" @click="goToCreate" hover-class="fab-hover">
			<uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
		</view>

		<!-- 筛选弹窗 -->
		<uni-popup ref="filterPopup" type="bottom" :safe-area="true">
			<view class="filter-drawer">
				<view class="drawer-header">
					<text class="drawer-title">筛选笔记</text>
					<text class="drawer-close" @click="closeFilter">完成</text>
				</view>

				<scroll-view scroll-y class="drawer-content" enable-flex="true">
					<!-- 排序 -->
					<view class="filter-group">
						<text class="group-title">📊 排序方式</text>
						<view class="group-options">
							<view 
								class="option-btn" 
								v-for="item in sortOptions" 
								:key="item.value"
								:class="{ active: sortBy === item.value }"
								@click="sortBy = item.value"
								hover-class="btn-hover-sm"
							>
								{{ item.label }}
							</view>
						</view>
					</view>

					<!-- 隐私 -->
					<view class="filter-group">
						<text class="group-title">🔒 隐私设置</text>
						<view class="group-options">
							<view 
								class="option-btn" 
								v-for="item in privacyOptions" 
								:key="item.value"
								:class="{ active: privacy === item.value }"
								@click="privacy = item.value"
								hover-class="btn-hover-sm"
							>
								{{ item.label }}
							</view>
						</view>
					</view>

					<!-- 时间 -->
					<view class="filter-group">
						<text class="group-title">⏰ 时间范围</text>
						<view class="group-options">
							<view 
								class="option-btn" 
								v-for="item in timeOptions" 
								:key="item.value"
								:class="{ active: timeRange === item.value }"
								@click="timeRange = item.value"
								hover-class="btn-hover-sm"
							>
								{{ item.label }}
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="drawer-footer">
					<button class="footer-btn reset" @click="resetFilter" hover-class="btn-hover-sm">重置</button>
					<button class="footer-btn apply" @click="applyFilter" hover-class="btn-hover-sm">应用筛选</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"

	export default {
		data() {
			return {
				statusBarHeight: 0,
				notes: [],
				categories: [],
				totalNotes: 0,
				loading: false,
				refreshing: false,
				page: 1,
				pageSize: 10,
				hasMore: true,
				loadMoreStatus: 'more',
				
				// 搜索
				showSearch: false,
				searchKeyword: '',
				searchTimer: null,
				
				// 筛选
				currentCategory: 'all',
				sortBy: 'created_at',
				privacy: 'all',
				timeRange: 'all',
				
				// 选项
				sortOptions: [
					{ label: '最新创建', value: 'created_at' },
					{ label: '最后更新', value: 'updated_at' },
					{ label: '最多浏览', value: 'view_count' },
					{ label: '最多点赞', value: 'like_count' }
				],
				privacyOptions: [
					{ label: '全部笔记', value: 'all' },
					{ label: '公开笔记', value: 'public' },
					{ label: '私密笔记', value: 'private' }
				],
				timeOptions: [
					{ label: '全部时间', value: 'all' },
					{ label: '今天', value: 'today' },
					{ label: '本周', value: 'week' },
					{ label: '本月', value: 'month' },
					{ label: '今年', value: 'year' }
				],
				
				emojis: ['📝', '✍️', '📖', '✨', '💡', '🎯', '🚀', '💭', '🌈', '🍀']
			}
		},

		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			
			this.loadCategories()
			this.loadNotes()
		},

		onPullDownRefresh() {
			this.refreshNotes()
		},

		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.loadMore()
			}
		},

		methods: {
			getRandomEmoji(title) {
				if (!title) return this.emojis[0]
				const index = title.length % this.emojis.length
				return this.emojis[index]
			},

			async loadCategories() {
				try {
					const token = uni.getStorageSync('token')
					if (!token) return
					
					const res = await request({
						url: `${cfg.base_url}/notes/categories/`,
						method: 'GET',
						header: { 'token': token }
					})
					this.categories = Array.isArray(res) ? res : (res.results || [])
				} catch (err) {
					console.error('加载分类失败', err)
				}
			},

			async loadNotes(isRefresh = false) {
				if (this.loading) return

				this.loading = true
				if (isRefresh) {
					this.page = 1
					this.hasMore = true
					this.loadMoreStatus = 'more'
				}

				try {
					const token = uni.getStorageSync('token')
					if (!token) {
						uni.navigateTo({ url: '/pages/login/login' })
						return
					}

					const params = {
						page: this.page,
						page_size: this.pageSize,
						ordering: this.sortBy === 'created_at' ? '-created_at' : '-' + this.sortBy
					}

					if (this.searchKeyword) params.search = this.searchKeyword
					if (this.currentCategory !== 'all') params.category = this.currentCategory
					if (this.privacy !== 'all') params.is_public = this.privacy === 'public'

					if (this.timeRange !== 'all') {
						const now = new Date()
						let startDate = new Date()
						switch(this.timeRange) {
							case 'today': startDate.setHours(0,0,0,0); break
							case 'week': startDate.setDate(now.getDate() - 7); break
							case 'month': startDate.setMonth(now.getMonth() - 1); break
							case 'year': startDate.setFullYear(now.getFullYear() - 1); break
						}
						params.created_at__gte = startDate.toISOString().split('T')[0]
					}

					const res = await request({
						url: `${cfg.base_url}/notes/notes/`,
						method: 'GET',
						header: { 'token': token },
						data: params
					})

					const newNotes = res.results || (Array.isArray(res) ? res : [])
					this.totalNotes = res.count || newNotes.length

					if (isRefresh) {
						this.notes = newNotes
					} else {
						this.notes = [...this.notes, ...newNotes]
					}

					this.hasMore = newNotes.length === this.pageSize
					if (!isRefresh && newNotes.length > 0) this.page++
					
					this.loadMoreStatus = this.hasMore ? 'more' : 'noMore'

				} catch (err) {
					console.error('加载失败', err)
					uni.showToast({ title: '加载失败', icon: 'none' })
					this.loadMoreStatus = 'more'
				} finally {
					this.loading = false
					this.refreshing = false
					uni.stopPullDownRefresh()
				}
			},

			refreshNotes() { this.loadNotes(true) },
			loadMore() { if (this.hasMore && !this.loading) this.loadNotes() },

			handleSearch() {
				if (this.searchTimer) clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					this.refreshNotes()
				}, 500)
			},

			clearSearch() {
				this.searchKeyword = ''
				this.handleSearch()
			},

			toggleSearch() {
				this.showSearch = !this.showSearch
				if (!this.showSearch) {
					this.searchKeyword = ''
					this.handleSearch()
				}
			},

			selectCategory(categoryId) {
				this.currentCategory = categoryId
				this.refreshNotes()
			},

			showFilterPanel() { this.$refs.filterPopup.open() },
			closeFilter() { this.$refs.filterPopup.close() },

			resetFilter() {
				this.sortBy = 'created_at'
				this.privacy = 'all'
				this.timeRange = 'all'
			},

			applyFilter() {
				this.closeFilter()
				this.refreshNotes()
			},

			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/notes/detail?id=${id}`,
					animationType: 'slide-in-right'
				})
			},

			goToCreate() {
				uni.navigateTo({
					url: '/pages/notes/create',
					animationType: 'slide-in-bottom'
				})
			},

			formatTime(dateStr) {
				if (!dateStr) return ''
				const date = new Date(dateStr)
				const now = new Date()
				const diff = now - date
				
				const minute = 60 * 1000
				const hour = minute * 60
				const day = hour * 24
				
				if (diff < minute) return '刚刚'
				if (diff < hour) return Math.floor(diff / minute) + '分钟前'
				if (diff < day) return Math.floor(diff / hour) + '小时前'
				if (diff < day * 7) return Math.floor(diff / day) + '天前'
				
				return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
			}
		}
	}
</script>

<style lang="scss" scoped>
/* 全局变量 */
$primary-color: #6366f1;
$bg-color: #f8fafc;
$text-main: #1e293b;
$text-sub: #64748b;
$text-light: #94a3b8;

.note-list {
	min-height: 100vh;
	background-color: $bg-color;
	padding-bottom: 80px; /* 为 FAB 按钮留空间 */
}

// 状态栏占位
.status-bar {
	width: 100%;
	background: rgba(255, 255, 255, 0.8);
}

// 导航栏
.nav-bar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	
	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
	}
	
	.nav-left {
		.nav-title {
			font-size: 20px; /* 稍微调小防止溢出 */
			font-weight: 700;
			background: linear-gradient(135deg, $primary-color, #8b5cf6);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
	}
	
	.nav-right {
		display: flex;
		gap: 12px;
		
		.nav-icon {
			width: 36px;
			height: 36px;
			border-radius: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f1f5f9;
			transition: all 0.2s;
			
			&.active {
				background: #e0e7ff;
			}
		}
	}
}

// 搜索栏
.search-section {
	padding: 12px 20px;
	background: white;
	
	.search-box {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: #f1f5f9;
		border-radius: 20px;
		
		.search-input {
			flex: 1;
			font-size: 14px;
			height: 24px; /* 固定高度防止跳动 */
		}
		
		.search-clear {
			width: 20px;
			height: 20px;
			border-radius: 10px;
			background: #cbd5e1;
			color: white;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
		}
	}
}

// 分类导航
.category-scroll {
	background: white;
	padding: 10px 0;
	border-bottom: 1px solid #f1f5f9;
	
	.category-list {
		display: flex;
		padding: 0 20px;
		/* 使用 margin-right 代替 gap 以兼容旧端 */
		.category-chip {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 14px;
			background: #f1f5f9;
			border-radius: 16px;
			margin-right: 10px; /* 关键修复 */
			white-space: nowrap;
			
			&:last-child {
				margin-right: 0;
			}
			
			&.active {
				background: linear-gradient(135deg, $primary-color, #8b5cf6);
				.chip-text { color: white; }
			}
			
			.chip-emoji { font-size: 14px; }
			.chip-text { font-size: 13px; color: $text-sub; }
		}
	}
}

// 主要内容区
.main-content {
	padding: 16px;
}

// 欢迎语
.welcome-section {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 16px;
	padding: 0 4px;
	
	.welcome-title {
		font-size: 18px;
		font-weight: 700;
		color: $text-main;
	}
	
	.welcome-count {
		font-size: 12px;
		color: $text-sub;
	}
}

// 笔记网格 (核心修复：使用 Flex 换行模拟 Grid)
.notes-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between; /* 两端对齐 */
	
	.note-card {
		width: 49%; /* 两列，留出间隙空间 */
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		margin-bottom: 16px; /* 垂直间距 */
		display: flex;
		flex-direction: column;
		
		/* 大卡片逻辑：每 5 个出现一个大卡片，占满一行 */
		&.card-large {
			width: 100%;
		}
		
		.card-cover {
			position: relative;
			width: 100%;
			height: 140px;
			
			&.no-cover {
				background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
			}
			
			.cover-image {
				width: 100%;
				height: 100%;
			}
			
			.cover-placeholder {
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.placeholder-emoji {
					font-size: 40px;
					opacity: 0.6;
				}
			}
			
			.privacy-tag {
				position: absolute;
				top: 8px;
				right: 8px;
				display: flex;
				align-items: center;
				gap: 4px;
				padding: 4px 8px;
				background: rgba(255, 255, 255, 0.95);
				border-radius: 12px;
				font-size: 10px;
				color: #10b981;
				box-shadow: 0 2px 4px rgba(0,0,0,0.1);
				
				&.private { color: #f59e0b; }
			}
		}
		
		.card-content {
			padding: 12px;
			flex: 1;
			display: flex;
			flex-direction: column;
			
			.card-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 6px;
				
				.note-title {
					font-size: 15px;
					font-weight: 600;
					color: $text-main;
					flex: 1;
					margin-right: 8px;
					/* 限制 2 行 */
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
					line-height: 1.4;
				}
				
				.note-time {
					font-size: 10px;
					color: $text-light;
					white-space: nowrap;
					margin-top: 4px;
				}
			}
			
			.note-summary {
				font-size: 12px;
				color: $text-sub;
				line-height: 1.5;
				margin-bottom: 10px;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
			}
			
			.note-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				margin-bottom: 10px;
				
				.tag-item {
					display: flex;
					align-items: center;
					gap: 4px;
					
					.tag-dot {
						width: 6px;
						height: 6px;
						border-radius: 3px;
					}
					
					.tag-name {
						font-size: 10px;
						color: $text-sub;
					}
				}
				
				.tag-more {
					font-size: 10px;
					color: $text-light;
				}
			}
			
			.card-footer {
				margin-top: auto; /* 推到底部 */
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-top: 10px;
				border-top: 1px solid #f8fafc;
				
				.author-info {
					display: flex;
					align-items: center;
					gap: 6px;
					overflow: hidden;
					
					.author-avatar {
						width: 20px;
						height: 20px;
						border-radius: 10px;
						flex-shrink: 0;
					}
					
					.author-name {
						font-size: 11px;
						color: $text-sub;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						max-width: 80px;
					}
				}
				
				.stats-group {
					display: flex;
					gap: 8px;
					
					.stat-item {
						display: flex;
						align-items: center;
						gap: 3px;
						
						text {
							font-size: 10px;
							color: $text-light;
						}
					}
				}
			}
		}
	}
}

// 空状态
.empty-state {
	padding: 80px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	
	.empty-illustration {
		width: 100px;
		height: 100px;
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
		
		.empty-emoji { font-size: 40px; }
	}
	
	.empty-title {
		font-size: 18px;
		font-weight: 600;
		color: $text-main;
		margin-bottom: 8px;
	}
	
	.empty-desc {
		font-size: 13px;
		color: $text-sub;
		margin-bottom: 24px;
	}
	
	.create-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 24px;
		background: linear-gradient(135deg, $primary-color, #8b5cf6);
		border: none;
		border-radius: 20px;
		color: white;
		font-size: 14px;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}
}

// 骨架屏
.loading-skeleton {
	.skeleton-card {
		background: white;
		border-radius: 16px;
		margin-bottom: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		
		/* 模拟两列布局的骨架屏 */
		width: 49%; 
		float: left;
		margin-right: 2%;
		
		&:nth-child(even) {
			margin-right: 0;
		}
		
		.skeleton-cover {
			height: 120px;
			background: #f1f5f9;
		}
		
		.skeleton-content {
			padding: 12px;
			
			.skeleton-title {
				height: 16px;
				width: 80%;
				background: #f1f5f9;
				border-radius: 4px;
				margin-bottom: 10px;
			}
			
			.skeleton-line {
				height: 10px;
				background: #f1f5f9;
				border-radius: 4px;
				margin-bottom: 6px;
				
				&.short { width: 60%; }
			}
		}
	}
}

.load-more {
	padding: 20px 0;
}

// 悬浮按钮
.fab-button {
	position: fixed;
	bottom: 30px;
	right: 20px;
	width: 50px;
	height: 50px;
	border-radius: 25px;
	background: linear-gradient(135deg, $primary-color, #8b5cf6);
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 90;
}

// 筛选抽屉
.filter-drawer {
	background: white;
	border-radius: 20px 20px 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	
	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #f1f5f9;
		
		.drawer-title { font-size: 16px; font-weight: 600; color: $text-main; }
		.drawer-close { color: $primary-color; font-size: 14px; }
	}
	
	.drawer-content {
		max-height: 50vh;
		padding: 20px;
	}
	
	.filter-group {
		margin-bottom: 24px;
		
		.group-title {
			display: block;
			font-size: 14px;
			font-weight: 600;
			color: $text-main;
			margin-bottom: 12px;
		}
		
		.group-options {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			
			.option-btn {
				padding: 6px 14px;
				background: #f1f5f9;
				border-radius: 14px;
				font-size: 13px;
				color: $text-sub;
				
				&.active {
					background: linear-gradient(135deg, $primary-color, #8b5cf6);
					color: white;
				}
			}
		}
	}
	
	.drawer-footer {
		display: flex;
		gap: 12px;
		padding: 16px 20px 24px;
		border-top: 1px solid #f1f5f9;
		
		.footer-btn {
			flex: 1;
			height: 44px;
			border-radius: 22px;
			font-size: 15px;
			border: none;
			
			&.reset { background: #f1f5f9; color: $text-sub; }
			&.apply { background: linear-gradient(135deg, $primary-color, #8b5cf6); color: white; }
		}
	}
}

// 通用 Hover 类 (解决小程序没有 :active 的问题)
.btn-hover, .fab-hover, .btn-hover-sm {
	opacity: 0.8;
	transform: scale(0.98);
}
</style>