import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
  //       isloginStatus: uni.getStorageSync('user')?true:false,
		// userId: uni.getStorageSync('user')?uni.getStorageSync('user').user.id:false,
		// token: uni.getStorageSync('user')?uni.getStorageSync('user').token:""
		isLogin:false,
		userId:'',
		token:'',
    },
    mutations: {
        login(state, provider) {			
            state.isLogin = true;
            state.userId = provider.user.id;
            state.token = provider.token;
			uni.setStorage({
				key:'user', 
				data:provider
			});
        },
		loginout(state) {
			state.isLogin = false
			state.userId = '';
			state.token = '';
			uni.removeStorage({
				key:'user'
			})
		}
    },
})

export default store