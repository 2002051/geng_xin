<template>
    <view>
        <!-- 触发按钮 -->
        <slot name="trigger">
            <button class="fab-button" @click="showModal = true">
                <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
                <text class="fab-text">新建相册</text>
            </button>
        </slot>
        
        <!-- 模态框 -->
        <uni-popup ref="popup" type="center" :mask-click="false">
            <view class="album-form-container">
                <view class="form-header">
                    <text class="form-title">新建相册</text>
                    <uni-icons 
                        type="close" 
                        size="40" 
                        color="#999" 
                        @click="closeForm"
                    ></uni-icons>
                </view>
                
                <scroll-view class="form-content" scroll-y>
                    <!-- 相册封面 -->
                    <view class="form-section">
                        <text class="section-title">相册封面</text>
                        <view class="cover-upload" @click="chooseCover">
                            <view v-if="form.cover_photo" class="cover-preview">
                                <image 
                                    :src="form.cover_photo" 
                                    class="cover-image" 
                                    mode="aspectFill"
                                />
                                <view class="cover-overlay">
                                    <uni-icons type="camera" size="48" color="#fff"></uni-icons>
                                    <text class="cover-text">更换封面</text>
                                </view>
                            </view>
                            <view v-else class="cover-placeholder">
                                <uni-icons type="image" size="60" color="#ccc"></uni-icons>
                                <text class="placeholder-text">点击上传封面图</text>
                                <text class="placeholder-hint">建议尺寸：750x500像素</text>
                            </view>
                        </view>
                    </view>
                    
                    <!-- 相册名称 -->
                    <view class="form-section">
                        <text class="section-title">相册名称</text>
                        <input 
                            v-model="form.name" 
                            class="form-input" 
                            placeholder="请输入相册名称" 
                            placeholder-class="placeholder"
                            maxlength="20"
                            :focus="autoFocus"
                        />
                        <view class="input-counter">
                            <text>{{ form.name.length }}/20</text>
                        </view>
                    </view>
                    
                    <!-- 相册描述 -->
                    <view class="form-section">
                        <text class="section-title">相册描述（可选）</text>
                        <textarea 
                            v-model="form.detail" 
                            class="form-textarea" 
                            placeholder="请输入相册描述..." 
                            placeholder-class="placeholder"
                            maxlength="100"
                            auto-height
                        />
                        <view class="input-counter">
                            <text>{{ form.detail.length }}/100</text>
                        </view>
                    </view>
                    
                    <!-- 隐私设置 -->
                    <view class="form-section">
                        <text class="section-title">隐私设置</text>
                        <view class="privacy-options">
                            <view 
                                class="privacy-option" 
                                :class="{ active: form.is_public }"
                                @click="form.is_public = true"
                            >
                                <uni-icons 
                                    type="eye" 
                                    size="36" 
                                    :color="form.is_public ? '#4CAF50' : '#999'"
                                ></uni-icons>
                                <view class="option-content">
                                    <text class="option-title">公开相册</text>
                                    <text class="option-desc">所有人都可以查看此相册</text>
                                </view>
                                <view v-if="form.is_public" class="option-check">
                                    <uni-icons type="checkmarkempty" size="32" color="#4CAF50"></uni-icons>
                                </view>
                            </view>
                            
                            <view 
                                class="privacy-option" 
                                :class="{ active: !form.is_public }"
                                @click="form.is_public = false"
                            >
                                <uni-icons 
                                    type="eye-slash" 
                                    size="36" 
                                    :color="!form.is_public ? '#FF9800' : '#999'"
                                ></uni-icons>
                                <view class="option-content">
                                    <text class="option-title">私密相册</text>
                                    <text class="option-desc">仅自己可以查看此相册</text>
                                </view>
                                <view v-if="!form.is_public" class="option-check">
                                    <uni-icons type="checkmarkempty" size="32" color="#FF9800"></uni-icons>
                                </view>
                            </view>
                        </view>
                    </view>
                    
                    <!-- 标签（可选） -->
                    <view class="form-section">
                        <text class="section-title">相册标签（可选）</text>
                        <view class="tags-container">
                            <view 
                                v-for="tag in selectedTags" 
                                :key="tag" 
                                class="tag-item"
                                @click="removeTag(tag)"
                            >
                                <text>{{ tag }}</text>
                                <uni-icons type="close" size="20" color="#999"></uni-icons>
                            </view>
                            <input 
                                v-model="tagInput" 
                                class="tag-input" 
                                placeholder="输入标签，回车添加" 
                                placeholder-class="placeholder"
                                @confirm="addTag"
                                @blur="addTag"
                                maxlength="10"
                            />
                        </view>
                        <view class="tag-hint">
                            <text>最多添加5个标签，每个标签不超过10个字</text>
                        </view>
                    </view>
                </scroll-view>
                
                <!-- 表单操作 -->
                <view class="form-actions">
                    <button class="cancel-btn" @click="closeForm">取消</button>
                    <button 
                        class="submit-btn" 
                        :class="{ disabled: !formValid }"
                        :disabled="!formValid || submitting"
                        @click="submitForm"
                    >
                        <text v-if="!submitting">创建相册</text>
                        <text v-else class="loading-text">创建中...</text>
                    </button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
