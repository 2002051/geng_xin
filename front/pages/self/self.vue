<template>
    <view class="profile-container">
        <!-- 返回按钮 -->
        <view class="nav-back" @click="goBack">
            <uni-icons type="arrowleft" size="32" color="#333"></uni-icons>
        </view>
        
        <!-- 编辑按钮 -->
        <view class="edit-profile" @click="editProfile">
            <uni-icons type="compose" size="32" color="#333"></uni-icons>
        </view>
        
        <!-- 用户信息卡片 -->
        <view class="profile-card">
            <!-- 用户头像区域 -->
            <view class="avatar-section">
                <image 
                    class="avatar-image"
                    :src="profile.avatar"
                    mode="aspectFill"
                    @error="onAvatarError"
                >
                    <view v-if="uploadingAvatar" class="avatar-loading">
                        <uni-icons type="spinner-cycle" size="40" color="#fff"></uni-icons>
                    </view>
                </image>
                
                <!-- 更换头像按钮 -->
                <view class="change-avatar-btn" @click="changeAvatar">
                    <uni-icons type="camera-filled" size="28" color="#fff"></uni-icons>
                </view>
                
                <!-- 在线状态 -->
                <view class="online-status"></view>
            </view>
            
            <!-- 用户基本信息 -->
            <view class="profile-info">
                <view class="username-row">
                    <text class="username">{{ profile.username }}</text>
                    <view class="gender-badge" :class="getGenderClass(profile.gender)">
                        <uni-icons :type="getGenderIcon(profile.gender)" size="24" color="#fff"></uni-icons>
                        <text class="gender-text">{{ getGenderText(profile.gender) }}</text>
                    </view>
                </view>
                
                <text class="user-id">ID: {{ profile.id }}</text>
                
                <!-- 个性签名 -->
                <view class="signature-section" @click="editSignature">
                    <view class="signature-header">
                        <uni-icons type="quote" size="28" color="#667eea"></uni-icons>
                        <text class="signature-title">个性签名</text>
                    </view>
                    <text class="signature-content" v-if="profile.signature">
                        {{ profile.signature }}
                    </text>
                    <text class="no-signature" v-else>
                        点击设置个性签名
                    </text>
                </view>
            </view>
            
            <!-- 注册时间 -->
            <view class="register-time">
                <uni-icons type="calendar" size="28" color="#999"></uni-icons>
                <text class="register-text">注册于 {{ formatRegisterTime(profile.created_at) }}</text>
            </view>
        </view>
        
        <!-- 统计数据卡片 -->
        <view class="stats-card">
            <view class="stats-row">
                <view class="stat-item" @click="goToAlbumList">
                    <text class="stat-number">{{ albumCount }}</text>
                    <text class="stat-label">相册</text>
                </view>
                
                <view class="stat-divider"></view>
                
                <view class="stat-item" @click="goToPhotoList">
                    <text class="stat-number">{{ photoCount }}</text>
                    <text class="stat-label">照片</text>
                </view>
                
                <view class="stat-divider"></view>
                
                <view class="stat-item" @click="goToFollowers">
                    <text class="stat-number">{{ followerCount }}</text>
                    <text class="stat-label">粉丝</text>
                </view>
                
                <view class="stat-divider"></view>
                
                <view class="stat-item" @click="goToFollowing">
                    <text class="stat-number">{{ followingCount }}</text>
                    <text class="stat-label">关注</text>
                </view>
            </view>
        </view>
        
        <!-- 功能模块 -->
        <view class="modules-section">
            <!-- 我的相册 -->
            <view class="module-card" @click="goToAlbumList">
                <view class="module-header">
                    <view class="module-icon">
                        <uni-icons type="album" size="36" color="#667eea"></uni-icons>
                    </view>
                    <text class="module-title">我的相册</text>
                </view>
                <uni-icons type="arrowright" size="28" color="#999"></uni-icons>
            </view>
            
            <!-- 我的收藏 -->
            <view class="module-card" @click="goToFavorites">
                <view class="module-header">
                    <view class="module-icon">
                        <uni-icons type="star" size="36" color="#ffb300"></uni-icons>
                    </view>
                    <text class="module-title">我的收藏</text>
                </view>
                <uni-icons type="arrowright" size="28" color="#999"></uni-icons>
            </view>
            
            <!-- 隐私设置 -->
            <view class="module-card" @click="goToPrivacySettings">
                <view class="module-header">
                    <view class="module-icon">
                        <uni-icons type="locked" size="36" color="#f44336"></uni-icons>
                    </view>
                    <text class="module-title">隐私设置</text>
                </view>
                <uni-icons type="arrowright" size="28" color="#999"></uni-icons>
            </view>
            
            <!-- 关于我们 -->
            <view class="module-card" @click="goToAbout">
                <view class="module-header">
                    <view class="module-icon">
                        <uni-icons type="info" size="36" color="#4caf50"></uni-icons>
                    </view>
                    <text class="module-title">关于我们</text>
                </view>
                <uni-icons type="arrowright" size="28" color="#999"></uni-icons>
            </view>
        </view>
        
        <!-- 最近上传的照片 -->
        <view class="recent-photos-section">
            <view class="section-header">
                <text class="section-title">最近上传</text>
                <text class="see-all" @click="goToPhotoList">查看全部</text>
            </view>
            
            <view v-if="recentPhotos.length > 0" class="recent-photos-grid">
                <view 
                    class="photo-item" 
                    v-for="(photo, index) in recentPhotos" 
                    :key="index"
                    @click="previewPhoto(index)"
                >
                    <image 
                        class="photo-image"
                        :src="photo.image_url"
                        mode="aspectFill"
                    />
                </view>
            </view>
            
            <view v-else class="no-recent-photos">
                <image class="empty-image" src="/static/empty-photo.png" mode="widthFix"></image>
                <text class="empty-text">还没有上传照片</text>
                <button class="upload-btn" @click="goToAlbumList">
                    去上传
                </button>
            </view>
        </view>
        
        <!-- 退出登录 -->
        <view class="logout-section">
            <button class="logout-btn" @click="logout">
                <uni-icons type="undo" size="28" color="#fff"></uni-icons>
                <text>退出登录</text>
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
                userId: null,
                profile: {
                    id: 0,
                    username: '',
                    gender: 'O',
                    signature: '',
                    avatar: '',
                    created_at: ''
                },
                albumCount: 0,
                photoCount: 0,
                followerCount: 0,
                followingCount: 0,
                recentPhotos: [],
                loading: false,
                uploadingAvatar: false
            };
        },
        
        onLoad(options) {
            if (options.userId) {
                this.userId = options.userId;
            } else {
                // 默认为当前登录用户
                this.userId = 1; // 根据实际情况获取当前用户ID
            }
            
            this.loadProfile();
            this.loadStats();
            this.loadRecentPhotos();
        },
        
        onShow() {
            // 页面显示时重新加载数据，确保编辑后的信息能及时更新
            this.loadProfile();
        },
        
        onPullDownRefresh() {
            this.refreshData();
        },
        
        methods: {
            async loadProfile() {
                this.loading = true;
                try {
                    const token = uni.getStorageSync('token');
                    if (!token) {
                        uni.navigateTo({
                            url: '/pages/login/login'
                        });
                        return;
                    }
                    
                    const result = await request({
                        url: `${cfg.base_url}/profiles/${this.userId}/`,
                        method: 'GET',
                        header: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log("获取用户信息成功:", result);
                    this.profile = result;
                    
                } catch (error) {
                    console.error("获取用户信息失败:", error);
                    uni.showToast({
                        title: '加载失败',
                        icon: 'error'
                    });
                } finally {
                    this.loading = false;
                }
            },
            
            async loadStats() {
                try {
                    const token = uni.getStorageSync('token');
                    
                    // 这里需要根据实际API获取统计数据
                    // 暂时使用模拟数据
                    this.albumCount = 4;
                    this.photoCount = 16;
                    this.followerCount = 520;
                    this.followingCount = 1314;
                    
                } catch (error) {
                    console.error("获取统计数据失败:", error);
                }
            },
            
            async loadRecentPhotos() {
                try {
                    const token = uni.getStorageSync('token');
                    
                    // 模拟最近上传的照片数据
                    // 实际应该调用相应的API
                    this.recentPhotos = [
                        { id: 1, image_url: 'https://picsum.photos/300/300?random=1' },
                        { id: 2, image_url: 'https://picsum.photos/300/300?random=2' },
                        { id: 3, image_url: 'https://picsum.photos/300/300?random=3' },
                        { id: 4, image_url: 'https://picsum.photos/300/300?random=4' }
                    ];
                    
                } catch (error) {
                    console.error("获取最近照片失败:", error);
                }
            },
            
            async refreshData() {
                await Promise.all([
                    this.loadProfile(),
                    this.loadStats(),
                    this.loadRecentPhotos()
                ]);
                uni.showToast({
                    title: '刷新成功',
                    icon: 'success'
                });
                uni.stopPullDownRefresh();
            },
            
            goBack() {
                uni.navigateBack({
                    delta: 1,
                    animationType: 'slide-out-left'
                });
            },
            
            editProfile() {
                uni.showActionSheet({
                    itemList: ['修改个人信息', '修改密码', '账号设置'],
                    success: (res) => {
                        if (res.tapIndex === 0) {
                            this.editBasicInfo();
                        } else if (res.tapIndex === 1) {
                            this.changePassword();
                        }
                    }
                });
            },
            
            editBasicInfo() {
                uni.showModal({
                    title: '修改个人信息',
                    content: '请填写个人信息',
                    editable: true,
                    placeholderText: this.profile.username,
                    success: async (res) => {
                        if (res.confirm && res.content.trim()) {
                            try {
                                const token = uni.getStorageSync('token');
                                await request({
                                    url: `${cfg.base_url}/profiles/${this.userId}/`,
                                    method: 'PUT',
                                    header: {
                                        'Authorization': `Token ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    data: {
                                        username: res.content.trim(),
                                        gender: this.profile.gender,
                                        signature: this.profile.signature
                                    }
                                });
                                
                                uni.showToast({
                                    title: '修改成功',
                                    icon: 'success'
                                });
                                
                                this.loadProfile();
                                
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
            
            changeAvatar() {
                uni.showActionSheet({
                    itemList: ['拍照', '从相册选择'],
                    success: (res) => {
                        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
                        
                        uni.chooseImage({
                            count: 1,
                            sizeType: ['compressed'],
                            sourceType: sourceType,
                            success: async (chooseRes) => {
                                const tempFilePath = chooseRes.tempFilePaths[0];
                                this.uploadAvatar(tempFilePath);
                            }
                        });
                    }
                });
            },
            
            async uploadAvatar(filePath) {
                this.uploadingAvatar = true;
                
                try {
                    const token = uni.getStorageSync('token');
                    
                    uni.uploadFile({
                        url: `${cfg.base_url}/profiles/${this.userId}/upload_avatar/`, // 需要根据实际API调整
                        filePath: filePath,
                        name: 'avatar',
                        formData: {
                            'user_id': this.userId
                        },
                        header: {
                            'Authorization': `Token ${token}`
                        },
                        success: (uploadRes) => {
                            const data = JSON.parse(uploadRes.data);
                            console.log('上传成功:', data);
                            
                            if (data.avatar) {
                                this.profile.avatar = data.avatar;
                                uni.showToast({
                                    title: '头像更新成功',
                                    icon: 'success'
                                });
                            }
                        },
                        fail: (error) => {
                            console.error('上传失败:', error);
                            uni.showToast({
                                title: '上传失败',
                                icon: 'error'
                            });
                        },
                        complete: () => {
                            this.uploadingAvatar = false;
                        }
                    });
                    
                } catch (error) {
                    console.error('上传头像失败:', error);
                    this.uploadingAvatar = false;
                }
            },
            
            editSignature() {
                uni.showModal({
                    title: '修改个性签名',
                    content: '请输入个性签名',
                    editable: true,
                    placeholderText: this.profile.signature || '一句话介绍你自己',
                    maxlength: 50,
                    success: async (res) => {
                        if (res.confirm) {
                            const newSignature = res.content.trim();
                            
                            try {
                                const token = uni.getStorageSync('token');
                                await request({
                                    url: `${cfg.base_url}/profiles/${this.userId}/`,
                                    method: 'PATCH',
                                    header: {
                                        'Authorization': `Token ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    data: {
                                        signature: newSignature
                                    }
                                });
                                
                                this.profile.signature = newSignature;
                                uni.showToast({
                                    title: '签名已更新',
                                    icon: 'success'
                                });
                                
                            } catch (error) {
                                console.error('更新签名失败:', error);
                                uni.showToast({
                                    title: '更新失败',
                                    icon: 'error'
                                });
                            }
                        }
                    }
                });
            },
            
            getGenderClass(gender) {
                switch (gender) {
                    case 'M': return 'gender-male';
                    case 'F': return 'gender-female';
                    default: return 'gender-other';
                }
            },
            
            getGenderIcon(gender) {
                switch (gender) {
                    case 'M': return 'male';
                    case 'F': return 'female';
                    default: return 'person';
                }
            },
            
            getGenderText(gender) {
                switch (gender) {
                    case 'M': return '男';
                    case 'F': return '女';
                    default: return '保密';
                }
            },
            
            formatRegisterTime(dateString) {
                if (!dateString) return '';
                
                const date = new Date(dateString);
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) return '今天';
                if (diffDays === 1) return '昨天';
                if (diffDays < 30) return `${diffDays}天前`;
                if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
                
                return `${Math.floor(diffDays / 365)}年前`;
            },
            
            goToAlbumList() {
                uni.navigateTo({
                    url: '/pages/album/index',
                    animationType: 'slide-in-right'
                });
            },
            
            goToPhotoList() {
                uni.navigateTo({
                    url: '/pages/photo/my-photos',
                    animationType: 'slide-in-right'
                });
            },
            
            goToFollowers() {
                uni.navigateTo({
                    url: '/pages/profile/followers',
                    animationType: 'slide-in-right'
                });
            },
            
            goToFollowing() {
                uni.navigateTo({
                    url: '/pages/profile/following',
                    animationType: 'slide-in-right'
                });
            },
            
            goToFavorites() {
                uni.navigateTo({
                    url: '/pages/photo/favorites',
                    animationType: 'slide-in-right'
                });
            },
            
            goToPrivacySettings() {
                uni.navigateTo({
                    url: '/pages/settings/privacy',
                    animationType: 'slide-in-right'
                });
            },
            
            goToAbout() {
                uni.navigateTo({
                    url: '/pages/settings/about',
                    animationType: 'slide-in-right'
                });
            },
            
            previewPhoto(index) {
                const urls = this.recentPhotos.map(photo => photo.image_url);
                uni.previewImage({
                    current: index,
                    urls: urls
                });
            },
            
            logout() {
                uni.showModal({
                    title: '退出登录',
                    content: '确定要退出登录吗？',
                    success: (res) => {
                        if (res.confirm) {
                            // 清除登录状态
                            uni.removeStorageSync('token');
                            uni.removeStorageSync('userInfo');
                            
                            uni.showToast({
                                title: '已退出登录',
                                icon: 'success'
                            });
                            
                            setTimeout(() => {
                                uni.reLaunch({
                                    url: '/pages/login/login'
                                });
                            }, 1500);
                        }
                    }
                });
            },
            
            changePassword() {
                uni.navigateTo({
                    url: '/pages/settings/change-password',
                    animationType: 'slide-in-right'
                });
            },
            
            onAvatarError(e) {
                console.error('头像加载失败:', e);
                // 设置默认头像
                this.profile.avatar = '/static/default-avatar.png';
            }
        }
    };
</script>

<style lang="scss" scoped>
    .profile-container {
        min-height: 100vh;
        background: linear-gradient(180deg, #f5f7fa 0%, #e4efe9 100%);
        padding-bottom: 40rpx;
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
    
    .edit-profile {
        position: fixed;
        top: 80rpx;
        right: 32rpx;
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
    
    .profile-card {
        background: white;
        margin: 120rpx 32rpx 24rpx;
        border-radius: 32rpx;
        padding: 40rpx;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    }
    
    .avatar-section {
        position: relative;
        width: 160rpx;
        height: 160rpx;
        margin: 0 auto 32rpx;
    }
    
    .avatar-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(45deg, #667eea, #764ba2);
        border: 4rpx solid white;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
    }
    
    .avatar-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4rpx);
    }
    
    .change-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 48rpx;
        height: 48rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid white;
        
        &:active {
            transform: scale(0.95);
        }
    }
    
    .online-status {
        position: absolute;
        bottom: 4rpx;
        right: 4rpx;
        width: 20rpx;
        height: 20rpx;
        background: #4caf50;
        border: 2rpx solid white;
        border-radius: 50%;
    }
    
    .profile-info {
        margin-bottom: 32rpx;
    }
    
    .username-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16rpx;
        margin-bottom: 12rpx;
    }
    
    .username {
        font-size: 40rpx;
        font-weight: 800;
        color: #333;
        text-align: center;
    }
    
    .gender-badge {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        gap: 6rpx;
        font-size: 22rpx;
        font-weight: 600;
        
        &.gender-male {
            background: #2196f3;
        }
        
        &.gender-female {
            background: #e91e63;
        }
        
        &.gender-other {
            background: #9c27b0;
        }
        
        .gender-text {
            color: white;
        }
    }
    
    .user-id {
        display: block;
        text-align: center;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 32rpx;
    }
    
    .signature-section {
        background: #f8f9fa;
        border-radius: 20rpx;
        padding: 24rpx;
        border: 1rpx dashed #e0e0e0;
        
        &:active {
            background: #f0f0f0;
        }
    }
    
    .signature-header {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 16rpx;
    }
    
    .signature-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #667eea;
    }
    
    .signature-content {
        display: block;
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
        text-align: center;
        font-style: italic;
    }
    
    .no-signature {
        display: block;
        font-size: 26rpx;
        color: #999;
        text-align: center;
        font-style: italic;
    }
    
    .register-time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;
        padding-top: 24rpx;
        border-top: 1rpx solid #f0f0f0;
    }
    
    .register-text {
        font-size: 24rpx;
        color: #999;
    }
    
    .stats-card {
        background: white;
        margin: 0 32rpx 24rpx;
        border-radius: 32rpx;
        padding: 32rpx;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    }
    
    .stats-row {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        
        &:active {
            opacity: 0.7;
        }
    }
    
    .stat-number {
        font-size: 40rpx;
        font-weight: 800;
        color: #333;
        margin-bottom: 8rpx;
    }
    
    .stat-label {
        font-size: 24rpx;
        color: #666;
        font-weight: 500;
    }
    
    .stat-divider {
        width: 1rpx;
        height: 60rpx;
        background: #f0f0f0;
    }
    
    .modules-section {
        margin: 0 32rpx 24rpx;
    }
    
    .module-card {
        background: white;
        border-radius: 24rpx;
        padding: 32rpx;
        margin-bottom: 20rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
        
        &:active {
            background: #f8f9fa;
        }
    }
    
    .module-header {
        display: flex;
        align-items: center;
        gap: 20rpx;
    }
    
    .module-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 16rpx;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .module-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
    }
    
    .recent-photos-section {
        background: white;
        margin: 0 32rpx 24rpx;
        border-radius: 32rpx;
        padding: 32rpx;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32rpx;
    }
    
    .section-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #333;
    }
    
    .see-all {
        font-size: 26rpx;
        color: #667eea;
        font-weight: 500;
        
        &:active {
            opacity: 0.7;
        }
    }
    
    .recent-photos-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8rpx;
    }
    
    .photo-item {
        aspect-ratio: 1;
        border-radius: 12rpx;
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
    }
    
    .no-recent-photos {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 0;
    }
    
    .empty-image {
        width: 200rpx;
        height: 200rpx;
        opacity: 0.5;
        margin-bottom: 32rpx;
    }
    
    .empty-text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 32rpx;
    }
    
    .upload-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50rpx;
        padding: 20rpx 40rpx;
        font-size: 26rpx;
        font-weight: 600;
        border: none;
        
        &:active {
            opacity: 0.9;
        }
    }
    
    .logout-section {
        margin: 0 32rpx;
    }
    
    .logout-btn {
        background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
        color: white;
        border-radius: 50rpx;
        padding: 24rpx;
        font-size: 28rpx;
        font-weight: 600;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12rpx;
        
        &:active {
            opacity: 0.9;
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
        .profile-container {
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .nav-back, .edit-profile {
            background: rgba(45, 55, 72, 0.9);
        }
        
        .profile-card, .stats-card, .module-card, .recent-photos-section {
            background: #2d3748;
            box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
        }
        
        .username {
            color: #e2e8f0;
        }
        
        .user-id {
            color: #a0aec0;
        }
        
        .signature-section {
            background: #4a5568;
            border-color: #718096;
        }
        
        .signature-content {
            color: #cbd5e0;
        }
        
        .no-signature {
            color: #718096;
        }
        
        .stat-number {
            color: #e2e8f0;
        }
        
        .stat-label {
            color: #a0aec0;
        }
        
        .module-title {
            color: #e2e8f0;
        }
        
        .module-icon {
            background: #4a5568;
        }
        
        .section-title {
            color: #e2e8f0;
        }
        
        .photo-item {
            background: #4a5568;
        }
    }
    
    /* 响应式调整 */
    @media (max-width: 750rpx) {
        .profile-card, .stats-card, .modules-section, .recent-photos-section {
            margin-left: 24rpx;
            margin-right: 24rpx;
        }
        
        .recent-photos-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 6rpx;
        }
        
        .avatar-section {
            width: 140rpx;
            height: 140rpx;
        }
        
        .username {
            font-size: 36rpx;
        }
    }
    
    @media (min-width: 751rpx) {
        .recent-photos-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 12rpx;
        }
        
        .avatar-section {
            width: 180rpx;
            height: 180rpx;
        }
        
        .username {
            font-size: 44rpx;
        }
    }
</style>