import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  json: true
})

export default {
  async execute (method, resource, data) {
  // inject the accessToken for each request
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
  logout () {
    client.headers = { Authorization: null }
    delete localStorage.token
    return true
  },
  authRedirectGuard () {
    return async (to, from, next) => {
      if (to.matched.some(record => record.meta.requiresAuth)) {
        var userData = await this.getActiveUser()
        // hier müssen noch die permissions geprüft werden
        var permissions = userData.permissions
        if (!permissions) {
          next({
            path: '/login',
            query: {
              redirect: to.fullPath
            }
          })
        } else {
          next()
        }
      } else {
        next()
      }
    }
  },
  async getActiveUser () {
    return this.execute('get', '/activeUser')
  },
  login (data) {
    return this.execute('post', '/auth', data)
  },
  getPatients () {
    return this.execute('get', '/patients')
  },
  getPatient (id) {
    return this.execute('get', `/patients/${id}`)
  },
  createPatient (data) {
    return this.execute('post', '/patients', data)
  },
  updatePatient (id, data) {
    return this.execute('put', `/patients/${id}`, data)
  },
  deletePatient (id) {
    return this.execute('delete', `/patients/${id}`)
  },
  getUsers () {
    return this.execute('get', '/users')
  },
  getUser (id) {
    return this.execute('get', `/users/${id}`)
  },
  deleteUser (id) {
    return this.execute('delete', `/users/${id}`)
  },
  createUser (data) {
    return this.execute('post', '/users', data)
  },
  updateUser (id, data) {
    return this.execute('put', `/users/${id}`, data)
  },
  uploadFile (file, formData) {
    return this.execute('')
  }
}
