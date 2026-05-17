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
        <v-slide-y-transition>
          <v-alert
            v-if="store.error"
            class="mb-4 controlcash-alert-motion"
            color="error"
            density="comfortable"
            variant="tonal"
          >
            {{ store.error }}
          </v-alert>
        </v-slide-y-transition>

        <v-expand-transition>
          <div v-if="$slots.filters" class="mb-4 controlcash-filter-motion">
            <slot name="filters" />
          </div>
        </v-expand-transition>

        <v-skeleton-loader
          v-if="mobile && store.loading && !rows.length"
          class="controlcash-mobile-list"
          type="list-item-two-line@4"
        />

        <v-list
          v-else-if="mobile"
          bg-color="transparent"
          class="controlcash-mobile-list pa-0"
        >
          <template v-if="rows.length">
            <v-list-item
              v-for="item in rows"
              :key="getRawItem(item).id"
              class="controlcash-list-item controlcash-mobile-record mb-3"
              rounded="lg"
            >
              <template #prepend>
                <v-avatar color="primary" rounded="lg" size="38" variant="tonal">
                  <v-icon :icon="icon" />
                </v-avatar>
              </template>

              <v-list-item-title>{{ getMobileTitle(item) }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ getMobileSubtitle(item) }}
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex ga-1">
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

              <div class="controlcash-mobile-record-grid mt-3">
                <div
                  v-for="field in getMobileDetailFields(item)"
                  :key="field.key"
                  class="controlcash-mobile-record-field"
                >
                  <span>{{ field.title }}</span>
                  <strong>{{ field.value }}</strong>
                </div>
              </div>
            </v-list-item>
          </template>

          <div v-else class="pa-8 text-center text-medium-emphasis">
            <v-icon class="mb-2" :icon="emptyIcon" size="40" />
            <div>{{ emptyText }}</div>
          </div>
        </v-list>

        <v-data-table
          v-else
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

          <template v-if="hasTotals" #body.append>
            <tr class="controlcash-total-row">
              <td
                v-for="(header, index) in tableHeaders"
                :key="header.key"
                :class="{ 'text-right': header.align === 'end' }"
              >
                {{ getTotalCellValue(header, index) }}
              </td>
            </tr>
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

    <v-dialog
      v-model="formDialog"
      :fullscreen="mobile"
      max-width="620"
      :persistent="saving"
      scrollable
      transition="dialog-bottom-transition"
    >
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
                    :items="getFieldItems(field)"
                    item-title="title"
                    item-value="value"
                    :label="getFieldLabel(field)"
                    :return-object="false"
                    :rules="getFieldRules(field)"
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
                    :label="getFieldLabel(field)"
                    :return-object="false"
                    :rules="getFieldRules(field)"
                  />

                  <v-date-input
                    v-else-if="field.type === 'date'"
                    v-model="form[field.key]"
                    class="controlcash-field"
                    clearable
                    density="comfortable"
                    :label="getFieldLabel(field)"
                    prepend-icon=""
                    prepend-inner-icon="mdi-calendar-month-outline"
                    :rules="getFieldRules(field)"
                    variant="outlined"
                  />

                  <v-text-field
                    v-else
                    v-model="form[field.key]"
                    class="controlcash-field"
                    :label="getFieldLabel(field)"
                    :prefix="field.prefix"
                    :rules="getFieldRules(field)"
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

    <v-dialog
      v-model="deleteDialog"
      :fullscreen="mobile"
      max-width="420"
      transition="dialog-bottom-transition"
    >
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
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
  preparePayload: {
    type: Function,
    default: (payload) => payload,
  },
  createDefaults: {
    type: Object,
    default: () => ({}),
  },
  totals: {
    type: Object,
    default: null,
  },
  totalsLabel: {
    type: String,
    default: 'Total',
  },
  openCreateSignal: {
    type: [Number, String],
    default: '',
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
const hasTotals = computed(() => rows.value.length > 0 && props.totals && Object.keys(props.totals).length > 0)
const deleteItemLabel = computed(() => deletingItem.value?.name || deletingItem.value?.description || 'este registro')

function getRawItem(item) {
  return item?.raw || item
}

function getHeaderFields() {
  return props.headers.filter((header) => header.key !== 'actions')
}

function formatMobileValue(item, key) {
  const rawItem = getRawItem(item)
  const value = rawItem[key]

  if (key === 'isActive') {
    return value === false ? 'Inactivo' : 'Activo'
  }

  if (value === undefined || value === null || value === '') {
    return '-'
  }

  return value
}

function getMobileTitle(item) {
  const titleField = getHeaderFields()[0]

  return titleField ? formatMobileValue(item, titleField.key) : deleteItemLabel.value
}

function getMobileSubtitle(item) {
  const subtitleField = getHeaderFields()[1]

  return subtitleField ? formatMobileValue(item, subtitleField.key) : props.singularTitle
}

function getMobileDetailFields(item) {
  return getHeaderFields()
    .slice(2)
    .map((field) => ({
      key: field.key,
      title: field.title,
      value: formatMobileValue(item, field.key),
    }))
}

function getTotalCellValue(header, index) {
  if (header.key === 'actions') {
    return ''
  }

  if (props.totals && Object.prototype.hasOwnProperty.call(props.totals, header.key)) {
    return props.totals[header.key]
  }

  return index === 0 ? props.totalsLabel : ''
}

function shouldShowField(field) {
  return typeof field.showWhen === 'function' ? field.showWhen(form) : true
}

function getFieldLabel(field) {
  return typeof field.label === 'function' ? field.label(form) : field.label
}

function getFieldItems(field) {
  return typeof field.items === 'function' ? field.items(form, editingItem.value) : field.items || []
}

function getFieldRules(field) {
  return typeof field.rules === 'function' ? field.rules(form, editingItem.value) : field.rules || []
}

onMounted(() => {
  props.store.subscribeRealtime()
})

onBeforeUnmount(() => {
  props.store.stopRealtime()
})

watch(
  () => props.openCreateSignal,
  (signal) => {
    if (signal !== undefined && signal !== null && signal !== '') {
      openCreate()
    }
  },
  { immediate: true },
)

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
  resetForm(props.createDefaults)
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

  const rawPayload = props.fields.reduce((nextPayload, field) => {
    nextPayload[field.key] = getPayloadValue(field, form[field.key])
    return nextPayload
  }, {})
  const payload = props.preparePayload(rawPayload)

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

function getPayloadValue(field, value) {
  if (field.type !== 'date') {
    return value
  }

  return formatDateValue(value)
}

function formatDateValue(value) {
  if (!value) {
    return value
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return value
}
</script>

<style scoped>
.controlcash-alert-motion,
.controlcash-filter-motion {
  will-change: opacity, transform;
}

.controlcash-table :deep(tbody tr) {
  animation: controlcash-row-in 340ms var(--cc-ease-standard, ease) both;
}

.controlcash-table :deep(tbody tr:nth-child(2)) {
  animation-delay: 28ms;
}

.controlcash-table :deep(tbody tr:nth-child(3)) {
  animation-delay: 56ms;
}

.controlcash-table :deep(tbody tr:nth-child(4)) {
  animation-delay: 84ms;
}

.controlcash-table :deep(tbody tr:nth-child(5)) {
  animation-delay: 112ms;
}

.controlcash-table :deep(.controlcash-total-row td) {
  background: rgba(var(--v-theme-primary), 0.08);
  border-top: 1px solid rgba(var(--v-theme-primary), 0.22);
  font-weight: 700;
}

.controlcash-mobile-list {
  display: grid;
  gap: 12px;
}

.controlcash-mobile-record {
  padding: 14px !important;
}

.controlcash-mobile-record :deep(.v-list-item__append) {
  align-self: flex-start;
}

.controlcash-mobile-record-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.controlcash-mobile-record-field {
  background: rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 10px;
}

.controlcash-mobile-record-field span {
  color: rgba(var(--v-theme-on-surface), 0.66);
  font-size: 0.74rem;
}

.controlcash-mobile-record-field strong {
  font-size: 0.86rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

@keyframes controlcash-row-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  .controlcash-mobile-record-grid {
    grid-template-columns: 1fr;
  }
}
</style>
