<template>
	<view class="album" :style="[{zIndex: zIndex,background: background,position: position,padding:padding}]">
		<view v-for="(item,i) in albumList" :key="i" class="album__content">
			<view v-if="item.title" class="album__content__title" :style="[{margin: getTitleMargin,zIndex: zIndex+1}]">
				<view class="indexText">
					{{ getIndexNum(i+1) }}
				</view>
				<view class="divisionLine">/</view>
				<view class="titleText line-clamp-2">{{ item.title }}</view>
			</view>
			<block v-for="(cell,j) in item.value" :key="j">
				<view class="album__flex">
					<view v-if="bigPicture && (j===0 || cell.length < 3)"
						class="flex__one">
						<block v-for="(o,k) in cell" :key="k">
							<block v-if="!foldArray[i] || getCurrToListIndex(i,o) < foldNum">
								<view class="flex__img">
									<image class="flex__img__fill" :style="[{borderRadius: round}]" :src="o.url"
										mode="aspectFill" @click.stop="previewImage(o)"></image>
									<view v-if="foldArray[i] && getCurrToListIndex(i,o) === foldNum - 1 && getResidualCount(i,o) > 0"
										class="more" :style="[{zIndex: zIndex+1,borderRadius: round}]" @click.stop="unfold(i)">
										+{{ getResidualCount(i,o) }}</view>
								</view>
							</block>
						</block>
					</view>
					<view v-else-if="j % 2 === 0 || noBigPicture" class="flex__below">
						<block v-for="(o,k) in cell" :key="k">
							<block v-if="!foldArray[i] || getCurrToListIndex(i,o) < foldNum">
								<view class="flex__img" :style="[{height: getImageHeight3}]">
									<image class="flex__img__fill" :style="[{borderRadius: round}]" :src="o.url"
										mode="aspectFill" @click.stop="previewImage(o)"></image>
									<view v-if="foldArray[i] && getCurrToListIndex(i,o) === foldNum - 1 && getResidualCount(i,o) > 0"
										class="more" :style="[{zIndex: zIndex+1,borderRadius: round}]" @click.stop="unfold(i)">
										+{{ getResidualCount(i,o) }}</view>
								</view>
							</block>
						</block>
					</view>
					<view v-else-if="(j === 1 || j % 4 === 1) && !isReverse" class="flex__left">
						<block v-for="(o,k) in cell" :key="k">
							<block v-if="!foldArray[i] || getCurrToListIndex(i,o) < foldNum">
								<view class="flex__img"
									:style="[{height: k===0 || cell.length<3 ? getImageHeight2 : getImageHeight3}]"
									:class="[{'flex__large':k===0,'insufficient':cell.length<3}]">
									<image class="flex__img__fill" :style="[{borderRadius: round}]" :src="o.url"
										mode="aspectFill" @click.stop="previewImage(o)"></image>
									<view v-if="foldArray[i] && getCurrToListIndex(i,o) === foldNum - 1 && getResidualCount(i,o) > 0"
										class="more" :style="[{zIndex: zIndex+1,borderRadius: round}]" @click.stop="unfold(i)">
										+{{ getResidualCount(i,o) }}</view>
								</view>
							</block>
						</block>
					</view>
					<view v-else class="flex__right">
						<block v-for="(o,k) in cell" :key="k">
							<block v-if="!foldArray[i] || getCurrToListIndex(i,o) < foldNum">
								<view class="flex__img"
									:style="[{height: k===cell.length-1 || cell.length<3 ? getImageHeight2 : getImageHeight3}]"
									:class="[{'flex__large':k===cell.length-1,'insufficient':cell.length<3}]">
									<image class="flex__img__fill" :style="[{borderRadius: round}]" :src="o.url"
										mode="aspectFill" @click.stop="previewImage(o)"></image>
									<view v-if="foldArray[i] && getCurrToListIndex(i,o) === foldNum - 1 && getResidualCount(i,o) > 0"
										class="more" :style="[{zIndex: zIndex+1,borderRadius: round}]" @click.stop="unfold(i)">
										+{{ getResidualCount(i,o) }}</view>
								</view>
							</block>
						</block>
						
					</view>
				</view>
			</block>
		</view>
	</view>
