import { createRouter, createWebHistory } from 'vue-router'
import ArrangementRequest from '../views/ArrangementRequests.vue'
import SubmittedView from '../views/SubmittedView.vue'
import ApplyArrangement from '../views/ApplyArrangement.vue'
import Login from '../views/Login.vue'
import { isAuthenticated } from '../../utils/localStorage'
import Schedule from '../views/Schedule.vue'
import Hello from '../views/Hello.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: Schedule,
      meta: {requiresAuth: true},
    },
    {
      path: '/arrangementrequests',
      name: 'arrangementrequests',
      component: ArrangementRequest,
      meta: { requiresAuth: true },
    },
    {
      path: '/submittedview',
      name: 'submittedview',
      component: SubmittedView,
      meta: { requiresAuth: true },
    },
    {
      path: '/apply',
      name: 'apply',
      component: ApplyArrangement,
      meta: { requiresAuth: true },
    },
    {
      path : '/',
      name: 'home',
      component: Hello,
      meta: { requiresAuth: true },
    },
    // {
    //   path: '/cancel',
    //   name: 'cancel',
    //   component: Cancel ,
    //   meta: { requiresAuth: true },
    // }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
      next('/login'); 
  } else {
      next();
  }
});

export default router
