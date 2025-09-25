<template>
  <v-container>
    <h2 v-if="isEdit">Edit Course</h2>
    <h2 v-else>Add New Course</h2>

    <v-form ref="courseForm">
      <v-text-field v-model="form.title" label="Title"></v-text-field>
      <v-text-field v-model="form.courseNum" label="Course Number"></v-text-field>
      <v-text-field v-model="form.level" label="Level"></v-text-field>
      <v-text-field v-model.number="form.credits" label="Credits" type="number"></v-text-field>
      <v-textarea v-model="form.description" label="Description"></v-textarea>

      <v-btn v-if="isEdit" @click="saveCourse">Update Course</v-btn>
      <v-btn v-else @click="saveCourse">Create Course</v-btn>
    </v-form>
  </v-container>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface CourseForm {
  title: string
  courseNum: string
  level: string
  credits: number | string
  description: string
}

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<HTMLFormElement | null>(null)

const form = ref<CourseForm>({
  title: '',
  courseNum: '',
  level: '',
  credits: '',
  description: ''
})

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true

    form.value = {
      title: 'Intro to Algorithms',
      courseNum: route.params.id as string,
      level: '100',
      credits: 3,
      description: 'Example prefilled data'
    }
  }
})

function saveCourse() {
  if (isEdit.value) {
    console.log("Update Course:", form.value)
  } else {
    console.log("Create Course:", form.value)
  }

  router.push({ name: 'courses' })
}
</script>
