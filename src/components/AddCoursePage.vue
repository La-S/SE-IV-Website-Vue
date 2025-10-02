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

    <v-card :title='uploadedFile != null ? "Thank you for selecting a CSV!" : "Please select a CSV to upload"' :style="uploadedFile != null ? 'animation-name: hourglass; animation-iteration-count: 1; animation-duration: 0.5s; ': ''">
      <v-card-text>
        <p>Please select a file in CSV format.</p>
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
const selectedCourse = ref(null);
const isCourseSelected = ref(false);
const isUploadingCSV = ref(false);
const uploadedFile = ref(null);

async function fetchCourses({ page, itemsPerPage }) {
  try {
    const response = await fetch("/course-t3/courses");
    if (!response.ok) throw new Error("Failed to fetch courses");

    const data = await response.json();
    console.log(data);
    return {
      items: data.map(function(c) {
        return ({
          id: c.id,
          courseNum: c.number,
          title: c.name,
          credits: c.hours,
          level: c.level,
          description: c.description,
          department: c.department,
        });
      }),
      total: data.length,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { items: [], total: 0 };
  }
}

function loadItems({ page, itemsPerPage }) {
  loading.value = true;
  fetchCourses({ page, itemsPerPage }).then(({ items, total }) => {
    serverItems.value = items;
    totalItems.value = total;
    loading.value = false;
  });
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

    loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Delete failed:", error);
  }
}

async function uploadFiles() {
  console.log("uploadFiles")
  try {
    let b64 = uploadedFile.value.split(",")[1];
    let csvString = atob(b64);
    let entries = csvString.split("\n");
    console.log(entries.length);
    console.log(entries[0]);
    entries.shift(); // remove first element
    //Dept,Course Number,Level,Hours,Name,Description
    entries = entries.map(initial=> {
      let splitData = initial.split(",");
      let description = splitData.slice(5).join(',').trim();
      // remove leading and trailing double quotes.
      if (description[0] == '"') {
        description = description.substring(1);
      }
      if (description[description.length - 1] == '"') {
        description = description.substring(0, description.length - 1);
      }

      return  {department: splitData[0],
                number: splitData[1],
                name: splitData[4],
                level:  splitData[2],
                hours: splitData[3] == "P" ? 0 : splitData[3],
                description: description,
              }
    })

    const response = await fetch("/course-t3/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entries),
    });

    if (!response.ok) throw new Error("Upload failed");

    loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

function getChangedFile(e) {
  uploadedFile.value = null;
  let files = e.target.files;
  let filePath = files[0];

  const reader = new FileReader();
  reader.onloadend = () => {
    uploadedFile.value = reader.result;
  }
  reader.readAsDataURL(filePath);
}

</script>
