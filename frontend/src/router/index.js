import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import Hello from '../views/Hello.vue'
import ArrangementRequest from '../views/ArrangementRequests.vue'
import SubmittedView from '../views/SubmittedView.vue'
import ViewRegularSubmitted from '../views/ViewRegularSubmitted.vue'
import ApplyArrangement from '../views/ApplyArrangement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Hello
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/arrangementrequests',
      name: 'arrangementrequests',
      component: ArrangementRequest
    },
    {
      path: '/submittedview',
      name: 'submittedview',
      component: SubmittedView
    },
    {
      path: '/viewregularsubmitted',
      name: 'viewregularsubmitted',
      component: ViewRegularSubmitted
    },
    {
      path: '/apply',
      name: 'apply',
      component: ApplyArrangement
    }
  ]
})

export default router