</template>
<script>
	/**
	 * LSJ.仿蜂窝网弓形相册照片墙
	 * @description 弓形相册照片墙,支持网络和本地url，图片和视频
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=17913
	 * @property {Array} list 图片列表，格式 [{title: '相册标题', value: [{url: ''},{url: ''}]}]
	 * @property {String} field list.value为对象数组时的图片字段key
	 * @property {Boolean} bigPicture 第一张图片或单一张图片时是否为大图展示
	 * @property {Number} foldNum 图片较多时超过多少张自动折叠并显示余数，传0等于不折叠
	 * @property {String} background 相册背景色
	 * @property {String} round 图片边框圆角，默认0px
	 * @property {Boolean} preview 是否允许预览
	 * @property {String} position 相册定位模式，默认relative
	 * @property {Number} zIndex 相册zIndex层级
	 * @example 
		 <lsj-album
			background="#fff"
			round="10rpx"
			field="url"
			:foldNum="9"
			:bigPicture="false"
			:preview="true"
			:list="list[tabIndex]"
		 @click="clickalbum"
		 />
	 */
	export default {
		props: {
			padding: {
				type: String,
				default: '10rpx'
			},
			list: {
				type: Array,
				default: () => []
			},
			field: {
				type: String,
				default: 'url'
			},
			position: {
				type: String,
				default: 'relative'
			},
			zIndex: {
				type: Number,
				default: 1
			},
			foldNum: {
				type: Number,
				default: 9
			},
			bigPicture: {
				type: Boolean,
				default: true
			},
			round: {
				type: [String,Number],
				default: '0px'
			},
			background: {
				type: String,
				default: '#333'
			},
			preview: {
				type: Boolean,
				default: true
			},
			maxWidth: {
				type: String,
				default: '750rpx'
			},
			// 是否可展开
			isUnfold: {
				type: Boolean,
				default: true
			},
			// 是否反方向显示大图
			isReverse: {
				type: Boolean,
				default: false
			},
			// 不显示大图
			noBigPicture: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				foldArray: [],
				closeIcon: 'data:image/png;base64,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'
			}
		},
		computed: {
			getImageHeight2() {
				return `calc(${this.maxWidth} - (${this.maxWidth} / 3) - 10rpx)`;
			},
			getImageHeight3() {
				return `calc(${this.maxWidth} / 3 - 10rpx)`;
			},
			getTitleMargin() {
				if (this.bigPicture) {
					return '50rpx 0';
				}
				return '0';
			},
			albumList() {
				let arr = this.list.map((item,listIndex) => {
					let index = 0;
					let count = 3;
					let arrTemp = [];
					if (this.bigPicture) {
						let [one, ...experts] = item.value;
						for (let i = 0; i < experts.length; i++) {
							index = parseInt(i / count);
							if (arrTemp.length <= index) {
								arrTemp.push([]);
							}
							arrTemp[index].push({
								_lId: listIndex + '_' + i,
								url: experts[i][this.field] || experts[i],
								type: experts[i]?.type || 'image',
								value: experts[i]
							})
						}
						arrTemp.unshift([{
							_lId: listIndex + '_one_',
							url: one[this.field] || one,
							type: one?.type || 'image',
							value: one
						}]);
					} else {
						let experts = item.value;
						for (let i = 0; i < experts.length; i++) {
							index = parseInt(i / count);
							if (arrTemp.length <= index) {
								arrTemp.push([]);
							}
							arrTemp[index].push({
								_lId: listIndex + '_' + i,
								url: experts[i][this.field] || experts[i],
								type: experts[i]?.type || 'image',
								value: experts[i]
							})
						}
					}

					return {
						title: item.title,
						value: arrTemp
					}
				})
				return arr;
			}
		},
		watch: {
			list: {
				handler(newVal, oldVal) {
					this.foldArray = newVal.map(item => !!this.foldNum);
				},
				deep: true,
				immediate: true
			}
		},
		methods: {
			unfold(index) {
				if (!this.isUnfold) {
					this.$emit('onClick',{});
					return;
				}
				this.foldArray[index] = false;
			},
			getCurrToListIndex(i,o) {
				return this.albumList[i].value.flatMap(_=>_).findIndex(_=>_._lId===o._lId);
			},
			getResidualCount(i,o) {
				return this.albumList[i].value.flatMap(_=>_).length - this.foldNum;
			},
			getIndexNum(i) {
				if (i > 9) {
					return i;
				}
				return '0' + i;
			},
			previewImage(o) {
				this.$emit('onClick',o.value)
				if (!this.preview) {return;}
				let current = this.albumList.flatMap(_=>_.value).flatMap(_=>_).findIndex(_=>_._lId===o._lId);
				let urls = this.list.flatMap(item => item.value.flatMap(_ => _[this.field] || _));
				uni.previewImage({
					urls,
					current,
					showmenu: false,
					indicator: 'number',
				});
			}
		}
	}
