<template>
	<view class="PageContent">
		<view class="head">
			<view class="TopImg">
				<!-- <image src="../../static/img/common/logo.jpg" mode="aspectFit" class="logoimg"></image> -->
				<image src="../../static/img/bus.png"></image>
			</view>
		</view>
		<view class="Driver" v-if="isLogin">
			<text class="driverInfo">你好！<text style="color: #FF3355; font-size: 30px;">{{userId}}</text>号驾驶员</text>
			<button class="driverButton"  @tap="logout">退出登录</button>
		</view>
		<view v-else class="content">
			<view class="login-type">
				<view v-for="(item,index) in loginTypeList" :key="index" @click="loginType = index" :class="{act: loginType === index}"
				 class="login-type-btn">{{item}}</view>
			</view>
			<view class="input-group " v-if="loginType === 0">
				<view class=" input-row ">
					<input type="number" maxlength="11" v-model="login.phone" placeholder="请输入手机号" class="is-input1 " data-val="phone" />
				</view>
				<view class=" input-row">
					<input type="password" v-model="login.password" placeholder="请输入登录密码" class="is-input1"  data-val="password"/>
				</view>
			</view>
			<view class="input-group" v-else>
				<view class="input-row">
					<input type="number" maxlength="11" v-model="login.phone" placeholder="请输入手机号" class="is-input1 "  data-val="phone" />
				</view>
				<view class="input-row " id="codeClass">
					<input type="password" v-model="code" placeholder="请输入验证码" class="is-input1"  data-val="password"/>
					<!-- <view class="send-code-btn" @click="sendSmsCode">{{codeDuration ? codeDuration + 's' : '发送验证码' }}</view> -->
					<button class="send-code-btn" @click="sendSmsCode" :disabled="clickable">{{codeDuration ? codeDuration + 's' : '发送验证码' }}</button>
				</view>
			</view>
			<view class="login">
				<button :loading="login.loading" @tap="bindLogin()" class="loginbtn"> {{ login.loading ? "登录中...":"登 录"}} </button>
			</view>
			<view class="footer">
				<navigator url="../pwd/findPwd" class="linkText" hover-class="">
					<text>忘记密码？</text><text class="linkBack">点击找回</text>
				</navigator>
			</view>
		</view>
		
	</view>
</template>