import request from "@/utils/request.js"
import cfg from "@/common/cfg.js"

export default {
    name: 'AlbumForm',
    props: {
        // 是否自动聚焦名称输入框
        autoFocus: {
            type: Boolean,
            default: false
        },
        // 默认表单数据
        defaultData: {
            type: Object,
            default: () => ({
                name: '',
                detail: '',
                cover_photo: '',
                is_public: true,
                tags: []
            })
        }
    },
    data() {
        return {
            showModal: false,
            submitting: false,
            tagInput: '',
            form: {
                name: '',
                detail: '',
                cover_photo: '',
                is_public: true,
                tags: []
            }
        }
    },
    computed: {
        selectedTags() {
            return this.form.tags || []
        },
        formValid() {
            return this.form.name.trim().length > 0 && 
                   this.form.name.trim().length <= 20
        }
    },
    watch: {
        showModal(newVal) {
            if (newVal) {
                this.$refs.popup.open()
            } else {
                this.$refs.popup.close()
            }
        },
        defaultData: {
            handler(newVal) {
                this.form = { ...this.form, ...newVal }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        // 打开表单
        open() {
            this.showModal = true
        },
        
        // 关闭表单
        closeForm() {
            this.showModal = false
            this.resetForm()
        },
        
        // 重置表单
        resetForm() {
            this.form = {
                name: '',
                detail: '',
                cover_photo: '',
                is_public: true,
                tags: []
            }
            this.tagInput = ''
            this.submitting = false
        },
        
        // 选择封面图片
        async chooseCover() {
            try {
                const res = await uni.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera']
                })
                
                if (res.tempFilePaths.length > 0) {
                    // 这里可以上传图片到服务器，获取图片URL
                    // 暂时使用本地路径
                    this.form.cover_photo = res.tempFilePaths[0]
                    // 如果需要上传到服务器，调用上传接口
                    // await this.uploadImage(res.tempFilePaths[0])
                }
            } catch (error) {
                console.error('选择图片失败:', error)
            }
        },
        
        // 上传图片（如果需要）
        async uploadImage(filePath) {
            // 实现图片上传逻辑
            // 返回图片URL
            return filePath // 暂时返回本地路径
        },
        
        // 添加标签
        addTag() {
            const tag = this.tagInput.trim()
            if (!tag) return
            
            if (this.selectedTags.length >= 5) {
                uni.showToast({
                    title: '最多只能添加5个标签',
                    icon: 'none'
                })
                return
            }
            
            if (tag.length > 10) {
                uni.showToast({
                    title: '标签不能超过10个字',
                    icon: 'none'
                })
                return
            }
            
            if (!this.selectedTags.includes(tag)) {
                this.form.tags.push(tag)
                this.tagInput = ''
            } else {
                uni.showToast({
                    title: '标签已存在',
                    icon: 'none'
                })
            }
        },
        
        // 移除标签
        removeTag(tag) {
            this.form.tags = this.selectedTags.filter(t => t !== tag)
        },
        
        // 提交表单
        async submitForm() {
            if (!this.formValid || this.submitting) return
            
            this.submitting = true
            
            try {
                const token = uni.getStorageSync('token')
                if (!token) {
                    throw new Error('请先登录')
                }
                
                // 准备提交数据
                const submitData = {
                    name: this.form.name.trim(),
                    detail: this.form.detail.trim(),
                    is_public: this.form.is_public,
                    tags: this.selectedTags
                }
                
                // 如果有封面图片，需要先上传
                if (this.form.cover_photo && !this.form.cover_photo.startsWith('http')) {
                    // 上传封面图片
                    // const coverUrl = await this.uploadImage(this.form.cover_photo)
                    // submitData.cover_photo = coverUrl
                    submitData.cover_photo = this.form.cover_photo // 暂时使用本地路径
                } else if (this.form.cover_photo) {
                    submitData.cover_photo = this.form.cover_photo
                }
                
                // 调用创建接口
                const result = await request({
                    url: `${cfg.base_url}/album/`,
                    method: 'POST',
                    header: {
                        'token': token,
                        'Content-Type': 'application/json'
                    },
                    data: submitData
                })
                
                // 发送成功事件
                this.$emit('success', result)
                
                // 显示成功提示
                uni.showToast({
                    title: '创建成功！',
                    icon: 'success',
                    duration: 1500
                })
                
                // 延迟关闭，让用户看到成功提示
                setTimeout(() => {
                    this.closeForm()
                    this.submitting = false
                }, 1500)
                
            } catch (error) {
                console.error('创建相册失败:', error)
                uni.showToast({
                    title: error.message || '创建失败，请重试',
                    icon: 'error'
                })
                this.submitting = false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.album-form-container {
    width: 650rpx;
    max-height: 90vh;
    background: white;
    border-radius: 24rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 32rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .form-title {
        font-size: 36rpx;
        font-weight: 700;
        color: #333;
    }
}

.form-content {
    flex: 1;
    padding: 0 32rpx;
}

.form-section {
    margin: 32rpx 0;
    
    .section-title {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 20rpx;
    }
}

// 封面上传区域
.cover-upload {
    background: #f8f9fa;
    border-radius: 16rpx;
    border: 2rpx dashed #ddd;
    height: 250rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    
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
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        
        .cover-text {
            color: white;
            font-size: 24rpx;
            margin-top: 12rpx;
        }
    }
    
    &:hover .cover-overlay {
        opacity: 1;
    }
}

.cover-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .placeholder-text {
        font-size: 28rpx;
        color: #666;
        margin-top: 16rpx;
    }
    
    .placeholder-hint {
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
    }
}

// 表单输入框
.form-input, .form-textarea {
    width: 100%;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 24rpx;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid transparent;
    
    &:focus {
        border-color: #667eea;
        background: white;
    }
}

.form-textarea {
    min-height: 120rpx;
}

.placeholder {
    color: #aaa;
    font-size: 28rpx;
}

.input-counter {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
}

// 隐私选项
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
    position: relative;
    
    &:last-child {
        margin-bottom: 0;
    }
    
    &.active {
        background: #f0f7ff;
    }
    
    &:active {
        background: #e8f0fe;
    }
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

// 标签输入
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    align-items: center;
}

.tag-item {
    background: #e8f4ff;
    border-radius: 20rpx;
    padding: 12rpx 20rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    text {
        font-size: 24rpx;
        color: #1890ff;
    }
    
    &:active {
        background: #d4e7ff;
    }
}

.tag-input {
    flex: 1;
    min-width: 200rpx;
    background: #f8f9fa;
    border-radius: 20rpx;
    padding: 12rpx 20rpx;
    font-size: 24rpx;
    color: #333;
}

.tag-hint {
    font-size: 22rpx;
    color: #999;
    margin-top: 12rpx;
}

// 表单操作按钮
.form-actions {
    display: flex;
    gap: 24rpx;
    padding: 32rpx;
    border-top: 1rpx solid #f0f0f0;
    
    button {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
    }
}

.cancel-btn {
    background: #f8f9fa;
    color: #666;
    
    &:active {
        background: #e9ecef;
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
    gap: 8rpx;
}

// 悬浮按钮样式
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

// 暗色模式适配
@media (prefers-color-scheme: dark) {
    .album-form-container {
        background: #2d3748;
    }
    
    .form-header {
        border-bottom-color: #4a5568;
        
        .form-title {
            color: #e2e8f0;
        }
    }
    
    .form-section .section-title {
        color: #e2e8f0;
    }
    
    .cover-upload {
        background: #4a5568;
        border-color: #718096;
    }
    
    .form-input, .form-textarea, .tag-input {
        background: #4a5568;
        color: #e2e8f0;
        
        &:focus {
            background: #2d3748;
            border-color: #667eea;
        }
    }
    
    .placeholder {
        color: #a0aec0;
    }
    
    .privacy-options {
        background: #4a5568;
    }
    
    .privacy-option {
        background: #2d3748;
        
        &.active {
            background: #1a365d;
        }
        
        &:active {
            background: #2d3748;
        }
    }
    
    .option-content .option-title {
        color: #e2e8f0;
    }
    
    .option-content .option-desc {
        color: #a0aec0;
    }
    
    .tag-item {
        background: #2c5282;
        
        text {
            color: #90cdf4;
        }
    }
    
    .cancel-btn {
        background: #4a5568;
        color: #a0aec0;
        
        &:active {
            background: #2d3748;
        }
    }
}
</style>