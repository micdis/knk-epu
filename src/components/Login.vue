<template>
  <div class="login-wrapper col-sm-4 offset-sm-4 border ">
	<spinner v-show="loggingIn" message="Logging in..."></spinner>
    <form class="form-signin" @submit.prevent="login">
      <h2 class="form-signin-heading">Bitte anmelden</h2>
      <div class="alert alert-danger" v-if="error">{{ error }}</div>
      <label for="inputUsername" class="sr-only">Benutzername</label>
      <input v-model="username" type="email" id="inputUsername" class="form-control" placeholder="Benutzername" required autofocus>
      <label for="inputPassword" class="sr-only">Password</label>
      <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Passwort" required>
       <button data-id="login.submit" class="btn btn-primary solid blank js-login__submit" @click="login()">Login</button>
    </form>
  </div>
</template>

<script>
import api from '@/api'
import Spinner from '@/components/common/Spinner'
export default {
  components: { Spinner },
  name: 'Login',
  data () {
    return {
      email: '',
      password: '',
      error: false,
      loggingIn: false
    }
  },
  updated () {
    // if (localStorage.token) {
    //  this.$router.push('/posts-manager')
    // }
  },
  methods: {
    async login () {
      this.loggingIn = true
      await api.login({ username: this.username, password: this.password })
        .then(request => this.loginSuccessful(request))
        .catch((error) => this.loginFailed(error))
    },
    loginSuccessful (req) {
      if (!req.token) {
        this.loginFailed({'error': {'response': {'data': {'message': 'token missing'}}}})
        return
      }
      localStorage.token = req.token
      this.$router.push({ name: 'Hello' } || this.$route.query.redirect)
    },
    loginFailed (error) {
      this.loggingIn = false
      this.error = error.response.data.message
      delete localStorage.token
    }
  }
}
</script>

<style lang="css">

.login-wrapper {
  background: rgba(97, 92, 88, 0.1);
  width: 50%;
  margin: 12% auto;
}

.form-signin {
  max-width: 330px;
  padding: 10% 15px;
  margin: 0 auto;
}
.form-signin .form-signin-heading,
.form-signin .checkbox {
  margin-bottom: 10px;
}
.form-signin .checkbox {
  font-weight: normal;
}
.form-signin .form-control {
  position: relative;
  height: auto;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>