import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import PostsManager from '@/components/PostsManager'

// import Auth from '@/auth'
// Vue.use(Auth, {
//  issuer: 'https://dev-697581.oktapreview.com/oauth2/default',
//  client_id: '0oaehwendoizVlir00h7',
//  redirect_uri: 'https://www.camidi.de/implicit/callback',
//  scope: 'openid profile email'
// })
//   {
//     path: '/implicit/callback',
//     component: Auth.handleCallback()
//   },

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/posts-manager',
      name: 'PostsManager',
      component: PostsManager,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

// router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
