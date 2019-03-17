<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">KNK EPU</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        
        <b-navbar-nav>
          <b-nav-item to="/">Home</b-nav-item>
          <b-nav-item to="/calendar">Kalender</b-nav-item>
          <b-nav-item to="/patient-manager" v-if="adminUser">Patienten</b-nav-item>
          <b-nav-item to="/login" v-if="!activeUser">Login</b-nav-item>
          <b-nav-item href="#" @click.prevent="logout" v-else>Logout</b-nav-item>
        </b-navbar-nav>
      
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown v-if="adminUser" text="Administration" right>
            <b-dropdown-item to="/user-manager">User Manager</b-dropdown-item>
            <b-dropdown-item to="/upload">Upload Data</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item disabled>{{ activeUser }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
	 
    </b-navbar>
    <!-- <div class="alert alert-danger">{{ adminUser }}</div> -->
    <!-- routes will be rendered here -->
    <router-view />
  
  </div>
</template>

<script>
import api from '@/api'
export default {
  name: 'app',
  data () {
    return {
      activeUser: null,
      adminUser: null
    }
  },
  created () {
    this.refreshActiveUser()
  },
  watch: {
    // everytime a route is changed refresh the activeUser
    '$route': 'refreshActiveUser'
  },
  methods: {
    async refreshActiveUser () {
      var userinfo = await api.getActiveUser()
      if (!userinfo.name) {
        this.activeUser = null
      } else {
        this.activeUser = userinfo.firstname + ' ' + userinfo.name
      }
      if (userinfo.permissions.admin) {
        this.adminUser = true
      }
    },
    async logout () {
      api.logout()
      this.activeUser = null
      this.adminUser = null
      this.$router.push('/')
    }
  }
}
</script>