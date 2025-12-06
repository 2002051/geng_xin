# lsj-album 相册照片墙，可弓形显示大小图
## 简单高性能 分组展示照片墙，支持本地临时路径和网络路径
### 提示：当前版本仅支持展示图片列表，后面有时间再加入视频。
### @啰嗦几句
1. 有问题交流群反馈(较少看消息)，或加Q群咨询
2. 交流群4：**413918560** (如满了就加其他群)
3. 交流群3：**667530868** (如满了就加其他群)
4. 交流群2：**469580165** (如满了就加其他群)
5. 交流群1：**701468256** (如满了就加其他群)
6. **如都满了就算了，没会员建不了新群。**
7. **如插件下方留言，五星必回，其他随缘。**

------------------


### Props

| 属性			| 是否必填	|  值类型	| 默认值				| 说明																|
| --------- 	| -------- 	| -----: 	| ---------: 		| :-----------------------------------:								|
| list			|	否 		| Arrar		| []				| 照片集合[查看示例](#p1)											|
| field			|	否 		| String	| 'url'				| list.value为对象数组时的图片字段key,例[{value:{url:'http...'}}]		|
| bigPicture	|	否 		| Boolean	| true				| 第一张图片或单一张图片时是否为大图展示														|
| foldNum		|	否 		| Number	| 9					| 图片较多时超过多少张自动折叠并显示余数，传0等于不折叠				|
| background	|	否 		| String	| '#333'			| 相册背景色															|
| round			|	否 		| String	| '0px'				| 图片边框圆角														|
| preview		|	否 		| Boolean	| true				| 点击图片是否打开预览												|
| position		|	否 		| String	| relative			| 相册定位模式，默认relative,无特殊情况建议使用默认值					|
| zIndex		|	否 		| Number	| 1					| 照片墙层级，默认1,无特殊情况建议使用默认值							|
| isUnfold		|	否 		| Boolean	| true					| 【1.2.1新增】是否可展开							|
| isReverse		|	否 		| Boolean	| false					| 【1.2.1新增】是否反方向显示大图							|
| noBigPicture	|	否 		| Boolean	| false					| 【1.2.1新增】是否不显示次级大图（传true时取消弓形大图模式）							|

### @Event
| 名称			| 返回				| 说明							|
| --------- 	| ---------: 		| :----------------: 			|
| onClick			| any				| 点击图片触发，返回当前项		|


# Vue Template示例
```vue
<template>
	<view>
		<lsj-album
			background="#fff"
			round="10rpx"
			field="url"
			:foldNum="9"
			:bigPicture="false"
			:preview="true"
			:list="list[tabIndex]"
			@onClick="clickalbum"
			/>
	</view>
</template>
```

# <a id="p1">images数据示例</a>
### JS
```javascript
export default {
	data() {
		return {
			show: false,
			images: [
				{
					title: '美丽的图片离不开精辟的标题',
					value: [
						// 支持非对象方式
						'https://img0.baidu.com/it/u=148131753,649968631&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=666',
						'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0229%2F146a652cj00s9lh240012d000hs00qnm.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
						'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0229%2F81282461j00s9lh24001gd000hs00qnm.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
						'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimage109.360doc.com%2FDownloadImg%2F2024%2F03%2F2207%2F281291804_4_20240322073231879.png&refer=http%3A%2F%2Fimage109.360doc.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1716949477&t=23acdfa2666281fb227814009966558b',
						'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0229%2Fe291600bj00s9lh24000sd000hs00qnm.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
						'https://img2.baidu.com/it/u=850708730,1816402586&fm=253&fmt=auto&app=138&f=JPEG?w=570&h=713',
						
						// 支持对象方式,注意：field需与对象内图片key一致
						{ url: 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4mnl59j20u01t1k28.jpg'},
						{ url: 'https://ww4.sinaimg.cn/mw690/008rOMXAgy1hom3fmylzmj313u1z2akp.jpg'},
						{ url: 'https://ww1.sinaimg.cn/mw690/60ed0cf7ly1hp6s4n5peoj20u01t1wv7.jpg'},
						{ url: 'https://wx1.sinaimg.cn/mw690/b3b42fe1gy1hpq9ja81chj20yi22o43z.jpg'},
						{ url: 'https://wx4.sinaimg.cn/mw690/006xJGFdly1hptqlliahbj32hl5djnpd.jpg'},
						{ url: 'https://ww4.sinaimg.cn/mw690/9f4cb4b9gy1hpeopw0x9uj20rs1o6q7d.jpg'},
						{ url: 'https://img2.baidu.com/it/u=1932232343,3478732518&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'},
						{ url: 'https://img0.baidu.com/it/u=2424137384,2323500862&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F7d6f9419-cae4-4935-a7a6-150dccf979a2%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=d5fae6215ad7c9871f0e58f90b75cb1f'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F6e6ad601-a5b4-4ab6-b512-7e67c8ccf604%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=1105de5ce2ac1236308a7a226c4ff281'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fc81caf8e-7504-41eb-b63e-9450252b98f8%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=bef18ef0e96aa1ba347805b9e08724d9'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fccb90cb7-0a2d-4a68-b41f-54319bff7201%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=4bd9eddf5fba1cd0437fc189bc4a0d30'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F97ac0862-d51e-41db-a2de-3ed7e3ecdc87%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=ae425705c0141b0ab9fb8a3540df4872'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F2e39f371-b8b9-4863-bb08-e5d66cacfdfb%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=25653c00502332f0426c5e1eb72248bb'},
						{ url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2F0eb85040-f43f-4d55-8290-00e0c6a1a671%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1720088680&t=2d4b61d6ea13f8a0ea0c59ef12aacb31'},
						{ url: 'https://ww1.sinaimg.cn/mw690/006cSilvgy1hoziqne3wsj30xv0yaqlh.jpg'},
						{ url: 'https://wx1.sinaimg.cn/mw690/005XpTbZly1hpkp71sqhyj30u00u0t9w.jpg'},
						{ url: 'https://ww3.sinaimg.cn/mw690/c4877746ly1hped47ujslj21jk1jk4ah.jpg'},
					]
				},
				{
					title: '',
					value: [
						'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0229%2F81282461j00s9lh24001gd000hs00qnm.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
						'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0229%2F146a652cj00s9lh240012d000hs00qnm.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
					]
				}
			]
		}
	}
}
```

