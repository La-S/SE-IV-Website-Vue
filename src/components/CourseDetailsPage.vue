<template>
  <v-container>
    <h2 v-if="isEdit">Edit Course</h2>
    <h2 v-else>Add New Course</h2>

    <v-form ref="courseForm">
      <v-text-field
        v-model="form.department"
        :rules="[v => !!v || 'This field is required']"
        label="Department"
      ></v-text-field>
      <v-text-field v-model="form.title" :rules="[v => !!v || 'This field is required']" label="Title"></v-text-field>
      <v-text-field v-model="form.courseNum" :rules="[v => !!v || 'This field is required']"  label="Course Number"></v-text-field>
      <v-text-field v-model="form.level" :rules="[v => !!v || 'This field is required']"  label="Level"></v-text-field>
      <v-text-field v-model.number="form.credits" :rules="[v => !!v || 'This field is required']"  label="Credits" type="number"></v-text-field>
      <v-textarea v-model="form.description" label="Description"></v-textarea>

      <v-btn
        v-if="isEdit"
        :loading="saving"
        :disabled="saving"
        @click="saveCourse"
      >
        Update Course
      </v-btn>
      <v-btn
        v-else
        :loading="saving"
        :disabled="saving"
        @click="saveCourse"
      >
        Create Course
      </v-btn>
      <v-btn @click="cancel" class="ml-5" :disabled="saving">cancel</v-btn>
    </v-form>
  </v-container>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

interface CourseForm {
  department: string
  title: string
  courseNum: string
  level: string
  credits: number | string
  description: string
}

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<VForm | null>(null)
const saving = ref(false)

const form = ref<CourseForm>({
  department: '',
  title: '',
  courseNum: '',
  level: '',
  credits: '',
  description: ''
})

onMounted(async () => {
  if (!route.params.id) {
    return
  }

  isEdit.value = true

  try {
    const response = await fetch(`/course-t3/course/${route.params.id}`)
    if (!response.ok) {
      throw new Error('Failed to load course')
    }

    const data = await response.json()
    form.value = {
      department: data.department ?? '',
      title: data.name ?? '',
      courseNum: data.number ?? '',
      level: data.level ?? '',
      credits: data.hours ?? '',
      description: data.description ?? ''
    }
  } catch (error) {
    console.error('Failed to load course:', error)
  }
})

async function saveCourse() {
  const formEl = courseForm.value
  if (!formEl) {
    return
  }

  const { valid } = await formEl.validate()
  if (!valid) {
    return
  }

  saving.value = true

  try {
    const payload = {
      department: form.value.department,
      number: form.value.courseNum,
      name: form.value.title,
      level: form.value.level,
      hours: Number(form.value.credits),
      description: form.value.description
    }

    let url = '/course-t3/course'
    let method = 'POST'
    if (isEdit.value) {
      url = `/course-t3/course/${route.params.id}`
      method = 'PUT'
    }
    console.log(url);
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Failed to save course')
    }

    router.push({ name: 'courses' })
  } catch (error) {
    console.error('Failed to save course:', error)
  } finally {
    saving.value = false
  }
}

function cancel(){
    router.push({name: 'courses'})
}
</script>
