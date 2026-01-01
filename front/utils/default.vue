<template>
	<view>
		<view style="display: flex;height: 120rpx;align-items: center;"></view>
		<view class="w-[100%]">
			<lsj-album :foldNum="0" :bigPicture="true" round="10rpx" background="#fff" field="image" :preview="true"
				:list="list" @onClick="clickalbum" />
		</view>
	</view>
</template>

<script>
	import request from "@/utils/request.js"
	import cfg from "@/common/cfg.js"

	export default {
		data() {
			return {
				list: []
			}
		},
		
		onLoad() {
			this.getAlbums();
		},
		
		methods: {
			async getAlbums() {
				console.log("开始获取相册数据...");
				
				const token = uni.getStorageSync('token');
				console.log("Token:", token);
				
				if (!token) {
					console.log("未找到token，跳转到登录页");
					uni.navigateTo({
						url: '/pages/login/login'
					});
					return;
				}
				
				try {
					console.log("发送请求到:", `${cfg.base_url}/albums/`);
					
					const result = await request({
						url: `${cfg.base_url}/album`,  // 注意：应该是 /albums/ 不是 /album
						method: 'GET',
						header: {
							'token': `${token}`,  // Django Token认证用 Authorization 头
							'Content-Type': 'application/json'
						}
					});
					
					console.log("请求成功，返回数据:", result);
					
					// 处理数据，转换为 lsj-album 需要的格式
					this.processAlbumData(result);
					
				} catch (err) {
					console.error("请求失败:", err);
					
					// 使用模拟数据（开发时测试用）
					this.loadMockData();
				}
			},
			
			processAlbumData(albums) {
				if (!albums || !Array.isArray(albums)) {
					console.log("返回的数据格式不正确:", albums);
					this.loadMockData();
					return;
				}
				
				console.log("处理相册数据，数量:", albums.length);
				
				// 将API数据转换为lsj-album需要的格式
				const formattedList = albums.map((album, index) => {
					const albumGroup = {
						title: album.name || `相册${index + 1}`,
						value: []
					};
					
					// 处理照片数据
					// 注意：根据你的API返回结构调整
					const photos = album.photos || album.photo_set || [];
					
					if (photos.length > 0) {
						albumGroup.value = photos.map(photo => ({
							image: photo.image_url || photo.image,
							id: photo.id,
							title: photo.title
						}));
					} else {
						// 如果没有照片，添加一个默认图片
						albumGroup.value = [{
							image: 'https://via.placeholder.com/300x300?text=暂无图片',
							id: 0
						}];
					}
					
					return albumGroup;
				});
				
				this.list = formattedList;
				console.log("转换后的列表数据:", this.list);
			},
			
			loadMockData() {
				console.log("加载模拟数据...");
				
				// 模拟数据
				setTimeout(() => {
					this.list = [{
							title: '第一组图片～',
							value: [{
									image: 'http://127.0.0.1:8000/media/127.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/128.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/129.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/133.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/134.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/135.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/139.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/134.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/140.jpg'
								},
								{
									image: 'http://127.0.0.1:8000/media/141.jpg'
								}
							]
						},
						{
							title: '第二组图片',
							value: [{
									image: 'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0510%2F11290a01j00sd90qe001dd000hs00hsg.jpg&thumbnail=660x2147483647&quality=80&type=jpg'
								},
								{
									image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fc81caf8e-7504-41eb-b63e-9450252b98f8%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=bef18ef0e96aa1ba347805b9e08724d9'
								},
								{
									image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fccb90cb7-0a2d-4a68-b41f-54319bff7201%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=4bd9eddf5fba1cd0437fc189bc4a0d30'
								},
								{
									image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F97ac0862-d51e-41db-a2de-3ed7e3ecdc87%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=ae425705c0141b0ab9fb8a3540df4872'
								},
								{
									image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F2e39f371-b8b9-4863-bb08-e5d66cacfdfb%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=25653c00502332f0426c5e1eb72248bb'
								},
								{
									image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F0eb85040-f43f-4d55-8290-00e0c6a1a671%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=2d4b61d6ea13f8a0ea0c59ef12aacb31'
								},
								{
									image: 'https://ww1.sinaimg.cn/mw690/006cSilvgy1hoziqne3wsj30xv0yaqlh.jpg'
								}
							]
						}
					];
					console.log("模拟数据加载完成");
				}, 500);
			},
			
			clickalbum(e) {
				console.log('点击图片:', e);
			}
		}
	}
</script>

<style>

</style>