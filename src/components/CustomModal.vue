<template>
  <v-dialog max-width="500px" @click:outside="closeModal">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        :text="props.title"
      ></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card :title="props.title">
        <v-card-text>
          <slot name="modal-body"></slot>
        </v-card-text>

        <v-card-actions>
          <slot name="actions" v-bind="isActive"></slot>
          <v-btn
            text="Cancel"
            @click="isActive.value = false; closeModal()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
  const props = defineProps({title: String, onClose: Function})
  const emit = defineEmits(['modalClosed'])

  function closeModal() {
    emit('modalClosed');
  }
</script>
