<template>
	<view>
		<button @click="scan">扫码</button>
		<!-- <camera mode="scanCode" device-position="back" flash="off"  @scancode="takeCode"></camera> -->
		{{result}}
	</view>
</template>

<script>
	export default {
		data() {
			return {
				result: "",
				userInfo:[{type:'',ans:''}]
			}
		},
		methods: {
			// takeCode: (e) => {
			//     if(scanFunctionIsUseable) {
			//         this.scanFunctionIsuseable = false;
			//         // 对扫码结果进行处理
			//         console.log(e.detail.result);
			
			//         // 扫码间隔两秒
			//         setTimeout(() => {
			//         this.scanFunctionIsUseable = true;
			//         }, 2000)
			//     }
			// }
			scan: () => {
				var that=this;
				uni.scanCode({
				    onlyFromCamera: true,
				    success: function (res) {
						// that.$set(that.userInfo,'type':)
						// that.userInfo.push({type:res.scanType,ans:res.result})
				        console.log('条码类型：' + res.scanType);
				        console.log('条码内容：' + res.result);
				    }
				});
				// console.log(that.userInfo[0])
			}
		}
	}
</script>

<style>

</style>
