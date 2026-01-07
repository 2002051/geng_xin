<template>
    <view class="album-container">
        <!-- 下拉刷新区域 -->
        <uni-refresher :enable="true" @refresh="onRefresh" />
        
        <view class="album-grid" v-if="albumList.length > 0">
            <view 
                class="album-card" 
                v-for="(album, index) in albumList" 
                :key="index"
                @click="goToAlbum(album.id)"
            >
                <!-- 封面图片容器 -->
                <view class="album-cover-container">
                    <image 
                        v-if="album.cover_photo && album.cover_photo.image_url" 
                        class="album-cover-image" 
                        :src="album.cover_photo.image_url" 
                        mode="aspectFill"
                        @load="onImageLoad"
                        @error="onImageError"
                    />
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
            <button class="create-button" @click="createAlbum">创建相册</button>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="loading && albumList.length === 0" class="loading-state">
            <uni-load-more status="loading" :content-text="{contentdown: '上拉显示更多', contentrefresh: '正在加载...', contentnomore: '没有更多了'}"></uni-load-more>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="albumList.length > 0 && hasMore">
            <uni-load-more 
                :status="loadMoreStatus" 
                @clickLoadMore="loadMore"
            ></uni-load-more>
        </view>
        
        <!-- 创建相册悬浮按钮 -->
        <view class="fab-container">
            <button class="fab-button" @click="createAlbum">
                <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
                <text>新建相册</text>
            </button>
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
                loadMoreStatus: 'more'
            };
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
                    
                    console.log("获取相册成功:", result);
                    
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
            
            createAlbum() {
                uni.showModal({
                    title: '新建相册',
                    content: '请输入相册名称',
                    editable: true,
                    placeholderText: '相册名称',
                    success: async (res) => {
                        if (res.confirm && res.content.trim()) {
                            try {
                                const token = uni.getStorageSync('token');
                                const result = await request({
                                    url: `${cfg.base_url}/albums/`,
                                    method: 'POST',
                                    header: {
                                        'Authorization': `Token ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    data: {
                                        name: res.content.trim(),
                                        detail: '',
                                        is_public: true
                                    }
                                });
                                
                                uni.showToast({
                                    title: '创建成功',
                                    icon: 'success'
                                });
                                
                                // 跳转到新相册
                                setTimeout(() => {
                                    this.goToAlbum(result.id);
                                }, 1500);
                                
                            } catch (error) {
                                console.error('创建失败:', error);
                                uni.showToast({
                                    title: '创建失败',
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
                      
                      if (diffDays === 0) return '今天';
                      if (diffDays === 1) return '昨天';
                      if (diffDays < 7) return `${diffDays}天前`;
                      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
                      
                      // 简单日期格式化
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      
                      // 如果是今年，只显示月日
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
        z-index: 1000;
    }
    
    .fab-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50rpx;
        padding: 20rpx 32rpx;
        display: flex;
        align-items: center;
        gap: 12rpx;
        font-size: 28rpx;
        font-weight: 600;
        box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.4);
        border: none;
        
        &:active {
            transform: scale(0.95);
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
    }
</style>