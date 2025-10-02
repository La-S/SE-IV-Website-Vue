<template>
  <header class="d-flex align-center justify-space-between px-4 py-2">
    <h1 class="text-center my-0">Courses</h1>
    <div class="d-flex gap-2">
      <v-btn @click="addCourse">
        <span class="material-icons" title="Add a new course">add</span>
      </v-btn>

      <v-btn @click="isUploadingCSV = true">
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
        <tr v-for="item in items" :key="item.id">
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

            <v-btn @click="selectedCourse = item; isCourseSelected = true;">
              <span class="material-icons" title="Delete course">delete</span>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </v-card>

  <!-- Delete Modal -->
  <v-dialog
    max-width="500px"
    @click:outside="isCourseSelected = false"
    v-model="isCourseSelected"
  >
    <v-card title="Delete?">
      <v-card-text>
        <p>
          Are you sure you want to delete the course
          '{{ selectedCourse?.title }}'?
        </p>
      </v-card-text>

      <v-card-actions>
        <v-btn
          text="Delete"
          @click="deleteCourse(selectedCourse); isCourseSelected = false"
        ></v-btn>
        <v-btn text="Cancel" @click="isCourseSelected = false;"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- CSV Upload Modal -->
  <v-dialog
    max-width="500px"
    @click:outside="uploadedFile = null; isUploadingCSV = false"
    v-model="isUploadingCSV">

    <v-card title="Import Data">
      <v-card-text>
        <p>Please upload a file in CSV format.</p>
        <input type="file" accept=".csv" @change="getChangedFile" />
      </v-card-text>

      <v-card-actions>
        <v-btn
          text="Upload"
          @click="uploadFiles(); uploadedFile = null; isUploadingCSV = false"
          :disabled="uploadedFile == null"
        ></v-btn>
        <v-btn
          text="Cancel"
          @click="uploadedFile = null; isUploadingCSV = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const itemsPerPage = ref(5);

const headers = ref([
  { title: "Course", key: "course" },
  { title: "Level/Hours", key: "credits", align: "end" },
  { title: "Description", key: "description" },
  { title: "Actions", key: "actions" },
]);

const search = ref("");
const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const cachedCourses = ref([]);
const requiresRefresh = ref(true);
const selectedCourse = ref(null);
const isCourseSelected = ref(false);
const isUploadingCSV = ref(false);
const uploadedFile = ref(null);

async function fetchAllCourses() {
  try {
    const response = await fetch("/course-t3/courses");
    if (!response.ok) throw new Error("Failed to fetch courses");

    const data = await response.json();
    cachedCourses.value = data.map(function(c) {
      return ({
        id: c.id,
        courseNum: c.number,
        title: c.name,
        credits: c.hours,
        level: c.level,
        description: c.description,
        department: c.department,
      });
    });
    totalItems.value = cachedCourses.value.length;
  } catch (error) {
    console.error("Error fetching courses:", error);
    cachedCourses.value = [];
    totalItems.value = 0;
  }
}

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

async function loadItems({ page, itemsPerPage }) {
  loading.value = true;
  try {
    if (requiresRefresh.value || !cachedCourses.value.length) {
      await fetchAllCourses();
      requiresRefresh.value = false;
    }

    serverItems.value = paginate(cachedCourses.value, page, itemsPerPage);
  } catch (error) {
    console.error("Error loading paginated courses:", error);
    serverItems.value = [];
  } finally {
    loading.value = false;
  }
}

function addCourse() {
  router.push({ name: "course-new" });
}

function editCourse(course) {
  router.push({ name: "course-edit", params: { id: course.id } });
}

async function deleteCourse(course) {
  try {
    const response = await fetch(`/course-t3/course/${course.id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Delete failed");

    requiresRefresh.value = true;
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Delete failed:", error);
  }
}

async function uploadFiles() {
  try {
    const formData = new FormData();
    formData.append("file", uploadedFile.value);

    const response = await fetch("/course-t3/course/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    requiresRefresh.value = true;
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

function getChangedFile(e) {
  uploadedFile.value = e.target.files[0];
}
</script>