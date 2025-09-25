<template>
  <header class="d-flex align-center justify-space-between px-4 py-2">
    <h1 class="text-center my-0">Courses</h1>

    <div class="d-flex gap-2">
      <v-btn @click="addCourse">
        <span class="material-icons" title="Add a new course">add</span>
      </v-btn>

      <v-btn>
        <span class="material-icons" title="Import courses from CSV">upload</span>
      </v-btn>
    </div>
  </header>

  <v-card class="mx-auto px-4">
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      item-value="id"
      @update:options="loadItems"
    >
      <template #body="{ items }">
        <tr v-for="item in items" :key="item.courseNum">
          <td>
            <strong>{{ item.title }}</strong>
            <div class="text-caption text-grey">{{ item.courseNum }}</div>
          </td>

          <td class="text-right">
            <strong>{{ item.level }}</strong>
            <div class="text-caption text-grey">{{ item.credits + " Hrs" }}</div>
          </td>

          <td>{{ item.description }}</td>

          <td class="d-flex gap-2">
            <v-btn @click="editCourse(item)">
              <span class="material-icons" title="Edit course">edit</span>
            </v-btn>

            <CustomModal title="Delete">
              <template v-slot:modal-body>
                <p>Are you sure you want to delete the course '{{ item.title }}'?</p>
              </template>
              <template v-slot:actions="isActive">
                <v-btn
                  text
                  @click="deleteCourse(item); isActive.value = false"
                >Yes</v-btn>
              </template>
              <template v-slot:trigger>
                <v-btn>
                  <span class="material-icons" title="Delete course">delete</span>
                </v-btn>
              </template>
            </CustomModal>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CustomModal from './CustomModal.vue'

const router = useRouter()
const itemsPerPage = ref(5)

const headers = ref([
  { title: 'Course', key: 'course' },
  { title: 'Level/Hours', key: 'credits', align: 'end' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions' },
])

const search = ref('')
const serverItems = ref([])
const loading = ref(true)
const totalItems = ref(0)

async function fetchCourses({ page, itemsPerPage }) {
  return new Promise(resolve => {
    setTimeout(() => {
      let data = [
        { courseNum: 'CS101', title: 'Intro to Algorithms', credits: 3, level: '100', description: 'Basics of algorithms and complexity.' },
        { courseNum: 'CS210', title: 'Databases', credits: 3, level: '200', description: 'Relational DBs, SQL, and indexing.' },
        { courseNum: 'CS310', title: 'Operating Systems', credits: 4, level: '200', description: 'Processes, threads, and memory management.' },
        { courseNum: 'CS420', title: 'AI Fundamentals', credits: 3, level: '400', description: 'Search, planning, and intro to ML.' },
        { courseNum: 'CS430', title: 'Software Engineering', credits: 3, level: '400', description: 'Agile, testing, and system design.' },
        { courseNum: 'CS440', title: 'Networks', credits: 3, level: '300', description: 'TCP/IP, routing, and network security.' },
      ]

      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage
      const paginated = data.slice(start, end === -1 ? undefined : end)

      resolve({ items: paginated, total: data.length })
    }, 300)
  })
}

function loadItems({ page, itemsPerPage, sortBy }) {
  loading.value = true
  fetchCourses({ page, itemsPerPage, sortBy }).then(({ items, total }) => {
    serverItems.value = items
    totalItems.value = total
    loading.value = false
  })
}

function addCourse() {
  router.push({ name: 'course-new' })
}

function editCourse(course) {
  router.push({ name: 'course-edit', params: { id: course.courseNum } })
}

function deleteCourse(course) {
  console.log("Delete Course clicked:", course)
}
</script>
