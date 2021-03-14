<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		onLaunch: function () {
			uni.getStorage({
				key:'user',
				success: (res) => {						
					this.login(res.data)						
					console.log(res.data)
				},
				fail: (err) => {
					console.log(err)
				}
			})
			console.log('App Launch')
		},
		onShow: function () {
			console.log('App Show')
		},
		onHide: function () {
			console.log('App Hide')
		},
		methods: {
			...mapMutations(['login']),
		}
	}
</script>

<style>
	/*每个页面公共css */

	/* @import "./static/css/simplepro.css";
	 */
</style>
