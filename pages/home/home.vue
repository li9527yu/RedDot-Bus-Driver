<template>
	<view>
		<view class="page-body">
			<view class="page-section page-section-gap">
				<map style="width: 100%; height: 300px;" :latitude="latitude" :longitude="longitude" :markers="covers">
				</map>
			</view>
			<view class="operation">
				<view class="routeState">
					<text class="reState">{{isrecord?'正在记录中.....':'未开始记录'}}</text>
					<!-- <text class="reState" v-show="!isrecord">未开始记录</text>
					<text class="reState" v-show="isrecord">正在记录中.....</text> -->
				</view>
				<view class="route">
					<button class="routeButton ButtonStart" @click="start()">开始记录</button>
					<button class="routeButton ButtonEnd" @click="stop()">停止记录</button>
				</view>
				
			</view>
			<view class="scanCode">
				<button class="CodeClick" @click="scan">乘客扫码</button>
			</view>
			<!-- <view v-for="item in passengerInfo">{{item}}</view> -->
		</view>
	</view>
</template>

<script>
	// let mapSearch = weex.requireModule('mapSearch')
	import { TransCj02 } from "../../common/wgs84_to_gcj02.js";
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import format from '../../common/format.js'
	export default {	
		data(){
			return {
				id: 0, // 使用 marker点击事件 需要填写id
				title: 'map',
				latitude:0.0,
				longitude:0.0,
				interval: null,
				covers: [
					{
						latitude: 0.0,
						longitude: 25.3,
						iconPath: '../../static/location.png',
						width:40,
						height:40
					}
				],
				isrecord:false,
				passengerInfo:[],
				timer:null,
				socketTask: null,
				// 确保websocket是打开状态
				is_open_socket: false,
				 g_wakelock:null
			}
		},
		computed:{
			...mapState(['isLogin','userId'])
		},
		beforeDestroy() {
			this.closeSocket();
				this.releaseWakeLock()
		},
		onLoad() {
			this.wakeLock()
		},
		onPullDownRefresh() {
			this.getLocation()
			console.log('getlocation')
			setTimeout(function(){
				uni.stopPullDownRefresh()
			},1000)
		},
		onShow() {
			this.getLocation()
			this.handleNotice()	
			if(!this.isLogin)
			{
				this.loginOrNot()		
			}
			// console.log(this.userId)
			// var boardTime=new Date();
			// boardTime=format(boardTime,'YYYY-MM-DD HH:mm');
			// console.log(boardTime)
		},
		methods: {
			start: function(){
				if(!this.isLogin)
				{
					uni.showModal({
						content:'您还未登录！请先登录',
						showCancel:false
					})
					return;
				}
				else{
					if(!this.isrecord){
						uni.showModal({
							content:'确认开始进行行驶记录？',
							success: (res) => {
								if(res.confirm)
								{
									var that=this;
									this.connectSocketInit();
									this.isrecord=true
									this.interval = setInterval(() => {
										that.getLocation()
									}, 500);									
								}
							}
						})
					}	
				}
							
			},
			stop: function(){
				if(!this.isLogin)
				{
					uni.showModal({
						content:'您还未登录！请先登录',
						showCancel:false
					})
					return;
				}
				else
				{
					if(!this.isrecord){
						uni.showToast({
							title:'还未开始记录!',
							icon:'none',
							mask:true,
							image:'../../static/img/alert.png'
						})
					}
					else{
						uni.showModal({
							content:'确认结束行驶？',
							confirmColor:'#f35',
							success: (res) => {
								if(res.confirm){
									clearInterval(this.interval)
									this.isrecord=false
									this.closeSocket();
									uni.showToast({
										title:'连接关闭',
										icon:'none',
										mask:true,
										image:'../../static/img/success.png'
									})
								}
							}
						})
					}
					
				}
				
				
			},
			scan(){
				if(!this.isLogin)
				{
					uni.showModal({
						content:'您还未登录！请先登录',
						showCancel:false
					})
					return;
				}
				else
				{
					var that=this;
					uni.scanCode({
					    onlyFromCamera: true,
					    success: function (res) {
							var info=res.result;
							uni.request({
								url:'http://mrbus.net:8888/api/user/decode/'+info,
								header:{
									"Content-Type":"application/json"
								},
								method:'GET',
								success: (res) => {
									uni.showLoading({
										title:'正在加载中',
										mask:true,
									})
									var InfoItem={};
									var boardTime=new Date();
									boardTime=format(boardTime,'YYYY-MM-DD HH:mm:ss');
									// console.log(boardTime)
									// console.log(res.data)
									InfoItem.time=boardTime;
									InfoItem.id=res.data.data;
									InfoItem.driver=that.userId
									console.log(InfoItem)
									uni.request({
										url:'http://mrbus.net:8888/api/order/fixed',
										data:{
											date:InfoItem.time,
											driver_id:InfoItem.driver,
											user_id:InfoItem.id
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
													title:'扫码成功!',
													icon:'none',
													mask:true,
													image:'../../static/img/success.png'
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
												title:'扫码失败!',
												icon:'none',
												mask:true,
												image:'../../static/img/error.png'
											})
										}
									})
									// console.log(InfoItem)
									// that.passengerInfo.push(InfoItem)
									
									setTimeout(function(){
										uni.hideLoading()										
									},1000)	
								}
								
							})
					    }
					});
				}
				
			},
			loginOrNot(){
				if(!this.isLogin)
				{
					uni.showModal({
						content:'您还未登录，是否现在登录？',
						confirmText:'登录',
						success: (res) => {
							if(res.confirm)
							{
								console.log('login')
								uni.switchTab({
									url:'../ucenter/login'
								})
							}
						}
					})
				}
			},
			connectSocketInit() {
				var that=this;
				// 创建一个this.socketTask对象【发送、接收、关闭socket都由这个对象操作】
				this.start_socket=true
				this.socketTask = uni.connectSocket({
					// 【非常重要】必须确保你的服务器是成功的,如果是手机测试千万别使用ws://127.0.0.1:9099【特别容易犯的错误】
					url: "ws://mrbus.net:8888/api/map/driver/"+that.userId,
					success(data) {
						console.log("websocket连接成功");
					},
				});
				
				// 消息的发送和接收必须在正常连接打开中,才能发送或接收【否则会失败】
				this.socketTask.onOpen((res) => {
					console.log("WebSocket连接正常打开中...！");
					that.is_open_socket = true;
						uni.showToast({
							title:'连接成功！',
							icon:'none',
							mask:true,
							image:'../../static/img/success.png'
						})
					// 注：只有连接正常打开中 ，才能正常成功发送消息
						// setTimeout(function(){
							// setInterval(function(){
								var local={
									x:this.longitude,
									y:this.latitude
								}
								local=JSON.stringify(local)
								console.log(local)
								// console.log(`x:${that.longitude},y:${that.latitude}`)
								if(that.timer==null)
								{
									that.timer=setInterval(function(){
										console.log(`x:${that.longitude},y:${that.latitude}`)
										that.socketTask.send({
											data:local
										});
									},500)
								}
							// },1000)
						// },1000)
					// 注：只有连接正常打开中 ，才能正常收到消息
					// this.socketTask.onMessage((res) => {
					// 	console.log("收到服务器内容：" + res.data);
					// });
				})
				// 这里仅是事件监听【如果socket关闭了会执行】
				
				this.socketTask.onClose(() => {
					console.log("已经被关闭了")
				})
			},
			// 关闭websocket【离开这个页面的时候执行关闭】
			closeSocket() {
				var that=this;
				// this.timer=null;
				clearInterval(this.timer)
				this.timer = null
				this.socketTask.close({
						success(res) {
							that.is_open_socket = false;
							console.log("关闭成功", res)
						},
						fail(err) {
							console.log("关闭失败", err)
						}
					})
			},
			handleNotice(e){
				let system = uni.getSystemInfoSync();// 获取系统信息
				// console.log(JSON.stringify(system));
				if (system.platform === 'android') { // 判断平台
					var context = plus.android.importClass("android.content.Context");
					var locationManager = plus.android.importClass("android.location.LocationManager");
					var main = plus.android.runtimeMainActivity();
					var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
					if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
						uni.showModal({
							title: '提示',
							content: '请打开定位服务功能',
							showCancel: false, // 不显示取消按钮
							success() {
								if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
									var Intent = plus.android.importClass('android.content.Intent');
									var Settings = plus.android.importClass('android.provider.Settings');
									var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS); 
									main.startActivity(intent); // 打开系统设置GPS服务页面
								} else {
									console.log('GPS功能已开启');
								}
							}
						});
					}
				} 
				// uni.navigateTo({
				// 		url: './../tabBar-3/notice/notice_list?type=1&userId='+_self.userInfo.userId
				// });
			},
			getLocation(){
				uni.getLocation({
				    // type: 'wgs84',
				    type:'gcj02',
					success: (res) => {
						
						console.log(`lon:${res.longitude},lat:${res.latitude}`)
						var ans=TransCj02(res.latitude,res.longitude);
						console.log(`${ans[1]},${ans[0]}`)
						//ans[0]:lon ans[1]:lat
				       this.covers=[
				       	{
				       		latitude: res.latitude,
				       		longitude: res.longitude,
				       		iconPath: '../../static/location.png',
							width:40,
							height:40
				       	}
				       ]
				       this.latitude =res.latitude;
				       this.longitude =res.longitude;	
				    }
				});
			},
			wakeLock() {  
			    //Android  
			    var main = plus.android.runtimeMainActivity();  
			    var Context = plus.android.importClass("android.content.Context");  
			    var PowerManager = plus.android.importClass("android.os.PowerManager");  
			    var pm = main.getSystemService(Context.POWER_SERVICE);  
			    this.g_wakelock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ANY_NAME");  
			    this.g_wakelock.acquire();  
			},
			releaseWakeLock () {  
			    if(this.g_wakelock != null && this.g_wakelock.isHeld()) {  
			        this.g_wakelock.release();  
			        this.g_wakelock = null;  
			    }  
			}  
		},
	}
</script>

<style>
	.operation{
		margin-top: 5px;
		border: 2px solid;
		border-color: rgba(255, 51, 85,0.5);
		border-radius: 10px;
		padding-top: 5px;
		/* padding-bottom: 5px; */
	}
	.route{
		display: flex;
		/* flex-direction: column; */
		margin-top: 10px;
	}
	.reState{
		font-size: 18px;
		font-weight: 400;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		width: 100%;
		height: 32px;
		line-height: 32px;
	}
	.routeState{
		display: block;		
		text-align: center;
		
	}
	.routeButton{
		flex: 1;
		font-size: 22px;
		font-weight: 400;
		color: #FFFFFF;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		border: 1px solid #FFFFFF;
		height: 80px;
		text-align: center;
		line-height: 80px;
	}
	.ButtonStart{
		background-color: #0FAEFF;
	}
	.ButtonEnd{
		background-color: #f35;
	}
	.scanCode{
		display: flex;
	}
	.CodeClick{
		width: 100%;
		height: 70px;
		line-height: 70px;
		font-size: 22px;
		font-weight: 500;
		color: #FFFFFF;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		border: 1px solid #FFFFFF;
		border-radius: 10px;
		background-color: #ffdf69;
	}
</style>
