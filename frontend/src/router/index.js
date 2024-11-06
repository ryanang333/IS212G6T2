import { createRouter, createWebHistory } from 'vue-router'
import ArrangementRequest from '../views/ArrangementRequests.vue'
import SubmittedView from '../views/SubmittedView.vue'
import ApplyArrangement from '../views/ApplyArrangement.vue'
import Login from '../views/Login.vue'
import { isAuthenticated,getUserRole  } from '../utils/localStorage'
import Schedule from '../views/Schedule.vue'
import NotificationInbox from '@/views/ViewMyNotifications.vue'
import ViewMyRequests from '@/views/ViewMyRequests.vue' 
import ViewStaffRequests from '@/views/ViewStaffRequests.vue' 
import RequestAudit from '@/views/RequestAudit.vue' 

const ROLES = {
  HR_SENIOR_MGMT: 1,
  STAFF: 2,
  MGRS_DIRS: 3
};
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
      meta: { requiresAuth: true, requiredRoles:[ROLES.MGRS_DIRS]},
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
      meta: { requiresAuth: true,requiredRoles:[ROLES.STAFF] },
    },
    {
      path: '/',
      name: 'home',
      component: Schedule,
      meta: { requiresAuth: true }
    },
    
    { path: '/myrequests',
      name: 'myrequests',
      component: ViewMyRequests,
      meta: { requiresAuth: true }
    },
    {
      path: '/staffrequests',
      name: 'staffrequests',
      component: ViewStaffRequests,
      meta: { requiresAuth: true, requiredRoles:[ROLES.MGRS_DIRS] }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationInbox,
      meta: { requiresAuth: true }
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: RequestAudit,
      meta: { requiresAuth: true,requiredRoles:[ROLES.HR_SENIOR_MGMT] }
    },
    {
      path: '/:catchAll(.*)', 
      redirect: '/schedule' 
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!isAuthenticated()) {
      next('/login');
    } else if (to.meta.requiredRoles) {
      const userRole = getUserRole(); 
      if (to.meta.requiredRoles.includes(userRole)) {
        next();
      } else {
        next('/login'); 
      }
    } else {
      next();
    }
  } else {
    next();
  }
  
})

export default router
