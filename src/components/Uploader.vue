<template>
  <div class="hero">
    <div class="large-12 medium-12 small-12 cell">
      <label>excel-file
        <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
      </label>
        <button v-on:click="submitFile()">upload</button>
    </div>
  </div>
</template>

<style>
  .hero {
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .hero .lead {
    font-weight: 200;
    font-size: 1.5rem;
  }
</style>

<script>
  export default {
    data () {
      return {
        file: ''
      }
    },
    methods: {
      handleFileUpload () {
        this.file = this.$refs.file.files[0]
      }
    }
  }
</script>