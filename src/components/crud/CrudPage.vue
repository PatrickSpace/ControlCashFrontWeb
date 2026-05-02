<template>
  <v-container class="controlcash-page-container pa-4 pa-md-8" fluid>
    <v-card class="controlcash-panel" elevation="0">
      <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
        <div class="d-flex align-center flex-wrap ga-3 ga-md-4">
          <v-icon color="primary" :icon="icon" size="32" />
          <div class="controlcash-title-block">
            <div class="text-headline-small">{{ title }}</div>
            <div class="text-body-medium text-medium-emphasis">{{ subtitle }}</div>
          </div>
          <v-spacer />
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            variant="tonal"
            density="default"
            class="text-title-medium"
            @click="openCreate"
          >
            Nuevo
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4 pa-md-6">
        <v-alert
          v-if="store.error"
          class="mb-4"
          color="error"
          density="comfortable"
          variant="tonal"
        >
          {{ store.error }}
        </v-alert>

        <div v-if="$slots.filters" class="mb-4">
          <slot name="filters" />
        </div>

        <v-data-table
          class="controlcash-table"
          density="comfortable"
          :headers="tableHeaders"
          :items="rows"
          :items-per-page="10"
          :loading="store.loading"
        >
          <template #item.isActive="{ item }">
            <v-chip
              :color="getRawItem(item).isActive === false ? 'warning' : 'success'"
              size="small"
              variant="tonal"
            >
              {{ getRawItem(item).isActive === false ? 'Inactivo' : 'Activo' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex justify-end ga-2">
              <v-btn
                density="compact"
                icon="mdi-pencil-outline"
                variant="text"
                aria-label="Editar"
                @click="openEdit(getRawItem(item))"
              />
              <v-btn
                color="error"
                density="compact"
                icon="mdi-delete-outline"
                variant="text"
                aria-label="Eliminar"
                @click="openDelete(getRawItem(item))"
              />
            </div>
          </template>

          <template #no-data>
            <div class="pa-8 text-center text-medium-emphasis">
              <v-icon class="mb-2" :icon="emptyIcon" size="40" />
              <div>{{ emptyText }}</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialog" :fullscreen="mobile" max-width="620" :persistent="saving" scrollable>
      <v-card class="controlcash-panel controlcash-dialog-panel" elevation="0">
        <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
          {{ editingItem ? 'Editar' : 'Nuevo' }} {{ singularTitle }}
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form v-model="formValid" @submit.prevent="save">
            <v-row>
              <template v-for="field in fields" :key="field.key">
                <v-col
                  v-if="shouldShowField(field)"
                  :cols="field.cols || 12"
                  :md="field.md || 12"
                >
                  <v-select
                    v-if="field.type === 'select'"
                    v-model="form[field.key]"
                    class="controlcash-field"
                    clearable
                    :items="field.items || []"
                    item-title="title"
                    item-value="value"
                    :label="field.label"
                    :rules="field.rules || []"
                  >
                    <template #no-data>
                      <v-list-item>
                        <v-list-item-title class="text-body-medium controlcash-select-no-data">
                          {{ field.noDataText || 'Sin datos disponibles' }}
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-select>

                  <v-select
                    v-else-if="field.type === 'boolean'"
                    v-model="form[field.key]"
                    class="controlcash-field"
                    :items="booleanItems"
                    item-title="title"
                    item-value="value"
                    :label="field.label"
                    :rules="field.rules || []"
                  />

                  <v-text-field
                    v-else
                    v-model="form[field.key]"
                    class="controlcash-field"
                    :label="field.label"
                    :prefix="field.prefix"
                    :rules="field.rules || []"
                    :type="field.type || 'text'"
                  />
                </v-col>
              </template>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
          <v-spacer />
          <v-btn :disabled="saving" variant="text" @click="formDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid || saving"
            :loading="saving"
            variant="tonal"
            @click="save"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" :fullscreen="mobile" max-width="420">
      <v-card class="controlcash-panel" elevation="0">
        <v-card-title class="text-title-large px-4 px-md-6 pt-6">Eliminar registro</v-card-title>
        <v-card-text class="px-4 px-md-6">
          Esta acción eliminará {{ deleteItemLabel }}. No se guardarán valores derivados.
        </v-card-text>
        <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="store.loading" variant="tonal" @click="remove">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useDisplay } from 'vuetify'

import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  singularTitle: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'mdi-database-outline',
  },
  emptyIcon: {
    type: String,
    default: 'mdi-database-off-outline',
  },
  emptyText: {
    type: String,
    default: 'Todavía no hay registros.',
  },
  store: {
    type: Object,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: null,
  },
  formatRow: {
    type: Function,
    default: (item) => item,
  },
})

const formDialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const editingItem = ref(null)
const deletingItem = ref(null)
const saving = ref(false)
const form = reactive({})
const { mobile } = useDisplay()
const notificationStore = useNotificationStore()

const booleanItems = [
  { title: 'Activo', value: true },
  { title: 'Inactivo', value: false },
]

const tableHeaders = computed(() => [
  ...props.headers,
  {
    title: '',
    key: 'actions',
    align: 'end',
    sortable: false,
  },
])

const rows = computed(() => {
  const sourceItems = props.items ?? props.store.items

  return sourceItems.map((item) => props.formatRow(item))
})
const deleteItemLabel = computed(() => deletingItem.value?.name || deletingItem.value?.description || 'este registro')

function getRawItem(item) {
  return item?.raw || item
}

function shouldShowField(field) {
  return typeof field.showWhen === 'function' ? field.showWhen(form) : true
}

onMounted(() => {
  props.store.subscribeRealtime()
})

onBeforeUnmount(() => {
  props.store.stopRealtime()
})

function getInitialValue(field, source = {}) {
  if (source[field.key] !== undefined) {
    return source[field.key]
  }

  if (field.defaultValue !== undefined) {
    return typeof field.defaultValue === 'function' ? field.defaultValue() : field.defaultValue
  }

  return ''
}

function resetForm(source = {}) {
  props.fields.forEach((field) => {
    form[field.key] = getInitialValue(field, source)
  })
}

function openCreate() {
  editingItem.value = null
  saving.value = false
  resetForm()
  formDialog.value = true
}

function openEdit(item) {
  editingItem.value = item
  saving.value = false
  resetForm(item)
  formDialog.value = true
}

function openDelete(item) {
  deletingItem.value = item
  deleteDialog.value = true
}

async function save() {
  if (!formValid.value || saving.value) {
    return
  }

  saving.value = true

  const payload = props.fields.reduce((nextPayload, field) => {
    nextPayload[field.key] = form[field.key]
    return nextPayload
  }, {})

  try {
    if (editingItem.value) {
      await props.store.updateItem(editingItem.value.id, payload)
    } else {
      await props.store.createItem(payload)
    }

    formDialog.value = false
  } catch {
    notificationStore.error(props.store.error || 'No se pudo guardar el registro.')
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!deletingItem.value) {
    return
  }

  await props.store.removeItem(deletingItem.value.id)
  deleteDialog.value = false
  deletingItem.value = null
}
</script>
