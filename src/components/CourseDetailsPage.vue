<template>
  <v-container>
    <h2 v-if="isEdit">Edit Course</h2>
    <h2 v-else>Add New Course</h2>

    <v-form ref="courseForm">
      <v-text-field v-model="form.department" :rules="[v => !!v || 'This field is required']" label="Department"></v-text-field>
      <v-text-field v-model="form.name" :rules="[v => !!v || 'This field is required']" label="Title"></v-text-field>
      <v-text-field v-model="form.number" :rules="[v => !!v || 'This field is required']"  label="Course Number"></v-text-field>
      <v-text-field v-model="form.level" :rules="[v => !!v || 'This field is required']"  label="Level"></v-text-field>
      <v-text-field v-model.number="form.hours" :rules="[v => !!v || 'This field is required']"  label="Credits" type="number"></v-text-field>
      <v-textarea v-model="form.description" label="Description"></v-textarea>

      <v-btn @click="saveCourse">{{ isEdit ? "Update Course" : "Create Course" }}</v-btn>
      <v-btn @click="cancel" class="ml-5">Cancel</v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface CourseForm {
  department: string
  name: string
  number: string
  level: string
  hours: number | string
  description: string
}

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const courseForm = ref<HTMLFormElement | null>(null)

const form = ref<CourseForm>({
  department: '',
  name: '',
  number: '',
  level: '',
  hours: '',
  description: ''
})

onMounted(async() => {
  if (route.params.id) {
    isEdit.value = true
    const courseId = route.params.id as string;

    try {
      const response = await fetch(`/course-t3/course/${route.params.id}`);
      if (!response.ok) throw new Error("Failed to fetch course data");

      const course = await response.json();

    form.value = {
        department: course.department,
        name: course.name,
        number: course.number,
        level: course.level,
        hours: course.hours,
        description: course.description
      };
     }
      catch (err) {
      console.error(err);
      alert("Error loading course data");
    }
  }
})

  async function saveCourse() {
  if (!form.value.department || !form.value.name || !form.value.number || !form.value.level || !form.value.hours) {
    alert("Please fill out all required fields.");
    return;
  }

  try {
    const courseId = route.params.id as string;
    const url = isEdit.value
  ? `/course-t3/course/${route.params.id}`
  : `/course-t3/course`;
    const method = isEdit.value ? "PUT" : "POST";
    console.log(url, method, form.value);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form.value)
    });

    if (!response.ok) throw new Error("Failed to save course");

    router.push({ name: "courses" });
  } catch (err) {
    console.error(err);
    alert("Error saving course");
  }
}

function cancel(){
    router.push({name: 'courses'})
}
</script>