<script>
	import store from '@/store/index.js';//需要引入store
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				code:'',
				loginType: 0,
				loginTypeList: ['密码登录','免密登录'],
				login: {
					loading: false,
					phone:"",
					password:""
				},
				codeDuration: 0,
				codeInterVal:null,
				clickable:false

			};
		},
		computed: {
			...mapState(['isLogin','userId'])
		},
		methods:{
			sendSmsCode() {
				console.log(this.login.phone)
				if (this.codeDuration) {
					uni.showToast({
						title:`请在${this.codeDuration}秒后重试`,
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					
				}
				if (!/^1\d{10}$/.test(this.login.phone)) {
					uni.showToast({
						title:'手机号填写错误',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return
				}
				uni.request({
					url:'http://mrbus.net:8888/api/user/smsCode'+'?phone='+this.login.phone,
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
			loginBySms() {
				if (!/^1\d{10}$/.test(this.login.phone)) {					
					uni.showToast({
						title:'手机号填写错误',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return
				}
				if (!/^\d{6}$/.test(this.code)) {					
					uni.showToast({
						title:'验证码为6位纯数字',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return;
				}
				this.login.loading = true;
				setTimeout((e=>{
					this.login.loading = false;
				}),1500);
				uni.request({
					url:'http://mrbus.net:8888/api/driver/login2',
					data:{
						phone:this.login.phone,
						code:this.code
					},
					method:'POST',
					header:{
						"content-type":"application/json"
					},
					success: (res) => {
						console.log(res.data)
						if(res.data.status_code==200){							
							uni.showToast({
								title:'登录成功',
								icon:'none',
								mask:true,
								image:'../../static/img/success.png'
							})
							store.commit("login",res.data.data)
							uni.switchTab({
								url:'../home/home'
							})
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
						uni.showToast({
							title:'登录失败！',
							icon:'none',
							mask:true,
							image:'../../static/img/error.png'
						})
					}
				})
				
			},
			bindLogin() {
				// console.log(this.loginType)
				switch (this.loginType) {
					case 0:
						this.defaultHandlerLogin()
						break;
					case 1:
						this.loginBySms()
						break;
					default:
						break;
				}
			},
			defaultHandlerLogin:function(){
				if (!/^1\d{10}$/.test(this.login.phone)) {
					uni.showToast({
						title:'手机号填写错误',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return
				}
				if (this.login.password.length < 6) {
					
					uni.showToast({
						title:'密码最短为 6 个字符',
						icon:'none',
						mask:true,
						image:'../../static/img/error.png'
					})
					return;
				}
				this.login.loading = true;
				setTimeout((e=>{
					this.login.loading = false;
				}),1500);
				// console.log(JSON.stringify(this.login));
				uni.request({
					url: "http://mrbus.net/api/driver/login",
					method: "POST",
					header: {
						"Content-Type": "application/json"
					},
					data: {
						"phone": this.login.phone,
						"password": this.login.password
					},
					success: res => {
						console.log(res.data);
						if(res.data.status_code===200) {
							uni.showToast({
								title:'登录成功!',
								icon:'none',
								mask:true,
								image:'../../static/img/success.png'
							})
							store.commit("login",res.data.data)
							console.log(res.data.data)
							uni.switchTab({
								url:"../home/home2"
							})
						}
						else{
							uni.showToast({
								title:`${res.data.message}`,
								icon:'none',
								mask:true,
								image:'../../static/img/error.png'
							})
						}
						
					},
					fail: (err) => {
						uni.showToast({
							title:'登录错误',
							icon:'none',
							mask:true,
							image:'../../static/img/error.png'
						})
					}
				});
			},
			BindInput:function(e){
				var dataval = e.currentTarget.dataset.val;
				this.login[dataval] = e.detail.value; 
			},
			logout:function(){
				uni.showModal({
					content:'确认退出？',
					success: (res) => {
						if(res.confirm)
						{
							store.commit('loginout')
							uni.showToast({
								title:'退出成功！',
								icon:'none',
								mask:true,
								image:'../../static/img/success.png'
							})
						}
					}
				})
				
				// store.commit("clear");
				// try {
				//     uni.clearStorageSync();
				// } catch (e) {
				//     // error
				// }
				// uni.switchTab({
				// 	url:"../home/home"
				// })
				// uni.refresh();
			}
		}
	}
</script>

<style>
	.PageContent{
		overflow: hidden;
		width: 100vw;
		height: 100vh;
	}
	.content {
		width: 90%;
		margin: 0 auto;
	}
	.head{
		width:100%;
	}
	.TopImg{
		width: 100%;
		margin: 0 auto;
		text-align: center;
	}
	.TopImg image{
		width: 90%;
		height: 45vh;
	}
	.Driver{
		width: 100%;
		/* height: 50px; */
		/* border: 1px solid #000000; */
		display: flex;
		flex-direction: column;
	}
	.driverInfo, .driverButton{
		flex: 1;
		
	}
	.driverInfo{
		font-size: 22px;
		font-weight: 400;
		color: #000000;
		font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
		text-align: center;
		/* border: 1px solid #000000; */
	}
	.driverButton{
		margin-top: 30px;
		width: 90%;
		height: 50px;
		background-color: #f7163f;
		color: #FFFFFF;
		font-size: 22px;
		line-height: 50px;
		text-align: center;
	}
	.login-type {
		display: flex;
		justify-content: center;
	}
	
	.login-type-btn {
		line-height: 30px;
		margin: 0px 15px;
	}
	
	.login-type-btn.act {
		color: #f35;
		border-bottom: solid 1px #f35;
	}
	
	.input-group {
		margin-top: 20px;
		position: relative;
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
		margin-top: 10px;
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
	.send-code-btn {
		/* width: 120px; */
		font-size: 16px;
		text-align: center;
		background-color: #f35;
		color: #FFFFFF;
		border: 1px solid #FFFFFF;
		border-radius: 20px;
		position: absolute;
		margin-right: 0px;
		right: 0;
	}
	.login{
		width: 100%;
		margin: 0 auto;
		padding-top: 10px;
	}
	.loginbtn{
		
		height: 88rpx;
		width: 90%;
		line-height: 88rpx;
		color: #ffffff;
		font-size: 18px;
		border-radius: 44rpx;
		outline: 0;
		display: block;
		font-family: inherit;
		background: #f35;
		opacity: 0.8;
	}

	button:after {
		border: 2rpx solid #f2f2f2;
	}

	.logoimg {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
	}

	.is-input1 {
		height: 88rpx;
		width: 100%;
		line-height: 88rpx;
		padding: 12rpx;
		color: #353535;
		font-size: 32rpx;
		box-sizing: border-box;
		appearance: none;
		border: 2rpx solid #e5e5e5;
		box-shadow: none;
		border-radius: 44rpx;
		outline: 0;
		display: inline-block;
		padding-left: 30rpx;
		margin: 0;
		font-family: inherit;
		background: #fff;
		resize: none;
	}
	.footer{
		height: 20vh;
		margin-top: 10px;
	}
	.linkBack{
		color: #2A62FF
	}
	.linkText{
		 border-radius: 8rpx;
		 text-align: right;
		 color: #888888;
		 margin-right: 40rpx;
	}
</style>
