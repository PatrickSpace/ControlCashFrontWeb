<template>
  <div class="controlcash-period-actions">
    <v-btn
      class="controlcash-period-button"
      color="primary"
      prepend-icon="mdi-calendar-range-outline"
      variant="text"
      @click="$emit('showAll')"
    >
      Todos los periodos
    </v-btn>
    <v-btn
      class="controlcash-period-button"
      color="primary"
      prepend-icon="mdi-calendar-sync-outline"
      variant="tonal"
      @click="$emit('reset')"
    >
      Periodo actual
    </v-btn>
    <v-combobox
      class="controlcash-field controlcash-period-combobox"
      density="comfortable"
      hide-details
      :items="items"
      item-title="title"
      item-value="value"
      label="Periodo"
      :model-value="modelValue"
      prepend-inner-icon="mdi-calendar-month-outline"
      :return-object="false"
      variant="outlined"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

defineEmits(['reset', 'showAll', 'update:modelValue'])
</script>

<style scoped>
.controlcash-period-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
}

.controlcash-period-button {
  flex: 0 0 auto;
}

.controlcash-period-combobox {
  flex: 1 1 190px;
  max-width: 230px;
  min-width: 190px;
}

@media (max-width: 700px) {
  .controlcash-period-actions {
    justify-content: stretch;
  }

  .controlcash-period-button,
  .controlcash-period-combobox {
    flex: 1 1 100%;
    max-width: none;
    min-width: 0;
  }
}
</style>
