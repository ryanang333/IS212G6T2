import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import Hello from '../views/Hello.vue'
import MainPage from '@/views/MainPage.vue'

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
      path: '/mainpage',
      name: 'mainpage',
      component: MainPage
    }
  ]
})

export default router
