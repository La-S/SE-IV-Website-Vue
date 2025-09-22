<template>
  <header class="d-flex align-center justify-space-between px-4 py-2">
    <h1 class="text-center my-0">Courses</h1>
    <v-btn class="text-right" >Add Course</v-btn>
    <CustomModal title="Import Data" @modal-closed="uploadedFile = null">
      <template v-slot:modal-body>
        <p>Please upload a file in CSV format.</p>
        <input type="file" accept=".csv" @change="getChangedFile"/>
      </template>
      <template v-slot:actions="isActive" >
        <v-btn
        text="Upload"
        @click="uploadFiles(); isActive.value = false; uploadedFile = null;"
        :disabled="uploadedFile == null"
      ></v-btn>
      </template>
    </CustomModal>
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
        <tr v-for="item in items" :key="item.id">
          <td>
            <strong>{{ item.title }}</strong>
            <div class="text-caption text-grey">
              {{ item.courseNum }}
            </div>
          </td>
          <td class="text-right">
            <strong>{{ item.level }}</strong>
            <div class="text-caption text-grey">
              {{ item.credits + " Hrs" }}
            </div>
          </td>
          <td>{{ item.description }}</td>
          <td><v-btn block>Edit</v-btn></td>
          <td>
            <CustomModal title="Delete">
              <template v-slot:modal-body>
                <p>Are you sure you want to delete the course '{{ item.title }}'?</p>
              </template>
              <template v-slot:actions="isActive">
                <v-btn
                text="Yes"
                @click="deleteCourse(item.courseNum); isActive.value = false"
              ></v-btn>
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
import CustomModal from './CustomModal.vue'

let uploadedFile = ref(null);
const itemsPerPage = ref(5)
const headers = ref([
  { title: 'Course', key: 'course' },
  { title: 'Level/Hours', key: 'credits', align: 'end' },
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
  console.log("Add Course clicked")
}

function deleteCourse(courseId) {
  // do rest request here...
  console.log("deleting: "+courseId);
}

function uploadFiles() {
  // do rest request here...
  console.log("uploading files!!", uploadedFile.value);
}

function getChangedFile(e) {
  uploadedFile.value = null;
  let files = e.target.files;
  let filePath = files[0];

  const reader = new FileReader();
  reader.onloadend = () => {
    console.log(reader.result);
    uploadedFile.value = reader.result;
    console.log(uploadedFile.value);
  }
  reader.readAsDataURL(filePath);
}

</script>

