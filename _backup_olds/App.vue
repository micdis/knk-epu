<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">KNK EPU</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item to="/">Home</b-nav-item>
          <b-nav-item to="/posts-manager">Posts Manager</b-nav-item>
          <b-nav-item to="/login" v-if="!activeUser">Login</b-nav-item>
          <b-nav-item to="/logout" v-else>Logout</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    
    <!-- routes will be rendered here -->
    <router-view />
  
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
      activeUser: null
    }
  },
  async created () {
    await this.refreshActiveUser()
  },
  watch: {
    // everytime a route is changed refresh the activeUser
    // '$route': 'refreshActiveUser'
  },
  methods: {
    // login () {
    //  this.$auth.loginRedirect()
    // },
    // async refreshActiveUser () {
    //  this.activeUser = await this.$auth.getUser()
    // },
    // async logout () {
    //  await this.$auth.logout()
    //  await this.refreshActiveUser()
    //  this.$router.push('/')
  }
}
</script>