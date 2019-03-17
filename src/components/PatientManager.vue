<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Patienten Übersicht</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      
      <b-col lg="6">
        <b-btn v-b-toggle.collapse1_inner @click.prevent="newPatient()" size="sm">Neuen Patienten anlegen</b-btn>   
          <b-collapse id=collapse1_inner class="mt-2">
          <!--  <b-card :title="(model.id ? 'Patient ID#' + model.id + ' bearbeiten' : 'Neuer Patient')"> -->
          <b-card title="Neuer Patient">
          <form @submit.prevent="savePatient">
            <b-form-group label="Name">
              <b-form-input type="text" v-model="model.firstname" placeholder="Vorname"></b-form-input>
              <b-form-input type="text" v-model="model.name" placeholder="Nachname"></b-form-input>
            </b-form-group>
            <b-form-group label="Geburtsdatum">
              <b-form-input type="string" v-model="model.birthdate" placeholder="DD.MM.YYYY"></b-form-input>
            </b-form-group>
            <b-form-group label="Telefonnummer">
              <b-form-input type="string" v-model="model.phone" placeholder="030 123456"></b-form-input>
            </b-form-group>
            <b-form-group label="Handynummer">
              <b-form-input type="string" v-model="model.mobile" placeholder="0171 2345678"></b-form-input>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox id="insurance" v-model="model.insurance" value="privat" unchecked-value="gesetzlich">
              Privatversichert</b-form-checkbox>
            </b-form-group>
            <b-form-group label="Diagnose">
              <b-form-input type="text" v-model="model.diagnosis" placeholder="Vorhofflimmern"></b-form-input>
            </b-form-group>
            <b-form-group label="Prozedur">
              <b-form-input type="text" v-model="model.procedure" placeholder="Pulmonalvenenisolation"></b-form-input>
            </b-form-group>
            <b-form-group>
              <b-form-checkbox id="echo" v-model="model.echo" value="mit TEE" unchecked-value="ohne TEE">
              benötigt TEE</b-form-checkbox>
            </b-form-group>
            <b-form-group label="Zuweiser / Kardiologe">
              <b-form-input type="text" v-model="model.referrer" placeholder="Kardios"></b-form-input>
            </b-form-group>
            <b-form-group label="Notizen">
              <b-form-input type="text" v-model="model.notes" placeholder="Notizen"></b-form-input>
            </b-form-group>
            <!--  <div class="alert alert-danger">{{ model }}</div> -->
            <div>
              <b-btn type="submit" variant="success">Patient anlegen</b-btn>
            </div>
          </form>
        </b-card>
        </b-collapse>
       <p>&nbsp;</p> 
       
        <b-card v-if="display_details" title="Patienten Details" footer-tag="footer">
          <p class="lead">{{ model.firstname }} {{ model.name }} (* {{ model.birthdate }})</p>
          <p>Telefon: {{ model.phone }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Mobil: {{ model.mobile }}</p>
          <div slot="footer"><b-button href="#" variant="primary">Ändern</b-button></div>
        </b-card>
          
      </b-col>
      
      <b-col>
         <table class="table table-striped">
	      <div class="alert alert-danger" v-if="error">{{ error }}</div>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Geburtsdatum</th>
              <th>Diagnose</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td>{{ patient.id }}</td>
              <td>{{ patient.firstname }} {{ patient.name }}</td>
              <td>{{ patient.birthdate }}</td>
              <td>{{ patient.diagnosis }}</td>
              <td class="text-right">
	            <a href="#" @click.prevent="newAppointment(patient.id)">termin</a> -
	            <a href="#" @click.prevent="populatePatientToDetails(patient)">anzeigen</a>
                <!-- <a href="#" @click.prevent="deletePatient(patient.id)">delete</a> -->
              </td>
            </tr>
          </tbody>
        </table>
        
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
      patients: [],
      display_details: false,
      model: {},
      error: false
    }
  },
  async created () {
    this.refreshPatients()
  },
  methods: {
    async refreshPatients () {
      this.loading = true
      this.patients = await api.getPatients()
      this.loading = false
    },
    async populatePatientToEdit (patient) {
      this.display_details = false
      this.model = Object.assign({}, patient)
    },
    async populatePatientToDetails (patient) {
      this.display_details = !this.display_details
      this.model = Object.assign({}, patient)
    },
    async savePatient () {
      if (this.model.id) {
        await api.updatePatient(this.model.id, this.model)
      } else {
        await api.createPatient(this.model)
      }
      this.model = {} // reset form
      await this.refreshPatients()
    },
    async deletePatient (id) {
      if (confirm('Are you sure you want to delete this patient?')) {
        // if we are editing a patient we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deletePatient(id)
        await this.refreshPatients()
      }
    },
    async newPatient () {
      this.display_details = false
      this.model = {}
    },
    notAllowed (error) {
      this.error = error
    }
  }
}
</script>