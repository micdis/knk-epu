<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">User Manager</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
         <table class="table table-striped">
	      <div class="alert alert-danger" v-if="error">{{ error }}</div>
          <thead>
            <tr>
              <th>ID</th>
              <th>user</th>
              <th>Name</th>
              <th>email</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.firstname }} {{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td class="text-right">
	            <a href="#" @click.prevent="populateUserToEdit(user)">edit</a> - 
                <a href="#" @click.prevent="deleteUser(user.id)">delete</a>
              </td>
            </tr>
          </tbody>
        </table>
        
      </b-col>
      <b-col lg="6">
        <b-card :title="(model.id ? 'Benutzer ID#' + model.id + ' bearbeiten' : 'Neuer Benutzer')">
          <form @submit.prevent="saveUser">
            <b-form-group label="Username">
              <b-form-input type="text" v-model="model.username" placeholder="username"></b-form-input>
            </b-form-group>
            <b-form-group label="Name">
              <b-form-input type="text" v-model="model.firstname" placeholder="Vorname"></b-form-input>
              <b-form-input type="text" v-model="model.name" placeholder="Nachname"></b-form-input>
            </b-form-group>
            <b-form-group label="eMail">
              <b-form-input type="text" v-model="model.email" placeholder="Email-Adresse"></b-form-input>
            </b-form-group>
            <b-form-group label="Passwort" v-if="!model.id">
              <b-form-input type="text" v-model="model.password" placeholder="Passwort"></b-form-input>
            </b-form-group>
            <b-form-group label="Rechte:">
              <b-form-checkbox id="admin" v-model="model.permissions.admin" value="true" unchecked-value="false">
              Administrator</b-form-checkbox>
              <b-form-checkbox id="posts" v-model="model.permissions.posts" value="true" unchecked-value="false">
              Posts</b-form-checkbox>
              <b-form-checkbox id="users" v-model="model.permissions.users" value="true" unchecked-value="false">
              Users</b-form-checkbox>
            </b-form-group>
            <!-- <div class="alert alert-danger">{{ model }}</div> -->
            <div>
              <b-btn type="submit" variant="success">Benutzer speichern</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
export default {
  data () {
    return {
      loading: false,
      users: [],
      model: { permissions: { admin: false, users: false, posts: false } },
      error: false
    }
  },
  async created () {
    this.refreshUsers()
  },
  methods: {
    async refreshUsers () {
      this.loading = true
      this.users = await api.getUsers()
        .catch((error) => this.notAllowed(error))
      this.loading = false
    },
    async populateUserToEdit (user) {
      this.model = Object.assign({}, user)
    },
    async saveUser () {
      if (this.model.id) {
        await api.updateUser(this.model.id, this.model)
      } else {
        await api.createUser(this.model)
      }
      this.model = { permissions: [] } // reset form
      await this.refreshUsers()
    },
    async deleteUser (id) {
      if (confirm('Are you sure you want to delete this user?')) {
        // if we are editing a user we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deleteUser(id)
        await this.refreshUsers()
      }
    },
    notAllowed (error) {
      this.error = error
    }
  }
}
</script>