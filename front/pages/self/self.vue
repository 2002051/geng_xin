<template>
	<view class="page">
		<view class="action">
			<view><image src="/static/center/scan.png"></image></view>
			<view><image src="/static/center/setting.png"></image></view>
		</view>
		<view class="user">
			<image class="avatar" src="/static/center/avatar.png"></image>
			<view class="name">
				<text>耿师傅</text>
				<text>我们的软件</text>
			</view>
			<image class="right" src="/static/center/right.png"></image>
		</view>
		<view class="card" v-for="(v, k) in menus" :key="k">
			<view class="menu">
				<view class="item" v-for="(v_, k_) in v" :key="k_" @click="menuClick(v_)">
					<image :src="v_.icon"></image>
					<view>{{v_.name}}</view>
					<image class="arrow" v-if="v_.arrow" src="/static/center/right.png"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menus: [
					[
						// {name: '我的书籍', icon: '/static/center/book.png', arrow: true},
						{name: '我的账户', icon: '/static/center/self.png', arrow: true},
						// {name: '图书捐赠', icon: '/static/center/heart.png', arrow: true},
						{name: '联系客服', icon: '/static/center/kefu.png', arrow: true},
						{name: '分享应用', icon: '/static/center/share.png', arrow: false},
						{name: '退出登录', icon: '/static/center/out.png', arrow: false},
					],
					[
						// {name: '联系客服', icon: '/static/center/kefu.png', arrow: true},
						// {name: '分享应用', icon: '/static/center/share.png', arrow: false},
						// {name: '退出登录', icon: '/static/center/out.png', arrow: false},
					]
				]
			}
		},
		onLoad() {

		},
		methods: {
			menuClick(e){
				console.log(e);
			}
		}
	}
</script>

<style lang="scss">
	@import "./index.scss";
</style>