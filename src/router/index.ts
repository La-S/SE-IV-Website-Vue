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
  history: createWebHistory(),
  routes,
})

export default router
