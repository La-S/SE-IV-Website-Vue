<template>
  <header>
    <h1 class="text-center">Courses</h1>
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
    />
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const itemsPerPage = ref(5)
const headers = ref([
  { title: 'Title', key: 'title' },
  { title: 'Credits', key: 'credits', align: 'end' },
   { title: 'Level', key: 'Level'},
  { title: 'Description', key: 'description' },
])

const search = ref('')
const serverItems = ref([])
const loading = ref(true)
const totalItems = ref(0)


async function fetchCourses({ page, itemsPerPage }) {
  return new Promise(resolve => {
    setTimeout(() => {
      let data = [
        { title: 'Intro to Algorithms', credits: 3, description: 'Basics of algorithms and complexity.' },
        { title: 'Databases', credits: 3, description: 'Relational DBs, SQL, and indexing.' },
        { title: 'Operating Systems', credits: 4, description: 'Processes, threads, and memory management.' },
        { title: 'AI Fundamentals', credits: 3, description: 'Search, planning, and intro to ML.' },
        { title: 'Software Engineering', credits: 3, description: 'Agile, testing, and system design.' },
        { title: 'Networks', credits: 3, description: 'TCP/IP, routing, and network security.' },
      ]


      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage
      const paginated = data.slice(start, end === -1 ? undefined : end)

      resolve({ items: paginated, total: data.length })
    },)
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
</script>