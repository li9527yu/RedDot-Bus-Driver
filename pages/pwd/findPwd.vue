<template>
	<view class="content">
			<view class="input-group">
				<view class="input-row">
					<text class="title">手机号：</text>
					<input type="number" maxlength="11" v-model="phone" placeholder="请输入手机号" class="is-input1 "  data-val="phone" />
				</view>
				<view class="input-row">
					<text class="title">验证码：</text>
					<input type="password" v-model="code" placeholder="请输入验证码" class="is-input1"  data-val="password"/>
					<button class="send-code-btn" @click="sendSmsCode" :disabled="clickable">{{codeDuration ? codeDuration + 's' : '发送验证码' }}</button>
					<!-- <view class="send-code-btn" @click="sendSmsCode">{{codeDuration ? codeDuration + 's' : '发送验证码' }}</view> -->
				</view>
				<view class="input-row">
					<text class="title">新密码：</text>
					<input type="password" v-model="newPassword" placeholder="请输入新密码" class="is-input1"   data-val="password"/>
				</view>				
				<view class="input-row">
					<text class="title">确认密码：</text>
					<input type="password" v-model="RenewPassword" placeholder="请确认密码" class="is-input1"   data-val="password"/>
				</view>				
			</view>		
		<view class="btn-row">
			<view class="loginbtn">
				<button  @click="findPassword">找回密码 </button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone:'',
				code:'',
				newPassword:'',
				RenewPassword:'',				
				codeDuration:0,
				codeInterVal:null,
				clickable:false
			}
		},
		methods: {
			sendSmsCode() {
				console.log(this.phone)
				if (this.codeDuration) {
					uni.showToast({
						title:`请在${this.codeDuration}秒后重试`,
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
				}
				if (!/^1\d{10}$/.test(this.phone)) {
					uni.showToast({
						title:'手机号填写错误',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return
				}
				
				uni.request({
					url:'http://mrbus.net:8888/api/user/smsCode'+'?phone='+this.phone,
					method:'POST',
					success: (res) => {
						console.log(res)
						if(res.statusCode==200){
							uni.showToast({
								title:'发送成功',
								icon:'none',
								mask:true,
								image:'../../static/img/success.png'
							})
							this.codeDuration = 60
							this.codeInterVal = setInterval(() => {
								this.clickable=true
								this.codeDuration--
								if (this.codeDuration === 0) {
									if (this.codeInterVal) {
										this.clickable=false
										clearInterval(this.codeInterVal)
										this.codeInterVal = null
									}
								}
							}, 1000)
						}else{
							uni.showToast({
								title:`${res.data.message}`,
								icon:'none',
								mask:true,
								image:'../../static/img/error.png'
							})
						}	
					},
					fail: (err) => {
						console.log(err)
						uni.showToast({
							title:'发送失败',
							icon:'none',
							mask:true,
							image:'../../static/img/error.png'
						})
					}
				})
				
			
			},
			findPassword() {
				if (!/^1\d{10}$/.test(this.phone)) {
					uni.showToast({
						title:'手机号填写错误',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return
				}
				else if (!/^\d{6}$/.test(this.code)) {
					uni.showToast({
						title:'验证码为6位纯数字',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return;
				}
				else if(this.newPassword.length<6)
				{
					// console.log(this.newPassword.length)
					uni.showToast({
						title:'密码最短为 6 个字符',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})				
					return;
				}
				else if(this.newPassword!=this.RenewPassword)
				{
					console.log(this.newPassword!=this.RenewPassword)
					
					uni.showToast({
						title:'两次输入密码不一致',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})	
					return;
				}
				else{
					uni.request({
							url:'http://mrbus.net:8888/api/driver/forget',
							data:{
								phone:this.phone,
								code:this.code,
								pw:this.newPassword
							},
							method:'POST',
							header:{
								"content-type":"application/json"
							},
							success: (res) => {
								console.log(res.data)
								if(res.data.status_code==200)
								{
									uni.showToast({
										title:'成功找回密码!',
										icon:'none',
										mask:true,
										image:'../../static/img/success.png'
									})
									uni.switchTab({
										url:'../ucenter/login'
									})
								}
								else
								{
									uni.showToast({
										title:`${res.data.message}`,
										icon:'none',
										mask:true,
										image:'../../static/img/error.png'
									})
								}
								
							},
							fail: (err) => {
								console.log(err)
								uni.showToast({
									title:'找回失败!',
									icon:'none',
									mask:true,
									image:'../../static/img/error.png'
								})
							}
						})
				}
				
				
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 10px;
	}
	
	.input-group {
		margin-top: 20px;
		position: relative;
		border: 1px solid #e2e2e2;
		border-radius: 10px;
	}
	
	.input-group::before {
		position: absolute;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		/* background-color: #c8c7cc; */
	}
	
	.input-group::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		 /* #ifndef APP-PLUS-NVUE */
		-webkit-transform: scaleY(.5);
		 /* #endif*/
		transform: scaleY(.5);
		/* background-color: #c8c7cc; */
	}
	
	.input-row {
		display: flex;
		flex-direction: row;
		position: relative;
		/* font-size: 18px; */
		line-height: 40px;
	}
	
	.input-row .title {
		width: 80px;
		padding-left: 15px;
	}
	
	.input-row.border::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 8px;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}
	
	.btn-row {
		margin-top: 25px;
		padding: 10px;
	}
	
	.send-code-btn {
		width: 120px;
		text-align: center;
		background-color: #f35;
		color: #FFFFFF;
		font-size: 14px;
		border: 1px solid #FFFFFF;
		border-radius: 20px;
		position: relative;
		margin-right: 0px;
	}
	/* button:after {
		border: 2rpx solid #f2f2f2;
	}
	
	.logoimg {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
	} */
	
	.is-input1 {
		height: 40px;
		/* height: 88rpx;
		width: 90%;
		line-height: 88rpx;
		padding: 12rpx; */
		color: #353535;
		/* font-size: 32rpx; */
		box-sizing: border-box;
		appearance: none;
		/* border: 2rpx solid #e5e5e5; */
		box-shadow: none;
		/* border-radius: 44rpx; */
		outline: 0;
		display: block;
		/* padding-left: 30rpx; */
		font-family: inherit;
		background: #fff;
		resize: none;	
		/* text-align: center; */
	}
	.loginbtn button {
		margin-top: 20rpx;
		height: 88rpx;
		width: 100%;
		line-height: 88rpx;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 44rpx;
		outline: 0;
		display: block;
		margin: 0;
		font-family: inherit;
		background: #f35;
		opacity: 0.8;
	}
	
</style>
