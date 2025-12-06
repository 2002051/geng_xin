<template>
	<view>
		<view style="display: flex;height: 120rpx;align-items: center;"></view>
		<view class="w-[100%]">
			<lsj-album
			:foldNum="0"
			:bigPicture="true"
			 round="10rpx"
			 background="#fff"
			 field="image"
			:preview="true"
			:list="list"
			@onClick="clickalbum"
			/>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: []
			}
		},
		onLoad() {
			setTimeout(()=> {
				// 模拟动态取数据
				this.list = [
					{
						// 不传title时不显示当前组标题和序列
						title: '第一组图片～',
						value: [
							// 方式一 纯数组
							// 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4mnl59j20u01t1k28.jpg',
							// 'https://ww4.sinaimg.cn/mw690/008rOMXAgy1hom3fmylzmj313u1z2akp.jpg',
							// 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4n5peoj20u01t1wv7.jpg'
							
							// 方式二 对象数组，更贴合一般项目需求，可传入其他参数
							{ image: 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4mnl59j20u01t1k28.jpg'},
							{ image: 'https://ww4.sinaimg.cn/mw690/008rOMXAgy1hom3fmylzmj313u1z2akp.jpg'},
							{ image: 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4n5peoj20u01t1wv7.jpg'},
							{ image: 'https://wx1.sinaimg.cn/mw690/b3b42fe1gy1hpq9ja81chj20yi22o43z.jpg'},
							{ image: 'https://wx4.sinaimg.cn/mw690/006xJGFdly1hptqlliahbj32hl5djnpd.jpg'},
							{ image: 'https://ww4.sinaimg.cn/mw690/9f4cb4b9gy1hpeopw0x9uj20rs1o6q7d.jpg'},
							{ image: 'https://img2.baidu.com/it/u=1932232343,3478732518&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'},
							{ image: 'https://img0.baidu.com/it/u=2424137384,2323500862&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F7d6f9419-cae4-4935-a7a6-150dccf979a2%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=d5fae6215ad7c9871f0e58f90b75cb1f'},
							{ image: 'https://wx1.sinaimg.cn/mw690/005XpTbZly1hpkp71sqhyj30u00u0t9w.jpg'},
							
						]
					},
					// // 第二个相册接着上一个相册展示
					{
						title: '第二组图片',
						value: [
							{ image: 'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0510%2F11290a01j00sd90qe001dd000hs00hsg.jpg&thumbnail=660x2147483647&quality=80&type=jpg'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fc81caf8e-7504-41eb-b63e-9450252b98f8%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=bef18ef0e96aa1ba347805b9e08724d9'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fccb90cb7-0a2d-4a68-b41f-54319bff7201%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=4bd9eddf5fba1cd0437fc189bc4a0d30'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F97ac0862-d51e-41db-a2de-3ed7e3ecdc87%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=ae425705c0141b0ab9fb8a3540df4872'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F2e39f371-b8b9-4863-bb08-e5d66cacfdfb%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=25653c00502332f0426c5e1eb72248bb'},
							{ image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F0eb85040-f43f-4d55-8290-00e0c6a1a671%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=2d4b61d6ea13f8a0ea0c59ef12aacb31'},
							{ image: 'https://ww1.sinaimg.cn/mw690/006cSilvgy1hoziqne3wsj30xv0yaqlh.jpg'},
							
							// { image: 'https://ww3.sinaimg.cn/mw690/c4877746ly1hped47ujslj21jk1jk4ah.jpg'},
							// { image: 'http://t14.baidu.com/it/u=3761916218,3768915686&fm=224&app=112&f=JPEG?w=500&h=500'},
							// { image: 'https://gips1.baidu.com/it/u=3177901985,1205098104&fm=3039&app=3039&f=JPEG?w=2048&h=2048'},
						]
					},
					
				]
				
			},500)
		},
		methods: {
			clickalbum(e) {
				console.log('点击：',e);
			}
		}
	}
</script>

<style>

</style>
