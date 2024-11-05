import { createRouter, createWebHistory } from 'vue-router'
import ArrangementRequest from '../views/ArrangementRequests.vue'
import SubmittedView from '../views/SubmittedView.vue'
import ApplyArrangement from '../views/ApplyArrangement.vue'
import Login from '../views/Login.vue'
import { isAuthenticated,getUserRole  } from '../utils/localStorage'
import Schedule from '../views/Schedule.vue'
import Hello from '../views/Hello.vue'
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
      meta: {requiresAuth: true, requiredRoles:[ROLES.HR_SENIOR_MGMT,ROLES.MGRS_DIRS,ROLES.STAFF]},
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
      meta: { requiresAuth: true,requiredRoles:[ROLES.HR_SENIOR_MGMT,ROLES.MGRS_DIRS,ROLES.STAFF] },
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
    {
      path: '/:catchAll(.*)', // Catch-all route for any unmatched routes
      redirect: '/login' // Redirect to login
    }
      path: '/myrequests',
      name: 'myrequests',
      component: ViewMyRequests
    },
    {
      path: '/staffrequests',
      name: 'staffrequests',
      component: ViewStaffRequests
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationInbox
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: RequestAudit
    }
  ]
})

router.beforeEach((to, from, next) => {

  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next('/login')
  // } else {
  //   next()
  // }
  if (to.meta.requiresAuth) {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      next('/login');
    } else if (to.meta.requiredRoles) {
      // If the route has required roles, check if the user's role matches
      const userRole = getUserRole(); // getUserRole should return the user's role (e.g., 1, 2, or 3)

      if (to.meta.requiredRoles.includes(userRole)) {
        // User has the correct role, allow access
        next();
      } else {
        // User lacks the required role, redirect to login or an unauthorized page
        next('/login'); // or use '/not-authorized' if you have a page for this
      }
    } else {
      // No specific roles required, allow access
      next();
    }
  } else {
    // If no authentication is required, allow access
    next();
  }
  
})

export default router
