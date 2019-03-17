<template>
 <div class="container-fluid mt-5">
   <full-calendar :config="config" :events="events"/>
 </div>
</template>

<script>
  import moment from 'moment'
  import 'fullcalendar/dist/locale/de'
  export default {
    name: 'hello',
    data () {
      return {
        events: [
          {
            title: 'testing',
            allDay: true,
            start: moment(),
            end: moment().add(2, 'd')
          },
          {
            title: 'another test',
            start: moment().add(3, 'd'),
            end: moment().add(3, 'd').add(3, 'h')
          }
        ],
        config: {
          defaultView: 'month',
          weekends: false,
          eventRender: function (event, element) {
            console.log(event)
          }
        }
      }
    }
  }
</script>