// import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  json: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.token
  }
})

export default {
  async execute (method, resource, data) {
  // inject the accessToken for each request
  // let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: 'Bearer ' + localStorage.token
      }
    }).then(req => {
      return req.data
    })
  },
  getPosts () {
    return this.execute('get', '/posts')
  },
  getPost (id) {
    return this.execute('get', `/posts/${id}`)
  },
  createPost (data) {
    return this.execute('post', '/posts', data)
  },
  updatePost (id, data) {
    return this.execute('put', `/posts/${id}`, data)
  },
  deletePost (id) {
    return this.execute('delete', `/posts/${id}`)
  },
  getUsers () {
    return this.execute('get', '/users')
  },
  getUser (id) {
    return this.execute('get', `/users/${id}`)
  },
  deleteUser (id) {
    return this.execute('delete', `/users/${id}`)
  }
}
