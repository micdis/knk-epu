import Vue from 'vue'
import Router from 'vue-router'
import api from '@/api'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import Calendar from '@/components/Calendar'
import PatientManager from '@/components/PatientManager'
import UserManager from '@/components/UserManager'
import Uploader from '@/components/Uploader'

import 'fullcalendar/dist/fullcalendar.min.css'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/calendar',
      name: 'Kalender',
      component: Calendar
    },
    {
      path: '/patient-manager',
      name: 'PatientManager',
      component: PatientManager,
      meta: {
        requiresAuth: true,
        requiredAuth: 'patients'
      }
    },
    {
      path: '/user-manager',
      name: 'UserManager',
      component: UserManager,
      meta: {
        requiresAuth: true,
        requiredAuth: 'users'
      }
    },
    {
      path: '/upload',
      name: 'Uploader',
      component: Uploader,
      meta: {
        requiresAuth: true,
        requiredAuth: 'admin'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

router.beforeEach(api.authRedirectGuard())

export default router