</script>
<style scoped lang="scss">
	.line-clamp-2 {
	  overflow: hidden;
	  display: -webkit-box;
	  -webkit-box-orient: vertical;
	  -webkit-line-clamp: 2;
	} 
	.album {
		top: 0;
		left: 0;
		right: 0;
		box-sizing: border-box;

		.closeable {
			position: fixed;
			top: calc(var(--window-top) + 30rpx);
			right: 30rpx;

			.close {
				width: 40rpx;
				height: 40rpx;
			}
		}

		&__content {
			position: relative;

			&__title {
				position: absolute;
				left: 0;
				max-width: 100%;
				height: 120rpx;
				padding: 0 30rpx;
				display: grid;
				grid-template-columns: 4.3em 20px auto;
				align-items: center;

				.indexText {
					font-size: 100rpx;
					font-weight: bold;
					color: rgba(255, 255, 255, .5);
					font-style: italic;
					text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);
				}

				.divisionLine {
					font-size: 40rpx;
					font-weight: bold;
					color: rgba(255, 255, 255, .5);
				}

				.titleText {
					font-size: 36rpx;
					font-weight: bold;
					color: rgba(255, 255, 255, .8);
					text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);
				}
			}
		}

		&__flex {
			.flex__one {
				display: grid;
				grid-template-columns: auto;
				gap: 0px 10rpx;

				.flex__img {
					position: relative;
					vertical-align: bottom;
					flex: 1;
					width: 100%;
					height: 730rpx;
					display: flex;
					margin-bottom: 10rpx;
					&__fill {
						width: 100%;
						flex: 1;
						height: 100%;
					}
				}
			}

			.flex__below,
			.flex__left,
			.flex__right {
				width: 100%;
				display: grid;
				grid-template-columns: auto auto auto;
				gap: 0px 10rpx;

				.flex__img {
					position: relative;
					width: 100%;
					// height: calc(750rpx / 3 - 10rpx);
					vertical-align: bottom;
					display: flex;
					margin-bottom: 10rpx;
					&__fill {
						width: 100%;
						flex: 1;
						height: 100%;
					}

				}
			}

			.flex__left,
			.flex__right {
				.flex__large {
					grid-column: 1 / 3;
					grid-row: 1 / 3;

					&.flex__img {
						width: 100%;
						// height: calc(750rpx - (750rpx / 3) - 10rpx);
					}
				}
			}

			.flex__left {
				.insufficient {
					// height: calc(750rpx - (750rpx / 3) - 10rpx);
				}
			}

			.flex__right {
				.flex__large {
					grid-column-start: 2;
					grid-column-end: 4;
				}

				.insufficient {
					// height: calc(750rpx - (750rpx / 3) - 10rpx);
				}
			}

			.more {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-color: rgba(0, 0, 0, .4);
				color: #fff;
				font-size: 34rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
</style>