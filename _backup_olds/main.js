// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { state } from './state'
import Auth from './auth'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const VueResource = require('vue-resource')

Vue.use(VueResource)
Vue.use(BootstrapVue)
Vue.use(Auth)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  state,
  template: '<App/>',
  components: { App }
})
