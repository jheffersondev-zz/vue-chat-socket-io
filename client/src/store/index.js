import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: localStorage.getItem("username"),
  },
  mutations: {
    newUsername (state, newNick) {
      state.username = newNick
      localStorage.setItem("username", newNick)
    }
  },
  actions: {
    SetUsername(context, newUsername) {
      context.commit("newUsername", newUsername)
    }
  },
  getters: {
    $username(state){
      return state.username;
    }
  }
})
