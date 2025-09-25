/**
 * router/index.ts
 *
 * Manual routes for pages
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import AddCoursePage from '@/components/AddCoursePage.vue'
import CourseDetailsPage from '@/components/CourseDetailsPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: AddCoursePage }, 
  { path: '/courses', name: 'courses', component: AddCoursePage },
  { path: '/courses/new', name: 'course-new', component: CourseDetailsPage },
  { path: '/courses/:id', name: 'course-edit', component: CourseDetailsPage, props: true },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
