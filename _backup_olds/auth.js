import Vue from 'vue'
import router from './router'
import { state } from './state'
import VueResource from 'vue-resource'

Vue.use(VueResource)
/**
 * @var{string} LOGIN_URL The endpoint for logging in.
 */
const LOGIN_URL = '/api/auth'

/**
 * @var{Object} AUTH_BASIC_HEADERS The options to pass into a Vue-resource http call. Includes
 *    the headers used for login and emulateJSON flag 
 */
const AUTH_BASIC_HEADERS = {
  headers: {
    'Authorization': 'Bearer ' + localStorage.token
  },
  emulateJSON: true
}

/**
* Auth Plugin
*
* Handles login and token authentication using OAuth2.
*/
export default {

  /**
   * Install the Auth class.
   *
   * Creates a Vue-resource http interceptor to handle automatically adding auth headers
   * Then attaches this object to the global Vue (as Vue.auth).
   *
   * @param {Object} Vue The global Vue.
   * @param {Object} options Any options we want to have in our plugin.
   * @return {void}
   */
  install (Vue, options) {
    Vue.http.interceptors.push((request, next) => {
      const token = state.auth.accessToken
      const hasAuthHeader = request.headers.has('Authorization')

      if (token && !hasAuthHeader) {
        this.setAuthHeader(request)
      }

      next((response) => {
        if (this._isInvalidToken(response)) {
          return this._refreshToken(request)
        }
      })
    })

    Vue.prototype.$auth = {
	  /**
      * Login
      *
      * @param {Object.<string>} creds The username and password for logging in.
      * @param {string|null} redirect The name of the Route to redirect to.
      * @return {Promise}
      */
     login (creds, redirect) {
       const params = { 'grant_type': 'password', 'email': creds.username, 'password': creds.password }

	   // debug
	   console.error('login()-Aufruf', err);

       return Vue.http.post(LOGIN_URL, params, AUTH_BASIC_HEADERS)
         .then((response) => {
         this._storeToken(response)

         if (redirect) {
           router.push({ name: redirect })
         }

         return response
       })
       .catch((errorResponse) => {
         return errorResponse
       })
    },
    
    /**
    * Logout
    *
    * Clear all data in our App (which resets logged-in status) and redirect back
    * to login form.
    *
    * @return {void}
    */
    logout () {
      Vue.commit('CLEAR_ALL_DATA')
      router.push({ name: 'login' })
    },

    /**
    * Check if the Vue-resource Response is an invalid token response.
    *
    * @private
    * @param {Response} response The Vue-resource Response instance received from an http call.
    * @return {boolean}
    */
    isAuthenticated (response, desire) {
      const status = response.status
      const error = response.data.error
      const permissions = response.data.permissions

      return (status === 401 && (error === 'invalid_token' || error === 'expired_token') && permissions[desire]))
  }
    
    } // Vue.prototype.$auth
  },
  
  /**
   * Set the Authorization header on a Vue-resource Request.
   *
   * @param {Request} request The Vue-Resource Request instance to set the header on.
   * @return {void}
   */
  setAuthHeader (request) {
    request.headers.set('Authorization', 'Bearer ' + state.auth.accessToken)
    // The demo Oauth2 server we are using requires this param, but normally you only set the header.
    /* eslint-disable camelcase */
    request.params.access_token = state.auth.accessToken
  },

  /**
   * Retry the original request.
   *
   * Let's retry the user's original target request that had recieved a invalid token response
   * (which we fixed with a token refresh).
   *
   * @param {Request} request The Vue-resource Request instance to use to repeat an http call.
   * @return {Promise}
   */
  _retry (request) {
    this.setAuthHeader(request)

    return Vue.http(request)
      .then((response) => {
        return response
      })
      .catch((response) => {
        return response
      })
  },

  /**
   * Refresh the access token
   *
   * Make an ajax call to the OAuth2 server to refresh the access token (using our refresh token).
   *
   * @private
   * @param {Request} request Vue-resource Request instance, the original request that we'll retry.
   * @return {Promise}
   */
  _refreshToken (request) {
    const params = { 'grant_type': 'refresh_token', 'refresh_token': state.auth.refreshToken }

    return Vue.http.post(REFRESH_TOKEN_URL, params, AUTH_BASIC_HEADERS)
      .then((result) => {
        this._storeToken(result)
        return this._retry(request)
      })
      .catch((errorResponse) => {
        if (this._isInvalidToken(errorResponse)) {
          this.logout()
        }
        return errorResponse
      })
  },

  /**
   * Store tokens
   *
   * Update the App with the access/refresh tokens received from the response from
   * the Oauth2 server.
   *
   * @private
   * @param {Response} response Vue-resource Response instance from our auth-server.
   *      that contains our tokens.
   * @return {void}
   */
  _storeToken (response) {
    const auth = state.auth
    const user = state.user

    auth.isLoggedIn = true
    auth.accessToken = response.body.access_token
    auth.refreshToken = response.body.refresh_token
    // TODO: get user's name from response from Oauth server.
    user.name = 'John Smith'

    state.commit('UPDATE_AUTH', auth)
    state.commit('UPDATE_USER', user)
  },

  /**
   * Check if the Vue-resource Response is an invalid token response.
   *
   * @private
   * @param {Response} response The Vue-resource Response instance received from an http call.
   * @return {boolean}
   */
  _isInvalidToken (response) {
    const status = response.status
    const error = response.data.error

    return (status === 401 && (error === 'invalid_token' || error === 'expired_token'))
  }
}
